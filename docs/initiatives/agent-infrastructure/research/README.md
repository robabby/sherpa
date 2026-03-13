# Agent Infrastructure Research

## Summary

Phase 1 research for the agent-infrastructure initiative. Covers model routing, inter-agent communication, execution monitoring, and local OSS model viability.

## Iterations

| Iteration | Date | Vectors | Key Insight |
|-----------|------|---------|-------------|
| [1](iteration-1.md) | 2026-03-06 | Model routing, inter-agent communication, execution monitoring, local models | Most infrastructure already exists — the proposal overestimates what needs building |

## Open Questions

1. **Tool calling reliability on local models via Ollama's Anthropic API** — Claude Code requires robust tool calling. How stable is this on Qwen2.5-Coder-7B and Qwen3-Coder-30B? Validation gate for Phase 2.

2. **Session manifest schema design** — What fields, where to store (committed vs. local), how the `SessionEnd` hook parses JSONL. Concrete engineering question. — **Resolved**: schema implemented, hook deployed, Studio rendering live

3. **Claude Code Agent Teams vs. custom coordination** — Experimental but maturing. Should Phase 3 build on it? What are current limitations in practice?

4. **Quality gates for local model output** — Automated checks (schema validation, lint, tests) vs. human review. Determines whether low-tier routing can be automated.

5. **Effort level as routing lever** — Does `CLAUDE_CODE_EFFORT_LEVEL=low` on Sonnet provide a cheaper alternative to local models for medium-tier tasks? — **Deferred**: can be tested empirically when needed

## Cross-References

- **Parent proposal:** [../proposal.md](../proposal.md)
- **Dependencies:** [agentic-workforce](../../agentic-workforce/proposal.md), [studio-state-machine](../../studio-state-machine/proposal.md)
- **Reference material:** [Agentic Design Patterns](../../../resources/agentic-design-patterns/)
- **Related research:** [primitives-as-platform](../../../research/primitives-as-platform/)
