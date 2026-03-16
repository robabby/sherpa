/**
 * Sherpa Studio MCP Server — development control plane for Claude Code.
 *
 * Tool domains:
 *   Tasks: task_list, task_get, task_create, task_update, task_dispatch, task_logs
 *   Knowledge: search_knowledge, get_summary
 *   Infrastructure: lm_status
 *
 * Factory function creates an McpServer instance per client session.
 * See http-server.ts for the Streamable HTTP transport layer.
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import fs from "node:fs"
import path from "node:path"
import { execSync, spawn } from "node:child_process"
import {
  openDb,
  resolveDbPaths,
  applyKnowledgeSchema,
  syncFromFilesystem,
  syncEmbeddings,
} from "@sherpa/studio-core/db"
import { AlgorithmicBackend } from "@sherpa/studio-core/knowledge"
import { registerAuthorityTools } from "./authority/tools.js"

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

export interface StudioMcpOptions {
  /** Absolute path to the project root. */
  projectRoot?: string
  /** Relative path from projectRoot to the tasks directory. */
  tasksDir?: string
  /** Relative path from projectRoot to the task logs directory. */
  logsDir?: string
  /** LM Studio base URL. */
  lmStudioUrl?: string
  /** Server name shown in MCP handshake. */
  serverName?: string
  /** Path to the LM worker script (relative to projectRoot). */
  workerScript?: string
  /** Path to the task-logger module (relative to projectRoot). Null disables event logging. */
  taskLoggerPath?: string | null
  /** Port for MCP Streamable HTTP server. Defaults to 3100. */
  port?: number
  /** SQLite database for coordination. When provided, authority tools are registered. */
  coordinationDb?: import("better-sqlite3").Database
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

  const tasksDir = path.join(projectRoot, opts?.tasksDir ?? "docs/tasks")
  const logsDir = path.join(projectRoot, opts?.logsDir ?? path.join(opts?.tasksDir ?? "docs/tasks", "logs"))
  const lmStudioUrl = opts?.lmStudioUrl ?? process.env.LM_STUDIO_URL ?? "http://localhost:1234"
  const serverName = opts?.serverName ?? "sherpa-studio"
  const workerScript = opts?.workerScript ?? "scripts/lm-worker.mjs"
  const taskLoggerPath = opts?.taskLoggerPath !== undefined ? opts.taskLoggerPath : "scripts/task-logger.mjs"

  return { projectRoot, tasksDir, logsDir, lmStudioUrl, serverName, workerScript, taskLoggerPath }
}

// ---------------------------------------------------------------------------
// Frontmatter helpers
// ---------------------------------------------------------------------------

interface TaskMeta {
  [key: string]: string | null
}

function parseFrontmatter(content: string): { meta: TaskMeta; body: string } {
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/)
  if (!match) return { meta: {}, body: content }

  const meta: TaskMeta = {}
  for (const line of match[1].split("\n")) {
    const colonIdx = line.indexOf(":")
    if (colonIdx === -1) continue
    const key = line.slice(0, colonIdx).trim()
    let value: string | null = line.slice(colonIdx + 1).trim()
    if (value === "null") value = null
    meta[key] = value
  }
  return { meta, body: match[2] }
}

function serializeFrontmatter(meta: TaskMeta, body: string): string {
  const lines = Object.entries(meta).map(([k, v]) => `${k}: ${v ?? "null"}`)
  return `---\n${lines.join("\n")}\n---\n${body}`
}

// ---------------------------------------------------------------------------
// Task operations
// ---------------------------------------------------------------------------

function scanTasks(
  tasksDir: string,
  filter: Partial<Record<string, string>> = {},
): Array<TaskMeta & { file: string; body: string }> {
  if (!fs.existsSync(tasksDir)) return []

  const files = fs
    .readdirSync(tasksDir)
    .filter((f) => f.endsWith(".md") && f !== "README.md")
  const tasks: Array<TaskMeta & { file: string; body: string }> = []

  for (const file of files) {
    const content = fs.readFileSync(path.join(tasksDir, file), "utf-8")
    const { meta, body } = parseFrontmatter(content)

    if (filter.status && meta.status !== filter.status) continue
    if (filter.role && meta.role !== filter.role) continue
    if (filter.backend && meta.backend !== filter.backend) continue
    if (filter.initiative && meta.initiative !== filter.initiative) continue

    tasks.push({ file, ...meta, body })
  }

  const priorityOrder: Record<string, number> = {
    urgent: 0,
    high: 1,
    medium: 2,
    low: 3,
  }
  tasks.sort(
    (a, b) =>
      (priorityOrder[a.priority ?? ""] ?? 9) -
      (priorityOrder[b.priority ?? ""] ?? 9),
  )
  return tasks
}

function findAndUpdateTask(
  tasksDir: string,
  id: string,
  field: string,
  value: string | null,
): boolean {
  const files = fs
    .readdirSync(tasksDir)
    .filter((f) => f.endsWith(".md") && f !== "README.md")

  for (const file of files) {
    const filePath = path.join(tasksDir, file)
    const content = fs.readFileSync(filePath, "utf-8")
    const { meta, body } = parseFrontmatter(content)

    if (meta.id === id) {
      meta[field] = value
      fs.writeFileSync(filePath, serializeFrontmatter(meta, body))
      return true
    }
  }
  return false
}

async function checkLmStudio(lmStudioUrl: string): Promise<{
  available: boolean
  models: string[]
  error?: string
}> {
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 3000)
    const res = await fetch(`${lmStudioUrl}/v1/models`, {
      signal: controller.signal,
    })
    clearTimeout(timeout)

    if (!res.ok) {
      return { available: false, models: [], error: `HTTP ${res.status}` }
    }

    const data = (await res.json()) as { data?: Array<{ id: string }> }
    const models = (data.data ?? []).map((m) => m.id)
    return { available: true, models }
  } catch (err) {
    return {
      available: false,
      models: [],
      error: err instanceof Error ? err.message : String(err),
    }
  }
}

// ---------------------------------------------------------------------------
// Event logging helper
// ---------------------------------------------------------------------------

async function logEvent(
  projectRoot: string,
  logsDir: string,
  taskLoggerPath: string | null,
  taskId: string,
  event: string,
  data: Record<string, unknown>,
): Promise<void> {
  if (!taskLoggerPath) return
  try {
    const fullPath = path.join(projectRoot, taskLoggerPath)
    const { appendEvent } = await import(fullPath)
    appendEvent(logsDir, taskId, event, data)
  } catch {
    // Logger not critical — continue
  }
}

// ---------------------------------------------------------------------------
// Server factory
// ---------------------------------------------------------------------------

export function createStudioMcpServer(opts?: StudioMcpOptions): McpServer {
  const { projectRoot, tasksDir, logsDir, lmStudioUrl, serverName, workerScript, taskLoggerPath } =
    resolveOptions(opts)

  const server = new McpServer({
    name: serverName,
    version: "0.1.0",
  })

  // --- Tool: task_list ---

  server.tool(
    "task_list",
    "List tasks from the task board. Returns metadata for all matching tasks, sorted by priority.",
    {
      status: z
        .enum(["pending", "dispatched", "completed", "failed", "reviewed", "archived"])
        .optional()
        .describe("Filter by task status"),
      role: z.string().optional().describe("Filter by agent role"),
      backend: z.enum(["lm-studio", "claude"]).optional().describe("Filter by execution backend"),
      initiative: z.string().optional().describe("Filter by initiative slug"),
    },
    async ({ status, role, backend, initiative }) => {
      const filter: Record<string, string> = {}
      if (status) filter.status = status
      if (role) filter.role = role
      if (backend) filter.backend = backend
      if (initiative) filter.initiative = initiative

      const tasks = scanTasks(tasksDir, filter)
      const summary = tasks.map(({ body: _body, ...meta }) => meta)

      return {
        content: [
          {
            type: "text" as const,
            text:
              tasks.length === 0
                ? "No tasks found matching filters."
                : JSON.stringify(summary, null, 2),
          },
        ],
      }
    },
  )

  // --- Tool: task_get ---

  server.tool(
    "task_get",
    "Get a single task by ID with full details: metadata, body content, and output log if available.",
    {
      id: z.string().describe("Task slug/ID"),
    },
    async ({ id }) => {
      const tasks = scanTasks(tasksDir)
      const task = tasks.find((t) => t.id === id)

      if (!task) {
        return {
          content: [{ type: "text" as const, text: `Error: Task not found: ${id}` }],
          isError: true,
        }
      }

      const outputPath = path.join(logsDir, `${id}-output.md`)
      let output: string | null = null
      if (fs.existsSync(outputPath)) {
        output = fs.readFileSync(outputPath, "utf-8")
      }

      const blockersPath = path.join(logsDir, `${id}-blockers.md`)
      let blockers: string | null = null
      if (fs.existsSync(blockersPath)) {
        blockers = fs.readFileSync(blockersPath, "utf-8")
      }

      const verdictPath = path.join(logsDir, `${id}-verdict.md`)
      let verdict: string | null = null
      if (fs.existsSync(verdictPath)) {
        verdict = fs.readFileSync(verdictPath, "utf-8")
      }

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify({ ...task, output, blockers, verdict }, null, 2),
          },
        ],
      }
    },
  )

  // --- Tool: task_create ---

  server.tool(
    "task_create",
    "Create a new task on the task board.",
    {
      id: z
        .string()
        .regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens only")
        .describe("Task slug — becomes the filename"),
      title: z.string().describe("Human-readable task title"),
      role: z
        .enum(["engineer", "research-lead", "technical-writer", "code-reviewer", "designer"])
        .describe("Agent role to execute this task"),
      priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
      initiative: z.string().optional().describe("Parent initiative slug"),
      model: z.string().default("qwen-3.5-9b").describe("Model name for LM Studio"),
      objective: z.string().describe("What the worker must accomplish"),
      context: z.string().optional().describe("Files to read, initiative context"),
      acceptance_criteria: z.array(z.string()).describe("List of acceptance criteria"),
      constraints: z.string().optional().describe("What NOT to do, patterns to follow"),
      deliverables: z.string().describe("Artifacts the worker must produce"),
    },
    async ({
      id, title, role, priority, initiative, model,
      objective, context, acceptance_criteria, constraints, deliverables,
    }) => {
      const filePath = path.join(tasksDir, `${id}.md`)

      if (fs.existsSync(filePath)) {
        return {
          content: [{ type: "text" as const, text: `Error: Task already exists: ${id}` }],
          isError: true,
        }
      }

      const meta: TaskMeta = {
        id,
        status: "pending",
        role,
        priority,
        initiative: initiative ?? null,
        backend: "lm-studio",
        model,
        "budget-usd": "0.00",
        worktree: null,
        branch: null,
        created: new Date().toISOString(),
        "dispatched-at": null,
        "completed-at": null,
        "session-id": null,
        "judge-verdict": "pending",
      }

      const criteriaList = acceptance_criteria.map((c) => `- [ ] ${c}`).join("\n")

      const body = `# ${title}

## Objective
${objective}

## Context
${context ?? "No additional context provided."}

## Acceptance Criteria
${criteriaList}

## Constraints
${constraints ?? "None specified."}

## Deliverables
${deliverables}
`

      fs.mkdirSync(tasksDir, { recursive: true })
      fs.writeFileSync(filePath, serializeFrontmatter(meta, body))

      await logEvent(projectRoot, logsDir, taskLoggerPath, id, "task_created", {
        role, backend: "lm-studio", model, priority, initiative: initiative ?? null,
      })

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify({ created: true, path: `docs/tasks/${id}.md`, id, status: "pending" }),
          },
        ],
      }
    },
  )

  // --- Tool: task_update ---

  const UPDATABLE_FIELDS = [
    "status", "priority", "judge-verdict", "model", "worktree",
    "branch", "session-id", "dispatched-at", "completed-at", "initiative", "role",
  ] as const

  server.tool(
    "task_update",
    "Update a task's metadata field.",
    {
      id: z.string().describe("Task slug/ID"),
      field: z.enum(UPDATABLE_FIELDS).describe("Frontmatter field to update"),
      value: z.string().nullable().describe("New value (use null to clear)"),
    },
    async ({ id, field, value }) => {
      const updated = findAndUpdateTask(tasksDir, id, field, value)

      if (!updated) {
        return {
          content: [{ type: "text" as const, text: `Error: Task not found: ${id}` }],
          isError: true,
        }
      }

      if (field === "status") {
        await logEvent(projectRoot, logsDir, taskLoggerPath, id, "task_status_changed", { field, to: value })
      }

      return {
        content: [
          { type: "text" as const, text: JSON.stringify({ updated: true, id, field, value }) },
        ],
      }
    },
  )

  // --- Tool: task_dispatch ---

  server.tool(
    "task_dispatch",
    "Dispatch a pending task to LM Studio for execution. The worker runs as a detached background process.",
    {
      id: z.string().describe("Task slug/ID to dispatch"),
    },
    async ({ id }) => {
      const tasks = scanTasks(tasksDir)
      const task = tasks.find((t) => t.id === id)

      if (!task) {
        return {
          content: [{ type: "text" as const, text: `Error: Task not found: ${id}` }],
          isError: true,
        }
      }

      if (task.status !== "pending") {
        return {
          content: [
            {
              type: "text" as const,
              text: `Error: Task '${id}' has status '${task.status}' — only pending tasks can be dispatched.`,
            },
          ],
          isError: true,
        }
      }

      if (task.backend !== "lm-studio") {
        return {
          content: [
            {
              type: "text" as const,
              text: `Error: Task '${id}' uses backend '${task.backend}' — only lm-studio tasks can be dispatched.`,
            },
          ],
          isError: true,
        }
      }

      const lmStatus = await checkLmStudio(lmStudioUrl)
      if (!lmStatus.available) {
        return {
          content: [
            {
              type: "text" as const,
              text: `Error: LM Studio not available at ${lmStudioUrl}. ${lmStatus.error ?? "Start LM Studio before dispatching."}`,
            },
          ],
          isError: true,
        }
      }

      findAndUpdateTask(tasksDir, id, "status", "dispatched")
      findAndUpdateTask(tasksDir, id, "dispatched-at", new Date().toISOString())

      const workerPath = path.join(projectRoot, workerScript)
      const child = spawn("node", [workerPath, id], {
        cwd: projectRoot,
        detached: true,
        stdio: "ignore",
        env: { ...process.env },
      })

      const spawnError = await new Promise<Error | null>((resolve) => {
        child.on("error", (err) => resolve(err))
        setTimeout(() => resolve(null), 500)
      })

      if (spawnError || !child.pid) {
        findAndUpdateTask(tasksDir, id, "status", "failed")
        findAndUpdateTask(tasksDir, id, "dispatched-at", null)
        return {
          content: [
            {
              type: "text" as const,
              text: `Error: Failed to spawn worker for '${id}': ${spawnError?.message ?? "no PID assigned"}`,
            },
          ],
          isError: true,
        }
      }

      child.unref()

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify({
              dispatched: true,
              id,
              backend: "lm-studio",
              model: task.model ?? "default",
              pid: child.pid,
              lmModels: lmStatus.models,
              message: `Worker running as PID ${child.pid}. Use task_get or task_logs to check progress.`,
            }),
          },
        ],
      }
    },
  )

  // --- Tool: task_logs ---

  server.tool(
    "task_logs",
    "Read logs for a task. Returns structured NDJSON events and/or artifact logs (output, blockers, verdict).",
    {
      id: z.string().describe("Task slug/ID"),
      log_type: z
        .enum(["events", "output", "blockers", "verdict", "all"])
        .default("all")
        .describe("Which log to read"),
      tail: z
        .number()
        .optional()
        .describe("Return only the last N events"),
    },
    async ({ id, log_type, tail }) => {
      const parts: string[] = []

      if (log_type === "events" || log_type === "all") {
        const eventsPath = path.join(logsDir, `${id}-events.ndjson`)
        if (fs.existsSync(eventsPath)) {
          const lines = fs.readFileSync(eventsPath, "utf-8").split("\n").filter(Boolean)
          const events: unknown[] = []
          for (const line of lines) {
            try { events.push(JSON.parse(line)) } catch { /* skip malformed */ }
          }
          const sliced = tail ? events.slice(-tail) : events
          parts.push(
            `## Events (${sliced.length}${tail ? ` of ${events.length}` : ""})\n\n${JSON.stringify(sliced, null, 2)}`,
          )
        } else {
          parts.push("## Events\n\nNo event log found.")
        }
      }

      const artifactTypes = log_type === "all"
        ? ["output", "blockers", "verdict"]
        : [log_type]

      for (const type of artifactTypes) {
        if (type === "events") continue
        const filePath = path.join(logsDir, `${id}-${type}.md`)
        if (fs.existsSync(filePath)) {
          const content = fs.readFileSync(filePath, "utf-8")
          parts.push(`## ${type.charAt(0).toUpperCase() + type.slice(1)}\n\n${content}`)
        } else if (log_type !== "all") {
          parts.push(`## ${type.charAt(0).toUpperCase() + type.slice(1)}\n\nNo ${type} log found for '${id}'.`)
        }
      }

      return {
        content: [
          {
            type: "text" as const,
            text: parts.length > 0
              ? parts.join("\n\n---\n\n")
              : `No logs found for task '${id}'.`,
          },
        ],
      }
    },
  )

  // --- Tool: lm_status ---

  server.tool(
    "lm_status",
    "Check if LM Studio is running and which models are loaded.",
    {},
    async () => {
      const status = await checkLmStudio(lmStudioUrl)

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              {
                url: lmStudioUrl,
                available: status.available,
                models: status.models,
                error: status.error ?? null,
              },
              null,
              2,
            ),
          },
        ],
      }
    },
  )

  // =========================================================================
  // Knowledge Engine tools
  // =========================================================================

  // Lazy-init: open and sync the knowledge DB on first tool call
  let knowledgeReady = false
  const dbPaths = resolveDbPaths(projectRoot)
  const knowledgeBackend = new AlgorithmicBackend()

  function ensureKnowledgeDb() {
    const db = openDb(dbPaths.knowledge)
    if (!knowledgeReady) {
      applyKnowledgeSchema(db)
      syncFromFilesystem(db, projectRoot)
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

        // Temporal weighting: full detail for active, compressed for old integrated, exclude archived
        const initiatives = allSummaries
          .filter(s => s.status !== "archived" && s.status !== "declined")
          .map(s => {
            const isOldIntegrated = s.status === "integrated" && s.updated_at < twoWeeksAgo
            return {
              initiative: s.id,
              status: s.status,
              summary: isOldIntegrated ? s.summary.split(" — ")[0] ?? s.summary : s.summary,
              stale: Boolean(s.stale),
              detail: isOldIntegrated ? "mention" as const : "full" as const,
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

  // --- Authority tools (only when coordination DB is provided) ---
  if (opts?.coordinationDb) {
    registerAuthorityTools(server, opts.coordinationDb, projectRoot)
  }

  return server
}

