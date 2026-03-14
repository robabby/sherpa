---
type: ux-guide
updated: 2026-03-14
version: 0.1
---

# Personas

Three Jobs-to-Be-Done personas. No demographics — just situations, needs, and decision patterns. Common thread: people who value competence over performance.

---

## The Practitioner

| | |
|---|---|
| **Type** | User Persona |
| **JTBD** | When I'm building with AI agents, help me define behavioral constraints and quality gates, so my agents are predictable and my work is auditable. |

**Pain points**
- Agent behavior is unpredictable — identity prompts produce inconsistent results
- No standard way to version, review, or govern agent definitions alongside code
- Existing frameworks focus on orchestration, not governance

**Evaluation criteria:** Works with their stack. Filesystem-native. Doesn't require a platform subscription. Active repo with real commits, not a landing page.

**Objections:** "I can roll my own." "Is this just config files with opinions?" "Will this survive contact with a real codebase?"

**Content that resonates:** README-quality docs, working examples, GitHub discussions, technical blog posts that show the actual implementation. No webinars.

**Path to Sherpa:** Finds the framework via GitHub or a technical post. Tries it on a side project. Adopts it at work. Becomes the internal champion who introduces the Technical Leader.

---

## The Technical Leader

| | |
|---|---|
| **Type** | Buyer Persona |
| **JTBD** | When I'm evaluating agentic workflows, help me govern AI agents without slowing down shipping, so I can maintain engineering velocity while adding AI capabilities. |

**Pain points**
- AI adoption pressure from above, governance responsibility from below
- Every vendor pitches transformation but delivers slide decks
- Needs to prove governance to leadership without creating bureaucracy

**Evaluation criteria:** Ships governance with the code, not as a separate layer. Open source they can inspect. Evidence from real engagements, not case studies written by marketing.

**Objections:** "We don't have bandwidth for another framework." "How is this different from what we'd build internally?" "Consulting means vendor lock-in."

**Content that resonates:** Architecture overviews, integration guides, honest case studies that include what was hard. Concise — they're reading between meetings.

**Path to Sherpa:** Hears about the framework from a Practitioner on their team. Evaluates the repo. Brings in consulting when the org needs help adopting governance at scale. Builds the business case for the Honest Executive.

---

## The Honest Executive

| | |
|---|---|
| **Type** | Buyer Persona |
| **JTBD** | When I'm accountable for AI adoption, help me understand what's real and what's hype, so I can make investment decisions I can defend. |

**Pain points**
- Drowning in AI vendor pitches that all sound the same
- Knows the 91% stat is real — they've been in rooms where nobody understood the AI strategy
- Needs governance they can explain to a board, not just to engineers

**Evaluation criteria:** Candor. Specific data over vague promises. A partner who says "here's what we've seen work" instead of "trust our methodology." Deliverables that stay after the engagement ends.

**Objections:** "Every consultancy says they're different." "We've been burned by transformation projects before." "Why should I trust a small firm?"

**Content that resonates:** Short-form thought leadership grounded in data. Workshop formats they can preview before buying. Anti-hype positioning that matches their own skepticism.

**Path to Sherpa:** Introduced by a Technical Leader with internal credibility. Reads the product positioning. Appreciates that the framework is open source — nothing hidden. Approves consulting engagement because the pitch was honest about scope and limits.

---

## The Journey Between Personas

```
Practitioner                Technical Leader              Honest Executive
discovers framework  --->   evaluates for team   --->     approves engagement
      |                           |                             |
  uses independently         brings in consulting         sees governance results
      |                           |                             |
  becomes champion           builds business case         defends investment to board
```

The Practitioner is the entry point. They find the framework, prove it works, and create internal pull. The Technical Leader converts that pull into an evaluation. The Honest Executive signs off because the pitch respects their intelligence — no hype, no overclaiming, just evidence and a framework they can inspect.

Not every journey follows this sequence. Some executives find us directly through anti-hype content. Some Technical Leaders discover the framework themselves. But the pattern holds: competence earns trust, trust earns adoption.

---

*See also: [Product Positioning](./product-positioning.md) for competitive framing, [Messaging Framework](./messaging-framework.md) for per-persona messaging.*
