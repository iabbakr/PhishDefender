
'use server';
/**
 * @fileOverview Analyzes an email for phishing attempts.
 *
 * - analyzeEmailWithGenAi - A function that analyzes email content.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeEmailInputSchema = z.object({
  emailContent: z.string().describe('The full raw content of the email, including headers.'),
});

const AnalyzeEmailOutputSchema = z.object({
  verdict: z.enum(['phishing', 'benign', 'suspicious']),
  confidence: z.number(),
  signals: z.array(z.string()),
});

const emailPrompt = ai.definePrompt({
  name: 'emailPrompt',
  input: { schema: z.object({ emailContent: z.string() }) },
  output: { schema: AnalyzeEmailOutputSchema },
  prompt: `
You are a cybersecurity expert specializing in email analysis. Your task is to determine if the provided email is 'phishing', 'benign', or 'suspicious'.

Analyze the following email content, including headers. Pay close attention to:
- **Sender Details:** 'From' address, 'Return-Path', SPF/DKIM/DMARC records.
- **Urgency & Threats:** Language that creates panic or pressure.
- **Links & Attachments:** Suspicious URLs, mismatched link text, and unexpected attachments.
- **Grammar & Tone:** Unprofessional language, spelling errors.
- **Content:** Requests for credentials, financial information, or personal data.

Synthesize your findings to provide a final 'verdict', a 'confidence' score (0.0 to 1.0), and a list of the top 'signals' that justify your decision.

Return strict JSON.
Email Content:
{{{emailContent}}}
`,
});

const analyzeEmailFlow = ai.defineFlow(
  {
    name: 'analyzeEmailFlow',
    inputSchema: AnalyzeEmailInputSchema,
    outputSchema: AnalyzeEmailOutputSchema,
  },
  async ({emailContent}) => {
    const result = await emailPrompt({emailContent});
    if (!result.output) {
      throw new Error('AI analysis failed to produce a result.');
    }
    return result.output;
  }
);

export async function analyzeEmailWithGenAi(
  args: z.infer<typeof AnalyzeEmailInputSchema>
): Promise<z.infer<typeof AnalyzeEmailOutputSchema>> {
  return analyzeEmailFlow(args);
}
