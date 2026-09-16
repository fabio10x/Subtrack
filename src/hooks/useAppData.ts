import { useState, useEffect, useCallback } from 'react';
import { UserProfile, Subscription, NotificationItem, CurrencyCode } from '../types';
import { getMonthlyEquivalent } from '../utils/currency';
import { supabase } from '../utils/supabase';

interface UseAppDataProps {
  session: any;
}

export function useAppData({ session }: UseAppDataProps) {
  const [currentUser, setCurrentUser] = useState<UserProfile>({
    id: '', email: '', name: '', tier: 'free',
    preferredCurrency: 'USD', alertLeadDays: 3, emailAlertsEnabled: true, avatar: null,
  });
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [analyticsData, setAnalyticsData] = useState<{
    currency: CurrencyCode; totalMonthlySpend: number; totalAnnualSpend: number;
    activeCount: number; trialsCount: number; totalSubsCount: number;
    categoryBreakdown: { name: string; value: number; percentage: number }[];
    upcomingRenewals: any[];
  }>({ currency: 'USD', totalMonthlySpend: 0, totalAnnualSpend: 0, activeCount: 0, trialsCount: 0, totalSubsCount: 0, categoryBreakdown: [], upcomingRenewals: [] });
  const [isLoading, setIsLoading] = useState(true);

  const fetchAllData = useCallback(async (userId: string = session?.user?.id) => {
    if (!userId) return;
    try {
      setIsLoading(true);

      // Profile
      const { data: profile } = await supabase.from('subtrack_profiles').select('*').eq('id', userId).single();
      const defaultEmail = session?.user?.email || '';
      const defaultName = defaultEmail ? defaultEmail.split('@')[0] : 'User';
      let p: any = { id: userId, email: defaultEmail, name: defaultName, tier: 'free', preferredCurrency: 'USD', alertLeadDays: 3, emailAlertsEnabled: true, avatar: null };
      if (profile) {
        p = { id: profile.id, email: profile.email || defaultEmail, name: profile.name || defaultName, tier: profile.tier || p.tier, preferredCurrency: profile.preferred_currency || p.preferredCurrency, alertLeadDays: profile.alert_lead_days || p.alertLeadDays, emailAlertsEnabled: profile.email_alerts_enabled ?? p.emailAlertsEnabled, avatar: profile.avatar_url };
      }
      setCurrentUser(p);

      // Subscriptions
      const { data: subsData } = await supabase.from('subtrack_subscriptions').select('*').order('created_at', { ascending: false });
      let mappedSubs: Subscription[] = [];
      if (subsData) {
        mappedSubs = subsData.map(s => ({
          id: s.id, userId: s.user_id, name: s.name, description: s.description,
          category: s.category as any, cost: Number(s.cost), currency: s.currency as any,
          billingCycle: s.billing_cycle as any, paymentMethod: s.payment_method as any,
          startDate: s.start_date, nextRenewalDate: s.next_renewal_date, status: s.status as any,
          isFreeTrial: s.is_free_trial, trialStartDate: s.trial_start_date, trialEndDate: s.trial_end_date,
          autoRenewsAfterTrial: s.auto_renews_after_trial,
          trialConvertedCost: s.trial_converted_cost ? Number(s.trial_converted_cost) : undefined,
          brandColor: s.brand_color, websiteUrl: s.website_url, cancelUrl: s.cancel_url,
          notes: s.notes, alertDaysBefore: s.alert_days_before, createdAt: s.created_at, updatedAt: s.updated_at,
        }));
        setSubscriptions(mappedSubs);
      }

      // Guest Demo Seeding
      if (session?.user?.is_anonymous && mappedSubs.length === 0) {
        const today = new Date().toISOString().split('T')[0];
        const daysFromNow = (d: number) => new Date(Date.now() + d * 86400000).toISOString().split('T')[0];
        const demoSubs = [
          {
            user_id: userId, name: 'Netflix', cost: 15.49, currency: 'USD',
            billing_cycle: 'monthly', category: 'Entertainment', status: 'active',
            payment_method: 'Credit Card', start_date: today,
            next_renewal_date: daysFromNow(15), brand_color: '#E50914',
            website_url: 'https://netflix.com',
          },
          {
            user_id: userId, name: 'Spotify', cost: 10.99, currency: 'USD',
            billing_cycle: 'monthly', category: 'Entertainment', status: 'active',
            payment_method: 'Credit Card', start_date: today,
            next_renewal_date: daysFromNow(5), brand_color: '#1DB954',
            website_url: 'https://spotify.com',
          },
          {
            user_id: userId, name: 'iCloud+', cost: 2.99, currency: 'USD',
            billing_cycle: 'monthly', category: 'Productivity', status: 'active',
            payment_method: 'Credit Card', start_date: today,
            next_renewal_date: daysFromNow(22), brand_color: '#147EFB',
            website_url: 'https://icloud.com',
          },
          {
            user_id: userId, name: 'ChatGPT Plus', cost: 20.00, currency: 'USD',
            billing_cycle: 'monthly', category: 'Productivity', status: 'active',
            payment_method: 'Credit Card', start_date: today,
            next_renewal_date: daysFromNow(3), brand_color: '#10a37f',
            website_url: 'https://chat.openai.com',
          },
          {
            user_id: userId, name: 'Adobe Creative Cloud', cost: 54.99, currency: 'USD',
            billing_cycle: 'monthly', category: 'Design', status: 'trial',
            is_free_trial: true, trial_start_date: today, trial_end_date: daysFromNow(10),
            auto_renews_after_trial: true, trial_converted_cost: 54.99,
            payment_method: 'Credit Card', start_date: today,
            next_renewal_date: daysFromNow(10), brand_color: '#FF0000',
            website_url: 'https://adobe.com',
          },
        ];
        const { error: seedError } = await supabase.from('subtrack_subscriptions').insert(demoSubs);
        if (seedError) console.error('[GuestDemo] Seeding failed:', seedError);

        const { data: newSubsData } = await supabase.from('subtrack_subscriptions').select('*').order('created_at', { ascending: false });
        if (newSubsData) {
          mappedSubs = newSubsData.map(s => ({
            id: s.id, userId: s.user_id, name: s.name, description: s.description,
            category: s.category as any, cost: Number(s.cost), currency: s.currency as any,
            billingCycle: s.billing_cycle as any, paymentMethod: s.payment_method as any,
            startDate: s.start_date, nextRenewalDate: s.next_renewal_date, status: s.status as any,
            isFreeTrial: s.is_free_trial, trialStartDate: s.trial_start_date, trialEndDate: s.trial_end_date,
            autoRenewsAfterTrial: s.auto_renews_after_trial,
            trialConvertedCost: s.trial_converted_cost ? Number(s.trial_converted_cost) : undefined,
            brandColor: s.brand_color, websiteUrl: s.website_url, cancelUrl: s.cancel_url,
            notes: s.notes, alertDaysBefore: s.alert_days_before, createdAt: s.created_at, updatedAt: s.updated_at,
          }));
          setSubscriptions(mappedSubs);
        }
      }

      // Analytics
      const targetCurrency = p?.preferredCurrency || 'USD';
      const activeSubs = mappedSubs.filter(s => s.status === 'active' || s.status === 'trial');
      const trialSubs = mappedSubs.filter(s => s.status === 'trial' || s.isFreeTrial);
      let totalMonthlySpend = 0;
      const categoryTotals: Record<string, number> = {};
      activeSubs.forEach(sub => {
        const monthlyEquiv = getMonthlyEquivalent(sub.cost, sub.billingCycle, sub.currency, targetCurrency);
        totalMonthlySpend += monthlyEquiv;
        categoryTotals[sub.category] = (categoryTotals[sub.category] || 0) + monthlyEquiv;
      });
      setAnalyticsData({
        currency: targetCurrency, totalMonthlySpend, totalAnnualSpend: totalMonthlySpend * 12,
        activeCount: activeSubs.length, trialsCount: trialSubs.length, totalSubsCount: mappedSubs.length,
        categoryBreakdown: Object.entries(categoryTotals).map(([name, value]) => ({
          name, value: Number((value as number).toFixed(2)),
          percentage: totalMonthlySpend > 0 ? Number((((value as number) / totalMonthlySpend) * 100).toFixed(1)) : 0,
        })),
        upcomingRenewals: [],
      });

      // Notifications
      const { data: notifsData } = await supabase.from('subtrack_notifications').select('*').order('created_at', { ascending: false });
      if (notifsData) {
        setNotifications(notifsData.map(n => ({
          id: n.id, userId: n.user_id, subscriptionId: n.subscription_id || undefined,
          subscriptionName: n.subscription_name, type: n.type as any, title: n.title, message: n.message,
          renewalDate: n.renewal_date, amount: Number(n.amount), currency: n.currency as any,
          daysRemaining: n.days_remaining, sentAt: n.sent_at, status: n.status as any,
          emailRecipient: n.email_recipient, emailHtmlPreview: n.email_html_preview, read: n.read,
        })));
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [session?.user?.id]);

  useEffect(() => {
    if (session?.user?.id) fetchAllData(session.user.id);
  }, [session?.user?.id, fetchAllData]);

  return {
    currentUser, setCurrentUser,
    subscriptions, setSubscriptions,
    notifications, setNotifications,
    analyticsData, isLoading, fetchAllData,
  };
}
