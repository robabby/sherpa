# Vector 4: Building a Canvas from Primitives (D3 + shadcn/ui)

**Question:** Could we build the canvas from shadcn/ui + D3 + Radix without a framework?
**Agent dispatched:** 2026-03-16

## Findings

**Yes, it is viable for our scale (10 nodes, ~15 edges, 6 groups).**

### Architecture

The DIY architecture is identical to what @xyflow/react does internally:
- **Pan/zoom:** D3-zoom on outer container → CSS transform on inner container (`translateX/Y + scale`)
- **Nodes:** shadcn `Card` components, absolutely positioned, draggable via pointer events
- **Edges:** Single full-canvas SVG overlay with `<path>` elements using cubic bezier curves
- **Groups:** Background `<div>` elements positioned behind nodes, styled as phase containers
- **Detail panel:** Radix Sheet (portals out of canvas transform — no positioning issues)
- **Tooltips:** Radix Tooltip (portals to `document.body` — works regardless of zoom)

### What We'd Need to Add

- `d3-zoom` (~6KB gzip) — not currently installed
- `d3-drag` (optional) — pointer events pattern is simpler for our use case

### Effort Comparison

| Task | DIY Sessions | With @xyflow/react |
|---|---|---|
| Pan/zoom canvas | 0.5 | 0.1 |
| Node drag + coord math | 0.5 | 0.1 |
| SVG edge rendering | 0.5 | 0.1 |
| Port handles + connection hit detection | 1.0 | 0.1 (built-in) |
| Minimap | 0.5 | 0.1 (built-in) |
| Selection, keyboard shortcuts | 0.5 | 0.1 (built-in) |
| Custom node styling | 1.0 | 1.0 (same) |
| Group rendering | 0.5 | 0.5 |
| **Total** | **~5 sessions** | **~1.5 sessions** |

**Delta: ~3-4 sessions of infrastructure work.**

### Strongest Argument FOR DIY

Zero impedance mismatch — a `<Card>` is just a `<Card>` positioned by CSS. No wrapping in framework node types. Full design control. Zero framework lock-in.

### Strongest Argument AGAINST DIY

Edge connection handles (circular ports you click-drag to create edges) are genuinely hard to implement correctly — hit detection, connection validation, visual feedback during drag. If we ever need interactive edge creation (not just display), that's non-trivial to replicate.

### Performance Reality

For 10 nodes, ~15 edges: performance is irrelevant as a decision factor. Plain CSS transforms with no optimization will run at 120fps. Even a completely unoptimized implementation would be fine.

## Sources

- https://swizec.com/blog/the-two-ways-to-build-a-zoomable-dataviz-component-with-d3zoom-and-react/
- https://www.steveruiz.me/posts/zoom-ui (Steve Ruiz / tldraw creator)
- https://www.redblobgames.com/making-of/draggable/examples.html
- https://www.productboard.com/blog/how-we-implemented-svg-arrows-in-react-the-curvature-2-3/
- https://github.com/microsoft/react-dag-editor

## Implications

DIY is viable but not recommended. The 3-4 session delta buys us all the infrastructure @xyflow provides (pan/zoom, drag, minimap, controls, edge routing, selection, keyboard shortcuts) — and @xyflow has the shadcn integration that makes its components native to our design system. The DIY approach makes sense only if we need total control over every interaction detail or if @xyflow's rendering model proves incompatible.

## Open Questions

1. Is the canvas read-mostly or fully interactive? Read-mostly tips toward DIY; interactive edge creation tips toward xyflow.
2. Z-order of groups vs edges vs nodes — needs early decision either way.
3. Sheet vs Resizable for detail panel — Sheet requires zero new deps, Resizable needs `react-resizable-panels`.
