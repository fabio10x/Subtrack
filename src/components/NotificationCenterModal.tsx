import React, { useState } from 'react';
import { 
  X, 
  Bell, 
  Mail, 
  Check, 
  Trash2, 
  Play, 
  RotateCw, 
  Sparkles, 
  Clock,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';
import { NotificationItem, CronRunResult } from '../types';
import { formatFriendlyDate } from '../utils/dateUtils';

interface NotificationCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  onMarkAsRead: (id: string) => void;
  onDeleteNotification: (id: string) => void;
  onTriggerCron: () => Promise<CronRunResult>;
}

export const NotificationCenterModal: React.FC<NotificationCenterModalProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAsRead,
  onDeleteNotification,
  onTriggerCron,
}) => {
  const [isRunningCron, setIsRunningCron] = useState(false);
  const [cronSummary, setCronSummary] = useState<CronRunResult | null>(null);
  const [selectedNotif, setSelectedNotif] = useState<NotificationItem | null>(null);

  if (!isOpen) return null;

  const handleRunCronNow = async () => {
    setIsRunningCron(true);
    setCronSummary(null);
    try {
      const result = await onTriggerCron();
      setCronSummary(result);
    } catch (err) {
      console.error(err);
    } finally {
      setIsRunningCron(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-xl text-slate-900">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Notifications & 3-Day Cron Alerts</h3>
              <p className="text-xs text-slate-500">
                Automated email alerts dispatched via Resend / SendGrid
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1">
          {/* Background Cron Execution Banner */}
          <div className="p-4 bg-blue-50/80 border border-blue-100 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center space-x-1.5">
                <Clock className="w-4 h-4 text-blue-600" />
                <span className="font-semibold text-blue-900 text-xs sm:text-sm">
                  Automated Background Cron Engine
                </span>
              </div>
              <p className="text-xs text-blue-700 mt-1 leading-relaxed">
                Scans subscriptions 3 days before renewal date and trial expiration, then sends email notifications.
              </p>
            </div>

            <button
              id="btn-trigger-cron"
              onClick={handleRunCronNow}
              disabled={isRunningCron}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold shadow-sm transition-all flex items-center justify-center space-x-1.5 shrink-0 cursor-pointer"
            >
              {isRunningCron ? (
                <>
                  <RotateCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Scanning...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>Run 3-Day Check Now</span>
                </>
              )}
            </button>
          </div>

          {/* Cron Result Summary (if just executed) */}
          {cronSummary && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-950 space-y-1">
              <div className="font-bold flex items-center space-x-1">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Cron Job Completed: {cronSummary.message}</span>
              </div>
              <p className="text-emerald-800">
                Scanned {cronSummary.checkedSubscriptions} subscriptions. Created{' '}
                {cronSummary.newNotificationsCreated} alerts. Dispatched{' '}
                {cronSummary.emailsSent} renewal emails.
              </p>
            </div>
          )}

          {/* Notifications Inbox List */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Recent Alert History ({notifications.length})
              </h4>
            </div>

            {notifications.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                <Mail className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                <p className="text-xs font-semibold text-slate-700">No alerts or notifications yet.</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Click "Run 3-Day Check Now" to test the renewal scanner.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => setSelectedNotif(selectedNotif?.id === n.id ? null : n)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                      !n.read
                        ? 'bg-blue-50/50 border-blue-200 hover:border-blue-300'
                        : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start space-x-2.5">
                        <div
                          className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${
                            n.type === 'trial_expiring'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}
                        >
                          <Mail className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-semibold text-xs text-slate-900">{n.title}</span>
                            {!n.read && (
                              <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
                            )}
                          </div>
                          <p className="text-xs text-slate-600 mt-0.5">{n.message}</p>
                          <span className="text-[10px] text-slate-400 mt-1 block">
                            {formatFriendlyDate(n.createdAt)}
                          </span>
                        </div>
                      </div>

                      <div
                        className="flex items-center space-x-1 shrink-0"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {!n.read && (
                          <button
                            onClick={() => onMarkAsRead(n.id)}
                            className="p-1 rounded hover:bg-slate-200 text-slate-500 hover:text-slate-900 transition-colors"
                            title="Mark as read"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => onDeleteNotification(n.id)}
                          className="p-1 rounded hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors"
                          title="Delete notification"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Email Preview Drawer */}
                    {selectedNotif?.id === n.id && (
                      <div className="mt-3 pt-3 border-t border-slate-200 bg-white p-3 rounded-lg text-xs space-y-2 shadow-2xs">
                        <div className="flex items-center justify-between text-slate-500 font-mono text-[10px]">
                          <span>PROVIDER: Resend API</span>
                          <span>STATUS: Delivered (200 OK)</span>
                        </div>
                        <div className="font-semibold text-slate-900">Email Subject: {n.title}</div>
                        <div className="p-3 bg-slate-50 rounded border border-slate-200 text-slate-700 leading-relaxed">
                          {n.message}
                          <div className="mt-2 pt-2 border-t border-slate-200 text-[11px] text-slate-500">
                            Sent to your registered email via SubTrack automated cron service.
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-end bg-slate-50/50">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-semibold rounded-lg shadow-sm transition-colors"
          >
            Close Center
          </button>
        </div>
      </div>
    </div>
  );
};
