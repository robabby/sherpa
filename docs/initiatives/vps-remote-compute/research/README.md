# VPS Remote Compute — Research

## Iteration 1 (2026-03-16): Provider Evaluation

Surveyed the full VPS landscape across 5 vectors. Key finding: Hetzner CX23 at ~$5/mo is the best value for baseline infrastructure (dispatch workers + MCP server + 3B inference). No viable always-free tier exists. Tailscale confirmed for networking. GPU on-demand (RunPod, AWS, GCP) is affordable for client billing.

## Iteration 2 (2026-03-16/17): Market Landscape — Who Uses VPS for AI?

9 vectors across 8 segments: solo consultants, agencies, freelancers, workflow automation, micro-SaaS, GPU economics, security/red teams, enterprise DevOps, researchers/educators/homelabs. 60+ sources.

**Universal stack:** Ollama + Docker Compose + Tailscale/VPN appears in every segment. Sherpa differentiates with MCP server + behavioral agents + quality gates.

**Three cross-cutting insights:** (1) Privacy is the #1 value prop across all segments — lead with it. (2) Ollama is dev, vLLM is production — design for swappability. (3) MCP is the convergence layer everywhere.

**Consulting economics validated:** $5-40/mo infrastructure, $300-8,000/mo client billing, 73-90% margins documented.

## Open Questions

1. **n8n integration** — Should Sherpa integrate with or replace n8n?
2. **vLLM upgrade path** — Docker Compose swap from Ollama to vLLM
3. **Compliance positioning** — GDPR, HIPAA, SOC 2 documentation for client proposals
4. **Exact Docker Compose** — Ollama + Sherpa MCP + Tailscale sidecars
5. **Dispatch adaptation** — Minimal changes to worker.sh and resolve-route.mjs
6. **Model selection** — Best 7B model for Sherpa's dispatch task types
7. **RAM tier decision** — 4 GB (3B models) vs 8 GB (7B models) for baseline
