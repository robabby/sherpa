#!/usr/bin/env zsh
# scripts/dispatch-queue.sh — Batch/overnight dispatch queue
#
# Usage:
#   ./scripts/dispatch-queue.sh <slug1> <slug2> ...
#   ./scripts/dispatch-queue.sh --pending
#   ./scripts/dispatch-queue.sh --pending --mode overnight

set -euo pipefail

SCRIPT_DIR="${0:a:h}"
MODE="supervised"
SLUGS=()

# Parse args
while [[ $# -gt 0 ]]; do
  case "$1" in
    --mode)
      MODE="$2"; shift 2 ;;
    --pending)
      while IFS= read -r slug; do
        [[ -n "$slug" ]] && SLUGS+=("$slug")
      done < <(node "${SCRIPT_DIR}/task-scanner.mjs" --status pending | node -e "
        const d = JSON.parse(require('fs').readFileSync('/dev/stdin','utf-8'));
        d.forEach(t => console.log(t.id));
      ")
      shift ;;
    --*)
      echo "[queue] Unknown flag: $1" >&2; exit 1 ;;
    *)
      SLUGS+=("$1"); shift ;;
  esac
done

if [[ ${#SLUGS[@]} -eq 0 ]]; then
  echo "[queue] No tasks to dispatch." >&2
  exit 0
fi

echo "[queue] Dispatching ${#SLUGS[@]} task(s) sequentially (mode: ${MODE}):"
for i in "${!SLUGS[@]}"; do
  echo "  $((i+1)). ${SLUGS[$i]}"
done
echo ""

COMPLETED=0
FAILED=0
SKIPPED=0

for i in "${!SLUGS[@]}"; do
  SLUG="${SLUGS[$i]}"
  echo "[queue] ($((i+1))/${#SLUGS[@]}) Dispatching: ${SLUG}"

  # Update mode on the task
  node "${SCRIPT_DIR}/task-scanner.mjs" --update "$SLUG" mode "$MODE" 2>/dev/null || true

  if "${SCRIPT_DIR}/worker.sh" "$SLUG" 2>&1; then
    echo "  ✓ ${SLUG} → completed"
    ((COMPLETED++)) || true
  else
    EXIT=$?
    if [[ $EXIT -eq 1 ]]; then
      echo "  ✗ ${SLUG} → failed"
      ((FAILED++)) || true
    else
      echo "  - ${SLUG} → skipped (exit ${EXIT})"
      ((SKIPPED++)) || true
    fi
  fi
  echo ""
done

echo "[queue] === Summary ==="
echo "  Completed: ${COMPLETED}"
echo "  Failed:    ${FAILED}"
echo "  Skipped:   ${SKIPPED}"

[[ $FAILED -gt 0 ]] && exit 1 || exit 0
