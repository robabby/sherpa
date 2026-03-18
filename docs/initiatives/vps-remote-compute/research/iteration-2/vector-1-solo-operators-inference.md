# Vector 1: Solo Operators Running Inference on VPS

## Question

How do individual practitioners self-host LLMs on cheap VPS for client projects instead of paying API costs? What models? What hardware? What's the cost savings vs. API?

## Findings

### Cost Economics

Self-hosting saves $300-500/month in API costs after a $1,200-2,500 hardware investment. The break-even point is roughly 500K-1M tokens per day. Below that threshold, cloud APIs are cheaper. Above it, self-hosting wins on pure economics.

API spending on frontier models (GPT-4o, Claude) can reach $5,000/month at scale. A one-time hardware investment of $2,500 pays for itself in under 5 months, with ongoing costs limited to electricity ($30-100/month) for local hardware, or $5-40/month for VPS.

Source: [Self-Hosted LLM Guide (2026)](https://blog.premai.io/self-hosted-llm-guide-setup-tools-cost-comparison-2026/)

### Budget VPS Setups (Real Examples)

**$2.49/month (RackNerd):** 3 vCPU, 3.5 GB RAM, 60 GB SSD. Runs TinyLlama 1.1B with 4-bit quantization. Response quality is limited -- this is a proof-of-concept, not a production setup. CPU maxes out during inference. "Pretty sprightly" for a 1.1B model but not comparable to ChatGPT or Claude quality.

Source: [LowEndBox: Run AI LLM on a LowEnd VPS for $2.49/month](https://lowendbox.com/blog/run-your-own-ai-llm-model-on-a-lowend-vps-for-only-2-49-a-month-part-one-ollama-and-the-model/)

**EUR 25/month (Hetzner AMD EPYC):** 8 CPU cores, 15 GB RAM. Runs Metharme 7B Q4 with ~25-30 second response times on CPU. Viable for "a few requests per second" maximum. CPU usage maxes out during generation.

Source: [Self-hosting an AI chatbot without going broke](https://blog.kronis.dev/blog/self-hosting-an-ai-llm-chatbot-without-going-broke)

**EUR 15/month (Hetzner CPX41):** Recommended as the "sweet spot" for running Llama 3.2 8B -- fast enough for real use, cheap enough to leave running 24/7.

Source: [Best VPS for Ollama 2026](https://1vps.com/best-vps-for-ollama/)

### Inference Engines

**Ollama** dominates the self-hosted space with 105,000+ GitHub stars. It's the "Docker for LLMs" -- one command pulls and runs models, bundles llama.cpp under the hood, handles quantization automatically, exposes an OpenAI-compatible API.

**vLLM** is engineered for throughput: PagedAttention reduces memory fragmentation by 40%+. Benchmarks show vLLM at 793 TPS vs Ollama's 41 TPS -- a 19x difference at scale. But vLLM requires NVIDIA GPUs with CUDA, making it unsuitable for CPU-only VPS.

Source: [Ollama vs vLLM comparison](https://www.glukhov.org/post/2025/11/hosting-llms-ollama-localai-jan-lmstudio-vllm-comparison/)

### The Privacy/Compliance Value Proposition

This is the real story for consultants. Cost savings are marginal for low-volume users, but compliance is binary -- either you can send client data to third-party APIs or you can't.

**Legal sector:** Attorneys analyzing "attorney's eyes only documents" where protective orders prohibit shipping files to third-party APIs. Self-hosting is the only option.

**Corporate compliance:** Employers with policies prohibiting third-party LLM usage. One HN commenter runs Mistral Large on 2xA6000 GPUs as a compliant alternative.

**Healthcare/financial:** 44% of organizations cite data privacy and security as the top barrier to LLM adoption. Self-hosting eliminates the primary objection.

Source: [HN: Self-hosted LLM use cases](https://news.ycombinator.com/item?id=41856567)

### Self-Hosted LLM Stacks in Practice (HN Survey, 2025)

Real stacks from the "What Does Your Self-Hosted LLM Stack Look Like in 2025?" thread:

- **Hardware:** 2x RTX 3090s, 2x RTX 4090s, M3 Max (36GB), Mac mini (24GB)
- **Software:** Ollama (dominant), vLLM for testing, Open Web UI for chat interface, Continue plugin for VSCode coding
- **Models:** Llama 3.1 70B, Qwen 32B, Gemma 3 27B, CodeQwen 7B for coding, Devstral for coding
- **Pattern:** Hybrid approach -- cloud APIs (Claude, GPT-4) for complex reasoning, self-hosted smaller models for repetitive domain-specific tasks

Source: [HN: Self-Hosted LLM Stack 2025](https://news.ycombinator.com/item?id=44187275)

### Models Commonly Used on VPS

| Model | Size | Quantized RAM | Use Case |
|-------|------|--------------|----------|
| TinyLlama 1.1B | 1.1B | ~1 GB | Budget VPS toy projects |
| Phi-3-mini | 3.8B | ~2.5 GB | 4 GB VPS baseline |
| Llama 3.2 3B | 3B | ~2 GB | Fast responses, simple tasks |
| Llama 3.2 8B | 8B | ~5-6 GB | General-purpose sweet spot |
| Mistral 7B | 7B | ~5 GB | Summarization, classification |
| DeepSeek-R1 7B | 7B | ~5 GB | Reasoning, structured output |
| Qwen 2.5 7B | 7B | ~5 GB | Tool calling, agent tasks |
| Llama 3.1 70B | 70B | ~40 GB | Requires multi-GPU, near-frontier quality |

## Key Takeaway

The economics of self-hosting on VPS favor two use cases: (1) sustained high-volume workloads where API costs are painful, and (2) compliance-gated work where self-hosting is the only option. For occasional use, cloud APIs remain cheaper and faster to deploy. The consulting opportunity is primarily in category (2) -- positioning self-hosted infrastructure as a compliance solution that commands premium pricing.
