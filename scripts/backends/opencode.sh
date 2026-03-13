#!/usr/bin/env zsh
# scripts/backends/opencode.sh — OpenCode Zen backend module
#
# Contract: reads SHERPA_* env vars, returns exit code
#   0 = completed, 1 = failed, 2 = backend unavailable
#
# Model IDs (discovered via `opencode models opencode`):
#   opencode/nemotron-3-super-free
#   opencode/minimax-m2.5-free
#   opencode/mimo-v2-flash-free
#   opencode/big-pickle
#   opencode/gpt-5-nano

set -euo pipefail

# Health check
if [[ "${1:-}" == "--health" ]]; then
  if command -v opencode &>/dev/null; then
    echo '{"available":true}'
    exit 0
  else
    echo '{"available":false,"error":"opencode not found in PATH"}'
    exit 2
  fi
fi

# Interactive mode
if [[ "${SHERPA_MODE:-}" == "interactive" ]]; then
  ARGS=()
  if [[ -n "${SHERPA_MODEL:-}" ]]; then
    # Prepend provider if not already present
    if [[ "$SHERPA_MODEL" == */* ]]; then
      ARGS+=(--model "$SHERPA_MODEL")
    else
      ARGS+=(--model "opencode/$SHERPA_MODEL")
    fi
  fi
  exec opencode "${ARGS[@]}" "$@"
fi

# Headless mode
if ! command -v opencode &>/dev/null; then
  echo "[opencode] ERROR: opencode not found in PATH" >&2
  exit 2
fi

MODEL_FLAG=()
if [[ -n "${SHERPA_MODEL:-}" ]]; then
  if [[ "$SHERPA_MODEL" == */* ]]; then
    MODEL_FLAG=(--model "$SHERPA_MODEL")
  else
    MODEL_FLAG=(--model "opencode/$SHERPA_MODEL")
  fi
fi

echo "[opencode] Dispatching: model=${SHERPA_MODEL:-default}" >&2

opencode run "${MODEL_FLAG[@]}" "$SHERPA_TASK_PROMPT" > "${SHERPA_LOG_FILE:-/dev/stdout}" 2>&1
