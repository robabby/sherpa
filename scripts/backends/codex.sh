#!/usr/bin/env zsh
# scripts/backends/codex.sh — OpenAI Codex CLI backend module
#
# Contract: reads SHERPA_* env vars, returns exit code
#   0 = completed, 1 = failed, 2 = backend unavailable
#
# Uses Rust CLI (codex exec for headless).
# Auth: OPENAI_API_KEY env var or `codex login` session.
# No budget/cost control flags — set limits on OpenAI dashboard.

set -euo pipefail

# Health check
if [[ "${1:-}" == "--health" ]]; then
  if command -v codex &>/dev/null; then
    echo '{"available":true}'
    exit 0
  else
    echo '{"available":false,"error":"codex not found in PATH"}'
    exit 2
  fi
fi

# Interactive mode
if [[ "${SHERPA_MODE:-}" == "interactive" ]]; then
  ARGS=()
  if [[ -n "${SHERPA_MODEL:-}" ]]; then
    ARGS+=(--model "$SHERPA_MODEL")
  fi
  exec codex "${ARGS[@]}" "$@"
fi

# Headless mode
if ! command -v codex &>/dev/null; then
  echo "[codex] ERROR: codex not found in PATH" >&2
  exit 2
fi

ARGS=(exec)
if [[ -n "${SHERPA_MODEL:-}" ]]; then
  ARGS+=(--model "$SHERPA_MODEL")
fi

echo "[codex] Dispatching: model=${SHERPA_MODEL:-default}" >&2

codex "${ARGS[@]}" "$SHERPA_TASK_PROMPT" > "${SHERPA_LOG_FILE:-/dev/stdout}" 2>&1
