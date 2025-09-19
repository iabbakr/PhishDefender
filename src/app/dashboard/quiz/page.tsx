'use client';

import { useState, useEffect } from "react";
import { QuizClient } from "@/components/quiz-client";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, BrainCircuit, Loader2, SmartphoneNfc, ShieldAlert, BotMessageSquare, Lock, KeyRound, Wifi, FileLock, Users, Network, QrCode, ShieldQuestion, Bug, Briefcase, Puzzle, Scale, Building, Fingerprint } from "lucide-react";
import { useActionState } from "react";
import { generateQuizAction } from "./actions";
import { useAuth } from "@/hooks/use-auth";
import { db } from "@/lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";
import { cn } from "@/lib/utils";

type Question = {
  question: string;
  options: string[];
  correctAnswer: string;
  rationale?: string;
};

type QuizState =
  | { error: string; questions?: undefined; topic?: undefined }
  | { questions: Question[]; topic: string; error?: undefined };
  
const initialQuizState: QuizState = {
  questions: [],
  topic: "",
};


type QuizTopic = {
    topic: string;
    title: string;
    description: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    icon: React.ReactNode;
}

const quizTopics: QuizTopic[] = [
    {
        topic: "General Phishing Knowledge",
        title: "Phishing Fundamentals",
        description: "Test your basic knowledge of common phishing threats.",
        difficulty: "Easy",
        icon: <ShieldQuestion className="h-10 w-10 text-primary" />
    },
    {
        topic: "Password Security Basics",
        title: "Password Security",
        description: "Learn the dos and don'ts of creating strong passwords.",
        difficulty: "Easy",
        icon: <KeyRound className="h-10 w-10 text-primary" />
    },
    {
        topic: "Social Engineering 101",
        title: "Social Engineering",
        description: "Recognize psychological manipulation tactics used by attackers.",
        difficulty: "Easy",
        icon: <Users className="h-10 w-10 text-primary" />
    },
    {
        topic: "Public Wi-Fi Safety",
        title: "Public Wi-Fi Safety",
        description: "Understand the risks of using public Wi-Fi networks.",
        difficulty: "Easy",
        icon: <Wifi className="h-10 w-10 text-primary" />
    },
    {
        topic: "Smishing and Vishing",
        title: "Smishing & Vishing",
        description: "Learn about phishing attacks via SMS and voice calls.",
        difficulty: "Medium",
        icon: <SmartphoneNfc className="h-10 w-10 text-primary" />
    },
    {
        topic: "Malware Recognition",
        title: "Malware Recognition",
        description: "Identify different types of malicious software.",
        difficulty: "Medium",
        icon: <Bug className="h-10 w-10 text-primary" />
    },
    {
        topic: "Secure Data Handling",
        title: "Secure Data Handling",
        description: "Best practices for managing and protecting sensitive files.",
        difficulty: "Medium",
        icon: <FileLock className="h-10 w-10 text-primary" />
    },
    {
        topic: "Advanced Email Scams",
        title: "Advanced Email Scams",
        description: "Dive into sophisticated email threats like BEC.",
        difficulty: "Medium",
        icon: <ShieldAlert className="h-10 w-10 text-primary" />
    },
    {
        topic: "QR Code Security",
        title: "QR Code Security",
        description: "Understand the dangers of malicious QR codes.",
        difficulty: "Medium",
        icon: <QrCode className="h-10 w-10 text-primary" />
    },
    {
        topic: "Network Security Basics",
        title: "Network Security",
        description: "Learn about firewalls, VPNs, and secure network configs.",
        difficulty: "Hard",
        icon: <Network className="h-10 w-10 text-primary" />
    },
    {
        topic: "AI-Powered Phishing Threats",
        title: "AI-Powered Threats",
        description: "Explore the new age of AI-driven phishing attacks.",
        difficulty: "Hard",
        icon: <BotMessageSquare className="h-10 w-10 text-primary" />
    },
    {
        topic: "Business Email Compromise (BEC)",
        title: "BEC Attacks",
        description: "Deep dive into targeted attacks on corporate emails.",
        difficulty: "Hard",
        icon: <Briefcase className="h-10 w-10 text-primary" />
    },
     {
        topic: "Ransomware Attack Vectors",
        title: "Ransomware Vectors",
        description: "Identify how ransomware infects systems and how to prevent it.",
        difficulty: "Hard",
        icon: <Lock className="h-10 w-10 text-primary" />
    },
    {
        topic: "Biometric Security",
        title: "Biometric Security",
        description: "Assess the strengths and weaknesses of biometric authentication.",
        difficulty: "Hard",
        icon: <Fingerprint className="h-10 w-10 text-primary" />
    },
    {
        topic: "Supply Chain Attacks",
        title: "Supply Chain Attacks",
        description: "Learn how attackers compromise trusted software vendors.",
        difficulty: "Hard",
        icon: <Building className="h-10 w-10 text-primary" />
    },
    {
        topic: "Cybersecurity Laws & Ethics",
        title: "Cybersecurity Law",
        description: "Understand the legal and ethical landscape of cybersecurity.",
        difficulty: "Hard",
        icon: <Scale className="h-10 w-10 text-primary" />
    },
    {
        topic: "Zero-Day Exploits",
        title: "Zero-Day Exploits",
        description: "Learn about vulnerabilities unknown to those who should fix them.",
        difficulty: "Hard",
        icon: <Puzzle className="h-10 w-10 text-primary" />
    },
    {
        topic: "Spear Phishing",
        title: "Spear Phishing",
        description: "Identify highly targeted and personalized phishing attacks.",
        difficulty: "Medium",
        icon: <BrainCircuit className="h-10 w-10 text-primary" />
    },
    {
        topic: "Insider Threats",
        title: "Insider Threats",
        description: "Recognize threats originating from within an organization.",
        difficulty: "Hard",
        icon: <Users className="h-10 w-10 text-primary" />
    },
    {
        topic: "IoT Security",
        title: "IoT Security",
        description: "Secure your smart home and other connected devices.",
        difficulty: "Medium",
        icon: <SmartphoneNfc className="h-10 w-10 text-primary" />
    }
];

type UserProfile = {
    quizScores?: { [key: string]: number };
}

function TopicCard({ 
    topic, 
    formAction, 
    isLocked 
}: { 
    topic: QuizTopic, 
    formAction: (payload: FormData) => void;
    isLocked: boolean;
}) {
    return (
        <Card className={cn(
            "transition-all", 
            isLocked && "blur-sm grayscale pointer-events-none relative"
        )}>
            <form action={formAction}>
                <CardHeader className="items-center text-center">
                    {topic.icon}
                    <CardTitle>{topic.title}</CardTitle>
                    <CardDescription>{topic.description}</CardDescription>
                </CardHeader>
                <CardFooter>
                    <input type="hidden" name="topic" value={topic.topic} />
                    <input type="hidden" name="difficulty" value={topic.difficulty} />
                    <Button type="submit" className="w-full" disabled={isLocked}>
                        Start Quiz
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </CardFooter>
            </form>
            {isLocked && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-lg">
                    <Lock className="h-12 w-12 text-white" />
                </div>
            )}
        </Card>
    );
}


export default function QuizPage() {
  const { user } = useAuth();
  const [state, formAction, isPending] = useActionState(generateQuizAction, initialQuizState);
  const [activeQuiz, setActiveQuiz] = useState<Question[] | null>(null);
  const [activeTopic, setActiveTopic] = useState<QuizTopic | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  useEffect(() => {
    if (user) {
      const unsub = onSnapshot(doc(db, "users", user.uid), (doc) => {
        setProfile(doc.data() as UserProfile);
        setLoadingProfile(false);
      });
      return () => unsub();
    } else {
        setLoadingProfile(false);
    }
  }, [user]);

  // When the action state updates with questions, set the active quiz
  useEffect(() => {
    if (state?.questions && state.questions.length > 0 && state?.topic) {
        const topicDetails = quizTopics.find(t => t.topic === state.topic);
        if (topicDetails) {
            setActiveTopic(topicDetails);
            setActiveQuiz(state.questions);
        }
    }
  }, [state]);

  const handleQuizFinish = () => {
    setActiveQuiz(null); // Return to topic selection
    setActiveTopic(null);
  }

  const handleFormAction = (formData: FormData) => {
    const topic = formData.get('topic') as string;
    const topicIndex = quizTopics.findIndex(t => t.topic === topic);
    
    if (topicIndex > 0) {
        const prevTopic = quizTopics[topicIndex - 1];
        const prevScore = profile?.quizScores?.[prevTopic.title] ?? 0;
        if (prevScore < 5) { // Assuming 5 questions per quiz
            // This is a client-side check, the button should be disabled anyway
            return;
        }
    }
    formAction(formData);
  }

  if (loadingProfile) {
    return (
        <div className="flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
        </div>
    )
  }

  if (isPending) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 text-center h-full p-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <h2 className="text-xl sm:text-2xl font-bold">Generating Your Quiz...</h2>
        <p className="text-muted-foreground">The AI is crafting questions just for you. Please wait a moment.</p>
      </div>
    )
  }
  
  if (activeQuiz && activeTopic) {
    return <QuizClient questions={activeQuiz} topicTitle={activeTopic.title} onFinish={handleQuizFinish} />;
  }

  return (
    <div className="w-full">
        <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Knowledge Quiz</h1>
            <p className="text-muted-foreground mt-1">
              Select a topic to test your skills. Get a perfect score to unlock the next level!
            </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {quizTopics.map((topic, index) => {
                const isFirst = index === 0;
                const prevTopic = isFirst ? null : quizTopics[index - 1];
                const prevScore = prevTopic ? profile?.quizScores?.[prevTopic.title] ?? 0 : 0;
                const isLocked = !isFirst && prevScore < 5; // Perfect score on 5 questions

                return (
                    <TopicCard 
                        key={topic.topic} 
                        topic={topic} 
                        formAction={handleFormAction}
                        isLocked={isLocked}
                    />
                )
            })}
        </div>
    </div>
  );
}
