# Iteration 1 — 2026-03-14

## Findings

### Vector 1: Agent Mission Control UIs
**Question:** How do modern AI platforms visualize autonomous agent runs?
**Full report:** [iteration-1/vector-1-agent-mission-control-uis.md](iteration-1/vector-1-agent-mission-control-uis.md)

- 7 platforms analyzed (LangSmith, AgentOps, Braintrust, Arize Phoenix, CrewAI, AutoGen Studio, Mission Control)
- Six recurring UI primitives: trace tree, waterfall/timeline, control flow graph, chat replay, cost/token dashboard, execution timeline
- Key distinction: task management uses discrete states + deadlines; agent monitoring uses continuous event streams + duration/cost

**Implications:** The task board needs to shift from "work items with status badges" to "execution traces with cost and timing." AgentOps' Session Waterfall and Braintrust's Gantt view are the strongest prior art.

### Vector 3: Agent Metadata Visualization
**Question:** How should token usage, duration, cost, model info be displayed?
**Full report:** [iteration-1/vector-3-agent-metadata-visualization.md](iteration-1/vector-3-agent-metadata-visualization.md)

- NNG research: progressive disclosure is essential — summary in list, breakdown in detail
- List card recipe: status dot + title + model badges + duration + tokens (humanized) + cost + verdict
- Use `Intl.NumberFormat` compact notation for tokens ("12.4K")
- Per-task cost in list (NNG: "price requested across 22 years of usability testing")
- Two-badge model pattern: `[Groq]` `[llama-3.3-70b]`

**Implications:** Clear information architecture for list vs detail. Existing mono badge pattern extends naturally. Need to add `tokensInput`, `tokensOutput`, `costUsd`, `durationSeconds` to TaskBoardEntry.

### Vector 4: Event Timeline Patterns
**Question:** How do observability tools render event timelines from structured logs?
**Full report:** [iteration-1/vector-4-event-timeline-patterns.md](iteration-1/vector-4-event-timeline-patterns.md)

- Sentry breadcrumbs, Datadog flamegraphs, GitHub Actions step timelines, Linear collapsed history all analyzed
- **shadcn-timeline** library matches our stack exactly (shadcn/ui + Tailwind + Framer Motion)
- NDJSON → timeline pipeline: parse → normalize → enrich → render. Existing `readAllEvents()` handles parsing
- Event type → visual mapping defined (copper/gold/bronze palette matches our design system)
- Time gaps: simple relative timestamps sufficient for our 5-8 event sequences

**Implications:** Add "Events" tab to task detail using shadcn-timeline. Map our existing NDJSON event types to timeline items. Consider SSE for live updates during active dispatches.

## Synthesis

**The single most important insight: the primary object needs to shift from "task" to "mission run."**

Every agent monitoring platform studied treats the execution run — not the task definition — as the primary object. Tasks are templates; runs are instances with timing, cost, events, and outcomes. Our current UI treats tasks as the only object, with status as a property. The redesign should make each task card communicate "an AI agent did this work, here's what happened" rather than "this item has status: completed."

Three design layers emerged:

1. **List card = mission summary.** Status dot, title, model badges, duration, token count (humanized), cost, verdict. Progressive disclosure — enough to scan, not enough to drown.

2. **Detail pane = mission replay.** Full metadata header, structured output, acceptance criteria, event timeline, judge verdict. Inline (no route navigation), matching `/process` pattern.

3. **Event timeline = execution trace.** NDJSON events rendered as a vertical timeline with type-specific icons and copper/gold palette. Collapses rapid-fire events. Shows the narrative of what the agent did.

**Cross-cutting pattern:** Every platform uses color to encode event type, not severity. Our existing task-type color palette (eclipse for research, primitive for code, copper for content) already does this — extend it to timeline events.

## Proposals Generated

Updated `docs/initiatives/studio-agent-missions/proposal.md` with research-informed design direction.

## Open Questions for Next Iteration

1. **Data model extension** — What fields need to be added to `TaskBoardEntry` (tokens, cost, duration)? Where does this data come from for CLI vs API backends?
2. **Split-pane implementation** — Reuse `ResizeHandle` from `/process` or simpler fixed proportions? (Vector 2 was dropped but we have the working implementation to reference)
3. **Real-time streaming** — SSE for live event updates during active dispatches, or polling sufficient?
4. **shadcn-timeline adoption** — Copy the component or build a simpler custom timeline?
