# Vector 3: `server-only` Portability & Environment Strategy

**Question:** How should `@sherpa/studio-core` handle `server-only` imports and filesystem access for non-Next.js environments?
**Agent dispatched:** 2026-03-11

## Findings

### 1. How `server-only` Actually Works

- **The entire package is 3 files.** `package.json`, `index.js` (throws an error), and `empty.js` (literally empty).
- **The mechanism is `react-server` conditional exports.** The `package.json` exports: `{ ".": { "react-server": "./empty.js", "default": "./index.js" } }`. When a bundler sets the `react-server` condition, import resolves to empty file. Otherwise, it resolves to `index.js` which throws. ([Nico's Blog](https://www.nico.fyi/blog/server-only-package), [React RFC #227](https://github.com/reactjs/rfcs/blob/main/text/0227-server-module-conventions.md))
- **Critical: `server-only` THROWS in plain Node.js and Bun.** Without the `react-server` condition active, importing `server-only` hits the throwing `index.js`. Any `@sherpa/studio-core` module that includes it will crash in Node.js scripts, Bun, CLI tools, and MCP servers.
- **Workaround exists but terrible DX**: `node --conditions react-server script.js` / `bun --conditions="react-server" script.js`. Requiring runtime flags for every consumer is unacceptable.

### 2. Payload CMS Environment Portability

- **Payload uses package-level separation, not conditional exports.** Core `payload` package is fully portable (Local API only, works in any Node.js environment). `@payloadcms/next` is the Next.js-specific adapter. ([Payload Blog](https://payloadcms.com/posts/blog/payload-30-the-first-cms-that-installs-directly-into-any-nextjs-app), [Payload Docs: Outside Next.js](https://payloadcms.com/docs/local-api/outside-nextjs))
- **Payload's core `package.json` does NOT use `react-server` conditions.** No `server-only` dependency at all. The `@payloadcms/next` package has `next` as a peer dependency but also doesn't use `react-server` conditional exports.
- **Payload's adapter pattern for DB is the model.** Database adapters (`mongooseAdapter()`, `postgresAdapter()`) are injected via `buildConfig()`. Dependency injection through configuration, not conditional imports.
- **Payload provides `payload run` to execute standalone scripts** with proper environment variable loading.

### 3. Keystatic Environment Strategy

- **Keystatic uses the most sophisticated conditional exports found.** Every export path has 5 conditions: `types`, `node > react-server`, `node > default`, `react-server`, `worker`, `default`. Different bundles for every combination.
- **Keystatic uses `#imports` (Node.js subpath imports) for internal conditional modules.** `#api-handler` resolves to `./src/api/api-node.ts` in Node.js and `./src/api/api-noop.ts` elsewhere. `#webcrypto` resolves to Node's native crypto or WebCrypto API. Package-internal conditional exports.
- **Keystatic's `createReader` uses a `MinimalFs` abstraction**: `{ readFile(path): Promise<Uint8Array | null>; readdir(path): Promise<DirEntry[]>; fileExists(path): Promise<boolean> }`. Local reader wraps `fs/promises`. GitHub reader wraps GitHub API. All core logic operates on `MinimalFs`. ([Keystatic Reader API](https://keystatic.com/docs/reader-api), [Source: reader/generic.ts](https://raw.githubusercontent.com/Thinkmill/keystatic/main/packages/keystatic/src/reader/generic.ts))
- **Keystatic does NOT use `server-only`.** Multi-environment strategy relies entirely on conditional exports and subpath imports. "The reader API code is meant to run on the server" is documentation, not a build guard.

### 4. Conditional Exports in package.json

- **Condition resolution: first match wins.** Custom conditions like `react-server` must appear BEFORE built-in defaults (`import`, `require`, `default`).
- **Default conditions vary by tool.** Node.js: `node, import, require, default`. Vite: `import, require, default, module, browser, production/development`. esbuild: `import, require, default, browser, node, module`.
- **Custom conditions are disabled by default.** `react-server` is NOT built-in — must be explicitly enabled by bundler. Next.js sets it automatically for RSC builds.
- **Nested conditions supported**: `"node": { "react-server": "./a.js", "default": "./b.js" }` — Keystatic uses extensively.
- **`"next"` is NOT a standard condition.** No built-in support in Next.js bundler.

### 5. tsup and `server-only`

- **tsup externalizes `dependencies` and `peerDependencies` by default.** If `server-only` is a dep, tsup won't bundle it.
- **Right approach: list as `peerDependency` with `optional: true`, then use conditional exports.** Or simply don't import it, as Payload and Keystatic demonstrate.

### 6. Abstract Filesystem Patterns

- **Keystatic's `MinimalFs`** is the cleanest real-world example. Three methods, two implementations (local fs, GitHub API). All business logic operates on the interface.
- **Payload uses adapter injection at config level**, not function level. `buildConfig({ db: postgresAdapter({...}) })`. Heavier pattern.
- **BrowserFS** emulates full Node.js `fs` API in browsers — overkill for Sherpa.

### 7. `git` Dependency in `velocity.ts`

- **The existing code already handles git absence gracefully.** `getGitStaleness` wraps `execSync` in try-catch and returns `null` on failure.
- **No framework-level changes needed.** Document that `git` is an optional system dependency.

## Three Strategies

### Strategy A: Strip `server-only` entirely (Recommended)

`@sherpa/studio-core` never imports `server-only`. Sherpa's thin wrapper adds `import "server-only"` at the re-export layer.

**Precedent:** Exactly what Payload CMS does. Core package has zero `server-only` imports.

**Pros:** Works in all environments without `--conditions` flags. Simplest build config.
**Cons:** Next.js consumers must add the guard themselves.

### Strategy B: Conditional exports with `react-server` condition

Package uses conditional exports so RSC context gets real implementation and non-RSC gets throwing module. Plain Node.js gets real implementation via `node` fallback.

**Precedent:** Keystatic pattern. Sophisticated but complex.

**Pros:** Automatic safety for Next.js consumers.
**Cons:** Significantly more complex build configuration.

### Strategy C: Optional `@sherpa/studio-next` adapter package

Small package re-exports everything from core with `import "server-only"` prepended. Next.js consumers import from adapter. Others import from core.

**Precedent:** Mirrors Payload's `@payloadcms/next`.

**Pros:** Clean separation. **Cons:** Another package to maintain. Premature for JIT phase.

### Recommendation: Strategy A now, Strategy C later

Strategy A matches the existing plan, matches Payload's proven architecture, and requires zero conditional export complexity.

### Filesystem Strategy: Parameterized Root, Not Abstracted FS

The `content.ts` module doesn't need full `MinimalFs` abstraction. All target environments (Node.js, Bun) have compatible `fs` modules. Parameterize the project root via config. Keep using `fs` directly. Introduce `MinimalFs` only if non-filesystem backend is ever needed (YAGNI).

## Sources

- [Nico's Blog: "server-only package is empty?!"](https://www.nico.fyi/blog/server-only-package)
- [React RFC #227: Server Module Conventions](https://github.com/reactjs/rfcs/blob/main/text/0227-server-module-conventions.md)
- [Node.js Packages Documentation](https://nodejs.org/api/packages.html)
- [Bun Module Resolution](https://bun.com/docs/runtime/module-resolution)
- [hirok.io: Guide to package.json exports field](https://hirok.io/posts/package-json-exports)
- [webpack: Package Exports](https://webpack.js.org/guides/package-exports/)
- [Payload CMS Blog: Payload 3.0](https://payloadcms.com/posts/blog/payload-30-the-first-cms-that-installs-directly-into-any-nextjs-app)
- [Payload Docs: Using Outside Next.js](https://payloadcms.com/docs/local-api/outside-nextjs)
- [Payload Docs: Database Adapters](https://payloadcms.com/docs/database/overview)
- [Keystatic: package.json (full exports)](https://raw.githubusercontent.com/Thinkmill/keystatic/main/packages/keystatic/package.json)
- [Keystatic: Reader API docs](https://keystatic.com/docs/reader-api)
- [Keystatic: reader/generic.ts source](https://raw.githubusercontent.com/Thinkmill/keystatic/main/packages/keystatic/src/reader/generic.ts)
- [tsup docs](https://tsup.egoist.dev/)
- [Next.js Discussion #55314](https://github.com/vercel/next.js/discussions/55314)
- [Next.js Issue #71071](https://github.com/vercel/next.js/issues/71071)
- [Builder.io: Server-only Code in App Router](https://www.builder.io/blog/server-only-next-app-router)

## Raw Links

- https://www.nico.fyi/blog/server-only-package
- https://github.com/reactjs/rfcs/blob/main/text/0227-server-module-conventions.md
- https://nodejs.org/api/packages.html
- https://bun.com/docs/runtime/module-resolution
- https://github.com/oven-sh/bun/issues/8990
- https://hirok.io/posts/package-json-exports
- https://webpack.js.org/guides/package-exports/
- https://github.com/vercel/next.js/discussions/33813
- https://github.com/vercel/next.js/discussions/55314
- https://github.com/vercel/next.js/issues/71071
- https://github.com/vercel/next.js/issues/62564
- https://nextjs.org/docs/app/guides/package-bundling
- https://www.builder.io/blog/server-only-next-app-router
- https://payloadcms.com/posts/blog/payload-30-the-first-cms-that-installs-directly-into-any-nextjs-app
- https://payloadcms.com/docs/local-api/outside-nextjs
- https://payloadcms.com/docs/database/overview
- https://payloadcms.com/docs/configuration/overview
- https://raw.githubusercontent.com/payloadcms/payload/main/packages/payload/package.json
- https://raw.githubusercontent.com/payloadcms/payload/main/packages/next/package.json
- https://github.com/payloadcms/payload/discussions/7512
- https://deepwiki.com/payloadcms/payload/3.1-database-adapters
- https://github.com/Thinkmill/keystatic
- https://raw.githubusercontent.com/Thinkmill/keystatic/main/packages/keystatic/package.json
- https://raw.githubusercontent.com/Thinkmill/keystatic/main/packages/keystatic/src/reader/generic.ts
- https://raw.githubusercontent.com/Thinkmill/keystatic/main/packages/keystatic/src/reader/index.ts
- https://keystatic.com/docs/reader-api
- https://keystatic.com/docs/configuration
- https://tsup.egoist.dev/
- https://github.com/egoist/tsup/discussions/1154
- https://github.com/egoist/tsup/issues/998
- https://github.com/perry-mitchell/any-fs
- https://github.com/jvilk/BrowserFS
- https://tolgee.io/blog/conditional-export
- https://www.newline.co/courses/bundling-and-automation-in-monorepos/packagejson-exports-and-conditions
- https://github.com/openjs-foundation/bundler-collab-space/issues/7
- https://www.npmjs.com/package/server-only

## Open Questions

1. **Sync vs async fs methods?** Current code uses `readFileSync`/`readdirSync`. Works fine but blocks event loop in long-running MCP server. Keystatic's `MinimalFs` is fully async. Migrate during extraction or defer?
2. **`CACHE_ROOT` mechanism**: WavePoint uses `.studio-cache/` for serverless deployment. Should framework provide a cache builder utility, or is this purely a consumer concern?
3. **Should package declare `"engines": { "node": ">=20" }`?** Makes server-side-only nature explicit.
4. **Is Keystatic's `#imports` pattern worth adopting?** Useful for conditional internal implementations. Premature complexity now.
5. **How will `@sherpa/studio-next` (Strategy C) compose with the thin wrapper?** Re-export only, or add Next.js-specific behavior (CACHE_ROOT logic, Turbopack config)?
