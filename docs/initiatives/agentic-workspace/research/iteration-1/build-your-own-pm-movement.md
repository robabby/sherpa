# The "Build Your Own PM" Movement: AI-Native Workspaces Survey

**Vector:** What are teams actually building when they replace Jira/Linear/Notion with custom AI-native tools?
**Date:** 2026-03-12
**Scope:** Survey of the "build your own PM" movement enabled by AI coding assistants and agents

---

## Key Discoveries

### 1. The SaaS Replacement Wave Is Real and Quantified

- **35% of enterprises have already replaced at least one SaaS tool with custom-built software** and 78% expect to build more in 2026 — [Retool 2026 Build vs Buy Report](https://retool.com/blog/ai-build-vs-buy-report-2026)
- **Project management is the 5th most-replaced SaaS category** (23% replacement rate), behind workflow automations (35%), internal admin tools (33%), BI tools (29%), and CRMs/form builders (25%) — [Retool report](https://www.businesswire.com/news/home/20260217548274/en/Retools-2026-Build-vs.-Buy-Report-Reveals-35-of-Enterprises-Have-Already-Replaced-SaaS-With-Custom-Software)
- **Klarna shut down ~1,200 SaaS subscriptions** and consolidated onto an internal stack built on Neo4j + 300+ custom GPTs. Their CEO explicitly announced replacing Jira/Bitbucket/Atlassian with internally built tools — [LinkedIn post](https://www.linkedin.com/posts/sebastian-siemiatkowski-768977_sorry-jira-bitbucket-and-atlassian-you-are-activity-7363555407107145730-eTJl), [SaaS consolidation analysis](https://efipm.medium.com/from-saas-bloat-to-ai-native-klarnas-tech-stack-overhaul-4cbcd1c2ecb0), [HN discussion](https://news.ycombinator.com/item?id=44961478)
- **Rokt built 135 internal applications in 24 hours** during a company hackathon, many now in production use — [Replit case study](https://replit.com/customers/rokt)
- **60% of builders created tools outside IT oversight** in the past year. 64% of those are senior managers, not rogue juniors — [Retool report](https://retool.com/blog/ai-build-vs-buy-report-2026)

### 2. A Cambrian Explosion of Agent Orchestration Tools

The most striking finding: **dozens of open-source tools have emerged in 2025-2026 specifically for managing fleets of AI coding agents.** These tools look nothing like traditional PM software — they are kanban boards crossed with terminal multiplexers crossed with git worktree managers.

**Kanban + Agent Orchestration Tools:**
- **Vibe Kanban** (23.1k GitHub stars, 30k+ users) — Plan/Prompt/Review workflow, runs multiple coding agents in parallel. Built by Bloop AI. `npx vibe-kanban` — [vibekanban.com](https://www.vibekanban.com/), [GitHub](https://github.com/BloopAI/vibe-kanban)
- **OpenKanban** — TUI kanban board where each ticket gets its own git worktree and embedded terminal — [GitHub](https://github.com/TechDufus/openkanban)
- **Dorothy** — Electron desktop app with Kanban board, "Super Agent" meta-orchestrator, 5 MCP servers with 40+ tools, cron scheduling, Telegram/Slack integration — [GitHub](https://github.com/Charlie85270/Dorothy), [dorothyai.app](https://dorothyai.app/)
- **Flux** — CLI-first kanban board with MCP server integration, git-native sync, task dependencies, priority-based agent dispatch — [paddo.dev/blog/flux-kanban-for-ai-agents](https://paddo.dev/blog/flux-kanban-for-ai-agents/)

**Terminal Multiplexers for Agent Fleets:**
- **Claude Squad** (5.8k stars) — Manages multiple Claude Code/Codex/Gemini agents in tmux with git worktree isolation — [GitHub](https://github.com/smtg-ai/claude-squad)
- **Conductor** (Melty Labs) — macOS app, launches multiple Claude/Codex instances on separate branches, automated PR creation — [conductor.build](https://www.conductor.build/)
- **VibeCraft** — "StarCraft for coding agents." RTS-style visual canvas where agents, folders, terminals, and browsers share one workspace — [vibecraft.build](https://vibecraft.build/), [HN](https://news.ycombinator.com/item?id=45575842)
- **amux** — Run dozens of parallel AI coding agents unattended via tmux — [GitHub](https://github.com/mixpeek/amux)
- **dmux** — Dev agent multiplexer for git worktrees — [GitHub](https://github.com/standardagents/dmux)

**Full Orchestration Platforms:**
- **ComposioHQ Agent Orchestrator** — Plans tasks, spawns agents, autonomously handles CI fixes, merge conflicts, and code reviews. Agent-agnostic (Claude, Codex, Aider), runtime-agnostic (tmux, Docker), tracker-agnostic (GitHub, Linear). 40k lines of TypeScript, 3,288 tests, built by agents in 8 days — [GitHub](https://github.com/ComposioHQ/agent-orchestrator), [blog](https://pkarnal.com/blog/open-sourcing-agent-orchestrator)
- **MCO** — Neutral orchestration layer dispatching prompts to Claude/Codex/Gemini in parallel, aggregating results as JSON/SARIF/Markdown — [GitHub](https://github.com/mco-org/mco)
- **Overstory** — Multi-agent orchestration with SQLite mail system for inter-agent messaging, 4-tier conflict resolution, pluggable agent runtimes — [GitHub](https://github.com/jayminwest/overstory)
- **Code Conductor** — GitHub-native orchestration, git worktrees per task, fully autonomous operation — [GitHub](https://github.com/ryanmac/code-conductor)
- **Paperclip** — "Orchestration for zero-human companies." Org charts, budgets, approval gates for AI agent teams. MIT-licensed — [paperclip.ing](https://paperclip.ing/), [GitHub](https://github.com/paperclipai/paperclip)

**Comprehensive list:** [awesome-agent-orchestrators](https://github.com/andyrewlee/awesome-agent-orchestrators) — 50+ tools cataloged across categories (parallel runners, personal assistants, multi-agent swarms, autonomous loop runners)

### 3. The Filesystem-as-Governance Pattern Is Becoming Standard

Multiple independent projects have converged on the same pattern Sherpa uses: **markdown files in the repository as the governance layer for AI agents.**

- **AGENTS.md** adopted by 40,000+ repositories as a cross-tool standard for AI agent instructions — [agents.md](https://agents.md/), [InfoQ coverage](https://www.infoq.com/news/2025/08/agents-md/), [builder.io guide](https://www.builder.io/blog/agents-md)
- **CLAUDE.md** established as the per-project instruction file that Claude reads on every session start — [builder.io guide](https://www.builder.io/blog/claude-md-guide), [humanlayer blog](https://www.humanlayer.dev/blog/writing-a-good-claude-md)
- **Visual Studio Magazine** (Feb 2026): "In Agentic AI, It's All About the Markdown" — Markdown has evolved from documentation to instruction layer to skill definition — [visualstudiomagazine.com](https://visualstudiomagazine.com/articles/2026/02/24/in-agentic-ai-its-all-about-the-markdown.aspx)
- **Task Magic** — File-based task system where plans/tasks/memory live as markdown in `.ai/` directory, designed for Cursor/Windsurf agents — [GitHub](https://github.com/iannuttall/task-magic)
- **Agentic Project Management (APM)** (2.1k stars) — Full framework for managing projects with structured multi-agent workflows via filesystem conventions. Integrates with Cursor, Claude Code, Copilot, Windsurf, etc. — [GitHub](https://github.com/sdi2200262/agentic-project-management), [agentic-project-management.dev](https://agentic-project-management.dev/)
- **Taskmaster AI** (15.5k stars in 9 weeks) — MCP-based task management that breaks PRDs into agent-executable tasks, works with Claude Code + Cursor — [GitHub](https://github.com/eyaltoledano/claude-task-master), [task-master.dev](https://www.task-master.dev/)

### 4. The Developer Role Shift: Implementer to Orchestrator

- **Addy Osmani (Google)** published "Conductors to Orchestrators" via O'Reilly Radar — the developer role is shifting from writing code to managing AI agents that write code. Conductors work synchronously with one agent; Orchestrators manage multiple autonomous agents in parallel — [addyosmani.com](https://addyosmani.com/blog/future-agentic-coding/), [O'Reilly Radar](https://www.oreilly.com/radar/conductors-to-orchestrators-the-future-of-agentic-coding/)
- **Sanity blog**: Staff engineer describes running multiple Claude instances "like managing a small team of developers who reset their memory each morning" — [sanity.io blog](https://www.sanity.io/blog/first-attempt-will-be-95-garbage)
- **Marc Nuri** built a real-time dashboard to monitor 5-10 Claude Code sessions across multiple machines. "Context percentage is the most actionable metric" — [blog.marcnuri.com](https://blog.marcnuri.com/ai-coding-agent-dashboard)
- **HN commenter pants2**: "I vibe-coded my own Jira interface at work. Everyone likes it better and half the company is using it now" — [HN discussion](https://news.ycombinator.com/item?id=47167898)

### 5. AI-Native PM Startups (Not Just AI-Augmented)

- **Plane** (46k GitHub stars) — Open-source, AI-native project management. "Built around AI, not retrofitted." AGPL-3.0, 100+ contributors, Fortune 50 customers — [plane.so](https://plane.so), [GitHub](https://github.com/makeplane/plane)
- **Wordware/Sauna** ($30M seed, largest in YC history) — "Cursor for Knowledge Work." Desktop workspace connecting Gmail, Calendar, Slack with AI agent capabilities — [wordware.ai](https://www.wordware.ai/)
- **Dust** ($29/user/month) — Cross-platform AI agent workspace. Agents operate across Slack, Google Drive, Notion, GitHub. 200+ MCP actions. SOC 2 Type II — [dust.tt](https://dust.tt/)
- **Omnara** (YC S25) — Command center for AI agents: terminal, web, mobile. Built by ex-Meta/Microsoft/Amazon engineers — [omnara.com](https://www.omnara.com/), [GitHub](https://github.com/omnara-ai/omnara)
- **Terminal Use** (YC) — "Vercel for background agents." Filesystem-first orchestration platform, CLI-first. Founded by ex-Palantir engineers — [YC page](https://www.ycombinator.com/companies/terminal-use)
- **Tickr** — Autonomous Slack bot replacing Jira. Nudge engine, slip detection, thread-to-task extraction. Uses Claude via AWS Bedrock — [HN Show](https://news.ycombinator.com/item?id=47110071)
- **Trace** ($3M seed, YC 2025) — Workflow orchestration that maps corporate environments for agent context — [TechCrunch](https://techcrunch.com/2026/02/26/trace-raises-3-million-to-solve-the-agent-adoption-problem/)

### 6. Multi-Agent Systems Going Mainstream

- **Claude Code Agent Teams** (v2.1.32+) — Official Anthropic feature for coordinating multiple Claude instances with team lead/teammate roles and lateral messaging — [docs](https://code.claude.com/docs/en/agent-teams)
- **GitHub Agentic Workflows** — Repository automation using coding agents in GitHub Actions, described in plain Markdown — [github.github.com/gh-aw](https://github.github.com/gh-aw/)
- **MetaGPT** — Simulates a full software company (PM, Architect, Engineer, QA). One-line requirement produces PRD, architecture, code. Commercial product MGX/Atoms available — [GitHub](https://github.com/FoundationAgents/MetaGPT), [IBM explainer](https://www.ibm.com/think/topics/metagpt)
- **Anthropic State of AI Agents Report**: 57% of organizations deploy agents for multi-stage workflows, coding at ~90% adoption — [Anthropic blog](https://claude.com/blog/how-enterprises-are-building-ai-agents-in-2026), [full report PDF](https://cdn.sanity.io/files/4zrzovbb/website/cd77281ebc251e6d060c4ef50.pdf)

### 7. The Heartbeat/Monitor/Review Pattern

Multiple independent projects have converged on wrapping AI agents in three layers:

- **Heartbeat** — Watchdog monitoring agent liveness (tmux polling, pid checks)
- **Planning** — Skill/task definition before execution (SKILL.md, PRD breakdown)
- **Review** — Cross-model verification (Claude writes, Gemini reviews, or vice versa)

See: [OpenClaw V2 architecture](https://dev.to/qiushiwu/from-code-completion-to-code-team-how-we-turned-claude-code-into-an-engineering-department-1p62), Overstory's [tiered health monitoring](https://github.com/jayminwest/overstory), Conductor's [acceptance testing loops](https://conductor.build/)

---

## What People Are Actually Building (Taxonomy)

| Category | What It Replaces | Key Examples | Pattern |
|----------|-----------------|--------------|---------|
| Agent Kanban Boards | Jira/Linear boards | Vibe Kanban, OpenKanban, Dorothy, Flux | Kanban + git worktree per ticket + embedded terminal |
| Agent Fleet Dashboards | Nothing (new need) | Marc Nuri's dashboard, Omnara, ai-maestro | Real-time monitoring of multiple agent sessions across devices |
| Filesystem Task Systems | Jira tickets | Task Magic, APM, Taskmaster AI, Sherpa | Markdown files as tasks, agent-readable, version-controlled |
| Terminal Multiplexers | tmux + manual switching | Claude Squad, amux, dmux, Superset | tmux sessions with git worktree isolation per agent |
| Full Orchestrators | PM + CI + Code Review | ComposioHQ, Code Conductor, Overstory | End-to-end: plan, dispatch, monitor, review, merge |
| AI-Native Workspaces | Notion + Jira + Slack | Dust, Sauna/Wordware, Plane | Cross-tool agents with MCP, 200+ integrations |
| Autonomous Companies | All of the above | Paperclip, MetaGPT/MGX | Org charts, budgets, delegation for agent teams |
| Custom Jira Replacements | Jira specifically | Klarna's internal stack, pants2's vibe-coded Jira | Bespoke tools built with AI coding assistants |

---

## Implications for Sherpa

### Where Sherpa Already Leads

1. **Filesystem-as-governance is validated.** Sherpa's initiative directories, `CLAUDE.md` conventions, `.claude/rules/`, and activity logs are the exact pattern the ecosystem is converging on. AGENTS.md has 40k repos; Sherpa's approach is more structured (directoturtle convention, frontmatter schemas, lifecycle states).

2. **Behavioral agent definitions are differentiated.** Most tools define agents by role name ("engineer", "PM"). Sherpa defines them by behavioral constraints. No competing tool found uses this approach.

3. **The Planner/Worker/Judge pattern matches market reality.** The heartbeat/planning/review pattern emerging independently in OpenClaw V2, Overstory, and ComposioHQ maps directly to Sherpa's dispatch model.

4. **Convention sync (sherpa init/sync) addresses a real gap.** None of the filesystem-based tools found have a mechanism for propagating convention updates downstream. They're all one-shot scaffolding.

### Where Sherpa Must Differentiate

1. **Agent fleet visualization is table stakes.** Every serious tool has a dashboard showing agent status, context usage, and task progress. Studio needs this.

2. **Git worktree orchestration is the infrastructure primitive.** Every multi-agent tool uses worktrees. Sherpa already has worktree conventions; the gap is programmatic orchestration (not just conventions about naming).

3. **MCP is the integration layer.** Flux, Dorothy, Taskmaster, and Dust all expose MCP servers. `@sherpa/studio-mcp` is well-positioned but needs the task dispatch tools that the market expects.

4. **The kanban-to-agent-dispatch pipeline is the killer feature.** The market wants: see a kanban board -> click a task -> an agent starts working on it in an isolated worktree -> monitor progress -> review the PR. Sherpa's initiative lifecycle (proposal -> plan -> activity -> implementation) maps to this, but needs the execution layer.

### Strategic Threats

1. **Vibe Kanban (23k stars) and Taskmaster AI (15.5k stars)** are gaining adoption fast with simpler, narrower tools. Sherpa's value is in the integrated framework, but narrower tools may win mindshare.

2. **ComposioHQ Agent Orchestrator** is agent-agnostic, runtime-agnostic, and tracker-agnostic — the exact positioning Sherpa should consider for studio-mcp.

3. **Anthropic's own Agent Teams feature** may subsume some of what Sherpa provides, though it lacks governance/lifecycle management.

---

## Open Questions

1. **Will filesystem governance scale to large teams?** Klarna's 1,200-SaaS consolidation suggests yes for data, but concurrent markdown file edits by multiple agents remain unsolved (Overstory's 4-tier conflict resolution is the best attempt).

2. **Is the developer-as-orchestrator pattern durable, or a transitional phase?** Paperclip's "zero-human companies" vision and Anthropic's Agent Teams suggest the orchestration layer itself may become automated.

3. **What happens to governance when agents build their own tools?** ComposioHQ's agent-orchestrator was built by agents in 8 days. Shadow IT concerns from the Retool report (60% building outside IT oversight) compound when the builders are AI agents.

4. **Does Sherpa compete as a framework (like Next.js) or as an application (like Plane)?** The market has both. Framework positioning allows embedding in existing workflows; application positioning requires a complete UX.

5. **How important is the "RTS game" UX metaphor?** VibeCraft's StarCraft framing and Dorothy's retro aesthetic suggest the visualization metaphor for agent management is an open design question.

---

## Sources (Full URLs)

### Primary Reports and Data
- [Retool 2026 Build vs Buy Report](https://retool.com/blog/ai-build-vs-buy-report-2026) — 35% enterprise SaaS replacement, 817-builder survey
- [Retool report press release](https://www.businesswire.com/news/home/20260217548274/en/Retools-2026-Build-vs.-Buy-Report-Reveals-35-of-Enterprises-Have-Already-Replaced-SaaS-With-Custom-Software) — Newsweek/BusinessWire coverage
- [Anthropic State of AI Agents 2026](https://claude.com/blog/how-enterprises-are-building-ai-agents-in-2026) — 57% multi-stage workflows, 90% coding adoption
- [Anthropic report PDF](https://cdn.sanity.io/files/4zrzovbb/website/cd77281ebc251e6b860543d8943ede8d06c4ef50.pdf) — Full report

### Case Studies
- [Klarna SaaS consolidation](https://efipm.medium.com/from-saas-bloat-to-ai-native-klarnas-tech-stack-overhaul-4cbcd1c2ecb0) — 1,200 SaaS shutdown
- [Klarna CEO LinkedIn post on Jira replacement](https://www.linkedin.com/posts/sebastian-siemiatkowski-768977_sorry-jira-bitbucket-and-atlassian-you-are-activity-7363555407107145730-eTJl)
- [Klarna CEO Twitter/X on SaaS shutdown](https://x.com/klarnaseb/status/1896698293759230429) — "an internal estimate is about 1,200 SaaS shut down"
- [Klarna didn't replace Salesforce with AI - CX Today counterpoint](https://www.cxtoday.com/crm/klarna-didnt-replace-salesforce-it-replaced-them-with-alternative-saas-apps/)
- [Rokt 135 apps in 24 hours](https://replit.com/customers/rokt) — Replit Agent enterprise case study
- [Doctolib + Claude Code](https://www.claude.com/customers/doctolib) — Legacy testing infrastructure replacement
- [Sanity staff engineer journey](https://www.sanity.io/blog/first-attempt-will-be-95-garbage) — 6-week Claude Code adoption
- [ClickUp built 6 AI tools, saved $200K/year](https://retool.com/blog/ai-build-vs-buy-report-2026) — Referenced in Retool report

### Agent Orchestration Tools
- [awesome-agent-orchestrators](https://github.com/andyrewlee/awesome-agent-orchestrators) — Comprehensive list of 50+ tools
- [Vibe Kanban](https://www.vibekanban.com/) — 23.1k stars, 30k users
- [Claude Squad](https://github.com/smtg-ai/claude-squad) — 5.8k stars, tmux-based
- [Conductor](https://www.conductor.build/) — Melty Labs, macOS agent orchestrator
- [ComposioHQ Agent Orchestrator](https://github.com/ComposioHQ/agent-orchestrator) — Agent-agnostic orchestration
- [MCO](https://github.com/mco-org/mco) — Neutral orchestration layer
- [Overstory](https://github.com/jayminwest/overstory) — SQLite mail, 4-tier conflict resolution
- [Code Conductor](https://github.com/ryanmac/code-conductor) — GitHub-native orchestration
- [Paperclip](https://paperclip.ing/) — Zero-human company orchestration
- [Dorothy](https://github.com/Charlie85270/Dorothy) — Desktop app + Kanban + MCP
- [VibeCraft](https://vibecraft.build/) — RTS-style agent workspace
- [OpenKanban](https://github.com/TechDufus/openkanban) — TUI kanban + worktrees
- [Flux](https://paddo.dev/blog/flux-kanban-for-ai-agents/) — CLI-first kanban with MCP
- [amux](https://github.com/mixpeek/amux) — Parallel agent multiplexer
- [dmux](https://github.com/standardagents/dmux) — Dev agent multiplexer
- [Claude Flow](https://github.com/ruvnet/claude-flow) — 12.9k stars, multi-agent swarms
- [agent-board](https://github.com/quentintou/agent-board) — Multi-agent task board with DAG dependencies

### Filesystem-as-Governance
- [AGENTS.md specification](https://agents.md/) — Open standard, 40k+ repos
- [AGENTS.md GitHub repo](https://github.com/agentsmd/agents.md)
- [AGENTS.md InfoQ coverage](https://www.infoq.com/news/2025/08/agents-md/) — Emergence as standard
- [builder.io AGENTS.md guide](https://www.builder.io/blog/agents-md)
- [builder.io CLAUDE.md guide](https://www.builder.io/blog/claude-md-guide)
- [HumanLayer CLAUDE.md guide](https://www.humanlayer.dev/blog/writing-a-good-claude-md)
- [Visual Studio Magazine on Markdown in agentic AI](https://visualstudiomagazine.com/articles/2026/02/24/in-agentic-ai-its-all-about-the-markdown.aspx)
- [AI agent rule files gist (comprehensive)](https://gist.github.com/0xdevalias/f40bc5a6f84c4c5ad862e314894b2fa6)
- [Box: Filesystems as context layer for AI agents](https://blog.box.com/filesystems-context-layer-ai-agents-powered-box)

### Task Management for AI Agents
- [Taskmaster AI](https://github.com/eyaltoledano/claude-task-master) — 15.5k stars in 9 weeks
- [task-master.dev](https://www.task-master.dev/) — "The PM for your AI agent"
- [Task Magic](https://github.com/iannuttall/task-magic) — Filesystem task system for Cursor/Windsurf
- [Agentic Project Management](https://github.com/sdi2200262/agentic-project-management) — 2.1k stars, multi-assistant
- [Turning Cursor into a task-based AI coding system](https://meelis-ojasild.medium.com/turning-cursor-into-a-task-based-ai-coding-system-31e1e3bf047b) — Medium article

### AI-Native Startups & Products
- [Plane](https://plane.so) — 46k stars, open-source AI-native PM
- [Plane GitHub](https://github.com/makeplane/plane) — AGPL-3.0
- [Wordware/Sauna](https://www.wordware.ai/) — $30M seed, "Cursor for Knowledge Work"
- [Dust](https://dust.tt/) — Cross-platform AI agent workspace
- [Omnara](https://www.omnara.com/) — YC S25, agent command center
- [Omnara GitHub](https://github.com/omnara-ai/omnara)
- [Terminal Use](https://www.ycombinator.com/companies/terminal-use) — YC, filesystem-first agents
- [Tickr](https://news.ycombinator.com/item?id=47110071) — AI PM in Slack
- [Trace](https://techcrunch.com/2026/02/26/trace-raises-3-million-to-solve-the-agent-adoption-problem/) — YC 2025, $3M seed

### Developer Role Shift
- [Addy Osmani: Conductors to Orchestrators](https://addyosmani.com/blog/future-agentic-coding/) — Full article
- [O'Reilly Radar version](https://www.oreilly.com/radar/conductors-to-orchestrators-the-future-of-agentic-coding/)
- [Marc Nuri AI Coding Agent Dashboard](https://blog.marcnuri.com/ai-coding-agent-dashboard) — Multi-device monitoring
- [OpenClaw V2 architecture](https://dev.to/qiushiwu/from-code-completion-to-code-team-how-we-turned-claude-code-into-an-engineering-department-1p62) — Heartbeat + Planning + Review

### Claude Code Ecosystem
- [Claude Code Agent Teams docs](https://code.claude.com/docs/en/agent-teams) — Official multi-agent feature
- [Claude Code subagents docs](https://code.claude.com/docs/en/sub-agents)
- [Parallel worktrees skill](https://github.com/spillwavesolutions/parallel-worktrees)
- [awesome-claude-code](https://github.com/hesreallyhim/awesome-claude-code) — Skills, hooks, plugins
- [awesome-claude-code-toolkit](https://github.com/rohitg00/awesome-claude-code-toolkit) — 135 agents, 35 skills
- [Claude Code system prompts](https://github.com/Piebald-AI/claude-code-system-prompts)
- [Scaling Claude Code across teams](https://portkey.ai/blog/claude-code-agents/)

### Broader Multi-Agent Frameworks
- [MetaGPT](https://github.com/FoundationAgents/MetaGPT) — AI software company simulation
- [CrewAI](https://crewai.com/open-source) — Role-based agent orchestration
- [GitHub Agentic Workflows](https://github.github.com/gh-aw/) — Repository automation
- [GitHub blog: Multi-agent workflows](https://github.blog/ai-and-ml/generative-ai/multi-agent-workflows-often-fail-heres-how-to-engineer-ones-that-dont/)

### Hacker News Discussions
- [Klarna CEO replacing Jira with vibe coded app](https://news.ycombinator.com/item?id=44961478)
- [AI agents eating SaaS](https://news.ycombinator.com/item?id=46268452)
- ["I don't need AI to build me a new app, I need it to make Jira bearable"](https://news.ycombinator.com/item?id=47167898)
- [Tickr: AI PM in Slack](https://news.ycombinator.com/item?id=47110071)
- [VibeCraft: StarCraft for coding agents](https://news.ycombinator.com/item?id=45575842)
- [Vibe Kanban Show HN](https://news.ycombinator.com/item?id=44533004)
- [Evolution of dev project management](https://news.ycombinator.com/item?id=44040417)
- [Slow painful death of Agile and Jira](https://news.ycombinator.com/item?id=41659128)

### Obsidian + AI Workspace
- [ObsidianOS — vault as AI-powered work OS](https://www.indiehackers.com/post/i-turned-my-obsidian-vault-into-an-ai-powered-work-os-open-source-free-c59e1af017)
- [ObsidianOS GitHub](https://github.com/benoror/obsidianos_work)
- [Obsidian AI Agent plugin](https://github.com/m-rgba/obsidian-ai-agent) — Claude Code in Obsidian
- [Obsidian AI platform](https://github.com/sup3rus3r/obsidian-ai) — Visual agent pipeline builder
- [Awesome Obsidian AI Tools](https://github.com/danielrosehill/Awesome-Obsidian-AI-Tools)

### Market Analysis
- [Newsweek: Enterprises replacing SaaS faster than you think](https://www.newsweek.com/nw-ai/enterprises-are-replacing-saas-faster-than-you-think-11521483)
- [Newsweek: Teams quietly replacing SaaS](https://www.newsweek.com/nw-ai/ai-impact-are-your-teams-quietly-replacing-saas-11620488)
- [ThoughtLinks: Agentic AI repricing SaaS](https://www.thoughtlinks.net/insights/agentic-ai-saas-buy-to-build-framework)
- [Klarna CEO doubts others will replace Salesforce](https://techcrunch.com/2025/03/04/klarna-ceo-doubts-that-other-companies-will-replace-salesforce-with-ai/)
- [Y Combinator AI startups](https://www.ycombinator.com/companies/industry/ai)
- [YC Requested Startups Fall 2025](https://insights.tryspecter.com/yc-requested-startups-fall-2025/)
- [NextGen Tools: Death of the to-do list](https://www.nxgntools.com/blog/autonomous-project-management-tools-2026)
- [Gartner: 80% of PM work eliminated by 2030](https://www.epicflow.com/blog/ai-agents-for-project-management/)

### Git Worktrees + AI Development
- [Nick Mitchinson: Git worktrees for multi-feature AI development](https://www.nrmitchi.com/2025/10/using-git-worktrees-for-multi-feature-development-with-ai-agents/)
- [Upsun: Git worktrees for parallel AI agents](https://devcenter.upsun.com/posts/git-worktrees-for-parallel-ai-coding-agents/)
- [Medium: Git worktrees secret weapon](https://medium.com/@mabd.dev/git-worktrees-the-secret-weapon-for-running-multiple-ai-coding-agents-in-parallel-e9046451eb96)
- [Nx Blog: Git worktrees changed my AI workflow](https://nx.dev/blog/git-worktrees-ai-agents)
- [Shane Lee: Agentic coding with worktrees](https://blog.shanelee.name/2026/02/03/agentic-coding-git-worktrees-and-agent-skills-for-parallel-workflows/)
- [Agent Interviews: Parallel AI coding with worktrees](https://docs.agentinterviews.com/blog/parallel-ai-coding-with-gitworktrees/)

---

## Raw Links (Every URL Encountered)

```
https://retool.com/blog/ai-build-vs-buy-report-2026
https://www.businesswire.com/news/home/20260217548274/en/Retools-2026-Build-vs.-Buy-Report-Reveals-35-of-Enterprises-Have-Already-Replaced-SaaS-With-Custom-Software
https://www.newsweek.com/nw-ai/enterprises-are-replacing-saas-faster-than-you-think-11521483
https://www.newsweek.com/nw-ai/ai-impact-are-your-teams-quietly-replacing-saas-11620488
https://www.thoughtlinks.net/insights/agentic-ai-saas-buy-to-build-framework
https://claude.com/blog/how-enterprises-are-building-ai-agents-in-2026
https://cdn.sanity.io/files/4zrzovbb/website/cd77281ebc251e6b860543d8943ede8d06c4ef50.pdf
https://efipm.medium.com/from-saas-bloat-to-ai-native-klarnas-tech-stack-overhaul-4cbcd1c2ecb0
https://www.silicon.eu/ai-strategy-klarna-eliminates-1200-saas-services-17458.html
https://www.one-fs.com/p/inside-klarnas-ai-powered-saas-breakup
https://www.linkapture.com/post/replacing-saas-with-custom-ai-solutions
https://medium.com/@tarifabeach/klarnas-radical-ai-pivot-a-case-study-in-saas-consolidation-and-strategic-control-3a9928f8df9a
https://www.cxtoday.com/crm/klarna-didnt-replace-salesforce-it-replaced-them-with-alternative-saas-apps/
https://techcrunch.com/2025/03/04/klarna-ceo-doubts-that-other-companies-will-replace-salesforce-with-ai/
https://www.linkedin.com/posts/sebastian-siemiatkowski-768977_sorry-jira-bitbucket-and-atlassian-you-are-activity-7363555407107145730-eTJl
https://x.com/klarnaseb/status/1896698293759230429
https://replit.com/customers/rokt
https://www.virtasant.com/ai-today/135-apps-in-24-hours-building-is-the-new-ai-literacy-model
https://www.claude.com/customers/doctolib
https://www.sanity.io/blog/first-attempt-will-be-95-garbage
https://news.ycombinator.com/item?id=45107962
https://news.ycombinator.com/item?id=44961478
https://news.ycombinator.com/item?id=46268452
https://news.ycombinator.com/item?id=47167898
https://news.ycombinator.com/item?id=47110071
https://news.ycombinator.com/item?id=45575842
https://news.ycombinator.com/item?id=44533004
https://news.ycombinator.com/item?id=44040417
https://news.ycombinator.com/item?id=41659128
https://news.ycombinator.com/item?id=12462143
https://news.ycombinator.com/item?id=47083597
https://news.ycombinator.com/item?id=46059582
https://news.ycombinator.com/item?id=46434821
https://news.ycombinator.com/item?id=46435534
https://news.ycombinator.com/item?id=46207505
https://news.ycombinator.com/item?id=47307169
https://news.ycombinator.com/item?id=47149586
https://github.com/andyrewlee/awesome-agent-orchestrators
https://github.com/smtg-ai/claude-squad
https://github.com/BloopAI/vibe-kanban
https://www.vibekanban.com/
https://github.com/TechDufus/openkanban
https://github.com/Charlie85270/Dorothy
https://dorothyai.app/
https://paddo.dev/blog/flux-kanban-for-ai-agents/
https://github.com/ComposioHQ/agent-orchestrator
https://pkarnal.com/blog/open-sourcing-agent-orchestrator
https://github.com/mco-org/mco
https://github.com/jayminwest/overstory
https://github.com/ryanmac/code-conductor
https://paperclip.ing/
https://github.com/paperclipai/paperclip
https://topaiproduct.com/2026/03/06/paperclip-ai-wants-to-run-your-entire-company-with-zero-humans-and-its-open-source/
https://www.conductor.build/
https://vibecraft.build/
https://github.com/rayzhudev/vibecraft
https://github.com/mixpeek/amux
https://github.com/standardagents/dmux
https://github.com/ruvnet/claude-flow
https://github.com/ruvnet/ruflo
https://github.com/quentintou/agent-board
https://github.com/21st-dev/1code
https://github.com/asheshgoplani/agent-deck
https://github.com/23blocks-OS/ai-maestro
https://github.com/vivy-company/aizen
https://github.com/andyrewlee/amux
https://github.com/ariana-dot-dev/ariana
https://github.com/AutoMaker-Org/automaker
https://github.com/bfly123/claude_code_bridge
https://github.com/manaflow-ai/cmux
https://github.com/Dimillian/CodexMonitor
https://github.com/owengretzinger/constellagent
https://github.com/stravu/crystal
https://github.com/generalaction/emdash
https://github.com/humanlayer/humanlayer
https://github.com/joewinke/jat
https://github.com/coollabsio/jean
https://github.com/tim-smart/lalph
https://github.com/coder/mux
https://github.com/zippoxer/subtask
https://github.com/supabitapp/supacode
https://github.com/superset-sh/superset
https://github.com/openai/symphony
https://github.com/pingdotgg/t3code
https://github.com/sahithvibudhi/vibe-tree
https://github.com/snarktank/antfarm
https://github.com/getclawe/clawe
https://github.com/steveyegge/gastown
https://github.com/ghuntley/loom
https://github.com/RightNow-AI/openfang
https://github.com/marian2js/opengoat
https://github.com/frankbria/ralph-claude-code
https://github.com/mikeyobrien/ralph-orchestrator
https://github.com/subsy/ralph-tui
https://github.com/michaelshimeles/ralphy
https://github.com/mikehostetler/wreckit
https://github.com/wshobson/agents
https://agents.md/
https://github.com/agentsmd/agents.md
https://www.infoq.com/news/2025/08/agents-md/
https://www.builder.io/blog/agents-md
https://www.builder.io/blog/claude-md-guide
https://www.humanlayer.dev/blog/writing-a-good-claude-md
https://visualstudiomagazine.com/articles/2026/02/24/in-agentic-ai-its-all-about-the-markdown.aspx
https://gist.github.com/0xdevalias/f40bc5a6f84c4c5ad862e314894b2fa6
https://blog.box.com/filesystems-context-layer-ai-agents-powered-box
https://medium.com/data-science-collective/the-complete-guide-to-ai-agent-memory-files-claude-md-agents-md-and-beyond-49ea0df5c5a9
https://layer5.io/blog/ai/agentsmd-one-file-to-guide-them-all/
https://prpm.dev/blog/agents-md-deep-dive
https://medium.com/@genyklemberg/one-prompt-to-rule-them-all-how-to-reuse-the-same-markdown-instructions-across-copilot-claude-42693df4df00
https://github.com/eyaltoledano/claude-task-master
https://www.task-master.dev/
https://github.com/iannuttall/task-magic
https://github.com/sdi2200262/agentic-project-management
https://agentic-project-management.dev/
https://meelis-ojasild.medium.com/turning-cursor-into-a-task-based-ai-coding-system-31e1e3bf047b
https://ainativedev.io/news/claude-task-master
https://pageai.pro/blog/claude-code-taskmaster-ai-tutorial
https://shipixen.com/tutorials/reduce-ai-coding-errors-with-taskmaster-ai
https://plane.so
https://github.com/makeplane/plane
https://plane.so/blog/how-we-got-to-20k-github-stars
https://www.wordware.ai/
https://venturebeat.com/ai/how-wordware-30m-seed-round-could-disrupt-the-entire-ai-development-industry
https://dust.tt/
https://dust.tt/blog/notion-ai-alternatives-ai-workspace-automation
https://www.omnara.com/
https://github.com/omnara-ai/omnara
https://www.ycombinator.com/companies/terminal-use
https://fondo.com/blog/terminal-use-launches
https://techcrunch.com/2026/02/26/trace-raises-3-million-to-solve-the-agent-adoption-problem/
https://addyosmani.com/blog/future-agentic-coding/
https://www.oreilly.com/radar/conductors-to-orchestrators-the-future-of-agentic-coding/
https://blog.marcnuri.com/ai-coding-agent-dashboard
https://dev.to/qiushiwu/from-code-completion-to-code-team-how-we-turned-claude-code-into-an-engineering-department-1p62
https://code.claude.com/docs/en/agent-teams
https://code.claude.com/docs/en/sub-agents
https://github.com/spillwavesolutions/parallel-worktrees
https://github.com/hesreallyhim/awesome-claude-code
https://github.com/rohitg00/awesome-claude-code-toolkit
https://github.com/travisvn/awesome-claude-skills
https://github.com/jqueryscript/awesome-claude-code
https://github.com/ComposioHQ/awesome-claude-skills
https://awesome-skills.com/
https://github.com/VoltAgent/awesome-agent-skills
https://github.com/Piebald-AI/claude-code-system-prompts
https://portkey.ai/blog/claude-code-agents/
https://github.com/FoundationAgents/MetaGPT
https://www.ibm.com/think/topics/metagpt
https://crewai.com/open-source
https://github.com/crewAIInc/crewAI
https://github.github.com/gh-aw/
https://github.blog/ai-and-ml/generative-ai/multi-agent-workflows-often-fail-heres-how-to-engineer-ones-that-dont/
https://github.blog/ai-and-ml/automate-repository-tasks-with-github-agentic-workflows/
https://www.nrmitchi.com/2025/10/using-git-worktrees-for-multi-feature-development-with-ai-agents/
https://devcenter.upsun.com/posts/git-worktrees-for-parallel-ai-coding-agents/
https://medium.com/@mabd.dev/git-worktrees-the-secret-weapon-for-running-multiple-ai-coding-agents-in-parallel-e9046451eb96
https://nx.dev/blog/git-worktrees-ai-agents
https://blog.shanelee.name/2026/02/03/agentic-coding-git-worktrees-and-agent-skills-for-parallel-workflows/
https://docs.agentinterviews.com/blog/parallel-ai-coding-with-gitworktrees/
https://dev.to/mashrulhaque/git-worktrees-for-ai-coding-run-multiple-agents-in-parallel-3pgb
https://dev.to/arifszn/git-worktrees-the-power-behind-cursors-parallel-agents-19j1
https://www.chatprd.ai/how-i-ai/workflows/how-to-manage-parallel-development-with-ai-using-git-worktrees-and-codex
https://www.indiehackers.com/post/i-turned-my-obsidian-vault-into-an-ai-powered-work-os-open-source-free-c59e1af017
https://github.com/benoror/obsidianos_work
https://github.com/m-rgba/obsidian-ai-agent
https://github.com/sup3rus3r/obsidian-ai
https://github.com/danielrosehill/Awesome-Obsidian-AI-Tools
https://github.com/logancyang/obsidian-copilot
https://github.com/SystemSculpt/obsidian-systemsculpt-ai
https://forum.obsidian.md/t/new-plugin-agent-client-bring-claude-code-codex-gemini-cli-inside-obsidian/108448
https://www.ycombinator.com/companies/industry/ai
https://www.ycombinator.com/companies/industry/ai-assistant
https://www.ycombinator.com/companies/industry/workflow-automation
https://www.ycombinator.com/rfs
https://insights.tryspecter.com/yc-requested-startups-fall-2025/
https://www.nxgntools.com/blog/autonomous-project-management-tools-2026
https://www.epicflow.com/blog/ai-agents-for-project-management/
https://www.taskade.com/blog/autonomous-project-management
https://www.cio.com/article/4134741/how-agentic-ai-will-reshape-engineering-workflows-in-2026.html
https://www.cio.com/article/4138739/21-agent-orchestration-tools-for-managing-your-ai-fleet.html
https://mitsloan.mit.edu/ideas-made-to-matter/agentic-ai-explained
https://www.superblocks.com/blog/best-enterprise-vibe-coding-tools
https://blog.bettyblocks.com/best-vibe-coding-tools-2026
https://www.knack.com/blog/vibe-coding-tools-guide/
https://www.glideapps.com/blog/build-internal-tools
https://flowiseai.com/
https://github.com/kchia/project-management-agentic-workflow
https://github.com/tobiassteidle/AgenticAI_ND_P2_Agentic-Workflow-for-Project-Management
https://github.com/jayminwest/os-eco
https://github.com/stellarlinkco/myclaude
https://www.vibesparking.com/en/blog/ai/claude-code/2026-03-04-myclaude-multi-agent-orchestration-workflow/
https://dev.to/uenyioha/porting-claude-codes-agent-teams-to-opencode-4hol
https://www.productcool.com/product/agor
https://www.getagentcraft.com/
https://gitnation.com/contents/agentcraft-putting-the-orc-in-agent-orchestration
https://www.proofofconcept.pub/p/real-time-strategy-games-and-ai-interfaces
https://www.sitepoint.com/the-developers-guide-to-autonomous-coding-agents-orchestrating-claude-code-ruflo-and-deerflow/
https://claudefa.st/blog/guide/agents/agent-teams
https://claudefa.st/blog/guide/agents/async-workflows
https://www.sitepoint.com/anthropic-claude-code-agent-teams/
https://zachwills.net/how-to-use-claude-code-subagents-to-parallelize-development/
https://www.heyuan110.com/posts/ai/2026-02-28-claude-code-teams-guide/
https://dev.to/bredmond1019/multi-agent-orchestration-running-10-claude-instances-in-parallel-part-3-29da
https://deepwiki.com/anthropics/claude-code/3.1-ai-models-and-execution-strategies
https://darasoba.medium.com/how-to-set-up-and-use-claude-code-agent-teams-and-actually-get-great-results-9a34f8648f6d
https://medium.com/@unicodeveloper/10-must-have-skills-for-claude-and-any-coding-agent-in-2026-b5451b013051
https://cybernerdie.medium.com/six-months-with-claude-code-i-was-only-using-half-of-it-a187ec2d25da
https://newsletter.pragmaticengineer.com/p/building-claude-code-with-boris-cherny
https://learn.deeplearning.ai/courses/claude-code-a-highly-agentic-coding-assistant/lesson/66b35/introduction
https://www.anthropic.com/engineering/advanced-tool-use
https://www.eesel.ai/blog/claude-code-multiple-agent-systems-complete-2026-guide
https://nisonco.com/how-to-use-claude-code-for-business-complete-2026-guide/
https://kaizenaiconsulting.com/building-internal-business-tools-claude-code-examples/
https://hackernoon.com/we-ditched-jira-and-started-using-github-as-our-project-management-tool
https://www.eesel.ai/blog/jira-ai-agent
https://www.atlassian.com/software/rovo-dev
https://www.notion.com/releases/2026-01-20
https://www.notion.com/releases
https://max-productive.ai/ai-tools/notion-ai/
https://www.aristeksystems.com/blog/custom-ai-vs-saas-ai-when-to-build-when-to-buy-and-why-only-5-of-companies-get-it-right/
https://www.clustox.com/blog/build-vs-buy-ai-tools/
https://aithority.com/machine-learning/retools-2026-build-vs-buy-report-reveals-35-of-enterprises-have-already-replaced-saas-with-custom-software/
https://www.protocloudtechnologies.com/ai-agents-replacing-saas-tools-software-era-changing/
https://www.glean.com/perspectives/will-ai-agents-replace-saas-tools-as-the-new-operating-layer-of-work
https://roundly.io/blog/klarna-ai-agents-replacing-saas
https://www.marktechpost.com/2026/02/23/composio-open-sources-agent-orchestrator-to-help-ai-developers-build-scalable-multi-agent-workflows-beyond-the-traditional-react-loops/
https://github.com/awslabs/agent-squad
https://github.com/kaushikb11/awesome-llm-agents
https://github.com/Zaloog/kanban-tui
https://dev.to/aorumbayev/at-makerx-we-built-kagan-a-conductor-for-your-ai-coding-agents-3laj
https://lobehub.com/mcp/your-org-agents-machine
https://lobehub.com/mcp/eyalzh-kanban-mcp
https://medium.com/devops-ai-decoded/top-10-mcp-servers-for-ai-agent-orchestration-in-2026-78cdb38e9fba
https://www.pulsemcp.com/servers/eyalzh-kanban
https://mcpservers.org/servers/eyalzh/kanban-mcp
https://www.pulsemcp.com/clients
https://github.com/lastmile-ai/mcp-agent
https://github.com/modelcontextprotocol/servers
https://beyond.addy.ie/
https://smtg-ai.github.io/claude-squad/
https://www.ccmarket.dev/
https://claudekit.cc/
https://claudecode.run/
https://www.producthunt.com/products/superset-5
https://www.producthunt.com/categories/vibe-coding
https://dev.to/zxbers/how-i-built-a-29mo-managed-ai-agent-service-on-open-source-5boc
https://dev.to/askpatrick/how-to-introduce-claude-code-to-your-engineering-team-without-it-dying-in-week-2-25ib
https://dev.to/askpatrick/how-to-introduce-claude-code-to-your-engineering-team-be2
https://dev.to/askpatrick/the-brief-method-how-to-get-10x-better-results-from-claude-code-244i
https://dev.to/juandj/how-i-use-claude-code-to-accelerate-my-software-engineering-job-and-improve-my-life-8o7
https://dev.to/_46ea277e677b888e0cd13/1code-managing-multiple-ai-coding-agents-without-terminal-hell-14o4
https://dev.to/ilyatech/boost-team-productivity-with-smart-markdown-file-management-essential-tools-and-strategies-for-ai-1l0j
https://dev.to/juhapellotsalo/why-claude-code-excels-at-legacy-system-modernization-1ll1
https://thenewstack.io/ai-engineering-trends-in-2025-agents-mcp-and-vibe-coding/
https://github.blog/ai-and-ml/github-copilot/power-agentic-workflows-in-your-terminal-with-github-copilot-cli/
https://www.warp.dev/
https://addozhang.medium.com/obsidian-skills-empowering-ai-agents-to-master-obsidian-knowledge-management-8b4f6d844b34
https://www.kdjingpai.com/en/ruler/
https://code.claude.com/docs/en/best-practices
https://code.claude.com/docs/en/overview
https://codeagni.com/blog/ai-coding-agents-2026-the-new-frontier-of-intelligent-development-workflows
https://www.ideas2it.com/blogs/ai-developer-tools-workflow
https://forum.cursor.com/t/task-master-prompt-agent-mode/39980
https://medium.com/@abhishek.bhattacharya04/from-requirement-to-reality-how-claude-task-master-cursor-transformed-a-complex-feature-request-c8ec735d6096
https://www.everydev.ai/tools/task-master-ai
https://mcpmarket.com/server/task-master
https://www.sanity.io/blog/introducing-sanity-agent-skills
https://www.turbodocx.com/blog/best-claude-code-skills-plugins-mcp-servers
https://www.oreilly.com/AgenticWorld/
https://www.oreilly.com/live-events/ai-codecon-coding-for-the-agentic-world/0642572207748/0642572207731/
https://www.oreilly.com/live-events/ai-codecon-coding-for-the-future-agentic-world/0642572207748/
https://www.oreilly.com/radar/the-accidental-orchestrator/
https://www.businesswire.com/news/home/20260309594534/en/OReilly-to-Host-Third-AI-Codecon-on-Software-Craftsmanship-in-the-Age-of-AI
https://addyo.substack.com/p/conductors-to-orchestrators-the-future
https://www.youtube.com/watch?v=sQFIiB6xtIs
```
