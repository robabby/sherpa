# Iteration 1 — 2026-03-15

## Findings

### Vector 1: cmdk Command Palette Patterns
**Question:** Best practices for building a Cmd+K palette in Next.js with cmdk?
**Full report:** [iteration-1/vector-1-cmdk-command-palette.md](iteration-1/vector-1-cmdk-command-palette.md)

- shadcn/ui `CommandDialog` is the complete foundation — already in our codebase
- Pre-fetch all items on dialog open, let cmdk's `command-score` (by Superhuman) handle client-side fuzzy filtering — our data volume is well within its comfort zone
- `keywords` prop on items enables cross-domain search without display noise
- DIY frecency (~30 lines with localStorage) beats the cmdk-engine dependency at our scale

**Implications:** Session 1 is pure wiring. Server action → flat item list → cmdk groups. No library decisions needed.

### Vector 2: Skeleton Loading Show-Delay and Composition
**Question:** CSS-only show-delay patterns and composable skeleton layouts for Next.js?
**Full report:** [iteration-1/vector-2-skeleton-loading.md](iteration-1/vector-2-skeleton-loading.md)

- Show-delay is ~5 lines of CSS: `animation-fill-mode: both` + `animation-delay: 200ms` hides the skeleton until the delay expires
- Tailwind v4 needs a custom `@theme` animation (no built-in `animation-delay` utility)
- Next.js `loading.tsx` is auto-wrapped in Suspense, is a Server Component, and keeps sibling layouts visible
- Minimum display time not worth implementing — React has no stable API, show-delay alone prevents flicker

**Implications:** The entire skeleton pattern is a CSS animation definition + three layout templates + per-route loading.tsx files. Half a session.

### Vector 3: Functional Empty States in Developer Tools
**Question:** What copy/action patterns work in developer-facing tools?
**Full report:** [iteration-1/vector-3-functional-empty-states.md](iteration-1/vector-3-functional-empty-states.md)

- Strong convergence across Geist, Primer, Polaris: compound component API, verb+noun titles under 10 words, always provide at least one action
- Developer-specific pattern: CLI commands in monospace as the primary pathway — bridges dashboard and terminal
- Polaris copy rules are the most actionable: action-oriented titles, no articles in buttons, one primary CTA
- NNGroup's key mistake to avoid: blank spaces without messaging

**Implications:** Compound component following shadcn/ui Card convention. CLI command slot is a Studio differentiator.

### Vector 4: Dynamic Favicon and document.title
**Question:** How do modern apps implement dynamic favicon/title for state reflection?
**Full report:** [iteration-1/vector-4-dynamic-favicon-title.md](iteration-1/vector-4-dynamic-favicon-title.md)

- Static SVG favicon swaps are the industry standard — animation is a novelty, not a pattern
- `replaceChild` beats `href` mutation for cross-browser reliability (Safari)
- SVG data URIs co-locate icons with hook logic, avoiding separate file management
- `document.title` must be set directly via `useEffect` — Next.js `generateMetadata` is server-only
- Custom hook ~20 lines — no dependency warranted

**Implications:** Shape doc's design is validated. Static swaps, `replaceChild`, cleanup on unmount.

## Synthesis

The cross-cutting insight: **all four patterns are smaller than they appear.** Each has an established, well-documented approach with minimal implementation choices remaining:

| Pattern | Implementation size | Key decision settled |
|---------|-------------------|---------------------|
| Command palette | Server action + ~100 LOC component | Pre-fetch on open, cmdk handles everything |
| Skeleton loading | 5 lines CSS + 3 templates + N loading.tsx | Show-delay via `animation-fill-mode: both` |
| Empty states | ~60 LOC compound component + copy per page | Compound API, verb+noun titles, CLI slot |
| Favicon/title | ~20 LOC hook + 4 SVG strings | Static swaps via `replaceChild`, data URIs |

The shape doc's 3-session appetite is **generous**. The research suggests each pattern is a half-session or less. This means:

1. **Session 1 can include both command palette AND skeletons** if implementation goes smoothly
2. **Session 2 can include empty states AND favicon/title**
3. **Session 3 becomes buffer/polish** rather than a required session

The most important risk that surfaced: **Safari dynamic favicon reliability.** Safari 26+ added SVG favicon support, but historical behavior was to ignore dynamic changes. Manual testing in Safari is a prerequisite before committing to the favicon pattern.

## Proposals Generated

The existing `proposal.md` and `shape.md` are well-aligned with research findings. No updates needed — the research validates rather than challenges the current design. The key refinements to carry into `/plan-tasks`:

- Use `animation-fill-mode: both` for show-delay (not JS timers)
- Use `replaceChild` for favicon swaps (not `href` mutation)
- Use compound component pattern for EmptyState (matching shadcn Card)
- Pre-fetch all items on palette open (not per-keystroke search)
- Consider SVG data URIs over separate favicon files

## Open Questions for Next Iteration

1. **Safari favicon testing** — Does dynamic `<link rel="icon">` swapping work reliably in Safari 26+? This needs hands-on testing, not more research.
2. **EmptyState CLI command slot** — Should the component have a dedicated `command` prop that renders a copyable monospace block, or use `children` escape hatch? Implementation will decide.
3. **Skeleton template placement** — `apps/studio/src/components/` (page-shape-specific) vs. `packages/studio-ui/` (reusable)? The templates are Studio-specific but could be useful if other apps use the framework.
4. **Command palette item count** — At what point does the flat pre-fetch approach need rethinking? Current estimate: <200 items total across all groups. Monitor as the initiative/task count grows.
