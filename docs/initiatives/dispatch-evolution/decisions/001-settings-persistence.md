---
decision: "Persist active backend selection in .sherpa/settings.json, not sherpa.config.ts or localStorage"
date: 2026-03-19
skill: /design
alternatives-rejected:
  - "sherpa.config.ts — static, git-tracked, defines structure not runtime state"
  - "localStorage — server-side API routes cannot read it without client roundtrip"
  - "SQLite/database — overkill for a single field"
confidence: high
kill-criteria: "If settings grow beyond 5-10 fields, evaluate whether a database or typed config module is warranted"
---

# Settings Persistence: `.sherpa/settings.json`

Active backend selection is runtime state that varies per environment (local machine uses `claude`, VPS uses `openclaw`). It must be:

1. **Server-readable** — the dispatch API route reads it without a client roundtrip
2. **Environment-specific** — not checked into git (`.sherpa/` is gitignored)
3. **Human-editable** — JSON is debuggable when things go wrong
4. **Minimal** — no dependencies, no migrations, no schema versioning

The file is read by `getSettings()` in `studio-core` and written by the `/api/settings` route. Default values come from `DEFAULT_SETTINGS` when the file doesn't exist.
