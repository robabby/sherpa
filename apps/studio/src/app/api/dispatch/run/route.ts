import { NextResponse } from "next/server"
import { spawn, execSync } from "child_process"
import path from "path"
import fs from "fs"

interface DispatchRequest {
  taskId?: string
  mode?: string
  agent?: string | null
  backend?: string | null
}

const PROJECT_ROOT = path.resolve(process.cwd(), "../..")

function logDispatchEvent(taskId: string, event: string, data: Record<string, unknown>) {
  const logsDir = path.join(PROJECT_ROOT, "docs/tasks/logs")
  fs.mkdirSync(logsDir, { recursive: true })
  const logFile = path.join(logsDir, `${taskId}-events.ndjson`)
  const entry = JSON.stringify({
    timestamp: new Date().toISOString(),
    event,
    ...data,
  })
  fs.appendFileSync(logFile, entry + "\n")
}

export async function POST(request: Request) {
  const body = (await request.json()) as DispatchRequest
  const { taskId, mode, agent, backend } = body

  if (!taskId) {
    return NextResponse.json({ error: "taskId required" }, { status: 400 })
  }

  const scannerScript = path.join(PROJECT_ROOT, "scripts/task-scanner.mjs")
  const workerScript = path.join(PROJECT_ROOT, "scripts/worker.sh")

  // Log the dispatch request
  logDispatchEvent(taskId, "dispatch_requested", {
    taskId,
    mode: mode ?? "supervised",
    agent: agent ?? null,
    backend: backend ?? null,
    source: "studio-ui",
  })

  // Update task frontmatter with selections
  const updates: [string, string][] = []
  if (mode) updates.push(["mode", mode])
  if (backend) updates.push(["backend", backend])

  for (const [field, value] of updates) {
    try {
      execSync(
        `node "${scannerScript}" --update "${taskId}" ${field} "${value}"`,
        { cwd: PROJECT_ROOT, encoding: "utf-8" },
      )
    } catch {
      // Non-critical
    }
  }

  logDispatchEvent(taskId, "task_updated", {
    taskId,
    updates: Object.fromEntries(updates),
  })

  // Spawn worker as detached process
  const child = spawn(workerScript, [taskId], {
    cwd: PROJECT_ROOT,
    detached: true,
    stdio: "ignore",
  })

  const spawnError = await new Promise<Error | null>((resolve) => {
    child.on("error", (err) => resolve(err))
    setTimeout(() => resolve(null), 500)
  })

  if (spawnError || !child.pid) {
    logDispatchEvent(taskId, "dispatch_failed", {
      taskId,
      error: spawnError?.message ?? "no PID assigned",
    })
    return NextResponse.json(
      { error: `Failed to spawn worker: ${spawnError?.message ?? "no PID"}` },
      { status: 500 },
    )
  }

  child.unref()

  logDispatchEvent(taskId, "dispatch_spawned", {
    taskId,
    pid: child.pid,
    backend: backend ?? "from-config",
    agent: agent ?? null,
    mode: mode ?? "supervised",
  })

  return NextResponse.json({
    dispatched: true,
    taskId,
    pid: child.pid,
    backend: backend ?? "from-config",
    agent: agent ?? null,
  })
}
