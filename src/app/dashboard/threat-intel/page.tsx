
import { ThreatIntelClient } from '@/components/threat-intel-client';

export default function ThreatIntelPage() {
  return (
    <div className="w-full">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Threat Intelligence</h1>
        <p className="text-muted-foreground mt-1">
          Browse and search community-reported threats and submissions.
        </p>
      </div>
      <ThreatIntelClient />
    </div>
  );
}
