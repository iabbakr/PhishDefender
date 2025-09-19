
'use server';

import { setAdminClaim } from '@/ai/tools/admin-tool';
import { z } from 'zod';

const adminSchema = z.object({
  uid: z.string().min(1, 'UID is required.'),
});

export type AdminFormState = {
  error?: string;
  message?: string;
};

export async function makeAdminAction(prevState: AdminFormState, formData: FormData): Promise<AdminFormState> {
  const validatedFields = adminSchema.safeParse({
    uid: formData.get('uid'),
  });

  if (!validatedFields.success) {
    return {
      error: validatedFields.error.flatten().fieldErrors.uid?.[0],
    };
  }

  try {
    const result = await setAdminClaim(validatedFields.data.uid);
    if (result.success) {
        return { message: result.message };
    } else {
        return { error: result.message };
    }
  } catch (e) {
    console.error(e);
    const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
    return { error: 'Failed to set admin claim: ' + errorMessage };
  }
}
