# Stripe Presentation Round Prep — Senior Staff Frontend Engineer

**Date:** March 28, 2026
**Context:** Stripe's Staff+ interview includes a presentation round: write a ~1000-word one-pager about a past project, present for 20 min, deep Q&A follows.

---

## Which Project to Present?

### Option A: Sherpa Studio (Recommended ⭐)
**Why:** Maps directly to Stripe's AI-native investments. Shows architectural thinking, cross-cutting design decisions, and the kind of infrastructure reasoning a Senior Staff engineer needs. The "agentic workflow suite" framing demonstrates you're thinking about how AI changes developer experience — exactly what Stripe's Merchant Experience team cares about (they used AI to migrate their entire design system).

### Option B: WavePoint
**Why:** Shows full-stack product delivery — Next.js web app + 6 native Apple apps + MCP server. Better if you want to emphasize shipping velocity and product breadth. Less directly relevant to Stripe's AI investments.

### Recommendation: Lead with Sherpa Studio, reference WavePoint as proof of the framework's output.

---

## One-Pager Outline: Sherpa Studio

### Title
**"Building an Agentic Engineering Workflow Suite: Architecture Decisions for Human-AI Collaboration"**

### The Problem (150 words)
- AI coding tools are powerful individually but create a coordination problem at scale
- Context fragments across conversations, agent definitions, task specs, review gates
- No lifecycle management — context goes stale, agents operate on outdated information
- The edit/build/test loop is fundamentally changing, but the infrastructure around it isn't keeping up
- This isn't a model problem — it's a product engineering and architecture problem

### The Architecture (300 words)
Key decisions to highlight:

1. **Multi-agent dispatch across 9 backends**
   - Why: Different models have different strengths. Routing matters.
   - Decision: Build a dispatch layer that abstracts the backend, letting the workflow define which agent handles what.
   - Tradeoff: Added complexity vs. flexibility. Worth it — models change faster than workflows.

2. **Behavioral agent definitions**
   - Why: Agents need consistent behavior across sessions, not just prompts.
   - Decision: Declarative agent configs (personality, constraints, tool access) that persist across interactions.
   - Tradeoff: More upfront design vs. better reliability. Constraint-based agents produce more predictable output.

3. **Initiative lifecycle engine**
   - Why: Projects aren't single conversations. They have phases, milestones, dependencies.
   - Decision: Built a lifecycle model (draft → active → review → complete) with structured context that degrades gracefully.
   - Tradeoff: Heavier than a flat task list, but essential for multi-week projects.

4. **MCP server for context injection**
   - Why: Agents need structured access to project state, not just file contents.
   - Decision: MCP protocol for exposing initiatives, conventions, and knowledge to any compatible tool (Cursor, Claude Code, etc.).
   - Stripe parallel: This is architecturally similar to what Stripe Apps does for the Dashboard extensibility layer.

### The Proof (200 words)
- Used Sherpa Studio to build WavePoint: Next.js web app + 6 native Apple apps + MCP server
- 472 pull requests merged in 11 weeks, solo
- The velocity wasn't despite the infrastructure investment — it was because of it
- Component systems, monorepo architecture, and agent workflows all compounded
- Key metric: time from "idea" to "merged PR" dropped from hours to minutes for well-defined tasks

### What I'd Do Differently (150 words)
- Context window management was an afterthought — should have been a first-class concern from day one
- Underinvested in observability/tracing for agent decisions early on
- The behavioral agent definitions could be more compositional (mixins vs. monolithic configs)
- If doing it again: start with the lifecycle engine, not the dispatch layer. Coordination matters more than model routing.

### Connection to Stripe (200 words)
- Stripe's Dashboard is a massive cross-cutting surface — exactly the kind of product where AI-assisted development tooling matters most
- The AI-powered design system migration demonstrates Stripe already thinks about AI as infrastructure, not just features
- Merchant Experience team owns the extensibility layer (Stripe Apps) — architectural parallels to MCP server design
- At Senior Staff level, the question isn't "can you use AI?" but "can you design the systems that make AI reliable at scale?"
- That's the question I've spent the last year answering

---

## Presentation Tips (Stripe-Specific)

- **Write it like a Stripe doc.** They have a writing culture — the one-pager should be clear, structured, opinionated. No fluff.
- **Lead with the problem, not the solution.** Stripe engineers respect problem definition.
- **Show tradeoffs.** Every architectural decision should have a "why" and a "what I traded." Senior Staff means you understand the cost of your choices.
- **Be honest about mistakes.** The "what I'd do differently" section matters. It shows growth and self-awareness.
- **Connect to Stripe without forcing it.** The parallels are real — don't oversell them, let the interviewer draw the connections.
- **Practice the 20-minute window.** ~5 min context, ~10 min architecture + proof, ~5 min reflection + Stripe connection. Leave room for Q&A to breathe.
- **Expect deep follow-ups on:** scalability decisions, why MCP over alternatives, how you handled agent reliability/quality, and what "agentic" means in practice vs. hype.
