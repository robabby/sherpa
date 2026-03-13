# WavePoint → Sherpa Migration Prompts

13 prompts, run one-by-one from a Claude session in the Sherpa repo (`/Users/rob/Workbench/sherpa`).

**Order rationale:** Conventions first (so Sherpa's rules are solid before content references them) → agent infrastructure → agent roles → initiatives (foundational → research → studio) → reconciliations last (need both sides stable).

Check off each prompt as you complete it.

---

## Prompt 1 of 13 — RECONCILE: Convention Rules

- [x] Done

```
I'm migrating work from the WavePoint codebase (../wavepoint/) into Sherpa. This work was originally developed in WavePoint but belongs in Sherpa — it's about the generic agentic governance/workflow/studio framework, not WavePoint's astrology domain.

**Artifacts to reconcile:**
- ../wavepoint/.claude/rules/behavioral-engineering.md
- ../wavepoint/.claude/rules/initiative-convention.md
- ../wavepoint/.claude/rules/worktree-conventions.md
- ../wavepoint/.claude/rules/claude-md-standards.md
- ../wavepoint/.claude/rules/effort-estimation.md

**Mode:** RECONCILE

### Context

Sherpa is a behavioral agentic collaboration framework extracted from WavePoint. WavePoint is the first customer. The two codebases share conventions (initiative system, behavioral agents, rules, skills) but Sherpa's versions are now authoritative. Sherpa's existing docs are at docs/ in this repo. WavePoint's source is at ../wavepoint/.

### Instructions

1. Read each WavePoint rule file listed above
2. Read the corresponding Sherpa rule file at .claude/rules/ (same filename)
3. For each pair, compare and report:
   - What Sherpa already covers that WavePoint duplicates (skip these)
   - What WavePoint has that Sherpa is missing (propose additions)
   - Where they conflict (show both versions, recommend which to keep)
4. Propose specific edits to Sherpa's rule files — don't just describe, show the changes
5. Note which WavePoint versions can be considered superseded after this

### Quality checks
- Never import WavePoint astrology domain concepts into Sherpa
- Preserve the behavioral engineering principle — no identity claims in agent definitions
- Sherpa's versions become authoritative after this — WavePoint will eventually pull from Sherpa, not the other way around
```

---

## Prompt 2 of 13 — MIGRATE: Agent Catalog Infrastructure

- [x] Done

```
I'm migrating work from the WavePoint codebase (../wavepoint/) into Sherpa. This work was originally developed in WavePoint but belongs in Sherpa — it's about the generic agentic governance/workflow/studio framework, not WavePoint's astrology domain.

**Artifacts to migrate:**
- ../wavepoint/docs/agents/README.md
- ../wavepoint/docs/agents/patterns.md

**Mode:** MIGRATE

### Context

Sherpa is a behavioral agentic collaboration framework extracted from WavePoint. WavePoint is the first customer. Sherpa already has a docs/agents/ directory but it may be empty or minimal. These two files define the agent catalog conventions and behavioral patterns that are foundational to Sherpa's agent system.

### Instructions

1. Read both WavePoint files
2. Read whatever currently exists at docs/agents/ in Sherpa
3. Adapt the content for Sherpa:
   - Replace WavePoint-specific paths with Sherpa equivalents
   - Remove references to astrology domain or WavePoint apps
   - Preserve all behavioral engineering principles, patterns, and conventions
   - Reference Sherpa's .claude/rules/behavioral-engineering.md instead of WavePoint's
4. Create or update docs/agents/README.md and docs/agents/patterns.md in Sherpa
5. Report what was migrated and flag anything that needs attention

### Quality checks
- Preserve the behavioral engineering principle — no identity claims in agent definitions
- These files define the schema that all Sherpa agent roles follow — they must be clean and generic
```

---

## Prompt 3 of 13 — MIGRATE: Agent Roles (10 generic roles)

- [x] Done

```
I'm migrating work from the WavePoint codebase (../wavepoint/) into Sherpa. This work was originally developed in WavePoint but belongs in Sherpa — it's about the generic agentic governance/workflow/studio framework, not WavePoint's astrology domain.

**Artifacts to migrate (10 role files):**
- ../wavepoint/docs/agents/roles/judge.md
- ../wavepoint/docs/agents/roles/architect.md
- ../wavepoint/docs/agents/roles/engineer.md
- ../wavepoint/docs/agents/roles/code-reviewer.md
- ../wavepoint/docs/agents/roles/product-manager.md
- ../wavepoint/docs/agents/roles/product-owner.md
- ../wavepoint/docs/agents/roles/research-lead.md
- ../wavepoint/docs/agents/roles/technical-writer.md
- ../wavepoint/docs/agents/roles/ux-researcher.md
- ../wavepoint/docs/agents/roles/designer.md
- ../wavepoint/docs/agents/roles/marketer.md

**Mode:** MIGRATE

**NOT migrating (domain-specific, stay in WavePoint):**
- astrologer.md
- astrocartographer.md

### Context

Sherpa is a behavioral agentic collaboration framework extracted from WavePoint. These 10 roles are domain-agnostic — they work for any organization using Sherpa. The agent catalog conventions should already be in place from the previous migration (docs/agents/README.md and patterns.md).

### Instructions

1. Read all 10 WavePoint role files (use parallel reads)
2. Check what currently exists at docs/agents/roles/ in Sherpa
3. For each role, adapt for Sherpa:
   - Strip any WavePoint-specific context (astrology references, WavePoint app names, domain-specific examples)
   - Preserve all behavioral constraints, dispositions, fail triggers, quality bars
   - Update any path references to Sherpa equivalents
   - Ensure each role follows the behavioral engineering principle (no identity claims)
4. Create all 10 files at docs/agents/roles/ in Sherpa
5. Report a summary: which roles migrated cleanly, which needed significant WavePoint-specific content removed, and any roles where the domain boundary was ambiguous (especially designer.md and marketer.md)

### Quality checks
- No identity claims — only behavioral constraints, domain scoping, quality bars, fail triggers
- Each role should be useful to ANY Sherpa customer, not just WavePoint
- If designer.md or marketer.md have WavePoint-specific design system references, strip those and keep only the generic behavioral definition
```

---

## Prompt 4 of 13 — MIGRATE: Task Board + Reports Conventions

- [x] Done

```
I'm migrating work from the WavePoint codebase (../wavepoint/) into Sherpa. This work was originally developed in WavePoint but belongs in Sherpa — it's about the generic agentic governance/workflow/studio framework, not WavePoint's astrology domain.

**Artifacts to migrate:**
- ../wavepoint/docs/tasks/README.md
- ../wavepoint/docs/reports/README.md

**Mode:** MIGRATE

### Context

Sherpa is a behavioral agentic collaboration framework extracted from WavePoint. The task board (Planner/Worker/Judge dispatch) and operational reports are core Sherpa infrastructure — they define how work gets dispatched, tracked, and reviewed across any Sherpa customer organization.

### Instructions

1. Read both WavePoint convention files
2. Check what currently exists at docs/tasks/ and docs/reports/ in Sherpa (create dirs if needed)
3. Adapt for Sherpa:
   - Replace WavePoint-specific paths, script references (scripts/claude-worker.sh, scripts/lm-worker.mjs), and examples
   - Keep the YAML frontmatter contracts, status lifecycle, and dispatch conventions generic
   - Reference Sherpa's execution pipeline (Pillar 3) rather than WavePoint's specific worker scripts
   - Preserve the Planner/Worker/Judge model — it's a Sherpa core concept
4. Create docs/tasks/README.md and docs/reports/README.md in Sherpa
5. Report what was adapted and flag any WavePoint-specific dispatch mechanisms that Sherpa doesn't have equivalents for yet

### Quality checks
- Task and report conventions must be backend-agnostic — don't assume Claude workers or LM Studio
- The convention should work for any AI tool chain (Claude, Cursor, Copilot, local models, etc.)
```

---

## Prompt 5 of 13 — MIGRATE: Behavioral Agents Initiative

- [x] Done

```
I'm migrating work from the WavePoint codebase (../wavepoint/) into Sherpa. This work was originally developed in WavePoint but belongs in Sherpa — it's about the generic agentic governance/workflow/studio framework, not WavePoint's astrology domain.

**Artifact to migrate:** docs/initiatives/behavioral-agents/

**Mode:** MIGRATE

### Context

Sherpa is a behavioral agentic collaboration framework extracted from WavePoint. The behavioral-agents initiative is the FOUNDING initiative of Sherpa — it defines the agent schema specification and the plan to migrate ~120 agents from agency-agents into behavioral format. This is Sherpa's core product differentiator.

Key decision (from WavePoint, 2026-03-11): This initiative starts the Sherpa codebase. The sherpa-framework-extraction initiative depends on this, not the other way around.

### Instructions

1. Read the full ../wavepoint/docs/initiatives/behavioral-agents/ directory tree (proposal.md, activity.md, research/, schema-spec.md, deliverables/, sub-initiatives/, branches/)
2. Read Sherpa's current docs/initiatives/ to understand existing initiative landscape
3. Migrate the entire directory:
   - This is foundational Sherpa content — most of it should migrate nearly verbatim
   - Update any paths referencing WavePoint (src/lib/studio/, .claude/rules/) to Sherpa equivalents
   - Update frontmatter targets and dependencies to reference Sherpa paths
   - The schema spec, research, and catalog plan are all Sherpa-native content
   - Preserve ALL research iterations and deliverables — this is Sherpa's intellectual foundation
4. Create docs/initiatives/behavioral-agents/ in Sherpa with the full directory tree
5. Report what was migrated, any WavePoint references that needed adaptation, and whether this initiative's status should be updated given Sherpa's current state

### Quality checks
- This initiative defines what "behavioral agent" means — preserve every design decision
- The schema spec is a Sherpa product artifact — it must be domain-agnostic
- Check if any sub-initiatives reference WavePoint-specific agent roles and flag them
```

---

## Prompt 6 of 13 — MIGRATE: Agent Framework Patterns Initiative

- [x] Done

```
I'm migrating work from the WavePoint codebase (../wavepoint/) into Sherpa. This work was originally developed in WavePoint but belongs in Sherpa — it's about the generic agentic governance/workflow/studio framework, not WavePoint's astrology domain.

**Artifact to migrate:** docs/initiatives/agent-framework-patterns/

**Mode:** MIGRATE

### Context

Sherpa is a behavioral agentic collaboration framework extracted from WavePoint. The agent-framework-patterns initiative is a research audit of open-source agent frameworks (agency-agents, paperclip) that informed Sherpa's behavioral agent design. Status: in-progress (research-only, no shared artifact changes).

### Instructions

1. Read the full ../wavepoint/docs/initiatives/agent-framework-patterns/ directory
2. Migrate to Sherpa's docs/initiatives/:
   - This is pure research — should migrate cleanly with minimal adaptation
   - Update any WavePoint-specific references (paths, agent roles, dispatch scripts)
   - Preserve all framework comparisons, pattern analysis, and recommendations
   - Research findings about agency-agents directly feed into Sherpa's behavioral-agents initiative
3. Create the initiative in Sherpa
4. Report what was migrated and whether any findings reference WavePoint-specific implementation details that don't apply to Sherpa

### Quality checks
- Research should reference Sherpa's agent system, not WavePoint's
- Check if recommendations have already been implemented in Sherpa and update status accordingly
```

---

## Prompt 7 of 13 — MIGRATE: Agent Infrastructure Initiative

- [x] Done

```
I'm migrating work from the WavePoint codebase (../wavepoint/) into Sherpa. This work was originally developed in WavePoint but belongs in Sherpa — it's about the generic agentic governance/workflow/studio framework, not WavePoint's astrology domain.

**Artifact to migrate:** docs/initiatives/agent-infrastructure/

**Mode:** MIGRATE

### Context

Sherpa is a behavioral agentic collaboration framework extracted from WavePoint. The agent-infrastructure initiative covers runtime infrastructure for a heterogeneous AI agent fleet: model routing, local model integration, inter-agent communication, execution monitoring. Status: in-progress (planning phase). Four phases planned.

### Instructions

1. Read the full ../wavepoint/docs/initiatives/agent-infrastructure/ directory
2. Migrate to Sherpa's docs/initiatives/:
   - Model routing and dispatch infrastructure is core Sherpa (Pillar 3: Execution Pipeline)
   - Strip WavePoint-specific model recommendations (e.g., specific eval results for WavePoint tasks)
   - Keep the architecture generic: model tiers, routing logic, monitoring patterns
   - Phase 4 (MCP integration) in WavePoint was about astrology primitives — in Sherpa, this becomes about the generic MCP task server
   - Update dependencies to reference Sherpa initiatives, not WavePoint ones
3. Create the initiative in Sherpa
4. Flag any phases or tasks that are WavePoint-specific vs. framework-generic

### Quality checks
- Infrastructure must be backend-agnostic where possible (support Claude, local models, other providers)
- Don't import WavePoint's specific model eval results — Sherpa customers will have different models
- Check if Sherpa already has overlapping research in its existing initiatives (distributed-agent-consistency, mmo-patterns-for-agents)
```

---

## Prompt 8 of 13 — MIGRATE: Studio Collaboration Platform Initiative

- [x] Done

```
I'm migrating work from the WavePoint codebase (../wavepoint/) into Sherpa. This work was originally developed in WavePoint but belongs in Sherpa — it's about the generic agentic governance/workflow/studio framework, not WavePoint's astrology domain.

**Artifact to migrate:** docs/initiatives/studio-collaboration-platform/

**Mode:** MIGRATE

### Context

Sherpa is a behavioral agentic collaboration framework extracted from WavePoint. The studio-collaboration-platform initiative researches what Studio should be as a Human+AI collaboration platform — purpose-built for agentic workflows. Status: approved (research iteration 1 complete). Has 6 research questions covering dashboard design, task dispatch, cost tracking, morning review, governance vs. execution views.

### Instructions

1. Read the full ../wavepoint/docs/initiatives/studio-collaboration-platform/ directory (proposal.md, research/, sub-initiatives/)
2. Migrate to Sherpa's docs/initiatives/:
   - Studio IS Sherpa's UI pillar (Pillar 4) — this research is directly about Sherpa Studio
   - Replace any WavePoint-specific examples (astrology dashboards, transit content panels) with generic equivalents
   - Preserve all research questions, findings, and UX explorations
   - Update references to point to Sherpa's apps/studio/ and packages/studio-ui/
3. Create the initiative in Sherpa
4. Cross-reference with Sherpa's existing studio work and note any overlap or gaps

### Quality checks
- Studio research must be domain-agnostic — "governance dashboard" not "astrology dashboard"
- Morning review, velocity tracking, and hub stats are all generic Sherpa features
- Check if any research findings have already been implemented in Sherpa's Studio app
```

---

## Prompt 9 of 13 — MIGRATE: Studio State Machine Initiative

- [x] Done

```
I'm migrating work from the WavePoint codebase (../wavepoint/) into Sherpa. This work was originally developed in WavePoint but belongs in Sherpa — it's about the generic agentic governance/workflow/studio framework, not WavePoint's astrology domain.

**Artifact to migrate:** docs/initiatives/studio-state-machine/

**Mode:** MIGRATE

### Context

Sherpa is a behavioral agentic collaboration framework extracted from WavePoint. The studio-state-machine initiative evolves Studio from a state mirror (reflects filesystem) to a state machine (understands lifecycle transitions). Status: in-progress. Four phases: velocity signals, lifecycle intelligence, curation surface, prompt/skill feedback loop.

### Instructions

1. Read the full ../wavepoint/docs/initiatives/studio-state-machine/ directory
2. Migrate to Sherpa's docs/initiatives/:
   - State machine logic is core Sherpa infrastructure — the lifecycle engine (Pillar 2: Governance Engine)
   - Replace WavePoint-specific lifecycle examples with generic ones
   - The velocity, curation, and feedback loop phases are all domain-agnostic
   - Update code references from apps/web/src/lib/studio/ to packages/studio-core/
3. Create the initiative in Sherpa
4. Check if any of the planned phases have already been implemented in Sherpa's codebase and update status

### Quality checks
- Lifecycle stages must be configurable (Sherpa's defineConfig vocabulary customization)
- Don't hardcode WavePoint's specific lifecycle stages — keep them as examples at most
- Cross-reference with Sherpa's existing sqlite-agentic-state initiative for overlap
```

---

## Prompt 10 of 13 — MIGRATE: MCP Agent Delegation Initiative (Declined, Reference)

- [x] Done

```
I'm migrating work from the WavePoint codebase (../wavepoint/) into Sherpa. This work was originally developed in WavePoint but belongs in Sherpa — it's about the generic agentic governance/workflow/studio framework, not WavePoint's astrology domain.

**Artifact to migrate:** docs/initiatives/mcp-agent-delegation/

**Mode:** MIGRATE

### Context

Sherpa is a behavioral agentic collaboration framework extracted from WavePoint. The mcp-agent-delegation initiative proposed replacing filesystem task coordination with an MCP server for inter-agent communication. It was DECLINED in WavePoint (2026-03-09) because hard dependencies were unmet and filesystem coordination was working at WavePoint's scale of 3-5 agents.

However, Sherpa already has related initiatives: mcp-coordination-layer, distributed-agent-consistency, mmo-patterns-for-agents. This research may be more relevant in Sherpa's context where multi-customer, multi-agent coordination is a product feature.

### Instructions

1. Read the full ../wavepoint/docs/initiatives/mcp-agent-delegation/ directory
2. Read Sherpa's existing related initiatives: mcp-coordination-layer, distributed-agent-consistency
3. Migrate as reference material:
   - Preserve the proposal, research, and decline rationale
   - Update status to reflect that this is archived reference, not an active initiative
   - Note that the decline reasoning was WavePoint-specific (3-5 agents, filesystem sufficient) and may not apply to Sherpa at scale
   - Cross-reference with Sherpa's existing MCP and coordination initiatives
4. Create in Sherpa, potentially as a sub-initiative or reference under mcp-coordination-layer rather than top-level
5. Report whether this should remain standalone or merge into an existing Sherpa initiative

### Quality checks
- Preserve the decline rationale — it's valuable decision documentation
- Flag which aspects are now being pursued in Sherpa under different initiative names
- Don't resurrect a declined initiative without flagging that it needs re-evaluation
```

---

## Prompt 11 of 13 — RECONCILE: Parallel Workflow Governance Initiative

- [x] Done

```
I'm migrating work from the WavePoint codebase (../wavepoint/) into Sherpa. This work was originally developed in WavePoint but belongs in Sherpa — it's about the generic agentic governance/workflow/studio framework, not WavePoint's astrology domain.

**Artifact to reconcile:** docs/initiatives/parallel-workflow-governance/

**Mode:** RECONCILE

### Context

Sherpa is a behavioral agentic collaboration framework extracted from WavePoint. The parallel-workflow-governance initiative defined the 3-layer governance system (worktrees for isolation, initiative directories for proposals/plans, event logs for awareness). It's already implemented in WavePoint and Sherpa inherited the conventions. But both codebases may have evolved independently.

### Instructions

1. Read the full ../wavepoint/docs/initiatives/parallel-workflow-governance/ directory
2. Read Sherpa's current governance conventions:
   - .claude/rules/initiative-convention.md
   - .claude/rules/worktree-conventions.md
   - Any related initiatives (distributed-agent-consistency, etc.)
3. Compare and report:
   - What WavePoint's initiative documents that Sherpa already has (skip)
   - What WavePoint learned during implementation that Sherpa's docs don't reflect (propose additions)
   - Whether the original proposal's vision has been fully realized or if open items remain
   - Any governance patterns WavePoint evolved post-implementation that Sherpa should adopt
4. Propose specific edits to Sherpa docs if gaps are found
5. This initiative can likely be marked as "integrated" in WavePoint after reconciliation — confirm or flag concerns

### Quality checks
- Governance conventions must be tool-agnostic (not Claude-specific)
- The three layers (isolation, proposals, awareness) are Sherpa's core governance model — any evolution should be captured
- Check if WavePoint's event log layer (Layer 2b) has a Sherpa equivalent
```

---

## Prompt 12 of 13 — RECONCILE: Agentic Workforce Initiative (Split)

- [x] Done

```
I'm migrating work from the WavePoint codebase (../wavepoint/) into Sherpa. This work was originally developed in WavePoint but belongs in Sherpa — it's about the generic agentic governance/workflow/studio framework, not WavePoint's astrology domain.

**Artifact to reconcile:** docs/initiatives/agentic-workforce/

**Mode:** RECONCILE (with partial migration)

### Context

Sherpa is a behavioral agentic collaboration framework extracted from WavePoint. The agentic-workforce initiative built WavePoint's agent workforce: Phase 1 (role catalog of 13 roles — complete), Phase 2 (Studio UI), Phase 3 (governance wiring). This initiative SPLITS: the Planner/Worker/Judge pipeline model and generic workforce patterns belong in Sherpa. WavePoint-specific role wiring and astrology agents stay.

The sub-initiative at sub-initiatives/planner-worker-judge/ is especially relevant — it defines Sherpa's Pillar 3 (Execution Pipeline).

### Instructions

1. Read the full ../wavepoint/docs/initiatives/agentic-workforce/ directory tree (proposal.md, activity.md, sub-initiatives/, research/, etc.)
2. Read Sherpa's current execution pipeline docs and any related initiatives
3. For each component, classify and report:
   - **Sherpa-bound**: Planner/Worker/Judge model, dispatch conventions, task lifecycle, multi-backend dispatch, judge role definition → propose where in Sherpa these belong
   - **WavePoint-specific**: 13-role catalog with astrology roles, WavePoint model eval results, domain-specific dispatch scripts → stays in WavePoint
   - **Shared**: Patterns that are implemented in WavePoint but designed generically → propose Sherpa docs updates
4. For Sherpa-bound content: propose specific additions to Sherpa docs (new initiative, additions to existing initiatives, or docs/plans/)
5. For WavePoint-specific content: confirm it stays, note any dependencies on Sherpa framework features

### Quality checks
- The Planner/Worker/Judge model is a Sherpa core concept — it must be fully documented in Sherpa
- Don't import WavePoint's specific model eval results or worker script implementations
- The sub-initiative planner-worker-judge is the most important piece — make sure its design decisions land in Sherpa
```

---

## Prompt 13 of 13 — RECONCILE: Sherpa Framework Extraction Initiative

- [x] Done

```
I'm migrating work from the WavePoint codebase (../wavepoint/) into Sherpa. This work was originally developed in WavePoint but belongs in Sherpa — it's about the generic agentic governance/workflow/studio framework, not WavePoint's astrology domain.

**Artifact to reconcile:** docs/initiatives/sherpa-framework-extraction/

**Mode:** RECONCILE

### Context

Sherpa is a behavioral agentic collaboration framework extracted from WavePoint. The sherpa-framework-extraction initiative is the active tracker for the code extraction — 13 tasks, 5 complete as of 2026-03-12. It lives in WavePoint because it tracks what code needs to move FROM WavePoint. But Sherpa should have its own perspective on this work.

The extraction plan, research iterations, and architectural decisions documented here are directly about Sherpa's package architecture (studio-core, studio-ui, studio-mcp, studio).

### Instructions

1. Read the full ../wavepoint/docs/initiatives/sherpa-framework-extraction/ directory tree (proposal.md, plan.md, activity.md, research/, deliverables/)
2. Read Sherpa's current package architecture and any related docs
3. Compare and report:
   - What extraction decisions have already been implemented in Sherpa (mark as done)
   - What remains to be extracted (verify against WavePoint's task list)
   - Whether Sherpa should have its own tracking initiative or if WavePoint's is the single source of truth
   - Any architectural decisions in the research that should be captured in Sherpa's docs/
4. Recommend one of:
   a. Sherpa gets a mirror initiative tracking "receiving" the extraction (complementary to WavePoint's "sending" tracker)
   b. Sherpa just references WavePoint's initiative and tracks nothing separately
   c. The initiative moves to Sherpa entirely and WavePoint references it
5. Propose specific docs for whichever option you recommend

### Quality checks
- The plan.md has 13 tasks with specific implementation details — verify accuracy against Sherpa's actual codebase
- Research iterations contain architectural decisions about the @sherpa/studio-* package split — these must be preserved
- Don't duplicate tracking — one source of truth is better than two that drift
```

---

## After All 13 Prompts

Once complete:
1. Review what's left in WavePoint's docs/initiatives/ — the Sherpa-bound ones should be archivable
2. Consider adding a `migrated-to: sherpa` frontmatter field to WavePoint's archived initiatives
3. The 10 generic agent roles can be removed from WavePoint's docs/agents/roles/ (WavePoint keeps only astrologer + astrocartographer)
4. WavePoint's .claude/rules/ shared conventions should eventually pull FROM Sherpa (convention sync — Pillar 7)
