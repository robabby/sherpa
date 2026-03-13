---
started: 2026-03-11
worktree: null
---

# Sherpa Framework Extraction — Activity Log

## 2026-03-12 — Migrated to Sherpa

- Initiative migrated from WavePoint with full research tree (4 iterations, 18 vectors, 4 branches, 3 deliverables, 1 sub-initiative)
- References adapted: WavePoint paths → Sherpa package paths, possessives cleaned up
- Extraction itself is substantially complete — packages exist in the Sherpa monorepo

## 2026-03-11 — Research Iteration 4

- Dispatched 4 vectors: shadcn/ui extraction, sync vs async API, convention ecosystem, monorepo gotchas
- Sync vs async: RESOLVED — ship sync v1. content.ts is the I/O boundary; future async migration is mechanical
- shadcn/ui: Plate is the model (npm for logic, registry for UI). JIT: bundle primitives. Publishable: @sherpa registry namespace.
- Convention ecosystem: Layer 4 (governance with provenance + three-way merge) still vacant
- Monorepo: barrel exports defeat tree-shaking — studio-ui needs sub-path exports. Use Changesets linked (not fixed).
- Three plan revisions identified for Tasks 9, 13, and .npmrc

## 2026-03-11 — Research Iteration 3

- Dispatched 4 vectors: createStudio API, catalog registration, server-only portability, standalone testing
- createStudio(config): nested namespace API (13 groups), module-scope singleton. Keystatic/Prisma/Stripe pattern.
- Catalog registration: config-based (Payload spreading), not imperative (Backstage)
- server-only: THROWS in Node.js/Bun — strip from core entirely (Payload model)
- Cross-vector convergence: Payload is the architectural template across ALL concerns

## 2026-03-11 — Research Iteration 2

- Dispatched 4 vectors: convention sync CLI, config entrypoint, extraction dependency graph, npm publishing
- Convention sync: `node-diff3` for three-way merge, manifest schema, `.local.md` additive pattern
- Config: complete TypeScript types for `defineConfig()` + `withSherpa()`
- Extraction graph: 21 lib files, clean DAG, zero circular deps, 8 leaf nodes
- Component audit: 91/96 components domain-agnostic
- Key finding: Phase 2 (extraction plan) is unblocked

## 2026-03-11 — Research Iteration 1

- Dispatched 5 vectors: framework extraction patterns, convention portability, white-label UI, cross-project sync, MCP distribution
- Three-channel distribution architecture established
- Payload CMS identified as closest architectural analog
- Convention sync identified as the hardest unsolved problem
- Proposed package split: `@sherpa/studio-core`, `-ui`, `-mcp`, `-cli`
