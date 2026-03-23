import type Database from "better-sqlite3"
import { listActiveLeases, type LeaseInfo } from "./authority/operations"
import { getLinearTaskBoard } from "@sherpa/studio-core"

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
export async function buildDashboard(
  db: Database.Database,
  projectRoot: string,
  opts?: DashboardOptions,
): Promise<Dashboard> {
  const leases = listActiveLeases(db, opts?.agentId)
  const allLeases = listActiveLeases(db)
  const agentIds = new Set(allLeases.map((l) => l.agentId))

  let tasks: DashboardTask[]
  try {
    const board = await getLinearTaskBoard()
    tasks = board.map((t) => ({
      id: t.id,
      status: t.status,
      role: t.role,
      priority: t.priority,
    }))
  } catch {
    tasks = []
  }

  return {
    leases,
    tasks,
    summary: {
      totalLeases: allLeases.length,
      totalAgents: agentIds.size,
    },
  }
}
