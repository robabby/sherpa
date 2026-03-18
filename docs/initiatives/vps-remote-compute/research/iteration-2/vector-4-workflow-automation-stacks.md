# Vector 4: Workflow Automation Self-Hosted on VPS (n8n, Langflow, Dify)

## Question

Real setups, costs, and client delivery models for self-hosted workflow automation platforms with LLM integrations on VPS.

## Findings

### The Canonical Stack: n8n + Ollama + Docker on VPS

This combination has become the de facto standard for self-hosted AI workflow automation in 2025-2026. Multiple independent sources document the same pattern.

**Reference setup (Contabo VPS):**
- Contabo VPS: 12 GB RAM, 6 vCPU, 100 GB NVMe (~$10/month)
- n8n for workflow orchestration
- Ollama for local LLM inference
- Docker Compose for containerization
- Let's Encrypt for HTTPS
- Custom domain pointing to VPS

"By combining open-source tools within a low-cost cloud infrastructure, individuals and organizations can achieve enterprise-class automation for under $10 per month."

Source: [Cloud-Based AI Automation with n8n and Ollama on Contabo VPS](https://medium.com/@philipogbunugafor/cloud-based-ai-automation-environment-with-n8n-and-ollama-hosted-on-contabo-vps-1c4078775cff)

### VPS Tier Breakdown for n8n AI Agents

MassiveGrid published the most granular breakdown of VPS requirements:

**Tier 1: API-Only AI Workflows**
- 2 vCPU, 4 GB RAM, 64 GB SSD -- $9.58/month
- Handles 20-30 active workflows calling external LLM APIs
- All heavy computation on provider infrastructure

**Tier 2: Hybrid (API + Vector Database)**
- 4 vCPU, 8 GB RAM, 128 GB SSD -- $19.16/month
- Handles 50-100 active workflows including RAG pipelines
- Components: n8n + PostgreSQL + Qdrant + Redis + queue workers

**Tier 3: Local LLM Hosting**
- 8+ vCPU, 16+ GB RAM, 256 GB SSD -- $38.32+/month
- CPU inference: 5-15 tokens/second
- Llama 3 8B needs 6-8 GB RAM allocation

Source: [Best VPS for n8n AI Agents](https://massivegrid.com/blog/best-vps-n8n-ai-agents/)

### Resource Consumption (Measured)

| Component | RAM Usage |
|-----------|----------|
| n8n main process | 400-600 MB |
| PostgreSQL | 500 MB - 1 GB |
| Qdrant vector DB | 256 MB - 2 GB |
| Ollama (Llama 3 8B) | 6-8 GB |
| Redis queue | 128-256 MB |
| **Total (Tier 3)** | **~10-12 GB** |

Storage requirements:
- Execution history: 50-200 MB/day at 1,000 executions/day
- Vector embeddings (100K chunks): 200-400 MB
- Local LLM models: Llama 3 = ~4.7 GB, Mixtral 8x7B = ~26 GB

Source: [MassiveGrid n8n VPS Guide](https://massivegrid.com/blog/best-vps-n8n-ai-agents/)

### n8n + Ollama Integration Details

n8n has dedicated Ollama nodes (no manual HTTP requests needed). Integration setup:

1. Both containers on same Docker network
2. Create Ollama credential in n8n: Base URL `http://ollama:11434`
3. Attach Ollama Chat Model node to Basic LLM Chain

**Model recommendations for n8n workflows:**
- `llama3.2:3b` -- fast responses, simple tasks
- `llama3.2` (8B) -- reliable general-purpose
- `deepseek-r1:7b` -- reasoning and structured output
- `mistral` (7B) -- summarization and classification

**Performance on CPU (no GPU):**
- Llama 3 8B: 5-15 tokens/sec on 8 vCPU
- With GPU: 60+ tokens/sec

Source: [Contabo: What is Ollama and How to Use it with n8n](https://contabo.com/blog/what-is-ollama-and-how-to-use-it-with-n8n/)

### The Zero-Cost Stack

A developer documented building a self-hosted AI automation stack for $0/month:
- n8n (workflow orchestration)
- Docker (containerization)
- MCP for AI prompt processing
- Ollama for local inference (or OpenRouter for cloud)

Key lesson: containers need explicit shared volumes in docker-compose.yml for n8n to access MCP output files.

Source: [How I built a self-hosted AI automation stack](https://dev.to/dev_tips/how-i-built-a-self-hosted-ai-automation-stack-without-losing-my-mind-58c9)

### Freelancer ROI Calculation

Five core n8n + AI workflows for freelancers:
1. Content auto-distributor (saves 3-4 hrs/week)
2. Client report generator (saves 2-3 hrs/week)
3. Competitor monitor (saves 1-2 hrs/week)
4. Hashtag rotation system (saves 1 hr/week)
5. Invoice follow-up automator (saves 30-60 min/week)

Total: 8-10 hours/week automated.
At $50/hour: **$20,800/year** in saved labor.
Annual infrastructure cost: ~$84 (VPS $5/mo + AI API $2/mo).
**ROI: 247x.**

Source: [Automate Your Freelance Business with AI + n8n](https://dev.to/atlasdigital/how-to-automate-your-freelance-business-with-ai-n8n-2026-guide-1h7k)

### Alternative Platforms

**Langflow:**
- Low-code AI workflow builder with drag-and-drop interface
- MCP support, dark mode, built-in knowledge base
- Docker deployment on VPS
- 8 GB RAM recommended for Ollama integration with 7B model
- Hostinger offers one-click Langflow VPS deployment

Source: [Langflow: How to Host AI Agents](https://www.langflow.org/blog/how-to-host-langflow)

**Dify:**
- Production-grade AI application platform
- 30-minute setup via Docker Compose on standard VPS
- 50+ built-in tools, multi-tenancy support
- 4 GB RAM minimum
- "If Flowise is for prototyping, Dify is for production"

Source: [Dify Review 2026](https://similarlabs.com/blog/dify-review)

**Flowise:**
- Drag-and-drop interface for LLM workflow building
- Best for rapid prototyping
- Less suited for production multi-client deployments

Source: [Self-Hosted AI Automation: n8n vs Windmill vs Activepieces](https://www.devcrea.com/self-hosted-ai-workflow-automation)

### Hosting Providers with One-Click n8n/AI Deployments

| Provider | Offering | Price Range |
|----------|---------|-------------|
| Contabo | n8n one-click image | From ~$5/mo |
| Hostinger | n8n + Ollama + Langflow one-click | From $5/mo |
| Railway | n8n + Ollama one-click deploy | Usage-based |
| Hetzner | Manual Docker setup | From EUR 4/mo |

### n8n Pricing Context (Self-Hosted vs. Cloud)

**Cloud:** Starting at EUR 24/month (Starter) with execution limits; scales to EUR 800+/month for enterprise.

**Self-Hosted Community Edition:** Free under Fair Code license. Unlimited workflows, executions, and users. Only infrastructure costs apply.

**Self-Hosted Enterprise:** Custom pricing with SSO, RBAC, audit logging.

Source: [n8n Pricing](https://n8n.io/pricing/)

## Key Takeaway

The n8n + Ollama + VPS pattern has hit critical mass in 2025-2026. Multiple hosting providers now offer one-click deployments. The cost floor for a production AI automation stack is genuinely $5-10/month. For higher-quality inference, $20-40/month gets a Tier 2-3 setup capable of local 7B model inference plus RAG pipelines. This is the infrastructure layer that AI automation agencies are building profitable businesses on top of.
