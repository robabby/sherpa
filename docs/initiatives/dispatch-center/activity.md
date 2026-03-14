---
started: 2026-03-13
worktree: null
---

# Dispatch Center — Activity Log

- 2026-03-13: Initiative created. Brainstormed full architecture with Rob — 5 backends, task-type routing, 3 dispatch modes, budget allocation strategy, Dispatch Center UI. Wrote proposal and 5-session implementation plan.
- 2026-03-13: Research iteration 1 — confirmed CLI flags for OpenCode (`run`), Codex (`exec`), Gemini (`-p`). All 4 backends are scriptable. Free model benchmarks show MiniMax M2.5 best for instruction-following (research default), Nemotron for long-context, MiMo for reasoning. Updated routing recommendation.
- 2026-03-13: Shaped initiative — 5-session appetite, identified 5 rabbit holes, 7 no-gos, 5 kill criteria.
- 2026-03-13: Design complete — architecture (28 files planned), UI prototype (three-panel Dispatch Center). Key decisions: single component file, polling not WebSockets, shell-out for dispatch, click-to-assign not drag-and-drop.
- 2026-03-13: Implementation complete in 5 sessions. Session 1: 7 core scripts + Claude backend. Session 2: OpenCode, Codex, Gemini, LM Studio backends. Session 3: TypeScript types, config integration, task-type routing, role frontmatter. Session 4: Dispatch Center UI (870-line three-panel component), API route, hub panel. Session 5: auto-dispatch matching, docs updates, status → integrated. Total: 52 files changed, ~6,500 lines added.
- 2026-03-13: Post-implementation polish. Fixed Gemini `-p` flag syntax, model resolution for non-Claude backends. Added failed task visibility + reset button, auto-refresh fix (API route sets status before spawning worker), Claude-only constraint for governance files. First successful browser→Gemini dispatch: "Benchmark Gemini vs MiniMax on content generation tasks" completed in 41 minutes.

## Seeds

Items that surfaced during this initiative but were explicitly out of scope. Each is a candidate for its own proposal.

- **MCP HTTP Streamable transport** — Current MCP server is stdio-only. Studio web can't call MCP tools directly without an HTTP transport layer. Rabbit hole #4 in shape.md. → initiative: mcp-coordination-layer
- **Scheduled dispatch** — Time-based scheduling, overnight queuing, recurring tasks via cron. No-go in shape.md (no cron/scheduler). → initiative: scheduled-dispatch
- **Real-time worker streaming** — SSE endpoint tailing NDJSON log files so the Dispatch Center shows live worker output instead of polling every 5s. Rabbit hole #2 in shape.md.
- **Cost tracking dashboard** — Per-backend spend visibility. Currently budget awareness lives in config and in Rob's head. No-go in shape.md.
- **Parallel dispatch** — Tasks dispatch sequentially today. Parallel adds concurrency bugs. No-go in shape.md; revisit when overnight batch runs are routine.
- **OpenCode `serve` mode** — `opencode serve` + `--attach` avoids cold boot for batch dispatch. Rabbit hole #3 in shape.md; worth it when overnight queue proves slow.
