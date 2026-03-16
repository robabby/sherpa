---
appetite: 3 sessions
shaped: 2026-03-15
---

# Shape: Studio UX Patterns

## Appetite

**3 sessions max.** This is evolutionary work — wiring existing primitives (cmdk, Skeleton) and creating two new lightweight components (EmptyState, page status hook). No new dependencies, no data model changes, no API routes. Each session produces independently shippable improvements. If any single pattern takes more than one session, it's scoped wrong.

## Shaped Solution

### Pattern 1: Command Palette (Session 1)

A `CommandPalette` client component mounted once in `layout.tsx`. Opens on Cmd+K. Built on the existing `apps/studio/src/components/ui/command.tsx` (cmdk primitive).

**Data flow:**
- Server action or API route that returns a flat list of searchable items: `{ label, href, group, icon?, keywords? }`
- Groups: Navigation (static sidebar routes), Initiatives (from `listInitiatives()`), Tasks (from `getTaskBoard()`), Skills (from skill registry)
- Fetched once on open, not on every keystroke — cmdk handles client-side fuzzy filtering
- Selection navigates via `router.push(href)`

**Integration point:** Root layout wraps the palette alongside existing providers. The sidebar's existing `Find...` search field (visible in the sidebar header) becomes the visual trigger — clicking it or pressing Cmd+K opens the palette.

### Pattern 2: Skeleton Loading (Session 2, first half)

Replace the centered `SacredSpinner` pattern with content-shaped skeletons. Three composable skeleton layouts matching Studio's page archetypes:

- **Split-pane skeleton** — for tasks, process (left list column of rectangles + right detail area)
- **Card grid skeleton** — for dashboard (2x3 or 3x4 grid of card-shaped rectangles)
- **Single-column skeleton** — for skills, conventions, docs (heading bar + list of rows)

Delivered as `loading.tsx` files in each route group. Uses the existing `Skeleton` primitive from `apps/studio/src/components/ui/skeleton.tsx`. Add show-delay CSS (`opacity: 0` for 150ms, then fade in) to avoid flicker on fast loads — pure CSS, no JS timer needed.

### Pattern 3: Functional Empty States (Session 2, second half)

A `EmptyState` component in `packages/studio-ui/src/`. Props: `icon`, `title`, `description`, `action` (label + href or onClick). Follows Vercel's pattern — no decorative illustrations, monospace hints for CLI commands.

Applied to 5-6 pages where data can be empty: tasks (no tasks → "dispatch a task"), process (no initiatives → "create a proposal"), dispatch (no recent runs → "dispatch from CLI"), skills (custom skills empty → "create a skill"), conventions (empty → "add a rule").

Each empty state is a one-liner addition in the existing page component's "no data" branch.

### Pattern 4: Browser Tab Status (Session 3, first half)

A `usePageStatus(title, status?)` client hook. Updates `document.title` with the pattern `Status · Page — Sherpa Studio` (or just `Page — Sherpa Studio` when idle).

Favicon swapping: preload 4 small SVG favicons (default, building/amber, success/green, error/red). The hook swaps `<link rel="icon">` href based on status. No canvas rendering, no animation — just static icon swaps. Keep it dead simple.

Applied to: tasks page (reflects selected task's dispatch status), dispatch page (reflects active dispatch), process page (default only). Other pages use the default.

### Pattern 5: URL Filter State (Session 3, second half)

Extend the `searchParams` pattern already used in tasks and process pages to: dispatch, skills, conventions. Each page gets filter/sort state reflected in the URL via `useSearchParams` + `router.replace`. The pattern is already proven in the codebase — this is replication, not invention.

## Rabbit Holes

1. **AI-powered search in the command palette.** Vercel has a "Navigation Assistant" that interprets natural language queries. Tempting to add, but it requires an API call per query, latency management, and prompt engineering. Not worth it for 12 routes and a few hundred items. **Avoidance:** Static fuzzy search only. AI search is a separate initiative if ever needed.

2. **Animated favicon for "building" state.** Vercel uses favicon animations for in-progress deployments. This requires either canvas-based frame generation or cycling through multiple favicon files on a timer. Fragile across browsers. **Avoidance:** Use static icon swaps (amber for building, green for done). Animation is cosmetic — the status change itself is what matters.

3. **Skeleton fidelity obsession.** It's tempting to make skeletons pixel-match the actual loaded content. This creates tight coupling — every layout change breaks the skeleton. **Avoidance:** Skeletons should approximate the content shape (list of bars, card grid) not replicate it. Three composable templates, not 12 bespoke ones.

4. **Command palette data freshness.** Should the palette show real-time task status? Live initiative counts? This pulls toward a persistent data layer or WebSocket subscription. **Avoidance:** Fetch on open, stale for the duration of the dialog being open. Users will close and reopen if they need fresh data. Good enough.

5. **Empty state copy and illustrations.** Could spend hours crafting perfect empty state messages or commissioning illustrations. **Avoidance:** One sentence + one action per empty state. Monospace for CLI commands. No illustrations. Total copy work: ~30 minutes for all 5-6 states.

## No-Gos

- **No custom command palette library.** Use cmdk as-is. No wrappers, no abstraction layer, no "CommandPaletteProvider."
- **No light mode considerations.** Studio is dark-mode-only. Don't add light-mode skeleton or empty state variants.
- **No page-specific layout changes.** This initiative adds interaction primitives *within* existing page layouts. Layout redesigns belong to page-specific initiatives (studio-agent-missions for tasks, etc.).
- **No data model changes.** The command palette reads from existing APIs. No new database tables, no new schema fields, no new API routes beyond what's needed to aggregate search items.
- **No animated transitions between loading → loaded.** Skeletons appear, content replaces them. No fade-out/morph/crossfade choreography. That's a design-system concern.
- **No mobile-specific empty states or command palette UX.** Studio is a desktop-first tool. The palette and empty states should be functional on mobile but don't need mobile-optimized layouts.

## Kill Criteria

1. **If the command palette takes more than 1 session** — the data aggregation is too complex. Stop, ship without it, reconsider the data layer.
2. **If cmdk doesn't support the grouping/filtering model we need** — stop and evaluate alternatives before burning time on workarounds.
3. **If skeleton loading causes layout shift (CLS) on real pages** — the skeleton shapes don't match content closely enough. Simplify to a centered spinner fallback rather than spending time debugging CLS.
4. **If more than 2 pages need bespoke empty state logic** (beyond icon/title/description/action) — the EmptyState component API is wrong. Redesign the component, don't add props.
5. **If browser tab status doesn't work reliably in Safari + Chrome** — drop it. It's a nice-to-have, not a must-have. Don't burn cycles on browser-specific favicon hacks.
