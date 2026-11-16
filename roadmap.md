# WatchVerse roadmap

- [x] Make the home page more engaging with a real upcoming-title spotlight, movie/series browsing, and restrained cinematic motion; verified story details, signup navigation, and mobile/desktop layout without runtime errors.

- [x] Refresh home, calendar, dashboard, onboarding, and Settings with refined-neon tokens and mobile-safe controls.
- [x] Resolve account setup from server profiles; save preferences and completion together; preserve explicit reset and show retry instead of setup on account-load errors. Four account-rule tests passed.
- [x] Add a date-sorted saved-release view, accessible save controls, debounced search, and calendar title filtering.
- [x] Verify public movie/series navigation, poster rendering, empty states, signup navigation, mobile overflow, and dark-theme selection; preview builds clean.
- [x] Update the marketing checklist for completed home fixes and public-calendar browsing.
- [ ] Verify returning-user login, setup recovery after cache clearing, Settings saves, and reset against a real account. Blocker: external Supabase has no managed browser session available.
- [ ] Verify notification signup persistence and email delivery. Blocker: external Supabase subscriber readback is restricted and no working email delivery setup is available; calendar now describes the actual release-news signup rather than promising per-title delivery.
- [ ] Remove the existing browser-exposed TMDB key through a secured Edge Function. Blocker: TMDB server secret is not configured; rotate the previously exposed key before production launch.
