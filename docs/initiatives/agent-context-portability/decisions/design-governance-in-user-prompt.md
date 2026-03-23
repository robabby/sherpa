---
decision: "Place governance context in user prompt (SHERPA_TASK_PROMPT), not system prompt"
date: 2026-03-19
skill: /design
alternatives-rejected:
  - "System prompt injection — not all backends use SHERPA_SYSTEM_PROMPT; user prompt is the universal path"
  - "Split injection (system for governance, user for task) — adds backend-specific branching for marginal benefit"
confidence: high
kill-criteria: "Reassess when a backend demonstrates measurably better governance adherence from system prompt placement"
---

SHERPA_TASK_PROMPT is read by every backend module. SHERPA_SYSTEM_PROMPT is only used by backends that support system messages. User prompt injection is the universal path. Matches Claude Code's own pattern — CLAUDE.md content is delivered as user message content.
