---
doc-type: research
maintained-by: self-documenting-system
authored-by: ai
reviewed-by: null
last-updated: 2026-03-19
last-verified: 2026-03-19
source-initiatives:
  - gpu-inference-service
---

> **AI-generated** 2026-03-19 · Awaiting human review
> Sources: gpu-inference-service

# Model Selection Research: Luna's Personal Assistant LLM

## Recommendation

**Hermes 4 14B (Q4_K_M)** via Ollama on Hetzner GEX44 (20GB VRAM).

## Why Hermes 4 Wins

### Natively Steerable (Not Abliterated)

The critical distinction: Hermes 4 was *trained* to follow system prompts without imposing its own alignment. Abliterated models (huihui_ai variants, Dolphin) have refusal behavior surgically removed post-training, which degrades:

- **Tool-calling reliability** — abliteration disrupts structured output patterns critical for OpenClaw agent use
- **Benchmark quality** — ~1.3% average degradation, worse on instruction-following tasks
- **Hallucination rate** — huihui_ai self-describes abliterations as "crude, proof-of-concept"

Hermes 4 achieves unrestricted behavior through training methodology, not post-hoc surgery. The model is intelligent AND unrestrained by design.

### RefusalBench SOTA

| Model | RefusalBench Score | Approach |
|-------|-------------------|----------|
| **Hermes 4 (reasoning)** | **57.1%** | Neutrally-aligned, steerable |
| Hermes 4.3 36B | 59.5% | Same philosophy, larger |
| GPT-4o | 17.67% | Heavy safety alignment |
| Claude Sonnet 4 | 17.0% | Heavy safety alignment |
| Dolphin Venice Edition | 2.2% censorship refusal | Abliterated |

### Fits the Hardware

| Aspect | Value |
|--------|-------|
| Model size (Q4_K_M) | ~10 GB |
| VRAM remaining | ~10 GB (for KV cache) |
| Context window | 32K+ tokens comfortably |
| Inference speed (RTX 4000 SFF Ada) | ~25-35 tok/s estimated |
| Model swap time (NVMe) | ~5-8 seconds |

### Strong Benchmarks (14B class)

- MMLU: 88.4 (based on Qwen3 14B foundation)
- IFEval: 78.7 (Loose)
- MATH-500: strong (training methodology from 405B)
- Hybrid reasoning: toggles between fast answers and deep `<think>` mode

## Alternatives Considered

### Qwen3.5 27B — Smarter but doesn't fit

At ~17GB Q4_K_M, it leaves only 3GB for KV cache on the GEX44. Limited to 4K-8K context. A personal assistant that can't remember the conversation is severely hampered. If we had 24GB VRAM, this would win. At 20GB, Hermes 4 14B is the practical choice.

### Mistral Small 3.2 (24B) — Natively unrestricted but weaker

Fits at ~14GB Q4_K_M with 6GB headroom. Natively less restricted (Apache 2.0, no safety filters). But benchmarks trail Hermes 4 on instruction following, reasoning, and coding. Community consensus: "underwhelming" compared to Qwen and Hermes at similar sizes.

### Dolphin 3.0 — Surpassed

Hermes 4 surpasses Dolphin on every axis: better benchmarks, better training methodology (natively steerable vs. dataset filtering), actively maintained. Dolphin was the pioneer; Hermes is the current state of the art.

### MoE Models (Qwen3 30B-A3B) — Misleading VRAM

Even though only 3B parameters are active at inference, Ollama loads ALL 30B parameters into VRAM. MoE advantage is speed, not memory. At ~19-20GB, these don't fit the GEX44 with any context headroom.

## System Prompt Strategy

### Abliterated Model vs. System Prompt: System Prompt Wins

For a natively steerable model like Hermes 4, the system prompt defines behavior. No abliteration needed — the model was trained to follow instructions faithfully.

### Recommended Ollama Modelfile

```dockerfile
FROM hermes4:14b-q4_K_M

PARAMETER num_ctx 32768
PARAMETER temperature 0.7
PARAMETER top_p 0.9
PARAMETER repeat_penalty 1.1

SYSTEM """You are Luna, a personal AI collaborator. You are helpful, honest, and thorough.

You engage with all topics without unnecessary refusals. You think step by step when problems are complex. You write clean code, give direct answers, and acknowledge uncertainty rather than hallucinating.

When asked about sensitive topics, you provide accurate, factual information. You trust the user to make their own decisions about how to use information.

You are a tool — powerful and versatile. The responsibility for how you're used lies with the user, not with you."""
```

Create with: `ollama create luna -f Luna.Modelfile`

### Layered Prompt Architecture for OpenClaw

| Layer | Source | Purpose |
|-------|--------|---------|
| Modelfile SYSTEM | Baked into Ollama model | Behavioral defaults, always present |
| SOUL.md | OpenClaw config | Luna's identity, collaboration style, values |
| AGENTS.md | Per-workspace | Git workflow, security, operational procedures |
| Task prompt | Dispatch system | Sherpa governance context injected per-task |

### OpenClaw Caveat

When OpenClaw sets `reasoning: true`, the system prompt is sent as `role: "developer"` which Ollama may silently ignore. Workaround: set behavioral defaults in the Modelfile SYSTEM directive (always respected) rather than relying solely on OpenClaw's system prompt injection.

## Model Stacking

With Hermes 4 at ~10GB, there's room for a second small model:

```bash
# Primary (always loaded)
ollama pull hermes4:14b-q4_K_M

# Fast secondary for simple queries
ollama pull qwen3.5:9b-q4_K_M

# Keep primary loaded longer
export OLLAMA_KEEP_ALIVE=60m
```

One great all-rounder is better than specialized models for Luna's use case. Model swapping adds latency, and Hermes 4 14B handles coding, writing, analysis, and creative tasks well enough that specialization isn't worth the complexity.

## Key Sources

- Nous Research — Hermes 4: hermes4.nousresearch.com
- Eric Hartford — Uncensored Models philosophy: erichartford.com/uncensored-models
- RefusalBench SOTA results: Hermes 4 technical report (arxiv 2508.18255)
- huihui_ai — abliteration quality notes: ollama.com/huihui_ai
- Heretic — automated abliteration tool: github.com/p-e-w/heretic
- r/LocalLLaMA community consensus on daily-driver models
