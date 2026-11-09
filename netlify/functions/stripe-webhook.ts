import { Handler } from '@netlify/functions';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2026-07-29.dahlia' as any,
});

// IMPORTANT: We use the SERVICE_ROLE_KEY to bypass Row Level Security so we can update user profiles from the webhook
const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || ''
);

// email_recipient is NOT NULL in subtrack_notifications, so every notification needs it
async function getUserEmail(userId: string): Promise<string> {
  const { data } = await supabaseAdmin.from('subtrack_profiles').select('email').eq('id', userId).single();
  return data?.email || 'unknown@subtrack.local';
}

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const sig = event.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  // Never accept unsigned events: without a verified signature anyone could forge an upgrade.
  if (!webhookSecret || !sig) {
    console.error('Webhook rejected: missing STRIPE_WEBHOOK_SECRET or stripe-signature header');
    return { statusCode: 400, body: 'Webhook Error: signature verification unavailable' };
  }

  let stripeEvent: Stripe.Event;
  try {
    stripeEvent = stripe.webhooks.constructEvent(event.body || '', sig, webhookSecret);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return { statusCode: 400, body: `Webhook Error: ${err.message}` };
  }

  try {
    switch (stripeEvent.type) {
      case 'checkout.session.completed': {
        const session = stripeEvent.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;

        // Only upgrade once the payment has actually cleared (e.g. not for unpaid async methods)
        if (session.payment_status !== 'paid') {
          console.warn(`Checkout session ${session.id} not paid (status: ${session.payment_status}); skipping upgrade`);
          break;
        }
        
        if (userId) {
          const email = await getUserEmail(userId);

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
            email_recipient: email,
            read: false,
          });
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = stripeEvent.data.object as Stripe.Subscription;

        // Keep Pro access in sync with the subscription state.
        // 'past_due' keeps access while Stripe retries payment (grace period).
        const activeStatuses = ['active', 'trialing', 'past_due'];
        const isActive = activeStatuses.includes(subscription.status);

        await supabaseAdmin.from('subtrack_profiles').update({
          tier: isActive ? 'pro' : 'free',
          ...(isActive ? {} : { email_alerts_enabled: false }),
        }).eq('stripe_subscription_id', subscription.id);

        break;
      }

      case 'invoice.payment_failed': {
        const invoice = stripeEvent.data.object as any;
        const subscriptionId = typeof invoice.subscription === 'string' ? invoice.subscription : invoice.subscription?.id;
        if (!subscriptionId) break;

        // No immediate downgrade: Stripe retries the payment and will emit
        // customer.subscription.updated (unpaid/canceled) or .deleted if it finally fails.
        const { data: profile } = await supabaseAdmin
          .from('subtrack_profiles')
          .select('id, email')
          .eq('stripe_subscription_id', subscriptionId)
          .single();

        if (profile) {
          await supabaseAdmin.from('subtrack_notifications').insert({
            user_id: profile.id,
            subscription_name: 'SubTrack Pro',
            type: 'payment_failed',
            title: '⚠️ Payment failed for SubTrack Pro',
            message: 'We could not charge your card for SubTrack Pro. Stripe will retry; please update your payment method in the billing portal to keep Pro access.',
            status: 'sent',
            email_recipient: profile.email,
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
