---
status: integrated
initiative: semantic-knowledge-engine
created: 2026-03-16
updated: '2026-03-16'
type: new-plan
risk: structural
targets:
  - packages/studio-core/src/db/               # (new directory)
  - packages/studio-core/src/knowledge/         # (new directory)
  - packages/studio-core/src/config/types.ts
  - packages/studio-core/src/process-nodes-shared.ts
  - packages/studio-mcp/src/server.ts
dependencies: []
informs:
  - mcp-coordination-layer
  - studio-desktop-app
personas:
  - engineer
spawned-from: null
---

# Semantic Knowledge Engine

## Summary

Build a SQLite-backed knowledge index with pluggable embedding/summary backends that gives agents truthful, context-efficient access to system state at any scale. The engine serves five types of truth (scope, neighborhood, system, emergent, creative) through 4 MCP tools, using a 4-level summary hierarchy (file, initiative, cluster, portfolio) to compress thousands of markdown files into the right zoom level for each agent's role. Markdown files remain canonical; SQLite is a derived index that can be rebuilt from the filesystem or used to reconstruct markdown in the other direction.

## State Snapshot

Sherpa currently has 479 markdown files across 149 initiative directories with 76 explicit relationship edges across 40 proposals. All querying is O(n) filesystem scans via `studio-core/src/domain.ts` — `getInitiatives()` reads every `proposal.md` on every call. The in-memory graph in `process-nodes-shared.ts` extracts 5 edge types (parent-of, child-of, workstream-of, depends-on, targets) but has no persistent index, no transitive closure, and no inferred relationships.

At target operating capacity — 4 concurrent Claude Code sessions with sub-agents, generating hundreds of files daily — agents cannot get a truthful picture of system state without loading the entire corpus into context. There is no full-text search, no semantic similarity, no summary hierarchy, and no way for an agent to discover connections the frontmatter doesn't explicitly declare.

The `sqlite-agentic-state` initiative (pending) proposes 3 SQLite databases; this initiative absorbs and extends the `sherpa-meta.db` portion with embeddings, summaries, and clustering. The `mcp-coordination-layer` (approved) handles write coordination; this initiative provides the complementary read path. Together they compose into a complete state layer.

## Proposed Changes

### Target: `packages/studio-core/src/db/` (new directory)

SQLite access layer — single database file in WAL mode.

**Schema — 5 tables:**
- `files` — Every markdown file: path (PK), content_hash, content (full text), frontmatter (JSON), title, kind, initiative slug, status, updated_at. Enables bidirectional reconstruction (markdown to SQLite and back).
- `edges` — Explicit relationships from frontmatter: source, target, kind (depends-on, informs, spawned-from, targets, parent-of). Unique constraint on (source, target, kind).
- `summaries` — Multi-level summaries: id, level (file/initiative/cluster/portfolio), parent_id, summary text, stale flag, updated_at. Temporal weighting by initiative status for parent roll-ups.
- `embeddings` — Vector storage via sqlite-vec: id, embedding vector (384-dim for MiniLM or TF-IDF dimension). Shared PK space with summaries and files.
- `inferred_edges` — Embedding-similarity-derived relationships: source, target, similarity score, kind (semantic-neighbor, cross-pollination-candidate), created_at.
- `clusters` — Auto-formed groupings: cluster_id, label, member initiative slugs (JSON), centroid vector, updated_at.

**Sync pipeline — 3 triggers:**
- `syncFromFilesystem()` — Full rebuild from `docs/`. Hashes every file, skips unchanged (content_hash match). Used for cold start and recovery.
- Git post-commit hook — Diffs changed `.md`/`.json` files, queues for reprocessing. Catches all committed changes.
- Chokidar file watcher — Sub-second freshness during `pnpm dev`. Debounced at 500ms.

**Projection function:**
- `projectToMarkdown(row)` — Renders a SQLite row back to markdown (frontmatter + body sections). Enables bidirectional reconstruction and future enterprise write-through (Studio UI writes to SQLite, projects to files, auto-commits git).

### Target: `packages/studio-core/src/knowledge/` (new directory)

Pluggable backend interface for embeddings and summaries.

**Interface:**
- `KnowledgeBackend` — Two methods: `embed(text): number[]` and `summarize(text, maxTokens): string`.
- `AlgorithmicBackend` — Zero-dependency default. TF-IDF vectors for embeddings (term frequency, cosine similarity). Extractive summaries from markdown structure (title + frontmatter status + first sentence of each H2 section). Effective for 70-80% of use cases given Sherpa's consistent vocabulary conventions.
- Backend implementations for `ollama`, `api`, and `dispatch` are out of scope for this initiative but the interface supports them. Configuration slots exist from day one.

**Clustering:**
- HDBSCAN (density-based, no predetermined K) for grouping initiative-level embeddings into natural clusters. Membership recalculates periodically (hourly or on-demand), not on every file change.

### Target: `packages/studio-core/src/config/types.ts`

Add `KnowledgeConfig` to `SherpaUserConfig`:

```typescript
interface KnowledgeConfig {
  backend?: 'algorithmic' | 'ollama' | 'api' | 'dispatch'
  ollama?: { host: string }
  api?: { provider: 'anthropic' | 'openai' | 'voyage'; model?: string }
  dbPath?: string  // default: .sherpa/knowledge.db
}
```

### Target: `packages/studio-core/src/process-nodes-shared.ts`

Extend `EdgeType` with `'informs'` and `'semantic-neighbor'` to support both explicit `informs:` frontmatter edges and inferred similarity edges in the graph model.

### Target: `packages/studio-mcp/src/server.ts`

Add 4 MCP tools to the existing server:

- **`get_context`** — Session bootstrap. Input: role, optional initiative slug, optional max_tokens budget. Output: scope summary + neighborhood edges + system overview + alerts, scaled by role (Workers get deep scope/shallow system, Planners get deep system/shallow scope). Includes `backend` and `capabilities` fields so the agent knows what level of truth is available.
- **`query_related`** — Relationship explorer with 3 modes. `explicit`: frontmatter edges at configurable depth. `emergent`: high-similarity pairs with no explicit edge (unlinked clusters). `creative`: high similarity + high graph distance (cross-pollination candidates). Returns `bridge_concept` and `suggestion` for emergent/creative modes.
- **`search_knowledge`** — Hybrid search. Three modes: `text` (FTS5), `semantic` (embedding similarity), `hybrid` (reciprocal rank fusion). Default: hybrid.
- **`get_summary`** — Summary at any level with freshness guarantee. Returns cached summary + stale flag + list of changed files since last generation. Optional `refresh: true` for synchronous regeneration.

## Rationale

The core problem: at operating capacity, Sherpa generates more markdown than any single agent can read. Without a compression and query layer, agents either work with incomplete information or burn context window on irrelevant files. This is the D problem — context efficiency.

The SQLite + embedding architecture is proven. Obsidian, Notion, and every modern knowledge tool uses a derived index over canonical content. The novel contribution is the 5-truth model (scope, neighborhood, system, emergent, creative) and the role-scaled bootstrap that gives each agent exactly the zoom level it needs.

The pluggable backend with algorithmic default means this works today on any machine with zero dependencies. Semantic backends are an upgrade path, not a requirement. The algorithmic backend's TF-IDF approach is effective for Sherpa's corpus because the governance conventions enforce consistent vocabulary — the same terms appear across related initiatives.

Bidirectional reconstruction (markdown to SQLite and back) is not just for backup. It's architecturally load-bearing for enterprise deployment where non-technical users interact through Studio UI and never see files directly. The UI writes to SQLite, the projection function generates markdown, git auto-commits behind the scenes.

## Dependencies

None as hard gates. This initiative creates its own DB infrastructure (WAL config, connection factory) at `packages/studio-core/src/db/` and can proceed independently.

**Coordination points (non-blocking):**
- **`sqlite-agentic-state`** — This initiative absorbs the `sherpa-meta.db` scope from that proposal and extends it with embeddings, summaries, and clustering. The coordination and events databases remain in sqlite-agentic-state's scope. Both initiatives target `packages/studio-core/src/db/` — whichever lands first establishes the connection factory pattern; the other adopts it. Driver choice (node:sqlite vs better-sqlite3) should align.
- **`mcp-coordination-layer`** — Our read-path tools (get_context, query_related, search_knowledge, get_summary) compose with their write-path authority tools. Complementary halves of the state layer, no blocking dependency in either direction.

## Review Notes

- **sqlite-vec availability** — Required for vector storage. Available as a loadable extension. If it proves problematic, TF-IDF vectors can be stored as JSON blobs with application-level cosine similarity (slower but functional).
- **HDBSCAN in TypeScript** — Limited ecosystem. At current scale (40-100 initiatives), naive pairwise similarity with single-linkage clustering works. HDBSCAN matters at 500+ initiatives. Can start simple and upgrade.
- **Summary generation with algorithmic backend** — Extractive summaries are less polished than LLM-generated ones. The stale-but-honest pattern mitigates this: agents always know the summary quality and can request raw file content when needed.
- **Temporal weighting** — Summaries weight by status and recency (in-progress: full, integrated < 2 weeks: moderate, integrated > 2 weeks: mention only, archived: excluded). Prevents portfolio summary from filling with historical noise.
- **Backend discoverability** — Studio Settings page must show current backend with capabilities indicator. MCP tool responses must include backend/capabilities fields. Tools requiring semantic backend return explicit messages when running on algorithmic, not silent degradation.

**Effort:** 6 sessions
**Session breakdown:**
- Session 1: SQLite schema, files + edges tables, full-rebuild sync pipeline, `pnpm sync:db` command
- Session 2: FTS5 full-text search, `search_knowledge` MCP tool (text mode only)
- Session 3: Pluggable backend interface, algorithmic backend (TF-IDF + extractive summaries), embeddings + summaries tables
- Session 4: `get_context` and `get_summary` MCP tools with role-scaling and token budgets
- Session 5: `query_related` MCP tool (explicit + emergent + creative modes), inferred_edges table, clustering
- Session 6: Git hook + file watcher integration, staleness propagation, Studio Settings page for backend configuration
