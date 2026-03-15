---
status: pending
initiative: studio-ux-patterns
created: 2026-03-15
updated: '2026-03-15'
type: new-plan
risk: evolutionary
targets:
  - apps/studio/src/components/command-palette.tsx        # (new file)
  - apps/studio/src/app/layout.tsx
  - packages/studio-ui/src/empty-state.tsx                # (new file)
  - packages/studio-ui/src/loading-skeleton.tsx            # (new file)
  - apps/studio/src/hooks/use-page-status.ts               # (new file)
  - apps/studio/src/app/page.tsx
  - apps/studio/src/app/process/page.tsx
  - apps/studio/src/app/tasks/page.tsx
  - apps/studio/src/app/skills/page.tsx
  - apps/studio/src/app/conventions/page.tsx
  - apps/studio/src/app/dispatch/page.tsx
dependencies: []
spawned-from: null
---

# Studio UX Patterns: Vercel-Inspired Interaction Primitives

## Summary

Adopt four cross-cutting interaction patterns proven in Vercel's recent platform redesign — command palette, skeleton loading, functional empty states, and browser tab status — and apply them consistently across all Studio pages. These are interaction primitives that benefit every view, independent of page-specific layout work happening in studio-agent-missions and studio-dashboard-sidenav.

## State Snapshot

Studio has 12+ top-level routes, a dark-mode-first design, and a growing component library (91 components in studio-ui). Several interaction gaps exist that Vercel's redesign highlights:

- **No command palette.** The `cmdk` package is already installed and a shadcn `Command` primitive exists at `apps/studio/src/components/ui/command.tsx`, but it is not wired into any global search or navigation interface. The only navigation path is the sidebar or breadcrumbs.
- **No skeleton loading.** A shadcn `Skeleton` component exists at `apps/studio/src/components/ui/skeleton.tsx` but is only used internally by the sidebar component. Data-loading views show either nothing or jump from empty to full.
- **No empty states.** Grep for `empty.state|EmptyState|emptyState|no-data|NoData` across studio-ui returns zero results. Pages with no data show blank space — no guidance, no next action.
- **No dynamic page status.** No favicon manipulation, no document.title updates. When a task is dispatched or building, the browser tab gives no indication — the user must stay on the page to watch.
- **URL-persisted state** is partially implemented (tasks page has search params), but most views (process, skills, conventions, dispatch) lose filter state on refresh.

Related initiatives:
- **studio-agent-missions** (approved) — Redesigns the tasks page with a mission control layout, metric chips, SSE streaming, event timeline. Page-specific, not cross-cutting.
- **studio-dashboard-sidenav** (approved) — Introduced the sidebar and dashboard layout. Already landed.
- **design-system** (approved) — Token registry and component catalog. Complementary — the new primitives introduced here would get catalog entries.

## Proposed Changes

### 1. Command Palette (Global Cmd+K)

A global keyboard-accessible search dialog built on the existing cmdk/Command primitives. Surfaces all Studio routes, recent initiatives, tasks, skills, and conventions in a single fuzzy-searchable interface. Mounted in the root layout, triggered by Cmd+K (or the sidebar search field).

Groups:
- **Navigation** — All 12+ sidebar routes with their icons
- **Initiatives** — Recent/active initiatives from `docs/initiatives/`
- **Tasks** — Active/recent tasks from `docs/tasks/`
- **Skills** — All skills from `.claude/skills/`
- **Quick Actions** — Dispatch task, create initiative, open settings

Data sourced from existing studio-core APIs (initiative listing, task board, skill registry). No new data layer needed.

### 2. Skeleton Loading Patterns

Reusable skeleton compositions for the major page layouts: list-detail pane (tasks, process), card grid (dashboard), and single-column (skills, conventions, docs). Each skeleton matches the actual content shape of its target page.

Applied via Next.js `loading.tsx` convention — each route group gets a loading file that renders the appropriate skeleton. Uses a show-delay pattern (150ms before showing, 300ms minimum display) to avoid flicker on fast loads.

### 3. Functional Empty States

A reusable `EmptyState` component in studio-ui that replaces blank-space-when-no-data with actionable guidance. Following Vercel's pattern: no decorative illustrations, instead show the exact next step (CLI command, link, or action button) in monospace.

Applied to: tasks (no tasks yet → show dispatch command), process (no initiatives → show propose command), dispatch (no backends → show config hint), skills (no custom skills → show skill creation path), conventions (empty → show rule creation path).

### 4. Browser Tab Status

A client-side hook that updates `document.title` and the favicon based on the current page state. When watching a dispatched task, the tab shows a building indicator. When a task completes or fails, the favicon changes to green/red — visible without switching to the Studio tab.

States: idle (default sherpa icon), building/dispatched (amber animated), success (green), error (red). Title format: `Status · Page — Sherpa Studio`.

### 5. URL-Persisted Filter State (Extend)

Extend the URL search params pattern already used on the tasks page to process, dispatch, skills, and conventions pages. All meaningful filter/sort state reflected in the URL for shareability and refresh resilience.

## Rationale

These four patterns were identified from analysis of Vercel's January-February 2026 dashboard redesign, where they received strong praise from the design community (Blake Crosley's analysis, Medium UX breakdown, Evil Martians' developer tools research). The patterns are:

- **Not Vercel-specific** — they appear across Linear, Supabase, GitHub, and other developer tools. We're adopting proven interaction conventions, not copying a specific product.
- **Cross-cutting** — unlike page-specific layout work, these primitives improve every page simultaneously.
- **Low-risk** — all are additive or progressive enhancements. No existing behavior changes. No breaking API surface.
- **Infrastructure already exists** — cmdk and Skeleton are installed but unused. The gap is composition and application, not new dependencies.

Alternative considered: a full layout redesign inspired by Vercel's sidebar + projects-as-filters pattern. Rejected because Studio already has a sidebar (from studio-dashboard-sidenav) and the page-specific layout work is better handled by individual initiatives (studio-agent-missions for tasks, future initiatives for other pages).

## Dependencies

- **Soft coordination with studio-agent-missions** — That initiative redesigns the tasks page. The skeleton and empty state patterns from this initiative should be adopted by the new MissionWorkspace components. Not a hard dependency — either can land first — but the implementations should align on the EmptyState component API.
- **Soft coordination with design-system** — New components introduced here (EmptyState, loading skeletons, CommandPalette) should get catalog entries once the design-system initiative lands.

## Review Notes

**Open questions:**
- Should the command palette include a "Navigation Assistant" (AI-powered search) like Vercel's, or start with static fuzzy search? Recommendation: start static, add AI later as a follow-on.
- Favicon animation for "building" state — should it be a CSS animation or a canvas-drawn animated favicon? CSS is simpler but less flexible.

**Trade-offs:**
- Skeleton compositions are tightly coupled to page layouts. If a page layout changes (as studio-agent-missions does for tasks), the skeleton needs updating too. Mitigated by making skeletons composable from small primitives rather than monolithic per-page templates.
- The command palette needs to source data from studio-core APIs at runtime. For initiatives and tasks, this means filesystem reads on every Cmd+K open (or a cached index). Starting with a simple approach (read on open, debounce) and optimizing later.

**Effort:** 3 sessions

**Session breakdown:**
- Session 1: Command palette — wire cmdk into root layout, populate with routes + initiatives + tasks + skills, keyboard handling
- Session 2: Skeleton loading + functional empty states — create composable skeleton primitives, EmptyState component, apply loading.tsx files and empty states across all major routes
- Session 3: Browser tab status hook + URL-persisted filters extension — favicon/title management, extend search params to remaining pages, integration polish
