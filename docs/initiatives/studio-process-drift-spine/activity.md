---
started: 2026-06-17
worktree: .worktrees/studio-process-drift-spine
---

# Activity — studio-process-drift-spine

## 2026-06-17 — Proposed & shaped

- Spawned from `studio-governance-refocus` seed #1 (Process-view drift indicator). Bidirectional trail
  set: parent Seeds → forward link; this proposal `spawned-from` the parent.
- Proposal (additive, 1 session) + light shape: v1 portfolio "N docs possibly stale" stat in the
  ProcessWorkspace list header + v2 per-initiative `AlertTriangle` + count on rows and in the detail pane.
- Worktree branched from `main` (7fc27dd).

## 2026-06-17 — Implemented (1 session)

- **studio-core (TDD):** pure `collectStaleDocs(sections)` walker + `StaleDoc`/`StaleDocsIndex` types in
  `doc-tree-types.ts` (5 new unit tests, fixtures, no git); node-only `buildInitiativeStaleDocsIndex(ctx?)`
  in `doc-tree.ts` composing `buildInitiativeTargetIndex` + `getDocTree({targetIndex})` + the walker.
- **app:** computed the index server-side and passed `staleDocCount` + serialized `staleDocsByInitiative`
  to `ProcessWorkspace` in **both** render sites — the unscoped `(studio)/process/page.tsx` **and** the
  live project-scoped `projects/[project]/process/page.tsx` (middleware redirects `/process` →
  `/projects/<slug>/process`, so the scoped page is what users actually hit). Added
  `buildInitiativeStaleDocsIndex` to the `@/lib/studio` server barrel.
- **studio-ui:** portfolio "N docs possibly stale" stat in the list header; per-initiative
  `AlertTriangle` + count on list rows and a stale-doc list (title + commit count, linked to `/docs`) in
  the detail pane. Reused the Docs-surface rose/`AlertTriangle` vocabulary — kept visually distinct from
  the existing `velocity.momentum` "stale" (an icon, not the momentum text/dot).
- **Verified:** `pnpm --filter '!@sherpa/website' check` green (7/7); studio-core tests 275 pass / 1
  pre-existing `load-json` failure (unrelated); `@sherpa/studio-app` production build green (clean `.next`);
  e2e sanity via `buildInitiativeStaleDocsIndex()` against real git → **8 portfolio stale docs** incl.
  `architecture/execution-pipeline/index.md` (65 commits). In-browser visual deferred — the route is
  Better-Auth-gated with no local dev bypass.
- **Open Question 1 answered:** all stale-sourcing initiatives are `integrated`/`declined` (none active),
  but integrated initiatives are shown in the default Process list (only `archived` is hidden), so the v2
  per-initiative dots **do** render (e.g. `studio-agent-missions` 3, `dispatch-center` 3,
  `studio-production-auth` 4). v2 keeps its value; the portfolio stat carries the signal regardless.
