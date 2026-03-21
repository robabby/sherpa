---
status: integrated
initiative: studio-research-dashboard
created: 2026-03-21
updated: '2026-03-21'
type: new-plan
risk: evolutionary
targets:
  - packages/studio-core/src/research-files.ts
  - apps/studio/src/app/(studio)/projects/[project]/research/page.tsx
  - apps/studio/src/components/studio/research-dashboard.tsx           # (new file)
  - apps/studio/src/components/studio/research-stream-view.tsx         # (new file)
  - apps/studio/src/components/studio/research-timeline-view.tsx       # (new file)
  - apps/studio/src/components/studio/research-table-view.tsx          # (new file)
  - apps/studio/src/components/studio/research-state-panel.tsx         # (new file)
  - apps/studio/src/components/studio/research-heartbeat-indicator.tsx # (new file)
  - apps/studio/src/components/studio/research-priorities-panel.tsx    # (new file)
  - apps/studio/src/components/studio/research-view-switcher.tsx       # (new file)
dependencies: []
informs:
  - harmonic-research-system
personas:
  - engineer
  - product-manager
spawned-from: null
---

## Summary

Redesign the Studio research page from a flat file listing into an operational research dashboard with three view modes (stream, timeline, table), a live research state panel parsed from `RESEARCH_STATE.md`, heartbeat activity indicators, and a priorities panel from `PRIORITIES.md`. This gives Rob real-time visibility into the 24/7 autonomous research operation — nightly cron streams and adaptive heartbeat cycles.

## State Snapshot

**Research page** (`apps/studio/src/app/(studio)/projects/[project]/research/page.tsx`): 74-line server component. Groups research files by category using `scanResearchFiles()`, renders as flat link lists with title and date. No summaries, no operational state, no heartbeat visibility. Uses `RefreshOnFocus` for auto-refresh on tab focus.

**Data layer** (`packages/studio-core/src/research-files.ts`): `ResearchFile` interface has 5 fields — `title`, `date`, `category`, `slug`, `relativePath`. Does not extract `summary` or `trigger` from frontmatter. `scanResearchFiles()` reads `.sherpa/research/` recursively but skips root-level non-`.md` files and doesn't parse `RESEARCH_STATE.md` or `PRIORITIES.md`.

**Detail page** (`apps/studio/src/app/(studio)/projects/[project]/research/[...slug]/page.tsx`): 57-line catch-all that renders individual research files with `DocRenderer`. Works correctly — not in scope.

**Existing UI components**: `Tabs`, `Badge`, `Card`, `Collapsible` all exist in `apps/studio/src/components/ui/`. Existing `research-library.tsx` and `research-tree.tsx` in `packages/studio-ui/` are for initiative research (`/rr` iterations), not the `.sherpa/research/` operational stream. `research-data-table.tsx` is WavePoint-specific (Saturn cycle data). None are reusable here.

**Research data on disk**: 14 research files across 9 streams (competitive, consulting, content-strategy, heartbeat, job-market, network, pnw-remote, studio-landscape, target-companies), plus `RESEARCH_STATE.md` and `PRIORITIES.md` at the `.sherpa/research/` root.

## Proposed Changes

### Data Layer — `packages/studio-core/src/research-files.ts`

Extend `ResearchFile` to include `summary` and `trigger` fields (both optional strings, extracted from frontmatter). These are already present in research file frontmatter but currently discarded by `parseResearchFile()`.

Add three new functions:

- **`parseResearchState(projectRoot)`** — Reads `RESEARCH_STATE.md`, returns a structured object with: `lastUpdated` (ISO timestamp), `coverageMap` (array of stream entries with last-run date and findings), `danglingThreads` (array with text and severity), `researchQueue` (array with text and completed boolean).
- **`parseResearchPriorities(projectRoot)`** — Reads `PRIORITIES.md`, returns: `narrative` (string from ## The Narrative), `priorities` (ordered array from ## Current Priorities), `focusAreas` (array from ## What Research Should Focus On).
- **`getHeartbeatStatus(projectRoot)`** — Counts today's heartbeat files, computes time since last `RESEARCH_STATE.md` update, returns heartbeat cycle count and activity status.

All parsing wrapped in try/catch (consistent with existing error handling for malformed frontmatter).

### Research Page — `apps/studio/src/app/(studio)/projects/[project]/research/page.tsx`

Rewrite as a server component that calls all four data functions (scan files, parse state, parse priorities, get heartbeat status). Composes the new client components below. Retains `RefreshOnFocus` for auto-refresh.

### Client Components — `apps/studio/src/components/studio/research-*.tsx`

**`research-dashboard.tsx`** — Top-level client component orchestrating the layout. Receives all server-loaded data as props. Renders the heartbeat indicator, priorities panel, state panel, and active view.

**`research-view-switcher.tsx`** — Client component for switching between Stream/Timeline/Table views. Uses `Tabs` from shadcn/ui. Manages view state.

**`research-stream-view.tsx`** — Default view. Groups files by category into `Card` sections. Each card shows: stream name (formatted from slug), file count, most recent date, latest summary. Expands to show all files as links (pointing to `/projects/{project}/research/{category}/{filename}`).

**`research-timeline-view.tsx`** — Reverse-chronological feed of all research files. Each entry shows date, category `Badge`, title, summary. All streams interleaved by date.

**`research-table-view.tsx`** — Dense sortable table with columns: Date, Category, Title, Summary (truncated). Client-side sorting by any column.

**`research-state-panel.tsx`** — Renders parsed `RESEARCH_STATE.md` data. Shows dangling threads with severity coloring (CRITICAL in destructive/red, others in warning/yellow). Shows research queue with checkmarks for completed items and prominent styling for pending. Shows coverage map as a compact table. Shows last-updated timestamp.

**`research-heartbeat-indicator.tsx`** — Compact status bar showing heartbeat activity. Logic: if `lastUpdated` is within 35 minutes → pulsing "Research active" indicator; if within active hours (8am–11pm PT) but not recently updated → "Next heartbeat in ~Xm"; if outside active hours → "Heartbeats resume at 8:00 AM PT". Shows today's heartbeat cycle count and cadence.

**`research-priorities-panel.tsx`** — Compact panel rendering the narrative throughline and ordered priority list from `PRIORITIES.md`.

## Rationale

The research system runs 24/7 — 8 nightly cron streams plus adaptive heartbeat cycles every 30 minutes. The current flat file listing provides no operational visibility: you can't tell if heartbeats are running, what's in the research queue, which threads are dangling, or what today's priorities are. All that information exists in `RESEARCH_STATE.md` and `PRIORITIES.md` but requires opening raw files.

A dashboard that parses these operational files and presents research output in multiple views transforms the research page from a file browser into a control surface for the research operation. This is the same pattern as the process dashboard — server-rendered data with client-side interactivity for view switching and sorting.

New client components (rather than extending `packages/studio-ui/`) because these are tightly coupled to the `.sherpa/research/` directory structure and operational file formats. If they stabilize, they can be extracted to `studio-ui` later.

## Dependencies

None. The research data files and directory structure already exist. The detail page (`[...slug]/page.tsx`) is not modified.

## Review Notes

**Edge cases:**
- `RESEARCH_STATE.md` or `PRIORITIES.md` may not exist in all projects — all parsers return null/empty defaults gracefully.
- Heartbeat time calculations use `Intl.DateTimeFormat` with `America/Los_Angeles` — handles DST automatically, no date libraries.
- Next.js 15/16 requires `await connection()` from `next/server` before `Date.now()` in server components — without it the build fails.
- The `summary` field in research frontmatter uses YAML block scalars (`>`) — `gray-matter` handles these correctly, but parsing is already wrapped in try/catch.
- Projects without `.sherpa/research/` continue to show the existing empty state.

**Design decisions (from research iteration 1):**
- **Refresh:** 5-minute `setInterval` via `router.refresh()` + existing `RefreshOnFocus` on tab regain. No websockets.
- **View state:** URL params (`?view=stream|timeline|table`) matching the process page pattern. Controlled `Tabs` with `router.replace()`.
- **Active hours cutoff:** 11 PM PT exclusive — `hour >= 8 && hour < 23`. 23:00 triggers offline state.
- **No new dependencies.** Data layer composes existing `markdown.ts` utilities (`extractSection`, `parseMarkdownTable`, `extractNumberedItems`). Timezone via native `Intl`. Animation via Tailwind `animate-ping`.

**Trade-offs:**
- Client components live in `apps/studio/src/components/studio/` (app-specific) rather than `packages/studio-ui/` (shared package). This is intentional — the components depend on the specific structure of `.sherpa/research/` and operational files. Extract if the pattern generalizes.
- Heartbeat status is computed at page load (server component), not in real-time. Staleness is handled by 5-minute interval refresh + RefreshOnFocus.

**Effort:** 3 sessions
**Session breakdown:**
- Session 1: Extend `ResearchFile` type, implement `parseResearchState()`, `parseResearchPriorities()`, `getHeartbeatStatus()` in studio-core. Add tests.
- Session 2: Build the research page layout, view switcher, and three view modes (stream, timeline, table).
- Session 3: Build state panel, heartbeat indicator, and priorities panel. Wire everything together, verify with live data.
