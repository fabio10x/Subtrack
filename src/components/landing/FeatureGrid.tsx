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
  onGoToAuth: () => void;
}

export const FeatureGrid: React.FC<FeatureGridProps> = ({ onEnterDashboard, onGoToAuth }) => {
  const features = [
    {
      id: 'alerts',
      icon: BellRing,
      color: 'bg-blue-50 text-blue-600 border-blue-200',
      title: 'Automated 3-Day Email Alerts',
      badge: 'Smart Alerts',
      description:
        'We quietly watch your renewal dates in the background and send you an email 3 days before any subscription charges your card — giving you enough time to cancel if you need to.',
      points: [
        'Choose 1, 3, 5, or 7-day advance notice',
        'Includes a direct link to cancel the service',
        'No more surprise annual or quarterly charges',
      ],
    },
    {
      id: 'analytics',
      icon: PieChart,
      color: 'bg-indigo-50 text-indigo-600 border-indigo-200',
      title: 'Visual Spend Analytics',
      badge: 'Spending Insights',
      description:
        'See exactly where your money goes every month. Interactive charts break down your spending by category, show monthly totals, and forecast your full-year cost.',
      points: [
        'Category breakdown charts updated in real-time',
        'Compare current vs. projected future spending',
        'Spot savings opportunities with the Cost Optimizer',
      ],
    },
    {
      id: 'trial-tracker',
      icon: Clock,
      color: 'bg-amber-50 text-amber-600 border-amber-200',
      title: 'Free Trial Countdown Tracker',
      badge: 'No Trial Traps',
      description:
        'Never get charged for a trial you forgot to cancel. Track exactly how many days are left on each free trial and cancel with one click before you get billed.',
      points: [
        'Live countdown showing days remaining on each trial',
        'Shows the full price you will be charged after the trial',
        'One-click link to cancel directly on the service\'s website',
      ],
    },
    {
      id: 'multi-currency',
      icon: Globe2,
      color: 'bg-emerald-50 text-emerald-600 border-emerald-200',
      title: 'Multi-Currency Support',
      badge: 'Global Ready',
      description:
        'Subscribe to services in any currency worldwide. SubTrack automatically converts everything into your preferred currency so you always see the true cost at a glance.',
      points: [
        'Supports USD, EUR, GBP, JPY, CAD, AUD, CHF, INR & BRL',
        'All prices shown in your home currency automatically',
        'Switch your base currency anytime with one click',
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
            Everything You Need to Stop Wasting Money
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-600">
            Simple, powerful tools designed to keep you in control of what you pay every month.
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
                    onClick={() => onGoToAuth()}
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
