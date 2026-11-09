import React, { useEffect, Suspense, lazy } from 'react';
import posthog from 'posthog-js';
import { LandingPage } from './components/landing/LandingPage';
import { UpgradeModal } from './components/UpgradeModal';
import { useSubtrackApp } from './hooks/useSubtrackApp';

// Loaded on demand so the landing page (what most visitors see) stays small.
const TermsPage = lazy(() => import('./components/landing/TermsPage').then(m => ({ default: m.TermsPage })));
const PrivacyPage = lazy(() => import('./components/landing/PrivacyPage').then(m => ({ default: m.PrivacyPage })));
const Auth = lazy(() => import('./components/Auth').then(m => ({ default: m.Auth })));
const Dashboard = lazy(() => import('./pages/Dashboard').then(m => ({ default: m.Dashboard })));

const PageFallback = () => (
  <div className="min-h-screen flex items-center justify-center text-slate-500 text-sm">Loading…</div>
);

export default function App() {
  const appState = useSubtrackApp();
  const { 
    currentView, setCurrentView, 
    currentUser, handleConfirmUpgrade, handleEnterDashboard, handleOpenStripeFromLanding,
    isUpgradeModalOpen, setIsUpgradeModalOpen,
  } = appState;

  useEffect(() => {
    if (currentUser?.id) {
      posthog.identify(currentUser.id, {
        email: currentUser.email,
        tier: currentUser.tier,
      });
    } else {
      posthog.reset();
    }
  }, [currentUser?.id, currentUser?.tier]);

  if (currentView === 'landing') {
    return (
      <>
        <LandingPage
          onEnterDashboard={handleEnterDashboard}
          onGoToAuth={() => {
            setCurrentView('auth');
            window.location.hash = 'auth';
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onOpenStripeCheckout={handleOpenStripeFromLanding}
          onNavigate={(page) => {
            setCurrentView(page);
            window.location.hash = page;
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
        <UpgradeModal
          isOpen={isUpgradeModalOpen}
          onClose={() => setIsUpgradeModalOpen(false)}
          user={currentUser}
          onConfirmUpgrade={handleConfirmUpgrade}
        />
      </>
    );
  }

  if (currentView === 'auth') {
    return (
      <Suspense fallback={<PageFallback />}>
        <Auth onBack={appState.handleBackToLanding} />
      </Suspense>
    );
  }

  if (currentView === 'terms') {
    return (
      <Suspense fallback={<PageFallback />}>
        <TermsPage
          onBack={() => {
            setCurrentView('landing');
            window.history.pushState(null, '', window.location.pathname);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      </Suspense>
    );
  }

  if (currentView === 'privacy') {
    return (
      <Suspense fallback={<PageFallback />}>
        <PrivacyPage
          onBack={() => {
            setCurrentView('landing');
            window.history.pushState(null, '', window.location.pathname);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      </Suspense>
    );
  }

  // Dashboard View
  return (
    <Suspense fallback={<PageFallback />}>
      <Dashboard appState={appState} />
    </Suspense>
  );
}
