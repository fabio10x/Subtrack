import { Handler } from '@netlify/functions';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-01-27.acacia' as any,
});

// IMPORTANT: We use the SERVICE_ROLE_KEY to bypass Row Level Security so we can update user profiles from the webhook
const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || ''
);

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const sig = event.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let stripeEvent: Stripe.Event;

  if (process.env.STRIPE_SECRET_KEY && webhookSecret && sig) {
    try {
      stripeEvent = stripe.webhooks.constructEvent(event.body || '', sig, webhookSecret);
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      return { statusCode: 400, body: `Webhook Error: ${err.message}` };
    }
  } else {
    // If not configured properly or in simulated mode, parse manually
    stripeEvent = JSON.parse(event.body || '{}');
  }

  try {
    switch (stripeEvent.type) {
      case 'checkout.session.completed': {
        const session = stripeEvent.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        
        if (userId) {
          await supabaseAdmin.from('subtrack_profiles').update({
            tier: 'pro',
            stripe_customer_id: session.customer as string,
            stripe_subscription_id: session.subscription as string,
          }).eq('id', userId);

          // Create a notification for the user
          await supabaseAdmin.from('subtrack_notifications').insert({
            user_id: userId,
            subscription_name: 'SubTrack Pro',
            type: 'pro_upgrade',
            title: '🎉 Upgraded to SubTrack Pro!',
            message: 'You now have unlimited subscriptions tracking, CSV exports, and automated 3-day email renewal alerts.',
            amount: 5.00,
            currency: 'USD',
            days_remaining: 30,
            status: 'sent',
            read: false,
          });
        }
        break;
      }
      
      case 'customer.subscription.deleted': {
        const subscription = stripeEvent.data.object as Stripe.Subscription;
        
        // Find the user with this subscription ID and downgrade them
        await supabaseAdmin.from('subtrack_profiles').update({
          tier: 'free',
          email_alerts_enabled: false
        }).eq('stripe_subscription_id', subscription.id);
        
        break;
      }
    }

    return { statusCode: 200, body: JSON.stringify({ received: true }) };
  } catch (err: any) {
    console.error('Error handling webhook event:', err);
    return { statusCode: 500, body: JSON.stringify({ error: 'Internal Server Error' }) };
  }
};
