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
