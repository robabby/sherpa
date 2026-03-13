# Local OSS Model Viability for Agent Tasks

Research artifact for `agent-infrastructure` Phase 2. Answers: which open-source models can handle low/medium tier agent tasks locally via LM Studio on Apple Silicon?

**Date:** 2026-03-06

---

## 1. Current Top OSS Models for Code-Related Tasks

### Tier 1: Code-Specialized Models

| Model | Params | Active Params | Context | HumanEval | Notes |
|-------|--------|---------------|---------|-----------|-------|
| **Qwen2.5-Coder-32B** | 32B dense | 32B | 128K | 92.7% | Matches GPT-4o on HumanEval. Q4_K_M ~20GB. [Source](https://qwenlm.github.io/blog/qwen2.5-coder-family/) |
| **Qwen2.5-Coder-7B** | 7B dense | 7B | 128K | 88.4% | Beats CodeStral-22B. Best small FIM model. [Source](https://qwenlm.github.io/blog/qwen2.5-coder-family/) |
| **Qwen3-Coder-30B** | 30B MoE | 3.3B | 256K | — | MoE: only 3.3B active per token. Q4_K_M ~18.6GB. [Source](https://github.com/QwenLM/Qwen3-Coder) |
| **Qwen3-Coder-Next** | 80B MoE | 3B | 256K | — | Smallest active params of any competitive coder. [Source](https://huggingface.co/Qwen/Qwen3-Coder-Next) |
| **Devstral Small 2** | 24B dense | 24B | 256K | — | Apache 2.0. Fits 32GB Mac. Agentic coding focus. [Source](https://mistral.ai/news/devstral-2-vibe-cli) |
| **Devstral 2** | 123B dense | 123B | 256K | 72.2% SWE-bench | Too large for local; reference only. [Source](https://mistral.ai/news/devstral-2-vibe-cli) |
| **StarCoder2-15B** | 15B dense | 15B | 16K | — | 600+ languages, but only 16K context (too small). [Source](https://github.com/bigcode-project/starcoder2) |

### Tier 2: General Models Strong at Code

| Model | Params | Active Params | Context | Notes |
|-------|--------|---------------|---------|-------|
| **Llama 4 Scout** | 109B MoE | 17B | 10M | Massive context but 17B active is heavy for 32GB. [Source](https://ai.meta.com/blog/llama-4-multimodal-intelligence/) |
| **Llama 4 Maverick** | 400B MoE | 17B | 512K-1M | Too large for consumer hardware. [Source](https://ai.meta.com/blog/llama-4-multimodal-intelligence/) |
| **Qwen3.5-9B** | 9B dense | 9B | 262K | Released March 2026. Strong general + code. [Source](https://huggingface.co/Qwen/Qwen3.5-397B-A17B) |
| **Gemma 3-27B** | 27B dense | 27B | 128K | MLX day-zero support. Good summarization. [Source](https://ai.google.dev/gemma/docs/core) |
| **Gemma 3-12B** | 12B dense | 12B | 128K | Sweet spot for 32GB Mac. [Source](https://huggingface.co/google/gemma-3-12b-it) |
| **Gemma 3-4B** | 4B dense | 4B | 128K | Punches above weight. Runs on 16GB. [Source](https://huggingface.co/google/gemma-3-4b-it) |
| **DeepSeek-R1-Distill-32B** | 32B dense | 32B | — | Strong reasoning. Q4_K_M ~18-20GB. [Source](https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-32B) |
| **DeepSeek-R1-Distill-14B** | 14B dense | 14B | — | Good reasoning in smaller package. [Source](https://github.com/deepseek-ai/DeepSeek-R1) |

### Tier 3: Small Language Models (< 7B)

| Model | Params | Context | Best For |
|-------|--------|---------|----------|
| **Qwen3-1.7B** | 1.7B | — | Short structured outputs. [Source](https://www.bentoml.com/blog/the-best-open-source-small-language-models) |
| **SmolLM3-3B** | 3B | — | Outperforms Llama-3.2-3B and Qwen2.5-3B. [Source](https://www.bentoml.com/blog/the-best-open-source-small-language-models) |
| **Llama 3.2-3B** | 3B | 128K | Tool calling and structured outputs. [Source](https://www.bentoml.com/blog/the-best-open-source-small-language-models) |
| **Gemma 3-4B** | 4B | 128K | QAT-optimized, function calling built in. [Source](https://ai.google.dev/gemma/docs/core) |
| **Ministral-3B** | 3B | — | Designed for function calling and JSON output. [Source](https://www.bentoml.com/blog/the-best-open-source-small-language-models) |

---

## 2. Quantization on Apple Silicon

### Format Comparison: GGUF vs MLX

| Factor | GGUF (llama.cpp) | MLX (Apple) |
|--------|-------------------|-------------|
| Compatibility | LM Studio, Ollama, many tools | LM Studio (recent), mlx-lm |
| Small models (< 7B) | Good | 20-30% faster |
| Large models (> 14B) | Similar (memory bandwidth bound) | Similar |
| Ecosystem | Broader, more models available | Growing, Apple-native |
| Fine-tuning | Not supported | Supported on-device |

**Recommendation for LM Studio:** GGUF remains the safer choice for breadth of model support. MLX is worth testing for small models where the speed advantage matters. [Source](https://cho.sh/r/E5B180), [Source](https://github.com/lmstudio-ai/mlx-engine/issues/101)

### Quantization Level Tradeoffs

| Quant | Bits | Size (7B) | Size (32B) | Perplexity Hit | Coding Impact | Recommendation |
|-------|------|-----------|------------|----------------|---------------|----------------|
| **Q8_0** | 8-bit | ~7.5GB | ~34GB | Negligible | None measurable | Quality-first when RAM allows |
| **Q6_K** | 6-bit | ~5.5GB | ~25GB | Minimal | Subtle on complex tasks | Good balance for 32GB+ |
| **Q5_K_M** | 5-bit | ~4.8GB | ~22GB | +0.035 ppl (7B) | Minor detail loss | Sweet spot for Mac |
| **Q4_K_M** | 4-bit | ~4.1GB | ~18GB | +0.054 ppl (7B) | Measurable on reasoning | Default for constrained RAM |
| **Q3_K_M** | 3-bit | ~3.3GB | ~15GB | Significant | Noticeable quality drop | Avoid for coding tasks |

Key finding: **Q4_K_M, Q5_K_M, and Q8_0 all achieve identical 51.8% Pass@1 on HumanEval** — quantization preserves code generation quality well. Quality differences show up more in reasoning and nuance than in code correctness. [Source](https://www.ionio.ai/blog/llm-quantize-analysis), [Source](https://enclaveai.app/blog/2025/11/12/practical-quantization-guide-iphone-mac-gguf/)

---

## 3. What's Realistic for Local Models

### Strong candidates for local execution (low tier)

- **Markdown formatting and normalization** — restructuring existing content, fixing frontmatter, consistent heading levels. Even 3B models handle this well.
- **Document summarization** — condensing research, meeting notes, changelogs. 7B+ models produce good summaries.
- **Structured data extraction** — pulling frontmatter fields, extracting TODO items, parsing file inventories. Works well with constrained JSON output.
- **Simple code generation** — boilerplate, type definitions, test stubs, interface implementations from specs. Qwen2.5-Coder-7B excels here.
- **Prose linting** — checking voice/tone compliance, flagging superlatives, verifying formatting conventions.
- **File-in/file-out transforms** — rename operations, import reorganization, simple refactors within a single file.
- **YAML/JSON schema validation and generation** — frontmatter generation, config file creation. Best with constrained decoding.

### Plausible for local execution with right model (medium tier)

- **Single-file implementation** — implementing a function from a clear spec with 7-14B coder model.
- **Code review of limited scope** — reviewing a diff for a single module. Needs 14B+ with sufficient context.
- **Content generation from templates** — generating content that follows an established pattern.
- **Test generation** — writing tests for existing functions. Qwen2.5-Coder-7B+ handles this.

### NOT realistic locally — keep on Claude

- **Multi-file architecture decisions** — understanding cross-module dependencies, designing new abstractions.
- **Complex reasoning chains** — initiative proposals, research synthesis, nuanced tradeoff analysis.
- **Large codebase refactoring** — changes spanning 5+ files with dependency awareness.
- **Voice and tone authoring** — original content requiring WavePoint's specific voice. Too subtle for local models.
- **Ambiguous requirements** — tasks where the spec is unclear and the model must ask clarifying questions or make judgment calls.
- **Deep research** — /rr cycles require sustained reasoning across many sources.
- **Initiative planning** — weighing dependencies, estimating effort, sequencing phases.

---

## 4. LM Studio: Capabilities and Limitations

### What LM Studio supports well

- **GGUF models** via llama.cpp backend — broadest model support. [Source](https://lmstudio.ai/models)
- **MLX models** on Apple Silicon — growing support, some performance issues on large models. [Source](https://github.com/lmstudio-ai/mlx-engine/issues/101)
- **OpenAI-compatible API** at `localhost:1234` — drop-in replacement for OpenAI SDK calls.
- **Structured JSON output** via constrained decoding — enforces valid JSON conforming to a provided schema. Uses grammar-based token masking. [Source](https://lmstudio.ai/docs/developer/openai-compat/structured-output)
- **Zod integration** via TypeScript SDK — directly use Zod schemas for structured responses. [Source](https://lmstudio.ai/docs/typescript/llm-prediction/structured-response)
- **Model discovery** — browse and download from Hugging Face directly in the UI.
- **Metal GPU acceleration** — automatic on Apple Silicon. [Source](https://lmstudio.ai/models)

### Known limitations

- **MLX performance on large models** — reports of MLX being slower than GGUF for models >14B on M4 Max. [Source](https://github.com/lmstudio-ai/lmstudio-bug-tracker/issues/258)
- **Context window vs. RAM** — loading a 256K context model doesn't mean you can fill 256K tokens. KV cache consumes significant additional RAM beyond model weights.
- **No fine-tuning** — LM Studio is inference-only. Fine-tuning requires mlx-lm or other tools.
- **Single model at a time** — can't run two models simultaneously without multiple instances.

### Structured output detail

LM Studio's structured output follows OpenAI's API format:
```json
{
  "response_format": {
    "type": "json_schema",
    "json_schema": { "name": "...", "schema": { ... } }
  }
}
```
This is critical for Sherpa's use case — agents producing structured outputs (frontmatter, proposals, data extraction) can use constrained decoding to guarantee valid format. [Source](https://lmstudio.ai/docs/developer/openai-compat/structured-output)

---

## 5. Hardware Requirements

### Apple Silicon Memory Guide

| Config | Available for Model* | Recommended Models | tok/s (est.) |
|--------|---------------------|-------------------|-------------|
| **M1 Pro 16GB** | ~10-12GB | 7B Q4_K_M, 3B Q8_0 | 15-30 |
| **M1 Pro 32GB** | ~24-26GB | 14B Q5_K_M, 7B Q8_0, Qwen3-Coder-30B Q4 (tight) | 10-25 |
| **M2/M3 Pro 36GB** | ~28-30GB | 14B Q8_0, Qwen3-Coder-30B Q4 | 15-30 |
| **M2/M3 Max 64GB** | ~50-55GB | 32B Q8_0, 70B Q4_K_M | 20-40 |
| **M2/M3 Max 96GB** | ~80-85GB | 70B Q6_K | 25-40 |
| **M4 Max 128GB** | ~110GB | 70B Q8_0 | 30-40 |

*Available = total RAM minus ~4-6GB for OS and apps, minus KV cache overhead for context.

**Memory bandwidth is the bottleneck**, not compute. Apple Silicon gets ~200 GB/s (M1 Pro) to ~800 GB/s (M4 Ultra). During token generation, the GPU is mostly waiting for data. [Source](https://medium.com/@andreask_75652/thoughts-on-apple-silicon-performance-for-local-llms-3ef0a50e08bd)

### Minimum viable spec for Sherpa low-tier tasks

**32GB Apple Silicon (M1 Pro or newer)** — This fits:
- Qwen2.5-Coder-7B at Q8_0 (~7.5GB) with room for 30K+ token context
- Qwen3-Coder-30B (MoE, 3.3B active) at Q4_K_M (~18.6GB) — tight but viable
- Gemma 3-12B at Q5_K_M (~8GB) with comfortable context room
- Devstral Small 2 (24B) at Q4_K_M — tight fit, may need reduced context

[Source](https://apxml.com/posts/best-local-llm-apple-silicon-mac), [Source](https://www.hardware-corner.net/guides/qwen3-hardware-requirements/)

---

## 6. Structured Output and Instruction Following

### The problem

Even state-of-the-art models achieve only ~76% on StructEval (structured output benchmark). Open-source models lag ~10 points behind. This means **unconstrained generation of JSON/YAML will have errors ~25-35% of the time**. [Source](https://arxiv.org/html/2505.20139v1)

### The solution: Constrained decoding

LM Studio supports grammar-based constrained decoding that masks invalid tokens during generation. With constrained decoding:
- JSON output is **guaranteed valid** against the provided schema
- YAML frontmatter can be enforced to match expected fields
- The quality gap between local and API models largely disappears for format compliance

**Critical implication for Sherpa:** All local model tasks that produce structured output (frontmatter, data extraction, config generation) should use constrained decoding via LM Studio's structured output API. Do not rely on the model to produce valid JSON/YAML on its own. [Source](https://lmstudio.ai/docs/developer/openai-compat/structured-output), [Source](https://mbrenndoerfer.com/writing/constrained-decoding-structured-llm-output)

### Model-specific instruction following

- **Qwen2.5-Coder** series: Strong instruction following, trained on instruction data. Good at following format specs.
- **Gemma 3**: Function calling built in at 4B+. Good for tool-use patterns.
- **Llama 3.2 3B**: Specifically optimized for tool calling and structured outputs.
- **Ministral-3B**: Designed for function calling and JSON-style outputs.

[Source](https://www.bentoml.com/blog/the-best-open-source-small-language-models)

---

## 7. Recommendations for Sherpa

### Primary model picks for low-tier agent tasks

| Use Case | Model | Quant | RAM Needed | Why |
|----------|-------|-------|-----------|-----|
| **Code generation, test stubs** | Qwen2.5-Coder-7B | Q8_0 | ~8GB + context | Best small coder. 88.4% HumanEval. 128K context. |
| **Summarization, formatting** | Gemma 3-12B | Q5_K_M | ~8GB + context | Strong summarization, 128K context, MLX native. |
| **Structured extraction** | Qwen2.5-Coder-7B | Q5_K_M | ~5GB + context | + LM Studio constrained decoding for guaranteed JSON. |
| **Stretch: single-file implementation** | Qwen3-Coder-30B (MoE) | Q4_K_M | ~19GB + context | 3.3B active params, good quality for the RAM cost. |

### Secondary / experimental picks

| Use Case | Model | Notes |
|----------|-------|-------|
| Ultra-lightweight formatting | Gemma 3-4B or Ministral-3B | For tasks where speed > quality. |
| Reasoning-heavy low-tier | DeepSeek-R1-Distill-14B | When a task is "low" on code but needs logical steps. |
| Maximum code quality locally | Qwen2.5-Coder-32B at Q4_K_M | Needs 64GB Mac. Matches GPT-4o on HumanEval. |

### Context budget reality check

WavePoint role context packages are 5K-30K tokens. With a 7B model at Q8_0 on 32GB:
- Model weights: ~7.5GB
- KV cache for 32K tokens: ~2-4GB (varies by model architecture)
- OS overhead: ~4-6GB
- **Total: ~14-18GB of 32GB used** — comfortable headroom.

For the MoE Qwen3-Coder-30B at Q4_K_M:
- Model weights: ~18.6GB
- KV cache for 32K tokens: ~3-5GB
- OS overhead: ~4-6GB
- **Total: ~26-30GB of 32GB** — tight but workable for short contexts.

### Architecture implications

1. **LM Studio as local inference server** — OpenAI-compatible API at localhost. Agent dispatch code can use the same SDK for both Claude API and LM Studio, switching by model-tier.
2. **Always use constrained decoding** for structured output tasks. Never trust a local model to produce valid JSON/YAML on its own.
3. **Fallback to Claude** when local output quality is insufficient. The routing layer should have quality gates.
4. **Start with Qwen2.5-Coder-7B** — it's the safest bet. Small, fast, excellent at code, and well-supported in LM Studio.
5. **MoE models are the future** — Qwen3-Coder-30B gives near-14B quality at 3B inference cost. As MoE support matures in LM Studio, this becomes the default recommendation.

---

## Open Questions

1. **KV cache overhead for MoE models** — How much additional RAM does the KV cache for Qwen3-Coder-30B's 256K context actually consume? The 30B total param count suggests large KV, but only 3.3B are active. Need real-world measurement on 32GB Mac.
2. **MLX vs GGUF for MoE** — Is MLX better than GGUF for MoE models on Apple Silicon? The unified memory advantage might matter more for sparse activation patterns.
3. **Constrained decoding + YAML** — LM Studio documents JSON schema support. Does it also support YAML constrained decoding, or do we need to generate JSON and convert? This matters for frontmatter generation.
4. **Context window vs. quality** — At what context length does a 7B model's output quality degrade noticeably? Our 5K-30K range may be fine, but need testing.
5. **Multi-model workflows** — Can LM Studio hot-swap models fast enough for a workflow where different tasks use different models? Or should we pin one model per session?
6. **Qwen3-Coder-Next (80B MoE, 3B active)** — Claims comparable to 20x larger models. If the GGUF fits in 32GB, this could be the optimal local model. Needs testing.

---

## All Sources

### Model documentation
- [Qwen2.5-Coder Family Blog](https://qwenlm.github.io/blog/qwen2.5-coder-family/)
- [Qwen2.5-Coder Technical Report (arXiv)](https://arxiv.org/html/2409.12186v1)
- [Qwen3-Coder GitHub](https://github.com/QwenLM/Qwen3-Coder)
- [Qwen3-Coder-480B HuggingFace](https://huggingface.co/Qwen/Qwen3-Coder-480B-A35B-Instruct)
- [Qwen3-Coder-Next HuggingFace](https://huggingface.co/Qwen/Qwen3-Coder-Next)
- [Qwen3-Coder-Next Blog](https://qwen.ai/blog?id=qwen3-coder-next)
- [Qwen3-Coder Ollama](https://ollama.com/library/qwen3-coder)
- [Qwen3 Ollama](https://ollama.com/library/qwen3)
- [Qwen3.5-397B HuggingFace](https://huggingface.co/Qwen/Qwen3.5-397B-A17B)
- [Qwen3-30B-A3B HuggingFace](https://huggingface.co/Qwen/Qwen3-30B-A3B)
- [Unsloth Qwen3-Coder-Next GGUF](https://huggingface.co/unsloth/Qwen3-Coder-Next-GGUF)
- [DeepSeek-R1 GitHub](https://github.com/deepseek-ai/DeepSeek-R1)
- [DeepSeek-R1 HuggingFace](https://huggingface.co/deepseek-ai/DeepSeek-R1)
- [DeepSeek-R1-Distill-Qwen-32B HuggingFace](https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-32B)
- [DeepSeek-R1 Ollama](https://ollama.com/library/deepseek-r1)
- [Llama 4 Blog (Meta)](https://ai.meta.com/blog/llama-4-multimodal-intelligence/)
- [Llama 4 Model Page](https://www.llama.com/models/llama-4/)
- [Llama 4 Model Cards](https://www.llama.com/docs/model-cards-and-prompt-formats/llama4/)
- [Llama 4 HuggingFace Blog](https://huggingface.co/blog/llama4-release)
- [Gemma 3 Overview (Google)](https://ai.google.dev/gemma/docs/core)
- [Gemma 3 Model Card](https://ai.google.dev/gemma/docs/core/model_card_3)
- [Gemma 3-27B HuggingFace](https://huggingface.co/google/gemma-3-27b-it)
- [Gemma 3-12B HuggingFace](https://huggingface.co/google/gemma-3-12b-it)
- [Gemma 3-4B HuggingFace](https://huggingface.co/google/gemma-3-4b-it)
- [Gemma 3 HuggingFace Blog](https://huggingface.co/blog/gemma3)
- [Gemma 3 Ollama](https://ollama.com/library/gemma3)
- [Devstral 2 Announcement](https://mistral.ai/news/devstral-2-vibe-cli)
- [Devstral Small 2 HuggingFace](https://huggingface.co/mistralai/Devstral-Small-2-24B-Instruct-2512)
- [Devstral 2 HuggingFace](https://huggingface.co/mistralai/Devstral-2-123B-Instruct-2512)
- [Devstral (original) Announcement](https://mistral.ai/news/devstral)
- [Devstral Ollama](https://ollama.com/library/devstral)
- [StarCoder2 GitHub](https://github.com/bigcode-project/starcoder2)
- [StarCoder2-15B HuggingFace](https://huggingface.co/bigcode/starcoder2-15b)
- [StarCoder2 Ollama](https://ollama.com/library/starcoder2)
- [StarCoder2 arXiv](https://arxiv.org/abs/2402.19173)

### Benchmarks and comparisons
- [StructEval: Benchmarking Structural Outputs (arXiv)](https://arxiv.org/html/2505.20139v1)
- [StructEval Project Page](https://tiger-ai-lab.github.io/StructEval/)
- [LLM Quantize Analysis Benchmarks (Ionio)](https://www.ionio.ai/blog/llm-quantize-analysis)
- [GGUF Quantization Unified Comparison (arXiv)](https://arxiv.org/pdf/2601.14277)
- [Cleanlab: Structured Output Benchmarks Critique](https://cleanlab.ai/blog/structured-output-benchmark/)
- [Qwen2.5-Coder-32B Benchmarks (LLM Stats)](https://llm-stats.com/models/qwen-2.5-coder-32b-instruct)
- [Self-Hosted LLM Leaderboard (Onyx)](https://onyx.app/self-hosted-llm-leaderboard)
- [Best Open Source LLMs Feb 2026 Rankings](https://whatllm.org/blog/best-open-source-models-february-2026)

### Hardware and quantization
- [Practical GGUF Quantization Guide (Enclave AI)](https://enclaveai.app/blog/2025/11/12/practical-quantization-guide-iphone-mac-gguf/)
- [llama.cpp Apple Silicon Performance Discussion](https://github.com/ggml-org/llama.cpp/discussions/4167)
- [llama.cpp Quantization Methods Discussion](https://github.com/ggml-org/llama.cpp/discussions/2094)
- [Blind Testing Quants (llama.cpp Discussion)](https://github.com/ggml-org/llama.cpp/discussions/5962)
- [MLX vs GGUF Comparison (cho.sh)](https://cho.sh/r/E5B180)
- [MLX on Apple Silicon Guide](https://www.markus-schall.de/en/2025/09/mlx-on-apple-silicon-as-local-ki-compared-with-ollama-co/)
- [MLX Slower for Large Models (LM Studio Issue)](https://github.com/lmstudio-ai/mlx-engine/issues/101)
- [MLX Slower Than GGUF on M4 Max (LM Studio Issue)](https://github.com/lmstudio-ai/lmstudio-bug-tracker/issues/258)
- [Apple Silicon LLM Performance (Medium)](https://medium.com/@andreask_75652/thoughts-on-apple-silicon-performance-for-local-llms-3ef0a50e08bd)
- [MLX vs llama.cpp Benchmarks (Medium)](https://medium.com/@andreask_75652/benchmarking-apples-mlx-vs-llama-cpp-bbbebdc18416)
- [Best Local LLMs for Apple Silicon](https://apxml.com/posts/best-local-llm-apple-silicon-mac)
- [VRAM Calculator (Apple Silicon + Nvidia)](https://apxml.com/tools/vram-calculator)
- [Qwen3 Hardware Requirements](https://www.hardware-corner.net/guides/qwen3-hardware-requirements/)
- [Qwen3-Coder-30B RAM Guide](https://www.arsturn.com/blog/running-qwen3-coder-30b-at-full-context-memory-requirements-performance-tips)
- [Qwen3-30B-A3B Specs](https://apxml.com/models/qwen3-30b-a3b)
- [GGUF Optimization Deep Dive (Medium)](https://medium.com/@michael.hannecke/gguf-optimization-a-technical-deep-dive-for-practitioners-ce84c8987944)
- [LLM Quantization Guide (LocalLLM)](https://localllm.in/blog/quantization-explained)
- [Running LLMs Locally Introduction](https://www.hardware-corner.net/running-llms-locally-introduction/)

### LM Studio
- [LM Studio Model Catalog](https://lmstudio.ai/models)
- [LM Studio Trending Models](https://lmstudio.ai/trending/models)
- [LM Studio Structured Output Docs](https://lmstudio.ai/docs/developer/openai-compat/structured-output)
- [LM Studio TypeScript Structured Response](https://lmstudio.ai/docs/typescript/llm-prediction/structured-response)
- [LM Studio Structured Output DeepWiki](https://deepwiki.com/lmstudio-ai/docs/8.1-structured-output-and-schema-validation)
- [LM Studio Node.js Guide](https://chandanbhagat.com.np/lm-studio-structured-non-structured-output-nodejs-guide/)

### Guides and reviews
- [Best Models for LM Studio 2026 (MayhemCode)](https://www.mayhemcode.com/2026/03/best-models-for-lm-studio-llama-4-qwen3.html)
- [Best Local Coding Models 2026 (InsiderLLM)](https://www.insiderllm.com/guides/best-local-coding-models-2026/)
- [Best Local LLMs Mac 2026 (InsiderLLM)](https://insiderllm.com/guides/best-local-llms-mac-2026/)
- [Best LM Studio Models M4 Mac (divkix)](https://divkix.me/blog/lm-studio-local-ai-mac/)
- [Top 5 Local LLM Tools 2026 (DEV)](https://dev.to/lightningdev123/top-5-local-llm-tools-and-models-in-2026-1ch5)
- [Best Open Source LLMs for Coding 2026 (SiliconFlow)](https://www.siliconflow.com/articles/en/best-open-source-LLMs-for-coding)
- [15 Best Open Source AI Models 2026 (Elephas)](https://elephas.app/blog/best-open-source-ai-models)
- [Open Source LLMs Guide (Contabo)](https://contabo.com/blog/open-source-llms/)
- [Local Coding Agent with LM Studio](https://adim.in/p/local-coding-agent/)
- [LM Studio vs GPT4All Comparison](https://markaicode.com/lm-studio-vs-gpt4all-coding-comparison/)
- [Best Local LLMs Offline 2026](https://iproyal.com/blog/best-local-llms/)
- [Guide to Local LLMs 2026 (SitePoint)](https://www.sitepoint.com/definitive-guide-local-llms-2026-privacy-tools-hardware/)
- [Local AI GPU Setup Guide 2026](https://www.humai.blog/run-ai-models-locally-complete-gpu-setup-guide-2026-with-no-subscriptions/)
- [DeepSeek R1 Local Deployment Guide (SitePoint)](https://www.sitepoint.com/deepseek-r1-local-deployment-guide-2026/)
- [DeepSeek R1 Distilled Models Overview](https://www.emergentmind.com/topics/deepseek-r1-distilled-models)
- [Small Language Models Guide 2026 (BentoML)](https://www.bentoml.com/blog/the-best-open-source-small-language-models)
- [Small Language Models Complete Guide (MLMastery)](https://machinelearningmastery.com/introduction-to-small-language-models-the-complete-guide-for-2026/)
- [Best Lightweight Language Models 2026 (PremAI)](https://blog.premai.io/best-lightweight-language-models-worth-running/)
- [Best Open-Source LLMs Under 7B (MLJourney)](https://mljourney.com/best-open-source-llms-under-7b-parameters-run-locally-in-2026/)
- [Top Small Language Models 2026 (DataCamp)](https://www.datacamp.com/blog/top-small-language-models)
- [Selecting LLM for Coding on M3 (Medium)](https://medium.com/@dzianisv/selecting-the-optimal-open-source-large-language-model-for-coding-on-apple-m3-8d2ba600d8ac)
- [LLM Structured Output Formats (Medium)](https://medium.com/@michael.hannecke/beyond-json-picking-the-right-format-for-llm-pipelines-b65f15f77f7d)
- [Constrained Decoding Interactive Guide](https://mbrenndoerfer.com/writing/constrained-decoding-structured-llm-output)
- [Structured Outputs BentoML Handbook](https://bentoml.com/llm/getting-started/tool-integration/structured-outputs)
- [Compressed FSM for JSON Decoding (LMSYS)](https://lmsys.org/blog/2024-02-05-compressed-fsm/)
- [Awesome LLM JSON Resources (GitHub)](https://github.com/imaurer/awesome-llm-json)
- [Qwen 3 Coding AI Guide (UCStrategies)](https://ucstrategies.com/news/qwen-3-in-2026-the-best-free-coding-ai-with-a-catch/)
- [Qwen3-Coder-Next Guide (DEV)](https://dev.to/sienna/qwen3-coder-next-the-complete-2026-guide-to-running-powerful-ai-coding-agents-locally-1k95)
- [Llama 4 Scout vs Maverick Business Guide](https://www.digitalapplied.com/blog/llama-4-scout-maverick-business-guide-2026)
- [Llama 4 Features (DataCamp)](https://www.datacamp.com/blog/llama-4)
- [Llama 4 Launch (VentureBeat)](https://venturebeat.com/ai/metas-answer-to-deepseek-is-here-llama-4-launches-with-long-context-scout-and-maverick-models-and-2t-parameter-behemoth-on-the-way)
- [DeepSeek Models Complete Guide (BentoML)](https://www.bentoml.com/blog/the-complete-guide-to-deepseek-models-from-v3-to-r1-and-beyond)
- [DeepSeek R1 Guide (DataCamp)](https://www.datacamp.com/blog/deepseek-r1)
- [StarCoder Guide (MStonAI)](https://mstone.ai/tools-wizard/starcoder/)
- [StarCoder2 NVIDIA Blog](https://developer.nvidia.com/blog/unlock-your-llm-coding-potential-with-starcoder2/)
- [Devstral Quickstart (DataCamp)](https://www.datacamp.com/tutorial/devstral-quickstart-guide)
- [Gemma 3 128K Context (VentureBeat)](https://venturebeat.com/ai/google-unveils-open-source-gemma-3-model-with-128k-context-window)
- [Apple Sleeper Advantage Local LLMs (XDA)](https://www.xda-developers.com/apple-sleeper-advantage-local-llms/)
- [GGUF vs MLX Deep Dive (MinerAle)](https://www.mineraleyt.com/posts/gguf-vs-mlx/)
- [M4 Max LLM Discussion (MacRumors)](https://forums.macrumors.com/threads/m4-max-silicon-and-running-llms.2448348/page-3)
- [Qwen3-Coder-Next AMD Support](https://www.amd.com/en/developer/resources/technical-articles/2026/day-0-support-for-qwen3-coder-next-on-amd-instinct-gpus.html)
- [Qwen LLM Hardware Database](https://www.hardware-corner.net/llm-database/Qwen/)
- [Qwen3 How to Run (Unsloth)](https://unsloth.ai/docs/models/qwen3-how-to-run-and-fine-tune)
- [Qwen3.5 How to Run (Unsloth)](https://unsloth.ai/docs/models/qwen3.5)
- [Qwen3 Overview (Gradient Flow)](https://gradientflow.com/qwen-3/)
