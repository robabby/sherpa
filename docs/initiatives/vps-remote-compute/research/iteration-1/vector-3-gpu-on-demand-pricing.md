# Vector 3: GPU On-Demand Pricing

**Question:** What does it cost to run a GPU instance capable of 9B+ parameter LLM inference? Can we spin up per-client and tear down when done?
**Agent dispatched:** 2026-03-16

## Findings

### Hardware Baseline

A 9B model at Q4_K_M quantization uses ~5-6 GB VRAM. Minimum viable GPU: NVIDIA T4 (16 GB). Recommended: 24 GB GPU (RTX 3090, RTX 4090, A10, L4) — runs Q8_0 (near-lossless) with context window headroom.

### Price Comparison (Cheapest to Most Expensive)

| Provider | GPU | VRAM | Hourly | Monthly (730h) | Spot/Preempt | API Provisioning |
|----------|-----|------|--------|-----------------|--------------|------------------|
| Vast.ai | A10 | 24 GB | $0.09/hr | $66 | Marketplace | Yes (REST API) |
| Salad Cloud | RTX 3090 | 24 GB | $0.09-0.12/hr | $66-88 | N/A | Yes |
| Vast.ai | RTX 3090 | 24 GB | $0.11/hr | $80 | Marketplace | Yes |
| GCP Spot | T4 | 16 GB | $0.14/hr | $102 | Yes | Yes (Terraform) |
| RunPod | RTX 3090 | 24 GB | $0.22/hr | $161 | Community | Yes (Terraform) |
| AWS Spot | g4dn.xlarge (T4) | 16 GB | $0.22/hr | $163 | Yes | Yes (Terraform) |
| Hetzner | RTX 4000 Ada | 20 GB | ~$0.27/hr | EUR 184/mo | No (dedicated) | Partial (Robot API) |
| RunPod | A40 | 48 GB | $0.44/hr | $321 | Community | Yes |
| AWS On-Demand | g5.xlarge (A10G) | 24 GB | $1.01/hr | $737 | No | Yes |
| ~~Oracle Cloud~~ | ~~A10~~ | ~~24 GB~~ | ~~$2.00/hr~~ | ~~$1,460~~ | ~~No~~ | ~~Yes~~ | *Excluded* |

### Recommended Tiers for Consulting Contracts

**Cost-Optimized (bill at $0.75-1.00/hr):**
- RunPod RTX 3090 at $0.22/hr
- Full API + official Terraform provider
- Provisions in ~30 seconds
- Best for short engagements (hours to days)

**Enterprise-Safe (bill at $1.50-2.00/hr):**
- AWS g5.xlarge spot (A10G, 24GB) at $0.46/hr
- GCP L4 spot at $0.22/hr
- Recognizable brand on invoice
- Most mature IaC ecosystem

**Dedicated/Sustained (bill at $500-800/mo):**
- Hetzner GEX44 at EUR 184/mo
- RTX 4000 SFF Ada, 20 GB VRAM
- Best for multi-week engagements
- EUR 79 setup fee. Germany only (no US GPU servers)

### Provider Details

**Hetzner GPU:** Dedicated servers only (GEX44, GEX131), not elastic cloud. GEX44: RTX 4000 SFF Ada (20 GB), EUR 184/mo + EUR 79 setup. GEX131: RTX PRO 6000 Blackwell (96 GB), EUR 889/mo, no setup fee. Germany only.

**RunPod:** Purpose-built for GPU inference. Community Cloud (cheaper, shared) and Secure Cloud (dedicated). Official Terraform provider. Serverless option for pay-per-request inference.

**Vast.ai:** GPU marketplace with variable pricing. Cheapest absolute prices but reliability varies by host. Good for experimentation, risky for production client work.

**Lambda Labs:** A10 at $0.75/hr on-demand. Good API. Often capacity-constrained.

**CoreWeave:** Enterprise/K8s-focused. A la carte pricing (GPU + CPU + RAM separate). A40 at $1.28/hr GPU-only. Overkill complexity for single-instance inference.

## Sources

- RunPod pricing: https://www.runpod.io/pricing
- Vast.ai marketplace: https://vast.ai/
- Hetzner GPU servers: https://www.hetzner.com/dedicated-rootserver/
- Lambda Labs pricing: https://lambdalabs.com/service/gpu-cloud
- GCP GPU pricing: https://cloud.google.com/compute/gpus-pricing
- AWS EC2 GPU pricing: https://aws.amazon.com/ec2/pricing/on-demand/
- CoreWeave pricing: https://www.coreweave.com/pricing

## Implications

GPU inference is affordable on-demand. At $0.22/hr (RunPod RTX 3090), a full 8-hour client session costs $1.76. Bill at $8-16 and it's a profitable line item. The key is API-driven provisioning so instances only exist when a client engagement is active. Hetzner GEX44 at EUR 184/mo makes sense for sustained multi-week engagements.

## Open Questions

- Should we standardize on RunPod for client GPU, or offer a menu (RunPod for cost, AWS/GCP for enterprise)?
- How do we automate the spin-up/teardown lifecycle — Terraform? Provider API directly?
- What's the cold-start time from API call to model serving (model pull + load)?
