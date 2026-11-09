import { useEffect, useState } from 'react';
import { useToast } from './useToast';
import { useModalState } from './useModalState';
import { useAuth } from './useAuth';
import { useAppData } from './useAppData';
import { useSubscriptions } from './useSubscriptions';
import { useProfileActions } from './useProfileActions';
import { useNotifications } from './useNotifications';

export function useSubtrackApp() {
  const toast = useToast();
  const modals = useModalState();
  const auth = useAuth({ showToast: toast.showToast, setIsUpgradeModalOpen: modals.setIsUpgradeModalOpen });
  const data = useAppData({ session: auth.session });

  // Handle the return from Stripe Checkout: ?upgrade=success or ?upgrade=cancelled.
  // The flag is cleared from the URL right away, so this message shows once.
  const [pendingUpgradeRefresh, setPendingUpgradeRefresh] = useState(false);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const upgrade = params.get('upgrade');
    if (!upgrade) return;

    if (upgrade === 'success') {
      toast.showToast('Welcome to SubTrack Pro! Your plan will update in a moment.', 'success');
      setPendingUpgradeRefresh(true);
    } else if (upgrade === 'cancelled') {
      toast.showToast('Upgrade cancelled. You are still on the Free plan.', 'info');
    }

    params.delete('upgrade');
    params.delete('session_id');
    const query = params.toString();
    window.history.replaceState(null, '', window.location.pathname + (query ? `?${query}` : '') + window.location.hash);
  }, []);

  // Pro is granted by the Stripe webhook, which can land after the redirect. Re-read the profile
  // once the user is signed in, a few seconds later.
  useEffect(() => {
    if (!pendingUpgradeRefresh || !auth.session?.user?.id) return;
    const timer = setTimeout(() => {
      data.fetchAllData(auth.session.user.id);
      setPendingUpgradeRefresh(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, [pendingUpgradeRefresh, auth.session?.user?.id, data.fetchAllData]);

  const subs = useSubscriptions({
    session: auth.session,
    currentUser: data.currentUser,
    subscriptions: data.subscriptions,
    fetchAllData: data.fetchAllData,
    showToast: toast.showToast,
    setIsUpgradeModalOpen: modals.setIsUpgradeModalOpen,
  });

  const profile = useProfileActions({
    session: auth.session,
    currentUser: data.currentUser,
    showToast: toast.showToast,
    setCurrentUser: data.setCurrentUser,
    fetchAllData: data.fetchAllData,
    setCurrentView: auth.setCurrentView,
    getAccessToken: auth.getAccessToken,
    signOut: auth.handleSignOut,
    isGuest: auth.session?.user?.is_anonymous === true,
  });

  const notifs = useNotifications({
    notifications: data.notifications,
    setNotifications: data.setNotifications,
    session: auth.session,
    fetchAllData: data.fetchAllData,
  });

  return {
    // Toast
    ...toast,
    // Auth & routing
    ...auth,
    // Modal states
    ...modals,
    // Data
    currentUser: data.currentUser,
    setCurrentUser: data.setCurrentUser,
    subscriptions: data.subscriptions,
    notifications: data.notifications,
    analyticsData: data.analyticsData,
    isLoading: data.isLoading,
    fetchAllData: data.fetchAllData,
    // Subscription actions
    ...subs,
    // Profile actions
    ...profile,
    // Notification actions
    ...notifs,
  };
}
