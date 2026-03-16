import type Database from "better-sqlite3"
import { listActiveLeases, type LeaseInfo } from "./authority/operations"
import fs from "node:fs"
import path from "node:path"

export interface DashboardOptions {
  agentId?: string
  role?: string
}

export interface Dashboard {
  leases: LeaseInfo[]
  tasks: DashboardTask[]
  summary: {
    totalLeases: number
    totalAgents: number
  }
}

interface DashboardTask {
  id: string
  status: string
  role: string
  priority: string
}

/** Build a role-scoped dashboard snapshot. */
export function buildDashboard(
  db: Database.Database,
  projectRoot: string,
  opts?: DashboardOptions,
): Dashboard {
  const leases = listActiveLeases(db, opts?.agentId)
  const allLeases = listActiveLeases(db)
  const agentIds = new Set(allLeases.map((l) => l.agentId))
  const tasks = scanTasksLightweight(path.join(projectRoot, "docs/tasks"))

  return {
    leases,
    tasks,
    summary: {
      totalLeases: allLeases.length,
      totalAgents: agentIds.size,
    },
  }
}

function scanTasksLightweight(tasksDir: string): DashboardTask[] {
  if (!fs.existsSync(tasksDir)) return []

  const files = fs.readdirSync(tasksDir).filter((f) => f.endsWith(".md") && f !== "README.md")
  const tasks: DashboardTask[] = []

  for (const file of files) {
    try {
      const content = fs.readFileSync(path.join(tasksDir, file), "utf-8")
      const match = content.match(/^---\n([\s\S]*?)\n---/)
      if (!match) continue

      const meta: Record<string, string> = {}
      for (const line of match[1].split("\n")) {
        const colonIdx = line.indexOf(":")
        if (colonIdx === -1) continue
        meta[line.slice(0, colonIdx).trim()] = line.slice(colonIdx + 1).trim()
      }

      if (meta.id) {
        tasks.push({
          id: meta.id,
          status: meta.status ?? "unknown",
          role: meta.role ?? "unknown",
          priority: meta.priority ?? "medium",
        })
      }
    } catch { /* skip */ }
  }

  return tasks
}
