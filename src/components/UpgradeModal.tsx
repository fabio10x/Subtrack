import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  Check, 
  CreditCard, 
  Lock,
  Zap,
  RotateCw
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { UserProfile } from '../types';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onConfirmUpgrade: () => Promise<void>;
}

export const UpgradeModal: React.FC<UpgradeModalProps> = ({
  isOpen,
  onClose,
  user,
  onConfirmUpgrade,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      // Trigger API upgrade (this will redirect window.location to Stripe)
      await onConfirmUpgrade();
    } catch (err) {
      console.error('Upgrade error:', err);
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-xl w-full max-h-[90vh] flex flex-col shadow-xl text-slate-900">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold">
              <Zap className="w-4 h-4 text-white fill-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Upgrade to SubTrack Pro</h3>
              <p className="text-xs text-slate-500">Unlock complete personal finance automation</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto space-y-5 flex-1">
          {/* Price Tag Box matching Design HTML Pro Plan block */}
          <div className="bg-slate-900 rounded-2xl p-5 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1">PRO PLAN</p>
                <p className="text-sm font-semibold text-slate-200">Unlock unlimited trackers & CSV exports</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-white">$5.00</div>
                <div className="text-[11px] text-slate-400">/ month</div>
              </div>
            </div>
          </div>

          {/* Features List */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Included in Pro Membership:
            </h4>
            {[
              'Unlimited Subscriptions Tracking (Free tier capped at 5)',
              'Automated 3-Day Renewal Email Alerts via Resend / SendGrid',
              'Full CSV Financial Data Export & Backup',
              'Smart AI Cost Optimizer & Annual Arbitrage Analyzer',
              'Free Trial Countdown Expiry Alerts & Direct Cancel Links',
              'Multi-Currency Conversion Engine',
            ].map((feat, idx) => (
              <div key={idx} className="flex items-center space-x-2.5 text-xs text-slate-700">
                <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3" />
                </div>
                <span>{feat}</span>
              </div>
            ))}
          </div>

          {/* Stripe Checkout Form */}
          <form onSubmit={handleCheckout} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold text-slate-800 flex items-center space-x-1.5">
                <CreditCard className="w-4 h-4 text-blue-600" />
                <span>Secure Stripe Checkout</span>
              </span>
              <span className="text-[10px] text-slate-500 flex items-center">
                <Lock className="w-3 h-3 mr-1 text-emerald-600" /> Bank-grade security
              </span>
            </div>
            
            <p className="text-xs text-slate-600 mb-4">
              You will be securely redirected to Stripe to complete your payment.
            </p>

            <button
              id="btn-confirm-stripe-upgrade"
              type="submit"
              disabled={isProcessing}
              className="w-full mt-2 py-2.5 px-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg text-xs sm:text-sm font-semibold shadow-sm flex items-center justify-center space-x-2 transition-all cursor-pointer"
            >
              {isProcessing ? (
                <>
                  <RotateCw className="w-4 h-4 animate-spin" />
                  <span>Processing Stripe Payment...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-blue-200" />
                  <span>Pay $5.00 / mo & Activate Pro</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
