---
type: decision-brief
date: 2026-03-11
initiative: sherpa-framework-extraction
source-iterations: [1, 2, 3]
---

# Sherpa Framework Extraction — Decision Brief

## The Decision

Should Phase 2 execution begin — extracting `@sherpa/studio-core` into a standalone package within the source monorepo — or does the research need another iteration?

## What the Research Established

Three iterations across 13 research vectors produced a complete architectural blueprint. The convergence is unusually strong: every concern independently pointed to the same reference model (Payload CMS), and the extraction target is cleaner than most refactoring projects. Key numbers:

- **21 lib files, zero circular dependencies.** The dependency graph is a clean DAG with 8 leaf nodes (per iteration 2, vector 3). Only 1 external import across the entire lib layer (`file-tree.ts` → `@/lib/content-urls`, trivially injectable).
- **91 of 96 UI components are domain-agnostic.** The 5 coupled components all import from `@/lib/transit-content` — WavePoint-specific dashboards, easily excluded (per iteration 2, vector 3).
- **Only 2 runtime dependencies**: `zod` and `gray-matter`. Everything else is Node stdlib or Next.js guards.
- **Payload CMS confirmed as the architectural template across all 4 iteration-3 concerns**: API pattern (`createStudio(config)` as singleton), plugin system (config spreading), environment portability (strip `server-only` from core), and testing (per-package vitest with `__fixtures__/`).

The three-channel distribution architecture is settled (per iteration 1 synthesis):

| Channel | Mechanism | Confidence |
|---------|-----------|------------|
| Code (lib + UI + MCP) | npm packages (`@sherpa/studio-*`) | Very high — standard tooling |
| Executable conventions (skills, hooks) | Claude Code plugin marketplace | High — plugin system exists |
| Prose conventions (rules, roles, templates) | `sherpa sync` CLI with three-way merge | Medium — ecosystem gap, must build |

## Options

### Option A: Begin Core Extraction Now

Start Phase 2 execution for `@sherpa/studio-core` only. Follow the 5-phase dependency DAG: foundation leaves → schemas/parsing → empty catalog registries → I/O layer → composites. Package lives in the source monorepo as a JIT internal package.

**Evidence for:**
- All 10 original open questions across 3 iterations are answered with sourced solutions (per iteration 3 synthesis).
- The extraction plan (`plan.md`) already exists with file-by-file moves and task breakdown.
- The lib layer has zero coupling to consumer domain logic — extraction is mechanical, not architectural.
- JIT internal packages (the `@wavepoint/content` pattern) require zero build step. Low risk to start.
- `behavioral-agents` initiative is running in parallel and will scaffold the Sherpa codebase — but core extraction doesn't need Sherpa to exist yet.

**Evidence against:**
- 4 open questions remain from iteration 3: sync vs async API, behavioral agent schema translation, multi-plugin collision policy, directory convention portability.
- Studio is still maturing (morning review UX, some routes still evolving). Premature extraction could lock in wrong boundaries.
- The `server-only` removal and `createStudio(config)` API are designed but not prototyped.

**Effort:** 3-4 sessions (core extraction) + 1-2 sessions (testing + validation).

### Option B: One More Research Iteration

Address the 4 remaining open questions before executing. Focus on sync vs async API (the only question that could force a rearchitecture) and directory convention portability (affects config design).

**Evidence for:**
- The sync vs async question is the highest-risk open item. Current implementation is sync (`readFileSync`). Keystatic and Payload are both async. If Sherpa goes async later, every consumer call site changes.
- Directory convention portability directly impacts the `paths:` config section — getting this wrong means a breaking config change.

**Evidence against:**
- Research produces diminishing returns after iteration 3. The remaining questions are implementable decisions, not research blockers.
- Sync vs async can be decided during extraction — start sync (matching current behavior), add async wrapper later.
- Directory portability is a config concern that can evolve with semver.

**Effort:** 1 session (research) + 3-4 sessions (delayed extraction).

### Option C: Extract Core + Prototype `createStudio()` in Same Phase

Begin extraction and use the first task (package scaffolding + foundation leaves) as a proving ground for the `createStudio(config)` API. The 4 open questions become implementation decisions resolved by the code, not by more research.

**Evidence for:**
- "Remove, don't abstract" was the consistent finding across iteration 3 vectors. The simplest approach (start sync, parameterize root path, strip `server-only`) was always what the reference frameworks actually did.
- The JIT internal package pattern means no npm publishing, no build step, no breaking changes to external consumers. If the API shape is wrong, change it before graduating to Publishable.
- Working code resolves design ambiguity faster than more research documents.

**Evidence against:**
- Higher session count than pure extraction because the API design work happens concurrently.

**Effort:** 4-5 sessions (extraction + API prototyping + testing).

## Recommendation

**Option C: Extract + prototype concurrently.** The research is at the point of diminishing returns — three iterations, 13 vectors, and the remaining open questions are judgment calls that working code resolves better than more documents. The JIT internal package strategy provides a safety net: nothing is published, nothing is consumed externally, and the the source monorepo itself validates the package boundaries.

The critical path is:
1. Scaffold `packages/studio-core/` as JIT internal package (task 1 from plan.md)
2. Extract foundation leaves (8 files, zero deps) — validates the package boundary
3. Implement `createStudio(config)` with sync methods (matching current behavior)
4. Extract remaining layers following the 5-phase DAG
5. Write integration tests with `__fixtures__/` directory
6. Decide async migration as a separate, future concern

The sync vs async question specifically: start sync. Keystatic's reader API began sync and migrated to async when they added the GitHub backend. Sherpa has no remote backend planned. If one emerges, the migration from sync to async is mechanical (add `await`, change return types). The reverse — designing for async now without a use case — adds complexity to every consumer call site for a hypothetical future.

## What We'd Lose

- **By not doing another research iteration**: The sync vs async and collision policy decisions are made by the implementer during extraction rather than pre-researched. The implementer has access to all 13 vector reports and can reference them. Risk is low because JIT packages aren't published — decisions can be revised before npm graduation.
- **By extracting before Studio fully matures**: Some API boundaries might need revision. Mitigation: the JIT phase exists precisely for this. Internal packages within the monorepo can have breaking changes freely. The graduation to Publishable (tsup + Changesets) is the point of no return, not the extraction itself.
- **By prototyping the API during extraction**: Session count increases by ~1 session. But this session would be spent eventually regardless, and concurrent work reduces total calendar time.
