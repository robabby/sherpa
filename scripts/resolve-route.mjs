#!/usr/bin/env node

/**
 * scripts/resolve-route.mjs — Config bridge for shell scripts.
 *
 * Usage:
 *   node scripts/resolve-route.mjs <task-type> [mode] [--backend override] [--model override]
 *
 * Outputs JSON: {"backend":"opencode","model":"minimax-m2.5-free"}
 */

const DEFAULT_ROUTES = {
  'code-implementation': { backend: 'openclaw', model: null },
  'code-review':         { backend: 'openclaw', model: null },
  'architect':           { backend: 'openclaw', model: null },
  'research':            { backend: 'openclaw', model: null },
  'content-generation':  { backend: 'openclaw', model: null },
  'audit':               { backend: 'openclaw', model: null },
  'embeddings':          { backend: 'openclaw', model: null },
}

const FALLBACK = { backend: 'openclaw', model: null }
const OVERNIGHT_BLOCKED = ['code-implementation', 'architect']

// Paths that force Claude backend regardless of task-type routing
const CLAUDE_ONLY_PATTERNS = ['CLAUDE.md', '.claude/', 'docs/agents/roles/']

const args = process.argv.slice(2)

if (args.length === 0 || args[0] === '--help') {
  console.error('Usage: resolve-route.mjs <task-type> [mode] [--backend X] [--model X]')
  process.exit(1)
}

// Parse positional args (task-type and optional mode)
let taskType = null
let mode = 'supervised'
let backendOverride = null
let modelOverride = null
let targets = []

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--backend') { backendOverride = args[++i]; continue }
  if (args[i] === '--model') { modelOverride = args[++i]; continue }
  if (args[i] === '--targets') { targets = args[++i]?.split(',').filter(Boolean) ?? []; continue }
  if (!taskType) { taskType = args[i]; continue }
  mode = args[i]
}

if (!taskType) {
  console.error('Usage: resolve-route.mjs <task-type> [mode] [--backend X] [--model X]')
  process.exit(1)
}

// Check overnight guard
if (mode === 'overnight' && OVERNIGHT_BLOCKED.includes(taskType)) {
  console.error(`BLOCKED: task-type '${taskType}' not allowed in overnight mode`)
  process.exit(1)
}

// Claude-only constraint: governance files force Claude backend
const needsClaude = targets.length > 0 &&
  targets.some(t => CLAUDE_ONLY_PATTERNS.some(p => t.includes(p)))

// Resolve
if (needsClaude) {
  console.log(JSON.stringify({ backend: 'claude', model: modelOverride || 'claude-sonnet-4-6' }))
} else if (backendOverride) {
  console.log(JSON.stringify({ backend: backendOverride, model: modelOverride || null }))
} else {
  const route = DEFAULT_ROUTES[taskType] || FALLBACK
  console.log(JSON.stringify(route))
}
