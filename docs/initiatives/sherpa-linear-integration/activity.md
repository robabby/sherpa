---
started: 2026-03-21
worktree: null
---

## Activity Log

- **2026-03-21** — Initiative created, proposal written, approved, starting Round 1 research (Linear platform survey)
- **2026-03-21** — Absorbed "Sherpa as Linear Agent" architecture from parallel Luna research into this initiative
- **2026-03-21** — Iteration 1 complete: 4 vectors (API, SDK/automation, agent workflows, data model). Core finding: Linear is substrate, not competitor. Zero governance agents in marketplace. Taxonomy maps cleanly via label groups + workflow states. Backend/dispatch/governance stay framework-side.
- **2026-03-21** — Iteration 2 complete: 4 vectors (task overlap, initiative overlap, UI overlap, deprecation impact). Three-zone model: DELETE ~550 lines of task CRUD + 41 files, BRIDGE ~700 lines to Linear API, KEEP ~3500+ lines of governance code untouched. Initiative system is almost entirely governance — don't touch it. Studio UI is 88% governance — Linear doesn't replace it. Sherpa's value IS the governance layer.
- **2026-03-21** — Implementation plan written (plan.md). 7 sessions across 6 phases.
- **2026-03-22** — Sessions 1-5 implemented. Hard switchover (no feature flag). 27 tasks migrated to Linear (SG-306–SG-332). 4 label groups created. task-board.sh deleted. All Studio pages and MCP tools now query Linear API.
- **2026-03-22** — Initiative marked `integrated`. Phase 6 (OAuth + webhook + Linear Agent registration) deferred as follow-on initiative.

## Seeds

1. **Sherpa as Linear Agent (OAuth + webhook)** — Register Sherpa Studio as a Linear Agent with `app:assignable`/`app:mentionable` scopes. Webhook receiver for agent sessions. Governance checks on delegation. First governance agent in Linear's marketplace. Scoped out of this initiative to ship the backend switchover independently. → initiative: sherpa-linear-agent
2. **task_dispatch Linear-native** — `task_dispatch` MCP tool still reads from filesystem task files for dispatch metadata. Needs full Linear-native path where dispatch metadata (backend, model) is stored as Linear issue properties or comments.
3. **task_update proper mutations** — Status updates should map to Linear workflow state transitions (not comments). Judge verdicts should update the Verdict label group.
4. **Per-project task filtering** — `projects/page.tsx` currently shows total task count for all projects. Needs Linear project/label filtering to scope tasks per Sherpa project.
5. **tasks.ts filesystem reader cleanup** — `packages/studio-core/src/tasks.ts` still exists because `task_dispatch` depends on `scanTasks()`. Delete once dispatch is fully Linear-native.
