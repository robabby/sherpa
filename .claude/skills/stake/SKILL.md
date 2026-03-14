---
name: stake
description: Use when research produced multiple viable directions and a commitment is needed, or when risk is high enough to want explicit walk-away conditions before investing sessions.
---

# Stake

Commit to a direction with kill criteria. When research surfaces multiple viable approaches, stake forces the choice — one thesis, explicit alternatives rejected, conditions under which to walk away.

## When to Use

- Research produced 2+ viable directions and no obvious winner
- Risk is `evolutionary` or `structural` and sessions are at stake
- A proposal needs a clear "we believe X because Y" before shaping
- The team is going in circles between options

## The Protocol

### Step 1: Read the Evidence

Read everything the initiative has produced:

- `docs/initiatives/<slug>/proposal.md` — what's proposed
- `docs/initiatives/<slug>/research/` — all iterations and vector reports
- `docs/initiatives/<slug>/activity.md` — work done so far
- Related initiatives — adjacent decisions that constrain this one

### Step 2: Frame Each Option as a Thesis

For each viable direction, write a thesis:

> **Thesis N — [Title]:** We believe [approach] will [outcome] because [evidence from research].

Don't invent options. Pull them from research findings. If there's only one viable direction, the stake is simpler — but still write it. Explicitly stating "we considered no alternatives" is a signal.

### Step 3: Evaluate Each Thesis

For each thesis, assess:

| Dimension | Question |
|-----------|----------|
| **Expected payoff** | What does success look like? How valuable? |
| **Sessions at risk** | How many sessions before we know if it's working? |
| **Leading indicators** | What early signals tell us we're on track? |
| **Kill criteria** | What would prove this direction wrong? |
| **Evidence strength** | Sourced (cited research), Reasoned (logical but unproven), Asserted (stated without support) |

### Step 4: Make the Call

Recommend one thesis. Take a position — a stake without a recommendation is a book report.

Present the recommendation to the human with:
- Why this thesis over the alternatives
- What we're giving up by not choosing the others
- The earliest point at which we'd know if we're wrong

### Step 5: Write the Stake

Write `docs/initiatives/<slug>/stake.md`:

```yaml
---
staked: YYYY-MM-DD
thesis: "One-line thesis statement"
sessions-at-risk: N
kill-criteria-count: N
---
```

Sections:

1. **Thesis** — the chosen direction, fully stated with evidence
2. **Rejected Alternatives** — each alternative with why it was rejected (not "it's worse" — specific reasons)
3. **Leading Indicators** — early signals that validate the direction (checkable within 1-2 sessions)
4. **Kill Criteria** — numbered, specific conditions that trigger a pivot or stop
5. **Review Trigger** — when to revisit this stake (time-based or event-based)

## Decision Records

The stake itself is a decision. Write a decision record to `docs/initiatives/<slug>/decisions/`:

```yaml
---
decision: "Chosen thesis statement"
date: YYYY-MM-DD
skill: /stake
alternatives-rejected:
  - "Thesis N — reason for rejection"
confidence: high | medium | low
kill-criteria: "Primary kill criterion"
---
```

## Rules

- **One thesis wins.** Don't hedge with "we'll try both." That's not a stake.
- **Rejected alternatives get reasons.** "Not chosen" is not a reason. Specific trade-offs are.
- **Evidence strength matters.** A thesis built on assertions is riskier than one built on sourced evidence. Say so.
- **Kill criteria are falsifiable.** "If it doesn't feel right" is not a kill criterion. "If latency exceeds 200ms under load" is.
- **Sessions at risk is honest.** How many sessions could we burn before knowing this was wrong? Don't minimize.
- **The stake is revisitable.** Kill criteria and review triggers exist for a reason. A stake is a commitment, not a marriage.

## Invocation

**As a skill:** `/stake` or `/stake <initiative-slug>`

**Standalone prompt:**

```
Stake the <initiative-name> initiative.
Frame options as theses, evaluate, recommend a direction, define kill criteria.
```
