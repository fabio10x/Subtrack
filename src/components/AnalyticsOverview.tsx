import React from 'react';
import { 
  TrendingUp, 
  Layers, 
  Clock, 
  DollarSign, 
  ArrowUpRight,
  ShieldCheck
} from 'lucide-react';
import { CurrencyCode, UserTier } from '../types';
import { formatCurrency } from '../utils/currency';

interface AnalyticsOverviewProps {
  monthlySpend: number;
  annualSpend: number;
  activeCount: number;
  trialsCount: number;
  totalCount: number;
  currency: CurrencyCode;
  userTier: UserTier;
  onOpenUpgradeModal: () => void;
  potentialAnnualSavings: number;
  onOpenOptimizer: () => void;
}

export const AnalyticsOverview: React.FC<AnalyticsOverviewProps> = ({
  monthlySpend,
  annualSpend,
  activeCount,
  trialsCount,
  currency,
  userTier,
  onOpenUpgradeModal,
  potentialAnnualSavings,
  onOpenOptimizer,
}) => {
  const isFree = userTier === 'free';
  const freeMax = 5;

  return (
    <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-5 mb-6">
      {/* Monthly Spend Card */}
      <div 
        id="card-monthly-spend"
        className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 flex flex-col justify-between hover:border-slate-300 transition-all shadow-xs"
      >
        <div className="flex items-center justify-between">
          <span className="text-[11px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Monthly Spend
          </span>
          <div className="p-1.5 sm:p-2 rounded-xl bg-blue-50 text-blue-600">
            <DollarSign className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
        </div>
        <div className="mt-2.5 sm:mt-3">
          <div className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight truncate">
            {formatCurrency(monthlySpend, currency)}
          </div>
          <div className="flex items-center text-[11px] sm:text-xs text-slate-500 mt-1">
            <span>Base in {currency}</span>
          </div>
        </div>
      </div>

      {/* Annual Spend Run-rate */}
      <div 
        id="card-annual-spend"
        className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 flex flex-col justify-between hover:border-slate-300 transition-all shadow-xs"
      >
        <div className="flex items-center justify-between">
          <span className="text-[11px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Annual Run Rate
          </span>
          <div className="p-1.5 sm:p-2 rounded-xl bg-indigo-50 text-indigo-600">
            <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
        </div>
        <div className="mt-2.5 sm:mt-3">
          <div className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight truncate">
            {formatCurrency(annualSpend, currency)}
          </div>
          <div className="flex items-center text-[11px] sm:text-xs text-slate-500 mt-1">
            <span>12-month projection</span>
          </div>
        </div>
      </div>

      {/* Active Subscriptions / Tier Limit */}
      <div 
        id="card-active-subscriptions"
        className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 flex flex-col justify-between hover:border-slate-300 transition-all shadow-xs"
      >
        <div className="flex items-center justify-between">
          <span className="text-[11px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Active Trackers
          </span>
          <div className="p-1.5 sm:p-2 rounded-xl bg-emerald-50 text-emerald-600">
            <Layers className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
        </div>
        <div className="mt-2.5 sm:mt-3">
          <div className="flex items-baseline space-x-2 flex-wrap">
            <span className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              {activeCount}
            </span>
            {isFree ? (
              <span className="text-[10px] sm:text-xs text-amber-700 bg-amber-50 px-1.5 sm:px-2 py-0.5 rounded-full font-semibold border border-amber-200">
                {activeCount}/{freeMax} Free Cap
              </span>
            ) : (
              <span className="text-[10px] sm:text-xs text-emerald-700 bg-emerald-50 px-1.5 sm:px-2 py-0.5 rounded-full font-semibold border border-emerald-200 flex items-center">
                <ShieldCheck className="w-3 h-3 mr-0.5" /> Unlimited
              </span>
            )}
          </div>
          <div className="text-[11px] sm:text-xs text-slate-500 mt-1">
            {isFree && activeCount >= freeMax ? (
              <button
                onClick={onOpenUpgradeModal}
                className="text-blue-600 hover:text-blue-700 font-semibold underline text-left"
              >
                Cap reached — Upgrade
              </button>
            ) : (
              <span>Recurring tracked charges</span>
            )}
          </div>
        </div>
      </div>

      {/* Trials & Savings Optimizer Card */}
      <div 
        id="card-trial-savings"
        className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 flex flex-col justify-between hover:border-slate-300 transition-all shadow-xs"
      >
        <div className="flex items-center justify-between">
          <span className="text-[11px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Trials & Savings
          </span>
          <div className="p-1.5 sm:p-2 rounded-xl bg-amber-50 text-amber-600">
            <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
        </div>
        <div className="mt-2.5 sm:mt-3">
          <div className="flex items-center justify-between gap-1 flex-wrap">
            <div className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              {trialsCount} <span className="text-xs sm:text-sm font-normal text-slate-500">Trial{trialsCount === 1 ? '' : 's'}</span>
            </div>
            {potentialAnnualSavings > 0 && (
              <button
                onClick={onOpenOptimizer}
                className="px-2 py-0.5 sm:px-2.5 sm:py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg text-[11px] sm:text-xs font-semibold hover:bg-emerald-100 flex items-center space-x-0.5 sm:space-x-1 transition-colors shrink-0"
              >
                <span>Save {formatCurrency(potentialAnnualSavings, currency, true)}</span>
                <ArrowUpRight className="w-3 h-3" />
              </button>
            )}
          </div>
          <div className="text-[11px] sm:text-xs text-slate-500 mt-1">
            {trialsCount > 0 ? (
              <span className="text-amber-700 font-medium">3-day alert active</span>
            ) : (
              <span>Zero trial traps</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
