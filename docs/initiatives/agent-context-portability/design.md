---
designed: 2026-03-19
type: architecture
components-new: 3
components-modified: 2
files-planned: 7
---

# Agent Context Portability — Architecture Design

**Shape:** No shape.md — designed from proposal, plan, research iteration 1, and radar.

**Appetite:** 1 session (4 tasks). Skills translation deferred to follow-on initiative.

## Overview

Make Sherpa's governance layer portable across all agent backends. Three shell scripts produce portable governance artifacts; worker.sh injects them into task prompts.

**Data flow:**

```
.claude/rules/*.md (6 portable source rules)
       │
       ▼  generate-governance-context.sh
docs/agents/context/sherpa-governance.md (assembled, with SHA256 header)
       │
       ▼  worker.sh (reads file if backend ≠ claude)
SHERPA_TASK_PROMPT = governance block + task body
       │
       ▼  backend module (openclaw.mjs, claude.sh, etc.)
Agent receives: governance at prompt start, task at prompt end
```

```
CLAUDE.md (root)
       │
       ▼  sync-agents-md.sh
AGENTS.md → CLAUDE.md (symlink, committed to git)
       │
       ▼  git pull (VPS 15-min cron)
Luna and future agents read AGENTS.md for directory context
```

## Architecture

### 1. Governance Context Generator

**Script:** `scripts/generate-governance-context.sh`
**Output:** `docs/agents/context/sherpa-governance.md`

The generator assembles 6 backend-portable rules into a single file. The plan already has a working generator script. The design adds two features from the radar (Adopt: regenerate-and-diff with embedded hash):

**Feature A: SHA256 source hash in generated header**

The generated file header includes a composite hash of all source files, enabling lightweight staleness checks without running the full generator:

```markdown
# Sherpa Governance Context

> **Auto-generated** from `.claude/rules/` source files.
> Do not edit directly — run `scripts/generate-governance-context.sh` to regenerate.
> Source hash: sha256:a1b2c3d4e5f6...
> Generated: 2026-03-19T14:30:00Z

---
```

Hash computation: SHA256 of the concatenated content of all 6 source files, in declared order. Include file paths in the input so renames trigger regeneration:

```bash
SOURCE_HASH=$(for rule in "${RULES[@]}"; do
  echo "FILE:$rule"
  cat "$RULES_DIR/$rule"
done | shasum -a 256 | cut -d' ' -f1)
```

**Feature B: `--check` flag for CI/pre-commit validation**

```bash
./scripts/generate-governance-context.sh --check
```

When `--check` is passed:
1. Generate to a temp file
2. Diff against committed file
3. Exit 0 if identical, exit 1 if stale (prints diff to stderr)
4. Clean up temp file

This follows the Kubernetes `verify-codegen.sh` pattern and GraphQL Codegen `--check` convention.

**Rules included (order is foundational-first):**

| # | File | Tokens (approx) | Why included |
|---|------|-----------------|--------------|
| 1 | `behavioral-engineering.md` | ~500 | Foundational — how to write role definitions |
| 2 | `directoturtle-convention.md` | ~800 | Directory structure — every agent creates files |
| 3 | `initiative-convention.md` | ~1,500 | Initiative lifecycle — most complex convention |
| 4 | `effort-estimation.md` | ~350 | Sessions as unit of effort |
| 5 | `content-quality.md` | ~400 | Quality scorecard for published content |
| 6 | `provenance-convention.md` | ~950 | Frontmatter schema, review states |

**Total:** ~4,500 tokens (lower than the ~5,500 research estimate because YAML frontmatter and Claude-specific sections are stripped).

**Rules excluded:**

| File | Reason |
|------|--------|
| `claude-md-standards.md` | References `.claude/` paths, `@`-import syntax — Claude Code specific |
| `worktree-conventions.md` | References `.worktrees/` which is local — VPS agents use branches, not worktrees |
| `openclaw-luna.md` | Meta-governance about Luna — Luna doesn't need to read about herself |

### 2. Prompt Assembly (worker.sh modification)

**Modified file:** `scripts/worker.sh` (lines 101–115)

The current prompt assembly (line 104) puts constraints first, then task body. The design restructures to follow the radar's Adopt decision (governance-first positioning):

**Current structure:**
```
"You are a Sherpa agent..."  ← system framing
"CONSTRAINTS: ..."           ← operational constraints
"TASK: ..."                  ← task body
```

**New structure:**
```
GOVERNANCE CONTEXT:          ← governance rules (from sherpa-governance.md)
---
"You are a Sherpa agent..."  ← system framing
"CONSTRAINTS: ..."           ← operational constraints
"TASK: ..."                  ← task body
```

**Injection logic (pseudocode):**

```bash
# After line 102: TASK_BODY=$(extract_body)

GOVERNANCE_FILE="$REPO_ROOT/docs/agents/context/sherpa-governance.md"
GOVERNANCE_BLOCK=""
if [[ "$BACKEND" != "claude" && -f "$GOVERNANCE_FILE" ]]; then
  GOVERNANCE_BLOCK="$(cat "$GOVERNANCE_FILE")

---

"
fi

WORKER_PROMPT="${GOVERNANCE_BLOCK}You are a Sherpa agent dispatched to complete a task autonomously.
..."
```

**Why `BACKEND != "claude"`:** Claude Code auto-loads `.claude/rules/` via glob patterns in `settings.json`. Injecting the same content again would be redundant (and waste ~4,500 tokens). All other backends (openclaw, lm-studio, codex, gemini, opencode, groq, google-ai) need injection.

**SHERPA_SYSTEM_PROMPT enhancement (line 141):**

The current system prompt is minimal: `"You are executing task $TASK_SLUG for the Sherpa framework."` For backends that support system messages (OpenClaw, LM Studio, API backends), governance context belongs in the system prompt for highest priority. However, since `SHERPA_TASK_PROMPT` is what backends actually read for the user message, and not all backends use `SHERPA_SYSTEM_PROMPT`, the governance block goes in the user prompt (SHERPA_TASK_PROMPT) for universal compatibility. This matches Claude Code's own pattern — it delivers CLAUDE.md as user message content.

### 3. AGENTS.md Symlink Convention

**Script:** `scripts/sync-agents-md.sh`
**Output:** `AGENTS.md` symlink at repo root (committed to git)

The plan already has a complete symlink script. Design notes:

**Current state:**
- 1 CLAUDE.md exists (repo root)
- 2 AGENTS.md files exist under `.agents/skills/` (Vercel skill packages — not ours)
- No AGENTS.md at repo root

**Exclusions:** The `find` command must exclude:
- `.worktrees/` — worktree copies have their own CLAUDE.md
- `node_modules/` — package CLAUDE.md files
- `.agents/` — third-party agent skill packages (already have their own AGENTS.md)

**Symlink vs. copy:** Symlink is correct for Unix systems (macOS, Linux VPS). The plan notes Windows doesn't support symlinks well — irrelevant since Sherpa targets macOS (local) and Linux (VPS).

**Git tracking:** The symlink is committed. `git` tracks symlinks as a special file type. Luna gets AGENTS.md on `git pull`.

### 4. Judge Governance Hook Point (Future — Trial Ring)

**Not implemented in this initiative.** Designed as a hook point for the Judge-as-governance-enforcer spike (radar Trial ring).

**Current state (`auto-judge.sh` lines 69–116):** The judge prompt has three sections:
1. Task Definition (from task file)
2. Worker Output (from report/output file)
3. Code Changes (git diff)

**Future hook point:** A fourth section — Governance Context — injected between Task Definition and Worker Output:

```
## Governance Rules (for structural validation)

${GOVERNANCE_CONTENT}

## Evaluation Instructions

For each acceptance criterion, check both:
1. Is the criterion met? (existing)
2. Does the output comply with governance rules? (new)
   - Correct frontmatter format (provenance, initiative)
   - Correct directory structure (directoturtle)
   - Behavioral constraint compliance
```

This is a clean additive change — the existing judge prompt structure supports it. The GaaS pattern suggests the Judge should have declarative rules (JSON) not just markdown, but that's a separate design decision for the spike.

**auto-judge.sh also needs governance injection for the same reason as worker.sh** — when running with non-Claude backends (LM Studio, opencode), the judge model doesn't auto-load `.claude/rules/`. The injection pattern is identical to worker.sh.

### 5. Drift Detection (Pre-Commit Hook — Trial Ring)

**Not implemented in this initiative.** Designed as a hook point.

The `--check` flag on the generator script is the prerequisite. A pre-commit hook would be:

```bash
# .claude/settings.json or .husky/pre-commit
if git diff --cached --name-only | grep -q '^\.claude/rules/'; then
  bash scripts/generate-governance-context.sh --check || {
    echo "Governance file is stale. Run: scripts/generate-governance-context.sh"
    exit 1
  }
fi
```

This is a Trial item — implement and evaluate developer experience before adopting.

## Integration Points

| Existing code | Change | Reason |
|--------------|--------|--------|
| `scripts/worker.sh:101-115` | Insert governance injection block | Governance-first prompt positioning |
| `scripts/worker.sh:141` | No change needed | System prompt stays minimal; governance goes in user prompt |
| `scripts/auto-judge.sh` | **No change this session** | Judge governance is Trial ring — spike first |
| `docs/agents/` | Create `context/` subdirectory | Home for assembled governance file |
| `AGENTS.md` (root) | Create symlink → CLAUDE.md | Cross-tool directory context |

## File Plan

### New files (create)

| # | File | Purpose |
|---|------|---------|
| 1 | `scripts/generate-governance-context.sh` | Assembles governance rules into portable file. Supports `--check` flag. Embeds SHA256 hash. |
| 2 | `docs/agents/context/sherpa-governance.md` | Generated output. Single-file governance context for non-Claude backends. |
| 3 | `scripts/sync-agents-md.sh` | Creates AGENTS.md → CLAUDE.md symlinks. Idempotent, conflict-aware, `--dry-run` support. |
| 4 | `AGENTS.md` | Symlink → CLAUDE.md at repo root. Committed to git. |

### Modified files

| # | File | Lines | Change |
|---|------|-------|--------|
| 5 | `scripts/worker.sh` | 101–115 | Insert governance file read + prepend to WORKER_PROMPT for non-Claude backends |
| 6 | `docs/initiatives/agent-context-portability/proposal.md` | 2 | Status: approved → in-progress |
| 7 | `docs/initiatives/agent-context-portability/activity.md` | append | Log implementation completion |

### Not modified (explicit)

| File | Why not |
|------|---------|
| `scripts/auto-judge.sh` | Judge governance injection is Trial ring — spike first |
| `sherpa.config.ts` | No config changes needed — this is script-level, not framework-level |
| `packages/studio-core/` | No TypeScript changes — governance portability is a shell-script concern at this stage |
| `packages/studio-mcp/` | MCP governance resources are Trial ring — spike first |

## Decisions

### D1: Governance in user prompt, not system prompt

Governance context goes in `SHERPA_TASK_PROMPT` (user message), not `SHERPA_SYSTEM_PROMPT` (system message). Reason: not all backends use the system prompt env var. `SHERPA_TASK_PROMPT` is the universal path — every backend reads it. This matches Claude Code's own pattern (CLAUDE.md content delivered as user message). If a backend wants to split user/system, it can parse the governance block out — but that's a backend-level optimization, not a dispatcher-level concern.

### D2: Skip injection for Claude backend only

The condition is `BACKEND != "claude"`, not a whitelist of backends that need injection. Reason: Claude Code is the only backend that auto-loads governance. Every other backend (current and future) needs injection. A blacklist of one is simpler and more future-proof than a whitelist of eight.

### D3: Strip YAML frontmatter from source rules

The generator strips `---` frontmatter blocks (globs, alwaysApply, description) from source rules before concatenation. Reason: frontmatter is Claude Code-specific metadata for conditional loading — it's noise for other backends. The content itself is what matters.

### D4: Ordered concatenation, not alphabetical

Rules are concatenated in a declared order (foundational first): behavioral-engineering → directoturtle → initiative-convention → effort-estimation → content-quality → provenance. Reason: position within the governance block matters (Lost in the Middle). The most foundational rules go first where they get highest attention weight.

### D5: Generated file is committed, not .gitignored

`docs/agents/context/sherpa-governance.md` is committed to the repo. Reason: Luna (VPS) gets governance on `git pull` without running the generator. The `--check` flag catches staleness at commit time. This follows the Go convention of committing generated code.

## Open Questions

1. **Should auto-judge.sh also inject governance for non-Claude judge backends?** The same argument applies — LM Studio and opencode judges don't have governance context. But this is a smaller concern since judges evaluate output structure, not produce it. Defer to the Judge governance spike.

2. **Should the generator produce a JSON sidecar for machine-readable governance?** The radar Assess ring includes machine-readable governance schemas. For now, markdown is sufficient — agents parse markdown well. Revisit if the Judge-as-enforcer spike needs structured rules.

3. **Multi-turn governance reminder for long tasks?** Research shows 39% quality drop in multi-turn conversations, recoverable to 85% with constraint repetition. The current implementation is single-turn (worker dispatches one prompt). Multi-turn is only relevant for OpenClaw interactive sessions — defer to when those are architected.
