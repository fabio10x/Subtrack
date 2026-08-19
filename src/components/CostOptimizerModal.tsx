import React from 'react';
import { 
  X, 
  TrendingDown, 
  Sparkles, 
  AlertCircle, 
  ArrowRight, 
  Lock, 
  CheckCircle2,
  Calendar,
  Layers
} from 'lucide-react';
import { Subscription, CurrencyCode, UserTier } from '../types';
import { formatCurrency, convertCurrency } from '../utils/currency';

interface CostOptimizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  subscriptions: Subscription[];
  preferredCurrency: CurrencyCode;
  userTier: UserTier;
  onOpenUpgrade: () => void;
  onEditSubscription: (sub: Subscription) => void;
}

export const CostOptimizerModal: React.FC<CostOptimizerModalProps> = ({
  isOpen,
  onClose,
  subscriptions,
  preferredCurrency,
  userTier,
  onOpenUpgrade,
  onEditSubscription,
}) => {
  if (!isOpen) return null;

  const isPro = userTier === 'pro';

  // 1. Calculate Monthly vs Annual arbitrage
  const monthlySubs = subscriptions.filter(
    (s) => s.billingCycle === 'monthly' && s.status === 'active' && !s.isFreeTrial
  );

  const annualArbitrageSavings = monthlySubs.reduce((acc, s) => {
    const costInPreferred = convertCurrency(s.cost, s.currency, preferredCurrency);
    // Typical 15-20% discount on yearly plans (2 months free)
    return acc + costInPreferred * 12 * 0.18;
  }, 0);

  // 2. Identify duplicate or overlapping categories
  const categoryCount: Record<string, Subscription[]> = {};
  subscriptions
    .filter((s) => s.status === 'active')
    .forEach((s) => {
      categoryCount[s.category] = categoryCount[s.category] || [];
      categoryCount[s.category].push(s);
    });

  const duplicateCategories = Object.entries(categoryCount).filter(
    ([_, list]) => list.length > 1
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-xl text-slate-900">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <TrendingDown className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Smart Cost Optimizer</h3>
              <p className="text-xs text-slate-500">
                Auditing annual discounts & redundant active subscriptions
              </p>
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
        <div className="p-5 overflow-y-auto space-y-6 flex-1 text-xs sm:text-sm">
          {/* Estimated Annual Savings Highlight */}
          <div className="bg-emerald-50/80 border border-emerald-200/80 rounded-2xl p-5 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">
                Total Potential Annual Savings
              </span>
              <div className="text-3xl font-bold text-emerald-950 mt-1">
                {formatCurrency(annualArbitrageSavings, preferredCurrency)}
                <span className="text-xs font-normal text-emerald-700 ml-1">/ year</span>
              </div>
              <p className="text-xs text-emerald-800/90 mt-1">
                By switching eligible monthly plans to yearly and consolidating overlaps.
              </p>
            </div>
            <div className="hidden sm:block p-3 rounded-full bg-emerald-100 text-emerald-700">
              <CheckCircle2 className="w-7 h-7" />
            </div>
          </div>

          {/* Section 1: Annual Billing Arbitrage Opportunities */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-slate-900 flex items-center space-x-1.5">
                <Calendar className="w-4 h-4 text-blue-600" />
                <span>Annual Switch Arbitrage ({monthlySubs.length} Monthly Plans)</span>
              </h4>
              <span className="text-[11px] text-slate-500">~18% Industry discount</span>
            </div>

            {monthlySubs.length === 0 ? (
              <p className="text-xs text-slate-400 py-3">All your active plans are already optimized!</p>
            ) : (
              <div className="space-y-2">
                {monthlySubs.map((sub) => {
                  const monthlyCost = convertCurrency(sub.cost, sub.currency, preferredCurrency);
                  const savings = monthlyCost * 12 * 0.18;

                  return (
                    <div
                      key={sub.id}
                      className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-2.5">
                        <div
                          className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-white text-xs"
                          style={{ backgroundColor: sub.brandColor || '#3B82F6' }}
                        >
                          {sub.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900 text-xs">{sub.name}</div>
                          <div className="text-[11px] text-slate-500">
                            Currently {formatCurrency(sub.cost, sub.currency)}/mo
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <div className="text-right">
                          <span className="text-xs font-bold text-emerald-700">
                            Save ~{formatCurrency(savings, preferredCurrency)}/yr
                          </span>
                          <div className="text-[10px] text-slate-400">if paid yearly</div>
                        </div>
                        <button
                          onClick={() => {
                            onClose();
                            onEditSubscription(sub);
                          }}
                          className="px-2.5 py-1 text-xs bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg transition-colors"
                        >
                          Edit
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Section 2: Overlapping Category Redundancy Audit */}
          <div className="space-y-3">
            <h4 className="font-semibold text-slate-900 flex items-center space-x-1.5">
              <Layers className="w-4 h-4 text-purple-600" />
              <span>Category Redundancy Audit</span>
            </h4>

            {duplicateCategories.length === 0 ? (
              <p className="text-xs text-slate-400 py-3">No duplicate subscriptions in the same category.</p>
            ) : (
              <div className="space-y-2.5">
                {duplicateCategories.map(([cat, list]) => (
                  <div
                    key={cat}
                    className="p-3 bg-amber-50/60 border border-amber-200/80 rounded-xl space-y-2"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-amber-950 flex items-center space-x-1">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                        <span>Multiple Services in "{cat}"</span>
                      </span>
                      <span className="text-amber-800 font-semibold">{list.length} Services</span>
                    </div>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {list.map((s) => (
                        <span
                          key={s.id}
                          className="px-2 py-0.5 rounded-md bg-white text-slate-700 border border-amber-200 text-xs font-medium"
                        >
                          {s.name} ({formatCurrency(s.cost, s.currency)})
                        </span>
                      ))}
                    </div>
                    <p className="text-[11px] text-amber-800/90 leading-tight">
                      Consider pausing or consolidating one of these overlapping services to reduce recurring monthly outflow.
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-end bg-slate-50/50">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-semibold rounded-lg shadow-sm transition-colors"
          >
            Done Reviewing
          </button>
        </div>
      </div>
    </div>
  );
};
