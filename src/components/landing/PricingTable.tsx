import React, { useState } from 'react';
import { 
  Check, 
  Sparkles, 
  Zap, 
  CreditCard, 
  Lock, 
  ShieldCheck,
  ArrowRight
} from 'lucide-react';

interface PricingTableProps {
  onEnterDashboard: (tier?: 'free' | 'pro') => void;
  onGoToAuth: () => void;
  onOpenStripeCheckout?: () => void;
}

export const PricingTable: React.FC<PricingTableProps> = ({ 
  onEnterDashboard,
  onGoToAuth,
  onOpenStripeCheckout
}) => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  const proMonthlyPrice = 5.00;
  const proYearlyPrice = 4.00; // $48 billed annually (20% off)

  return (
    <section id="pricing" className="py-16 sm:py-24 bg-slate-50/60 border-t border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-3 border border-blue-100">
            <CreditCard className="w-3.5 h-3.5" />
            <span>Transparent, Fair Pricing</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Simple Plans for Every Budget
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-600">
            Start for free with basic tracking, or upgrade to Pro to unlock automated email alerts and unlimited subscriptions.
          </p>

          {/* Billing Cycle Toggle */}
          <div className="mt-8 inline-flex items-center bg-white p-1 rounded-xl border border-slate-200 shadow-2xs">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-4 py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition-all cursor-pointer ${
                billingCycle === 'monthly'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-4 py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition-all flex items-center space-x-1.5 cursor-pointer ${
                billingCycle === 'yearly'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>Annual Billing</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                SAVE 20%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards Comparison */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto items-stretch">
          {/* Free Tier Card */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 flex flex-col justify-between shadow-xs">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900">Free Tier</h3>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                  Starter
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">Essential tracking for casual users</p>

              <div className="mt-6 mb-6">
                <div className="flex items-baseline">
                  <span className="text-4xl font-extrabold text-slate-900">$0</span>
                  <span className="text-xs text-slate-500 ml-1.5 font-medium">/ forever</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">No credit card required</p>
              </div>

              <div className="space-y-3 pt-6 border-t border-slate-100">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Included Features:</p>
                {[
                  'Track up to 5 subscriptions',
                  'Category spend breakdown charts',
                  'Monthly & Annual run-rate projections',
                  'Multi-currency base conversions',
                  'Standard renewal calendar view',
                ].map((feat, idx) => (
                  <div key={idx} className="flex items-center space-x-2.5 text-xs text-slate-700">
                    <div className="w-4 h-4 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                      <Check className="w-2.5 h-2.5" />
                    </div>
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 pt-4">
              <button
                id="pricing-btn-free-tier"
                onClick={() => onGoToAuth()}
                className="w-full py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs sm:text-sm font-semibold transition-all text-center cursor-pointer"
              >
                Get Started Free
              </button>
            </div>
          </div>

          {/* Pro Tier Card */}
          <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 flex flex-col justify-between shadow-xl relative overflow-hidden border border-slate-800">
            {/* Top Highlight Badge */}
            <div className="absolute top-0 right-0 bg-blue-600 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider flex items-center space-x-1">
              <Sparkles className="w-3 h-3" />
              <span>MOST POPULAR</span>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <h3 className="text-lg font-bold text-white">SubTrack Pro</h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30">
                    PRO
                  </span>
                </div>
              </div>
              <p className="text-xs text-slate-400 mt-1">Full automation & unmetered tracking</p>

              <div className="mt-6 mb-6">
                <div className="flex items-baseline">
                  <span className="text-4xl font-extrabold text-white">
                    ${billingCycle === 'monthly' ? proMonthlyPrice.toFixed(2) : proYearlyPrice.toFixed(2)}
                  </span>
                  <span className="text-xs text-slate-400 ml-1.5 font-medium">/ month</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  {billingCycle === 'yearly' ? '$48.00 billed annually (Save $12/year)' : 'Billed monthly, cancel anytime'}
                </p>
              </div>

              <div className="space-y-3 pt-6 border-t border-slate-800">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Everything in Free, plus:</p>
                {[
                  'Unlimited subscription trackers (No caps)',
                  'Automated 3-Day renewal email alerts (Resend API)',
                  'One-click direct cancellation links',
                  'Free trial countdown tracker & expiry alarms',
                  'Full CSV financial spreadsheet data export',
                  'Smart Cost Optimizer with annual savings audit',
                  'Stripe secure checkout & instant billing portal',
                ].map((feat, idx) => (
                  <div key={idx} className="flex items-center space-x-2.5 text-xs text-slate-200">
                    <div className="w-4 h-4 rounded-full bg-blue-600/30 text-blue-400 flex items-center justify-center shrink-0">
                      <Check className="w-2.5 h-2.5" />
                    </div>
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 pt-4">
              <button
                id="pricing-btn-pro-tier"
                onClick={() => {
                  if (onOpenStripeCheckout) {
                    onOpenStripeCheckout();
                  } else {
                    onEnterDashboard('pro');
                  }
                }}
                className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-sm shadow-blue-600/30 transition-all flex items-center justify-center space-x-2 cursor-pointer"
              >
                <Zap className="w-4 h-4 text-blue-200 fill-blue-200" />
                <span>Upgrade to Pro with Stripe</span>
              </button>
              <div className="flex items-center justify-center space-x-2 text-[11px] text-slate-400 mt-2.5">
                <Lock className="w-3 h-3 text-emerald-400" />
                <span>Secure Checkout powered by Stripe</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
