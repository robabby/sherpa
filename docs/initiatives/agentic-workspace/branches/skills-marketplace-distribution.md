---
status: seed
source-iteration: 1
spawned-from: agentic-workspace
created: 2026-03-12
priority: high
---

# Skills Marketplace Distribution

## Context

Claude Code has a full plugin marketplace architecture (9K+ plugins, marketplace.json format). Agent Skills is an open standard with 351K+ indexed skills. Sherpa's governance skills (/rr, /integration-review, /plan-tasks) and behavioral conventions (.claude/rules/) are ready for distribution but not yet packaged. The window for establishing Sherpa's governance conventions as the standard complement to Agent Skills, AGENTS.md, and MCP is open now but narrowing.

## Question

How should Sherpa package and distribute its governance toolkit — skills, rules, agent definitions, and conventions — through the Claude Code marketplace and broader Agent Skills ecosystem? One monolithic plugin or a modular marketplace? What's the curation, security, and update model?

## Suggested Vectors

1. Claude Code marketplace architecture deep-dive — marketplace.json format, plugin lifecycle, installation mechanics, update story
2. Modular vs monolithic distribution — compare VS Code extension packs, Homebrew bundles, npm meta-packages. What granularity works for governance primitives?
3. Security model — content hashing (skills-lock.json pattern), signing, sandboxing, deny-lists. What's minimum viable trust for distributing executable conventions?
4. AGENTS.md generation — can `sherpa sync` produce AGENTS.md alongside CLAUDE.md for cross-tool compatibility? What's the mapping?
5. Competitive positioning — survey what other governance/workflow tools are publishing to skills marketplaces

## Links

- [iteration-1/vector-4-skills-conventions-distribution.md](../research/iteration-1/vector-4-skills-conventions-distribution.md) — Skills ecosystem research
- [github.com/anthropics/claude-code/issues/27113](https://github.com/anthropics/claude-code/issues/27113) — Feature request for skill dependencies
- [agentskills.io/specification](https://agentskills.io/specification) — Agent Skills standard
