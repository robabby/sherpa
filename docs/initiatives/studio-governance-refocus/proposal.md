---
status: pending
initiative: studio-governance-refocus
created: 2026-06-17
updated: '2026-06-17'
type: roadmap-update
risk: structural
targets:
  - CLAUDE.md                                                    # (reframe — Seven Pillars, dispatch sections)
  - README.md                                                    # (reframe — positioning)
  - sherpa.config.ts                                             # (remove dispatch section)
  - apps/studio/src/app/(studio)/tasks                           # (remove)
  - apps/studio/src/app/(studio)/dispatch                        # (remove)
  - apps/studio/src/app/(studio)/workforce                       # (remove)
  - apps/studio/src/app/(studio)/workflow                        # (merge into playbooks)
  - apps/studio/src/app/(studio)/sessions                        # (repoint to Claude Code logs)
  - apps/studio/src/app/(studio)/mcp                             # (slim to governance API)
  - apps/studio/src/app/(studio)/process                         # (reframe as centerpiece + provenance)
  - apps/studio/src/app/(studio)/actions/command-palette-items.ts # (prune removed routes)
  - apps/studio/src/lib/staleness.ts                             # (extend: git-commit drift)
  - packages/studio-ui/src/studio-sidebar.tsx                    # (nav reorg: GOVERN/AUTHOR/OBSERVE)
  - packages/studio-ui/src/studio-shell-header.tsx               # (nav reorg)
  - packages/studio-ui/src/catalog.ts                            # (panel registry prune)
  - packages/studio-ui/src/provenance-header.tsx                 # (elevate to centerpiece)
  - packages/studio-ui/src/dispatch-content.tsx                  # (remove)
  - packages/studio-ui/src/workforce-content.tsx                 # (remove)
  - packages/studio-ui/src/hub-dispatch-panel.tsx                # (remove)
  - packages/studio-ui/src/hub-tasks-panel.tsx                   # (remove)
  - packages/studio-ui/src/hub-workforce-panel.tsx               # (remove)
  - packages/studio-ui/src/hub-sessions-panel.tsx                # (repoint)
  - packages/studio-mcp/src/server.ts                            # (remove task_*/authority_*/lm_status)
  - packages/studio-mcp/src/authority                            # (remove subsystem)
  - packages/studio-core/src/index.ts                            # (remove dispatch/tasks/linear exports)
  - packages/studio-core/src/dispatch.ts                         # (remove)
  - packages/studio-core/src/dispatch-meta.ts                    # (remove)
  - packages/studio-core/src/tasks.ts                            # (remove)
  - packages/studio-core/src/task-events.ts                      # (remove)
  - packages/studio-core/src/linear-client.ts                    # (remove)
  - packages/studio-core/src/linear-mapping.ts                   # (remove)
  - packages/studio-core/src/linear-tasks.ts                     # (remove)
  - packages/studio-core/src/config/schema.ts                    # (remove dispatch field)
  - packages/studio-core/src/config/types.ts                     # (remove DispatchConfig)
  - packages/studio-core/src/config/defaults.ts                  # (remove DEFAULT_DISPATCH merge)
  - scripts/dispatch.sh                                          # (remove)
  - scripts/worker.sh                                            # (remove)
  - scripts/dispatch-queue.sh                                    # (remove)
  - scripts/auto-judge.sh                                        # (remove)
  - scripts/resolve-route.mjs                                    # (remove)
  - scripts/task-scanner.mjs                                     # (remove)
informs:
  - agentic-workforce
  - studio-workflow-canvas
  - linear-initiative-sync
  - ai-sdk-dispatch
  - dispatch-evolution
  - agentic-workspace
  - agentic-runtime-platforms
  - behavioral-agents
personas:
  - engineer
  - product-manager
spawned-from: null
---

# Refocus Sherpa Studio on the Governance Lifecycle

## Summary

Sherpa Studio has proliferated into multiple lenses and become unwieldy. This initiative makes it do one thing well: be the **governance engine** for human+AI initiatives — propose → shape → plan → integrate, with provenance the whole way. It removes the autonomous-agent dispatch/execution layer (Tasks, Dispatch, Workforce, the authority subsystem, the 9-backend router, and the dispatch scripts), repoints the observation surfaces (Sessions, MCP) to serve governance, and elevates the already-built provenance system to the centerpiece. Agentic execution is delegated to the tools where it already happens — Claude Code today, OpenClaw/Luna and others as external collaborators.

## State Snapshot

**The app today (13 nav routes, grouped OPERATIONS / KNOWLEDGE / SYSTEM / ACTIVITY):**

- **Dispatch/execution (to remove):** `tasks/` (mission board), `dispatch/` (interactive/supervised/overnight control), `workforce/` (agent role catalog). Plus their hub panels (`hub-{dispatch,tasks,workforce}-panel.tsx`) and content components (`dispatch-content.tsx`, `workforce-content.tsx`).
- **Observation (to repoint):** `sessions/` already logs **Claude Code** sessions (model, tokens, files modified, commits, outcome per initiative) — human+AI collaboration telemetry, not agent runs. `mcp/` shows the MCP server dashboard.
- **Governance/knowledge (to keep):** `process/` (initiative lifecycle workspace), `research/`, `docs/`, `conventions/`, `skills/`, `playbooks/`, `activity/`.
- **Redundant:** `workflow/` renders a phase-blueprint DAG (research→shape→design→plan) that overlaps `playbooks/`.

**Coupling (verified):** The governance half is cleanly separable. `studio-core/src/initiative-ops.ts` and `lifecycle.ts` have zero dispatch imports. The dispatch surface is: `studio-core/index.ts` exports (`./dispatch` L8, `./tasks` L15, `./task-events` L16, `./linear-client` L20, `./linear-mapping` L21, `./linear-tasks` L22); the `studio-mcp` server's `task_*` / `authority_*` / `lm_status` tools and `authority/` subsystem; an optional `dispatch?` config field; and six `scripts/*.{sh,mjs}` helpers. The MCP server **also** exposes governance tools (`search_knowledge`, `get_summary`, `initiative_list/get/create/approve/update_status/append_activity`) that stay.

**Provenance already exists** (from the integrated `self-documenting-system`): `provenance-header.tsx` renders banners, `staleness.ts` computes staleness — but **by date** (`fresh`/`aging`/`stale` from days elapsed), not by git activity. The convention (`.claude/rules/provenance-convention.md`) specifies a git-aware banner ("N commits to related code since verified") that is **not yet implemented**.

**Portfolio:** ~75 initiatives. ~20 concern the agentic-execution layer (e.g. `agentic-workforce` in-progress, `dispatch-evolution`/`ai-sdk-dispatch` approved, `mcp-multi-backend-dispatch`/`parallel-workflow-governance`/`sqlite-agentic-state` integrated). The governance foundations are integrated: `self-documenting-system`, `mcp-initiative-governance`, `multi-project-studio`, `studio-state-machine`.

## Proposed Changes

### 1. Excise dispatch from the app
Remove the `tasks/`, `dispatch/`, `workforce/` routes and their hub/content components. Prune their entries from `command-palette-items.ts`, `studio-sidebar.tsx`, `studio-shell-header.tsx`, and the `catalog.ts` panel registry. Merge the `workflow/` DAG into `playbooks/` so there is one canonical view of the process flow. The Workforce *tab* goes, but the behavioral **role definitions** it displayed (`docs/agents/roles/`, `agents/`) are **kept as authored conventions** and surface in the AUTHOR group rather than as a dispatch catalog — their exact home (folded into Conventions vs. a lightweight Roles view) is a `/shape` decision.

### 2. Excise dispatch from the packages
- **studio-core:** drop the dispatch/tasks/linear exports from `index.ts`; remove `dispatch.ts`, `dispatch-meta.ts`, `tasks.ts`, `task-events.ts`, `linear-client.ts`, `linear-mapping.ts`, `linear-tasks.ts`; remove the optional `dispatch?` field from `config/{schema,types,defaults}.ts`.
- **studio-mcp:** remove `task_*`, `authority_*`, and `lm_status` tools from `server.ts` and delete the `authority/` lease subsystem. Keep and grow the governance tools — these are the **governance API** Claude Code uses to drive the lifecycle.
- **repo:** delete `scripts/{dispatch,worker,dispatch-queue,auto-judge}.sh`, `scripts/{resolve-route,task-scanner}.mjs`, and the `dispatch` section of `sherpa.config.ts`.

### 3. Repoint the observation surfaces
- **Sessions:** wire to real Claude Code session logs (`~/.claude/projects/...`) rather than the dispatch-fed source, so it reflects actual human+AI work.
- **MCP tab:** re-present the slimmed server as the "governance API," dropping the Tasks tool category.

### 4. Elevate provenance to the centerpiece (the one real build)
Extend `staleness.ts` (or a sibling) to compute git-aware drift — commits touching a doc's related paths since its `last-verified` — and render the convention's "possibly stale" banner via `provenance-header.tsx`. Surface the human **mark-verified** action in the Process/Docs view (the one write Studio genuinely needs; "a human verified this" can't be delegated). Make provenance/drift the visible spine of the Process view rather than a detail buried in Docs.

### 5. Reframe identity & nav
- Rewrite `CLAUDE.md`: Governance Engine becomes the headline; remove Pillar 3 (Execution Pipeline), the 9-backend Dispatch section, and the `scripts/dispatch.sh` references. Reposition from "behavioral *agentic* collaboration framework" to "human+AI governance & convention engine." Update `README.md` to match.
- Reorganize the sidebar into three groups mapping the spine: **GOVERN** (Process) · **AUTHOR** (Conventions, Skills, Playbooks, Docs, Research) · **OBSERVE** (Sessions, Activity, MCP).

### 6. Portfolio triage
Disposition the ~20 agentic-layer initiatives: decline/archive those made moot (dispatch routing, authority, runtime), salvage the parts that still apply to human+AI collaboration (e.g. behavioral role definitions survive as authored *conventions*, context-scoping research may inform skills). Pause/supersede conflicting approved work (see Dependencies).

## Rationale

**Focus.** A governance engine that works flawlessly beats a sprawling platform that also half-dispatches agents. The dispatch surface is large to maintain (9 backends, scripts, authority leases) and the agentic-execution market is crowding fast (Claude Code, OpenClaw, etc.) — competing there means fighting well-funded incumbents on their turf.

**Defensibility.** A provenance-aware governance engine for AI-driven work is uncommon and hard to replicate; it aligns with the platform invariant that *conventions are the product*. This is the durable differentiator.

**Low risk, mostly subtraction.** The governance half has no dispatch dependency, so this is excision plus reframing, not a rebuild. The only genuine build — git-aware drift — extends an existing, integrated provenance system.

**Alternatives considered.** (a) *Keep dispatch as the flashy demo* — rejected: it's the most-commoditized, highest-maintenance surface, and 3 months stale; Luna can be demoed separately. (b) *Make Studio a standalone cockpit that drives the lifecycle by clicking* — rejected for v1: the governance skills already run in Claude Code, so a "pane of glass" reuses them and reconciles "collaborate with Claude Code." A cockpit becomes relevant only when a non-technical operator (e.g. a client) must drive it without Claude Code — a later concern.

## Dependencies

**Builds upon (integrated — not blocking):** `self-documenting-system` (provenance/banners/`/integrate`), `mcp-initiative-governance` (governance MCP tools), `multi-project-studio`, `studio-state-machine`.

**Supersedes / makes moot (triage to decline or archive):** the dispatch-routing and agent-runtime initiatives — `dispatch-center`, `dispatch-evolution`, `dispatch-idempotence`, `ai-gateway-dispatch`, `ai-sdk-dispatch`, `mcp-multi-backend-dispatch`, `scheduled-dispatch`, `mcp-agent-delegation`, `mcp-coordination-layer`, `parallel-workflow-governance`, `sqlite-agentic-state`, `distributed-agent-consistency`, `ledger-governance-rbac`, `agentic-runtime-platforms`, `gpu-inference-service`, `vps-remote-compute`, `mmo-patterns-for-agents`, `agentic-organization-model`, `agentic-workspace`, `studio-agent-missions`.

**Conflicts with live work — supersession confirmed (2026-06-17, listed in `informs`):** `agentic-workforce` (in-progress, builds the surface being removed); `studio-workflow-canvas` (approved, builds the tab being merged); `linear-initiative-sync` (approved, Linear is out of v1); `ai-sdk-dispatch`, `dispatch-evolution`, `agentic-workspace`, `agentic-runtime-platforms` (approved dispatch work). `behavioral-agents` is **not** superseded — its role definitions are kept as authored conventions (see §1); only the dispatch-facing parts retire.

No hard blockers — nothing must land before this proceeds.

## Review Notes

**Trade-offs & open questions:**
- **Demo legibility.** The governance demo is a *narrative* ("walk an initiative from proposal to integration with provenance"), not a spectacle. Making it legible to a stranger (esp. a hiring manager) is a downstream design task, not solved here.
- **Linear out of v1 — confirmed.** The current Linear wiring is dispatch-only and dies with it. A future "initiatives here / work-items in your PM tool" link is a seed, not v1 scope.
- **Behavioral agents — kept (decided).** Role definitions (`docs/agents/roles/`, `agents/`) stay as authored conventions; only the `workforce/` tab (the dispatch catalog) is removed. The roles need a home in the AUTHOR group — a `/shape` decision.
- **Single initiative — decided.** Tracked as one coherent refocus with phased sessions rather than split into excise / provenance-build / reframe.
- **Shared-artifact edits** (`CLAUDE.md`, `README.md`, `docs/roadmap.md`) go through integration review at integrate-time per convention, not directly from the worktree.
- **Luna/OpenClaw** moves outside Studio — becomes a collaborator Studio *observes*, no longer dispatches. This retires the documented "two planning modes" (dispatch-tasks mode gone; plan-together remains).

**Effort:** 5–7 sessions (mostly deletion)
**Session breakdown:**
- Session 1: Excise dispatch from the app — remove `tasks`/`dispatch`/`workforce` routes, hub/content panels, prune command palette + sidebar.
- Session 2: Excise dispatch from packages + repo — studio-core exports/files, studio-mcp task/authority tools + `authority/`, config dispatch field, `scripts/`, `sherpa.config.ts`. Typecheck green (`pnpm check`).
- Session 3: Repoint Sessions to Claude Code logs; slim MCP tab to the governance API.
- Session 4: Git-aware drift in `staleness.ts` + provenance banner; surface mark-verified; make provenance the Process spine. (The one real build.)
- Session 5: Identity reframe (`CLAUDE.md`, `README.md`), nav reorg into GOVERN/AUTHOR/OBSERVE, Workflow→Playbooks merge.
- Session 6 (if needed): Portfolio triage — disposition the ~20 agentic initiatives; redirect conflicting approved work.
