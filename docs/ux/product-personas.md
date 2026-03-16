---
type: ux-guide
updated: 2026-03-16
version: 0.1
---

# Product Personas

Three roles that use Sherpa day-to-day. Each defined along two axes: **tool proximity** (where they sit on the filesystem ↔ Studio spectrum) and **decision domain** (what type of decisions they make). These are product personas — who *uses* the system. For who *buys* it, see [Business Personas](./personas.md).

---

## The Engineer

| | |
|---|---|
| **Primary Mode** | Worker |
| **JTBD** | When I'm building with AI agents, help me dispatch work, review output, and ship implementations, so my code is governed without slowing me down. |

**Tool proximity:** Filesystem-native. Lives in the terminal. Edits CLAUDE.md directly. Dispatches tasks via CLI. Reads agent logs as raw files. Studio is a dashboard they check occasionally, not their primary workspace.

**Decision domain:** Implementation. Architecture choices, code quality trade-offs, technical debt management, convention compliance.

**Primary artifacts:**
- *Creates:* implementations, code reviews, technical proposals, architecture decision records
- *Consumes:* product briefs (from PM), component specifications (from Designer), task assignments, judge verdicts

**AI companion pattern:** Agentic dispatch. The Engineer writes conventions and behavioral roles that constrain how AI workers operate. They dispatch tasks, review results, iterate. The AI is a fleet of workers governed by the Engineer's constraints.

**Studio surface:** Task board, dispatch queue, agent logs, overnight run results, session cost summaries. Information-dense, operational.

**Quality gates:** Code Scorecard — TypeScript types, test coverage, security, convention compliance, architectural alignment. Threshold: 2+ criteria at "Needs Work" blocks approval. Security issues block regardless.

**Convention needs:**
- CLAUDE.md and behavioral role definitions (already exist)
- Task dispatch conventions (already exist)
- Code review conventions (already exist)
- Architecture Decision Records (ADRs)

**What Sherpa gives them that nothing else does:** Governance that travels with the code. Not a separate platform — conventions in the filesystem, quality gates in the pipeline, behavioral constraints on the agents.

---

## The Product Manager

| | |
|---|---|
| **Primary Mode** | Planner |
| **JTBD** | When I'm scoping and prioritizing work, help me shape initiatives, evaluate trade-offs, and make investment decisions, so the team builds the right things at the right scope. |

**Tool proximity:** Studio-primary. Interacts with governance artifacts through the web UI. Creates proposals via forms, reviews task status on dashboards, approves initiatives with buttons. May occasionally edit markdown directly as they grow comfortable, but doesn't need to.

**Decision domain:** Prioritization. Scope boundaries, appetite declarations, go/no-go decisions, customer evidence evaluation, roadmap sequencing.

**Primary artifacts:**
- *Creates:* product briefs (extended proposals with appetite, success metrics, no-gos), product decision records (PDRs), customer evidence summaries, scope boundary documents, stakeholder updates
- *Consumes:* research iterations (from `/rr`), implementation status, judge verdicts, cost summaries

**AI companion pattern:** Structured scaffolding. AI generates draft product briefs from problem statements, synthesizes customer feedback into structured evidence, drafts stakeholder updates from project status. The PM reviews, adjusts scope, makes decisions. AI handles the synthesis; the PM holds the judgment.

**Studio surface:** Initiative lifecycle dashboard, decision queue (approve/reject/iterate), scope health indicators, customer evidence roll-ups, morning review. Decision-oriented, not implementation-oriented.

**Quality gates:** Spec Scorecard — problem clarity, customer evidence, scope bounded, success metrics measurable, edge cases addressed, rabbit holes identified, acceptance criteria testable, strategic alignment. Threshold: 3+ criteria at "Needs Work" blocks. Missing problem clarity or customer evidence blocks regardless.

**Convention needs:**
- Product brief template (extends proposal.md with PM-specific frontmatter: appetite, success-metrics, no-gos, decision-stage)
- Product Decision Record (PDR) format — decision, rationale, alternatives, expected outcome, revisit date
- Customer evidence summary format — themes, signal strength, representative quotes with sources
- Scope boundary convention — explicit in/out, no-gos (Shape Up's "scope hammering")
- Stakeholder update template — highest candidate for full AI generation with PM review

**What Sherpa gives them that nothing else does:** Governed AI assistance for product decisions. Not AI that makes decisions for them — AI that synthesizes evidence, scaffolds artifacts, and generates drafts while the PM holds scope authority. Every decision is tracked, every trade-off documented.

**Skills:**
- `/shape` — Given a problem statement, generate a draft product brief with appetite, rabbit holes, and no-gos for PM review. The PM equivalent of `/rr`.

---

## The Designer

| | |
|---|---|
| **Primary Mode** | Judge |
| **JTBD** | When AI is generating UI and interaction patterns, help me govern visual quality, enforce design system compliance, and ensure accessibility, so what ships meets the standard the team committed to. |

**Tool proximity:** Dual. Works in design tools (Figma, Storybook) and reviews output in Studio. Creates specifications as markdown (or through Studio forms). Reviews AI-generated prototypes and component implementations. Doesn't need the terminal but may inspect code to evaluate quality.

**Decision domain:** Experience. Information hierarchy, interaction patterns, accessibility compliance, design system governance, visual quality.

**Primary artifacts:**
- *Creates:* design decision records (DDRs), component specifications, accessibility audit reports, design rationale documents, design token definitions, UX research reports
- *Consumes:* AI-generated prototypes, component implementations, product briefs (from PM), visual regression reports

**AI companion pattern:** Quality governance. AI generates prototypes and implementations. The Designer evaluates whether output meets design system standards, accessibility requirements, and interaction quality. The AI produces; the Designer judges.

**Studio surface:** Design review queue, visual diff comparisons, accessibility audit results, design system compliance dashboard, component catalog. Quality-oriented, showing what needs review and what passed.

**Quality gates:** Design Scorecard — design token compliance, WCAG 2.1 AA accessibility, information hierarchy, pattern consistency, responsive behavior, interaction states defined, minimalism (every element earns its place). Threshold: 2+ criteria at "Needs Work" blocks. Accessibility issues block regardless.

**Convention needs:**
- Design Decision Record (DDR) format — context, constraint, decision, alternatives, status (Proposed/Accepted/Rejected/Superseded)
- Component specification template — behavior, states, interactions, responsive breakpoints, accessibility requirements
- Accessibility audit template — WCAG criteria, severity matrix, remediation status
- Design token governance — W3C JSON format, change proposal lifecycle, review board
- Design rationale format — Y-statement: "In the context of [situation], facing [constraint], we decided [decision], to achieve [benefit], accepting [drawback]"

**What Sherpa gives them that nothing else does:** Governance for AI-generated design output. As AI produces more visual work, the Designer's role shifts from production to quality judgment. Sherpa provides the convention system and quality gates to do that systematically — not ad-hoc review in Figma comments, but structured evaluation with tracked decisions and clear criteria.

**Skills:**
- `/design-critique` — Structured review of AI-generated design output using hypothesis-driven evaluation. Not aesthetic preference — quality governance.

---

## How They Work Together

```
PM (Planner)                    Engineer (Worker)                Designer (Judge)
shapes initiative    ────────>  implements tasks     ────────>   reviews quality
sets scope & appetite           dispatches AI workers            evaluates against standards
makes go/no-go decisions        writes conventions               governs design system
                                                                 audits accessibility

     <──────── research findings ──────────┘
     <──────── judge verdicts ─────────────────────────────────┘
```

The governance lifecycle connects them:

1. **PM** creates a product brief (proposal with appetite, no-gos, success metrics)
2. **Designer** creates specifications (component specs, DDRs, interaction patterns)
3. **Engineer** dispatches AI workers constrained by behavioral roles and conventions
4. **Judge** evaluates output against the appropriate scorecard (Code, Design, Spec, Research, or Content)
5. **PM** reviews results, adjusts scope, makes next decisions

Each role's AI companion assists with their primary mode. The convention system ensures all three roles interact through shared artifacts on a shared substrate.

---

## Second-Wave Candidates

Research identified roles beyond the triad. These are not yet personas — they need their own convention design:

| Role | Proximity | Why it's close | Why it waits |
|------|-----------|----------------|--------------|
| Marketing | Studio-primary | Content pipelines map to lifecycle. Brand governance = linting. 65% have AI roles. | Convention set undefined. Needs own research. |
| DevOps/SRE | Filesystem-native | Same substrate as Engineering. | Engineering config variant via `defineConfig()`, not a separate persona. |
| Executive | Studio read-only | Consumes governance data for decisions. | Not a producer — a dashboard view, not a persona. |
| Legal | Studio-primary | Governance producer (policies others consume). | Cross-node partner, not standalone persona. Needs research. |

---

*See also: [Product Philosophy](./product-philosophy.md) for strategic framing, [Business Personas](./personas.md) for who buys Sherpa, [Design Principles](./design-principles.md) for how we build.*
