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

export default function App() {
  // Navigation View State: 'landing' vs 'dashboard'
  const [currentView, setCurrentView] = useState<'landing' | 'dashboard'>(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash;
      const path = window.location.pathname;
      if (hash === '#dashboard' || path.includes('/dashboard')) {
        return 'dashboard';
      }
    }
    return 'landing';
  });

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
  const fetchAllData = useCallback(async (userId: string = currentUser.id) => {
    try {
      setIsLoading(true);
      const [profileRes, subsRes, analyticsRes, notifsRes] = await Promise.all([
        fetch(`/api/profile?userId=${userId}`),
        fetch(`/api/subscriptions?userId=${userId}`),
        fetch(`/api/analytics?userId=${userId}`),
        fetch(`/api/notifications?userId=${userId}`),
      ]);

      if (profileRes.ok) {
        const p = await profileRes.json();
        setCurrentUser(p);
      }
      if (subsRes.ok) {
        const s = await subsRes.json();
        setSubscriptions(s);
      }
      if (analyticsRes.ok) {
        const a = await analyticsRes.json();
        setAnalyticsData(a);
      }
      if (notifsRes.ok) {
        const n = await notifsRes.json();
        setNotifications(n);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [currentUser.id]);

  useEffect(() => {
    fetchAllData(currentUser.id);
  }, [currentUser.id, fetchAllData]);

  // Handle Switch User (e.g. Alex [Pro] vs Sarah [Free Demo])
  const handleSwitchUser = async (userId: string) => {
    await fetchAllData(userId);
    showToast(`Switched active profile to ${userId === 'user_alex' ? 'Alex Rivera (Pro)' : 'Sarah Chen (Free Tier)'}`, 'info');
  };

  // Handle Currency Change
  const handleUpdateCurrency = async (newCurrency: CurrencyCode) => {
    try {
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...currentUser, preferredCurrency: newCurrency }),
      });
      if (res.ok) {
        const updated = await res.json();
        setCurrentUser(updated);
        fetchAllData(currentUser.id);
        showToast(`Currency updated to ${newCurrency}`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Subscriptions CRUD Handlers
  const handleSaveSubscription = async (subData: Partial<Subscription>) => {
    try {
      const isEdit = Boolean(subData.id);
      const url = isEdit ? `/api/subscriptions/${subData.id}` : '/api/subscriptions';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...subData, userId: currentUser.id }),
      });

      if (!res.ok) {
        const err = await res.json();
        if (res.status === 403) {
          setIsUpgradeModalOpen(true);
          showToast(err.message || 'Free tier subscription limit reached.', 'error');
          return;
        }
        showToast('Failed to save subscription', 'error');
        return;
      }

      await fetchAllData(currentUser.id);
      showToast(isEdit ? 'Subscription updated successfully' : 'Subscription created successfully');
    } catch (err) {
      console.error(err);
      showToast('An error occurred while saving', 'error');
    }
  };

  const handleDeleteSubscription = async (id: string) => {
    try {
      const res = await fetch(`/api/subscriptions/${id}?userId=${currentUser.id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        await fetchAllData(currentUser.id);
        showToast('Subscription removed');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleStatus = async (sub: Subscription) => {
    const nextStatus = sub.status === 'paused' ? 'active' : 'paused';
    try {
      const res = await fetch(`/api/subscriptions/${sub.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...sub, status: nextStatus, userId: currentUser.id }),
      });
      if (res.ok) {
        await fetchAllData(currentUser.id);
        showToast(nextStatus === 'paused' ? `Paused ${sub.name}` : `Resumed ${sub.name}`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Reset Demo Dataset
  const handleResetSeed = async () => {
    try {
      const res = await fetch('/api/subscriptions/reset-seed', { method: 'POST' });
      if (res.ok) {
        await fetchAllData(currentUser.id);
        showToast('Demo dataset reset to initial state');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Pro Upgrade Confirmation
  const handleConfirmUpgrade = async () => {
    const res = await fetch('/api/stripe/confirm-upgrade', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: currentUser.id }),
    });
    if (res.ok) {
      const data = await res.json();
      setCurrentUser(data.user);
      await fetchAllData(currentUser.id);
      showToast('🎉 Welcome to SubTrack Pro! Unlimited tracking & email alerts active.', 'success');
    }
  };

  // Downgrade Pro
  const handleCancelPro = async () => {
    const res = await fetch('/api/stripe/cancel-pro', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: currentUser.id }),
    });
    if (res.ok) {
      const data = await res.json();
      setCurrentUser(data.user);
      setIsProfileModalOpen(false);
      showToast('Downgraded to Free Tier plan', 'info');
    }
  };

  // Run Cron Engine
  const handleTriggerCron = async (): Promise<CronRunResult> => {
    const res = await fetch('/api/cron/renewals-check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: currentUser.id }),
    });
    const result: CronRunResult = await res.json();
    await fetchAllData(currentUser.id);
    return result;
  };

  // Mark notification read
  const handleMarkNotifRead = async (id: string) => {
    await fetch(`/api/notifications/${id}/read?userId=${currentUser.id}`, { method: 'PUT' });
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const handleDeleteNotif = async (id: string) => {
    await fetch(`/api/notifications/${id}?userId=${currentUser.id}`, { method: 'DELETE' });
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

  // Listen to popstate / hash change
  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash === '#dashboard') {
        setCurrentView('dashboard');
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
        onOpenExportModal={() => setIsExportModalOpen(true)}
        onResetSeed={handleResetSeed}
        unreadNotifsCount={unreadNotifsCount}
        onBackToLanding={handleBackToLanding}
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
          const res = await fetch('/api/profile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...currentUser, ...updated }),
          });
          if (res.ok) {
            const data = await res.json();
            setCurrentUser(data);
            fetchAllData(data.id);
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
