---
status: pending
initiative: deploy-to-wavepoint
created: 2026-03-16
updated: '2026-03-16'
type: new-plan
risk: structural
targets:
  - packages/studio-core/src/index.ts
  - packages/studio-core/src/content.ts
  - packages/studio-core/package.json
  - packages/studio-ui/package.json
  - packages/studio-mcp/package.json
  - packages/studio/package.json
  - packages/studio/src/index.ts
  - packages/studio-core/src/config/next-wrapper.ts
  - packages/studio-core/src/config/types.ts
dependencies:
  - sherpa-framework-extraction
informs:
  - client-deployment-pipeline
  - byoai-convention-first
  - zero-to-one-experience
spawned-from: sherpa-framework-extraction
personas:
  - engineer
---

# Deploy to WavePoint

## Summary

Make `@sherpa/studio-*` packages consumable by WavePoint as library dependencies, replacing WavePoint's local Studio implementation (`src/lib/studio/` and `src/components/studio/`). This validates the library-mode consumption pattern — WavePoint imports Sherpa packages, keeps its domain-specific panels locally, and wires its own Next.js routes. This is the first real proof that the framework extraction actually works for an external consumer.

## State Snapshot

**Sherpa packages (current):**
- `@sherpa/studio-core` — 27 modules, exports TypeScript source via sub-path exports (no build step, no dist/). Root `index.ts` re-exports `content.ts` which imports `fs`/`path`/`process.cwd()` — **any root import pulls Node.js APIs into client bundles**. `better-sqlite3` dependency exists but db module is NOT re-exported from root (safe).
- `@sherpa/studio-ui` — 112 components (120 .tsx files), 75 marked `"use client"`. Imports `@sherpa/studio-core` via proper package imports (not relative paths). `tsconfig.json` sets `noEmit: true` — no compiled output, source-only distribution via `transpilePackages`.
- `@sherpa/studio-mcp` — MCP server with task/knowledge/authority tools. Self-contained, clean dependency on studio-core.
- `@sherpa/studio` — Umbrella re-export of core + ui. Sub-paths: `./config` (defineConfig), `./next` (withSherpa).
- All four packages are `private: true` in package.json — not publishable.

**`withSherpa()` (current):** Only adds three packages to `transpilePackages`. No route injection, no environment setup, no config wiring. Located at `packages/studio-core/src/config/next-wrapper.ts`.

**WavePoint Studio (current):**
- 96 components in `apps/web/src/components/studio/` — 88 are direct name-matches with Sherpa equivalents. 8 are domain-specific (transit content pipeline, primitives catalog, coverage timeline).
- 20 library modules in `apps/web/src/lib/studio/` — 15 match Sherpa studio-core modules. 5 are domain-specific (api-catalog, api-endpoints, primitives-catalog, primitives, mcp).
- Routes under `/app/studio/*` include 12 pages — all wired to local imports.
- No `@sherpa/*` dependencies in package.json. No `withSherpa()` in next.config.
- Supabase-backed transit content pipeline (domain-specific, not touched by this initiative).

**Overlap validation:**
- 91.7% component extraction rate (88 of 96 WavePoint components exist in Sherpa)
- 75% library module extraction rate (15 of 20 WavePoint modules exist in Sherpa)
- 32 components exist only in Sherpa (added post-extraction: missions, workflow canvas, dispatch)
- Import patterns are compatible — WavePoint uses `@/components/studio/X`, Sherpa exports as `@sherpa/studio-ui/X`

## Proposed Changes

### 1. Fix server/client module boundary (studio-core)

The root blocker: `packages/studio-core/src/index.ts` re-exports `content.ts` which imports `fs`, `path`, and calls `process.cwd()`. Any consumer importing from `@sherpa/studio-core` (without sub-path) gets Node.js APIs in their client bundle.

**Change:** Split studio-core exports into server-safe and client-safe entry points:
- `@sherpa/studio-core` — client-safe: types, schemas, lifecycle, tokens, patterns, dispatch-meta (pure modules only)
- `@sherpa/studio-core/server` — server-only: content, file-tree, doc-tree, domain, velocity, process-nodes, deliverables, research-report, config (modules that touch fs)
- Sub-path imports (`@sherpa/studio-core/types`, etc.) remain unchanged

This is the minimal change. The 12+ modules that import from `content.ts` all run server-side anyway — they just need to not be pulled into the client bundle via the root export.

### 2. Remove `private: true` and establish consumption path (all packages)

Remove `private: true` from all four package.json files. Two viable distribution strategies:

- **Git dependency** (immediate): `"@sherpa/studio-core": "github:sherpa-consulting/sherpa#packages/studio-core"` — works with pnpm, no registry needed
- **npm publish** (later): Standard registry publication, gated by versioning strategy

Git dependency is sufficient for WavePoint as first consumer. npm publish can follow when there's a second consumer or when versioning matures.

### 3. Strengthen `withSherpa()` (studio-core config)

Current wrapper only adds `transpilePackages`. For WavePoint, it also needs to:
- Merge `serverExternalPackages` (add `better-sqlite3` if db features used)
- Preserve consumer's existing `outputFileTracingExcludes`
- Accept the `sherpaConfig` object to wire `setProjectRoot()` at build time

This keeps the "one function call" integration story: `withSherpa(nextConfig, sherpaConfig)`.

### 4. Document the library-mode integration contract

Create `packages/studio/README.md` (the umbrella package) documenting:
- Which imports are client-safe vs server-only
- Peer dependency requirements (WavePoint already has most)
- The `sherpa.config.ts` + `withSherpa()` setup pattern
- How to keep domain-specific components local while using Sherpa's shared components

### 5. Validate on WavePoint (proof branch)

Create a branch on WavePoint that:
- Adds `@sherpa/studio-*` as git dependencies
- Replaces 88 component imports with `@sherpa/studio-ui` equivalents
- Replaces 15 lib/studio module imports with `@sherpa/studio-core` equivalents
- Keeps 8 domain-specific components and 5 domain-specific modules local
- Wraps next.config with `withSherpa()`
- Verifies: `pnpm build` succeeds, no fs in client bundle, all Studio routes render

## Rationale

**Library mode over framework mode:** WavePoint has significant domain-specific UI (transit content pipeline, primitives catalog, astrology visualizations) that can't be generalized. A framework-mode approach (Sherpa provides the app shell, consumers plug in panels) would require an extension/plugin architecture that's premature at this stage. Library mode — WavePoint imports components and logic, wires its own routes — is simpler, more flexible, and validates the package boundaries without new infrastructure.

**Server/client split over tree-shaking hopes:** Next.js tree-shaking for `transpilePackages` is unreliable across module boundaries. An explicit server/client split in the exports map is deterministic and self-documenting. Consumers know exactly which imports are safe where.

**Git deps over npm publish:** WavePoint and Sherpa share a developer (Rob). The overhead of npm versioning, changelogs, and release automation isn't justified for a single consumer. Git deps give WavePoint a pinnable commit hash with zero registry infrastructure.

## Dependencies

- **`sherpa-framework-extraction`** (in-progress) — the packages must be stable enough to consume. The extraction initiative established the package boundaries; this initiative validates them from the consumer side.

## Review Notes

**Edge cases:**
- WavePoint's `next.config.js` uses `outputFileTracingExcludes` for Studio routes to avoid Vercel timeout. `withSherpa()` must merge, not replace, these excludes.
- WavePoint has a renamed component: `studio-header.tsx` vs Sherpa's `studio-shell-header.tsx`. The proof branch needs to handle this explicitly.
- WavePoint's `hub-portfolio-panel.tsx` and `hub-api-panel.tsx` exist in both codebases — need to verify they're semantically identical or note divergence.

**Open questions:**
- Should WavePoint consume `@sherpa/studio` (umbrella) or the individual packages? Umbrella is simpler but creates a single large dependency. Individual packages give finer control. Recommend starting with umbrella for simplicity.
- How does Sherpa's `setProjectRoot()` interact with WavePoint's Vercel deployment? The project root on Vercel is different from local dev. `withSherpa()` needs to handle this.

**Effort:** 4-5 sessions

**Session breakdown:**
- Session 1: Server/client split in studio-core exports, fix content.ts leakage
- Session 2: Remove private flags, strengthen withSherpa(), write integration docs
- Session 3: WavePoint proof branch — replace imports, wire config
- Session 4: WavePoint proof branch — verify build, test all routes, fix edge cases
- Session 5 (if needed): Address issues surfaced by the proof branch
