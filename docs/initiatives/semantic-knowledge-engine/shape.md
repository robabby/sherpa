---
appetite: 6 sessions
shaped: 2026-03-16
---

# Shape: Semantic Knowledge Engine

## Appetite

**6 sessions.** Full scope. Ship the complete knowledge engine — SQLite index, FTS5 search, pluggable backend with algorithmic TF-IDF, summary hierarchy, all 4 MCP tools, clustering, git hooks, and Studio configuration.

The stress test validated the foundation with wide margins (226ms sync, p99=286μs concurrent reads, FTS5 relevance confirmed). The premortem identified real risks — demand uncertainty, Claude Code native features, TF-IDF calibration — but these are watchdog items, not blockers. The system we're building is infrastructure for Sherpa's scaling path, the enterprise deployment model, and the three-DB state layer architecture. It's worth the full investment.

Kill criteria remain as checkpoints within the 6 sessions. If something goes wrong, we stop and reassess at that point — not before starting.

## Evidence & Success

**Customer evidence:** Builder judgment from operating the system. The pain is projected but the trajectory is clear — at 4 concurrent sessions generating hundreds of files daily, the current Grep/Read pattern breaks down. The knowledge engine is the read path of the state layer. Without it, sqlite-agentic-state and mcp-coordination-layer have no query surface for agents.

**Success metrics:**
1. `pnpm sync:db` indexes the full corpus in under 1 second (stress test: 226ms — already met)
2. `search_knowledge` MCP tool returns relevant files in top 3 for domain queries (stress test: confirmed)
3. `get_context` provides role-appropriate system state in under 2000 tokens per bootstrap call
4. `query_related` in explicit mode returns correct edges matching frontmatter dependencies/informs
5. `query_related` in emergent mode surfaces at least 3 unlinked-but-related initiative pairs across the corpus (stress test showed TF-IDF finds them — sqlite-agentic-state ranks #1 for semantic-knowledge-engine)

**Personas served:** `engineer` — agents running Claude Code sessions are primary consumers.

## Shaped Solution

Six sessions building bottom-up. Each session produces a testable, committable increment.

**Session 1: The Index.** SQLite database at `.sherpa/knowledge.db`. Run `pnpm sync:db` and the database contains: every file with content, frontmatter (JSON), classification (kind, initiative slug, status), explicit relationship edges, and a standalone FTS5 table for full-text search. The database is derived — delete it, rebuild in under a second.

Components:
- Connection factory (`db/connection.ts`) — WAL-mode SQLite, singleton per path
- Schema (`db/schema.ts`) — files, edges, files_fts (standalone FTS5), schema_version
- Classifier (`db/classify.ts`) — path → kind/initiative, frontmatter → edges, content → SHA-256
- Sync (`db/sync.ts`) — walk filesystem, hash for skip, upsert to DB, maintain FTS5 with DELETE+INSERT (never REPLACE — stress test A6)
- CLI (`scripts/sync-knowledge-db.ts`) — `pnpm sync:db`

**Session 2: FTS5 Search Tool.** `search_knowledge` MCP tool added to studio-mcp. FTS5 BM25 ranking. Three modes declared (`text`, `semantic`, `hybrid`) — `text` is functional, other two stub with explicit messages about backend requirements.

**Session 3: Pluggable Backend + Algorithmic TF-IDF.** `KnowledgeBackend` interface with `embed()` and `summarize()`. `AlgorithmicBackend` implementation: TF-IDF vectors with BM25-informed weighting, extractive summaries from markdown structure. `KnowledgeConfig` added to `sherpa.config.ts`. Embeddings table added to schema. `search_knowledge` `semantic` and `hybrid` modes activated. Uses **rank-based retrieval** (top-K), not threshold-based — stress test A7 showed scores live in 0.05-0.20 range.

**Session 4: `get_context` + `get_summary` Tools.** Session bootstrap tool with role-scaling and token budget. Summary table populated from extractive backend. Temporal weighting by initiative status. Staleness propagation (flag-based, lazy regeneration). `get_summary` returns summaries at file/initiative level with stale flag and changed-file list.

**Session 5: `query_related` + Clustering.** Relationship explorer with 3 modes: explicit (edge traversal), emergent (high-similarity, no explicit edge), creative (high similarity + high graph distance). `inferred_edges` table populated from embedding similarity. Simple pairwise clustering (agglomerative, not HDBSCAN — use the simpler algorithm that works at current scale, upgrade path to HDBSCAN documented).

**Session 6: Git Hook + File Watcher + Studio Config.** Post-commit hook for automatic sync. Chokidar watcher for `pnpm dev` with debounce (500ms) and single-writer enforcement (sync process writes, MCP tools read-only — premortem mitigation). Studio Settings page showing backend configuration and capability indicators. Backend/capabilities fields in all MCP tool responses.

## Rabbit Holes

**1. FTS5 external content mode.** The stress test proved `INSERT OR REPLACE` with `content='files'` corrupts the FTS index (refuted assumption A6). **Avoidance:** Standalone FTS5 table. Explicit DELETE + INSERT in sync pipeline. Never REPLACE. Regression test: insert, modify, re-sync, search.

**2. HDBSCAN implementation.** No production-quality TypeScript library exists. A worker could burn a session implementing condensed tree extraction and cluster stability scoring from scratch. **Avoidance:** Use simple agglomerative clustering with a distance threshold in session 5. Document the HDBSCAN upgrade path for when the corpus exceeds 500 initiatives. Don't build a custom HDBSCAN.

**3. Chokidar + git operation race conditions.** Chokidar fires on partial writes during `git checkout`, double-fires on commit (hook + watcher), and loses edges on file rename (DELETE + ADD as separate events). **Avoidance:** Single-writer architecture. The sync process is the only writer. Debounce at 500ms. On git operations, prefer the git hook path (processes complete files) over the watcher path. If both fire, the second sync is a no-op (hash unchanged).

**4. TF-IDF threshold tuning.** Stress test showed average similarity is 0.05 with max 0.32. A worker tuning `query_related` thresholds could waste time trying to find a "right" cutoff. **Avoidance:** Use rank-based retrieval exclusively. "Top-K most similar" not "similarity > X". The threshold problem doesn't exist with rank-based retrieval.

**5. Summary regeneration cascade.** File changes mark summaries stale → initiative summary stale → cluster stale → portfolio stale. Eager regeneration of the full cascade on every file change would be expensive and unnecessary. **Avoidance:** Staleness propagates instantly (flag flip). Regeneration is lazy (on-demand or background sweep). Only regenerate what's queried.

**6. Schema migration runner.** The database is derived and disposable. Schema version tracking exists for forward compatibility, but a full migration system (up/down, rollback) is unnecessary when `pnpm sync:db` rebuilds from scratch. **Avoidance:** Version check in `applySchema()`. If schema is outdated, drop and recreate. No migration runner.

## No-Gos

- **No `better-sqlite3` abstraction layer.** `node:sqlite` is verified working. Don't build a driver-agnostic adapter unless forced by a Node upgrade. If `sqlite-agentic-state` lands with `better-sqlite3`, align at that point.
- **No write-through projection.** `projectToMarkdown()` is future scope for enterprise deployment. The knowledge engine is read-path only for this initiative.
- **No ollama/api/dispatch backend implementations.** The `KnowledgeBackend` interface has slots for them. The implementations are separate initiatives. Only `AlgorithmicBackend` is built.
- **No Studio UI beyond Settings page.** No knowledge graph visualization, no search UI, no summary browser. The MCP tools are the interface.
- **No custom HDBSCAN.** Use agglomerative clustering. Document the upgrade path.

## Kill Criteria

1. **Session 1 technical gate.** If `pnpm sync:db` fails to index the full corpus or FTS5 returns irrelevant results for basic queries, stop and debug before session 2.

2. **Claude Code native indexing.** If Claude Code announces project indexing or semantic search features at any point during the 6 sessions, pause and assess whether to continue or retire gracefully.

3. **Driver alignment.** If `sqlite-agentic-state` lands with an incompatible driver choice before session 3, align before proceeding. Don't build on a fractured foundation.

4. **TF-IDF signal check (session 3).** After the algorithmic backend is built, verify that the top-5 most similar initiatives for any given initiative include at least 2 obviously related ones (matching frontmatter dependencies/informs). If not, TF-IDF signal is insufficient — consider fast-tracking an Ollama backend.

5. **Session budget.** If any single session takes more than 1.5x its planned scope (e.g., session 3 consuming what should be sessions 3+4), stop and reassess whether the remaining scope fits the appetite.
