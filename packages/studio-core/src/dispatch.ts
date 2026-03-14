// ---------------------------------------------------------------------------
// Dispatch types and route resolution for multi-backend task routing.
// ---------------------------------------------------------------------------

import { execSync } from "child_process"
import path from "path"
import type { TaskBoardEntry } from "./tasks"

export type Backend = 'claude' | 'opencode' | 'codex' | 'gemini' | 'lm-studio'
export type DispatchMode = 'interactive' | 'supervised' | 'overnight'
export type TaskType =
  | 'code-implementation'
  | 'code-review'
  | 'architect'
  | 'research'
  | 'content-generation'
  | 'audit'
  | 'embeddings'
  | 'general'

export interface BackendRoute {
  backend: Backend
  model?: string
}

export interface DispatchConfig {
  routes: Partial<Record<TaskType, BackendRoute>>
  fallback: BackendRoute
  offlineFallback: BackendRoute
  overnight: {
    blocked: TaskType[]
  }
}

export const DEFAULT_DISPATCH: DispatchConfig = {
  routes: {
    'code-implementation': { backend: 'claude', model: 'claude-opus-4-6' },
    'code-review': { backend: 'codex' },
    'architect': { backend: 'claude', model: 'claude-opus-4-6' },
    'research': { backend: 'opencode', model: 'minimax-m2.5-free' },
    'content-generation': { backend: 'gemini' },
    'audit': { backend: 'opencode', model: 'minimax-m2.5-free' },
    'embeddings': { backend: 'opencode', model: 'minimax-m2.5-free' },
  },
  fallback: { backend: 'opencode', model: 'minimax-m2.5-free' },
  offlineFallback: { backend: 'lm-studio' },
  overnight: {
    blocked: ['code-implementation', 'architect'],
  },
}

/**
 * File paths that require the Claude backend regardless of task-type routing.
 * Governance files need Claude's full capabilities.
 */
const CLAUDE_ONLY_PATTERNS = [
  'CLAUDE.md',
  '.claude/',
  'docs/agents/roles/',
]

/**
 * Check if any target paths require the Claude backend.
 */
export function requiresClaude(targets: string[]): boolean {
  return targets.some(target =>
    CLAUDE_ONLY_PATTERNS.some(pattern => target.includes(pattern))
  )
}

export interface RouteOverrides {
  backend?: Backend
  model?: string
  /** File paths the task targets — used for Claude-only constraint. */
  targets?: string[]
}

/**
 * Resolve the backend route for a given task-type and mode.
 *
 * Resolution order:
 * 1. Explicit overrides (task frontmatter backend+model)
 * 2. Task-type route from config
 * 3. Config fallback
 */
export function resolveRoute(
  config: DispatchConfig,
  taskType: TaskType | string,
  _mode: DispatchMode,
  overrides?: RouteOverrides,
): BackendRoute {
  // Claude-only constraint: governance files force Claude backend
  if (overrides?.targets && requiresClaude(overrides.targets)) {
    return { backend: 'claude', model: overrides?.model ?? 'claude-sonnet-4-6' }
  }

  if (overrides?.backend) {
    return { backend: overrides.backend, model: overrides.model }
  }

  const route = config.routes[taskType as TaskType]
  if (route) return route

  return config.fallback
}

/**
 * Check if a task-type is allowed in the given mode.
 */
export function isTaskTypeAllowed(
  config: DispatchConfig,
  taskType: TaskType | string,
  mode: DispatchMode,
): boolean {
  if (mode !== 'overnight') return true
  return !config.overnight.blocked.includes(taskType as TaskType)
}

export interface BackendHealth {
  backend: Backend
  available: boolean
  models?: string[]
  error?: string
}

export interface WorkforceAgent {
  slug: string
  displayName: string
  category: string
  taskType: string
  eligibleTaskTypes: string[]
}

/**
 * Check health of all configured backends by calling their --health flag.
 */
export function getBackendHealth(projectRoot?: string): BackendHealth[] {
  const root = projectRoot ?? process.cwd()
  const backends: Backend[] = ['claude', 'opencode', 'codex', 'gemini', 'lm-studio']

  return backends.map(backend => {
    const ext = backend === 'lm-studio' ? 'mjs' : 'sh'
    const script = path.join(root, `scripts/backends/${backend}.${ext}`)
    const cmd = ext === 'mjs'
      ? `node "${script}" --health`
      : `"${script}" --health`

    try {
      const output = execSync(cmd, { timeout: 5000, encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] })
      const data = JSON.parse(output.trim())
      return { backend, available: data.available ?? false, models: data.models, error: data.error }
    } catch {
      return { backend, available: false, error: 'health check failed' }
    }
  })
}

export interface ProposedAssignment {
  taskId: string
  taskTitle: string
  taskType: string
  agentSlug: string
  backend: Backend
  model?: string
}

/**
 * Match pending tasks to eligible agents based on task-type.
 * Returns proposed assignments respecting mode guard rails.
 */
export function matchTasksToAgents(
  tasks: TaskBoardEntry[],
  agents: WorkforceAgent[],
  config: DispatchConfig,
  mode: DispatchMode,
): ProposedAssignment[] {
  const pending = tasks.filter(t => t.status === 'pending')
  const assignments: ProposedAssignment[] = []

  for (const task of pending) {
    if (!isTaskTypeAllowed(config, task.taskType, mode)) continue

    // Prefer agent whose primary task-type matches, fall back to eligible
    const primary = agents.find(a => a.taskType === task.taskType)
    const eligible = agents.find(a => a.eligibleTaskTypes.includes(task.taskType))
    const agent = primary ?? eligible

    if (!agent) continue

    const route = resolveRoute(config, task.taskType, mode)
    assignments.push({
      taskId: task.id,
      taskTitle: task.title,
      taskType: task.taskType,
      agentSlug: agent.slug,
      backend: route.backend,
      model: route.model,
    })
  }

  return assignments
}
