import { NextResponse } from "next/server"
import { spawn, execSync } from "child_process"
import path from "path"

export async function POST(request: Request) {
  const body = await request.json()
  const { taskId, mode } = body as { taskId?: string; mode?: string }

  if (!taskId) {
    return NextResponse.json({ error: "taskId required" }, { status: 400 })
  }

  const projectRoot = process.cwd()
  const workerScript = path.join(projectRoot, "scripts/worker.sh")
  const scannerScript = path.join(projectRoot, "scripts/task-scanner.mjs")

  // Update mode on task if provided
  if (mode) {
    try {
      execSync(
        `node "${scannerScript}" --update "${taskId}" mode "${mode}"`,
        { cwd: projectRoot, encoding: "utf-8" },
      )
    } catch {
      // Non-critical — mode might already be set
    }
  }

  // Spawn worker as detached process
  const child = spawn(workerScript, [taskId], {
    cwd: projectRoot,
    detached: true,
    stdio: "ignore",
  })

  child.unref()

  return NextResponse.json({
    dispatched: true,
    taskId,
    pid: child.pid,
  })
}
