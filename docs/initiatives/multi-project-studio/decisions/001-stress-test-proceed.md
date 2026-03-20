---
decision: "Proceed after stress-test — 5/8 assumptions confirmed, 1 refuted (content module approach), 2 human-required"
date: 2026-03-20
skill: /stress-test
alternatives-rejected:
  - "Refuted A1: optional projectSlug parameter — replaced with ProjectContext object pattern"
  - "Caveat A2: JSON-only config — retained sherpa.config.ts as escape hatch for plugins"
confidence: high
kill-criteria: "Re-test if remote project access (non-local filesystem) becomes a requirement"
---

## Summary

Stress-tested 12 assumptions, executed 8 falsification tests. One assumption refuted (A1: content module multi-root approach), leading to a design revision from optional `projectSlug` parameters to an explicit `ProjectContext` object. All other load-bearing assumptions confirmed. Effort estimate revised from 4-6 to 5-7 sessions.

## Key Outcomes

- **A1 (refuted):** Content module has ~48 functions, 3 globals, and a race condition risk. Plan session 2 redesigned as two phases: refactor globals → add multi-project.
- **A2 (confirmed with caveat):** `sherpa.json` works for current config, but `plugins` field requires TS. Dual-format approach validated.
- **A3 (confirmed):** SQLite per-project isolation trivially achievable.
- **A4 (confirmed):** Next.js routing architecture sound, no conflicts.
