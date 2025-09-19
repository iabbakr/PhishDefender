
"use server";

import { analyzeUrlWithGenAi } from "@/ai/flows/analyze-url-with-gen-ai";
import { analyzeEmailWithGenAi } from "@/ai/flows/analyze-email-with-gen-ai";
import { analyzeSmsWithGenAi } from "@/ai/flows/analyze-sms-with-gen-ai";

import { type AnalyzeUrlWithGenAiOutput } from "@/lib/types";
import { z } from "zod";

// URL Analysis
const urlSchema = z.object({
  url: z.string().url({ message: "This is not a valid URL." }),
});

export type UrlFormState = {
  error?: string;
  data?: AnalyzeUrlWithGenAiOutput & { url: string };
};

export async function resolveUrl(url: string): Promise<{ finalUrl?: string; error?: string }> {
  let urlString = url.trim();
  if (urlString && !/^https?:\/\//i.test(urlString)) {
    urlString = 'https://' + urlString; // Default to HTTPS for resolution
  }

  try {
    const response = await fetch(urlString, { method: 'HEAD', redirect: 'follow' });
    return { finalUrl: response.url };
  } catch (e) {
      // If HTTPS fails, try HTTP as a fallback
      try {
        const httpUrl = 'http://' + url.replace(/^https?:\/\//, '');
        const response = await fetch(httpUrl, { method: 'HEAD', redirect: 'follow' });
        return { finalUrl: response.url };
      }
      catch (httpError) {
        console.error("URL resolution error:", e);
        return { error: "Could not resolve the provided URL. It may be offline or invalid." };
      }
  }
}

export async function analyzeUrlAction(prevState: UrlFormState, formData: FormData): Promise<UrlFormState> {
  const urlToValidate = formData.get("url");

  if (typeof urlToValidate !== 'string' || !urlToValidate) {
    return { error: "URL is required." };
  }

  const resolution = await resolveUrl(urlToValidate);
  if (resolution.error) {
    return { error: resolution.error };
  }

  const finalUrl = resolution.finalUrl!;

  const validatedFields = urlSchema.safeParse({
    url: finalUrl,
  });

  if (!validatedFields.success) {
    return {
      error: "The resolved URL is not valid.",
    };
  }

  try {
    const result = await analyzeUrlWithGenAi({ url: validatedFields.data.url });
    return { data: { ...result, url: validatedFields.data.url } };
  } catch (e) {
    console.error(e);
    const errorMessage = e instanceof Error ? e.message : "An unknown error occurred.";
    return {
      error: "An error occurred during analysis. Please try again. Error: " + errorMessage,
    };
  }
}

// Email Analysis
const emailSchema = z.object({
    emailContent: z.string().min(10, { message: "Email content is too short." }),
});

export type EmailFormState = {
    error?: string;
    data?: Awaited<ReturnType<typeof analyzeEmailWithGenAi>>;
}

export async function analyzeEmailAction(prevState: EmailFormState, formData: FormData): Promise<EmailFormState> {
    const emailContent = formData.get("emailContent");

    const validatedFields = emailSchema.safeParse({
        emailContent,
    });
    
    if (!validatedFields.success) {
        return { error: validatedFields.error.flatten().fieldErrors.emailContent?.[0] };
    }

    try {
        const result = await analyzeEmailWithGenAi({ emailContent: validatedFields.data.emailContent });
        return { data: result };
    } catch (e) {
        console.error(e);
        const errorMessage = e instanceof Error ? e.message : "An unknown error occurred.";
        return { error: "An error occurred during email analysis. Please try again. Error: " + errorMessage };
    }
}


// SMS Analysis
const smsSchema = z.object({
    smsContent: z.string().min(5, { message: "SMS content is too short." }),
});

export type SmsFormState = {
    error?: string;
    data?: Awaited<ReturnType<typeof analyzeSmsWithGenAi>>;
}

export async function analyzeSmsAction(prevState: SmsFormState, formData: FormData): Promise<SmsFormState> {
    const smsContent = formData.get("smsContent");

    const validatedFields = smsSchema.safeParse({
        smsContent,
    });
    
    if (!validatedFields.success) {
        return { error: validatedFields.error.flatten().fieldErrors.smsContent?.[0] };
    }

    try {
        const result = await analyzeSmsWithGenAi({ smsContent: validatedFields.data.smsContent });
        return { data: result };
    } catch (e) {
        console.error(e);
        const errorMessage = e instanceof Error ? e.message : "An unknown error occurred.";
        return { error: "An error occurred during SMS analysis. Please try again. Error: " + errorMessage };
    }
}
