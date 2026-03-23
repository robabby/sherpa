---
decision: "Hold on per-agent configuration pattern — use assembled governance file instead"
date: 2026-03-19
skill: /radar
alternatives-rejected:
  - "Assembled governance file with prompt injection — in Adopt ring; portable by design"
confidence: high
kill-criteria: "Reassess if a production framework ships first-class portable governance that outperforms prompt injection"
---

No production multi-agent framework (CrewAI, AutoGen, LangGraph, Swarm, Google ADK) has solved portable governance. All use per-agent config where behavioral constraints don't propagate across handoffs. This is the problem Sherpa is solving — the assembled governance file approach is ahead of the field.
