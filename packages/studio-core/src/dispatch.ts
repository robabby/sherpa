// ---------------------------------------------------------------------------
// Dispatch types and route resolution for multi-backend task routing.
// ---------------------------------------------------------------------------

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

export interface RouteOverrides {
  backend?: Backend
  model?: string
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
