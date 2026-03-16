---
started: 2026-03-11
worktree: null
---

## Activity Log

- 2026-03-11: Initiative created. Spawned from conversation about MCP server as Replication Layer — mediating all agent state mutations with authority tracking and optimistic concurrency.
- 2026-03-11: Iteration 1 complete. 5 parallel research vectors dispatched (MCP primitives, existing servers, authority tools, SQLite architecture, file projection). 243KB of raw research. Proposal written. Architecture: single-process Streamable HTTP + SQLite (WAL, better-sqlite3) + implicit authority via task dispatch + write-through projection.
- 2026-03-12: Iteration 2 complete. 5 parallel vectors informed by mmo-patterns-for-agents sibling initiative. Tool surface reduced 6→4 tools + 1 resource. Discovered three-layer architecture (MCP state + hooks enforcement + CLAUDE.md conventions). SQLite confirmed (3-7μs reads, no cache). Bootstrap protocol designed (SessionStart hook → get_dashboard → resource subscriptions). Proposal updated with all findings.
- 2026-03-13: Phase 0 design — Streamable HTTP transport. Decisions: drop stdio entirely, port resolution (env > config > 3100), no auth (localhost), dual lifecycle (pnpm mcp standalone + pnpm dev integrated). Design at `docs/plans/2026-03-13-mcp-streamable-http-design.md`.
- 2026-03-13: Staked. Full coordination layer (Thesis A) over transport-only deferral (B) and POSIX primitives (C). 4-6 sessions at risk. Kill criteria: transport multi-client, hook latency <100ms, SQLite contention <50ms p99, automated hook installation. Review trigger at Session 3.
- 2026-03-13: Pre-mortem complete. 12 failure modes ranked across technical/scope/context lenses. Top finding: SDK transport only supports one session per instance — session manager needed in Phase 0 scope. Added 2 kill criteria to stake: demand signal (4-week collision check) and circular dependency resolution. Confidence downgraded to medium on authority phases; Phase 0 remains high confidence.
- 2026-03-13: Implementation plan written. 4 phases, 21 tasks. Phase 0 (8 tasks, 1 session): transport swap with session manager, port resolution, lifecycle scripts, integration tests, kill criteria validation. Phases 1-3 gated on demand signal. Plan at `docs/plans/2026-03-13-mcp-coordination-layer-plan.md`.
- 2026-03-13: Phase 0 implemented. 7 commits, 14 tests passing. Kill criterion #1 validated: two concurrent clients connect with independent session IDs. Latency baseline: 0.4-0.5ms per HTTP round-trip on localhost. Pending: manual validation of `.mcp.json` URL field with Claude Code.
- 2026-03-16: Phase 1 implemented. Authority system: 3 tools (authority_acquire, authority_release, authority_renew) + 1 resource (authority://{scope}) + get_dashboard bootstrap. SQLite-backed with BEGIN IMMEDIATE transactions. Fence tokens globally monotonic via fence_token_seq counter. TTL reaper on 60s interval. DB lifecycle wired into HTTP server. 45 tests across 11 files. Code review caught critical datetime format mismatch (JS ISO vs SQLite datetime) — fixed. Plan at `docs/initiatives/mcp-coordination-layer/plan.md`.
- 2026-03-16: Decision recorded — authority enforcement scoped to autonomous agents only. Human+AI collaborative sessions bypass authority checks entirely. This reshapes Phase 2 scope.
- 2026-03-16: Integrated. Phase 0 (transport) + Phase 1 (authority state) ship as independently valuable infrastructure. Phases 2-3 deferred to follow-on initiative, gated on demand signal (kill criterion #5).

## Seeds

Seeds from deferred phases and implementation insights. Each is a candidate for a follow-on initiative.

- **Hook enforcement for autonomous agents** — Phase 2 from original plan. PreToolUse/PostToolUse hooks that POST to MCP server to check authority before Edit/Write. Must detect session type (collaborative vs autonomous) and only enforce on autonomous sessions. Scoped out by the "authority-scope-autonomous-only" decision — enforcement is premature without routine autonomous dispatch. → Trigger: 4+ concurrent autonomous agents or first file collision in dispatch history.
- **Bootstrap protocol + resource subscriptions** — Phase 3 from original plan. Dashboard file projection (`.sherpa/state/dashboard.json` regenerated on every mutation), SessionStart hook reads cached state, resource subscriptions for `authority://`, `tasks://`, `activity://` push-based delta updates. Scoped out as premature optimization.
- **Implicit authority via task dispatch** — When `task_dispatch` is called, auto-acquire authority over target files so workers never call `authority_acquire` directly. Designed but not implemented — requires the hook enforcement layer to be meaningful.
- **Write-through file projection** — SQLite mutations regenerate affected markdown files synchronously. Atomic writes via temp+rename. Sync metadata in frontmatter. Human edit detection via content hashing. Part of the Fossil SCM duality pattern. Scoped out as part of sqlite-agentic-state Session 2.
- **State versions / optimistic concurrency** — `state_versions` table exists but has no tool surface. `expectedVersion` on mutations, server rejects stale writes. Designed in proposal but deferred — the authority lease model handles the current scale.
