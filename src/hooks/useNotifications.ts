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

  // Manual trigger removed: cron-check now requires a server-side CRON_SECRET, which must never
  // be shipped to the browser. Alerts run on the daily Netlify schedule.
  const handleTriggerCron = async (): Promise<CronRunResult> => {
    return {
      timestamp: '', scannedCount: 0, alertsTriggered: 0, notificationsCreated: [],
      message: 'Manual alert runs are disabled. Alerts are sent by the daily scheduled job.',
    };
  };

  const unreadNotifsCount = notifications.filter(n => !n.read).length;

  return { handleMarkNotifRead, handleDeleteNotif, handleTriggerCron, unreadNotifsCount };
}
