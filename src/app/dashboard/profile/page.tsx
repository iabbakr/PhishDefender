
'use client';

import { useAuth } from '@/hooks/use-auth';
import { db } from '@/lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, User, HelpCircle, Star, PenSquare, UserCog } from 'lucide-react';
import { getRank, type Rank, ranks } from '@/lib/ranks';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';

type UserProfile = {
  username?: string;
  email?: string;
  displayName?: string;
  photoURL?: string;
  quizScores?: { [key: string]: number };
  contributions?: {
    url: number;
    email: number;
    sms: number;
  }
}

export default function ProfilePage() {
  const { user, isAdmin } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [rank, setRank] = useState<Rank | null>(null);

  useEffect(() => {
    if (user) {
      const unsub = onSnapshot(doc(db, "users", user.uid), (doc) => {
        if (doc.exists()) {
          const data = doc.data() as UserProfile;
          setProfile(data);
          setRank(getRank(data.quizScores ?? {}, data.contributions ?? { url: 0, email: 0, sms: 0 }));
        } else {
          console.log("No such document!");
        }
        setLoading(false);
      });
      return () => unsub();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!profile || !user) {
    return <div>User profile not found.</div>;
  }

  const totalScore = profile.quizScores ? Object.values(profile.quizScores).reduce((sum, score) => sum + score, 0) : 0;
  const totalContributions = profile.contributions ? Object.values(profile.contributions).reduce((sum, count) => sum + count, 0) : 0;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Your Profile</h1>
        <p className="text-muted-foreground mt-1">
          View your account details, rank, and progress.
        </p>
      </div>

        <Card>
            <CardHeader className="flex flex-col items-center justify-center gap-4 border-b p-6 sm:flex-row sm:justify-start">
                <Avatar className="w-24 h-24 border-4 border-primary">
                    <AvatarImage src={profile.photoURL ?? ''} />
                    <AvatarFallback><User className="h-12 w-12" /></AvatarFallback>
                </Avatar>
                <div className="text-center sm:text-left">
                    <CardTitle className="text-2xl">{profile.displayName}</CardTitle>
                    <CardDescription>@{profile.username}</CardDescription>
                    {isAdmin && <Badge variant="destructive" className="mt-2">Administrator</Badge>}
                </div>
            </CardHeader>
            <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Rank and Stats */}
                    <div className="md:col-span-1 space-y-6">
                        <div className="space-y-2">
                             <Label className="flex items-center gap-2 text-muted-foreground">
                                <UserCog className="h-4 w-4" />
                                Community Rank
                            </Label>
                            {rank && (
                                <div className="flex items-center gap-2">
                                <Badge variant="default" className="text-sm sm:text-base gap-2 bg-yellow-400 text-yellow-900 hover:bg-yellow-400/90">
                                    {rank.icon}
                                    {rank.title}
                                </Badge>
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-6 w-6">
                                            <HelpCircle className="h-4 w-4" />
                                            <span className="sr-only">View rank details</span>
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="sm:max-w-[425px]">
                                        <DialogHeader>
                                            <DialogTitle>Community Ranks</DialogTitle>
                                            <DialogDescription>
                                                Level up your rank by passing quizzes and contributing reports.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <div className="space-y-4 py-4">
                                            {ranks.map((r) => (
                                                <div key={r.level} className="flex items-center gap-4">
                                                    <div className="w-8 h-8 flex items-center justify-center text-primary">{r.icon}</div>
                                                    <div className="flex-1">
                                                        <p className="font-semibold">{r.title}</p>
                                                        <p className="text-xs text-muted-foreground">
                                                        Score: {r.minScore} | Contributions: {r.minContributions}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </DialogContent>
                                </Dialog>
                                </div>
                            )}
                        </div>
                        <div className="space-y-2">
                             <Label className="flex items-center gap-2 text-muted-foreground">
                                <Star className="h-4 w-4" />
                                Total Score
                            </Label>
                             <p className="text-2xl font-bold">{totalScore}</p>
                        </div>
                        <div className="space-y-2">
                            <Label className="flex items-center gap-2 text-muted-foreground">
                                <PenSquare className="h-4 w-4" />
                                Contributions
                            </Label>
                            <p className="text-2xl font-bold">{totalContributions}</p>
                        </div>
                    </div>
                     {/* Account Details */}
                    <div className="md:col-span-2 space-y-4 md:border-l md:pl-6">
                        <h3 className="font-semibold">Account Details</h3>
                         <div className="space-y-2">
                            <Label htmlFor="username">Username</Label>
                            <Input id="username" name="username" defaultValue={profile.username} disabled />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" name="email" type="email" defaultValue={profile.email ?? ''} disabled />
                        </div>
                        <p className="text-xs text-muted-foreground pt-2">Account details cannot be changed.</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    </div>
  );
}
