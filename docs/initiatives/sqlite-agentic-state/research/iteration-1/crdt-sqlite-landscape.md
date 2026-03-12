# CRDT-on-SQLite Landscape: cr-sqlite, SQLite-Sync, and Alternatives

**Research iteration:** 1
**Date:** 2026-03-12
**Focus:** What do cr-sqlite and SQLite-Sync actually provide as CRDT mechanisms for SQLite?

---

## Key Discoveries

### 1. cr-sqlite (vlcn-io/cr-sqlite)

- **What it is:** A runtime-loadable SQLite extension (written in Rust, compiled to C ABI) that upgrades regular SQLite tables into CRRs (Conflict-free Replicated Relations). Tables keep their normal SQL interface but gain CRDT merge semantics behind the scenes.
  - Source: https://github.com/vlcn-io/cr-sqlite

- **Maintainer:** Matt Wonlaw (GitHub: @tantaman), sole primary maintainer, operating under "One Law LLC" and the vlcn-io org. He joined Rocicorp full-time to build "Zero" (a different sync engine) and explicitly stated cr-sqlite is on hold: "I'm full time on https://zero.rocicorp.dev/ these days. When that project becomes more mature I'll have more bandwidth again but I don't see that happening for at least 1-2 years."
  - Source: https://github.com/vlcn-io/cr-sqlite/issues/444

- **Current status: Effectively dormant.** Last release: v0.16.3 on 2024-01-17. Last substantive code commit: January 2024. Last commit of any kind: October 2024 (doc link fixes). 54 open issues, unmerged PRs. The project is NOT archived or deprecated -- it still works -- but it has a single maintainer who is working on something else.
  - Source: https://github.com/vlcn-io/cr-sqlite/releases

- **License:** MIT (Copyright 2023 One Law LLC)

- **Stars/forks:** 3,653 stars, 112 forks

### 2. cr-sqlite CRDT Types and Granularity

- **Table-level CRDTs** control which rows exist after merge:
  - **Causal Length Sets (default):** Rows can be inserted, deleted, and re-inserted. Tombstones with causal clocks track deletions.
  - **Delete-Wins Sets:** Once deleted, a row cannot be re-inserted.
  - **Grow-Only Sets:** Rows can only be added, never removed.
  - Source: https://vlcn.io/docs/cr-sqlite/crdts/table-crdts

- **Column-level CRDTs** control how individual field values merge:
  - **LWW Register (default):** Last-Writer-Wins. Highest `col_version` wins; on tie, lexicographically largest value wins; final tiebreaker is `site_id` comparison.
  - **Fractional Index:** For user-defined ordering of rows (e.g., drag-and-drop lists). Divides space between existing positions.
  - **Counter:** NOT YET IMPLEMENTED (referenced in issue #65).
  - **Multi-Value Register:** NOT YET IMPLEMENTED (planned).
  - **RGA (Replicated Growable Array):** NOT YET IMPLEMENTED (planned, for sequences/text).
  - Source: https://vlcn.io/docs/cr-sqlite/crdts/column-crdts

- **Conflict resolution is column-level, not row-level.** Two agents updating different columns of the same row will both succeed without conflict. Only same-column concurrent writes trigger LWW resolution.
  - Source: https://superfly.github.io/corrosion/crdts.html

### 3. cr-sqlite Conflict Resolution Mechanics

- Uses **Lamport timestamps** (monotonically increasing logical counters), NOT wall-clock time.
- Each CRR table gets a shadow table `<table>__crsql_clock` tracking per-column version metadata.
- Resolution order for LWW: (1) highest `col_version` wins, (2) on version tie, lexicographically largest value wins via SQLite's `max()`, (3) final tiebreaker: `site_id` comparison.
  - Source: https://superfly.github.io/corrosion/crdts.html

- **Merge is deterministic and convergent:** All replicas applying the same set of changes will arrive at the same state regardless of application order.

### 4. cr-sqlite API Surface

```sql
-- Load the extension
.load crsqlite

-- Upgrade a table to a CRR
SELECT crsql_as_crr('my_table');

-- Read changesets (for syncing to peers)
SELECT "table", "pk", "cid", "val", "col_version", "db_version",
       "site_id", "cl", "seq"
FROM crsql_changes
WHERE db_version > ? AND site_id = crsql_site_id();

-- Apply changesets (received from a peer)
INSERT INTO crsql_changes
  ("table", "pk", "cid", "val", "col_version", "db_version",
   "site_id", "cl", "seq")
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);

-- Schema migrations on CRR tables
SELECT crsql_begin_alter('my_table');
ALTER TABLE my_table ADD COLUMN new_col TEXT DEFAULT '';
SELECT crsql_commit_alter('my_table');

-- Get local site identifier
SELECT crsql_site_id();

-- Cleanup before closing
SELECT crsql_finalize();
```

- Source: https://vlcn.io/docs/cr-sqlite/quickstart
- Source: https://vlcn.io/docs/cr-sqlite/api-methods/crsql_changes

The `crsql_changes` virtual table is the central sync primitive. It provides a unified view of all changes. Application code writes to normal SQL tables; networking code reads from and writes to `crsql_changes`.

**Critical gotcha:** All values MUST be passed as SQL bind parameters. Direct string interpolation into `crsql_changes` INSERTs causes undefined behavior.

### 5. SQLite-Sync (sqlite.ai / SQLite Cloud)

- **What it is:** A SQLite extension from SQLite Cloud, Inc. providing CRDT-based sync with built-in networking. Unlike cr-sqlite which is sync-layer-agnostic, SQLite-Sync bundles its own network stack.
  - Source: https://github.com/sqliteai/sqlite-sync
  - Source: https://www.sqlite.ai/sqlite-sync

- **Maintainer:** SQLite Cloud, Inc. (Marco Bambini and team). NOT affiliated with the SQLite project itself despite the confusing naming.

- **Current status: Actively maintained.** Last push: 2026-03-11. Written in C. 414 stars, 12 forks.

- **License: Elastic License 2.0 (modified).** Free for open-source projects under OSI-approved licenses. **Requires commercial license for non-open-source production use or managed services.** This is a significant constraint.
  - Source: https://github.com/sqliteai/sqlite-sync/blob/main/LICENSE.md

- **CRDT implementation:** Column-level LWW with Lamport timestamps, very similar to cr-sqlite's approach. Per-column metadata tracking (site_id, column_name, row_key, column_version, db_version, op_type, seq). Conflict resolution is column-by-column with deterministic merge.
  - Source: https://marcobambini.substack.com/p/the-secret-life-of-a-local-first

- **Key difference from cr-sqlite:** SQLite-Sync is tightly coupled to SQLite Cloud infrastructure for cloud sync. It's unclear whether peer-to-peer sync works without SQLite Cloud.
  - Source: https://docs.sqlitecloud.io/docs/sqlite-sync-introduction

### 6. SQLite-Sync API Surface

```sql
-- Load the extension
.load ./cloudsync

-- Initialize sync on a table
SELECT cloudsync_init('my_table');

-- Generate distributed-safe UUIDs (UUIDv7)
SELECT cloudsync_uuid();

-- Optional: connect to SQLite Cloud
SELECT cloudsync_network_init('connection_string');
SELECT cloudsync_network_set_apikey('key');
SELECT cloudsync_network_sync();  -- bidirectional sync

-- Cleanup
SELECT cloudsync_terminate();
```

- Source: https://docs.sqlitecloud.io/docs/sqlite-sync-getting-started

### 7. SQLite-Sync Known Limitations

- **Foreign keys are problematic.** CRDT changes are applied column-by-column, so columns may temporarily receive DEFAULT values during merge. This breaks foreign key constraints if the referenced row hasn't arrived yet.
  - Source: https://docs.sqlitecloud.io/docs/sqlite-sync-best-practices

- **Triggers fire multiple times.** UPDATE triggers fire once per column processed during merge, not once per row. Triggers that modify synced tables may execute twice.
  - Source: https://docs.sqlitecloud.io/docs/sqlite-sync-best-practices

- **Must use TEXT primary keys with UUIDs/ULIDs.** Auto-incrementing integers cause conflicts across devices.
  - Source: https://docs.sqlitecloud.io/docs/sqlite-sync-best-practices

- **No relational integrity guarantees.** Each column merges independently; cross-column and cross-table invariants cannot be maintained by the CRDT layer.
  - Source: https://news.ycombinator.com/item?id=45527840

### 8. Performance Characteristics

**cr-sqlite:**
- Inserts into CRRs are **2.5x slower** than regular SQLite tables.
- Reads maintain equivalent performance.
- v0.16.1 achieved **5x reduction in CRDT metadata weight** (at cost of 15% write perf reduction).
- v0.16.1 achieved **10x improvement for table migration** operations.
- Source: https://github.com/vlcn-io/cr-sqlite, https://github.com/vlcn-io/cr-sqlite/releases

**SQLite-Sync:**
- No published benchmarks found. Claims "optimized binary encoding" and "automatic batching."

**Fly.io/Corrosion production numbers (cr-sqlite in production):**
- 7.5 million rows replicated globally across Fly.io's fleet
- 300K+ operations per second aggregate across the cluster
- p99 time-to-replication: ~1 second
- Source: https://github.com/vlcn-io/cr-sqlite/issues/444 (comment by @jeromegn, Fly.io engineer)

### 9. Production Deployments

**Fly.io / Corrosion (cr-sqlite) -- THE major production deployment:**
- Corrosion is Fly.io's globally-distributed state system that replaced Consul.
- Uses cr-sqlite to share machine/service state across thousands of nodes in 40+ regions.
- Fly.io maintains their own fork: https://github.com/superfly/cr-sqlite (actively maintained, last commit Feb 2026).
- The fork has significant changes: repurposed `db_version` to be monotonically incrementing per `site_id` for gap detection.
- Source: https://fly.io/blog/corrosion/

**Corrosion production incidents (critical reading for any adopter):**
- **Nov 25, 2024 outage (11.5 hours):** A schema change (adding nullable column to largest table) triggered cr-sqlite to backfill every row with default null values. This generated tens of gigabytes of gossip traffic, saturated switch links, and threw Corrosion into CPU/memory restart loops across multiple regions. Required re-seeding from external source of truth.
  - Source: https://fly.io/infra-log/2024-11-30/
- **Sept 1, 2024 outage:** Corrosion update with new config option caused fleet-wide proxy deadlock (Rust concurrency bug, not cr-sqlite itself).
  - Source: https://fly.io/infra-log/2024-11-30/

**Actual Budget (custom CRDT-on-SQLite, not cr-sqlite):**
- Personal finance app using custom HLC-based CRDT implementation on SQLite.
- Data stored twice (normal tables + messages_crdt table). ~2x storage overhead but database remains small (~16MB).
- Server is 300 lines of code.
- Source: https://archive.jlongster.com/using-crdts-in-the-wild

### 10. Alternatives

| Project | Approach | Status | License | Notes |
|---------|----------|--------|---------|-------|
| **cr-sqlite** (vlcn-io) | SQLite extension, CRDT | Dormant (works, not maintained) | MIT | Column-level LWW, fractional index |
| **cr-sqlite** (superfly fork) | Fork of above | Active (Feb 2026) | MIT | Fly.io's production fork, custom `db_version` |
| **SQLite-Sync** (sqlite.ai) | SQLite extension, CRDT + networking | Active | Elastic 2.0 (commercial restrictions) | Tightly coupled to SQLite Cloud |
| **Corrosion** (Fly.io) | Rust daemon wrapping cr-sqlite + gossip | Active | Apache 2.0 | Full distributed system, not just extension |
| **ElectricSQL** | Postgres-to-SQLite sync layer | Active | Apache 2.0 | Requires Postgres backend; CRDT internally but not user-facing |
| **SQLSync** (orbitinghail) | Wrapper around SQLite with sync | Prototype | Unknown | Reducer-based conflict resolution |
| **Mycelite** | SQLite extension | Active | Unknown | Physical single-writer replication (binary page diffs), NOT CRDT |
| **replic-sqlite** (carboneio) | SQLite replication | Active | Unknown | Row-level CRDT, protocol agnostic |
| **Synql** (INRIA) | Academic CRDT-relational DB | Research | Unknown | Addresses integrity constraints (foreign keys, uniqueness) -- the hardest unsolved problem |
| **Actual Budget approach** | Custom CRDT on SQLite | Production | N/A (not a library) | HLC-based, message table pattern |
| **Ditto** | Mobile CRDT database | Commercial | Proprietary | P2P mesh, not SQLite-based |
| **Zero** (Rocicorp) | Sync engine (not CRDT) | Active | Unknown | Server reconciliation, not CRDTs. Matt Wonlaw's current project |

- Sources: https://electric-sql.com/docs/reference/alternatives, https://sqlsync.dev/, https://github.com/mycelial/mycelite, https://github.com/carboneio/replic-sqlite, https://github.com/coast-team/synql, https://zero.rocicorp.dev/

---

## Implications for Sherpa's Agentic State Store

### What works well for our topology

1. **cr-sqlite's core concept is sound for our use case.** Multiple agents on the same machine or small cluster, each with their own SQLite connection, writing concurrently -- this is exactly the multi-writer scenario CRDTs solve. Column-level LWW means agents updating different fields of the same task/state row merge cleanly.

2. **The API is minimal and SQL-native.** `crsql_as_crr()` to upgrade tables, then just read/write normally. The `crsql_changes` virtual table provides a clean changeset abstraction. No new query language or ORM to learn.

3. **We don't need global distribution.** Our topology (local machine, maybe small cluster) avoids the scaling challenges that caused Fly.io's outages. Schema changes on a local cluster are trivial compared to 40+ regions.

### Risks and concerns

1. **cr-sqlite is dormant with a single maintainer.** The upstream vlcn-io repo has had no substantive commits since January 2024. Matt Wonlaw is working on Zero at Rocicorp and won't return to cr-sqlite for "at least 1-2 years." If we depend on this, we're adopting abandoned-in-practice software.

2. **Fly.io's fork is the real production version** but is optimized for their specific use case (global gossip). Their fork at https://github.com/superfly/cr-sqlite is actively maintained but may diverge from upstream assumptions.

3. **SQLite-Sync has license restrictions.** Elastic License 2.0 requires commercial license for non-open-source production use. If Sherpa is distributed as a framework, this is a hard constraint.

4. **Foreign keys and triggers don't work cleanly with either solution.** Column-by-column merge breaks referential integrity constraints. Both cr-sqlite and SQLite-Sync recommend application-level integrity instead. For an agentic state store, this means the schema must be denormalized or integrity must be enforced at the application layer.

5. **LWW may be insufficient for agentic state.** When Agent A sets `task.status = 'in-progress'` and Agent B simultaneously sets `task.status = 'completed'`, LWW will pick whichever has the higher Lamport clock. This is deterministic but not necessarily semantically correct. Some state transitions need application-level conflict resolution, not just "latest write wins."

6. **The 2.5x write overhead matters.** If the state store is write-heavy (agents frequently updating progress, logs, intermediate results), the overhead compounds. However, for our scale (local machine, not millions of rows), this is likely acceptable.

### Recommended path

**For Sherpa's use case, the simplest viable approach may not need CRDTs at all.** Our agents run on the same machine or tight cluster. SQLite's WAL mode with careful connection management may suffice. If we DO need multi-writer merge:

1. **Consider the Actual Budget pattern** -- custom HLC-based message table on plain SQLite. It's ~300 lines of server code, well-understood, and doesn't require loading a C extension. James Long's implementation is battle-tested.

2. **If adopting cr-sqlite, use Fly.io's fork** (superfly/cr-sqlite) as it's actively maintained with real production experience behind it.

3. **Avoid SQLite-Sync for framework use** due to Elastic License restrictions on commercial production use.

4. **Design the schema for CRDT-friendliness** from day one: TEXT primary keys with UUIDs, all NOT NULL columns with defaults, no foreign keys at the DB level, denormalized where possible.

---

## Open Questions

1. **Do we actually need multi-writer CRDT, or is SQLite WAL mode with a write queue sufficient?** Our agents could serialize writes through a single coordinator. CRDTs solve distributed multi-writer, but if we can avoid the problem entirely...

2. **What happens to cr-sqlite's CRDT metadata when databases grow?** The 5x metadata reduction in v0.16.1 helps, but there's no published data on metadata-to-data ratios at various scales.

3. **Can cr-sqlite run in-process with better-sqlite3 (Node.js)?** Sherpa is a Node.js/TypeScript framework. Loading a native SQLite extension into better-sqlite3 is possible but needs verification.

4. **What does Fly.io's Corrosion fork change, specifically?** The `db_version` per-site-id change is documented in the issue, but there may be other divergences that matter.

5. **Could the Synql (INRIA) approach to integrity constraints be applied on top of cr-sqlite?** Synql addresses foreign keys and uniqueness constraints in CRDT-replicated relational databases -- the exact gap in cr-sqlite.

6. **What is the overhead of loading crsqlite extension on every connection?** For short-lived agent sessions, extension load time matters.

7. **How does ElectricSQL's approach compare for a TypeScript-native stack?** It requires Postgres but provides a more complete sync story with active maintenance.

---

## Sources

### Primary documentation
- [cr-sqlite GitHub repo](https://github.com/vlcn-io/cr-sqlite) -- Main project, MIT license, 3.6K stars
- [cr-sqlite quickstart](https://vlcn.io/docs/cr-sqlite/quickstart) -- Complete setup walkthrough
- [cr-sqlite API: crsql_changes](https://vlcn.io/docs/cr-sqlite/api-methods/crsql_changes) -- Virtual table schema and usage
- [cr-sqlite column CRDTs](https://vlcn.io/docs/cr-sqlite/crdts/column-crdts) -- LWW, fractional index, counter docs
- [cr-sqlite table CRDTs](https://vlcn.io/docs/cr-sqlite/crdts/table-crdts) -- Causal length sets, delete-wins, grow-only
- [cr-sqlite intro](https://vlcn.io/docs/cr-sqlite/intro) -- Architecture overview
- [cr-sqlite releases](https://github.com/vlcn-io/cr-sqlite/releases) -- Version history and changelogs
- [cr-sqlite "Is this project dead?" issue #444](https://github.com/vlcn-io/cr-sqlite/issues/444) -- Maintainer status, Fly.io production numbers

### Fly.io / Corrosion
- [Fly.io Corrosion blog post](https://fly.io/blog/corrosion/) -- Architecture, SWIM gossip, QUIC, cr-sqlite integration
- [Corrosion CRDT docs](https://superfly.github.io/corrosion/crdts.html) -- Column-level conflict resolution details, Lamport timestamps
- [Fly.io Nov 2024 outage postmortem](https://fly.io/infra-log/2024-11-30/) -- Schema change causing 11.5-hour outage
- [Fly.io cr-sqlite fork](https://github.com/superfly/cr-sqlite) -- Actively maintained fork (last commit Feb 2026)
- [Corrosion GitHub](https://github.com/superfly/corrosion) -- Full distributed system
- [QCon London 2025: Corrosion talk](https://qconlondon.com/presentation/apr2025/fast-eventual-consistency-inside-corrosion-distributed-system-powering-flyio)
- [InfoQ: Corrosion distributed system](https://www.infoq.com/news/2025/04/corrosion-distributed-system-fly/)

### SQLite-Sync / SQLite Cloud
- [SQLite-Sync GitHub repo](https://github.com/sqliteai/sqlite-sync) -- Main project, Elastic License 2.0
- [SQLite-Sync product page](https://www.sqlite.ai/sqlite-sync) -- Marketing overview
- [SQLite-Sync introduction docs](https://docs.sqlitecloud.io/docs/sqlite-sync-introduction) -- Architecture, platform support
- [SQLite-Sync best practices](https://docs.sqlitecloud.io/docs/sqlite-sync-best-practices) -- Schema design, FK limitations, trigger gotchas
- [SQLite-Sync getting started](https://docs.sqlitecloud.io/docs/sqlite-sync-getting-started) -- Quickstart
- [Marco Bambini: Secret Life of a Local-First Value](https://marcobambini.substack.com/p/the-secret-life-of-a-local-first) -- CRDT internals deep dive
- [HN discussion: CRDT and SQLite](https://news.ycombinator.com/item?id=45527840) -- Community feedback on SQLite-Sync approach
- [SQLite Cloud main site](https://sqlitecloud.io/)
- [SQLite AI main site](https://www.sqlite.ai/)
- [SQLite-AI extension](https://github.com/sqliteai/sqlite-ai)
- [SQLite-Vector extension](https://github.com/sqliteai/sqlite-vector)
- [SQLite extensions guide](https://github.com/sqliteai/sqlite-extensions-guide)

### Actual Budget (production CRDT-on-SQLite)
- [James Long: Using CRDTs in the Wild](https://archive.jlongster.com/using-crdts-in-the-wild) -- Complete implementation walkthrough
- [CRDT example app](https://github.com/jlongster/crdt-example-app) -- Reference implementation
- [Annotated CRDT example](https://github.com/clintharris/crdt-example-app_annotated) -- Community-annotated version
- [localfirst.fm #7: James Long](https://www.localfirst.fm/7) -- Podcast on HLC and Actual Budget

### Alternatives and broader ecosystem
- [ElectricSQL alternatives page](https://electric-sql.com/docs/reference/alternatives) -- Comprehensive comparison
- [SQLSync](https://sqlsync.dev/) -- Reducer-based SQLite sync
- [SQLSync GitHub](https://github.com/orbitinghail/sqlsync)
- [Mycelite](https://github.com/mycelial/mycelite) -- Physical replication (not CRDT)
- [replic-sqlite](https://github.com/carboneio/replic-sqlite) -- Row-level CRDT replication
- [Synql (INRIA)](https://github.com/coast-team/synql) -- CRDT-relational with integrity constraints
- [Synql paper](https://inria.hal.science/hal-04969158v3/document) -- Academic paper on CRDT + relational integrity
- [Synql SpringerLink](https://link.springer.com/chapter/10.1007/978-3-031-62638-8_2) -- Published version
- [Zero by Rocicorp](https://zero.rocicorp.dev/) -- Matt Wonlaw's current project (server reconciliation, not CRDT)
- [Fireproof](https://use-fireproof.com) -- Pure JS CRDT database
- [PowerSync](https://www.powersync.com/) -- Postgres-to-SQLite sync
- [Ditto](https://www.ditto.live/) -- Commercial P2P CRDT database
- [libSQL/Turso](https://github.com/tursodatabase/libsql) -- SQLite fork with embedded replicas
- [Corrosion vs Turso discussion](https://community.fly.io/t/corrosion-vs-turso-for-a-caching-layer/21032)

### Background / academic
- [crdt.tech](https://crdt.tech/) -- CRDT overview and implementations list
- [CRDT implementations list](https://crdt.tech/implementations)
- [Causal-Length CRDT paper](https://dl.acm.org/doi/pdf/10.1145/3380787.3393678)
- [HLC paper](https://cse.buffalo.edu/tech-reports/2014-04.pdf) -- Hybrid Logical Clocks
- [Lamport timestamps (Wikipedia)](https://en.wikipedia.org/wiki/Lamport_timestamp)
- [Martin Kleppmann CRDT primer (video)](https://www.youtube.com/watch?v=x7drE24geUw)
- [CRDT Dictionary field guide](https://www.iankduncan.com/engineering/2025-11-27-crdt-dictionary/)
- [Augmenting SQLite for Local-First Software (Springer)](https://link.springer.com/chapter/10.1007/978-3-030-85082-1_22)

### Podcasts and talks
- [localfirst.fm #10: Matt Wonlaw](https://www.localfirst.fm/10) -- cr-sqlite deep dive
- [Contributor podcast: vlcn with Matt Wonlaw](https://contributor.substack.com/p/take-your-own-advice-vlcn-with-matt)
- [InfoQ podcast: Somtochi Onyekwere on Corrosion](https://tldrecap.tech/posts/podcast/infoq/flyio-corrosion-crtds/)

### Other links encountered
- [Simon Willison: Trying cr-sqlite on macOS](https://til.simonwillison.net/sqlite/cr-sqlite-macos)
- [cr-sqlite Observable notebook](https://observablehq.com/@tantaman/cr-sqlite-basic-setup)
- [vlcn Discord](https://discord.gg/AtdVY6zDW3)
- [cr-sqlite roadmap discussion #347](https://github.com/vlcn-io/cr-sqlite/discussions/347)
- [cr-sqlite electron/better-sqlite3 discussion #424](https://github.com/vlcn-io/cr-sqlite/discussions/424)
- [Azarattum CRSqlite fork](https://github.com/Azarattum/CRSqlite)
- [nimmen crdt-sqlite fork](https://github.com/nimmen/crdt-sqlite)
- [SQLite CRDT + Session Extension gist](https://gist.github.com/rodydavis/a4d1dccb11e5a4cd77fe7e4e64f5dbdf)
- [cr-sqlite virtual table proposal #181](https://github.com/vlcn-io/cr-sqlite/issues/181)
- [awesome-crdt](https://github.com/alangibson/awesome-crdt)
- [awesome-sqlite](https://github.com/lichuang/awesome-sqlite)
- [awesome-local-first](https://github.com/alexanderop/awesome-local-first)
- [offline-first project list](https://github.com/arn4v/offline-first)
- [Spacedrive sync architecture](https://www.spacedrive.com/docs/developers/architecture/sync)
- [SQLite Renaissance (BMPI)](https://www.bmpi.dev/en/dev/renaissance-sqlite/)
- [Expo cr-sqlite PoC](https://expo.dev/changelog/2023-08-10-cr-sqlite)
- [HN: cr-sqlite launch discussion](https://news.ycombinator.com/item?id=33606311)
- [Fly.io infra log](https://fly.io/infra-log/)
- [Building an offline realtime sync engine (gist)](https://gist.github.com/pesterhazy/3e039677f2e314cb77ffe3497ebca07b)
- [SQLite loadable extensions docs](https://sqlite.org/loadext.html)
- [SQLite rsync tool](https://sqlite.org/rsync.html)
- [SQLite virtual table mechanism](https://www.sqlite.org/vtab.html)
- [Antithesis testing platform](https://antithesis.com/product/how_antithesis_works/)
- [Matt Wonlaw GitHub profile](https://github.com/tantaman)
- [localfirst.fm podcast](https://www.localfirst.fm/)
- [Fly.io LiteFS docs](https://fly.io/docs/litefs/)
- [SQLite Cloud dashboard](https://dashboard.sqlitecloud.io/)
- [ElectricSQL legacy docs](https://legacy.electric-sql.com/docs/reference)
- [ElectricSQL sync stacks](https://electric-sql.com/docs/stacks)
- [TanStack DB](https://tanstack.com/) (referenced by ElectricSQL)
- [vlcn.io main site](https://vlcn.io/)
- [Fly.io WAL mode blog post](https://fly.io/blog/sqlite-internals-wal/)
- [SQLite forum: multiple writers](https://sqlite.org/forum/info/b4e8b29ae409cd198652c6b7e70b53b702f269e67e1d2573d627feeba37bbf85)

---

## Raw Link Inventory

Every URL encountered during research, deduplicated:

```
https://github.com/vlcn-io/cr-sqlite
https://github.com/vlcn-io/cr-sqlite/releases
https://github.com/vlcn-io/cr-sqlite/blob/main/README.md
https://github.com/vlcn-io/cr-sqlite/issues/181
https://github.com/vlcn-io/cr-sqlite/issues/444
https://github.com/vlcn-io/cr-sqlite/discussions/309
https://github.com/vlcn-io/cr-sqlite/discussions/347
https://github.com/vlcn-io/cr-sqlite/discussions/424
https://github.com/vlcn-io/cr-sqlite/wiki
https://github.com/vlcn-io
https://github.com/superfly/cr-sqlite
https://github.com/superfly/corrosion
https://github.com/nimmen/crdt-sqlite
https://github.com/Azarattum/CRSqlite
https://github.com/tantaman
https://github.com/sqliteai/sqlite-sync
https://github.com/sqliteai/sqlite-ai
https://github.com/sqliteai/sqlite-vector
https://github.com/sqliteai/sqlite-js
https://github.com/sqliteai/sqlite-extensions-guide
https://github.com/jlongster/crdt-example-app
https://github.com/clintharris/crdt-example-app_annotated
https://github.com/steida/crdt-example-app_annotated
https://github.com/orbitinghail/sqlsync
https://github.com/mycelial/mycelite
https://github.com/carboneio/replic-sqlite
https://github.com/coast-team/synql
https://github.com/tursodatabase/libsql
https://github.com/electric-sql/postgres-to-sqlite-sync-example
https://github.com/sqlite/sqlite
https://github.com/arn4v/offline-first
https://github.com/alexanderop/awesome-local-first
https://github.com/alangibson/awesome-crdt
https://github.com/lichuang/awesome-sqlite
https://github.com/sqlite-sync/SQLite-sync.com
https://github.com/rust-crdt/rust-crdt/issues/126
https://vlcn.io/
https://vlcn.io/docs/cr-sqlite/intro
https://vlcn.io/docs/cr-sqlite/quickstart
https://vlcn.io/docs/cr-sqlite/installation
https://vlcn.io/docs/cr-sqlite/api-methods/crsql_changes
https://vlcn.io/docs/cr-sqlite/api-methods/crsql_as_crr
https://vlcn.io/docs/cr-sqlite/api-methods/sqlite-apis
https://vlcn.io/docs/cr-sqlite/api-methods/crsql_fract_as_ordered
https://vlcn.io/docs/cr-sqlite/crdts/about
https://vlcn.io/docs/cr-sqlite/crdts/column-crdts
https://vlcn.io/docs/cr-sqlite/crdts/table-crdts
https://vlcn.io/docs/cr-sqlite/crdts/sequence-crdts
https://vlcn.io/docs/cr-sqlite/networking/whole-crr-sync
https://vlcn.io/docs/cr-sqlite/migrations
https://vlcn.io/docs/cr-sqlite/custom-syntax
https://vlcn.io/blog/libsql-gdoc
https://www.sqlite.ai/
https://www.sqlite.ai/sqlite-sync
https://blog.sqlite.ai/how-and-why-we-brought-sqlite-to-the-cloud
https://blog.sqlite.ai/welcome-sqlite-ai
https://blog.sqlite.ai/how-sqlite-approaches-modularity
https://blog.sqlite.ai/replacing-s3-file-storage-with-sqlite-cloud
https://blog.sqlite.ai/a-brief-history-of-sqlite
https://docs.sqlitecloud.io/
https://docs.sqlitecloud.io/docs/sqlite-sync-introduction
https://docs.sqlitecloud.io/docs/sqlite-sync-getting-started
https://docs.sqlitecloud.io/docs/sqlite-sync-best-practices
https://docs.sqlitecloud.io/docs/ai-overview
https://docs.sqlitecloud.io/docs/offsync
https://sqlitecloud.io/
https://dashboard.sqlitecloud.io/
https://superfly.github.io/corrosion/crdts.html
https://superfly.github.io/corrosion/
https://fly.io/blog/corrosion/
https://fly.io/blog/sqlite-internals-wal/
https://fly.io/infra-log/
https://fly.io/infra-log/2024-11-30/
https://fly.io/infra-log/2024-10-26/
https://fly.io/docs/litefs/
https://community.fly.io/t/corrosion-vs-turso-for-a-caching-layer/21032
https://archive.jlongster.com/using-crdts-in-the-wild
https://marcobambini.substack.com/p/the-secret-life-of-a-local-first
https://contributor.substack.com/p/take-your-own-advice-vlcn-with-matt
https://electric-sql.com/docs/reference/alternatives
https://electric-sql.com/docs/stacks
https://legacy.electric-sql.com/docs/reference
https://legacy.electric-sql.com/docs/reference/local-first
https://electric-sql.com/blog/2023/09/20/introducing-electricsql-v0.6
https://electric-sql.com/blog/2024/01/24/electricsql-v0.9-released
https://materializedview.io/p/electricsql-pglite-crdts-and-elixir
https://sqlsync.dev/
https://zero.rocicorp.dev/
https://zero.rocicorp.dev/docs/introduction
https://zero.rocicorp.dev/docs/sync
https://zero.rocicorp.dev/docs/roadmap
https://zero.rocicorp.dev/docs/install
https://zero.rocicorp.dev/docs/deployment
https://www.powersync.com/
https://www.powersync.com/blog/electricsql-vs-powersync
https://www.powersync.com/blog/introducing-powersync-v1-0-postgres-sqlite-sync-layer
https://turso.tech/
https://use-fireproof.com
https://crdt.tech/
https://crdt.tech/implementations
https://crdt.tech/papers.html
https://crdt.tech/papers_bib.html
https://dl.acm.org/doi/pdf/10.1145/3380787.3393678
https://cse.buffalo.edu/tech-reports/2014-04.pdf
https://en.wikipedia.org/wiki/Conflict-free_replicated_data_type
https://en.wikipedia.org/wiki/Lamport_timestamp
https://inria.hal.science/hal-04969158v2
https://inria.hal.science/hal-04969158v3/document
https://hal-lara.archives-ouvertes.fr/LORIA-NSS/hal-04580135v1
https://inria.hal.science/hal-03999168
https://link.springer.com/chapter/10.1007/978-3-031-62638-8_2
https://link.springer.com/chapter/10.1007/978-3-030-85082-1_22
https://www.localfirst.fm/
https://www.localfirst.fm/7
https://www.localfirst.fm/10
https://open.spotify.com/episode/6hajEXYjJ3fg9m1O0rd7Ux
https://tldrecap.tech/posts/podcast/infoq/flyio-corrosion-crtds/
https://www.contributor.fyi/vlcn
https://qconlondon.com/presentation/apr2025/fast-eventual-consistency-inside-corrosion-distributed-system-powering-flyio
https://www.infoq.com/news/2025/04/corrosion-distributed-system-fly/
https://news.ycombinator.com/item?id=45527840
https://news.ycombinator.com/item?id=33606311
https://news.ycombinator.com/item?id=37584049
https://news.ycombinator.com/item?id=37586761
https://news.ycombinator.com/item?id=38473743
https://news.ycombinator.com/item?id=43433696
https://til.simonwillison.net/sqlite/cr-sqlite-macos
https://observablehq.com/@tantaman/cr-sqlite-basic-setup
https://discord.gg/AtdVY6zDW3
https://gist.github.com/rodydavis/a4d1dccb11e5a4cd77fe7e4e64f5dbdf
https://gist.github.com/pesterhazy/3e039677f2e314cb77ffe3497ebca07b
https://share.snipd.com/chapter/5ec1dab7-f83a-46b3-9b99-1ed1b219ce73
https://share.snipd.com/episode/f8a1081b-e7ff-4147-8b24-01a78e34aaeb
https://www.npmjs.com/package/@vlcn.io/crsqlite
https://www.npmjs.com/package/@sqliteai/sqlite-wasm
https://central.sonatype.com/artifact/ai.sqlite/sync
https://pub.dev/packages/sqlite_sync
https://expo.dev/changelog/2023-08-10-cr-sqlite
https://www.bmpi.dev/en/dev/renaissance-sqlite/
https://www.spacedrive.com/docs/developers/architecture/sync
https://www.iankduncan.com/engineering/2025-11-27-crdt-dictionary/
https://jakelazaroff.com/words/an-interactive-intro-to-crdts/
https://adamwulf.me/2021/05/distributed-clocks-and-crdts/
https://www.ersin.nz/articles/creating-the-local-first-stack
https://marmelab.com/blog/2025/02/28/zero-sync-engine.html
https://jeremykreutzbender.com/blog/setting-up-rocicorp-zero-with-rails
https://dbdb.io/db/sqlitecloud
https://antithesis.com/product/how_antithesis_works/
https://www.elastic.co/licensing/elastic-license
https://sqlite.org/loadext.html
https://sqlite.org/vtab.html
https://sqlite.org/rsync.html
https://sqlite.org/forum/info/b4e8b29ae409cd198652c6b7e70b53b702f269e67e1d2573d627feeba37bbf85
https://sqlite.org/forum/info/40cd965ddb76f146
https://www.youtube.com/watch?v=x7drE24geUw
https://rxdb.info/crdt.html
https://www.star-history.com/blog/electricsql
https://radar.inria.fr/report/2023/coast/index.html
https://radar.inria.fr/rapportsactivite/RA2023/coast/coast.pdf
https://www.ditto.live/
https://deepwiki.com/sqlite/sqlite/5-extensions
https://poddtoppen.se/podcast/1725721050/localfirstfm/10-matt-wonlaw-cr-sqlite-syncing-strategies-and-incremental-view-maintenance
https://sqlsync-todo.pages.dev
https://discord.gg/etFk2N9nzC
https://vuink.com/post/tvguho-d-dpbz/vlcn-io/cr-sqlite
https://status.flyio.net
https://statussight.com/status/fly-io
https://statusgator.com/services/flyio
```
