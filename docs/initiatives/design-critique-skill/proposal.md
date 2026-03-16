---
status: pending
initiative: design-critique-skill
created: 2026-03-16
updated: '2026-03-16'
type: new-skill
risk: additive
targets:
  - .claude/skills/design-critique/SKILL.md                    # (new file)
personas:
  - designer
  - engineer
dependencies: []
informs:
  - persona-aware-quality-system
spawned-from: ux-product-personas
---

# `/design-critique`: Structured Design Review Skill

## Summary

Create a `/design-critique` skill for structured evaluation of design output — AI-generated or human-authored. Based on the Medeiros seven-component design critique framework and grounded in the Design Scorecard criteria from the ux-product-personas research. Fills the gap where code has `/review` patterns but design has no equivalent structured review workflow.

## State Snapshot

**What exists:**
- No design-specific review skill. Design review happens ad-hoc — Figma comments, Slack threads, or unstructured conversation.
- `.claude/skills/shape/SKILL.md` — Demonstrates the skill pattern for structured evaluation with criteria and verdicts.
- `docs/ux/product-personas.md` — Designer persona defined as primarily a Judge, with five concrete roles including Quality Gate Owner and AI Output Steward.
- Research in `docs/initiatives/ux-product-personas/research/iteration-2/designer-governance-workflow.md` — Medeiros framework, Figma State of the Designer 2026 findings, hypothesis-driven evaluation patterns.

**What's missing:**
- No structured protocol for reviewing design work against criteria
- No separation of AI-generated vs human-authored elements in review
- No hypothesis-driven evaluation ("what does this design test?") as opposed to aesthetic judgment ("does this look good?")

## Proposed Changes

### `/design-critique` Skill (`.claude/skills/design-critique/SKILL.md`)

A structured review protocol:

1. **Identify the hypothesis** — What is this design trying to achieve? What problem does it solve? Not "does it look good" but "does it accomplish its goal?"
2. **Evaluate against Design Scorecard** — 7 criteria: token compliance, WCAG 2.1 AA, information hierarchy, pattern consistency, responsive behavior, interaction states, minimalism
3. **Separate AI-generated vs human-authored** — When reviewing AI-generated prototypes or components, explicitly distinguish what was generated from what was hand-crafted. Different evaluation standards for each.
4. **Produce structured verdict** — Pass/Needs Work per criterion. Accessibility issues block regardless.
5. **Identify design decisions** — Surface implicit decisions that should be documented as DDRs

Invoked as `/design-critique` or `/design-critique <component-or-file-or-screenshot>`.

## Rationale

The Designer persona's primary mode is Judge — governing visual/UX quality. But without a structured review skill, design governance happens informally. Engineers have code review conventions, PR templates, and linting. Designers need an equivalent structured workflow that produces documented, trackable evaluations.

The Medeiros framework (November 2025) provides the academic foundation: hypothesis-driven evaluation, prompt-as-artifact review, separation of AI and human work. The Design Scorecard from ux-product-personas research provides the criteria.

## Dependencies

None blocking. Soft coordination with `persona-aware-quality-system` — that initiative formalizes the Design Scorecard; this skill uses it. Either can land first.

## Review Notes

**What this is NOT:**
- Not automated visual testing (Chromatic, Storybook). This is for human/AI-assisted review, not CI.
- Not aesthetic judgment. The criteria are functional (accessibility, hierarchy, states), not stylistic.

**Effort:** 1 session

**Session breakdown:**
- Session 1: Write the skill protocol, test against an existing Studio component
