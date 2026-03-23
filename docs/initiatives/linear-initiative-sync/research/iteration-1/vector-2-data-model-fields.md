# Vector 2: Linear Initiatives Data Model & Fields

**Question:** What properties and fields do Linear Initiatives support? What's the full data model?
**Agent dispatched:** 2026-03-22

## Findings

### Status Values

**`InitiativeStatus` enum** — exactly 3 values:

| Value | Description |
|-------|-------------|
| `Planned` | Not yet started |
| `Active` | In progress |
| `Completed` | Done |

No `Paused` or `Cancelled`. Those exist only on **Projects** (5 categories: Backlog, Planned, In Progress, Completed, Canceled — with custom sub-statuses per category).

### Text Fields

| Field | Type | Writable | Format |
|-------|------|----------|--------|
| `name` | `String!` | Yes | Plain text |
| `description` | `String` | Yes | Plain text (short) |
| `content` | `String` | Yes | **Markdown** (main body) |
| `documentContent` | `DocumentContent` | Read-only | Structured Prosemirror state |

### Date Fields

| Field | Type | Writable | Description |
|-------|------|----------|-------------|
| `targetDate` | `TimelessDate` | Yes | Estimated completion |
| `targetDateResolution` | `DateResolutionType` | Yes | month/quarter/halfYear/year |
| `startedAt` | `DateTime` | Read-only | Auto-set on Active transition |
| `completedAt` | `DateTime` | Read-only | Auto-set on Completed transition |
| `createdAt` | `DateTime!` | Read-only | Creation timestamp |
| `updatedAt` | `DateTime!` | Read-only | Last update |
| `archivedAt` | `DateTime` | Read-only | When archived |

No explicit `startDate` input — `startedAt` is auto-populated.

### Owner

| Field | Type | Writable |
|-------|------|----------|
| `owner` | `User` | Yes (via `ownerId`) |
| `creator` | `User` | Read-only |

Single owner, no members (unlike Projects which have `members`).

### Progress & Health

Health tracked via `InitiativeUpdate` objects (status reports), NOT auto-computed:

| Field | Type |
|-------|------|
| `health` | `onTrack` / `atRisk` / `offTrack` |
| `healthUpdatedAt` | `DateTime` |
| `lastUpdate` | `InitiativeUpdate` |
| `initiativeUpdates` | `InitiativeUpdateConnection` |

Updates have: `body` (markdown), `health` (enum), `diff`/`diffMarkdown`, comments, reactions.

### Sub-Initiatives

- `parentInitiative` / `parentInitiatives` / `subInitiatives` fields
- Managed via `InitiativeRelation` join table
- Up to 5 levels deep (Enterprise plan only)
- DAG — an initiative can have multiple parents

### No Custom Fields

Initiatives have NO custom fields/properties. Only `color` and `icon` for visual distinction, plus `links` for external resources. Project Labels exist but are project-only.

### Initiative-to-Project Relationship

**Many-to-many** via `InitiativeToProject` join table:
- A Project has `initiatives: InitiativeConnection` (can belong to multiple)
- An Initiative has `projects: ProjectConnection`
- Issue-to-Project is **one-to-one** (`project: Project`)

Full chain: **Initiative (many) ↔ (many) Project (one) ↔ (many) Issue**

### Complete Writable Fields

**Create:** `id`, `name` (required), `description`, `ownerId`, `sortOrder`, `color`, `icon`, `status`, `targetDate`, `targetDateResolution`, `content`

**Update:** `name`, `description`, `ownerId`, `sortOrder`, `color`, `icon`, `targetDate`, `status`, `targetDateResolution`, `trashed`, `content`, update reminder fields

### All Initiative-Related Mutations

| Mutation | Purpose |
|----------|---------|
| `initiativeCreate` | Create |
| `initiativeUpdate` | Update |
| `initiativeArchive` | Archive |
| `initiativeUnarchive` | Unarchive |
| `initiativeDelete` | Trash/delete |
| `initiativeToProjectCreate` | Link project |
| `initiativeToProjectUpdate` | Update link |
| `initiativeToProjectDelete` | Remove link |
| `initiativeRelationCreate` | Parent-child relation |
| `initiativeRelationUpdate` | Update relation |
| `initiativeRelationDelete` | Delete relation |
| `initiativeUpdateCreate` | Post status update |
| `initiativeUpdateUpdate` | Edit status update |
| `initiativeUpdateArchive` | Archive update |
| `initiativeUpdateUnarchive` | Unarchive update |

## Sources

- [Linear Docs: Initiatives](https://linear.app/docs/initiatives)
- [Linear Docs: Projects](https://linear.app/docs/projects)
- [Linear Docs: Project Status](https://linear.app/docs/project-status)
- [Linear Docs: Sub-Initiatives](https://linear.app/docs/sub-initiatives)
- [Linear Docs: Initiative and Project Updates](https://linear.app/docs/initiative-and-project-updates)
- [Linear Changelog: Sub-Initiatives](https://linear.app/changelog/2025-07-10-sub-initiatives)
- [Linear Changelog: Initiative Updates](https://linear.app/changelog/2025-02-13-initiative-updates)
- [Linear Changelog: Custom Project Statuses](https://linear.app/changelog/2024-03-19-custom-statuses-for-projects)
- [Linear Changelog: Project Labels](https://linear.app/changelog/2025-06-12-project-labels)
- [Linear GraphQL API (live introspection)](https://api.linear.app/graphql)

## Implications

1. **Initiatives are too coarse** for Sherpa's 9-stage lifecycle (only 3 fixed statuses). Projects have 5 customizable categories — much better fit.
2. **No custom fields** means lifecycle stage must go in `content`/`description` as structured text.
3. **`declined` has no equivalent** — would need archive or trash.
4. **`content` as markdown body** is ideal for embedding a governance summary.

## Open Questions

1. How to handle `declined` — archive? trash? structured metadata in description?
2. Sub-initiatives are Enterprise-only — `spawned-from` genealogy can't use this on free tier.
3. Can `content` carry machine-readable metadata blocks without breaking Linear's editor?
