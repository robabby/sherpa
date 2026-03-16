---
id: fix-mcp-server-log-levels
status: completed
role: engineer
priority: medium
initiative: null
backend: codex
model: null
task-type: code-implementation
mode: supervised
budget-usd: 1.00
worktree: null
branch: null
created: 2026-03-16
dispatched-at: 2026-03-16T04:46:23
completed-at: 2026-03-16T04:47:27
session-id: null
judge-verdict: pending
max-retries: 3
attempt: 0
---

# Fix MCP server log levels

## Objective

The MCP HTTP server uses `console.error()` for all logging, including informational startup and session messages. Fix the log levels so only actual errors use `console.error()`.

## Context

`packages/studio-mcp/src/http-server.ts` uses `console.error()` for everything — startup banners, session lifecycle messages, and actual errors. This pollutes stderr and makes real errors harder to spot when the MCP server is running as a subprocess.

## File to modify

`packages/studio-mcp/src/http-server.ts`

## Changes

Replace informational `console.error()` calls with `console.log()`:

- Session initialized messages → `console.log()`
- Session closed messages → `console.log()`
- Server startup / listening messages → `console.log()`
- Shutdown messages → `console.log()`

Keep `console.error()` only for actual error conditions (failed operations, caught exceptions).

## Acceptance Criteria

- [ ] Informational log messages use `console.log()`, not `console.error()`
- [ ] Actual error conditions still use `console.error()`
- [ ] No functional changes to the server behavior
- [ ] Run `pnpm check` — no type errors
