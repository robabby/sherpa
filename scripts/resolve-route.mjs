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
  'code-implementation': { backend: 'claude', model: 'claude-opus-4-6' },
  'code-review':         { backend: 'codex', model: null },
  'architect':           { backend: 'claude', model: 'claude-opus-4-6' },
  'research':            { backend: 'opencode', model: 'minimax-m2.5-free' },
  'content-generation':  { backend: 'gemini', model: null },
  'audit':               { backend: 'opencode', model: 'minimax-m2.5-free' },
  'embeddings':          { backend: 'opencode', model: 'minimax-m2.5-free' },
}

const FALLBACK = { backend: 'opencode', model: 'minimax-m2.5-free' }
const OVERNIGHT_BLOCKED = ['code-implementation', 'architect']

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

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--backend') { backendOverride = args[++i]; continue }
  if (args[i] === '--model') { modelOverride = args[++i]; continue }
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

// Resolve
if (backendOverride) {
  console.log(JSON.stringify({ backend: backendOverride, model: modelOverride || null }))
} else {
  const route = DEFAULT_ROUTES[taskType] || FALLBACK
  console.log(JSON.stringify(route))
}
