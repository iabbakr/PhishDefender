
'use client';

import { notFound, useParams } from "next/navigation";
import { learningPath } from "@/lib/learning-path";
import { useState, useEffect, useTransition } from "react";
import { type EducationResource } from "@/lib/types";
import { collection, query, where, onSnapshot, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowRight, Video, FileText, Loader2, PlusCircle, ArrowLeft, Trash2 } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { generateLearningArticleAction } from "../../actions";
import { useAuth } from "@/hooks/use-auth";
import { deleteArticleAction } from "../../admin-actions";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

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


export default function LearningPathPage() {
  const params = useParams();
  const pathName = params.pathName as string;
  const level = learningPath.find(p => p.path === pathName);
  
  const [resources, setResources] = useState<EducationResource[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const { user, isAdmin } = useAuth();

  useEffect(() => {
    if (!level || !user) {
        setLoading(false);
        return;
    };

    const articlesRef = collection(db, "learningResources");

    // Query for public articles on this path
    const publicQuery = query(articlesRef, where("path", "==", level.path), where('uid', '==', null));

    // Query for user-specific articles on this path
    const userQuery = query(articlesRef, where("path", "==", level.path), where('uid', '==', user.uid));

    const unsubPublic = onSnapshot(publicQuery, (publicSnapshot) => {
        const publicResources = publicSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as EducationResource[];

        const unsubUser = onSnapshot(userQuery, (userSnapshot) => {
            const userResources = userSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as EducationResource[];
            
            // Combine and remove duplicates
            const allResources = [...publicResources, ...userResources];
            const uniqueResources = Array.from(new Map(allResources.map(item => [item.id, item])).values());

            setResources(uniqueResources);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching user resources for path:", error);
            toast({ variant: "destructive", title: "Error", description: "Could not load your articles for this path." });
            setLoading(false);
        });

        return () => unsubUser();
    }, (error) => {
        console.error("Error fetching public resources for path:", error);
        toast({ variant: "destructive", title: "Error", description: "Could not load articles for this path." });
        setLoading(false);
    });

    return () => unsubPublic();
  }, [level, user, toast]);

  if (!level) {
    notFound();
  }
  
  const handleDeleteArticle = async (id: string) => {
    const result = await deleteArticleAction(id);
    if (result.error) {
      toast({ variant: "destructive", title: "Deletion Failed", description: result.error });
    } else {
      toast({ title: "Article Deleted", description: "The article has been successfully removed." });
    }
  };

  const handleGenerateArticle = (topic: string) => {
    startTransition(async () => {
      if (!user) {
        toast({ variant: "destructive", title: "Authentication Error", description: "You must be logged in to generate an article." });
        return;
      }
      if (resources.length >= level.maxArticles) {
        toast({ variant: "destructive", title: "Limit Reached", description: `You can only generate a maximum of ${level.maxArticles} articles for this level.` });
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
          path: level.path, // Associate the article with the current path
          uid: user.uid, // Associate with the user
        }

        const docRef = await addDoc(collection(db, "learningResources"), { ...newArticle, createdAt: serverTimestamp() });
        
        toast({
          title: "New Article Generated!",
          description: `"${result.title}" has been created.`,
          action: (
            <Button asChild variant="secondary">
                <Link href={`/dashboard/learning-hub/${docRef.id}`}>View</Link>
            </Button>
          )
        });
      }
    });
  }

  const canGenerate = resources.length < level.maxArticles;

  return (
    <div className="w-full">
        <Button asChild variant="ghost" className="mb-4">
            <Link href="/dashboard/learning-hub">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Learning Hub
            </Link>
        </Button>

      <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
            <p className="text-sm font-semibold text-primary">{level.title}</p>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{level.name}</h1>
            <p className="text-muted-foreground mt-1">{level.description}</p>
        </div>
        {canGenerate && (
            <Button onClick={() => handleGenerateArticle(level.topic)} disabled={isPending} className="w-full sm:w-auto">
            {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlusCircle className="mr-2 h-4 w-4" />}
            Generate Article
            </Button>
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
        ) : resources.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {resources.map((resource) => (
                    <ResourceCard key={resource.id} resource={resource} isAdmin={isAdmin} onDelete={handleDeleteArticle} />
                ))}
            </div>
        ) : (
            <div className="text-center py-16 border-2 border-dashed rounded-lg">
                <h3 className="text-lg font-semibold">No Articles Yet</h3>
                <p className="text-muted-foreground">There are no articles for this level right now.</p>
                 {canGenerate && <p className="text-muted-foreground">Try generating one to get started!</p>}
            </div>
        )}
    </div>
  );
}
