# Vector 2: Enterprise DevOps and Platform Engineering

**Question:** How do enterprise teams use VPS/cloud to run AI agents, inference, and autonomous systems?
**Agent dispatched:** 2026-03-17

## Findings

### Private LLM Inference at Scale

**vLLM is the production standard.** 793 TPS vs Ollama's 41 TPS — 19x difference. HuggingFace TGI entered maintenance mode Dec 2025, now recommends vLLM or SGLang. Ollama is "Docker for LLMs" but not production-grade for multi-user serving.

**Why teams self-host:**
- 44% cite data privacy as top barrier to LLM adoption (Kong 2025)
- GDPR, HIPAA, PCI, SOC 2, air-gapped environments
- API cost escalation: one team saw $15k → $35k → $60k over three months
- Telemedicine client: $48k → $32k/mo (33% reduction) by self-hosting chat triage

**Infrastructure specs:**
- 7B model: 1x A100, ~14GB GPU RAM
- 70B model: 2x A100-80GB
- 405B model: 8x H100, $20-30k/month including personnel

### Self-Hosted Coding Assistants

**Tabby** (32.2k stars, Rust) — Most mature Copilot alternative. GPU or CPU, enterprise SSO, team analytics, audit logging.

**Continue.dev** (20k+ stars) — Model-agnostic, supports Ollama. Now includes MCP tools. One team: qwen2.5-coder on dev laptops → 37% faster onboarding, 22% less debugging, zero code egress.

**Air-gapped requirements:** 32-72 CPU cores, 72-256GB RAM, 1-4x A100s for ~1,000 users. Tabnine Enterprise provides ITAR/CMMC for defense.

### AI Coding Agents on VPS

**OpenHands** (formerly OpenDevin) — Most mature. Docker or Kubernetes (Helm charts). GitHub/GitLab/Slack integration. Scales to thousands of parallel agents.

**SWE-agent** (Princeton/Stanford) — Sandboxed Docker containers. Used by Meta, NVIDIA, IBM.

**Hermes Agent** (Nous Research, Feb 2026) — Designed explicitly for $5/month VPS. <500MB memory. 40+ tools. Persistent memory across sessions. Multi-platform (Telegram, Discord, Slack, WhatsApp). One-line install.

### IT Automation

- 51% of organizations already deployed AI agents (2025)
- MTTR reduced 30-50% with AI incident management
- But 69% of AI decisions still require human verification ("verification tax")
- **RunbookAI** — Open-source incident response. Hypothesis-driven investigation. Human approval required for mutations.
- **kagent** — Kubernetes-native AI framework with kubectl wrappers + Prometheus connectors.
- **Google Agent Sandbox** — New K8s SIG Apps subproject. WarmPools for sub-second cold start.

### Cost Break-Even: Self-Hosted vs API

| Model Size | Hardware | Break-Even vs Premium API | Break-Even vs Budget API |
|------------|----------|--------------------------|-------------------------|
| Small (24-32B) | ~$2k (1x RTX 5090) | 0.3-3 months | 12-36 months |
| Medium (70-120B) | $15-30k (2x A100) | 3.8-6 months | 12-34 months |
| Large (235B-1T) | $60-240k (4-16x A100) | 3.5-7 months | 35-69 months |

**Decision threshold:** Below 10M tokens/day → APIs cheaper. 10-50M → medium models justify self-hosting. 100M+ → self-hosting wins. **Hidden cost multiplier: 1.3-2.0x** (DevOps time, infra overhead).

**Recommended pattern:** Self-host simple tasks (7B-13B, 90% of volume), route complex work to APIs.

### AI Gateways (Self-Hosted)

| Gateway | RPS | P99 Latency |
|---------|-----|-------------|
| Kong AI Gateway | 23,264 | 10.94ms |
| Portkey OSS | 10,197 | 30.35ms |
| LiteLLM | 2,706 | 85.60ms |

LiteLLM is most popular but has operational challenges at scale (800+ open issues, DB logging bottleneck after 1M logs).

### Document Processing

- IDP market: $10.57B (2025) → $91B by 2034
- **llmware** — 300+ models including 50+ fine-tuned SLIM models. Runs on CPU.
- Fine-tuned 14B on A40: processes 1M docs for ~$7,400 vs $42,500 for GPT-5 (6x savings)

## Sources

- https://blog.premai.io/private-llm-deployment-a-practical-guide-for-enterprise-teams-2026/
- https://blog.premai.io/llm-inference-servers-compared-vllm-vs-tgi-vs-sglang-vs-triton-2026/
- https://www.tabbyml.com/ — Tabby
- https://github.com/TabbyML/tabby
- https://intuitionlabs.ai/articles/enterprise-ai-code-assistants-air-gapped-environments
- https://github.com/OpenHands/OpenHands
- https://nousresearch.com/hermes-agent/ — Hermes Agent
- https://github.com/NousResearch/hermes-agent
- https://github.com/Runbook-Agent/RunbookAI
- https://arxiv.org/html/2509.18101v1 — Break-even analysis
- https://konghq.com/blog/engineering/ai-gateway-benchmark-kong-ai-gateway-portkey-litellm
- https://github.com/llmware-ai/llmware

## Implications

Enterprise patterns confirm the hybrid model: self-host high-volume simple tasks, route complex work to APIs. The break-even data is critical for Sherpa's consulting pricing — we can show clients exactly when self-hosting pays off. The coding assistant segment (Tabby, Continue.dev) is directly relevant: Sherpa could offer "private AI coding infrastructure" as a consulting deliverable. Hermes Agent's $5/month VPS design validates our Hetzner baseline architecture.

**Key for client-deployment-pipeline:** The enterprise air-gapped pattern (32+ cores, 72+ GB RAM, A100s) represents the Enterprise tier. Sherpa should document hardware requirements per tier clearly.
