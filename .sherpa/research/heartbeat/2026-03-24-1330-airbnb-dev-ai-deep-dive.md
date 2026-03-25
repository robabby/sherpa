# Airbnb Staff Software Engineer, Dev AI — Application Research

Date: 2026-03-24
URL: https://careers.airbnb.com/positions/7729271/

---

## The Role

**Title:** Staff Software Engineer, Dev AI, Developer Infrastructure
**Team:** Developer Infrastructure → Dev AI sub-team
**Location:** San Francisco, CA (posted ~March 23, 2026 — very fresh)
**Level:** Staff = G9 at Airbnb
**Also posted:** Senior SWE, Dev AI (position 7729350) — same team, one level down

### From the JD

> "In this role, you will help to shape and execute the technical direction of the team's infrastructure and products. You'll work across a range of exciting problem spaces, from **agentic coding tools and asynchronous AI workflow platforms**, to SDKs for rapid internal AI app development and AI-assisted code migration."

> "The Dev AI team specifically builds the **foundational AI tooling and infrastructure that powers developer productivity across the entire software development lifecycle**."

### Key Responsibilities
- Shape technical direction of Dev AI team's infrastructure and products
- Build agentic coding tools (AI coding agents, autonomous dev workflows)
- Build asynchronous AI workflow platforms
- Build SDKs enabling rapid internal AI app development
- Build AI-assisted code migration tooling

### Requirements
- Prior experience building developer infrastructure, tooling, or platforms at scale
- Staff-level: ability to shape and drive technical direction
- Implied: LLM integration experience, agentic systems, async pipeline architecture

---

## What the Dev AI Team Actually Builds

### Confirmed Shipped Work
- **LLM-Driven Code Migration Pipeline** — Migrated ~3,500 React test files from Enzyme → React Testing Library using LLMs as agents in an automated pipeline. 1.5 years of dev time done in **6 weeks** using parallelized per-file LLM steps with retry loops.
- **AI-Assisted Mock Generation** — GraphQL infra + product context + LLMs for type-safe mocks
- **Intelligent Automation Platform** — Internal LLM orchestration layer

### Inferred from Job Postings
- Building infrastructure *for* AI agents to operate autonomously in their dev environment
- Internal AI app SDKs for rapid prototyping
- Async AI workflow platforms — task queue / orchestration for long-running LLM jobs

---

## Interview Process — Staff Engineer (G9)

1. Recruiter screen (~30 min)
2. Technical phone screen (~60 min) — must write working runnable code
3. Virtual onsite — 5-7 rounds:
   - 2× Coding (LeetCode medium-hard, working code required)
   - 1-2× System Design (more emphasis at Staff level)
   - 1× Behavioral/Cultural (deep dive, senior managers)
   - 1× Cross-functional or additional technical

**Timeline:** ~4 weeks application to offer

### Compensation (G9)
- Median total comp: ~$437,880/year
- Range: $377K–$511K+
- Mix: base ~$200-220K, RSUs (4-year vest), annual bonus

---

## Airbnb AI Strategy (Recent)

- Brian Chesky: "AI is the best thing that ever happened to Airbnb" (Feb 2026)
- AI-first app vision — agents that can book trips autonomously
- Chesky: AI cutting jobs "not as much as I thought" — Airbnb is hiring, not shrinking
- Multiple Dev Infrastructure roles open simultaneously — actively building out this org
- Dev AI job is brand new (1 day old) — Rob is early

---

## Rob's Fit

| JD Requirement | Rob's Proof Point |
|---|---|
| Agentic coding tools | Sherpa Studio: multi-agent dispatch, behavioral agent definitions |
| Async AI workflow platforms | Sherpa Studio: async workflow orchestration across agents |
| SDKs for internal AI development | Sherpa Studio: MCP server, reusable agent primitives |
| AI-assisted code migration | 472+ PRs in 11 weeks — AI-accelerated code velocity at scale |
| Shape technical direction | Staff-level ownership of Sherpa's entire architecture |
| Developer infrastructure experience | Built tooling products from scratch, not just features |

### Suggested Application Framing
> "I built Sherpa Studio specifically to solve the problem this team is now hiring for — how do you give engineers the infrastructure to delegate to AI agents, coordinate multi-step async workflows, and maintain governance over autonomous code execution? I'd be building the internal version of what I built externally."
