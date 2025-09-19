# PhishDefender: AI-Powered Phishing Detector & User Education Platform

PhishDefender is a comprehensive, full-stack web application designed to combat phishing threats through advanced AI analysis and empower users with a dynamic, gamified educational dashboard. The platform provides real-time threat intelligence on URLs, emails, and SMS messages while guiding users through a structured learning path to improve their cybersecurity awareness.

### Key Features

*   **Multi-Vector Threat Analysis**: AI-powered detection for phishing URLs, suspicious emails (smishing), and malicious SMS messages.
*   **Interactive Learning Hub**: A guided, multi-level learning path with articles generated on-demand by AI to cover emerging cybersecurity topics.
*   **Gamified Knowledge Quizzes**: AI-generated quizzes on various security topics, with a progression system that unlocks new challenges as users demonstrate mastery.
*   **Community-Driven Threat Intelligence**: Users can submit potential threats, which are added to a searchable, community-vetted database of malicious content.
*   **Personalized User Dashboard**: Tracks user progress, including quiz scores and community contributions, and assigns a "Community Rank" to incentivize engagement.
*   **Secure Authentication & Admin Panel**: Robust email/password and Google OAuth authentication, with a protected admin panel for managing user roles.
*   **Real-Time Website Previews**: A secure, server-side proxy generates screenshots of submitted URLs to give users a safe visual preview before analysis.

### Technical Stack

*   **Framework**: Next.js (App Router, Server Components, Server Actions)
*   **Language**: TypeScript
*   **Generative AI**: Google's Gemini family of models via Genkit for flows, tool use, and content generation.
*   **UI**: ShadCN UI Components, Tailwind CSS for styling, Recharts for data visualization.
*   **Database**: Firebase Firestore for user data, learning resources, and community threat submissions.
*   **Authentication**: Firebase Authentication (Email/Password & Google OAuth).
*   **Deployment**: Firebase App Hosting

### AI Integration Details

*   **Genkit Flows**: The application's backend AI logic is built using Genkit, which orchestrates calls to Google's Gemini models for various tasks.
*   **Structured Output**: Zod schemas are used to define the expected JSON output from the AI, ensuring reliable data for features like threat analysis verdicts, quiz question generation, and article creation.
*   **Multi-Modal Analysis**: The URL analyzer combines results from a custom Gemini prompt, a Hugging Face model, and a community database lookup by defining these as "tools" for the AI to use in its reasoning process.
*   **Dynamic Content Generation**: The Learning Hub and Knowledge Quiz features are powered by Genkit flows that call Gemini to generate educational articles and multiple-choice questions on any given cybersecurity topic.

### Key Accomplishments & Resume Bullet Points

*   **Full-Stack Development**: Architected and built a complete, full-stack application using Next.js, React, and TypeScript, employing modern features like the App Router, Server Components, and Server Actions for optimal performance and developer experience.
*   **Advanced AI Integration**: Implemented a sophisticated, multi-tool AI agent using Genkit and Google's Gemini models to perform complex threat analysis, synthesizing data from multiple sources (LLM analysis, external ML models, database lookups) to deliver a confident verdict.
*   **Dynamic & Gamified UX**: Designed and developed an engaging user experience that encourages learning and participation through a gamified quiz system with progression, a personalized dashboard with community ranks, and a dynamic learning hub.
*   **Secure & Scalable Backend**: Built a secure backend using Firebase for authentication and data storage, with a protected admin panel for role management. Implemented server-side proxies to safely handle external API interactions, such as generating website screenshots.
