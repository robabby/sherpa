---
status: validated
source-iteration: 1
spawned-from: agent-infrastructure
created: 2026-03-06
updated: 2026-03-07
priority: medium
---

# Local Model Validation

## Context

Research iteration 1 identified Qwen2.5-Coder-7B and Gemma 3-12B as candidate local models for low-tier agent tasks. The research is desk-based — benchmarks and specs. The open question is whether these models work reliably in practice with Claude Code's tool calling protocol, WavePoint's context packages, and structured output requirements.

## Question

Can local OSS models (via Ollama's Anthropic API) reliably handle specific low-tier WavePoint tasks? What's the empirical quality threshold, and which tasks pass vs. fail?

## Validated Results (2026-03-07)

**Model:** Qwen 3.5 9B (Q4_K_M quantization, 6.55GB GGUF) via LM Studio
**API:** OpenAI-compatible at `http://localhost:1234/v1/chat/completions`
**Result:** 4/4 tasks passed consistently

| Task | Gate | Time | Notes |
|------|------|------|-------|
| summarize | 212 words, no hallucinated paths | 18.8s | Reads initiative docs, produces accurate summaries |
| frontmatter | All 9 YAML fields valid, correct enums | 4.4s | Follows schema precisely when given explicit constraints |
| activity-entry | Single line, date-prefixed, 184 chars | 3.1s | Good at structured single-line output |
| voice-lint | Valid JSON, boolean pass + suggestions array | 10.0s | Applies voice guide rules to prose samples |

**Critical settings:**
- `/no_think` appended to all prompts (suppresses Qwen's chain-of-thought mode — without it, model spends all tokens on reasoning and never produces output)
- Context window ≥ 16384 tokens (4096 default causes KV cache failures with parallel slots)
- Temperature 0.3, max_tokens 2048
- Auth via `LM_STUDIO_API_KEY` in `apps/web/.env.local`

**Tooling:** `scripts/agent-eval.mjs` — zero-dependency Node.js eval runner with task registry, quality gates, and result persistence to `docs/agent-evals/`

## Suggested Vectors

1. **Ollama + Claude Code integration test:** Set up Ollama with Qwen2.5-Coder-7B, point Claude Code at it via `ANTHROPIC_BASE_URL`. Test basic tool calling (Read, Edit, Write, Grep). Document what works and what breaks.
2. **Task category benchmarks:** Define 5-10 representative low-tier tasks (format markdown frontmatter, summarize a research file, extract structured data from a workstream log, generate a test stub, lint prose for voice compliance). Run each on local model and Claude Haiku. Compare output quality.
3. **Context window stress test:** Load WavePoint role context packages (5K, 15K, 30K tokens) into local models. Measure quality degradation as context grows. Find the practical ceiling.
4. **Constrained decoding validation:** Test LM Studio's structured output API with WavePoint Zod schemas (initiative frontmatter, session manifest, role definition). Verify format compliance.
5. **Quality gate design:** What automated checks can validate local model output? JSON schema validation, markdown lint, TypeScript compilation, test pass. Design a quality gate pipeline.

## Links

- [Ollama Anthropic Compatibility](https://docs.ollama.com/api/anthropic-compatibility)
- [Qwen2.5-Coder Family](https://qwenlm.github.io/blog/qwen2.5-coder-family/)
- [LM Studio Structured Output](https://lmstudio.ai/docs/developer/openai-compat/structured-output)
- [StructEval Benchmark](https://arxiv.org/html/2505.20139v1)
