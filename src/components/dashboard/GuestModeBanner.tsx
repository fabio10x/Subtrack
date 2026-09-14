import React from 'react';
import { ShieldAlert, ArrowRight } from 'lucide-react';

interface GuestModeBannerProps {
  onSignUp: () => void;
}

export function GuestModeBanner({ onSignUp }: GuestModeBannerProps) {
  return (
    <div className="bg-amber-50 border-b border-amber-200 px-4 py-3 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-amber-900">
      <div className="flex items-center space-x-3">
        <div className="p-1.5 bg-amber-100 text-amber-700 rounded-lg shrink-0">
          <ShieldAlert className="w-5 h-5" />
        </div>
        <p className="text-sm font-medium">
          You're exploring SubTrack in Guest Mode. Your data will be lost when you close this window.
        </p>
      </div>
      <button
        onClick={onSignUp}
        className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors whitespace-nowrap flex items-center space-x-1.5"
      >
        <span>Create Free Account</span>
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}
