import React from 'react';
import { LandingHeader } from './LandingHeader';
import { HeroSection } from './HeroSection';
import { ProductPreview } from './ProductPreview';
import { FeatureGrid } from './FeatureGrid';
import { PricingTable } from './PricingTable';
import { FaqSection } from './FaqSection';
import { LandingFooter } from './LandingFooter';

interface LandingPageProps {
  onEnterDashboard: (tier?: 'free' | 'pro') => void;
  onOpenStripeCheckout?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onEnterDashboard,
  onOpenStripeCheckout,
}) => {
  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans antialiased selection:bg-blue-600 selection:text-white">
      {/* Header */}
      <LandingHeader onEnterDashboard={onEnterDashboard} />

      {/* Main Sections */}
      <main>
        {/* 1. Hero Section */}
        <HeroSection onEnterDashboard={onEnterDashboard} />

        {/* 2. Product Preview Mockup */}
        <ProductPreview onEnterDashboard={onEnterDashboard} />

        {/* 3. Feature Grid */}
        <FeatureGrid onEnterDashboard={onEnterDashboard} />

        {/* 4. Pricing Table */}
        <PricingTable 
          onEnterDashboard={onEnterDashboard} 
          onOpenStripeCheckout={onOpenStripeCheckout} 
        />

        {/* 5. FAQ Accordion */}
        <FaqSection />
      </main>

      {/* Footer */}
      <LandingFooter onEnterDashboard={onEnterDashboard} />
    </div>
  );
};
