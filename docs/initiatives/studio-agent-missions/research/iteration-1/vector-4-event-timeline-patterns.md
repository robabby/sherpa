# Vector 4: Event Timeline Patterns

**Question:** How do observability tools render event timelines, and how could NDJSON logs become a visual component?
**Agent dispatched:** 2026-03-14

## Findings

### Platform Patterns

**Sentry:** Breadcrumbs as vertical list with type-specific icons/colors. Slide-out drawer for "View All" with search/filter. Trace waterfall with color-coded spans by type.

**Datadog APM:** Flamegraph default — horizontal bars, x=duration, y=depth. Color per service. Minimap for navigation. Click span for metrics/logs.

**GitHub Actions:** Workflow visualization graph with status icons. Expandable step groups. Streaming logs with virtual scrolling. Mermaid Gantt diagrams available.

**Vercel:** Three log levels color-coded (info/warning/error). ANSI color support. Time-range filtering.

**Linear:** Collapsed history — similar consecutive events grouped. Older activity between threads collapsed. Chronological with relative timestamps.

**Railway:** Context-sensitive logs tied to deployment state. Observability tab with graphs + logs.

### Timeline Component Libraries (React)

**Best fit: shadcn-timeline** — built on shadcn/ui + Tailwind + Framer Motion. Supports per-event status (completed/in-progress/pending), custom icons, loading states. SSR compatible. Matches our stack exactly.

### NDJSON → Visual Timeline Pipeline

1. Parse: line-by-line JSON.parse (existing `readAllEvents()` in mcp-dashboard.ts)
2. Normalize: map to `{ timestamp, eventType, label, detail, status }`
3. Enrich: derive visual properties from event type
4. Render: feed into vertical timeline component

### Event Type → Visual Mapping

| Event | Color | Treatment |
|-------|-------|-----------|
| `dispatch_requested` | Copper | Card with agent + backend |
| `worker_started` | Bronze | Card with model + mode |
| `status_changed` | Emerald/Rose/Copper | Compact dot + label |
| `backend_delegating` | Muted | Compact with script path |
| `task_updated` | Gold | Expandable |

### Time Gap Handling

For our use case (5-8 events, seconds to minutes between): simple relative timestamps ("2s later", "6m 13s later"). No need for complex compression. Subtle spacer for gaps >30s. Collapse rapid-fire same-second events (Linear pattern).

## Sources

- https://docs.sentry.io/product/issues/issue-details/breadcrumbs/
- https://www.datadoghq.com/knowledge-center/distributed-tracing/flame-graph/
- https://docs.github.com/actions/managing-workflow-runs/using-the-visualization-graph
- https://linear.app/changelog/2025-04-03-collapsed-issue-history
- https://github.com/timDeHof/shadcn-timeline
- https://arxiv.org/html/2507.17320v1

## Implications

Add "Events" tab to task detail. Use shadcn-timeline (copy into ui/timeline.tsx). Map our NDJSON events to timeline items with copper/gold/bronze palette. For active dispatches, consider SSE streaming. Existing `readAllEvents()` handles parsing — extend to filter by task slug.

## Open Questions

- Real-time streaming (SSE) vs polling for active dispatches?
- Formalize event schema as TypeScript type union?
- Global activity feed across all tasks (Linear-style)?
