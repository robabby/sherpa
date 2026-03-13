# Vector 4: Standalone Testing Strategy for Extracted Packages

**Question:** How should `@sherpa/studio-core` be tested in isolation, outside the Next.js app context?
**Agent dispatched:** 2026-03-11

## Findings

### 1. Payload CMS Test Setup

- **Migrated Jest to Vitest** via [PR #10200](https://github.com/payloadcms/payload/pull/10200). Root `vitest.config.ts` defines two projects: `unit` (runs `packages/**/*.spec.ts`) and `int` (runs `test/**/*int.spec.ts`).
- **Unit tests live inside packages**, co-located with source. Example: `packages/payload-cloud/src/email.spec.ts`, `packages/create-payload-app/src/lib/manage-env-files.spec.ts`.
- **Filesystem-touching tests use real temp directories**, not memfs. `manage-env-files.spec.ts` creates temp dir via `os.tmpdir()`, writes real files, cleans up in `afterEach`.
- **No `server-only` handling in vitest config** — Payload doesn't use `server-only` in its packages. `PAYLOAD_DISABLE_ADMIN = 'true'` env var sidesteps the Next.js admin UI during tests.
- **Per-package tests run without per-package vitest configs.** Root config's `{ include: ['packages/**/*.spec.ts'], name: 'unit', environment: 'node' }` catches everything.

### 2. Backstage Plugin Testing

- **Backstage uses shared Jest config** provided by `@backstage/cli` at `packages/cli/config/jest.js`. Individual packages call `backstage-cli package test`.
- **Entity validation tests use inline fixture objects**, not filesystem fixtures. `ComponentEntityV1alpha1.test.ts` constructs entity objects in `beforeEach` and validates them.
- **Backend plugin tests use dependency injection** via `startTestBackend()` from `@backstage/backend-test-utils`. Mock services injected for database, config, logger, HTTP router — 18 services total.
- **No snapshot testing for catalog entities.** Validates structure through schema validators and assertion-based tests.

### 3. Fixture-based Filesystem Testing

Three dominant patterns:

**Pattern A: `memfs` + `vi.mock('node:fs')`** — Vitest's [official recommendation](https://vitest.dev/guide/mocking/file-system). Create `__mocks__/fs.cjs` that re-exports memfs. Use `vol.fromJSON()` to populate fixtures, `vol.reset()` in `afterEach`.

**Pattern B: Real temp directories** — Payload's approach. `os.tmpdir()` + random suffix, write real files, clean up after. No mocking required. Slower but simpler.

**Pattern C: Dependency injection of `readFile`** — Pass `FileSystem` interface as parameter. Cleanest for unit testing but requires refactoring module API.

**For `@sherpa/studio-core`:** The `readMonorepoFile` function in `content.ts` is already a natural injection point. Making the root path configurable plus optionally accepting a read function makes Pattern C trivial.

### 4. Vitest Workspace/Project Config for Monorepo

- **Vitest 3 deprecated `workspace` in favor of `projects`** in root `vitest.config.ts`.
- **Two viable strategies:**
  1. **Root config with projects array** (Payload): `projects: [{ include: ['packages/**/*.spec.ts'], name: 'unit' }]`. ~30% faster.
  2. **Per-package `vitest.config.ts`** using `defineProject()`: More isolation, more files.
- **Path aliases**: Package should use relative imports only (no `@/` aliases), which is correct for a publishable package.
- **JIT vs publishable affects nothing for tests**: Tests always run against source via vitest.

### 5. Mocking `server-only` in Tests

- **The existing web app already solves this** with `resolve.alias` in `vitest.config.ts`:
  ```ts
  resolve: { alias: { "server-only": path.resolve(__dirname, "./__tests__/server-only-stub.ts") } }
  ```
  The stub contains `export {}`.
- **The extracted package should remove `server-only` entirely.** Once extracted from Next.js, the guard is meaningless — package runs in Node.js only. WavePoint adds guard at its re-export layer.
- **If must remain**: `vi.mock("server-only", () => ({}))` works per-test or in setup file.

### 6. Snapshot Testing for Governance Data

- **Backstage does NOT use snapshot testing for catalog entities.** Uses explicit assertion-based validation.
- **`toMatchInlineSnapshot()`** better for small parsed objects — expected output visible in test file.
- **Snapshot testing for parsed frontmatter/markdown is fragile.** Outputs depend on whitespace, ordering, optional fields. Explicit assertions more maintainable.
- **Exception**: Snapshot testing IS appropriate for stable markdown rendering (e.g., `extractSections()` output).

### 7. Integration vs Unit Test Boundary

The existing test file demonstrates the right split:
- **Lines 1-213: Pure unit tests** — `parseFrontmatter`, `extractTitle`, `parseMarkdownTable`. String input → structured output. No filesystem.
- **Lines 215-283: Integration tests** — `getInitiatives()`, `getConventions()`. Read real monorepo filesystem.

**Recommended boundary:**

| Layer | Tests | Strategy |
|-------|-------|----------|
| Parse functions (`markdown.ts`, `schemas.ts`) | Unit tests with string input | No mocking needed |
| Data readers (`content.ts`, `file-tree.ts`, `tasks.ts`) | Integration tests with fixture directory | Committed `__fixtures__/` |
| Git operations (`velocity.ts`) | Unit tests with mocked `execSync` | `vi.mock('node:child_process')` |
| Full pipeline (barrel functions) | Integration tests with fixture directory | Same `__fixtures__/` |

## Implications

1. **Remove `import "server-only"` from all 7 files.** Package is Node.js library. WavePoint adds guard at re-export boundary.

2. **Make root path injectable.** `content.ts` already has `CACHE_ROOT` from `process.cwd()`. Accept root path via config, defaulting to existing behavior. Enables tests to point at `__fixtures__/`.

3. **Create `__fixtures__/` directory** with minimal monorepo-like structure: `docs/initiatives/` with 2-3 dirs, `docs/roadmap.md`, `.claude/rules/` with sample rules, `docs/tasks/`. ~20 files total.

4. **Per-package vitest config:**
   ```ts
   import { defineConfig } from 'vitest/config'
   export default defineConfig({
     test: { include: ['src/**/*.test.ts'], environment: 'node' },
   })
   ```

5. **Split tests into two files:**
   - `src/__tests__/parse.test.ts` — Pure parsing (no changes needed)
   - `src/__tests__/read.test.ts` — Integration tests pointing at `__fixtures__/`

6. **Mock `child_process` for velocity tests** using `vi.mock('node:child_process')` with canned output.

7. **No snapshot tests for parsed governance data.** Use explicit assertions. Consider inline snapshots only for stable markdown rendering tests.

## Sources

**Payload CMS:**
- [Payload CLAUDE.md](https://github.com/payloadcms/payload/blob/main/CLAUDE.md)
- [Payload vitest.config.ts](https://github.com/payloadcms/payload/blob/main/vitest.config.ts)
- [manage-env-files.spec.ts](https://github.com/payloadcms/payload/blob/main/packages/create-payload-app/src/lib/manage-env-files.spec.ts)
- [PR #10200: Replace jest with vitest](https://github.com/payloadcms/payload/pull/10200)

**Backstage:**
- [Backend testing docs](https://backstage.io/docs/backend-system/building-plugins-and-modules/testing/)
- [ComponentEntityV1alpha1.test.ts](https://github.com/backstage/backstage/blob/master/packages/catalog-model/src/kinds/ComponentEntityV1alpha1.test.ts)
- [Backstage CLI Jest config](https://github.com/backstage/backstage/blob/master/packages/cli/config/jest.js)
- [Frontside: Testing Backstage Catalog](https://frontside.com/blog/2022-03-24-testing-backstage-catalog-ingestors/)

**Vitest:**
- [Vitest test projects guide](https://vitest.dev/guide/projects)
- [Vitest file system mocking guide](https://vitest.dev/guide/mocking/file-system)
- [Vitest snapshot guide](https://vitest.dev/guide/snapshot)
- [Vitest 3 Monorepo Setup](https://www.thecandidstartup.org/2025/09/08/vitest-3-monorepo-setup.html)

**Other:**
- [Kevin Schaul: Mock fs with vitest and memfs](https://kschaul.com/til/2024/06/26/mock-fs-with-vitest-and-memfs/)
- [Next.js issue #60038: server-only with Vitest](https://github.com/vercel/next.js/issues/60038)
- [DEV Community: Testing File System Code](https://dev.to/rezmoss/testing-file-system-code-mocking-stubbing-and-test-patterns-99-1fkh)
- [Turborepo internal packages](https://turborepo.dev/docs/core-concepts/internal-packages)

## Raw Links

- https://github.com/payloadcms/payload/blob/main/CLAUDE.md
- https://github.com/payloadcms/payload/blob/main/vitest.config.ts
- https://github.com/payloadcms/payload/blob/main/packages/create-payload-app/src/lib/manage-env-files.spec.ts
- https://github.com/payloadcms/payload/pull/10200
- https://github.com/payloadcms/payload/discussions/2644
- https://backstage.io/docs/plugins/testing/
- https://backstage.io/docs/backend-system/building-plugins-and-modules/testing/
- https://backstage.io/docs/frontend-system/building-plugins/testing/
- https://github.com/backstage/backstage/blob/master/packages/catalog-model/src/kinds/ComponentEntityV1alpha1.test.ts
- https://github.com/backstage/backstage/blob/master/packages/cli/config/jest.js
- https://frontside.com/blog/2022-03-24-testing-backstage-catalog-ingestors/
- https://vitest.dev/guide/projects
- https://vitest.dev/guide/mocking/file-system
- https://vitest.dev/guide/snapshot
- https://vitest.dev/guide/mocking
- https://vitest.dev/config/
- https://www.thecandidstartup.org/2025/09/08/vitest-3-monorepo-setup.html
- https://www.npmjs.com/package/memfs
- https://kschaul.com/til/2024/06/26/mock-fs-with-vitest-and-memfs/
- https://github.com/vitest-dev/vitest/discussions/1658
- https://github.com/vercel/next.js/issues/60038
- https://dev.to/rezmoss/testing-file-system-code-mocking-stubbing-and-test-patterns-99-1fkh
- https://gist.github.com/joemaller/f9171aa19a187f59f406ef1ffe87d9ac
- https://github.com/vitest-dev/vitest/discussions/2075
- https://github.com/leonsilicon/vitest-mock-process
- https://turborepo.dev/docs/core-concepts/internal-packages
- https://turborepo.dev/docs/guides/tools/vitest
- https://vercel.com/academy/production-monorepos/set-up-vitest

## Open Questions

1. **`FileSystem` interface vs root path string?** Root path is simpler and sufficient. Full DI is over-engineering at this scale.
2. **How should `__fixtures__/` stay in sync** with real monorepo structure changes? Manual maintenance is simplest.
3. **Should `velocity.ts` be a separate sub-module** with its own adapter interface?
4. **What about non-WavePoint projects** with different directory conventions? `readMonorepoFile` hardcodes paths like `docs/initiatives/`. Config/vocabulary must address this.
5. **`gray-matter` and `zod` as deps or peerDeps?** `zod` should be peerDep (consumers have it), `gray-matter` direct dep (specialized).
