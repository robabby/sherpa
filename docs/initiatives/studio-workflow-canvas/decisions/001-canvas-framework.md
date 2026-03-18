---
decision: "@xyflow/react as the canvas framework"
date: 2026-03-16
skill: /shape
alternatives-rejected:
  - "tldraw — whiteboard SDK, not workflow-native. 2-3x bundle, limited edge routing, game-engine mental model."
  - "DIY (D3 + shadcn primitives) — viable but +3-4 sessions for infrastructure xyflow provides free."
  - "@antv/x6 — imperative API, deprecated React wrapper, Chinese-primary docs, uncertain React 19 support."
  - "Cytoscape.js / GoJS — canvas-rendered, shadcn/Tailwind styling inapplicable to node interiors."
  - "JointJS+ — commercial ($2,990/dev), overkill for internal tooling."
  - "Reaflow — archived January 2026."
confidence: high
kill-criteria: "If @xyflow/react + React 19.2.3 has a blocking incompatibility in session 1, pivot to DIY."
---

# Canvas Framework: @xyflow/react

## Why

@xyflow/react is the only library that meets all 6 criteria:
1. Actively maintained (v12.10.1, Feb 2026)
2. React 19 compatible (confirmed, zustand 4.5.6+)
3. First-class shadcn component registry (ui.reactflow.dev, 17 components)
4. Nodes are React components (full JSX/Tailwind in node interiors)
5. Subflow/parent nodes for phase grouping
6. MIT licensed

The shadcn integration is the decisive differentiator — no other canvas library has this. Components use our exact CSS variable tokens and install via the same CLI workflow.

## Evidence

- Research iteration 1: 4 vectors covering capabilities, Mermaid parsing, UX patterns, layout algorithms
- Research iteration 2: 4 vectors specifically pressure-testing alternatives (tldraw, full landscape scan, DIY assessment)
- 12 alternative libraries evaluated, all disqualified on one or more criteria
