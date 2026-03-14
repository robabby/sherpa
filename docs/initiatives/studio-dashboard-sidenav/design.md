---
designed: 2026-03-14
type: both
components-new: 3
components-modified: 14
files-planned: 19
---

# Design: Studio Dashboard & Side-Nav

See [shape.md](shape.md) for appetite (3 sessions), rabbit holes, no-gos, and kill criteria.

## Architecture

### Component Tree

```
layout.tsx (Server Component — unchanged except wrapping)
└── SidebarProvider (Client Component, children slot, defaultOpen from hook)
    ├── AppSidebar (Client Component — new)
    │   ├── SidebarHeader — Studio wordmark
    │   ├── SidebarContent
    │   │   ├── SidebarGroup "Operations"
    │   │   │   └── SidebarMenu → [Process, Tasks, Dispatch, Workflow]
    │   │   ├── SidebarGroup "Knowledge"
    │   │   │   └── SidebarMenu → [Docs, Conventions, Skills, Playbooks]
    │   │   ├── SidebarGroup "System"
    │   │   │   └── SidebarMenu → [Workforce, Sessions, MCP]
    │   │   └── SidebarGroup "Activity"
    │   │       └── SidebarMenu → [Activity]
    │   ├── SidebarFooter — collapse trigger
    │   └── SidebarRail — drag-to-resize edge
    └── SidebarInset
        ├── StudioShellHeader (new — replaces per-section StudioHeader)
        │   ├── SidebarTrigger (mobile hamburger)
        │   ├── Separator (vertical)
        │   └── StudioBreadcrumb (existing, promoted to shell)
        └── <main className="flex-1 overflow-y-auto">
            └── {children} — per-section layouts (max-w-* inside)
```

### Data Flow

**Sidebar (static, no fetching):**
- Navigation config is a plain array defined in AppSidebar — route paths, icons, labels, group membership
- Active state: `usePathname()` from `next/navigation`, matched via `pathname === item.href` or `pathname.startsWith(item.href + "/")`
- Collapse state: `use-persisted-state` hook with key `"sidebar"` — returns boolean, SSR-safe (defaults to `true`/expanded on server)

**Dashboard (server-rendered, existing fetchers):**
- Tier 1 uses existing `buildAttentionNeeded()` and `buildPendingReview()` from current `page.tsx`
- Tier 2 uses existing `getTaskBoard()`, initiative filtering by status `in-progress`
- Tier 3 uses existing `getMcpDashboard()`, `getBackendHealth()`, `computeSessionStats()`
- No new data fetching. All functions already exist in `page.tsx`.

### Integration Points

**shadcn/ui Sidebar component:** Install via `pnpm dlx shadcn@latest add sidebar`. This adds `apps/studio/src/components/ui/sidebar.tsx` with all 25 sub-components. Patch the `isActive` default bug: change `data-active={isActive}` to `data-active={isActive || undefined}`.

**SidebarProvider persistence:** The default shadcn SidebarProvider uses cookies. We replace this with our `use-persisted-state` hook to avoid the Next.js 16 blocking-route issue (#9189). Pass `open` and `onOpenChange` as controlled props instead of relying on `defaultOpen` + cookies.

**StudioHeader migration:** Current header renders "Mission Control" in every section layout. The new `StudioShellHeader` renders once in the root layout shell — it contains the mobile sidebar trigger, a separator, and the breadcrumb. Section-specific context comes from the sidebar's active highlight. The old `StudioHeader` component is retired.

**Per-section layout migration:** Each section layout currently renders `<StudioHeader />` + `<div className="mx-auto max-w-{size}">`. After migration, they render only the max-width container. The header is in the shell. Example:

```tsx
// Before (tasks/layout.tsx):
<div className="mx-auto max-w-6xl"><StudioHeader />{children}</div>

// After:
<div className="mx-auto max-w-6xl px-6 py-6">{children}</div>
```

The `/process` layout remains a pass-through — its content fills the full `SidebarInset` width.

## UI Design

### Sidebar Visual Language

- **Background:** `--sidebar` (`#0e0e10` dark) — deeper than main content, creates depth
- **Active item:** Gold accent bar (2px left border, `--color-gold`) + `--sidebar-accent` background
- **Hover:** Subtle copper glow via `--sidebar-accent` with warm tint
- **Group labels:** Mono uppercase, `text-xs tracking-widest`, muted — matching existing HubPanel label style
- **Icons:** Lucide icons, 20px, matching each section's accent color in active state, muted otherwise
- **Collapse mode:** `"icon"` — shrinks to 48px rail showing only icons. Group labels hide. Tooltips appear on icon hover.
- **Separator:** Glass-border gradient between sidebar and content (matching existing `--glass-border`)

### Section Icon Mapping

| Section | Icon | Accent |
|---------|------|--------|
| Process | `GitBranch` | copper |
| Tasks | `CheckSquare` | gold |
| Dispatch | `Send` | bronze |
| Workflow | `Workflow` | copper |
| Docs | `FileText` | gold |
| Conventions | `BookOpen` | copper |
| Skills | `Zap` | gold |
| Playbooks | `Play` | bronze |
| Workforce | `Users` | eclipse |
| Sessions | `Clock` | session |
| MCP | `Plug` | mcp |
| Activity | `Activity` | gold |

### Dashboard Three-Tier Layout

**Tier 1 — Action Required** (top, always visible):
- Warm copper/gold ambient glow behind the section (subtle, matches existing `panel-glow` animation)
- Card-based: each action item is a compact card with initiative/task title, action type badge, and age indicator
- Uses existing `AttentionItem` and `PendingReviewItem` types
- **All-clear state:** Single centered message with a subtle gold shimmer — "Nothing needs attention. All clear." No empty card grid.

**Tier 2 — Active Work** (middle, main body):
- Clean grid, 2 columns on desktop
- Left: In-progress initiatives (condensed from current Process panel)
- Right: Active tasks + recent dispatches (condensed from current Tasks + Dispatch panels)
- Compact items — title, status badge, last activity timestamp. No panel chrome.

**Tier 3 — Context** (bottom, collapsed by default):
- Collapsible section with "System Status" header
- When expanded: MCP health, backend status, session stats in a compact 3-column row
- When collapsed: single line showing health indicator dots (green/amber/red)

**Operational Pulse strip:** Stays at the top above Tier 1 — the existing `HubOperationalPulse` component, unchanged.

### Responsive Behavior

| Breakpoint | Sidebar | Content |
|------------|---------|---------|
| ≥1024px | Expanded (240px) or icon-only (48px) | Fills remaining width |
| 768–1023px | Icon-only by default, expandable | Fills remaining width |
| <768px | Hidden — Sheet overlay via hamburger | Full width |

shadcn's Sidebar handles mobile Sheet behavior natively. No custom mobile nav work.

## File Plan

### Session 1: Sidebar + Layout Shell

**Install:**
- `pnpm dlx shadcn@latest add sidebar` → `apps/studio/src/components/ui/sidebar.tsx`

**New files:**
- `packages/studio-ui/src/studio-sidebar.tsx` — AppSidebar component (client, nav config, usePathname matching)
- `packages/studio-ui/src/studio-shell-header.tsx` — Shell header (client, SidebarTrigger + breadcrumb)

**Modified files:**
- `apps/studio/src/components/ui/sidebar.tsx` — patch isActive default bug
- `apps/studio/src/app/layout.tsx` — wrap children in SidebarProvider + AppSidebar + SidebarInset + ShellHeader

### Session 2: Section Migration + Dashboard

**Modified files (section layouts — remove StudioHeader, adjust padding):**
- `apps/studio/src/app/tasks/layout.tsx`
- `apps/studio/src/app/process/layout.tsx` (verify pass-through still works)
- `apps/studio/src/app/workforce/layout.tsx`
- `apps/studio/src/app/skills/layout.tsx`
- `apps/studio/src/app/conventions/layout.tsx`
- `apps/studio/src/app/docs/layout.tsx`
- `apps/studio/src/app/sessions/layout.tsx`
- `apps/studio/src/app/dispatch/layout.tsx`
- `apps/studio/src/app/activity/layout.tsx`
- `apps/studio/src/app/playbooks/layout.tsx`
- `apps/studio/src/app/mcp/layout.tsx`
- `apps/studio/src/app/workflow/layout.tsx`

**Modified files (dashboard):**
- `apps/studio/src/app/page.tsx` — restructure from 12-panel grid to 3-tier layout

### Session 3: Polish + Integration

**Modified files:**
- `packages/studio-ui/src/hub-panel.tsx` — add compact variant for dashboard widgets (or retire if dashboard uses custom tier components)
- `packages/studio-ui/src/studio-header.tsx` — deprecate or remove (replaced by shell header)

**New files (if needed):**
- `packages/studio-ui/src/dashboard-tier.tsx` — tier container component with collapsible behavior and ambient glow

## Decisions

### Use controlled SidebarProvider, not cookie-based

Replace shadcn's default cookie persistence with controlled `open`/`onOpenChange` props backed by `use-persisted-state`. This avoids the Next.js 16 `cookies()` blocking-route issue entirely.

### Shell header replaces per-section StudioHeader

A single header in the layout shell replaces 12+ independent `<StudioHeader />` renders. The header shows a mobile sidebar trigger + breadcrumb. Section name context comes from the sidebar's active highlight, not the header text. The current "Mission Control" branding moves to the sidebar header or is retired.

### Icon-only collapse, not offcanvas

`collapsible="icon"` keeps navigation always accessible (icon rail with tooltips). `offcanvas` would hide navigation entirely when collapsed. For a dashboard app with 12+ sections, always-visible navigation is worth the 48px.

### No route groups for the sidebar shell

The SidebarProvider wraps `{children}` in the root `layout.tsx` directly. No `(app)` route group needed — all routes get the sidebar. If auth/landing pages are added later, they can use a route group at that point.

## Resolved Questions

1. **"Mission Control" branding** — retired. The sidebar provides branding context. StudioHeader's title text is removed.
2. **Section groupings** — shipping as-is, validated post-usage. All 12 routes covered: Operations (4), Knowledge (4), System (3), Activity (1).
3. **Breadcrumb pattern** — "Studio / {Section}" on section pages, "Studio / Dashboard" on home. Sub-page breadcrumbs extend from section level (e.g., "Studio / Process / initiative-slug").
