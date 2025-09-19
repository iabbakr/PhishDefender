
"use client";

import { useEffect, useState } from "react";
import { type CommunitySubmission } from "@/lib/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle, Upload, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { db } from "@/lib/firebase";
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from "firebase/firestore";
import Link from "next/link";
import { ArrowRight } from 'lucide-react';

function RiskBadge({ level }: { level: CommunitySubmission['riskLevel'] }) {
    if (level === 'High') {
        return <Badge variant="destructive" className="gap-1"><AlertCircle className="h-3 w-3" /> High</Badge>
    }
    return <Badge variant="default" className="bg-accent text-accent-foreground gap-1"><AlertCircle className="h-3 w-3" /> Medium</Badge>
}

function StatusBadge({ status }: { status: CommunitySubmission['status'] }) {
    if (status === 'Verified') {
        return <Badge variant="secondary" className="gap-1 text-green-600"><CheckCircle className="h-3 w-3" /> Verified</Badge>
    }
    return <Badge variant="secondary">{status}</Badge>
}

export function CommunityFeed() {
    const { toast } = useToast();
    const [submissions, setSubmissions] = useState<CommunitySubmission[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const q = query(collection(db, "communitySubmissions"), orderBy("createdAt", "desc"));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const submissionsData: CommunitySubmission[] = [];
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                submissionsData.push({
                    id: doc.id,
                    type: data.type || 'URL',
                    content: data.content || data.url,
                    reportedBy: data.reportedBy,
                    date: data.createdAt?.toDate().toISOString().split('T')[0] ?? new Date().toISOString().split('T')[0],
                    riskLevel: data.riskLevel,
                    status: data.status,
                });
            });
            setSubmissions(submissionsData.slice(0, 5)); // Only take latest 5
            setLoading(false);
        }, (error) => {
          console.error("Error fetching submissions:", error);
          toast({
            variant: "destructive",
            title: "Error",
            description: "Could not load community feed.",
          });
          setLoading(false);
        });

        return () => unsubscribe();
    }, [toast]);


  return (
    <Card>
        <CardHeader>
            <CardTitle>Recent Community Reports</CardTitle>
            <CardDescription>The latest threats reported by the PhishDefender community.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
            <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead>URL</TableHead>
                    <TableHead className="hidden sm:table-cell">Risk</TableHead>
                    <TableHead className="hidden md:table-cell">Status</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {loading ? (
                        <TableRow>
                            <TableCell colSpan={3} className="text-center">
                                <Loader2 className="mx-auto my-4 h-6 w-6 animate-spin text-primary" />
                            </TableCell>
                        </TableRow>
                    ) : (
                        submissions.map((submission) => (
                        <TableRow key={submission.id}>
                            <TableCell className="font-mono text-xs truncate max-w-[150px] sm:max-w-xs">{submission.content}</TableCell>
                            <TableCell className="hidden sm:table-cell"><RiskBadge level={submission.riskLevel} /></TableCell>
                            <TableCell className="hidden md:table-cell"><StatusBadge status={submission.status} /></TableCell>
                        </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </CardContent>
        <CardFooter>
            <Button asChild variant="secondary" className="w-full">
                <Link href="/dashboard/threat-intel">
                    View All Reports
                    <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
            </Button>
        </CardFooter>
    </Card>
  );
}
