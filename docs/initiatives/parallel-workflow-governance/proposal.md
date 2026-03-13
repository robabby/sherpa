---
status: integrated
initiative: parallel-workflow-governance
created: 2026-02-28
updated: 2026-03-12
type: process-change
risk: structural
targets:
  - docs/initiatives/
  - .claude/rules/initiative-convention.md
  - .claude/rules/worktree-conventions.md
dependencies: []
spawned-from: null
---

# Parallel Workflow Governance

## Summary

A three-layer system for coordinating multiple concurrent Claude Code sessions that propose changes to shared artifacts. Agents produce structured proposals in isolated worktrees. A human-driven integration step batches, groups, and applies approved changes.

## Status: Integrated

This initiative's design is fully codified in Sherpa's convention layer:

- **Layer 1 (Worktree isolation):** `.claude/rules/worktree-conventions.md`
- **Layer 2 (Initiative proposals):** `.claude/rules/initiative-convention.md` + directoturtle structure under `docs/initiatives/`
- **Layer 3 (Integration review):** `.claude/skills/integration-review/`

The three-layer design (worktrees for isolation, proposal queue for coordination, event log for awareness) is the foundation of Sherpa's governance engine. All downstream initiatives (`agentic-workforce`, `studio-state-machine`, `behavioral-agents`, etc.) operate within this system.

## Origin

Originally proposed and implemented in WavePoint (2026-02-28). Extracted to Sherpa as a framework-level convention rather than application-specific code.

## Design Reference

The full three-layer design (worktree isolation, proposal queue with directoturtle convention, integration review) is documented across the rules and skills listed above. Key design decisions:

- Max 3 nesting levels for initiative directories
- Threshold: multi-session or shared-artifact changes use the system; single-session work skips it
- Never edit shared artifacts directly from initiative worktrees — write proposals instead
- Two approval paths: Studio UI or batch integration review
