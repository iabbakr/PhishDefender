
import { ThreatIntelSubmit } from "@/components/threat-intel-submit";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Send, MessageSquare } from "lucide-react";

// Basic SVG Icon for Telegram as it's not in lucide-react
function TelegramIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
            <path d="M9.78 18.65l.28-4.23l7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.3L3.64 12c-.88-.25-.89-1.37.2-1.64l16.56-6.1c.85-.32 1.62.26 1.39 1.43L18.46 21.1c-.24 1.11-1.2 1.34-1.87.82l-4.25-3.41l-2.02 1.95c-.23.23-.44.44-.7.66c-.3.26-.65.41-1.04.41z"/>
        </svg>
    )
}

function WhatsAppIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.894 11.892-1.99 0-3.902-.539-5.587-1.54l-6.162 1.688a.56.56 0 0 1-.663-.663.56.56 0 0 1-.031-.054zM8.228 6.589c.195-.315.42-.585.666-.826.242-.238.51-.45.795-.632.286-.184.591-.343.911-.475.32-.13.654-.234.996-.3.342-.069.689-.104 1.037-.104 2.273.003 4.417.886 6.012 2.482s2.478 3.738 2.481 6.011c-.002 1.109-.434 2.16-1.218 2.943-.783.784-1.834 1.216-2.942 1.218-2.274-.003-4.418-.886-6.013-2.481s-2.478-3.738-2.481-6.01c.001-1.11.435-2.161 1.218-2.944a4.116 4.116 0 0 1 .425-.403z"/>
        </svg>
    )
}

export default function CommunityPage() {
  return (
    <div className="w-full max-w-2xl mx-auto space-y-8">
       <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Community</h1>
        <p className="text-muted-foreground mt-1">
          Engage with fellow cybersecurity enthusiasts and help protect the community.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Join the Community</CardTitle>
          <CardDescription>Connect with us on WhatsApp and Telegram to stay updated and share insights.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Button asChild size="lg" className="bg-[#25D366] hover:bg-[#25D366]/90 text-white">
                <a href="#" target="_blank" rel="noopener noreferrer">
                    <WhatsAppIcon />
                    Join on WhatsApp
                </a>
            </Button>
            <Button asChild size="lg" className="bg-[#2AABEE] hover:bg-[#2AABEE]/90 text-white">
                <a href="#" target="_blank" rel="noopener noreferrer">
                    <TelegramIcon />
                    Join on Telegram
                </a>
            </Button>
        </CardContent>
      </Card>
      
      <ThreatIntelSubmit />
    </div>
  );
}
