---
decision: "Skip governance injection only for Claude backend (blacklist of one, not whitelist of eight)"
date: 2026-03-19
skill: /design
alternatives-rejected:
  - "Whitelist of backends needing injection — must be updated for every new backend; error-prone"
  - "Inject for all backends including Claude — wastes ~4,500 tokens on redundant context Claude already has"
confidence: high
kill-criteria: "Reassess if a second backend gains native governance loading (e.g., if AAIF standardizes conditional rules)"
---

Claude Code is the only backend that auto-loads `.claude/rules/`. Every other backend (current: openclaw, lm-studio, codex, gemini, opencode, groq, google-ai; future: unknown) needs injection. A blacklist of one is simpler and more future-proof than a whitelist of eight.
