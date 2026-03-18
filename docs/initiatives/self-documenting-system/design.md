---
designed: 2026-03-16
type: ui
components-new: 7
components-modified: 3
files-planned: 14
---

# Self-Documenting System — Studio UI Design

## Overview

Evolve the `/docs` page from a static catalog into an interactive workspace with provenance awareness. The current page lists docs as grid cards and renders them in a separate viewer. The redesign adopts the two-pane workspace pattern (matching `/process` and `/tasks`) with a directoturtle tree on the left and provenance-aware doc rendering on the right.

## UI Design

### Layout: Docs Workspace

Two-pane workspace consistent with ProcessWorkspace and MissionWorkspace:

```
┌─────────────────────────────────────────────────────────────────┐
│ Sidebar │ Doc Tree (left pane)        │ Doc Content (right pane)│
│         │                             │                         │
│  ...    │ 🔍 Search docs...           │ Provenance Header       │
│  Docs ← │ ☐ Awaiting review (3)      │ ┌─────────────────────┐ │
│  ...    │                             │ │ AI-generated 3/16   │ │
│         │ ▼ Architecture              │ │ Awaiting human rev  │ │
│         │   ● Governance Engine       │ │ Sources: dispatch.. │ │
│         │   ● Execution Pipeline      │ └─────────────────────┘ │
│         │   ○ Behavioral Agents       │                         │
│         │   ● Studio Application      │ # Governance Engine     │
│         │   ● Executable Conventions  │                         │
│         │   ○ Config-as-Code          │ The system that ensures │
│         │   ◌ Convention Sync         │ multiple agents and...  │
│         │                             │                         │
│         │ ▼ Decisions                 │ ## Three-Layer Coord... │
│         │   ○ 0001 Three-layer coord  │                         │
│         │   ○ 0002 Behavioral const   │ ...                     │
│         │   ...                       │                         │
│         │                             │ ┌─────────────────────┐ │
│         │ ▼ Changelog                 │ │ [Mark as Reviewed]  │ │
│         │   ● changelog               │ └─────────────────────┘ │
│         │                             │                         │
│         │ ▼ Framework                 │                         │
│         │   ◌ framework               │                         │
│         │   ◌ roadmap                 │                         │
│         │   ◌ foundation-stone        │                         │
│         │                             │                         │
│         │ ▼ UX                        │                         │
│         │   ◌ voice-and-tone          │                         │
│         │   ◌ personas                │                         │
│         │   ...                       │                         │
└─────────────────────────────────────────────────────────────────┘
```

### Freshness Indicators (Tree Nodes)

Each node in the tree shows a freshness LED using the existing staleness color vocabulary:

| State | LED Color | Meaning |
|-------|-----------|---------|
| `●` emerald | `reviewed-by: human`, no relevant commits since | Fresh — human-verified |
| `●` gold | `reviewed-by: null`, recently generated | Awaiting review — AI-generated |
| `●` rose | `last-verified` older than relevant commits | Stale — needs update |
| `◌` muted | `maintained-by: human` or no provenance | Not maintained — human-owned |

This maps directly to the existing `stalenessColor` pattern (muted → amber → rose) but adds emerald for verified state, which the current system doesn't need (initiatives don't have provenance).

### Review Queue Toggle

A toggle at the top of the tree pane filters to only show docs with `reviewed-by: null`. This is the "review queue" — the list of docs that need human attention.

When active:
- Tree collapses to only show nodes awaiting review
- Counter badge shows total count: "Awaiting review (3)"
- Sorted by `last-updated` (newest first)

When inactive: full tree visible with all freshness indicators.

### Provenance Header

Rendered above doc content in the right pane. Replaces the markdown banner (which is still in the file for raw-markdown reading) with a styled component.

```
┌─────────────────────────────────────────────────────────────┐
│ 🤖 AI-generated · 2026-03-16     [Mark as Reviewed ✓]      │
│ Awaiting human review                                       │
│ Sources: dispatch-center · studio-agent-missions            │
└─────────────────────────────────────────────────────────────┘
```

States:

| State | Icon | Background | Action |
|-------|------|------------|--------|
| AI-generated, awaiting review | Robot | gold/10 border, gold/20 bg | "Mark as Reviewed" |
| AI-generated, human-verified | Shield check | emerald/10 border, emerald/20 bg | "Verified 2026-03-17" (no action) |
| Human-authored | User | muted border, muted/10 bg | — |
| Possibly stale | Alert triangle | rose/10 border, rose/20 bg | "N commits since verification" |

Source initiatives render as linked badges (clicking navigates to `/process/<slug>`).

### "Mark as Reviewed" Action

When a human clicks "Mark as Reviewed":
1. Update the doc's frontmatter: `reviewed-by: human`, `last-verified: today`
2. Regenerate the markdown banner from updated frontmatter
3. Update the tree node LED from gold → emerald
4. This is a **server action** that writes to the filesystem (matching how Studio already manages initiative status)

### Doc Content Rendering

Reuse existing `DocRenderer` component with one enhancement: strip the provenance markdown banner from rendered content (since the styled ProvenanceHeader replaces it). Detect the `> **AI-generated**...` or `> **Human-authored**...` blockquote pattern and suppress it.

### Keyboard Navigation

Match the workspace pattern:
- `j/k` or `↑/↓` — navigate tree
- `Enter` — select doc
- `/` — focus search
- `r` — toggle review queue filter
- `m` — mark current doc as reviewed (when in awaiting-review state)

## Component Tree

```
DocsWorkspace (new — replaces current /docs page)
├── DocsTreePane (new — left pane)
│   ├── DocSearch (existing — move from catalog to tree pane)
│   ├── ReviewQueueToggle (new — filter toggle with count)
│   └── DocTree (new — recursive tree with freshness LEDs)
│       └── DocTreeNode (new — single node with LED + title)
├── ResizeHandle (existing from studio-ui)
└── DocDetailPane (new — right pane)
    ├── ProvenanceHeader (new — styled provenance bar)
    │   ├── ProvenanceBadge (new — state-specific icon + text)
    │   ├── SourceInitiativeLinks (inline linked badges)
    │   └── ReviewAction (Mark as Reviewed button)
    └── DocRenderer (existing — markdown rendering)
```

## Data Flow

### Server-Side (page.tsx)

```typescript
// apps/studio/src/app/docs/page.tsx
async function DocsPage() {
  const tree = await getDocTree()      // New: scans docs/ for directoturtle structure
  const docs = await getDocCatalog()   // Existing: file scanning with metadata
  return <DocsWorkspace tree={tree} docs={docs} />
}
```

`getDocTree()` is a new function in studio-core that:
1. Globs `docs/**/{index.md,*.md}`
2. Parses provenance frontmatter (gray-matter)
3. Builds a nested tree structure matching the directory hierarchy
4. Computes freshness state per node from frontmatter fields
5. Returns `DocTreeNode[]` with children, provenance, freshness

### Client-Side

- `DocsWorkspace` manages selection state (which doc is active) via URL search params
- `DocTree` renders the recursive tree with expand/collapse
- `DocDetailPane` fetches doc content on selection change
- `ProvenanceHeader` reads provenance from the doc's parsed frontmatter
- "Mark as Reviewed" triggers a server action that writes frontmatter

### The `[...slug]` Route

The existing `apps/studio/src/app/docs/[...slug]/page.tsx` stays for direct URL access. When a doc is selected in the workspace, the URL updates to `/docs/<path>` and the detail pane renders inline (no full page navigation).

## File Plan

### New files (studio-ui)

| File | Component | Purpose |
|------|-----------|---------|
| `packages/studio-ui/src/docs-workspace.tsx` | `DocsWorkspace` | Two-pane workspace (tree + detail) |
| `packages/studio-ui/src/doc-tree.tsx` | `DocTree`, `DocTreeNode` | Recursive tree with freshness LEDs |
| `packages/studio-ui/src/doc-detail-pane.tsx` | `DocDetailPane` | Right pane: provenance header + content |
| `packages/studio-ui/src/provenance-header.tsx` | `ProvenanceHeader` | Styled provenance bar with actions |
| `packages/studio-ui/src/review-queue-toggle.tsx` | `ReviewQueueToggle` | Filter toggle with awaiting-review count |

### New files (studio-core)

| File | Function | Purpose |
|------|----------|---------|
| `packages/studio-core/src/doc-tree.ts` | `getDocTree()` | Build directoturtle tree with provenance metadata |
| `packages/studio-core/src/provenance.ts` | `parseProvenance()`, `computeFreshness()`, `updateProvenance()` | Provenance read/write/compute |

### Modified files

| File | Change |
|------|--------|
| `apps/studio/src/app/docs/page.tsx` | Replace catalog grid with `DocsWorkspace` |
| `apps/studio/src/app/docs/layout.tsx` | Remove max-width constraint (workspace is full-viewport) |
| `packages/studio-ui/src/doc-renderer.tsx` | Strip provenance banner from rendered markdown |

## Decisions

### 1. Workspace over enhanced catalog

The /docs page becomes a two-pane workspace (like /process and /tasks) rather than adding provenance badges to the existing card grid. The directoturtle tree is the primary navigation — it shows the documentation structure at a glance, which a flat grid cannot.

**Alternatives rejected:**
- Enhanced catalog (add badges to cards) — doesn't show tree hierarchy, can't navigate deep directoturtles
- Sidebar tree + catalog hybrid — adds complexity without the detail pane benefit

### 2. LED indicators over text badges in tree

Tree nodes use LED-mode indicators (2px colored circles) for freshness rather than text badges. The tree needs to be scannable — text badges would create visual noise at every level.

**Follows existing pattern:** `StatusBadge` already has `mode="led"` and the process-item-list uses staleness colors with the same semantic gradient.

### 3. Server action for "Mark as Reviewed"

The review action writes directly to the filesystem (updating frontmatter + regenerating banner) via a Next.js server action. This matches how Studio already manages initiative state — direct filesystem writes, no intermediate database.

### 4. Provenance header replaces markdown banner in Studio

The styled `ProvenanceHeader` component renders provenance info instead of the raw markdown banner. The banner stays in the file (for reading outside Studio) but is stripped during rendering. One source of truth (frontmatter), two renderings (styled component in Studio, markdown banner everywhere else).

## Open Questions

1. **Git integration for staleness:** Computing "commits since last-verified" requires git access at render time. Should this be pre-computed during `/integrate` and stored in frontmatter, or computed on demand? Pre-computing is simpler but can drift; on-demand is accurate but slower.

2. **Non-maintained docs in the tree:** Should `framework.md`, `roadmap.md`, and other human-owned docs (without provenance frontmatter) appear in the tree? Recommendation: yes, in a "Framework" section with muted LEDs, clearly distinguishing them from maintained docs.

3. **Mobile layout:** The workspace pattern uses a single-pane on mobile (list only, detail on tap). Same behavior for docs? Or should mobile show the catalog view instead?
