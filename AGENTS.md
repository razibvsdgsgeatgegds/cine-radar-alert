# Architecture rules

- Resolve authentication and account preferences in UserProvider; server profiles are authoritative and browser storage is cache only, so clearing cache cannot reset completed setup.
- Save preferences and onboarding completion together and serialize account updates; separate upserts can overwrite each other or lose changes.
- Use semantic global theme tokens and shared shadcn controls across all screens, so light and dark modes remain consistent.
- Home-page release previews reuse the existing public discovery service and guard against stale results; no fabricated titles or release dates are displayed.
- AI picks run only in an authenticated Edge Function using saved taste data, never personal contact data; AI output must match future-only supplied candidates, preventing invented titles.
- Streaming actions use official provider homepages or trusted TMDB title watch links; a provider homepage is not a promise that a future title is already available.
- Dashboard and public title searches share the TMDB search service, scan multiple relevance pages, and enforce future-only dates locally because search endpoints ignore discovery filters.