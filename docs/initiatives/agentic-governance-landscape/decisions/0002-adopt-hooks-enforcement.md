---
decision: "Adopt Claude Code hooks as primary enforcement layer — conventions without enforcement is aspiration"
date: 2026-03-18
skill: /radar
alternatives-rejected:
  - "Convention-only governance — refuted by stress test, <30% instruction adherence in complex scenarios"
  - "Build custom runtime guardrails — crowded space ($1.5B+ funded), integrate instead"
confidence: high
kill-criteria: "Reassess if Anthropic deprecates hooks in favor of a different enforcement mechanism"
---

# Adopt: Claude Code Hooks for Governance Enforcement

Hooks (PreToolUse/PostToolUse) provide deterministic enforcement at the action boundary. Conventions define intent; hooks enforce it. The stress test found Sherpa has zero hooks configured despite claiming governance capabilities. This is the highest-priority gap.

Start with: shared artifact protection, authority checks for dispatched agents, dangerous operation guards (force push, file deletion outside worktree).
