'use server';
/**
 * @fileOverview A Genkit flow for generating the body of a cybersecurity article.
 *
 * - generateArticleBody - Generates the full content for an article based on a title.
 * - GenerateArticleBodyInput - The input type for the generateArticleBody function.
 * - GenerateArticleBodyOutput - The return type for the generateArticleBody function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateArticleBodyInputSchema = z.object({
  title: z.string().describe('The title of the article to generate content for.'),
});
export type GenerateArticleBodyInput = z.infer<typeof GenerateArticleBodyInputSchema>;

const GenerateArticleBodyOutputSchema = z.object({
  content: z.string().describe('The full article content in Markdown format. It should have a few paragraphs and be easy to read.'),
});
export type GenerateArticleBodyOutput = z.infer<typeof GenerateArticleBodyOutputSchema>;

export async function generateArticleBody(input: GenerateArticleBodyInput): Promise<GenerateArticleBodyOutput> {
  return generateArticleBodyFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateArticleBodyPrompt',
  input: {schema: GenerateArticleBodyInputSchema},
  output: {schema: GenerateArticleBodyOutputSchema},
  prompt: `You are an expert in cybersecurity and a skilled content creator with access to the most current information.
  
  Generate a full, well-structured article in Markdown format based on the following title: "{{{title}}}".
  
  The article must be educational, easy for a general audience to understand, and at least 3-4 paragraphs long.
  It is crucial that you use your most up-to-date knowledge to ensure the information reflects the latest cybersecurity threats, defense mechanisms, and best practices.
  Use Markdown for formatting, such as headers for sections (e.g., ## Section Title) and lists where appropriate.
  
  Return strict JSON.`,
});


const generateArticleBodyFlow = ai.defineFlow(
  {
    name: 'generateArticleBodyFlow',
    inputSchema: GenerateArticleBodyInputSchema,
    outputSchema: GenerateArticleBodyOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
