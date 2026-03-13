# Agentic Organization Model — Research

## Iteration 1 (2026-03-12): Landscape Survey

Surveyed the template-to-instance split across 6 software domains (Kubernetes, IAM, games, HR, OOP, Docker), the AI workforce management market (30+ platforms), the skills/agents/instances convergence question, and human+AI organizational modeling.

**Core finding:** The template-to-instance split is a structural requirement, not a design preference. Every mature system implements it. The market is actively building this for AI agents, but no framework-level open-source solution exists.

**Proposal generated:** Agent instance layer with unified behavioral schema, YAML instance files, lifecycle state machine, Studio UI surface.

## Open Questions

1. **Unified schema directory structure** — Single directory tree or separate directories with shared schema? Migration path from current `docs/agents/roles/` + `.claude/skills/` split?

2. **Template change propagation** — When a role definition updates, what happens to existing instances? Which propagation model (K8s new-pods, Azure home-tenant-only, games never) fits?

3. **Autonomy tier model** — How does HAIF's four-tier autonomy model compose with Sherpa's existing oversight patterns (morning review, Judge role, integration review)?

4. **Instance-to-instance collaboration** — Centralized dispatch vs direct agent-to-agent handoff? How does this change the Planner/Worker/Judge model?

5. **Cost and performance attribution** — Right granularity for per-instance stats? Connection to Studio morning review cost visibility?

## Cross-References

- `behavioral-agents` — Role schema that instances extend
- `agentic-workforce` — Planner/Worker/Judge dispatch that instances plug into
- `mcp-coordination-layer` — SQLite state authority that indexes instances
- `studio-collaboration-platform` — Morning review UX that surfaces instance work
- `agent-infrastructure` — Model routing that instances configure via overrides
