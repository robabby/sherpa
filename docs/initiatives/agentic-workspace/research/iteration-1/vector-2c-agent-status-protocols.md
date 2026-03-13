# Vector 3: Agent Status, Activity Streaming, and Observability Protocols

**Question:** What protocols and UI primitives exist for real-time agent status beyond "running/done"? How should rich status be surfaced?

## Protocol Landscape (2025-2026)

Three major protocols have emerged for agent-frontend communication, plus one product-specific SDK that's the most thoughtfully designed.

### AG-UI Protocol (CopilotKit)

AG-UI (Agent-User Interaction Protocol) is an open, event-based protocol standardizing real-time communication between AI agents and user-facing applications. 17 event types across five categories. ([AG-UI Docs](https://docs.ag-ui.com/))

**Event categories:**
1. **Lifecycle** — RUN_STARTED, STEP_STARTED, STEP_FINISHED, RUN_FINISHED, RUN_ERROR
2. **Text Messages** — TEXT_MESSAGE_START, TEXT_MESSAGE_CONTENT, TEXT_MESSAGE_END
3. **Tool Calls** — TOOL_CALL_START, TOOL_CALL_END (with approval hooks)
4. **State Management** — STATE_SNAPSHOT (full), STATE_DELTA (incremental diffs)
5. **Special** — custom events, pause for approval

**Key design decisions:**
- Snapshot-plus-delta pattern for state management (minimize bandwidth, keep UIs responsive)
- Updates every few hundred milliseconds — users watch the agent think, see tool calls, observe results building incrementally
- Framework-agnostic: LangGraph, CrewAI, Mastra, LlamaIndex, Pydantic AI, Agno all compatible
- Six production UI primitives: agentic chat, HITL planning, agentic generative UI, tool-based generative UI, shared state, predictive state updates

Sources: [AG-UI Protocol](https://www.copilotkit.ai/ag-ui), [CopilotKit Blog](https://www.copilotkit.ai/blog/introducing-ag-ui-the-protocol-where-agents-meet-users), [Codecademy Tutorial](https://www.codecademy.com/article/ag-ui-agent-user-interaction-protocol), [DataCamp Tutorial](https://www.datacamp.com/tutorial/ag-ui)

### A2UI Protocol (Google)

A2UI (Agent-to-User Interface) is a declarative JSON format for agents to describe UI components without sending executable code. v0.8 Public Preview, Apache 2.0. ([A2UI.org](https://a2ui.org/))

**Key design decisions:**
- **Declarative, not executable** — agents send component descriptions, not code. Host maintains a catalog of trusted, pre-approved UI components.
- **Native-first rendering** — client libraries for Flutter, Web Components, Angular. UIs render natively on each platform.
- **Security model** — reduces UI injection risk by never executing agent-generated code

Sources: [Google Developers Blog](https://developers.googleblog.com/introducing-a2ui-an-open-project-for-agent-driven-interfaces/), [A2UI Introduction](https://a2ui.org/introduction/what-is-a2ui/), [The New Stack](https://thenewstack.io/agent-ui-standards-multiply-mcp-apps-and-googles-a2ui/)

### MCP Apps Extension (SEP-1865)

Joint Anthropic/OpenAI specification for interactive UIs in MCP. Standardized in Nov 2025, live as official extension Jan 2026. ([MCP Blog](http://blog.modelcontextprotocol.io/posts/2025-11-21-mcp-apps/))

**Key design decisions:**
- **ui:// URI scheme** — tools declare UI resources with structured metadata
- **Bi-directional communication** — UI and host exchange messages via JSON-RPC
- **Rich embedded components** — dashboards, forms, visualizations, multi-step workflows render directly in conversation
- **Backed by major community** — Postman, Shopify, Hugging Face, Goose, ElevenLabs adopted

Sources: [SEP-1865 PR](https://github.com/modelcontextprotocol/modelcontextprotocol/pull/1865), [MCP Blog - Apps Update](http://blog.modelcontextprotocol.io/posts/2026-01-26-mcp-apps/), [Inkeep Blog](https://inkeep.com/blog/anthropic-openai-mcp-apps-extension)

### MCP Elicitation

MCP Elicitation lets servers pause tool execution and request additional input from users, then continue with updated data. Added June 2025. ([Dev.to](https://dev.to/kachurun/mcp-elicitation-human-in-the-loop-for-mcp-servers-m6a))

This is the first protocol-level answer to "when should an agent ask the human?" — a structured JSON schema for expected data, mid-session pause, and resume. ([Forge Code Blog](https://forgecode.dev/blog/mcp-spec-updates/))

### Linear Agent Interaction SDK (Best-in-Class Design)

Linear's Agent Interaction SDK is the most thoughtfully designed agent status system observed in this research. ([Linear Developers](https://linear.app/developers/agents))

**Five design principles:**
1. An agent should inhabit the platform natively
2. Agents should always disclose that they are agents
3. An agent should provide instant feedback
4. An agent should be clear and transparent about its internal state
5. An agent cannot be held accountable

**Agent Sessions** — the core abstraction. Tracks what triggered the interaction, context of where it occurred, and lifecycle state. ([Linear - Building the SDK](https://linear.app/now/our-approach-to-building-the-agent-interaction-sdk))

**Four lifecycle states:** Waiting for input | Actively working | Completed | Errored

**Activity types:**
- Tool calls — what the agent used
- Thoughts — agent reasoning steps
- Elicitations — prompts for clarification
- Final responses — completed output
- Errors — failure information

**Delegation model:** Issues assign only to humans; agents receive delegation status. Both human assignee and delegated agent appear on issues, maintaining transparency about responsibility boundaries. This is a critical design decision: humans retain accountability, agents take action. ([Linear Changelog](https://linear.app/changelog/2025-07-30-agent-interaction-guidelines-and-sdk))

**Rich status:** Agents share status indicating whether they're actively working, waiting for input, have encountered an error, or completed their work. Additionally, agents expose detailed activity like their reasoning steps, tool usage, prompts for clarification, and final responses. ([Linear Docs - AI Agents](https://linear.app/docs/agents-in-linear))

## Agent State Machine Patterns

Multiple protocols converge on similar lifecycle states:

### MCP Tasks (Five-State)
working -> input_required -> completed | failed | cancelled

Terminal states are irreversible. State transitions are append-only. ([Medium - MCP Tasks](https://stn1slv.medium.com/architecting-the-asynchronous-agent-a-guide-to-mcp-tasks-7348c6527233))

### Agent Communication Protocol (Seven-State)
created -> in-progress -> awaiting -> completed | cancelling -> cancelled | failed

"Awaiting" is the key addition — paused and waiting for additional input. ([ACP Docs](https://agentcommunicationprotocol.dev/core-concepts/agent-run-lifecycle))

### Classic ReAct Loop (Four-State)
IDLE -> THINKING -> ACTING -> RESPOND (with OBSERVING and ERROR extensions)

This is the internal agent loop, not the external status. ([Dev.to](https://dev.to/gantz/idle-thinking-acting-agents-as-state-machines-427n))

## Agent Observability / Trace Visualization

For debugging and understanding multi-agent behavior, trace visualization has emerged:

- **Sessions > Traces > Spans** — three-tier hierarchy. Sessions contain traces, traces contain spans, spans are parent-child trees visualized as timelines. ([Arize Agent Observability](https://arize.com/ai-agents/agent-observability/))
- **Interactive flowcharts** — multi-agent traces showing agent interactions, delegation, and tool use in real-time. ([GetMaxim](https://www.getmaxim.ai/articles/agent-tracing-for-debugging-multi-agent-ai-systems/))
- **Agent Prism** — open source React components that transform raw OpenTelemetry trace data into interactive visualizations, in-IDE. ([Evil Martians](https://evilmartians.com/chronicles/debug-ai-fast-agent-prism-open-source-library-visualize-agent-traces))
- **Langfuse** — open-source, captures inputs, outputs, tool usage, retries, latencies, costs. Framework-agnostic. ([Vellum Blog](https://www.vellum.ai/blog/understanding-your-agents-behavior-in-production))
- **LangSmith** — detailed tracing for LangChain/LangGraph. Dashboards for cost/latency/quality. ([Vellum Blog](https://www.vellum.ai/blog/understanding-your-agents-behavior-in-production))

Key insight: "Debugging these logs in a table, and/or your IDE logs can be very tough to parse. There is a growing need from both engineers, and other stakeholders (e.g. PMs, Legal, Management) to debug these agents in a visual graph." ([Evil Martians](https://evilmartians.com/chronicles/debug-ai-fast-agent-prism-open-source-library-visualize-agent-traces))

## The Claude Code Dashboard Gap

A feature request on Claude Code (Issue #24537) articulates the exact problem: "The Claude Code conversation view was designed for a human talking to one agent and was never meant to be a control plane for 7 concurrent subagents across multiple sessions." ([GitHub Issue](https://github.com/anthropics/claude-code/issues/24537))

The proposed solution: move operational complexity out of the conversation view into a dedicated dashboard surface with agent tree, per-agent metrics, task progress, approval activity stream, and session switching/cost tracking.

A community workaround is **claude-esp** — a Go-based TUI that streams Claude Code's hidden output (thinking, tool calls, subagents) to a separate terminal. ([GitHub Issue](https://github.com/anthropics/claude-code/issues/24537))

## Implications for Sherpa Studio

1. **Adopt AG-UI event model** — the 17 event types map cleanly to Studio's needs. STATE_SNAPSHOT + STATE_DELTA for real-time updates.
2. **Linear's delegation model is ideal** — agents are delegated work but humans retain accountability. This matches Sherpa's behavioral agent philosophy.
3. **Four states minimum** — working / waiting-for-input / completed / failed. Optional: created, cancelling.
4. **Activity types as UI primitives** — thoughts, tool calls, elicitations, responses should each have distinct visual treatment in the detail panel.
5. **Trace visualization for debug mode** — span trees with parent-child hierarchy, accessible from the detail view but not the primary interface.
6. **Agent identity disclosure** — agents must be visually distinct from human users (Linear principle 2).

## Sources

- [AG-UI Protocol Docs](https://docs.ag-ui.com/)
- [AG-UI Protocol - CopilotKit](https://www.copilotkit.ai/ag-ui)
- [CopilotKit Blog - Introducing AG-UI](https://www.copilotkit.ai/blog/introducing-ag-ui-the-protocol-where-agents-meet-users)
- [AG-UI Event Types - CopilotKit Blog](https://www.copilotkit.ai/blog/master-the-17-ag-ui-event-types-for-building-agents-the-right-way)
- [Codecademy AG-UI Tutorial](https://www.codecademy.com/article/ag-ui-agent-user-interaction-protocol)
- [DataCamp AG-UI Tutorial](https://www.datacamp.com/tutorial/ag-ui)
- [A2UI.org](https://a2ui.org/)
- [A2UI Introduction](https://a2ui.org/introduction/what-is-a2ui/)
- [Google Developers Blog - A2UI](https://developers.googleblog.com/introducing-a2ui-an-open-project-for-agent-driven-interfaces/)
- [The New Stack - Agent UI Standards](https://thenewstack.io/agent-ui-standards-multiply-mcp-apps-and-googles-a2ui/)
- [MCP Apps Blog](http://blog.modelcontextprotocol.io/posts/2025-11-21-mcp-apps/)
- [MCP Apps Update](http://blog.modelcontextprotocol.io/posts/2026-01-26-mcp-apps/)
- [SEP-1865 PR](https://github.com/modelcontextprotocol/modelcontextprotocol/pull/1865)
- [Inkeep - Anthropic OpenAI MCP Apps](https://inkeep.com/blog/anthropic-openai-mcp-apps-extension)
- [MCP-UI Future of Agentic Interfaces - Goose](https://block.github.io/goose/blog/2025/08/25/mcp-ui-future-agentic-interfaces/)
- [MCP-UI GitHub](https://github.com/MCP-UI-Org/mcp-ui)
- [The New Stack - MCP-UI Rich UIs](https://thenewstack.io/mcp-ui-creators-on-why-ai-agents-need-rich-user-interfaces/)
- [CopilotKit - State of Agentic UI](https://www.copilotkit.ai/blog/the-state-of-agentic-ui-comparing-ag-ui-mcp-ui-and-a2ui-protocols)
- [MCP Elicitation - Dev.to](https://dev.to/kachurun/mcp-elicitation-human-in-the-loop-for-mcp-servers-m6a)
- [MCP Spec Updates - Forge Code](https://forgecode.dev/blog/mcp-spec-updates/)
- [Linear Agent Interaction SDK](https://linear.app/developers/agents)
- [Linear - Building the Agent SDK](https://linear.app/now/our-approach-to-building-the-agent-interaction-sdk)
- [Linear Agent Interaction Guidelines](https://linear.app/developers/aig)
- [Linear Changelog - SDK](https://linear.app/changelog/2025-07-30-agent-interaction-guidelines-and-sdk)
- [Linear Docs - AI Agents](https://linear.app/docs/agents-in-linear)
- [MCP Tasks Guide](https://stn1slv.medium.com/architecting-the-asynchronous-agent-a-guide-to-mcp-tasks-7348c6527233)
- [Agent Communication Protocol](https://agentcommunicationprotocol.dev/core-concepts/agent-run-lifecycle)
- [Agents as State Machines](https://dev.to/gantz/idle-thinking-acting-agents-as-state-machines-427n)
- [Arize Agent Observability](https://arize.com/ai-agents/agent-observability/)
- [GetMaxim Agent Tracing](https://www.getmaxim.ai/articles/agent-tracing-for-debugging-multi-agent-ai-systems/)
- [Evil Martians - Agent Prism](https://evilmartians.com/chronicles/debug-ai-fast-agent-prism-open-source-library-visualize-agent-traces)
- [Vellum - Agent Observability Guide](https://www.vellum.ai/blog/understanding-your-agents-behavior-in-production)
- [Claude Code Dashboard Issue #24537](https://github.com/anthropics/claude-code/issues/24537)
