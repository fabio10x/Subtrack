import { useState, useEffect } from 'react';
import { useAuth as useClerkAuth, useUser, useClerk } from '@clerk/react';
import { setSupabaseTokenGetter } from '../utils/supabase';

type ViewType = 'landing' | 'dashboard' | 'auth' | 'terms' | 'privacy';

interface UseAuthProps {
  showToast: (text: string, type?: 'success' | 'error' | 'info') => void;
  setIsUpgradeModalOpen: (open: boolean) => void;
}

// Guest mode is a local demo only: it never touches the database.
export const GUEST_USER_ID = 'guest-demo';

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

  const { isLoaded, isSignedIn, getToken } = useClerkAuth();
  const { user } = useUser();
  const clerk = useClerk();
  const [isGuest, setIsGuest] = useState(false);

  // Give the Supabase client the Clerk token so RLS can identify the user.
  useEffect(() => {
    setSupabaseTokenGetter(isSignedIn ? () => getToken({ template: 'supabase' }) : null);
    return () => setSupabaseTokenGetter(null);
  }, [isSignedIn, getToken]);

  // Shape kept compatible with the rest of the app: session.user.id, session.user.email, session.access_token.
  const session = isGuest
    ? { user: { id: GUEST_USER_ID, email: 'guest@demo.local', is_anonymous: true }, access_token: null }
    : isSignedIn && user
      ? {
          user: {
            id: user.id,
            email: user.primaryEmailAddress?.emailAddress || '',
            is_anonymous: false,
          },
          access_token: null,
        }
      : null;

  // Server calls (Netlify functions) take a Clerk token as Bearer.
  const getAccessToken = async (): Promise<string | null> => (isSignedIn ? getToken() : null);

  useEffect(() => {
    if (isSignedIn && currentView === 'auth') {
      setCurrentView('dashboard');
      window.location.hash = 'dashboard';
    }
  }, [isSignedIn, currentView]);

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

  const handleEnterDashboard = async (_tier: 'free' | 'pro' = 'pro') => {
    if (!session) {
      // Guest demo: local only, no account created
      setIsGuest(true);
      setCurrentView('dashboard');
      window.location.hash = 'dashboard';
      window.scrollTo({ top: 0, behavior: 'smooth' });
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
    if (isGuest) {
      setIsGuest(false);
    } else {
      await clerk.signOut();
    }
    setCurrentView('landing');
    window.location.hash = '';
  };

  return {
    session, currentView, setCurrentView, isLoaded, getAccessToken,
    handleEnterDashboard, handleOpenStripeFromLanding,
    handleBackToLanding, handleSignOut,
    showToast,
  };
}
