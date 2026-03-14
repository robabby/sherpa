import { NextResponse } from "next/server"
import { execSync } from "child_process"
import path from "path"

const PROJECT_ROOT = path.resolve(process.cwd(), "../..")

export async function POST(request: Request) {
  const { taskId } = (await request.json()) as { taskId?: string }

  if (!taskId) {
    return NextResponse.json({ error: "taskId required" }, { status: 400 })
  }

  const scannerScript = path.join(PROJECT_ROOT, "scripts/task-scanner.mjs")
  const resets: [string, string][] = [
    ["status", "pending"],
    ["dispatched-at", "null"],
    ["backend", "null"],
  ]

  for (const [field, value] of resets) {
    try {
      execSync(
        `node "${scannerScript}" --update "${taskId}" ${field} "${value}"`,
        { cwd: PROJECT_ROOT, encoding: "utf-8" },
      )
    } catch {
      // Non-critical
    }
  }

  return NextResponse.json({ reset: true, taskId })
}
