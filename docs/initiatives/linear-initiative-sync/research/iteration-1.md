# Iteration 1 — 2026-03-22

## Findings

### Vector 1: SDK API Surface
**Question:** What does @linear/sdk v78 expose for Projects/Initiatives?
**Full report:** [iteration-1/vector-1-sdk-api-surface.md](iteration-1/vector-1-sdk-api-surface.md)

- Linear has a **3-level hierarchy: Initiative > Project > Issue** — NOT a rename from Projects to Initiatives. Roadmaps were renamed to Initiatives; Projects remain Projects.
- SDK exposes `client.initiatives()`, `client.projects()`, and full CRUD for both (`create`, `update`, `delete`, `archive`).
- Initiative-to-Project is many-to-many via `InitiativeToProject` join table. Issue-to-Project is one-to-one.
- Sub-initiatives exist (up to 5 levels, Enterprise only) with DAG structure (multiple parents allowed).

**Implications:** The proposal's entity mapping is wrong. Sherpa initiatives map to **Linear Projects**, not Linear Initiatives.

### Vector 2: Data Model & Fields
**Question:** What properties do Linear Initiatives support?
**Full report:** [iteration-1/vector-2-data-model-fields.md](iteration-1/vector-2-data-model-fields.md)

- Initiatives have only **3 fixed statuses**: Planned, Active, Completed. No Paused, Cancelled, or custom statuses.
- Projects have **5 categories with custom sub-statuses**: Backlog, Planned, In Progress, Completed, Canceled.
- `content` field is full markdown — can carry structured governance metadata.
- No custom fields on Initiatives. Health tracked via manual `InitiativeUpdate` objects.
- No `startDate` input — `startedAt` auto-set on Active transition.

**Implications:** Projects' custom status categories can represent Sherpa's 9 lifecycle stages. Initiatives are too coarse.

### Vector 3: Free Tier & Bulk Operations
**Question:** Does the free tier support Initiative/Project management via API?
**Full report:** [iteration-1/vector-3-free-tier-bulk-ops.md](iteration-1/vector-3-free-tier-bulk-ops.md)

- **Free tier fully supports** Projects, Initiatives, and API CRUD — no paywalls.
- `issueBatchUpdate` can assign up to 50 issues to a Project in one call — all 27 issues in a single mutation.
- Rate limits: 5,000 req/hr, 250,000 complexity points/hr — more than sufficient.
- Only constraint: 250 active issues (27 used, ~223 headroom). Archiving mitigates this.
- Sub-initiatives require Enterprise plan.

**Implications:** Green light on free tier. No blockers.

### Vector 4: Lifecycle Mapping Patterns
**Question:** How do other tools map rich workflows to Linear's status model?
**Full report:** [iteration-1/vector-4-lifecycle-mapping-patterns.md](iteration-1/vector-4-lifecycle-mapping-patterns.md)

- **Sentry's model** is closest to Sherpa's: governance as playbook alongside Linear, not inside it. Linear is execution surface.
- Custom project statuses can represent Sherpa's stages: Backlog (needs-research, needs-proposal), Planned (needs-review, needs-plan, ready-to-start), Started (in-flight, ready-to-integrate), Completed (integrated), Canceled (archived/declined).
- Programmatic `projectUpdateCreate` and `initiativeUpdateCreate` can post health (onTrack/atRisk/offTrack) + markdown body.
- Anti-pattern: expecting Linear to be governance source of truth. Pattern: lossy projection + structured updates.

**Implications:** Custom project statuses solve the lifecycle mapping problem. The Sentry pattern validates Sherpa's approach.

## Synthesis

**The single most important finding: Sherpa initiatives should sync to Linear Projects, not Linear Initiatives.**

The original proposal assumed Linear's "Initiatives" (formerly Projects) are the right sync target. The research reveals Linear has a 3-level hierarchy — Initiative > Project > Issue — and the name change was Roadmaps → Initiatives, not Projects → Initiatives.

Sherpa initiatives are scoped, time-bound governance workflows with tasks (issues). This maps exactly to Linear Projects, which:
1. Directly contain issues (matching Sherpa's initiative→task relationship)
2. Have 5 status categories with **custom sub-statuses** (can represent all 9 lifecycle stages)
3. Support `startDate`, `targetDate`, `lead`, `members`, `labels`, `priority`
4. Are team-scoped (matching Sherpa's project-level organization)

Linear Initiatives are the strategic layer *above* — grouping multiple Projects toward a business outcome. If Sherpa wants a single umbrella entity in Linear, one Linear Initiative called "Sherpa Governance" could group all synced Projects.

**Second key finding: The lifecycle mapping is solvable via custom project statuses.** Rather than a lossy 9→3 compression, Sherpa can create custom statuses within each project category that mirror the 9 stages exactly. This requires a one-time setup of custom statuses in the Linear workspace, then `statusId` on `projectUpdate` for programmatic transitions.

**Third finding: The Sentry pattern validates Sherpa's architecture.** Sentry keeps strict governance rules (WIP limits, design doc requirements, DoD checklists) in playbook documentation, using Linear as the execution surface. This is exactly what Sherpa does — governance lives in `docs/initiatives/` and `.claude/rules/`, Linear is the visibility layer.

## Proposals Generated

The existing `proposal.md` needs significant revision:
- Entity mapping pivot: Linear Projects, not Linear Initiatives
- Custom project statuses for lifecycle mapping
- Optional Linear Initiative as strategic umbrella
- `issueBatchUpdate` for initial migration

## Open Questions for Next Iteration

1. **Custom status management via API** — Can custom project statuses be created programmatically, or must they be set up manually in Linear's UI? This determines whether the sync layer can self-bootstrap.
2. **Project status webhooks** — Do webhooks fire for project status changes? If so, can Sherpa detect manual Linear-side status changes for reconciliation?
3. **`statusId` programmatic updates** — Can `projectUpdate` accept `statusId` to set custom statuses, or only category-level status? This is critical for the 9-stage mapping.
4. **`spawned-from` without sub-initiatives** — Since sub-initiatives require Enterprise, how to represent Sherpa's genealogy in Linear? Options: content metadata, external links, or flat Projects with naming conventions.
5. **Linear content editor compatibility** — Can machine-readable metadata blocks (HTML comments, YAML) survive in the `content` field without breaking Linear's Prosemirror editor?
