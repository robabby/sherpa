# Post-Research Skill Suite — Design

## Summary

A suite of 9 skills, 3 playbooks, and supporting infrastructure that fills the gap between `/rr` (research/discovery) and `/plan-tasks` (execution dispatch). Informed by Anthropic's internal "docs to demos" process, Stanford's POPPER falsification framework, Gary Klein's pre-mortem method, Basecamp's Shape Up, ThoughtWorks Tech Radar, and Stripe's strategy memos.

## The Problem

The current pipeline is: `/rr` (discover) → `/integration-review` (approve) → `/plan-tasks` (dispatch). This skips decision-making, validation, scoping, and design — activities that the best product organizations treat as distinct, essential steps. Research produces rich findings but there's no structured way to choose directions, test assumptions, scope work, or design solutions before committing sessions.

## Architecture

### Three Layers

```
Playbooks (compositions)     — "which plays, in what order, for this context"
Plays (individual skills)    — "one activity, one artifact, one decision"
Infrastructure (plumbing)    — decision records, self-improvement loop
```

### The Pipeline

```
/rr (discover)
  ├── /stake (choose direction, define kill criteria)
  ├── /premortem (imagine failure, work backward)
  ├── /stress-test (falsify assumptions)
  ├── /radar (classify a landscape)
  ├── /memo (strategic synthesis across initiatives)
  ├── /spike (1-session feasibility proof)
  ├── /shape (set appetite and boundaries)
  ├── /design (architecture + UI prototype)
  └── /plan-tasks (dispatch)

/retro (cross-initiative retrospective — standalone)
```

Not a linear pipeline. Playbooks define which plays to run for a given context.

---

## Playbooks

### Concept

A **Play** is a single skill invocation — atomic, self-contained, produces one artifact.

A **Playbook** is an ordered composition of plays for a given context. Defines which plays to run, in what order, with decision gates between them. Not rigid — plays can be skipped, repeated, or added based on what emerges.

### Three Initial Playbooks

**Fast Track** — additive risk, 1-2 session initiatives

```
/rr → /shape → /plan-tasks
```

Research answered the question. Scope is small. The cost of being wrong is a wasted session, not a wasted quarter.

**Standard** — evolutionary risk, 3-4 session initiatives

```
/rr → /stake → /shape → /design → /plan-tasks
```

Multiple approaches exist or the solution isn't obvious. Commit to a direction, scope it, design it, build it. Add `/spike` if a technical assumption is untested. Add `/radar` if the research surveyed a landscape.

**High Stakes** — structural risk, 5+ session initiatives

```
/rr → /stake → /premortem → /stress-test → /spike → /shape → /design → /plan-tasks
```

Touches shared artifacts, changes architecture, has dependencies. Full validation before committing sessions. The premortem and stress-test may kill the initiative — that's the point.

### Cross-Cutting Plays

Not part of a linear sequence — invoked based on context:

- `/memo` — when the portfolio needs strategic attention, not a single initiative
- `/radar` — when research surveyed a landscape needing classification
- `/retro` — when patterns need surfacing across completed initiatives

### Playbook Selection

The proposal's `risk:` field signals the default:

| Risk | Default Playbook |
|------|-----------------|
| `additive` | Fast Track |
| `evolutionary` | Standard |
| `structural` | High Stakes |

Human override is always available. An additive initiative with an untested assumption gets a `/spike`. A structural initiative with thorough research might skip `/stress-test`.

### Where Playbooks Live

- Skill definitions: `.claude/skills/<skill-name>/SKILL.md`
- Playbook definitions: `.claude/skills/playbooks/` (one file per playbook)
- UI section: `/playbooks` — new first-class section on Studio home page, slotted between Skills and Tasks

---

## Plays (Skills)

### 1. `/shape` — Set appetite, boundaries, rabbit holes, no-gos

**Inspired by:** Basecamp's Shape Up

**When to use:** Approved proposal, no plan yet. About to `/plan-tasks` but scope is undefined.

**Process:**

1. Read proposal, research iterations, activity log
2. Set appetite — sessions budget, not estimate. "We'll spend 3 max."
3. Define shaped solution — fat-marker sketch, not wireframe
4. Identify rabbit holes — where a worker could burn sessions
5. Mark no-gos — explicitly out of scope
6. Write kill criteria — when to stop and reshape

**Output:** `docs/initiatives/<slug>/shape.md`

```yaml
---
appetite: 3 sessions
shaped: YYYY-MM-DD
---
```

Sections: Appetite, Shaped Solution, Rabbit Holes, No-Gos, Kill Criteria.

---

### 2. `/design` — Architecture and UI design before implementation

**When to use:** Shaped initiative needs technical design before tasks are dispatched.

**Process:**

1. Read proposal, shape, research, existing codebase patterns
2. Classify — architecture only, UI only, or both
3. Architecture design (if needed): data models, API endpoints, component tree, integration points → `design.md`
4. UI prototype (if needed): standalone HTML page using shadcn/ui components and app's Tailwind config → `prototype.html`
5. Review checkpoint — present both artifacts for human review

**Output:**

- `docs/initiatives/<slug>/design.md` — architecture decisions, component boundaries, data flow
- `docs/initiatives/<slug>/prototype.html` — living UI prototype (when UI work is involved)

The prototype is a single HTML file. No bundler, no routing, no state management. Answers "does this layout and component choice feel right?"

---

### 3. `/stake` — Commit to a direction with kill criteria

**Inspired by:** Spotify's Think It / Build It / Ship It

**When to use:** Research produced multiple viable directions, or risk is high enough to want explicit walk-away conditions.

**Process:**

1. Read research iterations, proposal, any existing shape
2. Frame each option as a thesis — "We believe [approach] will [outcome] because [evidence]"
3. For each thesis: expected payoff, sessions at risk, leading indicators, kill criteria, evidence strength
4. Make the call — recommend one, present to human
5. Write the stake — chosen thesis, rejected alternatives, active kill criteria

**Output:** `docs/initiatives/<slug>/stake.md`

```yaml
---
staked: YYYY-MM-DD
thesis: "one-line thesis statement"
sessions-at-risk: 3
kill-criteria-count: 2
---
```

Sections: Thesis, Rejected Alternatives, Leading Indicators, Kill Criteria, Review Trigger.

---

### 4. `/spike` — 1-session feasibility proof

**Inspired by:** Google Ventures Design Sprint (validation phase)

**When to use:** Core assumption is "would this even work?" Fastest answer is to build a thin slice.

**Process:**

1. Identify the single riskiest assumption
2. Frame the question — one sentence
3. Set timebox — 1 session max. More than 1 session = it's a project, not a spike.
4. Build the minimum thing that answers the question. No tests, no polish. Worktree.
5. Record result — pass or fail, with evidence
6. Clean up — worktree deleted, only findings survive

**Output:** `docs/initiatives/<slug>/spike.md`

```yaml
---
spiked: YYYY-MM-DD
question: "Can X do Y?"
result: confirmed | refuted | inconclusive
timebox: 1 session
---
```

Sections: Question, Approach, Evidence, Result, Implications.

---

### 5. `/memo` — Strategic synthesis across initiatives

**Inspired by:** Stripe's strategy memos

**When to use:** Portfolio needs attention. 3+ initiatives converging on a strategic question. Roadmap inflection point.

**Process:**

1. Read broadly — roadmap, active proposals, research iterations across initiatives
2. Frame the strategic question — one sentence
3. Gather evidence — pull from across initiatives, cite specific files
4. Present 2-3 options — which initiatives each accelerates/deprioritizes, roadmap implications
5. Recommend — take a position. A memo without a recommendation is a book report.
6. Define what changes — if accepted, what moves?

**Output:** `docs/initiatives/<slug>/memo.md`

```yaml
---
memo: YYYY-MM-DD
question: "Strategic question"
recommendation: "One-line position"
initiatives-referenced:
  - initiative-a
  - initiative-b
---
```

Sections: Strategic Question, Context, Evidence, Options, Recommendation, Roadmap Implications.

---

### 6. `/radar` — Classify a surveyed landscape

**Inspired by:** ThoughtWorks Technology Radar

**When to use:** Research compared 3+ alternatives in the same category. Synthesis says "here are the options" but doesn't say "here's what we're doing about each."

**Process:**

1. Read research iterations, comparison vectors, deliverable charts
2. Define the domain being classified
3. Classify each item into a ring:
   - **Adopt** — use now, evidence supports it
   - **Trial** — promising, spike before committing
   - **Assess** — interesting but unproven, revisit next cycle
   - **Hold** — explicitly not using, document why
4. One paragraph per item: what, which ring, why, evidence
5. Generate radar chart JSON deliverable for Studio

**Output:**

- `docs/initiatives/<slug>/radar.md`
- `docs/initiatives/<slug>/deliverables/<domain>-radar.json`

```yaml
---
radar: YYYY-MM-DD
domain: "Domain being classified"
items-classified: 8
adopt: 2
trial: 3
assess: 2
hold: 1
---
```

Sections: Domain, Classifications (grouped by ring), Sources.

---

### 7. `/premortem` — Imagine failure, work backward

**Inspired by:** Gary Klein's pre-mortem method + Devil's Advocate Architecture

**When to use:** Before committing significant sessions. Proposal or stake looks solid but hasn't been tested from the failure perspective.

**Process:**

1. Read proposal, stake, research, dependency graph
2. Set the frame — "It's 3 months from now. This initiative failed. What happened?"
3. Dispatch 3 adversarial agents in parallel:
   - **Technical failure** — "The architecture didn't hold. What broke?"
   - **Scope failure** — "We built the wrong thing, or too much of it."
   - **Context failure** — "The world changed around us."
4. Synthesize — rank failure modes by likelihood x severity. For each: early detection signal, mitigation or kill action, pre-emptive possibility.
5. Update the stake — add failure modes as kill criteria. Flag gaps.

**Output:** `docs/initiatives/<slug>/premortem.md`

```yaml
---
premortem: YYYY-MM-DD
failure-modes-identified: 7
mitigations-added: 3
kill-criteria-added: 2
---
```

Sections: Frame, Technical Failures, Scope Failures, Context Failures, Ranked Failure Modes, Mitigations, Updates to Stake, Human-Identified Risks (starts empty — human fills during review).

**Klein's insight applied:** AI handles systematic enumeration. Human reviews for team-dynamic and political risks AI can't see.

---

### 8. `/stress-test` — Systematically falsify assumptions

**Inspired by:** Stanford's POPPER framework for agentic hypothesis falsification

**When to use:** Proposal's rationale rests on assumptions that haven't been empirically tested. Especially when research evidence is reasoning-by-analogy, not sourced data.

**Process:**

1. Read proposal, stake, research
2. Extract assumptions — enumerate every assumption the proposal depends on. Confidence rating:
   - **Sourced** — cited evidence from research (low priority)
   - **Reasoned** — logically sound, no direct evidence (medium)
   - **Asserted** — stated without support (high priority)
3. Design falsification tests — what would prove each assumption false?
   - **Code-testable** — benchmark, prototype, spike
   - **Research-testable** — targeted web research
   - **Human-testable** — requires human judgment (flag)
4. Execute what's executable — parallel agents, one test each, pass/fail with evidence
5. Report — per assumption: claim, test, result, evidence, implications if refuted

**Output:** `docs/initiatives/<slug>/stress-test.md`

```yaml
---
stress-tested: YYYY-MM-DD
assumptions-extracted: 8
tested: 5
confirmed: 3
refuted: 1
inconclusive: 1
human-required: 3
---
```

Sections: Assumptions Inventory, Tests Designed, Results (grouped by outcome), Implications, Recommended Changes.

**When an assumption is refuted:** Revise the approach (update stake), scope around it (add to shape's no-gos), or kill the initiative (if load-bearing).

---

### 9. `/retro` — Cross-initiative retrospective

**Inspired by:** Cross-initiative pattern analysis (unexplored frontier in existing tooling)

**Two modes:**

**Directed mode** (primary, 80% case): You bring a thesis, retro tests it.

```
/retro our UI/UX has been drifting, work needs to align with our design system
/retro estimates for MCP initiatives are consistently too low
```

1. Parse the thesis
2. Gather targeted evidence (don't read everything, read what's relevant)
3. Test — one agent argues for, one against
4. Verdict — confirmed, partially confirmed, not supported
5. Recommend changes — convention update, playbook adjustment, skill default

**Survey mode** (quarterly health check): No thesis. Read across the portfolio, surface what you find. Gated at 5+ completed initiatives.

1. Gather all initiative data — activity logs, proposals, stakes, premortems, stress-tests, decision records, git history
2. Dispatch 3 parallel agents: estimation patterns, process patterns, decision patterns
3. Synthesize — patterns with evidence, magnitude, and recommendations
4. Produce calibration updates — concrete changes to skill defaults and conventions

**Output:** `docs/reports/retro-YYYY-MM-DD.md` (reports dir, not inside any initiative)

```yaml
---
retro: YYYY-MM-DD
mode: directed | survey
thesis: "thesis statement"  # directed only
verdict: confirmed | partially-confirmed | not-supported | n/a
initiatives-analyzed: 4
calibration-updates: 2
---
```

Sections: Scope, Findings (per dimension), Calibration Updates, Raw Data Tables.

**The self-improvement loop:** Retro findings flow back into the system. Updated calibration tables, new rabbit holes added to `/shape` templates, new failure modes added to `/premortem` lenses. A retro finding that doesn't change a number, default, or recommendation wasn't actionable enough.

---

## Infrastructure

### Decision Records

Every skill that makes or recommends a decision auto-generates a record in `docs/initiatives/<slug>/decisions/`.

```yaml
---
decision: "Use SQLite over Dolt for agent state"
date: 2026-03-13
skill: /stake
alternatives-rejected:
  - "Dolt — too heavy for single-node deployment"
  - "Plain JSON — no concurrent write safety"
confidence: high
kill-criteria: "If >3 agents deadlock on writes, revisit Dolt"
---
```

Skills that generate decision records: `/stake`, `/shape`, `/memo`, `/premortem`, `/stress-test`, `/radar`.

Decision records are:
- Structured enough for `/retro` to parse
- Queryable by future skill invocations ("has a similar decision been made before?")
- The permanent record of why choices were made

### Self-Improvement Loop

```
Skills produce structured artifacts (decision records, estimates, outcomes)
  → /retro reads across completed initiatives
  → /retro surfaces patterns with evidence
  → Patterns produce calibration updates to skill defaults and conventions
  → Next skill invocation is better calibrated
  → Repeat
```

This turns the skill suite into a learning system. Skills get better with use.

### Playbook UI (`/playbooks`)

New first-class section on the Studio home page, positioned between Skills and Tasks:

```
Skills (what we can do)
  → Playbooks (how we compose skills for this context)
    → Tasks (what's being executed)
```

Home page panel shows:
- Three playbooks as visual cards
- Each card displays play sequence as connected dots/badges
- Active initiative count per playbook
- Click through to full interactive explorer

Full `/playbooks` page:
- Side-by-side comparison of all tracks
- Click any play to see skill definition, trigger conditions, output artifacts
- Initiative tagging — which track each initiative is on
- Cross-cutting plays shown as available-from-anywhere
- Retro calibration updates shown as "recent learnings"

---

## Implementation Plan

**Effort:** 4-6 sessions

**Session 1:** Write the 6 new skill SKILL.md files (shape, stake, spike, memo, radar, design). These are definition files, not code.

**Session 2:** Write the 3 new skill SKILL.md files (premortem, stress-test, retro) + playbook definition files.

**Session 3:** Decision record convention — update initiative convention rules, add `decisions/` directory support to studio-core file tree.

**Session 4:** Playbooks UI — new `/playbooks` route, home page panel, visual playbook cards with play sequences.

**Session 5 (if needed):** Workflow diagram update to reflect the expanded pipeline. Integration with existing initiative lifecycle in Studio.

**Session 6 (if needed):** Retro infrastructure — reading across initiative directories, calibration update format, report generation.

## Research

Full research with sources: `docs/initiatives/post-research-skill-suite/research/`

Key references:
- Anthropic "docs to demos" process — [claude.com/blog](https://claude.com/blog/how-anthropic-teams-use-claude-code)
- POPPER falsification framework — [arXiv:2502.09858](https://arxiv.org/abs/2502.09858)
- Gary Klein on AI pre-mortems — [Psychology Today](https://www.psychologytoday.com/us/blog/seeing-what-others-dont/202504/can-ai-do-pre-mortems-for-us)
- Agent Decision Records — [github.com/me2resh/agent-decision-record](https://github.com/me2resh/agent-decision-record)
- Devil's Advocate Architecture — [Medium](https://medium.com/@jsmith0475/the-devils-advocate-architecture-how-multi-agent-ai-systems-mirror-human-decision-making-9c9e6beb09da)
- CompanyOS on markdown — [adventuresinclaude.ai](https://adventuresinclaude.ai/posts/2026-02-21-running-a-company-on-markdown-files/)
- 46 PM skills collection — [github.com/deanpeters/Product-Manager-Skills](https://github.com/deanpeters/Product-Manager-Skills)
