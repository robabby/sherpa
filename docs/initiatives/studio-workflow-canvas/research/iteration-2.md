# Iteration 2 — 2026-03-16

## What We Already Knew

Iteration 1 identified @xyflow/react + ELK as the technical stack. The interaction model (right-side panel, hover tooltips, on-node status badges) was validated by industry consensus. Open question: is @xyflow/react actually the best choice, especially for shadcn/ui integration?

## Findings

### Vector 1: @xyflow/react shadcn Integration
**Question:** How does @xyflow/react integrate with shadcn/ui?
**Full report:** [iteration-2/vector-1-xyflow-shadcn-integration.md](iteration-2/vector-1-xyflow-shadcn-integration.md)

- **ui.reactflow.dev is a shadcn-style component registry** — 17 free components installable via `pnpm dlx shadcn@latest add https://ui.reactflow.dev/<component>`.
- Components use shadcn CSS variables directly (`bg-card`, `text-card-foreground`) — our theme applies automatically.
- `base-node`, `node-tooltip`, `labeled-group-node`, `node-status-indicator` map directly to our requirements.
- Explicitly updated for React 19 + Tailwind v4 in October 2025.

**Implications:** @xyflow/react is the ONLY canvas library with a first-class shadcn component registry. This is a decisive differentiator.

### Vector 2: tldraw as Alternative
**Question:** Is tldraw a better fit for our workflow canvas?
**Full report:** [iteration-2/vector-2-tldraw-comparison.md](iteration-2/vector-2-tldraw-comparison.md)

- tldraw v4.4.1 is a whiteboard SDK — powerful but purpose-built for freeform drawing, not structured workflows.
- Edge routing limited to arc/elbow (no waypoints, no custom paths). Orthogonal routing is an open feature request.
- Bundle is 2-3x larger (~130-150KB gz vs ~55KB gz).
- Game-engine data model (reactive signals, R-tree index) — different mental model from React state.

**Implications:** tldraw is the right choice if we need freeform annotation alongside the workflow. For a structured workflow visualization, it adds surface area without proportional benefit.

### Vector 3: Full Library Landscape
**Question:** What are ALL viable alternatives?
**Full report:** [iteration-2/vector-3-alternative-libraries.md](iteration-2/vector-3-alternative-libraries.md)

- **The landscape has consolidated dramatically.** Most 2022-2023 era libraries are archived or stale: Reaflow (archived Jan 2026), beautiful-react-diagrams (abandoned), react-diagrams (stale 12+ months), butterfly-dag React wrapper (unmaintained), diagram-maker (archived).
- **Canvas-rendered libraries disqualified:** Cytoscape.js and GoJS render to `<canvas>` — shadcn/Tailwind styling doesn't apply to node interiors.
- **@antv/x6 is the only other active option** but has imperative API, deprecated React wrapper, and predominantly Chinese docs.
- **Commercial options (JointJS+ $2,990/dev, GoJS $3,995)** are overkill for internal tooling.

**Implications:** No other library meets all criteria: actively maintained + React 19 + shadcn integration + React component nodes + subflows + MIT licensed.

### Vector 4: DIY from Primitives
**Question:** Could we build the canvas from D3 + shadcn/ui without a framework?
**Full report:** [iteration-2/vector-4-canvas-from-primitives.md](iteration-2/vector-4-canvas-from-primitives.md)

- **Viable for our scale** (10 nodes, ~15 edges). The architecture is identical to what @xyflow/react does internally (d3-zoom + CSS transforms + SVG edges + HTML nodes).
- **Costs 3-4 extra sessions** of infrastructure work (pan/zoom, drag, edges, minimap, selection).
- **Zero impedance mismatch** — shadcn Cards are just positioned Cards, no framework node types to wrap.
- **Key risk:** Edge connection handles are genuinely hard to implement (hit detection, validation, visual feedback during drag).

**Implications:** DIY makes sense only if we need total design control or @xyflow proves incompatible. The 3-4 session delta is not justified when @xyflow has native shadcn integration.

## Synthesis

**The iteration 1 choice is not just confirmed — it's strengthened.**

The key finding that changes the picture: **@xyflow/react is the only canvas library in the entire React ecosystem that has a shadcn-style component registry.** This wasn't surfaced in iteration 1. The components at ui.reactflow.dev use our exact CSS variable tokens (`bg-card`, `text-card-foreground`, `text-muted-foreground`), install via the same `shadcn@latest add` CLI we already use, and were explicitly updated for React 19 + Tailwind v4.

The version number confusion is resolved: `12.10.1` is the **library's** version (12th major release since ~2019), not React's version. It supports React `>=17`, confirmed working with React 19.2.3 via zustand 4.5.6+.

The competitive landscape reinforces this: every other viable library is either a whiteboard tool adapted to workflows (tldraw), canvas-rendered and incompatible with shadcn styling (Cytoscape, GoJS), commercially licensed ($3-4K), or dead. The DIY path is viable but costs 3-4 sessions for infrastructure @xyflow provides free — and @xyflow's components are already styled to our design system.

**One new design decision surfaced:** For the detail panel, we should use shadcn `Sheet` (Radix Dialog, side-panel variant) rather than a custom resizable split. Sheet portals out of the canvas transform automatically, requires zero new dependencies, and is already installed in our project.

## Proposals Generated

Updated proposal with:
- Confirmed @xyflow/react as the definitive choice — now with shadcn integration evidence
- Sheet component for detail panel (already installed, zero new deps)
- `base-node`, `node-tooltip`, `labeled-group-node`, `node-status-indicator` from ui.reactflow.dev as starting components

## Open Questions for Next Iteration

1. **Spike: install @xyflow/react + shadcn components** — Does `pnpm dlx shadcn@latest add https://ui.reactflow.dev/base-node` work in our monorepo workspace? What does the CSS import order look like in our `globals.css`?
2. **labeled-group-node fit** — Does the pre-built group node component handle our 6-phase grouping pattern, or do we need a custom group node?
3. **ELK in Web Worker** — Still needs a spike (carried from iteration 1).
