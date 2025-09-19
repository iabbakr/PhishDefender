
'use client';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { type EducationResource } from "@/lib/types";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowRight, Video, FileText, PlusCircle, Loader2, BookCheck, Lock, Trash2, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { useState, useTransition, useEffect } from "react";
import { generateLearningArticleAction } from "./actions";
import { useToast } from "@/hooks/use-toast";
import { collection, onSnapshot, addDoc, serverTimestamp, query, orderBy, where, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/use-auth";
import { learningPath, type LearningPathLevel } from "@/lib/learning-path";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger, AlertDialogFooter } from "@/components/ui/alert-dialog";
import { deleteArticleAction, deleteAllArticlesAction } from "./admin-actions";

type UserProfile = {
  readArticles?: string[];
}

function ResourceCard({ resource, isAdmin, onDelete }: { resource: EducationResource, isAdmin: boolean, onDelete: (id: string) => void }) {
  const [isDeleting, startDeleteTransition] = useTransition();
  
  const handleDelete = () => {
    startDeleteTransition(async () => {
      await onDelete(resource.id);
    });
  };

  return (
    <Card className="flex flex-col overflow-hidden">
      <div className="relative">
        <Image
          src={resource.image}
          alt={resource.title}
          width={600}
          height={400}
          className="aspect-video w-full object-cover"
          data-ai-hint={resource.imageHint}
        />
        {resource.type === 'Video' && (
          <div className="absolute bottom-2 right-2 rounded-md bg-black/50 px-2 py-1 text-xs text-white">
            {resource.duration}
          </div>
        )}
      </div>
      <CardHeader>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {resource.type === 'Article' ? <FileText className="h-4 w-4" /> : <Video className="h-4 w-4" />}
          <span>{resource.type}</span>
        </div>
        <CardTitle>{resource.title}</CardTitle>
        <CardDescription className="line-clamp-2">{resource.description}</CardDescription>
      </CardHeader>
      <CardFooter className="mt-auto flex gap-2">
        <Button asChild className="w-full" variant="secondary">
          <Link href={`/dashboard/learning-hub/${resource.id}`}>
            Learn More <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
        {isAdmin && (
           <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="icon" disabled={isDeleting}>
                {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the article titled &quot;{resource.title}&quot;.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </CardFooter>
    </Card>
  );
}

function LearningPathCard({ 
    level, 
    resources, 
    userProgress, 
    isLocked
}: { 
    level: LearningPathLevel, 
    resources: EducationResource[], 
    userProgress: string[], 
    isLocked: boolean
}) {
    
    const completedCount = userProgress
        .map(readId => resources.find(r => r.id === readId))
        .filter(Boolean)
        .filter(r => r!.path === level.path).length;
    
    const progress = level.maxArticles > 0 ? (completedCount / level.maxArticles) * 100 : 0;

    // Check if the level is complete
    const articlesForLevel = resources.filter(r => r.path === level.path);
    const isLevelComplete = articlesForLevel.length > 0 ? completedCount >= articlesForLevel.length : true;


    return (
        <Link href={isLocked ? "#" : `/dashboard/learning-hub/path/${level.path}`} className={cn("block group", isLocked && "pointer-events-none")}>
            <Card className={cn(
                "transition-all",
                isLocked && "bg-muted/50 border-dashed",
                !isLocked && "hover:border-primary hover:shadow-lg"
            )}>
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <div>
                            <Badge variant={isLocked ? "secondary" : "default"} className="mb-2">{level.title}</Badge>
                            <CardTitle>{level.name}</CardTitle>
                            <CardDescription>{level.description}</CardDescription>
                        </div>
                        {isLocked ? <Lock className="h-6 w-6 text-muted-foreground" /> : <BookCheck className="h-6 w-6 text-green-500" />}
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="h-2 w-full bg-muted rounded-full">
                            <div className="h-2 bg-primary rounded-full" style={{ width: `${progress}%` }} />
                        </div>
                        <span className="flex-shrink-0">{completedCount} / {level.maxArticles}</span>
                    </div>
                </CardContent>
                <CardFooter>
                    <p className="text-sm text-muted-foreground group-hover:text-primary transition-colors">
                        {isLocked ? "Complete previous levels to unlock" : "Click to view articles for this level"}
                    </p>
                </CardFooter>
            </Card>
        </Link>
    )
}


export default function LearningHubPage() {
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [isDeletingAll, startDeleteAllTransition] = useTransition();
  const [resources, setResources] = useState<EducationResource[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
        setLoading(false);
        return;
    };

    const articlesRef = collection(db, 'learningResources');
    
    // Query for public articles (no uid field)
    const publicQuery = query(articlesRef, where('uid', '==', null), orderBy('createdAt', 'desc'));
    
    // Query for user-specific articles
    const userQuery = query(articlesRef, where('uid', '==', user.uid), orderBy('createdAt', 'desc'));

    const unsubPublic = onSnapshot(publicQuery, (publicSnapshot) => {
        const publicResources = publicSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as EducationResource[];
        
        const unsubUser = onSnapshot(userQuery, (userSnapshot) => {
            const userResources = userSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as EducationResource[];
            
            // Combine and remove duplicates (though there shouldn't be any with this logic)
            const allResources = [...publicResources, ...userResources];
            const uniqueResources = Array.from(new Map(allResources.map(item => [item.id, item])).values());
            
            setResources(uniqueResources);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching user learning resources:", error);
            toast({ variant: "destructive", title: "Error", description: "Could not load your learning resources." });
            setLoading(false);
        });

        return () => unsubUser();

    }, (error) => {
        console.error("Error fetching public learning resources:", error);
        toast({ variant: "destructive", title: "Error", description: "Could not load public learning resources." });
        setLoading(false);
    });

    return () => unsubPublic();
  }, [user, toast]);

  useEffect(() => {
    if (user) {
        const unsub = onSnapshot(doc(db, "users", user.uid), (doc) => {
            setProfile(doc.data() as UserProfile);
        });
        return () => unsub();
    }
  }, [user]);


  const handleGenerateArticle = (topic: string) => {
    startTransition(async () => {
       if (!user) {
        toast({ variant: "destructive", title: "Authentication Error", description: "You must be logged in to generate an article." });
        return;
      }
      const result = await generateLearningArticleAction(topic);
      if ('error' in result) {
        toast({ variant: "destructive", title: "Generation Failed", description: result.error });
      } else {
        const newArticle: Omit<EducationResource, 'id'> = {
          title: result.title,
          description: result.description,
          imageHint: result.imageHint,
          type: 'Article',
          image: `https://picsum.photos/seed/${Math.random()}/600/400`,
          link: '#',
          content: result.content,
          uid: user.uid, // Associate article with the user
        }

        const docRef = await addDoc(collection(db, "learningResources"), { ...newArticle, createdAt: serverTimestamp() });
        // The page automatically updates from the onSnapshot listener
        
        toast({
          title: "New Article Generated!",
          description: `"${result.title}" has been added to the learning hub.`,
          action: (
            <Button asChild variant="secondary">
                <Link href={`/dashboard/learning-hub/${docRef.id}`}>View</Link>
            </Button>
          )
        });
      }
    });
  }

  const handleDeleteArticle = async (id: string) => {
    const result = await deleteArticleAction(id);
    if (result.error) {
      toast({ variant: "destructive", title: "Deletion Failed", description: result.error });
    } else {
      toast({ title: "Article Deleted", description: "The article has been successfully removed." });
    }
  };

  const handleDeleteAllArticles = () => {
    startDeleteAllTransition(async () => {
        const result = await deleteAllArticlesAction();
        if (result.error) {
            toast({ variant: "destructive", title: "Error", description: result.error });
        } else {
            toast({ title: "All Articles Cleared", description: "All learning resources have been deleted." });
        }
    });
  }

  const userProgress = profile?.readArticles ?? [];
  let previousLevelCompleted = true;

  return (
    <div className="w-full">
      <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Learning Hub</h1>
          <p className="text-muted-foreground mt-1">
            Sharpen your skills with our guided learning path or browse all available resources.
          </p>
        </div>
        <Button onClick={() => handleGenerateArticle("General Cybersecurity")} disabled={isPending} className="w-full sm:w-auto">
          {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlusCircle className="mr-2 h-4 w-4" />}
          Generate Random Article
        </Button>
      </div>

       <div className="space-y-8">
            <div>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight mb-4">Your Learning Path</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {loading || !profile ? (
                         [...Array(3)].map((_, i) => (
                             <Card key={i}><CardContent className="p-6"><Loader2 className="h-6 w-6 animate-spin"/></CardContent></Card>
                         ))
                    ) : (
                        learningPath.map(level => {
                            const articlesForLevel = resources.filter(r => r.path === level.path);
                            const completedArticlesForLevel = userProgress
                                .map(readId => resources.find(r => r.id === readId))
                                .filter(r => r?.path === level.path);

                            const isLevelComplete = articlesForLevel.length > 0 
                                ? completedArticlesForLevel.length >= articlesForLevel.length 
                                : true;
                            
                            const isLocked = !previousLevelCompleted;

                            if (!isLocked) { 
                                previousLevelCompleted = isLevelComplete;
                            }

                            return <LearningPathCard 
                                key={level.level} 
                                level={level} 
                                resources={resources} 
                                userProgress={userProgress} 
                                isLocked={isLocked}
                            />
                        })
                    )}
                </div>
            </div>

            <Separator />
            
            <div>
                 <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
                    <h2 className="text-xl sm:text-2xl font-bold tracking-tight">All Resources</h2>
                    {isAdmin && (
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive" disabled={isDeletingAll || resources.length === 0}>
                                    {isDeletingAll ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                                    Clear All
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle className="flex items-center gap-2"><ShieldAlert /> Are you absolutely sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This action cannot be undone. This will permanently delete all learning resources from the database.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleDeleteAllArticles} className="bg-destructive hover:bg-destructive/90">
                                        Yes, delete everything
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    )}
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {[...Array(4)].map((_, i) => (
                            <Card key={i}>
                                <CardContent className="p-0">
                                    <div className="aspect-video w-full bg-muted animate-pulse" />
                                </CardContent>
                                <CardHeader>
                                    <div className="h-4 w-1/4 bg-muted animate-pulse mb-2" />
                                    <div className="h-6 w-3/4 bg-muted animate-pulse" />
                                    <div className="h-4 w-full bg-muted animate-pulse mt-2" />
                                    <div className="h-4 w-2/3 bg-muted animate-pulse" />
                                </CardHeader>
                                <CardFooter>
                                    <div className="h-10 w-full bg-muted animate-pulse" />
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {resources.map((resource) => (
                            <ResourceCard key={resource.id} resource={resource} isAdmin={isAdmin} onDelete={handleDeleteArticle} />
                        ))}
                    </div>
                )}
            </div>
       </div>
    </div>
  );
}

    
