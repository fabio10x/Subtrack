import React from 'react';
import { ArrowLeft } from 'lucide-react';

interface TermsPageProps {
  onBack: () => void;
}

export const TermsPage: React.FC<TermsPageProps> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-[#F9FAFB] font-sans">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 flex items-center space-x-3">
          <button
            onClick={onBack}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-base font-bold text-slate-900">Terms of Service</h1>
            <p className="text-xs text-slate-500">Last updated: September 2026</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 prose prose-slate prose-sm">
        <div className="bg-white rounded-xl border border-slate-200 p-8 space-y-6 text-slate-700 text-sm leading-relaxed">

          <section>
            <h2 className="text-base font-bold text-slate-900 mb-2">1. Agreement to Terms</h2>
            <p>By accessing or using SubTrack ("Service"), you agree to be bound by these Terms of Service. If you do not agree, you may not use the Service.</p>
          </section>

          <section>
            <h2 className="text-base font-bold text-slate-900 mb-2">2. Description of Service</h2>
            <p>SubTrack is a personal finance and subscription tracking application that helps users manage recurring expenses, track free trials, and receive renewal reminders. The Service is provided on a subscription basis with a Free tier and a Pro tier ($5/month).</p>
          </section>

          <section>
            <h2 className="text-base font-bold text-slate-900 mb-2">3. User Accounts</h2>
            <p>You must create an account to use SubTrack. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to provide accurate and complete information when creating your account.</p>
          </section>

          <section>
            <h2 className="text-base font-bold text-slate-900 mb-2">4. Subscriptions & Billing</h2>
            <p>The SubTrack Pro plan is billed monthly at $5.00 USD. Payments are processed securely through Stripe. Your subscription will automatically renew each month unless you cancel. You may cancel at any time through the Stripe Customer Portal, and your access to Pro features will continue until the end of your current billing period. We do not offer refunds for partial billing periods.</p>
          </section>

          <section>
            <h2 className="text-base font-bold text-slate-900 mb-2">5. Free Tier Limitations</h2>
            <p>Free tier accounts are limited to tracking 5 active or trial subscriptions. Upgrading to Pro removes this limitation and unlocks additional features including CSV exports and automated email renewal alerts.</p>
          </section>

          <section>
            <h2 className="text-base font-bold text-slate-900 mb-2">6. Acceptable Use</h2>
            <p>You agree not to misuse the Service, including but not limited to: attempting to bypass usage limits, scraping data, using the Service for illegal purposes, or interfering with the Service's operation.</p>
          </section>

          <section>
            <h2 className="text-base font-bold text-slate-900 mb-2">7. Data & Privacy</h2>
            <p>Your use of the Service is also governed by our <button onClick={onBack} className="text-blue-600 hover:underline">Privacy Policy</button>. We store your data securely on Supabase (PostgreSQL) and do not sell your personal information to third parties.</p>
          </section>

          <section>
            <h2 className="text-base font-bold text-slate-900 mb-2">8. Termination</h2>
            <p>You may delete your account at any time from your Profile settings. Upon deletion, all your data including subscriptions and notifications will be permanently removed. We reserve the right to suspend accounts that violate these Terms.</p>
          </section>

          <section>
            <h2 className="text-base font-bold text-slate-900 mb-2">9. Disclaimer of Warranties</h2>
            <p>The Service is provided "as is" without warranties of any kind, express or implied. We do not guarantee that the Service will be uninterrupted or error-free. Renewal reminders are provided as a convenience and should not be solely relied upon for financial decisions.</p>
          </section>

          <section>
            <h2 className="text-base font-bold text-slate-900 mb-2">10. Limitation of Liability</h2>
            <p>To the fullest extent permitted by law, SubTrack shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the Service.</p>
          </section>

          <section>
            <h2 className="text-base font-bold text-slate-900 mb-2">11. Changes to Terms</h2>
            <p>We may update these Terms from time to time. We will notify you of material changes via email or a notice within the Service. Continued use after changes constitutes acceptance of the new Terms.</p>
          </section>

          <section>
            <h2 className="text-base font-bold text-slate-900 mb-2">12. Contact</h2>
            <p>For questions about these Terms, please contact us at support@subtrack.app.</p>
          </section>
        </div>
      </div>
    </div>
  );
};
