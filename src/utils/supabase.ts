import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase URL or Anon Key is missing. Check your .env file.');
}

// Clerk session token, set by AuthBridge (see useAuth). Supabase RLS reads its "sub" claim.
let clerkTokenGetter: (() => Promise<string | null>) | null = null;

export function setSupabaseTokenGetter(getter: (() => Promise<string | null>) | null) {
  clerkTokenGetter = getter;
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  accessToken: async () => (clerkTokenGetter ? await clerkTokenGetter() : null),
});
