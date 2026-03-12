# Three-Way Merging of Tree-Structured Documents

**Research date:** 2026-03-11
**Focus:** Algorithms for three-way merging of tree-structured documents, with implications for merging markdown files at section (heading) granularity.

---

## Key Discoveries

### 1. The 3DM Algorithm (Lindholm, 2001/2004)

- **The foundational work.** Tancred Lindholm's Master's thesis (Helsinki, 2001) and DocEng 2004 paper define a complete three-way merge algorithm for ordered trees, built specifically for XML but generalizable to any ordered tree structure.
- **Algorithm steps:** (1) Tree matching to establish node correspondences between base/left/right, (2) Apply traditional diff3 to the children of each changed node, (3) Classify and resolve conflicts using a defined set of merge rules.
- **Edit operations:** insert, delete, update, move.
- **Node identity:** Uses absolute paths (position-based), e.g., `/0/2/1` meaning "root's first child, then third child, then second child." This is fragile -- if a sibling is inserted before a node, its path changes.
- **Conflict classification:** The thesis defines specific conflict types arising from concurrent edits to the same node or overlapping structural changes.
- **Ordered trees only.** The algorithm handles children as ordered sequences, which is correct for markdown (section order matters).
- **Modern implementation:** [3dm-rs](https://github.com/06chaynes/3dm-rs) is a Rust rebuild of the original Java tool. It functions as a Git merge driver for XML files.
- Sources:
  - [Lindholm thesis (Aalto)](https://aaltodoc.aalto.fi/server/api/core/bitstreams/cd83234f-72c9-443d-b9f4-3ab58db341c9/content)
  - [DocEng 2004 paper (Semantic Scholar)](https://www.semanticscholar.org/paper/A-three-way-merge-for-XML-documents-Lindholm/fbcdd491baaff3e604ac3c790d4940438cc7630c)
  - [ResearchGate: thesis](https://www.researchgate.net/publication/2377723_A_3-way_Merging_Algorithm_for_Synchronizing_Ordered_Trees_-_the_3DM_merging_and_differencing_tool_for_XML)
  - [Original 3DM homepage](https://www.cs.hut.fi/~ctl/3dm/)
  - [3dm-mirror on GitHub](https://github.com/Mikulas/3dm-mirror)
  - [3dm-rs Rust announcement](https://users.rust-lang.org/t/3-way-structure-aware-xml-merge-library-and-cli/137873)
  - [xml-3dm-cli on lib.rs](https://lib.rs/crates/xml-3dm-cli)

### 2. DeltaXML / Deltaxignia (Commercial)

- **Commercial XML merge tooling** with n-way merge support (not just three-way). Uses a common ancestor plus N branches.
- **Tree-based alignment:** Matches elements at each level using longest common subsequence of corresponding elements. Correspondence is determined by element name, namespace, and parent correspondence.
- **Three-to-two conversion:** A unique approach -- takes a three-way merge result and "rotates" it into a two-way representation suitable for accept/reject interfaces in XML editors. Additions become deletions depending on viewing direction.
- **Rule-based processing:** Configurable rules determine which changes auto-apply. Supports DITA-specific merge.
- **Key limitation for our use case:** Deeply tied to XML element semantics (names, namespaces, attributes). The alignment algorithm depends on XML structure.
- Sources:
  - [Three-to-two merge blog post](https://www.deltaxignia.com/blog/document-management/three-into-two-three-way-merge-with-a-two-way-result/)
  - [DeltaXML merge result formats](https://docs.deltaxml.com/xml-merge/9.0/merge-result-formats-and-types)
  - [DeltaJSON three-way merge guide](https://docs.deltaxml.com/deltajson/latest/three-way-merge-guide)
  - [DITA Merge features](https://docs.deltaxml.com/dita-merge/5.1/dita-merge-features)

### 3. GumTree (Falleri et al., 2014)

- **The dominant AST diff algorithm.** Used as a component by Spork, Mergiraf, and other merge tools.
- **Two-phase matching:**
  1. **Top-down greedy:** Finds isomorphic subtrees by comparing hash values. Subtrees must exceed a minimum height threshold (`minHeight = 2`). These are called "anchor mappings."
  2. **Bottom-up:** For unmatched nodes, checks if ancestors match based on the proportion of already-matched descendants (using the Dice coefficient, threshold `minDice = 0.5`). These are "container mappings." For small subtrees, falls back to RTED (tree edit distance) for optimal matching.
- **Edit script generation:** Produces a sequence of {insert, delete, update, move} operations that transforms one tree into the other.
- **Critical distinction:** GumTree is a *diff* tool, not a merge tool. It produces an edit script between two trees. To do three-way merge, you need to diff base-vs-left and base-vs-right, then combine the edit scripts (which is what Spork and Mergiraf do).
- **Performance:** Mean running times of 20-74ms per file.
- Sources:
  - [GumTree GitHub](https://github.com/GumTreeDiff/gumtree)
  - [GumTree paper (HAL)](https://hal.science/hal-01054552v1/document)
  - [VT lecture notes on GumTree](https://courses.cs.vt.edu/cs5704/spring20/lecture_notes/5704-12-GumTree.pdf)
  - [gumtree-spoon-ast-diff](https://github.com/SpoonLabs/gumtree-spoon-ast-diff)
  - [Hyperparameter optimization for AST differencing](https://arxiv.org/pdf/2011.10268)

### 4. PCS Triples (Parent-Child-Successor) -- The Merge Representation

- **Used by Mergiraf and derived from Lindholm.** Trees are encoded as sets of (Parent, Child, Successor) triples. A triple `(p, c, s)` means p is parent of both c and s, and s immediately follows c in p's child list.
- **Sentinel nodes** `⊣` and `⊢` mark the beginning and end of each child list; a virtual root `⊥` identifies the tree root.
- **Merge algorithm on PCS:**
  1. Tag each triple with its source revision (base/left/right).
  2. Eliminate base triples that are inconsistent with left or right triples (same parent+child but different successor, or same parent+successor but different child).
  3. Reconstruct a tree from the merged triple set, recursively resolving each node's child list.
  4. When reconstruction fails (inconsistent triples remain), fall back to line-based merge for that subtree.
- **This is the most directly applicable representation for our use case.** Markdown sections form an ordered tree; PCS triples naturally encode section ordering and nesting.
- Sources:
  - [Mergiraf architecture](https://mergiraf.org/architecture.html)

### 5. Spork (KTH, 2022)

- **Three-way structured merge for Java** that directly implements 3DM's merge algorithm on top of GumTree matching and Spoon AST parsing.
- **Algorithm chain:** Spoon parses Java -> GumTree matches nodes across base/left/right -> 3DM merge rules combine changes -> Spork reconstructs merged source with formatting preservation.
- **Fallback:** When structured merge fails, falls back to line-based merge (`-e` flag disables this).
- **Performance:** 51% faster than JDime, with formatting preservation in 90%+ of files.
- **Key insight for us:** Spork proves that 3DM + GumTree is a viable combination for real-world three-way merge. The same architecture (parser + matcher + 3DM merge) could work for markdown sections.
- Sources:
  - [Spork GitHub](https://github.com/ASSERT-KTH/spork)
  - [Spork paper (ResearchGate)](https://www.researchgate.net/publication/358579660_Spork_Structured_Merge_for_Java_with_Formatting_Preservation)
  - [Spork paper (HAL)](https://hal.science/hal-04423078/document)

### 6. Mergiraf (2024-present)

- **Syntax-aware Git merge driver** supporting 33+ languages and declarative formats (JSON, YAML, TOML, XML, HTML, INI). Written in Rust. Uses tree-sitter for parsing.
- **Does NOT support Markdown.**
- **Nine-stage merge pipeline:**
  1. Parse (tree-sitter)
  2. Match (GumTree classic)
  3. Class-mapping (equivalence classes across three revisions, with "leader" preference: base > left > right)
  4. PCS triple conversion
  5. Triple merging (tag-and-eliminate)
  6. Result building (recursive tree reconstruction)
  7. Delete/modify conflict detection
  8. Duplicate signature detection
  9. Rendering (text output with whitespace preservation)
- **Fast mode:** Tries line-based merge first; if conflicts exist, constructs fictional revisions from the merged output to accelerate structured merge.
- **Commutative merging:** For certain parent types, treats children as unordered sets -- computes additions/deletions rather than positional diffs.
- **Key insight:** Mergiraf's pipeline is the most complete reference implementation of structured three-way merge available. Adding markdown support would require a tree-sitter markdown grammar + a language profile.
- Sources:
  - [Mergiraf introduction](https://mergiraf.org/)
  - [Mergiraf architecture](https://mergiraf.org/architecture.html)
  - [Mergiraf supported languages](https://mergiraf.org/languages.html)
  - [Adding a new language](https://mergiraf.org/adding-a-language.html)
  - [Codeberg repository](https://codeberg.org/mergiraf/mergiraf)
  - [Hacker News discussion](https://news.ycombinator.com/item?id=42093756)
  - [LWN.net article](https://lwn.net/Articles/1042355/)

### 7. Weave (Ataraxy Labs, 2026) -- MOST DIRECTLY RELEVANT

- **Entity-level semantic merge driver for Git.** Written in Rust, uses tree-sitter via sem-core.
- **Explicitly supports Markdown with "heading-based sections" as the entity model.**
- **Algorithm steps:**
  1. Parse all three versions (base, ours, theirs) into semantic entities via tree-sitter
  2. Extract regions -- alternating entity and interstitial (whitespace, imports) segments
  3. Match entities across versions by composite ID: `file:type:name:parent`
  4. Resolve each entity: one-side-only changes win; both-changed attempts intra-entity 3-way merge
  5. Reconstruct file from merged regions, preserving ours-side ordering
  6. Fallback to line-level merge for files >1MB, binary, or unsupported types
- **Entity matching:** Uses `name + type + scope` identity, not position. Structural hash matching (xxHash64) enables rename detection.
- **Performance:** 31/31 clean merges (100%) vs Mergiraf 26/31 (83%) vs Git 15/31 (48%). Individual merges: 65-374 microseconds.
- **Markdown entity model:** Headings define sections. Each section is an entity identified by its heading text + level + parent scope. Content under a heading until the next heading of equal/higher level belongs to that entity.
- **Critical finding:** This is exactly the model we need. Weave already solves the "treat markdown headings as a section tree and merge at section granularity" problem.
- Sources:
  - [Weave GitHub](https://github.com/Ataraxy-Labs/weave)
  - [Weave documentation](https://ataraxy-labs.github.io/weave/)
  - [Weave HN discussion](https://news.ycombinator.com/item?id=47241976)
  - [Weave HN discussion (earlier)](https://news.ycombinator.com/item?id=46974793)
  - [Top AI Product article](https://topaiproduct.com/2026/03/04/weave-finally-makes-git-merges-understand-your-code/)
  - [Awesome merge drivers list](https://github.com/jelmer/awesome-merge-drivers)

### 8. Semistructured Merge (Apel et al., FSTMerge, 2011)

- **The middle ground.** Parse source into a partial AST (class/function boundaries) but use unstructured line-based merge for method bodies.
- **FSTMerge/s3m** alternates between structured and unstructured merge based on AST depth. Configured for Java, C#, Python. Requires annotated grammars specifying commutative vs ordered nodes.
- **Sesame variant:** Instead of full parsing, inserts line breaks before/after syntactic separators (`{`, `}`, `;`) then runs standard diff3. Achieves 91% reduction in false positives.
- **35% conflict reduction** over pure unstructured merge in studies.
- **Key insight:** The "parse to a shallow depth, then fall back to line-based" strategy is highly relevant for markdown. We only need to parse to heading depth; within a section's body, line-based diff suffices.
- Sources:
  - [Semistructured merge (Apel, FSE 2011)](https://www.se.cs.uni-saarland.de/publications/docs/FSE2011.pdf)
  - [Sesame: syntactic separators (2024)](https://arxiv.org/html/2407.18888v1)
  - [Understanding semistructured merge conflicts](https://pauloborba.cin.ufpe.br/publication/2018understanding_semi-structured_merge_conflict_characteristics_in_open-source_java_projects/2018ESESemistructuredMergeConflictCharacteristics.pdf)
  - [Evaluating and improving semistructured merge](https://spgroup.github.io/s3m/docs/preprint_eis.pdf)

### 9. LastMerge (2025) -- Language-Agnostic Structured Merge

- **Generic structured merge over tree-sitter.** Configurable for any tree-sitter grammar through a "thin interface."
- **15% fewer false positives than JDime.** Comparable runtime to language-specific tools.
- **Significance:** Proves that tree-sitter + generic merge engine can match or exceed language-specific tools. Since tree-sitter has a markdown grammar, LastMerge's approach could theoretically extend to markdown.
- Sources:
  - [LastMerge paper (arXiv)](https://arxiv.org/abs/2507.19687)
  - [LastMerge paper PDF](https://arxiv.org/pdf/2507.19687)

### 10. Git merge-ort / merge-recursive

- **Purely line-based at the file content level.** Git's merge strategies handle *tree-level* merging (which files changed, renames) but file content merging is done with diff3 on lines.
- **merge-ort** (default since Git 2.50) replaced merge-recursive. Uses `diff-algorithm=histogram` by default. Handles file renames, directory renames, but does not understand file content structure.
- **No structural understanding of file contents.** A markdown file with section reordering would produce line-based conflicts.
- Sources:
  - [Git merge strategies docs](https://git-scm.com/docs/merge-strategies)
  - [merge-ort.c source](https://github.com/git/git/blob/master/merge-ort.c)

### 11. Tree Edit Distance Algorithms (Background)

- **Zhang-Shasha (1989):** O(m^2 n^2) for ordered trees. The classic algorithm.
- **RTED (Pawlik & Augsten, 2012):** Optimal strategy selection, always as good as or better than competitors. Used by GumTree for small subtree matching.
- **Ordered trees are polynomial; unordered is NP-complete.** Markdown sections are ordered (within a level), so we're in the tractable case.
- Sources:
  - [Tree edit distance reference site](http://tree-edit-distance.dbresearch.uni-salzburg.at/)
  - [RTED paper](https://www.vldb.org/pvldb/vol5/p334_mateuszpawlik_vldb2012.pdf)
  - [Zhang-Shasha on Semantic Scholar](https://www.semanticscholar.org/paper/Simple-Fast-Algorithms-for-the-Editing-Distance-and-Zhang-Shasha/277ff0c74cc72663d0aabbeae25a3e97b245457c)
  - [zhang-shasha Python implementation](https://github.com/timtadh/zhang-shasha)

### 12. Chawathe et al. (1996) -- Change Detection in Hierarchical Data

- **Foundational paper** for tree diff with move operations. Defines the edit script as {insert, delete, update, move} operations that transform one tree into another.
- **Minimum-cost edit script** problem formulation. Later optimized by Fluri et al. (ChangeDistiller) for source code, reducing edit script length by 45%.
- Sources:
  - [Original paper (ACM)](https://dl.acm.org/doi/10.1145/235968.233366)
  - [Semantic Scholar](https://www.semanticscholar.org/paper/Change-detection-in-hierarchically-structured-Chawathe-Rajaraman/48cf457b499c1fa3007b6c38229e74fc349929d1)

### 13. Mozilla Dogear -- Bookmark Tree Merging

- **Two-way merge (not three-way)** for Firefox Sync bookmark trees. Relevant as a real-world tree merge system.
- **GUID-based node identity.** Each bookmark has a persistent GUID used for matching across trees.
- **Structure vs value changes:** Algorithm separately handles structural changes (parent/child relationships, reordering) and value changes (title, URL).
- **Conflict resolution:** Timestamps determine winner. Cannot identify which specific properties changed, risking data loss.
- **Key insight:** Persistent node identity (GUIDs) eliminates the matching problem entirely. For markdown, heading text serves as a natural (though imperfect) identifier.
- Sources:
  - [Dogear GitHub](https://github.com/mozilla/dogear)
  - [Merge algorithm documentation](https://mozilla.github.io/dogear/merging.html)
  - [Introduction](https://mozilla.github.io/dogear/)

### 14. Markdown-Specific Tools

- **mddiff** (experimental): Parses markdown to AST via CommonMark, diffs using virtual-DOM comparison. Two-way only. Not production-ready.
  - [GitHub](https://github.com/nono/mddiff)
- **markdown-parser-py**: Parses markdown into a heading tree (levels 1-6), preserves section body content, supports `find_node_by_path('Intro.Install')` queries, and can attach/merge subtrees with automatic heading level adjustment. Python >= 3.10.
  - [PyPI](https://pypi.org/project/markdown-parser-py/)
- **tree-sitter-markdown**: Produces a **flat** AST where all headings are siblings, regardless of level. Does NOT produce hierarchical sections. Post-processing is required to build a section tree from heading levels.
  - [GitHub (current)](https://github.com/tree-sitter-grammars/tree-sitter-markdown)
  - [GitHub (original)](https://github.com/ikatyang/tree-sitter-markdown)
  - [Hierarchy issue discussion](https://github.com/ikatyang/tree-sitter-markdown/issues/19)

### 15. Peritext (Ink & Switch) -- CRDTs for Rich Text

- **CRDT for collaborative rich text editing** with inline formatting. Not directly applicable to our batch merge scenario, but relevant design thinking.
- **Key insight:** Formatting spans are stored alongside the character sequence, linked to stable identifiers. This is analogous to how we might track section metadata alongside content.
- Sources:
  - [Peritext project page](https://www.inkandswitch.com/peritext/)
  - [Peritext paper](https://www.inkandswitch.com/peritext/static/cscw-publication.pdf)
  - [GitHub](https://github.com/inkandswitch/peritext)

### 16. Evaluation Findings (Schesch et al., ASE 2024)

- **The largest evaluation of merge tools to date** -- 1,120 repositories. Found that previous claims about structured merge superiority were not properly validated.
- **Key result:** Created a merge tool that "outperforms all previous tools under most assumptions."
- Sources:
  - [Paper (Washington)](https://homes.cs.washington.edu/~mernst/pubs/merge-evaluation-ase2024.pdf)
  - [arXiv](https://arxiv.org/abs/2410.09934)
  - [Abstract](https://homes.cs.washington.edu/~mernst/pubs/merge-evaluation-ase2024-abstract.html)

---

## The diff3 Algorithm (Foundation for All Three-Way Merge)

Understanding diff3 is essential because every three-way merge tool either uses it directly or reimplements its logic at a different granularity:

1. **Compute matches** between base and each branch (using LCS/diff).
2. **Scan through documents** identifying chunks where versions diverge and reconverge.
3. **Classify each chunk:**
   - All three match -> keep as-is
   - One branch changed, other matches base -> take the changed version
   - Both branches changed differently -> CONFLICT
4. **Output** merged result with conflict markers where needed.

The insight for structural merge: **run this same logic on tree nodes instead of text lines.** Match sections by identity, compare section content, apply the same three-way classification.

Sources:
- [diff3 Wikipedia](https://en.wikipedia.org/wiki/Diff3)
- [Merging with diff3 (James Coglan)](https://blog.jcoglan.com/2017/05/08/merging-with-diff3/)
- [Three-Way Merge overview (revctrl.org)](https://tonyg.github.io/revctrl.org/ThreeWayMerge.html)

---

## Implications for Building a Three-Way Section Merge for Markdown

### The core algorithm is well-understood

The 3DM pattern (match nodes -> apply diff3 per-node -> reconstruct tree) is the proven approach, validated by Spork, Mergiraf, and now Weave across dozens of languages.

### An existing tool already does exactly this

**Weave** (Ataraxy Labs) already implements entity-level merge for markdown using heading-based sections as entities. Before building a custom solution, we should evaluate whether Weave can be used directly or whether its approach (which we can study from the open-source code) can be adapted.

### The parsing challenge is solved differently than expected

Tree-sitter-markdown produces a **flat** AST where headings are all siblings. Building a section tree requires post-processing: scan headings in order, and whenever a heading's level is deeper than the previous, make it a child. The `markdown-parser-py` library already does this correctly. Weave handles this in its sem-core entity extraction layer.

### Node identity is the key design decision

The algorithms differ primarily in how they identify "the same node" across versions:
| Approach | Used by | Pros | Cons |
|----------|---------|------|------|
| Position (path) | 3DM original | Simple | Breaks when siblings inserted/deleted |
| GUID | Dogear | Perfect matching | Requires persistent IDs in content |
| Content hash | GumTree | Works without metadata | Breaks when content changes |
| Name + type + scope | Weave | Natural for named entities | Breaks on duplicate headings |
| Structural hash | Weave (fallback) | Handles renames | May false-match similar sections |

For markdown sections, **heading text is a natural identifier** (analogous to function names in code). The composite key `heading-level:heading-text:parent-heading-text` provides strong identity. Edge case: duplicate heading text at the same level under the same parent (rare in practice).

### The merge granularity decision

Two viable approaches:
1. **Full structural merge** (Mergiraf/Spork style): Parse to full AST, PCS triples, reconstruct. Handles section reordering, moves, and nested changes. Complex.
2. **Semistructured merge** (FSTMerge/Weave style): Parse to section boundaries, match sections by identity, then apply line-based diff3 within each section's body. Simpler, handles 90%+ of real-world cases.

**Recommendation:** Start with semistructured. Parse markdown into a section tree (heading text + level + body content). Match sections by identity. Diff section bodies with standard diff3. This gives us section-level conflict reporting with minimal algorithmic complexity.

### The algorithm for our use case

```
INPUT: base.md, upstream.md, consumer.md
OUTPUT: merged.md + list of section-level conflicts

1. PARSE each version into a section tree:
   - Root node (implicit level 0)
   - For each heading: create a section node with {level, title, body_content}
   - Nest sections: h2 under preceding h1, h3 under preceding h2, etc.

2. MATCH sections across versions:
   - Primary key: (level, title, parent_title)
   - For each section in base, find corresponding section in upstream and consumer
   - Detect: added sections (in one but not base), deleted sections (in base but not one)

3. DIFF matched sections:
   For each section present in all three:
   - If upstream body == base body: take consumer body (consumer changed, upstream didn't)
   - If consumer body == base body: take upstream body (upstream changed, consumer didn't)
   - If upstream body == consumer body: take either (both made same change)
   - If all three differ: CONFLICT at section level

4. HANDLE structural changes:
   - Section added in upstream only: include it (new framework content)
   - Section added in consumer only: include it (customization)
   - Section deleted in upstream only: delete it (framework removed it)
   - Section deleted in consumer only: keep it (consumer opted out; flag for review)
   - Section added in both: include both (or conflict if same heading)
   - Section deleted in both: delete it

5. RECONSTRUCT merged document:
   - Walk the merged section tree
   - Emit headings and body content
   - Insert conflict markers for unresolved sections
```

### What we gain over line-based merge

- Conflicts reported at section level ("the '## Installation' section was changed in both versions") rather than line-level ("lines 14-22 conflict")
- Independent edits to different sections never conflict, even if adjacent
- Section additions/deletions are first-class operations, not inferred from line diffs
- Possible to apply policies per-section (e.g., "always take upstream for ## API Reference")

---

## Open Questions

1. **Should we use Weave directly?** It already does heading-based markdown merge. If its entity model matches our needs, building a custom solution would be redundant. Need to evaluate: does it handle the "base version" concept correctly for our sync use case (where base is the last-synced version, not git's merge base)?

2. **How to handle heading renames?** If upstream renames "## Setup" to "## Getting Started", position-based matching fails. Weave uses structural hashing as a fallback. We could use body content similarity as a signal.

3. **What about content between headings at the top of a file?** The preamble before the first heading (frontmatter, intro paragraph) needs to be treated as a special "root body" section.

4. **How to handle heading level changes?** If upstream promotes a section from h3 to h2, our identity matching (which includes level) would see it as a delete+add. We might need to match by title first, then check for level changes.

5. **Performance of tree-sitter vs custom parser?** For markdown section trees, a simple regex-based parser (scan for lines starting with `#`) may be faster and more reliable than tree-sitter, which produces a flat AST requiring post-processing anyway.

6. **Should conflicts be returned as data or as conflict markers in the file?** Git convention uses `<<<<<<<`/`=======`/`>>>>>>>` markers. But section-level conflicts could be richer: include section title, which version changed, and the diff within the section.

7. **How does Mergiraf's "commutative parent" concept apply?** Some markdown sections might be order-independent (e.g., FAQ items). Could we mark certain heading levels as commutative?

8. **What about nested section changes?** If upstream modifies a subsection (h3) inside a section (h2) that the consumer deleted entirely, this is a delete/modify conflict. Mergiraf's stage 7 handles this explicitly.

---

## Sources (Full URLs)

### Academic Papers
- https://aaltodoc.aalto.fi/server/api/core/bitstreams/cd83234f-72c9-443d-b9f4-3ab58db341c9/content -- Lindholm 3DM thesis (PDF)
- https://www.semanticscholar.org/paper/A-three-way-merge-for-XML-documents-Lindholm/fbcdd491baaff3e604ac3c790d4940438cc7630c -- Lindholm DocEng 2004
- https://hal.science/hal-01054552v1/document -- GumTree paper (Falleri et al.)
- https://arxiv.org/pdf/2011.10268 -- Hyperparameter optimization for AST differencing
- https://www.vldb.org/pvldb/vol5/p334_mateuszpawlik_vldb2012.pdf -- RTED algorithm
- https://www.semanticscholar.org/paper/Simple-Fast-Algorithms-for-the-Editing-Distance-and-Zhang-Shasha/277ff0c74cc72663d0aabbeae25a3e97b245457c -- Zhang-Shasha
- https://dl.acm.org/doi/10.1145/235968.233366 -- Chawathe et al. change detection
- https://www.se.cs.uni-saarland.de/publications/docs/FSE2011.pdf -- FSTMerge / semistructured merge (Apel)
- https://arxiv.org/html/2407.18888v1 -- Sesame: syntactic separators for semistructured merge
- https://arxiv.org/abs/2507.19687 -- LastMerge: language-agnostic structured merge
- https://homes.cs.washington.edu/~mernst/pubs/merge-evaluation-ase2024.pdf -- Schesch merge tool evaluation (ASE 2024)
- https://arxiv.org/abs/2410.09934 -- Schesch evaluation (arXiv version)
- https://people.cs.vt.edu/~nm8247/publications/jsa23.pdf -- Three-way structured merge methodology
- https://www.microsoft.com/en-us/research/wp-content/uploads/2015/02/paper-full.pdf -- diffTree: robust collaborative coding
- https://link.springer.com/chapter/10.1007/978-3-030-52249-0_6 -- Top-down three-way merge for HTML/XML
- https://link.springer.com/article/10.1007/s00450-013-0253-5 -- Versioned trees for XML merging
- https://www.inkandswitch.com/peritext/static/cscw-publication.pdf -- Peritext CRDT
- https://hal.science/hal-04423078/document -- Spork paper
- https://pauloborba.cin.ufpe.br/publication/2018understanding_semi-structured_merge_conflict_characteristics_in_open-source_java_projects/2018ESESemistructuredMergeConflictCharacteristics.pdf -- Understanding semistructured merge conflicts
- https://spgroup.github.io/s3m/docs/preprint_eis.pdf -- Evaluating semistructured merge
- https://paulz.me/files/mastery-preprint.pdf -- Mastery: shifted-code-aware structured merging

### Tools & Implementations
- https://github.com/Ataraxy-Labs/weave -- Weave (entity-level merge with markdown support)
- https://ataraxy-labs.github.io/weave/ -- Weave documentation
- https://github.com/GumTreeDiff/gumtree -- GumTree
- https://github.com/SpoonLabs/gumtree-spoon-ast-diff -- GumTree + Spoon
- https://github.com/ASSERT-KTH/spork -- Spork (structured merge for Java)
- https://codeberg.org/mergiraf/mergiraf -- Mergiraf
- https://mergiraf.org/ -- Mergiraf site
- https://mergiraf.org/architecture.html -- Mergiraf architecture
- https://mergiraf.org/languages.html -- Mergiraf supported languages
- https://mergiraf.org/adding-a-language.html -- Adding a language to Mergiraf
- https://github.com/06chaynes/3dm-rs -- 3dm-rs (Rust 3DM implementation)
- https://lib.rs/crates/xml-3dm-cli -- xml-3dm-cli
- https://github.com/Mikulas/3dm-mirror -- 3DM Java mirror
- https://www.cs.hut.fi/~ctl/3dm/ -- Original 3DM homepage
- https://sourceforge.net/projects/tdm.berlios/ -- 3DM SourceForge
- https://github.com/mozilla/dogear -- Mozilla Dogear
- https://mozilla.github.io/dogear/merging.html -- Dogear merge algorithm
- https://mozilla.github.io/dogear/ -- Dogear introduction
- https://github.com/nono/mddiff -- mddiff (experimental markdown AST diff)
- https://pypi.org/project/markdown-parser-py/ -- markdown-parser-py
- https://github.com/movableink/three-way-merge -- three-way-merge JS library
- https://github.com/thufv/automerge-ptm -- AutoMerge-PTM
- https://github.com/jelmer/awesome-merge-drivers -- Awesome merge drivers list
- https://github.com/Praqma/git-merge-driver -- Example custom git merge driver
- https://github.com/timtadh/zhang-shasha -- Zhang-Shasha Python
- https://github.com/inkandswitch/peritext -- Peritext CRDT
- https://github.com/adamarthurryan/dubdiff -- dubdiff
- https://github.com/JeNeSuisPasDave/MarkdownTools -- MarkdownTools / mdmerge
- https://github.com/knennigtri/merge-markdown -- merge-markdown
- https://github.com/abhinav/stitchmd -- stitchmd

### Tree-sitter Markdown
- https://github.com/tree-sitter-grammars/tree-sitter-markdown -- tree-sitter-markdown (current)
- https://github.com/ikatyang/tree-sitter-markdown -- tree-sitter-markdown (original)
- https://github.com/ikatyang/tree-sitter-markdown/issues/19 -- Hierarchical syntax tree issue
- https://docs.rs/tree-sitter-markdown -- tree-sitter-markdown Rust crate
- https://ikatyang.github.io/tree-sitter-markdown/ -- tree-sitter-markdown playground

### Reference & Documentation
- https://git-scm.com/docs/merge-strategies -- Git merge strategies
- https://github.com/git/git/blob/master/merge-ort.c -- merge-ort source
- https://en.wikipedia.org/wiki/Diff3 -- diff3 Wikipedia
- https://en.wikipedia.org/wiki/Merge_(version_control) -- Merge Wikipedia
- https://blog.jcoglan.com/2017/05/08/merging-with-diff3/ -- Merging with diff3 (Coglan)
- https://tonyg.github.io/revctrl.org/ThreeWayMerge.html -- Three-Way Merge overview
- https://blog.git-init.com/the-magic-of-3-way-merge/ -- Magic of 3-Way Merge
- http://tree-edit-distance.dbresearch.uni-salzburg.at/ -- Tree edit distance reference
- https://difftastic.wilfred.me.uk/tree_diffing.html -- Difftastic tree diffing manual
- https://www.inkandswitch.com/peritext/ -- Peritext project page
- https://www.deltaxignia.com/blog/document-management/three-into-two-three-way-merge-with-a-two-way-result/ -- DeltaXML three-to-two
- https://docs.deltaxml.com/xml-merge/9.0/merge-result-formats-and-types -- DeltaXML merge formats
- https://docs.deltaxml.com/deltajson/latest/three-way-merge-guide -- DeltaJSON merge guide
- https://docs.deltaxml.com/dita-merge/5.1/dita-merge-features -- DITA Merge features
- https://www.xifiggam.eu/wp-content/uploads/2018/08/GeneratingAccurateandCompactEditScriptsusingTreeDifferencing.pdf -- Generating accurate edit scripts
- https://sdl.ist.osaka-u.ac.jp/pman/pman3.cgi?DOWNLOAD=466 -- Beyond GumTree
- https://courses.cs.vt.edu/cs5704/spring20/lecture_notes/5704-12-GumTree.pdf -- GumTree lecture notes
- https://courses.cs.vt.edu/cs6704/spring17/slides_by_students/CS6704_gumtree_Kijin_AN_Feb15.pdf -- GumTree slides
- https://bergel.eu/MyPapers/DeLa18-SourceCodeDelta.pdf -- Source code delta imprecisions
- https://homes.cs.washington.edu/~mernst/pubs/merge-evaluation-ase2024-abstract.html -- Schesch abstract
- https://homes.cs.washington.edu/~mernst/pubs/merge-evaluation-ase2024-slides.pdf -- Schesch slides
- https://www.gregmicek.com/software-coding/2020/01/13/how-to-write-a-custom-git-merge-driver/ -- Custom merge driver tutorial
- https://news.ycombinator.com/item?id=42093756 -- Mergiraf HN
- https://news.ycombinator.com/item?id=46974793 -- Weave HN (first)
- https://news.ycombinator.com/item?id=47241976 -- Weave HN (second)
- https://lwn.net/Articles/1042355/ -- Mergiraf LWN
- https://topaiproduct.com/2026/03/04/weave-finally-makes-git-merges-understand-your-code/ -- Weave article

### Commercial
- https://www.deltaxml.com/products/merge/xml-merge/ -- DeltaXML XML Merge
- https://www.semanticmerge.com/features -- SemanticMerge features
- https://www.araxis.com/merge/index.en -- Araxis Merge

### Additional Context
- https://www.researchgate.net/publication/2377723_A_3-way_Merging_Algorithm_for_Synchronizing_Ordered_Trees_-_the_3DM_merging_and_differencing_tool_for_XML -- 3DM on ResearchGate
- https://www.researchgate.net/publication/221353228_A_three-way_merge_for_XML_documents -- Lindholm 2004 on ResearchGate
- https://www.researchgate.net/publication/220855486_XML_three-way_merge_as_a_reconciliation_engine_for_mobile_data -- XML merge for mobile data
- https://www.researchgate.net/publication/335498580_Beyond_GumTree_A_Hybrid_Approach_to_Generate_Edit_Scripts -- Beyond GumTree
- https://www.researchgate.net/publication/358579660_Spork_Structured_Merge_for_Java_with_Formatting_Preservation -- Spork on ResearchGate
- https://www.researchgate.net/publication/215747935_Semistructured_Merge_Rethinking_Merge_in_Revision_Control_Systems -- Semistructured Merge on ResearchGate
- https://www.researchgate.net/publication/338510179_The_Impact_of_Structure_on_Software_Merging_Semistructured_Versus_Structured_Merge -- Structure impact on merging
- https://www.researchgate.net/publication/394080772_LastMerge_A_language-agnostic_structured_tool_for_code_integration -- LastMerge on ResearchGate
- https://link.springer.com/article/10.1007/s00450-013-0253-5 -- Versioned trees for XML merging (Springer)
- https://link.springer.com/chapter/10.1007/978-3-030-80119-9_3 -- HMM-based XML merge
- https://dl.acm.org/doi/10.1145/1030397.1030399 -- Lindholm 2004 (ACM DL)
- https://dl.acm.org/doi/10.1145/940923.940940 -- XML three-way merge for mobile data (ACM DL)
- https://dl.acm.org/doi/abs/10.1145/3691620.3695075 -- Schesch evaluation (ACM DL)
- https://metacpan.org/pod/Algorithm::Merge -- Perl three-way merge
- https://gist.github.com/stepchowfun/4713315 -- Three-way merge gist
