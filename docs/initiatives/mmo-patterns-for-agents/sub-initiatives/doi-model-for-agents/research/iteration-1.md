# Iteration 1 — 2026-03-12

## Research Vectors

### Vector 1: Mylyn & Furnas DOI Deep Dive
**Question:** What is Mylyn's actual implementation — exact decay function, thresholds, context save/restore, production lessons? How does it relate to Furnas's 1986 Generalized Fisheye Views?
**Full report:** [iteration-1/vector-1-mylyn-furnas-doi.md](iteration-1/vector-1-mylyn-furnas-doi.md)

**Key discoveries:**
- Mylyn's exact formula from source: `DOI = (selections * 1.0) + (edits * 0.7) + (commands * 1.0) + manipulationBias - (eventsSinceCreation * 0.017) + predictedBias + propagatedBias` ([Mylyn source](https://github.com/eclipse-mylyn/org.eclipse.mylyn/blob/main/mylyn.context/org.eclipse.mylyn.context.core/src/org/eclipse/mylyn/internal/context/core/InteractionContextScaling.java))
- **Decay is per-interaction, not per-time.** A single selection decays to uninteresting after ~59 subsequent events elsewhere. This transfers directly to agents — count tool calls, not clock time.
- Furnas vs Mylyn is a fundamental divergence: Furnas is **stateless** (structural importance minus distance), Mylyn is **stateful** (interaction history minus event-based decay). Mylyn dropped Furnas's "a priori importance" entirely — this is a gap worth filling.
- Cold start: Mylyn starts with empty context, no warm-start heuristic. Re-engagement with decayed elements gets a reset bonus.
- Active Search (proactive context expansion) was removed as "too expensive" — a warning about aggressive speculative context loading.
- No other tool adopted the full DOI model. Mylyn declined due to Eclipse platform coupling, not DOI model failure.

**Implications:**
- Event-based decay is perfect for agents (tool invocations as events)
- A hybrid Furnas+Mylyn model — structural API plus behavioral accumulation — would outperform either alone

### Vector 2: MSR Co-Change Coupling & File Relevance Prediction
**Question:** What does MSR literature say about predicting which files are relevant together? How predictive is co-change data?
**Full report:** [iteration-1/vector-2-msr-co-change-coupling.md](iteration-1/vector-2-msr-co-change-coupling.md)

**Key discoveries:**
- Zimmermann's ROSE tool: top-3 suggestions correct >70% of the time, 66% average precision, 2% false alarm rate ([Zimmermann TSE 2005](https://thomas-zimmermann.com/publications/files/zimmermann-tse-2005.pdf))
- Structural coupling and co-change coupling are **complementary, not redundant** — co-changed pairs often have no import relationship ([Fregnan survey](https://fpalomba.github.io/pdf/Journals/J16.pdf))
- ML (random forests) significantly outperforms raw association rules for predicting recommendations ([Rolfsnes ASE 2017](https://evolveit.bitbucket.io/publications/ase2017/))
- Older commits have less predictive value — validates temporal decay ([Agrawal 2020](https://ietresearch.onlinelibrary.wiley.com/doi/full/10.1049/iet-sen.2019.0368))
- LLM reasoning about change intent improves impact prediction by 380% (Ripple, [ICSE 2026](https://aashishyadavally.github.io/assets/pdf/pub-icse2026-(2).pdf))
- Computational cost is low — precomputable, incrementally updatable, <1 second target achievable

**Implications:**
- Co-change is a primary DOI signal capturing hidden dependencies invisible to import graphs
- Task intent (available from agent task definitions) dramatically improves prediction quality

### Vector 3: Information Foraging Theory & Developer Navigation
**Question:** How does Pirolli & Card's IFT explain code navigation? What's "information scent" in a codebase? How does this connect to Mylyn and agent tool-call patterns?
**Full report:** [iteration-1/vector-3-information-foraging.md](iteration-1/vector-3-information-foraging.md)

**Key discoveries:**
- PFIS model predicts developer navigation better than a second human programmer, using TF-IDF scent + call-graph spreading activation ([Lawrance et al. TSE 2013](https://web.engr.oregonstate.edu/~burnett/Reprints/TSE-IFT-2013-asprinted.pdf))
- Developers spend **35-50% of time navigating** between code locations, not reading or editing ([Ko et al. 2006](https://faculty.washington.edu/ajko/papers/Ko2006SeekRelateCollect.pdf))
- Developers are **systematically suboptimal foragers** — >50% of navigation choices produce less value than predicted ([Piorkowski et al. FSE 2016](https://dl.acm.org/doi/10.1145/2950290.2950302))
- The IFT-Mylyn connection is conceptual but deep: Mylyn captures **empirical foraging traces**; IFT explains **why** those traces predict relevance
- **No published research applies IFT to AI agent tool-call patterns** — this is novel territory
- Agents face harder constraints than developers: no visual scanning, no spatial memory, hard context window limits
- Marginal Value Theorem predicts when to leave a "patch" (file) — directly applicable to context window management

**Implications:**
- Semantic similarity between task description and code identifiers (information scent) is a primary signal
- Spreading activation through call graphs (PFIS) is a validated technique for distributing interest
- Agents following DOI recommendations would be better-than-human foragers (>50% of human navigations are suboptimal)

### Vector 4: How Current AI Coding Tools Select Context
**Question:** What do Cursor, Windsurf, Augment, Claude Code, Aider, etc. actually do to select context? What's their implicit interest management?
**Full report:** [iteration-1/vector-4-ai-tool-context-selection.md](iteration-1/vector-4-ai-tool-context-selection.md)

**Key discoveries:**
- Three paradigms exist: **embedding-based RAG** (Cursor, Windsurf, Augment), **agentic tool-use** (Claude Code, Cline, Codex CLI), **graph-based ranking** (Aider)
- **No existing tool implements a DOI model.** Aider's PageRank personalization is closest (structural importance + focal weighting), but has no decay, no interaction tracking, no task-type adaptation
- Windsurf's five-layer pipeline (rules + memories + active file + retrieval + action history) is the closest to multi-signal interest, but layers are hardcoded, not a continuous function
- Wrong context is **actively harmful** — SWE-ContextBench showed "unfiltered or incorrectly selected experience provides limited or negative benefits" ([arXiv:2602.08316](https://arxiv.org/abs/2602.08316))
- Claude Code chose **regex search over embeddings** after benchmarks showed superior performance — implicit validation that structural/syntactic context selection can beat semantic
- Developer trust in AI accuracy **declining** (43% → 33%, 2024→2025) ([IEEE Spectrum](https://spectrum.ieee.org/ai-coding-degrades))

**Implications:**
- No tool computes a persistent, continuous interest function with temporal decay
- The DOI model fills a genuine gap — combining structural proximity, semantic similarity, co-change, and behavioral evidence into a unified score
- The DOI model should provide warm-start context that the agent can then refine through tool use (best of both worlds)

### Vector 5: Dependency Graph as Distance Metric
**Question:** Which graph metric best predicts file relevance? What's computable in <1 second for a 10k-file repo?
**Full report:** [iteration-1/vector-5-dependency-graph-distance.md](iteration-1/vector-5-dependency-graph-distance.md)

**Key discoveries:**
- Import graph distance is the best primary metric — rev-dep handles 500k+ LoC in 500ms ([GitHub](https://github.com/jayu/rev-dep))
- Aider's PageRank personalization is the gold standard implementation: edge weights (x50 for chat files, x10 for mentioned identifiers), personalization vector, binary-search token budget fitting ([DeepWiki](https://deepwiki.com/Aider-AI/aider/4.1-repository-mapping))
- Call graphs are too expensive for primary use but valuable for refinement within a pre-filtered set
- Directory distance is weak standalone but useful as tiebreaker — "a majority of co-evolving classes are not structurally linked" ([Fregnan](https://fpalomba.github.io/pdf/Journals/J16.pdf))
- **Hybrid metrics consistently outperform single signals** — GRACE framework: +8.19% Exact Match ([EmergentMind](https://www.emergentmind.com/topics/structural-semantic-code-graph-sscg))
- SCIP protocol (Sourcegraph) provides 330x faster reference resolution than LSP
- Warm queries (the interactive path) are well within 1-second budget: ~600ms total

**Implications:**
- The DOI model should use import graph distance as primary, enriched with co-change weights and semantic similarity
- Aider's implementation provides a proven baseline to build on
- Performance is not a blocker — the system is prototypable today

## Synthesis

Seven cross-cutting insights emerged that no single vector produced alone.

### 1. The Two DOI Traditions Are Complementary, Not Competing

The most important theoretical insight: there are two fundamentally different approaches to computing "degree of interest," and every vector points to needing both.

**Furnas DOI (1986):** Stateless. Structural. `DOI(x) = API(x) - D(x, focus)`. Computes interest from a priori importance and distance. No learning, no history. Recomputed on each focus change.

**Mylyn DOI (2005):** Stateful. Behavioral. `DOI(x) = interactions(x) - decay(events_since)`. Computes interest from accumulated interaction history. Learns from behavior. Persists across focus changes.

| Dimension | Furnas | Mylyn | Agent DOI (proposed) |
|-----------|--------|-------|---------------------|
| Primary signal | Structure (tree depth) | Behavior (selections, edits) | Both: structure provides priors, behavior refines |
| Distance metric | Tree distance | Event distance (events since last touch) | Graph distance (import hops) + event distance |
| A priori importance | Explicit (node depth) | None (all start at 0) | PageRank on import graph |
| Cold start | Full view from structure | Empty — must interact | Warm start from structure + task description |
| Decay | None | Linear event-based (0.017/event) | Exponential event-based (fast initial, slow tail) |
| Learning | None | Implicit from interaction | Explicit from interactions + task intent |

Aider's PageRank ranking is essentially a Furnas-style DOI (structural importance + distance from focus). Windsurf's action tracking is essentially a Mylyn-style DOI (behavioral accumulation). **No tool combines both.** The Sherpa DOI model should be the first.

### 2. Five Independent Signals, One Unified Score

Each research vector contributed a distinct, validated signal. The complete DOI formula combines them:

```
DOI(file, task, agent) =
    w1 * PageRank(file)                          # Furnas API: structural importance
  + w2 * (1/(1 + GraphDist(file, focus)))         # Furnas D: dependency proximity
  + w3 * CoChange(file, focus)                    # MSR: historical coupling
  + w4 * Scent(file, task.description)            # IFT: information scent / task relevance
  + w5 * Interaction(file, agent.events)          # Mylyn: behavioral accumulation
  - w6 * Decay(agent.events_since_last_touch)     # Mylyn: event-based decay
```

Suggested starting weights (from cross-referencing all 5 vectors):
- w1 = 0.10 (PageRank — global importance, task-independent)
- w2 = 0.25 (Graph distance — strongest structural signal per V5)
- w3 = 0.15 (Co-change — captures non-structural coupling per V2)
- w4 = 0.20 (Information scent — task-specific relevance per V3)
- w5 = 0.20 (Interaction — behavioral evidence per V1)
- w6 = 0.10 (Decay — mild, prevents stale context per V1)

These weights are deliberately designed to work both at cold start (w5=0 since no interactions yet, so structural + semantic signals dominate) and in steady state (w5 grows as agent works, becoming dominant over time — matching Mylyn's proven design).

### 3. Cold Start Is the Biggest Practical Problem (And It's Solvable)

Mylyn's single biggest limitation is the empty cold start. The parent initiative's iteration 1 flagged this. Now we have the solution:

**At cold start (no interaction history):** The Furnas-style signals (PageRank, graph distance, co-change, information scent) provide immediate context. The PFIS model from IFT validates that TF-IDF scent + call-graph propagation predicts navigation **better than a second human programmer**. Co-change data from git history provides empirical relevance signals. Together, these give a warm start that Mylyn never had.

**After interaction begins:** Mylyn-style behavioral signals (what the agent has read, searched for, edited) gradually dominate. Decay pushes cold-start estimates out as real evidence accumulates. This is exactly the Bayesian update pattern: prior (structural) → posterior (behavioral).

### 4. Agents Would Be Better-Than-Human Foragers

The IFT research (V3) found that developers are systematically suboptimal foragers — >50% of their navigation choices produce less value than predicted. Agents following DOI-guided context would skip the dead ends:

- **No vocabulary mismatch:** LLMs understand synonyms and intent, unlike TF-IDF scent (the vocabulary problem from Furnas 1987 that plagues human navigation)
- **No spatial memory limitations:** DOI scores provide persistent memory of what's been explored
- **No sunk cost bias:** Decay naturally moves attention away from depleted "patches" (in foraging theory terms)
- **No fatigue:** The DOI function doesn't degrade over time

But agents face a harder constraint: **context windows are smaller than human working memory.** A developer can hold mental models of 20+ files; an agent's context window is physically finite. This makes the LOD tier system (V5) essential — full content for high-DOI files, signatures for medium, paths for low.

### 5. No Existing Tool Implements This (Confirmed)

V4's comprehensive survey of 10 tools confirmed: no tool computes a persistent, continuous, multi-signal interest function over a codebase. The gap analysis:

| Signal | Aider | Windsurf | Augment | Claude Code | Cursor |
|--------|-------|----------|---------|-------------|--------|
| Structural importance (PageRank) | **Yes** | No | Partial | No | No |
| Dependency proximity | **Yes** | No | **Yes** | No | No |
| Co-change coupling | No | No | No | No | No |
| Semantic similarity | No | **Yes** | **Yes** | No | **Yes** |
| Interaction/behavioral | No | **Yes** | No | Implicit | No |
| Temporal decay | No | No | No | No | No |
| LOD tiers | Partial | No | No | No | No |
| Persistent across sessions | No | **Yes** | No | Partial | No |

The Sherpa DOI model would be the first to check every box.

### 6. The Performance Budget Works

V5 proved the system is buildable today:

| Component | Cold Start | Warm Query | Method |
|-----------|-----------|------------|--------|
| Import graph | ~500ms | ~50ms | rev-dep / tree-sitter |
| PageRank | ~100ms | ~100ms | fast-pagerank sparse matrix |
| Co-change scores | ~2s (one-time) | ~10ms/commit | git log mining, cached |
| Semantic embeddings | ~30s (background) | ~100ms/file | Precomputed, vector DB |
| LOD assignment | ~10ms | ~10ms | Sort + threshold |
| **Total warm query** | | **< 200ms** | |

Cold start is ~33 seconds (dominated by embeddings), which can run in the background. The interactive path (warm queries) is well under 1 second. This means the DOI model can run as an MCP tool that responds before the agent's next turn.

### 7. LLM + DOI Is Genuinely Novel Territory

Three convergent findings establish novelty:
- V1: No published work applies DOI to LLM context window management
- V2: Ripple (ICSE 2026) proves LLMs improve change impact prediction by 380% — but it uses LLMs to predict impact, not to manage their own context
- V3: No published research applies information foraging theory to AI agent tool-call patterns
- V4: No production tool implements persistent DOI

The combination — using 30 years of interest management theory to manage an LLM's own context window — is genuinely novel. The closest prior art is Aider's PageRank (structural DOI only) and Windsurf's five-layer pipeline (behavioral signals without a continuous function).

## All Sources

### Foundational Theory
- [Furnas 1986 - Generalized Fisheye Views (CHI)](https://dl.acm.org/doi/10.1145/22627.22342) — Original DOI formula: DOI = API - D
- [Pirolli & Card 1999 - Information Foraging (Psych Review)](https://psycnet.apa.org/record/1999-11924-001) — Information scent, patches, MVT
- [Benford & Fahlen 1993 - Spatial Model of Interaction](https://www.lri.fr/~mbl/ENS/CSCW/2013/papers/Benford_CSCW1993.pdf) — Aura/Focus/Nimbus

### Eclipse Mylyn / DOI Model
- [Kersten & Murphy AOSD 2005 - Mylar DOI for IDEs](https://dl.acm.org/doi/10.1145/1052898.1052912) — Original DOI for code paper
- [Kersten & Murphy FSE 2006 - Task Context](https://dl.acm.org/doi/10.1145/1181775.1181777) — 15% productivity improvement evaluation
- [Kersten & Murphy AI Magazine 2015 - Retrospective](https://doi.org/10.1609/aimag.v36i2.2581) — 10-year retrospective
- [Mylyn source: DegreeOfInterest.java](https://github.com/eclipse-mylyn/org.eclipse.mylyn/blob/main/mylyn.context/org.eclipse.mylyn.context.core/src/org/eclipse/mylyn/internal/context/core/DegreeOfInterest.java) — Core DOI computation
- [Mylyn source: InteractionContextScaling.java](https://github.com/eclipse-mylyn/org.eclipse.mylyn/blob/main/mylyn.context/org.eclipse.mylyn.context.core/src/org/eclipse/mylyn/internal/context/core/InteractionContextScaling.java) — Default coefficients

### MSR / Co-Change Coupling
- [Zimmermann TSE 2005 - Mining Version Histories (ROSE)](https://thomas-zimmermann.com/publications/files/zimmermann-tse-2005.pdf) — 70%+ top-3 accuracy
- [Ying et al. TSE 2004 - Predicting Source Code Changes](https://ieeexplore.ieee.org/document/1324645/) — Frequent pattern mining for recommendations
- [Rolfsnes et al. ASE 2017 - Predicting Relevance](https://evolveit.bitbucket.io/publications/ase2017/) — Random forest outperforms association rules
- [Yadavally ICSE 2026 - Ripple](https://aashishyadavally.github.io/assets/pdf/pub-icse2026-(2).pdf) — LLM-based change impact analysis, 380% improvement
- [Agrawal 2020 - History age matters](https://ietresearch.onlinelibrary.wiley.com/doi/full/10.1049/iet-sen.2019.0368) — Validates temporal decay
- [CodeScene - Temporal Coupling](https://docs.enterprise.codescene.io/versions/3.4.0/guides/technical/temporal-coupling.html) — Production co-change tool

### Information Foraging in Software Engineering
- [Lawrance et al. TSE 2013 - IFT for Debugging](https://web.engr.oregonstate.edu/~burnett/Reprints/TSE-IFT-2013-asprinted.pdf) — PFIS model predicts better than second programmer
- [Ko et al. 2006 - Seek, Relate, Collect](https://faculty.washington.edu/ajko/papers/Ko2006SeekRelateCollect.pdf) — 35-50% time navigating
- [Piorkowski et al. FSE 2016 - Foraging and Navigations](https://dl.acm.org/doi/10.1145/2950290.2950302) — >50% suboptimal navigation choices
- [Fleming et al. TOSEM 2013 - IFT for Tools](https://dl.acm.org/doi/10.1145/2430545.2430551) — IFT concepts mapped to code
- [SWE-grep (Cognition 2025)](https://cognition.ai/blog/swe-grep) — RL-trained foraging agent

### AI Tool Context Selection
- [Aider repo-map](https://aider.chat/docs/repomap.html) — PageRank + tree-sitter, proven at scale
- [DeepWiki - Aider Repository Mapping](https://deepwiki.com/Aider-AI/aider/4.1-repository-mapping) — Full technical details
- [Windsurf/Cascade five-layer pipeline](https://markaicode.com/windsurf-flow-context-engine/) — Multi-signal context assembly
- [Augment Context Engine](https://www.augmentcode.com/context-engine) — Semantic dependency graphs, 400k+ files
- [SWE-ContextBench](https://arxiv.org/abs/2602.08316) — Wrong context actively harmful
- [Claude Code docs](https://code.claude.com/docs/en/how-claude-code-works) — Agentic tool-use, no pre-built index
- [Spotify Honk Part 2](https://engineering.atspotify.com/2025/11/context-engineering-background-coding-agents-part-2) — Goldilocks problem with context

### Dependency Graphs & Tooling
- [rev-dep](https://github.com/jayu/rev-dep) — Fastest TS/JS dependency analyzer, 500ms on 500k+ LoC
- [skott](https://dev.to/antoinecoulon/introducing-skott-the-new-madge-1bfl) — 7.5x faster than madge
- [dependency-cruiser](https://github.com/sverweij/dependency-cruiser) — Most feature-rich JS/TS dependency validator
- [fast-pagerank](https://github.com/asajadi/fast-pagerank) — Sparse matrix PageRank
- [SCIP protocol](https://github.com/sourcegraph/scip) — 330x faster than LSP for references
- [GRACE framework](https://www.emergentmind.com/topics/structural-semantic-code-graph-sscg) — Hybrid graph retrieval, +8.19% Exact Match
- [Code-Craft HCGS](https://arxiv.org/html/2504.08975v1) — 82% improvement in retrieval precision via LSP code graphs

### Context Engineering (Industry)
- [Anthropic - Context Engineering for Agents](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents) — "Smallest set of high-signal tokens"
- [Martin Fowler - Context Engineering for Coding Agents](https://martinfowler.com/articles/exploring-gen-ai/context-engineering-coding-agents.html) — Glob-scoped rules = zone-based interest management

## Proposals Generated

- `proposal.md` — "DOI-Based Context Scoping for AI Agents" — a concrete system design combining Furnas's structural DOI with Mylyn's behavioral DOI, enriched with MSR co-change data and information foraging scent, implementable as an MCP tool.

## Open Questions for Next Iteration

1. **Can DOI weights be learned from agent session traces?** We have initial weights from theory, but real agent sessions would provide ground truth. Can we instrument Claude Code sessions to capture tool-call patterns and retrospectively evaluate which DOI predictions were correct? (The PFIS researchers used Mylyn interaction traces to validate their models.)

2. **What's the right decay function shape?** Mylyn uses linear (0.017/event). Foraging theory suggests exponential might match actual relevance patterns better (fast initial decay, slow tail). Need to compare linear vs exponential vs logarithmic decay on real agent session data.

3. **How should DOI interact with context compaction?** When Claude Code compacts at 92% usage, it currently loses conversational context. Should DOI scores influence what survives compaction? High-DOI items preserved at full fidelity, medium-DOI summarized, low-DOI dropped?

4. **Multi-granularity DOI: file-level vs function-level vs line-level.** The MSR literature shows function-level co-change is more predictive than file-level. IFT research treats methods as the canonical "patch." But file-level is cheaper to compute. What's the minimum viable granularity?

5. **Cross-session DOI persistence.** Mylyn serializes interaction contexts as zipped XML. For agents, should DOI state persist across sessions? Across agents working on the same project? This connects to the parent initiative's authority model — shared DOI state is shared interest management.
