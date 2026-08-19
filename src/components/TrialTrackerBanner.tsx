import React from 'react';
import { Clock, AlertTriangle, ExternalLink } from 'lucide-react';
import { Subscription, CurrencyCode } from '../types';
import { formatCurrency, convertCurrency } from '../utils/currency';
import { getDaysUntil, formatFriendlyDate } from '../utils/dateUtils';

interface TrialTrackerBannerProps {
  subscriptions: Subscription[];
  preferredCurrency: CurrencyCode;
  onEditSubscription: (sub: Subscription) => void;
}

export const TrialTrackerBanner: React.FC<TrialTrackerBannerProps> = ({
  subscriptions,
  preferredCurrency,
  onEditSubscription,
}) => {
  const activeTrials = subscriptions.filter(
    (s) => (s.isFreeTrial || s.status === 'trial') && s.status !== 'cancelled'
  );

  if (activeTrials.length === 0) return null;

  return (
    <div className="mb-6 space-y-3">
      {activeTrials.map((trial) => {
        const daysLeft = getDaysUntil(trial.trialEndDate || trial.nextRenewalDate);
        const isUrgent = daysLeft <= 3;
        const convertedCost = convertCurrency(
          trial.trialConvertedCost || trial.cost,
          trial.currency,
          preferredCurrency
        );

        return (
          <div
            key={trial.id}
            id={`trial-banner-${trial.id}`}
            className={`p-5 rounded-2xl border transition-all shadow-xs ${
              isUrgent
                ? 'bg-amber-50/90 border-amber-200 text-amber-950'
                : 'bg-blue-50/80 border-blue-100 text-slate-800'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start space-x-3.5">
                <div
                  className={`p-2.5 rounded-xl shrink-0 ${
                    isUrgent ? 'bg-amber-100 text-amber-700' : 'bg-blue-600 text-white'
                  }`}
                >
                  {isUrgent ? <AlertTriangle className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                </div>

                <div>
                  <div className="flex items-center space-x-2 flex-wrap">
                    <span className="font-bold text-slate-900 text-base">{trial.name}</span>
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-300/60">
                      Free Trial
                    </span>
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded-md ${
                        isUrgent
                          ? 'bg-red-100 text-red-700 border border-red-200'
                          : 'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}
                    >
                      {daysLeft < 0
                        ? `Expired ${Math.abs(daysLeft)}d ago`
                        : daysLeft === 0
                        ? 'Expires Today'
                        : daysLeft === 1
                        ? '1 Day Left'
                        : `${daysLeft} Days Remaining`}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-600 mt-1">
                    {trial.autoRenewsAfterTrial ? (
                      <>
                        Auto-renews for{' '}
                        <strong className="text-slate-900 font-semibold">
                          {formatCurrency(convertedCost, preferredCurrency)}/{trial.billingCycle}
                        </strong>{' '}
                        on {formatFriendlyDate(trial.trialEndDate || trial.nextRenewalDate)}.
                      </>
                    ) : (
                      <>Will cancel automatically on {formatFriendlyDate(trial.trialEndDate || trial.nextRenewalDate)}.</>
                    )}
                  </p>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center space-x-2 shrink-0 self-end sm:self-center">
                {trial.cancelUrl && (
                  <a
                    href={trial.cancelUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 transition-colors"
                  >
                    <span>Cancel Trial</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
                <button
                  onClick={() => onEditSubscription(trial)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 transition-colors shadow-2xs"
                >
                  Edit Details
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
