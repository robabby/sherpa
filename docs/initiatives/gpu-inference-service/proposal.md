---
status: archived
initiative: gpu-inference-service
created: 2026-03-19
updated: '2026-03-19'
archived: 2026-03-19
archive-reason: cost-prohibitive
type: new-plan
risk: additive
targets:
  - docs/templates/gpu-server-provision.md                    # (new file)
  - scripts/backends/ollama.mjs                               # (new file)
  - scripts/backends/ollama-api.mjs                           # (new file)
  - packages/studio-core/src/dispatch.ts
  - packages/studio-core/src/dispatch-meta.ts
  - scripts/resolve-route.mjs
  - docs/initiatives/gpu-inference-service/research/           # (new file)
dependencies:
  - vps-remote-compute
informs:
  - scheduled-dispatch
  - agent-context-portability
  - agentic-runtime-platforms
spawned-from: null
---

## Summary

Deploy a dedicated GPU VPS running Ollama with uncensored open LLMs, serving as a primary or fallback inference backend for Luna (OpenClaw agent) and the Sherpa dispatch system. This adds two new dispatch backends (`ollama` CLI and `ollama-api`) and a GPU server provisioning runbook, giving Sherpa always-on, self-hosted, unrestricted model inference without per-token API costs.

## State Snapshot

Luna runs on a Hetzner CPX31 (8GB RAM, no GPU, $18/mo) in Hillsboro, OR. The dispatch system has 9 backends (5 CLI, 3 API, 1 gateway) but no self-hosted inference backend on a GPU. LM Studio serves as a local dev tool on Rob's machine (OpenAI-compatible API at `localhost:1234`). The `vps-remote-compute` initiative (integrated) established the Hetzner infrastructure, Tailscale networking, and Docker Compose patterns. The `ai-sdk-dispatch` initiative (approved) will unify backends under Vercel AI SDK. Current API backends (Groq, Google AI) have per-token costs and vendor-controlled model restrictions.

## Research Findings

### GPU VPS Options (ranked by value)

**For 70B models (48GB+ VRAM required):**

| Rank | Provider | GPU | VRAM | ~$/month | Notes |
|------|----------|-----|------|----------|-------|
| 1 | **RunPod Community** | RTX A6000 | 48 GB | $240-360 | Best price for 70B. EU-FR-1 available. Docker + persistent volumes. |
| 2 | TensorDock | RTX A6000 | 48 GB | ~$345 | EU hosts, pay-per-second. |
| 3 | TensorDock | A100 | 80 GB | ~$548 | More VRAM headroom. |
| 4 | Vast.ai | A100 80GB | 80 GB | ~$575 | Cheapest A100, marketplace risks. |
| 5 | RunPod Community | A100 80GB | 80 GB | ~$650 | Reliable. |
| 6 | **Hetzner GEX131** | RTX PRO 6000 | 96 GB | ~$970 | Same provider. Bare metal. 96GB handles everything. |

**For 30B models (20-24GB VRAM sufficient):**

| Rank | Provider | GPU | VRAM | ~$/month | Notes |
|------|----------|-----|------|----------|-------|
| 1 | **Hetzner GEX44** | RTX 4000 SFF Ada | 20 GB | ~$230 | Cheapest. Bare metal. Same provider as existing VPS. |
| 2 | RunPod Community | RTX 4090 | 24 GB | $250-285 | If 24GB needed (vs GEX44's 20GB). |
| 3 | TensorDock | RTX 4090 | 24 GB | $255-270 | EU hosts. |

**Recommendation:** Start with **Hetzner GEX44** (~$230/mo, 20GB VRAM). Same provider, same billing, bare metal, Germany datacenter. Fits 24B and 32B quantized models comfortably. If 70B becomes essential, upgrade to RunPod A6000 (~$300/mo) or Hetzner GEX131 (~$970/mo). The GEX44 handles the sweet-spot models (Qwen 2.5 Coder 32B Q4, DeepSeek R1 14B, Mistral Small 24B) that deliver the best quality-per-dollar.

### Uncensored Open LLMs

Two techniques exist for removing restrictions:

1. **Dataset filtering** (Eric Hartford/Dolphin) — fine-tune on instruction data with alignment responses removed
2. **Abliteration** (representation engineering) — surgically remove the "refusal direction" vector from model weights

**Recommended model stack for Luna:**

| Use Case | Model | Params | VRAM (Q4_K_M) | Source |
|----------|-------|--------|---------------|--------|
| **Coding (primary)** | Qwen 2.5 Coder Abliterated | 14B | ~9 GB | `huihui_ai/qwen2.5-coder-abliterate:14b` |
| **Reasoning** | DeepSeek R1 Abliterated | 14B | ~9 GB | `huihui_ai/deepseek-r1-abliterated:14b` |
| **General** | Mistral Small 3.2 | 24B | ~14 GB | `mistral-small3.2` (natively unrestricted) |
| **Fallback (light)** | Dolphin 3.0 Llama 3.1 | 8B | ~5 GB | `dolphin3` |

All fit within GEX44's 20GB VRAM (one at a time, Ollama swaps models on demand). For simultaneous model serving, the GEX131 (96GB) would allow multiple models loaded concurrently.

**If 70B budget is available later:** Hermes 3 70B (~40GB Q4), R1 1776 70B (~40GB Q4, Perplexity's CCP-decensored DeepSeek R1), Qwen 2.5 Coder Abliterated 32B (~20GB Q4).

### Eric Hartford's Philosophy

Hartford's core argument: open-source models inherit censorship from ChatGPT-generated training data, not from deliberate choice. By filtering the training dataset to remove alignment/moralizing responses, the model becomes **steerable** — the system prompt owner decides the alignment, not the model vendor. The model is a tool; responsibility lies with the user. This aligns with Sherpa's principle that behavioral constraints belong in the governance layer (`.claude/rules/`, role definitions), not baked into model weights.

## Proposed Changes

### 1. GPU Server Provisioning (`docs/templates/gpu-server-provision.md`)

New runbook modeled on the existing `server-provision.md`. Covers:
- Hetzner GEX44 provisioning via hcloud CLI or web console
- Ollama installation (Docker Compose with GPU passthrough)
- Tailscale integration for secure access from existing mesh
- Model pre-pulling (the recommended stack above)
- Health check endpoint configuration
- Firewall rules (Ollama API exposed only via Tailscale, not public internet)

### 2. Dispatch Backend — Ollama CLI (`scripts/backends/ollama.mjs`)

New CLI backend that SSHs to the GPU VPS and runs Ollama commands. Follows the pattern of `lm-studio.mjs`. For interactive/streaming task execution.

### 3. Dispatch Backend — Ollama API (`scripts/backends/ollama-api.mjs`)

New API backend using Ollama's OpenAI-compatible API endpoint. Integrates with the existing `_ai-sdk-dispatch.mjs` pattern via `createOpenAICompatible()`. Adds `OLLAMA_URL` environment variable (defaults to Tailscale hostname). For headless/overnight task dispatch.

### 4. Dispatch Registration (`dispatch.ts`, `dispatch-meta.ts`, `resolve-route.mjs`)

Register the two new backends in:
- `dispatch-meta.ts` — type + display name for Studio UI
- `dispatch.ts` — route configuration (Ollama as fallback for research, content-generation, code-review tasks)
- `resolve-route.mjs` — shell-layer routing mirror

### 5. Research Archive (`research/`)

Persist the GPU VPS comparison and uncensored LLM landscape research for future reference and updates.

## Rationale

**Why self-hosted vs. API providers:**
- No per-token costs for Luna's overnight workloads (currently using Groq/Google AI free tiers)
- Model choice is ours — no vendor content restrictions
- Aligns with Sherpa's "convention system with pluggable runtime" platform model
- Privacy — client data stays on our infrastructure

**Why Hetzner GEX44 to start:**
- Same provider = same billing, same support, same Tailscale mesh
- $230/mo fits the VPS budget strategy (free/near-free baseline; GPU is deliberate upgrade)
- 20GB VRAM handles the sweet-spot 14B-24B models that deliver best quality-per-dollar
- Bare metal = no noisy neighbors, full root access, Docker with GPU passthrough
- Upgrade path clear: GEX131 ($970/mo) or RunPod A6000 ($300/mo) if 70B needed

**Why uncensored models:**
- Luna needs to engage with any topic without artificial refusals — security research, exploit analysis, competitive intelligence, legal analysis
- Behavioral constraints belong in the governance layer, not model weights (aligns with behavioral engineering convention)
- Hartford's philosophy of composable alignment matches Sherpa's convention-first approach

## Dependencies

- **`vps-remote-compute`** (integrated) — established Hetzner infrastructure, Tailscale networking, Docker patterns. This initiative builds on that foundation with a second, GPU-equipped server.

## Review Notes

**Key trade-offs:**
- GEX44 (20GB) limits us to one model loaded at a time and excludes 70B models. This is acceptable for Phase 1 — Ollama swaps models on demand with ~10-30s cold start.
- RunPod would be cheaper for 70B ($300 vs $970) but adds a second provider. Operational simplicity of single-provider (Hetzner) wins for Phase 1.
- Marketplace providers (Vast.ai, TensorDock) offer lower prices but with reliability/availability risks unsuitable for always-on Luna fallback.

**Open questions:**
- Should Ollama be the fallback for all non-Claude task types, or only specific ones (research, content-generation)?
- Model selection per task type — should the dispatch layer pick models based on task type (coding → Qwen Coder, research → DeepSeek R1)?
- Hetzner price increase April 1, 2026 — GEX44 rises from EUR 184 to EUR 212 (~$230). Factor into timing.

**Effort:** 3 sessions

**Session breakdown:**
- Session 1: Provision GEX44, install Ollama + Docker + Tailscale, pull model stack, verify inference
- Session 2: Build `ollama.mjs` and `ollama-api.mjs` backends, register in dispatch system, test end-to-end
- Session 3: Write provisioning runbook, configure Luna fallback routing, integration testing with overnight dispatch
