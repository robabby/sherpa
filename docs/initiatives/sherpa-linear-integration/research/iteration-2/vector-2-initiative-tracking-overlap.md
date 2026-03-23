# Vector 2: Initiative/Project Tracking Overlap

**Question:** Where does Sherpa's initiative system duplicate Linear's projects/initiatives vs enforce conventions Linear can't?
**Agent dispatched:** 2026-03-21

## Key Finding: Initiative System Is Almost Entirely Governance

Unlike the task system (which has significant redundancy), the initiative system is dominated by governance logic that Linear doesn't model.

## Component Analysis

### Directory Structure (directoturtle) — GOVERNANCE
The `docs/initiatives/*/` structure with proposal.md, plan.md, activity.md, research/ is **convention enforcement**, not project tracking. Linear has no concept of:
- Mandatory proposal with specific frontmatter before work begins
- Forbidden shared artifact edits from worktrees
- Research iteration structure (iteration-N.md files)
- Seeds section for follow-on discovery
- Worktree binding in activity.md

### 6-Status Lifecycle — GOVERNANCE + BRIDGE
`pending | approved | in-progress | integrated | declined | archived`

**GOVERNANCE:** `VALID_TRANSITIONS` (initiative-ops.ts:80-87) prevents invalid state jumps. Linear lets you freely change statuses.

**GOVERNANCE:** `approveInitiative()` has actor-based policy enforcement — agents can't approve `risk: structural` or `risk: evolutionary` initiatives (initiative-ops.ts:463-469).

**BRIDGE:** The current status could sync to Linear as a read-only view.

### 9-Stage Lifecycle Detector — GOVERNANCE (crown jewel)
lifecycle.ts:77-127 auto-detects workflow stage based on:
- Frontmatter status
- File existence (hasResearch, hasPlan, hasActivity)
- Research iteration count
- Linked workstream status

9 stages: needs-research → needs-proposal → needs-review → needs-plan → ready-to-start → in-flight → ready-to-integrate → integrated → archived

Each maps to a next action and responsible actor (human vs agent). Linear's 3-status initiative model (Planned/Active/Completed) can't represent this.

### Initiative MCP Tools — MIXED
| Tool | Classification |
|------|---------------|
| initiative_list | REDUNDANT — basic CRUD |
| initiative_get | REDUNDANT — reads detail |
| initiative_seeds | GOVERNANCE — no Linear equivalent |
| initiative_create | REDUNDANT (except authority check) |
| initiative_approve | GOVERNANCE — actor-gated with policy |
| initiative_update_status | GOVERNANCE — transition validation |
| initiative_activity | GOVERNANCE — activity log append |

### Dependencies vs Informs — GOVERNANCE
Two relationship types that Linear can't model:
- `dependencies:` — hard blocking gate
- `informs:` — non-blocking intelligence flow

Linear only has one dependency type. Sherpa's distinction between "must land first" and "feeds intelligence into" is governance-native.

### Seeds and Genealogy — GOVERNANCE
`spawned-from: <parent-slug>` creates bidirectional trails. Seeds section in activity.md captures follow-on work that surfaced during execution. Linear has no concept of seeds or initiative genealogy.

### Integration Review — GOVERNANCE
Batch review of pending proposals, conflict detection between proposals targeting same artifact, state snapshot freshness verification. Linear doesn't model this.

## Summary

| Component | Classification | Action |
|-----------|---------------|--------|
| Directory structure | GOVERNANCE | Keep |
| 6-status lifecycle | GOVERNANCE | Keep (sync status to Linear as read-only) |
| 9-stage detector | GOVERNANCE | Keep |
| VALID_TRANSITIONS | GOVERNANCE | Keep |
| Actor-gated approval | GOVERNANCE | Keep |
| Activity log + seeds | GOVERNANCE | Keep |
| Integration review | GOVERNANCE | Keep |
| Dependencies vs informs | GOVERNANCE | Keep |
| Spawned-from genealogy | GOVERNANCE | Keep |
| Risk-based approval gating | GOVERNANCE | Keep |
| initiative_list / initiative_get | REDUNDANT | Could bridge to Linear, but low value |

**Bottom line:** The initiative system stays almost entirely in Sherpa. Unlike tasks (significant redundancy), initiatives ARE the governance — the directoturtle structure, lifecycle detection, approval policies, seeds, and integration review are Sherpa's core value proposition.
