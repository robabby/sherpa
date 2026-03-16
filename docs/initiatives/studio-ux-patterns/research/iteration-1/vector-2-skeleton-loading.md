# Vector 2: Skeleton Loading Show-Delay and Composition

**Question:** What are the best skeleton loading patterns for Next.js apps, specifically show-delay and composable layouts?
**Agent dispatched:** 2026-03-15

## Findings

### CSS-Only Show-Delay

- **The pattern**: `opacity: 0` + `animation-delay` + `animation-fill-mode: both`. The `both` fill mode applies the first keyframe (opacity: 0) during the delay, then holds final values after completion. No JavaScript needed. ([MDN: animation-fill-mode](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/animation-fill-mode))

- **Mitch Gavan's technique** (widely referenced): skeleton is "always there" in the DOM but invisible for the first N milliseconds via dual animations with shared delay and `fill-mode: forwards`. ([mitchgavan.com](https://mitchgavan.com/delay-loading-spinners-appearance/))

- **For Tailwind v4**: No built-in `animation-delay` utility. Define custom animation in `@theme`:
  ```css
  @theme {
    --animate-skeleton-fade: skeleton-fade 150ms ease-out 200ms both;
    @keyframes skeleton-fade { from { opacity: 0; } to { opacity: 1; } }
  }
  ```
  Then use `animate-skeleton-fade` as a class. ([tailwindcss.com/docs/animation](https://tailwindcss.com/docs/animation))

### Next.js loading.tsx

- **loading.tsx is auto-wrapped in `<Suspense>`** by Next.js. Renders instantly as static HTML. ([nextjs.org/docs/app/api-reference/file-conventions/loading](https://nextjs.org/docs/app/api-reference/file-conventions/loading))
- **Server Component by default** — no `"use client"` needed.
- **Sibling layout stays visible** — sidebar, header remain. Skeletons should NOT include the app shell.
- **Keep fallbacks lightweight** — heavy components in loading.tsx defeat the purpose.
- **No loading.tsx for layouts** — only for pages. Layout loading needs manual Suspense.
- **loading.tsx applies to entire route segment** — for granular control, use manual `<Suspense>` within the page.

### Show-Delay + Minimum Display Time

- **Vercel's guideline**: 150-300ms show-delay, 300-500ms minimum display. ([vercel.com/design/guidelines](https://vercel.com/design/guidelines))
- **React has no `minDuration` for Suspense** — requested in [facebook/react#17351](https://github.com/facebook/react/issues/17351), never shipped.
- **In practice, show-delay alone solves flicker.** If skeleton never appears for fast loads (<200ms), minimum display time is less critical. The CSS fade-in duration (150ms) provides a natural minimum.
- **Productboard's threshold**: 300ms cutoff for showing any loading indicator. ([Medium](https://medium.com/productboard-engineering/%EF%B8%8F-spinners-versus-skeletons-in-the-battle-of-hasting-b51b9c6574ef))

### Composable Skeleton Layouts

- **Match grid configuration** between skeleton and actual content (same `grid-cols`, same `gap`). This prevents CLS. ([freecodecamp.org](https://www.freecodecamp.org/news/the-nextjs-15-streaming-handbook/))
- Three templates are sufficient: split-pane, card-grid, single-column.
- **shadcn Skeleton** is just `<div className="animate-pulse rounded-md bg-accent" />` — composition via `className` for width/height.

### Skeleton-to-Content Transition

- **Hard swap is correct** — React Suspense removes fallback from DOM and replaces with resolved content. No built-in crossfade.
- If ever needed: `AnimatePresence` from Framer Motion can wrap Suspense boundaries. Design-system concern, not current scope.

## Sources

- [Vercel Web Interface Guidelines](https://vercel.com/design/guidelines)
- [Vercel Geist Skeleton](https://vercel.com/geist/skeleton)
- [Mitch Gavan: Delay Loading Spinners](https://mitchgavan.com/delay-loading-spinners-appearance/)
- [Ben Nadel: CSS Animation Delays](https://www.bennadel.com/blog/3711-delaying-loading-indicators-using-css-animations-in-angular-9-0-0-next-14.htm)
- [Kent C. Dodds / egghead: CSS Transitions](https://egghead.io/lessons/react-use-css-transitions-to-avoid-a-flash-of-loading-state)
- [dev.to/tigt: Skeleton Screens but Fast](https://dev.to/tigt/skeleton-screens-but-fast-48f1)
- [Next.js: loading.js](https://nextjs.org/docs/app/api-reference/file-conventions/loading)
- [FreeCodeCamp: Next.js Streaming Handbook](https://www.freecodecamp.org/news/the-nextjs-15-streaming-handbook/)
- [React Issue #17351](https://github.com/facebook/react/issues/17351)
- [Tailwind CSS Animation](https://tailwindcss.com/docs/animation)
- [shadcn/ui Skeleton](https://ui.shadcn.com/docs/components/radix/skeleton)
- [MDN: animation-fill-mode](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/animation-fill-mode)

## Implications

1. **Show-delay is ~5 lines of CSS** — define animation in `@theme`, apply wrapper class on loading.tsx root div.
2. **Three skeleton templates** cover all Studio page archetypes. They should live in `apps/studio/` (page-shape-specific).
3. **SacredSpinner can remain** for non-page contexts (buttons, inline). Migration is page-level only.
4. **Minimum display time not worth implementing** — show-delay handles the flicker case, no stable React API exists.

## Open Questions

1. Should show-delay animation replace `animate-pulse` or layer on top? (Fade in → then pulse, or fade in → static?)
2. Do skeleton templates belong in `apps/studio/src/components/` or `packages/studio-ui/`?
3. Does Tailwind v4 `@theme` correctly handle `animation-fill-mode: both` in the shorthand?
