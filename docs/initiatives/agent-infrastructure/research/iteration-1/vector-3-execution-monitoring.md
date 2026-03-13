# Vector 3: Execution Monitoring Data Model

**Question:** What structured data would Studio need to show agent session status, and how would that data be produced? How does this connect to studio-state-machine velocity signals?
**Agent dispatched:** 2026-03-06

## Findings

### Data Models in Existing Agent Orchestration Tools

**Common data model across all frameworks:**

| Field | Present In |
|-------|-----------|
| session/thread ID | All |
| start/end timestamp | All |
| token usage (in/out/cache) | All |
| tool calls (name, input, output) | All |
| status (running/complete/error) | All |
| parent-child relationships | LangGraph, AutoGen, AgentOps |
| cost estimate | AgentOps, ccusage |
| model used | All |
| state snapshots/checkpoints | LangGraph, Semantic Kernel |

**CrewAI:** `TaskOutput` class with `raw` (string), `json_dict`, and `pydantic` output formats. `CrewOutput` aggregates final task output, token usage, and individual task outputs. AOP Suite adds tracing/observability with 12M+ executions/day in production.

**AutoGen (Microsoft Agent Framework):** Uses OpenTelemetry for observability. Message types form execution history: `TextMessage`, `ToolCallRequestEvent`, `ToolCallExecutionEvent`, `ToolCallSummaryMessage`. Runtime logging defaults to SQLite.

**LangGraph:** State tracking via `TypedDict` or Pydantic models. Each checkpoint is a `StateSnapshot` containing: config (thread_id, checkpoint_id), metadata, state channel values, next nodes to execute, tasks (including errors/interrupts).

**Semantic Kernel:** Follows OpenTelemetry Semantic Conventions. Three pillars: logging, metrics (execution time, token consumption), traces. Auto-instrumented spans: `invoke_agent`, `chat`, `execute_tool`.

**OpenTelemetry GenAI Semantic Conventions:** The emerging industry standard. Currently "Development" status. Defines spans for agent operations including extension tools, function tools, and datastore tools.

### Claude Code Already Produces Rich Session Data

**This is the most important finding.** Claude Code already writes complete, machine-readable transcripts as JSONL files at:
```
~/.claude/projects/<url-encoded-project-path>/sessions/<session-uuid>.jsonl
```

Each line is a JSON object with fields:
- `uuid` — message ID
- `parentUuid` — links messages into a chain
- `sessionId` — session identifier
- `timestamp` — ISO-8601
- `version` — Claude Code version
- `gitBranch` — current branch
- `cwd` — working directory
- `message.role` — "user" or "assistant"
- `message.content[]` — array of typed blocks: `text`, `tool_use`, `tool_result`
- `usage.input_tokens`, `usage.output_tokens`, `usage.cache_creation_input_tokens`, `usage.cache_read_input_tokens`
- `toolUseResult` — tool execution results
- `parentToolUseId` — links subagent spawns
- `agentId`, `agentType`, `teamName` — agent team metadata

### Hooks System (Lifecycle Events)

**SessionStart** receives via stdin:
```json
{"session_id": "abc123", "hook_event_name": "SessionStart", "source": "startup", "model": "claude-sonnet-4-20250514", "cwd": "/path/to/project"}
```

**SessionEnd** receives via stdin:
```json
{"session_id": "abc123", "transcript_path": "~/.claude/projects/.../session.jsonl", "cwd": "/Users/...", "hook_event_name": "SessionEnd", "reason": "exit"}
```

**Stop** fires when the agent finishes its response (can capture per-turn data).

Hook types: `command` (shell), `http` (POST to URL), `prompt` (single-turn LLM), `agent` (multi-turn with tools).

### Existing Analysis Tools

- **ccusage** — CLI tool that parses JSONL for token/cost analysis. Supports daily, monthly, session reports. JSON output with `--json` flag.
- **claude-code-log** — Python CLI converting JSONL to readable HTML.
- **claude-JSONL-browser** — Web-based JSONL viewer with file explorer.
- **clog** — Web-based viewer with real-time monitoring.
- **claude-code-transcripts** — Simon Willison's publishing tools.
- **claude-code-usage-analyzer** — Cost analyzer using ccusage + LiteLLM pricing.

### Session Memory

Claude stores session summaries at `~/.claude/projects/<project-hash>/<session-id>/session-memory/summary.md`. Updates every ~5,000 tokens or after every 3 tool calls.

### Lightweight Session Manifest Design

A minimal session manifest written by a SessionEnd hook:

```json
{
  "$schema": "wavepoint/session@1",
  "sessionId": "00893aaf-19fa-41d2-8238-13269b9b3ca0",
  "startedAt": "2026-03-06T10:15:00Z",
  "endedAt": "2026-03-06T10:47:00Z",
  "durationMinutes": 32,
  "model": "claude-opus-4-6",
  "branch": "initiative/studio-state-machine",
  "worktree": ".worktrees/studio-state-machine",
  "initiative": "studio-state-machine",
  "role": "systems-architect",
  "tokens": {
    "input": 145200,
    "output": 12800,
    "cacheRead": 89000,
    "cacheCreation": 56200
  },
  "filesModified": [
    "packages/studio-core/src/lib/studio/types.ts",
    "packages/studio-core/src/lib/studio/index.ts"
  ],
  "toolsUsed": ["Read", "Edit", "Bash", "Grep"],
  "outcome": "completed",
  "commits": ["a1b2c3d"],
  "workstreamEntry": "Implemented velocity signals for Process workspace"
}
```

**Production approach:** A Claude Code `SessionEnd` hook script that:
1. Reads the transcript JSONL (path provided in stdin)
2. Extracts token totals, model, branch, files modified, tool usage
3. Runs `git log --since=<session_start>` to capture commits
4. Writes manifest to `docs/sessions/<date>-<session-id-prefix>.json`

Achievable with a single shell script (~50 lines) or Node.js script.

### Dev Tools Modeling AI-Assisted Workflows

**GitHub Agentic Workflows (Technical Preview, Feb 2026):** Agent-powered workflows within GitHub Actions. Triggered by issues, PRs, schedules. Workflows written in Markdown instead of YAML. Uses GitHub MCP Server.

**Claude Code Agent Teams:** Built-in multi-agent orchestration. One leader session coordinates teammates. Communication via structured messages with timestamps, read/unread status, task completion notifications.

**Multi-Session Management Tools:**
- **amux** (Agent Multiplexer) — run dozens of parallel agents via tmux. Live status detection (working/needs input/idle) via SSE. Self-healing watchdog, shared kanban board, token stats.
- **agent-of-empires** — Session manager via tmux and git worktrees (directly relevant to WavePoint's worktree model).
- **AI Maestro** — Agent orchestrator with memory search, code graph queries, agent-to-agent messaging.

### Git-Based Signals

| Signal | Git Command | Meaning |
|--------|------------|---------|
| Commit frequency | `git log --since=7.days --oneline \| wc -l` | Activity level |
| Last commit date | `git log -1 --format=%ci -- <path>` | Staleness |
| Files changed per commit | `git log --stat --format=""` | Scope of work |
| Insertions/deletions | `git log --shortstat` | Volume of change |
| Branch activity | `git log --all --since=7.days` | Active branches |

The `jc` tool converts git log output to structured JSON.

### Minimum Viable Execution Monitoring

**Layer 1: Session Manifests via Hooks (Zero UI work)**
A `SessionEnd` hook writes a JSON manifest per session. ~1 session to build.

**Layer 2: Studio Reads Session Manifests (Light UI work)**
A new `loadSessions()` function reads manifests and surfaces active/recent session count on Mission Control, per-initiative session history, and a session timeline. ~1 session to add.

**Layer 3: Git Signal Enrichment (Already planned in studio-state-machine Phase 1)**
Session manifests add a richer signal layer on top of the velocity signals already planned.

**What NOT to Build:**
- OpenTelemetry spans/traces (designed for distributed systems)
- Real-time dashboards with SSE/WebSocket (needed for 10+ concurrent agents, not 3-5)
- Session replay (JSONL files already exist; analysis tools handle this)
- Cross-device orchestration (needed when agents run on multiple machines)

**The critical insight from amux:** Three-state model is the right granularity: **working** / **needs input** / **idle**. For WavePoint: **active** / **completed** / **stale**.

## Sources

- [Inside Claude Code: Session File Format](https://databunny.medium.com/inside-claude-code-the-session-file-format-and-how-to-inspect-it-b9998e66d56b) — JSONL schema documentation
- [Claude Code hidden conversation history](https://kentgigger.com/posts/claude-code-conversation-history) — Session file locations
- [Claude Code log analysis with DuckDB](https://liambx.com/blog/claude-code-log-analysis-with-duckdb) — Structured analysis approach
- [Claude Code Hooks reference](https://code.claude.com/docs/en/hooks) — SessionStart/SessionEnd hooks
- [Claude Code Hooks guide](https://code.claude.com/docs/en/hooks-guide) — Hook types and configuration
- [SessionEnd hook issue #6306](https://github.com/anthropics/claude-code/issues/6306) — Reliability discussion
- [Claude Code Session Memory](https://claudefa.st/blog/guide/mechanics/session-memory) — Session summaries
- [ccusage](https://ccusage.com/) — Token/cost analysis CLI
- [ccusage GitHub](https://github.com/ryoppippi/ccusage) — Source code
- [amux (Agent Multiplexer)](https://amux.io/) — Parallel agent management
- [amux GitHub](https://github.com/mixpeek/amux) — Source code
- [agent-of-empires](https://github.com/njbrake/agent-of-empires) — tmux + git worktrees session manager
- [AI Maestro](https://github.com/23blocks-OS/ai-maestro) — Agent orchestrator with messaging
- [Marc Nuri AI Dashboard](https://blog.marcnuri.com/ai-coding-agent-dashboard) — Cross-device session overview
- [GitHub Agentic Workflows](https://github.blog/ai-and-ml/automate-repository-tasks-with-github-agentic-workflows/) — Technical preview
- [Claude Code Agent Teams](https://code.claude.com/docs/en/agent-teams) — Built-in multi-agent
- [Claude Code Agent Teams (Addy Osmani)](https://addyosmani.com/blog/claude-code-agent-teams/) — Practical guide
- [CrewAI Tasks docs](https://docs.crewai.com/en/concepts/tasks) — TaskOutput data model
- [AutoGen Tracing](https://microsoft.github.io/autogen/stable//user-guide/agentchat-user-guide/tracing.html) — OpenTelemetry integration
- [LangGraph Persistence](https://docs.langchain.com/oss/python/langgraph/persistence) — Checkpoint schema
- [Semantic Kernel Observability](https://learn.microsoft.com/en-us/semantic-kernel/concepts/enterprise-readiness/observability/) — Three pillars
- [OTel GenAI Agent Spans](https://opentelemetry.io/docs/specs/semconv/gen-ai/gen-ai-agent-spans/) — Industry standard
- [OTel AI Agent Observability blog](https://opentelemetry.io/blog/2025/ai-agent-observability/) — Convergence trend
- [RouteLLM](https://github.com/lm-sys/RouteLLM) — Model routing with classifiers
- [Graphite: beyond commit counts](https://graphite.com/guides/measure-developer-productivity-beyond-commit-counts) — Git metrics caveats

## Raw Links

- https://docs.crewai.com/en/concepts/agents
- https://docs.crewai.com/en/concepts/tasks
- https://docs.crewai.com/core-concepts/Crews/
- https://docs.crewai.com/core-concepts/Pipeline/
- https://docs.crewai.com/how-to/AgentOps-Observability/
- https://github.com/crewAIInc/crewAI
- https://crewai.com/
- https://microsoft.github.io/autogen/stable//user-guide/agentchat-user-guide/tracing.html
- https://microsoft.github.io/autogen/0.2/docs/notebooks/agentchat_agentops/
- https://microsoft.github.io/autogen/0.2/docs/notebooks/agentchat_logging/
- https://microsoft.github.io/autogen/0.2/docs/ecosystem/agentops/
- https://github.com/microsoft/autogen
- https://learn.microsoft.com/en-us/agent-framework/migration-guide/from-autogen/
- https://www.langchain.com/langgraph
- https://docs.langchain.com/oss/python/langgraph/overview
- https://docs.langchain.com/oss/python/langgraph/persistence
- https://github.com/langchain-ai/langgraph
- https://pypi.org/project/langgraph-checkpoint/
- https://www.npmjs.com/package/@langchain/langgraph-checkpoint
- https://learn.microsoft.com/en-us/semantic-kernel/concepts/enterprise-readiness/observability/
- https://devblogs.microsoft.com/semantic-kernel/observability-in-semantic-kernel/
- https://devblogs.microsoft.com/semantic-kernel/the-golden-triangle-of-agentic-development-with-microsoft-agent-framework-ag-ui-devui-opentelemetry-deep-dive/
- https://github.com/MicrosoftDocs/semantic-kernel-docs/blob/main/agent-framework/user-guide/agents/agent-observability.md
- https://cloudsummit.eu/blog/microsoft-agent-framework-production-ready-convergence-autogen-semantic-kernel
- https://opentelemetry.io/docs/specs/semconv/gen-ai/
- https://opentelemetry.io/docs/specs/semconv/gen-ai/gen-ai-agent-spans/
- https://opentelemetry.io/docs/specs/semconv/gen-ai/gen-ai-metrics/
- https://opentelemetry.io/docs/specs/semconv/gen-ai/gen-ai-events/
- https://opentelemetry.io/docs/specs/semconv/gen-ai/gen-ai-spans/
- https://opentelemetry.io/blog/2025/ai-agent-observability/
- https://opentelemetry.io/blog/2024/otel-generative-ai/
- https://github.com/open-telemetry/semantic-conventions/blob/main/docs/gen-ai/gen-ai-spans.md
- https://github.com/AgentOps-AI/agentops
- https://google.github.io/adk-docs/integrations/agentops/
- https://research.aimultiple.com/agentic-monitoring/
- https://www.datadoghq.com/blog/llm-otel-semantic-convention/
- https://databunny.medium.com/inside-claude-code-the-session-file-format-and-how-to-inspect-it-b9998e66d56b
- https://kentgigger.com/posts/claude-code-conversation-history
- https://liambx.com/blog/claude-code-log-analysis-with-duckdb
- https://code.claude.com/docs/en/hooks
- https://code.claude.com/docs/en/hooks-guide
- https://www.datacamp.com/tutorial/claude-code-hooks
- https://www.ksred.com/claude-code-hooks-a-complete-guide-to-automating-your-ai-coding-workflow/
- https://claudefa.st/blog/tools/hooks/hooks-guide
- https://claudefa.st/blog/guide/mechanics/session-memory
- https://github.com/anthropics/claude-code/issues/6306
- https://github.com/anthropics/claude-code/issues/4318
- https://code.claude.com/docs/en/changelog
- https://introl.com/blog/claude-code-cli-comprehensive-guide-2025
- https://github.com/anthropics/claude-code/issues/5034
- https://code.claude.com/docs/en/agent-teams
- https://claudefa.st/blog/guide/agents/agent-teams
- https://gist.github.com/kieranklaassen/4f2aba89594a4aea4ad64d753984b2ea
- https://ccusage.com/
- https://github.com/ryoppippi/ccusage
- https://www.npmjs.com/package/ccusage
- https://ccusage.com/guide/json-output
- https://www.npmjs.com/package/better-ccusage
- https://github.com/aarora79/claude-code-usage-analyzer
- https://github.com/daaain/claude-code-log
- https://github.com/withLinda/claude-JSONL-browser
- https://github.com/HillviewCap/clog
- https://github.com/simonw/claude-code-transcripts
- https://shipyard.build/blog/claude-code-track-usage/
- https://blog.marcnuri.com/ai-coding-agent-dashboard
- https://amux.io/
- https://github.com/mixpeek/amux
- https://github.com/asheshgoplani/agent-deck
- https://github.com/nyanko3141592/tmuxcc
- https://github.com/njbrake/agent-of-empires
- https://github.com/Ark0N/Codeman
- https://github.com/23blocks-OS/ai-maestro
- https://github.com/tugcantopaloglu/openclaw-dashboard
- https://addyosmani.com/blog/claude-code-agent-teams/
- https://darasoba.medium.com/how-to-set-up-and-use-claude-code-agent-teams-and-actually-get-great-results-9a34f8648f6d
- https://halallens.no/en/blog/agentic-coding-in-2026-the-complete-guide-to-plugins-multi-model-orchestration-and-ai-agent-teams
- https://github.blog/ai-and-ml/automate-repository-tasks-with-github-agentic-workflows/
- https://github.blog/changelog/2026-02-13-github-agentic-workflows-are-now-in-technical-preview/
- https://github.github.com/gh-aw/
- https://www.infoq.com/news/2026/02/github-agentic-workflows/
- https://thenewstack.io/github-agentic-workflows-overview/
- https://linear.app/ai
- https://axify.io/blog/git-analytics
- https://linearb.io/blog/git-analytics
- https://github.com/ibarsi/git-velocity
- https://www.gitclear.com/gallery_of_free_git_stats_screenshots_examples
- https://www.gitclear.com/measuring_code_activity_a_comprehensive_guide_for_the_data_driven
- https://graphite.com/guides/measure-developer-productivity-beyond-commit-counts
- https://github.com/cncf/velocity
- https://gist.github.com/varemenos/e95c2e098e657c7688fd
- https://kellyjonbrazil.github.io/jc/docs/parsers/git_log.html
- https://til.simonwillison.net/jq/git-log-json
- https://github.com/dreamyguy/gitlogg
- https://www.npmjs.com/package/git-log-to-json
- https://markaicode.com/langgraph-production-agent/
- https://langfuse.com/guides/cookbook/integration_langgraph
- https://langfuse.com/blog/2024-07-ai-agent-observability-with-langfuse
- https://dev.to/setas/i-run-a-solo-company-with-ai-agent-departments-50nf
- https://news.ycombinator.com/item?id=47104424
- https://news.ycombinator.com/item?id=46902368

## Implications

1. **Claude Code already produces the data.** The JSONL session files contain everything needed. The `SessionEnd` hook provides the lifecycle event to capture it. No new logging protocol needed.
2. **The session manifest is the bridge between studio-state-machine and agent-infrastructure.** Studio-state-machine Phase 1 derives velocity from git/filesystem signals. Session manifests add agent-specific signals (tokens spent, model used, role exercised).
3. **The hook system is the right integration point.** Rather than building orchestration infrastructure, WavePoint can use Claude Code hooks to write manifests that Studio reads. Consistent with the filesystem-as-database pattern.
4. **OpenTelemetry is premature.** Industry converging on OTel GenAI conventions, but still "Development" status and designed for multi-team architectures. Watch but don't adopt yet.
5. **agent-of-empires is the closest analog.** Combines tmux session management with git worktrees — exactly Sherpa's model.
6. **ccusage provides immediate value.** Running `npx ccusage session --json` right now gives structured session data without any new code. Could be Phase 0.

## Open Questions

1. **Does `SessionEnd` hook fire reliably on all exit paths?** Issue #6306 requests better documentation. Mitigation: `SessionStart` writes partial manifest; `SessionEnd` completes it; cleanup script detects orphaned partials.
2. **Where should session manifests live?** Options: `docs/sessions/` (versioned), `.claude/sessions/` (local), or `data/sessions/`. Affects whether data is shared across worktrees.
3. **Should session manifests be committed to git?** Pro: becomes part of project history. Con: noise in git history, potentially sensitive data. Recommendation: commit summaries, keep detailed JSONL local.
4. **How does the hook script determine which initiative a session belongs to?** Parse `gitBranch` (if worktree conventions are followed), check `cwd` against worktree paths, or require explicit agent setting. The worktree convention (`initiative/<slug>` branch pattern) makes branch parsing reliable.
5. **What's the right granularity for "files modified"?** The JSONL contains every `tool_use` with `Edit`/`Write`, but listing every file touched could be noisy. Consider: only files in `src/` and `docs/`, or only files in the session's commits.
