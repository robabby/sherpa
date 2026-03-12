# Addendum: The Beads Ecosystem as Prior Art

**Added:** 2026-03-12
**Trigger:** User question — "If git is the netcode, does Beads try to solve for this exact problem?"

---

## What Beads Is

**Beads** is a distributed, git-backed issue tracker optimized for AI coding agents, created by Steve Yegge. Written in Go, 18.8k GitHub stars, MIT license. The core insight: agents suffer from the "50 First Dates" problem (no memory between sessions). Beads replaces unstructured markdown plans with a **dependency-aware DAG** of work items stored in `.beads/`.

The key command is `bd ready --json` — surfaces only unblocked, prioritized work, preventing agents from attempting impossible task sequences.

- Source: [steveyegge/beads (GitHub)](https://github.com/steveyegge/beads)

## The Ecosystem (Four Layers)

| Layer | Tool | What It Does |
|-------|------|-------------|
| **Memory** | Beads | Persistent task DAG with dependency-aware readiness computation |
| **Coordination** | Agent Mail | Advisory file leases with TTL, agent messaging, pre-commit hooks |
| **Orchestration** | Gas Town | 20-30 parallel agents in worktrees, Mayor/Polecat role hierarchy |
| **Storage** | Dolt | Version-controlled SQL database with cell-level merge |

### Beads (Memory Layer)

- Hash-based IDs (`bd-a1b2`) prevent merge collisions when agents create issues concurrently on different branches
- Atomic claiming: `bd update <id> --claim` sets assignee + status atomically, first-come-first-served
- Four dependency types: blocks/blocked_by (ordering), parent-child (hierarchy), related (soft link), discovered-from (audit trail)
- Migrated from JSONL+SQLite to **Dolt** — a version-controlled SQL database with native branching, push/pull, and cell-level merge
- All worktrees share the same `.beads` database; Dolt server mode enables multi-writer concurrent access

Sources:
- [Beads ARCHITECTURE.md](https://github.com/steveyegge/beads/blob/main/docs/ARCHITECTURE.md)
- [Beads WORKTREES.md](https://github.com/steveyegge/beads/blob/main/docs/WORKTREES.md)

### Agent Mail (Coordination Layer)

- Agent identity management (memorable adjective+noun names like "GreenCastle")
- Inboxes/outboxes with searchable message threads
- **Advisory file reservations** with TTL-based leases and optional exclusivity
- Optional pre-commit hook enforcement blocking commits that violate active exclusive reservations
- Git-backed canonical storage + SQLite FTS5 for fast search
- MCP tools: `register_agent`, `send_message`, `fetch_inbox`, `file_reservation_paths`, `release_file_reservations`

Source: [MCP Agent Mail (GitHub)](https://github.com/Dicklesworthstone/mcp_agent_mail)

### Gas Town (Orchestration Layer)

- Steve Yegge's multi-agent workspace orchestrator (~189k LOC in Go)
- Hierarchical agent roles: Human → Mayor (coordinator) → Polecats (workers), with Witness (health monitor) and Refinery (merge manager)
- Git worktree-based persistent storage ("hooks")
- Work state survives agent crashes because it's anchored to git, not agent memory
- Manages "colonies of 20-30 parallel AI coding agents"

Sources:
- [Gas Town (GitHub)](https://github.com/steveyegge/gastown)
- [A Day in Gas Town (DoltHub Blog)](https://www.dolthub.com/blog/2026-01-15-a-day-in-gas-town/)

### MCP Beads Village (MCP Integration)

- MCP server wrapping Beads + built-in Agent Mail
- `.beads/` (tasks), `.mail/` (messages), `.reservations/` (file locks)
- Atomic file locking via `O_CREAT|O_EXCL` flags
- 13 core MCP tools + 4 optional graph analysis tools
- Standard workflow: `init() → claim() → reserve() → [work] → done() → RESTART`

Source: [mcp-beads-village (GitHub)](https://github.com/LNS2905/mcp-beads-village)

### BeadHub (Dashboard)

- Real-time coordination server with central dashboard
- Shows all active agents, their tasks, and file modifications
- Synchronous chat + asynchronous mail between agents
- File locking with configurable TTL auto-expiry
- Escalation to humans with full context

Source: [BeadHub](https://beadhub.ai/)

## Gap Analysis Against MMO Patterns

| MMO Pattern (from Iteration 1) | Beads Ecosystem Status | Gap? |
|---|---|---|
| **Single-writer authority** | Advisory file leases (Agent Mail). Trust-based, not enforced. No formal authority tracking. | **Yes.** No fencing tokens, no enforced single-writer invariant. An agent that ignores a lease can still write. |
| **Component-level authority** | Not addressed. File-level leases only, no section/component granularity. | **Yes.** No sub-file authority partitioning. |
| **Replication layer** | Beads Village MCP server mediates task state and file reservations. | **Partial.** It's a task board and message bus, not a state replication tier. No authority state machine, no optimistic concurrency on the coordination layer itself. |
| **Interest management / context scoping** | Not addressed. Agents request whatever files they need manually. | **Yes.** No DOI model, no LOD tiers, no query-based interest, no "always interested" files. |
| **Authority transfer protocol** | Task reassignment exists but no state machine (AUTHORITATIVE → AUTHORITY_LOSS_IMMINENT → NOT_AUTHORITATIVE). | **Yes.** No bounded timeouts, no proxy pre-staging, no orphan detection protocol. |
| **Fencing tokens** | Not implemented. No mechanism to reject stale writes from expired authority holders. | **Yes.** The "zombie worker" problem is unaddressed. |
| **Tick-based reconciliation** | Manual `bd dolt push/pull`. No automatic sync rhythm. | **Yes.** No event-driven awareness, no debounced tick, no adaptive timing. |
| **Rollback / compensation** | Dolt history provides version control. Git rebase works. Dolt's cell-level merge resolves structured data conflicts. | **Partial.** History and merge exist but no automated rollback-and-replay workflow. |
| **Time dilation / backpressure** | Not addressed. No throttling when too many agents target the same files. | **Yes.** No graceful degradation mechanism. |
| **Authority/ownership distinction** | Gas Town separates Mayor (owns strategy) from Polecats (have execution authority). | **Emergent.** The role hierarchy captures this but it's not formalized as a transferable protocol. |

## What Beads Gets Right (Patterns to Adopt)

1. **Git/Dolt as distributed database** — no external infrastructure needed. Dolt's cell-level merge is superior to line-level git merge for structured data.
2. **Hash-based IDs** — eliminates merge collisions for concurrent entity creation. Sherpa's initiative slugs serve a similar purpose.
3. **DAG-based dependency tracking** — `bd ready` surfacing only unblocked work prevents agents from attempting impossible sequences.
4. **Ecosystem layering** — Beads (memory) + Agent Mail (coordination) + Gas Town (orchestration) as separate concerns mirrors the separation of concerns in MMO architecture (EntityGraph + Replication Layer + Game Servers).
5. **Advisory-by-default reservations** — soft enforcement is the right default when conflicts are rare. Matches our "prevention first" principle.
6. **Agent identity as first-class concept** — agents need stable identities for authority tracking, message routing, and audit trails.

## Conclusion

Beads solves **persistent agent memory and task sequencing** — necessary infrastructure but not the coordination layer our research identifies as the missing piece. It's building the task board (EntityGraph) without building the replication layer (authority enforcement, interest management, reconciliation protocol).

The two are complementary, not competitive:
- Beads/Dolt could serve as the **state persistence layer** (like Star Citizen's EntityGraph)
- The authority/interest management layer described by our research sits **on top** of a task tracker like Beads
- Gas Town's Mayor/Polecat hierarchy is an emergent version of Planner/Worker but without formal authority transfer semantics

**Key differentiator for Sherpa:** The iteration-1 finding that "no current AI agent framework implements enforced authority over shared state" remains true even with the full Beads ecosystem. Beads transfers *task assignments*; Agent Mail provides *advisory* leases. Neither provides enforced authority with fencing tokens, bounded transfer protocols, or interest-managed context scoping.

## Raw Links

- https://github.com/steveyegge/beads
- https://github.com/steveyegge/beads/blob/main/docs/ARCHITECTURE.md
- https://github.com/steveyegge/beads/blob/main/docs/WORKTREES.md
- https://github.com/Dicklesworthstone/mcp_agent_mail
- https://github.com/LNS2905/mcp-beads-village
- https://github.com/steveyegge/gastown
- https://beadhub.ai/
- https://www.dolthub.com/blog/2026-01-15-a-day-in-gas-town/
- https://maggieappleton.com/gastown
- https://paddo.dev/blog/gastown-two-kinds-of-multi-agent/
- https://paddo.dev/blog/from-beads-to-tasks/
- https://www.bryanwhiting.com/ai/agent-mail-beads-coordinated-ai-coding-agents-how/
- https://peterwarnock.com/tools/beads-distributed-task-management-for-agents/
- https://debugg.ai/resources/beads-memory-ai-coding-agents-automated-pm-developer-workflows
- https://www.decisioncrafters.com/beads-ai-agent-memory-system/
- https://ianbull.com/posts/beads/
- https://one-shot.aitinkerers.org/p/steve-yegge-on-agentic-coding-beads-and-the-future-of-ai-workflows
