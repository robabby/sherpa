# Semantic Knowledge Engine — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a queryable knowledge index with full-text search, TF-IDF embeddings, summary hierarchy, 4 MCP tools, and automatic clustering — giving agents truthful, context-efficient access to system state at any scale.

**Architecture:** SQLite database (`.sherpa/knowledge.db`) in WAL mode via `better-sqlite3`, sharing the connection factory from `@sherpa/studio-core/db`. Standalone FTS5 for full-text search (not external content mode — stress test A6). Pluggable `KnowledgeBackend` interface with algorithmic default (TF-IDF + extractive summaries). 4 MCP tools added to `packages/studio-mcp/src/server.ts`. Rank-based retrieval for similarity (top-K, not threshold-based — stress test A7).

**Tech Stack:** better-sqlite3, gray-matter, vitest, @modelcontextprotocol/sdk, zod

---

## Completed: Sessions 1-2

### Session 1: SQLite Index + Sync Pipeline (DONE)

Committed as `20b6642`. Created:
- `packages/studio-core/src/db/knowledge-schema.ts` — files, edges, FTS5, schema_version
- `packages/studio-core/src/db/classify.ts` — file classifier, edge extractor, content hashing
- `packages/studio-core/src/db/knowledge-sync.ts` — filesystem → SQLite sync with hash-based skip
- `packages/studio-core/src/db/__tests__/classify.test.ts` — 13 tests
- `packages/studio-core/src/db/__tests__/knowledge.test.ts` — 11 tests
- `scripts/sync-knowledge-db.mjs` — `pnpm sync:db` CLI

Modified: `db/types.ts` (added knowledge path), `db/connection.ts` (added knowledge.db), `db/index.ts` (exports), `package.json` (sync:db script), `.gitignore` (.sherpa/)

Performance: 507 files in 733ms (first sync), 36ms re-sync, 254 edges, 18MB DB.

### Session 2: FTS5 Search + Summary MCP Tools (DONE)

Committed as `7414c84`. Added to `packages/studio-mcp/src/server.ts`:
- `search_knowledge` — FTS5 BM25 search with kind/initiative filters, snippet extraction, 3 modes (text functional, semantic/hybrid stubbed)
- `get_summary` — structured metadata for file path or initiative slug, includes edges

Added `@sherpa/studio-core` as workspace dependency of `@sherpa/studio-mcp`.

---

## Session 3: Pluggable Backend + Algorithmic TF-IDF

### Task 1: KnowledgeBackend interface + AlgorithmicBackend

**Files:**
- Create: `packages/studio-core/src/knowledge/types.ts`
- Create: `packages/studio-core/src/knowledge/algorithmic.ts`
- Create: `packages/studio-core/src/knowledge/index.ts`
- Test: `packages/studio-core/src/db/__tests__/algorithmic.test.ts`

**Step 1: Write the failing test**

```typescript
// packages/studio-core/src/db/__tests__/algorithmic.test.ts
import { describe, it, expect } from "vitest"
import { AlgorithmicBackend } from "../../knowledge/algorithmic"

describe("AlgorithmicBackend", () => {
  const backend = new AlgorithmicBackend()

  describe("embed", () => {
    it("returns a numeric vector", () => {
      const vec = backend.embed("hello world")
      expect(Array.isArray(vec)).toBe(true)
      expect(vec.length).toBeGreaterThan(0)
      expect(vec.every(v => typeof v === "number")).toBe(true)
    })

    it("returns consistent vectors for same input", () => {
      const v1 = backend.embed("hello world")
      const v2 = backend.embed("hello world")
      expect(v1).toEqual(v2)
    })

    it("returns different vectors for different input", () => {
      const v1 = backend.embed("sqlite database")
      const v2 = backend.embed("react component")
      expect(v1).not.toEqual(v2)
    })
  })

  describe("summarize", () => {
    it("extracts title and status from markdown with frontmatter", () => {
      const md = "---\nstatus: approved\n---\n\n# My Initiative\n\n## Summary\n\nThis does things.\n\n## Rationale\n\nBecause reasons."
      const summary = backend.summarize(md, 200)
      expect(summary).toContain("My Initiative")
      expect(summary).toContain("approved")
    })

    it("respects maxTokens by truncating", () => {
      const md = "# Title\n\n## Summary\n\n" + "word ".repeat(500)
      const short = backend.summarize(md, 50)
      expect(short.length).toBeLessThan(300) // rough token-to-char
    })

    it("handles markdown without frontmatter", () => {
      const md = "# Just a Title\n\nSome content here."
      const summary = backend.summarize(md, 200)
      expect(summary).toContain("Just a Title")
    })
  })

  describe("cosineSimilarity", () => {
    it("returns 1.0 for identical vectors", () => {
      const v = backend.embed("hello world")
      expect(backend.cosineSimilarity(v, v)).toBeCloseTo(1.0, 5)
    })

    it("returns higher similarity for related content", () => {
      const v1 = backend.embed("sqlite database WAL mode concurrent")
      const v2 = backend.embed("sqlite agentic state store database")
      const v3 = backend.embed("react component button accessibility")
      const simRelated = backend.cosineSimilarity(v1, v2)
      const simUnrelated = backend.cosineSimilarity(v1, v3)
      expect(simRelated).toBeGreaterThan(simUnrelated)
    })
  })

  describe("buildCorpusIndex", () => {
    it("allows embedding relative to a corpus", () => {
      const docs = [
        { id: "a", text: "sqlite database WAL mode" },
        { id: "b", text: "react component button style" },
        { id: "c", text: "sqlite agentic state coordination" },
      ]
      backend.buildCorpusIndex(docs)
      const va = backend.embedWithCorpus("a")
      const vb = backend.embedWithCorpus("b")
      const vc = backend.embedWithCorpus("c")
      expect(va).toBeDefined()
      expect(backend.cosineSimilarity(va!, vc!)).toBeGreaterThan(backend.cosineSimilarity(va!, vb!))
    })
  })
})
```

**Step 2: Run test to verify it fails**

Run: `cd packages/studio-core && pnpm exec vitest run src/db/__tests__/algorithmic.test.ts`
Expected: FAIL — module not found

**Step 3: Write the types**

```typescript
// packages/studio-core/src/knowledge/types.ts

/** Pluggable backend for embeddings and summaries. */
export interface KnowledgeBackend {
  /** Embed a text string into a numeric vector. */
  embed(text: string): number[]

  /** Generate an extractive summary of markdown content. */
  summarize(text: string, maxTokens: number): string

  /** Compute cosine similarity between two vectors. */
  cosineSimilarity(a: number[], b: number[]): number

  /**
   * Build a TF-IDF corpus index from a set of documents.
   * After calling this, embedWithCorpus() returns IDF-weighted vectors.
   */
  buildCorpusIndex(docs: Array<{ id: string; text: string }>): void

  /** Embed using the corpus IDF weights. Returns null if id not in corpus. */
  embedWithCorpus(id: string): number[] | null
}
```

**Step 4: Write the AlgorithmicBackend implementation**

```typescript
// packages/studio-core/src/knowledge/algorithmic.ts
import matter from "gray-matter"
import type { KnowledgeBackend } from "./types"

/**
 * Zero-dependency algorithmic backend: TF-IDF vectors + extractive summaries.
 * Effective for 70-80% of use cases on governance corpora with consistent vocabulary.
 */
export class AlgorithmicBackend implements KnowledgeBackend {
  private corpusDf = new Map<string, number>()
  private corpusN = 0
  private corpusDocs = new Map<string, Map<string, number>>()

  embed(text: string): number[] {
    const tf = this.termFrequency(this.tokenize(text))
    // Without corpus, return raw TF vector (normalized)
    return this.normalizeVector(Object.values(Object.fromEntries(tf)))
  }

  summarize(text: string, maxTokens: number): string {
    // Extract frontmatter
    let status: string | null = null
    let body = text
    try {
      const parsed = matter(text)
      if (parsed.data?.status) status = String(parsed.data.status)
      body = parsed.content
    } catch { /* use raw text */ }

    // Extract title (first H1)
    const titleMatch = body.match(/^#\s+(.+)$/m)
    const title = titleMatch?.[1]?.trim() ?? null

    // Extract first sentence from each H2 section
    const sections: string[] = []
    const h2Regex = /^##\s+(.+)$/gm
    let match
    while ((match = h2Regex.exec(body)) !== null) {
      const sectionName = match[1]!.trim()
      const afterHeading = body.slice(match.index + match[0].length)
      const nextH2 = afterHeading.search(/^##\s/m)
      const sectionBody = (nextH2 > -1 ? afterHeading.slice(0, nextH2) : afterHeading).trim()
      const firstSentence = sectionBody.match(/^[^\n]+/)?.[0]?.trim()
      if (firstSentence && firstSentence.length > 10) {
        sections.push(`${sectionName}: ${firstSentence}`)
      }
    }

    // Assemble summary
    const parts: string[] = []
    if (title) parts.push(title)
    if (status) parts.push(`[${status}]`)
    parts.push(...sections)

    let summary = parts.join(" — ")

    // Rough truncation (4 chars per token approximation)
    const maxChars = maxTokens * 4
    if (summary.length > maxChars) {
      summary = summary.slice(0, maxChars - 3) + "..."
    }

    return summary
  }

  cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length || a.length === 0) return 0
    let dot = 0, magA = 0, magB = 0
    for (let i = 0; i < a.length; i++) {
      dot += a[i]! * b[i]!
      magA += a[i]! * a[i]!
      magB += b[i]! * b[i]!
    }
    const denom = Math.sqrt(magA) * Math.sqrt(magB)
    return denom === 0 ? 0 : dot / denom
  }

  buildCorpusIndex(docs: Array<{ id: string; text: string }>): void {
    this.corpusDf.clear()
    this.corpusDocs.clear()
    this.corpusN = docs.length

    for (const doc of docs) {
      const tokens = this.tokenize(doc.text)
      const tf = this.termFrequency(tokens)
      this.corpusDocs.set(doc.id, tf)

      // Count document frequency
      for (const term of tf.keys()) {
        this.corpusDf.set(term, (this.corpusDf.get(term) ?? 0) + 1)
      }
    }
  }

  embedWithCorpus(id: string): number[] | null {
    const tf = this.corpusDocs.get(id)
    if (!tf) return null

    // Build TF-IDF vector using shared vocabulary
    const allTerms = Array.from(this.corpusDf.keys()).sort()
    const vec = allTerms.map(term => {
      const termTf = tf.get(term) ?? 0
      const df = this.corpusDf.get(term) ?? 0
      const idf = Math.log((this.corpusN + 1) / (df + 1))
      return termTf * idf
    })

    return this.normalizeVector(vec)
  }

  // --- internals ---

  private tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, " ")
      .split(/\s+/)
      .filter(t => t.length >= 3)
  }

  private termFrequency(tokens: string[]): Map<string, number> {
    const tf = new Map<string, number>()
    for (const token of tokens) {
      tf.set(token, (tf.get(token) ?? 0) + 1)
    }
    // Normalize by document length
    const len = tokens.length || 1
    for (const [term, count] of tf) {
      tf.set(term, count / len)
    }
    return tf
  }

  private normalizeVector(vec: number[]): number[] {
    const mag = Math.sqrt(vec.reduce((sum, v) => sum + v * v, 0))
    return mag === 0 ? vec : vec.map(v => v / mag)
  }
}
```

```typescript
// packages/studio-core/src/knowledge/index.ts
export type { KnowledgeBackend } from "./types"
export { AlgorithmicBackend } from "./algorithmic"
```

**Step 5: Run test to verify it passes**

Run: `cd packages/studio-core && pnpm exec vitest run src/db/__tests__/algorithmic.test.ts`
Expected: PASS

**Step 6: Add package.json export + typecheck**

In `packages/studio-core/package.json`, add to `exports`:
```json
"./knowledge": "./src/knowledge/index.ts"
```

Run: `pnpm check`
Expected: PASS

**Step 7: Commit**

```bash
git add packages/studio-core/src/knowledge/ packages/studio-core/src/db/__tests__/algorithmic.test.ts packages/studio-core/package.json
git commit -m "feat(knowledge-engine): pluggable KnowledgeBackend interface with AlgorithmicBackend (TF-IDF + extractive)"
```

---

### Task 2: KnowledgeConfig in sherpa.config.ts

**Files:**
- Modify: `packages/studio-core/src/config/types.ts`
- Modify: `packages/studio-core/src/config/defaults.ts`
- Modify: `packages/studio-core/src/config/schema.ts`

**Step 1: Add KnowledgeConfig type**

Add to `packages/studio-core/src/config/types.ts`:

```typescript
export interface KnowledgeConfig {
  /** Knowledge backend type. Defaults to 'algorithmic'. */
  backend?: "algorithmic" | "ollama" | "api" | "dispatch"
  /** Ollama server config (when backend='ollama'). */
  ollama?: { host: string }
  /** API config (when backend='api'). */
  api?: { provider: "anthropic" | "openai" | "voyage"; model?: string }
  /** Database path override. Defaults to .sherpa/knowledge.db */
  dbPath?: string
}
```

Add `knowledge?: KnowledgeConfig` to `SherpaUserConfig` and `knowledge: Required<KnowledgeConfig>` to `SherpaConfig`.

**Step 2: Add defaults and schema validation**

In `defaults.ts`, add default knowledge config:
```typescript
knowledge: {
  backend: "algorithmic",
  ollama: { host: "http://localhost:11434" },
  api: { provider: "anthropic", model: undefined },
  dbPath: undefined,
}
```

In `schema.ts`, add zod validation for the knowledge config fields.

**Step 3: Typecheck**

Run: `pnpm check`
Expected: PASS

**Step 4: Commit**

```bash
git add packages/studio-core/src/config/
git commit -m "feat(knowledge-engine): add KnowledgeConfig to sherpa.config.ts"
```

---

### Task 3: Add embeddings table to schema + populate during sync

**Files:**
- Modify: `packages/studio-core/src/db/knowledge-schema.ts` — add summaries table (embeddings stored as JSON blobs for algorithmic backend; sqlite-vec deferred to when a semantic backend is configured)
- Modify: `packages/studio-core/src/db/knowledge-sync.ts` — after syncing files, compute embeddings for initiative proposals using the backend
- Test: `packages/studio-core/src/db/__tests__/knowledge.test.ts` — add embedding sync test

**Step 1: Add summaries table to schema**

Add to `SCHEMA_SQL` in `knowledge-schema.ts`:
```sql
-- Multi-level summaries with embeddings
CREATE TABLE IF NOT EXISTS summaries (
  id         TEXT PRIMARY KEY,
  level      TEXT NOT NULL,   -- 'file' | 'initiative' | 'cluster' | 'portfolio'
  parent_id  TEXT,
  summary    TEXT NOT NULL,
  embedding  TEXT,            -- JSON array of floats (algorithmic backend)
  stale      INTEGER NOT NULL DEFAULT 0,
  updated_at INTEGER NOT NULL
);

-- Inferred relationships from embedding similarity
CREATE TABLE IF NOT EXISTS inferred_edges (
  source     TEXT NOT NULL,
  target     TEXT NOT NULL,
  similarity REAL NOT NULL,
  kind       TEXT NOT NULL,   -- 'semantic-neighbor' | 'cross-pollination-candidate'
  created_at INTEGER NOT NULL,
  UNIQUE(source, target, kind)
);
```

Bump `KNOWLEDGE_SCHEMA_VERSION` to 2. In `applyKnowledgeSchema`, if version < 2, run the new DDL.

**Step 2: Extend sync to populate summaries for initiatives**

Add a `syncEmbeddings(db, backend, projectRoot)` function that:
1. Reads all initiative proposals from the `files` table
2. Builds a corpus index via `backend.buildCorpusIndex()`
3. For each initiative, computes embedding via `backend.embedWithCorpus()`
4. Generates extractive summary via `backend.summarize()`
5. Upserts into `summaries` table
6. Computes pairwise similarity for top-K pairs → inserts into `inferred_edges`

**Step 3: Test embedding sync**

Add test to `knowledge.test.ts` that:
1. Creates fixtures with 3 initiative proposals (related and unrelated topics)
2. Runs sync + embedding sync
3. Verifies summaries table has entries
4. Verifies inferred_edges has at least one entry
5. Verifies related initiatives have higher similarity than unrelated

**Step 4: Run tests**

Run: `cd packages/studio-core && pnpm test`
Expected: PASS

**Step 5: Commit**

```bash
git add packages/studio-core/src/db/ packages/studio-core/src/knowledge/
git commit -m "feat(knowledge-engine): summaries table, embedding sync, inferred edges"
```

---

### Task 4: Activate semantic + hybrid modes in search_knowledge

**Files:**
- Modify: `packages/studio-mcp/src/server.ts` — replace semantic stub with real embedding search, implement hybrid via reciprocal rank fusion

**Step 1: Implement semantic mode**

When `mode === "semantic"`:
1. Embed the query using the backend
2. Load all initiative embeddings from summaries table
3. Compute cosine similarity, return top-K

**Step 2: Implement hybrid mode**

Reciprocal rank fusion: run both FTS5 and semantic search, combine scores:
```
rrf_score = 1/(k + fts_rank) + 1/(k + semantic_rank)
```
where k=60 (standard RRF constant).

**Step 3: Add backend + capabilities to all MCP tool responses**

Every response includes:
```json
{
  "backend": "algorithmic",
  "capabilities": {
    "full_text_search": true,
    "semantic_similarity": true,
    "creative_discovery": true,
    "summary_quality": "extractive"
  }
}
```

**Step 4: Typecheck + test**

Run: `pnpm check && cd packages/studio-core && pnpm test`
Expected: PASS

**Step 5: Commit**

```bash
git add packages/studio-mcp/src/server.ts
git commit -m "feat(knowledge-engine): activate semantic + hybrid search modes with RRF"
```

---

## Session 4: get_context + Enhanced get_summary

### Task 5: Enhanced get_summary with summary hierarchy

**Files:**
- Modify: `packages/studio-mcp/src/server.ts` — enhance get_summary to return extractive summaries from the summaries table, with stale flag and changed-files list
- Modify: `packages/studio-core/src/db/knowledge-sync.ts` — add staleness propagation logic

**Step 1: Add `level` parameter to get_summary**

Extend get_summary to accept `level: "file" | "initiative" | "portfolio"`. When `level=initiative`, return the initiative's summary from the summaries table (not just raw file metadata). Include `stale` flag and list of files changed since last summary generation.

When `level=portfolio`, return all initiative summaries weighted by status:
- in-progress: full detail
- approved/pending: full detail
- integrated < 2 weeks: moderate (1 sentence)
- integrated > 2 weeks: mention only (title + status)
- archived: excluded

**Step 2: Add staleness tracking**

When a file's content_hash changes during sync, mark its parent initiative summary as stale (set `stale=1` in summaries where `id = initiative_slug`). When an initiative summary is regenerated, mark parent cluster/portfolio as stale.

**Step 3: Test + commit**

Run: `pnpm check && cd packages/studio-core && pnpm test`

```bash
git commit -m "feat(knowledge-engine): enhanced get_summary with hierarchy, staleness, temporal weighting"
```

---

### Task 6: get_context MCP tool

**Files:**
- Modify: `packages/studio-mcp/src/server.ts` — add get_context tool

**Step 1: Implement get_context**

Parameters:
- `role`: string (worker, planner, judge, researcher)
- `initiative?`: string (slug — narrows scope)
- `max_tokens?`: number (default varies by role)

Response structure:
```json
{
  "scope": "initiative summary if scoped, null otherwise",
  "neighborhood": "adjacent initiatives + shared targets",
  "system": "portfolio summary, blocked items, recent completions",
  "alerts": ["initiative X just landed changes to files you target"],
  "backend": "algorithmic",
  "capabilities": { ... }
}
```

Role scaling:
- Worker: deep scope (full initiative summary + all file titles), shallow system (status counts only), small token budget (1500)
- Planner: shallow scope (initiative titles only), deep system (full portfolio summary + blocked list + edge map), large token budget (3000)
- Judge: deep scope + neighborhood (initiative summary + all adjacent initiative summaries), medium token budget (2000)
- Researcher: deep scope + deep system (full everything), largest budget (4000)

**Step 2: Build the response from DB queries**

Scope: `SELECT * FROM summaries WHERE id = ? AND level = 'initiative'`
Neighborhood: `SELECT * FROM edges WHERE source = ? OR target = ?` + join with summaries
System: `SELECT * FROM summaries WHERE level = 'portfolio'` + `SELECT * FROM files WHERE status = 'blocked' OR status = 'in-progress'`
Alerts: `SELECT * FROM files WHERE updated_at > ? AND initiative IN (neighbor list)`

Truncate each section to fit within token budget using the role-specific allocation.

**Step 3: Test + commit**

Run: `pnpm check`

```bash
git commit -m "feat(knowledge-engine): add get_context MCP tool with role-scaled bootstrap"
```

---

## Session 5: query_related + Clustering

### Task 7: query_related MCP tool

**Files:**
- Modify: `packages/studio-mcp/src/server.ts` — add query_related tool

**Step 1: Implement query_related**

Parameters:
- `source`: string (initiative slug or file path)
- `mode`: "explicit" | "emergent" | "creative" (default: "explicit")
- `limit?`: number (default: 10)

Mode implementations:
- **explicit**: Traverse edges table at depth 1-2 hops. Return edges with source → target → kind.
- **emergent**: Query inferred_edges where similarity > threshold AND no explicit edge exists between the pair. These are high-similarity pairs that frontmatter doesn't declare.
- **creative**: Query inferred_edges where graph_distance(source, target) > 3 AND similarity is in top-K. These are semantically close but structurally far pairs.

For graph distance, use a BFS on the edges table (recursive CTE):
```sql
WITH RECURSIVE hops(node, depth) AS (
  VALUES(?, 0)
  UNION ALL
  SELECT CASE WHEN e.source = h.node THEN e.target ELSE e.source END, h.depth + 1
  FROM edges e JOIN hops h ON (e.source = h.node OR e.target = h.node)
  WHERE h.depth < 4
)
SELECT node, MIN(depth) as distance FROM hops GROUP BY node
```

**Step 2: Test explicit mode against real data**

After implementation, verify:
- `query_related({ source: "semantic-knowledge-engine", mode: "explicit" })` returns mcp-coordination-layer (informs) and studio-desktop-app (informs)
- `query_related({ source: "mcp-coordination-layer", mode: "explicit" })` returns sqlite-agentic-state (depends-on)

**Step 3: Commit**

```bash
git commit -m "feat(knowledge-engine): add query_related MCP tool with explicit/emergent/creative modes"
```

---

### Task 8: Agglomerative clustering

**Files:**
- Create: `packages/studio-core/src/knowledge/clustering.ts`
- Modify: `packages/studio-core/src/db/knowledge-schema.ts` — add clusters table
- Modify: `packages/studio-core/src/db/knowledge-sync.ts` — add cluster computation after embedding sync
- Test: `packages/studio-core/src/db/__tests__/clustering.test.ts`

**Step 1: Add clusters table**

```sql
CREATE TABLE IF NOT EXISTS clusters (
  cluster_id TEXT PRIMARY KEY,
  label      TEXT,
  member_ids TEXT NOT NULL,  -- JSON array of initiative slugs
  updated_at INTEGER NOT NULL
);
```

**Step 2: Implement agglomerative clustering**

```typescript
// packages/studio-core/src/knowledge/clustering.ts
/**
 * Simple agglomerative clustering with single-linkage.
 * At current scale (40-100 initiatives) this is O(n²) which is fine.
 * Upgrade path to HDBSCAN documented for 500+ initiatives.
 */
export function agglomerativeClusters(
  items: Array<{ id: string; embedding: number[] }>,
  similarityFn: (a: number[], b: number[]) => number,
  minSimilarity: number = 0.08, // Based on stress test A7 — avg is 0.05
): Array<{ members: string[] }>
```

Algorithm:
1. Start with each item as its own cluster
2. Compute pairwise similarity matrix
3. Merge the two most similar clusters if similarity > minSimilarity
4. Repeat until no merges possible
5. Filter out singleton clusters

**Step 3: Generate cluster labels**

For each cluster, the label is the 3 highest-IDF terms shared across all member documents.

**Step 4: Test + commit**

Run: `cd packages/studio-core && pnpm test`

```bash
git commit -m "feat(knowledge-engine): agglomerative clustering with auto-labels"
```

---

## ⚑ WAYPOINT: Review Session 6 approach before proceeding

After Session 5 completes, **stop and reassess Session 6** before implementing. By that point we'll have the full engine running (4 MCP tools, TF-IDF, clustering) and real-world usage data. Questions to revisit:

1. **Git hook vs. lazy sync on MCP tool call:** The current `ensureKnowledgeDb()` already syncs on first call. Is a post-commit hook necessary, or is lazy sync sufficient? The 36ms re-sync means on-demand is nearly free.

2. **Chokidar vs. simpler alternatives:** The premortem flagged race conditions with git operations (double-fire, partial writes, edge loss on rename). Is a file watcher worth the complexity, or should we just re-sync on every MCP tool call if the DB is older than N seconds?

3. **Studio Settings page scope:** Is a dedicated settings page the right UI, or should backend info surface inline on the existing dashboard/process pages where agents are already visible?

4. **What did agents actually use?** By session 5, we'll have data on which tools agents call and how. That should inform whether session 6 is the right next investment or if a different session (e.g., improving search quality, adding more edge types) would deliver more value.

Run `/brainstorming` or a quick evaluation at this waypoint. Then proceed or reshape.

---

## Session 6: Git Hook + File Watcher + Studio Config

### Task 9: Git post-commit hook

**Files:**
- Create: `scripts/hooks/post-commit-sync.sh`

**Step 1: Write the hook**

```bash
#!/bin/sh
# Incremental knowledge DB sync after commit.
# Runs in background so it doesn't block git.
pnpm sync:db &
```

**Step 2: Document installation**

Add to initiative activity.md: hook is opt-in, installed via `git config core.hooksPath scripts/hooks` or by copying to `.git/hooks/post-commit`.

**Step 3: Commit**

```bash
git commit -m "feat(knowledge-engine): git post-commit hook for automatic sync"
```

---

### Task 10: Chokidar file watcher for pnpm dev

**Files:**
- Create: `packages/studio-core/src/db/knowledge-watcher.ts`
- Modify: Root `package.json` — add watch:db script or integrate with pnpm dev

**Step 1: Implement the watcher**

```typescript
// packages/studio-core/src/db/knowledge-watcher.ts
import chokidar from "chokidar"
// Watch docs/ for .md changes, debounce at 500ms, run syncFromFilesystem.
// Single-writer enforcement: only the watcher process writes to knowledge.db.
// MCP server processes are read-only.
```

Key constraints from premortem:
- Debounce at 500ms to avoid thrashing
- Ignore .sherpa/ directory (prevent infinite loop)
- On rename: the hash-based skip handles it (old path removed, new path added)
- If git hook fires simultaneously, the second sync is a no-op (hashes match)

**Step 2: Add chokidar dependency**

```bash
pnpm add -w chokidar
```

**Step 3: Test manually**

Start watcher, edit a markdown file, verify DB updates within 1 second.

**Step 4: Commit**

```bash
git commit -m "feat(knowledge-engine): chokidar file watcher with debounce for pnpm dev"
```

---

### Task 11: Studio Settings page for backend configuration

**Files:**
- Create: `apps/studio/src/app/settings/knowledge/page.tsx`

**Step 1: Build the settings page**

Display:
- Current backend: "algorithmic" (badge)
- Capabilities: full_text_search ✓, semantic_similarity ✓, creative_discovery ✓, summary_quality: "extractive"
- Database stats: file count, edge count, summary count, DB file size, last sync time
- "Sync Now" button that triggers `pnpm sync:db`
- Backend configuration hint: "Configure in sherpa.config.ts under knowledge.backend. Available: algorithmic (default), ollama, api, dispatch."

**Step 2: Read config from sherpa.config.ts**

Use the existing `defineConfig` / `SherpaConfig` to read the knowledge section.

**Step 3: Commit**

```bash
git commit -m "feat(knowledge-engine): Studio Settings page for backend configuration"
```

---

## Verification Checklist

After all 6 sessions, verify:

- [ ] `pnpm sync:db` indexes full corpus in <1s
- [ ] `search_knowledge` returns relevant results in text, semantic, and hybrid modes
- [ ] `get_context` returns role-appropriate state under token budgets
- [ ] `get_summary` returns summaries at file/initiative/portfolio levels with staleness
- [ ] `query_related` explicit mode matches frontmatter edges
- [ ] `query_related` emergent mode finds unlinked-but-related pairs
- [ ] `query_related` creative mode finds distant-but-similar pairs
- [ ] Clustering produces meaningful groups (not all-singleton or all-one-cluster)
- [ ] Git hook auto-syncs after commits
- [ ] File watcher syncs during `pnpm dev`
- [ ] Studio Settings page shows backend config and DB stats
- [ ] `pnpm check` passes across all packages
- [ ] All tests pass
