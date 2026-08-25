import React, { useState } from 'react';
import { 
  CreditCard, 
  Sparkles, 
  Bell, 
  Plus, 
  User, 
  Download, 
  RotateCcw,
  Zap,
  TrendingDown,
  Menu,
  X,
  ChevronDown
} from 'lucide-react';
import { UserProfile, CurrencyCode } from '../types';
import { CURRENCIES } from '../utils/currency';
import { DEMO_USERS } from '../data/seedData';

interface NavbarProps {
  user: UserProfile;
  onSwitchUser: (userId: string) => void;
  onUpdateCurrency: (currency: CurrencyCode) => void;
  onOpenAddModal: () => void;
  onOpenUpgradeModal: () => void;
  onOpenProfileModal: () => void;
  onOpenNotifications: () => void;
  onOpenOptimizer: () => void;
  onOpenExportModal: () => void;
  onResetSeed: () => void;
  unreadNotifsCount: number;
  onBackToLanding?: () => void;
  onSignOut?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  onSwitchUser,
  onUpdateCurrency,
  onOpenAddModal,
  onOpenUpgradeModal,
  onOpenProfileModal,
  onOpenNotifications,
  onOpenOptimizer,
  onOpenExportModal,
  onResetSeed,
  unreadNotifsCount,
  onBackToLanding,
  onSignOut,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 text-slate-900 transition-colors">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2">
          {/* Logo & Branding */}
          <div 
            className="flex items-center space-x-2.5 sm:space-x-3 shrink-0 cursor-pointer"
            onClick={onBackToLanding}
            title="Return to SaaS Landing Page"
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-blue-600 flex items-center justify-center shadow-xs text-white font-bold">
              <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5 sm:space-x-2">
                <span className="font-bold text-base sm:text-lg tracking-tight text-slate-900">SubTrack</span>
                {user.tier === 'pro' ? (
                  <span className="inline-flex items-center px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                    <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-0.5 sm:mr-1 text-blue-600" />
                    PRO
                  </span>
                ) : (
                  <span className="inline-flex items-center px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                    FREE
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 hidden md:block">Personal Finance & Subscription Tracker</p>
            </div>
          </div>

          {/* Desktop & Tablet Actions */}
          <div className="flex items-center space-x-1.5 sm:space-x-2.5 lg:space-x-3">
            {/* Landing Page Link Button */}
            {onBackToLanding && (
              <button
                onClick={onBackToLanding}
                className="hidden xl:inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100/80 hover:bg-slate-200/80 border border-slate-200 transition-colors"
                title="View SaaS Landing Page"
              >
                <span>Landing Page</span>
              </button>
            )}
            {/* Currency Selector */}
            <div className="relative">
              <select
                id="currency-selector"
                value={user.preferredCurrency}
                onChange={(e) => onUpdateCurrency(e.target.value as CurrencyCode)}
                className="bg-slate-50 text-slate-700 text-xs sm:text-sm font-medium rounded-lg px-2 sm:px-2.5 py-1.5 border border-slate-200 hover:border-slate-300 hover:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer transition-colors max-w-[80px] sm:max-w-none"
                title="Select Base Currency"
              >
                {Object.values(CURRENCIES).map((curr) => (
                  <option key={curr.code} value={curr.code} className="bg-white text-slate-800">
                    {curr.symbol} {curr.code}
                  </option>
                ))}
              </select>
            </div>

            {/* Smart Optimizer CTA (Desktop) */}
            <button
              id="btn-open-optimizer"
              onClick={onOpenOptimizer}
              className="hidden lg:inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100/70 transition-colors"
              title="View Smart Cost Optimizer"
            >
              <TrendingDown className="w-3.5 h-3.5 text-emerald-600" />
              <span>Smart Savings</span>
            </button>

            {/* CSV Export Button (Tablet / Desktop) */}
            <button
              id="btn-export-csv"
              onClick={onOpenExportModal}
              className="hidden sm:inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-2xs"
              title="Export Subscriptions CSV"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden md:inline">Export</span>
            </button>

            {/* Notifications Bell */}
            <button
              id="btn-notifications"
              onClick={onOpenNotifications}
              className="relative p-2 rounded-lg bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-slate-200 transition-colors shadow-2xs min-h-[38px] min-w-[38px] flex items-center justify-center"
              title="Renewal Alerts & Cron History"
            >
              <Bell className="w-4 h-4" />
              {unreadNotifsCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-white animate-pulse">
                  {unreadNotifsCount}
                </span>
              )}
            </button>

            {/* Pro Upgrade Button (if Free tier) */}
            {user.tier === 'free' && (
              <button
                id="btn-upgrade-pro"
                onClick={onOpenUpgradeModal}
                className="hidden md:inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold bg-slate-900 hover:bg-slate-800 text-white shadow-sm transition-all shrink-0"
              >
                <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                <span>Upgrade Pro ($5)</span>
              </button>
            )}

            {/* Add Subscription Button */}
            <button
              id="btn-add-subscription"
              onClick={onOpenAddModal}
              className="inline-flex items-center space-x-1 sm:space-x-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-sm shadow-blue-600/20 transition-colors shrink-0 min-h-[38px]"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden xs:inline sm:inline">Add Sub</span>
            </button>

            {/* User Profile Avatar */}
            <button
              id="btn-user-profile"
              onClick={onOpenProfileModal}
              className="flex items-center space-x-1.5 p-1 rounded-lg hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-colors shrink-0"
              title="Account Settings & Profiles"
            >
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-300"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs ring-1 ring-blue-200 uppercase">
                  {user.name ? user.name.slice(0, 2) : user.email?.slice(0, 2) || 'ME'}
                </div>
              )}
            </button>

            {/* Sign Out Button */}
            {onSignOut && (
              <button
                onClick={onSignOut}
                className="hidden md:inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 transition-colors shrink-0 min-h-[38px]"
                title="Sign Out"
              >
                <span>Sign Out</span>
              </button>
            )}

            {/* Mobile Menu Hamburger (Visible only on mobile) */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors min-h-[38px] min-w-[38px] flex items-center justify-center"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Drawer */}
        {isMobileMenuOpen && (
          <div className="lg:hidden py-3 border-t border-slate-200/80 space-y-2 animate-in fade-in slide-in-from-top duration-200">
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onOpenOptimizer();
                }}
                className="flex items-center justify-center space-x-1.5 p-2.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200"
              >
                <TrendingDown className="w-4 h-4 text-emerald-600" />
                <span>Smart Savings</span>
              </button>

              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onOpenExportModal();
                }}
                className="flex items-center justify-center space-x-1.5 p-2.5 rounded-lg text-xs font-semibold bg-slate-50 text-slate-700 border border-slate-200"
              >
                <Download className="w-4 h-4 text-slate-500" />
                <span>Export CSV</span>
              </button>
            </div>

            {user.tier === 'free' && (
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onOpenUpgradeModal();
                }}
                className="w-full py-2.5 px-3 bg-slate-900 text-white rounded-lg text-xs font-bold flex items-center justify-center space-x-2"
              >
                <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span>Upgrade to Pro ($5/mo)</span>
              </button>
            )}

            {onSignOut && (
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onSignOut();
                }}
                className="w-full py-2.5 px-3 bg-white border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center justify-center"
              >
                Sign Out
              </button>
            )}
          </div>
        )}
      </div>

    </header>
  );
};
