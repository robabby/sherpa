# Studio Shareable Research — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add public share links for research documents — `/s/<token>` renders a standalone page with DocRenderer, no Studio chrome, no auth required.

**Architecture:** Signed HMAC tokens (base64url payload + hex signature) in `@sherpa/studio-core`, a `(share)` Next.js route group with its own minimal layout, and a copy-to-clipboard button in the existing research viewer. The token module uses `node:crypto`, the share page is a server component, and the only client component is the share button.

**Tech Stack:** Next.js 16 (App Router, server components), `node:crypto` HMAC-SHA256, `react-markdown` + `remark-gfm` (via existing DocRenderer), shadcn/ui Button, Tailwind v4, vitest.

**References:**
- Proposal: `docs/initiatives/studio-shareable-research/proposal.md`
- Design: `docs/initiatives/studio-shareable-research/design.md`
- Prototype: `docs/initiatives/studio-shareable-research/prototype.html`

---

## Session 1: Token Module + Public Route + Share Page

### Task 1: Share Token Module — Tests

**Files:**
- Create: `packages/studio-core/src/__tests__/share-tokens.test.ts`

**Step 1: Write the test file**

```typescript
import { describe, it, expect } from "vitest"
import { generateShareToken, resolveShareToken } from "../share-tokens"

const SECRET = "test-secret-for-share-tokens"

describe("generateShareToken", () => {
  it("returns a string with payload and signature separated by dot", () => {
    const token = generateShareToken(SECRET, "sherpa", "heartbeat/2026-03-21.md")
    expect(token).toContain(".")
    const parts = token.split(".")
    expect(parts).toHaveLength(2)
    expect(parts[0].length).toBeGreaterThan(0)
    expect(parts[1]).toHaveLength(16) // 8 bytes hex
  })

  it("is deterministic — same inputs produce same token", () => {
    const a = generateShareToken(SECRET, "sherpa", "report.md")
    const b = generateShareToken(SECRET, "sherpa", "report.md")
    expect(a).toBe(b)
  })

  it("produces different tokens for different paths", () => {
    const a = generateShareToken(SECRET, "sherpa", "report-a.md")
    const b = generateShareToken(SECRET, "sherpa", "report-b.md")
    expect(a).not.toBe(b)
  })

  it("produces different tokens for different projects", () => {
    const a = generateShareToken(SECRET, "sherpa", "report.md")
    const b = generateShareToken(SECRET, "wavepoint", "report.md")
    expect(a).not.toBe(b)
  })

  it("produces different tokens for different secrets", () => {
    const a = generateShareToken("secret-1", "sherpa", "report.md")
    const b = generateShareToken("secret-2", "sherpa", "report.md")
    expect(a).not.toBe(b)
  })
})

describe("resolveShareToken", () => {
  it("resolves a valid token back to project and relativePath", () => {
    const token = generateShareToken(SECRET, "sherpa", "heartbeat/2026-03-21.md")
    const result = resolveShareToken(SECRET, token)
    expect(result).toEqual({
      project: "sherpa",
      relativePath: "heartbeat/2026-03-21.md",
    })
  })

  it("returns null for a tampered payload", () => {
    const token = generateShareToken(SECRET, "sherpa", "report.md")
    const [, sig] = token.split(".")
    const tamperedPayload = Buffer.from("sherpa:evil.md").toString("base64url")
    const result = resolveShareToken(SECRET, `${tamperedPayload}.${sig}`)
    expect(result).toBeNull()
  })

  it("returns null for a tampered signature", () => {
    const token = generateShareToken(SECRET, "sherpa", "report.md")
    const [payload] = token.split(".")
    const result = resolveShareToken(SECRET, `${payload}.0000000000000000`)
    expect(result).toBeNull()
  })

  it("returns null for garbage input", () => {
    expect(resolveShareToken(SECRET, "not-a-token")).toBeNull()
    expect(resolveShareToken(SECRET, "")).toBeNull()
    expect(resolveShareToken(SECRET, "...")).toBeNull()
  })

  it("returns null for wrong secret", () => {
    const token = generateShareToken(SECRET, "sherpa", "report.md")
    const result = resolveShareToken("wrong-secret", token)
    expect(result).toBeNull()
  })

  it("handles paths with special characters", () => {
    const path = "job-market/2026-03-21-0900-competitive-analysis.md"
    const token = generateShareToken(SECRET, "sherpa", path)
    const result = resolveShareToken(SECRET, token)
    expect(result).toEqual({ project: "sherpa", relativePath: path })
  })
})
```

**Step 2: Run tests to verify they fail**

Run: `cd packages/studio-core && pnpm exec vitest run src/__tests__/share-tokens.test.ts`
Expected: FAIL — `../share-tokens` module not found

---

### Task 2: Share Token Module — Implementation

**Files:**
- Create: `packages/studio-core/src/share-tokens.ts`
- Modify: `packages/studio-core/src/index.ts`

**Step 3: Write the implementation**

```typescript
// packages/studio-core/src/share-tokens.ts
import { createHmac } from "node:crypto"

const SEPARATOR = "."

/**
 * Generate a deterministic, tamper-proof share token for a research document.
 *
 * Token format: {base64url(project:relativePath)}.{hmac-hex-16}
 * The payload is reversible; the HMAC signature prevents forgery.
 */
export function generateShareToken(
  secret: string,
  project: string,
  relativePath: string,
): string {
  const payload = `${project}:${relativePath}`
  const encoded = Buffer.from(payload).toString("base64url")
  const sig = createHmac("sha256", secret)
    .update(payload)
    .digest("hex")
    .slice(0, 16)
  return `${encoded}${SEPARATOR}${sig}`
}

/**
 * Resolve a share token back to its project and file path.
 * Returns null if the token is malformed, tampered, or signed with a different secret.
 */
export function resolveShareToken(
  secret: string,
  token: string,
): { project: string; relativePath: string } | null {
  const dotIndex = token.lastIndexOf(SEPARATOR)
  if (dotIndex <= 0) return null

  const encoded = token.slice(0, dotIndex)
  const sig = token.slice(dotIndex + 1)

  let payload: string
  try {
    payload = Buffer.from(encoded, "base64url").toString("utf-8")
  } catch {
    return null
  }

  const expectedSig = createHmac("sha256", secret)
    .update(payload)
    .digest("hex")
    .slice(0, 16)

  if (sig !== expectedSig) return null

  const colonIndex = payload.indexOf(":")
  if (colonIndex === -1) return null

  return {
    project: payload.slice(0, colonIndex),
    relativePath: payload.slice(colonIndex + 1),
  }
}
```

**Step 4: Export from studio-core barrel**

Add to `packages/studio-core/src/index.ts`, in the "I/O" section after the `research-report` export:

```typescript
export * from "./share-tokens"
```

**Step 5: Run tests to verify they pass**

Run: `cd packages/studio-core && pnpm exec vitest run src/__tests__/share-tokens.test.ts`
Expected: All 11 tests PASS

**Step 6: Run full studio-core test suite for regressions**

Run: `cd packages/studio-core && pnpm exec vitest run`
Expected: All tests PASS

**Step 7: Commit**

```bash
git add packages/studio-core/src/share-tokens.ts packages/studio-core/src/__tests__/share-tokens.test.ts packages/studio-core/src/index.ts
git commit -m "feat(studio-core): add share token generation and resolution

HMAC-SHA256 signed tokens for shareable research document links.
Token format: base64url(project:path).hmac-hex-16"
```

---

### Task 3: Middleware — Allow Public Share Routes

**Files:**
- Modify: `apps/studio/src/middleware.ts:3-6`

**Step 8: Add `/s` to PUBLIC_PATHS**

In `apps/studio/src/middleware.ts`, add `"/s"` to the `PUBLIC_PATHS` array:

```typescript
const PUBLIC_PATHS = [
  "/auth",
  "/api/auth",
  "/s",
]
```

**Step 9: Commit**

```bash
git add apps/studio/src/middleware.ts
git commit -m "feat(studio): add /s to public paths for share links"
```

---

### Task 4: Share Layout

**Files:**
- Create: `apps/studio/src/app/(share)/layout.tsx`

**Step 10: Create the minimal share layout**

This layout provides the page shell for share routes — no sidebar, no header, no auth.
The root layout (`app/layout.tsx`) already provides fonts, dark mode, and `TooltipProvider`.
This layout only adds the centered content area and branded footer.

```tsx
// apps/studio/src/app/(share)/layout.tsx

export default function ShareLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <main className="flex-1">{children}</main>
      <footer className="flex items-center justify-center gap-2 pb-8 pt-6">
        <span className="text-sm text-[var(--color-gold-muted)]/50">
          <span className="font-display">Sherpa</span> Studio
        </span>
      </footer>
    </div>
  )
}
```

Key decisions:
- `bg-background` uses the semantic token (obsidian in dark mode) — no manual `dark:` override needed (shadcn rule: no manual dark mode overrides)
- `flex min-h-screen flex-col` ensures footer pins to bottom even on short documents
- `font-display` on "Sherpa" uses Fraunces (inherited from root layout font vars)
- No `"use client"` — this is a server component (no state, no event handlers)

**Step 11: Commit**

```bash
git add apps/studio/src/app/\(share\)/layout.tsx
git commit -m "feat(studio): add minimal share layout with branded footer"
```

---

### Task 5: Share Page — Server Component

**Files:**
- Create: `apps/studio/src/app/(share)/s/[token]/page.tsx`

**Step 12: Create the share page**

This is the core of the feature — a server component that resolves the token, reads the markdown file, and renders it with DocRenderer.

```tsx
// apps/studio/src/app/(share)/s/[token]/page.tsx
import type { Metadata } from "next"
import { notFound } from "next/navigation"
import fs from "node:fs"
import path from "node:path"
import matter from "gray-matter"

import { resolveShareToken } from "@sherpa/studio-core"
import { DocRenderer } from "@/components/studio/doc-renderer"
import { env } from "@/env"
import { getProject } from "@/lib/studio"
import { Separator } from "@/components/ui/separator"

interface SharePageProps {
  params: Promise<{ token: string }>
}

function loadSharedDocument(token: string) {
  const resolved = resolveShareToken(env.BETTER_AUTH_SECRET, token)
  if (!resolved) return null

  const project = getProject(resolved.project)
  if (!project) return null

  const absPath = path.join(
    project.root,
    ".sherpa",
    "research",
    resolved.relativePath,
  )

  // Path traversal guard: ensure resolved path is inside the research directory
  const researchDir = path.join(project.root, ".sherpa", "research")
  if (!path.resolve(absPath).startsWith(path.resolve(researchDir))) return null

  if (!fs.existsSync(absPath)) return null

  const raw = fs.readFileSync(absPath, "utf-8")
  const { data, content } = matter(raw)

  const title =
    data.title ??
    content.match(/^#\s+(.+)$/m)?.[1] ??
    path.basename(resolved.relativePath, ".md")

  const body = content.replace(/^#\s+.+\n/, "").trim()

  return { title, data, body }
}

export async function generateMetadata({
  params,
}: SharePageProps): Promise<Metadata> {
  const { token } = await params
  const doc = loadSharedDocument(token)

  if (!doc) {
    return { title: "Not Found | Sherpa Studio" }
  }

  return {
    title: `${doc.title} | Sherpa Studio`,
    description: doc.data.summary ?? undefined,
    openGraph: {
      title: doc.title,
      description: doc.data.summary ?? undefined,
      type: "article",
      publishedTime: doc.data.date ? String(doc.data.date) : undefined,
      siteName: "Sherpa Studio",
    },
    robots: "noindex, nofollow",
  }
}

export default async function SharePage({ params }: SharePageProps) {
  const { token } = await params
  const doc = loadSharedDocument(token)

  if (!doc) notFound()

  return (
    <article className="mx-auto max-w-3xl px-6 py-12">
      <header className="mb-8">
        <h1 className="font-display text-2xl font-semibold text-foreground">
          {doc.title}
        </h1>
        {(doc.data.date || doc.data.category) && (
          <div className="mt-2 flex items-center gap-3">
            {doc.data.date && (
              <span className="font-mono text-xs text-[var(--color-gold-muted)]">
                {String(doc.data.date)}
              </span>
            )}
            {doc.data.date && doc.data.category && (
              <span className="text-[var(--color-gold-muted)]/40">·</span>
            )}
            {doc.data.category && (
              <span className="text-sm text-[var(--color-gold-muted)]/70">
                {String(doc.data.category)}
              </span>
            )}
          </div>
        )}
      </header>
      <Separator className="mb-8 bg-[var(--color-gold)]/15" />
      <DocRenderer content={doc.body} />
      <Separator className="mb-6 mt-12 bg-[var(--color-gold)]/15" />
    </article>
  )
}
```

Key decisions:
- Uses `<Separator>` from shadcn (already installed) instead of raw `<hr>` elements
- Uses `<article>` semantic HTML for the document wrapper
- `loadSharedDocument()` is extracted as a helper used by both `generateMetadata` and the page — avoids duplicate file reads (Next.js deduplicates within a render, but explicit sharing is clearer)
- Path traversal guard prevents `../../` attacks in the token payload
- `py-12` gives more breathing room than the `py-8` in the authenticated viewer (no header consuming vertical space)
- No `"use client"` — entirely a server component
- `robots: "noindex, nofollow"` — share links are for directed sharing, not search

**Step 13: Verify the app builds**

Run: `cd apps/studio && pnpm build`
Expected: Build succeeds with no type errors

**Step 14: Commit**

```bash
git add apps/studio/src/app/\(share\)/s/\[token\]/page.tsx
git commit -m "feat(studio): add public share page for research documents

Server component that resolves HMAC tokens, reads markdown from disk,
and renders with DocRenderer. Includes OG meta tags and path traversal guard."
```

---

### Task 6: Typecheck All Packages

**Step 15: Run typecheck across the monorepo**

Run: `pnpm check`
Expected: All packages pass type checking

If there are type errors, fix them before proceeding.

---

## Session 2: Share Button + Visual Polish + Testing

### Task 7: ShareLinkButton Component

**Files:**
- Create: `apps/studio/src/components/studio/share-link-button.tsx`

**Step 16: Create the share link button**

A client component that copies a share URL to the clipboard with visual feedback.

```tsx
// apps/studio/src/components/studio/share-link-button.tsx
"use client"

import { useState } from "react"
import { Link, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ShareLinkButtonProps {
  shareUrl: string
}

export function ShareLinkButton({ shareUrl }: ShareLinkButtonProps) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    await navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleCopy}
      className={cn(
        "h-7 gap-1.5 px-2 text-sm",
        copied
          ? "text-emerald-500 hover:text-emerald-500"
          : "text-muted-foreground hover:text-foreground",
      )}
    >
      {copied ? (
        <Check data-icon="inline-start" />
      ) : (
        <Link data-icon="inline-start" />
      )}
      {copied ? "Copied!" : "Share"}
    </Button>
  )
}
```

Key decisions:
- Uses `data-icon="inline-start"` on icons per shadcn convention (icons in Button use data-icon, component handles sizing)
- Uses `cn()` for conditional classes per shadcn convention
- Uses `gap-1.5` not `space-x-*` per shadcn convention
- Matches `ResearchRating` visual weight: same `variant="ghost"`, `size="sm"`, `h-7 px-2 text-sm`
- Copied state uses same emerald-500 as the +1 rating button — visual consistency
- `shareUrl` is passed as a prop (computed server-side in the page) — the secret never reaches the client

**Step 17: Commit**

```bash
git add apps/studio/src/components/studio/share-link-button.tsx
git commit -m "feat(studio): add ShareLinkButton component for copy-to-clipboard"
```

---

### Task 8: Add Share Button to Research Viewer

**Files:**
- Modify: `apps/studio/src/app/(studio)/projects/[project]/research/[...slug]/page.tsx`

**Step 18: Import and wire up the share button**

Add two imports at the top of the file:

```typescript
import { generateShareToken } from "@sherpa/studio-core"
import { ShareLinkButton } from "@/components/studio/share-link-button"
import { env } from "@/env"
```

Then, inside the component, after the `rating` variable (line 36), generate the share URL:

```typescript
const shareToken = generateShareToken(
  env.BETTER_AUTH_SECRET,
  projectSlug,
  relativePath,
)
const shareUrl = `${env.BETTER_AUTH_URL}/s/${shareToken}`
```

Then add the `ShareLinkButton` to the title row, after `ResearchRating`:

```tsx
<div className="flex items-center gap-3">
  <h1 className="font-display text-2xl text-foreground">{title}</h1>
  <ResearchRating
    projectSlug={projectSlug}
    filePath={relativePath}
    initialRating={rating}
  />
  <ShareLinkButton shareUrl={shareUrl} />
</div>
```

The full modified file should look like:

```tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

import { generateShareToken } from "@sherpa/studio-core";
import { DocRenderer } from "@/components/studio/doc-renderer";
import { ResearchRating } from "@/components/studio/research-rating";
import { ShareLinkButton } from "@/components/studio/share-link-button";
import { env } from "@/env";
import { getProject } from "@/lib/studio";

export const metadata: Metadata = {
  title: "Research | Studio",
  robots: "noindex, nofollow",
};

export default async function ResearchDetailPage({
  params,
}: {
  params: Promise<{ project: string; slug: string[] }>;
}) {
  const { project: projectSlug, slug: slugParts } = await params;
  const project = getProject(projectSlug);
  if (!project) notFound();

  const relativePath = slugParts.join("/") + ".md";
  const absPath = path.join(project.root, ".sherpa", "research", relativePath);

  if (!fs.existsSync(absPath)) notFound();

  const raw = fs.readFileSync(absPath, "utf-8");
  const { data, content } = matter(raw);
  const title =
    data.title ??
    content.match(/^#\s+(.+)$/m)?.[1] ??
    slugParts[slugParts.length - 1];
  const rating = data.rating === 1 || data.rating === -1 ? (data.rating as 1 | -1) : null;

  const shareToken = generateShareToken(
    env.BETTER_AUTH_SECRET,
    projectSlug,
    relativePath,
  );
  const shareUrl = `${env.BETTER_AUTH_URL}/s/${shareToken}`;

  // Strip leading H1 if present (we render our own)
  const body = content.replace(/^#\s+.+\n/, "").trim();

  return (
    <div className="mx-auto max-w-3xl px-6 py-8">
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <h1 className="font-display text-2xl text-foreground">{title}</h1>
          <ResearchRating
            projectSlug={projectSlug}
            filePath={relativePath}
            initialRating={rating}
          />
          <ShareLinkButton shareUrl={shareUrl} />
        </div>
        {data.date && (
          <p className="mt-1 font-mono text-xs text-muted-foreground">
            {String(data.date)}
          </p>
        )}
        {data.category && (
          <p className="mt-0.5 text-sm text-muted-foreground">
            {String(data.category)}
          </p>
        )}
      </div>
      <DocRenderer content={body} />
    </div>
  );
}
```

**Step 19: Commit**

```bash
git add apps/studio/src/app/\(studio\)/projects/\[project\]/research/\[...slug\]/page.tsx
git commit -m "feat(studio): add share link button to research viewer"
```

---

### Task 9: Build Verification

**Step 20: Typecheck**

Run: `pnpm check`
Expected: PASS

**Step 21: Build the Studio app**

Run: `cd apps/studio && pnpm build`
Expected: Build succeeds

**Step 22: Run studio-core tests**

Run: `cd packages/studio-core && pnpm exec vitest run`
Expected: All tests PASS (including the new share-tokens tests)

---

### Task 10: Manual Testing

**Step 23: Start dev server and test the share flow**

Run: `pnpm dev`

Test sequence:
1. Navigate to a research document in the Studio UI (e.g., `http://localhost:3000/projects/sherpa/research/<any-file>`)
2. Verify the "Share" button appears next to the rating buttons
3. Click "Share" — verify it changes to "Copied!" with a checkmark
4. Open a new incognito/private browser window (no auth session)
5. Paste the copied URL — verify the document renders with:
   - Document title in Fraunces font
   - Date and category metadata
   - Gold separator line
   - Full markdown content rendered by DocRenderer
   - "Sherpa Studio" footer at the bottom
   - No sidebar, no header, no navigation
6. Test an invalid/tampered token URL (e.g., `/s/garbage.token`) — verify 404

**Step 24: Test OG meta tags**

In the incognito window on the share page, view page source and verify:
- `<title>` contains the document title
- `<meta property="og:title">` is set
- `<meta property="og:type">` is "article"
- `<meta name="robots">` is "noindex, nofollow"

**Step 25: Commit all remaining changes (if any polish was needed)**

```bash
git add -A
git commit -m "feat(studio): shareable research documents

Complete implementation of studio-shareable-research initiative:
- HMAC-SHA256 token generation/resolution in @sherpa/studio-core
- Public (share) route group with minimal layout
- Server-rendered share page with OG meta tags
- Share button in existing research viewer"
```

---

## Verification Checklist

Before marking complete, verify:

- [ ] `pnpm check` passes (no type errors)
- [ ] `pnpm build` succeeds (apps/studio builds)
- [ ] `cd packages/studio-core && pnpm exec vitest run` — all tests pass
- [ ] Share button visible in research viewer, copies URL on click
- [ ] Share URL works in incognito (no auth required)
- [ ] Invalid/tampered tokens return 404
- [ ] OG meta tags present in page source
- [ ] Share page has no sidebar, header, or navigation
- [ ] Share page footer shows "Sherpa Studio"
- [ ] DocRenderer renders markdown correctly (headings, tables, code blocks, lists)
