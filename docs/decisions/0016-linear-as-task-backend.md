---
doc-type: decision
decision: "0016"
authored-by: ai
reviewed-by: null
last-updated: 2026-03-22
source-initiatives:
  - sherpa-linear-integration
status: accepted
---

> **AI-extracted** from sherpa-linear-integration · Awaiting human review

## Context

Sherpa tracked tasks as markdown files in `docs/tasks/` with YAML frontmatter. Every new capability (scheduling, idempotence, state machines, multi-agent assignment) required building from scratch on filesystem conventions — 8+ dispatch-related initiatives, each reinventing what Linear already provides at scale.

Two rounds of research (iteration-1: Linear platform survey, iteration-2: overlap analysis) established that Linear is substrate, not competitor. The task system had three layers: state tracking (redundant with Linear), execution orchestration (governance), and dispatch telemetry (governance). ~88% of Studio UI is governance-specific visualization that Linear can't render. The initiative system is almost entirely governance with no Linear overlap.

## Decision

Linear replaces the filesystem as the task state backend. Hard switchover — no feature flag, no dual paths.

- **Task CRUD** — `task_list`, `task_get`, `task_create`, `task_update` MCP tools query Linear API via `@linear/sdk`
- **Task taxonomy** — mapped to Linear via mutually exclusive label groups: Task Type (8 labels), Mode (3), Role (5), Verdict (4)
- **Priority** — maps natively (Sherpa urgent/high/medium/low = Linear 1/2/3/4)
- **Status** — Linear workflow state types map to Sherpa status (unstarted→pending, started→dispatched, completed→completed, canceled→failed)
- **Governance stays framework-side** — dispatch pipeline (`worker.sh`, `auto-judge.sh`), event logging (NDJSON), judge verdicts, initiative lifecycle, behavioral constraints — none of this moves to Linear
- **Execution artifacts stay on disk** — `docs/tasks/logs/` retains NDJSON events, verdicts, reports

## Consequences

**Positive:**
- Eliminates ~550 lines of task CRUD code and 27 task files
- `scheduled-dispatch`, `dispatch-idempotence` initiatives may become unnecessary (Linear handles scheduling and concurrent state)
- Positions Sherpa as a governance layer that complements Linear rather than competing with it
- If clients already use Linear, Sherpa-as-integration is easier to adopt than Sherpa-as-replacement

**Negative:**
- Adds SaaS dependency (`SHERPA_LINEAR_API_KEY` required) — conflicts with "thumb drive test" for desktop app
- `task_dispatch` still reads from filesystem (hybrid state during transition)
- No custom fields in Linear — label groups work as single-select enums but can't model multi-value dimensions
- Linear API is async — all task-consuming code must handle promises (Studio pages, MCP tools)
