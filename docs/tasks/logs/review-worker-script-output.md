# Code Review Output: review-worker-script

**Task:** Review worker.sh error handling and edge cases  
**Executed by:** Luna (OpenClaw) — nightly task runner  
**Date:** 2026-03-19  
**Initiative:** dispatch-center  

---

## File Reviewed

`scripts/worker.sh` — 183 lines

---

## Summary

`worker.sh` is the unified headless worker entry point. It reads a task file, resolves the backend, validates mode guard rails, exports `SHERPA_*` env vars, and delegates to the appropriate backend script. The script is well-structured with good practices: `set -euo pipefail`, NDJSON event logging, and clean status transitions.

Several error handling and edge case issues were found.

---

## Issues: Correctness / Error Handling

### 1. Duration calculation is broken on Linux
**Location:** `worker.sh` lines ~155-160

```bash
COMPLETED_AT=$(date -u +"%Y-%m-%dT%H:%M:%S")
DURATION_S=$(( $(date +%s) - $(date -j -f "%Y-%m-%dT%H:%M:%S" "$TIMESTAMP" +%s 2>/dev/null || echo 0) ))
```

`date -j -f` is a macOS BSD date syntax for parsing formatted timestamps. On Linux (where this script runs in CI and container environments), `date -j` does not exist — it silently falls through to `|| echo 0`, resulting in `DURATION_S=0` for every task.

**Evidence:** The Sherpa repo targets Linux deployment (container environment confirmed). BSD date syntax is a portability bug.

**Fix:**
```bash
DISPATCH_EPOCH=$(date -d "$TIMESTAMP" +%s 2>/dev/null || date +%s)
COMPLETED_EPOCH=$(date +%s)
DURATION_S=$(( COMPLETED_EPOCH - DISPATCH_EPOCH ))
```
Or simpler: capture `START_EPOCH=$(date +%s)` at the top of the script and diff at the end.

---

### 2. `extract_body` uses stdout but `extract` uses inline node — inconsistent pattern
**Location:** `worker.sh` lines ~37-52

```bash
extract() {
  echo "$TASK_JSON" | node -e "
    let d=''; process.stdin.on('data',c=>d+=c); process.stdin.on('end',()=>{
      const arr=JSON.parse(d); console.log(arr[0]['$1'] ?? '');
    });
  "
}

extract_body() {
  echo "$TASK_JSON" | node -e "
    ...
    process.stdout.write(arr[0].body ?? '');
  "
}
```

Both `extract` and `extract_body` spawn a separate `node` process. For 6-8 fields extracted, that's 6-8 Node.js process spawns. On slow startup environments (containers, NFS mounts), this adds ~200-500ms overhead per task.

**Not a blocking issue** — correctness is fine. But worth noting if dispatch latency becomes a concern.

**Recommendation:** Parse `TASK_JSON` once into shell variables via a single `node` invocation that outputs all fields.

---

### 3. Route resolution error is silently swallowed in the `--backend` branch
**Location:** `worker.sh` lines ~75-80

```bash
elif [[ -z "$MODEL" || "$MODEL" == "null" || "$MODEL" == "claude-sonnet-4-6" ]]; then
  ROUTE_JSON=$(node "$SCRIPT_DIR/resolve-route.mjs" "${TASK_TYPE:-general}" "$MODE" --backend "$BACKEND" 2>&1) || true
  if [[ -n "$ROUTE_JSON" ]]; then
    RESOLVED_MODEL=$(echo "$ROUTE_JSON" | node -e "..." 2>/dev/null)
    [[ -n "$RESOLVED_MODEL" ]] && MODEL="$RESOLVED_MODEL"
  fi
fi
```

The `|| true` after the `resolve-route.mjs` call silences any error from route resolution when the backend is explicitly set. If `resolve-route.mjs` fails (e.g., missing config, malformed JSON), `ROUTE_JSON` may contain error output and `RESOLVED_MODEL` will be empty — falling back to the default model silently.

**Contrast:** The first branch (`if [[ -z "$BACKEND" ]]`) correctly exits on route resolution failure:
```bash
ROUTE_JSON=$(...) || {
  echo "ERROR: Route resolution failed: $ROUTE_JSON" >&2
  exit 1
}
```

**Risk:** Silent fallback to default model when explicit backend route resolution fails. Could dispatch tasks to the wrong model without any indication.

**Fix:** Remove `|| true` and add proper error handling:
```bash
ROUTE_JSON=$(node "$SCRIPT_DIR/resolve-route.mjs" "${TASK_TYPE:-general}" "$MODE" --backend "$BACKEND" 2>&1) || {
  echo "[worker] WARNING: Model resolution for backend $BACKEND failed, using default" >&2
  ROUTE_JSON=""
}
```

---

### 4. Mode guard only checks `overnight` — `supervised` and `interactive` have no validation
**Location:** `worker.sh` lines ~94-99

```bash
if [[ "$MODE" == "overnight" ]]; then
  if [[ "$TASK_TYPE" == "code-implementation" || "$TASK_TYPE" == "architect" ]]; then
    echo "ERROR: Mode 'overnight' cannot run task-type '$TASK_TYPE'..." >&2
    exit 1
  fi
fi
```

Only `overnight` mode is validated. The `MODE` variable defaults to `supervised` if missing (`MODE="${MODE:-supervised}"`), but `supervised` and `interactive` have no guard rail checks. If a task file has a typo in `mode:` (e.g., `mode: Supervised`), the case comparison will fail silently and the wrong guard will apply.

**Risk:** Typo in task frontmatter `mode:` field bypasses all guard checks. Low probability but zero indication of the failure.

**Fix:** Add a validation step:
```bash
case "$MODE" in
  interactive|supervised|overnight) ;;
  *) echo "WARNING: Unknown mode '$MODE', defaulting to supervised" >&2; MODE="supervised" ;;
esac
```

---

### 5. Log streamer PID cleanup uses `kill` without signal spec
**Location:** `worker.sh` lines ~148-152`

```bash
if [[ -n "$STREAMER_PID" ]]; then
  kill "$STREAMER_PID" 2>/dev/null || true
  wait "$STREAMER_PID" 2>/dev/null || true
fi
```

`kill` without a signal defaults to SIGTERM. This is correct for graceful shutdown. However, if the streamer process is in an uninterruptible state (e.g., blocked on a write), `wait` will hang indefinitely after SIGTERM.

**Fix:** Add a SIGKILL fallback:
```bash
kill "$STREAMER_PID" 2>/dev/null || true
wait "$STREAMER_PID" 2>/dev/null || true
# Force-kill if still running after grace period
kill -0 "$STREAMER_PID" 2>/dev/null && kill -9 "$STREAMER_PID" 2>/dev/null || true
```

---

### 6. `task-scanner.mjs --update` calls are not error-checked after backend exit
**Location:** `worker.sh` lines ~157-166

```bash
if [[ "$EXIT_CODE" -eq 0 ]]; then
  node "$SCRIPT_DIR/task-scanner.mjs" --update "$TASK_SLUG" status completed
  node "$SCRIPT_DIR/task-scanner.mjs" --update "$TASK_SLUG" completed-at "$COMPLETED_AT"
  log_event ...
else
  node "$SCRIPT_DIR/task-scanner.mjs" --update "$TASK_SLUG" status failed
  log_event ...
fi
```

The status update calls are not error-checked. If `task-scanner.mjs --update` fails (e.g., file permission error, disk full), the task status will not be updated but `worker.sh` will exit 0 (or with `$EXIT_CODE`) with no indication that the status update failed.

**Risk:** Task board shows stale status. For a monitoring system, this is a significant reliability gap.

**Fix:** Check exit codes on scanner calls or log a warning on failure:
```bash
node "$SCRIPT_DIR/task-scanner.mjs" --update "$TASK_SLUG" status completed || \
  log_event "status_update_failed" ",\"detail\":\"task-scanner returned non-zero\""
```

---

## Minor Issues

### 7. `WORKER_PROMPT` heredoc-style construction doesn't escape `${TASK_BODY}`
**Location:** `worker.sh` lines ~104-116`

The `WORKER_PROMPT` variable is constructed with inline expansion. If `TASK_BODY` contains backticks or `$()` sequences, they could be executed. In practice, markdown task bodies rarely contain this, but it's a latent risk for tasks with code snippets.

**Recommendation:** Use `printf '%s' "$TASK_BODY"` or sanitize at `extract_body()` time if prompt injection from task content is a concern.

---

### 8. Worker prompt hardcodes task log path format
**Location:** `worker.sh` line ~107

```bash
- If blocked, write a note to docs/tasks/logs/${TASK_SLUG}-blockers.md explaining the issue.
- When finished, create docs/tasks/logs/${TASK_SLUG}-report.md summarizing...
```

The prompt instructs workers to write to `docs/tasks/logs/` — a relative path that assumes the worker runs from the repo root. For backends that change directory (e.g., if a worktree path is set), this path may resolve incorrectly.

**Evidence:** `SHERPA_WORKTREE` is passed to the `claude` backend via `--worktree`, which may change the working directory. If the worker CWD differs, the relative path in the prompt is wrong.

**Recommendation:** Use absolute paths in the worker prompt: `${REPO_ROOT}/docs/tasks/logs/${TASK_SLUG}-blockers.md`.

---

## What Passes

- ✅ `set -euo pipefail` — strict error handling throughout
- ✅ NDJSON event logging at all key lifecycle points (started, delegating, status_changed)
- ✅ `SHERPA_*` env exports are comprehensive and well-named
- ✅ Backend script resolution checks both `.mjs` and `.sh` extensions correctly
- ✅ Task not found → clean exit 1 with error message
- ✅ Backend not found → logs event + marks task failed + exits 1 (not 2)
- ✅ Mode guard for overnight is correctly placed before backend delegation
- ✅ `mkdir -p` on logs directory before writing — correct defensive practice
- ✅ Status changes from `pending` → `dispatched` before delegation (prevents double-dispatch)

---

## Summary Table

| # | Issue | Severity | Line |
|---|-------|----------|------|
| 1 | Duration calculation broken on Linux (`date -j` is BSD) | **Significant** | ~158 |
| 3 | `|| true` silences route resolution error in backend branch | **Significant** | ~77 |
| 5 | Log streamer kill may hang — no SIGKILL fallback | **Moderate** | ~149 |
| 6 | Status update calls not error-checked | **Moderate** | ~157 |
| 4 | Mode validation doesn't catch typos in `mode:` field | **Minor** | ~94 |
| 2 | Multiple Node.js spawns for field extraction | **Minor** (perf) | ~37 |
| 7 | Worker prompt heredoc expansion risk with backticks | **Minor** | ~107 |
| 8 | Relative path in worker prompt may break in worktree context | **Minor** | ~107 |

---

## Verdict

**NEEDS WORK.** Two significant correctness bugs (Linux date parsing, silent route resolution error), and two moderate reliability issues (log streamer hang, unverified status updates). The script is structurally sound — the core dispatch pattern, event logging, and mode guard are well-implemented. Fixes are straightforward and low-risk.
