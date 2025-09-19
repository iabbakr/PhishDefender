
"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Upload, Loader2, Link2, FileText, MessageSquare } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp, doc, updateDoc, increment, getDoc } from "firebase/firestore";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Textarea } from "./ui/textarea";

const urlSchema = z.object({
  content: z.string().url({ message: "Please enter a valid URL." }),
});

const textSchema = z.object({
    content: z.string().min(10, { message: "Content is too short." }),
});

async function reportAction(
    type: 'URL' | 'Email' | 'SMS',
    content: string,
    comments: string,
    user: import('firebase/auth').User
): Promise<{error?: string}> {
  
  const schema = type === 'URL' ? urlSchema : textSchema;
  const validatedFields = schema.safeParse({ content });

  if (!validatedFields.success) {
    return {
      error: validatedFields.error.flatten().fieldErrors.content?.[0],
    };
  }

  try {
    // Fetch user profile to get the username
    const userProfileRef = doc(db, 'users', user.uid);
    const userProfileSnap = await getDoc(userProfileRef);
    const reportedBy = userProfileSnap.exists() ? userProfileSnap.data().username : (user.displayName || 'Anonymous');

    // Add the public report
    await addDoc(collection(db, "communitySubmissions"), {
      type: type,
      content: validatedFields.data.content,
      comments: comments || null,
      reportedBy: reportedBy,
      riskLevel: 'High', // Defaulting to high for now
      status: 'Pending',
      createdAt: serverTimestamp(),
    });

    // Update the user's contribution count
    const userRef = doc(db, 'users', user.uid);
    const contributionField = `contributions.${type.toLowerCase()}`;
    await updateDoc(userRef, contributionField, increment(1));

    return {};
  } catch (error) {
    console.error("Error adding document: ", error);
    return { error: "Failed to submit report. Please try again."}
  }
}

export function ThreatIntelSubmit() {
    const { user } = useAuth();
    const { toast } = useToast();
    const [submissionType, setSubmissionType] = useState<'URL' | 'Email' | 'SMS'>('URL');
    const [content, setContent] = useState("");
    const [comments, setComments] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | undefined>();

    const handleTypeChange = (value: string) => {
        setSubmissionType(value as any);
        setContent(""); // Clear content when changing tabs
        setError(undefined);
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(undefined);

        if (!user) {
            toast({ variant: "destructive", title: "Not logged in", description: "You must be logged in to submit a report."});
            return;
        };
        setIsSubmitting(true);
        
        const result = await reportAction(submissionType, content, comments, user);
        
        if (result.error) {
            setError(result.error);
        } else {
            toast({
                title: "Report Submitted",
                description: "Thank you for helping keep the community safe!",
            });
            setContent("");
            setComments("");
        }
        setIsSubmitting(false);
    };

    return (
        <Card>
          <CardHeader>
            <CardTitle>Report a Threat</CardTitle>
            <CardDescription>
              Found something suspicious? Share it with the community to help others stay safe.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
                <Tabs defaultValue="URL" onValueChange={handleTypeChange}>
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="URL"><Link2 className="mr-2 h-4 w-4" /> URL</TabsTrigger>
                        <TabsTrigger value="Email"><FileText className="mr-2 h-4 w-4" /> Email</TabsTrigger>
                        <TabsTrigger value="SMS"><MessageSquare className="mr-2 h-4 w-4" /> SMS</TabsTrigger>
                    </TabsList>
                    <div className="pt-4">
                      {submissionType === 'URL' && (
                          <div className="space-y-1">
                              <Label htmlFor="report-url">URL to report</Label>
                              <Input 
                                  id="report-url"
                                  placeholder="https://suspicious-site.com"
                                  value={content}
                                  onChange={(e) => setContent(e.target.value)}
                                  required
                                  type="url"
                              />
                          </div>
                      )}
                      {submissionType === 'Email' && (
                          <div className="space-y-1">
                              <Label htmlFor="report-email">Full Email Content</Label>
                              <Textarea
                                  id="report-email"
                                  placeholder="Paste the full email content here..."
                                  className="min-h-[150px]"
                                  value={content}
                                  onChange={(e) => setContent(e.target.value)}
                                  required
                              />
                          </div>
                      )}
                      {submissionType === 'SMS' && (
                          <div className="space-y-1">
                              <Label htmlFor="report-sms">SMS Message</Label>
                              <Textarea
                                  id="report-sms"
                                  placeholder="Paste the suspicious SMS message here..."
                                  className="min-h-[100px]"
                                  value={content}
                                  onChange={(e) => setContent(e.target.value)}
                                  required
                              />
                          </div>
                      )}
                    </div>
                </Tabs>

                <div className="space-y-1">
                    <Label htmlFor="comments">Comments (Optional)</Label>
                    <Textarea 
                        id="comments"
                        placeholder="Add any additional context or notes here..."
                        value={comments}
                        onChange={(e) => setComments(e.target.value)}
                    />
                </div>
                {error && <p className="text-sm text-destructive">{error}</p>}
              </CardContent>
              <CardFooter>
                <Button className="w-full" type="submit" disabled={isSubmitting || !content}>
                    {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                    Submit Report
                </Button>
              </CardFooter>
            </form>
        </Card>
    )
}
