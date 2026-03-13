# Iteration 1 — 2026-03-09

## Research Vectors

### Vector 1: Solo Operator Mission Control Dashboards
**Question:** What information hierarchy works for a single human reviewing automated output?
**Full report:** [iteration-1/vector-1-solo-operator-dashboards.md](iteration-1/vector-1-solo-operator-dashboards.md)

**Key discoveries:**
- **Management by exception** is the critical UX pattern — show what broke or drifted, not everything that ran fine. Push model, not pull. ([BrightGauge](https://www.brightgauge.com/blog/how-managing-by-exception-helps-simplify-dashboard))
- **Three-zone layout** emerges consistently: aggregate status cards (top) → filterable action list (middle) → side-panel detail (bottom/right). PagerDuty, Retool, PatternFly all converge on this. ([PatternFly](https://www.patternfly.org/patterns/dashboard/design-guidelines/))
- **nachoal/ai-fleet** independently arrived at WavePoint's worktree model: 1 agent = 1 git worktree + 1 branch + 1 tmux session. ([GitHub](https://github.com/nachoal/ai-fleet))
- **builderz-labs/mission-control** implements quality gates that block task completion without sign-off — the trust-but-verify pattern. ([GitHub](https://github.com/builderz-labs/mission-control))
- **5-second rule**: no more than 5-6 cards in initial view; information findable within 5 seconds. ([excited.agency](https://excited.agency/blog/dashboard-ux-design))

**Implications:**
- Studio's hub should reorganize around exception-first design when task pipeline is active
- The PagerDuty side-panel (click row → see detail without leaving list) is superior to page navigation

### Vector 2: AI-Native Project Management
**Question:** How do modern PM tools handle AI workers? What replaces kanban for human+AI workflows?
**Full report:** [iteration-1/vector-2-ai-native-project-management.md](iteration-1/vector-2-ai-native-project-management.md)

**Key discoveries:**
- **The board metaphor is dying for AI work.** Devin uses sessions with binary status (working / waiting-for-you), not columns. Factory.ai auto-triggers from issue assignment. ([Devin docs](https://docs.devin.ai/release-notes/overview))
- **Height.app shut down Sep 2025** — the most AI-native PM tool failed commercially. AI-native is now table stakes in Linear, Plane, Shortcut. Being "AI-native" alone is not a moat. ([Post-mortem](https://skywork.ai/skypage/en/Height-App-The-Rise-and-Sunset-of-an-AI-Project-Management-Pioneer/1975012339164966912))
- **Workflow orchestration UIs (Temporal, Inngest, Trigger.dev) are the closest analog**, not PM tools. Task pipelines are workflows, not projects. ([Temporal](https://temporal.io/blog/lets-visualize-a-workflow))
- **Magentic-UI's co-planning** lets humans edit agent plans before execution — the critical human-in-the-loop differentiator. ([Paper](https://arxiv.org/abs/2507.22358))
- **Claude Code Agent Teams** uses filesystem-based task lists with dependency tracking — validates WavePoint's `docs/tasks/` convention. ([Docs](https://code.claude.com/docs/en/agent-teams))

**Implications:**
- Don't build a kanban board. Build a pipeline status view (Temporal-style) with a morning summary
- The `docs/tasks/` filesystem convention is architecturally sound

### Vector 3: Human-in-the-Loop Review UX
**Question:** What patterns work for "review N items efficiently"?
**Full report:** [iteration-1/vector-3-human-in-loop-review-ux.md](iteration-1/vector-3-human-in-loop-review-ux.md)

**Key discoveries:**
- **Linear's Triage view is best-in-class:** `1` accept, `2` duplicate, `3` decline, `H` snooze. Items auto-advance. Keyboard-only. ([Linear](https://linear.app/docs/triage))
- **Superhuman's Split Inbox** groups items by category, then batch-processes each category — eliminates context switching. Keyboard shortcuts save ~134 hours/year. ([Superhuman](https://blog.superhuman.com/email-triage/))
- **Reviewable.io's revision mapping** tracks "what changed since I last looked" — critical for iterative agent output. ([Reviewable](https://docs.reviewable.io/files.html))
- **Green/Amber/Red lane model** is the standard for confidence-based routing: high-confidence auto-approves with sampling, amber routes to review, red blocks. ([All Days Tech](https://alldaystech.com/guides/artificial-intelligence/human-in-the-loop-ai-review-queue-workflows))
- **GitHub's batched submission** prevents notification spam — comments accumulate, entire review submitted in one action. ([GitHub](https://docs.github.com/articles/reviewing-proposed-changes-in-a-pull-request))

**Implications:**
- Morning review should be keyboard-driven with auto-advance (Linear Triage model)
- Confidence-based routing splits the queue into quick-approve and deep-review tracks
- Batch submission prevents triggering downstream actions per individual decision

### Vector 4: AI Cost & Token Visibility
**Question:** Is per-task cost tracking useful or anxiety-inducing?
**Full report:** [iteration-1/vector-4-ai-cost-token-visibility.md](iteration-1/vector-4-ai-cost-token-visibility.md)

**Key discoveries:**
- **"Token anxiety" is real** — real-time cost displays create a flinch response that disrupts developer flow. 34% of businesses slowing AI integration due to cost unpredictability. ([Medium](https://medium.com/illumination/token-anxiety-how-real-time-ai-pricing-is-killing-developer-flow-883dc6612ff7))
- **Retrospective visibility is universally desired**, real-time per-request meters are mixed. Developers want to know "what did I spend?" not "how much is this request costing?" ([Monetizely](https://www.getmonetizely.com/articles/token-fatigue-why-ai-users-are-tired-of-thinking-in-tokens))
- **Cursor's pricing revolt** (June 2025): switching from predictable to per-token caused massive backlash. CEO published public apology. ([HackerNoon](https://hackernoon.com/cursors-new-pricing-blew-my-budget-so-i-built-a-usage-tracker))
- **Anomaly detection over hard caps** — AWS's ML-based thresholds beat static limits. OpenAI's removal of hard caps was negatively received. ([AWS](https://aws.amazon.com/aws-cost-management/aws-cost-anomaly-detection/))
- **Per-project/initiative attribution** is the highest-value view. ccusage groups by project; Anthropic API supports per-workspace filtering. ([ccusage](https://ccusage.com/))

**Implications:**
- Show retrospective cost summaries per initiative, not real-time meters
- Frame as "weather report" (informational) not "bill" (judgmental) — consistent with WavePoint voice
- Optional budget caps as safety nets, not mandatory constraints

### Vector 5: Background Job Transparency
**Question:** How do tools surface background job progress for async review?
**Full report:** [iteration-1/vector-5-background-job-transparency.md](iteration-1/vector-5-background-job-transparency.md)

**Key discoveries:**
- **GitHub Actions' Job Summary** is the canonical pattern — workers write their own Markdown summary, platform renders it. Answers "what happened?" without log diving. ([GitHub Blog](https://github.blog/news-insights/product-news/supercharging-github-actions-with-job-summaries/))
- **Temporal's Event Group** concept: collapse 3-5 low-level events into one meaningful row. Compact → Timeline → Full History views at increasing detail. ([Temporal Blog](https://temporal.io/blog/lets-visualize-a-workflow))
- **Dagster's asset-first approach** — foreground what was produced (proposals, research, content), not what steps ran. ([Dagster](https://docs.dagster.io/concepts/webserver/ui))
- **n8n's execution replay** — load a past execution and click any node for its input/output, without re-running. ([n8n Docs](https://docs.n8n.io/workflows/executions/debug/))
- **Post-execution summaries are 10x more valuable than live streaming** for the "asleep while jobs run" case. ([Last9](https://last9.io/blog/what-is-asynchronous-job-monitoring/))

**Implications:**
- Workers should produce structured summaries as primary output, with full logs as drill-down
- Three-level progressive disclosure: status list → structured summary → raw log
- Artifact-first, not execution-first: show what was produced (proposals, PRs, content)

## Synthesis

Five cross-cutting patterns emerged that no single vector produced alone:

### 1. The Morning Review Is the Killer Feature

Every vector independently surfaced the "come back and review" workflow: mission control dashboards (V1) serve it, PM tools are converging toward it (V2: Linear Pulse, DailyStack), review UX patterns optimize it (V3: Linear Triage), cost visibility enables it (V4: retrospective summaries), and background job tools produce for it (V5: job summaries). **The morning review is not a feature of Studio — it IS Studio's primary interaction model.** Everything else is navigation to enable this ritual.

### 2. Pipeline View, Not Board View

The research unanimously rejects kanban for AI worker management. The right metaphor is a **pipeline with status** (Temporal/Inngest timeline), not a **board with columns** (Jira/Linear). Status is binary-ish (working / waiting-for-you / done / failed), not columnar. The PagerDuty side-panel pattern (click row → detail without leaving list) is the UX primitive, not drag-and-drop cards.

### 3. Exception-First Information Design

Management by exception (V1) + confidence-based routing (V3) + anomaly detection over hard caps (V4) all point to the same principle: **the default state is "nothing needs your attention."** When something does need attention, it pushes itself into view. This is the opposite of Studio's current hub, which shows everything equally. The morning review should surface exceptions first, then summary, then detail.

### 4. Artifacts Over Execution

Dagster's asset-first model (V5), Devin's session output (V2), and GitHub's job summaries (V5) converge: **foreground what was produced, not what ran.** A successful worker run should show "Proposal created: cosmic-readiness-score" not "Worker executed 47 tool calls in 3m 12s." Execution metrics (tokens, duration, cost) are secondary context, not primary content.

### 5. The Governance/Execution Split Is Real

The proposal asked whether initiatives (strategic, slow-moving) and tasks (operational, daily) should share a page. The research says no — they serve different cognitive modes. Initiatives are the "what" and "why" (V1: mission control sees the big picture). Tasks are the "how" and "when" (V2: workflow orchestration). Studio's current Process page handles governance; the new task pipeline handles execution. They link but don't merge.

## All Sources

### Dashboard & UX Patterns
- [PatternFly Dashboard Guidelines](https://www.patternfly.org/patterns/dashboard/design-guidelines/)
- [PatternFly Aggregate Status Card](https://pf3.patternfly.org/v3/pattern-library/cards/aggregate-status-card/)
- [Evil Martians Dev Tool UI Patterns](https://evilmartians.com/chronicles/keep-it-together-5-essential-design-patterns-for-dev-tool-uis)
- [NN/g Progressive Disclosure](https://www.nngroup.com/articles/progressive-disclosure/)
- [Dashboard Design Patterns (Academic)](https://dashboarddesignpatterns.github.io/)
- [Management by Exception](https://www.brightgauge.com/blog/how-managing-by-exception-helps-simplify-dashboard)
- [Smashing Mag Agentic UX Patterns](https://www.smashingmagazine.com/2026/02/designing-agentic-ai-practical-ux-patterns/)
- [UX Mag Agentic UX](https://uxmag.com/articles/secrets-of-agentic-ux-emerging-design-patterns-for-human-interaction-with-ai-agents)

### Mission Control & Agent Dashboards
- [MeisnerDan/mission-control](https://github.com/MeisnerDan/mission-control)
- [builderz-labs/mission-control](https://github.com/builderz-labs/mission-control)
- [nachoal/ai-fleet](https://github.com/nachoal/ai-fleet)
- [Continue.dev Mission Control](https://blog.continue.dev/introducing-mission-control-your-ai-dashboard)
- [Sentry AI Agents Dashboard](https://docs.sentry.io/ai/monitoring/agents/dashboard/)
- [Retool Agent Monitor](https://docs.retool.com/agents/guides/monitor)
- [PagerDuty Operations Console](https://support.pagerduty.com/main/docs/operations-console)
- [Grafana Agent Framework Dashboard](https://grafana.com/grafana/dashboards/24156-agent-framework/)

### AI-Native PM Tools
- [Linear AI](https://linear.app/ai) — Triage Intelligence, Pulse, MCP
- [Plane MCP Server](https://developers.plane.so/dev-tools/mcp-server) — Open-source, agent-first
- [Devin Docs](https://docs.devin.ai/release-notes/overview) — Session-based, favicon status
- [Factory.ai PM](https://factory.ai/product/ai-project-manager) — Auto-trigger from tickets
- [Magentic-UI](https://arxiv.org/abs/2507.22358) — Co-planning, action guards
- [Claude Code Agent Teams](https://code.claude.com/docs/en/agent-teams) — Filesystem task lists

### Review UX
- [Linear Triage](https://linear.app/docs/triage) — Single-key keyboard-driven triage
- [Superhuman Email Triage](https://blog.superhuman.com/email-triage/) — Split Inbox, 134 hrs/yr saved
- [Reviewable Revision Mapping](https://docs.reviewable.io/files.html) — "What changed since I last looked"
- [HITL Green/Amber/Red](https://alldaystech.com/guides/artificial-intelligence/human-in-the-loop-ai-review-queue-workflows) — Confidence routing
- [Cloudflare Agents HITL](https://developers.cloudflare.com/agents/concepts/human-in-the-loop/) — waitForApproval()
- [GitClear Semantic Diffs](https://www.gitclear.com/help/pull_request_review_demo_github_alternative) — 30% less to review

### Cost & Token Visibility
- [Token Anxiety](https://medium.com/illumination/token-anxiety-how-real-time-ai-pricing-is-killing-developer-flow-883dc6612ff7)
- [Token Fatigue](https://www.getmonetizely.com/articles/token-fatigue-why-ai-users-are-tired-of-thinking-in-tokens)
- [ccusage](https://ccusage.com/) — Per-project Claude Code cost tracking
- [Bessemer AI Pricing Playbook](https://www.bvp.com/atlas/the-ai-pricing-and-monetization-playbook)
- [AWS Cost Anomaly Detection](https://aws.amazon.com/aws-cost-management/aws-cost-anomaly-detection/)

### Workflow & Job Monitoring
- [GitHub Actions Job Summaries](https://github.blog/news-insights/product-news/supercharging-github-actions-with-job-summaries/)
- [Temporal Timeline View](https://temporal.io/blog/lets-visualize-a-workflow)
- [Temporal Event Groups](https://temporal.io/blog/the-dark-magic-of-workflow-exploration)
- [Inngest Observability](https://www.inngest.com/blog/enhanced-observability-traces-and-metrics)
- [Trigger.dev HITL Waitpoints](https://trigger.dev/docs/guides/example-projects/human-in-the-loop-workflow)
- [n8n Execution Replay](https://docs.n8n.io/workflows/executions/debug/)
- [Dagster Asset Graph](https://docs.dagster.io/concepts/webserver/ui)
- [Airflow UI Views](https://airflow.apache.org/docs/apache-airflow/stable/ui.html)

## Proposals Generated

- Updated `proposal.md` with concrete design direction grounded in research findings.

## Open Questions for Next Iteration

1. **What should the morning review route look like?** We now know the UX patterns (Linear Triage + Superhuman Split + confidence routing). Next: wireframe a concrete page design using Studio's existing component vocabulary and data sources. What components render? What data feeds them?

2. **How should the task pipeline integrate with the initiative system?** Tasks are dispatched from initiatives. The Process page shows initiatives. The task pipeline shows execution. How do they cross-link? Can you navigate from a task result back to its initiative, and vice versa?

3. **What structured summary format should workers produce?** GitHub uses Markdown, WavePoint uses JSON for research reports. Should task summaries be a new schema (`wavepoint/task-result@1`)? What fields?

4. **How should cost data be aggregated and displayed?** Session manifests have token counts. What's the mapping to USD? Per-initiative rollup requires tagging sessions with initiative slugs. Is this already in session manifest frontmatter?

5. **What's the minimum viable morning review?** Studio already has sessions, workstreams, and initiative data. What's the smallest change that enables a useful morning review — before the full Planner/Worker/Judge pipeline ships?
