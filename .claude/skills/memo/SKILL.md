---
name: memo
description: Use when the portfolio needs strategic attention — 3+ initiatives converging on a question, a roadmap inflection point, or a cross-cutting decision that no single initiative can resolve alone.
---

# Memo

Strategic synthesis across initiatives. Frame a question, gather evidence from across the portfolio, present options, and take a position. Inspired by Stripe's strategy memos.

## When to Use

- 3+ initiatives converge on a strategic question
- A roadmap inflection point requires a portfolio-level decision
- Cross-cutting themes emerge that no single initiative owns
- A human asks "what should we do about X?" where X spans initiatives

## The Protocol

### Step 1: Read Broadly

Read across the portfolio, not just one initiative:

- `docs/roadmap.md` — current portfolio status
- `docs/initiatives/` — scan all active proposals and research
- `docs/initiatives/*/activity.md` — what's in flight
- `docs/initiatives/*/stake.md` — committed directions
- `docs/initiatives/*/decisions/` — prior decisions that constrain options

Focus on initiatives that touch the strategic question. Don't read everything — read what's relevant.

### Step 2: Frame the Strategic Question

Write a single sentence:

> **Should we [choice] given [context]?**

Examples:
- "Should we prioritize MCP server extraction over Studio UI given the consulting pipeline needs demos?"
- "Should we adopt a shared design system now or let each initiative evolve independently?"
- "Should we pause new initiatives to consolidate the three in-flight ones?"

If the question doesn't span multiple initiatives, it's not a memo — it's a decision within one initiative.

### Step 3: Gather Evidence

Pull evidence from across initiatives. For each piece of evidence:

- **Cite the source** — exact file path
- **State what it shows** — one sentence
- **Rate its strength** — sourced (data), reasoned (logical), asserted (opinion)

Organize evidence by theme, not by initiative. The memo is about the question, not about individual initiatives.

### Step 4: Present Options

Write 2-3 options. For each:

| Dimension | What to State |
|-----------|--------------|
| **What changes** | Which initiatives accelerate, slow, or stop |
| **What we gain** | Concrete benefits with evidence |
| **What we lose** | Concrete costs and trade-offs |
| **Roadmap impact** | How the portfolio sequence changes |
| **Risk** | What could go wrong with this option |

### Step 5: Recommend

Take a position. A memo without a recommendation is a book report.

State:
- Which option you recommend and why
- The strongest argument against your recommendation
- What would change your mind

### Step 6: Define What Changes

If the recommendation is accepted, what moves?

- Which initiatives change status?
- Which roadmap items shift?
- Which decisions need revisiting?
- What new work gets created?

### Step 7: Write the Memo

Write `docs/initiatives/<slug>/memo.md`:

```yaml
---
memo: YYYY-MM-DD
question: "The strategic question"
recommendation: "One-line position"
initiatives-referenced:
  - initiative-a
  - initiative-b
  - initiative-c
---
```

Sections:

1. **Strategic Question** — the framing from Step 2
2. **Context** — why this question is surfacing now (2-3 paragraphs)
3. **Evidence** — organized by theme, cited with file paths
4. **Options** — 2-3 options with the evaluation table per option
5. **Recommendation** — the position, the counter-argument, the change-my-mind trigger
6. **Roadmap Implications** — concrete changes if accepted

## Decision Records

The memo's recommendation, if accepted, generates a decision record in `docs/initiatives/<slug>/decisions/`:

```yaml
---
decision: "Strategic direction chosen"
date: YYYY-MM-DD
skill: /memo
alternatives-rejected:
  - "Option N — why not chosen"
confidence: high | medium | low
kill-criteria: "When to revisit this strategic direction"
---
```

## Rules

- **Cross-initiative only.** If the question lives inside one initiative, it's a `/stake`, not a `/memo`.
- **Take a position.** Options without a recommendation waste the reader's time.
- **Cite everything.** Every claim links to a file path. No unsupported assertions.
- **Evidence strength matters.** A recommendation built on assertions is weaker than one built on sourced data. Say so.
- **Options are real.** Don't include a strawman option to make your recommendation look better.
- **Roadmap implications are concrete.** "We should think about X" is not an implication. "Initiative Y moves from Q2 to Q3" is.
- **Keep it dense.** 1000-2000 words. A memo that takes 20 minutes to read failed at synthesis.

## Invocation

**As a skill:** `/memo` or `/memo <initiative-slug>`

**Standalone prompt:**

```
Write a strategic memo for <initiative-name>.
Question: <the strategic question spanning multiple initiatives>
```
