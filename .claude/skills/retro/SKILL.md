---
name: retro
description: Use when patterns need surfacing across completed initiatives. Two modes — directed (test a thesis) and survey (quarterly health check). Produces calibration updates that feed back into skill defaults and conventions. The self-improvement loop.
---

# Retro

Cross-initiative retrospective. Surface patterns across completed initiatives and turn them into calibration updates that improve skill defaults and conventions. The self-improvement loop that makes the whole suite learn from experience.

## Two Modes

### Directed Mode (80% case)

You bring a thesis. The retro tests it.

```
/retro our UI/UX has been drifting, work needs to align with our design system
/retro estimates for MCP initiatives are consistently too low
/retro we keep reshaping after the first implementation session
```

### Survey Mode (quarterly health check)

No thesis. Read across the portfolio, surface what you find. **Gated at 5+ completed initiatives** — below that threshold, there isn't enough data for pattern detection.

```
/retro survey
```

## The Protocol — Directed Mode

### Step 1: Parse the Thesis

Extract the claim being made. Write it as a falsifiable statement:

> **Thesis:** [Specific claim about a pattern across initiatives]

Examples:
- "Session estimates for initiatives touching MCP infrastructure are consistently 40%+ under actual"
- "UI work done without a prototype.html step requires rework in the following session"
- "Initiatives that skip /stake take longer than those that don't"

### Step 2: Gather Targeted Evidence

Don't read everything. Read what's relevant to the thesis:

- `docs/initiatives/*/activity.md` — session counts, milestones, blockers
- `docs/initiatives/*/proposal.md` — original estimates, risk ratings
- `docs/initiatives/*/stake.md` — committed directions, kill criteria hit or not
- `docs/initiatives/*/decisions/` — decision records across initiatives
- Git history — actual effort and timeline vs. estimates

### Step 3: Test the Thesis

Dispatch two parallel agents:

**For the thesis** — gather evidence that supports the claim. Cite specific initiatives, files, and data points.

**Against the thesis** — gather evidence that contradicts the claim. Look for counter-examples, confounding variables, alternative explanations.

### Step 4: Reach a Verdict

| Verdict | Meaning |
|---------|---------|
| **Confirmed** | Evidence strongly supports the thesis across multiple initiatives |
| **Partially confirmed** | Pattern exists but is weaker or more nuanced than stated |
| **Not supported** | Evidence doesn't support the thesis, or counter-evidence is stronger |

### Step 5: Recommend Changes

A retro finding that doesn't change a number, default, or recommendation wasn't actionable enough.

For each finding, recommend a specific change:

- **Convention update** — modify a `.claude/rules/` file
- **Skill default change** — update a SKILL.md's process or rules
- **Playbook adjustment** — change which plays are required for which risk levels
- **Calibration number** — update session estimates, thresholds, or gates

## The Protocol — Survey Mode

### Step 1: Verify Threshold

Count completed initiatives (status: `integrated` or `archived`). If fewer than 5, decline the survey and explain why.

### Step 2: Gather Broadly

Read across the portfolio:

- `docs/initiatives/*/activity.md` — all activity logs
- `docs/initiatives/*/proposal.md` — all proposals
- `docs/initiatives/*/stake.md` — all stakes
- `docs/initiatives/*/premortem.md` — all pre-mortems
- `docs/initiatives/*/stress-test.md` — all stress tests
- `docs/initiatives/*/decisions/` — all decision records
- Git history — commit patterns, session boundaries

### Step 3: Dispatch Three Pattern Agents

Run three parallel analyses:

**Estimation patterns** — compare estimated vs. actual sessions. Which initiative types are under/over-estimated? What factors correlate with estimate accuracy?

**Process patterns** — which skills were used, skipped, or repeated? Do initiatives that use more of the playbook have better outcomes? Where do initiatives stall?

**Decision patterns** — what kinds of decisions are being made? How often are kill criteria triggered? Are stakes being honored or quietly abandoned?

### Step 4: Synthesize

Combine findings from all three agents. Look for:

- Patterns with evidence — not just one data point
- Magnitude — how big is the effect?
- Actionability — can we change something to improve?

### Step 5: Produce Calibration Updates

For each pattern, produce a concrete update:

```markdown
### Pattern: [description]

**Evidence:** [N initiatives, specific examples]
**Magnitude:** [how big is the effect]
**Recommendation:** [specific change to a specific file]
**Before:** [current default/rule]
**After:** [proposed default/rule]
```

## Output

Write `docs/reports/retro-YYYY-MM-DD.md` (reports directory, not inside any initiative):

```yaml
---
retro: YYYY-MM-DD
mode: directed | survey
thesis: "thesis statement"  # directed only
verdict: confirmed | partially-confirmed | not-supported | n/a
initiatives-analyzed: N
calibration-updates: N
---
```

Sections:

1. **Scope** — which initiatives were analyzed and why
2. **Findings** — per dimension (or per thesis in directed mode), with evidence
3. **Calibration Updates** — concrete changes, each with before/after and the file to modify
4. **Raw Data Tables** — initiative-level data that supports the findings (session counts, estimates vs. actuals, skills used)

## The Self-Improvement Loop

Retro findings flow back into the system:

```
Skills produce structured artifacts (decision records, estimates, outcomes)
  -> /retro reads across completed initiatives
  -> /retro surfaces patterns with evidence
  -> Patterns produce calibration updates to skill defaults and conventions
  -> Next skill invocation is better calibrated
  -> Repeat
```

Examples of calibration updates:
- Update `effort-estimation.md` calibration table with actual data
- Add new rabbit holes to `/shape` based on recurring scope issues
- Add new failure modes to `/premortem` lenses based on actual failures
- Adjust playbook thresholds based on which plays actually prevented problems

## Rules

- **Directed mode needs a thesis.** Don't fish. Start with a claim and test it.
- **Survey mode needs data.** 5+ completed initiatives minimum. Below that, patterns are noise.
- **Evidence, not impressions.** Cite specific initiatives, files, and data points. "It feels like X" is not a finding.
- **Calibration updates are concrete.** "We should estimate better" is not actionable. "Add 1 session to MCP initiatives in the calibration table" is.
- **Two-sided testing in directed mode.** Always argue both for and against the thesis. One-sided analysis is confirmation bias.
- **Retro outputs go to `docs/reports/`, not `docs/initiatives/`.** Retros are cross-cutting — they don't belong to any single initiative.
- **The finding must change something.** A retro finding that doesn't modify a file, default, or recommendation wasn't actionable enough. Push harder or drop it.

## Invocation

**As a skill:** `/retro <thesis>` (directed) or `/retro survey` (survey mode)

**Standalone prompt:**

```
Run a directed retro: <thesis statement>
Test this claim against completed initiatives, reach a verdict, and produce calibration updates.
```
