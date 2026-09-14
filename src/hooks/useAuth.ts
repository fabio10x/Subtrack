import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';

type ViewType = 'landing' | 'dashboard' | 'auth' | 'terms' | 'privacy';

interface UseAuthProps {
  showToast: (text: string, type?: 'success' | 'error' | 'info') => void;
  setIsUpgradeModalOpen: (open: boolean) => void;
}

export function useAuth({ showToast, setIsUpgradeModalOpen }: UseAuthProps) {
  const [currentView, setCurrentView] = useState<ViewType>(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash;
      const path = window.location.pathname;
      if (hash === '#dashboard' || path.includes('/dashboard')) return 'dashboard';
      if (hash === '#auth') return 'auth';
      if (hash === '#terms') return 'terms';
      if (hash === '#privacy') return 'privacy';
    }
    return 'landing';
  });

  const [session, setSession] = useState<any>(null);
  const [isResetPasswordModalOpen, setIsResetPasswordModalOpen] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [isResettingPassword, setIsResettingPassword] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (_event === 'PASSWORD_RECOVERY') setIsResetPasswordModalOpen(true);
      if ((_event === 'SIGNED_IN' || _event === 'TOKEN_REFRESHED') && session) {
        setCurrentView('dashboard');
        window.location.hash = 'dashboard';
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const onHashChange = () => {
      if (window.location.hash === '#dashboard') setCurrentView('dashboard');
      else if (window.location.hash === '#auth') setCurrentView('auth');
      else if (window.location.hash === '#terms') { setCurrentView('terms'); window.scrollTo({ top: 0, behavior: 'smooth' }); }
      else if (window.location.hash === '#privacy') { setCurrentView('privacy'); window.scrollTo({ top: 0, behavior: 'smooth' }); }
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const handleEnterDashboard = async (tier: 'free' | 'pro' = 'pro') => {
    if (!session) {
      try {
        const { error } = await supabase.auth.signInAnonymously();
        if (error) throw error;
        // Session will be updated by onAuthStateChange, which redirects to dashboard
      } catch (err: any) {
        showToast('Failed to start guest session: ' + err.message, 'error');
        setCurrentView('auth');
        window.location.hash = 'auth';
      }
      return;
    }
    setCurrentView('dashboard');
    window.location.hash = 'dashboard';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenStripeFromLanding = async () => {
    if (!session) {
      setCurrentView('auth');
      window.location.hash = 'auth';
      return;
    }
    setCurrentView('dashboard');
    setIsUpgradeModalOpen(true);
    window.location.hash = 'dashboard';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToLanding = () => {
    setCurrentView('landing');
    window.history.pushState(null, '', window.location.pathname);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setCurrentView('landing');
    window.location.hash = '';
  };

  return {
    session, currentView, setCurrentView,
    isResetPasswordModalOpen, setIsResetPasswordModalOpen,
    newPassword, setNewPassword,
    isResettingPassword, setIsResettingPassword,
    handleEnterDashboard, handleOpenStripeFromLanding,
    handleBackToLanding, handleSignOut,
  };
}
