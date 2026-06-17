---
started: 2026-06-17
worktree: .worktrees/studio-governance-refocus
---

# Activity — studio-governance-refocus

## 2026-06-17 — Shaped, designed, planned

- Brainstormed the refocus with Rob: governance-as-core, pane-of-glass operating model.
- Authored proposal, shape (open-ended appetite), design (3 surfaces), 3 decision records, prototype.
- Plan approved; worktree branched from `origin/main` (ec9b2a7).

## 2026-06-17 — Implemented (Phases A–H)

- **A** — Excised dispatch from the app: removed tasks/dispatch/workflow/workforce routes + the projects/tasks aggregate, api/dispatch + api/stream/tasks, 22 studio-ui components, and the hub/projects/command-palette coupling. (`50baaec`)
- **B** — Excised dispatch from the packages: studio-mcp task/authority tools + the authority subsystem (decoupled initiative tools first), http-server reaper wiring; studio-core dispatch/tasks/linear modules + exports + config field; `scripts/` + `backends/`. (`6780ab5`)
- **C** — Repointed Sessions to real Claude Code logs (`~/.claude/projects`) via a defensive adapter; verified it reads 14 sessions including the live one. (`e27afcf`)
- **D** — Slimmed the MCP tab to governance + knowledge tools. (`9030864`)
- **E** — Built git-aware doc drift (the one real build): `source-initiatives → targets → git log --since last-verified`; `computeState` now reaches "stale"; provenance banner shows the commit count and Mark-as-Reviewed fires for stale docs. Verified the execution-pipeline doc computes stale (53 commits / 22 paths); a verified-today control is fresh. (`0c55cae`)
- **F** — Reorganized nav into GOVERN / AUTHOR / OBSERVE + a read-only `/roles` view. (`c16082e`)
- **G** — Reframed identity (CLAUDE.md / README / roadmap) to the governance engine. (`7be4fb4`)
- **H** — Portfolio triage: declined 8 superseded approved/in-progress dispatch initiatives (agentic-workforce, agent-infrastructure, studio-workflow-canvas, linear-initiative-sync, ai-sdk-dispatch, dispatch-evolution, agentic-workspace, agentic-runtime-platforms).
- Green throughout: `pnpm check` across all studio packages; app builds; no new test failures vs baseline.

## Seeds

- **Process-view drift indicator** — surface per-initiative / portfolio doc staleness in the Process view (reverse doc→initiative mapping). Deferred per design Open Question 1 + the no-IA-redesign no-go.
- **Finish portfolio triage** — archive the *integrated* dispatch initiatives (dispatch-center, mcp-coordination-layer, sqlite-agentic-state, mcp-multi-backend-dispatch, parallel-workflow-governance, studio-agent-missions) and triage the *pending* ones (dispatch-idempotence, scheduled-dispatch, ai-gateway-dispatch, mmo-patterns-for-agents, agentic-organization-model, ledger-governance-rbac, distributed-agent-consistency, agent-cards, agent-context-portability). behavioral-agents + agent-framework-patterns kept (role conventions / cited research).
- **db coordination-schema removal** — `studio-core/db` coordination-schema (agent_sessions, task_claims, authority_leases, state_versions) is now dead (only its own tests use it); remove in a focused db cleanup (left untouched this round as a no-go-adjacent area).
- **MCP tab LM Studio/events cleanup** — the LmStudioCard + event-log sections are vestigial (render offline/empty); remove for a fully clean governance tab.
- **catalog-sync pre-existing gaps** — 9 uncatalogued/invalid catalog entries (doc-tree, docs-workspace, empty-state, hub-playbooks-panel, provenance-header, studio-shell-header, project-switcher, studio-sidebar, StudioHeader→studio-header) predate this work; add catalog entries to make catalog-sync green.
- **Sessions enrichment** — filesModified/commits/initiative are empty (not in Claude Code logs); parse Edit/Write/Bash tool records and infer initiative from branch (design Decision 4 — degradable).
- **Linear v2** — the "initiatives here / work-items in your PM tool" integration (Linear was out of v1).
- **studio-core/workflow.ts** — the node/edge data is now unused (Workflow tab merged into Playbooks); fold a static diagram into Playbooks or remove the module.
- **Pre-existing test failures** — load-json env-interpolation (1) + http-server auth (4) fail at baseline, unrelated to this refocus.
