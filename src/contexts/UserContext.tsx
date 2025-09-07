import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserPreferences } from '@/types';

interface UserContextType {
  user: UserPreferences | null;
  setUser: (user: UserPreferences) => void;
  clearUser: () => void;
  isOnboarded: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUserState] = useState<UserPreferences | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('radar-user');
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
  }, []);

  const setUser = (userData: UserPreferences) => {
    setUserState(userData);
    localStorage.setItem('radar-user', JSON.stringify(userData));
  };

  const clearUser = () => {
    setUserState(null);
    localStorage.removeItem('radar-user');
  };

  return (
    <UserContext.Provider value={{
      user,
      setUser,
      clearUser,
      isOnboarded: !!user
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
