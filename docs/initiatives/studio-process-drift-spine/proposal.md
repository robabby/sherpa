---
status: pending
initiative: studio-process-drift-spine
created: 2026-06-17
updated: '2026-06-17'
type: new-plan
risk: additive
targets:
  - packages/studio-core/src/doc-tree-types.ts
  - packages/studio-core/src/doc-tree.ts
  - packages/studio-core/src/__tests__/doc-drift.test.ts
  - apps/studio/src/app/(studio)/process/page.tsx
  - packages/studio-ui/src/process-workspace.tsx
  - packages/studio-ui/src/process-detail-pane.tsx
informs:
  - studio-governance-refocus
personas:
  - engineer
spawned-from: studio-governance-refocus
---

# Process-view Stale Indicator — Provenance as the Spine

## Summary

Surface git-aware doc-drift staleness in the Studio **Process** (governance) view, reusing the
drift machinery built in `studio-governance-refocus`. Today drift renders only on the **Docs**
surface; the Process view — the governance core — shows no doc-health signal. This adds a
portfolio-level "N docs possibly stale" stat plus per-initiative indicators, completing the
"provenance as the spine" story. This is the single deferred seed (#1) of the parent initiative.

## State Snapshot

The drift machinery is complete and shipped (parent Phase E, `0c55cae`):

- `packages/studio-core/src/doc-drift.ts` — `buildInitiativeTargetIndex(ctx?)` (slug → that
  initiative's `targets[]`) and `computeDocDrift(provenance, targetIndex, ctx?)` →
  `DocDrift { relatedPaths, commitsSinceVerified, isStale }`. Node-only (runs `git log --since`).
- `packages/studio-core/src/doc-tree-types.ts` — PURE, client-safe. `computeState(provenance, drift?)`
  returns `"stale"` for a maintained doc whose drift `isStale`; defines `DocTreeNode`, `DocTreeSection`,
  `Provenance` (with `sourceInitiatives: string[]`).
- `packages/studio-core/src/doc-tree.ts` — `getDocTree(ctx?, { targetIndex })` folds per-doc drift
  into each node's `state`/`drift`. Node-only.
- The **Docs** surface consumes this: `apps/studio/src/app/(studio)/docs/page.tsx` builds the index
  and calls `getDocTree`, and `packages/studio-ui/src/provenance-header.tsx` renders the rose
  "Possibly stale" banner (`AlertTriangle`, `text-rose-400/80`, `bg-rose-500/[0.04]`).

The **Process** view (`apps/studio/src/app/(studio)/process/page.tsx`, server component) builds
`ProcessNode[]` via `getProcessNodes({...})` and passes them to `ProcessWorkspace`
(`packages/studio-ui/src/process-workspace.tsx`, client). It computes **no** doc-drift today. It
*does* carry a distinct staleness signal — `velocity.momentum === "stale"` (initiative *inactivity*,
a rose momentum dot in `hub-process-panel.tsx`) — which is a different concept and must not be
conflated with doc drift. The reverse mapping (doc → initiative) does not exist yet.

## Proposed Changes

**`packages/studio-core` (the reverse mapping):** add a pure `collectStaleDocs(sections)` walker and
`StaleDoc` / `StaleDocsIndex` types to `doc-tree-types.ts` (client-safe, unit-testable without git),
plus a node-only `buildInitiativeStaleDocsIndex(ctx?)` in `doc-tree.ts` that composes
`buildInitiativeTargetIndex` + `getDocTree(ctx, { targetIndex })` + the walker. The walker collects
every doc node whose `state === "stale"` and indexes it under each of its `source-initiatives`,
yielding both a distinct stale-doc list (portfolio count) and an initiative → stale-docs map.
Placed in `doc-tree.ts`, not `doc-drift.ts`, to keep the dependency direction acyclic. Extend
`__tests__/doc-drift.test.ts` with fixture-based unit tests for the walker.

**`apps/studio` (Process page):** compute the index server-side (git access lives on the server),
serialize the map for the client boundary, and pass a portfolio count + per-initiative map down to
`ProcessWorkspace` as new props.

**`packages/studio-ui` (render, read-only):** a portfolio "N docs possibly stale" stat in the
ProcessWorkspace list-column header; a per-initiative `AlertTriangle` + count on initiative list rows
and in the detail pane (with the stale doc titles + commit counts). All indicators reuse the
Docs-surface "possibly stale" vocabulary (rose + `AlertTriangle`), deliberately distinct from the
momentum dot, so the two staleness signals never read as one.

## Rationale

The parent initiative made `"stale"` reachable and rendered it on the Docs surface, but the Process
view is the governance pane-of-glass — the natural home for a portfolio doc-health signal. Reusing
the existing machinery (no new git calls, no new state, no new banner) keeps this additive and cheap:
the only genuinely new logic is the doc → initiative reverse mapping, which is a pure tree walk.

Alternative considered: surface drift only on Docs (status quo). Rejected — it leaves the governance
core blind to doc health, which is precisely the gap the parent's Open Question 1 flagged.

## Dependencies

**Spawned from** `studio-governance-refocus` (seed #1). **Informs** it (closes its Open Question 1
and the deferred seed). No hard dependencies — the machinery it builds on is already merged to main.

## Review Notes

- **Two "stale" signals.** `velocity.momentum === "stale"` (inactivity) already exists in the Process
  view. The new doc-drift indicator must be visually distinct (Docs-surface `AlertTriangle`/rose
  vocabulary, not the momentum dot). Trade-off accepted: two rose-ish signals coexist, differentiated
  by icon + label.
- **Sparse per-initiative dots.** Stale architecture docs are often sourced from now-declined/integrated
  dispatch initiatives that get filtered from the active Process list, so per-initiative dots may land
  on few *active* initiatives. The portfolio-level count is the reliable signal; per-initiative is
  additive. Revisit in `/shape` whether v2 earns its keep (decision: ship it; the portfolio stat +
  Docs surface carry the signal regardless).
- **Locked no-gos (inherited from parent):** no Process-view IA redesign beyond the indicator;
  read-only (the only Studio write — mark-verified — stays on the Docs surface); drift computed
  server-side only (no node-only studio-core in client bundles — client imports pure types from
  `@sherpa/studio-core/doc-tree-types`).

**Effort:** 1 session
**Session breakdown:**
- Session 1: studio-core reverse-mapping helper + unit tests (TDD); server-side compute in the Process
  page; portfolio stat + per-initiative indicators in studio-ui; verify (check, build, e2e sanity, dev).
