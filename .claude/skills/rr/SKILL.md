---
name: recursive-research
description: Use when starting a new research initiative, deepening an existing one, exploring strategic questions, or when any initiative needs its discovery phase run. Also use when asked to "research", "explore", "investigate", or "go deeper" on a topic.
---

# Recursive Research

## Overview

The discovery engine for Sherpa's initiative system. Each invocation reads prior work, identifies gaps, dispatches parallel research agents, synthesizes findings, and produces proposals for the initiative queue.

**Core cycle:**

1. **Orient** — Read everything that exists. Never repeat documented work.
2. **Focus** — Identify the 3-5 highest-value open questions.
3. **Fan out** — Dispatch parallel subagents, each on an independent vector.
4. **Converge** — Synthesize across vectors. The value is in the cross-cuts.
5. **Propose** — Every cycle must produce at least one actionable proposal.
6. **Seed** — Write the questions that the next cycle should investigate.

## The Protocol

### Step 0: Bootstrap

**NEW initiative** (no `docs/initiatives/<slug>/` exists):

1. Create `docs/initiatives/<slug>/` and `docs/initiatives/<slug>/research/`
2. Create `docs/initiatives/<slug>/activity.md` with `started: YYYY-MM-DD`
3. `proposal.md` will be written in Step 5

**FROM SEED** (invoked with seed file path or `--seed <parent>/<branch>`):

1. Read the seed file. The seed's `relativePath` tells you exactly where it lives (e.g. `docs/initiatives/a/sub-initiatives/b/branches/c.md`)
2. Use the seed's Question as your core research question and Suggested Vectors as starting vectors
3. Create sub-initiative directory **adjacent to the seed's parent** — strip `branches/<slug>.md` from the seed path and append `sub-initiatives/<branch>/` with `research/`. Examples:
   - Seed at `docs/initiatives/parent/branches/child.md` → create `docs/initiatives/parent/sub-initiatives/child/`
   - Seed at `docs/initiatives/a/sub-initiatives/b/branches/c.md` → create `docs/initiatives/a/sub-initiatives/b/sub-initiatives/c/`
4. Update the seed file's frontmatter: `status: launched`, add `sub-initiative: sub-initiatives/<branch>`
5. Continue with Step 1 using the seed's context as orientation

**When the launch prompt includes explicit paths** (e.g. "Seed file:" and "Create sub-initiative at:"), use those paths directly instead of computing them.

**CONTINUING initiative** (directory exists):

When the continue prompt includes an explicit path (e.g. "Continue research: docs/initiatives/a/sub-initiatives/b/"), use that path directly. Otherwise resolve from the slug: `docs/initiatives/<slug>/`.

1. Read `<initiative-path>/proposal.md` for context and status
2. Read EVERY file in `<initiative-path>/research/`
3. Read the README.md "Open Questions" — these are your vectors
4. Update `<initiative-path>/activity.md` with current session activity

### Step 1: Orient

Read broadly before going deep:

- `docs/initiatives/<slug>/research/` — all prior iterations
- `docs/initiatives/<slug>/branches/` — existing seed files (do not duplicate their scope)
- `docs/framework.md` — the seven pillars, three-layer coordination architecture, three entities
- `docs/roadmap.md` — current portfolio status and upcoming work
- Related initiative directories — check `docs/initiatives/` for adjacent research that feeds into or depends on this work
- Any files referenced in prior findings

**The orient rule:** If you find yourself writing something already documented in a prior iteration, you failed to orient. Go deeper, not wider.

**Iteration depth:** Iteration 1 surveys the landscape broadly — map the territory, identify the players, understand the state of the art. Iteration 2 determines whether coverage is sufficient to go deep or whether the landscape still has unexplored regions that need wider investigation. Iteration 3+ should be going deep on specific questions. Don't go narrow on iteration 1; don't stay shallow once you have the map.

### Step 2: Focus

Identify 3-5 research vectors. Each vector must be:

- **Independent** — investigable in parallel without shared state
- **Specific** — a concrete question, not a vague area
- **Gapped** — not already answered in prior work
- **Actionable** — findings could plausibly lead to a proposal

Write vectors before dispatching:

> **Vector N — [Title]:** [Specific question. What we already know. What we need to find out. Why it matters.]

For iteration 1, use the seed questions provided in the invocation prompt.

### Step 3: Fan Out

Dispatch 3-5 subagents IN PARALLEL using the Agent tool. Each agent gets:

- Its specific vector question
- Relevant context from the orient phase (2-3 sentences)
- Instructions to use WebSearch and WebFetch liberally
- The output format below
- Explicit rule: every claim needs a source, no hallucinated data

**Agent prompt template:**

> Research this question: [vector question]
>
> Context: [relevant prior findings]
>
> Find concrete, sourced answers. Use WebSearch and WebFetch liberally. Prefer specific examples over abstract frameworks. Include URLs for every claim. If results are thin, say so honestly — don't pad.
>
> **IMPORTANT: Capture every link.** Your full output will be saved as a permanent research artifact. Include ALL URLs you encounter — even tangentially relevant ones. Future research iterations will mine these links. A URL you skip is a trail that goes cold.
>
> Return:
> - Key discoveries (bulleted, with source URLs inline)
> - Sources (full URLs with one-line descriptions of what each contains)
> - Raw links (flat list of every URL encountered, including ones you didn't fully explore)
> - Implications for [initiative context]
> - Open questions that emerged

### Step 3b: Persist Agent Reports

**Every agent's full output must be saved before synthesis.**

For each returning agent, write the complete raw output to:

`docs/initiatives/<slug>/research/iteration-N/vector-M-<kebab-title>.md`

Use this format:

```markdown
# Vector M: [Title]

**Question:** [The vector question]
**Agent dispatched:** YYYY-MM-DD

## Findings

[Full agent output — every discovery, every detail, unabridged]

## Sources

- [URL](URL) — description of what was found
- [URL](URL) — description of what was found

## Raw Links

[Every URL the agent encountered, even tangentially relevant ones,
as a flat list — these are the breadcrumbs for future iterations]

- URL
- URL

## Implications

[Agent's own assessment of implications]

## Open Questions

[Questions the agent surfaced]
```

**Why:** Agent context is ephemeral — once the synthesis compresses findings, raw detail and links are lost forever. These files are the research archive. Future iterations and humans need the full trail.

### Step 4: Converge

After all agents return AND their reports are saved, synthesize ACROSS vectors:

- What patterns appear in multiple vectors?
- What contradictions emerged?
- What unexpected connections surfaced?
- What is the single most important insight from this iteration?

The synthesis is where the value lives. Individual findings are ingredients; the synthesis is the meal.

### Step 5: Propose

**Every cycle must produce at least one proposal.**

Write or update `docs/initiatives/<slug>/proposal.md` following the initiative convention (`.claude/rules/initiative-convention.md`):

- Frontmatter: status, initiative slug, type, risk, targets
- Summary of what's proposed
- State snapshot of current reality
- Proposed changes with exact content per target artifact
- Rationale grounded in this iteration's research
- Dependencies and review notes

If the proposal already exists, update it — add proposed changes, refine existing ones, strengthen rationale with new evidence.

### Step 6: Seed

Write the iteration to `docs/initiatives/<slug>/research/iteration-N.md`.

Update or create `docs/initiatives/<slug>/research/README.md` with:

- Summary of what this iteration covered
- The 3-5 most important open questions for the next cycle
- Cross-references to related initiatives or research

These open questions are the input for the next invocation's Step 2.

**Branch identification:** During synthesis, look for threads that meet ALL three criteria:

1. **Distinct domain** — the question belongs to a different knowledge area than the parent
2. **Independent pursuit** — it can be researched without blocking or being blocked by the parent
3. **Own lifecycle** — it would benefit from its own iteration sequence rather than being a vector

For each qualifying thread, create a seed file at `docs/initiatives/<slug>/branches/<branch-slug>.md`:

```yaml
---
status: seed
source-iteration: N
spawned-from: <parent-slug>
created: YYYY-MM-DD
priority: high | medium | low
---
```

With sections: `# Title`, `## Context`, `## Question`, `## Suggested Vectors` (numbered), `## Links`.

## Iteration Output Format

The iteration file is the **synthesis layer**. Raw agent reports live alongside it in a subdirectory.

**Directory structure per iteration:**

```
research/
  iteration-N.md                          # Synthesis (this format)
  iteration-N/
    vector-1-<kebab-title>.md             # Full agent report
    vector-2-<kebab-title>.md             # Full agent report
    vector-3-<kebab-title>.md             # Full agent report
```

**Iteration file format:**

```markdown
# Iteration N — YYYY-MM-DD

## What We Already Knew
[2-3 sentence summary of prior iterations. Skip for iteration 1.]

## Research Vectors

### Vector 1: [Title]
**Question:** [What we investigated]
**Full report:** [iteration-N/vector-1-<kebab-title>.md](iteration-N/vector-1-<kebab-title>.md)

**Key discoveries:**
- [Finding with source URL]

**Implications:**
- [Actionable takeaway]

### Vector 2: [Title]
[Same structure...]

## Synthesis
[Cross-cutting patterns, contradictions, connections. Insights no single
vector produced alone.]

## All Sources

[Deduplicated master list of every URL from every vector, grouped by topic.
This is the iteration's complete bibliography.]

### [Topic/Domain]
- [URL](URL) — description
- [URL](URL) — description

### [Topic/Domain]
- [URL](URL) — description

## Proposals Generated
[Proposals written/updated this iteration with one-line summaries.]

## Open Questions for Next Iteration
1. [Question — why it matters]
2. [Question — why it matters]
3. [Question — why it matters]
```

## Deliverables

Research iterations may produce **deliverables** — structured JSON artifacts that render as charts or presentations in Studio. Write them to `docs/initiatives/<slug>/deliverables/`.

### When to Produce

**Charts** (`<slug>-chart.json` with `$schema: "wavepoint/chart@1"`):

- A research vector compares 3+ items quantitatively (market sizes, feature counts, pricing tiers)
- Synthesis reveals a distribution or trend that a table can't convey
- A proposal needs visual evidence to support its case

**Presentations** (`<slug>-deck.json` with `$schema: "wavepoint/deck@1"`):

- An iteration (usually 3+) synthesizes findings worth presenting to a human reviewer
- A proposal changes significantly and needs a walkthrough
- A major research milestone warrants a summary deck

### Chart Spec

```json
{
  "$schema": "wavepoint/chart@1",
  "id": "descriptive-slug",
  "title": "Chart Title",
  "description": "What this shows",
  "created": "YYYY-MM-DD",
  "sourceIteration": 1,
  "chartType": "bar",
  "data": [
    { "name": "Item A", "value": 42 },
    { "name": "Item B", "value": 67 }
  ],
  "series": [
    { "key": "value", "label": "Score", "color": "var(--chart-1)" }
  ],
  "xAxis": { "dataKey": "name" },
  "legend": false
}
```

Chart types: `bar`, `line`, `area`, `pie`, `radar`. Colors: `var(--chart-1)` through `var(--chart-5)` (gold palette). Keep data arrays under 20 items. Prefer bar charts for comparisons, area for trends, radar for multi-axis profiles.

### Deck Spec

```json
{
  "$schema": "wavepoint/deck@1",
  "id": "descriptive-slug",
  "title": "Presentation Title",
  "created": "YYYY-MM-DD",
  "sourceIteration": 3,
  "slides": [
    { "type": "title", "heading": "Title", "subtitle": "Subtitle" },
    { "type": "content", "heading": "Key Findings", "body": "- Finding 1\n- Finding 2" },
    { "type": "chart", "heading": "Data", "chart": { "...chart spec..." } },
    { "type": "split", "heading": "Comparison", "left": { "body": "..." }, "right": { "body": "..." } }
  ]
}
```

Slide types: `title`, `content` (markdown body: bold, bullets, links), `chart` (inline chart spec), `split` (two columns — body or chart per side). Keep decks to 5-12 slides.

### Guidelines

- Deliverables are **autonomous** — produce them when the data warrants it, don't wait for a flag
- Every deliverable needs a descriptive `title` — it may render without surrounding context
- Set `sourceIteration` to tie the deliverable to its research cycle
- Charts summarize; raw data stays in vector reports
- A deck is a synthesis artifact — the narrative should stand alone

## Rules

- **Every claim needs a source.** No hallucinated statistics.
- **Concrete over abstract.** Specific examples beat frameworks.
- **"Actionable" = leads to a concrete next step.** For technical initiatives: buildable within sessions. For business initiatives: a decision, a design, or a plan you can act on.
- **Don't describe what exists** — focus on what could change.
- **1500-3000 words per iteration.** Dense, not padded.
- **WebSearch and WebFetch liberally.** This is a research task.
- **Parallel agents only.** Never run vectors sequentially.
- **Thin results are honest.** Flag gaps for next iteration, don't pad.
- **Never repeat prior iterations.** Repetition = failed orient step.
- **The proposal is not optional.** No proposals = vectors weren't focused enough.
- **Save raw agent reports BEFORE synthesizing.** Step 3b is not optional. Write each agent's full output to its own file immediately. The synthesis in Step 4 compresses — the raw files are the permanent record.
- **Every URL survives.** The iteration file's "All Sources" section is a deduplicated master bibliography. The raw vector files keep every link the agent touched, even tangential ones. A link lost is a research trail gone cold.

## Invocation

**As a skill:** `/rr` or pass the initiative slug: `/rr behavioral-agents`

**From a seed:** `/rr --seed mmo-patterns-for-agents/doi-model`

This reads the seed file at `docs/initiatives/mmo-patterns-for-agents/branches/doi-model.md`, uses its Question and Suggested Vectors as starting input, and creates a sub-initiative directory.

**From a nested seed:** `/rr --seed mmo-patterns-for-agents/game-authority/heartbeat-protocol`

This reads the seed at `docs/initiatives/mmo-patterns-for-agents/sub-initiatives/game-authority/branches/heartbeat-protocol.md` and creates a sub-initiative at `docs/initiatives/mmo-patterns-for-agents/sub-initiatives/game-authority/sub-initiatives/heartbeat-protocol/`.

**As a standalone prompt:**

```
Run recursive research for the <initiative-name> initiative.

Seed questions (if iteration 1):
- [Question 1]
- [Question 2]
- [Question 3]
```
