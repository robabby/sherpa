# Conflict Marker Format Design for Section-Level Markdown Sync

**Research iteration:** 1
**Date:** 2026-03-12
**Focus:** What would a section-level conflict marker format look like for markdown files? Design a richer conflict marker format that includes section title, which version changed, and the intra-section diff. Compare to git's standard markers. What precedent exists in other tools?

---

## Key Discoveries

### 1. Git's conflict marker format is a 40-year-old line-oriented standard with exactly three variants

Git offers three conflict styles, all line-oriented. The label metadata after each marker delimiter is a single freeform string (branch name, commit hash, or custom `-L` label). No tool in the git ecosystem has extended what goes on that label line beyond a simple identifier.

**merge style** (default):
```
<<<<<<< HEAD
our changes
=======
their changes
>>>>>>> feature-branch
```

**diff3 style** (adds base version):
```
<<<<<<< HEAD
D
E
F
G
||||||| base
# Add More Letters
=======
D
E
X
Y
Z
>>>>>>> feature-branch
```

**zdiff3 style** (Git 2.35+, zealously trims shared lines from conflict region):
```
D
E
<<<<<<< HEAD
F
G
||||||| base
# Add More Letters
=======
X
Y
Z
>>>>>>> feature-branch
```

zdiff3 is diff3 but it "zealously moves any common lines at the beginning or end outside of the conflict area." This narrows the conflict region while preserving the base section. ([ductile.systems/zdiff3](https://www.ductile.systems/zdiff3/), [Adam Johnson zdiff3 blog](https://adamj.eu/tech/2023/12/29/git-conflict-display-zdiff3/), [neg4n.dev zdiff3 blog](https://neg4n.dev/blog/understanding-zealous-diff3-style-git-conflict-markers))

Configuration: `git config --global merge.conflictStyle zdiff3`. The `conflict-marker-size` gitattribute lets you change marker length from the default 7 characters (e.g., `*.md conflict-marker-size=32`). ([git-scm.com/docs/gitattributes](https://git-scm.com/docs/gitattributes))

The `-L` flag on `git merge-file` provides up to three custom labels: `git merge-file -L x -L y -L z a b c` makes output look like it came from files x, y, z. Labels replace branch names on the `<<<<<<<` and `>>>>>>>` lines. ([man7.org/git-merge-file](https://www.man7.org/linux/man-pages/man1/git-merge-file.1.html))

### 2. Jujutsu (jj) invented the most innovative conflict marker format: diff-based conflicts

Jujutsu breaks from the git tradition entirely. Instead of showing two (or three) snapshots, it shows a **snapshot plus diffs to apply**. This is the most novel format in active use.

**Default (diff-based) format:**
```
<<<<<<< conflict 1 of 3
+++++++
    print("Hello, world!");
    print("Goodbye, world!");
%%%%%%%
     print_hello();
-    print_goodbye();
>>>>>>> conflict 1 of 3 ends
```

- `+++++++` marks a **snapshot** (base content)
- `%%%%%%%` marks a **diff** to apply to the snapshot
- `<<<<<<<` / `>>>>>>>` are boundaries with **conflict numbering** ("conflict 1 of 3")
- Resolution = "apply your own take on the diff to the snapshot"

**Snapshot format** (alternative, `ui.conflict-marker-style: "snapshot"`):
```
<<<<<<< conflict 1 of 1
+++++++ [commit A]
apple
grapefruit
orange
------- [merge base]
apple
grape
orange
+++++++ [commit B]
APPLE
GRAPE
ORANGE
>>>>>>> conflict 1 of 1 ends
```

**Git compatibility format** (`ui.conflict-marker-style: "git"`): Standard `<<<<<<<`/`|||||||`/`=======`/`>>>>>>>` markers, but limited to 2-sided conflicts.

Key innovations:
- **Conflict numbering** in the boundary markers ("conflict 1 of 3")
- **Multi-sided conflict support** (arbitrary number of sides, not just 2)
- **`-------`** separator for base in snapshot format
- Markers auto-extend (e.g., `<<<<<<<<<<<<<<`) when file content could be confused with markers

([docs.jj-vcs.dev/latest/conflicts](https://docs.jj-vcs.dev/latest/conflicts/), [Steve Klabnik jj tutorial](https://steveklabnik.github.io/jujutsu-tutorial/branching-merging-and-conflicts/conflicts.html), [Chris Krycho on deferred conflicts](https://v5.chriskrycho.com/journal/deferred-conflict-resolution-in-jujutsu/), [jj-vcs/jj conflicts.md](https://github.com/jj-vcs/jj/blob/main/docs/conflicts.md), [jj settings docs](https://jj-vcs.github.io/jj/latest/config/))

### 3. Weave is the first tool to put entity-level metadata on conflict marker lines

Weave (Ataraxy Labs) is an entity-level semantic merge driver using tree-sitter. When conflicts remain unresolved, it produces markers with **entity type, entity name, and conflict reason** appended to the delimiter lines:

```
<<<<<<< ours — function `process` (both modified)
export function process(data: any) {
    return JSON.stringify(data);
}
=======
export function process(data: any) {
    return data.toUpperCase();
}
>>>>>>> theirs — function `process` (both modified)
```

The label format is: `<<<<<<< <side> — <entity-type> \`<entity-name>\` (<conflict-reason>)`

This is the **closest existing precedent** to what we want for section-level markdown markers. The key pattern: structured metadata embedded in the marker line itself, using a `—` (em dash) separator between the side label and the semantic context.

Weave supports Markdown among its 24 languages but doesn't document how it defines markdown "entities" (likely headings-as-entities via tree-sitter-markdown). ([GitHub: Ataraxy-Labs/weave](https://github.com/Ataraxy-Labs/weave), [weave docs](https://ataraxy-labs.github.io/weave/), [HN discussion](https://news.ycombinator.com/item?id=47241976), [Top AI Product writeup](https://topaiproduct.com/2026/03/04/weave-finally-makes-git-merges-understand-your-code/))

### 4. Mergiraf uses diff3 format with generic LEFT/BASE/RIGHT labels

Mergiraf (syntax-aware merge for 33 languages) uses standard diff3-style conflict markers but with fixed directional labels instead of branch names:

```
<<<<<<< LEFT
"new_letter": "left value",
||||||| BASE
=======
"new_letter": "right value",
>>>>>>> RIGHT
```

It adds no structural metadata to the marker lines. Its value is in *preventing* conflicts via AST-aware merging, not in enriching the markers when conflicts occur. ([mergiraf.org](https://mergiraf.org/), [mergiraf.org/conflicts.html](https://mergiraf.org/conflicts.html), [mergiraf.org/usage.html](https://mergiraf.org/usage.html), [LWN article](https://lwn.net/Articles/1042355/))

### 5. csvdiff3/csvmerge3 is the best precedent for **structured field-level conflict metadata**

csvmerge3 produces conflict markers with **row identity, line number, and per-field conflict details** as structured metadata on the marker lines:

```
>>>>>> input @3 (banana)
>>>>>> count = 4
banana,4
====== input @3 (banana)
====== count = 5
banana,5
<<<<<<
```

Key innovations:
- **Row identity** on the marker line: `@3 (banana)` = line 3, primary key "banana"
- **Field-level conflict annotation**: `count = 4` tells you exactly which column differs
- **Delete annotations**: `>>>>>> input Deleted @5` with `count = None`
- Reversed marker direction (`>>>>>>` opens, `<<<<<<` closes) compared to git

This is the most **structured** conflict marker format in active use. It proves that marker lines can carry rich metadata beyond simple labels. ([GitHub: sctweedie/csvdiff3](https://github.com/sctweedie/csvdiff3))

### 6. Darcs and Pijul use completely different marker character sets

**Darcs** uses:
```
v v v v v v v
rooms
*************
tables
^ ^ ^ ^ ^ ^ ^
```

Three markers: `v v v` (opening), `*************` (separator), `^ ^ ^ ^ ^` (closing). No labels, no base version. The markers are visually distinct from git but carry less information. ([darcs.net/FAQ/Conflicts](https://darcs.net/FAQ/Conflicts), [Wikibooks: Understanding Darcs](https://en.wikibooks.org/wiki/Understanding_Darcs/Patch_theory_and_conflicts))

**Pijul** uses long repeated characters:
```
>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
version A content
================================
version B content
<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
```

Similar to git's markers but much longer (32 characters) and with different character choices. No labels or metadata. ([Pijul discourse](https://discourse.pijul.org/t/merge-conflict-markers-for-easy-merge/765/1), [pijul.org/manual/conflicts.html](https://pijul.org/manual/conflicts.html))

### 7. Copier uses git-style markers with contextual side labels

Copier (Python template sync tool) uses git conflict markers with descriptive labels that explain the semantic meaning of each side:

```
<<<<<<< before updating
version 2
=======
version 1.1
>>>>>>> after updating
```

This is notable because the labels aren't branch names -- they're **semantic descriptions** of what each version represents in the sync workflow. This is exactly the pattern we should follow: labels that explain the *role* of each version (upstream, consumer, base) rather than opaque identifiers. ([copier.readthedocs.io/en/stable/updating](https://copier.readthedocs.io/en/stable/updating/), [GitHub issue #1833](https://github.com/copier-org/copier/issues/1833))

Copier also supports `--conflict rej` which produces separate `.rej` files containing unified diffs of unresolved conflicts. ([copier.readthedocs.io/en/stable/configuring](https://copier.readthedocs.io/en/stable/configuring/))

### 8. VS Code's conflict marker parser is permissive but expects specific delimiter strings

VS Code's merge-conflict extension parses these exact constants:
- `startHeaderMarker = '<<<<<<<'`
- `commonAncestorsMarker = '|||||||'`
- `splitterMarker = '======='`
- `endFooterMarker = '>>>>>>>'`

It uses `line.text.startsWith(marker)` for detection -- meaning **anything after the marker characters is treated as a label** and displayed as-is. This is confirmed by the diff3 support PR that added `|||||||` handling. The parser creates an `IScanMergedConflict` object with optional `commonAncestors` property.

**Implication for us:** Any format that starts lines with these four strings will get free VS Code CodeLens rendering (Accept Current / Accept Incoming / Accept Both / Compare). We can put arbitrary metadata after the marker characters.

([vscode mergeConflictParser.ts](https://github.com/microsoft/vscode/blob/main/extensions/merge-conflict/src/mergeConflictParser.ts), [diff3 support PR #27405](https://github.com/Microsoft/vscode/pull/27405), [VS Code merge conflicts docs](https://code.visualstudio.com/docs/sourcecontrol/merge-conflicts), [vscode issue #145048](https://github.com/microsoft/vscode/issues/145048))

### 9. JetBrains has an open feature request to understand conflict markers in-editor

JetBrains IDEs don't parse conflict markers from file content in the editor -- they only use their three-way merge tool during `git merge`. There's an open feature request (IJPL-81459 / IDEA-140959) asking for in-editor marker understanding. The three-way merge UI shows left/right/result panes with base revision.

**Implication:** JetBrains users won't get automatic parsing of our markers, but they wouldn't get it for standard git markers either when opening files directly. This is acceptable. ([YouTrack IJPL-81459](https://youtrack.jetbrains.com/issue/IJPL-81459/Understand-merge-conflict-markers-in-the-editor), [YouTrack IDEA-140959](https://youtrack.jetbrains.com/issue/IDEA-140959/Understand-merge-conflict-markers-in-the-editor), [JetBrains resolve conflicts docs](https://www.jetbrains.com/help/idea/resolve-conflicts.html))

### 10. diff-conflict-marker converts diffs to conflict markers for AI-assisted code review

The `diff-conflict-marker` npm package reads the committed version from git and converts diffs into conflict markers so VS Code can render side-by-side comparisons. This validates the pattern of **generating conflict markers as a presentation format**, not just as merge output. ([GitHub: benlau/diff-conflict-marker](https://github.com/benlau/diff-conflict-marker))

### 11. Structured merge research (Spork, LASTMERGE, SemanticMerge) uses standard git markers for fallback

Academic and commercial structured merge tools (Spork for Java, LASTMERGE for generic languages, SemanticMerge from Plastic SCM) all fall back to standard git `<<<<<<<`/`=======`/`>>>>>>>` markers when they can't auto-resolve. None of them enrich the marker lines with metadata. The enrichment happens in the UI layer (three-way merge editors), not in the file format.

([GitHub: ASSERT-KTH/spork](https://github.com/ASSERT-KTH/spork), [LASTMERGE paper](https://arxiv.org/abs/2507.19687), [SemanticMerge intro](https://docs.plasticscm.com/semanticmerge/intro-guide/semanticmerge-intro-guide), [SemanticMerge features](https://www.semanticmerge.com/features))

### 12. git rerere proves that conflict identity can be hashed for caching

git rerere computes a SHA-1 hash of conflict hunks (with markers stripped) to create a conflict ID, enabling automatic replay of previously-resolved conflicts. The preimage/postimage pair is stored in `.git/rr-cache/<hash>/`.

**Implication:** We could build a similar mechanism for `sherpa sync` -- hash section-level conflicts to auto-apply previously-resolved section conflicts. The section title + conflict content would make excellent hash inputs. ([git-scm.com/docs/git-rerere](https://git-scm.com/docs/git-rerere), [DEV: git rerere deep dive](https://dev.to/louis7/git-deep-dive-mastering-rerere-12jm), [Atlassian: resolving conflicts with rerere](https://www.atlassian.com/blog/bitbucket/resolving-conflicts-with-git-rerere))

### 13. tree-sitter-markdown uses a flat structure, not hierarchical sections

The tree-sitter-markdown parser treats all headings as flat siblings at the document level, following the CommonMark spec which treats ATX headings as leaf blocks, not container blocks. There is no native "section" node in the AST.

**Implication:** Weave's markdown support likely does heading-level entity matching (each heading + its content until the next heading of same or higher level), not native section parsing. We need our own section tokenizer that groups content by heading hierarchy -- which is what node-diff3 with a custom `stringSeparator` regex would give us. ([tree-sitter-markdown issue #19](https://github.com/ikatyang/tree-sitter-markdown/issues/19), [tree-sitter-grammars/tree-sitter-markdown](https://github.com/tree-sitter-grammars/tree-sitter-markdown))

---

## Concrete Proposal: Section-Level Conflict Marker Format

### Design Principles

1. **VS Code compatibility**: Start lines with `<<<<<<<`, `|||||||`, `=======`, `>>>>>>>` so existing editor CodeLens works
2. **Structured metadata on marker lines**: After the standard markers, add section title, side label, and change classification using a separator
3. **diff3-style base section**: Always include the base version (like zdiff3) because sherpa sync always has a three-way merge context
4. **Intra-section diff annotations**: Within the conflict body, show unified diff markers (`+`/`-`) for the changes within each side
5. **Machine-parseable**: A regex can extract section title, side, and change type from each marker line
6. **Human-scannable**: A developer skimming the file can immediately identify which section conflicted and what each side did

### Proposed Format

```markdown
<<<<<<< upstream — ## Configuration (modified)
## Configuration

Set the timeout to 60 seconds:

```yaml
timeout: 60s
retries: 3
```

||||||| base — ## Configuration
## Configuration

Set the timeout to 30 seconds:

```yaml
timeout: 30s
```

======= consumer — ## Configuration (modified)
## Configuration

Set the timeout to 45 seconds for production:

```yaml
timeout: 45s
max_connections: 100
```

>>>>>>> end — ## Configuration
```

### Format Grammar

```
<marker-line>  ::= <marker> " " <side> " — " <section-title> [" (" <change-type> ")"]
<marker>       ::= "<<<<<<< " | "||||||| " | "======= " | ">>>>>>> "
<side>         ::= "upstream" | "base" | "consumer" | "end"
<section-title>::= the markdown heading text including ## prefix
<change-type>  ::= "modified" | "added" | "deleted" | "moved"
```

The `—` (em dash, U+2014) separator was chosen because:
- Weave already established this convention
- It's visually distinct from `-` and `--`
- It doesn't appear in typical markdown headings
- It's a single Unicode codepoint, easy to split on

### Variant: With Intra-Section Diff

For an enriched format that shows what changed within each side (inspired by jj's diff-based markers), we could add diff annotations:

```markdown
<<<<<<< upstream — ## Configuration (modified)
  ## Configuration

- Set the timeout to 30 seconds:
+ Set the timeout to 60 seconds:

  ```yaml
- timeout: 30s
+ timeout: 60s
+ retries: 3
  ```

||||||| base — ## Configuration
## Configuration

Set the timeout to 30 seconds:

```yaml
timeout: 30s
```

======= consumer — ## Configuration (modified)
  ## Configuration

- Set the timeout to 30 seconds:
+ Set the timeout to 45 seconds for production:

  ```yaml
- timeout: 30s
+ timeout: 45s
+ max_connections: 100
  ```

>>>>>>> end — ## Configuration
```

The intra-section diff uses leading `+`/`-`/` ` (space) prefix on every line within the upstream and consumer sections, showing what each side changed relative to base. This follows unified diff convention and would render correctly with any diff colorizer.

**Trade-off:** The diff-annotated variant is more informative but harder to resolve by simple deletion of markers. The user must also remove the `+`/`-`/` ` prefixes. This could be handled by the `sherpa sync --continue` command stripping prefixes, or we could make it opt-in (`--diff-annotations`).

### Variant: Compact (No Base Section)

For simple cases where showing the base adds noise:

```markdown
<<<<<<< upstream — ## Configuration (modified)
## Configuration

timeout: 60s
retries: 3

======= consumer — ## Configuration (modified)
## Configuration

timeout: 45s
max_connections: 100

>>>>>>> end — ## Configuration
```

### Side Labels Vocabulary

| Label | Meaning |
|-------|---------|
| `upstream` | The framework/template version (source of truth) |
| `consumer` | The project's local version (customized) |
| `base` | The common ancestor version (last sync point) |
| `end` | Closing marker (always on `>>>>>>>`) |

These labels are semantically meaningful for the `sherpa sync` use case (convention sync from framework to project). Compare to git's opaque branch names or Copier's "before updating"/"after updating".

### Change Classification

| Classification | Meaning |
|----------------|---------|
| `modified` | Content changed from base |
| `added` | Section didn't exist in base |
| `deleted` | Section was removed (shown as empty between markers) |
| `moved` | Section was reordered (future: if we track section ordering) |

### Regex for Machine Parsing

```javascript
// Parse a conflict marker line
const MARKER_RE = /^(<{7}|={7}|\|{7}|>{7})\s+(\w+)\s+—\s+(#+\s+.+?)(?:\s+\((\w+)\))?$/;

// Groups: [1] marker, [2] side, [3] section title, [4] change type (optional)
// Example: "<<<<<<< upstream — ## Configuration (modified)"
//   → marker: "<<<<<<<", side: "upstream", title: "## Configuration", change: "modified"
```

---

## Comparison Table

| Tool | Marker chars | Sections | Labels | Base shown | Entity context | Intra-diff |
|------|-------------|----------|--------|------------|----------------|------------|
| Git (merge) | `<<<` `===` `>>>` | 2 | Branch names | No | No | No |
| Git (diff3) | `<<<` `\|\|\|` `===` `>>>` | 3 | Branch names | Yes | No | No |
| Git (zdiff3) | `<<<` `\|\|\|` `===` `>>>` | 3 | Branch names | Yes (trimmed) | No | No |
| Jujutsu (diff) | `<<<` `+++` `%%%` `>>>` | 2+ | Commit labels | As snapshot | No | Yes (`+`/`-`) |
| Jujutsu (snapshot) | `<<<` `+++` `---` `>>>` | 3+ | Commit labels | Yes | No | No |
| Weave | `<<<` `===` `>>>` | 2 | Side + entity metadata | No | **Yes** (type, name, reason) | No |
| Mergiraf | `<<<` `\|\|\|` `===` `>>>` | 3 | LEFT/BASE/RIGHT | Yes | No | No |
| Copier | `<<<` `===` `>>>` | 2 | Semantic descriptions | No | No | No |
| Darcs | `v v v` `***` `^ ^ ^` | 2 | None | No | No | No |
| Pijul | `>>>` `===` `<<<` | 2 | None | No | No | No |
| csvmerge3 | `>>>` `===` `<<<` | 2 | Row identity + field values | No | **Yes** (row key, field names) | No |
| **sherpa sync (proposed)** | `<<<` `\|\|\|` `===` `>>>` | **3** | **Side + section title + change type** | **Yes** | **Yes** (heading) | **Optional** |

---

## Implications for sherpa sync

1. **Use git-compatible marker characters.** Starting marker lines with `<<<<<<<`, `|||||||`, `=======`, `>>>>>>>` gives us free VS Code CodeLens support and compatibility with any tool that detects git conflict markers (lazygit, delta, gh, etc.).

2. **Put section metadata on the marker line after a `—` separator.** This is the key innovation. Weave proved this pattern works. VS Code's parser ignores everything after the marker characters, so our metadata is invisible to it but visible to humans and our own tooling.

3. **Always include the base section.** diff3/zdiff3 style with `|||||||` is strictly more useful than merge style for three-way merge. The base version is essential context for resolving section-level conflicts because markdown prose has no "syntax" to guide resolution.

4. **Use semantic side labels, not branch names.** `upstream`/`base`/`consumer` are immediately meaningful in the sherpa sync context. This follows Copier's approach of labeling by role rather than by git ref.

5. **Make intra-section diff annotations opt-in.** The diff-annotated format (jj-inspired) is more informative but makes manual resolution harder (must strip prefixes). Default to clean content, offer `--show-diffs` flag.

6. **Section title in marker enables random-access.** A user can `grep "^<<<<<<< " file.md` to get a table of contents of all conflicts with their section titles. This is impossible with standard git markers.

7. **Change classification enables smart defaults.** If we know upstream modified and consumer didn't, we can auto-accept upstream. If both modified, we present the conflict. The classification on the marker line makes this logic transparent.

8. **Consider rerere-style caching.** Hash(section_title + upstream_content + consumer_content) could index previously-resolved section conflicts. When the same section conflicts again with the same content, auto-apply the prior resolution.

9. **Closing marker uses `end` side label.** Jujutsu's "conflict 1 of 3 ends" pattern is good precedent. Our `>>>>>>> end — ## Section` explicitly closes the named section, making the format self-documenting.

10. **Conflict numbering is useful for CLI.** Consider adding conflict numbering to the opening marker: `<<<<<<< upstream — ## Configuration (modified) [1/3]` for "conflict 1 of 3". This helps the interactive resolver show progress.

---

## Open Questions

1. **Should the base section be mandatory?** If the base is identical to one side, it's redundant noise. zdiff3's approach of trimming common lines is smart -- should we apply the same principle at the section level? (i.e., omit base if it equals consumer?)

2. **How to handle sections added by one side only?** If upstream adds a new `## Deployment` section that doesn't exist in consumer or base, is that a conflict or an auto-merge? Current thinking: auto-merge unless consumer explicitly deleted the region where it would go.

3. **How to handle frontmatter (YAML between `---` lines)?** Frontmatter isn't a "section" in the heading sense. Should it be treated as a special section `--- frontmatter ---` or handled separately?

4. **What about content before the first heading (preamble)?** If a markdown file starts with prose before any `##` heading, how is that tokenized? Probably as a synthetic "preamble" section.

5. **Should we support a JSON/structured sidecar format?** Instead of (or in addition to) inline conflict markers, produce a `.sherpa-conflicts.json` that describes conflicts as structured data, with the file on disk containing either the base version or a best-effort merge. The CLI interactive resolver would read the JSON. Editors would see a clean file.

6. **Weave's markdown entity model:** What does Weave actually use as markdown "entities"? If it's heading-level sections, we should study its implementation. If it's something else (paragraphs? list items?), that's a different approach.

7. **Marker length:** Should we use 7-character markers (git default) or longer (e.g., 10)? Longer markers are less likely to collide with markdown content. Jujutsu auto-extends when needed.

8. **Em dash encoding:** The `—` (U+2014) separator is a Unicode character. Some older tools might not handle it. Should we fall back to ` -- ` (space-dash-dash-space) for maximum compatibility?

---

## Sources

### Git conflict format documentation
- [Better Git Conflicts with zdiff3](https://www.ductile.systems/zdiff3/) — Best explanation of merge vs diff3 vs zdiff3 with visual examples
- [Understanding zdiff3 in Git conflicts](https://neg4n.dev/blog/understanding-zealous-diff3-style-git-conflict-markers) — Detailed walkthrough of zdiff3 behavior
- [Git merge docs (2.38)](https://git-scm.com/docs/git-merge/2.38.0) — Official merge documentation
- [zdiff3 patchwork commit](https://patchwork.kernel.org/project/git/patch/50e82a7a32c1cc5c1d2282f6f5b2b32a8ce7444f.1623734171.git.gitgitgadget@gmail.com/) — Original zdiff3 patch discussion
- [Adam Johnson: zdiff3 conflict display](https://adamj.eu/tech/2023/12/29/git-conflict-display-zdiff3/) — Practical guide to enabling zdiff3
- [Git's Diff3 Conflict Style (Medium)](https://medium.com/codex/gits-diff3-conflict-style-and-how-to-use-it-91132a040837) — Tutorial with examples
- [git merge-file man page](https://www.man7.org/linux/man-pages/man1/git-merge-file.1.html) — `-L` labels, `--marker-size`, `--diff3`/`--zdiff3` options
- [git-scm.com/docs/gitattributes](https://git-scm.com/docs/gitattributes) — `conflict-marker-size` attribute documentation
- [git-scm.com/docs/merge-config](https://git-scm.com/docs/merge-config) — Merge configuration options
- [lazygit conflict-marker-size issue](https://github.com/jesseduffield/lazygit/issues/4367) — Non-standard marker sizes
- [Git Advanced Merging](https://git-scm.com/book/en/v2/Git-Tools-Advanced-Merging) — Official advanced merge guide
- [git ddfc44a commit](https://github.com/git/git/commit/ddfc44a898a58311392a5329687a1813d6b94779) — zdiff3 documentation commit
- [git-scm.com/docs/git-rerere](https://git-scm.com/docs/git-rerere) — rerere documentation
- [Atlassian: resolving conflicts with rerere](https://www.atlassian.com/blog/bitbucket/resolving-conflicts-with-git-rerere) — rerere practical guide
- [DEV: git rerere deep dive](https://dev.to/louis7/git-deep-dive-mastering-rerere-12jm) — Internal format of rerere

### Jujutsu (jj) conflict format
- [jj conflicts documentation](https://docs.jj-vcs.dev/latest/conflicts/) — Official conflict marker format docs (all three styles)
- [jj conflicts.md on GitHub](https://github.com/jj-vcs/jj/blob/main/docs/conflicts.md) — Source markdown
- [Steve Klabnik's jj tutorial: conflicts](https://steveklabnik.github.io/jujutsu-tutorial/branching-merging-and-conflicts/conflicts.html) — Walkthrough with examples
- [Chris Krycho: Deferred Conflict Resolution in jj](https://v5.chriskrycho.com/journal/deferred-conflict-resolution-in-jujutsu/) — Philosophy of first-class conflicts
- [jj settings docs](https://jj-vcs.github.io/jj/latest/config/) — `ui.conflict-marker-style` configuration
- [jj-diffconflicts](https://github.com/rafikdraoui/jj-diffconflicts) — Neovim conflict resolution tool for jj
- [jj DeepWiki: Tree Merging and Conflicts](https://deepwiki.com/jj-vcs/jj/2.4-revision-selection-(revsets)) — Internal tree merge implementation
- [jj for everyone: resolving conflicts](https://jj-for-everyone.github.io/conflict.html) — Tutorial
- [Tony Finn: Jujutsu (jj)](https://tonyfinn.com/blog/jj/) — Overview comparing jj to git

### Weave (entity-level merge)
- [GitHub: Ataraxy-Labs/weave](https://github.com/Ataraxy-Labs/weave) — Source repo with conflict marker examples
- [Weave docs](https://ataraxy-labs.github.io/weave/) — Official documentation
- [Weave HN discussion](https://news.ycombinator.com/item?id=47241976) — Community discussion of Weave vs mergiraf vs git
- [Weave: Top AI Product writeup](https://topaiproduct.com/2026/03/04/weave-finally-makes-git-merges-understand-your-code/) — Overview article
- [difftastic issue #950: link to weave](https://github.com/Wilfred/difftastic/issues/950) — Discussion of entity-level merge
- [Weave releases](https://github.com/Ataraxy-Labs/weave/releases) — Version history
- [mbrukman fork of weave](https://github.com/mbrukman/Ataraxy-Labs-weave) — Mirror

### Mergiraf
- [mergiraf.org](https://mergiraf.org/) — Official site
- [mergiraf.org/conflicts.html](https://mergiraf.org/conflicts.html) — Conflicts solved, limitations, marker format
- [mergiraf.org/usage.html](https://mergiraf.org/usage.html) — Usage guide
- [LWN: Mergiraf syntax-aware merging](https://lwn.net/Articles/1042355/) — Linux Weekly News article
- [Terminal Trove: mergiraf](https://terminaltrove.com/mergiraf/) — Tool listing
- [docs.rs/mergiraf](https://docs.rs/mergiraf/latest/mergiraf/) — Rust API docs

### Copier (template sync)
- [Copier updating docs](https://copier.readthedocs.io/en/stable/updating/) — 3-way merge, --conflict rej/inline
- [Copier configuring docs](https://copier.readthedocs.io/en/stable/configuring/) — Template config reference
- [Copier issue #1833](https://github.com/copier-org/copier/issues/1833) — Conflict markers + VS Code/mergetool incompatibility
- [Copier issue #943](https://github.com/copier-org/copier/issues/943) — Wrong .rej file content
- [Copier discussion #456](https://github.com/copier-org/copier/discussions/456) — Always a conflict when not identical
- [Copier issue #2486](https://github.com/copier-org/copier/issues/2486) — `copier adopt` feature request
- [Copier DeepWiki: updating projects](https://deepwiki.com/copier-org/copier/3.4-updating-projects) — Deep dive
- [Copier DeepWiki: template config](https://deepwiki.com/copier-org/copier/3.2-template-configuration-reference) — Config reference

### csvdiff3 (structured conflict markers)
- [GitHub: sctweedie/csvdiff3](https://github.com/sctweedie/csvdiff3) — CSV 3-way merge with field-level conflict metadata
- [Paul Fitz: Diff and merge CSV files in git](https://paulfitz.github.io/2014/07/09/diff-merge-csv.html) — Background on CSV merge

### Darcs and Pijul
- [Darcs FAQ: Conflicts](https://darcs.net/FAQ/Conflicts) — Darcs conflict marker format
- [Understanding Darcs: Patch theory and conflicts](https://en.wikibooks.org/wiki/Understanding_Darcs/Patch_theory_and_conflicts) — Marker examples
- [Pijul conflicts manual](https://pijul.org/manual/conflicts.html) — Conflict concepts
- [Pijul discourse: merge conflict markers](https://discourse.pijul.org/t/merge-conflict-markers-for-easy-merge/765/1) — Discussion of Pijul's marker format
- [Pijul: Why Pijul](https://pijul.org/manual/why_pijul.html) — Philosophy of first-class conflicts
- [Pijul theory](https://pijul.org/manual/theory.html) — Formal conflict theory
- [jneem: Part 2: Merging, patches, and pijul](https://jneem.github.io/pijul/) — Technical deep dive

### Editor conflict marker parsing
- [VS Code mergeConflictParser.ts](https://github.com/microsoft/vscode/blob/main/extensions/merge-conflict/src/mergeConflictParser.ts) — Source code for VS Code marker detection
- [VS Code PR #27405: diff3 support](https://github.com/Microsoft/vscode/pull/27405) — Added `|||||||` base marker parsing
- [VS Code merge conflicts docs](https://code.visualstudio.com/docs/sourcecontrol/merge-conflicts) — Official docs
- [VS Code issue #145048](https://github.com/microsoft/vscode/issues/145048) — Markers hidden by editor
- [VS Code issue #158763](https://github.com/microsoft/vscode/issues/158763) — Merge editor vs CodeLens
- [VS Code issue #157365](https://github.com/microsoft/vscode/issues/157365) — diff3 markers in merge editor
- [VS Code issue #157107](https://github.com/microsoft/vscode/issues/157107) — Merge editor fails to detect markers
- [JetBrains YouTrack IJPL-81459](https://youtrack.jetbrains.com/issue/IJPL-81459/Understand-merge-conflict-markers-in-the-editor) — Feature request for in-editor marker understanding
- [JetBrains YouTrack IDEA-140959](https://youtrack.jetbrains.com/issue/IDEA-140959/Understand-merge-conflict-markers-in-the-editor) — Original request
- [JetBrains resolve conflicts docs](https://www.jetbrains.com/help/idea/resolve-conflicts.html) — Three-way merge UI docs

### Structured merge research
- [GitHub: ASSERT-KTH/spork](https://github.com/ASSERT-KTH/spork) — AST-based structured merge for Java
- [Spork paper (IEEE TSE)](https://doi.org/10.1109/TSE.2022.3143766) — Structured merge with formatting preservation
- [Spork paper on arXiv](https://arxiv.org/abs/2202.05329) — Preprint
- [LASTMERGE paper](https://arxiv.org/abs/2507.19687) — Language-agnostic structured merge tool (2025)
- [LASTMERGE on ResearchGate](https://www.researchgate.net/publication/394080772_LastMerge_A_language-agnostic_structured_tool_for_code_integration) — PDF
- [Conflict Resolution via Version Space Algebra (OOPSLA 2018)](https://dl.acm.org/doi/10.1145/3276536) — Academic conflict resolution
- [Version Space Algebra paper PDF](https://feihe.github.io/materials/oopsla18.pdf) — Full text
- [SemanticMerge intro guide](https://docs.plasticscm.com/semanticmerge/intro-guide/semanticmerge-intro-guide) — Plastic SCM semantic merge
- [SemanticMerge features](https://www.semanticmerge.com/features) — Feature overview
- [Plastic SCM blog: Split merge conflicts blocks](https://blog.plasticscm.com/2019/03/split-merge-conflicts-blocks.html) — Splitting large conflicts
- [Plastic SCM blog: State of the art in merge technology](https://blog.plasticscm.com/2013/06/the-state-of-art-in-merge-technology.html) — Survey
- [Evaluation of merge tools (ASE 2024)](https://homes.cs.washington.edu/~mernst/pubs/merge-evaluation-ase2024.pdf) — Comparison study
- [MergeGen (ASE 2023)](https://dl.acm.org/doi/abs/10.1109/ASE56229.2023.00155) — AI-based conflict resolution
- [Semistructured Merge with Syntactic Separators](https://arxiv.org/html/2407.18888v1) — Recent research
- [Martin Fowler: Semantic Conflict](https://martinfowler.com/bliki/SemanticConflict.html) — Concept definition
- [Detecting semantic conflicts with unit tests](https://www.sciencedirect.com/science/article/pii/S0164121224001158) — ScienceDirect paper
- [Using LLMs to resolve merge conflicts (ISSTA 2022)](https://dl.acm.org/doi/abs/10.1145/3533767.3534396) — AI-assisted resolution

### diff3 algorithm
- [James Coglan: Merging with diff3](https://blog.jcoglan.com/2017/05/08/merging-with-diff3/) — Best algorithmic explanation
- [James Coglan: Why merges fail](https://blog.jcoglan.com/2017/06/19/why-merges-fail-and-what-can-be-done-about-it/) — Failure modes
- [diff3 Wikipedia](https://en.wikipedia.org/wiki/Diff3) — Overview with algorithm description
- [The Magic of 3-Way Merge](https://blog.git-init.com/the-magic-of-3-way-merge/) — Illustrated explanation
- [diff3 man page](https://man7.org/linux/man-pages/man1/diff3.1.html) — Unix diff3 options
- [Merging and More with diff3](https://www.jpeek.com/articles/linuxmag/2007-06/) — Linux Magazine article
- [Three-Way Merge (revctrl.org)](https://tonyg.github.io/revctrl.org/ThreeWayMerge.html) — Theory wiki
- [Three-Way Merging: Under the Hood (Dr Dobb's)](https://www.drdobbs.com/tools/three-way-merging-a-look-under-the-hood/240164902) — Deep dive
- [Algorithm::Merge (Perl)](https://metacpan.org/pod/Algorithm::Merge) — Three-way merge library
- [movableink/three-way-merge](https://github.com/movableink/three-way-merge) — JavaScript three-way merge library

### tree-sitter-markdown
- [tree-sitter-grammars/tree-sitter-markdown](https://github.com/tree-sitter-grammars/tree-sitter-markdown) — Grammar repo
- [ikatyang/tree-sitter-markdown](https://github.com/ikatyang/tree-sitter-markdown) — Original grammar
- [tree-sitter-markdown issue #19: Hierarchical syntax tree](https://github.com/ikatyang/tree-sitter-markdown/issues/19) — Discussion of flat vs hierarchical structure
- [tree-sitter-markdown issue #20: Heading level tokens](https://github.com/ikatyang/tree-sitter-markdown/issues/20) — Heading level distinction
- [tree-sitter-markdown playground](https://ikatyang.github.io/tree-sitter-markdown/) — Interactive parser
- [tree-sitter-markdown DeepWiki](https://deepwiki.com/tree-sitter-grammars/tree-sitter-markdown) — Architecture overview

### Other tools and resources
- [diff-conflict-marker](https://github.com/benlau/diff-conflict-marker) — Convert diffs to conflict markers for VS Code review
- [NeuBlink/syncwright](https://github.com/NeuBlink/syncwright) — AI-powered Git merge conflict resolution
- [DiffDog markdown comparison blog](https://www.altova.com/blog/2026/02/comparing-markdown-files-in-the-age-of-agentic-ai-why-diffdog) — Altova DiffDog for markdown
- [Merge (version control) Wikipedia](https://en.wikipedia.org/wiki/Merge_(version_control)) — General overview
- [A Formal Investigation of Diff3](https://www.researchgate.net/publication/221583306_A_Formal_Investigation_of_Diff3) — Academic treatment
- [delta: diff3 conflict support issue](https://github.com/dandavison/delta/issues/1276) — delta diff pager support
- [whiteinge/diffconflicts](https://github.com/whiteinge/diffconflicts) — Vimdiff merge tool
- [Sapling SCM](https://sapling-scm.com/docs/introduction/) — Meta's source control
- [Sapling on GitHub](https://github.com/facebook/sapling) — Source repo
- [Comparison of VCS software (Wikipedia)](https://en.wikipedia.org/wiki/Comparison_of_version-control_software) — Feature comparison
- [Pijul vs Git merge philosophy](https://katafrakt.me/2017/05/27/beyond-git/) — Beyond Git
- [Debugg: git successors](https://debugg.ai/resources/git-successor-jujutsu-jj-sapling-stacked-diffs-monorepos-2025) — jj, Sapling, Pijul overview
- [crewAI: semantic merge driver issue](https://github.com/crewAIInc/crewAI/issues/4562) — Weave for agentic AI
- [LangGraph: entity-level merge issue](https://github.com/langchain-ai/langgraph/issues/6907) — Weave integration request
- [difftastic](https://github.com/Wilfred/difftastic) — Structural diff tool
- [git-hires-merge](https://github.com/paulaltin/git-hires-merge) — Interactive merge driver for non-overlapping line conflicts
- [Zed conflict resolution discussion](https://github.com/zed-industries/zed/discussions/26510) — Zed editor feature request

---

## Raw Links

Every URL encountered during research, including tangentially relevant ones:

```
https://www.ductile.systems/zdiff3/
https://neg4n.dev/blog/understanding-zealous-diff3-style-git-conflict-markers
https://git-scm.com/docs/git-merge/2.38.0
https://patchwork.kernel.org/project/git/patch/50e82a7a32c1cc5c1d2282f6f5b2b32a8ce7444f.1623734171.git.gitgitgadget@gmail.com/
https://adamj.eu/tech/2023/12/29/git-conflict-display-zdiff3/
https://medium.com/codex/gits-diff3-conflict-style-and-how-to-use-it-91132a040837
https://patchwork.kernel.org/project/git/patch/69f20a702b41bd2ccf86f14f0abe3b141c0eeb3a.1637028785.git.gitgitgadget@gmail.com/
https://github.com/git/git/commit/ddfc44a898a58311392a5329687a1813d6b94779
https://lore.kernel.org/git/90aee68e14adb503c41760265b619a2d70720c2a.1632006164.git.gitgitgadget@gmail.com/
https://lore.kernel.org/git/9ce7246c0e94ab8e73a4e87c11bdc2968d1e56b2.1631379829.git.gitgitgadget@gmail.com/
https://terminaltrove.com/mergiraf/
https://mergiraf.org/
https://github.com/Wilfred/difftastic
https://mergiraf.org/usage.html
https://lwn.net/Articles/1042355/
https://arxiv.org/pdf/2507.19687
https://docs.rs/mergiraf/latest/mergiraf/
https://github.com/ASSERT-KTH/spork
https://feihe.github.io/materials/oopsla18.pdf
https://github.com/Wilfred/difftastic/issues/950
https://github.com/Ataraxy-Labs/weave
https://ataraxy-labs.github.io/weave/
https://github.com/mbrukman/Ataraxy-Labs-weave
https://app.daily.dev/posts/github---ataraxy-labs-weave-entity-level-semantic-merge-driver-for-git-resolves-conflicts-that-git-1urlsgkzn
https://github.com/crewAIInc/crewAI/issues/4562
https://github.com/langchain-ai/langgraph/issues/6907
https://news.ycombinator.com/item?id=47241976
https://topaiproduct.com/2026/03/04/weave-finally-makes-git-merges-understand-your-code/
https://github.com/Ataraxy-Labs/weave/releases
https://copier.readthedocs.io/en/stable/configuring/
https://copier.readthedocs.io/en/stable/updating/
https://deepwiki.com/copier-org/copier/3.2-template-configuration-reference
https://github.com/copier-org/copier/blob/master/docs/updating.md
https://github.com/copier-org/copier/issues/943
https://deepwiki.com/copier-org/copier/3.4-updating-projects
https://github.com/orgs/copier-org/discussions/456
https://github.com/copier-org/copier/discussions/456
https://deepwiki.com/copier-org/copier/5.2-cli-reference
https://lyz-code.github.io/blue-book/copier/
https://github.com/copier-org/copier/issues/1833
https://github.com/copier-org/copier/issues/2486
https://code.visualstudio.com/docs/sourcecontrol/merge-conflicts
https://github.com/microsoft/vscode/issues/145048
https://github.com/microsoft/vscode/issues/158763
https://thecodefix.com/fix-git-merge-conflict-vs-code/
https://code.visualstudio.com/docs/sourcecontrol/overview
https://marketplace.visualstudio.com/items?itemName=eamodio.gitlens
https://www.alphr.com/vs-code-open-merge-editor/
https://github.com/microsoft/vscode/issues/71532
https://github.com/microsoft/vscode/issues/157107
https://discourse.pijul.org/t/merge-conflict-markers-for-easy-merge/765/2
https://www.snell-pym.org.uk/archives/2008/08/02/version-control-and-leadership/
https://en.wikipedia.org/wiki/Comparison_of_version-control_software
https://tonyfinn.com/blog/jj/
https://pijul.org/manual/why_pijul.html
https://katafrakt.me/2017/05/27/beyond-git/
https://docs.jj-vcs.dev/latest/conflicts/
https://dev.to/nyctef/automatically-resolve-formatting-conflicts-with-jj-fix-b92
https://deepwiki.com/jj-vcs/jj/2.4-revision-selection-(revsets)
https://steveklabnik.github.io/jujutsu-tutorial/branching-merging-and-conflicts/conflicts.html
https://github.com/jj-vcs/jj/blob/main/docs/conflicts.md
https://jj-vcs.github.io/jj/latest/config/
https://jj-for-everyone.github.io/conflict.html
https://github.com/rafikdraoui/jj-diffconflicts
https://deepwiki.com/jj-vcs/jj/5.4-diff-and-merge-tools
https://v5.chriskrycho.com/journal/deferred-conflict-resolution-in-jujutsu/
https://pijul.org/manual/conflicts.html
https://jneem.github.io/pijul/
https://overoxidize.github.io/pijul-theory/
https://pijul.org/manual/theory.html
https://discourse.pijul.org/t/ast-level-diffs-and-merges/187/4
https://github.com/bitemyapp/Pijul/blob/master/theory.md
https://gist.github.com/steshaw/aa314a5c7455f33734c36bf2b3d17ae8
https://debugg.ai/resources/git-successor-jujutsu-jj-sapling-stacked-diffs-monorepos-2025
https://discourse.pijul.org/t/request-for-comments-listing-files-with-conflicts-in-pijul-status/49
https://discourse.pijul.org/t/merge-conflict-markers-for-easy-merge/765/1
https://discourse.pijul.org/t/merge-conflict-markers-for-easy-merge/765/3
https://discourse.pijul.org/t/merge-conflict-markers-for-easy-merge/765/4
https://discourse.pijul.org/t/merge-conflict-markers-for-easy-merge/765/5
https://discourse.pijul.org/t/merge-conflict-markers-for-easy-merge/765/6
https://pijul.net/manual/print.html
https://darcs.net/FAQ/Conflicts
https://en.wikibooks.org/wiki/Understanding_Darcs/Patch_theory_and_conflicts
https://en.wikibooks.org/wiki/Understanding_Darcs/Patch_theory
https://darcs.net/Theory/GaneshPatchAlgebra
https://darcs.net/Theory/Conflictors
https://darcsbook.acmelabs.space/chapter06.html
https://darcs.net/Theory/PekkaPatchTheory
https://en.wikipedia.org/wiki/Darcs
https://darcs.net/Theory/MergersDocumentation
https://www.cs.tufts.edu/~nr/cs257/archive/david-roundy/Theory%20of%20patches.html
https://dl.acm.org/doi/10.1145/3276536
https://tools.ietf.org/html/rfc7386
https://dl.acm.org/doi/abs/10.17487/RFC7386
https://www.gitkraken.com/features/merge-conflict-resolution-tool
https://github.com/NeuBlink/syncwright
https://github.com/skills/resolve-merge-conflicts
https://github.com/knennigtri/merge-markdown
https://www.surfsidemedia.in/post/how-do-you-handle-merge-conflicts-in-markdown-files
https://github.com/zed-industries/zed/discussions/26510
https://dl.acm.org/doi/abs/10.1109/ASE56229.2023.00155
https://www.altova.com/blog/2026/02/comparing-markdown-files-in-the-age-of-agentic-ai-why-diffdog
https://tonyg.github.io/revctrl.org/ThreeWayMerge.html
https://en.wikipedia.org/wiki/Merge_(version_control)
https://github.com/abhinav/stitchmd
https://metacpan.org/pod/Algorithm::Merge
https://en.wikipedia.org/wiki/Diff3
https://www.drdobbs.com/tools/three-way-merging-a-look-under-the-hood/240164902
https://github.com/movableink/three-way-merge
https://github.com/JeNeSuisPasDave/MarkdownTools
https://github.com/sctweedie/csvdiff3
https://paulfitz.github.io/2014/07/09/diff-merge-csv.html
https://okfnlabs.org/blog/2013/08/08/diffing-and-patching-data.html
https://youtrack.jetbrains.com/issue/IJPL-81459/Understand-merge-conflict-markers-in-the-editor
https://www.jetbrains.com/help/idea/resolve-conflicts.html
https://www.jetbrains.com/help/idea/resolving-text-conflicts.html
https://youtrack.jetbrains.com/issue/IDEA-140959/Understand-merge-conflict-markers-in-the-editor
https://plugins.jetbrains.com/plugin/10656-git-conflict
https://www.jetbrains.com/help/idea/tutorial-use-idea-as-default-command-line-merge-tool.html
https://github.com/microsoft/vscode/blob/main/extensions/merge-conflict/src/mergeConflictParser.ts
https://github.com/Microsoft/vscode/pull/27405
https://github.com/microsoft/vscode/issues/157365
https://github.com/benlau/diff-conflict-marker
https://www.mercurial-scm.org/wiki/MergeToolConfiguration
https://www.mercurial-scm.org/repo/hg/help/merge-tools
https://book.mercurial-scm.org/read/merge.html
https://swcarpentry.github.io/hg-novice/13-conflicts/
https://docs.rhodecode.com/RhodeCode-Enterprise/tutorials/merging.html
https://www.mercurial-scm.org/help/topics/merge-tools
https://www.mercurial-scm.org/wiki/TutorialConflict
https://git-scm.com/docs/gitattributes
https://git-scm.com/docs/git-merge-file
https://www.man7.org/linux/man-pages/man1/git-merge-file.1.html
https://github.com/jesseduffield/lazygit/issues/4367
https://git-scm.com/docs/merge-config
https://github.com/paulaltin/git-hires-merge
https://www.charpeni.com/blog/use-custom-merge-driver-to-simplify-git-conflicts
https://www.graphite.com/guides/git-merge-driver
https://github.com/balbuf/composer-git-merge-driver
https://github.com/scolladon/sf-git-merge-driver
https://www.julianburr.de/til/custom-git-merge-drivers
https://github.com/Praqma/git-merge-driver
https://github.com/ikatyang/tree-sitter-markdown/issues/19
https://github.com/tree-sitter-grammars/tree-sitter-markdown
https://github.com/ikatyang/tree-sitter-markdown
https://github.com/ikatyang/tree-sitter-markdown/issues/20
https://ikatyang.github.io/tree-sitter-markdown/
https://deepwiki.com/tree-sitter-grammars/tree-sitter-markdown
https://docs.rs/tree-sitter-md
https://lib.rs/crates/tree-sitter-markdown
https://github.com/ASSERT-KTH/spork
https://www.researchgate.net/publication/358579660_Spork_Structured_Merge_for_Java_with_Formatting_Preservation
https://hal.science/hal-04423078/document
https://homes.cs.washington.edu/~mernst/pubs/merge-evaluation-ase2024.pdf
https://www.researchgate.net/publication/357921009_Spork_Structured_Merge_for_Java_with_Formatting_Preservation
https://github.com/ASSERT-KTH/spork/issues/529
https://arxiv.org/abs/2202.05329
https://arxiv.org/html/2507.19687
https://arxiv.org/pdf/2202.05329
https://arxiv.org/html/2407.18888v1
https://arxiv.org/abs/2507.19687
https://www.researchgate.net/publication/394080772_LastMerge_A_language-agnostic_structured_tool_for_code_integration
https://docs.plasticscm.com/semanticmerge/intro-guide/semanticmerge-intro-guide
https://docs.plasticscm.com/semanticmerge
https://blog.plasticscm.com/2016/12/driving-pita-merge-conflict-to-release.html
https://www.semanticmerge.com/features
https://www.semanticmerge.com/sm-guides/main
https://forum.plasticscm.com/forum/23-semanticmerge/
https://blog.plasticscm.com/2019/03/split-merge-conflicts-blocks.html
https://blog.plasticscm.com/2013/06/the-state-of-art-in-merge-technology.html
https://daedtech.com/merging-done-right-semantic-merge/
https://martinfowler.com/bliki/SemanticConflict.html
https://www.sciencedirect.com/science/article/pii/S0164121224001158
https://dl.acm.org/doi/abs/10.1145/3533767.3534396
https://blog.jcoglan.com/2017/05/08/merging-with-diff3/
https://blog.jcoglan.com/2017/06/19/why-merges-fail-and-what-can-be-done-about-it/
https://blog.nilbus.com/take-the-pain-out-of-git-conflict-resolution-use-diff3/
https://blog.git-init.com/the-magic-of-3-way-merge/
https://www.eseth.org/2020/mergetools.html
https://man7.org/linux/man-pages/man1/diff3.1.html
https://www.jpeek.com/articles/linuxmag/2007-06/
https://www.tecmint.com/diff3-command-in-linux/
https://itsfoss.gitlab.io/post/how-to-use-diff3-command-for-file-merging-in-linux/
https://www.gnu.org/software/diffutils/manual/html_mono/diff.html
https://git-scm.com/docs/git-rerere
https://git-scm.com/docs/rerere.html
https://github.com/git/git/blob/master/rerere.c
https://dev.to/louis7/git-rerere-reuse-conflict-resolutions-like-a-pro-1g88
https://dev.to/louis7/git-deep-dive-mastering-rerere-12jm
https://git-scm.com/book/en/v2/Git-Tools-Rerere
https://www.atlassian.com/blog/bitbucket/resolving-conflicts-with-git-rerere
https://www.thisdot.co/blog/mastering-git-rerere-solving-repetitive-merge-conflicts-with-ease
https://gist.github.com/skipcloud/f1033afb4fa5681d69fa63458cc95928
https://github.com/facebook/sapling
https://sapling-scm.com/docs/commands/rebase/
https://sapling-scm.com/docs/introduction/
https://sapling-scm.com/docs/commands/backout/
https://github.com/arxanas/git-branchless/discussions/654
https://graphite.com/guides/an-overview-of-sapling-s-ui
https://news.ycombinator.com/item?id=39226611
https://engineering.fb.com/2022/11/15/open-source/sapling-source-control-scalable/
https://lwn.net/Articles/915104/
https://sapling-scm.com/docs/addons/isl/
https://imagej.net/develop/git/conflicts
https://docs.github.com/articles/resolving-a-merge-conflict-using-the-command-line
https://technology.doximity.com/articles/finding-joy-in-git-conflict-resolution
https://www.delftstack.com/howto/git/git-conflict-markers/
https://graphite.com/guides/how-to-resolve-merge-conflicts-in-git
https://community.atlassian.com/forums/App-Central-articles/Advanced-Git-merge-conflict-resolution-techniques/ba-p/2476971
https://ardalis.com/detect-git-conflict-markers/
https://www.kodeco.com/books/advanced-git/v1.0/chapters/2-merge-conflicts
https://articles.mergify.com/how-to-resolve-a-merge-conflict/
https://docs.gitlab.com/user/project/merge_requests/conflicts/
https://www.susanpotter.net/software/using-three-way-diffing-context-for-merge-conflict-style-in-git/
https://github.com/whiteinge/diffconflicts
https://github.com/dandavison/delta/issues/1276
https://www.npmjs.com/search?q=merge+conflict
https://www.npmjs.com/package/unidiff
https://www.npmjs.com/package/unified-diff
https://www.npmjs.com/package/diff
https://github.com/dotnet/roslyn/issues/23847
```
