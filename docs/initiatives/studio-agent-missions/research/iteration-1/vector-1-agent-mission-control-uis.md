# Vector 1: Agent Mission Control UIs

**Question:** How do modern AI agent platforms visualize autonomous agent runs, and what UI patterns distinguish "agent monitoring" from "task management"?
**Agent dispatched:** 2026-03-14

## Findings

### Platform Analysis

**LangSmith:** Trace tree with nested spans (LLM calls, tools, retrievers). Per-span token/cost breakdowns. Dashboard with latency, error rates, cost trends. Framework-native understanding of LangChain primitives.

**AgentOps:** Session Waterfall — vertical timeline of LLM calls, Actions, Tools, Errors. Dual-pane: timeline left, event detail right. "Time travel debugging" for replaying sessions. Most distinctive agent-specific UI primitive.

**Braintrust:** Three detail modes — Timeline/Gantt (spans as horizontal bars), Thread view (chat replay), Side-by-side diffs. Gantt chart borrowed from DevOps tracing.

**Arize Phoenix:** Open-source. Trace list with sorting/filtering. Span-level timing for bottleneck detection. Drift detection over time. Built on OpenTelemetry.

**CrewAI:** Multi-agent role visibility — shows which agent did what. Per-agent performance breakdowns. Execution Timeline with task dependencies.

**AutoGen Studio:** Live control transition graph — directed graph updating in real-time as agents hand off. Streaming execution with cancel button.

**Mission Control (Builderz):** Agent fleet management. Kanban board + heartbeat monitoring + token dashboards. Compressed task payloads to ~50 tokens (94% reduction).

### What Distinguishes Agent Monitoring from Task Management

| Dimension | Task Management | Agent Monitoring |
|-----------|----------------|-----------------|
| Primary object | The task (work item) | The run (execution trace) |
| Time model | Deadline-oriented | Duration-oriented (latency) |
| Status model | Discrete states | Continuous event stream |
| Detail view | Description + checklist | Trace tree / waterfall / Gantt |
| Cost visibility | None | Tokens, dollars, per-model |
| Failure model | "Blocked" badge | Error spans in context |
| Live-ness | Periodic refresh | WebSocket streaming |
| Human role | Assignee | Supervisor who monitors |

### Six Recurring UI Primitives

1. **Trace tree** — hierarchical nested spans (LangSmith, Langfuse, Phoenix)
2. **Waterfall/timeline** — horizontal bars on time axis (AgentOps, Braintrust)
3. **Control flow graph** — directed agent-to-agent graph (AutoGen Studio)
4. **Chat replay** — LLM interactions as chat bubbles (AgentOps, Braintrust)
5. **Cost/token dashboard** — per-model, per-run breakdowns (all platforms)
6. **Execution timeline** — task-level sequencing per agent (CrewAI, Mission Control)

## Sources

- https://www.langchain.com/langsmith/observability
- https://docs.agentops.ai/v1/usage/dashboard-info
- https://www.braintrust.dev/docs/guides/evals/interpret
- https://arize.com/docs/phoenix/tracing/llm-traces
- https://crewai.com/amp
- https://microsoft.github.io/autogen/dev/user-guide/autogenstudio-user-guide/
- https://github.com/builderz-labs/mission-control
- https://agentic-design.ai/patterns/ui-ux-patterns

## Implications

Replace status-badge table with dual-pane layout. Make the run the primary object, not the task. Show cost as first-class metric. Borrow waterfall/Gantt for detail views. Use progressive disclosure (summary in list, trace in detail, span on drill-down).

## Open Questions

- Should task board coexist with run monitor, or replace it?
- What granularity of tracing — per-task or per-LLM-call?
- Real-time streaming vs post-hoc analysis — which matters more?
