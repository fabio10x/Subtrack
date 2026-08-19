import React from 'react';
import { 
  BellRing, 
  PieChart, 
  Clock, 
  Globe2, 
  Check, 
  Sparkles,
  ArrowRight
} from 'lucide-react';

interface FeatureGridProps {
  onEnterDashboard: (tier?: 'free' | 'pro') => void;
}

export const FeatureGrid: React.FC<FeatureGridProps> = ({ onEnterDashboard }) => {
  const features = [
    {
      id: 'alerts',
      icon: BellRing,
      color: 'bg-blue-50 text-blue-600 border-blue-200',
      title: 'Automated 3-Day Email Alerts',
      badge: 'Cron Automation',
      description:
        'Background cron jobs scan your renewal dates continuously and trigger email warnings via Resend / SendGrid 3 days before any credit card gets charged.',
      points: [
        'Configurable 1, 3, 5, or 7-day advance notice',
        'Direct link to service account cancellation page',
        'Zero unexpected annual or quarterly surprise charges',
      ],
    },
    {
      id: 'analytics',
      icon: PieChart,
      color: 'bg-indigo-50 text-indigo-600 border-indigo-200',
      title: 'Visual Spend Analytics',
      badge: 'Dynamic Charts',
      description:
        'Interactive Recharts donut breakdowns, normalized monthly projections, and annual run-rate forecasts across all expense categories.',
      points: [
        'Real-time Category Breakdown donut charts',
        'Historical vs. 6-month projected spend trends',
        'Smart Cost Optimizer with annual switch arbitrage',
      ],
    },
    {
      id: 'trial-tracker',
      icon: Clock,
      color: 'bg-amber-50 text-amber-600 border-amber-200',
      title: 'Free Trial Countdown Tracker',
      badge: 'No Trial Traps',
      description:
        'Never get tricked by dark patterns. Track exact trial expiration dates with urgent countdown countdown badges and direct 1-click cancellation links.',
      points: [
        'Days-remaining countdown clock on active trials',
        'Shows converted post-trial recurring price',
        'One-click direct cancellation URLs',
      ],
    },
    {
      id: 'multi-currency',
      icon: Globe2,
      color: 'bg-emerald-50 text-emerald-600 border-emerald-200',
      title: 'Multi-Currency Conversion',
      badge: 'Global Finance',
      description:
        'Track international SaaS tools priced in USD, EUR, GBP, JPY, CAD, or AUD. SubTrack normalizes all costs into your preferred base currency instantly.',
      points: [
        'Supports USD, EUR, GBP, JPY, CAD, AUD, CHF, INR, BRL',
        'Automatic monthly equivalent normalization',
        'Seamless single-click currency switching',
      ],
    },
  ];

  return (
    <section id="features" className="py-16 sm:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-3 border border-blue-100">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Built for Modern Consumers & Freelancers</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Everything You Need to Stop Recurring Waste
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-600">
            Engineered with modern full-stack performance to give you effortless financial control.
          </p>
        </div>

        {/* 4 Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {features.map((feat) => {
            const Icon = feat.icon;
            return (
              <div
                key={feat.id}
                className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 hover:border-slate-300 hover:shadow-xs transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-xl border ${feat.color}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                      {feat.badge}
                    </span>
                  </div>

                  <h3 className="text-lg sm:text-xl font-bold text-slate-900">{feat.title}</h3>
                  <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                    {feat.description}
                  </p>

                  {/* Bullet Highlights */}
                  <div className="mt-5 space-y-2">
                    {feat.points.map((pt, idx) => (
                      <div key={idx} className="flex items-center space-x-2.5 text-xs text-slate-700">
                        <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                          <Check className="w-2.5 h-2.5" />
                        </div>
                        <span>{pt}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100">
                  <button
                    onClick={() => onEnterDashboard('free')}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center space-x-1 transition-colors cursor-pointer group"
                  >
                    <span>Test feature in live dashboard</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
