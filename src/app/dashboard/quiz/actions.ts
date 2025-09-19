
"use server";

import { generateQuizQuestions } from "@/ai/flows/generate-quiz-questions";
import { z } from "zod";

const FALLBACK_QUESTIONS = [
    {
      question: "Which of the following is a common sign of a phishing email?",
      options: [
        "A personalized greeting with your name",
        "An email from a known contact",
        "A sense of urgency requiring immediate action",
        "A link to the company's official website"
      ],
      correctAnswer: "A sense of urgency requiring immediate action",
      rationale: "Phishing emails often create a sense of urgency to pressure you into acting without thinking."
    },
    {
      question: "What is 'smishing'?",
      options: [
          "A type of phishing that uses email",
          "A type of phishing that uses text messages",
          "A type of phishing that uses voice calls",
          "A type of phishing that targets executives"
      ],
      correctAnswer: "A type of phishing that uses text messages",
      rationale: "Smishing is a form of phishing that uses SMS (text messages) to deceive victims."
    },
    {
      question: "If you receive an email from 'support@microsft.com', what should you do?",
      options: [
          "Click the link to verify your account",
          "Reply with your password",
          "Recognize it as a potential phishing attempt",
          "Forward it to all your contacts"
      ],
      correctAnswer: "Recognize it as a potential phishing attempt",
      rationale: "The domain 'microsft.com' is a misspelling of 'microsoft.com' and is a classic phishing red flag."
    },
    {
      question: "What is the best way to verify a suspicious link in an email?",
      options: [
          "Click on it to see where it goes",
          "Hover your mouse over it to see the actual URL",
          "Copy and paste it into a new tab",
          "Delete the email immediately"
      ],
      correctAnswer: "Hover your mouse over it to see the actual URL",
      rationale: "Hovering over a link (without clicking!) reveals the true destination URL, which can help you spot fakes."
    },
    {
        question: "What does MFA stand for in the context of cybersecurity?",
        options: [
            "Multi-Factor Authentication",
            "Malware-Free Application",
            "My First Account",
            "Maximum File Allocation"
        ],
        correctAnswer: "Multi-Factor Authentication",
        rationale: "Multi-Factor Authentication (MFA) adds a crucial extra layer of security to your accounts beyond just a password."
    }
];

const generateQuizSchema = z.object({
    topic: z.string(),
    difficulty: z.enum(['Easy', 'Medium', 'Hard']),
});

export async function generateQuizAction(prevState: any, formData: FormData) {
    const validatedFields = generateQuizSchema.safeParse({
        topic: formData.get("topic"),
        difficulty: formData.get("difficulty"),
    });

    if (!validatedFields.success) {
        return { error: "Invalid topic or difficulty." };
    }

    try {
        const quiz = await generateQuizQuestions({
             topic: validatedFields.data.topic, 
             difficulty: validatedFields.data.difficulty, 
             numberOfQuestions: 5 
        });
        return { questions: quiz.questions, topic: validatedFields.data.topic };
    } catch (e) {
        console.error("Failed to generate quiz from AI, using fallback.", e);
        // The AI call failed, so we return the hardcoded questions.
        return { questions: FALLBACK_QUESTIONS, topic: validatedFields.data.topic };
    }
}
