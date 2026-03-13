# Editor Merge Integration: Programmatic Launch of Merge Editors from CLI Tools

**Research question:** Can a CLI tool launch VS Code's three-way merge editor programmatically? What API surface exists? Can we pass section-level context?

**Date:** 2026-03-12

---

## Key Discoveries

### 1. `code --merge` Works Standalone (No Git Required)

The `code` CLI has a `--merge` flag, introduced in **VS Code 1.70 (July 2022)**, that opens the three-way merge editor with four file paths. It does **not** require a git repository or git context.

**Syntax:**
```
code --merge <path1> <path2> <base> <result>
code -m <path1> <path2> <base> <result>
```

- `path1`: First modified version (displayed as "input1" / left pane)
- `path2`: Second modified version (displayed as "input2" / right pane)
- `base`: Common ancestor / origin of both versions
- `result`: Output file where the merged result is saved

**For blocking behavior** (critical for CLI tools that need to wait):
```
code --wait --merge <path1> <path2> <base> <result>
```

**Git mergetool configuration maps to:**
```
[mergetool "code"]
  cmd = code --wait --merge $REMOTE $LOCAL $BASE $MERGED
```

Note the parameter ordering: when used as git mergetool, the convention is `$REMOTE $LOCAL $BASE $MERGED`, which maps `$REMOTE` to path1 and `$LOCAL` to path2.

Sources:
- [VS Code 1.70 release notes](https://code.visualstudio.com/updates/v1_70) -- official announcement of `--merge` flag
- [VS Code CLI documentation](https://code.visualstudio.com/docs/editor/command-line) -- `-m --merge <path1> <path2> <base> <result>` syntax
- [Steven's Notebook: VS Code for git mergetool](https://steven.vorefamily.net/2022/08/05/using-vs-code-for-git-mergetool/) -- working config with parameter order `$REMOTE $LOCAL $BASE $MERGED`

### 2. Chezmoi Proves Non-Git CLI Integration Works

chezmoi (a dotfile manager) invokes `code --merge` directly from its own merge workflow, proving this pattern works outside git:

```toml
[merge]
command = "bash"
args = [
    "-c",
    "cp {{ .Target }} {{ .Target }}.base && code --new-window --wait --merge {{ .Destination }} {{ .Target }} {{ .Target }}.base {{ .Source }}",
]
```

Key insight: chezmoi creates a **synthetic base file** (copying Target to Target.base) because VS Code's merge editor requires four distinct file paths. This is exactly the pattern `sherpa sync` would follow.

Source: [chezmoi Discussion #2424: VS Code as Merge and Diff tool](https://github.com/twpayne/chezmoi/discussions/2424)

### 3. Result File Must Pre-Exist

VS Code's merge editor requires the result file to exist on disk before launch. If it doesn't exist, VS Code shows: "The editor could not be opened because the file was not found."

A workaround: pre-create the result file (copy one of the input files to the result path) before invoking `code --merge`.

Sources:
- [Issue #156445: Allow merge to a resulting file that does not exist](https://github.com/microsoft/vscode/issues/156445) -- still open
- [vscode-merge-tool-adapter-cli](https://github.com/zeegin/vscode-merge-tool-adapter-cli) -- uses `xcopy` to pre-create result file

### 4. Exit Code Problem (Critical Limitation)

**`code --wait --merge` does NOT return meaningful exit codes.** It always returns 0, regardless of whether the user completed the merge or abandoned it. This is a known, unfixed issue.

Implications for `sherpa sync`:
- Cannot rely on exit code to determine if the user accepted the merge
- Must use a **file-watching strategy** instead: compare the result file's content/timestamp before and after the editor closes
- Or use a **confirmation prompt** after the editor closes ("Did you complete the merge?")

Source: [Issue #157961: Allow to return an exit code from --wait invocations](https://github.com/microsoft/vscode/issues/157961) -- assigned to backlog, no implementation timeline

### 5. The Internal `_open.mergeEditor` Command

VS Code's merge editor is opened internally via the `_open.mergeEditor` command. The argument structure (from actual source code at `src/vs/workbench/contrib/mergeEditor/browser/commands/commands.ts`):

```typescript
// Command ID: '_open.mergeEditor'
// Arguments:
{
  base: URI | string,           // Base/ancestor file
  input1: {                     // Left pane
    uri: URI | string,
    title?: string,
    detail?: string,
    description?: string
  },
  input2: {                     // Right pane
    uri: URI | string,
    title?: string,
    detail?: string,
    description?: string
  },
  output: URI | string          // Result file
}
```

The `title`, `detail`, and `description` fields appear in the merge editor header. This means a **VS Code extension** could provide rich contextual labels like "Section: ## Conventions (upstream)" and "Section: ## Conventions (local)" -- but this is only accessible from within VS Code, not from the CLI.

Sources:
- [VS Code source: commands.ts](https://github.com/microsoft/vscode/blob/main/src/vs/workbench/contrib/mergeEditor/browser/commands/commands.ts) -- `OpenMergeEditor` class with `_open.mergeEditor` ID
- [VS Code source: mergeEditorInput.ts](https://github.com/microsoft/vscode/blob/main/src/vs/workbench/contrib/mergeEditor/browser/mergeEditorInput.ts) -- `MergeEditorInputData` class: `uri`, `title`, `detail`, `description`
- [Commit 8bdbcf0](https://github.com/microsoft/vscode/commit/8bdbcf0e32b1b6e4b328dd86656279860f24123a) -- example of `_open.mergeEditor` usage from worktree extension

### 6. `code --diff` for Two-Way Comparison

For cases where section-level conflicts don't need three-way merge (e.g., showing what changed upstream):

```
code --wait --diff <file1> <file2>
```

This opens VS Code's side-by-side diff editor. Useful for preview/review flows.

Source: [VS Code CLI docs](https://code.visualstudio.com/docs/editor/command-line)

### 7. Merge Editor Handles Word-Level Granularity

The merge editor already operates at **chunk level**, not file level. It shows individual conflict regions with checkboxes, and supports **word-level merging** where non-intersecting changes on the same line can be individually applied. The result pane is directly editable.

This means: if `sherpa sync` extracts a markdown section into temp files and feeds them to `code --merge`, the merge editor will naturally show only the relevant diffs within that section -- there's no wasted viewport on non-conflicting parts of the file.

Sources:
- [VS Code merge conflicts docs](https://code.visualstudio.com/docs/sourcecontrol/merge-conflicts)
- [VS Code 1.69 release notes](https://code.visualstudio.com/updates/v1_69) -- "word-level merging" feature

### 8. No Extension API for Custom Merge Views

The merge editor is **not exposed as a public extension API**. There is no `vscode.merge()` API call. The `_open.mergeEditor` command is internal (prefixed with `_`). While extensions can call it via `vscode.commands.executeCommand('_open.mergeEditor', args)`, this is undocumented and could break between versions.

The merge editor was explicitly scoped out of non-git usage (issue #194549 closed as "not planned"), though the CLI `--merge` flag works standalone by design.

Sources:
- [Issue #194549: Use merge-editor without git merge conflicts](https://github.com/microsoft/vscode/issues/194549) -- closed as out-of-scope
- [Issue #153963: Merge editor and editor resolver](https://github.com/microsoft/vscode/issues/153963) -- internal architecture discussion
- [VS Code Built-in Commands reference](https://code.visualstudio.com/api/references/commands) -- no merge command listed

### 9. Alternative Editors Support Similar Patterns

**JetBrains (IntelliJ/WebStorm):**
```
webstorm merge <file1> <file2> [<base>] <output>
idea merge <file1> <file2> [<base>] <output>
```
Works standalone. Base is optional (omitting it creates two-way merge). Widely regarded as having the best merge UX.

Source: [JetBrains WebStorm merge docs](https://www.jetbrains.com/help/webstorm/command-line-merge-tool.html)

**Kaleidoscope (macOS):**
```
ksdiff --merge --output final.md --base article.md edit-a.md edit-b.md
```
Standalone, no git needed. `--wait` flag blocks until user closes.

Source: [ksdiff introduction blog post](https://blog.kaleidoscope.app/2022/04/22/ksdiff-introduction/)

**Sublime Merge:**
```
smerge mergetool "$BASE" "$LOCAL" "$REMOTE" -o "$MERGED"
```

Source: [Sublime Merge CLI docs](https://www.sublimemerge.com/docs/command_line)

**macOS FileMerge (opendiff):**
```
opendiff file1 file2 -ancestor ancestorFile -merge mergeFile
```
Does not block by default -- needs wrapper script.

Source: [opendiff man page](https://www.manpagez.com/man/1/opendiff/)

**Neovim (with fugitive):**
```
nvim -f -c "Gdiffsplit!" "$MERGED"
```

Source: [Using Neovim as a merge tool gist](https://gist.github.com/Pamalcath/2895878)

**KDiff3:**
```
kdiff3 base local remote -o output
```
Standalone three-way merge, no git needed.

Source: [KDiff3 homepage](https://kdiff3.sourceforge.net/)

### 10. `git merge-file` as a Standalone Pre-Merge Engine

`git merge-file` performs three-way text merge **without requiring a git repository**:

```
git merge-file [-p] <current> <base> <other>
```

- With `-p`: outputs to stdout instead of modifying current
- Returns 0 on clean merge, positive number = number of conflicts
- Produces standard `<<<<<<<` / `=======` / `>>>>>>>` conflict markers

This could serve as the merge engine for `sherpa sync`, with the editor used only for conflict resolution.

Source: [git merge-file documentation](https://git-scm.com/docs/git-merge-file)

---

## Implications for `sherpa sync` Editor Integration Strategy

### Recommended Architecture

```
sherpa sync
  |
  v
Section-level diff detection (parse markdown by headings)
  |
  v
For each conflicting section:
  1. Extract section content into temp files:
     - /tmp/sherpa-merge-XXXX/base.md    (common ancestor)
     - /tmp/sherpa-merge-XXXX/local.md   (user's version)
     - /tmp/sherpa-merge-XXXX/remote.md  (upstream version)
     - /tmp/sherpa-merge-XXXX/result.md  (pre-populated with local or auto-merged content)
  2. Attempt auto-merge: git merge-file -p local.md base.md remote.md > result.md
  3. If clean (exit 0): accept result, no editor needed
  4. If conflicts (exit > 0): launch editor
  |
  v
Launch merge editor (user-configurable):
  code --wait --merge remote.md local.md base.md result.md
  |
  v
After editor closes:
  - Compare result.md to pre-launch state (can't trust exit code)
  - If changed: accept as resolution
  - If unchanged: prompt user "Merge incomplete. Retry / Skip / Abort?"
  |
  v
Reassemble full file from resolved sections
```

### Configuration Design

```toml
# sherpa.config.ts or .sherpa.toml
[sync.merge]
tool = "vscode"        # or "jetbrains" | "kaleidoscope" | "vimdiff" | "custom"
# Auto-detected from $EDITOR / $VISUAL if not set

[sync.merge.vscode]
cmd = "code --wait --new-window --merge"
# --new-window prevents merge from getting lost in existing VS Code tabs

[sync.merge.jetbrains]
cmd = "webstorm merge"  # or "idea merge"

[sync.merge.custom]
cmd = "my-tool"
args = ["$BASE", "$LOCAL", "$REMOTE", "$MERGED"]
```

### Key Design Decisions

1. **Section extraction to temp files is the right approach.** The merge editor naturally handles chunk-level display, so extracting individual sections means the user sees only the relevant conflict, not the whole file.

2. **Pre-populate result file.** Required by VS Code; also serves as a reasonable default (use auto-merged content from `git merge-file`, or fall back to local version).

3. **File-watching for completion detection.** Cannot trust exit codes from VS Code. Compare result file hash before and after editor closes.

4. **`--new-window` flag recommended.** Without it, merge tabs can get lost in existing VS Code windows, and `--wait` may return immediately if VS Code is already running.

5. **`git merge-file` as the auto-merge engine.** It works without a repo, handles three-way merge, and produces standard conflict markers. Use it before launching the editor to resolve as much as possible automatically.

6. **Extension opportunity (future).** A `sherpa-sync` VS Code extension could use `_open.mergeEditor` with rich `title`/`description` labels like "## Conventions (upstream v2.1)" to provide section-level context in the merge editor header. This is not needed for MVP but is a powerful upgrade path.

---

## Open Questions

1. **Does `--wait` work reliably when VS Code is already open?** The `--wait` flag's behavior when a VS Code instance is already running is known to be inconsistent. Using `--new-window` may help, but needs testing.

2. **How do multi-section conflicts flow?** Should `sherpa sync` open one merge editor per conflicting section (sequential), or concatenate all conflicting sections into one file? The former provides better context labels; the latter reduces editor open/close churn.

3. **What happens with empty base files?** When a section exists only in one version (added upstream, doesn't exist locally), the base file would be empty. JetBrains handles this as a two-way merge. VS Code behavior with an empty base needs testing.

4. **Can we detect the user's preferred editor reliably?** `$EDITOR` and `$VISUAL` may not correspond to their preferred merge tool. A first-run prompt or `sherpa config` command may be needed.

5. **What about VS Code Remote / Codespaces?** The `code` CLI in remote environments may behave differently. The 1C adapter's bug (issue #205660) where four extra files opened in VS Code Server suggests remote environments need special handling.

6. **Should we support a TUI fallback?** For headless/SSH environments, a vimdiff or terminal-based merge fallback would be important. The architecture above supports this through the configurable `tool` setting.

---

## Sources

### Official Documentation
- [VS Code CLI reference](https://code.visualstudio.com/docs/editor/command-line) -- `--merge`, `--diff`, `--wait` flag documentation
- [VS Code 1.70 release notes](https://code.visualstudio.com/updates/v1_70) -- `--merge` flag introduction
- [VS Code 1.69 release notes](https://code.visualstudio.com/updates/v1_69) -- merge editor introduction, word-level merging
- [VS Code merge conflicts documentation](https://code.visualstudio.com/docs/sourcecontrol/merge-conflicts) -- merge editor UX documentation
- [VS Code source control overview](https://code.visualstudio.com/docs/sourcecontrol/overview)
- [VS Code Built-in Commands API](https://code.visualstudio.com/api/references/commands) -- `vscode.diff` command
- [VS Code Custom Editor API](https://code.visualstudio.com/api/extension-guides/custom-editors)
- [VS Code Virtual Documents API](https://code.visualstudio.com/api/extension-guides/virtual-documents) -- `TextDocumentContentProvider`
- [git-mergetool documentation](https://git-scm.com/docs/git-mergetool) -- BASE, LOCAL, REMOTE, MERGED variables
- [git merge-file documentation](https://git-scm.com/docs/git-merge-file) -- standalone three-way merge
- [JetBrains WebStorm merge CLI](https://www.jetbrains.com/help/webstorm/command-line-merge-tool.html)
- [JetBrains IntelliJ merge CLI](https://www.jetbrains.com/help/idea/command-line-merge-tool.html)
- [Sublime Merge CLI documentation](https://www.sublimemerge.com/docs/command_line)
- [chezmoi merge tool documentation](https://www.chezmoi.io/user-guide/tools/merge/)

### VS Code GitHub Issues (Critical)
- [Issue #5770: Use VS Code as merge editor](https://github.com/microsoft/vscode/issues/5770) -- original feature request, COMPLETED July 2022
- [Issue #130900: Add --merge command line option](https://github.com/microsoft/vscode/issues/130900) -- non-git merge tool request
- [Issue #153340: Use 3-way merge editor as git merge tool](https://github.com/microsoft/vscode/issues/153340) -- closed as not planned (consolidated into #5770)
- [Issue #153963: Merge editor and editor resolver](https://github.com/microsoft/vscode/issues/153963) -- internal API architecture
- [Issue #156445: Allow merge to non-existent result file](https://github.com/microsoft/vscode/issues/156445) -- OPEN, result file must pre-exist
- [Issue #157961: Return exit code from --wait](https://github.com/microsoft/vscode/issues/157961) -- OPEN, exit codes don't reflect merge state
- [Issue #194549: Use merge editor without git conflicts](https://github.com/microsoft/vscode/issues/194549) -- closed as out-of-scope
- [Issue #205660: Browser host opens additional files in merge mode](https://github.com/microsoft/vscode/issues/205660) -- fixed, relevant for remote scenarios

### VS Code Source Code
- [commands.ts - OpenMergeEditor](https://github.com/microsoft/vscode/blob/main/src/vs/workbench/contrib/mergeEditor/browser/commands/commands.ts) -- `_open.mergeEditor` command registration and argument validation
- [mergeEditorInput.ts](https://github.com/microsoft/vscode/blob/main/src/vs/workbench/contrib/mergeEditor/browser/mergeEditorInput.ts) -- `MergeEditorInputData` class (uri, title, detail, description)
- [repository.ts (git extension)](https://github.com/microsoft/vscode/blob/main/extensions/git/src/repository.ts) -- how git extension opens merge editor

### Community / Third-Party
- [chezmoi Discussion #2424: VS Code as Merge and Diff tool](https://github.com/twpayne/chezmoi/discussions/2424) -- **proven non-git CLI integration pattern**
- [Steven's Notebook: VS Code for git mergetool](https://steven.vorefamily.net/2022/08/05/using-vs-code-for-git-mergetool/) -- working config with parameter order
- [Igor Kulman: VS Code as git merge tool](https://blog.kulman.sk/using-vscode-as-git-merge-tool/) -- basic merge tool config
- [DEV.to: Setting VS Code as git merge and diff tool](https://dev.to/leandrocrs/setting-visual-studio-code-as-your-git-merge-and-diff-tool-5a9p)
- [vscode-merge-tool-adapter-cli](https://github.com/zeegin/vscode-merge-tool-adapter-cli) -- 1C adapter, shows result file pre-creation requirement
- [VS Code as Git Mergetool extension](https://marketplace.visualstudio.com/items?itemName=zawys.vscode-as-git-mergetool) -- extension for arbitrary file merge
- [zawys/vscode-as-git-mergetool (source)](https://github.com/zawys/vscode-as-git-mergetool)
- [Kaleidoscope ksdiff introduction](https://blog.kaleidoscope.app/2022/04/22/ksdiff-introduction/) -- standalone merge with --base
- [Kaleidoscope CLI docs](https://kaleidoscope.app/help/docs/command-line-tool)
- [opendiff man page](https://www.manpagez.com/man/1/opendiff/)
- [RandomEngy/VSCodeGitDiffAndMergeTool](https://github.com/RandomEngy/VSCodeGitDiffAndMergeTool)
- [David Runger: VS Code as Rails merge tool](https://davidrunger.com/blog/using-vs-code-as-a-rails-app-update-merge-tool) -- another non-git CLI usage

### Merge Tools / Editors
- [KDiff3 homepage](https://kdiff3.sourceforge.net/)
- [KDiff3 merge documentation](https://kdiff3.sourceforge.net/doc/merging.html)
- [Araxis Merge](https://www.araxis.com/merge/index.en)
- [Guiffy SureMerge](https://www.guiffy.com/Merge-Tool.html)
- [SemanticMerge features](https://www.semanticmerge.com/features) -- language-aware structured merge
- [nono/mddiff](https://github.com/nono/mddiff) -- semantic diff for markdown (AST-based, no merge)
- [Graphtage](https://blog.trailofbits.com/2020/08/28/graphtage/) -- semantic diff for tree-structured data
- [diff3 (Wikipedia)](https://en.wikipedia.org/wiki/Diff3)

### Academic / Research
- [Conflict resolution for structured merge via version space algebra (OOPSLA 2018)](https://dl.acm.org/doi/10.1145/3276536)
- [Pre-trained language models for textual merge conflicts (ISSTA 2022)](https://dl.acm.org/doi/abs/10.1145/3533767.3534396)
- [MergeBERT: Neural transformers for merge conflict resolution](https://www.researchgate.net/publication/354310742_MergeBERT_Program_Merge_Conflict_Resolution_via_Neural_Transformers)
- [ProseMirror diff and merge (Third Bit)](https://third-bit.com/2017/11/22/prosemirror-diff-merge/)
- [Martin Fowler: Semantic Conflict](https://martinfowler.com/bliki/SemanticConflict.html)

### Related Discussions
- [Alphr: How to Open the Merge Editor in VS Code](https://www.alphr.com/vs-code-open-merge-editor/)
- [Plain English: 3-Column Merge Editor in VS Code](https://plainenglish.io/blog/finally-released-3-column-merge-editor-in-vs-code-8490ef694b3a)
- [Visual Studio Magazine: Merge Editor Improvements](https://visualstudiomagazine.com/articles/2022/09/01/vs-code-1-71.aspx)
- [Issue #155251: 3 way merge editor only edits 2 ways](https://github.com/microsoft/vscode/issues/155251)
- [Issue #155277: Provide 4-editor view with base](https://github.com/microsoft/vscode/issues/155277)
- [Issue #156608: Toggle old merge view](https://github.com/microsoft/vscode/issues/156608)
- [Issue #157827: File from Explorer doesn't highlight merge conflict](https://github.com/microsoft/vscode/issues/157827)
- [Issue #225319: Merge Editor commands work incorrectly via keyboard](https://github.com/microsoft/vscode/issues/225319)
- [Neovim merge tool gist](https://gist.github.com/Pamalcath/2895878)
- [Vim as mergetool (pydagogue)](https://matthew-brett.github.io/pydagogue/vim_mergetool.html)
- [Vimcasts: Fugitive merge conflicts](http://vimcasts.org/episodes/fugitive-vim-resolving-merge-conflicts-with-vimdiff/)
- [opendiff FileMerge setup gist](https://gist.github.com/bkeating/329690)
- [Slant: Best free 3-way merge tools](https://www.slant.co/topics/286/~best-free-3-way-merge-tools-for-windows)
- [chezmoi merge feature request #224](https://github.com/twpayne/chezmoi/issues/224)
- [chezmoi well-known tool configs #3280](https://github.com/twpayne/chezmoi/discussions/3280)
- [GitHub Desktop issue #21339: Open VSCode like git mergetool](https://github.com/desktop/desktop/issues/21339)
- [Git Tower: Diff & Merge Tools guide](https://www.git-tower.com/learn/git/ebook/en/command-line/tools-services/diff-merge-tools)
- [git-mergetool Linux man page](https://man7.org/linux/man-pages/man1/git-mergetool.1.html)
- [How to use git mergetool (gist)](https://gist.github.com/mer0mingian/c20605cf03a31f73fc081aa59ddc893d)

---

## Raw Links (Every URL Encountered)

```
https://code.visualstudio.com/docs/editor/command-line
https://code.visualstudio.com/updates/v1_70
https://code.visualstudio.com/updates/v1_69
https://code.visualstudio.com/docs/sourcecontrol/merge-conflicts
https://code.visualstudio.com/docs/sourcecontrol/overview
https://code.visualstudio.com/api/references/commands
https://code.visualstudio.com/api/references/vscode-api
https://code.visualstudio.com/api/extension-guides/custom-editors
https://code.visualstudio.com/api/extension-guides/virtual-documents
https://code.visualstudio.com/api/extension-guides/command
https://code.visualstudio.com/docs/getstarted/tips-and-tricks
https://code.visualstudio.com/docs/reference/variables-reference
https://code.visualstudio.com/docs/sourcecontrol/repos-remotes
https://code.visualstudio.com/docs/sourcecontrol/branches-worktrees
https://code.visualstudio.com/Search?q=diff
https://github.com/microsoft/vscode/issues/5770
https://github.com/microsoft/vscode/issues/130900
https://github.com/microsoft/vscode/issues/153340
https://github.com/microsoft/vscode/issues/153963
https://github.com/microsoft/vscode/issues/155251
https://github.com/microsoft/vscode/issues/155277
https://github.com/microsoft/vscode/issues/156445
https://github.com/microsoft/vscode/issues/156608
https://github.com/microsoft/vscode/issues/157361
https://github.com/microsoft/vscode/issues/157813
https://github.com/microsoft/vscode/issues/157827
https://github.com/microsoft/vscode/issues/157961
https://github.com/microsoft/vscode/issues/158763
https://github.com/microsoft/vscode/issues/184567
https://github.com/microsoft/vscode/issues/192580
https://github.com/microsoft/vscode/issues/194549
https://github.com/microsoft/vscode/issues/202550
https://github.com/microsoft/vscode/issues/205660
https://github.com/microsoft/vscode/issues/209536
https://github.com/microsoft/vscode/issues/219611
https://github.com/microsoft/vscode/issues/225319
https://github.com/microsoft/vscode/issues/239256
https://github.com/microsoft/vscode/issues/263584
https://github.com/microsoft/vscode/issues/298054
https://github.com/microsoft/vscode/pull/205663
https://github.com/microsoft/vscode/commit/8bdbcf0e32b1b6e4b328dd86656279860f24123a
https://github.com/microsoft/vscode/blob/main/extensions/git/src/repository.ts
https://github.com/microsoft/vscode/blob/main/src/vs/workbench/contrib/mergeEditor/browser/commands/commands.ts
https://github.com/microsoft/vscode/blob/main/src/vs/workbench/contrib/mergeEditor/browser/mergeEditorInput.ts
https://github.com/microsoft/vscode/labels/merge-editor
https://github.com/Microsoft/vscode/issues/3917
https://github.com/Microsoft/vscode-docs/blob/main/api/extension-guides/command.md
https://github.com/microsoft/vscode-docs-archive/blob/master/api/extension-guides/command.md
https://github.com/microsoft/vscode-extension-samples/blob/main/custom-editor-sample/src/catScratchEditor.ts
https://github.com/microsoft/vscode-extension-samples/blob/main/contentprovider-sample/README.md
https://github.com/microsoft/vscode-extension-samples/issues/666
https://github.com/microsoft/vscode-discussions/discussions/815
https://github.com/Microsoft/vscode/issues/65809
https://github.com/microsoft/vscode/issues/10547
https://github.com/microsoft/vscode/issues/103475
https://github.com/microsoft/vscode/issues/92587
https://github.com/microsoft/vscode/issues/135652
https://github.com/microsoft/vscode/issues/145048
https://github.com/twpayne/chezmoi/discussions/2424
https://github.com/twpayne/chezmoi/issues/224
https://github.com/twpayne/chezmoi/discussions/3280
https://github.com/zawys/vscode-as-git-mergetool
https://github.com/pprice/vscode-better-merge
https://github.com/RandomEngy/VSCodeGitDiffAndMergeTool
https://github.com/zeegin/vscode-merge-tool-adapter-cli
https://github.com/nono/mddiff
https://github.com/tsensei/Semantic-Markdown-Parser
https://github.com/caponetto/vscode-diff-viewer
https://github.com/Takakiriy/codediff
https://github.com/ryu1kn/vscode-partial-diff/issues/2
https://github.com/usernamehw/vscode-commands
https://github.com/sindrets/diffview.nvim
https://github.com/tpope/vim-fugitive/issues/1306
https://github.com/gitkraken/vscode-gitlens/issues/2677
https://github.com/desktop/desktop/issues/21339
https://github.com/desktop/desktop/issues/18193
https://github.com/gitextensions/gitextensions/issues/4364
https://github.com/topics/semantic-diff
https://git-scm.com/docs/git-mergetool
https://git-scm.com/docs/git-merge-file
https://git-scm.com/docs/git-merge
https://git-scm.com/docs/git-difftool
https://git-scm.com/book/mk/v2/Git-Tools-Advanced-Merging
https://www.kernel.org/pub/software/scm/git/docs/git-mergetool.html
https://man.archlinux.org/man/git-mergetool.1.en
https://man7.org/linux/man-pages/man1/git-mergetool.1.html
http://web.mit.edu/git/www/git-mergetool.html
https://www.jetbrains.com/help/idea/command-line-merge-tool.html
https://www.jetbrains.com/help/idea/tutorial-use-idea-as-default-command-line-merge-tool.html
https://www.jetbrains.com/help/idea/settings-tools-diff-and-merge.html
https://www.jetbrains.com/help/idea/running-intellij-idea-as-a-diff-or-merge-command-line-tool.html
https://www.jetbrains.com/help/webstorm/command-line-merge-tool.html
https://www.jetbrains.com/help/webstorm/resolve-conflicts.html
https://www.jetbrains.com/help/webstorm/working-with-the-ide-features-from-command-line.html
https://www.jetbrains.com/help/webstorm/settings-tools-external-diff-tools.html
https://www.jetbrains.com/help/webstorm/settings-tools-diff-and-merge.html
https://www.jetbrains.com/help/rider/Command_Line_Merge_Tool.html
https://www.jetbrains.com/help/phpstorm/command-line-merge-tool.html
https://intellij-support.jetbrains.com/hc/en-us/community/posts/206925975
https://intellij-support.jetbrains.com/hc/en-us/community/posts/207078355
https://intellij-support.jetbrains.com/hc/en-us/community/posts/360000394639
https://intellij-support.jetbrains.com/hc/en-us/community/posts/7049266189458
https://www.sublimemerge.com/docs/command_line
https://www.sublimemerge.com/docs/getting_started
https://www.sublimemerge.com/
https://www.sublimemerge.com/download
https://www.sublimemerge.com/blog/sublime-merge-build-1107
https://kaleidoscope.app/help/docs/command-line-tool
https://kaleidoscope.app/setup-guides/git-command-line-client
https://kaleidoscope.app/help/docs/more-on-git-difftool-and-git-mergetool
https://blog.kaleidoscope.app/2022/04/22/ksdiff-introduction/
https://blog.kaleidoscope.app/2022/04/12/resolving-merge-conflicts-in-vscode-with-kaleidoscope/
https://www.manpagez.com/man/1/opendiff/
https://www.unix.com/man_page/osx/1/opendiff/
https://discussions.apple.com/thread/253945336
https://kdiff3.sourceforge.net/
https://kdiff3.com/
https://kdiff3.sourceforge.net/doc/merging.html
https://www.araxis.com/merge/index.en
https://www.araxis.com/merge/windows/three-way-file-comparison-and-merging.en
https://www.araxis.com/merge/windows/merging-files.en
https://www.araxis.com/merge/documentation-windows/automatic-file-merging.en
https://www.guiffy.com/Merge-Tool.html
https://www.semanticmerge.com/features
https://www.devart.com/codecompare/3-way-merge.html
https://www.gitkraken.com/features/merge-conflict-resolution-tool
https://marketplace.visualstudio.com/items?itemName=zawys.vscode-as-git-mergetool
https://marketplace.visualstudio.com/items?itemName=shaharkazaz.git-merger
https://marketplace.visualstudio.com/items?itemName=moshfeu.diff-merge
https://marketplace.visualstudio.com/items?itemName=kaleidoscope-app.vscode-ksdiff
https://marketplace.visualstudio.com/items?itemName=giovdk21.vscode-sublime-merge
https://marketplace.visualstudio.com/items?itemName=hung-vi.terminal-git-mergetool
https://marketplace.visualstudio.com/items?itemName=aaghabeiki.gitdiffer
https://marketplace.visualstudio.com/items?itemName=danielroedl.meld-diff
https://marketplace.visualstudio.com/items?itemName=wtetsu.tempfile
https://marketplace.visualstudio.com/items?itemName=BateleurIO.vscode-combine-scripts
https://open-vsx.org/extension/vscode/merge-conflict
https://vshaxe.github.io/vscode-extern/vscode/TextDocumentContentProvider.html
https://vshaxe.github.io/vscode-extern/vscode/CustomEditorProvider.html
https://vscode-api.js.org/interfaces/vscode.TextDocumentContentProvider.html
https://vscode-docs.readthedocs.io/en/latest/extensionAPI/vscode-api-commands/
https://dl.acm.org/doi/10.1145/3276536
https://dl.acm.org/doi/abs/10.1145/3533767.3534396
https://www.researchgate.net/publication/328508000
https://www.researchgate.net/publication/354310742
https://feihe.github.io/materials/oopsla18.pdf
https://www.sciencedirect.com/science/article/pii/S0164121224001158
https://martinfowler.com/bliki/SemanticConflict.html
https://third-bit.com/2017/11/22/prosemirror-diff-merge/
https://blog.trailofbits.com/2020/08/28/graphtage/
https://en.wikipedia.org/wiki/Merge_(version_control)
https://en.wikipedia.org/wiki/Diff3
https://medium.com/geekculture/configure-visual-studio-code-as-a-default-git-editor-diff-tool-or-merge-tool-291fd7088cc9
https://medium.com/@rkrahul523/resolving-merge-conflict-through-vs-code-2f6a53ca8a5c
https://medium.com/@lnakhul/mastering-vs-code-extension-api-commands-a-hands-on-guide-de679bd07cc9
https://medium.com/@kaltepeter/tools-to-master-merge-conflicts-6d05b21a8ba8
https://yapjiahong2003.medium.com/solving-merge-conflicts-easily-in-neovim-with-fugitive-cb5f4e205e8f
https://medium.com/prodopsio/solving-git-merge-conflicts-with-vim-c8a8617e3633
https://stymied.medium.com/why-you-should-and-should-not-use-markdown-1b9d70987792
https://benoit.srht.site/2020-10-03-chezmoi-merging/
https://blog.benoitj.ca/2020-10-03-chezmoi-merging/
https://www.chezmoi.io/user-guide/tools/merge/
https://www.chezmoi.io/user-guide/tools/editor/
https://www.chezmoi.io/user-guide/frequently-asked-questions/usage/
https://www.chezmoi.io/user-guide/frequently-asked-questions/troubleshooting/
https://www.chezmoi.io/quick-start/
https://dev.to/adiatiayu/how-to-resolve-merge-conflicts-using-the-merge-editor-feature-on-vs-code-pic
https://dev.to/leandrocrs/setting-visual-studio-code-as-your-git-merge-and-diff-tool-5a9p
https://dev.to/this-is-learning/resolving-merge-conflicts-with-visual-studio-code-1mn1
https://adiati.com/how-to-resolve-merge-conflicts-using-the-merge-editor-feature-on-vs-code
https://leonardomontini.dev/merge-conflict-vscode/
https://monsterlessons-academy.com/posts/resolving-merge-conflicts-in-visual-studio-code-the-easy-way
https://www.alphr.com/vs-code-open-merge-editor/
https://plainenglish.io/blog/finally-released-3-column-merge-editor-in-vs-code-8490ef694b3a
https://visualstudiomagazine.com/articles/2022/09/01/vs-code-1-71.aspx
https://samestuffdifferentday.net/2022/12/01/things-i-learned-13/
https://faun.pub/using-vscode-as-git-mergetool-and-difftool-2e241123abe7
https://thecodefix.com/fix-git-merge-conflict-vs-code/
https://vscode.one/diff-vscode/
https://semanticdiff.com/blog/visual-studio-code-compare-files/
https://nono.ma/code-diff-visual-studio-code
https://justinnoel.dev/2019/09/14/diff-files-on-command-line-and-with-visual-studio-code/
https://gist.github.com/stormwild/65813bfefd88a880d1f31b303e55b1e7
https://gist.github.com/rambabusaravanan/1d1902e599c9c680319678b0f7650898
https://gist.github.com/ffittschen/6d9be1720f30eb8dc0142cc0ed91c7d9
https://gist.github.com/SuryaElite/58ff27c474accd31dbd91545ee0d3620
https://gist.github.com/jonlabelle/8cc3a5cc08f965f2f9ad95e2617fdfb3
https://gist.github.com/mer0mingian/c20605cf03a31f73fc081aa59ddc893d
https://gist.github.com/karenyyng/f19ff75c60f18b4b8149
https://gist.github.com/Pagliacii/8fcb4dc67937305c19df9bb3137e4cad
https://gist.github.com/travisjupp/212775b29d417d5a3ace53db459a6559
https://gist.github.com/bkeating/329690
https://gist.github.com/kylefox/4512777
https://gist.github.com/kristofferh/2895878
https://www.codestudy.net/blog/how-to-use-vs-code-as-merge-and-diff-tool-in-sourcetree/
https://www.grzegorowski.com/using-vim-or-neovim-nvim-as-a-git-mergetool/
https://smittie.de/posts/git-mergetool/
https://geo-jobe.com/git-good-with-visual-studio-code/
https://kleypot.com/git-merge-deep-dive/
https://orendra.com/blog/resolving-git-merge-conflicts-with-vimdiff/
https://thomashunter.name/posts/2013-02-27-set-opendiff-filemerge-as-your-git-diff-tool-on-os-x
https://mybyways.com/blog/where-is-xcodes-filemerge
https://extroverteddeveloper.com/2020/07/30/how-to-make-kaleidoscope-your-default-git-diff-and-merge-tool/
https://nathancahill.github.io/kaleidoscope-the-most-powerful-diff-tool-for-mac-os-x/
https://brettterpstra.com/2023/02/23/kaleidoscope-spot-the-differences-merge-in-seconds-sponsor/
https://www.git-tower.com/blog/kaleidoscope
https://www.git-tower.com/learn/git/ebook/en/command-line/tools-services/diff-merge-tools
https://www.git-tower.com/help/guides/integration/custom-diff-tools/mac
https://endjin.com/blog/2014/08/using-semanticmerge-to-fix-git-merge-conflicts
https://daedtech.com/merging-done-right-semantic-merge/
https://keyholesoftware.com/a-better-approach-to-merging-files-in-git/
https://www.atlassian.com/git/tutorials/using-branches/git-merge
https://community.atlassian.com/forums/Sourcetree-questions/How-to-find-out-which-file-SourceTree-takes-exactly-as-Base/qaq-p/813330
https://jasonrudolph.com/blog/2009/02/25/git-tip-how-to-merge-specific-files-from-another-branch/
https://www.freecodecamp.org/news/the-definitive-guide-to-git-merge/
https://www.geeksforgeeks.org/git/git-merge/
https://graphite.com/guides/how-to-merge-pull-requests-in-vscode
https://beyondcompare.gitbook.io/project/git/untitled
https://news.ycombinator.com/item?id=40862144
https://news.ycombinator.com/item?id=31105227
https://blog.pjsen.eu/?p=221
http://vimcasts.org/episodes/fugitive-vim-resolving-merge-conflicts-with-vimdiff/
https://dzx.fr/blog/introduction-to-vim-fugitive/
https://matthew-brett.github.io/pydagogue/vim_mergetool.html
https://forum.sublimetext.com/t/launch-terminal-command-line-at-repo-path/47786
https://forum.sublimetext.com/t/os-x-command-line-for-sublime-merge/39150
https://forum.sublimetext.com/t/how-to-use-visual-studio-code-as-editor/52764
https://forum.sublimetext.com/t/key-binding-to-open-current-project-in-intellij-vscode/73420
https://forum.sublimetext.com/t/best-setting-for-editor-env-variable/9063
https://shunwaste.com/article/how-to-change-editor-environment-variable
https://editorconfig.org/
https://timheuer.com/blog/resx-editor-for-visual-studio-code/
https://riteshpatel.silvrback.com/content-provider-tutorial-for-vscode
https://linuxcommandlibrary.com/man/chezmoi
https://davidrunger.com/blog/using-vs-code-as-a-rails-app-update-merge-tool
https://ninmonkeys.com/blog/tag/commandline/
https://www.slant.co/topics/286/~best-free-3-way-merge-tools-for-windows
https://pslmodels.github.io/Git-Tutorial/content/txteditor/VScode.html
https://docs.gitlab.com/user/markdown/
https://markdownpreview.org/en/diff
https://www.infoworld.com/article/2263049/visual-studio-code-vs-sublime-text-which-code-editor-should-you-use.html
https://www.freecodecamp.org/news/visual-studio-vs-visual-studio-code/
https://www.linkedin.com/pulse/github-vscode-beginners-guide-code-merge-strict-nikhil-tamhankar
https://configcat.com/docs/integrations/vscode/
https://launchdarkly.com/blog/managing-feature-flags-in-visual-studio-code/
https://docs.launchdarkly.com/integrations/vscode
https://learn.microsoft.com/en-us/visualstudio/version-control/git-resolve-conflicts
https://medium.com/swlh/how-to-set-filemerge-as-your-merge-and-review-tool-for-mercurial-on-macos-da2a7260240b
https://www.geeksforgeeks.org/blogs/ide-vs-code-editor/
```
