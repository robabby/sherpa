---
name: plan-tasks
description: Use when an approved initiative needs to be broken into dispatchable task files. Takes a proposal or plan and generates structured task files in docs/tasks/ for workers to execute.
---

# Plan → Tasks

Break an approved initiative into dispatchable task files for the Planner/Worker/Judge pipeline.

## When to Use

- An initiative has been approved and needs execution
- You want to queue work for overnight autonomous execution
- A plan exists and needs to become concrete task files

## The Protocol

### Step 1: Read the Source

Read the approved proposal or plan. Identify discrete work units that:
- Can be completed in a single session
- Have clear acceptance criteria
- Can be executed independently (in an isolated worktree for claude tasks)

### Step 2: Choose Backend per Task

| Backend | Use When | Worker Script |
|---------|----------|---------------|
| `claude` | Multi-file code changes, complex implementation, needs filesystem access | `scripts/claude-worker.sh <slug>` |
| `lm-studio` | Content generation, research synthesis, structured extraction, single-output tasks | `scripts/lm-worker.mjs <slug>` |

**Model selection for lm-studio tasks:**
- Qwen 3.5 9B — best all-rounder (92% eval pass rate), voice-compliant
- Devstral Small 2 — code generation specialist (100% code eval pass rate)

**Model selection for claude tasks:**
- claude-sonnet-4-6 — standard implementation (medium tier)
- claude-opus-4-6 — complex architecture, research (high tier, costs more)

### Step 3: Set Budgets

| Task Type | Backend | Budget |
|-----------|---------|--------|
| Research synthesis | lm-studio | $0 (local) |
| Content generation | lm-studio | $0 (local) |
| Simple code task | claude | $1.00-2.00 |
| Complex code task | claude | $3.00-5.00 |

### Step 4: Write Task Files

Create `docs/tasks/<slug>.md` with full frontmatter and body.

**Critical rule:** Workers have ZERO memory. The task file IS their entire context. Include:
- Exact file paths to read for context
- Exact file paths to create or modify
- Code patterns to follow (reference existing files as examples)
- What NOT to do

### Step 5: Report

After creating task files, tell the human:
- How many tasks created, by backend
- Total estimated API budget (claude tasks only)
- Suggested dispatch order
- Which tasks can run in parallel

## Dispatch

After creating tasks, Claude dispatches them:

**For claude-backend tasks:**
```bash
# Run in background — Claude uses run_in_background: true
./scripts/claude-worker.sh <task-slug>
```

**For lm-studio-backend tasks:**
```bash
# Run in background — Claude uses run_in_background: true
node scripts/lm-worker.mjs <task-slug>
```

## Checking Results

```bash
# See all task statuses
node scripts/task-scanner.mjs

# See completed tasks
node scripts/task-scanner.mjs --status completed

# Read worker output
cat docs/tasks/logs/<slug>-output.md    # lm-studio output
cat docs/tasks/logs/<slug>-report.md    # claude worker report
cat docs/tasks/logs/<slug>.log          # claude worker full log
```
