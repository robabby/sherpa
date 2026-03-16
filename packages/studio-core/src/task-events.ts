import fs from "fs";
import path from "path";

/**
 * A single event from a task's NDJSON event log.
 *
 * Event types:
 * - `dispatch_requested` — Task dispatch initiated from Studio UI
 * - `task_updated` — Task frontmatter field changed
 * - `worker_started` — Worker.sh began processing
 * - `status_changed` — Task status transition (pending→dispatched→completed/failed)
 * - `backend_delegating` — Worker delegating to backend script
 * - `dispatch_spawned` — Backend process started (PID assigned)
 * - `dispatch_failed` — Backend process failed to start
 * - `agent_output` — Batched text lines from agent's runtime output.
 *   Data: { lines: string[], batch: number, byteOffset: number, lineCount: number }
 */
export interface TaskEvent {
  timestamp: string;
  event: string;
  taskSlug: string;
  data: Record<string, unknown>;
}

export interface AgentMetrics {
  durationSeconds: number | null;
  tokensInput: number | null;
  tokensOutput: number | null;
  costUsd: number | null;
}

interface TaskEventsOptions {
  tasksDir?: string;
  projectRoot?: string;
}

function resolveTasksDir(opts?: TaskEventsOptions): string {
  if (opts?.tasksDir) return opts.tasksDir;
  const root = opts?.projectRoot ?? process.cwd();
  return path.resolve(root, "docs/tasks");
}

/**
 * Read a single task's NDJSON event log and return parsed events sorted chronologically.
 */
export function getTaskEvents(taskId: string, opts?: TaskEventsOptions): TaskEvent[] {
  const tasksDir = resolveTasksDir(opts);
  const logsDir = path.join(tasksDir, "logs");
  const filePath = path.join(logsDir, `${taskId}-events.ndjson`);

  if (!fs.existsSync(filePath)) return [];

  const content = fs.readFileSync(filePath, "utf-8");
  const events: TaskEvent[] = [];

  for (const line of content.split("\n").filter(Boolean)) {
    try {
      const parsed = JSON.parse(line) as Record<string, unknown>;
      events.push({
        timestamp: (parsed.timestamp as string) ?? (parsed.ts as string) ?? "",
        event: (parsed.event as string) ?? "unknown",
        taskSlug: taskId,
        data: parsed,
      });
    } catch {
      // Skip malformed lines
    }
  }

  // Sort chronologically (oldest first)
  events.sort((a, b) => a.timestamp.localeCompare(b.timestamp));
  return events;
}

/**
 * Extract agent metrics from a task's event log.
 *
 * - durationSeconds: from status_changed (to=completed), falling back to
 *   first/last event timestamps when the recorded value is negative.
 * - tokensInput / tokensOutput: from any event containing those fields.
 * - costUsd: from any event containing a costUsd field.
 */
export function extractAgentMetrics(taskId: string, opts?: TaskEventsOptions): AgentMetrics {
  const events = getTaskEvents(taskId, opts);

  let durationSeconds: number | null = null;
  let tokensInput: number | null = null;
  let tokensOutput: number | null = null;
  let costUsd: number | null = null;

  for (const ev of events) {
    const d = ev.data;

    // Duration from status_changed to=completed
    if (ev.event === "status_changed" && d.to === "completed" && typeof d.durationSeconds === "number") {
      durationSeconds = d.durationSeconds as number;
    }

    // Tokens
    if (typeof d.tokensInput === "number") {
      tokensInput = d.tokensInput as number;
    }
    if (typeof d.tokensOutput === "number") {
      tokensOutput = d.tokensOutput as number;
    }

    // Cost
    if (typeof d.costUsd === "number") {
      costUsd = d.costUsd as number;
    }
  }

  // Handle negative durationSeconds by computing from first/last event timestamps
  if (durationSeconds !== null && durationSeconds < 0 && events.length >= 2) {
    const first = events[0]!;
    const last = events[events.length - 1]!;
    const start = new Date(first.timestamp).getTime();
    const end = new Date(last.timestamp).getTime();
    if (!isNaN(start) && !isNaN(end) && end > start) {
      durationSeconds = Math.round((end - start) / 1000);
    } else {
      durationSeconds = null;
    }
  }

  return { durationSeconds, tokensInput, tokensOutput, costUsd };
}
