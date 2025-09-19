
export type LearningPathLevel = {
    level: number;
    name: string;
    title: string;
    description: string;
    resourceIds: string[];
    topic: string;
    path: string;
    maxArticles: number;
};

export const learningPath: LearningPathLevel[] = [
    {
        level: 1,
        name: "Cybersecurity Foundations",
        title: "Beginner",
        description: "Start your journey by learning the absolute basics of phishing and online security.",
        resourceIds: ["1", "4"], // Anatomy of a Phishing Email, How to Secure Your Accounts
        topic: "Cybersecurity basics for beginners",
        path: "beginner",
        maxArticles: 3,
    },
    {
        level: 2,
        name: "Common Threat Vectors",
        title: "Intermediate",
        description: "Learn to identify various types of attacks beyond simple emails.",
        resourceIds: ["2", "3"], // Video: Spotting a Fake Website, Social Engineering: The Human Element
        topic: "Common cyber attack methods",
        path: "intermediate",
        maxArticles: 5,
    },
    {
        level: 3,
        name: "Modern & Sophisticated Attacks",
        title: "Advanced",
        description: "Explore advanced attack methods and how to defend against them.",
        resourceIds: [], // This can be populated with IDs of AI-generated articles or more advanced static ones
        topic: "Advanced persistent threats and sophisticated cyber attacks",
        path: "advanced",
        maxArticles: 10,
    }
]
