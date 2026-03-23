---
status: integrated
initiative: studio-research-dashboard-v2
created: 2026-03-21
updated: '2026-03-21'
type: new-plan
risk: evolutionary
targets:
  - apps/studio/src/app/(studio)/projects/[project]/research/page.tsx
  - apps/studio/src/components/studio/research-dashboard.tsx
  - apps/studio/src/components/studio/research-heartbeat-indicator.tsx
  - apps/studio/src/components/studio/research-state-panel.tsx
  - apps/studio/src/components/studio/research-priorities-panel.tsx
  - apps/studio/src/components/studio/research-stream-view.tsx
  - apps/studio/src/components/studio/research-timeline-view.tsx
  - apps/studio/src/components/studio/research-table-view.tsx
  - apps/studio/src/components/studio/research-filter-bar.tsx       # (new file)
dependencies: []
informs:
  - harmonic-research-system
personas:
  - engineer
  - product-manager
spawned-from: studio-research-dashboard
---

## Summary

Apply the Sherpa warm spatial glass design language to the research dashboard and add functional enhancements (search/filter controls, inline markdown rendering, coverage staleness indicators). The V1 validated the data architecture and component structure — this initiative transforms the visual presentation from shadcn defaults into the distinctive control-surface aesthetic used across the rest of Studio (hub panels, initiative lifecycle, mission timeline).

## State Snapshot

**Research dashboard** (8 components across `apps/studio/src/components/studio/research-*.tsx`): Fully functional with three view modes (stream, timeline, table), heartbeat indicator, collapsible operations panel (priorities + state), and auto-refresh. All components use default shadcn styling — `bg-card/30`, `border-border/50`, `text-muted-foreground` — without the design tokens defined in `globals.css`.

**Design tokens available but unused by research components:** The theme (`apps/studio/src/styles/globals.css`) defines a complete warm spatial glass system — `--color-gold`, `--color-copper`, `--color-bronze`, `--glass-bg`, `--glass-border`, `--glass-shadow`, `--surface-primary`, `--glow-gold`, `--glow-copper`, `--border-gold`, `--border-copper`, plus keyframe animations (`pulse-glow`, `led-pulse`, `panel-glow-in`, `node-pulse`). None are referenced by research dashboard components.

**Components already using the design language** (reference implementations): `hub-panel.tsx` (variant-based accent bars + glow backdrops), `hub-card.tsx` (gold diamond accents, hover elevation), `initiative-lifecycle-bar.tsx` (pulse-glow on active step, gold/copper progress dots), `mission-timeline.tsx` (color-coded event dots with glow), `activity-entry.tsx` (classification-based timeline spine), `process-dashboard.tsx` (gold numeric stats, subtle card borders). These establish the patterns to apply.

**Functional gaps from V1 seeds:**
1. No search or category filter controls — 20+ files with no way to narrow the view
2. Summary text shows raw markdown (`**bold**`, `[links](url)`) — no inline rendering
3. Coverage map shows last-run dates as plain text — no visual staleness indicators (amber >2 days, red >7)

**Data layer** (`packages/studio-core/src/research-files.ts`): 5 exported functions, `ResearchFile` type with 7 fields. Stable — no changes needed for this initiative.

## Proposed Changes

### Page Layout — `page.tsx`

Replace the plain `h1` + container with the Sherpa page chrome pattern: atmosphere mesh backdrop, display-font heading with warm gradient accent, and tighter max-width for information density. Add the new `ResearchFilterBar` to the prop flow.

### Dashboard Orchestrator — `research-dashboard.tsx`

Restructure from vertical `flex-col gap-6` to a purposeful layout with three zones:

**Zone 1 — Heartbeat bar:** Full-width, stays compact but gains glass surface treatment (`glass-bg`, `glass-border`, `glass-shadow`), gold LED pulse on active state, segment separators with warm copper borders.

**Zone 2 — Operations section:** Replace the plain `Collapsible` wrapper with a glass panel system. Priorities and state panels get `hub-panel`-style accent bars (copper for priorities, gold for state), glow backdrops (`panel-glow`), and refined card compositions. The collapsible trigger gets a warm charcoal background with gold chevron.

**Zone 3 — View tabs + filter bar:** Add `ResearchFilterBar` above the tab content area. Tabs themselves get the Sherpa tab treatment — gold underline on active, warm hover states, `font-display` labels.

Add filter state management (search query string + category set) with URL persistence alongside the existing `?view=` param.

### Heartbeat Indicator — `research-heartbeat-indicator.tsx`

Replace the `bg-muted/30` strip with glass surface (`glass-bg`, `glass-border`). Active state: emerald dot gains a gold outer glow ring (`pulse-glow` keyframe). Segment text uses `led-active` animation for the status message. Cycle count rendered as a gold numeric (`text-[var(--color-gold)]`). The entire bar gets `glass-shadow` for depth separation.

### State Panel — `research-state-panel.tsx`

**Dangling threads:** Glass card with copper accent bar (left edge, `hub-panel` pattern). Severity badges get domain-specific coloring — CRITICAL uses destructive with a subtle glow shadow, HIGH uses amber, MEDIUM/LOW use warm-gray.

**Research queue:** Glass card with progress-bar-style completion indicator (gold fill proportional to completed/total). Completed items fade to `text-dim` with copper checkmarks. Pending items pulse subtly.

**Coverage map:** Glass card with staleness indicators on each stream row. Last-run date colorized: green (<24h), amber (>2 days), red (>7 days), computed from current time. Row hover adds `surface-hover` + `surface-hover-border` transition.

### Priorities Panel — `research-priorities-panel.tsx`

Glass card with gold accent bar. Narrative text in `font-display italic` with warm color (`text-[var(--color-gold-muted)]`). Priority items rendered as a numbered rail — each number in a gold circle, connecting line between items (`rail-node` pattern from globals.css). Hover reveals the full text with warm background.

### Stream View — `research-stream-view.tsx`

Stream headers become glass cards with category-specific accents. Each stream gets a subtle left-edge gradient (rotating through gold, copper, bronze per category). File count badge uses gold background. Expanded file list uses the `rail-node` spine pattern — vertical gold connector between entries, hover adds `surface-hover`. Latest summary renders inline markdown.

### Timeline View — `research-timeline-view.tsx`

Add a proper timeline spine — vertical copper line (`activity-entry.tsx` pattern) with gold dots at each entry. Category badges get warm border treatment (`border-[var(--border-gold)]`). Staggered reveal animation on entries using CSS `animation-delay` with `panel-glow-in`. Sort toggle styled as a glass pill button. Summary text renders inline markdown.

### Table View — `research-table-view.tsx`

Table gets glass surface treatment — `glass-bg` background, `glass-border` on the container, `glass-shadow` for depth. Header row uses warm charcoal background with copper bottom border. Sortable columns show gold arrow indicators. Row hover transitions to `surface-hover`. Category badges match the warm badge treatment. Summary column renders inline markdown.

### Filter Bar — `research-filter-bar.tsx` (new)

Compact bar with two controls: a search `Input` with gold focus ring and a category multi-select. Search filters across title, summary, and category (client-side, debounced). Category filter shows checkboxes for each available category. Both values persist to URL params (`?q=`, `?categories=`). The bar itself uses `glass-bg` surface with `glass-border`.

### Inline Markdown Rendering

Summaries in all three views currently display raw markdown strings. Add lightweight inline rendering for bold (`**`), italic (`*`), inline code (`` ` ``), and links (`[text](url)`) using a small utility function. No new dependencies — regex-based transform to React elements. Reuse the pattern from `packages/studio-core/src/markdown.ts` utilities.

## Rationale

The V1 deliberately used shadcn defaults to validate the data architecture and component boundaries in a single session. Now that the structure is proven (11 files, 23 tests, zero regressions), applying the design language is a contained visual pass — every component exists, every data flow works, the only changes are to rendering and layout.

The Sherpa design language is already mature — 10+ components use the warm spatial glass system. The research dashboard is currently the only major Studio page still on raw shadcn defaults, making it visually inconsistent with hub panels, mission views, and initiative lifecycle.

The functional enhancements (search, markdown, staleness) were explicitly scoped out of V1 as seeds. All three are client-side-only — no data layer changes needed.

**Why not extract shared glass utilities first?** The design-system initiative (approved) will eventually create a token registry and component catalog. But the patterns are already established in code — this initiative applies them directly, consistent with how hub-panel, mission-card, and activity-entry were built. If design-system lands later, it can catalog what exists.

## Dependencies

None. The V1 data layer is stable. All design tokens are already defined in `globals.css`. The `design-system` initiative is complementary but not blocking.

## Review Notes

**Scope boundary:** This is a visual + filter pass. No data layer changes (`packages/studio-core/src/research-files.ts` untouched). No new shadcn components needed — all used components (Card, Badge, Tabs, Collapsible, Input) are already installed. No new npm dependencies.

**Edge cases:**
- Filter bar state interacts with view switching — filters should persist across tab changes but reset on page navigation. URL params handle this naturally.
- Inline markdown rendering must handle edge cases (unclosed bold, nested formatting). Keep the regex simple — handle `**bold**`, `*italic*`, `` `code` ``, and `[text](url)` only. Malformed markdown renders as plain text.
- Staleness computation needs the current time — already available from the `connection()` + `Date.now()` pattern in `page.tsx`. Pass `now` as a serialized ISO string prop.
- Reduced motion: all new animations must respect `prefers-reduced-motion` — the existing `@media` rule in `globals.css` already blankets all animations.

**Trade-offs:**
- Inline markdown rendering via regex vs. a proper parser (remark/rehype): regex is zero-dependency and handles the 4 common patterns. A full parser adds ~30KB for formatting that appears in 1-2 line summaries. If summary complexity grows, revisit.
- Category filter as checkboxes vs. multi-select dropdown: checkboxes are more discoverable at 9 categories. If stream count exceeds ~15, switch to a `Select` with multi-select.

**Effort:** 3 sessions
**Session breakdown:**
- Session 1: Design phase — `/design` with `/frontend-design` to establish visual direction, build prototype.html showing the glass treatment, typography, and layout
- Session 2: Core glass treatment — heartbeat indicator, state panel (with staleness), priorities panel, dashboard orchestrator layout, page chrome
- Session 3: View modes (stream, timeline, table glass treatment + timeline spine + staggered reveals), filter bar, inline markdown utility
