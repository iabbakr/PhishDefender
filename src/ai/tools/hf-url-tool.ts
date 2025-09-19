
'use server';
/**
 * @fileOverview A Genkit tool for checking URLs with a Hugging Face model.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { HfInference } from '@huggingface/inference';
import {serverEnv} from '@/lib/server-env';

const HfUrlToolInputSchema = z.object({
  url: z.string().url().describe('The URL to classify.'),
});

const HfUrlToolOutputSchema = z.object({
  verdict: z.enum(['phishing', 'benign', 'suspicious']),
  confidence: z.number(),
});

type HfUrlToolOutput = z.infer<typeof HfUrlToolOutputSchema>;

export const hfUrlTool = ai.defineTool(
  {
    name: 'huggingFaceUrlCheck',
    description: 'Checks a URL for phishing using a Hugging Face model.',
    inputSchema: HfUrlToolInputSchema,
    outputSchema: HfUrlToolOutputSchema,
  },
  async ({url}): Promise<HfUrlToolOutput> => {
    if (!serverEnv.HF_TOKEN) {
      console.warn('Missing HF_TOKEN, skipping Hugging Face check.');
      // Return a neutral/suspicious verdict if the token is missing.
      return {
        verdict: 'suspicious',
        confidence: 0,
      };
    }
    const client = new HfInference(serverEnv.HF_TOKEN);

    // Model outputs vary; normalize below
    const out = await client.textClassification({
      model: 'pirocheto/phishing-url-detection',
      inputs: url,
    });
    // Expect: [{label: 'phishing'|'benign', score: number}, ...]
    const best = Array.isArray(out)
      ? out[0]
      : Array.isArray((out as any)?.[0])
        ? (out as any)[0][0]
        : out;
    const label = (best?.label ?? '').toLowerCase();
    const score = Number(best?.score ?? 0.5);

    const verdict: HfUrlToolOutput['verdict'] = (label.includes('phish')
      ? 'phishing'
      : label.includes('benign')
        ? 'benign'
        : 'suspicious');

    return {
      verdict,
      confidence: Math.max(0.01, Math.min(0.99, score)),
    };
  }
);
