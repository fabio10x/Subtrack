import { Subscription, CurrencyCode } from '../types';
import { convertCurrency } from '../utils/currency';
import { supabase } from '../utils/supabase';

interface UseSubscriptionsProps {
  session: any;
  currentUser: { tier: string; preferredCurrency: CurrencyCode };
  subscriptions: Subscription[];
  fetchAllData: (userId?: string) => Promise<void>;
  showToast: (text: string, type?: 'success' | 'error' | 'info') => void;
  setIsUpgradeModalOpen: (open: boolean) => void;
}

export function useSubscriptions({
  session, currentUser, subscriptions, fetchAllData, showToast, setIsUpgradeModalOpen
}: UseSubscriptionsProps) {

  const handleSaveSubscription = async (subData: Partial<Subscription>) => {
    if (!session?.user?.id) return;
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
        user_id: session.user.id, name: subData.name, description: subData.description,
        category: subData.category, cost: subData.cost, currency: subData.currency,
        billing_cycle: subData.billingCycle, payment_method: subData.paymentMethod,
        start_date: subData.startDate, next_renewal_date: subData.nextRenewalDate,
        status: subData.status, is_free_trial: subData.isFreeTrial,
        trial_start_date: subData.trialStartDate, trial_end_date: subData.trialEndDate,
        auto_renews_after_trial: subData.autoRenewsAfterTrial,
        trial_converted_cost: subData.trialConvertedCost,
        brand_color: subData.brandColor, website_url: subData.websiteUrl, cancel_url: subData.cancelUrl,
        notes: subData.notes, alert_days_before: subData.alertDaysBefore,
        updated_at: new Date().toISOString(),
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
      if (!error) { await fetchAllData(session?.user?.id); showToast('Subscription removed'); }
    } catch (err) { console.error(err); }
  };

  const handleToggleStatus = async (sub: Subscription) => {
    const nextStatus = sub.status === 'paused' ? 'active' : 'paused';
    try {
      const { error } = await supabase.from('subtrack_subscriptions')
        .update({ status: nextStatus, updated_at: new Date().toISOString() }).eq('id', sub.id);
      if (!error) {
        await fetchAllData(session?.user?.id);
        showToast(nextStatus === 'paused' ? `Paused ${sub.name}` : `Resumed ${sub.name}`);
      }
    } catch (err) { console.error(err); }
  };

  const potentialSavings = subscriptions
    .filter(s => s.billingCycle === 'monthly' && s.status === 'active' && !s.isFreeTrial)
    .reduce((acc, sub) => acc + convertCurrency(sub.cost, sub.currency, currentUser.preferredCurrency) * 12 * 0.18, 0);

  return { handleSaveSubscription, handleDeleteSubscription, handleToggleStatus, potentialSavings };
}
