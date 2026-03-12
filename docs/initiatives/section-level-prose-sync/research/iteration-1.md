# Iteration 1 — 2026-03-11

## Research Vectors

### Vector 1: Deployed Systems That Sync at Section/Block Granularity
**Question:** Does anything sync documents at section/block level rather than lines? MediaWiki, Notion, Obsidian Sync, Google Docs.
**Full report:** [iteration-1/vector-1-deployed-systems-section-block-sync.md](iteration-1/vector-1-deployed-systems-section-block-sync.md)

**Key discoveries:**
- No widely-deployed system syncs prose at section granularity with three-way merge. The landscape: character-level OT/CRDT (Google Docs), block-level last-write-wins (Notion), file-level with character merge (Obsidian Sync).
- **Weave** (Ataraxy Labs, 2026) is the only production tool treating markdown headings as section-level entities for three-way merge. 100% clean merges (31/31) vs git's 48%.
- Notion's block model uses persistent UUIDs per block — relevant design pattern but no merge, just last-write-wins.
- MediaWiki has section editing but line-level diff3 underneath.

**Implications:**
- The gap is real — nobody does section-level sync for convention files.
- Weave validates the approach but is a git merge driver, not a sync tool.

### Vector 2: Markdown Parsing for Structural Stability
**Question:** How do remark/unified/mdast handle sections? Stable section IDs that survive heading renames?
**Full report:** [iteration-1/markdown-parser-section-boundaries.md](iteration-1/markdown-parser-section-boundaries.md)

**Key discoveries:**
- mdast has **no section node type** — headings are flat siblings. Section tree must be built manually (~40 lines, proven by remark-sectionize algorithm: process depths 6→1).
- **HTML comment markers** (`<!-- section:id -->`) recommended for stable IDs — invisible in rendered output, supported by mdast-zone and mdast-comment-marker.
- `{#custom-id}` heading syntax is widely supported (Pandoc, Docusaurus) but breaks in MDX.
- **remark-stringify does not preserve formatting** — for unmodified sections, splice from original source using AST byte offsets rather than re-serializing.
- YAML frontmatter parsed as `{type: 'yaml'}` head node — treat as special section with well-known ID `__frontmatter__`.

**Implications:**
- Parser strategy is clear: remark-parse + remark-frontmatter + custom sectionize (~40 LOC) + HTML comment IDs.
- Formatting preservation requires source-level splicing, not AST roundtripping.

### Vector 3: Three-Way Merge for Tree Structures
**Question:** What algorithms exist for merging tree-structured documents? 3DM, GumTree, Mergiraf.
**Full report:** [iteration-1/tree-merge-algorithms.md](iteration-1/tree-merge-algorithms.md)

**Key discoveries:**
- **3DM algorithm** (Lindholm, 2001) is the foundational pattern: match nodes → diff3 per node → reconstruct. Validated by Spork, Mergiraf, Weave.
- **Mergiraf** (Rust, 33+ languages, tree-sitter) has a nine-stage pipeline but does NOT support Markdown.
- **Weave** independently confirmed: heading-based sections as entities, composite identity `file:type:name:parent`, 100% clean merge rate.
- **Semistructured merge** (Apel, 2011) achieves 90%+ benefit: parse to section boundaries, line-based diff within sections. 35% conflict reduction over pure unstructured.
- **PCS triples** (Parent-Child-Successor) from Mergiraf are the most applicable merge representation for ordered section trees.
- Node identity is THE key design decision. For markdown: `heading-level:heading-text:parent-heading` provides strong natural identity.

**Implications:**
- Semistructured approach is the sweet spot — section boundaries for structure, line-level diff within sections.
- Weave should be evaluated before building custom, but it's a git merge driver, not a sync tool with baseline tracking.

### Vector 4: OT vs CRDT for Two-Peer Prose Sync
**Question:** OT, CRDT, or deterministic three-way diff for periodic CLI sync between two peers?
**Full report:** [iteration-1/ot-crdt-vs-diff3-sync-models.md](iteration-1/ot-crdt-vs-diff3-sync-models.md)

**Key discoveries:**
- **OT is architecturally wrong** — assumes real-time operation streams and a central server.
- **CRDTs are overengineered** — 16-32 bytes metadata per character. Cinapse abandoned Automerge after hitting 4GB WASM limits and $1K/month costs.
- **Section-level three-way diff3 is the right approach.** Most diff3 failure modes (false anchors, boilerplate matching) are eliminated at section granularity because sections are matched by stable IDs, not textual position.
- **Obsidian Sync validates diff3** — uses Google's diff-match-patch for three-way merge on markdown.
- **Base version storage in `.sherpa/`** is the correct architecture — analogous to git's merge base but explicit.
- Libraries: `node-diff3` for line-level merge within sections, `diff-match-patch-es` for character-level fallback.

**Implications:**
- No OT/CRDT needed. Section-level three-way diff3 with stored baseline is the complete solution.

### Vector 5: Convention/Config Sync in Existing Frameworks
**Question:** How do Rails, Expo, Angular, Copier handle evolving templates + consumer customizations?
**Full report:** [iteration-1/framework-sync-patterns.md](iteration-1/framework-sync-patterns.md)

**Key discoveries:**
- **Copier is the gold standard.** Three-way merge: store baseline → regenerate template → diff consumer changes → apply to new template → handle conflicts. Exactly our architecture.
- **nf-core's TEMPLATE branch** achieves three-way merge with zero custom algorithms via a dedicated git branch containing unmodified template output.
- **Kubebuilder's scaffold markers** (`//+kubebuilder:scaffold:<name>`) provide precedent for marking framework-owned vs user-owned regions. Maps to `<!-- sherpa:managed:section-name -->`.
- **Five distinct sync strategies:** Regenerate+Never Touch (Expo), Two-Way Prompt (Rails — no base, painful), Three-Way Merge (Copier), Overlay/Patch (Kustomize/Helm), AST/Semantic Transform (Angular).
- **CRA eject is the anti-pattern** — once ejected, lose all updates. Vite/Next.js proved visible config + plugin layer is correct.
- **No existing tool does section-level merge for prose/markdown** at the framework sync layer.

**Implications:**
- Copier's model (stored baseline + three-way merge) is proven and directly maps to `sherpa sync`.
- Ownership markers (`<!-- sherpa:managed -->`) enable per-section sync policies.

## Synthesis

### The Architecture Has Converged

Five independent research vectors converged on a single, clear architecture for `sherpa sync`. This is unusually strong signal — the solution space is well-constrained.

**The algorithm is: Copier's sync model + Weave's section-level parsing + Kubebuilder's ownership markers + node-diff3 for within-section fallback.**

Specifically:
1. **Parse** markdown into a section tree (remark + custom sectionize, ~40 LOC)
2. **Match** sections by stable identity (HTML comment markers or heading slug composite key)
3. **Load** the stored baseline from `.sherpa/sync-state/` (Copier pattern)
4. **Three-way classify** each section: upstream-only change → auto-take, consumer-only change → preserve, both changed → conflict or line-level fallback
5. **Reconstruct** merged file using source-level splicing (not AST re-serialization) for formatting preservation
6. **Update** stored baseline to new merged state

### Cross-Cutting Insight: Weave Validates But Doesn't Solve Our Problem

Weave was independently discovered by three vectors as the closest prior art. It proves that heading-based section merge works (100% clean merge rate). But Weave is a **git merge driver** — it operates within git's three-way merge flow where git provides the base. `sherpa sync` operates outside git: the base is a stored snapshot in `.sherpa/`, not a git merge base. We need the same parsing and matching logic but a different merge orchestration.

### Cross-Cutting Insight: The "No Base" Problem Kills Two-Way Merge

Rails `app:update` is the cautionary tale. Without a stored baseline, every sync is a painful two-way diff requiring manual review of every file. Copier solved this by storing the last-generated template output. nf-core solved it with a dedicated git branch. Both patterns prove: **three-way merge requires a base, and someone has to store it.** For `sherpa sync`, that's `.sherpa/sync-state/`.

### Cross-Cutting Insight: Ownership Markers Enable Policy

Kubebuilder's scaffold markers and the concept of "framework-managed" vs "consumer-owned" sections (from V5) combine naturally with the section ID system (from V2). A section marked `<!-- sherpa:managed:always-upstream -->` means "always take upstream version, even if consumer modified it." A section marked `<!-- sherpa:owned -->` means "never overwrite consumer changes." Default behavior (no marker) is standard three-way merge.

### Contradiction Resolved

V5 stated "no existing tool does section-level merge for markdown" while V1 and V3 found Weave does exactly that. Resolution: Weave does section-level merge for **git conflicts**. No tool does section-level merge for **convention sync** (framework → consumer project). The gap is at the orchestration layer, not the algorithm layer.

## All Sources

### Core Algorithms & Academic Papers
- [3DM thesis (Lindholm, 2001)](https://aaltodoc.aalto.fi/server/api/core/bitstreams/cd83234f-72c9-443d-b9f4-3ab58db341c9/content) — Three-way merge for ordered trees
- [GumTree (Falleri, 2014)](https://hal.science/hal-01054552v1/document) — AST diff via hash matching + tree edit distance
- [Semistructured Merge (Apel, 2011)](https://www.se.cs.uni-saarland.de/publications/docs/FSE2011.pdf) — Section boundaries for structure, lines within
- [Sesame (2024)](https://arxiv.org/html/2407.18888v1) — Syntactic separator insertion for semistructured merge
- [Merging with diff3 (Coglan)](https://blog.jcoglan.com/2017/05/08/merging-with-diff3/) — Deep dive into three-way merge
- [Why merges fail (Coglan)](https://blog.jcoglan.com/2017/06/19/why-merges-fail-and-what-can-be-done-about-it/) — diff3 failure modes
- [diff3 shortcomings (Rickard)](https://mattrickard.com/diff3-shortcomings) — Limitations of line-level diff3
- [Three-way structured merge methodology](https://people.cs.vt.edu/~nm8247/publications/jsa23.pdf) — Top-down + bottom-up AST merge
- [Merge tool evaluation (Schesch, ASE 2024)](https://homes.cs.washington.edu/~mernst/pubs/merge-evaluation-ase2024.pdf) — 1,120 repo evaluation

### Merge Tools
- [Weave](https://github.com/Ataraxy-Labs/weave) — Entity-level semantic merge, markdown heading-based sections
- [Mergiraf](https://codeberg.org/mergiraf/mergiraf) — Syntax-aware Git merge, 33+ languages, PCS triples
- [Spork](https://github.com/ASSERT-KTH/spork) — Structured merge for Java, 3DM + GumTree
- [3dm-rs](https://github.com/06chaynes/3dm-rs) — Rust 3DM for XML
- [node-diff3](https://github.com/bhousel/node-diff3) — JavaScript three-way merge
- [diff-match-patch-es](https://github.com/antfu/diff-match-patch-es) — ESM/TS diff-match-patch

### Markdown Parsing Ecosystem
- [mdast spec](https://github.com/syntax-tree/mdast) — No section node type; headings flat
- [remark-sectionize](https://github.com/jake-low/remark-sectionize) — Wraps headings in sections, depth 6→1
- [mdast-zone](https://github.com/syntax-tree/mdast-zone) — HTML comment zone markers
- [mdast-comment-marker](https://github.com/syntax-tree/mdast-comment-marker) — Structured comment attributes
- [remark-frontmatter](https://github.com/remarkjs/remark-frontmatter) — YAML frontmatter as AST node
- [gray-matter](https://github.com/jonschlinkert/gray-matter) — Standalone YAML frontmatter parser
- [github-slugger](https://github.com/Flet/github-slugger) — Heading slug generation

### Framework Sync Patterns
- [Copier](https://copier.readthedocs.io/) — Three-way merge with stored baseline
- [nf-core template sync](https://nf-co.re/docs/nf-core-tools/pipelines/sync) — TEMPLATE branch pattern
- [Rails app:update](https://joshmcarthur.com/til/2019/07/25/upgrading-rails-apps-with-rake-appupdate.html) — Two-way interactive diff
- [Kubebuilder scaffold markers](https://kubebuilder.io/) — Framework-owned code regions
- [Expo prebuild](https://docs.expo.dev/workflow/prebuild/) — Continuous native generation

### OT/CRDT (Evaluated and Rejected)
- [Why Cinapse moved from CRDTs](https://www.powersync.com/blog/why-cinapse-moved-away-from-crdts-for-sync) — CRDT overhead case study
- [Differential Sync (Fraser)](https://neil.fraser.name/writing/sync/) — Shadow copy continuous sync
- [xi-editor retrospective](https://raphlinus.github.io/xi/2020/06/27/xi-retrospective.html) — CRDT overcomplicated for editing

## Proposals Generated

1. `proposal.md` — Section-Level Prose Sync algorithm for `sherpa sync` (written this iteration)

## Open Questions for Next Iteration

1. **Weave integration vs custom build** — Should we use Weave's Rust core (via WASM or CLI) for the section parsing + matching, or build our own in TypeScript with remark? Need to evaluate: (a) does Weave's entity model handle stored baselines (not just git merge bases)? (b) can we call it from Node.js? (c) does it support ownership markers?

2. **Conflict UX design** — When both sides modify a section, what's the user experience? Options: git-style conflict markers in the file, interactive CLI prompt per conflict, VS Code merge editor integration, or a Studio UI for visual section-level conflict resolution. What does Copier's conflict UX look like in practice?

3. **Section ownership semantics** — How should `<!-- sherpa:managed -->` and `<!-- sherpa:owned -->` markers interact with three-way merge? What's the full taxonomy of sync policies per section? How does this map to `sherpa.config.ts`?

4. **First-sync bootstrapping** — On the first `sherpa sync` (no stored baseline), how do we distinguish upstream template sections from consumer additions? Do we treat the upstream version as the implicit base? What if the consumer already customized heavily before first sync?

5. **Performance and incremental sync** — For repos with 50+ convention files, should sync be incremental (only re-parse changed files)? Content hashing at file level as a fast-path skip? How does `.sherpa/sync-state/` scale?
