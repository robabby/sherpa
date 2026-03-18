# Iteration 2 — 2026-03-16

## Focus

How are solo AI consultants, micro-agencies, and freelance developers using VPS to run AI models and agents for client work? Real-world patterns, costs, delivery models, and infrastructure choices.

## Findings

### Vector 1: Solo Operators Running Inference on VPS
**Question:** How do individual practitioners self-host LLMs on cheap VPS for client projects instead of paying API costs?
**Full report:** [iteration-2/vector-1-solo-operators-inference.md](iteration-2/vector-1-solo-operators-inference.md)

- Self-hosting saves $300-500/month in API costs after $1,200-2,500 hardware investment; break-even at ~500K-1M tokens/day
- Hetzner CPX41 at EUR 15/mo running Llama 3.2 8B is the sweet spot for "fast enough for real use, cheap enough to leave running 24/7"
- RackNerd at $2.49/mo (3 vCPU, 3.5 GB RAM) can run TinyLlama 1.1B with 4-bit quantization -- viable for toy use cases only
- Hetzner CX23 at EUR 25/mo (8 cores, 15 GB RAM) runs Metharme 7B Q4 with ~25-30 second response times on CPU
- Legal and compliance are the killer use case: attorneys running "eyes only" document analysis that protective orders prohibit sending to third-party APIs
- Corporate compliance is another driver: employers prohibiting third-party LLM usage, running Mistral Large on 2xA6000 GPUs instead
- 44% of organizations cite data privacy as top barrier to LLM adoption -- self-hosting is a consulting value proposition

**Implications:** The economics work for sustained workloads but not occasional use. The real value for consultants is not cost savings -- it's the compliance and privacy story that justifies premium pricing.

### Vector 2: AI Automation Agencies (2-10 People)
**Question:** How do small AI automation shops host infrastructure for clients? Shared or dedicated?
**Full report:** [iteration-2/vector-2-ai-automation-agencies.md](iteration-2/vector-2-ai-automation-agencies.md)

- n8n community consensus: start with n8n Cloud at ~$20/workspace/month per client, migrate to self-hosted VPS at ~$30/month total once you have 3+ clients
- Pricing model: charge $300-500/month per client, n8n costs ~$20/month per workspace = $280-480/month margin per client
- For enterprise clients: $2,000-8,000/month retainers for ongoing AI system support, with 73% profit margins documented
- Setup fees range $2,500-15,000+ depending on complexity
- One Israel-based automation specialist serves 50+ clients with n8n + WhatsApp bots at $1,000 one-time fee per project
- Hatz AI: purpose-built "AIaaS" platform for MSPs with multitenant management dashboard -- signals that this delivery model is maturing into productized platforms
- Agencies typically use 2x markup on development cost, scaling to 3x for sophisticated projects
- $38K/month revenue at 73% margins documented for focused AI automation agency

**Implications:** The agency model is proven and profitable. Self-hosted n8n on VPS is the standard infrastructure pattern for agencies past the 3-client threshold. The margin structure is excellent because infrastructure costs are trivial relative to what clients pay.

### Vector 3: Freelancers on Upwork/Fiverr Delivering AI Agent Services
**Question:** How do freelancers deliver AI agent work? Self-hosted vs. API? What VPS providers?
**Full report:** [iteration-2/vector-3-freelancer-delivery-models.md](iteration-2/vector-3-freelancer-delivery-models.md)

- 4,456 open AI Development jobs on Upwork as of research date
- Upwork now has a dedicated "AI Services" hub and is integrating GPT-4 powered assistant for freelancers
- Fiverr launched "Personal AI" program: freelancers create AI models trained on their own work, clients pay to use
- Most freelancers use cloud APIs (OpenAI, Anthropic) behind the scenes rather than self-hosting
- AgentVPS launched as "first AI-native VPS platform" with prebuilt environments and token-based pricing -- signals emerging market for turnkey agent hosting
- ClawHost: one-click OpenClaw deployment across 30+ locations -- "I got my OpenClaw running in under a minute"
- The trend: clients hire for the finished product, not the infrastructure. Freelancers choose whatever stack minimizes their delivery time

**Implications:** Freelancers overwhelmingly use API-based delivery because it's faster to ship. Self-hosting is only chosen when clients specifically require data sovereignty or when the freelancer has built a productized service on top of their own infrastructure.

### Vector 4: n8n / Workflow Automation Self-Hosted on VPS
**Question:** Real setups, costs, and client delivery models for self-hosted workflow automation with LLM integrations?
**Full report:** [iteration-2/vector-4-workflow-automation-stacks.md](iteration-2/vector-4-workflow-automation-stacks.md)

- **The canonical stack:** n8n + Ollama + Docker Compose on a single VPS, $5-10/month base cost
- **Contabo VPS** (12 GB RAM, 6 vCPU, 100 GB NVMe) at ~$10/mo is the documented "sweet spot" for AI automation
- **MassiveGrid VPS tier breakdown:** Tier 1 API-only ($9.58/mo, 2 vCPU, 4 GB), Tier 2 Hybrid+RAG ($19.16/mo, 4 vCPU, 8 GB), Tier 3 Local LLM ($38.32+/mo, 8+ vCPU, 16+ GB)
- **n8n resource usage:** idles at 300-500 MB RAM, spikes to 1-2 GB during complex executions; PostgreSQL adds 1.75-2.75 GB
- **Ollama on VPS without GPU:** Llama 3 8B runs at 5-15 tokens/sec on 8 vCPU; 60+ tok/sec with GPU
- **Model selection for VPS:** llama3.2:3b for fast responses, llama3.2 8B general-purpose, deepseek-r1:7b for reasoning, mistral 7B for summarization
- **Self-hosted AI automation stack for $0/month:** n8n + Docker + MCP + Ollama with no subscriptions, open-source only
- **Freelancer ROI calculation:** 8-10 hours/week automated at $50/hr = $20,800/year saved; infrastructure cost ~$84/year = 247x ROI
- **Railway deployment:** n8n + Ollama one-click deploy for private, self-hosted AI workflows

**Implications:** The n8n + Ollama + VPS pattern has hit critical mass. Multiple hosting providers now offer one-click n8n deployments. The cost floor for a production AI automation stack is genuinely $5-10/month. For Sherpa's dispatch use case, this validates our Tier 1 architecture.

### Vector 5: AI SaaS Micro-Founders on Cheap VPS
**Question:** How do indie hackers build AI-powered products on cheap VPS? What's the stack? How do they keep costs down?
**Full report:** [iteration-2/vector-5-micro-saas-founders.md](iteration-2/vector-5-micro-saas-founders.md)

- 95% of micro-SaaS businesses reach profitability within first year; ~70% earn under $1K MRR, 18% at $1K-5K MRR
- 1 in 3 indie SaaS founders use AI for 70%+ of development and marketing workflows
- Dominant stack: serverless-first (Vercel/Cloudflare) + pay-as-you-go APIs (OpenAI, Replicate) + free tiers everywhere
- Most micro-founders do NOT self-host models -- they orchestrate cloud APIs and mark up the cost
- Example: Vocalize.Cloud charges $69 per 1,000 characters of voice generation, using 11Labs API behind the scenes
- SiteGPT grew from weekend prototype to $15K MRR building AI chatbots trained on client data
- Self-hosting enters the picture only when API costs threaten margins at scale or when "privacy" is the product differentiator
- The Hetzner self-hosted route: one-time proof-of-concept ~EUR 9,900 setup, EUR 6,000-20,000/month for production LLM cluster -- this is enterprise-scale, not micro-founder territory
- Budget self-hosting: $4/month Hetzner for simple projects, break-even vs APIs within months to a year depending on usage

**Implications:** The micro-SaaS playbook is "orchestrate APIs, don't self-host" until scale forces the switch. This is the opposite of Sherpa's thesis. Sherpa's value proposition is self-hosted from day one for privacy/compliance/control -- which is a consulting/enterprise value prop, not a micro-SaaS value prop.

### Vector 6: GPU Cloud Provider Economics
**Question:** What are the real costs for GPU inference across providers, and how do they map to consulting business models?
**Full report:** [iteration-2/vector-6-gpu-provider-economics.md](iteration-2/vector-6-gpu-provider-economics.md)

- **Vast.ai:** A100 40GB from $0.50-0.70/hr, H100 from $1.77/hr -- cheapest but peer-to-peer marketplace, reliability concerns
- **RunPod:** A100 40GB $1.19/hr (Community), H100 $2.79/hr -- sub-minute spin-up, per-second billing
- **Northflank:** A100 40GB $1.42/hr, H100 $2.74/hr -- best for production reliability + cost
- **Lambda Labs:** A100 40GB $1.29/hr, H100 $2.99/hr -- when available
- **TensorDock:** A100 40GB $1.63/hr -- brokered marketplace with reputation ratings
- **AWS/Azure:** 8x H100 at $55/hr -- 10x more but recognizable on enterprise invoices
- **For 7B inference:** RTX 4090 from $0.34/hr (RunPod Community) handles most workloads; no need for H100
- **Key insight:** "If you use GPU compute less than 12 hours/day, renting is almost always cheaper" than dedicated servers

**Implications:** The consulting markup math is clear. At $0.22-0.34/hr cost for adequate inference, billing clients $2-5/hr for "dedicated AI infrastructure" yields 6-15x margins. For Sherpa's client tier, RunPod at $0.22/hr is the default recommendation; AWS/GCP for enterprise clients who need the brand on invoices.

## Synthesis

### The Market Is Real and Segmented

Five distinct practitioner segments emerged, each with different infrastructure patterns:

| Segment | Infrastructure Pattern | Monthly Cost | Revenue Model |
|---------|----------------------|-------------|---------------|
| Solo consultant | Cloud APIs + occasional VPS | $0-50/mo | Hourly/project billing |
| AI automation agency | Self-hosted n8n + Ollama on VPS | $10-40/mo | $300-500/mo retainers per client |
| Freelancer (marketplace) | Cloud APIs, client's infra | $0-20/mo | Fixed-price projects |
| Micro-SaaS founder | Serverless + API orchestration | $0-100/mo | Subscription SaaS |
| Compliance-driven consulting | Self-hosted everything on VPS | $40-200/mo | Premium retainers ($2K-8K/mo) |

### The Three Value Propositions for Self-Hosting

1. **Cost arbitrage** -- Only works at scale (500K+ tokens/day). Most small operators never hit this threshold.
2. **Data sovereignty/compliance** -- The real differentiator. Legal, healthcare, financial clients will pay premium for "your data never leaves your infrastructure."
3. **Operational independence** -- No rate limits, no vendor lock-in, no API deprecation risk. Appeals to technical founders and agencies building productized services.

### What This Means for Sherpa

**Sherpa's VPS initiative is well-positioned** for the compliance-driven consulting segment (segment 5 in the table above). The $5/mo Hetzner baseline from Iteration 1 is validated by the market -- that's exactly what agencies and solo consultants are deploying.

**The consulting billing model is proven:**
- Infrastructure cost: $5-40/month (CPU) or $0.22-2.79/hour (GPU)
- Client billing: $300-500/month (basic automation) to $2,000-8,000/month (enterprise retainer)
- Documented margins: 73-90% for AI consulting/automation services

**The canonical stack aligns with our architecture:**
- Ollama (not LM Studio) is the market standard for VPS deployment
- Docker Compose is the deployment standard for this scale
- Tailscale is used but not dominant (most practitioners use direct SSH or Cloudflare Tunnels)
- n8n is the workflow automation standard -- a potential integration point for Sherpa

**Iteration 1's architecture is validated but should shift toward Ollama as the primary inference engine on VPS**, reserving LM Studio for local development. The `LM_STUDIO_URL` abstraction still works because Ollama exposes an OpenAI-compatible API on the same endpoint pattern.

## Proposals Generated

No new proposals. This research validates and strengthens the existing VPS Remote Compute proposal with market evidence. The key adjustment: position Ollama (not LM Studio) as the VPS inference engine, with LM Studio remaining the local development tool.

## Open Questions for Next Iteration

1. **n8n integration** -- Should Sherpa's dispatch pipeline integrate with n8n? The market clearly uses n8n as the orchestration layer. Is there a clean boundary between Sherpa's dispatch and n8n's workflow automation?
2. **Client isolation** -- How do agencies isolate client workloads on shared VPS infrastructure? Separate Docker networks? Separate VPS instances? Namespace-based?
3. **OpenClaw as competitor/complement** -- OpenClaw is gaining traction as a self-hosted AI agent platform. How does it compare to Sherpa's agentic framework? Is it a competitor or a deployment target?
4. **Productized service packaging** -- The market shows clear pricing tiers ($500/mo, $2K/mo, $5K/mo). How does Sherpa's framework map to productized service tiers that a consulting practice can sell?
5. **Monitoring and observability** -- What lightweight monitoring do solo operators actually use on their VPS? The enterprise patterns (Prometheus + Grafana) are overkill.
