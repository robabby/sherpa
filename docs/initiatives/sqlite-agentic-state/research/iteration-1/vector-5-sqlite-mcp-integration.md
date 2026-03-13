# SQLite + MCP Integration Patterns

**Research iteration:** 2
**Date:** 2026-03-12
**Focus:** How to expose SQLite-backed agentic state through MCP tools and resources with ACID guarantees and concurrent multi-agent access

---

## Key Discoveries

### 1. Existing SQLite MCP Servers: The Landscape

The ecosystem has produced dozens of SQLite MCP servers, ranging from Anthropic's minimal reference implementation to feature-rich community projects. None were designed for the multi-agent coordination use case Sherpa needs, but their design patterns are instructive.

**Anthropic's Official Reference Implementation** (Python, archived in `modelcontextprotocol/servers-archived`):
- Exposes 6 tools: `read_query`, `write_query`, `create_table`, `list_tables`, `describe_table`, `append_insight` ([source](https://github.com/modelcontextprotocol/servers-archived/tree/main/src/sqlite))
- Opens a new `sqlite3.connect()` per query with `closing()` context manager -- no persistent connection, no WAL mode, no busy_timeout
- No transaction support -- each `_execute_query()` auto-commits via `conn.commit()` for writes
- No concurrent access handling whatsoever -- designed as a single-user demo
- Exposes one Resource: `memo://insights` (in-memory business insights memo, not database-backed)
- Has a known SQL injection vulnerability (uses string interpolation for `PRAGMA table_info({table_name})`)
- **Lesson:** The official reference is a pedagogical demo, not a production pattern. Do not model Sherpa's architecture on it.

**mcp-sqlite-tools** (`spences10/mcp-sqlite-tools`, TypeScript/Node.js):
- 19 tools including explicit transaction management: `begin_transaction`, `commit_transaction`, `rollback_transaction` with savepoint nesting ([GitHub](https://github.com/spences10/mcp-sqlite-tools))
- Separates tools by risk level: Safe (auto-approvable: `execute_read_query`, `list_tables`, `describe_table`, `database_info`, `export_schema`, `backup_database`) vs. Destructive (require approval: `execute_write_query`, `bulk_insert`, `drop_table`)
- Connection pooling with health monitoring, idle timeouts, and stale transaction cleanup
- Input validation via Valibot
- **Lesson:** Transaction tools as first-class MCP operations are viable. The safe/destructive separation maps directly to MCP's `readOnlyHint`/`destructiveHint` annotations.

**mcp-sqlite** (`jparkerweb/mcp-sqlite`, JavaScript/Node.js):
- 8 tools: `db_info`, `list_tables`, `get_table_schema`, `create_record`, `read_records`, `update_records`, `delete_records`, `query` ([GitHub](https://github.com/jparkerweb/mcp-sqlite))
- Uses typed CRUD tool names rather than generic SQL execution
- No documented transaction support or concurrent access handling
- **Lesson:** Typed CRUD tools (`create_record`, `read_records`, etc.) are more discoverable to LLMs than generic `execute_sql` tools.

**sqlite-mcp-server** (deprecated, replaced by `db-mcp`):
- Had 73 tools including FTS5 search, JSONB support, vector search, transaction safety, SpatiaLite integration ([GitHub](https://github.com/neverinfamous/sqlite-mcp-server))
- Successor `db-mcp` has 125+ tools, TypeScript, MCP 2025-11-25 compatible, supports stdio/SSE/HTTP transports
- **Lesson:** Tool count inflation (73-125) demonstrates the danger of exposing every SQLite feature as a separate tool. Workato recommends 5-8 tools per server; 15+ suggests the server should be split.

**sqlite-explorer-fastmcp-mcp-server** (`hannesrudolph/sqlite-explorer-fastmcp-mcp-server`, Python):
- Read-only by design -- only SELECT queries allowed ([GitHub](https://github.com/hannesrudolph/sqlite-explorer-fastmcp-mcp-server))
- Query validation and sanitization, parameter binding, row limit enforcement
- Built on FastMCP framework
- **Lesson:** A read-only SQLite MCP server is a valid pattern for the "Resources" side of a reads-via-resources, writes-via-tools architecture.

### 2. MCP Tool Design for Database Operations

**The Microsoft SQL MCP Server Pattern** (Data API Builder) is the most mature CRUD-over-MCP design found:
- Exactly 6 tools: `describe_entities`, `create_record`, `read_records`, `update_record`, `delete_record`, `execute_entity` ([Microsoft Learn](https://learn.microsoft.com/en-us/azure/data-api-builder/mcp/data-manipulation-language-tools))
- Agents never see raw database schema -- they work through a configuration-defined abstraction layer
- `describe_entities` returns field names, types, primary keys, allowed operations, and descriptions. This is the discovery tool that lets the LLM understand what it can do.
- `read_records` supports filtering, sorting, pagination, and field selection through structured parameters (not raw SQL)
- Results are cacheable per entity with configurable TTL
- No JOIN support in `read_records` -- complex queries go through `execute_entity` (stored procedures) or views
- Entity-level DML toggles: each entity can opt in/out of MCP exposure
- RBAC integration: tool availability is role-dependent. If a role only has read permission, write tools are hidden from `list_tools`.
- **Key insight:** `delete_record` can be globally disabled as a production safety constraint. This is configurable per-entity.
- **This is the closest pattern to what Sherpa should build.**

**Workato's Tool Design Guidelines:**
- 5-8 tools per MCP server is ideal; 8-12 is acceptable; 15+ means split the server ([Workato Docs](https://docs.workato.com/mcp/mcp-server-design.html))
- Each tool performs exactly one action -- no `manage_item(action, type, id, data)` multi-purpose tools ([Workato Tool Design](https://docs.workato.com/en/mcp/mcp-server-tool-design.html))
- Return only essential fields, not complete database rows. A row with 200 columns should return only the fields relevant to the workflow.
- Include `has_more` flags for pagination. Define explicit result caps.
- Tool naming: `search_products`, `create_jira_issue`, not `prod_lookup_v2` or `jira_create`

**MCP Tool Annotations for Database Operations:**
- `readOnlyHint: true` for SELECT/list/describe tools -- clients can auto-approve these ([MCP Spec - Tools](https://modelcontextprotocol.io/specification/2025-06-18/server/tools))
- `destructiveHint: true` for DELETE operations
- `idempotentHint: true` for idempotent writes (upserts). Critical: agents retry on timeout, so idempotent tools prevent duplicate inserts.
- `openWorldHint: false` for local SQLite (no external systems involved)
- These are advisory hints, not enforced, but they enable client-side safety UX like confirmation dialogs for destructive operations.

**Structured Output (outputSchema) for Database Tools:**
- MCP 2025-11-25 supports `outputSchema` on tools, returning typed `structuredContent` alongside human-readable `content` text ([MCP Spec - Tools](https://modelcontextprotocol.io/specification/2025-06-18/server/tools))
- For database tools, this means returning a JSON Schema-validated result object alongside a text summary. The LLM can parse the structured content; the human sees the text.
- Example: `read_records` returns `structuredContent: { records: [...], totalCount: 5, hasMore: false }` plus `content: [{ type: "text", text: "Found 5 initiatives matching status=in-progress" }]`

### 3. ACID Guarantees Through MCP

**The Fundamental Tension:** MCP tools are stateless RPC calls. Each `tools/call` is a self-contained request/response. There is no concept of "begin a transaction, make three tool calls, then commit" in the MCP protocol. The spec defines no multi-step transaction primitive.

**Pattern 1: Single-Statement Atomicity (Recommended for Sherpa)**
- Each tool call wraps its entire operation in a single SQLite transaction
- For read-modify-write: read the current state, compute, and write in one `BEGIN IMMEDIATE ... COMMIT` block within the tool handler
- Optimistic locking via version columns: `UPDATE ... WHERE id = ? AND version = ? RETURNING *` detects conflicts atomically
- This is how the official reference implementation works (each `_execute_query` auto-commits) and how Microsoft's DAB works
- **Trade-off:** No cross-tool transactions. An agent cannot atomically update two tables in two separate tool calls. But this is usually fine -- design tools that do atomic multi-table operations internally.

**Pattern 2: Transaction Tools (Available but Use with Caution)**
- `mcp-sqlite-tools` exposes `begin_transaction`, `commit_transaction`, `rollback_transaction` as MCP tools
- This gives agents explicit transaction control, but creates dangerous state: a `BEGIN` without a matching `COMMIT` holds a write lock indefinitely
- SQLite's single-writer constraint means a stuck transaction blocks all other agents
- Requires automatic cleanup of stale transactions (timeout-based), which `mcp-sqlite-tools` implements
- **Recommendation for Sherpa:** Do NOT expose transaction tools. The risk of an agent forgetting to commit (or crashing mid-transaction) is too high for a coordination system. Keep transactions internal to tool handlers.

**Pattern 3: MCP Tasks for Long-Running Operations**
- MCP 2025-11-25 Tasks (experimental) provide a "call-now, fetch-later" pattern: server returns a task handle, client polls for completion ([WorkOS blog](https://workos.com/blog/mcp-2025-11-25-spec-update))
- Task states: `working`, `input_required`, `completed`, `failed`, `cancelled`
- Could model multi-step operations as a single Task that internally manages its own transaction
- **Not yet production-viable:** Tasks are experimental, and client support is limited. Monitor for the 2026-06 spec release.

**Pattern 4: Idempotent Upserts**
- Design tools to be idempotent where possible. Use `INSERT OR REPLACE` or `INSERT ... ON CONFLICT DO UPDATE` so retried calls don't create duplicates.
- Mark such tools with `idempotentHint: true` in annotations
- The "54 MCP Tool Patterns" article identifies the Idempotent Operation pattern as essential for database tools because "agents retry on timeout" ([arcade.dev](https://www.arcade.dev/blog/mcp-tool-patterns))

### 4. MCP Resources for SQLite State

**The Resources-for-Reads, Tools-for-Writes Pattern:**
- MCP Resources are read-only by spec design. There is no `resources/write` method. All mutations go through Tools. ([MCP Resources Spec](https://modelcontextprotocol.io/specification/2025-06-18/server/resources))
- Resources are application-controlled (user/app decides what to load); Tools are model-controlled (LLM decides when to invoke) ([WorkOS MCP Features Guide](https://workos.com/blog/mcp-features-guide))
- For databases: expose table schemas, current state summaries, and configuration as Resources. Route all inserts/updates/deletes through Tools.
- **Token efficiency:** Resources avoid the overhead of tool descriptions in the context window, LLM reasoning about when to invoke, and tool result parsing. Static reference data (schemas, config) belongs in Resources. ([Layered.dev](https://layered.dev/mcp-resources-the-overlooked-primitive/))

**Resource URI Design for Sherpa's SQLite State:**
- Resource templates use RFC 6570 URI templates: `sherpa://initiatives/{slug}`, `sherpa://tasks/{task_id}`, `sherpa://agents/{agent_id}/state`
- The official reference uses `memo://insights` as a custom scheme. Other servers use `sqlite://<db>/<table>/schema`.
- Sherpa should define its own `sherpa://` URI scheme for domain-specific resources.
- `resources/subscribe` enables clients to watch for changes: client subscribes to `sherpa://initiatives/sqlite-agentic-state`, server emits `notifications/resources/updated` when the initiative state changes, client re-reads.

**Practical Limitation: Host Support for Resources is Poor**
- The Layered.dev article documents that "Resources require application UX to be useful. Someone has to build the interface for users to browse and select resources." ([Layered.dev](https://layered.dev/mcp-resources-the-overlooked-primitive/))
- Claude Desktop and Claude Code have documented gaps where `resources/read` is not properly called and dynamic resource templates remain broken ([MCP Discussion #391](https://github.com/orgs/modelcontextprotocol/discussions/391))
- **Implication for Sherpa:** Don't depend on Resources as the primary data access path. Implement Resources for schema/context, but ensure all state is also accessible through Tools for maximum client compatibility.

**State Machine Resources (Experimental Pattern):**
- The Layered.dev article proposes "using Resources as storage for state machines in multi-turn agent workflows" -- state lives at a Resource URI like `workflow://current-state`, updated by tools, readable by subscription
- This depends on subscription support (`resources/subscribe`), which most hosts don't reliably implement
- **For Sherpa:** Consider exposing `sherpa://coordination/state` as a Resource that reflects the current coordination state (active agents, pending tasks, lock status). Tools mutate this state; Resources expose it for read.

### 5. The MCP Spec on Stateful Connections and Transactions

**MCP is Stateful Today, Moving Toward Stateless:**
- Current spec: "Stateful connections" -- client and server maintain mutual awareness through persistent JSON-RPC 2.0 channels ([MCP Spec](https://modelcontextprotocol.io/specification/2025-06-18))
- 2026 Roadmap: Moving transport toward stateless to enable horizontal scaling. "Agentic applications should be stateful, but the protocol itself doesn't need to be." Sessions moving to the data model layer with cookie-like mechanisms. ([2026 MCP Roadmap](http://blog.modelcontextprotocol.io/posts/2026-mcp-roadmap/))
- Streamable HTTP transport replacing SSE. No new transports; existing one enhanced for stateless operation. ([Transport Future blog](http://blog.modelcontextprotocol.io/posts/2025-12-19-mcp-transport-future/))

**No Transaction Primitives in the Spec:**
- The MCP spec defines no transaction semantics, no session-level locks, no multi-call atomicity guarantees
- The spec says nothing about what happens when multiple clients connect to the same server or modify the same resources -- "this is entirely left to implementation"
- **Implication:** Sherpa must implement all coordination and transaction logic server-side. The protocol provides no help.

**No Multi-Client Semantics:**
- MCP is fundamentally a 1:1 protocol (one client to one server). The spec does not address multi-client scenarios.
- If two Claude Code instances connect to the same Sherpa MCP server, the server must manage their interactions entirely on its own.

### 6. Reference Architecture: MCP Servers Managing Mutable State

**Task Orchestrator** (`jpicklyk/task-orchestrator`, Kotlin/SQLite):
- 13 MCP tools for hierarchical work item management with dependency tracking ([GitHub](https://github.com/jpicklyk/task-orchestrator))
- SQLite + Exposed ORM with Flyway migrations for schema versioning
- Clean architecture: Domain -> Application -> Infrastructure -> Interface
- WorkItems have a 4-state lifecycle: `queue` -> `work` -> `review` -> `terminal`, with `blocked` as a side state
- Gate-checked transitions: required "notes" (key-value metadata) must exist before progression is allowed
- Dependencies as typed BLOCKS edges between items with `unblockAt` threshold
- `advance_item()` returns `unblockedItems` list, signaling downstream work
- `get_next_item()` provides priority-ranked next actionable item (pull-based queue)
- **Key design principle:** "Provides tools for clients; does not dictate workflow." The server enforces the state machine but doesn't prescribe agent behavior.
- **Most directly relevant to Sherpa's needs.** Similar domain (task/initiative state management), similar scale (multi-agent), same backing store (SQLite).

**MCP Task Manager** (`bsmi021/mcp-task-manager-server`, TypeScript/SQLite):
- 12 tools including `createProject`, `addTask`, `setTaskStatus`, `getNextTask`, `expandTask` ([GitHub](https://github.com/bsmi021/mcp-task-manager-server))
- 4-state lifecycle: `todo` -> `in-progress` -> `review` -> `done`
- `getNextTask` identifies actionable items by filtering for `todo` status where all dependencies are `done`, ordered by priority then creation date
- Pull-based: "The strategic workflow logic resides within the client"
- No documented concurrent access handling

**MCP Agent Mail** (`Dicklesworthstone/mcp_agent_mail`, Python/FastMCP):
- Dual persistence: Git for human-readable audit trails, SQLite+FTS5 for fast indexing/queries ([GitHub](https://github.com/Dicklesworthstone/mcp_agent_mail))
- Advisory file leases with TTL (not hard locks): `file_reservation_paths(project_key, agent_name, ["src/**"], ttl_seconds=3600, exclusive=true)`
- Pre-commit guard blocks commits violating active reservations
- Messages as GFM markdown with thread IDs for conversation grouping
- Agents coordinate asynchronously through intent-signaling, not central locking
- FTS5 full-text search with BM25 scoring, `subject:foo` syntax

**Memory MCP with SQLite WAL** (dev.to article by daichikudo):
- Replaced JSONL-based official Memory MCP with SQLite-backed version to solve concurrent Claude Code session problems ([dev.to](https://dev.to/daichikudo/fixing-claude-codes-concurrent-session-problem-implementing-memory-mcp-with-sqlite-wal-mode-o7k))
- Schema: `entities(name TEXT PRIMARY KEY, entity_type TEXT)`, `observations(entity_name, content)`, `relations(from_entity, to_entity, relation_type)`
- WAL mode + 5000ms busy_timeout + batch transactions for atomic multi-entity operations
- **Validates the pattern:** SQLite WAL mode with busy_timeout works for concurrent MCP server access from multiple AI sessions.

### 7. Schema Design for MCP-Exposed SQLite

**Principles from the Research:**

1. **Use ULIDs, not auto-increment** for primary keys. Auto-increment concentrates inserts on the same B-tree page, creating page-level contention. ULIDs distribute inserts across pages. (From Sherpa's existing research: [optimistic-concurrency-patterns.md](./optimistic-concurrency-patterns.md))

2. **Version columns on all mutable rows.** `version INTEGER NOT NULL DEFAULT 1`. Atomic CAS: `UPDATE ... SET version = version + 1 WHERE id = ? AND version = ? RETURNING *`. (From Sherpa's existing research)

3. **Partition state by agent** where possible. Each agent gets its own rows (e.g., `agent_id` column) to minimize page-level contention.

4. **Return only essential fields** from MCP tools. A table with 20 columns should return the 5-6 fields the agent needs for its current decision. (Workato guidelines)

5. **Include metadata for AI reasoning.** Microsoft's `describe_entities` returns not just schema but also allowed operations and field descriptions. This helps the LLM generate correct tool calls without trial and error.

6. **Status enums as CHECK constraints.** Enforce valid state transitions at the database level, not just the application level. `CHECK(status IN ('pending', 'approved', 'in-progress', 'completed'))`.

7. **Timestamps on every row.** `created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))`, `updated_at TEXT`. Both ISO 8601. Enables `lastModified` in MCP Resource annotations.

8. **Foreign keys ON.** SQLite disables foreign keys by default. `PRAGMA foreign_keys = ON` per connection.

**Schema Pattern for Sherpa Initiative State:**

```sql
CREATE TABLE initiatives (
    id TEXT PRIMARY KEY,           -- ULID
    slug TEXT UNIQUE NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending'
        CHECK(status IN ('pending','approved','in-progress','integrated','declined','archived')),
    title TEXT NOT NULL,
    type TEXT,
    risk TEXT CHECK(risk IN ('additive','evolutionary','structural')),
    version INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
    updated_at TEXT
);

CREATE TABLE tasks (
    id TEXT PRIMARY KEY,           -- ULID
    initiative_id TEXT NOT NULL REFERENCES initiatives(id),
    title TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'todo'
        CHECK(status IN ('todo','in-progress','review','done','blocked')),
    priority TEXT DEFAULT 'medium'
        CHECK(priority IN ('high','medium','low')),
    assigned_agent TEXT,
    version INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
    updated_at TEXT
);

CREATE TABLE task_dependencies (
    from_task_id TEXT NOT NULL REFERENCES tasks(id),
    to_task_id TEXT NOT NULL REFERENCES tasks(id),
    PRIMARY KEY (from_task_id, to_task_id)
);

CREATE TABLE agent_state (
    agent_id TEXT PRIMARY KEY,
    current_task_id TEXT REFERENCES tasks(id),
    status TEXT NOT NULL DEFAULT 'idle'
        CHECK(status IN ('idle','working','blocked','offline')),
    last_heartbeat TEXT,
    version INTEGER NOT NULL DEFAULT 1
);
```

### 8. Concrete Tool Surface for Sherpa's MCP Server

Based on all research, a recommended tool surface for Sherpa's SQLite-backed MCP server:

**Discovery (readOnlyHint: true):**
- `describe_state` -- Returns available entity types, their fields, and allowed operations (like Microsoft's `describe_entities`)
- `list_initiatives` -- List initiatives with filtering by status, pagination
- `list_tasks` -- List tasks with filtering by initiative, status, agent, priority
- `get_initiative` -- Get a single initiative by slug or ID
- `get_task` -- Get a single task by ID, including dependencies

**Mutation (idempotentHint varies):**
- `update_initiative_status` -- Transition an initiative's status with optimistic locking (version check)
- `claim_task` -- Atomically assign a task to the calling agent (CAS on assigned_agent + version)
- `update_task_status` -- Transition a task's status with dependency validation and optimistic locking
- `record_agent_heartbeat` -- Update agent's last_heartbeat (idempotent)

**Coordination:**
- `get_next_task` -- Priority-ranked next actionable task for a given agent (like task-orchestrator's pattern)

**That's 9 tools.** Within the 5-12 range recommended by Workato. Each performs exactly one action.

---

## Sources

| Source | Description |
|--------|-------------|
| [modelcontextprotocol/servers-archived SQLite](https://github.com/modelcontextprotocol/servers-archived/tree/main/src/sqlite) | Anthropic's official reference SQLite MCP server (archived) |
| [spences10/mcp-sqlite-tools](https://github.com/spences10/mcp-sqlite-tools) | 19-tool SQLite MCP server with transaction management and risk-level separation |
| [jparkerweb/mcp-sqlite](https://github.com/jparkerweb/mcp-sqlite) | 8-tool typed CRUD SQLite MCP server |
| [neverinfamous/sqlite-mcp-server](https://github.com/neverinfamous/sqlite-mcp-server) | Deprecated 73-tool SQLite MCP server, replaced by db-mcp |
| [hannesrudolph/sqlite-explorer-fastmcp-mcp-server](https://github.com/hannesrudolph/sqlite-explorer-fastmcp-mcp-server) | Read-only SQLite MCP server with query validation |
| [Microsoft SQL MCP Server DML Tools](https://learn.microsoft.com/en-us/azure/data-api-builder/mcp/data-manipulation-language-tools) | 6-tool CRUD pattern with RBAC, entity abstraction, per-tool toggles |
| [Microsoft SQL MCP Server Overview](https://learn.microsoft.com/en-us/azure/data-api-builder/mcp/overview) | SQL MCP Server architecture and configuration |
| [jpicklyk/task-orchestrator](https://github.com/jpicklyk/task-orchestrator) | 13-tool SQLite-backed task orchestrator with dependency tracking and gate-checked transitions |
| [bsmi021/mcp-task-manager-server](https://github.com/bsmi021/mcp-task-manager-server) | 12-tool SQLite task manager with pull-based queue |
| [Dicklesworthstone/mcp_agent_mail](https://github.com/Dicklesworthstone/mcp_agent_mail) | Multi-agent coordination via SQLite+Git with advisory file leases and FTS5 |
| [MCP Spec - Resources](https://modelcontextprotocol.io/specification/2025-06-18/server/resources) | Official MCP Resources specification |
| [MCP Spec - Tools](https://modelcontextprotocol.io/specification/2025-06-18/server/tools) | Official MCP Tools specification with annotations |
| [MCP Spec - Overview](https://modelcontextprotocol.io/specification/2025-06-18) | MCP 2025-06-18 specification overview |
| [2026 MCP Roadmap](http://blog.modelcontextprotocol.io/posts/2026-mcp-roadmap/) | Transport evolution toward stateless, session model changes |
| [MCP Transport Future](http://blog.modelcontextprotocol.io/posts/2025-12-19-mcp-transport-future/) | Streamable HTTP, stateless scaling |
| [MCP 2025-11-25 Anniversary Post](http://blog.modelcontextprotocol.io/posts/2025-11-25-first-mcp-anniversary/) | Tasks, elicitation, structured output additions |
| [WorkOS MCP 2025-11-25 Analysis](https://workos.com/blog/mcp-2025-11-25-spec-update) | Tasks primitive analysis, async operation patterns |
| [Workato MCP Server Design](https://docs.workato.com/mcp/mcp-server-design.html) | Tool count guidance, server scope recommendations |
| [Workato MCP Tool Design](https://docs.workato.com/en/mcp/mcp-server-tool-design.html) | Tool naming, granularity, input/output schema design |
| [Layered.dev - MCP Resources Overlooked](https://layered.dev/mcp-resources-the-overlooked-primitive/) | Why Resources are underused, Resources for state machines |
| [WorkOS MCP Features Guide](https://workos.com/blog/mcp-features-guide) | Tools vs Resources vs Prompts comparison |
| [54 MCP Tool Patterns](https://www.arcade.dev/blog/mcp-tool-patterns) | Idempotent Operation pattern, Context Injection, Async Job |
| [MCP Tool Annotations Introduction](https://blog.marcnuri.com/mcp-tool-annotations-introduction) | readOnlyHint, destructiveHint, idempotentHint, openWorldHint |
| [dev.to - Memory MCP with SQLite WAL](https://dev.to/daichikudo/fixing-claude-codes-concurrent-session-problem-implementing-memory-mcp-with-sqlite-wal-mode-o7k) | Concurrent Claude Code sessions solved with SQLite WAL |
| [SkyPilot - Abusing SQLite Concurrency](https://blog.skypilot.co/abusing-sqlite-to-handle-concurrency/) | 1000+ process SQLite contention analysis |
| [Google MCP Toolbox for Databases](https://googleapis.github.io/genai-toolbox/getting-started/introduction/) | Multi-database MCP server with connection pooling and YAML configuration |
| [Google MCP Toolbox GitHub](https://github.com/googleapis/genai-toolbox) | Open source MCP server for databases |
| [MCP Enterprise Readiness](https://subramanya.ai/2025/12/01/mcp-enterprise-readiness-how-the-2025-11-25-spec-closes-the-production-gap/) | Enterprise production gap analysis |
| [SQLite WAL Mode](https://sqlite.org/wal.html) | Official WAL documentation |
| [SQLite BEGIN CONCURRENT](https://www.sqlite.org/src/doc/begin-concurrent/doc/begin_concurrent.md) | Experimental concurrent writers |
| [SQLite Atomic Commit](https://sqlite.org/atomiccommit.html) | ACID internals |

---

## Raw Links (All URLs Encountered)

```
https://github.com/modelcontextprotocol/servers-archived/tree/main/src/sqlite
https://github.com/modelcontextprotocol/servers/blob/main/src/sqlite/src/mcp_server_sqlite/server.py
https://github.com/modelcontextprotocol/servers/tree/HEAD/src/sqlite
https://github.com/spences10/mcp-sqlite-tools
https://github.com/jparkerweb/mcp-sqlite
https://github.com/neverinfamous/sqlite-mcp-server
https://github.com/hannesrudolph/sqlite-explorer-fastmcp-mcp-server
https://github.com/panasenco/mcp-sqlite
https://github.com/santos-404/mcp-server.sqlite
https://github.com/johnnyoshika/mcp-server-sqlite-npx
https://github.com/prayanks/mcp-sqlite-server
https://github.com/rvarun11/sqlite-mcp
https://github.com/sqlitecloud/sqlitecloud-mcp-server
https://github.com/marekkucak/sqlite-anet-mcp
https://github.com/cnosuke/mcp-sqlite
https://github.com/executeautomation/mcp-database-server
https://github.com/jpicklyk/task-orchestrator
https://github.com/bsmi021/mcp-task-manager-server
https://github.com/Dicklesworthstone/mcp_agent_mail
https://github.com/EchoingVesper/mcp-task-orchestrator
https://github.com/FreePeak/db-mcp-server
https://github.com/lastmile-ai/mcp-agent
https://github.com/punkpeye/awesome-mcp-servers
https://github.com/modelcontextprotocol/servers
https://github.com/modelcontextprotocol/modelcontextprotocol
https://github.com/googleapis/genai-toolbox
https://github.com/Azure/data-api-builder
https://github.com/tursodatabase/libsql
https://github.com/tursodatabase/turso
https://github.com/litements/litequeue
https://github.com/egeominotti/bunqueue
https://github.com/spring-ai-community/mcp-annotations
https://github.com/awslabs/mcp/issues/671
https://github.com/modelcontextprotocol/servers/issues/2988
https://github.com/modelcontextprotocol/servers/issues/3402
https://github.com/Janix-ai/mcp-validator
https://github.com/ibm/mcp-context-forge/issues/2612
https://github.com/orgs/modelcontextprotocol/discussions/391
https://github.com/google-gemini/gemini-cli/issues/19655
https://modelcontextprotocol.io/specification/2025-06-18
https://modelcontextprotocol.io/specification/2025-06-18/server/resources
https://modelcontextprotocol.io/specification/2025-06-18/server/tools
https://modelcontextprotocol.io/specification/2025-06-18/architecture
https://modelcontextprotocol.io/specification/2025-11-25
https://modelcontextprotocol.io/specification/2025-11-25/server/tools
https://modelcontextprotocol.io/specification/2025-11-25/client/elicitation
https://modelcontextprotocol.io/specification/2025-11-25/changelog
https://modelcontextprotocol.io/docs/learn/architecture
https://modelcontextprotocol.io/examples
https://modelcontextprotocol.io/legacy/concepts/tools
https://modelcontextprotocol.io/development/roadmap
http://blog.modelcontextprotocol.io/posts/2026-mcp-roadmap/
http://blog.modelcontextprotocol.io/posts/2025-12-19-mcp-transport-future/
http://blog.modelcontextprotocol.io/posts/2025-11-25-first-mcp-anniversary/
http://blog.modelcontextprotocol.io/
https://modelcontextprotocol.info/docs/best-practices/
https://modelcontextprotocol.info/docs/concepts/resources/
https://modelcontextprotocol.info/specification/
https://modelcontextprotocol.info/blog/mcp-next-version-update/
https://www.npmjs.com/package/@berthojoris/mcp-sqlite-server
https://www.npmjs.com/package/better-sqlite3
https://pypi.org/project/mcp-server-sqlite/
https://learn.microsoft.com/en-us/azure/data-api-builder/mcp/overview
https://learn.microsoft.com/en-us/azure/data-api-builder/mcp/data-manipulation-language-tools
https://learn.microsoft.com/en-us/azure/data-api-builder/mcp/
https://learn.microsoft.com/en-us/sql/mcp/
https://learn.microsoft.com/en-us/azure/developer/azure-mcp-server/tools/azure-database-postgresql
https://learn.microsoft.com/en-us/azure/developer/ai/intro-agents-mcp
https://docs.workato.com/mcp/mcp-server-design.html
https://docs.workato.com/en/mcp/mcp-server-tool-design.html
https://docs.workato.com/mcp.html
https://workos.com/blog/mcp-2025-11-25-spec-update
https://workos.com/blog/mcp-features-guide
https://layered.dev/mcp-resources-the-overlooked-primitive/
https://www.arcade.dev/blog/mcp-tool-patterns
https://blog.marcnuri.com/mcp-tool-annotations-introduction
https://dev.to/daichikudo/fixing-claude-codes-concurrent-session-problem-implementing-memory-mcp-with-sqlite-wal-mode-o7k
https://dev.to/nickytonline/quick-fix-my-mcp-tools-were-showing-as-write-tools-in-chatgpt-dev-mode-3id9
https://blog.skypilot.co/abusing-sqlite-to-handle-concurrency/
https://thenewstack.io/15-best-practices-for-building-mcp-servers-in-production/
https://subramanya.ai/2025/12/01/mcp-enterprise-readiness-how-the-2025-11-25-spec-closes-the-production-gap/
https://medium.com/@dave-patten/mcps-next-phase-inside-the-november-2025-specification-49f298502b03
https://medium.com/@laurentkubaski/mcp-resources-explained-and-how-they-differ-from-mcp-tools-096f9d15f767
https://medium.com/@jamesaspinwall/mcp-tools-resources-and-client-server-interaction-explained-0b6be41287c5
https://medium.com/@anil.jain.baba/agentic-mcp-and-a2a-architecture-a-comprehensive-guide-0ddf4359e152
https://felix-pappe.medium.com/breaking-isolation-a-practical-guide-to-building-an-mcp-server-with-sqlite-68c800a25d42
https://medium.com/ai-insights-cobet/model-context-protocol-mcp-in-agentic-ai-architecture-and-industrial-applications-7e18c67e2aa7
https://bytebridge.medium.com/considerations-for-operating-mcp-infrastructure-5ca6cf44a777
https://www.pulsemcp.com/servers/modelcontextprotocol-sqlite
https://www.pulsemcp.com/servers/genai-toolbox
https://www.pulsemcp.com/servers?q=sqlite
https://mcpservers.org/servers/panasenco/mcp-sqlite
https://mcpservers.org/servers/jpicklyk/task-orchestrator
https://lobehub.com/mcp/simonholm-sqlite-mcp-server
https://lobehub.com/mcp/panasenco-mcp-sqlite
https://lobehub.com/mcp/jpicklyk-task-orchestrator
https://lobehub.com/mcp/timbotgpt-sqlite-mcp
https://glama.ai/mcp/servers/@modelcontextprotocol/sqlite
https://mcp.so/server/sqlite
https://www.mcpdrops.com/mcp/sqlite
https://www.mcpfinder.com/model-context-protocols/sqlite/6df3a2ef-ae81-4783-bfd5-a586cfcb792c
https://hub.docker.com/mcp/server/task-orchestrator/overview
https://mcpmarket.com/server/json-schema-validator
https://www.mcpevals.io/blog/what_are_mcp_resources
https://mcpcn.com/en/blog/transport-future/
https://www.stainless.com/mcp/resources
https://zuplo.com/blog/mcp-resources
https://googleapis.github.io/genai-toolbox/getting-started/introduction/
https://google.github.io/adk-docs/tools/google-cloud/mcp-toolbox-for-databases/
https://cloud.google.com/blog/products/ai-machine-learning/mcp-toolbox-for-databases-now-supports-model-context-protocol
https://cloud.google.com/blog/products/ai-machine-learning/new-mcp-integrations-to-google-cloud-databases
https://cloud.google.com/blog/products/databases/managed-mcp-servers-for-google-cloud-databases
https://cloud.google.com/blog/topics/developers-practitioners/announcing-the-mcp-toolbox-java-sdk
https://aws.amazon.com/blogs/database/supercharging-aws-database-development-with-aws-mcp-servers/
https://aws.amazon.com/blogs/opensource/shaping-the-future-of-mcp-aws-commitment-and-vision/
https://blogs.oracle.com/database/introducing-mcp-server-for-oracle-database
https://blogs.cisco.com/developer/whats-new-in-mcp-elicitation-structured-content-and-oauth-enhancements
https://openliberty.io/blog/2025/10/23/mcp-standalone-blog.html
https://docs.spring.io/spring-ai/reference/api/mcp/mcp-annotations-server.html
https://docs.quarkiverse.io/quarkus-mcp-server/dev/reference-annotations.html
https://www.jetbrains.com/help/youtrack/devportal/custom-ai-tools.html
https://developers.openai.com/apps-sdk/plan/tools/
https://mcpcat.io/guides/adding-custom-tools-mcp-server-python/
https://obot.ai/resources/learning-center/mcp-tools/
https://n8n.io/workflows/3632-build-your-own-sqlite-mcp-server/
https://marketplace.visualstudio.com/items?itemName=Mrbeandev.mcp-sqlite-tool
https://www.w3resource.com/sqlite/snippets/sqlite-anthropics-mcp.php
https://skywork.ai/skypage/en/anthropic-sqlite-mcp-server-ai-engineers/1977590535559376896
https://skywork.ai/skypage/en/sqlite-mcp-server-guide-ai-engineers/1977629649939787776
https://skywork.ai/skypage/en/sqlite-mcp-servers-ai-engineers/1978341710253170688
https://skywork.ai/skypage/en/mastering-model-context-ai-engineer-guide/1978723848614957056
https://atlan.com/know/mcp-server-implementation-guide/
https://zeo.org/resources/blog/mcp-server-architecture-state-management-security-tool-orchestration
https://www.kubiya.ai/blog/model-context-protocol-mcp-architecture-components-and-workflow
https://codilime.com/blog/model-context-protocol-explained/
https://www.elastic.co/search-labs/blog/mcp-current-state
https://strategizeyourcareer.com/p/whats-new-in-mcp-in-2026
https://www.getknit.dev/blog/the-future-of-mcp-roadmap-enhancements-and-whats-next
https://www.ajeetraina.com/one-year-of-model-context-protocol-from-experiment-to-industry-standard/
https://portkey.ai/blog/mcp-primitives-the-mental-model-behind-the-protocol/
https://www.apideck.com/blog/a-primer-on-the-model-context-protocol
https://glama.ai/blog/2025-07-10-exploring-mcps-hidden-primitives-prompts-resources-sampling-and-roots
https://www.dailydoseofds.com/model-context-protocol-crash-course-part-4/
https://www.mikaeels.com/blog/mcp-core-concepts-explained
https://codesignal.com/learn/courses/developing-and-integrating-a-mcp-server-in-python/lessons/exploring-and-exposing-mcp-server-capabilities-tools-resources-and-prompts
https://www.getdrio.com/blog/mcp-architecture-explained
https://www.speakeasy.com/mcp/using-mcp/ai-agents/architecture-patterns
https://bridgeapp.ai/resources/blog/a-complete-guide-to-model-context-protocol-mcp-architecture-integration-and-best-practices
https://www.fluid.ai/blog/googles-new-mcp-toolbox-makes-it-real
https://agnost.ai/blog/google-mcp-toolbox-databases-technical-guide/
https://www.verdent.ai/guides/model-context-protocol-mcp-guide
https://hyprmcp.com/blog/what-is-mcp/
https://www.getdbt.com/blog/mcp-servers
https://developers.redhat.com/articles/2025/08/12/how-build-simple-agentic-ai-server-mcp
https://www.byteplus.com/en/topic/542256
https://sqlyard.com/2026/01/26/unlocking-database-intelligence-with-sql-mcp-server/
https://sqlreitse.com/2026/02/24/sql-azure-sql-and-mcp-the-introduction/
https://deepwiki.com/Azure/data-api-builder/2.7-mcp-protocol-support
https://deepwiki.com/jayminwest/overstory/6.5-concurrency-and-wal-mode
https://changelog.keboola.com/sse-transport-deprecation-migration-to-streamable-http/
https://turso.tech/blog/beyond-the-single-writer-limitation-with-tursos-concurrent-writes
https://turso.tech/blog/microsecond-level-sql-query-latency-with-libsql-local-replicas-5e4ae19b628b
https://turso.tech/blog/local-first-cloud-connected-sqlite-with-turso-embedded-replicas
https://docs.turso.tech/libsql
https://kentcdodds.com/blog/i-migrated-from-a-postgres-cluster-to-distributed-sqlite-with-litefs
https://sqlite.org/wal.html
https://sqlite.org/lockingv3.html
https://sqlite.org/atomiccommit.html
https://sqlite.org/transactional.html
https://www.sqlite.org/src/doc/begin-concurrent/doc/begin_concurrent.md
https://sqlite.org/hctree/doc/begin-concurrent/doc/begin_concurrent.md
https://sqlite.org/forum/info/b6a1bc7136c2df94f82a229f99e5e5b3aed3c4679698be6076059614537e0d44
https://sqlite.org/forum/info/b4e8b29ae409cd198652c6b7e70b53b702f269e67e1d2573d627feeba37bbf85
https://sqlite.org/forum/info/40cd965ddb76f146
https://github.com/sqlite/sqlite/blob/9077e4652fd0691f45463e9a5c46560856e9be36/doc/begin_concurrent.md
https://jasongorman.uk/writing/sqlite-background-job-system/
https://tenthousandmeters.com/blog/sqlite-concurrent-writes-and-database-is-locked-errors/
https://berthub.eu/articles/posts/a-brief-post-on-sqlite3-database-locked-despite-timeout/
https://wchargin.com/better-sqlite3/performance.html
https://www.sql-easy.com/learn/sqlite-transaction-2/
https://sqliteviewer.com/blog/atomic-commit-in-sqlite-database/
https://www.stainless.com/sdk-api-best-practices/what-is-idempotent-in-rest-api-definition-and-examples
https://algomaster.io/learn/system-design/idempotency
https://blog.algomaster.io/p/idempotency-in-distributed-systems
https://microservices.io/patterns/communication-style/idempotent-consumer.html
https://oneuptime.com/blog/post/2026-01-24-idempotency-in-microservices/view
https://zuplo.com/learning-center/implementing-idempotency-keys-in-rest-apis-a-complete-guide
https://www.databricks.com/glossary/acid-transactions
https://www.gigaspaces.com/blog/acid-distributed-transactions
https://www.yugabyte.com/acid/acid-transactions/
https://en.wikipedia.org/wiki/ACID
https://calmops.com/backend/database-transaction-management-acid-isolation/
https://dzone.com/articles/model-context-protocol-mcp-guide-architecture-uses-implementation
https://pkg.go.dev/github.com/bpowers/go-claudecode/mcp
https://github.com/skypilot-org/skypilot/pull/1509
https://news.ycombinator.com/item?id=45781298
https://github.com/TryGhost/node-sqlite3/issues/9
https://github.com/JoshuaWise/better-sqlite3/issues/32
https://jellyfin.org/posts/SQLite-locking/
https://news.ycombinator.com/item?id=27482402
https://sqlite.org/forum/info/9038ab7da7c7596bd04f34ea863f906bc8a6accf52017ca79afe6e800083604e
https://dev.to/hexshift/build-a-shared-nothing-distributed-queue-with-sqlite-and-python-3p1
https://ajay-arunachalam08.medium.com/anthropics-claude-agents-simple-demo-of-building-powerful-ai-multi-agents-using-claude-model-3945fb7d13f2
https://apify.com/jaroslavhejlek/validate-dataset-with-json-schema/api/mcp
https://github.com/modelcontextprotocol/servers/issues/3074
https://medium.com/towards-agi/how-to-step-and-use-sqlite-mcp-server-c87ac20f913e
https://www.devopsdigest.com/workato-enterprise-model-context-protocol-introduced
https://www.workato.com/the-connector/what-is-mcp/
https://www.workato.com/the-connector/workato-mcp/
https://www.workato.com/the-connector/enterprise-mcp-guide/
https://dev.to/klement_gunndu/build-your-first-mcp-server-in-python-3-patterns-you-need-1i53
```

---

## Implications for Sherpa's MCP-SQLite Integration

1. **Don't expose raw SQL.** The official reference implementation's `read_query`/`write_query` pattern (arbitrary SQL strings) is a security liability and poor UX for LLMs. Follow Microsoft's DAB pattern: typed CRUD tools with structured parameters. The LLM should never construct SQL.

2. **Keep the tool surface small.** 9 tools (5 read, 3 write, 1 coordination) covers Sherpa's needs. Resist the temptation to add tools for every SQLite feature. If it's not in the initiative/task/agent domain, it doesn't belong.

3. **ACID lives inside tool handlers, not across tool calls.** Each tool handler wraps its operation in `BEGIN IMMEDIATE ... COMMIT`. No exposed transaction tools. Optimistic locking via version columns handles concurrent agents.

4. **Resources complement but don't replace Tools.** Expose initiative schemas and coordination state as MCP Resources for context. But since Resource support in hosts is unreliable, every piece of state must also be accessible via Tools.

5. **Use MCP's `outputSchema` for typed results.** Define JSON Schema for each tool's structured output. This enables programmatic consumption by the Studio UI while keeping text summaries for LLM context.

6. **Tool annotations are cheap safety wins.** Mark read tools with `readOnlyHint: true` (auto-approvable in Claude Code). Mark deletes with `destructiveHint: true`. Mark idempotent writes with `idempotentHint: true`.

7. **The `describe_state` tool is critical.** Microsoft's `describe_entities` pattern -- returning available operations, field types, and descriptions -- lets the LLM self-discover the API surface. This eliminates trial-and-error tool calls.

8. **`get_next_task` is the coordination primitive.** Both task-orchestrator and mcp-task-manager-server implement this pattern: a tool that returns the highest-priority unblocked task for a given agent, respecting dependencies. This is the pull-based work queue Sherpa needs.

9. **MCP's stateless trajectory is fine for Sherpa.** The 2026 roadmap's push toward stateless transport aligns with Sherpa's architecture. Each tool call is self-contained; state lives in SQLite, not in MCP session state.

10. **Watch the MCP Tasks primitive.** Once Tasks stabilizes (potentially 2026-06 spec), long-running operations like "plan all tasks for an initiative" could become a single async Task with progress tracking, rather than a series of synchronous tool calls.

---

## Open Questions

1. **Resource subscription vs polling.** Should Sherpa rely on `resources/subscribe` for real-time state updates to the Studio UI, or poll via tool calls? Given that subscription support is unreliable in current hosts, polling may be more robust, but subscriptions would be more elegant for the Studio UI which Sherpa controls.

2. **Tool result size limits.** When `list_initiatives` returns 50+ initiatives, what's the right pagination strategy? Cursor-based? Offset-based? How do LLMs handle pagination tokens in practice?

3. **Agent identity through MCP.** MCP has no built-in agent identity concept. How does `claim_task` know which agent is calling? Options: (a) pass `agent_id` as a tool parameter, (b) derive from MCP client metadata, (c) use a session-level context. Option (a) is simplest but relies on the agent honestly identifying itself.

4. **Structured content adoption.** The `outputSchema`/`structuredContent` features (2025-06-18+) are supported by the MCP SDK Sherpa already depends on (`@modelcontextprotocol/sdk@1.27.1`). How well do current Claude Code versions consume structured tool results vs. text-only results?

5. **MCP Resources for file-based state.** Sherpa currently stores initiative state in Markdown files (`docs/initiatives/*/proposal.md`). Could MCP Resources serve as a bridge -- exposing file-based state as read-only Resources while SQLite handles the authoritative state? This would smooth the migration path.

6. **Tool versioning.** When the schema or behavior of a tool changes (e.g., `update_initiative_status` gains a new parameter), how should the MCP server handle backward compatibility? MCP has `notifications/tools/list_changed` but no versioning mechanism for individual tools.

7. **Batch operations.** Should Sherpa expose a `batch_update_tasks` tool for bulk status changes (e.g., marking all subtasks as done)? The trade-off: batch tools reduce round-trips but are harder to make idempotent and create larger lock windows.
