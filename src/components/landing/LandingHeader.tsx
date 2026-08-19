import React, { useState } from 'react';
import { CreditCard, Sparkles, ArrowRight, Menu, X, ShieldCheck } from 'lucide-react';

interface LandingHeaderProps {
  onEnterDashboard: (tier?: 'free' | 'pro') => void;
}

export const LandingHeader: React.FC<LandingHeaderProps> = ({ onEnterDashboard }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Brand Logo */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-xs">
              <CreditCard className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-lg sm:text-xl tracking-tight text-slate-900">SubTrack</span>
              <span className="ml-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                v2.0
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-600">
            <button
              onClick={() => scrollToSection('features')}
              className="hover:text-slate-900 transition-colors cursor-pointer"
            >
              Features
            </button>
            <button
              onClick={() => scrollToSection('preview')}
              className="hover:text-slate-900 transition-colors cursor-pointer"
            >
              Product Preview
            </button>
            <button
              onClick={() => scrollToSection('pricing')}
              className="hover:text-slate-900 transition-colors cursor-pointer"
            >
              Pricing
            </button>
            <button
              onClick={() => scrollToSection('faq')}
              className="hover:text-slate-900 transition-colors cursor-pointer"
            >
              FAQ
            </button>
          </nav>

          {/* CTA Buttons */}
          <div className="hidden sm:flex items-center space-x-3">
            <button
              id="header-btn-guest-demo"
              onClick={() => onEnterDashboard('free')}
              className="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-700 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-all cursor-pointer shadow-2xs"
            >
              Try Live Guest Demo
            </button>
            <button
              id="header-btn-get-started"
              onClick={() => onEnterDashboard('free')}
              className="px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-sm transition-all flex items-center space-x-1.5 cursor-pointer"
            >
              <span>Get Started Free</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex sm:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Drawer */}
        {mobileMenuOpen && (
          <div className="sm:hidden py-4 border-t border-slate-100 space-y-3 animate-in fade-in slide-in-from-top-2 duration-150">
            <div className="flex flex-col space-y-2 text-sm font-medium text-slate-700">
              <button
                onClick={() => scrollToSection('features')}
                className="text-left px-3 py-2 rounded-lg hover:bg-slate-50"
              >
                Features
              </button>
              <button
                onClick={() => scrollToSection('preview')}
                className="text-left px-3 py-2 rounded-lg hover:bg-slate-50"
              >
                Product Preview
              </button>
              <button
                onClick={() => scrollToSection('pricing')}
                className="text-left px-3 py-2 rounded-lg hover:bg-slate-50"
              >
                Pricing
              </button>
              <button
                onClick={() => scrollToSection('faq')}
                className="text-left px-3 py-2 rounded-lg hover:bg-slate-50"
              >
                FAQ
              </button>
            </div>

            <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
              <button
                onClick={() => onEnterDashboard('free')}
                className="w-full py-2.5 px-4 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl text-center"
              >
                Try Live Guest Demo
              </button>
              <button
                onClick={() => onEnterDashboard('free')}
                className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-xl text-center shadow-sm"
              >
                Get Started Free
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
