/**
 * Task types and pure utilities.
 *
 * Type definitions for the task board system. Data is sourced from
 * Linear (see linear-tasks.ts) — this module contains only types
 * and pure functions with no filesystem dependency.
 */

export interface TaskBoardEntry {
  id: string;
  file: string;
  status: string;
  role: string;
  priority: string;
  initiative: string | null;
  backend: string;
  model: string;
  budgetUsd: string;
  worktree: string | null;
  branch: string | null;
  created: string;
  dispatchedAt: string | null;
  completedAt: string | null;
  judgeVerdict: string;
  title: string;
  hasReport: boolean;
  hasVerdict: boolean;
  taskType: string;
  mode: string;
  hasBlockers: boolean;
  durationSeconds: number | null;
  tokensInput: number | null;
  tokensOutput: number | null;
  costUsd: number | null;
}

export interface TaskDetail extends TaskBoardEntry {
  body: string;
  reportContent: string | null;
  verdictContent: string | null;
  blockerContent: string | null;
}

export interface TaskStats {
  pending: number;
  dispatched: number;
  completed: number;
  reviewed: number;
  failed: number;
  awaitingReview: number;
}

export function getTaskStats(tasks: TaskBoardEntry[]): TaskStats {
  const stats: TaskStats = {
    pending: 0,
    dispatched: 0,
    completed: 0,
    reviewed: 0,
    failed: 0,
    awaitingReview: 0,
  };
  for (const t of tasks) {
    if (t.status in stats) stats[t.status as keyof Omit<TaskStats, "awaitingReview">]++;
    if (t.status === "completed" && t.judgeVerdict === "pending") stats.awaitingReview++;
  }
  return stats;
}
