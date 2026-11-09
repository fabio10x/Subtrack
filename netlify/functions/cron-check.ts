import { Handler, schedule } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase Admin to bypass RLS for background jobs
const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || ''
);

// Timezone-safe day difference: parse the YYYY-MM-DD parts directly so
// new Date('YYYY-MM-DD') (which is UTC) can't shift the result by a day.
function getDaysUntil(dateStr: string): number {
  if (!dateStr) return 0;
  const [y, m, d] = dateStr.split('-').map(Number);
  const target = Date.UTC(y, m - 1, d);
  const now = new Date();
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  return Math.round((target - today) / (1000 * 60 * 60 * 24));
}

function generateEmailHtml(subName: string, amount: number, currency: string, renewalDate: string, daysLeft: number): string {
  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px;">
      <h2 style="color: #0f172a; margin-top: 0;">⚡ SubTrack Renewal Alert</h2>
      <p style="color: #64748b;">Your subscription for <strong>${subName}</strong> is scheduled to renew in <strong>${daysLeft} day(s)</strong> on ${renewalDate}.</p>
      <div style="background: #f8fafc; padding: 18px; border-radius: 8px; font-size: 22px; font-weight: bold; color: #2563eb; margin-bottom: 20px;">
        ${currency} ${amount.toFixed(2)}
      </div>
      <a href="${process.env.URL || 'https://subtrack.app'}/dashboard" style="background: #f1f5f9; color: #334155; text-decoration: none; padding: 10px 18px; border-radius: 6px; display: inline-block;">Manage Subscriptions</a>
    </div>
  `;
}

// The core Cron handler logic
const cronHandler: Handler = async (event) => {
  console.log('Running SubTrack Renewal Cron Check...');

  // Scheduled runs come from Netlify and have no HTTP event. Any HTTP call must present CRON_SECRET,
  // so the endpoint can't be triggered by anyone who finds the URL.
  if (event && event.httpMethod) {
    const expected = process.env.CRON_SECRET;
    const provided = event.headers['x-cron-secret'];
    if (!expected || provided !== expected) {
      return { statusCode: 401, body: JSON.stringify({ error: 'Unauthorized' }) };
    }
  }

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
          // Check if an alert was already SUCCESSFULLY sent for this specific renewal date
          const { data: existingAlert } = await supabaseAdmin
            .from('subtrack_notifications')
            .select('id')
            .eq('subscription_id', sub.id)
            .eq('renewal_date', sub.next_renewal_date)
            .eq('status', 'sent')
            .limit(1)
            .maybeSingle();

          if (!existingAlert) {
            alertsTriggered++;
            const isTrial = sub.is_free_trial || sub.status === 'trial';
            const daysLabel = daysUntil === 0 ? 'Today' : daysUntil + 'd';
            const title = isTrial 
              ? `⚠️ Free Trial Ending: ${sub.name}`
              : `🔔 Upcoming Renewal: ${sub.name} in ${daysLabel}`;
            
            const htmlPreview = generateEmailHtml(sub.name, Number(sub.cost), sub.currency, sub.next_renewal_date, daysUntil);

            // Send Email via Resend and record the real outcome
            let deliveryStatus: 'sent' | 'failed' = 'failed';
            if (!process.env.RESEND_API_KEY) {
              console.error(`RESEND_API_KEY missing; alert for ${sub.name} (${user.email}) not emailed`);
            } else {
              try {
                const resendRes = await fetch('https://api.resend.com/emails', {
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
                if (resendRes.ok) {
                  deliveryStatus = 'sent';
                } else {
                  console.error(`Resend failed for ${sub.name} (${user.email}): ${resendRes.status} ${await resendRes.text()}`);
                }
              } catch (err: any) {
                console.error(`Resend request error for ${sub.name} (${user.email}):`, err.message);
              }
            }

            // Save notification. Only 'sent' rows count as delivered; 'failed' rows are retried next run
            // because the dedupe check below only looks at successful sends.
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
              status: deliveryStatus,
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
