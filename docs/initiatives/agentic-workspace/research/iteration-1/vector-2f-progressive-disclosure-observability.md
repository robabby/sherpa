# Vector 6: Progressive Disclosure, Skill Composition, and Agentic Design Systems

**Question:** How do users see agent work at the right level of detail? How do they compose and chain agent capabilities? What design system primitives are emerging for agentic UIs?

## Progressive Disclosure for Agent Work

### Three-Layer Pattern

Iteration 1 established: status list -> structured summary -> raw log. This vector validates and extends it.

**Microsoft Agent Skills:** Progressive disclosure as a three-tier loading strategy for AI agents with 132+ skills. Layer 1 shows an index (titles only), Layer 2 shows summaries (2-3 sentences), Layer 3 shows full details. "Showing the index first, even if we 'know' what's relevant, respects agent autonomy." ([DeepWiki - Microsoft Agent Skills](https://deepwiki.com/microsoft/agent-skills/3.3-progressive-disclosure))

**Claude-Mem:** Documents a similar progressive disclosure pattern for agent memory, surfacing relevant information incrementally as context demands. ([Claude-Mem Docs](https://docs.claude-mem.ai/progressive-disclosure))

**AI Design Patterns:** Progressive Disclosure is catalogued as a standalone AI design pattern — "reveals complexity gradually, showing simple features first, then unveiling advanced capabilities as needed, instead of overwhelming users with every AI setting and option upfront." ([AI UX Design Guide](https://www.aiuxdesign.guide/patterns/progressive-disclosure))

### Application to Agent Observability

The trace visualization ecosystem validates progressive disclosure for debugging:

**Temporal's Event Groups** — collapse 3-5 low-level events into one meaningful row. Three views at increasing detail: Compact -> Timeline -> Full History. ([Temporal Blog](https://temporal.io/blog/lets-visualize-a-workflow))

**Agent observability hierarchy** — Sessions > Traces > Spans. Each level is a progressive disclosure step. Sessions give the overview, traces show the interaction, spans show the individual operations. ([Arize](https://arize.com/ai-agents/agent-observability/))

**Interactive flowcharts** — multi-agent traces showing agent interactions, delegation, and tool use. Users click to drill down into specific agent conversations. ([GetMaxim](https://www.getmaxim.ai/articles/agent-tracing-for-debugging-multi-agent-ai-systems/))

### Progressive Disclosure Levels for Sherpa

| Level | Shows | When |
|-------|-------|------|
| 0. Status indicator | Color dot + one-word state | Always visible (sidebar, header) |
| 1. Card | Agent name, task title, state, duration | Fleet overview / morning review |
| 2. Summary | Structured summary (what was produced, key decisions, metrics) | Click to expand in side panel |
| 3. Activity stream | Tool calls, thoughts, elicitations, responses (Linear model) | Drill-down detail view |
| 4. Raw trace | Full OpenTelemetry spans, token counts, timing | Debug mode only |

## Skill/Workflow Composition UX

### Visual Workflow Builders

Several platforms provide visual interfaces for composing agent workflows:

**OpenAI Agent Builder:** Visual canvas for building multi-step agent workflows. Drag and drop nodes, typed inputs/outputs, preview runs with live data. ([OpenAI Docs](https://developers.openai.com/api/docs/guides/agent-builder/))

**Flowise:** Three distinct visual builders (Assistant, Chatflow, Agentflow) for varying complexities. Modular building blocks from simple workflows to multi-agent systems. ([builder.io Blog](https://www.builder.io/blog/agentic-ide))

**n8n:** Visual node-based interface connecting 400+ apps. Each node performs a specific action. Execution replay — load a past execution and click any node for its input/output. ([n8n Docs](https://docs.n8n.io/workflows/executions/debug/))

### Skills as Reusable Delegation (Text-Based)

The alternative to visual builders: text-defined skills.

**Claude Skills:** Encode institutional knowledge as version-controlled skill files. Prompts for exploration, skills for repetition. ([RedMonk](https://redmonk.com/kholterhoff/2025/12/22/10-things-developers-want-from-their-agentic-ides-in-2025/))

**shadcn/skills:** March 2026 update — agents understand Radix vs. Base UI primitives, registry workflows, and specific CLI flags. Skills are now first-class in the design system. ([Dev.to](https://dev.to/codedthemes/shadcnui-march-2026-update-cli-v4-ai-agent-skills-and-design-system-presets-1gp1))

**Codex CLI skills.md:** Skills defined as markdown files, referenceable from prompts. ([RedMonk](https://redmonk.com/kholterhoff/2025/12/22/10-things-developers-want-from-their-agentic-ides-in-2025/))

### Pipeline vs. Graph

Two composition models:

1. **Pipeline (sequential):** Task A -> Task B -> Task C. Simple, predictable. Used by Sherpa's Planner/Worker/Judge system.
2. **Graph (DAG):** Tasks with dependencies, parallel branches, joins. Used by n8n, Temporal, Inngest.

Most real agent work is pipeline-shaped. Graphs add complexity that's rarely needed for the "morning review + overnight batch" workflow.

## Emerging Agentic Design System Primitives

### Protocol Layer

Three competing standards for agent-UI communication (all may coexist):

| Protocol | Owner | Approach | Status |
|----------|-------|----------|--------|
| AG-UI | CopilotKit | Event stream (17 types) | Production |
| A2UI | Google | Declarative JSON | v0.8 Preview |
| MCP Apps | Anthropic/OpenAI | ui:// resources in MCP | Official extension |

Source: [CopilotKit - State of Agentic UI](https://www.copilotkit.ai/blog/the-state-of-agentic-ui-comparing-ag-ui-mcp-ui-and-a2ui-protocols)

### Component Layer

**Six production primitives from CopilotKit's AG-UI Dojo:**
1. Agentic chat (streaming + tool hooks)
2. Human-in-the-loop planning
3. Agentic generative UI
4. Tool-based generative UI
5. Shared state (bi-directional sync)
6. Predictive state updates (stream in-progress state to frontend)

Source: [CopilotKit](https://www.copilotkit.ai/), [CopilotKit Shared State Docs](https://docs.copilotkit.ai/coagents/shared-state/predictive-state-updates)

**shadcn/ui as the agentic design system:**
With the March 2026 update, shadcn/ui is now the most "AI-ready" design system. CLI v4, shadcn/skills, and the Presets engine are optimized for the "Agentic Era." Sherpa already uses shadcn/ui. ([Dev.to](https://dev.to/codedthemes/shadcnui-march-2026-update-cli-v4-ai-agent-skills-and-design-system-presets-1gp1))

### Generative UI

**CopilotKit Generative UI:** Agent-powered interfaces where the agent generates UI components in real-time based on context. ([CopilotKit Generative UI](https://www.copilotkit.ai/generative-ui))

**A2UI Declarative Components:** Agents send JSON descriptions of UI components. Host renders using pre-approved native components. Security-first design — no code execution from agents. ([A2UI.org](https://a2ui.org/))

**MCP Apps Embedded Components:** Rich interactive components (dashboards, forms, visualizations) render directly in conversation. Standardized via ui:// URI scheme. ([MCP Apps Blog](http://blog.modelcontextprotocol.io/posts/2026-01-26-mcp-apps/))

### The "Interfaces Become Agents" Thesis

"Component libraries evolve into pattern generators that adapt based on intent. Design specifications shift from pixel-perfect layouts to rules, constraints, and mappings between goals and representations." ([Medium - State of Design 2026](https://tejjj.medium.com/state-of-design-2026-when-interfaces-become-agents-fc967be10cba))

## Implications for Sherpa Studio

1. **Five levels of progressive disclosure** — from color dot to raw trace. The default morning review operates at levels 1-2 (cards and summaries). Debug mode is level 3-4.

2. **Sherpa already has Skills** — `/rr`, `/integration-review`, `/plan-tasks` are text-defined skills. The framework should formalize this pattern for white-label customers.

3. **Pipeline composition, not graph composition** — Sherpa's Planner/Worker/Judge is the right level of complexity for most workflows. Don't build a visual DAG editor.

4. **shadcn/ui alignment is strategic** — Sherpa's use of shadcn/ui positions it to leverage the "agentic era" updates. shadcn/skills could be a natural extension point.

5. **Generative UI is future work** — MCP Apps and A2UI are relevant when Sherpa's MCP server needs to present UI within client applications. Not immediate priority but architecturally relevant.

6. **Predictive state updates** — streaming in-progress agent state to the frontend (CopilotKit's AG-UI Dojo primitive #6) is the technical foundation for rich real-time status indicators.

## Sources

- [DeepWiki - Microsoft Agent Skills Progressive Disclosure](https://deepwiki.com/microsoft/agent-skills/3.3-progressive-disclosure)
- [Claude-Mem Progressive Disclosure](https://docs.claude-mem.ai/progressive-disclosure)
- [AI UX Design Guide - Progressive Disclosure](https://www.aiuxdesign.guide/patterns/progressive-disclosure)
- [NN/g Progressive Disclosure](https://www.nngroup.com/articles/progressive-disclosure/)
- [IxDF Progressive Disclosure](https://ixdf.org/literature/topics/progressive-disclosure)
- [LogRocket - Progressive Disclosure](https://blog.logrocket.com/ux-design/progressive-disclosure-ux-types-use-cases/)
- [UserPilot - Progressive Disclosure Examples](https://userpilot.com/blog/progressive-disclosure-examples/)
- [Temporal Blog - Workflow Visualization](https://temporal.io/blog/lets-visualize-a-workflow)
- [Arize Agent Observability](https://arize.com/ai-agents/agent-observability/)
- [GetMaxim - Agent Tracing](https://www.getmaxim.ai/articles/agent-tracing-for-debugging-multi-agent-ai-systems/)
- [OpenAI Agent Builder](https://developers.openai.com/api/docs/guides/agent-builder/)
- [n8n Execution Replay](https://docs.n8n.io/workflows/executions/debug/)
- [RedMonk - 10 Things Developers Want](https://redmonk.com/kholterhoff/2025/12/22/10-things-developers-want-from-their-agentic-ides-in-2025/)
- [shadcn/ui March 2026 Update](https://dev.to/codedthemes/shadcnui-march-2026-update-cli-v4-ai-agent-skills-and-design-system-presets-1gp1)
- [CopilotKit](https://www.copilotkit.ai/)
- [CopilotKit Generative UI](https://www.copilotkit.ai/generative-ui)
- [CopilotKit Shared State](https://docs.copilotkit.ai/coagents/shared-state/predictive-state-updates)
- [CopilotKit - State of Agentic UI](https://www.copilotkit.ai/blog/the-state-of-agentic-ui-comparing-ag-ui-mcp-ui-and-a2ui-protocols)
- [A2UI.org](https://a2ui.org/)
- [MCP Apps Blog](http://blog.modelcontextprotocol.io/posts/2026-01-26-mcp-apps/)
- [Medium - State of Design 2026](https://tejjj.medium.com/state-of-design-2026-when-interfaces-become-agents-fc967be10cba)
- [Medium - Agentic Design Systems](https://medium.com/@disco_lu/building-agentic-design-systems-the-future-of-ai-enhanced-design-6ad0470cf1e3)
- [Evil Martians - Agent Prism](https://evilmartians.com/chronicles/debug-ai-fast-agent-prism-open-source-library-visualize-agent-traces)
