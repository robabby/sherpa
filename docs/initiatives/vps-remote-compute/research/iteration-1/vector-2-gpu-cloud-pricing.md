# Vector 2: GPU Cloud Pricing for Client-Billable Inference

**Question:** What does it cost to run a GPU instance capable of 9B+ parameter LLM inference, provisioned on-demand per client engagement?
**Agent dispatched:** 2026-03-16

## Hardware Requirements: 9B Model Inference

A 9B parameter model at FP16 needs ~18 GB VRAM — too much for 16 GB GPUs without quantization. With Q4_K_M quantization (standard for inference, negligible quality loss), a 9B model uses ~5-6 GB VRAM. With Q6_K quantization (higher quality), ~9 GB. With Q8_0, ~13 GB.

**Minimum viable GPU:** NVIDIA T4 (16 GB VRAM). Runs 9B models at Q4-Q6 quantization with room for context window overhead. Inference speed is adequate but not fast (~20-30 tok/s for 9B Q4).

**Recommended GPU:** Anything with 24 GB VRAM — RTX 3090, RTX 4090, A10, L4. Runs 9B models at Q8_0 (near-lossless) with headroom. RTX 4090 and L4 deliver 40-60+ tok/s.

**Overkill for 9B:** A40 (48 GB), A100 (40/80 GB), L40S (48 GB). These make sense for 70B+ models or multi-model serving, not single 9B inference.

## Provider-by-Provider Pricing

All prices are on-demand hourly rates unless noted. Data as of March 2026.

---

### 1. Hetzner (Dedicated GPU Servers)

Hetzner offers dedicated GPU servers, not on-demand cloud instances. Monthly billing with hourly option.

| Model | GPU | VRAM | Price | Setup Fee |
|-------|-----|------|-------|-----------|
| GEX44 | RTX 4000 SFF Ada | 20 GB GDDR6 | EUR 184/mo (~$0.27/hr) | EUR 79 one-time |
| GEX131 | RTX PRO 6000 Blackwell | 96 GB GDDR7 | EUR 889/mo (~$1.28/hr) | None |

**GEX44 post-April 2026:** Price increases to EUR 212/mo (~$0.31/hr).

**API:** Hetzner Robot Webservice API supports programmatic server ordering. Python and Ruby SDKs available. However, "spin up" means provisioning a dedicated server — not instant like cloud VMs. Provisioning takes minutes to hours, not seconds.

**Regions:** Falkenstein, Nuremberg (Germany). GEX131 also available in Nuremberg. No US regions for GPU servers.

**Verdict:** Best eur/VRAM ratio for sustained use. The GEX44 at $0.27/hr with 20 GB VRAM is exceptional value for always-on or multi-day engagements. Not suitable for spin-up/teardown per engagement due to provisioning time and setup fee. Consider for clients needing a dedicated instance for weeks/months.

---

### 2. Vultr (Cloud GPU)

| GPU | VRAM | Hourly | Monthly |
|-----|------|--------|---------|
| A16 | 64 GB (4x16 GB) | $0.32/hr | $234/mo |
| A40 | 48 GB | $0.76/hr | $556/mo |
| A100 PCIe | 80 GB | $1.49/hr | $1,090/mo |
| L40S | 48 GB | $1.67/hr | est. $1,219/mo |
| H100 SXM | 80 GB | $2.30/hr | $1,684/mo |

**Smallest viable for 9B:** A16 at $0.32/hr (each A16 card is 4x16 GB partitions — one partition has 16 GB, sufficient for 9B Q4-Q6).

**API:** Full REST API and Terraform provider. Programmatic create/destroy supported. Instances launch in minutes.

**Regions:** 32+ locations globally including multiple US, Europe, Asia-Pacific.

**Spot pricing:** Not publicly listed. Contact sales for reserved/commitment discounts (36-month terms show ~50% savings).

**Verdict:** Solid mainstream option. A16 is surprisingly affordable for 9B inference. Full API automation. Global regions.

---

### 3. Lambda Labs (GPU Cloud Specialist)

| GPU | VRAM | Hourly (1 GPU) |
|-----|------|----------------|
| Quadro RTX 6000 | 24 GB | $0.58/hr |
| A10 | 24 GB | $0.86/hr |
| A6000 | 48 GB | $0.92/hr |
| A100 PCIe 40GB | 40 GB | $1.48/hr |
| A100 SXM 40GB | 40 GB | $1.48/hr |
| A100 SXM 80GB | 80 GB | $2.06/hr |
| H100 PCIe | 80 GB | $2.86/hr |
| H100 SXM | 80 GB | $3.78/hr |

**Smallest viable for 9B:** Quadro RTX 6000 at $0.58/hr (24 GB VRAM).

**API:** Lambda Cloud API at `https://cloud.lambdalabs.com/api/v1`. Supports launch, restart, terminate. Billed per minute. No egress fees.

**Regions:** US (Utah us-west-3, Texas us-south-1, and others). Limited region selection.

**Availability:** Lambda is notorious for stock-outs. Popular GPU types frequently show "out of stock." The A10 and Quadro RTX 6000 tend to have better availability than H100s.

**Verdict:** Clean API, per-minute billing, no egress fees. The A10 at $0.86/hr is a strong 9B inference option when available. Availability is the main risk.

---

### 4. RunPod (Pods + Serverless)

**GPU Pod Pricing (Community Cloud):**

| GPU | VRAM | Hourly |
|-----|------|--------|
| RTX 3090 | 24 GB | $0.22/hr |
| RTX 4090 | 24 GB | $0.34/hr |
| A40 | 48 GB | $0.35/hr |
| L4 | 24 GB | $0.44/hr |
| L40S | 48 GB | $0.79/hr |
| A100 PCIe 80GB | 80 GB | $1.19/hr |
| A100 SXM 80GB | 80 GB | $1.39/hr |

**Secure Cloud** prices are higher (~20-40% premium) for SOC 2 compliant infrastructure.

**Serverless:** Pay-per-second, scales to zero. Cold starts 200ms-12s depending on container size. Ideal for bursty inference.

**API:** Full REST API and Terraform provider (`decentralized-infrastructure/runpod`). Programmatic pod create/destroy. Per-second billing.

**Regions:** US, EU, multiple data centers.

**Verdict:** Best price/performance for on-demand GPU inference. RTX 3090 at $0.22/hr and RTX 4090 at $0.34/hr are the cheapest 24 GB options across all providers. Serverless mode is ideal for per-request billing. Terraform support enables full automation. **Top pick for client-billable inference.**

---

### 5. Vast.ai (GPU Marketplace)

Marketplace pricing — rates fluctuate based on supply/demand.

**Typical rates (March 2026):**

| GPU | VRAM | Typical On-Demand | Interruptible |
|-----|------|-------------------|---------------|
| T4 | 16 GB | $0.11/hr | ~$0.06/hr |
| RTX 3090 | 24 GB | $0.11/hr | ~$0.06/hr |
| RTX 4090 | 24 GB | $0.18/hr | ~$0.10/hr |
| A10 | 24 GB | $0.09/hr | ~$0.05/hr |
| A40 | 48 GB | $0.20/hr | ~$0.12/hr |
| L4 | 24 GB | $0.19/hr | ~$0.10/hr |
| A100 40GB | 40 GB | ~$0.52/hr | ~$0.30/hr |
| A100 80GB | 80 GB | ~$0.90/hr | ~$0.50/hr |

**API:** Full CLI (`vast.py`) and REST API. `vast create instance`, `vast destroy instance`. Per-second billing.

**Regions:** Distributed globally across 40+ data centers (host-dependent).

**Reliability caveat:** Marketplace hosts have variable reliability. Interruptible instances can be preempted. On-demand instances are stable but hosts may have hardware issues. Not all hosts meet enterprise standards.

**Verdict:** Absolute cheapest GPU rates available. A10 at $0.09/hr and RTX 3090 at $0.11/hr are remarkable. But marketplace reliability varies. Best for cost-sensitive workloads where some instability is acceptable. The CLI/API makes automation straightforward.

---

### 6. ~~Oracle Cloud Infrastructure (OCI)~~ — EXCLUDED

Oracle Cloud has been excluded from all Sherpa recommendations on values grounds. Their GPU pricing ($2.00/hr for A10) was also significantly more expensive than alternatives.

---

### 7. Google Cloud Platform (GCP)

| GPU | VRAM | On-Demand | Spot |
|-----|------|-----------|------|
| T4 | 16 GB | $0.35/hr | $0.14/hr |
| L4 | 24 GB | $0.56/hr | $0.22/hr |
| A100 40GB | 40 GB | $2.93/hr | $1.15/hr |
| A100 80GB | 80 GB | $3.93/hr | $1.57/hr |
| H100 SXM | 80 GB | $9.80/hr | $2.25/hr |

**Note:** These are GPU-only prices. Total instance cost includes vCPUs + RAM on top.

**Spot discounts:** 60-91% off on-demand. T4 spot at $0.14/hr and L4 spot at $0.22/hr are competitive.

**API:** Full GCP API, Terraform provider, `gcloud` CLI. Mature enterprise automation.

**CUDs:** 1-year commitment ~37% off, 3-year ~55% off on-demand.

**Regions:** 40+ globally.

**Verdict:** Spot T4 at $0.14/hr and spot L4 at $0.22/hr are competitive for 9B inference. But spot instances can be preempted with 30s notice. Full instance cost (GPU + compute) runs higher than the GPU-only prices shown. Best for organizations already on GCP.

---

### 8. AWS (Amazon Web Services)

| Instance | GPU | VRAM | On-Demand | Spot | 1yr RI | 3yr RI |
|----------|-----|------|-----------|------|--------|--------|
| g4dn.xlarge | 1x T4 | 16 GB | $0.526/hr | $0.223/hr | $0.331/hr | $0.227/hr |
| g5.xlarge | 1x A10G | 24 GB | $1.006/hr | $0.459/hr | $0.634/hr | $0.435/hr |

**Note:** These are full instance prices (GPU + CPU + RAM + storage included).

**g4dn.xlarge specs:** 4 vCPU, 16 GB RAM, 125 GB NVMe. T4 16 GB. Sufficient for 9B at Q4-Q6.

**g5.xlarge specs:** 4 vCPU, 16 GB RAM, 250 GB NVMe. A10G 24 GB. Comfortable for 9B at Q8_0.

**API:** Full AWS API, Terraform, CloudFormation, CDK. The most mature automation ecosystem.

**Spot savings:** g4dn.xlarge spot at $0.223/hr (58% off). g5.xlarge spot at $0.459/hr (54% off).

**Regions:** 30+ globally.

**Verdict:** g4dn.xlarge spot at $0.223/hr is a solid mainstream choice with full-stack pricing (no hidden CPU/RAM add-ons). g5.xlarge spot at $0.459/hr gives 24 GB VRAM. AWS has the most mature API/Terraform ecosystem. But on-demand prices are higher than GPU-native providers.

---

### 9. CoreWeave (GPU-Focused Cloud)

| GPU | VRAM | Hourly (GPU only) |
|-----|------|-------------------|
| A40 | 48 GB | $1.28/hr |
| A100 | 80 GB | $2.21/hr |
| H100 PCIe | 80 GB | $4.76/hr |

**Note:** A la carte pricing — GPU, CPU, RAM, storage all billed separately. A common A100 setup (8 vCPU, 64 GB RAM) pushes total beyond $3/hr.

**API:** Kubernetes-native. Full k8s API for deployment. Not as simple as REST API providers for spin-up/teardown.

**Spot:** "Flex Reservations" and spot instances available, up to 60% off.

**Minimum requirements:** 1 GPU, 1 vCPU, 2 GB RAM, 40 GB NVMe.

**Verdict:** Enterprise-focused, Kubernetes-native. Overkill for single-instance inference. Better for organizations running large-scale GPU clusters. The a la carte pricing makes cost estimation complex.

---

### 10. Other Notable Providers

#### TensorDock
- RTX 4090: $0.35-0.37/hr | A100: $0.75/hr | H100 SXM: $2.25/hr (spot: $1.91/hr)
- Global marketplace with KVM isolation. API available.
- $5 minimum deposit, instances launch in 30 seconds.

#### Salad Cloud (Consumer GPU Network)
- RTX 3090: $0.09-0.12/hr | RTX 4090: $0.16-0.20/hr
- Distributed consumer GPUs (like Vast.ai but more managed).
- Lowest absolute prices but reliability concerns for production workloads.
- Container-based deployment with API.

#### Hyperstack
- RTX A6000: $0.50/hr
- Newer provider. Less track record.

#### Fluidstack
- A100 80GB: ~$0.90/hr
- Aggregates data center GPUs. Up to 70% cheaper than hyperscalers.

#### Shadeform (Aggregator)
- Not a provider — aggregates pricing across 15+ GPU clouds.
- Single API to provision on whichever provider has capacity/best price.
- Useful as a meta-layer for multi-provider strategies.

---

## Comparison Matrix: 9B Inference (Minimum Viable GPU)

Sorted by cheapest hourly rate for a GPU with >=16 GB VRAM.

| Provider | GPU | VRAM | Hourly | Monthly (730h) | API Automation | Reliability |
|----------|-----|------|--------|-----------------|----------------|-------------|
| Vast.ai | A10 | 24 GB | $0.09/hr | $66 | CLI + REST | Variable (marketplace) |
| Vast.ai | RTX 3090 | 24 GB | $0.11/hr | $80 | CLI + REST | Variable |
| Salad | RTX 3090 | 24 GB | $0.09-0.12/hr | $66-88 | API | Variable (consumer GPUs) |
| Vast.ai | T4 | 16 GB | $0.11/hr | $80 | CLI + REST | Variable |
| GCP Spot | T4 | 16 GB | $0.14/hr | $102 | Full GCP API | Good (preemptible) |
| Vast.ai | RTX 4090 | 24 GB | $0.18/hr | $131 | CLI + REST | Variable |
| RunPod | RTX 3090 | 24 GB | $0.22/hr | $161 | REST + Terraform | Good |
| AWS Spot | T4 (g4dn.xl) | 16 GB | $0.223/hr | $163 | Full AWS API | Good (preemptible) |
| GCP Spot | L4 | 24 GB | $0.22/hr | $161 | Full GCP API | Good (preemptible) |
| Hetzner | RTX 4000 Ada | 20 GB | $0.27/hr | $198 | Robot API | Excellent (dedicated) |
| Vultr | A16 | 16 GB* | $0.32/hr | $234 | REST + Terraform | Good |
| RunPod | RTX 4090 | 24 GB | $0.34/hr | $248 | REST + Terraform | Good |
| TensorDock | RTX 4090 | 24 GB | $0.35/hr | $256 | API | Good |
| RunPod | A40 | 48 GB | $0.35/hr | $256 | REST + Terraform | Good |
| GCP On-Demand | T4 | 16 GB | $0.35/hr | $256 | Full GCP API | Excellent |
| AWS Spot | A10G (g5.xl) | 24 GB | $0.459/hr | $335 | Full AWS API | Good (preemptible) |
| AWS On-Demand | T4 (g4dn.xl) | 16 GB | $0.526/hr | $384 | Full AWS API | Excellent |
| GCP On-Demand | L4 | 24 GB | $0.56/hr | $409 | Full GCP API | Excellent |
| Lambda | A10 | 24 GB | $0.86/hr | $628 | REST API | Good (when in stock) |
| AWS On-Demand | A10G (g5.xl) | 24 GB | $1.006/hr | $734 | Full AWS API | Excellent |
| ~~OCI~~ | ~~A10~~ | ~~24 GB~~ | ~~$2.00/hr~~ | ~~$1,460~~ | — | *Excluded* |

*Vultr A16 is a multi-GPU card; 16 GB is per partition.

---

## Recommendations for Consulting Contracts

### Tier A: Cost-Optimized (marketplace providers)
**For price-sensitive clients or internal prototyping.**
- **RunPod RTX 3090** at $0.22/hr (~$161/mo if always-on)
- **RunPod RTX 4090** at $0.34/hr (~$248/mo)
- Bill client at $0.50-1.00/hr (margin: 50-78%)
- Risk: Community cloud, not SOC 2

### Tier B: Balanced (established cloud, spot/preemptible)
**For clients who need reliability with cost control.**
- **AWS g4dn.xlarge spot** at $0.22/hr (~$163/mo) — T4 16 GB
- **AWS g5.xlarge spot** at $0.46/hr (~$335/mo) — A10G 24 GB
- **GCP L4 spot** at $0.22/hr (~$161/mo) — L4 24 GB
- Bill client at $1.00-2.00/hr (margin: 50-80%)
- Risk: Spot instances can be preempted (checkpoint-based recovery needed)

### Tier C: Enterprise (on-demand, guaranteed)
**For clients requiring guaranteed uptime and compliance.**
- **AWS g5.xlarge on-demand** at $1.01/hr (~$734/mo)
- **GCP L4 on-demand** at $0.56/hr (~$409/mo)
- **Vultr A16** at $0.32/hr (~$234/mo)
- Bill client at $2.00-4.00/hr (margin: 50-85%)
- Risk: Minimal. On-demand = guaranteed capacity

### Tier D: Sustained/Dedicated
**For multi-week or multi-month client engagements.**
- **Hetzner GEX44** at EUR 184/mo (~$198/mo) — RTX 4000 Ada 20 GB, dedicated
- **AWS g4dn.xlarge 3yr RI** at $0.227/hr (~$166/mo) — requires upfront commitment
- Bill client at $500-800/mo (margin: 60-75%)
- Risk: Commitment period. Hetzner has EUR 79 setup fee but no lock-in

---

## Spin-Up/Teardown Automation Summary

| Provider | Provisioning Method | Spin-Up Time | Terraform | Per-Second Billing |
|----------|--------------------|--------------|-----------|--------------------|
| RunPod | REST API | ~30s | Yes | Yes |
| Vast.ai | CLI + REST | ~60s | No (CLI) | Yes |
| Lambda | REST API | ~60s | No official | Yes (per-minute) |
| AWS | Full API/SDK | 1-5 min | Yes | Per-second |
| GCP | Full API/SDK | 1-5 min | Yes | Per-second |
| Vultr | REST API | 1-5 min | Yes | Hourly |
| ~~OCI~~ | — | — | — | *Excluded* |
| TensorDock | API | ~30s | No | Yes |
| Hetzner | Robot API | Minutes-hours | Community | Monthly (hourly option) |
| CoreWeave | Kubernetes API | 1-5 min | Yes (k8s) | Per-minute |

---

## Sources

- https://www.hetzner.com/dedicated-rootserver/gex44/ — Hetzner GEX44 specs and pricing
- https://www.hetzner.com/dedicated-rootserver/gex131/ — Hetzner GEX131 specs and pricing
- https://www.whtop.com/plans/hetzner.com/128304 — Hetzner GEX44 EUR 184/mo confirmed
- https://www.hetzner.com/pressroom/new-gex131/ — GEX131 pricing EUR 889/mo
- https://docs.hetzner.com/robot/dedicated-server/robot-interfaces/ — Hetzner Robot API
- https://onedollarvps.com/pricing/vultr-pricing — Vultr GPU pricing table
- https://www.vultr.com/products/cloud-gpu/ — Vultr GPU product page
- https://lambda.ai/pricing — Lambda Labs pricing
- https://docs.lambda.ai/public-cloud/on-demand/creating-managing-instances/ — Lambda API docs
- https://www.runpod.io/gpu-pricing — RunPod GPU pricing
- https://www.runpod.io/pricing — RunPod plans and serverless pricing
- https://registry.terraform.io/providers/decentralized-infrastructure/runpod/latest/docs — RunPod Terraform
- https://docs.runpod.io/api-reference/overview — RunPod API
- https://vast.ai/pricing — Vast.ai marketplace pricing
- https://docs.vast.ai/cli/commands — Vast.ai CLI docs
- https://docs.vast.ai/api/overview-and-quickstart — Vast.ai API
- https://gpucost.org/provider/gcp — Google Cloud GPU pricing
- https://cloud.google.com/compute/gpus-pricing — GCP official GPU pricing
- https://cloud.google.com/spot-vms/pricing — GCP Spot pricing
- https://instances.vantage.sh/aws/ec2/g4dn.xlarge — AWS g4dn.xlarge pricing
- https://instances.vantage.sh/aws/ec2/g5.xlarge — AWS g5.xlarge pricing
- https://aws.amazon.com/ec2/spot/pricing/ — AWS Spot pricing
- https://www.thundercompute.com/blog/coreweave-gpu-pricing-review — CoreWeave pricing review
- https://www.coreweave.com/pricing — CoreWeave pricing
- https://www.tensordock.com/ — TensorDock pricing
- https://salad.com/pricing — Salad Cloud pricing
- https://getdeploying.com/gpus — GPU price comparison across 54 providers
- https://northflank.com/blog/cheapest-cloud-gpu-providers — Cheapest GPU cloud comparison
- https://www.hyperstack.cloud/blog/case-study/how-much-vram-do-you-need-for-llms — VRAM requirements for LLMs
- https://localllm.in/blog/lm-studio-vram-requirements-for-local-llms — LM Studio VRAM requirements

## Implications

1. **RunPod is the recommended default** for client-billable GPU inference. RTX 3090 at $0.22/hr with full REST API + Terraform, per-second billing, and fast spin-up. The margin at even $0.75/hr billing is excellent.

2. **AWS/GCP spot instances** are the "safe" option for clients who need a recognizable brand on the invoice. g4dn.xlarge spot at $0.22/hr or GCP L4 spot at $0.22/hr are price-competitive with RunPod.

3. **Vast.ai is cheapest** in absolute terms but marketplace reliability makes it unsuitable for client-facing production inference without a fallback strategy.

4. **Hetzner GEX44 is unbeatable for sustained use** — EUR 184/mo for a dedicated GPU server is cheaper than any cloud at >27 hours of use per month. But it's a dedicated server, not elastic compute.

5. **A T4 with 16 GB VRAM is sufficient** for 9B model inference at Q4-Q6 quantization. A 24 GB GPU (RTX 3090, RTX 4090, A10, L4) is better — runs Q8_0 with headroom.

6. **All viable providers have APIs** for programmatic provisioning. RunPod and TensorDock are fastest to spin up (~30s). AWS/GCP take 1-5 minutes.

## Open Questions

- Should we standardize on one provider or use Shadeform as a meta-layer across multiple?
- What's the minimum engagement size that justifies GPU provisioning vs. using a hosted inference API (e.g., Together AI, Fireworks)?
- Do any clients require data residency (EU, specific country) that would constrain provider choice?
- Should the consulting contract bill at a flat hourly rate or pass through actual GPU cost + markup?
