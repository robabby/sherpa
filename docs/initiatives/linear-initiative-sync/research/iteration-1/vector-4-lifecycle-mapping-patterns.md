# Vector 4: Lifecycle Mapping Patterns

**Question:** How do other tools map rich internal workflows to Linear's simpler status model? Precedents for governance tools mirroring state to Linear?
**Agent dispatched:** 2026-03-22

## Findings

### Initiative Status is Even More Constrained

Linear Initiatives: 3 fixed statuses (Planned, Active, Completed).
Linear Projects: 5 categories with **custom sub-statuses per category** ([Custom statuses changelog](https://linear.app/changelog/2024-03-19-custom-statuses-for-projects)).

Custom project statuses can represent Sherpa's stages:
- **Backlog**: "Needs Research", "Needs Proposal"
- **Planned**: "Needs Review", "Needs Plan", "Ready"
- **Started**: "In Flight", "Ready to Integrate"
- **Completed**: "Integrated"
- **Canceled**: "Declined", "Archived"

### Existing Integration Patterns

**Sentry — Governance as Playbook, Linear as Execution** ([Sentry playbook](https://develop.sentry.dev/sdk/getting-started/playbooks/coordination/managing-linear-projects/))
Strict governance rules (WIP limits, mandatory design docs, DoD checklists) live in documentation, not in Linear itself. Linear is the execution surface; the playbook is the governance layer. **Most similar to Sherpa's model.**

**Harness CI/CD — Linear as Approval UI** ([Harness docs](https://developer.harness.io/docs/continuous-delivery/kb-articles/articles/linear-app-with-custom-approval/))
Creates Linear issues via GraphQL, polls status. "Done" = approve deployment, "Canceled" = reject. External workflow engine, Linear as interaction layer.

**Index.inc — Bidirectional Initiative Sync** ([Index launches](https://index.inc/launches/sync-linear-initiatives))
Push, pull, and sync for Linear Initiatives with metadata carryover. Closest precedent to Sherpa's needs.

**Port.io — One-Way Catalog Ingestion** ([Port docs](https://docs.port.io/build-your-software-catalog/sync-data-to-catalog/project-management/linear/))
Ingests Linear data via JQ-based mapping. Linear is data source; Port is enrichment layer.

**Trunk.io — Webhook Transform** ([Trunk docs](https://docs.trunk.io/flaky-tests/webhooks/linear-integration))
Custom JS transforms webhook payloads into Linear mutations. Transformation layer pattern.

**Linear's Native Jira Sync** ([Linear Jira docs](https://linear.app/docs/jira))
Bidirectional sync: title, description, assignee, status, labels, priority. Jira epics → Linear projects. Features Jira supports but Linear doesn't are silently dropped.

### Programmatic Updates

Both project and initiative updates can be posted via API:
- `projectUpdateCreate` / `initiativeUpdateCreate` mutations
- Health: `onTrack`, `atRisk`, `offTrack`
- Body: markdown rich text
- Linear's own MCP server supports creating initiative updates ([Linear MCP Feb 2026](https://linear.app/changelog/2026-02-05-linear-mcp-for-product-management))

### Patterns That Work

1. **Lossy projection + structured updates**: Map 9 stages to 3-5 statuses, use programmatic updates (health + body) to communicate the rich lifecycle stage.
2. **Custom project statuses as lifecycle stages**: Create sub-statuses within project categories mirroring Sherpa's stages.
3. **Description as metadata carrier**: Embed `<!-- sherpa:lifecycle:needs-review -->` or YAML block in content.
4. **Webhook-driven reconciliation**: Detect manual Linear status changes, reconcile back to source of truth.
5. **Governance as playbook, Linear as execution**: Sentry's model — validates Sherpa's approach.

### Anti-Patterns to Avoid

1. **Expecting Linear to be governance source of truth**: Linear doesn't support the granularity needed.
2. **Two-way status sync at granular level**: 9→3 is lossy; round-tripping creates confusion.
3. **Overloading issue status for non-issue concepts**: Initiatives/projects have different status models than issues.

### Recommended Mapping

| Sherpa Lifecycle Stage | Linear Project Category | Custom Status Name |
|---|---|---|
| needs-research | Backlog | Needs Research |
| needs-proposal | Backlog | Needs Proposal |
| needs-review | Planned | Needs Review |
| needs-plan | Planned | Needs Plan |
| ready-to-start | Planned | Ready |
| in-flight | Started | In Flight |
| ready-to-integrate | Started | Ready to Integrate |
| integrated | Completed | Integrated |
| archived | Canceled | Archived |

## Sources

- [Custom project statuses](https://linear.app/changelog/2024-03-19-custom-statuses-for-projects)
- [Project status docs](https://linear.app/docs/project-status)
- [Initiative updates](https://linear.app/changelog/2025-02-13-initiative-updates)
- [Initiative and project updates docs](https://linear.app/docs/initiative-and-project-updates)
- [Linear MCP for product management](https://linear.app/changelog/2026-02-05-linear-mcp-for-product-management)
- [Sentry Linear playbook](https://develop.sentry.dev/sdk/getting-started/playbooks/coordination/managing-linear-projects/)
- [Harness Linear approval](https://developer.harness.io/docs/continuous-delivery/kb-articles/articles/linear-app-with-custom-approval/)
- [Index.inc Linear sync](https://index.inc/launches/sync-linear-initiatives)
- [Port.io Linear integration](https://docs.port.io/build-your-software-catalog/sync-data-to-catalog/project-management/linear/)
- [Linear Jira sync](https://linear.app/docs/jira)
- [Linear Webhooks](https://linear.app/developers/webhooks)

## Implications

**Projects are the better sync target** — custom statuses can represent the full 9-stage lifecycle, while Initiatives are stuck at 3. Use a Linear Initiative as an optional strategic umbrella grouping all Sherpa projects.

## Open Questions

1. Can custom project statuses be created/managed via API, or only in the UI?
2. Do webhooks fire for project status changes?
3. Can `statusId` be set programmatically on `projectUpdate`?
4. Initiative update frequency — any throttling on rapid updates?
