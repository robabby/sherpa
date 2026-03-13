---
status: seed
source-iteration: 2
spawned-from: agentic-workspace
created: 2026-03-12
priority: medium
---

# Agent Memory Consolidation — Sleep-Time Compute for Sherpa

## Context

Iteration 2, vector 6 discovered that Letta's filesystem-only agent scored 74.0% on LoCoMo, beating Mem0's best graph-based variant (68.5%). Letta rebuilt their entire memory system toward git-backed markdown files (Context Repositories / MemFS). Codex independently converged on `memories/MEMORY.md + skills/ + rollout_summaries/`. The most actionable pattern: "sleep-time compute" — background memory consolidation between sessions that extracts key facts, consolidates into handbooks, and prunes stale memories.

Sherpa already has the raw material: activity.md logs, research iteration files, proposal states, behavioral definitions. But there's no automated consolidation between sessions. Each new session starts from scratch orientation.

## Question

How should Sherpa implement background memory consolidation between sessions? What gets extracted, what gets summarized, what gets pruned? Where does consolidated state live? How does this interact with the initiative lifecycle?

## Suggested Vectors

1. **Sleep-time compute architecture** — How do Letta MemFS and Codex implement between-session consolidation? What's the extraction pipeline? When does consolidation trigger?
2. **Initiative-aware summarization** — Sherpa's memory is structured (initiatives, research, activity). Can summarization follow initiative lifecycle phases (orient → propose → plan → execute → complete)?
3. **Staleness detection and pruning** — How do you detect stale context? Letta uses temporal knowledge graphs (validity windows). What's the right model for initiative-scoped memory?
4. **Integration with CLAUDE.md auto-memory** — Claude Code already has a memory system (`.claude/projects/<path>/memory/`). How does Sherpa consolidation interact with this? Complement or replace?

## Links

- Letta Context Repositories: https://www.letta.com/blog/context-repositories
- Letta benchmarks: https://www.letta.com/blog/benchmarking-ai-agent-memory
- Codex memory system: https://deepwiki.com/openai/codex/3.7-memory-system
- Manus context engineering: https://manus.im/blog/Context-Engineering-for-AI-Agents-Lessons-from-Building-Manus
- Memory in the Age of AI Agents (survey): https://arxiv.org/abs/2512.13564
- Zep/Graphiti temporal KG: https://arxiv.org/abs/2501.13956
