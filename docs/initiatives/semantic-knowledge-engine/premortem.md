---
premortem: 2026-03-16
failure-modes-identified: 7
mitigations-added: 7
kill-criteria-added: 4
---

# Pre-mortem: Semantic Knowledge Engine

## Frame

It's June 2026. The Semantic Knowledge Engine consumed 6 sessions and delivered nothing usable. Agents still Grep and Read their way through markdown files. The `.sherpa/knowledge.db` file exists but nobody queries it. The 4 MCP tools get fewer than 5 calls per week. What happened?

## Ranked Failure Modes

### 1. FTS5 Content Sync Corruption on File Update

**Likelihood:** High | **Severity:** Fatal

The sync pipeline uses `INSERT OR REPLACE` to upsert file records. When FTS5 is configured with `content='files'` (external content table), SQLite handles `REPLACE` as DELETE + INSERT, which assigns a new rowid. The FTS index retains a phantom entry pointing to the old rowid. Subsequent FTS queries that match the phantom row crash with `fts5: missing row N from content table`. The bug only manifests on the *second* sync of any file — first inserts work fine, masking the issue in basic tests.

**Early detection:** `search_knowledge` MCP tool returns errors intermittently after file edits. Works on fresh databases, fails after re-sync.

**Mitigation:** Don't use FTS5 external content mode (`content='files'`). Use a standalone FTS5 table with explicit DELETE + INSERT in the sync pipeline. Alternatively, issue `INSERT INTO files_fts(files_fts) VALUES('rebuild')` after every sync batch. Add a regression test: insert file, sync, modify file, re-sync, search — verify no corruption.

---

### 2. Agents Don't Need the Index at Current Scale

**Likelihood:** High | **Severity:** Fatal

At 480 files across 41 initiative directories, agents work effectively with Grep for discovery and Read for depth. `getInitiatives()` scanning 41 directories takes milliseconds. The problem SEK solves — "agents can't get truthful context without loading the corpus" — is projected at "operating capacity" (4 sessions, hundreds of files daily), not the current reality. If the corpus stabilizes at 500-800 files, the compression layer is overhead with no user.

**Early detection:** After session 2 ships `search_knowledge`, track call frequency across the next 10 agent sessions. If agents continue to use Grep/Read instead of the MCP tool, the index has no demand.

**Mitigation:** Add a **demand gate** to the session-2 validation: the `search_knowledge` tool must be called at least 10 times across 5 agent sessions before unlocking sessions 3-6. If agents don't reach for it, stop. Alternatively, make SEK's value testable by running a session with and without the tool and comparing context efficiency.

---

### 3. Claude Code Ships Native Knowledge Indexing

**Likelihood:** High | **Severity:** Fatal

Anthropic's trajectory is clear: worktrees, tasks, Agent Teams, hooks, subagents — all shipped within months. The 16-agent C compiler project demonstrated the exact scaling problem SEK solves. A native project indexing feature with semantic search is a natural next step. If Claude Code ships it, SEK's value proposition is delivered for free by the platform with deeper integration and automatic updates.

**Early detection:** Claude Code changelog mentions "project indexing," "semantic search," "knowledge graph," "context engine," or "workspace knowledge." Also watch for Glob/Grep gaining ranking or relevance capabilities.

**Mitigation:** Weekly changelog scan. If any signal appears, freeze sessions 3-6 and reassess. Sessions 1-2 retain value as a standalone queryable index regardless. Accept that SEK may become obsolete and design for graceful retirement — the database is derived and deletable.

---

### 4. TF-IDF Collapse on Governance-Enforced Vocabulary

**Likelihood:** High | **Severity:** Significant

Sherpa's governance conventions enforce consistent vocabulary: "behavioral," "governance," "initiative," "dispatch," "pipeline," "studio," "agent" appear in nearly every document. TF-IDF relies on term discrimination — terms that appear in few documents are informative. When core domain terms appear everywhere, their IDF drops to zero, leaving only incidental word choices for differentiation. Pairwise similarity scores collapse to near-random.

**Early detection:** After session 3 implements TF-IDF, compute pairwise similarity for all initiatives. If the top-10 most similar pairs to `semantic-knowledge-engine` don't include obviously related initiatives (`sqlite-agentic-state`, `mcp-coordination-layer`), the signal is noise.

**Mitigation:** Use BM25 (FTS5's built-in scoring) instead of raw TF-IDF for initial similarity. BM25 handles term saturation better. Or apply domain-specific stopword filtering (remove governance boilerplate terms before computing vectors). If algorithmic approaches fail, this becomes the forcing function for an Ollama/API embedding backend.

---

### 5. Write Contention Across 4 Concurrent Sessions

**Likelihood:** High | **Severity:** Significant

4 concurrent Claude Code sessions, each with MCP connections to the same `knowledge.db`. WAL mode allows concurrent reads but serializes writes. `DatabaseSync` is synchronous — a blocked write hangs the entire Node process including the MCP server's HTTP transport. With `busy_timeout=5000`, the MCP server becomes unresponsive for 5 seconds. With low timeout, writes fail.

**Early detection:** Intermittent "database is locked" errors in MCP tool responses. MCP tools that normally respond in <50ms occasionally take 5+ seconds.

**Mitigation:** The sync pipeline is the only writer. Make it run in a **separate process** (the `pnpm sync:db` script already does this). MCP tools are read-only — they never write. If only one process writes (the sync daemon or git hook process) and all MCP server processes only read, there is no write contention. This is a design constraint to enforce, not a bug to fix.

---

### 6. Three-DB Architecture Driver Disagreement

**Likelihood:** High | **Severity:** Significant

The mcp-coordination-layer proposal specifies `better-sqlite3` + Drizzle ORM. SEK uses `node:sqlite` + raw SQL. sqlite-agentic-state says "node:sqlite." If these initiatives land at different times with different driver choices, `packages/studio-core/src/db/` becomes a Frankenstein of incompatible patterns. The stake dismissed this as "~20 lines of PRAGMA configuration" but the API surface mismatch is larger.

**Early detection:** sqlite-agentic-state starts implementation and chooses a different driver. Multiple connection factories appear in the db/ directory.

**Mitigation:** Before starting session 1, align driver choice with sqlite-agentic-state. Both target `node:sqlite`. If mcp-coordination-layer insists on `better-sqlite3`, abstract the connection factory behind a driver-agnostic interface (the ~20 lines become ~50 lines of adapter). Decide once, share the decision across all three initiatives.

---

### 7. Five Truths Model Doesn't Match Agent Behavior

**Likelihood:** High | **Severity:** Significant

The five types of truth (scope, neighborhood, system, emergent, creative) are an intellectual taxonomy designed top-down, not derived from observed agent failures. No agent has ever requested "neighborhood truth" or "cross-pollination candidates." The taxonomy shapes the tool interfaces (`get_context` with role-scaling, `query_related` with three modes) in ways that may feel unnatural to agents that think in terms of "find me X" and "what's related to Y."

**Early detection:** When implementing `get_context` role-scaling (session 4), the distinction between "deep scope / shallow system" for Workers and "deep system / shallow scope" for Planners will feel arbitrary. If the implementer can't write clear logic for the scaling, the taxonomy doesn't have natural boundaries.

**Mitigation:** Build the tools with simple, agent-friendly interfaces first. `search_knowledge` is just search — no truth type needed. `get_summary` is just "summarize this thing at this level." The five-truth framework can inform the design without being exposed in the tool API. If agents naturally discover and use the tools, the taxonomy is validated. If not, the tools work without it.

---

## Mitigations Summary

| # | Failure Mode | Mitigation |
|---|---|---|
| 1 | FTS5 corruption | Use standalone FTS5 table, explicit DELETE+INSERT, add regression test for re-sync |
| 2 | No demand | Add demand gate: 10+ calls across 5 sessions before unlocking sessions 3-6 |
| 3 | Claude Code ships native | Weekly changelog scan, freeze 3-6 on signal, design for graceful retirement |
| 4 | TF-IDF collapse | Use BM25 scoring, domain stopwords, or fast-track embedding backend |
| 5 | Write contention | Enforce single-writer architecture: only sync process writes, MCP tools read-only |
| 6 | Driver disagreement | Align with sqlite-agentic-state before session 1, abstract if needed |
| 7 | Five truths mismatch | Build simple tool interfaces, don't expose the taxonomy in the API |

## Updates to Stake

### New Kill Criteria (added)

4. **Demand gate failure.** If `search_knowledge` receives fewer than 10 calls across 5 agent sessions after session 2 ships, the index has no organic demand. Stop before committing sessions 3-6.

5. **Claude Code ships native indexing.** If Claude Code changelog announces project indexing, semantic search, or knowledge graph features before sessions 3-6 begin, freeze the initiative and reassess whether to continue.

6. **Context window doubling.** If Claude's context window doubles (to 2M+) before sessions 3-6, re-evaluate whether the compression layer is still necessary. The summary hierarchy loses its forcing function at larger windows.

7. **Driver alignment failure.** If sqlite-agentic-state lands with `better-sqlite3` and the connection factory pattern is incompatible, resolve before starting session 3. Don't build on a fractured foundation.

### Updated Leading Indicators

Add to the session-2 validation gate:
- **Demand check:** Track `search_knowledge` call frequency across next 5 agent sessions
- **Context check:** Scan Claude Code changelog for knowledge/indexing features
- **Ecosystem check:** Check if any MCP knowledge-graph server has gained traction

### Gap Analysis

The original stake's kill criteria were entirely technical: WAL failure, sync performance, FTS5 quality. The pre-mortem reveals that **the biggest risks are demand-side and context-side, not technical.** The technology probably works. The question is whether anyone needs it at current scale and whether the platform will solve the problem natively before sessions 3-6 deliver value.

## Human-Identified Risks

*(This section is intentionally left empty. The human should fill this with risks that AI cannot see: team dynamics, political considerations, opportunity costs, competing priorities, personal bandwidth constraints.)*
