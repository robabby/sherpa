# Vector 4: Config Composition Patterns

**Question:** How does `sherpa.config.ts` interact with `next.config.ts`? How can a single config be consumed by multiple runtimes (Next.js app, MCP server, CLI)?
**Agent dispatched:** 2026-03-12

## Findings

### 1. Payload's `withPayload()` Implementation

Source: `packages/next/src/withPayload/withPayload.js` — **plain JavaScript** because it runs before the build process.

**What it actually does:**
- **`serverExternalPackages`**: Adds `graphql` + ~12 Payload packages in dev mode to avoid bundling
- **`webpack.externals`**: Adds `drizzle-kit`, `sharp`, `libsql`, `require-in-the-middle`, `json-schema-to-typescript`. IgnorePlugin for `pg-native`
- **`webpack.resolve.fallback`**: `aws4: false` to suppress mongodb warnings
- **`headers()`**: Wraps existing headers, adds `Accept-CH`, `Vary`, `Critical-CH`, `X-Powered-By`
- **`sassOptions`**: `silenceDeprecations: ['import']`
- **`outputFileTracingExcludes/Includes`**: drizzle-kit, @libsql/client
- **`env`**: Sets `NEXT_BASE_PATH`
- **`turbopack`**: Merges existing turbopack config

**Critical finding:** `withPayload()` does NOT inject routes, rewrites, or middleware. Route injection is handled entirely through **file-system routing** — Payload scaffolds a `(payload)` route group with catch-all routes. The wrapper only handles build tooling.

**Turbopack split:** For Next.js ≥ 16.1.0, skips webpack config entirely, uses only `serverExternalPackages`.

### 2. Next.js Config Wrapping Patterns

All four major wrappers follow `(nextConfig) => nextConfig`:

**Sentry `withSentryConfig()`:**
- Detects active bundler (webpack vs turbopack), applies different patches
- Adds `serverExternalPackages` for 22 auto-instrumented packages
- Uses `compiler.runAfterProductionCompile` (Next.js 15.4.1+) for source map upload — Turbopack-compatible
- Source: https://github.com/getsentry/sentry-javascript/blob/develop/packages/nextjs/src/config/withSentryConfig/index.ts

**next-intl `createNextIntlPlugin()`:**
- Curried: `createNextIntlPlugin(config)` returns `withNextIntl(nextConfig)`
- **webpack**: `resolve.alias` mapping `next-intl/config` to i18n request file
- **turbopack**: `turbopack.resolveAlias` + `turbopack.rules`
- Always configures Turbopack on Next.js 16+ even when webpack is active
- Source: https://github.com/amannn/next-intl/blob/main/packages/next-intl/src/plugin/createNextIntlPlugin.tsx

**@next/mdx:**
- Double-curried: `(pluginOptions) => (inputConfig) => nextConfig`
- Adds module rule for `.mdx` extension in both webpack and turbopack
- Source: https://github.com/vercel/next.js/blob/canary/packages/next-mdx/index.js

**Composition pattern:** Manual nesting is the standard:
```ts
export default withSentryConfig(
  withPayload(
    withNextIntl(nextConfig)
  ),
  sentryOptions
)
```
No official compose utility. Sentry must be outermost for source maps.

### 3. Multi-Runtime Config Consumption

**Payload's approach (gold standard):**
- `payload.config.ts` uses `buildConfig()` — returns typed config object
- **Server-only constraint:** "The Payload Config only lives on the server and is not allowed to contain any client-side code"
- **Standalone scripts:** Import config directly, use `getPayload({ config })` to initialize
- **CLI:** `payload run src/seed.ts` handles env vars, initializes tsx for TypeScript
- **`@payload-config` alias:** tsconfig path alias for webpack/turbopack resolution; standalone scripts use direct import

**Sanity's dual-config:**
- `sanity.config.ts` primary, `sanity.cli.ts` optional CLI-specific override
- Both CLI and embedded Next.js Studio consume `sanity.config.ts`

**Key principle:** Config must be **pure data + typed functions** — no JSX, no Next.js APIs, no CSS imports. This is what makes it portable.

### 4. Config File Discovery

- **cosmiconfig** is de facto standard for flexible discovery (package.json, .rc files, .config/ subdirectory, walking up directory tree)
- **But framework configs don't need it.** Payload, Sanity, Vite, Vitest, Drizzle all use a fixed convention: `{framework}.config.ts` at project root. No directory walking.
- **Override mechanism:** Env var (`PAYLOAD_CONFIG_PATH`) is the standard escape hatch.
- **Recommendation:** `sherpa.config.ts` at project root. Optional `SHERPA_CONFIG_PATH` env var. No cosmiconfig.

### 5. Route Injection

Three patterns observed:

1. **File-system routing (Payload, Keystatic)** — Dominant pattern. Scaffolded files in `app/` directory with catch-all segments. Payload: `(payload)/admin/[[...segments]]/page.tsx`. Keystatic: `keystatic/[[...params]]/page.tsx`.
2. **Rewrites in next.config** (Sentry tunnel) — Internal plumbing, not UI routes.
3. **Middleware** (Clerk, next-intl) — Intercepting/modifying requests, not injecting new routes.

**No framework uses programmatic route registration.** Next.js doesn't support it.

### 6. Turbopack Compatibility

**Transition pattern from all 4 source code inspections:**
- **Detect bundler:** `process.env.TURBOPACK` or version utility
- **Provide both configs:** Set both `webpack:` and `turbopack:` in returned config
- **Turbopack equivalents:** `webpack.resolve.alias` → `turbopack.resolveAlias`, `webpack.module.rules` → `turbopack.rules`, `webpack.externals` → `serverExternalPackages`
- **Post-build hooks:** `compiler.runAfterProductionCompile` replaces webpack plugins
- **Key:** Turbopack rules only support loaders that return JavaScript

### 7. Config as Single Source of Truth

**Yes — single config file can serve both build-time and runtime.** Exactly what Payload does:

```
sherpa.config.ts          <-- single source of truth
  |
  +-- withSherpa()        <-- build-time (next.config.ts)
  +-- createStudio(config) <-- runtime (Next.js server)
  +-- MCP server           <-- startup (standalone Node.js)
  +-- CLI                  <-- command execution (standalone Node.js)
```

**Constraints:** No JSX, no React imports, no Next.js imports, no side effects, no client-only code. Pure typed objects + functions.

**Config loading by runtime:**
- **Next.js:** Loaded via `import` — webpack/turbopack handle TypeScript
- **MCP server / CLI:** Use `jiti` (what Next.js itself uses for `next.config.ts`) or `bun` to load TypeScript at runtime

## Sources

### Payload CMS
- [withPayload.js source](https://github.com/payloadcms/payload/blob/main/packages/next/src/withPayload/withPayload.js)
- [withPayloadLegacy.js source](https://github.com/payloadcms/payload/blob/main/packages/next/src/withPayload/withPayloadLegacy.js)
- [Payload Config docs](https://payloadcms.com/docs/configuration/overview)
- [Using Payload outside Next.js](https://payloadcms.com/docs/local-api/outside-nextjs)
- [Issue #14354: withPayload + Next.js 16](https://github.com/payloadcms/payload/issues/14354)

### Sentry
- [withSentryConfig source](https://github.com/getsentry/sentry-javascript/blob/develop/packages/nextjs/src/config/withSentryConfig/index.ts)
- [Sentry Turbopack blog](https://blog.sentry.io/turbopack-support-next-js-sdk/)

### next-intl
- [createNextIntlPlugin source](https://github.com/amannn/next-intl/blob/main/packages/next-intl/src/plugin/createNextIntlPlugin.tsx)
- [next-intl plugin docs](https://next-intl.dev/docs/usage/plugin)

### Next.js
- [next.config.js docs](https://nextjs.org/docs/app/api-reference/config/next-config-js)
- [Turbopack config](https://nextjs.org/docs/app/api-reference/config/next-config-js/turbopack)
- [Next.js 16 upgrade](https://nextjs.org/docs/app/guides/upgrading/version-16)
- [transpilePackages](https://nextjs.org/docs/app/api-reference/config/next-config-js/transpilePackages)

### Config Loading
- [cosmiconfig](https://github.com/cosmiconfig/cosmiconfig) — Flexible config discovery
- [jiti](https://github.com/unjs/jiti) — TypeScript loader (used by Next.js itself)

### Sanity
- [Sanity Studio configuration](https://www.sanity.io/docs/studio/configuration)
- [Sanity CLI config](https://www.sanity.io/docs/cli-reference/cli-config)

## Raw Links

- https://github.com/payloadcms/payload/blob/main/packages/next/src/withPayload/withPayload.js
- https://github.com/payloadcms/payload/blob/main/packages/next/src/withPayload/withPayloadLegacy.js
- https://payloadcms.com/docs/configuration/overview
- https://payloadcms.com/docs/local-api/outside-nextjs
- https://github.com/payloadcms/payload/issues/14354
- https://github.com/payloadcms/payload/discussions/14330
- https://github.com/getsentry/sentry-javascript/blob/develop/packages/nextjs/src/config/withSentryConfig/index.ts
- https://blog.sentry.io/turbopack-support-next-js-sdk/
- https://github.com/amannn/next-intl/blob/main/packages/next-intl/src/plugin/createNextIntlPlugin.tsx
- https://next-intl.dev/docs/usage/plugin
- https://nextjs.org/docs/app/api-reference/config/next-config-js
- https://nextjs.org/docs/app/api-reference/config/next-config-js/turbopack
- https://nextjs.org/docs/app/guides/upgrading/version-16
- https://nextjs.org/docs/app/api-reference/config/next-config-js/transpilePackages
- https://github.com/cosmiconfig/cosmiconfig
- https://github.com/unjs/jiti
- https://github.com/vercel/next.js/blob/canary/packages/next-mdx/index.js
- https://www.sanity.io/docs/studio/configuration
- https://www.sanity.io/docs/cli-reference/cli-config
- https://github.com/sanity-io/next-sanity
- https://vite.dev/config/
- https://orm.drizzle.team/docs/drizzle-config-file

## Implications

1. **`withSherpa()` should be minimal.** Only: `transpilePackages`, `serverExternalPackages`, optionally `headers()`. No route injection — that's scaffolded files.
2. **Route injection = `sherpa init` scaffolds `app/(sherpa)/studio/[[...segments]]/page.tsx`.** Not config magic.
3. **Dual-bundler support mandatory.** Provide both `webpack:` and `turbopack:` config. Prefer `serverExternalPackages`.
4. **MCP/CLI load config via jiti** (or bun). Same TypeScript config, no build step.
5. **No cosmiconfig.** Fixed path: `sherpa.config.ts` at project root + optional `SHERPA_CONFIG_PATH` env var.
6. **`defineConfig()` is the right entrypoint.** Identity function for type inference. Validation in `createStudio()`.

## Open Questions

1. Does `withSherpa()` need any webpack config at all? If Sherpa packages are pure ESM TS, `transpilePackages` may suffice.
2. Should config export support promises for async initialization?
3. How does MCP server discover config without project context? `SHERPA_CONFIG_PATH` env var?
4. Does Sherpa need a client-side config split (like Payload's `ClientConfig`)?
5. Should `sherpa init` scaffold routes or should `withSherpa()` use rewrites? (Consensus: scaffold.)
