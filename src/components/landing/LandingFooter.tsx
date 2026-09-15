import React from 'react';
import { 
  CreditCard, 
  Github, 
  Twitter, 
  Linkedin, 
  ExternalLink, 
  Heart, 
  ShieldCheck,
  Globe
} from 'lucide-react';

interface LandingFooterProps {
  onEnterDashboard: (tier?: 'free' | 'pro') => void;
  onNavigate: (page: 'terms' | 'privacy') => void;
}

export const LandingFooter: React.FC<LandingFooterProps> = ({ onEnterDashboard, onNavigate }) => {
  return (
    <footer className="bg-slate-900 text-slate-400 text-xs border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold">
                <CreditCard className="w-4 h-4" />
              </div>
              <span className="font-bold text-lg text-white tracking-tight">SubTrack</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
              The high-performance B2C personal finance and subscription tracker. Never get caught by unexpected annual charges or hidden trial renewals again.
            </p>
            <div className="flex items-center space-x-2 text-[11px] text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>All Systems Operational</span>
            </div>
          </div>

          {/* Product Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider">Product</h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => onEnterDashboard('free')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Live Guest Demo
                </button>
              </li>
              <li>
                <a href="#features" className="hover:text-white transition-colors">
                  Features Engine
                </a>
              </li>
              <li>
                <a href="#pricing" className="hover:text-white transition-colors">
                  Pricing Plans
                </a>
              </li>
              <li>
                <a href="#preview" className="hover:text-white transition-colors">
                  Product Preview
                </a>
              </li>
              <li>
                <a href="#faq" className="hover:text-white transition-colors">
                  FAQ & Guides
                </a>
              </li>
            </ul>
          </div>

          {/* Legal & Security */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider">Legal & Trust</h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => onNavigate('privacy')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('terms')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Terms of Service
                </button>
              </li>
              <li>
                <a href="mailto:support@subtrack.app" className="hover:text-white transition-colors">
                  Support
                </a>
              </li>
              <li>
                <a href="#faq" className="hover:text-white transition-colors">
                  Stripe PCI Compliance
                </a>
              </li>
            </ul>
          </div>

          {/* Company Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider">Company</h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="#about"
                  className="hover:text-white transition-colors flex items-center space-x-1.5"
                >
                  <span>About Us</span>
                </a>
              </li>
              <li>
                <a
                  href="#blog"
                  className="hover:text-white transition-colors flex items-center space-x-1.5"
                >
                  <span>Blog</span>
                </a>
              </li>
              <li>
                <a
                  href="#careers"
                  className="hover:text-white transition-colors flex items-center space-x-1.5"
                >
                  <span>Careers</span>
                </a>
              </li>
              <li>
                <a
                  href="mailto:hello@subtrack.app"
                  className="hover:text-white transition-colors flex items-center space-x-1.5"
                >
                  <span>Contact Us</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500">
          <p>© 2026 SubTrack Inc. All rights reserved.</p>
          <div className="flex items-center space-x-4">
            <span className="flex items-center space-x-1">
              <span>Made with</span>
              <Heart className="w-3 h-3 mx-1 text-rose-500 fill-rose-500 inline" />
              <span>for personal finance</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
