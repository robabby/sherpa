---
designed: 2026-03-21
type: both
components-new: 8
components-modified: 1
files-planned: 12
---

## Overview

Architecture and UI design for the Studio Research Dashboard — transforming the research page from a flat file listing into an operational dashboard with three view modes, research state visibility, heartbeat indicators, and a priorities panel.

Source: [proposal.md](./proposal.md) | Research: [research/](./research/)

## Architecture

### Data Models

All types added to `packages/studio-core/src/research-files.ts` alongside the existing `ResearchFile` interface.

```typescript
// Extend existing — add optional summary + trigger
interface ResearchFile {
  title: string
  date: string
  category: string
  slug: string
  relativePath: string
  summary?: string     // new
  trigger?: string     // new
}

// New types for RESEARCH_STATE.md
interface CoverageEntry {
  stream: string
  lastRun: string
  findings: string
}

interface DanglingThread {
  text: string
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | null
}

interface QueueItem {
  text: string
  completed: boolean
}

interface ResearchState {
  lastUpdated: string | null
  coverageMap: CoverageEntry[]
  danglingThreads: DanglingThread[]
  researchQueue: QueueItem[]
}

// New types for PRIORITIES.md
interface ResearchPriorities {
  narrative: string | null
  priorities: string[]
  focusAreas: string[]
}

// New types for heartbeat status
type HeartbeatState = "active" | "pending" | "offline"

interface HeartbeatStatus {
  status: HeartbeatState
  minutesUntilNext: number | null
  heartbeatCountToday: number
  lastUpdated: string | null
  message: string
}
```

**Serialization note:** All types use plain strings, arrays, and objects — no `Date` objects, no functions. Safe for server-to-client prop passing without serialization issues (per `server-serialization` rule).

### Component Tree

```
page.tsx (async RSC)
  ├── RefreshOnFocus (existing, "use client", null render)
  ├── AutoRefreshInterval (new, "use client", null render, 5min setInterval)
  ├── <h1>Research</h1>
  └── <Suspense>
      └── ResearchDashboard ("use client")
          ├── ResearchHeartbeatIndicator
          │     props: HeartbeatStatus
          │     renders: pulsing dot + status text + cycle count
          │
          ├── <div grid lg:2-col>
          │   ├── ResearchPrioritiesPanel
          │   │     props: ResearchPriorities
          │   │     renders: Card with narrative + ordered list
          │   │
          │   └── ResearchStatePanel
          │         props: ResearchState
          │         renders: 3 Cards (threads, queue, coverage)
          │
          └── <Tabs> (shadcn, controlled, URL-synced)
              ├── TabsList
              │   ├── TabsTrigger "Streams" (default)
              │   ├── TabsTrigger "Timeline"
              │   └── TabsTrigger "Table"
              │
              ├── TabsContent "stream"
              │   └── ResearchStreamView
              │         props: grouped Record<string, ResearchFile[]>, projectSlug
              │         renders: Collapsible per category
              │
              ├── TabsContent "timeline"
              │   └── ResearchTimelineView
              │         props: files ResearchFile[], projectSlug
              │         renders: reverse-chrono feed with badges
              │
              └── TabsContent "table"
                  └── ResearchTableView
                        props: files ResearchFile[], projectSlug
                        renders: sortable table
```

### Data Flow

```
1. Request hits page.tsx (RSC)
2. await connection() — opts into dynamic rendering
3. Load all data synchronously (fs reads, no async needed):
   - scanResearchFiles(project.root) → ResearchFile[]
   - parseResearchState(project.root) → ResearchState | null
   - parseResearchPriorities(project.root) → ResearchPriorities | null
   - countTodayHeartbeats(project.root, todayDate) → number
4. Compute heartbeat status (pure function, takes `now` param):
   - getHeartbeatStatus(state?.lastUpdated, heartbeatCount, now) → HeartbeatStatus
5. Group files by category (server-side, reduces client work):
   - Record<string, ResearchFile[]>
6. Serialize all data as props to ResearchDashboard
7. Client: Tabs read ?view from URL, switch views without server round-trip
8. Client: router.replace() updates URL on tab switch (shallow, no scroll)
9. Auto-refresh: setInterval(router.refresh, 300_000) re-runs RSC every 5 min
10. Tab-focus refresh: RefreshOnFocus re-runs RSC on visibility change
```

**Why `connection()` not `force-dynamic`:** `connection()` is more precise — it opts this specific render into dynamic mode without affecting sibling routes. The research page is the only page that needs `Date.now()` at render time.

### Integration Points

| Existing code | How it's touched | Risk |
|---|---|---|
| `packages/studio-core/src/research-files.ts` | Add 2 fields to `ResearchFile`, add 5 new exports | Low — additive, existing function signatures unchanged |
| `packages/studio-core/src/markdown.ts` | Import `extractSection`, `parseMarkdownTable`, `extractNumberedItems` | None — read-only, functions already exist and are exported |
| `packages/studio-core/src/index.ts` | Already re-exports `research-files.ts` via `export *` | None — new exports auto-surface |
| `apps/studio/src/lib/studio/index.ts` | Already re-exports `@sherpa/studio-core` via `export *` | None — new exports auto-surface |
| `apps/studio/src/app/.../research/page.tsx` | Full rewrite | Contained — only this page changes |
| `apps/studio/src/app/.../research/[...slug]/page.tsx` | Untouched | None |

## UI Design

### Layout

The page has three vertical zones:

**Zone 1: Heartbeat bar** (full-width, compact)
- Follows the `hub-operational-pulse` pattern — a `rounded-md bg-muted/30` strip with mono text segments separated by `·` dots
- Pulsing dot (green/amber/zinc) + status message + cycle count + cadence

**Zone 2: Operational panels** (2-column grid on lg:, stacked on mobile)
- Left: Priorities panel (Card) — narrative italic text + numbered priorities
- Right: State panel (stacked Cards) — dangling threads, queue, coverage map
- Both collapse to single column on mobile

**Zone 3: View tabs** (full-width, below panels)
- shadcn Tabs with 3 triggers
- Content area below switches between stream/timeline/table

### Component Selection

| Need | Component | Rationale |
|---|---|---|
| View switching | `Tabs` / `TabsList` / `TabsTrigger` / `TabsContent` | Standard shadcn navigation pattern, URL-syncable |
| Stream categories | `Collapsible` / `CollapsibleTrigger` / `CollapsibleContent` | Existing pattern in `research-library.tsx` |
| Panels | `Card` / `CardHeader` / `CardTitle` / `CardContent` | Full Card composition per shadcn rules |
| Category labels | `Badge variant="outline"` | Timeline and table category indicators |
| Severity labels | `Badge variant="destructive"` (CRITICAL) / `Badge variant="secondary"` (others) | Dangling threads |
| File count | `Badge variant="secondary"` | Stream view header |
| Status dot | Custom (2-layer `animate-ping` pattern) | No shadcn component for this; follows Tailwind docs pattern |
| Heartbeat bar | Custom `div` with mono segments | Follows `hub-operational-pulse` pattern exactly |

### Interaction Patterns

1. **Tab switching:** Click tab → URL updates to `?view=X` via `router.replace()` → no server round-trip, no scroll. Radix Tabs mount all content simultaneously, hidden via `display:none`.

2. **Stream expand/collapse:** Click stream header → Collapsible toggles → chevron rotates via `group-data-[state=open]:rotate-90`. Default: expanded if ≤5 files, collapsed if >5.

3. **Table sorting:** Click column header → client-side sort toggles direction → arrow indicator updates. Default: date descending.

4. **File navigation:** Click any research file title → navigates to `/projects/{slug}/research/{category}/{filename}` (existing `[...slug]` route handles rendering).

5. **Auto-refresh:** Every 5 minutes, `router.refresh()` re-runs the RSC without page reload. On tab regain, immediate refresh. Both are invisible — no loading indicators.

## File Plan

### `packages/studio-core/`

| File | Action | Purpose |
|---|---|---|
| `src/research-files.ts` | Modify | Add `summary`/`trigger` to `ResearchFile`, add `parseResearchState`, `parseResearchPriorities`, `getHeartbeatStatus`, `countTodayHeartbeats` |
| `src/__tests__/research-files.test.ts` | Modify | Tests for all new functions |

### `apps/studio/src/components/`

| File | Action | Purpose |
|---|---|---|
| `auto-refresh-interval.tsx` | Create | Zero-render client component, `setInterval` → `router.refresh()` |

### `apps/studio/src/components/studio/`

| File | Action | Purpose |
|---|---|---|
| `research-heartbeat-indicator.tsx` | Create | Pulsing status dot + text, 3 states |
| `research-priorities-panel.tsx` | Create | Card with narrative + priority list |
| `research-state-panel.tsx` | Create | Cards for threads, queue, coverage |
| `research-stream-view.tsx` | Create | Collapsible category groups |
| `research-timeline-view.tsx` | Create | Reverse-chrono feed |
| `research-table-view.tsx` | Create | Sortable 4-column table |
| `research-dashboard.tsx` | Create | Top-level client orchestrator with Tabs |

### `apps/studio/src/app/(studio)/projects/[project]/research/`

| File | Action | Purpose |
|---|---|---|
| `page.tsx` | Rewrite | Server component that loads all data, wraps dashboard in Suspense |

## Decisions

### D1: Pure heartbeat function with injected `now`

**Decision:** `getHeartbeatStatus` takes `now: Date` as a parameter instead of calling `Date.now()` internally.

**Why:** Testability — tests can inject specific timestamps without mocking globals. The `connection()` call stays in the page component where Next.js requires it, keeping the utility pure and framework-agnostic.

**Alternatives rejected:**
- Calling `Date.now()` inside the utility — requires `connection()` awareness in studio-core, which is a framework concern leaking into a domain library.

### D2: No TanStack Table for the table view

**Decision:** Simple `useState` sort with a plain `<table>` instead of adding `@tanstack/react-table`.

**Why:** The table has 4 columns and <100 rows. TanStack adds ~15KB gzipped for features we don't need (pagination, filtering, column visibility, row selection). The existing `research-data-table.tsx` (WavePoint) uses the same simple pattern.

**Alternatives rejected:**
- shadcn DataTable + TanStack — overkill for this data volume, adds a dependency.

### D3: Components in `apps/studio/` not `packages/studio-ui/`

**Decision:** All new components go in `apps/studio/src/components/studio/`, not in the shared `packages/studio-ui/` package.

**Why:** These components are tightly coupled to the `.sherpa/research/` directory structure and operational file formats. They import `@sherpa/studio-core` types but are not reusable outside the Studio app. If the pattern stabilizes and other consumers need them, extract then.

**Alternatives rejected:**
- `packages/studio-ui/` — would require the package to know about `.sherpa/research/` file formats, which is an app concern not a library concern.

### D4: URL-persisted view state

**Decision:** Active tab stored in `?view=stream|timeline|table` URL param via `useSearchParams` + `router.replace()`.

**Why:** Matches the existing process page pattern. Enables shareable links to specific views. `router.replace()` with `{ scroll: false }` prevents server round-trip — view switching is purely client-side.

**Alternatives rejected:**
- `useState` only — simpler but loses view on navigation and can't be shared.
- `nuqs` — adds a dependency when the project already has a working `searchParams` pattern.

## Open Questions

1. **State panel layout on large screens:** Should priorities and state be side-by-side (2-col grid) or vertically stacked? The prototype shows 2-col. If the state panel content is too long, stacked may be better.

2. **Empty states per panel:** When `RESEARCH_STATE.md` exists but a section (e.g., Dangling Threads) is empty, should we show an empty card or hide it? Current design hides empty sections entirely.

3. **Stream ordering:** Should streams be alphabetical (current design) or ordered by recency (most recently updated stream first)? Alphabetical is predictable; recency highlights active streams.
