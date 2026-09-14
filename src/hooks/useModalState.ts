import { useState } from 'react';
import { Subscription } from '../types';

export function useModalState() {
  const [isSubModalOpen, setIsSubModalOpen] = useState(false);
  const [subToEdit, setSubToEdit] = useState<Subscription | null>(null);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [isOptimizerOpen, setIsOptimizerOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  return {
    isSubModalOpen, setIsSubModalOpen,
    subToEdit, setSubToEdit,
    isUpgradeModalOpen, setIsUpgradeModalOpen,
    isOptimizerOpen, setIsOptimizerOpen,
    isNotificationsOpen, setIsNotificationsOpen,
    isProfileModalOpen, setIsProfileModalOpen,
    isExportModalOpen, setIsExportModalOpen,
  };
}
