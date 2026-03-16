# Vector 4: Persona-Aware Quality Gates

**Question:** How should quality criteria vary by role? What does a Judge evaluate differently for a PM's spec vs an engineer's code vs a designer's prototype?
**Agent dispatched:** 2026-03-15

## Findings

### Design Quality Criteria

- Figma community Design QA Checklist: 8 categories — Layout & Spacing, Typography, Color & Styling, Components, Accessibility, Responsiveness, Documentation, Handoff Readiness ([Figma](https://www.figma.com/community/file/1487501775359145058/design-qa-checklist))
- Designlab 10-point critique: Objectives, IA & Hierarchy, Navigation, Visual Design, Labels/Text, Accessibility, Interactions, Responsiveness, Usability Testing, Performance ([Designlab](https://designlab.com/blog/design-critique-checklist-for-ux-designers))
- Nielsen's 10 Usability Heuristics remain the standard ([NN/g](https://www.nngroup.com/articles/ten-usability-heuristics/))
- Shopify Polaris enforces four component gates: performance, accessibility, maintainability, backward compatibility. CI enforces token usage, a11y rules, visual regression ([Polaris](https://polaris-react.shopify.com/contributing/components))

### Product Spec Quality Criteria

- Marty Cagan (SVPG): 5 criteria — full UX coverage, accurate behavior representation, multi-audience communication, accommodation of change, single master representation. Advocates prototypes over prose ([SVPG](https://www.svpg.com/revisiting-the-product-spec/))
- Shape Up: well-shaped work is Rough (room for creativity), Solved (main elements thought through), Bounded (explicit appetite, no-gos, rabbit holes) ([Shape Up](https://basecamp.com/shapeup/1.1-chapter-02))
- Linear: concise specs (1-2 pages) focusing on why/what/how. Quality from brevity-forced clarity ([Linear Method](https://linear.app/method/introduction))

### Research Quality Criteria

- GRADE framework (100+ orgs): rates evidence certainty across 4 levels. 5 downgrading factors (bias, indirectness, inconsistency, imprecision, publication bias) ([GRADE](https://www.gradeworkinggroup.org/))
- Google HEART: Happiness, Engagement, Adoption, Retention, Task Success ([Kerry Rodden](https://kerryrodden.com/heart/))

### Cross-Role Review Patterns

- Auto-Eval Judge (2025): generates evaluation criteria dynamically from task description, then routes factual checks vs. logical checks to different pipelines ([arXiv](https://arxiv.org/html/2508.05508v1))
- Cortex.io: domain-specific scorecards with level-based progression — entities pass all rules at one level before advancing ([Cortex](https://docs.cortex.io/standardize/scorecards/scorecard-examples))
- Key insight: **artifact type determines scorecard, not author role.** An engineer writing docs gets the content scorecard. A PM writing acceptance criteria gets the spec scorecard.

### Automated vs. Human Gates

- Fully automatable: formatting/linting, vulnerability scanning, test execution, token compliance, a11y scanning, readability scores
- Requires human judgment: architectural trade-offs, design pattern appropriateness, strategic fit, taste, cross-team coordination
- Automated tools miss ~22% of real vulnerabilities with 30-60% false positive rates — justifying hybrid workflows ([Augment Code](https://www.augmentcode.com/guides/when-to-use-manual-code-review-over-automation))

### Confidence-Based Routing

- Four tiers: high confidence (local), medium (retrieval-augmented), low (escalate to larger model), very low (human review) ([arXiv](https://arxiv.org/html/2510.01237v1))

## Proposed Scorecard Registry (5 scorecards)

1. **Code Scorecard** — TypeScript types, test coverage, security, convention compliance, architectural alignment. Threshold: 2+ Needs Work blocks.
2. **Design Scorecard** — Token compliance, WCAG AA, information hierarchy, consistency, responsiveness, interaction states, minimalism. Threshold: 2+ blocks; a11y blocks regardless.
3. **Spec Scorecard** — Problem clarity, customer evidence, scope bounded, success metrics, edge cases, rabbit holes, testable criteria, strategic alignment. Threshold: 3+ blocks; missing problem/evidence blocks regardless.
4. **Research Scorecard** — Source diversity, bias acknowledgment, methodology transparency, evidence strength, actionability, evidence separation, proposals produced, citations. Threshold: 3+ blocks; missing citations/proposals blocks regardless.
5. **Content Scorecard** — Existing 8 criteria retained as-is.

Selection logic: artifact type (derived from task-type frontmatter) determines which scorecard the Judge applies.

## Open Questions

1. Should scorecards live as structured data (YAML/JSON in `docs/agents/scorecards/`) or prose in Judge role?
2. How does the Judge evaluate design specs without visual artifacts? (Evaluate specification completeness, not visual result)
3. Weight vs. pass/fail — "blocks regardless" pattern (Shape Up no-gos) vs. weighted criteria?
4. Should the Judge state which scorecard was applied in verdict frontmatter?
