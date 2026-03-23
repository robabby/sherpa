# Vector 1: Linear API & GraphQL Surface

**Question:** What does Linear's API offer for programmatic project management? GraphQL schema, authentication, rate limits, webhooks, real-time subscriptions, bulk operations.
**Agent dispatched:** 2026-03-21

## Findings

### GraphQL Schema
- Single endpoint at `https://api.linear.app/graphql` — same API Linear uses internally
- Core entities: Issues, Projects, Teams, Cycles, Users, Labels, Workflow States, Comments, Attachments, Documents, Initiatives, Customers, Custom Views, Roadmaps
- Full schema public at [`packages/sdk/src/schema.graphql`](https://github.com/linear/linear/blob/master/packages/sdk/src/schema.graphql)
- Relay-style cursor pagination (`first/after`, `last/before`)
- Rich filtering: `eq`, `neq`, `in`, `nin`, `lt/lte/gt/gte`, string operators (`contains`, `startsWith`, `containsIgnoreCase`), null checks, logical AND/OR, nested relationship filtering, `every` for many-to-many, relative time durations (ISO 8601)

### Authentication
- **Personal API Keys** — simplest path, `Authorization: Bearer <key>`, good for scripts
- **OAuth 2.0** — three grant types: Authorization Code, PKCE (for CLI tools), Client Credentials (server-to-server, 30-day token, single active token per app)
- **Token lifetimes** (post Oct 1, 2025): 24-hour access tokens, refresh enabled by default
- **Actor Authorization** — resources attributed to user OR app (for bot/service accounts)
- **Scopes:** `read`, `write`, `issues:create`, `comments:create`, `timeSchedule:write`, `admin`, plus agent-specific: `app:assignable`, `app:mentionable`

### Rate Limits

| Dimension | API Key | OAuth App |
|-----------|---------|-----------|
| Requests/hour | 5,000 | 5,000/user |
| Complexity points/hour | 250,000 | 2,000,000/user |
| Max single query complexity | 10,000 | 10,000 |

- Leaky bucket algorithm. OAuth apps get 8x complexity budget vs API keys
- Workspace-level OAuth apps with Actor Authorization get dynamically increased limits based on paid user count

### Webhooks
- Supported: Issues, comments, labels, projects, project updates, documents, initiatives, initiative updates, cycles, customers, users, Issue SLA events, OAuthApp revoked
- Actions: `create`, `update`, `remove`
- Payload includes `updatedFrom` (previous values on updates)
- Retry: 3 attempts with backoff (1min, 1hr, 6hr). Auto-disabled on persistent failure
- Security: HMAC-SHA256 via `Linear-Signature` header
- Scope: org-specific, filterable by `resourceTypes` array
- Admin-only creation (or OAuth apps with `admin` scope)

### Real-Time
- **No GraphQL subscriptions** — no WebSocket support. Real-time handled exclusively via webhooks

### Bulk Operations
- `issueBatchUpdate` — update multiple issues at once (IDs + shared change object)
- `issueBatchCreate` — added late 2024, batch create in single call
- No batch mutations for projects/cycles/labels — use aliased mutations as workaround

### Official MCP Server
- **Linear ships a first-party MCP server** at `https://mcp.linear.app/mcp`
- Supports issues, projects, comments via MCP
- OAuth 2.1 with dynamic client registration, or Bearer token auth
- Claude Code integration: `claude mcp add --transport http linear-server https://mcp.linear.app/mcp`

### TypeScript SDK
- `@linear/sdk` on npm, full type generation from GraphQL schema
- Pattern: `new LinearClient({ apiKey })`, methods like `linearClient.issues()`, `linearClient.createIssue({ teamId, title })`
- Exposes raw `LinearGraphQLClient` for custom queries

## Sources

- [Linear Developers - GraphQL](https://linear.app/developers/graphql)
- [Linear Developers - Filtering](https://linear.app/developers/filtering)
- [Linear Developers - OAuth](https://linear.app/developers/oauth-2-0-authentication)
- [Linear Developers - Rate Limiting](https://linear.app/developers/rate-limiting)
- [Linear Developers - Webhooks](https://linear.app/developers/webhooks)
- [Linear Docs - MCP](https://linear.app/docs/mcp)
- [Apollo Studio - Linear API Schema](https://studio.apollographql.com/public/Linear-API/schema/reference?variant=current)
- [npm - @linear/sdk](https://www.npmjs.com/package/@linear/sdk)
- [GitHub - linear/linear schema](https://github.com/linear/linear/blob/master/packages/sdk/src/schema.graphql)

## Implications

- The API is more than sufficient for Sherpa's task lifecycle management
- `issueBatchCreate`/`issueBatchUpdate` directly replace batch dispatch (`dispatch-queue.sh --pending`)
- Rich filtering replaces filesystem queries (grep over YAML frontmatter)
- Webhooks eliminate Luna's 15-minute git sync latency for task detection
- The official MCP server is the cleanest integration path — Sherpa's MCP layer can compose it directly
- OAuth Actor Authorization maps to agent identity — Luna's actions attributed to Sherpa app, not Rob's account
- Rate limits are generous (tens of tasks/day vs thousands/hour capacity)
- No GraphQL subscriptions is fine — webhooks cover the real-time needs

## Open Questions

1. Can Sherpa's task metadata (`task-type`, `backend`, `role`) be stored as custom fields via API, or only labels/projects?
2. `issueBatchCreate` payload size limits?
3. Can webhooks filter by label/custom field, or only by team and resource type?
4. Does the official MCP server support cycles, labels, workflow states, and bulk operations?
5. Linear's free tier allows 250 issues — does this count archived tasks?
6. Offline/local-first: Moving to Linear creates a hard network dependency vs current filesystem system
