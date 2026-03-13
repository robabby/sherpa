# Iteration 4 — 2026-03-11

## What We Already Knew

Iterations 1-3 established the complete architecture: three-channel distribution (npm, plugins, CLI), Payload CMS as the architectural model, five-package split, `defineConfig()` + `createStudio(config)` API, config-based catalog registration, `server-only` removal strategy, and standalone testing with `__fixtures__/`. A 13-task implementation plan was written and Tasks 1-5 are complete in `.worktrees/sherpa-extraction/` (package scaffolding, Layer 0 types/lifecycle, Layer 0 self-contained modules, Layer 1 schemas/parsing, catalogs with `CatalogRegistry<T>`). Five open questions remained from iteration 3.

## Research Vectors

### Vector 1: shadcn/ui Framework Extraction
**Question:** How do React component libraries that depend on shadcn/ui handle packaging?
**Full report:** [iteration-4/vector-1-shadcn-ui-framework-extraction.md](iteration-4/vector-1-shadcn-ui-framework-extraction.md)

**Key discoveries:**
- Four approaches exist with concrete examples: bundled npm (chroniconl/ui, Tremor), shadcn registry (Plate, DiceUI, tablecn), peer-depend (impossible — shadcn not on npm), copy-paste (Magic UI). Registry is the ecosystem standard; bundled npm is the pragmatic JIT choice.
- **Plate is the model:** npm packages for logic (`@platejs/*`), shadcn registry for UI (`@plate/*`). Components use `@/` imports; shadcn CLI rewrites paths on install. ([platejs.org](https://platejs.org))
- **Payload does NOT use shadcn/ui** — uses `@faceless-ui/*`. Not a reference for this problem.
- Tailwind v4 `@source` directive required for npm-distributed component libraries. ([Tailwind docs](https://tailwindcss.com/docs/detecting-classes-in-source-files))

**Implications:**
- JIT: bundle shadcn primitives with relative imports. Publishable: `@sherpa` shadcn registry namespace (Plate model).

### Vector 2: Sync vs Async API Migration
**Question:** Should `createStudio()` methods be sync or async?
**Full report:** [iteration-4/vector-2-sync-async-api-migration.md](iteration-4/vector-2-sync-async-api-migration.md)

**Key discoveries:**
- Babel took 4 months to add async via `gensync`. glob broke aws-cdk/mocha/jest when changing sync→async in v9. dotenv deliberately kept `readFileSync`.
- Performance is irrelevant: 500 markdown files read synchronously completes in single-digit ms.
- Next.js RSC fully supports sync reads. `readFileSync` in official docs.
- **Keystatic is async because of GitHub, not files.** `MinimalFs` interface abstracts local FS and GitHub API. Without remote backend, async buys nothing.

**Implications:**
- **Ship sync for v1.** `content.ts` is the I/O boundary. Future async migration: make content.ts return Promises, add `await` at ~70 call sites. One session.

### Vector 3: Convention Distribution Ecosystem Update
**Question:** What's changed in the AI agent convention ecosystem since March 2026?
**Full report:** [iteration-4/vector-3-convention-distribution-ecosystem.md](iteration-4/vector-3-convention-distribution-ecosystem.md)

**Key discoveries:**
- Claude Code plugins STILL cannot distribute `.claude/rules/` files. Issue [#14200](https://github.com/anthropics/claude-code/issues/14200) open 3+ months, no response.
- Five new tools appeared (Ruler, Microsoft APM, Packmind, AI Rules Sync, dot-agents). **None implements three-way merge.**
- ETH Zurich study: verbose context files HURT performance by 3%, increase costs 20%. Only non-inferable behavioral constraints help. ([arXiv:2602.11988](https://arxiv.org/abs/2602.11988))
- Agent Skills: 83K+ skills, 8M+ installs via Vercel's `npx skills add`. Skill distribution is solved.

**Implications:**
- **Layer 4 (convention governance with provenance + three-way merge) is still vacant.** This is Sherpa's unique position. Don't build skill distribution — use existing infrastructure.

### Vector 4: Monorepo Framework Package Gotchas
**Question:** What are the practical gotchas of framework packages in a consumer monorepo?
**Full report:** [iteration-4/vector-4-monorepo-framework-package-gotchas.md](iteration-4/vector-4-monorepo-framework-package-gotchas.md)

**Key discoveries:**
- TypeScript project references NOT needed for JIT. transpilePackages is sufficient. ([Turborepo blog](https://turborepo.dev/blog/you-might-not-need-typescript-project-references))
- **Critical: barrel exports defeat tree-shaking AND contaminate server/client boundaries.** `@sherpa/studio-ui` needs sub-path exports. Add `optimizePackageImports: ["@sherpa/studio-ui"]` to next.config.js.
- yalc is broken with pnpm >= 7.10. Use `workspace:*` for JIT, `pnpm pack` for pre-publish.
- `publishConfig.exports` lets you maintain JIT dev paths while shipping compiled dist.
- Use Changesets `linked` mode (not `fixed`) — release independently but keep versions in sync.

**Implications:**
- Add `resolve-peers-from-workspace-root = true` to `.npmrc`. Task 9 needs sub-path exports. Task 13 needs `linked` mode.

## Synthesis

### The Central Insight: Implementation Is Validating Architecture, Surfacing Tactical Gaps

Four iterations of research produced the architecture. Five tasks of implementation proved it works. Iteration 4 is the first cycle where research serves active execution — the findings are tactical: how to handle shadcn/ui in component extraction, why sync API is correct, confirmation that convention sync fills a genuine ecosystem gap, and specific configuration pitfalls to avoid.

### Cross-Vector Pattern: The Ecosystem Confirms Our Gaps Are Real

Three independent vectors converged on the same conclusion: the problems Sherpa solves are genuinely unsolved.

| Gap | Evidence | Sherpa's Answer |
|-----|----------|----------------|
| Convention governance (L4) | 5 new tools, none with three-way merge | `sherpa sync` with `node-diff3` |
| shadcn component distribution for frameworks | No npm package approach at scale | Bundled JIT → Registry Publishable |
| `.claude/rules/` distribution | Plugin system can't, 3-month-old issue | `sherpa sync` manages these files |

### Cross-Vector Pattern: Two-Phase Strategy for Every Decision

Every vector independently produced the same pattern: a pragmatic JIT choice and a forward-looking Publishable strategy.

| Concern | JIT Phase | Publishable Phase |
|---------|-----------|-------------------|
| API | Sync (`readFileSync`) | Async (mechanical: content.ts + ~70 call sites) |
| UI components | Bundle primitives, relative imports | `@sherpa` shadcn registry namespace |
| Package testing | `workspace:*` is the test | `pnpm pack` + verdaccio in CI |
| Exports | `.ts` source, barrel OK with optimizePackageImports | `publishConfig.exports`, sub-path exports |
| Build tooling | None (JIT) | tsup/tsdown + `isolatedDeclarations` |
| Changesets | Not needed | `linked` mode, ignore web app |

### Three Plan Revisions for Remaining Tasks

1. **Task 9 (UI extraction):** Replace single barrel with sub-path exports per component group. Add `optimizePackageImports` to next.config.js. Bundle ~19 shadcn primitives into `packages/studio-ui/src/ui/`. Use relative imports internally.

2. **Task 13 (publishing pipeline):** Switch from `fixed` to `linked` Changesets mode. Use `publishConfig.exports`. Skip yalc (broken with modern pnpm).

3. **Immediate (.npmrc):** Add `resolve-peers-from-workspace-root = true` before Task 6.

### Open Questions Resolved From Iteration 3

| Question | Resolution |
|----------|-----------|
| Sync vs async API | **Sync for v1.** content.ts I/O boundary makes future migration mechanical. |
| Directory convention portability | **Solved by implementation.** Tasks 3 and 6 make paths configurable. |
| Phase 2 readiness | **Resolved.** We're IN Phase 3 execution. |

## All Sources

### shadcn/ui & Component Distribution
- [shadcn registry system](https://ui.shadcn.com/docs/registry) — Registry overview
- [shadcn registry template](https://github.com/shadcn-ui/registry-template) — Official third-party template
- [shadcn namespace](https://ui.shadcn.com/docs/registry/namespace) — Namespaced registries
- [shadcn components.json](https://ui.shadcn.com/docs/components-json) — Alias configuration
- [Plate installation](https://platejs.org/docs/installation/next) — npm + registry hybrid
- [platejs.org/r/toolbar.json](https://platejs.org/r/toolbar.json) — Verified registry item
- [chroniconl/ui](https://github.com/chroniconl/ui) — Bundled shadcn npm package
- [Tremor](https://raw.githubusercontent.com/tremorlabs/tremor/main/package.json) — Bundled components
- [Tailwind class detection](https://tailwindcss.com/docs/detecting-classes-in-source-files) — @source directive
- [Tailwind v4 blog](https://tailwindcss.com/blog/tailwindcss-v4) — CSS-first config
- [DiceUI](https://diceui.com/docs/components/data-table) — Registry + CLI limitations noted
- [Payload UI](https://raw.githubusercontent.com/payloadcms/payload/main/packages/ui/package.json) — Uses @faceless-ui, not shadcn

### Sync/Async API Design
- [gensync](https://github.com/loganfsmyth/gensync) — Babel's dual sync/async
- [quansync](https://github.com/nicolo-ribaudo/quansync) — gensync successor
- [Keystatic reader/generic.ts](https://raw.githubusercontent.com/Thinkmill/keystatic/main/packages/keystatic/src/reader/generic.ts) — MinimalFs
- [dotenv](https://github.com/motdotla/dotenv) — Deliberately kept readFileSync
- [glob](https://github.com/isaacs/node-glob) — Broke consumers with sync→async

### Convention Distribution
- [Claude Code plugin issue #14200](https://github.com/anthropics/claude-code/issues/14200) — Rules gap
- [ETH Zurich arXiv:2602.11988](https://arxiv.org/abs/2602.11988) — Verbose context hurts performance
- [agentskills.io](https://agentskills.io/home) — 83K+ skills
- [Ruler](https://github.com/AiHaibara/ruler) — Rule concatenation (2.5k stars)
- [Microsoft APM](https://github.com/microsoft/apm) — Agent Package Manager (442 stars)
- [node-diff3](https://www.npmjs.com/package/node-diff3) — Three-way merge in JS
- [Copier](https://copier.readthedocs.io/) — Python template lifecycle (only tool with 3-way merge)

### Monorepo Patterns
- [Turborepo: no project references](https://turborepo.dev/blog/you-might-not-need-typescript-project-references) — JIT is sufficient
- [Next.js optimizePackageImports](https://nextjs.org/docs/app/api-reference/config/next-config-js/optimizePackageImports) — Barrel fix
- [pnpm publishConfig](https://pnpm.io/package_json#publishconfig) — Dev→publish export switching
- [Changesets linked mode](https://github.com/changesets/changesets/blob/main/docs/linked-packages.md) — Linked versioning
- [pnpm .npmrc](https://pnpm.io/npmrc) — resolve-peers-from-workspace-root

## Proposals Generated

Updated proposal with: sync API decision, UI extraction strategy (bundled JIT → registry Publishable), three plan revisions (Task 9 sub-path exports, Task 13 linked Changesets, .npmrc peer resolution), convention sync confirmed as unique ecosystem position.

## Open Questions for Next Iteration

1. **shadcn primitive bundling mechanics** — When copying ~19 shadcn components into `packages/studio-ui/src/ui/`, do they need their own Radix peer deps? What's the minimal set actually used by the 91 studio components?

2. **Sub-path export granularity for studio-ui** — Per component (`@sherpa/studio-ui/hub-card`), per domain group (`@sherpa/studio-ui/hub`), or per concern? Trade-off between import convenience and tree-shaking.

3. **AGENTS.md generation from conventions** — Should `sherpa sync` also generate an AGENTS.md from synced `.claude/rules/` files? Bridges Sherpa's format with the 60K-repo cross-tool standard.

4. **Multi-plugin collision policy** — Unresolved from iteration 3. When two plugins contribute catalog entries with the same slug, what happens?

5. **Behavioral agent schema translation fidelity** — Unresolved from iteration 3. How much of the behavioral agent schema survives translation to Claude Code subagent format?
