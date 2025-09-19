
'use client';

import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useActionState } from 'react';
import { makeAdminAction, type AdminFormState } from './actions';
import { useToast } from '@/hooks/use-toast';
import { AlertCircle, Loader2, ShieldAlert } from 'lucide-react';
import { useEffect } from 'react';

const initialState: AdminFormState = {};

function SubmitButton({ pending }: { pending: boolean }) {
  return (
    <Button type="submit" disabled={pending}>
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ShieldAlert className="mr-2 h-4 w-4" />}
      Make Admin
    </Button>
  );
}

export default function AdminPage() {
  const { isAdmin, loading } = useAuth();
  const { toast } = useToast();
  const [state, formAction, isPending] = useActionState(makeAdminAction, initialState);

  useEffect(() => {
    if (state.error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: state.error,
      });
    }
    if (state.message) {
      toast({
        title: 'Success',
        description: state.message,
      });
    }
  }, [state, toast]);

  if (loading) {
    return (
      <div className="flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="w-full max-w-4xl mx-auto space-y-6">
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <p>You do not have permission to view this page.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Admin Panel</h1>
        <p className="text-muted-foreground mt-1">Manage users and application settings.</p>
      </div>

      <form action={formAction}>
        <Card>
          <CardHeader>
            <CardTitle>Grant Admin Privileges</CardTitle>
            <CardDescription>Enter the UID of a user to grant them admin rights.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="uid">User ID (UID)</Label>
              <Input id="uid" name="uid" placeholder="Enter user UID" defaultValue="" />
            </div>
            {state?.error && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {state.error}
              </p>
            )}
          </CardContent>
          <CardFooter>
            <SubmitButton pending={isPending} />
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
