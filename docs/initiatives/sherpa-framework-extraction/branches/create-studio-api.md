---
status: researched
source-iteration: 3
spawned-from: sherpa-framework-extraction
created: 2026-03-11
priority: high
---

# createStudio() API Design

## Context

Iteration 2 established the config entrypoint (`defineConfig()`) and the extraction dependency graph. The missing piece is the runtime API: what does `createStudio(config)` return? Following Keystatic's `createReader()` pattern, this is a typed data access layer that lets server components read governance data (initiatives, tasks, agent roles, velocity) without HTTP round-trips.

This is the primary API surface of `@sherpa/studio-core` — the thing consumers actually call. The config tells Sherpa *what* your project looks like; `createStudio()` returns methods to *read* it.

## Question

What does `createStudio(config)` return? What methods does the typed object expose? How does it compose with Next.js server components and React Server Components? Should it be a singleton or instantiated per-request?

## Suggested Vectors

1. **Keystatic `createReader()` deep dive** — What does it return? How does it handle collections, singletons, and nested data? How is it used in server components? What's the caching strategy?
2. **Payload CMS `getPayload()` pattern** — How does Payload's server-side API work? `getPayload({ config })` returns a typed client with `find()`, `findByID()`, `create()`, `update()`. What's the equivalent for governance data?
3. **Method inventory** — Map every function currently in `src/lib/studio/index.ts` (getInitiatives, getTasks, getAgentRoles, etc.) to a `createStudio()` method. Which are read-only? Which mutate? Which need config?
4. **Caching and revalidation** — In Next.js, server component data fetching benefits from `unstable_cache` or React `cache()`. Should `createStudio()` integrate caching, or leave it to the consumer?

## Links

- [Keystatic Reader API](https://keystatic.com/docs/reader-api)
- [Payload Local API](https://payloadcms.com/docs/local-api/overview)
- [Next.js Data Fetching](https://nextjs.org/docs/app/building-your-application/data-fetching)
