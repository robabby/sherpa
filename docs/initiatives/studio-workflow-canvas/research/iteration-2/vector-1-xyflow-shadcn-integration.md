# Vector 1: @xyflow/react shadcn/ui Integration

**Question:** How does @xyflow/react integrate with shadcn/ui? What is ui.reactflow.dev?
**Agent dispatched:** 2026-03-16

## Findings

**ui.reactflow.dev is a shadcn-style component registry.** Officially called "React Flow UI" (renamed from "React Flow Components" in July 2025). Components are vendored source code, installed via the standard shadcn CLI pattern.

**Installation pattern:**
```bash
npx shadcn@latest add https://ui.reactflow.dev/base-node
npx shadcn@latest add https://ui.reactflow.dev/node-tooltip
```

**17 free components + 2 Pro templates:**

| Category | Components |
|---|---|
| Node Utilities | `base-node`, `node-status-indicator`, `node-appendix`, `node-tooltip` |
| Custom Nodes | `database-schema-node`, `placeholder-node`, `labeled-group-node` |
| Handles | `base-handle`, `labeled-handle`, `button-handle` |
| Custom Edges | `button-edge`, `data-edge`, `animated-svg-edge` |
| Controls | `node-search`, `zoom-slider`, `zoom-select` |
| Misc | `devtools` |

**Components use shadcn CSS variables directly:**
- `BaseNode`: `bg-card text-card-foreground`, selection: `[.react-flow__node.selected_&]:border-muted-foreground`
- `NodeTooltip`: `bg-primary text-primary-foreground rounded-sm p-2`
- All inherit existing shadcn theme — no extra configuration needed.

**React 19 confirmed:** peerDependency is `react >= 17`. Zustand 4.5.6+ resolved React 19 issues. React Flow UI components explicitly updated for React 19 + Tailwind v4 in October 2025.

**Tailwind v4 CSS import order:** `@xyflow/react/dist/style.css` must be imported after `@import "tailwindcss"` but before component overrides in `globals.css`.

**Pro-gated templates:** Workflow Editor and AI Workflow Editor templates require Pro subscription ($149/mo). Free components are sufficient to compose the equivalent.

## Sources

- https://xyflow.com/blog/react-flow-components
- https://reactflow.dev/ui
- https://reactflow.dev/learn/tutorials/getting-started-with-react-flow-components
- https://reactflow.dev/whats-new/2025-10-28
- https://reactflow.dev/ui/templates/workflow-editor

## Implications

@xyflow/react is the ONLY canvas library with a first-class shadcn component registry. Components install via the same CLI workflow we already use. Our existing theme (gold/dark, new-york style) applies automatically via CSS variables. The `base-node`, `node-tooltip`, `labeled-group-node`, and `node-status-indicator` components map directly to our requirements.

## Open Questions

1. Exact behavior of `pnpm dlx shadcn@latest add https://ui.reactflow.dev/...` in our monorepo workspace.
2. Whether `labeled-group-node` handles our 6-phase grouping pattern out of the box.
3. CSS import order with Tailwind v4's `@import` syntax.
