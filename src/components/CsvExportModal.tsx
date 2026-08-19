import React from 'react';
import { 
  X, 
  Download, 
  FileSpreadsheet, 
  Lock, 
  Sparkles, 
  ShieldCheck 
} from 'lucide-react';
import { UserProfile, Subscription, CurrencyCode } from '../types';
import { getMonthlyEquivalent } from '../utils/currency';

interface CsvExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  subscriptions: Subscription[];
  preferredCurrency: CurrencyCode;
  onOpenUpgrade: () => void;
}

export const CsvExportModal: React.FC<CsvExportModalProps> = ({
  isOpen,
  onClose,
  user,
  subscriptions,
  preferredCurrency,
  onOpenUpgrade,
}) => {
  if (!isOpen) return null;

  const isPro = user.tier === 'pro';

  const handleDownloadCsv = () => {
    const headers = [
      'ID',
      'Name',
      'Category',
      'Cost',
      'Currency',
      'Billing Cycle',
      `Monthly Equivalent (${preferredCurrency})`,
      'Payment Method',
      'Start Date',
      'Next Renewal Date',
      'Status',
      'Is Free Trial',
      'Trial End Date',
      'Direct Cancel URL',
      'Notes',
    ];

    const rows = subscriptions.map((s) => [
      s.id,
      `"${s.name.replace(/"/g, '""')}"`,
      `"${s.category}"`,
      s.cost,
      s.currency,
      s.billingCycle,
      getMonthlyEquivalent(s.cost, s.billingCycle, s.currency, preferredCurrency).toFixed(2),
      `"${s.paymentMethod}"`,
      s.startDate,
      s.nextRenewalDate,
      s.status,
      s.isFreeTrial ? 'Yes' : 'No',
      s.trialEndDate || '',
      `"${s.cancelUrl || ''}"`,
      `"${(s.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `subtrack_subscriptions_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full flex flex-col shadow-xl text-slate-900">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">CSV Financial Data Export</h3>
              <p className="text-xs text-slate-500">Download formatted spreadsheet for Excel/Sheets</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs text-slate-600">
            <div className="flex items-center justify-between font-semibold text-slate-900">
              <span>Ready for Export:</span>
              <span className="text-blue-600 font-bold">{subscriptions.length} Subscriptions</span>
            </div>
            <p>
              Includes name, categories, normalized monthly costs in {preferredCurrency}, renewal dates, payment methods, trial flags, and direct cancellation URLs.
            </p>
          </div>

          {!isPro ? (
            /* Locked state */
            <div className="p-4 bg-blue-50/80 border border-blue-200 rounded-xl space-y-3">
              <div className="flex items-center space-x-2 text-blue-950 font-semibold text-sm">
                <Lock className="w-4 h-4 text-blue-600" />
                <span>Pro Membership Required</span>
              </div>
              <p className="text-xs text-blue-800 leading-relaxed">
                CSV Export is an exclusive SubTrack Pro feature. Upgrade to Pro ($5/mo) to unlock instant spreadsheet export, unlimited subscriptions, and automated email alerts.
              </p>
              <button
                onClick={() => {
                  onClose();
                  onOpenUpgrade();
                }}
                className="w-full py-2.5 bg-blue-600 text-white font-semibold text-xs rounded-lg hover:bg-blue-500 transition-all flex items-center justify-center space-x-1.5 shadow-sm"
              >
                <Sparkles className="w-4 h-4" />
                <span>Upgrade to Pro ($5/mo)</span>
              </button>
            </div>
          ) : (
            /* Unlocked download button */
            <div className="space-y-3 pt-2">
              <div className="flex items-center space-x-2 text-xs text-emerald-700">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Pro Feature Unlocked</span>
              </div>
              <button
                onClick={handleDownloadCsv}
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm rounded-lg shadow-sm transition-all flex items-center justify-center space-x-2 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download .CSV Spreadsheet</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
