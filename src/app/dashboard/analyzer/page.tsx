
import { EmailAnalyzer } from "@/components/email-analyzer";
import { SmsAnalyzer } from "@/components/sms-analyzer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UrlAnalyzer } from "@/components/url-analyzer";
import { FileText, MessageSquare, Link2 } from "lucide-react";

export default function AnalyzerPage() {
  return (
    <div className="w-full">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Threat Analyzer</h1>
        <p className="text-muted-foreground mt-1">
          Analyze URLs, emails, or SMS messages for potential threats using AI.
        </p>
      </div>

      <Tabs defaultValue="url" className="w-full">
        <TabsList className="grid w-full grid-cols-3 h-auto sm:h-10">
          <TabsTrigger value="url" className="border data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"><Link2 className="mr-2 h-4 w-4"/>URL</TabsTrigger>
          <TabsTrigger value="email" className="border data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"><FileText className="mr-2 h-4 w-4"/>Email</TabsTrigger>
          <TabsTrigger value="sms" className="border data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"><MessageSquare className="mr-2 h-4 w-4"/>SMS</TabsTrigger>
        </TabsList>
        <TabsContent value="url" className="mt-6">
          <UrlAnalyzer />
        </TabsContent>
        <TabsContent value="email" className="mt-6">
          <EmailAnalyzer />
        </TabsContent>
        <TabsContent value="sms" className="mt-6">
          <SmsAnalyzer />
        </TabsContent>
      </Tabs>
    </div>
  );
}
