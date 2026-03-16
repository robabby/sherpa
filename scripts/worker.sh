#!/usr/bin/env bash
# scripts/worker.sh — Unified headless worker
#
# Reads a task file, validates mode guard rails, sets SHERPA_* env vars,
# and delegates to the appropriate backend module.
#
# Usage: ./scripts/worker.sh <task-slug>

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# ── Usage ──────────────────────────────────────────────────────────────
if [[ $# -lt 1 ]]; then
  echo "Usage: worker.sh <task-slug>" >&2
  echo "  Dispatches a task from docs/tasks/ to the configured backend." >&2
  exit 1
fi

TASK_SLUG="$1"

# ── Resolve task ───────────────────────────────────────────────────────
TASK_JSON=$(node "$SCRIPT_DIR/task-scanner.mjs" --id "$TASK_SLUG")

# task-scanner returns a JSON array — check if empty
TASK_COUNT=$(echo "$TASK_JSON" | node -e "
  let d=''; process.stdin.on('data',c=>d+=c); process.stdin.on('end',()=>{
    const arr=JSON.parse(d); console.log(arr.length);
  });
")

if [[ "$TASK_COUNT" -eq 0 ]]; then
  echo "ERROR: Task not found: $TASK_SLUG" >&2
  exit 1
fi

# Extract first (only) match
extract() {
  echo "$TASK_JSON" | node -e "
    let d=''; process.stdin.on('data',c=>d+=c); process.stdin.on('end',()=>{
      const arr=JSON.parse(d); console.log(arr[0]['$1'] ?? '');
    });
  "
}

# Extract body (may contain quotes/newlines — use base64 round-trip)
extract_body() {
  echo "$TASK_JSON" | node -e "
    let d=''; process.stdin.on('data',c=>d+=c); process.stdin.on('end',()=>{
      const arr=JSON.parse(d);
      process.stdout.write(arr[0].body ?? '');
    });
  "
}

BACKEND=$(extract backend)
MODEL=$(extract model)
TASK_TYPE=$(extract task-type)
MODE=$(extract mode)
BUDGET_USD=$(extract budget-usd)
TASK_FILE="$REPO_ROOT/docs/tasks/${TASK_SLUG}.md"
WORKTREE=$(extract worktree)

# Fallback defaults
MODE="${MODE:-supervised}"
BUDGET_USD="${BUDGET_USD:-1.00}"

# Resolve backend+model via config bridge
if [[ -z "$BACKEND" || "$BACKEND" == "null" ]]; then
  # No explicit backend — resolve from task-type
  ROUTE_JSON=$(node "$SCRIPT_DIR/resolve-route.mjs" "${TASK_TYPE:-general}" "$MODE" 2>&1) || {
    echo "ERROR: Route resolution failed: $ROUTE_JSON" >&2
    exit 1
  }
  BACKEND=$(echo "$ROUTE_JSON" | node -e "let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>console.log(JSON.parse(d).backend))")
  RESOLVED_MODEL=$(echo "$ROUTE_JSON" | node -e "let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>console.log(JSON.parse(d).model||''))")
  MODEL="${RESOLVED_MODEL:-${MODEL:-}}"
elif [[ -z "$MODEL" || "$MODEL" == "null" || "$MODEL" == "claude-sonnet-4-6" ]]; then
  # Backend set explicitly but model is missing/default — resolve model from config
  ROUTE_JSON=$(node "$SCRIPT_DIR/resolve-route.mjs" "${TASK_TYPE:-general}" "$MODE" --backend "$BACKEND" 2>&1) || true
  if [[ -n "$ROUTE_JSON" ]]; then
    RESOLVED_MODEL=$(echo "$ROUTE_JSON" | node -e "let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>console.log(JSON.parse(d).model||''))" 2>/dev/null)
    [[ -n "$RESOLVED_MODEL" ]] && MODEL="$RESOLVED_MODEL"
  fi
fi
BACKEND="${BACKEND:-claude}"
# Only default model for Claude — other backends use their own defaults
if [[ "$BACKEND" == "claude" ]]; then
  MODEL="${MODEL:-claude-sonnet-4-6}"
fi

# ── Mode guard rails ──────────────────────────────────────────────────
if [[ "$MODE" == "overnight" ]]; then
  if [[ "$TASK_TYPE" == "code-implementation" || "$TASK_TYPE" == "architect" ]]; then
    echo "ERROR: Mode 'overnight' cannot run task-type '$TASK_TYPE'. These types require interactive oversight." >&2
    exit 1
  fi
fi

# ── Build worker prompt ───────────────────────────────────────────────
TASK_BODY=$(extract_body)

WORKER_PROMPT="You are a Sherpa agent dispatched to complete a task autonomously.

Read the task below carefully. Complete ALL acceptance criteria. Commit your work with descriptive messages. Do NOT create a PR.

CONSTRAINTS:
- Stay within the scope. Do not make changes outside the deliverables.
- If blocked, write a note to docs/tasks/logs/${TASK_SLUG}-blockers.md explaining the issue.
- When finished, create docs/tasks/logs/${TASK_SLUG}-report.md summarizing: what you did, files changed, and any notes.

TASK:

${TASK_BODY}"

# ── Ensure logs directory ─────────────────────────────────────────────
mkdir -p "$REPO_ROOT/docs/tasks/logs"

# ── NDJSON event logger ──────────────────────────────────────────────
EVENTS_FILE="$REPO_ROOT/docs/tasks/logs/${TASK_SLUG}-events.ndjson"
log_event() {
  local event="$1"
  shift
  local ts
  ts=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
  echo "{\"timestamp\":\"$ts\",\"event\":\"$event\",\"source\":\"worker.sh\"$@}" >> "$EVENTS_FILE"
}

log_event "worker_started" ",\"taskSlug\":\"$TASK_SLUG\",\"backend\":\"$BACKEND\",\"model\":\"$MODEL\",\"mode\":\"$MODE\",\"taskType\":\"$TASK_TYPE\",\"budgetUsd\":\"$BUDGET_USD\""

# ── Export SHERPA_* env vars ──────────────────────────────────────────
export SHERPA_TASK_SLUG="$TASK_SLUG"
export SHERPA_TASK_FILE="$TASK_FILE"
export SHERPA_TASK_PROMPT="$WORKER_PROMPT"
export SHERPA_LOG_FILE="$REPO_ROOT/docs/tasks/logs/${TASK_SLUG}.log"
export SHERPA_MODEL="$MODEL"
export SHERPA_BUDGET_USD="$BUDGET_USD"
export SHERPA_WORKTREE="${WORKTREE:-}"
export SHERPA_MODE="$MODE"
export SHERPA_SYSTEM_PROMPT="You are executing task $TASK_SLUG for the Sherpa framework. Follow all instructions precisely."
export SHERPA_BACKEND="$BACKEND"

# ── Update status to dispatched ───────────────────────────────────────
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%S")
node "$SCRIPT_DIR/task-scanner.mjs" --update "$TASK_SLUG" status dispatched
node "$SCRIPT_DIR/task-scanner.mjs" --update "$TASK_SLUG" dispatched-at "$TIMESTAMP"
log_event "status_changed" ",\"from\":\"pending\",\"to\":\"dispatched\""

echo "[worker] Dispatching task=$TASK_SLUG backend=$BACKEND model=$MODEL mode=$MODE" >&2

# ── Resolve backend module ────────────────────────────────────────────
# Check .mjs first (API backends + lm-studio), then .sh (CLI backends)
if [[ -f "$SCRIPT_DIR/backends/${BACKEND}.mjs" ]]; then
  BACKEND_SCRIPT="$SCRIPT_DIR/backends/${BACKEND}.mjs"
elif [[ -f "$SCRIPT_DIR/backends/${BACKEND}.sh" ]]; then
  BACKEND_SCRIPT="$SCRIPT_DIR/backends/${BACKEND}.sh"
else
  BACKEND_SCRIPT=""
fi

if [[ ! -f "$BACKEND_SCRIPT" ]]; then
  echo "ERROR: Backend not found: $BACKEND_SCRIPT" >&2
  log_event "backend_not_found" ",\"script\":\"$BACKEND_SCRIPT\""
  node "$SCRIPT_DIR/task-scanner.mjs" --update "$TASK_SLUG" status failed
  exit 1
fi

log_event "backend_delegating" ",\"script\":\"$BACKEND_SCRIPT\",\"backend\":\"$BACKEND\",\"model\":\"$MODEL\""

# ── Start log streamer sidecar ────────────────────────────────────────
STREAMER_PID=""
if [[ -n "${SHERPA_LOG_FILE:-}" ]]; then
  bash "$SCRIPT_DIR/agent-log-streamer.sh" \
    "$SHERPA_LOG_FILE" "$EVENTS_FILE" "$TASK_SLUG" &
  STREAMER_PID=$!
fi

# ── Delegate to backend ───────────────────────────────────────────────
EXIT_CODE=0
if [[ "$BACKEND_SCRIPT" == *.mjs ]]; then
  node "$BACKEND_SCRIPT" || EXIT_CODE=$?
else
  bash "$BACKEND_SCRIPT" || EXIT_CODE=$?
fi

# ── Stop log streamer sidecar ─────────────────────────────────────────
if [[ -n "$STREAMER_PID" ]]; then
  kill "$STREAMER_PID" 2>/dev/null || true
  wait "$STREAMER_PID" 2>/dev/null || true
fi

# ── Update final status ──────────────────────────────────────────────
COMPLETED_AT=$(date -u +"%Y-%m-%dT%H:%M:%S")
DURATION_S=$(( $(date +%s) - $(date -j -f "%Y-%m-%dT%H:%M:%S" "$TIMESTAMP" +%s 2>/dev/null || echo 0) ))
if [[ "$EXIT_CODE" -eq 0 ]]; then
  node "$SCRIPT_DIR/task-scanner.mjs" --update "$TASK_SLUG" status completed
  node "$SCRIPT_DIR/task-scanner.mjs" --update "$TASK_SLUG" completed-at "$COMPLETED_AT"
  log_event "status_changed" ",\"from\":\"dispatched\",\"to\":\"completed\",\"exitCode\":0,\"durationSeconds\":$DURATION_S"
  echo "[worker] Task $TASK_SLUG completed successfully." >&2
else
  node "$SCRIPT_DIR/task-scanner.mjs" --update "$TASK_SLUG" status failed
  log_event "status_changed" ",\"from\":\"dispatched\",\"to\":\"failed\",\"exitCode\":$EXIT_CODE,\"durationSeconds\":$DURATION_S"
  echo "[worker] Task $TASK_SLUG failed with exit code $EXIT_CODE." >&2
fi

exit "$EXIT_CODE"
