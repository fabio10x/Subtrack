import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

export const FaqSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: 'How do the automated 3-day renewal email alerts work?',
      answer:
        'SubTrack runs an automated background scanner that checks all upcoming renewal dates and free trial expirations. 3 days prior to your billing date, we dispatch an email notification with the exact amount, payment method, and direct cancellation link so you have ample time to review or cancel.',
    },
    {
      question: 'Do I need to connect my real bank account or share credentials?',
      answer:
        'No. SubTrack is built with privacy in mind. You never need to link your bank credentials or grant third-party banking access. You simply log your subscriptions once or use our fast brand presets (Netflix, Spotify, AWS, GitHub, etc.), and SubTrack manages the timeline and calculations autonomously.',
    },
    {
      question: 'How does the Free Trial Countdown Tracker protect my money?',
      answer:
        'When you start a free trial (e.g. 7-day or 30-day trials), you toggle the "Free Trial" mode. SubTrack displays an urgent countdown badge on your dashboard, tracks the post-trial price conversion, and alerts you days before the trial lapses with a direct 1-click cancellation URL.',
    },
    {
      question: 'How does Stripe Checkout work for the Pro tier?',
      answer:
        'Upgrading to Pro ($5/mo or $48/yr) is powered by Stripe Checkout. All payment processing is securely handled through Stripe using bank-grade encryption. You can cancel, manage payment cards, or downgrade anytime from your profile settings with zero lock-in.',
    },
    {
      question: 'Can I track subscriptions in multiple international currencies?',
      answer:
        'Yes! You can record services in USD, EUR, GBP, JPY, CAD, AUD, CHF, INR, or BRL. SubTrack automatically normalizes every cost into your preferred base currency, so your Monthly Spend and Annual Run-Rate calculations are always 100% accurate.',
    },
    {
      question: 'Can I export my financial data to Excel or Google Sheets?',
      answer:
        'Pro members can download a complete, formatted CSV spreadsheet anytime. The export includes service names, categories, normalized monthly costs, payment cards, trial flags, renewal dates, and personal notes.',
    },
  ];

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-16 sm:py-24 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-3 border border-blue-100">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Frequently Asked Questions</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Got Questions? We Have Answers.
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-600">
            Everything you need to know about SubTrack subscriptions, billing, and privacy.
          </p>
        </div>

        {/* Accordion List */}
        <div className="space-y-3.5">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className={`rounded-2xl border transition-all overflow-hidden ${
                  isOpen
                    ? 'bg-slate-50/80 border-slate-300 shadow-2xs'
                    : 'bg-white border-slate-200/90 hover:border-slate-300'
                }`}
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 cursor-pointer"
                >
                  <span className="font-bold text-sm sm:text-base text-slate-900">
                    {faq.question}
                  </span>
                  <div
                    className={`p-1.5 rounded-full bg-white border border-slate-200 text-slate-500 shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-blue-600 bg-blue-50 border-blue-200' : ''
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 sm:px-6 sm:pb-6 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-200/60 pt-3">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
