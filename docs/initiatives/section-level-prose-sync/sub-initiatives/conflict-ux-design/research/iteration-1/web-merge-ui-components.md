# Web-Based Section-Level Merge UI Components & Patterns

**Research iteration:** 1
**Date:** 2026-03-12
**Query:** What web-based components and patterns exist for building a section-level merge UI in React/shadcn?

---

## Key Discoveries

### Editor-Based Diff/Merge Components

- **Monaco Editor DiffEditor** (@monaco-editor/react) provides a two-way side-by-side diff view with syntax highlighting. No native three-way merge support — the VS Code 3-way merge editor is *not* exposed through Monaco's public API. Feature requests remain open: [Issue #3268](https://github.com/microsoft/monaco-editor/issues/3268), [Issue #1295](https://github.com/Microsoft/monaco-editor/issues/1295). Weekly downloads ~380k. The `DiffEditor` component accepts `original`, `modified`, and `language` props. No built-in accept/reject per-chunk — purely a viewer.

- **CodeMirror 6 Merge** (@codemirror/merge) is the strongest candidate for an interactive merge UI. Supports both **side-by-side** (MergeView) and **unified** (unifiedMergeView) modes. Has built-in **accept/reject per-chunk**: `acceptChunk(view, pos?)` and `rejectChunk(view, pos?)` functions. `getChunks()` returns current diff chunks for tracking resolution progress. `mergeControls` option can be a **custom renderer function** (as of July 2025 patch) for rendering accept/reject buttons however you want. Transaction-based event system: chunks emit `"accept"` and `"revert"` user events interceptable via `EditorView.updateListener`. No native three-way merge — it's two-way (original vs modified). React wrapper: [react-codemirror-merge](https://www.npmjs.com/package/react-codemirror-merge) (~6.5k weekly downloads). [Aziis98's blog post](https://aziis98.com/blog/codemirror-review-tool/) demonstrates building a complete review mode in ~60 lines using compartments to toggle the merge view on/off.

- **Mergely** (mergely.com) is a pure-JS diff/merge component using LCS algorithm. Has a React wrapper (mergely-react). Version 5.3.6. Client-side only, no server calls needed. Less actively maintained than CodeMirror/Monaco options. Good for simpler use cases.

### Pure React Diff Viewers (Display-Only)

- **react-diff-viewer-continued** — 478k weekly downloads, actively maintained (v4.2.0, March 2026). Split and inline views. GitHub-inspired styling. No merge/accept/reject functionality — display only. [GitHub](https://github.com/Aeolun/react-diff-viewer-continued)

- **react-diff-view** — 215k weekly downloads. Flexible decoration system, widget architecture for code commenting, powerful token system, web worker support. Can render custom content around change blocks. [GitHub](https://github.com/otakustay/react-diff-view)

- **@git-diff-view/react** — GitHub-style diff with virtual scrolling, split/unified views, syntax highlighting via HAST AST. Widget system (`renderWidgetLine`, `onAddWidgetClick`) allows custom per-hunk UI. No built-in accept/reject but the widget architecture could be extended. [GitHub](https://github.com/MrWangJustToDo/git-diff-view)

- **diff2html** — Generates GitHub-like HTML from unified diff output. React wrapper: react-gh-like-diff. Purely display — no interaction layer. [Website](https://diff2html.xyz/)

### Three-Way Merge Libraries (Algorithmic, No UI)

- **node-diff3** — The most complete JS three-way merge library. `diff3Merge(a, o, b)` returns alternating "ok" and "conflict" blocks. `merge()` generates standard conflict markers. `mergeDiff3()` generates git-style diff3 with `|||||||` markers. ESM + CJS. Browser-compatible. [GitHub](https://github.com/bhousel/node-diff3)

- **three-way-merge** (Movable Ink) — Based on Paul Heckel's algorithm. Simpler API than node-diff3. Compares both changed versions against an original. [GitHub](https://github.com/movableink/three-way-merge)

- **diff-match-patch** (Google) — Two-way diff/patch, originally built for Google Docs. No three-way merge but excellent for computing character-level and word-level diffs within sections. [GitHub](https://github.com/google/diff-match-patch)

- **jsdiff** (diff npm package) — `diffLines`, `structuredPatch`, `parsePatch`. Returns structured hunk objects. Async mode, abortable. No three-way merge. [GitHub](https://github.com/kpdecker/jsdiff)

### Specialized Three-Way Merge UI

- **react-monaco-json-merge** — A React component for **3-way JSON merging** built on Monaco. Schema-aware conflict detection, interactive checkboxes for accept/reject, smart auto-merging of compatible changes, optional 4-column mode with live preview. JSON-specific (not prose/markdown), but the UX patterns are directly applicable. [Libraries.io](https://libraries.io/npm/react-monaco-json-merge)

### Semantic/Structure-Aware Tools

- **Weave** (Ataraxy-Labs) — Entity-level semantic merge driver for Git using tree-sitter. Parses all three versions into semantic entities. Supports Markdown. 31/31 clean merges vs git's 15/31. Has an MCP server. Rust-based, not a web component, but the concept of entity-level merge is directly relevant to section-level prose sync. [GitHub](https://github.com/Ataraxy-Labs/weave)

- **ShowDiffs Markdown Diff** — Structure-aware markdown comparison. "Compare Structure Only" option focuses on headings/sections rather than content. CommonMark parser with GFM extensions. Client-side JS. [Website](https://showdiffs.com/markdown-diff/)

### Platform Merge UI Patterns (Design Reference)

- **VS Code 3-Way Merge Editor** — Three-column layout: Incoming (left), Current (right), Result (bottom). Checkboxes per-conflict for selection. Auto-merges non-conflicting changes. Conflict counter with jump-to-next. Result pane is fully editable. [Issue #146091](https://github.com/microsoft/vscode/issues/146091) documents the UX exploration.

- **GitHub Web Conflict Resolution** (October 2025) — One-click resolution with three buttons per conflict: "Accept current changes", "Accept incoming changes", "Accept both changes". Simple, familiar pattern borrowed from VS Code's inline markers. [Changelog](https://github.blog/changelog/2025-10-02-one-click-merge-conflict-resolution-now-in-the-web-interface/)

- **GitLab Web Merge Conflict Resolution** — Two modes: Interactive (select ours/theirs per section) and Inline Editor (manual editing for complex conflicts). Parses conflict markers into selectable sections. Commits resolved file directly to source branch. Limited to <200KB UTF-8 text files. [Blog](https://about.gitlab.com/blog/resolving-merge-conflicts-from-the-gitlab-ui/)

- **Figma Branching & Merge Conflicts** — Per-element conflict resolution: "Keep main" or "Keep branch" per conflicting component/page/variable. Can batch-resolve all conflicts one way. No granular within-element merge — it's all-or-nothing per element. Users request checkboxes for finer control. [Help Center](https://help.figma.com/hc/en-us/articles/360063144053-Guide-to-branching), [Forum Request](https://forum.figma.com/suggest-a-feature-11/feature-improvement-checkboxes-for-resolving-merge-conflicts-36147)

- **XWiki Merge Conflict Resolution UI** — Orange bars mark conflicts, blue area for resolution. Three choices per conflict: merge with own changes, take latest version, or enter custom text. Shows what will be lost (red) for each choice. [Design spec](https://design.xwiki.org/xwiki/bin/view/Design/MergeConflictResolutionUI)

- **Notion** — Uses CRDTs for real-time editing, avoiding explicit merge UI entirely. Offline mode can generate "conflict copies" requiring manual block-by-block review. No structured merge UI — users manually reconcile. [Help Center](https://www.notion.com/help/collaborate-within-a-workspace), [Offline Guide](https://www.taskfoundry.com/2025/08/notion-offline-mode-setup-sync-conflict-guide.html)

### Collaborative Editing Infrastructure

- **Yjs + Liveblocks** — CRDT-based real-time collaboration. Integrates with CodeMirror, Monaco, ProseMirror, Tiptap. Eliminates merge conflicts via automatic CRDT resolution. Not applicable for async file-level sync (our use case), but relevant if Studio ever adds real-time collaboration. [Liveblocks](https://liveblocks.io/multiplayer), [Yjs](https://github.com/yjs/yjs)

- **ProseMirror Changeset** — `prosemirror-changeset` distills editing steps into deleted/added ranges. Could track section-level changes in rich text. [Third-Bit blog](https://third-bit.com/2017/11/22/prosemirror-diff-merge/) argues for schema-aware merge that understands document structure (headings, paragraphs) rather than raw text diffs.

---

## Concrete Recommendation: Component Stack for Studio Merge UI

### Primary Stack

| Layer | Component | Rationale |
|-------|-----------|-----------|
| **Diff algorithm** | `node-diff3` | Only mature JS three-way merge library. Returns structured conflict/ok blocks. |
| **Section parsing** | Custom (markdown heading splitter) | Split markdown by `## ` headings into sections before feeding to diff. |
| **Merge view** | `@codemirror/merge` via `react-codemirror-merge` | Built-in accept/reject per chunk, custom button rendering, unified and side-by-side modes, markdown syntax highlighting via `@codemirror/lang-markdown`. |
| **Layout shell** | shadcn `ResizablePanelGroup` + `Tabs` + `ScrollArea` | VS Code-like resizable panels. Tabs for switching between conflicting files. ScrollArea for long documents. |
| **Per-section controls** | Custom React components | "Accept upstream" / "Accept consumer" / "Edit manually" buttons per section, rendered outside the editor. |
| **Progress tracking** | `getChunks()` from @codemirror/merge | Count remaining unresolved chunks. Show "3 of 7 conflicts resolved" progress bar. |

### Architecture Pattern

```
┌──────────────────────────────────────────────┐
│  File Selector (shadcn Tabs)                  │
├──────────────────────────────────────────────┤
│  Section Navigator (sidebar or breadcrumb)    │
├──────────────┬───────────────────────────────┤
│  Upstream    │  Consumer                      │
│  (read-only) │  (editable)                    │
│              │                                │
│  CodeMirror  │  CodeMirror                    │
│  with merge  │  with merge                    │
│  highlights  │  highlights                    │
├──────────────┴───────────────────────────────┤
│  Per-Section Action Bar                       │
│  [Accept Upstream] [Accept Consumer] [Edit]   │
├──────────────────────────────────────────────┤
│  Resolution Progress: ████████░░ 5/7          │
│  [Apply All] [Cancel]                         │
└──────────────────────────────────────────────┘
```

### Why Not Monaco?

Monaco's DiffEditor is a powerful viewer but lacks accept/reject per-chunk APIs. Three-way merge is not exposed (VS Code's merge editor is internal, not part of the Monaco npm package). Building merge interaction on top of Monaco means reimplementing what CodeMirror already provides natively.

### Why Not Pure React Diff Viewers?

react-diff-viewer-continued and friends are display-only. We need *interactive* merge with per-section resolution. Adding accept/reject to a display-only diff viewer means building the entire interaction layer from scratch. CodeMirror's merge extension already solves this.

---

## Implications for sherpa sync Studio Integration

1. **Section-level diff requires a pre-processing step.** Neither CodeMirror nor Monaco understand markdown sections natively. We need to split markdown files by heading boundaries, compute diffs per section (using node-diff3 against base/upstream/consumer), then present each section as an independent merge unit.

2. **Two-tier architecture.** node-diff3 handles the algorithmic three-way merge (detecting which sections conflict), while @codemirror/merge handles the visual presentation and per-chunk interaction within a conflicting section.

3. **Unified merge view is likely better than side-by-side for prose.** Side-by-side works for code but wastes horizontal space for long prose paragraphs. CodeMirror's `unifiedMergeView` shows changes inline, which is more natural for markdown documents.

4. **Weave's entity-level concept maps directly to our section-level model.** Weave's approach (parse into entities, match by identity, merge at entity level) is exactly what section-level prose sync does with markdown headings. We could potentially use Weave's algorithm or adapt its approach for the CLI, then visualize results in Studio.

5. **shadcn composability is a strength.** Since shadcn components are owned (not npm dependencies), we can wrap CodeMirror merge views inside ResizablePanelGroup, add custom action bars with shadcn Button/Badge, and style everything consistently with the Studio design system.

6. **The `mergeControls` custom renderer** in @codemirror/merge (added July 2025) is crucial — it lets us render shadcn-styled accept/reject buttons instead of CodeMirror's default buttons, maintaining visual consistency.

---

## Open Questions

1. **Performance with large markdown files.** CodeMirror handles large documents well with virtual rendering, but how does @codemirror/merge perform when many sections have conflicts? Need to benchmark with realistic sherpa sync output.

2. **Section identity matching.** When a heading is renamed in one version, how do we match sections across versions? node-diff3 works on text, not semantic structure. May need a heading-matching heuristic (fuzzy match on heading text, or position-based fallback).

3. **Nested sections.** Markdown has heading levels (h1-h6). Should conflict resolution be hierarchical? If an h2 section has sub-sections (h3), should accepting the h2 cascade to its children?

4. **Mixed conflict types.** Some sections may have text changes (diffable), while others may be entirely new or deleted. The UI needs to handle additions and deletions differently from modifications.

5. **Preview rendering.** Should users see raw markdown or rendered preview (or both, like ShowDiffs)? If rendered, how to show diffs in rendered markdown?

6. **Offline/CLI fallback.** The Studio merge UI is the premium experience, but `sherpa sync` must also work in terminal. How much of the section-splitting and three-way merge logic is shared between CLI and Studio?

7. **react-codemirror-merge maintenance.** It has ~6.5k weekly downloads — modest but stable. Is it thin enough to replace with a direct @codemirror/merge integration if needed?

8. **Weave integration opportunity.** Weave already supports Markdown entity-level merge with tree-sitter. Could we use Weave as the merge backend (via MCP or CLI) and Studio as the visualization layer?

---

## Sources

### Primary Component Documentation
- [@monaco-editor/react on npm](https://www.npmjs.com/package/@monaco-editor/react) — Monaco React wrapper with DiffEditor component
- [suren-atoyan/monaco-react on GitHub](https://github.com/suren-atoyan/monaco-react) — Most popular Monaco React integration
- [react-monaco-editor on GitHub](https://github.com/react-monaco-editor/react-monaco-editor) — Older Monaco React wrapper
- [Monaco React demo site](https://monaco-react.surenatoyan.com/) — Interactive examples
- [@codemirror/merge on GitHub](https://github.com/codemirror/merge) — Official CodeMirror merge extension
- [react-codemirror-merge on npm](https://www.npmjs.com/package/react-codemirror-merge) — React wrapper for CodeMirror merge
- [uiwjs/react-codemirror on GitHub](https://github.com/uiwjs/react-codemirror) — CodeMirror 6 React component
- [Mergely documentation](https://www.mergely.com/doc) — API reference
- [Mergely website](https://mergely.com/) — Overview and demos
- [Mergely on GitHub](https://github.com/wickedest/Mergely) — Source code

### React Diff Viewers
- [react-diff-viewer on GitHub](https://github.com/praneshr/react-diff-viewer) — Original, unmaintained
- [react-diff-viewer-continued on GitHub](https://github.com/Aeolun/react-diff-viewer-continued) — Actively maintained fork, 478k weekly downloads
- [react-diff-viewer demo](https://praneshravi.in/react-diff-viewer/) — Interactive examples
- [react-diff-view on GitHub](https://github.com/otakustay/react-diff-view) — Flexible diff with decoration system
- [react-diff-view on npm](https://www.npmjs.com/package/react-diff-view) — Package info
- [@git-diff-view/react on GitHub](https://github.com/MrWangJustToDo/git-diff-view) — GitHub-style diff with widget system
- [@git-diff-view/react on npm](https://www.npmjs.com/package/@git-diff-view/react) — Package info
- [@git-diff-view demo](https://mrwangjusttodo.github.io/git-diff-view/) — Interactive demo
- [diff2html website](https://diff2html.xyz/) — HTML diff generator
- [diff2html on npm](https://www.npmjs.com/package/diff2html) — Package info
- [react-gh-like-diff on GitHub](https://github.com/neighborhood999/react-gh-like-diff) — GitHub-like diff React component
- [npm trends comparison](https://npmtrends.com/react-diff-components-vs-react-diff-view-vs-react-diff-viewer) — Download comparison

### Three-Way Merge Libraries
- [node-diff3 on GitHub](https://github.com/bhousel/node-diff3) — JavaScript three-way merge library
- [node-diff3 on npm](https://www.npmjs.com/package/node-diff3) — Package info
- [three-way-merge on GitHub](https://github.com/movableink/three-way-merge) — Movable Ink's three-way merge
- [three-way-merge on npm](https://www.npmjs.com/package/three-way-merge) — Package info
- [diff-match-patch on GitHub](https://github.com/google/diff-match-patch) — Google's diff/patch library
- [diff-match-patch on npm](https://www.npmjs.com/package/diff-match-patch) — Package info
- [jsdiff on GitHub](https://github.com/kpdecker/jsdiff) — Text diff library
- [diff on npm](https://www.npmjs.com/package/diff) — Package info (jsdiff)
- [@sanity/diff-match-patch on npm](https://www.npmjs.com/package/@sanity/diff-match-patch) — Sanity's fork

### Specialized Merge Tools
- [react-monaco-json-merge on Libraries.io](https://libraries.io/npm/react-monaco-json-merge) — 3-way JSON merge component
- [Weave on GitHub](https://github.com/Ataraxy-Labs/weave) — Entity-level semantic merge driver
- [Weave documentation](https://ataraxy-labs.github.io/weave/) — Official docs
- [Weave on Hacker News](https://news.ycombinator.com/item?id=47241976) — Community discussion
- [Ataraxy-Labs/sem on GitHub](https://github.com/ataraxy-labs/sem) — Semantic version control CLI (related)

### CodeMirror Merge Deep-Dive
- [CM Merge: Chunk approval/rejection events](https://discuss.codemirror.net/t/codemirror-merge-calling-a-function-on-chunk-approval-reject/8636) — How to hook into accept/reject
- [CM Merge: Custom accept/reject buttons](https://discuss.codemirror.net/t/codemirror-v6-reverse-the-accept-reject-buttons-in-unified-merge-view-to-be-displayed-on-new-chunk/9076) — mergeControls custom renderer
- [CM Merge: Update config without re-instance](https://discuss.codemirror.net/t/merge-view-how-to-update-configuration-without-re-instance-the-merge-view/5402) — Dynamic reconfiguration
- [CM Merge: Implementation discussion](https://discuss.codemirror.net/t/merge-view-implementation/5072) — Architecture discussion
- [Aziis98: CodeMirror review tool](https://aziis98.com/blog/codemirror-review-tool/) — Building review mode in ~60 lines
- [Aziis98 on Hacker News](https://news.ycombinator.com/item?id=47032679) — Community discussion of the blog post
- [codemirror-rich-markdoc on GitHub](https://github.com/segphault/codemirror-rich-markdoc) — Rich markdown editing in CodeMirror
- [lang-markdown on GitHub](https://github.com/codemirror/lang-markdown) — CodeMirror markdown language support
- [merge CHANGELOG](https://github.com/codemirror/merge/blob/main/CHANGELOG.md) — @codemirror/merge version history

### Monaco Editor Merge Limitations
- [Monaco: 3-way merge feature request (#3268)](https://github.com/microsoft/monaco-editor/issues/3268) — Open request
- [Monaco: 3-way diff view (#1295)](https://github.com/Microsoft/monaco-editor/issues/1295) — Open since 2018
- [Monaco: Merge values (#2269)](https://github.com/microsoft/monaco-editor/issues/2269) — Merge functionality request
- [Monaco: Highlight merge conflicts (#1529)](https://github.com/microsoft/monaco-editor/issues/1529) — VS Code-like conflict markers
- [Monaco: Merge direction config (#4932)](https://github.com/microsoft/monaco-editor/issues/4932) — Layout configuration
- [Monaco diff CodePen](https://codepen.io/coltpini/pen/rJKNwg) — Basic diff demo
- [Monaco diff demo CodePen](https://codepen.io/akshitsarin/pen/VwexpQL) — Another diff demo

### VS Code Merge Editor Design
- [VS Code: UX exploration for three-way merge (#146091)](https://github.com/microsoft/vscode/issues/146091) — Detailed UX design discussion
- [VS Code: 3-way merge editor only edits 2 ways (#155251)](https://github.com/microsoft/vscode/issues/155251) — Limitations discussion
- [VS Code: Use as git merge tool (#153340)](https://github.com/microsoft/vscode/issues/153340) — Integration patterns
- [VS Code merge conflicts docs](https://code.visualstudio.com/docs/sourcecontrol/merge-conflicts) — Official documentation
- [VS Code v1.69 release notes](https://code.visualstudio.com/updates/v1_69) — Merge editor introduction
- [3-Column Merge Editor article](https://plainenglish.io/blog/finally-released-3-column-merge-editor-in-vs-code-8490ef694b3a) — Feature walkthrough

### Platform Merge UX Patterns
- [GitHub: One-click conflict resolution changelog](https://github.blog/changelog/2025-10-02-one-click-merge-conflict-resolution-now-in-the-web-interface/) — October 2025 feature
- [GitHub: Community discussion on one-click merge](https://github.com/orgs/community/discussions/175270) — User feedback
- [GitLab: Resolving merge conflicts from UI](https://about.gitlab.com/blog/resolving-merge-conflicts-from-the-gitlab-ui/) — Design and implementation
- [GitLab: Merge conflicts docs](https://docs.gitlab.com/user/project/merge_requests/conflicts/) — Official docs
- [GitLab: Add Monaco editor MR](https://gitlab.com/gitlab-org/gitlab-foss/-/merge_requests/12198) — Multi-file editor integration
- [XWiki: Merge Conflict Resolution UI design](https://design.xwiki.org/xwiki/bin/view/Design/MergeConflictResolutionUI) — Detailed design spec
- [Figma: Guide to branching](https://help.figma.com/hc/en-us/articles/360063144053-Guide-to-branching) — Branching and merge UX
- [Figma: Checkboxes for merge conflicts feature request](https://forum.figma.com/suggest-a-feature-11/feature-improvement-checkboxes-for-resolving-merge-conflicts-36147) — User request for granular control
- [Figma: Branching best practices](https://www.figma.com/best-practices/branching-in-figma/) — Official guide
- [Notion: Collaborate in workspace](https://www.notion.com/help/collaborate-within-a-workspace) — Collaboration model
- [Notion: Offline mode conflict guide](https://www.taskfoundry.com/2025/08/notion-offline-mode-setup-sync-conflict-guide.html) — Conflict handling

### Collaborative Editing & CRDTs
- [Liveblocks multiplayer platform](https://liveblocks.io/multiplayer) — Real-time collaboration infrastructure
- [Yjs on GitHub](https://github.com/yjs/yjs) — CRDT implementation
- [Liveblocks + CodeMirror + Yjs guide](https://liveblocks.io/docs/guides/how-to-create-a-collaborative-code-editor-with-codemirror-yjs-nextjs-and-liveblocks) — Integration tutorial
- [ProseMirror collaborative editing](https://marijnhaverbeke.nl/blog/collaborative-editing.html) — Architecture blog post
- [ProseMirror changeset on GitHub](https://github.com/ProseMirror/prosemirror-changeset) — Change tracking
- [ProseMirror collab on GitHub](https://github.com/ProseMirror/prosemirror-collab) — Collaboration module
- [Third-Bit: Diff and Merge for ProseMirror](https://third-bit.com/2017/11/22/prosemirror-diff-merge/) — Schema-aware merge concepts
- [Conflict resolution in collaborative editing](https://tryhoverify.com/blog/conflict-resolution-in-real-time-collaborative-editing/) — General patterns
- [SyncedStore on GitHub](https://github.com/YousefED/SyncedStore) — Easy CRDT-based collaboration

### Markdown-Specific Diff Tools
- [ShowDiffs Markdown Diff](https://showdiffs.com/markdown-diff/) — Structure-aware markdown comparison
- [DiffGuru Markdown Compare](https://diffguru.com/markdown) — Online markdown diff tool
- [Altova DiffDog for Markdown/AI](https://www.altova.com/blog/2026/02/comparing-markdown-files-in-the-age-of-agentic-ai-why-diffdog) — Commercial tool, agentic AI angle
- [dubdiff on GitHub](https://github.com/adamarthurryan/dubdiff) — Word-by-word markdown diff
- [pwdiff on GitHub](https://github.com/jduckles/pwdiff) — Pretty word-based markdown diffs
- [markdown-diff on npm](https://www.npmjs.com/package/markdown-diff) — Markdown diff package
- [Markdown Preview Diff](https://markdownpreview.org/en/diff) — Online rendered diff

### shadcn/ui Composable Components
- [shadcn Resizable](https://ui.shadcn.com/docs/components/radix/resizable) — ResizablePanelGroup for split views
- [shadcn Tabs](https://ui.shadcn.com/docs/components/radix/tabs) — Tab navigation for file switching
- [shadcn ScrollArea](https://ui.shadcn.com/docs/components/radix/scroll-area) — Scrollable containers
- [shadcn Components index](https://ui.shadcn.com/docs/components) — Full component list
- [shadcn CLI v4 changelog (March 2026)](https://ui.shadcn.com/docs/changelog/2026-03-cli-v4) — Latest tooling
- [shadcn diff command issue (#2619)](https://github.com/shadcn-ui/ui/issues/2619) — Discussion of diff functionality
- [shadcn 3-way merge issue (#2121)](https://github.com/shadcn-ui/ui/issues/2121) — Merge problem discussion

### AI-Assisted Merge
- [GitHub Copilot conflict resolution (Medium)](https://medium.com/germaneering/github-copilots-secret-superpower-fixing-merge-conflicts-before-you-fight-them-202f84067967) — AI-powered merge
- [AI merge tools comparison (DeployHQ)](https://www.deployhq.com/git/resolving-merge-conflicts-with-ai) — Copilot, Cursor, Claude comparison
- [VS Code Copilot rebase request (#294209)](https://github.com/microsoft/vscode/issues/294209) — Automated rebase with AI

### Misc/Tangential
- [CodeMirror examples index](https://codemirror.net/examples/) — All CM6 examples
- [CodeMirror try page](https://codemirror.net/try/) — Online editor
- [Monaco editor diff merge demo](https://monaco-editor-diff-merge.pa6storing.online/) — Custom implementation (currently down)
- [LogRocket: Build web editor with Monaco](https://blog.logrocket.com/build-web-editor-with-react-monaco-editor/) — Tutorial
- [Medium: Monaco diff viewer tutorial](https://medium.com/@letscodefuture/creating-a-json-or-code-diff-viewer-with-react-and-monaco-editor-48e2dc0ef562) — Step-by-step guide
- [CodeSandbox: Monaco editor examples](https://codesandbox.io/s/monaco-editor-react-sb5z5h) — Interactive examples
- [CodeSandbox: react-codemirror-merge examples](https://codesandbox.io/examples/package/react-codemirror-merge) — Interactive examples
- [CodeSandbox: @codemirror/merge examples](https://codesandbox.io/examples/package/@codemirror/merge) — Interactive examples
- [crewAI semantic merge driver issue](https://github.com/crewAIInc/crewAI/issues/4562) — Weave integration for AI agents
- [npm-compare: diff libraries](https://npm-compare.com/deep-diff,diff,diff-match-patch,diff2html,react-diff-view) — Library comparison
- [npm-compare: react diff viewers](https://npm-compare.com/react-diff-view,react-diff-viewer,react-diff-viewer-continued) — React diff comparison

---

## Raw Links

Every URL encountered during research, deduplicated:

```
https://www.npmjs.com/package/@monaco-editor/react
https://github.com/react-monaco-editor/react-monaco-editor
https://github.com/suren-atoyan/monaco-react
https://medium.com/@letscodefuture/creating-a-json-or-code-diff-viewer-with-react-and-monaco-editor-48e2dc0ef562
https://www.dhiwise.com/post/monaco-editor-a-comprehensive-guide-for-react-developers
https://unpkg.com/browse/@monaco-editor/react@1.2.1/README.md
https://monaco-react.surenatoyan.com/
https://blog.logrocket.com/build-web-editor-with-react-monaco-editor/
https://codesandbox.io/s/monaco-editor-react-sb5z5h
https://tessl.io/registry/tessl/npm-react-monaco-editor/0.59.0/files/docs/diff-editor.md
https://www.npmjs.com/package/react-codemirror-merge
https://github.com/uiwjs/react-codemirror
https://uiwjs.github.io/react-codemirror/
https://codesandbox.io/examples/package/react-codemirror-merge
https://www.codiga.io/blog/revisiting-codemirror-6-react-implementation/
https://github.com/codemirror/merge
https://codesandbox.io/examples/package/@codemirror/merge
https://github.com/handlebauer/codemirror-extensions
https://adamcollier.co.uk/posts/adding-codemirror-6-to-a-react-project
https://github.com/wickedest/Mergely
https://www.mergely.com/doc
https://mergely.com/
https://www.mergely.com/about
https://github.com/ixa-devstuff/mergely
https://uibox.github.io/Mergely/doc/index.html
https://cdnjs.com/libraries/mergely
https://github.com/akovac35/BlazorMergely
https://github.com/tylerpenney/Big-Mergely
https://github.com/wickedest/Mergely/tree/v4.3.9
https://www.npmjs.com/package/react-diff-view
https://github.com/praneshr/react-diff-viewer
https://www.npmjs.com/package/react-diff-viewer
https://praneshravi.in/react-diff-viewer/
https://npmtrends.com/react-diff-components-vs-react-diff-view-vs-react-diff-viewer
https://npm-compare.com/react-diff-view,react-diff-viewer,react-diff-viewer-continued
https://npm-compare.com/react-diff-view,react-diff-viewer
https://github.com/MrWangJustToDo/git-diff-view
https://npm-compare.com/deep-diff,diff,diff-match-patch,diff2html,react-diff-view
https://codesandbox.io/examples/package/react-diff-viewer
https://dev.to/oskarlindgren/vs-code-disable-3-way-merge-editor-544d
https://github.com/microsoft/vscode/issues/155251
https://code.visualstudio.com/docs/sourcecontrol/overview
https://code.visualstudio.com/docs/sourcecontrol/merge-conflicts
https://code.visualstudio.com/updates/v1_69
https://plainenglish.io/blog/finally-released-3-column-merge-editor-in-vs-code-8490ef694b3a
https://leonardomontini.dev/merge-conflict-vscode/
https://github.com/microsoft/vscode/issues/146091
https://javascript.plainenglish.io/finally-released-3-column-merge-editor-in-vs-code-8490ef694b3a
https://marketplace.visualstudio.com/items?itemName=zawys.vscode-as-git-mergetool
https://about.gitlab.com/blog/resolving-merge-conflicts-from-the-gitlab-ui/
https://forum.gitlab.com/t/improvements-merging-conflicts-in-the-web-ui/108302
https://docs.gitlab.com/user/project/merge_requests/conflicts/
https://about.staging.gitlab.com/blog/2016/09/06/resolving-merge-conflicts-from-the-gitlab-ui/
https://gitlab.lcqb.upmc.fr/help/user/project/merge_requests/resolve_conflicts.md
https://gitlab.com/gitlab-org/gitlab-foss/-/issues/26123
https://labs.onb.ac.at/gitlab/help/user/project/merge_requests/conflicts.md
https://ntugit.itachi1706.com/guides/conflict-web.html
https://experts.mpai.community/software/help/user/project/merge_requests/conflicts.md
https://forum.gitlab.com/t/unable-to-view-resolve-conflict-option-in-gitlab-ui/81416
https://fig.io/manual/shadcn-ui/diff
https://ui.shadcn.com/docs/changelog
https://ui.shadcn.com/docs/changelog/2026-03-cli-v4
https://designrevision.com/blog/shadcn-ui-guide
https://github.com/shadcn-ui/ui/issues/2619
https://ui.shadcn.com/
https://www.uxpin.com/studio/blog/build-ui-gpt-5-mini-shadcn-ui-uxpin-merge/
https://dev.to/codedthemes/shadcnui-cheat-sheet-2026-2f5k
https://github.com/shadcn-ui/ui/issues/2121
https://ui.shadcn.com/docs/components
https://github.com/microsoft/monaco-editor/issues/3268
https://github.com/Microsoft/monaco-editor/issues/1295
https://codepen.io/coltpini/pen/rJKNwg
https://github.com/microsoft/monaco-editor/issues/2269
https://monaco-editor-diff-merge.pa6storing.online/
https://gitlab.com/gitlab-org/gitlab-foss/-/merge_requests/12198
https://codepen.io/akshitsarin/pen/VwexpQL
https://github.com/microsoft/monaco-editor/issues/1529
https://github.com/Microsoft/monaco-editor/issues/368
https://discuss.codemirror.net/t/codemirror-merge-calling-a-function-on-chunk-approval-reject/8636
https://www.npmjs.com/package/@codemirror/merge?activeTab=code
https://github.com/codemirror/merge?tab=readme-ov-file
https://aziis98.com/blog/codemirror-review-tool/
https://codemirror.net/5/demo/merge.html
https://discuss.codemirror.net/t/codemirror-v6-reverse-the-accept-reject-buttons-in-unified-merge-view-to-be-displayed-on-new-chunk/9076
https://github.com/codemirror/merge/blob/main/CHANGELOG.md
https://discuss.codemirror.net/t/merge-view-implementation/5072
https://www.npmjs.com/package/@git-diff-view/react
https://mrwangjusttodo.github.io/git-diff-view/
https://github.com/otakustay/react-diff-view
https://madewithreactjs.com/git-diff-view
https://github.com/udamir/api-diff-viewer
https://github.com/jakemmarsh/react-native-diff-view
https://github.com/otakustay/react-diff-view/blob/master/docs/hoc.md
https://diff2html.xyz/
https://www.npmjs.com/package/diff2html
https://github.com/neighborhood999/react-gh-like-diff
https://github.com/rtfpessoa/diff2html
https://snyk.io/advisor/npm-package/diff2html/example
https://npm-compare.com/diff,diff2html,diff2html-cli,diff3,react-diff-view
https://www.npmjs.com/package/react-gh-like-diff
https://www.clouddefense.ai/code/javascript/example/diff2html
https://codesandbox.io/examples/package/diff2html
https://showdiffs.com/markdown-diff/
https://www.altova.com/blog/2026/02/comparing-markdown-files-in-the-age-of-agentic-ai-why-diffdog
https://diffguru.com/markdown
https://www.textcompare.org/markdown/
https://github.com/adamarthurryan/dubdiff
https://www.npmjs.com/package/markdown-diff
https://sudos.tools/markdown-diff
https://www.text-comparer.com/markdown
https://github.com/jduckles/pwdiff
https://welearncode.com/create-diff-markdown/
https://github.com/microsoft/vscode/issues/153340
https://github.com/microsoft/vscode/issues/212736
https://marketplace.visualstudio.com/items?itemName=moshfeu.diff-merge
https://www.npmjs.com/package/diff-match-patch
https://github.com/google/diff-match-patch
https://www.npmjs.com/package/diff
https://github.com/JackuB/diff-match-patch
https://www.npmjs.com/package/diff-match-patch-line-and-word
https://www.npmjs.com/package/@sanity/diff-match-patch
https://www.npmjs.com/package/text-diff
https://www.npmjs.com/package/google-diff-match-patch
https://www.npmjs.com/package/node-diff3
https://github.com/bhousel/node-diff3
https://github.com/bhousel/node-diff3/blob/main/README.md
https://github.com/langram/node-diff3
https://www.npmjs.com/package/three-way-merge
https://www.npmjs.com/package/@salto-io/node-diff3
https://github.com/movableink/three-way-merge
https://github.com/bhousel/node-diff3/blob/main/test/merge.test.js
https://github.com/bhousel/node-diff3/blob/main/test/mergeDiff3.test.js
https://github.com/bhousel/node-diff3/blob/main/package.json
https://www.npmjs.com/package/react-diff-viewer-continued?activeTab=versions
https://github.com/aeolun/react-diff-viewer-continued/issues
https://github.com/amplication/react-diff-viewer-continued
https://github.com/Aeolun/react-diff-viewer-continued
https://github.com/amplication/react-diff-viewer-continued/releases
https://github.com/Aeolun/react-diff-viewer-continued/issues/63
https://app.unpkg.com/react-diff-viewer-continued@3.4.0/files/README.md
https://security.snyk.io/package/npm/react-diff-viewer-continued
https://github.com/SiebeVE/react-diff-viewer-continued
https://github.com/ralzinov/react-diff-viewer-continued
https://libraries.io/npm/react-monaco-json-merge
https://www.npmjs.com/package/react-monaco-json-merge
https://medium.com/@lyuda.dzyubinska/monaco-editor-code-lens-provider-133ac9a13f84
https://github.com/microsoft/monaco-editor/issues/4932
https://github.com/movableink/three-way-merge/tree/master/src
https://www.npmjs.com/package/three-way-merge-lines
https://socket.dev/npm/package/three-way-merge
https://www.npmjs.com/package/3-way-merge
https://www.npmjs.com/package/three-way-merger
https://tryhoverify.com/blog/conflict-resolution-in-real-time-collaborative-editing/
https://liveblocks.io/multiplayer
https://www.notion.com/help/collaborate-within-a-workspace
https://www.taskfoundry.com/2025/08/notion-offline-mode-setup-sync-conflict-guide.html
https://design.xwiki.org/xwiki/bin/view/Design/MergeConflictResolutionUI
https://ones.com/blog/mastering-real-time-collaboration-notion-document-editing/
https://dev.to/adityasajoo/understanding-conflict-free-replicated-data-types-57jc
https://affine.pro/blog/notion-offline
https://medium.com/the-many/ux-conflict-resolution-co-designing-solutions-d270021e45fb
https://news.ycombinator.com/item?id=28718783
https://forum.xwiki.org/t/xwiki-11-8-released/5616
https://amitj975.medium.com/resolve-merge-conflicts-smartly-f3ba2af266be
https://www.xwiki.org/xwiki/bin/view/ReleaseNotes/Data/XWiki/11.7/
https://extensions.xwiki.org/xwiki/bin/view/Extension/Application%20Change%20Request%20-%20UI/
https://extensions.xwiki.org/xwiki/bin/view/Extension/Diff+Module
https://extensions.xwiki.org/xwiki/bin/view/Extension/Extension%20Manager%20Application
https://github.blog/changelog/2025-10-02-one-click-merge-conflict-resolution-now-in-the-web-interface/
https://medium.com/germaneering/github-copilots-secret-superpower-fixing-merge-conflicts-before-you-fight-them-202f84067967
https://github.com/orgs/community/discussions/157653
https://tech-now.io/en/it-support-issues/copilot-consulting/how-to-fix-merge-conflicts-caused-by-copilot-suggestions-in-collaborative-projects
https://github.com/microsoft/vscode/issues/294209
https://www.deployhq.com/git/resolving-merge-conflicts-with-ai
https://www.mergeconflict.fm/499
https://github.com/microsoft/vscode-copilot-release/issues/1438
https://devactivity.com/insights/beyond-the-ide-resolving-mobile-merge-conflicts-to-boost-developer-productivity-and-software-project-statistics/
https://github.com/orgs/community/discussions/175270
https://docs.github.com/articles/resolving-a-merge-conflict-on-github
https://gist.github.com/scottyhq/299e4d36018a2f13acfb2528a1553002
https://dev.to/github/how-do-i-resolve-merge-conflicts-5438
https://github.com/topics/conflict-resolution
https://github.com/topics/merge-conflicts
https://blog.hubspot.com/website/merge-conflicts-github
https://docs.github.com/articles/about-merge-conflicts
https://github.com/YousefED/SyncedStore
https://github.com/mkchoi212/fac
https://github.com/Ataraxy-Labs/weave
https://ataraxy-labs.github.io/weave/
https://app.daily.dev/posts/github---ataraxy-labs-weave-entity-level-semantic-merge-driver-for-git-resolves-conflicts-that-git-1urlsgkzn
https://github.com/Ataraxy-Labs/weave/releases
https://github.com/mbrukman/Ataraxy-Labs-weave
https://github.com/ataraxy-labs/sem
https://github.com/orgs/Ataraxy-Labs/discussions/1
https://vuink.com/post/tvguho-d-dpbz/Ataraxy-Labs/weave
https://github.com/crewAIInc/crewAI/issues/4562
https://news.ycombinator.com/item?id=47241976
https://github.com/ostinelli/syn
https://github.com/TUDelft-CNS-ATM/bluesky
https://github.com/smashwilson/merge-conflicts
https://github.com/CloudOnce/CloudOnce
https://github.com/orbitdb-archive/crdts
https://github.com/peer-base/js-delta-crdts
https://github.com/chojs23/ec
https://github.com/dschrempf/syncthing-resolve-conflicts
https://github.com/deltadoc/text_delta
https://github.com/jakub-g/git-resolve-conflict
https://github.com/sascha-wolf/sublime-GitConflictResolver
https://github.com/xgouchet/AutoMergeTool
https://github.com/sola-da/ConflictJS
https://github.com/stas-sl/realtime-collaboration-resources
https://github.com/liaojinxing/ConflictResolver
https://github.com/cinaq/mendix-userlib-cleaner
https://github.com/se-sic/jdime
https://dev.to/sachinchaurasiya/how-to-build-a-collaborative-editor-with-nextjs-and-liveblocks-389m
https://docs.yjs.dev/getting-started/a-collaborative-editor
https://www.npmjs.com/package/@liveblocks/yjs
https://www.synergycodes.com/blog/real-time-collaboration-for-multiple-users-in-react-flow-projects-with-yjs-e-book
https://blog.sachinchaurasiya.dev/how-to-build-a-collaborative-editor-with-nextjs-and-liveblocks
https://github.com/yjs/yjs
https://liveblocks.io/blog/introducing-liveblocks-yjs
https://liveblocks.io/docs/guides/how-to-create-a-collaborative-code-editor-with-codemirror-yjs-nextjs-and-liveblocks
https://liveblocks.io/docs/guides/how-to-create-a-collaborative-text-editor-with-slate-yjs-nextjs-and-liveblocks
https://github.com/ProseMirror/prosemirror-collab
https://marijnhaverbeke.nl/blog/collaborative-editing.html
https://third-bit.com/2017/11/22/prosemirror-diff-merge/
https://discuss.prosemirror.net/t/track-changes-not-working-with-collaboration-users/5763
https://github.com/ProseMirror/prosemirror-collab/blob/master/README.md
https://www.npmjs.com/package/prosemirror-collab
https://github.com/ProseMirror/prosemirror-changeset
https://prosemirror.net/docs/guide/
https://docs.yjs.dev/ecosystem/editor-bindings/prosemirror
https://github.com/ProseMirror/website/blob/master/markdown/guide/collab.md
https://discuss.codemirror.net/t/highlighting-markdown-mark-only/3964
https://codemirror.net/5/mode/markdown/
https://github.com/segphault/codemirror-rich-markdoc
https://discuss.codemirror.net/t/how-to-highlight-the-editor-in-markdown-mode/3098
https://codesandbox.io/examples/package/@codemirror/highlight
https://heshify.github.io/blog/redoed-markdown-editor-with-react/
https://discuss.codemirror.net/t/adding-support-for-the-additional-inline-syntax-to-markdown/3099
https://discuss.codemirror.net/t/markdown-and-latex-syntax-highlighting/4382
https://github.com/codemirror/lang-markdown
https://github.com/codemirror/dev/issues/742
https://www.shadcn.io/ui/resizable
https://ui.shadcn.com/docs/components/radix/resizable
https://www.shadcn.io/ui/scroll-area
https://ui.shadcn.com/docs/components/radix/tabs
https://www.shadcn.io/ui/tabs
https://ui.shadcn.com/docs/components/radix/scroll-area
https://www.shadcn-svelte.com/docs/components/resizable
https://github.com/shadcn-ui/ui/discussions/2345
https://www.shadcn-vue.com/docs/components/resizable
https://help.figma.com/hc/en-us/articles/360063144053-Guide-to-branching
https://forum.figma.com/suggest-a-feature-11/feature-improvement-checkboxes-for-resolving-merge-conflicts-36147
https://www.figma.com/best-practices/branching-in-figma/
https://help.figma.com/hc/en-us/sections/5665686755479-Branching-and-merging
https://blog.logrocket.com/ux-design/how-to-use-figma-branching-properly/
https://medium.com/hp-design/figma-branches-best-practices-ca0871aa1631
https://forum.figma.com/report-a-problem-6/branching-update-from-main-file-conflicts-stuck-26978
https://forum.figma.com/suggest-a-feature-11/extended-branching-version-control-merge-branch-into-branch-sub-branches-git-like-versioning-46960
https://www.somethingsblog.com/2024/11/01/mastering-figma-branching-for-seamless-design-collaboration/
https://designproject.io/blog/figma-version-control/
https://codemirror.net/examples/
https://codemirror.net/try/
https://thetrevorharmon.com/blog/codemirror-and-react/
https://github.com/scniro/react-codemirror2/issues/123
https://npmdoc.github.io/node-npmdoc-diff/build/apidoc.html
https://www.jsdocs.io/package/diff
https://github.com/kpdecker/jsdiff
https://preview.npmjs.com/package/diff
https://snyk.io/advisor/npm-package/diff/functions/diff.parsePatch
https://github.com/kpdecker/jsdiff/tree/v4.0.1
https://snyk.io/advisor/npm-package/diff/functions/diff.diffLines
https://www.npmjs.com/package/vue-jsdiff
https://discuss.codemirror.net/t/merge-view-how-to-update-configuration-without-re-instance-the-merge-view/5402
https://news.ycombinator.com/item?id=47032679
https://edittools.org/md-tools/markdown-diff
https://markdownpreview.org/en/diff
https://showdiffs.com/code-diff/
```
