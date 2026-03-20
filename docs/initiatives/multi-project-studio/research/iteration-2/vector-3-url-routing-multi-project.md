# Vector 3: URL Routing for Multi-Project Dashboards

**Question:** How do multi-project platforms structure their URLs for project-scoped routes?
**Agent dispatched:** 2026-03-20

## Findings

### Vercel — Path-Based, Team-Scoped
- `vercel.com/{team-slug}/{project-name}/deployments`
- Team-level admin: `vercel.com/{team-slug}/~/settings/members` (`~/` prefix avoids collision with project names)
- Cross-project: `vercel.com/{team-slug}` (team dashboard lists all projects)
- Filters persisted via query params for sharing

### GitHub — Fully Path-Based, Entity-Scoped
- Repo: `github.com/{owner}/{repo}/issues`
- Org Projects: `github.com/orgs/{org}/projects/{number}`
- Cross-repo: `github.com/issues` (your issues across all repos)
- View state (board/table filters) encoded as query params, bookmarkable

### Linear — Path-Based, Workspace-Scoped
- `linear.app/{workspace}/team/{team-key}/active`
- Issue: `linear.app/{workspace}/issue/{TEAM-123}/title-slug`
- Cross-team: `linear.app/{workspace}/my-issues`
- Cycles via query param: `?cycle=36`
- Old URLs redirect after team transfers

### Netlify — Flat Path Namespaces
- Team: `app.netlify.com/teams/{team-slug}`
- Site: `app.netlify.com/sites/{site-name}/deploys`
- Two different path prefixes (`/teams/` and `/sites/`), not nested

### Railway — UUID-Based
- `railway.app/project/{uuid}/service/{uuid}`
- Functional for deep linking but not human-readable

### Next.js App Router Patterns
- Multi-tenant: `app/[tenant]/layout.tsx` with dynamic segment
- Subdomain: middleware rewrites to path-based internally
- Best practice: **path segments for identity, query params for filtering**

## Universal Pattern

**Every platform uses path segments for project scoping. None use query params.** Query params are reserved for transient state (filters, view modes, pagination).

## Comparison

| Platform | Scope location | Pattern | Human-readable |
|----------|---------------|---------|----------------|
| Vercel | Path segment | `/{team}/{project}/...` | Yes (slugs) |
| GitHub | Path segment | `/{owner}/{repo}/...` | Yes (slugs) |
| Linear | Path segment | `/{workspace}/team/{key}/...` | Yes (slugs) |
| Netlify | Path segment (flat) | `/sites/{name}/...` | Yes (slugs) |
| Railway | Path segment | `/project/{uuid}/...` | No (UUIDs) |

## Recommendation: `/projects/{slug}/...`

```
# Project-scoped
/projects/{slug}/process
/projects/{slug}/research/{report-slug}
/projects/{slug}/tasks
/projects/{slug}/workforce
/projects/{slug}/conventions
/projects/{slug}/docs/{...path}

# Cross-project / unscoped
/                          # Project picker or default project
/projects                  # All projects list
/activity                  # Cross-project feed
/auth/sign-in              # Auth (project-agnostic)
```

**Why:**
1. Industry consensus is unanimous — path segments for resource scoping
2. Deep linking works naturally — `studio.sherpa.solar/projects/robabby/research/2026-03-20`
3. Next.js supports directly — `app/(studio)/projects/[project]/research/[slug]/page.tsx`
4. Current Studio structure adapts cleanly — `(studio)` route group stays
5. Query params stay available for their proper role (filters, view state)

## Sources

- [Vercel Project Dashboard](https://vercel.com/docs/projects/project-dashboard)
- [GitHub Projects Quickstart](https://docs.github.com/en/issues/planning-and-tracking-with-projects/learning-about-projects/quickstart-for-projects)
- [Linear Workspaces](https://linear.app/docs/workspaces)
- [Netlify Domains](https://docs.netlify.com/manage/domains/get-started-with-domains/)
- [Railway Projects](https://docs.railway.com/projects)
- [Next.js Multi-Tenant Guide](https://nextjs.org/docs/app/guides/multi-tenant)
- [Vercel Platforms Starter Kit](https://github.com/vercel/platforms)

## Open Questions

1. Single-project default: should `/` redirect to `/projects/{only-project}/` automatically?
2. Migration: should unscoped routes (`/process`) redirect to `/projects/{default}/process`?
3. `[project]` as layout segment (loads config, provides via context) or middleware resolution?
4. Project slug source — from `sherpa.json` name field?
