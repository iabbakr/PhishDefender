import { ShieldHalf } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2 text-primary", className)}>
      <ShieldHalf className="h-7 w-7" />
      <span className="text-xl font-bold">PhishDefender</span>
    </div>
  );
}
