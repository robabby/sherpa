import { getLinearTaskBoard, getLinearTaskDetail } from "@sherpa/studio-core";
import type { TaskBoardEntry, TaskDetail } from "@sherpa/studio-core";
import type { LinearTaskBoardOptions } from "@sherpa/studio-core";

export type { TaskBoardEntry, TaskDetail, LinearTaskBoardOptions };

/**
 * Fetch task board from Linear. Falls back to an empty board when Linear
 * is unreachable (and no stale cache exists) so pages render instead of
 * erroring — the board is a view, not a dependency.
 */
export async function getTaskBoard(opts?: LinearTaskBoardOptions): Promise<TaskBoardEntry[]> {
  try {
    return await getLinearTaskBoard(opts);
  } catch (err) {
    console.error(
      "[tasks] Linear task board unavailable, rendering empty board:",
      err instanceof Error ? err.message : err,
    );
    return [];
  }
}

/** Fetch task detail from Linear by identifier (e.g., "ENG-42"). */
export async function getTaskDetail(identifier: string, opts?: LinearTaskBoardOptions): Promise<TaskDetail | null> {
  try {
    return await getLinearTaskDetail(identifier, opts);
  } catch (err) {
    console.error(
      `[tasks] Linear task detail unavailable for ${identifier}:`,
      err instanceof Error ? err.message : err,
    );
    return null;
  }
}
