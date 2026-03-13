# Vector 1: CMS & Blog Stack Evaluation

**Question:** What's the optimal stack for a consulting firm website that also serves as a CMS-backed blog — considering that blog content will eventually be created and managed by an agentic workforce?
**Agent dispatched:** 2026-03-13

## Findings

### Payload CMS — The Strongest Contender

- **Next.js native**: Payload v3 (current: v3.79.0) installs directly into a Next.js `/app` folder — not a separate service. It is the only CMS that lives inside the Next.js application itself. ([payloadcms.com](https://payloadcms.com/docs/getting-started/what-is-payload))
- **41.2k GitHub stars**, 559 releases, MIT license, 18.2k projects using it. ([github.com/payloadcms/payload](https://github.com/payloadcms/payload))
- **Three API surfaces**: REST API, GraphQL API, and a **Local API** that lets you query the database directly in React Server Components with zero network overhead — ideal for agentic workflows running in the same process. ([payloadcms.com/docs/local-api](https://payloadcms.com/docs/local-api/overview))
- **96.4% TypeScript** codebase with automatic type generation for all collections. ([github.com/payloadcms/payload](https://github.com/payloadcms/payload))
- **Database flexibility**: PostgreSQL, MongoDB, SQLite, Cloudflare D1. For Vercel deployment, uses Neon (serverless Postgres) + Vercel Blob for assets. ([payloadcms.com/docs/database](https://payloadcms.com/docs/database/overview))
- **Built-in versions and drafts**: Native draft/publish workflow with version history and autosave. ([payloadcms.com/docs/versions/drafts](https://payloadcms.com/docs/versions/drafts))
- **Completely free and open source** (MIT). Payload Cloud exists as optional managed hosting but the software itself has zero paywalls or feature restrictions. ([payloadcms.com/pricing](https://payloadcms.com/pricing))
- **Vercel deployment**: Official support for deploying as a Next.js app on Vercel with Neon database. ([payloadcms.com/docs/getting-started/installation](https://payloadcms.com/docs/getting-started/installation))
- **Agentic fit**: Agents can use the REST API or, if running in the same Next.js process, the Local API with full TypeScript types. Draft → publish workflow is API-accessible. Access control is granular and code-defined.

### Sanity — Best Hosted Option

- **Content Lake architecture**: All content stored as JSON documents in Sanity's hosted "Content Lake" with real-time sync. Schema defined in TypeScript code. ([sanity.io/docs](https://www.sanity.io/docs))
- **Generous free tier**: 20 seats, 10K documents, 1M CDN requests/month, 250K API requests/month, 100GB assets, 100GB bandwidth. Growth plan at $15/seat/month. ([sanity.io/pricing](https://www.sanity.io/pricing))
- **Full mutation API**: HTTP mutations endpoint supports create, createOrReplace, createIfNotExists, patch, delete operations. Transactions supported. ([sanity.io/docs/http-mutations](https://www.sanity.io/docs/http-mutations))
- **Important caveat**: "Validation rules set up on your document types will only run within the studio (client-side), not when using this mutation API" — agents bypassing the Studio UI skip validation. ([sanity.io/docs/http-mutations](https://www.sanity.io/docs/http-mutations))
- **Scheduling API**: Available on Growth plan and above. Programmatic scheduled publishing with full API support. ([sanity.io/docs/scheduling-api](https://www.sanity.io/docs/scheduling-api))
- **Not self-hostable**: Cloud-only. Content lives in Sanity's infrastructure.
- **Agentic fit**: Excellent API for programmatic CRUD. Mutation API + scheduling API cover the full overnight publishing pipeline. But vendor lock-in on content storage.

### Strapi — Self-Hosted Workhorse

- **Open source, self-hosted**: Community Edition is free. REST and GraphQL APIs auto-generated for all content types. ([strapi.io](https://strapi.io))
- **Strapi v5**: Current major version with TypeScript support since v4.3.0, flattened response format. ([docs.strapi.io/dev-docs/api/rest](https://docs.strapi.io/dev-docs/api/rest))
- **Drawback for this use case**: Strapi runs as a **separate Node.js server** — not embedded in Next.js. Requires hosting Strapi somewhere alongside the Vercel-deployed frontend. Adds operational complexity.
- **Agentic fit**: Solid API for agents. But the operational burden of running a separate Strapi server is a significant downside when the frontend is already on Vercel.

### Contentful — Enterprise-Grade, Expensive

- **Free tier**: 10 users, 25 content types, 10K records, 100K API calls/month, 50GB CDN bandwidth. ([contentful.com/pricing](https://www.contentful.com/pricing/))
- **Steep jump**: Lite plan is $300/month. Premium is custom pricing.
- **The 7 req/s rate limit is problematic for batch agentic operations**. An overnight content engine generating multiple posts would need careful throttling. ([contentful.com/developers/docs](https://www.contentful.com/developers/docs/references/content-management-api/))
- **Agentic fit**: API is comprehensive but rate limits and $300/month jump to get workflow features make this overkill for a startup consulting firm.

### Keystatic — Git-Backed Simplicity

- **Git-backed CMS**: Content stored as Markdown/JSON/YAML files in the Git repo. Edits committed directly to branches. Built by Thinkmill. ([keystatic.com](https://keystatic.com))
- **Reader API is read-only**: `createReader()` can read content from local filesystem or GitHub, but **there is no programmatic write API**. ([keystatic.com/docs/reader-api](https://keystatic.com/docs/reader-api))
- **Agentic fit**: **Poor for agentic workflows.** Agents would need to create files and commit to Git directly, bypassing the CMS entirely. No write API, no draft/publish workflow via API, no scheduling.

### TinaCMS — Git-Backed with GraphQL

- **Git-backed with GraphQL layer**: Content stored in Git but queried via auto-generated GraphQL API. 13.2k GitHub stars, Apache-2.0 license. ([github.com/tinacms/tinacms](https://github.com/tinacms/tinacms))
- **API access is in Beta and requires Business plan at $299/month**. ([tina.io/pricing](https://tina.io/pricing))
- **Agentic fit**: API being in Beta and locked behind $299/month is a dealbreaker.

### Ghost — Publishing Platform as Headless CMS

- **52k GitHub stars**, MIT license, mature project (2013). ([github.com/TryGhost/Ghost](https://github.com/TryGhost/Ghost))
- **Admin API**: Full CRUD for posts, pages, tags, authors. JWT authentication. Supports creating posts in draft status, publishing, scheduling. ([docs.ghost.org/admin-api](https://docs.ghost.org/admin-api/))
- **Not TypeScript-native**: 62.7% JavaScript, 27.7% TypeScript. No official TypeScript SDK.
- **Agentic fit**: Admin API is solid for programmatic publishing. But operational overhead of running a separate Ghost instance, lack of TypeScript types, and inflexible content modeling make it suboptimal.

### Directus — Database-First Backend

- **34.5k GitHub stars**, v11.16.1. Wraps any SQL database with REST + GraphQL APIs. ([github.com/directus/directus](https://github.com/directus/directus))
- **BSL 1.1 License**: Free for organizations under $5M annual revenue. ([directus.io/pricing/self-hosted](https://directus.io/pricing/self-hosted))
- **Agentic fit**: Strong API, good TypeScript SDK, workflow automation. But like Strapi and Ghost, it's a separate service needing hosting alongside Vercel.

### MDX/Content Collections — Simplest Option

- **Zero infrastructure**: Blog posts as `.mdx` files in the repo. Next.js reads them at build time or via RSC.
- **Type-safe with libraries**: Velite for content collections with Zod schemas. `contentlayer` (unmaintained as of 2024), `next-mdx-remote`, or `@next/mdx`.
- **Agentic fit for writing**: Agents can create `.mdx` files, commit to Git, and trigger a Vercel rebuild. Simplest possible pipeline.
- **Agentic fit for publishing**: No draft/publish workflow, no scheduling, no editorial review UI. Would need to build all workflow tooling from scratch.

## Comparative Analysis Matrix

| Criterion | Payload CMS | Sanity | Strapi | Contentful | Keystatic | TinaCMS | Ghost | Directus | MDX Files |
|---|---|---|---|---|---|---|---|---|---|
| **API-first for agents** | Excellent (REST + Local) | Excellent (Mutations API) | Good (REST/GraphQL) | Good (CMA, 7 req/s limit) | None (read-only) | Beta ($299/mo) | Good (Admin API) | Good (REST/GraphQL) | N/A (file ops) |
| **Vercel-compatible** | Native (same app) | Yes (external API) | Needs separate host | Yes (external API) | Yes (same app) | Yes (git-backed) | Needs separate host | Needs separate host | Native (same app) |
| **TypeScript quality** | Exceptional (96% TS) | Excellent (typegen) | Adequate (v4.3+) | Good (SDK types) | Good (schema types) | Excellent (98% TS) | Weak (63% JS) | Good (SDK types) | Varies by tooling |
| **Cost at low volume** | $0 (MIT, self-host) | $0 free tier | $0 (Community) | $0 (very limited) | $0 | $0 (2 users only) | $0 (self-host) | $0 (<$5M rev) | $0 |
| **Draft/Publish workflow** | Built-in (versions) | Built-in (Content Lake) | Built-in (v5) | Built-in | None | $49/mo plan | Built-in | Built-in | Build-your-own |
| **Operational complexity** | Low (same Next.js app) | Low (hosted service) | High (separate server) | Low (hosted service) | Low (same app) | Medium | High (separate server) | High (separate server) | Lowest |

## Recommendation Tiers

### Tier 1: Payload CMS (Recommended)
Payload is the only CMS that embeds directly into the Next.js application. One deployment, one codebase, one repo. Agents use the Local API with zero network overhead and full TypeScript types. REST API available for external agent processes. Draft/publish/versions built in. No vendor lock-in (MIT license, your database). Database via Neon (serverless Postgres, generous free tier) on Vercel.

### Tier 2: Sanity (Runner-up)
If you want hosted infrastructure with zero database management, Sanity's free tier is generous and the mutation API is well-suited for agentic publishing.

### Tier 3: MDX Files (Simplest)
For starting out, MDX files in the repo with a simple content pipeline (agent writes file, commits, Vercel rebuilds) could be sufficient. Zero infrastructure, zero cost, maximum simplicity. But no editorial UI for human review.

### Not Recommended
Strapi/Ghost/Directus (separate server needed), Contentful ($300/month cliff + rate limits), Keystatic (no write API), TinaCMS ($299/month for API in Beta).

## Sources

- [Payload CMS](https://payloadcms.com) — Next.js native CMS, MIT license
- [Payload GitHub](https://github.com/payloadcms/payload) — 41.2k stars, v3.79.0
- [Payload REST API docs](https://payloadcms.com/docs/rest-api/overview)
- [Payload Local API docs](https://payloadcms.com/docs/local-api/overview)
- [Payload Database docs](https://payloadcms.com/docs/database/overview)
- [Payload Versions/Drafts](https://payloadcms.com/docs/versions/drafts)
- [Payload Installation](https://payloadcms.com/docs/getting-started/installation)
- [Payload Pricing](https://payloadcms.com/pricing)
- [Payload Cloud Pricing](https://payloadcms.com/cloud-pricing)
- [Payload vs Sanity](https://payloadcms.com/compare/payload-vs-sanity)
- [Sanity.io](https://www.sanity.io) — Hosted structured content platform
- [Sanity Pricing](https://www.sanity.io/pricing)
- [Sanity HTTP Mutations](https://www.sanity.io/docs/http-mutations)
- [Sanity Scheduling API](https://www.sanity.io/docs/scheduling-api)
- [Strapi.io](https://strapi.io) — Self-hosted headless CMS
- [Strapi REST API docs](https://docs.strapi.io/dev-docs/api/rest)
- [Contentful Pricing](https://www.contentful.com/pricing/)
- [Contentful CMA Reference](https://www.contentful.com/developers/docs/references/content-management-api/)
- [Keystatic](https://keystatic.com) — Git-backed CMS
- [Keystatic Reader API](https://keystatic.com/docs/reader-api)
- [TinaCMS](https://tina.io) — Git-backed CMS with GraphQL
- [TinaCMS Pricing](https://tina.io/pricing)
- [Ghost](https://ghost.org) — Publishing platform
- [Ghost Admin API](https://docs.ghost.org/admin-api/)
- [Directus](https://directus.io) — Database-first backend
- [Directus Items API](https://directus.io/docs/api/items)
- [Vercel Payload Marketplace](https://vercel.com/marketplace/payload)

## Raw Links

- https://payloadcms.com
- https://payloadcms.com/pricing
- https://payloadcms.com/cloud-pricing
- https://payloadcms.com/docs/rest-api/overview
- https://payloadcms.com/docs/local-api/overview
- https://payloadcms.com/docs/database/overview
- https://payloadcms.com/docs/versions/drafts
- https://payloadcms.com/docs/getting-started/installation
- https://payloadcms.com/docs/getting-started/what-is-payload
- https://payloadcms.com/compare/payload-vs-sanity
- https://payloadcms.com/blog/nextjs-cms
- https://github.com/payloadcms/payload
- https://discord.gg/payload
- https://www.sanity.io
- https://www.sanity.io/pricing
- https://www.sanity.io/docs
- https://www.sanity.io/docs/http-mutations
- https://www.sanity.io/docs/scheduling-api
- https://www.sanity.io/docs/document-actions
- https://strapi.io
- https://strapi.io/pricing-self-hosted
- https://docs.strapi.io/dev-docs/api/rest
- https://docs.strapi.io/dev-docs/typescript
- https://www.contentful.com/pricing/
- https://www.contentful.com/developers/docs/references/content-management-api/
- https://keystatic.com
- https://keystatic.com/docs/reader-api
- https://github.com/thinkmill/keystatic
- https://tina.io
- https://tina.io/pricing
- https://github.com/tinacms/tinacms
- https://ghost.org
- https://ghost.org/pricing/
- https://docs.ghost.org/admin-api/
- https://github.com/TryGhost/Ghost
- https://directus.io
- https://directus.io/docs/api/items
- https://directus.io/pricing/self-hosted
- https://github.com/directus/directus
- https://vercel.com/marketplace/payload

## Implications

1. **Payload CMS is the natural choice** given the existing Next.js 16 + Tailwind v4 + shadcn/ui stack. It installs directly into the Next.js app folder, deploys as a single Vercel project, and provides the richest API surface for agentic content management.
2. **Database strategy**: Neon (serverless Postgres) for Payload on Vercel. Vercel Blob for media/assets.
3. **Agentic content pipeline**: The blog-content-engine workforce can use Payload's REST API from external agent processes, or the Local API if agents run within the same application boundary.
4. **No vendor lock-in**: MIT license, standard Postgres database, portable content.
5. **Sanity as Plan B**: If the team decides they want zero infrastructure management and are comfortable with hosted content.

## Open Questions

1. **Payload on Vercel cold starts**: What are the cold start implications for the admin panel and API endpoints?
2. **Neon free tier limits**: 0.5 GB storage, compute auto-suspends after 5 minutes. Sufficient for overnight agent pipeline?
3. **Payload + shadcn/ui admin customization**: Can the admin panel be themed to match the sherpa.solar design system?
4. **Agent authentication strategy**: How should the blog-content-engine agents authenticate against Payload's REST API?
5. **ISR vs rebuild**: Does Payload content publishing trigger ISR or require full rebuilds?
6. **Content migration path**: Starting with MDX files and migrating to Payload later — how painful is that?
