---
status: integrated
initiative: mcp-multi-backend-dispatch
created: '2026-03-17'
updated: '2026-03-17'
started: '2026-03-17'
type: new-plan
risk: evolutionary
targets:
  - packages/studio-mcp/src/server.ts
  - packages/studio-core/src/dispatch.ts
personas:
  - engineer
dependencies:
  - ai-sdk-dispatch
informs:
  - ai-gateway-dispatch
  - agent-narrative-streaming
spawned-from: null
---

> **AI-generated** 2026-03-17 · Awaiting human review

## Summary

The MCP `task_create` and `task_dispatch` tools are hardcoded to the lm-studio backend, ignoring the multi-backend routing logic already implemented in `packages/studio-core/src/dispatch.ts`. This initiative wires the MCP tools into the existing `resolveRoute()` dispatch infrastructure so tasks can be created and dispatched to any configured backend (claude, gemini, groq, google-ai, codex, opencode, lm-studio) via MCP.

## State Snapshot

**`task_create`** (`packages/studio-mcp/src/server.ts:357-373`): Hardcodes `backend: "lm-studio"` in the task metadata. Accepts a `model` parameter but its schema description says "Model name for LM Studio." No `backend` parameter is exposed. Every task created via MCP gets `backend: lm-studio` regardless of the model specified.

**`task_dispatch`** (`packages/studio-mcp/src/server.ts:481-491`): Explicitly rejects any task where `backend !== "lm-studio"`. Only spawns the lm-studio worker script (`scripts/backends/lm-studio.mjs`).

**`resolveRoute()`** (`packages/studio-core/src/dispatch.ts:91-110`): Full routing logic exists — maps task types to backends via `DEFAULT_DISPATCH` config, supports explicit overrides, handles Claude-only governance constraints. Used by shell scripts (`scripts/dispatch.sh`, `scripts/worker.sh`) and Studio UI auto-dispatch, but not by the MCP tools.

**Backend scripts** (`scripts/backends/`): 9 scripts exist covering all backends — `claude.sh`, `gemini.sh`, `codex.sh`, `opencode.sh`, `lm-studio.mjs`, `groq.mjs`, `google-ai.mjs`, `lm-studio-api.mjs`, `_ai-sdk-dispatch.mjs`.

**Backend types** (`packages/studio-core/src/dispatch-meta.ts`): Two types — `cli` (claude, opencode, codex, gemini, lm-studio) and `api` (groq, google-ai, lm-studio-api). CLI backends spawn shell processes; API backends use the AI SDK dispatch module.

## Proposed Changes

### `packages/studio-mcp/src/server.ts`

**`task_create` tool:**
- Add optional `backend` parameter (enum of all Backend values from dispatch-meta)
- Add optional `task_type` parameter (enum of TaskType values)
- When backend is explicitly provided, use it directly
- When backend is omitted, call `resolveRoute()` using the task-type to determine the correct backend
- Default task-type to `general` when not specified (matches current implicit behavior)
- Remove hardcoded `backend: "lm-studio"` from metadata construction

**`task_dispatch` tool:**
- Remove the `backend !== "lm-studio"` gate
- Use backend type (cli vs api) to determine spawn strategy:
  - CLI backends: spawn the corresponding shell script (`scripts/backends/{backend}.sh`)
  - API backends: spawn via the AI SDK dispatch module (`scripts/backends/_ai-sdk-dispatch.mjs`)
  - lm-studio: keep existing behavior (spawn `lm-studio.mjs` worker)
- Run backend health check before dispatch (call the backend's `--health` endpoint, not just lm-studio)
- Return the actual backend and model in the dispatch response (currently hardcodes `backend: "lm-studio"`)

### `packages/studio-core/src/dispatch.ts`

No changes needed — `resolveRoute()` and `DEFAULT_DISPATCH` already support all backends. The MCP server just needs to import and call them.

## Rationale

The routing infrastructure already exists and works via shell scripts. The MCP tools were built as an lm-studio-only pipeline during initial development. Now that the dispatch system has matured with 8 backends and proper routing logic, the MCP tools need to catch up. This is a wiring change, not a new capability — connecting existing pieces that were built independently.

## Dependencies

- **ai-sdk-dispatch** (approved) — Built the API backend dispatch module (`_ai-sdk-dispatch.mjs`) that this initiative's API backend spawning would use.

## Review Notes

- The main complexity is in `task_dispatch` — different backend types have different spawn patterns (CLI scripts vs API SDK calls vs lm-studio worker). The existing `worker.sh` script already handles this routing; the question is whether to delegate to `worker.sh` or reimplement the spawn logic in the MCP server.
- Delegating to `worker.sh` would be simpler and avoid duplication, but means the MCP server loses direct PID tracking for non-lm-studio backends.
- Budget enforcement (`budget-usd`) is currently `0.00` for all MCP-created tasks. Claude and API backends have real costs — should `task_create` require a budget for non-free backends?
- Health checks per backend add latency to dispatch. Consider making them optional or cached.

**Effort:** 2 sessions
**Session breakdown:**
- Session 1: Wire `task_create` to `resolveRoute()`, add backend/task-type parameters, update schema descriptions. Wire `task_dispatch` to spawn correct backend scripts based on backend type.
- Session 2: Test dispatch to each backend type (cli + api), handle edge cases (offline backends, budget validation), update MCP tool descriptions.
