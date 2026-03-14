---
name: stress-test
description: Use when a proposal's rationale rests on assumptions that haven't been empirically tested. Extracts assumptions, classifies confidence, designs falsification tests, and executes what's executable. Inspired by Stanford's POPPER framework.
---

# Stress Test

Systematically falsify assumptions. Extract every assumption the proposal depends on, design a test that would prove each one false, execute what's executable, and report results. Inspired by Stanford's POPPER framework for agentic hypothesis falsification.

## When to Use

- Proposal's rationale rests on assumptions that haven't been empirically tested
- Research evidence is reasoning-by-analogy, not sourced data
- The stake's thesis depends on claims rated "Reasoned" or "Asserted"
- The High Stakes playbook calls for it after `/premortem`

## The Protocol

### Step 1: Read the Evidence Base

Read the initiative's artifacts:

- `docs/initiatives/<slug>/proposal.md` — claims and rationale
- `docs/initiatives/<slug>/stake.md` — thesis and evidence ratings (if exists)
- `docs/initiatives/<slug>/premortem.md` — failure modes (if exists)
- `docs/initiatives/<slug>/research/` — research iterations and sources

### Step 2: Extract Assumptions

Enumerate every assumption the proposal depends on. For each, classify confidence:

| Rating | Definition | Priority |
|--------|-----------|----------|
| **Sourced** | Cited evidence from research — specific data, benchmarks, documentation | Low — already tested |
| **Reasoned** | Logically sound, no direct evidence — analogies, inferences, common sense | Medium — could be wrong |
| **Asserted** | Stated without support — "X is fast", "users will want Y", "this is standard" | High — needs testing |

Focus testing effort on **Asserted** and **Reasoned** assumptions. Sourced assumptions are low priority unless the source is questionable.

### Step 3: Design Falsification Tests

For each testable assumption, design a test that would prove it false:

| Test Type | When to Use | Execution |
|-----------|------------|-----------|
| **Code-testable** | Performance, compatibility, API behavior | Build and run — parallel agents |
| **Research-testable** | Market claims, ecosystem state, best practices | Targeted web research |
| **Human-testable** | User preferences, organizational fit, political feasibility | Flag for human — don't guess |

The test should be designed to **disprove**, not confirm. "Does X work?" is not a falsification test. "What would cause X to fail?" is.

### Step 4: Execute What's Executable

Run code-testable and research-testable tests. Use `superpowers:dispatching-parallel-agents` to run independent tests concurrently.

For each test:
- State the assumption being tested
- Describe the test
- Run it
- Record the result with evidence (not "it worked" — numbers, outputs, error messages)

For human-testable assumptions, document the test design but don't execute. Flag these clearly.

### Step 5: Report Results

For each assumption tested:

| Field | Content |
|-------|---------|
| **Assumption** | What was assumed |
| **Rating** | Sourced / Reasoned / Asserted |
| **Test** | What was done to falsify it |
| **Result** | Confirmed / Refuted / Inconclusive |
| **Evidence** | Concrete data supporting the result |
| **Implications** | What changes if this assumption is wrong |

Group results by outcome: confirmed first, then inconclusive, then refuted. Refuted assumptions get the most attention.

### Step 6: Handle Refuted Assumptions

When an assumption is refuted, there are three responses:

1. **Revise the approach** — update the stake's thesis to account for the new reality
2. **Scope around it** — add the assumption's domain to shape's no-gos
3. **Kill the initiative** — if the assumption is load-bearing and the initiative can't work without it

Don't minimize refuted assumptions. A refuted load-bearing assumption is a valid reason to kill an initiative before investing sessions.

### Step 7: Write the Stress Test

Write `docs/initiatives/<slug>/stress-test.md`:

```yaml
---
stress-tested: YYYY-MM-DD
assumptions-extracted: N
tested: N
confirmed: N
refuted: N
inconclusive: N
human-required: N
---
```

Sections:

1. **Assumptions Inventory** — all extracted assumptions with confidence ratings
2. **Tests Designed** — one entry per testable assumption with test design
3. **Results: Confirmed** — assumptions that held up, with evidence
4. **Results: Refuted** — assumptions that failed, with evidence and implications
5. **Results: Inconclusive** — assumptions where the test couldn't reach a definitive answer
6. **Human-Required** — assumptions that need human judgment, with suggested test approach
7. **Recommended Changes** — specific updates to stake, shape, or proposal based on results

## Decision Records

Write a decision record to `docs/initiatives/<slug>/decisions/`:

```yaml
---
decision: "Proceed after stress-test — N/M assumptions confirmed, K refuted"
date: YYYY-MM-DD
skill: /stress-test
alternatives-rejected:
  - "Refuted assumption: [assumption] — [how to handle]"
confidence: high | medium | low
kill-criteria: "Re-test if [condition changes]"
---
```

## Rules

- **Falsify, don't confirm.** Design tests to disprove assumptions, not validate them. Confirmation bias is the enemy.
- **Asserted assumptions first.** Claims without evidence are the highest priority. Don't waste time re-testing sourced claims.
- **Evidence, not vibes.** "The API seemed fast" is not a result. "The API returned in 45ms for 100 concurrent requests" is.
- **Refuted is valuable.** A refuted assumption before implementation is worth 10x more than discovering it mid-build.
- **Human-testable stays human.** Don't guess at user preferences, organizational politics, or market dynamics. Flag them.
- **Load-bearing matters.** Not all assumptions are equal. A refuted minor assumption is a footnote. A refuted load-bearing assumption is a potential kill.
- **One test per assumption.** Don't over-test. The goal is signal, not exhaustiveness.

## Invocation

**As a skill:** `/stress-test` or `/stress-test <initiative-slug>`

**Standalone prompt:**

```
Stress-test the assumptions behind <initiative-name>.
Extract assumptions, design falsification tests, execute, and report.
```
