---
name: spike
description: Use when a core assumption is "would this even work?" and the fastest answer is to build a thin slice in one session. Timeboxed feasibility proof, not a prototype.
---

# Spike

One-session feasibility proof. The riskiest assumption gets a thin-slice build to answer one question: does this work or not?

## When to Use

- A technical assumption is untested and load-bearing
- The question is "can X do Y?" not "what should we build?"
- Building a thin slice is faster than more research
- The stake or shape depends on an answer you don't have

## The Protocol

### Step 1: Identify the Riskiest Assumption

Read the initiative's artifacts:

- `docs/initiatives/<slug>/proposal.md`
- `docs/initiatives/<slug>/stake.md` (if exists)
- `docs/initiatives/<slug>/shape.md` (if exists)
- `docs/initiatives/<slug>/research/`

Find the single assumption that, if false, would invalidate the approach. Not the most interesting question — the most dangerous one.

### Step 2: Frame the Question

Write a single sentence:

> **Can [technology/approach] [do the specific thing] [under the specific constraint]?**

Examples:
- "Can SQLite handle 50 concurrent agent writes without deadlocking?"
- "Can shadcn/ui's command palette render 500+ items without visible lag?"
- "Can the MCP server stream partial results before the full response completes?"

If you can't write it as one question, you're spiking too much. Split it.

### Step 3: Set the Timebox

**1 session max.** This is non-negotiable.

If the spike can't answer the question in 1 session, one of these is true:
- The question is too broad — narrow it
- It's not a spike — it's a project. Use `/shape` instead
- The answer requires infrastructure that doesn't exist — that's a separate initiative

### Step 4: Build in a Worktree

Create a worktree for the spike:

```bash
git worktree add .worktrees/spike-<slug> -b spike/<slug>
```

Build the **minimum thing** that answers the question:
- No tests
- No error handling
- No polish
- No abstractions
- Just the thing that proves or disproves the assumption

The spike code is disposable. It will not be merged. Only the findings survive.

### Step 5: Record the Result

Three possible outcomes:

| Result | Meaning |
|--------|---------|
| **Confirmed** | The assumption holds. Evidence supports proceeding. |
| **Refuted** | The assumption is false. The approach needs to change. |
| **Inconclusive** | The spike couldn't definitively answer the question. Document why. |

Capture evidence: benchmarks, screenshots, logs, error messages. The result needs to be verifiable, not "it seemed to work."

### Step 6: Clean Up

1. Write findings to `docs/initiatives/<slug>/spike.md` (on main, not the worktree)
2. Remove the worktree: `git worktree remove .worktrees/spike-<slug>`
3. Delete the branch: `git branch -D spike/<slug>`

Only findings survive. The code is gone.

### Step 7: Write the Spike

Write `docs/initiatives/<slug>/spike.md`:

```yaml
---
spiked: YYYY-MM-DD
question: "Can X do Y?"
result: confirmed | refuted | inconclusive
timebox: 1 session
---
```

Sections:

1. **Question** — the single question, verbatim from Step 2
2. **Approach** — what was built, how it was tested (2-3 paragraphs max)
3. **Evidence** — concrete data: benchmarks, output, logs, screenshots
4. **Result** — confirmed, refuted, or inconclusive, with one-sentence summary
5. **Implications** — what this means for the initiative. If refuted: what changes. If confirmed: what's unblocked.

## Decision Records

If the spike resolves a technical decision, write a decision record to `docs/initiatives/<slug>/decisions/`:

```yaml
---
decision: "Use X for Y based on spike results"
date: YYYY-MM-DD
skill: /spike
alternatives-rejected:
  - "Alternative — refuted by spike evidence"
confidence: high | medium | low
kill-criteria: "Conditions under which to re-spike"
---
```

## Rules

- **One question per spike.** Two questions = two spikes.
- **One session max.** More than one session = it's a project, not a spike.
- **Build, don't research.** If the answer is on the internet, use `/rr`. Spikes are for things you have to try.
- **Disposable code.** Spike code never ships. Don't get attached.
- **Evidence, not vibes.** "It worked" is not a result. Numbers, logs, outputs are results.
- **Clean up immediately.** Worktree removed, branch deleted. Only `spike.md` survives.
- **Inconclusive is a valid result.** Document why it was inconclusive and what would make it conclusive.

## Invocation

**As a skill:** `/spike` or `/spike <initiative-slug>`

**Standalone prompt:**

```
Spike the riskiest assumption for <initiative-name>.
One question, one session, build the minimum thing that answers it.
```
