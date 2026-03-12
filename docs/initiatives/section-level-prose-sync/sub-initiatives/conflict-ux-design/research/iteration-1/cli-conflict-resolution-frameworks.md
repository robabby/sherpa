# CLI Conflict Resolution Frameworks & Interaction Patterns

**Research iteration:** 1
**Date:** 2026-03-12
**Focus:** What frameworks and patterns exist for interactive CLI conflict resolution at section-level granularity?

---

## Key Discoveries

### 1. Ink (React for CLIs) is the dominant framework for rich interactive terminal UIs

- Ink renders React components to the terminal using Yoga (Flexbox layout engine). It provides `<Box>`, `<Text>`, `<Static>`, `<Transform>` primitives, plus hooks like `useInput`, `useFocus`, `useFocusManager` for keyboard interaction. ([GitHub](https://github.com/vadimdemedes/ink))
- **ink-ui** adds higher-level components: `Select`, `MultiSelect`, `ConfirmInput`, `TextInput`, `PasswordInput`, `Spinner`, `ProgressBar`, `Alert`, `StatusMessage`, `Badge`. ([GitHub](https://github.com/vadimdemedes/ink-ui))
- **ink-select-input** provides scrollable list selection with arrow key / j/k navigation and number-key shortcuts. 976 dependents on npm. ([npm](https://www.npmjs.com/package/ink-select-input))
- **Pastel** wraps Ink with a Next.js-like file-based routing model for multi-command CLIs. Uses Zod for argument parsing and Commander under the hood. ([GitHub](https://github.com/vadimdemedes/pastel))
- **Claude Code itself is built with Ink** and implements exactly the pattern we need: colored inline diffs for file changes with per-change accept/reject keyboard controls. ([SitePoint](https://www.sitepoint.com/claude-code-cli-agent-review/), [Medium](https://kotrotsos.medium.com/claude-code-internals-part-11-terminal-ui-542fe17db016))
- Notable Ink users: Claude Code (Anthropic), Gemini CLI (Google), GitHub Copilot CLI, Cloudflare Wrangler, Prisma, Gatsby, Shopify CLI, Linear, Terraform CDK. ([GitHub](https://github.com/vadimdemedes/ink))
- Fullscreen apps use alternate screen buffer pattern. Scrollable content requires manual virtual scrolling (slicing arrays, tracking `selectedIndex` + `scrollOffset`). ([Blog](https://combray.prose.sh/2025-11-28-ink-tui-expandable-layout))

### 2. @clack/prompts is the best lightweight alternative for sequential prompt flows

- Provides: `text`, `password`, `confirm`, `select`, `multiselect`, `autocomplete`, `autocompleteMultiselect`, `path`, `groupMultiselect`, `group`, `tasks`. ([Docs](https://bomb.sh/docs/clack/packages/prompts/))
- `group()` chains prompts sequentially, passing prior results to subsequent prompts. Supports `onCancel` for cancellation handling. ([GitHub](https://github.com/bombshell-dev/clack/blob/main/packages/prompts/README.md))
- Utility functions: `intro()`, `outro()`, `spinner()`, `log.info()`, `log.warn()`, `log.error()`, `log.success()`, `log.step()`, `note()`, `box()`. ([Docs](https://bomb.sh/docs/clack/packages/prompts/))
- All prompts accept `signal` option for AbortController-based programmatic cancellation. ([Docs](https://bomb.sh/docs/clack/packages/prompts/))
- Lower-level `@clack/core` allows custom rendering for prompts beyond the built-in types. ([clack.cc](https://www.clack.cc/))
- **Limitation for our use case:** Clack is designed for sequential question-answer flows, not for rendering rich interactive content (diffs) with per-item keyboard actions.

### 3. Inquirer.js and Enquirer are established but less suited

- **@inquirer/prompts** (modern rewrite, modular packages): includes `@inquirer/editor` which opens the user's `$EDITOR` for multiline text input — relevant for the "edit manually" option in our flow. ([npm](https://www.npmjs.com/package/@inquirer/editor))
- **Enquirer** provides lightweight, fast prompts with custom styles. Used by eslint, webpack, yarn, Cypress, Google Lighthouse. ([GitHub](https://github.com/enquirer/enquirer))
- Both lack the rich rendering capability needed for inline diff display. They're prompt libraries, not terminal UI frameworks.

### 4. `git add --patch` is the canonical per-hunk interaction model

- Presents each hunk with context lines, then offers single-key commands: `y` (stage), `n` (skip), `q` (quit), `a` (stage all remaining in file), `d` (skip all remaining in file), `s` (split hunk), `e` (manually edit hunk), `j`/`k` (navigate undecided hunks), `/` (search hunks by regex), `?` (help). ([Git docs](https://git-scm.com/book/en/v2/Git-Tools-Interactive-Staging), [DEV](https://dev.to/krnsk0/a-thorough-introduction-to-git-s-interactive-patch-mode-4bl6))
- The `e` (edit) option opens the hunk in `$EDITOR` for manual modification — directly analogous to our "edit manually" option. ([DEV](https://dev.to/krnsk0/a-thorough-introduction-to-git-s-interactive-patch-mode-4bl6))
- The `j`/`k` navigation for undecided hunks is analogous to our "defer" option — users can skip and come back. ([DEV](https://dev.to/krnsk0/a-thorough-introduction-to-git-s-interactive-patch-mode-4bl6))
- **idiff** wraps `git add -p` with a richer interactive interface. ([GitHub](https://github.com/nitsanavni/idiff))

### 5. Perforce's `p4 resolve` provides the most complete per-file interactive resolution model

- Interactive options: Accept(a), Edit(e), Diff(d), Merge(m), Skip(s), Help(?). ([Perforce docs](https://help.perforce.com/helix-core/server-apps/cmdref/2025.2/Content/CmdRef/p4_resolve.html))
- Accept variants: accept theirs (`-at`), accept yours (`-ay`), accept merge (`-am`), accept safe merge (`-as`). ([Perforce docs](https://help.perforce.com/helix-core/server-apps/cmdref/2025.2/Content/CmdRef/p4_resolve.html))
- Skip leaves the file marked unresolved — user can return later. This is exactly our "defer" semantics. ([Perforce docs](https://help.perforce.com/helix-core/server-apps/cmdref/2025.2/Content/CmdRef/p4_resolve.html))
- Three-way merge with conflict markers when auto-merge fails. ([Perforce docs](https://legacy-docs.perforce.com/doc.051/manuals/p4guide/05_conflicts.html))

### 6. Nx Migrate UI implements the closest existing pattern to what we need

- Per-migration step: shows description, file change listings with diff viewers, Accept/Undo buttons. ([Nx blog](https://nx.dev/blog/migrate-ui))
- Pauses on errors for inspection, then user can fix or skip. ([Nx blog](https://nx.dev/blog/migrate-ui))
- CLI version supports `--interactive` flag for selective migration acceptance. ([Nx docs](https://nx.dev/docs/guides/tips-n-tricks/advanced-update))
- Finalization offers squash-commit or individual-commit options. ([Nx blog](https://nx.dev/blog/migrate-ui))

### 7. Copier and Cruft handle template update conflicts but without interactive per-section resolution

- **Copier** uses 3-way merge (old template + user changes + new template). Conflicts produce either `.rej` files (`--conflict rej`) or inline git-style conflict markers (`--conflict inline`, default since v8). No interactive resolution — user must resolve manually. ([Docs](https://copier.readthedocs.io/en/stable/updating/))
- **Cruft** (Cookiecutter updater) creates `cruft/update` and `cruft/reject` branches for conflicts. Has `--interactive` option to skip individual updates. Uses git's standard merge conflict handling. ([GitHub](https://github.com/cruft/cruft), [Docs](https://cruft.github.io/cruft/))

### 8. node-diff3 is the key library for three-way merge at custom granularity

- Provides `diff3Merge(a, o, b)` that returns alternating `ok` and `conflict` blocks — exactly the data structure needed for per-section conflict detection. ([GitHub](https://github.com/bhousel/node-diff3))
- `merge()` generates standard conflict markers; `mergeDiff3()` includes original content. ([GitHub](https://github.com/bhousel/node-diff3))
- Custom `stringSeparator` option accepts string or regex — could be set to split on markdown headings for section-level diffing. ([GitHub](https://github.com/bhousel/node-diff3))
- Actively maintained: v3.2.0 (October 2025), ESM + CJS. ([GitHub](https://github.com/bhousel/node-diff3))

### 9. jsdiff (npm `diff` package) provides the diff computation layer

- `diffLines()` returns change objects with `added`, `removed`, `value` properties. ([npm](https://www.npmjs.com/package/diff))
- `structuredPatch()` returns hunk objects with `oldStart`, `oldLines`, `newStart`, `newLines`, `lines` — structured data ideal for rendering. ([GitHub](https://github.com/kpdecker/jsdiff))
- `applyPatch()` applies unified diffs with optional `fuzzFactor` for fuzzy matching. ([npm](https://www.npmjs.com/package/diff))
- v8+ ships with TypeScript definitions built in. ([npm](https://www.npmjs.com/package/diff))

### 10. Terminal diff rendering is a solved problem

- **delta** (Rust): syntax-highlighting diff pager with Levenshtein-based within-line edit detection. Can emulate diff-so-fancy. ([GitHub](https://github.com/dandavison/delta))
- **diff2html**: renders unified diffs as HTML, line-by-line or side-by-side. Has CLI (`diff2html-cli`). ([Site](https://diff2html.xyz/), [GitHub](https://github.com/rtfpessoa/diff2html))
- **marked-terminal**: renders markdown in terminal with syntax highlighting via cli-highlight. ([GitHub](https://github.com/mikaelbr/marked-terminal))
- **chalk** / **picocolors** / **yoctocolors**: terminal string coloring. Picocolors is 14x smaller and 2x faster than chalk. ([npm](https://www.npmjs.com/package/picocolors))
- For Ink specifically: `<Text color="green">` and `<Text color="red">` render colored diff lines natively. Ink uses chalk under the hood. ([GitHub](https://github.com/vadimdemedes/ink))

### 11. Scaffolding tools (Plop, Yeoman, Hygen) use Inquirer for prompts but don't handle conflicts

- **Plop**: micro-generator using Inquirer.js prompts + Handlebars templates. Actions: add files, modify files, append content. No conflict detection. ([Site](https://plopjs.com/))
- **Yeoman**: full-project scaffolder, also uses Inquirer.js. ([Site](https://yeoman.io/))
- **Hygen**: EJS templates with front-matter config. Has interactive prompts via `prompt.js`. No conflict handling. ([GitHub](https://github.com/jondot/hygen))
- **Commitizen**: interactive commit message prompts via adapter pattern (`cz-conventional-changelog`). Sequential prompt flow only. ([GitHub](https://github.com/commitizen/cz-cli))
- **Changelogen**: generates changelogs from conventional commits. Avoids conflicts by automation, not by interactive resolution. ([GitHub](https://github.com/unjs/changelogen))

### 12. listr2 is useful for task orchestration around the conflict flow

- Task list library with progress indicators, nested tasks, concurrent/sequential execution. ([GitHub](https://github.com/listr2/listr2))
- Multiple renderers (default, verbose, silent, simple). Could wrap the overall sync operation (fetch upstream, compute diffs, resolve conflicts, write files). ([npm](https://www.npmjs.com/package/listr2))

---

## Concrete Recommendation

### Framework: Ink + jsdiff + node-diff3

**Rendering layer: Ink** (React for CLIs)
- Claude Code, Gemini CLI, and Wrangler prove Ink works for exactly this class of problem: rich interactive terminal UIs with diff display and per-item keyboard actions.
- Component model makes it natural to build a `<SectionDiff>` component that renders colored diff for one section and a `<ConflictResolver>` that manages the list of conflicted sections.
- `useInput` hook handles single-key actions (a/k/e/d for accept/keep/edit/defer).
- `useFocus` manages which section is currently active.
- Fullscreen mode with scrollable content area and fixed footer showing progress/keybindings.

**Diff computation: jsdiff (`diff` npm package)**
- `diffLines()` for computing per-section diffs.
- `structuredPatch()` for structured hunk data.
- Mature, typed, widely used.

**Three-way merge: node-diff3**
- `diff3Merge()` with custom separator for section-level tokens.
- Returns `ok`/`conflict` blocks that map directly to our "auto-merged" vs "needs resolution" sections.

**Color: picocolors** (or Ink's built-in chalk support)
- Lighter than chalk, sufficient for diff coloring.

### Interaction Pattern: Modified git-add-patch

Model the UX on `git add --patch` but adapted for section-level markdown:

```
Section: "## Installation" (upstream changed, local unchanged)
  Auto-accepted (no conflict)

Section: "## Configuration" (CONFLICT: both changed)
  ────────────────────────────────
  - timeout: 30s                    (yours)
  + timeout: 60s                    (upstream)
  + retries: 3                      (upstream, new)
  ────────────────────────────────
  [a]ccept upstream  [k]eep mine  [e]dit  [d]efer  [?]help
```

Key mappings:
- `a` — Accept upstream version of this section
- `k` — Keep local version of this section
- `e` — Open section in `$EDITOR` for manual merge (like `git add -p` 's `e`)
- `d` — Defer (skip, come back later — like `git add -p`'s `j`)
- `A` — Accept all remaining (like `git add -p`'s `a`)
- `K` — Keep all remaining (like `git add -p`'s `d`)
- `q` — Quit (write deferred sections as conflict markers)
- `?` — Show help

### Fallback: @clack/prompts for simpler mode

For users who prefer a simpler sequential flow (or for non-TTY environments), provide a `--no-interactive` flag that uses Clack's `select()` per section:

```
? Section "## Configuration" has conflicts:
  > Accept upstream
    Keep mine
    Edit manually
    Defer
```

---

## Implications for sherpa sync

1. **Two modes:** Rich interactive (Ink, default when TTY) and sequential prompts (Clack, for `--simple` or piped contexts).
2. **Section tokenization is the novel piece.** No existing tool does section-level markdown diffing. We need to split markdown by headings, diff at that granularity using node-diff3, then present each conflicted section.
3. **The `$EDITOR` escape hatch is essential.** Both `git add -p` and `@inquirer/editor` prove that "open in editor" is the expected fallback for complex conflicts.
4. **Deferred sections need persistence.** When users quit with deferred sections, write a `.sherpa-conflicts.json` manifest so `sherpa sync --continue` can resume.
5. **Auto-merge non-conflicting sections silently.** Only prompt for actual conflicts. Show a summary of auto-merged sections (like git's "Auto-merging file.md").
6. **Progress indicator matters.** "Section 3/7 conflicts resolved" in a fixed footer helps users track progress.
7. **Ink is already a dependency** if sherpa-cli uses it for other commands. This amortizes the bundle cost.

---

## Open Questions

1. **Section boundary detection:** How do we tokenize markdown into sections? By `##` headings? By any heading level? What about content before the first heading (preamble)?
2. **Within-section granularity:** Should we show word-level diffs within a section (using `diffWords()`), or just show the full old/new section side by side?
3. **node-diff3 custom separator:** Can we pass a regex like `/^##\s/m` as `stringSeparator` to get section-level tokens directly from diff3Merge? Need to verify.
4. **Editor integration:** When opening `$EDITOR` for a conflicted section, should we show just the section or the full file with the section highlighted?
5. **Non-TTY mode:** What should `sherpa sync` do when running in CI? Auto-accept? Fail? Write conflict markers?
6. **Bundle size:** Ink pulls in React. Is that acceptable for a CLI tool? Claude Code and Wrangler say yes, but worth measuring.
7. **Ink version compatibility:** The README references an "upcoming version." Need to verify which Ink version is stable and what breaking changes exist.
8. **Copier's 3-way approach:** Should we study Copier's implementation more closely? It solves a very similar problem (template sync with user modifications) but without interactive resolution.

---

## Sources

### Primary frameworks
- [Ink (React for CLIs)](https://github.com/vadimdemedes/ink) — React renderer for terminal apps, Flexbox layout, hooks for input/focus
- [ink-ui](https://github.com/vadimdemedes/ink-ui) — Higher-level Ink components: Select, MultiSelect, TextInput, ConfirmInput, Spinner, etc.
- [ink-select-input](https://github.com/vadimdemedes/ink-select-input) — Scrollable select list component for Ink
- [Pastel](https://github.com/vadimdemedes/pastel) — Next.js-like framework for multi-command CLIs built on Ink
- [@clack/prompts](https://www.npmjs.com/package/@clack/prompts) — Modern CLI prompts library with group(), intro/outro, spinner
- [Clack docs](https://bomb.sh/docs/clack/packages/prompts/) — Full API documentation for @clack/prompts
- [Clack site](https://www.clack.cc/) — Official Clack website with examples
- [@inquirer/prompts](https://www.npmjs.com/package/@inquirer/prompts) — Modern modular Inquirer.js rewrite
- [@inquirer/editor](https://www.npmjs.com/package/@inquirer/editor) — Opens $EDITOR for multiline input
- [Inquirer.js](https://github.com/SBoudrias/Inquirer.js) — Collection of interactive CLI prompt types
- [Enquirer](https://github.com/enquirer/enquirer) — Lightweight prompts used by eslint, webpack, yarn

### Diff and merge libraries
- [node-diff3](https://github.com/bhousel/node-diff3) — JavaScript three-way merge with custom separators, ok/conflict block output
- [jsdiff (diff)](https://www.npmjs.com/package/diff) — Text differencing: diffLines, diffWords, structuredPatch, applyPatch
- [jsdiff GitHub](https://github.com/kpdecker/jsdiff) — Source repo with full API docs
- [diff2html](https://diff2html.xyz/) — Pretty diff rendering (HTML), line-by-line and side-by-side
- [diff2html-cli](https://github.com/rtfpessoa/diff2html-cli) — CLI for diff2html
- [delta](https://github.com/dandavison/delta) — Syntax-highlighting diff pager (Rust), Levenshtein edit detection

### Terminal styling
- [chalk](https://github.com/chalk/chalk) — Terminal string styling, widely used (86K dependents)
- [picocolors](https://github.com/alexeyraspopov/picocolors) — 14x smaller, 2x faster than chalk
- [yoctocolors](https://www.npmjs.com/package/yoctocolors) — Smallest color lib, by chalk creator
- [marked-terminal](https://github.com/mikaelbr/marked-terminal) — Render markdown in terminal with syntax highlighting

### Interaction pattern models
- [git add --patch docs](https://git-scm.com/book/en/v2/Git-Tools-Interactive-Staging) — Official git interactive staging docs
- [Thorough intro to git add -p](https://dev.to/krnsk0/a-thorough-introduction-to-git-s-interactive-patch-mode-4bl6) — Complete walkthrough of per-hunk UX
- [git add --patch and --interactive](https://nuclearsquid.com/writings/git-add/) — Additional explanation with examples
- [Manually editing git hunks](https://rietta.com/blog/git-patch-manual-split/) — How the edit option works
- [idiff](https://github.com/nitsanavni/idiff) — Interactive CLI diff tool wrapping git add -p
- [p4 resolve docs](https://help.perforce.com/helix-core/server-apps/cmdref/2025.2/Content/CmdRef/p4_resolve.html) — Perforce interactive merge with accept/edit/skip
- [Perforce conflict basics](https://legacy-docs.perforce.com/doc.051/manuals/p4guide/05_conflicts.html) — Three-way merge concepts

### Template sync tools (conflict handling)
- [Copier updating docs](https://copier.readthedocs.io/en/stable/updating/) — 3-way merge, --conflict rej/inline
- [Copier configuring](https://copier.readthedocs.io/en/stable/configuring/) — Template configuration reference
- [Copier update DeepWiki](https://deepwiki.com/copier-org/copier/3.4-updating-projects) — Deep dive on update mechanism
- [Cruft](https://github.com/cruft/cruft) — Cookiecutter template updater with git merge-based conflicts
- [Cruft docs](https://cruft.github.io/cruft/) — Official documentation

### Migration tools with interactive UX
- [Nx Migrate UI blog](https://nx.dev/blog/migrate-ui) — Per-migration Accept/Undo with diff viewers
- [Nx advanced update](https://nx.dev/docs/guides/tips-n-tricks/advanced-update) — --interactive flag for selective migration
- [Nx Console Migrate UI](https://nx.dev/docs/guides/nx-console/console-migrate-ui) — Visual migration interface

### Scaffolding tools
- [Plop](https://plopjs.com/) — Micro-generator framework using Inquirer.js + Handlebars
- [Commitizen](https://github.com/commitizen/cz-cli) — Interactive commit message prompting
- [Changelogen](https://github.com/unjs/changelogen) — Changelog generation from conventional commits
- [Hygen](https://github.com/jondot/hygen) — Fast code generator with interactive prompts

### Task orchestration
- [listr2](https://github.com/listr2/listr2) — Terminal task list with progress, nested tasks, multiple renderers

### Claude Code (reference implementation of Ink + diff approval)
- [Claude Code overview](https://code.claude.com/docs/en/overview) — Official docs
- [Claude Code CLI review](https://www.sitepoint.com/claude-code-cli-agent-review/) — Describes Ink-based diff approval UX
- [Claude Code Terminal UI internals](https://kotrotsos.medium.com/claude-code-internals-part-11-terminal-ui-542fe17db016) — Architecture of Ink-based terminal UI
- [HN: Claude Code is a React app in terminal](https://news.ycombinator.com/item?id=46902411) — Discussion of React/Ink architecture choice

### Ink tutorials and patterns
- [Ink TUI expandable layouts](https://combray.prose.sh/2025-11-28-ink-tui-expandable-layout) — Fullscreen, scrollable content, fixed footer pattern
- [Building CLIs with Ink and Pastel](https://medium.com/trabe/building-cli-tools-with-react-using-ink-and-pastel-2e5b0d3e2793) — Practical tutorial
- [Using Ink UI to build interactive CLIs](https://blog.logrocket.com/using-ink-ui-react-build-interactive-custom-clis/) — LogRocket tutorial
- [Ink v3 advanced guide](https://developerlife.com/2021/11/05/ink-v3-advanced/) — Advanced patterns
- [Ink v3 component reference](https://developerlife.com/2021/11/25/ink-v3-advanced-ui-components/) — Component handbook
- [React + Ink CLI tutorial](https://www.freecodecamp.org/news/react-js-ink-cli-tutorial/) — FreeCodeCamp tutorial

### Comparison resources
- [npm-compare: inquirer vs enquirer vs prompts](https://npm-compare.com/enquirer,inquirer,prompt-sync) — Feature and download comparison
- [npm-compare: plop vs yeoman vs hygen](https://npm-compare.com/hygen,plop,yeoman-generator) — Scaffolding tool comparison
- [npm-compare: commander vs yargs vs inquirer vs prompts](https://npm-compare.com/commander,enquirer,inquirer,prompts,vorpal,yargs) — CLI framework comparison
- [Node.js terminal color library comparison](https://dev.to/webdiscus/comparison-of-nodejs-libraries-to-colorize-text-in-terminal-4j3a) — Benchmarks for chalk alternatives

---

## Raw Links

Every URL encountered during research, including tangentially relevant ones:

```
https://github.com/vadimdemedes/ink
https://github.com/vadimdemedes/ink-ui
https://www.npmjs.com/package/ink-select-input
https://github.com/vadimdemedes/ink-select-input
https://github.com/vadimdemedes/pastel
https://www.npmjs.com/package/pastel
https://www.clack.cc/
https://www.npmjs.com/package/@clack/prompts
https://bomb.sh/docs/clack/packages/prompts/
https://github.com/bombshell-dev/clack/blob/main/packages/prompts/README.md
https://github.com/bombshell-dev/clack/blob/main/packages/prompts/CHANGELOG.md
https://npmx.dev/package/@clack/prompts
https://www.npmjs.com/package/@inquirer/prompts
https://www.npmjs.com/package/@inquirer/editor
https://www.npmjs.com/package/@inquirer/input
https://github.com/SBoudrias/Inquirer.js
https://www.npmjs.com/package/inquirer
https://github.com/enquirer/enquirer
https://github.com/bhousel/node-diff3
https://www.npmjs.com/package/diff
https://github.com/kpdecker/jsdiff
https://diff2html.xyz/
https://github.com/rtfpessoa/diff2html
https://github.com/rtfpessoa/diff2html-cli
https://www.npmjs.com/package/diff2html
https://www.npmjs.com/package/diff2html-cli
https://github.com/dandavison/delta
https://dandavison.github.io/delta/diff-highlight-and-diff-so-fancy-emulation.html
https://github.com/chalk/chalk
https://www.npmjs.com/package/chalk
https://github.com/alexeyraspopov/picocolors
https://www.npmjs.com/package/picocolors
https://www.npmjs.com/package/yoctocolors
https://github.com/webdiscus/ansis
https://github.com/mikaelbr/marked-terminal
https://www.npmjs.com/package/marked-terminal
https://www.npmjs.com/package/markdown-it-terminal
https://git-scm.com/book/en/v2/Git-Tools-Interactive-Staging
https://git-scm.com/docs/git-add/2.16.6
https://dev.to/krnsk0/a-thorough-introduction-to-git-s-interactive-patch-mode-4bl6
https://nuclearsquid.com/writings/git-add/
https://rietta.com/blog/git-patch-manual-split/
https://dev.to/etcwilde/git-and-the-interactive-patch-add
https://codingnomads.com/git-staging-git-add-interactive-git-add-patch
https://subtlepseudonym.medium.com/editing-git-hunks-for-fun-and-profit-a0faa5e0d950
https://medium.com/transmute-techtalk/improve-your-commit-hygiene-with-git-add-patch-3b7dd9c117c4
https://github.com/nitsanavni/idiff
https://github.com/sindrets/diffview.nvim
https://github.com/magit/magit/discussions/4529
https://help.perforce.com/helix-core/server-apps/cmdref/2025.2/Content/CmdRef/p4_resolve.html
https://ftp.perforce.com/perforce/r16.2/doc/manuals/cmdref/p4_resolve.html
https://legacy-docs.perforce.com/doc.051/manuals/p4guide/05_conflicts.html
https://legacy-docs.perforce.com/doc.982/cmdref/resolve.html
https://copier.readthedocs.io/en/stable/updating/
https://copier.readthedocs.io/en/stable/configuring/
https://deepwiki.com/copier-org/copier/3.4-updating-projects
https://github.com/copier-org/copier/issues/1833
https://github.com/copier-org/copier/issues/2486
https://lyz-code.github.io/blue-book/copier/
https://gotofritz.net/blog/2025-08-10-copier-python-template-with-uv/
https://browniantech.com/blog/post/Effective-Repository-Templates-with-Copier
https://github.com/cruft/cruft
https://cruft.github.io/cruft/
https://github.com/cruft/cruft/blob/main/CHANGELOG.md
https://nx.dev/blog/migrate-ui
https://nx.dev/docs/guides/tips-n-tricks/advanced-update
https://nx.dev/docs/guides/nx-console/console-migrate-ui
https://nx.dev/docs/features/automate-updating-dependencies
https://nx.dev/docs/reference/nx/migrations
https://nx.dev/docs/reference/nx-commands
https://plopjs.com/
https://github.com/commitizen/cz-cli
https://github.com/commitizen/cz-conventional-changelog
https://commitizen-tools.github.io/commitizen/
https://www.npmjs.com/package/commitizen
https://deepwiki.com/commitizen/cz-cli
https://www.conventionalcommits.org/en/about/
https://commitlint.js.org/guides/use-prompt.html
https://github.com/unjs/changelogen
https://github.com/unjs/changelogen/blob/main/CHANGELOG.md
https://about.gitlab.com/blog/2018/07/03/solving-gitlabs-changelog-conflict-crisis/
https://medium.com/@nettsundere/on-reducing-changelog-merge-conflicts-1eb23552630b
https://github.com/handsontable/handsontable/issues/7405
https://github.com/PrefectHQ/prefect/issues/2311
https://github.com/KiloKilo/changelog
https://engineering.uptechstudio.com/blog/keep-a-changelog-without-conflicts/
https://github.com/jondot/hygen
https://www.npmjs.com/package/hygen
https://github.com/listr2/listr2
https://www.npmjs.com/package/listr2
https://listr2.kilic.dev/
https://github.com/privatenumber/tasuku
https://code.claude.com/docs/en/overview
https://www.sitepoint.com/claude-code-cli-agent-review/
https://kotrotsos.medium.com/claude-code-internals-part-11-terminal-ui-542fe17db016
https://news.ycombinator.com/item?id=46902411
https://news.ycombinator.com/item?id=42016639
https://github.com/nyatinte/ccexp
https://smartscope.blog/en/generative-ai/claude/claude-code-auto-permission-guide/
https://combray.prose.sh/2025-11-28-ink-tui-expandable-layout
https://medium.com/trabe/building-cli-tools-with-react-using-ink-and-pastel-2e5b0d3e2793
https://blog.logrocket.com/using-ink-ui-react-build-interactive-custom-clis/
https://blog.logrocket.com/add-interactivity-to-your-clis-with-react/
https://www.freecodecamp.org/news/react-js-ink-cli-tutorial/
https://developerlife.com/2021/11/05/ink-v3-advanced/
https://developerlife.com/2021/11/25/ink-v3-advanced-ui-components/
https://developerlife.com/2021/11/04/introduction-to-ink-v3/
https://dev.to/skirianov/building-reactive-clis-with-ink-react-cli-library-4jpa
https://vadimdemedes.com/posts/building-rich-command-line-interfaces-with-ink-and-react
https://vadimdemedes.com/posts/creating-clis-with-ink-react-and-a-bit-of-magic
https://vadimdemedes.com/posts/ink-3
https://blog.openreplay.com/building-command-line-apps-with-react-ink/
https://genicsblog.com/dhruva/building-clis-with-react-ink
https://medium.com/@pixelreverb/creating-a-terminal-application-with-ink-react-typescript-an-introduction-da49f3c012a8
https://cekrem.github.io/posts/do-more-stuff-cli-tool-part-1/
https://www.infoq.com/news/2019/04/ink-react-command-line-app/
https://aamilshohail.medium.com/react-for-command-line-interfaces-671cbe4c2c18
https://awesome-react.dev/library/ink
https://www.npmjs.com/package/ink
https://www.npmjs.com/package/ink-components
https://github.com/chjj/blessed
https://www.npmjs.com/package/blessed
https://github.com/yaronn/blessed-contrib
https://www.npmjs.com/package/blessed-contrib
https://elijahmanor.com/blog/react-blessed
https://elijahmanor.com/blog/react-blessed-layout-grid
https://elijahmanor.com/blog/react-blessed-color
https://hackmd.io/@elijahmanor/H1gV3B-RL
https://www.npmjs.com/package/react-diff-viewer
https://github.com/karaggeorge/ink-multi-select
https://www.npmjs.com/package/ink-select
https://gitpiper.com/resources/nodejs/commandlineutilities/vadimdemedes-ink
https://www.tkcnn.com/github/vadimdemedes/ink.html
https://github.com/mjackson/react-ink
https://app.unpkg.com/@clack/prompts@0.9.1/files/README.md
https://www.blacksrc.com/blog/elevate-your-cli-tools-with-clack-prompts
https://www.jamesperkins.dev/post/cli-with-clack
https://medium.com/@wangminder/a-simple-but-powerful-cli-demo-using-clack-with-ts-and-bun-cec91deeb95d
https://docs.rs/cliclack
https://pkg.go.dev/github.com/Mist3rBru/go-clack/prompts
https://lobehub.com/skills/ahmadawais-skills-clack
https://socket.dev/npm/package/@clack/prompts
https://npm-compare.com/enquirer,inquirer,prompt-sync
https://npm-compare.com/commander,enquirer,inquirer,prompts,vorpal,yargs
https://npm-compare.com/enquirer,inquirer,prompt,prompt-sync,prompts,readline-sync
https://npm-compare.com/hygen,plop,yeoman-generator
https://npm-compare.com/diff,diff2html,diff2html-cli,diff3,react-diff-view
https://npm-compare.com/chalk,inquirer
https://www.digitalocean.com/community/tutorials/nodejs-interactive-command-line-prompts
https://geshan.com.np/blog/2023/03/inquirer-js/
https://hamatti.org/posts/multi-select-filterable-command-line-interface-with-inquirer/
https://pypi.org/project/inquirer/
https://pypi.org/project/commitizen/
https://www.codingeasypeasy.com/blog/picocolors-the-fastest-and-lightest-nodejs-library-for-terminal-styling
https://github.com/es-tooling/module-replacements/issues/17
https://userjot.com/blog/add-color-terminal-chalk-nodejs
https://nodecli.com/chalk-npm-colors
https://www.stoutlabs.com/blog/2019-09-17-add-color-to-console-output-with-chalk/
https://dev.to/webdiscus/comparison-of-nodejs-libraries-to-colorize-text-in-terminal-4j3a
https://dev.to/dthiwanka/using-console-colors-with-nodejs-a-complete-guide-for-cleaner-smarter-terminal-output-a7k
https://blog.logrocket.com/using-console-colors-node-js/
https://geshan.com.np/blog/2022/10/npm-chalk/
https://www.w3tutorials.net/blog/chalk-nodejs/
https://snyk.io/advisor/npm-package/diff/functions/diff.parsePatch
https://snyk.io/advisor/npm-package/diff/functions/diff.applyPatch
https://snyk.io/advisor/npm-package/diff/functions/diff.diffLines
https://snyk.io/advisor/npm-package/diff/functions/diff.diffWords
https://www.jsdocs.io/package/diff
https://npmdoc.github.io/node-npmdoc-diff/build/apidoc.html
https://preview.npmjs.com/package/diff
https://www.npmjs.com/package/fast-diff
https://npmdiff.dev/
https://www.npmjs.com/package/diff-lines
https://docs.npmjs.com/cli/v11/commands/npm-diff/
https://dev.to/ruyadorno/npm-diff-23dh
https://www.npmjs.com/package/concat-md
https://www.npmjs.com/package/@knennigtri/merge-markdown
https://gist.github.com/davideicardi/787df4a9dc0de66c1db8f5a57e511230
https://github.com/knennigtri/merge-markdown
https://www.npmjs.com/package/merge-md
https://www.pingudev.com/tutorials/markdown-node-tutorial/
https://www.npmjs.com/package/markdown-magic
https://git-scm.com/docs/git-mergetool
https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/addressing-merge-conflicts/resolving-a-merge-conflict-using-the-command-line
https://www.gitkraken.com/features/merge-conflict-resolution-tool
https://gist.github.com/karenyyng/f19ff75c60f18b4b8149
https://docs.gitlab.com/user/project/merge_requests/conflicts/
https://learn.microsoft.com/en-us/azure/devops/repos/git/merging?view=azure-devops
https://www.atlassian.com/git/tutorials/using-branches/merge-conflicts
https://community.atlassian.com/forums/App-Central-articles/Advanced-Git-merge-conflict-resolution-techniques/ba-p/2476971
https://izymes.com/2023/09/14/advanced-git-merge-conflict-resolution-techniques/
https://news.ycombinator.com/item?id=31075608
https://github.com/dschrempf/syncthing-resolve-conflicts
https://www.perforce.com/manuals/p4guide/Content/P4Guide/options-resolving-conflicts.html
https://www.perforce.com/manuals/v14.3/p4v/branches.merging.html
https://help.perforce.com/helix-core/server-apps/p4v/current/Content/P4V/branches.resolve.html
https://help.perforce.com/helix-core/server-apps/p4v/current/Content/P4V/branches.merging.html
https://help.perforce.com/helix-core/server-apps/cmdref/current/Content/CmdRef/p4_merge.html
https://ftp.perforce.com/perforce/r16.2/doc/manuals/cmdref/p4_merge.html
https://www.mattscodecave.com/posts/howto-reading-git-diffs-and-staging-hunks.html
https://www.matthewsetter.com/better-git-diff-support/
https://en.wikipedia.org/wiki/Diff
https://github.com/anthropics/claude-code/issues/31395
https://github.com/openai/codex/issues/2998
https://github.com/InditexTech/gh-sherpa
https://forum.literatureandlatte.com/t/better-conflict-resolution-with-diff/141564
https://medium.com/@kaltepeter/tools-to-master-merge-conflicts-6d05b21a8ba8
https://github.com/vadimdemedes/ink/blob/master/src/hooks/use-input.ts
https://github.com/vadimdemedes/ink/issues/138
https://app.studyraid.com/en/read/11921/379937/keyboard-input-processing
https://blog.bitsrc.io/taking-react-to-the-command-line-with-ink-6872ab61b7b5
https://simply-how.com/project-and-files-generators
https://jellypepper.com/blog/improving-developer-efficiency-with-generators
https://rdomanoel.medium.com/creating-scaffolds-and-generators-using-yeoman-14dcb0c432f8
https://dev.to/ricardoham/creating-scaffolds-and-generators-using-yeoman-1g1m
https://blog.overctrl.com/code-scaffolding-tools-which-one-should-you-choose/
https://xkoji.dev/blog/automate-scaffolding-processes-with-plop/
https://blogs.perficient.com/2025/03/20/plop-js-a-micro-generator-framework-introduction-and-installation-part-1/
https://sunnysingh.io/blog/hygen
https://www.leniolabs.com/software/development/2020/02/06/hygen-DRY-the-smart-way/
https://medium.com/infraspeak/using-hygen-io-a-code-generator-at-infraspeak-e47a05215b95
https://dev.to/reggi/using-hygen-3g3i
https://www.hygen.io/docs/generators/
https://generalistprogrammer.com/tutorials/listr2-npm-package-guide
https://tessl.io/registry/tessl/npm-listr2/8.3.0
https://github.com/ruyadorno/ntl
https://www.astronomer.io/blog/standardizing-astro-projects-with-cookiecutter-and-cruft/
https://medium.com/@bctello8/standardizing-dbt-projects-at-scale-with-cookiecutter-and-cruft-20acc4dc3f74
https://john-miller.dev/posts/cookiecutter-with-cruft-for-platform-engineering/
https://github.com/renovatebot/renovate/discussions/24000
https://developers.cloudflare.com/workers/wrangler/
https://developers.cloudflare.com/workers/wrangler/commands/
https://developers.cloudflare.com/workers/wrangler/configuration/
https://developers.cloudflare.com/workers/wrangler/install-and-update/
https://www.npmjs.com/package/wrangler
https://github.com/cloudflare/workers-sdk
https://angular.dev/tools/cli/schematics
https://www.herodevs.com/blog-posts/angulars-improved-tooling-standalone-migration-magic
https://www.infragistics.com/blogs/angular-schematics-for-libraries
https://angular.dev/reference/migrations/standalone
https://github.com/angular/components/blob/main/src/cdk/schematics/ng-update/update-schematic.md
https://timdeschryver.dev/blog/ng-update-the-setup
https://dev.to/krisplatis/ng-update-mylibversion-which-migration-schematics-will-be-executed-4304
https://medium.com/@rocking.ac.satyam/angular-control-flow-schematics-migration-guide-f8fb44e56b4d
https://medium.com/ngconf/modernize-your-angular-app-with-migration-schematics-afe9ed9fa69b
https://www.angulararchitects.io/blog/angular-17-update/
https://github.com/prettier/eslint-config-prettier
https://github.com/prettier/prettier-eslint
https://prettier.io/docs/integrating-with-linters.html
https://www.npmjs.com/package/eslint-plugin-prettier
https://www.benmvp.com/blog/prettier-eslint/
https://github.com/prettier/eslint-plugin-prettier
https://github.com/prettier/prettier-eslint-cli
https://www.freecodecamp.org/news/dont-just-lint-your-code-fix-it-with-prettier/
https://medium.com/@sujaypawar/how-claude-code-actually-works-1f6d4f1eea82
https://softwarecrafter.substack.com/p/how-i-work-with-claude-code-and-why
https://claudelog.com/claude-code-mcps/ccstatusline/
https://www.npmjs.com/package/@claude-collective/cli
https://chromium.googlesource.com/infra/third_party/npm_modules/+/e7396f39cd50de4419362fc2bc48360cb85ce555/node_modules/mocha/node_modules/diff/README.md
https://github.com/codepen/jsdiff
```
