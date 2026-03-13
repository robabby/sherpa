#!/usr/bin/env node

/**
 * Scans docs/tasks/ for task files and returns structured data.
 *
 * Usage:
 *   node scripts/task-scanner.mjs                    # list all tasks
 *   node scripts/task-scanner.mjs --status pending   # filter by status
 *   node scripts/task-scanner.mjs --id <slug>        # get single task
 *   node scripts/task-scanner.mjs --role <role>      # filter by role
 *   node scripts/task-scanner.mjs --backend <backend> # filter by backend
 *   node scripts/task-scanner.mjs --task-type <type> # filter by task-type
 *   node scripts/task-scanner.mjs --mode <mode>      # filter by mode
 *   node scripts/task-scanner.mjs --stale [hours]    # find stale dispatched tasks (default: 2h)
 *   node scripts/task-scanner.mjs --update <slug> <field> <value>
 */

import fs from "fs";
import path from "path";

const TASKS_DIR = path.resolve(
  import.meta.dirname ?? path.dirname(new URL(import.meta.url).pathname),
  "../docs/tasks",
);

/** Recognized frontmatter fields (informational — parser handles any key). */
const KNOWN_FIELDS = [
  "id",
  "status",
  "role",
  "backend",
  "priority",
  "initiative",
  "dispatched-at",
  "task-type",
  "mode",
];

function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return { meta: {}, body: content };

  const meta = {};
  for (const line of match[1].split("\n")) {
    const colonIdx = line.indexOf(":");
    if (colonIdx === -1) continue;
    const key = line.slice(0, colonIdx).trim();
    let value = line.slice(colonIdx + 1).trim();
    if (value === "null") value = null;
    meta[key] = value;
  }
  return { meta, body: match[2] };
}

function serializeFrontmatter(meta, body) {
  const lines = Object.entries(meta).map(([k, v]) => `${k}: ${v ?? "null"}`);
  return `---\n${lines.join("\n")}\n---\n${body}`;
}

function scanTasks(filter = {}) {
  if (!fs.existsSync(TASKS_DIR)) return [];

  const files = fs
    .readdirSync(TASKS_DIR)
    .filter((f) => f.endsWith(".md") && f !== "README.md");
  const tasks = [];

  for (const file of files) {
    const content = fs.readFileSync(path.join(TASKS_DIR, file), "utf-8");
    const { meta, body } = parseFrontmatter(content);

    if (filter.status && meta.status !== filter.status) continue;
    if (filter.id && meta.id !== filter.id) continue;
    if (filter.role && meta.role !== filter.role) continue;
    if (filter.backend && meta.backend !== filter.backend) continue;
    if (filter["task-type"] && meta["task-type"] !== filter["task-type"]) continue;
    if (filter.mode && meta.mode !== filter.mode) continue;

    tasks.push({ file, ...meta, body });
  }

  const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
  tasks.sort(
    (a, b) => (priorityOrder[a.priority] ?? 9) - (priorityOrder[b.priority] ?? 9),
  );

  return tasks;
}

function findStaleTasks(thresholdHours = 2) {
  const tasks = scanTasks({ status: "dispatched" });
  const now = Date.now();
  const thresholdMs = thresholdHours * 60 * 60 * 1000;

  return tasks.filter((task) => {
    const dispatchedAt = task["dispatched-at"];
    if (!dispatchedAt || dispatchedAt === "null") return false;
    const ts = new Date(dispatchedAt).getTime();
    if (isNaN(ts)) return false;
    return (now - ts) > thresholdMs;
  }).map((task) => {
    const ts = new Date(task["dispatched-at"]).getTime();
    return {
      id: task.id,
      file: task.file,
      dispatchedAt: task["dispatched-at"],
      hoursElapsed: Math.round((now - ts) / 3600000 * 10) / 10,
      role: task.role,
      backend: task.backend,
    };
  });
}

function updateTask(slug, field, value) {
  const files = fs
    .readdirSync(TASKS_DIR)
    .filter((f) => f.endsWith(".md") && f !== "README.md");

  for (const file of files) {
    const filePath = path.join(TASKS_DIR, file);
    const content = fs.readFileSync(filePath, "utf-8");
    const { meta, body } = parseFrontmatter(content);

    if (meta.id === slug) {
      meta[field] = value === "null" ? null : value;
      fs.writeFileSync(filePath, serializeFrontmatter(meta, body));
      console.log(JSON.stringify({ updated: slug, field, value }));
      return;
    }
  }

  console.error(`Task not found: ${slug}`);
  process.exit(1);
}

const args = process.argv.slice(2);

if (args[0] === "--stale") {
  const hours = args[1] && !args[1].startsWith("--") ? parseFloat(args[1]) : 2;
  if (isNaN(hours) || hours < 0) {
    console.error("--stale requires a non-negative number of hours");
    process.exit(1);
  }
  const stale = findStaleTasks(hours);
  console.log(JSON.stringify(stale, null, 2));
} else if (args[0] === "--update" && args.length >= 4) {
  updateTask(args[1], args[2], args[3]);
} else {
  const filter = {};
  for (let i = 0; i < args.length; i += 2) {
    if (args[i] === "--status") filter.status = args[i + 1];
    if (args[i] === "--id") filter.id = args[i + 1];
    if (args[i] === "--role") filter.role = args[i + 1];
    if (args[i] === "--backend") filter.backend = args[i + 1];
    if (args[i] === "--task-type") filter["task-type"] = args[i + 1];
    if (args[i] === "--mode") filter.mode = args[i + 1];
  }
  const tasks = scanTasks(filter);
  console.log(JSON.stringify(tasks, null, 2));
}
