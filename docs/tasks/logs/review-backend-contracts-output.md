# Code Review Output: review-backend-contracts

**Task:** Audit backend module contract consistency  
**Executed by:** Luna (OpenClaw) — nightly task runner  
**Date:** 2026-03-19  
**Initiative:** dispatch-center  

---

## Summary

This review audits all backend modules in `scripts/backends/` for contract consistency against the documented contract:

```
# Contract: reads SHERPA_* env vars, returns exit code
#   0 = completed, 1 = failed, 2 = backend unavailable
```

Files reviewed:
- `scripts/backends/claude.sh`
- `scripts/backends/opencode.sh`
- `scripts/backends/gemini.sh`
- `scripts/backends/codex.sh`
- `scripts/backends/lm-studio.mjs`
- `scripts/backends/groq.mjs` → delegates to `_ai-sdk-dispatch.mjs`
- `scripts/backends/google-ai.mjs` → delegates to `_ai-sdk-dispatch.mjs`
- `scripts/backends/lm-studio-api.mjs` → delegates to `_ai-sdk-dispatch.mjs`
- `scripts/backends/openclaw.mjs`
- `scripts/backends/_ai-sdk-dispatch.mjs` (shared)

---

## Contract Definition

All backends must:
1. Read task input from `SHERPA_TASK_PROMPT` env var
2. Write output to `SHERPA_LOG_FILE` env var
3. Return exit codes: `0` = completed, `1` = failed, `2` = backend unavailable
4. Support `--health` flag outputting JSON `{ available: bool, error?: string }`
5. Support `SHERPA_MODE=interactive` for interactive invocation via `exec`

---

## Per-Backend Analysis

### claude.sh ✅

- **Exit codes:** 0 (success, implicit), 2 (CLI not found), non-zero (delegated to `claude` binary). ✅
- **--health:** Returns `{"available":true/false}`. ✅
- **Interactive mode:** `exec claude "$@"` on `SHERPA_MODE=interactive`. ✅
- **SHERPA_TASK_PROMPT:** Passed as final positional arg to `claude --print`. ✅
- **SHERPA_LOG_FILE:** Redirected via `> "${SHERPA_LOG_FILE:-/dev/stdout}"`. ✅
- **SHERPA_BUDGET_USD:** Honored via `--max-budget-usd`. ✅ (unique to claude.sh)
- **SHERPA_WORKTREE:** Honored via `--worktree`. ✅ (unique to claude.sh)

**Issue (minor):** Health check only verifies `claude` is in PATH, not that the API key is valid or the process is authenticated. This is consistent with other CLI backends, so not a blocking issue — but means `available: true` can be misleading if auth is broken.

---

### opencode.sh ✅ (with gaps)

- **Exit codes:** 0 (delegated to opencode binary), 2 (CLI not found). ✅
- **--health:** Returns `{"available":true/false}`. ✅
- **Interactive mode:** `exec opencode "${ARGS[@]}" "$@"`. ✅
- **SHERPA_TASK_PROMPT:** Passed to `opencode run` as positional arg. ✅
- **SHERPA_LOG_FILE:** Redirected via `> "${SHERPA_LOG_FILE:-/dev/stdout}"`. ✅

**Issue (significant):** No retry on 429 / rate limit. If `opencode run` exits non-zero due to rate limiting, the task is immediately failed with no retry attempt. See `research-opencode-rate-limits` for full analysis.

**Issue (minor):** `opencode run` headless behavior is assumed — the `--print` or non-interactive mode contract is not documented in the backend script. If `opencode run` requires a TTY or opens an interactive session, the output redirect will fail silently.

**Issue (minor):** No `exit 1` after `opencode run` failure — relies on `set -euo pipefail` to propagate. This is technically correct but fragile if future edits add commands after the opencode call.

---

### gemini.sh ✅ (with gaps)

- **Exit codes:** 0 (delegated), 2 (CLI not found). ✅
- **--health:** Returns `{"available":true/false}`. ✅
- **Interactive mode:** `exec gemini "${ARGS[@]}" "$@"`. ✅
- **SHERPA_TASK_PROMPT:** Passed via `-p "$SHERPA_TASK_PROMPT"`. ✅
- **SHERPA_LOG_FILE:** Redirected via `> "${SHERPA_LOG_FILE:-/dev/stdout}"`. ✅
- **--approval-mode=yolo:** Auto-accepts all tool actions in headless mode. ✅

**Issue (significant):** `SHERPA_TASK_PROMPT` is passed directly via `-p "..."` with double-quote expansion. If the prompt contains single quotes, the shell expansion could break. Unlike claude.sh (which passes prompt as a positional arg), gemini.sh embeds the prompt in an argument string. This is a correctness risk for prompts containing special characters.

**Recommendation:** Either use a temp file approach or ensure the prompt is exported and passed without shell interpolation.

---

### codex.sh ✅

- **Exit codes:** 0 (delegated), 2 (CLI not found). ✅
- **--health:** Returns `{"available":true/false}`. ✅
- **Interactive mode:** `exec codex "${ARGS[@]}" "$@"`. ✅
- **SHERPA_TASK_PROMPT:** Passed as positional arg to `codex exec`. ✅
- **SHERPA_LOG_FILE:** Redirected via `> "${SHERPA_LOG_FILE:-/dev/stdout}"`. ✅

**Note:** Comment says "no budget/cost control flags" for codex — limits set on OpenAI dashboard. This is a known gap vs. claude.sh's `--max-budget-usd`. Acceptable for now but limits autonomous cost control.

---

### lm-studio.mjs ✅

- **Exit codes:** 0 (success), 1 (failure), 2 (LM Studio unavailable). ✅ Full contract implemented.
- **--health:** Returns `{ available, responseMs, models, error }`. ✅ (richer than CLI backends)
- **Interactive mode:** Not applicable (API-only backend). N/A
- **SHERPA_TASK_PROMPT:** Read from env. ✅
- **SHERPA_LOG_FILE:** Written with structured header + content. ✅
- **Validation:** Checks for required env vars and exits 1 with error message. ✅

**Positive note:** `lm-studio.mjs` has the most complete contract implementation — explicit exit codes, env var validation, pre-flight connectivity check, and structured output format. It's the reference implementation for API backends.

---

### _ai-sdk-dispatch.mjs (groq.mjs, google-ai.mjs, lm-studio-api.mjs) ✅ (with gaps)

- **Exit codes:** 0 (success), 1 (failure), 2 (provider unavailable). ✅
- **--health:** Returns `{ available, error }`. ✅
- **SHERPA_TASK_PROMPT:** Read from env. ✅
- **SHERPA_LOG_FILE:** Written with structured header. ✅
- **Env validation:** Checks SHERPA_TASK_PROMPT and SHERPA_LOG_FILE. ✅

**Issue (significant):** `groq.mjs` and `google-ai.mjs` require API keys (`GROQ_API_KEY`, `GOOGLE_GENERATIVE_AI_API_KEY`). The `healthCheck` function calls `factory()` to construct the provider — but provider construction may not fail immediately if the key is missing (depending on AI SDK behavior). The health check may return `available: true` even with an invalid/missing key, only failing at request time.

**Evidence:** `groq: () => createGroq({ apiKey: process.env.GROQ_API_KEY })` — if `GROQ_API_KEY` is undefined, `createGroq` may not throw until the first request. Health check result would be misleading.

**Recommendation:** Add explicit env var checks in `healthCheck` before constructing the provider.

**Issue (minor):** `lm-studio-api.mjs` delegates to `_ai-sdk-dispatch.mjs` with provider key `"lmstudio"` — but the `PROVIDERS` map uses `createOpenAICompatible` which does not require an API key. This is correct for local LM Studio, but the log output will show `provider: lmstudio` with no model ID unless `SHERPA_MODEL` is set. The default `DEFAULT_MODELS.lmstudio = "default"` is a placeholder that relies on LM Studio serving whatever model is currently loaded.

---

### openclaw.mjs ✅ (with significant gaps)

- **Exit codes:** 0 (success), 1 (failure), 2 (gateway unavailable/timed out). ✅
- **--health:** Attempts full WebSocket connection and auth. ✅ (thorough but slow — 15s timeout)
- **SHERPA_TASK_PROMPT:** Read from env. ✅
- **SHERPA_LOG_FILE:** Written with structured header. ✅
- **Env validation:** Checks for `OPENCLAW_GATEWAY_TOKEN` (exits 2 if missing). ✅

**Issue (significant):** The health check performs a **full protocol v3 WebSocket handshake** with a 15-second timeout. This is expensive for a health check — the `getBackendHealth()` function in `dispatch.ts` calls this with a 5-second timeout, which may be insufficient for the full handshake to complete. If gateway is slow, health may falsely report unavailable.

**Recommendation:** Add a lightweight ping path to `openclaw.mjs --health` that only verifies connectivity (TCP connect + initial WS frame) without completing the full auth handshake.

**Issue (moderate):** `chatSend()` has a 15-minute timeout (`timeoutMs = 900_000`). No progress indicator or intermediate keepalive. If the gateway session goes idle, the task will hang silently for 15 minutes before failing. `worker.sh` has no independent timeout mechanism.

**Issue (minor):** Device identity is stored at `.openclaw-dispatch/device.json` (project-local). This directory is not in `.gitignore` verification scope. If committed, private key material would be exposed.

---

## Summary of Issues

| Backend | Severity | Issue |
|---------|----------|-------|
| `opencode.sh` | **Significant** | No retry on 429/rate-limit — tasks fail immediately |
| `gemini.sh` | **Significant** | Prompt injection risk: `-p "$SHERPA_TASK_PROMPT"` with shell expansion |
| `_ai-sdk-dispatch.mjs` | **Significant** | Health check may return `available: true` with missing API key |
| `openclaw.mjs` | **Significant** | Health check does full auth handshake — may fail within 5s budget |
| `openclaw.mjs` | **Moderate** | 15-minute silent hang on gateway idle — no keepalive |
| `openclaw.mjs` | **Minor** | `.openclaw-dispatch/` not confirmed in `.gitignore` |
| `opencode.sh` | **Minor** | Headless mode contract for `opencode run` not verified |
| All CLI backends | **Minor** | Health check only verifies CLI presence, not auth validity |

---

## What Passes

- ✅ All backends implement the core 3-exit-code contract
- ✅ All backends support `--health` flag
- ✅ All backends read from `SHERPA_TASK_PROMPT` and write to `SHERPA_LOG_FILE`
- ✅ All CLI backends support `SHERPA_MODE=interactive` via `exec`
- ✅ `lm-studio.mjs` is the reference implementation — most complete contract adherence
- ✅ `openclaw.mjs` has the richest auth and identity management

---

## Verdict

**NEEDS WORK** — 4 significant issues found. The core contract (exit codes, env vars, health flag) is consistently implemented across all backends, but three backends have correctness or reliability gaps that could cause hard-to-debug failures in overnight dispatch:

1. `opencode.sh` — no rate-limit retry
2. `gemini.sh` — shell expansion risk in prompt passing
3. `_ai-sdk-dispatch.mjs` — misleading health check for API-key backends
4. `openclaw.mjs` — health check too expensive for 5s budget window
