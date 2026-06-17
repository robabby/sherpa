/**
 * Sherpa Studio MCP Server — governance & knowledge API for Claude Code.
 *
 * Tool domains:
 *   Knowledge: search_knowledge, get_summary, get_context, query_related
 *   Governance: initiative_list/get/seeds/create/approve/update_status/activity
 *
 * Factory function creates an McpServer instance per client session.
 * See http-server.ts for the Streamable HTTP transport layer.
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { execSync } from "node:child_process"
import {
  openDb,
  resolveDbPaths,
  applyKnowledgeSchema,
  syncFromFilesystem,
  syncEmbeddings,
} from "@sherpa/studio-core/db"
import { AlgorithmicBackend } from "@sherpa/studio-core/knowledge"
import { registerInitiativeTools } from "./initiative/tools.js"
import { DEFAULT_PATHS } from "@sherpa/studio-core/config"
import type { ProjectContext } from "@sherpa/studio-core/config"

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

export interface StudioMcpOptions {
  /** Absolute path to the project root. */
  projectRoot?: string
  /** Server name shown in MCP handshake. */
  serverName?: string
  /** Port for MCP Streamable HTTP server. Defaults to 3100. */
  port?: number
  /** Governance approval policy for agent callers. Defaults to 'never'. */
  approvalPolicy?: "never" | "additive-only" | "always"
}

function findGitRoot(): string | null {
  try {
    return execSync("git rev-parse --show-toplevel", { encoding: "utf-8" }).trim()
  } catch {
    return null
  }
}

function resolveOptions(opts?: StudioMcpOptions) {
  const projectRoot = opts?.projectRoot
    ?? process.env.SHERPA_PROJECT_ROOT
    ?? findGitRoot()
    ?? process.cwd()

  const serverName = opts?.serverName ?? "sherpa-studio"

  return { projectRoot, serverName }
}

// ---------------------------------------------------------------------------
// Server factory
// ---------------------------------------------------------------------------

export function createStudioMcpServer(opts?: StudioMcpOptions): McpServer {
  const { projectRoot, serverName } = resolveOptions(opts)

  const server = new McpServer({
    name: serverName,
    version: "0.1.0",
  })

  // =========================================================================
  // Knowledge Engine tools
  // =========================================================================

  // Lazy-init: open and sync the knowledge DB on first tool call
  let knowledgeReady = false
  const dbPaths = resolveDbPaths(projectRoot)
  const knowledgeBackend = new AlgorithmicBackend()
  const knowledgeCtx: ProjectContext = {
    root: projectRoot,
    paths: DEFAULT_PATHS,
    claudeMdLocations: [],
    claudeMdScanDirs: [],
  }

  function ensureKnowledgeDb() {
    const db = openDb(dbPaths.knowledge)
    if (!knowledgeReady) {
      applyKnowledgeSchema(db)
      syncFromFilesystem(db, knowledgeCtx)
      syncEmbeddings(db, knowledgeBackend)
      knowledgeReady = true
    }
    return db
  }

  const KNOWLEDGE_CAPABILITIES = {
    full_text_search: true,
    semantic_similarity: true,
    creative_discovery: true,
    summary_quality: "extractive" as const,
  }

  // --- Tool: search_knowledge ---

  server.tool(
    "search_knowledge",
    "Full-text search across all indexed markdown files (initiatives, tasks, research, agents, rules, skills). Returns ranked results with BM25 scoring. Use this to find relevant files without reading every document.",
    {
      query: z.string().describe("Search query — supports FTS5 syntax (AND, OR, NOT, phrase \"quotes\")"),
      limit: z.number().min(1).max(50).default(10).describe("Maximum results to return"),
      kind: z
        .enum(["initiative", "task", "research", "activity", "plan", "agent", "rule", "skill"])
        .optional()
        .describe("Filter results by file kind"),
      initiative: z.string().optional().describe("Filter results by parent initiative slug"),
      mode: z
        .enum(["text", "semantic", "hybrid"])
        .default("text")
        .describe("Search mode. 'text' = FTS5 BM25. 'semantic' = TF-IDF embedding similarity (initiative-level). 'hybrid' = reciprocal rank fusion of both."),
    },
    async ({ query, limit, kind, initiative, mode }) => {
      const db = ensureKnowledgeDb()

      type SearchResult = {
        path: string
        title: string | null
        kind: string | null
        initiative: string | null
        status: string | null
        score: number
        snippet: string | null
      }

      // --- FTS5 text search ---
      function textSearch(): SearchResult[] {
        let sql = `
          SELECT
            f.path, f.title, f.kind, f.initiative, f.status,
            bm25(files_fts) as score,
            snippet(files_fts, 2, '>>>', '<<<', '...', 40) as snippet
          FROM files_fts
          JOIN files f ON f.path = files_fts.path
          WHERE files_fts MATCH ?
        `
        const params: (string | number)[] = [query]
        if (kind) { sql += " AND f.kind = ?"; params.push(kind) }
        if (initiative) { sql += " AND f.initiative = ?"; params.push(initiative) }
        sql += " ORDER BY bm25(files_fts) LIMIT ?"
        params.push(limit * 2) // fetch extra for RRF merging
        return db.prepare(sql).all(...params) as SearchResult[]
      }

      // --- Semantic search (initiative-level embeddings) ---
      function semanticSearch(): SearchResult[] {
        const queryVec = knowledgeBackend.embedQuery(query)
        const rows = db.prepare(`
          SELECT s.id, s.summary, s.embedding, f.path, f.title, f.kind, f.initiative, f.status
          FROM summaries s
          JOIN files f ON f.initiative = s.id AND f.kind = 'initiative'
          WHERE s.level = 'initiative' AND s.embedding IS NOT NULL
        `).all() as Array<{
          id: string; summary: string; embedding: string
          path: string; title: string | null; kind: string | null
          initiative: string | null; status: string | null
        }>

        const scored = rows.map(r => {
          const embedding = JSON.parse(r.embedding) as number[]
          return {
            path: r.path,
            title: r.title,
            kind: r.kind,
            initiative: r.initiative,
            status: r.status,
            score: knowledgeBackend.cosineSimilarity(queryVec, embedding),
            snippet: r.summary,
          }
        })

        // Filter by kind/initiative if specified
        let filtered = scored
        if (kind) filtered = filtered.filter(r => r.kind === kind)
        if (initiative) filtered = filtered.filter(r => r.initiative === initiative)

        return filtered.sort((a, b) => b.score - a.score).slice(0, limit)
      }

      // --- Hybrid: Reciprocal Rank Fusion ---
      function hybridSearch(): SearchResult[] {
        const K = 60 // standard RRF constant
        const textResults = textSearch()
        const semResults = semanticSearch()

        const rrfScores = new Map<string, { result: SearchResult; score: number }>()

        textResults.forEach((r, rank) => {
          const rrf = 1 / (K + rank)
          const existing = rrfScores.get(r.path)
          if (existing) {
            existing.score += rrf
          } else {
            rrfScores.set(r.path, { result: r, score: rrf })
          }
        })

        semResults.forEach((r, rank) => {
          const rrf = 1 / (K + rank)
          const existing = rrfScores.get(r.path)
          if (existing) {
            existing.score += rrf
          } else {
            rrfScores.set(r.path, { result: { ...r, snippet: r.snippet }, score: rrf })
          }
        })

        return Array.from(rrfScores.values())
          .sort((a, b) => b.score - a.score)
          .slice(0, limit)
          .map(({ result, score }) => ({ ...result, score }))
      }

      try {
        const results = mode === "semantic" ? semanticSearch()
          : mode === "hybrid" ? hybridSearch()
          : textSearch()

        if (results.length === 0) {
          return {
            content: [{
              type: "text" as const,
              text: `No results found for "${query}".${kind ? ` (filtered to kind=${kind})` : ""}${initiative ? ` (filtered to initiative=${initiative})` : ""}`,
            }],
          }
        }

        const formatted = results.map((r) => ({
          path: r.path,
          title: r.title,
          kind: r.kind,
          initiative: r.initiative,
          status: r.status,
          score: Math.round(r.score * 10000) / 10000,
          snippet: r.snippet,
        }))

        return {
          content: [{
            type: "text" as const,
            text: JSON.stringify({
              query,
              mode,
              backend: "algorithmic",
              capabilities: KNOWLEDGE_CAPABILITIES,
              count: results.length,
              results: formatted,
            }, null, 2),
          }],
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err)
        return {
          content: [{
            type: "text" as const,
            text: `Search error: ${message}. Tip: FTS5 syntax requires valid query terms. Use "word1 word2" for phrase match, "word1 OR word2" for alternatives.`,
          }],
          isError: true,
        }
      }
    },
  )

  // --- Tool: get_summary ---

  server.tool(
    "get_summary",
    "Get structured metadata and summaries at different zoom levels. 'file' returns metadata for a single file. 'initiative' returns generated summary, file list, and edges. 'portfolio' returns all initiative summaries weighted by status — the system-wide view.",
    {
      path: z.string().optional().describe("File path (relative to project root) — used when level='file'"),
      initiative: z.string().optional().describe("Initiative slug — used when level='initiative'"),
      level: z
        .enum(["file", "initiative", "portfolio"])
        .default("initiative")
        .describe("Summary level. 'file' = single file metadata. 'initiative' = initiative summary + files + edges. 'portfolio' = all initiative summaries."),
    },
    async ({ path: filePath, initiative: initSlug, level }) => {
      const db = ensureKnowledgeDb()

      // --- File level ---
      if (level === "file") {
        if (!filePath) {
          return {
            content: [{ type: "text" as const, text: "Error: 'path' is required when level='file'." }],
            isError: true,
          }
        }

        const row = db.prepare(`
          SELECT path, title, kind, initiative, status, frontmatter, updated_at
          FROM files WHERE path = ?
        `).get(filePath) as {
          path: string; title: string | null; kind: string | null
          initiative: string | null; status: string | null
          frontmatter: string | null; updated_at: number
        } | undefined

        if (!row) {
          return {
            content: [{ type: "text" as const, text: `File not found: ${filePath}. Run 'pnpm sync:db' to rebuild.` }],
            isError: true,
          }
        }

        return {
          content: [{
            type: "text" as const,
            text: JSON.stringify({
              level: "file",
              ...row,
              frontmatter: row.frontmatter ? JSON.parse(row.frontmatter) : null,
              backend: "algorithmic",
              capabilities: KNOWLEDGE_CAPABILITIES,
            }, null, 2),
          }],
        }
      }

      // --- Portfolio level ---
      if (level === "portfolio") {
        const TWO_WEEKS_MS = 14 * 24 * 60 * 60 * 1000
        const twoWeeksAgo = Date.now() - TWO_WEEKS_MS

        const allSummaries = db.prepare(`
          SELECT s.id, s.summary, s.stale, s.updated_at, f.status
          FROM summaries s
          JOIN files f ON f.initiative = s.id AND f.kind = 'initiative'
          WHERE s.level = 'initiative'
          ORDER BY
            CASE f.status
              WHEN 'in-progress' THEN 0
              WHEN 'approved' THEN 1
              WHEN 'pending' THEN 2
              WHEN 'integrated' THEN 3
              WHEN 'declined' THEN 4
              WHEN 'archived' THEN 5
              ELSE 6
            END,
            s.updated_at DESC
        `).all() as Array<{
          id: string; summary: string; stale: number
          updated_at: number; status: string | null
        }>

        // Temporal weighting: full for active, moderate for recent integrated, mention for old integrated
        const initiatives = allSummaries
          .filter(s => s.status !== "archived" && s.status !== "declined")
          .map(s => {
            const isIntegrated = s.status === "integrated"
            const isOldIntegrated = isIntegrated && s.updated_at < twoWeeksAgo
            // Three tiers: full (active/approved/pending), moderate (integrated <2wk), mention (integrated >2wk)
            if (isOldIntegrated) {
              return {
                initiative: s.id,
                status: s.status,
                summary: s.summary.split(" — ")[0] ?? s.summary,
                stale: Boolean(s.stale),
                detail: "mention" as const,
              }
            }
            if (isIntegrated) {
              // Moderate: first two segments (title + summary sentence)
              const segments = s.summary.split(" — ")
              const moderate = segments.slice(0, 3).join(" — ")
              return {
                initiative: s.id,
                status: s.status,
                summary: moderate,
                stale: Boolean(s.stale),
                detail: "moderate" as const,
              }
            }
            return {
              initiative: s.id,
              status: s.status,
              summary: s.summary,
              stale: Boolean(s.stale),
              detail: "full" as const,
            }
          })

        const statusCounts: Record<string, number> = {}
        for (const s of allSummaries) {
          const st = s.status ?? "unknown"
          statusCounts[st] = (statusCounts[st] ?? 0) + 1
        }

        return {
          content: [{
            type: "text" as const,
            text: JSON.stringify({
              level: "portfolio",
              totalInitiatives: allSummaries.length,
              statusCounts,
              initiatives,
              backend: "algorithmic",
              capabilities: KNOWLEDGE_CAPABILITIES,
            }, null, 2),
          }],
        }
      }

      // --- Initiative level (default) ---
      if (!initSlug && !filePath) {
        return {
          content: [{ type: "text" as const, text: "Error: Provide 'initiative' (slug) or 'path' (file path)." }],
          isError: true,
        }
      }

      const slug = initSlug ?? filePath?.match(/docs\/initiatives\/([^/]+)\//)?.[1]
      if (!slug) {
        return {
          content: [{ type: "text" as const, text: "Error: Could not determine initiative slug." }],
          isError: true,
        }
      }

      const summaryRow = db.prepare(
        "SELECT summary, stale, updated_at FROM summaries WHERE id = ? AND level = 'initiative'"
      ).get(slug) as { summary: string; stale: number; updated_at: number } | undefined

      const files = db.prepare(`
        SELECT path, title, kind, status, updated_at
        FROM files WHERE initiative = ?
        ORDER BY kind, path
      `).all(slug) as Array<{
        path: string; title: string | null; kind: string | null
        status: string | null; updated_at: number
      }>

      const edges = db.prepare(`
        SELECT source, target, kind FROM edges
        WHERE source = ? OR target = ?
        ORDER BY kind
      `).all(slug, slug) as Array<{
        source: string; target: string; kind: string
      }>

      // Stale file list — files changed after the summary was generated
      let changedSinceSummary: string[] = []
      if (summaryRow) {
        changedSinceSummary = (db.prepare(`
          SELECT path FROM files
          WHERE initiative = ? AND updated_at > ?
        `).all(slug, summaryRow.updated_at) as Array<{ path: string }>).map(r => r.path)
      }

      if (files.length === 0 && edges.length === 0) {
        return {
          content: [{ type: "text" as const, text: `Initiative not found: ${slug}. Run 'pnpm sync:db' to rebuild.` }],
          isError: true,
        }
      }

      return {
        content: [{
          type: "text" as const,
          text: JSON.stringify({
            level: "initiative",
            initiative: slug,
            summary: summaryRow?.summary ?? null,
            stale: summaryRow ? Boolean(summaryRow.stale) : null,
            changedSinceSummary: changedSinceSummary.length > 0 ? changedSinceSummary : undefined,
            fileCount: files.length,
            files,
            edges,
            backend: "algorithmic",
            capabilities: KNOWLEDGE_CAPABILITIES,
          }, null, 2),
        }],
      }
    },
  )

  // --- Tool: get_context ---

  const ROLE_BUDGETS: Record<string, { scope: number; neighborhood: number; system: number }> = {
    worker:     { scope: 800,  neighborhood: 300, system: 200 },
    planner:    { scope: 300,  neighborhood: 500, system: 1500 },
    judge:      { scope: 600,  neighborhood: 800, system: 300 },
    researcher: { scope: 1000, neighborhood: 500, system: 1500 },
  }

  server.tool(
    "get_context",
    "Session bootstrap — get role-appropriate system state in a single call. Workers get deep scope, Planners get deep system overview, Judges get scope + neighborhood. Returns everything an agent needs to orient without reading individual files.",
    {
      role: z
        .enum(["worker", "planner", "judge", "researcher"])
        .describe("Agent role — determines what zoom level of context is returned"),
      initiative: z.string().optional().describe("Initiative slug to scope context to"),
      max_tokens: z.number().min(500).max(8000).optional().describe("Override token budget (default varies by role)"),
    },
    async ({ role, initiative: initSlug, max_tokens }) => {
      const db = ensureKnowledgeDb()
      const budgets = ROLE_BUDGETS[role] ?? ROLE_BUDGETS.worker!
      const totalBudget = max_tokens ?? (budgets.scope + budgets.neighborhood + budgets.system)

      // Scale budgets proportionally if max_tokens overrides
      const scale = max_tokens ? max_tokens / (budgets.scope + budgets.neighborhood + budgets.system) : 1
      const scopeBudget = Math.round(budgets.scope * scale)
      const neighborhoodBudget = Math.round(budgets.neighborhood * scale)
      const systemBudget = Math.round(budgets.system * scale)

      // --- Scope: initiative detail ---
      let scope: unknown = null
      if (initSlug) {
        const summary = db.prepare(
          "SELECT summary, stale FROM summaries WHERE id = ? AND level = 'initiative'"
        ).get(initSlug) as { summary: string; stale: number } | undefined

        const fileList = db.prepare(
          "SELECT path, title, kind, status FROM files WHERE initiative = ? ORDER BY kind"
        ).all(initSlug) as Array<{ path: string; title: string | null; kind: string | null; status: string | null }>

        // For workers: full file list. For planners: just titles.
        const files = role === "planner"
          ? fileList.map(f => ({ title: f.title, kind: f.kind }))
          : fileList

        scope = {
          initiative: initSlug,
          summary: summary?.summary ?? null,
          stale: summary ? Boolean(summary.stale) : null,
          files,
        }
      }

      // --- Neighborhood: adjacent initiatives ---
      let neighborhood: unknown = null
      if (initSlug) {
        const edges = db.prepare(`
          SELECT source, target, kind FROM edges
          WHERE source = ? OR target = ?
        `).all(initSlug, initSlug) as Array<{ source: string; target: string; kind: string }>

        // Get summaries for adjacent initiatives
        const neighborSlugs = new Set<string>()
        for (const e of edges) {
          if (e.source !== initSlug) neighborSlugs.add(e.source)
          if (e.target !== initSlug) neighborSlugs.add(e.target)
        }

        // Only include initiative summaries (not file path targets)
        const neighborSummaries: Array<{ initiative: string; summary: string; status: string | null }> = []
        for (const slug of neighborSlugs) {
          const row = db.prepare(`
            SELECT s.summary, f.status FROM summaries s
            JOIN files f ON f.initiative = s.id AND f.kind = 'initiative'
            WHERE s.id = ? AND s.level = 'initiative'
          `).get(slug) as { summary: string; status: string | null } | undefined
          if (row) {
            neighborSummaries.push({ initiative: slug, summary: row.summary, status: row.status })
          }
        }

        neighborhood = {
          edges,
          adjacentInitiatives: neighborSummaries,
        }
      }

      // --- System: portfolio overview ---
      const statusCounts = db.prepare(`
        SELECT status, COUNT(*) as count FROM files
        WHERE kind = 'initiative'
        GROUP BY status ORDER BY count DESC
      `).all() as Array<{ status: string; count: number }>

      const inProgress = db.prepare(`
        SELECT s.id, s.summary FROM summaries s
        JOIN files f ON f.initiative = s.id AND f.kind = 'initiative'
        WHERE s.level = 'initiative' AND f.status = 'in-progress'
      `).all() as Array<{ id: string; summary: string }>

      const recentlyLanded = db.prepare(`
        SELECT s.id, s.summary FROM summaries s
        JOIN files f ON f.initiative = s.id AND f.kind = 'initiative'
        WHERE s.level = 'initiative' AND f.status = 'integrated'
        ORDER BY s.updated_at DESC LIMIT 5
      `).all() as Array<{ id: string; summary: string }>

      // For workers: just status counts. For planners/researchers: full summaries.
      const system = role === "worker"
        ? { statusCounts, inProgressCount: inProgress.length }
        : { statusCounts, inProgress, recentlyLanded }

      // --- Alerts: recent changes to files in neighbor initiatives ---
      let alerts: string[] = []
      if (initSlug) {
        const ONE_HOUR_MS = 60 * 60 * 1000
        const recentThreshold = Date.now() - ONE_HOUR_MS
        const neighborSlugs = new Set<string>()
        const edges = db.prepare("SELECT source, target FROM edges WHERE source = ? OR target = ?").all(initSlug, initSlug) as Array<{ source: string; target: string }>
        for (const e of edges) {
          if (e.source !== initSlug) neighborSlugs.add(e.source)
          if (e.target !== initSlug) neighborSlugs.add(e.target)
        }

        for (const slug of neighborSlugs) {
          const recent = db.prepare(
            "SELECT COUNT(*) as c FROM files WHERE initiative = ? AND updated_at > ?"
          ).get(slug, recentThreshold) as { c: number }
          if (recent.c > 0) {
            alerts.push(`${slug} has ${recent.c} file(s) changed in the last hour`)
          }
        }
      }

      return {
        content: [{
          type: "text" as const,
          text: JSON.stringify({
            role,
            initiative: initSlug ?? null,
            tokenBudget: { total: totalBudget, scope: scopeBudget, neighborhood: neighborhoodBudget, system: systemBudget },
            scope,
            neighborhood,
            system,
            alerts: alerts.length > 0 ? alerts : undefined,
            backend: "algorithmic",
            capabilities: KNOWLEDGE_CAPABILITIES,
          }, null, 2),
        }],
      }
    },
  )

  // --- Tool: query_related ---

  server.tool(
    "query_related",
    "Find related initiatives. 'explicit' traverses frontmatter edges (depends-on, informs, spawned-from). 'emergent' finds initiatives with high embedding similarity but no explicit edge — hidden connections. 'creative' finds initiatives that are semantically close but structurally far apart — cross-pollination candidates.",
    {
      source: z.string().describe("Initiative slug to find relationships for"),
      mode: z
        .enum(["explicit", "emergent", "creative"])
        .default("explicit")
        .describe("Relationship mode"),
      limit: z.number().min(1).max(20).default(10).describe("Maximum results"),
    },
    async ({ source, mode, limit: resultLimit }) => {
      const db = ensureKnowledgeDb()

      if (mode === "explicit") {
        // Direct edge traversal — 1-2 hops
        const directEdges = db.prepare(`
          SELECT source, target, kind FROM edges
          WHERE source = ? OR target = ?
          ORDER BY kind
        `).all(source, source) as Array<{ source: string; target: string; kind: string }>

        // Second hop: edges connected to direct neighbors
        const neighborSlugs = new Set<string>()
        for (const e of directEdges) {
          if (e.source !== source) neighborSlugs.add(e.source)
          if (e.target !== source) neighborSlugs.add(e.target)
        }

        const secondHop: Array<{ source: string; target: string; kind: string; via: string }> = []
        for (const neighbor of neighborSlugs) {
          const hopEdges = db.prepare(`
            SELECT source, target, kind FROM edges
            WHERE (source = ? OR target = ?) AND source != ? AND target != ?
          `).all(neighbor, neighbor, source, source) as Array<{ source: string; target: string; kind: string }>

          for (const e of hopEdges) {
            secondHop.push({ ...e, via: neighbor })
          }
        }

        return {
          content: [{
            type: "text" as const,
            text: JSON.stringify({
              source,
              mode: "explicit",
              directEdges,
              secondHop: secondHop.slice(0, resultLimit),
              backend: "algorithmic",
              capabilities: KNOWLEDGE_CAPABILITIES,
            }, null, 2),
          }],
        }
      }

      if (mode === "emergent") {
        // High similarity + no explicit edge
        const explicitPairs = new Set<string>()
        const allExplicit = db.prepare("SELECT source, target FROM edges").all() as Array<{ source: string; target: string }>
        for (const e of allExplicit) {
          explicitPairs.add(`${e.source}:${e.target}`)
          explicitPairs.add(`${e.target}:${e.source}`)
        }

        const inferred = db.prepare(`
          SELECT target, similarity FROM inferred_edges
          WHERE source = ?
          ORDER BY similarity DESC
        `).all(source) as Array<{ target: string; similarity: number }>

        const emergent = inferred
          .filter(r => !explicitPairs.has(`${source}:${r.target}`))
          .slice(0, resultLimit)
          .map(r => {
            const summary = db.prepare(
              "SELECT summary FROM summaries WHERE id = ? AND level = 'initiative'"
            ).get(r.target) as { summary: string } | undefined
            return {
              target: r.target,
              similarity: Math.round(r.similarity * 10000) / 10000,
              summary: summary?.summary ?? null,
            }
          })

        return {
          content: [{
            type: "text" as const,
            text: JSON.stringify({
              source,
              mode: "emergent",
              description: "High embedding similarity with no explicit frontmatter edge — hidden connections",
              results: emergent,
              backend: "algorithmic",
              capabilities: KNOWLEDGE_CAPABILITIES,
            }, null, 2),
          }],
        }
      }

      // Creative mode: high similarity + high graph distance
      // Use recursive CTE for BFS graph distance
      const graphDistances = db.prepare(`
        WITH RECURSIVE hops(node, depth) AS (
          VALUES(?, 0)
          UNION ALL
          SELECT CASE WHEN e.source = h.node THEN e.target ELSE e.source END, h.depth + 1
          FROM edges e
          JOIN hops h ON (e.source = h.node OR e.target = h.node)
          WHERE h.depth < 5
        )
        SELECT node, MIN(depth) as distance FROM hops
        GROUP BY node
      `).all(source) as Array<{ node: string; distance: number }>

      const distanceMap = new Map<string, number>()
      for (const row of graphDistances) {
        distanceMap.set(row.node, row.distance)
      }

      const inferred = db.prepare(`
        SELECT target, similarity FROM inferred_edges
        WHERE source = ?
        ORDER BY similarity DESC
      `).all(source) as Array<{ target: string; similarity: number }>

      const creative = inferred
        .map(r => ({
          target: r.target,
          similarity: r.similarity,
          graphDistance: distanceMap.get(r.target) ?? Infinity,
        }))
        .filter(r => r.graphDistance >= 3 || r.graphDistance === Infinity)
        .slice(0, resultLimit)
        .map(r => {
          const summary = db.prepare(
            "SELECT summary FROM summaries WHERE id = ? AND level = 'initiative'"
          ).get(r.target) as { summary: string } | undefined
          return {
            target: r.target,
            similarity: Math.round(r.similarity * 10000) / 10000,
            graphDistance: r.graphDistance === Infinity ? "unreachable" : r.graphDistance,
            summary: summary?.summary ?? null,
          }
        })

      return {
        content: [{
          type: "text" as const,
          text: JSON.stringify({
            source,
            mode: "creative",
            description: "Semantically similar but structurally distant — cross-pollination candidates",
            results: creative,
            backend: "algorithmic",
            capabilities: KNOWLEDGE_CAPABILITIES,
          }, null, 2),
        }],
      }
    },
  )

  // --- Initiative tools ---
  registerInitiativeTools(server, {
    projectRoot,
    approvalPolicy: opts?.approvalPolicy ?? "never",
  })

  return server
}

