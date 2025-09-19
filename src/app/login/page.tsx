'use client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';
import { Logo } from '@/components/logo';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';

function GoogleIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-1.5c-1.38 0-1.5.62-1.5 1.5V12h3l-.5 3h-2.5v6.8c4.56-.93 8-4.96 8-9.8z" />
        </svg>
    )
}

export default function LoginPage() {
  const { signInWithGoogle, signInWithEmail, signUpWithEmail } = useAuth();
  const { toast } = useToast();
  const [isLoginView, setIsLoginView] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAuthResult = (error?: string) => {
    setLoading(false);
    if (error) {
        toast({
            variant: "destructive",
            title: "Authentication Error",
            description: error,
        });
    } else {
        toast({
            title: "Success!",
            description: isLoginView ? "You have successfully signed in." : "Your account has been created.",
        });
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const result = isLoginView 
        ? await signInWithEmail(email, password)
        : await signUpWithEmail(email, password);
    handleAuthResult(result.error);
  };
  
  const handleGoogleSignIn = async () => {
    setLoading(true);
    const result = await signInWithGoogle();
    handleAuthResult(result.error);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
            <div className='flex justify-center mb-4'>
                <Logo />
            </div>
          <CardTitle>{isLoginView ? 'Welcome Back' : 'Create an Account'}</CardTitle>
          <CardDescription>
            {isLoginView ? 'Sign in to continue to PhishDefender.' : 'Sign up to start protecting yourself.'}
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="m@example.com" required value={email} onChange={e => setEmail(e.target.value)} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input id="password" type="password" required value={password} onChange={e => setPassword(e.target.value)} />
                </div>
                 <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Loading...' : (isLoginView ? 'Sign In' : 'Sign Up')}
                </Button>
            </CardContent>
        </form>
        <CardFooter className="flex flex-col gap-4">
            <div className="relative w-full">
                <Separator />
                <span className="absolute left-1/2 -translate-x-1/2 -top-3 bg-card px-2 text-xs text-muted-foreground">OR</span>
            </div>
            <Button onClick={handleGoogleSignIn} className="w-full" variant="outline" disabled={loading}>
                <GoogleIcon />
                Continue with Google
            </Button>
            <Button variant="link" size="sm" onClick={() => setIsLoginView(!isLoginView)}>
              {isLoginView ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
            </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
