# createStudio() API Design — Deep Dive

**Research date:** 2026-03-11
**Question:** What should `createStudio(config)` return? How should 30+ data access functions be organized on the typed return object?
**Iteration:** 3, Vector 1
**Branch seed:** [create-studio-api](../../branches/create-studio-api.md)

---

## Key Discoveries

### 1. Keystatic `createReader()` — The Closest Structural Analog

Keystatic's Reader API is the tightest match for what `createStudio()` needs to be: a typed, config-derived data access layer for filesystem content, used in server components.

**Source code** (from [`packages/keystatic/src/reader/generic.ts`](https://github.com/Thinkmill/keystatic/blob/main/packages/keystatic/src/reader/generic.ts) and [`index.ts`](https://github.com/Thinkmill/keystatic/blob/main/packages/keystatic/src/reader/index.ts)):

```ts
// The BaseReader type — what createReader returns
export type BaseReader<Collections, Singletons> = {
  collections: {
    [Key in keyof Collections]: CollectionReader<...>;
  };
  singletons: {
    [Key in keyof Singletons]: SingletonReader<...>;
  };
  config: Config<Collections, Singletons>;
};

// Each collection reader has exactly 4 methods
export type CollectionReader<Schema, SlugField> = {
  read: (slug: string, opts?: EntryReaderOpts) => Promise<Entry | null>;
  readOrThrow: (slug: string, opts?: EntryReaderOpts) => Promise<Entry>;
  all: (opts?: EntryReaderOpts) => Promise<{ slug: string; entry: Entry }[]>;
  list: () => Promise<string[]>;
};

// Each singleton reader has exactly 2 methods
export type SingletonReader<Schema> = {
  read: (opts?: EntryReaderOpts) => Promise<Entry | null>;
  readOrThrow: (opts?: EntryReaderOpts) => Promise<Entry>;
};
```

**Key patterns:**
- Config-derived generics: the reader's type is parameterized by the config's collections/singletons, so `reader.collections.posts.read(slug)` is fully typed based on what was defined in `keystatic.config.ts`.
- The reader object is created at **module scope** (`const reader = createReader(process.cwd(), config)`), not per-request. Filesystem reads are synchronous/fast enough that per-request deduplication isn't needed.
- The `config` object is stored on the reader for introspection.
- Async API surface despite filesystem reads — forward-compatible with remote storage (GitHub reader).
- **One-level nesting**: `reader.collections.posts.read()` not `reader.read({ collection: 'posts' })`. The nesting matches the config shape.

**Docs:** [Keystatic Reader API](https://keystatic.com/docs/reader-api) | [Keystatic Configuration](https://keystatic.com/docs/configuration) | [Keystatic GitHub](https://github.com/Thinkmill/keystatic)

### 2. Payload CMS `getPayload()` — The Flat Alternative

Payload takes the opposite approach: a single instance with flat CRUD methods that accept a `collection` parameter.

**API surface** (from [Local API docs](https://payloadcms.com/docs/local-api/overview), [DeepWiki analysis](https://deepwiki.com/payloadcms/payload/7.1-local-api)):

```ts
const payload = await getPayload({ config })

// Collection operations — flat, with collection as parameter
const posts = await payload.find({ collection: 'posts', where: { ... } })
const post = await payload.findByID({ collection: 'posts', id: '123' })
const created = await payload.create({ collection: 'posts', data: { ... } })
const updated = await payload.update({ collection: 'posts', id: '123', data: { ... } })
await payload.delete({ collection: 'posts', id: '123' })
const { totalDocs } = await payload.count({ collection: 'posts' })

// Global operations — separate methods
const nav = await payload.findGlobal({ slug: 'nav' })
await payload.updateGlobal({ slug: 'nav', data: { ... } })

// Auth operations
await payload.login({ collection: 'users', data: { ... } })
```

**Return types:**
- `find()` → `{ docs: Post[], totalDocs, totalPages, page, ... }` (paginated)
- `findByID()` → `Post`
- `create()` → `Post`
- `count()` → `{ totalDocs: number }`

**Key patterns:**
- **Flat namespace, collection-as-parameter.** This works because Payload has uniform CRUD across all collections — every collection supports find/create/update/delete. The `collection` string is a discriminated union that drives return type inference.
- **Singleton via `getPayload()`**: The Payload instance uses a module-scope singleton with HMR awareness in dev. In production, `getPayload()` simply disables HMR. No per-request instantiation needed. ([Payload Local API](https://payloadcms.com/docs/local-api/overview))
- **Access control bypass by default**: `overrideAccess: true` in Local API. Access checks are opt-in, not opt-out.
- **No built-in caching**: The Local API doesn't integrate with React `cache()` or `unstable_cache`. The community package [`@payload-enchants/cached-local-api`](https://www.npmjs.com/package/@payload-enchants/cached-local-api) wraps Local API methods with `unstable_cache` and tag-based revalidation.

**Docs:** [Payload Local API](https://payloadcms.com/docs/local-api/overview) | [Server Functions](https://payloadcms.com/docs/local-api/server-functions) | [Outside Next.js](https://payloadcms.com/docs/local-api/outside-nextjs) | [GitHub](https://github.com/payloadcms/payload)

### 3. Sanity `createClient()` — Query-Based Access

Sanity takes a third approach: a client that executes arbitrary GROQ queries, not collection-scoped methods.

```ts
import { createClient } from 'next-sanity'

const client = createClient({
  projectId: '...',
  dataset: 'production',
  apiVersion: '2025-02-06',
  useCdn: true,
})

// Query-based, not collection-based
const posts = await client.fetch<Post[]>(`*[_type == "post"]{ title, slug }`)
const post = await client.fetch<Post>(`*[_type == "post" && slug.current == $slug][0]`, { slug })
```

**Key patterns:**
- **Generic typed fetch**: `client.fetch<T>(query, params)` — the type comes from the generic, not from config inference. Sanity TypeGen (`sanity typegen generate`) can auto-generate types from GROQ queries. ([Sanity TypeGen](https://www.sanity.io/docs/apis-and-sdks/sanity-typegen))
- **`sanityFetch()` wrapper for caching**: `next-sanity` wraps the base client in a `sanityFetch()` helper that integrates with Next.js tag-based revalidation. The wrapper handles `revalidateTag` and the Live Content API. ([next-sanity GitHub](https://github.com/sanity-io/next-sanity))
- **Module-scope singleton**: Client created once at module scope, reused across all server components.
- **Mutation methods** (flat): `client.create()`, `client.createOrReplace()`, `client.createIfNotExists()`, `client.delete()`, `client.patch()`, `client.mutate()`, `client.transaction()`.

**Docs:** [Sanity Client GitHub](https://github.com/sanity-io/client) | [next-sanity](https://github.com/sanity-io/next-sanity) | [Sanity Querying](https://www.sanity.io/docs/apis-and-sdks/js-client-querying) | [Sanity TypeGen](https://www.sanity.io/docs/apis-and-sdks/sanity-typegen) | [Sanity Client Reference](https://reference.sanity.io/_sanity/client/)

### 4. Method Grouping Analysis — Nested vs Flat

Three major patterns emerge across SDKs:

| Pattern | Example | Used By | Tradeoff |
|---------|---------|---------|----------|
| **Nested by resource** | `stripe.customers.create()` | Stripe, Prisma, Keystatic, Drizzle | Type-safe per-resource, natural for heterogeneous operations |
| **Flat with discriminator** | `payload.find({ collection: 'posts' })` | Payload CMS | Works when operations are uniform across resources |
| **Query-based** | `client.fetch<T>(groq)` | Sanity | Maximum flexibility, weaker type safety without codegen |

**Stripe's approach** ([stripe-node source](https://github.com/stripe/stripe-node)): Resources are instantiated as properties in `_prepResources()` during construction. Each resource class receives the Stripe instance for API access. The pattern is `stripe.customers.create()`, `stripe.subscriptions.list()`, etc.

**Prisma's approach** ([Prisma Client docs](https://www.prisma.io/docs/orm/reference/prisma-client-reference)): Auto-generated model namespaces: `prisma.user.findMany()`, `prisma.post.create()`. Each model has identical CRUD methods, but the nesting provides per-model type inference.

**Azure SDK guidelines** ([TypeScript Design](https://azure.github.io/azure-sdk/typescript_design.html)): Recommends flat methods on a service client class, with `get*Client()` methods for subresources. Standard verb prefixes: `create`, `upsert`, `update`, `get`, `list`, `delete`. "Do not include the Noun when the operation is operating on the resource itself."

**Drizzle ORM** ([Drizzle docs](https://orm.drizzle.team/docs/rqb-v2)): `db.query.users.findMany({ with: { posts: true } })`. Schema-derived namespaces on a typed `db` instance.

**For Sherpa Studio:** The operations are **heterogeneous** — `getInitiatives()` returns `Initiative[]`, `getHubStats()` returns `HubStats`, `getDocument(path)` returns `DocumentContent`. This is fundamentally different from Payload's uniform CRUD. **Nested grouping is the right choice** — it mirrors how the config organizes domains.

### 5. Caching Strategy — Framework vs Consumer

**React `cache()` mechanics** ([React docs](https://react.dev/reference/react/cache)):
- Deduplicates function calls **within a single server request only**
- Must be called at **module scope** (not inside components)
- Uses `Object.is()` for argument comparison — pass primitives or stable refs
- Errors are also cached for the request duration
- Only works in React Server Components

**Next.js `unstable_cache` / `use cache`** ([Next.js docs](https://nextjs.org/docs/app/api-reference/functions/unstable_cache)):
- Persists across requests and deployments (Data Cache)
- Being replaced by `use cache` directive in Next.js 15+
- Requires explicit revalidation (time-based or tag-based)

**How frameworks handle it:**
- **Keystatic**: No built-in caching. Reader is module-scope, filesystem reads are fast. Consumers wrap with `cache()` if desired. ([Keystatic discussion #1168](https://github.com/Thinkmill/keystatic/discussions/1168))
- **Payload**: No built-in caching in Local API. Community package `@payload-enchants/cached-local-api` adds `unstable_cache` wrapping. ([npm](https://www.npmjs.com/package/@payload-enchants/cached-local-api))
- **Sanity**: `next-sanity` wraps `client.fetch` in `sanityFetch()` with tag-based revalidation via the Live Content API. Formerly used React `cache()`. ([next-sanity GitHub](https://github.com/sanity-io/next-sanity), [Sanity caching course](https://www.sanity.io/learn/course/controlling-cached-content-in-next-js/introduction))
- **tRPC**: `createCallerFactory` with React Query integration for server component prefetching. ([tRPC RSC docs](https://trpc.io/docs/client/react/server-components))

**Recommendation for Sherpa:** **Leave caching to the consumer.** Sherpa reads the filesystem synchronously — these are fast, local reads that don't benefit from cross-request caching (the filesystem changes between sessions anyway). If a consumer wants per-request deduplication, they wrap `createStudio()` methods with React `cache()`. If they want persistent caching, they use `unstable_cache` or `use cache`. Baking caching into the framework couples it to Next.js, which contradicts Sherpa's goal of framework-agnostic operation.

### 6. Singleton vs Per-Request

**Module-scope singleton is correct for filesystem-reading modules.**

Evidence:
- **Keystatic**: `const reader = createReader(process.cwd(), config)` at module scope. One instance serves all requests. ([Keystatic docs](https://keystatic.com/docs/reader-api))
- **Payload**: `getPayload()` returns a singleton. In dev, handles HMR. In production, same instance across requests. ([Payload docs](https://payloadcms.com/docs/local-api/overview))
- **Next.js singleton pattern**: Use `globalThis` to survive module bundling across HMR cycles. ([Next.js discussion #68572](https://github.com/vercel/next.js/discussions/68572))

**Why per-request is wrong for Sherpa:**
- Studio reads the filesystem. There's no user-specific state, no authentication context, no database connection pooling.
- The config doesn't change between requests — paths, vocabulary, entity definitions are static.
- Per-request instantiation would re-parse the config on every render, wasting work.

**Caveat:** If Sherpa later adds database-backed features (task persistence, user preferences), those would need per-request context (user identity, transaction). The singleton pattern handles this by accepting an optional context parameter on specific methods, not by making the entire instance per-request.

---

## Synthesis: The `createStudio(config)` Return Type

### Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **Grouping** | Nested by domain | Operations are heterogeneous (unlike Payload's uniform CRUD) |
| **Nesting depth** | One level (max two) | Avoids Azure SDK's warning against over-nesting |
| **Instantiation** | Module-scope singleton | Filesystem reads, no per-request state |
| **Caching** | Consumer responsibility | Framework-agnostic, don't couple to Next.js |
| **Sync vs async** | Sync (matching current implementation) | `fs.readFileSync` reads, fast, no I/O wait. Can add async wrappers later |
| **Config on instance** | Yes, `studio.config` | Keystatic pattern, useful for introspection |
| **Naming convention** | Azure verb prefixes: `get`, `list`, `find` | `getInitiatives()` not `initiatives()`, `getDocument(path)` not `document(path)` |

### Proposed Return Type

```ts
import type { SherpaConfig } from '@sherpa/studio-core'

export interface Studio {
  /** The resolved config, available for introspection */
  config: SherpaConfig

  /** Governance entities — initiatives, proposals, activity */
  initiatives: {
    list(): Initiative[]
    listArchived(): Initiative[]
    getFiles(slug: string, subDir: string): ContentFile[]
    getFilesFromPath(basePath: string, subDir: string): ContentFile[]
    getResearch(slug: string, basePath: string): InitiativeResearch
    getOpenQuestions(slug: string): string[]
    getBranchSeeds(slug: string, basePath?: string): BranchSeed[]
    getResearchTree(slug: string, opts?: { depth?: number; maxDepth?: number; basePath?: string }): ResearchTreeNode | null
    getVelocity(slug: string): InitiativeVelocity
  }

  /** Task board and dispatch */
  tasks: {
    getBoard(): TaskBoard
    // Future: create(), update(), dispatch()
  }

  /** Agent role catalog */
  agents: {
    listRoles(): AgentRole[]
    // Future: getRole(slug), dispatchWorker()
  }

  /** Document reading — generic markdown/frontmatter access */
  docs: {
    get(relativePath: string): DocumentContent | null
    listByCategory(): Record<DocCategory, ContentFile[]>
    getResearchByTrack(): Record<ResearchTrack, ContentFile[]>
  }

  /** Convention system — rules, CLAUDE.md files, UX guides */
  conventions: {
    list(): { rules: Rule[]; claudeMdFiles: ContentFile[]; uxGuides: ContentFile[] }
  }

  /** Portfolio / project status dashboard */
  portfolio: {
    get(): PortfolioData
    getRecentActivity(): ActivityEntry[]
    getActivityByDate(date: string): DateActivityData | null
  }

  /** Skills catalog */
  skills: {
    list(): Skill[]
  }

  /** Sessions (usage tracking) */
  sessions: {
    list(): Session[]
    listForInitiative(slug: string): Session[]
  }

  /** Aggregated stats */
  stats: {
    getHub(): HubStats
    getAllVelocity(): InitiativeVelocity[]
  }

  /** Unified views (composite data) */
  process: {
    getUnified(sort?: ProcessSortOption): UnifiedProcessData
    getNodes(opts?: ProcessFilters): ProcessNode[]
    getLifecycle(initiative: Initiative): LifecycleInfo
  }

  /** File tree builders */
  trees: {
    buildBranch(slug: string, ...args: any[]): FileTreeNode
    buildInitiative(slug: string, ...args: any[]): FileTreeNode
  }

  /** Primitives catalog (registerable by consumer) */
  primitives: {
    getCatalog(): PrimitiveCatalogEntry[]
    getStats(): PrimitivesStats
    // Registration API for consumers
  }

  /** API endpoint catalog (registerable by consumer) */
  api: {
    getCatalog(): ApiEndpoint[]
    getStats(): ApiStats
  }

  /** Prompt generators */
  prompts: {
    generateRrLaunch(init: Initiative): string
    generateRrContinue(init: Initiative): string
    generatePlanning(init: Initiative): string
    generateReview(init: Initiative): string
    generateIntegration(proposals: Initiative[]): string
    generateRole(role: AgentRole): string
    prefixWithRole(role: AgentRole, prompt: string): string
  }

  /** Workstreams (legacy, returns empty) */
  workstreams: {
    list(): Workstream[]
  }

  /** Research reports (JSON-based) */
  research: {
    getReport(slug: string): ResearchReport | null
  }
}

/**
 * Create a typed Studio data access instance.
 * Module-scope singleton — create once, use everywhere.
 *
 * @example
 * ```ts
 * // lib/studio.ts
 * import { createStudio } from '@sherpa/studio-core'
 * import config from '../sherpa.config'
 *
 * export const studio = createStudio(config)
 * ```
 *
 * @example
 * ```ts
 * // app/studio/page.tsx (server component)
 * import { studio } from '@/lib/studio'
 *
 * export default function StudioPage() {
 *   const initiatives = studio.initiatives.list()
 *   const stats = studio.stats.getHub()
 *   return <Dashboard initiatives={initiatives} stats={stats} />
 * }
 * ```
 */
export declare function createStudio(config: SherpaConfig): Studio
```

### Domain Groupings Map

Current barrel export → proposed namespace:

| Current Function | Proposed Location | Notes |
|-----------------|-------------------|-------|
| `getInitiatives()` | `studio.initiatives.list()` | |
| `getArchivedInitiatives()` | `studio.initiatives.listArchived()` | |
| `getInitiativeFiles()` | `studio.initiatives.getFiles()` | |
| `getInitiativeFilesFromPath()` | `studio.initiatives.getFilesFromPath()` | |
| `getResearchIterations()` | `studio.initiatives.getResearch()` | Renamed for clarity |
| `getResearchOpenQuestions()` | `studio.initiatives.getOpenQuestions()` | |
| `getBranchSeeds()` | `studio.initiatives.getBranchSeeds()` | |
| `getResearchTree()` | `studio.initiatives.getResearchTree()` | |
| `getInitiativeVelocity()` | `studio.initiatives.getVelocity()` | |
| `getAgentRoles()` | `studio.agents.listRoles()` | |
| `getDocument()` | `studio.docs.get()` | |
| `getDocsByCategory()` | `studio.docs.listByCategory()` | |
| `getResearchByTrack()` | `studio.docs.getResearchByTrack()` | |
| `getConventions()` | `studio.conventions.list()` | |
| `getPortfolio()` | `studio.portfolio.get()` | |
| `getRecentActivity()` | `studio.portfolio.getRecentActivity()` | |
| `getActivityByDate()` | `studio.portfolio.getActivityByDate()` | |
| `getSkills()` | `studio.skills.list()` | |
| `getSessions()` | `studio.sessions.list()` | |
| `getSessionsForInitiative()` | `studio.sessions.listForInitiative()` | |
| `getHubStats()` | `studio.stats.getHub()` | |
| `getAllVelocity()` | `studio.stats.getAllVelocity()` | |
| `getUnifiedProcessData()` | `studio.process.getUnified()` | |
| `getProcessNodes()` | `studio.process.getNodes()` | |
| `detectLifecycle()` | `studio.process.getLifecycle()` | |
| `buildBranchFileTree()` | `studio.trees.buildBranch()` | |
| `buildInitiativeFileTree()` | `studio.trees.buildInitiative()` | |
| `getPrimitivesCatalog()` | `studio.primitives.getCatalog()` | |
| `getPrimitivesStats()` | `studio.primitives.getStats()` | |
| `getApiCatalog()` | `studio.api.getCatalog()` | |
| `getApiStats()` | `studio.api.getStats()` | |
| `generateRrLaunchPrompt()` | `studio.prompts.generateRrLaunch()` | |
| `getWorkstreams()` | `studio.workstreams.list()` | Legacy, returns empty |
| `getResearchReport()` | `studio.research.getReport()` | |
| `getDeliverables()` | `studio.docs.getDeliverables()` | Or `studio.deliverables.list()` |
| `getDeliverable()` | `studio.docs.getDeliverable()` | Or `studio.deliverables.get()` |
| `applyFilters()` | Not on studio object | Utility, stays as standalone export |
| `parseFrontmatter()` etc. | Not on studio object | Utilities, stay as standalone exports |

### What Stays Outside `createStudio()`

Not everything belongs on the studio instance. **Utilities and pure functions** stay as standalone exports:

- **Markdown utilities**: `parseFrontmatter`, `extractTitle`, `extractSections`, `extractSummarySection`, `countLines`, `parseActivityLog`, `parseMarkdownTable`, `extractSection`, `extractOpenQuestions`, `extractNumberedItems` — pure functions, no config dependency
- **Activity link helpers**: `parseActivityDescription`, `parseScope`, `processActivityData`, `SCOPE_COLORS` — UI utilities
- **Constants**: `PROCESS_NODE_KINDS`, `KIND_LABELS`, `MOMENTUM_LEVELS`, `LIFECYCLE_STAGES`, `DOC_CATEGORIES`
- **Types**: All TypeScript types and Zod schemas
- **Filter utilities**: `applyFilters` — pure function

These export from `@sherpa/studio-core` directly, not through the studio instance.

### Implementation Sketch

```ts
// @sherpa/studio-core/src/create-studio.ts
import type { SherpaConfig } from './config'
import type { Studio } from './types'

export function createStudio(config: SherpaConfig): Studio {
  // Resolve paths once
  const paths = {
    initiatives: config.paths?.initiatives ?? 'docs/initiatives',
    tasks: config.paths?.tasks ?? 'docs/tasks',
    agents: config.paths?.agents ?? 'docs/agents/roles',
    docs: config.paths?.docs ?? 'docs',
    rules: config.paths?.rules ?? '.claude/rules',
    skills: config.paths?.skills ?? '.claude/skills',
    sessions: config.paths?.sessions ?? 'docs/sessions',
  }

  return {
    config,

    initiatives: {
      list: () => getInitiativesImpl(config, paths),
      listArchived: () => getArchivedInitiativesImpl(config, paths),
      getFiles: (slug, subDir) => getInitiativeFilesImpl(slug, subDir, paths),
      // ...
    },

    tasks: {
      getBoard: () => getTaskBoardImpl(config, paths),
    },

    agents: {
      listRoles: () => getAgentRolesImpl(config, paths),
    },

    // ... remaining namespaces
  }
}
```

Each `*Impl` function receives the resolved config and paths. The implementations are the existing functions from `src/lib/studio/`, refactored to accept config/paths as parameters instead of importing hardcoded paths from `content.ts`.

---

## Open Questions

1. **Should namespaces be lazy?** Stripe eagerly instantiates all resource objects. For Sherpa, where each namespace is just a bag of closures, eager is fine — there's no allocation cost. But if namespaces grow to include cached state, lazy (getter-based) would avoid unused work.

2. **Async future?** Current implementation uses synchronous `fs.readFileSync`. If Sherpa ever supports remote content sources (git API, S3), methods would need to be async. Starting sync and adding async wrappers later is a breaking change. Consider making the API async from day one (returning resolved promises for sync reads) to avoid future breakage. Counter-argument: async adds complexity for zero current benefit.

3. **Deliverables as a top-level namespace?** `getDeliverables()` and `getDeliverable()` could be `studio.deliverables.list()` and `studio.deliverables.get()`, or they could live under `studio.docs.*`. Depends on whether deliverables are a first-class Sherpa concept or a WavePoint-specific extension.

4. **Registration APIs** for primitives and API catalogs — should these live on the studio instance (`studio.primitives.register(entry)`) or on the config (`defineConfig({ primitives: [...] })`)?  Config is cleaner (static, declarative), but runtime registration enables plugins to add catalog entries after config resolution.

5. **Should `studio.config` expose the raw user config or the resolved config?** Keystatic exposes the full resolved config. Payload doesn't expose config on the instance at all (it's accessible separately). Resolved config is more useful for introspection.

---

## Sources

### Primary Documentation
- [Keystatic Reader API](https://keystatic.com/docs/reader-api) — Official Reader API docs with usage patterns
- [Keystatic Configuration](https://keystatic.com/docs/configuration) — Config shape that drives reader types
- [Keystatic GitHub](https://github.com/Thinkmill/keystatic) — Source repository
- [Payload CMS Local API](https://payloadcms.com/docs/local-api/overview) — Official Local API documentation
- [Payload CMS Server Functions](https://payloadcms.com/docs/local-api/server-functions) — Server Action integration patterns
- [Payload CMS Outside Next.js](https://payloadcms.com/docs/local-api/outside-nextjs) — Framework-agnostic usage
- [Payload CMS Concepts](https://payloadcms.com/docs/getting-started/concepts) — Architecture overview
- [Payload Config](https://payloadcms.com/docs/configuration/overview) — Config types and structure
- [Payload TypeScript Generation](https://payloadcms.com/docs/typescript/generating-types) — Type generation pipeline
- [Sanity Client GitHub](https://github.com/sanity-io/client) — Source and README for @sanity/client
- [next-sanity GitHub](https://github.com/sanity-io/next-sanity) — Next.js integration package
- [Sanity Querying](https://www.sanity.io/docs/apis-and-sdks/js-client-querying) — GROQ query patterns
- [Sanity TypeGen](https://www.sanity.io/docs/apis-and-sdks/sanity-typegen) — Type generation from GROQ
- [Sanity Client Reference](https://reference.sanity.io/_sanity/client/) — Full API reference
- [@sanity-typed/client](https://www.npmjs.com/package/@sanity-typed/client) — Community typed GROQ client

### SDK Design Guidelines
- [Azure SDK TypeScript Guidelines](https://azure.github.io/azure-sdk/typescript_design.html) — Comprehensive SDK design rules (verb prefixes, naming, paging, options pattern)
- [SDK Design Patterns Analysis](https://vineeth.io/posts/sdk-development) — Comparative analysis of REST API SDK patterns
- [Stripe Node.js SDK](https://github.com/stripe/stripe-node) — Resource namespace pattern source
- [Prisma Client API Reference](https://www.prisma.io/docs/orm/reference/prisma-client-reference) — Model-namespace typed client

### Caching & React Server Components
- [React `cache()` API](https://react.dev/reference/react/cache) — Official React docs, per-request deduplication
- [Next.js `unstable_cache`](https://nextjs.org/docs/app/api-reference/functions/unstable_cache) — Cross-request caching (being replaced by `use cache`)
- [Next.js `use cache` directive](https://nextjs.org/docs/app/api-reference/directives/use-cache) — New cache component pattern
- [Next.js Caching Guide](https://nextjs.org/docs/app/guides/caching) — Comprehensive caching strategy overview
- [Next.js Cache Components](https://nextjs.org/docs/app/getting-started/cache-components) — Cache component getting started
- [React Cache Consistency](https://twofoldframework.com/blog/react-cache-its-about-consistency) — Deep dive on React cache semantics
- [Server-Side State Management in Next.js](https://www.yoseph.tech/posts/nextjs/server-side-state-management-in-nextjs-a-deep-dive-into-react-cache) — React cache deep dive
- [Next.js Singleton Discussion](https://github.com/vercel/next.js/discussions/68572) — Canonical singleton pattern for Next.js
- [Next.js Singleton Across Requests](https://github.com/vercel/next.js/discussions/55263) — Route handler singleton persistence
- [@payload-enchants/cached-local-api](https://www.npmjs.com/package/@payload-enchants/cached-local-api) — Community caching layer for Payload Local API
- [Sanity Caching with Next.js](https://www.sanity.io/learn/course/controlling-cached-content-in-next-js/introduction) — Sanity's cache control course
- [Sanity CDN + Next.js Cache](https://www.sanity.io/learn/course/controlling-cached-content-in-next-js/combining-sanity-cdn-with-the-next-js-cache) — Combining CDN and framework cache
- [Next.js Tag Revalidation with Sanity](https://www.rudderstack.com/blog/implementing-the-tag-revalidation-caching-strategy-with-nextjs-and-sanity/) — Tag-based revalidation strategy
- [Does Sanity client.fetch use Next.js Data Cache?](https://www.sanity.io/answers/does-next-js-s--createclient---fetch----in-the--next-sanity--package-leverage-the-data-cache-) — Community Q&A on caching behavior

### Server Component Integration
- [tRPC Server Components](https://trpc.io/docs/client/react/server-components) — RSC integration with typed callers
- [tRPC Server-Side Calls](https://trpc.io/docs/server/server-side-calls) — createCallerFactory pattern
- [Payload + Next.js Ultimate Guide](https://payloadcms.com/posts/blog/the-ultimate-guide-to-using-nextjs-with-payload) — Full integration walkthrough
- [Payload + Next.js 16 Compatibility](https://www.buildwithmatija.com/blog/payload-cms-nextjs-16-compatibility-breakthrough) — Latest Next.js compatibility
- [Keystatic + Next.js Installation](https://keystatic.com/docs/installation-next-js) — Next.js setup guide
- [Keystatic Static Pages Discussion](https://github.com/Thinkmill/keystatic/discussions/1168) — Static rendering with githubReader
- [Keystatic Reader Issue #1333](https://github.com/Thinkmill/keystatic/issues/1333) — Dynamic route reader failures

### Data Layer Patterns
- [Drizzle ORM Relational Queries](https://orm.drizzle.team/docs/rqb-v2) — `db.query.users.findMany()` pattern
- [Drizzle Database Connection](https://orm.drizzle.team/docs/connect-overview) — `drizzle()` instance creation
- [Payload Local API via DeepWiki](https://deepwiki.com/payloadcms/payload/7.1-local-api) — Comprehensive type analysis
- [Payload GitHub Discussions #2720](https://github.com/payloadcms/payload/discussions/2720) — Using Local API with RSC
- [Payload GitHub Discussions #6596](https://github.com/payloadcms/payload/discussions/6596) — Local API in server actions
- [Payload HMR Bundle Issue #6441](https://github.com/payloadcms/payload/issues/6441) — getPayloadHMR bundle size concerns
- [Payload Local API Return Types #2434](https://github.com/payloadcms/payload/commit/02410a0be38004b90d19207071569294fd104a66) — Type fix commit
- [Payload Return Type Issue #2433](https://github.com/payloadcms/payload/issues/2433) — Update/delete return type discussion
- [Payload Access Control in Local API](https://payloadcms.com/docs/local-api/access-control) — overrideAccess pattern
- [Payload Performance](https://payloadcms.com/docs/performance/overview) — Performance optimization docs
- [Payload Local API Blog Post](https://payloadcms.com/posts/guides/payload-local-api-faster-queries-for-nextjs-and-beyond) — Performance benefits of Local API

### Prior Sherpa Research
- [Iteration 2 Synthesis](../iteration-2.md) — Config entrypoint design, extraction graph, convention sync, publishing
- [Vector 2: Config-as-Code](../iteration-2/vector-2-config-as-code-entrypoint.md) — `defineConfig()` design with all TypeScript types
- [Vector 3: Extraction Graph](../iteration-2/vector-3-extraction-dependency-graph.md) — 5-phase extraction sequence, dependency DAG
- [Branch Seed: create-studio-api](../../branches/create-studio-api.md) — This research vector's origin

### Additional Links Encountered
- [Next.js Our Journey with Caching](https://nextjs.org/blog/our-journey-with-caching) — Next.js team's caching philosophy evolution
- [Next.js Fetching Data](https://nextjs.org/docs/app/getting-started/fetching-data) — Data fetching patterns
- [Next.js Caching and Revalidating](https://nextjs.org/docs/app/getting-started/caching-and-revalidating) — Getting started with caching
- [Sanity Fetch Content Course](https://www.sanity.io/learn/course/content-driven-web-application-foundations/fetch-sanity-content) — Sanity data fetching tutorial
- [Sanity Getting Started](https://www.sanity.io/docs/apis-and-sdks/js-client-getting-started) — Client setup guide
- [Sanity Functions JS Client](https://www.sanity.io/docs/functions/functions-js-client) — Serverless function integration
- [Keystatic Real-time Previews](https://keystatic.com/docs/recipes/real-time-previews) — Draft mode integration
- [Keystatic Egghead Course](https://egghead.io/lessons/react-retrieve-content-with-the-keystatic-reader-api) — Reader API tutorial
- [Keystatic Singletons Egghead](https://egghead.io/lessons/react-creating-one-off-datasets-with-singletons-in-keystatic) — Singleton tutorial
- [Keystatic Astro Guide](https://docs.astro.build/en/guides/cms/keystatic/) — Astro integration
- [Keystatic Astro Blog Guide](https://jankraus.net/2025/02/25/a-simple-guide-to-using-astro-with-keystatic/) — Astro + Keystatic walkthrough
- [Keystatic Blog Tutorial](https://blog.mmwangi.com/create-a-blog-website-using-nextjs-and-keystatic-working-with-keystatic-part-2) — Next.js + Keystatic tutorial
- [Keystatic Astro Garden](https://garden.mirahi.io/how-to-create-a-blog-using-astro-and-keystatic/) — Another Astro guide
- [Stripe SDK Docs](https://docs.stripe.com/sdks) — SDK overview
- [Stripe API Reference](https://docs.stripe.com/api) — Full API reference
- [tRPC T3 Usage](https://create.t3.gg/en/usage/trpc) — T3 stack tRPC patterns
- [Caching Next.js unstable_cache (LogRocket)](https://blog.logrocket.com/caching-next-js-unstable-cache/) — unstable_cache tutorial
- [BuildUI React Cache](https://buildui.com/posts/react-cache) — React cache patterns
- [Fern TypeScript SDK Generation](https://buildwithfern.com/post/generate-typescript-sdk) — SDK generation patterns
- [Speakeasy TypeScript SDK](https://www.speakeasy.com/docs/languages/typescript/methodology-ts) — SDK methodology
- [OpenAPI TypeScript](https://openapi-ts.dev/openapi-fetch/api) — Path-based typed client
- [fets Client (The Guild)](https://the-guild.dev/blog/announcing-fets-client) — Schema-first TypeScript client
- [Kiota TypeScript](https://learn.microsoft.com/en-us/openapi/kiota/quickstarts/typescript) — Microsoft SDK generator
- [Sanity Caching Client-Side](https://www.sanity.io/answers/nextjs-is-there-a-library-with-cache-persistence) — Client-side cache question
- [Sanity Client Cache Updates](https://www.sanity.io/answers/hey-guys-does-sanity-have-some-kind-of-caching-p1609678603466300) — Cache update behavior
- [Sanity TypeScript GROQ Error](https://www.sanity.io/answers/handling-caching-issues-with-sanity-data-in-nextjs-app-router--) — TypeScript + revalidate issues
- [Sanity Best Practices (Continue)](https://hub.continue.dev/continuedev/sanity-nextjs-best-practices) — Best practices bundle
- [Payload Redis Cache Plugin](https://github.com/Aengz/payload-redis-cache) — Redis caching for Payload
- [Payload Next.js #14354](https://github.com/payloadcms/payload/issues/14354) — withPayload issues
- [Payload GitHub Caching Discussion #1436](https://github.com/payloadcms/payload/discussions/1436) — Community caching approaches
- [Next.js Fetch Caching Discussion #50045](https://github.com/vercel/next.js/discussions/50045) — Fetch caching in server actions
