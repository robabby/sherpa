# Vector 3: Agent Metadata Visualization

**Question:** How should token usage, duration, cost, model info be displayed for AI agent runs?
**Agent dispatched:** 2026-03-14

## Findings

### List Card — What to Show

| Slot | Content | Format |
|------|---------|--------|
| Leading | Status | Colored dot + word |
| Primary | Task title | Top-left prominent |
| Secondary | Model + Provider | Inline mono badges |
| Metric | Duration | "2m 34s" or live elapsed |
| Metric | Token total | "12.4K" humanized |
| Metric | Cost | "$0.03" per-task |
| Trailing | Judge verdict | Badge |
| Trailing | Dispatch mode | Small icon/text |

### Key Design Decisions

- **Tokens:** Humanized in list (`Intl.NumberFormat` compact), raw in detail (12,384 in / 3,201 out)
- **Cost:** Per-task in list (NNG: "price requested across 22 years of testing"), aggregate in dashboard
- **Duration:** Live elapsed counter for in-progress, final for completed. Format: <60s→"42s", 1-59m→"2m 34s", ≥1h→"1h 12m"
- **Model/provider:** Two inline mono badges: `[Groq]` `[llama-3.3-70b]`
- **Progressive disclosure:** Summary metrics in list, full breakdown in detail pane

### NNG Research Findings

- List entries: treat as small webpages, highest-priority top-left, varied font sizes for hierarchy
- Cards: good for summaries, bad for dense comparison — for homogeneous data, lists/tables better
- Progressive disclosure: show few important options initially, reveal on request
- Data tables: organize by importance, human-readable ID first, side panels over modals for detail

## Sources

- https://www.nngroup.com/articles/progressive-disclosure
- https://www.nngroup.com/articles/list-entries
- https://www.nngroup.com/articles/cards-component
- https://www.nngroup.com/articles/data-tables
- https://langfuse.com/docs/tracing/overview
- https://www.datadoghq.com/blog/datadog-llm-observability/
- https://spectrum.adobe.com/page/status-light

## Implications

The list card design is clear: status dot + title + model badges + duration + tokens + cost + verdict. Detail pane expands with full token breakdown, timing, initiative link, report/verdict tabs. Use existing mono badge pattern. Add `tokensInput`, `tokensOutput`, `costUsd`, `durationSeconds` to TaskBoardEntry.

## Open Questions

- Multi-step runs: show aggregate or primary step tokens?
- Cost estimation for CLI backends (no structured token data)?
- Budget vs actual visualization (progress bar pattern)?
