---
title: >
  Interview Prep — Augment Code's 6-Dimension AI-Native Framework Mapped to Rob
date: 2026-03-21
category: heartbeat
trigger: >
  Queue v2 item #12. Linear application is the top priority. This framework applies to any Staff+ AI-native role interview.
summary: >
  Mapped Rob's experience to Augment Code's 6-dimension AI-native engineering hiring framework (Product Taste, System Judgment, Agent Leverage, Communication, Ownership, Learning Velocity). Rob scores strongly on all 6 with concrete proof points. The framework is becoming the industry standard — Linear's job descriptions use nearly identical language. Ready-to-use talking points for each dimension.
---

## The Framework

Augment Code published "How we hire AI-native engineers now" (March 2026) defining 6 dimensions that matter more than raw coding ability. This is becoming the de facto rubric for AI-native engineering roles — Linear, Stripe, and others use nearly identical language in their JDs.

The core insight: **"As agents get better at implementation, the engineers who create the most leverage are the ones with product taste, architectural judgment, and the ability to direct systems of humans and agents toward the right outcome."**

## Rob's Score Card

### 1. Product & Outcome Taste — "Are we building the right thing?"
**Score: 9/10**

> "As code becomes cheaper to produce, the most expensive mistake is building the wrong thing."

**Rob's proof points:**
- **WavePoint product design:** Didn't just build code — designed the "Modern Mystic" product voice, content architecture, user experience across 7 platforms. Made opinionated product decisions about what to build and why.
- **PartySlate venue page rewrite:** Identified that the UX friction (not traffic) was the bottleneck. Advocated for a full rewrite. 150% increase in venue inquiries proved the product instinct right.
- **Savo UX team:** Ran 50+ user research sessions. Built product decisions on evidence, not opinion. 30% increase in user satisfaction.
- **Sherpa foundation stone:** The consulting practice itself is a product decision — what to build, for whom, and why.

**Interview talking point:** "At PartySlate, I identified that venue inquiry conversion had plateaued despite growing traffic. The problem wasn't technical — it was product. I advocated for a full rewrite of our highest-traffic page around a spatial search model. Inquiries increased 150% in the first month. Shipping code is cheap — shipping the right code is what matters."

### 2. System & Architectural Judgment — "Will this survive production?"
**Score: 9/10**

> "Agents can generate working code, but they are far less reliable at judging whether the system around it is sound."

**Rob's proof points:**
- **WavePoint monorepo architecture:** Next.js web app + 6 native Apple apps + shared TypeScript packages from a single monorepo. This is a non-trivial architectural decision that requires understanding long-term tradeoffs.
- **MCP server design:** Built a 12-tool MCP server following a Stripe-inspired 5-level abstraction ladder. Not auto-generated wrappers — carefully designed interfaces.
- **Sherpa Studio architecture:** 91+ components, governance engine, convention system, config-as-code. Designed to be maintainable and extensible.
- **PartySlate component library:** 25+ reusable modules, TypeScript, accessibility testing, visual regression. Bundle size reduction of 40%.

**Interview talking point:** "For WavePoint, I needed to support a Next.js web app and 6 native Apple apps from a single monorepo — with shared content packages bridging both surfaces. That's an architectural judgment call about where to share code and where to diverge. The MCP server I built follows a 5-level abstraction ladder inspired by Stripe's API design — not because it was the fastest path, but because it needed to survive being used by AI agents that will confidently call the wrong tool if the interface isn't clear."

### 3. Agent Leverage — "Can you turn AI into real engineering throughput?"
**Score: 10/10** ← This is Rob's #1 differentiator

> "They structure problems so agents can execute effectively, guide them when they drift, and validate the results they produce."

**Rob's proof points:**
- **472+ PRs in 11 weeks, solo.** This is the single most concrete proof of agent leverage in any candidate's portfolio.
- **Built the governance infrastructure:** Behavioral constraints, worktree isolation, structured initiative workflows. Not ad-hoc prompting — a system designed for reliable agent output.
- **Built Sherpa Studio:** An entire product for managing agentic workflows. Workforce management, skill orchestration, convention enforcement.
- **Built the WavePoint MCP server:** 12 composed tools for agent consumption. Purpose-designed interfaces.
- **Runs a 24/7 autonomous research operation:** 8 nightly cron agents + heartbeat-driven adaptive research. One human, many agents, shipping at team scale.

**Interview talking point:** "I didn't just use AI tools to ship faster. I built the infrastructure that makes AI-assisted development reliable — behavioral governance, worktree isolation, a custom MCP server — and then proved it works by shipping a full cross-platform product solo in 11 weeks. Then I built Sherpa Studio so other teams could do the same. When I say 'agent leverage,' I mean I designed the system that turns agent output into production-grade code."

### 4. Communication & Collaboration — "Can you communicate intent clearly?"
**Score: 8/10**

> "The fastest teams aren't the ones that code the fastest — they're the ones that reach clarity the fastest."

**Rob's proof points:**
- **Sherpa foundation stone:** A clear, principled articulation of values that governs the entire practice. This is communication as architecture.
- **Savo Front-End Guild:** Founded a bi-weekly knowledge-sharing meeting for all developers. Education + feedback loop.
- **PartySlate cross-functional work:** 6 years working across product, design, and engineering. Led features from requirements through delivery.
- **Mentorship:** Code reviews, pair programming, lunch-and-learns at PartySlate.

**Interview talking point:** "At Savo, I founded the Front-End Guild — a bi-weekly meeting where I taught fundamentals, shared best practices, and gathered feedback on the design system. It lasted for years and became a template for other engineering guilds. I believe the best technical communication creates shared understanding, not just shared documents."

### 5. Ownership & Leadership — "Do you drive outcomes, not just tasks?"
**Score: 9/10**

> "Ownership means removing whatever stands between the team and the outcome."

**Rob's proof points:**
- **Founded two companies.** The ultimate ownership signal — accountable for everything from architecture to deployment to revenue.
- **PartySlate Series A → B:** Joined at 12 people, stayed through Series B. Owned the frontend through 258% YoY revenue growth.
- **WavePoint full-stack ownership:** Payments, auth, CRM, 6 native apps, web app, design system, AI governance — the entire product surface.
- **Sherpa's five pillars:** "Integrity of Process" — how you work reveals what you actually value. This IS ownership as philosophy.

**Interview talking point:** "I built WavePoint end-to-end — not just the frontend, but the payments integration, the auth system, the CRM, the API routes, 6 native apps, and the governance infrastructure. When something needed to exist, I built it. That's what founding teaches you — there's no 'that's not my area' when you own the whole product."

### 6. Learning Velocity & Experimental Mindset — "Can you evolve as fast as the tools?"
**Score: 9/10**

> "Engineers who thrive here experiment constantly, change their workflows quickly, and drop old approaches when better ones show up."

**Rob's proof points:**
- **Went from zero Swift to 6 native apps in 11 weeks.** That's learning velocity in action.
- **Built Sherpa Studio while building WavePoint.** Recognized the tooling gap mid-project and built the solution.
- **Continuous workflow evolution:** Started with ad-hoc Claude Code usage, evolved to governance rules, evolved to MCP server, evolved to Sherpa Studio. Each iteration replaced the last.
- **Adopted OpenClaw:** Built a 24/7 autonomous research and development infrastructure using a new platform — heartbeats, cron jobs, multi-agent coordination.

**Interview talking point:** "I shipped 6 native Swift apps in 11 weeks — and I'd never written Swift before WavePoint. But learning velocity isn't just about picking up languages. It's about recognizing when your workflow is wrong and replacing it fast. I started WavePoint with ad-hoc AI prompting, built governance rules within a week, had a full MCP server within a month, and extracted Sherpa Studio as a product by week eight. Each iteration replaced the last because better approaches kept showing up."

## How to Use This Framework

1. **In cover letters:** Reference one dimension per paragraph. Lead with Agent Leverage (most differentiated) and Product Taste (most valued).
2. **In interviews:** When asked "tell me about a time when..." map your answer to the relevant dimension.
3. **On LinkedIn:** The About section and experience bullets should demonstrate at least 4 of 6 dimensions.
4. **For Linear specifically:** Their JD language maps almost 1:1 to this framework. "Build new user-facing features with beautiful and scalable UI components" = Product Taste + System Judgment. "Redefine best-in-class software development processes" = Agent Leverage + Learning Velocity.

---

## Sources

1. Augment Code — "How we hire AI-native engineers now" (March 2026): https://www.augmentcode.com/blog/how-we-hire-ai-native-engineers-now
2. Augment Code — "The hardest part about going AI-native": https://www.augmentcode.com/blog/hardest-part-about-going-ai-native
3. Linear Sr/Staff Product Engineer JD: https://linear.app/careers/069c4628-88d7-4e4d-b393-c996fc7f3076
4. Nightly competitive research (2026-03-21): Augment Code framework identified as industry-defining
