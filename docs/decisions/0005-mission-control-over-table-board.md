---
doc-type: decision
decision: 0005
authored-by: ai
reviewed-by: null
last-updated: 2026-03-16
source-initiatives:
  - studio-agent-missions
status: accepted
---

> **AI-extracted** from studio-agent-missions · Awaiting human review

## Context

The original task board used a table layout to display tasks. As the dispatch system matured, tasks became "agent missions" with rich metadata — provider, model, duration, token usage, cost estimates, and structured event logs. The table layout couldn't surface this information effectively.

## Decision

Replace the table-based task board with a split-pane mission control UI: scrollable task list on the left, full task detail with agent metadata and event timeline on the right. Full-viewport edge-to-edge layout matching the dispatch and process pages. Task cards show agent mission metadata (provider, model, duration, tokens, cost). Detail view includes structured event timeline parsed from NDJSON agent logs.

## Consequences

- Agent missions are first-class: metadata (model, cost, duration) is visible at a glance
- Event timeline provides debugging context — what the agent did, when, and what it produced
- Split-pane pattern is consistent with dispatch and process pages (emerging Studio layout convention)
- Higher information density per screen vs. the table approach
