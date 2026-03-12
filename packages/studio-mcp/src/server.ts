#!/usr/bin/env node
/**
 * Sherpa Studio MCP Server — development control plane for Claude Code.
 *
 * Tool domains:
 *   Tasks: task_list, task_get, task_create, task_update, task_dispatch, task_logs
 *   Infrastructure: lm_status
 *
 * Run via .mcp.json config at repo root. Transport: stdio.
 * CRITICAL: No console.log — stdout IS the MCP transport. Use console.error for debug.
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js"
import { z } from "zod"
import fs from "node:fs"
import path from "node:path"
import { execSync, spawn } from "node:child_process"

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

  return server
}

// ---------------------------------------------------------------------------
// Standalone entrypoint — run with stdio transport
// ---------------------------------------------------------------------------

const server = createStudioMcpServer()
const transport = new StdioServerTransport()
await server.connect(transport)
