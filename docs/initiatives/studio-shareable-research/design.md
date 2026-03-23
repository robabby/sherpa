---
designed: 2026-03-21
type: both
components-new: 2
components-modified: 1
files-planned: 7
---

## Overview

Design for [studio-shareable-research](proposal.md) — public share links for research documents. Covers the token system, public route group, share page UI, and the share button in the existing viewer.

## Architecture

### Data Models

**Share token** — a signed, self-contained string encoding the project slug and file path. No new database tables or persistent state.

```typescript
// packages/studio-core/src/share-tokens.ts

/**
 * Token format: {base64url(project:relativePath)}.{hmac-hex-16}
 *
 * The base64url portion is the payload (reversible).
 * The HMAC portion is the signature (verifiable with the secret).
 * 16 hex chars = 8 bytes of HMAC — sufficient for anti-guessing on share links.
 */

export function generateShareToken(
  secret: string,
  project: string,
  relativePath: string,
): string

export function resolveShareToken(
  secret: string,
  token: string,
): { project: string; relativePath: string } | null
```

Uses `node:crypto` `createHmac("sha256", secret)`. The secret is `BETTER_AUTH_SECRET` — already required in production, already available via `env.ts`. No new env vars.

**Why base64url + HMAC instead of just HMAC:** Pure HMAC is a one-way hash — you can't recover the input from the output. By encoding the payload in the token itself and appending the HMAC as a signature, the server can decode the payload and verify its integrity without any database lookup. The HMAC prevents forging tokens for arbitrary file paths.

**Token length:** A typical token for `sherpa:heartbeat/2026-03-21-0900-competitive-analysis.md` is ~90 characters. Acceptable for share URLs.

### Component Tree

```
(share)/layout.tsx              ← Minimal: background + footer only
  └─ s/[token]/page.tsx         ← Server component: token resolution + document rendering
       ├─ <h1>                  ← Document title (from frontmatter or H1)
       ├─ <metadata row>       ← Date + category (from frontmatter)
       └─ <DocRenderer>        ← Existing component, reused as-is
```

No new studio-ui component needed. The proposal suggested `ShareDocumentView` but the composition is simple enough to live in the page file — it's used exactly once and is a server component (can't be in studio-ui which is `"use client"`).

### Data Flow

**Generating a share link (existing research viewer):**

```
ResearchDetailPage (server)
  ├─ reads project + relativePath from route params
  ├─ calls generateShareToken(env.BETTER_AUTH_SECRET, project, relativePath)
  ├─ constructs full URL: `${BETTER_AUTH_URL}/s/${token}`
  └─ passes shareUrl string to ShareLinkButton (client component)

ShareLinkButton (client)
  └─ onClick: navigator.clipboard.writeText(shareUrl) + visual feedback
```

Token generation happens server-side in the page component — the secret never reaches the client. The client component receives only the pre-computed share URL as a prop.

**Resolving a share link (public share page):**

```
GET /s/{token}
  │
  ├─ middleware.ts: /s is in PUBLIC_PATHS → skip auth
  │
  └─ s/[token]/page.tsx (server component):
       ├─ resolveShareToken(env.BETTER_AUTH_SECRET, token) → { project, relativePath } | null
       ├─ null → notFound()
       ├─ getProject(project) → project root
       ├─ fs.readFileSync(project.root/.sherpa/research/relativePath)
       ├─ matter(raw) → { data, content }
       ├─ generateMetadata() → OG tags from frontmatter
       └─ render: title + metadata + DocRenderer(content)
```

### Integration Points

| Existing code | Change | Reason |
|---------------|--------|--------|
| `apps/studio/src/middleware.ts` | Add `"/s"` to `PUBLIC_PATHS` | Share routes must bypass auth |
| `apps/studio/src/app/(studio)/projects/[project]/research/[...slug]/page.tsx` | Import and render `ShareLinkButton`, pass computed `shareUrl` | Share button in existing viewer |
| `packages/studio-core/src/index.ts` | Add `export * from "./share-tokens"` | Expose token functions to the app |
| `apps/studio/src/app/layout.tsx` | No changes | Root layout already provides fonts, dark mode, TooltipProvider — shared by both `(studio)` and `(share)` route groups |

**DocRenderer in share context:** DocRenderer resolves `.md` references to Studio URLs (e.g., `/docs/rules/foo`). On the share page, these links will redirect to the auth sign-in page for unauthenticated users. This is acceptable for v1 — the document content renders correctly, and internal cross-references are a Studio feature. No modifications to DocRenderer needed.

### File Plan

**New files (4):**

| File | Purpose |
|------|---------|
| `packages/studio-core/src/share-tokens.ts` | `generateShareToken()` and `resolveShareToken()` using HMAC-SHA256 |
| `apps/studio/src/app/(share)/layout.tsx` | Minimal layout: sets background, renders children + branded footer |
| `apps/studio/src/app/(share)/s/[token]/page.tsx` | Share page: token resolution, file reading, metadata, DocRenderer |
| `apps/studio/src/components/studio/share-link-button.tsx` | Client component: copy share URL to clipboard with visual feedback |

**Modified files (3):**

| File | Change |
|------|--------|
| `packages/studio-core/src/index.ts` | Add `export * from "./share-tokens"` |
| `apps/studio/src/middleware.ts` | Add `"/s"` to `PUBLIC_PATHS` array |
| `apps/studio/src/app/(studio)/projects/[project]/research/[...slug]/page.tsx` | Import `ShareLinkButton`, generate token, pass `shareUrl` prop |

## UI Design

### Share Page Layout

The share page is a full-page document reader with no chrome. Structure:

```
┌──────────────────────────────────────────────────┐
│                                                  │
│              [document title]                    │  ← Fraunces, 2xl, gold
│              Mar 21, 2026 · Competitive Analysis │  ← mono date + sans category
│                                                  │
│              ─────────────────                   │  ← gold/15 separator
│                                                  │
│              [DocRenderer output]                │  ← Full markdown rendering
│              ...                                 │
│              ...                                 │
│                                                  │
│              ─────────────────                   │  ← gold/15 separator
│                                                  │
│              ☀ Sherpa Studio                      │  ← Subtle footer, gold-muted
│                                                  │
└──────────────────────────────────────────────────┘

Background: var(--background) = #08080a (obsidian)
Content: max-w-3xl mx-auto px-6 py-12
```

Matches the existing research viewer's `max-w-3xl px-6 py-8` container but with more vertical padding (`py-12`) since there's no header consuming space.

### Share Button in Research Viewer

Added to the title row alongside the existing `ResearchRating` component:

```
[document title] [+1] [-1] [🔗 Share]
```

The button:
- Default state: `Link` icon + "Share" text, ghost variant, muted foreground
- Click: copies URL, text changes to "Copied!" with a checkmark icon for 2 seconds, then resets
- Uses shadcn `Button` with `ghost` variant matching the `ResearchRating` styling

### OG Meta Tags

The share page generates dynamic metadata for rich link previews:

```typescript
export async function generateMetadata({ params }): Promise<Metadata> {
  // ... resolve token, read frontmatter ...
  return {
    title: data.title ?? "Research | Sherpa Studio",
    description: data.summary ?? undefined,
    openGraph: {
      title: data.title,
      description: data.summary,
      type: "article",
      publishedTime: data.date ? String(data.date) : undefined,
    },
    robots: "noindex, nofollow",  // Share links are unlisted, not indexed
  }
}
```

## Decisions

### Token lives in studio-core, not in the app

**Decision:** `share-tokens.ts` lives in `packages/studio-core/` rather than `apps/studio/src/lib/`.

**Why:** The token format is a domain concept — it defines how share links work across any Sherpa Studio deployment. Keeping it in studio-core means it's testable independently, available to the MCP server (future: "generate share link" tool), and follows the existing pattern where domain logic lives in packages.

**Alternatives rejected:**
- `apps/studio/src/lib/share-tokens.ts` — would work but couples the token logic to the Next.js app. If the MCP server ever needs to generate share links, it couldn't reuse this.

### No separate ShareDocumentView component

**Decision:** The share page composition lives in the route file, not as a reusable studio-ui component.

**Why:** The composition is trivial (title + metadata + DocRenderer + footer), used exactly once, and is a server component. studio-ui components are `"use client"` — a server-component wrapper would be a pattern break. If share pages expand to other document types, extract at that point.

### robots: noindex on share pages

**Decision:** Share pages set `robots: "noindex, nofollow"` — discoverable via direct link but not crawled.

**Why:** Research documents are internal working artifacts, not public content. Share links are for directed sharing (Slack, email, meetings), not SEO. This matches the existing research viewer's robots setting.

## Open Questions

- **Footer branding:** "Sherpa Studio" vs "sherpa.solar" vs Sherpa logo mark? Deferred to implementation — start with text, iterate visually.
- **Token in URL bar:** The base64url portion of the token is decodable (shows project:path). This leaks internal file structure. Acceptable for v1 since the documents themselves are being shared intentionally. If this matters later, switch to encrypted tokens.
