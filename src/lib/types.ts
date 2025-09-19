import { z } from "zod";

export type EducationResource = {
  id: string;
  type: 'Article' | 'Video';
  title: string;
  description: string;
  image: string;
  duration?: string;
  link: string;
  imageHint: string;
  content?: string; // Add content field
  createdAt?: any;
  path?: string; // Add path field
  uid?: string; // Add uid for user-specific articles
};

export type CommunitySubmission = {
  id:string;
  type: 'URL' | 'Email' | 'SMS';
  content: string;
  comments?: string;
  reportedBy: string;
  date: string;
  riskLevel: 'High' | 'Medium';
  status: 'Verified' | 'Pending';
};


export const AnalyzeUrlWithGenAiOutputSchema = z.object({
  verdict: z.enum(['phishing', 'benign', 'suspicious']).describe('The final verdict on the URL.'),
  confidence: z.number().describe('The confidence score of the verdict, from 0 to 1.'),
  signals: z.array(z.string()).optional().describe('The signals that led to the verdict.'),
  raw: z.any().optional().describe('Raw output from the AI models for debugging.').optional(),
});
export type AnalyzeUrlWithGenAiOutput = z.infer<typeof AnalyzeUrlWithGenAiOutputSchema>;
