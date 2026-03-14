# Vector 2: Next.js App Router Sidebar Patterns

**Question:** What are the proven patterns for persistent, collapsible sidebars in Next.js App Router?
**Agent dispatched:** 2026-03-14

## Findings

### Server vs. Client Component Boundaries
- Root layout stays a Server Component. Only interactive leaves get `'use client'`.
- "Push use client down" pattern: extract only interactive parts (usePathname nav links, collapse toggle) into small Client Components, compose them into a Server Component shell.
- "Children slot" pattern lets Server Components pass through Client Component wrappers (like SidebarProvider) without forcing children into client bundle.
- Context providers (SidebarProvider) go in Client Components imported by Server Component layouts.

### State Persistence
- Cookies are recommended over localStorage for persistence — readable server-side during SSR, prevents flash of wrong state.
- **Critical Next.js 16 issue (shadcn-ui #9189):** `cookies()` in layouts triggers "Blocking Route" errors when `cacheComponents` is enabled. Three workarounds: wrap in `<Suspense>`, move cookie read deeper, or use client-side localStorage.
- shadcn/ui's cookie pattern: read `sidebar_state` cookie in server component, pass `defaultOpen` to SidebarProvider.

### Active Route Detection
- `usePathname()` is canonical — forces component to be Client Component.
- For section matching: `pathname.startsWith(path)` with root-path guard.
- shadcn/ui uses `isActive` boolean prop on `SidebarMenuButton` — you compute it yourself.

## Sources

- [Next.js Server and Client Components](https://nextjs.org/docs/app/getting-started/server-and-client-components) — component boundary patterns
- [Next.js usePathname docs](https://nextjs.org/docs/app/api-reference/functions/use-pathname) — active route detection
- [Next.js Learn: Navigating](https://nextjs.org/learn/dashboard-app/navigating-between-pages) — NavLinks pattern
- [shadcn/ui Sidebar docs](https://v3.shadcn.com/docs/components/sidebar) — cookie persistence pattern
- [shadcn-ui #9189](https://github.com/shadcn-ui/ui/issues/9189) — Next.js 16 blocking-route issue
- [Next.js blocking-route docs](https://nextjs.org/docs/messages/blocking-route) — cacheComponents interaction
- [DEV Community Active Links](https://dev.to/nikolasbarwicki/highlight-currently-active-link-in-nextjs-13-with-app-router-1eng) — startsWith pattern
- [Medium shadcn sidebar](https://medium.com/@enayetflweb/building-a-dynamic-sidebar-with-shadcn-ui-59ff58482988) — active state integration

## Implications

The component tree is clear: Server Component layout → SidebarProvider (client, children slot) → AppSidebar (client) + SidebarInset({children}). For Next.js 16, avoid `cookies()` in root layout — use client-side localStorage via existing `use-persisted-state` hook or wrap in Suspense. The app already has the hook.

## Open Questions

- Is `cacheComponents` enabled in our Next.js 16 config? Determines if cookie workaround is needed.
- Should we use a route group `(app)/layout.tsx` for the sidebar shell, or modify root layout directly?
