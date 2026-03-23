# Vector 4: Linear Data Model & Taxonomy Mapping

**Question:** How does Linear model its core entities and how do they map to Sherpa's task-type/mode/role/backend taxonomy?
**Agent dispatched:** 2026-03-21

## Findings

### Issue Data Model

**Standard fields** (from 42K-line GraphQL schema):
- `id`, `identifier` (e.g., "ENG-123"), `number`, `title`, `description` (markdown), `url`, `branchName`
- `assignee: User` (single), `creator: User`, `delegate: User` (agent)
- `team: Team!` (required, single)
- `state: WorkflowState!` (required)
- `priority: Float!` — 0=No priority, 1=Urgent, 2=High, 3=Normal, 4=Low
- `estimate: Float` — complexity (configurable scale per team)
- `dueDate: TimelessDate`
- `project: Project`, `projectMilestone: ProjectMilestone`, `cycle: Cycle`
- `labels: IssueLabelConnection!` — many-to-many
- `parent: Issue`, `children: IssueConnection!` — sub-issue tree
- `relations: IssueRelationConnection!` — blocks, duplicate, related, similar
- Timestamps: `createdAt`, `updatedAt`, `startedAt`, `completedAt`, `canceledAt`, `autoClosedAt`, `autoArchivedAt`, `archivedAt`, `triagedAt`, `snoozedUntilAt`
- SLA: `slaBreachesAt`, `slaHighRiskAt`, `slaMediumRiskAt`, `slaStartedAt`, `slaType`

### Workflow States

Type enum: `triage`, `backlog`, `unstarted`, `started`, `completed`, `canceled`, `duplicate`

Each `WorkflowState` has `name`, `color`, `description`, `position`, `type`, belongs to one `team`. Default set: Backlog → Todo → In Progress → Done → Canceled. Teams can create custom states within each type category.

### Projects

- `name`, `description`, `content` (markdown), `lead: User`, `members: UserConnection!`
- `status: ProjectStatus!` — types: `backlog`, `planned`, `started`, `paused`, `completed`, `canceled`
- `priority: Int!` (0-4 scale), `health: ProjectUpdateHealthType` (onTrack/atRisk/offTrack)
- `progress: Float!` — calculated from issue completion
- `startDate`, `targetDate` with resolution (halfYear/month/quarter/year)
- `teams: TeamConnection!` — multi-team
- `initiatives: InitiativeConnection!`
- `projectMilestones: ProjectMilestoneConnection!`
- Timestamps: `createdAt`, `updatedAt`, `startedAt`, `completedAt`, `canceledAt`

Custom status names/colors within categories. `completed` and `canceled` are permanent defaults.

### Initiatives

- `name`, `description`, `content` (markdown), `owner: User`
- `status: InitiativeStatus!` — `Planned`, `Active`, `Completed`
- `health: InitiativeUpdateHealthType` — onTrack/atRisk/offTrack
- `targetDate`, `targetDateResolution`
- `parentInitiative: Initiative`, `subInitiatives: InitiativeConnection!` — up to 5 levels (Enterprise)
- `projects: ProjectConnection!`
- Hierarchy: Initiative > Sub-Initiative > Project > Issue

### Custom Fields

**Linear does NOT have custom fields.** Searched entire 42K-line schema for `customField`, `custom_field`, `CustomProperty`, `custom_property`, `customAttribute` — zero results.

**Extensibility via labels:**
- Label groups: one level of nesting, mutually exclusive within group (single-select behavior)
- Max 250 labels per group
- Workspace-level or team-level scoping
- Filterable in views
- Reserved names: assignee, cycle, effort, estimate, hours, priority, project, state, status

**Form templates** (Asks fields) support structured intake (priority, customer, due date, file uploads, label group dropdowns) but map to existing issue properties, not custom fields.

### Cycles

- `startsAt`, `endsAt`, `completedAt`, `isActive`, `isFuture`, `isNext`, `isPast`
- `progress: Float!`, `issues: IssueConnection!`
- Duration: 1-8 weeks, fixed intervals, team-specific
- Cooldown: optional break between cycles
- Auto-rollover: uncompleted issues roll to next cycle
- Up to 15 upcoming pre-created

### Estimates

Four scales (team-configurable): Exponential (1,2,4,8,16), Fibonacci (1,2,3,5,8), Linear (1,2,3,4,5), T-Shirt (XS-XL mapped to Fibonacci).

## Taxonomy Mapping

| Sherpa Dimension | Linear Feature | Strategy | Fit |
|---|---|---|---|
| **task-type** | Label Group "Task Type" | Labels: code-implementation, code-review, architect, research, content-generation, audit, embeddings, general. Mutual exclusivity enforced. | Good — label groups behave as single-select enum |
| **mode** | Label Group "Mode" | Labels: interactive, supervised, autonomous. | OK — execution-time concern, could stay framework-side |
| **role** | Label Group "Role" | Labels: engineer, research-lead, technical-writer, code-reviewer, designer. | Good — or use assignee + role label |
| **backend** | **Framework-side only** | Do NOT model in Linear. Backend routing is Sherpa dispatch. | N/A — Linear has no concept of execution backends |
| **priority** | `priority` field (native) | Direct: Sherpa urgent=1, high=2, medium=3, low=4. Linear adds "no priority"=0. | Excellent — near-perfect native fit |
| **status** | Workflow States | Custom states: Pending (unstarted), Dispatched (started), Completed (completed), Failed (canceled), Reviewed (completed). | Good — need two completed substates |
| **judge-verdict** | Label Group "Verdict" | Labels: pending, approved, needs-changes, rejected. Orthogonal to status. | OK — alternative: sub-workflow after completion |
| **Sherpa Initiative** | Linear Project | Project statuses map: backlog=proposal, planned=approved, started=in-progress, completed=integrated. | Good — 6 status categories vs Linear Initiative's 3 |
| **Sherpa Task** | Linear Issue | Direct mapping. Issue description holds task body. | Excellent |

### What Must Stay Framework-Side

- **backend** — execution routing is Sherpa's domain
- **Dispatch config** — route tables (task-type + mode → backend)
- **Agent behavioral definitions** — Sherpa's role system, not Linear's concern
- **Judge pipeline** — Planner/Worker/Judge orchestration (verdict goes to Linear as label/comment)
- **Governance files** — CLAUDE.md, rules, skills — filesystem convention

### What Linear Adds That Sherpa Lacks

- Burndown/velocity tracking, cycle completion history
- Health reporting (onTrack/atRisk/offTrack) with structured update cadence
- SLA enforcement with breach timestamps
- Timeline visualization with project milestones
- Update reminders with configurable cadence
- Multi-team scoping with team-specific workflows

## Sources

- [Linear GraphQL Schema](https://github.com/linear/linear/blob/master/packages/sdk/src/schema.graphql)
- [Linear Workflow Configuration](https://linear.app/docs/configuring-workflows)
- [Linear Projects Docs](https://linear.app/docs/projects)
- [Linear Custom Project Statuses Changelog](https://linear.app/changelog/2024-03-19-custom-statuses-for-projects)
- [Linear Initiatives Docs](https://linear.app/docs/initiatives)
- [Linear Sub-initiatives Changelog](https://linear.app/changelog/2025-07-10-sub-initiatives)
- [Linear Labels Docs](https://linear.app/docs/labels)
- [Linear Project Labels Docs](https://linear.app/docs/project-labels)
- [Linear Cycles Docs](https://linear.app/docs/use-cycles)
- [Linear Estimates Docs](https://linear.app/docs/estimates)
- [Linear Asks Fields Changelog](https://linear.app/changelog/2025-06-05-asks-fields-and-triage-routing)
- [Linear Agent Interaction Docs](https://linear.app/developers/agent-interaction)

## Implications

1. **No custom fields forces creative mapping.** Label groups (mutually exclusive) are the best substitute — they work for single-select dimensions like task-type, mode, role.
2. **Priority maps natively.** Linear's 0-4 scale is almost identical to Sherpa's.
3. **Sherpa initiatives → Linear projects** is the natural mapping. Projects have 6 status categories that accommodate Sherpa's lifecycle. Linear Initiatives (only 3 statuses) are too coarse.
4. **Backend routing stays framework-side.** This is Sherpa's core differentiator — Linear should never know about execution backends.
5. **Two-way sync needs a source-of-truth decision.** Linear for status/tracking, Sherpa for governance/dispatch?
6. **Session estimates → Linear estimates.** 1:1 mapping of session count to estimate points works on the Linear scale.

## Open Questions

1. Multi-select dimensions (e.g., issue touching both research AND content-generation) — label groups enforce single-select. Use regular labels instead?
2. Two-way sync source of truth — Linear for tracking, Sherpa for governance?
3. Sherpa initiative → Linear Project or Initiative? Projects have richer status model.
4. Custom fields roadmap — Linear may be intentionally avoiding this. If added later, label mapping reconsidered.
5. Team scoping — if Sherpa dispatches across multiple Linear teams, each needs its own workflow states.
6. Can Sherpa register as a Linear agent and use agent interaction API to report dispatch progress?
7. Session estimate → Linear estimate scale alignment for larger estimates?
