# Vector 1: Multi-Agent Fleet Management Interfaces

**Question:** What does "managing 10 agents" look like at the interface level? What products exist today and what patterns do they share?

## Product Survey

### GitHub Copilot Agent HQ + Mission Control

GitHub launched Agent HQ at Universe 2025 as a unified orchestration surface. Mission Control is the dashboard component — a single command center to assign, steer, and track multiple agents from anywhere. ([GitHub Blog](https://github.blog/news-insights/company-news/welcome-home-agents/))

Key UI elements:
- **Centralized task assignment** — submit prompts targeting different repositories from one dashboard ([GitHub Blog - How to orchestrate](https://github.blog/ai-and-ml/github-copilot/how-to-orchestrate-agents-using-mission-control/))
- **Multi-repo batching** — assign across repos without navigating to each one
- **Live session logs** — real-time reasoning artifacts showing what agents plan and why
- **Mid-run steering** — pause, refine instructions, or restart without termination
- **Multi-agent fleet** — Pro+ subscribers assign to Claude, Codex, or Copilot from one dashboard ([GitHub Agents](https://github.com/features/copilot/agents))
- **Batch review** — group API changes or documentation updates to reduce context-switching

Source: [GitHub Changelog - Mission Control](https://github.blog/changelog/2025-10-28-a-mission-control-to-assign-steer-and-track-copilot-coding-agent-tasks/)

### VS Code Agent Sessions View (Feb 2026)

VS Code 1.109 unified all agent types into a single management surface. ([VS Code Blog](https://code.visualstudio.com/blogs/2026/02/05/multi-agent-development))

Key UI elements:
- **Agent Sessions sidebar** — consolidated view of local, background, and cloud agent sessions with status, type, and file changes
- **Tabbed chat editors** — each agent conversation opens as a tab; mid-run course corrections via updates
- **Delegate button** — dropdown in chat view for routing tasks to specific agents without manual switching
- **Subagent visibility** — see which tasks are running, which agent is used, expand any subagent for full prompt and result
- **Handoff pattern** — transitions between agents or from planning to implementation with options to proceed or edit
- **Configure Agents** — command palette option to inspect built-in agent prompts and create custom variants

Source: [VS Code - Unified Agent Experience](https://code.visualstudio.com/blogs/2025/11/03/unified-agent-experience)

### Devin 2.0 Agent-Native IDE

Cognition reframed Devin from "autonomous engineer" to "agent-native IDE" with Devin 2.0 (April 2025). ([Cognition Blog](https://cognition.ai/blog/devin-2))

Key UX learnings from 18 months of operation:
- **Parallel sessions** — each session runs in its own isolated VM with a cloud-based IDE
- **Interactive timelapse** — replay a session to understand what happened
- **Slack integration** — users @mention Devin for ad-hoc queries, creating a casual delegation interface
- **Devin Search/Wiki** — non-chat interfaces for codebase querying and documentation
- **The awkward middle** — Devin's iterative workflow is "too slow to watch in real time, yet fast enough to interrupt deeper focus work" ([Scott Logic Blog](https://blog.scottlogic.com/2025/10/20/rapid-development-with-devin.html))
- **Clear scoping critical** — "handles clear upfront scoping well, but not mid-task requirement changes" ([Cognition Performance Review](https://cognition.ai/blog/devin-annual-performance-review-2025))

### OpenAI Codex App

Codex positions itself as a "command center for agentic coding." ([OpenAI Codex](https://openai.com/codex/))

Key patterns:
- **Parallel task threads** — multiple tasks running simultaneously in isolated cloud environments
- **Cross-platform interface** — macOS, Windows, CLI, and web
- **Worktree-based isolation** — agents work in parallel across projects using git worktrees
- **PR-based output** — agents propose pull requests for human review
- **Weeks of work in days** — framing emphasizes throughput over individual task management

Source: [OpenAI Introducing Codex](https://openai.com/index/introducing-codex/)

### Google Antigravity Agent Manager

Antigravity launched Nov 2025 as an "agent-first IDE." ([Google Developers Blog](https://developers.googleblog.com/build-with-google-antigravity-our-new-agentic-development-platform/))

Key UI elements:
- **Manager Surface** — dedicated interface for spawning, orchestrating, and observing multiple agents across workspaces
- **Artifacts** — agents generate tangible deliverables (task lists, implementation plans, screenshots, browser recordings) for verification at a glance
- **Three command surfaces** — editor, terminal, and browser, each with distinct agent interaction modes
- **Asynchronous execution** — delegate tasks and focus on primary work while observing progress

Source: [Arjan KC - Antigravity Deep Dive](https://www.arjankc.com.np/blog/google-antigravity-agent-manager-explained/)

### Claude Code Agent Teams (Feb 2026)

Anthropic's Agent Teams enables multi-session orchestration from the terminal. ([Claude Code Docs](https://code.claude.com/docs/en/agent-teams))

Key patterns:
- **Lead + teammates model** — one session coordinates, teammates work independently in own context windows
- **Inter-agent messaging** — teammates message each other directly, not just the lead
- **Shared task list** — teammates claim tasks from a shared filesystem-based list
- **Terminal navigation** — Shift+Down to cycle through teammates, direct messaging
- **Background sessions** — /resume screen groups forked sessions, keyboard shortcuts (P preview, R rename, B browse forks)

Source: [Addy Osmani - Claude Code Swarms](https://addyosmani.com/blog/claude-code-agent-teams/)

### Amazon Q Developer

Amazon Q operates across IDE, CLI, AWS Console, and Slack. ([AWS Features](https://aws.amazon.com/q/developer/features/))

Key patterns:
- **Autonomous loop with exit** — agent has logic to prevent unproductive paths, autonomously decides when done, exits and returns candidate patches
- **Accept entirely / partially / modify** — three-tier review granularity for agent output
- **No dedicated dashboard** — agent work surfaces through existing IDE and AWS Console interfaces

Source: [AWS Blog - Reinventing Q Developer](https://aws.amazon.com/blogs/devops/reinventing-the-amazon-q-developer-agent-for-software-development/)

## Community / Open Source Mission Control Projects

### builderz-labs/mission-control
32-panel open-source dashboard: agents, tasks, skills, logs, tokens, memory, security, cron, alerts, webhooks, pipelines. Kanban with six columns, drag-and-drop, priority levels. Auto-discovers Claude Code sessions from ~/.claude/projects/. SQLite-only, single pnpm start. ([GitHub](https://github.com/builderz-labs/mission-control))

### MeisnerDan/mission-control
Agent-first task management with Eisenhower Matrix, Kanban Board, Goal Hierarchy, Brain Dump. 5 built-in agents plus custom. Autonomous Daemon that polls tasks, spawns Claude Code sessions, enforces concurrency with real-time dashboards. ([GitHub](https://github.com/MeisnerDan/mission-control))

### Claude Squad
Terminal multiplexer for parallel Claude Code instances via tmux panes. Smart status detection (thinking vs. waiting), session forking with context inheritance. ([GitHub](https://github.com/smtg-ai/claude-squad))

### Agent Deck
Terminal session manager built with Go + Bubble Tea. Status at a glance (running/waiting/idle), single-keystroke switching, session forking with history inheritance, MCP server attachment without config, Docker sandboxing, git worktree support. ([GitHub](https://github.com/asheshgoplani/agent-deck))

### Composio Agent Orchestrator
Dual-layer architecture (Planner + Worker). Each agent gets own git worktree, branch, and PR. Auto-handles CI fixes, merge conflicts, code reviews. 30 concurrent agents used in self-referential development. ([GitHub](https://github.com/ComposioHQ/agent-orchestrator))

## Converging Patterns

1. **Session-based, not board-based** — every product uses sessions/threads, not kanban columns
2. **Parallel-by-default** — all products support multiple simultaneous agents
3. **Isolation via git worktrees or VMs** — agents don't step on each other
4. **PR as deliverable** — the universal output artifact is a pull request
5. **Mid-run steering** — pause/refine/restart is expected, not just start/stop
6. **Status is 3-4 states** — working / waiting-for-input / completed / failed (not a rich pipeline)
7. **No product has solved the fleet overview** — GitHub Mission Control is closest, but even it is sequential task lists, not spatial fleet awareness

## What's Missing

- **No product provides a spatial/topological view of agent activity** — everything is lists
- **No product maps agents to strategic objectives** — tasks are disconnected from initiatives/goals
- **Inter-agent communication is nascent** — only Claude Code Agent Teams has direct agent-to-agent messaging
- **Cost visibility per agent/task is rare** — builderz mission-control tracks tokens, but most don't
- **Notification design is underdeveloped** — when should an agent interrupt you? No product answers this well

## Sources

- [GitHub Agent HQ](https://github.blog/news-insights/company-news/welcome-home-agents/)
- [GitHub Mission Control Changelog](https://github.blog/changelog/2025-10-28-a-mission-control-to-assign-steer-and-track-copilot-coding-agent-tasks/)
- [GitHub Mission Control Orchestration Guide](https://github.blog/ai-and-ml/github-copilot/how-to-orchestrate-agents-using-mission-control/)
- [VS Code Multi-Agent Development](https://code.visualstudio.com/blogs/2026/02/05/multi-agent-development)
- [VS Code Unified Agent Experience](https://code.visualstudio.com/blogs/2025/11/03/unified-agent-experience)
- [Cognition Devin 2.0](https://cognition.ai/blog/devin-2)
- [Cognition Devin Performance Review 2025](https://cognition.ai/blog/devin-annual-performance-review-2025)
- [OpenAI Codex](https://openai.com/index/introducing-codex/)
- [Google Antigravity](https://developers.googleblog.com/build-with-google-antigravity-our-new-agentic-development-platform/)
- [Claude Code Agent Teams](https://code.claude.com/docs/en/agent-teams)
- [Addy Osmani - Claude Code Swarms](https://addyosmani.com/blog/claude-code-agent-teams/)
- [builderz-labs/mission-control](https://github.com/builderz-labs/mission-control)
- [MeisnerDan/mission-control](https://github.com/MeisnerDan/mission-control)
- [Claude Squad](https://github.com/smtg-ai/claude-squad)
- [Agent Deck](https://github.com/asheshgoplani/agent-deck)
- [Composio Agent Orchestrator](https://github.com/ComposioHQ/agent-orchestrator)
- [Scott Logic - Rapid Development with Devin](https://blog.scottlogic.com/2025/10/20/rapid-development-with-devin.html)
- [AWS Q Developer Features](https://aws.amazon.com/q/developer/features/)
- [AWS Blog - Reinventing Q Developer](https://aws.amazon.com/blogs/devops/reinventing-the-amazon-q-developer-agent-for-software-development/)
- [Arjan KC - Antigravity Agent Manager](https://www.arjankc.com.np/blog/google-antigravity-agent-manager-explained/)
