# Vector 3: Researchers, Creators, Educators, and Homelabs

**Question:** How do academics, data scientists, content creators, educators, and hobbyists use VPS for AI?
**Agent dispatched:** 2026-03-17

## Findings

### Academic Researchers

GPU cloud providers dominate over traditional VPS:
- **Lambda Labs** — 50% academic discount + $5k research grants. All top 10 US universities. A100 80GB at $1.29/hr (vs $1.54-1.64 on hyperscalers). Zero egress fees.
- **RunPod** — 1-minute billing, multi-node InfiniBand clusters for distributed training.
- **Vast.ai** — Decentralized marketplace. A100 80GB from $0.70/hr. Inconsistent uptime.
- **Paperspace** — Frozen new signups as of Q1 2026 (acquired by DigitalOcean).

**University GPU provisioning:** AWS SageMaker at ~$50-60/student/semester. Dedicated IAM roles, bootstrap scripts, automated termination.

### Data Scientists

**MLflow on VPS** is the standard for small-team experiment tracking. SQLite + local files for solo; PostgreSQL for teams. No native RBAC.

**W&B self-hosted** via Docker, but production requires license from W&B. Significant IT burden.

**Cost break-even for inference:** Self-hosting becomes cost-effective at ~2M tokens/day. Below that, APIs are cheaper. One fintech: $47k → $8k/month (83% reduction) with hybrid self-hosted.

**Serving hierarchy:** Ollama (dev, ~41 TPS) → vLLM (production, ~793 TPS). At 128 concurrent users, vLLM maintains sub-100ms P99 while Ollama spikes to 673ms.

### Content Creators

Two patterns:
1. **ComfyUI on RunPod Serverless** — Node-based Stable Diffusion/Flux workflows. Any ComfyUI workflow → production API in ~20 minutes. Thumbnail A/B testing (20-35% CTR increases). Pay only for compute.
2. **n8n + Ollama on VPS** — Content automation pipelines: keyword research, writing, editing, social posting. Flat-rate VPS eliminates per-token API charges. n8n Self-hosted AI Starter Kit: 14.4k GitHub stars.

### Educators

Two patterns by scale:
- **University (100+ students):** JupyterHub on Kubernetes. Berkeley DataHub serves 1,500+ students. Cost: $260-683/month for 100 students. Autoscaling reduces off-hours costs.
- **Bootcamp (10-30 students):** Ollama + JupyterLab Docker template. Models pre-configured to download on startup.

### Homelabs (r/LocalLLaMA: 266,500+ members)

**Standard stack:** Ollama + Open WebUI. Extended: + n8n + Qdrant + Whisper.

**Hardware patterns:**
| Setup | Cost | Capability |
|-------|------|------------|
| $200 mini PC (16GB) | $200 | 7B models via Ollama |
| Used office PC (32GB) | ~$300 | 7B-13B comfortably |
| RTX 4060 Ti 16GB | ~$500 GPU | 13B at 4-bit, 20-35 tok/s |
| RTX 4090 24GB | ~$1,800 GPU | 70B at 4-bit, 7-9 tok/s |

**Budget VPS:** LowEndBox guide — TinyLlama on RackNerd at $2.49/month. Hetzner CAX11 at $4/month runs 7B.

**Remote access:** Tailscale is the standard. Magic DNS, no port forwarding.

**Privacy is #1 motivation** for self-hosting in the community.

### Open-Source Maintainers

**Dominant pattern: GitHub Actions** (not VPS):
- **CodeRabbit** — Free for open source, auto-reviews every PR
- **PR-Agent** (Qodo) — Open-source, self-hostable via Docker
- **GitHub Agentic Workflows** (Feb 2026) — Plain Markdown workflows. Claude Code, OpenAI Codex as engines. Adopted by Home Assistant, CNCF.

**Self-hosted options for privacy:** Kody, All-hands.dev/Cline with local Ollama, SWE-agent 2.0.

## Sources

- https://lambda.ai/research — Lambda Labs academic program
- https://github.com/n8n-io/self-hosted-ai-starter-kit — n8n AI Starter Kit (14.4k stars)
- https://www.runpod.io/articles/guides/comfy-ui-flux — ComfyUI on RunPod
- https://cdss.berkeley.edu/datahub-students — Berkeley DataHub
- https://arxiv.org/html/2509.13703v1 — GPU programming course on AWS
- https://www.xda-developers.com/ran-ollama-open-webui-on-200-mini-pc-local-ai-stack-actually-works/ — $200 mini PC AI
- https://lowendbox.com/blog/run-your-own-ai-llm-model-on-a-lowend-vps-for-only-2-49-a-month-part-one-ollama-and-the-model/ — $2.49 VPS AI
- https://tailscale.com/blog/self-host-a-local-ai-stack — Tailscale + Ollama homelab
- https://www.aitooldiscovery.com/guides/local-llm-reddit — r/LocalLLaMA community analysis
- https://github.blog/ai-and-ml/automate-repository-tasks-with-github-agentic-workflows/ — GitHub Agentic Workflows
- https://github.com/qodo-ai/pr-agent — PR-Agent
- https://github.com/githubnext/awesome-continuous-ai — AI-powered GitHub Actions list

## Implications

The homelab community (266k+ members) validates that Ollama + Open WebUI + Tailscale is the canonical self-hosted AI stack. This is exactly what Sherpa is deploying. The educator pattern (JupyterHub for scale, Docker template for small cohorts) maps to Sherpa's tier model. Content creators demonstrate n8n as the workflow automation layer — worth evaluating alongside Sherpa's dispatch system.

**Key insight:** Privacy is the #1 motivation across ALL segments (homelabs, enterprise, security, academics). Sherpa's "your data stays yours" positioning is validated by every community researched.
