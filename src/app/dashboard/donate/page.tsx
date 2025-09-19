
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, Star, Building, User } from 'lucide-react';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

function WhatsAppIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.894 11.892-1.99 0-3.902-.539-5.587-1.54l-6.162 1.688a.56.56 0 0 1-.663-.663.56.56 0 0 1-.031-.054zM8.228 6.589c.195-.315.42-.585.666-.826.242-.238.51-.45.795-.632.286-.184.591-.343.911-.475.32-.13.654-.234.996-.3.342-.069.689-.104 1.037-.104 2.273.003 4.417.886 6.012 2.482s2.478 3.738 2.481 6.011c-.002 1.109-.434 2.16-1.218 2.943-.783.784-1.834 1.216-2.942 1.218-2.274-.003-4.418-.886-6.013-2.481s-2.478-3.738-2.481-6.01c.001-1.11.435-2.161 1.218-2.944a4.116 4.116 0 0 1 .425-.403z"/>
        </svg>
    )
}

const reasonsToDonate = [
  {
    title: 'Keep the Platform Running',
    description: 'Your contribution helps cover the costs of our domain, hosting, and the powerful AI services that make our analysis possible, ensuring PhishDefender remains a free and accessible tool for everyone.',
  },
  {
    title: 'Reward Community Contributors',
    description: 'We believe in recognizing the effort of our community. Donations allow us to offer bounties and rewards to users who report verified, high-risk threats, encouraging active participation.',
  },
  {
    title: 'Support Development & Maintenance',
    description: 'Our developers work tirelessly to maintain the site and improve its features. Your support helps compensate them for their time and expertise.',
  },
  {
    title: 'Fuel Future Growth',
    description: 'We have big plans, including a dedicated mobile app, more advanced AI features, and a wider range of educational resources. Your donation is an investment in a safer digital future.',
  },
];

const supporters = [
    { name: 'Dr. IM Danjuma', level: 'Diamond Sponsor', type: 'individual' },
    { name: 'Elitehub Nigeria Marketplace', level: 'Gold Donor', type: 'organisation' },
    { name: 'Anonymous', level: 'Silver Donor', type: 'anonymous' },
]


export default function DonatePage() {
  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 sm:space-y-12 px-4">
      <div className="text-center pt-8">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">Support PhishDefender</h1>
        <p className="mt-4 max-w-2xl mx-auto text-base sm:text-lg text-muted-foreground">
          Your contribution helps us keep the internet safe for everyone.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl sm:text-3xl">Why Your Support Matters</CardTitle>
          <CardDescription>
            PhishDefender is a free service run by a dedicated team. Here's how your donation makes a difference:
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2">
            {reasonsToDonate.map((reason) => (
                <div key={reason.title} className="flex gap-4">
                    <Star className="h-6 w-6 text-accent mt-1 flex-shrink-0" />
                    <div>
                        <h3 className="font-semibold">{reason.title}</h3>
                        <p className="text-sm text-muted-foreground">{reason.description}</p>
                    </div>
                </div>
            ))}
        </CardContent>
      </Card>
      
      <div className="grid gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>How to Donate</CardTitle>
            <CardDescription>You can make a direct bank transfer to our account.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1 rounded-md border p-4 bg-secondary/50">
              <p className="text-sm font-medium text-muted-foreground">Bank Name</p>
              <p className="font-semibold">Zenith Bank</p>
            </div>
             <div className="space-y-1 rounded-md border p-4 bg-secondary/50">
              <p className="text-sm font-medium text-muted-foreground">Account Number</p>
              <p className="font-semibold text-lg tracking-wider">2459490780</p>
            </div>
             <div className="space-y-1 rounded-md border p-4 bg-secondary/50">
              <p className="text-sm font-medium text-muted-foreground">Account Name</p>
              <p className="font-semibold">Abubakar Ibrahim</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Become a Sponsor</CardTitle>
            <CardDescription>
              For corporate sponsorships or to be featured on our supporters list, please get in touch with our admin.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Button asChild size="lg" className="bg-[#25D366] hover:bg-[#25D366]/90 text-white">
                <a href="https://wa.me/2349048883488" target="_blank" rel="noopener noreferrer">
                    <WhatsAppIcon />
                    Contact via WhatsApp
                </a>
            </Button>
            <Button asChild size="lg" variant="secondary">
                <a href="mailto:devabu01@gmail.com">
                    <Mail />
                    Send an Email
                </a>
            </Button>
          </CardContent>
        </Card>
      </div>

       <Card>
        <CardHeader>
          <CardTitle className="text-2xl sm:text-3xl">Our Supporters</CardTitle>
          <CardDescription>A huge thank you to our sponsors and top donors who make our work possible.</CardDescription>
        </CardHeader>
        <CardContent>
            <ul className="space-y-4">
                {supporters.map((supporter) => (
                    <li key={supporter.name} className="flex items-center gap-4 p-3 rounded-md bg-secondary/50 border">
                        <Avatar className="h-12 w-12">
                           <AvatarFallback className="text-xl">
                                {supporter.type === 'organisation' && <Building />}
                                {supporter.type === 'individual' && <User />}
                                {supporter.type === 'anonymous' && <User />}
                           </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                            <p className="font-semibold">{supporter.name}</p>
                            <p className="text-sm text-muted-foreground">{supporter.level}</p>
                        </div>
                    </li>
                ))}
            </ul>
        </CardContent>
       </Card>
    </div>
  );
}

    