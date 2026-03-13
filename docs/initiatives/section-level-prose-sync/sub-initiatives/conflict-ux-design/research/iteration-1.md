# Iteration 1 — 2026-03-12

## Research Vectors

### Vector 1: Copier & Cruft Conflict UX
**Question:** How do template sync tools present conflicts? File-level .rej files, inline markers, or interactive prompts? What do users prefer?
**Full report:** [iteration-1/copier-cruft-conflict-ux.md](iteration-1/copier-cruft-conflict-ux.md)

**Key discoveries:**
- Copier switched default from `.rej` to inline markers in v8.0.0 (June 2023) — zero complaints ([v8.0.0 Discussion](https://github.com/orgs/copier-org/discussions/1174))
- Cruft users actively fight to get inline markers back; one user still runs cruft < 1.4 in 2025 ([cruft#49](https://github.com/cruft/cruft/issues/49))
- Flexlate was built specifically because `.rej` files are bad UX ([Flexlate](https://github.com/nickderobertis/flexlate))
- Copier inline markers had a critical bug (#1833): VS Code/mergetool couldn't see conflicts because git index had identical hashes. Inline markers alone are insufficient — tooling integration requires correct index state ([copier#1833](https://github.com/copier-org/copier/issues/1833))
- Copier deliberately rejected interactive conflict resolution three times (2016, 2021, 2021) — batch-first is intentional design ([copier#8](https://github.com/copier-org/copier/issues/8), [#343](https://github.com/copier-org/copier/issues/343))
- At scale (1000+ repos), Renovate merges inline markers without detection — machine-readable conflict metadata essential ([Renovate#31592](https://github.com/renovatebot/renovate/discussions/31592))
- Deferred conflict resolution validated by Jujutsu/Chris Krycho: detect immediately, resolve later ([Chris Krycho](https://v5.chriskrycho.com/journal/deferred-conflict-resolution-in-jujutsu/))

**Implications:**
- Inline markers are the clear default. Must be git-compatible for tool integration.
- Batch-first approach validated. Interactive resolution is an enhancement, not the baseline.
- Machine-readable metadata needed to prevent silent absorption in CI pipelines.

### Vector 2: VS Code Merge Editor Integration
**Question:** Can a CLI tool launch VS Code's three-way merge editor programmatically? What API surface exists?
**Full report:** [iteration-1/editor-merge-integration.md](iteration-1/editor-merge-integration.md)

**Key discoveries:**
- `code --wait --merge <path1> <path2> <base> <result>` works standalone without git (VS Code 1.70+) ([VS Code 1.70 release](https://code.visualstudio.com/updates/v1_70))
- chezmoi proves non-git CLI integration works — creates synthetic base file, invokes `code --merge` directly ([chezmoi#2424](https://github.com/twpayne/chezmoi/discussions/2424))
- Result file must pre-exist on disk (VS Code bug [#156445](https://github.com/microsoft/vscode/issues/156445))
- Exit codes unreliable — always returns 0 regardless of merge completion ([#157961](https://github.com/microsoft/vscode/issues/157961)). Must use file-watching or post-editor confirmation
- Internal `_open.mergeEditor` command accepts `title`, `detail`, `description` per input — rich contextual labels possible from VS Code extension, not from CLI
- All major editors support the same pattern: JetBrains (`webstorm merge`), Kaleidoscope (`ksdiff --merge`), Sublime Merge (`smerge mergetool`), KDiff3, Neovim
- Section-level context works naturally: extract conflicting section into temp files, merge editor shows only relevant diffs

**Implications:**
- Editor integration is viable for complex conflicts. Configurable `sync.merge.tool` setting supports all editors.
- Section extraction into temp files eliminates viewport waste — natural fit for section-level merge.
- Exit code limitation requires workaround (file content comparison before/after).

### Vector 3: Section-Level Conflict Marker Format
**Question:** What would a richer, section-aware conflict marker format look like?
**Full report:** [iteration-1/conflict-marker-format-design.md](iteration-1/conflict-marker-format-design.md)

**Key discoveries:**
- Weave is the first tool to put entity-level metadata on conflict marker lines: `<<<<<<< ours — function \`process\` (both modified)` ([Weave](https://github.com/Ataraxy-Labs/weave))
- csvdiff3/csvmerge3 puts row identity + per-field conflict detail on marker lines — proves rich structured metadata works ([csvdiff3](https://github.com/sctweedie/csvdiff3))
- VS Code's conflict parser uses `line.text.startsWith('<<<<<<<')` — anything after the 7-char marker is treated as a label. Free CodeLens support for any git-compatible format
- Jujutsu invented conflict numbering ("conflict 1 of 3") and diff-based conflicts (`%%%%%%%` for diffs) — most innovative format in active use ([jj docs](https://docs.jj-vcs.dev/latest/conflicts/))
- git's zdiff3 zealously trims shared lines from conflict region — applicable to section-level markers for reducing noise
- git rerere's conflict-hashing could be adapted for section-level conflict caching

**Implications:**
- Proposed format: git-compatible delimiters + Weave's em-dash metadata separator + semantic labels (`upstream`/`consumer`/`base`) + section title + change classification
- `grep "^<<<<<<< "` produces a conflict table of contents — machine-readable
- diff3-style (include base) overwhelmingly preferred by users

### Vector 4: Interactive CLI Conflict Resolution
**Question:** What frameworks and patterns exist for interactive per-section CLI conflict resolution?
**Full report:** [iteration-1/cli-conflict-resolution-frameworks.md](iteration-1/cli-conflict-resolution-frameworks.md)

**Key discoveries:**
- Ink (React for CLIs) is the dominant framework — Claude Code, Gemini CLI, Wrangler all use it ([Ink](https://github.com/vadimdemedes/ink))
- `git add --patch` is the canonical per-hunk interaction model: y/n/s/e/j/q keybindings. Adapted for sections: a(ccept)/k(eep)/e(dit)/d(efer) ([git docs](https://git-scm.com/book/en/v2/Git-Tools-Interactive-Staging))
- node-diff3 `diff3Merge(a, o, b)` returns alternating ok/conflict blocks — exactly the data structure for section-level conflict detection ([node-diff3](https://github.com/bhousel/node-diff3))
- jsdiff (`diff` package) provides `diffLines()`, `structuredPatch()` for rendering colored diffs within sections ([jsdiff](https://github.com/kpdecker/jsdiff))
- @clack/prompts as simpler fallback for sequential/non-TTY flows ([Clack](https://www.clack.cc/))
- No existing tool does section-level markdown conflict resolution — the combination is novel

**Implications:**
- Ink + node-diff3 + jsdiff is the stack. Modified `git add --patch` is the interaction model.
- Two CLI modes: rich interactive (Ink, default when TTY) and simple sequential (@clack/prompts for `--simple` or piped).
- Deferred sections need persistence (`.sherpa-conflicts.json`) for `sherpa sync --continue`.

### Vector 5: Studio UI for Visual Merge
**Question:** What web components exist for building a section-level merge UI in React/shadcn?
**Full report:** [iteration-1/web-merge-ui-components.md](iteration-1/web-merge-ui-components.md)

**Key discoveries:**
- @codemirror/merge is the clear winner: built-in `acceptChunk()`/`rejectChunk()` APIs, `getChunks()` for progress tracking, `mergeControls` custom renderer for shadcn-styled buttons (July 2025) ([CodeMirror merge](https://github.com/codemirror/merge))
- Monaco Editor DiffEditor is display-only — no accept/reject. VS Code's 3-way merge editor is internal, not exposed via Monaco npm package ([monaco#3268](https://github.com/microsoft/monaco-editor/issues/3268))
- node-diff3 is the only mature JS three-way merge library — returns structured conflict/ok blocks
- GitHub (Oct 2025) added one-click merge conflict resolution with three buttons per conflict ([GitHub changelog](https://github.blog/changelog/2025-10-02-one-click-merge-conflict-resolution-now-in-the-web-interface/))
- GitLab has interactive mode (select ours/theirs per section) and inline editor mode
- Unified merge view likely better than side-by-side for prose (saves horizontal space)

**Implications:**
- Stack: @codemirror/merge (via react-codemirror-merge) + node-diff3 + shadcn ResizablePanelGroup/Tabs/ScrollArea.
- Two-tier architecture: node-diff3 for algorithmic three-way merge, @codemirror/merge for visual presentation and per-chunk interaction.
- `mergeControls` custom renderer enables shadcn visual consistency.

## Synthesis

### The Four-Surface Architecture

Five independent vectors converged on a single architecture: conflict resolution as a **four-surface escalation cascade** built on a **shared algorithm core**.

The surfaces, in escalation order:

| Surface | Technology | When | Effort |
|---------|-----------|------|--------|
| 1. Batch markers | Section-aware git-compatible conflict markers in file | Always (default output) | MVP |
| 2. Interactive CLI | Ink + modified `git add --patch` per-section flow | `sherpa sync --interactive` or default when TTY | MVP+ |
| 3. Editor merge | `code --merge` (configurable: JetBrains, Kaleidoscope, etc.) | `sherpa sync --merge-tool` or per-section `e` in CLI | Phase 2 |
| 4. Studio UI | @codemirror/merge + shadcn + node-diff3 | Studio app, visual merge panel | Phase 2 |

All four consume the same output from `studio-core`'s section-level diff3 engine. The engine classifies each section as: auto-resolved (take upstream or keep consumer), conflicted (both changed), added, or deleted. Surfaces differ only in how they present conflicts and collect resolutions.

### Cross-Cutting Insight: Section Granularity Is the Key Differentiator

Every vector independently confirmed: **no existing tool operates at section level for conflict resolution.** Copier/Cruft work at file level. Git works at line level. Weave works at entity level (functions/classes) but doesn't handle markdown sections for sync. The section-level approach means:

- A 10-section file with 1 conflict shows 9 clean sections + 1 focused conflict
- Conflict markers include section title and change classification
- Interactive CLI presents one section at a time (like `git add --patch` for hunks)
- Editor merge operates on extracted section temp files (no viewport waste)
- Studio UI renders per-section accept/reject buttons

This is fundamentally better UX than anything in the ecosystem.

### Cross-Cutting Insight: Deferred Resolution Is Essential

V1 (Copier's batch-first design), V1 (Jujutsu's deferred conflicts), and V4 (`.sherpa-conflicts.json` for resume) all converge: **convention file conflicts are not blocking work.** Unlike code merge conflicts that prevent compilation, a conflicted CLAUDE.md section doesn't prevent development. The UX must support:

1. Detect conflicts immediately during `sherpa sync`
2. Write markers into the file (machine-parseable)
3. Allow the user to continue working
4. Resume resolution later via `sherpa sync --continue` or Studio UI

### Cross-Cutting Insight: Git-Compatible Format Unlocks Free Tooling

V3 (VS Code's `startsWith('<<<<<<<')` parser), V2 (`code --merge` for three-way editor), and V1 (Copier's inline markers + CodeLens) all prove: **any format starting with standard git delimiters gets free IDE support.** VS Code shows Accept Current / Accept Incoming / Accept Both buttons automatically. Git mergetool integrations work. Pre-commit hooks (`check-merge-conflict`) detect them.

The trick is putting rich section metadata **after** the 7-character delimiter on the same line. VS Code ignores everything after the delimiter characters. Tools like grep can parse it. Humans read it. Zero compatibility cost.

### Cross-Cutting Insight: The Component Stack Converged Independently

V3, V4, and V5 all independently identified `node-diff3` as the three-way merge algorithm. V4 and V5 independently converged on Ink (CLI) and @codemirror/merge (web). This suggests a clean architectural separation:

```
studio-core/src/sync/
  section-tree.ts        — Parse markdown into section tree (from parent initiative)
  section-matcher.ts     — Match sections across versions (from parent initiative)
  section-merge.ts       — Three-way merge engine using node-diff3
  conflict-formatter.ts  — Section-aware conflict marker generation

studio-cli/src/commands/
  sync.ts                — Batch mode (write markers) + interactive mode (Ink)

studio-ui/src/components/
  merge-view/            — @codemirror/merge + shadcn per-section resolution
```

The merge engine in `studio-core` is surface-agnostic. It returns structured merge results (auto-resolved sections, conflicted sections with base/upstream/consumer content). Each surface formats and presents these results differently.

### Proposed Conflict Marker Format

Combining Weave's entity metadata, git-compatible delimiters, Copier's semantic labels, and diff3-style base inclusion:

```markdown
<!-- sherpa:conflict sections=1 unresolved=1 -->

## Installation

[auto-merged content — no conflict]

<<<<<<< upstream — ## Configuration (modified)
timeout: 60s
retries: 3
log-level: warn
||||||| base — ## Configuration
timeout: 30s
log-level: info
======= consumer — ## Configuration (modified)
timeout: 30s
retries: 5
log-level: debug
>>>>>>> end — ## Configuration

## Usage

[auto-merged content — no conflict]
```

Format features:
- **Git-compatible delimiters** → free VS Code CodeLens, pre-commit hooks, grep
- **Em-dash metadata** (Weave pattern) → section title + change classification on each marker line
- **diff3-style base** → users see what changed on each side relative to the original
- **HTML comment header** → machine-readable conflict count, enables CI detection
- **`end` label on closing marker** → section title on every line for grep-based table of contents
- **Surrounding sections preserved** → shows conflict in full document context

### Contradiction Resolved

V1 found Copier deliberately rejected interactive resolution (batch-first). V4 proposes Ink-based interactive CLI (interactive-first). Resolution: **both are correct at different layers.** Copier is right that the *default output* should be batch markers — this works in CI, non-TTY, and pipe contexts. Interactive CLI is an *enhancement* for human-attended sessions. The escalation cascade satisfies both: markers are always written, interaction is optional.

## All Sources

### Template Sync Tools
- [Copier docs: Updating](https://copier.readthedocs.io/en/stable/updating/) — conflict handling, --conflict flag
- [Copier v8.0.0 Discussion](https://github.com/orgs/copier-org/discussions/1174) — inline default switch
- [Copier #1833: Merge conflicts invisible to tools](https://github.com/copier-org/copier/issues/1833) — critical index bug
- [Copier #8: Launch merge tool (2016)](https://github.com/copier-org/copier/issues/8) — rejected interactive resolution
- [Copier #343: Show diff on conflict](https://github.com/copier-org/copier/issues/343) — closed as not planned
- [Copier #2486: copier adopt (2026)](https://github.com/copier-org/copier/issues/2486) — inline markers for adoption
- [Cruft #49: Main pain point](https://github.com/cruft/cruft/issues/49) — .rej file complaints
- [Cruft #206: Annoying .rej files](https://github.com/cruft/cruft/issues/206) — cookiecutter.diff proposal
- [Flexlate](https://github.com/nickderobertis/flexlate) — real git merge conflicts for template sync
- [rejx](https://github.com/MarkusSagen/rejx) — .rej file management tool
- [Blenddata: Cruft vs Copier](https://www.blenddata.nl/en/blogs/cruft-vs-copier-automating-template-updates-at-scale) — at-scale comparison
- [Renovate #31592](https://github.com/renovatebot/renovate/discussions/31592) — silent conflict absorption at 1000+ repos

### Editor Integration
- [VS Code 1.70 release (--merge flag)](https://code.visualstudio.com/updates/v1_70) — merge editor CLI
- [VS Code CLI docs](https://code.visualstudio.com/docs/editor/command-line) — -m flag syntax
- [VS Code #156445: Result file must exist](https://github.com/microsoft/vscode/issues/156445) — pre-creation workaround
- [VS Code #157961: Exit code unreliable](https://github.com/microsoft/vscode/issues/157961) — always returns 0
- [VS Code #194549: Non-git merge editor](https://github.com/microsoft/vscode/issues/194549) — closed as out-of-scope
- [chezmoi #2424: VS Code merge integration](https://github.com/twpayne/chezmoi/discussions/2424) — non-git CLI pattern
- [JetBrains merge docs](https://www.jetbrains.com/help/webstorm/command-line-merge-tool.html) — standalone three-way
- [Kaleidoscope ksdiff](https://blog.kaleidoscope.app/2022/04/22/ksdiff-introduction/) — macOS merge tool
- [Sublime Merge CLI](https://www.sublimemerge.com/docs/command_line) — smerge mergetool
- [git merge-file](https://www.man7.org/linux/man-pages/man1/git-merge-file.1.html) — standalone three-way

### Conflict Marker Formats
- [Weave](https://github.com/Ataraxy-Labs/weave) — entity-level metadata on marker lines
- [csvdiff3](https://github.com/sctweedie/csvdiff3) — structured field-level conflict metadata
- [Jujutsu conflicts](https://docs.jj-vcs.dev/latest/conflicts/) — diff-based format, conflict numbering
- [Chris Krycho: Deferred conflicts](https://v5.chriskrycho.com/journal/deferred-conflict-resolution-in-jujutsu/) — resolve later pattern
- [zdiff3 explanation](https://www.ductile.systems/zdiff3/) — zealous shared line trimming
- [Adam Johnson: zdiff3](https://adamj.eu/tech/2023/12/29/git-conflict-display-zdiff3/) — practical guide
- [git mergetool docs](https://git-scm.com/docs/git-mergetool) — external tool integration
- [gitattributes: conflict-marker-size](https://git-scm.com/docs/gitattributes) — marker length config
- [Darcs conflicts](https://darcs.net/FAQ/Conflicts) — alternative marker format
- [Pijul conflicts](https://pijul.org/manual/conflicts.html) — 32-char markers

### CLI Frameworks
- [Ink](https://github.com/vadimdemedes/ink) — React for CLIs, used by Claude Code/Gemini CLI/Wrangler
- [ink-ui](https://github.com/vadimdemedes/ink-ui) — Higher-level components
- [Pastel](https://github.com/vadimdemedes/pastel) — Next.js-like CLI framework on Ink
- [@clack/prompts](https://www.clack.cc/) — Modern sequential CLI prompts
- [@inquirer/editor](https://www.npmjs.com/package/@inquirer/editor) — $EDITOR integration
- [git add --patch](https://git-scm.com/book/en/v2/Git-Tools-Interactive-Staging) — canonical per-hunk model
- [Perforce p4 resolve](https://help.perforce.com/helix-core/server-apps/cmdref/2025.2/Content/CmdRef/p4_resolve.html) — interactive resolution
- [Nx Migrate UI](https://nx.dev/blog/migrate-ui) — per-migration step UI
- [node-diff3](https://github.com/bhousel/node-diff3) — JS three-way merge
- [jsdiff](https://github.com/kpdecker/jsdiff) — text diff computation
- [listr2](https://github.com/listr2/listr2) — task list orchestration
- [picocolors](https://www.npmjs.com/package/picocolors) — lightweight terminal colors

### Web Merge UI Components
- [@codemirror/merge](https://github.com/codemirror/merge) — acceptChunk/rejectChunk APIs, mergeControls
- [react-codemirror-merge](https://www.npmjs.com/package/react-codemirror-merge) — React wrapper
- [@monaco-editor/react](https://www.npmjs.com/package/@monaco-editor/react) — Monaco DiffEditor (display-only)
- [Monaco #3268: Three-way merge](https://github.com/microsoft/monaco-editor/issues/3268) — not exposed
- [react-diff-viewer-continued](https://github.com/Aeolun/react-diff-viewer-continued) — 478k weekly downloads
- [react-diff-view](https://github.com/otakustay/react-diff-view) — flexible decoration system
- [@git-diff-view/react](https://github.com/MrWangJustToDo/git-diff-view) — GitHub-style with widgets
- [Mergely](https://mergely.com/) — pure-JS diff/merge
- [react-monaco-json-merge](https://libraries.io/npm/react-monaco-json-merge) — 3-way JSON merge

### Platform Merge UX Patterns
- [GitHub one-click resolution (Oct 2025)](https://github.blog/changelog/2025-10-02-one-click-merge-conflict-resolution-now-in-the-web-interface/) — web conflict resolution
- [GitLab merge conflict resolution](https://about.gitlab.com/blog/resolving-merge-conflicts-from-the-gitlab-ui/) — interactive + inline modes
- [VS Code merge editor UX (#146091)](https://github.com/microsoft/vscode/issues/146091) — design exploration
- [Figma branching](https://help.figma.com/hc/en-us/articles/360063144053-Guide-to-branching) — per-element resolution
- [XWiki merge conflict UI](https://design.xwiki.org/xwiki/bin/view/Design/MergeConflictResolutionUI) — web merge design spec
- [ShowDiffs markdown diff](https://showdiffs.com/markdown-diff/) — structure-aware markdown comparison

## Proposals Generated

1. `proposal.md` — Conflict UX Design for Section-Level Sync (written this iteration)

## Open Questions for Next Iteration

1. **Conflict persistence and resume** — What exactly goes in `.sherpa-conflicts.json`? How does `sherpa sync --continue` know which sections were deferred vs. resolved? How does this interact with the stored baseline in `.sherpa/sync-state/`?

2. **CI/automation mode** — When `sherpa sync` runs non-interactively (CI, pre-commit, automated PR), should it fail on conflicts? Write markers and exit non-zero? Generate a machine-readable report? How to prevent the Renovate-style silent absorption?

3. **Section ownership interaction with conflict UX** — `<!-- sherpa:managed -->` (always upstream) and `<!-- sherpa:owned -->` (never overwrite) eliminate conflicts for marked sections. How does the UX communicate this? Does the CLI show "auto-resolved by ownership policy" for managed sections?

4. **Ink component architecture** — Concrete component design for the interactive CLI: `<SectionDiff>`, `<ConflictResolver>`, `<MergeProgress>`. How to handle scrolling for large sections? How to integrate `$EDITOR` escape hatch (Ink suspends, opens editor, resumes)?

5. **Studio merge view integration** — How does the Studio merge panel connect to the sync engine? Real-time via MCP, or file-based? Does Studio read `.sherpa-conflicts.json` and present the same data visually?
