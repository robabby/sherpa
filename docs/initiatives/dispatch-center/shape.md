---
appetite: 5 sessions
shaped: 2026-03-13
---

# Dispatch Center — Shape

## Appetite

**5 sessions.** This is structural work — new execution infrastructure, new config layer, new UI page — but most of the scripts are ports from WavePoint (proven code), the data model already exists in studio-core, and research confirmed all 4 CLI backends are scriptable. The risk isn't "can we build it" but "can we keep scope tight across a wide surface area."

Session budget:
- 2 sessions: scripts + all 5 backend modules
- 1 session: routing config + role frontmatter updates + MCP expansion
- 2 sessions: Dispatch Center UI + auto-dispatch

If the scripts port cleanly (they should — WavePoint's code is solid), sessions 1-2 may compress. If the UI needs more iteration, sessions 4-5 may expand. The budget allows one session of float.

## Shaped Solution

**Three deliverables:**

**1. Multi-backend dispatch scripts.** A unified `worker.sh` reads a task file, resolves its backend from config, and delegates to one of 5 backend modules (`backends/claude.sh`, `backends/opencode.sh`, `backends/codex.sh`, `backends/gemini.sh`, `backends/lm-studio.mjs`). An interactive `dispatch.sh` does the same for live terminal sessions. `auto-judge.sh` reviews completed work. `dispatch-queue.sh` runs batches with mode guard rails. All scripts use `SHERPA_*` env vars as the backend contract.

**2. Task-type routing via config.** `sherpa.config.ts` gains a `dispatch` section mapping task types to backends. Role frontmatter gains `task-type` and `eligible-task-types`. A `resolve-route.mjs` helper reads the config and returns the backend+model for a given task-type+mode combination. Scripts and MCP server both call through this resolver.

**3. Dispatch Center UI at `/dispatch`.** Three-panel page: Backlog (pending tasks grouped by type), Assignments (active dispatches with live status), Workforce (backend health + agent availability). Bottom bar with mode selector and dispatch controls. This is where tasks, agents, and backends meet — not a task board (that's `/tasks`), but the operational command center.

## Rabbit Holes

**1. Perfect backend uniformity.** The 5 backends have genuinely different capabilities (Claude has budget flags, Codex doesn't; OpenCode free models need no auth; LM Studio is HTTP not CLI). Don't build an abstraction that pretends they're identical. The backend contract is env vars in, exit code out. Per-backend quirks live in the backend module, not in a shared abstraction layer.

**2. Real-time UI updates.** It's tempting to build WebSocket/SSE for live dispatch status in the Dispatch Center. Don't. Poll on an interval (5-10s) using the existing task scanner. Real-time comes later if it matters.

**3. OpenCode `serve` mode optimization.** Research found `opencode serve` + `--attach` avoids cold boot. This is a performance optimization for batch dispatch. Skip it for v1 — each `opencode run` invocation works standalone. Add serve mode when overnight batch runs prove slow enough to warrant it.

**4. Codex CLI version choice.** Two CLIs exist (Rust and TypeScript). Don't evaluate both. Target the Rust CLI (`codex exec`) — it's the current default and actively maintained. The TypeScript CLI's `--provider` flexibility is nice but we don't need it; we have dedicated backend modules for each provider.

**5. Drag-and-drop assignment UI.** The proposal mentions "drag an agent onto a task." This is complex interaction design for questionable UX gain. Use click-to-assign with a dropdown instead. Agent → task assignment is a discrete action, not a spatial metaphor.

## No-Gos

- **No cron/scheduler.** Overnight dispatch is manually triggered, not automated.
- **No cost tracking.** No per-backend spend dashboard. Budget awareness lives in the config and in Rob's head, not in the UI.
- **No parallel dispatch.** Tasks dispatch sequentially. Parallel adds concurrency bugs we don't need yet.
- **No Gemini vs Nemotron benchmarking.** Not in this initiative. Run it as a separate research task once both backends are live.
- **No relaxation of overnight guard rails.** Code implementation stays blocked overnight. Period. Revisit in a future initiative after the system proves reliable.
- **No custom drag-and-drop.** Click-based assignment only.
- **No session persistence across dispatches.** Each `worker.sh` invocation is stateless. No attempt to resume prior sessions or share context between tasks.

## Kill Criteria

1. **If porting scripts takes more than 2 sessions,** stop and assess what's blocking. The WavePoint code is proven — if it's fighting Sherpa's structure, the structure needs to change, not the scripts.
2. **If any CLI backend can't produce capturable stdout output in headless mode,** demote it to interactive-only and don't build a headless worker for it. Don't hack around broken CLIs.
3. **If the three-panel UI layout doesn't feel right after 1 session of building,** simplify to a single-page table view with inline actions. The three-panel vision is aspirational — a working table beats a half-built dashboard.
4. **If free OpenCode models produce unusable output on 3+ test tasks,** remove them as overnight defaults and fall back to Gemini (which has a free tier via API key). Don't ship an overnight strategy that produces garbage.
5. **If the `resolve-route.mjs` config bridge adds more than 200ms latency to every dispatch,** inline the routing table in the shell scripts instead. Config-as-code is nice but not at the cost of dispatch speed.
