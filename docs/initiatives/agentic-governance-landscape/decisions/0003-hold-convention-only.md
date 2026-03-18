---
decision: "Hold on convention-only governance — must complement with hooks, permissions, and audit"
date: 2026-03-18
skill: /radar
alternatives-rejected:
  - "Continue with conventions only — refuted by empirical evidence on LLM instruction-following reliability"
confidence: high
kill-criteria: "Reassess if LLM instruction-following reliability exceeds 95% in complex agentic scenarios on standard benchmarks"
---

# Hold: Convention-Only Governance

The stress test documented: <30% perfect instruction adherence in multi-constraint agentic scenarios (AgentIF benchmark), linear compliance decay with instruction count, context degradation past 32k tokens, and all 12 tested prompt-based defenses bypassed under adversarial conditions. CLAUDE.md rule violations are documented across multiple Claude Code GitHub issues.

Conventions remain the policy layer — the most readable, maintainable, and human-friendly governance surface. But they are intent specification, not enforcement. The minimum viable governance stack: conventions (intent) + hooks (enforcement) + permissions (access control) + git history (audit).
