# studio-agent-missions — Research

## Summary

Iteration 1 surveyed agent monitoring UIs (7 platforms), metadata visualization patterns (NNG research + observability tools), and event timeline rendering. The key insight: shift the primary object from "task" to "mission run" — every platform treats execution traces, not work items, as the core entity.

## Open Questions

1. **Data model extension** — What fields to add to TaskBoardEntry for tokens, cost, duration? CLI vs API data sources?
2. **Split-pane implementation** — Reuse ResizeHandle from /process or simpler approach?
3. **Real-time streaming** — SSE for live events or polling?
4. **shadcn-timeline adoption** — Copy component or build custom?

## Cross-References

- `docs/initiatives/ai-sdk-dispatch/` — API backends (integrated), BACKEND_META, CLI/API badges
- `docs/initiatives/dispatch-center/` — Dispatch system, worker.sh, NDJSON event logging
- `docs/initiatives/mcp-coordination-layer/` — MCP server, task tools
