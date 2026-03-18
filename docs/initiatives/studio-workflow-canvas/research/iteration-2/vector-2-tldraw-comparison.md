# Vector 2: tldraw as Alternative Canvas Engine

**Question:** Is tldraw a better canvas framework than @xyflow/react for our workflow diagram?
**Agent dispatched:** 2026-03-16

## Findings

**tldraw v4.4.1** (March 2026). React 19 first-class since v4.3 (January 2026).

**Custom shapes:** Extend `ShapeUtil`, implement `component()` (React JSX inside `HTMLContainer`), `indicator()` (SVG selection outline), `getGeometry()` (hit testing), `getDefaultProps()`. shadcn/ui components work inside shapes since `HTMLContainer` is standard React DOM.

**Edge routing is limited:** Only `arc` (curved) and `elbow` (right-angle). No waypoints, no custom paths. Orthogonal/polyline routing requested August 2025 (issue #6664) — still open with no timeline.

**No auto-layout included.** Community project (tldraw-graph-layout) shows force-directed via WebCola, but it's DIY.

**Grouping:** `TLGroupShape` (logical, invisible) and `TLFrameShape` (visual container with label/border). Frames work well for phase grouping.

**Bundle:** ~130-150KB gzipped — 2-3x larger than @xyflow/react (~55KB gzipped).

**Workflow Starter Kit exists** but is a scaffold (source code you copy), not a library. Port-based connections, graph execution engine, `NodeDefinition<T>` base class.

**Game-engine data model:** Reactive signals (not React state), spatial R-tree index, viewport culling. Powerful but different mental model from standard React.

## Comparison Table

| Criterion | tldraw v4.4 | @xyflow/react v12.10 | Edge |
|---|---|---|---|
| React 19 | Yes | Yes | Tie |
| shadcn/ui integration | Works (HTMLContainer) | **Official shadcn registry** | xyflow |
| Directed edges with labels | arc/elbow only | 5 built-in types + custom | xyflow |
| Edge routing | Limited, no waypoints | bezier, straight, step, smoothstep, custom | xyflow |
| Auto-layout | DIY | DIY (same) | Tie |
| Phase grouping | Frames (strong) | SubFlows/group nodes | Slight: tldraw |
| Bundle size | ~130-150KB gz | ~55KB gz | xyflow |
| Learning curve | High (game engine) | Medium (React-idiomatic) | xyflow |
| Workflow primitives | Starter kit (scaffold) | Purpose-built | xyflow |

## Sources

- https://tldraw.dev/releases
- https://tldraw.dev/starter-kits/workflow
- https://github.com/tldraw/tldraw/issues/6664
- https://tldraw.dev/docs/shapes
- https://tldraw.dev/sdk-features/groups
- https://tldraw.dev/docs/persistence

## Implications

**tldraw is a whiteboard SDK; @xyflow/react is a workflow diagram library.** tldraw becomes the right choice if the canvas needs freehand drawing, sticky notes, or whiteboarding alongside the workflow. For a structured workflow visualization, @xyflow is purpose-built, lighter, and has the shadcn integration story.

## Open Questions

1. If we ever want freeform annotation on the workflow canvas, tldraw's model would support it.
2. CSS variable conflicts between tldraw internals and Tailwind v4?
