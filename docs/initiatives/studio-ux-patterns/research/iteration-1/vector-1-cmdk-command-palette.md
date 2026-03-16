# Vector 1: cmdk Command Palette Patterns

**Question:** What are the best practices for building a command palette (Cmd+K) in a Next.js app using cmdk?
**Agent dispatched:** 2026-03-15

## Findings

- **shadcn/ui provides `CommandDialog`** wrapping cmdk in Radix Dialog. Standard pattern: `useState` for open/closed + `useEffect` keydown listener. Our codebase already has this at `apps/studio/src/components/ui/command.tsx`. ([shadcn/ui docs](https://ui.shadcn.com/docs/components/radix/command))

- **Standard Cmd+K hook**: `useEffect` with `keydown` handler checking `(e.metaKey || e.ctrlKey) && e.key === 'k'`, calling `e.preventDefault()` to suppress browser default (Chrome address bar). Universal across implementations.

- **Hybrid data loading**: Static navigation items render immediately. Server-fetched items (initiatives, tasks) load async on dialog open. For bounded datasets (<2,000 items), pre-fetch everything and let cmdk filter client-side with `shouldFilter={true}` (default).

- **cmdk uses `command-score` (by Superhuman)** for fuzzy filtering: exact match = 1.0, case mismatch = 0.9999x, prefix = 0.99x, word-jump = ~0.9x, character-jump = ~0.3x. Works well out of the box.

- **`keywords` prop** on `CommandItem` acts as search aliases without affecting display. Useful for cross-domain matching.

- **Known pitfall**: cmdk issue #267 — `CommandItem` doesn't re-render on async data changes. Workaround: use a key on `Command` that changes with data.

- **cmdk vs kbar**: cmdk wins for our case — already installed via shadcn, headless/unstyled, 8KB vs 12KB. kbar's action registry is convenient but reproducible in ~30 lines.

- **Frecency**: cmdk has no built-in support. cmdk-engine (~4KB) adds it, or DIY with `{ id, count, lastUsed }` in localStorage. For our scale, DIY is simpler.

- **Nested pages pattern**: Selecting an item can push a sub-page (e.g., initiative → its tasks). Managed via `pages` state array with backspace to pop.

## Sources

- [shadcn/ui Command docs](https://ui.shadcn.com/docs/components/radix/command)
- [cmdk repo](https://cmdk.paco.me/)
- [cmdk GitHub](https://github.com/pacocoursey/cmdk)
- [command-score](https://github.com/superhuman/command-score)
- [cmdk issue #267](https://github.com/pacocoursey/cmdk/issues/267)
- [cmdk-engine](https://libraries.io/npm/cmdk-engine)
- [reactlibs.dev cmdk guide](https://reactlibs.dev/articles/command-k-mastery-cmdk-react/)
- [parcoagane.it cmdk guide](https://www.parcoagane.it/cmdk-react-guide-build-a-fast-accessible-command-palette-from-scratch/)
- [SaaSHub cmdk vs kbar](https://www.saashub.com/compare-react-cmdk-vs-kbar)
- [Superhuman command palette blog](https://blog.superhuman.com/how-to-build-a-remarkable-command-palette/)

## Implications

1. **Foundation is complete** — `command.tsx` has everything needed. Implementation is wiring, not building.
2. **Pre-fetch on open** is the right strategy — our data volume (dozens of items per group) is well within cmdk's comfort zone.
3. **Server action returning flat item list** is the cleanest pattern — one fetch, cmdk handles filtering.
4. **DIY frecency** over cmdk-engine — fewer lines than the dependency for our scale.
5. **`keywords` prop** enables cross-domain search without UI noise.

## Open Questions

1. Should the palette support nested pages (initiative → tasks drill-down) or keep it flat?
2. Should search scope prefixes be supported (`>` for actions, `/` for routes)?
3. Where should the palette component live — `apps/studio/src/components/` or `packages/studio-ui/`?
