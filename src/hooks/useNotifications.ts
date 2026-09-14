import { Dispatch, SetStateAction } from 'react';
import { NotificationItem, CronRunResult } from '../types';
import { supabase } from '../utils/supabase';

interface UseNotificationsProps {
  notifications: NotificationItem[];
  setNotifications: Dispatch<SetStateAction<NotificationItem[]>>;
  session: any;
  fetchAllData: (userId?: string) => Promise<void>;
}

export function useNotifications({ notifications, setNotifications, session, fetchAllData }: UseNotificationsProps) {

  const handleMarkNotifRead = async (id: string) => {
    await supabase.from('subtrack_notifications').update({ read: true }).eq('id', id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const handleDeleteNotif = async (id: string) => {
    await supabase.from('subtrack_notifications').delete().eq('id', id);
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleTriggerCron = async (): Promise<CronRunResult> => {
    try {
      const res = await fetch('/.netlify/functions/cron-check', { method: 'POST' });
      const data = await res.json();
      await fetchAllData(session?.user?.id);
      return {
        timestamp: new Date().toISOString(), scannedCount: 0,
        alertsTriggered: data.alertsTriggered || 0, notificationsCreated: [],
        message: 'Cron executed successfully',
      };
    } catch (err) {
      console.error(err);
      return { timestamp: '', scannedCount: 0, alertsTriggered: 0, notificationsCreated: [], message: 'Cron failed' };
    }
  };

  const unreadNotifsCount = notifications.filter(n => !n.read).length;

  return { handleMarkNotifRead, handleDeleteNotif, handleTriggerCron, unreadNotifsCount };
}
