---
status: in-progress
initiative: agentic-workforce
created: 2026-03-06
updated: 2026-03-12
started: 2026-03-06
type: new-plan
risk: structural
targets:
  - packages/studio-core/src/lib/studio/
  - .claude/rules/
  - .claude/skills/
  - docs/agents/roles/
dependencies:
  - behavioral-agents
spawned-from: null
---

# Agentic Workforce

Build the agent orchestration layer for Sherpa's behavioral agent system: role catalog, execution pipeline (Planner/Worker/Judge), and framework-level research on agent stack integration.

## Reconciliation (2026-03-12)

This initiative was split during migration from WavePoint:

- **Framework-level work (here):** Role catalog definitions, Planner/Worker/Judge execution pipeline, research on framework landscape and integration surfaces, agent stack integration branches.
- **WavePoint-specific work (stays in WavePoint):** Workforce management UI (Studio pages for role browsing, workstream assignment, prompt generation), governance wiring to WavePoint skills.

## State Snapshot

**Phase 1 (Role Catalog) — COMPLETE.** 13 roles defined in `docs/agents/roles/` with `disposition:`, `quality-bar:`, `fail-triggers:`, `## Behavioral Constraints`. Catalog index at `docs/agents/README.md`. All roles audited against the Behavioral Agent schema spec.

**Foundational schema work — ELEVATED** to `behavioral-agents` initiative. The Behavioral Agent format, research evidence, and migration catalog now live at the Sherpa level. Roles are consumers of that format.

**Behavioral engineering principle — CODIFIED** in `.claude/rules/behavioral-engineering.md`. Spawned from `agent-framework-patterns` research.

## Remaining Work

### Planner/Worker/Judge Pipeline (sub-initiative)

Formalize the Planner/Worker/Judge trifecta as executable infrastructure. See `sub-initiatives/planner-worker-judge/`.

### Agent Stack Integration (branch)

Investigate integration surfaces for agent ecosystems: MCP task board, Claude Agent SDK migration, A2A protocol positioning. See `branches/agent-stack-integration.md`.

## Research

Iteration 1 (2026-03-10) surveyed the agentic framework landscape (12+ frameworks), evaluated custom orchestration vs. framework adoption, deep-dived the Claude Agent SDK, and investigated integration surfaces. See `research/`.

**Key conclusion:** Custom orchestration is validated and correct for the 3-5 agent scale. The opportunity is in integration surfaces — exposing primitives to agent ecosystems via MCP, A2A protocol, and Claude Agent SDK migration — not in adopting an external framework.

## Dependencies

- **`behavioral-agents`** — Schema specification defines the data model for role definitions.
- **`agent-infrastructure`** — Runtime layer that executes the roles defined here.

## Review Notes

- Phase 1 (Role Catalog) is complete. 13 roles, all passing schema audit.
- The Behavioral Agent schema spec is the canonical format definition. Role types should conform to it.
- Research validates custom orchestration. Framework adoption deferred until 8+ agent scale.
