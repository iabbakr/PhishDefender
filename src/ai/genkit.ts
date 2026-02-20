import {genkit} from 'genkit';
import {googleAI, gemini15Flash} from '@genkit-ai/googleai'; // 1. Import the stable model

export const ai = genkit({
  plugins: [googleAI()],
  // 2. Change 'googleai/gemini-2.0-flash' to gemini15Flash
  model: gemini15Flash, 
});