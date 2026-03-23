/**
 * Linear ↔ Sherpa Mapping
 *
 * Constants and converters for mapping between Sherpa task concepts
 * and Linear issue data. No Linear SDK dependency — works with
 * plain data shapes extracted from the SDK.
 */

import type { TaskBoardEntry } from "./tasks"

// ── Types ──────────────────────────────────────────────────────────

/** A label group that Sherpa creates in Linear. */
export interface SherpaLabelGroup {
  /** Display name of the label group in Linear. */
  name: string
  /** Label values within this group. */
  labels: readonly string[]
}

/** Simplified representation of a Linear issue for mapping purposes. */
export interface LinearIssueShape {
  id: string
  identifier: string
  title: string
  description?: string | null
  priority: number
  state: { type: string }
  labels: ReadonlyArray<{ name: string; groupName?: string }>
  createdAt: string
}

/** Shape returned by mapTaskToLinearInput — fields for Linear issue creation. */
export interface LinearIssueInput {
  title?: string
  description?: string
  priority: number
}

// ── Label Groups ───────────────────────────────────────────────────

export const SHERPA_LABEL_GROUPS: readonly SherpaLabelGroup[] = [
  {
    name: "Task Type",
    labels: [
      "code-implementation",
      "code-review",
      "architect",
      "research",
      "content-generation",
      "audit",
      "embeddings",
      "general",
    ],
  },
  {
    name: "Mode",
    labels: ["interactive", "supervised", "autonomous"],
  },
  {
    name: "Role",
    labels: [
      "engineer",
      "research-lead",
      "technical-writer",
      "code-reviewer",
      "designer",
    ],
  },
  {
    name: "Verdict",
    labels: ["pending", "approved", "needs-changes", "rejected"],
  },
] as const

// ── Priority Mapping ───────────────────────────────────────────────

const SHERPA_TO_LINEAR_PRIORITY: Record<string, number> = {
  urgent: 1,
  high: 2,
  medium: 3,
  low: 4,
}

const LINEAR_TO_SHERPA_PRIORITY: Record<number, string> = {
  1: "urgent",
  2: "high",
  3: "medium",
  4: "low",
}

// ── State Mapping ──────────────────────────────────────────────────

const LINEAR_STATE_TO_STATUS: Record<string, string> = {
  triage: "pending",
  backlog: "pending",
  unstarted: "pending",
  started: "dispatched",
  completed: "completed",
  canceled: "failed",
  duplicate: "failed",
}

// ── Label Group → Field Mapping ────────────────────────────────────

const LABEL_GROUP_TO_FIELD: Record<string, keyof TaskBoardEntry> = {
  "Task Type": "taskType",
  Mode: "mode",
  Role: "role",
  Verdict: "judgeVerdict",
}

// ── Public API ─────────────────────────────────────────────────────

/**
 * Convert a partial Sherpa task to a Linear issue creation input.
 *
 * Maps:
 * - `priority` string → Linear priority number (urgent=1, high=2, medium=3, low=4)
 * - Passes through `title` and `description`
 */
export function mapTaskToLinearInput(
  task: Partial<Pick<TaskBoardEntry, "title" | "priority">> & {
    description?: string
  }
): LinearIssueInput {
  const result: LinearIssueInput = {
    priority: task.priority
      ? (SHERPA_TO_LINEAR_PRIORITY[task.priority] ?? 0)
      : 0,
  }

  if (task.title !== undefined) result.title = task.title
  if (task.description !== undefined) result.description = task.description

  return result
}

/**
 * Convert a Linear issue shape to a partial TaskBoardEntry.
 *
 * Maps:
 * - Linear priority number → Sherpa priority string
 * - Linear workflow state type → Sherpa status
 * - Label group values → taskType, mode, role, judgeVerdict
 *
 * Framework-side fields (file, budgetUsd, worktree, branch, hasReport,
 * hasVerdict, hasBlockers, durationSeconds, tokensInput, tokensOutput,
 * costUsd) are not included — they have no Linear equivalent.
 */
export function mapLinearIssueToTask(
  issue: LinearIssueShape
): Partial<TaskBoardEntry> {
  const result: Partial<TaskBoardEntry> = {
    id: issue.id,
    title: issue.title,
    priority: LINEAR_TO_SHERPA_PRIORITY[issue.priority] ?? "medium",
    status: LINEAR_STATE_TO_STATUS[issue.state.type] ?? "pending",
    created: issue.createdAt,
  }

  // Extract label-group values
  for (const label of issue.labels) {
    if (!label.groupName) continue
    const field = LABEL_GROUP_TO_FIELD[label.groupName]
    if (field) {
      ;(result as Record<string, unknown>)[field] = label.name
    }
  }

  return result
}
