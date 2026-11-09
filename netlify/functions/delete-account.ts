import { Handler } from '@netlify/functions';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { createClerkClient } from '@clerk/backend';
import { getClerkUserId } from './_clerk';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2026-07-29.dahlia' as any,
});

// Admin client: bypasses RLS to read billing IDs and delete the profile
const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY || '' });

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const userId = await getClerkUserId(event.headers['authorization']);
  if (!userId) {
    return { statusCode: 401, body: JSON.stringify({ error: 'Unauthorized' }) };
  }

  try {
    // Stop billing BEFORE deleting the account, otherwise the customer keeps being charged.
    const { data: profile, error: profileErr } = await supabaseAdmin
      .from('subtrack_profiles')
      .select('stripe_customer_id, stripe_subscription_id')
      .eq('id', userId)
      .maybeSingle();
    if (profileErr) throw profileErr;

    if (process.env.STRIPE_SECRET_KEY) {
      if (profile?.stripe_subscription_id) {
        try {
          await stripe.subscriptions.cancel(profile.stripe_subscription_id);
        } catch (err: any) {
          // Already canceled is fine; anything else must stop the deletion
          if (err?.code !== 'resource_missing') throw err;
        }
      }
      if (profile?.stripe_customer_id) {
        try {
          await stripe.customers.del(profile.stripe_customer_id);
        } catch (err: any) {
          if (err?.code !== 'resource_missing') throw err;
        }
      }
    }

    // Remove the app data (subscriptions and notifications cascade from the profile row)
    const { error: profileDeleteErr } = await supabaseAdmin.from('subtrack_profiles').delete().eq('id', userId);
    if (profileDeleteErr) throw profileDeleteErr;

    // Delete the identity in Clerk so the user can no longer sign in
    await clerk.users.deleteUser(userId);

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: true, message: 'Account deleted successfully' }),
    };
  } catch (error: any) {
    console.error('Account deletion error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
