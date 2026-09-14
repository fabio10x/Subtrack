import React from 'react';
import { supabase } from '../utils/supabase';

interface ResetPasswordModalProps {
  isOpen: boolean;
  newPassword: string;
  isResettingPassword: boolean;
  onNewPasswordChange: (value: string) => void;
  onResettingChange: (value: boolean) => void;
  onClose: () => void;
  onSuccess: () => void;
  onError: (message: string) => void;
}

export function ResetPasswordModal({
  isOpen,
  newPassword,
  isResettingPassword,
  onNewPasswordChange,
  onResettingChange,
  onClose,
  onSuccess,
  onError,
}: ResetPasswordModalProps) {
  if (!isOpen) return null;

  const handleSubmit = async () => {
    onResettingChange(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    onResettingChange(false);
    if (error) {
      onError(error.message);
    } else {
      onSuccess();
      onClose();
      onNewPasswordChange('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="bg-white rounded-xl p-6 shadow-xl max-w-sm w-full">
        <h3 className="text-lg font-bold text-slate-900 mb-2">Update Password</h3>
        <p className="text-sm text-slate-500 mb-4">Enter your new password below.</p>
        <input
          type="password"
          value={newPassword}
          onChange={(e) => onNewPasswordChange(e.target.value)}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm mb-4"
          placeholder="••••••••"
          minLength={6}
        />
        <button
          disabled={isResettingPassword || newPassword.length < 6}
          onClick={handleSubmit}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {isResettingPassword ? 'Updating...' : 'Update Password'}
        </button>
      </div>
    </div>
  );
}
