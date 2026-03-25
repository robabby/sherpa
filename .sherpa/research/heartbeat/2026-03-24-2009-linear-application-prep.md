---
title: >
  Linear Application Prep — Sr/Staff Product Engineer + Fullstack Engineer
date: 2026-03-24
category: heartbeat
type: application-prep
target: Linear (linear.app)
roles:
  - Senior/Staff Product Engineer
  - Senior/Staff Fullstack Engineer
prior_research:
  - 2026-03-23-1833-linear-deep-dive.md
  - 2026-03-22-0119-linear-cover-letter-draft.md
  - 2026-03-21-2337-sherpa-linear-integration.md
summary: >
  Full application package for Rob Abby's Linear applications. Includes role status check,
  updated cover letter for Sr/Staff Product Engineer, interview process intel, culture signals,
  AI strategy research, and application tips. Synthesizes all prior Linear research into an
  action-ready package.
---

# Linear Application Prep — March 24, 2026

## Role Status (as of March 24, 2026)

### ✅ Sr/Staff Product Engineer
**URL:** https://linear.app/careers/069c4628-88d7-4e4d-b393-c996fc7f3076  
**Status:** Presumed live (confirmed live March 23, 2026 — less than 24 hours ago). Linear's SPA renders via JavaScript so static curl can't confirm current state, but these roles have been up for weeks and no closure signals.

**What they want:**
- React + TypeScript specialist
- Complex UI: drag & drop, virtualized lists, real-time collaborative editing
- Works close to product and founders; fast iteration cycles
- Performance profiling experience
- Owns problems end-to-end
- **Key phrase from JD:** *"We're building the product development system for teams and agents. AI is fundamentally changing how software gets built, and we're shaping the tools this new era requires."*

### ✅ Sr/Staff Fullstack Engineer
**URL:** https://linear.app/careers/cd5ae036-0223-427a-b038-ba16ef9dcb32  
**Status:** Presumed live (same basis as above)

**What they want:**
- Full-stack depth: GraphQL resolvers, DB modeling, data sync optimization
- Backend credibility alongside strong frontend
- Less pure product/UI focus than the Product Engineer role

**Recommendation:** Apply to both. Lead with Product Engineer. Rob's angle is strongest there.

---

## Interview Process Intelligence

Linear is famously non-traditional. Based on public documentation, employee posts, and consistent reporting:

### The Work Trial (The Main Event)
- **Format:** 2–5 day paid work trial instead of whiteboard interviews
- **Access:** Candidates get Slack, GitHub, Figma, relevant internal tooling
- **Project:** A real project the team plans to ship, not a fake exercise
- **Track record:** Strong candidates have shipped features that went to production
- **Compensation:** Paid during the trial

### What "Passing" Looks Like
1. **Orientation speed** — How fast can you orient in an unfamiliar codebase?
2. **PR quality** — Is the code clean, intentional, typed properly, well-structured?
3. **Product sensibility** — Do you ask good questions? Do you make reasonable tradeoffs?
4. **Initiative** — Do you wait to be told what to do, or do you dig in?

### Pre-Trial Screening
- Application review (cover letter + work history)
- 1–2 async or live calls with hiring manager / team member
- Technical screen may or may not exist depending on the role

### What Linear Specifically Does NOT Do
- Leetcode-style algorithm problems
- Whiteboard coding
- Case studies in a vacuum
- "Culture fit" theater

### How This Maps to Rob
Rob's work trial preparation is already done. He:
- Ships at a rate of 472+ PRs in 11 weeks (≈6 PRs/day)
- Navigates complex TypeScript monorepos daily via Claude Code
- Has built the conceptually identical system (Sherpa Studio ≈ what Linear engineers build)
- Can orient in a new codebase, make an opinionated small change, and ship it cleanly within hours

**The key competitive advantage:** Rob's work trial warmup is literally his day job.

---

## Culture Signals (Deep Read)

Linear's culture is unusually coherent and worth taking seriously. Not performative — they actually operate this way.

### The README Philosophy
Linear's README (linear.app/readme) is their cultural bible. Key themes:
- Software used to feel magical. It doesn't anymore. Linear exists to bring the magic back.
- Craftsmanship is the mechanism. Not feature velocity, not user research theater.
- The best tools get out of the way.

**The quote that matters:**
> *"What got them excited about computers was not so much what they were, but everything they had the potential to be."*

Rob should internalize this and reflect it back naturally — not by quoting it, but by living it in how he talks about his own work.

### Operating Principles (From Public Sources + Job Descriptions)
1. **Relentless focus** — Small team, no meetings theater, deep work culture
2. **Quality over velocity** — But Rob disproves the binary: he has both
3. **Ownership** — Engineers own features end-to-end, not hand-offs
4. **Close to founders** — Product Engineer role specifically calls this out
5. **Craft as identity** — Not "good enough", not "MVP mentality" in the pejorative sense

### Team Size and Composition (March 2026)
- ~178 employees total
- Engineering team is small relative to the product footprint
- Remote-first but with async-first communication culture
- Distributed across North America and Europe
- Series C ($1.3B valuation, $100M ARR) — mature but still startup culture

### What They Notice
- **Code that's been thought about**, not just written
- **Product opinions** — engineers who have strong views about what should be built
- **Pattern recognition** — "This is how we should build this" not "what do you want me to build?"
- **Judgment** — Knowing when to ask vs. decide

---

## Linear's AI Strategy (March 2026 Update)

This is where Rob's story is most differentiated. Linear has been moving hard on AI:

### What Linear Has Built
1. **MCP Server** (February 2026 expansion) — OAuth 2.0 integration allowing AI agents to read/write Linear data. Initiative CRUD, issue management, project management. Rob already has a working MCP server against this API.

2. **Agents API** — Delegation model: agent as delegate, human as assignee. This is the exact design philosophy Rob independently arrived at for Sherpa's Planner/Worker model.

3. **Integration Directory "Agents" Category** (as of March 2026) — A dedicated category for AI agents that can operate inside Linear. Partners include Devin (Cognition), Charlie (TypeScript PR automation), Warp (Oz orchestration), Sentry Agent, Tembo, and others. The ecosystem is explicitly being built out.

4. **Claude + Cursor + Windsurf MCP integrations** — Linear is actively betting on coding agents as first-class users of their system.

### What They Haven't Built Yet (Rob's Gap Analysis)
- **Behavioral governance layer** — No mechanism for enforcing conventions or constraints on what agents can do within a workflow
- **Lifecycle-aware task management** — Agents currently treated as generic delegates, not phase-aware actors
- **Agent workforce management** — No way to manage multiple agent roles with differentiated access
- **MCP composition** — Rob's Stripe-inspired abstraction ladder approach isn't in Linear's ecosystem yet

This is the conversation Rob should be able to have with them: not just "I'm a user" but "here's what the governance gap looks like from someone who built the missing layer."

---

## Cover Letter (Final Version for Sr/Staff Product Engineer)

> **Note:** This supersedes the March 22 draft. Refined for length and punch. 250-word version is recommended for the application form. The 400-word version can be used for direct email/cold outreach.

---

### Version 1 — Concise (250 words) ★ RECOMMENDED

---

Karri / Linear team,

I've been building in the same space as Linear for the past year — not as a competitor, but as a practitioner who built the governance layer you haven't shipped yet.

I founded Sherpa, an AI consulting practice, and used it to build WavePoint: a cross-platform astrology product spanning a Next.js web app, six native Apple apps, and shared TypeScript packages — 472+ PRs in 11 weeks as a solo engineer. The velocity was only possible because I built Sherpa Studio: a project management and agentic workflow system with initiative lifecycle management, agent governance, convention enforcement, and behavioral constraints. I built it because Linear wasn't sufficient for governing AI-assisted development at the fidelity I needed.

When I read your job description — *"We're building the product development system for teams and agents"* — I recognized the problem space immediately. I've been solving it from the other direction.

The governance gap between your Agents API and what teams actually need to run reliable AI-assisted workflows is exactly what I spent the last year building from first principles. Your MCP server expansion in February mapped almost 1:1 to Sherpa Studio's initiative lifecycle model.

Before the AI-native chapter: 13 years in frontend infrastructure. Staff-level at PartySlate through Series B — 25+ component library, 258% YoY revenue growth, 150% increase in venue inquiries from a rewrite I owned end-to-end. Deep React, TypeScript, design systems.

I've built the solo version of what you're building at scale. I want to work on the one that ships to 25,000 teams.

— Rob Abby  
robabby.com · linkedin.com/in/robabby

---

### Version 2 — Extended (400 words) — For Email / Direct Outreach

---

Karri / Linear team,

I've been building in the same space as Linear for the past year — not as a competitor, but as a practitioner who needed a deeper toolset than what existed and built it himself.

I founded Sherpa, an AI consulting practice, and used it to build WavePoint: a full astrology platform spanning a Next.js web app, six native Apple apps, 82 API routes, 37 computation modules, a Swift astronomy engine — 472+ PRs shipped in 11 weeks as a solo engineer. That velocity required building the infrastructure that made AI-generated code reliable. I built Sherpa Studio: an Agentic Engineering workflow suite with 91+ React components, initiative lifecycle management, behavioral governance (44 constraints enforced at tooling level), MCP server integration with 12 composed tools, and a Planner/Worker/Judge pipeline with autonomous retry loops.

When I studied Linear's recent investments — the MCP server expansion in February, the Agents API, the Integration Directory — I saw the complementary fit clearly. Linear owns project tracking and team coordination beautifully. What's missing is the governance layer between the human team and the AI agents: behavioral constraints that adapt by phase, convention enforcement tied to a config schema, lifecycle-aware workflow management. That's exactly what I built Sherpa Studio to do. I didn't build it to compete with Linear — I built it because the governance layer doesn't exist in your ecosystem yet, and I needed it.

Your February MCP expansion added initiative CRUD that maps almost 1:1 to Sherpa's initiative lifecycle model. Your delegation model — agent as delegate, human as assignee — mirrors the design philosophy I independently arrived at. These aren't surface observations. I've been living in this problem space.

Before founding, I spent 13 years building frontend infrastructure. Six of those were at PartySlate, where I joined a 12-person startup and stayed through Series B — scaling the frontend team, shipping a 25+ component library, and helping drive 258% YoY revenue growth across a platform serving 200k+ monthly users. I led the ground-up rewrite of their highest-traffic page, resulting in a 150% increase in venue inquiries.

Linear's values — craftsmanship, focus, building tools that respect developers — are the same principles I wrote into Sherpa's foundation stone before writing a line of code. Your README reads like my operating manual.

I've built the solo version of what you're building at scale. I want to build the multiplied one — at Linear.

— Rob Abby  
robabby.com · linkedin.com/in/robabby

---

### Version 3 — LinkedIn DM / Cold Outreach (100 words)

---

Hi [Name] — I'm a Staff Frontend Engineer who spent the past year building Sherpa Studio, an Agentic Engineering workflow suite (91+ React components, MCP integration, behavioral governance). When I saw Linear's Agents API and MCP expansion in February, I realized I'd been independently building the governance layer that complements what you're doing. I shipped 472+ PRs across a full product solo in 11 weeks using this framework. I'd love to talk about the Sr/Staff Product Engineer role — I think there's a real product conversation here, not just a hiring conversation. Would you be open to a call?

---

## Application Tips & Referral Intel

### Who to Reach at Linear

**Karri Saarinen** — CEO/Cofounder. Technically deep, product-driven. Tweeting actively about AI and the future of software development. Not the right cold DM target (too senior, too busy), but the letter is addressed to him because Linear's culture makes this appropriate.

**Tuomas Artman** — CTO/Cofounder. Less public presence but deep engineering credibility. Worth a LinkedIn connection before applying if you can find a warm signal.

**Hiring Managers:** Linear doesn't post names publicly but the engineering team is small enough that LinkedIn search for "Software Engineer at Linear" will surface 3–8 people, some of whom may be the hiring manager for these roles.

**Approach:** Don't spam. If Rob has any mutual connections at Linear (through PartySlate, Savo, or the Chicago/SF startup networks), a warm intro is worth 10x the cold application. Check mutual connections on LinkedIn *before* applying cold.

### Application Strategy

1. **Submit via the careers page first** — Both roles, same week. Don't wait. These roles have been open for a while and may close without notice.

2. **Lead with the Sherpa Studio / governance gap story** — Not "I'm a fan of Linear" but "I've been solving an adjacent problem and here's what I learned."

3. **Have work ready to show** — If they ask for code samples or a portfolio, Sherpa Studio's component system or the governance engine are directly relevant. WavePoint shows product breadth.

4. **Pre-work trial preparation:**
   - Review Linear's open-source TypeScript SDK (linear SDK on npm) to understand their data model
   - Read through `linear.app/docs` to understand the project/issue/cycle hierarchy
   - Be fluent in their MCP implementation (especially the OAuth delegation model and initiative scopes added in February)
   - Be ready to talk about MobX state management (it's in their stack; Rob's strength is React/Zustand but the fundamentals transfer — acknowledge this confidently, don't hide it)

5. **During work trial:**
   - Ask clarifying questions early, then own the implementation
   - Ship small, clean PRs with good commit messages
   - Show product thinking: "I noticed X, here's why I made this tradeoff"
   - Don't wait for permission

6. **Comp expectations:** $220–$300K base for Staff in North America. Equity meaningful — they've done tender offers (liquidity available). Don't anchor low.

### Potential Referral Paths

- **Chicago tech network** — PartySlate and Savo alumni may have connections to Linear users/investors
- **IndieHackers / MakerPad / solo-founder communities** — Linear is deeply embedded in these communities; Rob's AI-native engineering work may have surfaced organically
- **LinkedIn mutual connections** — Check specifically for Karri, Tuomas, or any "Engineering at Linear" profiles
- **AI/LLM community** — Rob's work with Claude Code and agentic engineering overlaps with communities where Linear engineers are active (Latent Space podcast community, AI Engineer World's Fair crowd)

---

## Before Sending Checklist

- [ ] Blog post published (ideally "What 472 PRs in 11 Weeks Taught Me About AI-Assisted Engineering")
- [ ] LinkedIn profile updated: headline includes "Staff Frontend Engineer | Founder" narrative, about section reflects the Sherpa/WavePoint story
- [ ] robabby.com reflects the current narrative (not consulting-only positioning)
- [ ] Resume PDF updated with Sherpa + Studio entries, formatted for a technical audience
- [ ] WavePoint demo accessible (if they ask to see live product work)
- [ ] Identify warm connection at Linear or investor before cold applying if possible

---

## Rob's Differentiation Stack (Summary)

| Signal | Proof | Linear Relevance |
|--------|-------|-----------------|
| Built the same category of product | Sherpa Studio — project management system for AI-native dev | Direct product overlap with what Linear is expanding into |
| Agentic engineering at scale | 472+ PRs / 11 weeks, solo, with governance | Proves the Agents API is real to him, not theoretical |
| MCP fluency | Working MCP server with 12 composed tools, OAuth, initiative CRUD | They just shipped MCP expansion; he can speak to it technically |
| Deep TypeScript/React | 13 years, 25+ component library, PartySlate through Series B | Core stack match |
| Full-stack product ownership | WavePoint: 6 Apple apps + Next.js web + 82 API routes | Shows he can own the full product surface, not just UI |
| Craftsmanship worldview | Everything — the governance engine, the design systems, the foundation stone | Matches Linear's load-bearing cultural value |
| Flight risk / founder bridge | Has articulated why he wants team-scale impact, not solo-scale | Pre-empts the obvious objection |

---

## Priority Assessment

**8.5/10** — Behind Stripe AI Design Tooling (10/10) in terms of pure fit, but Linear is the most *direct* signal match for what Rob has built. The product overlap is specific and defensible. This is not a standard "I use your product and love it" application — it's "I built the adjacent thing and want to bring that knowledge inside."

**Apply this week.** These roles have been open for a while but can close anytime.

---

## Source Files (This Research Builds On)
- `/home/openclaw/sherpa/.sherpa/research/heartbeat/2026-03-23-1833-linear-deep-dive.md`
- `/home/openclaw/sherpa/.sherpa/research/heartbeat/2026-03-22-0119-linear-cover-letter-draft.md`
- `/home/openclaw/sherpa/.sherpa/research/heartbeat/2026-03-21-2337-sherpa-linear-integration.md`
- `/home/openclaw/sherpa/.sherpa/research/heartbeat/2026-03-21-2249-remote-target-companies.md`
- Linear Integration Directory (scraped live, March 24 2026) — confirms Agents category, MCP ecosystem, Claude/Cursor/Windsurf integrations
