---
name: premortem
description: Use when an initiative looks solid but hasn't been tested from the failure perspective. Imagines failure, works backward to identify failure modes, mitigations, and kill criteria. Required in the High Stakes playbook before committing significant sessions.
---

# Pre-mortem

Imagine failure, work backward. Set the frame — "this initiative failed" — then systematically enumerate what went wrong, rank by likelihood and severity, and feed mitigations back into the stake. Inspired by Gary Klein's pre-mortem method and Devil's Advocate Architecture.

## When to Use

- Proposal or stake looks solid but hasn't been stress-tested from the failure perspective
- Risk is `structural` or the initiative touches shared artifacts
- Before committing 4+ sessions to an initiative
- The High Stakes playbook calls for it between `/stake` and `/stress-test`

## The Protocol

### Step 1: Read the Initiative

Read everything the initiative has produced:

- `docs/initiatives/<slug>/proposal.md` — what's proposed
- `docs/initiatives/<slug>/stake.md` — committed direction and kill criteria (if exists)
- `docs/initiatives/<slug>/research/` — evidence base
- `docs/initiatives/<slug>/activity.md` — work done so far
- Related initiatives — dependency graph, adjacent decisions

### Step 2: Set the Frame

State the frame explicitly:

> **It's 3 months from now. The `<initiative-name>` initiative failed. It consumed N sessions and delivered nothing usable. What happened?**

This is not a risk assessment. It's a thought experiment where failure is a given. The question is *how*, not *if*.

### Step 3: Dispatch Three Adversarial Lenses

Run three parallel analyses, each arguing from a different failure perspective:

**Technical Failure** — "The architecture didn't hold. What broke?"
- Integration assumptions that turned out wrong
- Scale or performance limits that weren't tested
- Dependencies that changed, broke, or didn't exist
- Technical debt that compounded faster than expected

**Scope Failure** — "We built the wrong thing, or too much of it."
- Features that weren't needed by any real user
- Scope creep that consumed the session budget
- Wrong abstraction level — too generic or too specific
- The shaped solution didn't match the actual problem

**Context Failure** — "The world changed around us."
- Upstream dependencies shipped breaking changes
- A competing approach solved the problem better
- Priorities shifted and the initiative became irrelevant
- An assumption about the ecosystem was wrong

Use the `superpowers:dispatching-parallel-agents` skill to run these concurrently when possible.

### Step 4: Synthesize and Rank

Collect failure modes from all three lenses. For each failure mode:

| Dimension | Question |
|-----------|----------|
| **Likelihood** | How plausible is this? (high / medium / low) |
| **Severity** | If it happens, how bad? (fatal / significant / minor) |
| **Early detection** | What signal would we see first? |
| **Mitigation** | What could we do to reduce likelihood or severity? |
| **Pre-emptive action** | Can we prevent this before starting? |

Rank by likelihood x severity. The top 3-5 failure modes are the ones that matter.

### Step 5: Update the Stake

If `stake.md` exists:

- Add ranked failure modes as new kill criteria
- Flag gaps — failure modes that the stake's existing kill criteria don't cover
- Recommend specific leading indicators to watch

If no stake exists, note the failure modes for when the stake is written.

### Step 6: Write the Pre-mortem

Write `docs/initiatives/<slug>/premortem.md`:

```yaml
---
premortem: YYYY-MM-DD
failure-modes-identified: N
mitigations-added: N
kill-criteria-added: N
---
```

Sections:

1. **Frame** — the failure scenario statement from Step 2
2. **Technical Failures** — from the technical lens, ranked
3. **Scope Failures** — from the scope lens, ranked
4. **Context Failures** — from the context lens, ranked
5. **Ranked Failure Modes** — the combined top 5-7, with likelihood, severity, detection signal, mitigation
6. **Mitigations** — specific actions to reduce risk, each tied to a failure mode
7. **Updates to Stake** — new kill criteria and leading indicators added (or recommended)
8. **Human-Identified Risks** — starts empty. The human fills this during review with team-dynamic, political, or organizational risks that AI can't see.

## Decision Records

Write a decision record to `docs/initiatives/<slug>/decisions/`:

```yaml
---
decision: "Proceed with initiative after pre-mortem — N failure modes identified, N mitigated"
date: YYYY-MM-DD
skill: /premortem
alternatives-rejected:
  - "Kill initiative — failure modes are manageable with mitigations"
confidence: high | medium | low
kill-criteria: "Primary failure mode to watch"
---
```

If the pre-mortem reveals a fatal, unmitigatable failure mode, the decision record should recommend killing the initiative instead.

## Rules

- **Failure is given.** Don't argue whether the initiative will fail. Assume it did. Ask how.
- **Three lenses, not one.** Technical failures are the obvious ones. Scope and context failures are where the real surprises live.
- **Rank, don't list.** An unranked list of 20 risks is useless. The top 5 ranked by likelihood x severity is actionable.
- **Mitigations are specific.** "Be careful" is not a mitigation. "Add a circuit breaker at the API boundary" is.
- **Human-Identified Risks stays empty.** AI systematically enumerates. Humans add the political, team-dynamic, and organizational risks that AI can't see. Don't fill this section — leave space for the human.
- **Kill is a valid outcome.** If the pre-mortem reveals that the initiative's most likely failure mode is also its most severe and unmitigatable, recommend killing it. That's the point.
- **Feed back into the stake.** A pre-mortem that doesn't update kill criteria didn't accomplish anything.

## Invocation

**As a skill:** `/premortem` or `/premortem <initiative-slug>`

**Standalone prompt:**

```
Run a pre-mortem on <initiative-name>.
Assume it failed. Enumerate how, rank by likelihood x severity, and update the stake.
```
