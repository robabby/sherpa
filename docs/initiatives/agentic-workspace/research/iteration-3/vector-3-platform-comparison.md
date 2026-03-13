# Vector 3: Platform Comparison — Who Owns What Layer?

**Question:** How do Claude Code, Cursor, Windsurf/Devin, Antigravity, GitHub Agent HQ, and Microsoft Agent 365 compare as agent OS candidates? What layer does each own?

## Key Discoveries

### Platform Layer Map

| Platform | Primary Layer | State Model | Fleet Management | Governance | Identity | Protocol Support |
|----------|--------------|-------------|------------------|------------|----------|-----------------|
| Claude Code | Execution + Convention | Filesystem (`~/.claude/tasks`), DAG-based | Agent Teams (experimental), subagents | Convention-as-code (CLAUDE.md, skills, rules) | Session-scoped, no persistent identity | MCP native, Agent Skills |
| Cursor | IDE + Execution | Shadow Workspace (parallel test env) | Parallel agent execution in isolated environments | .cursorrules (project-level) | Session-scoped | MCP, AGENTS.md |
| Windsurf/Devin | Cloud Execution | Cascade Engine (graph-based), cloud sandboxes | Multiple parallel Devins, each with own IDE | Playbooks (organizational SOPs) | Workspace-level with knowledge graph | MCP |
| Antigravity | IDE + Fleet Management | Artifact-based (plans, diffs, recordings) | Mission Control dashboard, async agents | Artifact verification (human review of plans) | Per-agent instance, no cross-session | A2A, MCP via Google ecosystem |
| GitHub Agent HQ | Fleet Management + Governance | PR-based (agent work produces PRs) | Mission Control across repos, real-time logs | Enterprise control plane (permissions, audit) | GitHub identity (org/team scoping) | MCP, multi-provider (Anthropic, OpenAI, Google, xAI) |
| Microsoft Agent 365 | Enterprise Governance | Copilot/Copilot Studio state | Multi-agent orchestration routing | Unified control plane (logging, audit, compliance, cost) | Entra ID integration | MCP, A2A, AG-UI |
| VS Code | Platform/Hub | Agent Sessions view (unified) | Unified command center for heterogeneous agents | Extension marketplace governance | Extension identity model | MCP, Agent Skills, chatSkills |

### Claude Code: Deepest Convention Layer

Claude Code has evolved the most sophisticated filesystem-based governance:
- **Tasks** (v2.1.16) — DAG-based task management written to `~/.claude/tasks`. Supports blocking dependencies. Survives terminal shutdown, machine switches, crash recovery.
- **Agent Teams** — Multiple Claude instances coordinate through direct communication. Lead assigns, teammates work independently. No persistent identity across sessions. Experimental.
- **Shared state** via `CLAUDE_CODE_TASK_LIST_ID` — Multiple instances read/write the same task list. Broadcasting without external orchestration.
- **Hooks** — `SessionStart`/`SessionEnd` lifecycle events. Session transcripts in JSONL at `~/.claude/projects/<path>/sessions/<uuid>.jsonl`.
- **Skills** — Open standard, 351K+ skills, adopted by Codex CLI and VS Code.
- **Background agents** — Ctrl+B to background a subagent. Async execution.

Limitation: "Subagents exist for the duration of a session and then disappear, with no persistent identity, memory across sessions, or /resume capability."

- [Claude Code Agent Teams](https://code.claude.com/docs/en/agent-teams)
- [Claude Code Tasks (VentureBeat)](https://venturebeat.com/orchestration/claude-codes-tasks-update-lets-agents-work-longer-and-coordinate-across)
- [Claude Code Async](https://claudefa.st/blog/guide/agents/async-workflows)

### Cursor: Shadow Workspace Innovation

Cursor's key architectural contribution is the **Shadow Workspace** — a hidden, parallel project copy where the AI tests its own code before presenting it to the user. Runs LSPs, linters, unit tests in isolation. Self-corrects in recursive loops. This is runtime verification without calling it governance.

Multi-mode execution: Tab (autocomplete), Cmd-K (inline edits), Chat panel, Agent mode (multi-step). Parallel agent execution in isolated environments for multi-file refactoring.

Revenue: $1.2B ARR (1,100% YoY growth).

- [Dev.to comparison](https://dev.to/pockit_tools/cursor-vs-windsurf-vs-claude-code-in-2026-the-honest-comparison-after-using-all-three-3gof)
- [NxCode comparison](https://www.nxcode.io/resources/news/cursor-vs-windsurf-vs-claude-code-2026)

### Devin 2.0: Cloud-Native Agent Platform

Three distinctive features:
- **Playbooks** — Documents providing step-by-step instructions for common tasks. Shared within orgs. "Programs without the rigid syntax." This is a convention system.
- **Knowledge** — General org context + auto-indexed repository wiki with architecture diagrams. Updated every few hours.
- **Interactive Planning** — Agent researches codebase, presents plan, human modifies before execution.

Each Devin runs in a sandboxed cloud environment with terminal, code editor, and browser. Multiple parallel Devins operate simultaneously.

Revenue: Part of Cognition AI (acquired Windsurf Dec 2025).

- [Cognition blog](https://cognition.ai/blog/devin-2)
- [Devin docs](https://docs.devin.ai/release-notes/overview)
- [Medium architecture deep-dive](https://medium.com/@takafumi.endo/agent-native-development-a-deep-dive-into-devin-2-0s-technical-design-3451587d23c0)

### Google Antigravity: Mission Control Pattern

The purest "fleet management" approach. Developer becomes "Architect" or "Mission Controller." Each agent instance is visible in the Manager View with status and Artifacts.

Artifacts = agent work products for human verification: task lists, implementation plans, code diffs, screenshots, browser recordings. This is artifact-based governance — the agent produces evidence of its reasoning for human review.

- [Google Codelabs](https://codelabs.developers.google.com/getting-started-google-antigravity)
- [Agent Manager guide](https://www.arjankc.com.np/blog/google-antigravity-agent-manager-explained/)
- [BayTech review](https://www.baytechconsulting.com/blog/google-antigravity-ai-ide-2026)

### GitHub Agent HQ: Multi-Provider Fleet

The only platform that natively orchestrates agents from different providers within a single interface. Pick from a fleet of agents (Copilot, Claude, Codex, Gemini, Devin), assign them work in parallel, track from any device.

Enterprise governance: dedicated control plane for AI access management. Admin-defined agent permissions, security policies, audit logs.

Open-source alternatives exist: [builderz-labs/mission-control](https://github.com/builderz-labs/mission-control), [crshdn/mission-control](https://github.com/crshdn/mission-control).

- [GitHub blog](https://github.blog/news-insights/company-news/welcome-home-agents/)
- [VS Code multi-agent](https://code.visualstudio.com/blogs/2026/02/05/multi-agent-development)

### Microsoft Agent 365: Enterprise Control Plane

The most mature enterprise governance offering:
- GA May 1, 2026 (part of Microsoft 365 plans or standalone)
- Agent visibility across all Microsoft 365 Copilot and Copilot Studio agents
- Detailed logging, security event reporting, audit trails
- Multi-agent orchestration routing specialized tasks to the right agent
- Cost tracking across environments
- Performance metrics

Paired with **Microsoft Agent Framework** (Semantic Kernel + AutoGen merger, GA Q1 2026): OpenTelemetry observability, Entra ID authentication, human-in-the-loop approval, durable stateful tasks.

- [Microsoft Agent 365](https://www.microsoft.com/en-us/microsoft-agent-365)
- [Microsoft Agent Framework](https://learn.microsoft.com/en-us/agent-framework/overview/)
- [Copilot Studio governance](https://learn.microsoft.com/en-us/microsoft-copilot-studio/security-and-governance)

### VS Code: The Hub Strategy

VS Code 1.109-1.110 (Jan-Mar 2026) positioned itself as the multi-agent development hub:
- Runs Claude, Codex, and Copilot side-by-side
- Agent Sessions view for unified management
- Three execution models: local agents, background agents (CLI/worktrees), cloud agents
- MCP Apps: tool calls return interactive UI (dashboards, forms, visualizations)
- Agent Skills as chatSkills contribution point
- Agent plugins (1.110): installable bundles via marketplace

Claude Code leads VS Code Marketplace adoption for "agent" tagged tools.

- [VS Code multi-agent blog](https://code.visualstudio.com/blogs/2026/02/05/multi-agent-development)
- [VS Code agent plugins (1.110)](https://visualstudiomagazine.com/articles/2026/03/04/vs-code-1-110-ships-with-agent-plugins-browser-tools-and-session-memory.aspx)
- [Agent Skills in VS Code](https://code.visualstudio.com/docs/copilot/customization/agent-skills)

## Synthesis: Three Competing Paradigms

1. **IDE as OS** (Cursor, VS Code, Antigravity) — The IDE becomes the management surface. Agents are extensions/plugins within the editor.

2. **Cloud Platform as OS** (Devin, AWS AgentCore) — Cloud-native sandboxed environments. Agents run as managed services with persistent state.

3. **Convention System as OS** (Claude Code + CLAUDE.md/skills/rules, OpenClaw + SOUL.md) — Filesystem conventions are the governance layer. The "OS" is the set of files the agent reads on startup.

GitHub Agent HQ and Microsoft Agent 365 are *meta-platforms* — they sit above the IDE/cloud divide and provide fleet-level governance regardless of where agents execute.

## Implications for Sherpa

Sherpa's approach (convention-as-code governance) most closely resembles paradigm 3, but with a critical difference: Sherpa treats governance as a *framework* that produces the convention files, not just the convention files themselves. The `defineConfig()` + `sherpa sync` model is framework-level — it generates the CLAUDE.md, AGENTS.md, rules, and skills that other tools consume.

This positions Sherpa as a governance framework that plugs into any paradigm: its output (convention files) works in IDE-as-OS, cloud-as-OS, and convention-as-OS environments.

## All URLs Encountered

- https://code.claude.com/docs/en/agent-teams
- https://claudefa.st/blog/guide/agents/agent-teams
- https://cobusgreyling.medium.com/claude-code-agent-teams-ca3ec5f2d26a
- https://releasebot.io/updates/anthropic/claude-code
- https://venturebeat.com/orchestration/claude-codes-tasks-update-lets-agents-work-longer-and-coordinate-across
- https://support.claude.com/en/articles/13345190-get-started-with-cowork
- https://techcrunch.com/2026/02/05/anthropic-releases-opus-4-6-with-new-agent-teams/
- https://dev.to/pockit_tools/cursor-vs-windsurf-vs-claude-code-in-2026-the-honest-comparison-after-using-all-three-3gof
- https://www.nxcode.io/resources/news/cursor-vs-windsurf-vs-claude-code-2026
- https://cognition.ai/blog/devin-2
- https://docs.devin.ai/release-notes/overview
- https://medium.com/@takafumi.endo/agent-native-development-a-deep-dive-into-devin-2-0s-technical-design-3451587d23c0
- https://cognition.ai/blog/devin-annual-performance-review-2025
- https://codelabs.developers.google.com/getting-started-google-antigravity
- https://www.aifire.co/p/mastering-the-antigravity-agent-manager-2026-guide-part-1
- https://www.baytechconsulting.com/blog/google-antigravity-ai-ide-2026
- https://www.arjankc.com.np/blog/google-antigravity-agent-manager-explained/
- https://github.blog/news-insights/company-news/welcome-home-agents/
- https://github.blog/ai-and-ml/github-copilot/how-to-orchestrate-agents-using-mission-control/
- https://www.eficode.com/blog/why-github-agent-hq-matters-for-engineering-teams-in-2026
- https://github.com/builderz-labs/mission-control
- https://github.com/crshdn/mission-control
- https://www.microsoft.com/en-us/microsoft-agent-365
- https://learn.microsoft.com/en-us/agent-framework/overview/
- https://learn.microsoft.com/en-us/microsoft-copilot-studio/security-and-governance
- https://code.visualstudio.com/blogs/2026/02/05/multi-agent-development
- https://visualstudiomagazine.com/articles/2026/03/04/vs-code-1-110-ships-with-agent-plugins-browser-tools-and-session-memory.aspx
- https://code.visualstudio.com/docs/copilot/customization/agent-skills
- https://visualstudiomagazine.com/articles/2026/02/26/claude-code-edges-openais-codex-in-vs-codes-agentic-ai-marketplace-leaderboard.aspx
- https://devvela.com/blog/ai-coding-agents
- https://www.sitepoint.com/claude-code-vs-cursor-comparison/
- https://www.aimakers.co/blog/ai-agents-landscape-2026/
- https://www.morphllm.com/ai-coding-agent
- https://www.verdent.ai/guides/ai-coding-tools-comparison-2026
