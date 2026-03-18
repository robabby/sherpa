# Self-Documenting System Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a self-documenting system that automatically maintains Sherpa's documentation surface as initiatives complete, using directoturtle structure and provenance metadata.

**Architecture:** Three mechanisms keep docs current: `/integrate` (post-initiative steady-state), `/doc-bootstrap` (history crawl), and drift detection (staleness checks). All documentation carries provenance frontmatter tracking authorship, review state, and freshness. The directoturtle convention provides uniform recursive structure for agent and human navigation.

**Tech Stack:** Markdown with YAML frontmatter, Claude Code skills, git history analysis

---

## Session 1: Foundation (DONE)

Convention rules, /integrate skill, initiative scaffolding. Completed in brainstorming session.

**Artifacts produced:**
- `.claude/rules/directoturtle-convention.md`
- `.claude/rules/provenance-convention.md`
- `.claude/skills/integrate/SKILL.md`
- `docs/initiatives/self-documenting-system/proposal.md`
- `docs/initiatives/self-documenting-system/activity.md`
- `docs/initiatives/self-documenting-system/plan.md` (this file)

## Session 2: /doc-bootstrap Skill

### Task 1: Create /doc-bootstrap skill

**Files:**
- Create: `.claude/skills/doc-bootstrap/SKILL.md`

Write the bootstrap skill with three modes:
- **Bootstrap mode** — crawl integrated initiatives + git history, generate documentation surface
- **Init mode** — generate empty skeleton for new adopters (future `sherpa init` integration)
- **Drift detection mode** — compare `last-verified` dates against recent commits, surface stale docs

The skill should define the two-pass approach:
- Pass 1 (skeleton): directory structure + index.md stubs with frontmatter and one-paragraph summaries
- Pass 2 (depth): fill stubs with synthesized content from initiative artifacts and code

## Session 3: Run Bootstrap

### Task 2: Run bootstrap pass 1 — skeleton

Run `/doc-bootstrap` against Sherpa's history. This produces:

**Files:**
- Create: `docs/architecture/governance-engine/index.md` (stub)
- Create: `docs/architecture/execution-pipeline/index.md` (stub)
- Create: `docs/architecture/behavioral-agent-system/index.md` (stub)
- Create: `docs/architecture/studio-application/index.md` (stub)
- Create: `docs/architecture/executable-conventions/index.md` (stub)
- Create: `docs/architecture/config-as-code/index.md` (stub)
- Create: `docs/architecture/convention-sync/index.md` (stub)
- Create: `docs/decisions/` (directory, populated from initiative decisions)
- Create: `docs/changelog.md` (from initiative completion history)

Human reviews skeleton before proceeding to pass 2.

### Task 3: Run bootstrap pass 2 — depth

For each stub, synthesize full content from:
- Initiative artifacts that touched that domain
- Code in the corresponding packages
- Git history for context on why things are the way they are

All outputs get provenance frontmatter: `authored-by: ai`, `reviewed-by: null`.

### Task 4: Run /integrate on completed initiatives

Process the 5 integrated initiatives in chronological order:
1. parallel-workflow-governance
2. voice-and-tone
3. dispatch-center
4. studio-ux-patterns
5. studio-agent-missions

This validates that `/integrate` works correctly and catches any documentation impact the bootstrap missed.

## Session 4-5: Studio UI

### Task 5: Doc explorer panel

Add a documentation explorer to Studio's sidebar that renders the directoturtle tree. Each node shows its provenance badge (colored indicator based on review state).

### Task 6: Freshness indicators

Calculate freshness from `last-verified` against relevant commit dates:
- Green: verified within last 7 days or no relevant commits since
- Yellow: `reviewed-by: null` (awaiting review)
- Red: `last-verified` older than relevant commits (stale)

### Task 7: Review queue

Filterable list of all docs in awaiting-review state. Actions: approve (sets `reviewed-by: human`), edit, flag for re-generation.

## Session 6-7 (if needed): Polish

### Task 8: Drift detection

Standalone drift detection that can run as part of `/retro` or independently. Compares `last-verified` dates against commits that touched relevant code paths. Produces a staleness report.

### Task 9: sherpa init integration

Wire the bootstrap skeleton mode into the `sherpa init` CLI command so new adopters get the documentation surface scaffolded from day one.

---

## Verification

After each session, verify:
- [ ] All new files have correct provenance frontmatter
- [ ] Banners match frontmatter (auto-generated, not hand-written)
- [ ] `source-initiatives` fields are accurate
- [ ] Directoturtle structure is consistent (every directory has index.md)
- [ ] No content was removed from human-verified docs without flagging
