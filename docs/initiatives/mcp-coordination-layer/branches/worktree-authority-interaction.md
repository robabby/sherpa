---
status: seed
source-iteration: 1
spawned-from: mcp-coordination-layer
created: 2026-03-11
priority: high
---

# Worktree × Authority Interaction

## Context

Sherpa uses git worktrees for isolated agent work (`.worktrees/<name>/`). If agents operate in separate worktrees on separate branches, they're editing different copies of the same files. This may make file-level authority unnecessary for most operations — the isolation is physical, not logical.

## Question

Does git worktree isolation make file-level authority tracking unnecessary? When is authority still needed despite worktree isolation, and what's the minimal authority model for a worktree-based workflow?

## Suggested Vectors

1. **Worktree isolation guarantees** — What does git actually isolate? Shared objects, separate working trees, separate HEAD. Can two worktrees modify the same file path without conflict until merge?
2. **Merge as conflict resolution point** — If authority is deferred to merge time (PR review), what conflict patterns emerge? How does the Judge role interact with merge conflicts?
3. **Shared artifacts across worktrees** — Files that shouldn't diverge (roadmap.md, CLAUDE.md, shared config). These need authority even with worktree isolation. What's the minimal set?
4. **MCP server awareness of worktrees** — Should the MCP server know which worktree an agent is operating in? Does this change authority scope from file-path to (worktree, file-path)?
5. **Worktree lifecycle and authority cleanup** — When a worktree is merged and removed, what happens to authority records? Auto-release on worktree deletion?

## Links

- [Git worktree docs](https://git-scm.com/docs/git-worktree)
- [Sherpa worktree conventions](../../.claude/rules/worktree-conventions.md)
- [Cursor Planner/Worker/Judge](https://mikemason.ca/writing/ai-coding-agents-jan-2026/)
