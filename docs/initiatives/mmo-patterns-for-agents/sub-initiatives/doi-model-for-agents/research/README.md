# DOI Model for Agents — Research Index

## Iteration 1 (2026-03-12)

**Theme:** Deep dive on Degree of Interest model implementation — Mylyn source code analysis, MSR co-change coupling, information foraging theory, AI tool context selection survey, and dependency graph distance metrics.

**Vectors investigated:**
1. Mylyn & Furnas DOI deep dive (exact coefficients from source code, decay mechanism, Furnas divergence)
2. MSR co-change coupling & file relevance prediction (seminal papers, ML models, production tools)
3. Information foraging theory & developer navigation (PFIS model, IFT-Mylyn connection, agent parallels)
4. AI coding tool context selection survey (10 tools compared, three paradigms, gap analysis)
5. Dependency graph as distance metric (import graphs, PageRank, hybrid metrics, performance budgets)

**Synthesis:** [iteration-1.md](iteration-1.md)

**Raw reports:** [iteration-1/](iteration-1/)

## Open Questions

1. **Can DOI weights be learned from agent session traces?** Instrument sessions, evaluate predictions retrospectively.
2. **What's the right decay function shape?** Linear (Mylyn) vs exponential (foraging theory) vs logarithmic.
3. **How should DOI interact with context compaction?** High-DOI preserved, low-DOI dropped during compaction.
4. **Multi-granularity DOI: file vs function vs line.** Function-level is more predictive but harder to compute.
5. **Cross-session DOI persistence.** Should interest maps carry across agent sessions?

## Related Initiatives

- `mmo-patterns-for-agents` — Parent initiative (interest management = context engineering)
- `mcp-coordination-layer` — The MCP server that would host the DOI tool
- `section-level-prose-sync` — Fine-grained document merge (relates to function-level DOI granularity)
