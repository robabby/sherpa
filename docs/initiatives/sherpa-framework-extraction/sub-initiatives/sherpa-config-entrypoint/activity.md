---
started: 2026-03-12
worktree: null
---

# Sherpa Config Entrypoint — Activity Log

## 2026-03-12 — Research Iteration 1

- Launched from seed `branches/sherpa-config-entrypoint.md`
- Oriented on parent iterations 1-3, especially iteration-2/vector-2 (config-as-code deep dive) and iteration-3 (createStudio API, catalog registration)
- Dispatched 4 vectors: config-as-code survey, vocabulary system design, theme distribution, config composition
- All 4 vectors completed. Central insight: config is three separate concerns — `defineConfig()` (identity function), `createStudio()` (resolution), `withSherpa()` (build integration)
- Key findings: `defineConfig()` should do nothing (Sanity/Keystatic model); Sanity's per-property reducers superior to Payload's full-config mutation; vocabulary is cosmetic / paths are immutable (Salesforce model); shadcn registry is the theme distribution mechanism; `withSherpa()` is minimal (transpilePackages only)
- Wrote proposal with complete type designs for `SherpaUserConfig`, `VocabularyEntry`, `PathsConfig`, `ThemeConfig`
- 5 open questions seeded for iteration 2
