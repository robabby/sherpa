---
premortem: 2026-03-14
failure-modes-identified: 21
mitigations-added: 7
kill-criteria-added: 3
---

# ai-sdk-dispatch — Pre-mortem

## Frame

> It's June 2026. The `ai-sdk-dispatch` initiative consumed 3 sessions and delivered nothing usable. The AI SDK packages sit in `package.json` as dead dependencies, the Dispatch Center still only shows CLI backends, and no task has ever been successfully dispatched through the API path. What happened?

## Technical Failures

### T1: `worker.sh` cannot route to `ai-sdk.mjs` (FATAL)

`worker.sh` lines 152-156 hardcode backend resolution: any backend that isn't `lm-studio` gets `.sh` appended. A task with `backend: groq` resolves to `scripts/backends/groq.sh`, which doesn't exist. The shape claims `worker.sh` works unchanged — this is false.

**First signal:** `worker.sh` exits with code 1: "Backend not found: scripts/backends/groq.sh"

### T2: `ai-sdk.mjs` receives model name without provider prefix (SIGNIFICANT)

The `SHERPA_MODEL` env var passes bare model names (`llama-3.3-70b-versatile`). The AI SDK registry resolves via `provider:model` format. A single `ai-sdk.mjs` script serving multiple providers has no way to know which provider to use from the model name alone.

**First signal:** "Model not found in registry" error on first non-default provider test.

### T3: Health checks block on cloud API timeouts (SIGNIFICANT)

`getBackendHealth()` runs all backends sequentially via `execSync` with 5s timeout. Cloud provider health checks (Groq, Gemini) make outbound HTTP calls. Behind slow DNS or corporate firewalls, 3 cloud providers × 5s = 15s blocks before local backends even check. The Dispatch Center page load time jumps from sub-second to 15+ seconds.

**First signal:** Studio page load time spikes when API backends are registered.

### T4: Zod version conflict between AI SDK v6 and MCP SDK (SIGNIFICANT)

AI SDK v6 peer-deps on `zod ^3.25.76 | ^4.1.8`. MCP SDK and studio-core pin Zod 3.x. In strict pnpm hoisting, this creates runtime failures: "Expected Zod schema, got unknown object" when passing schemas between packages.

**First signal:** `pnpm install` peer dependency warnings; runtime validation errors at tool registration.

### T5: Session 3 UI depends on data contracts not yet built (SIGNIFICANT)

`BackendHealth` type has no `backendType`, `provider`, or `providerDisplayName` fields. If Sessions 1-2 don't deliver these data contracts, Session 3 builds UI against mocked data that never gets connected.

**First signal:** Session 3 commits show hardcoded badge values instead of dynamic data.

### T6: Free-tier rate limits hit at batch scale (SIGNIFICANT)

Groq: 30 RPM. A research task with `stopWhen: stepCountIs(5)` = 5+ requests. Three concurrent tasks via `dispatch-queue.sh --pending` exceeds 30 RPM. Individual tasks pass; batch dispatch fails intermittently.

**First signal:** Mix of completions and failures in first batch dispatch. NDJSON shows exit code 1 without clear error message.

### T7: Env var size limit for large task prompts (MINOR)

macOS `kern.argmax` limits combined env+args to ~256KB. Large task prompts via `SHERPA_TASK_PROMPT` could hit this in batch dispatch. Not a problem for small test tasks.

## Scope Failures

### S1: Provider registry consumes entire Session 1 (FATAL)

Building `createProviderRegistry()` with 5 providers, API key detection, `resolveModel()`, error paths, and health checks feels like progress but produces zero observable output. No task dispatched, no log file written. Kill Criterion #1 exists for this but might not trigger because the registry "works" — it just hasn't dispatched anything.

**First signal:** End of Session 1 commit log shows registry files but no `ai-sdk.mjs`, no task completion.

### S2: Nobody changes DEFAULT_DISPATCH to use API backends (FATAL)

All 3 sessions complete. Capability exists. But `DEFAULT_DISPATCH` still routes everything to CLI backends. Auto-dispatch via `matchTasksToAgents()` never touches API backends. The only way to use them is manual override per task. Nobody opts in.

**First signal:** After merge, `git log -- DEFAULT_DISPATCH` shows no routing changes.

### S3: MCP server integration (Session 2) has no caller (SIGNIFICANT)

The `task_dispatch` MCP tool gains an API branch, but nobody dispatches tasks through MCP tools. The actual workflow is: UI → `/api/dispatch/run` → `worker.sh`. The MCP code path has zero callers in the real dispatch flow.

**First signal:** After Session 2, ask "which user action triggers this code path?" and get silence.

### S4: Claude Agent SDK gravitational pull (SIGNIFICANT-FATAL)

The research positioned Claude Agent SDK as "the bridge" and "critical discovery." During implementation, it's one `import` away. The no-go says "don't integrate it" but the research says "this is the answer." Under implementation pressure, the research's excitement wins. Half a session is lost exploring Agent SDK integration.

**First signal:** `@anthropic-ai/claude-agent-sdk` appears in `package.json` or a `claude-agent.ts` file appears.

### S5: BackendType introduces routing complexity without simplifying anything (MINOR-SIGNIFICANT)

Adding `'cli' | 'api'` as a dimension to routing creates a preference question: for a given task-type, which type wins? `resolveRoute()` gains conditional branches. The routing table needs parallel entries. This is the "unified routing table" rabbit hole arrived at from the type system direction.

## Context Failures

### C1: Groq kills or guts the free tier (FATAL)

Groq eliminates free tier or slashes to 100 req/day. Google Gemini tightens further. The "free cloud dispatch" value proposition collapses. Kill Criterion #2 fires, but LM Studio-only API backend adds zero capability over the existing CLI `lm-studio.mjs` backend.

**First signal:** Groq dashboard shows "billing required" banner.

### C2: Claude Agent SDK absorbs multi-provider dispatch (FATAL)

Anthropic ships Agent SDK v2 with provider routing — can dispatch to Gemini, Groq, OpenAI-compatible endpoints while retaining full tool suite. The three-layer model collapses to two. AI SDK layer becomes redundant.

**First signal:** Anthropic changelog shows `createProvider()` or multi-model routing in Agent SDK.

### C3: AI SDK v7 ships, breaks v6 API surface (SIGNIFICANT)

Given 5 major versions already, a v7 within 3 months is plausible. Could deprecate `createProviderRegistry()` in favor of Gateway pattern. Code ships with known expiration date.

**First signal:** `npm info ai versions` shows `7.0.0-beta.X`.

### C4: Customer needs dispatch before API path is ready (FATAL for initiative)

A consulting engagement needs programmatic dispatch now. Team spikes a quick API wrapper around `worker.sh`. The spike becomes permanent. AI SDK code sits unreferenced.

**First signal:** Customer scoping document mentions "API access to dispatch."

### C5: CLI tools ship native SDK modes (SIGNIFICANT)

Gemini CLI and Codex CLI add library interfaces. Each native SDK preserves full capabilities that AI SDK lacks. The AI SDK's provider-agnostic advantage weakens when native SDKs are strictly more capable per-provider.

---

## Ranked Failure Modes

| Rank | ID | Failure Mode | Likelihood | Severity | Early Detection |
|------|-----|-------------|-----------|----------|-----------------|
| 1 | T1 | `worker.sh` can't route to `ai-sdk.mjs` | **High** | Fatal | First test dispatch |
| 2 | S2 | Nobody updates DEFAULT_DISPATCH routing | **High** | Fatal | Post-merge routing table unchanged |
| 3 | T2 | `ai-sdk.mjs` can't determine provider from SHERPA_MODEL | **High** | Significant | First multi-provider test |
| 4 | S1 | Provider registry consumes Session 1 | **Medium** | Fatal | No end-to-end dispatch by session end |
| 5 | S3 | MCP Session 2 integration has no caller | **High** | Significant | No user action triggers the code path |
| 6 | T3 | Cloud health checks block page load | **Medium** | Significant | Studio page load >5s |
| 7 | C1 | Groq/Gemini free tier killed | **Low-Med** | Fatal | Provider dashboard changes |
| 8 | S4 | Claude Agent SDK gravitational pull | **Medium** | Significant | Agent SDK in package.json |
| 9 | T6 | Rate limits at batch scale | **Medium** | Significant | First batch dispatch failures |
| 10 | C2 | Agent SDK absorbs multi-provider | **Low** | Fatal | Anthropic changelog |

## Mitigations

### M1: Fix `worker.sh` routing on day one (addresses T1)

The shape's claim that `worker.sh` stays unchanged is wrong. Add a routing case for `.mjs` API backends — a 5-line change, not a rewrite. Acknowledge this in the plan as a prerequisite, not a surprise. Test the routing change before building the registry.

### M2: Add `SHERPA_PROVIDER` env var to backend contract (addresses T2)

`worker.sh` already exports `SHERPA_MODEL`. Add `SHERPA_PROVIDER` (e.g., `groq`, `google`, `lmstudio`) derived from the routing table's backend entry. The `ai-sdk.mjs` script uses this to resolve the correct provider in the registry. This is a contract extension, not a contract break — existing CLI backends ignore the new variable.

### M3: End-to-end dispatch in first 2 hours of Session 1 (addresses S1)

Before building the provider registry abstraction, get a single `generateText()` call working through `worker.sh` with hardcoded Groq or Gemini config. The registry is a nice-to-have abstraction; a working dispatch path is the deliverable. Build the simplest thing that dispatches, then abstract.

### M4: Update DEFAULT_DISPATCH as part of the initiative (addresses S2)

Add at least one task-type route pointing to an API backend in `DEFAULT_DISPATCH`. The obvious candidate: `research` → `groq` (free tier, good for research tasks). This ensures auto-dispatch actually uses the new capability. Include this in the Session 1 deliverables, not as a follow-on.

### M5: Drop MCP server integration from Session 2; replace with routing + health (addresses S3, T3)

Session 2 becomes: async health checks for API backends (non-blocking, parallel), `BackendHealth` type extension with `backendType` and `provider` fields, and the data contracts Session 3 needs. This produces observable value (health indicators in UI) and has real callers (the Dispatch Center page load).

### M6: Async health checks for cloud providers (addresses T3)

Don't add cloud providers to the synchronous `getBackendHealth()` pipeline. API backend health checks should be async with aggressive timeouts (2s) and cached results. The Dispatch Center loads instantly with cached health, refreshes in background.

### M7: Changelog check at session start (addresses C1, C2, C3)

Before starting each session, check changelogs for `ai`, `@ai-sdk/groq`, `@ai-sdk/google`, `@modelcontextprotocol/sdk`, and `@anthropic-ai/claude-agent-sdk`. If any shows a breaking release, reassess before writing code. 5-minute ritual, prevents building on shifting ground.

## Updates to Shape

**Kill criteria to add:**

1. **Session 1 gate:** If no task has been dispatched end-to-end (prompt in → `generateText()` → log file written → task status updated) by the end of Session 1, stop. The registry doesn't count. A dispatched task counts.
2. **Changelog gate:** If `ai` v7 or `@anthropic-ai/claude-agent-sdk` multi-provider ships before Session 2, pause the initiative and reassess the architectural premise.
3. **Routing activation gate:** The initiative is not done until `DEFAULT_DISPATCH` routes at least one task-type to an API backend. No "capability without activation."

**Shape corrections:**

- `worker.sh` WILL need a minor modification (T1). Remove "worker.sh — work unchanged" claim. Budget 30 minutes for the routing fix.
- Session 2 should be health checks + data contracts, not MCP server integration (S3). The MCP path has no caller.
- Add `SHERPA_PROVIDER` env var to the backend contract (T2). It's an extension, not a break.

## Human-Identified Risks

_This section is intentionally blank. Rob: add political, organizational, or team-dynamic risks that the pre-mortem can't see. Examples: competing priorities, customer timing pressure, motivation/energy to complete all 3 sessions, dependency on other people's work._
