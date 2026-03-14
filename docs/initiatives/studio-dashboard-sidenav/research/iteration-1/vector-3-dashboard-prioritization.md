# Vector 3: Operational Dashboard Prioritization Patterns

**Question:** What do developer tool dashboards show on their home page? How do they decide what's "needs attention" vs. informational?
**Agent dispatched:** 2026-03-14

## Findings

### The "My Work" Pattern: Action-First
- GitHub's 2025 dashboard split into "My Work" (default) and "Feed" tabs. My Work shows PRs/issues with actionable next steps ("waiting for review", "checks failing"). Feed became opt-in background.
- Linear defaults to "Active Issues" — not a dashboard or inbox. Shows Unstarted/Started status items. Configurable to My Issues, Inbox, Current Cycle.
- Both default to *work in progress*, not *everything*.

### Triage Inbox Pattern
- Linear's Triage: dedicated staging inbox. Four actions: Accept, Decline, Duplicate, Snooze. Nothing enters active workflow without deliberate human review.
- Linear's "Focus" grouping creates implicit priority: Urgent > SLA > Blocking > Current cycle > Future > Other > Triage > Backlog.

### Anomaly-Based Alerting
- Vercel uses statistical anomaly detection, not thresholds. Error Anomaly fires when 5-min rate is >4 standard deviations above 24-hour average AND exceeds minimum count. No alert when things are normal.
- Grafana's Alert List sorts by Importance: firing (1) → pending → no-data → normal (4) → paused (5).

### Two Dashboard Types
- Operational dashboards: real-time, alerts, immediate action. Analytical dashboards: trends, historical, deeper investigation. Mixing creates cognitive friction.
- Linear best practices: "fewer dashboards" — median workspace creates just 2.

### Empty States as Success
- "Nothing needs attention" is a positive outcome, not an error. Design for "inbox zero" as a deliberate success state.

### XM Institute's Four Principles
- Tailor to user goals, make it simple ("need to have" not "nice to have"), organize for insight (3 most important metrics at top, larger), optimize visual design (F/Z scan patterns).

## Sources

- [GitHub Community #171472](https://github.com/orgs/community/discussions/171472) — dashboard redesign discussion
- [GitHub Blog 2025-09-04](https://github.blog/changelog/2025-09-04-the-dashboard-feed-page-gets-a-refreshed-faster-experience/) — feed refresh
- [Linear Docs: Preferences](https://linear.app/docs/account-preferences) — default landing config
- [Linear Docs: Triage](https://linear.app/docs/triage) — triage inbox pattern
- [Linear Docs: My Issues](https://linear.app/docs/my-issues) — Focus grouping
- [Vercel Docs: Alerts](https://vercel.com/docs/alerts) — anomaly detection
- [Vercel Blog: Dashboard Redesign](https://vercel.com/blog/dashboard-redesign) — operational status approach
- [Grafana Docs: Alert List](https://grafana.com/docs/grafana/latest/panels-visualizations/visualizations/alert-list/) — importance ranking
- [Klipfolio](https://www.klipfolio.com/blog/starter-guide-to-dashboards) — dashboard types
- [Linear Dashboard Best Practices](https://linear.app/now/dashboards-best-practices) — fewer dashboards principle
- [Backstage Docs: Homepage](https://backstage.io/docs/getting-started/homepage/) — widget grid portal model
- [XM Institute / Qualtrics](https://www.qualtrics.com/xm-institute/blog/action-centric-dashboard-design/) — action-centric principles
- [Eleken](https://www.eleken.co/blog-posts/empty-state-ux) — empty state UX
- [Cloudscape](https://cloudscape.design/patterns/general/empty-states/) — empty state patterns

## Implications

The 12-panel grid should become three tiers: **Action Required** (pending reviews, failed tasks, stale items), **Active Work** (in-progress initiatives, running dispatches), **Context** (system health, history — collapsed or secondary). Panels without actionable content (Conventions count, Skills list) should be sidebar-only. Default to the operational view. Design an explicit "all clear" empty state.

## Open Questions

- What constitutes "needs attention" in Sherpa? Failed dispatch is clear. Proposal pending >3 days? Task with no activity >24h?
- Should the dashboard be role-aware (Planner vs. Worker vs. Judge see different priorities)?
- Where does infrastructure status (MCP, LM Studio) belong — dashboard or push-based notifications?
