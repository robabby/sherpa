---
status: integrated
initiative: sherpa-linear-integration
created: 2026-03-21
updated: '2026-03-22'
type: research-synthesis
risk: additive
targets:
  - docs/initiatives/sherpa-linear-integration/research/  # (new file)
dependencies: []
informs:
  - dispatch-evolution
  - scheduled-dispatch
  - dispatch-idempotence
personas:
  - engineer
  - product-manager
spawned-from: null
---

## Summary

Research initiative exploring whether Linear can replace or complement Sherpa's home-rolled task management and agent dispatch system, with a leading candidate architecture: **Sherpa Studio as a Linear Agent** — a governance layer that sits above Linear's project tracking, enforcing behavioral constraints and convention-based lifecycle management. Two rounds of research: first surveys Linear's API, SDK, and extensibility surface; second evaluates specific integration points, the Linear Agent architecture, and build-vs-adopt decisions. The outcome is an actionable recommendation with implementation plan.

**Strategic dual-purpose:** This initiative serves both Sherpa's product evolution (simplify the dispatch roadmap by adopting Linear as state backend) and Rob's job search (Linear is a top employment target — a working Sherpa×Linear integration demo is a compelling interview differentiator).

## State Snapshot

Sherpa currently has a substantial task and dispatch pipeline built on filesystem conventions:

- **Task system:** Markdown files in `docs/tasks/` with YAML frontmatter (status, role, priority, backend, task-type, mode). CRUD via `scripts/task-board.sh`, scanning via `scripts/task-scanner.mjs`, data access via `packages/studio-core/src/tasks.ts`.
- **Dispatch pipeline:** 9 backends (5 CLI, 3 API, 1 gateway), route resolution via `scripts/resolve-route.mjs`, mode guard rails (interactive/supervised/overnight), batch queue via `scripts/dispatch-queue.sh`.
- **Judge system:** `scripts/auto-judge.sh` reviews completed work, writes verdicts, supports retry flow.
- **Studio UI:** Dispatch Center (`dispatch-content.tsx`, 1196 lines) with backlog/assignments/workforce panels. Tasks page (`tasks-content.tsx`, 549 lines) as mission control with split-pane detail view.
- **MCP tools:** 6 task tools in `packages/studio-mcp/src/server.ts` (task_list, task_get, task_create, task_update, task_dispatch, task_logs).
- **In-flight initiatives:** `dispatch-evolution` (approved — simplify UX), `scheduled-dispatch` (pending — cron scheduling), `dispatch-idempotence` (pending — execution guards), `ai-sdk-dispatch` (approved — API backends), plus 4 more.

This system works but is entirely bespoke. Every feature (scheduling, idempotence, state machines, multi-agent assignment) requires a new initiative. Linear already solves many of these problems at scale.

## Proposed Changes

This is a research initiative. No code changes — only new research artifacts.

**Round 1 — Linear Platform Survey**
- `research/linear-api-surface.md` — API capabilities, GraphQL schema, webhooks, OAuth, rate limits
- `research/linear-sdk-extensibility.md` — SDK (TypeScript), automation rules, custom views, integrations ecosystem
- `research/linear-agent-workflows.md` — How Linear handles automation, bot users, programmatic issue management

**Round 2 — Integration Evaluation**
- `research/task-system-comparison.md` — Side-by-side comparison: Sherpa filesystem tasks vs Linear issues (fields, lifecycle, querying, bulk operations)
- `research/dispatch-integration-points.md` — Where dispatch could delegate to Linear (task creation, status tracking, assignment) vs what must stay framework-native (backend resolution, mode guard rails, CLI invocation)
- `research/build-vs-adopt-matrix.md` — Decision matrix for each subsystem: keep (framework-native), adopt (replace with Linear), bridge (sync between both)

**Final artifact:**
- `research/recommendation.md` — Actionable recommendation with migration path if adoption is warranted

## Candidate Architecture: Sherpa as Linear Agent

The leading candidate from Luna's parallel research: register Sherpa Studio as a Linear Agent (OAuth app with `app:assignable`, `app:mentionable` scopes) that operates as the governance layer above Linear's project tracking.

**How it works:** When a human assigns a Linear issue to the Sherpa agent, it triggers a governed initiative lifecycle (proposal → research → implementation → review), enforces behavioral constraints and conventions, and reports progress back to Linear. Linear handles state; Sherpa handles governance.

**Phase 1 (MVP):**
1. Linear MCP consumption — Add Linear's MCP server as a composed tool in Sherpa's MCP layer
2. Initiative ↔ Linear sync — State transitions update corresponding Linear issues/projects
3. OAuth app registration — `app:assignable`, `app:mentionable`, `initiative:read/write` scopes
4. Governance-aware writes — Agents can only perform Linear writes that conform to lifecycle phase and role constraints

**Phase 2 (Marketplace):**
5. Integration Directory submission — Package as a public Linear integration
6. Webhook sync — Real-time bidirectional state sync
7. Studio UI — Linear sync status visible in initiative and process views

**Key insight:** Linear's "Agent Guidance" feature is deliberately lightweight (markdown text hints). Zero governance agents exist in Linear's Integration Directory — first-mover opportunity for Sherpa's behavioral constraint system.

This architecture is evaluated in Round 2 alongside alternatives.

## Rationale

Sherpa's task/dispatch system has grown organically across 8+ initiatives. Each new capability (scheduling, idempotence, state machines) requires building from scratch on filesystem conventions. Linear is a mature platform that already handles issue tracking, project management, cycles, automation, and API-first workflows — all things Sherpa is reinventing.

The strategic question: is Sherpa's value in the *task management* itself, or in the *convention-based governance and agent dispatch* that wraps it? If it's the latter, Linear could be the state backend while Sherpa provides the behavioral layer, dispatch routing, and governance conventions on top.

This also matters for Sherpa Consulting's positioning. If clients already use Linear (many engineering teams do), Sherpa-as-a-Linear-integration is a much easier sell than Sherpa-as-a-replacement-for-your-project-management. And for Rob's job search, a working demo of Sherpa governing Linear workflows is a differentiated artifact that demonstrates both product thinking and technical execution.

## Dependencies

- **Informs `dispatch-evolution`** — if Linear adoption is recommended, the dispatch UX simplification should account for Linear as the task backend instead of filesystem markdown.
- **Informs `scheduled-dispatch`** — Linear has built-in automation and scheduling. If adopted, this initiative may become unnecessary.
- **Informs `dispatch-idempotence`** — Linear's API handles concurrent state safely. Adoption could eliminate the need for filesystem locking and atomic writes.

## Review Notes

**Open questions:**
- Does Linear's free tier support the programmatic access patterns Sherpa needs (bot users, webhooks, API volume)?
- Can Linear model Sherpa's task-type taxonomy and mode guard rails, or would those stay framework-side?
- How does Linear handle agent-generated content (log output, verdicts, metrics) — as comments, attachments, or custom fields?
- What's the migration path for existing `docs/tasks/` files if we adopt Linear?

**Trade-offs:**
- Adopting Linear adds a SaaS dependency to what's currently a fully local, filesystem-based system. This conflicts with the "thumb drive test" for the desktop app.
- Linear integration could dramatically simplify the dispatch roadmap but couples Sherpa to a specific vendor.
- The Judge system (auto-judge, verdicts, retry flow) is Sherpa-specific behavior unlikely to exist in Linear — this would remain framework-native regardless.

**Effort:** 2 sessions
**Session breakdown:**
- Session 1: Round 1 — Linear platform survey (API, SDK, extensibility, agent workflows)
- Session 2: Round 2 — Integration evaluation (comparison, integration points, build-vs-adopt matrix, recommendation)
