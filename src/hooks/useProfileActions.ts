import { Dispatch, SetStateAction } from 'react';
import { UserProfile, CurrencyCode } from '../types';
import { supabase } from '../utils/supabase';

type ViewType = 'landing' | 'dashboard' | 'auth' | 'terms' | 'privacy';

interface UseProfileActionsProps {
  session: any;
  currentUser: UserProfile;
  showToast: (text: string, type?: 'success' | 'error' | 'info') => void;
  setCurrentUser: Dispatch<SetStateAction<UserProfile>>;
  fetchAllData: (userId?: string) => Promise<void>;
  setCurrentView: (view: ViewType) => void;
  getAccessToken: () => Promise<string | null>;
  signOut: () => Promise<void>;
  isGuest: boolean;
}

export function useProfileActions({
  session, currentUser, showToast, setCurrentUser, fetchAllData, setCurrentView,
  getAccessToken, signOut, isGuest,
}: UseProfileActionsProps) {

  const handleUpdateCurrency = async (newCurrency: CurrencyCode) => {
    if (!session?.user?.id || isGuest) return;
    try {
      const { error } = await supabase.from('subtrack_profiles')
        .update({ preferred_currency: newCurrency }).eq('id', session.user.id);
      if (!error) {
        setCurrentUser(prev => ({ ...prev, preferredCurrency: newCurrency }));
        fetchAllData(session.user.id);
        showToast(`Currency updated to ${newCurrency}`);
      }
    } catch (err) { console.error(err); }
  };

  const handleUpdateProfile = async (updated: {
    name?: string; email?: string; preferredCurrency?: string;
    alertLeadDays?: number; emailAlertsEnabled?: boolean;
  }) => {
    if (!session?.user?.id || isGuest) return;
    // Email is managed by Clerk: it is changed from the Clerk user profile, not here
    const { error } = await supabase.from('subtrack_profiles').update({
      name: updated.name, preferred_currency: updated.preferredCurrency,
      alert_lead_days: updated.alertLeadDays, email_alerts_enabled: updated.emailAlertsEnabled,
    }).eq('id', session.user.id);
    if (!error) { setCurrentUser(prev => ({ ...prev, ...updated })); fetchAllData(session.user.id); }
  };

  const authedFetch = async (path: string, body: object = {}) => {
    const token = await getAccessToken();
    if (!token) throw new Error('Not signed in');
    return fetch(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(body),
    });
  };

  const handleConfirmUpgrade = async () => {
    if (!session?.user?.id || isGuest) {
      showToast('Sign in with an account to upgrade to Pro.', 'info');
      return;
    }
    try {
      const res = await authedFetch('/.netlify/functions/stripe-checkout');
      const data = await res.json().catch(() => null);
      if (!res.ok || !data) {
        // Non-JSON or error status: the functions server is unreachable or rejected the request
        const hint = res.status === 404
          ? 'Payments server not reachable. Open the app via "npx netlify dev" (port 8888).'
          : `Checkout failed (HTTP ${res.status}).`;
        showToast(hint, 'error');
        return;
      }
      if (data.checkoutUrl && data.checkoutUrl.startsWith('https://')) {
        window.location.href = data.checkoutUrl;
        return;
      }
      if (data.simulated) {
        showToast('Payments are not configured yet (Stripe keys missing). Upgrade is unavailable.', 'info');
      } else {
        showToast(data.error || 'Checkout session failed to create', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast(err instanceof Error && err.message === 'Not signed in' ? 'Please sign in to upgrade.' : 'Error connecting to Stripe', 'error');
    }
  };

  const handleCancelPro = async () => {
    if (!session?.user?.id || isGuest) return;
    try {
      showToast('Opening Stripe Customer Portal...', 'info');
      const res = await authedFetch('/.netlify/functions/stripe-portal');
      const data = await res.json();
      if (data.portalUrl && data.portalUrl !== '#simulated-portal') window.location.href = data.portalUrl;
      else if (data.simulated) showToast('Stripe Portal is in simulated mode (no live keys configured).', 'info');
      else showToast(data.error || 'Could not open Stripe Portal', 'error');
    } catch (err) { console.error(err); showToast('Error connecting to Stripe Portal', 'error'); }
  };

  const handleDeleteAccount = async () => {
    if (!session?.user?.id || isGuest) return;
    try {
      const res = await authedFetch('/.netlify/functions/delete-account');
      const data = await res.json();
      if (data.success) {
        await signOut();
        setCurrentView('landing');
        window.location.hash = '';
        showToast('Your account has been permanently deleted.', 'info');
      } else { showToast(data.error || 'Failed to delete account', 'error'); }
    } catch (err) { console.error(err); showToast('Error deleting account', 'error'); }
  };

  return { handleUpdateCurrency, handleUpdateProfile, handleConfirmUpgrade, handleCancelPro, handleDeleteAccount };
}
