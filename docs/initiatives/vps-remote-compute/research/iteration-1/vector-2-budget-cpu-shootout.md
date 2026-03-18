# Vector 2: Budget CPU Shootout

**Question:** For VPS providers without free tiers, what's the cheapest useful CPU-only VPS for Docker Compose with 2-3 containers?
**Agent dispatched:** 2026-03-16

## Findings

### Ranked by Price (2 vCPU minimum, >= 2 GB RAM)

| Rank | Provider | Plan | vCPU | RAM | Storage | Bandwidth | Price | Notes |
|------|----------|------|------|-----|---------|-----------|-------|-------|
| 1 | Hetzner | CX23 (EU) | 2 | 4 GB | 40 GB NVMe | 20 TB | EUR 3.99/mo (~$5) | Post-April 2026 price |
| 2 | IONOS | VPS S | 2 | 2 GB | 80 GB NVMe | Unlimited | $4/mo | Cheapest 2-vCPU option |
| 3 | Hetzner | CAX11 ARM (EU) | 2 | 4 GB | 40 GB NVMe | 20 TB | EUR 4.49/mo | Post-April 2026 |
| 4 | Netcup | VPS 500 G12 | 2 | 4 GB DDR5 | 128 GB NVMe | Unlimited | ~$4.50/mo | 12-month commitment |
| 5 | Contabo | Cloud VPS 10 | 4 | 8 GB | 75 GB NVMe | Unlimited | ~$4.95/mo | Oversold, 200 Mbit cap |
| 6 | IONOS | VPS M | 2 | 4 GB | 80 GB NVMe | Unlimited | $6/mo | Best US option (Las Vegas) |
| 7 | Hetzner | CPX11 (US) | 2 | 2 GB | 40 GB NVMe | 1 TB | $6.99/mo | Hillsboro OR |

### Providers That Failed the Budget Test

| Provider | Cheapest 2GB+ | Price | Why Eliminated |
|----------|---------------|-------|----------------|
| Vultr | 1 vCPU / 2 GB | $10/mo | Only 1 vCPU at 2 GB. 2 vCPU = $20/mo |
| Digital Ocean | 1 vCPU / 2 GB | $12/mo | Only 1 vCPU. 2 vCPU = $24/mo |
| Linode/Akamai | 1 vCPU / 2 GB | $12/mo | Only 1 vCPU. 2 vCPU = $24/mo |
| BuyVM | 1 vCPU / 2 GB | $7/mo | Only 1 vCPU. Frequently out of stock |

### RackNerd — Ultra-Budget Honorable Mention

1 vCPU / 2 GB / 40 GB at $16.98/year (~$1.42/mo). Annual billing only. SolusVM-only management. Fails 2 vCPU minimum but cheapest absolute price for a Docker-capable VPS.

### Provider Details

**Hetzner (Top Pick EU):**
- April 2026 price increase: 25-35% across the board
- Excellent API, official Terraform provider, CLI (`hcloud`)
- EU: Nuremberg, Falkenstein, Helsinki. US: Ashburn, Hillsboro
- US locations have lower bandwidth caps (1 TB vs 20 TB EU)
- $20 free credit via referral for new accounts

**IONOS (Top Pick US):**
- Las Vegas NV, Newark NJ, Lenexa KS + EU locations
- 99.99% uptime SLA
- Full REST Cloud API
- $200 free cloud credit (30-day expiry) for new accounts

**Contabo (Best Paper Specs):**
- Seattle DC available (US West!)
- 4 vCPU / 8 GB at ~$5/mo is unmatched on paper
- BUT: well-documented CPU overselling, I/O throttling, 200 Mbit/s network cap
- Chatbot-only support

**Netcup (Solid EU Value):**
- DDR5 ECC RAM is unique at this price point
- US: Manassas VA only (no West Coast)
- Limited API compared to Hetzner
- Frequent coupon codes (EUR 6-30 off)

## Sources

- https://www.hetzner.com/cloud — Hetzner Cloud pricing
- https://pricetimeline.com/news/211 — Hetzner April 2026 price increase
- https://costgoat.com/pricing/hetzner — Hetzner pricing calculator
- https://betterstack.com/community/guides/web-servers/hetzner-cloud-review/ — Hetzner review
- https://www.ionos.com/servers/vps — IONOS VPS pricing
- https://www.vpsbenchmarks.com/compare/ionos — IONOS benchmarks
- https://api.ionos.com/docs/cloud/v6/ — IONOS API docs
- https://contabo.com/en/vps-server/ — Contabo pricing
- https://www.experte.com/server/contabo — Contabo review
- https://www.netcup.com/en/server/vps — Netcup pricing
- https://www.vpsbenchmarks.com/hosters/netcup — Netcup benchmarks
- https://www.vultr.com/pricing/ — Vultr pricing
- https://www.linode.com/pricing/ — Linode pricing
- https://www.digitalocean.com/pricing/droplets — DigitalOcean pricing
- https://buyvm.net/kvm-dedicated-server-slices/ — BuyVM pricing
- https://www.racknerd.com/ — RackNerd pricing

## Implications

Hetzner CX23 (EU) at ~$5/mo is the clear winner for a paid fallback — 2 vCPU, 4 GB RAM, 40 GB NVMe, 20 TB bandwidth, world-class API. IONOS VPS M at $6/mo is best if US West is needed (Las Vegas). The "big name" providers (DO, Vultr, Linode) are 2-4x more expensive for equivalent specs.

## Open Questions

- Is Hetzner's EU location acceptable for latency to US West Coast Mac?
- Does IONOS's Las Vegas DC perform well in benchmarks?
- Is Contabo's overselling bad enough to rule it out, or acceptable for batch workloads?
