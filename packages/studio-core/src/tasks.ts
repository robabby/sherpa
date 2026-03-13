import fs from "fs";
import path from "path";

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
}

function parseFrontmatter(content: string): { meta: Record<string, string | null>; body: string } {
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return { meta: {}, body: content };

  const meta: Record<string, string | null> = {};
  for (const line of match[1]!.split("\n")) {
    const colonIdx = line.indexOf(":");
    if (colonIdx === -1) continue;
    const key = line.slice(0, colonIdx).trim();
    const value = line.slice(colonIdx + 1).trim();
    meta[key] = value === "null" ? null : value;
  }
  return { meta, body: match[2] ?? "" };
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

export interface TaskBoardOptions {
  /** Absolute path to the tasks directory. */
  tasksDir?: string;
  /** Absolute path to the project root. Used to resolve default tasksDir. */
  projectRoot?: string;
}

function resolveTasksDir(opts?: TaskBoardOptions): string {
  if (opts?.tasksDir) return opts.tasksDir;
  const root = opts?.projectRoot ?? process.cwd();
  return path.resolve(root, "docs/tasks");
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

export function getTaskDetail(slug: string, opts?: TaskBoardOptions): TaskDetail | null {
  const tasksDir = resolveTasksDir(opts);
  const logsDir = path.join(tasksDir, "logs");

  if (!fs.existsSync(tasksDir)) return null;

  // Try direct filename match first, then scan for matching id frontmatter
  const candidates = [
    path.join(tasksDir, `${slug}.md`),
  ];

  let filePath: string | null = null;
  for (const c of candidates) {
    if (fs.existsSync(c)) { filePath = c; break; }
  }

  // Fallback: scan all task files for matching id
  if (!filePath) {
    const files = fs.readdirSync(tasksDir).filter((f) => f.endsWith(".md") && f !== "README.md");
    for (const file of files) {
      const content = fs.readFileSync(path.join(tasksDir, file), "utf-8");
      const { meta } = parseFrontmatter(content);
      if (meta.id === slug) { filePath = path.join(tasksDir, file); break; }
    }
  }

  if (!filePath) return null;

  const content = fs.readFileSync(filePath, "utf-8");
  const { meta, body } = parseFrontmatter(content);

  const titleMatch = body.match(/^# (.+)$/m);
  const id = meta.id ?? slug;
  const title = titleMatch?.[1] ?? id;

  const readLog = (suffix: string): string | null => {
    for (const name of [`${id}-${suffix}.md`]) {
      const p = path.join(logsDir, name);
      if (fs.existsSync(p)) return fs.readFileSync(p, "utf-8");
    }
    return null;
  };

  return {
    id,
    file: path.basename(filePath),
    status: meta.status ?? "unknown",
    role: meta.role ?? "unknown",
    priority: meta.priority ?? "medium",
    initiative: meta.initiative ?? null,
    backend: meta.backend ?? "claude",
    model: meta.model ?? "unknown",
    budgetUsd: meta["budget-usd"] ?? "1.00",
    worktree: meta.worktree ?? null,
    branch: meta.branch ?? null,
    created: meta.created ?? "",
    dispatchedAt: meta["dispatched-at"] ?? null,
    completedAt: meta["completed-at"] ?? null,
    judgeVerdict: meta["judge-verdict"] ?? "pending",
    taskType: meta['task-type'] ?? 'general',
    mode: meta.mode ?? 'supervised',
    title,
    hasReport: fs.existsSync(path.join(logsDir, `${id}-report.md`)) ||
               fs.existsSync(path.join(logsDir, `${id}-output.md`)),
    hasVerdict: fs.existsSync(path.join(logsDir, `${id}-verdict.md`)),
    hasBlockers: fs.existsSync(path.join(logsDir, `${id}-blockers.md`)),
    body,
    reportContent: readLog("report") ?? readLog("output"),
    verdictContent: readLog("verdict"),
    blockerContent: readLog("blockers"),
  };
}

export function getTaskBoard(opts?: TaskBoardOptions): TaskBoardEntry[] {
  const tasksDir = resolveTasksDir(opts);
  const logsDir = path.join(tasksDir, "logs");

  if (!fs.existsSync(tasksDir)) return [];

  const files = fs.readdirSync(tasksDir).filter((f) => f.endsWith(".md") && f !== "README.md");
  const tasks: TaskBoardEntry[] = [];

  for (const file of files) {
    const content = fs.readFileSync(path.join(tasksDir, file), "utf-8");
    const { meta, body } = parseFrontmatter(content);

    // Extract title from first H1 in body
    const titleMatch = body.match(/^# (.+)$/m);
    const title = titleMatch?.[1] ?? meta.id ?? file;

    const id = meta.id ?? file.replace(".md", "");

    tasks.push({
      id,
      file,
      status: meta.status ?? "unknown",
      role: meta.role ?? "unknown",
      priority: meta.priority ?? "medium",
      initiative: meta.initiative ?? null,
      backend: meta.backend ?? "claude",
      model: meta.model ?? "unknown",
      budgetUsd: meta["budget-usd"] ?? "1.00",
      worktree: meta.worktree ?? null,
      branch: meta.branch ?? null,
      created: meta.created ?? "",
      dispatchedAt: meta["dispatched-at"] ?? null,
      completedAt: meta["completed-at"] ?? null,
      judgeVerdict: meta["judge-verdict"] ?? "pending",
      taskType: meta['task-type'] ?? 'general',
      mode: meta.mode ?? 'supervised',
      title,
      hasReport: fs.existsSync(path.join(logsDir, `${id}-report.md`)) ||
                 fs.existsSync(path.join(logsDir, `${id}-output.md`)),
      hasVerdict: fs.existsSync(path.join(logsDir, `${id}-verdict.md`)),
      hasBlockers: fs.existsSync(path.join(logsDir, `${id}-blockers.md`)),
    });
  }

  const priorityOrder: Record<string, number> = { urgent: 0, high: 1, medium: 2, low: 3 };
  tasks.sort((a, b) => (priorityOrder[a.priority] ?? 9) - (priorityOrder[b.priority] ?? 9));

  return tasks;
}
