# ai-sdk-dispatch — Research

## Summary

Iteration 1 surveyed the Vercel AI SDK landscape across 4 vectors: capabilities/providers, MCP client integration, agent patterns vs CLI agents, and runtime topology. The key finding is a **three-layer dispatch model** where the AI SDK (provider abstraction), Claude Agent SDK (autonomous coding), and MCP Server (coordination) are complementary layers, not competing options.

## Open Questions

1. **Claude Agent SDK deep dive** — API surface, MCP connectivity, context management, budget controls. Key piece for replacing `claude.sh` backend.
2. **AI SDK + Anthropic provider-level tools** — Can `@ai-sdk/anthropic` provider tools (bash, text editor, file ops) approximate Claude Code without the full Agent SDK?
3. **Cost model comparison** — Token/cost implications of API-direct vs CLI dispatch. Who manages context windows?
4. **Migration path** — Incremental adoption order: lm-studio → gemini/codex → claude?

## Cross-References

- `docs/initiatives/dispatch-center/` — Current dispatch system (integrated)
- `docs/initiatives/mcp-coordination-layer/` — MCP server coordination (in-progress)
- `docs/initiatives/distributed-agent-consistency/` — Consistency models for multi-agent
