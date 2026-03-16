---
description: Editorial quality gates for content production
globs:
  - "docs/templates/**"
alwaysApply: false
---

# Content Quality Gates

Before publishing or marking content as complete, evaluate against these criteria. Each is Pass or Needs Work.

## Scorecard

1. **Sourced claims** — All factual claims have a source or are marked as Sherpa's own experience
2. **Headline Test** — No headline could appear in a generic AI consulting pitch deck (see `docs/ux/voice-and-tone.md`)
3. **Depth Test** — A senior engineering leader would find this useful, not just familiar (see `docs/ux/content-guidelines.md`)
4. **Avoid-list clean** — Zero words from the Words We Avoid list
5. **Structure** — Clear H2/H3 hierarchy, answer-first pattern in each section
6. **Evidence separated** — "What we know" vs. "our analysis" are clearly distinguishable
7. **Readability** — Meets target for content type (see `docs/ux/voice-and-tone.md#readability-targets`)
8. **Persona-aligned** — Content speaks to a specific persona's JTBD, not to everyone generically. For external content, check against business personas (`docs/ux/personas.md`). For product/feature work, check against product personas (`docs/ux/product-personas.md`)

## Scoring

3+ items marked Needs Work → content is not ready to publish. Fix and re-evaluate.

## Pipeline Integration

This maps to the Planner/Worker/Judge pipeline: the Judge evaluates content against this scorecard.

- **Worker** uses the scorecard as a checklist during drafting
- **Judge** scores each criterion as Pass or Needs Work and blocks on 3+ failures
