# The Product Manager in Convention-Driven Collaboration

## Research Question

What does a Product Manager's AI-augmented workflow look like concretely in a convention-driven system? What artifacts, templates, quality gates, and AI-assisted workflows does a PM need?

## Method

Web research across four vectors: PM-specific structured artifacts, AI-assisted PM workflows in practice, the PM as initiative governor in agentic systems, and convention templates from tools (Linear, Productboard, Notion, Shape Up, Spotify DIBB). 18 sources consulted.

---

## 1. PM-Specific Artifacts That Are Convention-Worthy

### The Core Set (Six Artifact Types)

Research across PRD template collections, Shape Up documentation, and product operations tools surfaces six PM artifact types that are (a) created repeatedly, (b) benefit from structured schemas, and (c) participate in governance lifecycles:

**1. Product Brief / Pitch**
The PM's primary authoring artifact. Equivalent to an engineer's PR description but for scope decisions.

Structure converges across Shape Up pitches ([basecamp.com/shapeup/1.5-chapter-06](https://basecamp.com/shapeup/1.5-chapter-06)), Lenny Rachitsky's 1-Pager ([lennysnewsletter.com/p/my-favorite-templates-issue-37](https://www.lennysnewsletter.com/p/my-favorite-templates-issue-37)), and Kevin Yien's PRD ([prodmgmt.world/blog/prd-template-guide](https://www.prodmgmt.world/blog/prd-template-guide)):

- Problem statement (the critical section -- "nailing the problem statement is the single most important step" per Rachitsky)
- Appetite / time budget (not an estimate -- a constraint on scope, per Shape Up)
- Solution sketch (macro-level, preserves team autonomy)
- Success metrics (how we know it worked)
- Rabbit holes (known risks, pre-addressed)
- No-gos (explicitly excluded scope)
- Open questions

This maps directly to Sherpa's `proposal.md` but adds PM-specific fields: `appetite`, `success-metrics`, `no-gos`. The existing proposal frontmatter handles status, risk, targets, and dependencies.

**2. Product Decision Record (PDR)**
The PM equivalent of an ADR. Records what was decided, why, what alternatives were considered, and expected outcomes. ([launchnotes.com/glossary/decision-log-in-product-management-and-operations](https://www.launchnotes.com/glossary/decision-log-in-product-management-and-operations))

Fields: decision, date, decider, context, alternatives-considered, rationale, expected-outcome, status (active/superseded/reversed), revisit-date.

Spotify's DIBB framework ([product-frameworks.com/DIBB.html](https://www.product-frameworks.com/DIBB.html)) provides a complementary structure: Data (facts) -> Insight (pattern) -> Belief (hypothesis) -> Bet (action). Each bet was linked to a two-page document with sponsor, stakeholders, success metrics, and the DIBB chain.

**3. Customer Evidence Summary**
Structured synthesis of customer signals. Not raw notes but curated evidence linking customer quotes to product decisions.

Structure from Dovetail, Granola, and Productboard research ([granola.ai/blog/ai-notetaker-product-teams-roadmap-decisions](https://www.granola.ai/blog/ai-notetaker-product-teams-roadmap-decisions)):

- Theme (tagged category)
- Signal strength (number of unprompted mentions, severity of workarounds)
- Representative quotes (with source links)
- Related decisions or proposals
- Date range of evidence collection

The insight repository pattern: "at the top are high-level customer insights; in the middle are individual customer observations, date-stamped and tagged" ([uxforthemasses.com/customer-insights-repository](https://www.uxforthemasses.com/customer-insights-repository/)).

**4. Scope Boundary Document**
Explicit record of what's in and what's out for a given cycle. Shape Up calls these "no-gos" within pitches; Kevin Yien's PRD has a dedicated "Non Goals" section; Asana's spec template enforces scope approval before solution work begins ([prodmgmt.world/blog/prd-template-guide](https://www.prodmgmt.world/blog/prd-template-guide)).

This might not need its own file type -- it may be a section within the product brief. But the **scope-hammering** discipline ("outstanding tasks must be true must-haves that withstood every attempt to scope hammer them" -- [basecamp.com/shapeup/3.5-chapter-14](https://basecamp.com/shapeup/3.5-chapter-14)) needs a governed record.

**5. Stakeholder Update**
Structured status communication. Common sections: progress toward goals, key risks/blockers, decisions needed, upcoming milestones ([thepzeropm.com/weekly-product-update-template](https://www.thepzeropm.com/weekly-product-update-template/), [productplan.com/learn/the-product-managers-guide-to-status-updates](https://www.productplan.com/learn/the-product-managers-guide-to-status-updates/)).

Productboard's AI agent workflow generates these automatically: "pulls development progress from Linear, gathers usage metrics from PostHog, collects sentiment data from feedback tools, synthesizes findings into an executive report" running on Sunday evenings with results by Monday morning ([productboard.com/blog/the-power-of-ai-agents-in-product-operations-workflows](https://www.productboard.com/blog/the-power-of-ai-agents-in-product-operations-workflows/)).

This is the strongest candidate for full AI generation with PM review-only governance.

**6. Prioritization Scorecard**
Structured comparison of competing bets using a consistent framework (RICE, ICE, or custom). Fields: item, reach, impact, confidence, effort, score, rank ([intercom.com/blog/rice-simple-prioritization-for-product-managers](https://www.intercom.com/blog/rice-simple-prioritization-for-product-managers/)).

Like the scope boundary, this may live as a section within the product brief rather than a standalone artifact. But the scoring metadata should be in frontmatter so Studio can sort and filter.

### What About PRDs?

Full PRDs (10+ section documents) appear to be fragmenting. ChatPRD offers 26+ template types ([chatprd.ai/docs/included-templates](https://www.chatprd.ai/docs/included-templates)), but the trend is toward smaller, focused artifacts. Intercom's Intermission is one page. Lenny's 1-Pager is one page. Shape Up's pitch is five sections. Kevin Yien's PRD uses stage gates (Draft -> Problem Review -> Solution Review -> Launch Review -> Launched) but the artifact itself is modular.

**Implication for Sherpa:** Rather than a monolithic PRD convention, use the product brief as the core artifact and let the PM compose additional detail through linked artifacts (customer evidence, decision records, scope boundaries). This matches how the initiative system already works -- `proposal.md` is the nucleus, with optional `plan.md`, `activity.md`, and `research/` as needed.

---

## 2. AI-Assisted PM Workflows in Practice

### What AI Actually Does for PMs Today

Research from prodmgmt.world, Odin AI, StoriesOnBoard, and Productboard surfaces concrete workflows, not hypotheticals:

**Feedback synthesis (highest adoption, highest time savings):**
- "I used to spend two days a month synthesizing our customer interviews. Now I upload the transcripts to an AI tool and get 90% of the value in 15 minutes" ([blog.getodin.ai/ai-agents-product-managers](https://blog.getodin.ai/ai-agents-product-managers/))
- Automated pipelines: interview -> transcription (Fireflies) -> thematic analysis (Claude API) -> structured insights (Notion/Airtable) -> Slack summary ([prodmgmt.world/blog/ai-for-product-managers](https://www.prodmgmt.world/blog/ai-for-product-managers))
- Granola's Recipe system: reusable prompt templates extract pain points, workarounds, feature requests, and JTBD statements, then link directly to transcript evidence ([granola.ai/blog/ai-notetaker-product-teams-roadmap-decisions](https://www.granola.ai/blog/ai-notetaker-product-teams-roadmap-decisions))

**Document scaffolding (second highest adoption):**
- ChatPRD converts "brief problem statements or feature ideas into structured PRDs with sections for scope, users, flows, and non-functional requirements" ([chatprd.ai](https://www.chatprd.ai/))
- AI generates acceptance criteria in Gherkin format, user stories in standard format, and multiple variants at escalating strictness levels ([storiesonboard.com/blog/ai-agents-product-management-2026](https://storiesonboard.com/blog/ai-agents-product-management-2026))

**Status generation (emerging, high potential):**
- Productboard's agent runs Sunday evening, pulls from Linear + PostHog + feedback tools, delivers Monday morning report ([productboard.com/blog/the-power-of-ai-agents-in-product-operations-workflows](https://www.productboard.com/blog/the-power-of-ai-agents-in-product-operations-workflows/))
- Decision logs auto-generated: "automatically log the reasoning, alternatives considered, and expected outcomes" ([blog.getodin.ai/ai-agents-product-managers](https://blog.getodin.ai/ai-agents-product-managers/))

**Competitive monitoring (lower adoption but growing):**
- Agents track competitor releases, pricing changes, and market signals, delivering structured briefs ([blog.getodin.ai/ai-agents-product-managers](https://blog.getodin.ai/ai-agents-product-managers/))

### The Judgment Hierarchy

prodmgmt.world articulates the key pattern clearly:

- **AI excels at:** Synthesis, drafting, framework exploration, document restructuring
- **AI fails at:** Trade-off decisions, political context, strategic judgment, understanding unstated stakeholder goals
- **Use AI for:** Preparation and options analysis; reserve human attention for actual choices

This maps to Sherpa's Planner/Worker/Judge:
- **Worker** generates drafts (customer evidence summaries, status updates, brief scaffolds)
- **Planner** structures the work (which research to synthesize, what questions to answer)
- **Judge** is the PM themselves -- approving scope, making trade-offs, validating decisions

---

## 3. The PM as Initiative Governor

### How the PM Role Shifts When Agents Execute

The research converges on a specific reframing: the PM shifts from author-of-everything to **governor of scope and quality**.

"The goal isn't to automate judgment but to offload repetitive execution and synthesis so product managers can focus on decisions that matter" ([agentstoday.substack.com/p/agents-today-16-the-great-reshuffling](https://agentstoday.substack.com/p/agents-today-16-the-great-reshuffling)).

"Tasks requiring human excellence include critical thinking and creative problem solving, emotional intelligence and cultural navigation, strategic storytelling and product evangelism" ([egonzehnder.com/functions/technology-officers/insights/how-ai-is-redefining-the-product-managers-role](https://www.egonzehnder.com/functions/technology-officers/insights/how-ai-is-redefining-the-product-managers-role)).

### The PM's Morning Review

From StoriesOnBoard's 2026 analysis, the PM morning shifts from status-checking to decision-making:

1. **Agent summary arrives** -- overnight changes across map, backlog, and repo since yesterday
2. **PM reviews proposals** -- inline with side-by-side human/agent edits visible
3. **PM approves, adjusts, or rejects** -- with clear authorship attribution
4. **Team discusses** -- only flagged risks and decisions, not status busywork

([storiesonboard.com/blog/ai-agents-product-management-2026](https://storiesonboard.com/blog/ai-agents-product-management-2026))

In Sherpa terms, this morning review maps to:
- Review agent-generated `proposal.md` files (new proposals overnight from `/rr` research cycles or worker agents)
- Review `activity.md` updates (what did dispatch workers accomplish?)
- Set appetite for next cycle (update proposal frontmatter with time constraints)
- Approve/reject scope (change proposal status from `pending` to `approved` or `declined`)
- Write scope boundaries (add no-gos to prevent scope creep in approved work)

### Governance Patterns

CompanyOS ([adventuresinclaude.ai/posts/2026-02-21-running-a-company-on-markdown-files](https://adventuresinclaude.ai/posts/2026-02-21-running-a-company-on-markdown-files/)) demonstrates the critical gate pattern: for irreversible actions, explicit human approval is required. "Any edit -- even fixing a typo -- resets the approval" gate.

This aligns with Sherpa's existing governance: proposals require approval before work begins, and the Judge reviews completed work. For PM conventions specifically, the approval gates should be:

- **Product brief approval** -- before engineering starts (PM approves problem/appetite/scope)
- **Scope change approval** -- if scope expands beyond no-gos (PM re-approves)
- **Ship decision** -- go/no-go at launch readiness (PM confirms success criteria are met)

---

## 4. Convention Templates That Work for PMs

### Metadata Fields from Production Systems

Aggregating from Linear, Notion, Productboard, and Spotify:

**Linear issue states:** Backlog, Todo, In Progress, In Review, Ready to Merge, Done, Canceled ([linear.app/docs/configuring-workflows](https://linear.app/docs/configuring-workflows))

**Notion product database fields:** Status (To Do / In Progress / Complete), Priority, Owner, Labels (multi-select), Related items, Due date ([notion.com/help/database-properties](https://www.notion.com/help/database-properties))

**Spotify bet metadata:** Primary sponsor, stakeholders, success metrics, related bets, DIBB chain (Data/Insight/Belief/Bet) ([marcabraham.com/2023/01/20/my-product-management-toolkit-56-spotifys-bets-board](https://marcabraham.com/2023/01/20/my-product-management-toolkit-56-spotifys-bets-board/))

**Notion product bet fields:** Status (idea / blocked / queue for discovery / discovery / queue for delivery / delivery / done), Tags (product, milestone, discipline, roadmap category), Hypothesis statement, Linear/Figma/Whimsical links ([alaniswright.com/blog/managing-product-backlog-bets-with-notion](https://alaniswright.com/blog/managing-product-backlog-bets-with-notion/))

**Kevin Yien's PRD stages:** Draft -> Problem Review -> Solution Review -> Launch Review -> Launched ([prodmgmt.world/blog/prd-template-guide](https://www.prodmgmt.world/blog/prd-template-guide))

### Proposed PM Frontmatter Schema for Sherpa

Synthesizing across all sources, here is what PM-specific frontmatter would add to the existing proposal schema:

```yaml
---
# Existing proposal fields (unchanged)
status: pending | approved | in-progress | integrated | declined | archived
initiative: <slug>
created: 2026-03-15
updated: 2026-03-15
type: product-brief | product-decision | customer-evidence | stakeholder-update
risk: additive | evolutionary | structural
targets: []
dependencies: []

# PM-specific fields
appetite: "2 sessions" | "1 week" | "6 week cycle"
problem: "<one-line problem statement>"
success-metrics:
  - metric: "<what to measure>"
    target: "<threshold for success>"
no-gos:
  - "<explicitly excluded scope item>"
customer-evidence-count: <number of supporting customer signals>
prioritization:
  reach: <1-10>
  impact: <1-3>
  confidence: <0-100%>
  effort: <sessions>
decision-stage: problem-review | solution-review | launch-review | launched
---
```

### Stage Gates (from Kevin Yien / Asana)

The stage gate pattern is worth adopting. A product brief progresses through:

1. **Draft** -- PM is still shaping, not ready for review
2. **Problem Review** -- Stakeholders confirm the problem is worth solving and appetite is right
3. **Solution Review** -- Team confirms the proposed approach fits the appetite
4. **Launch Review** -- Go/no-go decision based on success criteria readiness
5. **Launched** -- Live, measuring against success metrics

This maps to Sherpa's existing `status` field but adds PM-specific decision points. The `decision-stage` field tracks where in the PM lifecycle the artifact sits, independent of the initiative's overall status.

---

## Synthesis

### How the PM Maps to Sherpa's Planner/Worker/Judge

The Designer's primary role is Judge (governing visual/UX quality). The Engineer's primary role is Worker (producing code). **The PM's primary role is Planner** -- scoping what to build, setting appetite, defining success, and governing the boundary between "in scope" and "out of scope."

The PM also:
- **Works** as a Worker when synthesizing customer evidence, drafting briefs, and writing stakeholder updates (but AI handles much of this)
- **Judges** as a Judge when reviewing agent-generated proposals, approving scope changes, and making go/no-go decisions

But the differentiating contribution is scope governance: the PM decides what to build, how much to invest, and when to stop.

### Convention-at-Creation for PMs

Following Iteration 1's principle, PM conventions should be embedded at creation time:

- **Product brief template** with pre-filled sections (problem, appetite, no-gos, success metrics) -- the PM fills in the blanks, the structure enforces completeness
- **Smart defaults** for frontmatter (appetite defaults to "2 sessions", risk defaults to "additive", decision-stage defaults to "problem-review")
- **Studio form generation** from Zod schemas so the PM never writes YAML
- **AI scaffolding** -- given a problem statement, AI generates a draft brief with suggested appetite, potential rabbit holes, and no-gos for PM review

### PM Quality Gate: The Scope Scorecard

Parallel to the content quality scorecard (`.claude/rules/content-quality.md`) and the design review scorecard (from Iteration 2), the PM needs a scope quality scorecard:

1. **Problem sourced** -- Problem statement backed by customer evidence, not assumption
2. **Appetite explicit** -- Time budget stated as a constraint, not an estimate
3. **No-gos defined** -- At least one explicit exclusion (forces scope discipline)
4. **Success measurable** -- Metrics have concrete targets, not "improve X"
5. **Rabbit holes addressed** -- Known risks called out with mitigation approach
6. **Dependencies mapped** -- Related initiatives and blockers identified
7. **Evidence count** -- At least N customer signals supporting the problem (configurable threshold)

3+ failures blocks progression from problem-review to solution-review. The Judge role evaluates against this scorecard.

---

## Proposals Generated

This research feeds directly into the PM persona definition within `ux-product-personas`. Specific outputs to carry forward:

1. **Product Brief frontmatter schema** -- Zod schema for `@sherpa/studio-core` extending the proposal schema with PM-specific fields (appetite, success-metrics, no-gos, decision-stage, prioritization)
2. **Scope Quality Scorecard** -- 7 criteria for PM quality gates, parallel to content-quality.md and the design review scorecard
3. **Product Decision Record convention** -- Standalone artifact type for recording scope/prioritization/go-no-go decisions with DIBB-compatible structure
4. **Customer Evidence Summary convention** -- Structured format for curated customer signals with theme tagging and quote linking
5. **`/shape` skill candidate** -- AI-assisted product brief generation: given a problem statement, generate draft brief with appetite suggestion, rabbit holes, and no-gos for PM review

## Open Questions for Next Iteration

1. **How should prioritization scores aggregate across initiatives?** Individual RICE/ICE scoring is straightforward, but portfolio-level comparison (comparing bets across initiatives) needs a governed approach. This connects to Studio's initiative dashboard.
2. **What does the PM's overnight dispatch queue look like?** Engineers dispatch coding tasks. PMs could dispatch research synthesis, competitive analysis, and status generation tasks. What task types and backends serve PM dispatch?
3. **How do customer evidence summaries accumulate over time?** Individual summaries are per-research-cycle, but the PM needs a longitudinal view. Does this require a research repository convention or just Studio views over existing files?
4. **Should the scope quality scorecard be configurable per organization?** The 7-criteria scorecard may need tuning. Is this a `sherpa.config.ts` concern or a convention file?
