# Iteration 1 — 2026-03-14

## Findings

### Vector 1: Sidebar + Full-Width Coexistence
**Question:** How do developer tools handle pages that need full viewport width alongside a persistent sidebar?
**Full report:** [iteration-1/vector-1-sidebar-fullwidth-coexistence.md](iteration-1/vector-1-sidebar-fullwidth-coexistence.md)

- Universal pattern: sidebar owns width, content gets `flex-1`, per-page `max-w-*` goes inside the content area
- shadcn/ui's `SidebarInset` has no max-width by default — pages opt into constraints individually
- Grafana, Vercel, Linear all use this approach. Route groups are the wrong tool.

**Implications:** Kill criterion #1 (/process full-width) is de-risked. Our existing architecture already follows this pattern.

### Vector 2: Next.js App Router Sidebar Patterns
**Question:** Proven patterns for persistent, collapsible sidebars in Next.js App Router?
**Full report:** [iteration-1/vector-2-nextjs-sidebar-patterns.md](iteration-1/vector-2-nextjs-sidebar-patterns.md)

- Server Component layout → Client Component SidebarProvider (children slot) → Client Component AppSidebar + server-rendered pages
- `usePathname()` + `startsWith` for active route detection
- Next.js 16 cookie persistence issue (#9189) — use localStorage fallback via existing `use-persisted-state` hook

**Implications:** Component tree is clear. The children-slot pattern keeps pages server-rendered despite client wrapper.

### Vector 3: Dashboard Prioritization
**Question:** What do developer tool dashboards show as "needs attention" vs. informational?
**Full report:** [iteration-1/vector-3-dashboard-prioritization.md](iteration-1/vector-3-dashboard-prioritization.md)

- GitHub "My Work" and Linear "Active Issues" both default to action-first, not everything-first
- Linear's triage inbox: nothing enters active workflow without deliberate human review
- Vercel uses anomaly detection (4σ above 24h average), not thresholds
- "All clear" is a success state, not an error — design for inbox zero

**Implications:** Three-tier model (Action Required → Active Work → Context) replaces the 12-panel grid. 5 panels demote to sidebar-only, 3 promote, 4 demote to Tier 3.

### Vector 4: shadcn/ui Sidebar Component
**Question:** Does shadcn/ui have an official sidebar?
**Full report:** [iteration-1/vector-4-shadcn-sidebar-component.md](iteration-1/vector-4-shadcn-sidebar-component.md)

- Yes — official component, 25 sub-components, 16 block templates. sidebar-07 is the closest match.
- CSS variables already defined in our globals.css. Collapsible component already installed.
- Two bugs to patch: isActive default (#9134, one-line fix), cookie persistence (#9189, use localStorage)

**Implications:** Use the official component. No need to build from scratch.

## Synthesis

The sidebar is an engineering task with a known solution — shadcn/ui's official component, flexbox layout, children-slot pattern. The dashboard restructure is a product design task that requires defining Sherpa's "attention" semantics.

The industry consensus is clear: operational dashboards show what needs action, not what exists. GitHub, Linear, Vercel, and Grafana all converge on this. The three-tier model (Action → Active → Context) gives us a concrete framework for deciding which of the 12 current panels survive, promote, or demote.

Kill criterion #1 (process full-width layout) is effectively de-risked by universal flexbox patterns. The two shadcn bugs are minor and have known workarounds.

## Proposals Generated
- Updated `proposal.md` Phase 1 with shadcn sidebar component specifics, known bugs, and keyboard shortcut
- Updated `proposal.md` Phase 2 with research-backed three-tier dashboard model and panel triage

## Open Questions for Next Iteration
1. What are the exact "needs attention" triggers for Sherpa? — defines Tier 1 content (proposal age threshold, task staleness, dispatch failure)
2. Should the dashboard be role-aware? — Planner/Worker/Judge see different Tier 1 priorities (XM Institute principle)
3. Which shadcn sidebar collapse mode: `"icon"` (rail) vs `"offcanvas"`? — affects persistent accessibility vs. content space
4. Where does the StudioHeader go in the new layout shell? — inside flex-1 (scrolls with content) or fixed above (spans full width)?
5. Is `cacheComponents` enabled in our Next.js 16 config? — determines cookie workaround path
