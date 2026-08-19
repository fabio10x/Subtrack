import React, { useState, useEffect } from 'react';
import { 
  X, 
  Sparkles, 
  Clock, 
  CreditCard,
  DollarSign
} from 'lucide-react';
import { 
  Subscription, 
  SubscriptionCategory, 
  CurrencyCode, 
  BillingCycle, 
  PaymentMethodType 
} from '../types';
import { POPULAR_PRESETS, BrandPreset } from '../data/seedData';
import { CURRENCIES } from '../utils/currency';
import { addDaysToCurrentDate } from '../utils/dateUtils';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (subscription: Partial<Subscription>) => void;
  subscriptionToEdit?: Subscription | null;
  preferredCurrency: CurrencyCode;
}

const CATEGORIES: SubscriptionCategory[] = [
  'Entertainment',
  'Software & SaaS',
  'Cloud & Hosting',
  'Health & Fitness',
  'Productivity',
  'Utilities & Bills',
  'Gaming',
  'Food & Delivery',
  'Finance & Security',
  'Other',
];

const PAYMENT_METHODS: PaymentMethodType[] = [
  'Visa •••• 4242',
  'Mastercard •••• 8821',
  'Amex •••• 1004',
  'Apple Pay',
  'PayPal',
  'Bank Transfer',
  'Google Pay',
  'Other',
];

const BILLING_CYCLES: { id: BillingCycle; label: string }[] = [
  { id: 'monthly', label: 'Monthly' },
  { id: 'yearly', label: 'Yearly' },
  { id: 'quarterly', label: 'Quarterly' },
  { id: 'weekly', label: 'Weekly' },
];

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  subscriptionToEdit,
  preferredCurrency,
}) => {
  const isEditing = Boolean(subscriptionToEdit);

  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<SubscriptionCategory>('Software & SaaS');
  const [cost, setCost] = useState<string>('9.99');
  const [currency, setCurrency] = useState<CurrencyCode>(preferredCurrency);
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>('Visa •••• 4242');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [nextRenewalDate, setNextRenewalDate] = useState(addDaysToCurrentDate(30));
  const [brandColor, setBrandColor] = useState('#3B82F6');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [cancelUrl, setCancelUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [alertDaysBefore, setAlertDaysBefore] = useState<number>(3);

  // Free trial state
  const [isFreeTrial, setIsFreeTrial] = useState(false);
  const [trialEndDate, setTrialEndDate] = useState(addDaysToCurrentDate(7));
  const [autoRenewsAfterTrial, setAutoRenewsAfterTrial] = useState(true);
  const [trialConvertedCost, setTrialConvertedCost] = useState('14.99');

  useEffect(() => {
    if (subscriptionToEdit) {
      setName(subscriptionToEdit.name || '');
      setDescription(subscriptionToEdit.description || '');
      setCategory(subscriptionToEdit.category || 'Software & SaaS');
      setCost(subscriptionToEdit.cost.toString() || '0');
      setCurrency(subscriptionToEdit.currency || preferredCurrency);
      setBillingCycle(subscriptionToEdit.billingCycle || 'monthly');
      setPaymentMethod(subscriptionToEdit.paymentMethod || 'Visa •••• 4242');
      setStartDate(subscriptionToEdit.startDate || new Date().toISOString().split('T')[0]);
      setNextRenewalDate(subscriptionToEdit.nextRenewalDate || addDaysToCurrentDate(30));
      setBrandColor(subscriptionToEdit.brandColor || '#3B82F6');
      setWebsiteUrl(subscriptionToEdit.websiteUrl || '');
      setCancelUrl(subscriptionToEdit.cancelUrl || '');
      setNotes(subscriptionToEdit.notes || '');
      setAlertDaysBefore(subscriptionToEdit.alertDaysBefore || 3);
      setIsFreeTrial(Boolean(subscriptionToEdit.isFreeTrial));
      setTrialEndDate(subscriptionToEdit.trialEndDate || addDaysToCurrentDate(7));
      setAutoRenewsAfterTrial(subscriptionToEdit.autoRenewsAfterTrial ?? true);
      setTrialConvertedCost(subscriptionToEdit.trialConvertedCost?.toString() || '14.99');
    } else {
      // Reset for new
      setName('');
      setDescription('');
      setCategory('Software & SaaS');
      setCost('9.99');
      setCurrency(preferredCurrency);
      setBillingCycle('monthly');
      setPaymentMethod('Visa •••• 4242');
      setStartDate(new Date().toISOString().split('T')[0]);
      setNextRenewalDate(addDaysToCurrentDate(30));
      setBrandColor('#3B82F6');
      setWebsiteUrl('');
      setCancelUrl('');
      setNotes('');
      setAlertDaysBefore(3);
      setIsFreeTrial(false);
      setTrialEndDate(addDaysToCurrentDate(7));
      setAutoRenewsAfterTrial(true);
      setTrialConvertedCost('14.99');
    }
  }, [subscriptionToEdit, isOpen, preferredCurrency]);

  if (!isOpen) return null;

  const handleApplyPreset = (preset: BrandPreset) => {
    setName(preset.name);
    setCategory(preset.category);
    setCost(preset.defaultCost.toString());
    setBillingCycle(preset.billingCycle);
    setBrandColor(preset.brandColor);
    setWebsiteUrl(preset.websiteUrl);
    setCancelUrl(preset.cancelUrl);
    if (preset.billingCycle === 'yearly') {
      setNextRenewalDate(addDaysToCurrentDate(365));
    } else {
      setNextRenewalDate(addDaysToCurrentDate(30));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSave({
      ...(subscriptionToEdit || {}),
      name: name.trim(),
      description: description.trim(),
      category,
      cost: parseFloat(cost) || 0,
      currency,
      billingCycle,
      paymentMethod,
      startDate,
      nextRenewalDate: isFreeTrial ? trialEndDate : nextRenewalDate,
      brandColor,
      websiteUrl: websiteUrl.trim() || undefined,
      cancelUrl: cancelUrl.trim() || undefined,
      notes: notes.trim() || undefined,
      alertDaysBefore: Number(alertDaysBefore) || 3,
      isFreeTrial,
      status: isFreeTrial ? 'trial' : 'active',
      trialStartDate: isFreeTrial ? startDate : undefined,
      trialEndDate: isFreeTrial ? trialEndDate : undefined,
      autoRenewsAfterTrial,
      trialConvertedCost: isFreeTrial ? parseFloat(trialConvertedCost) || parseFloat(cost) : undefined,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-xl text-slate-900">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              {isEditing ? 'Edit Subscription' : 'Add New Subscription'}
            </h3>
            <p className="text-xs text-slate-500">
              Configure renewal dates, free trial countdown, and direct cancellation links
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto p-5 space-y-5 flex-1">
          {/* Quick Preset Selector (Only for new) */}
          {!isEditing && (
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center">
                <Sparkles className="w-3.5 h-3.5 mr-1 text-blue-600" />
                Quick Brand Presets
              </label>
              <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
                {POPULAR_PRESETS.slice(0, 8).map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => handleApplyPreset(preset)}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 shrink-0 flex items-center space-x-1.5 transition-colors"
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: preset.brandColor }}
                    />
                    <span>{preset.name.split(' ')[0]}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Core Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Subscription Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Netflix, ChatGPT Plus, AWS"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as SubscriptionCategory)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Pricing & Cycle */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Cost Amount *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Currency
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors"
              >
                {Object.values(CURRENCIES).map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.symbol} {c.code}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Billing Cycle
              </label>
              <select
                value={billingCycle}
                onChange={(e) => setBillingCycle(e.target.value as BillingCycle)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors"
              >
                {BILLING_CYCLES.map((bc) => (
                  <option key={bc.id} value={bc.id}>
                    {bc.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Payment Method & Renewal Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Payment Method
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethodType)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors"
              >
                {PAYMENT_METHODS.map((pm) => (
                  <option key={pm} value={pm}>
                    {pm}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Next Renewal Date *
              </label>
              <input
                type="date"
                required
                value={nextRenewalDate}
                onChange={(e) => setNextRenewalDate(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* Free Trial Countdown Engine Toggle */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-amber-600" />
                <span className="text-sm font-semibold text-slate-800">This is a Free Trial</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isFreeTrial}
                  onChange={(e) => setIsFreeTrial(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {isFreeTrial && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-200">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Trial End / Expiry Date
                  </label>
                  <input
                    type="date"
                    value={trialEndDate}
                    onChange={(e) => setTrialEndDate(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Cost After Trial ({currency})
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={trialConvertedCost}
                    onChange={(e) => setTrialConvertedCost(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Cancellation URL & Alert Days */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1 flex items-center justify-between">
                <span>Direct Cancel / Manage URL</span>
                <span className="text-[10px] text-slate-400">1-click cancel</span>
              </label>
              <input
                type="url"
                placeholder="https://service.com/account/cancel"
                value={cancelUrl}
                onChange={(e) => setCancelUrl(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Alert Days Before Renewal
              </label>
              <select
                value={alertDaysBefore}
                onChange={(e) => setAlertDaysBefore(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value={1}>1 day before renewal</option>
                <option value={3}>3 days before (Recommended)</option>
                <option value={5}>5 days before</option>
                <option value={7}>7 days before</option>
              </select>
            </div>
          </div>

          {/* Custom Notes */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Internal Notes / Reminders
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Shared with family, tax-deductible software expense, cancel before year 2"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        </form>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-end space-x-3 bg-slate-50/50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs sm:text-sm font-medium text-slate-600 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-5 py-2 text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            {isEditing ? 'Save Changes' : 'Create Subscription'}
          </button>
        </div>
      </div>
    </div>
  );
};
