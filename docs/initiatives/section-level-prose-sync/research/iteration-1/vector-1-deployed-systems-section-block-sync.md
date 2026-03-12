# Deployed Systems That Sync at Section/Block Granularity

**Research date:** 2026-03-11
**Focus:** What production systems sync documents at section/block level rather than character/line level? Specifically: MediaWiki, Notion, Obsidian Sync, Google Docs/Wave OT, and any tools that merge at section/block granularity for prose documents.

---

## Executive Summary

No widely-deployed system syncs prose documents at **section granularity** the way we need for `sherpa sync`. The landscape breaks into three camps:

1. **Character/item-level OT/CRDT systems** (Google Docs, Google Wave, Yjs/ProseMirror) -- designed for real-time collaboration, operating at character or XML-item granularity. Too fine-grained for our batch merge use case.

2. **Block-level transactional systems** (Notion) -- sync at the block level (paragraph, heading, list item), but use last-write-wins per block. No three-way merge. Blocks have persistent UUIDs.

3. **File-level sync with character-level merge** (Obsidian Sync) -- sync whole files, then apply Google's diff-match-patch for three-way merge at the character level. No structural awareness.

4. **Section-level merge tools** (Weave, org-merge-driver) -- exist but are niche. Weave is the only production-grade tool that explicitly treats markdown headings as section-level entities for three-way merge. org-merge-driver (GSoC 2012) does this for Emacs org-mode files but is unmaintained.

**The gap we're filling is real.** Section-level prose sync for convention files is not a solved problem. The closest prior art is Weave's markdown entity model, Kustomize's strategic merge patches (for YAML), and the config extension/override patterns used by ESLint/Prettier/Helm.

---

## Key Discoveries

### 1. Notion: Block-Level Sync with Last-Write-Wins (Not Section-Level Merge)

- Notion's data model treats **every piece of content as a block** (paragraph, heading, list item, image, etc.). Each block has a UUID, properties, a type, and a parent pointer. Blocks nest via a `content` array of child block IDs. ([notion.com/blog/data-model-behind-notion](https://www.notion.com/blog/data-model-behind-notion))
- **Sync mechanism:** Changes are expressed as operations (create/update a record), batched into transactions, saved to a local TransactionQueue (IndexedDB/SQLite), then posted to `/saveTransactions` API. The server validates, commits, then notifies subscribed clients via MessageStore WebSocket. ([notion.com/blog/data-model-behind-notion](https://www.notion.com/blog/data-model-behind-notion))
- **Conflict resolution: last-write-wins per block.** If two users concurrently edit the same block, only one edit survives. Notion is reportedly working on switching to CRDT for text within blocks, but has not shipped it. ([HN discussion](https://news.ycombinator.com/item?id=27200177))
- **Synced Blocks feature:** Notion's "synced blocks" let you mirror a block (or group of blocks) across multiple pages. Editing one instance updates all others. This is conceptually similar to what we want -- a canonical upstream section that propagates to consumers -- but it's a within-workspace feature, not a cross-project sync tool. ([notion.com/help/synced-blocks](https://www.notion.com/help/synced-blocks), [notion.com/blog/designing-synced-blocks](https://www.notion.com/blog/designing-synced-blocks))
- **Granularity:** Block-level (paragraph/heading), not section-level (heading + body). A "section" in our sense spans multiple Notion blocks.
- **Implication for us:** Notion proves that block-granularity sync is viable at scale. The UUID-based identity model is worth studying. But their conflict resolution (last-write-wins) is too lossy for our use case, where we need three-way merge.

### 2. MediaWiki: Section Editing + diff3 + Paragraph-Level Conflict UI

- MediaWiki has **native section editing** -- users can edit individual sections (delimited by `==` headings) without loading the full page. When saving, the server merges the section back into the page. ([mediawiki.org/wiki/Help:Section](https://www.mediawiki.org/wiki/Help:Section))
- **Three-way merge via external diff3:** MediaWiki's `wfMerge()` function in `GlobalFunctions.php` calls the GNU diff3 utility to perform three-way merge of edit conflicts. This is line-level merge, not section-level. ([phabricator.wikimedia.org/T27598](https://phabricator.wikimedia.org/T27598))
- **Edit conflict detection:** If two users edit the same page, the server compares the "base revision" each user started from. If they edited different sections, diff3 typically merges cleanly. If they touched overlapping lines, a conflict is raised. ([mediawiki.org/wiki/Help:Edit_conflict](https://www.mediawiki.org/wiki/Help:Edit_conflict))
- **Paragraph-Based Edit Conflict Interface (TwoColConflict):** This MediaWiki extension provides a **paragraph-level conflict resolution UI**. It displays conflicting text passages side-by-side: the remote version in yellow, your version in blue, with inline diffs highlighted. Users pick which version of each paragraph to keep. This is the closest thing to section-level merge in MediaWiki, but it's a **UI layer** on top of the existing line-level diff3, not a new merge algorithm. ([mediawiki.org/wiki/Extension:TwoColConflict](https://www.mediawiki.org/wiki/Extension:TwoColConflict), [mediawiki.org/wiki/Help:Paragraph-based_Edit_Conflict_Interface](https://www.mediawiki.org/wiki/Help:Paragraph-based_Edit_Conflict_Interface))
- **Section-level scope:** When a user performs a section edit and a conflict occurs, the conflict historically expanded to the entire article (bug T6745). This was a known pain point. ([phabricator.wikimedia.org/T6745](https://phabricator.wikimedia.org/T6745))
- **Implication for us:** MediaWiki's architecture validates the "section as unit of editing" concept. Their paragraph-level conflict UI (TwoColConflict) is relevant UX inspiration. But their merge engine is line-level diff3 under the hood.

### 3. Google Docs / Google Wave: Character/Item-Level OT

- **Google Wave OT whitepaper** defines the document model: "every character, start tag or end tag in a document is called an **item**. Gaps between items are called **positions**." Operations are sequences of: retain, insert characters, insert/delete element start/end tags, delete characters, replace/update attributes, annotation boundary markers. ([svn.apache.org/repos/asf/incubator/wave/whitepapers/operational-transform/operational-transform.html](https://svn.apache.org/repos/asf/incubator/wave/whitepapers/operational-transform/operational-transform.html))
- **Granularity: item-level** (character + XML tag). The document is a structured XML-like tree with annotations, but OT operates on the linear sequence of items, not on tree nodes. ([svn.apache.org Wave OT](https://svn.apache.org/repos/asf/incubator/wave/whitepapers/operational-transform/operational-transform.html))
- **Google Docs** uses the same OT foundation. Each keystroke becomes an operation with position and content. The server transforms concurrent operations to maintain consistency. Operations are character-granularity. ([loremine.com](https://www.loremine.com/blogs/operational-transformation-algorithm-behind-google-docs), [Wikipedia: OT](https://en.wikipedia.org/wiki/Operational_transformation))
- **Structural elements** (paragraphs, headings) are represented via start/end tags in the item sequence, but OT does not have "paragraph-level" or "section-level" operations -- it transforms at the item level regardless of document structure.
- **Client-server architecture:** Client edits local copy, sends operations to server, server transforms and broadcasts. Client waits for server acknowledgement before sending more operations (modified Jupiter protocol). ([svn.apache.org Wave OT](https://svn.apache.org/repos/asf/incubator/wave/whitepapers/operational-transform/operational-transform.html))
- **Implication for us:** OT solves a fundamentally different problem (real-time collaboration with sub-second latency). Its character-level granularity is irrelevant for batch file sync. The approach is too fine-grained and too complex for our use case.

### 4. Obsidian Sync: File-Level Sync with diff-match-patch

- **File-level sync:** Obsidian Sync tracks changes at the individual file level, transferring only modified files. It uses DigitalOcean infrastructure with regional data centers. Local vaults connect directly to remote vaults via the Sync plugin. ([help.obsidian.md/sync](https://help.obsidian.md/sync), [forum.obsidian.md/t/obsidian-syncs-operating-architecture/96728](https://forum.obsidian.md/t/obsidian-syncs-operating-architecture/96728))
- **Markdown conflict resolution:** Uses **Google's diff-match-patch** algorithm for three-way merge. This operates at the **character level** -- it's a character-diff-based algorithm, not a structural one. It creates patches from base-to-remote, then applies those patches to the local version. ([deepwiki.com/obsidianmd/obsidian-help](https://deepwiki.com/obsidianmd/obsidian-help/2.3-filters-and-views), [forum.obsidian.md/t/robust-sync-conflict-resolution/93544](https://forum.obsidian.md/t/robust-sync-conflict-resolution/93544))
- **No structural awareness:** The diff-match-patch library has no concept of markdown headings, sections, or document structure. It treats the file as a plain string.
- **JSON settings merge:** Obsidian settings (plugin configs etc.) get a separate strategy: JSON key-level merge (local keys override remote). This is a form of structured merge, but only for settings JSON. ([deepwiki.com/obsidianmd/obsidian-help](https://deepwiki.com/obsidianmd/obsidian-help/2.3-filters-and-views))
- **Configuration since v1.9.7:** Users can choose between automatic merge (default) or creating conflict files (separate `.sync-conflict-*` files for manual resolution). ([retypeapp.github.io/obsidian/sync/troubleshoot](https://retypeapp.github.io/obsidian/sync/troubleshoot/))
- **Implication for us:** Obsidian Sync demonstrates that file-level sync + character-level merge is the common approach, but also shows its limitations -- users report duplicate text and formatting problems from automatic merges. Section-level merge would eliminate most of these issues.

### 5. Weave: Entity-Level Merge with Heading-Based Sections for Markdown

- **The most directly relevant tool.** Weave (Ataraxy Labs, 2026) is a Git merge driver that parses files into semantic entities using tree-sitter and performs three-way merge at the entity level. For Markdown, entities are **"heading-based sections."** ([ataraxy-labs.github.io/weave](https://ataraxy-labs.github.io/weave/), [github.com/Ataraxy-Labs/weave](https://github.com/Ataraxy-Labs/weave))
- **Entity model for markdown:** Each heading and its content until the next heading of equal/higher level constitutes an entity. Entity identity: `name + type + scope` (heading text + heading level + parent heading). ([ataraxy-labs.github.io/weave](https://ataraxy-labs.github.io/weave/))
- **Algorithm:** Parse all three versions (base, ours, theirs) into entities via tree-sitter. Extract alternating entity and interstitial regions. Match entities by composite ID. Resolve: one-side change wins; both-changed attempts intra-entity three-way merge. Reconstruct file preserving ours-side ordering. Fallback to line-level for large/binary/unsupported files. ([github.com/Ataraxy-Labs/weave](https://github.com/Ataraxy-Labs/weave))
- **Performance:** 31/31 clean merges (100%) vs mergiraf 26/31 (83%) vs git 15/31 (48%). Individual merges: 65-374 microseconds. ([github.com/Ataraxy-Labs/weave](https://github.com/Ataraxy-Labs/weave))
- **MCP server integration:** Weave ships as an MCP server with 14 tools for agent coordination, including entity-level claiming, conflict prediction, and merge preview. ([github.com/Ataraxy-Labs/weave](https://github.com/Ataraxy-Labs/weave))
- **Limitation for our use case:** Weave is designed as a Git merge driver (three versions from git's merge base). Our `sherpa sync` needs a three-way merge where the base is the "last-synced version" stored as provenance metadata, not git's merge base. We'd need to invoke Weave's merge with custom base/ours/theirs, or adapt its algorithm.

### 6. org-merge-driver: Section-Level Merge for Emacs Org-Mode

- **GSoC 2012 project:** A specialized Git merge driver for Org-Mode files that understands headings as section boundaries. It parses the org-mode outline tree, detects modifications at the section level, and performs three-way merge respecting the tree structure. ([orgmode.org GSoC 2012 proposal](https://orgmode.org/worg/archive/gsoc2012/student-projects/git-merge-tool/proposal.html), [github.com/timoc/org-merge-driver](https://github.com/timoc/org-merge-driver))
- **Algorithm:** (1) Parse org-mode file into a tree of objects (headings define structure). (2) Detect modifications between versions (add, delete, update, move of sections). (3) Merge modification lists, generating conflicts for unmergable changes. (4) Reconstruct merged file.
- **Section identity:** Based on heading text (stars + title). Attempts to recognize move operations (delete + add of same heading = move).
- **Status:** Unmaintained. The implementation exists in C. The GSoC project pages return 404 at their original URLs (archived copies exist). ([orgmode.org/worg/archive/](https://orgmode.org/worg/archive/gsoc2012/student-projects/git-merge-tool/index.html))
- **Implication for us:** Validates that section-level merge for heading-structured documents is a real pattern someone actually built. The algorithm design (parse to heading tree, diff at section level, merge, reconstruct) is exactly what we're proposing.

### 7. Mergiraf: AST-Level Merge for Structured Formats (Not Markdown)

- **Syntax-aware Git merge driver** supporting 33+ languages and JSON, YAML, TOML, XML, HTML. Uses tree-sitter + GumTree classic algorithm. Written in Rust. ([mergiraf.org](https://mergiraf.org/), [mergiraf.org/architecture.html](https://mergiraf.org/architecture.html))
- **Does NOT support Markdown** as of this writing. ([mergiraf.org/languages.html](https://mergiraf.org/languages.html))
- **Architecture is the gold standard for our reference.** Nine-stage pipeline: parse -> match (GumTree) -> class-mapping -> PCS triple conversion -> triple merging -> result building -> delete/modify conflict detection -> duplicate signature detection -> rendering. Falls back to line-based when structured merge fails. ([mergiraf.org/architecture.html](https://mergiraf.org/architecture.html))
- **JSON/YAML merge:** For structured data formats, Mergiraf provides semantic merge -- inserting a key in one branch and modifying a value in another won't conflict, even if they're adjacent lines. This is directly relevant for config file sync (e.g., `sherpa.config.ts`).
- **Implication for us:** If Mergiraf added markdown support (which is feasible since tree-sitter has a markdown grammar), it would be another option. For now, Weave is the only tool with explicit markdown section support.

### 8. Kustomize Strategic Merge Patches: Section-Level Config Overlay (YAML)

- **Kustomize** uses "overlays" and "bases" for Kubernetes YAML config. The `patchesStrategicMerge` mechanism patches only the fields specified in the patch YAML, using field-type-aware merge: replace scalars, merge maps, use merge keys for lists. ([kubernetes.io/docs/tasks/manage-kubernetes-objects/kustomization](https://kubernetes.io/docs/tasks/manage-kubernetes-objects/kustomization/), [fosstechnix.com](https://www.fosstechnix.com/strategic-merge-patches-in-kubernetes-using-kustomize/))
- **This is the closest analog to what `sherpa sync` needs for config files.** Base values come from the framework. Overlays customize specific fields. Upstream changes to non-overlaid fields propagate automatically.
- **Limitation:** YAML-specific. Doesn't work for markdown prose. The merge strategy is baked into Kubernetes API definitions (which fields merge vs replace).
- **Implication for us:** The base/overlay model is the right mental model for `sherpa sync`. Framework ships a base config. Consumer project overrides specific sections. Sync applies upstream changes to non-overridden sections.

### 9. ESLint/Prettier Config Extend/Override Pattern

- **ESLint's `extends`** mechanism lets you start with a shared config (Airbnb, StandardJS, framework-provided) and override specific rules. Multiple configs are merged with later entries taking precedence. ([eslint.org/docs/latest/use/configure/configuration-files](https://eslint.org/docs/latest/use/configure/configuration-files))
- **Prettier's `eslint-config-prettier`** turns off rules that conflict with Prettier, meant to be the last entry in `extends` so it overrides earlier configs.
- **Mental model:** Layered config where each layer can override specific keys from layers below. This is deep-merge semantics, not three-way merge.
- **Implication for us:** For structured config files (JSON/YAML), the extends/override pattern works well. For prose files (CLAUDE.md), we need something that understands section structure, not just key-value hierarchy.

### 10. GitHub Template Sync Actions: File-Level Only

- **actions-template-sync** ([github.com/AndreasAugustin/actions-template-sync](https://github.com/AndreasAugustin/actions-template-sync)) syncs downstream repos with template repos. Uses git merge under the hood (`--allow-unrelated-histories --strategy=recursive --no-edit`). Selective exclusion via `.templatesyncignore` (gitignore-style glob patterns).
- **ahmadnassri/action-template-repository-sync** ([github.com/ahmadnassri/action-template-repository-sync](https://github.com/ahmadnassri/action-template-repository-sync)) copies specific files from template repo to consumer repos. Can remap paths.
- **Granularity: file-level.** You can include/exclude entire files, but you cannot exclude a section within a file. If you customize part of a README and upstream changes the rest, you get a git merge conflict.
- **Implication for us:** These tools confirm the problem we're solving. File-level sync is the state of the art for template repos. Nobody does section-level sync for markdown templates today.

### 11. CRDT Systems (Yjs, Automerge, Peritext): Character/Block-Level

- **Yjs** maps ProseMirror block nodes to YXmlElement and text nodes to YXmlText. Sync happens at the CRDT operation level (individual character insertions/deletions, attribute changes). ([docs.yjs.dev](https://docs.yjs.dev/), [deepwiki.com/TypeCellOS/BlockNote/8.1-yjs-integration](https://deepwiki.com/TypeCellOS/BlockNote/8.1-yjs-integration))
- **Automerge** is a JSON-like CRDT that syncs changes at the field level. For text, it uses an RGA sequence CRDT. Rich text uses Peritext internally. ([automerge.org](https://automerge.org/), [github.com/automerge/automerge](https://github.com/automerge/automerge))
- **Peritext** (Ink & Switch) handles inline formatting (bold, italic) via span annotations linked to stable character IDs. Block-level elements (headings, bullet points) are listed as future work. ([inkandswitch.com/peritext](https://www.inkandswitch.com/peritext/), [github.com/inkandswitch/peritext](https://github.com/inkandswitch/peritext))
- **Apple Notes** uses CRDTs internally for syncing via CloudKit, with change tags for conflict detection. ([developer.apple.com/forums](https://developer.apple.com/forums/thread/743493))
- **Implication for us:** CRDTs solve real-time collaboration, not batch file sync. Their granularity (character/operation level) is too fine for our use case. However, the concept of "stable identity per element" from CRDTs is directly applicable to our section ID strategy.

### 12. diff-match-patch: Character-Level Three-Way Merge Library

- **Google's diff-match-patch** (2006) is the foundation used by Obsidian Sync and many other tools for three-way merge. It works by creating patches from base-to-version2, then applying those patches to version1. ([github.com/google/diff-match-patch](https://github.com/google/diff-match-patch))
- **Granularity: character-level.** The library supports line or word diffs as a cleanup pass, but the core algorithm is character-based.
- **Three-way merge is not a first-class operation** -- it's composed from diff + patch. This means it doesn't have the precision of a true three-way merge that knows the base version's role. ([groups.google.com/g/diff-match-patch](https://groups.google.com/g/diff-match-patch/c/6HK8QKgc5Pc))
- **Implication for us:** diff-match-patch could be used as the intra-section merge engine (when both upstream and consumer modify the same section, use diff-match-patch to merge the section body). But it should not be the top-level merge strategy -- that should be section-aware.

### 13. The Awesome Merge Drivers List: Survey of Structured Merge

- **jelmer/awesome-merge-drivers** ([github.com/jelmer/awesome-merge-drivers](https://github.com/jelmer/awesome-merge-drivers)) catalogs all known custom Git merge drivers. Key entries relevant to our work:
  - **Weave** -- entity-level semantic merge for Markdown (heading sections), JSON, YAML, TOML, code
  - **Mergiraf** -- AST-level merge for JSON, YAML, TOML, HTML, XML, code (not Markdown)
  - **org-merge-driver** -- section-level merge for Emacs Org-Mode
  - **git-json-merge** -- key-level merge for JSON files
  - **git-merge-drivers (rmedaer)** -- JSON and YAML semantic merge
  - **nbdime** -- notebook-level merge for Jupyter notebooks (cell-level granularity)
  - **DMFO** -- Word .docx merge
  - **composer / npm-merge-driver / cargo-merge-driver** -- dependency lock file merge (package-level)
  - **Spork / JDime / FSTMerge** -- AST-level merge for Java
- **Notable absence:** No dedicated markdown section-level merge driver exists besides Weave's general-purpose entity-level merge.

### 14. mdast Ecosystem: Building Blocks for Section-Level Operations

- **mdast-util-heading-range** ([github.com/syntax-tree/mdast-util-heading-range](https://github.com/syntax-tree/mdast-util-heading-range)) -- finds a heading matching a test, captures all nodes until the next heading of same/lower depth, calls a handler. Used by remark-toc. This utility defines exactly the section boundary algorithm.
- **mdast-zone** ([github.com/syntax-tree/mdast-zone](https://github.com/syntax-tree/mdast-zone)) -- uses HTML comments as zone markers (`<!--name start-->` ... `<!--name end-->`). The handler receives start, nodes, end. This is the existing pattern for stable section IDs.
- **remark-sectionize** ([github.com/jake-low/remark-sectionize](https://github.com/jake-low/remark-sectionize)) -- wraps headings + content into section nodes. Processes deepest-first (6 to 1) to form nested tree correctly.
- **tree-sitter-markdown** ([github.com/tree-sitter-grammars/tree-sitter-markdown](https://github.com/tree-sitter-grammars/tree-sitter-markdown)) -- produces a **flat** AST where headings are siblings. Does NOT produce hierarchical sections. Follows CommonMark spec where headings are "leaf blocks", not containers. Post-processing required to build section tree. ([github.com/ikatyang/tree-sitter-markdown/issues/19](https://github.com/ikatyang/tree-sitter-markdown/issues/19))
- **Implication for us:** The remark/unified ecosystem has all the building blocks. We parse markdown with remark, build a section tree with remark-sectionize's algorithm, assign IDs (via heading slugs or comment markers), hash section bodies for change detection, and perform section-level three-way merge.

---

## Comparative Summary Table

| System | Sync Granularity | Merge Strategy | Prose-Aware | Section/Block | Three-Way |
|--------|-----------------|----------------|-------------|---------------|-----------|
| Google Docs/Wave | Character/item | OT | No (position-based) | No | N/A (real-time) |
| Notion | Block (paragraph) | Last-write-wins | No | Blocks, not sections | No |
| Obsidian Sync | File | diff-match-patch (character) | No | No | Yes (via patches) |
| MediaWiki | Line (diff3) | Line-level 3-way merge | No | Section editing only | Yes |
| MediaWiki TwoColConflict | Paragraph (UI only) | Line-level diff3 underneath | Partial (paragraph UI) | UI only | Yes |
| Yjs/ProseMirror | Character/node | CRDT | Node-type-aware | Block nodes | N/A (CRDT) |
| Automerge/Peritext | Character | CRDT | Inline formatting | Inline only (blocks TBD) | N/A (CRDT) |
| Git (merge-ort) | Line | diff3/histogram | No | No | Yes |
| **Weave** | **Entity (heading section)** | **Entity-level 3-way** | **Yes (heading-based)** | **Yes** | **Yes** |
| org-merge-driver | Section (heading) | Section-level 3-way | Yes (org headings) | Yes | Yes |
| Mergiraf | AST node | PCS triple merge | No (code/JSON/YAML) | AST nodes | Yes |
| Kustomize | YAML field | Strategic merge patch | No | YAML paths | Two-way overlay |
| diff-match-patch | Character | Patch-based | No | No | Yes (via patches) |
| Template sync actions | File | Git merge | No | No | Via git |

---

## Implications for `sherpa sync`

### 1. We're building something genuinely new for prose files

No production system syncs markdown prose at section granularity with three-way merge. Weave comes closest but is designed as a Git merge driver, not a CLI sync tool. Our `sherpa sync` concept -- where a framework ships convention files (CLAUDE.md, config), consumers customize sections, and `sherpa sync` merges upstream changes while preserving consumer customizations -- has no direct precedent for prose files.

### 2. The algorithm design is validated by multiple systems

The approach we outlined in iteration-1 research (parse to section tree, match by heading identity, three-way classify each section, reconstruct) is the same pattern used by:
- **Weave** for markdown entity merge
- **org-merge-driver** for org-mode section merge
- **Mergiraf/Spork** for code AST merge (generalized to any tree)
- **Kustomize** for YAML config overlay (conceptually similar)

### 3. Two distinct merge strategies needed for two file types

- **Prose files (CLAUDE.md, docs):** Section-level merge. Parse markdown to heading tree. Match sections by heading slug. Three-way classify (upstream-only change, consumer-only change, both changed, section added/deleted). Use diff-match-patch or line-diff for intra-section merge when both sides changed.
- **Config files (sherpa.config.ts, package.json, YAML):** Key-level deep merge. Similar to Kustomize strategic merge or ESLint extends/override. Leverage existing tools (Mergiraf for JSON/YAML, or deep-merge libraries).

### 4. The "base version" problem

Most merge tools use git's merge-base as the common ancestor. `sherpa sync` needs a different base: the **last-synced version** of each file. This is the version of the upstream file that was last incorporated into the consumer project. We need provenance tracking -- storing a hash or snapshot of the upstream version that was synced, so we can compute a proper three-way diff.

Options:
- Store upstream snapshot in a metadata file (`.sherpa/sync-state.json` mapping file paths to upstream commit hashes or content hashes)
- Use git notes or tags to mark sync points
- Store the base version directly (`.sherpa/bases/CLAUDE.md` containing the last-synced upstream content)

### 5. Section ownership model

Drawing from Kustomize's base/overlay pattern and ESLint's extends/override pattern, we should support explicit section ownership:
- **Framework-owned sections:** Consumer can read but `sherpa sync` always takes upstream changes. Consumer modifications are overwritten (with warning).
- **Consumer-owned sections:** Framework does not touch. Upstream additions to these sections are ignored.
- **Shared sections:** Three-way merge. Both sides can modify. Conflicts are reported at section level.
- **Default:** Shared (three-way merge for all sections).

Ownership could be declared in frontmatter, in a `.sherpa/sync-config.yaml`, or via HTML comment markers in the markdown itself.

### 6. The Notion synced blocks concept maps to our use case

Notion's synced blocks let you create a canonical block that mirrors everywhere it appears. When you update the original, all copies update. This is conceptually what `sherpa sync` does for framework-owned sections -- the framework is the "original" and consumer projects receive mirrors. The difference is that we support bidirectional customization (consumer can modify shared sections), while Notion synced blocks are one-way (original -> copies).

---

## Sources

### Primary Systems Investigated

- [Notion data model blog post](https://www.notion.com/blog/data-model-behind-notion) -- Block-based architecture, transaction model, sync mechanism
- [Notion synced blocks help](https://www.notion.com/help/synced-blocks) -- Synced blocks feature documentation
- [Notion synced blocks design blog](https://www.notion.com/blog/designing-synced-blocks) -- Design thinking behind synced blocks
- [Notion data model HN discussion](https://news.ycombinator.com/item?id=27200177) -- Community discussion of Notion's data model, mentions last-write-wins
- [Notion backend architecture (Relbis)](https://labs.relbis.com/blog/2024-04-18_notion_backend/) -- Examination of Notion's backend
- [MediaWiki edit conflict help](https://www.mediawiki.org/wiki/Help:Edit_conflict) -- How edit conflicts work in MediaWiki
- [MediaWiki section editing help](https://www.mediawiki.org/wiki/Help:Section) -- Section editing documentation
- [MediaWiki TwoColConflict extension](https://www.mediawiki.org/wiki/Extension:TwoColConflict) -- Paragraph-based edit conflict interface
- [MediaWiki TwoColConflict help](https://www.mediawiki.org/wiki/Help:Paragraph-based_Edit_Conflict_Interface) -- User guide for paragraph-based conflicts
- [MediaWiki diff3 bug (T27598)](https://phabricator.wikimedia.org/T27598) -- Discussion of diff3 dependency and PHP fallback
- [MediaWiki section conflict bug (T6745)](https://phabricator.wikimedia.org/T6745) -- Section edit conflict expanding to full article
- [MediaWiki better conflict solutions (T139601)](https://phabricator.wikimedia.org/T139601) -- Design discussion for improved conflict handling
- [MediaWiki interactive conflict tool (T108664)](https://phabricator.wikimedia.org/T108664) -- Feature request for interactive conflict resolution
- [Google Wave OT whitepaper](https://svn.apache.org/repos/asf/incubator/wave/whitepapers/operational-transform/operational-transform.html) -- Definitive OT specification with item-level document model
- [Google Wave federation architecture](https://svn.apache.org/repos/asf/incubator/wave/whitepapers/google-wave-architecture/google-wave-architecture.html) -- Federation protocol
- [Google Wave conversation model](https://svn.apache.org/repos/asf/incubator/wave/whitepapers/conversation/convspec.html) -- Conversation structure specification
- [Google Wave client-server protocol](https://svn.apache.org/repos/asf/incubator/wave/whitepapers/client-server-protocol/client-server-protocol.html) -- Client-server protocol
- [OT Wikipedia](https://en.wikipedia.org/wiki/Operational_transformation) -- Overview with history and data model description
- [OT behind Google Docs (loremine)](https://www.loremine.com/blogs/operational-transformation-algorithm-behind-google-docs) -- Google Docs OT explanation
- [Google Docs OT (dev.to)](https://dev.to/dhanush___b/how-google-docs-uses-operational-transformation-for-real-time-collaboration-119) -- How Google Docs uses OT
- [CRDTs vs OT (systemdr)](https://systemdr.substack.com/p/crdts-vs-operational-transformation) -- Comparison of approaches
- [OT behind Google Docs (substack)](https://programmingappliedai.substack.com/p/how-google-docs-handles-real-time) -- Real-time editing implementation
- [Google Docs system design (enjoyalgorithms)](https://www.enjoyalgorithms.com/blog/design-google-docs/) -- System design overview
- [Google Docs 2010 OT PDF](https://idl.uw.edu/future-scholarly-communication/files/2010-GoogleDocs-OT.pdf) -- Original Google Docs presentation
- [Obsidian Sync help](https://help.obsidian.md/sync) -- Official sync documentation
- [Obsidian Sync settings](https://help.obsidian.md/sync/settings) -- Sync configuration
- [Obsidian Sync architecture forum post](https://forum.obsidian.md/t/obsidian-syncs-operating-architecture/96728) -- Community discussion of architecture
- [Obsidian Sync conflict resolution](https://forum.obsidian.md/t/robust-sync-conflict-resolution/93544) -- Detailed conflict resolution discussion
- [Obsidian Sync conflict resolution (DeepWiki)](https://deepwiki.com/obsidianmd/obsidian-help/2.3-filters-and-views) -- diff-match-patch usage documented
- [Obsidian Sync engine forum](https://forum.obsidian.md/t/obsidian-sync-engine/65105) -- Discussion of sync engine internals
- [Obsidian Sync troubleshooting](https://retypeapp.github.io/obsidian/sync/troubleshoot/) -- Troubleshooting guide with version info
- [Obsidian manual sync conflict handling](https://forum.obsidian.md/t/option-to-let-user-manually-resolve-sync-conflicts/94468) -- Feature request discussion

### Merge Tools and Drivers

- [Weave GitHub](https://github.com/Ataraxy-Labs/weave) -- Entity-level semantic merge with markdown heading-based sections
- [Weave documentation](https://ataraxy-labs.github.io/weave/) -- Documents "heading-based sections" as markdown entity type
- [Weave HN discussion](https://news.ycombinator.com/item?id=47241976) -- Community discussion
- [Weave article (TopAIProduct)](https://topaiproduct.com/2026/03/04/weave-finally-makes-git-merges-understand-your-code/) -- Overview article
- [org-merge-driver GitHub](https://github.com/timoc/org-merge-driver) -- Section-level merge for org-mode
- [org-merge-driver GSoC proposal](https://orgmode.org/worg/archive/gsoc2012/student-projects/git-merge-tool/proposal.html) -- Original design proposal (may 404)
- [org-merge-driver GSoC index](https://orgmode.org/worg/archive/gsoc2012/student-projects/git-merge-tool/index.html) -- Project page
- [Mergiraf](https://mergiraf.org/) -- Syntax-aware merge driver
- [Mergiraf architecture](https://mergiraf.org/architecture.html) -- Detailed nine-stage pipeline
- [Mergiraf Codeberg](https://codeberg.org/mergiraf/mergiraf) -- Source code
- [Mergiraf HN](https://news.ycombinator.com/item?id=42093756) -- Community discussion
- [Mergiraf LWN](https://lwn.net/Articles/1042355/) -- LWN.net article
- [Awesome merge drivers](https://github.com/jelmer/awesome-merge-drivers) -- Comprehensive list of Git merge drivers
- [Custom merge driver tutorial](https://www.gregmicek.com/software-coding/2020/01/13/how-to-write-a-custom-git-merge-driver/) -- How to write a custom driver
- [Custom merge driver example](https://github.com/Praqma/git-merge-driver) -- Example implementation
- [Git merge-config docs](https://git-scm.com/docs/merge-config) -- Git merge driver configuration
- [SemanticMerge features](https://www.semanticmerge.com/features) -- Commercial semantic merge
- [SemanticMerge guide](https://www.semanticmerge.com/sm-guides/main) -- SemanticMerge user guide
- [Spork GitHub](https://github.com/ASSERT-KTH/spork) -- AST-based structured merge for Java
- [JDime GitHub](https://github.com/se-sic/jdime) -- Structural merge for Java
- [FSTMerge/s3m GitHub](https://github.com/guilhermejccavalcanti/s3m) -- Semistructured merge
- [jsFSTMerge GitHub](https://github.com/AlbertoTrindade/jsFSTMerge) -- Semistructured merge for JavaScript
- [LastMerge paper](https://arxiv.org/html/2507.19687) -- Language-agnostic structured merge
- [nbdime GitHub](https://github.com/jupyter/nbdime) -- Notebook-level merge for Jupyter
- [git-json-merge](https://github.com/jonatanpedersen/git-json-merge) -- JSON merge driver
- [git-merge-drivers (rmedaer)](https://github.com/rmedaer/git-merge-drivers) -- JSON and YAML merge drivers

### CRDT and Collaboration Libraries

- [diff-match-patch GitHub](https://github.com/google/diff-match-patch) -- Google's diff/match/patch library
- [diff-match-patch three-way discussion](https://groups.google.com/g/diff-match-patch/c/6HK8QKgc5Pc) -- Three-way merge via patch composition
- [diff-match-patch API wiki](https://github.com/google/diff-match-patch/wiki/API) -- API documentation
- [Yjs docs](https://docs.yjs.dev/) -- CRDT for collaborative editing
- [Yjs GitHub](https://github.com/yjs/yjs) -- Yjs source
- [Yjs + ProseMirror forum](https://discuss.prosemirror.net/t/offline-peer-to-peer-collaborative-editing-using-yjs/2488) -- Integration discussion
- [ProseMirror collab](https://marijnhaverbeke.nl/blog/collaborative-editing.html) -- Collaborative editing in ProseMirror
- [ProseMirror collab npm](https://www.npmjs.com/package/prosemirror-collab) -- Collab module
- [ProseMirror guide](https://prosemirror.net/docs/guide/) -- ProseMirror documentation
- [Automerge](https://automerge.org/) -- CRDT library
- [Automerge GitHub](https://github.com/automerge/automerge) -- Source code
- [Automerge document data model](https://automerge.org/docs/reference/documents/) -- Document structure reference
- [Peritext project](https://www.inkandswitch.com/peritext/) -- CRDT for rich text with inline formatting
- [Peritext GitHub](https://github.com/inkandswitch/peritext) -- Source code
- [Peritext paper](https://www.inkandswitch.com/peritext/static/cscw-publication.pdf) -- Academic paper
- [Peritext block elements issue](https://lightrun.com/answers/inkandswitch-peritext-what-could-be-the-direction-for-making-peritext-support-block-elements) -- Block element discussion
- [CRDTs for shared editing (Kevin Jahns)](https://blog.kevinjahns.de/are-crdts-suitable-for-shared-editing) -- Analysis by Yjs author
- [CRDTs introduction (objc.io)](https://talk.objc.io/episodes/S01E294-crdts-introduction) -- CRDT basics

### Config Overlay and Template Sync

- [Kustomize documentation](https://kubernetes.io/docs/tasks/manage-kubernetes-objects/kustomization/) -- Bases, overlays, strategic merge patches
- [Kustomize strategic merge patches](https://www.fosstechnix.com/strategic-merge-patches-in-kubernetes-using-kustomize/) -- Tutorial with examples
- [Kustomize strategic merge 2026](https://oneuptime.com/blog/post/2026-02-09-kustomize-strategic-merge-patches/view) -- Recent tutorial
- [Helm values merge](https://medium.com/@bavicnative/helm-advanced-values-overrides-and-dependencies-35976b996143) -- Helm values overlay strategy
- [Helm + Kustomize](https://jfrog.com/blog/power-up-helm-charts-using-kustomize-to-manage-kubernetes-deployments/) -- Combined approach
- [Replicated Ship](https://github.com/replicatedhq/ship) -- Upstream chart management with Kustomize overlays
- [ESLint config docs](https://eslint.org/docs/latest/use/configure/configuration-files) -- extends/override pattern
- [eslint-config-prettier](https://www.npmjs.com/package/eslint-config-prettier) -- Config override example
- [actions-template-sync](https://github.com/AndreasAugustin/actions-template-sync) -- GitHub template repository sync action
- [actions-template-sync architecture](https://andreasaugustin.github.io/actions-template-sync/ARCHITECTURE/) -- Architecture documentation
- [ahmadnassri/action-template-repository-sync](https://github.com/ahmadnassri/action-template-repository-sync) -- Alternative template sync
- [kota65535/github-template-sync-action](https://github.com/kota65535/github-template-sync-action) -- Another template sync action
- [GitHub template sync discussion](https://github.com/orgs/community/discussions/23528) -- Community discussion of template sync limitations
- [Downstream from template (Medium)](https://medium.com/geekculture/how-to-use-git-to-downstream-changes-from-a-template-9f0de9347cc2) -- Git-based approach
- [Renovate config presets](https://docs.renovatebot.com/config-presets/) -- Shareable config with merge semantics
- [Renovate config overview](https://docs.renovatebot.com/config-overview/) -- Config merging and precedence
- [Renovate upgrade practices](https://docs.renovatebot.com/upgrade-best-practices/) -- Upgrade strategy

### Markdown AST and Section Utilities

- [mdast spec](https://github.com/syntax-tree/mdast) -- Markdown AST format (no section node)
- [remark](https://github.com/remarkjs/remark) -- Markdown processor
- [mdast-util-heading-range](https://github.com/syntax-tree/mdast-util-heading-range) -- Section extraction by heading
- [mdast-zone](https://github.com/syntax-tree/mdast-zone) -- HTML comment-based zone markers
- [mdast-comment-marker](https://github.com/syntax-tree/mdast-comment-marker) -- Structured comment parsing
- [remark-sectionize](https://github.com/jake-low/remark-sectionize) -- Wrap headings in section nodes
- [tree-sitter-markdown](https://github.com/tree-sitter-grammars/tree-sitter-markdown) -- Tree-sitter grammar (flat headings)
- [tree-sitter-markdown hierarchy issue](https://github.com/ikatyang/tree-sitter-markdown/issues/19) -- Why headings are flat
- [remark-frontmatter](https://github.com/remarkjs/remark-frontmatter) -- YAML/TOML frontmatter parsing

### Config Languages and Deep Merge

- [CUE lang discussion](https://github.com/cue-lang/cue/discussions/669) -- Comparison of CUE, Jsonnet, Dhall
- [Comparing Jsonnet, Dhall, Cue](https://pv.wtf/posts/taming-the-beast) -- Configuration language comparison
- [Spruce BOSH merge tool](https://github.com/geofffranks/spruce) -- YAML merge with operators
- [Fusion CLI](https://github.com/edgelaboratories/fusion) -- JSON/YAML/TOML merge CLI
- [boxboat/config-merge](https://github.com/boxboat/config-merge) -- JSON/TOML/YAML merge tool
- [deepmerge vs lodash.merge](https://npm-compare.com/deepmerge,lodash.merge,merge-deep,merge-options) -- JavaScript deep merge libraries
- [Lodash merge guide](https://thesyntaxdiaries.com/lodash-merge-a-comprehensive-guide) -- Deep merge reference

### Academic and Research Papers

- [Three-way structured merge methodology](https://people.cs.vt.edu/~nm8247/publications/jsa23.pdf) -- Top-down + bottom-up approach
- [3DM thesis (Lindholm)](https://aaltodoc.aalto.fi/server/api/core/bitstreams/cd83234f-72c9-443d-b9f4-3ab58db341c9/content) -- Foundational tree merge algorithm
- [3DM on Semantic Scholar](https://www.semanticscholar.org/paper/A-three-way-merge-for-XML-documents-Lindholm/fbcdd491baaff3e604ac3c790d4940438cc7630c) -- DocEng 2004
- [GumTree paper](https://hal.science/hal-01054552v1/document) -- AST differencing algorithm
- [Merge evaluation (ASE 2024)](https://homes.cs.washington.edu/~mernst/pubs/merge-evaluation-ase2024.pdf) -- Largest merge tool evaluation
- [Semistructured merge (Apel)](https://www.se.cs.uni-saarland.de/publications/docs/FSE2011.pdf) -- FSTMerge foundational paper
- [Mastery preprint](https://paulz.me/files/mastery-preprint.pdf) -- Shifted-code-aware structured merge
- [Three-way merge overview (revctrl.org)](https://tonyg.github.io/revctrl.org/ThreeWayMerge.html) -- Three-way merge fundamentals
- [diff3 Wikipedia](https://en.wikipedia.org/wiki/Diff3) -- diff3 algorithm reference
- [Merging with diff3 (Coglan)](https://blog.jcoglan.com/2017/05/08/merging-with-diff3/) -- Accessible diff3 explanation
- [Server architectures for collaboration](https://mattweidner.com/2024/06/04/server-architectures.html) -- Central server collaboration patterns

---

## Raw Link List

Every URL encountered during this research iteration, including those not fully explored:

```
https://www.notion.com/blog/data-model-behind-notion
https://www.notion.com/help/synced-blocks
https://www.notion.com/blog/designing-synced-blocks
https://news.ycombinator.com/item?id=27200177
https://labs.relbis.com/blog/2024-04-18_notion_backend/
https://medium.com/relbis-labs/examining-notions-backend-architecture-4c708d8f9b83
https://www.onehouse.ai/blog/notions-journey-through-different-stages-of-data-scale
https://blog.quastor.org/p/architecture-notions-data-lake
https://www.notion.com/blog/building-and-scaling-notions-data-lake
https://www.linkedin.com/pulse/from-notes-real-time-my-journey-breaking-down-notions-shrey-patel-jcdye
https://blog.prototion.com/5-ways-to-use-synced-blocks-feature-notion/
https://noteforms.com/resources/notion-synced-blocks
https://super.so/blog/how-to-use-notion-synced-blocks-the-complete-guide
https://thomasjfrank.com/notion-synced-blocks-guide/
https://notionhero.io/notion-glossary/synced-block
https://www.notion.vip/insights/notion-explained-synced-blocks
https://www.simple.ink/guides/sync-blocks-notion
https://www.simonesmerilli.com/life/notion-synced-blocks
https://noteforms.com/notion-glossary/sync-block
https://ones.com/blog/streamline-workflow-notion-text-block-merge/
https://liveblocks.io/blog/add-notion-style-collaborative-text-editing-to-your-app-with-liveblocks-blocknote
https://javascript.plainenglish.io/lets-build-a-notion-style-editor-with-real-time-collaboration-using-velt-cb3644ef6e51
https://webflow.rootly.com/blog/how-we-used-crdts-to-build-real-time-collaborative-retrospectives
https://medium.com/@yashbatra11111/how-notion-leveraged-rust-for-performance-critical-components-eb559144d845
https://github.com/Vikr-182/Notion-Lite
https://news.ycombinator.com/item?id=38289327
https://learntocodetogether.com/position-based-crdt-text-editor.html
https://www.mediawiki.org/wiki/Help:Edit_conflict
https://www.mediawiki.org/wiki/Help:Section
https://www.mediawiki.org/wiki/Extension:TwoColConflict
https://www.mediawiki.org/wiki/Help:Paragraph-based_Edit_Conflict_Interface
https://phabricator.wikimedia.org/T27598
https://phabricator.wikimedia.org/T6745
https://phabricator.wikimedia.org/T139601
https://phabricator.wikimedia.org/T108664
https://phabricator.wikimedia.org/T230231
https://phabricator.wikimedia.org/T162806
https://www.mediawiki.org/wiki/Help:Diff
https://doc.wikimedia.org/mediawiki-core/master/php/group__DifferenceEngine.html
https://gerrit.wikimedia.org/g/mediawiki/extensions/TwoColConflict
https://en.wikipedia.org/wiki/Help:Edit_conflict
https://svn.apache.org/repos/asf/incubator/wave/whitepapers/operational-transform/operational-transform.html
https://svn.apache.org/repos/asf/incubator/wave/whitepapers/google-wave-architecture/google-wave-architecture.html
https://svn.apache.org/repos/asf/incubator/wave/whitepapers/conversation/convspec.html
https://svn.apache.org/repos/asf/incubator/wave/whitepapers/client-server-protocol/client-server-protocol.html
https://cwiki.apache.org/confluence/display/WAVE/Wave%20Model%20Code%20Walk
https://cedanet.com.au/ceda/ot/ot-control/apache-wave-protocol.php
https://en.wikipedia.org/wiki/Google_Wave_Federation_Protocol
https://xebia.com/blog/understanding-google-wave/
https://googlewavedev.blogspot.com/2009/07/google-wave-federation-protocol-and.html
https://news.ycombinator.com/item?id=1354427
https://en.wikipedia.org/wiki/Operational_transformation
https://www.loremine.com/blogs/operational-transformation-algorithm-behind-google-docs
https://dev.to/dhanush___b/how-google-docs-uses-operational-transformation-for-real-time-collaboration-119
https://blog.crushingtecheducation.com/p/design-google-docs-operational-transformation
https://newsletter.systemdesign.one/p/how-does-google-docs-work
https://groups.google.com/g/closure-library-discuss/c/GhiycGt0ZH4
https://medium.com/coinmonks/operational-transformations-as-an-algorithm-for-automatic-conflict-resolution-3bf8920ea447
https://systemdr.substack.com/p/crdts-vs-operational-transformation
https://programmingappliedai.substack.com/p/how-google-docs-handles-real-time
https://systemdesignpal.substack.com/p/design-google-docs-operation-transformation
https://www.linkedin.com/pulse/design-google-docs-crdt-operational-transformation
https://singhajit.com/how-google-docs-works/
https://vishal-vishal-gupta48.medium.com/google-docs-hld-high-level-system-design-d2e62f1d7ff5
https://www.enjoyalgorithms.com/blog/design-google-docs/
https://developers.google.com/workspace/docs/api/how-tos/format-text
https://developers.google.com/docs/api/concepts/rules-behavior
https://idl.uw.edu/future-scholarly-communication/files/2010-GoogleDocs-OT.pdf
https://help.obsidian.md/sync
https://help.obsidian.md/sync/settings
https://help.obsidian.md/sync-notes
https://obsidian.md/sync
https://forum.obsidian.md/t/obsidian-syncs-operating-architecture/96728
https://forum.obsidian.md/t/robust-sync-conflict-resolution/93544
https://forum.obsidian.md/t/option-to-let-user-manually-resolve-sync-conflicts/94468
https://forum.obsidian.md/t/obsidian-sync-engine/65105
https://forum.obsidian.md/t/obsidian-sync-only-sync-user-defined-folders/96028
https://forum.obsidian.md/t/synchronization-conflicts-in-obsidian-folder/77080
https://forum.obsidian.md/t/whats-the-best-way-to-compare-and-merge-differences-from-sync-issue/57736
https://deepwiki.com/obsidianmd/obsidian-help/2.3-filters-and-views
https://deepwiki.com/obsidianmd/obsidian-help/2.4-collaboration-and-shared-vaults
https://deepwiki.com/obsidianmd/obsidian-help/3.1-obsidian-sync
https://deepwiki.com/victor-software-house/obsidian-help/5.6-troubleshooting-sync
https://retypeapp.github.io/obsidian/sync/troubleshoot/
https://blog.charlesdesneuf.com/articles/solving-obsidian-readwise-merge-conflicts-with-a-custom-git-driver/
https://github.com/Vinzent03/obsidian-git/issues/803
https://github.com/iWebbIO/obsidian-decentralized
https://github.com/syncthing/syncthing/issues/8604
https://github.com/Ataraxy-Labs/weave
https://ataraxy-labs.github.io/weave/
https://github.com/mbrukman/Ataraxy-Labs-weave
https://app.daily.dev/posts/github---ataraxy-labs-weave-entity-level-semantic-merge-driver-for-git-resolves-conflicts-that-git-1urlsgkzn
https://github.com/crewAIInc/crewAI/issues/4562
https://github.com/langchain-ai/langgraph/issues/6907
https://github.com/Wilfred/difftastic/issues/950
https://github.com/Ataraxy-Labs/weave/releases
https://github.com/Ataraxy-Labs/sem
https://news.ycombinator.com/item?id=47241976
https://news.ycombinator.com/item?id=46974793
https://topaiproduct.com/2026/03/04/weave-finally-makes-git-merges-understand-your-code/
https://github.com/orgs/Ataraxy-Labs/discussions/1
https://github.com/timoc/org-merge-driver
https://orgmode.org/worg/archive/gsoc2012/student-projects/git-merge-tool/proposal.html
https://orgmode.org/worg/archive/gsoc2012/student-projects/git-merge-tool/index.html
https://list.orgmode.org/m3y5o0plmw.fsf@quad.robs.office/T/
https://news.ycombinator.com/item?id=41095897
https://mergiraf.org/
https://mergiraf.org/architecture.html
https://mergiraf.org/languages.html
https://mergiraf.org/adding-a-language.html
https://codeberg.org/mergiraf/mergiraf
https://terminaltrove.com/mergiraf/
https://github.com/jelmer/awesome-merge-drivers
https://github.com/Praqma/git-merge-driver
https://github.com/Praqma/git-merge-driver/blob/master/README.md
https://www.graphite.com/guides/git-merge-driver
https://www.gregmicek.com/software-coding/2020/01/13/how-to-write-a-custom-git-merge-driver/
https://git-scm.com/docs/merge-config
https://git-scm.com/docs/git-merge
https://www.semanticmerge.com/features
https://www.semanticmerge.com/sm-guides/main
https://github.com/ASSERT-KTH/spork
https://github.com/se-sic/jdime
https://github.com/guilhermejccavalcanti/s3m
https://github.com/AlbertoTrindade/jsFSTMerge
https://github.com/google/diff-match-patch
https://groups.google.com/g/diff-match-patch/c/6HK8QKgc5Pc
https://github.com/google/diff-match-patch/wiki/API
https://github.com/google/diff-match-patch/wiki/
https://github.com/GerHobbelt/google-diff-match-patch
https://code.google.com/archive/p/google-diff-match-patch/
https://quickref.common-lisp.net/diff-match-patch.html
https://pypi.org/project/diff-match-patch/
https://www.npmjs.com/package/diff-match-patch
https://docs.yjs.dev/
https://deepwiki.com/TypeCellOS/BlockNote/8.1-yjs-integration
https://discuss.prosemirror.net/t/offline-peer-to-peer-collaborative-editing-using-yjs/2488
https://discuss.prosemirror.net/t/prosemirror-crdts/1190
https://discuss.prosemirror.net/t/crdt-inspired-adaptation-of-prosemirror-collab/6383
https://dev.to/route06/tutorial-building-a-collaborative-editing-app-with-yjs-valtio-and-react-1mcl
https://blog.kevinjahns.de/are-crdts-suitable-for-shared-editing
https://marijnhaverbeke.nl/blog/collaborative-editing.html
https://www.npmjs.com/package/prosemirror-collab
https://github.com/ProseMirror/prosemirror-collab
https://github.com/get-convex/prosemirror-sync
https://www.convex.dev/components/prosemirror-sync
https://prosemirror.net/docs/guide/
https://prosemirror.net/examples/collab/
https://prosemirror.net/
https://github.com/ProseMirror/website/blob/master/markdown/guide/collab.md
https://www.inkandswitch.com/peritext/
https://github.com/inkandswitch/peritext
https://www.inkandswitch.com/peritext/static/cscw-publication.pdf
https://dl.acm.org/doi/abs/10.1145/3555644
https://dspace.mit.edu/bitstream/handle/1721.1/147641/3555644.pdf
https://www.inkandswitch.com/newsletter/dispatch-004/
https://martin.kleppmann.com/2022/11/08/peritext-rich-text-crdt.html
https://www.researchgate.net/publication/365325684_Peritext_A_CRDT_for_Collaborative_Rich_Text_Editing
https://lightrun.com/answers/inkandswitch-peritext-what-could-be-the-direction-for-making-peritext-support-block-elements
https://www.repository.cam.ac.uk/items/8828fef6-b774-4597-ab83-c553b7e3f7f9
https://automerge.org/
https://automerge.github.io/
https://github.com/automerge/automerge
https://github.com/SmartBear/automerge
https://automerge.org/docs/reference/documents/
https://posit-dev.github.io/automerge-r/articles/crdt-concepts.html
https://cran.r-project.org/web/packages/automerge/vignettes/crdt-concepts.html
https://crdt.tech/implementations
https://news.ycombinator.com/item?id=30412550
https://developer.apple.com/forums/thread/743493
https://developer.apple.com/forums/thread/133806
https://developer.apple.com/videos/play/wwdc2019/202/
https://www.toptal.com/ios/sync-data-across-devices-with-cloudkit
https://ryanashcraft.com/what-i-learned-writing-my-own-cloudkit-sync-library/
https://www.rambo.codes/posts/2020-02-25-cloudkit-101
https://superwall.com/blog/syncing-data-with-cloudkit-in-your-ios-app-using-cksyncengine-and-swift-and-swiftui/
https://talk.objc.io/episodes/S01E294-crdts-introduction
https://github.com/syntax-tree/mdast
https://github.com/remarkjs/remark
https://github.com/syntax-tree/mdast-util-heading-range
https://www.npmjs.com/package/mdast-util-heading-range
https://github.com/syntax-tree/mdast-zone
https://www.npmjs.com/package/mdast-zone
https://github.com/syntax-tree/mdast-comment-marker
https://www.npmjs.com/package/mdast-comment-marker
https://unifiedjs.com/explore/package/mdast-zone/
https://unifiedjs.com/explore/package/mdast-comment-marker/
https://github.com/jake-low/remark-sectionize
https://github.com/remarkjs/remark-frontmatter
https://github.com/syntax-tree/mdast-util-frontmatter
https://github.com/micromark/micromark-extension-frontmatter
https://github.com/tree-sitter-grammars/tree-sitter-markdown
https://github.com/ikatyang/tree-sitter-markdown
https://github.com/ikatyang/tree-sitter-markdown/issues/19
https://deepwiki.com/tree-sitter-grammars/tree-sitter-markdown
https://github.com/mattmassicotte/tree-sitter-markdown-2
https://pypi.org/project/tree-sitter-markdown/
https://www.npmjs.com/package/@tree-sitter-grammars/tree-sitter-markdown
https://docs.rs/tree-sitter-md
https://kubernetes.io/docs/tasks/manage-kubernetes-objects/kustomization/
https://www.fosstechnix.com/strategic-merge-patches-in-kubernetes-using-kustomize/
https://oneuptime.com/blog/post/2026-02-09-kustomize-strategic-merge-patches/view
https://github.com/kubernetes-sigs/kustomize/issues/4658
https://github.com/kubernetes-sigs/kustomize/issues/306
https://github.com/kubernetes-sigs/kustomize/blob/master/examples/patchMultipleObjects.md
https://github.com/kubernetes-sigs/kustomize/blob/master/examples/chart.md
https://jfrog.com/blog/power-up-helm-charts-using-kustomize-to-manage-kubernetes-deployments/
https://www.cbui.dev/merging-helm-chart-values-with-kustomize/
https://medium.com/@bavicnative/helm-advanced-values-overrides-and-dependencies-35976b996143
https://oneuptime.com/blog/post/2026-02-09-kustomize-to-helm-charts/view
https://github.com/replicatedhq/ship
https://elatov.github.io/2021/08/using-kustomize/
https://k8s.info/docs/core/kustomize
https://kubectl.docs.kubernetes.io/references/kustomize/kustomization/patchesstrategicmerge/
https://fabianlee.org/2022/04/18/kubernetes-kustomize-transformations-with-patchesstrategicmerge/
https://www.linkedin.com/pulse/using-helm-chart-kustomize-managing-multiple-microservices
https://helmfile.readthedocs.io/en/latest/writing-helmfile/
https://eslint.org/docs/latest/use/configure/configuration-files
https://www.npmjs.com/package/eslint-config-prettier
https://github.com/prettier/eslint-config-prettier
https://github.com/prettier/eslint-plugin-prettier
https://www.npmjs.com/package/eslint-plugin-prettier
https://github.com/AndreasAugustin/actions-template-sync
https://andreasaugustin.github.io/actions-template-sync/ARCHITECTURE/
https://github.com/AndreasAugustin/actions-template-sync/blob/main/.templatesyncignore
https://github.com/AndreasAugustin/actions-template-sync/blob/main/README.md
https://github.com/ahmadnassri/action-template-repository-sync
https://github.com/kota65535/github-template-sync-action
https://github.com/orgs/community/discussions/23528
https://github.com/marketplace/actions/actions-template-sync
https://github.com/marketplace/actions/sync-upstream-downstream
https://github.com/marketplace/actions/template-repository-sync
https://github.com/marketplace/actions/sync-branches
https://github.com/marketplace/actions/files-sync
https://github.com/marketplace/actions/sync-and-merge-upstream-repository-with-your-current-repository
https://github.com/prompt/actions-merge-branch
https://github.com/narrowspark/template-sync-action
https://gist.github.com/b17z/7100368256837639701d2431b3e57d8c
https://medium.com/geekculture/how-to-use-git-to-downstream-changes-from-a-template-9f0de9347cc2
https://docs.renovatebot.com/configuration-options/
https://docs.renovatebot.com/config-presets/
https://docs.renovatebot.com/config-overview/
https://docs.renovatebot.com/upgrade-best-practices/
https://docs.renovatebot.com/presets-config/
https://docs.renovatebot.com/presets-default/
https://docs.renovatebot.com/updating-rebasing/
https://docs.mend.io/wsk/common-practices-for-renovate-configuration
https://github.com/renovatebot/renovate/discussions/25604
https://github.com/yeoman/generator/issues/1001
https://github.com/yeoman/yeoman/issues/1680
https://github.com/yeoman/generator/issues/1591
https://github.com/yeoman/generator/issues/1250
https://github.com/yeoman/yeoman/issues/1254
https://github.com/yeoman/generator/issues/966
https://www.npmjs.com/package/@yeoman/conflicter
https://www.npmjs.com/package/update-yeoman-generator
https://github.com/suzuki-shunsuke/yeoman-merge-ui
https://www.npmjs.com/package/yeoman-merge-ui
https://react-boilerplate.github.io/react-boilerplate/
https://github.com/react-boilerplate/react-boilerplate-cra-template
https://russelljanderson.com/updating-create-react-app/
https://spin.atomicobject.com/2020/01/28/eject-create-react-app-drawbacks/
https://medium.com/breathelife/keeping-up-with-create-react-app-after-ejecting-8d5a26664d27
https://sebhastian.com/create-react-app-eject/
https://github.com/cue-lang/cue/discussions/669
https://pv.wtf/posts/taming-the-beast
https://blog.cedriccharly.com/post/20191109-the-configuration-complexity-curse/
https://discourse.dhall-lang.org/t/comparisons-between-cue-jsonnet-dhall-opa-etc/416
https://discourse.dhall-lang.org/t/cue-another-interesting-configuration-language/69
https://holos.run/blog/why-cue-for-configuration/
https://news.ycombinator.com/item?id=27510919
https://lobste.rs/s/y6abdu/taming_beast_comparing_jsonnet_dhall_cue
https://github.com/apple/pkl/discussions/7
https://github.com/geofffranks/spruce
https://github.com/edgelaboratories/fusion
https://github.com/boxboat/config-merge
https://github.com/alexlafroscia/yaml-merge
https://github.com/fireflycons/yaml-merge
https://thesyntaxdiaries.com/lodash-merge-a-comprehensive-guide
https://egghead.io/lessons/javascript-deep-merge-objects-in-javascript-with-spread-lodash-and-deepmerge
https://timmousk.com/blog/lodash-merge/
https://www.geeksforgeeks.org/javascript/lodash-_-merge-method/
https://masteringjs.io/tutorials/lodash/merge
https://npm-compare.com/deepmerge,lodash.merge,merge-deep,merge-options
https://gist.github.com/ahtcx/0cd94e62691f539160b32ecda18af3d6
https://lodash.com/docs/
https://docs.syncthing.net/users/syncing.html
https://forum.syncthing.net/t/how-does-conflict-resolution-work/15113
https://docs.syncthing.net/users/versioning.html
https://www.frugaltesting.com/blog/how-dropbox-ensures-reliable-file-sync-across-devices
https://reintech.io/blog/utilizing-dropbox-api-collaborative-real-time-editing
https://www.multcloud.com/explore/dropbox-multiple-users-editing-same-file-0121-ac.html
https://www.bigtech.coach/common-interview-system-designs/filesharing-systems/dropbox
https://help.dropbox.com/files-folders/share/conflicted-copy
https://grokkingthesystemdesign.com/guides/dropbox-system-design/
https://educative.io/blog/dropbox-system-design
https://www.cbackup.com/articles/dropbox-selective-sync-conflict.html
https://news.ycombinator.com/item?id=34506052
https://sharepointmaven.com/how-onedrive-sync-resolves-sync-conflicts/
https://tryhoverify.com/blog/conflict-resolution-in-real-time-collaborative-editing/
https://mattweidner.com/2024/06/04/server-architectures.html
https://tonyg.github.io/revctrl.org/ThreeWayMerge.html
https://en.wikipedia.org/wiki/Diff3
https://blog.jcoglan.com/2017/05/08/merging-with-diff3/
https://blog.git-init.com/the-magic-of-3-way-merge/
https://en.wikipedia.org/wiki/Merge_(version_control)
https://www.sciencedirect.com/science/article/abs/pii/S138376212300190X
https://people.cs.vt.edu/~nm8247/publications/jsa23.pdf
https://aaltodoc.aalto.fi/server/api/core/bitstreams/cd83234f-72c9-443d-b9f4-3ab58db341c9/content
https://hal.science/hal-01054552v1/document
https://homes.cs.washington.edu/~mernst/pubs/merge-evaluation-ase2024.pdf
https://arxiv.org/abs/2410.09934
https://www.se.cs.uni-saarland.de/publications/docs/FSE2011.pdf
https://arxiv.org/html/2407.18888v1
https://arxiv.org/abs/2507.19687
https://arxiv.org/html/2507.19687
https://paulz.me/files/mastery-preprint.pdf
https://hal.science/hal-04423078/document
https://www.researchgate.net/publication/2377723_A_3-way_Merging_Algorithm_for_Synchronizing_Ordered_Trees_-_the_3DM_merging_and_differencing_tool_for_XML
https://www.researchgate.net/publication/221353228_A_three-way_merge_for_XML_documents
https://www.researchgate.net/publication/220855486_XML_three-way_merge_as_a_reconciliation_engine_for_mobile_data
https://www.researchgate.net/publication/342683928_A_Top-Down_Three-Way_Merge_Algorithm_for_HTMLXML_Documents
https://link.springer.com/chapter/10.1007/978-3-030-52249-0_6
https://link.springer.com/article/10.1007/s00450-013-0253-5
https://link.springer.com/chapter/10.1007/978-3-030-80119-9_3
https://dl.acm.org/doi/10.1145/940923.940940
https://www.semanticscholar.org/paper/A-three-way-merge-for-XML-documents-Lindholm/fbcdd491baaff3e604ac3c790d4940438cc7630c
https://docplayer.net/50389383-A-3-way-merging-algorithm-for-synchronizing-ordered-trees-the-3dm-merging-and-differencing-tool-for-xml.html
https://www.cis.upenn.edu/~bcpierce/courses/dd/papers/3dm-thesis.ps
https://www.microsoft.com/en-us/research/wp-content/uploads/2015/02/paper-full.pdf
https://github.com/knennigtri/merge-markdown
https://github.com/abhinav/stitchmd
https://github.com/JeNeSuisPasDave/MarkdownTools
https://github.com/jonatanpedersen/git-json-merge
https://github.com/rmedaer/git-merge-drivers
https://github.com/jupyter/nbdime
https://github.com/nono/mddiff
https://pypi.org/project/markdown-parser-py/
https://github.com/movableink/three-way-merge
https://unifiedjs.com/explore/package/remark/
https://remark.js.org/
https://gocardless.com/blog/fun-with-markdown-and-remark/
https://loophole-letters.vercel.app/abstract-syntax-trees
https://www.telerik.com/blogs/asts-markdown-and-mdx
https://github.com/syntax-tree/mdast-util-from-markdown
https://github.com/syntax-tree/mdast-util-to-markdown
https://deepwiki.com/rehypejs/rehype-remark/1.3-hast-and-mdast
https://www.npmjs.com/package/@m2d/react-markdown
https://python.langchain.com/docs/how_to/markdown_header_metadata_splitter/
https://ragnar.tidyverse.org/reference/markdown_chunk.html
https://github.com/supabase/vecs/issues/26
https://github.com/langgenius/dify/discussions/29635
https://docling-project.github.io/docling/concepts/chunking/
https://wikit-ai.github.io/chunknorris/examples/markdown_chunking/
https://github.com/run-llama/llama_index/issues/17650
https://github.com/sindresorhus/remark-custom-header-id
https://github.com/imcuttle/remark-heading-id
https://github.com/Eyas/md-heading-id
https://github.com/remarkjs/remark-directive
https://github.com/sfrdmn/remark-yaml-annotations
https://github.com/abhinav/goldmark-frontmatter
https://gitlab.com/gitlab-org/gitlab-foss/-/merge_requests/23331
https://github.com/syntax-tree/mdast-util-frontmatter
https://github.com/hyn/frontmatter
https://github.com/jonschlinkert/gray-matter
https://github.com/vfile/vfile-matter
https://github.com/micromark/micromark-extension-frontmatter
https://github.com/go-gitea/gitea/issues/12926
https://freefilesync.org/manual.php?topic=versioning
https://github.com/directus-labs/directus-template-cli
https://learn.microsoft.com/en-us/dotnet/core/tools/custom-templates
https://github.com/pterm/cli-template
https://github.com/jcolemorrison/cloudfoundation
https://github.com/Wilfred/difftastic
https://news.ycombinator.com/item?id=42093756
https://lwn.net/Articles/1042355/
https://news.ycombinator.com/item?id=32750788
https://news.ycombinator.com/item?id=5566430
```
