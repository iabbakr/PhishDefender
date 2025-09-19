
"use client";

import { Star, Shield, Anchor, Crown, Diamond, Rocket, KeyRound, Ghost, Gem, ShieldQuestion } from "lucide-react";

export type Rank = {
    level: number;
    title: string;
    minScore: number;
    minContributions: number;
    icon: React.ReactNode;
    color: string;
};

export const ranks: Rank[] = [
    { level: 1, title: 'Novice Analyst', minScore: 0, minContributions: 0, icon: <ShieldQuestion className="h-4 w-4" />, color: 'text-gray-400' },
    { level: 2, title: 'Scout', minScore: 10, minContributions: 2, icon: <Star className="h-4 w-4" />, color: 'text-yellow-500' },
    { level: 3, title: 'Guardian', minScore: 25, minContributions: 5, icon: <Shield className="h-4 w-4" />, color: 'text-green-500' },
    { level: 4, title: 'Threat Hunter', minScore: 50, minContributions: 10, icon: <Ghost className="h-4 w-4" />, color: 'text-blue-500' },
    { level: 5, title: 'Sentinel', minScore: 80, minContributions: 15, icon: <KeyRound className="h-4 w-4" />, color: 'text-indigo-500' },
    { level: 6, title: 'Lead Investigator', minScore: 120, minContributions: 20, icon: <Rocket className="h-4 w-4" />, color: 'text-purple-500' },
    { level: 7, title: 'Diamond Defender', minScore: 170, minContributions: 30, icon: <Diamond className="h-4 w-4" />, color: 'text-pink-500' },
    { level: 8, title: 'Master of the Matrix', minScore: 230, minContributions: 40, icon: <Gem className="h-4 w-4" />, color: 'text-red-500' },
    { level: 9, title: 'Cyber Anchor', minScore: 300, minContributions: 50, icon: <Anchor className="h-4 w-4" />, color: 'text-orange-500' },
    { level: 10, title: 'Phish Pharoah', minScore: 400, minContributions: 60, icon: <Crown className="h-4 w-4" />, color: 'text-amber-400' },
];

export function getRank(quizScores: { [key: string]: number }, contributions: { url: number; email: number; sms: number }): Rank {
    const totalScore = Object.values(quizScores).reduce((sum, score) => sum + score, 0);
    const totalContributions = contributions.url + contributions.email + contributions.sms;
    
    // Find the highest rank the user has achieved
    for (let i = ranks.length - 1; i >= 0; i--) {
        const rank = ranks[i];
        if (totalScore >= rank.minScore && totalContributions >= rank.minContributions) {
            return rank;
        }
    }
    
    return ranks[0]; // Default to the first rank
}
