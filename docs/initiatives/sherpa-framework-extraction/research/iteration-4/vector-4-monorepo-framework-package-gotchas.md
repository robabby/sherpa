# Vector 4: Monorepo Framework Package Gotchas

**Question:** What are the practical gotchas of developing framework packages inside a consumer's monorepo?
**Agent dispatched:** 2026-03-11

## Findings

### TypeScript Project References vs transpilePackages

- **Project references are NOT needed for JIT internal packages.** The Turborepo blog recommends the JIT pattern (exports pointing to `.ts` source, Next.js transpilePackages handling compilation). Project references are incompatible with Next.js's SWC compiler — SWC ignores `references` and `composite` settings.

- **tsconfig in each package is useful for standalone `pnpm check`** but ignored by Next.js at build time. The web app's tsconfig controls compilation.

- **Project references become useful when graduating to Publishable** — they enable incremental builds and declaration generation. But for JIT, they add complexity with no benefit.

### Peer Dependencies in pnpm Workspaces

- **pnpm does NOT auto-resolve peer deps from the workspace root by default.** Add `resolve-peers-from-workspace-root = true` to `.npmrc` as a safety net. Without this, pnpm may install duplicate versions of peer deps in each package.

- **Existing `pnpm.overrides` for `@types/react`** is correctly preventing type version conflicts. This pattern should be maintained.

- **Strict mode pitfall:** pnpm's default `strict-peer-dependencies = true` can cause install failures if peer version ranges don't match exactly. For workspace packages, this is usually fine since they all share the same root versions.

### The Dual React Problem

- **Low risk during JIT phase.** `transpilePackages` means all code is compiled together as a single unit, so React resolves from the web app's context. No module boundary exists at runtime.

- **Risk increases with pre-built packages.** When packages are compiled with tsup and consumed at runtime with their own `node_modules`, dual React instances can occur. The symptom: "Invalid hook call" errors.

- **Prevention for Publishable phase:** React must be `peerDependency` + `external` in tsup config. Never bundle React into the package output.

### transpilePackages Edge Cases

- **Barrel exports defeat tree-shaking under transpilePackages.** A single barrel `index.ts` that re-exports everything means the entire package is included even if the consumer imports one function. This is a known Next.js limitation.

- **`"use client"` contamination.** Mixing `"use client"` components with server-compatible exports in a single barrel marks EVERYTHING as client-side. `@sherpa/studio-ui` needs sub-path exports, not a single barrel.

- **Fix:** Add `optimizePackageImports: ["@sherpa/studio-ui"]` to `next.config.js`. This enables Next.js's package optimization that handles barrel exports by rewriting imports to direct paths.

- **Turbopack handles transpilePackages less reliably than webpack.** If using `--turbopack` dev server, test thoroughly with workspace packages.

### Local Testing Tools

- **yalc is broken with pnpm >= 7.10.** The `yalc add` command doesn't properly update pnpm's lockfile format. For the JIT phase, `workspace:*` is already optimal — it IS the local testing mechanism.

- **For pre-publish validation:** Use `verdaccio` in CI or `pnpm pack` + `pnpm add ./path-to-tarball` for one-off testing.

- **`pnpm link` has the dual-React footgun** — it creates symlinks that can result in duplicate dependency trees. Avoid for packages with React peer deps.

### Changesets Configuration

- **Use `linked` (not `fixed`) for `@sherpa/*` packages** if you want them to have the same version but only release when individually changed. `fixed` releases ALL packages even if only one changed. `linked` is more appropriate for a framework where packages have different change velocities.

- **`workspace:*` auto-converts to exact semver during `pnpm publish`.** pnpm handles this natively — Changesets doesn't need to know about workspace protocol.

- **Key gotcha:** If a changeset mentions both an `ignore`d and non-ignored package, publishing fails. Add the web app and content package to the `ignore` list:
  ```json
  "ignore": ["web", "@wavepoint/content"]
  ```

### Build Tooling

- **tsup is effectively unmaintained.** The successor is **tsdown** (ESM-only output, esbuild-based). However, tsup still works fine and has wider ecosystem support.

- **Don't invest in build tooling until removing `"private": true`.** The JIT phase needs zero build step. When ready: tsdown or tsup (ESM + CJS) + `isolatedDeclarations` for fast type generation.

- **Use `publishConfig.exports` in `package.json`** to switch from source to dist during publish while keeping JIT dev paths. pnpm reads `publishConfig` during `pnpm publish` and overlays it onto the manifest:
  ```json
  {
    "exports": { ".": "./src/index.ts" },
    "publishConfig": {
      "exports": { ".": { "import": "./dist/index.js", "types": "./dist/index.d.ts" } }
    }
  }
  ```

## Sources

- [Turborepo internal packages](https://turborepo.dev/docs/core-concepts/internal-packages) — JIT/Compiled/Publishable
- [Turborepo blog: internal packages](https://turborepo.dev/blog/you-might-not-need-typescript-project-references) — Why project references aren't needed
- [pnpm .npmrc docs](https://pnpm.io/npmrc) — resolve-peers-from-workspace-root
- [pnpm publishConfig](https://pnpm.io/package_json#publishconfig) — Overlay during publish
- [Next.js transpilePackages](https://nextjs.org/docs/app/api-reference/config/next-config-js/transpilePackages) — Config docs
- [Next.js optimizePackageImports](https://nextjs.org/docs/app/api-reference/config/next-config-js/optimizePackageImports) — Barrel export optimization
- [Changesets fixed mode](https://github.com/changesets/changesets/blob/main/docs/fixed-packages.md) — Synchronized versioning
- [Changesets linked mode](https://github.com/changesets/changesets/blob/main/docs/linked-packages.md) — Linked versioning
- [tsup docs](https://tsup.egoist.dev/) — TypeScript bundler
- [tsdown](https://github.com/nicolo-ribaudo/tsdown) — tsup successor
- [yalc](https://github.com/wclr/yalc) — Local package testing (broken with pnpm 7.10+)
- [verdaccio](https://verdaccio.org/) — Local npm registry

## Raw Links

- https://turborepo.dev/docs/core-concepts/internal-packages
- https://turborepo.dev/blog/you-might-not-need-typescript-project-references
- https://pnpm.io/npmrc
- https://pnpm.io/package_json#publishconfig
- https://nextjs.org/docs/app/api-reference/config/next-config-js/transpilePackages
- https://nextjs.org/docs/app/api-reference/config/next-config-js/optimizePackageImports
- https://github.com/changesets/changesets/blob/main/docs/fixed-packages.md
- https://github.com/changesets/changesets/blob/main/docs/linked-packages.md
- https://tsup.egoist.dev/
- https://github.com/nicolo-ribaudo/tsdown
- https://github.com/wclr/yalc
- https://verdaccio.org/
- https://pnpm.io/workspaces

## Implications

**For Tasks 6-8 (remaining core extraction):**
1. No project references needed. JIT + transpilePackages is correct.
2. Add `resolve-peers-from-workspace-root = true` to `.npmrc` as safety.

**For Task 9 (UI extraction):**
1. **Critical:** Do NOT use a single barrel export for `@sherpa/studio-ui`. Use sub-path exports per component or component group. A single barrel defeats tree-shaking AND contaminates server/client boundaries.
2. Add `optimizePackageImports: ["@sherpa/studio-ui"]` to `next.config.js`.

**For Task 13 (publishing pipeline):**
1. Use `linked` mode in Changesets (not `fixed`).
2. Use `publishConfig.exports` to maintain JIT dev paths while shipping compiled dist.
3. Skip yalc — broken with modern pnpm. Use `pnpm pack` for pre-publish validation.
4. Don't invest in build tooling until ready to publish. tsup is fine when the time comes.

## Open Questions

1. Should `@sherpa/studio-ui` use sub-path exports per component (`@sherpa/studio-ui/hub-card`) or per domain group (`@sherpa/studio-ui/hub`, `@sherpa/studio-ui/process`)?
2. Is `optimizePackageImports` sufficient to solve the barrel export problem, or are sub-path exports necessary regardless?
3. When transitioning to Publishable, should we use `isolatedDeclarations` (requires explicit return types on all exports) or standard tsc declaration generation?
