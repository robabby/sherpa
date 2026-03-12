---
status: launched
source-iteration: 1
spawned-from: mmo-patterns-for-agents
created: 2026-03-11
priority: high
sub-initiative: sub-initiatives/doi-model-for-agents
---

# DOI Model for Agent Context Scoping

## Context

Eclipse Mylyn (2005) proved that a Degree of Interest model works for filtering IDE views based on task context, with measured 15% productivity improvement. The formula `DOI(e) = A*(selections) + B*(edits) - C*(decay)` weights code elements by interaction history. For multi-agent systems, each agent needs its own DOI model seeded by task definition rather than interaction history. Combined with three LOD tiers (full content, signatures, file paths), this could dramatically reduce context window waste.

## Question

What does a concrete DOI implementation look like for agent context scoping? What are the right input signals (task description, dependency graph, git co-change frequency, file type), coefficients, decay function, and LOD thresholds? Can we prototype this against real agent sessions and measure improvement?

## Suggested Vectors

1. **Mylyn's implementation details** — Deep dive into Mylyn's actual code. How does it compute relevance? How does the decay work in practice? What were the pitfalls? Interview/paper mining for lessons from 20 years of production use.
2. **Dependency graph as distance metric** — Import graphs, call graphs, type reference graphs. Which graph metric best predicts "this file is relevant to this task"? Compare Euclidean distance (MMO aura) to graph distance (import hops) to semantic distance (embedding similarity).
3. **Git co-change frequency** — Files that frequently change together (co-change coupling) are likely relevant together. Can git log analysis predict agent context needs? Prior art in mining software repositories (MSR) literature.
4. **Prototype design** — What would a minimal DOI-based context selector look like as an MCP tool? Input: task description + focus files. Output: ranked file list with LOD assignments. Performance target: < 1 second for a 10,000-file repo.

## Links

- [Kersten & Murphy, FSE 2006](https://dl.acm.org/doi/10.1145/1181775.1181777)
- [Mylar: DOI Model for IDEs (AOSD 2005)](https://dl.acm.org/doi/10.1145/1052898.1052912)
- [Furnas - Generalized Fisheye Views (CHI 1986)](https://dl.acm.org/doi/10.1145/22627.22342)
- [Anthropic - Context Engineering for Agents](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)
- [Boulanger Thesis - Interest Management](https://www.cs.mcgill.ca/~jboula2/thesis.pdf)
- [Benford & Fahlen - Aura/Focus/Nimbus](https://www.lri.fr/~mbl/ENS/CSCW/2013/papers/Benford_CSCW1993.pdf)
