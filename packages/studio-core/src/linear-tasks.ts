/**
 * Linear Task Board
 *
 * Async task board and detail fetchers backed by the Linear API.
 * Mirrors the interface of `getTaskBoard()` and `getTaskDetail()`
 * from `tasks.ts`, but sources data from Linear issues instead of
 * local markdown files.
 *
 * Issues are fetched in a single GraphQL request (state, labels, and
 * label groups included) — the SDK's lazy-loaded relations would issue
 * hundreds of follow-up requests per board load and exhaust Linear's
 * hourly rate limit. Results are cached with a short TTL; on fetch
 * failure the most recent stale result is served so the board degrades
 * instead of dying.
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

interface RawIssueNode {
  id: string
  identifier: string
  title: string
  description?: string | null
  priority: number
  createdAt: string
  state: { type: string }
  labels: { nodes: Array<{ name: string; parent?: { name: string } | null }> }
}

interface IssuesQueryData {
  issues: { nodes: RawIssueNode[] }
}

// ── Internals ──────────────────────────────────────────────────────

function resolveClient(opts?: LinearTaskBoardOptions): LinearClient {
  return opts?.client ?? getLinearClient()
}

const ISSUE_FIELDS = `
  id
  identifier
  title
  description
  priority
  createdAt
  state { type }
  labels(first: 25) { nodes { name parent { name } } }
`

const BOARD_QUERY = `
  query StudioTaskBoard($first: Int!, $filter: IssueFilter) {
    issues(first: $first, filter: $filter) {
      nodes { ${ISSUE_FIELDS} }
    }
  }
`

function nodeToShape(node: RawIssueNode): LinearIssueShape {
  return {
    id: node.id,
    identifier: node.identifier,
    title: node.title,
    description: node.description,
    priority: node.priority,
    state: { type: node.state.type },
    labels: node.labels.nodes.map((l) => ({
      name: l.name,
      groupName: l.parent?.name,
    })),
    createdAt: node.createdAt,
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

// ── Cache ──────────────────────────────────────────────────────────

const BOARD_TTL_MS = 60_000

interface CacheEntry<T> {
  at: number
  data: T
}

const boardCache = new Map<string, CacheEntry<TaskBoardEntry[]>>()
const detailCache = new Map<string, CacheEntry<TaskDetail | null>>()

/** Test hook — clears the board/detail caches. */
export function clearLinearTaskCache(): void {
  boardCache.clear()
  detailCache.clear()
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
  const cacheKey = opts?.teamKey ?? "*"
  const cached = boardCache.get(cacheKey)
  if (cached && Date.now() - cached.at < BOARD_TTL_MS) {
    return cached.data
  }

  try {
    const client = resolveClient(opts)
    const filter = opts?.teamKey
      ? { team: { key: { eq: opts.teamKey } } }
      : undefined

    const res = await client.client.rawRequest<
      IssuesQueryData,
      { first: number; filter?: Record<string, unknown> }
    >(BOARD_QUERY, { first: 100, filter })

    const entries = (res.data?.issues.nodes ?? []).map((node) =>
      shapeToEntry(nodeToShape(node))
    )

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

    boardCache.set(cacheKey, { at: Date.now(), data: entries })
    return entries
  } catch (err) {
    if (cached) {
      console.warn(
        `[linear-tasks] board fetch failed, serving stale cache (${Math.round((Date.now() - cached.at) / 1000)}s old):`,
        err instanceof Error ? err.message : err
      )
      return cached.data
    }
    throw err
  }
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
  const parsed = parseIdentifier(identifier)
  if (!parsed) return null

  const cached = detailCache.get(identifier)
  if (cached && Date.now() - cached.at < BOARD_TTL_MS) {
    return cached.data
  }

  try {
    const client = resolveClient(opts)
    const res = await client.client.rawRequest<
      IssuesQueryData,
      { first: number; filter: Record<string, unknown> }
    >(BOARD_QUERY, {
      first: 1,
      filter: {
        team: { key: { eq: parsed.teamKey } },
        number: { eq: parsed.number },
      },
    })

    const node = res.data?.issues.nodes[0]
    if (!node) {
      detailCache.set(identifier, { at: Date.now(), data: null })
      return null
    }

    const shape = nodeToShape(node)
    const detail: TaskDetail = {
      ...shapeToEntry(shape),
      body: shape.description ?? "",
      reportContent: null,
      verdictContent: null,
      blockerContent: null,
    }
    detailCache.set(identifier, { at: Date.now(), data: detail })
    return detail
  } catch (err) {
    if (cached) {
      console.warn(
        `[linear-tasks] detail fetch failed for ${identifier}, serving stale cache:`,
        err instanceof Error ? err.message : err
      )
      return cached.data
    }
    throw err
  }
}
