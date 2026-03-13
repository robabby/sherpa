# Iteration 1 — 2026-03-13

## Research Vectors

### Vector 1: CMS & Blog Stack
**Question:** What's the optimal CMS/blog stack for a consulting site with agentic content management?
**Full report:** [iteration-1/vector-1-cms-blog-stack.md](iteration-1/vector-1-cms-blog-stack.md)

**Key discoveries:**
- Payload CMS v3 embeds directly into Next.js — one deployment, one codebase, full API for agentic content ([payloadcms.com](https://payloadcms.com))
- Three API surfaces (REST, GraphQL, Local) with TypeScript types auto-generated for all collections
- Sanity is the best hosted alternative (generous free tier, mutation API), but vendor lock-in
- Keystatic and TinaCMS are dead ends for agentic workflows (no write API / $299/mo for API)
- MDX files are the simplest option but need custom workflow tooling

**Implications:**
- Payload CMS recommended for production; MDX + Velite as day-one starter with migration path to Payload

### Vector 2: Consulting Website Patterns
**Question:** What design, messaging, and trust patterns work for AI/tech consulting firms?
**Full report:** [iteration-1/vector-2-consulting-website-patterns.md](iteration-1/vector-2-consulting-website-patterns.md)

**Key discoveries:**
- Anti-hype positioning wins: ThoughtWorks ("AI that works"), Slalom ("AI, hold the hype") — enterprise buyers exhausted by hype
- Third-party validation > self-declared expertise: Palantir leads with Dresner/IDC/Forrester rankings
- Content hubs outperform chronological blogs for SEO and authority building
- Dark mode with warm accent colors differentiates from the cold blue/teal AI space
- Education (workshops, bootcamps) is the highest-trust conversion funnel

**Implications:**
- Lead with the problem (91% C-suite faking AI knowledge), not the product
- The open-source framework IS the trust signal for a new consultancy without Fortune 500 logos

### Vector 3: Dual-Audience Positioning
**Question:** How to serve developers AND enterprise buyers from one site?
**Full report:** [iteration-1/vector-3-dual-audience-positioning.md](iteration-1/vector-3-dual-audience-positioning.md)

**Key discoveries:**
- NNG research: DO NOT split homepage by audience — causes cognitive burden and information anxiety
- Vercel, Stripe, Supabase, MongoDB all use shared hero with parallel CTAs, not audience segmentation
- Task-based navigation (Framework | Consulting | Learn | About) outperforms persona-based ("For Developers" / "For Enterprises")
- StoryBrand "Guide" archetype requires empathy + authority — maps perfectly to sherpa = guide
- "We built the tool we use" resolves the open-source/consulting tension completely (Red Hat, Elastic, dbt Labs playbook)

**Implications:**
- One domain, two doors: "Get Started" (framework) and "Talk to a Guide" (consulting)
- Framework must be visible on homepage (not ThoughtWorks-style burial)
- MongoDB's "strategically ambiguous" free/paid boundary as model

### Vector 4: Next.js Consulting Site State of Art
**Question:** What's the technical state of art for Next.js marketing/consulting sites in 2026?
**Full report:** [iteration-1/vector-4-nextjs-consulting-sites-2026.md](iteration-1/vector-4-nextjs-consulting-sites-2026.md)

**Key discoveries:**
- Next.js 16 with Cache Components, stable Turbopack, React Compiler, and `proxy.ts` is production-ready
- Launch UI ($99 one-time) provides 74+ shadcn/ui marketing blocks on React 19.2 + Tailwind 4.2
- Answer Engine Optimization (AEO) is now critical alongside traditional SEO — structure content for AI answer engines
- Embedded Calendly converts 3x better than contact forms alone
- Motion (formerly Framer Motion) at 2.5x faster than GSAP — the clear animation choice
- Velite is the Contentlayer successor for type-safe MDX content layers

**Implications:**
- Stack confirmed: Next.js 16 + Tailwind v4 + shadcn/ui + Velite + Motion + Resend + Calendly
- Launch UI as component foundation; Aceternity/Magic UI for accent animations

## Synthesis

Three cross-cutting patterns emerged that no single vector produced:

**1. The Two-Phase Content Architecture.** The CMS research (Vector 1) and the blog architecture research (Vector 4) converge on the same answer: start with MDX + Velite (zero infrastructure, Git-based, aligns with Sherpa's filesystem governance), then migrate to Payload CMS when the blog-content-engine workforce needs programmatic draft/publish/schedule workflows. This isn't compromise — it's the optimal path. MDX files dogfood the framework's filesystem conventions. Payload CMS dogfoods the framework's API-driven agentic workflows. Each phase validates a different pillar.

**2. Anti-Hype Is the Positioning, Not Just the Messaging.** Vectors 2 and 3 independently converged on anti-hype as Sherpa's natural lane. But the synthesis goes deeper: anti-hype isn't just a marketing message, it's a structural positioning decision. The 91% faking-AI stat (Vector 2), the 95% pilot failure rate (consulting landscape research), and the transparency paradox (disclosure reduces trust but hiding is worse) all point to the same thing: **Sherpa's positioning IS the evidence.** The framework's research artifacts aren't just internal documents — they're the content marketing. The initiative system's transparency isn't just governance — it's the trust signal. The website doesn't need to *claim* anti-hype credibility; it *demonstrates* it by making the research visible. This is why content hubs > chronological blog: the research iteration structure maps directly to content hub architecture.

**3. The Parallel CTA as Identity Resolution.** Vector 3's dual-audience research and Vector 2's trust signal research combine into a single insight: the two CTAs aren't just navigation — they're the company's identity statement. "Get Started" (open-source framework) + "Talk to a Guide" (consulting) side by side on the hero is the "we built the tool we use" narrative in microcopy. It resolves the open-source/consulting tension without a word of explanation. Every visitor immediately understands: this company makes the tool AND provides the expertise. Vercel, Stripe, and MongoDB all do this, but none of them occupy the behavioral governance gap. The parallel CTA structure works because the two audiences share a common problem (AI adoption chaos) with different solutions (DIY framework vs. guided consulting).

**Single most important insight:** The website's structure IS the positioning. Content hubs demonstrate research rigor (anti-hype). Parallel CTAs demonstrate dual capability (tool-maker + consultant). Visible framework documentation demonstrates "we built the tool we use." The site architecture doesn't need messaging to explain Sherpa — it shows it.

## All Sources

### CMS & Blog Stack
- [Payload CMS](https://payloadcms.com) — Next.js native CMS, MIT license, 41.2k stars
- [Payload REST API](https://payloadcms.com/docs/rest-api/overview) — Full CRUD
- [Payload Local API](https://payloadcms.com/docs/local-api/overview) — Zero-overhead in-process access
- [Sanity.io](https://www.sanity.io) — Hosted structured content platform
- [Sanity Mutations API](https://www.sanity.io/docs/http-mutations) — Programmatic CRUD
- [Strapi](https://strapi.io) — Self-hosted headless CMS
- [Contentful Pricing](https://www.contentful.com/pricing/) — $300/mo cliff
- [Keystatic](https://keystatic.com) — Git-backed, read-only API
- [TinaCMS Pricing](https://tina.io/pricing) — $299/mo for API
- [Ghost Admin API](https://docs.ghost.org/admin-api/) — Publishing platform
- [Directus](https://directus.io) — Database-first backend
- [Velite](https://velite.js.org/guide/using-mdx) — Type-safe MDX content layer

### Consulting Website Patterns
- [Palantir Impact Studies](https://palantir.com/impact/) — Named client case study format
- [ThoughtWorks AI/works](https://thoughtworks.com/ai/works) — Branded methodology
- [Anthropic](https://anthropic.com) — Mission-led AI company
- [Slalom](https://slalom.com) — Anti-hype consulting positioning
- [Scale AI](https://scale.com) — Stakes-based enterprise positioning
- [Webstacks Trust Signals](https://www.webstacks.com/blog/trust-signals) — 8 B2B trust categories
- [Velocity Partners](https://velocitypartners.com/blog/how-to-write-an-anonymous-case-study-that-doesnt-suck/) — Anonymous case studies
- [Content Hubs for Thought Leadership](https://galileotechmedia.com/using-content-hubs-for-thought-leadership/)

### Dual-Audience Positioning
- [NNG Audience-Based Navigation](https://www.nngroup.com/articles/audience-based-navigation/) — Research against it
- [Vercel Enterprise](https://vercel.com/enterprise) — ROI-first messaging
- [StoryBrand](https://storybrand.com) — SB7 Guide framework
- [April Dunford](https://www.aprildunford.com/obviously-awesome) — 5-component positioning
- [Patrick McKenzie](https://kalzumeus.com/2011/10/28/dont-call-yourself-a-programmer/) — Business value framing
- [Accenture AI Index](https://www.accenture.com/us-en/insights/artificial-intelligence-summary-index) — 97% recognize, 9% deployed

### Next.js & Technical Stack
- [Next.js 16](https://nextjs.org/blog/next-16) — Cache Components, Turbopack, React Compiler
- [Launch UI](https://www.launchuicomponents.com/) — 74+ shadcn/ui marketing blocks
- [Aceternity UI](https://ui.aceternity.com/) — 200+ animated components
- [Magic UI](https://magicui.design/) — 150+ free components
- [Motion.dev](https://motion.dev/) — Framer Motion successor, 2.5x faster than GSAP
- [AEO Guide (LLMrefs)](https://llmrefs.com/answer-engine-optimization) — Answer Engine Optimization
- [Calendly Conversion](https://webgate.digital/use-cases/boosting-website-leads-using-calendly-forms/) — 3x vs contact forms
- [Resend + Next.js](https://resend.com/docs/send-with-nextjs) — Contact form via Server Actions
- [Vercel Speed Insights](https://vercel.com/docs/speed-insights) — Real-user CWV monitoring

### Consulting Landscape (Prior Research)
- [Evince — 91% C-Suite Faking AI](https://evince.com.au/resources/articles/2025s-hard-lessons-and-2026s-reality-check/)
- [Fortune — Deloitte Hallucinated Reports](https://fortune.com/2025/10/07/deloitte-ai-australia-government-report-hallucinations-technology-290000-refund/)
- [ScienceDirect — Transparency Paradox](https://www.sciencedirect.com/science/article/pii/S0749597825000172)

## Proposals Generated

- `proposal.md` — Initial proposal for the sherpa-website initiative with tech stack, site architecture, messaging framework, and phased content strategy.

## Open Questions for Next Iteration

1. **Payload CMS integration architecture** — How exactly does Payload embed into the sherpa.solar Next.js app? What are the cold start implications on Vercel? How does Neon's free tier handle overnight agent traffic? This is the critical Phase 2 dependency.

2. **Visual identity system** — Dark mode with warm accent is the direction, but the specific color palette, typography choices (custom font investment vs system fonts), and animation level need design exploration. What does "mountain guide warmth" look like as a design system?

3. **Content hub architecture** — The research system (/rr) generates research iterations. How do these map to public-facing content hubs? What's the transformation pipeline from internal research artifact to published thought leadership? This bridges sherpa-website and blog-content-engine.

4. **Pricing page design** — 73% prefer outcome-based pricing, but consulting engagements resist fixed pricing. What goes on the website vs behind "Talk to a Guide"? AI literacy workshop pricing can be transparent; custom engagements cannot. What's the right hybrid?

5. **Case study bootstrap strategy** — No clients yet. Options: framework adoption stories (requires open-source community), anonymized self-usage ("Sherpa using Sherpa"), pro-bono engagements for case studies, or framework documentation as proxy for case studies. Which is fastest to credible content?
