---
status: pending
initiative: conflict-ux-design
created: 2026-03-12
updated: 2026-03-12
type: research-synthesis
risk: additive
targets:
  - packages/studio-core/src/sync/conflict-formatter.ts
  - packages/studio-cli/src/commands/sync.ts
  - apps/studio/src/components/merge-view/
dependencies:
  - section-level-prose-sync
spawned-from: section-level-prose-sync
---

# Conflict UX Design for Section-Level Sync

## Summary

Define the conflict presentation and resolution UX for `sherpa sync` across four surfaces: batch file markers (always), interactive CLI (Ink), editor integration (`code --merge`), and Studio UI (@codemirror/merge). All surfaces consume the same section-level diff3 merge output from `studio-core`. The user escalates as needed: auto-resolve → markers → CLI → editor → Studio.

## State Snapshot

The parent initiative (`section-level-prose-sync`) defined the merge algorithm: section-level three-way diff3 with stored baseline. The algorithm classifies each markdown section as auto-resolved, conflicted, added, or deleted. **No conflict UX exists yet.** The proposal.md for the parent initiative explicitly deferred conflict UX: "How conflicts are presented to the user (CLI prompt, file markers, Studio UI) is a separate concern."

Research iteration 1 surveyed 30+ tools across five vectors: template sync tools (Copier, Cruft, Flexlate), editor integration (VS Code, JetBrains, Kaleidoscope), conflict marker formats (git, Jujutsu, Weave, csvdiff3), CLI frameworks (Ink, Clack, Inquirer), and web merge components (CodeMirror, Monaco, react-diff-viewer). Key finding: no existing tool does section-level conflict resolution for markdown — this is the key differentiator.

## Proposed Changes

### Target: `packages/studio-core/src/sync/conflict-formatter.ts`

**Section-aware conflict marker generator.** Takes the merge engine's structured output (conflicted sections with base/upstream/consumer content) and produces git-compatible markers with section metadata:

```markdown
<!-- sherpa:conflict sections=1 unresolved=1 -->

<<<<<<< upstream — ## Configuration (modified)
timeout: 60s
retries: 3
||||||| base — ## Configuration
timeout: 30s
======= consumer — ## Configuration (modified)
timeout: 30s
retries: 5
>>>>>>> end — ## Configuration
```

Format design rationale:
- **Git-compatible delimiters** (`<<<<<<<`, `|||||||`, `=======`, `>>>>>>>`) → free VS Code CodeLens (Accept Current / Accept Incoming / Accept Both), pre-commit hooks (`check-merge-conflict`), and grep support
- **Em-dash metadata** (Weave pattern) → section title + change classification on each marker line. VS Code ignores everything after the 7-char delimiter
- **diff3-style base** → users see what changed on each side relative to original. Overwhelmingly preferred per user research
- **HTML comment header** → machine-readable conflict count for CI detection, prevents silent absorption
- **`end` label on `>>>>>>>`** → `grep "^<<<<<<< "` produces a conflict table of contents
- **Semantic labels** (`upstream`/`consumer`/`base`) instead of branch names (Copier convention)

Also exports structured merge result types consumed by all four surfaces:

```typescript
interface SectionMergeResult {
  file: string;
  sections: SectionResult[];
  stats: { total: number; autoResolved: number; conflicted: number; added: number; deleted: number };
}

interface SectionResult {
  sectionId: string;
  heading: string;
  status: 'auto-resolved' | 'conflicted' | 'added' | 'deleted';
  resolution?: 'take-upstream' | 'keep-consumer' | 'merged';
  base?: string;
  upstream?: string;
  consumer?: string;
}
```

### Target: `packages/studio-cli/src/commands/sync.ts`

**Two conflict resolution modes:**

**Batch mode** (default, always runs):
- Write section-aware conflict markers into the file
- Exit with non-zero code if unresolved conflicts exist
- Print summary: `✓ 8 sections auto-resolved, ✗ 2 sections conflicted in CLAUDE.md`
- Support `--conflict inline` (default) and `--conflict json` (machine-readable `.sherpa-conflicts.json`)

**Interactive mode** (`--interactive` or default when TTY detected):
- Ink-based per-section conflict resolution using modified `git add --patch` interaction model
- Per-section actions: `a`(ccept upstream), `k`(eep mine), `e`(dit in $EDITOR), `d`(efer), `A`(ccept all), `K`(eep all), `q`(uit)
- Colored inline diff per section showing what changed on each side
- Progress footer: `Section 3/7 conflicts resolved`
- Deferred sections written as conflict markers for later resolution
- Resume via `sherpa sync --continue`

**Editor escalation** (from interactive mode `e` key or `--merge-tool`):
- Extract conflicting section into four temp files (base, upstream, consumer, result)
- Launch configurable merge tool: `code --wait --merge` (default), `webstorm merge`, `ksdiff --merge`, etc.
- Configurable via `sync.merge.tool` in `sherpa.config.ts`
- Post-editor: compare result file content to detect if merge was completed (workaround for VS Code exit code bug)

### Target: `apps/studio/src/components/merge-view/`

**Studio merge panel** (Phase 2):
- @codemirror/merge with `mergeControls` custom renderer for shadcn-styled accept/reject buttons
- Per-section conflict display with "Accept Upstream" / "Accept Consumer" / "Edit Manually" buttons
- Resolution progress bar: `████████░░ 5/7 sections resolved`
- shadcn `ResizablePanelGroup` for VS Code-like layout, `Tabs` for multi-file switching, `ScrollArea` for long documents
- Reads structured merge results from sync engine (via MCP or file-based `.sherpa-conflicts.json`)
- Unified merge view (not side-by-side) for prose — better for markdown paragraph flow

## Rationale

**Why four surfaces, not one:** Different contexts need different UX. CI needs batch markers + exit codes. A developer at a terminal wants `git add --patch`-style flow. A complex section conflict benefits from VS Code's merge editor. Studio provides the premium visual experience. The key insight: all four consume the same structured merge output.

**Why git-compatible markers:** VS Code automatically renders Accept/Reject buttons for any file containing standard conflict markers. Pre-commit hooks detect them. `git mergetool` can process them. Zero integration cost for the dominant editor.

**Why Ink for CLI:** Claude Code, Gemini CLI, and Cloudflare Wrangler prove Ink works for exactly this class of problem: rich interactive terminal UIs with diff display and per-item keyboard actions. The component model maps naturally to `<SectionDiff>` and `<ConflictResolver>`.

**Why @codemirror/merge for Studio:** It's the only editor component with built-in `acceptChunk()`/`rejectChunk()` APIs and a custom `mergeControls` renderer. Monaco's DiffEditor is display-only — VS Code's merge editor is internal and not exposed.

**Why deferred resolution:** Convention file conflicts don't block development (unlike code merge conflicts that prevent compilation). Copier's batch-first design and Jujutsu's deferred resolution pattern both validate: detect immediately, resolve when ready.

## Dependencies

- `section-level-prose-sync` — the merge algorithm this UX is built on

## Review Notes

- **MVP scope:** Batch markers (Surface 1) and interactive CLI (Surface 2) are MVP. Editor integration (Surface 3) and Studio UI (Surface 4) are Phase 2.
- **Ink bundle concern:** Ink pulls in React. Acceptable — Claude Code and Wrangler both ship Ink-based CLIs. Measure final bundle impact.
- **Exit code workaround:** VS Code `--merge` always returns 0. Need file content comparison before/after to detect merge completion. JetBrains and KDiff3 return meaningful exit codes — document which tools support reliable exit codes.
- **node-diff3 `stringSeparator`:** Need to verify that passing a heading regex as `stringSeparator` to `diff3Merge()` produces section-level tokens correctly. May need custom tokenization before feeding to diff3.
- **Conflict caching opportunity:** git rerere (reuse recorded resolution) could be adapted for section-level conflicts. If the same section conflict recurs across syncs, auto-apply the previous resolution. Deferred to future iteration.
