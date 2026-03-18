# Vector 1: Free Tier Kings

**Question:** Which VPS providers offer always-free tiers suitable for running Docker containers, a Node.js MCP server, and lightweight dispatch workers?
**Agent dispatched:** 2026-03-16

> **Note (2026-03-16):** Oracle Cloud has been excluded from consideration on values grounds. Their free tier data is preserved below for research completeness but Oracle is not a viable option for Sherpa.

## Findings

### Tier 1: Truly Always-Free

#### ~~Oracle Cloud Infrastructure (OCI)~~ — EXCLUDED

Oracle Cloud has been excluded from all Sherpa recommendations. See note above. Their free tier (4 OCPU ARM / 24 GB RAM / $0) was the strongest on paper but is not an option we will use or recommend.

#### Google Cloud Platform (GCP)

| Resource | Limit |
|----------|-------|
| VM | 1x e2-micro (2 shared vCPU, 1 GB RAM) |
| Storage | 30 GB standard persistent disk |
| Outbound Bandwidth | 1 GB/month (North America only) |

**Verdict:** Too small. 1 GB RAM barely runs a single Node.js container. 1 GB/month egress is a dealbreaker. Better as supplement (Cloud Run for serverless endpoints).

### Tier 2: Time-Limited Free (12 months)

- **AWS** — t2.micro (1 vCPU, 1 GB RAM), 750 hrs/month. As of July 2025, replaced with $200 credit system. Not always-free.
- **Azure** — B1s (1 vCPU, 1 GB RAM), 750 hrs/month. 12-month only. Too small anyway.

### Tier 3: PaaS Free Tiers

- **Fly.io** — Free tier eliminated for new signups (2024). Not viable.
- **Railway** — No always-free tier. $5/month minimum after 30-day trial.
- **Render** — Free instances auto-sleep after 15 min inactivity. Not suitable for always-on MCP.

### Tier 4: Ultra-Cheap Paid ($3-5/month fallback)

| Provider | Plan | vCPU | RAM | Storage | Bandwidth | Price |
|----------|------|------|-----|---------|-----------|-------|
| Hetzner | CAX11 (ARM) | 2 | 4 GB | 40 GB NVMe | 20 TB | EUR 3.79/mo (~$4.10) |
| Contabo | Cloud VPS S | 4 | 6 GB | 100 GB NVMe | 32 TB | EUR 4.50/mo (~$4.90) |
| Netcup | VPS nano G11s | 2 | 2 GB | 64 GB SSD | 80 TB | EUR 3.35/mo (~$3.60) |

## Sources

- https://docs.cloud.google.com/free/docs/free-cloud-features — GCP free tier docs
- https://aws.amazon.com/free/free-tier-faqs/ — AWS free tier FAQ
- https://cloudwithalon.com/aws-free-tier-2025-whats-free-and-for-how-long — AWS free tier 2025 changes
- https://azure.microsoft.com/en-us/pricing/free-services — Azure free services
- https://fly.io/pricing/ — Fly.io pricing
- https://docs.railway.com/pricing/plans — Railway pricing
- https://render.com/blog/free-tier — Render free tier
- https://costgoat.com/pricing/hetzner — Hetzner pricing comparison
- https://contabo.com/en-us/pricing/ — Contabo pricing
- https://sliplane.io/blog/top-5-cheap-vps-providers — Cheap VPS comparison

## Implications

No viable always-free tier exists for our workloads (with Oracle excluded). GCP is too small, AWS/Azure expire, PaaS tiers are dead or sleep-based. The practical floor is Hetzner CAX11 ARM at ~$4/mo — 2 vCPU, 4 GB RAM, enough for dispatch workers + MCP server + 3B model inference.

## Open Questions

- Is 4 GB RAM (Hetzner CAX11) sufficient for baseline, or should we target 8 GB for 7B capability?
- What's the upgrade path from CAX11 to a larger instance without downtime?
