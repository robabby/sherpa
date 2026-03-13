# Task Board

Filesystem-based task queue for the Planner/Worker/Judge pipeline.

## Task File Format

Each task is a markdown file: `docs/tasks/<slug>.md`

### Frontmatter

```yaml
---
id: <slug>
status: pending | dispatched | completed | failed | reviewed
role: engineer | research-lead | technical-writer | code-reviewer | designer
priority: low | medium | high | urgent
initiative: <initiative-slug or null>
backend: claude | lm-studio
model: <model name — e.g. claude-sonnet-4-6, qwen-3.5-9b>
budget-usd: <max dollar amount for claude backend, default 1.00>
worktree: <worktree name or null, set by dispatcher>
branch: <branch name or null, set by dispatcher>
created: YYYY-MM-DDTHH:MM:SS
dispatched-at: <ISO timestamp or null>
completed-at: <ISO timestamp or null>
session-id: <session UUID or null>
judge-verdict: pending | approved | needs-changes | rejected
max-retries: <integer, default 3>
attempt: <integer, starts at 1, incremented on re-dispatch after needs-changes>
---
```

### Body Sections

```markdown
# Task Title

## Objective
What the worker must accomplish. 1-3 sentences.

## Context
Files to read, initiative context, relevant decisions. Be explicit —
workers have no memory of prior sessions.

For multi-step features, include handoff context:
- What previous tasks accomplished
- Which files were created or modified
- Decisions made that affect this task

## Acceptance Criteria
- [ ] Criterion 1
- [ ] Criterion 2

## Constraints
What NOT to do. Files NOT to touch. Patterns to follow.

## Deliverables
Artifacts the worker must produce (files, commits, etc).
```

## Backends

| Type | Use For | Description |
|------|---------|-------------|
| CLI agent | Code implementation, multi-file changes, complex reasoning | CLI-based AI agents (Claude Code, Codex, etc.) invoked with task prompt |
| API-based LLM | Content generation, research synthesis, structured extraction | Script calling an OpenAI-compatible API (local or cloud) |
| Review agent | Code review, audit tasks | Lightweight agents optimized for evaluation, not generation |

Backend configuration is organization-specific. Configure available backends in `sherpa.config.ts`.

## Lifecycle

```
Planner creates task (pending)
  → Dispatcher invokes worker as background process (dispatched)
    → Worker writes output + commits (completed | failed)
      → Judge evaluates output (reviewed)
        → Human merges PR or requests iteration
```

## Retry Lifecycle

When a Judge verdict is `needs-changes` and `attempt < max-retries`:
1. Planner increments `attempt` in task frontmatter
2. Judge's fix instructions are appended to `## Context`
3. Task status is reset to `pending` for re-dispatch
4. Worker receives original task + accumulated context from prior attempts

When `attempt >= max-retries`:
- Task escalates to human review
- Judge verdict summary includes persistent issues across all attempts
- Task is NOT re-dispatched automatically

## Naming

`<slug>.md` — e.g., `feature-auth-flow.md`, `research-framework-audit.md`
