# SQLite as Application State Store: Production Patterns Survey

**Research iteration:** 1
**Date:** 2026-03-12
**Focus:** Real-world patterns from production applications using SQLite as their primary state store

---

## Key Discoveries

### 1. Obsidian — Filesystem-First, No SQLite Core

- Obsidian stores all notes as **plain-text Markdown files** in a "vault" (local directory). There is no SQLite database in the core architecture. ([source](https://help.obsidian.md/data-storage))
- **IndexedDB** (not SQLite) is used as backend storage for maintaining metadata cache state and Obsidian Sync connection state. ([source](https://help.obsidian.md/data-storage))
- The **MetadataCache** subsystem pre-parses all markdown files and maintains an in-memory index of links, headings, tags, and frontmatter. Files are parsed once when modified, then queried without reparsing. ([source](https://deepwiki.com/obsidianmd/obsidian-api/2.4-metadatacache-and-link-resolution))
- Third-party plugins (e.g., [obsidian-sqlite3](https://github.com/windily-cloud/obsidian-sqlite3), [sqliteDB](https://github.com/stfrigerio/sqliteDB)) add SQLite capabilities, but these are community add-ons, not core architecture.
- **Implication for Sherpa:** Obsidian's approach validates that filesystem-first with an in-memory derived index is viable for document-centric workloads. Their MetadataCache is conceptually similar to what Fossil does — canonical data in files, derived/queryable state in a cache layer.

### 2. Logseq — The Painful Migration from Filesystem to SQLite

- Logseq started as a filesystem-based outliner (Markdown/Org-mode files). The team began planning a **database version** in late 2022. As of early 2025, it is still not production-ready, and the last stable release was April 2024. ([source](https://www.solanky.dev/p/logseq-migration-journey-challenges-delays-and-hopes))
- The DB version uses a **dual-database architecture**: in-memory [Datascript](https://github.com/tonsky/datascript) (a Clojure immutable database) with persistent SQLite WASM backed by OPFS (Origin Private File System). ([source](https://deepwiki.com/logseq/logseq/4.2-views-and-tables))
- **SQLite schema is a KVS (key-value store)**: `CREATE TABLE kvs ( addr TEXT PRIMARY KEY, content TEXT, addresses TEXT )` — Datascript entities are serialized into this single table. ([source](https://github.com/logseq/sqlite-db))
- Each database file uses **SQLite WAL mode with exclusive locking** for optimal single-tab performance. Multi-tab coordination uses a **master/slave election** pattern via BroadcastChannel. ([source](https://github.com/logseq/sqlite-db))
- **Schema versioning** uses `major.minor` format tracked in `:logseq.kv/schema-version`. Migrations support property additions, class additions, fix functions, and ident renames, executed sequentially. ([source](https://deepwiki.com/logseq/logseq/4.2-views-and-tables))
- **Datascript schema** defines rich attributes: `:block/uuid`, `:block/parent` (ref), `:block/page` (ref), `:block/refs` (many refs), `:block/order` (fractional indexing), `:block/created-at`, `:block/updated-at`. ([source](https://deepwiki.com/logseq/logseq/4.2-views-and-tables))
- **Validation pipeline**: Malli schemas validate transactions before commit to Datascript. Invalid transactions trigger rollback. ([source](https://deepwiki.com/logseq/logseq/4.2-views-and-tables))
- **What went wrong**: The migration stalled development for over a year, broke plugin compatibility, removed features (namespaces), and caused significant user attrition to alternatives (Obsidian, Remnote, Tana). ([source](https://medium.com/@theo-james/logseq-development-delays-are-users-migrating-to-affine-or-obsidian-e22bb42b8741))
- **Implication for Sherpa:** The KVS-over-SQLite pattern (serializing a richer data model into a flat key-value table) is pragmatic but loses queryability. Logseq's pain validates: do not attempt a mid-flight storage engine migration. Design the right storage from the start. Fractional indexing for ordering is a pattern worth adopting.

### 3. Fossil SCM — The Gold Standard for SQLite-as-State-Store

- Fossil (created by SQLite's author, D. Richard Hipp) uses **three separate SQLite databases**: configuration (~/.fossil), repository (project.fossil), and checkout (.fslckout). ([source](https://fossil-scm.org/home/doc/tip/www/tech_overview.wiki))
- **The bag-of-artifacts model**: Canonical data is stored as immutable, hash-identified artifacts in a single `blob` table. All other tables (file names, check-in relationships, tags, wiki, tickets, timelines) are **derived/cached metadata** that can be discarded and rebuilt via `fossil rebuild`. ([source](https://fossil-scm.org/home/doc/trunk/www/fossil-is-not-relational.md))
- **Schema evolution is free**: Because metadata tables are derived, the schema can change between versions without breaking repositories. `fossil rebuild` regenerates all metadata from artifacts. ([source](https://fossil-scm.org/home/doc/trunk/www/fossil-is-not-relational.md))
- **Compression**: Artifacts use zlib + delta compression. Real-world ratio: **74:1** — SQLite's own repository compresses 7.1 GB of content into <97 MB. Median artifact size post-compression: 156 bytes. ([source](https://fossil-scm.org/home/doc/tip/www/tech_overview.wiki))
- **Concurrent access**: SQLite's ATTACH command connects multiple databases. Atomic updates protect integrity during crashes. ([source](https://fossil-scm.org/home/doc/tip/www/tech_overview.wiki))
- **User/permission data** stored per-repository, not synced across instances. ([source](https://fossil-scm.org/home/doc/tip/www/tech_overview.wiki))
- **Implication for Sherpa:** This is the most directly relevant pattern. **Separate canonical data from derived queryable state.** If the canonical layer is well-defined (immutable records with content hashes), schema evolution becomes trivial — just rebuild the derived tables. The three-database-file pattern (global config, per-project state, per-checkout state) maps well to Sherpa's needs (framework config, initiative state, workspace state).

### 4. calibre — In-Memory Cache Over SQLite with Simulated Foreign Keys

- calibre stores all book metadata in `metadata.db` at the library root. ([source](https://manual.calibre-ebook.com/db_api.html))
- **In-memory cache**: The entire database is loaded into an in-memory cache maintained in normal form for maximum performance. SQLite is "simply used as a way to read and write from metadata.db robustly." All sorting, searching, and filtering logic is re-implemented in application code. ([source](https://manual.calibre-ebook.com/db_api.html))
- **Thread safety**: Uses a "multiple reader, single writer" locking schema at the application level. ([source](https://manual.calibre-ebook.com/db_api.html))
- **Schema design**: Relational with separate tables for books, authors, publishers, tags, series, ratings, languages, identifiers, and formats. Many-to-many relationships via link tables. ([source](https://manual.calibre-ebook.com/db_api.html))
- **Custom columns**: Extensible schema supporting user-defined metadata fields. ([source](https://manual.calibre-ebook.com/db_api.html))
- **Foreign keys simulated via triggers** — SQLite's FK support exists but calibre chose triggers instead. ([source](https://www.mobileread.com/forums/showthread.php?t=295700))
- **Network share problems**: calibre is "completely allergic to network shares" — NFS/SMB cannot reliably support WAL or file locking, causing "database is locked" errors or corruption. ([source](https://www.mobileread.com/forums/showthread.php?t=149270))
- **Implication for Sherpa:** The pattern of loading the entire DB into memory and using SQLite purely for durability is viable when the dataset is small enough (thousands of items, not millions). This matches Sherpa's scale — initiatives, tasks, and agent state are likely <10K records total. The network share warning confirms: SQLite must live on local disk only.

### 5. iOS Core Data with SQLite — Object-Graph Mapping Patterns

- Core Data uses SQLite as its default persistent store since iOS 7, with **WAL mode enabled by default**. ([source](https://developer.apple.com/library/archive/qa/qa1809/_index.html))
- **Generated schema**: Entity "Item" becomes table `ZITEM`. Attribute "timestamp" becomes column `ZTIMESTAMP`. All tables get three mandatory columns: `Z_PK` (auto-increment PK), `Z_ENT` (entity type ID), `Z_OPT` (version counter for optimistic locking). ([source](https://fatbobman.com/en/posts/tables_and_fields_of_coredata/))
- **Metadata tables**: `Z_PRIMARYKEY` (entity registry + max PK tracking), `Z_METADATA` (database UUID + plist metadata), `Z_MODELCACHE` (cached data model for validation). ([source](https://fatbobman.com/en/posts/tables_and_fields_of_coredata/))
- **Relationship storage**: One-to-many uses FK column on the "many" side. Many-to-many creates intermediate tables (e.g., `Z_2TAGS`). ([source](https://fatbobman.com/en/posts/tables_and_fields_of_coredata/))
- **Entity inheritance pitfall**: All entities inheriting from a parent share **one SQLite table**, creating performance problems for deep hierarchies or large datasets. ([source](https://developer.apple.com/library/archive/documentation/Cocoa/Conceptual/CoreData/Performance.html))
- **Persistent history tracking**: Three tables (`Z_ATRANSACTIONSTRING`, `Z_ATRANSACTION`, `Z_ACHANGE`) log every insert/update/delete with timestamps and author attribution. ([source](https://fatbobman.com/en/posts/tables_and_fields_of_coredata/))
- **Lightweight migration**: Core Data can auto-migrate simple schema changes (add column, rename entity) without data loss. Heavyweight migration requires explicit mapping models. ([source](https://developer.android.com/training/data-storage/room/migrating-db-versions))
- **Concurrency model**: Multiple `NSManagedObjectContext` instances on different threads, coordinated through a `NSPersistentStoreCoordinator`. Merge conflicts resolved via merge policies. ([source](https://developer.apple.com/library/archive/documentation/Cocoa/Conceptual/CoreData/Performance.html))
- **Implication for Sherpa:** The `Z_OPT` version counter is a clean optimistic locking pattern — increment on every write, reject stale updates. The persistent history tracking tables (transaction log with author attribution) map directly to Sherpa's need for agent activity tracking. Entity inheritance in a single table is an anti-pattern to avoid.

### 6. Turso/libSQL — Embedded Replicas and Sync

- libSQL is a **fork of SQLite** that adds server mode (HTTP access), native vector search, and WAL-based replication. Fully backwards-compatible with SQLite. ([source](https://docs.turso.tech/libsql))
- **Embedded replicas**: Local SQLite files kept in sync with a remote primary via WAL frame synchronization. One frame = 4 KB (one disk page). Writes go to remote primary, then propagate to replicas. ([source](https://docs.turso.tech/features/embedded-replicas/introduction))
- **Read-your-writes guarantee**: After a write returns, the originating replica always sees the new data immediately, even without calling sync(). Other replicas see it at next sync (default: 60 seconds). ([source](https://docs.turso.tech/features/embedded-replicas/introduction))
- **Offline writes (beta, March 2025)**: Local changes pushed as logical mutations. Remote changes pulled as physical pages. **Last-Push-Wins** conflict resolution by default. Custom transform hooks available for application-specific merge logic. ([source](https://turso.tech/blog/introducing-offline-writes-for-turso))
- **Implication for Sherpa:** Turso's architecture is designed for distributed systems — overkill for Sherpa's single-machine topology. However, libSQL's embedded replica pattern could be valuable if Sherpa ever needs to sync state between machines. The Last-Push-Wins default is a reasonable starting point for agent coordination where agents work on non-overlapping tasks.

### 7. Litestack/Litestream — Rails Ecosystem Patterns

- **Litestack** provides SQLite-backed adapters for ActiveRecord, ActiveJob, ActionCable, and ActiveSupport::Cache in Rails. Results in **4+ separate SQLite database files per app** — one for each concern. ([source](https://github.com/oldmoe/litestack))
- **Critical pattern: separate database files per concern**. Isolating jobs, cache, pub/sub, and application data into separate SQLite files "notably increases concurrency throughput" because each file has its own write lock. ([source](https://fractaledmind.com/2024/01/02/sqlite-quick-tip-multiple-databases/))
- **Litestream** provides continuous WAL replication to S3-compatible object storage for backup/recovery. Not real-time sync — it's a durability layer. ([source](https://fractaledmind.com/2023/09/09/enhancing-rails-sqlite-setting-up-litestream/))
- **Production pitfalls** (documented extensively by [Andre Arko](https://andre.arko.net/2025/09/11/rails-on-sqlite-exciting-new-ways-to-cause-outages/)):
  - **Ephemeral storage danger**: Deploying SQLite on container platforms (Heroku, Fly.io) where filesystems are destroyed on restart. Must use persistent volumes.
  - **Single point of failure**: One server down = complete outage. No failover, no geographic distribution.
  - **Zero-downtime deploys impossible** in containers — only one container can mount the DB volume.
  - **Horizontal scaling impossible** — only vertical scaling works.
  - **Resource contention**: Combining all concerns in one DB file causes jobs to block web request writes. Separate files per subsystem mitigates this.
- **Implication for Sherpa:** The separate-databases-per-concern pattern is directly applicable. Sherpa should use separate SQLite files for: (1) initiative/document metadata, (2) task queue, (3) agent coordination/sessions, (4) event log. This maximizes write concurrency across concerns.

### 8. Other Notable Examples

#### VS Code — Key-Value SQLite State Store
- VS Code uses `state.vscdb` for both global and workspace state. Schema is a **single table**: `CREATE TABLE ItemTable (key TEXT UNIQUE ON CONFLICT REPLACE, value BLOB)`. ([source](https://mattreduce.com/posts/vscode-global-state/))
- Extension state stored as JSON blobs with composite keys (`<PUBLISHER>.<NAME>`). The `ON CONFLICT REPLACE` clause provides upsert semantics. ([source](https://mattreduce.com/posts/vscode-global-state/))
- Abstracted via the **Memento API** (`get()`/`update()`) — extensions never touch SQLite directly. ([source](https://mattreduce.com/posts/vscode-global-state/))
- **Implication for Sherpa:** For simple state (agent preferences, session metadata), a single KVS table with JSON values is sufficient. Don't over-engineer what can be a flat key-value store.

#### Firefox — Multi-Database Architecture
- Firefox uses **46 separate data stores** across **10+ storage formats** (SQLite, JSON, XML, JS). ([source](https://mozilla.github.io/firefox-browser-architecture/text/0010-firefox-data-stores.html))
- `places.sqlite` stores history + bookmarks. `favicons.sqlite` is ATTACH-ed to places.sqlite for cross-database queries. ([source](https://firefox-source-docs.mozilla.org/browser/places/architecture-overview.html))
- Tables: `moz_places` (URLs + visit frequency), `moz_historyvisits`, `moz_bookmarks`, `moz_favicons`, `moz_inputhistory`, `moz_keywords`. ([source](https://en.wikiversity.org/wiki/Firefox/Browsing_history_database))
- Android consolidated places + favicons into a single `browser.db`. ([source](https://mozilla.github.io/firefox-browser-architecture/text/0010-firefox-data-stores.html))
- Only 8% of stored data fields are exposed to Firefox Sync — deliberate architectural choice. ([source](https://mozilla.github.io/firefox-browser-architecture/text/0010-firefox-data-stores.html))
- **Implication for Sherpa:** The ATTACH pattern for cross-database queries is useful if we split into multiple DB files. Firefox's experience with 46 data stores in 10 formats is a cautionary tale — consolidate where possible.

#### Notion — Block-Based SQLite Cache
- Notion uses SQLite (via WASM in browser, native on desktop/mobile) as a **local cache** for its block-based data model, not as the source of truth. ([source](https://www.notion.com/blog/how-we-sped-up-notion-in-the-browser-with-wasm-sqlite))
- **Offline tables**: `offline_page` (one row per offline-available page) and `offline_action` (tracks why pages are offline — toggled, favorite, inherited). ([source](https://www.notion.com/blog/how-we-made-notion-available-offline))
- **Concurrency**: Only the "active tab" can write to SQLite. Uses Web Locks API + SharedWorker for coordination. Prior to this, they experienced **data corruption** — wrong comments attributed to wrong users, incorrect page previews. ([source](https://www.notion.com/blog/how-we-sped-up-notion-in-the-browser-with-wasm-sqlite))
- Migrated to **CRDT data model** for conflict resolution in offline mode. ([source](https://www.notion.com/blog/how-we-made-notion-available-offline))
- **Implication for Sherpa:** The single-writer pattern (only one process writes) is validated by Notion's corruption experience. For Sherpa's multi-agent topology, a write-serialization layer (application-level mutex or single writer process) is essential.

#### SkyPilot — SQLite Under Heavy Concurrent Write Load
- SkyPilot uses SQLite for managing 1000+ concurrent cloud jobs. At this scale, write contention becomes severe. ([source](https://blog.skypilot.co/abusing-sqlite-to-handle-concurrency/))
- SQLite's busy retry uses **hardcoded exponential backoff** `{ 1, 2, 5, 10, 15, 20, 25, 25, 25, 50, 50, 100 }` ms — no FIFO guarantee, no condition variable. ([source](https://blog.skypilot.co/abusing-sqlite-to-handle-concurrency/))
- At 1000 concurrent writers: **p50 write latency = 2.3 seconds**. Only 0.13% of writes exceed 60s with a 120s timeout. ([source](https://blog.skypilot.co/abusing-sqlite-to-handle-concurrency/))
- Conclusion: SQLite handles millions of QPS for reads, but "many concurrent writers" is a fundamental limitation best solved by switching databases or serializing writes at the application level. ([source](https://blog.skypilot.co/abusing-sqlite-to-handle-concurrency/))
- **Implication for Sherpa:** With 2-6 concurrent agents, Sherpa is far below SkyPilot's 1000-writer stress test. A 5-second busy_timeout with WAL mode should be sufficient. But the write-serialization recommendation still applies for robustness.

#### Dapr — SQLite State Store Component
- Dapr uses Go-level locks within a single instance to serialize SQLite writes. Cross-instance protection does not exist. ([source](https://docs.dapr.io/reference/components-reference/supported-state-stores/setup-sqlite/))
- Supports **optimistic concurrency via ETags** — first-write-wins or last-write-wins modes. ([source](https://docs.dapr.io/reference/components-reference/supported-state-stores/setup-sqlite/))
- Not recommended for production with multiple instances or networked filesystems. ([source](https://docs.dapr.io/reference/components-reference/supported-state-stores/setup-sqlite/))

#### Android Room — Migration Testing Infrastructure
- Room provides `MigrationTestHelper` for validating schema migrations in unit tests. Migrations defined as `Migration(fromVersion, toVersion)` objects with SQL transformation logic. ([source](https://developer.android.com/training/data-storage/room/migrating-db-versions))
- Single `SQLiteOpenHelper` instance manages one connection. All operations serialized through that connection. Background thread execution mandatory. ([source](https://sqlpey.com/sqlite/android-sqlite-concurrency-strategies/))

---

## Cross-Cutting Patterns

### Schema Design Spectrum

| Pattern | Examples | When to Use |
|---------|----------|-------------|
| **Single KVS table** | VS Code, Logseq SQLite layer | Simple state, extension data, serialized object graphs |
| **Relational with link tables** | calibre, Firefox Places | Well-understood domain with stable relationships |
| **Immutable artifacts + derived cache** | Fossil | Version-controlled data, schema must evolve freely |
| **Hybrid JSON + virtual columns** | Notion-style | Flexible schemas that evolve, selective indexing |
| **Object-graph mapping** | Core Data | Complex entity relationships with inheritance |

### Concurrent Access Consensus

Every production SQLite application converges on the same recipe:

1. **WAL mode** (`PRAGMA journal_mode=WAL`) — enables concurrent readers alongside a single writer
2. **busy_timeout** (`PRAGMA busy_timeout=5000` minimum) — prevents immediate SQLITE_BUSY failures
3. **BEGIN IMMEDIATE** for write transactions — avoids the deadly read-to-write upgrade that bypasses busy_timeout ([source](https://berthub.eu/articles/posts/a-brief-post-on-sqlite3-database-locked-despite-timeout/))
4. **Short write transactions** — hold the write lock for minimal duration
5. **Application-level write serialization** for high-concurrency scenarios (Notion, calibre, Dapr all do this)
6. **Separate DB files per concern** for maximum write throughput (Litestack, Firefox, Fossil)

### Migration Strategies

| Strategy | Examples | Trade-offs |
|----------|----------|------------|
| **PRAGMA user_version** | Android, many apps | Simple, built-in, sequential migrations |
| **Rebuild from canonical data** | Fossil | Zero migration cost, requires canonical/derived separation |
| **In-app migration runner** | Logseq, Room | Flexible, testable, but requires maintenance |
| **Lightweight auto-migration** | Core Data | Low effort for simple changes, breaks on complex ones |

### File Size Boundaries

- **Sweet spot**: < 100 MB for most applications. This covers tens of thousands of records with text data.
- **Comfortable range**: Up to ~1 GB with proper indexing and query optimization.
- **Stress zone**: 1-10 GB — requires careful tuning (page size, cache size, index strategy). Full table scans become costly.
- **Theoretical max**: 281 TB (with 64 KB page size), but practical limits are much lower.
- Fossil's SQLite repo: 7.1 GB uncompressed content in <97 MB with delta + zlib compression.
- **For Sherpa**: Initiative metadata, task queues, and agent state will likely stay under 10 MB. File size is a non-concern.

---

## Implications for Sherpa's State Store Design

### Recommended Architecture

Based on this survey, the strongest pattern for Sherpa combines elements from Fossil, Litestack, and Core Data:

1. **Multiple SQLite databases** (Litestack pattern):
   - `sherpa.db` — Initiative metadata, document state, agent role definitions
   - `tasks.db` — Task queue, job claiming, worker coordination
   - `events.db` — Activity log, agent session history, audit trail
   - `config.db` — Framework configuration, user preferences (VS Code pattern)

2. **Canonical + derived separation** (Fossil pattern):
   - Initiatives and proposals stored as filesystem artifacts (Markdown with YAML frontmatter) — these are the canonical source
   - SQLite stores derived/indexed metadata for fast queries (status filters, dependency graphs, timeline views)
   - `sherpa rebuild` command regenerates all derived state from filesystem artifacts

3. **Hybrid JSON schema** for flexible metadata:
   - Core columns for queryable fields (status, created_at, updated_at, type)
   - JSON column for extensible properties
   - Virtual generated columns + indexes for frequently-queried JSON paths

4. **Task queue schema** (from SQLite job queue patterns):
   ```sql
   CREATE TABLE tasks (
     id TEXT PRIMARY KEY,    -- uuidv7 for time-ordered IDs
     type TEXT NOT NULL,
     status TEXT DEFAULT 'pending',
     data TEXT,              -- JSON payload
     agent_id TEXT,          -- claiming agent
     claimed_at INTEGER,
     created_at INTEGER DEFAULT (unixepoch()),
     updated_at INTEGER DEFAULT (unixepoch()),
     version INTEGER DEFAULT 1  -- optimistic locking (Core Data Z_OPT pattern)
   );
   CREATE INDEX idx_tasks_status_type ON tasks(status, type, created_at);
   ```

5. **Concurrency configuration** (universal consensus):
   ```sql
   PRAGMA journal_mode = WAL;
   PRAGMA busy_timeout = 5000;
   PRAGMA synchronous = NORMAL;
   PRAGMA foreign_keys = ON;
   ```

6. **Write coordination**: Application-level write serialization per database file. Each agent process uses `BEGIN IMMEDIATE` for all write transactions. With 2-6 agents, contention should be minimal given separate DB files per concern.

7. **Migration strategy**: `PRAGMA user_version` for schema tracking, sequential migration scripts. For the initiative metadata DB, consider Fossil's "rebuild from canonical" approach where the filesystem is always the source of truth.

### Anti-Patterns to Avoid

- **Entity inheritance in a single table** (Core Data pitfall) — use separate tables for distinct entity types
- **Network filesystem storage** (calibre, Dapr warnings) — SQLite must live on local disk
- **Read-to-write transaction upgrades** (universal pitfall) — always use BEGIN IMMEDIATE
- **Single DB file for all concerns** (Litestack lesson) — separate files maximize concurrency
- **Mid-flight storage engine migration** (Logseq cautionary tale) — design the right storage from day one
- **Serializing a rich data model into a flat KVS** (Logseq SQLite layer) — loses queryability; use relational tables or hybrid JSON

---

## Sources

### Primary Application Documentation
- [How Obsidian Stores Data](https://help.obsidian.md/data-storage) — Official docs on Obsidian's filesystem-first storage
- [Obsidian MetadataCache API](https://deepwiki.com/obsidianmd/obsidian-api/2.4-metadatacache-and-link-resolution) — DeepWiki analysis of caching subsystem
- [Logseq Migration Journey](https://www.solanky.dev/p/logseq-migration-journey-challenges-delays-and-hopes) — Detailed timeline of Logseq's DB migration challenges
- [Logseq Database Schema and Validation](https://deepwiki.com/logseq/logseq/4.2-views-and-tables) — DeepWiki analysis of Datascript/SQLite schema
- [Logseq sqlite-db Repository](https://github.com/logseq/sqlite-db) — Source code for SQLite WASM integration
- [Fossil Technical Overview](https://fossil-scm.org/home/doc/tip/www/tech_overview.wiki) — Official architectural documentation
- [Fossil Is Not Relational](https://fossil-scm.org/home/doc/trunk/www/fossil-is-not-relational.md) — Key design document on bag-of-artifacts model
- [calibre Database API](https://manual.calibre-ebook.com/db_api.html) — Official API docs for metadata.db
- [calibre metadata_sqlite.sql](https://github.com/kovidgoyal/calibre/blob/master/resources/metadata_sqlite.sql) — Schema definition source
- [Core Data SQLite Internal Mapping](https://fatbobman.com/en/posts/tables_and_fields_of_coredata/) — Detailed Z_ prefix table analysis
- [Core Data WAL Mode Technical Note](https://developer.apple.com/library/archive/qa/qa1809/_index.html) — Apple's WAL mode documentation
- [Core Data Performance Guide](https://developer.apple.com/library/archive/documentation/Cocoa/Conceptual/CoreData/Performance.html) — Apple's official performance patterns
- [Turso Embedded Replicas](https://docs.turso.tech/features/embedded-replicas/introduction) — Official embedded replica docs
- [Turso Offline Writes](https://turso.tech/blog/introducing-offline-writes-for-turso) — Offline sync beta announcement
- [libSQL Repository](https://github.com/tursodatabase/libsql) — Source code for SQLite fork
- [Litestack Repository](https://github.com/oldmoe/litestack) — All-in-one SQLite gem for Rails
- [Litestream Ruby](https://github.com/fractaledmind/litestream-ruby) — WAL replication for Ruby/Rails

### Concurrency and Performance
- [SQLite WAL Mode](https://sqlite.org/wal.html) — Official WAL documentation
- [SQLite Concurrent Writes Analysis](https://tenthousandmeters.com/blog/sqlite-concurrent-writes-and-database-is-locked-errors/) — Deep technical analysis of lock contention
- [SkyPilot SQLite Concurrency](https://blog.skypilot.co/abusing-sqlite-to-handle-concurrency/) — Benchmarks at 1000-writer scale
- [BEGIN CONCURRENT Enhancement](https://www.sqlite.org/src/doc/begin-concurrent/doc/begin_concurrent.md) — Experimental multi-writer feature
- [Concurrent Write Transactions](https://oldmoe.blog/2024/07/08/the-write-stuff-concurrent-write-transactions-in-sqlite/) — Fine-grained conflict detection analysis
- [SQLITE_BUSY Despite Timeout](https://berthub.eu/articles/posts/a-brief-post-on-sqlite3-database-locked-despite-timeout/) — Why busy_timeout fails with transaction upgrades
- [Connection Pool Write Performance](https://emschwartz.me/psa-your-sqlite-connection-pool-might-be-ruining-your-write-performance/) — Why single-writer connections matter

### Production Deployment
- [Rails on SQLite Production Pitfalls](https://andre.arko.net/2025/09/11/rails-on-sqlite-exciting-new-ways-to-cause-outages/) — Comprehensive failure mode analysis
- [Multiple SQLite Databases Pattern](https://fractaledmind.com/2024/01/02/sqlite-quick-tip-multiple-databases/) — Why and how to split databases
- [Litestream Setup Guide](https://fractaledmind.com/2023/09/09/enhancing-rails-sqlite-setting-up-litestream/) — Backup/recovery configuration
- [SQLite Renaissance 2026](https://dev.to/pockit_tools/the-sqlite-renaissance-why-the-worlds-most-deployed-database-is-taking-over-production-in-2026-3jcc) — Industry trend analysis
- [Dapr SQLite State Store](https://docs.dapr.io/reference/components-reference/supported-state-stores/setup-sqlite/) — Component configuration and limitations
- [SQLite Appropriate Uses](https://sqlite.org/whentouse.html) — Official guidance from SQLite team
- [SQLite Implementation Limits](https://sqlite.org/limits.html) — Official size/capacity limits

### Schema and Migration
- [SQLite JSON Virtual Columns](https://www.dbpro.app/blog/sqlite-json-virtual-columns-indexing) — Hybrid JSON + relational pattern
- [SQLite JSON Functions](https://sqlite.org/json1.html) — Official JSON1 extension docs
- [PRAGMA user_version for Migrations](https://levlaz.org/sqlite-db-migrations-with-pragma-user_version/) — Migration versioning pattern
- [Declarative Schema Migration](https://david.rothlis.net/declarative-schema-migration-for-sqlite/) — Alternative migration approach
- [Android Room Migrations](https://developer.android.com/training/data-storage/room/migrating-db-versions) — Google's migration testing patterns

### State/Architecture
- [VS Code Global State](https://mattreduce.com/posts/vscode-global-state/) — state.vscdb schema analysis
- [Firefox Data Stores](https://mozilla.github.io/firefox-browser-architecture/text/0010-firefox-data-stores.html) — Complete data store inventory
- [Firefox Places Architecture](https://firefox-source-docs.mozilla.org/browser/places/architecture-overview.html) — Places module design
- [Notion Data Model](https://www.notion.com/blog/data-model-behind-notion) — Block-based architecture
- [Notion WASM SQLite](https://www.notion.com/blog/how-we-sped-up-notion-in-the-browser-with-wasm-sqlite) — Browser SQLite implementation
- [Notion Offline Mode](https://www.notion.com/blog/how-we-made-notion-available-offline) — Offline architecture with SQLite

### Task Queue Patterns
- [SQLite Background Job System](https://jasongorman.uk/writing/sqlite-background-job-system/) — Complete job queue implementation
- [Litequeue](https://github.com/litements/litequeue) — Python SQLite queue library
- [Liteque (TypeScript)](https://github.com/karakeep-app/liteque) — TypeScript SQLite queue
- [SQLite Queue Forum Discussion](https://sqlite.org/forum/info/b047f5ef5b76edff) — Community patterns

---

## Raw Links (All URLs Encountered)

```
https://help.obsidian.md/data-storage
https://deepwiki.com/obsidianmd/obsidian-api/2.4-metadatacache-and-link-resolution
https://github.com/windily-cloud/obsidian-sqlite3
https://forum.obsidian.md/t/adding-sqlite-database-integration-to-an-obsidian-plugin/88272
https://github.com/stfrigerio/sqliteDB
https://publish.obsidian.md/manuel/Wiki/Technology/Databases/SQLite
https://news.ycombinator.com/item?id=44475944
https://www.obsidianstats.com/tags/database
https://www.obsidianstats.com/plugins/sqlite-db
https://github.com/tomaszkiewicz/obsidian-database-plugin
https://github.com/pmmvr/obsidian-index-service
https://forum.obsidian.md/t/how-does-file-caching-work/85067
https://forum.obsidian.md/t/metadata-location-and-security/9219
https://retypeapp.github.io/obsidian/data-storage/
https://github.com/obsidianmd/obsidian-help/blob/master/en/Files%20and%20folders/How%20Obsidian%20stores%20data.md
https://medium.com/design-bootcamp/obsidian-app-in-depth-product-teardown-6d685930a367
https://github.com/blacksmithgu/obsidian-dataview/issues/1221
https://forum.obsidian.md/t/managing-large-files-and-external-resources-in-obsidian-vaults/93829
https://www.solanky.dev/p/logseq-migration-journey-challenges-delays-and-hopes
https://deepwiki.com/logseq/logseq/4.2-views-and-tables
https://discuss.logseq.com/t/logseq-db-changelog/30013/25
https://discuss.logseq.com/t/how-to-migrate-to-logseq-db-version/30967
https://github.com/logseq/sqlite-db
https://discuss.logseq.com/t/logseq-db-unofficial-faq/32508
https://medium.com/@solanky/logseq-migration-journey-challenges-delays-and-hopes-473fa7b8608b
https://discuss.logseq.com/t/backwards-compatibility-between-current-logseq-version-and-next-db/31306
https://discuss.logseq.com/t/concerns-on-db-version-and-future-state-from-a-3-year-user/29225
https://discuss.logseq.com/t/logseq-db-and-advanced-queries/33957
https://discuss.logseq.com/t/its-hard-to-migrate-to-the-logseq-db-version-for-logseq-md-users-logically-speaking-about-the-new-tag-feature-and-removed-namespace/28558
https://discuss.logseq.com/t/logseq-db-changelog/30013/32
https://discuss.logseq.com/tag/db-version
https://medium.com/@theo-james/logseq-development-delays-are-users-migrating-to-affine-or-obsidian-e22bb42b8741
https://preslav.me/2025/10/13/how-to-install-logseq-db-version-on-your-computer-sqlite/
https://deepwiki.com/logseq/logseq
https://www.npmjs.com/package/@logseq/sqlite-wasm
https://github.com/logseq/sqlite-db/blob/master/README.md
https://github.com/sqlite/sqlite-wasm
https://github.com/logseq/sqlite-db/blob/master/Cargo.toml
https://github.com/ryan-codingintrigue/sql-wasm
https://deepwiki.com/logseq/logseq/4.1-layout-and-theming
https://github.com/rhashimoto/wa-sqlite
https://fossil-scm.org/home/doc/tip/www/tech_overview.wiki
https://fossil-scm.org/home/doc/trunk/www/fossil-is-not-relational.md
https://fossil-scm.org/home/doc/trunk/www/theory1.wiki
https://fossil-scm.org/forum/forumpost/22ca69016940d34299d52ae0c8caebae2f652e7709f0eae0689b82930c872d5e
https://news.ycombinator.com/item?id=15304369
https://www2.fossil-scm.org/home/doc/a932b744332916c58/www/tech_overview.wiki
https://sqlite.org/src
https://fossil-scm.org/
https://www.mail-archive.com/fossil-users@lists.fossil-scm.org/msg23638.html
https://manual.calibre-ebook.com/db_api.html
https://github.com/kovidgoyal/calibre/blob/master/resources/metadata_sqlite.sql
https://www.mobileread.com/forums/showthread.php?t=348507
https://www.mobileread.com/forums/showthread.php?t=295700
https://pv.wtf/posts/calibre-sqlite-graphql-api
https://timdams.com/2012/11/27/writing-a-calibre-frontend-for-windows8winrt-using-sqlite-for-winrt/
https://discourse.linuxserver.io/t/calibre-web-is-not-updating-library-when-metadata-db-changes/1668
https://manual.calibre-ebook.com/faq.html
https://calibrestekje.readthedocs.io/en/latest/examples.html
https://www.mobileread.com/forums/showthread.php?t=149270
https://github.com/janeczku/calibre-web/issues/379
https://github.com/janeczku/calibre-web/issues/2643
https://github.com/janeczku/calibre-web/issues/1841
https://www.naturalborncoder.com/2023/07/running-calibre-on-a-virtual-machine-with-a-network-library/
https://forum.synology.com/enu/viewtopic.php?t=74969
https://github.com/janeczku/calibre-web/issues/440
https://developer.apple.com/library/archive/documentation/Cocoa/Conceptual/CoreData/PersistentStoreFeatures.html
https://holyswift.app/sqlite-vs-core-data-in-ios-development-which-one-should-you-choose/
https://developer.apple.com/library/archive/documentation/Cocoa/Conceptual/CoreData/Performance.html
https://www.objc.io/books/core-data/preview/
https://en.wikipedia.org/wiki/Core_Data
https://developer.apple.com/library/archive/documentation/Cocoa/Conceptual/CoreData/KeyConcepts.html
https://techblog.lycorp.co.jp/en/exploring-best-practices-for-core-data-from-the-sqlite-perspective
https://medium.com/capital-one-tech/experimenting-with-sqlite-in-ios-ae9dec92dbaf
https://developer.apple.com/videos/play/wwdc2018/224/?time=7
https://moldstud.com/articles/p-a-closer-look-at-core-data-framework-in-ios-development
https://fatbobman.com/en/posts/tables_and_fields_of_coredata/
https://developer.apple.com/library/archive/qa/qa1809/_index.html
https://mjtsai.com/blog/2014/05/21/problems-with-core-data-migration-manager-and-journal_mode-wal/
https://pablin.org/2013/05/24/problems-with-core-data-migration-manager-and-journal-mode-wal/
https://docs.turso.tech/libsql
https://github.com/tursodatabase/libsql
https://turso.tech/blog/local-first-cloud-connected-sqlite-with-turso-embedded-replicas
https://medium.com/lets-code-future/turso-the-sqlite-that-hit-the-gym-and-moved-to-the-cloud-2c946cd48158
https://turso.tech/
https://turso.tech/blog/introducing-embedded-replicas-deploy-turso-anywhere-2085aa0dc242
https://turso.tech/blog/were-bringing-libsql-into-the-turso-family-8cc1a653448e
https://github.com/tursodatabase
https://turso.tech/blog/do-it-yourself-database-cdn-with-embedded-replicas
https://www.prisma.io/blog/prisma-turso-ea-support-rXGd_Tmy3UXX
https://docs.turso.tech/features/embedded-replicas/introduction
https://turso.tech/blog/introducing-offline-writes-for-turso
https://turso.tech/blog/introducing-databases-anywhere-with-turso-sync
https://news.ycombinator.com/item?id=43535943
https://turso.tech/blog/turso-offline-sync-public-beta
https://calmops.com/database/turso-libsql-edge-database/
https://betterstack.com/community/guides/databases/turso-explained/
https://turso.tech/local-first
https://dev.to/huakun/building-a-local-first-tauri-app-with-drizzle-orm-encryption-and-turso-sync-31pn
https://github.com/tursodatabase/embedded-replica-examples
https://gorails.com/forum/anyone-using-litestack-sqlite-in-production
https://railscoder.com/articles/deploy-rails-with-sqlite-litestack-and-litestream-to-linode-using-kamal
https://graykemmey.com/posts/2023/07/05/the-liteist-stack-rails-sqlite-litestack-litestream-and-fly
https://dev.to/pockit_tools/the-sqlite-renaissance-why-the-worlds-most-deployed-database-is-taking-over-production-in-2026-3jcc
https://fractaledmind.com/2023/09/09/enhancing-rails-sqlite-setting-up-litestream/
https://github.com/fractaledmind/litestream-ruby
https://fractaledmind.com/2024/04/17/update-to-litestream/
https://blog.appsignal.com/2023/09/27/an-introduction-to-litestack-for-ruby-on-rails.html
https://debugg.ai/resources/sqlite-eating-the-cloud-2025-edge-databases-replication-patterns-ditch-server
https://eidel.io/posts/rails-8-setting-up-litestream-for-sqlite-on-hetzner-s3-on-dokku
https://fly.io/ruby-dispatch/sqlite-and-rails-in-production/
https://github.com/oldmoe/litestack
https://andre.arko.net/2025/09/11/rails-on-sqlite-exciting-new-ways-to-cause-outages/
https://kylekeesling.com/posts/2023/10/deploying-a-rails-app-using-kamal-and-sqlite
https://fractaledmind.com/2024/01/02/sqlite-quick-tip-multiple-databases/
https://www.ruby-toolbox.com/projects/litestack
https://highleveragerails.com/watch/install-solid-queue
https://www.rubydoc.info/gems/litestack
https://sqlite.org/wal.html
https://oldmoe.blog/2024/07/08/the-write-stuff-concurrent-write-transactions-in-sqlite/
https://blog.skypilot.co/abusing-sqlite-to-handle-concurrency/
https://tenthousandmeters.com/blog/sqlite-concurrent-writes-and-database-is-locked-errors/
https://www.sqlite.org/src/doc/begin-concurrent/doc/begin_concurrent.md
https://www.skoumal.com/en/parallel-read-and-write-in-sqlite/
https://turso.tech/blog/beyond-the-single-writer-limitation-with-tursos-concurrent-writes
https://mohit-bhalla.medium.com/understanding-wal-mode-in-sqlite-boosting-performance-in-sql-crud-operations-for-ios-5a8bd8be93d2
https://sqlite.org/forum/info/b4e8b29ae409cd198652c6b7e70b53b702f269e67e1d2573d627feeba37bbf85
https://sqlite.org/forum/forumpost/c4dbf6ca17
https://sqlite.org/limits.html
https://sqlite.org/whentouse.html
https://www.hendrik-erz.de/post/why-you-shouldnt-use-sqlite
https://runebook.dev/en/articles/sqlite/limits
https://github.com/sqlitebrowser/sqlitebrowser/issues/114
https://www.quora.com/What-volume-of-data-can-SQLite-handle
https://www.dbtalks.com/tutorials/learn-sqlite/what-are-the-limitations-of-sqlite
https://news.ycombinator.com/item?id=24178013
https://sqlite.org/fileformat.html
https://berthub.eu/articles/posts/a-brief-post-on-sqlite3-database-locked-despite-timeout/
https://sqlite.org/c3ref/busy_timeout.html
https://highperformancesqlite.com/watch/busy-timeout
https://docsaid.org/en/blog/sqlite-wal-busy-timeout-for-workers/
https://lobste.rs/s/yapvon/what_do_about_sqlite_busy_errors_despite
https://sqlite.org/forum/info/538711653d62ec90
https://emschwartz.me/psa-your-sqlite-connection-pool-might-be-ruining-your-write-performance/
https://mozilla.github.io/firefox-browser-architecture/text/0010-firefox-data-stores.html
https://github.com/mozilla/firefox-data-store-docs/blob/master/README.md
https://forum.codeselfstudy.com/t/fun-with-firefox-and-sqlite/1551
https://github.com/Psmths/windows-forensic-artifacts/blob/main/browser/firefox-places-sqlite.md
https://psmths.gitbook.io/windows-forensics/artifacts-by-activity/browser-activity/history/firefox-places-sqlite
https://wiki.mozilla.org/Places:Design_Overview
https://en.wikiversity.org/wiki/Firefox/Browsing_history_database
https://firefox-source-docs.mozilla.org/browser/places/architecture-overview.html
https://wiki.mozilla.org/Browser_History
https://wiki.mozilla.org/images/d/d5/Places.sqlite.schema3.pdf
https://github.com/crazy-max/firefox-history-merger
https://mattreduce.com/posts/vscode-global-state/
https://ajpc500.github.io/macos/Targeting-Visual-Studio-Code-For-macOS/
https://github.com/microsoft/vscode/issues/179882
https://containersolutions.github.io/runbooks/posts/how-to/debug-vscode-view-issues/
https://blog.neetcode.io/p/notion-uses-sqlite-caching
https://www.notion.com/blog/how-we-sped-up-notion-in-the-browser-with-wasm-sqlite
https://medium.com/@ranjithp27122003/how-notion-leverages-sqlite-the-secret-behind-lightning-fast-web-apps-aa30fdfe2f4e
https://blog.quastor.org/p/notion-decreased-latency-20-caching
https://www.notion.com/blog/data-model-behind-notion
https://www.notion.com/blog/how-we-made-notion-available-offline
https://newsletter.betterstack.com/p/how-sqlite-made-notion-30-faster
https://stacksweep.substack.com/p/yes-you-should-use-sqlite-notions
https://news.ycombinator.com/item?id=40949489
https://notionanswers.com/531/notion-cache-files-offline-viewing-where-store-those-cache
https://tldr.tech/dev/2024-08-05
https://affine.pro/blog/notion-offline
https://deepwiki.com/jayminwest/overstory/6.5-concurrency-and-wal-mode
https://dev.to/hexshift/build-a-shared-nothing-distributed-queue-with-sqlite-and-python-3p1
https://jasongorman.uk/writing/sqlite-background-job-system/
https://github.com/dapr/components-contrib/issues/2485
https://github.com/litements/litequeue
https://railway.com/deploy/inngest-single-node-sqlite
https://sqlite.org/forum/info/b047f5ef5b76edff
https://news.ycombinator.com/item?id=36893193
https://github.com/damoclark/node-persistent-queue
https://github.com/karakeep-app/liteque
https://deepwiki.com/litements/litequeue
https://github.com/ianozsvald/litequeue
https://litements.exampl.io/queue/
https://github.com/khepin/liteq
https://pypi.org/project/litequeue/
https://almworks.com/sqlite4java/javadoc/com/almworks/sqlite4java/SQLiteQueue.html
https://cran.r-project.org/web/packages/liteq/liteq.pdf
https://docs.dapr.io/reference/components-reference/supported-state-stores/setup-sqlite/
https://docs.dapr.io/developing-applications/building-blocks/state-management/state-management-overview/
https://deepwiki.com/dapr/components-contrib/2.2-database-state-stores
https://deepwiki.com/dapr/components-contrib/2-state-store-components
https://www.sqliteforum.com/p/sqlite-versioning-and-migration-strategies
https://levlaz.org/sqlite-db-migrations-with-pragma-user_version/
https://sqlite.org/forum/forumpost/0f9dd8806f
https://gluer.org/blog/sqlites-user_version-pragma-for-schema-versioning/
https://sqlite-users.sqlite.narkive.com/Ejw3FSGG/sqlite-best-practices-for-forward-conversion-of-database-formats
https://www.sqliteforum.com/p/managing-database-versions-and-migrations
https://david.rothlis.net/declarative-schema-migration-for-sqlite/
https://iifx.dev/en/articles/11170705
https://metacpan.org/pod/ORLite::Migrate
https://sqldelight.github.io/sqldelight/2.0.2/jvm_sqlite/migrations/
https://sqlpey.com/sqlite/android-sqlite-multithreading-safe-access/
https://sqlpey.com/sqlite/android-sqlite-concurrency-strategies/
https://medium.com/androiddevelopers/testing-room-migrations-be93cdb0d975
https://codezup.com/room-persistence-library-android-offline-storage/
https://developers-heaven.net/blog/introduction-to-room-persistence-library-sqlite-orm-for-android/
https://dev.to/keyopstech/unit-test-a-room-migration-on-android-1ma7
https://developer.android.com/training/data-storage/room/migrating-db-versions
https://developer.android.com/training/data-storage/room/sqlite-room-migration
https://androidessence.com/mastering-room-database-migrations/
https://medium.com/@alireza.abdolalipoor/android-room-migrations-and-migration-testing-for-dummies-like-me-9275a91396d8
https://www.dbpro.app/blog/sqlite-json-virtual-columns-indexing
https://sqlite.org/json1.html
https://hackolade.com/json-in-rdbms.html
https://dev.to/patarapolw/what-is-the-best-way-store-column-metadata-in-sqlite-like-is-json-2m1f
https://news.ycombinator.com/item?id=31396578
https://www.dolthub.com/blog/2024-11-18-json-sqlite-vs-dolt/
https://ubos.tech/news/unlocking-sqlite-performance-json-virtual-columns-indexing-explained/
https://medium.com/@345490675/optimizing-relational-database-design-with-json-data-type-66839046a26a
https://mariadb.com/database-topics/semi-structured-data/
```

---

## Open Questions

1. **Write serialization mechanism**: Should Sherpa use an application-level mutex (Go/Node lock), a single-writer process, or a message queue for write coordination? The answer depends on the deployment model (single process with worker threads vs. multiple processes).

2. **Filesystem-canonical vs. SQLite-canonical**: Fossil's "rebuild from artifacts" pattern is elegant but requires discipline. Should initiatives always be canonical in Markdown files with SQLite as derived index? Or should some state (task queue, agent sessions) be SQLite-canonical with no filesystem representation?

3. **JSON column indexing strategy**: When using the hybrid JSON + virtual columns pattern, which fields should be indexed from day one vs. added later? The "add indexes lazily" benefit only works if the initial data volume is small enough to tolerate full scans.

4. **Schema migration testing**: Android Room's MigrationTestHelper pattern suggests migration tests should be first-class. What does this look like for a TypeScript/Node.js SQLite stack? (better-sqlite3 + custom migration runner?)

5. **Stale lock detection**: For the task queue, how long before a "claimed" task with no heartbeat should be reclaimed? Litequeue identifies this as an unsolved problem. A heartbeat column + reaper process is the common pattern.

6. **ATTACH vs. separate connections**: Firefox ATTACHes favicons.sqlite to places.sqlite for cross-database queries. Should Sherpa ATTACH its separate DB files for cross-concern queries (e.g., "show all tasks for this initiative"), or maintain separate connections and join in application code?

7. **better-sqlite3 vs. libsql**: For the TypeScript/Node stack, better-sqlite3 is synchronous and well-tested. libsql adds embedded replicas and HTTP server mode. Is the added complexity of libsql justified for Sherpa's single-machine topology, or is it future-proofing that adds risk?
