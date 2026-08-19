import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { 
  Subscription, 
  UserProfile, 
  NotificationItem, 
  CronRunResult, 
  CurrencyCode 
} from './src/types';
import { INITIAL_SUBSCRIPTIONS, DEMO_USERS } from './src/data/seedData';
import { getMonthlyEquivalent, getAnnualEquivalent, convertCurrency } from './src/utils/currency';
import { getDaysUntil, addDaysToCurrentDate } from './src/utils/dateUtils';
import Stripe from 'stripe';

// Lazy Stripe initialization helper
let stripeClient: Stripe | null = null;
function getStripe(): Stripe | null {
  if (!stripeClient && process.env.STRIPE_SECRET_KEY) {
    stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-01-27.acacia' as any,
    });
  }
  return stripeClient;
}

// In-Memory persistent data store with multi-tenant / user isolation
let usersStore: Map<string, UserProfile> = new Map();
let subscriptionsStore: Map<string, Subscription[]> = new Map();
let notificationsStore: Map<string, NotificationItem[]> = new Map();

// Initialize seed data
function initializeDatabase() {
  usersStore.clear();
  subscriptionsStore.clear();
  notificationsStore.clear();

  DEMO_USERS.forEach(user => {
    usersStore.set(user.id, { ...user });
  });

  // Seed user_alex subscriptions
  subscriptionsStore.set('user_alex', JSON.parse(JSON.stringify(INITIAL_SUBSCRIPTIONS)));

  // Seed user_sarah with fewer subscriptions (Free tier)
  subscriptionsStore.set('user_sarah', [
    {
      id: 'sub_s1',
      userId: 'user_sarah',
      name: 'Spotify Individual',
      category: 'Entertainment',
      cost: 10.99,
      currency: 'EUR',
      billingCycle: 'monthly',
      paymentMethod: 'Mastercard •••• 8821',
      startDate: '2024-01-01',
      nextRenewalDate: addDaysToCurrentDate(2),
      status: 'active',
      isFreeTrial: false,
      autoRenewsAfterTrial: true,
      brandColor: '#1DB954',
      websiteUrl: 'https://spotify.com',
      alertDaysBefore: 3,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'sub_s2',
      userId: 'user_sarah',
      name: 'Figma Starter (Trial)',
      category: 'Software & SaaS',
      cost: 15.00,
      currency: 'EUR',
      billingCycle: 'monthly',
      paymentMethod: 'Visa •••• 4242',
      startDate: '2024-02-01',
      nextRenewalDate: addDaysToCurrentDate(3),
      status: 'trial',
      isFreeTrial: true,
      trialStartDate: '2024-02-01',
      trialEndDate: addDaysToCurrentDate(3),
      autoRenewsAfterTrial: true,
      trialConvertedCost: 15.00,
      brandColor: '#F24E1E',
      websiteUrl: 'https://figma.com',
      alertDaysBefore: 3,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  ]);

  // Seed initial notification
  notificationsStore.set('user_alex', [
    {
      id: 'notif_welcome',
      userId: 'user_alex',
      subscriptionName: 'SubTrack Engine',
      type: 'renewal_reminder',
      title: 'Welcome to SubTrack Pro',
      message: 'Automated 3-day renewal cron monitoring is active for 7 subscriptions.',
      renewalDate: addDaysToCurrentDate(2),
      amount: 20.00,
      currency: 'USD',
      daysRemaining: 2,
      sentAt: new Date().toISOString(),
      status: 'sent',
      emailRecipient: 'alex.rivera@example.com',
      emailHtmlPreview: generateEmailHtml('ChatGPT Plus', 20.00, 'USD', addDaysToCurrentDate(2), 2, 'https://chat.openai.com/#settings'),
      read: false,
    }
  ]);
}

initializeDatabase();

// Email HTML generator for Resend/Sendgrid & In-app preview
function generateEmailHtml(
  subName: string,
  amount: number,
  currency: string,
  renewalDate: string,
  daysLeft: number,
  cancelUrl?: string
): string {
  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 560px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; padding: 24px;">
      <div style="border-bottom: 2px solid #3b82f6; padding-bottom: 16px; margin-bottom: 20px;">
        <h2 style="margin: 0; color: #0f172a; font-size: 20px;">⚡ SubTrack Renewal Alert</h2>
        <p style="margin: 4px 0 0 0; color: #64748b; font-size: 14px;">Automated 3-Day Renewal Notification</p>
      </div>
      <div style="background: #f8fafc; border-radius: 8px; padding: 18px; margin-bottom: 20px;">
        <div style="font-size: 14px; color: #64748b; margin-bottom: 4px;">Upcoming Subscription Charge</div>
        <div style="font-size: 22px; font-weight: 700; color: #0f172a; margin-bottom: 8px;">${subName}</div>
        <div style="font-size: 18px; font-weight: 600; color: #2563eb;">
          ${currency} ${amount.toFixed(2)}
        </div>
      </div>
      <p style="color: #334155; font-size: 15px; line-height: 1.5; margin-bottom: 20px;">
        Your subscription for <strong>${subName}</strong> is scheduled to renew in <strong>${daysLeft} day${daysLeft === 1 ? '' : 's'}</strong> on <strong>${renewalDate}</strong>.
      </p>
      <div style="display: flex; gap: 12px; margin-bottom: 24px;">
        ${cancelUrl ? `<a href="${cancelUrl}" target="_blank" style="background: #ef4444; color: #ffffff; text-decoration: none; padding: 10px 18px; border-radius: 6px; font-weight: 600; font-size: 14px; display: inline-block;">Manage / Cancel Plan</a>` : ''}
        <a href="https://subtrack.app/dashboard" target="_blank" style="background: #f1f5f9; color: #334155; text-decoration: none; padding: 10px 18px; border-radius: 6px; font-weight: 600; font-size: 14px; display: inline-block;">Open SubTrack</a>
      </div>
      <div style="border-top: 1px solid #e2e8f0; padding-top: 14px; color: #94a3b8; font-size: 12px;">
        Sent automatically by SubTrack Cron Engine to prevent unexpected renewal charges.
      </div>
    </div>
  `;
}

// Background Cron Job Runner
async function runRenewalCronCheck(userId?: string): Promise<CronRunResult> {
  const targetUsers = userId 
    ? [usersStore.get(userId)].filter(Boolean) as UserProfile[]
    : Array.from(usersStore.values());

  let totalScanned = 0;
  let alertsTriggered = 0;
  const newNotifications: NotificationItem[] = [];

  for (const user of targetUsers) {
    const userSubs = subscriptionsStore.get(user.id) || [];
    const thresholdDays = user.alertLeadDays || 3;
    const userNotifs = notificationsStore.get(user.id) || [];

    for (const sub of userSubs) {
      if (sub.status === 'cancelled' || sub.status === 'paused') continue;
      totalScanned++;

      const daysUntil = getDaysUntil(sub.nextRenewalDate);

      // Check if within alert threshold (e.g. <= 3 days and >= 0)
      if (daysUntil >= 0 && daysUntil <= thresholdDays) {
        // Prevent duplicate alert for the exact same sub renewal date within 24h
        const hasRecentAlert = userNotifs.some(
          n => n.subscriptionId === sub.id && n.renewalDate === sub.nextRenewalDate
        );

        if (!hasRecentAlert) {
          alertsTriggered++;
          const isTrial = sub.isFreeTrial;
          const notif: NotificationItem = {
            id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            userId: user.id,
            subscriptionId: sub.id,
            subscriptionName: sub.name,
            type: isTrial ? 'trial_ending' : 'renewal_reminder',
            title: isTrial 
              ? `⚠️ Free Trial Ending: ${sub.name}`
              : `🔔 Upcoming Renewal: ${sub.name} in ${daysUntil === 0 ? 'Today' : `${daysUntil}d`}`,
            message: isTrial
              ? `Your free trial for ${sub.name} ends in ${daysUntil} day(s) on ${sub.nextRenewalDate}. Auto-renews at ${sub.currency} ${sub.cost.toFixed(2)}.`
              : `Your ${sub.name} subscription will renew on ${sub.nextRenewalDate} for ${sub.currency} ${sub.cost.toFixed(2)}.`,
            renewalDate: sub.nextRenewalDate,
            amount: sub.cost,
            currency: sub.currency,
            daysRemaining: daysUntil,
            sentAt: new Date().toISOString(),
            status: 'sent',
            emailRecipient: user.email,
            emailHtmlPreview: generateEmailHtml(sub.name, sub.cost, sub.currency, sub.nextRenewalDate, daysUntil, sub.cancelUrl),
            read: false,
          };

          userNotifs.unshift(notif);
          newNotifications.push(notif);

          // If real Resend API Key is set and user enabled email alerts
          if (process.env.RESEND_API_KEY && user.emailAlertsEnabled && user.tier === 'pro') {
            try {
              await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  from: 'SubTrack Alerts <alerts@resend.dev>',
                  to: user.email,
                  subject: notif.title,
                  html: notif.emailHtmlPreview,
                }),
              });
            } catch (err) {
              console.error('Failed to send Resend email:', err);
            }
          }
        }
      }
    }
    notificationsStore.set(user.id, userNotifs);
  }

  return {
    timestamp: new Date().toISOString(),
    scannedCount: totalScanned,
    alertsTriggered,
    notificationsCreated: newNotifications,
    message: `Cron check completed: scanned ${totalScanned} subscriptions, triggered ${alertsTriggered} notification alerts.`,
  };
}

// Start periodic automatic cron background runner (every 6 hours)
setInterval(() => {
  runRenewalCronCheck().catch(console.error);
}, 6 * 60 * 60 * 1000);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  app.use(express.json());

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      stripeConfigured: !!process.env.STRIPE_SECRET_KEY,
      resendConfigured: !!process.env.RESEND_API_KEY,
    });
  });

  // Auth & Profile endpoints
  app.get('/api/profile', (req, res) => {
    const userId = (req.query.userId as string) || 'user_alex';
    let profile = usersStore.get(userId);
    if (!profile) {
      profile = {
        id: userId,
        email: `${userId}@example.com`,
        name: 'Alex Rivera',
        tier: 'pro',
        preferredCurrency: 'USD',
        alertLeadDays: 3,
        emailAlertsEnabled: true,
        createdAt: new Date().toISOString(),
      };
      usersStore.set(userId, profile);
    }
    res.json(profile);
  });

  app.post('/api/profile', (req, res) => {
    const userId = (req.body.id as string) || 'user_alex';
    const existing = usersStore.get(userId) || {
      id: userId,
      email: `${userId}@example.com`,
      name: 'Alex Rivera',
      tier: 'pro',
      preferredCurrency: 'USD',
      alertLeadDays: 3,
      emailAlertsEnabled: true,
      createdAt: new Date().toISOString(),
    };

    const updated: UserProfile = {
      ...existing,
      ...req.body,
      id: userId,
    };

    usersStore.set(userId, updated);
    res.json(updated);
  });

  // Subscriptions CRUD
  app.get('/api/subscriptions', (req, res) => {
    const userId = (req.query.userId as string) || 'user_alex';
    const subs = subscriptionsStore.get(userId) || [];
    res.json(subs);
  });

  app.post('/api/subscriptions', (req, res) => {
    const userId = (req.body.userId as string) || 'user_alex';
    const user = usersStore.get(userId);
    const subs = subscriptionsStore.get(userId) || [];

    // Free tier enforcement: max 5 active subscriptions
    if (user?.tier === 'free') {
      const activeCount = subs.filter(s => s.status === 'active' || s.status === 'trial').length;
      if (activeCount >= 5) {
        return res.status(403).json({
          error: 'Free tier limit reached',
          message: 'Free tier is limited to 5 active subscriptions. Upgrade to Pro for unlimited tracking, CSV export, and automated email alerts.',
        });
      }
    }

    const newSub: Subscription = {
      id: `sub_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      userId,
      name: req.body.name || 'New Subscription',
      description: req.body.description || '',
      category: req.body.category || 'Software & SaaS',
      cost: Number(req.body.cost) || 0,
      currency: (req.body.currency as CurrencyCode) || 'USD',
      billingCycle: req.body.billingCycle || 'monthly',
      paymentMethod: req.body.paymentMethod || 'Visa •••• 4242',
      startDate: req.body.startDate || new Date().toISOString().split('T')[0],
      nextRenewalDate: req.body.nextRenewalDate || addDaysToCurrentDate(30),
      status: req.body.status || 'active',
      isFreeTrial: Boolean(req.body.isFreeTrial),
      trialStartDate: req.body.trialStartDate,
      trialEndDate: req.body.trialEndDate,
      autoRenewsAfterTrial: req.body.autoRenewsAfterTrial ?? true,
      trialConvertedCost: req.body.trialConvertedCost ? Number(req.body.trialConvertedCost) : undefined,
      brandColor: req.body.brandColor || '#3B82F6',
      websiteUrl: req.body.websiteUrl,
      cancelUrl: req.body.cancelUrl,
      notes: req.body.notes,
      alertDaysBefore: Number(req.body.alertDaysBefore) || 3,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    subs.unshift(newSub);
    subscriptionsStore.set(userId, subs);
    res.status(201).json(newSub);
  });

  app.put('/api/subscriptions/:id', (req, res) => {
    const userId = (req.query.userId as string) || (req.body.userId as string) || 'user_alex';
    const subId = req.params.id;
    const subs = subscriptionsStore.get(userId) || [];
    const index = subs.findIndex(s => s.id === subId);

    if (index === -1) {
      return res.status(404).json({ error: 'Subscription not found' });
    }

    const updatedSub: Subscription = {
      ...subs[index],
      ...req.body,
      id: subId,
      userId,
      cost: Number(req.body.cost ?? subs[index].cost),
      updatedAt: new Date().toISOString(),
    };

    subs[index] = updatedSub;
    subscriptionsStore.set(userId, subs);
    res.json(updatedSub);
  });

  app.delete('/api/subscriptions/:id', (req, res) => {
    const userId = (req.query.userId as string) || 'user_alex';
    const subId = req.params.id;
    let subs = subscriptionsStore.get(userId) || [];
    const initialLen = subs.length;
    subs = subs.filter(s => s.id !== subId);

    if (subs.length === initialLen) {
      return res.status(404).json({ error: 'Subscription not found' });
    }

    subscriptionsStore.set(userId, subs);
    res.json({ success: true, message: 'Subscription deleted' });
  });

  app.post('/api/subscriptions/reset-seed', (req, res) => {
    initializeDatabase();
    res.json({ success: true, message: 'Sample dataset reset to initial state.' });
  });

  // Analytics Engine
  app.get('/api/analytics', (req, res) => {
    const userId = (req.query.userId as string) || 'user_alex';
    const user = usersStore.get(userId);
    const targetCurrency = (user?.preferredCurrency || 'USD') as CurrencyCode;
    const subs = subscriptionsStore.get(userId) || [];

    const activeSubs = subs.filter(s => s.status === 'active' || s.status === 'trial');
    const trialSubs = subs.filter(s => s.status === 'trial' || s.isFreeTrial);

    // Compute monthly and annual totals
    let totalMonthlySpend = 0;
    const categoryTotals: Record<string, number> = {};
    const paymentMethodTotals: Record<string, number> = {};

    activeSubs.forEach(sub => {
      const monthlyEquiv = getMonthlyEquivalent(sub.cost, sub.billingCycle, sub.currency, targetCurrency);
      totalMonthlySpend += monthlyEquiv;

      categoryTotals[sub.category] = (categoryTotals[sub.category] || 0) + monthlyEquiv;
      paymentMethodTotals[sub.paymentMethod] = (paymentMethodTotals[sub.paymentMethod] || 0) + monthlyEquiv;
    });

    const totalAnnualSpend = totalMonthlySpend * 12;

    // Upcoming renewals within next 30 days
    const upcomingRenewals = activeSubs
      .map(sub => {
        const days = getDaysUntil(sub.nextRenewalDate);
        return {
          ...sub,
          daysUntil: days,
          monthlyEquivalentInPreferred: getMonthlyEquivalent(sub.cost, sub.billingCycle, sub.currency, targetCurrency),
        };
      })
      .filter(sub => sub.daysUntil >= 0 && sub.daysUntil <= 30)
      .sort((a, b) => a.daysUntil - b.daysUntil);

    res.json({
      currency: targetCurrency,
      totalMonthlySpend,
      totalAnnualSpend,
      activeCount: activeSubs.length,
      trialsCount: trialSubs.length,
      totalSubsCount: subs.length,
      categoryBreakdown: Object.entries(categoryTotals).map(([name, value]) => ({
        name,
        value: Number(value.toFixed(2)),
        percentage: totalMonthlySpend > 0 ? Number(((value / totalMonthlySpend) * 100).toFixed(1)) : 0,
      })),
      paymentMethodBreakdown: Object.entries(paymentMethodTotals).map(([method, value]) => ({
        method,
        value: Number(value.toFixed(2)),
      })),
      upcomingRenewals,
    });
  });

  // Notifications & Cron endpoints
  app.get('/api/notifications', (req, res) => {
    const userId = (req.query.userId as string) || 'user_alex';
    const notifs = notificationsStore.get(userId) || [];
    res.json(notifs);
  });

  app.put('/api/notifications/:id/read', (req, res) => {
    const userId = (req.query.userId as string) || 'user_alex';
    const notifId = req.params.id;
    const notifs = notificationsStore.get(userId) || [];
    const notif = notifs.find(n => n.id === notifId);
    if (notif) {
      notif.read = true;
    }
    res.json({ success: true });
  });

  app.delete('/api/notifications/:id', (req, res) => {
    const userId = (req.query.userId as string) || 'user_alex';
    const notifId = req.params.id;
    let notifs = notificationsStore.get(userId) || [];
    notifs = notifs.filter(n => n.id !== notifId);
    notificationsStore.set(userId, notifs);
    res.json({ success: true });
  });

  app.post('/api/cron/renewals-check', async (req, res) => {
    const userId = req.body.userId as string | undefined;
    try {
      const result = await runRenewalCronCheck(userId);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to run cron job', details: err?.message });
    }
  });

  // CSV Export endpoint (Gated for Pro or available via endpoint)
  app.get('/api/export/csv', (req, res) => {
    const userId = (req.query.userId as string) || 'user_alex';
    const user = usersStore.get(userId);
    const subs = subscriptionsStore.get(userId) || [];

    if (user?.tier === 'free') {
      return res.status(403).json({
        error: 'Pro Feature Required',
        message: 'CSV Export is an exclusive SubTrack Pro feature. Upgrade to unlock instant financial exports.',
      });
    }

    const headers = [
      'ID',
      'Name',
      'Category',
      'Cost',
      'Currency',
      'Billing Cycle',
      'Monthly Equivalent (USD)',
      'Payment Method',
      'Start Date',
      'Next Renewal Date',
      'Status',
      'Is Free Trial',
      'Trial End Date',
      'Website',
      'Cancel Link',
      'Notes',
    ];

    const rows = subs.map(s => [
      s.id,
      `"${s.name.replace(/"/g, '""')}"`,
      `"${s.category}"`,
      s.cost,
      s.currency,
      s.billingCycle,
      getMonthlyEquivalent(s.cost, s.billingCycle, s.currency, 'USD').toFixed(2),
      `"${s.paymentMethod}"`,
      s.startDate,
      s.nextRenewalDate,
      s.status,
      s.isFreeTrial ? 'Yes' : 'No',
      s.trialEndDate || '',
      `"${s.websiteUrl || ''}"`,
      `"${s.cancelUrl || ''}"`,
      `"${(s.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="subtrack_subscriptions_${new Date().toISOString().split('T')[0]}.csv"`);
    res.send(csvContent);
  });

  // Stripe Billing & Checkout
  app.post('/api/stripe/create-checkout-session', async (req, res) => {
    const userId = (req.body.userId as string) || 'user_alex';
    const user = usersStore.get(userId);
    const stripe = getStripe();

    if (!stripe) {
      // Graceful simulated checkout response when Stripe secret key isn't provided
      return res.json({
        simulated: true,
        message: 'Stripe Test Checkout Mode Active',
        checkoutUrl: '#simulated-checkout',
        plan: 'SubTrack Pro Monthly ($5/mo)',
      });
    }

    try {
      const appUrl = process.env.APP_URL || 'http://localhost:3000';
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        billing_address_collection: 'auto',
        customer_email: user?.email || undefined,
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

      res.json({ checkoutUrl: session.url, sessionId: session.id });
    } catch (error: any) {
      console.error('Stripe session creation error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Instant Pro Upgrade Handler (supports simulated upgrade or webhook confirmation)
  app.post('/api/stripe/confirm-upgrade', (req, res) => {
    const userId = (req.body.userId as string) || 'user_alex';
    const user = usersStore.get(userId);
    if (user) {
      user.tier = 'pro';
      user.subscriptionExpiresAt = addDaysToCurrentDate(30);
      usersStore.set(userId, user);

      // Add success notification
      const userNotifs = notificationsStore.get(userId) || [];
      userNotifs.unshift({
        id: `notif_upgrade_${Date.now()}`,
        userId,
        subscriptionName: 'SubTrack Pro',
        type: 'pro_upgrade',
        title: '🎉 Upgraded to SubTrack Pro!',
        message: 'You now have unlimited subscriptions tracking, CSV exports, and automated 3-day email renewal alerts.',
        renewalDate: addDaysToCurrentDate(30),
        amount: 5.00,
        currency: 'USD',
        daysRemaining: 30,
        sentAt: new Date().toISOString(),
        status: 'sent',
        emailRecipient: user.email,
        read: false,
      });
      notificationsStore.set(userId, userNotifs);
    }
    res.json({ success: true, user });
  });

  app.post('/api/stripe/cancel-pro', (req, res) => {
    const userId = (req.body.userId as string) || 'user_alex';
    const user = usersStore.get(userId);
    if (user) {
      user.tier = 'free';
      user.emailAlertsEnabled = false;
      usersStore.set(userId, user);
    }
    res.json({ success: true, user });
  });

  // Stripe Webhooks
  app.post('/api/stripe/webhook', (req, res) => {
    const stripe = getStripe();
    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event: any = req.body;

    if (stripe && webhookSecret && sig) {
      try {
        event = stripe.webhooks.constructEvent(req.body, sig as string, webhookSecret);
      } catch (err: any) {
        console.error('Webhook signature verification failed:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
      }
    }

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const userId = session.metadata?.userId;
        if (userId && usersStore.has(userId)) {
          const user = usersStore.get(userId)!;
          user.tier = 'pro';
          user.stripeCustomerId = session.customer;
          user.stripeSubscriptionId = session.subscription;
          usersStore.set(userId, user);
        }
        break;
      }
      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        // Downgrade user back to free tier
        for (const [uid, user] of usersStore.entries()) {
          if (user.stripeSubscriptionId === subscription.id) {
            user.tier = 'free';
            usersStore.set(uid, user);
          }
        }
        break;
      }
    }

    res.json({ received: true });
  });

  // Vite Middleware for SPA Frontend
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SubTrack Full-Stack Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
