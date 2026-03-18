# Studio Workflow Canvas — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the static Mermaid diagram on `/workflow` with an interactive @xyflow/react canvas featuring typed data-flow edges, node detail panels with navigation, edge filtering, and Mermaid export.

**Architecture:** Server page passes canonical workflow data as props to a `'use client'` canvas component. @xyflow/react handles pan/zoom/drag. ELK computes initial layout. Custom node types (stage, decision, trigger, group) use shadcn components from ui.reactflow.dev. Custom edge renders 4 layers per edge type (glow, path, flow, particles). Inline detail pane with ResizeHandle follows existing MissionWorkspace pattern.

**Tech Stack:** Next.js 16, React 19, @xyflow/react 12, elkjs, Tailwind v4, shadcn/ui (new-york/radix), lucide-react

---

## Session 1: Foundation — Data Model + Canvas Setup + ELK Layout

### Task 1: Install dependencies

**Files:**
- Modify: `apps/studio/package.json`

**Step 1: Install @xyflow/react and elkjs**

```bash
cd /Users/rob/Workbench/sherpa && pnpm add @xyflow/react elkjs --filter @sherpa/studio-app
```

**Step 2: Install shadcn components from ui.reactflow.dev**

```bash
cd /Users/rob/Workbench/sherpa/apps/studio && pnpm dlx shadcn@latest add https://ui.reactflow.dev/base-node
cd /Users/rob/Workbench/sherpa/apps/studio && pnpm dlx shadcn@latest add https://ui.reactflow.dev/node-tooltip
cd /Users/rob/Workbench/sherpa/apps/studio && pnpm dlx shadcn@latest add https://ui.reactflow.dev/labeled-group-node
cd /Users/rob/Workbench/sherpa/apps/studio && pnpm dlx shadcn@latest add https://ui.reactflow.dev/node-status-indicator
```

> **Kill criterion check:** If `pnpm dlx shadcn@latest add` fails for the xyflow registry, manually copy the component source from https://ui.reactflow.dev into `apps/studio/src/components/ui/`. Continue with Task 2.

**Step 3: Review installed components**

Read every file installed by the shadcn commands above. Check for:
- Hardcoded import paths that need rewriting to `@/components/ui/...`
- Missing sub-components
- Icon imports that should use `lucide-react`

Fix any issues found.

**Step 4: Verify install**

```bash
cd /Users/rob/Workbench/sherpa && pnpm check
```

Expected: No type errors.

**Step 5: Commit**

```bash
git add -A && git commit -m "feat(workflow-canvas): install @xyflow/react, elkjs, and shadcn flow components"
```

---

### Task 2: Workflow data model in studio-core

**Files:**
- Create: `packages/studio-core/src/workflow.ts`
- Modify: `packages/studio-core/src/index.ts`

**Step 1: Create the workflow data model**

Create `packages/studio-core/src/workflow.ts`. This file contains:

1. **Type constants** matching `process-nodes-shared.ts` convention (`const ... as const`, type derived from array):
   - `WORKFLOW_NODE_TYPES`: `["stage", "decision", "trigger"]`
   - `WORKFLOW_PHASES`: `["discovery", "governance", "execution", "delivery", "audit", "morning-review"]`
   - `WORKFLOW_EDGE_TYPES`: `["ideas", "governance", "tasks", "code", "content", "review", "delivery", "audit", "feedback"]`

2. **Interfaces** (from design.md):
   - `WorkflowNode` — id, label, subtitle, nodeType, phase, skill, href
   - `WorkflowEdge` — id, source, target, label, edgeType, sourceSide?, targetSide?
   - `WorkflowEdgeStyle` — color, width, animated, particles, particleSpeed, dashed
   - `WorkflowPhaseGroup` — id, label, nodes

3. **Edge style constants** — `WORKFLOW_EDGE_STYLES: Record<WorkflowEdgeType, WorkflowEdgeStyle>` with the 9 types from the design (colors, widths, animation flags from the prototype).

4. **Canonical workflow data** — `WORKFLOW_NODES` (17 nodes), `WORKFLOW_EDGES` (~28 edges), `WORKFLOW_PHASE_GROUPS` (6 groups). Derive all data from the existing Mermaid string in `page.tsx` (lines 12-94). Every node from the Mermaid diagram becomes a `WorkflowNode`. Every arrow becomes a `WorkflowEdge` with the correct `edgeType`. Every `subgraph` becomes a `WorkflowPhaseGroup`.

   Node `href` values:
   - curate, research, synthesize, propose, review, decide → `/process`
   - plan, dispatch → `/dispatch`
   - claude, lmstudio, cli, judge → `/tasks`
   - codereview, ship, profiles, chunk, auditrun, archive, morning, triage → `/activity`
   - idea, nightly → `null`

5. **Phase label map** — `WORKFLOW_PHASE_LABELS: Record<WorkflowPhase, string>` mapping phase IDs to display names.

**Step 2: Add export to studio-core index**

Add to `packages/studio-core/src/index.ts`:

```typescript
// Workflow canvas
export * from "./workflow"
```

Place it in the "Pure logic" section after `process-nodes-shared`.

**Step 3: Type-check**

```bash
cd /Users/rob/Workbench/sherpa && pnpm check
```

Expected: Pass.

**Step 4: Commit**

```bash
git add packages/studio-core/src/workflow.ts packages/studio-core/src/index.ts
git commit -m "feat(workflow-canvas): add workflow data model with 17 nodes, 28 edges, 9 edge types"
```

---

### Task 3: Minimal canvas component + ELK layout

**Files:**
- Create: `packages/studio-ui/src/workflow-canvas.tsx`
- Modify: `apps/studio/src/styles/globals.css`
- Modify: `apps/studio/src/app/workflow/page.tsx`

**Step 1: Add xyflow CSS import**

At the top of `apps/studio/src/styles/globals.css`, after `@import "tw-animate-css";`, add:

```css
@import "@xyflow/react/dist/style.css";
```

**Step 2: Create the minimal WorkflowCanvas component**

Create `packages/studio-ui/src/workflow-canvas.tsx` as a `"use client"` component that:

1. Accepts props: `initialNodes: Node[]`, `initialEdges: Edge[]` (xyflow types)
2. Uses `useState` for nodes and edges (via `useNodesState`, `useEdgesState` from `@xyflow/react`)
3. Renders `<ReactFlowProvider>` wrapping `<ReactFlow>` with:
   - `<Background variant={BackgroundVariant.Dots} gap={24} size={1} />` with gold-tinted color
   - `<Controls />` in default position
   - `fitView` prop
4. Uses a `useEffect` on mount to run ELK layout:
   - Dynamic import: `const ELK = (await import('elkjs/lib/elk.bundled.js')).default`
   - Create ELK graph with `algorithm: 'layered'`, `direction: 'DOWN'`
   - Convert ELK output positions back to xyflow node positions
   - Call `setNodes` with positioned nodes
5. Wraps everything in a `div` with `className="flex-1 min-h-0"` and a fixed height container

The ELK layout function should handle parent/child relationships for phase groups. Phase group nodes get `type: 'group'` and children get `parentId`. ELK's nested `children` structure maps naturally to this.

**Step 3: Rewrite the workflow page**

Replace `apps/studio/src/app/workflow/page.tsx` with a server component that:

1. Imports `WORKFLOW_NODES`, `WORKFLOW_EDGES`, `WORKFLOW_PHASE_GROUPS` from `@sherpa/studio-core`
2. Converts them to xyflow-compatible `Node[]` and `Edge[]` arrays (with `parentId` for grouped nodes, `type: 'group'` for phase groups)
3. Passes them to `<WorkflowCanvas />`
4. Keeps the `SectionHeader` and `metadata`

The page wraps the canvas in a `div` with `className="flex flex-col flex-1 min-h-0 gap-6"` so the canvas fills available height below the header.

**Step 4: Verify — dev server shows canvas**

```bash
cd /Users/rob/Workbench/sherpa && pnpm dev
```

Open `localhost:3000/workflow`. Expected: ReactFlow canvas renders with default rectangle nodes positioned by ELK. Pan/zoom works. Dots background visible.

> **Kill criterion check:** If @xyflow/react throws React 19 errors (zustand conflict, hydration errors), investigate for max 1 hour. If unresolvable, stop and pivot to DIY canvas approach.

> **Kill criterion check:** If ELK layout is unreadable (nodes overlapping, groups broken), try 2-3 different `layoutOptions` combinations. If still broken, fall back to hardcoded positions in the data model.

**Step 5: Commit**

```bash
git add packages/studio-ui/src/workflow-canvas.tsx apps/studio/src/app/workflow/page.tsx apps/studio/src/styles/globals.css
git commit -m "feat(workflow-canvas): minimal canvas with ELK auto-layout replaces Mermaid diagram"
```

---

## Session 2: Visual Layer — Custom Nodes + Data-Flow Edges + Theme

### Task 4: Custom node components

**Files:**
- Create: `packages/studio-ui/src/workflow-nodes.tsx`
- Modify: `packages/studio-ui/src/workflow-canvas.tsx`

**Step 1: Create custom node components**

Create `packages/studio-ui/src/workflow-nodes.tsx` with three node components + one group:

1. **`WorkflowStageNode`** — extends `BaseNode` (from the shadcn xyflow registry). Solid gold border (`border-[var(--color-gold)]/20`), `bg-card`. Renders:
   - Status dot (colored by phase) via `node-status-indicator`
   - Label (`text-sm font-medium`)
   - Subtitle in `font-mono text-xs text-muted-foreground`
   - Source handle (bottom) + target handle (top)

2. **`WorkflowDecisionNode`** — same as stage but with `border-dashed` and `border-[var(--color-gold)]/25`. No subtitle. Label only.

3. **`WorkflowTriggerNode`** — `rounded-full` border radius, copper accent `border-[var(--color-copper)]/25`. Status dot + label.

4. **`WorkflowPhaseGroup`** — custom group node (or extend `labeled-group-node`). Semi-transparent gold background `bg-[var(--color-gold)]/[0.02]`, subtle border `border-[var(--color-gold)]/8`, phase label in `font-mono text-xs text-[var(--color-gold)]/50` positioned top-left with padding.

All nodes must be defined outside the render function (React Flow requirement) and registered in a `nodeTypes` object exported from this file.

**Use `cn()` from `@/lib/utils`** for conditional class merging. Follow shadcn styling rules: semantic colors, `gap-*` not `space-*`, `size-*` for equal dimensions, no manual `dark:` overrides.

**Step 2: Register node types in WorkflowCanvas**

Update `workflow-canvas.tsx` to import `nodeTypes` from `workflow-nodes.tsx` and pass to `<ReactFlow nodeTypes={nodeTypes}>`.

Update the page's node conversion to set the correct `type` field on each node (`'stage'`, `'decision'`, `'trigger'`, `'phase-group'`).

**Step 3: Verify — custom nodes render**

```bash
cd /Users/rob/Workbench/sherpa && pnpm dev
```

Open `localhost:3000/workflow`. Expected: Nodes show gold-themed cards with status dots, labels, subtitles. Phase groups render as labeled containers with subtle gold tint.

**Step 4: Commit**

```bash
git add packages/studio-ui/src/workflow-nodes.tsx packages/studio-ui/src/workflow-canvas.tsx
git commit -m "feat(workflow-canvas): custom node types — stage, decision, trigger, phase group"
```

---

### Task 5: Custom data-flow edge component

**Files:**
- Create: `packages/studio-ui/src/workflow-edge.tsx`
- Modify: `packages/studio-ui/src/workflow-canvas.tsx`
- Modify: `apps/studio/src/styles/globals.css`

**Step 1: Add edge animation keyframes to globals.css**

Add to `apps/studio/src/styles/globals.css` in the `@layer base` or after theme block:

```css
@keyframes edge-flow {
  to { stroke-dashoffset: -16; }
}
```

**Step 2: Create the WorkflowDataFlowEdge component**

Create `packages/studio-ui/src/workflow-edge.tsx`:

A custom edge component that receives `data.edgeType` and renders 3-4 SVG layers:

1. Import `getSmoothStepPath` (or `getBezierPath`) from `@xyflow/react`
2. Import `WORKFLOW_EDGE_STYLES` from `@sherpa/studio-core`
3. Compute the path `d` string using the xyflow path utility
4. Render layers in order:
   - **Glow path** — same `d`, `strokeWidth` = style.width * 3, `opacity` = 0.12, `stroke` = style.color
   - **Main path** — `strokeWidth` = style.width, `stroke` = style.color, `strokeDasharray` if `style.dashed`
   - **Flow dashes** (if `style.animated`) — same `d`, thin, `strokeDasharray: "4 12"`, CSS animation `edge-flow`
   - **Arrow marker** — use `<marker>` defs or `markerEnd` prop with type-specific color
5. Render label at path midpoint if `data.label` exists — `<text>` with `fill` = style.color, opacity 0.7, on a `<rect>` background pill

Export the edge component and an `edgeTypes` object: `{ 'data-flow': WorkflowDataFlowEdge }`.

**Step 3: Register edge type in WorkflowCanvas**

Update `workflow-canvas.tsx` to import `edgeTypes` and pass to `<ReactFlow edgeTypes={edgeTypes}>`.

Update edge conversion to set `type: 'data-flow'` and pass `data: { edgeType, label }` on every edge.

**Step 4: Verify — colored edges render**

Dev server: edges should show typed colors. Gold for governance, violet for code, red dashed for feedback loops. Edges with animation flags should show flowing dashes.

**Step 5: Commit**

```bash
git add packages/studio-ui/src/workflow-edge.tsx packages/studio-ui/src/workflow-canvas.tsx apps/studio/src/styles/globals.css
git commit -m "feat(workflow-canvas): data-flow edge visualization — 9 types, glow, flow animation"
```

---

### Task 6: Edge particle animation system

**Files:**
- Modify: `packages/studio-ui/src/workflow-edge.tsx`

**Step 1: Add particle dots to the edge component**

For edge types where `style.particles === true`, add 1-2 SVG `<circle>` elements that travel along the path:

- Use `useRef` for the path element + `useEffect` with `requestAnimationFrame`
- On each frame: `offset = (offset + speed * dt) % pathLength`
- Get position via `pathRef.current.getPointAtLength(offset)`
- Set `cx`/`cy` on the circle
- Clean up the animation frame on unmount
- Respect a `flowEnabled` prop (from parent context) — when false, hide particles and stop animation

The particle should be a small circle (`r={3}`) with `fill` = edge style color, `opacity` 0.8.

For long edges (path length > 200), render 2 particles offset by half the path length.

**Step 2: Verify — particles animate along edges**

Dev server: small colored dots should travel along animated edges (tasks, code, ideas, audit, feedback). Speed should vary by type.

**Step 3: Commit**

```bash
git add packages/studio-ui/src/workflow-edge.tsx
git commit -m "feat(workflow-canvas): particle animation on data-flow edges"
```

---

## Session 3: Interaction Layer — Detail Pane + Legend + Controls

### Task 7: Detail pane with navigation

**Files:**
- Create: `packages/studio-ui/src/workflow-detail-pane.tsx`
- Modify: `packages/studio-ui/src/workflow-canvas.tsx`

**Step 1: Create the detail pane component**

Create `packages/studio-ui/src/workflow-detail-pane.tsx`:

Props: `node: WorkflowNode | null`, `edges: WorkflowEdge[]`, `allNodes: WorkflowNode[]`

When `node` is null, render nothing (the parent hides the pane).

Sections:
1. **Header** — `node.label` as heading, `Badge` for phase, node type text
2. **Skill command** (if `node.skill`) — mono-styled container with copy `Button`. Use `navigator.clipboard.writeText()`. Icon with `data-icon="inline-end"` on the copy button. Use `CopyIcon` from `lucide-react`.
3. **"Open in Studio"** (if `node.href`) — `Link` from `next/link` to `node.href`. Styled as a subtle button row with `ExternalLinkIcon`.
4. **Connections** — filter `edges` for those with `source === node.id` or `target === node.id`. For each, show a colored dot (using the edge's `edgeType` color from `WORKFLOW_EDGE_STYLES`), direction arrow (← or →), and the connected node's label (looked up from `allNodes`).
5. **Placeholder** — dashed border box: "Live data coming in a future release"

Use shadcn components: `Badge`, `Button`, `Separator`. Use `gap-*` for spacing, semantic colors, `cn()` for conditional classes.

**Step 2: Integrate detail pane into WorkflowCanvas**

Update `workflow-canvas.tsx`:
1. Add `selectedNodeId` state
2. Add `detailPaneWidth` state (default 360, hydrated from localStorage `workflow-detail-width`)
3. On `onNodeClick`: set `selectedNodeId`
4. On `onPaneClick`: clear `selectedNodeId`
5. On `Escape` keydown: clear `selectedNodeId`
6. Layout: `<div className="flex flex-1 min-h-0">` containing:
   - `<div className="flex-1 min-w-0">` wrapping ReactFlow
   - `{selectedNode && <><ResizeHandle .../><WorkflowDetailPane .../></>}`
7. ResizeHandle uses the existing component from `packages/studio-ui/src/resize-handle.tsx`. Wire `onResize` to update `detailPaneWidth`, `onResizeEnd` to persist to localStorage.

**Step 3: Verify — click node opens detail pane**

Dev server: click any node → detail pane slides in from right. Shows node name, phase badge, skill command (copyable), "Open in Studio" link, connection list with colored dots. Click canvas background → pane closes. Escape → pane closes. Resize handle works.

**Step 4: Commit**

```bash
git add packages/studio-ui/src/workflow-detail-pane.tsx packages/studio-ui/src/workflow-canvas.tsx
git commit -m "feat(workflow-canvas): detail pane with navigation links and typed connections"
```

---

### Task 8: Interactive legend with edge filtering

**Files:**
- Create: `packages/studio-ui/src/workflow-legend.tsx`
- Modify: `packages/studio-ui/src/workflow-canvas.tsx`

**Step 1: Create the legend component**

Create `packages/studio-ui/src/workflow-legend.tsx`:

Props: `hiddenTypes: Set<WorkflowEdgeType>`, `onToggleType: (type: WorkflowEdgeType) => void`, `onShowAll: () => void`, `onHideAll: () => void`

Renders a glass-background panel (`bg-[var(--glass-bg)] backdrop-blur-xl border border-[var(--glass-border)]`) positioned absolute top-right of the canvas container.

For each edge type in `WORKFLOW_EDGE_TYPES`:
- Clickable row with: colored line swatch (short SVG `<line>`), type label
- Active types: full color. Hidden types: `opacity-40` + `line-through` on label
- `onClick` → calls `onToggleType(type)`

Bottom: "Show all" / "Hide all" buttons (small, `variant="ghost"`, `size="sm"`).

Header: `font-mono text-[10px] text-muted-foreground tracking-wider` — "DATA FLOW"

**Step 2: Wire legend to canvas edge filtering**

In `workflow-canvas.tsx`:
1. Add `hiddenEdgeTypes` state (`Set<WorkflowEdgeType>`, hydrated from localStorage `workflow-hidden-edges`)
2. Filter `edges` passed to ReactFlow: exclude edges whose `data.edgeType` is in `hiddenEdgeTypes`
3. Pass `hiddenTypes` + handlers to `<WorkflowLegend>`
4. Persist changes to localStorage on toggle

Position the legend as `absolute top-3 right-3 z-10` within the canvas container div.

**Step 3: Verify — clicking legend types hides edges**

Dev server: click "Code" in legend → violet edges disappear. Click again → they return. "Hide all" → all edges hidden. "Show all" → all restored.

**Step 4: Commit**

```bash
git add packages/studio-ui/src/workflow-legend.tsx packages/studio-ui/src/workflow-canvas.tsx
git commit -m "feat(workflow-canvas): interactive edge type legend with toggle filtering"
```

---

### Task 9: Animation toggle + minimap + hover tooltips

**Files:**
- Create: `packages/studio-ui/src/workflow-toolbar.tsx`
- Modify: `packages/studio-ui/src/workflow-canvas.tsx`
- Modify: `packages/studio-ui/src/workflow-nodes.tsx`

**Step 1: Create toolbar component**

Create `packages/studio-ui/src/workflow-toolbar.tsx`:

A row of control buttons positioned absolute bottom-left. Contains:
- Flow toggle: "Flow" label + on/off state. Uses shadcn `Button` variant `"ghost"` size `"sm"`. Toggles `flowEnabled` state.
- (Mermaid export button added in Task 10)

Props: `flowEnabled: boolean`, `onToggleFlow: () => void`

**Step 2: Add flow context + minimap**

In `workflow-canvas.tsx`:
1. Add `flowEnabled` state (default `true`, hydrated from localStorage `workflow-flow-enabled`)
2. Pass `flowEnabled` down to custom edges (via edge `data` prop or React context)
3. Add `<MiniMap />` from `@xyflow/react` as child of `<ReactFlow>`:
   - `position="bottom-right"`
   - `nodeColor` function that returns phase-specific colors (gold for most, copper for morning-review, bronze for audit)
   - `pannable` and `zoomable` props

**Step 3: Add hover tooltips to nodes**

In `workflow-nodes.tsx`, wrap each node component's content with the `NodeTooltip` component from the ui.reactflow.dev registry:
- Tooltip content: node label, phase, skill (if present)
- Only show on hover (not on selected nodes — the detail pane already shows this info)

**Step 4: Verify — flow toggle, minimap, tooltips all work**

Dev server: Flow toggle disables/enables particle animations and flow dashes. MiniMap renders in bottom-right showing the full graph. Hovering a node shows a tooltip.

**Step 5: Commit**

```bash
git add packages/studio-ui/src/workflow-toolbar.tsx packages/studio-ui/src/workflow-canvas.tsx packages/studio-ui/src/workflow-nodes.tsx
git commit -m "feat(workflow-canvas): animation toggle, minimap, hover tooltips"
```

---

## Session 4: Polish — Mermaid Export + Layout Persistence + Page Rewrite

### Task 10: Mermaid export

**Files:**
- Modify: `packages/studio-core/src/workflow.ts`
- Modify: `packages/studio-ui/src/workflow-toolbar.tsx`

**Step 1: Write the Mermaid export function**

Add `exportWorkflowAsMermaid()` to `packages/studio-core/src/workflow.ts`:

A pure function that generates a Mermaid `flowchart TB` string from `WORKFLOW_NODES`, `WORKFLOW_EDGES`, `WORKFLOW_PHASE_GROUPS`.

Logic:
1. Start with `flowchart TB\n`
2. For each trigger node: `  id(["Label"])\n`
3. For each phase group: `  subgraph GroupId["Label"]\n    direction TB\n`
   - For each node in the group: `  id["Label | subtitle"]\n` (use `{{}}` for decision nodes)
   - For each edge between nodes in the group: `  source --> target\n` (with `-->|label|` if labeled)
   - Close with `  end\n`
4. For each edge connecting nodes in different groups: `  source -->|label| target\n`
5. Return the string

This should produce output equivalent to the original `WORKFLOW_DIAGRAM` constant in the old page.

**Step 2: Add Mermaid export button to toolbar**

In `workflow-toolbar.tsx`:
1. Import `exportWorkflowAsMermaid` from `@sherpa/studio-core`
2. Add "Copy Mermaid" button with `ClipboardIcon` from lucide-react
3. On click: `navigator.clipboard.writeText(exportWorkflowAsMermaid())` + optionally show a brief "Copied!" feedback (change button text for 2s via state)

**Step 3: Verify — Mermaid export produces valid diagram**

Click "Copy Mermaid" → paste into https://mermaid.live. Should render the same workflow topology.

**Step 4: Commit**

```bash
git add packages/studio-core/src/workflow.ts packages/studio-ui/src/workflow-toolbar.tsx
git commit -m "feat(workflow-canvas): Mermaid export — copy workflow as Mermaid text"
```

---

### Task 11: Layout persistence

**Files:**
- Modify: `packages/studio-ui/src/workflow-canvas.tsx`

**Step 1: Save positions on drag end**

In `workflow-canvas.tsx`:
1. Add `onNodeDragStop` handler:
   - Read current node positions from the nodes state
   - Build a `Record<string, { x: number; y: number }>` map
   - `localStorage.setItem('workflow-layout', JSON.stringify(positions))`
2. On mount (in the ELK useEffect):
   - Check `localStorage.getItem('workflow-layout')`
   - If saved positions exist and match current node IDs → apply them, skip ELK
   - If not → run ELK, then save result to localStorage

**Step 2: Add "Reset Layout" to toolbar**

Add a "Reset Layout" button to `workflow-toolbar.tsx`:
- On click: `localStorage.removeItem('workflow-layout')`, then trigger ELK re-layout
- Pass a `onResetLayout` prop from `workflow-canvas.tsx`

**Step 3: Verify — layout persists across page loads**

1. Drag some nodes around
2. Reload the page → nodes should be in their dragged positions
3. Click "Reset Layout" → nodes snap back to ELK-computed positions

**Step 4: Commit**

```bash
git add packages/studio-ui/src/workflow-canvas.tsx packages/studio-ui/src/workflow-toolbar.tsx
git commit -m "feat(workflow-canvas): layout persistence via localStorage + reset button"
```

---

### Task 12: Barrel exports + re-export + final page rewrite

**Files:**
- Modify: `packages/studio-ui/src/index.ts`
- Create: `apps/studio/src/components/studio/workflow-canvas.tsx` (re-export)
- Modify: `apps/studio/src/app/workflow/page.tsx` (finalize)

**Step 1: Add barrel exports to studio-ui**

Add to `packages/studio-ui/src/index.ts`:

```typescript
export * from "./workflow-canvas"
export * from "./workflow-nodes"
export * from "./workflow-edge"
export * from "./workflow-detail-pane"
export * from "./workflow-legend"
export * from "./workflow-toolbar"
```

**Step 2: Create studio re-export**

Create `apps/studio/src/components/studio/workflow-canvas.tsx`:

```typescript
export { WorkflowCanvas } from "@sherpa/studio-ui/workflow-canvas";
```

This follows the existing pattern where `apps/studio/src/components/studio/` re-exports from `@sherpa/studio-ui`.

**Step 3: Finalize the page**

Ensure `apps/studio/src/app/workflow/page.tsx` is clean:
- Server component with metadata
- `SectionHeader` with label="Process" title="Product Workflow"
- Canvas container fills available height
- No trace of the old `WORKFLOW_DIAGRAM` constant or `MermaidDiagram` import

**Step 4: Full verification**

```bash
cd /Users/rob/Workbench/sherpa && pnpm check && pnpm build
```

Then manual verification on dev server — walk through all success metrics:
1. Click any node → detail pane opens with metadata, connections, skill command
2. Click "Open in Studio" → navigates to correct page
3. Drag nodes → reload → positions persist
4. Canvas shows all 6 phases, 17 nodes, ~28 typed edges, 2 feedback loops
5. Edges show 9 distinct colors/thicknesses, animated types show particles
6. Click "Copy Mermaid" → paste into mermaid.live → renders correctly
7. Legend filtering works — toggle types on/off
8. Flow toggle disables/enables animations
9. MiniMap shows full graph
10. Zoom, pan, fit all work

**Step 5: Commit**

```bash
git add -A && git commit -m "feat(workflow-canvas): complete interactive workflow canvas with data-flow visualization

Replaces static Mermaid diagram with @xyflow/react canvas. Features:
- 17 nodes across 6 phases with gold/copper theme
- 9 typed data-flow edges with color, thickness, particles
- Inline detail pane with navigation links and copyable skills
- Interactive legend with edge type filtering
- Animation toggle, minimap, layout persistence
- Mermaid export for sharing"
```

---

## Reference

**Key files to read before starting:**
- `packages/studio-core/src/process-nodes-shared.ts` — type/const convention to match
- `packages/studio-ui/src/resize-handle.tsx` — existing ResizeHandle component
- `packages/studio-ui/src/process-graph.tsx` — existing D3 graph for style reference (KIND_COLORS, STATUS_OPACITY patterns)
- `apps/studio/src/styles/globals.css` — theme variables, glass tokens, animation keyframes
- `apps/studio/src/app/workflow/page.tsx` — the Mermaid string to migrate (canonical workflow topology)
- `packages/studio-ui/src/mission-workspace.tsx` — ResizeHandle + detail pane layout pattern

**Prototype:** `docs/initiatives/studio-workflow-canvas/prototype.html` — open in browser for visual reference of node design, edge colors, detail pane layout, and legend positioning.

**shadcn rules:**
- `gap-*` not `space-*` for spacing
- `cn()` for conditional classes
- `size-*` for equal dimensions
- Semantic colors (`bg-card`, `text-muted-foreground`) — never raw values
- Icons use `data-icon`, no sizing classes on icons inside components
- `Badge` for status indicators, not custom spans

**No-gos (from shape):**
- No arbitrary workflow builder (no add/delete nodes or draw edges)
- No Mermaid import
- No live data in detail panels
- No multi-workflow support
- No collaborative features
