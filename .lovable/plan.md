# WatchVerse product refresh

## Goals
- Finish and verify the public upcoming-release calendar and its sign-up/notification flows.
- Give WatchVerse a professional, mobile-first, refined-neon visual refresh across the landing page, dashboard, release calendar, onboarding, and Settings.
- Ensure completed setup is recovered from the signed-in account, not browser cache, and only cleared by the user's explicit Reset Preferences action.
- Add a small set of useful discovery and saved-release improvements without changing the app's movie/TV future-release focus.

## Work
1. Diagnose existing preview/build signals and review the saved profile/auth flow, public release page, and existing watchlist behavior.
2. Fix the release-calendar empty-state copy, input validation, navigation and state handling; verify public movie/series browsing and notification signup.
3. Harden account-profile synchronization: wait for authenticated profile reads before routing, persist completed preferences against the Supabase account, handle sign-out/account changes safely, and preserve the explicit reset flow.
4. Refresh the shared visual language and responsive layouts for the landing page, dashboard, release calendar, onboarding, and Settings; retain system-default light/dark themes and the WatchVerse logo.
5. Improve day-to-day use with clearer search/filtering and an accessible, persistent saved-release workflow, reusing existing account preferences rather than creating redundant storage.
6. Verify build/runtime signals and the central public and authenticated flows; update the marketing checklist for completed public-calendar work.

## Technical details
- Keep the existing React/Vite, React Router, shadcn, Tailwind-token, Supabase, and TMDB patterns; avoid adding a new server or unnecessary dependencies.
- Use the existing `profiles` table and its authenticated-user RLS for cross-device onboarding/preferences. Browser storage is a cache only, not the source of truth.
- Preserve existing future-only movie/TV release rules, Google OAuth, notification permissions, and theme behavior.
- Any Supabase schema/policy change must follow the project's grants and RLS requirements.
- Verify externally configured credentials, email delivery, and hosted Supabase settings only when available; do not claim these are working without an end-to-end check.
