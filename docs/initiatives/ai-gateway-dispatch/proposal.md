---
status: pending
initiative: ai-gateway-dispatch
created: 2026-03-14
updated: '2026-03-14'
type: new-plan
risk: evolutionary
targets:
  - package.json
  - scripts/backends/_ai-sdk-dispatch.mjs
  - scripts/backends/groq.mjs
  - scripts/backends/google-ai.mjs
  - packages/studio-core/src/dispatch-meta.ts
  - packages/studio-core/src/dispatch.ts
dependencies:
  - ai-sdk-dispatch
spawned-from: ai-sdk-dispatch
---

# Adopt Vercel AI Gateway for Dispatch

## Summary

Replace Sherpa's 3 provider-specific AI SDK packages (`@ai-sdk/groq`, `@ai-sdk/google`, `@ai-sdk/openai-compatible`) with `@ai-sdk/gateway`, Vercel's unified model gateway. This consolidates API key management from 3 keys to 1, adds per-generation cost tracking that can surface in the dispatch dashboard, enables automatic provider fallback routing, and gives access to hundreds of models without adding new dependencies. CLI backends are untouched — this only affects the API dispatch layer.

## State Snapshot

The API dispatch layer was built in the `ai-sdk-dispatch` initiative (approved, implementation complete). Current state:

- **`scripts/backends/_ai-sdk-dispatch.mjs`** (146 lines) — Shared dispatch module with a `PROVIDERS` map containing 3 factory functions: `createGroq()`, `createGoogleGenerativeAI()`, `createOpenAICompatible()` (lines 36-40). Each factory requires its own API key env var.
- **3 thin wrapper scripts** — `groq.mjs`, `google-ai.mjs`, `lm-studio-api.mjs` (3 lines each) call `runApiBackend(providerKey)`.
- **`packages/studio-core/src/dispatch-meta.ts`** (34 lines) — `BACKEND_META` maps each API backend to its provider key and required env var (`GROQ_API_KEY`, `GOOGLE_GENERATIVE_AI_API_KEY`, null for lm-studio-api).
- **`packages/studio-core/src/dispatch.ts`** (271 lines) — Routes define models by bare ID (e.g., `llama-3.3-70b-versatile`, `gemini-2.5-flash`).
- **`package.json`** — 4 AI SDK dependencies: `ai@^6.0.116`, `@ai-sdk/groq@^3.0.29`, `@ai-sdk/google@^3.0.43`, `@ai-sdk/openai-compatible@^2.0.35`.
- **No cost tracking** — Worker output logs tokens but not dollar cost. No cost data reaches the Studio UI.
- **No fallback routing** — If Groq is down, the task fails. No automatic retry with another provider.

Vercel AI Gateway is live on the Sherpa Vercel project (Hobby plan, $5 free credit/month, zero markup on tokens). The `@ai-sdk/gateway` package provides a `gateway()` provider that routes to any supported model via `provider/model-id` strings.

## Proposed Changes

### Package dependencies (`package.json`)

Remove `@ai-sdk/groq`, `@ai-sdk/google`, `@ai-sdk/openai-compatible`. Add `@ai-sdk/gateway`. Keep `ai` (core SDK).

### Dispatch module (`scripts/backends/_ai-sdk-dispatch.mjs`)

Replace the `PROVIDERS` factory map with a single `gateway` import from `@ai-sdk/gateway`. Model IDs change from bare strings (`llama-3.3-70b-versatile`) to gateway-qualified strings (`groq/llama-3.3-70b-versatile`). The LM Studio (localhost) provider remains as `@ai-sdk/openai-compatible` since it can't route through the cloud gateway.

Add cost metadata extraction: the gateway response includes `providerOptions.gateway.cost` and `generationId` per generation — write these to worker output alongside existing token counts.

### Backend wrappers (`groq.mjs`, `google-ai.mjs`)

These become thinner — they pass the provider-qualified model ID to the shared dispatch module rather than a provider key. Alternatively, they could collapse into a single `gateway.mjs` backend since the gateway handles provider routing.

### Backend metadata (`dispatch-meta.ts`)

Consolidate the 2 cloud API backends (groq, google-ai) into a single `gateway` backend type, or keep them as logical backends but change `envKey` to `AI_GATEWAY_API_KEY` for both. The `lm-studio-api` backend stays unchanged (localhost, no gateway).

### Route config (`dispatch.ts`)

Update model IDs in `DEFAULT_DISPATCH` to gateway-qualified format: `groq/llama-3.3-70b-versatile`, `google/gemini-2.5-flash`. Add `providerOptions` for fallback routing where appropriate (e.g., research tasks could fall back from Groq to Google).

### Future: Cost dashboard in Studio UI

Per-generation cost data from the gateway opens the door to a cost tracking panel in the dispatch dashboard — showing spend by model, by task type, and over time. This is a stretch goal for this initiative, not a hard deliverable.

## Rationale

**Why gateway over direct providers:**

1. **Key consolidation** — One `AI_GATEWAY_API_KEY` replaces `GROQ_API_KEY` + `GOOGLE_GENERATIVE_AI_API_KEY`. Adding Anthropic API, Mistral, DeepSeek, or xAI models requires zero new keys or packages.
2. **Cost visibility** — The gateway returns actual dollar cost per generation. The current system logs token counts but can't convert to cost without maintaining a price table. This is the missing piece for the dispatch dashboard.
3. **Fallback routing** — `providerOptions.gateway.order` enables automatic failover between providers. Research tasks could try Groq first, fall back to Google if rate-limited.
4. **Model discovery** — `gateway.getAvailableModels()` returns all available models with pricing. Could power a model selector in the dispatch UI.
5. **Zero markup** — No cost premium vs direct provider access. Same tokens, same price, better observability.
6. **Already provisioned** — The Vercel project already has AI Gateway enabled with $5 free credit.

**Why not:**

- Adds a Vercel dependency to the API dispatch path (mitigated by BYOK option and keeping lm-studio-api as direct provider)
- Gateway is relatively new — API surface may evolve
- Localhost models (LM Studio) can't route through the cloud gateway

**Alternative considered:** Keep direct providers, add cost tracking manually. Rejected because it requires maintaining a price table per model and doesn't provide fallback routing or model discovery.

## Dependencies

- **`ai-sdk-dispatch`** (approved) — Built the API dispatch layer this initiative refactors. Hard dependency — the files this modifies were created by that initiative.

Soft coordination with `dispatch-center` (integrated) — the dispatch UI could surface gateway cost data, but this initiative doesn't modify UI components.

## Review Notes

**Key scope decision:** LM Studio (localhost) stays on `@ai-sdk/openai-compatible` — it can't route through a cloud gateway. This means 2 provider paths: gateway for cloud models, direct for local models.

**Backend identity question:** Do we keep `groq` and `google-ai` as separate logical backends in the dispatch config (with gateway as the transport), or collapse them into a single `gateway` backend where the model ID implies the provider? The former preserves the current UI and config structure. The latter is simpler but changes how task routing looks in the dispatch dashboard.

**BYOK option:** The gateway supports passing provider keys per-request via `providerOptions.gateway.byok`. This means users who want to use their own Groq/Google keys (bypassing the Vercel billing) can do so without changing the code path. Worth supporting but not required for v1.

**Effort:** 2 sessions
**Session breakdown:**
- Session 1: Swap dependencies, rewrite `_ai-sdk-dispatch.mjs` to use gateway, update model IDs in route config, verify groq + google-ai tasks dispatch successfully
- Session 2: Add cost metadata to worker output, update `dispatch-meta.ts` backend definitions, clean up or consolidate wrapper scripts, test fallback routing
