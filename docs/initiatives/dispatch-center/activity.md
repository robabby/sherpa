---
started: 2026-03-13
worktree: null
---

# Dispatch Center — Activity Log

- 2026-03-13: Initiative created. Brainstormed full architecture with Rob — 5 backends, task-type routing, 3 dispatch modes, budget allocation strategy, Dispatch Center UI. Wrote proposal and 5-session implementation plan.
- 2026-03-13: Research iteration 1 — confirmed CLI flags for OpenCode (`run`), Codex (`exec`), Gemini (`-p`). All 4 backends are scriptable. Free model benchmarks show MiniMax M2.5 best for instruction-following (research default), Nemotron for long-context, MiMo for reasoning. Updated routing recommendation.
- 2026-03-13: Shaped initiative — 5-session appetite, identified 5 rabbit holes, 7 no-gos, 5 kill criteria.
- 2026-03-13: Design complete — architecture (28 files planned), UI prototype (three-panel Dispatch Center). Key decisions: single component file, polling not WebSockets, shell-out for dispatch, click-to-assign not drag-and-drop.
