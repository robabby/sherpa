# Reports

Operational artifacts produced by agent roles — triages, audits, reviews, briefs, and backlogs. Organized by content type, attributed to roles via frontmatter.

## Frontmatter Schema

```yaml
---
role: product-manager       # Agent role that produced this
type: triage                # triage | audit | review | brief | backlog | readiness
created: 2026-03-06
initiative: null            # Linked initiative slug, or null
---
```

## Naming Convention

`<type>-<subject>-<YYYY-MM>.md`

Examples:
- `triage-initiatives-2026-03.md`
- `audit-ux-consistency-2026-03.md`
- `readiness-launch-2026-03.md`
- `backlog-web-features-2026-03.md`

## Lifecycle

Reports are snapshots. They don't get updated — new reports supersede old ones. Action items from reports become initiative proposals or tasks.
