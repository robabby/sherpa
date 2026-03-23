# Vector 1: Linear SDK Projects/Initiatives API Surface

**Question:** What does @linear/sdk v78 expose for Projects/Initiatives? Method names, types, CRUD capabilities.
**Agent dispatched:** 2026-03-22

## Findings

### Projects and Initiatives are SEPARATE entities

Linear has a **three-level hierarchy**: Initiative > Project > Issue. The common misconception is that "Projects were renamed to Initiatives." That is wrong:

- **Roadmaps** were renamed to **Initiatives** ([Linear changelog, Feb 2025](https://linear.app/changelog/2025-02-13-initiative-updates))
- **Projects** remain Projects — time-bound work containing issues
- **Initiatives** are the strategic layer above Projects, grouping multiple Projects toward a high-level business outcome

In SDK v78, the old `Roadmap` type exists but every mutation is marked `@deprecated Roadmaps are deprecated, use initiatives instead.`

### SDK Methods

| Method | Return type | Purpose |
|--------|-------------|---------|
| `client.initiative(id)` | `LinearFetch<Initiative>` | Get one initiative |
| `client.initiatives(vars?)` | `LinearFetch<InitiativeConnection>` | List all initiatives |
| `client.initiativeToProject(id)` | `LinearFetch<InitiativeToProject>` | Get one join record |
| `client.initiativeToProjects(vars?)` | `LinearFetch<InitiativeToProjectConnection>` | List join records |
| `client.project(id)` | `LinearFetch<Project>` | Get one project |
| `client.projects(vars?)` | `LinearFetch<ProjectConnection>` | List all projects |

### Initiative CRUD Mutations

| Method | Input | Return |
|--------|-------|--------|
| `client.createInitiative(input)` | `InitiativeCreateInput` | `InitiativePayload` |
| `client.updateInitiative(id, input)` | `string, InitiativeUpdateInput` | `InitiativePayload` |
| `client.deleteInitiative(id)` | `string` | `DeletePayload` |
| `client.archiveInitiative(id)` | `string` | `InitiativeArchivePayload` |
| `client.unarchiveInitiative(id)` | `string` | `InitiativeArchivePayload` |

### Project CRUD Mutations

| Method | Input | Return | Notes |
|--------|-------|--------|-------|
| `client.createProject(input)` | `ProjectCreateInput` | `ProjectPayload` | `teamIds` **required** |
| `client.updateProject(id, input)` | `string, ProjectUpdateInput` | `ProjectPayload` | |
| `client.deleteProject(id)` | `string` | `ProjectArchivePayload` | Trashes the project |
| `client.archiveProject(id)` | `string` | `ProjectArchivePayload` | **Deprecated** → use deleteProject |
| `client.unarchiveProject(id)` | `string` | `ProjectArchivePayload` | |

### Issue-to-Project Association

Issues have `projectId` on `IssueCreateInput` and `IssueUpdateInput`:
```ts
client.updateIssue(issueId, { projectId: "..." }) // add to project
client.updateIssue(issueId, { projectId: null })   // remove from project
```

### Initiative-to-Project Join Table

| Method | Input | Purpose |
|--------|-------|---------|
| `client.createInitiativeToProject(input)` | `{ initiativeId, projectId }` | Link project to initiative |
| `client.deleteInitiativeToProject(id)` | join record ID | Unlink |
| `client.updateInitiativeToProject(id, input)` | `{ sortOrder? }` | Reorder |

### Key Types

- `Initiative`, `InitiativeConnection`, `InitiativeEdge`
- `InitiativeCreateInput`, `InitiativeUpdateInput`
- `InitiativeStatus` enum: `Planned`, `Active`, `Completed` (only 3 values)
- `Project`, `ProjectConnection`, `ProjectEdge`
- `ProjectCreateInput`, `ProjectUpdateInput`
- `InitiativeToProject`, `InitiativeToProjectCreateInput`

### InitiativeCreateInput Fields

```typescript
{
  name: string              // required
  color?: string
  content?: string          // markdown
  description?: string
  icon?: string
  id?: string               // UUID v4, auto-generated
  ownerId?: string
  sortOrder?: number
  status?: InitiativeStatus // "Planned" | "Active" | "Completed"
  targetDate?: TimelessDate
  targetDateResolution?: DateResolutionType
}
```

### ProjectCreateInput Fields (key)

```typescript
{
  name: string              // required
  teamIds: string[]         // required
  description?: string
  content?: string          // markdown
  color?: string
  icon?: string
  leadId?: string
  memberIds?: string[]
  priority?: number         // 0=none, 1=urgent, 2=high, 3=normal, 4=low
  startDate?: TimelessDate
  targetDate?: TimelessDate
  statusId?: string         // project status (custom per workspace)
  labelIds?: string[]
}
```

### Sub-Initiatives

`Initiative` type has `parentInitiative`, `parentInitiatives`, and `subInitiatives` fields. Sub-initiatives added [July 2025](https://linear.app/changelog/2025-07-10-sub-initiatives). Supports up to 5 levels (Enterprise only). Technically a DAG — an initiative can have multiple parents.

## Sources

- [@linear/sdk on npm](https://www.npmjs.com/package/@linear/sdk)
- [Linear Developer SDK docs](https://linear.app/developers/sdk)
- [Linear GraphQL API docs](https://linear.app/developers/graphql)
- [Linear Projects docs](https://linear.app/docs/projects)
- [Linear Initiative updates changelog](https://linear.app/changelog/2025-02-13-initiative-updates)
- [Linear Sub-initiatives changelog](https://linear.app/changelog/2025-07-10-sub-initiatives)
- [Linear GraphQL schema (GitHub)](https://github.com/linear/linear/blob/master/packages/sdk/src/schema.graphql)
- [Apollo Studio: Linear API schema](https://studio.apollographql.com/public/Linear-API/variant/current/schema/reference/objects/Mutation)
- Installed SDK types at `node_modules/.pnpm/@linear+sdk@78.0.0_graphql@16.13.1/node_modules/@linear/sdk/dist/index.d.cts`

## Implications

Sherpa initiatives are scoped, time-bound work with tasks — this maps to **Linear Projects**, not Linear Initiatives. Linear Initiatives are the strategic layer above. The proposal needs to pivot its entity mapping.

## Open Questions

1. Which Linear entity should Sherpa initiatives sync to? Projects (scoped work, custom statuses) vs Initiatives (strategic grouping, fixed 3 statuses)?
2. Projects require `teamIds` — team assignment strategy needed.
3. Should there be a single Linear Initiative grouping all Sherpa projects?
