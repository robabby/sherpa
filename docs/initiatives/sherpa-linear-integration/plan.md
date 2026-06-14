# Sherpa × Linear Integration — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace Sherpa's filesystem-based task state management with Linear as the state backend, keeping all governance/dispatch logic framework-native, and register Sherpa as a Linear Agent.

**Architecture:** Hard switchover — no feature flag. Linear IS the task backend. Zone 1 (DELETE): task CRUD code, `task-source.ts`, filesystem task scanning. Zone 2 (REPLACE): `getTaskBoard()` and `getTaskDetail()` become async, Linear-backed. Zone 3 (KEEP): dispatch pipeline, telemetry, judge system, initiative system, Studio governance UI. The `@linear/sdk` TypeScript client is the primary integration surface.

**Tech Stack:** `@linear/sdk` (TypeScript, auto-generated from Linear's GraphQL schema), Next.js 16 (RSC), `@sherpa/studio-core` (domain logic), `@sherpa/studio-mcp` (MCP server), shadcn/ui (Tailwind v4, new-york style, radix base), pnpm workspace monorepo.

---

## Session 1: Linear Client Foundation + Label Group Setup

**Objective:** Create the Linear API client in `studio-core`, configure a Linear workspace with Sherpa's task taxonomy as label groups, and write the type mapping layer.

### Task 1.1: Add `@linear/sdk` dependency

**Files:**
- Modify: `packages/studio-core/package.json`

**Step 1: Install the SDK**

```bash
cd /Users/rob/Workbench/sherpa && pnpm add @linear/sdk --filter @sherpa/studio-core
```

**Step 2: Verify installation**

```bash
pnpm check
```

Expected: No type errors.

**Step 3: Commit**

```bash
git add packages/studio-core/package.json pnpm-lock.yaml
git commit -m "deps: add @linear/sdk to studio-core"
```

---

### Task 1.2: Create Linear client module

**Files:**
- Create: `packages/studio-core/src/linear-client.ts`

This module wraps `@linear/sdk` with Sherpa-specific configuration. It reads the API key from `SHERPA_LINEAR_API_KEY` env var and exports a singleton client plus typed helpers.

**Step 1: Write the failing test**

Create: `packages/studio-core/src/__tests__/linear-client.test.ts`

```typescript
import { describe, it, expect, vi } from "vitest";

describe("linear-client", () => {
  it("exports createLinearClient function", async () => {
    const mod = await import("../linear-client");
    expect(typeof mod.createLinearClient).toBe("function");
  });

  it("throws when API key is missing", () => {
    const { createLinearClient } = require("../linear-client");
    expect(() => createLinearClient()).toThrow(/SHERPA_LINEAR_API_KEY/);
  });
});
```

**Step 2: Run test to verify it fails**

```bash
cd /Users/rob/Workbench/sherpa && pnpm exec vitest run packages/studio-core/src/__tests__/linear-client.test.ts
```

Expected: FAIL — module not found.

**Step 3: Write implementation**

```typescript
import { LinearClient } from "@linear/sdk";

export interface LinearClientOptions {
  apiKey?: string;
}

export function createLinearClient(opts?: LinearClientOptions): LinearClient {
  const apiKey = opts?.apiKey ?? process.env.SHERPA_LINEAR_API_KEY;
  if (!apiKey) {
    throw new Error(
      "Linear API key required. Set SHERPA_LINEAR_API_KEY env var or pass apiKey option.",
    );
  }
  return new LinearClient({ apiKey });
}

let _cachedClient: LinearClient | null = null;

/** Get or create the shared Linear client instance. */
export function getLinearClient(): LinearClient {
  if (!_cachedClient) {
    _cachedClient = createLinearClient();
  }
  return _cachedClient;
}

/** Reset the cached client (for testing). */
export function resetLinearClient(): void {
  _cachedClient = null;
}
```

**Step 4: Run test to verify it passes**

```bash
cd /Users/rob/Workbench/sherpa && pnpm exec vitest run packages/studio-core/src/__tests__/linear-client.test.ts
```

Expected: PASS.

**Step 5: Commit**

```bash
git add packages/studio-core/src/linear-client.ts packages/studio-core/src/__tests__/linear-client.test.ts
git commit -m "feat(studio-core): add Linear API client wrapper"
```

---

### Task 1.3: Create label group mapping constants

**Files:**
- Create: `packages/studio-core/src/linear-mapping.ts`

This module defines how Sherpa's task taxonomy maps to Linear label groups. It's a pure data module — no API calls. These constants drive both the workspace setup script and the runtime query/mutation layer.

**Step 1: Write the failing test**

Create: `packages/studio-core/src/__tests__/linear-mapping.test.ts`

```typescript
import { describe, it, expect } from "vitest";
import {
  SHERPA_LABEL_GROUPS,
  mapTaskToLinearInput,
  mapLinearIssueToTask,
} from "../linear-mapping";

describe("linear-mapping", () => {
  it("defines label groups for task-type, mode, role, verdict", () => {
    expect(SHERPA_LABEL_GROUPS).toHaveProperty("task-type");
    expect(SHERPA_LABEL_GROUPS).toHaveProperty("mode");
    expect(SHERPA_LABEL_GROUPS).toHaveProperty("role");
    expect(SHERPA_LABEL_GROUPS).toHaveProperty("verdict");
  });

  it("maps Sherpa priority to Linear priority number", () => {
    const result = mapTaskToLinearInput({
      title: "Test",
      priority: "urgent",
      taskType: "research",
    });
    expect(result.priority).toBe(1);
  });

  it("maps Linear priority number to Sherpa priority string", () => {
    const result = mapLinearIssueToTask({
      id: "abc",
      identifier: "ENG-1",
      title: "Test",
      priority: 2,
      state: { name: "Todo", type: "unstarted" },
      labels: { nodes: [] },
      createdAt: "2026-03-21T00:00:00Z",
    });
    expect(result.priority).toBe("high");
  });
});
```

**Step 2: Run test to verify it fails**

```bash
cd /Users/rob/Workbench/sherpa && pnpm exec vitest run packages/studio-core/src/__tests__/linear-mapping.test.ts
```

Expected: FAIL — module not found.

**Step 3: Write implementation**

```typescript
import type { TaskBoardEntry } from "./tasks";

/** Label groups that Sherpa creates in a Linear workspace. */
export const SHERPA_LABEL_GROUPS = {
  "task-type": {
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
  mode: {
    name: "Mode",
    labels: ["interactive", "supervised", "autonomous"],
  },
  role: {
    name: "Role",
    labels: [
      "engineer",
      "research-lead",
      "technical-writer",
      "code-reviewer",
      "designer",
    ],
  },
  verdict: {
    name: "Verdict",
    labels: ["pending", "approved", "needs-changes", "rejected"],
  },
} as const;

/** Map Sherpa priority string to Linear priority number. */
const PRIORITY_TO_LINEAR: Record<string, number> = {
  urgent: 1,
  high: 2,
  medium: 3,
  low: 4,
};

/** Map Linear priority number to Sherpa priority string. */
const LINEAR_TO_PRIORITY: Record<number, string> = {
  0: "medium", // "No priority" defaults to medium
  1: "urgent",
  2: "high",
  3: "medium",
  4: "low",
};

/** Map Linear workflow state type to Sherpa task status. */
const STATE_TYPE_TO_STATUS: Record<string, string> = {
  triage: "pending",
  backlog: "pending",
  unstarted: "pending",
  started: "dispatched",
  completed: "completed",
  canceled: "failed",
  duplicate: "failed",
};

export interface LinearIssueInput {
  title: string;
  description?: string;
  priority: number;
  labelIds?: string[];
}

export interface LinearIssueShape {
  id: string;
  identifier: string;
  title: string;
  priority: number;
  state: { name: string; type: string };
  labels: { nodes: Array<{ name: string; parent?: { name: string } | null }> };
  createdAt: string;
  updatedAt?: string;
  completedAt?: string | null;
  assignee?: { name: string } | null;
  description?: string | null;
}

export function mapTaskToLinearInput(task: {
  title: string;
  priority?: string;
  taskType?: string;
  description?: string;
}): LinearIssueInput {
  return {
    title: task.title,
    description: task.description,
    priority: PRIORITY_TO_LINEAR[task.priority ?? "medium"] ?? 3,
  };
}

/** Extract a label value from a specific group. */
function labelFromGroup(
  labels: LinearIssueShape["labels"],
  groupName: string,
): string {
  const match = labels.nodes.find((l) => l.parent?.name === groupName);
  return match?.name ?? "";
}

export function mapLinearIssueToTask(
  issue: LinearIssueShape,
): Omit<
  TaskBoardEntry,
  | "file"
  | "budgetUsd"
  | "worktree"
  | "branch"
  | "hasReport"
  | "hasVerdict"
  | "hasBlockers"
  | "durationSeconds"
  | "tokensInput"
  | "tokensOutput"
  | "costUsd"
> {
  return {
    id: issue.identifier,
    status: STATE_TYPE_TO_STATUS[issue.state.type] ?? "pending",
    role: labelFromGroup(issue.labels, "Role") || "engineer",
    priority: LINEAR_TO_PRIORITY[issue.priority] ?? "medium",
    initiative: null,
    backend: "",
    model: "",
    created: issue.createdAt,
    dispatchedAt: null,
    completedAt: issue.completedAt ?? null,
    judgeVerdict: labelFromGroup(issue.labels, "Verdict") || "pending",
    title: issue.title,
    taskType: labelFromGroup(issue.labels, "Task Type") || "general",
    mode: labelFromGroup(issue.labels, "Mode") || "supervised",
  };
}
```

**Step 4: Run test to verify it passes**

```bash
cd /Users/rob/Workbench/sherpa && pnpm exec vitest run packages/studio-core/src/__tests__/linear-mapping.test.ts
```

Expected: PASS.

**Step 5: Commit**

```bash
git add packages/studio-core/src/linear-mapping.ts packages/studio-core/src/__tests__/linear-mapping.test.ts
git commit -m "feat(studio-core): add Linear label group mapping and type converters"
```

---

### Task 1.4: Create workspace setup script

**Files:**
- Create: `scripts/linear-setup.mjs`

One-time script that creates label groups and workflow states in a Linear workspace. Idempotent — skips groups that already exist.

**Step 1: Write the script**

```javascript
#!/usr/bin/env node
/**
 * One-time Linear workspace setup for Sherpa.
 * Creates label groups and labels matching Sherpa's task taxonomy.
 * Idempotent — skips existing groups/labels.
 *
 * Usage: SHERPA_LINEAR_API_KEY=lin_... node scripts/linear-setup.mjs
 */
import { LinearClient } from "@linear/sdk";

const apiKey = process.env.SHERPA_LINEAR_API_KEY;
if (!apiKey) {
  console.error("Set SHERPA_LINEAR_API_KEY env var");
  process.exit(1);
}

const client = new LinearClient({ apiKey });

const LABEL_GROUPS = {
  "Task Type": [
    "code-implementation", "code-review", "architect", "research",
    "content-generation", "audit", "embeddings", "general",
  ],
  "Mode": ["interactive", "supervised", "autonomous"],
  "Role": ["engineer", "research-lead", "technical-writer", "code-reviewer", "designer"],
  "Verdict": ["pending", "approved", "needs-changes", "rejected"],
};

async function main() {
  const org = await client.organization;
  console.log(`Setting up Linear workspace: ${org.name}`);

  // Fetch existing labels
  const existingLabels = await client.issueLabels({ first: 250 });
  const existingNames = new Set(existingLabels.nodes.map((l) => l.name));

  for (const [groupName, labels] of Object.entries(LABEL_GROUPS)) {
    // Check if group already exists
    const existingGroup = existingLabels.nodes.find(
      (l) => l.name === groupName && l.isGroup,
    );

    let groupId;
    if (existingGroup) {
      console.log(`  ✓ Group "${groupName}" already exists`);
      groupId = existingGroup.id;
    } else {
      const result = await client.createIssueLabel({ name: groupName, isGroup: true });
      const label = await result.issueLabel;
      if (!label) throw new Error(`Failed to create group: ${groupName}`);
      groupId = label.id;
      console.log(`  + Created group "${groupName}"`);
    }

    // Create labels within group
    for (const labelName of labels) {
      if (existingNames.has(labelName)) {
        console.log(`    ✓ Label "${labelName}" already exists`);
        continue;
      }
      await client.createIssueLabel({ name: labelName, parentId: groupId });
      console.log(`    + Created label "${labelName}"`);
    }
  }

  console.log("\nDone. Label groups configured for Sherpa task taxonomy.");
}

main().catch((err) => {
  console.error("Setup failed:", err.message);
  process.exit(1);
});
```

**Step 2: Test manually (requires Linear API key)**

```bash
SHERPA_LINEAR_API_KEY=lin_... node scripts/linear-setup.mjs
```

Expected: Labels created or skipped with ✓/+ output.

**Step 3: Commit**

```bash
git add scripts/linear-setup.mjs
git commit -m "feat: add Linear workspace setup script for label groups"
```

---

## Session 2: Linear Task Data Layer

**Objective:** Create `linear-tasks.ts` — a drop-in replacement for `tasks.ts` that reads from Linear's API instead of the filesystem. Same `TaskBoardEntry`/`TaskDetail` interfaces, new backend.

### Task 2.1: Create linear-tasks module

**Files:**
- Create: `packages/studio-core/src/linear-tasks.ts`
- Create: `packages/studio-core/src/__tests__/linear-tasks.test.ts`

**Step 1: Write the failing test**

```typescript
import { describe, it, expect, vi } from "vitest";

// Mock the Linear SDK
vi.mock("@linear/sdk", () => ({
  LinearClient: vi.fn().mockImplementation(() => ({
    issues: vi.fn().mockResolvedValue({
      nodes: [
        {
          id: "abc-123",
          identifier: "ENG-1",
          title: "Test task",
          priority: 2,
          description: "## Objective\nDo the thing",
          createdAt: "2026-03-21T00:00:00Z",
          updatedAt: "2026-03-21T01:00:00Z",
          completedAt: null,
          state: { name: "Todo", type: "unstarted" },
          labels: { nodes: [{ name: "research", parent: { name: "Task Type" } }] },
          assignee: null,
        },
      ],
      pageInfo: { hasNextPage: false },
    }),
    issue: vi.fn().mockResolvedValue({
      id: "abc-123",
      identifier: "ENG-1",
      title: "Test task",
      priority: 2,
      description: "## Objective\nDo the thing",
      createdAt: "2026-03-21T00:00:00Z",
      updatedAt: "2026-03-21T01:00:00Z",
      completedAt: null,
      state: { name: "Todo", type: "unstarted" },
      labels: { nodes: [{ name: "research", parent: { name: "Task Type" } }] },
      assignee: null,
      comments: { nodes: [] },
    }),
  })),
}));

describe("linear-tasks", () => {
  it("getLinearTaskBoard returns TaskBoardEntry[]", async () => {
    const { getLinearTaskBoard } = await import("../linear-tasks");
    const tasks = await getLinearTaskBoard();
    expect(tasks).toHaveLength(1);
    expect(tasks[0].id).toBe("ENG-1");
    expect(tasks[0].status).toBe("pending");
    expect(tasks[0].taskType).toBe("research");
    expect(tasks[0].priority).toBe("high");
  });
});
```

**Step 2: Run test to verify it fails**

```bash
cd /Users/rob/Workbench/sherpa && pnpm exec vitest run packages/studio-core/src/__tests__/linear-tasks.test.ts
```

Expected: FAIL — module not found.

**Step 3: Write implementation**

```typescript
import { LinearClient } from "@linear/sdk";
import type { TaskBoardEntry, TaskDetail } from "./tasks";
import { mapLinearIssueToTask } from "./linear-mapping";
import type { LinearIssueShape } from "./linear-mapping";
import { getLinearClient } from "./linear-client";
import { extractAgentMetrics } from "./task-events";

export interface LinearTaskBoardOptions {
  client?: LinearClient;
  teamKey?: string;
  projectRoot?: string;
}

/** Fetch tasks from Linear and return as TaskBoardEntry[]. */
export async function getLinearTaskBoard(
  opts?: LinearTaskBoardOptions,
): Promise<TaskBoardEntry[]> {
  const client = opts?.client ?? getLinearClient();
  const issues = await client.issues({
    first: 100,
    includeArchived: false,
  });

  return issues.nodes.map((issue) => {
    const issueShape: LinearIssueShape = {
      id: issue.id,
      identifier: issue.identifier,
      title: issue.title,
      priority: issue.priority,
      state: { name: "", type: "" }, // filled below
      labels: { nodes: [] }, // filled below
      createdAt: issue.createdAt.toISOString(),
      updatedAt: issue.updatedAt?.toISOString(),
      completedAt: issue.completedAt?.toISOString() ?? null,
      description: issue.description ?? null,
    };

    // Map the partial fields from the SDK response
    const partial = mapLinearIssueToTask(issueShape);

    // Merge with defaults for fields that stay framework-side
    const metrics = opts?.projectRoot
      ? extractAgentMetrics(partial.id, { projectRoot: opts.projectRoot })
      : { durationSeconds: null, tokensInput: null, tokensOutput: null, costUsd: null };

    const entry: TaskBoardEntry = {
      ...partial,
      file: "",
      budgetUsd: "0.00",
      worktree: null,
      branch: null,
      hasReport: false,
      hasVerdict: false,
      hasBlockers: false,
      ...metrics,
    };

    return entry;
  });
}

/** Fetch a single task from Linear with full detail. */
export async function getLinearTaskDetail(
  identifier: string,
  opts?: LinearTaskBoardOptions,
): Promise<TaskDetail | null> {
  const client = opts?.client ?? getLinearClient();

  // Linear identifiers are like "ENG-1"; the SDK issue() takes the UUID
  // Use a filter query instead
  const issues = await client.issues({
    first: 1,
    filter: { identifier: { eq: identifier } },
  });

  const issue = issues.nodes[0];
  if (!issue) return null;

  const board = await getLinearTaskBoard({ ...opts, client });
  const entry = board.find((t) => t.id === identifier);
  if (!entry) return null;

  return {
    ...entry,
    body: issue.description ?? "",
    reportContent: null,
    verdictContent: null,
    blockerContent: null,
  };
}
```

> **Note:** This is the initial implementation. The `state` and `labels` fields require awaiting sub-queries on the Linear SDK models. Refine during implementation based on actual SDK behavior — the Linear SDK uses lazy-loading where `issue.state` returns a promise, not an object. Wrap with `await issue.state` and `await issue.labels()` as needed.

**Step 4: Run test to verify it passes**

```bash
cd /Users/rob/Workbench/sherpa && pnpm exec vitest run packages/studio-core/src/__tests__/linear-tasks.test.ts
```

Expected: PASS.

**Step 5: Export from barrel**

Modify: `packages/studio-core/src/index.ts` — add:

```typescript
export * from "./linear-client"
export * from "./linear-mapping"
export * from "./linear-tasks"
```

**Step 6: Commit**

```bash
git add packages/studio-core/src/linear-tasks.ts packages/studio-core/src/linear-client.ts packages/studio-core/src/linear-mapping.ts packages/studio-core/src/index.ts packages/studio-core/src/__tests__/
git commit -m "feat(studio-core): add Linear-backed task data layer"
```

---

### Task 2.2: ~~Create task source switcher~~ REMOVED

> Removed — hard switchover means no feature flag. `task-source.ts` deleted.

---

## Session 3: Studio App Hard Switchover

**Objective:** Replace all task data fetching in the Studio app. `getTaskBoard()` and `getTaskDetail()` become async, Linear-backed. Delete the filesystem re-exports. All 8 consuming pages `await` the Linear calls directly.

### Task 3.1: Replace Studio task re-exports with Linear

**Files:**
- Modify: `apps/studio/src/lib/studio/tasks.ts`

Replace the single re-export line with async wrappers around the Linear data layer. All 8 consuming pages import from this file, so the switchover propagates automatically.

```typescript
import { getLinearTaskBoard, getLinearTaskDetail } from "@sherpa/studio-core";
import type { TaskBoardEntry, TaskDetail } from "@sherpa/studio-core";
import type { LinearTaskBoardOptions } from "@sherpa/studio-core";

export type { TaskBoardEntry, TaskDetail, LinearTaskBoardOptions };

/** Fetch task board from Linear. */
export async function getTaskBoard(opts?: LinearTaskBoardOptions): Promise<TaskBoardEntry[]> {
  return getLinearTaskBoard(opts);
}

/** Fetch task detail from Linear. */
export async function getTaskDetail(identifier: string, opts?: LinearTaskBoardOptions): Promise<TaskDetail | null> {
  return getLinearTaskDetail(identifier, opts);
}
```

**Step 1: Update the re-export file**

**Step 2: Update all 8 consuming pages to `await getTaskBoard()`**

Every page that calls `getTaskBoard()` must now `await` it. These are all RSC (async server components), so this is a straightforward change:

- `apps/studio/src/app/(studio)/tasks/page.tsx` — `const tasks = await getTaskBoard(...)`
- `apps/studio/src/app/(studio)/tasks/[slug]/page.tsx` — same
- `apps/studio/src/app/(studio)/dispatch/page.tsx` — same
- `apps/studio/src/app/(studio)/page.tsx` — same
- `apps/studio/src/app/(studio)/workforce/page.tsx` — same
- `apps/studio/src/app/(studio)/projects/page.tsx` — same
- `apps/studio/src/app/(studio)/projects/[project]/tasks/page.tsx` — same
- `apps/studio/src/app/(studio)/actions/command-palette-items.ts` — same

**Step 3: Verify build**

```bash
cd /Users/rob/Workbench/sherpa && pnpm build
```

**Step 4: Commit**

```bash
git add apps/studio/src/
git commit -m "feat(studio): hard switchover — all task pages fetch from Linear"
```

---

## Session 4: MCP Tool Switchover + Script Cleanup

**Objective:** Replace MCP task tools with Linear-backed implementations. Update dispatch scripts to query Linear. Delete `task-board.sh`.

### Task 4.1: Rewrite MCP task tools for Linear

**Files:**
- Modify: `packages/studio-mcp/src/server.ts`

Replace the filesystem-based implementations of `task_list`, `task_get`, `task_create`, `task_update` with Linear API calls. `task_dispatch` and `task_logs` stay unchanged (governance).

**`task_list`** — call `getLinearTaskBoard()`, apply filters, return JSON.

**`task_create`** — call `client.createIssue()` with mapped fields. Apply label IDs for task-type, mode, role. No local file creation.

**`task_update`** — map field updates to Linear mutations:
- `status` → workflow state transition
- `priority` → `issueUpdate({ priority })`
- `judge-verdict` → update Verdict label group
- Other governance fields (worktree, branch, session-id) → store as issue comment or attachment

**Step 1: Rewrite tool implementations**

**Step 2: Verify build**

```bash
cd /Users/rob/Workbench/sherpa && pnpm build && pnpm check
```

**Step 3: Commit**

```bash
git add packages/studio-mcp/
git commit -m "feat(studio-mcp): replace filesystem task tools with Linear API"
```

---

### Task 4.2: Update dispatch scripts for Linear

**Files:**
- Modify: `scripts/task-scanner.mjs` — replace `scanTasks()` with Linear API query
- Modify: `scripts/worker.sh` — update task resolution to use Linear
- Modify: `scripts/dispatch-queue.sh` — fetch pending tasks from Linear
- Delete: `scripts/task-board.sh` — entirely redundant

`task-scanner.mjs` becomes a thin wrapper: query Linear for issues matching status/role/backend filters, return same JSON format the scripts expect. The `--id` flag queries by Linear identifier.

**Step 1: Rewrite task-scanner to query Linear**

**Step 2: Delete task-board.sh**

```bash
git rm scripts/task-board.sh
```

**Step 3: Verify dispatch scripts work**

```bash
cd /Users/rob/Workbench/sherpa && ./scripts/dispatch-queue.sh --pending --dry-run
```

**Step 4: Commit**

```bash
git add scripts/
git commit -m "feat(dispatch): scripts query Linear directly, delete task-board.sh"
```

---

## Session 5: Migration + Cleanup

**Objective:** Import existing task files to Linear, delete filesystem task files, update documentation.

### Task 5.1: Run migration script

**Files:**
- Create: `scripts/linear-import-tasks.mjs` — one-time import

Import all `docs/tasks/*.md` files as Linear issues, mapping frontmatter fields to Linear issue properties and labels.

```javascript
#!/usr/bin/env node
/**
 * One-time migration: import existing task files to Linear.
 * Usage: SHERPA_LINEAR_API_KEY=lin_... node scripts/linear-import-tasks.mjs
 */
import { LinearClient } from "@linear/sdk";
import fs from "fs";
import path from "path";

const TASKS_DIR = path.resolve(process.cwd(), "docs/tasks");

function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return { meta: {}, body: content };
  const meta = {};
  for (const line of match[1].split("\n")) {
    const [key, ...rest] = line.split(":");
    if (key) meta[key.trim()] = rest.join(":").trim();
  }
  return { meta, body: match[2] };
}

const PRIORITY_MAP = { urgent: 1, high: 2, medium: 3, low: 4 };

async function main() {
  const apiKey = process.env.SHERPA_LINEAR_API_KEY;
  if (!apiKey) { console.error("Set SHERPA_LINEAR_API_KEY"); process.exit(1); }

  const client = new LinearClient({ apiKey });
  const teams = await client.teams();
  const team = teams.nodes[0];
  if (!team) { console.error("No team found"); process.exit(1); }

  const files = fs.readdirSync(TASKS_DIR).filter((f) => f.endsWith(".md") && f !== "README.md");
  console.log(`Importing ${files.length} tasks to Linear team "${team.name}"...`);

  for (const file of files) {
    const content = fs.readFileSync(path.join(TASKS_DIR, file), "utf-8");
    const { meta, body } = parseFrontmatter(content);
    const title = body.match(/^#\s+(.+)/m)?.[1] ?? meta.id ?? file.replace(".md", "");

    const result = await client.createIssue({
      teamId: team.id,
      title,
      description: body,
      priority: PRIORITY_MAP[meta.priority] ?? 3,
    });

    const issue = await result.issue;
    console.log(`  + ${file} → ${issue?.identifier ?? "?"}`);
  }

  console.log("\nImport complete.");
}

main().catch(console.error);
```

**Step 1: Run migration**

```bash
SHERPA_LINEAR_API_KEY=lin_... node scripts/linear-import-tasks.mjs
```

**Step 2: Verify issues appear in Linear workspace**

---

### Task 5.2: Delete filesystem task files + dead code

**Files:**
- Delete: `docs/tasks/*.md` (all task files except README.md)
- Delete: `packages/studio-core/src/tasks.ts` (filesystem reader — replaced by `linear-tasks.ts`)
- Keep: `docs/tasks/logs/` (execution artifacts stay on disk)
- Keep: `docs/tasks/README.md` (update to document Linear as task backend)

**Step 1: Delete task files**

```bash
find docs/tasks -name "*.md" ! -name "README.md" -delete
```

**Step 2: Update README.md**

Document that tasks now live in Linear. `docs/tasks/logs/` retains execution artifacts (NDJSON events, verdicts, reports).

**Step 3: Update CLAUDE.md**

Add `SHERPA_LINEAR_API_KEY` as a required env var in the Workspace section.

**Step 4: Commit**

```bash
git add docs/tasks/ packages/studio-core/src/tasks.ts CLAUDE.md
git commit -m "chore: complete Linear switchover — delete filesystem task files and reader"
```

---

## Session 6: Linear Agent Registration (OAuth + Webhook)

**Objective:** Register Sherpa as a Linear Agent with OAuth app, implement the webhook receiver for agent session events.

### Task 6.1: Register Linear OAuth application

This is a manual step — not code.

**Step 1: Go to Linear Settings → API → Applications**

Create a new application:
- Name: "Sherpa Studio"
- Description: "Governance layer for AI agent workflows — behavioral constraints, convention enforcement, lifecycle management"
- Redirect URI: `http://localhost:3000/api/linear/callback` (dev)
- Scopes: `read`, `write`, `app:assignable`, `app:mentionable`
- Actor type: Application (for bot identity)
- Webhook URL: `https://<SSH_HOST>:3000/api/linear/webhook` (production on VPS)

**Step 2: Save credentials**

Store `LINEAR_CLIENT_ID` and `LINEAR_CLIENT_SECRET` in `.env.local` (never committed).

**Step 3: Document in plan**

Record the application ID and webhook signing secret for Session 7.

---

### Task 6.2: Create webhook receiver API route

**Files:**
- Create: `apps/studio/src/app/api/linear/webhook/route.ts`

Next.js API route that receives Linear webhook events and processes agent session creation/prompts.

**Step 1: Write the route handler**

```typescript
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

const WEBHOOK_SECRET = process.env.LINEAR_WEBHOOK_SECRET;

function verifySignature(body: string, signature: string): boolean {
  if (!WEBHOOK_SECRET) return false;
  const expected = crypto
    .createHmac("sha256", WEBHOOK_SECRET)
    .update(body)
    .digest("hex");
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("linear-signature");

  if (!signature || !verifySignature(body, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const payload = JSON.parse(body);
  const { action, type } = payload;

  // Handle agent session events
  if (type === "AgentSession") {
    if (action === "created") {
      // New delegation or @mention — acknowledge within 10 seconds
      // TODO: Process promptContext, run governance checks, emit thought activity
      console.log("[linear-webhook] Agent session created:", payload.data?.id);
    }

    if (action === "prompted") {
      // User follow-up message
      console.log("[linear-webhook] Agent session prompted:", payload.data?.id);
    }
  }

  // Handle issue state changes for sync
  if (type === "Issue" && action === "update") {
    // TODO: Sync state changes back to Sherpa if needed
  }

  return NextResponse.json({ ok: true });
}
```

**Step 2: Verify build**

```bash
cd /Users/rob/Workbench/sherpa && pnpm build
```

**Step 3: Commit**

```bash
git add apps/studio/src/app/api/linear/webhook/route.ts
git commit -m "feat(studio): add Linear webhook receiver API route"
```

---

### Task 6.3: Create agent session response handler

**Files:**
- Create: `packages/studio-core/src/linear-agent.ts`

This module handles the governance logic when Sherpa receives an agent session event — validates issue readiness, checks conventions, and emits activity responses back to Linear.

**Step 1: Write the module**

```typescript
import { LinearClient } from "@linear/sdk";
import { getLinearClient } from "./linear-client";

export interface AgentSessionEvent {
  id: string;
  issueId: string;
  promptContext?: string;
  action: "created" | "prompted";
}

/**
 * Handle a new agent session — acknowledge immediately, then run governance checks.
 * Must emit first activity within 10 seconds per Linear's requirement.
 */
export async function handleAgentSession(
  event: AgentSessionEvent,
): Promise<void> {
  const client = getLinearClient();

  // Step 1: Acknowledge immediately with a "thought" activity
  await client.createAgentActivity({
    agentSessionId: event.id,
    type: "thought",
    content: "Sherpa governance agent activated. Checking conventions and lifecycle compliance...",
  });

  // Step 2: Parse promptContext for issue details and guidance
  // TODO: Extract issue metadata, team guidance, workspace guidance from XML

  // Step 3: Run governance checks
  // TODO: Validate issue has required labels (task-type, role, mode)
  // TODO: Check lifecycle compliance
  // TODO: Verify behavioral constraints

  // Step 4: Emit response with governance verdict
  await client.createAgentActivity({
    agentSessionId: event.id,
    type: "response",
    content: "Governance check complete. Issue meets convention requirements.",
  });
}
```

**Step 2: Commit**

```bash
git add packages/studio-core/src/linear-agent.ts
git commit -m "feat(studio-core): add Linear agent session handler (governance checks)"
```

---

## Session 7: Studio UI — Linear Sync Status (if needed)

**Objective:** Add a small Linear connection status indicator to Studio's sidebar and a sync badge on task cards when Linear source is active.

> **Conditional session:** Only needed if the previous sessions are complete and the integration is working end-to-end. This is polish, not core functionality.

### Task 7.1: Add Linear connection badge to sidebar

**Files:**
- Modify: `packages/studio-ui/src/studio-sidebar.tsx`

Add a small status indicator showing whether Linear is connected. Use existing shadcn Badge and Tooltip components.

```tsx
{taskSource === "linear" && (
  <Tooltip>
    <TooltipTrigger>
      <Badge variant="outline" className="text-xs">
        Linear
      </Badge>
    </TooltipTrigger>
    <TooltipContent>Connected to Linear workspace</TooltipContent>
  </Tooltip>
)}
```

Following shadcn rules: semantic colors via variant, no raw color classes, Tooltip wrapping Badge for context.

### Task 7.2: Add sync indicator to task cards

**Files:**
- Modify: `packages/studio-ui/src/mission-card.tsx` (or equivalent task card component)

When a task comes from Linear, show the Linear identifier (e.g., "ENG-42") as a small badge next to the task title.

```tsx
{task.id.match(/^[A-Z]+-\d+$/) && (
  <Badge variant="secondary" className="text-xs font-mono">
    {task.id}
  </Badge>
)}
```

---

## Summary

| Session | Scope | Effort | Status |
|---------|-------|--------|--------|
| 1 | Linear client + mapping + workspace setup | 1 session | DONE |
| 2 | Linear task data layer | 1 session | DONE |
| 3 | Studio app hard switchover (8 pages) | 1 session | |
| 4 | MCP tool switchover + script cleanup | 1 session | |
| 5 | Migration + delete filesystem task code | 1 session | |
| 6 | OAuth registration + webhook + agent handler | 1 session | |
| 7 | UI polish (conditional) | 0.5 session | |
| **Total** | | **5.5-6.5 sessions** | |

### Key Decisions

1. **Hard switchover, no feature flag.** Linear IS the task backend. No `SHERPA_TASK_SOURCE`, no conditional logic, no dual paths. Filesystem task code gets deleted.
2. **Same interfaces.** `TaskBoardEntry` and `TaskDetail` interfaces are unchanged. Linear data is mapped into these types. `getTaskBoard()` becomes async.
3. **Governance stays framework-side.** Dispatch pipeline, judge system, event logs, initiative lifecycle — none of this moves to Linear.
4. **Label groups as taxonomy.** Since Linear has no custom fields, Sherpa's task-type/mode/role/verdict map to mutually exclusive label groups.
5. **10-second acknowledgment.** Agent session handler emits a `thought` activity immediately, then processes governance checks asynchronously.
6. **Execution artifacts stay on disk.** `docs/tasks/logs/` retains NDJSON events, verdicts, reports. Linear doesn't store dispatch telemetry.

### Dependencies

- Linear API key (`SHERPA_LINEAR_API_KEY`)
- Linear workspace with a team configured
- `scripts/linear-setup.mjs` run once to create label groups
- Sessions 1-2 must complete before Session 3
- Session 6 can run in parallel with Sessions 3-5
