"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { getScreenshotDataUri } from "@/app/dashboard/analyzer/screenshot-actions";
import { AlertCircle, Camera, Loader2 } from "lucide-react";

export function UrlPreview({ url }: { url: string }) {
  const [screenshotDataUri, setScreenshotDataUri] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (url) {
      setLoading(true);
      setError(null);
      getScreenshotDataUri(url)
        .then(result => {
          if (result.error) {
            setError(result.error);
          } else {
            setScreenshotDataUri(result.dataUri || null);
          }
        })
        .catch(err => {
            console.error("Failed to get screenshot data uri", err);
            setError("An unexpected error occurred while fetching the screenshot.");
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [url]);

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <Camera />
            Website Preview
        </CardTitle>
        <CardDescription>A snapshot of the submitted URL for visual verification.</CardDescription>
      </CardHeader>
      <CardContent className="flex items-center justify-center aspect-video bg-muted/50 rounded-b-lg p-2">
        {loading && <Loader2 className="h-8 w-8 animate-spin text-primary" />}
        {!loading && error && (
          <div className="text-destructive flex flex-col items-center gap-2">
            <AlertCircle className="h-8 w-8" />
            <p className="font-semibold">Preview Unavailable</p>
            <p className="text-sm text-center">Failed to load screenshot image. The site may be unreachable or blocking screenshots.</p>
          </div>
        )}
        {!loading && !error && screenshotDataUri && (
          <Image
            src={screenshotDataUri}
            alt={`Screenshot of ${url}`}
            width={1200}
            height={675}
            className="rounded-md border object-contain"
          />
        )}
      </CardContent>
    </Card>
  );
}
