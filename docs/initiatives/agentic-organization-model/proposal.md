---
status: pending
initiative: agentic-organization-model
created: 2026-03-12
updated: 2026-03-12
type: research-synthesis
risk: structural
targets:
  - docs/framework.md
  - docs/agents/
  - packages/studio-core/src/schemas.ts
dependencies:
  - behavioral-agents
  - mcp-coordination-layer
  - agentic-workforce
spawned-from: null
---

# Agentic Organization Model

## Summary

Introduce an **agent instance layer** between Sherpa's existing behavioral role definitions (templates) and task execution (sessions). Role definitions say "what a Code Reviewer does." Agent instances say "Sarah is a Code Reviewer with Stripe context, a $10/session budget, 47 completed tasks, and a 94% quality score." This is the "HR system for AI agents" — persistent entities that accumulate state over a template.

## State Snapshot

**What exists:**
- Behavioral role catalog: 25+ roles in `docs/agents/roles/` with typed schema (disposition, fail-triggers, quality-bar). Schema finalized, validation tooling built.
- Planner/Worker/Judge dispatch: task files in `docs/tasks/`, workers spawned as fresh stateless sessions per task.
- MCP coordination layer (pending): SQLite-backed state authority, hook enforcement. Designed but not built.

**What's missing:**
- No persistent agent identity. Each task spawns a fresh agent. No work history, no configuration overrides, no performance tracking.
- No organizational model. No teams, no assignments, no budget allocation, no audit trail per agent.
- No connection between "the role definition" and "the specific deployment of that role with accumulated state."

**Market context:**
- Workday Agent System of Record (ASOR) is now GA — central registry for agent identity, lifecycle, performance, costs. Open API on GitHub.
- Microsoft Agent 365 + Entra Agent ID GA May 2026 ($15/user/month) — agent identities as first-class directory objects.
- Named AI employee platforms (11x, Artisan, Sintra, Lindy) all ship persistent named agents but are vertically integrated — no general-purpose registry.
- HBR predicts "agent manager" becomes a standard job title within 12-18 months.
- No framework-level open-source solution exists for this layer.

## Proposed Changes

### 1. Unified Behavioral Definition Schema

Converge skills, agent roles, and agent instances into a single schema with progressive enhancement. The zoom level is determined by which fields are populated:

| Zoom Level | Present | Absent | Example |
|------------|---------|--------|---------|
| **Skill** | name, description, body (protocol) | disposition, memory | `/rr` research protocol |
| **Role** | name, description, disposition, constraints, quality-bar | memory | Code Reviewer |
| **Instance** | Everything from Role + memory + custom context + stats | — | "Sarah" the Product Designer |

Base layer is Agent Skills standard compatible (name + description + body). Sherpa behavioral fields are extensions. Claude Code memory field enables persistence.

### 2. Agent Instance Files

Agent instances live as YAML files in a configurable directory (default: `agents/instances/`):

```yaml
---
id: sarah-product-designer
role: product-designer              # → points to role catalog
display-name: Sarah
owner: rob                           # human responsible
status: active                       # active | paused | retired
created: 2026-03-15

# Configuration overrides (layered on role defaults)
team: design
model-override: claude-sonnet-4-6
extra-context:
  - docs/brand-guidelines.md
  - .stripe/dashboard-config.md
config:
  autonomy-tier: supervised          # autonomous | supervised | manual
  cost-ceiling: 10.00               # per session, USD

# Accumulated (system-managed, not hand-edited)
stats:
  tasks-completed: 47
  tasks-failed: 3
  total-cost-usd: 182.40
  quality-score: 0.94
  last-active: 2026-03-11
---

# Instance Notes

Sarah handles all product design work for the Studio initiative.
Behavioral override: prefer mobile-first designs for all new components.
```

**Design decisions:**
- Filesystem-based (YAML), consistent with Sherpa's conventions. MCP server indexes for querying but files are source of truth.
- Instances reference templates via `role:` field (instances reference templates, not vice versa — Pattern 2 from cross-domain research).
- Configuration overrides layer on role defaults (Workday Position Restrictions pattern).
- Stats section is system-managed — updated by the execution pipeline, not hand-edited.
- No persistent memory/learning in v1 (hard problem, deferred per research recommendation).

### 3. Instance Lifecycle

```
Created → Active → Paused → Retired → Archived
```

- **Created:** Configured but never dispatched. Can be edited freely.
- **Active:** Accepting task dispatch. Stats accumulating.
- **Paused:** Temporarily idle. Not eligible for dispatch. Stats preserved.
- **Retired:** No longer accepting work. Full history preserved for audit. Configuration locked.
- **Archived:** History retained in read-only storage. Instance file removed from active directory.

### 4. Studio UI Surface

New "Workforce" section in Studio alongside existing Governance view:

- **Agent roster:** List of all instances with status, role, team, last active, quality score.
- **Agent detail:** Configuration, stats, work history (linked to task completions), behavioral overrides.
- **Team view:** Agents grouped by team assignment.
- **Morning review integration:** Overnight work attributed to specific agent instances, not anonymous sessions.

### 5. Framework Integration Points

- **Behavioral agents schema:** Instance schema extends role schema with identity + state + overrides fields. Same Zod validation pipeline.
- **MCP coordination layer:** Instance registry as SQLite index over YAML files. Dispatch uses instance ID for authority grants. Session logs reference instance ID.
- **Execution pipeline:** Task dispatch resolves instance → role → behavioral constraints. Worker sessions inherit role constraints + instance overrides + instance context-packages.

## Rationale

**Cross-domain validation (Vector 2):** Every major software system — Kubernetes, IAM, game servers, HR platforms, Docker — separates templates from instances. The pattern is: template defines shape, instance holds state, instances reference templates not vice versa, overrides layer on defaults, template and instance data are physically separated. This is not a design preference — it's a structural requirement for systems that manage persistent entities over evolving templates.

**Market validation (Vectors 1 & 4):** Workday ASOR, Microsoft Agent 365, and every named-AI-employee platform confirm the instance layer is the active frontier. No framework-level open-source solution exists. Sherpa can be first.

**Convergence validation (Vector 3):** Agent Skills standard + Sherpa behavioral fields + Claude Code memory compose into a unified schema where zoom level = populated fields. This is not theoretical — Claude Code already bridges skills and subagents architecturally.

**Business validation:** Sherpa Consulting's planned workforces (blog content engine, YouTube pipeline, AI literacy consulting) require persistent agent entities with configuration, work history, and audit trails. The morning review ritual needs to attribute overnight work to specific agents.

## Dependencies

- `behavioral-agents` — Instance schema extends role schema. Role catalog must be stable.
- `mcp-coordination-layer` — Instance registry indexed in SQLite. Dispatch uses instance IDs.
- `agentic-workforce` — Planner/Worker/Judge must resolve instances to roles at dispatch time.

## Review Notes

**What this is NOT:**
- Not an enterprise HRIS replacement. No payroll, benefits, PTO tracking.
- Not persistent agent memory/learning. v1 instances have stats and config, not accumulated knowledge. Memory is a future concern.
- Not an identity provider. Instances don't have credentials or auth tokens. External service access is a separate initiative (`external-service-integrations`).

**Open architectural questions (for iteration 2):**
- Should the unified schema live in a single directory or maintain separate skills/agents/instances directories?
- How do template changes propagate to instances? (Kubernetes: new pods. Azure: home-tenant only. Games: never.)
- Is the Workday three-tier model (Job Profile → Position → Worker) needed, or is two-tier (Role → Instance) sufficient for v1?
- What's the autonomy-tier model? HAIF proposes four tiers with quantifiable promotion/demotion criteria.

**Effort:** 3-4 sessions (schema + instance files + Studio UI surface + MCP index)
**Session breakdown:**
- Session 1: Unified schema design, Zod types, instance file format
- Session 2: Instance lifecycle in MCP server, dispatch resolution
- Session 3: Studio UI — roster, detail view, team view
- Session 4 (if needed): Morning review integration, autonomy tiers
