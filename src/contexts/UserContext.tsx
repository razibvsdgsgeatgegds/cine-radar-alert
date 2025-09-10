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

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUserState] = useState<UserPreferences | null>(null);
  const [authUser, setAuthUserState] = useState<AuthUser | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('radar-user');
    const savedAuthUser = localStorage.getItem('radarapp-auth');
    
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        // Add default values for new fields if they don't exist
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
          ...parsedUser,
        };
        // Ensure location has proper structure
        if (!defaultUser.location?.country) {
          defaultUser.location = { country: '' };
        }
        setUserState(defaultUser);
      } catch (error) {
        console.error('Failed to parse saved user data:', error);
        localStorage.removeItem('radar-user');
      }
    }
    
    if (savedAuthUser) {
      try {
        setAuthUserState(JSON.parse(savedAuthUser));
      } catch (error) {
        console.error('Error parsing saved auth data:', error);
        localStorage.removeItem('radarapp-auth');
      }
    }
  }, []);

  const setUser = (userData: UserPreferences) => {
    setUserState(userData);
    localStorage.setItem('radar-user', JSON.stringify(userData));
  };

  const setAuthUser = (authData: AuthUser) => {
    setAuthUserState(authData);
    localStorage.setItem('radarapp-auth', JSON.stringify(authData));
  };

  const clearUser = () => {
    setUserState(null);
    setAuthUserState(null);
    localStorage.removeItem('radar-user');
    localStorage.removeItem('radarapp-auth');
    // Clear notification prompt session storage to avoid re-showing onboarding
    sessionStorage.removeItem('notificationPromptDismissed');
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
