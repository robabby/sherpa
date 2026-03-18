# Vector 4: Auto-Layout Algorithms for Directed Graphs

**Question:** What layout engines work best with @xyflow/react for directed flowcharts with subgraphs?
**Agent dispatched:** 2026-03-16

## Findings

### Dagre (@dagrejs/dagre)
- **Version:** 2.0.4, actively maintained.
- **Bundle:** ~40KB minified.
- **Integration:** Create `dagre.graphlib.Graph()`, add nodes with dimensions, run `dagre.layout()`, map center-anchor coords to React Flow's top-left anchors.
- **Subgraph support: BROKEN.** Dagre computes viewport-absolute coordinates, not parent-relative. Post-processing needed for child → relative conversion. **Critical:** fails when child nodes have edges to nodes outside the subflow. Unresolved.
- **Verdict:** Works for flat directed graphs. Breaks with 6 phases and cross-boundary edges.

### ELK (elkjs)
- **Bundle:** ~1.45MB minified. Major trade-off.
- **Integration:** Convert React Flow flat nodes → ELK nested `{ id, children: [...] }` format → `elk.layout(graph)` (async) → convert back to flat format with relative coordinates.
- **Subgraph support: First-class.** Designed for hierarchical graphs. Three-phase approach: (1) layout children inside parents, (2) calculate parent dimensions, (3) layout top-level nodes.
- **Key algorithms:** `layered` for directed hierarchical graphs (default in RF examples). Partitioning (`elk.partitioning.activate: true`) guarantees phase order.
- **Feedback loops:** 9 cycle-breaking strategies including GREEDY, DEPTH_FIRST, MODEL_ORDER. Reversed edges render going "back."
- **Known issue:** Rendering order in multi-path subflows can be unpredictable (discussion #4830).
- **Verdict:** Strongest choice for grouped phases + cross-boundary edges + feedback loops. Mitigate bundle with Web Worker.

### d3-dag
- **Status:** "Light maintenance mode." No subgraph support. No React Flow integration pattern.
- **Verdict:** Not recommended.

### @xyflow/layout
- **Does not exist.** No first-party layout package. The "Auto Layout" example is Pro (paywalled).
- **Community alternative:** `@jalez/react-flow-automated-layout` wraps ELK with parent-child support built in.

### Pattern: Auto-Layout Then Drag
1. Run layout on mount → `setNodes()` with computed positions.
2. `onNodesChange` captures user drags via `applyNodeChanges`.
3. Persist positions to Zustand store with `persist` middleware.
4. On next load: persisted positions → skip layout; no positions → run layout.
5. Opacity trick: nodes start `opacity: 0`, layout runs after ResizeObserver, then `opacity: 1`.

## Sources

- https://reactflow.dev/learn/layouting/layouting
- https://reactflow.dev/examples/layout/dagre
- https://reactflow.dev/examples/layout/elkjs
- https://reactflow.dev/learn/layouting/sub-flows
- https://github.com/xyflow/xyflow/discussions/2968
- https://github.com/xyflow/xyflow/discussions/3495
- https://github.com/xyflow/xyflow/discussions/3355
- https://github.com/xyflow/xyflow/discussions/4830
- https://github.com/kieler/elkjs
- https://github.com/erikbrinkman/d3-dag
- https://eclipse.dev/elk/reference/options/org-eclipse-elk-layered-cycleBreaking-strategy.html

## Implications

**ELK is the clear winner** for our graph (6 phase groups, 10 stages, 2 feedback loops, cross-boundary edges). Dagre's subgraph limitation is a hard blocker.

**Bundle mitigation:** Load elkjs in a Web Worker (natively supported) — off main thread, doesn't block initial paint. Code-split the layout step.

**Layout-then-drag workflow:** ELK for initial positioning → user drags → persist to Zustand/localStorage → "Reset Layout" button re-runs ELK.

**Fallback if bundle unacceptable:** Use dagre for flat graph + render phase groups as visual overlays (colored backgrounds) rather than actual parent nodes. Sacrifices containment but keeps ~40KB.

## Open Questions

1. ELK Web Worker in Next.js — verify worker instantiation in browser bundle without SSR issues.
2. Parent node resize on child drag — auto-resize or manual?
3. `@jalez/react-flow-automated-layout` maturity — could save ELK integration work.
