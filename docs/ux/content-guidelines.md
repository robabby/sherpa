# Content Guidelines

Specific guidance for AI governance, consulting, and framework content — the material most at risk of drifting into hype or jargon.

---

## AI & Governance Content

*Lead with the problem, follow with the approach*

### Structure for AI Content

1. **What's happening** — The real situation, with specific data where possible
2. **Why it matters** — Concrete consequences, not abstract risks
3. **What we do about it** — The framework, the methodology, the tools
4. **What you can do** — Actionable next steps, invitation to explore

### Do

| Approach | Example |
|----------|---------|
| Lead with specific data | "95% of AI pilots never reach production" |
| Ground claims in evidence | "Research from Anthropic shows that behavioral constraints outperform identity prompts" |
| Name the actual problem | "Agents without governance hallucinate, overspend, and ship unreviewed code" |
| Be concrete about solutions | "Define behavioral constraints in a YAML role file" |

### Don't

| Approach | Problem |
|----------|---------|
| Lead with hype | Sounds like every other AI company |
| Assert outcomes without evidence | "Our framework guarantees 10x productivity" |
| Use jargon as substance | "Leverage synergies in your AI transformation journey" |
| Overclaim significance | "The most important development in AI governance" |

### Example Comparison

**Before (too salesy):**
> Sherpa's revolutionary AI governance platform empowers organizations to unlock the full potential of agentic AI workflows, transforming how enterprises deploy cutting-edge artificial intelligence at scale.

**After (grounded):**
> Sherpa is a governance framework for agentic workflows. It defines behavioral constraints for AI agents, tracks initiatives through a filesystem-based lifecycle, and ships quality guardrails with the code. We built it for our consulting work and open-sourced it.

---

## Consulting Content

*Warm competence — they get it, and they're not trying to sell me*

### The Consulting Voice

Think of how you'd explain your work to a smart friend at dinner. Not a pitch, not a lecture — a conversation between equals.

| Yes | No |
|-----|----|
| "Here's what we've seen work" | "Our proprietary methodology delivers..." |
| "Most teams skip governance — it costs them later" | "Organizations face an unprecedented governance crisis" |
| "We use the same framework with you that we built for ourselves" | "Our world-class consultants bring decades of combined experience" |

### Service Descriptions

Write service descriptions as answers to "What do you actually do?"

- **Yes:** "We run a two-day workshop where your team maps their current AI workflows, identifies governance gaps, and builds a behavioral constraint system they can maintain."
- **No:** "Our AI Literacy Workshop empowers cross-functional stakeholders to develop a comprehensive understanding of artificial intelligence capabilities and governance frameworks."

### Case Studies

Lead with results, then tell the story. Be honest about what was hard.

1. **The situation** — What the organization was dealing with (1-2 sentences)
2. **What we did** — Specific actions, tools used, timeline
3. **What happened** — Measurable results where possible
4. **What was hard** — Honest about friction, trade-offs, surprises

Anonymous case studies are fine. Use descriptive references ("a mid-size SaaS company") not vague ones ("a leading organization").

---

## Framework Documentation

*Clear, practical, scannable*

### The Documentation Voice

Framework docs should read like a good README — direct, example-driven, no filler.

| Yes | No |
|-----|----|
| "Install with `pnpm add @sherpa/studio-core`" | "To begin your Sherpa journey, first install..." |
| "This function returns the initiative lifecycle state" | "This powerful function enables you to..." |
| "Requires Node 20+" | "Please ensure you have the latest version of Node.js installed" |

### Code Examples

- Show the simplest working example first
- Add complexity incrementally
- Use real values, not `foo`/`bar`
- Include the import statement

### Structure for Feature Pages

1. **What it does** — One sentence
2. **Quick start** — Minimal working example
3. **API** — Props, options, return values
4. **Examples** — Real-world usage patterns

---

## Blog / Thought Leadership

*Conversational, specific, earned authority*

### What Makes Good Sherpa Content

- Shares something we actually learned, not something we think sounds smart
- Includes specific data, real examples, or original research
- Says something that not everyone in the industry would say
- Respects the reader's time — if it can be a paragraph, don't make it a post

### Content Hub Topics

| Topic | Register | Focus |
|-------|----------|-------|
| AI Literacy | Educational, grounded | Making AI adoption legible to teams and leaders |
| Agentic Workflows | Technical, practical | How to build and govern agent-based systems |
| Governance Patterns | Analytical, evidence-based | Patterns, anti-patterns, and lessons from real engagements |

### The Depth Test

Before publishing, ask: would a senior engineering leader find this useful? If it only tells them what they already know, go deeper or don't publish.

---

## Symbolic Language Spectrum

A guide for calibrating register across different contexts.

| Context | Register | Example |
|---------|----------|---------|
| Marketing / hero | Warm, confident | "Ship AI workflows you can actually trust." |
| Services overview | Clear, inviting | "We help teams adopt AI with governance built in." |
| Blog post | Conversational, specific | "We ran this on 12 engagements. Here's what we learned." |
| Framework docs | Direct, practical | "Define agent roles in `docs/agents/roles/`." |
| Case study | Honest, results-first | "Pilot failure rate dropped from 80% to 15%." |
| Empty states | Inviting, light | "No initiatives yet. Start with a proposal." |
| Error messages | Functional, calm | "Something went wrong. Your changes weren't saved." |

---

## Review Checklist

Before publishing content, check:

- [ ] Does it pass the Headline Test? (See Voice & Tone)
- [ ] Is it grounded in specifics — data, examples, real experience?
- [ ] Would a smart skeptic find this credible?
- [ ] Would someone considering hiring us find this helpful (not just impressive)?
- [ ] Is it as concise as it can be?
- [ ] Does the language avoid the Words We Avoid list?
- [ ] Is it honest about what we don't know or haven't solved?
- [ ] Does it meet the readability target for its content type?
- [ ] Is it accessible? (See [Accessibility & Inclusion](./accessibility-and-inclusion.md))

---

## Readability

See [Voice & Tone — Readability Targets](./voice-and-tone.md#readability-targets) for grade levels by content type. Quick reference:

- Marketing copy: short sentences, concrete words, Grade 8
- Blog posts: can go deeper but lead each section with the conclusion first (answer-first pattern)
- Framework docs: precision over simplicity, but avoid jargon-as-decoration
- UI text: one idea per message, Grade 6

---

*See also: [Voice & Tone](./voice-and-tone.md) for how we speak, [Design Principles](./design-principles.md) for how we build, [Personas](./personas.md) for who we write for, [Messaging Framework](./messaging-framework.md) for what we say.*
