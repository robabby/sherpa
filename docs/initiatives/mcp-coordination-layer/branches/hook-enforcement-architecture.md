---
status: seed
source-iteration: 2
spawned-from: mcp-coordination-layer
created: 2026-03-12
priority: high
---

# Hook Enforcement Architecture

## Context

Iteration 2 discovered the three-layer architecture: MCP server (state) + Claude Code hooks (enforcement) + CLAUDE.md (conventions). The hook layer is critical — it makes authority enforcement deterministic rather than LLM-dependent. PreToolUse HTTP hooks can check authority on every Edit/Write and return allow/deny decisions. But the integration details are unexplored: configuration bootstrapping, latency budget, failure modes, agent identity passing.

## Question

How should Sherpa configure, deploy, and operate Claude Code HTTP hooks as the enforcement layer for MCP coordination? What's the protocol between hooks and the MCP server, and what happens when things fail?

## Suggested Vectors

1. **Hook configuration format** — What JSON goes in `.claude/settings.json` or project-level hook config? How does `sherpa init` generate it? Can hooks be project-scoped (not user-global)?
2. **PreToolUse authority check protocol** — What payload does the hook POST to the MCP server? What does the response look like? How is agent identity passed? What's the JSON schema for `permissionDecision`?
3. **Latency budget** — The hook fires synchronously on every Edit/Write. What's the acceptable latency? SQLite authority check is 3-7μs but HTTP roundtrip adds overhead. Localhost HTTP vs Unix socket?
4. **Fail-open vs fail-closed policy** — If the MCP server is unreachable, should hooks allow edits (degrade gracefully, log) or block all edits (fail safe)? Different policies for different risk levels?
5. **SessionStart bootstrap hook** — How does the SessionStart command hook read the cached dashboard? What's the file format for `.sherpa/state/dashboard.json`? How does the MCP server regenerate it?

## Links

- [Claude Code Hooks Reference](https://code.claude.com/docs/en/hooks) — 18 events, exit code semantics
- [Claude Code Hooks Guide](https://code.claude.com/docs/en/hooks-guide) — HTTP hooks, PreToolUse patterns
- [Claude Code Hooks Medium](https://algoinsights.medium.com/claude-code-just-got-http-hooks-heres-why-that-changes-everything-6938ffaae1f6) — HTTP hook implementation
