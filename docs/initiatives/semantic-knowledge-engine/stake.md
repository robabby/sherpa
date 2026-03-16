---
staked: 2026-03-16
thesis: "Build foundation (SQLite + sync + FTS5) in 2 sessions, validate against real corpus, then unlock embeddings/summaries/clustering only if the foundation proves sound"
sessions-at-risk: 2
kill-criteria-count: 7
---

# Stake: Semantic Knowledge Engine

## Thesis

Build sessions 1-2 (SQLite schema, sync pipeline, FTS5 full-text search, `search_knowledge` MCP tool) and validate against the real Sherpa corpus before committing sessions 3-6 (embeddings, summaries, clustering, remaining MCP tools).

The riskiest assumptions — TF-IDF effectiveness on Sherpa's vocabulary, sqlite-vec as a loadable extension, HDBSCAN clustering in TypeScript, and whether agents actually use emergent/creative truth — are all concentrated in sessions 3-6. Sessions 1-2 contain proven technology (SQLite WAL, FTS5, filesystem sync) applied in a straightforward way. Gating on the foundation means we risk 2 sessions, not 6.

**Evidence basis:**
- SQLite WAL handles 1000+ concurrent processes (SkyPilot, sourced). 2-6 agents is trivial.
- `node:sqlite` verified working on Node 24.11.1 (tested in brainstorming session).
- FTS5 is a mature, built-in SQLite extension with well-understood behavior (sourced).
- TF-IDF cosine similarity on a 500-file corpus with governance-enforced vocabulary conventions: plausible but unproven (reasoned).
- HDBSCAN in TypeScript: assumed feasible, no established library identified (asserted).

## Rejected Alternatives

### Thesis 2 — Full-Scope Parallel Build

Build all 6 sessions, dispatch 3-5 as parallel worker tasks.

**Rejected because:** Sessions 3-5 rest on asserted or reasoned evidence, not sourced. TF-IDF effectiveness, sqlite-vec integration, and HDBSCAN all carry execution risk. Parallelizing unvalidated work multiplies the blast radius of a wrong assumption. If TF-IDF produces meaningless similarity scores, sessions 3-5 would need significant rework — and that rework would be happening in 3 parallel worktrees simultaneously.

### Thesis 3 — Wait for sqlite-agentic-state

Let sqlite-agentic-state land first, adopt its DB pattern.

**Rejected because:** The pattern overlap is ~20 lines of PRAGMA configuration and a connection factory. Reconciling this after the fact costs minutes, not sessions. Waiting 2-3 sessions for another initiative to land — when the proposal explicitly says "whichever lands first establishes the pattern" — wastes more time than it saves. We should be first, not second.

## Leading Indicators

Checkable within sessions 1-2:

1. **Session 1 gate:** `pnpm sync:db` indexes all ~480 markdown files in under 5 seconds. The `.sherpa/knowledge.db` file is created with correct schema. Files table contains paths, kinds, initiative slugs, and status values. Edges table contains dependency/informs/targets relationships.

2. **Session 1 gate:** FTS5 search for "authority" returns mcp-coordination-layer and mmo-patterns proposals in the top results. Search for "dispatch" returns dispatch-center, ai-sdk-dispatch, and scheduled-dispatch.

3. **Session 2 gate:** An agent calling `search_knowledge({ query: "how do we handle concurrent writes" })` via MCP gets relevant results that would have saved context window if available during prior sessions.

## Kill Criteria

1. **`node:sqlite` WAL failure.** If WAL mode fails on file-based databases (works in-memory but not on disk), or if concurrent reads from multiple processes cause corruption or lock errors, switch to `better-sqlite3`. If that also fails, the entire SQLite approach is wrong — escalate to a different architecture.

2. **Sync pipeline performance.** If full-rebuild sync on the current ~480 file corpus takes more than 30 seconds, the architecture doesn't scale. At 10,000 files it would take 10+ minutes — unacceptable for cold start. Investigate: are we doing unnecessary work? Is `gray-matter` parsing the bottleneck? Is the hash-check fast path working?

3. **FTS5 search quality.** If full-text search consistently fails to return obviously relevant files in the top 5 results for domain-specific queries (e.g., searching "authority" doesn't find the mcp-coordination-layer proposal), FTS5 alone is insufficient and sessions 3-6 become more critical, not less. This doesn't kill the initiative but changes the gate calculus — we'd need to fast-track the embedding backend rather than treating it as an upgrade.

4. **Demand gate failure.** *(Added by pre-mortem.)* If `search_knowledge` receives fewer than 10 calls across 5 agent sessions after session 2 ships, the index has no organic demand. Agents are choosing Grep/Read over the MCP tool. Stop before committing sessions 3-6. This is the most important kill criterion — the original three validate that the technology works, but this one validates that anyone needs it.

5. **Claude Code ships native indexing.** *(Added by pre-mortem.)* If Claude Code changelog announces project indexing, semantic search, or knowledge graph features before sessions 3-6 begin, freeze the initiative and reassess. Sessions 1-2 retain value as standalone infrastructure. Sessions 3-6 may be redundant.

6. **Context window doubling.** *(Added by pre-mortem.)* If Claude's context window doubles (to 2M+) before sessions 3-6, re-evaluate whether the compression layer (summary hierarchy, clustering) is still necessary. FTS5 search retains value regardless; the summary hierarchy loses its forcing function.

7. **Driver alignment failure.** *(Added by pre-mortem.)* If sqlite-agentic-state lands with `better-sqlite3` and the connection factory pattern is incompatible with `node:sqlite`, resolve before starting session 3. Don't build sessions 3-6 on a fractured foundation.

## Review Trigger

Review this stake after **session 2 completes**. Evaluate:

**Technical gates (original):** Leading indicators 1-3, kill criteria 1-3.

**Demand gate (from pre-mortem):** Kill criterion 4 — track `search_knowledge` call frequency across 5 agent sessions. This is the gate that matters most.

**Context gates (from pre-mortem):** Kill criteria 5-6 — scan Claude Code changelog, check context window announcements. Kill criterion 7 — verify driver alignment with sqlite-agentic-state.

If the foundation is technically solid AND agents demonstrate organic demand, unlock sessions 3-6. If the technology works but nobody uses it, stop.
