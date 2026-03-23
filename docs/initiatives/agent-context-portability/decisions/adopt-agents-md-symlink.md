---
decision: "Adopt AGENTS.md symlink convention as cross-tool governance surface"
date: 2026-03-19
skill: /radar
alternatives-rejected:
  - "AGENTS.md generator (separate content from CLAUDE.md) — unnecessary complexity until content divergence is a real problem"
  - "AGENTS.md-only (drop CLAUDE.md) — loses Claude Code's richer features: glob-scoped rules, skills, @-imports"
confidence: high
kill-criteria: "Reassess when Claude Code adds native AGENTS.md support (symlinks become redundant) or when content divergence between Claude-specific and cross-tool context exceeds 30%"
---

Symlink `AGENTS.md → CLAUDE.md` at every repository level. Community standard with 60K+ projects, AAIF/Linux Foundation stewardship, and 10+ tool support. Gracefully degrades to redundancy when Claude Code adds native support.
