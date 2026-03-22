/**
 * Task Source Switcher
 *
 * Determines whether tasks are read from the local filesystem
 * or from the Linear API, based on the SHERPA_TASK_SOURCE env var.
 */

export type TaskSource = "filesystem" | "linear"

/** Determine task source from SHERPA_TASK_SOURCE env var. */
export function getTaskSource(): TaskSource {
  const source = process.env.SHERPA_TASK_SOURCE
  if (source === "linear") return "linear"
  return "filesystem"
}
