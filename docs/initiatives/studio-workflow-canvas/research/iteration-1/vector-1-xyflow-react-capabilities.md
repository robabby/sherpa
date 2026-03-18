# Vector 1: @xyflow/react Capabilities

**Question:** What is the current state of @xyflow/react? Custom nodes, subflows, bundle size, Next.js/SSR, hover/click, minimap/controls, license.
**Agent dispatched:** 2026-03-16

## Findings

**Current Version:** 12.10.1. Renamed from `reactflow` to `@xyflow/react` in v12.

**Custom Nodes:** Plain React components registered via `nodeTypes` map passed to `<ReactFlow nodeTypes={nodeTypes} />`. Map must be defined outside render function. `NodeProps` interface: `id`, `data`, `type`, `selected`, `dragging`, `isConnectable`, `positionAbsoluteX/Y`, `width`, `height`, `parentId`, `sourcePosition`, `targetPosition`.

**Subflow/Grouping:** Parent-child via `parentId` on child nodes. `type: 'group'` is a convenience built-in. `extent: 'parent'` constrains children. Parent nodes must appear before children in array. Nested grouping supported.

**Bundle Size:** ~60-80KB gzipped estimated (split across `@xyflow/react` + `@xyflow/system`). Old v11 was ~73KB gzipped.

**Next.js/SSR:** v12 added first-class SSR support. No `dynamic({ ssr: false })` needed. Nodes need `width`/`height` or `initialWidth`/`initialHeight` for meaningful server HTML. Canvas itself must be `'use client'` (mouse/pointer events, D3 zoom).

**Hover Tooltips:** `onNodeMouseEnter`/`onNodeMouseLeave` on `<ReactFlow>`. `NodeToolbar` built-in for action panels. `NodeTooltip` from React Flow Components (shadcn-style, installed via `npx shadcn@latest add https://ui.reactflow.dev/node-tooltip`).

**Click Handlers:** `onNodeClick: (event, node) => void` on `<ReactFlow>`. `.nodrag` CSS class on interactive inner elements. Pattern: store `selectedNode` in state, render side panel.

**Minimap/Controls/Background:** All named exports, rendered as children of `<ReactFlow>`. Background: dots/lines/cross variants. Controls: zoom, fit-view, interactive toggle. MiniMap: `nodeColor` as function, `pannable`, `zoomable`.

**License:** MIT. Pro subscription for advanced templates/support, not a license gate.

## Sources

- https://www.npmjs.com/package/@xyflow/react
- https://xyflow.com/blog/react-flow-12-release
- https://reactflow.dev/learn/customization/custom-nodes
- https://reactflow.dev/api-reference/types/node-props
- https://reactflow.dev/learn/layouting/sub-flows
- https://reactflow.dev/api-reference/components/node-toolbar
- https://reactflow.dev/ui/components/node-tooltip
- https://reactflow.dev/api-reference/components/background
- https://reactflow.dev/api-reference/components/controls
- https://reactflow.dev/api-reference/components/minimap
- https://xyflow.com/open-source

## Implications

- Custom shapes (rectangle, diamond, pill) are straightforward — three entries in `nodeTypes`, Tailwind/CSS for shape styling.
- Grouped phases: `type: 'group'` parent nodes with explicit size, nest step nodes with `parentId`.
- Hover tooltips: `NodeTooltip` pattern renders outside node stacking context, prevents clipping.
- Click-to-detail: `onNodeClick` at `<ReactFlow>` level → store selectedNode → render side panel.
- SSR works in Next.js 16 without `dynamic()` wrapper, but canvas must be `'use client'`.

## Open Questions

1. Exact gzipped bundle size for v12.10.1 — verify at bundlephobia.
2. React 19 compatibility — needs smoke test with `strictMode: true`.
3. Animated edges for "running state" visualization — custom edge types needed.
