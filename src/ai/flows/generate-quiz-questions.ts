'use server';

/**
 * @fileOverview AI-powered quiz question generator from articles.
 *
 * - generateQuizQuestions - A function that generates quiz questions from article content.
 * - GenerateQuizQuestionsInput - The input type for the generateQuizQuestions function.
 * - GenerateQuizQuestionsOutput - The return type for the generateQuizQuestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateQuizQuestionsInputSchema = z.object({
  topic: z.string().describe('The topic to generate quiz questions for.'),
  difficulty: z
    .enum(['Easy', 'Medium', 'Hard'])
    .default('Easy')
    .describe('The difficulty level of the questions.'),
  numberOfQuestions: z
    .number()
    .default(5)
    .describe('The number of multiple choice questions to generate.'),
});
export type GenerateQuizQuestionsInput = z.infer<typeof GenerateQuizQuestionsInputSchema>;

const GenerateQuizQuestionsOutputSchema = z.object({
  questions: z.array(
    z.object({
      question: z.string().describe('The quiz question.'),
      options: z
        .array(z.string())
        .min(4)
        .max(4)
        .describe('Exactly 4 multiple choice options for the question.'),
      correctAnswer: z.string().describe('The correct answer to the question.'),
      rationale: z
        .string()
        .describe('A brief explanation of why the correct answer is right.'),
    })
  ),
});
export type GenerateQuizQuestionsOutput = z.infer<typeof GenerateQuizQuestionsOutputSchema>;

export async function generateQuizQuestions(
  input: GenerateQuizQuestionsInput
): Promise<GenerateQuizQuestionsOutput> {
  return generateQuizQuestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateQuizQuestionsPrompt',
  input: {schema: GenerateQuizQuestionsInputSchema},
  output: {schema: GenerateQuizQuestionsOutputSchema},
  prompt: `You are an expert in creating educational quizzes about cybersecurity.

  Your task is to generate a set of multiple-choice questions based on a given topic and difficulty level.

  Topic: {{{topic}}}
  Difficulty: {{{difficulty}}}
  Number of Questions: {{{numberOfQuestions}}}

  Instructions:
  1.  Generate exactly {{{numberOfQuestions}}} multiple-choice questions.
  2.  Each question must have exactly 4 options.
  3.  One of the options MUST be the correct answer, and the 'correctAnswer' field must match one of the options exactly.
  4.  Provide a concise 'rationale' for each question, explaining why the correct answer is right. This helps the user learn.
  5.  Tailor the complexity of the questions and the subtlety of the incorrect options to the requested difficulty level.
      - 'Easy': Focus on fundamental concepts and clear-cut scenarios.
      - 'Medium': Introduce more nuanced situations or technical terms.
      - 'Hard': Involve complex scenarios, subtle distinctions, or require multi-step reasoning.

  Return the output in strict JSON format.
  `,
});

const generateQuizQuestionsFlow = ai.defineFlow(
  {
    name: 'generateQuizQuestionsFlow',
    inputSchema: GenerateQuizQuestionsInputSchema,
    outputSchema: GenerateQuizQuestionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
