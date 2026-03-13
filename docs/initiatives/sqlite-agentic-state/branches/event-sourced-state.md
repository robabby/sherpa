---
status: seed
source-iteration: 1
spawned-from: sqlite-agentic-state
created: 2026-03-11
priority: medium
---

# Event-Sourced SQLite for Agentic State

## Context

Iteration 1's ecosystem survey surfaced LiveStore — an event-sourcing approach on SQLite where state is derived from an append-only event log rather than mutated directly. Sherpa's `activity.md` files are already informal event logs. The question is whether formalizing this into a proper event-sourced architecture would benefit agent coordination, auditability, and the Studio UI.

## Question

Should Sherpa's state layer use event sourcing (append-only events → derived current state) instead of direct state mutation with version columns? What are the concrete trade-offs for an agentic coordination system?

## Suggested Vectors

1. **LiveStore deep dive** — Architecture, event schema, derived view materialization, performance characteristics. How does it handle SQLite concurrency?
2. **Event sourcing for coordination systems** — Patterns from workflow engines (Temporal, Cadence), job queues (BullMQ), and orchestrators that use event logs for state
3. **Hybrid approach** — Can `sherpa-events.db` be append-only events while `sherpa-meta.db` and `sherpa-coordination.db` use direct mutation? What's the consistency model across the boundary?
4. **Studio UI implications** — Event-sourced state enables time-travel debugging, activity replay, and diff visualization. What would the Studio UI look like with full event history?

## Links

- [LiveStore](https://livestore.dev/)
- [LiveStore GitHub](https://github.com/livestorejs/livestore)
- [Event Sourcing pattern](https://learn.microsoft.com/en-us/azure/architecture/patterns/event-sourcing)
- [Temporal.io](https://temporal.io/) — workflow engine with event sourcing
