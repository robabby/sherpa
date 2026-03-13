# Dispatch Center Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Port WavePoint's agentic dispatch system to Sherpa, expand to 5 backends (Claude, OpenCode, Codex, Gemini, LM Studio), add task-type routing via config, and build a three-panel Dispatch Center UI at `/dispatch`.

**Architecture:** Unified shell entry points (`dispatch.sh`, `worker.sh`, `auto-judge.sh`) delegate to backend-specific modules in `scripts/backends/`. Task-type routing resolves via `sherpa.config.ts`. A Studio Dispatch Center page at `/dispatch` provides a three-panel view (Backlog | Assignments | Workforce) with polling-based status updates. All dispatch operations go through shell scripts — the web app shells out, never runs backends in-process.

**Tech Stack:** Shell (zsh), Node.js (ESM), TypeScript, React (Next.js 16), Tailwind v4, shadcn/ui, motion/react, studio-core APIs

**Reference files:**
- WavePoint source: `../wavepoint/scripts/` (dispatch.sh, claude-worker.sh, auto-judge.sh, task-board.sh, task-scanner.mjs, dispatch-queue.mjs, lm-worker.mjs)
- Design: `docs/initiatives/dispatch-center/design.md`
- Shape: `docs/initiatives/dispatch-center/shape.md`
- Research: `docs/initiatives/dispatch-center/research/iteration-1.md`
- Prototype: `docs/initiatives/dispatch-center/prototype.html`

---

## Session 1: Scripts Foundation + Claude Backend

### Task 1.1: Task Scanner

**Files:**
- Create: `scripts/task-scanner.mjs`
- Reference: `../wavepoint/scripts/task-scanner.mjs`

**Step 1: Create task scanner**

Port from WavePoint with these changes:
- Replace all `WAVEPOINT_ROLE` references with `SHERPA_ROLE`
- Add `task-type` and `mode` to recognized frontmatter fields
- Add `--task-type <type>` and `--mode <mode>` filter flags alongside existing `--status`, `--id`, `--role`, `--backend` flags
- Keep: `parseFrontmatter()`, `serializeFrontmatter()`, `scanTasks()`, `findStaleTasks()`, `updateTask()`
- Keep: `--stale`, `--update` subcommands

The file should be ~150 lines. Copy the WavePoint version, then apply the changes above.

**Step 2: Verify**

Run:
```bash
chmod +x scripts/task-scanner.mjs
node scripts/task-scanner.mjs
```
Expected: `[]` (empty JSON array — no tasks in docs/tasks/ yet, or existing tasks listed)

Run:
```bash
node scripts/task-scanner.mjs --status pending
```
Expected: `[]` or filtered task list

**Step 3: Commit**

```bash
git add scripts/task-scanner.mjs
git commit -m "feat(dispatch): port task scanner from WavePoint with task-type and mode support"
```

---

### Task 1.2: Task Board CLI

**Files:**
- Create: `scripts/task-board.sh`
- Reference: `../wavepoint/scripts/task-board.sh`

**Step 1: Create task board CLI**

Port from WavePoint with these changes:
- `WAVEPOINT_ROLE` → `SHERPA_ROLE` in the `claim` command
- `add` command accepts `--task-type <type>` and `--mode <mode>` flags
- Default `task-type` to `general`, default `mode` to `supervised`
- Add `task-type` and `mode` fields to the frontmatter template in `cmd_add()`

The frontmatter template for `add` should be:
```yaml
---
status: open
created: ${created}
role: ${ROLE:-null}
initiative: ${INITIATIVE:-null}
task-type: ${TASK_TYPE:-general}
mode: ${MODE:-supervised}
claimed-by: null
---
```

**Step 2: Verify**

Run:
```bash
chmod +x scripts/task-board.sh
./scripts/task-board.sh add test-task "Test the task board" --role engineer --task-type code-review
./scripts/task-board.sh list
./scripts/task-board.sh claim test-task
./scripts/task-board.sh list
./scripts/task-board.sh done test-task
./scripts/task-board.sh list
```
Expected: Task transitions through open → claimed → done.

**Step 3: Clean up test task**

```bash
rm docs/tasks/test-task.md
```

**Step 4: Commit**

```bash
git add scripts/task-board.sh
git commit -m "feat(dispatch): port task board CLI with task-type and mode support"
```

---

### Task 1.3: Backend Contract + Claude Backend

**Files:**
- Create: `scripts/backends/claude.sh`

**Step 1: Create backends directory and Claude module**

```bash
mkdir -p scripts/backends
```

Write `scripts/backends/claude.sh`. This module reads `SHERPA_*` env vars and invokes `claude`:

```bash
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

ARGS=(
  --print
  --model "${SHERPA_MODEL:-claude-sonnet-4-6}"
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

echo "[claude] Dispatching: model=${SHERPA_MODEL:-claude-sonnet-4-6}" >&2

claude "${ARGS[@]}" "$SHERPA_TASK_PROMPT" > "${SHERPA_LOG_FILE:-/dev/stdout}" 2>&1
```

**Step 2: Verify**

```bash
chmod +x scripts/backends/claude.sh
scripts/backends/claude.sh --health
```
Expected: `{"available":true}` (assuming `claude` is in PATH)

**Step 3: Commit**

```bash
git add scripts/backends/claude.sh
git commit -m "feat(dispatch): Claude Code backend module with health check and headless support"
```

---

### Task 1.4: Dispatch Script (Interactive)

**Files:**
- Create: `scripts/dispatch.sh`
- Reference: `../wavepoint/scripts/dispatch.sh`

**Step 1: Create the interactive dispatch script**

Port from WavePoint with major changes:
- Read `task-type` from role frontmatter (not `model-tier`)
- Hardcoded routing table (config integration comes in Session 3):
  ```
  code-implementation → claude, claude-opus-4-6
  code-review → codex (stub)
  architect → claude, claude-opus-4-6
  research → opencode (stub)
  content-generation → gemini (stub)
  audit → opencode (stub)
  embeddings → opencode (stub)
  * → claude, claude-sonnet-4-6
  ```
- Support `--backend <name>` flag to override routing
- For Claude: source `scripts/backends/claude.sh` in interactive mode
- For other backends: print `[dispatch] Backend '<name>' not yet implemented` and exit 1
- Replace `WAVEPOINT_ROLE` with `SHERPA_ROLE` throughout
- Replace `exec claude "$@"` with backend delegation

Key structure:
```bash
#!/usr/bin/env zsh
set -euo pipefail

SCRIPT_DIR="${0:a:h}"
REPO_ROOT="${SCRIPT_DIR:h}"

# Parse args: first arg is role slug, rest passed to CLI
ROLE_SLUG="${1:?Usage: dispatch.sh <role-slug> [cli-args...]}"
shift

ROLE_FILE="${REPO_ROOT}/docs/agents/roles/${ROLE_SLUG}.md"
# ... validate role file exists ...

# Extract task-type from frontmatter
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

# Check for --backend override
BACKEND_OVERRIDE=""
FILTERED_ARGS=()
for arg in "$@"; do
  if [[ "$arg" == "--backend" ]]; then
    # next arg is the backend name — handle in next iteration
    BACKEND_OVERRIDE="__next__"
  elif [[ "$BACKEND_OVERRIDE" == "__next__" ]]; then
    BACKEND_OVERRIDE="$arg"
  else
    FILTERED_ARGS+=("$arg")
  fi
done
set -- "${FILTERED_ARGS[@]}"

# Resolve backend from task-type (hardcoded for now)
if [[ -n "$BACKEND_OVERRIDE" && "$BACKEND_OVERRIDE" != "__next__" ]]; then
  BACKEND="$BACKEND_OVERRIDE"
else
  case "$TASK_TYPE" in
    code-implementation) BACKEND="claude"; SHERPA_MODEL="claude-opus-4-6" ;;
    architect)           BACKEND="claude"; SHERPA_MODEL="claude-opus-4-6" ;;
    code-review)         BACKEND="codex" ;;
    research|audit|embeddings) BACKEND="opencode" ;;
    content-generation)  BACKEND="gemini" ;;
    *)                   BACKEND="claude"; SHERPA_MODEL="claude-sonnet-4-6" ;;
  esac
fi

echo "[dispatch] ${ROLE_SLUG} → ${BACKEND} (task-type: ${TASK_TYPE:-unset})" >&2

export SHERPA_ROLE="$ROLE_SLUG"
export SHERPA_MODE="interactive"
export SHERPA_MODEL="${SHERPA_MODEL:-}"

BACKEND_SCRIPT="${SCRIPT_DIR}/backends/${BACKEND}.sh"
if [[ -f "$BACKEND_SCRIPT" ]]; then
  source "$BACKEND_SCRIPT"
  # interactive mode calls exec inside the backend script
else
  echo "[dispatch] Backend '${BACKEND}' not yet implemented" >&2
  exit 1
fi
```

**Step 2: Verify**

```bash
chmod +x scripts/dispatch.sh
./scripts/dispatch.sh architect --help 2>&1 | head -5
```
Expected: Prints `[dispatch] architect → claude (task-type: ...)` then Claude Code help output.

Test stub backend:
```bash
./scripts/dispatch.sh research-lead 2>&1
```
Expected: `[dispatch] research-lead → opencode (task-type: research)` then `Backend 'opencode' not yet implemented`

**Step 3: Commit**

```bash
git add scripts/dispatch.sh
git commit -m "feat(dispatch): interactive CLI launcher with task-type routing"
```

---

### Task 1.5: Unified Worker

**Files:**
- Create: `scripts/worker.sh`

**Step 1: Create the unified headless worker**

This script handles the common task lifecycle and delegates to backend modules:

```bash
#!/usr/bin/env zsh
# scripts/worker.sh — Unified headless worker
#
# Usage: ./scripts/worker.sh <task-slug>
#
# Lifecycle:
# 1. Read task file via task-scanner.mjs
# 2. Extract backend, model, task-type, mode
# 3. Validate mode guard rails
# 4. Update status → dispatched
# 5. Set SHERPA_* env vars
# 6. Delegate to scripts/backends/<backend>.sh (or .mjs)
# 7. Update status → completed or failed

set -euo pipefail

SCRIPT_DIR="${0:a:h}"
REPO_ROOT="${SCRIPT_DIR:h}"
TASKS_DIR="${REPO_ROOT}/docs/tasks"
LOGS_DIR="${TASKS_DIR}/logs"
mkdir -p "$LOGS_DIR"

TASK_SLUG="${1:?Usage: worker.sh <task-slug>}"

# Read task via scanner
TASK_JSON=$(node "${SCRIPT_DIR}/task-scanner.mjs" --id "$TASK_SLUG")
TASK_FILE=$(echo "$TASK_JSON" | node -e "
  const d = JSON.parse(require('fs').readFileSync('/dev/stdin','utf-8'));
  if (d.length) console.log(d[0].file);
")

if [[ -z "$TASK_FILE" ]]; then
  echo "[worker] Task not found: ${TASK_SLUG}" >&2
  exit 1
fi

TASK_PATH="${TASKS_DIR}/${TASK_FILE}"

# Extract fields from frontmatter
extract_field() {
  node -e "
    const c = require('fs').readFileSync('${TASK_PATH}','utf-8');
    const m = c.match(new RegExp('^${1}:\\\\s*(.+)\$', 'm'));
    console.log(m ? m[1].trim() : '${2:-}');
  "
}

BACKEND=$(extract_field backend claude)
MODEL=$(extract_field model claude-sonnet-4-6)
TASK_TYPE=$(extract_field task-type general)
MODE=$(extract_field mode supervised)
BUDGET=$(extract_field budget-usd 1.00)

# Mode guard rails
OVERNIGHT_BLOCKED=("code-implementation" "architect")
if [[ "$MODE" == "overnight" ]]; then
  for blocked in "${OVERNIGHT_BLOCKED[@]}"; do
    if [[ "$TASK_TYPE" == "$blocked" ]]; then
      echo "[worker] BLOCKED: task-type '${TASK_TYPE}' not allowed in overnight mode" >&2
      exit 1
    fi
  done
fi

LOG_FILE="${LOGS_DIR}/${TASK_SLUG}.log"
WORKTREE_NAME="task-${TASK_SLUG}"

# Update status → dispatched
node "${SCRIPT_DIR}/task-scanner.mjs" --update "$TASK_SLUG" status dispatched
node "${SCRIPT_DIR}/task-scanner.mjs" --update "$TASK_SLUG" dispatched-at "$(date -u +%Y-%m-%dT%H:%M:%S)"

# Build worker prompt from task body
TASK_BODY=$(node -e "
  const c = require('fs').readFileSync('${TASK_PATH}','utf-8');
  const m = c.match(/^---[\\s\\S]*?---\\n([\\s\\S]*)$/);
  console.log(m ? m[1] : c);
")

WORKER_PROMPT="You are a Sherpa agent dispatched to complete a task autonomously.

Read the task below carefully. Complete ALL acceptance criteria. Commit your work with descriptive messages. Do NOT create a PR.

CONSTRAINTS:
- Stay within the scope. Do not make changes outside the deliverables.
- If blocked, write a note to docs/tasks/logs/${TASK_SLUG}-blockers.md explaining the issue.
- When finished, create docs/tasks/logs/${TASK_SLUG}-report.md summarizing: what you did, files changed, and any notes.

TASK:

${TASK_BODY}"

# Export contract env vars
export SHERPA_TASK_SLUG="$TASK_SLUG"
export SHERPA_TASK_FILE="$TASK_PATH"
export SHERPA_TASK_PROMPT="$WORKER_PROMPT"
export SHERPA_LOG_FILE="$LOG_FILE"
export SHERPA_MODEL="$MODEL"
export SHERPA_BUDGET_USD="$BUDGET"
export SHERPA_WORKTREE="$WORKTREE_NAME"
export SHERPA_MODE="$MODE"
export SHERPA_SYSTEM_PROMPT="Complete the task and commit all changes. Stay focused on the acceptance criteria."

echo "[worker] Dispatching ${TASK_SLUG} → ${BACKEND} (model: ${MODEL}, mode: ${MODE})" >&2

# Delegate to backend
BACKEND_SCRIPT="${SCRIPT_DIR}/backends/${BACKEND}.sh"
BACKEND_SCRIPT_MJS="${SCRIPT_DIR}/backends/${BACKEND}.mjs"

EXIT_CODE=0
if [[ -f "$BACKEND_SCRIPT" ]]; then
  "$BACKEND_SCRIPT" || EXIT_CODE=$?
elif [[ -f "$BACKEND_SCRIPT_MJS" ]]; then
  node "$BACKEND_SCRIPT_MJS" || EXIT_CODE=$?
else
  echo "[worker] Backend '${BACKEND}' not found at ${BACKEND_SCRIPT}" >&2
  EXIT_CODE=1
fi

# Update status based on exit code
if [[ $EXIT_CODE -eq 0 ]]; then
  node "${SCRIPT_DIR}/task-scanner.mjs" --update "$TASK_SLUG" status completed
  node "${SCRIPT_DIR}/task-scanner.mjs" --update "$TASK_SLUG" completed-at "$(date -u +%Y-%m-%dT%H:%M:%S)"
  echo "[worker] ✓ ${TASK_SLUG} completed" >&2
elif [[ $EXIT_CODE -eq 2 ]]; then
  node "${SCRIPT_DIR}/task-scanner.mjs" --update "$TASK_SLUG" status failed
  echo "[worker] ✗ ${TASK_SLUG} — backend unavailable" >&2
else
  node "${SCRIPT_DIR}/task-scanner.mjs" --update "$TASK_SLUG" status failed
  echo "[worker] ✗ ${TASK_SLUG} failed (exit ${EXIT_CODE})" >&2
fi

exit $EXIT_CODE
```

**Step 2: Verify**

```bash
chmod +x scripts/worker.sh
./scripts/worker.sh nonexistent-task 2>&1
```
Expected: `[worker] Task not found: nonexistent-task`

**Step 3: Commit**

```bash
git add scripts/worker.sh
git commit -m "feat(dispatch): unified headless worker with mode guard rails and backend delegation"
```

---

### Task 1.6: Auto-Judge

**Files:**
- Create: `scripts/auto-judge.sh`
- Reference: `../wavepoint/scripts/auto-judge.sh`

**Step 1: Create auto-judge**

Port from WavePoint's `auto-judge.sh` (187 lines). Changes:
- `WAVEPOINT_ROLE` → `SHERPA_ROLE`
- Add `--backend opencode` option alongside existing `local` and `claude`
- For `opencode` backend: use `opencode run --model opencode/minimax-m2.5 "prompt"` (once implemented, stub for now)
- Keep: `judge_task()` function, structured verdict format, `--all` flag, diff gathering
- Keep: LM Studio judge path via Node inline script

**Step 2: Verify**

```bash
chmod +x scripts/auto-judge.sh
./scripts/auto-judge.sh 2>&1 | head -3
```
Expected: Usage message

**Step 3: Commit**

```bash
git add scripts/auto-judge.sh
git commit -m "feat(dispatch): port auto-judge with multi-backend support"
```

---

### Task 1.7: Dispatch Queue

**Files:**
- Create: `scripts/dispatch-queue.sh`

**Step 1: Create batch dispatch queue**

Shell script (not Node like WavePoint's version — simpler for the initial implementation):

```bash
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
    --mode)    MODE="$2"; shift 2 ;;
    --pending) SLUGS=($(node "${SCRIPT_DIR}/task-scanner.mjs" --status pending | node -e "
      const d = JSON.parse(require('fs').readFileSync('/dev/stdin','utf-8'));
      d.forEach(t => console.log(t.id));
    ")); shift ;;
    --*)       echo "Unknown flag: $1" >&2; exit 1 ;;
    *)         SLUGS+=("$1"); shift ;;
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
    ((COMPLETED++))
  else
    EXIT=$?
    if [[ $EXIT -eq 1 ]]; then
      echo "  ✗ ${SLUG} → failed"
      ((FAILED++))
    else
      echo "  - ${SLUG} → skipped (exit ${EXIT})"
      ((SKIPPED++))
    fi
  fi
  echo ""
done

echo "[queue] === Summary ==="
echo "  Completed: ${COMPLETED}"
echo "  Failed:    ${FAILED}"
echo "  Skipped:   ${SKIPPED}"

[[ $FAILED -gt 0 ]] && exit 1 || exit 0
```

**Step 2: Verify**

```bash
chmod +x scripts/dispatch-queue.sh
./scripts/dispatch-queue.sh --pending 2>&1
```
Expected: `[queue] No tasks to dispatch.`

**Step 3: Commit**

```bash
git add scripts/dispatch-queue.sh
git commit -m "feat(dispatch): batch dispatch queue with mode guard rails"
```

---

### Task 1.8: Session 1 Integration Test

**Step 1: Create a test task and verify the full pipeline**

```bash
./scripts/task-board.sh add dispatch-test "Integration test for dispatch pipeline" \
  --role engineer --task-type code-review
```

Verify the task exists:
```bash
node scripts/task-scanner.mjs --id dispatch-test
```

Verify worker rejects if backend not found (codex not yet implemented):
```bash
node scripts/task-scanner.mjs --update dispatch-test backend codex
./scripts/worker.sh dispatch-test 2>&1
```
Expected: Backend 'codex' not found

Reset to claude backend and verify it would dispatch (dry run — we don't actually want to spend API tokens):
```bash
node scripts/task-scanner.mjs --update dispatch-test backend claude
node scripts/task-scanner.mjs --update dispatch-test status pending
```

**Step 2: Clean up**

```bash
rm docs/tasks/dispatch-test.md
```

**Step 3: Commit all Session 1 work if not already committed**

```bash
git status
```

---

## Session 2: Backend Modules (OpenCode, Codex, Gemini, LM Studio)

### Task 2.1: Verify CLI Installations

**Step 1: Check which CLIs are available**

```bash
command -v opencode && opencode --version || echo "opencode: not installed"
command -v codex && codex --version || echo "codex: not installed"
command -v gemini && gemini --version || echo "gemini: not installed"
```

For any missing CLIs, install:
- OpenCode: `npm i -g opencode-ai@latest` or `brew install anomalyco/tap/opencode`
- Codex: `brew install --cask codex` (Rust CLI)
- Gemini: `npm install -g @google/gemini-cli`

**Step 2: Get OpenCode model IDs**

```bash
opencode models opencode 2>/dev/null || echo "Run 'opencode' interactively first to authenticate"
```

Note the exact model slugs for Nemotron, MiniMax, MiMo.

**Step 3: Commit any notes to research**

If model IDs or auth details differ from research, update:
```
docs/initiatives/dispatch-center/research/iteration-1/vector-1-opencode-cli-flags.md
```

---

### Task 2.2: OpenCode Backend

**Files:**
- Create: `scripts/backends/opencode.sh`

**Step 1: Write the backend module**

Key research findings:
- Headless: `opencode run "prompt"`
- Model: `--model opencode/<model-id>` (provider/model format)
- JSON output: `--format json`
- Free models need no auth (auto `apiKey: "public"`)
- No `--print` flag — `run` subcommand IS the headless mode

```bash
#!/usr/bin/env zsh
# scripts/backends/opencode.sh — OpenCode Zen backend module

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
    ARGS+=(--model "opencode/${SHERPA_MODEL}")
  fi
  exec opencode "${ARGS[@]}" "$@"
fi

# Headless mode
if ! command -v opencode &>/dev/null; then
  echo "[opencode] ERROR: opencode not found in PATH" >&2
  exit 2
fi

MODEL_ARG=""
if [[ -n "${SHERPA_MODEL:-}" ]]; then
  # Prepend provider if not already present
  if [[ "$SHERPA_MODEL" == */* ]]; then
    MODEL_ARG="--model ${SHERPA_MODEL}"
  else
    MODEL_ARG="--model opencode/${SHERPA_MODEL}"
  fi
fi

echo "[opencode] Dispatching: model=${SHERPA_MODEL:-default}" >&2

opencode run ${MODEL_ARG} "$SHERPA_TASK_PROMPT" > "${SHERPA_LOG_FILE:-/dev/stdout}" 2>&1
```

**Step 2: Verify**

```bash
chmod +x scripts/backends/opencode.sh
scripts/backends/opencode.sh --health
```
Expected: `{"available":true}`

**Step 3: Commit**

```bash
git add scripts/backends/opencode.sh
git commit -m "feat(dispatch): OpenCode Zen backend module"
```

---

### Task 2.3: Codex Backend

**Files:**
- Create: `scripts/backends/codex.sh`

**Step 1: Write the backend module**

Key research findings:
- Rust CLI headless: `codex exec "prompt"`
- Model: `--model <model>`
- JSON output: `--json`
- Auth: `OPENAI_API_KEY` env var
- No budget flags — cost control via OpenAI dashboard
- Approval mode for interactive: default (suggest changes)

```bash
#!/usr/bin/env zsh
# scripts/backends/codex.sh — OpenAI Codex backend module

set -euo pipefail

# Health check
if [[ "${1:-}" == "--health" ]]; then
  if command -v codex &>/dev/null; then
    if [[ -n "${OPENAI_API_KEY:-}" ]]; then
      echo '{"available":true}'
      exit 0
    else
      echo '{"available":false,"error":"OPENAI_API_KEY not set"}'
      exit 2
    fi
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

if [[ -z "${OPENAI_API_KEY:-}" ]]; then
  echo "[codex] ERROR: OPENAI_API_KEY not set" >&2
  exit 2
fi

ARGS=(exec)
if [[ -n "${SHERPA_MODEL:-}" ]]; then
  ARGS+=(--model "$SHERPA_MODEL")
fi

echo "[codex] Dispatching: model=${SHERPA_MODEL:-default}" >&2

codex "${ARGS[@]}" "$SHERPA_TASK_PROMPT" > "${SHERPA_LOG_FILE:-/dev/stdout}" 2>&1
```

**Step 2: Verify**

```bash
chmod +x scripts/backends/codex.sh
scripts/backends/codex.sh --health
```
Expected: `{"available":true}` if codex + API key present, or appropriate error

**Step 3: Commit**

```bash
git add scripts/backends/codex.sh
git commit -m "feat(dispatch): Codex backend module"
```

---

### Task 2.4: Gemini Backend

**Files:**
- Create: `scripts/backends/gemini.sh`

**Step 1: Write the backend module**

Key research findings:
- Headless: `gemini -p "prompt"`
- Model: `-m flash` or `-m gemini-2.5-pro`
- JSON output: `--output-format json`
- Auth: `GEMINI_API_KEY` env var
- Approval mode: `--approval-mode=yolo` for headless
- Sandbox: `-s` flag available

```bash
#!/usr/bin/env zsh
# scripts/backends/gemini.sh — Google Gemini CLI backend module

set -euo pipefail

# Health check
if [[ "${1:-}" == "--health" ]]; then
  if command -v gemini &>/dev/null; then
    if [[ -n "${GEMINI_API_KEY:-}" ]]; then
      echo '{"available":true}'
      exit 0
    else
      echo '{"available":false,"error":"GEMINI_API_KEY not set"}'
      exit 2
    fi
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

if [[ -z "${GEMINI_API_KEY:-}" ]]; then
  echo "[gemini] ERROR: GEMINI_API_KEY not set" >&2
  exit 2
fi

ARGS=(-p)
if [[ -n "${SHERPA_MODEL:-}" ]]; then
  ARGS+=(-m "$SHERPA_MODEL")
fi
ARGS+=(--approval-mode=yolo)

echo "[gemini] Dispatching: model=${SHERPA_MODEL:-default}" >&2

gemini "${ARGS[@]}" "$SHERPA_TASK_PROMPT" > "${SHERPA_LOG_FILE:-/dev/stdout}" 2>&1
```

**Step 2: Verify**

```bash
chmod +x scripts/backends/gemini.sh
scripts/backends/gemini.sh --health
```

**Step 3: Commit**

```bash
git add scripts/backends/gemini.sh
git commit -m "feat(dispatch): Gemini CLI backend module"
```

---

### Task 2.5: LM Studio Backend

**Files:**
- Create: `scripts/backends/lm-studio.mjs`
- Reference: `../wavepoint/scripts/lm-worker.mjs`

**Step 1: Write the backend module**

Port from WavePoint's `lm-worker.mjs` but simplified to read `SHERPA_*` env vars instead of parsing frontmatter:

- Read `SHERPA_MODEL`, `SHERPA_TASK_PROMPT`, `SHERPA_LOG_FILE` from env
- Keep: `callLmStudio()`, think-block stripping, health check
- Remove: frontmatter parsing, task file reading, status updates (worker.sh handles those)
- Remove: WavePoint-specific voice guidelines from system prompt
- Remove: context file resolution (worker.sh builds the full prompt)
- Keep: `LM_STUDIO_URL` env var (default: `http://localhost:1234`)

The module should be ~100 lines. It receives a complete prompt and writes output to the log file.

When called with `--health` as argv[1], check LM Studio availability and exit.

**Step 2: Verify**

```bash
node scripts/backends/lm-studio.mjs --health
```
Expected: `{"available":false,"error":"..."}` (LM Studio not running) or `{"available":true,"models":[...]}`

**Step 3: Commit**

```bash
git add scripts/backends/lm-studio.mjs
git commit -m "feat(dispatch): LM Studio backend module (simplified from WavePoint)"
```

---

### Task 2.6: Update dispatch.sh Stubs

**Files:**
- Modify: `scripts/dispatch.sh`

**Step 1: Replace stub cases with real backend delegation**

In `dispatch.sh`, the backend routing switch should now source the real backend scripts for interactive mode. Each backend's `.sh` file handles `SHERPA_MODE=interactive` by calling `exec <cli>`.

Update the bottom of `dispatch.sh` to delegate to any available backend:
```bash
BACKEND_SCRIPT="${SCRIPT_DIR}/backends/${BACKEND}.sh"
BACKEND_SCRIPT_MJS="${SCRIPT_DIR}/backends/${BACKEND}.mjs"

if [[ -f "$BACKEND_SCRIPT" ]]; then
  export SHERPA_MODE="interactive"
  "$BACKEND_SCRIPT" "$@"
elif [[ -f "$BACKEND_SCRIPT_MJS" ]]; then
  echo "[dispatch] Backend '${BACKEND}' is API-only, no interactive mode" >&2
  exit 1
else
  echo "[dispatch] Backend '${BACKEND}' not found" >&2
  exit 1
fi
```

**Step 2: Verify**

```bash
./scripts/dispatch.sh architect --help 2>&1 | head -3
```
Expected: Routes to Claude, shows help.

**Step 3: Commit**

```bash
git add scripts/dispatch.sh
git commit -m "feat(dispatch): wire all backend modules into interactive launcher"
```

---

## Session 3: Routing Config + Role Updates

### Task 3.1: Dispatch Config Types

**Files:**
- Create: `packages/studio-core/src/dispatch.ts`

**Step 1: Write the dispatch module**

Create the types and route resolver. Reference `design.md` for the type definitions.

```ts
// packages/studio-core/src/dispatch.ts

export type Backend = 'claude' | 'opencode' | 'codex' | 'gemini' | 'lm-studio'
export type DispatchMode = 'interactive' | 'supervised' | 'overnight'
export type TaskType =
  | 'code-implementation' | 'code-review' | 'architect'
  | 'research' | 'content-generation' | 'audit'
  | 'embeddings' | 'general'

export interface BackendRoute {
  backend: Backend
  model?: string
}

export interface DispatchConfig {
  routes: Partial<Record<TaskType, BackendRoute>>
  fallback: BackendRoute
  offlineFallback: BackendRoute
  overnight: {
    blocked: TaskType[]
  }
}

export const DEFAULT_DISPATCH: DispatchConfig = {
  routes: {
    'code-implementation': { backend: 'claude', model: 'claude-opus-4-6' },
    'code-review':         { backend: 'codex' },
    'architect':           { backend: 'claude', model: 'claude-opus-4-6' },
    'research':            { backend: 'opencode', model: 'minimax-m2.5' },
    'content-generation':  { backend: 'gemini' },
    'audit':               { backend: 'opencode', model: 'minimax-m2.5' },
    'embeddings':          { backend: 'opencode', model: 'minimax-m2.5' },
  },
  fallback: { backend: 'opencode', model: 'minimax-m2.5' },
  offlineFallback: { backend: 'lm-studio' },
  overnight: {
    blocked: ['code-implementation', 'architect'],
  },
}

export interface RouteOverrides {
  backend?: Backend
  model?: string
}

/**
 * Resolve the backend route for a given task-type and mode.
 *
 * Resolution order:
 * 1. Explicit overrides (task frontmatter backend+model)
 * 2. Task-type route from config
 * 3. Config fallback
 */
export function resolveRoute(
  config: DispatchConfig,
  taskType: TaskType | string,
  mode: DispatchMode,
  overrides?: RouteOverrides,
): BackendRoute {
  // Explicit override
  if (overrides?.backend) {
    return { backend: overrides.backend, model: overrides.model }
  }

  // Task-type route
  const route = config.routes[taskType as TaskType]
  if (route) return route

  // Fallback
  return config.fallback
}

/**
 * Check if a task-type is allowed in the given mode.
 */
export function isTaskTypeAllowed(
  config: DispatchConfig,
  taskType: TaskType | string,
  mode: DispatchMode,
): boolean {
  if (mode !== 'overnight') return true
  return !config.overnight.blocked.includes(taskType as TaskType)
}
```

**Step 2: Export from index**

Add to `packages/studio-core/src/index.ts`:
```ts
export * from "./dispatch"
```

**Step 3: Verify**

```bash
cd /Users/rob/Workbench/sherpa && pnpm check
```
Expected: Type check passes.

**Step 4: Commit**

```bash
git add packages/studio-core/src/dispatch.ts packages/studio-core/src/index.ts
git commit -m "feat(dispatch): task-type routing types and resolver in studio-core"
```

---

### Task 3.2: Config Integration

**Files:**
- Modify: `packages/studio-core/src/config/types.ts`
- Modify: `packages/studio-core/src/config/defaults.ts`

**Step 1: Add dispatch to config types**

In `types.ts`, add to `SherpaUserConfig`:
```ts
import type { DispatchConfig } from "../dispatch"

// In SherpaUserConfig interface:
dispatch?: Partial<DispatchConfig>

// In SherpaConfig interface:
dispatch: DispatchConfig
```

**Step 2: Add defaults**

In `defaults.ts`, import and use the default dispatch config:
```ts
import { DEFAULT_DISPATCH } from "../dispatch"
```

In `buildDefaults()`, add to the return object:
```ts
dispatch: { ...DEFAULT_DISPATCH, ...userConfig.dispatch },
```

**Step 3: Verify**

```bash
pnpm check
```

**Step 4: Commit**

```bash
git add packages/studio-core/src/config/types.ts packages/studio-core/src/config/defaults.ts
git commit -m "feat(dispatch): add dispatch config to sherpa.config.ts schema"
```

---

### Task 3.3: Route Resolver Script

**Files:**
- Create: `scripts/resolve-route.mjs`

**Step 1: Write the config bridge**

Small Node script that shell scripts call to resolve task-type → backend+model:

```js
#!/usr/bin/env node

/**
 * scripts/resolve-route.mjs — Config bridge for shell scripts
 *
 * Usage:
 *   node scripts/resolve-route.mjs <task-type> [mode] [--backend override] [--model override]
 *
 * Outputs JSON: {"backend":"opencode","model":"minimax-m2.5"}
 */

// Use the hardcoded defaults directly — avoids needing to transpile sherpa.config.ts
const DEFAULT_ROUTES = {
  'code-implementation': { backend: 'claude', model: 'claude-opus-4-6' },
  'code-review':         { backend: 'codex' },
  'architect':           { backend: 'claude', model: 'claude-opus-4-6' },
  'research':            { backend: 'opencode', model: 'minimax-m2.5' },
  'content-generation':  { backend: 'gemini' },
  'audit':               { backend: 'opencode', model: 'minimax-m2.5' },
  'embeddings':          { backend: 'opencode', model: 'minimax-m2.5' },
}

const FALLBACK = { backend: 'opencode', model: 'minimax-m2.5' }
const OVERNIGHT_BLOCKED = ['code-implementation', 'architect']

const args = process.argv.slice(2)
const taskType = args[0]
const mode = args[1] || 'supervised'

let backendOverride = null
let modelOverride = null

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--backend') backendOverride = args[++i]
  if (args[i] === '--model') modelOverride = args[++i]
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
```

**Step 2: Verify**

```bash
node scripts/resolve-route.mjs code-review
```
Expected: `{"backend":"codex"}`

```bash
node scripts/resolve-route.mjs research overnight
```
Expected: `{"backend":"opencode","model":"minimax-m2.5"}`

```bash
node scripts/resolve-route.mjs code-implementation overnight 2>&1
```
Expected: `BLOCKED: task-type 'code-implementation' not allowed in overnight mode` (exit 1)

**Step 3: Commit**

```bash
git add scripts/resolve-route.mjs
git commit -m "feat(dispatch): config bridge script for shell-to-config routing"
```

---

### Task 3.4: Wire Config to Scripts

**Files:**
- Modify: `scripts/dispatch.sh`
- Modify: `scripts/worker.sh`

**Step 1: Update dispatch.sh to use resolve-route.mjs**

Replace the hardcoded routing switch with:
```bash
ROUTE_JSON=$(node "${SCRIPT_DIR}/resolve-route.mjs" "${TASK_TYPE:-general}" "interactive" \
  ${BACKEND_OVERRIDE:+--backend "$BACKEND_OVERRIDE"} 2>&1) || {
  echo "[dispatch] Route resolution failed: ${ROUTE_JSON}" >&2
  exit 1
}

BACKEND=$(echo "$ROUTE_JSON" | node -e "const d=JSON.parse(require('fs').readFileSync('/dev/stdin','utf-8')); console.log(d.backend)")
RESOLVED_MODEL=$(echo "$ROUTE_JSON" | node -e "const d=JSON.parse(require('fs').readFileSync('/dev/stdin','utf-8')); console.log(d.model || '')")

if [[ -n "$RESOLVED_MODEL" ]]; then
  export SHERPA_MODEL="$RESOLVED_MODEL"
fi
```

**Step 2: Update worker.sh similarly**

Replace `extract_field backend claude` with resolve-route call, falling back to task frontmatter override.

**Step 3: Verify**

```bash
./scripts/dispatch.sh architect --help 2>&1 | head -3
```
Expected: Still routes to Claude Opus via config.

**Step 4: Commit**

```bash
git add scripts/dispatch.sh scripts/worker.sh
git commit -m "feat(dispatch): wire scripts to config-based routing via resolve-route.mjs"
```

---

### Task 3.5: Role Frontmatter Updates

**Files:**
- Modify: `docs/agents/roles/*.md` — add `task-type` and `eligible-task-types`
- Modify: `scripts/validate-agent.ts` — validate new fields

**Step 1: Read existing role files to determine current set**

```bash
ls docs/agents/roles/
```

**Step 2: Add frontmatter fields to each role**

Add `task-type:` and `eligible-task-types:` to each role's YAML frontmatter. Mappings from the proposal:
- `architect` → `task-type: architect`
- `engineer` → `task-type: code-implementation`, `eligible-task-types: [code-review]`
- `code-reviewer` → `task-type: code-review`, `eligible-task-types: [audit]`
- `research-lead` → `task-type: research`
- `designer` → `task-type: content-generation`
- `technical-writer` → `task-type: content-generation`
- `judge` → `task-type: code-review`
- All others: `task-type: general`

**Step 3: Update validate-agent.ts**

Add `task-type` and `eligible-task-types` to the validation schema. `task-type` should be one of the known `TaskType` values. `eligible-task-types` should be an optional array.

**Step 4: Verify**

```bash
bun scripts/validate-agent.ts docs/agents/roles/architect.md
```
Expected: Passes validation.

**Step 5: Commit**

```bash
git add docs/agents/roles/ scripts/validate-agent.ts
git commit -m "feat(dispatch): add task-type and eligible-task-types to agent role frontmatter"
```

---

### Task 3.6: Extend TaskBoardEntry

**Files:**
- Modify: `packages/studio-core/src/tasks.ts`

**Step 1: Add taskType and mode to TaskBoardEntry**

Add to the `TaskBoardEntry` interface:
```ts
taskType: string;
mode: string;
```

Update `getTaskBoard()` where it builds the entry:
```ts
taskType: meta['task-type'] ?? 'general',
mode: meta.mode ?? 'supervised',
```

Same for `TaskDetail` and `getTaskDetail()`.

**Step 2: Verify**

```bash
pnpm check
```

**Step 3: Commit**

```bash
git add packages/studio-core/src/tasks.ts
git commit -m "feat(dispatch): add taskType and mode to TaskBoardEntry"
```

---

## Session 4: Dispatch Center UI

### Task 4.1: Workforce Data Layer

**Files:**
- Add functions to: `packages/studio-core/src/dispatch.ts`

**Step 1: Add workforce and health functions**

Add to the existing `dispatch.ts`:

```ts
import { execSync } from "child_process"
import path from "path"

export interface BackendHealth {
  backend: Backend
  available: boolean
  models?: string[]
  error?: string
}

export interface WorkforceAgent {
  slug: string
  displayName: string
  category: string
  taskType: string
  eligibleTaskTypes: string[]
}

/**
 * Check health of all configured backends by calling their --health flag.
 */
export function getBackendHealth(projectRoot?: string): BackendHealth[] {
  const root = projectRoot ?? process.cwd()
  const backends: Backend[] = ['claude', 'opencode', 'codex', 'gemini', 'lm-studio']

  return backends.map(backend => {
    const ext = backend === 'lm-studio' ? 'mjs' : 'sh'
    const script = path.join(root, `scripts/backends/${backend}.${ext}`)
    const cmd = ext === 'mjs' ? `node "${script}" --health` : `"${script}" --health`

    try {
      const output = execSync(cmd, { timeout: 5000, encoding: 'utf-8' })
      const data = JSON.parse(output.trim())
      return { backend, ...data }
    } catch {
      return { backend, available: false, error: 'health check failed' }
    }
  })
}
```

**Step 2: Verify**

```bash
pnpm check
```

**Step 3: Commit**

```bash
git add packages/studio-core/src/dispatch.ts
git commit -m "feat(dispatch): workforce data layer with backend health checks"
```

---

### Task 4.2: Dispatch API Route

**Files:**
- Create: `apps/studio/src/app/api/dispatch/run/route.ts`

**Step 1: Write the dispatch API route**

POST route that shells out to `worker.sh`:

```ts
import { NextResponse } from "next/server"
import { spawn } from "child_process"
import path from "path"

export async function POST(request: Request) {
  const { taskId, mode } = await request.json()

  if (!taskId) {
    return NextResponse.json({ error: "taskId required" }, { status: 400 })
  }

  const projectRoot = process.cwd()
  const workerScript = path.join(projectRoot, "scripts/worker.sh")

  // Update mode on task if provided
  if (mode) {
    const scannerScript = path.join(projectRoot, "scripts/task-scanner.mjs")
    try {
      const { execSync } = await import("child_process")
      execSync(`node "${scannerScript}" --update "${taskId}" mode "${mode}"`, {
        cwd: projectRoot,
      })
    } catch {
      // Non-critical — mode might already be set
    }
  }

  // Spawn worker as detached process
  const child = spawn(workerScript, [taskId], {
    cwd: projectRoot,
    detached: true,
    stdio: "ignore",
  })

  child.unref()

  return NextResponse.json({
    dispatched: true,
    taskId,
    pid: child.pid,
  })
}
```

**Step 2: Commit**

```bash
git add apps/studio/src/app/api/dispatch/run/route.ts
git commit -m "feat(dispatch): API route for dispatching tasks via worker.sh"
```

---

### Task 4.3: Dispatch Center Page + Content Component

**Files:**
- Create: `apps/studio/src/app/dispatch/page.tsx`
- Create: `apps/studio/src/components/studio/dispatch-content.tsx`
- Create: `packages/studio-ui/src/dispatch-content.tsx`

**Step 1: Create the server page**

```ts
// apps/studio/src/app/dispatch/page.tsx
import type { Metadata } from "next"
import { Suspense } from "react"

import { DispatchContent } from "@/components/studio/dispatch-content"
import { getTaskBoard } from "@/lib/studio/tasks"
import { getAgentRoles } from "@/lib/studio"
import { getBackendHealth } from "@sherpa/studio-core"

export const metadata: Metadata = {
  title: "Dispatch | Studio",
  robots: "noindex, nofollow",
}

export const dynamic = "force-dynamic"

export default function DispatchPage() {
  const tasks = getTaskBoard()
  const roles = getAgentRoles()
  const health = getBackendHealth()

  return (
    <Suspense>
      <DispatchContent tasks={tasks} roles={roles} health={health} />
    </Suspense>
  )
}
```

**Step 2: Create the re-export**

```ts
// apps/studio/src/components/studio/dispatch-content.tsx
export * from "@sherpa/studio-ui/dispatch-content"
```

**Step 3: Create the content component in studio-ui**

Create `packages/studio-ui/src/dispatch-content.tsx`. This is the main client component (~600-800 lines). Use the prototype HTML as the visual reference, translating to React + shadcn/ui + motion/react.

The component structure matches the design doc:
- `DispatchContent` — root, manages mode state and selected tasks
- `DispatchHeader` — mode radio group + stats
- Three panels in a `grid grid-cols-12` layout:
  - `BacklogPanel` (col-span-3) — pending tasks grouped by task-type, checkboxes
  - `AssignmentsPanel` (col-span-5) — dispatched tasks with elapsed timers, completed today
  - `WorkforcePanel` (col-span-4) — backend health dots, agent cards with assign buttons
- `QueueControls` — bottom bar with dispatch button

Use the existing style patterns from `tasks-content.tsx`:
- `STATUS_STYLES` badge map
- `PRIORITY_COLORS` map
- `staggerContainer`, `fadeVariant`, `cardVariant` animation variants
- `cn()` utility, `EASE_STANDARD` constant
- `StudioBreadcrumb` component

For polling: use `useEffect` with `setInterval` at 5000ms calling `router.refresh()` when there are dispatched tasks.

For the dispatch action: `fetch('/api/dispatch/run', { method: 'POST', body: JSON.stringify({ taskId, mode }) })`.

**Step 4: Add to studio-ui package exports**

Check `packages/studio-ui/package.json` for the exports pattern and add the dispatch-content entry.

**Step 5: Verify**

```bash
pnpm dev
```
Navigate to `http://localhost:3000/dispatch`. The three-panel layout should render with real task data (or empty states).

**Step 6: Commit**

```bash
git add apps/studio/src/app/dispatch/ apps/studio/src/components/studio/dispatch-content.tsx packages/studio-ui/src/dispatch-content.tsx packages/studio-ui/package.json
git commit -m "feat(studio): Dispatch Center UI — three-panel backlog/assignments/workforce"
```

---

### Task 4.4: Navigation Link

**Files:**
- Modify: Studio sidebar/nav component (find via grep for existing nav items like "Tasks" or "Workforce")

**Step 1: Find the nav component**

```bash
grep -r "Workforce" apps/studio/src/components/ --include="*.tsx" -l
```

**Step 2: Add Dispatch link**

Add a "Dispatch" nav item adjacent to "Tasks" and "Workforce" — it belongs in the same operational group.

**Step 3: Verify**

Navigate Studio — the Dispatch link should appear in the sidebar and route to `/dispatch`.

**Step 4: Commit**

```bash
git add apps/studio/src/components/
git commit -m "feat(studio): add Dispatch Center to sidebar navigation"
```

---

## Session 5: Auto-Dispatch + Polish

### Task 5.1: Agent Eligibility Matching

**Files:**
- Add to: `packages/studio-core/src/dispatch.ts`

**Step 1: Add matchTasksToAgents function**

```ts
import type { TaskBoardEntry } from "./tasks"

export interface ProposedAssignment {
  taskId: string
  taskTitle: string
  taskType: string
  agentSlug: string
  backend: Backend
  model?: string
}

export function matchTasksToAgents(
  tasks: TaskBoardEntry[],
  agents: WorkforceAgent[],
  config: DispatchConfig,
  mode: DispatchMode,
): ProposedAssignment[] {
  const pending = tasks.filter(t => t.status === 'pending')
  const assignments: ProposedAssignment[] = []

  for (const task of pending) {
    if (!isTaskTypeAllowed(config, task.taskType, mode)) continue

    // Find matching agent: prefer primary task-type match over eligible
    const primary = agents.find(a => a.taskType === task.taskType)
    const eligible = agents.find(a => a.eligibleTaskTypes.includes(task.taskType))
    const agent = primary ?? eligible

    if (!agent) continue

    const route = resolveRoute(config, task.taskType, mode)
    assignments.push({
      taskId: task.id,
      taskTitle: task.title,
      taskType: task.taskType,
      agentSlug: agent.slug,
      backend: route.backend,
      model: route.model,
    })
  }

  return assignments
}
```

**Step 2: Verify**

```bash
pnpm check
```

**Step 3: Commit**

```bash
git add packages/studio-core/src/dispatch.ts
git commit -m "feat(dispatch): agent eligibility matching for auto-dispatch"
```

---

### Task 5.2: Auto-Dispatch UI Flow

**Files:**
- Modify: `packages/studio-ui/src/dispatch-content.tsx`

**Step 1: Add auto-dispatch button handler**

When "Auto-Dispatch" is clicked:
1. Call `matchTasksToAgents()` client-side with the loaded data
2. Show a preview: "Will dispatch N tasks to M backends" (use a simple `confirm()` or inline preview)
3. On confirm: POST each assignment to `/api/dispatch/run` sequentially
4. Update UI as each task transitions

**Step 2: Add overnight guard rail banner**

When mode is `overnight`, show an alert banner listing blocked task types. Grey out any backlog tasks with blocked task-types.

**Step 3: Verify**

```bash
pnpm dev
```
Test mode switching and guard rail display at `/dispatch`.

**Step 4: Commit**

```bash
git add packages/studio-ui/src/dispatch-content.tsx
git commit -m "feat(dispatch): auto-dispatch flow with overnight guard rails"
```

---

### Task 5.3: Update docs/tasks/README.md

**Files:**
- Modify: `docs/tasks/README.md`

**Step 1: Add new fields to the frontmatter schema**

Add `task-type` and `mode` to the frontmatter section. Update the backend table to include all 5 backends. Add the dispatch modes section.

**Step 2: Commit**

```bash
git add docs/tasks/README.md
git commit -m "docs: update task file format with task-type, mode, and 5 backends"
```

---

### Task 5.4: Update CLAUDE.md

**Files:**
- Modify: `CLAUDE.md`

**Step 1: Add dispatch scripts to commands section**

Add under the workspace section or a new `## Dispatch` section:

```markdown
## Dispatch

```bash
./scripts/dispatch.sh <role-slug>       # Interactive: launch CLI for a role
./scripts/worker.sh <task-slug>         # Headless: dispatch a task
./scripts/auto-judge.sh <task-slug>     # Judge: review completed task
./scripts/dispatch-queue.sh --pending   # Queue: dispatch all pending tasks
./scripts/task-board.sh list            # List tasks
```
```

**Step 2: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: add dispatch scripts to CLAUDE.md"
```

---

### Task 5.5: Update Activity Log

**Files:**
- Modify: `docs/initiatives/dispatch-center/activity.md`
- Modify: `docs/initiatives/dispatch-center/proposal.md` (status → integrated)

**Step 1: Update activity log with implementation summary**

**Step 2: Update proposal status**

Change `status: approved` to `status: integrated`.

**Step 3: Commit**

```bash
git add docs/initiatives/dispatch-center/
git commit -m "docs: mark dispatch-center initiative as integrated"
```

---

## Summary

| Session | Tasks | Key Deliverables |
|---------|-------|-----------------|
| 1 | 1.1–1.8 | task-scanner.mjs, task-board.sh, dispatch.sh, worker.sh, auto-judge.sh, dispatch-queue.sh, backends/claude.sh |
| 2 | 2.1–2.6 | backends/opencode.sh, backends/codex.sh, backends/gemini.sh, backends/lm-studio.mjs, dispatch.sh updated |
| 3 | 3.1–3.6 | dispatch.ts types, config integration, resolve-route.mjs, role frontmatter updates, TaskBoardEntry extension |
| 4 | 4.1–4.4 | workforce data layer, dispatch API route, dispatch-content.tsx, nav link |
| 5 | 5.1–5.5 | auto-dispatch, guard rails, docs updates, status → integrated |

**Kill criteria checkpoints:**
- After Session 2: all 5 backends have health checks. If any CLI can't produce stdout in headless mode, demote to interactive-only.
- After Session 4: three-panel UI renders with real data. If it doesn't feel right after 1 session, fall back to table view (kill criterion #3).
- After Session 5: test 3 tasks on free OpenCode models. If output is unusable, remove as overnight default (kill criterion #4).
