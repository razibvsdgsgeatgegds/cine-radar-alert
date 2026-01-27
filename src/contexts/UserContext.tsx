import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserPreferences } from '@/types';

interface AuthUser {
  name: string;
  email: string;
  isAuthenticated: boolean;
}

interface UserContextType {
  user: UserPreferences | null;
  authUser: AuthUser | null;
  setUser: (user: UserPreferences) => void;
  setAuthUser: (user: AuthUser) => void;
  clearUser: () => void;
  isOnboarded: boolean;
  isAuthenticated: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

// Helper to get all saved user preferences keyed by email
const getUserPrefsKey = (email: string) => `radar-user-${email}`;

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUserState] = useState<UserPreferences | null>(null);
  const [authUser, setAuthUserState] = useState<AuthUser | null>(null);

  // Load saved auth user and preferences on mount
  useEffect(() => {
    const savedAuthUser = localStorage.getItem('radarapp-auth');
    
    if (savedAuthUser) {
      try {
        const parsedAuth = JSON.parse(savedAuthUser);
        setAuthUserState(parsedAuth);
        
        // Try to load preferences for this user's email
        if (parsedAuth.email) {
          loadUserPreferences(parsedAuth.email);
        }
      } catch (error) {
        console.error('Error parsing saved auth data:', error);
        localStorage.removeItem('radarapp-auth');
      }
    } else {
      // Fallback: try to load from old 'radar-user' key for migration
      const legacyUser = localStorage.getItem('radar-user');
      if (legacyUser) {
        try {
          const parsedUser = JSON.parse(legacyUser);
          setUserState(createUserWithDefaults(parsedUser));
        } catch (error) {
          console.error('Failed to parse legacy user data:', error);
          localStorage.removeItem('radar-user');
        }
      }
    }
  }, []);

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
    
    // Ensure location has proper structure
    if (!defaultUser.location?.country) {
      defaultUser.location = { country: '' };
    }
    
    return defaultUser;
  };

  // Load preferences for a specific email
  const loadUserPreferences = (email: string) => {
    // Try email-specific key first
    const emailSpecificPrefs = localStorage.getItem(getUserPrefsKey(email));
    if (emailSpecificPrefs) {
      try {
        const parsedUser = JSON.parse(emailSpecificPrefs);
        setUserState(createUserWithDefaults(parsedUser));
        return true;
      } catch (error) {
        console.error('Failed to parse user preferences:', error);
      }
    }
    
    // Fallback: check legacy 'radar-user' key
    const legacyUser = localStorage.getItem('radar-user');
    if (legacyUser) {
      try {
        const parsedUser = JSON.parse(legacyUser);
        // If legacy prefs match this email, migrate to new key
        if (parsedUser.email === email || !parsedUser.email) {
          parsedUser.email = email;
          const userWithDefaults = createUserWithDefaults(parsedUser);
          setUserState(userWithDefaults);
          // Migrate to email-specific storage
          localStorage.setItem(getUserPrefsKey(email), JSON.stringify(userWithDefaults));
          localStorage.removeItem('radar-user');
          return true;
        }
      } catch (error) {
        console.error('Failed to parse legacy user data:', error);
      }
    }
    
    return false;
  };

  const setUser = (userData: UserPreferences) => {
    setUserState(userData);
    
    // Save to email-specific key
    if (userData.email) {
      localStorage.setItem(getUserPrefsKey(userData.email), JSON.stringify(userData));
    }
    
    // Also save to legacy key for backward compatibility
    localStorage.setItem('radar-user', JSON.stringify(userData));
  };

  const setAuthUser = (authData: AuthUser) => {
    setAuthUserState(authData);
    localStorage.setItem('radarapp-auth', JSON.stringify(authData));
    
    // When auth changes, try to load existing preferences for this email
    if (authData.email) {
      const hasExistingPrefs = loadUserPreferences(authData.email);
      
      // If no existing prefs found, check if we need to clear mismatched prefs
      if (!hasExistingPrefs) {
        // Clear any loaded prefs that don't belong to this user
        if (user && user.email && user.email !== authData.email) {
          setUserState(null);
        }
      }
    }
  };

  const clearUser = () => {
    setAuthUserState(null);
    localStorage.removeItem('radarapp-auth');
    // Clear notification prompt session storage
    sessionStorage.removeItem('notificationPromptDismissed');
    // Don't clear user preferences - keep them for when user logs back in
  };

  return (
    <UserContext.Provider value={{
      user,
      authUser,
      setUser,
      setAuthUser,
      clearUser,
      isOnboarded: !!user,
      isAuthenticated: !!authUser?.isAuthenticated
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
