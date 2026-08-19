import React from 'react';
import { 
  Lock, 
  ExternalLink, 
  Sparkles, 
  TrendingUp, 
  Clock, 
  DollarSign, 
  Layers, 
  ArrowUpRight,
  ShieldCheck
} from 'lucide-react';

interface ProductPreviewProps {
  onEnterDashboard: (tier?: 'free' | 'pro') => void;
}

export const ProductPreview: React.FC<ProductPreviewProps> = ({ onEnterDashboard }) => {
  return (
    <section id="preview" className="py-12 sm:py-20 bg-slate-50/50 border-y border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
          <h2 className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-2">Product Preview</h2>
          <h3 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Designed for Clarity, Built for Control
          </h3>
          <p className="mt-3 text-sm sm:text-base text-slate-600">
            A real-time financial control center giving you complete visibility into every recurring charge.
          </p>
        </div>

        {/* Browser Mockup Container */}
        <div className="max-w-5xl mx-auto bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden group">
          {/* Mockup Browser Window Header */}
          <div className="bg-slate-100/90 px-4 py-3 border-b border-slate-200/90 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-amber-400" />
              <div className="w-3 h-3 rounded-full bg-emerald-400" />
            </div>

            {/* Address Bar */}
            <div className="flex items-center space-x-1.5 px-4 py-1 rounded-lg bg-white border border-slate-200/80 text-xs text-slate-600 font-mono max-w-sm w-full justify-center shadow-2xs">
              <Lock className="w-3 h-3 text-emerald-600" />
              <span>https://subtrack.app/dashboard</span>
            </div>

            <button
              onClick={() => onEnterDashboard('pro')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center space-x-1 cursor-pointer"
            >
              <span>Launch Live</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>

          {/* Inner Dashboard Mockup Content */}
          <div className="p-4 sm:p-6 bg-[#F9FAFB] space-y-5">
            {/* Free Trial Alert Preview */}
            <div className="p-3.5 sm:p-4 rounded-xl bg-amber-50/90 border border-amber-200 text-amber-950 flex items-center justify-between shadow-2xs">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-amber-100 text-amber-700">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-xs sm:text-sm text-slate-900">Linear App</span>
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-100 text-amber-800">FREE TRIAL</span>
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-red-100 text-red-700">2 Days Left</span>
                  </div>
                  <p className="text-[11px] text-slate-600">Auto-renews for $12.00/mo on August 21, 2026.</p>
                </div>
              </div>
              <button 
                onClick={() => onEnterDashboard('pro')}
                className="px-3 py-1 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
              >
                1-Click Cancel
              </button>
            </div>

            {/* Metrics Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className="bg-white border border-slate-200/90 rounded-xl p-3.5 shadow-2xs">
                <div className="text-[11px] font-semibold text-slate-500 uppercase">Monthly Spend</div>
                <div className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">$284.47</div>
                <div className="text-[10px] text-slate-400 mt-0.5">USD Base Currency</div>
              </div>

              <div className="bg-white border border-slate-200/90 rounded-xl p-3.5 shadow-2xs">
                <div className="text-[11px] font-semibold text-slate-500 uppercase">Annual Run Rate</div>
                <div className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">$3,413.64</div>
                <div className="text-[10px] text-slate-400 mt-0.5">12-Month Projection</div>
              </div>

              <div className="bg-white border border-slate-200/90 rounded-xl p-3.5 shadow-2xs">
                <div className="text-[11px] font-semibold text-slate-500 uppercase">Active Subscriptions</div>
                <div className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">11 Active</div>
                <div className="text-[10px] text-emerald-600 font-medium mt-0.5 flex items-center">
                  <ShieldCheck className="w-3 h-3 mr-0.5" /> Pro Tier Unlimited
                </div>
              </div>

              <div className="bg-white border border-slate-200/90 rounded-xl p-3.5 shadow-2xs">
                <div className="text-[11px] font-semibold text-slate-500 uppercase">Annual Savings</div>
                <div className="text-xl sm:text-2xl font-bold text-emerald-600 mt-1">$614.45</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Switch to Yearly arbitrage</div>
              </div>
            </div>

            {/* Mini Visual Spend Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Category Mock */}
              <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-2xs space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-slate-900">
                  <span>Category Allocation</span>
                  <span className="text-slate-400 font-normal">4 Main Categories</span>
                </div>
                <div className="space-y-2 text-xs">
                  <div>
                    <div className="flex justify-between text-[11px] text-slate-600 mb-1">
                      <span>Software & SaaS</span>
                      <span className="font-semibold text-slate-900">$139.99 (49.2%)</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-600 rounded-full" style={{ width: '49.2%' }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-[11px] text-slate-600 mb-1">
                      <span>Cloud & Hosting</span>
                      <span className="font-semibold text-slate-900">$64.50 (22.7%)</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500 rounded-full" style={{ width: '22.7%' }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-[11px] text-slate-600 mb-1">
                      <span>Entertainment</span>
                      <span className="font-semibold text-slate-900">$45.98 (16.2%)</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-rose-500 rounded-full" style={{ width: '16.2%' }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Sample Subscriptions Mock */}
              <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-2xs space-y-2.5">
                <div className="flex items-center justify-between text-xs font-bold text-slate-900">
                  <span>Recent Subscriptions</span>
                  <span className="text-blue-600 text-[11px]">3-Day Alerts On</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 rounded-md bg-[#10A37F] text-white flex items-center justify-center font-bold text-[10px]">
                        C
                      </div>
                      <span className="font-semibold text-slate-800">ChatGPT Plus</span>
                    </div>
                    <span className="font-bold text-slate-900">$20.00/mo</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 rounded-md bg-[#E50914] text-white flex items-center justify-center font-bold text-[10px]">
                        N
                      </div>
                      <span className="font-semibold text-slate-800">Netflix Premium 4K</span>
                    </div>
                    <span className="font-bold text-slate-900">$22.99/mo</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 rounded-md bg-[#FF9900] text-white flex items-center justify-center font-bold text-[10px]">
                        A
                      </div>
                      <span className="font-semibold text-slate-800">Amazon Prime</span>
                    </div>
                    <span className="font-bold text-slate-900">$14.99/mo</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Click to test full interactive app CTA banner */}
            <div className="text-center pt-2">
              <button
                onClick={() => onEnterDashboard('pro')}
                className="inline-flex items-center space-x-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-sm transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-blue-400" />
                <span>Interact with Full Live Demo Dashboard</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
