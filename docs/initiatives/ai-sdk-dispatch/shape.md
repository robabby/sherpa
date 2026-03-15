---
appetite: 3 sessions
shaped: 2026-03-14
---

# ai-sdk-dispatch — Shape

## Appetite

**3 sessions.** This is additive work — new capability alongside existing infrastructure, no rewrites. Session 1 is the foundation (types, registry, first working dispatch). Session 2 is the MCP server integration. Session 3 is the UI transparency layer.

Why 3 and not 2: the UI transparency principle ("users must always know exactly what they're interacting with") deserves a full session. Cramming it into the foundation session would produce a rushed UI.

Why 3 and not 4: we're not building context management, production deployment, or Claude Agent SDK integration. Those are separate initiatives.

## Shaped Solution

### The Core Idea

Add `api` as a new backend category alongside the existing `cli` backends. The dispatch system gains a second dispatch mechanism — AI SDK's `generateText()`/`streamText()` — without touching any CLI backend scripts.

### Component 1: Backend Type Discriminator

`packages/studio-core/src/dispatch.ts` gains a `BackendType` discriminator:

```
BackendType: 'cli' | 'api'
```

Each `Backend` entry carries its type. Existing CLI backends (`claude`, `opencode`, `codex`, `gemini`) stay as `cli`. New API backends (`groq`, `google-ai`, `lm-studio-api`, etc.) are `api`. The existing `lm-studio` CLI backend stays — `lm-studio-api` is a separate entry that dispatches via AI SDK instead of the `lm-studio.mjs` script.

The routing table (`DEFAULT_DISPATCH`) gains new entries for API backends. Task-type routing can point to either type.

### Component 2: Provider Registry

A new module in `studio-core` (or `studio-mcp`) that wraps `createProviderRegistry()` from the AI SDK:

- Registers providers based on available API keys (check env vars)
- Exposes `resolveModel(backendId: string, modelId?: string)` that returns an AI SDK model instance
- Health check for API backends: call the provider with a minimal request, return available/unavailable

Initial providers: `@ai-sdk/google` (Gemini free tier), `@ai-sdk/groq` (Groq free tier), `@ai-sdk/openai-compatible` (LM Studio local). Add `@ai-sdk/anthropic` and `@ai-sdk/openai` as optional (require API keys).

### Component 3: API Backend Dispatch

A new backend script `scripts/backends/ai-sdk.mjs` (or TypeScript equivalent) that:

- Receives `SHERPA_*` environment variables (same contract as CLI backends)
- Resolves the provider + model from the registry
- Calls `generateText()` with the task prompt and optional tools
- Writes output to `SHERPA_LOG_FILE`
- Returns exit code (0=completed, 1=failed, 2=backend unavailable)

This plugs into the existing `worker.sh` pipeline — no changes to the dispatch orchestration.

### Component 4: UI Transparency Layer

The Dispatch Center, Task Board, and Task Detail views gain:

- **Backend type badge**: `CLI` or `API` tag next to the backend name, visually distinct (different color treatment)
- **Provider source**: For API backends, show the provider (e.g., "Groq", "Google AI", "LM Studio") alongside the model name
- **Model detail**: Full model identifier (e.g., `llama-3.3-70b-versatile` not just `groq`)
- **Health indicators**: API backends get the same green/red dot as CLI backends, powered by registry health checks

The WorkforcePanel in the Dispatch Center shows both CLI and API backends in the same list, clearly labeled. Users can choose either type when assigning tasks.

### What Stays the Same

- All 5 CLI backend scripts — untouched
- `dispatch.sh`, `worker.sh`, `dispatch-queue.sh` — work unchanged (they route to backend scripts by name)
- `resolve-route.mjs` — still used by shell scripts for CLI backends
- Planner/Worker/Judge pipeline — same orchestration
- MCP server tools — `task_dispatch` keeps spawning workers via `worker.sh`

## Rabbit Holes

1. **Replacing CLI backends with AI SDK equivalents.** The provider registry covers the same models, making it tempting to "upgrade" existing backends. Don't. CLI backends have capabilities (file editing, context management, session persistence) that API calls don't. Keep them running in parallel. The value is additive options, not migration.

2. **Building custom tools for AI SDK agents.** The research showed AI SDK agents have no built-in file/command tools. Building a tool suite (file read/write, bash exec) to make API agents equivalent to CLI agents is a massive scope expansion. Don't. API agents handle research, analysis, and content tasks that don't need file mutation. If we need autonomous coding, that's the Claude Agent SDK initiative.

3. **MCP client integration from dispatched agents.** The research confirmed AI SDK agents can connect to our MCP server and use task tools. Tempting to wire this up immediately. Don't. The basic dispatch path (prompt in → text out) works without MCP tools. MCP tool access for dispatched agents is a follow-on that depends on the coordination layer reaching Phase 1+.

4. **Context window management middleware.** AI SDK has no built-in compaction. Building middleware for long-running agents is deep work. Don't. Set conservative `stopWhen: stepCountIs(N)` limits and keep tasks focused. Context management is a future concern.

5. **Production deployment topology.** The research showed AI SDK works on Vercel with timeout constraints. Designing the production topology (where does the MCP server run? how do agents reach it?) is a separate architectural decision. This initiative is local-first.

6. **Unified routing table.** Tempting to merge `resolve-route.mjs` and `dispatch.ts` into one source of truth via the provider registry. Good idea, wrong initiative. That's a refactor of the dispatch-center output, not an additive feature.

## No-Gos

- **Do not modify existing CLI backend scripts** (`claude.sh`, `opencode.sh`, `codex.sh`, `gemini.sh`, `lm-studio.mjs`). They work. Leave them alone.
- **Do not integrate Claude Agent SDK.** That's a separate initiative with its own shape and appetite.
- **Do not deploy to Vercel or design production topology.** Local-only for this initiative.
- **Do not build AI SDK tool suites** (file editing, bash execution, etc.). API agents handle tasks that don't need those tools.
- **Do not hide the CLI/API distinction in the UI.** Transparency is a first principle — users must always see whether they're dispatching to a CLI agent or an API agent.
- **Do not remove or deprecate any existing backend.** Additive only.

## Kill Criteria

1. **If provider registry setup takes more than 1 session**, the AI SDK integration is more complex than expected. Stop, reassess whether the abstraction is right, consider a spike on just `@ai-sdk/google` alone without the registry.

2. **If free-tier providers (Groq, Google Gemini) have rate limits that prevent completing even a single research task**, the value proposition of "free cloud dispatch" is weaker than assumed. Pivot to LM Studio-only API backend and defer cloud providers to when we have API budgets.

3. **If extending the `Backend` type to include API backends causes breaking changes in more than 8 files**, the type system extension is too invasive. Stop and consider a parallel type (`ApiBackend`) rather than extending the existing discriminated union.

4. **If `worker.sh` cannot route to the new `ai-sdk.mjs` backend without significant modification**, the backend contract isn't as clean as assumed. Stop and check whether a new dispatch path (bypassing `worker.sh`) is cleaner.
