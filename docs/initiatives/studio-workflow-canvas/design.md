---
designed: 2026-03-16
redesigned: 2026-03-16
type: both
components-new: 7
components-modified: 3
files-planned: 11
---

# Studio Workflow Canvas — Design

Shape: [shape.md](shape.md) | Appetite: 4 sessions

## Overview

Replace the static Mermaid diagram on `/workflow` with an interactive @xyflow/react canvas. The design follows existing Studio patterns: server page fetches data → client workspace renders with inline detail pane, ResizeHandle, localStorage-persisted state.

## Architecture

### Data Model

`packages/studio-core/src/workflow.ts` — types + canonical data + conversion utilities.

```typescript
// ---------------------------------------------------------------------------
// Workflow graph — types
// ---------------------------------------------------------------------------

export const WORKFLOW_NODE_TYPES = ["stage", "decision", "trigger"] as const;
export type WorkflowNodeType = (typeof WORKFLOW_NODE_TYPES)[number];

export const WORKFLOW_PHASES = [
  "discovery", "governance", "execution",
  "delivery", "audit", "morning-review",
] as const;
export type WorkflowPhase = (typeof WORKFLOW_PHASES)[number];

export const WORKFLOW_EDGE_TYPES = [
  "ideas", "governance", "tasks", "code", "content",
  "review", "delivery", "audit", "feedback",
] as const;
export type WorkflowEdgeType = (typeof WORKFLOW_EDGE_TYPES)[number];

export interface WorkflowNode {
  id: string;
  label: string;
  /** Subtitle — skill command, artifact, or description */
  subtitle: string;
  nodeType: WorkflowNodeType;
  phase: WorkflowPhase | null;     // null for entry-point triggers
  /** Skill command (e.g. "/rr") or artifact (e.g. "proposal.md") */
  skill: string | null;
  /** Studio page this node links to (e.g. "/process", "/dispatch") */
  href: string | null;
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  label: string | null;
  /** Data-flow type — determines color, thickness, animation */
  edgeType: WorkflowEdgeType;
  /** Override source/target connection side for feedback loops */
  sourceSide?: "top" | "bottom" | "left" | "right";
  targetSide?: "top" | "bottom" | "left" | "right";
}

/** Visual config per edge type */
export interface WorkflowEdgeStyle {
  color: string;
  width: number;
  animated: boolean;     // flowing dash overlay
  particles: boolean;    // traveling dots
  particleSpeed: number; // px/sec (0 = no particles)
  dashed: boolean;       // dashed base stroke (feedback loops)
}

export const WORKFLOW_EDGE_STYLES: Record<WorkflowEdgeType, WorkflowEdgeStyle>;

export interface WorkflowPhaseGroup {
  id: WorkflowPhase;
  label: string;
  nodes: string[];
}

// ---------------------------------------------------------------------------
// Canonical workflow data
// ---------------------------------------------------------------------------

export const WORKFLOW_NODES: WorkflowNode[] = [/* ... 17 nodes ... */];
export const WORKFLOW_EDGES: WorkflowEdge[] = [/* ... ~28 edges ... */];
export const WORKFLOW_PHASE_GROUPS: WorkflowPhaseGroup[] = [/* 6 groups */];

// ---------------------------------------------------------------------------
// Conversion to @xyflow/react format
// ---------------------------------------------------------------------------

export function getWorkflowFlowNodes(): FlowNode[];
export function getWorkflowFlowEdges(): FlowEdge[];

/** Export workflow as Mermaid flowchart string */
export function exportWorkflowAsMermaid(): string;
```

**Why this structure:** Mirrors `process-nodes-shared.ts` — const arrays with `as const`, type derived from array, interfaces for domain objects, pure conversion functions. The canonical data is a TypeScript constant, not parsed from Mermaid at runtime.

### Component Tree

```
apps/studio/src/app/workflow/page.tsx  (server)
└── SectionHeader
└── WorkflowCanvas                     (client, studio-ui)
    ├── <ReactFlow>
    │   ├── WorkflowStageNode          (custom node — rectangle)
    │   ├── WorkflowDecisionNode       (custom node — rectangle, dashed border)
    │   ├── WorkflowTriggerNode        (custom node — rectangle, rounded)
    │   ├── WorkflowPhaseGroup         (custom group node — labeled container)
    │   ├── WorkflowDataFlowEdge       (custom edge — typed, layered, animated)
    │   ├── <Background />             (dots)
    │   ├── <MiniMap />                (bottom-right, phase-colored nodes)
    │   └── <Controls />               (zoom +/-, fit)
    ├── WorkflowLegend                 (top-right, interactive edge type filter)
    ├── WorkflowToolbar                (bottom-left, flow toggle, Mermaid export)
    ├── ResizeHandle                   (existing component)
    └── WorkflowDetailPane             (detail panel, right side, with navigation)
```

### Data Flow

```
1. page.tsx (server)
   └── imports getWorkflowFlowNodes(), getWorkflowFlowEdges() from studio-core
   └── passes as props to <WorkflowCanvas nodes={nodes} edges={edges} />

2. WorkflowCanvas (client, 'use client')
   └── receives nodes/edges as props (no client-side data fetching)
   └── useState for selectedNodeId
   └── useState for detailPaneWidth (hydrated from localStorage)
   └── useEffect to run ELK layout on mount → setNodes with positions
   └── onNodeClick → set selectedNodeId → detail pane opens
   └── onPaneClick → clear selectedNodeId → detail pane closes

3. Layout persistence
   └── onNodeDragStop → save positions to localStorage
   └── on mount → check localStorage for saved positions
   └── if saved → use saved positions (skip ELK)
   └── if not saved → run ELK → save result to localStorage
   └── "Reset Layout" button → clear localStorage → re-run ELK
```

### Integration Points

| Point | Existing Code | New Code |
|-------|--------------|----------|
| Page route | `apps/studio/src/app/workflow/page.tsx` | Rewrite: server component importing canvas |
| Core data | `packages/studio-core/src/index.ts` | Add exports for workflow types + data |
| UI index | `packages/studio-ui/src/index.ts` | Add export for WorkflowCanvas |
| Studio re-export | `apps/studio/src/components/studio/` | Add re-export for workflow-canvas |
| CSS imports | `apps/studio/src/styles/globals.css` | Add `@import "@xyflow/react/dist/style.css"` |
| Command palette | `apps/studio/src/components/studio/command-palette-items.ts` | No change (already registered) |

## UI Design

### Layout

Full-width canvas with collapsible right-side detail pane. Matches the MissionWorkspace / ProcessWorkspace pattern.

```
┌─────────────────────────────────────────────────┐
│  SectionHeader: PROCESS / Product Workflow       │
├──────────────────────────────────┬──────────────┤
│                                  │ ║            │
│                                  │ ║  Detail    │
│       ReactFlow Canvas           │ ║  Pane      │
│       (pan, zoom, drag)          │ ║            │
│                                  │ ║  Name      │
│    ┌──── Discovery ──────┐       │ ║  Phase     │
│    │ Curate → Research   │       │ ║  Skill     │
│    │        → Synthesize │       │ ║  Edges     │
│    └─────────────────────┘       │ ║            │
│                                  │ ║            │
│    ┌──── Governance ─────┐       │ ║            │
│    │ Propose → Review    │       │ ║            │
│    │        → Approve    │       │ ║            │
│    └─────────────────────┘       │ ║            │
│                                  │ ║            │
│  [Fit] [+] [-] [Reset Layout]   │ ║            │
├──────────────────────────────────┴──────────────┤
```

- **Canvas area:** Fills available space. `flex-1` with `min-width: 0`.
- **Detail pane:** 360px default, 200-500px range. Hidden when no node selected. Opens with a smooth width transition.
- **ResizeHandle:** Existing component, positioned between canvas and detail.
- **Controls:** Bottom-left corner (ReactFlow `<Controls />` default position). "Reset Layout" button added via custom control.

### Node Design

All nodes start as **rectangles** (per shape rabbit hole #3). Differentiated by visual treatment:

| Type | Visual Treatment |
|------|-----------------|
| **Stage** | Solid gold border (`border-[var(--color-gold)]/30`), `bg-card`. Label + subtitle. |
| **Decision** | Dashed gold border (`border-dashed`), `bg-card`. Label only (shorter). |
| **Trigger** | Rounded corners (`rounded-full`), copper accent (`border-[var(--color-copper)]/30`). |

All nodes use `BaseNode` from ui.reactflow.dev as the foundation. Extend with:
- `node-status-indicator` — colored dot showing phase context
- `node-tooltip` — hover shows skill description and phase

**Phase groups:** `labeled-group-node` from ui.reactflow.dev, or custom group with:
- Semi-transparent background (`bg-[var(--color-gold)]/[0.03]`)
- Subtle border (`border-[var(--color-gold)]/10`)
- Phase label top-left in `font-mono text-xs text-[var(--color-gold)]/60`

### Edge Design — Data-Flow Visualization

9 edge types, each with distinct visual treatment (validated in prototype):

| Type | Color | Width | Animation | Carries |
|------|-------|-------|-----------|---------|
| Ideas | copper `#c49a6c` | 1.5 | slow particles | Research signals, raw ideas |
| Governance | gold `#d4a574` | 2 | — | Proposals, review decisions |
| Tasks | bright gold `#e8c49a` | 2.5 | fast particles + flow | Approved work, task plans |
| Code | violet `#a78bfa` | 2.5 | fast particles + flow | Code tasks to workers |
| Content | green `#4ade80` | 2 | — | Content to LM Studio |
| Review | blue `#60a5fa` | 2 | — | Review to CLI agents |
| Delivery | emerald `#34d399` | 2 | — | Approved work shipping |
| Audit | bronze `#8b7355` | 1.5 | slow particles | Nightly pipeline |
| Feedback | red `#f87171` | 1.5 | slow particles, dashed | Loops: declined, needs changes |

**Rendering layers per edge** (bottom to top):
1. **Glow** — wide (3x stroke width), low opacity (0.12) — soft color wash
2. **Main path** — `smoothstep` edge with type-specific color and width
3. **Flow dashes** — animated `stroke-dasharray` overlay (tasks, code, feedback, ideas, audit only)
4. **Particles** — SVG circles traveling along the path via `getPointAtLength()`. Speed varies by type.

**Custom edge component:** `WorkflowDataFlowEdge` — a single custom edge type that reads `edgeType` from edge data and renders the appropriate layers. Uses `@xyflow/react`'s `getBezierPath` or `getSmoothStepPath` for the path `d` string.

**Labels:** `text-xs` in the edge type's color on a `bg-background` pill. Positioned at path midpoint.

### Detail Pane

When a node is selected, the right pane shows:

```
┌────────────────────────┐
│ Research                │  ← node label (heading)
│ Discovery ·  Stage      │  ← phase badge + type
├────────────────────────┤
│ Skill Command           │
│ ┌────────────────────┐ │
│ │ /rr            [⎘] │ │  ← copyable skill command
│ └────────────────────┘ │
├────────────────────────┤
│ Open in Studio    [→]  │  ← navigates to /process
├────────────────────────┤
│ Connections             │
│                         │
│ ● ← Incoming Idea      │  ← colored dot by edge type
│ ● ← Curate             │
│ ● ← Declined (loop)    │  ← red dot for feedback
│ ● → Synthesize          │
├────────────────────────┤
│ Live data coming in     │  ← placeholder for future
│ a future release        │
└────────────────────────┘
```

**Navigation links per node** (defined in `WorkflowNode.href`):
- Research, Curate, Synthesize, Propose → `/process`
- Review, Approve/Decline → `/process`
- Plan, Dispatch → `/dispatch`
- Claude Worker, LM Studio, CLI Agent, Judge → `/tasks`
- Code Review, Ship → `/activity`
- Profiles, Chunk, Dispatch (audit), Archive → `/activity`
- Review Results, Triage → `/activity`
- Triggers → no link

**Connection list** shows a colored dot matching the edge type (copper for ideas, violet for code, red for feedback, etc.) so users can see *what kind* of data flows in/out.

Components: shadcn `Badge` for phase, `Button` with copy icon for skill command, `Link` for navigation.

### Interaction Patterns

| Action | Result |
|--------|--------|
| **Hover node** | `NodeTooltip` appears: label, skill, phase |
| **Click node** | Node selected (gold border pulse), detail pane opens/switches |
| **Click canvas** | Deselect, detail pane closes |
| **Drag node** | Repositions node, edges follow live, persists to localStorage on drag end |
| **Scroll wheel** | Zoom in/out |
| **Click + drag canvas** | Pan |
| **Fit button** | `fitView()` — centers and zooms to fit all nodes |
| **Reset Layout** | Clears localStorage, re-runs ELK auto-layout |
| **Click legend type** | Toggles edge type visibility (filtered edges hidden, paths + particles removed) |
| **Flow toggle** | On/Off — disables particle animations and flow dashes, persists to localStorage |
| **"Open in Studio"** | Navigates to the node's linked Studio page via Next.js router |
| **"Copy as Mermaid"** | Exports workflow graph as Mermaid text to clipboard |
| **Escape** | Closes detail pane |

### Legend + Edge Filtering

Interactive legend (top-right, glass-bg panel). Each edge type is a clickable row:
- Click → toggle that edge type's visibility (edges hidden, particles stopped)
- Active types show full color; inactive types show muted with strikethrough
- State persisted to localStorage as a `Set<WorkflowEdgeType>` of hidden types
- "Show all" / "Hide all" buttons at bottom of legend

## File Plan

### New Files

| # | File | Package | Purpose |
|---|------|---------|---------|
| 1 | `packages/studio-core/src/workflow.ts` | studio-core | Types, canonical data, edge styles, xyflow conversion, Mermaid export |
| 2 | `packages/studio-ui/src/workflow-canvas.tsx` | studio-ui | Main canvas: ReactFlow + legend + detail pane + ResizeHandle |
| 3 | `packages/studio-ui/src/workflow-nodes.tsx` | studio-ui | Custom node components (stage, decision, trigger, group) |
| 4 | `packages/studio-ui/src/workflow-edge.tsx` | studio-ui | Custom data-flow edge (layered: glow + path + flow + particles) |
| 5 | `packages/studio-ui/src/workflow-detail-pane.tsx` | studio-ui | Right-side detail panel with navigation links |
| 6 | `packages/studio-ui/src/workflow-legend.tsx` | studio-ui | Interactive edge type legend with filtering |
| 7 | `packages/studio-ui/src/workflow-toolbar.tsx` | studio-ui | Controls: zoom, fit, reset, flow toggle, Mermaid export |

### Modified Files

| # | File | Change |
|---|------|--------|
| 8 | `apps/studio/src/app/workflow/page.tsx` | Rewrite: import canvas, pass workflow data as props |
| 9 | `apps/studio/src/styles/globals.css` | Add `@import "@xyflow/react/dist/style.css"` + xyflow theme overrides + edge animation keyframes |
| 10 | `packages/studio-core/src/index.ts` | Add workflow exports |
| 11 | `packages/studio-ui/src/index.ts` | Add workflow component exports |

### Dependencies to Install

```bash
pnpm add @xyflow/react elkjs --filter @sherpa/studio-app
pnpm add -D @types/elkjs --filter @sherpa/studio-app
```

Then install shadcn components from ui.reactflow.dev:
```bash
cd apps/studio && pnpm dlx shadcn@latest add https://ui.reactflow.dev/base-node
cd apps/studio && pnpm dlx shadcn@latest add https://ui.reactflow.dev/node-tooltip
cd apps/studio && pnpm dlx shadcn@latest add https://ui.reactflow.dev/labeled-group-node
cd apps/studio && pnpm dlx shadcn@latest add https://ui.reactflow.dev/node-status-indicator
```

## Decisions

### Detail pane: inline split, not Sheet overlay

The shape suggested Sheet. Codebase exploration revealed that Studio's established pattern is **inline two-pane splits with ResizeHandle** (MissionWorkspace, ProcessWorkspace). Sheet is used nowhere for detail panels. Following the existing convention:
- Canvas + ResizeHandle + DetailPane (flex row)
- Detail pane width persisted to localStorage
- Detail pane hidden when no node selected (canvas takes full width)

This keeps the canvas visible while inspecting a node (validated by n8n Focus Panel research) and matches the codebase's muscle memory.

### Node shapes: all rectangles in v1

Per shape rabbit hole #3. Differentiate by border style (solid/dashed/rounded) and accent color, not geometric shape. Avoids edge handle positioning headaches with CSS-rotated diamonds.

### ELK layout: dynamic import, no Web Worker

Per shape rabbit hole #1. `const elk = await import('elkjs')` inside the client component. Only loads on `/workflow`. Optimize to Web Worker later if bundle analysis warrants it.

### Layout persistence: raw localStorage

Per shape rabbit hole #5. `localStorage.setItem('workflow-layout', JSON.stringify(nodePositions))` — no Zustand, no schema. Matches the existing `STORAGE_KEY` pattern in MissionWorkspace.

## Open Questions

1. **ui.reactflow.dev install path in pnpm monorepo** — needs verification in session 1. If `pnpm dlx shadcn@latest add` doesn't work from the app directory, install components manually by copying source.
2. **ELK `layered` algorithm configuration** — exact `layoutOptions` for our graph (6 groups, cross-boundary edges, 2 feedback loops) will require iteration. Start with defaults, tune in session 1.
3. **ReactFlow CSS overrides for gold theme** — the `@xyflow/react/dist/style.css` ships default styles. We need to override edge colors, selection rings, minimap colors to match gold/copper theme. Scope this to session 2.
