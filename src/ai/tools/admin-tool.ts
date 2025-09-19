
'use server';
/**
 * @fileOverview An admin tool for setting custom claims on users.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin SDK if not already initialized
if (!admin.apps.length) {
    if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
        const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
    } else {
        // Fallback for environments where GOOGLE_APPLICATION_CREDENTIALS is set
        admin.initializeApp();
    }
}

const SetAdminClaimInputSchema = z.object({
  uid: z.string().describe('The UID of the user to make an admin.'),
});

const SetAdminClaimOutputSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});

export const setAdminClaimFlow = ai.defineFlow(
  {
    name: 'setAdminClaimFlow',
    inputSchema: SetAdminClaimInputSchema,
    outputSchema: SetAdminClaimOutputSchema,
  },
  async ({ uid }) => {
    try {
      await admin.auth().setCustomUserClaims(uid, { admin: true });
      return {
        success: true,
        message: `Successfully set admin claim for user ${uid}.`,
      };
    } catch (error: any) {
      console.error('Error setting custom claim:', error);
      return {
        success: false,
        message: error.message || 'An unknown error occurred.',
      };
    }
  }
);

export async function setAdminClaim(
    uid: string
): Promise<z.infer<typeof SetAdminClaimOutputSchema>> {
  return setAdminClaimFlow({ uid });
}
