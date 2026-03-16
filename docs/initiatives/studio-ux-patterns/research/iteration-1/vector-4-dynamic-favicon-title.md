# Vector 4: Dynamic Favicon and document.title for App State

**Question:** How do modern web apps implement dynamic favicon/title to reflect app state?
**Agent dispatched:** 2026-03-15

## Findings

### Browser Compatibility

- **Chrome 80+, Edge 80+, Firefox 41+**: Full support for SVG favicons and dynamic swapping. ([caniuse.com](https://caniuse.com/link-icon-svg), 89.74% global)
- **Safari**: SVG favicons only in Safari 26+ (2024). Dynamic swapping historically unreliable — caches aggressively, may not pick up `href` changes.
- **Safari workaround**: Use `replaceChild` instead of just setting `href`:
  ```ts
  const link = document.createElement('link');
  link.rel = 'icon';
  link.href = href;
  faviconEl?.parentNode?.replaceChild(link, faviconEl);
  ```
- **iOS Safari**: SVG favicon support only in Safari 26+.

### Implementation Approaches

1. **Static file swaps** (recommended) — 3-4 pre-built SVG files, swap `<link>` href. Used by Concord (Walmart, 12 state PNGs), codex-ui (red dot PNG for running).
2. **SVG data URIs** — Define SVG strings in JS, use `data:image/svg+xml,` URIs. Avoids HTTP requests, co-locates icons with hook logic. Slightly larger JS bundle.
3. **Canvas rendering** — Fetch SVG, regex-replace colors, render to canvas, convert to data URL. Used by Buildbot. Over-engineered for static states.
4. **Animated** — `requestAnimationFrame` + canvas per frame. Fragile, consumes CPU. Only one real implementation found (useSpinningFavicon). Not used by mature tools.

### SVG Favicon Dynamic Colors

- SVG favicons can embed CSS including `@media (prefers-color-scheme)`. ([CSS-Tricks](https://css-tricks.com/svg-favicons-and-all-the-fun-things-we-can-do-with-them/))
- **Cannot modify external SVG via JS** — SVG loaded as external resource, not inline DOM.
- Must swap files or use data URIs with baked-in colors.

### React Hooks

- **No dominant library.** Space is fragmented.
- **ahooks `useFavicon`** (Alibaba) — queries `link[rel*='icon']`, creates if missing. ([github.com/alibaba/hooks](https://github.com/alibaba/hooks))
- **usehooks-ts `useDocumentTitle`** — captures original title in ref, restores on unmount. ([usehooks-ts.com](https://usehooks-ts.com/react-hook/use-document-title))
- **Recommendation**: Custom hook, ~20 lines. Pattern is too simple for a dependency.

### document.title in Next.js

- **`generateMetadata` is server-only.** No official client-side metadata API in App Router.
- **Must use `document.title` directly** in `useEffect` for dynamic client-side updates.
- Pattern: cache original title, append status, restore on cleanup.
- Convention: `"Status · Page — App"` format. Gmail uses `"Inbox (3) - Gmail"`.

### Performance

- Favicon swaps: no measurable impact. ([Evil Martians](https://evilmartians.com/chronicles/how-to-favicon-in-2021-six-files-that-fit-most-needs))
- `document.title`: negligible — simple string assignment.
- Canvas animation: real CPU cost — the only concern, correctly scoped out.
- **CSP note**: `img-src` must allow `data:` URIs if using data URL approach.

## Sources

- [caniuse: SVG favicons](https://caniuse.com/link-icon-svg)
- [CSS-Tricks: SVG Favicons](https://css-tricks.com/svg-favicons-and-all-the-fun-things-we-can-do-with-them/)
- [Evil Martians: How to Favicon in 2021](https://evilmartians.com/chronicles/how-to-favicon-in-2021-six-files-that-fit-most-needs)
- [MDN: Document.title](https://developer.mozilla.org/en-US/docs/Web/API/Document/title)
- [Next.js: generateMetadata](https://nextjs.org/docs/app/api-reference/functions/generate-metadata)
- [ahooks useFavicon](https://github.com/alibaba/hooks)
- [usehooks-ts useDocumentTitle](https://usehooks-ts.com/react-hook/use-document-title)
- [Buildbot FavIcon.ts](https://github.com/buildbot/buildbot/blob/master/www/ui/src/util/FavIcon.ts)
- [codex-ui running-indicator.ts](https://github.com/hoangdaicntt/codex-ui/blob/main/frontend/src/utils/running-indicator.ts)
- [Concord favicon.ts](https://github.com/walmartlabs/concord/blob/master/console2/src/components/organisms/ProcessActivity/favicon.ts)
- [leereamsnyder: Favicons in 2021](https://www.leereamsnyder.com/blog/favicons-in-2021)

## Implications

1. **Static SVG swaps confirmed as correct approach** — matches industry practice (Concord, codex-ui).
2. **`replaceChild` pattern** more reliable than `href` mutation, especially for Safari.
3. **SVG data URIs** are a clean alternative to separate files — co-locates icons with hook.
4. **Custom hook, ~20 lines** — no dependency needed.
5. **Shape doc's "no animation" decision strongly validated** — only one novelty implementation found.
6. **Cleanup on navigation** essential — `useEffect` return must restore original favicon/title.

## Open Questions

1. Safari 26+ dynamic favicon reliability needs manual testing before committing.
2. SVG data URIs vs. separate files — tradeoff between bundle size and deployment simplicity.
3. Should the Badging API (`navigator.setAppBadge()`) be considered for PWA scenarios later?
