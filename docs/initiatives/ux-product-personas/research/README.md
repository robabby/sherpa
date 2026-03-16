# UX Product Personas — Research

## Status

Two iterations complete. Research phase done — ready for artifact creation.

## Key Findings

1. **Convention-at-creation beats convention-at-review.** Embed governance into creation (forms, templates, smart defaults), not just review.
2. **Same artifacts, role-specific projections.** One truth source, multiple views. Don't create parallel data structures per role.
3. **The tool layer defines the persona.** Which MCP tools, skills, and behavioral roles are loaded determines the experience. `defineConfig()` is the mechanism.
4. **Quality gates for non-code artifacts are unsolved.** Code review is mature. Spec review and design review are not. Sherpa's Judge + scorecard registry can fill this.
5. **PM/Engineer/Designer maps to Planner/Worker/Judge.** The PM scopes and prioritizes (Planner). The Engineer implements (Worker). The Designer governs quality (Judge). Each touches all three modes; their primary mode is distinct.
6. **The Designer governs.** Primary relationship is Judge role — design system compliance, accessibility audits, visual regression, hypothesis-driven critique of AI output. Six artifact types are convention-worthy.
7. **DDRs parallel ADRs.** Design Decision Records have structured formats and statuses mapping to Sherpa's proposal lifecycle.
8. **Marketing is the closest beyond-triad persona.** Content pipelines map to Sherpa's lifecycle. Brand governance functions like linting. 65% of marketing teams have designated AI roles.
9. **DevOps/SRE is an Engineering variant.** Same substrate, different `defineConfig()`.
10. **Executives are consumers, not producers.** A Studio view, not a persona.
11. **Five scorecards for the Judge.** Code, Design, Spec, Research, Content — artifact type determines scorecard, not author role.

## Open Questions (for future initiatives)

1. How should Studio generate forms from governance schemas?
2. What MCP tools does the Designer persona need?
3. How do Figma branches and Sherpa proposals interrelate?
4. What does a Marketing convention set look like?
5. What is the cross-node governance interface?

## Iterations

| # | Date | Vectors | Focus |
|---|------|---------|-------|
| 1 | 2026-03-15 | 4 | Landscape survey: multi-surface products, non-eng AI tools, adoption patterns, convention accessibility |
| 2 | 2026-03-15 | 4 | Deep dive: PM conventions, Designer governance, beyond-triad personas, persona-aware quality gates |
