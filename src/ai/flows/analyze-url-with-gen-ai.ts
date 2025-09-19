
'use server';
/**
 * @fileOverview Analyzes a URL using GenAI and Hugging Face to determine if it is a phishing attempt.
 *
 * - analyzeUrlWithGenAi - A function that analyzes a URL using multiple AI providers.
 * - AnalyzeUrlWithGenAiOutput - The return type for the analyzeUrlWithGenAi function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {hfUrlTool} from '../tools/hf-url-tool';
import { AnalyzeUrlWithGenAiOutput, AnalyzeUrlWithGenAiOutputSchema } from '@/lib/types';
import { communityDbTool } from '../tools/community-db-tool';

const AnalyzeUrlInputSchema = z.object({
  url: z.string().url().describe('The URL to analyze.'),
});

const geminiUrlPrompt = ai.definePrompt({
  name: 'geminiUrlPrompt',
  tools: [hfUrlTool, communityDbTool],
  input: { schema: z.object({ url: z.string().url() }) },
  output: {
    schema: z.object({
      verdict: z.enum(['phishing', 'benign', 'suspicious']),
      confidence: z.number(),
      signals: z.array(z.string()),
    }),
  },
  prompt: `
You are a phishing URL expert. Your primary goal is to determine if a given URL is 'phishing', 'benign', or 'suspicious'.

1.  **First, use the \`communityDatabaseCheck\` tool.** If the URL is found in the community database with a 'Verified' status, you can be highly confident in that verdict. Note this in your signals.
2.  If the URL is not in the community database or its status is 'Pending', proceed with your own analysis.
3.  **Use the \`huggingFaceUrlCheck\` tool** as a secondary source of information.
4.  **Perform your own detailed analysis.** Pay close attention to all parts of the URL: the protocol (HTTPS is safer), subdomains, the top-level domain (TLD), and the path/slug. Look for common tricks like brand impersonation, suspicious keywords (like 'login' or 'verify'), or unusual TLDs.
5.  **Synthesize all information** (community report, tool results, and your own analysis) to provide a final 'verdict', a 'confidence' score (0.0 to 1.0), and a brief list of the top 3-4 'signals' that justify your decision.

Return strict JSON.
URL: {{{url}}}
`,
});

const analyzeUrlFlow = ai.defineFlow(
  {
    name: 'analyzeUrlFlow',
    inputSchema: AnalyzeUrlInputSchema,
    outputSchema: AnalyzeUrlWithGenAiOutputSchema,
  },
  async ({url}) => {
    const geminiResult = await geminiUrlPrompt({url});

    if (!geminiResult.output) {
      throw new Error('AI analysis failed to produce a result.');
    }

    return {
      verdict: geminiResult.output.verdict,
      confidence: Number(geminiResult.output.confidence.toFixed(2)),
      signals: geminiResult.output.signals ?? [],
    };
  }
);


export async function analyzeUrlWithGenAi(
  args: z.infer<typeof AnalyzeUrlInputSchema>
): Promise<AnalyzeUrlWithGenAiOutput> {
  return analyzeUrlFlow(args);
}
