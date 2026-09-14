import React from 'react';

interface DashboardFooterProps {
  onNavigate: (page: 'terms' | 'privacy') => void;
}

export function DashboardFooter({ onNavigate }: DashboardFooterProps) {
  return (
    <footer className="border-t border-slate-200 bg-white text-slate-500 text-xs py-6 px-4 text-center">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        <p>© 2026 SubTrack — Personal Finance &amp; Subscription Tracker.</p>
        <div className="flex items-center space-x-4 text-slate-500">
          <button
            onClick={() => onNavigate('terms')}
            className="hover:text-slate-800 transition-colors"
          >
            Terms of Service
          </button>
          <span>•</span>
          <button
            onClick={() => onNavigate('privacy')}
            className="hover:text-slate-800 transition-colors"
          >
            Privacy Policy
          </button>
          <span>•</span>
          <a href="mailto:support@subtrack.app" className="hover:text-slate-800 transition-colors">Support</a>
        </div>
      </div>
    </footer>
  );
}
