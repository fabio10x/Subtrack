import { Handler } from '@netlify/functions';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-01-27.acacia' as any,
});

// Admin client to look up stripe_customer_id without RLS restrictions
const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || ''
);

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { userId } = JSON.parse(event.body || '{}');

    if (!userId) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Missing userId' }) };
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      // Simulated mode for local dev without Stripe keys
      return {
        statusCode: 200,
        body: JSON.stringify({
          simulated: true,
          message: 'Stripe Portal Simulated',
          portalUrl: '#simulated-portal',
        }),
      };
    }

    // Look up the user's Stripe customer ID from Supabase
    const { data: profile, error } = await supabaseAdmin
      .from('subtrack_profiles')
      .select('stripe_customer_id')
      .eq('id', userId)
      .single();

    if (error || !profile?.stripe_customer_id) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'No Stripe customer found for this user. Have they completed a checkout?' }),
      };
    }

    const appUrl = process.env.VITE_APP_URL || process.env.URL || 'http://localhost:3000';

    // Create a Stripe billing portal session
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      return_url: `${appUrl}#dashboard`,
    });

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ portalUrl: portalSession.url }),
    };
  } catch (error: any) {
    console.error('Stripe portal session error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
