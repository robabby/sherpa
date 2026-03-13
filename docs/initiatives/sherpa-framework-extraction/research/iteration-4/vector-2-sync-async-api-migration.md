# Vector 2: Sync vs Async API Migration Cost

**Question:** What is the concrete cost of sync-to-async API migration in Node.js/TypeScript framework libraries?
**Agent dispatched:** 2026-03-11

## Findings

### Real-World Migration Examples

- **Babel is the canonical case.** Took 4 months using `gensync` generators to provide both `transformSync` and `transformAsync`. The generator-based approach lets you write code once and execute it either way. Complex but necessary for their scale. ([Babel gensync](https://github.com/loganfsmyth/gensync))

- **glob broke downstream consumers** (aws-cdk, mocha, jest) when changing its sync API in v9. Major semver break. Demonstrates the cost of changing sync→async after publishing. ([glob v9 migration](https://github.com/isaacs/node-glob))

- **dotenv deliberately kept `readFileSync`** and closed the issue requesting async. Their reasoning: the file is read once at startup, async adds complexity for zero benefit. ([dotenv issue](https://github.com/motdotla/dotenv))

- **gray-matter stayed sync.** It parses strings, not files — the file I/O is the caller's responsibility. Good separation of concerns. ([gray-matter](https://github.com/jonschlinkert/gray-matter))

### Performance Analysis

- **Lemire's benchmark:** Reading 1KB files 50,000 times takes 140ms sync vs 2,400ms with `fs.promises`. For reading ~500 markdown files synchronously, it completes in single-digit milliseconds. The throughput difference only matters under concurrent load. ([Lemire benchmark](https://lemire.me/blog/))

- **StackInsight study (250 repos):** 3.2x throughput penalty from sync under concurrent load. But this applies to servers handling multiple requests, not build-time/prerender tools.

### Next.js RSC Compatibility

- **`readFileSync` appears in official Next.js documentation examples for server components.** Fully supported. With `"use cache"`, the sync read happens at build time and is cached. Streaming/concurrency concern is neutralized when data is prerendered. ([Next.js docs](https://nextjs.org/docs))

- **No conflict with PPR.** Static shells prerender at build time (sync is fine); dynamic holes fill at request time (but Studio data is static/filesystem, so it's always prerenderable).

### Why Keystatic Is Async

- **Keystatic is async because of GitHub, not because of local files.** Key insight: Keystatic defines a `MinimalFs` interface (3 async methods: `readFile`, `readdir`, `fileExists`) so the same generic reader code works against both local filesystem (`fs.promises`) and GitHub API (`fetch`). If you never need a remote backend, the async tax buys nothing. ([Keystatic reader/generic.ts](https://raw.githubusercontent.com/Thinkmill/keystatic/main/packages/keystatic/src/reader/generic.ts))

### Migration Patterns

| Pattern | Example | Complexity | Overhead |
|---------|---------|-----------|----------|
| gensync/quansync generators | Babel | High — write as generators, compile to both | Runtime generator dep, unfamiliar pattern |
| Dual APIs | fs-extra (`copySync` + `copy`) | Medium — maintain two implementations | Double surface area, maintenance burden |
| Conditional sync | unified's `processSync` | Low — async core, sync wrapper with guard | Constrains sync callers (no async plugins) |
| Async wrapper | `const result = await Promise.resolve(syncFn())` | Trivial | Pointless overhead, doesn't enable anything |

### The I/O Boundary Pattern

The current `content.ts` with 6 functions (`readProjectFile`, `listMarkdownFiles`, etc.) is already the right abstraction — it's Keystatic's `MinimalFs` pattern, just synchronous. Domain logic never touches `fs` directly.

**Future async migration path:** Make `content.ts` return Promises, add `await` at ~70 call sites. Mechanical 1-session task. No `gensync`, no dual exports.

## Sources

- [gensync](https://github.com/loganfsmyth/gensync) — Babel's sync/async generator pattern
- [quansync](https://github.com/nicolo-ribaudo/quansync) — Successor to gensync for sync+async
- [glob v9](https://github.com/isaacs/node-glob) — Breaking sync API change
- [dotenv](https://github.com/motdotla/dotenv) — Deliberately kept readFileSync
- [gray-matter](https://github.com/jonschlinkert/gray-matter) — Sync string parsing, I/O is caller's job
- [Keystatic reader/generic.ts](https://raw.githubusercontent.com/Thinkmill/keystatic/main/packages/keystatic/src/reader/generic.ts) — MinimalFs interface
- [Lemire benchmark](https://lemire.me/blog/) — readFileSync vs fs.promises performance
- [Next.js docs](https://nextjs.org/docs) — RSC readFileSync examples
- [fs-extra](https://github.com/jprichardson/node-fs-extra) — Dual sync/async API example
- [unified](https://github.com/unifiedjs/unified) — processSync pattern

## Raw Links

- https://github.com/loganfsmyth/gensync
- https://github.com/nicolo-ribaudo/quansync
- https://github.com/isaacs/node-glob
- https://github.com/motdotla/dotenv
- https://github.com/jonschlinkert/gray-matter
- https://raw.githubusercontent.com/Thinkmill/keystatic/main/packages/keystatic/src/reader/generic.ts
- https://lemire.me/blog/
- https://nextjs.org/docs
- https://github.com/jprichardson/node-fs-extra
- https://github.com/unifiedjs/unified
- https://nodejs.org/api/fs.html
- https://tailwindcss.com/blog/tailwindcss-v4

## Implications

**Ship sync for v1.** The performance difference is irrelevant for 100-500 files. Next.js RSC fully supports sync reads. The async tax buys nothing without a remote backend.

**Protect the I/O boundary.** `content.ts` already centralizes all filesystem access. As long as domain logic never touches `fs` directly, future async migration is mechanical: make `content.ts` return Promises, add `await` at ~70 call sites. One session.

**Don't use gensync.** It's powerful but complex. Don't provide dual exports. Don't preemptively add async for users that don't exist.

## Open Questions

1. If a future consumer wants a database-backed Studio (not filesystem), would async migration be sufficient or would the architecture need deeper changes?
2. Should `content.ts` be documented as the "I/O boundary" explicitly in the package README/types to prevent direct `fs` usage in domain modules?
