# Docs Workspace — Studio UI Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Evolve the /docs page from a static catalog into an interactive two-pane workspace with directoturtle tree navigation, provenance badges, freshness indicators, and a review queue.

**Architecture:** New `getDocTree()` function in studio-core scans docs/ for provenance frontmatter and builds a nested tree. New `DocsWorkspace` component in studio-ui renders the two-pane layout (tree + detail) matching the ProcessWorkspace pattern. Provenance header replaces markdown banner in rendered docs. "Mark as Reviewed" writes frontmatter via server action.

**Tech Stack:** Next.js 16 server components, React 19, Tailwind v4, gray-matter (already a dependency), Fuse.js (existing), @radix-ui/themes (existing)

**Reference:** Read `docs/initiatives/self-documenting-system/design.md` for the full design rationale and component tree.

---

### Task 1: Doc Tree Data Model (studio-core)

**Files:**
- Create: `packages/studio-core/src/doc-tree.ts`
- Modify: `packages/studio-core/src/index.ts`

**Step 1: Create doc-tree.ts with types and getDocTree()**

```typescript
// packages/studio-core/src/doc-tree.ts
import { readFileSync, existsSync, statSync, readdirSync } from "node:fs"
import { join, relative, basename, dirname } from "node:path"
import matter from "gray-matter"
import { resolveProjectPath } from "./content.js"

export type ProvenanceState = "awaiting-review" | "verified" | "stale" | "human-owned"
export type DocType = "architecture" | "decision" | "changelog" | "ux" | "framework"

export interface Provenance {
  docType: DocType | null
  maintainedBy: "self-documenting-system" | "human" | null
  authoredBy: "ai" | "human" | null
  reviewedBy: "ai" | "human" | null
  lastUpdated: string | null
  lastVerified: string | null
  sourceInitiatives: string[]
}

export interface DocTreeNode {
  slug: string
  title: string
  relativePath: string
  provenance: Provenance | null
  state: ProvenanceState
  children: DocTreeNode[]
  lineCount: number
}

export interface DocTreeSection {
  label: string
  nodes: DocTreeNode[]
}

function parseProvenance(frontmatter: Record<string, unknown>): Provenance | null {
  if (!frontmatter["doc-type"] && !frontmatter["maintained-by"]) return null
  return {
    docType: (frontmatter["doc-type"] as DocType) ?? null,
    maintainedBy: (frontmatter["maintained-by"] as Provenance["maintainedBy"]) ?? null,
    authoredBy: (frontmatter["authored-by"] as Provenance["authoredBy"]) ?? null,
    reviewedBy: (frontmatter["reviewed-by"] as Provenance["reviewedBy"]) ?? null,
    lastUpdated: (frontmatter["last-updated"] as string) ?? null,
    lastVerified: (frontmatter["last-verified"] as string) ?? null,
    sourceInitiatives: (frontmatter["source-initiatives"] as string[]) ?? [],
  }
}

function computeState(provenance: Provenance | null): ProvenanceState {
  if (!provenance || provenance.maintainedBy === "human" || !provenance.maintainedBy) {
    return "human-owned"
  }
  if (provenance.reviewedBy === "human") return "verified"
  if (provenance.reviewedBy === null) return "awaiting-review"
  return "awaiting-review"
}

function readDocNode(absolutePath: string, basePath: string): DocTreeNode | null {
  try {
    const content = readFileSync(absolutePath, "utf-8")
    const { data, content: body } = matter(content)
    const rel = relative(basePath, absolutePath)
    const lines = content.split("\n").length
    const titleMatch = body.match(/^#\s+(.+)$/m)
    const title = titleMatch?.[1] ?? basename(rel, ".md")
    const provenance = parseProvenance(data)
    return {
      slug: rel.replace(/\.md$/, "").replace(/\/index$/, ""),
      title,
      relativePath: rel,
      provenance,
      state: computeState(provenance),
      children: [],
      lineCount: lines,
    }
  } catch {
    return null
  }
}

function scanDirectory(dirPath: string, basePath: string): DocTreeNode[] {
  if (!existsSync(dirPath)) return []
  const entries = readdirSync(dirPath, { withFileTypes: true })
  const nodes: DocTreeNode[] = []

  for (const entry of entries) {
    const fullPath = join(dirPath, entry.name)
    if (entry.isDirectory()) {
      const indexPath = join(fullPath, "index.md")
      if (existsSync(indexPath)) {
        const node = readDocNode(indexPath, basePath)
        if (node) {
          node.children = scanDirectory(fullPath, basePath).filter(
            (c) => c.relativePath !== node.relativePath
          )
          nodes.push(node)
        }
      }
    } else if (entry.name.endsWith(".md") && entry.name !== "index.md") {
      const node = readDocNode(fullPath, basePath)
      if (node) nodes.push(node)
    }
  }

  return nodes.sort((a, b) => a.title.localeCompare(b.title))
}

export function getDocTree(): DocTreeSection[] {
  const docsRoot = resolveProjectPath("docs")
  const sections: DocTreeSection[] = []

  // Architecture (directoturtle tree)
  const archNodes = scanDirectory(join(docsRoot, "architecture"), docsRoot)
  if (archNodes.length > 0) sections.push({ label: "Architecture", nodes: archNodes })

  // Decisions (flat files)
  const decisionNodes = scanDirectory(join(docsRoot, "decisions"), docsRoot)
  if (decisionNodes.length > 0) sections.push({ label: "Decisions", nodes: decisionNodes })

  // Changelog
  const changelogPath = join(docsRoot, "changelog.md")
  if (existsSync(changelogPath)) {
    const node = readDocNode(changelogPath, docsRoot)
    if (node) sections.push({ label: "Changelog", nodes: [node] })
  }

  // Framework (top-level docs without provenance)
  const frameworkFiles = ["framework.md", "roadmap.md", "foundation-stone.md"]
  const frameworkNodes = frameworkFiles
    .map((f) => {
      const p = join(docsRoot, f)
      return existsSync(p) ? readDocNode(p, docsRoot) : null
    })
    .filter((n): n is DocTreeNode => n !== null)
  if (frameworkNodes.length > 0) sections.push({ label: "Framework", nodes: frameworkNodes })

  // UX
  const uxNodes = scanDirectory(join(docsRoot, "ux"), docsRoot)
  if (uxNodes.length > 0) sections.push({ label: "UX", nodes: uxNodes })

  return sections
}

export function getDocContent(slug: string): { content: string; relativePath: string; provenance: Provenance | null } | null {
  const docsRoot = resolveProjectPath("docs")

  // Try: docs/<slug>.md
  const directPath = join(docsRoot, slug + ".md")
  if (existsSync(directPath)) {
    const raw = readFileSync(directPath, "utf-8")
    const { data, content } = matter(raw)
    return { content, relativePath: "docs/" + slug + ".md", provenance: parseProvenance(data) }
  }

  // Try: docs/<slug>/index.md
  const indexPath = join(docsRoot, slug, "index.md")
  if (existsSync(indexPath)) {
    const raw = readFileSync(indexPath, "utf-8")
    const { data, content } = matter(raw)
    return { content, relativePath: "docs/" + slug + "/index.md", provenance: parseProvenance(data) }
  }

  return null
}
```

**Step 2: Add barrel export**

Add to `packages/studio-core/src/index.ts`:
```typescript
export * from "./doc-tree.js"
```

**Step 3: Run typecheck**

Run: `pnpm check`
Expected: PASS (no type errors in doc-tree.ts)

**Step 4: Commit**

```bash
git add packages/studio-core/src/doc-tree.ts packages/studio-core/src/index.ts
git commit -m "feat(studio-core): add doc tree data model with provenance parsing"
```

---

### Task 2: Provenance Header Component (studio-ui)

**Files:**
- Create: `packages/studio-ui/src/provenance-header.tsx`

**Step 1: Create the provenance header component**

```typescript
// packages/studio-ui/src/provenance-header.tsx
"use client"

import { Monitor, ShieldCheck, User, AlertTriangle } from "lucide-react"
import Link from "next/link"
import type { Provenance, ProvenanceState } from "@sherpa/studio-core"

interface ProvenanceHeaderProps {
  provenance: Provenance
  state: ProvenanceState
  onMarkReviewed?: () => void
}

const stateConfig = {
  "awaiting-review": {
    icon: Monitor,
    label: "AI-generated",
    sublabel: "Awaiting human review",
    bg: "bg-[var(--color-gold)]/[0.04]",
    border: "border-[var(--color-gold)]/20",
    textColor: "text-[var(--color-gold)]/80",
  },
  verified: {
    icon: ShieldCheck,
    label: "AI-generated",
    sublabel: null,
    bg: "bg-emerald-500/[0.04]",
    border: "border-emerald-500/20",
    textColor: "text-emerald-400/80",
  },
  stale: {
    icon: AlertTriangle,
    label: "Possibly stale",
    sublabel: null,
    bg: "bg-rose-500/[0.04]",
    border: "border-rose-500/20",
    textColor: "text-rose-400/80",
  },
  "human-owned": {
    icon: User,
    label: "Human-authored",
    sublabel: null,
    bg: "bg-muted/30",
    border: "border-border",
    textColor: "text-muted-foreground/70",
  },
} as const

export function ProvenanceHeader({ provenance, state, onMarkReviewed }: ProvenanceHeaderProps) {
  const config = stateConfig[state]
  const Icon = config.icon

  return (
    <div className={`rounded-lg border ${config.border} ${config.bg} px-4 py-3 mb-6`}>
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <Icon className={`h-4 w-4 ${config.textColor}`} />
          <span className={`text-sm font-medium ${config.textColor}`}>{config.label}</span>
          {provenance.lastUpdated && (
            <span className="text-[11px] font-mono text-muted-foreground/50">
              {provenance.lastUpdated}
            </span>
          )}
        </div>
        {state === "awaiting-review" && onMarkReviewed && (
          <button
            onClick={onMarkReviewed}
            className="inline-flex items-center gap-1.5 rounded-md bg-[var(--color-gold)]/10 border border-[var(--color-gold)]/30 px-3 py-1 text-xs font-medium text-[var(--color-gold)] hover:bg-[var(--color-gold)]/20 transition-colors"
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            Mark as Reviewed
          </button>
        )}
        {state === "verified" && provenance.lastVerified && (
          <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 text-xs text-emerald-400">
            <ShieldCheck className="h-3.5 w-3.5" />
            Human-verified {provenance.lastVerified}
          </span>
        )}
      </div>
      {config.sublabel && (
        <div className="text-[11px] text-muted-foreground/50 mb-2">{config.sublabel}</div>
      )}
      {provenance.sourceInitiatives.length > 0 && (
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[10px] text-muted-foreground/40 uppercase tracking-wider">Sources</span>
          {provenance.sourceInitiatives.map((slug) => (
            <Link
              key={slug}
              href={`/process?selected=${slug}`}
              className="inline-flex items-center rounded-full bg-muted/30 border border-muted/50 px-2 py-0.5 text-[11px] font-mono text-muted-foreground/70 hover:border-[var(--color-gold)]/30 transition-colors"
            >
              {slug}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
```

**Step 2: Run typecheck**

Run: `pnpm check`
Expected: PASS

**Step 3: Commit**

```bash
git add packages/studio-ui/src/provenance-header.tsx
git commit -m "feat(studio-ui): add ProvenanceHeader component with review action"
```

---

### Task 3: Doc Tree Component (studio-ui)

**Files:**
- Create: `packages/studio-ui/src/doc-tree.tsx`

**Step 1: Create the tree component with LEDs and sections**

```typescript
// packages/studio-ui/src/doc-tree.tsx
"use client"

import { useState } from "react"
import type { DocTreeNode, DocTreeSection, ProvenanceState } from "@sherpa/studio-core"

interface DocTreeProps {
  sections: DocTreeSection[]
  selectedSlug: string | null
  onSelect: (slug: string) => void
  reviewFilter: boolean
}

const ledColors: Record<ProvenanceState, string> = {
  "awaiting-review": "bg-[var(--color-gold)] shadow-[0_0_4px_rgba(201,162,39,0.4)]",
  verified: "bg-emerald-400 shadow-[0_0_4px_rgba(52,211,153,0.4)]",
  stale: "bg-rose-400 shadow-[0_0_4px_rgba(251,113,133,0.4)]",
  "human-owned": "bg-muted-foreground/40",
}

function TreeNode({
  node,
  selectedSlug,
  onSelect,
  depth = 0,
}: {
  node: DocTreeNode
  selectedSlug: string | null
  onSelect: (slug: string) => void
  depth?: number
}) {
  const isSelected = node.slug === selectedSlug
  const isDecision = node.provenance?.docType === "decision"

  return (
    <button
      onClick={() => onSelect(node.slug)}
      className={`w-full flex items-center gap-2 rounded-md px-2 py-1 text-left transition-colors ${
        isSelected
          ? "bg-[var(--color-dark-bronze)]/80 border-l-2 border-[var(--color-gold)]"
          : "hover:bg-muted/50"
      }`}
      style={{ paddingLeft: `${8 + depth * 16}px` }}
    >
      <span className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${ledColors[node.state]}`} />
      {isDecision && (
        <span className="text-[11px] font-mono text-foreground/60">
          {node.slug.split("/").pop()?.split("-")[0]}
        </span>
      )}
      <span
        className={`text-sm truncate ${
          node.state === "human-owned" ? "text-foreground/50" : "text-foreground/85"
        }`}
      >
        {node.title}
      </span>
    </button>
  )
}

export function DocTree({ sections, selectedSlug, onSelect, reviewFilter }: DocTreeProps) {
  const filteredSections = reviewFilter
    ? sections
        .map((s) => ({
          ...s,
          nodes: s.nodes.filter((n) => n.state === "awaiting-review"),
        }))
        .filter((s) => s.nodes.length > 0)
    : sections

  return (
    <div className="flex flex-col gap-0.5">
      {filteredSections.map((section) => (
        <div key={section.label}>
          <div className="px-2 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            {section.label}
          </div>
          {section.nodes.map((node) => (
            <div key={node.slug}>
              <TreeNode node={node} selectedSlug={selectedSlug} onSelect={onSelect} />
              {node.children.map((child) => (
                <TreeNode
                  key={child.slug}
                  node={child}
                  selectedSlug={selectedSlug}
                  onSelect={onSelect}
                  depth={1}
                />
              ))}
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}
```

**Step 2: Run typecheck**

Run: `pnpm check`
Expected: PASS

**Step 3: Commit**

```bash
git add packages/studio-ui/src/doc-tree.tsx
git commit -m "feat(studio-ui): add DocTree component with freshness LEDs"
```

---

### Task 4: Docs Workspace Component (studio-ui)

**Files:**
- Create: `packages/studio-ui/src/docs-workspace.tsx`

**Step 1: Create the two-pane workspace**

This follows the ProcessWorkspace pattern: left pane (tree + search + review toggle), resize handle, right pane (provenance header + doc content).

```typescript
// packages/studio-ui/src/docs-workspace.tsx
"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ClipboardCheck } from "lucide-react"
import type { DocTreeSection } from "@sherpa/studio-core"
import { DocTree } from "./doc-tree.js"
import { DocSearch } from "./doc-search.js"
import { ProvenanceHeader } from "./provenance-header.js"
import { DocRenderer } from "./doc-renderer.js"

interface DocContent {
  content: string
  relativePath: string
  provenance: {
    docType: string | null
    maintainedBy: string | null
    authoredBy: string | null
    reviewedBy: string | null
    lastUpdated: string | null
    lastVerified: string | null
    sourceInitiatives: string[]
  } | null
}

interface DocsWorkspaceProps {
  sections: DocTreeSection[]
  initialDoc: DocContent | null
  initialSlug: string | null
  searchItems: { relativePath: string; fileName: string; title: string }[]
}

function stripProvenanceBanner(content: string): string {
  // Remove the > **AI-generated** ... or > **Human-authored** ... blockquote lines
  return content.replace(
    /^>\s*\*\*(?:AI-generated|AI-updated|AI-extracted|Human-authored|Possibly stale|System-generated)\*\*.*(?:\n>\s*.*)*/m,
    ""
  ).trimStart()
}

export function DocsWorkspace({ sections, initialDoc, initialSlug, searchItems }: DocsWorkspaceProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const selected = searchParams.get("doc") ?? initialSlug
  const [reviewFilter, setReviewFilter] = useState(false)
  const [width, setWidth] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("docs-tree-width")
      return saved ? parseInt(saved, 10) : 280
    }
    return 280
  })
  const resizing = useRef(false)

  const awaitingCount = useMemo(
    () => sections.reduce((acc, s) => acc + s.nodes.filter((n) => n.state === "awaiting-review").length, 0),
    [sections]
  )

  const handleSelect = useCallback(
    (slug: string) => {
      const params = new URLSearchParams(searchParams.toString())
      params.set("doc", slug)
      router.push(`/docs?${params.toString()}`, { scroll: false })
    },
    [router, searchParams]
  )

  // Resize handling
  const handleMouseDown = useCallback(() => {
    resizing.current = true
    document.body.style.cursor = "col-resize"
    document.body.style.userSelect = "none"
  }, [])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!resizing.current) return
      const newWidth = Math.min(Math.max(e.clientX - 56, 200), 500)
      setWidth(newWidth)
      localStorage.setItem("docs-tree-width", String(newWidth))
    }
    const handleMouseUp = () => {
      resizing.current = false
      document.body.style.cursor = ""
      document.body.style.userSelect = ""
    }
    window.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("mouseup", handleMouseUp)
    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mouseup", handleMouseUp)
    }
  }, [])

  // Keyboard nav
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return
      if (e.key === "/") {
        e.preventDefault()
        document.querySelector<HTMLInputElement>("[data-doc-search]")?.focus()
      }
      if (e.key === "r") setReviewFilter((f) => !f)
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [])

  const doc = initialDoc // Server-rendered; will re-fetch on slug change via page.tsx

  return (
    <div className="flex h-[calc(100vh-3.5rem)] overflow-hidden">
      {/* Tree Pane */}
      <div className="flex flex-col border-r border-border overflow-hidden" style={{ width }}>
        {/* Search */}
        <div className="p-3 border-b border-border">
          <DocSearch items={searchItems} />
        </div>

        {/* Review toggle */}
        <div className="px-3 pt-2 pb-1">
          <button
            onClick={() => setReviewFilter((f) => !f)}
            className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs transition-all border ${
              reviewFilter
                ? "bg-[var(--color-gold)]/10 border-[var(--color-gold)]/30 text-[var(--color-gold)]"
                : "border-transparent text-muted-foreground hover:bg-muted/50"
            }`}
          >
            <ClipboardCheck className="h-3.5 w-3.5" />
            Awaiting review
            {awaitingCount > 0 && (
              <span className="rounded-full bg-[var(--color-gold)]/20 px-1.5 py-px text-[10px] font-mono text-[var(--color-gold)]">
                {awaitingCount}
              </span>
            )}
          </button>
        </div>

        {/* Tree */}
        <div className="flex-1 overflow-y-auto px-2 pb-4">
          <DocTree
            sections={sections}
            selectedSlug={selected}
            onSelect={handleSelect}
            reviewFilter={reviewFilter}
          />
        </div>
      </div>

      {/* Resize handle */}
      <div
        onMouseDown={handleMouseDown}
        className="w-px bg-border hover:bg-[var(--color-gold)]/40 cursor-col-resize relative after:absolute after:inset-y-0 after:-inset-x-1"
      />

      {/* Detail Pane */}
      <div className="flex-1 overflow-y-auto">
        {doc ? (
          <div className="mx-auto max-w-3xl px-8 py-6">
            {doc.provenance && doc.provenance.maintainedBy === "self-documenting-system" && (
              <ProvenanceHeader
                provenance={doc.provenance as any}
                state={
                  doc.provenance.reviewedBy === "human"
                    ? "verified"
                    : doc.provenance.reviewedBy === null
                      ? "awaiting-review"
                      : "human-owned"
                }
              />
            )}
            <DocRenderer
              content={stripProvenanceBanner(doc.content)}
              relativePath={doc.relativePath}
            />
          </div>
        ) : (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <p className="text-sm text-muted-foreground/50">Select a document from the tree</p>
              <p className="mt-1 text-[11px] text-muted-foreground/30 font-mono">/ to search · r to toggle review queue</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
```

**Step 2: Run typecheck**

Run: `pnpm check`
Expected: PASS

**Step 3: Commit**

```bash
git add packages/studio-ui/src/docs-workspace.tsx
git commit -m "feat(studio-ui): add DocsWorkspace two-pane component"
```

---

### Task 5: Wire Up /docs Route

**Files:**
- Modify: `apps/studio/src/app/docs/page.tsx`
- Modify: `apps/studio/src/app/docs/layout.tsx`

**Step 1: Update layout.tsx — remove max-width constraint**

Replace the entire layout with full-viewport pass-through:

```typescript
// apps/studio/src/app/docs/layout.tsx
export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
```

**Step 2: Update page.tsx — render DocsWorkspace**

Replace the catalog view with the workspace:

```typescript
// apps/studio/src/app/docs/page.tsx
import type { Metadata } from "next"
import { getDocTree, getDocContent } from "@sherpa/studio-core"
import { DocsWorkspace } from "@/components/studio/docs-workspace"
import { getDocsByCategory, getResearchByTrack } from "@/lib/studio"

export const metadata: Metadata = {
  title: "Docs | Studio",
  robots: "noindex, nofollow",
}

export default async function DocsPage({
  searchParams,
}: {
  searchParams: Promise<{ doc?: string }>
}) {
  const { doc: selectedSlug } = await searchParams
  const sections = getDocTree()

  // Load selected doc content (or first doc if none selected)
  const slug = selectedSlug ?? sections[0]?.nodes[0]?.slug ?? null
  const initialDoc = slug ? getDocContent(slug) : null

  // Collect all docs for search (reuse existing function)
  const docs = getDocsByCategory()
  const research = getResearchByTrack()
  const allDocs = [
    ...Object.values(docs).flat(),
    ...Object.values(research).flat(),
  ]
  const searchItems = allDocs.map((f) => ({
    relativePath: f.relativePath,
    fileName: f.fileName,
    title: f.title,
  }))

  return (
    <DocsWorkspace
      sections={sections}
      initialDoc={initialDoc}
      initialSlug={slug}
      searchItems={searchItems}
    />
  )
}
```

**Step 3: Verify the re-export exists**

Check that `@/components/studio/docs-workspace` re-exports from `@sherpa/studio-ui`. If the project uses a barrel at `apps/studio/src/components/studio/`, add:

```typescript
export { DocsWorkspace } from "@sherpa/studio-ui"
```

Do the same for any other new components (`ProvenanceHeader`, `DocTree`) if they're imported via the `@/components/studio/` path convention.

**Step 4: Run dev server and verify**

Run: `pnpm dev`
Navigate to `http://localhost:3000/docs`
Expected: Two-pane workspace with tree on left, doc content on right. Provenance header visible on architecture docs.

**Step 5: Commit**

```bash
git add apps/studio/src/app/docs/page.tsx apps/studio/src/app/docs/layout.tsx
git commit -m "feat(studio): wire DocsWorkspace into /docs route"
```

---

### Task 6: Strip Provenance Banner from DocRenderer

**Files:**
- Modify: `packages/studio-ui/src/doc-renderer.tsx`

**Step 1: No changes needed to DocRenderer itself**

The banner stripping happens in `DocsWorkspace` via `stripProvenanceBanner()` before passing content to `DocRenderer`. This keeps DocRenderer generic — it doesn't need to know about provenance.

If the `[...slug]` route should also strip banners, add the strip function there too. Otherwise, this task is complete — the stripping already happens in Task 4.

**Step 2: Verify the [...slug] route still works**

Navigate to `http://localhost:3000/docs/architecture/governance-engine` directly.
Expected: Doc renders correctly via the `[...slug]` catch-all route. The raw markdown banner may show here (acceptable — this route is for direct URL access).

**Step 3: Update [...slug] route to also strip banner and show provenance header**

Update `apps/studio/src/app/docs/[...slug]/page.tsx` to import provenance parsing:

```typescript
// apps/studio/src/app/docs/[...slug]/page.tsx
import { notFound } from "next/navigation"
import { Text } from "@radix-ui/themes"
import { getDocContent } from "@sherpa/studio-core"
import { DocRenderer } from "@/components/studio/doc-renderer"
import { ProvenanceHeader } from "@/components/studio/provenance-header"
import { getDocument } from "@/lib/studio"

function resolveSlugToPath(slug: string[]): string {
  const joined = slug.join("/")
  if (slug[0] === "rules") return `.claude/rules/${slug.slice(1).join("/")}.md`
  if (slug[0] === "claudemd") return `${slug.slice(1).join("/")}/CLAUDE.md`
  return `docs/${joined}.md`
}

function resolveSlugForDocTree(slug: string[]): string {
  return slug.join("/")
}

function stripProvenanceBanner(content: string): string {
  return content.replace(
    /^>\s*\*\*(?:AI-generated|AI-updated|AI-extracted|Human-authored|Possibly stale|System-generated)\*\*.*(?:\n>\s*.*)*/m,
    ""
  ).trimStart()
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params
  return { title: `${slug[slug.length - 1]} | Docs | Studio`, robots: "noindex, nofollow" }
}

export default async function DocViewerPage({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params
  const relativePath = resolveSlugToPath(slug)

  // Try provenance-aware loading first (for docs/ paths)
  const treeSlug = resolveSlugForDocTree(slug)
  const provenanceDoc = getDocContent(treeSlug)

  // Fallback to original loading for rules, claudemd paths
  const doc = provenanceDoc ?? (() => {
    const legacy = getDocument(relativePath)
    return legacy ? { content: legacy.content, relativePath: legacy.relativePath, provenance: null } : null
  })()

  if (!doc) notFound()

  return (
    <div className="mx-auto max-w-3xl px-8 py-6 space-y-6">
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <Text size="1" className="font-mono">{doc.relativePath}</Text>
      </div>
      {doc.provenance && (doc.provenance as any).maintainedBy === "self-documenting-system" && (
        <ProvenanceHeader
          provenance={doc.provenance as any}
          state={
            (doc.provenance as any).reviewedBy === "human"
              ? "verified"
              : (doc.provenance as any).reviewedBy === null
                ? "awaiting-review"
                : "human-owned"
          }
        />
      )}
      <DocRenderer
        content={stripProvenanceBanner(doc.content)}
        relativePath={doc.relativePath}
      />
    </div>
  )
}
```

**Step 4: Commit**

```bash
git add apps/studio/src/app/docs/[...slug]/page.tsx
git commit -m "feat(studio): add provenance header to doc viewer route"
```

---

### Task 7: Verify and Polish

**Step 1: Run full typecheck**

Run: `pnpm check`
Expected: PASS across all packages

**Step 2: Run dev server and test all paths**

Run: `pnpm dev`

Test these scenarios:
- `/docs` — workspace loads with tree and first doc selected
- Click different tree nodes — detail pane updates
- Click "Awaiting review" toggle — tree filters to gold-LED nodes only
- `/docs/architecture/governance-engine` — direct URL renders with provenance header
- `/docs/rules/initiative-convention` — legacy path still works
- Review queue count matches actual awaiting-review docs

**Step 3: Update activity.md**

Add session entry to `docs/initiatives/self-documenting-system/activity.md`.

**Step 4: Final commit**

```bash
git add -A
git commit -m "feat(studio): docs workspace with provenance tree and review queue"
```

---

## Future Tasks (not this session)

- **Server action for "Mark as Reviewed"** — writes frontmatter via Next.js server action. Needs careful implementation (filesystem write from client interaction). Defer to next session.
- **Keyboard j/k navigation in tree** — full arrow-key navigation matching ProcessWorkspace. Current implementation has / and r shortcuts only.
- **Mobile layout** — collapse to single-pane on mobile. Defer.
- **Stale detection with git** — compute staleness from `git log`. Currently only uses frontmatter dates.
