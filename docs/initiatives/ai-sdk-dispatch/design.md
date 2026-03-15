---
designed: 2026-03-14
type: both
components-new: 2
components-modified: 4
files-planned: 12
---

# ai-sdk-dispatch — Design

Shape: [shape.md](shape.md) | Pre-mortem: [premortem.md](premortem.md)

## Overview

Add AI SDK API backends alongside existing CLI backends. The design addresses the pre-mortem's top 3 failure modes head-on: worker.sh routing (T1), provider resolution (T2), and routing activation (S2).

## Architecture

### Data Models

#### Backend type system

Extend `Backend` with API backend names. Add `BackendMeta` as a static lookup for metadata the UI and dispatch pipeline need.

```typescript
// packages/studio-core/src/dispatch.ts

export type Backend =
  // CLI backends (existing)
  | 'claude' | 'opencode' | 'codex' | 'gemini' | 'lm-studio'
  // API backends (new)
  | 'groq' | 'google-ai' | 'lm-studio-api'

export type BackendType = 'cli' | 'api'

export interface BackendMeta {
  type: BackendType
  displayName: string
  /** AI SDK provider key (e.g., 'groq', 'google'). Only for API backends. */
  provider?: string
  /** Env var that must be set for this backend. Null = no key needed (local). */
  envKey?: string | null
}

export const BACKEND_META: Record<Backend, BackendMeta> = {
  // CLI
  'claude':       { type: 'cli', displayName: 'Claude' },
  'opencode':     { type: 'cli', displayName: 'OpenCode' },
  'codex':        { type: 'cli', displayName: 'Codex' },
  'gemini':       { type: 'cli', displayName: 'Gemini' },
  'lm-studio':    { type: 'cli', displayName: 'LM Studio' },
  // API
  'groq':           { type: 'api', displayName: 'Groq',             provider: 'groq',     envKey: 'GROQ_API_KEY' },
  'google-ai':      { type: 'api', displayName: 'Google AI',        provider: 'google',   envKey: 'GOOGLE_GENERATIVE_AI_API_KEY' },
  'lm-studio-api':  { type: 'api', displayName: 'LM Studio (API)',  provider: 'lmstudio', envKey: null },
}
```

**Why a lookup table, not extending `BackendHealth`:** The metadata is static (doesn't change at runtime). Health is dynamic. Keeping them separate means the UI can derive `backendType` and `displayName` from `BACKEND_META[health.backend]` without changing the health check contract.

**Type ripple assessment:** `TaskBoardEntry.backend` is already `string` (not `Backend`), so the task board, task detail, and all UI components that read from task frontmatter already handle arbitrary backend names. The typed surface is limited to: `dispatch.ts` (owns the type), `resolve-route.mjs` (parallel routing table), and `getBackendHealth()` (hardcoded backend list). That's 3 files, well under the kill criterion of 8.

#### BackendHealth extension

```typescript
// packages/studio-core/src/dispatch.ts

export interface BackendHealth {
  backend: Backend
  available: boolean
  models?: string[]
  error?: string
  /** Derived from BACKEND_META at health-check time. */
  backendType: BackendType
  /** Human-readable provider name for UI. */
  displayName: string
}
```

#### Routing table update

```typescript
export const DEFAULT_DISPATCH: DispatchConfig = {
  routes: {
    'code-implementation': { backend: 'claude', model: 'claude-opus-4-6' },
    'code-review':         { backend: 'codex' },
    'architect':           { backend: 'claude', model: 'claude-opus-4-6' },
    'research':            { backend: 'groq', model: 'llama-3.3-70b-versatile' },  // ← CHANGED: was opencode
    'content-generation':  { backend: 'google-ai', model: 'gemini-2.5-flash' },    // ← CHANGED: was gemini CLI
    'audit':               { backend: 'groq', model: 'llama-3.3-70b-versatile' },  // ← CHANGED: was opencode
    'embeddings':          { backend: 'opencode', model: 'minimax-m2.5-free' },
  },
  fallback: { backend: 'opencode', model: 'minimax-m2.5-free' },
  offlineFallback: { backend: 'lm-studio' },
  overnight: { blocked: ['code-implementation', 'architect'] },
}
```

This directly addresses pre-mortem S2 (nobody updates routing). Research, content-generation, and audit tasks now route to free API backends by default.

### Component Tree

```
ai-sdk.mjs (new)                — Backend script for all API backends
  └── reads: SHERPA_BACKEND, SHERPA_MODEL, SHERPA_TASK_PROMPT, SHERPA_LOG_FILE
  └── calls: generateText() from 'ai' package
  └── uses: provider registry (inline, not a separate module)

dispatch.ts (modified)          — Extended types + BACKEND_META + routing
  └── BackendType, BackendMeta, BACKEND_META (new exports)
  └── DEFAULT_DISPATCH (updated routes)
  └── getBackendHealth() (handles API backends)

worker.sh (modified)            — Backend resolution + SHERPA_BACKEND env var
  └── exports SHERPA_BACKEND
  └── checks .mjs then .sh for backend script

resolve-route.mjs (modified)    — Add API backends to parallel routing table

dispatch-content.tsx (modified) — WorkforcePanel gains CLI/API badges
  └── BackendBadge (inline, not separate component)
```

### Data Flow

**Dispatch path (happy path):**

```
User clicks "Dispatch" in Dispatch Center
  → POST /api/dispatch/run { taskSlug, backend: 'groq', model: 'llama-3.3-70b-versatile' }
  → worker.sh groq-research-task
    → task-scanner.mjs reads task frontmatter
    → resolve-route.mjs returns { backend: 'groq', model: 'llama-3.3-70b-versatile' }
    → export SHERPA_BACKEND="groq" SHERPA_MODEL="llama-3.3-70b-versatile"
    → resolve backend script: scripts/backends/groq.mjs? no → groq.sh? no → ai-sdk.mjs? ...
```

Wait — here's the routing problem. The backend name `groq` doesn't map to `ai-sdk.mjs` via file naming. Two approaches:

**Approach A: Per-provider symlinks/wrappers**

```
scripts/backends/groq.mjs         → 3-line wrapper calling ai-sdk.mjs
scripts/backends/google-ai.mjs    → 3-line wrapper calling ai-sdk.mjs
scripts/backends/lm-studio-api.mjs → 3-line wrapper calling ai-sdk.mjs
```

worker.sh tries `.mjs` first, finds `groq.mjs`, runs it. Each wrapper just imports shared logic.

**Approach B: worker.sh reads BACKEND_META**

worker.sh calls `resolve-route.mjs --script groq` which returns the script path (`ai-sdk.mjs`).

**Decision: Approach A.** Per-provider wrappers are simpler, self-documenting, and follow the existing pattern where each backend has its own file. The wrappers are trivial:

```javascript
// scripts/backends/groq.mjs
import { runApiBackend } from './_ai-sdk-dispatch.mjs';
await runApiBackend('groq');
```

This means worker.sh only needs the `.mjs`-first file check — no new resolution logic.

**Updated dispatch path:**

```
worker.sh
  → export SHERPA_BACKEND="groq" SHERPA_MODEL="llama-3.3-70b-versatile"
  → finds scripts/backends/groq.mjs (exists)
  → node scripts/backends/groq.mjs
    → imports runApiBackend from _ai-sdk-dispatch.mjs
    → calls runApiBackend('groq')
      → creates provider from registry: groq('llama-3.3-70b-versatile')
      → generateText({ model, prompt: SHERPA_TASK_PROMPT })
      → writes output to SHERPA_LOG_FILE
      → exit 0
```

**Health check path:**

```
getBackendHealth()
  → CLI backends: execSync('backend.sh --health') (existing, unchanged)
  → API backends: check env var exists + quick model list fetch (async, with 2s timeout)
  → Returns BackendHealth[] with backendType derived from BACKEND_META
```

### Integration Points

| Existing code | Change | Reason |
|--------------|--------|--------|
| `packages/studio-core/src/dispatch.ts` | Extend types, add BACKEND_META, update routing, update health checks | Core type system |
| `scripts/worker.sh` (lines 132, 152-156) | Add `SHERPA_BACKEND` export, `.mjs`-first script resolution | Backend routing fix (premortem T1) |
| `scripts/resolve-route.mjs` (line 12-22) | Add API backend entries to `DEFAULT_ROUTES` | Parallel routing table sync |
| `packages/studio-ui/src/dispatch-content.tsx` (lines 604-660) | Add CLI/API badge to WorkforcePanel backend list | UI transparency |

### New Files

| File | Purpose | Lines (est.) |
|------|---------|-------------|
| `scripts/backends/_ai-sdk-dispatch.mjs` | Shared AI SDK dispatch logic — `runApiBackend(provider)` | ~80 |
| `scripts/backends/groq.mjs` | Groq wrapper — 3 lines | 3 |
| `scripts/backends/google-ai.mjs` | Google AI wrapper — 3 lines | 3 |
| `scripts/backends/lm-studio-api.mjs` | LM Studio API wrapper — 3 lines | 3 |

### Package Dependencies

Add to `packages/studio-core/package.json` (or a new `packages/studio-dispatch/` if we want isolation):

```json
{
  "ai": "^6.0.116",
  "@ai-sdk/groq": "^1.0.0",
  "@ai-sdk/google": "^1.0.0",
  "@ai-sdk/openai-compatible": "^1.0.0"
}
```

**Zod alignment check (premortem T4):** Run `pnpm why zod` before installing. If the monorepo pins Zod 3.x and AI SDK demands Zod 4.x, add `pnpm.overrides` to pin a compatible version. This is a Session 1 gate.

## UI Design

### WorkforcePanel — Backend List

Current state: flat list of backends with green/red health dot and model names.

New state: same list, but each backend entry gains:
1. **Type badge**: Small `CLI` or `API` pill before the backend name
2. **Provider label**: For API backends, the provider source (already the display name)
3. **No structural changes** — same `<button>` layout, same selection interaction

#### Backend row layout (current → new)

```
Current:
  🟢 Claude                         claude-opus-4-6
  🟢 LM Studio                      qwen-3.5-9b

New:
  🟢 CLI  Claude                     claude-opus-4-6
  🟢 CLI  LM Studio                  qwen-3.5-9b
  🟢 API  Groq                       llama-3.3-70b-versatile
  🔴 API  Google AI                  offline
  🟢 API  LM Studio (API)            qwen-3.5-9b
```

#### Type badge styling

```
CLI badge: border-muted-foreground/20 bg-muted-foreground/8 text-muted-foreground/60
           text-[8px] uppercase tracking-widest font-semibold
           rounded px-1 py-px

API badge: border-[var(--color-session)]/25 bg-[var(--color-session)]/10 text-[var(--color-session)]
           text-[8px] uppercase tracking-widest font-semibold
           rounded px-1 py-px
```

CLI gets muted treatment (it's the established default). API gets the session color (distinct but not competing with the copper action palette).

#### Grouping

Backends are grouped by type in the list:

```
Backends
  CLI
    🟢 CLI  Claude          claude-opus-4-6
    🟢 CLI  OpenCode        minimax-m2.5-free
    🟢 CLI  Codex           ready
    🟢 CLI  Gemini          ready
    🟢 CLI  LM Studio       qwen-3.5-9b
  API
    🟢 API  Groq            llama-3.3-70b-versatile
    🔴 API  Google AI       offline
    🟢 API  LM Studio (API) qwen-3.5-9b
```

Sub-headers `CLI` and `API` use the same `text-[10px] uppercase tracking-widest text-muted-foreground/40` as the existing "Backends" and "Agents" headers.

### Task Board + Task Detail

These already display `backend` as a monospace string badge. Since `TaskBoardEntry.backend` is `string`, new backend names (`groq`, `google-ai`) render automatically. No code changes needed — just verify they look right.

**Optional enhancement (if time in Session 3):** Add the CLI/API badge inline with backend monospace text on task rows. Same tiny badge pattern.

### Pipeline Steps (QueueControls)

Currently shows: `{N} tasks → {agent} → {backend}`

Backend step now shows the type: `{N} tasks → {agent} → API · groq`

Small addition to the pipeline step label when a backend is selected.

## File Plan

### Session 1: Foundation + First Dispatch

| # | File | Action | What |
|---|------|--------|------|
| 1 | `packages/studio-core/src/dispatch.ts` | Modify | Add `BackendType`, `BackendMeta`, `BACKEND_META`. Extend `Backend` union. Update `DEFAULT_DISPATCH` routes. Update `BackendHealth` interface. Update `getBackendHealth()` for API backends. |
| 2 | `scripts/worker.sh` | Modify | Add `export SHERPA_BACKEND`. Change lines 152-156 to check `.mjs` first, then `.sh`. |
| 3 | `scripts/resolve-route.mjs` | Modify | Add API backend entries to `DEFAULT_ROUTES`. |
| 4 | `scripts/backends/_ai-sdk-dispatch.mjs` | Create | Shared `runApiBackend(providerKey)` — provider registry, `generateText()`, log file writing. ~80 lines following `lm-studio.mjs` patterns. |
| 5 | `scripts/backends/groq.mjs` | Create | 3-line wrapper calling `runApiBackend('groq')`. |
| 6 | `scripts/backends/google-ai.mjs` | Create | 3-line wrapper calling `runApiBackend('google')`. |
| 7 | `scripts/backends/lm-studio-api.mjs` | Create | 3-line wrapper calling `runApiBackend('lmstudio')`. |
| 8 | `package.json` (root or studio-core) | Modify | Add `ai`, `@ai-sdk/groq`, `@ai-sdk/google`, `@ai-sdk/openai-compatible` deps. |

**Session 1 gate:** End-to-end dispatch of a research task through `groq.mjs` → `_ai-sdk-dispatch.mjs` → `generateText()` → log file written.

### Session 2: Health Checks + Data Contracts

| # | File | Action | What |
|---|------|--------|------|
| 9 | `packages/studio-core/src/dispatch.ts` | Modify | Implement async API health checks (env var check + provider ping with 2s timeout). Populate `backendType` and `displayName` in `BackendHealth` from `BACKEND_META`. |
| 10 | `packages/studio-core/src/mcp-dashboard.ts` | Modify | Surface API backend health in MCP dashboard data (if applicable). |

### Session 3: UI Transparency

| # | File | Action | What |
|---|------|--------|------|
| 11 | `packages/studio-ui/src/dispatch-content.tsx` | Modify | WorkforcePanel: group backends by type, add CLI/API badges. QueueControls: show type in pipeline step. |
| 12 | `packages/studio-ui/src/tasks-content.tsx` | Modify | Optional: add CLI/API micro-badge to task table backend column. |

## Decisions

### Per-provider wrapper scripts (not a single ai-sdk.mjs entry point)

Each API backend gets a tiny `.mjs` wrapper (e.g., `groq.mjs`) that imports shared logic from `_ai-sdk-dispatch.mjs`. This means `worker.sh` resolves scripts by filename convention (same as today) instead of needing new routing logic. The wrappers are 3 lines each — negligible maintenance.

**Rejected:** Single `ai-sdk.mjs` receiving provider via env var. This requires either modifying `worker.sh` to export `SHERPA_PROVIDER` or parsing the backend name inside the script. The wrapper approach is more explicit and self-documenting.

### BACKEND_META as static lookup (not extending BackendHealth)

Backend metadata (type, displayName, provider key, env var) is static — it doesn't change at runtime. Health is dynamic. Keeping them separate means `BackendHealth` stays a simple health check result, and the UI derives display info from `BACKEND_META[health.backend]`.

**Rejected:** Adding all fields to `BackendHealth`. This couples health checks to display concerns and makes the health check function responsible for data it doesn't own.

### Grouped backend list (CLI section, API section)

The WorkforcePanel groups backends by type with sub-headers. This makes the CLI/API distinction immediately visible without requiring users to read tiny badges.

**Rejected:** Flat list with only badges. When there are 5 CLI + 3 API backends, a flat list of 8 items is harder to scan than two groups.

## Open Questions

1. **Where do AI SDK deps live?** Root `package.json` (simplest), `packages/studio-core` (logical home for dispatch), or a new `packages/studio-dispatch` (cleanest isolation)? Decision: start in root, extract if the dependency footprint grows.

2. **Rate limit handling in `_ai-sdk-dispatch.mjs`:** Should the script retry on 429, or fail immediately and let the user/auto-dispatch retry at the task level? Decision deferred to implementation — start with fail-fast, add retry if needed.

3. **Model selection for API backends:** The current routing table specifies a default model per route. Should users be able to override the model in the Dispatch Center UI? The CLI backends show available models in the health response. API backends could do the same (list models from provider). Defer to Session 3 if time permits.
