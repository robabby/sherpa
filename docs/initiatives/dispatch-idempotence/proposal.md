---
status: pending
initiative: dispatch-idempotence
created: 2026-03-16
updated: '2026-03-16'
type: process-change
risk: evolutionary
targets:
  - scripts/worker.sh
  - scripts/task-board.sh
  - scripts/dispatch-queue.sh
  - scripts/task-scanner.mjs
  - packages/studio-core/src/lifecycle.ts
dependencies: []
informs:
  - distributed-agent-consistency
  - scheduled-dispatch
spawned-from: null
personas:
  - engineer
---

## Summary

Add idempotence guards to the dispatch layer so that re-running worker.sh, dispatch-queue.sh, or task-board.sh add on an already-processed task is a safe no-op instead of a destructive overwrite. The knowledge engine and authority system already practice idempotence via content hashing and upserts — the dispatch scripts need the same discipline.

## State Snapshot

The dispatch layer is five shell/Node scripts that manage task lifecycle via YAML frontmatter in `docs/tasks/*.md`:

- **`worker.sh`** (207 lines) — unconditionally sets status to `dispatched` at line 146 and executes the backend at line 180-185 regardless of current status. Re-running a completed task re-executes the backend, overwrites `dispatched-at`, and appends duplicate NDJSON events.
- **`task-board.sh`** (139 lines) — `cmd_add` at line 41 uses `cat >` with no existence check. Re-adding a slug silently overwrites the file, resetting `status`, `created`, and `claimed-by`. The `cmd_claim` and `cmd_done` subcommands are already idempotent (sed replacements).
- **`dispatch-queue.sh`** — calls `worker.sh` for each matching task. No deduplication across runs.
- **`task-scanner.mjs`** — `updateTask()` at line 114 is field-level idempotent (writing the same value twice is safe) but has read-modify-write race conditions when two processes update different fields concurrently.
- **`lifecycle.ts`** (127 lines) — pure detection function. Returns lifecycle stage from inputs. No state transitions, no guards. This is correct by design, but means nothing enforces valid status transitions.

By contrast, the knowledge engine (`knowledge-sync.ts:122-127`) skips unchanged files via content-hash comparison, and the authority system (`authority/operations.ts`) uses fence tokens + immediate transactions. These are the patterns to follow.

## Proposed Changes

### scripts/worker.sh — Status guard before execution

Add a pre-flight status check after task resolution. If the task is already `dispatched`, `completed`, or `failed`, exit early with a clear message. Only `open`, `claimed`, and `pending` statuses proceed to backend execution.

This is the highest-value change — it prevents the most dangerous scenario (a backend like claude or codex running the same task twice, creating duplicate commits or conflicting file writes).

### scripts/task-board.sh — Existence guard on add

`cmd_add` checks whether `$TASKS_DIR/${slug}.md` already exists before writing. If it exists, print an error and exit 1. Add a `--force` flag for intentional overwrites. This prevents silent data loss of in-flight task metadata.

### scripts/dispatch-queue.sh — Skip non-pending tasks

Before calling `worker.sh` for each slug, check that the task status is still eligible for dispatch. This makes the queue script safe to run on a cron or retry loop — already-dispatched tasks are skipped.

### scripts/task-scanner.mjs — Atomic field updates

Replace the read-modify-write pattern with a lock-free atomic write: read file, modify in memory, write to `${file}.tmp`, then `rename()` to replace. This doesn't solve concurrent multi-process writes fully (that needs file locking or moving to SQLite, which is `sqlite-agentic-state`'s scope) but eliminates partial-write corruption.

### packages/studio-core/src/lifecycle.ts — Valid transition set

Export a `VALID_TRANSITIONS` map that defines which status transitions are legal (e.g., `pending → approved`, `approved → in-progress`, but not `completed → pending`). This is a data declaration only — enforcement happens in the scripts that call it. Keeps lifecycle.ts as a pure module while giving the dispatch scripts a shared source of truth for guard logic.

## Rationale

The dispatch scripts grew organically as shell glue. They assume single-execution — run once, move on. This was fine for manual dispatch but becomes a hazard with `dispatch-queue.sh` (batch runs), `scheduled-dispatch` (cron-like), and multi-agent parallelism.

The alternative is moving all task state to SQLite (the `sqlite-agentic-state` initiative). That's the right long-term direction, but it's a larger scope change. These guards are cheap, backward-compatible, and eliminate the most acute risks today. When SQLite state lands, the guards become redundant but harmless.

The knowledge engine's content-hash pattern and the authority system's fence-token pattern prove that Sherpa already knows how to do this — it just hasn't been applied to the dispatch layer yet.

## Dependencies

- **`distributed-agent-consistency`** (informed, not blocking) — that initiative addresses file-level conflict detection (ETags, version vectors). This initiative addresses task-level execution guards. They're complementary: this one prevents re-execution, that one prevents write conflicts.
- **`sqlite-agentic-state`** (informed, not blocking) — the long-term replacement for YAML frontmatter state. These guards are an interim measure that reduces risk while that foundation is built.

## Review Notes

**Trade-offs:**
- The atomic write pattern (write-to-tmp + rename) in task-scanner.mjs is not a full solution for concurrent access — two processes can still read stale state. True atomicity requires file locking or SQLite. This initiative accepts that limitation and documents it.
- The `VALID_TRANSITIONS` map in lifecycle.ts is declarative only. Enforcement is in the shell scripts, which means a new script could bypass it. This is acceptable — the convention is the constraint, not the code.

**Edge case:** A task that fails and needs re-dispatch. The status guard in worker.sh must allow `failed → dispatched` as a valid re-run path (with a `--retry` flag or by first resetting status to `open`).

**Effort:** 2 sessions
**Session breakdown:**
- Session 1: worker.sh status guard, task-board.sh existence guard, dispatch-queue.sh filtering, VALID_TRANSITIONS map in lifecycle.ts
- Session 2: task-scanner.mjs atomic writes, integration testing across all scripts, edge case handling (retry flow)
