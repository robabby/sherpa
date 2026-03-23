---
designed: 2026-03-20
type: both
components-new: 1
components-modified: 2
files-planned: 9
---

# Studio Aggregate Views Design

## Overview

Design aggregate views for Studio's "All Projects" mode. When the user selects "All Projects" in the sidebar project switcher, three views — Research, Process, Tasks — show merged data from all registered projects. Each item carries a project badge linking to the project-scoped detail view.

Proposal: `docs/initiatives/studio-aggregate-views/proposal.md`
Plan: `docs/initiatives/studio-aggregate-views/plan.md`

## Architecture

### Data Models

**New types in `packages/studio-core/src/cross-project.ts`:**

```ts
// Extends the ResearchFile type extracted to studio-core
export interface CrossProjectResearchFile extends ResearchFile {
  projectSlug: string
  projectName: string
}

// Extends the TaskBoardEntry type from tasks.ts
export interface CrossProjectTask extends TaskBoardEntry {
  projectSlug: string
  projectName: string
}
```

**Extracted to `packages/studio-core/src/research-files.ts`:**

```ts
// Moved from apps/studio route into studio-core for reuse
export interface ResearchFile {
  title: string
  date: string
  category: string
  slug: string          // "category/filename" or "filename"
  relativePath: string
}
```

The existing `CrossProjectInitiative` interface already covers the process view — no new type needed there.

### Component Tree

```
(studio) layout
├── StudioSidebar (modified — validates activeProject, hrefPrefix="/projects" in aggregate)
│   └── ProjectSwitcher (modified — preserves section on switch)
└── projects/
    ├── page.tsx (modified — project cards with stats)
    ├── research/page.tsx (new — Server Component, flat)
    ├── process/page.tsx (new — Server Component, flat)
    └── tasks/page.tsx (new — Server Component, flat)
```

All three aggregate pages are **Server Components** — no client state, no interactivity beyond links. Data is fetched at render time via the cross-project functions.

No new `studio-ui` components are created. The aggregate pages compose existing primitives:

| Need | Component | Source |
|------|-----------|--------|
| Project identifier | `Badge` (outline variant) | `@/components/ui/badge` |
| Initiative status | `StatusBadge` | `@sherpa/studio-ui` |
| Task status | `Badge` (variant mapped by status) | `@/components/ui/badge` |
| Section headers | `font-mono text-xs uppercase tracking-[0.25em]` | Inline class pattern |
| List rows | `rounded-lg px-3 py-2.5 hover:bg-card/50` | Inline class pattern from research page |

### Data Flow

```
Browser → /projects/research (static route, priority over [project])
  → AggregateResearchPage (Server Component)
    → getAllResearchFiles()  [cross-project.ts]
      → getAllProjects()     [projects.ts — reads in-memory registry]
        → for each project:
            scanResearchFiles(project.root)  [research-files.ts — reads .sherpa/research/]
      → merge, sort by date desc, decorate with projectSlug/projectName
    → render grouped-by-category list
      → each row: Link to /projects/{projectSlug}/research/{slug}
```

Same pattern for process (uses `getAllInitiatives()`) and tasks (uses `getAllTasks()`).

**Key principle:** All aggregate data is assembled in Server Components. No client-side fetching. No React Context for project state. The URL is the source of truth for project scope.

### Integration Points

**Sidebar (`studio-sidebar.tsx`):** Two changes:
1. Validate `matchedSlug` against the `projects` prop to distinguish `/projects/research` (aggregate) from `/projects/sherpa` (project). Without this, the sidebar would think "research" is a project slug.
2. Change `hrefPrefix` from `""` to `"/projects"` when no active project. This makes nav links point to `/projects/research` instead of `/research` (which the middleware redirects to primary).

**Project Switcher (`project-switcher.tsx`):** Update `handleChange` to preserve the current top-level section when switching between project scope and aggregate. Extract section from URL using `activeProject` to determine parse pattern (project-scoped vs aggregate).

**Middleware (`middleware.ts`):** No changes. The sidebar fix means aggregate navigation no longer generates bare `/research` links. Legacy redirects remain for bookmarks.

**Project-scoped research page:** Remove inline `scanResearchFiles` and `ResearchFile` — import from `@/lib/studio` instead. Zero behavior change.

### File Plan

**`packages/studio-core/` — Data layer**

| Action | File | Purpose |
|--------|------|---------|
| Create | `src/research-files.ts` | `ResearchFile` type + `scanResearchFiles()` extracted from route |
| Create | `src/__tests__/research-files.test.ts` | Unit tests for scanResearchFiles |
| Modify | `src/cross-project.ts` | Add `CrossProjectResearchFile`, `CrossProjectTask`, `getAllResearchFiles()`, `getAllTasks()` |
| Modify | `src/index.ts` | Add `export * from "./research-files"` |

**`packages/studio-ui/` — Sidebar fix**

| Action | File | Purpose |
|--------|------|---------|
| Modify | `src/studio-sidebar.tsx` | Validate activeProject against projects list, hrefPrefix="/projects" in aggregate |
| Modify | `src/project-switcher.tsx` | Preserve section when switching to/from "All Projects" |

**`apps/studio/` — Routes**

| Action | File | Purpose |
|--------|------|---------|
| Create | `src/app/(studio)/projects/research/page.tsx` | Aggregate research feed |
| Create | `src/app/(studio)/projects/process/page.tsx` | Aggregate initiative list |
| Create | `src/app/(studio)/projects/tasks/page.tsx` | Aggregate task board |
| Modify | `src/app/(studio)/projects/page.tsx` | Enhanced landing with per-project stats |
| Modify | `src/app/(studio)/projects/[project]/research/page.tsx` | Import scanResearchFiles from studio-core |

## UI Design

### Layout

All three aggregate views follow the same layout pattern already established by the project-scoped research page:

```
┌─────────────────────────────────────────────┐
│  H1: "Research" / "Process" / "Tasks"       │
│  (optional: status summary badges, right)   │
├─────────────────────────────────────────────┤
│                                             │
│  ── CATEGORY HEADER ────────────────────    │
│  ┌─────────────────────────────────────┐    │
│  │ [status] Title  [Project]    date   │    │
│  │ [status] Title  [Project]    date   │    │
│  │ [status] Title  [Project]    date   │    │
│  └─────────────────────────────────────┘    │
│                                             │
│  ── CATEGORY HEADER ────────────────────    │
│  ┌─────────────────────────────────────┐    │
│  │ ...                                 │    │
│  └─────────────────────────────────────┘    │
│                                             │
└─────────────────────────────────────────────┘
```

- Max width: `max-w-4xl` (matches existing pages)
- Padding: `px-6 py-8` (matches existing pages)
- Row height: `py-2.5` with `gap-1` between rows
- Section spacing: `gap-8` between groups

### Component Selection

| Element | Implementation | Notes |
|---------|---------------|-------|
| Page heading | `h1.font-display.text-2xl.text-foreground` | Matches existing pages |
| Category/section label | `h2.font-mono.text-xs.uppercase.tracking-[0.25em].text-muted-foreground` | Matches research page pattern |
| List row | `Link.flex.items-center.justify-between.rounded-lg.px-3.py-2.5.hover:bg-card/50` | Matches research page rows |
| Project badge | `Badge variant="outline"` + `font-mono text-[10px]` | Outline variant — lightweight, doesn't compete with status |
| Status badge (initiatives) | `StatusBadge` from studio-ui | Existing component, handles all statuses |
| Status badge (tasks) | `Badge` with variant mapped: dispatched→default, failed→destructive, else→secondary | Simple mapping, no new component |
| Summary chips | `Badge variant="secondary"` + `font-mono text-[10px]` | Top-right header area, status counts |
| Empty state | `div.rounded-xl.border.border-border/50.bg-card/30.p-8.text-center` | Matches existing empty states |
| Project cards (landing) | Existing card pattern with `rounded-xl border border-border/50 bg-card/30 p-5 hover:border-gold/20` | Add Badge stats row |

### Interaction Patterns

1. **Row click → project-scoped detail.** Every aggregate row links to the item's project-scoped view. Research: `/projects/{slug}/research/{file}`. Process: `/projects/{slug}/process?node={init}`. Tasks: `/projects/{slug}/tasks?node={id}`.

2. **Project switcher preserves section.** Switching from "All Projects" to "Sherpa" while on `/projects/research` → `/projects/sherpa/research`. Switching from `/projects/sherpa/tasks` to "All Projects" → `/projects/tasks`.

3. **No aggregate detail panes.** The aggregate views are flat lists only. Detail/tree views are inherently project-scoped. Clicking a row navigates away from the aggregate into the project scope.

4. **Sidebar nav active state.** When on `/projects/research` (aggregate), the Research nav item is active. The sidebar `isActive()` function already works — it matches `pathname.startsWith(href + "/")` or `pathname === href`.

### Row Patterns by View

**Research row:**
```
[title]  [Project]  ·····  [date]
```
Title left, date right. Project badge inline after title. Grouped by category.

**Process row:**
```
[status badge]  [title]  [Project]  ·····  [updated]
```
StatusBadge (led mode for compactness), title, project badge. Sorted by updated desc. Optional: type/risk badges if space allows — defer to iteration.

**Tasks row:**
```
[status badge]  [title]  [Project]  ·····  [role]  [date]
```
Status as colored Badge, title, project badge. Role and date on right. Sorted: active (dispatched/pending) first, then by date.

## Decisions

### D1: No new studio-ui components

**Decision:** Aggregate pages compose existing shadcn `Badge` and studio-ui `StatusBadge` directly. No `ProjectBadge` wrapper, no `AggregateList` abstraction.

**Alternatives rejected:**
- `ProjectBadge` component — three usages doesn't justify a file. `<Badge variant="outline" className="font-mono text-[10px]">{name}</Badge>` is clear enough inline.
- `AggregateListRow` component — each view's row has different content (status badge vs none, role column vs date column). A generic wrapper would need too many props.

**Rationale:** YAGNI. Three pages with similar but not identical rows. If a pattern emerges during implementation, extract then.

**Confidence:** High
**Kill criteria:** If a 4th aggregate view is added, reconsider extraction.

### D2: Flat lists, not full workspace components

**Decision:** Aggregate views render flat `Link` lists, not `ProcessWorkspace` or `MissionWorkspace`.

**Alternatives rejected:**
- Reuse `ProcessWorkspace` with merged data — the tree view, kind rail, and detail pane are all project-scoped concepts. Passing cross-project data would require significant prop changes and break the workspace's internal assumptions.
- Reuse `MissionWorkspace` — its detail pane resolves task logs from a single `projectRoot`. Cross-project tasks have different roots.

**Rationale:** The aggregate view is a portfolio overview — scan, orient, then click into a project for the full experience. Flat lists with project badges serve this purpose. Detail is always project-scoped.

**Confidence:** High
**Kill criteria:** If users want to view task logs or initiative trees without switching project context, revisit with a cross-project detail pane.

### D3: Static routes, not reserved slug

**Decision:** Aggregate pages live at `projects/research/page.tsx` (static), taking priority over `projects/[project]/research/page.tsx` (dynamic) in Next.js App Router.

**Alternatives rejected:**
- Reserved slug `/projects/all/...` — adds a magic string that could collide, requires special-case in `[project]` layout
- Route groups `(aggregate)` — transparent in URL, same static-priority effect, but adds directory nesting for no benefit

**Rationale:** Next.js resolves static routes before dynamic segments. `/projects/research` hits the static page. `/projects/sherpa/research` hits the dynamic. Clean, no configuration needed. The `[project]` layout's `notFound()` for invalid slugs is a safety net.

**Confidence:** High
**Kill criteria:** None — this is standard Next.js routing behavior.

### D4: No middleware changes

**Decision:** Keep the legacy route redirects (`/process` → `/projects/sherpa/process`) intact. Don't remove routes from `LEGACY_ROUTE_PREFIXES`.

**Alternatives rejected:**
- Remove `/process`, `/research`, `/tasks` from legacy redirects so bare routes serve aggregate — breaks existing bookmarks and external links to project-scoped views.

**Rationale:** The sidebar fix (`hrefPrefix="/projects"` in aggregate mode) means navigation already generates `/projects/research` links. Legacy redirects are backwards-compatible for direct URL access. Both code paths work correctly.

**Confidence:** High
**Kill criteria:** If users expect `/research` to mean "all projects research" rather than "primary project research", revisit.

## Open Questions

1. **Process view: StatusBadge mode.** The plan uses `StatusBadge` in default (badge) mode. The `led` mode is more compact and may work better in a dense list. Prototype both, decide during implementation.

2. **Research grouping in aggregate.** The project-scoped page groups by category. In the aggregate view, should we group by project (then category), by category (mixing projects), or by date (chronological feed)? The plan groups by category (mixing projects). The prototype validates this choice.

3. **Project card stats: loading cost.** The enhanced landing calls `getInitiatives()`, `getTaskBoard()`, and `scanResearchFiles()` per project. For 3 projects this is fine. Monitor if this becomes noticeable.
