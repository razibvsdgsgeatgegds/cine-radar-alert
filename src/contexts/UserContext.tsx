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
        setUserState(JSON.parse(savedUser));
      } catch (error) {
        console.error('Failed to parse saved user data:', error);
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