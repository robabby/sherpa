---
status: integrated
initiative: studio-shareable-research
created: 2026-03-21
updated: '2026-03-21'
type: new-plan
risk: additive
targets:
  - apps/studio/src/app/(share)/[token]/page.tsx           # (new file)
  - apps/studio/src/app/(share)/layout.tsx                  # (new file)
  - apps/studio/src/middleware.ts
  - packages/studio-core/src/share-tokens.ts                # (new file)
  - packages/studio-ui/src/share-document-view.tsx          # (new file)
  - apps/studio/src/app/(studio)/projects/[project]/research/[...slug]/page.tsx
dependencies: []
informs:
  - sherpa-website
personas:
  - engineer
  - product-manager
spawned-from: null
---

## Summary

Add public share links for research documents. A share URL (e.g., `studio.sherpa.solar/s/<token>`) opens a standalone page that renders the document using the existing DocRenderer — no sidebar, no header, no navigation. Just the formatted document with Sherpa typography and the gold-on-dark palette. Tokens are generated deterministically from a keyed HMAC so no database is needed and the same document always produces the same link.

## State Snapshot

Research documents are markdown files in `.sherpa/research/` with YAML frontmatter (title, date, category, summary, rating). The research viewer at `apps/studio/src/app/(studio)/projects/[project]/research/[...slug]/page.tsx` (66 lines) reads files with `fs.readFileSync`, parses frontmatter with `gray-matter`, strips the leading H1, and passes the body to `DocRenderer`. It also renders a `ResearchRating` component for +1/-1 voting.

`DocRenderer` (`packages/studio-ui/src/doc-renderer.tsx`, 271 lines) uses `react-markdown` with `remark-gfm` and custom styled components — Fraunces headings in gold, DM Sans body, JetBrains Mono code, gold borders on tables and blockquotes. It accepts a `content` string and an optional `relativePath` for resolving internal `.md` links to Studio URLs.

All Studio routes require authentication. The middleware (`apps/studio/src/middleware.ts`, 69 lines) checks for a Better Auth session cookie and redirects to `/auth/sign-in` if absent. The only public paths are `/auth` and `/api/auth`. The `(studio)` route group layout enforces a second server-side session check and wraps content in `SidebarProvider` + `StudioSidebar` + `StudioShellHeader`.

The root layout (`apps/studio/src/app/layout.tsx`) loads three fonts (Fraunces, DM Sans, JetBrains Mono) as CSS variables and forces dark mode. `TooltipProvider` is the only global wrapper. No `(share)` or `(public)` route group exists today.

## Proposed Changes

### New route group: `(share)`

A new Next.js route group at `apps/studio/src/app/(share)/` that bypasses the studio layout entirely. Contains its own `layout.tsx` that provides only the fonts and design tokens — no sidebar, no header, no command palette, no auth check. The layout includes a minimal footer with "Powered by Sherpa Studio" branding.

The page at `(share)/[token]/page.tsx` is a server component that:
- Decodes the share token to resolve the project and file path
- Reads the markdown file from disk (same `gray-matter` + `fs.readFileSync` pattern as the existing viewer)
- Renders the document title, date/category metadata, and `DocRenderer` output in a centered, max-width container
- Sets OG meta tags from frontmatter (title, description from `summary`, date) for rich link previews
- Returns 404 for invalid or tampered tokens

### Token generation: `studio-core/share-tokens.ts`

A small module providing `generateShareToken(project, relativePath)` and `resolveShareToken(token)`. Uses HMAC-SHA256 with `BETTER_AUTH_SECRET` (already required in production) to create a signed, base64url-encoded token that embeds the project slug and file path. The token is deterministic — the same file always produces the same share URL — and tamper-proof without the secret.

No database storage needed. Revocation and per-link access control are explicitly out of scope.

### New component: `ShareDocumentView`

A `studio-ui` component that composes the share page layout: document title, metadata row, `DocRenderer`, and branded footer. Reuses `DocRenderer` directly. Does not include `ResearchRating` (mutations require auth) or `ProvenanceHeader` (internal governance metadata not meaningful to external readers).

### Middleware update

Add `/s` to the `PUBLIC_PATHS` array in `apps/studio/src/middleware.ts` so share routes bypass session cookie checks.

### Share button in existing viewer

Add a "Copy share link" button to the research detail page alongside the existing `ResearchRating` component. Generates the share token client-side (or via a lightweight API route) and copies the full URL to clipboard with visual feedback.

## Rationale

**Why deterministic HMAC tokens over database-backed tokens:** No new infrastructure, no migration, no cleanup. The token is a pure function of the secret + file path. This is the right tradeoff for v1 — revocation and analytics are explicitly out of scope. If those are needed later, a database-backed system can replace the HMAC approach without changing the URL structure.

**Why a separate `(share)` route group:** Next.js route groups are the idiomatic way to apply different layouts to different URL paths. A `(share)` group gets its own layout without the sidebar/header/auth, while `(studio)` keeps its full shell. No conditional logic needed in shared layouts.

**Why dark mode for shared views:** The gold-on-dark palette is the Sherpa Studio identity. External readers see the product as it looks — consistent branding. A light mode variant is a future consideration, not v1 scope.

**Why exclude ProvenanceHeader:** Provenance metadata (ai-generated, awaiting-review, human-verified) is internal governance context. External readers don't have the mental model for these states. The document title, date, and category are sufficient metadata for shared views.

## Dependencies

None. The existing `DocRenderer`, design tokens, and Better Auth secret are all in place.

`informs: sherpa-website` — shareable research links could be embedded in sherpa.solar content to showcase the research process.

## Review Notes

**Open questions:**
- URL prefix: `/s/[token]` is proposed for brevity. Alternative: `/share/[token]` is more readable but longer in URLs. Both work identically.
- Should the share page include a "View in Studio" link that redirects to the authenticated viewer (for logged-in users)?
- Token length: HMAC-SHA256 produces 64 hex chars. Truncating to 16-24 chars reduces URL length while maintaining collision resistance. Worth testing.

**Edge cases:**
- Deleted research files: Token resolves to a path that no longer exists → 404. No cleanup needed since tokens aren't stored.
- Renamed files: Produce a different token. Old links 404. Acceptable for v1.
- `BETTER_AUTH_SECRET` rotation: All existing share links break. Documented trade-off of the HMAC approach.

**Effort:** 2 sessions
**Session breakdown:**
- Session 1: Token module in studio-core, `(share)` route group with layout and page, middleware update, ShareDocumentView component
- Session 2: Share button in research viewer, OG meta tags, visual polish, manual testing on studio.sherpa.solar
