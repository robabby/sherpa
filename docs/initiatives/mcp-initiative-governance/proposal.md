---
status: integrated
initiative: mcp-initiative-governance
created: 2026-03-17T00:00:00.000Z
updated: '2026-03-17'
type: new-plan
risk: evolutionary
targets:
  - packages/studio-core/src/initiatives.ts
  - packages/studio-core/src/index.ts
  - packages/studio-mcp/src/server.ts
  - packages/studio-core/src/config/types.ts
  - packages/studio-core/src/config/schema.ts
dependencies:
  - mcp-coordination-layer
informs:
  - studio-desktop-app
  - mcp-multi-backend-dispatch
personas:
  - engineer
spawned-from: null
---

# Expose Initiative System via MCP

## Summary

The MCP server exposes task CRUD and authority tools, but the initiative system — the core governance workflow — has no MCP surface. External agents can execute tasks but cannot propose work, check what's in flight, or participate in governance. This initiative adds initiative lifecycle tools to MCP so any agent runtime (Claude, Codex, OpenClaw, NemoClaw) can interact with Sherpa's governance layer through a standard protocol.

## State Snapshot

**MCP server** (`packages/studio-mcp/src/server.ts`, 1383 lines) registers 13 tools across three groups: task management (6 tools), knowledge engine (4 tools), authority system (3 tools). Zero initiative tools.

**studio-core initiative infrastructure** is read-only:
- `types.ts` — `Initiative` interface, `INITIATIVE_STATUSES`, `INITIATIVE_TYPES`, `INITIATIVE_RISKS` enums
- `schemas.ts` — `initiativeFrontmatterSchema` (Zod validation)
- `lifecycle.ts` — `detectLifecycle()` maps status + artifacts to lifecycle stage + next action + actor
- `file-tree.ts` — `buildInitiativeFileTree()` constructs read-only file trees
- `process-nodes.ts` — `initiativeToNode()` converts initiatives to ProcessNodes
- `domain.ts` — read-only queries for initiative data
- `markdown.ts` — `parseFrontmatter()`, `parseActivityLog()` for reading

No mutation functions exist. All initiative writes happen via direct filesystem edits in skills and manual workflows.

**Task tools pattern** (`server.ts` lines 237-619) provides the template: filesystem-backed CRUD with frontmatter parsing, Zod validation, and structured responses.

**Config system** (`packages/studio-core/src/config/`) has no governance policy section — approval is currently an implicit human-only convention with no enforcement.

## Proposed Changes

### 1. Initiative operations module — `packages/studio-core/src/initiatives.ts` (new file)

Filesystem-backed CRUD following the task tools pattern:
- `listInitiatives(root, filter?)` — scan `docs/initiatives/*/proposal.md`, parse frontmatter, return filtered list with lifecycle stage
- `getInitiative(root, slug)` — return proposal content, plan, activity log, seeds, lifecycle stage, and file tree
- `createInitiative(root, slug, frontmatter, body)` — validate against `initiativeFrontmatterSchema`, create directory + `proposal.md`
- `updateInitiativeStatus(root, slug, status)` — validate lifecycle transition, update frontmatter, create `activity.md` on approval
- `approveInitiative(root, slug, actor)` — status change to `approved` with governance policy check, scaffolds `activity.md` with started date
- `appendActivity(root, slug, entry)` — append timestamped entry to `activity.md`
- `getSeeds(root, slug)` — extract `## Seeds` section from `activity.md` of integrated initiatives

### 2. MCP tool registration — `packages/studio-mcp/src/server.ts`

Seven new tools mirroring the operations module:

| Tool | Description | Governance gate |
|------|-------------|----------------|
| `initiative_list` | List initiatives with status/type/risk/persona filters | None (read-only) |
| `initiative_get` | Full initiative detail: proposal, plan, activity, lifecycle, seeds | None (read-only) |
| `initiative_create` | Create a new proposal | Authority required on `initiatives/` scope |
| `initiative_approve` | Approve a pending initiative | **Policy-gated** (see below) |
| `initiative_update_status` | Change status with lifecycle validation | Authority required |
| `initiative_activity` | Append to activity log | Authority required on initiative scope |
| `initiative_seeds` | Get seeds from integrated initiatives | None (read-only) |

### 3. Governance policy config — `packages/studio-core/src/config/`

Add a `governance` section to `SherpaUserConfig`:

```typescript
governance: {
  approval: {
    // Who can approve initiatives via MCP
    agents: 'never' | 'additive-only' | 'always'  // default: 'never'
    requireAuthority: boolean                       // default: true
  }
}
```

- `'never'` — agents cannot approve via MCP (human-only, the safe default)
- `'additive-only'` — agents can approve initiatives with `risk: additive`
- `'always'` — agents can approve any risk level (full autonomy)

When an agent calls `initiative_approve` and policy is `'never'`, the tool returns an error explaining that approval requires human action, with a pointer to the Studio UI.

### 4. Barrel export — `packages/studio-core/src/index.ts`

Add `export * from "./initiatives"` to expose the operations module.

## Rationale

**Why not keep initiatives filesystem-only?** If Sherpa positions as the governance layer for agentic workforces, the governance primitives must be accessible via the standard protocol agents use (MCP). An OpenClaw agent that can execute tasks but can't propose work or read institutional context is a laborer with no view of the project board.

**Why governance-gated approval?** Approval is the critical human oversight checkpoint. Hardcoding "no agent approval" is too rigid — some orgs want full autonomy. But defaulting to open is unsafe. A configurable policy in `defineConfig()` lets each organization set their own governance boundary, which is exactly what Sherpa is for.

**Why follow the task tools pattern?** Consistency. The task CRUD pattern (filesystem-backed, frontmatter-validated, authority-integrated) is proven and familiar to anyone who's read the MCP server code. Same pattern, different domain object.

## Dependencies

- **mcp-coordination-layer** — authority system must be available for mutation gating. Currently integrated.

## Review Notes

**Open questions:**
- Should `initiative_create` auto-run the knowledge sync pipeline to index the new proposal, or leave that to the next scheduled sync?
- Should lifecycle transition validation be strict (only valid transitions) or permissive (warn but allow)? Recommend strict with an `--force` escape hatch.

**Edge cases:**
- Concurrent creates with the same slug — first write wins, second gets a conflict error.
- Approval of an initiative with unmet dependencies — warn but allow (dependencies are advisory in practice).

**Effort:** 3 sessions
**Session breakdown:**
- Session 1: Initiative operations module in studio-core (`initiatives.ts`) + tests
- Session 2: MCP tool registration in server.ts, governance config schema
- Session 3: Integration testing, authority gating, knowledge sync triggers
