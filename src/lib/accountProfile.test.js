import { test, expect } from 'bun:test';
import { resolveAccountProfile } from './accountProfile';

test('completed account stays completed without any browser cache', () => {
  expect(resolveAccountProfile({ onboarding_completed: true, preferences: { name: 'Returning user' } }, 'returning@example.test').completed).toBe(true);
});
test('incomplete signup must complete setup on next login', () => {
  expect(resolveAccountProfile({ onboarding_completed: false, preferences: { name: 'New user' } }, 'new@example.test').completed).toBe(false);
});
test('explicit reset clears completed setup', () => {
  expect(resolveAccountProfile({ onboarding_completed: false, preferences: null }, 'returning@example.test')).toEqual({ user: null, completed: false });
});
test('account switch never inherits another account email', () => {
  expect(resolveAccountProfile({ onboarding_completed: true, preferences: { email: 'old@example.test' } }, 'current@example.test').user?.email).toBe('current@example.test');
});
