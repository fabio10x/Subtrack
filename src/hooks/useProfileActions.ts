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
}

export function useProfileActions({
  session, currentUser, showToast, setCurrentUser, fetchAllData, setCurrentView
}: UseProfileActionsProps) {

  const handleUpdateCurrency = async (newCurrency: CurrencyCode) => {
    if (!session?.user?.id) return;
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
    if (!session?.user?.id) return;
    if (updated.email && updated.email !== currentUser.email) {
      const { error: authError } = await supabase.auth.updateUser({ email: updated.email });
      if (authError) { showToast(authError.message, 'error'); return; }
      showToast('Confirmation email sent to both addresses. Please confirm.', 'info');
    }
    const { error } = await supabase.from('subtrack_profiles').update({
      name: updated.name, email: updated.email, preferred_currency: updated.preferredCurrency,
      alert_lead_days: updated.alertLeadDays, email_alerts_enabled: updated.emailAlertsEnabled,
    }).eq('id', session.user.id);
    if (!error) { setCurrentUser(prev => ({ ...prev, ...updated })); fetchAllData(session.user.id); }
  };

  const handleConfirmUpgrade = async () => {
    if (!session?.user?.id) return;
    try {
      const res = await fetch('/.netlify/functions/stripe-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: session.user.id, userEmail: session.user.email }),
      });
      const data = await res.json();
      if (data.checkoutUrl) window.location.href = data.checkoutUrl;
      else showToast('Checkout session failed to create', 'error');
    } catch (err) { console.error(err); showToast('Error connecting to Stripe', 'error'); }
  };

  const handleCancelPro = async () => {
    if (!session?.user?.id) return;
    try {
      showToast('Opening Stripe Customer Portal...', 'info');
      const res = await fetch('/.netlify/functions/stripe-portal', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: session.user.id }),
      });
      const data = await res.json();
      if (data.portalUrl && data.portalUrl !== '#simulated-portal') window.location.href = data.portalUrl;
      else if (data.simulated) showToast('Stripe Portal is in simulated mode (no live keys configured).', 'info');
      else showToast(data.error || 'Could not open Stripe Portal', 'error');
    } catch (err) { console.error(err); showToast('Error connecting to Stripe Portal', 'error'); }
  };

  const handleDeleteAccount = async () => {
    if (!session?.access_token) return;
    try {
      const res = await fetch('/.netlify/functions/delete-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.access_token}` },
      });
      const data = await res.json();
      if (data.success) {
        await supabase.auth.signOut();
        setCurrentView('landing');
        window.location.hash = '';
        showToast('Your account has been permanently deleted.', 'info');
      } else { showToast(data.error || 'Failed to delete account', 'error'); }
    } catch (err) { console.error(err); showToast('Error deleting account', 'error'); }
  };

  return { handleUpdateCurrency, handleUpdateProfile, handleConfirmUpgrade, handleCancelPro, handleDeleteAccount };
}
