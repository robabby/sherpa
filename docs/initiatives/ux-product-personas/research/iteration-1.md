# Iteration 1 — 2026-03-15

## Findings

### Vector 1: Multi-Surface AI Product Design
**Question:** How do multi-surface AI products differentiate UX across surfaces while maintaining a shared core?
**Full report:** [iteration-1/vector-1-multi-surface-ai-products.md](iteration-1/vector-1-multi-surface-ai-products.md)

- Every successful multi-surface product shares the reasoning layer but differentiates the tool layer. Claude Code gets file ops; Cowork gets sandboxed folders. Same model, different interaction contract.
- Microsoft's three-altitude model (Immersive/Assistive/Chat-first) shows surfaces need multiple levels of engagement, not just different pages.
- Convention/configuration is the differentiation layer — CLAUDE.md, skills, hooks make each surface feel purpose-built. The AI itself is shared.
- Cursor's Visual Editor and Slack integration demonstrate that developer tools CAN expand to designers and stakeholders through new surfaces, not just watered-down versions of the developer surface.

**Implications:** Sherpa's convention layer (defineConfig, skills, behavioral roles) is already the mechanism for role-specific experiences. Studio is one surface; CLI is another; MCP enables a third (conversational/messaging). No separate apps needed — role-aware configuration creates the differentiation.

### Vector 2: AI-Augmented Non-Engineering Roles
**Question:** What does structured AI collaboration look like for PMs, Designers, and other roles beyond chat?
**Full report:** [iteration-1/structured-ai-collaboration-non-engineering.md](iteration-1/structured-ai-collaboration-non-engineering.md)

- PM tools have moved from chat to structured signal processing. Productboard Spark processes feedback into PRDs. Linear Triage shows decision traces. These are pipelines, not chatbots.
- Design governance is moving to creation-time, not review-time. Figma Make locks design tokens into templates; Schema 2025 lints outputs against system rules. The design system IS the governance layer.
- Microsoft Research (CHI 2025): ExtendAI (requiring humans to articulate reasoning before AI feedback) produces better decisions than RecommendAI (just giving recommendations). This validates Sherpa's proposal-based governance.
- The "code review for non-engineering roles" problem is largely unsolved. Fragments exist but nobody has a unified review pipeline for non-code artifacts.

**Implications:** Sherpa's Planner/Worker/Judge pipeline extends naturally to PM and Design workflows. The quality gate gap (no review pipeline for non-code artifacts) is genuine whitespace. Governance-at-creation (constrain before generating) aligns with behavioral engineering.

### Vector 3: Cross-Functional AI Adoption Patterns
**Question:** How do organizations adopt AI tools across functions? What friction emerges?
**Full report:** [iteration-1/cross-functional-ai-adoption-patterns.md](iteration-1/cross-functional-ai-adoption-patterns.md)

- Engineering takes 55% of AI spend but only 25% of potential value. Sales/marketing captures 28%. The adoption ceiling across functions is converging — the gap is tool design, not willingness.
- The developer-to-everyone cascade is documented: engineers first, then PMs prototyping, then designers, then marketing/finance. Shadow AI represents ~40% of spend.
- CLI is a barrier (~99% of non-engineers avoid terminal), but deeper friction includes convention overhead, emotional barriers (guilt, intimidation), trust gaps, and different success metrics.
- Microsoft Copilot is the cautionary tale: 4.7M GitHub Copilot subscribers vs ~3% M365 penetration — a ~300x developer-to-general gap. Bolting AI onto existing tools without workflow redesign produces shallow adoption.
- Organizations adopt in clusters (nodes), not uniformly. HBR's node/edge/network model shows most orgs optimize individual nodes but fail at cross-node handoffs.

**Implications:** Studio is the natural bridge for non-CLI users. The node model is validated by adoption research. The risk is the Copilot trap — adding AI to existing workflows instead of designing new ones. Sherpa's convention-driven approach is the antidote if the conventions themselves are role-accessible.

### Vector 4: Convention-Based Systems Across Skill Levels
**Question:** How do file/document governance systems bridge CLI-native and GUI-native users?
**Full report:** [iteration-1/convention-accessibility-research.md](iteration-1/convention-accessibility-research.md)

- GitHub's strategy: same data, multiple access tiers. Engineers use CLI, PMs use web board/roadmap views, everyone converges on git-backed artifacts. `github.dev` (press `.`) removed the last barrier.
- Notion unifies structure and freeform through the block model. Conventions delivered through pre-filled templates with demo data, not documentation. Smart defaults auto-apply rules.
- Linear's opinionated defaults: Triage inbox forces governance without calling it governance. Automatic status transitions (branch = In Progress, PR merged = Done) — governance as side effect of work.
- TinaCMS and Nuxt Studio generate visual forms from frontmatter schemas. Non-technical users never see YAML. This is directly applicable to Sherpa's proposal frontmatter.
- Convention teaching patterns: progressive disclosure (GitLab Pajamas), golden path templates (Spotify Backstage), form-based creation that enforces structure without teaching it.

**Implications:** Studio should generate forms from studio-core Zod schemas. Conventions delivered at creation time (templates, defaults), not through documentation. Lifecycle transitions should be automatic where possible. Role-specific views of shared governance files, not role-specific files.

## Synthesis

Four cross-cutting patterns emerge from the intersection of all vectors:

**1. Convention-at-Creation, Not Convention-at-Review.** The most effective multi-role systems embed governance into the creation act itself. Figma locks tokens at design time. Linear auto-transitions status. Notion templates pre-fill structure. Sherpa's proposal convention works the opposite way — it requires authors to learn the format, then write it, then get reviewed. For non-engineering roles, conventions should be delivered through forms, templates, and smart defaults that produce conformant artifacts without requiring convention knowledge. The Judge still reviews, but the floor is higher.

**2. Same Artifacts, Role-Specific Projections.** Every successful system shares one truth (git, Graph, block database) and projects role-specific views onto it. GitHub shows a kanban board; engineers see the same data as git refs. Linear shows a roadmap; engineers see the same data as issues. Sherpa's governance files (proposals, tasks, activity logs) are the shared truth. Studio needs to project these as role-appropriate views — not create parallel data structures. A PM sees an initiative dashboard; an engineer sees the same proposals as markdown files.

**3. The Tool Layer Defines the Persona.** Across Claude, Microsoft, GitHub, and Cursor: the model is shared, but the tools each surface exposes define who it's for. Claude Code's tools (file ops, shell) make it an engineering surface. Cowork's tools (sandboxed folders) make it a knowledge worker surface. Sherpa's equivalent: which MCP tools, skills, and behavioral roles are loaded determines the persona experience. `defineConfig()` is already the mechanism for this.

**4. The Quality Gate Gap is Real Whitespace.** Code review is a solved governance problem. Design review and spec review are not. No system provides a unified review pipeline for non-code artifacts (PRDs, wireframes, research reports) with the same rigor as code review. Sherpa's Judge role + content quality scorecard are positioned to fill this gap — but only if the quality gates are persona-aware (different criteria for a PM's proposal vs. an engineer's implementation).

## Proposals Generated

The existing `ux-product-personas` proposal is validated and strengthened by this research. No new proposals needed — the research feeds into the initiative's artifact creation phase (sessions 3-4).

Key refinements to carry into the product philosophy document:
- Convention-at-creation as a design principle
- Role-specific projections (not role-specific artifacts) as the architectural pattern
- The tool layer (MCP tools, skills, roles loaded via config) as the persona mechanism
- Quality gate gap as the differentiation opportunity

## Open Questions for Next Iteration

1. **What does a PM's convention set look like concretely?** We know conventions should be role-specific. What are the actual conventions a PM needs? (Proposal templates optimized for product decisions? Appetite declarations? Customer evidence formats? Prioritization frameworks?) — needs concrete design work.

2. **How should Studio generate forms from governance schemas?** TinaCMS and Nuxt Studio prove this works. What's the implementation path for Sherpa? Schema-driven form generation from Zod types in studio-core? — needs technical spike.

3. **What does the Designer persona's AI companion actually do?** Vector 2 showed that design governance is moving to creation-time (Figma Make, Schema linting). But what does a Designer do in Sherpa specifically? Review prototypes? Govern the design system? Audit UX? — needs design-specific research.

4. **How do overnight dispatch results surface to non-CLI users?** Vector 3 confirmed the morning review ritual matters across roles. But PMs and Designers won't check terminal output. What does their morning look like in Studio? — connects to dispatch-center initiative.

5. **Should roles beyond Eng/PM/Design be included now?** Vector 3 showed adoption cascades to marketing, finance, operations. The node model says these are separate nodes. But the conventions and quality gates for a "marketing node" are far from defined — likely needs its own research cycle.
