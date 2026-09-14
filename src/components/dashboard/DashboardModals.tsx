import React from 'react';
import { SubscriptionModal } from '../SubscriptionModal';
import { UpgradeModal } from '../UpgradeModal';
import { CostOptimizerModal } from '../CostOptimizerModal';
import { NotificationCenterModal } from '../NotificationCenterModal';
import { ProfileModal } from '../ProfileModal';
import { CsvExportModal } from '../CsvExportModal';
import { useSubtrackApp } from '../../hooks/useSubtrackApp';

interface DashboardModalsProps {
  appState: ReturnType<typeof useSubtrackApp>;
}

export function DashboardModals({ appState }: DashboardModalsProps) {
  const {
    currentUser, subscriptions, notifications,
    isSubModalOpen, setIsSubModalOpen, subToEdit, setSubToEdit,
    isUpgradeModalOpen, setIsUpgradeModalOpen,
    isOptimizerOpen, setIsOptimizerOpen,
    isNotificationsOpen, setIsNotificationsOpen,
    isProfileModalOpen, setIsProfileModalOpen,
    isExportModalOpen, setIsExportModalOpen,
    handleSaveSubscription, handleConfirmUpgrade,
    handleMarkNotifRead, handleDeleteNotif, handleTriggerCron,
    handleUpdateProfile, handleCancelPro, handleDeleteAccount,
  } = appState;

  return (
    <>
      <SubscriptionModal
        isOpen={isSubModalOpen}
        onClose={() => { setIsSubModalOpen(false); setSubToEdit(null); }}
        onSave={handleSaveSubscription}
        subscriptionToEdit={subToEdit}
        preferredCurrency={currentUser.preferredCurrency}
      />
      <UpgradeModal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
        user={currentUser}
        onConfirmUpgrade={handleConfirmUpgrade}
      />
      <CostOptimizerModal
        isOpen={isOptimizerOpen}
        onClose={() => setIsOptimizerOpen(false)}
        subscriptions={subscriptions}
        preferredCurrency={currentUser.preferredCurrency}
        userTier={currentUser.tier}
        onOpenUpgrade={() => setIsUpgradeModalOpen(true)}
        onEditSubscription={(sub) => { setSubToEdit(sub); setIsSubModalOpen(true); }}
      />
      <NotificationCenterModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        notifications={notifications}
        onMarkAsRead={handleMarkNotifRead}
        onDeleteNotification={handleDeleteNotif}
        onTriggerCron={handleTriggerCron}
      />
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        user={currentUser}
        onUpdateProfile={handleUpdateProfile}
        onOpenUpgrade={() => setIsUpgradeModalOpen(true)}
        onCancelPro={handleCancelPro}
        onDeleteAccount={handleDeleteAccount}
      />
      <CsvExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        user={currentUser}
        subscriptions={subscriptions}
        preferredCurrency={currentUser.preferredCurrency}
        onOpenUpgrade={() => setIsUpgradeModalOpen(true)}
      />
    </>
  );
}
