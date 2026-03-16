---
status: pending
initiative: persona-aware-quality-system
created: 2026-03-16
updated: '2026-03-16'
type: new-skill
risk: additive
targets:
  - docs/agents/scorecards/                                     # (new directory)
  - docs/agents/scorecards/code.md                              # (new file)
  - docs/agents/scorecards/design.md                            # (new file)
  - docs/agents/scorecards/spec.md                              # (new file)
  - docs/agents/scorecards/research.md                          # (new file)
  - docs/agents/roles/judge.md
personas:
  - engineer
  - product-manager
  - designer
dependencies: []
informs:
  - ux-product-personas
spawned-from: ux-product-personas
---

# Persona-Aware Quality System: Scorecard Registry for the Judge

## Summary

Build the quality infrastructure that makes product personas actionable: a scorecard registry for the Judge role — five scorecards selected by artifact type, not author role. This closes the "quality gate gap" identified in the ux-product-personas research — code review is mature, but spec review and design review have no equivalent quality criteria.

## State Snapshot

**What exists:**
- `docs/agents/roles/judge.md` — Judge role definition with generic quality-bar and fail triggers oriented toward code tasks. Evaluates against "task acceptance criteria" but has no artifact-type-specific criteria.
- `.claude/rules/content-quality.md` — Content scorecard (8 criteria, 3+ failures blocks). The only formalized quality scorecard. Scoped to content/docs.
- `.claude/skills/shape/SKILL.md` — Recently updated with evidence grounding and persona awareness.
- No design review skill exists.
- No structured scorecard registry exists — the Judge applies the same generic evaluation regardless of artifact type.

**What the ux-product-personas research produced:**
- Five scorecard definitions with specific criteria, thresholds, and "blocks regardless" items (Code, Design, Spec, Research, Content)
- The principle that artifact type determines scorecard, not author role
- The Medeiros seven-component design critique framework as the basis for `/design-critique`
- Design Review Scorecard (7 criteria) paralleling the Content scorecard

## Proposed Changes

### 1. Scorecard Registry (`docs/agents/scorecards/`)

Four new scorecards as structured markdown files (the existing Content scorecard stays in `.claude/rules/content-quality.md`):

- **`code.md`** — TypeScript types, test coverage, security, convention compliance, architectural alignment. 2+ Needs Work blocks. Security blocks regardless.
- **`design.md`** — Token compliance, WCAG 2.1 AA, information hierarchy, consistency, responsiveness, interaction states, minimalism. 2+ blocks. Accessibility blocks regardless.
- **`spec.md`** — Problem clarity, customer evidence, scope bounded, success metrics, edge cases, rabbit holes, testable criteria, strategic alignment. 3+ blocks. Missing problem/evidence blocks regardless.
- **`research.md`** — Source diversity, bias acknowledgment, methodology transparency, evidence strength, actionability, evidence separation, proposals produced, citations. 3+ blocks. Missing citations/proposals blocks regardless.

Each scorecard follows the same format: numbered criteria, automatable flag per criterion, threshold, "blocks regardless" items.

### 2. Judge Role Update (`docs/agents/roles/judge.md`)

Update the Judge's behavioral constraints to:
- Select the appropriate scorecard based on task-type (code-implementation → Code, design-spec → Design, product-spec → Spec, research → Research, content/general → Content)
- Declare which scorecard was applied in the verdict frontmatter (`scorecard:` field)
- Support dual-scorecard evaluation for cross-cutting artifacts

## Rationale

The ux-product-personas research across 8+ vectors consistently showed that quality gates for non-code artifacts are the primary gap in multi-role AI collaboration systems. Every system that works well for engineers (code review, CI, linting) has no equivalent for PMs (spec review) or Designers (design review). Sherpa's Judge role is positioned to fill this — it just needs artifact-type-aware scorecards.

The scorecard registry is the minimal infrastructure that makes product personas *functional*. Without it, the personas are descriptive but the Judge still evaluates everything the same way.

## Dependencies

None blocking. Soft coordination with `ux-product-personas` (this initiative implements what that one defined).

## Review Notes

**What this is NOT:**
- Not automated linting or CI integration. Scorecards are for the Judge (human or AI reviewer), not for pre-commit hooks.
- Not a full design system. The Design Scorecard evaluates spec completeness, not visual aesthetics.
- Not the `/design-critique` skill — that's a separate initiative.

**Open questions:**
- Should scorecards be structured data (YAML/JSON) or prose (markdown)? Starting with markdown (consistent with content-quality.md) and converting to structured data if Studio needs to render them programmatically.
- Should the Judge's verdict format change, or just add a `scorecard:` field? Minimal change preferred.

**Effort:** 1 session

**Session breakdown:**
- Session 1: Scorecard registry (4 new scorecards) + Judge role update
