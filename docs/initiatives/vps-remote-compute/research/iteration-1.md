# Iteration 1 — 2026-03-16

## Findings

### Vector 1: Free Tier Kings
**Question:** Which VPS providers offer always-free tiers for Docker workloads?
**Full report:** [iteration-1/vector-1-free-tier-kings.md](iteration-1/vector-1-free-tier-kings.md)

- GCP e2-micro (1 GB RAM, 1 GB/mo egress) is too small for Docker Compose
- AWS/Azure free tiers expire after 12 months — not viable long-term
- Fly.io, Railway, Render free tiers are dead, expensive, or sleep-based
- Ultra-cheap paid tier (Hetzner CAX11 ARM at ~$4/mo, Contabo at ~$5/mo) is the practical floor

**Implications:** No viable always-free tier exists for our workloads. The practical baseline is Hetzner CAX11 ARM at ~$4/mo (2 vCPU, 4 GB RAM) — enough for dispatch workers + MCP server, limited to 3B models for inference.

### Vector 2: Budget CPU Shootout
**Question:** Cheapest paid VPS with 2+ vCPU and Docker support?
**Full report:** [iteration-1/vector-2-budget-cpu-shootout.md](iteration-1/vector-2-budget-cpu-shootout.md)

- Hetzner CX23 (EU): 2 vCPU / 4 GB / 40 GB NVMe at EUR 3.99/mo (~$5) — best overall value
- IONOS VPS S: 2 vCPU / 2 GB / 80 GB at $4/mo — cheapest 2-vCPU, US locations
- Contabo: 4 vCPU / 8 GB at ~$5/mo — great paper specs, well-documented overselling
- DO, Vultr, Linode are 2-4x more expensive for equivalent specs ($10-24/mo for 2 GB)

**Implications:** Hetzner (EU) or IONOS (US) at $4-6/mo as paid fallback. The "developer-friendly" providers (DO, Vultr) are poor value for budget workloads.

### Vector 3: GPU On-Demand Pricing
**Question:** Cost of GPU instances for 9B+ model inference, billed to clients?
**Full report:** [iteration-1/vector-3-gpu-on-demand-pricing.md](iteration-1/vector-3-gpu-on-demand-pricing.md)

- Minimum GPU for 9B: NVIDIA T4 (16 GB VRAM). Recommended: 24 GB (A10, RTX 3090)
- Cheapest: Vast.ai A10 at $0.09/hr, RunPod RTX 3090 at $0.22/hr
- Enterprise-safe: AWS g5 spot at $0.46/hr, GCP L4 spot at $0.22/hr
- Hetzner GEX44: RTX 4000 Ada at EUR 184/mo — best for sustained multi-week engagements
- All viable providers have API for programmatic spin-up/teardown

**Implications:** GPU inference is cheap enough to be a profitable consulting line item. At $0.22/hr cost, billing at $1-2/hr is reasonable. RunPod for cost, AWS/GCP for enterprise invoices.

### Vector 4: Tailscale + VPS Networking
**Question:** How well does Tailscale work with VPS and Docker?
**Full report:** [iteration-1/vector-4-tailscale-vpn-networking.md](iteration-1/vector-4-tailscale-vpn-networking.md)

- Free tier: 3 users, 100 devices, includes MagicDNS — more than sufficient
- Docker sidecar pattern works: one `tailscale/tailscale` container per service, ~20 MB RAM each
- MagicDNS provides `http://inference:1234` from local Mac — exactly what we need
- Hetzner needs 1 firewall rule — simplest provider setup.
- Performance: 1-3ms overhead, irrelevant for inference (2-30s per request)
- Cloudflare Tunnel eliminated (decrypts at edge). Tailscale > Netbird > WireGuard > ZeroTier.

**Implications:** Tailscale is confirmed. Zero ports exposed, free, MagicDNS for service discovery, negligible overhead.

### Vector 5: Agentic Workload Patterns
**Question:** Real-world Docker patterns for LLM inference + workers on VPS?
**Full report:** [iteration-1/vector-5-agentic-workload-patterns.md](iteration-1/vector-5-agentic-workload-patterns.md)

- Ollama for simplicity, llama-server for CPU tuning — same OpenAI-compatible API
- 7B Q4_K_M needs ~5.2-6.4 GB RAM total (model + KV cache + OS + services)
- 4 GB VPS = 3B models only. 8 GB = tight for 7B. 16-24 GB = comfortable
- LM Studio can run headless but Ollama is better for Docker/VPS (open-source, official image)
- Dokploy (350 MB overhead) or raw Docker Compose + systemd for deployment management
- CPU inference speed: 1-2 tok/s (2 vCPU) to 5-10 tok/s (8+ cores)

**Implications:** The stack is proven. Ollama + Docker Compose + Tailscale is a well-trodden path. For 7B inference, an 8+ GB VPS is needed ($15-40/mo range). Budget 4 GB instances handle 3B models and dispatch/MCP workloads.

## Synthesis

**The clear architecture emerges across all five vectors:**

### Primary Stack (~$5/month)

Hetzner CX23 (EU, 2 vCPU / 4 GB) or IONOS VPS M (US, 2 vCPU / 4 GB / $6) + Tailscale + Docker Compose + Ollama.

- **Affordable** — $5-6/mo for always-on infrastructure
- **Secure** — Tailscale mesh VPN, zero public ports, WireGuard encryption
- **Capable** — Adequate for dispatch workers + MCP server + 3B model inference
- **Discoverable** — MagicDNS: `http://inference:11434` from local Mac, no IP management

Limited to 3B models (Phi-3-mini, Llama 3.2 3B) due to 4 GB RAM. For 7B inference, step up to Hetzner CX33 (8 GB, ~$10/mo) or equivalent.

### Mid-Tier Stack ($15-40/month)

Hetzner CX33/CX43 (8-16 GB RAM) or equivalent. Same Tailscale + Docker Compose architecture, but enough RAM for 7B Q4_K_M inference with headroom.

### Client GPU Tier (billable, on-demand)

RunPod RTX 3090 at $0.22/hr for cost-optimized engagements. AWS/GCP for enterprise clients who want a recognizable brand on the invoice. Hetzner GEX44 at EUR 184/mo for multi-week sustained use. All API-provisionable.

### The Key Cross-Cutting Insight

**The LM Studio URL abstraction already exists.** The `LM_STUDIO_URL` env var in the codebase (used in 3 files) was designed for exactly this transition. Changing it from `http://localhost:1234` to `http://inference:11434` (Tailscale MagicDNS → Ollama on VPS) is the entire integration surface for inference. The dispatch scripts, MCP server, and API backends all read this variable.

The harder integration is CLI backends (claude, opencode, codex, gemini) — these shell out to locally-installed tools and have no remote execution path. But these call cloud APIs anyway, so they can run from either local or VPS. The real value of VPS is: (1) always-on inference, (2) always-on MCP server, (3) overnight batch dispatch without keeping the laptop awake.

## Proposals Generated

Updated `docs/initiatives/vps-remote-compute/proposal.md` with two-tier cost model, Tailscale recommendation, and resolved open questions.

## Open Questions for Next Iteration

1. **Docker Compose for Sherpa** — What's the exact docker-compose.yml? Ollama + Sherpa MCP + Tailscale sidecars + model preloading.
2. **Dispatch adaptation** — How exactly do worker.sh and resolve-route.mjs change to support remote inference? What's the minimal changeset?
3. **Monitoring and health** — How do we surface VPS/service health in Studio UI? Prometheus + Grafana or lighter-weight?
4. **Model selection** — Which 7B model is best for Sherpa's dispatch tasks (code review, research, content generation)?
5. **RAM tier decision** — Is 4 GB (3B models only) sufficient for Sherpa's baseline, or should we invest in 8 GB for 7B capability?
