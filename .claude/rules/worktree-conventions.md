---
globs:
  - ".worktrees/**"
alwaysApply: true
---

# Git Worktree Conventions

## Location

All worktrees live in `.worktrees/` within the monorepo root. Never create worktrees outside the monorepo. Old standalone repos (`/Users/rob/Workbench/numina`, etc.) no longer exist — always resolve to `.worktrees/`.

## Worktree Types

| Type | Naming | Branch pattern | Example |
|------|--------|---------------|---------|
| App dev | `<app>-dev` or `<app>` | `<app>/*` or `feat/<app>-*` | `.worktrees/numina-dev/` |
| Initiative | `<initiative-slug>` | `initiative/<slug>` | `.worktrees/vedic-research/` |
| Feature | `<feature-slug>` | `feat/<slug>` | `.worktrees/great-year/` |

## Lifecycle

1. **Create:** `git worktree add .worktrees/<name> -b <branch>` from main (or use the `EnterWorktree` tool).
2. **Work:** Operate on files under the worktree's absolute path. Each worktree has the full monorepo tree on its own branch.
3. **Sync:** Pull from main periodically if long-lived. Short-lived worktrees (< 1 day) usually don't need it.
4. **Merge:** PR from worktree branch into main. For initiatives, the PR contains proposals (new files only — no shared artifact edits).
5. **Cleanup:** `git worktree remove .worktrees/<name>` after branch is merged. Delete the remote branch too.

## Initiative Worktrees

When working under the initiative system (`docs/initiatives/`):

- The worktree name should match the initiative slug.
- Create an `activity.md` in `docs/initiatives/<slug>/` (on the worktree branch) that references the worktree path.
- Never edit shared artifacts (roadmap, guidelines, CLAUDE.md) directly from a worktree. Write proposals to `docs/initiatives/<slug>/` instead.

## Conventions

- **Verify before creating:** `git worktree list` to check existing worktrees.
- **One concern per worktree.** Don't mix app dev with initiative research in the same worktree.
- **Branch from main** unless you specifically need another base.
- **Prefer short-lived worktrees** for initiatives. Long-lived worktrees are for ongoing app dev.
