# Vector 5: AI SaaS Micro-Founders on Cheap VPS

## Question

How do indie hackers build AI-powered products on cheap VPS? What's the stack? How do they keep costs down?

## Findings

### Market Overview

The micro-SaaS market is growing rapidly:
- 95% of micro-SaaS businesses reach profitability within their first year
- ~70% earn under $1K MRR, 18% sit in $1K-5K MRR range
- 1 in 3 indie SaaS founders use AI for 70%+ of development and marketing workflows
- Market projected to grow from $15.7B to $59.6B by 2030 (~30% annual growth)
- Most founders spend under $1K before first revenue

Source: [AI-Driven, Founder-Led: The 2025 State of Micro-SaaS](https://freemius.com/blog/state-of-micro-saas-2025/)

### The Dominant Stack: Orchestrate APIs, Don't Self-Host

The overwhelming pattern among successful micro-SaaS founders is NOT self-hosting LLMs. Instead, they orchestrate cloud APIs and mark up the cost:

**Frontend:** SvelteKit, Next.js, React on Vercel or Cloudflare Pages
**Backend:** Firebase, Supabase, or serverless functions (Vercel/Cloudflare Workers)
**AI:** OpenAI, Replicate, 11Labs, PlayHT -- pay-as-you-go APIs
**Payments:** Stripe Checkout with credit/token systems
**Auth:** Firebase Auth, Clerk, NextAuth
**Email:** Resend, SendGrid

The philosophy: "You're not building infrastructure anymore. You're orchestrating services."

Source: [The solo dev SaaS stack powering $10K/month tools](https://dev.to/dev_tips/the-solo-dev-saas-stack-powering-10kmonth-micro-saas-tools-in-2025-pl7)

### Revenue Examples

**BoredHumans (Nick Dobos):** ~$733K/month (~$8.8M ARR) through ads + premium AI tools. Not self-hosted -- uses API backends.

**SiteGPT (Bhanu Teja):** Weekend prototype to $15K MRR. Custom AI chatbots trained on business data. Uses cloud APIs.

**Vocalize.Cloud:** Charges $69 per 1,000 characters of voice generation. Uses 11Labs API behind the scenes -- pure markup on API costs.

Source: [AI SaaS Solo Founder Success Stories](https://crazyburst.com/ai-saas-solo-founder-success-stories-2026/)

### The Infrastructure Philosophy

Serverless-first, no EC2 instances, no Docker, no dedicated servers. Cost reduction through:
1. Maximizing free tiers (Firebase, Vercel, Cloudflare)
2. Pay-as-you-go APIs only (no fixed infrastructure cost)
3. Simple monetization: free tokens, $5 tiers, Stripe Checkout
4. No cron jobs, no server management -- webhook-driven async processing

The "browser to Firestore to AI API to result" pipeline eliminates infrastructure complexity entirely.

### When Self-Hosting Enters the Picture

Self-hosting becomes relevant for micro-founders in specific scenarios:

**Scale-triggered:** When API costs threaten margins. At $5,000+/month in API spending, the ROI of self-hosting becomes compelling.

**Privacy as product differentiator:** When "your data never leaves your infrastructure" is the selling point. This is a niche but premium positioning.

**Cost floor:** Budget self-hosting on Hetzner starts at ~$4/month for simple projects. Break-even vs APIs typically occurs within months to a year depending on usage.

Source: [Self-Hosting Your Projects with Hetzner in 2025](https://anotherwrapper.com/blog/self-hosting-with-hetzner)

### Enterprise Self-Hosted Scale (Reference Point)

At the other end of the spectrum, serious self-hosted LLM infrastructure costs:
- One-time proof-of-concept and setup: ~EUR 9,900
- Ongoing production: EUR 6,000-20,000/month for moderate load
- This is enterprise territory, not micro-founder territory

Source: [Hetzner-native LLM Cluster](https://reruption.com/en/knowledge/blog/hetzner-native-llm-cluster-secure-cost-efficient-self-host)

### The Self-Hosted Solo AI Startup Infrastructure

For founders who do choose self-hosting, a comprehensive guide recommends:

**Hardware investment:** $2,000-5,000 (consumer GPU) to $15,000+ (enterprise)

**Software stack:**
- Ollama or vLLM for inference
- LangChain or LlamaIndex for orchestration
- ChromaDB or pgvector for embeddings
- Docker + Kubernetes for deployment
- Prometheus + Grafana for monitoring

**Models:** Llama 3 (general), Mistral 7B (lightweight), Qwen 2.5 (multilingual/code), DeepSeek-R1 (reasoning), Whisper (speech-to-text)

**Optimization:** FP16/INT8/INT4 quantization reduces memory up to 75%, doubles/triples response speed. Model distillation compresses models 4-5x smaller with 2-3x faster inference.

Source: [Setting Up a Self-Hosted Solo AI Startup Infrastructure](https://www.nucamp.co/blog/solo-ai-tech-entrepreneur-2025-setting-up-a-selfhosted-solo-ai-startup-infrastructure-best-practices)

### AI-First SaaS Unit Economics (2026)

For AI SaaS companies, the cost structure differs from traditional SaaS:
- Every new customer who actively uses an AI product increases infrastructure costs proportionally (not the "zero marginal cost" of traditional SaaS)
- Token costs scale with usage, not seats
- This makes self-hosting more attractive at scale because it converts variable API costs to fixed infrastructure costs

Source: [The Economics of AI-First B2B SaaS in 2026](https://www.getmonetizely.com/blogs/the-economics-of-ai-first-b2b-saas-in-2026)

## Key Takeaway

The micro-SaaS playbook is "orchestrate APIs, don't self-host" until scale forces the switch. This is the opposite of Sherpa's thesis. Sherpa's value proposition is self-hosted-from-day-one for privacy, compliance, and control -- which is a consulting/enterprise value prop, not a micro-SaaS value prop. The micro-SaaS world validates that self-hosting has a clear ROI at scale, but the path to get there starts with APIs for most founders.
