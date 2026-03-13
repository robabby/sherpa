---
status: pending
initiative: ledger-governance-rbac
created: 2026-03-12
updated: 2026-03-12
type: research-synthesis
risk: structural
targets:
  - packages/studio-mcp/src/rbac/
  - packages/studio-mcp/src/ledger/
  - packages/studio-core/src/rbac.ts
  - docs/architecture/ledger-governance.md
dependencies:
  - mcp-coordination-layer
  - game-authority-as-mcp-protocol
spawned-from: null
---

# Ledger-Governed RBAC for Sherpa

## Summary

Add two interlocking capabilities to Sherpa's governance engine: (1) a formal RBAC permission model that gates which agent roles can perform which operations on which resource types, and (2) a tamper-evident governance ledger (SQLite + SHA-256 hash chain) that immutably records every governance action. RBAC provides prevention; the ledger provides accountability. Together they make Sherpa's governance structural rather than advisory.

## State Snapshot

- Sherpa's governance model currently relies on prompt conventions (CLAUDE.md, rules) and initiative lifecycle state. These are soft enforcement — a misconfigured agent can bypass them.
- The `mcp-coordination-layer` initiative designs a coordination MCP server with authority leases, fencing tokens, and hook-based enforcement — but has no permission model determining *who* can acquire authority.
- The `game-authority-as-mcp-protocol` initiative defines artifact-level permissions (SessionOwner, Transferable, RequestRequired, Distributable) — these govern resource access modes but not role-based authorization.
- No major AI agent framework ships formal RBAC. No MCP server implements role-based authorization beyond OAuth scopes. This is genuinely novel.
- EU AI Act Article 12/19 and FINRA 2026 create legal requirements for immutable AI decision audit trails — regulatory tailwind for this design.

## Proposed Changes

### Target: `docs/architecture/ledger-governance.md` (new)

Architectural reference defining Sherpa's RBAC + ledger governance model.

**RBAC Model:**

| Role | proposals | shared-artifacts | tasks | config | agents |
|------|-----------|-----------------|-------|--------|--------|
| researcher | create, read | read | read | read | read |
| worker | create, read | read | read, execute | read | read |
| reviewer | read, approve, decline | read | read | read | read |
| integrator | read, approve | read, modify | read, create, execute | read | read |
| operator | create, read | read, modify | create, read, execute | modify | create, modify |

Composition with authority: AND/deny-overrides. RBAC gates *who can attempt* an operation. Authority gates *who currently holds* the resource. Both must allow.

**Governance Ledger:**

```sql
CREATE TABLE governance_ledger (
  sequence    INTEGER PRIMARY KEY AUTOINCREMENT,
  timestamp   TEXT NOT NULL,        -- ISO 8601
  agent_id    TEXT NOT NULL,        -- session identity
  agent_role  TEXT NOT NULL,        -- RBAC role at time of action
  action      TEXT NOT NULL,        -- e.g. proposal.submitted, authority.acquired, task.dispatched
  resource    TEXT NOT NULL,        -- target resource URI
  outcome     TEXT NOT NULL,        -- allowed, denied, error
  details     TEXT,                 -- canonical JSON of action-specific data
  prev_hash   TEXT NOT NULL,        -- SHA-256 of previous entry
  entry_hash  TEXT NOT NULL,        -- SHA-256 of (prev_hash + canonical JSON of this entry)
  fence_token INTEGER               -- if associated with an authority lease
);

-- Enforce append-only: no updates or deletes
CREATE TRIGGER ledger_no_update BEFORE UPDATE ON governance_ledger
  BEGIN SELECT RAISE(ABORT, 'governance ledger is append-only'); END;
CREATE TRIGGER ledger_no_delete BEFORE DELETE ON governance_ledger
  BEGIN SELECT RAISE(ABORT, 'governance ledger is append-only'); END;
```

Hash chain: each `entry_hash` = SHA-256 of (`prev_hash` + canonical JSON of entry fields excluding `entry_hash`). First entry uses a well-known genesis hash. Verification: replay the chain, recompute every hash, detect any tampering.

**XACML-Mapped Architecture:**

| XACML Role | Sherpa Layer | Mechanism |
|------------|-------------|-----------|
| PAP (Policy Administration) | `sherpa.config.ts` + CLAUDE.md | Role definitions, permission tables, behavioral rules |
| PDP (Policy Decision) | MCP Server | Evaluates RBAC + authority on every tool call |
| PEP (Policy Enforcement) | Claude Code Hooks | PreToolUse interceptor, fail-closed |
| PIP (Policy Information) | SQLite tables | Role assignments, authority leases, ledger |

**Enforcement Flow:**

1. Agent calls MCP tool (e.g. `create_proposal`)
2. MCP server checks RBAC: does agent's role permit this operation on this resource type?
3. If resource requires authority: check authority lease + fencing token
4. If both pass: execute operation
5. Record ledger entry: agent, role, action, resource, outcome, hash chain

Hook enforcement (Edit/Write operations):
1. PreToolUse hook fires → HTTP POST to MCP server
2. MCP server checks: agent has active authority + RBAC permits
3. Response: `permissionDecision: allow|deny`
4. Denied → hook blocks the operation
5. Allowed → operation proceeds, PostToolUse records to ledger

### Target: `packages/studio-mcp/src/rbac/` (new module)

RBAC evaluation engine within the MCP server:
- Permission table loaded from `sherpa.config.ts` at startup
- Role assignment per agent session (assigned at SessionStart registration)
- `evaluatePermission(agentId, operation, resourceType): Allow | Deny` function
- Deny reasons included in response for agent feedback

### Target: `packages/studio-mcp/src/ledger/` (new module)

Governance ledger within the MCP server:
- Append-only SQLite table with hash chain
- `appendEntry(entry): LedgerEntry` — computes hashes, appends
- `verifyChain(): VerificationResult` — replays and validates entire chain
- `queryEntries(filters): LedgerEntry[]` — filtered reads for audit UI
- Canonical JSON serialization using RFC 8785 JCS or sorted-keys
- Genesis entry created on first server start

### Target: `packages/studio-core/src/rbac.ts` (new)

Shared RBAC types and schemas:
- `Role` enum: `researcher | worker | reviewer | integrator | operator`
- `ResourceType` enum: `proposals | shared-artifacts | tasks | config | agents`
- `Operation` enum: `create | read | approve | decline | execute | modify`
- `PermissionTable` type and Zod schema
- `LedgerEntry` type and Zod schema

## Rationale

1. **Conventions are not enforcement.** Sherpa's current "never edit shared artifacts directly" rule is a convention. A misconfigured agent ignores it. RBAC + hooks make it structural — the system denies the operation before it happens, and records the denial.

2. **RBAC and authority are orthogonal and composable.** Every production system examined (AWS IAM, Kubernetes, PostgreSQL, Azure Blob) uses the same two-layer AND/deny-overrides composition. This isn't a design choice — it's a convergent pattern.

3. **The ledger unifies audit with execution.** Following Temporal's pattern, the governance ledger is the source of truth for governance state, not a separate logging concern. Proposals, approvals, authority grants, and permission checks are all ledger entries. Current state is derived from the ledger.

4. **SQLite + hash chain is the minimum viable ledger.** QLDB validated the architecture but was killed. SQL Server Ledger and AuditableLLM validate the implementation pattern. 3.4ms/step overhead is negligible. No new dependencies — just `crypto.createHash('sha256')`.

5. **First-mover in a vacant space.** No AI agent framework ships formal RBAC. No MCP server implements role-based authorization. The combination with a tamper-evident ledger has no precedent.

6. **Regulatory compliance as framework feature.** EU AI Act and FINRA 2026 require immutable decision audit trails. Baking this into the framework means every Sherpa deployment is compliance-ready.

## Dependencies

- `mcp-coordination-layer` — RBAC and ledger run inside the coordination MCP server
- `game-authority-as-mcp-protocol` — RBAC composes with the authority state machine via AND/deny-overrides

## Review Notes

- **Agent identity** is the weakest link. How does an agent prove its role? SessionStart hook could pass a signed token, but MCP sessions don't have stable IDs. Needs design in iteration 2.
- **Role hierarchy**: Should operator inherit integrator's permissions? Flat roles are simpler but require explicit listing. Hierarchical roles risk permission creep. Start flat.
- **Dynamic vs static permissions**: The permission table in this proposal is static (loaded from config). Dynamic permissions (e.g., "this worker can approve proposals only for initiative X") require ABAC extensions. Start static, extend later.
- **Ledger compaction**: At thousands of events, the ledger is trivially small. At millions (large deployment, fine granularity), compaction via snapshotting may be needed. Cross that bridge when we reach it.
- **Read gating**: This proposal gates write operations. Should reads also be RBAC-gated? (e.g., a worker can't read another worker's draft proposals). Probably not in v1 — adds complexity without clear benefit.
- **Effort:** 3-4 sessions. Session 1: RBAC types + permission table + evaluator. Session 2: Ledger schema + append + verify. Session 3: Hook integration + MCP tool wiring. Session 4 (if needed): Studio UI for audit trail viewing.
