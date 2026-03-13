# Vector 1: Solo Operator Mission Control Dashboards

**Question:** What do single-user operational dashboards look like for solo operators managing automated systems? What information hierarchy works when there's one human reviewing automated output?
**Agent dispatched:** 2026-03-09

## Findings

### Retool — Internal Tool Patterns

- Retool positions itself for the person "your teammates DM when they need a dashboard, admin panel, or one-off data fix" — the solo internal toolsmith. ([retool.com/use-case/dashboards-and-reporting](https://retool.com/use-case/dashboards-and-reporting))
- Building blocks are Tables, Lists, Charts, Forms, Wizards, and Maps — composable primitives, not pre-built dashboards. ([retool.com/blog/popular-templates-internal-tools](https://retool.com/blog/popular-templates-internal-tools))
- Retool Agents (2025) added a Monitor page with three views: **global (all agents)**, **individual agent detail**, and **individual run detail**. The global view shows an Agent Graph (nodes = agents, edges = tool calls, animated during execution), plus token usage, estimated cost, total runtime, and total runs. ([docs.retool.com/agents/guides/monitor](https://docs.retool.com/agents/guides/monitor))
- Run statuses are: SUCCESS, MANUALLY_CANCELED, FAILURE, TIMED_OUT — with start timestamp and duration. This is the exact vocabulary a solo operator needs. ([docs.retool.com/agents/guides/monitor](https://docs.retool.com/agents/guides/monitor))
- The Application Performance Dashboard template shows the "top-rail KPI cards + detail table below" pattern. ([retool.com/templates/application-performance-dashboard](https://retool.com/templates/application-performance-dashboard))

### Airplane.dev — Design Patterns (Now Defunct)

- Airplane established three core abstractions: **Tasks** (single operations), **Views** (React-based GUIs), and **Runbooks** (multi-step workflows). These map cleanly to "what ran," "what you see," and "what to do about it." ([airplane.dev/blog/introducing-powerful-multi-step-workflows-in-airplane](https://www.airplane.dev/blog/introducing-powerful-multi-step-workflows-in-airplane))
- Acquired by Airtable in early 2024 as an acqui-hire (CEO hired to lead Airtable AI). Product was sunset March 2024. The design patterns live on in alternatives like Appsmith and Retool. ([airplane.dev/blog/airtable](https://www.airplane.dev/blog/airtable), [fantasyma.substack.com](https://fantasyma.substack.com/p/what-the-airtable-acquisition-of))
- Key design philosophy: the component library handles layout, UI, and access controls so the developer focuses on business logic — the "infrastructure-as-library" pattern. ([airplane.dev](https://www.airplane.dev/))

### Grafana Home Dashboard

- Grafana's preference hierarchy has four levels: Server > Organization > Team > User, with the lowest (most specific) always winning. For a solo operator, you ARE the only level. ([grafana.com/docs/grafana/latest/administration/organization-preferences](https://grafana.com/docs/grafana/latest/administration/organization-preferences/))
- Home dashboard is set from starred dashboards — you curate your own landing page. The pattern is: **star what matters, make the most important one your home**. ([community.grafana.com](https://community.grafana.com/t/setting-default-home-dashboard-for-my-server/50543))
- Best practices for home dashboards: highlight only the most critical metrics, use line graphs for time series and gauges for single values, group related metrics together. ([grafana.com/docs/grafana/latest/dashboards](https://grafana.com/docs/grafana/latest/dashboards/))
- Grafana also published an Agent Framework dashboard template for AI agent monitoring with response time trends, success rate gauges, throughput analysis, and token consumption. ([grafana.com/grafana/dashboards/24156-agent-framework](https://grafana.com/grafana/dashboards/24156-agent-framework/))

### PagerDuty Operations Console

- The Operations Console is a **customizable live incident table** with column picker, drag-and-drop reordering, resizable columns, and up to 10 custom fields. This is the "spreadsheet you actually want" pattern. ([support.pagerduty.com/main/docs/operations-console](https://support.pagerduty.com/main/docs/operations-console))
- Filtering supports keyword search on Title, Incident Number, and Latest Note with operators (contains, starts with, equals, does not contain) and AND/OR combinators. ([support.pagerduty.com/main/docs/operations-console](https://support.pagerduty.com/main/docs/operations-console))
- Side panel provides contextual detail without leaving the list — snooze time, alert grouping, alert custom details, all at a glance. **No tab-switching.** ([support.pagerduty.com/main/docs/operations-console](https://support.pagerduty.com/main/docs/operations-console))
- Toggle between **Live** and **Paused** update modes. During incident storms, you can freeze the view to triage without new items pushing things around. ([support.pagerduty.com/main/docs/operations-console](https://support.pagerduty.com/main/docs/operations-console))
- Multi-column sorting (up to 3 columns simultaneously). ([support.pagerduty.com/main/docs/operations-console](https://support.pagerduty.com/main/docs/operations-console))

### Solo SaaS Operator / Mission Control Dashboards

- **MeisnerDan/mission-control** (GitHub) is explicitly "the command center for solo entrepreneurs who delegate work to AI agents." Uses Eisenhower matrix (Do/Schedule/Delegate/Eliminate) for task triage. All data stored in local JSON files — agents read/write the same source of truth as the web UI. Includes an **inbox**, **decisions queue**, and per-agent workload view. ([github.com/MeisnerDan/mission-control](https://github.com/MeisnerDan/mission-control))
- **builderz-labs/mission-control** provides 28 panels including tasks, agents, logs, tokens, memory, cron, alerts, webhooks, and pipelines. Uses SQLite (zero external deps), Kanban board with drag-and-drop, and **quality gates** that block task completion without sign-off. Real-time via WebSocket + SSE. ([github.com/builderz-labs/mission-control](https://github.com/builderz-labs/mission-control))
- **nachoal/ai-fleet** takes a CLI-first approach: 1 agent = 1 git worktree + 1 branch + 1 tmux session. State persisted in `~/.ai_fleet/state.json`. Commands: `fleet create`, `fleet logs`, `fleet list --grouped`, `fleet kill`. This is WavePoint's current worktree model with orchestration added. ([github.com/nachoal/ai-fleet](https://github.com/nachoal/ai-fleet))
- **Continue.dev Mission Control** rebuilt as a control plane for cloud agents — create Tasks, manage Agents, connect Integrations. Automates via GitHub triggers, cron schedules, or webhooks. Generates diffs, opens PRs, updates docs. ([blog.continue.dev/introducing-mission-control-your-ai-dashboard](https://blog.continue.dev/introducing-mission-control-your-ai-dashboard))
- One developer runs 6 autonomous AI agents on a single VPS — write code, review PRs, handle deployments, run QA, research. Key insight: **observability must detect garbage immediately, not after 30 commits of broken code**. Uses Prometheus for cost tracking. ([blog.oguzhanatalay.com](https://blog.oguzhanatalay.com/architecting-multi-agent-ai-fleet-single-vps))
- Solo founder with 8 AI "departments" (CEO, CFO, COO, Lawyer, etc.) using GitHub Copilot custom agents sharing a persistent knowledge graph. Cost: zero (included in existing subscription). Implementation: ~40 hours over 2 months. ([dev.to/setas](https://dev.to/setas/i-run-a-solo-company-with-ai-agent-departments-50nf))

### Information Hierarchy & UX Research

- **Academic taxonomy (Edinburgh/King's College, 144 dashboards):** Eight pattern groups covering data information, meta information, visual encoding, interactions, and composition. Six dashboard genres: three curated (static, magazine, infographic) and three data collections (analytic, repository). Operational dashboards fall into "repository" or "analytic" genres. ([dashboarddesignpatterns.github.io](https://dashboarddesignpatterns.github.io/))
- **F-pattern / Z-pattern scanning:** Eye-tracking research confirms users scan in F-shape. Most important data goes top-left. For a solo operator, this means: status summary top-left, action items top-right, detail below. ([pencilandpaper.io](https://www.pencilandpaper.io/articles/ux-pattern-analysis-data-dashboards))
- **5-second rule:** It should take less than 5 seconds for users to find information on a dashboard. Best dashboards use no more than 5-6 cards in the initial view. ([excited.agency/blog/dashboard-ux-design](https://excited.agency/blog/dashboard-ux-design))
- **Progressive disclosure:** Show summary first, let user drill into detail. Labels must have strong "information scent" — users should be able to predict what they will find before clicking. ([nngroup.com/articles/progressive-disclosure](https://www.nngroup.com/articles/progressive-disclosure/))
- **Management by exception / exception-based design:** Show only data that requires attention. Uses standard deviation to flag metrics outside normal ranges. Operates on a **push model** — can be safely left alone until it asks for your attention. This is the critical pattern for a solo operator who cannot afford to scan everything. ([brightgauge.com](https://www.brightgauge.com/blog/how-managing-by-exception-helps-simplify-dashboard), [prosense.com.au](https://www.prosense.com.au/post/creating-effective-dashboards-using-exception-based-design-and-trend-analysis))
- **PatternFly aggregate status cards:** Show total count + aggregated status (e.g., "47 nodes: 45 healthy, 2 down"). Card title = total count. Link to detail view. This is the canonical "glanceable status" component. ([patternfly.org/patterns/dashboard/design-guidelines](https://www.patternfly.org/patterns/dashboard/design-guidelines/), [pf3.patternfly.org/v3/pattern-library/cards/aggregate-status-card](https://pf3.patternfly.org/v3/pattern-library/cards/aggregate-status-card/))
- **Evil Martians (5 patterns for dev tool UIs):** Tabs for context-switching without losing place, Properties Panels for label-value metadata display, Tables for structured data with sort/filter. Also: resizable panels, pinnable files, independent zoom, persistent interface states. ([evilmartians.com/chronicles/keep-it-together-5-essential-design-patterns-for-dev-tool-uis](https://evilmartians.com/chronicles/keep-it-together-5-essential-design-patterns-for-dev-tool-uis))
- **Sentry AI Agents Dashboard:** Provides executions, model costs, token usage, tool calls, and recent errors in a single view. Interactive traces show full execution breakdowns from system prompt through tool usage to final output. Automatic error tagging and grouping reduces noise. ([docs.sentry.io/ai/monitoring/agents/dashboard](https://docs.sentry.io/ai/monitoring/agents/dashboard/))

## Sources

- [Retool Dashboards & Reporting](https://retool.com/use-case/dashboards-and-reporting) — Dashboard use case page
- [Monitor Retool Agents](https://docs.retool.com/agents/guides/monitor) — Agent monitoring with graph view, token/cost tracking
- [Retool Application Performance Dashboard](https://retool.com/templates/application-performance-dashboard) — Top-rail KPI + detail table pattern
- [Airplane Multi-Step Workflows](https://www.airplane.dev/blog/introducing-powerful-multi-step-workflows-in-airplane) — Tasks/Views/Runbooks abstraction
- [Grafana Agent Framework Dashboard](https://grafana.com/grafana/dashboards/24156-agent-framework/) — AI agent monitoring template
- [PagerDuty Operations Console](https://support.pagerduty.com/main/docs/operations-console) — Customizable incident table with side panel
- [MeisnerDan/mission-control](https://github.com/MeisnerDan/mission-control) — Solo entrepreneur AI agent command center
- [builderz-labs/mission-control](https://github.com/builderz-labs/mission-control) — 28-panel agent orchestration dashboard with quality gates
- [nachoal/ai-fleet](https://github.com/nachoal/ai-fleet) — CLI fleet manager: 1 agent = 1 worktree + 1 tmux session
- [Continue.dev Mission Control](https://blog.continue.dev/introducing-mission-control-your-ai-dashboard) — Developer AI control plane
- [6 AI Agents on a Single VPS](https://blog.oguzhanatalay.com/architecting-multi-agent-ai-fleet-single-vps) — Solo dev running agent fleet
- [Dashboard Design Patterns (Academic)](https://dashboarddesignpatterns.github.io/) — Edinburgh/King's College taxonomy of 144 dashboards
- [Management by Exception](https://www.brightgauge.com/blog/how-managing-by-exception-helps-simplify-dashboard) — Exception-based dashboard design
- [PatternFly Aggregate Status Card](https://pf3.patternfly.org/v3/pattern-library/cards/aggregate-status-card/) — Glanceable status component
- [Evil Martians Dev Tool UI Patterns](https://evilmartians.com/chronicles/keep-it-together-5-essential-design-patterns-for-dev-tool-uis) — Tabs, panels, tables
- [Sentry AI Agents Dashboard](https://docs.sentry.io/ai/monitoring/agents/dashboard/) — Agent monitoring with execution traces

## Raw Links

- https://retool.com/use-case/dashboards-and-reporting
- https://retool.com/resources/build-your-first-dashboard-in-retool
- https://retool.com/blog/popular-templates-internal-tools
- https://retool.com/templates/application-performance-dashboard
- https://docs.retool.com/agents/guides/monitor
- https://retoolers.io/blog-posts/retool-2025-feature-releases-ai-multipage-apps-agents-more
- https://www.airplane.dev/
- https://www.airplane.dev/blog/airtable
- https://fantasyma.substack.com/p/what-the-airtable-acquisition-of
- https://www.airplane.dev/blog/introducing-powerful-multi-step-workflows-in-airplane
- https://blog.boldtech.dev/airplane-dev-alternatives/
- https://grafana.com/docs/grafana/latest/administration/organization-preferences/
- https://grafana.com/docs/grafana/latest/dashboards/
- https://grafana.com/grafana/dashboards/24156-agent-framework/
- https://community.grafana.com/t/setting-default-home-dashboard-for-my-server/50543
- https://support.pagerduty.com/main/docs/operations-console
- https://support.pagerduty.com/main/docs/visibility-console
- https://support.pagerduty.com/main/changelog/incident-types-custom-fields-filter-and-column-picker-in-operations-console
- https://www.pagerduty.com/blog/operations-command-console/
- https://www.pagerduty.com/blog/aiops/ops-center-modernization-latest-features-2024/
- https://github.com/MeisnerDan/mission-control
- https://news.ycombinator.com/item?id=47165602
- https://github.com/builderz-labs/mission-control
- https://github.com/nachoal/ai-fleet
- https://blog.continue.dev/introducing-mission-control-your-ai-dashboard
- https://docs.continue.dev/mission-control
- https://blog.oguzhanatalay.com/architecting-multi-agent-ai-fleet-single-vps
- https://dev.to/setas/i-run-a-solo-company-with-ai-agent-departments-50nf
- https://dev.to/_a01b1cf457db386dd25f1/how-a-solo-founder-runs-a-business-with-20-ai-agents-53ac
- https://dashboarddesignpatterns.github.io/
- https://www.research.ed.ac.uk/en/publications/dashboard-design-patterns/
- https://www.pencilandpaper.io/articles/ux-pattern-analysis-data-dashboards
- https://www.pencilandpaper.io/articles/ux-pattern-analysis-enterprise-data-tables
- https://www.uxpin.com/studio/blog/dashboard-design-principles/
- https://excited.agency/blog/dashboard-ux-design
- https://www.patternfly.org/patterns/dashboard/design-guidelines/
- https://pf3.patternfly.org/v3/pattern-library/cards/aggregate-status-card/
- https://evilmartians.com/chronicles/keep-it-together-5-essential-design-patterns-for-dev-tool-uis
- https://evilmartians.com/chronicles/devs-in-mind-how-to-design-interfaces-for-developer-tools
- https://evilmartians.com/chronicles/six-things-developer-tools-must-have-to-earn-trust-and-adoption
- https://www.nngroup.com/articles/progressive-disclosure/
- https://www.brightgauge.com/blog/how-managing-by-exception-helps-simplify-dashboard
- https://www.prosense.com.au/post/creating-effective-dashboards-using-exception-based-design-and-trend-analysis
- https://docs.sentry.io/ai/monitoring/agents/dashboard/
- https://blog.sentry.io/sentrys-updated-agent-monitoring/
- https://bix-tech.com/monitoring-agents-and-flows-with-grafana-and-sentry-a-practical-playbook-for-real-world-observability-in-2026/
- https://www.dronahq.com/internal-tools-ux/
- https://www.toptal.com/designers/data-visualization/dashboard-design-best-practices
- https://ui-patterns.com/patterns/dashboard
- https://github.blog/ai-and-ml/github-copilot/how-to-orchestrate-agents-using-mission-control/
- https://github.com/generalaction/emdash
- https://github.com/ComposioHQ/agent-orchestrator
- https://www.cio.com/article/4138739/21-agent-orchestration-tools-for-managing-your-ai-fleet.html
- https://uptimerobot.com/knowledge-hub/monitoring/ai-agent-monitoring-best-practices-tools-and-metrics/
- https://www.microsoft.com/en-us/microsoft-365/blog/2025/11/18/microsoft-agent-365-the-control-plane-for-ai-agents/
- https://github.com/rails/mission_control-jobs

## Implications

1. **The information hierarchy for a solo operator is: Exceptions > Summary > Detail.** Management by exception is the critical pattern — the dashboard's primary job is to surface what broke or drifted, not comprehensively report everything that ran fine.

2. **Three-zone layout emerges consistently.** Zone 1 (top): aggregate status cards — "3 ran, 2 succeeded, 1 needs review". Zone 2 (middle): filterable list/table of items needing action. Zone 3: side panel or drill-down for selected item context.

3. **nachoal/ai-fleet validates the worktree-per-agent model.** WavePoint's existing worktree convention (1 concern = 1 worktree = 1 branch) is exactly the isolation model that ai-fleet independently arrived at.

4. **Quality gates matter for autonomous systems.** builderz-labs/mission-control's "quality gates that block task completion without sign-off" is the pattern for trust-but-verify.

5. **The PagerDuty side-panel pattern eliminates tab-switching.** Click a row, see detail without leaving the list — superior to page navigation for solo operators.

6. **Status vocabulary should be minimal and action-oriented.** SUCCESS, FAILURE, CANCELED, TIMED_OUT + NEEDS_REVIEW covers the space.

## Open Questions

1. How much should Studio proactively notify vs. wait for morning review? Push notifications for failures vs. batched summaries to avoid alert fatigue.
2. Should the dashboard be read-only or action-capable? Inline "re-run," "approve," "reject" buttons vs. purely informational.
3. What is the right granularity for "what ran"? A session? A skill invocation? A git commit?
4. How to handle the "nothing happened" state? Green "all clear" summary vs. empty inbox.
5. Is there a role for sparklines/trends? 7-day agent success rate trends — useful or noise?
