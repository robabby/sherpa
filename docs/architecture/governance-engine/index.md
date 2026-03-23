---
doc-type: architecture
maintained-by: self-documenting-system
authored-by: ai
reviewed-by: null
last-updated: 2026-03-17
last-verified: 2026-03-17
source-initiatives:
  - parallel-workflow-governance
  - mcp-initiative-governance
---

> **AI-updated** 2026-03-17 · Awaiting human review
> Sources: parallel-workflow-governance, mcp-initiative-governance

# Governance Engine

The system that ensures multiple agents and humans can work on the same codebase without corrupting shared artifacts. Built on a three-layer coordination model inspired by MMO conflict resolution: prevention before detection before compensation.

## Overview

Sherpa's governance problem: N agents working concurrently on initiatives that touch shared artifacts (roadmap, guidelines, conventions). Without coordination, agents overwrite each other's work or violate conventions they aren't aware of. The governance engine solves this through three layers, each with increasing enforcement strength.

## Three-Layer Coordination

### Layer 1: CLAUDE.md + Rules (Guidance)

Convention files in `.claude/rules/` auto-load via glob frontmatter when agents work in matching directories. Soft guidance — agents follow conventions but can't be mechanically prevented from violating them.

- `initiative-convention.md` — directoturtle structure, proposal format, seeds
- `worktree-conventions.md` — isolation model, naming, lifecycle
- `behavioral-engineering.md` — constraints over identity for agent roles
- `content-quality.md` — 8-criterion scorecard for content evaluation
- `effort-estimation.md` — sessions as unit of effort
- `directoturtle-convention.md` — recursive directory structure
- `provenance-convention.md` — documentation authorship tracking

### Layer 2: Claude Code Hooks (Enforcement)

PreToolUse shell checks that prevent convention violations before they happen. Hard enforcement at the tool-call level. Designed but not yet fully implemented — the hook infrastructure exists in Claude Code, and specific governance hooks will be added as patterns emerge.

### Layer 3: MCP Server (State Authority)

SQLite WAL database, single-process, 3-7us indexed reads on M1. The source of truth for initiative state, task assignments, and coordination data. Exposed via 8 MCP tools (`packages/studio-mcp/src/server.ts`).

## Initiative Lifecycle

The lifecycle is **computed, not stored** — a pure function (`detectLifecycle` in `packages/studio-core/src/lifecycle.ts`) derives the current stage from filesystem evidence.

### Nine Stages

```
needs-research → needs-proposal → needs-review → needs-plan →
ready-to-start → in-flight → ready-to-integrate → integrated → archived
```

### Detection Logic

Inputs: `status` (from proposal.md frontmatter), `hasResearch`, `iterationCount`, `hasPlan`, `linkedWorkstreamStatus`.

| Status | Condition | Stage | Actor |
|--------|-----------|-------|-------|
| `archived` | — | archived | — |
| `integrated` | — | integrated | — |
| `approved/in-progress` | workstream completed | ready-to-integrate | human |
| `approved/in-progress` | workstream active | in-flight | — |
| `approved/in-progress` | has plan, no workstream | ready-to-start | agent |
| `approved/in-progress` | no plan | needs-plan | agent |
| `pending` | no research, iteration=0 | needs-research | agent |
| `pending` | iterations > 0 | needs-review | human |
| `pending` | research done | needs-proposal | agent |

Actor assignment determines who acts next — agent stages can be automated, human stages require review.

### Initiative Data Model

Defined in `packages/studio-core/src/domain.ts`, validated by Zod schema in `packages/studio-core/src/schemas.ts`:

```
Initiative { slug, status, type, risk, created, updated, targets[],
             dependencies[], spawnedFrom, title, summary, subDirectories[] }
```

Scanned from `docs/initiatives/*/proposal.md` — YAML frontmatter parsed with gray-matter, validated with Zod, title extracted from first H1, summary from `## Summary` section.

## Conflict Resolution

### Proposal-Based Changes

Initiatives never edit shared artifacts directly. All changes go through proposals in `docs/initiatives/<slug>/proposal.md`. This is the primary conflict prevention mechanism — concurrent work produces independent proposals, not competing edits.

### Integration Review

Batch review workflow (`.claude/skills/integration-review/SKILL.md`) for resolving cross-proposal conflicts:

1. **Scan** — find all pending proposals
2. **Group by target** — which proposals modify the same artifact
3. **Check freshness** — has the target changed since the proposal was written?
4. **Identify conflicts** — contradictory changes, incompatible assumptions
5. **Present to human** — recommendations per group (approve/decline/defer/refresh)
6. **Apply** — make edits, update frontmatter
7. **Verify** — confirm no contradictions introduced

Risk-stratified: additive proposals batch freely, evolutionary group by target, structural review individually.

## MCP Tools (Governance-Related)

The MCP server (`packages/studio-mcp/src/server.ts`) exposes tools for task, initiative, and knowledge management:

| Tool | Purpose |
|------|---------|
| `task_list` | Query Linear issues, filter by status/role/backend/initiative |
| `task_get` | Linear issue detail + local execution logs (output, blockers, verdict) |
| `task_create` | Create Linear issue with mapped priority + label groups |
| `task_update` | Update Linear issue fields (priority via API, others via comment) |
| `task_dispatch` | Spawn detached worker for backend execution (filesystem-based) |
| `task_logs` | Read NDJSON events and artifact logs from `docs/tasks/logs/` |
| `initiative_list` | List initiatives with status/type/risk filters |
| `initiative_get` | Full detail: proposal, plan, activity, lifecycle, seeds |
| `initiative_create` | Create proposal — authority required on `initiatives/` scope |
| `initiative_approve` | Approve pending initiative — governance-policy-gated |
| `initiative_update_status` | Change status with lifecycle transition validation |
| `initiative_activity` | Append to activity log — authority required |
| `initiative_seeds` | Get seeds from integrated initiatives |
| `search_knowledge` | FTS5 full-text search across indexed markdown |
| `get_summary` | Metadata without content — for initiative overview |

Initiative tools are registered in `packages/studio-mcp/src/initiative/tools.ts`, following the same pattern as authority tools (separate file, `registerInitiativeTools()` function). Read-only tools require no authority; write tools check for an active authority lease when a coordination DB is available.

### Governance Policy

Agent approval of initiatives is controlled by `governance.approval.agents` in `sherpa.config.ts`:

| Policy | Behavior |
|--------|----------|
| `'never'` (default) | Agents cannot approve via MCP — human action required |
| `'additive-only'` | Agents can approve `risk: additive` initiatives only |
| `'always'` | Agents can approve any risk level |

When an agent calls `initiative_approve` and policy blocks it, the tool returns an error explaining that approval requires human action, with a pointer to the Studio UI. See [0010 — Governance-gated initiative approval](../../decisions/0010-governance-gated-initiative-approval.md).

### Initiative Operations Module

The CRUD backing for initiative MCP tools lives in `packages/studio-core/src/initiative-ops.ts`. Filesystem-backed operations with explicit `root` parameter, Zod-validated frontmatter, lifecycle transition enforcement via `VALID_TRANSITIONS` map. Seven exported functions: `listInitiatives`, `getInitiative`, `getSeeds`, `createInitiative`, `updateInitiativeStatus`, `approveInitiative`, `appendActivity`.

## Current State

**Implemented:** Full initiative lifecycle detection, proposal system, worktree isolation, integration review workflow, MCP state authority with 22 tools (6 task, 7 initiative, 4 knowledge, 3 authority, 1 dashboard, 1 infrastructure), knowledge search, initiative CRUD via MCP with governance-gated approval.

**Not yet implemented:** Automated conflict detection (integration review is a manual protocol), scheduled drift detection, proposal auto-routing, hook enforcement for specific governance rules.

## Related

- [Execution Pipeline](../execution-pipeline/index.md) — dispatches tasks that the governance engine creates and tracks
- [Executable Conventions](../executable-conventions/index.md) — the rules and skills that governance loads and enforces
- [Config-as-Code](../config-as-code/index.md) — project paths that tell governance where to find initiatives, tasks, roles

## Decisions

- [0001 — Three-layer coordination model](../../decisions/0001-three-layer-coordination.md)
- [0003 — Never edit shared artifacts directly](../../decisions/0003-never-edit-shared-artifacts-directly.md)
- [0010 — Governance-gated initiative approval](../../decisions/0010-governance-gated-initiative-approval.md)
