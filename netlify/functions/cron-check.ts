import { Handler, schedule } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase Admin to bypass RLS for background jobs
const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || ''
);

// We need to implement a basic days until calculator since we can't easily import from src/ in Netlify Functions without a bundler setup
function getDaysUntil(dateStr: string): number {
  if (!dateStr) return 0;
  const target = new Date(dateStr);
  const now = new Date();
  target.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);
  const diffTime = target.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

function generateEmailHtml(subName: string, amount: number, currency: string, renewalDate: string, daysLeft: number): string {
  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px;">
      <h2 style="color: #0f172a; margin-top: 0;">⚡ SubTrack Renewal Alert</h2>
      <p style="color: #64748b;">Your subscription for <strong>${subName}</strong> is scheduled to renew in <strong>${daysLeft} day(s)</strong> on ${renewalDate}.</p>
      <div style="background: #f8fafc; padding: 18px; border-radius: 8px; font-size: 22px; font-weight: bold; color: #2563eb; margin-bottom: 20px;">
        ${currency} ${amount.toFixed(2)}
      </div>
      <a href="https://subtrack.app/dashboard" style="background: #f1f5f9; color: #334155; text-decoration: none; padding: 10px 18px; border-radius: 6px; display: inline-block;">Manage Subscriptions</a>
    </div>
  `;
}

// The core Cron handler logic
const cronHandler: Handler = async (event) => {
  console.log('Running SubTrack Renewal Cron Check...');

  try {
    // 1. Fetch all PRO users with email alerts enabled
    const { data: users, error: userErr } = await supabaseAdmin
      .from('subtrack_profiles')
      .select('*')
      .eq('tier', 'pro')
      .eq('email_alerts_enabled', true);

    if (userErr || !users) throw userErr;

    let alertsTriggered = 0;

    for (const user of users) {
      // 2. Fetch active subscriptions for this user
      const { data: subs } = await supabaseAdmin
        .from('subtrack_subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .in('status', ['active', 'trial']);

      if (!subs) continue;

      const thresholdDays = user.alert_lead_days || 3;

      // 3. Check each subscription
      for (const sub of subs) {
        const daysUntil = getDaysUntil(sub.next_renewal_date);

        if (daysUntil >= 0 && daysUntil <= thresholdDays) {
          // Check if an alert was already sent for this specific renewal date
          const { data: existingAlert } = await supabaseAdmin
            .from('subtrack_notifications')
            .select('id')
            .eq('subscription_id', sub.id)
            .eq('renewal_date', sub.next_renewal_date)
            .limit(1)
            .single();

          if (!existingAlert) {
            alertsTriggered++;
            const isTrial = sub.is_free_trial || sub.status === 'trial';
            const daysLabel = daysUntil === 0 ? 'Today' : daysUntil + 'd';
            const title = isTrial 
              ? `⚠️ Free Trial Ending: ${sub.name}`
              : `🔔 Upcoming Renewal: ${sub.name} in ${daysLabel}`;
            
            const htmlPreview = generateEmailHtml(sub.name, Number(sub.cost), sub.currency, sub.next_renewal_date, daysUntil);

            // Send Email via Resend
            if (process.env.RESEND_API_KEY) {
              await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  from: 'SubTrack Alerts <alerts@resend.dev>',
                  to: user.email,
                  subject: title,
                  html: htmlPreview,
                }),
              });
            }

            // Save Notification to Database
            await supabaseAdmin.from('subtrack_notifications').insert({
              user_id: user.id,
              subscription_id: sub.id,
              subscription_name: sub.name,
              type: isTrial ? 'trial_ending' : 'renewal_reminder',
              title,
              message: `Your ${sub.name} subscription will renew on ${sub.next_renewal_date} for ${sub.currency} ${Number(sub.cost).toFixed(2)}.`,
              renewal_date: sub.next_renewal_date,
              amount: sub.cost,
              currency: sub.currency,
              days_remaining: daysUntil,
              status: 'sent',
              email_recipient: user.email,
              email_html_preview: htmlPreview,
              read: false,
            });
          }
        }
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, alertsTriggered }),
    };
  } catch (error: any) {
    console.error('Cron Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};

// Use Netlify's schedule feature to run this function automatically (e.g., every day at 8:00 AM)
// Alternatively, this can be triggered manually by hitting the endpoint.
export const handler = schedule('0 8 * * *', cronHandler);
