import React, { useState, useEffect, useCallback } from 'react';
import { 
  UserProfile, 
  Subscription, 
  NotificationItem, 
  CurrencyCode, 
  CronRunResult 
} from './types';
import { LandingPage } from './components/landing/LandingPage';
import { Navbar } from './components/Navbar';
import { AnalyticsOverview } from './components/AnalyticsOverview';
import { TrialTrackerBanner } from './components/TrialTrackerBanner';
import { CategoryBreakdownChart } from './components/CategoryBreakdownChart';
import { SpendTrendChart } from './components/SpendTrendChart';
import { RenewalCalendar } from './components/RenewalCalendar';
import { SubscriptionList } from './components/SubscriptionList';
import { SubscriptionModal } from './components/SubscriptionModal';
import { UpgradeModal } from './components/UpgradeModal';
import { CostOptimizerModal } from './components/CostOptimizerModal';
import { NotificationCenterModal } from './components/NotificationCenterModal';
import { ProfileModal } from './components/ProfileModal';
import { CsvExportModal } from './components/CsvExportModal';
import { getMonthlyEquivalent, convertCurrency } from './utils/currency';
import { DEMO_USERS } from './data/seedData';
import { AlertCircle, CheckCircle2, RotateCw } from 'lucide-react';
import { supabase } from './utils/supabase';
import { Auth } from './components/Auth';

export default function App() {
  // Navigation View State: 'landing' vs 'dashboard' vs 'auth'
  const [currentView, setCurrentView] = useState<'landing' | 'dashboard' | 'auth'>(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash;
      const path = window.location.pathname;
      if (hash === '#dashboard' || path.includes('/dashboard')) {
        return 'dashboard';
      }
      if (hash === '#auth') {
        return 'auth';
      }
    }
    return 'landing';
  });

  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session && window.location.hash === '#auth') {
        setCurrentView('dashboard');
        window.location.hash = 'dashboard';
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // State
  const [currentUser, setCurrentUser] = useState<UserProfile>(DEMO_USERS[0]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [analyticsData, setAnalyticsData] = useState<{
    currency: CurrencyCode;
    totalMonthlySpend: number;
    totalAnnualSpend: number;
    activeCount: number;
    trialsCount: number;
    totalSubsCount: number;
    categoryBreakdown: { name: string; value: number; percentage: number }[];
    upcomingRenewals: any[];
  }>({
    currency: 'USD',
    totalMonthlySpend: 0,
    totalAnnualSpend: 0,
    activeCount: 0,
    trialsCount: 0,
    totalSubsCount: 0,
    categoryBreakdown: [],
    upcomingRenewals: [],
  });

  const [isLoading, setIsLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  // Modals
  const [isSubModalOpen, setIsSubModalOpen] = useState(false);
  const [subToEdit, setSubToEdit] = useState<Subscription | null>(null);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [isOptimizerOpen, setIsOptimizerOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Data Fetching
  const fetchAllData = useCallback(async (userId: string = session?.user?.id) => {
    if (!userId) return;
    try {
      setIsLoading(true);

      const { data: profile } = await supabase.from('subtrack_profiles').select('*').eq('id', userId).single();
      
      const defaultEmail = session?.user?.email || '';
      const defaultName = defaultEmail ? defaultEmail.split('@')[0] : 'User';

      let p: any = {
        id: userId,
        email: defaultEmail,
        name: defaultName,
        tier: 'free',
        preferredCurrency: 'USD',
        alertLeadDays: 3,
        emailAlertsEnabled: true,
        avatar: null
      };

      if (profile) {
        p = {
          id: profile.id,
          email: profile.email || defaultEmail,
          name: profile.name || defaultName,
          tier: profile.tier || p.tier,
          preferredCurrency: profile.preferred_currency || p.preferredCurrency,
          alertLeadDays: profile.alert_lead_days || p.alertLeadDays,
          emailAlertsEnabled: profile.email_alerts_enabled ?? p.emailAlertsEnabled,
          avatar: profile.avatar_url
        };
      }
      setCurrentUser(p);

      const { data: subsData } = await supabase.from('subtrack_subscriptions').select('*').order('created_at', { ascending: false });
      
      let mappedSubs: Subscription[] = [];
      if (subsData) {
        mappedSubs = subsData.map(s => ({
            id: s.id,
            userId: s.user_id,
            name: s.name,
            description: s.description,
            category: s.category as any,
            cost: Number(s.cost),
            currency: s.currency as any,
            billingCycle: s.billing_cycle as any,
            paymentMethod: s.payment_method as any,
            startDate: s.start_date,
            nextRenewalDate: s.next_renewal_date,
            status: s.status as any,
            isFreeTrial: s.is_free_trial,
            trialStartDate: s.trial_start_date,
            trialEndDate: s.trial_end_date,
            autoRenewsAfterTrial: s.auto_renews_after_trial,
            trialConvertedCost: s.trial_converted_cost ? Number(s.trial_converted_cost) : undefined,
            brandColor: s.brand_color,
            websiteUrl: s.website_url,
            cancelUrl: s.cancel_url,
            notes: s.notes,
            alertDaysBefore: s.alert_days_before,
            createdAt: s.created_at,
            updatedAt: s.updated_at
        }));
        setSubscriptions(mappedSubs);
      }

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
        currency: targetCurrency,
        totalMonthlySpend,
        totalAnnualSpend: totalMonthlySpend * 12,
        activeCount: activeSubs.length,
        trialsCount: trialSubs.length,
        totalSubsCount: mappedSubs.length,
        categoryBreakdown: Object.entries(categoryTotals).map(([name, value]) => ({
          name,
          value: Number((value as number).toFixed(2)),
          percentage: totalMonthlySpend > 0 ? Number((((value as number) / totalMonthlySpend) * 100).toFixed(1)) : 0,
        })),
        upcomingRenewals: []
      });

      const { data: notifsData } = await supabase.from('subtrack_notifications').select('*').order('created_at', { ascending: false });
      if (notifsData) {
        setNotifications(notifsData.map(n => ({
            id: n.id,
            userId: n.user_id,
            subscriptionId: n.subscription_id || undefined,
            subscriptionName: n.subscription_name,
            type: n.type as any,
            title: n.title,
            message: n.message,
            renewalDate: n.renewal_date,
            amount: Number(n.amount),
            currency: n.currency as any,
            daysRemaining: n.days_remaining,
            sentAt: n.sent_at,
            status: n.status as any,
            emailRecipient: n.email_recipient,
            emailHtmlPreview: n.email_html_preview,
            read: n.read
        })));
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [session?.user?.id]);

  useEffect(() => {
    if (session?.user?.id) {
      fetchAllData(session.user.id);
    }
  }, [session?.user?.id, fetchAllData]);

  // Handle Switch User (Disabled in SaaS mode, but kept for signature)
  const handleSwitchUser = async (userId: string) => {
    // Only real users now. Switch user shouldn't do anything for real logged-in users.
  };

  // Handle Currency Change
  const handleUpdateCurrency = async (newCurrency: CurrencyCode) => {
    if (!session?.user?.id) return;
    try {
      const { error } = await supabase.from('subtrack_profiles').update({ preferred_currency: newCurrency }).eq('id', session.user.id);
      if (!error) {
        setCurrentUser(prev => ({ ...prev, preferredCurrency: newCurrency }));
        fetchAllData(session.user.id);
        showToast(`Currency updated to ${newCurrency}`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Subscriptions CRUD Handlers
  const handleSaveSubscription = async (subData: Partial<Subscription>) => {
    if (!session?.user?.id) return;
    
    // Enforce Free Tier Limit (Max 5 Active/Trial Subscriptions)
    if (currentUser?.tier === 'free' && !subData.id) {
      const activeCount = subscriptions.filter(s => s.status === 'active' || s.status === 'trial').length;
      if (activeCount >= 5) {
        setIsUpgradeModalOpen(true);
        showToast('Free tier is limited to 5 active subscriptions. Upgrade to Pro for unlimited tracking.', 'error');
        return;
      }
    }

    try {
      const isEdit = Boolean(subData.id);
      const dbSub = {
        user_id: session.user.id,
        name: subData.name,
        description: subData.description,
        category: subData.category,
        cost: subData.cost,
        currency: subData.currency,
        billing_cycle: subData.billingCycle,
        payment_method: subData.paymentMethod,
        start_date: subData.startDate,
        next_renewal_date: subData.nextRenewalDate,
        status: subData.status,
        is_free_trial: subData.isFreeTrial,
        trial_start_date: subData.trialStartDate,
        trial_end_date: subData.trialEndDate,
        auto_renews_after_trial: subData.autoRenewsAfterTrial,
        trial_converted_cost: subData.trialConvertedCost,
        brand_color: subData.brandColor,
        website_url: subData.websiteUrl,
        cancel_url: subData.cancelUrl,
        notes: subData.notes,
        alert_days_before: subData.alertDaysBefore,
        updated_at: new Date().toISOString()
      };

      if (isEdit) {
        const { error } = await supabase.from('subtrack_subscriptions').update(dbSub).eq('id', subData.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('subtrack_subscriptions').insert(dbSub);
        if (error) throw error;
      }

      await fetchAllData(session.user.id);
      showToast(isEdit ? 'Subscription updated successfully' : 'Subscription created successfully');
    } catch (err) {
      console.error(err);
      showToast('An error occurred while saving', 'error');
    }
  };

  const handleDeleteSubscription = async (id: string) => {
    try {
      const { error } = await supabase.from('subtrack_subscriptions').delete().eq('id', id);
      if (!error) {
        await fetchAllData(session?.user?.id);
        showToast('Subscription removed');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleStatus = async (sub: Subscription) => {
    const nextStatus = sub.status === 'paused' ? 'active' : 'paused';
    try {
      const { error } = await supabase.from('subtrack_subscriptions').update({ status: nextStatus, updated_at: new Date().toISOString() }).eq('id', sub.id);
      if (!error) {
        await fetchAllData(session?.user?.id);
        showToast(nextStatus === 'paused' ? `Paused ${sub.name}` : `Resumed ${sub.name}`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Reset Demo Dataset
  const handleResetSeed = async () => {
    showToast('Demo reset disabled in live SaaS mode', 'info');
  };

  // Pro Upgrade Confirmation (Stripe Checkout via Netlify Functions)
  const handleConfirmUpgrade = async () => {
    if (!session?.user?.id) return;
    try {
      const res = await fetch('/.netlify/functions/stripe-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: session.user.id, userEmail: session.user.email }),
      });
      const data = await res.json();
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        showToast('Checkout session failed to create', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Error connecting to Stripe', 'error');
    }
  };

  // Downgrade Pro
  const handleCancelPro = async () => {
    showToast('Downgrade flows are handled via Stripe Customer Portal.', 'info');
  };

  // Run Cron Engine
  const handleTriggerCron = async (): Promise<CronRunResult> => {
    try {
      const res = await fetch('/.netlify/functions/cron-check', { method: 'POST' });
      const data = await res.json();
      await fetchAllData(session?.user?.id);
      return { 
        timestamp: new Date().toISOString(), 
        scannedCount: 0, 
        alertsTriggered: data.alertsTriggered || 0, 
        notificationsCreated: [], 
        message: 'Cron executed successfully' 
      };
    } catch (err) {
      console.error(err);
      return { timestamp: '', scannedCount: 0, alertsTriggered: 0, notificationsCreated: [], message: 'Cron failed' };
    }
  };

  // Mark notification read
  const handleMarkNotifRead = async (id: string) => {
    await supabase.from('subtrack_notifications').update({ read: true }).eq('id', id);
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const handleDeleteNotif = async (id: string) => {
    await supabase.from('subtrack_notifications').delete().eq('id', id);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  // Potential savings calculation
  const potentialSavings = subscriptions
    .filter((s) => s.billingCycle === 'monthly' && s.status === 'active' && !s.isFreeTrial)
    .reduce((acc, sub) => {
      const cost = convertCurrency(sub.cost, sub.currency, currentUser.preferredCurrency);
      return acc + cost * 12 * 0.18;
    }, 0);

  const unreadNotifsCount = notifications.filter((n) => !n.read).length;

  // View Navigation Handlers
  const handleEnterDashboard = async (tier: 'free' | 'pro' = 'pro') => {
    if (!session) {
      setCurrentView('auth');
      if (typeof window !== 'undefined') {
        window.location.hash = 'auth';
      }
      return;
    }
    
    // Fallback to demo user if session is there but we haven't fully migrated backend yet
    const targetUserId = tier === 'free' ? 'user_sarah' : 'user_alex';
    await handleSwitchUser(targetUserId);
    setCurrentView('dashboard');
    if (typeof window !== 'undefined') {
      window.location.hash = 'dashboard';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleOpenStripeFromLanding = async () => {
    await handleSwitchUser('user_sarah');
    setCurrentView('dashboard');
    setIsUpgradeModalOpen(true);
    if (typeof window !== 'undefined') {
      window.location.hash = 'dashboard';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBackToLanding = () => {
    setCurrentView('landing');
    if (typeof window !== 'undefined') {
      window.history.pushState(null, '', window.location.pathname);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setCurrentView('landing');
    if (typeof window !== 'undefined') {
      window.location.hash = '';
    }
  };

  // Listen to popstate / hash change
  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash === '#dashboard') {
        setCurrentView('dashboard');
      } else if (window.location.hash === '#auth') {
        setCurrentView('auth');
      } else if (!window.location.hash || window.location.hash === '#top') {
        // Only set to landing if hash is empty or top
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Render Landing Page View
  if (currentView === 'landing') {
    return (
      <>
        {/* Toast Notification */}
        {toastMessage && (
          <div className="fixed bottom-5 right-5 z-50 animate-bounce-short">
            <div
              className={`px-4 py-3 rounded-xl shadow-lg border text-xs sm:text-sm font-medium flex items-center space-x-2.5 backdrop-blur-md ${
                toastMessage.type === 'error'
                  ? 'bg-white border-red-200 text-red-700'
                  : toastMessage.type === 'info'
                  ? 'bg-white border-blue-200 text-blue-700'
                  : 'bg-white border-emerald-200 text-emerald-700'
              }`}
            >
              {toastMessage.type === 'error' ? (
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              )}
              <span>{toastMessage.text}</span>
            </div>
          </div>
        )}

        <LandingPage
          onEnterDashboard={handleEnterDashboard}
          onOpenStripeCheckout={handleOpenStripeFromLanding}
        />

        {/* Global Modals for Landing Page Actions */}
        <UpgradeModal
          isOpen={isUpgradeModalOpen}
          onClose={() => setIsUpgradeModalOpen(false)}
          user={currentUser}
          onConfirmUpgrade={handleConfirmUpgrade}
        />
      </>
    );
  }

  if (currentView === 'auth') {
    return <Auth />;
  }

  // Render Live Dashboard View
  return (
    <div className="min-h-screen bg-[#F9FAFB] text-slate-900 flex flex-col font-sans antialiased selection:bg-blue-600 selection:text-white">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 animate-bounce-short">
          <div
            className={`px-4 py-3 rounded-xl shadow-lg border text-xs sm:text-sm font-medium flex items-center space-x-2.5 backdrop-blur-md ${
              toastMessage.type === 'error'
                ? 'bg-white border-red-200 text-red-700'
                : toastMessage.type === 'info'
                ? 'bg-white border-blue-200 text-blue-700'
                : 'bg-white border-emerald-200 text-emerald-700'
            }`}
          >
            {toastMessage.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            )}
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}

      {/* Top Navigation with Back to Landing Link */}
      <Navbar
        user={currentUser}
        onSwitchUser={handleSwitchUser}
        onUpdateCurrency={handleUpdateCurrency}
        onOpenAddModal={() => {
          setSubToEdit(null);
          setIsSubModalOpen(true);
        }}
        onOpenUpgradeModal={() => setIsUpgradeModalOpen(true)}
        onOpenProfileModal={() => setIsProfileModalOpen(true)}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onOpenOptimizer={() => setIsOptimizerOpen(true)}
        onOpenExportModal={() => {
          if (currentUser?.tier === 'free') {
            setIsUpgradeModalOpen(true);
            showToast('CSV Export is a Pro feature. Upgrade to unlock.', 'error');
            return;
          }
          setIsExportModalOpen(true);
        }}
        onResetSeed={handleResetSeed}
        unreadNotifsCount={unreadNotifsCount}
        onBackToLanding={handleBackToLanding}
        onSignOut={handleSignOut}
      />

      {/* Main Content Dashboard */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 text-slate-500 space-y-3">
            <RotateCw className="w-8 h-8 animate-spin text-blue-600" />
            <p className="text-sm font-medium">Loading SubTrack Engine...</p>
          </div>
        ) : (
          <>
            {/* Free Trial Countdown Banner (If active trials exist) */}
            <TrialTrackerBanner
              subscriptions={subscriptions}
              preferredCurrency={currentUser.preferredCurrency}
              onEditSubscription={(sub) => {
                setSubToEdit(sub);
                setIsSubModalOpen(true);
              }}
            />

            {/* Financial Overview Metrics */}
            <AnalyticsOverview
              monthlySpend={analyticsData.totalMonthlySpend}
              annualSpend={analyticsData.totalAnnualSpend}
              activeCount={analyticsData.activeCount}
              trialsCount={analyticsData.trialsCount}
              totalCount={analyticsData.totalSubsCount}
              currency={currentUser.preferredCurrency}
              userTier={currentUser.tier}
              onOpenUpgradeModal={() => setIsUpgradeModalOpen(true)}
              potentialAnnualSavings={potentialSavings}
              onOpenOptimizer={() => setIsOptimizerOpen(true)}
            />

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Category Breakdown Donut */}
              <CategoryBreakdownChart
                data={analyticsData.categoryBreakdown}
                currency={currentUser.preferredCurrency}
                totalMonthly={analyticsData.totalMonthlySpend}
              />

              {/* Monthly Spend Trends & Forecast */}
              <SpendTrendChart
                monthlySpend={analyticsData.totalMonthlySpend}
                currency={currentUser.preferredCurrency}
              />
            </div>

            {/* Upcoming Renewal Schedule & Timeline */}
            <RenewalCalendar
              subscriptions={subscriptions}
              preferredCurrency={currentUser.preferredCurrency}
              onEditSubscription={(sub) => {
                setSubToEdit(sub);
                setIsSubModalOpen(true);
              }}
            />

            {/* Primary Subscription Engine Table & CRUD */}
            <SubscriptionList
              subscriptions={subscriptions}
              preferredCurrency={currentUser.preferredCurrency}
              onEdit={(sub) => {
                setSubToEdit(sub);
                setIsSubModalOpen(true);
              }}
              onDelete={handleDeleteSubscription}
              onToggleStatus={handleToggleStatus}
              onAddNew={() => {
                setSubToEdit(null);
                setIsSubModalOpen(true);
              }}
            />
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white text-slate-500 text-xs py-6 px-4 text-center">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© 2026 SubTrack — Clean Minimalism Personal Finance & Subscription Tracker.</p>
          <div className="flex items-center space-x-4 text-slate-500">
            <span>Stripe Checkout & Webhooks</span>
            <span>•</span>
            <span>Resend 3-Day Renewal Alerts</span>
            <span>•</span>
            <span>Role-Based Queries</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <SubscriptionModal
        isOpen={isSubModalOpen}
        onClose={() => {
          setIsSubModalOpen(false);
          setSubToEdit(null);
        }}
        onSave={handleSaveSubscription}
        subscriptionToEdit={subToEdit}
        preferredCurrency={currentUser.preferredCurrency}
      />

      <UpgradeModal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
        user={currentUser}
        onConfirmUpgrade={handleConfirmUpgrade}
      />

      <CostOptimizerModal
        isOpen={isOptimizerOpen}
        onClose={() => setIsOptimizerOpen(false)}
        subscriptions={subscriptions}
        preferredCurrency={currentUser.preferredCurrency}
        userTier={currentUser.tier}
        onOpenUpgrade={() => setIsUpgradeModalOpen(true)}
        onEditSubscription={(sub) => {
          setSubToEdit(sub);
          setIsSubModalOpen(true);
        }}
      />

      <NotificationCenterModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        notifications={notifications}
        onMarkAsRead={handleMarkNotifRead}
        onDeleteNotification={handleDeleteNotif}
        onTriggerCron={handleTriggerCron}
      />

      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        user={currentUser}
        onUpdateProfile={async (updated) => {
          if (!session?.user?.id) return;
          const { error } = await supabase.from('subtrack_profiles').update({
            name: updated.name,
            email: updated.email,
            preferred_currency: updated.preferredCurrency,
            alert_lead_days: updated.alertLeadDays,
            email_alerts_enabled: updated.emailAlertsEnabled
          }).eq('id', session.user.id);
          
          if (!error) {
            setCurrentUser(prev => ({ ...prev, ...updated }));
            fetchAllData(session.user.id);
          }
        }}
        onOpenUpgrade={() => setIsUpgradeModalOpen(true)}
        onCancelPro={handleCancelPro}
      />

      <CsvExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        user={currentUser}
        subscriptions={subscriptions}
        preferredCurrency={currentUser.preferredCurrency}
        onOpenUpgrade={() => setIsUpgradeModalOpen(true)}
      />
    </div>
  );
}
