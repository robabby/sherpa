# Tasks

Tasks are managed in [Linear](https://linear.app). The Sherpa MCP tools (`task_list`, `task_get`, `task_create`, `task_update`) query the Linear API directly.

## Execution Artifacts

`docs/tasks/logs/` retains dispatch execution artifacts (NDJSON event logs, verdicts, reports, blockers). These are framework-side — Linear doesn't store dispatch telemetry.

## Legacy

Task markdown files were migrated to Linear on 2026-03-22. The `task_dispatch` MCP tool still reads local task files for dispatch metadata (backend, model routing). This will be fully removed in a future session.
