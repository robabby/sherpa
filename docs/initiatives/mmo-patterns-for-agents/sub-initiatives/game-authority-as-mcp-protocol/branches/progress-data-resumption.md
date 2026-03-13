---
status: seed
source-iteration: 1
spawned-from: game-authority-as-mcp-protocol
created: 2026-03-12
priority: medium
---

# Progress Data and Task Resumption Protocol

## Context

Iteration 1 established that Temporal's heartbeat-with-progress pattern is the right model for preserving agent work across authority transfers. When a Worker crashes or loses authority, its last heartbeat's progress data survives for the adopting Worker. But the research was protocol-level — it didn't design the concrete schema for progress data or the workflow for how an adopting Worker actually resumes from where the previous Worker left off.

## Question

What structured data should `heartbeat_authority` carry, and how does the adopting Worker use it to resume mid-task rather than restart from scratch? What's the minimum viable progress schema? How does git branch state interact with progress data?

## Suggested Vectors

1. **Progress data schema design** — What fields? `{files_modified, last_commit_sha, completion_estimate, resume_point, worktree_path, branch_name}`. What's the max size? How to keep it minimal while enabling useful resumption?
2. **Adoption workflow** — Step-by-step: Planner detects orphan → selects adopter → adopter receives progress data → adopter checks out branch → adopter reads resume_point → adopter continues. What does each step look like as MCP tool calls?
3. **Partial branch state recovery** — The orphaned Worker may have uncommitted changes (lost), committed but unpushed changes (recoverable from worktree), or pushed changes (fully recoverable). How does the adoption workflow handle each case?
4. **Real-world task resumption patterns** — How do Temporal, Airflow, and CI/CD systems handle mid-task resumption? What's the minimum data needed to avoid full restart?

## Links

- [Temporal Heartbeat Details](https://docs.temporal.io/encyclopedia/detecting-activity-failures)
- [BullMQ Job Progress](https://docs.bullmq.io/guide/jobs/stalled)
- [Kubernetes Pod Termination](https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle/#pod-termination)
