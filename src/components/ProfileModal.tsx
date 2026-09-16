import React, { useState } from 'react';
import { 
  X, 
  User, 
  Check, 
  Sparkles, 
  DollarSign,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import { UserProfile, CurrencyCode } from '../types';
import { CURRENCIES } from '../utils/currency';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  session?: any;
  onUpdateProfile: (updated: Partial<UserProfile>) => void;
  onOpenUpgrade: () => void;
  onCancelPro: () => void;
  onDeleteAccount: () => Promise<void>;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  user,
  session,
  onUpdateProfile,
  onOpenUpgrade,
  onCancelPro,
  onDeleteAccount,
}) => {
  const isGuest = session?.user?.is_anonymous ?? false;
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [preferredCurrency, setPreferredCurrency] = useState<CurrencyCode>(user.preferredCurrency);
  const [alertLeadDays, setAlertLeadDays] = useState(user.alertLeadDays || 3);
  const [emailAlertsEnabled, setEmailAlertsEnabled] = useState(user.emailAlertsEnabled ?? true);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [showDeleteZone, setShowDeleteZone] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({
      name,
      email,
      preferredCurrency,
      alertLeadDays,
      emailAlertsEnabled,
    });
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-xl text-slate-900">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Profile & Preferences</h3>
              <p className="text-xs text-slate-500">Manage account currency, alerts, and tier</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-5 flex-1">
          {/* Tier Banner matching Clean Minimalism */}
          <div
            className={`p-4 rounded-xl border flex items-center justify-between ${
              user.tier === 'pro'
                ? 'bg-blue-50/80 border-blue-200'
                : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-slate-900 text-sm">
                  {user.tier === 'pro' ? 'SubTrack Pro Active' : 'Free Tier Plan'}
                </span>
                {user.tier === 'pro' ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-300">
                    PRO ($5/MO)
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded text-[10px] bg-slate-200 text-slate-700 font-medium">
                    Max 5 Subs
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-600 mt-1">
                {user.tier === 'pro'
                  ? 'Unlimited subscriptions, CSV exports & automated email alerts enabled.'
                  : 'Upgrade to remove subscription caps and activate automated email notifications.'}
              </p>
            </div>

            <div>
              {user.tier === 'pro' ? (
                <button
                  type="button"
                  onClick={onCancelPro}
                  className="px-2.5 py-1 text-xs text-red-600 hover:text-red-700 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                >
                  Downgrade
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenUpgrade();
                  }}
                  className="px-3 py-1.5 bg-blue-600 text-white font-semibold text-xs rounded-lg hover:bg-blue-500 transition-all flex items-center space-x-1"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Upgrade</span>
                </button>
              )}
            </div>
          </div>

          {/* Core Info */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            {isGuest ? (
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Email Address</label>
                <div className="w-full px-3 py-2 text-sm bg-slate-100 border border-slate-200 rounded-lg text-slate-400 italic">
                  Guest session — no email on file
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            )}
          </div>

          {/* Multi-Currency Selection */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Preferred Base Currency
            </label>
            <select
              value={preferredCurrency}
              onChange={(e) => setPreferredCurrency(e.target.value as CurrencyCode)}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              {Object.values(CURRENCIES).map((curr) => (
                <option key={curr.code} value={curr.code}>
                  {curr.symbol} {curr.code} - {curr.name}
                </option>
              ))}
            </select>
          </div>

          {/* Email Notification & Renewal Lead Time */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-slate-900">Automated Email Renewal Alerts</div>
                <div className="text-[11px] text-slate-500">Receive Resend/SendGrid alerts before card charge</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={emailAlertsEnabled}
                  onChange={(e) => setEmailAlertsEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">
                Default Alert Lead Time
              </label>
              <select
                value={alertLeadDays}
                onChange={(e) => setAlertLeadDays(Number(e.target.value))}
                className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value={1}>1 Day Before Renewal</option>
                <option value={3}>3 Days Before Renewal (Standard)</option>
                <option value={5}>5 Days Before Renewal</option>
                <option value={7}>7 Days Before Renewal</option>
              </select>
            </div>
          </div>
        </form>

        {/* Danger Zone — subtle, not inviting */}
        {!isGuest && (
          <div className="mx-5 mb-4">
            {!showDeleteZone ? (
              <button
                type="button"
                onClick={() => { setShowDeleteZone(true); setDeleteConfirmText(''); }}
                className="text-xs text-slate-400 hover:text-red-500 transition-colors underline underline-offset-2"
              >
                Delete account
              </button>
            ) : (
              <div className="p-4 rounded-xl border border-red-200 bg-red-50">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                    <span className="text-sm font-semibold text-red-700">Delete Account</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => { setShowDeleteZone(false); setDeleteConfirmText(''); }}
                    className="text-xs text-slate-400 hover:text-slate-600"
                  >
                    Cancel
                  </button>
                </div>
                <p className="text-xs text-red-700 mb-2">
                  This action is <strong>irreversible</strong>. All your subscriptions, notifications, and account data will be permanently removed. Type <strong>DELETE</strong> to confirm.
                </p>
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder="Type DELETE to confirm"
                  className="w-full px-3 py-1.5 text-xs border border-red-300 rounded-lg bg-white text-red-900 placeholder-red-300 focus:outline-none focus:ring-2 focus:ring-red-400 mb-2"
                />
                <button
                  type="button"
                  disabled={deleteConfirmText !== 'DELETE' || isDeleting}
                  onClick={async () => {
                    setIsDeleting(true);
                    await onDeleteAccount();
                    setIsDeleting(false);
                  }}
                  className="w-full flex items-center justify-center space-x-1.5 py-1.5 px-3 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{isDeleting ? 'Deleting...' : 'Permanently Delete My Account'}</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
          {savedSuccess && (
            <span className="text-xs text-emerald-600 flex items-center">
              <Check className="w-3.5 h-3.5 mr-1" /> Preferences saved!
            </span>
          )}
          <div className="ml-auto flex items-center space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="px-4 py-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-lg shadow-sm"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
