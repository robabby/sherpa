---
started: 2026-03-12
worktree: null
---

# Activity Log

## 2026-03-12 — Initiative created

- Spawned from conversation about workforce management gap in the seven pillars
- Core question: where do agent instances (vs role definitions) live in the framework architecture?
- Context: Sherpa Consulting needs persistent agent identities (Sarah the Product Designer) with work history, configuration, budgets — distinct from the behavioral role catalog
- Iteration 1: landscape survey of agent instance management, workforce orchestration, and organizational modeling

## 2026-03-12 — Iteration 1 complete: Full landscape survey (4 vectors)

Four parallel research vectors dispatched:

**V1 — AI Workforce Management Platforms:** Surveyed 30+ platforms. Workday ASOR (GA) and Microsoft Agent 365 (GA May 2026) are the production leaders. Market fragments into 5 layers. No framework-level open-source solution exists — first-mover gap for Sherpa.

**V2 — Template-to-Instance Architecture Patterns:** Cross-domain analysis of Kubernetes, IAM (AWS/Azure/Google), MMO game servers, HR systems (Workday/BambooHR), OOP, Docker. Six universal patterns confirmed. Azure Application Object → Service Principal is the strongest analog.

**V3 — Skills/Agents/Instances Convergence:** Claude Code's skills and subagents are already near-identical formats. Agent Skills standard (30+ tools) provides portable base. Unified schema viable: Agent Skills + Sherpa behavioral fields + Claude Code memory. Zoom level = populated fields.

**V4 — Human+AI Org Modeling + MVP:** HAIF autonomy tiers, YouTube case study (2 agents, 52 videos, filesystem memory validates approach), MVP instance schema (12 fields, 5 categories).

**Outputs:**
- Proposal written: agent instance layer, unified schema, YAML instance files, lifecycle state machine, Studio UI surface
- Two branch seeds: `unified-behavioral-schema` (high priority), `autonomy-tier-model` (medium priority)
- 5 open questions for iteration 2
