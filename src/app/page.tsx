
'use client';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // This is the root entry point. The client-side check is crucial 
    // for handling the final auth state once Firebase has initialized.
    if (!loading) {
      if (user) {
        // If user is authenticated, redirect to the main dashboard page.
        router.replace('/dashboard/analyzer');
      } else {
        // If user is not authenticated, redirect to the login page.
        router.replace('/login');
      }
    }
  }, [user, loading, router]);

  // Show a loading spinner while the auth state is being determined.
  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="ml-2">Loading...</p>
    </div>
  );
}
