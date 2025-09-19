'use server';
/**
 * @fileOverview A Genkit flow for generating educational articles on cybersecurity topics.
 *
 * - generateLearningArticle - A function that generates an article title, description, and image hint.
 * - GenerateLearningArticleInput - The input type for the generateLearningArticle function.
 * - GenerateLearningArticleOutput - The return type for the generateLearningArticle function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateLearningArticleInputSchema = z.object({
  topic: z.string().describe('The cybersecurity topic for the article.'),
});
export type GenerateLearningArticleInput = z.infer<typeof GenerateLearningArticleInputSchema>;

const GenerateLearningArticleOutputSchema = z.object({
  title: z.string().describe('A short, engaging title for an article about the topic. Should be 10 words or less.'),
  description: z.string().describe('A one-sentence description for the article, compelling and easy for a general audience to understand.'),
  imageHint: z.string().describe('Two keywords for an AI image generator to create a header image for the article.'),
});
export type GenerateLearningArticleOutput = z.infer<typeof GenerateLearningArticleOutputSchema>;

export async function generateLearningArticle(input: GenerateLearningArticleInput): Promise<GenerateLearningArticleOutput> {
  return generateLearningArticleFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateLearningArticlePrompt',
  input: {schema: GenerateLearningArticleInputSchema},
  output: {schema: GenerateLearningArticleOutputSchema},
  prompt: `You are an expert in cybersecurity and a skilled content creator with access to the most current information.
  
  Your task is to generate a short, engaging title, a one-sentence description, and two image keywords for an educational article about the following topic: {{{topic}}}.
  
  The title and description should be compelling and easy for a general audience to understand, reflecting the most recent trends and information related to the topic.
  The title should be 10 words or less.
  The image keywords should be two words, separated by a space, that are relevant to the article title.
  
  Return strict JSON.`,
});


const generateLearningArticleFlow = ai.defineFlow(
  {
    name: 'generateLearningArticleFlow',
    inputSchema: GenerateLearningArticleInputSchema,
    outputSchema: GenerateLearningArticleOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
