---
appetite: 3 sessions
shaped: 2026-03-14
---

# Shape: Studio Dashboard & Side-Nav

## Appetite

**3 sessions max.** The sidebar is a known quantity (shadcn official component, flexbox layout, research de-risked the /process full-width concern). The dashboard restructure is the uncertain half — defining "needs attention" semantics and triaging 12 panels into 3 tiers. If both halves can't ship in 3 sessions, the scope needs cutting, not extending.

**Session budget:**
- Session 1: Sidebar + layout shell (engineering, high confidence)
- Session 2: Section layout migration + dashboard restructure (mixed: mechanical migration + design decisions)
- Session 3: Dashboard polish + responsive behavior (integration, testing)

## Shaped Solution

Two connected changes to the Studio app:

**1. Layout shell with persistent sidebar**

Install shadcn/ui's Sidebar component. Wrap the root layout in a `SidebarProvider` → `AppSidebar` + `SidebarInset({children})` structure. The sidebar lists all 12+ sections grouped into Operations / Knowledge / System / Activity, with icon-only collapse mode. Active section highlights via `usePathname()` + `startsWith`. Collapse state persists via the existing `use-persisted-state` hook (avoiding the Next.js 16 cookie bug).

Per-section layouts lose their independent `<StudioHeader />` renders — the header moves into the layout shell (inside `SidebarInset`, above `{children}`). Each section layout keeps its own `max-w-*` container. The `/process` layout has no max-width — it fills the full `flex-1` content area.

**2. Three-tier operational dashboard**

The home page (`page.tsx`) restructures from 12 equal panels to:

- **Tier 1 — Action Required:** Pending reviews, failed tasks, stale initiatives. Uses existing data from `buildAttentionNeeded()` and `buildPendingReview()`. "All clear" empty state when nothing needs attention.
- **Tier 2 — Active Work:** In-progress initiatives, running dispatches, recent activity. Condensed from current Process, Tasks, Dispatch, Activity panels.
- **Tier 3 — Context:** System health (MCP, backends), session stats. Collapsed by default.

Five panels lose their dashboard presence entirely (Docs, Conventions, Skills, Playbooks, Workflow) — the sidebar handles their navigation. The Operational Pulse strip stays at the top as the persistent status bar.

## Rabbit Holes

1. **Perfecting the "needs attention" algorithm.** Defining thresholds (proposal pending >3 days? task stale >24h?) is a product decision that could absorb a full session of debate. **Avoidance:** Ship with the existing `buildAttentionNeeded()` logic (lifecycle.actor === "human") and the `buildPendingReview()` list. These already identify items needing action. Refine thresholds in a follow-up, not this initiative.

2. **Mobile responsive sidebar.** shadcn's Sidebar uses a Sheet (overlay drawer) on mobile by default. Customizing mobile behavior beyond the built-in default could burn time on a viewport size that isn't the primary use case (Studio is a desktop tool). **Avoidance:** Accept shadcn's default mobile Sheet behavior. Don't build a custom mobile nav.

3. **Animating the sidebar collapse.** The sidebar-07 block collapses to an icon rail. Adding custom spring animations, micro-interactions, or staggered reveals is attractive but unnecessary. **Avoidance:** Use shadcn's built-in transition. No custom animation work.

4. **Refactoring HubPanel into a generic widget system.** The temptation to build a configurable dashboard widget framework (drag-and-drop, resizable panels, user-customizable layouts) is real. **Avoidance:** The dashboard is a fixed 3-tier layout. Panels are React components, not configurable widgets. If we want a widget system later, that's a separate initiative.

5. **StudioHeader redesign.** Moving the header into the layout shell raises questions: should it show the current section name? Should it have a search bar? Should it be sticky? **Avoidance:** Keep the header minimal — "Studio" branding + divider, same as current. Section context comes from the sidebar's active highlight, not the header. Header evolution is a separate concern.

## No-Gos

- **No drag-and-drop dashboard customization.** Fixed tier layout, not user-configurable.
- **No role-aware dashboard.** Everyone sees the same tiers. Role-specific views are a future initiative.
- **No global search in the sidebar.** Search is a separate feature (noted in research). The sidebar is navigation only.
- **No custom mobile nav patterns.** Use shadcn's built-in Sheet on mobile.
- **No new data fetching.** The dashboard restructure uses existing data loaders (`getInitiatives`, `getTaskBoard`, `getBackendHealth`, etc.). No new API routes or data sources.
- **No HubStagger animation rework.** Keep or remove the entrance animations — don't redesign them.

## Kill Criteria

1. **If the sidebar layout shell breaks existing section pages** (content overflow, broken padding, process grid regression) and the fix requires more than CSS adjustments (>2 hours debugging), stop and reassess the shell architecture.

2. **If shadcn's Sidebar component requires heavy patching beyond the two known bugs** (isActive #9134, cookie #9189), evaluate whether a simpler custom sidebar would be faster than fighting the component library.

3. **If `studio-state-machine` moves to in-progress before Session 3**, pause the dashboard restructure and coordinate. Sessions 1-2 (sidebar) can ship regardless.

4. **If Session 2 ends without a working sidebar on all routes**, the dashboard restructure (Session 3) should not begin. Ship the sidebar alone and defer the dashboard to a follow-up.
