# SQLite-to-File Projection Sync Strategies

**Research question:** If SQLite is the authoritative store and markdown files are projections, what are the sync strategies? Write-through vs periodic materialization? How do humans edit projected files?

**Date:** 2026-03-11
**Iteration:** 2

---

## Key Discoveries

### The Projection Pattern (CQRS / Event Sourcing)

- **A projection transforms authoritative state into a read-optimized view.** In CQRS, the write model (command side) stores canonical data; projections build read models optimized for queries. The projection is completely disposable -- it can always be rebuilt from the source. ([Microsoft Azure Architecture](https://learn.microsoft.com/en-us/azure/architecture/patterns/materialized-view), [Kurrent Blog](https://www.kurrent.io/blog/live-projections-for-read-models-with-event-sourcing-and-cqrs))

- **Three projection lifecycles exist in practice** (terminology from Marten, a .NET event sourcing library):
  1. **Inline (write-through):** Projection executes synchronously within the same transaction as the write. Strong consistency. Higher write latency.
  2. **Async (eventual):** Background daemon continuously updates projections. Eventual consistency. Write path stays fast.
  3. **Live (on-demand):** Projection computed fresh from events at query time. No storage. Always consistent but costs CPU per read.
  ([Marten Projections Docs](https://martendb.io/events/projections/), [Domain Centric Blog](https://domaincentric.net/blog/event-sourcing-projections))

- **Marten's recommendation: "Start with inline projections, then switch to async if needed."** This is directly applicable to Sherpa -- start simple, add complexity only when write latency becomes a problem. ([Kurrent Blog](https://www.kurrent.io/blog/live-projections-for-read-models-with-event-sourcing-and-cqrs))

- **The projected view is a specialized cache.** Microsoft's materialized view pattern documentation explicitly states: "A materialized view is never updated directly by an application, and so it's a specialized cache." This framing is critical for Sherpa -- the markdown files are cache, not source. ([Microsoft Azure Architecture](https://learn.microsoft.com/en-us/azure/architecture/patterns/materialized-view))

### Strategy 1: Write-Through (Inline Projection)

**How it works:** Every MCP tool call that mutates SQLite also regenerates the affected markdown file(s) in the same operation.

**Pros:**
- Markdown files are always consistent with SQLite -- no staleness window
- Simple mental model: "after any write, files are current"
- No background processes to manage
- No race conditions between write and projection

**Cons:**
- Write latency increases proportionally with the number of projection targets (Marten docs warn: "Your write transactions will take longer to process. This will grow the more inline projections you introduce.")
- Cannot scale read and write paths independently
- Rebuilding all projections requires stopping writes (unlike async, which can rebuild while writes continue)
- If file write fails (permissions, disk full), the entire operation fails -- coupling the durable store to the filesystem

**Verdict for Sherpa:** This is the right starting point. Agent coordination involves low write frequency (proposals, task updates, activity logs -- not thousands of writes/second). The consistency benefit outweighs the latency cost at this scale.

### Strategy 2: Periodic Materialization

**How it works:** A scheduled process reads SQLite and regenerates all markdown files at a fixed interval.

**Pros:**
- Decouples write path from file generation
- Simple to implement (cron job or timer)
- Batch efficiency -- can regenerate many files in one pass

**Cons:**
- Staleness window equals the interval. Even 5 seconds of staleness can confuse a human reading files while an agent is writing.
- Wasteful -- regenerates unchanged files
- Choosing the interval is impossible to get right: too fast wastes resources, too slow creates confusion
- "It is often challenging to choose a refresh schedule that has a balance between stale data and the cost of the rebuild." ([Microsoft Azure Architecture](https://learn.microsoft.com/en-us/azure/architecture/patterns/materialized-view))

**Verdict for Sherpa:** Poor fit. The use case requires files to be current when humans look at them. A 10-second-stale `activity.md` creates confusion in a collaborative workflow.

### Strategy 3: Event-Driven Projection (Change Hooks)

**How it works:** SQLite changes trigger markdown file regeneration, either via `sqlite3_update_hook()` or a change log table with polling.

**SQLite-specific mechanisms:**
- `sqlite3_update_hook()` registers a callback on INSERT/UPDATE/DELETE, but **only fires for the connection that made the change** -- not cross-process. This is a critical limitation since the MCP server and any file watcher would be different processes. ([SQLite docs](https://sqlite.org/c3ref/update_hook.html))
- `PRAGMA data_version` returns a value that increments when another process commits a change. Can be polled. ([SQLite Forum](https://sqlite.org/forum/info/d2586c18e7197c39c9a9ce7c6c411507c3d1e786a2c4889f996605b236fec1b7))
- **Trigger-based change log table:** Write triggers that log changes to an audit table. A separate process polls the audit table. Simon Willison's `sqlite-history` library automates this: creates `_tablename_history` tables with `_version`, `_updated`, `_mask` (bitmask of changed columns). ([Simon Willison](https://simonwillison.net/2023/Apr/15/sqlite-history/), [Simon Willison TIL](https://til.simonwillison.net/sqlite/json-audit-log))
- **Turso CDC:** Turso (SQLite fork) has first-class CDC via `PRAGMA unstable_capture_data_changes_conn('full')`, logging to a `turso_cdc` table with before/after states. Not available in standard SQLite. ([Turso Blog](https://turso.tech/blog/introducing-change-data-capture-in-turso-sqlite-rewrite))
- **LiteFS transaction tracking:** LiteFS intercepts WAL writes at the FUSE level, capturing page-level changes into LTX files with transaction IDs. Demonstrates that SQLite change tracking can be done externally. ([Fly.io LiteFS](https://fly.io/docs/litefs/how-it-works/), [Fly.io Blog](https://fly.io/blog/introducing-litefs/))

**Practical approach for Sherpa:** Since the MCP server owns the SQLite connection, use `sqlite3_update_hook()` within the same process. The MCP server itself can trigger file regeneration after each mutation. This converges with the write-through approach -- the "event" is just the write itself.

**Verdict for Sherpa:** The in-process update hook is effectively write-through. Cross-process CDC is over-engineered for the current architecture where one MCP server owns all writes.

### Strategy 4: Bidirectional Sync (Human Edits Back to SQLite)

This is the hard problem. If markdown files are projections, but humans can edit them, how do changes flow back?

**Detection mechanisms:**
- **chokidar (Node.js):** File watcher using native OS events (FSEvents on macOS, inotify on Linux). Supports `add`, `change`, `unlink` events. Used in ~30 million repositories. Has `awaitWriteFinish` option to avoid reading partially-written files. Key challenge: **avoiding feedback loops** when the system itself writes files. Solutions include `ignored` patterns, debouncing (default 400ms), and tracking "self-triggered" writes. ([chokidar GitHub](https://github.com/paulmillr/chokidar), [chokidar npm](https://www.npmjs.com/package/chokidar))
- **fswatch:** Cross-platform file monitor with multiple backends (FSEvents, kqueue, inotify). Outputs change events to stdout. ([fswatch GitHub](https://github.com/emcrisostomo/fswatch))
- **Git hooks:** `pre-commit` hook can detect changed files via `git diff --cached --name-only` and sync them to SQLite before commit. Only triggers on commit, not on save. ([Git docs](https://git-scm.com/book/en/v2/Customizing-Git-Git-Hooks))
- **Content hashing:** Store SHA-256 of file content in SQLite. On detection of file change, compare hash. If different from stored hash AND different from what the system last wrote, it's a human edit.

**The feedback loop problem:** When the system writes a markdown file (projection), the file watcher detects that as a "change" and tries to ingest it back. Solutions:
1. **Write lock flag:** Set a boolean before writing; file watcher ignores changes while flag is set.
2. **Known-hash tracking:** After writing, record the file's hash. If file watcher sees a change and the hash matches the last-written hash, ignore it.
3. **Debounce + coalescing:** Wait for writes to settle (400-1000ms) before processing. ([chokidar-debounced](https://www.npmjs.com/package/chokidar-debounced))

### Conflict Resolution

**When do conflicts occur?** When both SQLite and a file change between sync points. In practice with write-through projection, this means: an agent writes to SQLite (which updates the file), and a human edits the file before the write completes, or edits a different section of the same file simultaneously.

**Strategies from the literature:**
- **Last-write-wins (LWW):** Simple timestamp comparison. Obsidian Sync uses this for non-markdown files. Risk: silent data loss. ([Obsidian Sync docs](https://deepwiki.com/obsidianmd/obsidian-help/2.3-filters-and-views))
- **Three-way merge:** Obsidian uses Google's diff-match-patch for markdown files -- a three-way merge combining changes from multiple sources. More complex but preserves both sides. ([Obsidian Forum](https://forum.obsidian.md/t/robust-sync-conflict-resolution/93544))
- **Conflict files:** Syncthing renames the older version with a `.sync-conflict` suffix. User resolves manually. ([Syncthing docs](https://docs.syncthing.net/users/syncing.html))
- **CRDTs:** Automerge and Yjs enable conflict-free merging of concurrent edits. ElectricSQL uses CRDTs for Postgres-to-SQLite active-active sync. Heavy machinery -- likely overkill for Sherpa's use case. ([Automerge](https://github.com/alangibson/awesome-crdt), [ElectricSQL](https://electric-sql.com/blog/2023/09/20/introducing-electricsql-v0.6))
- **Vector clocks:** Track causal ordering without synchronized clocks. Used by Dynamo/Cassandra. Useful for distributed agents but complex to implement. ([Design Gurus](https://www.designgurus.io/course-play/grokking-the-advanced-system-design-interview/doc/vector-clocks-and-conflicting-data))

**Recommended for Sherpa:**
1. **SQLite always wins** for structured fields (status, dates, metadata in frontmatter). The database is the authority.
2. **Human edits win** for prose content (the body of a proposal, notes in an activity log). If a human took the time to edit a file, that intent should be preserved.
3. **Detect via content hash in frontmatter.** Each projected file includes a `_projection_hash` in its frontmatter. On file change detection, compare the body hash against the stored hash. If the hash doesn't match what was last projected, it's a human edit -- ingest the prose changes back to SQLite while preserving SQLite's authoritative metadata.

### YAML Frontmatter as Sync Metadata

Frontmatter is already the standard metadata container for markdown files in static site generators, Obsidian, Hugo, Jekyll, and Sherpa's own initiative convention. Using it for sync metadata is a natural extension.

**Proposed frontmatter fields for projection sync:**
```yaml
---
# Domain metadata (authoritative in SQLite, projected to file)
status: in-progress
initiative: mcp-coordination-layer
created: 2026-03-11

# Sync metadata (managed by projection system)
_projection_hash: "sha256:a1b2c3..."   # Hash of file content at last projection
_projected_at: "2026-03-11T14:30:00Z"  # When this file was last generated
_source_version: 42                     # SQLite row version / sequence number
---
```

**How sync uses these fields:**
1. System projects file, computes hash of generated content, stores hash in frontmatter and SQLite.
2. Human edits file body (and possibly frontmatter domain fields).
3. File watcher detects change.
4. System reads frontmatter `_projection_hash`, computes hash of current body content.
5. If hashes differ: human edited the body. Ingest body changes to SQLite. Re-project with updated `_projection_hash`.
6. If hashes match but frontmatter domain fields differ: human edited metadata. Validate and update SQLite.
7. If `_source_version` is behind SQLite's current version: file is stale, re-project.

### Existing Systems That Do This

| System | Source of Truth | Projection Format | Sync Direction | Strategy |
|--------|----------------|-------------------|----------------|----------|
| **Obsidian Bases** | Markdown files (frontmatter) | Database views (computed) | Unidirectional: files -> views. Table edits write back to files. | Files are authority; views are live projections. ([DeepWiki](https://deepwiki.com/obsidianmd/obsidian-help/5-bases-database-system)) |
| **Obsidian Sync** | Remote vault | Local files | Bidirectional | Three-way merge for markdown, LWW for binary. ([Obsidian Forum](https://forum.obsidian.md/t/robust-sync-conflict-resolution/93544)) |
| **Logseq DB version** | SQLite (new) | Markdown export (CLI) | Unidirectional: DB -> markdown. No round-trip. | Abandoned bidirectional. Export only. Community concern about losing file access. ([Logseq Forum](https://discuss.logseq.com/t/logseq-og-markdown-vs-logseq-db-sqlite/34608), [Logseq Docs](https://github.com/logseq/docs/blob/master/db-version.md)) |
| **Decap CMS (Netlify CMS)** | Git (markdown files) | Browser UI | Bidirectional via Git API | CMS writes commits to Git. Files are source of truth. ([Decap GitHub](https://github.com/decaporg/decap-cms)) |
| **Keystatic** | Git (markdown/YAML/JSON files) | Browser UI | Bidirectional via filesystem or GitHub API | Files are authority. No separate database. ([Keystatic](https://keystatic.com/)) |
| **Sanity Content Lake** | Structured JSON database | GROQ projections (API responses) | Unidirectional: DB -> API. Markdown not native. | Database is authority. Projections are query-time transforms. ([Sanity Docs](https://www.sanity.io/content-lake)) |
| **Hugo / Jekyll / SSGs** | Markdown files | HTML (built output) | Unidirectional: files -> HTML | Files are authority. Build is projection. No database. ([Hugo](https://gohugo.io/)) |
| **Strapi** | Database (SQLite/Postgres) | API responses | Unidirectional: DB -> API | Database is authority. No file projection. Lifecycle hooks for automation. ([Strapi Docs](https://docs.strapi.io/cms/configurations/database)) |
| **ElectricSQL** | Postgres (cloud) | SQLite (local device) | Bidirectional with CRDTs | Active-active sync with conflict-free resolution via CRDTs. ([ElectricSQL](https://electric-sql.com/blog/2023/09/20/introducing-electricsql-v0.6)) |
| **PocketBase** | SQLite | REST API + Realtime WebSocket | Unidirectional: DB -> clients | Database is authority. Realtime subscriptions for live updates. ([PocketBase](https://pocketbase.io/docs/)) |
| **Contentlayer** (unmaintained) | Markdown/MDX files | Type-safe JSON (generated) | Unidirectional: files -> JSON | Files are authority. Schema validates content. Watcher regenerates on change. ([Contentlayer](https://contentlayer.dev/)) |

**Key observation:** No existing system does exactly what Sherpa needs -- database as authority with human-editable file projections and bidirectional sync. Obsidian Bases comes closest in spirit (it reverses the direction: files are authority, database views are projection). Logseq tried the DB-authority approach and **gave up on bidirectional** -- their DB version only exports to markdown, no round-trip. This suggests bidirectional sync is genuinely hard and Sherpa should be cautious about the scope of what's editable in projected files.

### The `sherpa sync` Command

Based on this research, `sherpa sync` should be a CLI reconciliation tool with these modes:

```
sherpa sync status       # Show which files are out of sync with SQLite
sherpa sync project      # Re-project all markdown files from SQLite (full rebuild)
sherpa sync ingest       # Detect human-edited files and ingest changes to SQLite
sherpa sync reconcile    # Bidirectional: project + ingest with conflict detection
sherpa sync watch        # Start file watcher for continuous sync (dev mode)
```

**`sherpa sync project`** is always safe -- it's a full cache rebuild. Analogous to clearing and rebuilding a materialized view.

**`sherpa sync ingest`** is the dangerous one. It must:
1. Read each projected file's `_projection_hash`
2. Compare against current file content hash
3. If different, parse the file and update SQLite
4. Handle conflicts (SQLite may have also changed since projection)

### Failure Modes

- **Partial write:** System crashes mid-file-write, leaving a truncated markdown file. **Mitigation:** Use write-then-rename pattern via `write-file-atomic` npm package. Write to `.filename.md.tmp`, fsync, then atomic rename. ([write-file-atomic](https://github.com/npm/write-file-atomic), [Dan Luu - Files are Hard](https://danluu.com/file-consistency/))
- **Crash during sync:** SQLite updated but file not yet written (or vice versa). **Mitigation:** Write SQLite first (with `_projection_hash` of what we're about to write), then write file. On recovery, re-project any file whose content hash doesn't match its `_projection_hash`.
- **File permissions:** Projected file is read-only or in a directory the process can't write. **Mitigation:** Check permissions before write; log errors clearly.
- **Git conflicts:** Two branches modify the same projected file. **Mitigation:** Since files are projections, git conflicts in them are resolved by re-projecting from SQLite after the merge. `sherpa sync project` in a post-merge hook.
- **Race condition in bidirectional sync:** Human edits file while agent writes to SQLite simultaneously. **Mitigation:** Use file locking (advisory locks) during projection. Accept eventual consistency with short window.
- **Stale read:** Agent reads a projected file that hasn't been updated yet (only relevant in async/periodic strategies). **Mitigation:** Agents should always read from SQLite, never from projected files. Files are for humans.
- **Silent corruption:** Disk errors produce incorrect file content without OS-level errors. Occurs on ~0.5% of disks annually. **Mitigation:** Content checksums in frontmatter enable detection. ([Dan Luu - Files are Hard](https://danluu.com/file-consistency/))

---

## Implications for Sherpa's File Projection Architecture

1. **Start with write-through.** Every MCP tool call that mutates SQLite also regenerates the affected file(s). The write frequency is low enough (initiative updates, task state changes) that the latency cost is negligible. This eliminates the entire class of staleness bugs.

2. **Agents read from SQLite, never from files.** Projected files are for human consumption and git-based review. Agents use MCP tools that query SQLite directly. This eliminates read-consistency concerns.

3. **Make projected files obviously machine-generated.** Include a comment or frontmatter field like `_generated: true` and `_projected_at: <timestamp>`. Humans should know they're looking at a projection, not a source file.

4. **Support human edits on a limited surface area.** Don't try to make every field round-trippable. Define which parts of a projected file are human-editable:
   - **Editable:** Prose body content (proposal text, activity log entries, notes)
   - **Read-only (re-projected on sync):** Status fields, dates, computed metadata, structural sections
   - This distinction should be documented in the file itself (e.g., `<!-- Editable below this line -->`)

5. **Use content hashing for change detection, not timestamps.** File modification timestamps are unreliable across git operations, editors, and sync tools. A SHA-256 hash of the file body (excluding frontmatter sync fields) is deterministic and portable.

6. **The `sherpa sync` command is essential.** It's the escape hatch. When things get confusing, `sherpa sync project` rebuilds everything from SQLite. When a human has edited files, `sherpa sync ingest` pulls changes back. This is more important than getting the automatic sync perfect.

7. **Git post-merge hook should auto-project.** After a `git merge` or `git pull`, run `sherpa sync project` to ensure projected files match the (potentially merged) SQLite state. This prevents projected files from being stale after branch operations.

8. **Don't store the SQLite database in git.** SQLite files are binary and don't merge. Store them in `.gitignore`. The database is reconstructed from a schema + seed data, or from the markdown files themselves on first `sherpa sync ingest`.

9. **Consider making markdown files the bootstrap source.** If someone clones the repo and has no SQLite database, `sherpa sync ingest` should be able to build the database from the markdown files. This makes the git repo self-contained. The direction of authority is: SQLite during runtime, markdown files for cold-start / portability.

---

## Open Questions

1. **Granularity of projection.** Is each SQLite row one markdown file? Or does a single file aggregate multiple rows (e.g., a task board file generated from all tasks)? Aggregate files are harder to round-trip.

2. **What about files that aren't projections?** Some markdown files in the initiative system are human-authored originals (proposals written by humans, not generated from a database). How does the system distinguish "this is a projection" from "this is a source file"? The `_generated: true` frontmatter field helps, but it needs to be robust.

3. **Schema evolution.** When the projection template changes (new fields, restructured sections), all projected files need re-projection. Is this a migration step? How does it interact with git history?

4. **Multi-agent write conflicts in SQLite.** If two agents try to update the same row via separate MCP tool calls, SQLite's serialized writes prevent corruption, but the second write may overwrite the first's changes. This is an SQLite-level concern (optimistic concurrency with version checks) rather than a projection concern, but it affects which data gets projected.

5. **Performance ceiling.** At what scale does write-through projection become a bottleneck? Likely: hundreds of files being projected per second. Sherpa is far from this, but the architecture should have a clear upgrade path to async projection.

6. **Should the MCP server serve file content directly?** Instead of agents reading projected files, should the MCP server have a `read_projection` tool that returns the rendered markdown? This would decouple agents from the filesystem entirely.

7. **Frontmatter editing UX.** If a human edits a projected file's frontmatter (e.g., changes `status: pending` to `status: approved`), should that be treated as an authoritative edit? Or should humans be required to use MCP tools / CLI for status changes? The answer affects the bidirectional sync scope significantly.

---

## Sources

### Primary References
- [Microsoft Azure - Materialized View Pattern](https://learn.microsoft.com/en-us/azure/architecture/patterns/materialized-view) -- Canonical description of materialized views as disposable caches
- [Microsoft Azure - CQRS Pattern](https://learn.microsoft.com/en-us/azure/architecture/patterns/cqrs) -- Command Query Responsibility Segregation overview
- [Kurrent Blog - Live Projections for Read Models](https://www.kurrent.io/blog/live-projections-for-read-models-with-event-sourcing-and-cqrs) -- Live vs materialized projections with Go code examples
- [Marten Projections Documentation](https://martendb.io/events/projections/) -- Inline/async/live projection lifecycle with .NET examples
- [Domain Centric - Event Sourcing Projections](https://domaincentric.net/blog/event-sourcing-projections) -- Projections theory and practice
- [Dan Luu - Files are Hard](https://danluu.com/file-consistency/) -- Comprehensive analysis of file system consistency failures
- [Simon Willison - sqlite-history](https://simonwillison.net/2023/Apr/15/sqlite-history/) -- Trigger-based change tracking for SQLite with version/timestamp/column-mask
- [Simon Willison - JSON Audit Log](https://til.simonwillison.net/sqlite/json-audit-log) -- JSON-based change logging in SQLite
- [SQLite - Update Hook](https://sqlite.org/c3ref/update_hook.html) -- sqlite3_update_hook() API documentation
- [SQLite Forum - Cross Process Change Notification](https://sqlite.org/forum/info/d2586c18e7197c39c9a9ce7c6c411507c3d1e786a2c4889f996605b236fec1b7) -- Discussion of data_version pragma and cross-process limitations

### Sync and Conflict Resolution
- [Obsidian Help - Sync Conflict Resolution (DeepWiki)](https://deepwiki.com/obsidianmd/obsidian-help/2.3-filters-and-views) -- Three-way merge for markdown, LWW for binary
- [Obsidian Forum - Robust Sync Conflict Resolution](https://forum.obsidian.md/t/robust-sync-conflict-resolution/93544) -- Community discussion of Obsidian's sync approach
- [Syncthing - Understanding Synchronization](https://docs.syncthing.net/users/syncing.html) -- Block-level hashing and conflict file approach
- [Bartosz Sypytkowski - Conflict-Free Database over VFS](https://www.bartoszsypytkowski.com/conflict-free-database-over-virtual-file-system/) -- BitCask-style append-only logs with LWW over cloud sync
- [Design Gurus - Vector Clocks](https://www.designgurus.io/course-play/grokking-the-advanced-system-design-interview/doc/vector-clocks-and-conflicting-data) -- Vector clock theory for distributed conflict detection
- [ElectricSQL - Introducing v0.6](https://electric-sql.com/blog/2023/09/20/introducing-electricsql-v0.6) -- CRDT-based Postgres-to-SQLite active-active sync

### Tools and Libraries
- [chokidar (GitHub)](https://github.com/paulmillr/chokidar) -- File watching library for Node.js
- [chokidar (npm)](https://www.npmjs.com/package/chokidar) -- 30M+ repos, debounce and awaitWriteFinish options
- [fswatch (GitHub)](https://github.com/emcrisostomo/fswatch) -- Cross-platform file change monitor
- [write-file-atomic (npm)](https://www.npmjs.com/package/write-file-atomic) -- Atomic file writes via temp+rename pattern
- [write-file-atomic (GitHub)](https://github.com/npm/write-file-atomic) -- npm's atomic write implementation
- [better-sqlite3 (GitHub)](https://github.com/WiseLibs/better-sqlite3) -- Fastest SQLite3 library for Node.js
- [better-sqlite3 (npm)](https://www.npmjs.com/package/better-sqlite3) -- Synchronous API, WAL mode support

### Database and Replication
- [SQLite WAL Mode](https://sqlite.org/wal.html) -- Write-Ahead Logging documentation
- [SQLite WAL Hook](https://sqlite.org/c3ref/wal_hook.html) -- Write-Ahead Log commit hook API
- [Litestream](https://litestream.io/) -- Streaming replication for SQLite
- [Litestream - How it Works](https://litestream.io/how-it-works/) -- WAL-based change capture mechanism
- [LiteFS - How it Works](https://fly.io/docs/litefs/how-it-works/) -- FUSE-based SQLite replication with LTX format
- [LiteFS Blog](https://fly.io/blog/introducing-litefs/) -- Transaction-aware page-level change capture
- [LiteFS WAL Mode Blog](https://fly.io/blog/wal-mode-in-litefs/) -- WAL mode integration details
- [Turso CDC](https://turso.tech/blog/introducing-change-data-capture-in-turso-sqlite-rewrite) -- First-class CDC for SQLite via pragma
- [SQLite - Faster Than Filesystem](https://sqlite.org/fasterthanfs.html) -- Performance comparison: SQLite vs direct file I/O
- [PocketBase](https://pocketbase.io/docs/) -- SQLite backend with realtime subscriptions
- [PocketBase (GitHub)](https://github.com/pocketbase/pocketbase) -- Open source realtime backend in 1 file

### CMS and Content Systems
- [Obsidian Bases (DeepWiki)](https://deepwiki.com/obsidianmd/obsidian-help/5-bases-database-system) -- Markdown-as-database with computed views
- [Logseq DB Version Docs](https://github.com/logseq/docs/blob/master/db-version.md) -- SQLite migration, export-only approach
- [Logseq Forum - MD vs DB](https://discuss.logseq.com/t/logseq-og-markdown-vs-logseq-db-sqlite/34608) -- Community discussion on file vs database authority
- [Logseq Forum - Data Structures for Bridging](https://discuss.logseq.com/t/data-structures-for-bridging-logseq-md-to-logseq-db/34851) -- Bridging file and database representations
- [Logseq Migration Journey](https://www.solanky.dev/p/logseq-migration-journey-challenges-delays-and-hopes) -- Challenges of file-to-database transition
- [Decap CMS (GitHub)](https://github.com/decaporg/decap-cms) -- Git-based CMS, files as authority
- [Keystatic](https://keystatic.com/) -- File-based CMS with GitHub/filesystem modes
- [Keystatic (GitHub)](https://github.com/Thinkmill/keystatic) -- TypeScript API, Markdown & YAML/JSON, no DB
- [Sanity Content Lake](https://www.sanity.io/content-lake) -- Structured JSON database with GROQ projections
- [Sanity GROQ](https://www.sanity.io/docs/content-lake/groq-introduction) -- Query language for projections
- [Contentlayer](https://contentlayer.dev/) -- Markdown-to-typed-JSON pipeline (unmaintained)
- [Hugo](https://gohugo.io/) -- Static site generator, markdown files as source
- [Hugo Content Management](https://gohugo.io/content-management/) -- File-based content pipeline
- [Hugo Front Matter](https://gohugo.io/content-management/front-matter/) -- YAML/TOML/JSON frontmatter
- [Strapi Database Config](https://docs.strapi.io/cms/configurations/database) -- SQLite as default for local development
- [Strapi Data Export](https://docs.strapi.io/cms/data-management/export) -- Export as encrypted tar.gz

### CRDTs and Distributed Data
- [CRDT Implementations (crdt.tech)](https://crdt.tech/implementations) -- Comprehensive list of CRDT libraries
- [Yjs (GitHub)](https://github.com/yjs/yjs) -- YATA-based CRDT for collaborative editing
- [Automerge + Convex](https://stack.convex.dev/automerge-and-convex) -- Local-first with CRDT sync
- [CRDT Field Guide](https://www.iankduncan.com/engineering/2025-11-27-crdt-dictionary/) -- Comprehensive CRDT dictionary
- [awesome-crdt (GitHub)](https://github.com/alangibson/awesome-crdt) -- Curated CRDT resource list
- [RxDB CRDT](https://rxdb.info/crdt.html) -- CRDT integration in JavaScript database

### Frontmatter and Metadata
- [GitHub - Using YAML Frontmatter](https://docs.github.com/en/contributing/writing-for-github-docs/using-yaml-frontmatter) -- GitHub's frontmatter conventions
- [frontmatter-format (GitHub)](https://github.com/jlevy/frontmatter-format) -- Convention for YAML metadata on any file
- [Obsidian - YAML Front Matter](https://help.obsidian.md/Advanced+topics/YAML+front+matter) -- Obsidian's frontmatter support
- [spatie/yaml-front-matter (GitHub)](https://github.com/spatie/yaml-front-matter) -- PHP frontmatter parser

### File System Safety
- [Crash Consistency (ACM Queue)](https://queue.acm.org/detail.cfm?id=2801719) -- Formal treatment of crash consistency
- [Atomic File Modifications (DEV)](https://dev.to/martinhaeusler/towards-atomic-file-modifications-2a9n) -- Patterns for safe file updates
- [Stop Silent Data Loss (checksums)](https://tech-champion.com/data-science/stop-silent-data-loss-checksum-atomic-writes-temp-file-patterns/) -- Checksum + atomic write patterns
- [Content-Addressable Storage (Wikipedia)](https://en.wikipedia.org/wiki/Content-addressable_storage) -- Hash-based content addressing
- [Content-Addressable Storage with Postgres](https://www.richard-towers.com/2020/06/06/content-addressable-storage-postgres.html) -- CAS implementation in databases

### MCP and Tooling
- [MCP Example Servers](https://modelcontextprotocol.io/examples) -- Official MCP server examples
- [SQLite MCP Server (PulseMCP)](https://www.pulsemcp.com/servers/modelcontextprotocol-sqlite) -- Anthropic's reference SQLite MCP
- [mcp-sqlite (GitHub)](https://github.com/jparkerweb/mcp-sqlite) -- Comprehensive SQLite MCP with filesystem integration

### Architecture and Patterns
- [Event-Driven.io - Projections Guide](https://event-driven.io/en/projections_and_read_models_in_event_driven_architecture/) -- Read models in event-driven architecture
- [CodeOpinion - Projections in Event Sourcing](https://codeopinion.com/projections-in-event-sourcing-build-any-model-you-want/) -- Build any model from events
- [Baeldung - CQRS and Event Sourcing Java](https://www.baeldung.com/cqrs-event-sourcing-java) -- Java implementation reference
- [IBM - CQRS Patterns](https://ibm-cloud-architecture.github.io/refarch-eda/patterns/cqrs/) -- IBM's CQRS pattern reference
- [CQRS Wiki - Projection](http://cqrs.wikidot.com/doc:projection) -- Original CQRS wiki on projections
- [AWS - Event Sourcing Pattern](https://docs.aws.amazon.com/prescriptive-guidance/latest/cloud-design-patterns/event-sourcing.html) -- AWS prescriptive guidance
- [Rico Fritzsche - CQRS and Event Sourcing](https://ricofritzsche.me/cqrs-event-sourcing-projections/) -- DDD with projections
- [Mia Platform - Event Sourcing and CQRS](https://mia-platform.eu/blog/understanding-event-sourcing-and-cqrs-pattern/) -- Pattern overview
- [DataScript (GitHub)](https://github.com/tonsky/datascript) -- Immutable in-memory database with Datalog queries
- [Mark Holton - Markdown Rails Publishing](https://holtonma.github.io/posts/markdown-rails-publishing-system/) -- File-based content with cache-busting

---

## Raw Links

Every URL encountered during research, including those not fully explored:

```
https://learn.microsoft.com/en-us/azure/architecture/patterns/cqrs
https://www.kurrent.io/blog/live-projections-for-read-models-with-event-sourcing-and-cqrs
https://mia-platform.eu/blog/understanding-event-sourcing-and-cqrs-pattern/
https://ricofritzsche.me/cqrs-event-sourcing-projections/
https://event-driven.io/en/projections_and_read_models_in_event_driven_architecture/
https://domaincentric.net/blog/event-sourcing-projections
https://ibm-cloud-architecture.github.io/refarch-eda/patterns/cqrs/
http://cqrs.wikidot.com/doc:projection
https://www.baeldung.com/cqrs-event-sourcing-java
https://www.codemag.com/Article/2209071/Event-Sourcing-and-CQRS-with-Marten
https://www2.sqlite.org/fileio.html
https://www.sqlite.org/draft/fileio.html
https://holtonma.github.io/posts/markdown-rails-publishing-system/
https://sqlite.org/fasterthanfs.html
https://github.com/jkelin/cache-sqlite-lru-ttl
https://www.sqlite.org/whentouse.html
https://phiresky.github.io/blog/2020/sqlite-performance-tuning/
https://requests-cache.readthedocs.io/en/stable/user_guide/backends/sqlite.html
https://gist.github.com/ewaldbenes/e48b9b4c1d0e1cb7175dfdd868addd58
https://github.com/paulmillr/chokidar
https://medium.com/@muhammadtaifkhan/watch-file-system-using-nodejs-7d4f9f16ce02
https://medium.com/@ashusingh584/chokidar-11290855e2cb
https://github.com/emcrisostomo/fswatch
https://www.npmjs.com/package/chokidar
https://emcrisostomo.github.io/fswatch/doc/1.9.3/fswatch.html/Tutorial-Introduction-to-fswatch.html
https://emcrisostomo.github.io/fswatch/
https://github.com/William-Yeh/fswatch
https://deepwiki.com/obsidianmd/obsidian-help/2.3-filters-and-views
https://forum.obsidian.md/t/robust-sync-conflict-resolution/93544
https://deepwiki.com/obsidianmd/obsidian-help/2-bases-database-system
https://github.com/syncthing/syncthing/issues/8604
https://forum.obsidian.md/t/synchronization-conflicts-in-obsidian-folder/77080
https://retypeapp.github.io/obsidian/sync/troubleshoot/
https://forum.obsidian.md/t/bases-sync-support-smart-merging-of-changes-and-or-generate-conflict/103921
https://help.obsidian.md/sync/settings
https://forum.obsidian.md/t/option-to-let-user-manually-resolve-sync-conflicts/94468
https://www.whalesync.com/blog/how-to-export-notion-pages-to-markdown
https://github.com/looorent/notion-exporter
https://unito.io/blog/export-notion/
https://www.notion.com/help/export-your-content
https://noteforms.com/resources/notion-export
https://www.notionry.com/faq/how-to-export-databases-from-notion
https://github.com/igor-kupczynski/notion-exporter
https://www.thebricks.com/resources/how-to-export-notion-a-step-by-step-guide
https://github.com/dwarvesf/notion-export-markdown
https://mk-notes.io/
https://sqlite.org/c3ref/update_hook.html
https://sqlite.org/forum/info/d2586c18e7197c39c9a9ce7c6c411507c3d1e786a2c4889f996605b236fec1b7
https://sqlite-users.sqlite.narkive.com/dFo8AsmN/trigger-s-actions-and-callbacks
https://sqlite-users.sqlite.narkive.com/yZ59G5XD/db-change-notification-hooks-across-process-barriers
https://www.mail-archive.com/sqlite-users@mailinglists.sqlite.org/msg53058.html
https://sqlite-users.sqlite.narkive.com/aAqdg8Be/accessing-external-applications-from-within-sqlite-triggers
https://github.com/oven-sh/bun/issues/4175
https://sqlite.org/forum/info/524b9656ce3bb216813a775e0767aa6a98c006247b37fd219643cb64fc73d13c
https://sqlite.org/forum/forumpost/633cbeea52
https://github.com/pocketbase/pocketbase/discussions/5073
https://www.designgurus.io/course-play/grokking-the-advanced-system-design-interview/doc/vector-clocks-and-conflicting-data
https://www.mydistributed.systems/2022/02/eventual-consistency-part-2.html
https://medium.com/geekculture/all-things-clock-time-and-order-in-distributed-systems-logical-clocks-in-real-life-2-ad99aa64753
https://gist.github.com/alicarbonteq/e889e1358672914ba25a291ed4637c5f
https://github.com/braintree/curator/issues/38
http://sage.github.io/SData-2.0/pages/sync/0201/
https://www.waitingforcode.com/big-data-algorithms/conflict-resolution-distributed-applications-vector-clocks/read
https://courses.cs.washington.edu/courses/cse444/14sp/lectures/lecture25-keyvaluestores.pdf
http://guyharrison.squarespace.com/blog/2015/10/12/vector-clocks.html
https://www.ibm.com/docs/en/ahte/4.3.0?topic=ts-resolving-bidirectional-sync-file-conflicts-1
https://gohugo.io/
https://strapi.io/blog/guide-to-using-hugo-site-generator
https://www.jekyllpad.com/blog/hugo-static-site-generator
https://gohugo.io/content-management/
https://kinsta.com/blog/hugo-static-site/
https://www.sanity.io/hugo-cms
https://en.wikipedia.org/wiki/Hugo_(software)
https://bookdown.org/yihui/blogdown/static-sites.html
https://docs.github.com/en/contributing/writing-for-github-docs/using-yaml-frontmatter
https://github.com/jlevy/frontmatter-format
https://assemble.io/docs/YAML-front-matter.html
https://metacpan.org/pod/Text::FrontMatter::YAML
https://github.com/redhat-developer/vscode-yaml/issues/207
https://github.com/spatie/yaml-front-matter
https://gohugo.io/content-management/front-matter/
https://help.obsidian.md/Advanced+topics/YAML+front+matter
https://docs.syncthing.net/users/syncing.html
https://pypi.org/project/hashfs/
https://www.richard-towers.com/2020/06/06/content-addressable-storage-postgres.html
https://www.cs.princeton.edu/courses/archive/fall19/cos316/lectures/07-file-systems-2.pdf
https://www.bartoszsypytkowski.com/conflict-free-database-over-virtual-file-system/
https://github.com/dgilland/hashfs
https://www.usenix.org/legacyurl/opportunistic-use-content-addressable-storage-distributed-file-systems
https://hal.science/hal-02559031v1/file/content-addressable-storage-preprint.pdf
https://en.wikipedia.org/wiki/Content-addressable_storage
https://www.ibm.com/support/pages/blocks-files-and-content-addressable-storage
https://contentlayer.dev/
https://github.com/contentlayerdev/contentlayer
https://dub.co/blog/content-collections
https://www.maxwellweru.com/blog/2024/03/replacing-contentlayer-with-markdownlayer
https://sqlite.org/wal.html
https://sqlite.org/c3ref/wal_hook.html
https://blog.pecar.me/sqlite-wal/
https://sqldocs.org/sqlite-database/sqlite-write-ahead-logging/
https://dev.to/lefebvre/speed-up-sqlite-with-write-ahead-logging-wal-do
https://fly.io/blog/wal-mode-in-litefs/
https://blog.sqlite.ai/journal-modes-in-sqlite
https://mohit-bhalla.medium.com/understanding-wal-mode-in-sqlite-boosting-performance-in-sql-crud-operations-for-ios-5a8bd8be93d2
https://litestream.io/
https://litestream.io/how-it-works/
https://news.ycombinator.com/item?id=25872887
https://github.com/benbjohnson/litestream
https://kentcdodds.com/blog/i-migrated-from-a-postgres-cluster-to-distributed-sqlite-with-litefs
https://fly.io/docs/litefs/how-it-works/
https://github.com/superfly/litefs
https://fly.io/blog/litestream-revamped/
https://fly.io/blog/introducing-litefs/
https://en.wikipedia.org/wiki/Atomicity_(database_systems)
https://www.usenix.org/system/files/conference/fast15/fast15-paper-verma.pdf
https://dev.to/martinhaeusler/towards-atomic-file-modifications-2a9n
https://queue.acm.org/detail.cfm?id=2801719
https://tech-champion.com/data-science/stop-silent-data-loss-checksum-atomic-writes-temp-file-patterns/
https://github.com/Calvin-L/crash-safe-io
https://www.fsl.cs.sunysb.edu/docs/amino-tr/amino.pdf
https://danluu.com/file-consistency/
https://jamesbornholt.com/papers/ferrite-asplos16.pdf
https://linuxvox.com/blog/atomic-writing-to-file-on-linux/
https://modelcontextprotocol.io/examples
https://www.pulsemcp.com/servers/modelcontextprotocol-sqlite
https://docs.sqlitecloud.io/docs/mcp-server
https://lobehub.com/mcp/simonholm-sqlite-mcp-server
https://github.com/sqlitecloud/sqlitecloud-mcp-server
https://www.npmjs.com/package/@berthojoris/mcp-sqlite-server
https://medium.com/towards-agi/how-to-step-and-use-sqlite-mcp-server-c87ac20f913e
https://www.w3resource.com/sqlite/snippets/sqlite-anthropics-mcp.php
https://glama.ai/mcp/servers/@modelcontextprotocol/sqlite
https://github.com/jparkerweb/mcp-sqlite
https://www.sanity.io/content-lake
https://www.sanity.io/docs/content-lake/groq-introduction
https://www.sanity.io/docs/content-lake/groq-feature-support-by-context
https://www.sanity.io/docs/content-lake/how-queries-work
https://www.rwit.io/blog/sanity-groq-vs-traditional-cms-apis
https://github.com/sanity-io/GROQ
https://www.sanity.io/docs/how-queries-work
https://www.sanity.io/docs/content-lake/custom-groq-functions
https://www.sanity.io/learn/course/content-driven-web-application-foundations/writing-groq-queries
https://www.sanity.io/docs/content-lake
https://github.com/npm/write-file-atomic
https://www.npmjs.com/package/write-file-atomic
https://nodejs.org/api/fs.html
https://www.npmjs.com/package/atomic-write
https://thelinuxcode.com/nodejs-file-system-in-practice-a-production-grade-guide-for-2026/
https://github.com/raszi/node-tmp
https://discuss.logseq.com/t/database-version-too-drastic-choice/20346
https://discuss.logseq.com/t/infos-on-logseq-database-version/17584
https://discuss.logseq.com/t/logseq-og-markdown-vs-logseq-db-sqlite/34608
https://github.com/logseq/docs/blob/master/db-version-changes.md
https://discuss.logseq.com/t/questions-about-the-upcoming-database-version/27108
https://github.com/logseq/docs/blob/master/db-version.md
https://www.solanky.dev/p/logseq-migration-journey-challenges-delays-and-hopes
https://discuss.logseq.com/t/logseq-db-unofficial-faq/32508
https://discuss.logseq.com/t/data-structures-for-bridging-logseq-md-to-logseq-db/34851
https://preslav.me/2025/10/13/how-to-install-logseq-db-version-on-your-computer-sqlite/
https://discuss.logseq.com/t/why-the-database-version-and-how-its-going/26744
https://deepwiki.com/logseq/logseq
https://github.com/open-cli-tools/chokidar-cli
https://github.com/eklingen/watch-debounced
https://www.npmjs.com/package/chokidar-cli
https://www.npmjs.com/package/chokidar-debounced
https://github.com/paulmillr/chokidar/issues/888
https://www.npmjs.com/package/@bscotch/debounce-watch
https://www.npmjs.com/package/@eklingen/watch-debounced
https://forum.obsidian.md/t/mysql-to-obsidian-bases-import-your-database-tables-as-structured-notes/104466
https://forum.obsidian.md/t/sync-metadata-properties-with-external-sql-or-nosql-database/102419
https://www.obsidianstats.com/tags/database
https://forum.obsidian.md/t/adding-sqlite-database-integration-to-an-obsidian-plugin/88272
https://deepwiki.com/obsidianmd/obsidian-help/5-bases-database-system
https://www.obsidianstats.com/plugins/sqlite-db
https://github.com/stfrigerio/sqliteDB
https://github.com/windily-cloud/obsidian-sqlite3
https://help.obsidian.md/bases
https://git-scm.com/book/en/v2/Customizing-Git-Git-Hooks
https://pre-commit.com/
https://git-scm.com/docs/githooks
https://www.atlassian.com/git/tutorials/git-hooks
https://scottwillsey.com/git-pre-commit/
https://markus.oberlehner.net/blog/lint-only-files-with-changes-on-pre-commit
https://github.com/pre-commit/pre-commit-hooks
https://github.com/pre-commit/pre-commit/issues/532
https://githooks.com/
https://github.com/simon-weber/Instant-SQLite-Audit-Trail
https://www.b4x.com/android/forum/threads/sqlite-triggers-creating-audit-trails-for-dummies.96218/
https://til.simonwillison.net/sqlite/json-audit-log
https://medium.com/@dgramaciotti/creating-audit-tables-with-sqlite-and-sql-triggers-751f8e13cf73
https://simonwillison.net/2023/Apr/15/sqlite-history/
https://til.simonwillison.net/sqlite/track-timestamped-changes-to-a-table
https://www.sqlitetutorial.net/sqlite-trigger/
https://campsoftware.com/blog/index_files/Xojo-Xanadu-SQLite-Audit-Log-using-Triggers.php
https://turso.tech/blog/introducing-change-data-capture-in-turso-sqlite-rewrite
https://github.com/decaporg/decap-cms
https://decapcms.org/docs/widgets/markdown/
https://decapcms.org/docs/intro/
https://decapcms.org/
https://blog.logrocket.com/9-best-git-based-cms-platforms/
https://staticmania.com/blog/decap-cms-review
https://keystatic.com/
https://github.com/Thinkmill/keystatic
https://keystatic.com/docs/content-organisation
https://github.com/payloadcms/payload/discussions/2459
https://github.com/facebook/docusaurus/discussions/5552
https://dasroot.net/posts/2026/03/automating-technical-documentation-with-markdown-and-ci-cd/
https://docusaurus.io/docs/markdown-features
https://hackmamba.io/technical-documentation/top-5-open-source-documentation-development-platforms-of-2024/
https://quarto.org/docs/output-formats/docusaurus.html
https://mdxjs.com/
https://cursa.app/en/page/building-read-models-with-projections-and-materialized-views
https://medium.com/event-driven-utopia/understanding-materialized-views-bb18206f1782
https://codeopinion.com/speeding-up-queries-with-materialized-views/
https://docs.aws.amazon.com/prescriptive-guidance/latest/cloud-design-patterns/event-sourcing.html
https://risingwave.com/blog/materialized-view-pros-and-cons-explained/
https://medium.com/event-driven-utopia/understanding-materialized-views-part-2-ae957d40a403
https://medium.com/event-driven-utopia/querying-microservices-with-the-cqrs-and-materialized-view-pattern-bdb8b17f95d1
https://learn.microsoft.com/en-us/azure/architecture/patterns/materialized-view
https://strapi.io/blog/flat-file-cms-guide-when-to-choose-file-based-systems
https://github.com/ahadb/flat-file-cms
https://www.ionos.com/digitalguide/hosting/cms/flat-file-cms-the-alternative-to-wordpress-etc/
https://statamic.com/flat-file-cms
https://getgrav.org/
https://github.com/rockstarcode/MarkDB
https://github.com/typemill/typemill
https://typemill.net/
https://medevel.com/18-flat-file-cms-for-enterprise/
https://github.com/trivialsoftware/spiderworks
https://docs.astro.build/en/guides/cms/keystatic/
https://armno.in.th/blog/exploring-keystatic/
https://medium.com/@hugo-humbert/an-in-depth-look-at-keystatic-revolutionizing-content-management-for-developers-8a8f2cdb3ef4
https://char.com/blog/choosing-a-cms/
https://cosmicthemes.com/docs/keystatic/
https://makerkit.dev/docs/next-supabase-turbo/content/keystatic
https://marketplace.visualstudio.com/items?itemName=foam.foam-vscode
https://github.com/foambubble/foam
https://foambubble.github.io/foam/user/features/wikilinks.html
https://foamnotes.com/
https://pocketbase.io/docs/
https://github.com/pocketbase/pocketbase
https://betterstack.com/community/guides/database-platforms/pocketbase-backend/
https://www.w3resource.com/sqlite/snippets/build-dynamic-apps-with-sqlite-pocketbase.php
https://deepwiki.com/pocketbase/pocketbase
https://docs.strapi.io/cms/configurations/database
https://github.com/strapi/strapi
https://strapi.io/
https://docs.strapi.io/cms/data-management/export
https://crdt.tech/implementations
https://www.iankduncan.com/engineering/2025-11-27-crdt-dictionary/
https://github.com/yjs/yjs
https://en.wikipedia.org/wiki/Conflict-free_replicated_data_type
https://www.cerbos.dev/blog/crdts-and-collaborative-playground
https://rxdb.info/crdt.html
https://news.ycombinator.com/item?id=46087022
https://github.com/alangibson/awesome-crdt
https://stack.convex.dev/automerge-and-convex
https://electric-sql.com/blog/2023/09/20/introducing-electricsql-v0.6
https://news.ycombinator.com/item?id=37584049
https://github.com/electric-sql/postgres-to-sqlite-sync-example
https://blog.logrocket.com/using-electricsql-build-local-first-app/
https://electric-sql.com/blog/2024/05/14/electricsql-postgres-client-support
https://github.com/electric-sql/electric
https://legacy.electric-sql.com/docs/reference
https://www.powersync.com/blog/introducing-powersync-v1-0-postgres-sqlite-sync-layer
https://github.com/tonsky/datascript
https://svndco/obsidian-excel-sync
```
