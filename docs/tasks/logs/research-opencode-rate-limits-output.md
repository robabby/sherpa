# Research Output: research-opencode-rate-limits

**Task:** Test OpenCode free tier rate limits with batch requests  
**Executed by:** Luna (OpenClaw) — nightly task runner  
**Date:** 2026-03-19  
**Initiative:** dispatch-center  

---

## Blocker Notice

**OpenCode CLI is not installed** in this environment (`which opencode` returns nothing). Live batch-request testing against the OpenCode Zen free tier was not possible. This report synthesizes available evidence from public sources and code analysis of `scripts/backends/opencode.sh`.

Confidence: **medium** — findings are based on public issue reports and official documentation, not direct measurement.

---

## What OpenCode Zen Is

OpenCode Zen is an AI gateway operated by OpenCode that provides curated, benchmark-verified access to open-source models for coding tasks. As of March 2026:

- **Free tier:** Available for certain models on a temporary promotional basis (e.g., Grok Code Fast 1, GLM 4.7 have been offered free for limited periods)
- **Go subscription:** $5/month (first month), $10/month thereafter — provides "generous 5-hour request limits" for GLM-5, Kimi K2.5, MiniMax M2.5, MiniMax M2.7
- **Pay-per-request:** Credits can be added for premium models (GPT-5.x, Kimi K2.5 paid tier)

---

## Rate Limit Evidence

### Source 1: GitHub Issue #13318 — "Keep getting rate limited on Zen" (Feb 12, 2026)
- User reports hitting rate limits on Kimi-K2.5 **even on a paid plan**, reaching "8th or more attempt"
- No official numeric limit disclosed in the issue
- Confirms rate limits apply to paid users as well as free tier
- **Confidence: high** (GitHub issue, first-hand report)

### Source 2: Reddit r/opencodeCLI — "What are the limit rates for the free models on zen?" (Jan 14, 2026)
- Community reports 429 errors on OpenCode Zen free models
- One user found that changing IP via VPN removed the rate limit, suggesting **IP-based throttling** at least partially governs free tier limits
- Source references a rate limiter implementation in the OpenCode codebase: `packages/console/app/src/routes/zen/util/rateLimiter.ts` — internal implementation not publicly readable
- **Confidence: medium** (community report, secondhand code reference)

### Source 3: GLM 4.7 Rate Limits (Reddit r/ZaiGLM, Jan 20, 2026)
- Users running 3 parallel OpenCode sessions with GLM 4.7 reported **no rate limit issues**
- Suggests per-request rate limits may be relatively lenient for concurrent (not burst) usage patterns
- "OpenCode is super multi-threaded as regards LLM calls" — rate limits may be per-model not per-session
- **Confidence: low** (anecdotal, model-specific)

### Source 4: OpenCode Zen Docs (opencode.ai/docs/zen/, fetched March 2026)
- No explicit numeric rate limits published in documentation
- Zen is described as pay-per-request for most models; free models are temporary promotional offers
- 5-hour request limits mentioned for Go subscription models (not free tier)
- **Confidence: high** (official source, absence of published limits is itself a finding)

---

## Key Findings

| Finding | Evidence | Confidence |
|---------|----------|------------|
| OpenCode Zen does not publish numeric rate limits | Docs review | High |
| Free tier uses IP-based throttling (at least partially) | Community report, VPN workaround | Medium |
| Paid plans are also rate limited | GitHub issue #13318 | High |
| Go subscription offers "5-hour request limits" for specific models | Official docs | High |
| Parallel requests from multiple sessions may not compound rate limits | Community report | Low |
| Rate limit errors surface as 429 responses in the CLI | Community report, GitHub issue | High |

---

## Implications for Sherpa Dispatch

The `scripts/backends/opencode.sh` backend currently has **no retry or rate-limit handling**:

```bash
opencode run "${MODEL_FLAG[@]}" "$SHERPA_TASK_PROMPT" > "${SHERPA_LOG_FILE:-/dev/stdout}" 2>&1
```

If OpenCode Zen returns a 429, `opencode run` will likely surface it as a non-zero exit code, which `worker.sh` captures and marks the task as `failed`. There is no retry backoff.

### Recommendations for dispatch-center initiative

1. **Add retry with exponential backoff to `opencode.sh`** — at minimum, retry 3× on non-zero exit with 5s/15s/45s delays, capturing exit code to distinguish 429 (retryable) from other failures
2. **Do not rely on free-tier models for overnight batch dispatch** — rate limits are undocumented and inconsistent; Go subscription or paid models are more reliable
3. **Serialize concurrent OpenCode dispatches** — given IP-based throttling evidence, dispatching multiple `opencode` tasks simultaneously from the same host may compound rate limit exposure. `dispatch-queue.sh` should enforce serial dispatch for OpenCode backend.
4. **Monitor 429 patterns in task events** — add a `rate_limited` event type to the NDJSON event stream so the MCP dashboard can surface throttling patterns
5. **Consider model fallback** — if primary Zen model hits rate limit, fall back to a different free model or local LM Studio backend

### Model Availability as of March 2026

Models available on OpenCode Zen free/go tiers (from code comments in `opencode.sh` and public docs):
- `opencode/nemotron-3-super-free` — free
- `opencode/minimax-m2.5-free` — free  
- `opencode/mimo-v2-flash-free` — free
- `opencode/big-pickle` — free (promotional)
- `opencode/gpt-5-nano` — from code comments (may require credits)
- `GLM-5`, `Kimi K2.5`, `MiniMax M2.5`, `MiniMax M2.7` — Go subscription

---

## What Wasn't Tested

- Actual 429 trigger thresholds (requests/minute, requests/hour)
- Whether per-model limits differ from per-account limits
- Retry-after header presence and values on 429 responses
- Behavior of `opencode run` specifically (vs. API calls) under rate limit conditions

These would require live testing with the CLI installed. Recommend running this test from the macOS dev machine where OpenCode is available.

---

## Verdict

**PARTIAL.** Research synthesized from public sources — no live testing possible. Key finding: OpenCode Zen rate limits are **undocumented, inconsistent, and affect both free and paid tiers**. For reliable overnight batch dispatch, the OpenCode backend needs retry logic and the dispatch queue should serialize OpenCode tasks. Recommend the dispatch-center initiative prioritize the `opencode.sh` retry implementation before enabling OpenCode as a primary overnight backend.
