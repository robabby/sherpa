# Claude Code Native Capabilities vs. MCP Coordination Requirements

**Research iteration:** 2
**Date:** 2026-03-12
**Question:** What coordination is already built into Claude Code vs. what must the MCP server provide? How do Claude Code's native features interact with an MCP coordination server?

---

## 1. Git Worktrees in Claude Code

### Native Capabilities

Claude Code has first-class worktree support, shipped as a built-in feature across CLI, Desktop, IDE extensions, and mobile app.

- **`--worktree` (`-w`) flag**: Creates an isolated worktree at `<repo>/.claude/worktrees/<name>` with a new branch (`worktree-<name>`) based on the default remote branch. ([Common workflows - Claude Code Docs](https://code.claude.com/docs/en/common-workflows))
- **`EnterWorktree` tool**: Programmatic worktree creation available to the agent during a session. Creates worktrees inside `.claude/worktrees/` with a new branch based on HEAD. ([Threads - Boris Cherny](https://www.threads.com/@boris_cherny/post/DVAAoZ3gYut/use-claude-worktree-for-isolation-to-run-claude-code-in-its-own-git-worktree))
- **`ExitWorktree` tool**: Leaves worktree session, with `"keep"` or `"remove"` action. Refuses to remove worktrees with uncommitted changes unless `discard_changes: true`.
- **Subagent worktree isolation**: Adding `isolation: worktree` to a custom subagent's frontmatter gives each subagent its own complete copy of the repository. Worktrees auto-clean when the subagent finishes without changes. ([Create custom subagents - Claude Code Docs](https://code.claude.com/docs/en/sub-agents))
- **Automatic cleanup**: No changes = worktree and branch removed automatically. Changes or commits = Claude prompts to keep or remove.
- **Non-git VCS support**: `WorktreeCreate` and `WorktreeRemove` hooks enable custom worktree logic for SVN, Perforce, Mercurial. ([Common workflows - Claude Code Docs](https://code.claude.com/docs/en/common-workflows))

### Isolation Guarantees

Git worktrees provide **physical file-level isolation**: each worktree has its own working directory, its own branch, and its own git index. Two worktrees can modify the same file path without conflict until merge time. The repository history and objects are shared, but the working trees are completely independent.

### What Worktrees Do NOT Provide

- **No awareness of other agents' work**: Agent A in one worktree has no knowledge that Agent B is modifying the same logical file in another worktree.
- **No merge coordination**: Conflicts are deferred to merge time. There is no mechanism to detect or prevent conflicting edits before they happen.
- **No shared state**: The worktree's branch is independent. There is no authority registry, version tracking, or cross-worktree notification system.
- **No lifecycle tracking beyond git**: The MCP server does not know which agents are in which worktrees, or what they are working on.

### Implications for MCP Server

Worktree isolation reduces but does not eliminate the need for authority tracking. For most file edits during task execution, worktree isolation is sufficient — agents edit their own copy. Authority is still needed for:
1. **Shared artifacts** that should not diverge across branches (CLAUDE.md, roadmap.md, shared config)
2. **Initiative-level coordination** (which agent owns which initiative)
3. **Merge conflict prevention** (detecting parallel modifications to the same logical section before merge)
4. **Worktree lifecycle awareness** (the MCP server should know which worktrees exist and who is working in them)

---

## 2. Task Management (TaskCreate, TaskUpdate, TaskList, TaskGet)

### Native Capabilities

Claude Code has a built-in task management system that replaced the earlier "Todos" functionality (Claude Code 2.1, January 2026).

- **TaskCreate**: Creates tasks with `subject`, `description`, optional `activeForm` (spinner text), and optional `metadata`. All tasks start as `pending`. ([VentureBeat](https://venturebeat.com/orchestration/claude-codes-tasks-update-lets-agents-work-longer-and-coordinate-across))
- **TaskUpdate**: Changes task status (`pending` -> `in_progress` -> `completed` or `deleted`), sets owner, adds dependency relationships (`addBlocks`, `addBlockedBy`).
- **TaskList**: Returns summary of all tasks with id, subject, status, owner, and blockedBy.
- **TaskGet**: Returns full task details including description and dependency information.
- **DAG dependencies**: Tasks support directed acyclic graphs. A pending task with unresolved dependencies cannot be claimed until those dependencies complete. ([DEV Community](https://dev.to/bhaidar/the-task-tool-claude-codes-agent-orchestration-system-4bf2))

### How Tasks Work in Agent Teams

In the Agent Teams feature, tasks are stored as individual JSON files on the local filesystem:
- **Team config**: `~/.claude/teams/{team-name}/config.json` with a `members` array listing each teammate's name, agentId, and agentType.
- **Task list**: `~/.claude/tasks/{team-name}/` directory containing one JSON file per task.
- **No database**: The entire system is JSON files on disk. No message broker, no database. ([alexop.dev](https://alexop.dev/posts/from-tasks-to-swarms-agent-teams-in-claude-code/))
- **File locking for task claiming**: Prevents race conditions when multiple teammates try to claim the same task simultaneously. ([Orchestrate teams - Claude Code Docs](https://code.claude.com/docs/en/agent-teams))
- **Self-claiming**: After finishing a task, a teammate picks up the next unassigned, unblocked task.

### What Task Tools Do NOT Provide

- **No file-level authority**: Tasks track what agents are *working on* (subjects/descriptions), not which *files* they have authority over.
- **No fencing tokens**: No optimistic concurrency control. No version checks on mutations.
- **No cross-session persistence for arbitrary agents**: The task system works within a single team lead's session and its teammates. Independent Claude Code sessions do not share task lists.
- **No initiative-level awareness**: Tasks are flat work items, not structured initiative/sub-initiative hierarchies.
- **No write-through projection**: Task state exists only in JSON files; there is no projection to human-readable markdown.

### Implications for MCP Server

The native task system handles **within-team work distribution**. The MCP server must handle:
1. **Cross-team/cross-session coordination** — Independent Claude Code sessions (different humans, different machines) need a shared coordination layer.
2. **File-to-agent authority mapping** — "Agent X has authority over files A, B, C" is not expressible in the native task system.
3. **Fencing tokens and version control** — Optimistic concurrency for shared state mutations.
4. **Initiative/governance structure** — Sherpa's directoturtle convention (proposal -> plan -> activity -> implementation) is richer than flat task lists.
5. **Persistent, queryable state** — SQLite vs. JSON files on disk.

---

## 3. Hooks System

### Native Capabilities

Claude Code supports 18 lifecycle hook events as of March 2026, with 4 hook types: `command` (shell), `http` (POST to URL), `prompt` (single-turn LLM evaluation), and `agent` (multi-turn subagent with tool access). ([Automate workflows with hooks - Claude Code Docs](https://code.claude.com/docs/en/hooks-guide))

**Key events for coordination:**
| Event | Coordination Potential |
|-------|----------------------|
| `PreToolUse` | Block edits to files the agent lacks authority over. Matcher: `Edit\|Write`. |
| `PostToolUse` | Notify the MCP server of completed edits for version tracking. |
| `TeammateIdle` | Exit code 2 sends feedback and keeps teammate working. Quality gate. |
| `TaskCompleted` | Exit code 2 prevents completion and sends feedback. Quality gate. |
| `SubagentStart` / `SubagentStop` | Track subagent lifecycle for authority management. |
| `WorktreeCreate` / `WorktreeRemove` | Custom worktree logic; could register/deregister worktrees with MCP server. |
| `SessionStart` / `SessionEnd` | Register/deregister agents with the coordination server. |
| `InstructionsLoaded` | Fires when CLAUDE.md loads; could inject coordination state. |
| `ConfigChange` | Detect configuration changes across sessions. |
| `Stop` | Verify all authority released before agent stops. |

**HTTP hooks are critical**: The `"type": "http"` hook type POSTs event data (same JSON as stdin for command hooks) to an HTTP endpoint. The endpoint returns results in the response body. Headers support environment variable interpolation. ([Claude Code Hooks - Medium](https://algoinsights.medium.com/claude-code-just-got-http-hooks-heres-why-that-changes-everything-6938ffaae1f6))

**Exit code semantics**: Exit 0 = proceed (stdout added to context for some events). Exit 2 = block action (stderr becomes feedback to Claude). Any other exit = proceed, stderr logged. ([Hooks reference - Claude Code Docs](https://code.claude.com/docs/en/hooks))

**Structured JSON output**: For `PreToolUse`, can return `permissionDecision: "allow"|"deny"|"ask"` with `permissionDecisionReason`. ([Automate workflows with hooks - Claude Code Docs](https://code.claude.com/docs/en/hooks-guide))

### Coordination Architecture via Hooks

Hooks can enforce coordination deterministically (not relying on the LLM to follow instructions):

```
PreToolUse (Edit|Write) → HTTP POST to MCP server → check authority → allow/deny
PostToolUse (Edit|Write) → HTTP POST to MCP server → register version
SessionStart → HTTP POST → register agent session
SessionEnd → HTTP POST → release all authority
WorktreeCreate → HTTP POST → register worktree
WorktreeRemove → HTTP POST → cleanup worktree authority
```

This is a key finding: **hooks provide the enforcement mechanism**. The MCP server provides the authority state; hooks enforce it at the tool-call boundary. CLAUDE.md instructions are advisory; hooks are deterministic.

### Limitations

- Hook timeout: 10 minutes default, configurable per hook.
- `PostToolUse` hooks cannot undo actions (tool already executed).
- `PermissionRequest` hooks do not fire in headless mode (`-p`); use `PreToolUse` instead.
- Hooks are configured per-project or per-user in settings files; not dynamically reconfigurable from the MCP server.
- `Stop` hooks fire on every response completion, not just task completion; must check `stop_hook_active` to avoid infinite loops.

---

## 4. CLAUDE.md Auto-Loading

### Native Capabilities

CLAUDE.md files provide persistent project-level context. Loading behavior:

- **Eager loading**: At session start, walks upward from CWD to filesystem root, loading every CLAUDE.md encountered. Also loads `.claude/rules/*.md` files matching glob patterns. ([How Claude remembers your project - Claude Code Docs](https://code.claude.com/docs/en/memory))
- **Lazy loading**: CLAUDE.md files in subdirectories load when Claude reads or edits a file in that subdirectory.
- **`@path` imports**: Recursive imports with max depth of 5 hops.
- **`.claude/rules/*.md`**: Cross-cutting conventions with `globs:` frontmatter for targeted loading.
- **Token budget**: Target 30-100 lines per file, 200 line hard max. Total CLAUDE.md context should be under ~4,000 tokens.
- **Compaction risk**: During auto-compaction, CLAUDE.md content can be summarized and lose fidelity.

### Can Coordination State Be Embedded in CLAUDE.md?

**Partially, with significant limitations:**

- CLAUDE.md is **read at session start** (and on directory access). It is not a real-time communication channel.
- Content is **static until the next load**. Modifying a CLAUDE.md mid-session does not immediately update the agent's context. The `InstructionsLoaded` hook fires when files load, not on modification.
- CLAUDE.md is **advisory**: Claude "usually follows" CLAUDE.md, but it is not deterministic enforcement. Hooks are deterministic.
- **Token budget is tiny**: 4,000 tokens total for all CLAUDE.md context. Coordination state (authority tables, agent registries) would consume this budget entirely.
- **CLAUDE.md is version-controlled**: Dynamic per-session state should not be in git-tracked files.

### What Works

- **Static conventions**: "Always check authority before editing shared artifacts" belongs in CLAUDE.md.
- **Pointers to the MCP server**: "Use the coordination MCP server for authority checks" is ideal CLAUDE.md content.
- **Agent role definitions**: Behavioral constraints in `.claude/rules/behavioral-engineering.md` are exactly what CLAUDE.md is designed for.

### What Does NOT Work

- **Dynamic authority state**: Which agent owns which file right now. Too dynamic, too large, not version-controllable.
- **Real-time notifications**: CLAUDE.md cannot push state changes to agents mid-session.
- **Task coordination**: Task lists change constantly; CLAUDE.md loads once.

---

## 5. Subagents (Agent Tool)

### Native Capabilities

Subagents are specialized AI assistants running in their own context window. Key characteristics:

- **Own context window**: System prompt, tool access, and permissions independent of the parent. ([Create custom subagents - Claude Code Docs](https://code.claude.com/docs/en/sub-agents))
- **Tool access control**: `tools` (allowlist) and `disallowedTools` (denylist) fields restrict capabilities. Read-only agents get `Read, Grep, Glob`; writers get full tool access.
- **Isolation modes**: `isolation: worktree` gives the subagent its own git worktree. Auto-cleaned when subagent finishes without changes.
- **MCP server scoping**: `mcpServers` field gives subagent-specific MCP access. Inline definitions connect only for that subagent's lifetime. String references share the parent session's connection.
- **Permission modes**: `default`, `acceptEdits`, `dontAsk`, `bypassPermissions`, `plan`.
- **Model selection**: `sonnet`, `opus`, `haiku`, or `inherit`. Route cheap tasks to Haiku.
- **No nesting**: Subagents cannot spawn other subagents.
- **Background execution**: `background: true` runs concurrently. Pre-approves permissions upfront; auto-denies anything not pre-approved.
- **Persistent memory**: `memory: user|project|local` gives cross-session knowledge stored in `~/.claude/agent-memory/<name>/MEMORY.md`.
- **Context isolation benefit**: Verbose output stays in the subagent's context; only summaries return to the parent.
- **Hooks in subagent frontmatter**: Lifecycle hooks scoped to the subagent's execution.

### Git State Sharing

- **Without `isolation: worktree`**: Subagents share the parent's working directory and git state. File edits are immediately visible. This is dangerous for parallel subagents editing different files.
- **With `isolation: worktree`**: Each subagent gets its own complete repository copy with its own branch. Changes must be merged back via standard git workflows.

### What Subagents Do NOT Provide

- **No inter-subagent communication**: Subagents report results back to the parent only. They cannot message each other. (Agent Teams provide this instead.)
- **No shared task list**: Each subagent is fire-and-forget from the parent's perspective.
- **No authority awareness**: Subagents do not check or declare what files they will edit.
- **No persistent coordination state**: Subagent invocations are ephemeral (though `memory` provides cross-session learning).

---

## 6. Multi-Agent Work in Claude Code

### Agent Teams (Experimental)

Agent Teams is the most coordination-heavy native feature, shipped alongside Opus 4.6 in early 2026. It is experimental and disabled by default (`CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`).

**Architecture:**
| Component | Role |
|-----------|------|
| Team lead | Main Claude Code session; creates team, spawns teammates, coordinates |
| Teammates | Separate Claude Code instances; work independently |
| Task list | Shared JSON files at `~/.claude/tasks/{team-name}/` |
| Mailbox | JSON-based messaging for inter-agent communication |

([Orchestrate teams - Claude Code Docs](https://code.claude.com/docs/en/agent-teams))

**7 core primitives** (via TeammateTool):
- `TeamCreate` — Initialize team directory and config
- `TaskCreate` — Generate task JSON file
- `TaskUpdate` — Change task status/owner
- `TaskList` — Return all tasks
- `Task` (with team_name) — Spawn a teammate as a full Claude Code session
- `SendMessage` — Direct messaging (message, broadcast, shutdown_request, shutdown_response, plan_approval_response)
- `TeamDelete` — Remove team files

([alexop.dev](https://alexop.dev/posts/from-tasks-to-swarms-agent-teams-in-claude-code/))

**Coordination mechanisms:**
- File locking for task claiming (prevents double-claiming)
- Automatic message delivery (no polling needed)
- Idle notifications (teammates notify lead when done)
- Task dependencies (DAG-based blocking)
- Plan approval workflow (teammate plans, lead approves before implementation)
- `TeammateIdle` and `TaskCompleted` hooks for quality gates

**Known limitations:**
- No session resumption for in-process teammates
- Task status can lag (teammates forget to mark tasks complete)
- One team per session; no nested teams
- Lead is fixed for team lifetime
- All teammates inherit lead's permission mode
- File conflicts: "Two teammates editing the same file leads to overwrites. Break the work so each teammate owns a different set of files." ([Orchestrate teams - Claude Code Docs](https://code.claude.com/docs/en/agent-teams))

### Real-World Scale

A developer tasked 16 agents with building a Rust-based C compiler (100,000 lines, ~2,000 Claude Code sessions). This used worktree isolation per agent with clear file ownership boundaries. ([Building a C compiler with a team of parallel Claudes](https://www.anthropic.com/engineering/building-c-compiler))

### Community Solutions for Coordination Gaps

**session-collab-mcp** ([GitHub](https://github.com/leaf76/session-collab-mcp)): An MCP server providing:
- Work-in-Progress (WIP) Registry for file claims
- Session management (register, list, terminate)
- Working memory that persists across compaction
- Protected file registry
- SQLite-backed (WAL mode) for multi-process safety
- mkdir-based locks (atomic on NTFS, ext4, APFS) for git commits and reservations

This directly validates the need for an MCP coordination server -- session-collab-mcp exists because Claude Code's native features are insufficient for robust multi-session coordination.

---

## 7. MCP in Claude Code

### Transport Options

Claude Code supports all MCP transport types:
- **stdio**: Local subprocess, JSON-RPC 2.0 over stdin/stdout. One process per client. No shared state between connections. Default for local tools. ([Connect Claude Code to tools via MCP - Claude Code Docs](https://code.claude.com/docs/en/mcp))
- **HTTP (Streamable HTTP)**: Recommended for remote/cloud servers. Supports OAuth 2.0 authentication.
- **SSE**: Deprecated in favor of HTTP. Still supported.
- **WebSocket**: Available for persistent connections.

### Can Multiple Claude Code Instances Connect to the Same MCP Server?

**Yes, but transport matters:**

- **stdio**: Each connection spawns a new server process. **No shared state** between connections by design. Multiple Claude Code instances each get their own isolated server instance. This is unsuitable for a coordination server.
- **HTTP/SSE**: Multiple clients connect to a single server process. **Shared state is possible and expected.** This is the correct transport for a coordination server. ([DEV Community - MCP Transports](https://dev.to/jefe_cool/mcp-transports-explained-stdio-vs-streamable-http-and-when-to-use-each-3lco))

### MCP Configuration Scopes

| Scope | Location | Sharing |
|-------|----------|---------|
| local (default) | `~/.claude.json` under project path | Private to user and project |
| project | `.mcp.json` in project root | Checked into version control; team-shared |
| user | `~/.claude.json` | Available across all projects for that user |
| managed | System-wide `managed-mcp.json` | Admin-controlled, organization-wide |

### Key MCP Features for Coordination

- **Dynamic tool updates**: `list_changed` notifications let the MCP server dynamically update available tools without reconnection.
- **Tool Search**: When MCP tools exceed 10% of context, tools are deferred and discovered on-demand. Critical for keeping coordination tools from consuming context when not needed.
- **Subagent MCP scoping**: Inline MCP definitions in subagent frontmatter connect only for that subagent's lifetime.
- **OAuth 2.0**: HTTP servers support OAuth for authentication. Important if the coordination server needs agent identity.
- **Session management**: Streamable HTTP transport supports `Mcp-Session-Id` for session tracking.
- **MCP output limits**: Default 25,000 tokens, configurable via `MAX_MCP_OUTPUT_TOKENS`. Coordination responses should be compact.

### Architecture Decision: Streamable HTTP

The MCP coordination server MUST use Streamable HTTP transport, not stdio. Rationale:
1. Multiple Claude Code sessions must connect to the **same server process** to share state.
2. Streamable HTTP supports SSE-based server-push for authority change notifications.
3. Session management via `Mcp-Session-Id` enables agent identity tracking.
4. Single-process architecture eliminates distributed coordination (aligns with SQLite single-writer model from the proposal).

---

## 8. What's Genuinely Missing: The Minimal MCP Coordination Set

After cataloging all native capabilities, here is what Claude Code **cannot do natively** and what the MCP coordination server **must provide**.

### MUST PROVIDE (No Native Equivalent)

1. **Authority/Lease Management**
   - Native: No concept of file or scope authority. Agent Teams assume file ownership via task description ("work on the auth module"), but there is no registry, no enforcement, and no fencing tokens.
   - MCP must provide: `acquire_authority`, `release_authority`, `check_authority`, `transfer_authority`, `heartbeat_authority`, `override_authority` (as designed in the proposal).

2. **Cross-Session State**
   - Native: Agent Teams store state in `~/.claude/teams/` and `~/.claude/tasks/`, but only for one team lead's session and its teammates. Independent Claude Code sessions (different terminals, different humans, different machines) have no shared state.
   - MCP must provide: A single-process server with SQLite persistence that all sessions connect to. Authority records, task state, and initiative metadata accessible to any connected agent.

3. **Fencing Tokens / Optimistic Concurrency**
   - Native: No version checking on any mutation. The task system uses simple status transitions with file locking for claiming, but no version vectors, no ETags, no expected-version checks.
   - MCP must provide: `expectedVersion` on mutations, monotonic version numbers on resources, and fencing token enforcement at the mutation point (Kleppmann's architecture).

4. **File-to-Agent Authority Mapping**
   - Native: No mapping from file paths to the agent that has authority over them. Worktrees provide physical isolation but no logical authority. Two agents in the same worktree (or modifying the same shared artifact across worktrees) have no conflict detection.
   - MCP must provide: A registry mapping `(scope, file_path)` -> `(agent_id, fence_token, expires_at)`.

5. **Write-Through File Projection**
   - Native: No mechanism to project structured state (SQLite) to human-readable files (markdown). CLAUDE.md is static; Agent Team task files are raw JSON.
   - MCP must provide: Synchronous markdown regeneration on every mutation, with content hashing for human edit detection.

6. **Initiative/Governance Structure**
   - Native: Flat task lists only. No proposal lifecycle, no directoturtle convention, no integration review.
   - MCP must provide: Initiative, sub-initiative, and proposal state management aligned with Sherpa's governance model.

### SHOULD LEVERAGE (Strong Native Foundation)

1. **Worktree Isolation**
   - Use as the primary physical isolation mechanism for parallel agents.
   - MCP server should be **aware** of worktrees (register on `WorktreeCreate`, deregister on `WorktreeRemove`) but should not **replace** them.
   - Authority is still needed for shared artifacts and merge coordination.

2. **HTTP Hooks for Enforcement**
   - `PreToolUse` HTTP hooks calling the MCP server are the enforcement mechanism for authority.
   - The MCP server does not need to intercept file operations itself -- hooks do that at the Claude Code boundary.
   - This is architecturally elegant: separation of state (MCP server) from enforcement (hooks).

3. **Task Tools for Within-Team Distribution**
   - Agent Teams' task system handles work distribution within a single team.
   - The MCP server provides the higher-level coordination (cross-team, cross-session, initiative-level).
   - Design for complementarity, not replacement.

4. **Subagent Definitions for Agent Roles**
   - Subagent `.claude/agents/` files can encode Sherpa's behavioral agent roles (Planner, Worker, Judge).
   - `tools`, `disallowedTools`, `permissionMode`, and hooks in frontmatter enforce role constraints natively.
   - The MCP server provides the coordination state these agents operate on.

5. **CLAUDE.md for Static Conventions**
   - Coordination conventions ("always check authority before editing shared artifacts") belong in CLAUDE.md.
   - Dynamic state belongs in the MCP server.
   - CLAUDE.md points to the MCP server; it does not duplicate its state.

### DO NOT DUPLICATE (Native Feature is Sufficient)

1. **Worktree creation/cleanup** -- `EnterWorktree`/`ExitWorktree` + `--worktree` flag handle this.
2. **Subagent spawning** -- Native Agent tool handles this.
3. **Within-team messaging** -- Agent Teams' `SendMessage` handles this.
4. **Within-team task distribution** -- `TaskCreate`/`TaskUpdate` handles this.
5. **Session resumption** -- Native `--resume`/`--continue` handles this.
6. **File search/exploration** -- Native Glob/Grep/Read tools handle this.
7. **Permission management** -- Native permission modes and `PreToolUse` hooks handle this.

---

## Open Questions

1. **Worktree authority granularity**: If agents are in separate worktrees, should authority tracking be `(worktree, file_path)` or just `file_path`? The worktree × authority interaction branch ([worktree-authority-interaction.md](../branches/worktree-authority-interaction.md)) seeds this question but it remains unresolved.

2. **Hook configuration distribution**: HTTP hooks pointing to the MCP server must be configured in each agent's settings. How is this bootstrapped? Should `sherpa init` generate the hooks configuration? Can the MCP server serve its own hook configuration via a resource?

3. **Agent identity**: Claude Code sessions do not have stable agent identifiers across restarts. `session_id` changes per session. How does the MCP server identify agents? Options: (a) session_id ephemeral registration, (b) agent name from subagent definition, (c) worktree branch name as identity, (d) explicit agent registration tool.

4. **Agent Teams integration depth**: Should the MCP server replace Agent Teams' task system, extend it, or operate alongside it? The filesystem-based task list in Agent Teams could be projected from the MCP server's SQLite state (write-through projection to `~/.claude/tasks/`).

5. **HTTP vs stdio for the coordination server**: The analysis confirms Streamable HTTP is required for multi-session shared state. But should the server ALSO expose stdio for single-developer scenarios where only one session runs at a time? Or is HTTP-only simpler and sufficient?

6. **Hook latency impact**: `PreToolUse` HTTP hooks add network round-trip latency to every file edit. For a localhost server, this is negligible (<5ms). For a remote coordination server, it could impact agent responsiveness. Should authority be cached client-side with background sync?

7. **Agent Teams vs. Sherpa orchestration**: Agent Teams handles within-team coordination (lead assigns tasks, teammates self-claim, messaging). Sherpa's Planner/Worker/Judge pattern is architecturally similar. Should Sherpa define its dispatch model as Agent Teams integration, or as a separate MCP-mediated system?

8. **Compaction resilience**: When Claude auto-compacts, MCP tool definitions remain available but previous tool call results may be summarized. Should the MCP server provide a `get_my_state` tool that agents call after compaction to re-establish coordination context?

---

## Sources

### Official Documentation
- [Common workflows - Claude Code Docs](https://code.claude.com/docs/en/common-workflows) -- Worktrees, parallel sessions, subagent workflows
- [Orchestrate teams of Claude Code sessions - Claude Code Docs](https://code.claude.com/docs/en/agent-teams) -- Agent Teams architecture, TeammateTool, task system, limitations
- [Create custom subagents - Claude Code Docs](https://code.claude.com/docs/en/sub-agents) -- Subagent definitions, tool access, isolation modes, MCP scoping, hooks, memory
- [Automate workflows with hooks - Claude Code Docs](https://code.claude.com/docs/en/hooks-guide) -- Hook lifecycle, types (command/http/prompt/agent), examples
- [Hooks reference - Claude Code Docs](https://code.claude.com/docs/en/hooks) -- Full event schemas, JSON output, async hooks, MCP tool hooks
- [Connect Claude Code to tools via MCP - Claude Code Docs](https://code.claude.com/docs/en/mcp) -- Transport types, scopes, configuration, authentication
- [How Claude remembers your project - Claude Code Docs](https://code.claude.com/docs/en/memory) -- CLAUDE.md loading, auto memory, session memory

### Blog Posts and Analyses
- [Building a C compiler with a team of parallel Claudes](https://www.anthropic.com/engineering/building-c-compiler) -- 16-agent, 2000-session, 100K-line compiler build
- [Threads - Boris Cherny: Built-in git worktree support](https://www.threads.com/@boris_cherny/post/DVAAnexgRUj/introducing-built-in-git-worktree-support-for-claude-code-now-agents-can-run-in) -- Worktree feature announcement
- [Threads - Boris Cherny: --worktree for isolation](https://www.threads.com/@boris_cherny/post/DVAAoZ3gYut/use-claude-worktree-for-isolation-to-run-claude-code-in-its-own-git-worktree) -- CLI usage details
- [The Task Tool: Claude Code's Agent Orchestration System - DEV Community](https://dev.to/bhaidar/the-task-tool-claude-codes-agent-orchestration-system-4bf2) -- Task system deep dive
- [From Tasks to Swarms: Agent Teams in Claude Code - alexop.dev](https://alexop.dev/posts/from-tasks-to-swarms-agent-teams-in-claude-code/) -- TeammateTool internals, filesystem structure
- [Claude Code's Hidden Multi-Agent System - paddo.dev](https://paddo.dev/blog/claude-code-hidden-swarm/) -- TeammateTool discovery and reverse engineering
- [Claude Code Just Got HTTP Hooks - Medium](https://algoinsights.medium.com/claude-code-just-got-http-hooks-heres-why-that-changes-everything-6938ffaae1f6) -- HTTP hook architecture implications
- [Claude Code's Tasks update - VentureBeat](https://venturebeat.com/orchestration/claude-codes-tasks-update-lets-agents-work-longer-and-coordinate-across) -- Task system release coverage
- [MCP Transports Explained - DEV Community](https://dev.to/jefe_cool/mcp-transports-explained-stdio-vs-streamable-http-and-when-to-use-each-3lco) -- stdio vs HTTP for shared state

### Community Projects
- [session-collab-mcp](https://github.com/leaf76/session-collab-mcp) -- MCP server for Claude Code session collaboration; WIP registry, file claims, SQLite-backed
- [Claude Code Swarm Orchestration Skill - GitHub Gist](https://gist.github.com/kieranklaassen/4f2aba89594a4aea4ad64d753984b2ea) -- Community guide to multi-agent coordination
- [claude-code-hooks-multi-agent-observability](https://github.com/disler/claude-code-hooks-multi-agent-observability) -- Real-time monitoring for Claude Code agents via hooks

### Guides and Tutorials
- [Claude Code Worktrees: Run Parallel Sessions Without Conflicts - claudefa.st](https://claudefa.st/blog/guide/development/worktree-guide)
- [Claude Code Agent Teams: The Complete Guide 2026 - claudefa.st](https://claudefa.st/blog/guide/agents/agent-teams)
- [Claude Code Hooks: Complete Guide to All 12 Lifecycle Events - claudefa.st](https://claudefa.st/blog/tools/hooks/hooks-guide)
- [Claude Code Task Management: Native Multi-Session AI - claudefa.st](https://claudefa.st/blog/guide/development/task-management)
- [How to Run Parallel Claude Code Agents - Verdent](https://www.verdent.ai/guides/how-to-run-parallel-claude-code-agents)

---

## Raw Links

```
https://code.claude.com/docs/en/common-workflows
https://code.claude.com/docs/en/agent-teams
https://code.claude.com/docs/en/sub-agents
https://code.claude.com/docs/en/hooks-guide
https://code.claude.com/docs/en/hooks
https://code.claude.com/docs/en/mcp
https://code.claude.com/docs/en/memory
https://code.claude.com/docs/en/how-claude-code-works
https://code.claude.com/docs/en/changelog
https://www.anthropic.com/engineering/building-c-compiler
https://www.threads.com/@boris_cherny/post/DVAAnexgRUj
https://www.threads.com/@boris_cherny/post/DVAAoZ3gYut
https://dev.to/bhaidar/the-task-tool-claude-codes-agent-orchestration-system-4bf2
https://alexop.dev/posts/from-tasks-to-swarms-agent-teams-in-claude-code/
https://paddo.dev/blog/claude-code-hidden-swarm/
https://algoinsights.medium.com/claude-code-just-got-http-hooks-heres-why-that-changes-everything-6938ffaae1f6
https://venturebeat.com/orchestration/claude-codes-tasks-update-lets-agents-work-longer-and-coordinate-across
https://dev.to/jefe_cool/mcp-transports-explained-stdio-vs-streamable-http-and-when-to-use-each-3lco
https://github.com/leaf76/session-collab-mcp
https://gist.github.com/kieranklaassen/4f2aba89594a4aea4ad64d753984b2ea
https://gist.github.com/kieranklaassen/d2b35569be2c7f1412c64861a219d51f
https://github.com/disler/claude-code-hooks-multi-agent-observability
https://claudefa.st/blog/guide/development/worktree-guide
https://claudefa.st/blog/guide/agents/agent-teams
https://claudefa.st/blog/tools/hooks/hooks-guide
https://claudefa.st/blog/guide/development/task-management
https://www.verdent.ai/guides/how-to-run-parallel-claude-code-agents
https://www.verdent.ai/guides/claude-code-worktree-setup-guide
https://medium.com/@dtunai/mastering-git-worktrees-with-claude-code-for-parallel-development-workflow-41dc91e645fe
https://www.dandoescode.com/blog/parallel-vibe-coding-with-git-worktrees
https://www.ksred.com/claude-code-as-an-mcp-server-an-interesting-capability-worth-understanding/
https://www.eesel.ai/blog/claude-code-multiple-agent-systems-complete-2026-guide
https://www.nxcode.io/resources/news/claude-agent-teams-parallel-ai-development-guide-2026
https://cobusgreyling.medium.com/claude-code-agent-teams-ca3ec5f2d26a
https://darasoba.medium.com/how-to-set-up-and-use-claude-code-agent-teams-and-actually-get-great-results-9a34f8648f6d
https://www.howdoiuseai.com/blog/2026-02-18-how-to-set-up-and-run-claude-code-agent-teams-in-y
https://www.claudecodecamp.com/p/claude-code-agent-teams-how-they-work-under-the-hood
https://addyosmani.com/blog/claude-code-agent-teams/
https://agentfactory.panaversity.org/docs/General-Agents-Foundations/general-agents/agent-teams
https://prg.sh/notes/Claude-Code-Agent-Teams
https://ona.com/stories/parallelize-claude-code
https://timdietrich.me/blog/claude-code-parallel-subagents/
https://www.datacamp.com/tutorial/claude-code-hooks
https://claudelog.com/mechanics/hooks/
https://claudelog.com/configuration/
https://claudelog.com/mechanics/task-agent-tools/
https://serenitiesai.com/articles/claude-md-complete-guide-2026
https://claude.com/blog/using-claude-md-files
https://medium.com/@huguosuo/dynamic-context-loading-in-ai-agents-a-comparative-analysis-of-claude-and-cursor-8e9c0e543ba3
https://github.com/anthropics/claude-code/issues/4689
https://github.com/anthropics/claude-code/issues/2954
https://github.com/anthropics/claude-code/issues/14227
https://github.com/yuvalsuede/memory-mcp
https://github.com/thedotmack/claude-mem
https://dev.to/sasha_podles/claude-code-using-hooks-for-guaranteed-context-injection-2jg
https://dev.to/lukaszfryc/claude-code-hooks-complete-guide-with-20-ready-to-use-examples-2026-dcg
https://github.com/Dicklesworthstone/post_compact_reminder
https://github.com/ruvnet/ruflo
https://github.com/wshobson/agents
https://claudecode.run/
https://www.builder.io/blog/claude-code-mcp-servers
https://gofastmcp.com/integrations/claude-code
https://scottspence.com/posts/configuring-mcp-tools-in-claude-code
https://markaicode.com/claude-code-mcp-integration/
https://lobehub.com/mcp/ebeloded-claude-mcp
https://github.com/steipete/claude-code-mcp
https://github.com/doobidoo/mcp-memory-service
https://smartscope.blog/en/generative-ai/claude/claude-code-hooks-guide/
https://dev.to/serenitiesai/claude-code-hooks-guide-2026-automate-your-ai-coding-workflow-dde
https://docs.agentinterviews.com/blog/parallel-ai-coding-with-gitworktrees/
https://devcenter.upsun.com/posts/git-worktrees-for-parallel-ai-coding-agents/
https://www.dplooy.com/blog/claude-code-tasks-complete-guide-to-ai-agent-workflow
https://www.ibuildwith.ai/blog/task-tool-vs-subagents-how-agents-work-in-claude-code/
https://www.pubnub.com/blog/best-practices-for-claude-code-sub-agents/
https://blog.sshh.io/p/how-i-use-every-claude-code-feature
https://vld-bc.com/blog/cli-agents-part2-claude-code-best-practices
https://github.com/zebbern/claude-code-guide
https://github.com/VoltAgent/awesome-claude-code-subagents
https://platform.claude.com/docs/en/agent-sdk/subagents
```
