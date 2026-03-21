---
status: integrated
initiative: research-markdown-renderer
created: 2026-03-20
updated: '2026-03-20'
type: new-plan
risk: additive
targets:
  - apps/studio/src/app/(studio)/projects/[project]/research/[...slug]/page.tsx
dependencies: []
spawned-from: multi-project-studio
personas:
  - engineer
  - product-manager
---

## Summary

Replace the `whitespace-pre-wrap` plain-text rendering on the research detail page with the existing `DocRenderer` component. Luna's overnight research reports contain full markdown (headings, bold, lists, links, code blocks, tables) that currently renders as unformatted text. The fix is a single-file import swap — all infrastructure already exists.

## State Snapshot

The research detail page (`apps/studio/src/app/(studio)/projects/[project]/research/[...slug]/page.tsx`, 61 lines) parses markdown files with `gray-matter`, extracts frontmatter, strips the leading H1, then renders the body as plain text:

```tsx
<article className="prose prose-invert prose-sm max-w-none">
  {/* Render as pre-formatted text for now — markdown renderer can be added later */}
  <div className="whitespace-pre-wrap text-sm text-foreground/90 leading-relaxed">
    {body}
  </div>
</article>
```

The comment itself marks this as a known TODO.

Meanwhile, `DocRenderer` (`packages/studio-ui/src/doc-renderer.tsx`, 271 lines) is a mature `"use client"` component using `react-markdown` + `remark-gfm` with custom styled overrides for headings, links, lists, tables, code blocks, blockquotes, and images. It's already used on 5 other Studio pages (docs viewer, conventions, skills, process/initiatives) via the `@/components/studio/doc-renderer` re-export. Both `react-markdown` and `remark-gfm` are existing dependencies.

## Proposed Changes

### `apps/studio/` — Research detail page

**`page.tsx`**: Import `DocRenderer` from `@/components/studio/doc-renderer`. Replace the `<article>` wrapper containing the `whitespace-pre-wrap` div with `<DocRenderer content={body} />`. Remove the now-unused `prose` classes. The page remains a server component — `DocRenderer` is a client component that Next.js handles at the boundary.

That's it. One file, one import, one component swap.

## Rationale

**Why `DocRenderer` over alternatives:**
- Already exists, battle-tested across 5 pages, styled to match Studio's design tokens (gold/copper theme, Cormorant Garamond headings)
- Handles GFM tables, link resolution, inline code detection — all features Luna's research reports use
- Zero new dependencies

**Why not a new component or `@tailwindcss/typography`:**
- YAGNI. `DocRenderer` already does everything needed. Adding Typography plugin or building something new would be pure waste.

**Why not scope this broader (shared prose component, MDX, etc.):**
- The shared component already exists. The only gap is that the research page doesn't use it yet.

## Dependencies

`spawned-from: multi-project-studio` — this was identified as a seed in the multi-project-studio activity log (line 24). No blocking dependencies.

## Review Notes

- **Server/Client boundary**: The research page is a server component. `DocRenderer` is `"use client"`. This is standard Next.js — server components can render client components. The `body` string is passed as a prop across the boundary.
- **`relativePath` prop**: `DocRenderer` accepts an optional `relativePath` for resolving relative `.md` links to Studio URLs. Research files live at `.sherpa/research/<category>/<date>.md` which won't have relative doc links, so this prop can be omitted initially. If needed later, it's a one-line addition.
- **`prose` classes**: The current `prose prose-invert prose-sm` wrapper is inert (no HTML to style). `DocRenderer` brings its own styling via component overrides, so the `<article>` wrapper with prose classes should be removed to avoid style conflicts.

**Effort:** 1 session (partial — this is a 15-minute change)
**Session breakdown:**
- Session 1: Import `DocRenderer`, replace the plain-text div, verify rendering with a real research file, done.
