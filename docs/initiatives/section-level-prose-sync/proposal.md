---
status: pending
initiative: section-level-prose-sync
created: 2026-03-11
updated: 2026-03-11
type: research-synthesis
risk: additive
targets:
  - packages/studio-core/src/sync/
  - packages/studio-cli/src/commands/sync.ts
dependencies: []
spawned-from: null
---

# Section-Level Prose Sync

## Summary

Define the core algorithm for `sherpa sync`: a three-way merge engine that operates on markdown sections (headings + their content) rather than lines. When an upstream framework updates convention files (CLAUDE.md, rule files, config templates), consumer projects receive the changes without losing their customizations — with conflicts surfaced at section granularity rather than line-level diffs.

## State Snapshot

No sync algorithm exists in the Sherpa codebase yet. The CLAUDE.md mentions `sherpa sync` as one of the Seven Pillars (Convention Sync CLI) and references `sherpa init` and `sherpa sync` commands, but no implementation exists. The research in this iteration establishes that:

- No existing tool does section-level sync for convention/prose files (the gap is real)
- Weave (2026) validates heading-based section merge for git conflicts (100% clean merge rate)
- Copier's three-way sync model (stored baseline + regenerate + diff consumer changes) is the proven architecture
- Section-level diff3 is the correct concurrency model — OT and CRDTs are unanimously overengineered for periodic two-peer CLI sync
- The remark/unified ecosystem provides the markdown parsing foundation, with ~40 LOC needed for section tree construction

## Proposed Changes

### Target: `packages/studio-core/src/sync/`

**Section parser** (`section-tree.ts`):
- Parse markdown via remark-parse + remark-frontmatter
- Build section tree using remark-sectionize's algorithm (depth 6→1, ~40 LOC)
- Extract section IDs: primary from `<!-- section:id -->` HTML comments, fallback to heading slug
- Treat YAML frontmatter as special section `__frontmatter__`
- Preserve source byte offsets per section for formatting-preserving reconstruction

**Section matcher** (`section-matcher.ts`):
- Match sections across three versions (base, upstream, consumer) by stable ID
- Composite identity key: `section-id` or `heading-level:heading-slug:parent-id`
- Detect additions (present in one version, absent in base), deletions, and renames (via body content similarity)

**Three-way merge engine** (`section-merge.ts`):
- For each matched section triple: classify as upstream-only-change, consumer-only-change, both-changed, or unchanged
- Auto-resolve single-side changes (take the changed version)
- For both-changed sections: attempt line-level diff3 within section (via node-diff3), flag as conflict if unresolvable
- Handle structural changes: section additions, deletions, reordering
- Support ownership markers: `<!-- sherpa:managed -->` (always take upstream), `<!-- sherpa:owned -->` (never overwrite consumer)

**File reconstructor** (`reconstruct.ts`):
- Rebuild merged file using source-level splicing from original files (not AST re-serialization) for unchanged sections
- Only re-serialize modified or merged sections
- Preserve consumer's original formatting, whitespace, and style in unmodified sections

### Target: `packages/studio-cli/src/commands/sync.ts`

**Sync command** (`sherpa sync`):
- Read sync manifest from `sherpa.config.ts` (which files to sync, from which upstream)
- Load stored baseline from `.sherpa/sync-state/<file-hash>.md`
- Fetch current upstream version
- Run section-level three-way merge
- Write merged result, update stored baseline
- Report: sections auto-resolved, sections conflicted, sections added/removed

### Target: `.sherpa/sync-state/` (consumer project, gitignored)

- Stores last-synced snapshot of each convention file as the three-way merge baseline
- One file per synced convention file, named by content-addressable hash of the upstream source path
- First sync: no baseline exists → treat upstream as base, consumer file as modified version

## Rationale

**Why section-level, not line-level:** Line-level diff3 produces false conflicts when adjacent sections are independently edited. Section-level merge understands document structure — edits to different sections never conflict, even if adjacent. Weave's benchmarks confirm: 100% clean merges vs git's 48% for structured documents.

**Why three-way merge, not OT/CRDT:** Periodic CLI sync between two known peers (upstream + consumer) is a solved problem via diff3. OT requires a central server and continuous operation streams. CRDTs add 16-32 bytes per character of metadata. Both are architecturally wrong for batch file sync. Copier, nf-core, and Obsidian Sync all validate three-way merge for this use case.

**Why stored baseline, not git merge-base:** `sherpa sync` operates independently of git. Consumer projects may not track convention files in git, or may have rebased/squashed history. An explicit baseline in `.sherpa/sync-state/` guarantees three-way merge always has a correct ancestor, regardless of git history.

**Why remark, not tree-sitter:** tree-sitter-markdown produces flat ASTs requiring post-processing. remark/unified is AST-first, has mature section manipulation utilities (mdast-zone, mdast-util-heading-range), and the JS/TS ecosystem aligns with the rest of Sherpa. Performance is adequate — we're parsing 10-50 files of 30-200 lines each.

## Dependencies

None. This is a foundational algorithm that other pillars build on.

## Review Notes

- **Weave as accelerator:** Before building the section parser from scratch, evaluate whether Weave's `sem-core` Rust library can be called from Node.js (WASM or CLI). If viable, it provides battle-tested section parsing + matching. If not, the algorithm is well-understood and ~200 LOC in TypeScript.
- **Edge case — duplicate headings:** Two `## Examples` sections under the same parent heading break the composite identity key. Mitigation: append ordinal suffix (`examples`, `examples-2`) like github-slugger.
- **Edge case — heading level changes:** Upstream promotes `### Setup` to `## Setup`. The composite key includes level, so this looks like a delete + add. Consider matching by heading text first, then checking for level changes.
- **Conflict UX is deferred.** This proposal covers the merge algorithm. How conflicts are presented to the user (CLI prompt, file markers, Studio UI) is a separate concern for the next iteration.
- **Scope boundary:** This proposal covers markdown sync only. YAML/JSON/TOML config files need their own merge strategy (key-level merge, not section-level). That's a separate initiative.
