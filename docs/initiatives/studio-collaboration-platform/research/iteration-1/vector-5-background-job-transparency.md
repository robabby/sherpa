# Vector 5: Background Job Transparency

**Question:** How do CI/CD dashboards and workflow automation tools surface background job progress and results? What's the right level of detail for a solo operator?
**Agent dispatched:** 2026-03-09

## Findings

### GitHub Actions UI

- **Hierarchy: Workflow List → Run → Job → Step → Log Line.** Status can be queued/in_progress/completed, with conclusion (success/failure/cancelled/timed_out/action_required). ([Docs](https://docs.github.com/en/actions/monitoring-and-troubleshooting-workflows/viewing-workflow-run-history))
- **Job Summary** is the key innovation — each job writes custom Markdown to `$GITHUB_STEP_SUMMARY`. The summary page answers "what happened?" without log diving. ([GitHub Blog](https://github.blog/news-insights/product-news/supercharging-github-actions-with-job-summaries/))
- **Visualization graph** shows all jobs with dependency lines and status icons.
- **Job logs** are collapsible by step, with real-time color output, one-click line-number linking.
- **Key insight**: The **summary page** is the single most important pattern. The job writes its own summary — the platform just renders Markdown.

### Vercel Deployment Logs

- **Build logs** generated automatically, stored indefinitely (truncated at 4MB). ([Docs](https://vercel.com/docs/deployments/logs))
- **Runtime logs** are separate — serverless function invocations with search and filtering. ([Docs](https://vercel.com/docs/observability/runtime-logs))
- **Functions tab** provides real-time request stream. Click a log entry for details in a right sidebar panel. ([Blog](https://vercel.com/blog/refined-logging))
- **Progressive disclosure**: deployment list → deployment detail (summary + build log) → function logs → individual invocation detail.
- **Key insight**: Separates **build-time logs** (finite, stored forever) from **runtime logs** (streaming, ephemeral). Analog for WavePoint: worker execution log (finite, stored) vs. live tail while running.

### Temporal.io UI

Three views at increasing detail:

- **Compact View**: Groups related events into single rows. A thick line = Event Group (e.g., ActivityTaskScheduled + Started + Completed = one "Activity" row). Best for quick status scanning. ([Docs](https://docs.temporal.io/web-ui))
- **Timeline View**: Horizontal time-based visualization. First row = entire workflow duration. Subsequent rows = activities as time spans. Hover for start/end/duration. Pending events use dashed animated lines. ([Blog](https://temporal.io/blog/lets-visualize-a-workflow))
- **Full History View**: Git-tree style showing every event including Workflow Tasks. ([Blog](https://temporal.io/blog/the-dark-magic-of-workflow-exploration))
- **Visual language**: Dots = events, Lines = connections, Colors = outcome, Dashed animated lines = pending.
- **Key insight**: The **Event Group** concept — collapse 3-5 low-level events into one meaningful row.

### Inngest Dashboard

- **Waterfall trace view** inspired by OpenTelemetry — maps sequence and timing including parallel steps. ([Blog](https://www.inngest.com/blog/enhanced-observability-traces-and-metrics))
- **Function run details** include timeline with step execution, expandable errors, timings, retry information. Zero-config tracing. ([Docs](https://www.inngest.com/docs/platform/monitor/inspecting-function-runs))
- **Metrics dashboard**: Total step throughput, backlog, event volume. ([Docs](https://www.inngest.com/docs/platform/monitor/observability-metrics))
- **2025 redesign**: Specifically optimized for agentic AI workflows with many steps and large outputs.
- **Key insight**: Zero-config tracing is the right model for a solo operator — automatic, not instrumented.

### n8n Workflow Execution

- **Execution list**: Right-side panel showing all runs with timestamps, status, duration. Filterable by status and start time. ([Docs](https://docs.n8n.io/workflows/executions/all-executions/))
- **Execution detail**: Loads a replay without re-running. Click any node for input/output. Data viewable in Table or JSON. ([Docs](https://docs.n8n.io/workflows/executions/debug/))
- **Data pinning**: "Freeze" a node's output to test downstream changes without re-running upstream.
- **Insights dashboard**: Per-workflow metrics — total executions, failed, failure rate, time saved, average run time. ([Docs](https://docs.n8n.io/insights/))
- **Key insight**: Ability to **replay past execution visually** is powerful. Store enough state to reconstruct what happened.

### Airflow / Dagster UI

**Airflow:** Grid View (tasks × runs matrix), Graph View (DAG structure with status), Gantt Chart (timeline for bottleneck ID). ([Docs](https://airflow.apache.org/docs/apache-airflow/stable/ui.html))

**Dagster:** Asset Graph (data-first lineage), Run Detail (Gantt + filterable events), Asset health/freshness monitoring. ([Docs](https://docs.dagster.io/concepts/webserver/ui))

- **Key insight**: Airflow's Grid View (tasks × runs) works for recurring workers. Dagster's asset-first thinking is relevant — workers produce artifacts (proposals, reports, content), not just "run" status.

### Log Streaming vs. Log Viewing

- **Real-time streaming** useful for: debugging active issues, monitoring long-running jobs. Implementation: SSE or WebSockets. ([Windmill](https://www.windmill.dev/docs/core_concepts/jobs))
- **Post-execution summaries** useful for: async review ("asleep while jobs run"), aggregated reporting. GitHub Actions' `$GITHUB_STEP_SUMMARY` is canonical.
- **Async job monitoring best practices**: Track execution status, latency (queue → pickup → completion), throughput, retries. Capture start/end times, outcome, arguments (sanitized). ([Last9](https://last9.io/blog/what-is-asynchronous-job-monitoring/))
- **Key insight for solo operators**: **Both, but summaries are primary.** Stream when watching; always produce a structured summary as default view.

## Sources

- [GitHub Actions Job Summaries](https://github.blog/news-insights/product-news/supercharging-github-actions-with-job-summaries/) — Self-documenting worker output
- [Vercel Build Logs](https://vercel.com/docs/deployments/logs) — Build vs runtime log separation
- [Temporal Web UI](https://docs.temporal.io/web-ui) — Compact/Timeline/Full History views
- [Temporal Timeline Blog](https://temporal.io/blog/lets-visualize-a-workflow) — Event group concept
- [Inngest Observability](https://www.inngest.com/blog/enhanced-observability-traces-and-metrics) — Waterfall traces
- [n8n Execution Debug](https://docs.n8n.io/workflows/executions/debug/) — Visual replay, data pinning
- [Airflow UI](https://airflow.apache.org/docs/apache-airflow/stable/ui.html) — Grid/Graph/Gantt views
- [Dagster UI](https://docs.dagster.io/concepts/webserver/ui) — Asset-first approach
- [Last9 Async Monitoring](https://last9.io/blog/what-is-asynchronous-job-monitoring/) — Best practices

## Raw Links

- https://docs.github.com/en/actions/monitoring-and-troubleshooting-workflows/viewing-workflow-run-history
- https://docs.github.com/en/rest/actions/workflow-runs
- https://github.blog/news-insights/product-news/supercharging-github-actions-with-job-summaries/
- https://github.blog/changelog/2025-12-22-improved-performance-for-github-actions-workflows-page/
- https://vercel.com/docs/deployments/logs
- https://vercel.com/blog/refined-logging
- https://vercel.com/docs/observability/runtime-logs
- https://vercel.com/changelog/inspect-your-deployment-source-and-build-output-files
- https://docs.temporal.io/web-ui
- https://temporal.io/blog/lets-visualize-a-workflow
- https://temporal.io/blog/the-dark-magic-of-workflow-exploration
- https://community.temporal.io/t/ui-update-workflows-visualizations/9795
- https://temporal.io/change-log/updated-event-history-timeline-view-is-now-available
- https://www.inngest.com/blog/enhanced-observability-traces-and-metrics
- https://www.inngest.com/docs/platform/monitor/observability-metrics
- https://www.inngest.com/docs/platform/monitor/inspecting-function-runs
- https://www.inngest.com/docs/platform/monitor/traces
- https://docs.n8n.io/workflows/executions/all-executions/
- https://docs.n8n.io/workflows/executions/debug/
- https://docs.n8n.io/workflows/executions/single-workflow-executions/
- https://docs.n8n.io/insights/
- https://www.goldenwebportal.com/workflow-execution-output-panel-n8n-guide
- https://airflow.apache.org/docs/apache-airflow/stable/ui.html
- https://www.astronomer.io/docs/learn/airflow-ui
- https://docs.dagster.io/concepts/webserver/ui
- https://dagster.io/blog/introducing-the-new-dagster-plus-ui
- https://docs.railway.com/observability/logs
- https://blog.railway.com/p/using-logs-metrics-traces-and-alerts-to-understand-system-failures
- https://www.infoq.com/news/2026/01/railway-diagnosing-failure/
- https://last9.io/blog/what-is-asynchronous-job-monitoring/
- https://www.windmill.dev/docs/core_concepts/jobs
- https://deepwiki.com/windmill-labs/windmill-engineering-tutorial/3.7-log-streaming-and-observability
- https://www.nngroup.com/articles/progressive-disclosure/

## Implications

1. **Summary-first, not log-first.** Each worker should produce a structured summary that answers "what happened?" (GitHub Actions pattern).
2. **Three-level progressive disclosure:** Level 1 (worker list: status, duration, one-line result) → Level 2 (structured output: proposals created, files changed) → Level 3 (full log, only for debugging).
3. **Event grouping over raw events.** Temporal's pattern: collapse spawn→execute→produce→exit into one row with expandable detail.
4. **Artifact-first, not execution-first.** Dagster's model: foreground what was produced, not what steps ran. Link artifacts from summary.
5. **Status taxonomy**: dispatched → running → completed (success/failure/partial/timed_out).
6. **No real-time streaming in v1.** Post-execution summaries are 10x more valuable for async review.
7. **Store structured input/output per worker** to enable "what happened while I was asleep?" replay.

## Open Questions

1. Structured summary format — Markdown or JSON? JSON is queryable, Markdown is scannable. Could use JSON with rendered Markdown view.
2. Retention policy — how long to keep worker logs and summaries?
3. Notification channel — when a worker fails at 3am, how does the operator find out?
4. Correlation across workers — how to show Worker A → Worker B dependency?
5. Output size variance — content worker (50KB) vs research worker (500KB)?
