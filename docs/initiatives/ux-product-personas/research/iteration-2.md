# Iteration 2 — 2026-03-15

## What We Already Knew

Iteration 1 established four patterns: convention-at-creation beats convention-at-review, same artifacts with role-specific projections, the tool layer defines the persona, and quality gates for non-code artifacts are unsolved whitespace. This iteration goes deep on what each role's conventions and quality gates actually look like.

## Findings

### Vector 1: PM Workflow Conventions
**Question:** What does a PM's convention set look like concretely?
**Full report:** [iteration-2/pm-convention-workflow.md](iteration-2/pm-convention-workflow.md)

- Six PM-specific artifact types are convention-worthy: Product Brief/Pitch, Product Decision Record (PDR), Customer Evidence Summary, Scope Boundary Document, Stakeholder Update, Prioritization Scorecard.
- The PM's primary role maps to Planner in the Planner/Worker/Judge triad. Engineers = Workers (code quality), Designers = Judges (visual/UX quality), PMs = Planners (scope & investment).
- AI-assisted PM workflows by adoption tier: (1) feedback synthesis (highest value — "two days to 15 minutes"), (2) document scaffolding, (3) status generation.
- Shape Up's rough/solved/bounded test + Kevin Yien's staged PRD provide the PM quality framework. Decision stages (Draft → Problem Review → Solution Review → Launch Review → Launched) map to a `decision-stage` frontmatter field.

**Implications:** Extend `proposal.md` with PM-specific frontmatter (appetite, success-metrics, no-gos, decision-stage) rather than creating new artifact types. The `/shape` skill is the PM equivalent of `/rr`. Stakeholder updates are the first full-AI-generation candidate.

### Vector 2: Designer Governance Workflow
**Question:** What does a Designer actually do in a convention-driven system?
**Full report:** [iteration-2/designer-governance-workflow.md](iteration-2/designer-governance-workflow.md)

- Six design artifact types are convention-worthy: design tokens (W3C JSON spec), Design Decision Records (DDRs), component specifications, accessibility audit reports, UX research reports, design rationale documents.
- The Designer's primary relationship to Sherpa is through the Judge role. AI redistributes work away from production, toward decision-making, critique, and alignment.
- Five concrete Designer roles: Design System Governor, Quality Gate Owner (Judge), Specification Author, Research Synthesizer, AI Output Steward.
- DDRs parallel ADRs: 9-section template with Proposed/Accepted/Rejected/Superseded statuses.

**Implications:** The Designer persona is the quality governor. A Design Review Scorecard (7 criteria) and `/design-critique` skill are concrete deliverables.

### Vector 3: Beyond Eng/PM/Design
**Question:** What other roles are close enough to include in the initial persona set?
**Full report:** [iteration-2/beyond-eng-pm-design-personas.md](iteration-2/beyond-eng-pm-design-personas.md)

- **Marketing is #1 closest.** 65% have designated AI roles. Content pipelines map directly to Sherpa's lifecycle. Brand governance functions like linting.
- **DevOps/SRE is an Engineering variant**, not a separate persona. Different `defineConfig()`, same substrate.
- **Executives are consumers, not producers.** A Studio view, not a persona.
- **Legal is a cross-node governance partner** — produces policies others consume.
- **Sales, Finance, HR need separate research cycles.** Different substrates.

**Implications:** Start with Eng/PM/Design. Marketing is second-wave. Executive is a view. DevOps is a config variant.

### Vector 4: Persona-Aware Quality Gates
**Question:** How should quality criteria vary by role?
**Full report:** [iteration-2/vector-4-persona-aware-quality-gates.md](iteration-2/vector-4-persona-aware-quality-gates.md)

- **Artifact type determines scorecard, not author role.** An engineer writing docs gets the content scorecard.
- Five scorecards proposed: Code, Design, Spec, Research, Content (existing).
- "Blocks regardless" pattern (Shape Up no-gos) simpler than weighted scoring.
- Automated pre-screening for mechanical checks; human judgment for taste criteria.
- Confidence-based routing: high confidence → auto-approve, low → human escalation.

**Implications:** The Judge needs a scorecard registry. Verdict frontmatter should declare which scorecard was applied.

## Synthesis

Three insights emerged from the intersection of all four vectors:

**1. The Planner/Worker/Judge triad maps to PM/Engineer/Designer.** This wasn't designed — it emerged from research. The PM's highest-leverage activity is scoping and prioritizing (Planner). The Engineer's is implementing (Worker). The Designer's is governing quality (Judge). Each touches all three modes, but their primary mode is distinct. Sherpa's existing pipeline doesn't need restructuring — it needs role-aware configuration that emphasizes each persona's primary mode.

**2. Convention sets are concrete and buildable.** We now have specific artifact types, frontmatter fields, quality scorecards, and skill candidates for each persona:
- **Engineer:** Code tasks, implementation reviews, Code Scorecard, existing skills
- **PM:** Product Briefs (extended proposals), PDRs, Customer Evidence, Scope Boundaries. Spec Scorecard. New skills: `/shape`
- **Designer:** DDRs, Component Specs, Accessibility Audits, Design Tokens. Design Scorecard. New skill: `/design-critique`

**3. The scope question is answered: start with three, design for four.** Eng/PM/Design is validated. Marketing is close enough to keep in architectural view but far enough to be a follow-on. Executive is a view. DevOps is a config variant. Everything else needs its own research.

## Proposals Generated

The `ux-product-personas` proposal is validated and enriched. Research phase is complete — we now have concrete material for artifact creation (product philosophy doc, product persona definitions, convention wiring).

Key additions to carry into deliverables:
- PM/Engineer/Designer → Planner/Worker/Judge mapping
- Five-scorecard registry for the Judge
- Per-persona skill candidates
- Marketing as documented second-wave candidate
- Artifact-type routing for quality gates

## Open Questions for Future Work

1. How should Studio generate forms from governance schemas? (Technical spike)
2. What MCP tools does the Designer persona need? (Figma read, Storybook, a11y scanning)
3. How do Figma branches and Sherpa proposals interrelate?
4. What does a Marketing convention set look like? (Second-wave research)
5. What is the cross-node governance interface? (Legal → Eng/Marketing policy)
