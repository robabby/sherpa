# Vector 3: Agent Patterns — AI SDK vs CLI Agents

**Question:** What agent patterns does the AI SDK support, and how do they compare to CLI-based AI agents (Claude Code, Codex CLI, Gemini CLI)?
**Agent dispatched:** 2026-03-13

## Findings

### AI SDK Agent Loop

- **`ToolLoopAgent`** is the primary agent class. Wraps `generateText`/`streamText` with automatic tool calling, context management, and stopping conditions. Default: 20 steps max.
- **`stopWhen`** replaces older `maxSteps`. Built-in: `stepCountIs(n)`, `hasToolCall('toolName')`. Composable as array (OR logic).
- **`prepareStep`** callback runs between iterations — mutate tool availability, model parameters, or `experimental_context` per step. Enables dynamic strategy.
- **Agent interface**: `version: 'agent-v1'`, `id`, `tools`, `generate()`, `stream()`. Callbacks: `experimental_onStart`, `onStepFinish`, `onFinish`.

### AI SDK Tool Capabilities

- **No built-in tools.** The `tool()` helper defines custom tools with Zod schemas. File system access, command execution — you build it yourself.
- **Anthropic provider-level tools**: The `@ai-sdk/anthropic` provider exposes Anthropic-defined tools: computer control, text editing, bash execution, file operations. These are provider-specific.
- **Approval workflows**: `needsApproval` flag on tools enables human-in-the-loop.

### Context/Memory Management

- **`experimental_context`**: User-defined object flowing through generation lifecycle, persisted across steps via `prepareStep`. Manual state management, not automatic memory.
- **No built-in context window management.** No auto-summarization, compaction, or trimming. Middleware hooks could implement it, but nothing built-in.
- **Anthropic provider** supports conversation compaction as provider-specific feature.

### Capability Comparison

**CLI agents have that AI SDK agents lack:**

| Capability | CLI Agents | AI SDK |
|---|---|---|
| Built-in file read/write/edit | Yes | No — build your own |
| Built-in command execution | Yes (sandboxed) | No — build your own |
| Permission system | Yes (modes, approval prompts) | Partial (needsApproval) |
| Context window management | Yes (auto-compaction) | No — manual middleware |
| Session persistence/resumption | Yes | No built-in |
| Project-level memory (CLAUDE.md) | Yes | No equivalent |
| Sub-agents / agent teams | Yes (Agent tool) | No — single agent |
| Git worktree isolation | Yes | No |

**AI SDK agents have that CLI agents lack:**

| Capability | AI SDK | CLI Agents |
|---|---|---|
| Provider-agnostic | Yes (swap with one line) | No — vendor-locked |
| Embeddable in web apps | Yes (streaming to React) | No — CLI only |
| Fine-grained step control | Yes (prepareStep) | Limited |
| Structured output schemas | Yes (Output parameter) | Limited |
| Custom stopping conditions | Yes (composable stopWhen) | Limited |
| Middleware/interceptor pattern | Yes (wrapLanguageModel) | No |

### Claude Agent SDK — The Bridge

**Critical discovery: `@anthropic-ai/claude-agent-sdk`** gives you Claude Code's full toolset (Read, Write, Edit, Bash, Glob, Grep, WebSearch, WebFetch) as a library. Programmatic equivalent of `claude -p`, with hooks, subagents, MCP, session management, permission control.

The SDK positions itself as: "SDK for CI/CD, CLI for daily development."

### Real-World Usage

- AI SDK agent examples: primarily chat assistants and API-calling agents, not file-editing coding agents
- Claude Agent SDK demos: research agents with parallel subagents, email agent, resume generator — more autonomous patterns
- No evidence of AI SDK used for autonomous coding tasks comparable to CLI tools

### Headless Agents

- AI SDK is inherently headless — `generateText` is just an async function
- CLI agents have explicit headless modes (`-p` flag, `--output-format json`)
- Claude Agent SDK is the purpose-built bridge: Claude Code capabilities as a TypeScript library

## Sources

- https://ai-sdk.dev/docs/foundations/agents
- https://ai-sdk.dev/docs/reference/ai-sdk-core/step-count-is
- https://ai-sdk.dev/docs/reference/ai-sdk-core/generate-text
- https://ai-sdk.dev/docs/reference/ai-sdk-core/tool-loop-agent
- https://ai-sdk.dev/docs/ai-sdk-core/tools-and-tool-calling
- https://ai-sdk.dev/docs/ai-sdk-core/middleware
- https://ai-sdk.dev/docs/reference/ai-sdk-core/agent
- https://ai-sdk.dev/providers/ai-sdk-providers/anthropic
- https://platform.claude.com/docs/en/agent-sdk/overview
- https://github.com/anthropics/claude-agent-sdk-demos

## Implications

**Two-tier dispatch model emerges:**

- **AI SDK agents** for provider-agnostic tasks: research, analysis, content generation, structured extraction. No file system mutation needed. Swap models freely.
- **CLI agents / Claude Agent SDK** for autonomous coding: file editing, test running, git operations. Need full tool suite and context management.

The Claude Agent SDK could replace `./scripts/dispatch.sh claude` (shelling out to `claude -p`) with a direct import. Eliminates subprocess overhead, gives hooks for progress reporting, enables in-process coordination.

## Open Questions

1. Could Claude Agent SDK replace our claude.sh backend? SDK as library vs CLI as subprocess.
2. Can AI SDK's Anthropic provider + provider-level tools (bash, text editor) approximate Claude Code capabilities without the full Agent SDK?
3. AI SDK + Claude Agent SDK composition — can they work together?
4. Context window management gap for long-running AI SDK agents — who handles compaction?
5. Cost control — CLI has `--max-budget-usd`, AI SDK has no built-in equivalent.
