# Agent Context Portability — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make Sherpa's governance layer (rules, conventions, CLAUDE.md) accessible to all agent backends, not just Claude Code.

**Architecture:** Three shell scripts (generator, symlinker, injector hook in worker.sh) produce portable governance artifacts. The governance context file is assembled from source rules on demand. AGENTS.md symlinks give non-Claude agents the same directory context. worker.sh injects governance into task prompts for non-Claude backends.

**Tech Stack:** Bash scripts, existing worker.sh pipeline, existing studio-cli sync command.

**Effort:** 1 session (tasks 1–4). Skills translation (proposal item 3) is deferred to a follow-on initiative.

---

### Task 1: Governance Context Generator

Build a script that assembles `docs/agents/context/sherpa-governance.md` from the source `.claude/rules/` files.

**Files:**
- Create: `scripts/generate-governance-context.sh`
- Create: `docs/agents/context/sherpa-governance.md` (generated output)

**Step 1: Write the generator script**

```bash
#!/usr/bin/env bash
# scripts/generate-governance-context.sh
# Assembles a single governance context file from .claude/rules/ source files.
# Output: docs/agents/context/sherpa-governance.md
#
# Usage: ./scripts/generate-governance-context.sh

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
RULES_DIR="$REPO_ROOT/.claude/rules"
OUTPUT_DIR="$REPO_ROOT/docs/agents/context"
OUTPUT_FILE="$OUTPUT_DIR/sherpa-governance.md"

# Rules to include (order matters — foundational first)
RULES=(
  "behavioral-engineering.md"
  "directoturtle-convention.md"
  "initiative-convention.md"
  "effort-estimation.md"
  "content-quality.md"
  "provenance-convention.md"
)

# Excluded (Claude Code-specific):
#   claude-md-standards.md — references .claude/ paths and @-import syntax
#   worktree-conventions.md — references .worktrees/ which is local-only
#   openclaw-luna.md — Claude Code-specific awareness of Luna

mkdir -p "$OUTPUT_DIR"

cat > "$OUTPUT_FILE" <<'HEADER'
# Sherpa Governance Context

> **Auto-generated** from `.claude/rules/` source files.
> Do not edit directly — run `scripts/generate-governance-context.sh` to regenerate.
>
> This file provides the essential Sherpa conventions for any agent backend.
> Claude Code loads these automatically; other agents (OpenClaw, future runtimes)
> should read this file at task start.

---

HEADER

for rule in "${RULES[@]}"; do
  rule_path="$RULES_DIR/$rule"
  if [[ ! -f "$rule_path" ]]; then
    echo "WARNING: Rule not found: $rule_path" >&2
    continue
  fi

  # Strip the YAML frontmatter (globs/alwaysApply — not relevant to agents)
  content=$(sed -n '/^---$/,/^---$/!p' "$rule_path" | sed '/^$/N;/^\n$/d;1{/^$/d}')

  echo "$content" >> "$OUTPUT_FILE"
  echo "" >> "$OUTPUT_FILE"
  echo "---" >> "$OUTPUT_FILE"
  echo "" >> "$OUTPUT_FILE"
done

echo "[generate-governance-context] Written: $OUTPUT_FILE" >&2
```

**Step 2: Run the generator and verify output**

Run: `bash scripts/generate-governance-context.sh`
Expected: File created at `docs/agents/context/sherpa-governance.md` containing all 6 rules concatenated with `---` separators, no YAML frontmatter.

Verify: `head -20 docs/agents/context/sherpa-governance.md` shows the header, then the first rule (Behavioral Engineering).

**Step 3: Commit**

```bash
git add scripts/generate-governance-context.sh docs/agents/context/sherpa-governance.md
git commit -m "feat(governance): add portable context generator

Assembles .claude/rules/ into a single sherpa-governance.md file
readable by any agent backend."
```

---

### Task 2: AGENTS.md Symlink Script

Create symlinks from `AGENTS.md → CLAUDE.md` for every `CLAUDE.md` in the repo.

**Files:**
- Create: `scripts/sync-agents-md.sh`

**Step 1: Write the symlink script**

```bash
#!/usr/bin/env bash
# scripts/sync-agents-md.sh
# Creates AGENTS.md → CLAUDE.md symlinks throughout the repo.
#
# For every CLAUDE.md, creates an AGENTS.md symlink in the same directory
# pointing to CLAUDE.md. Idempotent — skips existing correct symlinks,
# warns on conflicts.
#
# Usage: ./scripts/sync-agents-md.sh [--dry-run]

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
DRY_RUN=false

[[ "${1:-}" == "--dry-run" ]] && DRY_RUN=true

created=0
skipped=0
conflicts=0

while IFS= read -r claude_md; do
  dir=$(dirname "$claude_md")
  agents_md="$dir/AGENTS.md"

  if [[ -L "$agents_md" ]]; then
    # Already a symlink — check if it points to the right place
    target=$(readlink "$agents_md")
    if [[ "$target" == "CLAUDE.md" ]]; then
      skipped=$((skipped + 1))
      continue
    else
      echo "CONFLICT: $agents_md → $target (expected CLAUDE.md)" >&2
      conflicts=$((conflicts + 1))
      continue
    fi
  fi

  if [[ -f "$agents_md" ]]; then
    echo "CONFLICT: $agents_md exists as a regular file" >&2
    conflicts=$((conflicts + 1))
    continue
  fi

  if $DRY_RUN; then
    echo "[dry-run] Would create: $agents_md → CLAUDE.md"
  else
    ln -s CLAUDE.md "$agents_md"
    echo "  created: $agents_md → CLAUDE.md"
  fi
  created=$((created + 1))
done < <(find "$REPO_ROOT" -name "CLAUDE.md" -not -path "*/.worktrees/*" -not -path "*/node_modules/*")

echo "[sync-agents-md] created=$created skipped=$skipped conflicts=$conflicts" >&2
```

**Step 2: Run with --dry-run to verify**

Run: `bash scripts/sync-agents-md.sh --dry-run`
Expected: Shows `[dry-run] Would create: /path/to/AGENTS.md → CLAUDE.md` for the root CLAUDE.md.

**Step 3: Run for real and verify**

Run: `bash scripts/sync-agents-md.sh`
Expected: Creates `AGENTS.md` symlink in repo root. Verify: `ls -la AGENTS.md` shows `AGENTS.md -> CLAUDE.md`.

**Step 4: Add AGENTS.md to .gitignore or commit it**

The symlink should be committed so Luna (and future agents) get it on `git pull`. Verify: `git diff --cached` shows the new symlink.

**Step 5: Commit**

```bash
git add scripts/sync-agents-md.sh AGENTS.md
git commit -m "feat(governance): add AGENTS.md symlink convention

Every CLAUDE.md now has an AGENTS.md symlink so non-Claude agents
get the same directory context on checkout."
```

---

### Task 3: Task Prompt Governance Injection

Modify `worker.sh` to inject `sherpa-governance.md` into the worker prompt for non-Claude backends.

**Files:**
- Modify: `scripts/worker.sh:101-115` (the prompt assembly section)

**Step 1: Add governance injection after prompt assembly**

Insert after line 102 (`TASK_BODY=$(extract_body)`), before the `WORKER_PROMPT=` assignment:

```bash
# ── Inject governance context for non-Claude backends ─────────────────
GOVERNANCE_FILE="$REPO_ROOT/docs/agents/context/sherpa-governance.md"
GOVERNANCE_CONTEXT=""
if [[ "$BACKEND" != "claude" && -f "$GOVERNANCE_FILE" ]]; then
  GOVERNANCE_CONTEXT="

SHERPA GOVERNANCE CONTEXT:
$(cat "$GOVERNANCE_FILE")

---

"
fi
```

Then prepend `$GOVERNANCE_CONTEXT` to the worker prompt:

```bash
WORKER_PROMPT="You are a Sherpa agent dispatched to complete a task autonomously.
${GOVERNANCE_CONTEXT}
Read the task below carefully. Complete ALL acceptance criteria. Commit your work with descriptive messages. Do NOT create a PR.
..."
```

**Step 2: Verify by inspecting a dry-run**

Test: Create a dummy task with `backend: openclaw`, run `bash -x scripts/worker.sh test-task 2>&1 | head -5` to see if the governance context appears in `SHERPA_TASK_PROMPT`. (Or just read the variable after export.)

**Step 3: Commit**

```bash
git add scripts/worker.sh
git commit -m "feat(dispatch): inject governance context for non-Claude backends

worker.sh now prepends sherpa-governance.md to task prompts when
dispatching to openclaw or other non-Claude backends."
```

---

### Task 4: Initiative Housekeeping

Update the proposal status, create activity.md, and verify everything works end-to-end.

**Files:**
- Modify: `docs/initiatives/agent-context-portability/proposal.md:2` (status field)
- Create: `docs/initiatives/agent-context-portability/activity.md`

**Step 1: Update proposal status**

Change `status: pending` → `status: in-progress` in the proposal frontmatter.

**Step 2: Create activity.md**

```markdown
---
started: 2026-03-18
worktree: null
---

# Agent Context Portability — Activity

## 2026-03-18

- Proposal merged (PR #11) — first initiative authored by Luna (OpenClaw)
- Implementation started: governance context generator, AGENTS.md symlinks, worker.sh injection
- Skills translation deferred to follow-on initiative
```

**Step 3: End-to-end verification**

1. Run `bash scripts/generate-governance-context.sh` — regenerates governance file
2. Run `bash scripts/sync-agents-md.sh` — creates/verifies AGENTS.md symlinks
3. Verify `docs/agents/context/sherpa-governance.md` contains all 6 rules
4. Verify `AGENTS.md` symlink exists at repo root
5. Read `scripts/worker.sh` and confirm governance injection logic is correct

**Step 4: Commit**

```bash
git add docs/initiatives/agent-context-portability/proposal.md \
       docs/initiatives/agent-context-portability/activity.md
git commit -m "docs(initiatives): mark agent-context-portability in-progress

Add activity log, update status. Skills translation deferred."
```

---

## Out of Scope (Deferred)

**OpenClaw Skills Translation** (proposal item 3): Translating `/rr`, `/plan-tasks`, `/integration-review`, `/premortem` into OpenClaw-compatible skills requires deep understanding of each skill's protocol and Luna's runtime environment. This is multi-session work and should be a follow-on initiative (`spawned-from: agent-context-portability`).

**Studio CLI `--agents-md` flag**: The shell script covers the core need. Adding it as a subcommand to `sherpa sync` is a nice-to-have that can be done when the CLI is next touched.
