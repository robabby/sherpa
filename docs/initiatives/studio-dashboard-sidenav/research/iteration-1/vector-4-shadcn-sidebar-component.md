# Vector 4: shadcn/ui Sidebar Component

**Question:** Does shadcn/ui have an official sidebar? What's the community standard?
**Agent dispatched:** 2026-03-14

## Findings

- **Official component exists.** Released October 2024, 25 composable sub-components. Install: `pnpm dlx shadcn@latest add sidebar`.
- **Purpose-built for our requirements:** collapsible sections (SidebarGroup + Collapsible), icon-only collapsed mode (`collapsible="icon"`), active state via `isActive` prop, section grouping, sticky header/footer, keyboard toggle (Cmd+B), `useSidebar` hook.
- **16 pre-built block templates.** Most relevant: sidebar-07 (collapses to icons, section grouping), sidebar-08 (inset with secondary nav). Install: `npx shadcn add sidebar-07`.
- **Three visual variants:** `"sidebar"` (fixed), `"floating"` (elevated), `"inset"` (content shifts). Three collapse modes: `"offcanvas"`, `"icon"`, `"none"`.
- **Our app already has sidebar CSS variables defined** in globals.css (lines 105-112 light, 180-187 dark). Collapsible component already installed. Sidebar component itself is NOT yet installed.
- **Known `isActive` bug (#9134):** Default `isActive={false}` renders `data-active="false"`, and Tailwind's `data-active:` selector matches on presence not value. Workaround: `data-active={isActive || undefined}`.
- **Next.js 16 cookie issue (#9189):** SidebarProvider uses cookies for state persistence. In Next.js 16 with cacheComponents, this triggers "Blocking Route" error. Workarounds: Suspense wrapper, disable cache, or client-side localStorage.
- **Theming uses dedicated CSS variables** (`--sidebar-background`, `--sidebar-foreground`, etc.) separate from main theme. Our globals.css already defines these.

## Sources

- [shadcn/ui Sidebar docs](https://ui.shadcn.com/docs/components/radix/sidebar) — official component reference
- [shadcn/ui Changelog 2024-10](https://ui.shadcn.com/docs/changelog/2024-10-sidebar) — release announcement
- [shadcn/ui Blocks](https://ui.shadcn.com/blocks/sidebar) — 16 block templates
- [shadcn-ui #9134](https://github.com/shadcn-ui/ui/issues/9134) — isActive bug
- [shadcn-ui #9189](https://github.com/shadcn-ui/ui/issues/9189) — Next.js 16 cookie issue
- [Medium](https://medium.com/@enayetflweb/building-a-dynamic-sidebar-with-shadcn-ui-59ff58482988) — community integration pattern

## Implications

This is a "use the official component" situation. shadcn/ui's sidebar covers every requirement, the CSS variables are already in our theme, and the Collapsible dependency is installed. Start from sidebar-07 block, adapt to our route structure. Two bugs to watch: isActive default (one-line fix) and Next.js 16 cookie persistence (use localStorage fallback via existing hook).

## Open Questions

- Which collapse mode: `"icon"` (rail) vs `"offcanvas"` (fully hide)?
- Use `"inset"` variant for visual polish, or standard `"sidebar"` for simplicity?
- Has the isActive bug (#9134) been fixed upstream? Check at install time.
