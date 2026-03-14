---
name: shape
description: Use when an approved proposal needs appetite, scope boundaries, rabbit holes, and no-gos defined before planning begins. The bridge between "we're doing this" and "here's the plan."
---

# Shape

Set appetite and boundaries for an approved initiative. Inspired by Basecamp's Shape Up — appetite is a budget, not an estimate.

## When to Use

- An initiative has been approved but has no plan yet
- You're about to `/plan-tasks` but scope is undefined
- An initiative keeps growing and needs explicit boundaries
- A shaped initiative needs reshaping after new information

## The Protocol

### Step 1: Read the Context

Read broadly before shaping:

- `docs/initiatives/<slug>/proposal.md` — what was approved and why
- `docs/initiatives/<slug>/research/` — all prior research iterations
- `docs/initiatives/<slug>/stake.md` — chosen direction (if `/stake` was run)
- `docs/initiatives/<slug>/activity.md` — what's happened so far
- Related initiative directories — adjacent work that constrains scope

### Step 2: Set Appetite

Appetite is a **budget**, not an estimate. "We'll spend N sessions max" — not "we think it'll take N sessions."

Ask: "How much time is this worth?" not "How long will it take?"

| Risk | Default Appetite |
|------|-----------------|
| `additive` | 1-2 sessions |
| `evolutionary` | 2-3 sessions |
| `structural` | 3-5 sessions |

These are defaults. Override based on the initiative's actual value and risk.

### Step 3: Define the Shaped Solution

Write a **fat-marker sketch** — broad strokes, not details. Describe:

- What the solution does (user-visible behavior or system behavior)
- Key components and how they connect
- Where it plugs into existing architecture

**The level:** Specific enough that a worker knows what to build. Abstract enough that implementation choices remain open. Think "blueprint" not "specification."

### Step 4: Identify Rabbit Holes

Places where a worker could burn sessions without realizing it:

- Complex edge cases that aren't worth solving now
- Attractive-but-unnecessary features adjacent to the real work
- Technical approaches that look simple but have hidden depth
- Integration points with unclear contracts

For each rabbit hole: name it, explain why it's dangerous, and state how to avoid it.

### Step 5: Mark No-Gos

Explicitly out of scope. Not "we'll do it later" — "we're not doing this, period, in this initiative."

No-gos prevent scope creep during implementation. A worker who encounters a no-go knows to stop and check in rather than building it.

### Step 6: Write Kill Criteria

Conditions under which work should stop and the initiative should be reshaped or abandoned:

- "If X takes more than N sessions, stop and reassess"
- "If we discover Y doesn't support Z, pivot to alternative"
- "If the prototype doesn't demonstrate W, kill the initiative"

Kill criteria are checkpoints, not predictions. They give workers permission to stop.

### Step 7: Write the Shape

Write `docs/initiatives/<slug>/shape.md`:

```yaml
---
appetite: N sessions
shaped: YYYY-MM-DD
---
```

Sections:

1. **Appetite** — budget and rationale for the number
2. **Shaped Solution** — fat-marker sketch
3. **Rabbit Holes** — numbered, with avoidance strategy per item
4. **No-Gos** — bulleted, explicit exclusions
5. **Kill Criteria** — numbered, with trigger conditions

### Step 8: Present for Review

Present the shape to the human. Highlight:

- The appetite and why it's right
- The most dangerous rabbit hole
- Any no-gos they might disagree with
- Kill criteria that could trigger early

Wait for feedback before proceeding to `/plan-tasks` or `/design`.

## Decision Records

If the shaping process makes or narrows decisions (e.g., "SQLite not Postgres for this scope"), write a decision record to `docs/initiatives/<slug>/decisions/`:

```yaml
---
decision: "Short description of what was decided"
date: YYYY-MM-DD
skill: /shape
alternatives-rejected:
  - "Alternative — why rejected"
confidence: high | medium | low
kill-criteria: "When to revisit this decision"
---
```

## Rules

- **Appetite is a budget.** Never say "I estimate N sessions." Say "We're spending N sessions max."
- **Fat marker only.** If you're specifying function signatures, you've gone too deep.
- **Rabbit holes are warnings, not tasks.** They tell workers what to avoid, not what to build.
- **No-gos are permanent for this initiative.** If something needs to happen, it's a separate initiative.
- **Kill criteria need triggers.** "If it's not working" is not a kill criterion. "If authentication takes more than 1 session" is.
- **Shape before plan.** `/shape` → `/plan-tasks`, never the reverse.

## Invocation

**As a skill:** `/shape` or `/shape <initiative-slug>`

**Standalone prompt:**

```
Shape the <initiative-name> initiative.
Set appetite, identify rabbit holes, mark no-gos, define kill criteria.
```
