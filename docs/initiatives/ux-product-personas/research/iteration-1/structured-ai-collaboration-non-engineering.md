# Structured AI Collaboration for Non-Engineering Roles

**Question:** What does structured AI collaboration look like for Product Managers, Designers, and other non-engineering roles -- beyond simple chat interfaces? What tools, patterns, governance mechanisms, and quality gates exist?

**Date:** 2026-03-15

---

## Key Discoveries

### 1. PM Tools Have Moved From "AI Chat" to Structured Signal Processing

The most advanced PM tools are not chat interfaces with product context -- they are structured pipelines that process signals into artifacts.

- **Productboard Spark** operates as an agentic platform that continuously processes customer feedback, market signals, and usage data. It auto-links user insights to feature ideas, generates topics from feedback patterns, and produces PRDs grounded in actual organizational data rather than generic templates. Spark maintains "organizational memory that compounds instead of disappearing" -- it learns from what the team adds and edits daily. ([Productboard Spark announcement](https://www.productboard.com/blog/spark-ai-agent-product-management/), [Productboard AI overview](https://www.productboard.com/product/ai-for-product-management/))

- **Linear's Triage Intelligence** uses a combination of semantic search, ranking, and LLM-based reasoning against the team's existing backlog to suggest assignees, teams, labels, and projects for incoming issues. Linear rebuilt their search from keyword-based to semantic, enabling the system to identify related issues through vector similarity. Their "Additional Guidance" setting lets teams fine-tune AI behavior with natural language prompts at workspace or team level -- essentially behavioral constraints, not identity. Every suggestion shows the model's reasoning in a dedicated "thinking panel" with full decision trace. ([Linear: How we built Triage Intelligence](https://linear.app/now/how-we-built-triage-intelligence), [Linear Product Intelligence](https://linear.app/changelog/2025-08-14-product-intelligence-technology-preview))

- **ChatPRD** converts rough inputs (ideas, meeting notes, sketches) into structured PRDs with problem exploration, solution exploration, requirements, acceptance criteria, and success metrics. The key differentiator: it provides CPO-level review feedback, identifying strategic gaps, questioning assumptions, and coaching PMs to think more deeply about users. The workflow is multi-turn: generate draft, get structured critique, refine, iterate. ([ChatPRD platform](https://www.chatprd.ai/), [ChatPRD: Using AI to write a PRD](https://www.chatprd.ai/resources/using-ai-to-write-prd))

- **Notion AI** reduces PRD drafting from 4-8 hours to 1-2 hours for review and refinement. But the real shift is toward Notion's Custom Agents (launching May 2026) that can be domain-specialized for product workflows. ([Notion AI overview](https://www.notion.com/use-case/project-management/product-management-workflow))

**Pattern:** The best PM tools are not "ask a question, get an answer." They are continuous signal processors that maintain state, learn from team behavior, and produce structured artifacts with built-in critique loops.

### 2. Design Tools Are Embedding Governance Into AI Generation, Not Bolting Review On After

- **Figma Make** allows teams to create templates with design system rules baked in. Typography tokens, color ramps, and logo placement can be locked per template so that AI-generated outputs automatically respect the design system. Non-designers can interact with constrained templates where they "see and control only what you allow." ([Figma Make AI Design Systems Generator](https://www.figma.com/solutions/ai-design-systems-generator/))

- **Figma Schema 2025** launched a "Check designs" linter that automatically surfaces variables and elements aligned with the design system, with a custom model suggesting the right variable for each context. This is the design equivalent of a code linter -- governance at creation time, not review time. They also added native W3C Design Tokens import/export, making design constraints portable across tools. ([Figma Blog: Schema 2025 recap](https://www.figma.com/blog/schema-2025-design-systems-recap/), [Figma Blog: 5 Shifts Redefining Design Systems](https://www.figma.com/blog/5-shifts-redefining-design-systems-in-the-ai-era/))

- **Design systems teams are becoming governance bodies.** Figma's research shows that as AI tools enter product workflows, design systems teams move "beyond library upkeep toward active governance of how products get built." By embedding design rules and constraints directly into AI tools, teams influence outputs at the point of creation rather than reviewing work after the fact. ([Figma Blog: 5 Shifts Redefining Design Systems](https://www.figma.com/blog/5-shifts-redefining-design-systems-in-the-ai-era/))

- **Figma's MCP Server** exposes design files as structured, machine-readable context that AI agents can consume directly -- design-to-code as structured data, not screenshot interpretation. ([Figma MCP guide](https://alexbobes.com/tech/figma-mcp-the-cto-guide-to-design-to-code-in-2026/))

- **Nielsen Norman Group assessment (May 2025):** Narrow AI features work well (rename layers, rewrite copy, find similar assets). Broad generation fails -- Figma's First Draft tool produced "generic layouts with poor information hierarchy regardless of prompt detail." Three fundamental barriers: design system integration missing from generation, 500-character prompts insufficient for context, and tools cannot learn organizational context over time. ([NN/g: AI Design Tools Are Marginally Better](https://www.nngroup.com/articles/ai-design-tools-update-2/))

**Pattern:** Governance-at-creation (tokens, locked templates, linting) is more effective than governance-at-review for AI-generated design work. Design systems are becoming the constraint layer that makes AI outputs usable.

### 3. UX Research Has the Most Mature Structured AI Workflows Outside Engineering

- **Five-phase AI integration** is now standard in UX research: Planning (generate research goals, interview questions), Recruiting (personalize outreach, screen candidates), Data Collection (AI moderation, synthetic user testing), Analysis & Synthesis (transcription, thematic clustering, affinity mapping), and Knowledge Sharing (custom GPTs over research repositories, automated highlight reels). ([Great Question: How to Use AI for UX Research](https://greatquestion.co/ux-research/ai-guide))

- **Quality gates are explicit and specific.** The Great Question guide prescribes: request "direct quotes with references" when querying AI analysis tools, use traceability features to "jump to the exact moment it occurred and verify accuracy," and be aware of model biases (GPT-4o's agreeable tendencies require explicit instructions to "be critical"). ([Great Question: How to Use AI for UX Research](https://greatquestion.co/ux-research/ai-guide))

- **Dovetail** operates as a centralization hub where research from various sources is tagged, analyzed, and shared. Its AI transcribes interviews, identifies themes across sessions, and auto-categorizes findings. ([Dovetail AI tools for UX research](https://dovetail.com/ux/ai-tools-for-ux-research/))

- **Maze** generates usability test templates based on common scenarios and suggests optimal task sequences based on what similar studies found effective. Research teams can launch tests in minutes rather than hours. ([Maze: Future of User Research Report 2026](https://maze.co/resources/user-research-report/))

- **Adoption is now near-universal:** 80% of UX researchers use AI in some aspect of their work (up 24 points from 2024). 72% of designers use generative AI tools, and 98% increased usage in the past year. ([Figma's 2025 AI report](https://www.figma.com/reports/ai-2025/))

- **The structural shift:** Organizations where research is essential to all levels of business strategy tripled from 8% (2025) to 22% (2026). But "more research conducted without shared frameworks doesn't lead to better decisions -- it leads to noise." ([Maze: Future of User Research Report 2026](https://maze.co/resources/user-research-report/))

**Pattern:** Research is the non-engineering discipline closest to having a Planner/Worker/Judge equivalent. The five phases map naturally to structured dispatch. The quality gates (source verification, quote tracing, bias awareness) are concrete and automatable.

### 4. The "Code Review for Non-Engineers" Problem Remains Largely Unsolved

- **Engineering has code review, CI/CD, linters, and automated testing.** Non-engineering roles have... nothing equivalent at the same level of rigor.

- **Specbook AI** is the closest parallel for design: it performs cross-document consistency checks on specifications, identifies contradictions within sections, catches missing details, and organizes findings in a "Gap Resolution Matrix sorted by severity." The human then confirms valid issues or dismisses false positives. This is structurally identical to code review. ([Specbook AI: Design Quality Reviews](https://www.specbook.ai/blog/design-quality-reviews/))

- **ChatPRD's CPO-level review** provides structured critique of product documents -- identifying strategic gaps, questioning assumptions, checking for completeness. But it is opt-in and positioned as "coaching," not as a gate. ([ChatPRD platform](https://www.chatprd.ai/))

- **Figma's design linter** checks designs against design system rules automatically. This is the closest to a CI check for design work. ([Figma: Schema 2025](https://www.figma.com/blog/schema-2025-design-systems-recap/))

- **The governance gap:** "Organizations face structural challenges. AI increases throughput and the size of diffs, but human review doesn't scale linearly. Existing quality assurance gates aren't aligned to deal with AI, and many of these pipelines were built for human-paced change, not AI-amplified change." ([CodeRabbit: 2025 was speed, 2026 will be quality](https://www.coderabbit.ai/blog/2025-was-the-year-of-ai-speed-2026-will-be-the-year-of-ai-quality))

**Pattern:** The tools exist in fragments but nobody has assembled them into a coherent review pipeline for PM/Design work. This is a genuine whitespace.

### 5. Microsoft Research Identifies Interaction Patterns Beyond Chat

- **RecommendAI vs. ExtendAI:** Microsoft's CHI 2025 research compared two approaches. RecommendAI gives the human an AI recommendation. ExtendAI requires the human to articulate their reasoning first, then provides feedback on that reasoning. ExtendAI produced better critical thinking and decision quality. The implication: structured AI collaboration should make humans think harder, not less. ([Microsoft Research: Future of AI in Knowledge Work](https://www.microsoft.com/en-us/research/blog/the-future-of-ai-in-knowledge-work-tools-for-thought-at-chi-2025/))

- **Ambient vs. Active assistance:** In meeting contexts, "passive goal assistance through ambient visualization" keeps teams on track without interruption, while "active goal assistance through interactive questioning" intervenes when goals drift. These are structurally different from chat. ([Microsoft Research: Future of AI in Knowledge Work](https://www.microsoft.com/en-us/research/blog/the-future-of-ai-in-knowledge-work-tools-for-thought-at-chi-2025/))

- **Multi-agent ideation (YES AND):** Uses persona-based agents with confidence-based turn-taking for collaborative problem-solving that avoids groupthink. ([Microsoft Research: Future of AI in Knowledge Work](https://www.microsoft.com/en-us/research/blog/the-future-of-ai-in-knowledge-work-tools-for-thought-at-chi-2025/))

- **Critical thinking inversely correlates with AI confidence.** Higher confidence in AI correlates with less critical thinking. Self-confidence in one's own abilities correlates with more critical thinking -- but at perceived higher cognitive cost. Workers reduce scrutiny on routine, time-pressured work. ([Microsoft Research: Future of AI in Knowledge Work](https://www.microsoft.com/en-us/research/blog/the-future-of-ai-in-knowledge-work-tools-for-thought-at-chi-2025/))

- **Copilot Cowork (March 2026):** Microsoft's latest move is multi-step delegation with monitoring and steering. Users delegate meaningful work, Copilot breaks it into steps, reasons across tools and files, and carries work forward with visible progress and opportunities to steer. This is structurally similar to a task dispatch system. ([Microsoft 365 Blog: Powering Frontier Transformation](https://www.microsoft.com/en-us/microsoft-365/blog/2026/03/09/powering-frontier-transformation-with-copilot-and-agents/))

**Pattern:** The research shows that the most effective AI collaboration patterns for knowledge workers are NOT chat. They are: structured reasoning prompts, ambient monitoring, multi-agent deliberation, and multi-step delegation with checkpoints.

### 6. The PM Role Is Evolving Toward Orchestration, Not Execution

- **Reforge's analysis:** Traditional PM workflows (documentation, basic prioritization, coordination) are being automated. What becomes more valuable: strategic vision, judgment, taste, and leadership. AI enables PMs to perform duties typically done by researchers, data analysts, product marketers, designers, and engineers. ([Reforge: How AI Changes Product Management](https://www.reforge.com/blog/how-ai-changes-product-management))

- **The "copilot to agentic" transition:** "The defining shift in AI product management between 2026 and 2030 will be the transition from copilot AI to agentic AI." PMs are becoming context engineers who orchestrate agentic workflows rather than executing tasks themselves. ([AI PM Tools: Future of AI in Product Management](https://aipmtools.org/articles/future-of-ai-product-management))

- **Risk of judgment atrophy:** Linear's Product Intelligence raises a concern: teams might use AI to defer hard prioritization decisions rather than make better ones. "Automating prioritization might atrophy decision-making skills rather than free teams to focus on higher-level strategy." ([Department of Product: Linear's AI feature](https://departmentofproduct.substack.com/p/linears-new-ai-feature-could-replace))

**Pattern:** The PM role is converging with the "Planner" role in a Planner/Worker/Judge pipeline. PMs set context and constraints, AI executes and surfaces options, PMs judge and decide.

---

## Implications for Sherpa

### 1. Non-Engineering Collaboration Needs Structured Pipelines, Not Chat Wrappers

Every successful tool in this research provides structured workflows, not open-ended conversation. Sherpa's convention system (proposals, activity logs, quality gates) maps naturally to non-engineering roles if the interfaces are right:

- **PM workflow:** Signal collection (feedback, metrics) -> Synthesis (pattern detection, clustering) -> Artifact generation (PRD, spec, roadmap update) -> Structured critique (Judge role) -> Decision (human approval gate)
- **Design workflow:** Brief/constraints -> Generation within design system rules -> Linting/consistency check -> Critique against heuristics -> Human approval
- **Research workflow:** Planning (questions, methodology) -> Collection (moderated or automated) -> Synthesis (thematic clustering, affinity mapping) -> Verification (source tracing) -> Knowledge sharing

### 2. Governance-at-Creation Is the Key Pattern

The most effective pattern is not "generate then review" but "constrain then generate." Figma's locked templates, design tokens, and linting are the design equivalent of Sherpa's behavioral constraints and convention rules. For non-engineering roles:

- **PM conventions** should constrain AI-generated specs (required sections, mandatory fields, stakeholder impact analysis) the same way design tokens constrain AI-generated layouts
- **Research conventions** should require source tracing and bias disclosure the same way code review requires test coverage
- **Design conventions** should embed design system rules into generation templates, not review checklists

### 3. The Planner/Worker/Judge Pipeline Extends Naturally

The existing Sherpa dispatch model maps to non-engineering work:

| Engineering | PM Equivalent | Design Equivalent | Research Equivalent |
|-------------|---------------|-------------------|---------------------|
| Code generation | PRD/spec generation | Wireframe/layout generation | Interview guide generation |
| Linting | Spec completeness check | Design system linting | Methodology validation |
| Code review | CPO-level spec critique | Design critique against heuristics | Source verification |
| Tests pass | Stakeholder sign-off | Accessibility/consistency check | Triangulation check |
| Merge | Roadmap integration | Handoff to development | Insight repository update |

### 4. The Quality Gate Gap Is Sherpa's Opportunity

No existing tool has assembled a coherent quality gate pipeline for PM/Design work equivalent to CI/CD. The fragments exist (ChatPRD's critique, Figma's linting, Specbook's consistency checks) but nobody has unified them into a governance framework. Sherpa's Judge role could fill this gap with role-specific quality scorecards.

### 5. ExtendAI > RecommendAI for Non-Engineering Roles

Microsoft's research strongly suggests that AI collaboration for PMs and designers should require humans to articulate reasoning before receiving AI feedback (ExtendAI pattern), not just present recommendations (RecommendAI pattern). This aligns with Sherpa's behavioral engineering approach -- the system should make people think harder, not less.

---

## Open Questions

1. **What does a "design review" convention look like?** Code review has PRs, diffs, approvals, and merge gates. What is the equivalent artifact, diff format, and approval workflow for a PM's spec or a designer's wireframe within Sherpa's filesystem-based governance?

2. **How do you lint a PRD?** Figma can lint designs against tokens. What are the equivalent "tokens" for product specifications? (Required sections? Mandatory stakeholder analysis? User story format compliance? Linked customer evidence?)

3. **How do confidence thresholds work for non-code artifacts?** Linear shows AI reasoning and confidence. How should Sherpa's Judge role express confidence in a spec review vs. a code review? What triggers escalation to human review?

4. **Does the PM become the Planner?** If AI handles execution (drafting, synthesis, analysis), does the PM role collapse into the Planner role -- setting context, constraints, and acceptance criteria -- while AI does the Worker role? Or does the PM need a different pipeline entirely?

5. **How do you prevent judgment atrophy?** If AI handles prioritization, triage, and synthesis, how do PMs and designers maintain the judgment skills they need for high-stakes decisions? Should Sherpa's conventions include "reasoning requirements" (ExtendAI pattern) before AI assistance kicks in?

6. **What does "design system as governance layer" mean for Sherpa?** Figma embeds design rules into AI generation templates. Should Sherpa's convention system serve the same purpose -- embedding product/design rules into AI generation so that outputs are pre-constrained rather than post-reviewed?

7. **How do you version-control non-code artifacts?** Engineers have git diffs. What is the "diff" for a PRD revision or a wireframe update? How do you track what changed, who changed it, and whether the change was human-initiated or AI-generated?
