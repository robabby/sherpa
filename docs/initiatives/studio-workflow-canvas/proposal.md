---
status: approved
initiative: studio-workflow-canvas
created: 2026-03-16
updated: '2026-03-16'
type: new-plan
risk: evolutionary
targets:
  - apps/studio/src/app/workflow/page.tsx
  - packages/studio-core/src/workflow.ts                  # (new file)
  - packages/studio-ui/src/workflow-canvas.tsx             # (new file)
  - packages/studio-ui/src/workflow-node.tsx               # (new file)
  - packages/studio-ui/src/workflow-detail-panel.tsx       # (new file)
  - packages/studio-ui/src/workflow-toolbar.tsx            # (new file)
  - packages/studio-ui/src/mermaid-diagram.tsx
  - packages/studio-ui/src/hub-workflow-panel.tsx
dependencies: []
informs:
  - studio-state-machine
  - studio-process-playbook-ui
personas:
  - engineer
  - product-manager
spawned-from: null
---

# Studio Workflow Canvas

## Summary

Replace the static Mermaid diagram on `/workflow` with an interactive canvas — drag-and-drop node arrangement, hover tooltips with stage metadata, click-to-open detail panels scoped to each node's domain. Mermaid becomes an import/export format rather than the rendering engine, so workflows can be shared as Mermaid text or exported as SVG.

## State Snapshot

The `/workflow` page (`apps/studio/src/app/workflow/page.tsx`, 105 lines) renders a hardcoded Mermaid flowchart string via `MermaidDiagram` (`packages/studio-ui/src/mermaid-diagram.tsx`, 85 lines). The diagram defines 6 phases (Discovery, Governance, Execution, Delivery, Nightly Audit, Morning Review) with 10 stages and two feedback loops. It is entirely static — no click handlers, no tooltips, no node interaction. The `HubWorkflowPanel` shows a compact badge summary on the dashboard.

The workflow data is a 82-line Mermaid string constant. There is no structured data model — phases, stages, connections, and metadata exist only as Mermaid syntax. The Studio app already has D3 (force, selection, scale) and Mermaid as dependencies but no canvas/flow library.

## Proposed Changes

### packages/studio-core — Workflow data model

New `workflow.ts` module defining the structured data model: `WorkflowNode` (id, label, type, phase, skill/artifact reference, position), `WorkflowEdge` (source, target, label, condition), `WorkflowPhase` (id, name, nodes). Includes a Mermaid parser (import: Mermaid string to workflow graph) and Mermaid exporter (workflow graph to Mermaid string). Also an SVG export utility. The existing hardcoded Mermaid string migrates to this structured format as the canonical source.

### packages/studio-ui — Canvas components

**`workflow-canvas.tsx`** — The main canvas surface. Renders nodes and edges on a pannable, zoomable canvas with drag-and-drop repositioning. Phase subgraphs render as grouped regions. Uses `@xyflow/react` (the React Flow successor) as the canvas engine — mature, well-maintained, handles pan/zoom/drag/minimap/controls out of the box.

**`workflow-node.tsx`** — Custom node renderer. Three node variants: stage (rectangle), decision (diamond), trigger (stadium/pill). Matches the existing gold/dark theme. Hover shows a tooltip with stage description, linked skill, and current status. Click opens the detail panel.

**`workflow-detail-panel.tsx`** — Slide-out panel when a node is clicked. Shows node metadata, relationships (inbound/outbound edges), the linked skill or artifact, and contextual actions. For example: "Research | /rr" shows active research cycles; "Dispatch" shows the task board summary; "Propose" shows pending proposals. Each node type maps to a scoped view of existing Studio data.

**`workflow-toolbar.tsx`** — Canvas toolbar with: zoom controls, fit-to-view, minimap toggle, import from Mermaid, export to Mermaid, export to SVG. The import/export makes workflows shareable — paste a Mermaid diagram from a colleague, or export your workflow for documentation.

### apps/studio — Page rewrite

`workflow/page.tsx` rewrites from a Mermaid render to the canvas component. The page loads the structured workflow data, passes it to `WorkflowCanvas`, and manages the detail panel state. The `MermaidDiagram` component stays in the codebase (used elsewhere and as the Mermaid preview in import/export) but is no longer the primary renderer on this page.

### Hub panel update

`hub-workflow-panel.tsx` updates to use the structured data model from `studio-core/workflow.ts` instead of its hardcoded `STAGES` array, keeping the two in sync.

## Rationale

The workflow page is the single most important map in the system — it shows the entire operational loop. But it's inert. You can look at it but can't interact with it, inspect node state, or rearrange the layout to match your mental model.

**Why a canvas, not enhanced Mermaid:** Mermaid is a documentation format. It excels at rendering static diagrams from text. But it doesn't support drag-and-drop, click handlers on individual nodes, or detail panels. Wrapping Mermaid SVG with JS click handlers is fragile (Mermaid regenerates the SVG on any change, IDs aren't stable). A proper canvas engine gives us the interaction layer natively.

**Why @xyflow/react:** It's the successor to React Flow, the most widely-used React canvas library. Handles pan/zoom/drag/minimap, custom node renderers, edge routing, and grouped nodes. MIT licensed. The alternatives (D3-only, Konva, Cytoscape) all require significantly more custom code for the same interaction patterns.

**Why Mermaid as import/export:** Mermaid is the lingua franca for workflow diagrams in technical contexts. Keeping it as an interchange format means workflows can be shared in Markdown, pasted into GitHub issues, or imported from existing documentation. SVG export covers the visual sharing use case (Slack, presentations, docs).

**Scope boundary:** This initiative builds an interactive viewer/editor for a defined workflow. It does not build an arbitrary workflow builder (add-any-node, user-defined connections). The workflow topology comes from structured data — the canvas makes it inspectable and rearrangeable, not user-authored from scratch. That's a future evolution if the need arises.

## Dependencies

- **`studio-state-machine`** (informs) — lifecycle intelligence could eventually feed node status indicators (e.g., "Research has 3 active cycles"), but this initiative doesn't block on it. The detail panel can start with static metadata and gain live state later.
- **`dispatch-center`** (informs, integrated) — dispatch data feeds the Execution phase nodes. Already landed, so task board data is available.

## Review Notes

**Library choice (research-validated):** `@xyflow/react` v12.10.1 adds ~60-80KB gzipped. SSR-native in Next.js (no `dynamic({ ssr: false })` needed). MIT licensed. Custom nodes are plain React components; `NodeTooltip` (shadcn-style) available for hover. Canvas must be `'use client'` boundary.

**Layout engine:** ELK (`elkjs`) is the only viable layout engine — dagre breaks with subgraph grouping + cross-boundary edges. ELK handles hierarchical layout, cycle-breaking (9 strategies for feedback loops), and phase partitioning natively. Trade-off: ~1.45MB bundle — mitigate via Web Worker (ELK supports this natively) and code-splitting the layout step.

**Interaction model (industry-validated):** Right-side detail panel (320-480px) is the dominant convention (n8n Focus Panel, Windmill Action Editor, Retool split view). On-node status badges for phase state. Two-tier: hover → tooltip, click → panel.

**Layout persistence:** Zustand store with `persist` middleware for drag positions. ELK auto-layout on first visit; persisted positions override on subsequent visits. "Reset Layout" button re-runs ELK. Consider JSON Canvas format (MIT, Obsidian-compatible) for the persistence schema.

**Mermaid import strategy:** Two paths — test `@mermaid-js/parser` v0.6.3 first (official, clean API). Fall back to Excalidraw's proven `getDiagramFromText()` + `diagram.parser.yy` approach. Export is 50-100 lines of template generation.

**Detail panel scope:** v1 shows metadata and relationships. Wiring to live Studio data (active research cycles, pending proposals, task board) is incremental follow-on.

**Open from research:** React 19.2.3 + @xyflow/react compatibility needs smoke test. ELK Web Worker in Next.js 16 needs spike validation.

**Effort:** 4 sessions
**Session breakdown:**
- Session 1: Structured data model in studio-core, Mermaid parser/exporter, @xyflow/react + elkjs setup and proof-of-life canvas render with ELK auto-layout
- Session 2: Custom node types (stage/decision/trigger), edge styles, phase grouping as subflows, theme matching (gold/dark), on-node status badges
- Session 3: Hover tooltips (NodeTooltip), click → right-side detail panel (320-480px) with per-node-type views, toolbar (zoom, fit, minimap)
- Session 4: Drag-and-drop layout persistence (Zustand persist), Mermaid import/export UI, SVG export, hub panel migration
