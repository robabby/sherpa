# Existing MCP Server Coordination Patterns

**Research iteration:** 2
**Date:** 2026-03-11
**Question:** Do existing real-world MCP servers implement any form of authority tracking, versioning, or conflict detection? What coordination-related patterns exist in production MCP servers?

---

## Key Discoveries

### 1. The MCP Spec Has Building Blocks but No Coordination Primitives

The MCP specification (2025-11-25) provides low-level hooks that *could* support coordination but defines no coordination primitives itself:

- **Resource annotations** include an optional `lastModified` ISO 8601 timestamp (e.g., `"2025-01-12T15:00:58Z"`) -- this is the closest thing to version tracking in the spec. Clients can use it to sort by recency, but there is no ETag, content hash, or version number. ([MCP Resources spec](https://modelcontextprotocol.io/specification/2025-11-25/server/resources))

- **Resource subscriptions** (`resources/subscribe`, `notifications/resources/updated`) let a client watch for changes to a specific resource URI. The notification contains only the URI -- no diff, no version, no old/new content. The client must re-read the resource to learn what changed. Few clients actually implement this (even Claude Desktop/Code don't). ([MCP Resources spec](https://modelcontextprotocol.io/specification/2025-11-25/server/resources), [MCP Discussion #391](https://github.com/orgs/modelcontextprotocol/discussions/391))

- **Tool annotations** include `readOnlyHint`, `destructiveHint`, `idempotentHint`, and `openWorldHint` -- advisory metadata about tool behavior. These are hints only and not enforced. They signal intent but don't implement any concurrency control. ([MCP Tool Annotations intro](https://blog.marcnuri.com/mcp-tool-annotations-introduction))

- **Tasks** (SEP-1686, added 2025-11-25) give agents a "call-now, fetch-later" pattern with a 5-state lifecycle (working -> input_required -> completed/failed/cancelled). Terminal states are irreversible. Tasks can wrap any MCP request, not just tool calls. However, Tasks are about async execution, not about coordination between multiple agents/sessions. ([SEP-1686](https://github.com/modelcontextprotocol/modelcontextprotocol/issues/1686), [Agnost blog on Tasks](https://agnost.ai/blog/long-running-tasks-mcp/))

- **No multi-client semantics.** The spec does not address what happens when multiple clients connect to the same server, share state, or modify the same resources. This is entirely left to implementation.

### 2. The Official Filesystem MCP Server Has Zero Coordination

The reference filesystem server (`@modelcontextprotocol/server-filesystem`) exposes 14 tools for file I/O. It implements access control via allowed directories and tool annotations (readOnly/destructive hints). It has **no file locking, no conflict detection, no versioning, and no concurrent access handling.** It is designed for single-client use. ([Filesystem MCP Server source](https://github.com/modelcontextprotocol/servers/tree/main/src/filesystem))

### 3. SEP-1708 Proposes Real File Locking for MCP (Not Yet Merged)

SEP-1708 ("Client-Brokered Filesystem Access") is the most sophisticated coordination proposal in the MCP ecosystem. Key features:

- **Exclusive file locking** -- all file operations acquire exclusive locks during execution
- **Persistent locks** via `keepLocked: true` parameter; returns a unique `lockId`
- **Explicit release** via `files/unlock` with `lockId`
- **FILE_LOCKED error** (`-32100`) -- operations on locked files fail immediately with the existing lock's ID
- **Automatic cleanup** -- locks released on connection disconnect
- **User consent framework** -- `files/consent` method with per-path approval and revocation

This is a *proposal*, not an accepted standard. It addresses single-server concurrent access but not distributed coordination across multiple servers. ([SEP-1708](https://github.com/modelcontextprotocol/modelcontextprotocol/issues/1708))

### 4. GitHub MCP Server Uses SHA-Based Optimistic Concurrency (Inherited from GitHub API)

GitHub's official MCP server exposes 51 tools. The `create_or_update_file` tool requires the file's SHA when updating -- a direct pass-through of GitHub's API which uses SHA as a version token. If the file changed since you last read it (SHA mismatch), the update fails.

This is **inherited optimistic concurrency** -- the MCP server doesn't add it; the underlying API already has it. The MCP layer is a thin wrapper. No other GitHub MCP tools expose versioning or conflict detection. ([GitHub MCP Server](https://github.com/github/github-mcp-server), [Tools list gist](https://gist.github.com/didier-durand/2970be82fec6c84d522f7953ac7881b4))

### 5. Confluence MCP Server Fixed Version Conflicts by Auto-Fetching Versions

The `mcp-jira-confluence` package hit HTTP 409 Conflict errors during concurrent Confluence page updates. The fix (v0.2.1): make the `version` parameter optional in `update-confluence-page` with automatic version fetching before each write.

This is a **last-writer-wins** strategy disguised as conflict prevention. By always fetching the latest version just before writing, it avoids 409 errors but silently overwrites concurrent changes. No merge, no notification, no detection. ([mcp-jira-confluence on PyPI](https://pypi.org/project/mcp-jira-confluence/))

### 6. MCP Agent Mail Is the Most Sophisticated Coordination Server Found

MCP Agent Mail (`Dicklesworthstone/mcp_agent_mail`) is a purpose-built coordination layer for multi-agent coding scenarios. It implements:

- **Advisory file leases** -- agents declare intent to edit file globs (e.g., `src/auth/**/*.ts`) with `exclusive=true/false` and `ttl_seconds`. Not hard locks; surfacing intent.
- **Conflict detection** -- overlapping exclusive reservations return `FILE_RESERVATION_CONFLICT` errors
- **Pre-commit guard** -- optional Git hook (`mcp-agent-mail-guard`) blocks commits that overlap with another agent's active reservations
- **TTL-based expiry** -- leases auto-expire, preventing deadlocks from crashed agents
- **Dual persistence** -- leases stored in Git (human-auditable JSON files) AND SQLite (fast queries via FTS5)
- **Agent identity** -- memorable adjective+noun names, persistent across sessions
- **Message threading** -- structured communication with acknowledgment requirements and importance levels
- **Cross-project linking** -- `request_contact`/`respond_contact` for agents in different repos

Key architectural decisions:
- Advisory over mandatory: "Agents coordinate asynchronously; hard locks create head-of-line blocking and brittle failures"
- Git-native storage: all state is committed to the repo, making it diffable and auditable
- Optional enforcement: the pre-commit guard is opt-in, not default

([MCP Agent Mail repo](https://github.com/Dicklesworthstone/mcp_agent_mail), [mcpagentmail.com](https://mcpagentmail.com/), [PyPI](https://pypi.org/project/mcp-agent-mail/))

### 7. Beads Village Implements Task Queue + File Reservations

Beads Village (`LNS2905/mcp-beads-village`) is a multi-agent MCP server combining:

- **Task queue** -- agents claim tasks via `claim()`, only one agent per task
- **File reservation** -- `reserve(files=['file1.js', 'file2.py'])` locks files before editing, with TTL-based auto-release
- **Point-to-point messaging** -- `msg(to='agent-2', content='...')` for coordination
- **Role-based filtering** -- agents tagged 'fe' or 'be' see only matching tasks
- **Git-native storage** -- all data in `.beads/` and `.mail/` directories
- **TUI dashboard** -- real-time visualization of team status, task board, file locks, messages

Workflow: `init()` -> `claim()` -> `reserve()` -> work -> `done()` -> RESTART

([Beads Village repo](https://github.com/LNS2905/mcp-beads-village), [NPM](https://www.npmjs.com/package/beads-village))

### 8. Atomic Writer MCP Implements Journaled File Operations

The `vanzan01/atomic-writer-mcp` server implements:

- **Atomic journaled writes** -- all file operations are journaled; partial writes roll back
- **Content integrity** -- checksum verification after every write
- **Mutex-style locks** -- `get-lock-status` and `force-release-lock` tools for managing contention
- **Automatic backups** -- backup created before every modification
- **Append-only by design** -- "New content can only be appended, never overwritten" for some operations
- **19 tools** including rollback, recovery, and history inspection

Designed to prevent LLMs from accidentally destroying file content. Single-agent focused. ([Atomic Writer MCP repo](https://github.com/vanzan01/atomic-writer-mcp))

### 9. GitHub Issue Priority Server Implements Atomic Issue Locking

`steiner385/mcp-git-issue-priority` prevents multiple AI sessions from selecting the same GitHub issue:

- **File-based atomic locking** -- prevents concurrent selection of the same issue
- **Stale lock detection** -- automatically cleans up locks from dead processes
- **Deterministic scoring** -- consistent priority-based issue selection across sessions
- **8-phase workflow** -- selection -> research -> branch -> implementation -> testing -> commit -> PR -> review

([MCP GitHub Issue Priority Server](https://glama.ai/mcp/servers/steiner385/mcp-git-issue-priority))

### 10. Database MCP Servers Rely on Database-Native Concurrency

Database MCP servers delegate concurrency to the underlying database engine:

- **SQLite servers** use WAL (Write-Ahead Logging) mode for concurrent read access. Claude Code's memory MCP uses `journal_mode = WAL` and `busy_timeout = 5000` to handle concurrent sessions. Transaction batching with `INSERT OR IGNORE` handles duplicate entries from competing sessions. ([Dev.to article on SQLite WAL](https://dev.to/daichikudo/fixing-claude-codes-concurrent-session-problem-implementing-memory-mcp-with-sqlite-wal-mode-o7k))

- **PostgreSQL MCP servers** (`crystaldba/postgres-mcp`) support configurable read-only mode using transaction-level protection. No MCP-level concurrency is added; PostgreSQL's MVCC handles it. ([Postgres MCP Pro repo](https://github.com/crystaldba/postgres-mcp))

- **Multi-database servers** (`FreePeak/db-mcp-server`) expose per-database transaction tools (`BEGIN`, `COMMIT`, `ROLLBACK`) but add no coordination layer. ([DB MCP Server repo](https://github.com/FreePeak/db-mcp-server))

### 11. Multi-Agent MCP Frameworks Exist but Lack Deep Concurrency Control

Several frameworks enable multi-agent collaboration via MCP:

- **Agent-MCP** (`rinadelph/Agent-MCP`): Knowledge graph + task dispatch + agent messaging. Claims to prevent conflicts but provides no technical details on how. ([Agent-MCP repo](https://github.com/rinadelph/Agent-MCP))

- **Agent Hub MCP** (`gilbarbara/agent-hub-mcp`): Agent identity persistence, capability-based delegation, feature-scoped task coordination. Agent ID conflict prevention (can't reuse ID with different project path). No file locking or concurrency control. ([Agent Hub MCP repo](https://github.com/gilbarbara/agent-hub-mcp))

- **Brainstorm MCP** (`TheodorStorm/brainstorm-mcp`): Project-scoped agent communication, shared resources, session persistence. Designed for local multi-Claude-Code coordination. No concurrency primitives. ([Brainstorm MCP repo](https://github.com/TheodorStorm/brainstorm-mcp))

- **Agent Blackboard** (`claudioed/agent-blackboard`): Blackboard pattern with 9 specialized agents. Shared knowledge via embedding-based search. No explicit concurrency mechanisms documented. ([Agent Blackboard repo](https://github.com/claudioed/agent-blackboard))

### 12. The 2026 MCP Roadmap Addresses Scalability but Not Multi-Agent Coordination

The [2026 MCP Roadmap](https://modelcontextprotocol.io/development/roadmap) (updated 2026-03-05) identifies four priority areas:

1. **Transport Evolution & Scalability** -- stateless horizontal scaling, session creation/resumption/migration, MCP Server Cards for discovery
2. **Agent Communication** -- retry semantics and expiry policies for the Tasks primitive
3. **Governance Maturation** -- contributor ladder, delegation model, charter templates
4. **Enterprise Readiness** -- audit trails, SSO-integrated auth, gateway patterns, config portability

**"On the Horizon" (not yet prioritized):**
- Triggers and event-driven updates (webhooks/callbacks)
- Result type improvements (streaming, reference-based results)
- Security & authorization refinements
- Extensions ecosystem

**Notably absent:** Any mention of multi-agent coordination, shared state management, conflict detection, locking, or concurrent access as protocol-level concerns. The spec team treats this as an application concern, not a protocol concern.

### 13. Academic Research Proposes but Doesn't Implement Coordination

Two relevant papers exist:

- **CA-MCP** (arXiv:2601.11595, Jan 2026): Proposes a Shared Context Store (SCS) as a "centralized blackboard" where MCP servers read/write shared state. Servers become "stateful reactors" with event-triggered synchronization. **No concurrency control implemented.** The authors explicitly note: "we used straightforward realizations... without hardware or software optimizations such as parallel multithreading" and "leave such engineering explorations to future work." ([Paper](https://arxiv.org/html/2601.11595))

- **Multi-Agent MCP survey** (arXiv:2504.21030, Apr 2025): Describes negotiation-based and role-based authority for conflict resolution, capability-based access control, and knowledge graph persistence. Architectural patterns only -- no implementations. ([Paper](https://arxiv.org/abs/2504.21030))

---

## Coordination Pattern Taxonomy

Based on the research, existing MCP servers use these coordination patterns in order of sophistication:

| Pattern | Example | Mechanism | Strength | Weakness |
|---------|---------|-----------|----------|----------|
| **None** | Official filesystem server | No coordination | Simple | Unsafe for concurrent use |
| **Inherited** | GitHub MCP (SHA), DB MCPs (MVCC/WAL) | Pass-through of underlying API's concurrency | Zero MCP-layer complexity | Only works when wrapping a system that already has it |
| **Last-writer-wins** | mcp-jira-confluence (auto version fetch) | Always fetch latest before write | Avoids errors | Silently loses concurrent changes |
| **Mutex locks** | Atomic Writer MCP, Issue Priority Server | File-based atomic locks with stale detection | Prevents concurrent modification | Single-agent focus; no distributed coordination |
| **Advisory leases** | MCP Agent Mail | Glob-pattern reservations with TTL, optional pre-commit enforcement | Flexible; crash-safe; human-auditable | Advisory only; requires agent cooperation |
| **Task queue + reservation** | Beads Village | Exclusive task claiming + file reservations + messaging | Full workflow; prevents duplicate work | Requires all agents to use the system |

---

## Implications for Sherpa's MCP Coordination Layer

1. **The gap is real.** No MCP server implements optimistic concurrency with ETags/version numbers. No MCP server implements fencing tokens. No MCP server uses CRDTs. The most advanced pattern in production is advisory leases (MCP Agent Mail).

2. **The spec won't help us.** The MCP specification has no plans to add coordination primitives. The 2026 roadmap focuses on transport scalability and enterprise readiness, not multi-agent state coordination. We'd be building on top of the spec, not waiting for it.

3. **Advisory > mandatory.** MCP Agent Mail's design choice of advisory leases over hard locks is worth learning from. In async multi-agent scenarios, hard locks cause deadlocks and head-of-line blocking. Advisory systems with optional enforcement (pre-commit hooks) are more practical.

4. **Git is a coordination backend.** Both MCP Agent Mail and Beads Village store coordination state in Git. This gives you auditing, diffing, and conflict detection for free via Git's own merge semantics. Git worktrees (which Sherpa already uses) provide natural isolation.

5. **Resource annotations are extensible.** The MCP spec's `lastModified` annotation on resources is the hook point. A Sherpa MCP server could extend resource metadata to include version numbers, owner identifiers, or lease status without violating the spec.

6. **Tool annotations hint at safety but don't enforce it.** The `readOnlyHint`/`destructiveHint`/`idempotentHint` annotations are advisory. A Sherpa coordination server would need to actually enforce these constraints, not just declare them.

7. **SEP-1708's locking model is the best protocol-level reference.** Its `keepLocked`/`lockId`/`FILE_LOCKED(-32100)` pattern is clean and close to what we'd need. Even if it doesn't merge, it's the best protocol-level design for file coordination in the MCP ecosystem.

8. **Task dispatch already has coordination semantics.** The existing Beads/Agent-MCP/Agent-Hub pattern of `claim()` -> `reserve()` -> `done()` maps directly to Sherpa's Planner/Worker/Judge pipeline. The coordination MCP server could manage this lifecycle.

---

## Open Questions

1. **Should authority be advisory or enforced?** MCP Agent Mail chose advisory. But Sherpa agents are AI -- they don't have the judgment to voluntarily respect leases. Should we enforce with pre-commit hooks, or go further with server-side rejection of unauthorized writes?

2. **Where does coordination state live?** Options: (a) Git files in the repo, (b) SQLite alongside the repo, (c) the MCP server's in-memory state. MCP Agent Mail uses Git+SQLite dual storage. What's right for Sherpa?

3. **How does authority transfer work at the MCP protocol level?** If a Planner assigns a task to a Worker, and the Worker acquires authority over files, how does the Judge later acquire read access to review those same files? SEP-1708's locking model doesn't address delegation chains.

4. **Can MCP resource subscriptions carry version information?** The current `notifications/resources/updated` carries only a URI. Could we extend it with a version token to enable diff-based change detection?

5. **What happens when two agents need the same file?** The iteration-1 research discussed fencing tokens. But in practice, do we need merge semantics (like CRDTs) rather than exclusive locks? Sherpa's proposal system is append-only by design -- maybe append-only is the right constraint.

6. **Should the coordination server be a single MCP server or a sidecar pattern?** One server managing authority + task dispatch + messaging, or separate servers for each concern?

---

## Sources

### MCP Specification & Roadmap
- [MCP Specification 2025-11-25](https://modelcontextprotocol.io/specification/2025-11-25) -- Current protocol specification
- [MCP Resources Specification](https://modelcontextprotocol.io/specification/2025-11-25/server/resources) -- Resource model, subscriptions, annotations
- [MCP 2026 Roadmap](https://modelcontextprotocol.io/development/roadmap) -- Strategic priorities (transport, enterprise, governance)
- [2026 MCP Roadmap Blog Post](http://blog.modelcontextprotocol.io/posts/2026-mcp-roadmap/) -- Narrative version of the roadmap
- [MCP Registry](https://registry.modelcontextprotocol.io/) -- Official server registry
- [MCP Registry Blog Post](http://blog.modelcontextprotocol.io/posts/2025-09-08-mcp-registry-preview/) -- Registry launch announcement
- [SEP-1686: Tasks](https://github.com/modelcontextprotocol/modelcontextprotocol/issues/1686) -- Async task primitive
- [SEP-1708: Client-Brokered Filesystem Access](https://github.com/modelcontextprotocol/modelcontextprotocol/issues/1708) -- File locking proposal
- [MCP Notifications Discussion #1192](https://github.com/modelcontextprotocol/modelcontextprotocol/discussions/1192) -- Notification handling best practices
- [MCP Observer Server Discussion #391](https://github.com/orgs/modelcontextprotocol/discussions/391) -- Push notification discussion
- [MCP Client Capability Gap](https://www.pulsemcp.com/posts/mcp-client-capabilities-gap) -- What clients actually implement
- [MCP Tool Annotations Intro](https://blog.marcnuri.com/mcp-tool-annotations-introduction) -- Tool annotation patterns
- [Tasks Pattern Blog](https://agnost.ai/blog/long-running-tasks-mcp/) -- Call-now/fetch-later explanation
- [MCP Spec Update Blog (WorkOS)](https://workos.com/blog/mcp-2025-11-25-spec-update) -- 2025-11-25 spec walkthrough
- [MCP Features Guide (WorkOS)](https://workos.com/blog/mcp-features-guide) -- Tools, Resources, Prompts, Sampling, Roots, Elicitation

### Official & Reference MCP Servers
- [MCP Reference Servers Repository](https://github.com/modelcontextprotocol/servers) -- Official server implementations
- [MCP Filesystem Server Source](https://github.com/modelcontextprotocol/servers/tree/main/src/filesystem) -- Reference filesystem server
- [MCP Filesystem Server NPM](https://www.npmjs.com/package/@modelcontextprotocol/server-filesystem) -- NPM package
- [MCP SQLite Server (PulseMCP)](https://www.pulsemcp.com/servers/modelcontextprotocol-sqlite) -- Reference SQLite server
- [MCP PostgreSQL Server (PulseMCP)](https://www.pulsemcp.com/servers/modelcontextprotocol-postgres) -- Reference PostgreSQL server
- [MCP Example Servers](https://modelcontextprotocol.io/examples) -- Official examples page

### GitHub MCP Servers
- [GitHub Official MCP Server](https://github.com/github/github-mcp-server) -- GitHub's production MCP server
- [GitHub MCP Server Docker](https://hub.docker.com/mcp/server/github-official/overview) -- Docker deployment
- [GitHub MCP 51 Tools List](https://gist.github.com/didier-durand/2970be82fec6c84d522f7953ac7881b4) -- Complete tool inventory
- [GitHub MCP Changelog](https://github.blog/changelog/2025-10-29-github-mcp-server-now-comes-with-server-instructions-better-tools-and-more/) -- Tool improvements
- [GitHub MCP Setup Docs](https://docs.github.com/en/copilot/how-tos/provide-context/use-mcp/set-up-the-github-mcp-server) -- Configuration guide
- [GitHub MCP Registry Entry](https://github.com/mcp/io.github.github/github-mcp-server) -- Registry listing

### Git MCP Servers
- [Git MCP Server (cyanheads)](https://github.com/cyanheads/git-mcp-server) -- Full Git operations via MCP
- [MCP Git Issue Priority Server](https://glama.ai/mcp/servers/steiner385/mcp-git-issue-priority) -- Concurrency-safe issue locking

### Project Management MCP Servers
- [Linear MCP Docs](https://linear.app/docs/mcp) -- Linear's official MCP server
- [Linear MCP Changelog (May 2025)](https://linear.app/changelog/2025-05-01-mcp) -- Initial launch
- [Linear MCP for Product Management (Feb 2026)](https://linear.app/changelog/2026-02-05-linear-mcp-for-product-management) -- Expanded tools
- [Linear MCP (community)](https://github.com/jerhadf/linear-mcp-server) -- Community implementation
- [Atlassian Official MCP Server](https://github.com/atlassian/atlassian-mcp-server) -- Remote MCP for Jira/Confluence
- [Atlassian MCP Blog](https://www.atlassian.com/blog/announcements/remote-mcp-server) -- Rovo MCP announcement
- [mcp-atlassian (community)](https://github.com/sooperset/mcp-atlassian) -- 72-tool Jira/Confluence MCP
- [mcp-jira-confluence PyPI](https://pypi.org/project/mcp-jira-confluence/) -- Version conflict fix details
- [Project Management MCP Servers Overview (Merge)](https://www.merge.dev/blog/project-management-mcp-servers) -- Category overview

### Multi-Agent Coordination MCP Servers
- [MCP Agent Mail Repository](https://github.com/Dicklesworthstone/mcp_agent_mail) -- Advisory leases + messaging
- [MCP Agent Mail Website](https://mcpagentmail.com/) -- Product page
- [MCP Agent Mail PyPI](https://pypi.org/project/mcp-agent-mail/) -- Python package
- [MCP Agent Mail (PulseMCP)](https://www.pulsemcp.com/servers/dicklesworthstone-agent-mail) -- Server listing
- [Beads Village Repository](https://github.com/LNS2905/mcp-beads-village) -- Task queue + file locking
- [Beads Village NPM](https://www.npmjs.com/package/beads-village) -- NPM package
- [Beads Village (AIBase)](https://mcp.aibase.com/server/1586804682578469105) -- Detailed description
- [Agent-MCP Repository](https://github.com/rinadelph/Agent-MCP) -- Knowledge graph multi-agent
- [Agent Hub MCP Repository](https://github.com/gilbarbara/agent-hub-mcp) -- Agent communication hub
- [Brainstorm MCP Repository](https://github.com/TheodorStorm/brainstorm-mcp) -- Claude Code collaboration
- [Agent Blackboard Repository](https://github.com/claudioed/agent-blackboard) -- Blackboard pattern + MCP
- [Atomic Writer MCP Repository](https://github.com/vanzan01/atomic-writer-mcp) -- Journaled atomic file ops

### Database MCP Servers
- [DB MCP Server (FreePeak)](https://github.com/FreePeak/db-mcp-server) -- Multi-database with transactions
- [Postgres MCP Pro (crystaldba)](https://github.com/crystaldba/postgres-mcp) -- Configurable read/write access
- [DBHub (bytebase)](https://github.com/bytebase/dbhub) -- Zero-dependency multi-database MCP
- [MCP Database Server (executeautomation)](https://github.com/executeautomation/mcp-database-server) -- SQLite/SqlServer/Postgres
- [SQLite WAL Concurrent Sessions Article](https://dev.to/daichikudo/fixing-claude-codes-concurrent-session-problem-implementing-memory-mcp-with-sqlite-wal-mode-o7k) -- Practical WAL usage

### Notion/Collaboration MCP Servers
- [Notion Official MCP Server](https://github.com/makenotion/notion-mcp-server) -- Notion's MCP server
- [Notion MCP Docs](https://developers.notion.com/guides/mcp/mcp) -- Developer guide
- [Notion MCP Blog Post](https://www.notion.com/blog/notions-hosted-mcp-server-an-inside-look) -- Architecture details

### Knowledge Graph / Memory MCP Servers
- [Knowledge Graph Memory Server (PulseMCP)](https://www.pulsemcp.com/servers/modelcontextprotocol-knowledge-graph-memory) -- Anthropic's reference
- [MCP Memory Service (doobidoo)](https://github.com/doobidoo/mcp-memory-service) -- Persistent memory for agents
- [Graphiti + FalkorDB MCP](https://www.falkordb.com/blog/mcp-knowledge-graph-graphiti-falkordb/) -- Knowledge graph with multi-tenancy
- [Neo4j MCP](https://neo4j.com/developer/genai-ecosystem/model-context-protocol-mcp/) -- Graph database MCP
- [Zep Knowledge Graph MCP](https://www.getzep.com/product/knowledge-graph-mcp/) -- Agent memory MCP
- [Knowledge & Memory Servers (Glama)](https://glama.ai/mcp/servers/categories/knowledge-and-memory) -- Category listing

### Academic Papers
- [CA-MCP: Context-Aware Server Collaboration (arXiv:2601.11595)](https://arxiv.org/html/2601.11595) -- Shared Context Store proposal
- [Advancing Multi-Agent Systems Through MCP (arXiv:2504.21030)](https://arxiv.org/abs/2504.21030) -- Architecture survey
- [Multi-Agent System Orchestration (arXiv:2601.13671)](https://arxiv.org/abs/2601.13671) -- Protocol comparison
- [Agent Communication Protocol (arXiv:2602.15055)](https://arxiv.org/html/2602.15055) -- ACP proposal
- [Agent Interoperability Survey (arXiv:2505.02279)](https://arxiv.org/html/2505.02279v1) -- MCP/ACP/A2A/ANP survey

### MCP Server Directories & Lists
- [awesome-mcp-servers (wong2)](https://github.com/wong2/awesome-mcp-servers) -- Curated server list
- [awesome-mcp-servers (punkpeye)](https://github.com/punkpeye/awesome-mcp-servers) -- Alternative list
- [mcpservers.org](https://mcpservers.org/) -- Server directory
- [mcp.so](https://mcp.so/) -- Server directory
- [Project/Task Management MCP Servers](https://github.com/TensorBlock/awesome-mcp-servers/blob/main/docs/project--task-management.md) -- Category listing
- [File System MCP Servers](https://mcpservers.org/category/file-system) -- Filesystem category
- [Enterprise MCP Documentation (vosbek)](https://vosbek.github.io/enterprise-mcp-documentation/servers/file-system) -- Enterprise patterns

### Multi-Agent Architecture Articles
- [Blackboard Pattern with MCPs (Medium)](https://medium.com/@dp2580/building-intelligent-multi-agent-systems-with-mcps-and-the-blackboard-pattern-to-build-systems-a454705d5672) -- Design patterns
- [MCP & Multi-Agent AI (OneReach)](https://onereach.ai/blog/mcp-multi-agent-ai-collaborative-intelligence/) -- 2026 outlook
- [MCP vs A2A (OneReach)](https://onereach.ai/blog/guide-choosing-mcp-vs-a2a-protocols/) -- Protocol comparison
- [Multi-Agent Guide (dev.to)](https://dev.to/eira-wexford/how-to-build-multi-agent-systems-complete-2026-guide-1io6) -- Implementation guide
- [Agent-to-Agent via MCP (dev.to)](https://dev.to/codanyks/agent-to-agent-communication-via-mcp-1imj) -- Communication patterns
- [MCP Orchestration Patterns (Microsoft)](https://techcommunity.microsoft.com/blog/azuredevcommunityblog/orchestrating-multi-agent-intelligence-mcp-driven-patterns-in-agent-framework/4462150) -- Enterprise patterns
- [Beads (Yegge)](https://github.com/steveyegge/beads) -- Memory upgrade for coding agents
- [Beads Best Practices (Yegge, Medium)](https://steve-yegge.medium.com/beads-best-practices-2db636b9760c) -- Best practices

### Protocol & Specification Resources
- [MCP Specification GitHub](https://github.com/modelcontextprotocol/registry) -- Registry repo
- [MCP Python SDK](https://github.com/modelcontextprotocol/python-sdk) -- Official Python SDK
- [MCP Working Groups](https://modelcontextprotocol.io/community/working-interest-groups) -- WG/IG participation
- [MCP SEP Guidelines](https://modelcontextprotocol.io/community/sep-guidelines) -- Proposal process
- [Microsoft MCP Servers](https://developer.microsoft.com/blog/10-microsoft-mcp-servers-to-accelerate-your-development-workflow) -- Microsoft's MCP servers
- [AWS MCP Vision](https://aws.amazon.com/blogs/opensource/shaping-the-future-of-mcp-aws-commitment-and-vision/) -- AWS MCP commitment
- [MCP Registry API (Nordic APIs)](https://nordicapis.com/getting-started-with-the-official-mcp-registry-api/) -- Registry API guide

---

## Raw Link Dump

Every URL encountered during this research, including tangentially relevant ones not fully explored:

```
https://registry.modelcontextprotocol.io/
http://blog.modelcontextprotocol.io/posts/2025-09-08-mcp-registry-preview/
https://github.com/modelcontextprotocol/registry
https://modelcontextprotocol.info/tools/registry/
https://github.com/modelcontextprotocol/servers
https://nordicapis.com/getting-started-with-the-official-mcp-registry-api/
https://modelcontextprotocol.info/blog/mcp-next-version-update/
https://modelcontextprotocol.io/specification/2025-11-25
https://registry.modelcontextprotocol.io/docs
https://github.com/modelcontextprotocol/servers?tab=readme-ov-file
https://github.com/wong2/awesome-mcp-servers
https://www.merge.dev/blog/project-management-mcp-servers
https://developer.microsoft.com/blog/10-microsoft-mcp-servers-to-accelerate-your-development-workflow
https://linear.app/changelog/2026-02-05-linear-mcp-for-product-management
https://www.remote-mcp.com/servers/linear
https://creati.ai/mcp/linear-mcp-server-1282/
https://linear.app/docs/mcp
https://github.com/TensorBlock/awesome-mcp-servers/blob/main/docs/project--task-management.md
https://mcpservers.org/
https://glama.ai/mcp/servers/steiner385/mcp-git-issue-priority
https://github.com/github/github-mcp-server
https://github.com/cyanheads/git-mcp-server
https://github.com/mcp/io.github.github/github-mcp-server
https://github.com/topics/mcp-server
https://github.com/sooperset/mcp-atlassian
https://hub.docker.com/mcp/server/github-official/overview
https://github.com/mcp
https://github.com/punkpeye/awesome-mcp-servers
https://github.com/php-mcp/server
https://github.com/FreePeak/db-mcp-server
https://github.com/crystaldba/postgres-mcp
https://lobehub.com/mcp/simonholm-sqlite-mcp-server
https://www.pulsemcp.com/servers/modelcontextprotocol-sqlite
https://github.com/bytebase/dbhub
https://www.pulsemcp.com/servers/modelcontextprotocol-postgres
https://mcpservers.org/servers/panasenco/mcp-sqlite
https://modelcontextprotocol.io/examples
https://mcpservers.org/servers/FreePeak/db-mcp-server
https://github.com/executeautomation/mcp-database-server
https://github.com/modelcontextprotocol/modelcontextprotocol/issues/1708
https://mcp.aibase.com/server/1586804682578469105
https://github.com/modelcontextprotocol/servers/tree/main/src/filesystem
https://markaicode.com/mcp-filesystem-server-safe-read-write/
https://mcpservers.org/servers/modelcontextprotocol/filesystem
https://www.npmjs.com/package/@modelcontextprotocol/server-filesystem
https://github.com/mark3labs/mcp-filesystem-server
https://mcpservers.org/category/file-system
https://vosbek.github.io/enterprise-mcp-documentation/servers/file-system
https://lobehub.com/mcp/nandarizkika-mcp-filesystem-server
https://fideloper.com/etags-and-optimistic-concurrency-control
https://modelcontextprotocol.io/specification/versioning
https://event-driven.io/en/how_to_use_etag_header_for_optimistic_concurrency/
https://codeopinion.com/optimistic-concurrency-in-an-http-api-with-etags-hypermedia/
https://en.wikipedia.org/wiki/Optimistic_concurrency_control
https://zeitbach.com/blog/2024/01/26/optimistic-concurrency-control-with-etags
https://techdocs.akamai.com/property-mgr/reference/concurrency-control
https://medium.com/bestmile/optimistic-concurrency-control-in-http-services-c1bd911b89ad
https://learn.microsoft.com/en-us/azure/cosmos-db/database-transactions-optimistic-concurrency
https://docs.oracle.com/en/database/oracle/oracle-database/26/jsnvu/using-optimistic-concurrency-control-duality-views.html
https://arxiv.org/html/2504.21030v1
https://onereach.ai/blog/mcp-multi-agent-ai-collaborative-intelligence/
https://dev.to/eira-wexford/how-to-build-multi-agent-systems-complete-2026-guide-1io6
https://arxiv.org/html/2601.11595
https://arxiv.org/abs/2504.21030
https://onereach.ai/blog/power-of-multi-agent-ai-open-protocols/
https://onereach.ai/blog/guide-choosing-mcp-vs-a2a-protocols/
https://medium.com/@EleventhHourEnthusiast/advancing-multi-agent-systems-through-model-context-protocol-architecture-implementation-and-5146564bc1ff
https://sealos.io/blog/what-is-mcp
https://www.gravitee.io/blog/mcp-model-context-protocol-agentic-ai
https://workos.com/blog/mcp-features-guide
https://codilime.com/blog/model-context-protocol-explained/
https://www.analytical-software.de/en/the-model-context-protocol-mcp-deep-dive-into-structure-and-concepts/
http://blog.modelcontextprotocol.io/posts/2025-11-25-first-mcp-anniversary/
https://medium.com/@Scoper/model-context-protocol-for-dummies-explained-by-a-dummie-80133b236631
https://www.elastic.co/search-labs/blog/mcp-current-state
https://medium.com/@puneetsharma41/mcp-client-concepts-how-elicitation-sampling-and-roots-make-ai-agents-responsible-5f02a0666d9a
https://github.com/modelcontextprotocol/python-sdk
https://www.kubiya.ai/blog/model-context-protocol-mcp-architecture-components-and-workflow
https://modelcontextprotocol.io/specification/2025-11-25/server
https://modelcontextprotocol.io/specification/2025-11-25/server/resources
https://gist.github.com/didier-durand/2970be82fec6c84d522f7953ac7881b4
https://github.blog/changelog/2025-10-29-github-mcp-server-now-comes-with-server-instructions-better-tools-and-more/
https://docs.github.com/en/copilot/how-tos/provide-context/use-mcp/set-up-the-github-mcp-server
https://docs.github.com/en/copilot/how-tos/provide-context/use-mcp/use-the-github-mcp-server
https://pypi.org/project/mcp-atlassian/
https://pypi.org/project/mcp-jira-confluence/
https://github.com/atlassian/atlassian-mcp-server
https://www.atlassian.com/blog/announcements/remote-mcp-server
https://www.atlassian.com/platform/remote-mcp-server
https://lobehub.com/mcp/akhilthomas236-mcp-jira-confluence
https://www.workato.com/the-connector/jira-mcp/
https://hub.docker.com/r/mcp/atlassian
https://support.atlassian.com/atlassian-rovo-mcp-server/docs/use-atlassian-rovo-mcp-server/
https://mcp-atlassian.soomiles.com/docs
https://www.byteplus.com/en/topic/542220?title=mcp-optimistic-concurrency-definition-best-practices
https://www.sqlpassion.at/archive/2025/01/16/understanding-concurrency-control-in-sql-server-and-postgresql-a-comparative-analysis/
https://systemdesignschool.io/blog/optimistic-locking
https://github.com/Dicklesworthstone/mcp_agent_mail
https://www.coditation.com/blog/implementing-concurrent-data-updates-with-optimistic-locking
https://mcpagentmail.com/
https://medium.com/@sumit-s/optimistic-locking-concurrency-control-with-a-version-column-2e3db2a8120d
https://developers.notion.com/guides/mcp/mcp
https://developers.notion.com/docs/mcp
https://www.notion.com/help/notion-mcp
https://developers.notion.com/docs/get-started-with-mcp
https://www.notion.com/blog/notions-hosted-mcp-server-an-inside-look
https://github.com/makenotion/notion-mcp-server
https://github.com/mcp/makenotion/notion-mcp-server
https://github.com/makenotion/notion-mcp-server/issues/142
https://github.com/makenotion/notion-mcp-server/issues/139
https://github.com/makenotion/notion-mcp-server/issues/153
https://github.com/LNS2905/mcp-beads-village
https://lobehub.com/mcp/lns2905-mcp-beads-village
https://www.npmjs.com/package/beads-village
https://mcpstore.co/server/6937bc90944e98de2334326c
https://github.com/steveyegge/beads
https://github.com/steveyegge/beads/blob/main/integrations/beads-mcp/README.md
https://steve-yegge.medium.com/beads-best-practices-2db636b9760c
https://github.com/vanzan01/atomic-writer-mcp
https://modelcontextprotocol.io/specification/2025-03-26/server/resources
https://github.com/modelcontextprotocol/modelcontextprotocol/discussions/1192
https://portkey.ai/blog/mcp-message-types-complete-json-rpc-reference-guide/
https://github.com/orgs/modelcontextprotocol/discussions/391
https://modelcontextprotocol.info/docs/concepts/resources/
https://dev.to/portkey/mcp-message-types-complete-mcp-json-rpc-reference-guide-3gja
https://www.speakeasy.com/mcp/tool-design/dynamic-tool-discovery
https://github.com/hesreallyhim/mcp-observer-server
https://ankitmundada.medium.com/mcp-has-notifications-so-why-cant-your-agent-watch-your-inbox-bb688fde7ac5
https://www.pulsemcp.com/posts/mcp-client-capabilities-gap
http://blog.modelcontextprotocol.io/posts/2026-mcp-roadmap/
https://modelcontextprotocol.io/development/roadmap
https://modelcontextprotocol.info/blog/mcp-next-version-update/
https://www.tmdevlab.com/mcp-server-performance-benchmark.html
https://mcpcat.io/guides/configuring-mcp-servers-multiple-simultaneous-connections/
https://www.getknit.dev/blog/the-future-of-mcp-roadmap-enhancements-and-whats-next
https://github.com/modelcontextprotocol
https://cyberpress.org/best-mcp-servers/
https://cloud.google.com/blog/topics/developers-practitioners/announcing-the-mcp-toolbox-java-sdk
https://github.com/modelcontextprotocol/modelcontextprotocol/issues/1686
https://modelcontextprotocol.io/community/seps/1686-tasks
https://github.com/modelcontextprotocol/modelcontextprotocol/pull/1732
https://medium.com/@ai_transfer_lab/why-your-mcp-agent-keeps-timing-out-and-the-fix-that-just-shipped-ad9cb130f8c4
https://aws.amazon.com/blogs/opensource/shaping-the-future-of-mcp-aws-commitment-and-vision/
https://workos.com/blog/mcp-2025-11-25-spec-update
https://agentexperience.ax/concepts/model-context-protocol/
https://modelcontextprotocol.io/specification/2025-06-18/server/resources
https://obot.ai/resources/learning-center/mcp-tools/
https://mcpindotnet.github.io/docs/concepts/server-concepts/resources/
https://www.speakeasy.com/mcp/core-concepts/resources
https://modelcontextprotocol.info/specification/draft/basic/versioning/
https://github.com/modelcontextprotocol/modelcontextprotocol/issues/1400
https://github.com/cyanheads/model-context-protocol-resources/blob/main/guides/mcp-server-development-guide.md
https://docs.spring.io/spring-ai/reference/api/mcp/mcp-annotations-server.html
https://engineering.leanix.net/blog/mcp-resources/
https://github.com/rinadelph/Agent-MCP
https://arxiv.org/html/2601.11595v1
https://github.com/claudioed/agent-blackboard
https://github.com/lastmile-ai/mcp-agent
https://github.com/gilbarbara/agent-hub-mcp
https://www.arxiv.org/pdf/2601.11595
https://medium.com/@dp2580/building-intelligent-multi-agent-systems-with-mcps-and-the-blackboard-pattern-to-build-systems-a454705d5672
https://github.com/grupa-ai/agent-mcp
https://arxiv.org/abs/2601.13671
https://arxiv.org/html/2601.13671v1
https://arxiv.org/html/2602.15055
https://arxiv.org/html/2505.02279v1
https://github.com/TheodorStorm/brainstorm-mcp
https://mcpservers.org/servers/theodorstorm/brainstorm-mcp
https://www.jeeva.ai/blog/multi-agent-coordination-playbook-(mcp-ai-teamwork)-implementation-plan
https://mcpservers.org/servers/spranab/brainstorm-mcp
https://www.notion.com/help/guides/connect-custom-agents-to-mcp-integrations
https://www.creolestudios.com/mcp-ai-multi-agent-collaboration/
https://techcommunity.microsoft.com/blog/azuredevcommunityblog/orchestrating-multi-agent-intelligence-mcp-driven-patterns-in-agent-framework/4462150
https://dev.to/codanyks/agent-to-agent-communication-via-mcp-1imj
https://www.pulsemcp.com/servers/modelcontextprotocol-knowledge-graph-memory
https://github.com/doobidoo/mcp-memory-service
https://www.falkordb.com/blog/mcp-knowledge-graph-graphiti-falkordb/
https://github.com/shaneholloman/mcp-knowledge-graph
https://glama.ai/mcp/servers/AVIDS2/memorix
https://playbooks.com/mcp/modelcontextprotocol-knowledge-graph-memory
https://glama.ai/mcp/servers/categories/knowledge-and-memory
https://www.getzep.com/product/knowledge-graph-mcp/
https://neo4j.com/developer/genai-ecosystem/model-context-protocol-mcp/
https://mcpservers.org/servers/modelcontextprotocol/memory
https://linear.app/changelog/2025-05-01-mcp
https://github.com/jerhadf/linear-mcp-server
https://www.builder.io/blog/linear-mcp-server
https://linear.app/changelog
https://lobehub.com/mcp/lucitra-linear-mcp
https://glama.ai/mcp/servers/vinayak-mehta/linear-mcp
https://apidog.com/blog/linear-mcp-server/
https://www.pulsemcp.com/servers/linear
https://drdroid.io/integration-diagnosis-knowledge/jira-error-409---conflict
https://drdroid.io/integration-diagnosis-knowledge/confluence-error-409--conflict
https://github.com/akhilthomas236/mcp-jira-confluence-sse
https://github.com/cyanheads/git-mcp-server/pulls
https://github.com/cyanheads/git-mcp-server/releases/tag/v1.2.4
https://github.com/cyanheads/git-mcp-server/issues
https://mcp.so/server/git-mcp-server
https://www.npmjs.com/package/@cyanheads/git-mcp-server
https://www.npmjs.com/package/@mseep/git-mcp-server
https://lobehub.com/mcp/cyanheads-git-mcp-server
https://github.com/cyanheads/git-mcp-server/blob/main/bunfig.toml
https://github.com/cyanheads/git-mcp-server/blob/main/tsdoc.json
https://dev.to/daichikudo/fixing-claude-codes-concurrent-session-problem-implementing-memory-mcp-with-sqlite-wal-mode-o7k
https://felix-pappe.medium.com/breaking-isolation-a-practical-guide-to-building-an-mcp-server-with-sqlite-68c800a25d42
https://www.philschmid.de/mcp-example-llama
https://www.w3resource.com/sqlite/snippets/sqlite-anthropics-mcp.php
https://en.paperblog.com/how-we-built-an-mcp-server-that-migrates-wordpress-sites-to-astro-automatically-8048704/
https://ajay-arunachalam08.medium.com/anthropics-claude-agents-simple-demo-of-building-powerful-ai-multi-agents-using-claude-model-3945fb7d13f2
https://skywork.ai/skypage/en/anthropic-sqlite-mcp-server-ai-engineers/1977590535559376896
https://openliberty.io/blog/2025/10/23/mcp-standalone-blog.html
https://medium.com/@dave-patten/mcps-next-phase-inside-the-november-2025-specification-49f298502b03
https://blog.marcnuri.com/mcp-tool-annotations-introduction
https://csharp.sdk.modelcontextprotocol.io/api/ModelContextProtocol.Protocol.Tool.html
https://github.com/awslabs/mcp/issues/671
https://deepwiki.com/IBM/ibmi-mcp-server/4.6-tool-annotations-and-metadata
https://datasciencedojo.com/blog/guide-to-model-context-protocol/
https://docs.quarkiverse.io/quarkus-mcp-server/dev/reference-annotations.html
https://developers.openai.com/apps-sdk/plan/tools/
https://mcpcat.io/guides/adding-custom-tools-mcp-server-python/
https://github.com/modelcontextprotocol/modelcontextprotocol/issues/1302
https://github.com/modelcontextprotocol/modelcontextprotocol/issues/2085
https://github.com/modelcontextprotocol/modelcontextprotocol/issues/1730
https://github.com/modelcontextprotocol/modelcontextprotocol/issues/2133
https://github.com/modelcontextprotocol/modelcontextprotocol/pull/1932
https://github.com/modelcontextprotocol/modelcontextprotocol/pull/1933
https://xaa.dev
https://vosbek.github.io/enterprise-mcp-documentation/quick-start
https://vosbek.github.io/enterprise-mcp-documentation/servers/sharepoint
https://vosbek.github.io/enterprise-mcp-documentation/best-practices
https://vosbek.github.io/enterprise-mcp-documentation/servers/github
https://vosbek.github.io/enterprise-mcp-documentation/servers/servicenow
https://vosbek.github.io/enterprise-mcp-documentation/servers/backstageio
https://vosbek.github.io/enterprise-mcp-documentation/servers/context7
https://vosbek.github.io/enterprise-mcp-documentation/troubleshooting
https://vosbek.github.io/enterprise-mcp-documentation/servers/jira
https://embracethered.com/blog/posts/2025/anthropic-filesystem-mcp-server-bypass/
https://siliconangle.com/2026/01/20/anthropics-official-git-mcp-server-hit-chained-flaws-enable-file-access-code-execution/
https://github.blog/2015-10-20-git-concurrency-in-github-desktop/
https://apidog.com/blog/top-10-mcp-servers-for-git-tools/
https://github.com/microsoft/mcp
https://dev.to/devolivers/i-built-a-github-mcp-server-in-20-minutes-and-never-pasted-a-token-again-2ehj
https://mcpservers.org/servers/ildunari/Github-MCP
https://mcp.aibase.com/server/1552741640140234769
https://mcpmarket.com/server/agent-mail
https://github.com/steveyegge/mcp_agent_mail
https://glama.ai/mcp/servers/@OmelchMichael/mcp_agent_mail
https://www.jeffreyemanuel.com/projects/mcp-agent-mail
https://github.com/crystaldba/postgres-mcp/blob/main/README.md
https://github.com/crystaldba/postgres-mcp/releases
https://github.com/crystaldba/postgres-mcp/pulls
https://github.com/crystaldba
https://github.com/crystaldba/postgres-mcp/graphs/contributors
https://en.wikipedia.org/wiki/Conflict-free_replicated_data_type
https://www.iankduncan.com/engineering/2025-11-27-crdt-dictionary/
https://crdt.tech/
https://arxiv.org/html/2409.09934v1
https://dev.to/puritanic/building-collaborative-interfaces-operational-transforms-vs-crdts-2obo
https://hackernoon.com/crdts-vs-operational-transformation-a-practical-guide-to-real-time-collaboration
https://mattweidner.com/2025/05/21/text-without-crdts.html
https://www.tiny.cloud/blog/real-time-collaboration-ot-vs-crdt/
https://dl.acm.org/doi/full/10.1145/3695249
https://ewinnington.github.io/posts/learn-from-chatgpt-Crdt-OT
https://systemdr.substack.com/p/crdts-vs-operational-transformation
https://codefarm0.medium.com/building-collaborative-document-editor-real-time-synchronization-crdts-and-conflict-resolution-4743436639f5
https://mljourney.com/implementing-mcp-in-multi-agent-ai-platforms/
https://strapi.io/blog/what-is-mcp
https://www.qodo.ai/blog/what-is-mcp-server/
https://gist.github.com/ruvnet/9b066e77dd2980bfdcc5adf3bc082281
https://www.magicslides.app/mcps/freepeak-db-connector
https://mcpserver.so/servers/Data%2FDatabases/FreePeak-db-mcp-server-multi-database-mcp-server
https://www.augmentcode.com/mcp/db-mcp-server
https://pkg.go.dev/github.com/FreePeak/db-mcp-server
https://glama.ai/mcp/servers/@FreePeak/db-mcp-server
https://playbooks.com/mcp/crystaldba/postgres-mcp
https://agnost.ai/blog/long-running-tasks-mcp/
https://modelcontextprotocol.io/community/seps/1686-tasks
https://docs.atlassian.com/atlassian-confluence/6.6.0/com/atlassian/confluence/api/service/exceptions/ConflictException.html
https://community.atlassian.com/forums/Confluence-questions/HTTP-error-409-with-REST-API/qaq-p/797717
https://community.developer.atlassian.com/t/undocumented-409-response-for-addons-rest-endpoint/3590
https://github.com/kovetskiy/mark/issues/139
https://www.pulsemcp.com/servers/crystaldba-postgres
https://github.com/modelcontextprotocol/servers/issues/3402
https://dev.to/nickytonline/quick-fix-my-mcp-tools-were-showing-as-write-tools-in-chatgpt-dev-mode-3id9
https://www.jetbrains.com/help/youtrack/devportal/custom-ai-tools.html
https://modelcontextprotocol.io/llms.txt
https://www.pulsemcp.com/servers/dicklesworthstone-agent-mail
https://pypi.org/project/mcp-agent-mail/
https://github.com/Dicklesworthstone/mcp_agent_mail/blob/main/README.md
https://www.viktor.ai/blog/196/how-engineers-can-use-ai-agents-and-mcp-servers-to-work-smarter
```
