# MCP Multi-Backend Dispatch — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Wire the MCP `task_create` and `task_dispatch` tools into the existing multi-backend dispatch infrastructure so tasks can be routed to any configured backend, not just lm-studio.

**Architecture:** `task_create` gains optional `backend` and `task_type` parameters and calls `resolveRoute()` from `@sherpa/studio-core` when backend is omitted. `task_dispatch` drops its lm-studio-only gate and delegates to `scripts/worker.sh` (which already handles all backend types) instead of spawning `lm-studio.mjs` directly.

**Tech Stack:** TypeScript, Zod schemas, `@sherpa/studio-core` dispatch module, Vitest

**Key design decision:** `task_dispatch` delegates to `worker.sh` rather than reimplementing per-backend spawn logic. `worker.sh` already handles route resolution, env var setup, NDJSON event logging, log streamer sidecars, and backend script selection. Reimplementing this in the MCP server would create duplication and drift. The trade-off is the MCP server gets the PID of the `worker.sh` bash process rather than the backend process directly — acceptable since monitoring happens via `task_logs`, not PID tracking.

---

## Session 1: Wire task_create and task_dispatch

### Task 1: Add dispatch imports to MCP server

**Files:**
- Modify: `packages/studio-mcp/src/server.ts:17-26` (imports section)

**Step 1: Add the import**

Add after the existing `@sherpa/studio-core/db` import block:

```typescript
import {
  resolveRoute,
  DEFAULT_DISPATCH,
  BACKEND_META,
} from "@sherpa/studio-core"
import type { Backend, TaskType } from "@sherpa/studio-core"
```

**Step 2: Verify typecheck passes**

Run: `cd packages/studio-mcp && pnpm exec tsc --noEmit`
Expected: No errors (these are already exported from `@sherpa/studio-core`)

**Step 3: Commit**

```bash
git add packages/studio-mcp/src/server.ts
git commit -m "feat(mcp): add dispatch imports from studio-core"
```

---

### Task 2: Add backend and task_type params to task_create

**Files:**
- Modify: `packages/studio-mcp/src/server.ts:322-410` (task_create tool)
- Test: `packages/studio-mcp/src/__tests__/task-create-routing.test.ts`

**Step 1: Write the failing test**

Create `packages/studio-mcp/src/__tests__/task-create-routing.test.ts`:

```typescript
import { describe, it, expect, beforeEach, afterEach } from "vitest"
import fs from "node:fs"
import path from "node:path"
import os from "node:os"

/**
 * These tests verify task_create frontmatter by reading the generated .md files.
 * We don't start the full MCP server — we test the file output directly by calling
 * the same parseFrontmatter logic on generated task files.
 */

function parseFrontmatter(content: string): Record<string, string | null> {
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/)
  if (!match) return {}
  const meta: Record<string, string | null> = {}
  for (const line of match[1].split("\n")) {
    const colonIdx = line.indexOf(":")
    if (colonIdx === -1) continue
    const key = line.slice(0, colonIdx).trim()
    let value: string | null = line.slice(colonIdx + 1).trim()
    if (value === "null") value = null
    meta[key] = value
  }
  return meta
}

describe("task_create routing", () => {
  let dir: string

  beforeEach(() => {
    dir = fs.mkdtempSync(path.join(os.tmpdir(), "sherpa-task-routing-"))
    fs.mkdirSync(path.join(dir, "tasks"), { recursive: true })
  })

  afterEach(() => {
    fs.rmSync(dir, { recursive: true, force: true })
  })

  it("uses explicit backend when provided", () => {
    // This test validates that the task_create tool writes the explicit
    // backend to frontmatter instead of hardcoding "lm-studio".
    // Verified via file content after task 2 step 3 implementation.
    expect(true).toBe(true) // placeholder — replaced by integration test
  })

  it("resolves backend from task_type when backend is omitted", () => {
    // Validates resolveRoute integration: task_type "research" should
    // resolve to "groq" per DEFAULT_DISPATCH config.
    expect(true).toBe(true) // placeholder — replaced by integration test
  })

  it("defaults to 'general' task_type when omitted", () => {
    // When neither backend nor task_type is provided, resolveRoute
    // falls back to the config fallback route.
    expect(true).toBe(true) // placeholder — replaced by integration test
  })
})
```

**Step 2: Run the test to verify it passes (placeholders)**

Run: `cd packages/studio-mcp && pnpm exec vitest run src/__tests__/task-create-routing.test.ts`
Expected: PASS (placeholder assertions)

**Step 3: Update the task_create Zod schema**

In `packages/studio-mcp/src/server.ts`, find the `task_create` tool registration (around line 322). Update the schema object to add `backend` and `task_type` parameters, and update `model`:

Replace the existing schema parameters:
```typescript
      model: z.string().default("qwen-3.5-9b").describe("Model name for LM Studio"),
```

With:
```typescript
      backend: z
        .enum([
          "claude", "opencode", "codex", "gemini", "lm-studio",
          "groq", "google-ai", "lm-studio-api",
        ] as const)
        .optional()
        .describe("Target backend. When omitted, resolved from task_type via dispatch config"),
      task_type: z
        .enum([
          "code-implementation", "code-review", "architect", "research",
          "content-generation", "audit", "embeddings", "general",
        ] as const)
        .default("general")
        .describe("Task type — used for backend routing when backend is omitted"),
      model: z.string().optional().describe("Model override. When omitted, uses the backend's configured default"),
```

Also add `backend` and `task_type` to the destructured params in the handler:
```typescript
    async ({
      id, title, role, priority, initiative, model,
      backend, task_type,
      objective, context, acceptance_criteria, constraints, deliverables,
    }) => {
```

**Step 4: Wire resolveRoute into the metadata construction**

Replace the hardcoded metadata block (around line 357-373):

```typescript
      // Resolve backend route
      const route = resolveRoute(
        DEFAULT_DISPATCH,
        task_type,
        "interactive" as const,
        backend ? { backend: backend as Backend } : undefined,
      )
      const resolvedBackend = route.backend
      const resolvedModel = model ?? route.model ?? undefined

      const meta: TaskMeta = {
        id,
        status: "pending",
        role,
        priority,
        initiative: initiative ?? null,
        backend: resolvedBackend,
        model: resolvedModel ?? null,
        "task-type": task_type,
        "budget-usd": "0.00",
        worktree: null,
        branch: null,
        created: new Date().toISOString(),
        "dispatched-at": null,
        "completed-at": null,
        "session-id": null,
        "judge-verdict": "pending",
      }
```

**Step 5: Update the logEvent call**

Replace (around line 398-400):
```typescript
      await logEvent(projectRoot, logsDir, taskLoggerPath, id, "task_created", {
        role, backend: "lm-studio", model, priority, initiative: initiative ?? null,
      })
```

With:
```typescript
      await logEvent(projectRoot, logsDir, taskLoggerPath, id, "task_created", {
        role, backend: resolvedBackend, model: resolvedModel ?? null,
        taskType: task_type, priority, initiative: initiative ?? null,
      })
```

**Step 6: Update the task_create tool description**

Replace:
```typescript
    "Create a new task on the task board.",
```

With:
```typescript
    "Create a new task on the task board. Routes to the appropriate backend via dispatch config, or accepts an explicit backend override.",
```

**Step 7: Run typecheck**

Run: `cd packages/studio-mcp && pnpm exec tsc --noEmit`
Expected: No errors

**Step 8: Commit**

```bash
git add packages/studio-mcp/src/server.ts packages/studio-mcp/src/__tests__/task-create-routing.test.ts
git commit -m "feat(mcp): add backend and task_type params to task_create with resolveRoute"
```

---

### Task 3: Update task_dispatch to support all backends

**Files:**
- Modify: `packages/studio-mcp/src/server.ts:450-554` (task_dispatch tool)
- Test: `packages/studio-mcp/src/__tests__/task-dispatch-multi.test.ts`

**Step 1: Write the failing test**

Create `packages/studio-mcp/src/__tests__/task-dispatch-multi.test.ts`:

```typescript
import { describe, it, expect } from "vitest"
import { BACKEND_META } from "@sherpa/studio-core"

describe("task_dispatch multi-backend", () => {
  it("all backends have a known type (cli or api)", () => {
    // Validates that every backend in BACKEND_META has a type we can branch on
    for (const [backend, meta] of Object.entries(BACKEND_META)) {
      expect(["cli", "api"]).toContain(meta.type)
    }
  })

  it("worker.sh exists at expected path", () => {
    const fs = require("node:fs")
    const path = require("node:path")
    // Walk up from packages/studio-mcp to repo root
    const repoRoot = path.resolve(__dirname, "../../../../")
    const workerPath = path.join(repoRoot, "scripts/worker.sh")
    expect(fs.existsSync(workerPath)).toBe(true)
  })
})
```

**Step 2: Run test**

Run: `cd packages/studio-mcp && pnpm exec vitest run src/__tests__/task-dispatch-multi.test.ts`
Expected: PASS

**Step 3: Remove the lm-studio-only gate**

In `packages/studio-mcp/src/server.ts`, find the `task_dispatch` handler. Delete the entire lm-studio backend check (around lines 481-491):

```typescript
      // DELETE THIS BLOCK:
      if (task.backend !== "lm-studio") {
        return {
          content: [
            {
              type: "text" as const,
              text: `Error: Task '${id}' uses backend '${task.backend}' — only lm-studio tasks can be dispatched.`,
            },
          ],
          isError: true,
        }
      }
```

**Step 4: Replace lm-studio health check with backend-aware check**

Replace the lm-studio health check block (around lines 493-504):

```typescript
      const lmStatus = await checkLmStudio(lmStudioUrl)
      if (!lmStatus.available) {
        return {
          content: [
            {
              type: "text" as const,
              text: `Error: LM Studio not available at ${lmStudioUrl}. ${lmStatus.error ?? "Start LM Studio before dispatching."}`,
            },
          ],
          isError: true,
        }
      }
```

With:

```typescript
      // Health check: only for lm-studio (local service may not be running).
      // Other backends fail naturally via worker.sh if unavailable.
      const taskBackend = (task.backend ?? "lm-studio") as string
      if (taskBackend === "lm-studio" || taskBackend === "lm-studio-api") {
        const lmStatus = await checkLmStudio(lmStudioUrl)
        if (!lmStatus.available) {
          return {
            content: [
              {
                type: "text" as const,
                text: `Error: LM Studio not available at ${lmStudioUrl}. ${lmStatus.error ?? "Start LM Studio before dispatching."}`,
              },
            ],
            isError: true,
          }
        }
      }
```

**Step 5: Replace the spawn logic**

Replace the existing spawn block (from `findAndUpdateTask` through `child.unref()` and the response, around lines 506-554) with worker.sh delegation:

```typescript
      // Status updates handled by worker.sh — but set dispatched here for
      // immediate feedback (worker.sh will also set it, which is idempotent).
      findAndUpdateTask(tasksDir, id, "status", "dispatched")
      findAndUpdateTask(tasksDir, id, "dispatched-at", new Date().toISOString())

      // Delegate to worker.sh which handles all backend types
      const workerShPath = path.join(projectRoot, "scripts/worker.sh")
      const child = spawn("bash", [workerShPath, id], {
        cwd: projectRoot,
        detached: true,
        stdio: "ignore",
        env: { ...process.env },
      })

      const spawnError = await new Promise<Error | null>((resolve) => {
        child.on("error", (err) => resolve(err))
        setTimeout(() => resolve(null), 500)
      })

      if (spawnError || !child.pid) {
        findAndUpdateTask(tasksDir, id, "status", "failed")
        findAndUpdateTask(tasksDir, id, "dispatched-at", null)
        return {
          content: [
            {
              type: "text" as const,
              text: `Error: Failed to spawn worker for '${id}': ${spawnError?.message ?? "no PID assigned"}`,
            },
          ],
          isError: true,
        }
      }

      child.unref()

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify({
              dispatched: true,
              id,
              backend: taskBackend,
              model: task.model ?? "default",
              pid: child.pid,
              message: `Worker running as PID ${child.pid}. Use task_get or task_logs to check progress.`,
            }),
          },
        ],
      }
```

**Step 6: Update the tool description**

Replace:
```typescript
    "Dispatch a pending task to LM Studio for execution. The worker runs as a detached background process.",
```

With:
```typescript
    "Dispatch a pending task to its configured backend for execution. The worker runs as a detached background process. Supports all backends: claude, opencode, codex, gemini, lm-studio, groq, google-ai, lm-studio-api.",
```

**Step 7: Run typecheck**

Run: `cd packages/studio-mcp && pnpm exec tsc --noEmit`
Expected: No errors

**Step 8: Run all MCP tests**

Run: `cd packages/studio-mcp && pnpm test`
Expected: All tests pass

**Step 9: Commit**

```bash
git add packages/studio-mcp/src/server.ts packages/studio-mcp/src/__tests__/task-dispatch-multi.test.ts
git commit -m "feat(mcp): wire task_dispatch to all backends via worker.sh delegation"
```

---

### Task 4: Verify backward compatibility

**Files:**
- None (verification only)

**Step 1: Verify existing tasks still parse correctly**

Run: `cd packages/studio-mcp && pnpm exec tsc --noEmit`
Expected: No errors

**Step 2: Run full test suite**

Run: `pnpm test --filter @sherpa/studio-mcp`
Expected: All tests pass

**Step 3: Run typecheck across monorepo**

Run: `pnpm check`
Expected: No errors (dispatch types haven't changed, only the MCP server's usage of them)

**Step 4: Commit (if any fixups needed)**

```bash
git add -A
git commit -m "fix(mcp): backward compatibility fixups for multi-backend dispatch"
```

---

## Session 2: Integration testing and edge cases

### Task 5: Add integration tests for route resolution

**Files:**
- Modify: `packages/studio-mcp/src/__tests__/task-create-routing.test.ts`

**Step 1: Replace placeholder tests with real route resolution tests**

Update the test file to verify `resolveRoute` produces correct backends for different task types:

```typescript
import { describe, it, expect } from "vitest"
import { resolveRoute, DEFAULT_DISPATCH } from "@sherpa/studio-core"
import type { Backend } from "@sherpa/studio-core"

describe("task_create routing via resolveRoute", () => {
  it("routes research tasks to groq", () => {
    const route = resolveRoute(DEFAULT_DISPATCH, "research", "interactive")
    expect(route.backend).toBe("groq")
  })

  it("routes code-implementation to claude", () => {
    const route = resolveRoute(DEFAULT_DISPATCH, "code-implementation", "interactive")
    expect(route.backend).toBe("claude")
  })

  it("uses explicit backend override", () => {
    const route = resolveRoute(DEFAULT_DISPATCH, "research", "interactive", {
      backend: "gemini" as Backend,
    })
    expect(route.backend).toBe("gemini")
  })

  it("falls back to config fallback for unknown task type", () => {
    const route = resolveRoute(DEFAULT_DISPATCH, "general", "interactive")
    expect(route.backend).toBe(DEFAULT_DISPATCH.fallback.backend)
  })

  it("falls back for 'general' task type (no explicit route)", () => {
    const route = resolveRoute(DEFAULT_DISPATCH, "general", "interactive")
    // 'general' has no explicit route, so falls back
    expect(route.backend).toBe("opencode")
  })
})
```

**Step 2: Run tests**

Run: `cd packages/studio-mcp && pnpm exec vitest run src/__tests__/task-create-routing.test.ts`
Expected: All PASS

**Step 3: Commit**

```bash
git add packages/studio-mcp/src/__tests__/task-create-routing.test.ts
git commit -m "test(mcp): add route resolution integration tests for task_create"
```

---

### Task 6: Add backend script existence tests

**Files:**
- Modify: `packages/studio-mcp/src/__tests__/task-dispatch-multi.test.ts`

**Step 1: Add tests verifying all backend scripts exist**

```typescript
import { describe, it, expect } from "vitest"
import fs from "node:fs"
import path from "node:path"
import { BACKEND_META } from "@sherpa/studio-core"
import type { Backend } from "@sherpa/studio-core"

describe("task_dispatch multi-backend", () => {
  const repoRoot = path.resolve(__dirname, "../../../../")

  it("all backends have a known type (cli or api)", () => {
    for (const [, meta] of Object.entries(BACKEND_META)) {
      expect(["cli", "api"]).toContain(meta.type)
    }
  })

  it("worker.sh exists at expected path", () => {
    const workerPath = path.join(repoRoot, "scripts/worker.sh")
    expect(fs.existsSync(workerPath)).toBe(true)
  })

  it("every backend has a matching script in scripts/backends/", () => {
    const backends = Object.keys(BACKEND_META) as Backend[]
    for (const backend of backends) {
      const mjsPath = path.join(repoRoot, `scripts/backends/${backend}.mjs`)
      const shPath = path.join(repoRoot, `scripts/backends/${backend}.sh`)
      const exists = fs.existsSync(mjsPath) || fs.existsSync(shPath)
      expect(exists, `Missing script for backend: ${backend}`).toBe(true)
    }
  })
})
```

**Step 2: Run tests**

Run: `cd packages/studio-mcp && pnpm exec vitest run src/__tests__/task-dispatch-multi.test.ts`
Expected: All PASS

**Step 3: Commit**

```bash
git add packages/studio-mcp/src/__tests__/task-dispatch-multi.test.ts
git commit -m "test(mcp): add backend script existence tests for multi-backend dispatch"
```

---

### Task 7: Verify end-to-end with a dry run

**Files:**
- None (manual verification)

**Step 1: Start the MCP server**

Run: `pnpm dev` (or start the MCP server directly)

**Step 2: Create a task with explicit backend**

Via MCP client, call `task_create` with `backend: "claude"` and verify the task file has `backend: claude` in frontmatter (not `lm-studio`).

**Step 3: Create a task with task_type routing**

Via MCP client, call `task_create` with `task_type: "research"` (no backend) and verify the task file has `backend: groq` resolved from DEFAULT_DISPATCH.

**Step 4: Create a task with no backend or task_type**

Via MCP client, call `task_create` with neither `backend` nor `task_type` and verify the task file has the fallback backend (`opencode`).

**Step 5: Verify task_dispatch accepts non-lm-studio tasks**

Via MCP client, call `task_dispatch` on the claude-backend task. Verify it spawns worker.sh (will fail if Claude CLI not configured, but should not be rejected by the MCP tool).

**Step 6: Run full test suite**

Run: `pnpm test --filter @sherpa/studio-mcp && pnpm check`
Expected: All pass

**Step 7: Final commit**

```bash
git add -A
git commit -m "feat(mcp): complete multi-backend dispatch for task_create and task_dispatch"
```

---

## Out of scope (seeds for future work)

- **Per-backend health checks in task_dispatch**: Currently only lm-studio gets a pre-dispatch health check. Adding health checks for all backends (using `getBackendHealth()` from dispatch.ts, filtered to the target backend) would improve UX but adds latency.
- **Budget validation**: `budget-usd` is `0.00` for all MCP-created tasks. Claude and API backends have real costs. Consider requiring a budget parameter for non-free backends, or defaulting to a sensible amount per backend type.
- **Cached health state**: Health checks could be cached for N seconds to avoid repeated latency on rapid dispatches.
- **task_type in task_update UPDATABLE_FIELDS**: The `task-type` field isn't in the `UPDATABLE_FIELDS` enum. Consider adding it if tasks should be re-routable after creation.
