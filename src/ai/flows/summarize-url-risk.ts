'use server';
/**
 * @fileOverview Summarizes the risk associated with a URL and provides an explanation.
 *
 * - summarizeUrlRisk - A function that summarizes the risk of a URL.
 * - SummarizeUrlRiskInput - The input type for the summarizeUrlRisk function.
 * - SummarizeUrlRiskOutput - The return type for the summarizeUrlRisk function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeUrlRiskInputSchema = z.object({
  url: z.string().url().describe('The URL to analyze for risk.'),
  riskLevel: z.enum(['low', 'medium', 'high']).describe('The risk level associated with the URL.'),
  analysisDetails: z.string().describe('Detailed analysis of the URL, explaining why it is flagged as risky.'),
});
export type SummarizeUrlRiskInput = z.infer<typeof SummarizeUrlRiskInputSchema>;

const SummarizeUrlRiskOutputSchema = z.object({
  summary: z.string().describe('A summarized explanation of why the URL is flagged as risky.'),
});
export type SummarizeUrlRiskOutput = z.infer<typeof SummarizeUrlRiskOutputSchema>;

export async function summarizeUrlRisk(input: SummarizeUrlRiskInput): Promise<SummarizeUrlRiskOutput> {
  return summarizeUrlRiskFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeUrlRiskPrompt',
  input: {schema: SummarizeUrlRiskInputSchema},
  output: {schema: SummarizeUrlRiskOutputSchema},
  prompt: `You are an AI assistant that summarizes security risks associated with URLs.

You are given a URL, its risk level, and detailed analysis explaining why it is risky.
Your task is to create a concise and easy-to-understand summary of the risks for an average user.

URL: {{{url}}}
Risk Level: {{{riskLevel}}}
Analysis Details: {{{analysisDetails}}}

Summary:`,
});

const summarizeUrlRiskFlow = ai.defineFlow(
  {
    name: 'summarizeUrlRiskFlow',
    inputSchema: SummarizeUrlRiskInputSchema,
    outputSchema: SummarizeUrlRiskOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
