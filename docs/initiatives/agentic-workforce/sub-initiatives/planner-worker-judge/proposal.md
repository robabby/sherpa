---
status: in-progress
initiative: planner-worker-judge
created: 2026-03-09
updated: 2026-03-12
type: new-plan
risk: additive
targets:
  - scripts/
  - docs/tasks/
  - docs/agents/roles/
  - .claude/skills/
  - packages/studio-core/src/lib/studio/
dependencies: []
spawned-from: agentic-workforce
---

# Planner/Worker/Judge Execution Pipeline

## Summary

Formalize the Planner/Worker/Judge trifecta as executable infrastructure. The Planner (persistent session) dispatches Workers as background processes — either CLI agent subprocesses in worktrees (for code tasks) or API-based LLM calls (for content/research tasks). The human walks away at night, comes back to the same conversation, and reviews results via `/morning`.

## State Snapshot

The parent initiative (`agentic-workforce`) built the foundation:
- **Phase 1:** 13 agent role definitions at `docs/agents/roles/`
- **Research:** Framework landscape survey validated custom orchestration approach

What's missing: no structured way to go from "approved proposal" → "dispatched worker" → "reviewed output" → "merged result." The roles and dispatch primitives exist but the execution pipeline — task files, worker scripts, automated judging, overnight autonomy — does not.

## Proposed Changes

### Infrastructure (Tasks 1-4)
- Task file convention at `docs/tasks/` with YAML frontmatter
- Task scanner script (`scripts/task-scanner.mjs`)
- API-based LLM worker script (`scripts/lm-worker.mjs`) for content/research
- CLI agent worker launcher (`scripts/claude-worker.sh`) for code tasks in worktrees

### Skills (Tasks 5-6)
- `/plan-tasks` — Planner tool: breaks initiatives into dispatchable task files
- `/morning` — Morning review: presents overnight results for human decisions

### Judge (Task 7)
- Formal Judge role definition at `docs/agents/roles/judge.md`
- Auto-judge script (`scripts/auto-judge.sh`) for autonomous post-completion review
- Three judge modes: in-session, automated (CLI agent `--print`), local (API-based LLM)

### Studio (Task 8)
- Task board data loader (`packages/studio-core/src/lib/studio/tasks.ts`)
- Pipeline view on workforce dashboard

### Validation (Tasks 9-10)
- First real task file for pipeline test
- End-to-end validation run

## Rationale

The transit content generation pipeline proved the pattern: structured prompt → LLM worker → validated output. This initiative generalizes it to any task type, adds the Judge role for quality gates, and enables overnight autonomous execution.

## Dependencies

- Parent: `agentic-workforce` (role catalog, dispatch infrastructure)
- Related: `agent-infrastructure` (model routing, local model integration)
- Related: `studio-collaboration-platform` (research into Studio's identity as collaboration tool)

## Review Notes

- The MCP-based coordination approach (`mcp-agent-delegation`) was declined as premature. This filesystem-based pipeline is the validated alternative.
- Overnight autonomy requires restricted permission modes — workers can only modify files, not push or deploy.
- API-based LLM workers are free (local compute) but limited to single-output tasks. Code tasks that need multi-file changes require CLI agent dispatch.
- **Effort:** 1-2 sessions for infrastructure + validation. Studio integration is a follow-up.
