import React, { useEffect } from 'react';
import posthog from 'posthog-js';
import { LandingPage } from './components/landing/LandingPage';
import { TermsPage } from './components/landing/TermsPage';
import { PrivacyPage } from './components/landing/PrivacyPage';
import { Auth } from './components/Auth';
import { Dashboard } from './pages/Dashboard';
import { ResetPasswordModal } from './components/ResetPasswordModal';
import { useSubtrackApp } from './hooks/useSubtrackApp';
import { UpgradeModal } from './components/UpgradeModal';

export default function App() {
  const appState = useSubtrackApp();
  const { 
    currentView, setCurrentView, 
    isResetPasswordModalOpen, setIsResetPasswordModalOpen,
    newPassword, setNewPassword,
    isResettingPassword, setIsResettingPassword,
    showToast,
    isUpgradeModalOpen, setIsUpgradeModalOpen,
    currentUser, handleConfirmUpgrade, handleEnterDashboard, handleOpenStripeFromLanding
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
    return <Auth onBack={appState.handleBackToLanding} />;
  }

  if (currentView === 'terms') {
    return (
      <TermsPage
        onBack={() => {
          setCurrentView('landing');
          window.history.pushState(null, '', window.location.pathname);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />
    );
  }

  if (currentView === 'privacy') {
    return (
      <PrivacyPage
        onBack={() => {
          setCurrentView('landing');
          window.history.pushState(null, '', window.location.pathname);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />
    );
  }

  // Dashboard View
  return (
    <>
      <Dashboard appState={appState} />

      {/* Password Reset Modal (Global) */}
      <ResetPasswordModal
        isOpen={isResetPasswordModalOpen}
        newPassword={newPassword}
        isResettingPassword={isResettingPassword}
        onNewPasswordChange={setNewPassword}
        onResettingChange={setIsResettingPassword}
        onClose={() => setIsResetPasswordModalOpen(false)}
        onSuccess={() => showToast('Password updated successfully')}
        onError={(msg) => showToast(msg, 'error')}
      />
    </>
  );
}
