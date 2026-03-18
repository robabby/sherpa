# Studio Workflow Canvas — Research

## Summary

Two iterations confirm the technical stack: **@xyflow/react** (canvas engine) + **ELK** (auto-layout) + **Mermaid** (import/export). Iteration 2 pressure-tested the library choice against every alternative in the React ecosystem and found @xyflow/react is the only library that is simultaneously: actively maintained, React 19 compatible, has a first-class shadcn component registry (ui.reactflow.dev), renders nodes as React components, supports subflows, and is MIT licensed.

## Iterations

1. [Iteration 1](iteration-1.md) — Landscape survey: canvas library, Mermaid parsing, UX patterns, layout algorithms (2026-03-16)
2. [Iteration 2](iteration-2.md) — Framework validation: shadcn integration, tldraw comparison, full library landscape, DIY assessment (2026-03-16)

## Key Decisions

- **@xyflow/react** — confirmed as definitive choice. The only canvas library with a shadcn-style component registry. Components use our CSS variable tokens.
- **ELK** — only viable auto-layout for subgraphs + cross-boundary edges + feedback loops.
- **Sheet** for detail panel — already installed, portals out of canvas transform, zero new deps.
- **Pre-built components** from ui.reactflow.dev: `base-node`, `node-tooltip`, `labeled-group-node`, `node-status-indicator`.

## Open Questions

1. **Spike: @xyflow/react + shadcn components in our monorepo** — Does the install path work? CSS import order in `globals.css`?
2. **`labeled-group-node` fit** — Does the pre-built group node handle our 6-phase grouping pattern?
3. **ELK Web Worker in Next.js 16** — Can elkjs's worker be instantiated client-side without SSR issues?
4. **`@mermaid-js/parser` flowchart coverage** — Does v0.6.3 parse `flowchart TB` with subgraphs?

## Related Initiatives

- `studio-state-machine` — lifecycle intelligence could feed node status indicators
- `studio-process-playbook-ui` — process skill pipeline visualization, complementary surface
- `dispatch-center` — dispatch data feeds Execution phase nodes (integrated)
