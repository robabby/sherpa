---
status: approved
initiative: linear-initiative-sync
created: 2026-03-22
updated: '2026-03-22'
type: new-plan
risk: evolutionary
targets:
  - packages/studio-core/src/linear-projects.ts              # (new file)
  - packages/studio-core/src/linear-mapping.ts
  - packages/studio-core/src/linear-tasks.ts
  - packages/studio-core/src/initiative-ops.ts
  - packages/studio-core/src/process-nodes.ts
  - packages/studio-mcp/src/initiative/tools.ts
dependencies: []
informs:
  - dispatch-evolution
personas:
  - engineer
  - product-manager
spawned-from: sherpa-linear-integration
---

## Summary

Mirror Sherpa initiatives to **Linear Projects** (not Linear Initiatives — see research), giving Linear users visibility into governance state while preserving Sherpa's 9-stage lifecycle as source of truth. Each Sherpa initiative becomes a Linear Project with custom statuses mapping to the 9 lifecycle stages. Existing Linear issues gain grouping under their parent Project, closing the gap left by the task migration. An optional single Linear Initiative ("Sherpa Governance") can serve as a strategic umbrella.

## State Snapshot

**Linear integration today:** `@linear/sdk` v78, singleton client in `linear-client.ts`, issue CRUD via `client.issues()` / `client.createIssue()` / `client.updateIssue()`. No usage of Linear's Projects or Initiatives API anywhere in the codebase. The `initiative` field on `TaskBoardEntry` is hardcoded to `null` for all Linear-sourced issues (`linear-tasks.ts:81`).

**Initiative system today:** 9-stage lifecycle detector (`lifecycle.ts`), 6-status frontmatter with `VALID_TRANSITIONS` (`initiative-ops.ts:80-87`), actor-gated approval, process node graph (`process-nodes.ts`), velocity/staleness tracking, 7 MCP tools. All filesystem-based — no external system integration.

**Prior research conclusion** (`vector-2-initiative-tracking-overlap.md`): "Initiative system is almost entirely governance. At most, sync status to Linear as a read-only view." Classified 9-stage lifecycle as "crown jewel" and noted Linear's 3-status model can't represent it.

**What changed since that research:** Tasks now live exclusively in Linear (27 issues, SG-306–SG-332). The `initiative` slug embedded in issue descriptions has no corresponding Linear entity to group under.

**Iteration 1 key finding (2026-03-22):** Linear has a 3-level hierarchy — Initiative > Project > Issue. "Roadmaps" were renamed to "Initiatives"; Projects are a separate entity. Sherpa initiatives map to **Linear Projects** because: (1) Projects directly contain issues, (2) Projects have 5 status categories with custom sub-statuses that can represent all 9 lifecycle stages, (3) Projects support `startDate`, `targetDate`, `lead`, `members`, `labels`. Linear Initiatives are the strategic layer above — fixed 3 statuses (Planned/Active/Completed), no custom statuses. Free tier supports everything needed; `issueBatchUpdate` can assign all 27 issues in one call.

## Proposed Changes

### New: Linear project sync layer (`linear-projects.ts`)

A new module handling CRUD against Linear's Projects API (`client.createProject()`, `client.updateProject()`). Responsibilities:
- Create/update Linear Projects from Sherpa initiative metadata
- Fetch existing Linear Projects for diffing (by name/slug convention)
- Set custom `statusId` to reflect Sherpa lifecycle stage
- Update `content` field with governance summary (lifecycle stage, next action, actor)
- Associate Linear issues with their parent Linear Project via `issueBatchUpdate`

### One-time setup: Custom project statuses in Linear workspace

Create custom statuses within Linear's 5 project categories that mirror Sherpa's 9 stages:

| Linear Category | Custom Status | Sherpa Lifecycle Stage |
|---|---|---|
| Backlog | Needs Research | needs-research |
| Backlog | Needs Proposal | needs-proposal |
| Planned | Needs Review | needs-review |
| Planned | Needs Plan | needs-plan |
| Planned | Ready | ready-to-start |
| Started | In Flight | in-flight |
| Started | Ready to Integrate | ready-to-integrate |
| Completed | Integrated | integrated |
| Canceled | Archived | archived |

The `declined` status maps to Canceled category. This setup may need to be manual if the API doesn't support custom status creation — iteration 2 research question.

### Extended: Lifecycle-to-status mapping (`linear-mapping.ts`)

Add a `LIFECYCLE_TO_PROJECT_STATUS` mapping table alongside the existing issue state mapping. Maps each of the 9 lifecycle stages to its corresponding custom project `statusId`. Also add a reverse mapping for any future reconciliation.

### Extended: Initiative ops sync hooks (`initiative-ops.ts`)

After successful status transitions and approvals, optionally sync the new state to the corresponding Linear Project. Fire-and-forget — Linear sync failures never block governance operations. The sync writes:
- Project `statusId` (from lifecycle mapping)
- `content` update with governance summary (lifecycle stage, next action, responsible actor, dependencies)
- `startDate` / `targetDate` if available
- `projectUpdateCreate` health indicator (onTrack/atRisk/offTrack) mapped from velocity/staleness

### Extended: Task-project association (`linear-tasks.ts`)

Populate the currently-null `initiative` field on `TaskBoardEntry` by reading the Linear Project association from the issue's `project` relation. When a Linear issue's Project name matches a Sherpa slug, the field gets populated — closing the loop for initiative filtering in both systems.

### Extended: Process node enrichment (`process-nodes.ts`)

Initiative process nodes gain `linearProjectId` and `linearProjectUrl` in metadata, enabling Studio UI to link out to the Linear Project view. No changes to the graph model itself.

### Extended: MCP initiative tools (`initiative/tools.ts`)

Add an optional `sync_to_linear` parameter to `initiative_create` and `initiative_update_status`. When true, mirrors the operation to Linear after filesystem success. Add a new `initiative_sync` tool for bulk-syncing all initiatives (initial migration and drift correction).

### Optional: Linear Initiative as umbrella

Create a single Linear Initiative (e.g., "Sherpa Governance") and link all synced Projects to it via `initiativeToProjectCreate`. This gives a top-level view of all governed work in Linear's Initiative view. Optional because value is marginal if only one team uses Linear.

## Rationale

**Why Linear Projects, not Linear Initiatives:** Iteration 1 research revealed the 3-level hierarchy. Projects have custom statuses (can represent all 9 stages), directly contain issues, and have richer metadata. Initiatives have only 3 fixed statuses — too coarse for governance visibility.

**Why revisit the "don't touch it" conclusion:** The prior research evaluated governance *replacement*, not *mirroring*. The integration creates visibility without moving governance authority. The Sentry pattern (governance as playbook, Linear as execution surface) validates this approach.

**Why Sherpa → Linear direction (not bidirectional):** Sherpa's lifecycle is richer and enforces constraints Linear can't. The Sherpa-as-Linear-Agent initiative (future seed) is the right vehicle for eventually accepting Linear-side status changes.

**Why custom statuses over lossy mapping:** The original proposal accepted 9→3 compression. Research shows custom project statuses can represent all 9 stages without loss. This is strictly better — Linear shows the same granularity as Studio.

## Dependencies

**spawned-from:** `sherpa-linear-integration` — parent's vector-2 research provides the analytical foundation.

**Related seeds from parent:** The `sherpa-linear-agent` seed (OAuth + webhooks) would enable bidirectional sync in the future.

**Informs:** `dispatch-evolution` — once initiatives have Linear Project IDs, task dispatch can use project association instead of the string slug in issue descriptions.

## Review Notes

**Research answered (Iteration 1):**
- SDK exposes both `client.projects()` and `client.initiatives()` — separate entities, both supported
- Free tier fully supports Projects, Initiatives, and API CRUD — no paywalls
- `issueBatchUpdate` can assign up to 50 issues to a Project in one call
- Sub-initiatives require Enterprise — `spawned-from` genealogy can't use structural mapping on free tier

**Open questions (Iteration 2):**
- Can custom project statuses be created via API, or only in the UI?
- Can `projectUpdate` accept custom `statusId`?
- Do webhooks fire for project status changes?
- Can metadata blocks survive in Linear's `content` Prosemirror editor?

**Key trade-off:** Fire-and-forget sync means Linear can drift from Sherpa if sync fails silently. The `initiative_sync` bulk tool mitigates this. Webhook integration (via `sherpa-linear-agent`) would make it real-time.

**Scope boundary:** This initiative covers the sync layer and data plumbing. Does NOT cover OAuth/webhooks, bidirectional sync, Studio UI for managing the connection, or Linear-side automation.

**Effort:** 3-4 sessions (reduced from 4 — research session largely complete)
**Session breakdown:**
- Session 1: Research completion — verify custom status API, test `statusId` updates, workspace setup
- Session 2: Core sync layer — `linear-projects.ts`, mapping table, unit tests
- Session 3: Integration — sync hooks in `initiative-ops.ts`, MCP tools, task association, bulk migration
- Session 4 (if needed): Linear Initiative umbrella, `projectUpdateCreate` health sync, edge cases
