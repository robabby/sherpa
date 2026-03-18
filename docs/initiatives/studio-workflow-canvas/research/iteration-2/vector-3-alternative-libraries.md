# Vector 3: Alternative Canvas/Workflow Libraries (Full Landscape)

**Question:** What are ALL viable React canvas/workflow libraries in 2025-2026?
**Agent dispatched:** 2026-03-16

## Findings

### Actively Maintained

| Library | Version | Last Active | Stars | License | React 19 | shadcn Integration |
|---|---|---|---|---|---|---|
| **@xyflow/react** | 12.10.1 | Feb 2026 | 35.6k | MIT | Yes | **Official registry** |
| **@antv/x6** | 3.1.6 | Feb 2026 | 6.5k | MIT | Uncertain | None |
| **JointJS** (free) | 4.x | Active | ~10k | MPL 2.0 | Yes | None |
| **JointJS+** | 4.x | Active | — | Commercial ($2,990/dev) | Yes | None |
| **GoJS** | 3.x | Active | 1.6k | Commercial ($3,995) | Yes | None (Canvas-rendered) |
| **Cytoscape.js** | 3.33.1 | 2025 | ~10k | MIT | Via wrapper | None (Canvas-rendered) |
| **Flume** | 1.1.0 | Mar 2025 | 1.6k | MIT | Unknown | None |

### Dead / Archived / Unmaintained

| Library | Status | Last Activity |
|---|---|---|
| **Reaflow** | **Archived** Jan 2026 | Read-only |
| **beautiful-react-diagrams** | Abandoned | Dec 2022 |
| **@projectstorm/react-diagrams** | Stale | Feb 2024 (12+ mo) |
| **butterfly-dag** (React wrapper) | Unmaintained | Mar 2024 |
| **diagram-maker** (AWS) | **Archived** May 2023 | Read-only |
| **react-flow-chart** | Abandoned | Jun 2020 |

### Key Disqualifications

- **Cytoscape.js / GoJS:** Canvas-rendered (not DOM). shadcn/Tailwind styling inapplicable to node interiors. Wrong primitive for rich React UI nodes.
- **@antv/x6:** Imperative API (not declarative React). XFlow React wrapper deprecated Feb 2024. Predominantly Chinese docs. React 19 compatibility unconfirmed.
- **Flume:** Data-flow editor, not workflow visualizer. No grouped/parent nodes. React 18.2 peer dep.
- **JointJS+:** $2,990/dev license. Overkill for internal tooling.

## Sources

- npm registry metadata for all packages
- https://github.com/reaviz/reaflow (archived notice)
- https://github.com/awslabs/diagram-maker (archived notice)
- https://reactflow.dev/ui (shadcn registry)

## Implications

**@xyflow/react is the only library that is simultaneously:**
1. Actively maintained at the tip of React 19
2. Has first-class shadcn CLI integration
3. Renders nodes as arbitrary React components (full JSX/Tailwind)
4. Supports subflows/parent nodes for grouping
5. MIT licensed
6. Battle-tested at scale (Stripe, Zapier, Retool, Supabase)

No other library meets all 6 criteria. The landscape has consolidated dramatically — most alternatives from 2022-2023 are now archived or stale.

## Open Questions

1. @antv/x6 could be a fallback if xyflow's edge routing proves insufficient — it has SVG-level control.
2. JointJS free (MPL 2.0) is viable if xyflow somehow doesn't work out, but the license requires open-sourcing modifications to the library itself.
