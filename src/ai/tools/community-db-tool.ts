'use server';
/**
 * @fileOverview A Genkit tool for checking if a URL exists in the community submissions database.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {collection, query, where, getDocs} from 'firebase/firestore';
import {db} from '@/lib/firebase';

const CommunityDbInputSchema = z.object({
  url: z.string().url().describe('The URL to check in the database.'),
});

const CommunityDbOutputSchema = z.object({
  isReported: z
    .boolean()
    .describe(
      'Whether the URL was found in the community submissions database.'
    ),
  status: z
    .string()
    .optional()
    .describe(
      "The status of the report (e.g., 'Verified', 'Pending') if found."
    ),
});

export const communityDbTool = ai.defineTool(
  {
    name: 'communityDatabaseCheck',
    description:
      'Checks if a URL has been reported by the community. Use this tool first before other analysis.',
    inputSchema: CommunityDbInputSchema,
    outputSchema: CommunityDbOutputSchema,
  },
  async ({url}) => {
    try {
      const submissionsRef = collection(db, 'communitySubmissions');
      const q = query(submissionsRef, where('url', '==', url));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        return {isReported: false};
      } else {
        // Assuming the first match is the one we care about
        const report = querySnapshot.docs[0].data();
        return {
          isReported: true,
          status: report.status,
        };
      }
    } catch (error) {
      console.error('Error checking community database:', error);
      // In case of a database error, we'll assume it's not reported
      // to allow other tools to proceed with the analysis.
      return {isReported: false};
    }
  }
);
