---
title: >
  First Content Piece Validation — What Rob Should Publish First
date: 2026-03-21
category: heartbeat
trigger: >
  Queue item #6 (promoted — high value while Claude Code handles site updates). Dangling thread #7 (first blog post). Priority #1 narrative needs amplification beyond owned surfaces.
summary: >
  Rob's first published piece should be a velocity story with specifics — the 472 PRs / 11 weeks narrative with the governance infrastructure angle that differentiates from the flood of "I used AI to ship fast" posts. LinkedIn document/carousel format for maximum reach (596% more engagement than text posts in 2026). Publish simultaneously on LinkedIn + dev.to with canonical to robabby.com. Three content angles evaluated with recommendation.
---

## The Question

What should Rob publish first to establish credibility and drive inbound opportunities?

## Constraints

1. **No blog infrastructure on robabby.com yet** — so first piece needs to go on LinkedIn/dev.to
2. **Should serve the job hunt** — not just thought leadership for its own sake
3. **Needs to differentiate** from the flood of "I used AI to ship fast" posts
4. **Should be publishable this week** — not a months-long content project

## Landscape: What's Getting Traction Right Now

### The "solo founder + AI velocity" story is oversaturated BUT...
- AgentOS Team: "A Day with AI Agents as a Solo Founder" (Medium, Feb 2026)
- Aakash Gupta: "How Solo Founders Are Building $1M+ SaaS Businesses Using Only AI" (Medium, Oct 2025)
- Dev.to: "I Run a Solo Company with AI Agent Departments" (March 2026, 3 weeks ago)
- NxCode: "The One-Person Unicorn" guide (Feb 2026)
- GREY Journal: "How Solo Founders Are Building Million-Dollar Businesses" (March 2026)

**The pattern:** These stories get clicks because they're aspirational. But they're mostly surface-level — "I used Claude/Cursor/Copilot and shipped fast." Very few go deep on the infrastructure that makes it reliable.

### What's NOT being said (the gap Rob can fill)
- **Nobody is talking about governance as infrastructure.** The discourse is "agents are fast" vs. "agents are unreliable." Rob's story is the third position: "agents are reliable when you build the governance layer."
- **Nobody has the specific numbers Rob has** at the Staff+ level. Jeremy Ron King's 367K lines is impressive but is primarily lines of code. Rob's 472+ PRs across web + 6 native apps + a dev tooling product is a different kind of story — it's breadth + depth + infrastructure.
- **Nobody is framing AI dev tooling as a product they built AND used.** The Sherpa Studio angle — "I built the scaffolding, then proved it works by shipping a real product" — is genuinely differentiated.

## Three Content Angles Evaluated

### Option A: "What 472 PRs in 11 Weeks Taught Me About Agentic Engineering"
**Format:** Long-form article (dev.to + LinkedIn)
**Angle:** The velocity story with substance. Lead with the number, then explain what made it possible — not "I used Claude" but "I built governance infrastructure."
**Structure:**
1. The number: 472 PRs, 6 apps, 11 weeks, solo
2. What people assume (AI wrote everything)
3. What actually happened (architecture, governance, review)
4. The 3 systems that made it work (behavioral constraints, worktree isolation, MCP server)
5. What I'd do differently
6. What this means for teams (the consulting bridge)

**Pros:** Specific, defensible, unique. The number is an attention-grabber. The substance differentiates from "I vibed it."
**Cons:** Takes 2-3 hours to write well. Risk of coming across as bragging without the right tone.

**Verdict: ⭐ RECOMMENDED — This is the strongest first piece.**

### Option B: "Why I Built My Own AI Dev Tooling (And Why Your Team Should Too)"
**Format:** LinkedIn document/carousel (5-8 slides) + short-form article
**Angle:** Sherpa Studio as the story. Why off-the-shelf AI tools aren't enough. What governance means in practice.
**Structure:**
1. The problem: AI agents ship code without governance
2. What happens next (chaos, review bottlenecks, trust erosion)
3. What I built: Sherpa Studio overview
4. The 3 layers: behavioral constraints, convention enforcement, workflow orchestration
5. Results: WavePoint as proof
6. CTA: link to Sherpa site / consulting

**Pros:** Positions Rob as a builder of infrastructure, not just a user. Product-marketing angle could attract both employers and clients.
**Cons:** Slightly self-promotional. Less emotionally compelling than Option A.

### Option C: "The Staff Engineer's Guide to Agentic Engineering (From Someone Who Actually Shipped)"
**Format:** Long-form article (dev.to + LinkedIn cross-post)
**Angle:** Opinionated, technical, aimed at senior engineers. "Here's what the discourse gets wrong about AI-assisted development."
**Structure:**
1. What "agentic engineering" actually means (not vibe coding)
2. Why experience matters more, not less, in AI-assisted development
3. The 5 things you need before giving agents autonomy
4. Real examples from WavePoint: what worked, what didn't
5. The METR study nuance (AI slows people down sometimes — here's when)

**Pros:** Thought leadership positioning. Targets the hiring manager audience directly. Engages the Karpathy/Osmani/Willison discourse.
**Cons:** More abstract, harder to make specific without getting long.

## Recommendation

**Publish Option A first, this week.** Then adapt it into an Option B LinkedIn carousel the following week.

### Why Option A wins:
1. **Numbers grab attention.** "472 PRs in 11 weeks" is a concrete, defensible, unusual claim that stops the scroll.
2. **The substance differentiates.** Most velocity posts are "I used AI and shipped fast." Rob's post is "I built governance infrastructure and then shipped fast." That's a fundamentally different and more interesting story.
3. **It serves both audiences.** Hiring managers see competence and velocity. Potential consulting clients see methodology. Engineers see useful patterns.
4. **It has natural virality hooks.** The number. The "what people assume vs. what actually happened" structure. The METR study counterpoint.
5. **It positions Rob exactly where the research says he should be** — at the intersection of "agentic engineering" discourse and Staff-level architectural judgment.

### Publishing Strategy

**Simultaneously publish on:**
1. **LinkedIn** — as a document/carousel post (the nightly content-strategy research confirmed these get up to 596% more engagement than text). Design a 6-8 slide version with the key points and numbers as visual cards.
2. **dev.to** — as a full article. Dev.to is the best platform for quick developer community feedback and has strong SEO.
3. **robabby.com** — set as the canonical URL once blog infrastructure exists. For now, the dev.to version serves as the long-form canonical.

**Timing:** Publish Tuesday or Wednesday morning (PT). LinkedIn engagement peaks midweek for professional/technical content.

**Engagement plan:** After publishing, actively engage in the comments. Share in relevant communities (Latent Space Discord, AI Tinkerers Slack if applicable, relevant Hacker News thread if one exists).

### Draft Title Options (ranked)

1. "What 472 PRs in 11 Weeks Taught Me About Agentic Engineering" — specific, provocative, searchable
2. "I Shipped 6 Native Apps and a Web Platform in 11 Weeks. Here's What Actually Made It Possible." — longer, more descriptive, LinkedIn-optimized
3. "The Part Nobody Talks About: Governance Infrastructure for AI-Assisted Development" — positions the gap, less clickable

### Draft Opening Hook

> In 11 weeks, I shipped 472 PRs across a Next.js web app, 6 native Apple apps, 82 API routes, and a custom AI dev tooling suite. Solo.
>
> You're probably thinking: "Cool, so you used Claude Code and vibed it."
>
> No. I built the infrastructure that makes AI-assisted development reliable — and then I proved it works by shipping a real product on it.

## Next Steps

1. Rob reviews and picks an angle
2. Draft the full article (~1500-2000 words)
3. Design the LinkedIn carousel version (6-8 slides)
4. Publish midweek
5. Track engagement and iterate

---

## Sources

1. Business Insider — Software engineer got job at LinkedIn by posting on LinkedIn (Nov 2025): https://www.businessinsider.com/how-software-engineer-built-career-job-posting-linkedin-2025-11
2. Jeremy Ron King — Year in Review agentic engineer post: https://jeremyronking.com/blog/2025/30-year-in-review-evolution-of-an-agentic-engineer
3. AgentOS Team — "A Day with AI Agents as a Solo Founder" (Medium, Feb 2026): https://medium.com/@agentos.dev/a-day-with-ai-agents-as-a-solo-founder-056b0d0c307a
4. Dev.to — "I Run a Solo Company with AI Agent Departments" (March 2026): https://dev.to/setas/i-run-a-solo-company-with-ai-agent-departments-50nf
5. NxCode — One-Person Unicorn guide (Feb 2026): https://www.nxcode.io/resources/news/one-person-unicorn-context-engineering-solo-founder-guide-2026
6. Nightly content-strategy research (2026-03-21): LinkedIn document/carousel 596% more engagement; dev.to best for fast feedback
7. Nightly competitive research (2026-03-21): discourse landscape, Karpathy/Osmani/Willison positioning
