#!/usr/bin/env zsh
# scripts/backends/claude.sh — Claude Code backend module
#
# Contract: reads SHERPA_* env vars, returns exit code
#   0 = completed, 1 = failed, 2 = backend unavailable
#
# Interactive mode: exec claude with args
# Headless mode: claude --print with output capture

set -euo pipefail

# Health check
if [[ "${1:-}" == "--health" ]]; then
  if command -v claude &>/dev/null; then
    echo '{"available":true}'
    exit 0
  else
    echo '{"available":false,"error":"claude not found in PATH"}'
    exit 2
  fi
fi

# Interactive mode
if [[ "${SHERPA_MODE:-}" == "interactive" ]]; then
  export ANTHROPIC_MODEL="${SHERPA_MODEL:-claude-sonnet-4-6}"
  export CLAUDE_CODE_SUBAGENT_MODEL="${SHERPA_SUBAGENT_MODEL:-claude-sonnet-4-6}"
  export SHERPA_ROLE="${SHERPA_ROLE:-}"
  exec claude "$@"
fi

# Headless mode
if ! command -v claude &>/dev/null; then
  echo "[claude] ERROR: claude not found in PATH" >&2
  exit 2
fi

# Resolve model — map backend name "claude" to a real model ID
_model="${SHERPA_MODEL:-claude-sonnet-4-6}"
[[ "$_model" == "claude" ]] && _model="claude-sonnet-4-6"

ARGS=(
  --print
  --model "$_model"
  --permission-mode acceptEdits
)

if [[ -n "${SHERPA_BUDGET_USD:-}" ]]; then
  ARGS+=(--max-budget-usd "$SHERPA_BUDGET_USD")
fi

if [[ -n "${SHERPA_WORKTREE:-}" ]]; then
  ARGS+=(--worktree "$SHERPA_WORKTREE")
fi

if [[ -n "${SHERPA_SYSTEM_PROMPT:-}" ]]; then
  ARGS+=(--append-system-prompt "$SHERPA_SYSTEM_PROMPT")
fi

echo "[claude] Dispatching: model=$_model" >&2

claude "${ARGS[@]}" "$SHERPA_TASK_PROMPT" > "${SHERPA_LOG_FILE:-/dev/stdout}" 2>&1
