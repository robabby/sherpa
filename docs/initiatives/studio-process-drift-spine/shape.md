---
appetite: 1 session
shaped: 2026-06-17
---

# Shape — studio-process-drift-spine

## Appetite

**1 session (budget, not estimate).** Additive work reusing machinery that already exists. The only
genuinely new logic is a pure tree walk (doc → initiative reverse mapping); everything else is
threading props and reusing an existing rose/`AlertTriangle` treatment. If it can't land in one
session, the shape is wrong — stop and reassess (see Kill Criteria).

## Evidence & Success

- **Evidence:** Builder judgment, grounded in the parent initiative's design Open Question 1 and the
  deferred seed #1 of `studio-governance-refocus`. The parent shipped git-aware drift but rendered it
  only on the Docs surface, leaving the governance pane-of-glass blind to doc health.
- **Success metrics:**
  1. `/process` shows a portfolio "N docs possibly stale" stat that matches the count of `state: "stale"`
     doc nodes computed by the existing drift machinery.
  2. An initiative that sources ≥1 stale doc shows an `AlertTriangle` + count on its row and in its
     detail pane; the detail pane lists the stale doc titles + commit counts.
  3. e2e sanity: `buildInitiativeStaleDocsIndex` surfaces the known-stale architecture docs (e.g.
     `docs/architecture/execution-pipeline/index.md`) with nonzero `commitsSinceVerified`.
- **Personas:** engineer (governance operator reviewing portfolio doc health).

## Shaped Solution

Fat-marker: **reverse the existing drift mapping and render it read-only in Process.**

- **studio-core** — a pure `collectStaleDocs(sections)` walker (+ `StaleDoc`/`StaleDocsIndex` types) in
  the client-safe `doc-tree-types.ts`, and a node-only `buildInitiativeStaleDocsIndex(ctx?)` wrapper in
  `doc-tree.ts` that composes `buildInitiativeTargetIndex` + `getDocTree(ctx, { targetIndex })` + the
  walker. The walker yields a distinct stale-doc list (portfolio count) and an initiative → stale-docs
  map. Unit-tested with fixtures, no git.
- **app** — Process page computes the index server-side, serializes the map, passes a count + per-initiative
  map down as props.
- **studio-ui** — portfolio stat in the list header; per-initiative `AlertTriangle` + count on rows and in
  the detail pane, reusing the Docs-surface "possibly stale" rose vocabulary.

## Rabbit Holes

1. **Conflating the two "stale" signals.** The Process view already renders `velocity.momentum === "stale"`
   (initiative *inactivity*) as a momentum dot. The new signal is doc *drift*. **Avoid:** use the
   Docs-surface vocabulary (`AlertTriangle` + rose + the literal phrase "possibly stale"), never the
   momentum dot. Two distinct signals, two distinct affordances.
2. **Map serialization across the server/client boundary.** A JS `Map` does not serialize into a client
   component. **Avoid:** convert to a plain object (`Object.fromEntries`) in the server page before passing
   it down; client reads `Record<string, StaleDoc[]>`.
3. **Circular import in studio-core.** `doc-tree.ts` already imports from `doc-drift.ts`. **Avoid:** put the
   node-only wrapper in `doc-tree.ts` (keeps direction doc-tree → doc-drift), and the pure walker in
   `doc-tree-types.ts`. Do not add a `doc-drift.ts → doc-tree.ts` edge.
4. **Stale `.next` types masking the build.** Bare `tsc` reads cached route types. **Avoid:** if the
   studio-app build errors on old/deleted routes, `rm -rf apps/studio/.next` and rebuild.

## No-Gos

- **No Process-view IA redesign** beyond adding the indicator. Lightweight only.
- **No write actions in the Process view.** Read-only — the only Studio write (mark-verified) stays on the
  Docs surface.
- **No node-only studio-core in client bundles.** Drift is computed server-side; client components import
  only pure types from `@sherpa/studio-core/doc-tree-types`.
- **No new ProvenanceState, banner, or git call.** Reuse the existing `"stale"` state and machinery.

## Kill Criteria

1. **If the studio-core helper + tests exceed half a session,** the reverse mapping is more complex than a
   tree walk — stop and reassess the data model.
2. **If wiring the indicator forces a Process-view IA change** (new tab, new layout, restructured list), stop
   — that violates the inherited no-go and needs its own initiative.
3. **If v2 per-initiative dots land on zero active initiatives in practice,** ship v1 (portfolio stat) alone
   and note v2 as deferred — do not invest further to force the dots to appear.
