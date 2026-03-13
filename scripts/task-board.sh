#!/usr/bin/env zsh
set -euo pipefail

TASKS_DIR="$(cd "$(dirname "$0")/.." && pwd)/docs/tasks"

usage() {
  cat <<'EOF'
Usage:
  task-board.sh add <slug> <description> [--role <role>] [--initiative <init>] [--task-type <type>] [--mode <mode>]
  task-board.sh list [--status <open|claimed|done>]
  task-board.sh claim <slug> [--session <session-id>]
  task-board.sh done <slug>
EOF
  exit 1
}

cmd_add() {
  local slug="" description="" role="general" initiative="" task_type="general" mode="supervised"
  slug="$1"; shift
  description="$1"; shift

  while [[ $# -gt 0 ]]; do
    case "$1" in
      --role) role="$2"; shift 2 ;;
      --initiative) initiative="$2"; shift 2 ;;
      --task-type) task_type="$2"; shift 2 ;;
      --mode) mode="$2"; shift 2 ;;
      *) echo "Unknown option: $1" >&2; exit 1 ;;
    esac
  done

  local ROLE="$role"
  local INITIATIVE="$initiative"
  local TASK_TYPE="$task_type"
  local MODE="$mode"

  local created
  created="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
  local file="$TASKS_DIR/${slug}.md"

  cat > "$file" <<TASKEOF
---
id: ${slug}
status: open
created: ${created}
role: ${ROLE:-null}
initiative: ${INITIATIVE:-null}
task-type: ${TASK_TYPE:-general}
mode: ${MODE:-supervised}
claimed-by: null
---

# ${description}
TASKEOF

  echo "Created task: ${slug}"
}

cmd_list() {
  local filter=""
  while [[ $# -gt 0 ]]; do
    case "$1" in
      --status) filter="$2"; shift 2 ;;
      *) echo "Unknown option: $1" >&2; exit 1 ;;
    esac
  done

  for taskfile in "$TASKS_DIR"/*.md(N); do
    local taskslug="${taskfile:t:r}"
    local taskstatus tasktitle
    taskstatus=$(sed -n 's/^status: *//p' "$taskfile" | head -1)
    tasktitle=$(sed -n 's/^# *//p' "$taskfile" | head -1)

    if [[ -n "$filter" && "$taskstatus" != "$filter" ]]; then
      continue
    fi

    printf "  %-20s %-8s %s\n" "$taskslug" "[$taskstatus]" "$tasktitle"
  done
}

cmd_claim() {
  local slug="$1"; shift
  local file="$TASKS_DIR/${slug}.md"

  if [[ ! -f "$file" ]]; then
    echo "Error: task '${slug}' not found" >&2
    exit 1
  fi

  local claimed_by="${SHERPA_ROLE:-unknown}"

  sed -i '' "s/^status: .*/status: claimed/" "$file"
  sed -i '' "s/^claimed-by: .*/claimed-by: ${claimed_by}/" "$file"

  echo "Claimed: ${slug}"
}

cmd_done() {
  local slug="$1"; shift
  local file="$TASKS_DIR/${slug}.md"

  if [[ ! -f "$file" ]]; then
    echo "Error: task '${slug}' not found" >&2
    exit 1
  fi

  sed -i '' "s/^status: .*/status: done/" "$file"

  echo "Done: ${slug}"
}

[[ $# -lt 1 ]] && usage

case "$1" in
  add)
    shift
    [[ $# -lt 2 ]] && usage
    cmd_add "$@"
    ;;
  list)
    shift
    cmd_list "$@"
    ;;
  claim)
    shift
    [[ $# -lt 1 ]] && usage
    cmd_claim "$@"
    ;;
  done)
    shift
    [[ $# -lt 1 ]] && usage
    cmd_done "$@"
    ;;
  *)
    usage
    ;;
esac
