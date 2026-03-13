# /rr Launch Prompts

Standalone prompts for launching new initiatives. Paste each into a fresh Claude Code session.

---

## 0. agentic-consulting-landscape

```
Run recursive research for the agentic-consulting-landscape initiative.

Context: Sherpa Consulting (sherpa.solar) is an AI & Digital Transformation consulting company run by a solo founder building agentic workforces to scale the business. Before building out our own agentic operations (content workforce, YouTube pipeline, overnight dispatch, AI literacy consulting), we need to understand who else is doing this and what they've learned.

This is not about AI consulting firms in general — McKinsey and Deloitte have AI practices, but they're not running their own operations with agents. This is about the emerging class of solo operators and tiny teams who are using AI agents as their workforce: writing content, doing code audits, managing client work, running research, handling outreach — with agents doing the execution and humans doing the steering.

We need ground truth on what's actually working in 2026, not what people are promising. Revenue numbers, client acquisition channels, delivery quality, trust dynamics, failure modes, business model viability.

Read docs/framework.md for context on Sherpa's framework and three entities.

Seed questions:
1. Who is actually running a solo or micro-team AI/tech consulting business powered by agents in 2025-2026? Find specific people, companies, and projects — not theoretical frameworks. Search for solo AI consultants on Twitter/X, LinkedIn, Indie Hackers, Hacker News, and YouTube who talk openly about using agents to run their business. What services do they offer? What agents/tools do they use? What scale have they reached (revenue, clients, output volume)? Look for people like: solo devs selling AI-generated code audits, content agencies run by one person with agent workforces, AI consultants using Claude/GPT agents for client deliverables, indie hackers automating consulting with AI.
2. What business models are people using for agent-powered consulting? Map the landscape: productized services (fixed scope, agent-delivered), retainer models (ongoing agent workforce allocated to a client), project-based (agents do the work, human reviews and delivers), subscription content (agents produce, humans curate), white-label agent services (building and deploying agent workforces for clients). Which models have unit economics that work? Which ones have failed and why? What's the pricing psychology — do clients pay less because "AI did it" or more because delivery is faster?
3. What's actually working and what isn't? Find candid post-mortems, retrospectives, and honest accounts of running agent-powered operations. Where do agents deliver quality that clients accept? Where do they consistently fall short? What are the trust dynamics — do clients know agents are doing the work? Does transparency help or hurt? What's the quality control overhead — how much human time goes into reviewing and fixing agent output? Is the "overnight workforce" model (agents work while you sleep) actually viable or does review time eat the gains?
4. What's the client acquisition and trust-building challenge for agent-powered consultancies? How do solo AI consultants find clients? How do they build credibility when their workforce is artificial? What role does content marketing play (blogs, YouTube, Twitter threads about using AI)? Do case studies work differently when the delivery was agent-assisted? How do regulated industries (government, healthcare, finance) react to agent-delivered consulting work? What are the liability and insurance implications?
5. What infrastructure and tooling are agent-powered consultancies actually using? Beyond the marketing claims — what specific tools, frameworks, and workflows are people using in production? Claude Code, Cursor, custom MCP servers, LangGraph, CrewAI, AutoGen, or hand-rolled systems? How do they handle: scheduling agent work, reviewing output, managing client communication, tracking time/costs, ensuring quality? What's their stack look like end-to-end from client intake to deliverable?
```

---

## 1. sherpa-website

```
Run recursive research for the sherpa-website initiative.

Context: Sherpa Consulting (sherpa.solar) needs a public-facing website. The site serves as: landing page for consulting services, blog platform (will be managed by an agentic content workforce), case studies, and team page. Should dogfood the Sherpa framework (@sherpa/studio — Next.js, Tailwind v4, shadcn/ui). The blog section is critical because it's the publishing target for the blog-content-engine workforce that will follow.

Strategic positioning: Sherpa occupies the "behavioral governance" gap in the AI tooling market. The website should position Sherpa as the guide for organizations adopting AI — "we built the tool we use." The name itself does work here (sherpa = guide, not guru). The AI literacy consulting program (workshops for orgs behind on AI adoption) will be a key offering.

Read docs/framework.md for the seven pillars and three entities.

Seed questions:
1. What's the optimal stack for a consulting firm website that also serves as a CMS-backed blog — considering that blog content will eventually be created and managed by an agentic workforce? Evaluate headless CMS options (Payload, Sanity, Strapi, Contentful, keystatic) against criteria: API-first for programmatic content management, self-hostable or Vercel-compatible, good TypeScript/Next.js integration, cost at low volume.
2. What do the best AI/tech consulting firm websites look like? Analyze positioning, messaging, visual design, trust signals, and case study formats from firms like Palantir, ThoughtWorks, Anthropic's own site, and smaller AI consultancies. What patterns build credibility with enterprise buyers?
3. How should sherpa.solar position itself for two audiences simultaneously — (a) developers and AI practitioners who might adopt the framework, and (b) organizations that need AI adoption consulting? What messaging frameworks work for dual-audience sites?
4. What's the state of the art for Next.js-based consulting/agency websites in 2026? Templates, design systems, portfolio patterns, and what makes them perform well (SEO, Core Web Vitals, conversion optimization).
```

---

## 2. overnight-dispatch

```
Run recursive research for the overnight-dispatch initiative.

Context: Sherpa's execution pipeline has Planner/Worker/Judge dispatch and an MCP coordination layer (SQLite state, hook enforcement, behavioral conventions). What's missing is unattended recurring execution — the ability for agentic workforces to run overnight without human supervision, with structured output ready for morning review.

The first consumers will be content workforces (blog research/writing, YouTube video production). Each workforce needs: a recurring schedule, session lifecycle management without human presence, progress checkpointing, failure recovery, and a morning handoff protocol that feeds into Studio's morning review UX.

The coordination layer provides the state authority (MCP server + SQLite) and enforcement (Claude Code hooks). This initiative provides the scheduling and lifecycle layer on top.

Read docs/framework.md for the seven pillars and three-layer coordination architecture. Check docs/initiatives/mcp-coordination-layer/ and docs/initiatives/studio-collaboration-platform/ for the infrastructure this builds on.

Seed questions:
1. What patterns exist for unattended AI agent execution? Survey cron-triggered agent runs, event-driven dispatch, daemon processes, and queue-based architectures. How do existing frameworks (LangGraph, CrewAI, AutoGen, Claude Agent SDK) handle scheduled or recurring agent execution? What's production-proven vs. experimental?
2. What does session lifecycle management look like without human presence? How should an overnight system handle: starting a session, checkpointing progress (so a crash doesn't lose work), recovering from failures (model errors, rate limits, API outages, infinite loops), graceful termination, and cost guardrails (preventing runaway spend)?
3. How should overnight work product be structured for morning handoff? What metadata, summaries, and artifacts make morning review efficient? Look at patterns from CI/CD (build reports), monitoring systems (incident summaries), and content management (editorial queues). What makes a human able to review 8 hours of autonomous work in 15 minutes?
4. What are the failure modes of unattended agent execution and how do production systems handle them? Survey runaway costs, infinite loops, cascading failures, stale context, hallucination drift over long sessions, and resource exhaustion. What circuit breakers and safety mechanisms exist?
```

---

## 3. content-governance

```
Run recursive research for the content-governance initiative.

Context: Sherpa's governance engine handles code artifacts through the initiative lifecycle (proposal → plan → activity → integration). Content governance is a different pattern — editorial review, publishing approval, calendar scheduling, audience targeting. The governance engine needs to extend to non-code artifacts.

The first consumer will be the blog-content-engine workforce: agents that research and write articles overnight, producing drafts for morning review. The second consumer will be the headless-youtube-pipeline: agents that produce video scripts and visual treatments. Both need quality gates, approval workflows, and publishing lifecycle management.

The behavioral agent system already has a Judge role that "defaults to NEEDS WORK, requires evidence for approval." Content governance needs editorial versions of these quality gates — not code correctness, but accuracy, voice consistency, SEO quality, originality, and audience fit.

Read docs/framework.md for the governance engine description. Check docs/initiatives/studio-collaboration-platform/ for the morning review UX that content governance feeds into.

Seed questions:
1. What editorial workflow patterns exist in headless CMS and publishing platforms? Survey editorial calendars, multi-stage approval chains (pitch → draft → review → revise → approve → schedule → publish), content staging environments, and version control for prose. How do platforms like Contentful, Sanity, WordPress VIP, and Ghost handle editorial governance?
2. How do existing AI content platforms handle quality gates? Survey originality/plagiarism checking, fact-checking workflows, voice/tone consistency enforcement, SEO optimization scoring, and brand compliance. What's automated vs. human-reviewed? What tools exist (Grammarly, Copyscape, Clearscope, SurferSEO)?
3. What does a "Judge" role look like for content quality vs. code quality? What are measurable acceptance criteria for blog posts, video scripts, and social media content? How would fail-triggers differ — what are the content equivalents of "no test coverage" or "security vulnerability"?
4. How should content governance integrate with the existing initiative lifecycle? Is an article a "micro-initiative" with its own proposal/plan/activity cycle, or does it need a separate lightweight lifecycle? What granularity of governance makes sense for content that's produced daily vs. code that's produced in multi-session initiatives?
```

---

## 4. ai-literacy-program

```
Run recursive research for the ai-literacy-program initiative.

Context: Sherpa Consulting (sherpa.solar) will offer AI literacy consulting to organizations that are behind on AI adoption — those constrained by regulation, policy, culture, or simply not knowing where to start. This was identified as a key revenue opportunity: organizations with barriers to AI adoption are exactly the ones who will pay for guided help and are least likely to DIY.

The blog and YouTube channel provide top-of-funnel content (general AI literacy for everyone). The consulting engagements are the conversion — paid workshops, presentations, and multi-session programs for specific organizations. The Sherpa framework itself becomes the delivery mechanism for ongoing engagement.

The name "Sherpa" does strategic work here: guide, not guru. Accessible, not intimidating. Walks alongside, not lectures from above.

Read docs/framework.md for the three entities (framework, consulting company, WavePoint as first customer).

Seed questions:
1. What does the AI literacy training market look like in 2026? Who's offering what, at what price points, in what formats? Survey corporate training providers (Coursera for Business, LinkedIn Learning, custom consultancies), government-focused programs, and industry-specific offerings. Where are the gaps — who's underserved?
2. What are the specific barriers to AI adoption in regulated industries? Survey government (federal, state, local), healthcare, education, finance, and legal. What policies, compliance requirements (EU AI Act, NIST AI RMF, sector-specific regulations), cultural fears, and organizational dynamics slow adoption? What do these organizations actually need vs. what vendors are selling them?
3. What curriculum structures work best for AI literacy at different organizational levels? Compare executive briefings (30-60 min), department workshops (half-day), hands-on labs (full-day), multi-week programs, and async self-paced materials. What pedagogical approaches work for non-technical adults learning about AI? What does the research say about adult learning and technology adoption?
4. What does the competitive landscape look like for AI consulting firms targeting late adopters specifically? Who's serving the "we know we need AI but don't know how to start" segment? What's their positioning, pricing, delivery model, and where are the gaps? How do successful consultancies in adjacent spaces (digital transformation, cloud migration) structure their offerings?
```
