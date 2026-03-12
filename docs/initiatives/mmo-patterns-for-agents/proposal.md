---
status: pending
initiative: mmo-patterns-for-agents
created: 2026-03-11
updated: 2026-03-11
started: 2026-03-11
type: research-synthesis
risk: additive
targets:
  - docs/architecture/agent-coordination-patterns.md
  - docs/architecture/interest-management.md
dependencies:
  - mcp-coordination-layer
  - distributed-agent-consistency
  - sqlite-agentic-state
  - section-level-prose-sync
spawned-from: null
---

# Game Server Architecture Patterns for Multi-Agent Coordination

## Summary

MMO game servers solved the problem of thousands of entities mutating shared world state 20+ years ago. The patterns they developed — authority transfer, interest management, tick-based reconciliation, rollback netcode — map structurally to the problem of multiple AI agents collaborating on shared filesystem state. This initiative synthesizes those patterns into an architectural vocabulary and design framework for Sherpa's agent coordination layer.

## State Snapshot

Sherpa uses a Planner/Worker/Judge dispatch model where Workers operate in isolated git worktrees. Current coordination is ad-hoc: file-level git locking, manual task partitioning, rebase-on-merge. No formal authority tracking, no interest management for context scoping, no conflict prevention beyond task definition. Sibling initiatives (`mcp-coordination-layer`, `distributed-agent-consistency`, `sqlite-agentic-state`, `section-level-prose-sync`) are researching adjacent problems independently.

## Proposed Changes

### Target: `docs/architecture/agent-coordination-patterns.md` (new)

Architectural reference document codifying five patterns derived from this research:

**Pattern 1: Single-Writer Authority with Component Granularity**
Adapted from SpatialOS. Every writable artifact (file, section, config key) has exactly one authority-holder at any time. Authority is tracked at the component level — different agents can write to different sections of the same initiative. The MCP coordination server enforces the invariant.

**Pattern 2: Replication Layer as Coordination Service**
Adapted from Star Citizen. All agent state mutations flow through the MCP server — no agent reads or writes shared state directly without the coordination layer being aware. The MCP server tracks authority assignments, mediates transfers, and provides crash recovery via git (the EntityGraph equivalent).

**Pattern 3: Prevention → Detection → Compensation Spectrum**
Adapted from GGPO/Valve/Figma. Default to conflict prevention (task partitioning, advisory file leases). Fall back to detection (git version checking at merge time). Reserve compensation (rebase, retry, Judge arbitration) for the rare cases where prevention and detection miss. Invest in prevention because agent session re-runs are expensive.

**Pattern 4: Bounded Authority Transfer with Fencing Tokens**
Adapted from Improbable Patent + Kleppmann. Authority transfers (Planner→Worker→Judge) use a bounded-timeout protocol with monotonically increasing fencing tokens. Old authority holders cannot write after the token increments. Crashed workers trigger orphan detection and automatic reassignment.

**Pattern 5: Time Dilation as Backpressure**
Adapted from EVE Online. When the system is overloaded (too many agents, too many conflicts), slow down rather than add more agents. Accept graceful degradation over cascading failures.

### Target: `docs/architecture/interest-management.md` (new)

Architectural reference document for agent context scoping:

**The DOI Model for Files:**
```
DOI(file, agent) = TaskRelevance(file, agent.task)
                 + DependencyProximity(file, agent.focus_files)
                 - Staleness(file.last_read)
```

**Three LOD Tiers:**
- LOD 0 (full content): Files agent is editing + direct dependencies (0-1 import hops)
- LOD 1 (signatures): Type definitions, function signatures (2-3 hops). ~10-20% of full content tokens.
- LOD 2 (index): File path + one-line description. ~1% of full content tokens. Agent can request LOD 0/1 on demand.

**Task-Type Interest Profiles:** Bug fix (narrow+deep), feature (medium+medium), architecture review (broad+shallow), refactor (wide+medium).

**Always-Interested Files:** CLAUDE.md, shared type definitions, task description, recent CI results.

## Rationale

- **12 MMO systems studied** across 5 research vectors, with ~270KB of raw sourced research
- The **single-writer invariant** is independently enforced by every production system examined — it's not a design choice, it's a requirement
- **Eclipse Mylyn** (2005) already proved DOI works for code context management with measured 15% productivity improvement
- **Git already provides** rollback (rebase), snapshot (commit), conflict detection (merge), and optimistic concurrency (push failure) — Sherpa needs the coordination layer on top, not a replacement
- **Current AI agent frameworks** (OpenAI Swarm, Semantic Kernel, ADK) handle conversational handoff but none implement authority over shared state — this is the gap
- **Figma's property-level LWW** proves that fine-grained granularity (section-level for us) eliminates most conflicts without heavyweight coordination

## Dependencies

- `mcp-coordination-layer` — The MCP server IS the replication layer. These patterns define what it does.
- `distributed-agent-consistency` — The consistency model (strong per-component, eventual cross-agent) emerges from these patterns.
- `sqlite-agentic-state` — SQLite as the backing store for authority tracking, fencing tokens, and task board state.
- `section-level-prose-sync` — Section-level granularity is the "component-level authority" equivalent for documents.

## Review Notes

- These patterns are architectural vocabulary, not implementation specs. Each pattern needs a concrete implementation design before building.
- The DOI model coefficients (TaskRelevance, DependencyProximity, Staleness) need empirical tuning — the initial values are educated guesses from Mylyn's research.
- The "favor the writer" default policy may need exception lists (structural changes, dependency updates) similar to Overwatch's defensive ability exceptions.
- Conflict rate in practice determines which point on the prevention→compensation spectrum is the right default. We need data from real multi-agent sessions.
