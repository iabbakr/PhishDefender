import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

export const ai = genkit({
  plugins: [googleAI()],
  // gemini-flash-latest now resolves to Gemini 3.5 Flash (GA)
  model: googleAI.model('gemini-flash-latest'),
});