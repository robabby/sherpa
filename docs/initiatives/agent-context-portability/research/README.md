# Agent Context Portability — Research

## Summary

Iteration 1 surveyed four domains: the AGENTS.md standard landscape, multi-agent governance patterns in production frameworks and academia, context injection strategies for agent task prompts, and convention sync/drift detection patterns.

Key finding: AGENTS.md is a real standard (60K+ projects, Linux Foundation governance), prompt injection is the universal governance mechanism (no framework has a better alternative), full injection at ~5,500 tokens is safe, and regenerate-and-diff with embedded hashing is the correct drift detection pattern.

## Open Questions

1. **Empirical convention adherence** — Which governance rules does Luna follow well vs. poorly without injection? Determines minimum viable governance set.
2. **Judge-as-governance-enforcer** — Should the Judge structurally validate governance compliance (frontmatter, directories, provenance) rather than relying on Worker self-compliance?
3. **Cross-model governance drift** — Same governance text → same behavioral outcomes across models?
4. **MCP governance server** — Should `studio-mcp` expose governance as MCP Resources?
5. **AAIF convergence** — Will scoped/conditional rules get standardized? Watch timeline.

## Iterations

| # | Date | Focus | Vectors |
|---|------|-------|---------|
| 1 | 2026-03-18 | Landscape survey: standards, frameworks, injection, sync | 4 |
