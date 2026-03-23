---
title: >
  Draft Blog Post Outline — What 472 PRs in 11 Weeks Taught Me About Agentic Engineering
date: 2026-03-22
category: heartbeat
trigger: >
  Queue v2 item #11. This post should go live before the Linear application. Content validation research (2026-03-21-1920) already chose the angle and format.
summary: >
  Full outline for Rob's first published article. 7 sections, ~1800 words target. Opens with the number (attention), pivots to "what people assume vs. what actually happened" (differentiation), then deep dives into the three systems that made it work (governance, isolation, MCP). Closes with the founder-to-team bridge. Includes the opening hook, section-by-section beat sheet, key quotes to include, and a LinkedIn carousel adaptation plan (8 slides).
---

## Article Metadata

- **Title:** What 472 PRs in 11 Weeks Taught Me About Agentic Engineering
- **Target length:** ~1,800 words (7-9 min read)
- **Publish on:** LinkedIn (carousel) + dev.to (full article) simultaneously
- **Canonical:** dev.to (until robabby.com has blog infrastructure)
- **Timing:** Publish Tuesday or Wednesday morning PT for peak LinkedIn engagement
- **Hashtags:** #AgenticEngineering #AIEngineering #TypeScript #React #SoftwareEngineering

---

## Opening Hook (first 3 sentences — these do 80% of the work)

> In 11 weeks, I shipped 472 PRs across a Next.js web app, 6 native Apple apps, 82 API routes, and a custom AI dev tooling suite. Solo.
>
> You're probably thinking I used Claude Code and vibed it.
>
> I didn't. I built the infrastructure that makes AI-assisted development reliable — and then I proved it works by shipping a real product on it.

---

## Section-by-Section Beat Sheet

### 1. The Number (200 words)
**Beat:** Lead with the concrete claim. State the scope. Establish credibility.

- 472 PRs in 11 weeks
- What that included: Next.js 16 web app, 6 native Apple apps (Swift/SwiftUI), 82 API routes, 37 computation modules, 111 primitives, a Swift astronomy engine, a cross-platform design system, and an MCP server
- Solo. No team. One engineer.
- This isn't a side project or a demo — WavePoint is a production platform serving real users

**Key quote to include:** "For context, projects of this scope typically required teams of 5-10 engineers working for 12-18 months." (Adapted from Jeremy Ron King's framing — validated by competitive research)

### 2. What People Assume (250 words)
**Beat:** Name the objection before the reader forms it. Then subvert it.

- "You just used AI to generate code" — the vibe coding assumption
- Why that assumption is wrong and dangerous
- The METR study: AI made experienced developers 19% SLOWER when used naively (cite the Feb 2026 update showing this has improved, but the point stands)
- Andrej Karpathy's distinction: vibe coding = no accountability. Agentic engineering = human owns architecture + quality.
- "The speed came from the infrastructure, not from the AI generating code faster"

### 3. System #1 — Behavioral Governance (350 words)
**Beat:** The most differentiated section. Nobody else is talking about this.

- What "governance" means in practice: behavioral constraints for AI agents, not just a CLAUDE.md file
- Auto-loading rules that enforce architectural standards without manual review of every line
- The Sherpa framework: role definitions with constraints, not identity claims
- Example: an agent working on the API layer has different permissions and review requirements than one working on UI components
- The principle from the foundation stone: "If our principles cannot be observed in how we operate on an ordinary Tuesday, they are not principles"
- **This is the section that differentiates from every other "I shipped fast with AI" post**

### 4. System #2 — Worktree Isolation (250 words)
**Beat:** Technical depth for the engineer audience. Show the architecture.

- Git worktree isolation: each agent works in its own worktree, tied to a structured initiative
- Why this matters: agents can't step on each other's work, and you can run multiple agents in parallel
- The initiative workflow: proposal → research → implementation → review
- Each phase has different agent permissions and governance rules
- Marc Nuri's "async multi-agent parallel development" pattern (cite competitive research) — Rob built the same pattern independently

### 5. System #3 — MCP Server Design (250 words)
**Beat:** The tooling layer. Shows Rob builds infrastructure, not just uses it.

- Purpose-built MCP server with 12 composed tools
- Stripe-inspired 5-level abstraction ladder
- Why this matters: agents that have well-designed interfaces make fewer mistakes and produce more reliable output
- The difference between "give the AI access to everything" and "design principled interfaces for AI consumption"
- This became Sherpa Studio — extracted as a product because the tooling layer is the actual differentiator

### 6. What I'd Do Differently (200 words)
**Beat:** Honesty and self-awareness. This builds trust and differentiates from "everything was perfect" posts.

- Started too late on governance — first two weeks were ad-hoc prompting before building the system
- Underestimated the review bottleneck — even with governance, human review is the true throughput limiter
- Should have extracted Sherpa Studio earlier — recognized the tooling pattern by week 3, didn't extract until week 8
- The METR study insight applies: "AI is a highly variable lever that amplifies velocity in specific contexts while actively degrading performance in others"

### 7. What This Means for Teams (300 words)
**Beat:** Bridge from personal story to industry relevance. This is where hiring managers lean in.

- If one engineer can ship at this velocity with the right infrastructure, what could a team of 5 do?
- The bottleneck isn't "can AI write code" — it's "can you govern AI writing code"
- Companies that treat AI as a productivity hack will get vibe-coded products
- Companies that treat AI as an infrastructure problem will get reliable products at unprecedented velocity
- "I've built the solo version. Now I want the multiplied one." (The founder-to-team bridge from the resume patterns research)
- CTA: link to robabby.com, Sherpa consulting site, and "I'm looking for a role where this compounds inside a team"

---

## LinkedIn Carousel Adaptation (8 slides)

| Slide | Content |
|---|---|
| 1 (Cover) | "472 PRs. 11 Weeks. Solo." + subtitle "What I learned about agentic engineering" |
| 2 | The scope: web app, 6 native apps, 82 API routes, MCP server, dev tooling suite |
| 3 | "This wasn't vibe coding." — Karpathy's distinction, METR study stat |
| 4 | System #1: Behavioral governance — one key insight + visual |
| 5 | System #2: Worktree isolation — parallel agents, initiative lifecycle |
| 6 | System #3: MCP server design — Stripe-inspired abstraction ladder |
| 7 | What I'd do differently — the honest take |
| 8 (CTA) | "I've built the solo version. Now I want the multiplied one." + links |

Design notes: Dark background matching robabby.com aesthetic. Clean typography. One number or key phrase per slide. No walls of text.

---

## Key Data Points to Include

From today's research:
- 472+ PRs in 11 weeks (Rob's numbers)
- METR study: 19% slower → 18% faster (the nuance)
- Augment Code's 6 dimensions (cite as industry validation)
- 91% of C-suite execs admit faking AI knowledge (the reality check)
- Jeremy Ron King: 367K lines in 8 months (the comparable story, cite respectfully)

## Tone Notes

- Confident but not arrogant. Show the work, don't claim genius.
- Specific > vague. Numbers, tool names, architecture decisions.
- Honest about failures (Section 6). This is what separates Rob from the hype crowd.
- Foundation stone voice: "We operate in a landscape where confidence is performed and understanding is faked. We will not participate in that."

---

## Next Steps

1. Rob reviews this outline
2. Draft the full article (~2 hours of writing)
3. Design the LinkedIn carousel (could be a Claude Code task)
4. Publish Tuesday or Wednesday morning PT
5. **Then apply to Linear** — the "Published about your work" preferred qualification is satisfied

---

## Sources

- Content piece validation research: `.sherpa/research/heartbeat/2026-03-21-1920-first-content-piece.md`
- Competitive research (Jeremy Ron King, Karpathy, METR study): `.sherpa/research/competitive/2026-03-21.md`
- Augment Code framework: `.sherpa/research/heartbeat/2026-03-21-2319-augment-interview-prep.md`
- LinkedIn optimization (carousel format, timing): `.sherpa/research/heartbeat/2026-03-21-2026-linkedin-optimization.md`
- Founder resume patterns (founder-to-team bridge): `.sherpa/research/heartbeat/2026-03-21-1850-founder-resume-patterns.md`
