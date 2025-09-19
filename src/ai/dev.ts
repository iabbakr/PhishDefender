
import { config } from 'dotenv';
config();

import '@/ai/flows/summarize-url-risk.ts';
import '@/ai/flows/generate-quiz-questions.ts';
import '@/ai/flows/analyze-url-with-gen-ai.ts';
import '@/ai/flows/analyze-email-with-gen-ai.ts';
import '@/ai/flows/analyze-sms-with-gen-ai.ts';
import '@/ai/flows/generate-learning-article.ts';
import '@/ai/flows/generate-article-body.ts';
import '@/ai/tools/hf-url-tool.ts';
import '@/ai/tools/community-db-tool.ts';
import '@/ai/tools/admin-tool.ts';
