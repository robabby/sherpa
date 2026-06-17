---
status: declined
initiative: ai-sdk-dispatch
created: 2026-03-13
updated: '2026-06-17'
type: research-synthesis
risk: additive
targets:
  - docs/initiatives/ai-sdk-dispatch/research/  # (new file)
  - packages/studio-core/src/dispatch.ts
  - packages/studio-mcp/src/server.ts
  - scripts/backends/
dependencies:
  - dispatch-center
  - mcp-coordination-layer
spawned-from: null
---

# AI SDK for Agent Dispatch

## Summary

Investigate whether the Vercel AI SDK (`ai` package) can replace or augment Sherpa's shell-based dispatch system with programmatic agent dispatch. The current system shells out to 5 CLI tools via bash scripts — the AI SDK could provide a unified TypeScript API with streaming, tool calling, and MCP client support that works both locally (`pnpm dev`) and in production.

## State Snapshot

The dispatch system (integrated via `dispatch-center`) consists of ~1,500 lines across 14 files:

- **Shell dispatch pipeline:** `dispatch.sh` (interactive) and `worker.sh` (headless) route tasks through `resolve-route.mjs` to 5 backend scripts (`claude.sh`, `opencode.sh`, `codex.sh`, `gemini.sh`, `lm-studio.mjs`)
- **TypeScript layer:** `packages/studio-core/src/dispatch.ts` (203 lines) defines `Backend`, `DispatchMode`, `TaskType` types, routing logic, and health checks — mirrored in `resolve-route.mjs`
- **MCP server:** `packages/studio-mcp/src/server.ts` (640 lines) has 7 tools including `task_dispatch` which spawns LM Studio workers. Uses `@modelcontextprotocol/sdk` only — no AI provider SDKs
- **Backend contract:** Each backend receives `SHERPA_*` environment variables, handles interactive vs headless mode, returns exit codes. Only `lm-studio.mjs` uses HTTP API directly; the other 4 shell out to CLI tools

The `mcp-coordination-layer` initiative (approved, Phase 0 done) is building the coordination surface — Streamable HTTP transport and SessionManager are live. Phases 1-3 (SQLite authority, hook enforcement, write-through projection) are pending demand signal.

No Vercel AI SDK, Anthropic SDK, or OpenAI SDK exists anywhere in the codebase today.

## Proposed Changes

### Research Findings (Iteration 1 — Complete)

4 vectors investigated: capabilities/providers, MCP client integration, agent patterns vs CLI, runtime topology. Full reports in `docs/initiatives/ai-sdk-dispatch/research/iteration-1/`.

### Key Finding: Three-Layer Dispatch Model

Research reveals the AI SDK and Claude Agent SDK are complementary, not competing. A three-layer architecture emerges:

| Layer | Mechanism | Replaces |
|-------|-----------|----------|
| **MCP Server** (coordination) | SQLite state + Streamable HTTP | Already building (`mcp-coordination-layer`) |
| **AI SDK** (provider abstraction) | `createProviderRegistry()` + `generateText()` with MCP tools | `resolve-route.mjs` + `opencode.sh`, `codex.sh`, `gemini.sh`, `lm-studio.mjs` |
| **Claude Agent SDK** (autonomous coding) | `@anthropic-ai/claude-agent-sdk` as library | `claude.sh` subprocess spawning |

### What the AI SDK Covers

- **All 5 backends**: `@ai-sdk/anthropic`, `@ai-sdk/openai`, `@ai-sdk/google`, `@ai-sdk/openai-compatible` (LM Studio), community Minimax provider
- **Provider Registry** maps 1:1 to our routing table — resolve models by string ID like `'anthropic:claude-sonnet-4-5'`
- **MCP client** (`@ai-sdk/mcp` v1.0.28) connects to our Streamable HTTP server, auto-discovers all 7 tools
- **Same code runs locally and on Vercel** — `generateText()` is runtime-agnostic. Local: no timeout. Vercel: 300-800s.
- **Agent loops** via `ToolLoopAgent` with `stopWhen`, `prepareStep`, `onStepFinish`

### What the AI SDK Does NOT Cover

- **No built-in file/command tools** — you define your own tools
- **No context window management** — CLI agents handle compaction automatically; AI SDK needs custom middleware
- **No session persistence** — CLI agents have resume/continue; AI SDK is stateless
- **Not a CLI replacement** — it makes API calls, not subprocess launches

### Follow-On Code Targets (separate initiative)

- `packages/studio-core/src/dispatch.ts` — Add AI SDK provider registry alongside CLI backends
- `packages/studio-mcp/src/server.ts` — `task_dispatch` could use AI SDK for non-Claude tasks
- `scripts/backends/` — Replace `lm-studio.mjs` first (already API-based), then others incrementally
- `scripts/backends/claude.sh` — Replace with `@anthropic-ai/claude-agent-sdk` import

## Rationale

The dispatch system works but has fundamental limitations:

1. **Opacity** — CLI tools are black boxes. No streaming of intermediate results, no programmatic control over tool use, no structured output
2. **Dual routing** — `resolve-route.mjs` (shell) and `dispatch.ts` (TypeScript) must stay in sync manually
3. **No production path** — Shell scripts can't run in a deployed Next.js environment. The dispatch system is local-only
4. **Limited composition** — Dispatched agents can't easily use MCP tools or coordinate through the MCP server

The AI SDK could address all four: unified TypeScript API, single routing source, works in both Node.js and Next.js, and has built-in MCP client support. But the CLI tools (especially Claude Code) provide capabilities that raw API calls don't — autonomous file editing, built-in tool use, permission management. Understanding this trade-off is the core research question.

## Dependencies

- **`dispatch-center`** (integrated) — Established the current dispatch system this would augment/replace
- **`mcp-coordination-layer`** (approved, in-progress) — The coordination surface that AI SDK agents would connect through. Soft dependency — research can proceed independently, but findings should account for the coordination layer's authority model

## Review Notes

**Resolved trade-off:** CLI tools and AI SDK serve different purposes. CLI agents (Claude Code, Codex, Gemini CLI) are full autonomous coding agents. AI SDK provides provider-agnostic model access with tool calling. The answer is both — use AI SDK for API-level tasks, Claude Agent SDK for autonomous coding.

**Remaining open questions:**
- Claude Agent SDK deep dive — API surface, MCP connectivity, budget controls
- Can `@ai-sdk/anthropic` provider-level tools (bash, text editor) approximate Claude Code without the full Agent SDK?
- Cost model: API-direct vs CLI dispatch token implications
- Migration path: `lm-studio.mjs` → gemini/codex → claude (incremental)

**Effort:** 1 session complete (research via /rr). Follow-on implementation: 3-4 sessions (separate initiative).
**Session breakdown:**
- Session 1 (done): /rr cycle — AI SDK landscape, provider coverage, MCP integration, agent patterns, topology
- Future: Implementation initiative with phased migration
