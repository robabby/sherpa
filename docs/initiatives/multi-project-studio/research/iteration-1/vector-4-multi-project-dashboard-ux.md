# Vector 4: Multi-Project Dashboard UX

**Question:** How do cloud platforms and dev tools present multi-project dashboards — project-scoped vs. cross-project views?
**Agent dispatched:** 2026-03-20

## Findings

### Vercel — Sidebar Scope Filter
- 2026 redesign: moved tabs to **resizable, hideable sidebar**. Projects act as filters — click a project and same navigation scopes down
- **Same nav items exist at team and project level.** Selecting a project is filtering, not navigating to a different section
- Universal search (Cmd+K) finds teams, projects, pages. AI-powered "Navigation Assistant"
- Favorites: pin teams and projects to dashboard
- Team-level shows all deployments/domains/usage; project-level narrows to one project

### GitHub — Repo-Centric Navigation + Org-Level Project Boards
- **Repository Dashboard** (GA Feb 2026): dedicated page at `github.com/repos` for filtering all repos. Saved queries bookmark custom filters
- **GitHub Projects V2** operates at organization level — single board can pull issues/PRs from any repo in org
- Multiple views per project: Board, Table, Roadmap. Custom fields allow slicing across repos
- Separates "navigation" (repo-centric) from "project management" (org-level, spans repos)

### Railway — Project-Centric Canvas
- Dashboard lists all projects by last-opened. Flat list, no hierarchy
- Inside a project: **canvas** showing all services and relationships spatially
- Environment switching via dropdown. Observability per-project only
- No cross-project unified views

### Netlify — Team as Container
- Team Overview: build status across all sites, usage metrics, recent activity
- Organization Overview: cross-team monitoring, billing
- Simple: team = container of sites. Team overview is the "cross-project" view

### Linear — The Sophisticated Model
- **Workspace > Teams > Projects > Issues.** Most sophisticated hierarchy studied
- Sidebar: workspace switcher (top-left), My Issues, joined teams with expandable sub-nav, projects, custom views
- **Projects span teams** — a project can be shared across multiple teams
- **Custom Views** are the power tool: save filtered board/list scoped to personal, team, or workspace. Filter by any property across teams/projects
- **"My Issues"** — automatic personal cross-team view. Zero configuration

### Grafana — Anti-Pattern
- Organizations provide **complete isolation** — no cross-org views
- Single-level folders only (no nesting) — "dashboard sprawl" at scale
- Switching orgs required logout/login (known pain point)
- **Home dashboard per scope** (org/team/user) is interesting though

## UX Pattern Taxonomy

| Pattern | Used By | Mechanism |
|---------|---------|-----------|
| Sidebar scope filter | Vercel | Same nav, project selection filters data |
| Workspace switcher dropdown | Linear, Grafana | Top-left switches entire context |
| Flat project list | Railway, Netlify | Landing page, cards/rows |
| Universal search / Cmd+K | Vercel, GitHub | Find anything across everything |
| Favorites / pinning | Vercel | Pin frequent projects |
| Custom saved views | Linear | User-constructed cross-scope filters |

## Best Cross-Project Patterns

1. **Custom saved views with cross-scope filters (Linear)** — users construct filtered views across projects, save them, share at workspace level
2. **Projects-as-filter on consistent navigation (Vercel)** — sidebar stays constant, project narrows data
3. **Org-level boards pulling from multiple sources (GitHub V2)** — dedicated cross-cutting entity
4. **Universal search as escape hatch (Vercel, GitHub)** — when hierarchy fails, search
5. **Personal cross-cutting view (Linear "My Issues")** — auto-aggregates your work across projects

## Sources

- [Vercel Dashboard Redesign](https://vercel.com/blog/dashboard-redesign)
- [Vercel Universal Search](https://vercel.com/changelog/dashboard-universal-search)
- [GitHub Repository Dashboard](https://github.blog/changelog/2026-02-24-repository-dashboard-is-now-generally-available/)
- [GitHub Projects V2](https://docs.github.com/en/issues/planning-and-tracking-with-projects/learning-about-projects/about-projects)
- [Railway Projects](https://docs.railway.com/projects)
- [Netlify Team Overview](https://www.netlify.com/blog/2020/10/22/announcing-team-overview-collaborate-easier-develop-faster/)
- [Linear Conceptual Model](https://linear.app/docs/conceptual-model)
- [Linear Custom Views](https://linear.app/docs/custom-views)
- [Grafana Dashboard Management](https://grafana.com/docs/grafana/latest/dashboards/manage-dashboards/)

## Implications for Sherpa Studio

1. **Sidebar with project scope filter (Vercel)** — lowest-friction approach. Nav structure stays same; data scope changes. "All Projects" as default
2. **"My Work" cross-project view (Linear)** — personal view of tasks/initiatives across all projects
3. **Saved/custom views (Linear)** — "all blocked tasks," "all in-progress initiatives" as sidebar items
4. **Command palette / universal search** — Cmd+K across all projects
5. **Project list as landing page** — default dashboard with summary stats per project

**Avoid:** Grafana's hard org isolation, deep nesting without breadcrumbs, requiring manual per-project navigation

## Open Questions

1. Is entering a project a filter operation (Vercel) or navigation operation (Railway)?
2. Do agents span projects? Tasks belong to projects, but agents (like Luna) work across all
3. How does multi-config loading work for cross-project views?
4. URL structure: project as path segment or query/filter state?
5. Should cross-project search results show project badges?
