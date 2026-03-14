# Vector 1: Sidebar + Full-Width Content Coexistence

**Question:** How do developer tools with persistent left sidebars handle pages that need the full viewport width?
**Agent dispatched:** 2026-03-14

## Findings

- The dominant pattern: sidebar owns its width, content fills the rest via flexbox. Width constraints go INSIDE the content area, not on it. shadcn/ui's `SidebarInset` uses `flex-1` with no max-width.
- Per-page width constraints belong inside the content area. MUI Toolpad's `PageContainer` accepts `maxWidth` — setting `maxWidth={false}` disables it. The layout shell never constrains width; each page chooses.
- Vercel's dashboard uses a resizable, collapsible sidebar. Content fills remaining space; pages control their own width.
- Grafana uses `position: fixed` sidebar with `grid-template-columns: 250px 1fr`. Dashboards fill the entire `1fr` column with no max-width.
- Linear uses a fixed sidebar with a spacer div that pushes content. GitLab animates `padding-left` on the main content — most performant approach.
- shadcn/ui's `SidebarInset` has no max-width by default. For sidebar-aware width calculations, use `max-w-[calc(100vw-var(--sidebar-width))]` with `peer-data-[state=collapsed/expanded]` variants.
- Next.js route groups are NOT the right tool — they create separate layout trees and would require duplicating the sidebar.

## Sources

- [shadcn sidebar docs](https://ui.shadcn.com/docs/components/radix/sidebar) — SidebarInset component, CSS variable approach
- [Every Layout - The Sidebar](https://every-layout.dev/layouts/sidebar/) — Flexbox sidebar pattern
- [react-admin Layout docs](https://marmelab.com/react-admin/Layout.html) — flexGrow content area
- [MUI Toolpad PageContainer](https://next.mui.com/toolpad/core/react-page-container/) — per-page maxWidth control
- [MUI Toolpad DashboardLayout](https://mui.com/toolpad/core/react-dashboard-layout/) — shell + page pattern
- [Vercel changelog](https://vercel.com/changelog/new-dashboard-navigation-available) — resizable sidebar
- [Joshua Wootonn](https://www.joshuawootonn.com/sidebar-animation-performance) — Linear/GitLab sidebar animation analysis
- [Achromatic](https://www.achromatic.dev/blog/shadcn-sidebar) — shadcn sidebar community patterns
- [shadcn-ui Discussion #6042](https://github.com/shadcn-ui/ui/discussions/6042) — sidebar-aware width calc
- [Next.js Route Groups](https://nextjs.org/docs/app/api-reference/file-conventions/route-groups) — why not to use for width variation

## Implications

The `/process` full-width layout is a non-issue. The pattern is universal: `flex-1` on the content area, per-page `max-w-*` inside it. Our existing architecture already does this — most pages wrap in `max-w-6xl`, process has no wrapper. The sidebar just needs to be a flex sibling. Kill criterion #1 is effectively de-risked.

## Open Questions

- Does the `/process` 3-zone grid need to recalculate column widths when sidebar collapses?
- Should StudioHeader sit inside the flex-1 content area or above it?
- Need `min-width: 0` on the flex child to prevent overflow with wide content.
