# The Designer in Convention-Driven Collaboration

**Question:** What does a Designer actually do in a convention-driven collaboration system? How do they propose, review, and ship design work through structured governance? What artifacts are convention-worthy, and how does AI-assisted design governance work?

**Date:** 2026-03-15

---

## Key Discoveries

### 1. Design Artifacts That Are Convention-Worthy

Not all design work lives in Figma. A substantial and growing set of design artifacts are structured, text-based, and governable through the same markdown-with-frontmatter pattern Sherpa uses for engineering initiatives.

**Design tokens** are the clearest example. The W3C Design Tokens Community Group published the first stable specification (2025.10) -- a vendor-neutral JSON format (`application/design-tokens+json`, file extension `.tokens` or `.tokens.json`) with `$value`, `$type`, `$description`, and `$extensions` properties. Over 10 tools support it, including Figma, Penpot, Sketch, and Framer. Design tokens are already version-controlled, diffable, and reviewable. ([W3C Design Tokens Spec 2025.10](https://www.designtokens.org/tr/drafts/format/), [W3C announcement](https://www.w3.org/community/design-tokens/2025/10/28/design-tokens-specification-reaches-first-stable-version/))

**Design Decision Records (DDRs)** are real and structured. The Well-Architected Guide provides a 9-section template: Overview (title, date, status), Context, Decision, Reasoning, Implications, Mitigation/Follow-Up, Stakeholder Input, Status/Review, and Documentation/Storage. Statuses mirror ADRs: Proposed, Accepted, Rejected, Superseded. Microsoft's Engineering Playbook recommends a simpler decision log in markdown with columns for Decision, Date, Alternatives, Reasoning, and Who Made It. ([DDR Template](https://www.well-architected-guide.com/documents/design-decision-record-ddr-template/), [Microsoft Decision Log](https://microsoft.github.io/code-with-engineering-playbook/design/design-reviews/decision-log/))

**Component specifications** bridge design and engineering. The spec-driven development movement (Kiro, GitHub Spec-Kit) formalizes this as `requirements.md` + `design.md` + `tasks.md`. While these tools target engineering, the `design.md` artifact -- documenting component behavior, states, interaction patterns, and responsive breakpoints -- is designer-authored content that lives in version control. ([Martin Fowler on SDD tools](https://martinfowler.com/articles/exploring-gen-ai/sdd-3-tools.html), [Kiro Specs](https://kiro.dev/docs/specs/))

**Accessibility audit reports** have a well-defined structure. The W3C provides a standard template. The 5 C's framework (Criteria, Condition, Cause, Consequence, Corrective action) structures findings as evidence-based, actionable records. Severity matrices (HIGH/MEDIUM/LOW) prioritize remediation. These map directly to governed markdown with frontmatter. ([W3C Evaluation Report Template](https://www.w3.org/WAI/test-evaluate/report-template/))

**UX research reports** follow a consistent structure: problem statement, methodology, findings, recommendations. Iteration 1 already identified UX research as "the non-engineering discipline closest to having a Planner/Worker/Judge equivalent." Research reports with structured frontmatter (study type, participants, confidence level, related decisions) fit the convention model.

**Design rationale documents** explain why, not what. The recommended structure: problem statement, user research insights, design goals, explorations/alternatives with reasons for rejection, chosen direction, and supporting evidence. The Y-statement format condenses this: "In the context of [requirement], facing [constraint], we decided [outcome], neglecting [alternatives], to achieve [benefits], accepting [drawbacks]." ([Pencil & Paper: Design Rationale](https://www.pencilandpaper.io/articles/design-rationale-documentation))

**Pattern:** Six artifact types are convention-worthy today: design tokens (JSON with W3C spec), DDRs (markdown), component specifications (markdown), accessibility audits (markdown), UX research reports (markdown+JSON), and design rationale documents (markdown). All can carry frontmatter schemas and participate in governance pipelines.

### 2. How Designers Interact With Governance Systems Today

Design-mature organizations have converged on governance patterns that parallel but differ from engineering's PR-based workflow.

**Figma branching is design's version of git branching.** Branches create controlled environments for exploring changes to designs, prototypes, and libraries without editing the original file. Branches are submitted for review and merged only when approved. This is the closest design equivalent to a pull request, and it works within Figma's native tooling. ([Figma Guide to Branching](https://help.figma.com/hc/en-us/articles/360063144053-Guide-to-branching))

**Design system governance uses a proposal-review-merge cycle.** The most mature model documented: (1) Any team member identifies a gap and initiates a proposal, (2) The initiator prepares a structured playground file with solution documentation, checklist, use cases, and research, (3) Weekly open forum presentation, (4) Consolidation call with cross-functional critique including developers, (5) Approved changes update the system with full documentation. This five-step cycle is structurally identical to Sherpa's initiative lifecycle: proposal, review, approval, implementation, integration. ([designsystems.com: How to govern a design system](https://www.designsystems.com/how-to-govern-a-design-system/))

**Design token governance has formalized roles.** A two-tier model: Leadership tier (Design Language Lead with final decision authority, Project Manager, Dev Lead) and Production tier (Token Guardian who owns the source of truth). Token changes go through a formal review process with semantic versioning and changelogs. A rotating review group of 3-5 people evaluates proposals against consistency, reusability, accessibility, and token alignment criteria. ([DOOR3: Design Token Governance](https://www.door3.com/blog/design-token-governance))

**At Linear, designers file their own issues.** Design tasks are tracked in the same system as engineering tasks. Projects are shared between design and engineering teams. Designers own their work items and attach Figma links. Sub-issues split design and engineering tasks within shared features. The first design task for any project is to "understand and verify the problem," not to start drawing. ([Linear Method: Manage Design Projects](https://linear.app/method/manage-design-projects))

**At Vercel, the handoff is eliminated.** Design Engineers work directly with designers, iterating together in Figma or code. Collaboration happens through preview deployments with DOM-level comments that stick to actual page elements. Comments integrate with Linear. Preview comments from team members can block new deployments -- design review as a deployment gate, structurally identical to a blocking code review. ([Vercel: Design Engineering](https://vercel.com/blog/design-engineering-at-vercel), [Vercel: Comments on Preview Deployments](https://vercel.com/blog/introducing-commenting-on-preview-deployments))

**At Figma internally**, design critiques run on a fixed cadence (Wednesdays 9:30-10:30 PT, Fridays 2-3 PT). Presenters set the agenda in advance, including a slide for "Here's the feedback I am looking for" and "Here's what I'm NOT looking for." The round-the-room (RTR) format gives each person two minutes with no interruptions. Critiques are explicitly not product reviews -- they exist to "leverage the collective skills and knowledge of the design team to help unblock designers." ([Figma Blog: Design Critiques at Figma](https://www.figma.com/blog/design-critiques-at-figma/))

**Pattern:** Designers already use governance systems -- branching, proposals, structured review, role-based approval. The friction is that these systems are fragmented across tools (Figma for visual, Linear for tracking, Vercel for deployment review) and none produce the text-based artifacts that a convention-driven system like Sherpa can govern.

### 3. AI-Assisted Design Governance (Not Generation -- Governance)

AI is being applied to design quality assurance in ways that map directly to the Judge role in Sherpa's pipeline.

**Figma's AI design review assistant** scans frames, flows, and components in seconds and flags visual and structural mismatches. It provides contextual feedback on layout, hierarchy, accessibility, and UX decisions. This is a design linter, not a design generator. ([Figma AI Design Review](https://www.figma.com/solutions/ai-design-review-assistant/))

**onBeacon** (from Apple's Siri team) provides expert-level design reviews powered by behavioral science and LLMs. It audits UI for consistency with best-practice heuristics and the team's design system. The framing is significant: "design reviews in minutes" -- not design generation, but governance acceleration. ([Figma Community: AI Design Reviewer](https://www.figma.com/community/plugin/1339202278007297015/ai-design-reviewer-ui-ux-accessibility-design-system-linter-prototypes))

**Axe for Designers** (Deque) automatically detects common accessibility issues across entire designs or individual components, with auto-annotations ensuring accessible designs are adopted by dev teams. This is WCAG compliance checking at design time, not after implementation. ([Deque: Axe for Designers](https://www.deque.com/axe/design-beta/))

**Chromatic + Storybook** provides visual regression testing that captures pixel-level snapshots of every story, compares across commits, and badges pull requests with UI test results. Designers, developers, and stakeholders review visual changes through shared comment threads on snapshots. This is the closest thing to "design code review" in the component layer. ([Chromatic](https://www.chromatic.com/storybook), [Storybook Visual Testing](https://storybook.js.org/docs/writing-tests/visual-testing))

**Figma's MCP server** scans codebases and outputs structured rules files -- token definitions, component libraries, style hierarchies, naming conventions -- that act as system-level guides for AI agents. Generated code adheres to the team's design system standards because the MCP context constrains the output. This is governance-as-context: the design system becomes a behavioral constraint on AI code generation, not just a reference document. ([Figma Blog: Design Systems and AI - MCP](https://www.figma.com/blog/design-systems-ai-mcp/))

**Pattern:** The Judge role for design already exists in fragments: AI linters for design system compliance, accessibility auditors for WCAG conformance, visual regression testers for component consistency. These can be unified into a design quality pipeline that parallels engineering's CI/CD.

### 4. Reviewing AI-Generated Design Output

When an AI agent generates a prototype or UI component, the review process must change. The most thoughtful framework comes from Itamar Medeiros's "Rethinking Design Critiques in the Age of AI Prototyping" (November 2025).

**The fundamental shift:** Traditional critique asks "Does this look right?" AI-era critique asks "What hypothesis does this test?" The volume of AI-generated variants demands hypothesis-driven evaluation, not aesthetic judgment. ([Designative: Rethinking Design Critiques in the AI Age](https://www.designative.info/2025/11/10/rethinking-design-critiques-in-the-age-of-ai-prototyping/))

**Seven-component critique cheatsheet:**
1. Establish session purpose (vision alignment, assumption testing, or learning validation)
2. Pre-session: map AI-generated variants to specific hypotheses being tested
3. Opening: reframe around "What assumption is this testing?"
4. Guide conversation: anchor feedback in problem framing and product vision
5. When AI is involved: examine prompt quality, assess whether outputs align with human-centered intent, treat prototypes as conversation starters
6. Closing: document learning decisions tied to hypotheses, not subjective preferences
7. Anti-patterns: mistaking fidelity for validation, collapsing strategy into tactics, allowing polished outputs to bypass shared understanding

**The prompt is a design artifact.** In AI-assisted design, the prompt that generated a prototype deserves critique alongside the prototype itself. "Treat the prompt as a design artifact worthy of critique, just like wireframes or storyboards." This is significant for Sherpa: the task description that dispatches a design worker IS a design artifact subject to review.

**Separate AI-generated and human-authored ideas during critique** to reduce aesthetic bias and focus on intent and alignment. When AI produces polished output faster than humans can form intent, there is a risk of "the missing middle" -- jumping from vision directly to polished prototypes without establishing shared understanding.

**Pattern:** Design review of AI output requires different protocols than review of human-created work. Intent stewardship replaces aesthetic judgment. Prompts/task descriptions become reviewable artifacts. Hypothesis documentation becomes mandatory.

### 5. Design Decision Documentation Patterns

DDRs exist and have structured formats, but adoption is lower than ADRs in engineering.

**The DDR template** (from the Well-Architected Guide) includes: Title, Date, Status (Proposed/Accepted/Rejected/Superseded), Context (forces at play), Decision (statement + alternatives with pros/cons), Reasoning (evaluation criteria), Implications (consequences + technical debt), Mitigation/Follow-Up, Stakeholder Input (roles and concerns), and Status/Review schedule. ([DDR Guide](https://www.well-architected-guide.com/documents/design-decision-records-ddrs-guide/))

**The Y-statement format** condenses a decision into one structured sentence: "In the context of [functional requirement], facing [non-functional requirement], we decided [outcome], neglecting [alternatives], to achieve [benefits], accepting [drawbacks]." This is lightweight enough for inline use in design system documentation. ([Olaf Zimmermann: Y-Statements](https://medium.com/olzzio/y-statements-10eb07b5a177))

**Design rationale documentation** operates at multiple zoom levels: flow-level (why this user journey), wireframe-level (why this layout), and high-fidelity-level (why this specific interaction). The recommendation: document rationale at natural pause points -- "When you sit back and have no more ideas flowing... document your design rationale." ([Pencil & Paper: Design Rationale](https://www.pencilandpaper.io/articles/design-rationale-documentation))

**Figma's State of the Designer 2026:** 72% of designers now use generative AI tools (98% increased usage). 89% say they work faster. But the critical finding: "AI is not simply removing tasks from design workflows. Instead, it is redistributing them. Designers are spending less time on rote production and more time on decision-making, critique, and alignment." Decision documentation becomes more important as AI handles more production work. ([Figma: State of the Designer 2026](https://www.figma.com/reports/state-of-the-designer-2026/))

**Pattern:** DDRs are real but under-adopted. The Y-statement format offers a lightweight entry point. As AI takes over production, designers spend more time on decisions -- making decision documentation more, not less, important.

---

## Synthesis: The Designer's Governance Workflow in Sherpa

Five concrete roles emerge for the Designer in a convention-driven collaboration system:

### Role 1: Design System Governor

The Designer owns and evolves the design system -- tokens, components, patterns. In Sherpa's model:
- **Propose:** Submit token changes, new component specs, or pattern updates as governed proposals with DDR-format frontmatter (context, alternatives, decision, consequences)
- **Review:** Judge AI-generated UI output against the design system. Audit Storybook/Chromatic visual regression results. Evaluate accessibility compliance.
- **Ship:** Merge approved token/component changes. Update the design system source of truth (tokens.json, component specs).

### Role 2: Quality Gate Owner for Visual/UX Work

The Designer is the Judge for visual and interaction quality:
- **Review criteria:** Design system compliance, accessibility (WCAG), visual consistency, interaction pattern adherence, responsive behavior
- **Artifacts reviewed:** AI-generated prototypes, component implementations, overnight dispatch output that includes UI work
- **Output:** Structured critique records with hypothesis alignment (not just "looks wrong" but "this doesn't test the assumption we need validated")

### Role 3: Specification Author

The Designer writes structured specifications that constrain AI workers:
- **Component specs** (behavior, states, interactions, responsive breakpoints) as markdown with frontmatter
- **Interaction pattern documentation** (triggers, transitions, edge cases)
- **Design rationale documents** explaining why this direction over alternatives

### Role 4: Research Synthesizer

The Designer conducts and governs UX research:
- **Research reports** with structured frontmatter (study type, participants, confidence, related decisions)
- **Accessibility audit reports** following the 5 C's framework
- **Design decision logs** accumulating rationale over time

### Role 5: AI Output Steward

When AI agents generate design work (prototypes, components, layouts), the Designer:
- Reviews the generating prompt/task description as a design artifact
- Evaluates output against hypotheses, not aesthetics
- Separates AI-generated and human-authored elements during critique
- Documents what was learned, not just what was approved

---

## Implications for Sherpa

### Convention-Worthy Artifact Types (with Frontmatter Schemas)

| Artifact | Status Field | Key Frontmatter | Judge Criteria |
|----------|-------------|-----------------|----------------|
| Design Decision Record | proposed/accepted/rejected/superseded | context, alternatives, decision, consequences | Completeness, alternatives evaluated, evidence quality |
| Component Specification | draft/review/approved/implemented | component-name, states, tokens-used, a11y-requirements | Coverage of states, token alignment, responsive defined |
| Accessibility Audit | draft/review/complete | scope, wcag-level, severity-summary | Criteria/condition/cause documented, correctives actionable |
| Design Token Change | proposed/approved/shipped | token-path, old-value, new-value, breaking | Naming convention, semantic versioning, deprecation strategy |
| UX Research Report | draft/review/published | study-type, participants, confidence, related-decisions | Sourced claims, methodology documented, recommendations actionable |
| Design Rationale | documented | decision-ref, zoom-level, alternatives-count | Alternatives actually explored, evidence referenced |

### The Designer's Dispatch Loop

The Designer's workflow in Sherpa's Planner/Worker/Judge pipeline:

1. **As Planner:** Author component specs, interaction patterns, or research plans. These become task descriptions for AI workers.
2. **As Worker:** Conduct UX research, create design rationale documents, perform accessibility audits, update design tokens. These are dispatchable tasks.
3. **As Judge:** Review AI-generated prototypes, audit visual regression results, evaluate design system compliance. The Judge role is where the Designer has the most leverage -- every AI-generated UI output needs design governance.

### Quality Gate: Design Review Scorecard

Analogous to the content quality scorecard in `.claude/rules/content-quality.md`:

1. **Design system compliance** -- All tokens reference the system; no ad-hoc values
2. **Accessibility conformance** -- WCAG 2.2 AA minimum; severity matrix completed
3. **Interaction completeness** -- All states documented (default, hover, focus, active, disabled, loading, error, empty)
4. **Responsive specification** -- Breakpoint behavior defined, not just desktop
5. **Intent alignment** -- Design solves the stated problem, with rationale documented
6. **Consistency verification** -- Visual regression passes; no unexplained diffs from baseline
7. **Alternative consideration** -- At least one alternative explored and documented (why not X?)

3+ items marked Needs Work = design not ready to ship.

---

## Open Questions

1. **How does the Designer's morning review differ from the Engineer's?** When overnight dispatch produces UI work, the Designer needs a different review surface -- visual diffs, not code diffs. Does Studio need a Chromatic-like visual comparison view for overnight prototype output?

2. **Should design tokens live in `sherpa.config.ts` or in a separate `.tokens.json`?** The W3C spec defines a JSON format. Sherpa's config already has a theming section. These may converge or may serve different granularities.

3. **What does the Designer's MCP tool surface look like?** Engineers get file ops and shell. PMs get initiative lifecycle tools. Designers need: Figma MCP read access, Storybook screenshot capture, accessibility scanning, visual diff tools. Which are available today vs. need building?

4. **How do Figma branches and Sherpa proposals interrelate?** A design system change might start as a Figma branch AND a Sherpa proposal. The governance trail should connect them. Is the Figma branch URL a frontmatter field on the proposal?

5. **Can the design critique cheatsheet be formalized as a Sherpa skill?** The seven-component framework from Medeiros could become `/design-critique` -- a structured review protocol for AI-generated design output, producing governed critique records.

---

## Sources

- [W3C Design Tokens Specification 2025.10](https://www.designtokens.org/tr/drafts/format/)
- [W3C Design Tokens Stable Version Announcement](https://www.w3.org/community/design-tokens/2025/10/28/design-tokens-specification-reaches-first-stable-version/)
- [DDR Template - Well-Architected Guide](https://www.well-architected-guide.com/documents/design-decision-record-ddr-template/)
- [DDR Guide - Well-Architected Guide](https://www.well-architected-guide.com/documents/design-decision-records-ddrs-guide/)
- [Microsoft Engineering Playbook - Decision Log](https://microsoft.github.io/code-with-engineering-playbook/design/design-reviews/decision-log/)
- [DOOR3 - Design Token Governance](https://www.door3.com/blog/design-token-governance)
- [designsystems.com - How to Govern a Design System](https://www.designsystems.com/how-to-govern-a-design-system/)
- [Figma Blog - 5 Shifts Redefining Design Systems in the AI Era](https://www.figma.com/blog/5-shifts-redefining-design-systems-in-the-ai-era/)
- [Figma Blog - Design Systems and AI: MCP Servers](https://www.figma.com/blog/design-systems-ai-mcp/)
- [Figma Blog - Design Critiques at Figma](https://www.figma.com/blog/design-critiques-at-figma/)
- [Figma - State of the Designer 2026](https://www.figma.com/reports/state-of-the-designer-2026/)
- [Figma Guide to Branching](https://help.figma.com/hc/en-us/articles/360063144053-Guide-to-branching)
- [Figma AI Design Review Assistant](https://www.figma.com/solutions/ai-design-review-assistant/)
- [Figma Community - AI Design Reviewer (onBeacon)](https://www.figma.com/community/plugin/1339202278007297015/ai-design-reviewer-ui-ux-accessibility-design-system-linter-prototypes)
- [Vercel Blog - Design Engineering at Vercel](https://vercel.com/blog/design-engineering-at-vercel)
- [Vercel Blog - Comments on Preview Deployments](https://vercel.com/blog/introducing-commenting-on-preview-deployments)
- [Linear Method - Manage Design Projects](https://linear.app/method/manage-design-projects)
- [Chromatic - Visual Testing for Storybook](https://www.chromatic.com/storybook)
- [Storybook - Visual Testing Docs](https://storybook.js.org/docs/writing-tests/visual-testing)
- [Deque - Axe for Designers](https://www.deque.com/axe/design-beta/)
- [W3C - Accessibility Evaluation Report Template](https://www.w3.org/WAI/test-evaluate/report-template/)
- [Designative - Rethinking Design Critiques in the Age of AI Prototyping](https://www.designative.info/2025/11/10/rethinking-design-critiques-in-the-age-of-ai-prototyping/)
- [Pencil & Paper - Design Rationale Documentation](https://www.pencilandpaper.io/articles/design-rationale-documentation)
- [Y-Statements for Decision Records](https://medium.com/olzzio/y-statements-10eb07b5a177)
- [Martin Fowler - Exploring SDD Tools](https://martinfowler.com/articles/exploring-gen-ai/sdd-3-tools.html)
- [Kiro - Specs Documentation](https://kiro.dev/docs/specs/)
