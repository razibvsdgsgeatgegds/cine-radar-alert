import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { UserPreferences } from '@/types';
import { supabase } from '@/integrations/supabase/client';

interface AuthUser {
  name: string;
  email: string;
  isAuthenticated: boolean;
  lastLoginAt?: string;
}

interface UserContextType {
  user: UserPreferences | null;
  authUser: AuthUser | null;
  setUser: (user: UserPreferences) => void;
  setAuthUser: (user: AuthUser) => void;
  clearUser: () => void;
  resetPreferences: () => void;
  markOnboardingComplete: () => void;
  isOnboarded: boolean;
  onboardingCompleted: boolean;
  isProfileLoading: boolean;
  isAuthenticated: boolean;
  isReturningUser: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

// Helper to get all saved user preferences keyed by email
const getUserPrefsKey = (email: string) => `radar-user-${email}`;
const getLastLoginKey = (email: string) => `radar-last-login-${email}`;
const getOnboardedKey = (email: string) => `watchverse-onboarded-${email}`;

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUserState] = useState<UserPreferences | null>(null);
  const [authUser, setAuthUserState] = useState<AuthUser | null>(null);
  const [isReturningUser, setIsReturningUser] = useState(false);
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);
  const [isProfileLoading, setIsProfileLoading] = useState(false);

  // Create user preferences with default values
  const createUserWithDefaults = (userData: Partial<UserPreferences>): UserPreferences => {
    const defaultUser: UserPreferences = {
      name: '',
      email: '',
      gender: '',
      age: 0,
      location: { country: '' },
      interests: { movies: [], series: [], games: [] },
      notifications_enabled: false,
      languages: [],
      industries: [],
      platforms: [],
      notification_list: [],
      ...userData,
    };

    if (!defaultUser.location?.country) {
      defaultUser.location = { country: '' };
    }

    return defaultUser;
  };

  // Load preferences for a specific email from localStorage (fast path / offline fallback)
  const loadLocalPreferences = useCallback((email: string): UserPreferences | null => {
    const emailSpecificPrefs = localStorage.getItem(getUserPrefsKey(email));
    if (emailSpecificPrefs) {
      try {
        return createUserWithDefaults(JSON.parse(emailSpecificPrefs));
      } catch (error) {
        console.error('Failed to parse user preferences:', error);
      }
    }

    const legacyUser = localStorage.getItem('radar-user');
    if (legacyUser) {
      try {
        const parsedUser = JSON.parse(legacyUser);
        if (parsedUser.email === email || !parsedUser.email) {
          parsedUser.email = email;
          const withDefaults = createUserWithDefaults(parsedUser);
          localStorage.setItem(getUserPrefsKey(email), JSON.stringify(withDefaults));
          localStorage.removeItem('radar-user');
          return withDefaults;
        }
      } catch (error) {
        console.error('Failed to parse legacy user data:', error);
      }
    }

    return null;
  }, []);

  // Load the account-level profile (works on any device / browser)
  const syncProfileFromServer = useCallback(async (email?: string) => {
    setIsProfileLoading(true);
    try {
      const { data: { user: sbUser } } = await supabase.auth.getUser();
      if (!sbUser) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('preferences, onboarding_completed, name, email')
        .eq('id', sbUser.id)
        .maybeSingle();

      const accountEmail = email || sbUser.email || '';

      if (profile?.onboarding_completed) {
        setOnboardingCompleted(true);
        if (accountEmail) localStorage.setItem(getOnboardedKey(accountEmail), 'true');
      }

      if (profile?.preferences) {
        const prefs = createUserWithDefaults(profile.preferences as Partial<UserPreferences>);
        setUserState(prefs);
        if (accountEmail) localStorage.setItem(getUserPrefsKey(accountEmail), JSON.stringify(prefs));
      } else if (!profile) {
        // First time we see this account on the server: push up anything stored locally
        const local = accountEmail ? loadLocalPreferences(accountEmail) : null;
        const localCompleted = accountEmail
          ? localStorage.getItem(getOnboardedKey(accountEmail)) === 'true'
          : false;
        if (local || localCompleted) {
          await supabase.from('profiles').upsert({
            id: sbUser.id,
            email: accountEmail,
            name: local?.name ?? null,
            preferences: local ? (local as unknown as Record<string, unknown>) : null,
            onboarding_completed: localCompleted,
          });
        }
      }
    } catch (error) {
      console.error('Profile sync failed:', error);
    } finally {
      setIsProfileLoading(false);
    }
  }, [loadLocalPreferences]);

  // Load saved auth user and preferences on mount
  useEffect(() => {
    const savedAuthUser = localStorage.getItem('radarapp-auth');

    if (savedAuthUser) {
      try {
        const parsedAuth = JSON.parse(savedAuthUser);
        setAuthUserState(parsedAuth);

        if (parsedAuth.email) {
          const local = loadLocalPreferences(parsedAuth.email);
          if (local) setUserState(local);
          if (localStorage.getItem(getOnboardedKey(parsedAuth.email)) === 'true') {
            setOnboardingCompleted(true);
          }
        }
        syncProfileFromServer(parsedAuth.email);
      } catch (error) {
        console.error('Error parsing saved auth data:', error);
        localStorage.removeItem('radarapp-auth');
      }
    }
  }, [loadLocalPreferences, syncProfileFromServer]);

  const persistProfile = useCallback(async (patch: Record<string, unknown>) => {
    try {
      const { data: { user: sbUser } } = await supabase.auth.getUser();
      if (!sbUser) return;
      await supabase.from('profiles').upsert({
        id: sbUser.id,
        email: sbUser.email ?? null,
        ...patch,
      });
    } catch (error) {
      console.error('Failed to save profile:', error);
    }
  }, []);

  const setUser = (userData: UserPreferences) => {
    setUserState(userData);

    if (userData.email) {
      localStorage.setItem(getUserPrefsKey(userData.email), JSON.stringify(userData));
    }
    localStorage.setItem('radar-user', JSON.stringify(userData));

    persistProfile({
      name: userData.name || null,
      preferences: userData as unknown as Record<string, unknown>,
    });
  };

  const markOnboardingComplete = () => {
    setOnboardingCompleted(true);
    if (authUser?.email) {
      localStorage.setItem(getOnboardedKey(authUser.email), 'true');
    }
    persistProfile({ onboarding_completed: true });
  };

  const setAuthUser = (authData: AuthUser) => {
    const lastLoginKey = getLastLoginKey(authData.email);
    const previousLogin = localStorage.getItem(lastLoginKey);
    const hasExistingPrefs = authData.email && (
      localStorage.getItem(getUserPrefsKey(authData.email)) ||
      localStorage.getItem('radar-user')
    );

    const updatedAuthData: AuthUser = {
      ...authData,
      lastLoginAt: previousLogin || undefined
    };

    setAuthUserState(updatedAuthData);
    localStorage.setItem('radarapp-auth', JSON.stringify(updatedAuthData));
    localStorage.setItem(lastLoginKey, new Date().toISOString());

    if (previousLogin && hasExistingPrefs) {
      setIsReturningUser(true);
    }

    if (authData.email) {
      const local = loadLocalPreferences(authData.email);
      if (local) {
        setUserState(local);
      } else if (user && user.email && user.email !== authData.email) {
        setUserState(null);
      }
      if (localStorage.getItem(getOnboardedKey(authData.email)) === 'true') {
        setOnboardingCompleted(true);
      }
      // Authoritative check against the account stored in the database
      syncProfileFromServer(authData.email);
    }
  };

  const clearUser = () => {
    setAuthUserState(null);
    setIsReturningUser(false);
    setOnboardingCompleted(false);
    localStorage.removeItem('radarapp-auth');
    sessionStorage.removeItem('notificationPromptDismissed');
    // Don't clear user preferences - keep them for when user logs back in
  };

  const resetPreferences = () => {
    setUserState(null);
    setOnboardingCompleted(false);

    if (authUser?.email) {
      localStorage.removeItem(getUserPrefsKey(authUser.email));
      localStorage.removeItem(getOnboardedKey(authUser.email));
    }
    localStorage.removeItem('radar-user');
    sessionStorage.removeItem('notificationPromptDismissed');
    persistProfile({ preferences: null, onboarding_completed: false });
  };

  return (
    <UserContext.Provider value={{
      user,
      authUser,
      setUser,
      setAuthUser,
      clearUser,
      resetPreferences,
      markOnboardingComplete,
      isOnboarded: !!user,
      onboardingCompleted,
      isProfileLoading,
      isAuthenticated: !!authUser?.isAuthenticated,
      isReturningUser
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
