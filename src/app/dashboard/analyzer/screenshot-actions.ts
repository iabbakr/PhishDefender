'use server';

import { z } from 'zod';

const schema = z.object({
  url: z.string().url(),
});

/**
 * Fetches a screenshot from ScreenshotOne and returns it as a Base64 Data URI.
 * This acts as a server-side proxy to avoid client-side CORS issues.
 */
export async function getScreenshotDataUri(
  urlToCapture: string
): Promise<{ dataUri?: string; error?: string }> {
  const validatedFields = schema.safeParse({
    url: urlToCapture,
  });

  if (!validatedFields.success) {
    return { error: 'Invalid URL format for screenshot.' };
  }

  const accessKey = process.env.SCREENSHOTONE_ACCESS_KEY;

  if (!accessKey) {
    console.error('SCREENSHOTONE_ACCESS_KEY is not set in environment variables.');
    return { error: 'Screenshot service is not configured.' };
  }

  const screenshotApiUrl = new URL('https://api.screenshotone.com/take');
  screenshotApiUrl.searchParams.set('access_key', accessKey);
  screenshotApiUrl.searchParams.set('url', validatedFields.data.url);
  screenshotApiUrl.searchParams.set('block_ads', 'true');
  screenshotApiUrl.searchParams.set('cache', 'true');
  screenshotApiUrl.searchParams.set('delay', '2'); // Add a delay for JS-heavy sites

  try {
    const response = await fetch(screenshotApiUrl.toString());

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      console.error('ScreenshotOne API Error:', response.status, errorBody);
      return { error: `Failed to capture screenshot. Status: ${response.status}` };
    }

    const imageBuffer = await response.arrayBuffer();
    const base64Image = Buffer.from(imageBuffer).toString('base64');
    const contentType = response.headers.get('content-type') || 'image/png';
    
    return { dataUri: `data:${contentType};base64,${base64Image}` };

  } catch (error) {
    console.error("Error fetching screenshot from ScreenshotOne:", error);
    return { error: "An unexpected error occurred while fetching the screenshot." };
  }
}
