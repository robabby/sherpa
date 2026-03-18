---
started: 2026-03-17
worktree: null
---

# MCP Multi-Backend Dispatch — Activity

## 2026-03-17

- Implemented in 1 session (planned for 2)
- Tasks 1-2: Wired `resolveRoute()` into `task_create`, added `backend` and `task_type` params (commit `a4b57b2`)
- Task 3: Updated `task_dispatch` to delegate to `worker.sh` instead of lm-studio-only spawn (commit `65215e2`)
- Task 4: Backward compat cleanup, removed dead `workerScript` option (commit `bb9ae91`)
- Tasks 5-6: Integration tests — 5 route resolution tests, 3 backend infrastructure tests (commit `a09da0c`)
- Final cleanup: removed unused import, deduplicated test (commit `84790dc`)
- End-to-end verification: created and dispatched tasks to claude, groq, gemini, codex — all 4 backends worked
- Budget fix: `--max-budget-usd 0.00` crashed Claude CLI, added `> 0` guard (commit `3fa2ec4`)

## Seeds

- **Per-backend health checks** — Currently only lm-studio gets a pre-dispatch health check. Other backends fail naturally via worker.sh. Adding pre-dispatch checks would improve error messages but adds latency. Scoped out as unnecessary complexity.
- **Budget validation for non-free backends** — `budget-usd` defaults to `0.00` for all MCP-created tasks. Claude and API backends have real costs. Consider requiring or defaulting a budget for non-free backends. Surfaced during e2e testing when budget=0 crashed Claude CLI.
- **Cached health state** — Health checks could be cached for N seconds to avoid repeated latency on rapid dispatches. Scoped out in plan.md.
- **task_type in UPDATABLE_FIELDS** — `task-type` isn't updatable after creation. Consider adding it if tasks should be re-routable. Noted in plan.md out-of-scope.
