# Iteration 1 — 2026-03-16

## Findings

### Vector 1: @xyflow/react Capabilities
**Question:** Current state, custom nodes, subflows, bundle, SSR, interaction, license?
**Full report:** [iteration-1/vector-1-xyflow-react-capabilities.md](iteration-1/vector-1-xyflow-react-capabilities.md)

- v12.10.1, MIT licensed, ~60-80KB gzipped. SSR-native in Next.js (no `dynamic()` hack needed).
- Custom nodes are plain React components. `NodeTooltip` shadcn-style component available for hover.
- Subflow grouping via `parentId` + `type: 'group'` — first-class, with `extent: 'parent'` for containment.

**Implications:** The API surface maps directly to our requirements. No surprising gaps.

### Vector 2: Mermaid Parsing
**Question:** How to parse Mermaid flowchart to structured graph? Existing libraries?
**Full report:** [iteration-1/vector-2-mermaid-parsing.md](iteration-1/vector-2-mermaid-parsing.md)

- Mermaid's internal `getDiagramFromText()` + `diagram.parser.yy` is the proven path (used by Excalidraw).
- `@mermaid-js/parser` v0.6.3 is the official new package but flowchart coverage unconfirmed.
- Export (graph → Mermaid) is 50-100 lines of template generation — no library needed.

**Implications:** Two viable import paths. Test `@mermaid-js/parser` first; fall back to Excalidraw's approach.

### Vector 3: Workflow Canvas UX Patterns
**Question:** How do n8n, Obsidian Canvas, Retool, Windmill, tldraw handle node interaction?
**Full report:** [iteration-1/vector-3-workflow-canvas-ux.md](iteration-1/vector-3-workflow-canvas-ux.md)

- **Two-tier interaction** is universal: hover → quick signal, click → detail panel.
- **Right-side panel** (320-480px) is the dominant convention — not bottom, not modal-first.
- **Status on-node** (n8n, Windmill): badges/icons directly on canvas nodes.
- **JSON Canvas spec** (MIT, from Obsidian) is directly applicable as layout persistence format.

**Implications:** Our UX pattern is validated by industry. Right-side detail panel, on-node status badges, auto-layout with drag override.

### Vector 4: Auto-Layout Algorithms
**Question:** What layout engines handle directed flowcharts with subgraphs in React Flow?
**Full report:** [iteration-1/vector-4-auto-layout-algorithms.md](iteration-1/vector-4-auto-layout-algorithms.md)

- **Dagre is disqualified.** Breaks with subgraph grouping + cross-boundary edges.
- **ELK is the clear winner.** First-class hierarchical layout, 9 cycle-breaking strategies, partitioning for phase ordering. But 1.45MB bundle — mitigate via Web Worker.
- Layout-then-drag pattern is well-established: ELK for initial positioning, user drags persisted, "Reset Layout" button.

**Implications:** ELK is the only viable layout engine for our graph topology. The bundle cost is real but manageable.

## Synthesis

Four signals converge into a clear technical architecture:

**The stack is @xyflow/react + ELK + Mermaid import/export.** This wasn't obvious going in — dagre seemed like the natural first choice, but the subgraph requirement eliminates it entirely. ELK's 1.45MB bundle is the primary trade-off, but it handles every requirement (hierarchical layout, cycle-breaking for feedback loops, phase partitioning) natively.

**The interaction model is validated by industry consensus.** Every major workflow tool uses the same pattern: hover for quick signal, click for right-side detail panel, status badges on-node. n8n's Focus Panel (inline, keeps canvas visible) is the exact pattern we want — not the older modal overlay. Retool's three-category inspector (Content, Interaction, Appearance) maps to our node metadata (governance data, relationships, actions).

**Mermaid as interchange format is the right abstraction.** The parsing landscape is fragmented — no single clean library — but the Excalidraw approach (using mermaid's own parser internals) is proven in production. For export, template generation is trivial. The key insight: generate Mermaid from structured data, not canvas positions. This produces stable, version-controllable output.

**JSON Canvas spec deserves consideration for layout persistence.** Instead of inventing a layout format, store canvas state as JSON Canvas (MIT, Obsidian-compatible). Each node gets `id`, `x`, `y`, `width`, `height`. Edges get `fromNode`, `toNode`, `fromSide`, `toSide`. This gives us free Obsidian interop and a well-specified format.

## Proposals Generated

The existing `proposal.md` is validated and strengthened by this research. Key refinements to incorporate:
- ELK over dagre (dagre doesn't work with our subgraph requirements)
- Right-side detail panel (320-480px), not modal, not bottom panel
- On-node status badges for phase/stage state
- JSON Canvas format for layout persistence (evaluate against plain JSON)
- Mermaid import via `getDiagramFromText` + `parser.yy` (with `@mermaid-js/parser` as preferred if it covers flowchart)
- Web Worker for ELK layout computation

## Open Questions for Next Iteration

1. **`@mermaid-js/parser` flowchart coverage** — Does v0.6.3 actually parse `flowchart TB` with subgraphs? This determines our Mermaid import strategy. A direct test is needed.
2. **ELK Web Worker in Next.js 16** — Can elkjs's Web Worker mode be instantiated in the browser bundle without SSR issues? Needs a spike.
3. **Detail panel content design** — What goes in the right-side panel for each node type? Research/Propose/Review/Plan/Dispatch/Judge each need different scoped views. How much existing Studio data can we wire in?
4. **React 19 + @xyflow/react compatibility** — The app runs React 19.2.3. @xyflow/react v12.10.1 needs a smoke test.
5. **JSON Canvas vs. plain JSON for layout persistence** — JSON Canvas adds Obsidian interop but constrains the schema. Is the interop worth the constraint?
