---
started: 2026-03-20
worktree: null
---

## Activity Log

- **2026-03-20** — Initiative created from Luna conversation about research output location and multi-repo VPS setup. Proposal approved same session.
- **2026-03-20** — Iteration 1 research complete. 4 vectors: dotfolder schemas, multi-workspace federation, config inheritance, dashboard UX. Key findings: config-at-root/data-in-dotfolder validated, ESLint flat config as inheritance model, Vercel sidebar-filter as UX model, cross-project initiative graph as differentiator.
- **2026-03-20** — Proposal updated with Vercel model (Studio owns auth, projects own data). Triggered by robabby research viewer discussion.
- **2026-03-20** — Iteration 2 research complete. 4 vectors: dotfolder coexistence, MCP federation, URL routing, governance boundaries. Key decisions: three-directory model (.sherpa + .claude + docs), BFF + Virtual MCP (no new infrastructure), path-based `/projects/{slug}/...` routing, `sherpa.json` as canonical config format.
- **2026-03-20** — Implementation plan written. 6 sessions, 15 tasks. Session 1: config foundation (sherpa.json, project registry). Session 2: content multi-root. Session 3: DB isolation. Session 4: Studio UI routing + project switcher. Session 5: doc tree + research viewer. Session 6: convention inheritance + cross-project views.
- **2026-03-20** — Design document and prototype produced. 5 architecture decisions recorded. Prototype validates sidebar project switcher, projects listing, process view, research viewer with robabby data.
- **2026-03-20** — Stress test complete. 12 assumptions extracted, 8 tested. **A1 refuted:** content module multi-root is not trivially addable (~48 functions, 3 globals, race condition). Redesigned session 2 to use `ProjectContext` object instead of optional `projectSlug`. Effort estimate revised to 5-7 sessions.
- **2026-03-20** — PR #13 merged (feat/multi-project-studio). 23 commits, 44 files, +1506/-303. Sessions 1-6 complete. Infrastructure built: config layer, project registry, ProjectContext, Studio UI routes, project switcher, research viewer, cross-project search, legacy redirects. No projects registered yet (`"projects": []`).
- **2026-03-20** — Session 8 planned: Project Activation. Design decisions: env var interpolation for path resolution (Phase 1, evolves to git-remote resolution for SaaS), `.sherpa/config.json` per project, research files committed to each project's `.sherpa/research/`. Scaffolding wavepoint + robabby as first registered projects.
- **2026-03-20** — Session 8 executed. PR #14 merged. Env var interpolation in config loader (9 tests), projects registered in sherpa.json, .sherpa/ scaffolded in wavepoint (PR #491) and robabby (PR #59), Research nav link added to sidebar, VPS rebuilt and deployed. All three projects visible in Studio.
- **2026-03-20** — Luna updated her overnight research cron to write to `.sherpa/research/` with YAML frontmatter. Test file rendered at `studio.sherpa.solar/projects/robabby/research/job-market/2026-03-20`. End-to-end loop verified: Luna writes → git PR → merge → Studio renders.
- **2026-03-20** — Initiative marked `integrated`. Full multi-project system operational.

## Seeds

- **Deploy pipeline gap**: VPS git sync pulls code but doesn't rebuild. Manual `pnpm build` + restart required. → initiative: studio-zero-downtime-deploy
- **Markdown renderer**: Research detail page uses `whitespace-pre-wrap` instead of rendered markdown. Add a proper markdown renderer (remark/rehype or similar). → initiative: research-markdown-renderer
- **robabby deploy key is read-only**: Luna falls back to HTTPS + gh token for pushes. Set up a write-capable deploy key matching sherpa/wavepoint pattern.
- **Research cross-project view**: No aggregate view of research across all projects. Add a cross-project research index at `/research` (unscoped).
- **SaaS path resolution**: Current env var interpolation is Phase 1. Future: `remote` field becomes primary identifier, Studio manages clones in `~/.sherpa/projects/`.
