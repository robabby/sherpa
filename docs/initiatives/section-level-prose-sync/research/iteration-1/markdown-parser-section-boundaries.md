# Markdown Parser Section Boundaries: Research Findings

**Date:** 2026-03-11
**Focus:** How remark/unified, markdown-it, and mdast handle section boundaries; stable section IDs; YAML frontmatter as structure

---

## Key Discoveries

### 1. mdast Has No Section Node Type — Headings Are Flat

- mdast (the Markdown Abstract Syntax Tree used by remark/unified) has **no native "section" node**. Headings sit as flat siblings in the root's children array alongside paragraphs, lists, code blocks, etc. ([github.com/syntax-tree/mdast](https://github.com/syntax-tree/mdast))
- The `Heading` node has a `depth` field (1-6) and `PhrasingContent` children (the heading text), but there is no built-in parent-child relationship between a heading and "its" content. ([github.com/syntax-tree/mdast](https://github.com/syntax-tree/mdast))
- mdast content categories: **FlowContent** (Blockquote, Code, Heading, Html, List, Paragraph, ThematicBreak, Definition) and **PhrasingContent** (Break, Emphasis, Html, Image, InlineCode, Link, Strong, Text). No "SectionContent" category exists. ([github.com/syntax-tree/mdast](https://github.com/syntax-tree/mdast))
- **Implication:** We must build the section tree ourselves. This is a well-understood problem — multiple tools do it — but there is no off-the-shelf "parse markdown, get section tree" in the core ecosystem.

### 2. remark-sectionize Wraps Headings Into Section Nodes

- **remark-sectionize** ([github.com/jake-low/remark-sectionize](https://github.com/jake-low/remark-sectionize)) is the primary plugin for grouping headings with their content into `section` nodes.
- Algorithm: processes headings from **deepest (6) to shallowest (1)**. For each heading at depth N, it collects all sibling nodes until the next heading at depth <= N (or end of parent), then wraps them in a new node `{type: 'section', depth: N, children: [...], data: {hName: 'section'}}`. Uses `splice()` to replace the original nodes in-place. ([raw source](https://raw.githubusercontent.com/jake-low/remark-sectionize/master/index.js))
- The bottom-up approach (6→1) ensures nested sections form correctly before their parents process.
- **Does not generate IDs.** Sections have no identifier — just depth and children.
- TypeScript fork exists at [github.com/AVGVSTVS96/remark-sectionize](https://github.com/AVGVSTVS96/remark-sectionize) but adds no new features.
- Related: **remark-sectionize-headings** ([npmjs.com/package/remark-sectionize-headings](https://www.npmjs.com/package/remark-sectionize-headings)) adds CSS classes per heading level.
- Related: **gatsby-remark-sectionize** ([github.com/laysent/gatsby-remark-sectionize](https://github.com/laysent/gatsby-remark-sectionize)) — Gatsby-specific variant.

### 3. mdast-util-heading-range: Section Extraction by Heading Match

- **mdast-util-heading-range** ([github.com/syntax-tree/mdast-util-heading-range](https://github.com/syntax-tree/mdast-util-heading-range)) finds a heading matching a test (string, regex, or function), then captures all nodes until the next heading of **same or lower depth** (or end of document).
- Handler signature: `(start: Heading, nodes: Node[], end: Node|undefined, info: Info) => Array<Node|null|undefined> | undefined`
- This is the utility used by **remark-toc** to find and replace a "Table of Contents" section.
- **Key insight for us:** This utility defines exactly the section boundary algorithm we need: "from heading to next heading of equal or shallower depth, or end of document."

### 4. mdast-util-nested-sections: Attempted but Undocumented

- **mdast-util-nested-sections** ([github.com/tcmlabs/mdast-util-nested-sections](https://github.com/tcmlabs/mdast-util-nested-sections)) — aims to "return a tree of sections instead of a flat list" — but the README says "Coming soon" and the library appears incomplete/undocumented.

### 5. mdast-zone: Comment-Based Section Markers

- **mdast-zone** ([github.com/syntax-tree/mdast-zone](https://github.com/syntax-tree/mdast-zone)) uses paired HTML comments as section boundaries: `<!--name start-->` ... `<!--name end-->`.
- Handler receives `(start, nodes, end, info)` — same pattern as heading-range.
- **This is the closest existing pattern to what we need for stable section IDs.** HTML comments are invisible in rendered output but survive markdown roundtrips.
- Related: **mdast-comment-marker** ([github.com/syntax-tree/mdast-comment-marker](https://github.com/syntax-tree/mdast-comment-marker)) parses structured key-value attributes from HTML comments: `<!--foo bar=12.4 qux="test"-->` produces `{name: 'foo', parameters: {bar: 12.4, qux: 'test'}}`.

### 6. The {#custom-id} Heading ID Syntax

- Many markdown processors support `## Heading {#stable-id}` syntax for explicit heading IDs. This is **not part of CommonMark** — it's a widely-adopted extension from Pandoc/PHP Markdown Extra. ([markdownguide.org/extended-syntax](https://www.markdownguide.org/extended-syntax/), [talk.commonmark.org](https://talk.commonmark.org/t/feature-request-automatically-generated-ids-for-headers/115))
- **Pandoc** has the richest implementation: `auto_identifiers` extension auto-generates IDs; explicit `{#id .class key=value}` syntax overrides them. Algorithm: strip formatting/footnotes, remove non-alphanumeric chars (except `_-.`), spaces→hyphens, lowercase, strip leading non-letters, default to "section" if empty. Duplicates get `-1`, `-2` suffixes. ([pandoc.org](https://pandoc.org/demo/example33/7.2-headings-and-sections.html))
- **Docusaurus** auto-generates heading IDs from text (kebab-case), but provides `{#custom-id}` override syntax and a CLI tool `write-heading-ids` to add explicit IDs to all headings. ([docusaurus.io/docs/markdown-features/toc](https://docusaurus.io/docs/markdown-features/toc))
- Remark ecosystem plugins:
  - **remark-custom-header-id** ([github.com/sindresorhus/remark-custom-header-id](https://github.com/sindresorhus/remark-custom-header-id)) — by Sindre Sorhus, extends micromark with `{#id}` syntax parsing.
  - **remark-heading-id** ([github.com/imcuttle/remark-heading-id](https://github.com/imcuttle/remark-heading-id)) — similar, stores ID in `node.data.hProperties.id`.
  - **md-heading-id** ([github.com/Eyas/md-heading-id](https://github.com/Eyas/md-heading-id)) — micromark + mdast extension for heading ID support.
- **Important MDX limitation:** The `{#id}` syntax breaks in MDX because `{}` is treated as JSX expression syntax. Requires escaping `\{#id}` or using comment-based alternatives.

### 7. Auto-Generated Heading IDs (github-slugger / rehype-slug)

- **rehype-slug** ([github.com/rehypejs/rehype-slug](https://github.com/rehypejs/rehype-slug)) adds `id` attributes to HTML headings using **github-slugger**.
- **github-slugger** ([github.com/Flet/github-slugger](https://github.com/Flet/github-slugger)) algorithm: lowercase, strip characters matching a regex (emoji, special chars), spaces→hyphens. Stateful: tracks seen slugs and appends `-1`, `-2` for duplicates.
- **remark-slug** is **deprecated** — use rehype-slug instead (operates on hast, not mdast). ([github.com/remarkjs/remark-slug](https://github.com/remarkjs/remark-slug))
- These auto-generated IDs are **unstable by design** — renaming a heading changes the ID.

### 8. YAML Frontmatter: A Special "Head" Node

- **remark-frontmatter** ([github.com/remarkjs/remark-frontmatter](https://github.com/remarkjs/remark-frontmatter)) adds frontmatter support to remark. Creates a node `{type: 'yaml', value: 'raw content string', position: {...}}` as the **first child of root**.
- **mdast-util-frontmatter** ([github.com/syntax-tree/mdast-util-frontmatter](https://github.com/syntax-tree/mdast-util-frontmatter)) specifies: "If frontmatter is present, it must be limited to **one node** in the tree, and can only exist as a **head**" (first child of root).
- The `value` field contains the **raw unparsed YAML string** — the `---` delimiters are stripped, but no YAML parsing occurs. You need a separate step (e.g., `yaml` npm package, `gray-matter`, or `vfile-matter`) to parse it.
- **gray-matter** ([github.com/jonschlinkert/gray-matter](https://github.com/jonschlinkert/gray-matter)) — standalone YAML frontmatter parser (not part of unified), used by Gatsby, Netlify, Hugo, Astro, VitePress, TinaCMS, etc. Extracts `{data, content, matter, stringify}`.
- **vfile-matter** ([github.com/vfile/vfile-matter](https://github.com/vfile/vfile-matter)) — unified-native, parses YAML and exposes it as `file.data.matter`. Does not strip frontmatter from the AST.
- **micromark-extension-frontmatter** ([github.com/micromark/micromark-extension-frontmatter](https://github.com/micromark/micromark-extension-frontmatter)) — the tokenizer layer. Defines frontmatter as `fenceOpen *( eol *line ) eol fenceClose` where `sequenceOpen ::= 3"-"` for YAML, `3"+"` for TOML. Constraint: can only occur once, cannot occur in a container.

### 9. Pandoc's --section-divs: The Gold Standard

- Pandoc's `--section-divs` option wraps sections in `<section>` tags with the heading's ID on the wrapper (not the heading itself). This is the behavior we want in our AST. ([pandoc.org](https://pandoc.org/demo/example33/7.2-headings-and-sections.html))
- Pandoc's identifier algorithm for headings: strip formatting, remove non-alphanumeric (except `_-.`), spaces→hyphens, lowercase, strip leading non-letters. Duplicates: append `-1`, `-2`.

### 10. Directive Syntax as an Alternative Annotation Mechanism

- **remark-directive** ([github.com/remarkjs/remark-directive](https://github.com/remarkjs/remark-directive)) supports three directive types:
  - Text: `:name[label]{key=value}` (inline)
  - Leaf: `::name[label]{key=value}` (block)
  - Container: `:::name{key=value}` ... `:::` (block wrapper)
- Attributes support `#id` and `.class` shortcuts.
- Container directives could theoretically wrap sections with IDs: `:::section{#stable-id}` ... `:::`
- **Drawback:** This is intrusive — it requires authors to use non-standard markdown syntax.

### 11. markdown-it Ecosystem (Alternative Parser)

- **markdown-it-heading-wrapper** ([github.com/mozilla/markdown-it-heading-wrapper](https://github.com/mozilla/markdown-it-heading-wrapper)) — wraps headings in arbitrary markup, inspired by `markdown-it-header-sections`.
- **markdown-it-container** ([github.com/markdown-it/markdown-it-container](https://github.com/markdown-it/markdown-it-container)) — fenced container syntax for custom blocks.
- **markdown-it-anchor** ([github.com/valeriangalliat/markdown-it-anchor](https://github.com/valeriangalliat/markdown-it-anchor)) — adds `id` and optional permalinks to headings.
- **markdown-it-attrs** ([github.com/arve0/markdown-it-attrs](https://github.com/arve0/markdown-it-attrs)) — Pandoc-style `{.class #id attr=value}` syntax.
- markdown-it is a viable alternative parser, but the unified/remark ecosystem is better for our use case because of its AST-first design and the ability to serialize back to markdown.

### 12. Roundtrip (Parse → Transform → Serialize) Limitations

- **remark roundtrips in meaning, not formatting.** `remark-stringify` (via `mdast-util-to-markdown`) serializes a valid markdown representation of the AST, but may change whitespace, list markers, emphasis style, etc. ([remarkjs discussions #1166](https://github.com/orgs/remarkjs/discussions/1166))
- **Implication for us:** If we parse → modify → serialize, we will get reformatted markdown. For section-level sync where we want to preserve the user's original formatting in unmodified sections, we should **use positional information from the AST** to splice changes into the original source string rather than re-serializing the full tree.

### 13. Three-Way Structured Merge (Academic)

- Academic research on structured three-way merge (AST-level): "On the Methodology of Three-Way Structured Merge" ([people.cs.vt.edu](https://people.cs.vt.edu/~nm8247/publications/jsa23.pdf)) — combines top-down and bottom-up AST visits. Top-down handles trivial merges efficiently; bottom-up handles non-trivial scenarios.
- GitLab solved CHANGELOG merge conflicts by making each entry a separate YAML file, compiled at release time. Analogous to our section-level approach. ([about.gitlab.com](https://about.gitlab.com/blog/2018/07/03/solving-gitlabs-changelog-conflict-crisis/))

---

## Strategies for Stable Section IDs

Given the research, here are the viable strategies ranked by intrusiveness:

### Strategy A: HTML Comment Markers (Recommended)

```markdown
<!-- section:getting-started -->
## Getting Started
Content here...
```

- **Pros:** Invisible in rendered output. Survives all markdown processors. Established pattern (mdast-zone, mdast-comment-marker). Can carry key-value attributes.
- **Cons:** Adds lines to the source. Must be maintained. Could be accidentally deleted.
- **Ecosystem support:** mdast-zone, mdast-comment-marker already parse this pattern.

### Strategy B: Custom Heading ID Syntax {#id}

```markdown
## Getting Started {#getting-started}
```

- **Pros:** Widely supported (Pandoc, Docusaurus, many remark plugins). Compact — single line. Well-understood by authors.
- **Cons:** Not CommonMark standard. Breaks in MDX. Auto-generated IDs (from heading text) are unstable by definition — only *explicit* custom IDs are stable.
- **Ecosystem support:** remark-custom-header-id, md-heading-id, Pandoc, Docusaurus.

### Strategy C: Content Hashing (Fingerprinting)

- Hash the section's content (heading text + body) to generate a fingerprint.
- **Pros:** No source modification needed. Deterministic.
- **Cons:** Changes with any edit — exactly the opposite of "stable." Only useful for *change detection*, not *identity*.
- **Verdict:** Useful as a **change detection** mechanism alongside a stable ID, but cannot serve as the ID itself.

### Strategy D: Position-Based (Ordinal)

- "3rd h2 in the document" as an identifier.
- **Pros:** No source modification.
- **Cons:** Fragile — inserting a section above shifts all ordinals. Useless for merge.

### Strategy E: Heading-Text Slug (github-slugger style)

- Auto-generate from heading text: "## Getting Started" → `getting-started`.
- **Pros:** No source modification. Deterministic for unchanged headings.
- **Cons:** **Breaks on rename** — this is the exact problem we're trying to solve.
- **Verdict:** Good as a *default* ID for new sections, but must be overridable with an explicit stable ID.

### Strategy F: Directive Annotation

```markdown
:::section{#getting-started}
## Getting Started
Content...
:::
```

- **Pros:** Rich attribute support. Part of a specification (CommonMark directive proposal).
- **Cons:** Very intrusive. Changes how the document looks in raw form. Requires remark-directive.

---

## Implications for Building a Section Tree Parser

### Recommended Architecture

1. **Parse with remark + remark-frontmatter** — gives us an mdast tree with frontmatter as a `{type: 'yaml'}` head node.

2. **Build section tree using remark-sectionize's algorithm** (process depths 6→1, collect siblings until next heading of equal/lesser depth, wrap in section node). We should implement this ourselves rather than depending on remark-sectionize, because:
   - We need to attach our own metadata (IDs, content hashes) to section nodes.
   - We need frontmatter as a special root-level section.
   - The algorithm is ~40 lines of code.

3. **Assign section IDs** using a two-tier strategy:
   - **Primary:** Look for explicit ID markers — either `{#id}` syntax on the heading or `<!-- section:id -->` HTML comment above the heading.
   - **Fallback:** Generate a slug from the heading text (github-slugger algorithm).
   - Store both the stable ID and the current heading text, so we can detect renames.

4. **Compute content hashes** per section (hash of the section body, excluding the heading itself) for change detection during three-way merge.

5. **Treat frontmatter as a section** with a well-known ID (e.g., `__frontmatter__`). Its "content" is the raw YAML string.

6. **Preserve original source** — do not round-trip through remark-stringify for unmodified sections. Use AST position data (`node.position.start.offset` / `node.position.end.offset`) to extract original source text from the file, and only re-serialize sections that have been modified.

### Section Node Shape (Proposed)

```typescript
interface Section {
  id: string;                    // Stable identifier
  slug: string;                  // Auto-generated from heading text
  heading: string;               // Current heading text (for display/matching)
  depth: number;                 // 0 for frontmatter, 1-6 for headings
  contentHash: string;           // Hash of body content (not heading)
  position: { start: number; end: number }; // Byte offsets in source
  children: Section[];           // Nested subsections
  source: string;                // Raw source text of this section's body
}
```

### Key Packages to Use

| Package | Purpose |
|---------|---------|
| `remark-parse` | Parse markdown → mdast |
| `remark-frontmatter` | Add YAML frontmatter node to AST |
| `remark-stringify` | Serialize mdast → markdown (for modified sections only) |
| `mdast-util-to-string` | Extract plain text from heading nodes |
| `unist-util-visit` | Walk the AST |
| `unist-util-find-after` | Find next sibling matching a test |
| `github-slugger` | Generate heading slugs |
| `yaml` or `gray-matter` | Parse frontmatter YAML content |
| `remark-custom-header-id` or `md-heading-id` | Parse `{#id}` syntax (optional — could be custom) |

### What NOT to Use

- **remark-sectionize** directly — we need more control over the section node shape.
- **rehype-slug** — operates on HTML (hast), not markdown (mdast); wrong layer.
- **remark-directive** — too intrusive for document authors.

---

## Sources

### Specifications and Core Libraries
- [mdast spec — syntax-tree/mdast](https://github.com/syntax-tree/mdast) — Markdown AST format definition. No section node type. Heading nodes have `depth` field.
- [unified — unifiedjs/unified](https://github.com/unifiedjs/unified) — Content processing framework. Parse, inspect, transform, serialize.
- [remark — remarkjs/remark](https://github.com/remarkjs/remark) — Markdown processor using unified + mdast.
- [remark-parse — npm](https://www.npmjs.com/package/remark-parse) — Parses markdown to mdast.
- [remark-stringify — npm](https://www.npmjs.com/package/remark-stringify) — Serializes mdast to markdown.
- [mdast-util-from-markdown](https://github.com/syntax-tree/mdast-util-from-markdown) — Low-level markdown → mdast utility.
- [mdast-util-to-markdown](https://github.com/syntax-tree/mdast-util-to-markdown) — Low-level mdast → markdown serializer. Roundtrip not guaranteed.
- [micromark](https://github.com/micromark/micromark) — CommonMark-compliant tokenizer underlying remark.

### Section Grouping
- [remark-sectionize — jake-low](https://github.com/jake-low/remark-sectionize) — Wraps headings + content in section nodes. Algorithm: depth 6→1, collect until next heading of equal/lesser depth.
- [remark-sectionize — AVGVSTVS96 (TS fork)](https://github.com/AVGVSTVS96/remark-sectionize) — TypeScript conversion, no new features.
- [remark-sectionize-headings — npm](https://www.npmjs.com/package/remark-sectionize-headings) — Variant adding CSS classes per heading level.
- [gatsby-remark-sectionize](https://github.com/laysent/gatsby-remark-sectionize) — Gatsby-specific variant.
- [mdast-util-heading-range](https://github.com/syntax-tree/mdast-util-heading-range) — Find heading, capture content until next heading of same/lower depth.
- [mdast-util-nested-sections — tcmlabs](https://github.com/tcmlabs/mdast-util-nested-sections) — Attempted nested section tree; undocumented/incomplete.
- [mdast-util-split-by-heading — npm](https://www.npmjs.com/package/mdast-util-split-by-heading) — Splits tree by headings (details behind npm 403).

### Section Markers and Zones
- [mdast-zone](https://github.com/syntax-tree/mdast-zone) — HTML comment-based zone markers: `<!--name start-->` ... `<!--name end-->`.
- [mdast-comment-marker](https://github.com/syntax-tree/mdast-comment-marker) — Parse structured key-value attributes from HTML comments.

### Heading IDs
- [remark-custom-header-id — sindresorhus](https://github.com/sindresorhus/remark-custom-header-id) — Parse `{#id}` syntax in headings.
- [remark-heading-id — imcuttle](https://github.com/imcuttle/remark-heading-id) — Custom heading ID support, stores in `data.hProperties.id`.
- [md-heading-id — Eyas](https://github.com/Eyas/md-heading-id) — Micromark + mdast extension for heading IDs.
- [rehype-slug](https://github.com/rehypejs/rehype-slug) — Auto-generate heading IDs in HTML (hast layer). Uses github-slugger.
- [rehype-slug-custom-id](https://github.com/playfulprogramming/rehype-slug-custom-id) — Supports `{#id}` in rehype.
- [remark-slug (DEPRECATED)](https://github.com/remarkjs/remark-slug) — Replaced by rehype-slug.
- [github-slugger](https://github.com/Flet/github-slugger) — Slug generation matching GitHub's algorithm. Stateful duplicate handling.
- [markdown-it-anchor](https://github.com/valeriangalliat/markdown-it-anchor) — Heading IDs for markdown-it.
- [markdown-it-attrs](https://github.com/arve0/markdown-it-attrs) — Pandoc-style `{.class #id}` for markdown-it.

### Frontmatter
- [remark-frontmatter](https://github.com/remarkjs/remark-frontmatter) — YAML/TOML frontmatter as AST node. Type: `'yaml'`, value: raw string, must be first child of root.
- [mdast-util-frontmatter](https://github.com/syntax-tree/mdast-util-frontmatter) — Low-level frontmatter extension. Documents the "head" constraint.
- [micromark-extension-frontmatter](https://github.com/micromark/micromark-extension-frontmatter) — Tokenizer for frontmatter delimiters.
- [gray-matter](https://github.com/jonschlinkert/gray-matter) — Standalone YAML frontmatter parser. Used by Gatsby, Astro, VitePress, etc.
- [vfile-matter](https://github.com/vfile/vfile-matter) — Unified-native YAML parser. Exposes `file.data.matter`.

### Directives and Annotations
- [remark-directive](https://github.com/remarkjs/remark-directive) — Text/leaf/container directive syntax. Container: `:::name{attrs}...:::`.
- [remark-yaml-annotations](https://github.com/sfrdmn/remark-yaml-annotations) — Annotation syntax linking text to YAML metadata blocks.

### Framework Heading ID Behavior
- [Docusaurus — Headings and TOC](https://docusaurus.io/docs/markdown-features/toc) — Auto-generates IDs, supports `{#id}` override, `write-heading-ids` CLI.
- [Docusaurus issue #3322 — custom heading IDs for i18n](https://github.com/facebook/docusaurus/issues/3322)
- [Pandoc — Headings and sections](https://pandoc.org/demo/example33/7.2-headings-and-sections.html) — `auto_identifiers`, `--section-divs`, identifier algorithm.
- [Markdown Guide — Extended Syntax](https://www.markdownguide.org/extended-syntax/) — Documents `{#id}` syntax.
- [markdownlang.com — Heading IDs](https://www.markdownlang.com/extended/heading-ids.html) — Heading ID extension docs.
- [CommonMark discussion — auto-generated IDs for headers](https://talk.commonmark.org/t/feature-request-automatically-generated-ids-for-headers/115)

### markdown-it Ecosystem
- [markdown-it-heading-wrapper — Mozilla](https://github.com/mozilla/markdown-it-heading-wrapper) — Wraps headings in arbitrary markup.
- [markdown-it-container](https://github.com/markdown-it/markdown-it-container) — Fenced container blocks.
- [markdown-it-named-headings](https://github.com/rstacruz/markdown-it-named-headings) — Auto-add IDs to headings.

### Tree Traversal Utilities
- [unist-util-visit](https://github.com/syntax-tree/unist-util-visit) — Depth-first tree traversal.
- [unist-util-visit-parents](https://github.com/syntax-tree/unist-util-visit-parents) — Traversal with parent stack.
- [unist-util-find-after](https://github.com/syntax-tree/unist-util-find-after) — Find next sibling matching a test.
- [unist-util-index](https://github.com/syntax-tree/unist-util-index) — Index nodes by property for fast lookup.

### Three-Way Merge Research
- [Three-Way Structured Merge — Mastery framework (PDF)](https://people.cs.vt.edu/~nm8247/publications/jsa23.pdf) — Academic paper on combining top-down and bottom-up AST visits for merge.
- [Three-Way Merge for XML (Lindholm, 2004)](https://aaltodoc.aalto.fi/server/api/core/bitstreams/cd83234f-72c9-443d-b9f4-3ab58db341c9/content) — Seminal paper on structured document merge.
- [GitLab CHANGELOG conflict resolution](https://about.gitlab.com/blog/2018/07/03/solving-gitlabs-changelog-conflict-crisis/) — Decomposed monolithic file into per-entry YAML files.
- [movableink/three-way-merge](https://github.com/movableink/three-way-merge) — JavaScript/TypeScript three-way merge library.
- [Altova DiffDog — Markdown comparison](https://www.altova.com/blog/2026/02/comparing-markdown-files-in-the-age-of-agentic-ai-why-diffdog) — Commercial tool for markdown diffs.

### Other Relevant Links
- [ASTs, Markdown and MDX — Telerik](https://www.telerik.com/blogs/asts-markdown-and-mdx)
- [Introduction to Unified and Remark — Braincoke](https://braincoke.fr/blog/2020/03/an-introduction-to-unified-and-remark/)
- [Having Fun with Markdown and Remark — GoCardless](https://gocardless.com/blog/fun-with-markdown-and-remark/)
- [Transforming Markdown with Remark & Rehype — ryanfiller.com](https://www.ryanfiller.com/blog/remark-and-rehype-plugins)
- [remark plugins list](https://github.com/remarkjs/remark/blob/main/doc/plugins.md)
- [remark-comment — leebyron](https://github.com/leebyron/remark-comment) — Parse HTML comments as distinct node type.
- [MarkdownTools — mdmerge](https://github.com/JeNeSuisPasDave/MarkdownTools) — Merge markdown via include specs.
- [remark-toc](https://github.com/remarkjs/remark-toc) — Auto-generate table of contents. Uses mdast-util-heading-range.
- [Markdown comment guide — md2card.online](https://md2card.online/blog/markdown-comment-ultimate-guide)
- [GitHub Gist — heading anchors](https://gist.github.com/asabaylus/3071099)
- [Astro — Markdown content](https://docs.astro.build/en/guides/markdown-content/)
- [VitePress — Markdown extensions](https://vitepress.dev/guide/markdown)
- [MDX — Frontmatter guide](https://mdxjs.com/guides/frontmatter/)
- [Withastro roadmap discussion #329 — custom header IDs](https://github.com/withastro/roadmap/discussions/329)
- [Docusaurus issue #11691 — autogenerated heading ID aliases](https://github.com/facebook/docusaurus/issues/11691)

---

## Raw Link List

```
https://github.com/syntax-tree/mdast
https://github.com/remarkjs/remark
https://github.com/unifiedjs/unified
https://github.com/syntax-tree/mdast-util-from-markdown
https://github.com/syntax-tree/mdast-util-to-markdown
https://github.com/micromark/micromark
https://github.com/jake-low/remark-sectionize
https://github.com/AVGVSTVS96/remark-sectionize
https://www.npmjs.com/package/remark-sectionize
https://www.npmjs.com/package/remark-sectionize-headings
https://github.com/laysent/gatsby-remark-sectionize
https://github.com/syntax-tree/mdast-util-heading-range
https://www.npmjs.com/package/mdast-util-heading-range
https://github.com/tcmlabs/mdast-util-nested-sections
https://www.npmjs.com/package/mdast-util-split-by-heading
https://github.com/syntax-tree/mdast-zone
https://www.npmjs.com/package/mdast-zone
https://github.com/syntax-tree/mdast-comment-marker
https://www.npmjs.com/package/mdast-comment-marker
https://github.com/sindresorhus/remark-custom-header-id
https://www.npmjs.com/package/remark-custom-header-id
https://github.com/imcuttle/remark-heading-id
https://www.npmjs.com/package/remark-heading-id
https://github.com/Eyas/md-heading-id
https://github.com/rehypejs/rehype-slug
https://www.npmjs.com/package/rehype-slug
https://github.com/playfulprogramming/rehype-slug-custom-id
https://www.npmjs.com/package/rehype-slug-custom-id
https://github.com/remarkjs/remark-slug
https://github.com/Flet/github-slugger
https://www.npmjs.com/package/github-slugger
https://github.com/valeriangalliat/markdown-it-anchor
https://github.com/arve0/markdown-it-attrs
https://www.npmjs.com/package/markdown-it-attrs
https://github.com/rstacruz/markdown-it-named-headings
https://github.com/mozilla/markdown-it-heading-wrapper
https://github.com/markdown-it/markdown-it-container
https://www.npmjs.com/package/markdown-it-container
https://github.com/remarkjs/remark-frontmatter
https://www.npmjs.com/package/remark-frontmatter
https://github.com/syntax-tree/mdast-util-frontmatter
https://www.npmjs.com/package/mdast-util-frontmatter
https://github.com/micromark/micromark-extension-frontmatter
https://www.npmjs.com/package/micromark-extension-frontmatter
https://github.com/jonschlinkert/gray-matter
https://www.npmjs.com/package/gray-matter
https://github.com/vfile/vfile-matter
https://www.npmjs.com/package/vfile-matter
https://github.com/remarkjs/remark-directive
https://www.npmjs.com/package/remark-directive
https://github.com/sfrdmn/remark-yaml-annotations
https://docusaurus.io/docs/markdown-features/toc
https://docusaurus.io/docs/next/markdown-features/toc
https://github.com/facebook/docusaurus/issues/3322
https://github.com/facebook/docusaurus/issues/11691
https://pandoc.org/demo/example33/7.2-headings-and-sections.html
https://pandoc.org/MANUAL.html
https://www.markdownguide.org/extended-syntax/
https://www.markdownlang.com/extended/heading-ids.html
https://talk.commonmark.org/t/feature-request-automatically-generated-ids-for-headers/115
https://talk.commonmark.org/t/generic-directives-plugins-syntax/444
https://github.com/syntax-tree/unist-util-visit
https://www.npmjs.com/package/unist-util-visit
https://github.com/syntax-tree/unist-util-visit-parents
https://github.com/syntax-tree/unist-util-index
https://unifiedjs.com/explore/package/mdast-util-to-hast/
https://github.com/remarkjs/remark-rehype
https://www.npmjs.com/package/remark-rehype
https://github.com/remarkjs/remark-toc
https://github.com/leebyron/remark-comment
https://github.com/JeNeSuisPasDave/MarkdownTools
https://github.com/movableink/three-way-merge
https://people.cs.vt.edu/~nm8247/publications/jsa23.pdf
https://aaltodoc.aalto.fi/server/api/core/bitstreams/cd83234f-72c9-443d-b9f4-3ab58db341c9/content
https://about.gitlab.com/blog/2018/07/03/solving-gitlabs-changelog-conflict-crisis/
https://www.altova.com/blog/2026/02/comparing-markdown-files-in-the-age-of-agentic-ai-why-diffdog
https://www.telerik.com/blogs/asts-markdown-and-mdx
https://braincoke.fr/blog/2020/03/an-introduction-to-unified-and-remark/
https://gocardless.com/blog/fun-with-markdown-and-remark/
https://www.ryanfiller.com/blog/remark-and-rehype-plugins
https://github.com/remarkjs/remark/blob/main/doc/plugins.md
https://github.com/orgs/remarkjs/discussions/719
https://github.com/orgs/remarkjs/discussions/1166
https://github.com/orgs/remarkjs/discussions/859
https://github.com/orgs/remarkjs/discussions/1285
https://github.com/orgs/remarkjs/discussions/1210
https://github.com/orgs/micromark/discussions/30
https://github.com/orgs/micromark/discussions/145
https://github.com/withastro/roadmap/discussions/329
https://github.com/pulldown-cmark/pulldown-cmark/issues/424
https://github.com/jgm/pandoc/issues/8389
https://github.com/jgm/pandoc/issues/7183
https://github.com/rehypejs/rehype-slug/issues/10
https://github.com/markdown-it/markdown-it/issues/827
https://github.com/remarkjs/react-markdown/issues/585
https://md2card.online/blog/markdown-comment-ultimate-guide
https://gist.github.com/asabaylus/3071099
https://docs.astro.build/en/guides/markdown-content/
https://vitepress.dev/guide/markdown
https://mdxjs.com/guides/frontmatter/
https://unifiedjs.com/learn/recipe/tree-traversal-typescript/
https://unifiedjs.com/learn/recipe/remark-html/
https://www.npmjs.com/package/remark-parse
https://www.npmjs.com/package/remark-stringify
https://www.npmjs.com/package/remark
https://snyk.io/advisor/npm-package/mdast-util-heading-range/functions/mdast-util-heading-range
https://snyk.io/advisor/npm-package/github-slugger/example
https://medium.com/@rezahedi/how-to-build-table-of-contents-in-astro-and-sectionize-the-markdown-content-78bee84e6a7f
https://npm-compare.com/front-matter,gray-matter,yaml-front-matter
https://www.sciencedirect.com/science/article/abs/pii/S138376212300190X
https://github.com/wickedest/Mergely
https://github.com/knennigtri/merge-markdown
https://github.com/netj/markdown-diff
https://github.com/jduckles/pwdiff
```
