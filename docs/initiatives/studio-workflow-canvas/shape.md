---
appetite: 4 sessions
shaped: 2026-03-16
reshaped: 2026-03-16
---

# Studio Workflow Canvas — Shape

## Appetite

**4 sessions.** Reshaped from 3 after prototype review surfaced five features that belong in v1: data-flow edge visualization, node → page navigation, legend filtering, animation toggle, and Mermaid export. These turn the canvas from a visualization into a control surface — worth the extra session.

Session budget:
- **Session 1:** Data model, @xyflow/react + ELK setup, proof-of-life render
- **Session 2:** Custom nodes, typed data-flow edges (9 types, colors, thickness), phase groups, theme
- **Session 3:** Detail pane with page navigation links, hover tooltips, legend with edge filtering, animation toggle, minimap
- **Session 4:** Mermaid export, layout persistence, controls bar, polish, page rewrite

## Evidence & Success

**Customer evidence:** Builder judgment. The workflow page is the most-visited non-hub page in Studio. It's the only place that shows the complete operational loop, but every interaction with it ends at "look at the diagram" — there's no way to drill into a stage, understand its state, or rearrange the layout to match your mental model. The screenshot that spawned this initiative shows the pain: a dense Mermaid diagram where you can see the structure but can't interact with it.

**Success metrics:**
1. A user can click any workflow stage node and see its metadata, relationships, and linked skill/artifact in a detail panel — without leaving the workflow page.
2. A user can click a link in the detail panel to navigate to the relevant Studio page (e.g., Research → `/process`, Dispatch → `/dispatch`).
3. A user can drag nodes to rearrange the layout, and that layout persists across page loads.
4. The canvas renders the same 6-phase, 10-stage, 2-feedback-loop topology as the current Mermaid diagram — no information loss.
5. Edge types visually distinguish what flows through the system (ideas, code, content, governance, feedback loops) via color, thickness, and optional animation.
6. A user can export the workflow as Mermaid text for sharing in docs, GitHub issues, or Markdown.

**Personas served:** `engineer` (primary — interacts with the workflow daily), `product-manager` (secondary — reviews the operational loop, needs to understand flow).

## Shaped Solution

### Layer 1: Structured data model (studio-core)

Migrate the hardcoded Mermaid string to a typed graph: `WorkflowNode[]` (id, label, nodeType, phase, skill reference) + `WorkflowEdge[]` (source, target, label, condition) + `WorkflowPhase[]` (id, name, color). This is a static data file — not parsed from Mermaid at runtime. The Mermaid string becomes a test fixture ("does our data model produce the same topology?").

Export a `getWorkflowGraph()` function that returns the canonical workflow as @xyflow/react-compatible nodes and edges.

### Layer 2: Canvas rendering (studio-ui)

A `'use client'` component wrapping `<ReactFlow>`. Install `@xyflow/react` and the shadcn components from ui.reactflow.dev: `base-node`, `node-tooltip`, `labeled-group-node`, `node-status-indicator`.

Three custom node types extending `BaseNode`:
- **StageNode** — rectangle, gold border. Shows label + skill reference. Tooltip on hover.
- **DecisionNode** — diamond shape (CSS rotate-45 + counter-rotate content). Shows label.
- **TriggerNode** — stadium/pill shape. Entry point styling.

Phase groups use `labeled-group-node` (or a custom group node if the pre-built one doesn't fit). Six groups, each with a phase label and subtle background tint.

ELK computes initial layout. Nodes get positioned, then the user can drag to rearrange. `fitView()` on mount.

### Layer 3: Data-flow edge visualization

9 edge types, each with distinct color, thickness, and optional flow animation:

| Type | Color | Thickness | Animation | Carries |
|------|-------|-----------|-----------|---------|
| Ideas | copper | thin | slow particles | Research signals, raw ideas |
| Governance | gold | medium | — | Proposals, review decisions |
| Tasks | bright gold | thick | fast particles + flow | Approved work, task plans |
| Code | violet | thick | fast particles + flow | Code tasks to workers |
| Content | green | medium | — | Content to LM Studio |
| Review | blue | medium | — | Review to CLI agents |
| Delivery | emerald | medium | — | Approved work shipping |
| Audit | bronze | thin | slow particles | Nightly pipeline |
| Feedback | red dashed | thin | slow particles | Loops: declined, needs changes |

Each edge renders in 3-4 layers: glow (wide, low opacity) → main path → flow dashes (if animated) → particle dots traveling along the path.

### Layer 4: Detail panel + navigation

Inline split pane (ResizeHandle pattern, matching MissionWorkspace). Opens on node click. Shows:
- Node name, phase badge, skill/artifact reference
- **"Open in Studio" link** — navigates to the relevant Studio page (Research → `/process?kind=initiative`, Dispatch → `/dispatch`, Tasks → `/tasks`)
- Inbound and outbound connections (with edge type colors)
- "Copy skill command" button if the node has a linked skill
- Placeholder for future live data

### Layer 5: Legend, filtering, animation control

- **Interactive legend** (top-right) — shows all 9 edge types. Click a type to toggle visibility. Lets users trace a single concern through the system.
- **Animation toggle** — "Flow: On/Off" in controls bar. Persists preference to localStorage.
- **Minimap** — ReactFlow `<MiniMap>` component. Shows viewport position in the full graph. `nodeColor` function colors nodes by phase.

### Layer 6: Mermaid export

Pure function: graph data → Mermaid `flowchart TB` string (~50-100 lines of template generation). Exposed via toolbar button: "Copy as Mermaid" → clipboard. No import (that's a rabbit hole). The structured TypeScript data is the source of truth; Mermaid is an export format for sharing.

### Layer 7: Page rewrite

`workflow/page.tsx` becomes a thin server component that imports the client canvas. `SectionHeader` stays. The Mermaid `<div>` is replaced by the canvas component. Canvas fills available height.

### What we're NOT building in this appetite

- Mermaid import UI (follow-on — parser API is unstable)
- SVG export (follow-on)
- Hub panel migration (follow-on — current `HubWorkflowPanel` keeps working)
- Live data in detail panels (follow-on — depends on `studio-state-machine`)
- Edge throughput driven by real data (follow-on — depends on task dispatch data)

## Rabbit Holes

1. **ELK bundle size optimization.** ELK is 1.45MB. The temptation is to set up a Web Worker, code-split it perfectly, measure bundle impact, etc. **Avoid:** Just dynamically import elkjs in the client component. It only loads on the /workflow route. Optimize later if bundle analysis shows a real problem. Don't spend a session on Worker setup for a route visited by 1-2 people.

2. **Mermaid parser for import.** The proposal includes a Mermaid parser (import Mermaid text → graph). This is a rabbit hole — Mermaid's parser API is unstable, the `@mermaid-js/parser` package has uncertain flowchart coverage, and the Excalidraw approach uses deprecated APIs. **Avoid:** The canonical workflow is a TypeScript data file, not a Mermaid string. Mermaid import is a follow-on feature. Build the Mermaid exporter (graph → Mermaid string, ~50 lines) only if time permits.

3. **Custom diamond/pill node shapes with perfect geometry.** CSS rotate-45 for diamonds works but creates edge handle positioning headaches (handles need to be at the diamond's visual corners, not the rotated square's sides). **Avoid:** Start with all rectangles. Add diamond and pill variants as visual refinements after the canvas works. The node shape is cosmetic — the interaction model is what matters.

4. **Per-node-type detail panel views.** The proposal describes Research showing active cycles, Dispatch showing the task board, Propose showing pending proposals. Each is a mini-integration with a different data source. **Avoid:** v1 detail panel shows the same metadata layout for every node type — name, phase, skill, connections. Per-node-type views are follow-on once the panel works.

5. **Layout persistence schema design.** JSON Canvas format, localStorage vs IndexedDB, Zustand persist middleware configuration, serialization edge cases. **Avoid:** Use `localStorage.setItem('workflow-layout', JSON.stringify(positions))` directly. No Zustand persist, no schema design. Refactor later if needed.

## No-Gos

- **No arbitrary workflow builder.** Users cannot add nodes, delete nodes, or draw new edges. The workflow topology is defined in code. The canvas is for viewing and rearranging, not authoring.
- **No Mermaid import UI.** Parsing Mermaid text into a graph is out of scope. Export only. The Mermaid string becomes a test fixture, not a runtime input.
- **No live data in detail panels.** The detail panel shows static metadata from the workflow data model. Wiring to initiative status, task board, or research state is a separate initiative.
- **No multi-page/multi-workflow support.** One workflow, one canvas. The concept of "multiple workflow definitions" is future scope.
- **No collaborative/real-time features.** No shared layout, no multiplayer canvas.

## Kill Criteria

1. **If @xyflow/react + React 19.2.3 has a blocking incompatibility** (zustand conflict, hydration errors, SSR failures) that can't be resolved in the first hour of session 1 — stop, file an issue on xyflow, and pivot to DIY canvas with D3 (budget: +2 sessions, reshape to 5).
2. **If ELK cannot produce a readable layout** for our specific graph (6 phases, cross-boundary edges, 2 feedback loops) after reasonable configuration — stop, fall back to manual positions defined in the data model (no auto-layout, just hardcoded x/y).
3. **If the shadcn components from ui.reactflow.dev don't install cleanly** in our pnpm monorepo workspace — fall back to writing custom node components from scratch using @xyflow/react's node API directly (add ~0.5 sessions).
