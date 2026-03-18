# Vector 6: GPU Cloud Provider Economics

## Question

What are the real costs for GPU inference across providers, and how do they map to consulting business models?

## Findings

### GPU Cloud Pricing Comparison (March 2026)

| Provider | A100 40GB | A100 80GB | H100 80GB | RTX 4090 | Notes |
|----------|----------|----------|----------|----------|-------|
| **Vast.ai** | $0.50-0.70/hr | $0.60-0.80/hr | From $1.77/hr | ~$0.25/hr | Peer-to-peer marketplace, cheapest but variable reliability |
| **RunPod Community** | $1.19/hr | -- | $2.79/hr | $0.34/hr | Sub-minute spin-up, per-second billing |
| **RunPod Serverless** | -- | $2.17/hr | -- | -- | Pay per inference, no idle costs |
| **Northflank** | $1.42/hr | $1.76/hr | $2.74/hr | -- | Automated spot orchestration, production-grade |
| **Lambda Labs** | $1.29/hr | $1.79/hr | $2.99/hr | -- | Limited availability, strong when available |
| **TensorDock** | $1.63/hr | -- | $2.25/hr | -- | Brokered marketplace with reputation system |
| **Paperspace** | $3.09/hr | $3.18/hr | $5.95/hr | -- | Good for researchers and solo devs |
| **Hetzner (dedicated)** | -- | -- | -- | RTX 4000 Ada: EUR 184/mo | Best for sustained multi-week use |
| **AWS** | ~$4/hr/GPU | ~$5/hr/GPU | ~$6.88/hr/GPU | -- | Enterprise invoices, 8x GPU instances |
| **GCP** | ~$3.50/hr | -- | -- | L4: $0.22/hr (spot) | Spot pricing competitive |

Source: [7 cheapest cloud GPU providers in 2026](https://northflank.com/blog/cheapest-cloud-gpu-providers)

### What GPU Do You Actually Need?

For inference on 7B-13B models, you don't need an H100. The practical options:

| Model Size | Minimum GPU | Recommended GPU | Cost Range |
|-----------|------------|----------------|-----------|
| 3B (quantized) | CPU only | Any VPS with 4+ GB RAM | $4-10/mo |
| 7B (Q4) | T4 (16 GB VRAM) | RTX 3090/4090 (24 GB) | $0.22-0.34/hr |
| 13B (Q4) | RTX 3090 (24 GB) | A10 (24 GB) | $0.09-0.34/hr |
| 70B (Q4) | 2x RTX 3090 | A100 40GB | $0.50-1.42/hr |

"For 7B inference, an RTX 4090 or A10 handles most inference workloads fine rather than renting an H100."

Source: [Best GPU VPS 2026](https://1vps.com/best-gpu-vps/)

### Cost Rule of Thumb

"If you use GPU compute less than 12 hours/day, renting is almost always cheaper" than dedicated servers.

For sustained 24/7 inference, Hetzner's dedicated GPU servers (RTX 4000 Ada at EUR 184/month) beat hourly providers at 12+ hours/day usage.

Monthly cost at different usage patterns (A100 40GB):

| Daily Usage | Vast.ai | RunPod | Hetzner Dedicated |
|------------|---------|--------|------------------|
| 2 hrs/day | $30-42/mo | $71/mo | EUR 184/mo (overkill) |
| 8 hrs/day | $120-168/mo | $286/mo | EUR 184/mo (competitive) |
| 24/7 | $360-504/mo | $857/mo | EUR 184/mo (clear winner) |

### The Consulting Markup Math

The consulting business model for GPU inference is straightforward:

**Cost basis:** $0.22-0.34/hr for adequate inference (RunPod RTX 3090/4090)
**Client billing:** $2-5/hr for "dedicated AI infrastructure" or bundled into retainer
**Margin:** 6-15x on infrastructure alone

At a $2,000/month retainer:
- GPU cost (8 hrs/day, 20 business days): $35-54/month
- n8n/VPS cost: $10-40/month
- Total infrastructure: $45-94/month
- Margin on infrastructure: 95-98%

The infrastructure cost is so low that it's essentially free relative to the consulting fee. The value is in the expertise, not the compute.

Source: [AI Agency Pricing Guide 2025](https://digitalagencynetwork.com/ai-agency-pricing/)

### Provider Selection by Client Type

**Cost-optimized (internal/startup clients):** Vast.ai or RunPod Community. Lowest prices, acceptable reliability for non-critical workloads.

**Production-grade (SMB clients):** RunPod Secure Cloud or Northflank. Predictable pricing, better uptime, managed infrastructure.

**Enterprise (corporate clients):** AWS or GCP. Recognizable brand on invoices, SOC 2 compliance, existing cloud agreements. 3-5x more expensive but often required by procurement.

**Sustained engagement (multi-week projects):** Hetzner dedicated GPU. Best monthly price for 24/7 use. GDPR-compliant European data centers.

### Spot Instance Strategy

AWS G5 spot instances at $0.46/hr represent ~90% savings vs. on-demand pricing. GCP L4 spot at $0.22/hr is competitive with budget providers.

Spot instances are suitable for batch inference (overnight processing, document analysis) but not for real-time client-facing APIs where interruption is unacceptable.

Source: [How to Choose a Cloud GPU Provider](https://www.digitalocean.com/resources/articles/cloud-gpu-provider)

### DigitalOcean Gradient AI Platform

DigitalOcean launched Gradient AI Platform with GPU Droplets, bare metal GPU servers, and an AI agent builder. Positioned as the developer-friendly option with "minutes, not hours" deployment.

This represents the traditional cloud providers' response to the budget GPU providers (Vast.ai, RunPod). Pricing is higher but comes with managed services and familiar tooling.

Source: [DigitalOcean Gradient AI Platform](https://docs.digitalocean.com/products/gradient-ai-platform/)

## Key Takeaway

GPU inference costs are now low enough that they're negligible in a consulting business model. At $0.22-0.34/hr for capable inference, the entire infrastructure stack for serving AI to clients costs less than a single hour of consulting time per day. The provider choice is driven by client requirements (enterprise compliance vs. cost optimization vs. data sovereignty), not by the raw cost of compute. For Sherpa's client tier, RunPod is the default for on-demand GPU; Hetzner for sustained use; AWS/GCP when the enterprise client requires it.
