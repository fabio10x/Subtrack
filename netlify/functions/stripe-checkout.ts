import { Handler } from '@netlify/functions';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { getClerkUserId } from './_clerk';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2026-07-29.dahlia' as any,
});

const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  // Identity comes from the verified Clerk token, never from the request body
  const userId = await getClerkUserId(event.headers['authorization']);
  if (!userId) {
    return { statusCode: 401, body: JSON.stringify({ error: 'Unauthorized' }) };
  }

  try {
    const { data: profile } = await supabaseAdmin
      .from('subtrack_profiles').select('email').eq('id', userId).single();
    const userEmail = profile?.email;

    if (!process.env.STRIPE_SECRET_KEY) {
      return {
        statusCode: 200,
        body: JSON.stringify({
          simulated: true,
          message: 'Stripe Test Checkout Mode Active',
          checkoutUrl: '#simulated-checkout',
        }),
      };
    }

    const appUrl = process.env.VITE_APP_URL || process.env.URL || 'http://localhost:3000';

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      billing_address_collection: 'auto',
      customer_email: userEmail || undefined,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'SubTrack Pro Subscription',
              description: 'Unlimited subscriptions, 3-day renewal email alerts, CSV export & smart cost savings optimizer',
            },
            unit_amount: 500, // $5.00
            recurring: {
              interval: 'month',
            },
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${appUrl}?upgrade=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}?upgrade=cancelled`,
      metadata: {
        userId,
      },
    });

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ checkoutUrl: session.url, sessionId: session.id }),
    };
  } catch (error: any) {
    console.error('Stripe session creation error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
