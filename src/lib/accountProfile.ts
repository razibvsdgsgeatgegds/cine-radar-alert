import type { UserPreferences } from '@/types';

export function normalizePreferences(value: Partial<UserPreferences>, email: string): UserPreferences {
  return {
    name: '', gender: '', age: 0, notifications_enabled: false,
    languages: [], industries: [], platforms: [], notification_list: [],
    ...value,
    email,
    location: { country: value.location?.country || '' },
    interests: { movies: [], series: [], games: [], ...value.interests },
  };
}

export function resolveAccountProfile(profile: { preferences?: unknown; onboarding_completed: boolean } | null, email: string) {
  const preferences = profile?.preferences;
  return {
    user: preferences && typeof preferences === 'object'
      ? normalizePreferences(preferences as Partial<UserPreferences>, email) : null,
    // Preferences are only saved when setup finishes; reset clears them, so saved preferences mean setup is done.
    completed: profile?.onboarding_completed === true || !!(preferences && typeof preferences === 'object'),
  };
}
