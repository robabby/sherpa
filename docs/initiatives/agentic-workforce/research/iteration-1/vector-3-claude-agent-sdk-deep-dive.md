# Vector 3: Claude Agent SDK Deep Dive

**Question:** What is the Claude Agent SDK, and could it serve as Sherpa's orchestration layer?
**Agent dispatched:** 2026-03-10

## Findings

### What it is

The Claude Agent SDK (formerly "Claude Code SDK", renamed late 2025) is the same agent runtime powering Claude Code, packaged as a library. TypeScript (`@anthropic-ai/claude-agent-sdk` v0.2.71) and Python (`claude-agent-sdk` v0.1.48).

Provides:
- The full agent loop (prompt -> tools -> results -> repeat)
- Built-in tools: Read, Write, Edit, Bash, Glob, Grep, WebSearch, WebFetch, Agent (subagents), Skill, TodoWrite
- Session management: resume, fork, continue
- MCP integration
- Hooks: PreToolUse, PostToolUse, Stop, SessionStart, SubagentStart/Stop, PreCompact
- Structured outputs (JSON Schema / Zod / Pydantic)
- CLAUDE.md and project settings loading

### Parallel dispatch: three mechanisms

1. **Subagents** — Define `AgentDefinition` (description, prompt, tools, model). Isolated context windows. Multiple run concurrently. Cannot nest. Model override per subagent.
2. **Agent Teams** (experimental, CLI-only) — Multiple full Claude Code instances coordinating via shared task list and mailbox. Not available through SDK.
3. **Parallel tool execution** — Within single agent, read-only tools run concurrently.

### Planner/Worker/Judge support

Not a first-class pattern, but all primitives exist:
- **Planner**: `permissionMode: "plan"` creates read-only planning mode
- **Worker**: Subagents with write access
- **Judge**: Subagent with read-only tools + structured output for verdict schema
- **Orchestration**: You write the loop — the SDK doesn't provide a built-in pipeline

Anthropic's own multi-agent research system uses orchestrator-worker pattern. Cut research time by 90%.

### Comparison: SDK vs. `claude --print`

| Aspect | `claude --print` | Agent SDK |
|--------|-------------------|-----------|
| Error handling | Exit code + grep | `ResultMessage.subtype` (typed) |
| Cost tracking | None | `total_cost_usd`, per-model breakdown |
| Parallel dispatch | Manual `&` | Subagents with isolated contexts |
| Session continuity | None | Session IDs, resume, fork |
| Tool permissions | `--permission-mode` flag | Programmatic `allowedTools` per subagent |
| Structured output | Regex on stdout | JSON Schema validated |
| Worktree isolation | `--worktree` flag | `cwd` option (manual worktree creation) |

### Local model support: Claude-only

The SDK calls Anthropic Messages API only. Does not support OpenAI-compatible endpoints. Sherpa's `lm-worker.mjs` (LM Studio) cannot be replaced by the SDK. Hybrid approach needed.

### Pricing

No SDK-specific markup. Same per-token pricing as API. Tool overhead: Bash ~245 tokens, editor ~700 tokens per invocation. Anthropic reports agents use ~4x more tokens than chat, multi-agent ~15x. Cost controls: `maxBudgetUsd` and `maxTurns` per query.

### Recommended migration architecture

```
orchestrator.ts (uses @anthropic-ai/claude-agent-sdk)
  |-- reads docs/tasks/*.md
  |-- creates git worktrees (via Bash)
  |-- code tasks (backend: claude): query() with cwd, allowedTools, maxBudgetUsd
  |-- content tasks (backend: lm-studio): direct fetch() (unchanged)
  |-- judging (claude): query() with read-only tools + structured verdict schema
  |-- judging (local): direct fetch() to LM Studio (unchanged)
```

Estimated migration: 2-3 sessions.

## Sources

- [Agent SDK Overview](https://platform.claude.com/docs/en/agent-sdk/overview)
- [Agent Loop](https://platform.claude.com/docs/en/agent-sdk/agent-loop)
- [Subagents](https://platform.claude.com/docs/en/agent-sdk/subagents)
- [Agent Teams](https://code.claude.com/docs/en/agent-teams)
- [Cost Tracking](https://platform.claude.com/docs/en/agent-sdk/cost-tracking)
- [Structured Outputs](https://platform.claude.com/docs/en/agent-sdk/structured-outputs)
- [Anthropic multi-agent research](https://www.anthropic.com/engineering/multi-agent-research-system)
- [Building Agents blog](https://www.anthropic.com/engineering/building-agents-with-the-claude-agent-sdk)

## Raw Links

- https://platform.claude.com/docs/en/agent-sdk/overview
- https://platform.claude.com/docs/en/agent-sdk/agent-loop
- https://platform.claude.com/docs/en/agent-sdk/subagents
- https://platform.claude.com/docs/en/agent-sdk/custom-tools
- https://platform.claude.com/docs/en/agent-sdk/cost-tracking
- https://platform.claude.com/docs/en/agent-sdk/structured-outputs
- https://platform.claude.com/docs/en/agent-sdk/typescript
- https://platform.claude.com/docs/en/agent-sdk/python
- https://platform.claude.com/docs/en/agent-sdk/typescript-v2-preview
- https://code.claude.com/docs/en/agent-teams
- https://www.anthropic.com/engineering/multi-agent-research-system
- https://www.anthropic.com/engineering/building-agents-with-the-claude-agent-sdk
- https://github.com/anthropics/claude-agent-sdk-python
- https://github.com/anthropics/claude-agent-sdk-typescript
- https://github.com/anthropics/claude-agent-sdk-demos
- https://www.npmjs.com/package/@anthropic-ai/claude-agent-sdk
- https://github.com/ruvnet/ruflo
- https://github.com/nwiizo/ccswarm
- https://github.com/wshobson/agents
- https://github.com/ComposioHQ/agent-orchestrator
- https://docs.ollama.com/integrations/claude-code
- https://lmstudio.ai/blog/claudecode
- https://dev.to/bredmond1019/multi-agent-orchestration-running-10-claude-instances-in-parallel-part-3-29da
- https://shipyard.build/blog/claude-code-multi-agent/
- https://paddo.dev/blog/claude-code-hidden-swarm/

## Implications

The Claude Agent SDK is the natural upgrade path from `claude --print` shell dispatch. It adds typed cost tracking, structured outputs, and programmatic session management — all things Sherpa's custom scripts currently lack. But it's Claude-only, so the hybrid approach (SDK for Claude workers, direct API for LM Studio workers) must be preserved.

## Open Questions

1. Can multiple `query()` calls run in parallel via `Promise.all()`?
2. Does `maxBudgetUsd` include subagent costs?
3. V2 TypeScript SDK stability — build on V1 or V2?
4. Will Agent Teams ever be available through the SDK?
