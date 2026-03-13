# Local-First Sync Ecosystem Survey

**Research iteration:** 1
**Date:** 2026-03-12
**Focus:** Which sync frameworks could serve as Sherpa's sync layer for multi-agent SQLite coordination?

---

## Key Discoveries

### 1. ElectricSQL -- Pivoted Away from SQLite

- **Electric completely rebuilt in 2024**, dropping the legacy CRDT-based SQLite sync system. The new Electric (1.0 released March 2025, 1.1 released August 2025) is a **Postgres sync engine**, not a SQLite sync engine. It streams Postgres changes to clients via "Shapes" (partial replication primitives).
  - Source: https://electric-sql.com/blog/2025/03/17/electricsql-1.0-released
  - Source: https://electric-sql.com/blog/2025/08/13/electricsql-v1.1-released

- **Electric now positions itself as a "data platform for multi-agent."** Their homepage explicitly targets collaborative, multi-agent systems. They ship "Durable Streams" (persistent, addressable, real-time streams) and "Durable Sessions" (state management pattern multiplexing AI token streams with structured state).
  - Source: https://electric-sql.com/
  - Source: https://electric-sql.com/blog/2025/12/09/announcing-durable-streams
  - Source: https://electric-sql.com/blog/2026/01/12/durable-sessions-for-collaborative-ai

- **The client-side story is now PGlite (embedded Postgres via WASM, ~3MB gzipped) and TanStack DB (reactive client store), NOT SQLite.** Electric explicitly moved to Postgres everywhere -- server and client. PGlite gives you Postgres in-browser or in-process.
  - Source: https://github.com/electric-sql/pglite
  - Source: https://electric-sql.com/blog/2025/07/29/local-first-sync-with-tanstack-db

- **License:** Apache 2.0
- **Topology:** Client-server (Postgres -> Electric sync engine -> clients). Durable Streams add multi-user, multi-agent, multi-device subscription.
- **SQLite relationship:** **No longer uses SQLite.** Legacy Electric used SQLite on the client; current Electric uses PGlite (embedded Postgres) or any HTTP client.
- **TypeScript/Node.js:** Full TypeScript support via TanStack DB and PGlite npm packages.

- **Relevance for Sherpa:** Electric's multi-agent positioning is interesting conceptually, but requiring a Postgres server as the source of truth makes it heavyweight for same-machine agent coordination. The Durable Sessions pattern (agents subscribing to shared state streams) is architecturally relevant even if we don't use Electric itself.

### 2. Triplit -- Acquired by Supabase (Oct 2025)

- **Triplit is a full-stack syncing database** that runs on both server and client, with pluggable storage (IndexedDB, SQLite, Durable Objects, LevelDB, memory). Sync happens over WebSockets with delta patches. Built entirely in TypeScript.
  - Source: https://github.com/aspen-cloud/triplit
  - Source: https://www.triplit.dev/

- **Triplit 1.0 shipped March 2025** with 10-100x performance improvements from a rewritten engine.
  - Source: https://www.triplit.dev/blog/triplit-1.0

- **Acquired by Supabase in October 2025.** Co-founder Matt Linkous joined Supabase to lead integrations. Supabase explicitly stated this is NOT about immediately using Triplit for offline -- it's about expertise and expanding third-party integrations (with ElectricSQL, Zero, PowerSync). Triplit remains open source and the codebase will be further opened.
  - Source: https://supabase.com/blog/triplit-joins-supabase

- **License:** AGPL-3.0-only. This is a significant constraint -- any network-accessible service using modified Triplit code must release source. Google bans AGPL internally.
  - Source: https://github.com/aspen-cloud/triplit (LICENSE file)

- **CRDT approach:** Column-level CRDT with property-level conflict resolution. Not LWW-only; uses CRDT semantics for sets, maps, and register types.

- **Topology:** Client-server. Clients maintain local databases, sync bidirectionally with a Triplit server over WebSockets.

- **SQLite relationship:** SQLite is one of several pluggable storage backends. Triplit has its own query engine; SQLite is just a persistence layer, not the query surface.

- **Relevance for Sherpa:** AGPL license is problematic for a framework that will be distributed. The acquisition by Supabase creates uncertainty about long-term independent development. SQLite support exists but is incidental, not core. The architecture (TypeScript-native, pluggable storage, CRDT conflict resolution) is interesting as a reference.

### 3. PowerSync -- Most Mature SQLite Sync, But Server-Dependent

- **PowerSync is a sync engine** with two components: a server-side service that manages partial data syncing, and client SDKs that manage client-side SQLite persistence, consistency, reactivity, and syncing writes back.
  - Source: https://docs.powersync.com/intro/powersync-overview
  - Source: https://www.powersync.com/

- **Backend database agnostic:** Supports Postgres, MongoDB, MySQL (beta), SQL Server (alpha). The server reads from your backend database via logical replication and pushes changes to clients.
  - Source: https://www.powersync.com/open-source

- **Client side is SQLite.** Data persists in schemaless SQLite with client-defined schema applied as views. This is genuine SQLite on the client, not a wrapper or replacement.
  - Source: https://docs.powersync.com/intro/powersync-overview

- **Open Edition available** (free, source-available) under Functional Source License (FSL). The FSL converts to Apache 2.0 after 2 years. The restriction: you cannot build a competing managed service. Client SDKs are Apache 2.0 / MIT.
  - Source: https://www.powersync.com/legal/fsl
  - Source: https://www.powersync.com/open-source
  - Source: https://www.powersync.com/blog/new-open-era-for-powersync

- **Self-hosting:** Docker image available (`journeyapps/powersync-service`). Enterprise self-hosted edition also available.
  - Source: https://docs.powersync.com/intro/self-hosting
  - Source: https://github.com/powersync-ja/self-host-demo

- **TypeScript SDK:** Full JS/TS SDK with React Native and Web support. Embedded SQLite via WASM.
  - Source: https://github.com/powersync-ja/powersync-js

- **Topology:** Client-server only. The PowerSync Service sits between your backend database and clients. No peer-to-peer mode.

- **Conflict resolution:** Server-authoritative with checkpoint-based consistency. Not CRDT -- the server is the source of truth and the client applies changes. Write conflicts are handled by the backend application logic.

- **TanStack DB integration:** PowerSync has an official PowerSyncCollection adapter for TanStack DB.
  - Source: https://tanstack.com/db/latest/docs/collections/powersync-collection

- **Relevance for Sherpa:** PowerSync assumes a backend database (Postgres, etc.) as source of truth, which is the opposite of what we want (SQLite IS the source of truth). The server-authoritative model doesn't fit same-machine multi-agent coordination where agents are peers. However, PowerSync's client SDK architecture (reactive SQLite queries, schema-as-views) is a useful reference.

### 4. Evolu -- Lightweight, MIT, But Relay-Dependent

- **Evolu is a TypeScript library** for building local-first apps with end-to-end encrypted CRDT sync. Built on SQLite, uses Kysely (type-safe SQL query builder) for queries.
  - Source: https://github.com/evoluhq/evolu
  - Source: https://www.evolu.dev/docs/quickstart

- **CRDT approach:** Last-Write-Wins register with Lamport timestamps. All writes become CRDT messages stored locally, then synced. Based on James Long's "CRDT for mortals" pattern. Sync uses Merkle tree comparison.
  - Source: https://news.ycombinator.com/item?id=38984411
  - Source: https://www.evolu.dev/docs/how-evolu-works

- **Relay architecture:** Sync goes through a relay server. Free relay at `free.evoluhq.com`; self-hosting via Docker available. P2P is "theoretically possible" but no reliable implementation exists.
  - Source: https://github.com/evoluhq/evolu

- **Protocol:** The Evolu Protocol is a local-first, E2E encrypted binary sync protocol using Range-Based Set Reconciliation, optimized for minimal size and maximum speed. Designed for SQLite.
  - Source: https://www.evolu.dev/blog/scaling-local-first-software

- **License:** MIT
- **Stars:** 1.8K, 606 releases (latest: Nov 2025)
- **Platforms:** React, React Native, Next.js, Svelte, Vue
- **Maintainer:** evoluhq organization

- **Relevance for Sherpa:** MIT license is ideal. SQLite-native is ideal. The CRDT approach (LWW + Merkle tree sync) is simple and well-understood. However, the relay dependency adds a server requirement even for same-machine sync. The codebase could be a reference for building a lightweight CRDT-on-SQLite layer. The protocol design (Range-Based Set Reconciliation) is worth studying.

### 5. Automerge + SQLite -- Different Paradigms, Awkward Fit

- **Automerge is a CRDT library** for JSON-like documents, not relational data. It provides CRDTs for text, maps, lists, and counters. Production-ready (version 2.0). MIT license.
  - Source: https://automerge.org/
  - Source: https://github.com/automerge/automerge

- **Topology:** Transport-agnostic. Works with client-server, peer-to-peer (WebRTC), or any connection-oriented protocol. This is Automerge's strength -- it's a pure data structure library.
  - Source: https://automerge.org/docs/hello/

- **SQLite as storage adapter:** Community-built adapters exist. `automerge-repo-storage-better-sqlite3` stores Automerge documents in SQLite via better-sqlite3. SQLite is used as a persistence layer, not as the query surface.
  - Source: https://github.com/bijela-gora/automerge-repo-storage-better-sqlite3
  - Source: https://jsr.io/@marionauta/automerge-repo-better-sqlite3

- **automerge-repo:** The "batteries-included" toolkit adds networking (WebSocket, MessageChannel) and storage adapters (IndexedDB, filesystem, SQLite). TypeScript-first.
  - Source: https://automerge.org/blog/automerge-repo/

- **The paradigm mismatch:** Automerge assumes JSON document interaction. SQLite assumes relational/tabular interaction. Bridging these is architecturally uncomfortable. You either: (a) store Automerge docs in SQLite as blobs (loses queryability), or (b) materialize Automerge state into SQL tables (requires a custom sync layer to keep both in sync).
  - Source: https://automerge.org/docs/cookbook/modeling-data/

- **Relevance for Sherpa:** Automerge's P2P transport flexibility is attractive for same-machine agent coordination. But the document-vs-relational mismatch makes it a poor fit for a system where agents need to run SQL queries against shared state. If we wanted Automerge, we'd need to abandon SQL as the query interface, which contradicts the initiative's core premise.

### 6. Zero (Rocicorp) -- Postgres-Centric, Not SQLite

- **Zero is Rocicorp's successor to Replicache**, a sync engine for instant web UIs. Query-driven sync: syncs exactly the data you need based on your queries.
  - Source: https://zero.rocicorp.dev/
  - Source: https://zero.rocicorp.dev/docs/sync

- **Architecture:** Two components -- `zero-client` (in-app, maintains client-side store of recently accessed rows) and `zero-cache` (cloud, read-only replica of your Postgres database). Queries hit client first (instant), then server in parallel for authoritative results.
  - Source: https://zero.rocicorp.dev/

- **Database:** Postgres. Explicitly works with "normal Postgres databases, using normal Postgres schemas."

- **Conflict resolution:** Server-authoritative. All reads/writes flow through server code. Not CRDT-based -- server reconciliation model.

- **License:** Apache 2.0. Self-hostable. Commercial managed hosting available ($30-$1000+/mo tiers).
  - Source: https://zero.rocicorp.dev/docs/open-source

- **Status:** Active development, aiming for beta late 2025 / early 2026. Matt Wonlaw (cr-sqlite creator) works here full-time.
  - Source: https://zero.rocicorp.dev/docs/roadmap

- **TypeScript:** Native TypeScript. ZQL is their custom TypeScript query language.

- **Topology:** Client-server. zero-cache runs as a cloud service connecting to Postgres.

- **Relevance for Sherpa:** Zero requires Postgres and a server component. It's designed for web applications, not same-machine agent coordination. The server-authoritative model doesn't fit our peer topology. Architecturally irrelevant for our use case, but it's where the cr-sqlite creator ended up, which is informative about his assessment of the CRDT-on-SQLite approach vs. server reconciliation.

### 7. Turso/libSQL -- Promising for Embedded Replicas, Not Yet for Multi-Writer

- **libSQL is an MIT-licensed fork of SQLite** created by Turso, adding features like native vector search, async support, and embedded replicas. Fully backwards-compatible with SQLite.
  - Source: https://github.com/tursodatabase/libsql
  - Source: https://docs.turso.tech/libsql

- **Embedded Replicas:** Turso Cloud feature that replicates a database into your application. Local reads are microsecond-level. Writes go to the remote server, then sync back to replicas.
  - Source: https://docs.turso.tech/features/embedded-replicas/introduction
  - Source: https://turso.tech/blog/introducing-embedded-replicas-deploy-turso-anywhere-2085aa0dc242

- **Offline Sync (Public Beta, March 2025):** Bidirectional sync where local writes go to the SQLite WAL and push to cloud when connectivity returns. **Beta quality -- not recommended for production. No durability guarantees during beta. Data loss is possible.**
  - Source: https://turso.tech/blog/turso-offline-sync-public-beta
  - Source: https://turso.tech/blog/introducing-offline-writes-for-turso

- **Concurrent Writes:** Turso has a feature called "Beyond the Single-Writer Limitation" enabling concurrent write transactions. Based on SQLite's experimental `BEGIN CONCURRENT`.
  - Source: https://turso.tech/blog/beyond-the-single-writer-limitation-with-tursos-concurrent-writes

- **TypeScript SDK:** `@libsql/client` package. Supports Node.js, Bun, Deno. Embedded replicas only work in runtimes with filesystem access (not serverless/Lambda).
  - Source: https://github.com/tursodatabase/libsql-client-ts
  - Source: https://docs.turso.tech/libsql/client-access/javascript-typescript-sdk

- **License:** MIT (libSQL). Turso Cloud is a commercial service.

- **Topology:** Hub-and-spoke. One primary database (Turso Cloud or self-hosted), replicas at the edge. Not peer-to-peer. Not designed for multiple independent writers merging.

- **Rust rewrite:** Turso is rewriting SQLite in Rust (previously as limbo, now as Turso itself). This is the long-term direction replacing libSQL.
  - Source: https://github.com/tursodatabase/turso

- **Relevance for Sherpa:** libSQL (MIT, SQLite-compatible, concurrent writes) is interesting as a drop-in SQLite replacement. Embedded replicas could enable agents to each have fast local reads. But the hub-and-spoke topology (single primary for writes) doesn't solve multi-writer coordination. Offline Sync is beta-quality. The concurrent writes feature (based on BEGIN CONCURRENT) is the most relevant piece -- it could let multiple agents write to the same database concurrently if their transactions touch different pages. **Worth investigating libSQL + BEGIN CONCURRENT as a simpler alternative to CRDTs.**

### 8. Mycelial/Mycelite -- Dormant, Single-Writer Only

- **Mycelite is a SQLite VFS extension** that intercepts page writes, creates binary diffs, and applies them to replica databases. Physical, single-writer replication -- NOT CRDT, NOT multi-writer.
  - Source: https://github.com/mycelial/mycelite

- **Status: Effectively abandoned.** Last commit: September 25, 2023. 1.1K stars. No activity in 2+ years.
  - Source: https://github.com/mycelial/mycelite

- **Limitations:** Single-writer only (no locking mechanism). WAL-enabled databases unsupported. Journal grows linearly without compaction. VACUUM creates disproportionately large entries.

- **License:** Apache 2.0

- **Mycelial (the company)** is a data movement/ETL platform, not specifically a sync framework. Mycelite was a side project.
  - Source: https://mycelial.com/

- **Relevance for Sherpa:** None. Single-writer, no multi-writer support, abandoned, doesn't support WAL mode. Dead end.

### 9. BONUS: LiveStore -- Newcomer Worth Watching

- **LiveStore is a state management framework** based on reactive SQLite and event-sourcing (NOT CRDTs). All writes are stored as "mutation events" in an eventlog, simultaneously applied to a SQLite read model.
  - Source: https://livestore.dev/
  - Source: https://github.com/livestorejs/livestore

- **Key distinction from CRDT approaches:** Uses event-sourcing with read/write-model separation. Events are synced, not state. The SQLite database is a materialized view of the event stream.

- **License:** Apache 2.0
- **Stars:** 3.5K
- **Status:** Active beta (v0.3.1, June 2025). 145 releases. 75% TypeScript.
- **Platforms:** Web, mobile (Expo), Node.js, Vue, desktop

- **Relevance for Sherpa:** The event-sourcing approach is conceptually interesting for agentic state. Instead of merging concurrent SQLite writes, you merge event logs and replay them. This sidesteps many CRDT limitations (foreign keys, complex types) because the merge happens at the event level, not the row/column level. Worth deeper investigation.

### 10. BONUS: Litestream -- Backup, Not Sync

- **Litestream is a streaming backup tool** for SQLite. Runs as a background process, continuously copies WAL pages to S3, Azure, GCS, SFTP, or NFS. Read-only replicas possible.
  - Source: https://litestream.io/
  - Source: https://github.com/benbjohnson/litestream

- **Not multi-writer.** Single database, streaming backups. No conflict resolution. No bidirectional sync.

- **Relevance for Sherpa:** Useful for backup/disaster recovery of the agent state database, not for sync between agents. Could complement whatever sync solution we choose.

---

## Comparative Matrix

| Framework | SQLite Relationship | Topology | Multi-Writer | Conflict Resolution | License | TypeScript | Maturity | Same-Machine Fit |
|-----------|-------------------|----------|-------------|-------------------|---------|------------|----------|-----------------|
| **ElectricSQL** | None (uses PGlite/Postgres) | Client-server | Via server | Server-authoritative | Apache 2.0 | Yes | Production (1.1) | Poor -- requires Postgres |
| **Triplit** | Pluggable backend | Client-server (WebSocket) | Yes (CRDT) | Column-level CRDT | AGPL-3.0 | Yes (native) | Production (1.0) | Moderate -- needs server |
| **PowerSync** | Client-side persistence | Client-server | Via server | Server-authoritative | FSL (->Apache 2.0) | Yes | Production | Poor -- needs backend DB |
| **Evolu** | Native (built on SQLite) | Client-relay-client | Yes (CRDT) | LWW per column | MIT | Yes (native) | Active (v7.4) | Moderate -- needs relay |
| **Automerge** | Storage adapter only | Any (P2P, C/S) | Yes (CRDT) | Per-document CRDT | MIT | Yes | Production (2.0) | Good topology, poor data model fit |
| **Zero** | None (uses Postgres) | Client-server | Via server | Server reconciliation | Apache 2.0 | Yes (native) | Alpha/Beta | Poor -- requires Postgres |
| **Turso/libSQL** | Is SQLite (fork) | Hub-and-spoke | Experimental | None (single primary) | MIT | Yes | Production (libSQL); Beta (offline sync) | Promising for reads, weak for multi-writer |
| **Mycelite** | VFS extension | Single-writer replication | No | N/A | Apache 2.0 | No | Abandoned | None |
| **LiveStore** | Read model (event-sourced) | Client-server | Via event merge | Event-level | Apache 2.0 | Yes (75%) | Beta (0.3) | Moderate -- needs server |
| **cr-sqlite** | Native extension | Any (transport-agnostic) | Yes (CRDT) | Column-level LWW | MIT | Via better-sqlite3 | Dormant (works) | Best fit -- but unmaintained |

---

## Implications for Sherpa's Sync Layer

### The landscape is not aligned with our topology

**Every production-grade sync framework assumes a client-server topology with a central database (usually Postgres) as source of truth.** Electric, PowerSync, Zero, and Triplit all require a server component. Our topology -- multiple AI agents on the same machine or small LAN, with SQLite as the canonical store -- is uncommon in the local-first world, which is primarily designed for browser-to-cloud sync.

### The options that actually fit

For same-machine multi-agent SQLite coordination, the viable approaches reduce to:

1. **Plain SQLite WAL mode + write queue.** No sync framework at all. Agents serialize writes through a coordinator process. SQLite's WAL mode allows concurrent readers with a single writer. The "sync" is just reading from the same file. **Simplest, most reliable, zero dependencies.** The open question is whether single-writer throughput is sufficient.

2. **libSQL with BEGIN CONCURRENT.** Use Turso's SQLite fork that experimentally supports multiple concurrent writers (conflict detection at page level). No CRDT overhead, no sync protocol. Agents write to the same database file concurrently. **Risky -- BEGIN CONCURRENT is experimental and page-level conflict detection means unrelated writes to the same page still conflict.**

3. **cr-sqlite (Fly.io fork) for true multi-writer merge.** Column-level CRDT gives the cleanest merge semantics. Each agent could have its own SQLite file and periodically merge via `crsql_changes`. Or all agents write to the same file with cr-sqlite handling column-level merge. **Best semantic fit, but unmaintained upstream and requires loading a native extension.**

4. **Custom event-sourced approach (LiveStore-inspired).** Agents append events to a shared log table. A materializer process replays events into the state tables. Conflict resolution happens at the event level (application-defined merge logic per event type). **Most flexible, but requires building from scratch.**

5. **Evolu's protocol as reference architecture.** Evolu's Range-Based Set Reconciliation over SQLite is exactly our problem. We could study and adapt their protocol for agent-to-agent sync without their relay dependency. MIT license means we can freely learn from the code.

### What NOT to use

- **ElectricSQL/Zero/PowerSync:** Require Postgres. Wrong abstraction layer for SQLite-native coordination.
- **Triplit:** AGPL license is a framework-distribution poison pill.
- **Mycelite:** Abandoned, single-writer only.
- **Automerge:** Document-oriented CRDTs don't map to relational/SQL data access patterns.
- **SQLite-Sync:** Elastic License restricts commercial production use.

### Key insight: Electric's Durable Sessions pattern

Even though we won't use ElectricSQL, their "Durable Sessions" pattern deserves study. The idea: multiplex structured state changes with real-time streams into a persistent, addressable session that multiple agents can subscribe to and join at any time. This is essentially what Sherpa's agent coordination needs -- a shared session where agents read/write state with real-time reactivity. We can implement this pattern on top of SQLite without Electric's Postgres dependency.
- Source: https://electric-sql.com/blog/2026/01/12/durable-sessions-for-collaborative-ai

### Key insight: The SQLite concurrent write problem

SQLite's single-writer limitation is the root constraint. All sync frameworks either work around it (by putting writes elsewhere) or accept it (by serializing). The experimental `BEGIN CONCURRENT` in libSQL/SQLite is the only attempt to solve it at the database level. CRDTs solve it by giving each writer their own database and merging after the fact. For Sherpa, the question is: **do agents need truly concurrent writes, or can they tolerate millisecond-level write serialization?** If the latter, plain WAL mode with a write queue is the answer.
- Source: https://sqlite.org/wal.html
- Source: https://www.sqlite.org/src/doc/begin-concurrent/doc/begin_concurrent.md
- Source: https://turso.tech/blog/beyond-the-single-writer-limitation-with-tursos-concurrent-writes

---

## Open Questions

1. **What is the write throughput requirement?** If agents produce 10 writes/second each and there are 5 agents, can a single-writer WAL-mode SQLite handle 50 writes/second? (SQLite can typically handle thousands of simple writes/second, so probably yes.)

2. **Does libSQL's BEGIN CONCURRENT actually work for our access patterns?** Need to test: multiple Node.js processes writing to the same libSQL database with concurrent transactions. What's the real-world conflict rate when agents update different rows?

3. **Can we use cr-sqlite's approach without cr-sqlite?** The core idea (shadow tables with Lamport timestamps, column-level LWW merge via a changes virtual table) is ~300 lines of SQL and triggers. Could we implement a minimal version ourselves?

4. **Is the event-sourcing approach (LiveStore-style) simpler than CRDTs for our use case?** Events like `{agent: "planner", type: "task_created", payload: {...}}` are natural for agentic workflows. Replay and merge are straightforward. The materializer is application-specific but predictable.

5. **What does Evolu's Range-Based Set Reconciliation look like in practice?** Is it portable enough to adapt for agent-to-agent sync without a relay?

6. **How does Electric's Durable Sessions pattern map to SQLite?** Could we implement a SQLite-backed version of the shared session concept without Postgres?

7. **Would Turso's Rust-rewritten SQLite (replacing libSQL) change the equation?** If concurrent writes become a first-class feature in Turso's SQLite, that eliminates the need for CRDT-based sync entirely.

---

## Sources

### ElectricSQL
- [Electric homepage](https://electric-sql.com/) -- Current positioning as "data platform for multi-agent"
- [Electric 1.0 release](https://electric-sql.com/blog/2025/03/17/electricsql-1.0-released) -- Complete rebuild details
- [Electric 1.1 release](https://electric-sql.com/blog/2025/08/13/electricsql-v1.1-released) -- New storage engine, 100x faster writes
- [Durable Streams announcement](https://electric-sql.com/blog/2025/12/09/announcing-durable-streams) -- Open protocol for persistent streams
- [Durable Streams 0.1.0](https://electric-sql.com/blog/2025/12/23/durable-streams-0.1.0) -- State Protocol details
- [Durable Sessions for Collaborative AI](https://electric-sql.com/blog/2026/01/12/durable-sessions-for-collaborative-ai) -- Multi-agent session pattern
- [Hosted Durable Streams](https://electric-sql.com/blog/2026/01/22/announcing-hosted-durable-streams) -- Cloud hosting, scale numbers
- [Electric Sync Stacks](https://electric-sql.com/docs/stacks) -- Architecture documentation
- [Electric Alternatives](https://electric-sql.com/docs/reference/alternatives) -- Comprehensive comparison page
- [PGlite GitHub](https://github.com/electric-sql/pglite) -- Embeddable Postgres
- [Electric AI Chat demo](https://github.com/electric-sql/electric-ai-chat) -- Multi-agent chat reference app
- [Electric Transport (Durable Streams)](https://github.com/electric-sql/transport) -- GitHub repo
- [Electric products overview](https://electric-sql.com/products/) -- Product lineup
- [Durable Streams product page](https://electric-sql.com/products/durable-streams) -- Product details
- [Electric blog](https://electric-sql.com/blog) -- All blog posts
- [PowerSync vs Electric comparison](https://www.powersync.com/blog/electricsql-electric-next-vs-powersync) -- Third-party comparison
- [Sync engines compared (MerginIT)](https://merginit.com/blog/24082025-sync-engines-guide-electricsql-convex-zero) -- 2025 comparison

### Triplit
- [Triplit GitHub](https://github.com/aspen-cloud/triplit) -- Main repo, AGPL-3.0
- [Triplit homepage](https://www.triplit.dev/) -- Product overview
- [Triplit 1.0 blog post](https://www.triplit.dev/blog/triplit-1.0) -- Release details
- [Triplit 1.0 coming soon](https://www.triplit.dev/blog/triplit-1-0-coming-soon) -- Pre-release details
- [Triplit docs](https://www.triplit.dev/docs) -- Documentation
- [Triplit joins Supabase](https://supabase.com/blog/triplit-joins-supabase) -- Acquisition announcement (Oct 2025)
- [HN: Triplit launch](https://news.ycombinator.com/item?id=40788648) -- Community discussion
- [Triplit blog](https://www.triplit.dev/blog) -- All posts
- [Triplit self-hosting post](https://www.triplit.dev/blog/release-notes-2024-06-14) -- Self-hosting details

### PowerSync
- [PowerSync homepage](https://www.powersync.com/) -- Product overview
- [PowerSync docs](https://docs.powersync.com/intro/powersync-overview) -- Architecture details
- [PowerSync open-source packages](https://www.powersync.com/open-source) -- Component licensing
- [PowerSync Open Edition release](https://www.powersync.com/blog/powersync-open-edition-release) -- Self-hosted version
- [New Open Era for PowerSync](https://www.powersync.com/blog/new-open-era-for-powersync) -- FSL adoption
- [PowerSync FSL license](https://www.powersync.com/legal/fsl) -- License terms
- [PowerSync licensing overview](https://www.powersync.com/legal/overview) -- All licensing
- [PowerSync JS SDK](https://github.com/powersync-ja/powersync-js) -- TypeScript client
- [PowerSync SQLite core](https://github.com/powersync-ja/powersync-sqlite-core) -- SQLite extension
- [PowerSync self-host demo](https://github.com/powersync-ja/self-host-demo) -- Docker self-hosting
- [PowerSync GitHub org](https://github.com/powersync-ja) -- All repos
- [PowerSync v1.0 announcement](https://www.powersync.com/blog/introducing-powersync-v1-0-postgres-sqlite-sync-layer) -- Initial release
- [PowerSync blog](https://www.powersync.com/blog) -- All posts
- [PowerSync TanStack DB integration](https://tanstack.com/db/latest/docs/collections/powersync-collection) -- Official adapter
- [PowerSync TanStack DB roadmap](https://roadmap.powersync.com/c/134-tanstack-db-integration) -- Integration plans
- [SQLite persistence on the web (PowerSync)](https://www.powersync.com/blog/sqlite-persistence-on-the-web) -- Nov 2025 update
- [Supabase + PowerSync integration](https://supabase.com/partners/integrations/powersync) -- Partnership page

### Evolu
- [Evolu GitHub](https://github.com/evoluhq/evolu) -- Main repo, MIT license
- [Evolu quickstart](https://www.evolu.dev/docs/quickstart) -- Getting started
- [How Evolu Works](https://www.evolu.dev/docs/how-evolu-works) -- Architecture (404 at time of research)
- [Evolu npm](https://www.npmjs.com/package/evolu) -- Package details
- [Scaling local-first software (Evolu blog)](https://www.evolu.dev/blog/scaling-local-first-software) -- Protocol details
- [HN: How Evolu Works](https://news.ycombinator.com/item?id=38984411) -- Community discussion, architecture details
- [EEP-001: Ephemeral messages (Evolu)](https://github.com/evoluhq/evolu/issues/536) -- Protocol extension

### Automerge
- [Automerge homepage](https://automerge.org/) -- Project overview
- [Automerge GitHub](https://github.com/automerge/automerge) -- Main repo
- [Automerge hello/getting started](https://automerge.org/docs/hello/) -- Quickstart
- [Automerge modeling data](https://automerge.org/docs/cookbook/modeling-data/) -- Data modeling patterns
- [Automerge 2.0 announcement](https://automerge.org/blog/automerge-2/) -- Major rewrite
- [automerge-repo announcement](https://automerge.org/blog/automerge-repo/) -- Batteries-included toolkit
- [automerge-repo npm](https://www.npmjs.com/package/automerge-repo) -- Package details
- [automerge-repo-storage-better-sqlite3](https://github.com/bijela-gora/automerge-repo-storage-better-sqlite3) -- SQLite adapter
- [automerge-repo-better-sqlite3 (JSR)](https://jsr.io/@marionauta/automerge-repo-better-sqlite3) -- Alternative adapter

### Zero (Rocicorp)
- [Zero homepage](https://zero.rocicorp.dev/) -- Product overview
- [Zero docs](https://zero.rocicorp.dev/docs) -- Documentation
- [Zero sync docs](https://zero.rocicorp.dev/docs/sync) -- Sync architecture
- [Zero deployment](https://zero.rocicorp.dev/docs/deployment) -- Self-hosting
- [Zero roadmap](https://zero.rocicorp.dev/docs/roadmap) -- Future plans
- [Zero open source](https://zero.rocicorp.dev/docs/open-source) -- Apache 2.0 license
- [Replicache homepage](https://replicache.dev/) -- Predecessor (maintenance mode)
- [Replicache GitHub](https://github.com/rocicorp/replicache) -- Open-sourced
- [Rocicorp monorepo fork](https://github.com/cbnsndwch/rocicorp-mono) -- Community fork
- [Testing Zero (marmelab)](https://marmelab.com/blog/2025/02/28/zero-sync-engine.html) -- Third-party review
- [Zero Sync blog post](https://www.benapatton.com/posts/2024-12-20-zero-sync) -- Developer experience report
- [Rocicorp GitHub org](https://github.com/rocicorp) -- All repos

### Turso/libSQL
- [Turso homepage](https://turso.tech/) -- Product overview
- [libSQL GitHub](https://github.com/tursodatabase/libsql) -- Fork of SQLite, MIT license
- [Turso GitHub](https://github.com/tursodatabase/turso) -- Rust rewrite
- [Embedded Replicas docs](https://docs.turso.tech/features/embedded-replicas/introduction) -- Architecture
- [Embedded Replicas blog](https://turso.tech/blog/introducing-embedded-replicas-deploy-turso-anywhere-2085aa0dc242) -- Announcement
- [Local-first with embedded replicas](https://turso.tech/blog/local-first-cloud-connected-sqlite-with-turso-embedded-replicas) -- Use cases
- [DIY Database CDN](https://turso.tech/blog/do-it-yourself-database-cdn-with-embedded-replicas) -- Advanced patterns
- [Turso Sync announcement](https://turso.tech/blog/introducing-databases-anywhere-with-turso-sync) -- Database sync
- [Offline Sync public beta](https://turso.tech/blog/turso-offline-sync-public-beta) -- Bidirectional sync (March 2025)
- [Offline Writes announcement](https://turso.tech/blog/introducing-offline-writes-for-turso) -- Local write support
- [Concurrent Writes](https://turso.tech/blog/beyond-the-single-writer-limitation-with-tursos-concurrent-writes) -- BEGIN CONCURRENT
- [React Native bindings](https://turso.tech/blog/react-native-bindings-for-turso) -- Mobile support
- [Turso local-first page](https://turso.tech/local-first) -- Marketing overview
- [libSQL client TypeScript](https://github.com/tursodatabase/libsql-client-ts) -- TS SDK
- [libSQL client npm](https://www.npmjs.com/package/@libsql/client) -- Package
- [JS/TS SDK docs](https://docs.turso.tech/libsql/client-access/javascript-typescript-sdk) -- API reference
- [libSQL docs](https://docs.turso.tech/libsql) -- Overview
- [Client SDKs](https://docs.turso.tech/libsql/client-access) -- All SDKs
- [Turso + Expo](https://expo.dev/blog/build-offline-first-mobile-apps) -- Mobile integration
- [HN: Turso offline sync](https://news.ycombinator.com/item?id=43535943) -- Community discussion
- [Turso Database GitHub org](https://github.com/tursodatabase) -- All repos

### Mycelial/Mycelite
- [Mycelite GitHub](https://github.com/mycelial/mycelite) -- SQLite extension (abandoned)
- [Mycelial GitHub](https://github.com/mycelial/mycelial) -- Data movement platform
- [Mycelial homepage](https://mycelial.com/) -- Company
- [Mycelial docs](https://docs.mycelial.com/sources/sqlite/) -- SQLite source docs
- [Mycelial Crunchbase](https://www.crunchbase.com/organization/mycelial) -- Company profile
- [HN: Mycelite launch](https://news.ycombinator.com/item?id=36475081) -- Community discussion

### LiveStore
- [LiveStore homepage](https://livestore.dev/) -- Product overview
- [LiveStore GitHub](https://github.com/livestorejs/livestore) -- Main repo, Apache 2.0
- [LiveStore Expo blog](https://expo.dev/blog/local-first-application-development-with-livestore) -- Integration
- [LiveStore GitHub org](https://github.com/livestorejs) -- All repos
- [HN: LiveStore launch](https://news.ycombinator.com/item?id=44105412) -- Community discussion

### Litestream
- [Litestream homepage](https://litestream.io/) -- Product overview
- [Litestream GitHub](https://github.com/benbjohnson/litestream) -- Main repo
- [How Litestream works](https://litestream.io/how-it-works/) -- Architecture
- [Litestream getting started](https://litestream.io/getting-started/) -- Quickstart
- [Litestream revamped (Fly.io)](https://fly.io/blog/litestream-revamped/) -- LTX format upgrade

### SQLite Concurrent Writes
- [SQLite WAL mode docs](https://sqlite.org/wal.html) -- Official WAL documentation
- [SQLite BEGIN CONCURRENT](https://www.sqlite.org/src/doc/begin-concurrent/doc/begin_concurrent.md) -- Experimental multi-writer
- [Concurrent write transactions (blog)](https://oldmoe.blog/2024/07/08/the-write-stuff-concurrent-write-transactions-in-sqlite/) -- Analysis
- [Abusing SQLite for concurrency (SkyPilot)](https://blog.skypilot.co/abusing-sqlite-to-handle-concurrency/) -- Real-world patterns
- [SQLite concurrent writes and "database is locked"](https://tenthousandmeters.com/blog/sqlite-concurrent-writes-and-database-is-locked-errors/) -- Error handling
- [SQLite forum: multiple writers](https://sqlite.org/forum/info/b4e8b29ae409cd198652c6b7e70b53b702f269e67e1d2573d627feeba37bbf85) -- Community discussion
- [SQLite forum: WAL mode with multiple processes](https://sqlite.org/forum/forumpost/c4dbf6ca17) -- Official guidance

### Landscape and Comparisons
- [Offline-First Landscape 2025 (HN)](https://news.ycombinator.com/item?id=45066070) -- Community discussion
- [Neon: Comparing local-first frameworks](https://neon.com/blog/comparing-local-first-frameworks-and-approaches) -- Comprehensive comparison
- [The Spectrum of Local First Libraries](https://tolin.ski/posts/local-first-options) -- Framework taxonomy
- [Best Realtime Sync Engine (Robotist)](https://robotist.com/realtime-sync-engine) -- Comparison
- [26 Best Local-First Databases](https://cssauthor.com/best-local-first-databases-for-web-apps/) -- List
- [BoltAI offline-first tech stack analysis](https://docs.boltai.com/blog/tech-stack-analysis-for-a-cross-platform-offline-first-ai-chat-client) -- AI chat client analysis
- [Offline-first frontend apps 2025 (LogRocket)](https://blog.logrocket.com/offline-first-frontend-apps-2025-indexeddb-sqlite/) -- Overview
- [Local-first software manifesto (Ink & Switch)](https://www.inkandswitch.com/essay/local-first/) -- Foundational paper
- [awesome-local-first (alexanderop)](https://github.com/alexanderop/awesome-local-first) -- Curated list
- [awesome-local-first (meiraleal)](https://github.com/meiraleal/awesome-local-first) -- Curated list
- [awesome-local-first (schickling)](https://github.com/schickling/awesome-local-first) -- Curated list
- [local-first GitHub topic](https://github.com/topics/local-first) -- GitHub topic page
- [Building an offline realtime sync engine (gist)](https://gist.github.com/pesterhazy/3e039677f2e314cb77ffe3497ebca07b) -- Architecture overview
- [Local-First News](https://www.localfirstnews.com/2025-12-18/) -- Newsletter
- [Local-first architecture (Expo docs)](https://docs.expo.dev/guides/local-first/) -- Framework guide
- [SQLite eating the cloud 2025](https://debugg.ai/resources/sqlite-eating-the-cloud-2025-edge-databases-replication-patterns-ditch-server) -- Trend analysis
- [Post-PostgreSQL: SQLite on the Edge](https://www.sitepoint.com/sqlite-edge-production-readiness-2026/) -- Production readiness
- [Claude Flow multi-agent coordination](https://www.analyticsvidhya.com/blog/2026/03/claude-flow/) -- SQLite-based agent coordination reference

### TanStack DB
- [TanStack DB homepage](https://tanstack.com/db/latest) -- Product overview
- [TanStack DB docs](https://tanstack.com/db/latest/docs) -- Documentation
- [TanStack DB GitHub](https://github.com/TanStack/db) -- Main repo
- [TanStack DB SQLite integration issue](https://github.com/TanStack/db/issues/359) -- SQLite support discussion
- [TanStack DB persistence issue](https://github.com/TanStack/db/issues/865) -- Persistence layer plans
- [TanStack DB beta announcement (InfoQ)](https://www.infoq.com/news/2025/08/tanstack-db-beta/) -- Release coverage
- [Interactive guide to TanStack DB](https://frontendatscale.com/blog/tanstack-db/) -- Tutorial
- [Local-first sync with TanStack DB](https://electric-sql.com/blog/2025/07/29/local-first-sync-with-tanstack-db) -- ElectricSQL integration
- [Super-fast apps with TanStack DB](https://electric-sql.com/blog/2025/07/29/super-fast-apps-on-sync-with-tanstack-db) -- Performance

### CRDTs and Theory
- [crdt.tech](https://crdt.tech/) -- CRDT overview
- [CRDT implementations list](https://crdt.tech/implementations) -- All implementations
- [Best CRDT Libraries 2025 (Velt)](https://velt.dev/blog/best-crdt-libraries-real-time-data-sync) -- Comparison
- [CRDT Wikipedia](https://en.wikipedia.org/wiki/Conflict-free_replicated_data_type) -- Background
- [FSL license](https://fsl.software/) -- Functional Source License details

---

## Raw Link Inventory

Every URL encountered during this research, deduplicated:

```
https://electric-sql.com/
https://electric-sql.com/blog
https://electric-sql.com/blog/2023/09/20/introducing-electricsql-v0.6
https://electric-sql.com/blog/2024/01/24/electricsql-v0.9-released
https://electric-sql.com/blog/2024/05/14/electricsql-postgres-client-support
https://electric-sql.com/blog/2025/03/17/electricsql-1.0-released
https://electric-sql.com/blog/2025/07/29/local-first-sync-with-tanstack-db
https://electric-sql.com/blog/2025/07/29/super-fast-apps-on-sync-with-tanstack-db
https://electric-sql.com/blog/2025/08/13/electricsql-v1.1-released
https://electric-sql.com/blog/2025/12/09/announcing-durable-streams
https://electric-sql.com/blog/2025/12/23/durable-streams-0.1.0
https://electric-sql.com/blog/2026/01/12/durable-sessions-for-collaborative-ai
https://electric-sql.com/blog/2026/01/22/announcing-hosted-durable-streams
https://electric-sql.com/docs/reference/alternatives
https://electric-sql.com/docs/stacks
https://electric-sql.com/products/
https://electric-sql.com/products/durable-streams
https://github.com/electric-sql/pglite
https://github.com/electric-sql/postgres-to-sqlite-sync-example
https://github.com/electric-sql/electric-ai-chat
https://github.com/electric-sql/transport
https://legacy.electric-sql.com/docs/reference
https://github.com/aspen-cloud/triplit
https://www.triplit.dev/
https://www.triplit.dev/blog
https://www.triplit.dev/blog/triplit-1.0
https://www.triplit.dev/blog/triplit-1-0-coming-soon
https://www.triplit.dev/blog/release-notes-2024-06-14
https://www.triplit.dev/blog/release-notes-2024-03-29
https://www.triplit.dev/blog/release-notes-2025-04-11
https://www.triplit.dev/docs
https://supabase.com/blog/triplit-joins-supabase
https://supabase.com/partners/integrations/powersync
https://www.powersync.com/
https://www.powersync.com/blog
https://www.powersync.com/blog/electricsql-electric-next-vs-powersync
https://www.powersync.com/blog/introducing-powersync-v1-0-postgres-sqlite-sync-layer
https://www.powersync.com/blog/powersync-open-edition-release
https://www.powersync.com/blog/new-open-era-for-powersync
https://www.powersync.com/blog/sqlite-persistence-on-the-web
https://www.powersync.com/open-source
https://www.powersync.com/legal/fsl
https://www.powersync.com/legal/overview
https://docs.powersync.com/intro/powersync-overview
https://docs.powersync.com/intro/self-hosting
https://docs.powersync.com/llms.txt
https://github.com/powersync-ja
https://github.com/powersync-ja/powersync-js
https://github.com/powersync-ja/powersync-sqlite-core
https://github.com/powersync-ja/self-host-demo
https://github.com/evoluhq/evolu
https://www.evolu.dev/docs/quickstart
https://www.evolu.dev/docs/how-evolu-works
https://www.evolu.dev/blog/scaling-local-first-software
https://www.npmjs.com/package/evolu
https://github.com/evoluhq/evolu/issues/536
https://automerge.org/
https://automerge.org/docs/hello/
https://automerge.org/docs/cookbook/modeling-data/
https://automerge.org/blog/automerge-2/
https://automerge.org/blog/automerge-repo/
https://github.com/automerge/automerge
https://www.npmjs.com/package/automerge-repo
https://github.com/bijela-gora/automerge-repo-storage-better-sqlite3
https://jsr.io/@marionauta/automerge-repo-better-sqlite3
https://zero.rocicorp.dev/
https://zero.rocicorp.dev/docs
https://zero.rocicorp.dev/docs/sync
https://zero.rocicorp.dev/docs/deployment
https://zero.rocicorp.dev/docs/roadmap
https://zero.rocicorp.dev/docs/open-source
https://replicache.dev/
https://github.com/rocicorp/replicache
https://github.com/rocicorp
https://github.com/cbnsndwch/rocicorp-mono
https://marmelab.com/blog/2025/02/28/zero-sync-engine.html
https://www.benapatton.com/posts/2024-12-20-zero-sync
https://turso.tech/
https://turso.tech/local-first
https://turso.tech/blog/local-first-cloud-connected-sqlite-with-turso-embedded-replicas
https://turso.tech/blog/introducing-embedded-replicas-deploy-turso-anywhere-2085aa0dc242
https://turso.tech/blog/do-it-yourself-database-cdn-with-embedded-replicas
https://turso.tech/blog/introducing-databases-anywhere-with-turso-sync
https://turso.tech/blog/turso-offline-sync-public-beta
https://turso.tech/blog/introducing-offline-writes-for-turso
https://turso.tech/blog/beyond-the-single-writer-limitation-with-tursos-concurrent-writes
https://turso.tech/blog/react-native-bindings-for-turso
https://docs.turso.tech/features/embedded-replicas/introduction
https://docs.turso.tech/libsql
https://docs.turso.tech/libsql/client-access
https://docs.turso.tech/libsql/client-access/javascript-typescript-sdk
https://github.com/tursodatabase/libsql
https://github.com/tursodatabase/libsql-client-ts
https://github.com/tursodatabase/turso
https://github.com/tursodatabase
https://www.npmjs.com/package/@libsql/client
https://github.com/mycelial/mycelite
https://github.com/mycelial/mycelial
https://mycelial.com/
https://docs.mycelial.com/sources/sqlite/
https://docs.mycelial.com/getting-started/tutorial/
https://www.crunchbase.com/organization/mycelial
https://github.com/mycelial/mycelite-kafka
https://livestore.dev/
https://github.com/livestorejs/livestore
https://github.com/livestorejs
https://expo.dev/blog/local-first-application-development-with-livestore
https://litestream.io/
https://litestream.io/how-it-works/
https://litestream.io/getting-started/
https://github.com/benbjohnson/litestream
https://fly.io/blog/litestream-revamped/
https://sqlite.org/wal.html
https://www.sqlite.org/src/doc/begin-concurrent/doc/begin_concurrent.md
https://oldmoe.blog/2024/07/08/the-write-stuff-concurrent-write-transactions-in-sqlite/
https://blog.skypilot.co/abusing-sqlite-to-handle-concurrency/
https://tenthousandmeters.com/blog/sqlite-concurrent-writes-and-database-is-locked-errors/
https://sqlite.org/forum/info/b4e8b29ae409cd198652c6b7e70b53b702f269e67e1d2573d627feeba37bbf85
https://sqlite.org/forum/forumpost/c4dbf6ca17
https://tanstack.com/db/latest
https://tanstack.com/db/latest/docs
https://tanstack.com/db/latest/docs/collections/powersync-collection
https://github.com/TanStack/db
https://github.com/TanStack/db/issues/359
https://github.com/TanStack/db/issues/865
https://www.infoq.com/news/2025/08/tanstack-db-beta/
https://frontendatscale.com/blog/tanstack-db/
https://news.ycombinator.com/item?id=45066070
https://news.ycombinator.com/item?id=40788648
https://news.ycombinator.com/item?id=37584049
https://news.ycombinator.com/item?id=38473743
https://news.ycombinator.com/item?id=38984411
https://news.ycombinator.com/item?id=40976731
https://news.ycombinator.com/item?id=36475081
https://news.ycombinator.com/item?id=43535943
https://news.ycombinator.com/item?id=44105412
https://news.ycombinator.com/item?id=44929478
https://neon.com/blog/comparing-local-first-frameworks-and-approaches
https://dev.to/neon-postgres/comparing-local-first-frameworks-and-approaches-1hgn
https://tolin.ski/posts/local-first-options
https://merginit.com/blog/24082025-sync-engines-guide-electricsql-convex-zero
https://robotist.com/realtime-sync-engine
https://cssauthor.com/best-local-first-databases-for-web-apps/
https://docs.boltai.com/blog/tech-stack-analysis-for-a-cross-platform-offline-first-ai-chat-client
https://blog.logrocket.com/offline-first-frontend-apps-2025-indexeddb-sqlite/
https://www.inkandswitch.com/essay/local-first/
https://github.com/alexanderop/awesome-local-first
https://github.com/meiraleal/awesome-local-first
https://github.com/schickling/awesome-local-first
https://github.com/topics/local-first
https://gist.github.com/pesterhazy/3e039677f2e314cb77ffe3497ebca07b
https://www.localfirstnews.com/2025-12-18/
https://www.localfirstnews.com/2025-05-29/
https://docs.expo.dev/guides/local-first/
https://debugg.ai/resources/sqlite-eating-the-cloud-2025-edge-databases-replication-patterns-ditch-server
https://www.sitepoint.com/sqlite-edge-production-readiness-2026/
https://www.analyticsvidhya.com/blog/2026/03/claude-flow/
https://crdt.tech/
https://crdt.tech/implementations
https://en.wikipedia.org/wiki/Conflict-free_replicated_data_type
https://velt.dev/blog/best-crdt-libraries-real-time-data-sync
https://fsl.software/
https://www.gnu.org/licenses/agpl-3.0.en.html
https://github.com/payloadcms/payload/discussions/12506
https://github.com/vlcn-io/cr-sqlite
https://github.com/vlcn-io/cr-sqlite/releases
https://github.com/vlcn-io/cr-sqlite/releases/tag/v0.15.1
https://github.com/vlcn-io/cr-sqlite/wiki
https://github.com/vlcn-io/cr-sqlite/blob/main/README.md
https://github.com/vlcn-io/cr-sqlite/blob/main/notes.md
https://github.com/vlcn-io/cr-sqlite/discussions/424
https://github.com/vlcn-io
https://www.vlcn.io/docs/cr-sqlite/intro
https://www.vlcn.io/docs/cr-sqlite/installation
https://vlcn.io/
https://www.npmjs.com/package/@vlcn.io/crsqlite
https://github.com/sqliteai/sqlite-sync
https://github.com/sqliteai/sqlite-sync/releases
https://github.com/sqliteai
https://github.com/sqliteai/sqlite-ai
https://github.com/sqliteai/sqlite-vector
https://github.com/sqliteai/liteparser
https://www.sqlite.ai/
https://www.sqlite.ai/sqlite-sync
https://docs.sqlitecloud.io/docs/sqlite-sync-introduction
https://docs.sqlitecloud.io/docs/ai-overview
https://www.npmjs.com/package/@sqliteai/sqlite-wasm
https://www.npmjs.com/package/@sqliteai/sqlite-mcp
https://central.sonatype.com/artifact/ai.sqlite/sync
https://marcobambini.substack.com/p/the-secret-life-of-a-local-first
https://github.com/nimmen/crdt-sqlite
https://github.com/uptonking/note4yaoo/blob/main/lib-collab-crdt-examples.md
https://github.com/DavidWells/stars/blob/master/stars/aspen-cloud/triplit.md
https://github.com/richardsonjf/livestorejs-livestore
https://github.com/fforres/rocicorp-zero
https://github.com/rocicorp/zero-docs
https://github.com/code/lib-libsql
https://github.com/warmchang/libsql-SQLite
https://github.com/SmartBear/automerge
https://github.com/datasette/datasette-litestream
https://github.com/andrewgilliland/TriplitDemo
https://github.com/sabbaticaldev/awesome-local-first
https://medium.com/@cosmicray001/going-production-ready-with-sqlite-how-litestream-makes-it-possible-74f894fc96f0
https://medium.com/@mehdibafdil/pglite-run-postgres-anywhere-yes-the-browser-9aa08e8a635b
https://medium.com/@Hiadore/how-to-incorporate-agpl-licensed-software-in-your-closed-source-commercial-application-ac8c74a2049d
https://medium.com/swlh/understanding-the-agpl-the-most-misunderstood-license-86fd1fe91275
https://medium.com/lets-code-future/turso-the-sqlite-that-hit-the-gym-and-moved-to-the-cloud-2c946cd48158
https://thelinuxcode.com/sqlite-for-modern-apps-a-practical-first-look-2026/
https://nerdleveltech.com/sqlite-in-2025-the-unsung-hero-powering-modern-apps
https://vibe.forem.com/eira-wexford/best-sqlite-solutions-for-react-native-app-development-in-2026-3b5l
https://www.sqliteforum.com/p/sqlite-for-microservices
https://www.ersin.nz/articles/creating-the-local-first-stack
https://www.localfirst.fm/
https://kitemetric.com/blogs/unlocking-the-power-of-offline-sync-with-turso
https://dasroot.net/posts/2025/12/local-first-software-offline-applications/
https://alexop.dev/posts/what-is-local-first-web-development/
https://vasundhara.io/blogs/offline-first-app-development-still-relevant-in-2025
https://scratchpad.blog/effortless-sqlite-backups-for-rails-with-litestream/
https://logsnag.com/blog/the-tiny-stack
https://interjectedfuture.com/lab-notes/lab-notes-021-crdt-in-depth/
https://jaredforsyth.com/posts/local-first-database-hypermerge/
https://supabase.com/blog/triplit-joins-supabase
https://techcrunch.com/2025/10/03/supabase-nabs-5b-valuation-four-months-after-hitting-2b/
https://taptwicedigital.com/stats/supabase
https://tracxn.com/d/companies/triplit/__x4lW8LTy9M-_HTnwDKIR_pQT20dj4At8QwnotADgsvQ
https://www.linkedin.com/in/matthewlinkous/
https://www.linkedin.com/posts/matthewlinkous_im-excited-to-share-that-triplit-has-been-activity-7381782771523960832-6brr
https://www.cdata.com/kb/tech/sqlite-sync-mysql.rst
https://www.cdata.com/kb/tech/bridge-sync-sqlite.rst
https://x.com/electricsql
https://x.com/livestoredev/status/1927303505213001916
https://arxiv.org/html/2503.17826v1
```
