import React from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

interface ToastNotificationProps {
  toastMessage: { type: 'success' | 'error' | 'info'; text: string } | null;
}

export function ToastNotification({ toastMessage }: ToastNotificationProps) {
  if (!toastMessage) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 animate-bounce-short">
      <div
        className={`px-4 py-3 rounded-xl shadow-lg border text-xs sm:text-sm font-medium flex items-center space-x-2.5 backdrop-blur-md ${
          toastMessage.type === 'error'
            ? 'bg-white border-red-200 text-red-700'
            : toastMessage.type === 'info'
            ? 'bg-white border-blue-200 text-blue-700'
            : 'bg-white border-emerald-200 text-emerald-700'
        }`}
      >
        {toastMessage.type === 'error' ? (
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
        ) : (
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
        )}
        <span>{toastMessage.text}</span>
      </div>
    </div>
  );
}
