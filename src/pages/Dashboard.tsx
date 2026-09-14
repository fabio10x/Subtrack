import React from 'react';
import { Navbar } from '../components/Navbar';
import { ToastNotification } from '../components/dashboard/ToastNotification';
import { DashboardContent } from '../components/dashboard/DashboardContent';
import { DashboardFooter } from '../components/dashboard/DashboardFooter';
import { DashboardModals } from '../components/dashboard/DashboardModals';
import { GuestModeBanner } from '../components/dashboard/GuestModeBanner';
import { useSubtrackApp } from '../hooks/useSubtrackApp';

interface DashboardProps {
  appState: ReturnType<typeof useSubtrackApp>;
}

export function Dashboard({ appState }: DashboardProps) {
  const {
    currentUser, toastMessage, showToast,
    setSubToEdit, setIsSubModalOpen, setIsUpgradeModalOpen,
    setIsProfileModalOpen, setIsNotificationsOpen, setIsOptimizerOpen, setIsExportModalOpen,
    handleUpdateCurrency, unreadNotifsCount,
    handleBackToLanding, handleSignOut, setCurrentView, session,
  } = appState;

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-slate-900 flex flex-col font-sans antialiased selection:bg-blue-600 selection:text-white">
      <ToastNotification toastMessage={toastMessage} />

      <Navbar
        user={currentUser}
        onUpdateCurrency={handleUpdateCurrency}
        onOpenAddModal={() => { setSubToEdit(null); setIsSubModalOpen(true); }}
        onOpenUpgradeModal={() => setIsUpgradeModalOpen(true)}
        onOpenProfileModal={() => setIsProfileModalOpen(true)}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onOpenOptimizer={() => setIsOptimizerOpen(true)}
        onOpenExportModal={() => {
          if (currentUser?.tier === 'free') {
            setIsUpgradeModalOpen(true);
            showToast('CSV Export is a Pro feature. Upgrade to unlock.', 'error');
            return;
          }
          setIsExportModalOpen(true);
        }}
        unreadNotifsCount={unreadNotifsCount}
        onBackToLanding={handleBackToLanding}
        onSignOut={handleSignOut}
      />

      {session?.user?.is_anonymous && (
        <GuestModeBanner 
          onSignUp={() => {
            setCurrentView('auth');
            window.location.hash = 'auth';
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }} 
        />
      )}

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <DashboardContent appState={appState} />
      </main>

      <DashboardFooter
        onNavigate={(page) => {
          setCurrentView(page);
          window.location.hash = page;
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      <DashboardModals appState={appState} />
    </div>
  );
}
