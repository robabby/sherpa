---
status: seed
source-iteration: 1
spawned-from: doi-model-for-agents
created: 2026-03-12
priority: high
---

# DOI Prototype: MCP Tool Implementation

## Context

Iteration 1 established the complete DOI formula, performance budget (<200ms warm), MCP interface design, and identified Aider's repo-map as a proven baseline. The formula has five signals (PageRank, graph distance, co-change, scent, interaction) and three LOD tiers. The performance budget is achievable: import graph <500ms, PageRank <100ms, warm queries <200ms total. Tools exist (rev-dep, fast-pagerank, tree-sitter).

## Question

Can we build a working DOI-based context selector as an MCP tool and validate it against real agent sessions? What's the minimum viable implementation that demonstrates measurable improvement over the status quo (no DOI)?

## Suggested Vectors

1. **Minimum viable DOI implementation** — Start with just PageRank + graph distance (the two signals Aider already proves work). Build the MCP tool, test on this repo. Add signals incrementally.
2. **Aider repo-map as reference implementation** — Study `aider/repomap.py` in detail. What can be lifted directly? What must change for the MCP tool pattern? How does binary-search token budget fitting work?
3. **Evaluation methodology** — How do you measure "better context"? Instrument agent sessions to capture which files were actually needed. Compare DOI predictions to ground truth. Metrics: precision@k, recall@k, token efficiency ratio.
4. **Agent event capture** — How to instrument Claude Code (or an MCP-based agent) to emit FILE_READ, FILE_WRITE, SEARCH_HIT, TOOL_INVOKE events that feed the behavioral signal.

## Links

- [Aider repo-map docs](https://aider.chat/docs/repomap.html)
- [DeepWiki - Aider Repository Mapping](https://deepwiki.com/Aider-AI/aider/4.1-repository-mapping)
- [rev-dep](https://github.com/jayu/rev-dep)
- [fast-pagerank](https://github.com/asajadi/fast-pagerank)
- [MCP specification](https://modelcontextprotocol.io/docs/getting-started/intro)
