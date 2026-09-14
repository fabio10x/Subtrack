import React from 'react';
import { ArrowLeft } from 'lucide-react';

interface PrivacyPageProps {
  onBack: () => void;
}

export const PrivacyPage: React.FC<PrivacyPageProps> = ({ onBack }) => {
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
            <h1 className="text-base font-bold text-slate-900">Privacy Policy</h1>
            <p className="text-xs text-slate-500">Last updated: September 2026</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <div className="bg-white rounded-xl border border-slate-200 p-8 space-y-6 text-slate-700 text-sm leading-relaxed">

          <section>
            <h2 className="text-base font-bold text-slate-900 mb-2">1. Introduction</h2>
            <p>SubTrack ("we", "us", "our") is committed to protecting your personal information. This Privacy Policy explains what data we collect, how we use it, and your rights regarding your data.</p>
          </section>

          <section>
            <h2 className="text-base font-bold text-slate-900 mb-2">2. Information We Collect</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Account Information:</strong> Your email address and display name when you create an account.</li>
              <li><strong>Subscription Data:</strong> Subscription names, costs, billing cycles, renewal dates, and categories that you enter into the app.</li>
              <li><strong>Payment Information:</strong> Billing is handled entirely by Stripe. We do not store your credit card details — only your Stripe Customer ID.</li>
              <li><strong>Usage Preferences:</strong> Your preferred currency, alert lead time, and notification settings.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-bold text-slate-900 mb-2">3. How We Use Your Information</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>To provide and operate the SubTrack service.</li>
              <li>To send renewal reminder emails (if you have enabled them).</li>
              <li>To process your Pro subscription payments via Stripe.</li>
              <li>To improve the Service based on usage patterns.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-bold text-slate-900 mb-2">4. Data Storage & Security</h2>
            <p>Your data is stored in a secure PostgreSQL database hosted by Supabase, with Row Level Security (RLS) enabled. This means your data is strictly isolated — only you can access your own subscriptions and notifications. All data is encrypted in transit (HTTPS) and at rest.</p>
          </section>

          <section>
            <h2 className="text-base font-bold text-slate-900 mb-2">5. Third-Party Services</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Supabase</strong> — Database and authentication hosting (EU/US infrastructure).</li>
              <li><strong>Stripe</strong> — Payment processing. Stripe's privacy policy governs the handling of your payment data.</li>
              <li><strong>Resend</strong> — Transactional email delivery for renewal alerts.</li>
            </ul>
            <p className="mt-2">We do not sell your personal information to third parties.</p>
          </section>

          <section>
            <h2 className="text-base font-bold text-slate-900 mb-2">6. Your Rights (GDPR)</h2>
            <p>If you are located in the European Economic Area, you have the following rights:</p>
            <ul className="list-disc pl-5 space-y-1 mt-1">
              <li><strong>Access:</strong> Request a copy of the data we hold about you.</li>
              <li><strong>Correction:</strong> Update inaccurate data via your Profile settings.</li>
              <li><strong>Deletion:</strong> Permanently delete your account and all associated data from your Profile settings ("Delete Account").</li>
              <li><strong>Portability:</strong> Export your subscription data as a CSV (Pro feature).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-bold text-slate-900 mb-2">7. Data Retention</h2>
            <p>We retain your data for as long as your account is active. When you delete your account, all your personal data, subscriptions, and notifications are permanently and immediately removed from our database.</p>
          </section>

          <section>
            <h2 className="text-base font-bold text-slate-900 mb-2">8. Cookies</h2>
            <p>SubTrack uses cookies solely for authentication purposes (to keep you logged in). We do not use tracking or advertising cookies.</p>
          </section>

          <section>
            <h2 className="text-base font-bold text-slate-900 mb-2">9. Changes to This Policy</h2>
            <p>We may update this Privacy Policy from time to time. We will notify you of significant changes via email or an in-app notice.</p>
          </section>

          <section>
            <h2 className="text-base font-bold text-slate-900 mb-2">10. Contact</h2>
            <p>For privacy-related inquiries or data requests, contact us at privacy@subtrack.app.</p>
          </section>
        </div>
      </div>
    </div>
  );
};
