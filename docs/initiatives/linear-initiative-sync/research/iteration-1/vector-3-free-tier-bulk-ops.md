# Vector 3: Free Tier Access & Bulk Operations

**Question:** Does Linear's free tier allow Initiative/Project creation and management via API? Can issues be bulk-assigned?
**Agent dispatched:** 2026-03-22

## Findings

### Free Tier — Full Support

The [Linear pricing page](https://linear.app/pricing) explicitly lists "Issues, projects, cycles, initiatives" and "API and webhook access" as core features on **all tiers including Free**.

Free tier limits:
- **2 teams**, 250 active issues (archived don't count)
- 10MB file uploads, unlimited members
- **No stated limit on Projects or Initiatives**

### API Access Not Tier-Restricted

- Rate limits: **5,000 requests/hour** (API key auth), **250,000 complexity points/hour**
- Max single query complexity: 10,000 points
- No documentation states any GraphQL mutations are paywalled
- CRUD for issues, projects, and initiatives fully available on Free

### Bulk Operations

**`issueBatchUpdate` mutation exists:**
```graphql
issueBatchUpdate(
  ids: [UUID!]!     # max 50 at a time
  input: IssueUpdateInput!
): IssueBatchPayload!
```

`IssueUpdateInput` includes `projectId: String`, so you can bulk-assign up to **50 issues to a Project in a single call**. All 27 existing issues can be reassigned in one mutation.

### Initiative-to-Project Linking

Issues are NOT assigned directly to Initiatives. The chain:
- Issues → Projects (via `projectId` on issue)
- Projects → Initiatives (via `InitiativeToProject` join table)

### Paid Tier Gates

| Feature | Tier |
|---------|------|
| Sub-initiatives (5 levels) | Enterprise |
| Private teams | Plus ($16/mo) |
| >2 teams | Standard ($10/mo) |
| >250 active issues | Standard ($10/mo) |
| API + webhooks | All tiers |
| Projects + Initiatives | All tiers |

### The 250-Issue Cap

With 27 issues already in Linear, headroom for ~223 more active issues. Archived issues don't count — archiving completed work is the mitigation.

## Sources

- [Linear Pricing](https://linear.app/pricing)
- [Linear Billing and Plans](https://linear.app/docs/billing-and-plans)
- [Linear API docs](https://linear.app/docs/api-and-webhooks)
- [Linear Rate Limiting](https://linear.app/developers/rate-limiting)
- [Linear GraphQL Schema (GitHub)](https://github.com/linear/linear/blob/master/packages/sdk/src/schema.graphql)

## Implications

**Clear green light.** Free tier supports everything Sherpa needs:
- Create/manage Projects and Initiatives via API ✓
- Bulk-assign issues to Projects ✓
- No Project/Initiative count limits ✓
- 5,000 req/hr is more than sufficient for ~27 issues ✓

Only constraint: sub-initiatives require Enterprise (blocks `spawned-from` structural mapping).

## Open Questions

1. Webhook availability on free tier — pricing page says yes, worth empirical verification.
2. Archive hygiene process needed to stay under 250 active issues.
