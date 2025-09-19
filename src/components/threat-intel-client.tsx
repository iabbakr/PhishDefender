
"use client";

import { useEffect, useState, useMemo } from "react";
import { type CommunitySubmission } from "@/lib/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle, Upload, Loader2, Search, FileText, MessageSquare, Link2, ChevronLeft, ChevronRight } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { db } from "@/lib/firebase";
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from "firebase/firestore";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";

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

function TypeBadge({ type }: { type: CommunitySubmission['type'] }) {
    const typeMap = {
        URL: { icon: <Link2 className="h-3 w-3" />, label: "URL" },
        Email: { icon: <FileText className="h-3 w-3" />, label: "Email" },
        SMS: { icon: <MessageSquare className="h-3 w-3" />, label: "SMS" },
    };
    const { icon, label } = typeMap[type] || typeMap.URL;
    return <Badge variant="outline" className="gap-1">{icon} {label}</Badge>
}


function SubmissionsTable({ submissions }: { submissions: CommunitySubmission[] }) {
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    
    if (submissions.length === 0) {
        return <div className="text-center text-muted-foreground p-8">No submissions found.</div>
    }

    const totalPages = Math.ceil(submissions.length / itemsPerPage);
    const paginatedSubmissions = submissions.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
        <TooltipProvider>
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                        <TableHead className="w-[100px]">Type</TableHead>
                        <TableHead>Content</TableHead>
                        <TableHead className="hidden sm:table-cell">Reported By</TableHead>
                        <TableHead className="hidden md:table-cell">Date</TableHead>
                        <TableHead>Risk</TableHead>
                        <TableHead>Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {paginatedSubmissions.map((submission) => (
                            <TableRow key={submission.id}>
                                <TableCell><TypeBadge type={submission.type} /></TableCell>
                                <TableCell>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <p className="font-mono text-xs truncate max-w-[100px] sm:max-w-xs">{submission.content}</p>
                                        </TooltipTrigger>
                                        <TooltipContent align="start" className="max-w-md break-words">
                                            <pre className="whitespace-pre-wrap font-mono text-xs">{submission.content}</pre>
                                            {submission.comments && <p className="mt-2 pt-2 border-t text-muted-foreground"><b>Comments:</b> {submission.comments}</p>}
                                        </TooltipContent>
                                    </Tooltip>
                                </TableCell>
                                <TableCell className="hidden sm:table-cell">{submission.reportedBy}</TableCell>
                                <TableCell className="hidden md:table-cell">{submission.date}</TableCell>
                                <TableCell><RiskBadge level={submission.riskLevel} /></TableCell>
                                <TableCell><StatusBadge status={submission.status} /></TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
            {totalPages > 1 && (
                <div className="flex items-center justify-end space-x-2 p-4 border-t">
                    <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    >
                        <ChevronLeft className="h-4 w-4" />
                        <span className="sr-only">Previous</span>
                    </Button>
                    <span className="text-sm text-muted-foreground">Page {currentPage} of {totalPages}</span>
                    <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    >
                        <ChevronRight className="h-4 w-4" />
                        <span className="sr-only">Next</span>
                    </Button>
                </div>
            )}
        </TooltipProvider>
    )
}

export function ThreatIntelClient() {
    const { toast } = useToast();
    const [submissions, setSubmissions] = useState<CommunitySubmission[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [activeTab, setActiveTab] = useState<'URL' | 'Email' | 'SMS' | 'All'>('All');

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
                    comments: data.comments,
                    reportedBy: data.reportedBy,
                    date: data.createdAt?.toDate().toISOString().split('T')[0] ?? new Date().toISOString().split('T')[0],
                    riskLevel: data.riskLevel,
                    status: data.status,
                });
            });
            setSubmissions(submissionsData);
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

    const filteredSubmissions = useMemo(() => {
        return submissions.filter(s => {
            const matchesTab = activeTab === 'All' || s.type === activeTab;
            const matchesSearch = s.content.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesTab && matchesSearch;
        });
    }, [submissions, searchTerm, activeTab]);

  return (
    <Card>
        <CardHeader>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex-1">
                    <CardTitle>Community Reports</CardTitle>
                    <CardDescription>Browse all threats reported by the community.</CardDescription>
                </div>
                <div className="relative w-full sm:w-auto">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search submissions..."
                        className="pl-8 w-full sm:w-[250px] md:w-[300px]"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>
        </CardHeader>
        <CardContent className="p-0">
             <Tabs defaultValue="All" onValueChange={(value) => setActiveTab(value as any)} className="w-full">
                <div className="overflow-x-auto">
                    <TabsList className="px-4 sm:px-6 border-b w-full justify-start rounded-none">
                        <TabsTrigger value="All">All</TabsTrigger>
                        <TabsTrigger value="URL"><Link2 className="mr-2 h-4 w-4"/>URLs</TabsTrigger>
                        <TabsTrigger value="Email"><FileText className="mr-2 h-4 w-4"/>Emails</TabsTrigger>
                        <TabsTrigger value="SMS"><MessageSquare className="mr-2 h-4 w-4"/>SMS</TabsTrigger>
                    </TabsList>
                </div>
                <div className="p-0">
                     {loading ? (
                        <div className="text-center p-8">
                            <Loader2 className="mx-auto my-8 h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : (
                        <SubmissionsTable submissions={filteredSubmissions} />
                    )}
                </div>
             </Tabs>
        </CardContent>
    </Card>
  );
}
