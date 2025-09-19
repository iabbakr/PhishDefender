'use client';

import { db } from "@/lib/firebase";
import { type EducationResource } from "@/lib/types";
import { doc, getDoc, onSnapshot, updateDoc, arrayUnion } from "firebase/firestore";
import { useParams, notFound } from "next/navigation";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { FileText, ArrowLeft, Loader2, CheckCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useEffect, useState, useTransition } from "react";
import { useToast } from "@/hooks/use-toast";

type UserProfile = {
  readArticles?: string[];
}

// A more robust markdown-to-HTML converter.
function Markdown({ content }: { content: string }) {
    // Process block-level elements first (lists)
    let html = content
        .replace(/^(?:\s*([*+-]|\d+\.)){1,2}\s+(.*)/gm, (match, marker, text) => {
             // Basic list item handling
            if (marker.match(/\d/)) {
                return `<ol><li>${text}</li></ol>`; // This is a simplification; ideally, group consecutive items.
            }
            return `<ul><li>${text}</li></ul>`;
        })
        .replace(/<\/ul>\n<ul>/g, '') // Merge consecutive lists
        .replace(/<\/ol>\n<ol>/g, '');

    // Process line-by-line for other elements
    html = html.split('\n').map(line => {
        // Headings
        if (line.startsWith('## ')) return `<h2>${line.substring(3)}</h2>`;
        if (line.startsWith('# ')) return `<h1>${line.substring(2)}</h1>`;

        // Don't wrap list items in <p>
        if (line.startsWith('<ul>') || line.startsWith('<ol>')) return line;
        
        // Inline elements
        let inlineHtml = line
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold
            .replace(/\*(.*?)\*/g, '<em>$1</em>')             // Italic
            .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>'); // Links

        if (inlineHtml.trim() === '') return '<br />';
        
        return `<p>${inlineHtml}</p>`;
    }).join('');

    return <div className="prose prose-sm sm:prose-base lg:prose-lg xl:prose-xl 2xl:prose-2xl dark:prose-invert" dangerouslySetInnerHTML={{ __html: html }} />;
}


async function getArticle(id: string): Promise<EducationResource | null> {
    const docRef = doc(db, "learningResources", id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as EducationResource;
    } else {
        return null;
    }
}

export default function ArticlePage() {
    const params = useParams();
    const articleId = params.id as string;
    const { user } = useAuth();
    const { toast } = useToast();
    const [isPending, startTransition] = useTransition();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loadingProfile, setLoadingProfile] = useState(true);
    const [article, setArticle] = useState<EducationResource | null>(null);
    const [loadingArticle, setLoadingArticle] = useState(true);

    useEffect(() => {
        if (!articleId) return;
        const fetchArticleData = async () => {
            setLoadingArticle(true);
            const articleData = await getArticle(articleId);
            if (!articleData) {
                notFound();
            } else {
                setArticle(articleData);
            }
            setLoadingArticle(false);
        };
        fetchArticleData();
    }, [articleId]);

    useEffect(() => {
        if (user) {
            setLoadingProfile(true);
            const unsub = onSnapshot(doc(db, "users", user.uid), (doc) => {
                setProfile(doc.data() as UserProfile);
                setLoadingProfile(false);
            });
            return () => unsub();
        } else {
            setLoadingProfile(false);
        }
    }, [user]);

    const handleMarkAsRead = () => {
        if (!user) {
             toast({
                variant: "destructive",
                title: "Error",
                description: "You must be logged in to perform this action.",
            });
            return;
        }
        startTransition(async () => {
            try {
                const userRef = doc(db, 'users', user.uid);
                await updateDoc(userRef, {
                    readArticles: arrayUnion(articleId)
                });
                toast({
                    title: "Progress Saved!",
                    description: "You've completed this article.",
                });
            } catch (error) {
                 const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
                 toast({
                    variant: "destructive",
                    title: "Error",
                    description: errorMessage,
                });
            }
        });
    };

    if (loadingArticle || loadingProfile) {
        return (
            <div className="flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }
    
    if (!article) {
        notFound();
    }

    const isRead = profile?.readArticles?.includes(articleId) ?? false;

    return (
        <div className="w-full max-w-4xl mx-auto">
             <Button asChild variant="ghost" className="mb-4">
                <Link href="/dashboard/learning-hub">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Learning Hub
                </Link>
            </Button>
            <Card>
                <CardHeader>
                    <div className="relative w-full aspect-video rounded-t-lg overflow-hidden mb-4">
                        <Image
                            src={article.image}
                            alt={article.title}
                            fill
                            className="object-cover"
                            data-ai-hint={article.imageHint}
                        />
                    </div>
                     <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <FileText className="h-4 w-4" />
                        <span>Article</span>
                    </div>
                    <CardTitle className="text-4xl font-bold">{article.title}</CardTitle>
                    <CardDescription className="text-lg">{article.description}</CardDescription>
                </CardHeader>
                <CardContent className="mt-4">
                    <div className="space-y-4 text-base leading-relaxed">
                       {article.content ? <Markdown content={article.content} /> : <p>No content available.</p>}
                    </div>
                </CardContent>
                <CardFooter>
                    <Button onClick={handleMarkAsRead} disabled={isPending}>
                        {isPending ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : isRead ? (
                            <CheckCircle className="mr-2 h-4 w-4" />
                        ) : null}
                        {isRead ? "Completed" : "Mark as Read"}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
}
