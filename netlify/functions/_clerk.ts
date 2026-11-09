import { verifyToken } from '@clerk/backend';

// Verifies a Clerk session token from "Authorization: Bearer <token>".
// Returns the Clerk user ID (the same ID stored in subtrack_profiles.id), or null if invalid.
export async function getClerkUserId(authHeader: string | undefined): Promise<string | null> {
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.slice('Bearer '.length).trim();
  const secretKey = process.env.CLERK_SECRET_KEY;
  if (!token || !secretKey) return null;
  try {
    const payload = await verifyToken(token, { secretKey });
    return typeof payload.sub === 'string' ? payload.sub : null;
  } catch (err: any) {
    console.error('Clerk token verification failed:', err?.message || err);
    return null;
  }
}
