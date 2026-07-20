'use server';
/**
 * @fileOverview A Genkit tool for checking URLs with a local ONNX
 * phishing-detection model (pirocheto/phishing-url-detection).
 *
 * This model is designed to run locally (not via a hosted inference
 * API) — it bundles its own TF-IDF vectorization inside the ONNX
 * graph, so raw URL strings can be fed directly into the session.
 *
 * onnxruntime-node is marked as a serverExternalPackage in
 * next.config.ts so Turbopack doesn't bundle/relocate it — that
 * relocation was breaking the native binary's relative-path lookup.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import * as ort from 'onnxruntime-node';
import fs from 'fs';
import path from 'path';

const HfUrlToolInputSchema = z.object({
  url: z.string().url().describe('The URL to classify.'),
});

const HfUrlToolOutputSchema = z.object({
  verdict: z.enum(['phishing', 'benign', 'suspicious']),
  confidence: z.number(),
});

type HfUrlToolOutput = z.infer<typeof HfUrlToolOutputSchema>;

const MODEL_DIR = path.join(process.cwd(), '.cache', 'models');
const MODEL_PATH = path.join(MODEL_DIR, 'phishing-url-detection.onnx');
const MODEL_URL =
  'https://huggingface.co/pirocheto/phishing-url-detection/resolve/main/model.onnx';

let sessionPromise: Promise<ort.InferenceSession> | null = null;

async function ensureModelDownloaded(): Promise<void> {
  if (fs.existsSync(MODEL_PATH)) return;
  fs.mkdirSync(MODEL_DIR, {recursive: true});

  const res = await fetch(MODEL_URL);
  if (!res.ok) {
    throw new Error(`Failed to download ONNX model: ${res.status}`);
  }
  const buffer = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(MODEL_PATH, buffer);
}

async function getSession(): Promise<ort.InferenceSession> {
  if (!sessionPromise) {
    sessionPromise = (async () => {
      await ensureModelDownloaded();
      return ort.InferenceSession.create(MODEL_PATH);
    })();
  }
  return sessionPromise;
}

export const hfUrlTool = ai.defineTool(
  {
    name: 'huggingFaceUrlCheck',
    description: 'Checks a URL for phishing using a local ONNX model.',
    inputSchema: HfUrlToolInputSchema,
    outputSchema: HfUrlToolOutputSchema,
  },
  async ({url}): Promise<HfUrlToolOutput> => {
    try {
      const session = await getSession();

      const inputName = session.inputNames[0];
      const tensor = new ort.Tensor('string', [url], [1]);
      const results = await session.run({[inputName]: tensor});

      // Model outputs: [0] = predicted label, [1] = class probabilities
      // (shape [1, 2]: [benign_prob, phishing_prob])
      const probOutputName =
        session.outputNames[1] ?? session.outputNames[session.outputNames.length - 1];
      const probData = results[probOutputName].data as Float32Array | number[];

      const phishingProb = Number(probData[1] ?? 0.5);

      const verdict: HfUrlToolOutput['verdict'] =
        phishingProb >= 0.6
          ? 'phishing'
          : phishingProb <= 0.3
            ? 'benign'
            : 'suspicious';

      return {
        verdict,
        confidence: Math.max(0.01, Math.min(0.99, phishingProb)),
      };
    } catch (e) {
      console.error('Local ONNX phishing model failed:', e);
      return {
        verdict: 'suspicious',
        confidence: 0,
      };
    }
  }
);