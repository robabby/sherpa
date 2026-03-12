# Dependency Graphs as Distance Metrics for File Relevance

**Research iteration:** 1
**Date:** 2026-03-12
**Focus:** Which graph metric best predicts "this file is relevant to this task"? What's computable fast enough for interactive use (< 1 second on 10k files)?

---

## Key Discoveries

### 1. Import/Dependency Graph Tools: Mature, Fast, and the Right Starting Point

The JavaScript/TypeScript ecosystem has multiple production-ready dependency graph tools, with a clear performance hierarchy:

- **rev-dep** (Go-based): The fastest option. Audits a 500k+ LoC monorepo in ~500ms. Circular dependency check is 12x faster than the fastest alternative. Natively resolves TypeScript aliases, package.json exports/imports maps, and traces dependencies across package boundaries. Benchmarked with hyperfine (8 runs, 4 warm-up). ([GitHub](https://github.com/jayu/rev-dep))

- **skott**: 7.5x faster than madge for full graph construction with metadata. Written in JS. Exposes API primitives on top of the generated graph for graph inspection (cycles, unused nodes, dead code), graph diffing, and incremental task orchestration. ([DEV Community](https://dev.to/antoinecoulon/introducing-skott-the-new-madge-1bfl))

- **dependency-cruiser**: The most feature-rich. Supports custom rules, CI integration, multiple output formats. Slower than rev-dep/skott on large codebases but has the richest configuration for edge-type filtering. Has a TypeScript-specific optimization flag that speeds analysis by ignoring type-only dependencies that don't survive compilation. ([GitHub](https://github.com/sverweij/dependency-cruiser))

- **madge**: The oldest and most widely known. Supports CommonJS, AMD, ES6. Performance is adequate for medium projects but gets unwieldy on large ones. ([GitHub](https://github.com/pahen/madge))

**What they miss:** Dynamic imports (`import()` expressions), re-exports that create phantom dependencies, runtime-only dependencies (DI containers, event emitters), barrel file fan-out (index.ts re-exporting everything). dependency-cruiser has some dynamic import support; most others treat them as opaque.

**Performance verdict:** Import graph construction is well within the < 1 second budget for 10k files. rev-dep handles 500k+ LoC in 500ms. This is the cheapest, most reliable distance signal.

### 2. Call Graphs: Expensive and Imprecise for JavaScript/TypeScript

Static call graph construction for JavaScript/TypeScript is a hard problem due to dynamic dispatch, callbacks, higher-order functions, and prototype chains.

**Comparative study (2024):** Five tools (WALA, Closure Compiler, ACG, npm callgraph, TAJS) were evaluated on SunSpider benchmarks:
- **ACG**: 99% precision, 91% recall (best single tool)
- **TAJS**: 98% precision, 71% recall
- **ACG + TAJS combined**: 99% precision, 99% recall (near perfect)
- **WALA/npm callgraph**: Practically unusable on millions of lines of code
- Source: [Static JavaScript Call Graphs: A Comparative Study (arXiv)](https://arxiv.org/html/2405.07206v1)

**Jelly** (Aarhus University): The most sophisticated JS/TS call graph analyzer. Uses flow-insensitive control-flow and points-to analysis with access paths. Handles large projects but "analyzing with all dependencies can take a long time" -- provides `--max-indirections` and `--timeout` for early termination with partial results. ([GitHub](https://github.com/cs-au-dk/jelly))

**PyCG** (Python): Generates call graphs for programs up to 3.5k LoC in under 1 second. 2x slower than pyan but more precise. ([arXiv](https://arxiv.org/abs/2103.00587))

**Verdict for DOI model:** Call graphs are too expensive for interactive use on a full codebase. However, they're useful as a *precomputed enrichment* of the import graph -- if you've already narrowed to 50-100 files via import distance, a call graph within that subset is feasible and adds signal. The import graph should be the primary distance metric; call graph distance is a secondary refinement.

### 3. Type Reference Graphs: Useful but Subsumable

Files connected by shared type definitions form an implicit coupling graph. In TypeScript, this shows up as:
- Files importing the same interface/type
- Files extending the same base class
- Files using the same enum or union type

**Practical tools:** `cats` (Cohesion/coupling Analysis for TypeScript) and `codemetrix` both analyze type-level coupling. ([GitHub - cats](https://github.com/ThomWright/cats), [GitHub - codemetrix](https://github.com/mikaelvesavuori/codemetrix))

**Key insight:** Type references are a *subset* of import edges. Every type reference is also an import. The added signal is **fan-in**: if 20 files import the same `UserProfile` type, that type definition is a high-centrality node. Changes to it propagate widely. This is better captured by PageRank/centrality on the import graph than by a separate type reference graph.

**Verdict:** Don't build a separate type reference graph. Instead, weight import edges by type (type-only imports vs. value imports) and use centrality metrics on the unified import graph. dependency-cruiser's `tsPreCompilationDeps` flag already distinguishes these.

### 4. Directory Distance: Surprisingly Weak Alone, Useful as Tiebreaker

No strong empirical study was found directly comparing directory distance to dependency distance for predicting file relevance. However, the software coupling literature provides indirect evidence:

- **Fregnan et al. (survey):** "A majority of co-evolving classes are not structurally linked" -- meaning files that change together often live in different directories and have no direct imports. Directory proximity misses these hidden dependencies. ([Survey on Software Coupling Relations](https://fpalomba.github.io/pdf/Journals/J16.pdf))

- **Poshyvanyk et al.:** Semantic coupling (textual similarity) produced better recall for predicting change impact than structural coupling metrics. Combining conceptual and evolutionary coupling outperformed either alone. ([Springer](https://link.springer.com/article/10.1007/s10664-012-9233-9))

- **Co-location heuristic:** "Developers should put frequently co-changed methods in the same file or packages" -- this is a *design recommendation*, not an observation about existing code. In well-structured code, directory proximity correlates with dependency proximity. In messy code, it doesn't. ([NSF](https://par.nsf.gov/servlets/purl/10199009))

**Verdict:** Directory distance is a fast tiebreaker (zero computation cost) when other signals are tied, but it should not be a primary distance metric. A file in `src/auth/helpers.ts` may be more relevant to a task than `src/auth/constants.ts` despite being in the same directory -- import graph distance captures this; directory distance does not.

### 5. Semantic Distance: High Quality but Too Expensive for Primary Use

**State of the art for code embeddings (2025-2026):**
- **Voyage-3-large / VoyageCode3**: Top performer across benchmarks. Supports multiple retrieval scenarios. 2048/1024/512/256 dimensions. ([Modal comparison](https://modal.com/blog/6-best-code-embedding-models-compared))
- **Nomic Embed Code**: 81.7% on Python, 80.5% on Java in code retrieval. 7B parameters. ([Unite.AI guide](https://www.unite.ai/code-embedding-a-comprehensive-guide/))
- **CodeRankEmbed**: State-of-the-art bi-encoder specifically for code retrieval. 137M parameters, 8192 tokens. ([Modal](https://modal.com/blog/6-best-code-embedding-models-compared))
- **OpenAI text-embedding-3-large**: Strong general-purpose. 3072 dimensions, 8191 tokens. ([Modal](https://modal.com/blog/6-best-code-embedding-models-compared))

**How Cursor uses embeddings:** Files are chunked into semantic units (functions, classes), embedded via API, stored in a vector database (Turbopuffer). Queries are embedded and matched via cosine similarity. Merkle trees detect which files changed for incremental re-indexing. ([TDS - How Cursor Indexes](https://towardsdatascience.com/how-cursor-actually-indexes-your-codebase/), [Engineer's Codex](https://read.engineerscodex.com/p/how-cursor-indexes-codebases-fast))

**Performance concern:** Embedding 10k files requires API calls (latency) or local model inference (GPU). Not feasible for cold-start < 1 second. But *precomputed* embeddings with incremental updates are viable -- Cursor proves this at scale.

**Verdict:** Semantic distance is a powerful *supplementary* signal, especially for TaskRelevance (matching task description to file content). It should be precomputed and cached, not computed on-the-fly. It captures relationships that dependency graphs miss (files with similar logic but no direct imports). But it should not replace structural distance -- the two are complementary.

### 6. Hybrid Metrics: The Clear Winner

**Structural-Semantic Code Graphs (SSCGs):** The most promising hybrid approach. A heterogeneous, directed, typed graph with both structural edges (import, contain, inherit, invoke) and semantic edges (embedding similarity above threshold, e.g., cosine > 0.8). Used in GraphCodeAgent for repo-level code generation. ([arXiv - GraphCodeAgent](https://arxiv.org/html/2504.10046v2), [EmergentMind - SSCG](https://www.emergentmind.com/topics/structural-semantic-code-graph-sscg))

**GRACE framework results:** Hybrid graph retrieval using both semantic (embedding similarity) and structural (GNN-based) similarity, combined with Maximal Marginal Relevance reranking, achieved +8.19% Exact Match and +7.51% Edit Similarity over best prior graph-RAG baselines. ([EmergentMind](https://www.emergentmind.com/topics/structural-semantic-code-graph-sscg))

**Code-Craft (HCGS):** Hierarchical Code Graph Summarization uses LSP to build a code graph, then generates bottom-up summaries. Achieved 82% relative improvement in top-1 retrieval precision for large codebases (libsignal: 5,128 functions). Evaluated on 7,531 functions across 5 codebases. ([arXiv](https://arxiv.org/html/2504.08975v1))

**Augment Code's Context Engine:** Production system processing 400,000+ files through semantic dependency analysis. Builds a "semantic dependency graph" that understands call graphs, indirect dependencies (event systems, queues, pub/sub), and cross-repo relationships. Claims 40% reduction in AI hallucinations. ([Augment Code](https://www.augmentcode.com/context-engine))

**Software coupling research consensus:** Combining structural and semantic coupling outperforms either alone for change impact prediction. Poshyvanyk et al. found that combining conceptual and evolutionary techniques provided statistically significant improvements over either individually. ([Springer](https://link.springer.com/article/10.1007/s10664-012-9233-9))

**Verdict:** The DOI model should combine multiple signals with learned or tuned weights. The literature consistently shows hybrid > single-signal.

### 7. Computational Performance: Import Graphs Scale; Everything Else Needs Caching

**Import graph construction:**
- rev-dep: 500ms for 500k+ LoC (Go-based, parallel processing)
- skott: ~3.5s for same workload (JS-based, 7.5x slower than target)
- dependency-cruiser: slower than skott, exact numbers unavailable

**PageRank computation on import graphs:**
- NetworkX: Adequate for 10k nodes (seconds), struggles at 100k+ nodes
- fast-pagerank (sparse matrix): Much faster than NetworkX. Power method on scipy sparse matrices. ([GitHub](https://github.com/asajadi/fast-pagerank))
- For 10k-file repos, PageRank is well within 1-second budget using sparse matrix implementation

**Aider's approach (proven at scale):** Builds NetworkX MultiDiGraph, runs personalized PageRank with edge weight multipliers, binary-searches for token budget fit. Caches results in 3 tiers (disk tags cache, in-memory map cache, in-memory tree cache). Refresh modes: "auto" only regenerates if processing took > 1s. ([DeepWiki - Aider Repository Mapping](https://deepwiki.com/Aider-AI/aider/4.1-repository-mapping))

**SCIP indexing (Sourcegraph):** scip-typescript indexes at 1k-5k LoC/second. A 200k LoC codebase: ~40-200 seconds for full index. But SCIP is a one-time cost; incremental updates are fast. Blar reports SCIP provides 330x faster reference resolution compared to LSP. ([Sourcegraph blog](https://sourcegraph.com/blog/announcing-scip-typescript), [Blar](https://github.com/blarApp/code-base-agent))

**tree-sitter parsing:** Incremental parsing reduces reparse time by up to 70%. Full parse of 1.6MB JSON: ~1.2s. For import extraction (which only needs top-level AST nodes), much faster. ([GitHub - tree-sitter](https://github.com/tree-sitter/tree-sitter))

**TypeScript incremental compilation:** `--incremental` flag reduces subsequent build times to ~1/5 of original. The compiler tracks file dependencies and only recompiles changed files + their dependents. ([TypeScript blog](https://devblogs.microsoft.com/typescript/announcing-typescript-3-4/))

**Verdict:** The < 1 second budget is achievable for the core pipeline: import graph (precomputed, ~500ms cold / ~50ms incremental) + PageRank (< 100ms on sparse 10k graph) + LOD assignment (trivial). Semantic embeddings must be precomputed and cached separately.

### 8. PageRank / Centrality for Code: Aider Proves It Works

**Aider's repo-map is the gold standard implementation.** It uses personalized PageRank on a file dependency graph to select the most relevant code for LLM context. Key technical details from the source code (`aider/repomap.py`):

**Graph construction:**
- Nodes: file paths (strings)
- Edges: references between files sharing identifiers (from tree-sitter tag extraction)
- Edge attributes: `weight` (computed multiplier) and `ident` (identifier name)

**Edge weight multiplier system (cumulative):**
| Condition | Multiplier |
|-----------|-----------|
| Base | 1.0 |
| Identifier in mentioned_idents | x 10 |
| Long identifier (>= 8 chars, snake/camel case) | x 10 |
| Identifier starts with _ (private) | x 0.1 |
| Defined in > 5 files | x 0.1 |
| Referencer is in chat files | x 50 |
| Reference count | x sqrt(num_refs) |

**Personalization vector:**
- Chat files: +100 / len(fnames) each
- Mentioned files: +100 / len(fnames) each
- Files matching mentioned identifiers: +100 / len(fnames) each
- Default: 1 / num_nodes

**This is directly applicable to the DOI model.** Replace "chat files" with "focus files" (files the agent is actively editing), "mentioned files" with "task-referenced files", and you have a DOI-compatible ranking.

Sources: [Aider repo-map blog](https://aider.chat/2023/10/22/repomap.html), [DeepWiki - Aider Repository Mapping](https://deepwiki.com/Aider-AI/aider/4.1-repository-mapping), [Aider docs](https://aider.chat/docs/repomap.html)

### 9. LSP-Based Analysis: Viable but Not Primary

**LSPRAG** demonstrated that LSP can be used for precise semantic dependency retrieval: calling `textDocument/definition` and `textDocument/references` to build a demand-driven context graph. Retrieval takes ~5 seconds per focal method. Single-level lookup only (no transitive dependencies). ([arXiv](https://arxiv.org/html/2510.22210v2))

**Code-Craft (HCGS)** uses LSP (via multilspy) for language-agnostic code graph construction, including AST extraction, dependency resolution, and cross-file reference analysis. Achieved 82% improvement in retrieval precision. The LSP acts as "a powerful abstraction layer that insulates HCGS from the complexities of individual programming languages." ([arXiv](https://arxiv.org/html/2504.08975v1))

**Blar** combines LSP with tree-sitter: LSP finds references, tree-sitter classifies reference types (call, assignment, import). When SCIP is available, Blar uses it for 330x faster reference resolution. ([Blar blog](https://blar.io/blog/how-we-built-a-tool-to-turn-any-code-base-into-a-graph-of-its-relationships))

**LSP limitation (GitHub issue #472):** Standard LSP does not natively serve library/dependency information or inter-file dependency graphs. You must iterate files and aggregate results yourself. ([GitHub](https://github.com/microsoft/language-server-protocol/issues/472))

**Verdict:** LSP is powerful for *on-demand refinement* (when the agent needs to explore one level deeper from a known file) but too slow for full-graph construction. SCIP is the better option for precomputation. LSP is ideal for the "lazy loading" pattern: when an agent at LOD 2 needs to upgrade a file to LOD 0, use LSP to fetch exact definitions/references.

### 10. Aider's Repo-Map: The Closest Existing Implementation to Our DOI Model

Aider's repo-map implicitly implements a simplified DOI model:
- **A priori importance** = PageRank on the dependency graph (structural centrality)
- **Distance** = personalization vector (files closer to focus get higher weight)
- **Display threshold** = binary search for token budget fit

**What it lacks compared to a full DOI model:**
1. No decay -- relevance doesn't change over time within a session
2. No interaction history -- it doesn't track which files the agent has read/edited
3. No task-type adaptation -- bug fix and architecture review get the same ranking
4. No LOD tiers -- files are either included (with signatures) or excluded
5. No co-change signal -- git history is not factored in
6. No semantic matching -- purely structural (no embedding similarity to task description)

These gaps define exactly what the Sherpa DOI model should add.

---

## Furnas's Original Formula and Its Application

The foundation of all DOI models is Furnas (1986):

```
DOI(x) = API(x) - D(x, y)
```

Where:
- `API(x)` = a priori importance of element x (global, task-independent)
- `D(x, y)` = distance from x to the current focal point y
- Elements above a threshold are displayed; below are hidden

For a tree structure, D(x, y) is the number of edges between nodes. The key property: because DOI sets are convex and nested in trees, the view can be computed in time proportional to the *view size*, not the tree size. And when focus changes, only the subtree above the common ancestor needs recomputation.

**For code (proposed mapping):**
- `API(x)` = PageRank of file x on the import graph (centrality = global importance)
- `D(x, y)` = shortest path in import graph from file x to focus file(s) y
- Threshold = token budget (not a fixed number)

Source: [Furnas - Generalized Fisheye Views (CHI 1986)](https://dl.acm.org/doi/10.1145/22627.22342), [FishEye JTree implementation](https://www.cvast.tuwien.ac.at/projects/fisheye-jtree)

---

## Co-Change as a Complementary Signal

Git co-change history is a distinct signal from structural distance:

- **86.8% precision, 74% recall, 80.4% F-measure** for predicting change impact using file centrality in co-change graphs. ([KTH thesis](http://kth.diva-portal.org/smash/record.jsf?pid=diva2:851524))

- "A majority of co-evolving classes are not structurally linked" -- co-change captures dependencies invisible to import analysis: shared configuration, parallel test files, documentation, build scripts. ([Fregnan survey](https://fpalomba.github.io/pdf/Journals/J16.pdf))

- Combining structural + co-change + semantic coupling consistently outperforms any single signal. ([Springer - Poshyvanyk et al.](https://link.springer.com/article/10.1007/s10664-012-9233-9))

- git2net enables scalable extraction of fine-grained co-editing networks from large git repos. ([Springer](https://link.springer.com/article/10.1007/s10664-020-09928-2))

Co-change can be precomputed (mine git log once, update incrementally on each commit) and stored as edge weights on the import graph, effectively creating a "co-change enriched dependency graph."

---

## Implications for the DOI Model

### Recommended Distance Metric Stack (ordered by priority)

1. **Import graph distance** (primary): Shortest path in dependency graph from focus files. Cheapest to compute (< 500ms for 500k LoC), most reliable signal, well-tooled ecosystem.

2. **PageRank centrality** (a priori importance): Personalized PageRank on the import graph, using Aider's multiplier system as a starting point. Computable in < 100ms on 10k-node sparse graph.

3. **Co-change frequency** (enrichment): Edge weight bonus for files that frequently change together in git history. Precomputed from git log, updated incrementally. Captures hidden dependencies.

4. **Semantic similarity to task description** (task relevance): Embed task description + file content, compute cosine similarity. Precomputed embeddings, live query for task description. Adds the "TaskRelevance" term missing from Aider.

5. **Directory distance** (tiebreaker): Same directory = small bonus. Different package = small penalty. Zero computation cost. Only used when other signals are tied.

### The Composite DOI Formula

```
DOI(file, agent) = w1 * PageRank(file)                           # a priori importance
                 + w2 * (1 / (1 + GraphDist(file, focus_files)))  # dependency proximity
                 + w3 * CoChangeScore(file, focus_files)          # co-change coupling
                 + w4 * SemanticSim(file, task_description)       # task relevance
                 - w5 * Staleness(file.last_accessed)             # interaction decay
```

Suggested starting weights (to be tuned empirically):
- w1 = 0.15 (centrality -- important globally but not task-specific)
- w2 = 0.35 (dependency proximity -- strongest structural signal)
- w3 = 0.15 (co-change -- captures non-structural coupling)
- w4 = 0.25 (task relevance -- the semantic bridge)
- w5 = 0.10 (staleness -- mild decay, prevents context rot)

### Performance Budget

| Component | Cold Start | Incremental | Method |
|-----------|-----------|-------------|--------|
| Import graph construction | ~500ms | ~50ms (changed files only) | rev-dep or tree-sitter extraction |
| PageRank computation | ~100ms | ~100ms (full recompute is cheap) | fast-pagerank sparse matrix |
| Co-change scores | ~2s (one-time git log parse) | ~10ms per commit | git log mining, cached |
| Semantic embeddings | ~30s (10k files, API) | ~100ms per changed file | Precomputed, vector DB |
| LOD assignment + ranking | ~10ms | ~10ms | Sort + threshold |
| **Total cold start** | **~33s** (dominated by embeddings) | | |
| **Total warm query** | **< 200ms** | | |

Cold start is a one-time cost per workspace. The embedding computation can be done in the background. Warm queries (the interactive path) are well within the 1-second budget.

### LOD Tier Assignment

Based on DOI score, assign files to tiers:

| Tier | DOI Range | Content | Token Cost | Typical Files |
|------|-----------|---------|------------|---------------|
| LOD 0 (full) | Top 5-10 files | Complete file contents | ~100% | Focus files + 1-hop imports |
| LOD 1 (signatures) | Next 20-50 files | Function signatures, type defs, exports | ~10-20% | 2-3 hop imports, same module |
| LOD 2 (index) | Rest of relevant set | File path + 1-line description | ~1% | Broader package, tangentially related |
| Not loaded | Below threshold | Not in context | 0% | Most of the repo |

---

## Sources

### Tools and Libraries
- [rev-dep - Go-based dependency analysis (GitHub)](https://github.com/jayu/rev-dep) -- Fastest TS/JS dependency analyzer, 500ms on 500k+ LoC
- [skott - JS dependency graph tool (DEV Community)](https://dev.to/antoinecoulon/introducing-skott-the-new-madge-1bfl) -- 7.5x faster than madge
- [dependency-cruiser (GitHub)](https://github.com/sverweij/dependency-cruiser) -- Most feature-rich JS/TS dependency validator
- [madge (GitHub)](https://github.com/pahen/madge) -- Classic dependency graph generator
- [Jelly - JS/TS static analyzer (GitHub)](https://github.com/cs-au-dk/jelly) -- Call graph construction with flow analysis
- [PyCG - Python call graph (arXiv)](https://arxiv.org/abs/2103.00587) -- Under 1 second for 3.5k LoC
- [pyan - Python static call graph (GitHub)](https://github.com/Technologicat/pyan) -- Static call graph generator
- [fast-pagerank (GitHub)](https://github.com/asajadi/fast-pagerank) -- Sparse matrix PageRank, faster than NetworkX
- [tree-sitter (GitHub)](https://github.com/tree-sitter/tree-sitter) -- Incremental parsing, 70% reparse reduction
- [tree-sitter-graph (GitHub)](https://github.com/tree-sitter/tree-sitter-graph) -- DSL for constructing graphs from parsed source code
- [scip-typescript (Sourcegraph)](https://sourcegraph.com/blog/announcing-scip-typescript) -- 1k-5k LoC/second indexing
- [SCIP protocol (GitHub)](https://github.com/sourcegraph/scip) -- 8x smaller, 3x faster than LSIF
- [blarify (GitHub)](https://github.com/blarApp/code-base-agent) -- LSP + tree-sitter + SCIP code graph builder
- [ts-morph (GitHub)](https://github.com/dsherret/ts-morph) -- TypeScript compiler API wrapper for static analysis
- [cats - TypeScript coupling analysis (GitHub)](https://github.com/ThomWright/cats) -- Cohesion/coupling analysis
- [codemetrix (GitHub)](https://github.com/mikaelvesavuori/codemetrix) -- TypeScript coupling metrics
- [FTA - Fast TypeScript Analyzer (Website)](https://ftaproject.dev/) -- Rust-based static analysis for TypeScript
- [git2net (Springer)](https://link.springer.com/article/10.1007/s10664-020-09928-2) -- Scalable co-editing network extraction from git repos
- [NetworkX PageRank docs](https://networkx.org/documentation/stable/reference/algorithms/generated/networkx.algorithms.link_analysis.pagerank_alg.pagerank.html)

### Research Papers and Studies
- [Furnas - Generalized Fisheye Views (CHI 1986)](https://dl.acm.org/doi/10.1145/22627.22342) -- DOI(x) = API(x) - D(x,y); the foundational formula
- [Kersten & Murphy - Mylar: DOI Model for IDEs (AOSD 2005)](https://dl.acm.org/doi/10.1145/1052898.1052912) -- DOI formula for code: A*selections + B*edits - C*decay
- [Kersten & Murphy - Task Context for Programmer Productivity (FSE 2006)](https://dl.acm.org/doi/10.1145/1181775.1181777) -- 15% productivity improvement with task-focused interface
- [Static JavaScript Call Graphs: A Comparative Study (arXiv 2024)](https://arxiv.org/html/2405.07206v1) -- ACG + TAJS = 99% precision, 99% recall
- [LSPRAG: LSP-Guided RAG (arXiv 2025)](https://arxiv.org/html/2510.22210v2) -- LSP for demand-driven context retrieval, ~5s per method
- [Code-Craft: HCGS (arXiv 2025)](https://arxiv.org/html/2504.08975v1) -- LSP-based hierarchical graph, 82% retrieval improvement
- [GraphCodeAgent: Dual Graph-Guided Code Generation (arXiv 2025)](https://arxiv.org/html/2504.10046v2) -- SSCG with 5 edge types for repo-level generation
- [CodexGraph: LLM + Code Graph Databases (arXiv 2024)](https://arxiv.org/abs/2408.03910) -- Cypher queries on Neo4j code graph
- [Poshyvanyk et al. - Integrating Conceptual and Logical Couplings (Springer)](https://link.springer.com/article/10.1007/s10664-012-9233-9) -- Combining coupling types outperforms individuals
- [Semantic and Co-Change Coupling Interplay (Springer)](https://link.springer.com/article/10.1007/s10664-017-9569-2) -- Semantic coupling for co-change prediction
- [RavenBuild - Dependency-Aware Build Prediction (FSE 2024)](https://dl.acm.org/doi/10.1145/3643771) -- 50% F1 improvement with dependency features
- [Fregnan et al. - Survey on Software Coupling Relations](https://fpalomba.github.io/pdf/Journals/J16.pdf) -- Comprehensive coupling taxonomy
- [KTH Thesis - Git Commit History for Change Prediction](http://kth.diva-portal.org/smash/record.jsf?pid=diva2:851524) -- 86.8% precision for co-change prediction
- [Perer - DOI Graphs (InfoVis 2009)](https://perer.org/papers/adamPerer-DOIGraphs-InfoVis2009.pdf) -- DOI applied to large graph exploration
- [LoRACode: LoRA Adapters for Code Embeddings (arXiv 2025)](https://arxiv.org/html/2503.05315v1) -- Fine-tuning embeddings for code retrieval
- [CSSG: Code Similarity with Semantic Graphs (arXiv 2026)](https://arxiv.org/html/2601.04085v1) -- Edit distance over enhanced PDG representations
- [Change Propagation with Temporal Graphs (ScienceDirect)](https://www.sciencedirect.com/science/article/abs/pii/S0950584923002239) -- GNN on temporal co-change graphs
- [Change Coupling Between Software Artifacts (Book Chapter)](https://www.ime.usp.br/~gerosa/papers/changecoupling.pdf) -- Comprehensive co-change coupling reference

### Code Embedding Models
- [6 Best Code Embedding Models Compared (Modal)](https://modal.com/blog/6-best-code-embedding-models-compared) -- VoyageCode3, OpenAI, Nomic, CodeSage, CodeRankEmbed, Jina
- [Code Embedding: A Comprehensive Guide (Unite.AI)](https://www.unite.ai/code-embedding-a-comprehensive-guide/) -- Survey of embedding approaches
- [What embedding models work best for code? (Zilliz)](https://zilliz.com/ai-faq/what-embedding-models-work-best-for-code-and-technical-content)
- [UniXcoder (GitHub)](https://github.com/microsoft/CodeBERT/blob/master/UniXcoder/README.md) -- Microsoft's unified code pre-trained model
- [CodeBERT (GitHub)](https://github.com/microsoft/CodeBERT) -- Multi-programming-lingual pre-trained model

### AI Coding Tool Implementations
- [Aider repo-map blog post](https://aider.chat/2023/10/22/repomap.html) -- tree-sitter + PageRank for context selection
- [Aider repo-map docs](https://aider.chat/docs/repomap.html) -- Official documentation
- [DeepWiki - Aider Repository Mapping](https://deepwiki.com/Aider-AI/aider/4.1-repository-mapping) -- Detailed technical analysis of aider's implementation
- [Aider tree-sitter queries (GitHub)](https://github.com/Aider-AI/aider/tree/main/aider/queries) -- The actual .scm query files
- [How Cursor Indexes Your Codebase (TDS)](https://towardsdatascience.com/how-cursor-actually-indexes-your-codebase/) -- Merkle trees, embeddings, vector DB
- [How Cursor Indexes Codebases Fast (Engineer's Codex)](https://read.engineerscodex.com/p/how-cursor-indexes-codebases-fast) -- Chunking, Turbopuffer, incremental sync
- [Cursor Codebase Indexing Docs](https://cursor.com/docs/context/codebase-indexing) -- Official documentation
- [Augment Code Context Engine](https://www.augmentcode.com/context-engine) -- Semantic dependency graph for 400k+ files
- [COD Model for Dependency Mapping (Augment)](https://www.augmentcode.com/learn/cod-model-5-phase-guide-to-codebase-dependency-mapping)

### Graph Analysis and Performance
- [Memgraph vs NetworkX PageRank](https://memgraph.com/blog/who-ranks-better-memgraph-vs-networkx-pagerank) -- Memgraph 5x faster
- [Benchmark of Graph/Network Packages](https://www.timlrx.com/blog/benchmark-of-popular-graph-network-packages/) -- Comparison across Python libraries
- [Working with Large Internal Link Graphs (Briggsby)](https://www.briggsby.com/large-internal-link-graphs-in-python) -- Practical graph analysis at scale
- [Incremental Evolving Graph Analytics (ICS 2025)](https://hpcrl.github.io/ICS2025-webpage/program/Proceedings_ICS25/ics25-59.pdf) -- Incremental graph update algorithms
- [Structural and Connectivity Patterns in Maven Central (Springer)](https://link.springer.com/chapter/10.1007/978-3-032-08649-5_9) -- Centrality in software dependency networks

### MMO Interest Management (from parent initiative)
- [Boulanger Thesis - Interest Management (McGill 2006)](https://www.cs.mcgill.ca/~jboula2/thesis.pdf)
- [Benford & Fahlen - Aura/Focus/Nimbus (1993)](https://www.lri.fr/~mbl/ENS/CSCW/2013/papers/Benford_CSCW1993.pdf)
- [FishEye JTree Implementation](https://www.cvast.tuwien.ac.at/projects/fisheye-jtree)
- [Fisheye Interfaces: Problems and Challenges](http://www.kasperhornbaek.dk/papers/BookChapter2011_Fisheye.pdf)

---

## Raw Links

Every URL encountered during research, including tangentially relevant ones:

```
https://github.com/jayu/rev-dep
https://dev.to/antoinecoulon/introducing-skott-the-new-madge-1bfl
https://github.com/sverweij/dependency-cruiser
https://github.com/pahen/madge
https://www.npmjs.com/package/dependency-cruiser
https://www.netlify.com/blog/2018/08/23/how-to-easily-visualize-a-projects-dependency-graph-with-dependency-cruiser/
https://arkit.pro/
https://www.upgradejs.com/blog/application-architecture-visualization.html
https://www.xjavascript.com/blog/madge-circular-dependency-typescript/
https://snyk.io/advisor/npm-package/dependency-cruiser
https://bestofjs.org/projects?tags=dependencies&sort=newest
https://dev.to/antoinecoulon/unleash-graph-visualization-power-to-take-full-control-over-your-project-with-skott-3cm2
https://www.libhunt.com/r/madge
https://www.libhunt.com/r/skott
https://github.com/cs-au-dk/jelly
https://github.com/Persper/js-callgraph
https://arxiv.org/html/2405.07206v1
https://arxiv.org/abs/2405.07206
https://github.com/wala/WALA
https://github.com/google/closure-compiler
https://github.com/cwi-swat/javascript-call-graph
https://github.com/gunar/callgraph
https://github.com/cs-au-dk/TAJS
https://analysis-tools.dev/tag/typescript
https://analysis-tools.dev/tool/typescript-call-graph
https://github.com/analysis-tools-dev/static-analysis
https://github.com/Technologicat/pyan
https://github.com/vitsalis/PyCG
https://arxiv.org/abs/2103.00587
https://arxiv.org/pdf/2103.00587
https://github.com/davidfraser/pyan
https://cerfacs.fr/coop/pycallgraph
https://www.researchgate.net/publication/326901924_Code2graph_Automatic_Generation_of_Static_Call_Graphs_for_Python_Source_Code
https://github.com/tree-sitter/tree-sitter
https://symflower.com/en/company/blog/2023/parsing-code-with-tree-sitter/
https://owen.cafe/posts/tree-sitter-haskell-perf/
https://dasroot.net/posts/2026/02/incremental-parsing-tree-sitter-code-analysis/
https://www.deusinmachina.net/p/tree-sitter-revolutionizing-parsing
https://tomassetti.me/incremental-parsing-using-tree-sitter/
https://cocoindexio.substack.com/p/index-codebase-with-tree-sitter-and
https://github.com/tree-sitter/tree-sitter/issues/1277
https://github.com/tree-sitter/tree-sitter-graph
https://deepwiki.com/tree-sitter/tree-sitter-graph
https://github.com/IBM/tree-sitter-codeviews
https://dzone.com/articles/call-graphs-code-exploration-tree-sitter
https://github.com/tree-sitter/tree-sitter/discussions/2810
https://medium.com/@shsax/how-i-built-coderag-with-dependency-graph-using-tree-sitter-0a71867059ae
https://volito.digital/using-the-tree-sitter-library-in-python-to-build-a-custom-tool-for-parsing-source-code-and-extracting-call-graphs/
https://github.com/sourcegraph/scip
https://sourcegraph.com/blog/announcing-scip
https://sourcegraph.com/blog/announcing-scip-typescript
https://github.com/sourcegraph/scip-typescript
https://www.npmjs.com/package/@sourcegraph/scip-typescript
https://github.com/sourcegraph/scip/blob/main/scip.proto
https://github.com/sourcegraph/scip/blob/main/DESIGN.md
https://github.com/blarApp/code-base-agent
https://blar.io/blog/how-we-built-a-tool-to-turn-any-code-base-into-a-graph-of-its-relationships
https://blarnews.substack.com/p/how-we-built-a-tool-to-turn-any-code
https://neo4j.com/blog/developer/codebase-knowledge-graph/
https://github.com/vitali87/code-graph-rag
https://www.falkordb.com/blog/code-graph/
https://github.com/DucPhamNgoc08/CodeVisualizer
https://www.augmentcode.com/learn/cod-model-5-phase-guide-to-codebase-dependency-mapping
https://github.com/dsherret/ts-morph
https://ts-morph.com/manipulation/performance
https://ts-morph.com/
https://ftaproject.dev/
https://github.com/sgb-io/fta
https://github.com/ThomWright/cats
https://github.com/mikaelvesavuori/codemetrix
https://langserver.org/
https://microsoft.github.io/language-server-protocol/
https://medium.com/@selfint/lsp-outside-the-editor-431f77a9a4be
https://arxiv.org/html/2510.22210v2
https://thu-wingtecher.github.io/LSPRAG/
https://github.com/THU-WingTecher/LSPRAG
https://code.visualstudio.com/api/language-extensions/language-server-extension-guide
https://microsoft.github.io/language-server-protocol/specifications/lsp/3.17/specification/
https://github.com/microsoft/language-server-protocol/issues/472
https://arxiv.org/html/2504.08975v1
https://arxiv.org/abs/2504.08975
https://arxiv.org/html/2504.10046v2
https://arxiv.org/abs/2504.10046
https://arxiv.org/abs/2408.03910
https://arxiv.org/html/2408.03910v2
https://www.emergentmind.com/topics/structural-semantic-code-graph-sscg
https://www.emergentmind.com/topics/graphcodeagent
https://www.emergentmind.com/topics/codexgraph
https://arxiv.org/html/2511.18313v1
https://aclanthology.org/2025.findings-acl.624.pdf
https://arxiv.org/html/2601.04085v1
https://www.unite.ai/code-embedding-a-comprehensive-guide/
https://arxiv.org/html/2407.06360v1
https://zilliz.com/ai-faq/what-embedding-models-work-best-for-code-and-technical-content
https://dl.acm.org/doi/10.1145/3290353
https://arxiv.org/abs/1803.09473
https://huggingface.co/bigcode/starencoder/discussions/3
https://github.com/microsoft/CodeBERT/blob/master/UniXcoder/README.md
https://github.com/microsoft/CodeBERT
https://milvus.io/ai-quick-reference/how-do-i-implement-semantic-search-for-code-repositories
https://github.com/microsoft/CodeBERT/issues/13
https://modal.com/blog/6-best-code-embedding-models-compared
https://arxiv.org/html/2503.05315v1
https://arxiv.org/pdf/2411.12644
https://pixel-earth.com/embedding-models-for-code-explore-codebert-starcoder-gpt-embeddings-for-advanced-code-analysis/
https://dzone.com/articles/vector-embeddings-codebase-guide
https://en.wikipedia.org/wiki/Centrality
https://memgraph.com/blog/betweenness-centrality-and-other-centrality-measures-network-analysis
https://link.springer.com/chapter/10.1007/978-3-032-08649-5_9
https://kgullikson88.github.io/blog/pypi-analysis.html
https://networkit.github.io/dev-docs/notebooks/Centrality.html
https://bookdown.org/markhoff/social_network_analysis/centrality.html
https://graph-tool.skewed.de/static/doc/autosummary/graph_tool.centrality.pagerank.html
https://pynetwork.readthedocs.io/en/latest/influence_central.html
https://www.sciencedirect.com/science/article/abs/pii/S0378437121007111
https://cambridge-intelligence.com/keylines-faqs-social-network-analysis/
https://asajadi.github.io/fast-pagerank/
https://github.com/asajadi/fast-pagerank
https://networkx.org/documentation/stable/reference/algorithms/generated/networkx.algorithms.link_analysis.pagerank_alg.pagerank.html
https://gunrock.github.io/gunrock/gunrock.wiki/PageRank.html
https://allendowney.github.io/DSIRP/pagerank.html
https://www.timlrx.com/blog/benchmark-of-popular-graph-network-packages/
https://www.briggsby.com/large-internal-link-graphs-in-python
https://memgraph.com/blog/who-ranks-better-memgraph-vs-networkx-pagerank
https://aider.chat/2023/10/22/repomap.html
https://aider.chat/docs/repomap.html
https://aider.chat/docs/ctags.html
https://aider.chat/docs/faq.html
https://aider.chat/docs/
https://deepwiki.com/Aider-AI/aider/4.1-repository-mapping
https://deepwiki.com/helloandworlder/aider/4.1-repository-mapping
https://news.ycombinator.com/item?id=41485744
https://www.tczhong.com/posts/llm/aider_learning/
https://github.com/Aider-AI/aider/tree/main/aider/queries
https://github.com/grantjenks/py-tree-sitter-languages
https://mcpservers.org/servers/pdavis68/RepoMapper
https://www.semanticscholar.org/paper/Mylar:-a-degree-of-interest-model-for-IDEs-Kersten-Murphy/7e19fe0cd5bd7730302b9ce4c046fb0712493dd5
https://slidetodoc.com/mylar-a-degreeofinterest-model-for-ides-mik-kersten/
https://www.researchgate.net/publication/221014736_Mylar_A_degree-of-interest_model_for_IDEs
https://slidetodoc.com/mylyn-the-taskfocused-interface-mik-kersten-tasktop-president-2/
https://en.wikipedia.org/wiki/Task-focused_interface
https://help.eclipse.org/latest/topic/org.eclipse.mylyn.help.ui/Mylyn/FAQ/Task-Focused-UI.html
https://wiki.eclipse.org/Mylyn/Architecture
https://www.infoq.com/articles/lessons-application-lifecycle/
https://www.infoq.com/news/2008/02/tasktop-10/
https://www.cs.ubc.ca/~murphy/papers/mylar/mylar-aosd20056.pdf
https://dl.acm.org/doi/10.1145/22627.22342
https://dl.acm.org/doi/10.1145/22339.22342
https://www.cvast.tuwien.ac.at/projects/fisheye-jtree
http://www.kasperhornbaek.dk/papers/BookChapter2011_Fisheye.pdf
http://www.ickn.org/elements/hyper/cyb57.htm
http://csis.pace.edu/~marchese/CS835/Readings/FisheyeOriginalTM.pdf
http://www.bitsavers.org/pdf/dec/tech_reports/SRC-RR-84A.pdf
https://www.researchgate.net/publication/229100011_Generalized_Fisheye_Views
http://vis.stanford.edu/files/2003-InterestEstimation-CHI.pdf
https://perer.org/papers/adamPerer-DOIGraphs-InfoVis2009.pdf
https://scispace.com/papers/generalized-fisheye-views-37sltdtdhq
https://dl.ifip.org/db/conf/interact/hciv2009/JakobsenH09.pdf
https://inria.hal.science/hal-01572655/document
https://towardsdatascience.com/how-cursor-actually-indexes-your-codebase/
https://read.engineerscodex.com/p/how-cursor-indexes-codebases-fast
https://cursor.com/docs/context/codebase-indexing
https://cursor.com/blog/secure-codebase-indexing
https://docs.cursor.com/context/codebase-indexing
https://bitpeak.com/how-cursor-works-deep-dive-into-vibe-coding/
https://lobste.rs/s/myrlhi/how_cursor_indexes_codebases_fast
https://forum.cursor.com/t/codebase-indexing/36
https://adityarohilla.com/2025/05/08/how-cursor-works-internally/
https://www.augmentcode.com/context-engine
https://www.augmentcode.com/tools/sourcegraph-cody-vs-cursor-vs-augment-code-for-enterprise-development
https://www.augmentcode.com/learn/cod-model-5-phase-guide-to-codebase-dependency-mapping
https://awesomeagents.ai/reviews/review-augment-code-intent/
https://docs.augmentcode.com/context-services/mcp/overview
https://www.insprd.io/work/augment
https://watch.getcontrast.io/register/why-context-beats-prompting-a-deep-dive-into-augment-code-s-context-engine
https://fpalomba.github.io/pdf/Journals/J16.pdf
https://link.springer.com/article/10.1007/s10664-008-9088-2
https://researchgate.net/publication/320504018_An_Empirical_Study_on_the_Interplay_between_Semantic_Coupling_and_Co-Change_of_software_classes
https://www.sciencedirect.com/topics/computer-science/structural-coupling
https://www.techtarget.com/searchapparchitecture/tip/The-basics-of-software-coupling-metrics-and-concepts
https://www.researchgate.net/publication/263888600_Empirical_Evaluation_of_A_New_Coupling_Metric_Combining_Structural_and_Semantic_Coupling
https://link.springer.com/article/10.1007/s10664-012-9233-9
https://www.cs.wm.edu/~denys/pubs/EMSE-MSR&IR-IA-Preprint.pdf
https://par.nsf.gov/servlets/purl/10199009
https://link.springer.com/article/10.1007/s10664-020-09921-9
https://www.ime.usp.br/~gerosa/papers/changecoupling.pdf
https://link.springer.com/article/10.1007/s10664-017-9569-2
https://dl.acm.org/doi/10.1145/3674805.3686668
https://www.cs.wm.edu/~denys/pubs/ICSE'13-CouplingStudy-CAMERA.pdf
https://www.sciencedirect.com/science/article/abs/pii/S016412121600056X
https://arxiv.org/html/2411.19099
https://link.springer.com/article/10.1007/s10664-020-09928-2
https://www.researchgate.net/publication/280580091_Do_Historical_Metrics_and_Developers_Communication_Aid_to_Predict_Change_Couplings
https://earezki.com/ai-news/2026-02-24-commit-prophet-i-built-a-tool-that-predicts-buggy-files-using-git-history/
https://www.researchgate.net/publication/221200077_Logical_Coupling_Based_on_Fine-Grained_Change_Information
https://www.researchgate.net/publication/221657065_The_evolution_radar_Visualizing_integrated_logical_coupling_information
https://arxiv.org/html/2409.08555
https://www.researchgate.net/publication/254040767_Co-evolution_of_logical_couplings_and_commits_for_defect_estimation
https://www.semanticscholar.org/paper/Using-Git-Commit-History-for-Change-Prediction-Hagward-f%C3%B6r%C3%A4ndringar/87fdd51b1796346da396db904e38a964c0da5652
http://kth.diva-portal.org/smash/record.jsf?pid=diva2:851524
https://rebels.cs.uwaterloo.ca/papers/fse2024_sun.pdf
https://dl.acm.org/doi/10.1145/3643771
https://2024.esec-fse.org/details/fse-2024-posters/68/RavenBuild-Context-Relevance-and-Dependency-Aware-Build-Outcome-Prediction
https://zenodo.org/records/8388161
https://www.puppygraph.com/blog/software-dependency-graph
https://jun-zeng.github.io/file/tailor_paper.pdf
https://www.nature.com/articles/s41598-024-61219-8
https://marketplace.visualstudio.com/items?itemName=sz-p.dependencygraph
https://yinxingxue.github.io/papers/ase2020_CCGraph%20A%20PDG%20based%20Code%20Clone%20Detector%20With%20Approximate%20Graph%20Matching.pdf
https://www.cppdepend.com/documentation/cppdepend-dependency-graph
https://llvm.org/docs/DependenceGraphs/index.html
https://www.sciencedirect.com/topics/computer-science/dependency-graph
https://www.sciencedirect.com/science/article/pii/S2667305323000157
https://devblogs.microsoft.com/typescript/announcing-typescript-3-4-rc/
https://devblogs.microsoft.com/typescript/announcing-typescript-3-4/
https://github.com/microsoft/TypeScript/pull/42960
https://github.com/timocov/incremental-typescript
https://github.com/microsoft/TypeScript/issues/42173
https://www.typescriptlang.org/tsconfig/incremental.html
https://www.sciencedirect.com/science/article/abs/pii/S0950584923002239
https://www.researchgate.net/publication/275482633_Structural_and_Connectivity_Patterns_in_the_Maven_Central_Software_Dependency_Network
https://hpcrl.github.io/ICS2025-webpage/program/Proceedings_ICS25/ics25-59.pdf
https://www.cs.mcgill.ca/~jboula2/thesis.pdf
https://www.researchgate.net/publication/221391497_Comparing_interest_management_algorithms_for_massively_multiplayer_games
https://www.gamedev.net/forums/topic/609123-interest-management-in-an-mmo/
https://www.dynetisgames.com/2017/04/05/interest-management-mog/
https://link.springer.com/10.1007/978-3-319-08234-9_239-1
https://appwarps2.shephertz.com/dev-center/mmo-interest-management/
https://dl.acm.org/doi/10.1145/1230040.1230069
https://medium.com/@gustavobruno/coupling-and-cohesion-explained-with-typescript-2949f9ee1c97
https://wallis.dev/blog/typescript-project-references
https://dev.to/room_js/typescript-how-do-you-share-type-definitions-across-multiple-projects-1203
https://www.totaltypescript.com/books/total-typescript-essentials/deriving-types
https://labs42io.github.io/clean-code-typescript/
https://www.preprints.org/manuscript/202510.0924/v1/download
https://medium.com/@wangxj03/semantic-code-search-010c22e7d267
https://ssawant.github.io/posts/CODEXGRAPH/CODEXGRAPH.html
https://www.marktechpost.com/2024/08/11/codexgraph-an-artificial-intelligence-ai-system-that-integrates-llm-agents-with-graph-database-interfaces-extracted-from-code-repositories/
https://aclanthology.org/2025.naacl-long.7.pdf
https://huggingface.co/papers/2408.03910
https://laptype.github.io/CodexGraph-page/
https://www.qodo.ai/blog/best-ai-coding-assistant-tools/
https://www.faros.ai/blog/best-ai-coding-agents-2026
https://intuitionlabs.ai/articles/ai-code-assistants-large-codebases
https://www.jetbrains.com/ai-assistant/
https://www.lindy.ai/blog/ai-coding-agents
https://www.shakudo.io/blog/best-ai-coding-assistants
https://www.pragmaticcoders.com/resources/ai-developer-tools
https://replit.com/discover/best-ai-coding-assistant
https://usefulai.com/tools/ai-coding
https://gitnation.com/contents/enhanced-ast-static-analysis-with-typescript-language-server
https://docs.gitlab.com/user/project/code_intelligence/
https://bugzilla.mozilla.org/show_bug.cgi?id=1740290
https://wenyuanxu.net/project/jelly/
```

---

## Open Questions

1. **What's the optimal hop limit for import graph distance?** Aider uses personalization + PageRank (implicit distance weighting) rather than a hard hop cutoff. The DOI formula could use either approach. Need to test: does `1/(1+hops)` outperform PageRank-based weighting, or vice versa?

2. **How to handle barrel files (index.ts)?** A barrel file that re-exports 50 things creates a misleading distance metric: everything appears 1 hop away through the barrel. Should barrels be transparent (collapsed) in the graph, or should re-exports be weighted differently?

3. **Dynamic import discovery.** Dynamic `import()` expressions are invisible to static analysis. For the DOI model, should there be a fallback to runtime tracing (e.g., from test runs) to discover dynamic dependency edges?

4. **Co-change vs. dependency correlation.** Poshyvanyk found that "a majority of co-evolving classes are not structurally linked." Does this hold for TypeScript projects specifically? The MSR literature is dominated by Java studies.

5. **Embedding model selection for file-level similarity.** The benchmarks compare at code-snippet level. For file-level similarity (what the DOI model needs), should files be embedded as a whole, or should the embedding be computed from file summaries?

6. **What is the right decay function for agent interaction?** Mylyn decays all elements when any element is selected. For AI agents, the equivalent would be: decay all file DOI scores each time the agent reads a new file or makes a tool call. How aggressive should this decay be?

7. **Can the DOI model be learned from agent session traces?** If we log which files agents access during successful task completions, we could train a model to predict file relevance from (task description, focus files, file features). This would let us learn optimal weights instead of hand-tuning.

8. **SCIP vs. LSP vs. tree-sitter for the extraction layer.** SCIP gives 330x faster reference resolution than LSP, but requires a separate indexing pass. tree-sitter is the fastest parser but only gives syntactic structure (no type resolution). What's the right extraction strategy for different project sizes?
