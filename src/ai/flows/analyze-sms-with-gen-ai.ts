
'use server';
/**
 * @fileOverview Analyzes an SMS message for phishing attempts (smishing).
 *
 * - analyzeSmsWithGenAi - A function that analyzes SMS content.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeSmsInputSchema = z.object({
  smsContent: z.string().describe('The content of the SMS message.'),
});

const AnalyzeSmsOutputSchema = z.object({
  verdict: z.enum(['phishing', 'benign', 'suspicious']),
  confidence: z.number(),
  signals: z.array(z.string()),
});

const smsPrompt = ai.definePrompt({
  name: 'smsPrompt',
  input: { schema: z.object({ smsContent: z.string() }) },
  output: { schema: AnalyzeSmsOutputSchema },
  prompt: `
You are a cybersecurity expert specializing in SMS phishing (smishing). Your task is to determine if the provided SMS message is 'phishing', 'benign', or 'suspicious'.

Analyze the following SMS content. Pay close attention to:
- **Urgency:** "Immediate action required," "account locked," etc.
- **Suspicious Links:** Bit.ly, TinyURL, or other shorteners, or domains that don't match the supposed sender.
- **Unexpected Requests:** Requests for personal info, login details, or to call a number.
- **Generic Greetings:** Lack of personalization.
- **Lottery/Prize Scams:** "You've won," "claim your prize," etc.

Synthesize your findings to provide a final 'verdict', a 'confidence' score (0.0 to 1.0), and a list of the top 'signals' that justify your decision.

Return strict JSON.
SMS Content:
{{{smsContent}}}
`,
});

const analyzeSmsFlow = ai.defineFlow(
  {
    name: 'analyzeSmsFlow',
    inputSchema: AnalyzeSmsInputSchema,
    outputSchema: AnalyzeSmsOutputSchema,
  },
  async ({smsContent}) => {
    const result = await smsPrompt({smsContent});
    if (!result.output) {
      throw new Error('AI analysis failed to produce a result.');
    }
    return result.output;
  }
);

export async function analyzeSmsWithGenAi(
  args: z.infer<typeof AnalyzeSmsInputSchema>
): Promise<z.infer<typeof AnalyzeSmsOutputSchema>> {
  return analyzeSmsFlow(args);
}
