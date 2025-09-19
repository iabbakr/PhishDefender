
"use server";

import { generateLearningArticle } from "@/ai/flows/generate-learning-article";
import { generateArticleBody } from "@/ai/flows/generate-article-body";
import type { EducationResource } from "@/lib/types";

export async function generateLearningArticleAction(topic: string): Promise<Pick<EducationResource, 'title' | 'description' | 'imageHint' | 'content'> | { error: string }> {
    try {
        const articleInfo = await generateLearningArticle({ topic });
        const articleBody = await generateArticleBody({ title: articleInfo.title });
        
        return {
            title: articleInfo.title,
            description: articleInfo.description,
            imageHint: articleInfo.imageHint,
            content: articleBody.content,
        };
    } catch (error) {
        console.error("Error generating learning article:", error);
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        return { error: "Failed to generate a new learning article. Please try again. Error: " + errorMessage };
    }
}
