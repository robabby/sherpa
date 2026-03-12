# Information Foraging Theory and Developer Navigation

**Research iteration:** 1
**Date:** 2026-03-12
**Focus:** How information foraging theory explains code navigation, and how it connects to Mylyn and AI agent tool-call patterns

---

## Key Discoveries

### 1. Information Foraging Theory: Core Framework

Information Foraging Theory (IFT) was developed by **Peter Pirolli and Stuart Card** at Xerox PARC in the late 1990s. Published as "Information Foraging" in Psychological Review (1999). The theory adapts **optimal foraging theory** from behavioral ecology to explain how humans seek information.

- **Core premise:** People are "informavores" who adapt their information-seeking strategies to maximize the rate of gaining valuable information per unit cost, analogous to how animals optimize energy intake while foraging for food. ([Pirolli & Card 1999](https://psycnet.apa.org/record/1999-11924-001))
- **Rate of gain = Information value / Cost of obtaining it.** Foragers try to maximize this ratio. ([NN/g summary](https://www.nngroup.com/articles/information-foraging/))

The theory has four interlocking models:

**Information Scent** — The imperfect perception of the value, cost, or access path of information sources, obtained from proximal cues (link labels, titles, snippets, icons). Scent is what lets a forager predict whether following a path will lead to useful information *before* actually traversing it. Scent is subjective: the same source can have high scent for one goal and zero scent for another. ([NN/g](https://www.nngroup.com/articles/information-scent/))

**Information Patches** — Discrete localities that contain information features. In web foraging, a patch is a website or page. In code, a patch is a method, file, or view containing source code. A forager's time is split between **within-patch** activities (extracting information from the current patch) and **between-patch** activities (navigating to the next patch). ([Pirolli & Card 1999](https://act-r.psy.cmu.edu/wordpress/wp-content/uploads/2012/12/280uir-1999-05-pirolli.pdf))

**Information Diet** — Which information items are worth pursuing at all. Analogous to an animal deciding which prey types to include in its diet. Each item type has a *profitability* = value / processing-time. Items are included in the diet in decreasing order of profitability until adding the next type would lower the overall rate of gain. Diet breadth narrows when high-value information is plentiful and widens when it is scarce. ([IxDF](https://ixdf.org/literature/book/the-glossary-of-human-computer-interaction/information-foraging-theory))

**Patch Model (Marginal Value Theorem)** — A forager should leave the current patch when the marginal rate of gain within it drops to the average rate of gain across the entire environment. From Charnov (1976): "leave when the instantaneous rate of return equals the average habitat rate." This means: (a) foragers stay longer in richer patches, (b) foragers leave sooner when patches are close together (low travel cost), (c) foragers stay longer when inter-patch travel is expensive. ([Wikipedia: Marginal Value Theorem](https://en.wikipedia.org/wiki/Marginal_value_theorem), [NN/g](https://www.nngroup.com/articles/information-foraging/))

**Enrichment** — Adaptive behaviors or interactions that restructure the environment to improve foraging efficiency. Behavioral enrichments are learned scanning patterns. Interaction enrichments require active effort: refining search queries, bookmarking, rearranging windows, using keyboard shortcuts. Tools that reduce between-patch navigation cost or increase within-patch information density are enrichments. ([NN/g](https://www.nngroup.com/articles/information-foraging/), [Henley blog](https://austinhenley.com/blog/informationforaging.html))

### 2. Information Foraging Applied to Software Engineering

A research group spanning **Oregon State University, IBM Research, University of Memphis, and CMU** (Lawrance, Burnett, Piorkowski, Fleming, Scaffidi, Ko, Henley, Kwan, Bellamy) systematically applied IFT to programmer behavior from ~2008-2020.

**Key mapping of IFT concepts to code:**

| IFT Concept | Code Equivalent | Source |
|-------------|----------------|--------|
| Predator | Developer | [Lawrance et al. 2013](https://web.engr.oregonstate.edu/~burnett/Reprints/TSE-IFT-2013-asprinted.pdf) |
| Prey | Bug location, feature implementation site, relevant code | " |
| Patches | Methods/functions, files, IDE views, web pages, debugger output | [Fleming et al. 2013](https://dl.acm.org/doi/10.1145/2430545.2430551) |
| Proximal cues | Identifiers (method names, variable names), comments, type signatures, visible code | [Lawrance et al. 2013](https://www.cs.memphis.edu/~sdf/publications/Lawrance_et_al_TSE_Preprint_2010.pdf) |
| Distal cues | Bug report text, task description, feature request | " |
| Information scent | Semantic similarity between cue words and goal description | " |
| Topology | Call graph, type hierarchy, file structure, IDE navigation affordances (go-to-definition, find-references) | " |
| Between-patch | Navigating between methods/files (scrolling, clicking, searching) | [Piorkowski et al. 2016](https://dl.acm.org/doi/10.1145/2950290.2950302) |
| Within-patch | Reading and comprehending code within a single method/file | " |
| Enrichment | Rearranging IDE layout, bookmarking, using search, setting breakpoints | [Henley blog](https://austinhenley.com/blog/informationforaging.html) |

**Critical finding: developers spend 35-50% of their time navigating** between code locations during maintenance tasks, not reading or editing code. ([Ko et al. 2006](https://ieeexplore.ieee.org/document/4016573/), [Piorkowski et al. 2016](https://dl.acm.org/doi/10.1145/2950290.2950302))

### 3. What Is "Information Scent" in Code?

Information scent in a codebase is the set of textual and structural signals that let a developer predict whether a particular file, method, or code element is relevant to their current task *before fully reading it*.

**What constitutes scent:**
- **Identifiers** (method names, class names, variable names) — the strongest scent signal. Developers look mainly at method names, not class names. ([Eye tracking studies](https://www.researchgate.net/publication/346358689_Eyes_on_Code_A_Study_on_Developers_Code_Navigation_Strategies))
- **Comments and documentation** — secondary scent signal
- **Type information** — parameter types, return types hint at what a method does
- **Structural position** — where in the call graph or type hierarchy an element sits
- **File names and directory structure** — coarse-grained scent for initial navigation

**How scent is computed (in PFIS):** Word similarity between the task description (e.g., bug report text) and the proximal cues in source code, using **cosine similarity on TF-IDF vectors**. Scent of a method = textual similarity between method's identifiers/comments and the bug report. ([Lawrance et al.](https://www.cs.memphis.edu/~sdf/publications/Lawrance_et_al_TSE_Preprint_2010.pdf))

**The vocabulary problem** is critical here: Furnas (1987) showed that random pairs of people use the same word for an object only 10-20% of the time. This means code identifiers frequently mismatch the terms developers (or agents) would search for. ([Furnas et al. 1987](https://dl.acm.org/doi/10.1145/32206.32212))

**Developers read selectively:** Eye-tracking shows developers focus on only ~32% of methods relevant to a change task, and read small fractions of method bodies rather than comprehending whole methods. ([Eye tracking research](https://www.researchgate.net/publication/346358689_Eyes_on_Code_A_Study_on_Developers_Code_Navigation_Strategies))

### 4. The PFIS Model (Programmer Flow by Information Scent)

PFIS is an executable model that predicts where programmers will navigate during maintenance tasks. Developed by Lawrance, Burnett et al.

**How PFIS works:**
1. **Gather topology** — Extract the call graph and navigation links between methods/files
2. **Compute cue scent** — For each method, compute TF-IDF cosine similarity between its identifiers/comments and the bug report text
3. **Spreading activation** — Propagate scent through the topology using spreading activation (like PageRank-style propagation), so methods reachable from high-scent methods also receive indirect scent
4. **Predict navigation** — Simulate navigation by always moving toward the highest-scent reachable method

**Key results:**
- PFIS predicts programmer navigation better than the navigation log of a *second programmer* working on the same bug — i.e., the model is more consistent than individual human variability. ([Lawrance et al. 2013](https://web.engr.oregonstate.edu/~burnett/Reprints/TSE-IFT-2013-asprinted.pdf))
- Proximal scent + topology was better at predicting navigation than distal scent alone (just matching against the bug report). ([Piorkowski et al.](https://www.researchgate.net/publication/220818424_Modeling_programmer_navigation_A_head-to-head_empirical_evaluation_of_predictive_models))
- Models perform best when they account for **recency** (how recently a developer visited code) and **spatial proximity** (methods near each other in the file). ([Piorkowski 2011](https://ieeexplore.ieee.org/document/6070387/))

**PFIS evolution:**
- **PFIS** — Original model, static goals
- **PFIS2** — Reactive model accounting for evolving foraging goals as developers learn more during debugging
- **PFIS3** — Bug-fixed refinement of PFIS2 ([GitHub: IFT-SE/pfis3](https://github.com/IFT-SE/pfis3))
- **PFIS-V** — Models foraging among code variants (e.g., Stack Overflow examples); up to 25% more accurate than PFIS3 ([IBM Research](https://research.ibm.com/publications/pfis-v-modeling-foraging-behavior-in-the-presence-of-variants))

### 5. How Developers Deviate from Optimal Foraging

**Piorkowski et al. (FSE 2016)** conducted the definitive study on this:
- **Over 50% of developers' navigation choices produced less value than predicted**
- **Nearly 40% of navigations cost more than predicted**
- Developers systematically overestimate the value and underestimate the cost of foraging
- This means developers are *suboptimal* foragers — they follow scent trails that lead nowhere more often than they expect

([Piorkowski et al. 2016](https://dl.acm.org/doi/10.1145/2950290.2950302), [Henley summary](https://austinhenley.com/blog/informationforaging.html))

**Ko et al. (2006)** found complementary results:
- Developers based searches on "limited and misrepresentative cues" — identifiers that appeared relevant but led to wrong code
- Only half of searches returned task-relevant code
- When developers found relevant code, they followed its dependencies (incoming and outgoing), often returning to re-navigate other dependency chains
- Eclipse's navigational tools caused "significant overhead"

([Ko et al. 2006](https://faculty.washington.edu/ajko/papers/Ko2006SeekRelateCollect.pdf))

**Sillito, Murphy, DeVolder (2006)** cataloged 44 types of questions programmers ask during software evolution, revealing that developers frequently need to answer complex cross-file questions that current tools poorly support. ([Sillito et al. 2006](https://dl.acm.org/doi/10.1145/1181775.1181779))

### 6. Connection Between Information Foraging and Mylyn's Task Context

**The explicit connection is thin but conceptually deep.** No single paper appears to formally bridge IFT and Mylyn's DOI model. However:

**Mylyn's DOI model** (Kersten & Murphy, 2005):
- DOI(e) = A * (e.selections) + B * (e.edits) - C * (e.decay)
- Weights: A=1.0 (selections), B=0.2 (edits), C=0.1 (decay)
- Elements gain interest through navigation and editing, lose interest through decay
- Task context = the set of elements whose DOI exceeds a threshold
- Result: 15% productivity improvement in edit ratio; up to 49% for individual developers

([Kersten & Murphy 2005](https://www.cs.ubc.ca/~murphy/papers/mylar/mylar-aosd20056.pdf), [Slides](https://slidetodoc.com/mylar-a-degreeofinterest-model-for-ides-mik-kersten/))

**Furnas's DOI formula** (which Mylyn extends):
- DOI(x, .) = API(x) - D(., x)
- API(x) = a priori importance (structural importance regardless of task)
- D(., x) = distance from current focus to element x
- Items displayed when DOI exceeds threshold

([Furnas 1986](https://dl.acm.org/doi/10.1145/22627.22342))

**The conceptual bridge:**
- IFT explains **why** developers visit certain code: they follow information scent
- Mylyn's DOI records **what** developers actually visited: interaction history
- Mylyn's task context is essentially an **empirical trace of foraging behavior** — it captures the patches a developer explored and how much time they spent within each
- The IFT researchers used Mylyn interaction traces in their studies to validate PFIS models, creating a direct empirical link
- Both frameworks agree: **recency and frequency of interaction** are the strongest predictors of relevance (PFIS finds recency critical; Mylyn's DOI is built on recency + frequency)

**Ko et al. (2006)** explicitly suggested "a new model of program understanding grounded in theories of information foraging" and proposed tools to help developers "seek, relate, and collect information" — which is essentially what Mylyn does. ([Ko et al. 2006](https://ieeexplore.ieee.org/document/4016573/))

### 7. AI Agent Tool-Call Patterns vs. Developer Navigation

**No published research directly applies IFT to AI agent tool-call patterns** (as of early 2026). This is a novel connection. However, the parallels are striking:

**Agent foraging behavior:**
- Agents navigate codebases using tools (grep, read, glob, search) analogous to how pre-IDE developers used find, cat, grep -R. ([Crawshaw 2025](https://crawshaw.io/blog/programming-with-agents))
- Agent tool calls follow a search tree pattern: broad search (glob/grep) -> narrow to candidate files -> read specific files -> extract relevant functions. This mirrors the **between-patch -> within-patch** structure of IFT.
- Agents face the same **vocabulary mismatch problem**: search queries must match identifier naming conventions in the codebase.

**Specific parallels:**

| IFT Concept | Developer Behavior | Agent Behavior |
|-------------|-------------------|----------------|
| Between-patch navigation | Opening files, go-to-definition, find-references | Grep, Glob, file search tool calls |
| Within-patch foraging | Reading a method, scanning a file | Read tool with specific line ranges |
| Information scent | Method name looks relevant to bug | Search result snippet matches query |
| Enrichment | Rearranging IDE, bookmarking | Maintaining a scratchpad, structured notes |
| Patch leaving (MVT) | "This file isn't helpful, try another" | Agent reads partial file, decides to search elsewhere |
| Diet breadth | Deciding which leads to pursue | Deciding which search results to read in full |

**Key differences:**
- Agents have **no visual scanning** — they cannot glance at a file structure the way a developer scans a package explorer. Every navigation costs a tool call.
- Agents have **no spatial memory** — developers remember "that function was near the top of the file" but agents must re-search.
- Agents face **context window limits** as an analog to working memory limits, but the constraint is harder — exceeded context is literally lost.
- Agent "scent" is computed through **semantic similarity in the LLM** rather than TF-IDF, which is both more powerful (understands synonyms, intent) and less predictable.

**SWE-grep** (Cognition, 2025) is the closest to applying foraging principles: trained via RL to execute up to 8 parallel searches per turn over max 4 turns, optimizing a reward function based on file and line retrieval F1 scores. This is essentially an optimized foraging agent — it learned when to search broadly vs. narrowly, analogous to diet breadth decisions. ([Cognition blog](https://cognition.ai/blog/swe-grep))

**Anthropic's context engineering guide** describes principles that map directly to IFT without naming it: "curating what will go into the limited context window" = managing the information diet; "just-in-time loading" = between-patch navigation; "metadata-driven exploration" (file names, sizes, timestamps as proxy for relevance) = following information scent; "compaction" = leaving depleted patches. ([Anthropic](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents))

### 8. What Makes Code Elements "Smell" Relevant?

Based on the IFT literature and eye-tracking studies:

**Strongest scent signals:**
1. **Method/function names** — developers look at method names more than class names; naming is the primary scent carrier
2. **Parameter and return types** — signal what a function operates on
3. **File/directory names** — coarse-grained scent for initial navigation
4. **Call relationships** — "this method calls that method" is a strong topology link
5. **Comments and docstrings** — secondary but significant when identifiers are opaque

**Weaker scent signals:**
6. Variable names within function bodies
7. Import/include statements
8. Structural position (top of file vs. bottom)
9. Code complexity/length as a signal

**Anti-scent (misleading signals):**
- Identifiers that share words with the task description but are semantically unrelated
- Generic names (handle, process, execute, run, do) that match everything
- Abbreviations and acronyms that hide meaning

### 9. What Constitutes a "Patch" in Code?

The IFT-SE literature defines patches at **method/function granularity** as the primary unit:

- **Methods/functions** are the canonical patch in all PFIS papers — "patches (e.g., methods)" is the standard formulation. ([Fleming et al. 2013](https://dl.acm.org/doi/10.1145/2430545.2430551))
- **Files** serve as a coarser-grained patch, especially for initial navigation
- **IDE views** (package explorer, debugger, console output, search results) are also patches — they are distinct information-containing regions a developer switches between
- **External resources** (Stack Overflow pages, documentation, bug tracker) are patches in the broader foraging environment
- **Classes** are rarely treated as patches directly — methods within classes are the operative unit

For AI agents, the patch concept maps naturally:
- A **file read** = entering a patch
- A **search result list** = a patch containing scent cues
- A **function/method body** = the canonical within-patch information unit
- A **directory listing** = a coarse patch providing scent for deeper navigation

### 10. Marginal Value Theorem and Context Window Management

The MVT states: leave a patch when the instantaneous rate of information gain drops to the average rate across the environment.

**Applied to context windows:**
- The context window is the agent's total foraging environment
- Each file/function read consumes context space (analogous to travel + exploitation time)
- **When to stop reading a file:** When the incremental information gained per additional line drops below what could be gained by searching for a new, potentially more relevant file
- **When to compact/summarize:** When the marginal value of keeping raw text in context drops below the value of freeing that space for new information
- **Diet breadth in context:** When high-value information is scarce (unfamiliar codebase), agents should broaden their diet (read more files, even lower-confidence ones). When high-value information is abundant (familiar patterns), agents should narrow their diet (only read the most relevant files).

**Specific implications:**
- An agent that reads an entire 500-line file when only 20 lines are relevant is overstaying in a depleted patch
- An agent that makes 15 sequential grep calls before reading any results is spending too much time in between-patch travel
- An agent that reads every search result fully instead of scanning snippets first has a suboptimal diet (including low-profitability items)
- **Sub-agent architectures** (as in Anthropic's guide) are an enrichment strategy: a specialized sub-agent forages extensively but returns only 1,000-2,000 tokens of distilled summary — this is patch compression

---

## Sources

### Foundational IFT

| Source | Description | URL |
|--------|-------------|-----|
| Pirolli & Card 1999 | Original IFT paper in Psychological Review | https://psycnet.apa.org/record/1999-11924-001 |
| Pirolli & Card 1999 (preprint) | UIR Technical Report version | https://act-r.psy.cmu.edu/wordpress/wp-content/uploads/2012/12/280uir-1999-05-pirolli.pdf |
| Pirolli & Card (ResearchGate) | Full-text PDF of Information Foraging | https://www.researchgate.net/profile/Peter-Pirolli/publication/229101074_Information_Foraging/links/02bfe50f098acc0ea8000000/Information-Foraging.pdf |
| Pirolli IFT Book Ch.1 | Information Foraging Theory book, Chapter 1 | https://www.peterpirolli.com/ewExternalFiles/31354_C01_UNCORRECTED_PROOF.pdf |
| Pirolli IFT Book (alt) | Chapter 1 alternate link | https://www.peterpirolli.com/Professional/About_Me_files/IFT%20Ch%201.pdf |
| NN/g: Information Foraging | Accessible summary of IFT for web | https://www.nngroup.com/articles/information-foraging/ |
| NN/g: Information Scent | How users decide where to go next | https://www.nngroup.com/articles/information-scent/ |
| IxDF: IFT Glossary | Concise definitions of IFT concepts | https://ixdf.org/literature/book/the-glossary-of-human-computer-interaction/information-foraging-theory |
| Wikipedia: Information Foraging | Overview with references | https://en.wikipedia.org/wiki/Information_foraging |
| Wikipedia: Marginal Value Theorem | Charnov's MVT explained | https://en.wikipedia.org/wiki/Marginal_value_theorem |
| Charnov 1976 MVT | Original MVT paper | https://paulseabright.com/wp-content/uploads/2014/08/Charnov-1976-TPB.pdf |
| Pirolli: Proximal Information Scent | Theory of using proximal scent to forage for distal info | http://act-r.psy.cmu.edu/wordpress/wp-content/uploads/2012/12/515uir-2004-07-pirolli.pdf |
| UCSD IxD Lecture: Search & IFT | Presentation slides on Pirolli & Card's IFT | https://d.ucsd.edu/IxD/research/2019/lectures/discussants/12-Search.pdf |
| Furnas 1986 (ACM) | Generalized Fisheye Views — original DOI formula | https://dl.acm.org/doi/10.1145/22627.22342 |
| Furnas 1986 (PDF) | Full paper PDF | https://cspages.ucalgary.ca/~saul/581/exer.eps/4furnas86.pdf |
| Furnas 1987 | The Vocabulary Problem in Human-System Communication | https://dl.acm.org/doi/10.1145/32206.32212 |
| Hornbaek 2011 | Fisheye Interfaces chapter (explains DOI formula) | http://www.kasperhornbaek.dk/papers/BookChapter2011_Fisheye.pdf |
| ScienceDirect: IFT Overview | Information Foraging overview topic page | https://www.sciencedirect.com/topics/computer-science/information-foraging |
| PhilPapers: Pirolli & Card | Reference entry | https://philpapers.org/rec/PIRIF |

### IFT Applied to Software Engineering

| Source | Description | URL |
|--------|-------------|-----|
| Lawrance et al. 2013 (TSE) | How Programmers Debug, Revisited: An IFT Perspective | https://web.engr.oregonstate.edu/~burnett/Reprints/TSE-IFT-2013-asprinted.pdf |
| Lawrance et al. (preprint) | Preprint of TSE paper | https://www.cs.memphis.edu/~sdf/publications/Lawrance_et_al_TSE_Preprint_2010.pdf |
| Fleming et al. 2013 (TOSEM) | IFT Perspective on Tools for Debugging, Refactoring, Reuse | https://dl.acm.org/doi/10.1145/2430545.2430551 |
| Fleming et al. 2013 (PDF) | IBM Research Report version | https://web.engr.oregonstate.edu/~burnett/Reprints/TR.IBM-infoforage-24783.pdf |
| Fleming et al. 2013 (Semantic Scholar) | Semantic Scholar page with citations | https://www.semanticscholar.org/paper/An-Information-Foraging-Theory-Perspective-on-Tools-Fleming-Scaffidi/cf889e0fbcfc185a338a98a2389733bdeb5b7c48 |
| Ko et al. 2006 | How Developers Seek, Relate, Collect Information | https://faculty.washington.edu/ajko/papers/Ko2006SeekRelateCollect.pdf |
| Ko et al. 2006 (IEEE) | IEEE Xplore entry | https://ieeexplore.ieee.org/document/4016573/ |
| Ko et al. 2006 (CMU) | CMU mirror | https://www.cs.cmu.edu/~NatProg/papers/Ko2006SeekRelateCollect.pdf |
| Ko et al. 2006 (Semantic Scholar) | Semantic Scholar page | https://www.semanticscholar.org/paper/An-Exploratory-Study-of-How-Developers-Seek,-and-Ko-Myers/dcabf248f34f14682e1dc68575bea59428ab8491 |
| Ko et al. 2006 (ResearchGate) | ResearchGate entry | https://www.researchgate.net/publication/3189706_An_Exploratory_Study_of_How_Developers_Seek_Relate_and_Collect_Relevant_Information_during_Software_Maintenance_Tasks |
| Piorkowski et al. 2016 (FSE) | Foraging and Navigations, Fundamentally | https://dl.acm.org/doi/10.1145/2950290.2950302 |
| Piorkowski et al. 2016 (PDF, Oregon State) | Full PDF | https://web.engr.oregonstate.edu/~burnett/Reprints/fse16-valueAndCosts.pdf |
| Piorkowski et al. 2016 (PDF, Memphis) | Memphis mirror | http://web0.cs.memphis.edu/~sdf/publications/Piorkowski_et_al_FSE_2016.pdf |
| Piorkowski et al. 2016 (digital commons) | Institutional repository | https://digitalcommons.memphis.edu/facpubs/2831/ |
| Piorkowski et al. 2011 | Modeling Programmer Navigation: Head-to-Head Evaluation | https://ieeexplore.ieee.org/document/6070387/ |
| Piorkowski et al. 2011 (ResearchGate) | ResearchGate entry | https://www.researchgate.net/publication/220818424_Modeling_programmer_navigation_A_head-to-head_empirical_evaluation_of_predictive_models |
| Piorkowski 2016 (empirical models) | Empirical Evaluation of Models of Programmer Navigation | https://ieeexplore.ieee.org/document/7816450/ |
| Lawrance et al. 2011 (ICSE NIER) | Information Foraging as Foundation for Code Navigation | https://dl.acm.org/doi/10.1145/1985793.1985911 |
| Niu et al. 2011 (ICSE NIER PDF) | Full PDF | https://homepages.uc.edu/~niunn/papers/ICSE11-NIER.pdf |
| Kwan 2012 | IFT for Collaborative Software Development | https://piorkowski.net/papers/FutureCSD-CSCW12.pdf |
| Piorkowski: Reactive IFT (CHI 2012) | Reactive Information Foraging | https://dl.acm.org/doi/10.1145/2207676.2208608 |
| PFIS3 (GitHub) | Source code for PFIS3 model | https://github.com/IFT-SE/pfis3 |
| PFIS-V (IBM Research) | Modeling foraging with variants | https://research.ibm.com/publications/pfis-v-modeling-foraging-behavior-in-the-presence-of-variants |
| IFT in Software Maintenance (DTIC) | NSF-funded technical report | https://apps.dtic.mil/sti/tr/pdf/ADA579505.pdf |
| Oregon State IFT project | IFT research group page | http://research.engr.oregonstate.edu/IFT/readonly.php?id=about |
| Sillito et al. 2006 | Questions Programmers Ask During Software Evolution | https://dl.acm.org/doi/10.1145/1181775.1181779 |
| Sillito et al. 2006 (PDF) | Full paper | https://groups.csail.mit.edu/pag/OLD/parg/sillito06questions.pdf |
| Sillito et al. 2006 (UBC) | UBC mirror | https://www.cs.ubc.ca/~murphy/papers/other/asking-answering-fse06.pdf |
| VCS IFT Perspective | Version Control: An Information Foraging Perspective | https://www.researchgate.net/publication/334769372_Version_Control_Systems_An_Information_Foraging_Perspective |
| VCS IFT (IEEE) | IEEE Xplore entry | https://ieeexplore.ieee.org/document/8778723/ |
| GitHub Foraging 2023 | Modeling Foraging Behavior in GitHub | https://link.springer.com/chapter/10.1007/978-3-031-35998-9_21 |
| GitHub Bug Seeking (IEEE) | Information Seeking for Bugs on GitHub: IFT Perspective | https://ieeexplore.ieee.org/document/9833144/ |
| Developer Gender Foraging | Foraging in Code Hosting: A Gender Perspective | https://link.springer.com/chapter/10.1007/978-3-031-35129-7_42 |
| End-User Programmer Foraging | How Web-Active End-Users Forage | https://www.intechopen.com/chapters/76664 |
| Socio-Technical Patches (IEEE) | Creating Socio-Technical Patches for IFT | https://ieeexplore.ieee.org/document/8506526/ |
| Socio-Technical Patches (blog) | Author's summary of socio-technical patches work | https://darius.cool/posts/2018-10-01-rstg |
| Kwan: Intro to IFT | Accessible introduction to IFT for software | https://irwinkwan.com/2013/06/13/an-introduction-to-information-foraging-theory/ |
| Fleming publications | Publication list of Scott D. Fleming | http://sdflem.github.io/publications.html |
| Piorkowski publications (DBLP) | DBLP publication list | https://dblp.org/pid/83/8771.html |

### Mylyn / DOI Model

| Source | Description | URL |
|--------|-------------|-----|
| Kersten & Murphy 2005 (AOSD) | Mylar: A Degree-of-Interest Model for IDEs | https://www.cs.ubc.ca/~murphy/papers/mylar/mylar-aosd20056.pdf |
| Kersten & Murphy 2005 (ACM) | ACM entry | https://dl.acm.org/doi/10.1145/1052898.1052912 |
| Kersten & Murphy 2005 (ResearchGate) | ResearchGate | https://www.researchgate.net/publication/221014736_Mylar_A_degree-of-interest_model_for_IDEs |
| Kersten & Murphy 2005 (slides) | Presentation slides with DOI formula details | https://slidetodoc.com/mylar-a-degreeofinterest-model-for-ides-mik-kersten/ |
| Kersten & Murphy 2006 (FSE) | Using Task Context to Improve Programmer Productivity | https://dl.acm.org/doi/10.1145/1181775.1181777 |
| Kersten & Murphy 2006 (ResearchGate) | ResearchGate entry | https://www.researchgate.net/publication/200085969_Using_task_context_to_improve_programmer_productivity |
| Kersten & Murphy 2006 (Semantic Scholar) | Semantic Scholar page | https://www.semanticscholar.org/paper/Using-task-context-to-improve-programmer-Kersten-Murphy/02d3872f241cdf34504e9dece7ad8daeb279a585 |
| Task-Focused Interface (Wikipedia) | Wikipedia overview | https://en.wikipedia.org/wiki/Task-focused_interface |
| Mylyn User Guide | Eclipse Mylyn task-focused UI documentation | https://help.eclipse.org/latest/topic/org.eclipse.mylyn.help.ui/Mylyn/User_Guide/Task-Focused-Interface.html |
| Mylyn FAQ | FAQ about task-focused UI | https://help.eclipse.org/latest/topic/org.eclipse.mylyn.help.ui/Mylyn/FAQ/Task-Focused-UI.html |
| Mylyn Slides (Kersten) | Presentation slides for Mylyn | https://slidetodoc.com/mylyn-the-taskfocused-interface-mik-kersten-tasktop-president-2/ |
| Mylyn Architecture | Eclipse Wiki architecture page | https://wiki.eclipse.org/Mylyn/Architecture |
| Mylyn Context project | Eclipse project page | https://projects.eclipse.org/projects/mylyn.context |
| Mylyn Integrator Reference | Technical reference | https://wiki.eclipse.org/Mylyn/Integrator_Reference |

### AI Agents and Code Navigation

| Source | Description | URL |
|--------|-------------|-----|
| Crawshaw 2025 | Programming with Agents | https://crawshaw.io/blog/programming-with-agents |
| Crawshaw 2026 | Eight More Months of Agents | https://crawshaw.io/blog/eight-more-months-of-agents |
| Anthropic: Context Engineering | Effective Context Engineering for AI Agents | https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents |
| Cognition: SWE-grep | RL for Multi-Turn Fast Context Retrieval | https://cognition.ai/blog/swe-grep |
| CodeNav (arXiv) | Using Real-World Codebases with LLM Agents | https://arxiv.org/html/2406.12276v1 |
| Henley: IFT blog | A Theory of How Developers Seek Information | https://austinhenley.com/blog/informationforaging.html |
| Henley: CodeRibbon | Navigate Your Code Like It's 2021 | https://austinhenley.com/blog/coderibbon.html |
| SWE-agent (NeurIPS) | Agent-Computer Interfaces for Automated SE | https://proceedings.neurips.cc/paper_files/paper/2024/file/5a7c947568c1b1328ccc5230172e1e7c-Paper-Conference.pdf |
| Mini-SWE-agent (arXiv) | 100-line agent analysis | https://arxiv.org/html/2511.02230v1 |
| SERA (Allen AI) | Soft-Verified Efficient Repository Agents | https://allenai.org/papers/opencodingagents |
| SWE-bench Pro (Scale) | Long-Horizon SE Tasks evaluation | https://static.scale.com/uploads/654197dc94d34f66c0f5184e/SWEAP_Eval_Scale%20(9).pdf |
| LoCoBench-Agent (arXiv) | Interactive Benchmark for LLM Agents | https://arxiv.org/pdf/2511.13998 |
| DigitalOcean: Context Management | Best Practices for Context Management | https://docs.digitalocean.com/products/gradient-ai-platform/concepts/context-management/ |
| Agentic Programming Survey | AI Agentic Programming: Survey | https://arxiv.org/html/2508.11126v2 |
| SWE-EVO (arXiv) | Benchmarking Coding Agents | https://www.arxiv.org/pdf/2512.18470v1 |
| Claude Code Tracing (Medium) | Analysis of Claude Code's agentic loop and tool use | https://medium.com/@georgesung/tracing-claude-codes-llm-traffic-agentic-loop-sub-agents-tool-use-prompts-7796941806f5 |
| ast-grep + AI | Using ast-grep with AI tools | https://ast-grep.github.io/advanced/prompting.html |
| osgrep | Semantic search for coding agents | https://www.scriptbyai.com/osgrep-semantic-search/ |
| MIT: AI Agent Search | Helping AI agents search for better LLM results | https://news.mit.edu/2026/helping-ai-agents-search-to-get-best-results-from-llms-0205 |

### Eye-Tracking and Developer Behavior

| Source | Description | URL |
|--------|-------------|-----|
| Eyes on Code | Study on Developer Code Navigation Strategies | https://www.researchgate.net/publication/346358689_Eyes_on_Code_A_Study_on_Developers_Code_Navigation_Strategies |
| Eye Tracking in SE (Springer) | Survey on eye tracking in software engineering | https://link.springer.com/article/10.1007/s42979-024-03045-3 |
| Tracing Developers' Eyes | Eyes and Interactions for Change Tasks | https://www.researchgate.net/publication/299868616_Tracing_Software_Developers'_Eyes_and_Interactions_for_Change_Tasks |
| Eye Movements in Code Review | ResearchGate entry | https://www.researchgate.net/publication/325479280_Eye_movements_in_code_review |
| Eye Tracking + IDE (traceability) | Towards Eye-Tracking Enabled IDE for Traceability | https://www.researchgate.net/publication/261452833_Towards_an_eye-tracking_enabled_IDE_for_software_traceability_tasks |
| Deja Vu (PMC) | Semantics-aware recording of eye tracking data for SE | https://pmc.ncbi.nlm.nih.gov/articles/PMC9486800/ |
| Eye Tracking Python Study | Exploratory study on debugging in different paradigms | https://arxiv.org/html/2511.07612 |
| LLM Code Validation (eye tracking) | Developer behavior validating LLM-generated code | https://arxiv.org/html/2405.16081v1 |
| How Developers Search for Code | FSE 2015 case study | https://dl.acm.org/doi/abs/10.1145/2786805.2786855 |
| Developers' Code Context Models | Code context models for change tasks | https://www.researchgate.net/publication/278747524_Developers'_code_context_models_for_change_tasks |
| Ko 2006 Retrospective (2025) | Retrospective on How Developers Seek Information | https://ieeexplore.ieee.org/document/10855640/ |
| Blog review of Ko 2006 | Webfoot blog review | http://blog.webfoot.com/2006/12/15/programmer-productivity-part-2/ |

---

## Raw Links

Every URL encountered during research, including ones not fully explored:

```
https://psycnet.apa.org/record/1999-11924-001
https://act-r.psy.cmu.edu/wordpress/wp-content/uploads/2012/12/280uir-1999-05-pirolli.pdf
https://www.researchgate.net/profile/Peter-Pirolli/publication/229101074_Information_Foraging/links/02bfe50f098acc0ea8000000/Information-Foraging.pdf
https://www.peterpirolli.com/ewExternalFiles/31354_C01_UNCORRECTED_PROOF.pdf
https://www.peterpirolli.com/Professional/About_Me_files/IFT%20Ch%201.pdf
https://www.nngroup.com/articles/information-foraging/
https://www.nngroup.com/articles/information-scent/
https://ixdf.org/literature/book/the-glossary-of-human-computer-interaction/information-foraging-theory
https://en.wikipedia.org/wiki/Information_foraging
https://en.wikipedia.org/wiki/Marginal_value_theorem
https://en.wikipedia.org/wiki/Optimal_foraging_theory
https://paulseabright.com/wp-content/uploads/2014/08/Charnov-1976-TPB.pdf
http://act-r.psy.cmu.edu/wordpress/wp-content/uploads/2012/12/515uir-2004-07-pirolli.pdf
https://d.ucsd.edu/IxD/research/2019/lectures/discussants/12-Search.pdf
https://apps.dtic.mil/sti/tr/pdf/AD1003600.pdf
https://dl.acm.org/doi/fullHtml/10.1145/223904.223911
https://dl.acm.org/doi/10.1145/22627.22342
https://dl.acm.org/doi/10.1145/22339.22342
https://cspages.ucalgary.ca/~saul/581/exer.eps/4furnas86.pdf
http://www.kasperhornbaek.dk/papers/BookChapter2011_Fisheye.pdf
https://dl.acm.org/doi/10.1145/32206.32212
https://dl.acm.org/doi/10.1145/1124772.1124921
https://www.researchgate.net/publication/221518115_A_fisheye_follow-up_further_reflections_on_focus_context
https://scispace.com/papers/generalized-fisheye-views-37sltdtdhq
https://idl.cs.washington.edu/files/2003-InterestEstimation-CHI.pdf
http://vis.stanford.edu/files/2003-InterestEstimation-CHI.pdf
https://web.engr.oregonstate.edu/~burnett/Reprints/TSE-IFT-2013-asprinted.pdf
https://www.cs.memphis.edu/~sdf/publications/Lawrance_et_al_TSE_Preprint_2010.pdf
https://web.engr.oregonstate.edu/~burnett/Reprints/TR.IBM-infoforage-24783.pdf
https://dl.acm.org/doi/10.1145/2430545.2430551
https://faculty.washington.edu/ajko/papers/Ko2006SeekRelateCollect.pdf
https://www.cs.cmu.edu/~NatProg/papers/Ko2006SeekRelateCollect.pdf
https://ieeexplore.ieee.org/document/4016573/
https://www.semanticscholar.org/paper/An-Exploratory-Study-of-How-Developers-Seek,-and-Ko-Myers/dcabf248f34f14682e1dc68575bea59428ab8491
https://www.researchgate.net/publication/3189706_An_Exploratory_Study_of_How_Developers_Seek_Relate_and_Collect_Relevant_Information_during_Software_Maintenance_Tasks
https://www.ptidej.net/seminars/2014/140404%20-%20Zephyrin%20Soh%20-%20An%20Exploratory%20Study%20of%20How%20Developers%20Seek,%20Relate,%20and%20Collect%20Relevant%20Information%20during%20Software%20Maintenance%20Tasks/Presentation.pdf
https://dl.acm.org/doi/10.1145/2950290.2950302
https://web.engr.oregonstate.edu/~burnett/Reprints/fse16-valueAndCosts.pdf
http://web0.cs.memphis.edu/~sdf/publications/Piorkowski_et_al_FSE_2016.pdf
https://digitalcommons.memphis.edu/facpubs/2831/
https://ieeexplore.ieee.org/document/6070387/
https://www.researchgate.net/publication/220818424_Modeling_programmer_navigation_A_head-to-head_empirical_evaluation_of_predictive_models
https://ieeexplore.ieee.org/document/7816450/
https://dl.acm.org/doi/10.1145/1985793.1985911
https://homepages.uc.edu/~niunn/papers/ICSE11-NIER.pdf
https://www.researchgate.net/publication/247931675_Information_foraging_as_a_foundation_for_code_navigation_NIER_track
https://www.researchgate.net/publication/221556161_Information_foraging_as_a_foundation_for_code_navigation
https://piorkowski.net/papers/FutureCSD-CSCW12.pdf
https://dl.acm.org/doi/10.1145/2207676.2208608
https://github.com/IFT-SE/pfis3
https://research.ibm.com/publications/pfis-v-modeling-foraging-behavior-in-the-presence-of-variants
https://apps.dtic.mil/sti/tr/pdf/ADA579505.pdf
http://research.engr.oregonstate.edu/IFT/readonly.php?id=about
http://research.engr.oregonstate.edu/ift/readonly.php?id=documentation_processing
https://dl.acm.org/doi/10.1145/1181775.1181779
https://groups.csail.mit.edu/pag/OLD/parg/sillito06questions.pdf
https://www.cs.ubc.ca/~murphy/papers/other/asking-answering-fse06.pdf
https://www.researchgate.net/publication/334769372_Version_Control_Systems_An_Information_Foraging_Perspective
https://ieeexplore.ieee.org/document/8778723/
https://link.springer.com/chapter/10.1007/978-3-031-35998-9_21
https://www.researchgate.net/publication/372228191_Modeling_Foraging_Behavior_in_GitHub
https://ieeexplore.ieee.org/document/9833144/
https://www.researchgate.net/publication/363485685_Information_Seeking_Behavior_for_Bugs_on_GitHub_An_Information_Foraging_Perspective
https://link.springer.com/chapter/10.1007/978-3-031-35129-7_42
https://www.intechopen.com/chapters/76664
https://ieeexplore.ieee.org/document/8506526/
https://darius.cool/posts/2018-10-01-rstg
https://irwinkwan.com/2013/06/13/an-introduction-to-information-foraging-theory/
https://irwinkwan.com/tag/information-foraging-theory/
http://sdflem.github.io/publications.html
https://dblp.org/pid/83/8771.html
https://www.cs.ubc.ca/~murphy/papers/mylar/mylar-aosd20056.pdf
https://dl.acm.org/doi/10.1145/1052898.1052912
https://www.researchgate.net/publication/221014736_Mylar_A_degree-of-interest_model_for_IDEs
https://slidetodoc.com/mylar-a-degreeofinterest-model-for-ides-mik-kersten/
https://dl.acm.org/doi/10.1145/1181775.1181777
https://www.researchgate.net/publication/200085969_Using_task_context_to_improve_programmer_productivity
https://www.semanticscholar.org/paper/Using-task-context-to-improve-programmer-Kersten-Murphy/02d3872f241cdf34504e9dece7ad8daeb279a585
https://www.semanticscholar.org/paper/Mylar:-a-degree-of-interest-model-for-IDEs-Kersten-Murphy/7e19fe0cd5bd7730302b9ce4c046fb0712493dd5
https://en.wikipedia.org/wiki/Task-focused_interface
https://help.eclipse.org/latest/topic/org.eclipse.mylyn.help.ui/Mylyn/User_Guide/Task-Focused-Interface.html
https://help.eclipse.org/latest/topic/org.eclipse.mylyn.help.ui/Mylyn/FAQ/Task-Focused-UI.html
https://wiki.eclipse.org/Mylyn/Architecture
https://wiki.eclipse.org/Mylyn/Integrator_Reference
https://projects.eclipse.org/projects/mylyn.context
https://slidetodoc.com/mylyn-the-taskfocused-interface-mik-kersten-tasktop-president-2/
https://people.cs.vt.edu/~gback/eclipse/configuration/org.eclipse.osgi/bundles/171/1/.cp/doc/overview.html
https://crawshaw.io/blog/programming-with-agents
https://crawshaw.io/blog/eight-more-months-of-agents
https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents
https://cognition.ai/blog/swe-grep
https://arxiv.org/html/2406.12276v1
https://austinhenley.com/blog/informationforaging.html
https://austinhenley.com/blog/coderibbon.html
https://proceedings.neurips.cc/paper_files/paper/2024/file/5a7c947568c1b1328ccc5230172e1e7c-Paper-Conference.pdf
https://arxiv.org/html/2511.02230v1
https://allenai.org/papers/opencodingagents
https://static.scale.com/uploads/654197dc94d34f66c0f5184e/SWEAP_Eval_Scale%20(9).pdf
https://arxiv.org/pdf/2511.13998
https://docs.digitalocean.com/products/gradient-ai-platform/concepts/context-management/
https://arxiv.org/html/2508.11126v2
https://www.arxiv.org/pdf/2512.18470v1
https://medium.com/@georgesung/tracing-claude-codes-llm-traffic-agentic-loop-sub-agents-tool-use-prompts-7796941806f5
https://ast-grep.github.io/advanced/prompting.html
https://www.scriptbyai.com/osgrep-semantic-search/
https://news.mit.edu/2026/helping-ai-agents-search-to-get-best-results-from-llms-0205
https://www.researchgate.net/publication/346358689_Eyes_on_Code_A_Study_on_Developers_Code_Navigation_Strategies
https://link.springer.com/article/10.1007/s42979-024-03045-3
https://www.researchgate.net/publication/299868616_Tracing_Software_Developers'_Eyes_and_Interactions_for_Change_Tasks
https://www.researchgate.net/publication/325479280_Eye_movements_in_code_review
https://www.researchgate.net/publication/261452833_Towards_an_eye-tracking_enabled_IDE_for_software_traceability_tasks
https://pmc.ncbi.nlm.nih.gov/articles/PMC9486800/
https://arxiv.org/html/2511.07612
https://arxiv.org/html/2405.16081v1
https://dl.acm.org/doi/abs/10.1145/2786805.2786855
https://www.researchgate.net/publication/278747524_Developers'_code_context_models_for_change_tasks
https://ieeexplore.ieee.org/document/10855640/
http://blog.webfoot.com/2006/12/15/programmer-productivity-part-2/
https://www.researchgate.net/publication/228963831_Information_scent_and_web_navigation_Theory_models_and_automated_usability_evaluation
https://www.researchgate.net/publication/266892527_Unifying_Software_Engineering_Methods_and_Tools_Principles_and_Patterns_from_Information_Foraging
https://www.researchgate.net/publication/245112641_A_theory_of_information_scent
https://dl.acm.org/doi/10.5555/2819366.2819375
https://www.researchgate.net/publication/325829341_Answering_the_requirements_traceability_questions
https://dl.acm.org/doi/10.5555/2819009.2819043
https://dl.acm.org/doi/10.1145/3290605.3300322
https://www.researchgate.net/publication/235350419_Focusing_knowledge_work_with_task_context
https://link.springer.com/chapter/10.1007/978-3-030-14931-4_4
https://www.researchgate.net/publication/268435939
https://www.academia.edu/34571832/Observing_Information_Foraging_Theory_in_GitHub_Users
http://joeylawrance.com/resume.pdf
https://www.researchgate.net/figure/Example-RSSOwl-source-code_fig3_221515010
https://link.springer.com/rwe/10.1007/978-0-387-39940-9_205
https://scholarworks.indianapolis.iu.edu/server/api/core/bitstreams/a4cf10ec-8968-4546-bb17-526a240d287e/content
https://github.com/SWE-agent/SWE-agent
https://github.com/SWE-agent/mini-swe-agent
https://www.swebench.com/
https://www.vals.ai/benchmarks/swebench
https://cognition.ai/blog/swe-1-5
https://docs.windsurf.com/context-awareness/fast-context
https://news.ycombinator.com/item?id=45607822
https://protege.stanford.edu/conference/2006/submissions/abstracts/9.1_d'Entremont_adaptiveViz_1_column.pdf
https://www.researchgate.net/publication/221560447_ABSTRACT_Questions_Programmers_Ask_During_Software_Evolution_Tasks
https://www.semanticscholar.org/paper/Asking-and-Answering-Questions-during-a-Programming-Sillito-Murphy/98cb9e2c4214f0a68bae57e5f5a8d5005fd3f908
https://olgabaysal.com/teaching/fall15/comp5900/slides/Talk2_Haifa.pdf
https://dl.acm.org/doi/10.1016/j.infsof.2012.09.001
https://vem2014.dcc.ufmg.br/lib/exe/fetch.php/129087_1.pdf
https://dl.acm.org/doi/10.1145/1985793.1985907
https://www.sciencedirect.com/science/article/abs/pii/S0164121216000881
https://www.researchgate.net/publication/229101074_Information_Foraging
https://dl.acm.org/doi/10.1145/365024.365325
https://oro.open.ac.uk/23502/1/ix024f-liu.pdf
https://pmc.ncbi.nlm.nih.gov/articles/PMC7148231/
https://www.interaction-design.org/literature/article/web-user-behaviour-directed-by-information-scent
https://informationr.net/ir/22-1/isic/isic1613.html
http://vis-ucb-maneesh.stanford.edu/papers/scented_widgets/2007-ScentedWidgets-InfoVis.pdf
https://link.springer.com/chapter/10.1007/978-3-642-39062-3_28
https://www.sciencedirect.com/topics/computer-science/information-foraging
https://enterprise-knowledge.com/what-is-information-scent-and-how-do-i-design-for-it/
https://www.optimizely.com/optimization-glossary/information-scent/
https://www.nngroup.com/videos/information-scent/
https://www.nngroup.com/articles/3-ia-mistakes/
https://www.steptwo.com.au/papers/kmc_informationscent/
https://vwo.com/glossary/information-scent/
https://www.uxtigers.com/post/information-scent
https://searchengineland.com/human-hardware-foraging-for-information-14648
https://pmc.ncbi.nlm.nih.gov/articles/PMC10996644/
https://pubmed.ncbi.nlm.nih.gov/38585964/
https://www.sciencedirect.com/science/article/abs/pii/S0278416516000210
https://www.biorxiv.org/content/10.1101/2024.03.30.587253v1.full
https://fiveable.me/animal-behavior/unit-6/patch-selection-marginal-theorem/study-guide/JnOy6JFefylOk6d8
https://academic.oup.com/beheco/article/12/1/71/392385
https://www.nature.com/articles/s41598-017-11763-3
https://www.pnas.org/doi/10.1073/pnas.2216524120
https://royalsocietypublishing.org/rsif/article/18/180/20210337/89925/Uncertainty-drives-deviations-in-normative
https://journals.plos.org/ploscompbiol/article?id=10.1371/journal.pcbi.1007060
https://www.nature.com/articles/s42003-024-06683-8
https://www.biorxiv.org/content/10.1101/2020.04.22.055558v1.full
https://pmc.ncbi.nlm.nih.gov/articles/PMC8426201/
https://academic.oup.com/scan/article/16/8/782/5813718
https://www.cell.com/trends/cognitive-sciences/fulltext/S1364-6613(23)00172-9
https://www.sciencedirect.com/science/article/pii/S1364661323001729
https://arxiv.org/html/2508.12752v1
https://techxplore.com/news/2025-12-ai-agents-results-large-language.html
https://ericmjl.github.io/blog/2025/12/10/productive-patterns-for-agent-assisted-programming/
https://dev.to/somedood/coding-agents-as-a-first-class-consideration-in-project-structures-2a6b
https://jtanruan.medium.com/context-engineering-in-llm-based-agents-d670d6b439bc
https://arxiv.org/html/2508.08322v1
https://github.com/rafska/awesome-local-llm
https://codingscape.com/blog/llms-with-largest-context-windows
https://redmonk.com/kholterhoff/2025/12/22/10-things-developers-want-from-their-agentic-ides-in-2025/
https://www.vogella.com/tutorials/Mylyn/article.html
https://www.infoq.com/news/2008/02/tasktop-10/
https://www.deepdyve.com/lp/acm/using-task-context-to-improve-programmer-productivity-XxCpsNTjqB
https://scilit.com/publications/f6bd202b9f71367a9016ba470ad19b6c
https://researchr.org/publication/KerstenM05
https://researchr.org/publication/KerstenM06
https://typeset.io/papers/using-task-context-to-improve-programmer-productivity-dl33rsums2
https://www.infona.pl/resource/bwmeta1.element.ieee-art-000004016573
```

---

## Implications for the DOI Model

Based on this research, here is how information foraging theory should inform the design of a DOI model for AI agents:

### 1. The DOI Model Should Capture Foraging Traces

Just as Mylyn builds task context from interaction history, an agent DOI model should build context from **tool-call traces**. Every grep, read, glob, and search is a foraging event. The sequence of tool calls IS the foraging trace.

- **Grep/search calls** = between-patch navigation (low DOI increment, broad scent-following)
- **File reads** = entering a patch (medium DOI increment)
- **Specific line-range reads** = within-patch foraging on high-interest elements (high DOI increment)
- **Edits** = highest DOI signal (analogous to Mylyn's edit weighting)

### 2. Scent Should Drive Context Inclusion

The DOI model should compute "scent" for code elements not yet in context, determining what to proactively load. Scent computation for agents:
- **Structural scent:** Elements connected to high-DOI elements via call graph, imports, type hierarchy
- **Textual scent:** Elements whose identifiers match the task description (TF-IDF or embedding similarity)
- **Co-change scent:** Elements that historically change together (from MSR data — covered in sibling research)
- **Recency scent:** Elements the agent recently viewed have higher scent

### 3. The Marginal Value Theorem Should Govern Context Window Management

The agent should leave a "patch" (stop reading a file) when:
- The incremental information gained per additional line drops below the average rate of gain from searching for new files
- Concretely: if the last N lines read contained no task-relevant identifiers or patterns, it is time to move on

The agent should compact/summarize context when:
- Older context entries have decayed below a threshold (like Mylyn's decay)
- The context window is approaching capacity and new high-scent information needs space

### 4. Patches Should Be Method-Granularity

Following the PFIS literature, the canonical patch for an agent DOI model should be the **function/method**, not the file. Files are coarse patches useful for initial navigation, but the working unit is the function.

### 5. Enrichment Strategies Should Be First-Class

The DOI model should support enrichment — actions that restructure the foraging environment:
- **Bookmarking:** Persistent references to key functions/files that survive context compaction
- **Index building:** Creating a local map of the codebase structure (like PFIS's topology)
- **Query refinement:** Using initial results to improve subsequent searches (like PFIS2's reactive goals)

### 6. Diet Breadth Should Adapt to Task Phase

- **Early exploration:** Broad diet — read many files, follow many leads (high-uncertainty foraging)
- **Focused implementation:** Narrow diet — only read files directly relevant to the change (low-uncertainty, exploit mode)
- **Debugging:** Reactive diet — scent trails evolve as hypotheses are tested and discarded (PFIS2 model)

### 7. The Vocabulary Problem Is the Central Challenge

Furnas's finding that people agree on terms only 10-20% of the time explains why agent grep searches often fail. The DOI model should:
- Use **semantic similarity** (embeddings) not just lexical matching for scent
- Maintain **synonym maps** built from the codebase's own naming conventions
- Weight **structural connections** (call graph, imports) equally with textual scent

---

## Open Questions

1. **Can PFIS's spreading-activation scent model be adapted for agent context selection?** PFIS propagates scent through the call graph using TF-IDF similarity. Could a similar model propagate "relevance" through a codebase graph to predict which files an agent should read next?

2. **What is the right decay function for agent context?** Mylyn uses linear decay (C * events_since_interaction). Should agent DOI use time-based decay, interaction-count decay, or information-theoretic decay (how much new information has arrived since)?

3. **How do you compute scent for an LLM agent?** PFIS uses TF-IDF cosine similarity. LLM agents have richer semantic understanding — can the LLM itself rate the "scent" of search results before fully reading them? This would be like a two-pass foraging strategy.

4. **What is the optimal patch granularity for agents?** PFIS uses methods. But agents often read whole files. Is method-level too fine for agents that process text sequentially? Or would AST-aware chunking (reading one function at a time) improve foraging efficiency?

5. **Can the 50% value-overprediction finding (Piorkowski 2016) be replicated for agents?** Do agents also systematically overestimate the value of navigation choices? If so, can the DOI model correct for this bias?

6. **How should co-change coupling data integrate with scent?** MSR data (files that change together) provides a different kind of "topology" than the call graph. The DOI model might need multiple topology layers.

7. **Is there a formal connection between IFT's rate-of-gain optimization and context window token efficiency?** Both optimize information gained per unit cost. Can the MVT be formalized with tokens as the cost unit?

8. **How do sub-agent architectures map to foraging theory?** A sub-agent that explores broadly and returns a summary is like a scout that forages a distant patch and reports back. Does IFT have a model for collaborative/delegated foraging?
