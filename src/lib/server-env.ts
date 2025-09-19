import { z } from 'zod';

const serverEnvSchema = z.object({
  GEMINI_API_KEY: z.string().min(1, { message: 'GEMINI_API_KEY is required' }),
  HF_TOKEN: z.string().min(1, { message: 'HF_TOKEN is required' }),
});

export const serverEnv = serverEnvSchema.parse(process.env);
