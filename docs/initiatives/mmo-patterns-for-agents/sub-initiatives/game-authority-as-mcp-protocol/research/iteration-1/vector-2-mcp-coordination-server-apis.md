# Existing MCP Coordination Servers — Detailed Tool API Analysis

**Date:** 2026-03-12
**Research type:** Deep-dive tool API analysis
**Scope:** Exact tool definitions, parameter schemas, locking semantics, error handling, and agent identity patterns across all known MCP coordination servers

---

## 1. MCP Agent Mail

**Repo:** https://github.com/Dicklesworthstone/mcp_agent_mail
**Author:** Dicklesworthstone (same author as Beads CLI)
**Architecture:** SQLite (async SQLModel/SQLAlchemy) + Git archive (dual persistence)
**Transport:** Streamable HTTP + stdio
**Language:** Python (FastMCP)

### 1.1 Complete Tool Inventory

MCP Agent Mail exposes tools organized into clusters. Tool registration uses `_filtered_tool_decorator` with cluster membership and capability tags, allowing profile-based filtering (full, core, minimal, messaging, custom).

#### Setup Cluster
| Tool | Parameters | Description |
|------|-----------|-------------|
| `health_check` | `format?: str` | Readiness probe. Returns `{status, environment, http_host, http_port, database_url}` |
| `ensure_project` | `human_key: str, identity_mode?: str, format?: str` | Idempotent project creation. `human_key` MUST be absolute directory path. Computes stable slug. Creates DB row + on-disk archive dirs (`messages/`, `agents/`, `file_reservations/`) |
| `install_precommit_guard` | `project_key: str, code_repo_path: str, format?: str` | Installs git pre-commit hook that enforces file reservations. Requires `WORKTREES_ENABLED=1` |
| `uninstall_precommit_guard` | `code_repo_path: str, format?: str` | Removes the pre-commit guard hook |
| `archive_project` | `project_key: str` | Soft-archive a project |
| `unarchive_project` | `project_key: str` | Restore archived project |
| `hard_delete_project` | `project_key: str` | Permanent deletion |

#### Identity Cluster
| Tool | Parameters | Description |
|------|-----------|-------------|
| `register_agent` | `project_key: str, program: str, model: str, name?: str, task_description?: str, attachments_policy?: str ("auto"), format?: str` | Create/update agent identity. Names are auto-generated adjective+noun combos (e.g., "GreenCastle"). Persists `profile.json` to Git |
| `create_agent_identity` | `project_key: str, program: str, model: str, name_hint?: str, task_description?: str, attachments_policy?: str, format?: str` | Always creates NEW identity (never updates). Fresh unique name |
| `deregister_agent` | `project_key: str, agent_name: str, registration_token?: str` | Remove from active roster. Verifies token with `hmac.compare_digest` |
| `retire_agent` | `project_key: str, agent_name: str, registration_token?: str` | Soft-delete. Stops accepting messages, preserves history |
| `unretire_agent` | `project_key: str, agent_name: str, registration_token?: str` | Restore retired agent |
| `hard_delete_agent` | `project_key: str, agent_name: str` | Permanent deletion |
| `whois` | `project_key: str, agent_name: str, include_recent_commits?: bool (True), commit_limit?: int (5), format?: str` | Agent profile + recent git commits |

#### Messaging Cluster
| Tool | Parameters | Description |
|------|-----------|-------------|
| `send_message` | `project_key: str, sender_name: str, to: list[str], subject: str, body_md: str, cc?: list[str], bcc?: list[str], attachment_paths?: list[str], convert_images?: bool, importance?: str ("normal"), ack_required?: bool, thread_id?: str, broadcast?: bool, topic?: str, auto_contact_if_blocked?: bool, sender_token?: str, format?: str` | Full-featured message send. Stores in DB + writes canonical `.md` file + mailbox copies to Git |
| `fetch_inbox` | `project_key: str, agent_name: str, limit?: int (20), urgent_only?: bool, include_bodies?: bool, since_ts?: str (ISO-8601), topic?: str, format?: str` | Read-only inbox fetch. No mutation of read/ack state |
| `acknowledge_message` | `project_key: str, agent_name: str, message_id: int, format?: str` | Mark message as read+acknowledged. Idempotent |

#### Search Cluster
| Tool | Parameters | Description |
|------|-----------|-------------|
| `search_messages` | `project_key: str, ...` | FTS5 full-text search with LIKE fallback |
| `summarize_thread` | `project_key: str, ...` | LLM-powered thread summarization |

#### Contact Cluster
| Tool | Parameters | Description |
|------|-----------|-------------|
| `request_contact` | `project_key: str, from_agent: str, to_agent: str, to_project?: str, reason?: str, ttl_seconds?: int (7d), register_if_missing?: bool, program?: str, model?: str, task_description?: str, format?: str` | Request approval to message another agent. Creates pending `AgentLink` |
| `respond_contact` | `project_key: str, to_agent: str, from_agent: str, accept: bool, ttl_seconds?: int (30d), from_project?: str, format?: str` | Accept/deny contact request. TTL auto-corrected if < 60s |
| `list_contacts` | `project_key: str, agent_name: str, format?: str` | List contact links for an agent |
| `set_contact_policy` | ... | Configure contact acceptance policy |

#### File Reservations Cluster (THE KEY TOOLS)
| Tool | Parameters | Description |
|------|-----------|-------------|
| `file_reservation_paths` | `project_key: str, agent_name: str, paths: list[str], ttl_seconds?: int (3600), exclusive?: bool (True), reason?: str, format?: str` | **Advisory** file reservation (lease). Glob patterns supported. Returns `{granted: [{id, path_pattern, exclusive, reason, expires_ts}], conflicts: [{path, holders: [...]}]}` |
| `release_file_reservations` | `project_key: str, agent_name: str, paths?: list[str], file_reservation_ids?: list[int], format?: str` | Release active reservations. Omit both `paths` and `file_reservation_ids` to release all. Returns `{released: int, released_at: iso8601}` |
| `renew_file_reservations` | `project_key: str, agent_name: str, extend_seconds?: int (1800), paths?: list[str], file_reservation_ids?: list[int], format?: str` | Extend expiry without reissuing. Returns `{renewed: int, file_reservations: [{id, path_pattern, old_expires_ts, new_expires_ts}]}` |

#### Build Slots Cluster (Optional)
| Tool | Parameters | Description |
|------|-----------|-------------|
| `acquire_build_slot` | `project_key: str, agent_name: str, slot: str, ttl_seconds?: int (3600), exclusive?: bool (True), format?: str` | Advisory build slot lease. Writes JSON lease files to archive. Returns conflicts if exclusive slot held by another agent+branch |
| `renew_build_slot` | `project_key: str, agent_name: str, ...` | Extend build slot lease |
| `release_build_slot` | `project_key: str, agent_name: str, ...` | Release build slot |

#### Macro Cluster
| Tool | Parameters | Description |
|------|-----------|-------------|
| `macro_start_session` | `human_key: str, program: str, model: str, task_description?: str, agent_name?: str, file_reservation_paths?: list[str], file_reservation_reason?: str, file_reservation_ttl_seconds?: int (3600), inbox_limit?: int (10), format?: str` | Combined: ensure_project + register_agent + optional file_reservation + fetch_inbox |
| `macro_file_reservation_cycle` | `project_key: str, agent_name: str, paths: list[str], ttl_seconds?: int (3600), exclusive?: bool (True), reason?: str, auto_release?: bool, format?: str` | Combined: reserve → work → release |
| `macro_contact_handshake` | `project_key: str, requester?: str, target?: str, reason?: str, ttl_seconds?: int (7d), auto_accept?: bool, welcome_subject?: str, welcome_body?: str, to_project?: str, agent_name?: str, to_agent?: str, register_if_missing?: bool, ...` | Combined: request_contact + respond_contact |

#### Product Cluster (Optional, cross-project)
| Tool | Parameters | Description |
|------|-----------|-------------|
| `ensure_product` | ... | Create/ensure a product entity |
| `products_link` | `project_key: str, ...` | Link project to product |
| `search_messages_product` | ... | Cross-project message search |
| `fetch_inbox_product` | ... | Cross-project inbox |
| `summarize_thread_product` | ... | Cross-project thread summary |

### 1.2 File Reservation Database Schema

```
FileReservation (file_reservations table):
  id: Optional[int]           -- primary key
  project_id: int             -- FK → projects.id
  agent_id: int               -- FK → agents.id
  path_pattern: str           -- max 512 chars (glob or exact path)
  exclusive: bool             -- default True
  reason: str                 -- max 512 chars, default ""
  created_ts: datetime        -- UTC
  expires_ts: datetime        -- UTC, required
  released_ts: Optional[datetime] -- null while active

Indexes:
  (project_id, released_ts, expires_ts)
  (project_id, agent_id, released_ts)
```

### 1.3 Pre-commit Guard (Enforcement Mechanism)

Source: `src/mcp_agent_mail/guard.py`

The guard is a Python script injected as a git pre-commit hook via `install_precommit_guard`. It implements three-phase validation:

1. **Pattern Loading**: Reads `file_reservations/*.json` from the project archive. Filters for exclusive, non-expired reservations NOT held by the current agent.

2. **Union PathSpec Building**: Compiles all matching patterns into a single `pathspec.PathSpec` object (with `fnmatch` fallback). Virtual namespaces (`tool://`, `resource://`, `service://`) are excluded.

3. **Conflict Detection**: Each staged file (from `git diff --cached --name-only -z` with rename detection `-M`) is tested against the compiled patterns.

**Identity**: Requires `AGENT_NAME` environment variable.

**Gating**: Only active when `WORKTREES_ENABLED` or `GIT_IDENTITY_ENABLED` is truthy (`"1"`, `"true"`, `"t"`, `"yes"`, `"y"`).

**Modes** (`AGENT_MAIL_GUARD_MODE`):
- `"block"` (default): Exits 1 on conflict, preventing commit
- `"warn"` / `"advisory"` / `"adv"`: Exits 0, allows commit despite conflicts

**Emergency bypass**: `AGENT_MAIL_BYPASS=1` disables all checks.

**Error output**: `"Exclusive file_reservation conflicts detected\n- {path} matches {pattern} (holder: {agent})"` (max 10 shown).

### 1.4 Dual Persistence Model

**Git Archive (human-auditable):**
```
agents/<Name>/profile.json          -- agent registration
agents/<Name>/mailboxes/**          -- per-agent message copies
messages/YYYY/MM/{id}.md            -- canonical messages (markdown + frontmatter)
file_reservations/{sha1}.json       -- lease records
attachments/xx/{sha1}.webp          -- image assets
```

**SQLite (indexing + search):**
- FTS5 full-text search on message subject/body
- Lease expiry tracking and conflict detection
- Agent directory queries and thread aggregation
- Automatic LIKE fallback when FTS unavailable

### 1.5 Key Design Decisions

- **Advisory, not mandatory**: Reservations are signals, not hard locks. Agents query before editing and respect leases. The pre-commit guard is the only enforcement point.
- **Symmetric glob matching**: `fnmatchcase(a,b) or fnmatchcase(b,a)` — both the held pattern and the new pattern are tested bidirectionally.
- **Agent identity via registration tokens**: `registration_token` (optional) enables ownership verification with constant-time HMAC comparison.
- **TTL floor**: Server enforces minimum 60s TTL (with warning for shorter values).
- **No heartbeat**: Reservations expire by TTL only. No active heartbeat or liveness checking.

---

## 2. mcp-beads-village

**Repo:** https://github.com/LNS2905/mcp-beads-village
**Author:** LNS2905
**Architecture:** Filesystem-based (`.beads/`, `.mail/`, `.reservations/` directories) + CLI backend (Beads Go or Beads Rust)
**Transport:** stdio (JSON-RPC)
**Language:** Python
**Default branch:** `master`

### 2.1 Complete Tool Inventory (27 tools)

Tools are registered in `beads_village/tools/__init__.py` as a `TOOLS` dictionary with explicit JSON Schema `inputSchema` and MCP tool annotations (`readOnlyHint`, `destructiveHint`, `idempotentHint`, `openWorldHint`).

#### Lifecycle Tools
| Tool | Input Schema | Description | Annotations |
|------|-------------|-------------|-------------|
| `init` | `{ws?: str, team?: str, role?: str, leader?: bool, start_tui?: bool}` req: [] | Join workspace. MUST call first. Initializes `.beads/`, `.mail/`, `.reservations/` dirs. Registers agent in team registry. Broadcasts join message. | idempotent, openWorld |
| `claim` | `{}` req: [] | Claim next ready task (highest priority). Role-based filtering if role set. Auto-syncs, marks `in_progress`. Updates agent registry current_task. | NOT idempotent, openWorld |
| `done` | `{id: str, msg?: str}` req: [id] | Close task. Auto-releases ALL reserved files. Syncs with git. Clears `current_task`. | idempotent, openWorld |

#### Issue Management Tools
| Tool | Input Schema | Description | Annotations |
|------|-------------|-------------|-------------|
| `add` | `{title: str, desc?: str, typ?: str ("task"\|"bug"\|"feature"\|"epic"\|"chore"), pri?: int (0-4), tags?: str[], deps?: str[], parent?: str}` req: [title] | Create issue. Tags drive role-based assignment. Priority: 0=critical, 4=backlog. | NOT idempotent, openWorld |
| `assign` | `{id: str, role: str, notify?: bool (true)}` req: [id, role] | Leader-only task assignment. Adds role tag, broadcasts notification. | idempotent, openWorld |
| `ls` | `{status?: str ("open"\|"closed"\|"in_progress"\|"ready"\|"all"), limit?: int (10), offset?: int (0)}` req: [] | List issues with pagination. `status="ready"` returns claimable tasks (no blockers). | readOnly, idempotent |
| `show` | `{id: str}` req: [id] | Full issue details. | readOnly, idempotent |

#### File Reservation Tools
| Tool | Input Schema | Description | Annotations |
|------|-------------|-------------|-------------|
| `reserve` | `{paths: str[], ttl?: int (600), reason?: str}` req: [paths] | Lock files for editing. Uses **atomic `O_CREAT\|O_EXCL`** file creation. Returns `{granted: [...], conflicts: [{path, holder, reason, expires}], expires?}` | NOT idempotent, NOT openWorld |
| `release` | `{paths?: str[]}` req: [] | Unlock files. Empty paths = release all. Only releases own reservations. | idempotent, NOT openWorld |
| `reservations` | `{}` req: [] | List all active file locks across all agents. | readOnly, idempotent |

#### Messaging Tools
| Tool | Input Schema | Description | Annotations |
|------|-------------|-------------|-------------|
| `msg` | `{subj: str, body?: str, to?: str ("all"), thread?: str, importance?: str ("normal"), global?: bool, cc?: str[], ack_required?: bool}` req: [subj] | Send message. `global=true` sends to all workspaces. Thread defaults to current issue ID. | NOT idempotent |
| `inbox` | `{n?: int (5), unread?: bool, global?: bool (true), thread?: str}` req: [] | Get messages. Auto-cleans messages older than 7 days. | readOnly, idempotent |

#### Maintenance Tools
| Tool | Input Schema | Description | Annotations |
|------|-------------|-------------|-------------|
| `cleanup` | `{days?: int (2)}` req: [] | Remove old closed issues. | destructive, idempotent |
| `doctor` | `{}` req: [] | Check/repair database health. Backend-specific (bd: `--fix`, br: `--repair`). | idempotent |
| `sync` | `{}` req: [] | Sync with git (pull/push). | idempotent |
| `status` | `{include_agents?: bool, include_bv?: bool}` req: [] | Workspace overview. Updates agent heartbeat on every call. | readOnly, idempotent |

#### Graph Analysis Tools (requires `bv` binary)
| Tool | Input Schema | Description |
|------|-------------|-------------|
| `bv_insights` | `{}` | PageRank, Betweenness centrality, keystones, bottlenecks, cycle detection |
| `bv_plan` | `{}` | Parallel execution tracks (Union-Find for independent streams) |
| `bv_priority` | `{limit?: int (5)}` | Weighted priority ranking: PageRank 30%, Betweenness 30%, BlockerRatio 20%, Staleness 10%, Priority 10% |
| `bv_diff` | `{since?: str, as_of?: str}` | Compare issue changes between git revisions |
| `village_tui` | `{}` | Launch dashboard TUI (Kanban, deps graph, insights) |

#### Beads Rust (br) Only Tools
| Tool | Input Schema | Description |
|------|-------------|-------------|
| `search` | `{query: str, status?: str, label?: str, limit?: int (20)}` req: [query] | Full-text search issues |
| `stale` | `{days?: int (30), status?: str}` | Find stale issues |
| `changelog` | `{since?: str, since_tag?: str}` | Generate changelog from closed issues |
| `graph` | `{issue?: str, compact?: bool, all?: bool}` | Visualize dependency graph |
| `defer` | `{ids: str[], until?: str}` req: [ids] | Schedule issues for later |
| `undefer` | `{ids: str[]}` req: [ids] | Make deferred issues ready again |

### 2.2 Atomic Locking Implementation

Source: `beads_village/tools/reservations.py`

The `try_atomic_reserve()` function uses a two-tier approach:

```python
# Tier 1: Attempt atomic creation (eliminates TOCTOU race)
fd = os.open(res_file, os.O_CREAT | os.O_EXCL | os.O_WRONLY)
# If FileExistsError → fall to Tier 2

# Tier 2: Read existing, check expiry/ownership, then replace
with open(res_file) as f:
    existing = json.load(f)
if datetime.fromisoformat(existing["expires"]) > now:
    if existing["agent"] != AGENT:
        return False, existing  # CONFLICT
# Otherwise: take over via temp file + os.replace() (atomic)
```

**Reservation file format** (stored as `.reservations/{path_hash}.json`):
```json
{
    "path": "src/api/routes.py",
    "agent": "agent-42",
    "reason": "issue-123",
    "created": "2026-03-12T10:00:00",
    "expires": "2026-03-12T10:10:00"
}
```

**Key properties:**
- Path hashing (SHA-based) for filename → one file per reserved path
- No glob support (exact paths only, unlike MCP Agent Mail)
- Default TTL: 600 seconds (10 minutes) — much shorter than Agent Mail's 3600s
- Expired reservations cleaned lazily (on `init()`, `reserve()`, `reservations()`)
- **No exclusivity flag** — all reservations are exclusive by default
- `done()` auto-releases all reservations for the completing agent

### 2.3 Crash Recovery

**Explicit recovery is minimal:**
- Reservations expire by TTL (default 10 min)
- `cleanup()` removes stale data
- `doctor()` runs backend-specific repair
- No orphaned task recovery — abandoned tasks remain assigned until manual intervention
- Agent registry tracks `last_seen` timestamps (30-minute active window)

### 2.4 Agent State Machine

The `state.py` module maintains per-agent session state:
```python
class S:
    role: str = ""
    team: str = ""
    issue: str = None      # current task ID
    current_task: str = None
    reserved_files: set = set()
    done: int = 0          # completed task count
    is_leader: bool = False
    start: datetime         # session start time
```

**The 1-task-per-session pattern**: After `done()`, the agent is told to restart its session. This is a soft convention, not enforced.

---

## 3. Multi-Agent Coordination MCP (AndrewDavidRivers)

**Repo:** https://github.com/AndrewDavidRivers/multi-agent-coordination-mcp
**Author:** AndrewDavidRivers
**Architecture:** SQLite (single file `db.sqlite`) + WebSocket for real-time updates
**Transport:** stdio + HTTP (uvicorn/Starlette)
**Language:** Python (FastMCP)

### 3.1 Complete Tool Inventory (14 tools)

| Tool | Signature | Description |
|------|-----------|-------------|
| `get_instructions` | `() -> str` | Returns full workflow documentation (>3000 chars). Every agent calls this first. |
| `create_project` | `(name: str, description: str) -> dict` | Create project. Unique name (typically dir name). Returns `{id, name, description, status, created_at, updated_at}` |
| `get_project` | `(name: str) -> dict` | Get project details by name |
| `create_task` | `(project_name: str, name: str, description: str, order: int = 0, dependencies: List[int] = None) -> dict` | Create task within project. Supports inter-task dependencies |
| `create_todo_item` | `(task_id: int, title: str, description: str = "", order: int = 0, dependencies: List[int] = None, files: List[str] = None) -> dict` | Create atomic work unit. `files` param declares which files will be modified |
| `get_next_todo_item` | `(project_name: str, agent_id: str) -> dict` | **Assignment algorithm**: Finds next pending todo with no incomplete deps AND no conflicting file locks. Orders by task.order_index, then todo.order_index |
| `update_todo_status` | `(todo_id: int, status: str, agent_id: str) -> dict` | Status: pending → in_progress → completed/cancelled. **Auto-locks files** on in_progress, **auto-unlocks** on completed/cancelled |
| `get_project_status` | `(project_name: str) -> dict` | Full project view with tasks, todos, files, completion percentages |
| `get_project_audit_trail` | `(project_name: str, limit: int = 50) -> dict` | Comprehensive audit events + completion stats + milestones |
| `get_project_completion_summary` | `(project_name: str) -> dict` | Completion stats with agent productivity metrics |
| `check_file_locks` | `(files: List[str]) -> dict` | Check lock status. Returns `{checked_files, locked_files: {path: {locked_by, locked_at}}, all_available: bool}` |
| `lock_files` | `(files: List[str], agent_id: str) -> dict` | Manual file locking. Fails if any file locked by another agent |
| `unlock_files` | `(files: List[str], agent_id: str) -> dict` | Manual unlock. Only own locks |
| `insert_todo_item` | `(task_id: int, title: str, description: str = "", after_todo_id: Optional[int] = None, dependencies: List[int] = None, files: List[str] = None) -> dict` | Insert todo at specific position (shifts subsequent items) |

### 3.2 File Locking Mechanism

**Fully automatic**, tied to todo item status transitions:

```
pending → in_progress:
    For each file in todo_files: INSERT OR REPLACE INTO file_locks

in_progress → completed/cancelled:
    For each file in todo_files: DELETE FROM file_locks WHERE locked_by = agent_id
```

**Lock contention in assignment** (`get_next_todo_item`):
```sql
AND NOT EXISTS (
    SELECT 1 FROM todo_files tf
    JOIN file_locks fl ON tf.file_path = fl.file_path
    WHERE tf.todo_id = t.id AND fl.locked_by != ?
)
```
This prevents assigning work that would conflict with currently-held locks.

**No TTL, no expiry**: Locks persist until the todo status changes. If an agent crashes, locks remain until manual intervention.

### 3.3 Database Schema

```sql
projects (id, name, description, status, created_at, updated_at)
tasks (id, project_id FK, name, description, order_index, status, created_at, updated_at)
task_dependencies (task_id FK, depends_on_task_id FK)
todo_items (id, task_id FK, title, description, order_index, status, assigned_agent, created_at, updated_at)
todo_dependencies (todo_id FK, depends_on_todo_id FK)
todo_files (todo_id FK, file_path)
file_locks (file_path PK, locked_by, locked_at)
audit_events (id, event_type, entity_type, entity_id, entity_name, old_status, new_status, agent_id, project_name, task_name, details JSON, created_at)
schema_version (id, version, applied_at)
```

### 3.4 Key Design Decisions

- **Agent identity is a simple string** (`agent_id`). No registration, no tokens, no verification.
- **No messaging system**: Agents coordinate through task assignments and file locks only. No inbox/outbox.
- **Real-time WebSocket**: Dashboard gets broadcast notifications on every project/task/todo change.
- **Comprehensive audit trail**: Every state change logged with full context. Enables post-hoc analysis.
- **Three-tier hierarchy**: Project → Task → TodoItem. Dependency resolution at both task and todo levels.
- **No crash recovery**: The biggest gap. Locks and in_progress assignments persist forever if agent dies.

---

## 4. Dead-Drop Teams

**Repo:** https://github.com/ai-janitor/dead-drop-teams
**Author:** ai-janitor
**Architecture:** SQLite (`~/.dead-drop/messages.db`) + filesystem (`.dead-drop/` project directory)
**Transport:** stdio
**Language:** Python (FastMCP)

### 4.1 Complete Tool Inventory (6 tools)

| Tool | Signature | Description |
|------|-----------|-------------|
| `register` | `(agent_name: str, role?: str, description?: str) -> str` | Register/re-register. Returns onboarding (PROTOCOL.md + role profile). Upsert on conflict. |
| `set_status` | `(agent_name: str, status: str) -> str` | Set human-readable status (e.g., "working on BUG-014"). Shows in `who()` |
| `send` | `(from_agent: str, to_agent: str, message: str, cc?: str) -> str` | Send message. **BLOCKS if sender has unread messages** (inbox-first discipline). Auto-CC to lead on all inter-agent messages. |
| `check_inbox` | `(agent_name: str) -> str` | Get unread messages, mark as read. Handles both direct and broadcast messages separately. |
| `who` | `() -> str` | List registered agents with last_seen, last_inbox_check, role, status |
| `get_history` | `(count: int) -> str` | Last N messages (for post-compaction context recovery) |

### 4.2 Key Design Patterns

- **Inbox-first discipline (server-enforced)**: `send()` checks for unread messages and returns `"BLOCKED: You have N unread message(s). Call check_inbox first."` This prevents message queue overflow.
- **Auto-CC to lead**: Every non-lead message is automatically CC'd to the lead agent. The lead has complete visibility.
- **Role-based hierarchy**: lead → researcher/coder/builder. Lead spawns ephemeral workers.
- **Filesystem as database**: `.dead-drop/tasks/<TASK-ID>/` with `task.md`, `status`, `assigned`, `result.md`. Agents navigate with `ls`/`cat`.
- **Code ownership zones**: `.dead-drop/CODE_OWNERS.md` defines which agent owns which files. Advisory, not enforced.
- **No file locking**: Uses code ownership zones as a social convention instead.
- **Post-compaction recovery**: `get_history(10)` to restore cross-agent state after context window reset.

---

## 5. SEP-1708: Client-Brokered Filesystem Access

**Issue:** https://github.com/modelcontextprotocol/specification/issues/1708
**Author:** Casey Boyle (@boylec)
**Status:** CLOSED (author lacks bandwidth to continue)
**Created:** 2025-10-23, Revised: 2025-11-02
**Type:** Standards Track (Protocol Extension)

### 5.1 Core Proposal

SEP-1708 proposes enabling remote MCP servers to access client-local filesystems through standard JSON-RPC methods. The client acts as a security gateway that brokers file operations on behalf of the server.

**Capability negotiation**: Client advertises `filesystemBrokering: true`. Server MUST verify during handshake.

**Operations defined**: `files/read`, `files/write`, `files/list`, `files/create`, `files/delete`, `files/rename`, `files/watch`, `files/unlock`

### 5.2 File Locking Mechanism

- **Automatic exclusive locks** during all file operations
- **Persistent locks** via `keepLocked: true` parameter with unique `lockId`
- **Explicit release** through `files/unlock` method
- **Automatic cleanup** on operation completion or connection disconnect
- **Conflict error**: `FILE_LOCKED` (-32100) for locked files

**Constraints**: 1MB default chunks, 60-second timeout, 3 retries with backoff.

### 5.3 Discussion Highlights

Key concerns raised in comments:

1. **Security (dend)**: "Biggest threat is malicious MCP servers having direct and non-revocable access to a user's file system." Boyle responded that the client enforces roots-scoped access boundaries.

2. **Cross-platform locking (commenter)**: `fcntl` is Unix-only. Windows needs `winfcntl`. Node.js has no cross-platform mandatory file locking. Third-party lockfile approaches (proper-lockfile, @bernierllc/file-lock) are incompatible across SDKs. **"OS-level locking mechanisms MUST be a requirement"** but mandatory locking doesn't exist uniformly across platforms.

3. **Network filesystem issues**: File locking over NFS/SMB is "notoriously unreliable."

4. **Filesystem is not a Resource**: Boyle argues the local filesystem should be a first-class citizen of the MCP host/client, not treated as an MCP Resource accessed through a local server.

### 5.4 Relevance to Sherpa

SEP-1708 is about client→server filesystem brokering for remote servers. It does NOT address server-side authority management between multiple agents. The locking discussion is about OS-level file locks to prevent data corruption during concurrent writes — a fundamentally different concern from Sherpa's authority management (which agent has permission to write to which resources).

**The gap remains**: MCP has no specification for multi-agent coordination, authority management, or resource ownership. All such coordination is application-level logic in individual servers.

---

## 6. Cross-Cutting Analysis

### 6.1 Tool Naming Conventions

| Server | Pattern | Examples |
|--------|---------|----------|
| MCP Agent Mail | `snake_case`, verb phrases | `file_reservation_paths`, `release_file_reservations`, `macro_start_session` |
| Beads Village | `single_word` or `snake_compound` | `init`, `claim`, `reserve`, `bv_insights` |
| Multi-Agent Coord | `snake_case`, CRUD-style | `create_project`, `get_next_todo_item`, `update_todo_status` |
| Dead-Drop Teams | `single_word` | `register`, `send`, `who` |

**Observation**: Simpler names (Beads Village, Dead-Drop) optimize for token efficiency. Agent Mail's verbose names optimize for discoverability. Multi-Agent Coord uses standard CRUD conventions.

### 6.2 Error Response Patterns

| Server | Error Pattern |
|--------|--------------|
| MCP Agent Mail | Structured `ToolExecutionError` with `error_type`, `message`, `recoverable: bool`, `data: dict`. Types: `EMPTY_PATHS`, `FILE_RESERVATION_CONFLICT` |
| Beads Village | JSON dict with `{error: str, hint: str}`. Hints are actionable instructions for the agent. |
| Multi-Agent Coord | JSON dict with `{error: str}`. No hints, no structured typing. |
| Dead-Drop Teams | Plain text error strings. `"BLOCKED: You have N unread..."` |

**Best practice emerging**: Beads Village's `{error, hint}` pattern is the most agent-friendly. Agent Mail's typed errors are the most machine-friendly.

### 6.3 Agent Identity Models

| Server | Identity Mechanism | Verification |
|--------|-------------------|-------------|
| MCP Agent Mail | Registered with `program`, `model`, `name` (adj+noun). `registration_token` for ownership. | HMAC token comparison for destructive ops |
| Beads Village | Global `AGENT` string (env-derived). Registered in team registry JSON. | None — trust the AGENT string |
| Multi-Agent Coord | `agent_id` string parameter on every call. | None — any caller can claim any identity |
| Dead-Drop Teams | `agent_name` string in DB. Role-based (lead/researcher/coder/builder). | None — upsert on name |

**Key gap for Sherpa**: None of these systems implement fencing tokens or verifiable authority credentials. Any agent can impersonate another by providing the same name string. MCP Agent Mail's registration_token is the closest to real verification, but it's optional.

### 6.4 What's Missing That Sherpa Needs

| Gap | Description | Which servers lack it |
|-----|-------------|----------------------|
| **Fencing tokens** | Verifiable proof that a lock/authority grant is still valid. Prevents stale-lock writes. | ALL |
| **Authority state machine** | Formal states (idle → requesting → granted → revoking → released) with transitions | ALL (Multi-Agent Coord has todo status FSM but not authority-specific) |
| **Heartbeat/liveness** | Active checking that the authority holder is still alive | ALL (Beads Village has `last_seen` but doesn't use it for lock revocation) |
| **Mandatory enforcement** | Server-side rejection of writes by unauthorized agents | ALL are advisory-only (Agent Mail's pre-commit guard is the closest) |
| **Hierarchical authority** | Directory-level authority that implies file-level authority | ALL |
| **Authority inheritance** | Task dispatch automatically grants file authority | Multi-Agent Coord auto-locks files on todo assignment, closest to this |
| **Conflict resolution protocol** | What happens when two agents need the same resource | ALL punt to "coordinate" or "wait for TTL" |
| **Authority audit trail** | Who held what authority when, for post-hoc analysis | Multi-Agent Coord has audit_events table; Agent Mail has git history |

---

## 7. Sources (Full URLs with Descriptions)

### Primary Repositories
- https://github.com/Dicklesworthstone/mcp_agent_mail — MCP Agent Mail: async coordination layer with advisory file reservations, messaging, and dual Git+SQLite persistence
- https://github.com/LNS2905/mcp-beads-village — Beads Village MCP: multi-agent task coordination with atomic file locking and 27 tools
- https://github.com/AndrewDavidRivers/multi-agent-coordination-mcp — Multi-Agent Coordination MCP: project/task/todo hierarchy with automatic file locking
- https://github.com/ai-janitor/dead-drop-teams — Dead-Drop Teams: SQLite message passing with role-based agents and auto-CC to lead

### MCP Specification
- https://github.com/modelcontextprotocol/specification/issues/1708 — SEP-1708: Client-Brokered Filesystem Access (CLOSED)

### Additional Coordination-Adjacent Servers
- https://github.com/ruvnet/ruflo — Ruflo: agent orchestration platform for multi-agent swarms
- https://github.com/oxgeneral/agentnet — AgentNet: agent-to-agent referral network with bilateral trust
- https://github.com/edgarriba/prolink — ProLink: agent-to-agent marketplace middleware
- https://github.com/juspay/neurolink — NeuroLink: multi-agent orchestration with HITL workflows
- https://github.com/1mcp/agent — Unified MCP server aggregating multiple servers
- https://github.com/askbudi/roundtable — Meta-MCP server unifying multiple AI assistants
- https://github.com/punkpeye/awesome-mcp-servers — Curated list of MCP servers
- https://github.com/Arpan-Roy-1993/Claude_MCP_Multi_Agent_Orchestration — Multi-agent orchestration example

### Source Files Read
- `src/mcp_agent_mail/app.py` — MCP Agent Mail tool definitions and registration
- `src/mcp_agent_mail/models.py` — SQLModel schemas (FileReservation, Message, Agent, etc.)
- `src/mcp_agent_mail/guard.py` — Pre-commit guard enforcement mechanism
- `beads_village/tools/__init__.py` — Beads Village complete TOOLS registry with JSON schemas
- `beads_village/tools/lifecycle.py` — init, claim, done implementations
- `beads_village/tools/reservations.py` — Atomic O_CREAT|O_EXCL file reservation
- `beads_village/tools/messaging.py` — Message send/receive
- `beads_village/tools/issues.py` — Issue CRUD tools
- `beads_village/tools/maintenance.py` — Status, cleanup, doctor, sync
- `beads_village/tools/bv_tools.py` — Graph analysis tools
- `beads_village/server.py` — Server registration and JSON-RPC handling
- `AndrewDavidRivers/multi-agent-coordination-mcp/main.py` — All 14 tools
- `AndrewDavidRivers/multi-agent-coordination-mcp/ARCHITECTURE.md` — Full architecture doc
- `ai-janitor/dead-drop-teams/src/dead_drop/server.py` — All 6 tools
- `ai-janitor/dead-drop-teams/docs/PROTOCOL.md` — Full protocol specification

---

## 8. Raw Links (Every URL Encountered)

```
https://github.com/Dicklesworthstone/mcp_agent_mail
https://github.com/LNS2905/mcp-beads-village
https://github.com/AndrewDavidRivers/multi-agent-coordination-mcp
https://github.com/ai-janitor/dead-drop-teams
https://github.com/modelcontextprotocol/specification/issues/1708
https://github.com/punkpeye/awesome-mcp-servers
https://github.com/ruvnet/ruflo
https://github.com/bytedance/UI-TARS-desktop
https://github.com/1Panel-dev/MaxKB
https://github.com/activepieces/activepieces
https://github.com/triggerdotdev/trigger.dev
https://github.com/1mcp/agent
https://github.com/askbudi/roundtable
https://github.com/oxgeneral/agentnet
https://github.com/rhein1/agoragentic-integrations
https://github.com/edgarriba/prolink
https://github.com/juspay/neurolink
https://github.com/IMNMV/ClaudeR
https://github.com/Arpan-Roy-1993/Claude_MCP_Multi_Agent_Orchestration
https://github.com/topics/mcp-server
https://github.com/modelcontextprotocol/specification/issues/2350
https://github.com/modelcontextprotocol/specification/issues/2188
https://github.com/modelcontextprotocol/specification/issues/2290
https://github.com/modelcontextprotocol/specification/issues/2280
https://github.com/Dicklesworthstone/beads_rust
https://github.com/steveyegge/beads
https://github.com/Dicklesworthstone/beads_viewer
https://pypi.org/project/winfcntl/
https://www.npmjs.com/package/proper-lockfile
https://www.npmjs.com/package/@bernierllc/file-lock
https://github.com/modelcontextprotocol/servers/blob/main/src/filesystem/index.ts
```

---

## 9. Implications for Sherpa's MCP Authority Tool API Design

### 9.1 What to Adopt

1. **MCP Agent Mail's clustered tool organization** — Group tools by concern (identity, authority, messaging, macros). Use capability tags for profile-based filtering.

2. **Beads Village's `{error, hint}` error pattern** — Hints guide agents to recovery actions. More useful than opaque error codes.

3. **Beads Village's MCP tool annotations** — `readOnlyHint`, `destructiveHint`, `idempotentHint`, `openWorldHint` are now standard MCP and help clients make intelligent retry/safety decisions.

4. **Multi-Agent Coord's automatic locking-on-assignment** — Authority should flow from task dispatch, not require a separate reservation call. When Sherpa dispatches a task, authority over the task's target files should be implicit.

5. **Agent Mail's dual persistence** — Git for audit trail + SQLite for queries is the right pattern for Sherpa. Already aligned with the sqlite-agentic-state research.

6. **Agent Mail's TTL + renewal** — 3-step: reserve → renew → release. With a floor TTL of 60s. Sherpa should adopt this but add heartbeat as a fourth signal.

7. **Dead-Drop's inbox-first discipline** — Server-enforced read-before-write is a powerful coordination primitive. Sherpa should consider whether authority grants should require acknowledgment.

### 9.2 What to Improve

1. **Add fencing tokens**: Every authority grant should return a monotonically increasing token. Mutations must present a valid token. This prevents stale-authority writes that no existing server protects against.

2. **Add heartbeat**: None of these servers check liveness. Sherpa should require periodic heartbeat (or piggyback on tool calls) to maintain authority. Missed heartbeats → automatic revocation after grace period.

3. **Mandatory server-side enforcement**: Agent Mail's advisory model works only when all agents cooperate. Sherpa's MCP server should reject mutations from agents without valid authority tokens.

4. **Authority state machine**: Model authority as a first-class state machine:
   ```
   idle → requesting → granted → active → revoking → released
                    ↗ denied                   ↘ expired
   ```
   This is more expressive than any existing system's boolean lock/unlock.

5. **Hierarchical authority**: Reserve `docs/initiatives/` and automatically have authority over all files within. No existing system supports this.

6. **Conflict resolution protocol**: Instead of "wait for TTL" or "coordinate somehow," define explicit protocol: priority-based preemption, queue with notification, or escalation to human.

### 9.3 Suggested Sherpa Tool Naming

Based on patterns observed, recommend a middle ground — verb-first, 2-3 words, snake_case:

```
# Authority lifecycle
authority_request(scope, ttl, exclusive, reason) → {token, granted_paths, conflicts}
authority_renew(token, extend_seconds) → {token, new_expires}
authority_release(token) → {released}
authority_query(scope?) → [{holder, scope, token, expires, exclusive}]

# Task-authority integration
task_dispatch(task_id, agent_id) → {task, authority_token}
task_complete(task_id, authority_token) → {released_authority}

# Agent lifecycle
agent_register(program, model, capabilities) → {agent_id, registration_token}
agent_heartbeat(agent_id) → {status, authorities_held}

# Messaging (if needed)
message_send(to, subject, body, thread_id?) → {id}
message_inbox(since?, limit?) → [{message}]
```

---

## 10. Open Questions

1. **Should Sherpa's authority be advisory or mandatory?** Agent Mail chose advisory + pre-commit guard. Multi-Agent Coord chose automatic-but-no-enforcement. Mandatory is safer but adds overhead to every tool call.

2. **How does authority interact with worktrees?** If each agent works in its own git worktree, file-level authority may be unnecessary for most operations — worktree isolation provides it naturally. Authority might only matter at merge time.

3. **Should authority be scope-based or path-based?** Existing servers all use file paths. Sherpa might benefit from semantic scopes ("initiative:vedic-research", "component:auth-api") that map to paths dynamically.

4. **What is the heartbeat interval?** Too short = chatty. Too long = stale authority lingers. Beads Village's 30-min active window for agent discovery is probably too long for authority. 5-minute heartbeat with 2-minute grace seems reasonable.

5. **Can tool calls serve as implicit heartbeats?** Every tool call from an agent could reset their authority TTL, avoiding a separate heartbeat tool.

6. **How does Dead-Drop's inbox-first discipline interact with authority?** Should an agent be required to check for authority-revocation messages before attempting a write?

7. **What is the right TTL default?** Agent Mail: 3600s (1 hour). Beads Village: 600s (10 min). Multi-Agent Coord: infinite. The right default likely depends on whether the system has heartbeat (shorter TTL + heartbeat renewal) or not (longer TTL).
