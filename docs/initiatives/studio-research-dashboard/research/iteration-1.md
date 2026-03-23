# Iteration 1 — 2026-03-21

## Findings

### Vector 1: Structured Markdown Section Parsing
**Question:** How to parse RESEARCH_STATE.md and PRIORITIES.md into typed data structures?
**Full report:** [iteration-1/vector-1-markdown-section-parsing.md](iteration-1/vector-1-markdown-section-parsing.md)

- `packages/studio-core/src/markdown.ts` already has `extractSection()`, `parseMarkdownTable()`, `extractNumberedItems()`, and `parseFrontmatter()` — all the primitives needed
- Strikethrough and severity markers are simple regex additions on top of existing functions
- No new dependencies required — remark/mdast AST parsing is overkill for agent-maintained files

**Implications:** Data layer work is simpler than estimated. Compose existing utilities into `parseResearchState()` and `parseResearchPriorities()` functions.

### Vector 2: Timezone-Aware Heartbeat Status
**Question:** How to compute heartbeat activity status with Pacific Time math in Next.js?
**Full report:** [iteration-1/vector-2-timezone-heartbeat-status.md](iteration-1/vector-2-timezone-heartbeat-status.md)

- `Intl.DateTimeFormat` with `timeZone: 'America/Los_Angeles'` and `formatToParts()` handles DST automatically — no date libraries
- ISO timestamp comparison is trivial: `Date.now() - new Date(iso).getTime()`
- **Critical:** Next.js 15/16 requires `await connection()` from `next/server` before calling `Date.now()` in server components, otherwise build fails with prerender error

**Implications:** The heartbeat utility itself is pure (no Next.js import). The `connection()` call must happen in the page component, not the utility.

### Vector 3: Multi-View Dashboard Patterns
**Question:** Best patterns for tabbed views with server-rendered data in shadcn/ui + Next.js?
**Full report:** [iteration-1/vector-3-multi-view-dashboard-patterns.md](iteration-1/vector-3-multi-view-dashboard-patterns.md)

- Server component fetches once, passes data to a client dashboard component with shadcn Tabs
- Each view (StreamView, TimelineView, DataTable) is its own client component receiving the same data
- All TabsContent children are mounted simultaneously (Radix) — fine for moderate data volumes
- No `nuqs` needed — project already uses `searchParams` via page props and `router.replace()` for URL updates

**Implications:** Architecture matches existing Studio patterns exactly. Process page demonstrates the same server-data + client-interactivity approach.

### Vector 4: Pulsing Status Indicators
**Question:** How to build heartbeat indicators with Tailwind CSS and auto-refresh in Next.js?
**Full report:** [iteration-1/vector-4-pulsing-status-indicators.md](iteration-1/vector-4-pulsing-status-indicators.md)

- `animate-ping` (not `animate-pulse`) is correct — two-layer dot pattern (absolute pinging outer + relative solid inner)
- Three states: green+ping (active), amber static (pending), zinc static (offline)
- Auto-refresh: `router.refresh()` on `setInterval` in a zero-render client component, alongside existing `RefreshOnFocus`
- Accessibility: add `aria-label` and `motion-reduce:animate-none`

**Implications:** No custom CSS needed — built-in Tailwind utilities cover everything. Add a periodic interval refresh alongside `RefreshOnFocus` for continuous freshness.

## Synthesis

The most important finding is that **this initiative requires zero new dependencies**. Every building block already exists:

1. **Markdown parsing** — `markdown.ts` in studio-core has all the primitives. We compose them, not build from scratch.
2. **Timezone math** — native `Intl.DateTimeFormat` with `America/Los_Angeles`. No moment, no date-fns.
3. **View switching** — shadcn `Tabs` component + existing `searchParams` pattern from the process page.
4. **Heartbeat animation** — Tailwind's built-in `animate-ping` class.
5. **Auto-refresh** — existing `RefreshOnFocus` + a simple `setInterval` wrapper.

The one gotcha is `await connection()` — required in Next.js 15/16 before any `Date.now()` call in server components. Without it, the production build fails. This affects how we structure the heartbeat status computation: the pure utility goes in studio-core, the `connection()` call stays in the page component.

The effort estimate drops: **Session 1 can combine the data layer + view modes** since the parsing functions are composition of existing code. Session 2 handles the operational panels (state, heartbeat, priorities). Session 3 becomes a stretch goal for polish rather than a core requirement.

## Proposals Generated

Updated `docs/initiatives/studio-research-dashboard/proposal.md` — status changed from pending to in-progress. No structural changes needed; the proposal's architecture aligns with all research findings.

## Open Questions for Next Iteration

1. **RESEARCH_STATE.md format stability** — How stable is the section naming? Should we add fuzzy heading matching (e.g., "Dangling Threads" vs "Open Threads") or is exact matching sufficient for agent-maintained files?
2. **Refresh interval tuning** — What's the right `setInterval` period for auto-refresh? 2 minutes keeps heartbeat status fresh; 5 minutes reduces server load. Does the page need to feel "live" or just "fresh when you look at it"?
3. **View state persistence** — Should the active view tab be URL-persisted (shareable) or `useState`-only (simpler)? The process page uses URL params, but this dashboard may not need shareable view links.
