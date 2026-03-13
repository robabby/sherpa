---
status: seed
source-iteration: 1
spawned-from: game-authority-as-mcp-protocol
created: 2026-03-12
priority: high
---

# Worktree Isolation vs Authority Enforcement

## Context

Both the parent initiative and the mcp-coordination-layer initiative flagged this as an open question: if agents work in isolated git worktrees (each on their own branch), does the worktree itself provide sufficient isolation that file-level authority becomes unnecessary? The authority system was designed assuming agents operate on shared state. But worktrees create per-agent copies of the filesystem. Conflicts only materialize at merge time.

## Question

Does git worktree isolation make Sherpa's authority system redundant for Worker agents, reducing its scope to merge-time coordination only? Or does the authority system provide value even with worktree isolation (preventing wasted work on conflicting tasks, enabling progress tracking, providing the state machine for handoffs)?

## Suggested Vectors

1. **What authority protects against in a worktree world** — Without authority, two Workers could work on the same files in different worktrees, discover the conflict only at merge time, and waste a full session. Authority prevents this upfront. How often does this actually happen?
2. **Authority as task coordination, not file protection** — Even with worktrees, the authority system tracks who's working on what, enables progress monitoring, provides heartbeat-based crash detection, and manages the Planner→Worker→Judge handoff. These functions survive independent of file-level locking.
3. **Merge-time authority** — Authority could be required only when pushing to main (the merge point). Workers work freely in worktrees; authority is checked when they attempt to merge. This is closer to GitHub's branch protection model.
4. **The Gas Town precedent** — Steve Yegge's Gas Town runs 20-30 agents in worktrees with advisory file reservations (Agent Mail). What's their experience with merge conflicts? Do the reservations actually prevent wasted work?

## Links

- [mcp-coordination-layer open question #1](../../mcp-coordination-layer/research/README.md)
- [Git Worktree Docs](https://git-scm.com/docs/git-worktree)
- [Gas Town (GitHub)](https://github.com/steveyegge/gastown)
- [Agent Mail File Reservations](https://github.com/Dicklesworthstone/mcp_agent_mail)
