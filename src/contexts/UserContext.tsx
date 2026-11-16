import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import type { UserPreferences } from '@/types';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import type { Json } from '@/integrations/supabase/types';
import { supabase } from '@/integrations/supabase/client';
import { normalizePreferences, resolveAccountProfile } from '@/lib/accountProfile';
import { toast } from 'sonner';

interface AuthUser { name: string; email: string; isAuthenticated: boolean; lastLoginAt?: string }
interface UserContextType {
  user: UserPreferences | null; authUser: AuthUser | null;
  setUser: (user: UserPreferences) => Promise<void>;
  setAuthUser: (user: AuthUser) => void;
  clearUser: () => void; resetPreferences: () => Promise<void>;
  markOnboardingComplete: (preferences: UserPreferences) => Promise<void>;
  retryProfile: () => void; profileError: boolean;
  isOnboarded: boolean; onboardingCompleted: boolean; isProfileLoading: boolean;
  isAuthenticated: boolean; isReturningUser: boolean;
}
const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUserState] = useState<UserPreferences | null>(null);
  const [authUser, setAuthUserState] = useState<AuthUser | null>(null);
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState(false);
  const [isReturningUser, setIsReturningUser] = useState(false);
  const account = useRef<SupabaseUser | null>(null);
  const generation = useRef(0);
  const writeQueue = useRef<Promise<void>>(Promise.resolve());

  const clearUser = useCallback(() => {
    generation.current += 1; account.current = null;
    setUserState(null); setAuthUserState(null); setOnboardingCompleted(false);
    setProfileError(false); setIsProfileLoading(false); setIsReturningUser(false);
    localStorage.removeItem('radarapp-auth');
    sessionStorage.removeItem('notificationPromptDismissed');
  }, []);

  const loadAccount = useCallback(async (sbUser: SupabaseUser) => {
    const request = ++generation.current;
    account.current = sbUser;
    setIsProfileLoading(true); setProfileError(false);
    setUserState(null); setOnboardingCompleted(false);
    const email = sbUser.email || '';
    const name = sbUser.user_metadata?.full_name || email.split('@')[0] || 'User';
    setAuthUserState({ name, email, isAuthenticated: true });
    try {
      const { data, error } = await supabase.from('profiles')
        .select('preferences, onboarding_completed, name, email').eq('id', sbUser.id).maybeSingle();
      if (error) throw error;
      if (generation.current !== request) return;
      const resolved = resolveAccountProfile(data, email);
      // A completed server flag always bypasses setup, even if an older profile lacks preferences.
      const prefs = resolved.user || (resolved.completed ? normalizePreferences({ name: data?.name || name }, email) : null);
      setUserState(prefs); setOnboardingCompleted(resolved.completed);
      setIsReturningUser(resolved.completed);
      if (prefs) localStorage.setItem(`radar-user-${email}`, JSON.stringify(prefs));
      const previous = localStorage.getItem(`radar-last-login-${email}`);
      setAuthUserState({ name: prefs?.name || name, email, isAuthenticated: true, lastLoginAt: previous || undefined });
      if (resolved.completed) toast.success(`Welcome back, ${prefs?.name || name}!`, { description: previous ? `Last visit: ${new Date(previous).toLocaleString()}` : undefined });
      localStorage.setItem(`radar-last-login-${email}`, new Date().toISOString());
    } catch {
      if (generation.current === request) setProfileError(true);
    } finally {
      if (generation.current === request) setIsProfileLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!active) return;
      if (!session) { clearUser(); return; }
      if (event === 'TOKEN_REFRESHED' && account.current?.id === session.user.id) return;
      if (account.current?.id === session.user.id) return;
      // Do not perform awaited Supabase queries inside its auth callback.
      setIsProfileLoading(true);
      window.setTimeout(() => { if (active) void loadAccount(session.user); }, 0);
    });
    void supabase.auth.getSession().then(({ data, error }) => {
      if (!active) return;
      if (error) { setProfileError(true); setIsProfileLoading(false); return; }
      if (data.session && account.current?.id !== data.session.user.id) void loadAccount(data.session.user);
      else if (!data.session) clearUser();
    });
    return () => { active = false; generation.current += 1; subscription.unsubscribe(); };
  }, [clearUser, loadAccount]);

  const save = useCallback((preferences: UserPreferences | null, completed: boolean) => {
    const sbUser = account.current;
    if (!sbUser) return Promise.reject(new Error('Please sign in again.'));
    const request = generation.current;
    const prefs = preferences ? normalizePreferences(preferences, sbUser.email || '') : null;
    const operation = writeQueue.current.catch(() => {}).then(async () => {
      if (generation.current !== request) throw new Error('Your account changed. Please try again.');
      const { error } = await supabase.from('profiles').upsert({
        id: sbUser.id, email: sbUser.email || null, name: prefs?.name || null,
        preferences: prefs as unknown as Json, onboarding_completed: completed,
      });
      if (error) throw error;
      if (generation.current !== request) return;
      setUserState(prefs); setOnboardingCompleted(completed);
      if (prefs) localStorage.setItem(`radar-user-${sbUser.email}`, JSON.stringify(prefs));
      else { localStorage.removeItem(`radar-user-${sbUser.email}`); localStorage.removeItem('radar-user'); localStorage.removeItem('radar-user-filters'); }
      localStorage.setItem(`watchverse-onboarded-${sbUser.email}`, String(completed));
    });
    writeQueue.current = operation;
    return operation;
  }, []);
  const setUser = useCallback((prefs: UserPreferences) => save(prefs, onboardingCompleted), [save, onboardingCompleted]);
  const markOnboardingComplete = useCallback((prefs: UserPreferences) => save(prefs, true), [save]);
  const resetPreferences = useCallback(() => save(null, false), [save]);
  const retryProfile = useCallback(() => {
    if (account.current) void loadAccount(account.current);
    else void supabase.auth.getSession().then(({ data }) => { if (data.session) void loadAccount(data.session.user); else clearUser(); });
  }, [loadAccount, clearUser]);
  const setAuthUser = useCallback((_auth: AuthUser) => { retryProfile(); }, [retryProfile]);
  return <UserContext.Provider value={{ user, authUser, setUser, setAuthUser, clearUser, resetPreferences,
    markOnboardingComplete, retryProfile, profileError, isOnboarded: !!user, onboardingCompleted,
    isProfileLoading, isAuthenticated: !!authUser?.isAuthenticated, isReturningUser }}>{children}</UserContext.Provider>;
};
export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error('useUser must be used within a UserProvider');
  return context;
};
