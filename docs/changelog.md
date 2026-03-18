---
doc-type: changelog
maintained-by: self-documenting-system
authored-by: ai
reviewed-by: null
last-updated: 2026-03-17
last-verified: 2026-03-17
source-initiatives:
  - parallel-workflow-governance
  - dispatch-center
  - voice-and-tone
  - studio-ux-patterns
  - studio-agent-missions
  - agent-narrative-streaming
  - sqlite-agentic-state
  - mcp-coordination-layer
  - semantic-knowledge-engine
  - mcp-multi-backend-dispatch
---

> **AI-updated** 2026-03-17 · Awaiting human review

# Changelog

Reverse-chronological record of integrated initiatives and their system impact.

## 2026-03-17 — MCP Multi-Backend Dispatch

Wired the MCP `task_create` and `task_dispatch` tools into the existing multi-backend dispatch infrastructure. Tasks created via MCP can now route to any configured backend (claude, gemini, codex, groq, etc.) instead of being hardcoded to lm-studio. `task_dispatch` delegates to `worker.sh` rather than reimplementing per-backend spawn logic.

**Initiative:** [mcp-multi-backend-dispatch](initiatives/mcp-multi-backend-dispatch/proposal.md)
**Pillar:** Execution Pipeline
**Key changes:**
- `packages/studio-mcp/src/server.ts` — `task_create` gains `backend` and `task_type` params, calls `resolveRoute()` for automatic routing; `task_dispatch` drops lm-studio-only gate, delegates to `worker.sh`
- `scripts/backends/claude.sh` — Skip `--max-budget-usd` when budget is zero (Claude CLI rejects 0.00)
- 5 route resolution tests, 3 backend infrastructure tests
- End-to-end verified: claude, gemini, codex, groq backends all dispatch and complete successfully
- 7 commits, 1 session (estimated 2)

## 2026-03-16 — Semantic Knowledge Engine

Built a queryable knowledge index that gives agents truthful, context-efficient access to system state through 4 MCP tools. Replaces O(n) filesystem scans with indexed queries — 537 files, 335 edges, 49 summaries, 245 inferred edges, 2 clusters, synced in 235ms. Pluggable backend architecture with zero-dependency algorithmic default (TF-IDF + extractive summaries).

**Initiative:** [semantic-knowledge-engine](initiatives/semantic-knowledge-engine/proposal.md)
**Pillar:** Execution Pipeline
**Key changes:**
- `packages/studio-core/src/db/knowledge-schema.ts` — 6-table schema (files, edges, FTS5, summaries, inferred_edges, clusters)
- `packages/studio-core/src/db/knowledge-sync.ts` — hash-based incremental sync from filesystem
- `packages/studio-core/src/db/knowledge-embeddings.ts` — embedding sync, inferred edges, clustering
- `packages/studio-core/src/db/classify.ts` — file classifier, edge extractor from frontmatter
- `packages/studio-core/src/knowledge/` — `KnowledgeBackend` interface, `AlgorithmicBackend` (TF-IDF), agglomerative clustering
- `packages/studio-core/src/config/types.ts` — `KnowledgeConfig` section in `sherpa.config.ts`
- `packages/studio-mcp/src/server.ts` — 4 MCP tools: `search_knowledge` (3 modes), `get_summary` (3 levels), `get_context` (4 roles), `query_related` (3 modes)
- `scripts/sync-knowledge-db.mjs` — `pnpm sync:db` CLI
- Session 6 waypoint: git hooks, file watcher, and Studio Settings page explicitly deferred — lazy sync sufficient
- 8 commits, 193 tests, 24/24 validation acceptance criteria pass

## 2026-03-16 — MCP Coordination Layer

Replaced stdio MCP transport with Streamable HTTP and built an authority lease system for multi-agent coordination. The MCP server now handles multiple concurrent Claude Code clients, each with independent sessions. Authority leases with globally monotonic fencing tokens enable safe concurrent access to shared files — though enforcement is deferred until autonomous dispatch is routine.

**Initiative:** [mcp-coordination-layer](initiatives/mcp-coordination-layer/proposal.md)
**Pillar:** Execution Pipeline
**Key changes:**
- `packages/studio-mcp/src/http-server.ts` — Streamable HTTP transport replacing stdio, multi-client session manager
- `packages/studio-mcp/src/authority/` — Schema, operations (acquire/release/renew/check), reaper, MCP tool registrations
- `packages/studio-mcp/src/dashboard.ts` — `get_dashboard` bootstrap tool returning leases, tasks, system summary
- Authority leases backed by SQLite `coordination.db` with `BEGIN IMMEDIATE` transactions
- Fence tokens globally monotonic via `fence_token_seq` counter table
- TTL reaper cleans expired leases every 60 seconds
- `authority://{scope}` MCP resource for read-only observation
- Decision: authority enforcement scoped to autonomous agents only (hooks deferred)
- 18 commits across 2 phases, 45 tests across 11 files

## 2026-03-16 — SQLite Agentic State Foundation

Introduced SQLite as Sherpa's embedded state store, following the Fossil SCM pattern: markdown files remain canonical, SQLite provides derived queryable indexes. Resolved circular dependency between sqlite-agentic-state and mcp-coordination-layer. Built the shared DB module that mcp-coordination-layer and semantic-knowledge-engine now build on top of.

**Initiative:** [sqlite-agentic-state](initiatives/sqlite-agentic-state/proposal.md)
**Pillar:** Execution Pipeline
**Key changes:**
- `packages/studio-core/src/db/` — connection factory with WAL mode, pooled connections, standard pragmas
- `coordination.db` schema: agent_sessions, task_claims (CAS via version columns), schema_version
- `events.db` schema: append-only audit trail with ULID-keyed events
- Barrel export at `@sherpa/studio-core/db` — consumed by mcp-coordination-layer and semantic-knowledge-engine
- Drizzle ORM composability validated — downstream consumers wrap raw connection with ORM
- `pnpm.onlyBuiltDependencies` config for better-sqlite3 native addon
- 7 commits, 814 lines, 141 tests

## 2026-03-16 — Agent Narrative Streaming

Fills the black box between `dispatch_spawned` and `status_changed`. A sidecar script (`agent-log-streamer.sh`) tails backend output during dispatch, strips ANSI codes, batches lines, and emits `agent_output` events into the NDJSON event stream. New Log tab in the mission detail pane renders the full agent narrative as a terminal-style feed. Timeline collapses agent output into compact activity indicators.

**Initiative:** [agent-narrative-streaming](initiatives/agent-narrative-streaming/proposal.md)
**Pillar:** Execution Pipeline, Studio Application
**Key changes:**
- `scripts/agent-log-streamer.sh` sidecar for tailing backend output into NDJSON events
- Claude backend switched to `--output-format stream-json` for incremental output
- `agent_output` event type added to NDJSON schema (lines, batch, byteOffset)
- `MissionLogViewer` terminal-style component with auto-scroll and 1000-line cap
- Log tab added to mission detail pane (between Report and Verdict)
- Timeline collapses consecutive `agent_output` events into activity indicators
- Tested across Claude and Codex backends

## 2026-03-16 — Self-Documenting System

Introduced the self-documenting system: directoturtle convention elevated to first-class system-wide pattern, provenance metadata tracking authorship and review state on all maintained docs, `/integrate` skill for post-initiative documentation, `/doc-bootstrap` skill for history crawl and scaffolding.

**Initiative:** [self-documenting-system](initiatives/self-documenting-system/proposal.md)
**Pillar:** Executable Conventions, Governance Engine
**Key changes:**
- Directoturtle convention rule (`.claude/rules/directoturtle-convention.md`)
- Provenance convention rule (`.claude/rules/provenance-convention.md`)
- `/integrate` skill for post-initiative documentation updates
- `/doc-bootstrap` skill for documentation surface generation
- Architecture documentation surface (`docs/architecture/`) with seven pillar docs
- Cross-cutting decision records (`docs/decisions/`)

## 2026-03-14 — Studio Agent Missions

Reimagined the tasks page as a mission control interface. Split-pane layout with scrollable task list and full detail view showing agent metadata (provider, model, duration, tokens, cost) and structured event timeline. Edge-to-edge viewport layout matching dispatch and process pages.

**Initiative:** [studio-agent-missions](initiatives/studio-agent-missions/proposal.md)
**Pillar:** Studio Application
**Key changes:**
- Split-pane mission control layout replacing table-based task board
- Task cards with agent mission metadata
- Agent metadata header (provider, model, duration, token usage, cost estimate)
- Event timeline from NDJSON agent logs
- 14 tasks executed via subagent-driven development, 2,142 lines of code

## 2026-03-13 — Studio UX Patterns

Established five cross-cutting interaction patterns for the Studio app: command palette (Cmd+K global search), skeleton loading (loading.tsx with show-delay), functional empty states (actionable guidance), browser tab status (favicon + title updates), and URL-persisted filter state (search params across all pages).

**Initiative:** [studio-ux-patterns](initiatives/studio-ux-patterns/proposal.md)
**Pillar:** Studio Application
**Key changes:**
- Command palette component with Cmd+K activation
- Loading skeleton pattern with delayed reveal
- EmptyState component with actionable guidance
- `usePageStatus` hook for browser tab status
- URL filter state persistence via search params

## 2026-03-11 — Voice and Tone

Comprehensive content standards for Sherpa: 3 business personas, 6 product personas, messaging framework (Dunford positioning + Raskin narrative + JTBD), agent voice guidelines mapping behavioral constraints to voice constraints, accessibility and inclusion standards, component content patterns for 8 UI component types.

**Initiative:** [voice-and-tone](initiatives/voice-and-tone/proposal.md)
**Pillar:** Executable Conventions
**Key changes:**
- `docs/ux/personas.md` — 3 business personas
- `docs/ux/product-personas.md` — 6 product personas
- `docs/ux/messaging-framework.md` — Dunford + Raskin + JTBD
- `docs/ux/agent-voice.md` — behavioral constraints → voice constraints
- `docs/ux/accessibility-and-inclusion.md` — accessible content standards
- `docs/ux/component-content.md` — content patterns for 8 component types
- `.claude/rules/content-quality.md` — 8-criterion quality scorecard

## 2026-03-09 — Dispatch Center

The complete Planner/Worker/Judge execution pipeline: five CLI backends (claude, opencode, codex, gemini, lm-studio), three dispatch modes (interactive, supervised, overnight), task-type routing via `sherpa.config.ts`, Studio dispatch UI with three-panel layout, MCP server task tools, and budget allocation strategy.

**Initiative:** [dispatch-center](initiatives/dispatch-center/proposal.md)
**Pillar:** Execution Pipeline, Studio Application
**Key changes:**
- `scripts/dispatch.sh`, `worker.sh`, `auto-judge.sh`, `dispatch-queue.sh`, `task-board.sh`
- `scripts/backends/` — 5 backend modules
- `apps/studio/src/app/dispatch/` — three-panel dispatch UI
- `packages/studio-core/src/dispatch.ts` — dispatch domain logic
- `packages/studio-core/src/tasks.ts` — task data model
- 52 files, 6,500+ lines across 5 sessions

## 2026-02-28 — Parallel Workflow Governance

Codified the three-layer coordination model for multi-agent work: worktree isolation conventions, initiative lifecycle with directoturtle directory structure, proposal-based shared artifact changes, and integration review for batch conflict resolution. The governance foundation that enables concurrent agent work.

**Initiative:** [parallel-workflow-governance](initiatives/parallel-workflow-governance/proposal.md)
**Pillar:** Governance Engine, Executable Conventions
**Key changes:**
- `.claude/rules/initiative-convention.md` — directoturtle structure, proposal format, seeds
- `.claude/rules/worktree-conventions.md` — isolation model, naming, lifecycle
- Three-layer coordination model: MCP (state) → Hooks (enforcement) → CLAUDE.md (guidance)
- Integration review workflow for batch proposal processing
