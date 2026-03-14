#!/usr/bin/env zsh
# scripts/backends/gemini.sh — Google Gemini CLI backend module
#
# Contract: reads SHERPA_* env vars, returns exit code
#   0 = completed, 1 = failed, 2 = backend unavailable
#
# Auth: GEMINI_API_KEY env var or gcloud ADC.
# Headless: gemini -p "prompt"
# Approval: --approval-mode=yolo for automated execution

set -euo pipefail

# Health check
if [[ "${1:-}" == "--health" ]]; then
  if command -v gemini &>/dev/null; then
    echo '{"available":true}'
    exit 0
  else
    echo '{"available":false,"error":"gemini not found in PATH"}'
    exit 2
  fi
fi

# Interactive mode
if [[ "${SHERPA_MODE:-}" == "interactive" ]]; then
  ARGS=()
  if [[ -n "${SHERPA_MODEL:-}" ]]; then
    ARGS+=(-m "$SHERPA_MODEL")
  fi
  exec gemini "${ARGS[@]}" "$@"
fi

# Headless mode
if ! command -v gemini &>/dev/null; then
  echo "[gemini] ERROR: gemini not found in PATH" >&2
  exit 2
fi

ARGS=()
if [[ -n "${SHERPA_MODEL:-}" ]]; then
  ARGS+=(-m "$SHERPA_MODEL")
fi
ARGS+=(--approval-mode=yolo)
ARGS+=(-p "$SHERPA_TASK_PROMPT")

echo "[gemini] Dispatching: model=${SHERPA_MODEL:-default}" >&2

gemini "${ARGS[@]}" > "${SHERPA_LOG_FILE:-/dev/stdout}" 2>&1
