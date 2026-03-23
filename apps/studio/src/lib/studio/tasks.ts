import { getLinearTaskBoard, getLinearTaskDetail } from "@sherpa/studio-core";
import type { TaskBoardEntry, TaskDetail } from "@sherpa/studio-core";
import type { LinearTaskBoardOptions } from "@sherpa/studio-core";

export type { TaskBoardEntry, TaskDetail, LinearTaskBoardOptions };

/** Fetch task board from Linear. */
export async function getTaskBoard(opts?: LinearTaskBoardOptions): Promise<TaskBoardEntry[]> {
  return getLinearTaskBoard(opts);
}

/** Fetch task detail from Linear by identifier (e.g., "ENG-42"). */
export async function getTaskDetail(identifier: string, opts?: LinearTaskBoardOptions): Promise<TaskDetail | null> {
  return getLinearTaskDetail(identifier, opts);
}
