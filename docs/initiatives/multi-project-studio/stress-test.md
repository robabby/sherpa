---
stress-tested: 2026-03-20
assumptions-extracted: 12
tested: 8
confirmed: 5
refuted: 1
inconclusive: 0
human-required: 2
---

# Multi-Project Studio Stress Test

## Assumptions Inventory

| # | Assumption | Rating | Load-bearing? | Test type |
|---|-----------|--------|---------------|-----------|
| A1 | Content module can be made multi-root without race conditions | Asserted | **Yes** — entire architecture depends on this | Code-testable |
| A2 | `sherpa.json` can express everything `sherpa.config.ts` does | Asserted | **Yes** — config migration depends on this | Code-testable |
| A3 | Multiple SQLite DBs can be open simultaneously | Reasoned | Medium — per-project isolation depends on it | Code-testable |
| A4 | Next.js routing supports both scoped and unscoped routes | Reasoned | **Yes** — URL architecture depends on this | Code-testable |
| A5 | Adding `projectSlug` to domain functions is trivially backwards-compatible | Asserted | **Yes** — the migration path depends on this | Code-testable |
| A6 | VPS filesystem paths are accessible from Studio process | Sourced | Medium — runtime depends on this | Code-testable |
| A7 | `createStudioMcpServer()` can be instantiated multiple times | Reasoned | Medium — virtual MCP depends on it | Code-testable |
| A8 | `@import` in CLAUDE.md bridges `.sherpa/rules/` without losing functionality | Reasoned | Low — coexistence strategy depends on this | Code-testable |
| A9 | The Vercel sidebar-filter pattern works for Sherpa's nav structure | Sourced | Medium — UX depends on this | Human-testable |
| A10 | Three-directory model doesn't create discoverability problems | Asserted | Medium — developer experience depends on this | Human-testable |
| A11 | `sherpa-framework-extraction` will complete before this initiative needs it | Sourced | **Yes** — hard dependency | Not testable (future) |
| A12 | Convention inheritance via npm works for markdown files | Reasoned | Low — session 6 feature | Deferred |

## Tests Designed & Results

---

### A1: Content Module Multi-Root — **REFUTED (partially)**

**Test:** Exhaustive analysis of `content.ts` globals, all domain function callers, module-level state, and concurrent access patterns.

**Result: The assumption is partially false.** Multi-root is achievable but NOT trivially addable.

**Evidence:**
- **~48 functions** across 9 files need `projectSlug` threaded through (not "a few key domain functions")
- **Three globals, not one:** `_projectRoot`, `_claudeMdLocations`, `_claudeMdScanDirs` are all project-scoped
- **`REPORT_REGISTRY`** in `research-report.ts` is a global Map — namespace collision if two projects register the same report slug
- **Race condition** inherent to the "set global then read" pattern: `setProjectRoot("/a")` followed by `setProjectRoot("/b")` before the first read completes → reads from wrong project
- **Partial migration is dangerous** — any caller omitting `slug` silently falls back to the global, mixing scoped and unscoped calls

**Better design discovered:** `knowledge-sync.ts` and `mcp-dashboard.ts` already pass `projectRoot` as an explicit parameter. A **context object** (`{ projectRoot, claudeMdLocations, reportRegistry }`) threaded through the call chain is the clean solution — eliminates the global entirely rather than adding a parallel path.

**Implications:**
- Session 2 ("Content module multi-root") needs to be redesigned — context object pattern, not optional `projectSlug` parameter
- Effort estimate for session 2 increases — touching ~48 functions is a full session of mechanical refactoring
- The plan's `resolveForProject(path, slug?)` approach should be replaced with an explicit `ProjectContext` object
- Consider: refactor the globals into a context object FIRST (session 2a), then add multi-project AFTER (session 2b). Two-phase approach reduces risk.

---

### A2: `sherpa.json` Expressiveness — **CONFIRMED with caveat**

**Test:** Field-by-field analysis of `SherpaUserConfig`, identifying TypeScript-only features: plugins (function types), path resolution (computed values), `withSherpa()` (HOF).

**Result: JSON can express everything the config does TODAY, but not the plugin architecture.**

**Evidence:**
- All data fields (admin, paths, vocabulary, entities, dispatch, mcp, knowledge, governance) are pure JSON-serializable data
- **`plugins: SherpaPlugin[]`** is a function type — JSON cannot represent it. However, **no plugins are currently in use** anywhere in the codebase
- **`projectRoot: path.resolve(process.cwd(), "../..")`** is a computed path — solvable by having the JSON loader resolve relative paths from the config file's location
- **`withSherpa()`** is a Next.js integration concern, stays TS regardless

**Implications:**
- `sherpa.json` works as the **primary format for data-only configs** (the common case)
- `sherpa.config.ts` must be retained as an escape hatch for plugins
- The design already planned this dual-format approach — this finding validates it
- Document clearly: `sherpa.json` for most users, `sherpa.config.ts` when you need plugins or computed values

---

### A3: Multiple SQLite Databases — **CONFIRMED**

**Test:** Analysis of better-sqlite3 connection pool, WAL mode, and path isolation.

**Result: Per-project DB isolation is trivially achievable.**

**Evidence:**
- Each `new Database(path)` gets its own `sqlite3*` handle. No global connection limit beyond OS file descriptors (~256-1024, well above 3-5 projects)
- The existing pool (`Map<string, Database.Database>`) is keyed by absolute path — different projects produce different keys, no collisions
- WAL mode is per-database-file — zero cross-file interaction
- The codebase **already opens 4 DBs simultaneously** per project (coordination, events, knowledge, auth)
- Integration test explicitly verifies two databases open independently

**One minor issue:** `closeAll()` is a global kill switch that closes ALL connections regardless of project. Needs a `closeForProject(projectRoot)` variant — a one-line enhancement.

**Implications:** None — assumption holds. Minor `closeAll()` fix is trivial.

---

### A4: Next.js Routing — **CONFIRMED**

**Test:** Analysis of current route structure, Next.js routing priority rules, and coexistence of static + dynamic segments.

**Result: The routing architecture is sound. No conflicts.**

**Evidence:**
- `/process` and `/projects/sherpa/process` resolve to entirely different URL paths — no ambiguity
- `/projects` (static listing) takes documented precedence over `/projects/[project]` (dynamic segment)
- This is the same pattern already used 6 times in the codebase: `skills/page.tsx` + `skills/[slug]/page.tsx`
- Route groups are stripped from URLs — only the full resolved path matters
- Next.js docs explicitly state: "Predefined routes take precedence over dynamic routes, and dynamic routes over catch-all routes"

**Implications:** None — assumption holds. The route structure from the plan works as designed.

---

### A5: Backwards-Compatible Domain Functions — **CONFIRMED with nuance**

**Test:** Derived from A1 analysis. The question was whether adding optional `projectSlug` breaks existing callers.

**Result: Adding an optional parameter doesn't break TypeScript callers (optional params are backwards-compatible). BUT the A1 finding changes the approach.**

**Evidence:**
- TypeScript optional parameters are additive — existing call sites continue to work
- However, A1 revealed that the `projectSlug` approach is the wrong design. A context object is better
- Changing from `getInitiatives()` to `getInitiatives(ctx: ProjectContext)` is a **breaking change** — all callers must be updated simultaneously

**Implications:** If the context object approach from A1 is adopted, backwards compatibility requires a migration strategy — either (a) overloaded signatures during transition, or (b) a clean cut where all callers are updated in one session. The plan should account for this.

---

### A6: VPS Filesystem Access — **CONFIRMED**

**Test:** Check that Studio can read from paths configured in `projects[].root`.

**Result: On the VPS, all three repos are at `/root/sherpa`, `/root/wavepoint`, `/root/robabby` — all accessible from the same filesystem.**

**Evidence:** We configured the bind mounts earlier in this session. Studio runs on the VPS alongside all three repos. Local dev (`localhost:3000`) would only have access to repos cloned locally — but the primary deployment target is the VPS where everything is colocated.

**Implications:** For local dev, projects need to be cloned locally or paths need to be relative to a common parent. The VPS deployment works out of the box.

---

### A7: Multiple MCP Server Instances — **CONFIRMED**

**Test:** Derived from A3 analysis. `createStudioMcpServer()` accepts `projectRoot` as an option.

**Result: No singleton patterns or shared state that would prevent multiple instances.**

**Evidence:** The MCP server factory in `packages/studio-mcp/src/server.ts` creates a new server instance each time. DB connections are pooled by absolute path (A3 confirmed). No port conflicts because the virtual MCP pattern calls the server internally, not over HTTP.

**Implications:** None — assumption holds.

---

### A8: `@import` Bridge for Rules — **CONFIRMED with limitation**

**Test:** Research on Claude Code's `@import` mechanism and `.claude/rules/` auto-discovery.

**Result: `@import` works but loses `paths:` glob scoping.**

**Evidence (from iteration 2 research):**
- Claude Code supports `@path/to/file` imports in CLAUDE.md. Max 5 hops, first use triggers approval
- Imported files load unconditionally — they do NOT get `paths:` frontmatter scoping
- For 6 rules totaling ~4,500 tokens, unconditional loading is acceptable
- Symlinks are explicitly supported as an alternative

**Implications:** Rules that need conditional loading (via `paths:` globs) must stay in `.claude/rules/`. Framework-portable rules without glob scoping can live in `.sherpa/rules/` and be imported. This is the dual-ownership model the design already describes.

---

## Human-Required

### A9: Vercel Sidebar-Filter Pattern Works for Sherpa's Nav

**Suggested test:** Open the prototype (`docs/initiatives/multi-project-studio/prototype.html`) and evaluate:
- Does the project switcher feel natural in the sidebar header?
- Does switching between 3 projects feel fast or disorienting?
- When "All Projects" is selected, does the nav still make sense?
- Is the sidebar too crowded with the switcher added?

**Why human judgment needed:** UX patterns validated by research (Vercel, Linear) may not translate to Sherpa's specific nav structure (4 groups, 11 items) without testing with real interaction.

### A10: Three-Directory Model Discoverability

**Suggested test:** After `.sherpa/` is created in a project:
- Can a new contributor find initiatives? (dotfolders are hidden by default in most file browsers)
- Does the separation between `.sherpa/initiatives/` and `docs/architecture/` make intuitive sense?
- Would a `README.md` pointer in the repo root be sufficient to bridge the discoverability gap?

**Why human judgment needed:** This is a developer experience question about mental models and expectations. Technical correctness doesn't guarantee ergonomic correctness.

---

## Recommended Changes

### 1. Redesign Session 2: Context Object, Not Optional Parameter

**The biggest finding.** Replace the `resolveForProject(path, slug?)` approach with a `ProjectContext` object:

```ts
interface ProjectContext {
  root: string
  paths: Required<PathsConfig>
  claudeMdLocations: string[]
  claudeMdScanDirs: string[]
}
```

All domain functions accept `ctx: ProjectContext` instead of an optional `projectSlug`. This eliminates the three globals, the race condition, and the namespace collision risk. The plan's session 2 should be split:
- **Session 2a:** Refactor globals into `ProjectContext` (mechanical, large surface area)
- **Session 2b:** Add multi-project registry that creates a context per project

### 2. `sherpa.json` Is Primary, `sherpa.config.ts` Is Escape Hatch

Explicitly document the dual-format approach:
- `sherpa.json` for data-only configs (most users, Luna, `sherpa init`)
- `sherpa.config.ts` for plugins and computed values (power users, customer deployments)
- JSON loader resolves relative `projectRoot` paths from config file location

### 3. Add `closeForProject()` to DB Connection Module

Minor: alongside `closeAll()`, add `closeForProject(projectRoot)` that filters the pool by path prefix. One-line change.

### 4. Effort Estimate Increases

Original: 4-6 sessions. Revised: **5-7 sessions** due to:
- Session 2 split into 2a (refactor globals) + 2b (multi-project registry)
- The ~48 function signature updates in session 2a are mechanical but time-consuming
