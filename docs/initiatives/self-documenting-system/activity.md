---
started: 2026-03-16
worktree: null
---

# Self-Documenting System — Activity

## 2026-03-16 — Session 1: Foundation

- Brainstormed the full design through collaborative dialogue
- Key decisions: directoturtles elevated to first-class convention, provenance metadata on all maintained docs, all provenance states are "live", index.md as content file name
- Created initiative with approved proposal
- Built convention rules (directoturtle, provenance) and /integrate skill

## 2026-03-16 — Session 2: Bootstrap

- Created /doc-bootstrap skill with three modes (bootstrap, init, drift)
- Ran bootstrap Pass 1: skeleton — 7 architecture stubs, 6 decision records, 1 changelog
- Pillar-to-initiative mapping across 6 integrated initiatives
- Pass 2 complete: all 7 architecture docs filled with depth from code exploration + initiative artifacts
- Decision records already had full Context/Decision/Consequences from Pass 1
- Changelog populated with 7 entries (6 integrated initiatives + self-documenting-system)
- Total: 14 new files in docs/ — 7 architecture, 6 decisions, 1 changelog

## 2026-03-16 — Session 3: Studio UI

- Designed the /docs page evolution: catalog → two-pane workspace with provenance
- Built prototype.html for visual validation
- Implemented via subagent-driven development (7 tasks, 3 parallel + 4 sequential)
- New studio-core modules: doc-tree.ts (fs-dependent), doc-tree-types.ts (pure types/functions)
- New studio-ui components: DocsWorkspace, DocTree, ProvenanceHeader
- /docs route wired to workspace, [...slug] route updated with provenance header
- Fixed Turbopack build: split types from Node.js-dependent code, removed .js extensions
- Build passes, typecheck passes across all 8 packages
- UI reviewed via Playwright screenshots — slug fix, build fixes verified

## Seeds

1. **"Mark as Reviewed" server action** — The ProvenanceHeader button exists but the server action that writes `reviewed-by: human` to frontmatter and regenerates the banner isn't wired. The DocsWorkspace already accepts `onMarkReviewed` prop (added by Rob). Needs: Next.js server action in `/docs` route that calls a studio-core function to update frontmatter. *Scoped out: implementation detail deferred to keep session focused on core workspace.*

2. **Mobile layout for docs workspace** — Both panes render side-by-side on mobile, crushing the content pane. Needs: single-pane collapse (tree only, content on tap) matching ProcessWorkspace mobile behavior. *Scoped out: design doc flagged as future task.*

3. **Drift detection with git** — Staleness currently relies on frontmatter dates only. Full drift detection needs `git log --since=<last-verified>` against relevant code paths. Can run standalone or fold into `/retro`. *Scoped out: designed in /doc-bootstrap drift mode but not yet implemented.*

4. **`sherpa init` documentation scaffolding** — Wire `/doc-bootstrap init` mode into the `sherpa init` CLI so new adopters get the documentation skeleton from day one. *Depends on: sherpa-framework-extraction (in-progress).*

5. **Decision record titles** — Decisions show slug-based names in the tree (e.g., "0001-three-layer-coordination") instead of human-readable titles because they lack H1 headings. Could extract title from `## Decision` section or add H1s to the decision format. *Emerged during UI review.*

6. **Full keyboard navigation** — Tree has `/` (search) and `r` (review toggle) shortcuts but lacks j/k arrow-key navigation between nodes, matching the ProcessWorkspace pattern. *Scoped out: polish deferred.*

7. **Provenance history view** — Click into any doc and see its full authorship chain: who created it, which initiatives updated it, when verified. Would pull from `source-initiatives` + git blame. *Designed in proposal but not implemented — UI surface for it doesn't exist yet.*
