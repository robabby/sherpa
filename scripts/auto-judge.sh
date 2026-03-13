#!/usr/bin/env zsh

# Auto-Judge — dispatches an automated judge session for a completed task.
#
# Usage:
#   ./scripts/auto-judge.sh <task-slug>        # judge one task
#   ./scripts/auto-judge.sh --all              # judge all completed tasks
#   ./scripts/auto-judge.sh --backend local    # use LM Studio instead of Claude
#   ./scripts/auto-judge.sh --backend opencode # use opencode with minimax-m2.5
#   ./scripts/auto-judge.sh --backend claude   # use Claude CLI (default)

set -euo pipefail

SCRIPT_DIR="${0:a:h}"
REPO_ROOT="${SCRIPT_DIR:h}"
TASKS_DIR="${REPO_ROOT}/docs/tasks"
LOGS_DIR="${TASKS_DIR}/logs"
BACKEND="claude"

mkdir -p "$LOGS_DIR"

JUDGE_ALL=false
TASK_ID=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --all)       JUDGE_ALL=true; shift ;;
    --backend)   BACKEND="$2"; shift 2 ;;
    *)           TASK_ID="$1"; shift ;;
  esac
done

judge_task() {
  local task_id="$1"

  local task_file
  task_file=$(node "${SCRIPT_DIR}/task-scanner.mjs" --id "$task_id" | node -e "
    const d = JSON.parse(require('fs').readFileSync('/dev/stdin','utf-8'));
    if (d.length) console.log(d[0].file);
  ")

  if [[ -z "$task_file" ]]; then
    echo "[auto-judge] Task not found: ${task_id}" >&2
    return 1
  fi

  local task_path="${TASKS_DIR}/${task_file}"
  local verdict_path="${LOGS_DIR}/${task_id}-verdict.md"
  local report_path="${LOGS_DIR}/${task_id}-report.md"
  local output_path="${LOGS_DIR}/${task_id}-output.md"

  # Gather worker output
  local worker_output=""
  if [[ -f "$report_path" ]]; then
    worker_output=$(cat "$report_path")
  elif [[ -f "$output_path" ]]; then
    worker_output=$(cat "$output_path")
  else
    worker_output="(No worker output found)"
  fi

  # Get diff if worktree branch exists
  local diff=""
  local branch_name="task/${task_id}"
  if git rev-parse --verify "$branch_name" >/dev/null 2>&1; then
    diff=$(git diff "main...${branch_name}" 2>/dev/null | head -500 || echo "(diff unavailable)")
  fi

  local judge_prompt
  judge_prompt=$(cat <<JUDGE_EOF
You are a Sherpa Judge. Review this worker's output against the task's acceptance criteria.

## Task Definition

$(cat "$task_path")

## Worker Output

${worker_output}

## Code Changes (diff against main, truncated to 500 lines)

\`\`\`diff
${diff:-"(No code changes or branch not found)"}
\`\`\`

## Instructions

Evaluate each acceptance criterion: is it met, partially met, or unmet? Cite evidence.

Then render your verdict in EXACTLY this format:

---
task: ${task_id}
verdict: <approved|needs-changes|rejected>
reviewed-at: $(date -u +%Y-%m-%dT%H:%M:%S)
model: (will be filled)
mode: automated
---

# Judge Verdict: ${task_id}

## Criteria Evaluation

| # | Criterion | Status | Evidence |
|---|-----------|--------|----------|
(one row per criterion from the task)

## Issues

(list specific issues, or "None")

## Summary

(1-2 sentences)
JUDGE_EOF
)

  echo "[auto-judge] Reviewing: ${task_id} (backend: ${BACKEND})" >&2

  local judge_output

  if [[ "$BACKEND" == "local" ]]; then
    # LM Studio judge
    judge_output=$(node -e "
      async function main() {
        const r = await fetch('http://localhost:1234/v1/chat/completions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: 'default',
            messages: [
              { role: 'system', content: 'You are a code reviewer. Evaluate worker output against acceptance criteria. Be precise and structured.' },
              { role: 'user', content: $(node -e "console.log(JSON.stringify(require('fs').readFileSync('/dev/stdin','utf-8')))" <<< "$judge_prompt") }
            ],
            temperature: 0.3,
            max_tokens: 2048
          })
        });
        const d = await r.json();
        console.log(d.choices?.[0]?.message?.content ?? 'ERROR: No response');
      }
      main();
    " 2>/dev/null)
  elif [[ "$BACKEND" == "opencode" ]]; then
    # opencode judge (minimax-m2.5)
    if command -v opencode >/dev/null 2>&1; then
      judge_output=$(opencode run --model opencode/minimax-m2.5 "$judge_prompt" 2>/dev/null)
    else
      echo "[auto-judge] WARNING: opencode not installed, falling back to claude backend" >&2
      judge_output=$(claude \
        --print \
        --model claude-sonnet-4-6 \
        --permission-mode plan \
        --max-budget-usd 0.50 \
        --append-system-prompt "You are a Sherpa Judge. Read-only. Produce a structured verdict." \
        "$judge_prompt" 2>/dev/null)
    fi
  else
    # Claude judge (default)
    judge_output=$(claude \
      --print \
      --model claude-sonnet-4-6 \
      --permission-mode plan \
      --max-budget-usd 0.50 \
      --append-system-prompt "You are a Sherpa Judge. Read-only. Produce a structured verdict." \
      "$judge_prompt" 2>/dev/null)
  fi

  echo "$judge_output" > "$verdict_path"

  # Extract verdict
  local verdict
  verdict=$(grep -oP 'verdict: \K\S+' "$verdict_path" | head -1 || echo "unknown")

  node "${SCRIPT_DIR}/task-scanner.mjs" --update "$task_id" status reviewed
  node "${SCRIPT_DIR}/task-scanner.mjs" --update "$task_id" judge-verdict "$verdict"

  echo "[auto-judge] ${task_id} → ${verdict} (saved to ${verdict_path})" >&2
}

if $JUDGE_ALL; then
  COMPLETED=$(node "${SCRIPT_DIR}/task-scanner.mjs" --status completed | node -e "
    const d = JSON.parse(require('fs').readFileSync('/dev/stdin','utf-8'));
    d.forEach(t => console.log(t.id));
  ")

  if [[ -z "$COMPLETED" ]]; then
    echo "[auto-judge] No completed tasks to review." >&2
    exit 0
  fi

  while IFS= read -r tid; do
    judge_task "$tid"
  done <<< "$COMPLETED"
else
  if [[ -z "$TASK_ID" ]]; then
    echo "Usage: $0 <task-id> | --all [--backend local|claude|opencode]" >&2
    exit 1
  fi
  judge_task "$TASK_ID"
fi
