---
status: archived
initiative: mcp-agent-delegation
created: 2026-03-06
updated: 2026-03-12
type: new-plan
risk: structural
targets:
  - packages/studio-mcp/src/
  - packages/studio-mcp/src/
  - scripts/
  - docs/agents/
  - docs/architecture/
dependencies:
  - agent-infrastructure
  - agentic-workforce
  - mcp-composable-surface
spawned-from: null
migrated-from: wavepoint
---

# MCP Agent Delegation Framework

> **Archived reference.** This initiative was declined in WavePoint (2026-03-09) and migrated to Sherpa as reference material. The decline reasoning was WavePoint-specific — filesystem coordination worked at 3-5 concurrent agents. Several aspects of this proposal are now being pursued under different initiative names in Sherpa's multi-customer context. See [Cross-References](#cross-references-with-sherpa-initiatives) below.

Replace filesystem-based inter-agent coordination (markdown task boards, workstream logs, handoff files) with an MCP server that agents call as tools. Agents discover tasks, claim work, report status, and hand off results through typed MCP tool calls instead of reading/writing markdown files.

## Decline Rationale (WavePoint, 2026-03-09)

**Declined.** Premature — hard dependencies (`agent-infrastructure`, `agentic-workforce`) were unmet, and the filesystem coordination approach was working at WavePoint's scale (3-5 concurrent agents). The 8-12 session investment solved problems that didn't exist yet at that scale. The recommendation was to revisit when filesystem coordination demonstrably fails or agent count exceeds 5.

**Important context:** This decline was scoped to WavePoint's single-project, small-fleet reality. In Sherpa's multi-customer framework context, the coordination problems described here (race conditions, structured queries, real-time signaling, schema enforcement, explicit handoffs) become relevant at lower per-customer agent counts because the framework must support N customers running agents simultaneously.

## Cross-References with Sherpa Initiatives

Several ideas from this proposal are now being actively pursued under different initiative names:

| This Proposal | Sherpa Initiative | Status | Notes |
|---------------|-------------------|--------|-------|
| SQLite-backed coordination state | `mcp-coordination-layer` | pending | Three-layer architecture (MCP state + hooks enforcement + CLAUDE.md conventions). Reduced tool surface from this proposal's 10+ tools to 4 tools + 1 resource. |
| Authority/lease model for task claiming | `mcp-coordination-layer` | pending | Fencing tokens, authority_acquire/renew/release. Solves the race condition problem identified here. |
| Agent discovery & heartbeats (Phase 2) | `mcp-coordination-layer` | pending | Bootstrap protocol: SessionStart hook + get_dashboard + resource subscriptions. |
| Consistency model for concurrent agents | `distributed-agent-consistency` | in-progress | Research on coordinator patterns, event sourcing, optimistic concurrency. Covers the theoretical foundation this proposal assumed. |
| Studio integration (Phase 3) | `mcp-coordination-layer` | pending | Studio UI reads from coordination MCP server. |
| Automated delegation (Phase 4) | Not yet proposed | -- | Highest-risk phase. No Sherpa equivalent yet. Would require eval results and empirical coordination data. |

**Key evolution:** Sherpa's `mcp-coordination-layer` learned from this proposal's decline. It reduced the tool surface significantly (this proposal had 10+ tools across 4 phases; the Sherpa initiative has 4 tools + 1 resource), adopted implicit authority via task dispatch (most agents never touch authority tools), and added hook-based enforcement (deterministic, not LLM-dependent).

**Re-evaluation note:** If this initiative were to be resurrected in Sherpa's context, it should not be revived as-is. The `mcp-coordination-layer` initiative already incorporates the viable parts. The remaining gap is Phase 4 (automated delegation), which should be proposed as a separate initiative once the coordination layer is operational and empirical data on agent coordination exists.

---

## Original WavePoint Proposal (Preserved)

The sections below are the original WavePoint proposal, preserved verbatim for reference.

### State Snapshot

**Current coordination layer:** Filesystem conventions.
- Task board: `docs/tasks/*.md` files with YAML frontmatter (open/claimed/done)
- Workstream logs: `docs/workstreams/<slug>.md` updated manually
- Session manifests: JSON files in `docs/sessions/` written by hook scripts
- Handoff: Implicit — agent writes a proposal, human notices and dispatches next agent
- No locking, no atomic operations, no real-time notification, no structured queries

**What works:** Zero infrastructure, git-versioned, human-readable. At 3-5 agents, race conditions are rare.

**What doesn't work:**
- No concurrency safety — two agents can claim the same task
- No structured queries — "show me all blocked tasks for the architect role" requires grep
- No real-time signaling — agents must poll the filesystem
- No schema enforcement — task files can drift from convention
- Handoffs are implicit — no explicit "I'm done, here's what I produced, here's who should pick it up"

**Industry direction:** MCP + lightweight persistent state is the emerging pattern. MCP provides the typed interface; a database or structured store provides the state. The filesystem approach is pragmatic for bootstrapping but doesn't scale past the current manual coordination model.

**Existing MCP work:** `mcp-composable-surface` builds an MCP server for external consumers of astrology primitives. This initiative builds a *separate* MCP server (or server extension) for internal agent coordination — different audience, different tools, different concerns.

### Proposed Changes

#### Phase 1 — Coordination MCP Server (~3 sessions)

Stand up an MCP server with tools that replace the filesystem task board.

**Location:** `packages/studio-mcp/src/coordination/` (separate from the astrology MCP tools)

**Transport:** Streamable HTTP at `packages/studio-mcp/src/coordination/route.ts`. Same `mcp-handler` pattern as the astrology MCP server but different endpoint.

**Tools (Phase 1):**

| Tool | Replaces | Description |
|------|----------|-------------|
| `create_task` | `task-board.sh add` | Create a task with role, initiative, priority, description |
| `list_tasks` | `task-board.sh list` | Query tasks by status, role, initiative. Structured filters, not grep |
| `claim_task` | `task-board.sh claim` | Atomic claim with agent identity. Fails if already claimed (no race condition) |
| `complete_task` | `task-board.sh done` | Mark done with deliverables list and optional handoff target |
| `create_handoff` | (new) | Explicit handoff: source agent, target role, context summary, deliverables, blockers |
| `get_handoffs` | (new) | Query pending handoffs for a given role |

**State backend:** SQLite via `better-sqlite3` (zero-config, file-based, ACID). Single file at `.data/coordination.db`. Not Supabase — this is local development infrastructure, not a deployed service.

**Schema:**

```sql
CREATE TABLE tasks (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',  -- open, claimed, done, blocked
  role TEXT,                             -- target role slug
  initiative TEXT,                       -- initiative slug
  priority TEXT DEFAULT 'medium',        -- low, medium, high, urgent
  claimed_by TEXT,                       -- session ID or agent identity
  claimed_at TEXT,
  completed_at TEXT,
  deliverables TEXT,                     -- JSON array of file paths
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE handoffs (
  id TEXT PRIMARY KEY,
  source_session TEXT NOT NULL,
  source_role TEXT,
  target_role TEXT NOT NULL,
  initiative TEXT,
  context TEXT NOT NULL,                 -- summary of what was done
  deliverables TEXT,                     -- JSON array of file paths
  blockers TEXT,                         -- JSON array of blockers
  status TEXT NOT NULL DEFAULT 'pending', -- pending, accepted, declined
  created_at TEXT NOT NULL,
  accepted_at TEXT
);
```

**Why SQLite, not Postgres/Supabase:**
- This is local dev tooling, not a deployed product feature
- ACID guarantees solve the race condition problem
- Zero infrastructure — just a file
- `better-sqlite3` is synchronous, which simplifies MCP tool handlers
- Can migrate to Supabase later if coordination needs to survive across machines

#### Phase 2 — Agent Discovery & Status (~2 sessions)

Add tools for agents to discover each other and report status.

**Tools (Phase 2):**

| Tool | Description |
|------|-------------|
| `register_agent` | Agent announces itself: session ID, role, initiative, capabilities |
| `get_active_agents` | Query which agents are currently running |
| `update_status` | Agent reports what it's doing: current task, progress, blockers |
| `get_agent_status` | Query status of a specific agent or all agents for an initiative |

**State:** Additional SQLite table:

```sql
CREATE TABLE agents (
  session_id TEXT PRIMARY KEY,
  role TEXT,
  initiative TEXT,
  status TEXT DEFAULT 'active',     -- active, idle, completed, failed
  current_task TEXT,                 -- task slug
  last_heartbeat TEXT NOT NULL,
  started_at TEXT NOT NULL,
  metadata TEXT                      -- JSON blob for extensibility
);
```

**Heartbeat:** Agents call `update_status` periodically (every N tool calls or at natural checkpoints). Agents with heartbeats older than 10 minutes are marked stale. This replaces the proposed `.agent-status.json` heartbeat files from the agent-infrastructure research.

#### Phase 3 — Studio Integration (~2 sessions)

Connect Studio UI to the coordination MCP server so the human manager has real-time visibility.

**Changes:**
- Studio workforce page reads from coordination API (not filesystem scans)
- Task board view: filterable table of tasks with status, role, initiative, claimed-by
- Handoff queue: pending handoffs surfaced as actionable items
- Active agents: live view of running agents with heartbeat status
- One-click dispatch: accept a handoff and generate the prompt for the next agent

**This phase bridges the gap between the MCP coordination layer and the existing Studio control surface.**

#### Phase 4 — Automated Delegation (~3 sessions)

Enable the coordination server to automatically dispatch sub-agents for low-risk work.

**Prerequisites:** Quality gates from agent eval results, role-based permission model from agentic-workforce, execution monitoring from Studio.

**Pattern:** Orchestrator agent calls `create_task` with `auto_dispatch: true`. If the task matches an approved automation rule (role + task type + risk level), the coordination server generates the prompt and launches a Claude Code session via the dispatch script.

**Automation rules (conservative start):**
- Only `low` model-tier roles
- Only tasks with matching eval pass rates > 80%
- Human notification on dispatch (not approval — notification)
- Auto-stop if task exceeds time or token budget
- Results flow back through `complete_task` + `create_handoff`

**HITL override:** Any automation rule can be paused or revoked from Studio. Human always has kill switch.

### Rationale

#### Why MCP instead of REST API

- Agents already speak MCP. Claude Code has native MCP client support.
- MCP tools are self-describing — agents discover capabilities without documentation.
- The astrology MCP server (`mcp-composable-surface`) already establishes the pattern.
- REST would require building an API client in every agent session. MCP is built in.

#### Why a separate server from astrology MCP

- Different audience: internal agents vs. external developers
- Different lifecycle: coordination tools evolve with the fleet, astrology tools evolve with the platform
- Different auth: coordination is local/trusted, astrology needs API keys
- Different state: coordination uses local SQLite, astrology uses Supabase
- Can be merged later if the separation proves unnecessary

#### Why SQLite, not filesystem

The filesystem approach works until it doesn't. Specific failure modes:
1. **Race conditions:** Two agents read "open", both claim. SQLite: `UPDATE ... WHERE status = 'open'` is atomic.
2. **Querying:** "All high-priority tasks for the architect role on the studio initiative" is one SQL query vs. scanning N files and parsing YAML.
3. **Consistency:** A task can't be in two states simultaneously in SQLite. In the filesystem, a crashed agent can leave a task "claimed" forever.
4. **History:** SQLite naturally supports audit trails. Filesystem requires git log archaeology.

#### Relationship to existing initiatives (WavePoint context)

```
mcp-composable-surface     -> MCP for external consumers (astrology primitives)
mcp-agent-delegation        -> MCP for internal coordination (task/handoff/status)
agentic-workforce           -> Role definitions consumed by both MCP servers
agent-infrastructure        -> Runtime scripts that dispatch agents to MCP-connected sessions
studio-state-machine        -> UI that reads from coordination MCP server
```

This initiative doesn't replace the others — it provides the typed coordination layer they've been working toward through filesystem conventions.

### Dependencies (WavePoint context)

- **`agent-infrastructure`** (hard) — Dispatch script, session manifests, and eval results are prerequisites. Phase 1 of agent-infra should be complete.
- **`agentic-workforce`** (hard) — Role definitions provide the `role` field for task routing and agent registration.
- **`mcp-composable-surface`** (soft) — Establishes the MCP server pattern in the codebase. Not a functional dependency but informs architecture decisions.
- **`studio-state-machine`** (soft, Phase 3) — Studio UI patterns needed for the coordination dashboard.

### Review Notes

- Phase 1 is the critical validation. If MCP coordination doesn't feel better than the filesystem for basic task management, the initiative should be reconsidered.
- SQLite is a deliberate simplicity choice. Don't over-engineer the storage layer before validating that MCP coordination is the right interface.
- Phase 4 (automated delegation) is the highest-risk phase. It should be gated on empirical evidence from eval results and manual coordination experience.
- The filesystem conventions don't need to be removed. They can coexist as a fallback and for human readability. The MCP layer is an upgrade path, not a replacement mandate.
- Consider whether `mcp-handler` supports multiple MCP servers at different routes in the same Next.js app, or whether coordination needs its own process.
- **Effort:** 8-12 sessions total across four phases. Phase 1 is 3 sessions and provides the validation signal for continuing.

### Decision

**Declined (2026-03-09).** Premature — hard dependencies (`agent-infrastructure`, `agentic-workforce`) are unmet, and the filesystem coordination approach is working at current scale (3-5 concurrent agents). The 8-12 session investment solves problems that don't exist yet. Revisit when filesystem coordination demonstrably fails or agent count exceeds 5.
