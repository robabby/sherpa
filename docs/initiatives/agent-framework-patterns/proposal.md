---
status: in-progress
initiative: agent-framework-patterns
created: 2026-03-10
updated: 2026-03-10
type: research-synthesis
risk: additive
targets:
  - docs/agents/
  - scripts/
  - docs/initiatives/studio-collaboration-platform/
  - docs/tasks/
dependencies: []
spawned-from: null
---

# Agent Framework Patterns — External Research Initiative

## Summary

Full audit of two open-source agent frameworks — [agency-agents](https://github.com/msitarzewski/agency-agents/) (agent persona library) and [paperclip](https://github.com/paperclipai/paperclip) (agent orchestration platform) — to surface concrete improvements for Sherpa's agent role definitions, dispatch pipeline, task system, and Studio collaboration platform.

## State Snapshot

Sherpa's agent infrastructure includes:
- 14 agent roles in `docs/agents/roles/` with YAML frontmatter (model-tier, context-packages, permissions)
- Planner/Worker/Judge pipeline with `dispatch.sh`, `lm-worker.mjs`, `claude-worker.sh`, `auto-judge.sh`
- File-based task board at `docs/tasks/` with YAML frontmatter lifecycle
- Studio with initiative visualization, workforce browser, pending morning review MVP
- Event logging via NDJSON at `docs/tasks/logs/`

## Proposed Changes

This is a research-only initiative. No shared artifacts change. Output:

1. `research/agency-agents.md` — Full audit of persona library patterns
2. `research/paperclip.md` — Full audit of orchestration platform patterns
3. `research/synthesis.md` — Cross-cutting findings, ranked recommendations grouped by target artifact

Approved recommendations from the synthesis become concrete proposals in a follow-up session.

## Rationale

Both repos solve problems adjacent to Sherpa's agent system at different scales and with different design philosophies. Agency-agents offers rich persona design patterns (identity, workflows, success metrics, cross-tool portability). Paperclip offers production orchestration patterns (heartbeat scheduling, atomic task checkout, budget enforcement, immutable audit logs, dashboard UX). Understanding where our system has gaps — and where these frameworks over-engineer for scale we don't need — produces actionable improvements.

## Dependencies

None.

## Review Notes

- Agency-agents is a prompt library, not a runtime. Patterns are structural, not code.
- Paperclip is a full platform (16.6k stars, TypeScript monorepo). Over-engineering risk — many patterns assume multi-team scale that a solo operator doesn't need.
- The financial constraint (no API costs until revenue) means any adopted patterns must work with filesystem-based coordination and local models.
