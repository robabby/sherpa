#!/usr/bin/env zsh
# scripts/dispatch.sh — Interactive CLI launcher for Sherpa agent roles
#
# Usage: ./scripts/dispatch.sh <role-slug> [cli-args...]
#
# Reads task-type from docs/agents/roles/<slug>.md frontmatter,
# resolves backend via routing table, launches the appropriate CLI.

set -euo pipefail

SCRIPT_DIR="${0:a:h}"
REPO_ROOT="${SCRIPT_DIR:h}"

if [[ $# -lt 1 ]]; then
  echo "Usage: $0 <role-slug> [cli-args...]" >&2
  exit 1
fi

ROLE_SLUG="$1"
shift

ROLE_FILE="${REPO_ROOT}/docs/agents/roles/${ROLE_SLUG}.md"

if [[ ! -f "$ROLE_FILE" ]]; then
  echo "[dispatch] ERROR: role file not found: ${ROLE_FILE}" >&2
  exit 1
fi

# Extract task-type from YAML frontmatter
TASK_TYPE=""
IN_FRONTMATTER=false
while IFS= read -r line; do
  if [[ "$line" == "---" ]]; then
    if $IN_FRONTMATTER; then break; else IN_FRONTMATTER=true; continue; fi
  fi
  if $IN_FRONTMATTER && [[ "$line" =~ ^task-type:[[:space:]]*(.+)$ ]]; then
    TASK_TYPE="${match[1]}"
    break
  fi
done < "$ROLE_FILE"

TASK_TYPE="${TASK_TYPE:-general}"

# Check for --backend override flag
BACKEND_OVERRIDE=""
FILTERED_ARGS=()
SKIP_NEXT=false
for arg in "$@"; do
  if $SKIP_NEXT; then
    BACKEND_OVERRIDE="$arg"
    SKIP_NEXT=false
    continue
  fi
  if [[ "$arg" == "--backend" ]]; then
    SKIP_NEXT=true
    continue
  fi
  FILTERED_ARGS+=("$arg")
done
set -- "${FILTERED_ARGS[@]+${FILTERED_ARGS[@]}}"

# Resolve backend from task-type via config bridge
ROUTE_ARGS=("$TASK_TYPE" "interactive")
[[ -n "$BACKEND_OVERRIDE" ]] && ROUTE_ARGS+=(--backend "$BACKEND_OVERRIDE")

ROUTE_JSON=$(node "${SCRIPT_DIR}/resolve-route.mjs" "${ROUTE_ARGS[@]}" 2>&1) || {
  echo "[dispatch] Route resolution failed: ${ROUTE_JSON}" >&2
  exit 1
}

BACKEND=$(echo "$ROUTE_JSON" | node -e "const d=JSON.parse(require('fs').readFileSync('/dev/stdin','utf-8')); console.log(d.backend)")
RESOLVED_MODEL=$(echo "$ROUTE_JSON" | node -e "const d=JSON.parse(require('fs').readFileSync('/dev/stdin','utf-8')); console.log(d.model || '')")
SHERPA_MODEL="${RESOLVED_MODEL:-}"

echo "[dispatch] ${ROLE_SLUG} → ${BACKEND} (task-type: ${TASK_TYPE})" >&2

export SHERPA_ROLE="$ROLE_SLUG"
export SHERPA_MODE="interactive"
export SHERPA_MODEL="${SHERPA_MODEL:-}"

BACKEND_SCRIPT="${SCRIPT_DIR}/backends/${BACKEND}.sh"

if [[ -f "$BACKEND_SCRIPT" ]]; then
  exec "$BACKEND_SCRIPT" "$@"
else
  echo "[dispatch] Backend '${BACKEND}' not yet implemented (no ${BACKEND_SCRIPT})" >&2
  exit 1
fi
