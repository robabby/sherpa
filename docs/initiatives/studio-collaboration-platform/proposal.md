---
status: approved
initiative: studio-collaboration-platform
created: 2026-03-09T00:00:00.000Z
updated: '2026-03-09'
started: 2026-03-09
iteration: 1
type: research-synthesis
risk: evolutionary
targets:
  - apps/studio/src/app/
  - packages/studio-core/src/
  - docs/architecture/intelligence-native.md
dependencies:
  - agentic-workforce
spawned-from: null
---

# Studio as Human+AI Collaboration Platform

## Summary

Sherpa Studio is becoming our internal, purpose-built equivalent of Jira + Confluence — but designed from the ground up for Human+AI collaborative workflows rather than human-only teams. This initiative researches what that means concretely: what Studio should surface, how it differs from traditional project management tools, and how the Planner/Worker/Judge pipeline and initiative governance system should be reflected in the UI.

The insight: traditional tools (Jira, Linear, Notion) assume human-only teams with meetings, sprints, and status updates. Studio assumes a solo human operator managing an AI agent fleet with proposals, task dispatch, automated judging, and morning review. The interaction patterns, information density, and workflow primitives are fundamentally different.

## State Snapshot

**What Studio has today:**
- `/app/studio/process` — Initiative lifecycle visualization (file-tree based)
- `/app/studio/workforce` — Agent role catalog browser
- `/app/studio/research/<slug>` — Research report renderer (JSON → page)
- Initiative detail pages with research iterations and branches
- Proposal approval button (triggers LM Studio plan scaffolding when available)
- File tree scanner for initiatives, workstreams, research reports, session manifests

**What Studio doesn't have:**
- Task board / pipeline view (the Planner/Worker/Judge pipeline has no UI)
- Worker output viewer (logs, reports, verdicts live as raw files)
- Overnight run dashboard (no visibility into dispatched/completed/failed workers)
- Session cost tracking (manifests have token data but no cost roll-up)
- Agent activity timeline (when did what agent do what work)
- Morning review workflow (no structured UI for approve/reject/iterate)

**Analogies to traditional tools:**

| Traditional Tool | Studio Equivalent | Status |
|-----------------|-------------------|--------|
| Jira board | Task pipeline view | Not built |
| Jira backlog | Initiative queue (`/process`) | Built (basic) |
| Confluence space | Initiative directories + research reports | Built (file-based) |
| Sprint planning | `/plan-tasks` skill | Being built |
| Code review | Judge verdict viewer | Not built |
| Standup / status | Workstream files + morning review | Partially built |
| Retrospective | Session manifest analysis | Data exists, no UI |

## Research Questions

1. **What information does a solo operator need on a Monday morning?** Not a scrum board — more like a mission control dashboard. What ran overnight, what succeeded, what needs attention, what's queued.

2. **How should task dispatch be surfaced?** Inline "dispatch" buttons? A dedicated queue management view? How much should the UI know about worker backends (Claude vs LM Studio)?

3. **What's the right interaction pattern for morning review?** Card-by-card approve/reject? Side-by-side diff viewer? Batch operations?

4. **How should cost tracking work?** Token usage from session manifests + Claude API pricing = cost per task, per initiative, per day. Is this useful or anxiety-inducing?

5. **What can we learn from existing solo-operator tools?** Retool, Airplane, internal admin panels. What patterns work for single-user operational dashboards?

6. **Should Studio surface the governance layer differently from the execution layer?** Initiatives/proposals (governance) vs tasks/workers/verdicts (execution) — same page or separate views?

## Dependencies

- `agentic-workforce` — Role definitions feed the workforce page
- Planner/Worker/Judge pipeline (this session's work) — Task board requires task files and scripts to exist

## Proposed Changes (from Iteration 1 research)

### Design Direction: Morning Review as Primary Interaction

Studio's task pipeline UI should be designed around the **morning review ritual** — the solo operator returns after overnight agent work and efficiently processes results. This is not a kanban board. It is:

1. **Exception-first dashboard** — aggregate status cards showing what needs attention, not everything that ran. Management by exception: the default state is "nothing to see here." (Sources: PagerDuty Operations Console, PatternFly aggregate status cards, BrightGauge exception design)

2. **Pipeline status view** (not board) — Temporal-style timeline showing task lifecycle (dispatched → running → completed → judged → accepted/rejected). Status is binary-ish (working / waiting-for-you / done / failed), not columnar. (Sources: Temporal UI, Inngest dashboard, Devin favicon dots)

3. **Keyboard-driven review queue** — Linear Triage pattern: `1` approve, `2` iterate, `3` reject, `H` snooze. Auto-advance. Confidence-based routing splits queue into quick-approve (high confidence) and deep-review (low confidence) tracks. (Sources: Linear Triage, Superhuman Split Inbox, HITL Green/Amber/Red model)

4. **Artifact-first output** — foreground what was produced (proposals, PRs, content), not what steps ran. Workers produce structured summaries (GitHub Actions job summary pattern). Three-level progressive disclosure: status list → structured summary → raw log. (Sources: GitHub Actions, Dagster asset graph, n8n execution replay)

5. **Retrospective cost visibility** — per-initiative token/cost summaries (not real-time meters). Anomaly detection flags unusual spikes. Frame as informational "weather report," not judgmental "bill." (Sources: ccusage, AWS Cost Anomaly Detection, Token Anxiety research)

6. **Governance and execution stay separate** — Process page handles initiatives (strategic). Task pipeline handles execution (operational). They cross-link but don't merge. (Sources: all vectors converged on this independently)

### Target: `apps/studio/src/app/`

New route: `/app/studio/tasks` (or `/app/studio/pipeline`) with:
- Morning summary header (aggregate status cards)
- Task list with side-panel detail (PagerDuty pattern)
- Review queue mode (Linear Triage keyboard shortcuts)
- Cost summary panel (retrospective, per-initiative)

### Target: `packages/studio-core/src/`

New modules:
- `task-scanner.ts` — reads `docs/tasks/*.md`, parses frontmatter + status
- `cost-aggregator.ts` — maps session manifest tokens to USD by model
- `review-queue.ts` — groups tasks by confidence/type for morning review

### Target: `docs/architecture/intelligence-native.md`

Add to Operating Model section: Studio as the governance UI for the three-layer stack (Isolation / Governance / Orchestration). The "Jira+Confluence for AI" framing is validated by research — every agent fleet tool independently converges on the same pattern.

## Rationale

Research across 5 vectors (50+ sources) consistently shows:
- Solo operator dashboards use exception-first design, not comprehensive reporting
- AI worker management uses pipeline status, not kanban boards
- Morning review is the killer interaction pattern for async human+AI workflows
- Cost visibility should be retrospective and informational, not real-time and judgmental
- The governance/execution split maps cleanly to Studio's existing initiative system + new task pipeline

Key validations: nachoal/ai-fleet independently arrived at WavePoint's worktree model. Claude Code Agent Teams uses filesystem task lists. Height.app's shutdown proves AI-native PM is a feature, not a product. Temporal/Inngest/Trigger.dev are the right UX analog, not Jira/Linear.

## Review Notes

- This is a research initiative moving toward implementation direction. Iteration 1 research is complete with concrete design patterns.
- Studio is internal tooling — information-dense and operationally useful, not pretty.
- Risk of over-building remains: the morning review can start as a simple page reading `docs/tasks/` before the full Planner/Worker/Judge pipeline ships.
- Next iteration should produce wireframes or a concrete component spec.
