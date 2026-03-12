# Bootstrap Protocol Research: How Agents Discover System State on Session Start

**Research iteration:** 1
**Date:** 2026-03-12
**Focus:** The "bootstrap problem" -- how the first agent in a session discovers what's in flight, who has authority over what, what tasks are active, and what state everything is in.

---

## Key Discoveries

### 1. Game Client Connection: The Zero-Baseline Snapshot Pattern

When a game client connects to a running server mid-match, the server must transfer the current world state. The dominant pattern across Quake 3, Source Engine, and modern netcode is the **zero-baseline snapshot**:

- The server maintains a "dummy gamestate with every single field set to zero" as the initial reference point. When no acknowledged snapshot exists for a client, the server delta-encodes the current state against this all-zeros baseline -- effectively sending a **full state dump** on first connection. ([Quake 3 Source Code Review: Network Model](https://fabiensanglard.net/quake3/network.php))

- The server keeps the last 32 snapshots per client in a ring buffer. Delta compression encodes each snapshot relative to the **most recently acknowledged** baseline. On first connection, with no ack history, the delta is against zeros -- meaning every field gets transmitted. ([Snapshot Compression - Gaffer On Games](https://gafferongames.com/post/snapshot_compression/))

- "For one round trip time past initial connection the sender doesn't have any baseline to encode against because it hasn't received an ack from the receiver yet." The solution: a flag indicating the snapshot uses "the initial state of the simulation" as reference. Alternatively, send initial state through a non-delta path as one large data block, then switch to delta encoding once acknowledged. ([Snapshot Compression - Gaffer On Games](https://gafferongames.com/post/snapshot_compression/))

- During connection time, "large packets (up to 1.4K) are typically needed when a large amount of game state must be sent at once." This is expected and acceptable as a one-time cost. ([Quake 3 Network Protocol](https://www.jfedor.org/quake3/))

**Implication for Sherpa:** The bootstrap payload is a one-time cost, not a recurring expense. A `get_system_state` tool that returns the full coordination state on session start is the equivalent of the zero-baseline snapshot. Subsequent updates can be deltas (resource subscriptions for authority changes, task completions, etc.).

---

### 2. Interest Management: Not All State is Relevant

MMO servers never send ALL world state to a connecting client -- they send what's relevant to the client's position/role. This is **interest management**:

- **Zone-based (Area of Interest):** The world is divided into rectangular, circular, or hexagonal zones. When a player connects or transitions between zones, the server "fetches all the game objects present in these new AOIs and sends them to the client, so that they can be created in the client's view of the game state." Only nearby entities are relevant. ([Interest Management for Multiplayer Online Games - Dynetis](https://www.dynetisgames.com/2017/04/05/interest-management-mog/))

- **Priority accumulator:** The server calculates priorities for all objects each frame. A persistent float accumulates priority over time. Objects that haven't been sent recently accumulate higher priority and get sent first. This ensures nothing is permanently starved. ([State Synchronization - Gaffer On Games](https://gafferongames.com/post/state_synchronization/))

- Interest management can reduce update messages by **up to a factor of 6** compared to broadcasting everything. ([Comparing Interest Management Algorithms - ACM](https://dl.acm.org/doi/10.1145/1230040.1230069))

- The same bootstrap-and-transition mechanism handles both initial connection and zone transitions: both require pulling entity state from newly-relevant regions. ([Dynetis](https://www.dynetisgames.com/2017/04/05/interest-management-mog/))

**Implication for Sherpa:** The bootstrap payload should be scoped by agent role. A Worker agent dispatched to task X needs: its task description, authority lease for its target files, recent activity on those files, and any blocked/blocking dependencies. It does NOT need: all other active tasks, authority state for unrelated files, or the full initiative history. The DOI model from the MMO patterns initiative (LOD 0/1/2) applies directly to bootstrap payloads.

---

### 3. MCP Server Initialization: The Handshake Has an Instructions Field

The MCP protocol lifecycle provides specific mechanisms relevant to bootstrap:

- **Initialize handshake:** Client sends `initialize` request with capabilities; server responds with its capabilities, serverInfo, and an **`instructions` field** -- "Optional instructions for the client." This is a free-text string that can contain operational context. ([MCP Lifecycle Specification](https://modelcontextprotocol.io/specification/2025-06-18/basic/lifecycle))

- **Capability negotiation:** The server declares `tools: { listChanged: true }`, `resources: { subscribe: true, listChanged: true }`. After initialization, the client calls `tools/list` and `resources/list` to discover available capabilities. ([MCP Lifecycle Specification](https://modelcontextprotocol.io/specification/2025-06-18/basic/lifecycle))

- **Resource subscriptions:** Clients can subscribe to specific resources via `resources/subscribe`. The server pushes `notifications/resources/updated` when subscribed resources change. The client then re-reads the resource. ([MCP Resources Specification](https://modelcontextprotocol.io/specification/2025-06-18/server/resources))

- **Resource annotations** include `audience` (user/assistant), `priority` (0.0-1.0), and `lastModified` -- enabling clients to filter and prioritize which resources to include in context. ([MCP Resources Specification](https://modelcontextprotocol.io/specification/2025-06-18/server/resources))

- **No server-push at init time.** The server SHOULD NOT send requests other than pings and logging before receiving the `initialized` notification. The client must actively pull state via tool calls or resource reads. ([MCP Lifecycle Specification](https://modelcontextprotocol.io/specification/2025-06-18/basic/lifecycle))

- **SSE deprecated in favor of Streamable HTTP.** As of March 2025, MCP deprecated HTTP+SSE transport. Streamable HTTP enables bidirectional communication on a single endpoint (`/mcp`). Servers can send notifications and request additional information from clients on the same connection. ([Auth0 - Why MCP Moved Away from SSE](https://auth0.com/blog/mcp-streamable-http/))

**Implication for Sherpa:** The MCP `instructions` field in the initialize response is the natural place for a brief system state summary ("3 active tasks, 2 authority leases, 1 blocked item"). But it's static per connection -- it can't adapt to the agent's role. The real bootstrap comes from the agent calling a `get_dashboard` tool immediately after connection, which returns role-scoped state. Resource subscriptions handle ongoing updates after bootstrap.

---

### 4. Claude Code SessionStart Hooks: The Bootstrap Trigger

Claude Code provides a native mechanism for injecting context at session start:

- **SessionStart hook** fires when a session begins or resumes. It supports matchers: `startup` (new session), `resume` (--resume/--continue), `clear` (/clear), `compact` (auto or manual compaction). ([Claude Code Hooks Reference](https://code.claude.com/docs/en/hooks))

- **Stdout becomes context:** "For SessionStart, stdout is added as context that Claude can see and act on." Any text the hook prints is injected into the conversation. Additionally, JSON output can include `hookSpecificOutput.additionalContext` for structured injection. ([Claude Code Hooks Reference](https://code.claude.com/docs/en/hooks))

- **Environment persistence:** SessionStart hooks have access to `CLAUDE_ENV_FILE` for persisting environment variables across Bash commands. ([Claude Code Hooks Reference](https://code.claude.com/docs/en/hooks))

- **Fires on compact too.** The `compact` matcher means the hook fires after context compaction -- crucial for re-injecting state that was lost during summarization. ([Claude Code Hooks Reference](https://code.claude.com/docs/en/hooks))

- **Only command hooks supported.** SessionStart only supports `type: "command"` hooks, not HTTP, prompt, or agent hooks. The command runs fast and synchronously. ([Claude Code Hooks Reference](https://code.claude.com/docs/en/hooks))

- **Cannot call MCP tools directly.** SessionStart hooks execute shell commands, not MCP tool calls. However, a shell command could `curl` the MCP server's Streamable HTTP endpoint directly, or read a cached state file that the MCP server maintains.

**Implication for Sherpa:** The bootstrap protocol has TWO entry points: (1) the SessionStart hook, which can inject a cached system summary from a file the MCP server maintains, and (2) the agent's first action after starting, which should be calling a `get_dashboard` MCP tool for fresh, role-scoped state. The hook provides a "warm cache" (fast, possibly stale); the tool call provides the authoritative current state.

---

### 5. Agent Context Reconstruction: The Handoff Protocol Pattern

Multiple frameworks have converged on similar patterns for session recovery:

- **Three-layer persistence** (Dev.to patterns article): (1) Working State (volatile, in-memory), (2) Event Memory (append-only audit trail), (3) Identity/Config (slow-changing). Session recovery follows a **priority-chain boot sequence**: check for crash recovery/incomplete handoffs first, process queued messages, load current working state, scan historical memory only if needed. ([Persistence Patterns for AI Agents - DEV](https://dev.to/aureus_c_b3ba7f87cc34d74d49/persistence-patterns-for-ai-agents-that-survive-restarts-59ck))

- **Handoff protocol as hot start.** "A handoff protocol captures 'what was in progress,' 'what was decided,' and 'what needs attention next.' Save only critical path information, not everything." The anti-pattern is loading all context before doing anything -- the handoff provides a hot start, not a cold start. ([Persistence Patterns for AI Agents - DEV](https://dev.to/aureus_c_b3ba7f87cc34d74d49/persistence-patterns-for-ai-agents-that-survive-restarts-59ck))

- **Git-as-persistence (Beads pattern).** "If it's in git, it survives compaction." The Beads system uses SQLite locally + JSONL exports synced via a dedicated git branch, with git hooks for automatic synchronization. Recovery time: "less than 30 seconds" vs "5-10 minutes" without it. ([Building Post-Compaction Recovery with Beads](https://startaitools.com/posts/building-post-compaction-recovery-for-ai-agent-workflows-with-beads/))

- **Koog framework checkpoints.** Captures "complete state of an agent at a specific point: message history, current node, input data, timestamp." Two rollback strategies: full (restores exact execution point) or MessageHistoryOnly (restores conversation but restarts from initial node). ([Koog Agent Persistence](https://docs.koog.ai/agent-persistence/))

- **Context window is the fundamental constraint.** "Context windows reset with each API request, making external memory infrastructure essential for true conversational continuity." The critical architectural insight: context must be externalized, not held in the conversation. ([Redis AI Agent Memory](https://redis.io/blog/ai-agent-memory-stateful-systems/))

**Implication for Sherpa:** Sherpa's `activity.md` files are a form of handoff protocol. But they're human-written and not machine-optimized for bootstrap. The MCP coordination server should maintain a structured handoff record per agent that's machine-readable and contains exactly the critical path information needed for the next session.

---

### 6. Shared Context Store: The Blackboard Pattern

The CA-MCP (Context-Aware MCP) paper proposes a **Shared Context Store (SCS)** that functions as "a centralized blackboard for coordination, providing a single source of truth for task state, constraints, and intermediate outputs."

- The central LLM performs initial planning and final summarization only (approximately two invocations per workflow). Between these, MCP servers "operate as collaborative agents that continuously read from and write to the shared context." ([Enhancing MCP with Context-Aware Server Collaboration - arXiv:2601.11595](https://arxiv.org/html/2601.11595v2))

- Servers behave as "stateful reactors" that monitor the SCS for relevant triggers, read current context, perform computation, update the store, and signal readiness. ([arXiv:2601.11595](https://arxiv.org/html/2601.11595v2))

- Claude Flow / Ruflo implements a similar blackboard: "agents coordinate through a shared blackboard, checkpoint long horizon workflows, and gate releases with consensus." Uses SQLite at `.swarm/memory.db` for durable state. ([Ruflo GitHub](https://github.com/ruvnet/ruflo))

**Implication for Sherpa:** The SQLite-backed MCP server IS the shared context store. The bootstrap tool reads from this store. The blackboard pattern means all coordination state is queryable from a single location, which makes the bootstrap payload straightforward to assemble.

---

### 7. Claude Code Agent Teams: The Existing Coordination Model

Claude Code's Agent Teams feature (shipped Feb 2026 with Opus 4.6) provides a reference implementation for multi-agent coordination:

- **Shared task list** with dependency tracking. Tasks have states: pending, in progress, completed. Blocked tasks auto-unblock when dependencies complete. Task claiming uses **file locking** to prevent race conditions. ([Claude Code Agent Teams Docs](https://code.claude.com/docs/en/agent-teams))

- **Team config stored at** `~/.claude/teams/{team-name}/config.json` with `members` array. Task list at `~/.claude/tasks/{team-name}/`. Teammates can read config to discover other team members. ([Claude Code Agent Teams Docs](https://code.claude.com/docs/en/agent-teams))

- **Context at spawn:** Teammates load the same project context as a regular session (CLAUDE.md, MCP servers, skills) plus the spawn prompt from the lead. **The lead's conversation history does NOT carry over.** ([Claude Code Agent Teams Docs](https://code.claude.com/docs/en/agent-teams))

- **No session resumption for in-process teammates.** After resuming, the lead may attempt to message teammates that no longer exist. The workaround: tell the lead to spawn new teammates. ([Claude Code Agent Teams Docs](https://code.claude.com/docs/en/agent-teams))

- **TeammateIdle hook:** Runs when a teammate is about to go idle. Exit code 2 sends feedback and keeps the teammate working. **TaskCompleted hook:** Runs when a task is being marked complete. Exit code 2 prevents completion with feedback. ([Claude Code Agent Teams Docs](https://code.claude.com/docs/en/agent-teams))

**Implication for Sherpa:** Agent Teams already solves a simpler version of the bootstrap problem -- teammates get project context + spawn prompt, but no conversation history. Sherpa's coordination server needs to provide what's MISSING from this: authority state, task assignment history, progress on related tasks, and any handoff notes from the previous session holder.

---

### 8. Lease Expiration and Stale Authority Reclamation

Distributed systems use time-bounded leases (not locks) precisely because lease holders can crash without releasing:

- **Automatic expiration is the core feature.** "If the client occupying the lock is unable to release the lock actively due to a failure, the Lease mechanism ensures that the corresponding key-value will be deleted automatically to release the current lock after the expiration of the lease." ([CNCF - Mechanism and Implementation of Lease](https://www.cncf.io/blog/2023/11/01/mechanism-and-implementation-of-lease/))

- **Heartbeat renewal.** "The node that owns the lease periodically refreshes it. HeartBeat is used by clients to refresh the time-to-live value." When heartbeats stop (agent crash/disconnect), the lease naturally expires. ([Patterns of Distributed Systems - Lease](https://martinfowler.com/articles/patterns-of-distributed-systems/lease.html))

- **Post-crash recovery at the server.** "If the server crashes and restarts, it must remember all the leases it granted before. The server durably records only the maximum expiration time. When it restarts, it waits for that maximum expiration to pass before granting new leases." ([O'Reilly - Patterns of Distributed Systems Ch. 26](https://www.oreilly.com/library/view/patterns-of-distributed/9780138222246/ch26.xhtml))

- **Kea DHCP as implementation reference.** The server "periodically detect and reclaim expired leases" with configurable reclamation intervals and batch sizes. ([Kea Lease Expiration Docs](https://kea.readthedocs.io/en/kea-2.2.0/arm/lease-expiration.html))

- **The Grantor pattern.** "The Grantor ensures that when a lease expires on one node, the authority can be safely passed to the next waiting node, maintaining system continuity." ([Substack - Why Distributed Systems Prefer Leases](https://engineersmeetai.substack.com/p/why-distributed-systems-prefer-leases))

**Implication for Sherpa:** The MCP coordination server's periodic reaper (already proposed at 30min interactive, 10min workers) handles stale authority automatically. A new session doesn't need to "reclaim" leases from a crashed predecessor -- it just needs to wait for expiry (or use the human `override_authority` break operation for urgent cases). The bootstrap tool should report any leases held by the current agent_id that are still valid but unattended, so the agent can decide whether to renew or release them.

---

## The Bootstrap Protocol Design

Based on all research, the bootstrap protocol should have three layers:

### Layer 1: SessionStart Hook (Warm Cache)
A shell command that reads a cached state summary file maintained by the MCP server:
```
.sherpa/state/dashboard-{agent_role}.json
```
This file is regenerated on every state mutation. The hook injects it as `additionalContext`. Fast, possibly slightly stale, provides immediate orientation.

### Layer 2: `get_dashboard` MCP Tool (Fresh, Role-Scoped State)
The agent's first action. Returns structured JSON:
```json
{
  "agent_id": "worker-17",
  "role": "worker",
  "my_tasks": [
    { "id": "task-42", "status": "in_progress", "title": "...", "target_files": [...] }
  ],
  "my_authority_leases": [
    { "scope": "src/auth/", "expires_in": "22m", "fence_token": 47 }
  ],
  "blocked_by": [],
  "recent_activity": [
    { "agent": "planner-1", "action": "dispatched task-42 to worker-17", "at": "..." }
  ],
  "system_summary": {
    "active_tasks": 5,
    "active_leases": 3,
    "pending_proposals": 2,
    "agents_online": 4
  }
}
```
Scoped by role: workers see their tasks + blocking dependencies; planners see all tasks + authority map; judges see recent completions pending review.

### Layer 3: Resource Subscriptions (Ongoing Delta Updates)
After bootstrap, subscribe to:
- `authority://my-scopes` -- changes to authority over files I care about
- `tasks://my-assignments` -- new tasks assigned, status changes
- `activity://my-initiative` -- relevant activity from other agents

This is the delta encoding phase -- only changes after the initial snapshot.

---

## Sources

### Game Server Architecture
- [Snapshot Compression - Gaffer On Games](https://gafferongames.com/post/snapshot_compression/) -- Delta compression, zero-baseline pattern, acknowledgment-based encoding
- [State Synchronization - Gaffer On Games](https://gafferongames.com/post/state_synchronization/) -- Priority accumulator, jitter buffers, bandwidth management
- [Quake 3 Source Code Review: Network Model](https://fabiensanglard.net/quake3/network.php) -- Ring buffer snapshots, dummy gamestate baseline, delta encoding
- [Quake 3 Network Protocol](https://www.jfedor.org/quake3/) -- Connection-time large packets, protocol details
- [Interest Management for MOGs - Dynetis](https://www.dynetisgames.com/2017/04/05/interest-management-mog/) -- Zone-based AOI, handleAOItransition, relevance filtering
- [Interest Management Thesis - McGill University](https://www.cs.mcgill.ca/~jboula2/thesis.pdf) -- Comprehensive survey of interest management algorithms
- [Comparing Interest Management Algorithms - ACM](https://dl.acm.org/doi/10.1145/1230040.1230069) -- 6x reduction in updates with interest management
- [MMO Game Server Application Protocol - DEV](https://dev.to/aceld/13-mmo-game-server-application-protocol-5adl) -- Frame vs state synchronization approaches
- [Game Server Synchronization - Monstarlab](https://engineering.monstar-lab.com/en/post/2021/02/09/Game-server-Synchronization/) -- Battle data synchronization techniques
- [Delta Encoding Snapshots + Scope/Priority - GameDev.net](https://www.gamedev.net/forums/topic/676447-delta-encoding-snapshots-scopepriority/) -- Combining delta encoding with priority systems
- [Netcode Series Part 2: Data Channels - Medium](https://medium.com/@geretti/netcode-series-part-2-data-channels-c12e9a238800) -- Snapshot and RPC channel architecture
- [Netcode Architectures Part 3: Snapshot Interpolation - SnapNet](https://www.snapnet.dev/blog/netcode-architectures-part-3-snapshot-interpolation/) -- Snapshot interpolation fundamentals
- [Cluster-Optimized MMO Server Protocol - Stanford](https://www.scs.stanford.edu/17au-cs244b/labs/projects/kislyuk_zhai.pdf) -- Quadtree-based inter-server sync
- [Quake 3 Networking - bookofhook](http://trac.bookofhook.com/bookofhook/trac.cgi/wiki/Quake3Networking) -- Detailed Quake 3 networking model analysis

### MCP Protocol
- [MCP Lifecycle Specification (2025-06-18)](https://modelcontextprotocol.io/specification/2025-06-18/basic/lifecycle) -- Initialize handshake, instructions field, capability negotiation
- [MCP Resources Specification (2025-06-18)](https://modelcontextprotocol.io/specification/2025-06-18/server/resources) -- Resource listing, reading, templates, subscriptions, annotations
- [MCP Tools Specification (2025-06-18)](https://modelcontextprotocol.io/specification/2025-06-18/server/tools) -- Tool discovery and invocation
- [MCP Protocol Mechanics - Pradeep Loganathan](https://pradeepl.com/blog/model-context-protocol/mcp-protocol-mechanics-and-architecture/) -- JSON-RPC protocol details
- [MCP Message Types - Portkey](https://portkey.ai/blog/mcp-message-types-complete-json-rpc-reference-guide/) -- Complete JSON-RPC reference
- [MCP Features Guide - WorkOS](https://workos.com/blog/mcp-features-guide) -- Resources, tools, prompts, sampling, elicitation comparison
- [MCP Notifications Discussion - GitHub](https://github.com/modelcontextprotocol/modelcontextprotocol/discussions/1192) -- Best practices for handling server notifications
- [Why MCP Deprecated SSE - Auth0](https://auth0.com/blog/mcp-streamable-http/) -- Streamable HTTP transport explanation
- [MCP Has Notifications - Medium](https://ankitmundada.medium.com/mcp-has-notifications-so-why-cant-your-agent-watch-your-inbox-bb688fde7ac5) -- Notification limitations analysis
- [MCP Server Development Guide - GitHub](https://github.com/cyanheads/model-context-protocol-resources/blob/main/guides/mcp-server-development-guide.md) -- Development patterns

### Agent Context Recovery
- [Persistence Patterns for AI Agents - DEV](https://dev.to/aureus_c_b3ba7f87cc34d74d49/persistence-patterns-for-ai-agents-that-survive-restarts-59ck) -- Three-layer persistence, handoff protocol, priority-chain boot
- [Building Post-Compaction Recovery with Beads](https://startaitools.com/posts/building-post-compaction-recovery-for-ai-agent-workflows-with-beads/) -- Git-as-persistence, SQLite+JSONL, sub-30s recovery
- [AI Agent Memory Architecture - Redis](https://redis.io/blog/ai-agent-memory-stateful-systems/) -- Five memory types, hydration pipeline, vector retrieval
- [Agent Memory - Dust.tt](https://dust.tt/blog/agent-memory-building-persistence-into-ai-collaboration) -- Memory as optional tool, user-scoped storage
- [Agent Persistence - Koog](https://docs.koog.ai/agent-persistence/) -- Checkpoint capture, rollback strategies, tool side-effect rollback
- [Context Personalization - OpenAI Cookbook](https://cookbook.openai.com/examples/agents_sdk/context_personalization) -- State management with long-term memory
- [Advancing Multi-Agent Systems Through MCP - arXiv:2504.21030](https://arxiv.org/html/2504.21030v1) -- MCP-based context sharing, coordination patterns
- [Enhancing MCP with Context-Aware Server Collaboration - arXiv:2601.11595](https://arxiv.org/html/2601.11595v2) -- Shared Context Store blackboard pattern

### Distributed Coordination
- [Lease Pattern - Martin Fowler](https://martinfowler.com/articles/patterns-of-distributed-systems/lease.html) -- Lease fundamentals, heartbeat renewal
- [Patterns of Distributed Systems Ch. 26 - O'Reilly](https://www.oreilly.com/library/view/patterns-of-distributed/9780138222246/ch26.xhtml) -- Lease expiration, post-crash recovery
- [Why Distributed Systems Prefer Leases - Substack](https://engineersmeetai.substack.com/p/why-distributed-systems-prefer-leases) -- Leases vs locks, Grantor pattern
- [Mechanism and Implementation of Lease - CNCF](https://www.cncf.io/blog/2023/11/01/mechanism-and-implementation-of-lease/) -- Automatic expiration, implementation details
- [Lease Expiration - Kea Docs](https://kea.readthedocs.io/en/kea-2.2.0/arm/lease-expiration.html) -- Periodic reaping, batch reclamation
- [Distributed Failure Detection via Leasing - Sun Patent](https://www.freepatentsonline.com/6760736.html) -- Formal lease-based failure detection

### Claude Code Hooks & Agent Teams
- [Claude Code Hooks Reference](https://code.claude.com/docs/en/hooks) -- All hook events, SessionStart specifics, JSON I/O, matchers
- [Claude Code Session Hooks Guide - ClaudeFa.st](https://claudefa.st/blog/tools/hooks/session-lifecycle-hooks) -- SessionStart practical patterns, context injection
- [Claude Code Session Context - ClaudeFa.st](https://claudefa.st/blog/guide/mechanics/claude-code-session-context) -- Loading different starting context by session
- [Claude Code Agent Teams Docs](https://code.claude.com/docs/en/agent-teams) -- Shared task list, team config, context at spawn, limitations
- [Claude Code Agent Teams Guide 2026 - ClaudeFa.st](https://claudefa.st/blog/guide/agents/agent-teams) -- Comprehensive agent teams guide
- [Claude Code Swarm Orchestration Skill - GitHub Gist](https://gist.github.com/kieranklaassen/4f2aba89594a4aea4ad64d753984b2ea) -- Multi-agent coordination patterns
- [LaunchDarkly Session Start Hook - GitHub](https://github.com/launchdarkly-labs/claude-code-session-start-hook) -- Dynamic context at session start
- [Claude-Mem Hooks Architecture](https://docs.claude-mem.ai/hooks-architecture) -- Memory integration via hooks
- [Claude Code Hooks Mastery - GitHub](https://github.com/disler/claude-code-hooks-mastery) -- Hook patterns and examples

### Multi-Agent Frameworks & Patterns
- [Ruflo / Claude Flow - GitHub](https://github.com/ruvnet/ruflo) -- Multi-agent orchestration with SQLite blackboard, MCP tools
- [AI Agent Orchestration Patterns - Azure](https://learn.microsoft.com/en-us/azure/architecture/ai-ml/guide/ai-agent-design-patterns) -- Enterprise orchestration patterns
- [Multi-Agent Patterns in ADK - Google](https://developers.googleblog.com/developers-guide-to-multi-agent-patterns-in-adk/) -- Google's Agent Development Kit patterns
- [Context-Aware Multi-Agent Framework - Google](https://developers.googleblog.com/architecting-efficient-context-aware-multi-agent-framework-for-production/) -- Structured context objects for handoff
- [Microsoft Agent Framework Handoff](https://learn.microsoft.com/en-us/agent-framework/user-guide/workflows/orchestrations/handoff) -- Handoff orchestration patterns
- [Orchestrating Multi-Agent Intelligence: MCP-Driven Patterns - Microsoft](https://techcommunity.microsoft.com/blog/azuredevcommunityblog/orchestrating-multi-agent-intelligence-mcp-driven-patterns-in-agent-framework/4462150) -- MCP-driven coordination
- [Multi-Agent Reference Architecture Patterns - Microsoft](https://microsoft.github.io/multi-agent-reference-architecture/docs/reference-architecture/Patterns.html) -- Blackboard, market-based, hierarchical patterns

---

## Raw Links

```
https://gafferongames.com/post/snapshot_compression/
https://gafferongames.com/post/state_synchronization/
https://fabiensanglard.net/quake3/network.php
https://www.jfedor.org/quake3/
https://www.dynetisgames.com/2017/04/05/interest-management-mog/
https://www.cs.mcgill.ca/~jboula2/thesis.pdf
https://dl.acm.org/doi/10.1145/1230040.1230069
https://dev.to/aceld/13-mmo-game-server-application-protocol-5adl
https://engineering.monstar-lab.com/en/post/2021/02/09/Game-server-Synchronization/
https://www.gamedev.net/forums/topic/676447-delta-encoding-snapshots-scopepriority/
https://medium.com/@geretti/netcode-series-part-2-data-channels-c12e9a238800
https://www.snapnet.dev/blog/netcode-architectures-part-3-snapshot-interpolation/
https://www.scs.stanford.edu/17au-cs244b/labs/projects/kislyuk_zhai.pdf
http://trac.bookofhook.com/bookofhook/trac.cgi/wiki/Quake3Networking
https://www.sciencedirect.com/science/article/pii/S1389128620313177
https://www.researchgate.net/publication/220937528_The_fun_of_using_TCP_for_an_MMORPG
http://ithare.com/chapter-via-server-side-mmo-architecture-naive-and-classical-deployment-architectures/2/
https://www.linkedin.com/pulse/how-does-any-mmo-games-backend-work-narendra-l
https://gist.github.com/qingwei91/535fa1f6b73062a46d716b741637aa8d
https://news.ycombinator.com/item?id=37963974
https://medium.com/@qingweilim/how-do-multiplayer-games-sync-their-state-part-1-ab72d6a54043
https://medium.com/@qingweilim/how-do-multiplayer-game-sync-their-state-part-2-d746fa303950
https://modelcontextprotocol.io/specification/2025-06-18/basic/lifecycle
https://modelcontextprotocol.io/specification/2025-06-18/server/resources
https://modelcontextprotocol.io/specification/2025-06-18/server/tools
https://pradeepl.com/blog/model-context-protocol/mcp-protocol-mechanics-and-architecture/
https://portkey.ai/blog/mcp-message-types-complete-json-rpc-reference-guide/
https://workos.com/blog/mcp-features-guide
https://github.com/modelcontextprotocol/modelcontextprotocol/discussions/1192
https://auth0.com/blog/mcp-streamable-http/
https://ankitmundada.medium.com/mcp-has-notifications-so-why-cant-your-agent-watch-your-inbox-bb688fde7ac5
https://github.com/cyanheads/model-context-protocol-resources/blob/main/guides/mcp-server-development-guide.md
https://blog.fka.dev/blog/2025-06-06-why-mcp-deprecated-sse-and-go-with-streamable-http/
https://www.mcpevals.io/blog/mcp-server-side-events-explained
https://github.com/orgs/modelcontextprotocol/discussions/337
https://mcp-cloud.ai/docs/sse-protocol/introduction
https://codesignal.com/learn/courses/developing-and-integrating-a-mcp-server-in-python/lessons/exploring-and-exposing-mcp-server-capabilities-tools-resources-and-prompts
https://modelcontextprotocol.info/docs/concepts/resources/
https://modelcontextprotocol.info/docs/concepts/tools/
https://www.philschmid.de/mcp-introduction
https://agentexperience.ax/concepts/model-context-protocol/
https://github.com/modelcontextprotocol/servers
https://dev.to/aureus_c_b3ba7f87cc34d74d49/persistence-patterns-for-ai-agents-that-survive-restarts-59ck
https://startaitools.com/posts/building-post-compaction-recovery-for-ai-agent-workflows-with-beads/
https://redis.io/blog/ai-agent-memory-stateful-systems/
https://dust.tt/blog/agent-memory-building-persistence-into-ai-collaboration
https://docs.koog.ai/agent-persistence/
https://cookbook.openai.com/examples/agents_sdk/context_personalization
https://arxiv.org/html/2504.21030v1
https://arxiv.org/html/2601.11595v2
https://arxiv.org/html/2601.13671v1
https://martinfowler.com/articles/patterns-of-distributed-systems/lease.html
https://www.oreilly.com/library/view/patterns-of-distributed/9780138222246/ch26.xhtml
https://engineersmeetai.substack.com/p/why-distributed-systems-prefer-leases
https://www.cncf.io/blog/2023/11/01/mechanism-and-implementation-of-lease/
https://kea.readthedocs.io/en/kea-2.2.0/arm/lease-expiration.html
https://www.freepatentsonline.com/6760736.html
https://code.claude.com/docs/en/hooks
https://claudefa.st/blog/tools/hooks/session-lifecycle-hooks
https://claudefa.st/blog/guide/mechanics/claude-code-session-context
https://code.claude.com/docs/en/agent-teams
https://claudefa.st/blog/guide/agents/agent-teams
https://gist.github.com/kieranklaassen/4f2aba89594a4aea4ad64d753984b2ea
https://github.com/launchdarkly-labs/claude-code-session-start-hook
https://docs.claude-mem.ai/hooks-architecture
https://github.com/disler/claude-code-hooks-mastery
https://github.com/ruvnet/ruflo
https://github.com/ruvnet/ruflo/wiki/MCP-Tools
https://github.com/ruvnet/ruflo/blob/main/CLAUDE.md
https://github.com/ruvnet/claude-flow/wiki/Agent-System-Overview
https://gist.github.com/ruvnet/9b066e77dd2980bfdcc5adf3bc182281
https://learn.microsoft.com/en-us/azure/architecture/ai-ml/guide/ai-agent-design-patterns
https://developers.googleblog.com/developers-guide-to-multi-agent-patterns-in-adk/
https://developers.googleblog.com/architecting-efficient-context-aware-multi-agent-framework-for-production/
https://learn.microsoft.com/en-us/agent-framework/user-guide/workflows/orchestrations/handoff
https://techcommunity.microsoft.com/blog/azuredevcommunityblog/orchestrating-multi-agent-intelligence-mcp-driven-patterns-in-agent-framework/4462150
https://microsoft.github.io/multi-agent-reference-architecture/docs/reference-architecture/Patterns.html
https://microsoft.github.io/multi-agent-reference-architecture/docs/reference-architecture/Patterns.html
https://linear.app/developers/graphql
https://developers.linear.app/docs/graphql/working-with-the-graphql-api
https://www.researchgate.net/publication/369853857_Area_of_Interest_Management_in_Massively_Multiplayer_Online_Games
https://www.researchgate.net/publication/261960704_Interest_Management_for_Distributed_Virtual_Environments_A_Survey
https://gamedev.net/forums/topic/609123-interest-management-in-an-mmo/4852915
https://www.researchgate.net/publication/323701106_Combat_State-Aware_Interest_Management_for_Massively_Multiplayer_Online_Games
https://appwarps2.shephertz.com/dev-center/mmo-interest-management/
https://developer.valvesoftware.com/wiki/Source_Multiplayer_Networking
https://en.wikipedia.org/wiki/Id_Tech_3
https://gamedev.net/forums/topic/654235-quake-339s-state-based-delta-compression/
https://fabiensanglard.net/quake3/The%20Quake3%20Networking%20Mode.html
https://hub.jmonkeyengine.org/t/quakemonkey-an-implementation-of-the-quake-3-snapshot-model-on-top-of-the-existing-network-code/23198
https://www.elho.net/games/q3/q3dspecs.htm
https://github.com/ruvnet/claude-flow/issues/898
https://github.com/anthropics/claude-code/issues/10373
https://github.com/thedotmack/claude-mem/issues/775
https://code.claude.com/docs/en/changelog
https://claude.com/blog/how-to-configure-hooks
https://github.com/anthropics/claude-code/issues/10447
https://github.com/mksglu/context-mode
https://lobehub.com/mcp/dxta-claude-dynamic-context-pruning
https://www.gend.co/blog/configure-claude-code-hooks-automation
https://prg.sh/notes/Claude-Code-Agent-Teams
https://darasoba.medium.com/how-to-set-up-and-use-claude-code-agent-teams-and-actually-get-great-results-9a34f8648f6d
https://addyosmani.com/blog/claude-code-agent-teams/
https://dev.to/eira-wexford/how-to-build-multi-agent-systems-complete-2026-guide-1io6
https://dev.to/uenyioha/porting-claude-codes-agent-teams-to-opencode-4hol
https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/workflows/agent-teams.md
https://cobusgreyling.medium.com/claude-code-agent-teams-ca3ec5f2d26a
https://www.turingcollege.com/blog/claude-agent-teams-explained
https://openai.github.io/openai-agents-python/mcp/
https://learn.microsoft.com/en-us/dynamics365/fin-ops-core/dev-itpro/copilot/copilot-mcp
https://deepwiki.com/nanobot-ai/nanobot/8.5-creating-custom-mcp-servers
https://medium.com/@EleventhHourEnthusiast/advancing-multi-agent-systems-through-model-context-protocol-architecture-implementation-and-5146564bc1ff
https://www.emergentmind.com/papers/2504.21030
https://arxiv.org/abs/2504.21030
https://arxiv.org/pdf/2504.21030
https://arxiv.org/pdf/2506.01804
https://arxiv.org/html/2507.21105v1
https://www.researchgate.net/publication/391329081_Advancing_Multi-Agent_Systems_Through_Model_Context_Protocol_Architecture_Implementation_and_Applications
https://www.spaceo.ai/blog/agentic-ai-frameworks/
https://gurusup.com/blog/multi-agent-orchestration-guide
https://github.com/microsoft/agent-framework/releases
https://learn.microsoft.com/en-us/semantic-kernel/frameworks/agent/agent-orchestration/handoff
https://zircon.tech/blog/agentic-frameworks-in-2026-what-actually-works-in-production/
https://www.onabout.ai/p/mastering-multi-agent-orchestration-architectures-patterns-roi-benchmarks-for-2025-2026
https://www.infoq.com/news/2026/02/ms-agent-framework-rc/
https://medium.com/@mjgmario/multi-agent-system-patterns-a-unified-guide-to-designing-agentic-architectures-04bb31ab9c41
https://learn.microsoft.com/en-us/microsoft-copilot-studio/guidance/architecture/multi-agent-patterns
https://www.confluent.io/blog/event-driven-multi-agent-systems/
https://lumadock.com/tutorials/openclaw-multi-agent-coordination-governance
https://callsphere.tech/blog/claude-agent-sdk-autonomous-agents
https://mem0.ai/blog/agentic-frameworks-ai-agents
https://blog.promptlayer.com/agentic-ai-frameworks-empowering-autonomous-ai-systems/
https://github.com/ashoulson/RailgunNet
https://github.com/HouraiTeahouse/FantasyCrescendo/issues/265
https://gamedev.net/forums/topic/696321-delta-compression/5376766/
https://gamedev.net/forums/topic/683952-delta-compression-and-dropped-client-62server-acks/5320437/
https://gamedev.net/forums/topic/717013-how-best-to-handle-snapshot-deltas-and-serialization/
https://gamedev.net/forums/topic/687434-state-snapshot-delta-compression-and-slippy-floats/
https://github.com/geckosio/snapshot-interpolation
https://medium.com/@lemapp09/beginnging-game-development-syncing-game-state-0d63dfe16019
https://canbayar91.medium.com/game-mechanics-1-multiplayer-network-synchronization-46cbe21be16a
https://news.ycombinator.com/item?id=31512257
https://upstash.com/blog/kafka-gaming
https://web.mit.edu/6.826/www/notes/HO21.pdf
https://emptysqua.re/blog/review-leases-for-distributed-file-cache-consistency/
https://blog.sqlauthority.com/2017/03/27/sql-server-lease-availability-group-prodag-windows-server-failover-cluster-expired/
https://linear.app/docs/api-and-webhooks
https://rollout.com/integration-guides/linear/api-essentials
https://studio.apollographql.com/public/Linear-API/schema/reference?variant=current
https://linear.app/developers
https://endgrate.com/blog/using-the-linear-api-to-get-issues-(with-javascript-examples)
https://inventivehq.com/blog/linear-webhooks-guide
https://pkg.go.dev/github.com/CorridorSecurity/hookshot/claude
```

---

## Implications for Sherpa's Bootstrap Protocol

### 1. The `get_dashboard` tool is the centerpiece
Every research vector converges on the same answer: the connecting agent needs a single, role-scoped state summary. Game servers send a full snapshot on first connection. Agent frameworks use handoff protocols. The MCP server should expose a `get_dashboard` (or `get_system_state`) tool that returns everything the agent needs in one call, scoped by the agent's role and current task assignment.

### 2. Two-phase bootstrap (warm cache + fresh pull)
The SessionStart hook provides the warm cache (sub-second, possibly stale). The `get_dashboard` MCP tool provides the authoritative fresh state. This mirrors the game server pattern: send a rough initial state immediately, then refine with the real snapshot.

### 3. Interest management determines payload size
A Worker agent needs ~200 tokens of bootstrap context (its task, its authority, its blockers). A Planner needs ~500 tokens (all tasks, authority map, pending proposals). A Judge needs yet another slice. The DOI model from the MMO patterns research applies: scope by role, not by volume.

### 4. The `instructions` field is for system-wide context only
The MCP initialize response includes an `instructions` field. Use it for static operational context ("This is the Sherpa coordination server. Call get_dashboard for your current state.") -- not for dynamic state. Dynamic state goes through the tool call.

### 5. Resource subscriptions replace polling
After the initial bootstrap snapshot, the agent subscribes to relevant resources for delta updates. Authority changes, task status changes, and activity events are pushed via `notifications/resources/updated`. This eliminates the need for repeated `get_dashboard` calls.

### 6. Lease expiration solves the stale authority problem automatically
Crashed agents don't need explicit cleanup. Their leases expire. The periodic reaper cleans up. New sessions see only valid leases. The bootstrap tool reports any leases still held by the agent's ID so it can decide whether to renew them.

### 7. The `compact` matcher is critical
Context compaction deletes everything the agent knew. The SessionStart hook fires again with matcher `compact`. This is not optional -- it's the difference between an agent that recovers gracefully and one that loses all coordination state mid-task.

### 8. Sherpa's existing activity.md files are a human handoff protocol
They serve the right purpose (recording state for future sessions) but the wrong audience (optimized for human reading, not machine bootstrap). The MCP server should maintain a parallel machine-readable handoff record that feeds the `get_dashboard` tool.

---

## Open Questions

1. **Should `get_dashboard` be a tool or a resource?** MCP resources are meant for read-only data that provides context. A dashboard is exactly that. But resources are "application-driven" (the host decides when to read them), while tools are "model-driven" (the agent decides when to call them). For bootstrap, the agent needs to actively pull state -- which argues for a tool. But for ongoing monitoring, a resource with subscriptions is more natural. Consider: expose as BOTH -- a `dashboard://` resource for passive context injection and a `get_dashboard` tool for active queries.

2. **How does the agent identify itself?** The MCP initialize handshake includes `clientInfo` (name, version). Should the agent's role and task assignment be passed as parameters to `get_dashboard`, or should the MCP server look them up based on the session ID? Agent Teams stores team config at `~/.claude/teams/{team-name}/config.json` with member agent IDs.

3. **What happens when the MCP server itself restarts?** Post-crash recovery for lease servers: "The server durably records only the maximum expiration time. When it restarts, it waits for that maximum expiration to pass before granting new leases." SQLite with WAL mode persists through crashes, but in-flight leases need recovery logic.

4. **Should the SessionStart hook block until the MCP server is reachable?** If the coordination server is down, should the agent start without coordination context (degraded mode) or wait? Game servers have the luxury of refusing connections. Agents should probably start in read-only mode.

5. **Can Claude Code Agent Teams' shared task list be backed by the MCP server?** Agent Teams stores tasks at `~/.claude/tasks/{team-name}/`. If the MCP coordination server managed tasks instead, the bootstrap problem for Agent Teams teammates would be solved -- they'd call `get_dashboard` instead of reading local files.

6. **What's the right granularity for resource subscriptions?** Subscribe to individual file authority? Per-task status? Per-initiative activity? Too fine-grained creates subscription management overhead. Too coarse sends irrelevant updates. The interest management research suggests: subscribe at the task level, with implicit inclusion of task-adjacent state.

7. **How does bootstrap interact with git worktrees?** An agent in a worktree has an isolated filesystem view but shares the SQLite coordination database. Does the bootstrap payload need to include worktree-specific state (branch status, pending rebases)?
