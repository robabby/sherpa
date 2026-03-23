/**
 * Linear Task Board
 *
 * Async task board and detail fetchers backed by the Linear API.
 * Mirrors the interface of `getTaskBoard()` and `getTaskDetail()`
 * from `tasks.ts`, but sources data from Linear issues instead of
 * local markdown files.
 */

import type { LinearClient } from "@linear/sdk"
import type { TaskBoardEntry, TaskDetail } from "./tasks"
import { type LinearIssueShape, mapLinearIssueToTask } from "./linear-mapping"
import { getLinearClient } from "./linear-client"

// ── Types ──────────────────────────────────────────────────────────

export interface LinearTaskBoardOptions {
  /** Optional pre-configured Linear client. */
  client?: LinearClient
  /** Optional team key to filter issues by team. */
  teamKey?: string
}

// ── Internals ──────────────────────────────────────────────────────

function resolveClient(opts?: LinearTaskBoardOptions): LinearClient {
  return opts?.client ?? getLinearClient()
}

/**
 * Resolve a Linear SDK issue node (with lazy-loaded relations)
 * into a flat LinearIssueShape suitable for mapping.
 */
async function issueToShape(issue: {
  id: string
  identifier: string
  title: string
  description?: string | null
  priority: number
  createdAt: Date
  state: Promise<{ type: string }> | { type: string }
  labels: () => Promise<{
    nodes: Array<{
      name: string
      parent: Promise<{ name: string } | undefined | null> | { name: string } | undefined | null
    }>
  }>
}): Promise<LinearIssueShape> {
  const state = await issue.state
  const labelsConnection = await issue.labels()
  const labels = await Promise.all(
    labelsConnection.nodes.map(async (l) => {
      const parent = await l.parent
      return {
        name: l.name,
        groupName: parent?.name,
      }
    })
  )

  return {
    id: issue.id,
    identifier: issue.identifier,
    title: issue.title,
    description: issue.description,
    priority: issue.priority,
    state: { type: state.type },
    labels,
    createdAt: issue.createdAt.toISOString(),
  }
}

function shapeToEntry(shape: LinearIssueShape): TaskBoardEntry {
  const partial = mapLinearIssueToTask(shape)
  return {
    id: shape.identifier,
    file: "",
    status: partial.status ?? "pending",
    role: partial.role ?? "engineer",
    priority: partial.priority ?? "medium",
    initiative: null,
    backend: "",
    model: "",
    budgetUsd: "0.00",
    worktree: null,
    branch: null,
    created: partial.created ?? "",
    dispatchedAt: null,
    completedAt: null,
    judgeVerdict: partial.judgeVerdict ?? "pending",
    title: partial.title ?? "",
    hasReport: false,
    hasVerdict: false,
    taskType: partial.taskType ?? "general",
    mode: partial.mode ?? "supervised",
    hasBlockers: false,
    durationSeconds: null,
    tokensInput: null,
    tokensOutput: null,
    costUsd: null,
  }
}

// ── Public API ─────────────────────────────────────────────────────

/**
 * Fetch all issues from Linear and return them as `TaskBoardEntry[]`.
 *
 * When `teamKey` is provided, only issues belonging to that team are
 * returned. Otherwise all issues visible to the API key are fetched.
 */
export async function getLinearTaskBoard(
  opts?: LinearTaskBoardOptions
): Promise<TaskBoardEntry[]> {
  const client = resolveClient(opts)

  // Build filter — optionally scope to a team
  const filter: Record<string, unknown> = {}
  if (opts?.teamKey) {
    filter.team = { key: { eq: opts.teamKey } }
  }

  const issuesConnection = await client.issues({
    first: 100,
    filter: Object.keys(filter).length > 0 ? filter : undefined,
  })

  const entries: TaskBoardEntry[] = []
  for (const issue of issuesConnection.nodes) {
    const shape = await issueToShape(issue as any)
    entries.push(shapeToEntry(shape))
  }

  // Sort by priority (same order as tasks.ts)
  const priorityOrder: Record<string, number> = {
    urgent: 0,
    high: 1,
    medium: 2,
    low: 3,
  }
  entries.sort(
    (a, b) =>
      (priorityOrder[a.priority] ?? 9) - (priorityOrder[b.priority] ?? 9)
  )

  return entries
}

/**
 * Parse a Linear identifier like "SHR-42" into team key and issue number.
 * Returns null if the format is invalid.
 */
function parseIdentifier(
  identifier: string
): { teamKey: string; number: number } | null {
  const match = identifier.match(/^([A-Za-z]+)-(\d+)$/)
  if (!match) return null
  return { teamKey: match[1]!, number: parseInt(match[2]!, 10) }
}

/**
 * Fetch a single issue from Linear by its identifier (e.g. "ENG-42")
 * and return it as a `TaskDetail`, or `null` if not found.
 */
export async function getLinearTaskDetail(
  identifier: string,
  opts?: LinearTaskBoardOptions
): Promise<TaskDetail | null> {
  const client = resolveClient(opts)

  const parsed = parseIdentifier(identifier)
  if (!parsed) return null

  const issuesConnection = await client.issues({
    first: 1,
    filter: {
      team: { key: { eq: parsed.teamKey } },
      number: { eq: parsed.number },
    },
  })

  if (issuesConnection.nodes.length === 0) return null

  const issue = issuesConnection.nodes[0]!
  const shape = await issueToShape(issue as any)
  const entry = shapeToEntry(shape)

  return {
    ...entry,
    body: shape.description ?? "",
    reportContent: null,
    verdictContent: null,
    blockerContent: null,
  }
}
