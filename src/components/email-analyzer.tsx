
"use client";

import { useActionState, useTransition } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { FileText, Loader2, BarChart, ShieldAlert, Siren, ShieldCheck, AlertCircle } from "lucide-react";
import { Label } from "./ui/label";
import { analyzeEmailAction, type EmailFormState } from "../app/dashboard/analyzer/actions";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";

const initialState: EmailFormState = {};

function SubmitButton({ pending }: { pending: boolean }) {
    return (
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileText className="mr-2 h-4 w-4" />}
        Analyze Email
      </Button>
    );
}

function ResultCard({ data }: { data: NonNullable<EmailFormState['data']> }) {
    const getRiskInfo = () => {
      switch (data.verdict) {
        case "phishing":
          return {
            variant: "destructive",
            icon: <ShieldAlert className="h-4 w-4" />,
            title: "Phishing Risk",
            description: "This email shows strong indicators of a phishing attempt.",
          };
        case "suspicious":
          return {
            variant: "default",
            className: "bg-accent text-accent-foreground",
            icon: <Siren className="h-4 w-4" />,
            title: "Suspicious",
            description: "This email has some unusual characteristics. Proceed with caution.",
          };
        default: // benign
          return {
            variant: "default",
            className: "bg-green-500/20 text-green-700",
            icon: <ShieldCheck className="h-4 w-4" />,
            title: "Benign",
            description: "This email appears to be safe.",
          };
      }
    };
  
    const riskInfo = getRiskInfo();
  
    return (
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart className="h-6 w-6" />
            Analysis Result
          </CardTitle>
          <CardDescription>Review the AI-generated analysis of the submitted email.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
           <div className="space-y-2">
            <Label>Verdict</Label>
            <div className="flex items-center gap-2">
              <Badge variant={riskInfo.variant as "default" | "destructive"} className={riskInfo.className}>
                {riskInfo.icon}
                {riskInfo.title}
              </Badge>
              <p className="text-sm text-muted-foreground">{riskInfo.description}</p>
            </div>
          </div>
          <div className="space-y-2">
            <Label>AI Confidence Score</Label>
            <Progress value={data.confidence * 100} className="h-2" />
            <p className="text-sm text-muted-foreground">Confidence that the analysis is correct: {Math.round(data.confidence * 100)}%</p>
          </div>
          <div className="space-y-2">
            <Label>Key Signals Detected</Label>
            <div className="rounded-md border bg-muted p-3 space-y-2 text-sm">
              {data.signals?.length ? (
                <ul className="list-disc pl-4 space-y-1">
                  {data.signals.map((signal, i) => <li key={i}>{signal}</li>)}
                </ul>
              ) : (
                <p className="text-muted-foreground">No specific signals were flagged.</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

export function EmailAnalyzer() {
    const [state, formAction] = useActionState(analyzeEmailAction, initialState);
    const [isPending, startTransition] = useTransition();

    const handleSubmit = (formData: FormData) => {
        startTransition(() => {
            formAction(formData);
        });
    }

  return (
    <div className="mx-auto w-full max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>AI Email Analyzer</CardTitle>
          <CardDescription>
            Paste the full content of a suspicious email to check if it's a phishing attempt.
          </CardDescription>
        </CardHeader>
        <form action={handleSubmit}>
          <CardContent>
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="email-content">Email Content</Label>
              <Textarea 
                id="email-content"
                name="emailContent"
                placeholder="Paste the full email content here, including headers if possible..."
                className="min-h-[200px]"
              />
               {state?.error && !isPending && (
                <p className="mt-1 text-sm text-destructive flex items-center gap-1"><AlertCircle className="h-4 w-4" />{state.error}</p>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <SubmitButton pending={isPending} />
          </CardFooter>
        </form>
      </Card>

      {isPending && (
        <div className="mt-6 flex flex-col items-center justify-center gap-2 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin text-primary"/>
            <p className="font-semibold">Analyzing Email...</p>
            <p className="text-sm">Our AI is hard at work. This may take a moment.</p>
        </div>
      )}

      {state?.data && !isPending && <ResultCard data={state.data} />}
    </div>
  );
}
