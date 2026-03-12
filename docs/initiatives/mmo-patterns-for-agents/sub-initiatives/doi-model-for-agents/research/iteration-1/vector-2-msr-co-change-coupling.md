# MSR Literature: Co-Change Coupling, Logical Coupling, and File Relevance Prediction

Research artifact for the DOI Model for Agent Context Scoping sub-initiative.

**Research question:** Which signals from git history best predict "this file is relevant to this task"?

**Date:** 2026-03-12

---

## 1. What Is Co-Change / Logical / Evolutionary Coupling?

All three terms refer to the same phenomenon: **two software artifacts that are frequently modified in the same commit (or temporal window) exhibit an implicit dependency**, whether or not any structural dependency exists between them.

**Terminology map** (used interchangeably across the literature):
- **Logical coupling** -- Gall et al. 1998 (the original term)
- **Evolutionary coupling** -- D'Ambros, Lanza, Zimmermann lineage
- **Change coupling** -- MSR conference community consensus term
- **Temporal coupling** -- Adam Tornhill / CodeScene (practitioner term)
- **Co-change coupling** -- general usage

**Formal definition:** If two artifacts `a` and `b` co-occur in commits more than expected by chance, they have change coupling. Strength is typically measured with association rule metrics:

- **Support(a,b)** = number of commits containing both `a` and `b`
- **Confidence(a->b)** = Support(a,b) / commits containing `a`
- **Degree of coupling** (CodeScene) = percentage of time files change together

The critical insight: **change coupling captures dependencies invisible to static analysis**. Two files may have no import relationship but always change together due to shared business logic, copy-paste patterns, or undocumented protocols. This is precisely the kind of hidden relevance signal a DOI model needs.

**Source:** [IME USP chapter on change coupling (PDF)](https://www.ime.usp.br/~gerosa/papers/changecoupling.pdf)

---

## 2. Seminal Papers

### Gall, Hajek, Jazayeri (1998) -- "Detection of Logical Coupling Based on Product Release History"

The foundational paper. Analyzed a telecom system's release history to find modules that changed together. First to demonstrate that co-change patterns reveal design dependencies invisible in architecture diagrams.

- **Source:** [ResearchGate](https://www.researchgate.net/publication/262388711_Detection_of_Logical_Coupling_Based_on_Product_Release_History)
- **Follow-up (2003):** Gall, Jazayeri, Krajewski -- "CVS release history data for detecting logical couplings" (IWPSE 2003)

### Zimmermann, Weissgerber, Diehl, Zeller (2004/2005) -- "Mining Version Histories to Guide Software Changes"

Built the **ROSE** tool (Reuse of Software Engineering knowledge). Applied the Apriori association rule mining algorithm to version control histories. The key contribution: **"Programmers who changed these functions also changed..."** -- like Amazon's recommendation engine, but for source code.

**Key results:**
- Top-3 suggestions contained a correct location **>70% of the time**
- Correctly predicted 26% of further files to change, 15% of exact functions/variables
- Average precision above **66%**
- Could suggest further locations in **82%** of all queries
- Only **2% false alarm rate**
- Best predictive power for *changes to existing code* (not new features)

- **Source:** [Zimmermann TSE 2005 (PDF)](https://thomas-zimmermann.com/publications/files/zimmermann-tse-2005.pdf)
- **Retrospective (2025):** [ResearchGate](https://www.researchgate.net/publication/388438662_A_Retrospective_on_Mining_Version_Histories_to_Guide_Software_Changes)

### Ying, Murphy, Ng, Chu-Carroll (2004) -- "Predicting Source Code Changes by Mining Change History"

Applied frequent pattern mining to Eclipse and Mozilla change histories. Evaluated on 20 real modification tasks.

**Key results:**
- Generated recommendations for 15 of 20 tasks
- Precision ~40%, Recall ~40% (but on a hard, fully-automated prediction task)
- Defined "limit precision" and "limit recall" metrics to account for inherent prediction ceilings
- Best tradeoff at min_support=5 (Mozilla) and min_support=10 (Eclipse)

- **Source:** [IEEE TSE 2004](https://ieeexplore.ieee.org/document/1324645/) | [PDF](https://www.cs.ubc.ca/~rng/psdepository/tse2004.pdf)

### D'Ambros, Lanza, Robbes (2009) -- "On the Relationship Between Change Coupling and Software Defects"

First study explicitly linking evolutionary coupling to defects. Analyzed 3 open-source systems.

**Key findings:**
- **Positive correlation between evolutionary coupling and defects**
- High-severity defects showed stronger correlation with change coupling
- Change coupling metrics (NOCC, SOC) correlated **more strongly with defects than traditional complexity metrics** like lines of code
- Change coupling information improved bug prediction models

- **Source:** [IEEE WCRE 2009](https://ieeexplore.ieee.org/document/5328803/) | [PDF](https://www.inf.usi.ch/lanza/Downloads/DAmb2009e.pdf) | [Slides](https://www.slideshare.net/slideshow/on-the-relationship-between-change-coupling-and-software-defects/2320035)

---

## 3. Predicting Which Files a Developer Needs

### Zimmermann ROSE Tool

As noted above: 70%+ accuracy in top-3 for guiding developers to related files. The foundational "change recommendation" tool.

### Rolfsnes, Moonen, Binkley -- "Predicting Relevance of Change Recommendations" (ASE 2017)

Used **random forest classifiers** trained on historical change recommendation outcomes. Key advance: instead of just using support/confidence from association rules, they trained ML models to predict *which recommendations would actually be relevant*.

**Results:**
- Random forest significantly outperformed traditional interestingness measures (support, confidence)
- Lower Brier scores (better calibrated probabilities)
- Superior precision-recall tradeoff
- Validated on 14 open-source systems + 2 industrial systems
- Consistent across both CO-CHANGE and TARMAQ mining algorithms

- **Source:** [EvolveIT](https://evolveit.bitbucket.io/publications/ase2017/) | [PhD Thesis](https://evolveit.bitbucket.io/publications/rolfsnes_thesis/thomas_rolfsnes_phdthesis.pdf)

### CITR -- "Consensus Task Interaction Trace Recommender" (EMSE 2024)

Aggregates multiple developers' interaction traces for similar tasks into a "consensus" navigation path. Recommends files to edit based on how previous developers navigated similar change tasks.

**Results:**
- Correctly recommended **73% of files to be edited** on average
- Outperformed MI (a state-of-the-art approach) by **31% higher recommendation accuracy**
- Increased developers' successful task completion rate

- **Source:** [Springer EMSE 2024](https://link.springer.com/article/10.1007/s10664-024-10528-7)

### Yadavally -- "From Seed to Scope: Reasoning to Identify Change Impact Sets" (ICSE 2026)

Cutting-edge: uses **LLMs with a plan-then-predict strategy** for change impact analysis. A "Planner LLM" constructs a Change Plan via Chain-of-Thought, then a "Reasoner" predicts impact.

**Results:**
- **Ripple** outperforms Athena by 39.7% F1-score (56.7% higher precision, 16.3% higher recall)
- Outperforms all existing top-down and bottom-up IA approaches by 39.7%-380.8% F1
- Successfully identifies at least one dependent location in **77.9%** of relevant instances
- Omitting change plans causes a **45.3% drop in F1**, proving that change intent matters
- Still misses 49.9% of impact locations on average (the problem is hard)

- **Source:** [PDF](https://aashishyadavally.github.io/assets/pdf/pub-icse2026-(2).pdf) | ICSE 2026, acceptance rate 21.9%

---

## 4. ML Models for File Relevance

### Association Rule Mining (Apriori, FP-Growth)

The dominant traditional approach. Used by ROSE, Ying et al., and most MSR co-change tools.

- **Strengths:** Interpretable, fast, well-understood parameters
- **Weaknesses:** Sensitive to min_support/min_confidence thresholds; commit practices (large "cleanup" commits) inject noise
- **Best for:** Precomputable batch analysis, cached recommendations

### Random Forest on Change History Features

Rolfsnes et al. (2017) showed random forests outperform raw association rules. Features likely include support, confidence, history length, recency, and file-level characteristics.

### Temporal Graph Neural Networks

Cioni et al. (2023) -- "To change or not to change? Modeling software system interactions using Temporal Graphs and Graph Neural Networks"

- Modeled files as nodes, co-changeability as edges, in a **temporal directed graph**
- Applied Temporal Graph Network (TGN) and LSTM to predict change propagation
- Tested on **15 software systems**
- **Outperformed traditional approaches** for predicting file impact
- **Source:** [ScienceDirect](https://www.sciencedirect.com/science/article/abs/pii/S0950584923002239)

### TARMAQ Algorithm

"Targeted Association Rule Mining" -- improves on ROSE and SVD for evolutionary coupling detection.

- **Applicable 100% of the time** (vs. ROSE's ~25%)
- **Orders of magnitude faster than SVD**
- Performs consistently better than both ROSE and SVD
- **Source:** [SANER 2016](https://ieeexplore.ieee.org/document/7476643/) | [EvolveIT](https://evolveit.bitbucket.io/publications/saner2016/) | [PDF](https://web-backend.simula.no/sites/default/files/publications/files/tarmaq_saner2016.pdf)

### Bug Localization (IR + History)

Bug localization research demonstrates multi-signal fusion works best:
- Text similarity between bug report and source files
- **Fixing frequency** of source files (how often a file appears in fix commits)
- **Change history** (recently changed files more likely to be relevant)
- **Stack traces** when available
- Combining all signals outperforms any single signal

- **Source:** [ICSE 2012](https://ieeexplore.ieee.org/document/6227210/) | [ScienceDirect - improved bug localization](https://www.sciencedirect.com/science/article/abs/pii/S0950584916303056)

---

## 5. Other Signals from Git History That Predict File Relevance

From the MSR literature, the following signals have demonstrated predictive power:

| Signal | What it measures | Predictive of | Weight hint |
|--------|-----------------|---------------|-------------|
| **Co-change frequency** | How often files change together | Task relevance, hidden dependencies | Primary signal |
| **Recency of change** | When file was last modified | Current development focus | High -- recent > stale |
| **Change frequency (churn)** | How often file changes in a window | Hotspot / active development area | Medium (40% in commit-prophet) |
| **Defect coupling** | Frequency in bug-fix commits | Risk and maintenance burden | High (50% in commit-prophet) |
| **Number of distinct authors** | Developer ownership breadth | Knowledge distribution, coordination need | Supplementary |
| **Fixing frequency** | How often file is part of a fix | Bug-proneness, code quality | High for defect prediction |
| **File age / stability** | Time since creation, change rate trend | Maturity and expected change | Low-medium |
| **Commit message semantics** | Keywords in commit messages | Type of change (bug, feature, refactor) | For filtering, not scoring |
| **Co-authorship** | Files changed by same developer | Implicit ownership coupling | Supplementary |

**Key insight from Agrawal (2020):** History age matters -- **older commits have less influence** in deriving dependencies than newer ones. This directly validates temporal decay in DOI formulas.

**Key insight from Rolfsnes et al.:** History length matters -- MAP increases with history length but **diminishes around 15,000 commits**. Beyond that, diminishing returns.

**Key insight from commit-prophet:** In practice, **~10% of files account for ~90% of bugs**. Historical instability predicts future instability better than current code quality.

- **Sources:**
  - [Agrawal 2020 - IET Software](https://ietresearch.onlinelibrary.wiley.com/doi/full/10.1049/iet-sen.2019.0368)
  - [Rolfsnes history length/age - EMSE](https://link.springer.com/article/10.1007/s10664-017-9588-z)
  - [commit-prophet (GitHub)](https://github.com/LakshmiSravyaVedantham/commit-prophet)
  - [Git History Analyzer (GitHub Actions)](https://github.com/marketplace/actions/git-history-analyzer-and-code-quality-predictor)

---

## 6. Computational Cost and Scalability

### The Core Operation

Computing pairwise co-change from git log requires:
1. Parse commits to extract changed file lists -- O(commits)
2. For each commit, enumerate file pairs -- O(files_per_commit^2) per commit
3. Aggregate pair counts across history -- O(total_pairs)

For a typical repo: ~10K commits, ~5 files per commit average = ~250K pair observations. This is trivially fast.

### Optimization Techniques

**Precomputation is the standard approach.** The idempotent property of analyses allows thorough caching -- each commit changes only parts of the source code, so incremental updates are cheap.

- **CodeScene defaults:** Ignore files with <10 revisions; ignore couples <50% strength; ignore commits touching >50 files (filters bulk reformats)
- **Incremental updates:** Only process new commits since last analysis
- **Bloom filters:** Git's changed-path Bloom filters accelerate file history queries
- **Parallelization:** Repository mining is inherently parallelizable (read-only, per-commit independent). Heseding et al. (MSR 2022) achieved **15.6x speedup** with pyrepositoryminer, **68.9x with 12 cores**

### Scalability Data Points

- **CodeScene:** Production tool analyzing repos at enterprise scale. Analysis times for PR-level impact: 7.4 to 22.4 seconds
- **TARMAQ:** Orders of magnitude faster than SVD for evolutionary coupling
- **Performance target for DOI:** <1 second for 10K-file repo is achievable with precomputed co-change matrices and incremental updates

**Verdict:** Co-change analysis is eminently precomputable and cacheable. The expensive part is the initial full-history scan; subsequent updates are O(new_commits * files_per_commit^2). Well within interactive speed for any reasonable repo size.

- **Sources:**
  - [Heseding et al. MSR 2022](https://dl.acm.org/doi/abs/10.1145/3524842.3528503) | [arXiv](https://arxiv.org/abs/2205.01351)
  - [CodeScene temporal coupling docs](https://docs.enterprise.codescene.io/versions/3.4.0/guides/technical/temporal-coupling.html)
  - [pyrepositoryminer (GitHub)](https://github.com/fabianhe/pyrepositoryminer)

---

## 7. Co-Change Coupling vs. Structural Coupling

This is directly relevant to DOI model signal selection: do we need both import graph distance AND co-change frequency, or does one subsume the other?

### Empirical Evidence

Geipel & Schweitzer (2012), Oliva & Gerosa (2015), and others studied the interplay:

- **Structurally coupled pairs usually have logical dependencies** (imports predict co-change)
- **But not all co-changed pairs are structurally linked** (co-change captures *more* than imports)
- **No strong linear correlation** between coupling strengths -- they measure different things
- **Combining semantic + structural coupling outperforms either alone** for change impact prediction
- Semantic coupling (text similarity) produced **better recall** than structural coupling alone

### Practical Implication for DOI

**Both signals are needed.** Structural coupling (import graph) captures architectural dependencies. Co-change coupling captures everything else: undocumented protocols, copy-paste patterns, business logic coupling, configuration dependencies. The signals are complementary, not redundant.

- **Sources:**
  - [ScienceDirect - structural vs logical coupling](https://www.sciencedirect.com/science/article/abs/pii/S016412121730184X)
  - [Springer - semantic coupling and co-change](https://link.springer.com/article/10.1007/s10664-017-9569-2)
  - [PDF - interplay structural/logical](https://bura.brunel.ac.uk/bitstream/2438/20225/1/FullText.pdf)
  - [Developers' perception of coupling](https://www.cs.wm.edu/~denys/pubs/ICSE'13-CouplingStudy-CAMERA.pdf)

---

## 8. Production Tools Using Co-Change Data

### CodeScene (Adam Tornhill)

The most mature production tool. Computes temporal coupling from git history. Used by enterprise customers.

- **Method:** For each file pair, measures percentage of shared commits
- **Output:** Coupling degree (0-100%), average revisions, sum-of-coupling per file
- **Thresholds:** Min 10 revisions, min 50% coupling strength, max 50 files per commit
- **Use cases:** Detect clones, evaluate test relevance, find architectural decay, reveal hidden dependencies
- **Source:** [CodeScene docs](https://docs.enterprise.codescene.io/versions/3.4.0/guides/technical/temporal-coupling.html) | [code-maat (GitHub)](https://github.com/adamtornhill/code-maat)

### Diggit (Chatley & Jones, 2018)

Automated code review tool that mines repository history and **generates review comments when co-changed files are missing from a PR**.

- **Source:** [IEEE SANER 2018](https://ieeexplore.ieee.org/document/8330261/) | [PDF](https://www.doc.ic.ac.uk/~rbc/papers/saner-diggit-18.pdf) | [Blog](https://blog.lawrencejones.dev/diggit-automated-code-review/)

### commit-prophet (2026)

Open-source tool combining churn (40%), defect coupling (50%), and co-change analysis (10%) into a 0-100 risk score per file.

- `coupling <file>` command shows co-changed files
- **Source:** [GitHub](https://github.com/LakshmiSravyaVedantham/commit-prophet) | [DEV.to](https://dev.to/lakshmisravyavedantham/commit-prophet-i-built-a-tool-that-predicts-buggy-files-using-git-history-35mk)

### Enhanced PR Review Tool (2024)

Combines call graph dependency analysis + history mining at PR granularity. Uses **PageRank on the call graph** for importance scoring. Alerts when co-changed files are missing from the changeset.

- Analysis time: 7.4 to 22.4 seconds
- User satisfaction: 3.66/5.0 for code review enhancement
- **Source:** [Springer EMSE 2024](https://link.springer.com/article/10.1007/s10664-024-10600-2)

### Hipikat (Cubranic et al., 2003)

Early recommendation system forming project memory from CVS + Bugzilla + mailing lists. Recommends artifacts relevant to a task for newcomers.

- **Source:** [ACM ICSE 2003](https://dl.acm.org/doi/10.5555/776816.776866)

### NavTracks (Singer et al., 2005)

Tracks developer navigation patterns and forms associations between files visited in short cycles. Recommends related files based on co-visitation.

- **Source:** [IEEE ICSM 2005](https://ieeexplore.ieee.org/document/1510128/) | [PDF](https://plg.uwaterloo.ca/~migod/846/papers/icsm05-navtracks.pdf)

---

## 9. Change Impact Analysis

Change impact analysis (CIA) is the MSR subfield predicting ripple effects of code changes. Three types:

1. **Static:** Analyze program structure (call graphs, dependency graphs) -- no execution needed
2. **Dynamic:** Instrument and execute to observe runtime dependencies
3. **History-based:** Mine version history for co-change patterns

### Key Findings from CIA Literature

- No single technique is sufficient; **hybrid approaches combining multiple traceability techniques** achieve the best results
- 21 of 33 studies in a 2024 systematic mapping used **Information Retrieval** approaches
- ML techniques (J48, Jrib, PART, NBTree, Bayesian models) have been applied to predict impact
- The ICSE 2022 SEIP track featured a tool that **machine-learns change histories** and directly outputs modification candidates for change requests

### The Ripple Approach (ICSE 2026)

As noted above, Yadavally's Ripple uses LLMs with change plans to predict impact. The "plan-then-predict" strategy -- where an LLM first reasons about *intent* before predicting *impact* -- achieved state-of-the-art results. This suggests our DOI model should incorporate task intent as a first-class signal, not just structural and historical features.

- **Sources:**
  - [Wikipedia - Change Impact Analysis](https://en.wikipedia.org/wiki/Change_impact_analysis)
  - [Systematic mapping study (ICSOFT 2024)](https://www.scitepress.org/Papers/2024/127582/127582.pdf)
  - [CIA for microservices (JSS 2024)](https://www.sciencedirect.com/science/article/abs/pii/S0164121224002851)
  - [ICSE 2022 SEIP tool](https://ieeexplore.ieee.org/document/9793550/)

---

## Implications for the DOI Model

### Signals to Include (ranked by evidence strength)

1. **Co-change coupling** (support/confidence from commit history) -- Primary signal. Captures hidden dependencies invisible to static analysis. Well-validated, fast to compute, precomputable.

2. **Structural coupling** (import graph distance) -- Complementary to co-change. Captures architectural dependencies. Together with co-change, covers both documented and undocumented dependencies.

3. **Recency of change** -- Strong predictor. Recent files are more relevant than stale ones. Validates temporal decay in DOI formula.

4. **Task intent / semantic similarity** -- The Ripple ICSE 2026 result (45% F1 drop without change plans) proves task intent is critical. Use embedding similarity between task description and file content.

5. **Change frequency (churn)** -- Identifies active development areas. 40% weight in commit-prophet's formula.

6. **Defect coupling** -- Files appearing in fix commits are high-risk, high-attention. 50% weight in commit-prophet. Most relevant for quality-focused tasks.

7. **Developer ownership** -- Supplementary. Files changed by the same developer tend to be relevant together.

### Weighting Guidance

- **commit-prophet's formula** (churn 40%, defect coupling 50%, co-change 10%) is optimized for **risk prediction**, not task relevance. For DOI, co-change should be weighted much higher.
- **Mylyn's DOI formula** `DOI(e) = A*(selections) + B*(edits) - C*(decay)` with A=1, B=0.2, C=0.1 provides the temporal decay template. Purge at -10.
- **Rolfsnes' finding:** Random forests outperform static thresholds. Consider ML-based weight tuning over hand-tuned coefficients.

### Decay Function

- **Mylyn:** Linear decay of -0.1 per time unit, purge at -10
- **MSR evidence:** Older commits have less predictive value (Agrawal 2020). Diminishing returns past ~15K commits (Rolfsnes).
- **Recommendation:** Exponential or linear decay on co-change signal, with a lookback window of ~6 months or 5,000 commits (whichever is smaller). Configurable.

### Computational Budget

- **Precompute co-change matrix** on repository clone/init. Incremental updates on each commit.
- **Cache structural coupling** (import graph). Invalidate on file change.
- **Compute task similarity** at query time (embedding comparison). Fast with pre-embedded file summaries.
- **Target:** <1 second for 10K files is achievable.

---

## Open Questions

1. **How to handle large "cleanup" commits** that touch 100+ files? CodeScene filters these (>50 files). But some legitimate changes are large. What threshold minimizes false coupling?

2. **Cross-repository coupling.** In monorepos, files across packages may co-change. CodeScene supports "Across Commits" analysis with different thresholds. How should the DOI model handle package boundaries?

3. **Temporal window for "same change."** CodeScene considers files in the same commit, same developer within a time window, or same ticket ID. Which definition best predicts task relevance?

4. **Cold start problem.** New repos or new files have no co-change history. The DOI model needs a fallback -- likely structural coupling + semantic similarity.

5. **Agent-specific signals.** Unlike human developers, AI agents don't have navigation patterns. What replaces Mylyn's selection/edit interaction events? Task description embedding? Planning step outputs?

6. **How predictive is co-change for agents vs. humans?** The MSR literature validates co-change for human developers. Agents may have different change patterns (more systematic, less exploratory). Needs empirical validation.

7. **Integration with LLM reasoning.** The Ripple result shows LLM reasoning about change intent dramatically improves impact prediction. Should the DOI model include an LLM "planning step" as a signal source?

---

## Sources

### Seminal Papers
- [Gall et al. 1998 - Detection of Logical Coupling Based on Product Release History](https://www.researchgate.net/publication/262388711_Detection_of_Logical_Coupling_Based_on_Product_Release_History)
- [Zimmermann et al. 2005 - Mining Version Histories to Guide Software Changes (PDF)](https://thomas-zimmermann.com/publications/files/zimmermann-tse-2005.pdf)
- [Ying et al. 2004 - Predicting Source Code Changes by Mining Change History](https://ieeexplore.ieee.org/document/1324645/)
- [D'Ambros et al. 2009 - On the Relationship Between Change Coupling and Software Defects](https://ieeexplore.ieee.org/document/5328803/)
- [Kersten & Murphy 2005 - Mylar: A Degree-of-Interest Model for IDEs](https://dl.acm.org/doi/10.1145/1052898.1052912)

### Key Research
- [Rolfsnes et al. 2017 - Predicting Relevance of Change Recommendations](https://evolveit.bitbucket.io/publications/ase2017/)
- [Rolfsnes et al. - History length/age effects on change impact](https://link.springer.com/article/10.1007/s10664-017-9588-z)
- [Rolfsnes PhD Thesis - Improving History-Based Change Recommendation](https://evolveit.bitbucket.io/publications/rolfsnes_thesis/thomas_rolfsnes_phdthesis.pdf)
- [Rolfsnes et al. - Practical Guidelines for Change Recommendation (ASE 2016)](https://ieeexplore.ieee.org/document/7582809/)
- [Yadavally 2026 - From Seed to Scope: Reasoning to Identify Change Impact Sets (ICSE 2026)](https://aashishyadavally.github.io/assets/pdf/pub-icse2026-(2).pdf)
- [TARMAQ - Generalizing Evolutionary Coupling Analysis (SANER 2016)](https://ieeexplore.ieee.org/document/7476643/)
- [Cioni et al. 2023 - Temporal Graph Neural Networks for Change Propagation](https://www.sciencedirect.com/science/article/abs/pii/S0950584923002239)
- [Etaiwi et al. 2024 - Consensus Task Interaction Trace Recommender](https://link.springer.com/article/10.1007/s10664-024-10528-7)
- [Agrawal 2020 - Predicting Co-Change Probability Using Historical Metadata](https://ietresearch.onlinelibrary.wiley.com/doi/full/10.1049/iet-sen.2019.0368)

### Coupling Comparison Studies
- [Oliva & Gerosa 2015 - Interplay Between Structural and Logical Coupling](https://www.sciencedirect.com/science/article/abs/pii/S016412121730184X)
- [Bavota et al. 2013 - Semantic Coupling and Co-Change](https://link.springer.com/article/10.1007/s10664-017-9569-2)
- [Poshyvanyk et al. - Conceptual Coupling Metrics (PDF)](https://www.cs.wm.edu/~denys/pubs/poshyvanyk-ConceptualCoupling.pdf)
- [Oliva & Gerosa - Full text (PDF)](https://bura.brunel.ac.uk/bitstream/2438/20225/1/FullText.pdf)
- [Poshyvanyk et al. - Developers' Perception of Coupling](https://www.cs.wm.edu/~denys/pubs/ICSE'13-CouplingStudy-CAMERA.pdf)

### Surveys and Chapters
- [IME USP Chapter - Change Coupling Between Software Artifacts (PDF)](https://www.ime.usp.br/~gerosa/papers/changecoupling.pdf)
- [Kagdi et al. 2007 - Survey/Taxonomy of MSR Approaches](https://onlinelibrary.wiley.com/doi/abs/10.1002/smr.344)
- [HandWiki - Mining Software Repositories](https://handwiki.org/wiki/Mining_software_repositories)
- [Wikipedia - Change Impact Analysis](https://en.wikipedia.org/wiki/Change_impact_analysis)
- [ScienceDirect - Change Coupling chapter](https://www.sciencedirect.com/science/article/abs/pii/B9780124115194000112)
- [Systematic Mapping Study on Impact Analysis (ICSOFT 2024)](https://www.scitepress.org/Papers/2024/127582/127582.pdf)
- [CIA for Microservices (JSS 2024)](https://www.sciencedirect.com/science/article/abs/pii/S0164121224002851)
- [Lehnert - Review of Software Change Impact Analysis](https://d-nb.info/1020114983/34)

### Tools and Production Systems
- [CodeScene Temporal Coupling Docs](https://docs.enterprise.codescene.io/versions/3.4.0/guides/technical/temporal-coupling.html)
- [code-maat (GitHub)](https://github.com/adamtornhill/code-maat)
- [commit-prophet (GitHub)](https://github.com/LakshmiSravyaVedantham/commit-prophet)
- [Diggit - Automated Code Review via Repository Mining](https://ieeexplore.ieee.org/document/8330261/)
- [Diggit blog post](https://blog.lawrencejones.dev/diggit-automated-code-review/)
- [Enhanced PR Review with PageRank (EMSE 2024)](https://link.springer.com/article/10.1007/s10664-024-10600-2)
- [Commit Guru - Analytics and Risk Prediction](http://commit.guru/)
- [Git History Analyzer (GitHub Actions)](https://github.com/marketplace/actions/git-history-analyzer-and-code-quality-predictor)
- [pyrepositoryminer - Efficient Git Mining](https://arxiv.org/abs/2205.01351)

### Mylyn / DOI Model
- [Kersten & Murphy 2005 - Mylar DOI Model (AOSD)](https://www.cs.ubc.ca/~murphy/papers/mylar/mylar-aosd20056.pdf)
- [Kersten & Murphy 2006 - Using Task Context (FSE)](https://dl.acm.org/doi/10.1145/1181775.1181777)
- [Mylyn Architecture (Eclipse Wiki)](https://wiki.eclipse.org/Mylyn/Architecture)
- [Mylyn Related Research Projects](https://wiki.eclipse.org/Mylyn/Related_Research_Projects)
- [MylynSDP - Process-Aware DOI Extension (2020)](https://journal-bcs.springeropen.com/articles/10.1186/s13173-020-00100-8)
- [Kersten Semantic Scholar](https://www.semanticscholar.org/paper/Mylar:-a-degree-of-interest-model-for-IDEs-Kersten-Murphy/7e19fe0cd5bd7730302b9ce4c046fb0712493dd5)

### Navigation and Information Foraging
- [NavTracks - Singer et al. 2005](https://ieeexplore.ieee.org/document/1510128/)
- [Hipikat - Cubranic et al. 2003](https://dl.acm.org/doi/10.5555/776816.776866)
- [Piorkowski et al. - Information Foraging for Code Navigation](https://dl.acm.org/doi/10.1145/1985793.1985911)
- [Piorkowski & Burnett - Foraging and Navigation Values](https://web.engr.oregonstate.edu/~burnett/Reprints/fse16-valueAndCosts.pdf)
- [Fleming et al. - Information Foraging for Debugging](https://dl.acm.org/doi/10.1145/2430545.2430551)

### Other Referenced Works
- [Barnett et al. 2015 - Automatic Decomposition of Code Review Changesets (Microsoft)](https://www.microsoft.com/en-us/research/wp-content/uploads/2016/02/barnett2015hdh.pdf)
- [Hassan & Holt 2005 - The Top Ten List: Dynamic Fault Prediction](https://www.researchgate.net/publication/4175861_The_top_ten_list_Dynamic_fault_prediction)
- [Robillard & Dagenais 2010 - Recommending Change Clusters](https://onlinelibrary.wiley.com/doi/abs/10.1002/smr.413)
- [Robillard et al. - Recommendation Systems in Software Engineering (book)](https://www.amazon.com/Recommendation-Systems-Software-Engineering-Robillard/dp/3642451349)
- [Zimmermann - Changes and Bugs (PDF)](https://thomas-zimmermann.com/publications/files/zimmermann-icsm-2009.pdf)
- [Zimmermann Retrospective 2025](https://www.researchgate.net/publication/388438662_A_Retrospective_on_Mining_Version_Histories_to_Guide_Software_Changes)
- [Tornhill - Code as a Crime Scene](https://adamtornhill.com/articles/crimescene/codeascrimescene.htm)
- [Tornhill - Your Code as a Crime Scene (Pragmatic)](https://pragprog.com/titles/atcrime/your-code-as-a-crime-scene/)
- [ICSE 2022 SEIP - Software Impact Analysis Tool](https://ieeexplore.ieee.org/document/9793550/)
- [Bug Localization via IR (ICSE 2012)](https://ieeexplore.ieee.org/document/6227210/)
- [Improved Bug Localization with Code Change Histories](https://www.sciencedirect.com/science/article/abs/pii/S0950584916303056)
- [JITGNN - Just-In-Time Bug Prediction (GNN)](https://www.sciencedirect.com/science/article/pii/S016412122400027X)
- [Code Revert Prediction with GNNs (J.P. Morgan)](https://arxiv.org/html/2403.09507v1)

### Raw Links (every URL encountered, including tangential)
- https://www.researchgate.net/publication/257559887_Integrating_conceptual_and_logical_couplings_for_change_impact_analysis_in_software
- https://link.springer.com/article/10.1007/s10664-012-9233-9
- https://www.cs.wm.edu/~denys/pubs/EMSE-MSR&IR-IA-Preprint.pdf
- https://www.researchgate.net/publication/221657065_The_evolution_radar_Visualizing_integrated_logical_coupling_information
- https://research.edgehill.ac.uk/files/20212497/JSS_2017___relationship_____coupling_and_cochange.pdf
- https://dblp.org/db/conf/msr/msr2006.html
- https://par.nsf.gov/servlets/purl/10199009
- https://pmc.ncbi.nlm.nih.gov/articles/PMC5808454/
- https://ieeexplore.ieee.org/document/8813262/
- https://ieeexplore.ieee.org/document/6613853/
- https://www.cs.drexel.edu/~yc349/papers/2011/ASE2011.pdf
- https://www.researchgate.net/publication/266657939_Impact_analysis_of_change_requests_on_source_code_based_on_interaction_and_commit_histories
- https://link.springer.com/article/10.1007/s11704-016-6023-3
- https://www.researchgate.net/publication/4342745_Mining_Software_Repositories_to_Study_Co-Evolution_of_Production_Test_Code
- https://link.springer.com/article/10.1007/s10664-020-09921-9
- https://bibbase.org/network/publication/gall-hajek-jazayeri-detectionoflogicalcouplingbasedonproductreleasehistory-1998
- https://www.inf.usi.ch/faculty/lanza/Downloads/DAmb06d.pdf
- https://turingmachine.org/~dmg/dchurch/
- https://link.springer.com/chapter/10.1007/978-3-642-11266-9_54
- https://link.springer.com/article/10.1007/s10664-009-9108-x
- https://link.springer.com/chapter/10.1007/11693017_31
- https://www.researchgate.net/publication/319285932_Understanding_the_Interplay_between_the_Logical_and_Structural_Coupling_of_Software_Classes
- https://bura.brunel.ac.uk/bitstream/2438/20225/1/FullText.pdf
- https://www.sciencedirect.com/science/article/abs/pii/S016412121600056X
- https://www.researchgate.net/publication/221200492_On_the_Relationship_Between_Change_Coupling_and_Software_Defects
- https://www.semanticscholar.org/paper/On-the-Relationship-Between-Change-Coupling-and-D'Ambros-Lanza/937b72f93fe2cb74549b08f1f984c0b9e723e580
- https://www.researchgate.net/publication/3188092_Predicting_Fault_Incidence_Using_Software_Change_History
- https://www.niss.org/research/technical-reports/predicting-fault-incidence-using-software-change-history-1998
- https://www.researchgate.net/publication/4279037_Mining_Software_Evolution_to_Predict_Refactoring
- https://dropbox.tech/machine-learning/content-suggestions-machine-learning
- https://github.com/andymeneely/git-churn
- https://earezki.com/ai-news/2026-02-24-commit-prophet-i-built-a-tool-that-predicts-buggy-files-using-git-history/
- https://embeddedartistry.com/blog/2018/06/21/gitnstats-a-git-history-analyzer-to-help-identify-code-hotspots/
- https://www.gitclear.com/measuring_code_activity_a_comprehensive_guide_for_the_data_driven
- https://javapro.io/2025/12/02/beyond-version-control-how-git-can-power-smarter-technical-decisions/
- https://sback.it/publications/icse2018seip.pdf
- https://read.engineerscodex.com/p/how-google-takes-the-pain-out-of
- https://www.oreilly.com/library/view/software-engineering-at/9781492082781/ch19.html
- https://queue.acm.org/detail.cfm?id=3292420
- https://cacm.acm.org/practice/codeflow/
- https://news.ycombinator.com/item?id=19096844
- https://www.cs.mcgill.ca/~martin/papers/rsse-c1.pdf
- https://www.sciencedirect.com/science/article/abs/pii/S0164121215002605
- https://link.springer.com/book/10.1007/978-3-642-45135-5
- https://www.mdpi.com/2073-8994/10/11/534
- https://www.researchgate.net/publication/328484732_A_Change_Recommendation_Approach_Using_Change_Patterns_of_a_Corresponding_Test_File
- https://link.springer.com/article/10.1007/s10664-021-09963-7
- https://dl.acm.org/doi/10.5555/2631387
- https://www.researchgate.net/publication/293636225_Generalizing_the_Analysis_of_Evolutionary_Coupling_for_Software_Change_Impact_Analysis
- https://www.academia.edu/21832632/Generalizing_the_Analysis_of_Evolutionary_Coupling_for_Software_Change_Impact_Analysis
- https://www.academia.edu/23811511/Improving_Change_Recommendation_using_Aggregated_Association_Rules
- https://link.springer.com/article/10.1007/s10664-017-9560-y
- https://www.semanticscholar.org/paper/0cf49cd8317a32210f57f4426cda97bf325a5144
- https://www.cs.kent.edu/~jmaletic/cs63902/Papers/Zimmermann04.pdf
- https://users.soe.ucsc.edu/~ejw/papers/MSR26s-zimmermann.pdf
- https://thomas-zimmermann.com/publications/files/sliwerski-wsr-2005.pdf
- https://dl.acm.org/doi/10.5555/998675.999460
- https://www.st.cs.uni-saarland.de/edu/empirical-se/2006/PDFs/e0429.pdf
- https://www.researchgate.net/publication/3188434_Predicting_source_code_changes_by_mining_change_history
- https://www.computer.org/csdl/journal/ts/2004/09/e0574/13rRUwInvgO
- https://open.library.ubc.ca/media/stream/pdf/831/1.0051617/1
- https://www.semanticscholar.org/paper/Predicting-source-code-changes-by-mining-revision-Ying/05722915f728156a411893132aa0ed442f12a91c
- https://www.researchgate.net/publication/247224158_Predicting_Source_Code_Changes_by_Mining_Revision_History
- https://dl.acm.org/doi/10.1145/2568225.2568317
- https://www.wikidata.org/wiki/Q110511983
- https://wires.onlinelibrary.wiley.com/doi/abs/10.1002/widm.1508
- https://www.researchgate.net/publication/278747524_Developers'_code_context_models_for_change_tasks
- https://link.springer.com/article/10.1007/s10664-024-10528-7
- https://www.researchgate.net/publication/3188457_How_effective_developers_investigate_source_code_An_exploratory_study
- https://www.cs.mcgill.ca/~martin/papers/tse2004.pdf
- https://dl.acm.org/doi/10.1145/1368088.1368154
- https://thesai.org/Downloads/Volume13No2/Paper_31-A_Review_on_Software_Bug_Localization_Techniques.pdf
- https://www.sciencegate.app/document/10.1109/icse.2012.6227210
- https://www.cs.fsu.edu/~serene/wp-content/uploads/2018/07/PID5473225.pdf
- https://www.mdpi.com/2079-9292/13/2/321
- https://www.mdpi.com/2504-2289/6/4/156
- https://mattlease.com/papers/saha-ase13.pdf
- https://ieeexplore.ieee.org/document/8959535/
- https://github.com/saltudelft/ml4se
- https://conf.researchr.org/track/icse-2026/icse-2026-research-track
- https://llm4code.github.io/
- https://protege.stanford.edu/conference/2006/submissions/abstracts/9.1_d'Entremont_adaptiveViz_1_column.pdf
- https://slidetodoc.com/mylar-a-degreeofinterest-model-for-ides-mik-kersten/
- https://www.researchgate.net/publication/221014736_Mylar_A_degree-of-interest_model_for_IDEs
- https://dl.acm.org/doi/10.1145/1052898.1052912
- https://www.semanticscholar.org/paper/Using-task-context-to-improve-programmer-Kersten-Murphy/02d3872f241cdf34504e9dece7ad8daeb279a585
- https://wiki.eclipse.org/Mylyn/Integrator_Reference
- https://help.eclipse.org/latest/topic/org.eclipse.mylyn.help.ui/Mylyn/FAQ/Task-Focused-UI.html
- https://wiki.eclipse.org/Mylyn/FAQ
- https://people.cs.vt.edu/~gback/eclipse/configuration/org.eclipse.osgi/bundles/171/1/.cp/doc/overview.html
- https://wiki.eclipse.org/Mylyn/Architecture
- https://wiki.eclipse.org/Mylyn/Contributor_Reference
- https://www.vogella.com/tutorials/Mylyn/article.html
- https://wiki.eclipse.org/Mylyn/Extensions
- https://en.wikipedia.org/wiki/Task-focused_interface
- https://piorkowski.net/papers/FutureCSD-CSCW12.pdf
- https://web.engr.oregonstate.edu/~burnett/Reprints/TR.IBM-infoforage-24783.pdf
- https://apps.dtic.mil/sti/tr/pdf/ADA579505.pdf
- https://www.researchgate.net/publication/224207516_How_Programmers_Debug_Revisited_An_Information_Foraging_Theory_Perspective
- https://dl.acm.org/doi/pdf/10.1145/3524842.3528503
- https://github.blog/open-source/git/gits-database-internals-v-scalability/
- https://wellarchitected.github.com/library/architecture/recommendations/scaling-git-repositories/
- https://devblogs.microsoft.com/bharry/scaling-git-and-some-back-story/
- https://www.cs.loyola.edu/~binkley/papers/scam16-history-exploration.pdf
- https://leonmoonen.com/research/news/
- https://www.mn.uio.no/ifi/forskning/aktuelt/arrangementer/disputaser/2017/rolfsnes.html
- https://conf.researchr.org/details/msr-2022/msr-2022-data-showcase/31/Tooling-for-Time-and-Space-efficient-git-Repository-Mining
- https://www.researchgate.net/publication/360353767_Tooling_for_Time-_and_Space-efficient_git_Repository_Mining
- https://www.semanticscholar.org/paper/07a0b03e12e1dcd3066342228a96cb6d30938e5c
- https://dblp.uni-trier.de/rec/conf/msr/HesedingSD22.html
- https://ieeexplore.ieee.org/document/9796175/
- https://www.computer.org/csdl/proceedings-article/msr/2022/930300a413/1Eo600NUTMQ
- https://www.infoq.com/news/2026/03/agents-context-file-value-review/
- https://arxiv.org/abs/2602.11988
- https://agents.md/
- https://datalakehousehub.com/blog/2026-03-context-management-vscode-llm-plugins/
- https://eclipsesource.com/blogs/2025/11/20/mastering-project-context-files-for-ai-coding-agents/
- https://www.scirp.org/reference/referencespapers?referenceid=1183297
- https://dl.acm.org/doi/10.1145/1083142.1083159
- https://link.springer.com/article/10.1007/s10664-013-9273-9
- https://link.springer.com/article/10.1007/s11219-010-9103-x
- https://www.ias.ac.in/article/fulltext/sadh/048/0095
- https://dl.acm.org/doi/10.1145/3674805.3686668
- https://www.researchgate.net/publication/360834697_SBHDetector
- https://www.researchgate.net/publication/228728673_Future_Trends_in_Software_Evolution_Metrics
- https://www.researchgate.net/publication/299999005
- https://www.researchgate.net/publication/283802354
- https://www.researchgate.net/publication/328735364
- https://www.researchgate.net/publication/4104992_Predicting_change_propagation_in_software_systems
- https://dl.acm.org/doi/abs/10.1145/3524842.3528503
- https://onlinelibrary.wiley.com/doi/full/10.1002/smr.1842
- https://www.researchgate.net/publication/266661758_The_effect_of_evolutionary_coupling_on_software_defects_An_industrial_case_study_on_a_legacy_system
- https://d-nb.info/1364579286/34
- https://www.researchgate.net/publication/388931222_Enhanced_code_reviews_using_pull_request_based_change_impact_analysis
- https://www.researchgate.net/publication/324256921_Diggit_Automated_code_review_via_software_repository_mining
- https://www.doc.ic.ac.uk/~rbc/papers/saner-diggit-18.pdf
- https://github.com/jrfaller/diggit
- https://github.com/adamtornhill/code-maat/blob/master/src/code_maat/analysis/sum_of_coupling.clj
- https://github.com/mathpunk/code-maat
- https://sourceforge.net/projects/code-maat.mirror/
- https://countless-integers.github.io/development/2016/06/13/takeaways-from-your-code-as-a-crime-scene-by-adam-tornhill.html
- https://github.com/MaibornWolff/codecharta/issues/622
- https://www.r-5.org/files/books/computers/dev-teams/trenches/Adam_Tornhill-Your_Code_as_a_Crime_Scene-EN.pdf
- https://www.amazon.com/Your-Code-Crime-Scene-Bottlenecks/dp/1680500384
- https://pragprog.com/titles/atcrime2/your-code-as-a-crime-scene-second-edition/
- https://www.adamtornhill.com/
- https://www.amazon.com/Your-Code-Crime-Scene-Second/dp/B0CSJR386C
- https://www.adamtornhill.com/code/crimescenetools.htm
- https://github.com/islomar/your-code-as-a-crime-scene
- https://www.goodreads.com/book/show/23627482-your-code-as-a-crime-scene
- https://www.ptidej.net/downloads/replications/emse22a/
- https://www.researchgate.net/publication/4175856_NavTracks_supporting_navigation_in_software_maintenance
- https://plg.uwaterloo.ca/~migod/846/papers/icsm05-navtracks.pdf
- https://www.semanticscholar.org/paper/NavTracks:-supporting-navigation-in-software-Singer-Elves/b3a8adf751b6018045d3340020ad30ddd24ba2dd
- https://dl.acm.org/doi/abs/10.1109/WPC.2005.25
- https://link.springer.com/chapter/10.1007/978-3-540-69052-8_20
- https://www.researchgate.net/publication/4175861_The_top_ten_list_Dynamic_fault_prediction
- https://www.academia.edu/3780933/The_Top_Ten_List_Dynamic_Fault_Prediction
- https://ieeexplore.ieee.org/document/1510122/
- https://research.google/blog/resolving-code-review-comments-with-ml/
- https://www.researchgate.net/publication/285790203_Developer_Profiles_for_Recommendation_Systems
- https://www.semanticscholar.org/paper/Chapter-8-Developer-Profiles-for-Recommendation-Ying-Robillard/9adb3e26dac0d00868235cd01e0812dfa60b3b54
- https://spectrum.ieee.org/meet-the-bots-that-review-and-write-snippets-of-facebooks-code
- https://engineering.fb.com/developer-tools/finding-and-fixing-software-bugs-automatically-with-sapfix-and-sapienz
- https://link.springer.com/chapter/10.1007/978-3-319-99241-9_1
- https://github.com/facebookarchive/mention-bot
- https://d-nb.info/1020114983/34
- https://www.sciencedirect.com/science/article/abs/pii/S0164121224002851
- https://studenttheses.uu.nl/bitstream/handle/20.500.12932/43319/Niels_Thesis___V1_1-1.pdf
- https://www.sciencedirect.com/science/article/abs/pii/S016412122030282X
- https://zhang-sai.github.io/pdf/li-stvr12.pdf
- https://dl.acm.org/doi/pdf/10.1145/3510457.3519017
- https://conf.researchr.org/details/icse-2022/icse-2022-seip---software-engineering-in-practice/25/A-Software-Impact-Analysis-Tool-based-on-Change-History-Learning-and-its-Evaluation
- https://ieeexplore.ieee.org/iel8/11153088/11153089/11153170.pdf
- https://arxiv.org/html/2310.12289
- https://ieeexplore.ieee.org/document/8009936/
- https://arxiv.org/abs/1802.04986
- https://arxiv.org/pdf/1802.00921
- https://www.sciencedirect.com/science/article/pii/S016412122400027X
- https://arxiv.org/html/2403.09507v1
- https://jun-zeng.github.io/file/tailor_paper.pdf
- https://mdpi.com/2073-8994/13/3/406/html
- https://chapering.github.io/pubs/fse24haoran.pdf
- https://arxiv.org/pdf/2408.05704
