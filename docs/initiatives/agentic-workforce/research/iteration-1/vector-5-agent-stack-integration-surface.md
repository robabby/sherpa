# Vector 5: Agent Stack Integration Surface

**Question:** How can Sherpa connect to, be enabled by, or leverage the emerging AI Agent Stack — specifically OpenClaw, NVIDIA's platform, and the broader ecosystem?
**Agent dispatched:** 2026-03-10

## Findings

### Markdown + YAML frontmatter is the universal agent format

OpenClaw skills, Claude Code subagents, ccswarm tasks, Agent Message Queue messages, GitHub Copilot AGENTS.md, and Sherpa's task files all use the same format. Sherpa's format choice was correct from the start — it's the industry convention.

### Claude Code subagents are the native replacement for `claude-worker.sh`

Claude Code now has built-in `isolation: worktree`, `background: true`, `permissionMode: acceptEdits`, and `memory: project` — everything the shell script does manually. Sherpa's `docs/agents/roles/*.md` files are 90% of the way to Claude subagent format already.

### OpenClaw: messaging/automation framework, not coding agent

OpenClaw's value for Sherpa is as:
- **Notification layer** — Telegram/Slack alerts when tasks complete
- **Workflow engine** — Lobster (deterministic pipelines) for dispatch->execute->judge cycle
- **Distribution channel** — Sherpa domain primitives as OpenClaw skills

NOT as a replacement for Claude-based coding agents.

### NVIDIA's agent platform

NVIDIA preparing to launch open-source AI agent platform, timed around developer conference. Described as "similar to agent-based systems like OpenClaw." Positions NVIDIA as full-stack AI company (hardware + agent software). Details sparse — architecture and plugin system not yet public.

### Git worktrees: validated industry standard

Every serious multi-agent coding system uses worktrees: Claude subagents, ccswarm, Composio, parallel-worktrees tools. Sherpa's approach is independently validated.

### Sherpa's multi-model routing is rare

Most frameworks assume a single LLM provider. Sherpa's Claude + LM Studio/Qwen routing is genuinely differentiated. Worth preserving.

### MCP and A2A: relevant for platform, not orchestration

MCP is the right integration point for Sherpa's domain primitives to be consumed by external agents. A2A protocol (Google, Linux Foundation) for agent-to-agent communication. Both matter for the platform/API surface, not for internal development workflows.

### A deterministic workflow engine would fill a real gap

Current dispatch is ad-hoc shell scripts. A Lobster-style YAML step runner would add retry logic, structured conditions, approval gates, and resume tokens. ~50 lines of implementation, no framework adoption required.

## Five Integration Paths Ranked

| Path | Value | Effort | Description |
|------|-------|--------|-------------|
| A: Migrate to Claude Code subagents | Highest | Low | Convert role files to `.claude/agents/`, replace shell dispatch |
| B: Task board as MCP server | Medium | Low | Wrap `task-scanner.mjs` for any MCP client |
| C: Deterministic workflow definitions | Medium | Medium | YAML step runner for dispatch->execute->judge |
| D: OpenClaw as notification layer | Useful | Low | Read task board, send Telegram/Slack notifications |
| E: Full OpenClaw multi-agent | Future | High | Relevant at 10+ concurrent agents |

## Sources

- [OpenClaw docs](https://openclaw.ai/) — Skills system, memory, architecture
- [OpenClaw ContextEngine](https://www.epsilla.com/blogs/2026-03-09-openclaw-2026-3-7-contextengine-agentic-architecture) — Pluggable context management
- [NVIDIA agent platform (Wired)](https://www.wired.com/story/nvidia-planning-ai-agent-platform-launch-open-source/) — Planned launch
- [Claude Code subagents](https://platform.claude.com/docs/en/agent-sdk/subagents) — Native worktree isolation
- [A2A Protocol](https://developers.googleblog.com/en/a2a-a-new-era-of-agent-interoperability/) — Agent interoperability

## Raw Links

- https://openclaw.ai/
- https://docs.openclaw.ai/concepts/memory
- https://docs.openclaw.ai/skills
- https://www.epsilla.com/blogs/2026-03-09-openclaw-2026-3-7-contextengine-agentic-architecture
- https://www.crowdstrike.com/en-us/blog/what-security-teams-need-to-know-about-openclaw-ai-super-agent/
- https://en.wikipedia.org/wiki/OpenClaw
- https://github.com/openclaw/openclaw
- https://www.wired.com/story/nvidia-planning-ai-agent-platform-launch-open-source/
- https://platform.claude.com/docs/en/agent-sdk/subagents
- https://code.claude.com/docs/en/agent-teams
- https://developers.googleblog.com/en/a2a-a-new-era-of-agent-interoperability/
- https://github.com/a2aproject/A2A
- https://www.linuxfoundation.org/press/linux-foundation-launches-the-agent2agent-protocol-project-to-enable-secure-intelligent-communication-between-ai-agents
- https://github.com/nwiizo/ccswarm
- https://composio.dev/

## Implications

Sherpa's system doesn't need to "adopt" an agent stack — it needs to **expose integration surfaces**. MCP is the bridge for platform primitives. The task board could become an MCP server. OpenClaw skills are a distribution channel. The internal orchestration stays custom but migrates incrementally from shell scripts to Claude Agent SDK.

## Open Questions

1. What does OpenClaw's skill authoring API actually look like? Could Sherpa publish astrology skills?
2. When NVIDIA's platform launches, what integration points will it offer?
3. Should Sherpa's task board be an MCP server for external agents to query?
4. Is there a business model for "computation provider" in agent ecosystems?
