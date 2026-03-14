---
status: approved
initiative: studio-dashboard-sidenav
created: 2026-03-13T00:00:00.000Z
updated: '2026-03-14'
type: new-plan
risk: evolutionary
targets:
  - apps/studio/src/app/layout.tsx
  - apps/studio/src/app/page.tsx
  - apps/studio/src/app/*/layout.tsx
  - packages/studio-ui/src/studio-sidebar.tsx
  - packages/studio-ui/src/studio-header.tsx
  - packages/studio-ui/src/hub-panel.tsx
dependencies: []
---

# Studio Dashboard & Side-Nav

## Summary

Replace the 12-panel vertical scroll on the home page with a focused operational dashboard, and introduce a persistent left sidebar for section navigation across the entire Studio app. The sidebar gives every section one-click access at a glance; the dashboard reclaims the home page for at-a-glance status rather than serving double duty as both navigation hub and information display.

## State Snapshot

The Studio home page (`apps/studio/src/app/page.tsx`) renders 12 HubPanel components in a `grid-cols-12` layout — Process, Docs, Activity, Conventions, Skills, Playbooks, Tasks, Workforce, Dispatch, Sessions, MCP, Workflow. Each panel contains a summary of its section plus a "View all →" link that serves as the primary way to navigate to that section.

There is **no persistent navigation**. The only way back to any section from a detail page is the breadcrumb (`StudioBreadcrumb`) which links to "/" as "Studio". Users must scroll the full home page to find the panel they want, then click through. The root layout (`layout.tsx`) is minimal — fonts, metadata, dark mode class. No layout shell wraps the app.

The app has 12+ top-level routes (process, activity, dispatch, tasks, workforce, sessions, skills, conventions, docs, playbooks, research, mcp, workflow). Each section layout independently renders `<StudioHeader />` and a max-width container.

## Proposed Changes

### Phase 1: Persistent Left Sidebar

**Use shadcn/ui's official Sidebar component** (released Oct 2024, 25 composable sub-components). Start from `sidebar-07` block template (collapses to icons, section grouping). CSS variables already defined in `globals.css`.

Collapsible left sidebar with:
- Studio wordmark/logo at top
- Section links with icons matching each section's accent color
- Active section highlight via `usePathname()` + `startsWith` matching
- Collapse toggle — `"icon"` mode (shrinks to icon rail, keeps nav accessible)
- Keyboard shortcut: Cmd+B (built into shadcn sidebar)
- Section groupings:
  - **Operations** — Process, Tasks, Dispatch, Workflow
  - **Knowledge** — Docs, Conventions, Skills, Playbooks
  - **System** — Workforce, Sessions, MCP
  - **Activity** — Activity feed (or integrate as a global panel)

**Known issues to address:**
- shadcn `isActive` default bug (#9134): patch with `data-active={isActive || undefined}`
- Next.js 16 cookie persistence (#9189): use existing `use-persisted-state` hook for localStorage fallback instead of server-side cookies

**Modified: `apps/studio/src/app/layout.tsx`**

Wrap `{children}` in a shell layout:
```
┌──────────┬────────────────────────────┐
│ Sidebar  │  Main content area         │
│ (fixed)  │  (scrollable, max-width)   │
│          │                            │
│ sections │  <StudioHeader />          │
│ ...      │  {children}               │
│          │                            │
└──────────┴────────────────────────────┘
```

The sidebar is `position: fixed` on desktop, slides in on mobile (hamburger trigger). Collapsed state persists via cookie or localStorage.

**Modified: `apps/studio/src/app/*/layout.tsx`**

Remove per-section `<StudioHeader />` renders — header moves to root layout shell. Per-section layouts keep their max-width containers but no longer need the header.

### Phase 2: Dashboard Evolution

With navigation handled by the sidebar, the home page no longer needs to be a navigation hub. Evolve it into a focused operational dashboard.

**Modified: `apps/studio/src/app/page.tsx`**

Restructure from 12 equal panels to a three-tier operational dashboard (modeled after GitHub's "My Work" / Linear's "Active Issues" pattern — action-first, not information-first):

- **Tier 1 — Action Required** (always visible, top): Items needing human decision *right now*. Pending proposal reviews (>N days), failed/stuck tasks, stale initiatives. If empty, show an explicit "all clear" success state — not blank panels.
- **Tier 2 — Active Work** (default expanded, middle): Work in progress that doesn't need intervention but deserves awareness. Running dispatches, in-progress initiatives, recent activity. Sorted by recency.
- **Tier 3 — Context** (collapsed or secondary, bottom): Background info that supports decisions but doesn't drive them. System health (MCP, backends), session stats, tool catalog. Available but not prominent.

**Panels that move to sidebar-only** (navigation role replaced): Docs, Conventions, Skills, Playbooks, Workflow.
**Panels that promote to Tier 1-2** (actionable status): Process attention items, Tasks, Dispatch.
**Panels that demote to Tier 3** (informational): MCP, Sessions, Workforce.

**Modified: `packages/studio-ui/src/hub-panel.tsx`**

Evolve into a dashboard widget component with:
- Compact mode for dashboard use (less chrome, denser info)
- Optional "expand" to navigate to full section (via sidebar, not panel link)

### Phase 3: Responsive Behavior

- **Desktop (≥1024px)**: Sidebar expanded (240px), main content fills remaining width
- **Desktop collapsed**: Sidebar icon-only (64px), main content wider
- **Tablet (768–1023px)**: Sidebar collapsed by default, expandable overlay
- **Mobile (<768px)**: No sidebar — hamburger menu slides in from left

## Rationale

The current home page tries to be both a dashboard and a navigation hub. As the app has grown to 12+ sections, this creates two problems:

1. **Navigation tax**: Finding a section requires scrolling through the full home page. There's no way to jump between sections without going home first.
2. **Dashboard dilution**: Every section gets a panel regardless of whether it has actionable information. The Conventions panel showing a count of conventions is not operationally useful — it's navigation disguised as a dashboard widget.

Separating navigation (sidebar) from status (dashboard) lets each do its job well. The sidebar provides instant access to every section. The dashboard focuses on what needs attention.

## Dependencies

None. This is a standalone UI initiative.

## Review Notes

- Phase 1 (sidebar) and Phase 2 (dashboard) can ship independently. The sidebar alone is valuable even with the current home page.
- The sidebar section groupings (Operations / Knowledge / System) should be validated against actual usage patterns. These groupings are a starting hypothesis.
- Consider whether the Operational Pulse strip should also appear in the sidebar (as a miniature status indicator per section).
- The existing HubStagger animations are satisfying on first load but unnecessary on repeat visits. Dashboard evolution should consider whether to keep them.
- StudioHeader currently renders "Mission Control" with a divider. With the sidebar providing context, the header can become section-specific (show current section name) or simplify.

**Effort:** 3-4 sessions
**Session breakdown:**
- Session 1: Sidebar component + root layout shell + responsive behavior
- Session 2: Migrate section layouts to remove header duplication, wire up active states
- Session 3: Dashboard restructuring — prioritized zones, compact widgets
- Session 4 (if needed): Polish — animations, collapsed state persistence, mobile menu
