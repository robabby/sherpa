# Vector 2: AI Automation Agencies (2-10 People)

## Question

How do small AI automation shops host infrastructure for clients? Shared or dedicated? What's the infrastructure cost vs. client pricing?

## Findings

### Infrastructure Patterns

The dominant pattern for small agencies is **n8n self-hosted on VPS**, graduating from cloud hosting as the client count grows:

**Stage 1 (1-2 clients):** n8n Cloud at ~$20/month per workspace. Each client gets a separate workspace. "Start with n8n Cloud -- it's the easiest way to begin your agency."

**Stage 2 (3+ clients):** Self-hosted VPS at ~$30/month total instead of $20 per client. Significant cost reduction at scale. Docker Compose with PostgreSQL, Redis, and queue workers.

Source: [n8n Community: Best setup for managing multiple client automations](https://community.n8n.io/t/best-n8n-setup-plan-for-managing-multiple-client-automations/252395)

### Client Isolation

The consensus is separate workspaces per client -- "each client needs their own workspace (like separate Google accounts)." This provides data isolation without requiring separate VPS instances.

For agencies on self-hosted n8n, the pattern is namespace-based isolation within a single n8n instance, not separate instances per client.

### Pricing and Margins

**Basic automation retainers:** $300-500/month per client. Infrastructure cost ~$20/month per workspace (cloud) or ~$10/month amortized (self-hosted). Margins: $280-480/month per client.

**Enterprise AI retainers:** $2,000-8,000/month depending on system complexity. Documented case: $38,000/month revenue at 73% profit margins for a focused AI automation agency.

**Setup fees:** $2,500-15,000+ for initial implementation depending on complexity.

**Day rates:** GBP 800 ($1,000+) for experienced automation consultants.

**Premium solutions:** AI agents or live data dashboards starting from GBP 1,200-4,000 ($1,500-5,000+).

Sources:
- [AI Automation Agency Pricing 2025](https://www.oreateai.com/blog/demystifying-ai-automation-agency-pricing-for-2025-what-to-expect-and-how-to-budget/2641e0e3d1ce0755aee65caea09c4599)
- [How to Charge Clients: AI Automation Agencies](https://flexxable.com/how-to-charge-clients-for-ai-services-pricing-models-for-ai-automation-agencies/)
- [AI Agency Pricing Guide 2025](https://digitalagencynetwork.com/ai-agency-pricing/)

### Real Agency Examples

**WhatsApp automation agency (Israel):** 50+ clients, builds WhatsApp bots and workflow automation for small businesses. Charges $1,000 one-time fee per project. Uses self-hosted n8n in queue mode with PostgreSQL, Redis, Docker, and WAHA (WhatsApp API). "Run millions of workflows for $0/month" on self-hosted infrastructure.

Source: [How I Built a WhatsApp Business Automation System with n8n](https://dev.to/achiya-automation/how-i-built-a-whatsapp-business-automation-system-with-n8n-self-hosted-2akh)

**AI workflow automation revenue:** One business professional reported AI agents for workflow automation now represent over 60% of their revenue, built on n8n connecting business problems with real-world solutions.

Source: [How I Built Business-Automating Workflows with AI Agents](https://towardsdatascience.com/how-i-built-a-business-automating-workflows-with-ai-agents/)

### MSP/AIaaS Platforms Emerging

**Hatz AI:** Purpose-built AI-as-a-Service platform for Managed Service Providers. Features custom LLM delivery, vector storage, and an MSP admin dashboard with multitenant management. Runs on "Mido" LLM ops engine. Allows MSPs to "rapidly build customized applications for themselves and for clients."

This signals that the "agency hosts AI for clients" model is maturing from DIY VPS setups into productized platforms.

Source: [AI-as-a-Service Takes Shape for 3 MSPs](https://www.channelpronetwork.com/2025/03/12/ai-as-a-service-takes-shape-for-3-msps/)

**Key MSP stat:** SMBs will channel more than $90 billion in new spending into managed IT services through 2026. 72% of US SMBs plan to increase managed IT spending.

Source: [10 High-Value MSP AI Services](https://customgpt.ai/msp-ai-services/)

### Typical Agency Markup Structure

- 2x markup on total development cost for initial profitability
- Scale to 3x for larger, more sophisticated projects
- Value-based pricing when automation saves measurable client costs (e.g., $30K implementation for $100K annual savings = 3x ROI year one)

Source: [AI Automation Agency Pricing (2026): A CFO's Guide](https://optimizewithsanwal.com/ai-automation-agency-pricing-2026-a-cfos-guide/)

### Infrastructure Cost at Scale

| Clients | Cloud (n8n) | Self-Hosted (VPS) | Delta |
|---------|------------|-------------------|-------|
| 1 | $20/mo | $30/mo | Cloud cheaper |
| 3 | $60/mo | $30/mo | Self-hosted 2x cheaper |
| 5 | $100/mo | $30-40/mo | Self-hosted 2.5-3x cheaper |
| 10 | $200/mo | $40-60/mo | Self-hosted 3-5x cheaper |
| 20 | $400/mo | $60-100/mo | Self-hosted 4-7x cheaper |

## Key Takeaway

The AI automation agency model is proven and highly profitable. Self-hosted n8n on VPS becomes the obvious choice at 3+ clients. The margin structure is remarkable -- infrastructure costs ($10-40/month) are negligible against client revenue ($300-8,000/month per client). The business scales on the labor of building automations, not infrastructure costs. This is directly relevant to Sherpa Consulting's service model.
