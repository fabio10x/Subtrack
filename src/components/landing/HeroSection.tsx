import React from 'react';
import { 
  ArrowRight, 
  Sparkles, 
  ShieldCheck, 
  CheckCircle2, 
  Zap, 
  Lock, 
  BellRing,
  Play
} from 'lucide-react';

interface HeroSectionProps {
  onEnterDashboard: (tier?: 'free' | 'pro') => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onEnterDashboard }) => {
  return (
    <section className="relative pt-12 pb-16 sm:pt-20 sm:pb-24 overflow-hidden">
      {/* Background Subtle Accent Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-blue-50/60 to-transparent pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Pill Badge */}
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200/80 text-blue-700 text-xs font-semibold mb-6 shadow-2xs">
          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
          <span>Smart Personal Finance & Subscription Tracker</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15] max-w-4xl mx-auto">
          Never Lose Money on{' '}
          <span className="text-blue-600 underline decoration-blue-200 decoration-wavy decoration-2">
            Forgotten Subscriptions
          </span>{' '}
          Again
        </h1>

        {/* Subtitle */}
        <p className="mt-5 text-base sm:text-lg lg:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
          The modern, minimalist personal finance platform designed to audit recurring expenses,
          calculate annual spend run-rates, automate 3-day renewal alerts, and cancel unwanted free trials
          before you get charged.
        </p>

        {/* Dual CTAs */}
        <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3.5 max-w-md mx-auto">
          <button
            id="hero-btn-get-started"
            onClick={() => onEnterDashboard('free')}
            className="w-full sm:w-auto px-7 py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold text-sm sm:text-base shadow-sm shadow-blue-600/20 transition-all flex items-center justify-center space-x-2 cursor-pointer group"
          >
            <span>Get Started Free</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>

          <button
            id="hero-btn-guest-demo"
            onClick={() => onEnterDashboard('pro')}
            className="w-full sm:w-auto px-6 py-3.5 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 rounded-xl font-semibold text-sm sm:text-base shadow-2xs hover:shadow-xs transition-all flex items-center justify-center space-x-2 cursor-pointer"
          >
            <Play className="w-4 h-4 text-blue-600 fill-blue-600" />
            <span>Try Live Guest Demo</span>
          </button>
        </div>

        {/* Social Proof & Trust Badges */}
        <div className="mt-12 pt-8 border-t border-slate-200/60 max-w-3xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-4 text-left">
          <div className="flex items-center space-x-2 text-xs text-slate-600">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>No bank login required</span>
          </div>
          <div className="flex items-center space-x-2 text-xs text-slate-600">
            <BellRing className="w-4 h-4 text-blue-600 shrink-0" />
            <span>3-Day renewal cron alerts</span>
          </div>
          <div className="flex items-center space-x-2 text-xs text-slate-600">
            <Lock className="w-4 h-4 text-slate-700 shrink-0" />
            <span>256-Bit SSL encrypted</span>
          </div>
          <div className="flex items-center space-x-2 text-xs text-slate-600">
            <Zap className="w-4 h-4 text-amber-500 shrink-0" />
            <span>Stripe certified checkout</span>
          </div>
        </div>
      </div>
    </section>
  );
};
