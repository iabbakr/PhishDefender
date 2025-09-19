"use client";

import { useActionState, useState } from "react";
import { AlertCircle, BarChart, Copy, Loader2, ShieldAlert, ShieldCheck, Siren } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { analyzeUrlAction, type UrlFormState } from "@/app/dashboard/analyzer/actions";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { UrlPreview } from "./url-preview";

const initialState: UrlFormState = {
  error: undefined,
  data: undefined,
};

function SubmitButton({ pending }: { pending: boolean }) {
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ShieldCheck className="mr-2 h-4 w-4" />}
      Analyze URL
    </Button>
  );
}

function ResultCard({ data }: { data: NonNullable<UrlFormState['data']> }) {
  const { toast } = useToast();
  
  const getRiskInfo = () => {
    switch (data.verdict) {
      case "phishing":
        return {
          variant: "destructive",
          icon: <ShieldAlert className="h-4 w-4" />,
          title: "Phishing Risk",
          description: "This URL shows strong indicators of a phishing attempt.",
        };
      case "suspicious":
        return {
          variant: "default",
          className: "bg-accent text-accent-foreground",
          icon: <Siren className="h-4 w-4" />,
          title: "Suspicious",
          description: "This URL has some unusual characteristics. Proceed with caution.",
        };
      default: // benign
        return {
          variant: "default",
          className: "bg-green-500/20 text-green-700",
          icon: <ShieldCheck className="h-4 w-4" />,
          title: "Benign",
          description: "This URL appears to be safe.",
        };
    }
  };

  const riskInfo = getRiskInfo();

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard!",
      description: text,
    });
  };

  return (
    <>
      <UrlPreview url={data.url} />
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart className="h-6 w-6" />
            Analysis Result
          </CardTitle>
          <CardDescription>Review the AI-generated analysis of the submitted URL.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-md border bg-muted p-3">
            <span className="truncate font-mono text-sm">{data.url}</span>
            <Button variant="ghost" size="icon" onClick={() => handleCopy(data.url)}>
              <Copy className="h-4 w-4" />
            </Button>
          </div>
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
    </>
  );
}

export function UrlAnalyzer() {
  const [state, formAction, isPendingTransition] = useActionState(analyzeUrlAction, initialState);
  const [currentUrl, setCurrentUrl] = useState<string | null>(null);

  const handleSubmit = (formData: FormData) => {
    // When a new submission happens, clear the previous result to avoid showing an old preview
    if (state.data) {
      state.data = undefined;
    }
    setCurrentUrl(formData.get('url') as string);
    formAction(formData);
  }

  return (
    <div className="mx-auto w-full max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>AI Phishing Detector</CardTitle>
          <CardDescription>Enter a URL to check if it's a phishing attempt.</CardDescription>
        </CardHeader>
        <form action={handleSubmit}>
          <CardContent>
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="url">URL</Label>
              <Input 
                type="text" 
                id="url" 
                name="url" 
                placeholder="example.com" 
                required 
              />
              {state.error && !isPendingTransition && (
                <p className="mt-1 text-sm text-destructive flex items-center gap-1"><AlertCircle className="h-4 w-4" />{state.error}</p>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <SubmitButton pending={isPendingTransition} />
          </CardFooter>
        </form>
      </Card>
      
      {isPendingTransition && (
        <div className="mt-6 flex flex-col items-center justify-center gap-2 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin text-primary"/>
            <p className="font-semibold">Analyzing URL...</p>
            <p className="text-sm">Our AI is hard at work. This may take a moment.</p>
        </div>
      )}

      {state.data && !isPendingTransition && <ResultCard data={state.data} />}
    </div>
  );
}
