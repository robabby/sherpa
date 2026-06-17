---
decision: "Git-aware drift reuses the existing 'stale' ProvenanceState rather than introducing a new state"
date: 2026-06-17
skill: /design
alternatives-rejected:
  - "Add a 'stale-by-drift' ProvenanceState (suggested during exploration) — rejected: duplicates a state that already exists, is typed, styled (rose/AlertTriangle), and rendered by provenance-header.tsx; would force every consumer and the LED color maps to handle a fourth+1 case"
  - "Keep date-based staleness (staleness.ts) as the drift signal — rejected: date elapsed since last-verified says nothing about whether the underlying code actually changed; the convention specifically means 'commits to related code since verified'"
confidence: high
kill-criteria: "If a doc legitimately needs to show BOTH 'awaiting human review' and 'code drifted' simultaneously and one state can't express it, revisit a composite state"
---

`computeState()` (studio-core/doc-tree-types.ts:142) currently branches only on `maintainedBy`/`reviewedBy` and **never returns `"stale"`** — the state is defined and rendered but unreachable. Git-aware drift simply makes it reachable: a maintained (non-human-owned) doc whose related code received commits since `last-verified` resolves to `"stale"`. No new state, no new banner, no consumer churn — `provenance-header.tsx` already renders the rose "Possibly stale" treatment. Drift detail (the commit count) rides alongside as `DocDrift`, not as a new enum member.
