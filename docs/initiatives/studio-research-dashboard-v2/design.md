---
designed: 2026-03-21
type: both
components-new: 2
components-modified: 8
files-planned: 10
---

## Overview

Visual redesign of the research dashboard to apply the Sherpa warm spatial glass design language, plus functional enhancements (search/filter, inline markdown, coverage staleness). Pure presentation layer — no data model or API changes.

Source: [proposal.md](./proposal.md) | Prototype: [prototype.html](./prototype.html)

## Architecture

### Data Flow Changes

The V1 data flow is unchanged. Two additions pass through existing prop channels:

```
page.tsx (RSC)
  │
  ├── existing: files, grouped, state, priorities, heartbeat, projectSlug
  │
  ├── NEW: nowISO = now.toISOString()  ← for staleness computation
  │        (serializable string, computed after connection())
  │
  └── ResearchDashboard
        │
        ├── NEW: filter state management
        │   query: string (from ?q= URL param)
        │   categories: string[] (from ?categories= URL param)
        │   filteredFiles: computed from files + query + categories
        │   filteredGrouped: computed from filteredFiles
        │
        ├── passes filteredFiles to TimelineView, TableView
        ├── passes filteredGrouped to StreamView
        └── passes nowISO to StatePanel (for staleness)
```

### Filter State

Managed in `ResearchDashboard` alongside existing view state. Uses the same `useSearchParams` + `router.replace()` pattern already in use for `?view=`.

```typescript
// URL shape: ?view=stream&q=competitive&categories=job-market,consulting
// All params optional, defaults: view=stream, q="", categories=all

// Filter logic (client-side, no server round-trip):
const filteredFiles = useMemo(() => {
  let result = files
  if (query) {
    const q = query.toLowerCase()
    result = result.filter(f =>
      f.title.toLowerCase().includes(q) ||
      f.summary?.toLowerCase().includes(q) ||
      f.category.toLowerCase().includes(q)
    )
  }
  if (selectedCategories.length > 0) {
    result = result.filter(f => selectedCategories.includes(f.category))
  }
  return result
}, [files, query, selectedCategories])
```

No debounce needed — `useDeferredValue` wraps the query to prevent re-render stutter on fast typing. This is the React 19 pattern (already available in the project's React version).

### Staleness Computation

Computed client-side in `ResearchStatePanel` from `nowISO` prop + `coverageMap[].lastRun` dates:

```typescript
function getStaleness(lastRun: string, nowISO: string): "fresh" | "aging" | "stale" {
  const lastMs = new Date(lastRun).getTime()
  const nowMs = new Date(nowISO).getTime()
  const daysSince = (nowMs - lastMs) / (1000 * 60 * 60 * 24)
  if (daysSince <= 2) return "fresh"    // green
  if (daysSince <= 7) return "aging"    // amber
  return "stale"                         // red
}
```

Color mapping uses existing semantic tokens:
- `fresh`: `text-emerald-500`
- `aging`: `text-amber-400` (matches pending heartbeat)
- `stale`: `text-destructive`

### Inline Markdown Utility

New file: `apps/studio/src/lib/render-inline-markdown.tsx`

Transforms inline markdown patterns to React elements. Four patterns only:

| Pattern | Output |
|---------|--------|
| `**bold**` | `<strong>` |
| `*italic*` | `<em>` |
| `` `code` `` | `<code className="...">` |
| `[text](url)` | `<a href="..." className="...">` |

Implementation: single regex pass with `String.prototype.split()` and alternation pattern. Returns `ReactNode[]`. Malformed patterns render as plain text (the regex simply doesn't match).

Used by: `ResearchStreamView` (latest summary), `ResearchTimelineView` (summary), `ResearchTableView` (summary column).

### Component Tree

```
page.tsx (async RSC)
  ├── RefreshOnFocus (existing)
  ├── AutoRefreshInterval (existing)
  ├── <h1> (upgraded: font-display, warm gradient)
  └── <Suspense>
      └── ResearchDashboard ("use client")
          │   props: + nowISO: string
          │   state: + query, selectedCategories (URL-synced)
          │
          ├── ResearchHeartbeatIndicator
          │     VISUAL: glass surface, gold LED glow, led-active animation
          │
          ├── Collapsible (operations)
          │   │ VISUAL: glass trigger, gold chevron, warm-charcoal hover
          │   │
          │   └── <div grid lg:2-col>
          │       ├── ResearchPrioritiesPanel
          │       │     VISUAL: glass card, gold accent bar, rail-node numbers
          │       │     VISUAL: narrative in font-display italic gold-muted
          │       │
          │       └── ResearchStatePanel
          │             props: + nowISO: string
          │             VISUAL: glass cards, copper accent bars
          │             NEW: staleness indicators on coverage map rows
          │             NEW: completion progress bar on queue card
          │
          ├── ResearchFilterBar (NEW)
          │     props: query, categories, allCategories, onChange handlers
          │     VISUAL: glass surface, gold focus ring, category checkboxes
          │
          └── Tabs (gold active underline)
              ├── ResearchStreamView
              │     props: filteredGrouped (was: grouped)
              │     VISUAL: glass cards, category accent gradients, rail spine
              │     NEW: inline markdown in summaries
              │
              ├── ResearchTimelineView
              │     props: filteredFiles (was: files)
              │     VISUAL: copper timeline spine, gold dots, staggered reveal
              │     NEW: inline markdown in summaries
              │
              └── ResearchTableView
                    props: filteredFiles (was: files)
                    VISUAL: glass table, warm headers, hover transitions
                    NEW: inline markdown in summaries
```

### Integration Points

| Existing code | Change | Risk |
|---|---|---|
| `page.tsx` | Add `nowISO` prop computation (1 line) | None — additive |
| `research-dashboard.tsx` | Add filter state, pass filtered data to views | Low — existing prop flow unchanged |
| `research-state-panel.tsx` | Accept `nowISO` prop, compute staleness per row | Low — additive |
| `research-stream-view.tsx` | Prop renamed `grouped` → no change needed, filter applied upstream | None |
| `research-timeline-view.tsx` | Uses `files` prop — filter applied upstream | None |
| `research-table-view.tsx` | Uses `files` prop — filter applied upstream | None |
| `globals.css` | No changes — all needed tokens already defined | None |
| `packages/studio-core/` | **Untouched** | None |

## UI Design

### Visual Direction

**Aesthetic:** Warm spatial glass — the research dashboard as a control surface. Dark obsidian background with gold/copper instrumentation. The feeling is a high-end audio console or observatory control room — dense with information but warm, not clinical.

**Key patterns applied from existing components:**
- **Glass surfaces** from hub-panel: `bg-[var(--glass-bg)]`, `border-[var(--glass-border)]`, `shadow-[var(--glass-shadow)]`
- **Accent bars** from hub-panel: 2px left-edge gradients (gold for primary, copper for secondary)
- **Pulse-glow** from initiative-lifecycle: `animate-[pulse-glow_2s_ease-in-out_infinite]` on active heartbeat
- **Rail-node spine** from globals.css: vertical connector lines between sequential items
- **Panel-glow backdrop** from hub-panel: blurred radial glow behind cards
- **Led-active** from globals.css: subtle opacity pulse on status text

### Layout

Three zones with clear visual hierarchy:

**Zone 1 — Heartbeat (compact, full-width)**
Glass strip with gold LED. Information segments separated by copper dots. The "is it alive?" answer at a glance.

**Zone 2 — Operations (collapsible, 2-col on lg:)**
Glass cards with accent bars. Collapsed by default. The operational intelligence — priorities, threads, queue, coverage.

**Zone 3 — Filter + Views (full-width, primary content)**
Filter bar as a glass strip above tabs. Tabs with gold active indicator. View content below — the research corpus.

### Component Patterns

**Glass Card (base pattern):**
```
bg-[var(--glass-bg)]
border border-[var(--glass-border)]
shadow-[var(--glass-shadow)]
rounded-lg
```

**Glass Card with Accent Bar:**
```
<div class="relative">
  <div class="absolute left-0 top-3 bottom-3 w-[2px]
    bg-gradient-to-b from-[var(--color-gold)]/50 to-transparent" />
  <div class="glass-card pl-5">...</div>
</div>
```

**Gold Active Tab:**
```
data-[state=active]:border-b-2
data-[state=active]:border-[var(--color-gold)]
data-[state=active]:text-[var(--color-gold)]
```

**Staleness Dot:**
```
<span class="size-2 rounded-full {color}" />
fresh: bg-emerald-500
aging: bg-amber-400
stale: bg-red-500 animate-pulse
```

### Interaction Patterns

1. **Search:** Type in filter bar → `useDeferredValue` defers re-render → views update smoothly. Gold focus ring on input. Clear button appears when query is non-empty.

2. **Category filter:** Checkbox list of available categories. Selecting none = show all. Selected categories persist to URL. Each checkbox label shows file count for that category.

3. **Staggered reveal:** On initial page load, cards animate in with `panel-glow-in` at staggered `animation-delay` (50ms increments). Subsequent renders (auto-refresh) skip animation.

4. **Timeline hover:** Entry expands slightly with `surface-hover` background + `surface-hover-border`. Gold dot on the spine grows from 6px to 8px.

5. **Table row hover:** Row gains `surface-hover` background, title text warms to `color-gold`. Smooth 150ms transition.

## File Plan

### `apps/studio/src/lib/`

| File | Action | Purpose |
|---|---|---|
| `render-inline-markdown.tsx` | Create | Regex-based inline markdown → ReactNode utility |

### `apps/studio/src/components/studio/`

| File | Action | Purpose |
|---|---|---|
| `research-filter-bar.tsx` | Create | Search input + category checkboxes, glass surface |
| `research-dashboard.tsx` | Modify | Add filter state, pass nowISO and filtered data |
| `research-heartbeat-indicator.tsx` | Modify | Glass surface, gold LED glow, led-active text |
| `research-state-panel.tsx` | Modify | Glass cards, accent bars, staleness indicators, completion bar |
| `research-priorities-panel.tsx` | Modify | Glass card, gold accent, rail-node numbers, display italic |
| `research-stream-view.tsx` | Modify | Glass cards, category accents, rail spine, inline markdown |
| `research-timeline-view.tsx` | Modify | Copper spine, gold dots, staggered reveal, inline markdown |
| `research-table-view.tsx` | Modify | Glass table, warm headers, hover transitions, inline markdown |

### `apps/studio/src/app/(studio)/projects/[project]/research/`

| File | Action | Purpose |
|---|---|---|
| `page.tsx` | Modify | Add `nowISO` prop (1 line) |

## Decisions

### D1: Filter state in dashboard, not a separate provider

**Decision:** Filter state (query + categories) lives in `ResearchDashboard` as `useState` + URL sync, not in a React context provider.

**Why:** Only one consumer (the dashboard). A context provider adds indirection for no benefit. The dashboard already manages view state the same way. If filter state needs to be shared with other components later (e.g., a sidebar filter panel), extract to context then.

### D2: `useDeferredValue` for search, not debounce

**Decision:** Wrap the filter query in `useDeferredValue` instead of a `setTimeout` debounce.

**Why:** `useDeferredValue` is the React 19 idiomatic pattern — it lets React deprioritize the re-render rather than delaying the state update. The input stays responsive while the view re-renders at lower priority. No timer management, no stale closure issues.

### D3: Inline markdown via regex, not remark

**Decision:** Build a small regex-based inline renderer (~30 lines) instead of adding `remark`/`rehype`.

**Why:** Summaries are 1-2 lines with 4 formatting patterns (bold, italic, code, link). A full AST parser adds ~30KB for features unused here. The existing `packages/studio-core/src/markdown.ts` already uses regex-based extraction — this follows the same philosophy. If summary complexity grows (tables, nested lists), switch to remark.

### D4: Staleness computed client-side from `nowISO` prop

**Decision:** Pass `now.toISOString()` as a serializable prop. Compute staleness per coverage entry in `ResearchStatePanel`.

**Why:** The RSC already has `now` from `connection()`. Passing it as a string avoids `Date` serialization issues. Client-side computation means staleness updates on every 5-minute refresh without data layer changes.

### D5: No new shadcn components needed

**Decision:** Use only already-installed components: Card, Badge, Tabs, Collapsible, Input. The filter bar uses the existing `Input` component with custom glass styling via `className`.

**Why:** The project already has all needed components installed. Adding new ones (e.g., `Popover` for a dropdown category filter) adds complexity without benefit at 9 categories. If category count exceeds ~15, revisit with a `Select` multi-select.

## Open Questions

1. **Filter bar position:** Above tabs (current design) or inside the tab content area? Above tabs means the filter applies across all views uniformly. Inside means each view could have view-specific filters. Recommend above — simpler, consistent behavior.

2. **Empty filter results:** Show "No results for '{query}'" in the current view mode, or switch to a unified empty state? Recommend per-view empty state — it preserves the user's view context.

3. **Staggered reveal on refresh:** Should the 5-minute auto-refresh re-trigger entry animations? Recommend no — only animate on initial page load. Refreshes should feel invisible, not disruptive.
