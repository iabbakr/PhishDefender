
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  BookOpen,
  FileQuestion,
  ShieldCheck,
  Users,
  User,
  LogOut,
  Database,
  DollarSign,
  ShieldAlert,
  Gift,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/logo';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/use-auth';
import { Protected } from '@/components/protected';
import { Separator } from '@/components/ui/separator';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
  SidebarFooter,
} from '@/components/ui/sidebar';

const navItems = [
  { href: '/dashboard/analyzer', icon: ShieldCheck, label: 'Analyzer' },
  { href: '/dashboard/learning-hub', icon: BookOpen, label: 'Learning Hub' },
  { href: '/dashboard/quiz', icon: FileQuestion, label: 'Knowledge Quiz' },
  { href: '/dashboard/threat-intel', icon: Database, label: 'Threat Intel' },
  { href: '/dashboard/community', icon: Users, label: 'Community' },
  { href: '/dashboard/donate', icon: DollarSign, label: 'Donate' },
];

const adminNavItems = [
  { href: '/dashboard/admin', icon: ShieldAlert, label: 'Admin Panel' },
];

function WhatsAppIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.894 11.892-1.99 0-3.902-.539-5.587-1.54l-6.162 1.688a.56.56 0 0 1-.663-.663.56.56 0 0 1-.031-.054zM8.228 6.589c.195-.315.42-.585.666-.826.242-.238.51-.45.795-.632.286-.184.591-.343.911-.475.32-.13.654-.234.996-.3.342-.069.689-.104 1.037-.104 2.273.003 4.417.886 6.012 2.482s2.478 3.738 2.481 6.011c-.002 1.109-.434 2.16-1.218 2.943-.783.784-1.834 1.216-2.942 1.218-2.274-.003-4.418-.886-6.013-2.481s-2.478-3.738-2.481-6.01c.001-1.11.435-2.161 1.218-2.944a4.116 4.116 0 0 1 .425-.403z"/>
    </svg>
  );
}

function TelegramIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M9.78 18.65l.28-4.23l7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.3L3.64 12c-.88-.25-.89-1.37.2-1.64l16.56-6.1c.85-.32 1.62.26 1.39 1.43L18.46 21.1c-.24 1.11-1.2 1.34-1.87.82l-4.25-3.41l-2.02 1.95c-.23.23-.44.44-.7.66c-.3.26-.65.41-1.04.41z"/>
    </svg>
  );
}

function DiscordIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.317 4.36981C18.8615 3.32435 17.2052 2.56146 15.4142 2.08516C15.195 2.45663 14.9312 2.94305 14.721 3.42947C12.8953 2.97762 11.0124 2.97762 9.18671 3.42947C8.97655 2.94305 8.71273 2.45663 8.49353 2.08516C6.70256 2.56146 5.04629 3.32435 3.59083 4.36981C0.925424 8.05929 0.231903 11.6953 1.18531 15.19C2.90989 16.5684 4.80854 17.5195 6.76435 18.067C7.11822 17.5806 7.42751 17.0622 7.69211 16.5119C7.03716 16.2026 6.41372 15.8311 5.82179 15.3978C6.01968 15.2721 6.20526 15.1373 6.37852 14.9934C9.59317 17.0333 14.2882 17.0333 17.5029 14.9934C17.6761 15.1373 17.8617 15.2721 18.0596 15.3978C17.4677 15.8311 16.8442 16.2026 16.1893 16.5119C16.4539 17.0622 16.7632 17.5806 17.1171 18.067C19.0729 17.5195 20.9715 16.5684 22.6961 15.19C23.7228 11.4583 22.967 7.77884 20.317 4.36981ZM8.24376 12.638C7.4539 12.638 6.81534 11.9681 6.81534 11.139C6.81534 10.31 7.4539 9.64003 8.24376 9.64003C9.03362 9.64003 9.67218 10.31 9.67218 11.139C9.67218 11.9681 9.03362 12.638 8.24376 12.638ZM15.6422 12.638C14.8523 12.638 14.2138 11.9681 14.2138 11.139C14.2138 10.31 14.8523 9.64003 15.6422 9.64003C16.432 9.64003 17.0706 10.31 17.0706 11.139C17.0706 11.9681 16.432 12.638 15.6422 12.638Z"/>
    </svg>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, signOut, isAdmin } = useAuth();

  return (
    <Protected>
      <SidebarProvider>
        <Sidebar collapsible="icon">
          <SidebarHeader>
            <Logo />
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.label}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname.startsWith(item.href)}
                    tooltip={item.label}
                  >
                    <Link href={item.href}>
                      <item.icon />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              {isAdmin && (
                <>
                  <SidebarMenu>
                    <Separator className="my-2" />
                  </SidebarMenu>
                  {adminNavItems.map((item) => (
                    <SidebarMenuItem key={item.label}>
                      <SidebarMenuButton
                        asChild
                        isActive={pathname.startsWith(item.href)}
                        tooltip={item.label}
                      >
                        <Link href={item.href}>
                          <item.icon />
                          <span>{item.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </>
              )}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter>
            <SidebarTrigger />
          </SidebarFooter>
        </Sidebar>
        <SidebarInset>
          <header className="flex h-14 items-center justify-between gap-4 border-b bg-card px-4 lg:h-[60px] lg:px-6">
            <SidebarTrigger className="md:hidden"/>
            <div className="flex flex-1 justify-end">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="secondary" size="icon" className="rounded-full">
                      <Avatar>
                        <AvatarImage src={user?.photoURL ?? undefined} alt={user?.displayName ?? ''} />
                        <AvatarFallback><User /></AvatarFallback>
                      </Avatar>
                      <span className="sr-only">Toggle user menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>{user?.displayName || user?.email}</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/profile">
                        <User className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={signOut}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
            </div>
          </header>
          <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
            {children}
          </main>
          <footer className="mt-auto border-t bg-background p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              <div className="flex flex-col gap-2">
                <h3 className="font-semibold text-foreground">Join Our Community</h3>
                <div className="flex items-center gap-4">
                  <Button asChild variant="outline" size="icon">
                    <a href="#" target="_blank" rel="noopener noreferrer"><WhatsAppIcon /></a>
                  </Button>
                  <Button asChild variant="outline" size="icon">
                    <a href="#" target="_blank" rel="noopener noreferrer"><TelegramIcon /></a>
                  </Button>
                  <Button asChild variant="outline" size="icon">
                    <a href="#" target="_blank" rel="noopener noreferrer"><DiscordIcon /></a>
                  </Button>
                </div>
              </div>
              <div className="md:col-span-2 flex items-center gap-4">
                <div className="flex-shrink-0">
                  <Image src="/nda_badge.jpg" alt="School Badge" width={80} height={80} className="rounded-full" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">A School Project</h3>
                  <p className="text-xs text-muted-foreground mt-2">
                    <strong>Design and Implementations of AI-Powered Phishing URL Detector with User Education Dashboard.</strong>
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    by <strong>Abubakar ibrahim</strong> (NDAPGS/FMSIS/CBS012024/3660)
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Project Supervisor: <strong>Dr. IM Danjuma</strong>
                  </p>
                </div>
              </div>
            </div>
            <Separator className="my-6" />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <p>&copy; {new Date().getFullYear()} PhishDefender. All Rights Reserved.</p>
              <Logo className="text-sm" />
            </div>
          </footer>
        </SidebarInset>
      </SidebarProvider>
    </Protected>
  );
}
