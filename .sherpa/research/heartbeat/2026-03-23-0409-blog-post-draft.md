---
title: "Blog Post Full Draft — What 472 PRs in 11 Weeks Taught Me About Agentic Engineering"
date: 2026-03-23
category: heartbeat
trigger: >
  Outline complete (2026-03-22-0019), infrastructure spec complete
  (2026-03-22-2149). The last missing piece is the actual article text. This
  draft is publish-ready pending Rob's review. ~1,850 words. Target publish
  Tuesday/Wednesday before Linear application.
summary: >
  Full first-person article draft, ready to paste into dev.to + adapt for
  LinkedIn carousel. Follows the 7-section beat sheet from the outline exactly.
  Includes frontmatter for the MDX page.mdx file.
---

## Status

Ready for Rob to review + edit. Can be pasted directly into:

1. `app/blog/472-prs-11-weeks/page.mdx` in robabby.com (once blog infrastructure is live)
2. dev.to (cross-post, canonical)
3. LinkedIn article (stripped-down version — see carousel adaptation notes at end)

Word count: ~1,850 words (target was 1,800 — on the money)

---

## MDX Frontmatter (for page.mdx)

```mdx
export const metadata = {
  title: 'What 472 PRs in 11 Weeks Taught Me About Agentic Engineering',
  description: "I shipped 472 PRs across a Next.js web app, 6 native Apple apps, and a custom AI dev tooling suite in 11 weeks — solo. Here's the infrastructure that made it possible.",
}
```

---

## Full Article Draft

---

# What 472 PRs in 11 Weeks Taught Me About Agentic Engineering

In 11 weeks, I shipped 472 PRs across a Next.js web app, 6 native Apple apps, 82 API routes, and a custom AI dev tooling suite. Solo.

You're probably thinking I used Claude Code and vibed it.

I didn't. I built the infrastructure that makes AI-assisted development reliable — and then I proved it works by shipping a real product on it.

---

## The Scope

The product is WavePoint: a full-stack astrology and esoteric platform. The inventory by week 11: a Next.js 16 web app with 82 API routes, 6 native iOS/macOS apps built in Swift and SwiftUI, a custom Swift astronomy engine for ephemeris calculations, 37 server-side computation modules, 111 shared UI primitives, a cross-platform design system, and an MCP server with 12 composed tools.

For context, projects at this scope typically involve teams of 5–10 engineers working for 12–18 months. I had one.

This isn't a demo. WavePoint serves real users in production.

---

## What People Assume

The first thing most engineers assume when they hear these numbers: "He just used AI to generate code."

That assumption is worth examining carefully — because it's both partially right and dangerously misleading.

In February 2026, METR released a study showing that experienced developers were 19% *slower* when using AI coding assistants compared to working without them. This surprised a lot of people. It shouldn't have.

Andrej Karpathy coined the phrase "vibe coding" to describe what happens when you hand control to an AI and accept whatever it produces. It feels fast. The code *looks* like it works. And then, three weeks later, you're debugging something that never should have been written that way.

Vibe coding trades short-term velocity for long-term quality — and the METR numbers capture exactly when that trade becomes negative.

What I built was something different. The speed didn't come from AI generating code faster. It came from infrastructure that made AI-generated code reliable.

---

## System 1: Behavioral Governance

The most important thing I built wasn't a feature. It was a set of behavioral constraints for AI agents.

This sounds abstract, so here's what it means in practice.

Every large codebase has conventions: naming patterns, architectural boundaries, file organization rules, error-handling standards. In a team environment, these are maintained through code review, onboarding, and accumulated institutional knowledge. When you work solo with AI agents, you lose all of that — unless you build it explicitly.

I built a framework called Sherpa that encodes architectural standards as agent constraints. An agent working on the API layer has different permissions and review requirements than one working on UI components. The agent knows it's an API specialist. It has explicit rules about what's in and out of scope, what patterns to follow, and what requires human review before merging.

This isn't a CLAUDE.md file with a few hints. It's behavioral governance: role definitions with constraints, not just identity claims.

The principle I kept coming back to: *if your standards can't be observed in how you operate on an ordinary Tuesday, they aren't standards — they're aspirations*. Governance that only kicks in during crises is decoration.

The result: agents working within governed constraints made significantly fewer architectural errors, produced more consistent code, and required substantially less rework. That's where the velocity compounded.

---

## System 2: Worktree Isolation

The second system was about parallelism without chaos.

Git worktrees let you check out multiple branches of the same repository simultaneously, each in its own directory. This is a standard Git feature that most engineers know exists and few actually use.

I used it as the foundation for running multiple agents in parallel.

Each agent gets its own worktree, tied to a structured initiative. An initiative has a lifecycle: proposal → research → implementation → review. Each phase has different agent permissions. A research agent can read everything but can't open PRs. An implementation agent can write code and create PRs but can't merge them. Human review gates every merge.

This design means agents can work simultaneously on different parts of the codebase without stepping on each other. It also means the review queue is always explicit — you can see exactly what's waiting for human attention and prioritize accordingly.

The insight here is structural: the bottleneck in agentic development isn't AI speed. It's human review. Worktree isolation makes the review queue visible and manageable. Without it, parallel agents create noise. With it, they create throughput.

---

## System 3: MCP Server Design

The third system was the tooling layer.

Most people who build with AI agents give the AI access to everything: a large context window, a filesystem, API keys, and a prompt that says "figure it out." This works fine for simple tasks. For a production system with multiple agents across multiple domains, it introduces too much surface area for error.

I built a purpose-built MCP (Model Context Protocol) server with 12 composed tools, organized around a five-level abstraction ladder. The design was inspired by Stripe's API philosophy: primitive operations compose into higher-level actions, and the interface is designed for the consumer — in this case, an AI agent rather than a human developer.

What this means concretely: an agent working on the WavePoint compute layer doesn't get access to the Swift codebase or the Next.js routes. It gets access to the tools it needs to do its job. The interface is narrow, intentional, and tested.

The difference between "give the AI access to everything" and "design principled interfaces for AI consumption" is the difference between a general-purpose screwdriver and a torque wrench. Both are useful. One is right for the job.

This MCP server — the patterns it established, the problems it solved — became the foundation for Sherpa Studio. I recognized the abstraction layer as a product by week 3. I didn't extract it until week 8. That's probably the thing I'd do differently first.

---

## What I'd Do Differently

Three things.

**Start governance earlier.** The first two weeks were ad-hoc prompting before I built the constraint system. Those weeks produced more rework than the following nine combined. If I were starting over, governance would be week one — not an afterthought when the chaos became obvious.

**Design for the review bottleneck from day one.** Even with worktree isolation and behavioral governance, human review is the true throughput limiter. I got better at batching reviews, prioritizing by risk, and building tooling to surface what needed attention — but this was learned late. It should be designed in.

**Extract the tooling layer sooner.** Sherpa Studio should have been a standalone product by week 4. The pattern was clear, the value was obvious, and building it in parallel would have accelerated WavePoint rather than competing with it. I was too focused on shipping the product to step back and ship the infrastructure.

---

## What This Means for Teams

Here's the thing nobody says out loud about agentic engineering: the leverage isn't in the AI. The leverage is in the infrastructure that governs the AI.

One engineer with the right infrastructure can ship at a velocity that previously required a team. That's not a hypothetical — it's what the numbers above represent. But it's also not magic. It's architecture.

The question worth asking isn't "how do we give our engineers AI tools?" It's "how do we build the infrastructure that makes AI-assisted engineering reliable at our scale?"

Companies that treat AI as a productivity hack will get vibe-coded products: fast to ship, expensive to maintain, impossible to audit. Companies that treat AI as an infrastructure problem will get reliable products at unprecedented velocity.

The METR study found experienced developers 19% slower with AI. That's not a failure of AI — it's a failure of governance. Give engineers AI tools without the infrastructure to govern them, and you've introduced a highly variable lever into a system that needs consistency.

I've built the solo version of this infrastructure. The architecture scales. A team of five engineers working within a governed agentic workflow doesn't get 5× the output of one — it gets more, because parallelism compounds when you've eliminated the coordination overhead.

That's what I want to build next: not the solo proof of concept, but the multiplied version.

---

## What I'm Looking For

I'm available for Staff+ engineering roles where this work is relevant — and for consulting engagements where you want to build the infrastructure before the chaos.

The companies I'm most interested in are the ones treating AI not as a feature to ship, but as an engineering discipline to develop. If your team is asking how to govern AI development at scale, that's a conversation worth having.

**Website:** [robabby.com](https://robabby.com)  
**Consulting:** [sherpa.solar](https://sherpa.solar)  
**LinkedIn:** [linkedin.com/in/robabby](https://linkedin.com/in/robabby)

---

## LinkedIn Carousel Notes

**8-slide adaptation:**

| Slide | Text |
|---|---|
| 1 (Cover) | **472 PRs. 11 Weeks. Solo.** / What I learned about agentic engineering |
| 2 | The scope: Next.js web app + 6 native iOS/macOS apps + 82 API routes + custom MCP server. Solo. Production. Real users. |
| 3 | "You just used AI to generate code." That assumption is both partially right and dangerously misleading. (METR: experienced devs 19% SLOWER with AI when used naively.) |
| 4 | **System 1: Behavioral Governance.** Architectural standards encoded as agent constraints. Not hints — governance. If your standards only show up in a crisis, they're aspirations. |
| 5 | **System 2: Worktree Isolation.** Each agent in its own Git worktree, tied to a structured initiative. The bottleneck isn't AI speed — it's human review. Make it visible. |
| 6 | **System 3: MCP Server Design.** Narrow, intentional interfaces for AI consumption. Design for the consumer. The consumer is an agent, not a human. |
| 7 | What I'd do differently: Start governance in week 1. Design for the review bottleneck from the start. Extract the tooling layer by week 4. |
| 8 (CTA) | The leverage isn't in the AI. It's in the infrastructure that governs the AI. I've built the solo proof. Now I want the multiplied version. → robabby.com |

**Design notes:** Dark background (#0a0a0a or similar), white text. One stat or key phrase per slide — never two sentences on the same slide. No bullet lists on slides.

**Timing:** Post Tuesday or Wednesday 7–9 AM PT for maximum LinkedIn algorithm reach. Hashtags: #AgenticEngineering #SoftwareEngineering #AIEngineering #TypeScript

---

## Sources

- Outline: `.sherpa/research/heartbeat/2026-03-22-0019-blog-post-outline.md`
- Infrastructure spec: `.sherpa/research/heartbeat/2026-03-22-2149-blog-infrastructure-spec.md`
- Content validation: `.sherpa/research/heartbeat/2026-03-21-1920-first-content-piece.md`
- METR study + Karpathy framing: `.sherpa/research/competitive/2026-03-22.md`
- Founder-to-team bridge language: `.sherpa/research/heartbeat/2026-03-21-1850-founder-resume-patterns.md`
