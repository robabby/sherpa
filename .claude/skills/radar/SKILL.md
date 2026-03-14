---
name: radar
description: Use when research compared 3+ alternatives in the same category and findings need classification into Adopt/Trial/Assess/Hold rings. Turns a landscape survey into an actionable technology radar.
---

# Radar

Classify a surveyed landscape into actionable rings. Inspired by the ThoughtWorks Technology Radar — each item gets a ring, a rationale, and evidence.

## When to Use

- Research compared 3+ alternatives in the same category
- Synthesis says "here are the options" but not "here's what we do with each"
- A domain needs a current snapshot of what to use, try, watch, and avoid
- A prior radar needs updating after new research or experience

## The Protocol

### Step 1: Read the Research

Read the research that surveyed the landscape:

- `docs/initiatives/<slug>/research/` — iteration files and vector reports
- `docs/initiatives/<slug>/proposal.md` — what was proposed based on research
- `docs/initiatives/<slug>/deliverables/` — any comparison charts already produced

Identify every item (tool, library, approach, pattern) that was evaluated.

### Step 2: Define the Domain

Write a single sentence describing what's being classified:

> **Domain:** [Category of things being compared]

Examples:
- "Domain: Local LLM inference engines for macOS development"
- "Domain: React component libraries for agentic dashboard UIs"
- "Domain: MCP server frameworks for TypeScript"

### Step 3: Classify Each Item

Assign each item to a ring:

| Ring | Meaning | Action |
|------|---------|--------|
| **Adopt** | Use now. Evidence supports it. Low risk. | Integrate into current work |
| **Trial** | Promising. Spike before committing. | Run `/spike` to validate |
| **Assess** | Interesting but unproven. Revisit next cycle. | Monitor, don't invest |
| **Hold** | Explicitly not using. Document why. | Avoid, redirect if encountered |

### Step 4: Write Classifications

For each item, write one paragraph covering:

1. **What it is** — one sentence
2. **Which ring** — and the movement direction (new, moved in, moved out, unchanged)
3. **Why this ring** — specific evidence from research
4. **Key consideration** — the most important thing to know when deciding whether to use it

Group items by ring: Adopt first, then Trial, Assess, Hold.

### Step 5: Generate Radar Chart Data

Write a JSON deliverable for Studio visualization:

`docs/initiatives/<slug>/deliverables/<domain-slug>-radar.json`

```json
{
  "$schema": "wavepoint/chart@1",
  "id": "<domain-slug>-radar",
  "title": "<Domain> Radar",
  "description": "Technology radar for <domain>",
  "created": "YYYY-MM-DD",
  "sourceIteration": N,
  "chartType": "radar",
  "data": [
    { "name": "Item A", "adopt": 1, "trial": 0, "assess": 0, "hold": 0 },
    { "name": "Item B", "adopt": 0, "trial": 1, "assess": 0, "hold": 0 }
  ],
  "series": [
    { "key": "adopt", "label": "Adopt", "color": "var(--chart-1)" },
    { "key": "trial", "label": "Trial", "color": "var(--chart-2)" },
    { "key": "assess", "label": "Assess", "color": "var(--chart-3)" },
    { "key": "hold", "label": "Hold", "color": "var(--chart-4)" }
  ]
}
```

### Step 6: Write the Radar

Write `docs/initiatives/<slug>/radar.md`:

```yaml
---
radar: YYYY-MM-DD
domain: "Domain being classified"
items-classified: N
adopt: N
trial: N
assess: N
hold: N
---
```

Sections:

1. **Domain** — what's being classified and why now
2. **Adopt** — items to use now, with evidence
3. **Trial** — items to spike, with what to test
4. **Assess** — items to watch, with reassessment triggers
5. **Hold** — items to avoid, with why (not just "it's bad" — specific reasons)
6. **Sources** — links to research iterations that informed classifications

## Decision Records

Each ring assignment is a lightweight decision. Write one record per Adopt or Hold classification to `docs/initiatives/<slug>/decisions/`:

```yaml
---
decision: "Adopt X for Y" | "Hold on X — use Y instead"
date: YYYY-MM-DD
skill: /radar
alternatives-rejected:
  - "Alternative — in Trial/Assess ring because..."
confidence: high | medium | low
kill-criteria: "Reassess when..."
---
```

## Rules

- **Evidence per item.** Every classification cites specific research findings. "I've heard good things" is not evidence.
- **Hold needs reasons.** Hold is not "we didn't pick it." Hold is "we evaluated it and it's wrong for us because X."
- **Trial needs a test.** Every Trial item should say what a spike would test. If you can't define the test, it's Assess.
- **Radars age.** Include a "reassess by" date or trigger. A radar without an expiry is a snapshot pretending to be permanent.
- **Movement matters.** If updating a prior radar, note what moved and why. Movement is signal.
- **Domain must be specific.** "JavaScript frameworks" is too broad. "React metaframeworks for server-first rendering" is right.

## Invocation

**As a skill:** `/radar` or `/radar <initiative-slug>`

**Standalone prompt:**

```
Build a technology radar for <initiative-name>.
Classify the surveyed landscape into Adopt/Trial/Assess/Hold.
```
