# Iteration 2 — 2026-03-12

## Theme

Novel interaction paradigms for human-agent collaboration beyond traditional project management. What does "managing 10 agents" look like at the interface level?

## Research Vectors

### Vector 1: Multi-Agent Fleet Management Interfaces
**Question:** What products exist today for managing multiple AI agents, and what patterns do they share?
**Full report:** [iteration-2/vector-1-multi-agent-fleet-interfaces.md](iteration-2/vector-1-multi-agent-fleet-interfaces.md)

**Key discoveries:**
- **GitHub Mission Control** is the most complete fleet management interface — assign, steer, and track agents from one dashboard with live session logs and mid-run steering. ([GitHub Blog](https://github.blog/ai-and-ml/github-copilot/how-to-orchestrate-agents-using-mission-control/))
- **VS Code 1.109 Agent Sessions view** unified local, background, and cloud agents into one sidebar with a Delegate button for routing tasks between agents. ([VS Code Blog](https://code.visualstudio.com/blogs/2026/02/05/multi-agent-development))
- **Devin's "awkward middle"** — Devin's workflow is "too slow to watch in real time, yet fast enough to interrupt deeper focus work." No product has solved this timing tension. ([Scott Logic](https://blog.scottlogic.com/2025/10/20/rapid-development-with-devin.html))
- **Session-based, not board-based** — every product uses sessions/threads for agent work, not kanban columns. Validates iteration 1's "pipeline not board" finding.
- **No product maps agents to strategic objectives** — tasks are disconnected from initiatives/goals in every product surveyed. Sherpa's initiative system is a differentiator.
- **builderz-labs/mission-control** implements a 32-panel open-source dashboard with Kanban, token tracking, agent lifecycle management, and auto-discovery of Claude Code sessions. ([GitHub](https://github.com/builderz-labs/mission-control))

**Implications:**
- Sherpa should build fleet awareness into Studio's sidebar, not as a separate page
- The initiative-to-task connection that Sherpa already has is a genuine gap in the market

### Vector 2: RTS/Gaming UI Metaphors for Agent Fleets
**Question:** What can real-time strategy games and MMO raid frames teach us about managing agents?
**Full report:** [iteration-2/vector-2-rts-gaming-metaphors.md](iteration-2/vector-2-rts-gaming-metaphors.md)

**Key discoveries:**
- **David Hoang's RTS thesis** — "Managing a fleet of agents is going to require multi-tasking, background tasks, and visibility of work to instruct. Agent interactions are going to feel like playing a Real Time Strategy game." ([Proof of Concept](https://www.proofofconcept.pub/p/real-time-strategy-games-and-ai-interfaces))
- **RTS minimap = persistent fleet overview** — a compact, always-visible overview of all active agents. No agent product has this yet. ([Proof of Concept](https://www.proofofconcept.pub/p/real-time-strategy-games-and-ai-interfaces))
- **MMO raid frames are the most optimized "many-entity status dashboard"** — 40 entities visible simultaneously, color-coded priority, role-specific layouts, configurable information density. 20 years of iteration. ([Icy Veins](https://www.icy-veins.com/wow/advanced-raid-ui-setup-guide))
- **Hotkey-driven command from RTS APM** validates keyboard-first interaction (Linear Triage pattern from iteration 1). ([Game Wisdom](https://game-wisdom.com/critical/ui-strategy-game-design))
- **Addy Osmani's Conductor-to-Orchestrator evolution** — Coder -> Conductor (single agent, sync) -> Orchestrator (multi-agent, async). The human role becomes selecting tasks, evaluating outputs, ensuring quality gates. ([O'Reilly Radar](https://www.oreilly.com/radar/conductors-to-orchestrators-the-future-of-agentic-coding/))
- **The spreadsheet inevitability** — complex management games devolve into spreadsheets. Power users will want sortable/filterable tables, not just cards. ([HN Discussion](https://news.ycombinator.com/item?id=46458231))

**Implications:**
- Studio needs a persistent minimap/sidebar widget showing all active agents at a glance
- Raid frame grid pattern for compact per-agent status cards (5-10 visible simultaneously)
- Configurable density — let users choose how much detail per agent card
- Tabular power view for sorting, filtering, and bulk operations alongside card views

### Vector 3: Agent Status, Activity Streaming, and Observability Protocols
**Question:** What protocols exist for rich real-time agent status beyond "running/done"?
**Full report:** [iteration-2/vector-3-agent-status-protocols.md](iteration-2/vector-3-agent-status-protocols.md)

**Key discoveries:**
- **AG-UI protocol** defines 17 event types for real-time agent-frontend communication: lifecycle, text messages, tool calls, state management, and special events. Snapshot-plus-delta pattern. Framework-agnostic. ([AG-UI Docs](https://docs.ag-ui.com/))
- **Linear's Agent Interaction SDK is best-in-class** — five design principles, four lifecycle states, structured activity types (tool calls, thoughts, elicitations, responses), and a critical delegation-vs-assignment distinction where humans retain accountability while agents take action. ([Linear SDK Blog](https://linear.app/now/our-approach-to-building-the-agent-interaction-sdk))
- **Three competing agentic UI protocols** — AG-UI (CopilotKit, event stream), A2UI (Google, declarative JSON), MCP Apps (Anthropic/OpenAI, ui:// resources). All may coexist. ([CopilotKit Comparison](https://www.copilotkit.ai/blog/the-state-of-agentic-ui-comparing-ag-ui-mcp-ui-and-a2ui-protocols))
- **MCP Elicitation** — protocol-level mechanism for agents to pause and ask users for input mid-session with structured JSON schema. First standard answer to "when should an agent ask the human?" ([Dev.to](https://dev.to/kachurun/mcp-elicitation-human-in-the-loop-for-mcp-servers-m6a))
- **Claude Code dashboard gap** — Issue #24537 articulates: "The conversation view was designed for one agent, not a control plane for 7 concurrent subagents." Proposed fix: dedicated dashboard surface with agent tree, metrics, task progress, approval stream. ([GitHub Issue](https://github.com/anthropics/claude-code/issues/24537))

**Implications:**
- Adopt Linear's four lifecycle states (working / waiting-for-input / completed / failed) as the minimum
- Activity types (tool calls, thoughts, elicitations, responses) should have distinct visual treatment
- The AG-UI event model maps cleanly to Studio's SSE/WebSocket needs
- Delegation-vs-assignment is a natural fit for Sherpa's behavioral agent system

### Vector 4: Delegation, Dispatch, and Steering Interfaces
**Question:** How do you tell an agent what to do and redirect it mid-task?
**Full report:** [iteration-2/vector-4-delegation-dispatch-steering.md](iteration-2/vector-4-delegation-dispatch-steering.md)

**Key discoveries:**
- **Three delegation models** — issue-based (GitHub, Linear), natural language (Devin Slack, Claude Code terminal), and spec-driven (Kiro requirements, skills.md). ([Multiple sources](https://kiro.dev/))
- **Kiro's spec-driven development** — takes natural language, generates EARS-notation requirements with acceptance criteria, then architecture/design, then sequenced task plan. Steering files configure agent behavior per-project. ([Kiro.dev](https://kiro.dev/))
- **Sherpa's initiative system IS the spec** — proposals and plans already contain the requirements that agents need. This is a natural advantage over products that invented spec-driven development from scratch.
- **RedMonk's 10 developer demands** — background agents, persistent memory, predictable pricing, MCP integration, multi-agent orchestration, spec-driven development, reliability, HITL controls, rollbacks/checkpoints, reusable skills. Sherpa already has 4-5 of these (#6 spec-driven via initiatives, #8 HITL via proposals, #9 checkpoints via git worktrees, #10 skills via /rr etc.). ([RedMonk](https://redmonk.com/kholterhoff/2025/12/22/10-things-developers-want-from-their-agentic-ides-in-2025/))
- **Notification design is unsolved** — no product handles the timing of agent interruptions well. Exception-only interruption (only failures and blocks) is the consensus best practice.
- **Asynchronous authorization** — agents can request approval and continue other work while waiting. Non-blocking approval flows. ([Auth0](https://auth0.com/blog/secure-human-in-the-loop-interactions-for-ai-agents/))

**Implications:**
- Sherpa's existing convention stack (initiatives, proposals, plans, rules, skills) already implements what the industry is building toward
- Three delegation paths for Studio: dispatch from initiative/task board, natural language, and via proposal documents
- Notification design: only blocks and failures interrupt; successes batch into morning review

### Vector 5: Collaborative Editing, Authorship, and Human-Agent Co-Creation
**Question:** When both humans and agents modify documents, what patterns handle visibility and conflict?
**Full report:** [iteration-2/vector-5-collaborative-editing-authorship.md](iteration-2/vector-5-collaborative-editing-authorship.md)

**Key discoveries:**
- **Empirical study (arXiv:2509.11826)** — teams treat AI agents as shared resources, not co-authors. 88% of tasks assigned to agents were by that agent's creator. Only 7 of 67 tasks used autonomous triggers. Comment-based integration (suggest, don't edit) is strongly preferred. ([arXiv](https://arxiv.org/html/2509.11826))
- **Superhuman/Grammarly Authorship** — agent-specific attribution distinguishing human-created, AI-generated, and AI-edited content. Can identify which specific agent was used. 5M+ reports generated. ([Grammarly Blog](https://www.grammarly.com/blog/company/superhuman-authorship-docs/))
- **Agents as tools, not team members** — despite "collaborative" framing, agents were "used by the team, not part of it." Users treat agents as territorial personal tools. ([arXiv](https://arxiv.org/html/2509.11826))
- **Git worktree isolation avoids CRDT complexity** — agent orchestrators use git worktrees to avoid conflicts entirely. CRDTs (Yjs, eg-walker) needed only for real-time shared editing, not for agent work. ([Multiple sources](https://github.com/ComposioHQ/agent-orchestrator))
- **Frontiers systematic review** — "Human-AI collaboration is not very collaborative yet." Most implementations use the simplest interaction patterns. Delegation pattern is under-explored. ([Frontiers](https://www.frontiersin.org/journals/computer-science/articles/10.3389/fcomp.2024.1521066/full))

**Implications:**
- Sherpa's proposal-based model (suggest changes, human reviews) is empirically validated as the preferred pattern
- Authorship attribution should be a first-class UI concern — every agent contribution is visually distinct
- Don't try to make agents "collaborators" — design for them as delegated workers with human accountability

### Vector 6: Progressive Disclosure, Skills, and Agentic Design Systems
**Question:** How should agent work be revealed at the right level of detail? What design primitives are emerging?
**Full report:** [iteration-2/vector-6-progressive-disclosure-observability.md](iteration-2/vector-6-progressive-disclosure-observability.md)

**Key discoveries:**
- **Five levels of progressive disclosure** — Level 0: color dot status indicator (always visible). Level 1: card with name/task/state/duration (fleet overview). Level 2: structured summary (side panel). Level 3: activity stream with tool calls, thoughts, elicitations (detail view). Level 4: raw OpenTelemetry trace (debug mode). ([Multiple sources](https://deepwiki.com/microsoft/agent-skills/3.3-progressive-disclosure))
- **shadcn/ui March 2026 update** is now optimized for the "Agentic Era" with CLI v4, shadcn/skills, and Presets engine. Sherpa already uses shadcn/ui — this is strategic alignment. ([Dev.to](https://dev.to/codedthemes/shadcnui-march-2026-update-cli-v4-ai-agent-skills-and-design-system-presets-1gp1))
- **Six production UI primitives** from CopilotKit: agentic chat, HITL planning, agentic generative UI, tool-based generative UI, shared state, predictive state updates. ([CopilotKit](https://www.copilotkit.ai/))
- **Pipeline composition, not graph** — most real agent work is pipeline-shaped. Sherpa's Planner/Worker/Judge is the right complexity level. Don't build a visual DAG editor.
- **Generative UI** — agents generating UI components in real-time is emerging via A2UI, MCP Apps, and CopilotKit. Future work for Sherpa's MCP server.

**Implications:**
- Five-level progressive disclosure model should guide Studio's component hierarchy
- Sherpa's skills (`/rr`, `/integration-review`, `/plan-tasks`) are already the pattern the industry is converging on
- shadcn/ui alignment is strategic — leverage the agentic era updates

## Synthesis

Six cross-cutting patterns emerged that no single vector produced alone:

### 1. The Fleet Minimap Is the Missing Primitive

Every product surveyed provides list views of agent sessions. None provides a persistent, always-visible overview of fleet activity (the RTS minimap equivalent). The closest attempts are GitHub Mission Control and builderz-labs' 32-panel dashboard, but both are full-page experiences, not persistent widgets. **Studio should embed a compact fleet status indicator in its sidebar or header** — showing active agent count, aggregate state distribution, and one-click drill-down. This is the single most novel UI opportunity.

### 2. Delegation-Not-Assignment Is the Governance Model

Linear's design decision to separate delegation (agents) from assignment (humans) is a breakthrough. The human remains accountable; the agent is delegated work. This maps perfectly to Sherpa's behavioral agent system: behavioral roles define how agents work, but the human product owner retains initiative ownership. Every product that conflates agent and human roles creates confusion about accountability.

### 3. The Industry Is Building What Sherpa Already Has

Sherpa's convention stack — initiatives as specs, proposals as delegation artifacts, behavioral constraints as steering files, skills as reusable workflows, git worktrees as isolation boundaries — matches or exceeds what the industry is independently arriving at:

| Industry Pattern | Sherpa Equivalent |
|-----------------|-------------------|
| Spec-driven development (Kiro) | Initiative proposals |
| Steering files (Kiro) | `.claude/rules/` conventions |
| Skills (RedMonk #10) | `/rr`, `/integration-review`, `/plan-tasks` |
| Git worktree isolation | `.worktrees/` convention |
| Agent delegation model (Linear) | Behavioral agent system |
| Exception-first review (multiple) | Morning review design |
| Structured output format (GitHub Job Summaries) | Research reports, task results |

The gap is in **surface-level UX** — Sherpa has the governance substrate but lacks the visual fleet management layer.

### 4. Four States, Five Disclosure Levels, Three Delegation Paths

The research converges on a tight set of primitives:

**Agent states:** working | waiting-for-input | completed | failed

**Progressive disclosure:** color dot -> card -> summary -> activity stream -> raw trace

**Delegation paths:** from initiative (spec-driven) | from chat (natural language) | from task board (issue-based)

These are not options to choose between — they're all needed. The morning review operates at disclosure levels 1-2 with state-based filtering. Deep debugging operates at levels 3-4.

### 5. Agents Are Tools, Not Team Members

The empirical HCI research (arXiv:2509.11826) conclusively shows that users treat agents as personal tools with territorial ownership, not as collaborators. The Frontiers systematic review confirms that human-AI collaboration is "not very collaborative yet." Design implications:

- Don't build "team chat with agents as participants"
- Do build "task delegation with agent work products"
- Authorship attribution matters, but agents don't have opinions — they have outputs
- Comment-based interaction (propose, don't edit) is the validated pattern

### 6. The Timing Problem Is Real and Unsolved

Devin's "awkward middle" — too slow to watch, fast enough to interrupt — captures a fundamental tension no product has resolved. The best current answer is exception-only notification (only failures and blocks interrupt) combined with batched morning review for completed work. But this still doesn't solve: when should you check on a running agent? The RTS answer is "cycle through your bases periodically" — which suggests a keyboard shortcut to quickly scan all active sessions.

## All Sources

### Product-Specific
- [GitHub Agent HQ](https://github.blog/news-insights/company-news/welcome-home-agents/)
- [GitHub Mission Control Changelog](https://github.blog/changelog/2025-10-28-a-mission-control-to-assign-steer-and-track-copilot-coding-agent-tasks/)
- [GitHub Mission Control Orchestration Guide](https://github.blog/ai-and-ml/github-copilot/how-to-orchestrate-agents-using-mission-control/)
- [VS Code Multi-Agent Development](https://code.visualstudio.com/blogs/2026/02/05/multi-agent-development)
- [VS Code Unified Agent Experience](https://code.visualstudio.com/blogs/2025/11/03/unified-agent-experience)
- [Cognition Devin 2.0](https://cognition.ai/blog/devin-2)
- [Cognition Devin Performance Review 2025](https://cognition.ai/blog/devin-annual-performance-review-2025)
- [OpenAI Codex](https://openai.com/index/introducing-codex/)
- [Google Antigravity](https://developers.googleblog.com/build-with-google-antigravity-our-new-agentic-development-platform/)
- [Antigravity Deep Dive](https://www.arjankc.com.np/blog/google-antigravity-agent-manager-explained/)
- [Claude Code Agent Teams](https://code.claude.com/docs/en/agent-teams)
- [Claude Code Subagents](https://code.claude.com/docs/en/sub-agents)
- [AWS Q Developer Features](https://aws.amazon.com/q/developer/features/)
- [AWS Q Developer Blog](https://aws.amazon.com/blogs/devops/reinventing-the-amazon-q-developer-agent-for-software-development/)
- [Linear Agent SDK](https://linear.app/developers/agents)
- [Linear Agent SDK Blog](https://linear.app/now/our-approach-to-building-the-agent-interaction-sdk)
- [Linear Agent Interaction Guidelines](https://linear.app/developers/aig)
- [Linear Triage Intelligence](https://linear.app/now/how-we-built-triage-intelligence)
- [Kiro.dev](https://kiro.dev/)
- [Kiro - From Chat to Specs](https://kiro.dev/blog/from-chat-to-specs-deep-dive/)
- [Figma Make](https://www.figma.com/make/)
- [OpenAI Figma Partnership](https://openai.com/index/figma-partnership/)
- [Grammarly/Superhuman Authorship](https://www.grammarly.com/blog/company/superhuman-authorship-docs/)
- [Grammarly Authorship](https://www.grammarly.com/authorship)

### Open Source Mission Control
- [builderz-labs/mission-control](https://github.com/builderz-labs/mission-control)
- [MeisnerDan/mission-control](https://github.com/MeisnerDan/mission-control)
- [Claude Squad](https://github.com/smtg-ai/claude-squad)
- [Agent Deck](https://github.com/asheshgoplani/agent-deck)
- [Composio Agent Orchestrator](https://github.com/ComposioHQ/agent-orchestrator)
- [Overstory](https://github.com/jayminwest/overstory)
- [ccswarm](https://github.com/nwiizo/ccswarm)
- [Claude Code Dashboard Issue #24537](https://github.com/anthropics/claude-code/issues/24537)

### Protocols & Standards
- [AG-UI Protocol](https://docs.ag-ui.com/)
- [AG-UI CopilotKit](https://www.copilotkit.ai/ag-ui)
- [AG-UI Event Types](https://www.copilotkit.ai/blog/master-the-17-ag-ui-event-types-for-building-agents-the-right-way)
- [A2UI.org](https://a2ui.org/)
- [Google A2UI Blog](https://developers.googleblog.com/introducing-a2ui-an-open-project-for-agent-driven-interfaces/)
- [MCP Apps Extension](http://blog.modelcontextprotocol.io/posts/2025-11-21-mcp-apps/)
- [MCP Apps Update](http://blog.modelcontextprotocol.io/posts/2026-01-26-mcp-apps/)
- [SEP-1865 PR](https://github.com/modelcontextprotocol/modelcontextprotocol/pull/1865)
- [MCP-UI Goose Blog](https://block.github.io/goose/blog/2025/08/25/mcp-ui-future-agentic-interfaces/)
- [MCP-UI GitHub](https://github.com/MCP-UI-Org/mcp-ui)
- [MCP Elicitation](https://dev.to/kachurun/mcp-elicitation-human-in-the-loop-for-mcp-servers-m6a)
- [MCP Spec Updates](https://forgecode.dev/blog/mcp-spec-updates/)
- [Agent Communication Protocol](https://agentcommunicationprotocol.dev/core-concepts/agent-run-lifecycle)
- [CopilotKit State of Agentic UI](https://www.copilotkit.ai/blog/the-state-of-agentic-ui-comparing-ag-ui-mcp-ui-and-a2ui-protocols)
- [Inkeep - MCP Apps](https://inkeep.com/blog/anthropic-openai-mcp-apps-extension)

### Gaming UX
- [David Hoang - RTS Games and AI Interfaces](https://www.proofofconcept.pub/p/real-time-strategy-games-and-ai-interfaces)
- [Daniel Rodriguez - God Mode UX](https://medium.com/sadasant/god-mode-ux-why-your-next-interface-will-look-more-like-starcraft-than-slack-12498eb274d4)
- [HN Discussion - God Mode UX](https://news.ycombinator.com/item?id=46458231)
- [Game Wisdom - UI Strategy Game Design](https://game-wisdom.com/critical/ui-strategy-game-design)
- [Icy Veins - Advanced Raid UI Setup](https://www.icy-veins.com/wow/advanced-raid-ui-setup-guide)
- [Luke Bott - WoW Raid UI](https://lukebott.com/enhancing-your-wow-raid-ui-best-addons-interface-settings/)
- [MMO Champion - Healer UI](https://www.mmo-champion.com/threads/2524877-Elements-of-a-proper-healer-UI)

### Industry Analysis
- [Addy Osmani - Future of Agentic Coding](https://addyosmani.com/blog/future-agentic-coding/)
- [Addy Osmani - Conductors to Orchestrators (O'Reilly)](https://www.oreilly.com/radar/conductors-to-orchestrators-the-future-of-agentic-coding/)
- [Addy Osmani - Claude Code Swarms](https://addyosmani.com/blog/claude-code-agent-teams/)
- [RedMonk - 10 Things Developers Want](https://redmonk.com/kholterhoff/2025/12/22/10-things-developers-want-from-their-agentic-ides-in-2025/)
- [Martin Fowler - SDD Tools](https://martinfowler.com/articles/exploring-gen-ai/sdd-3-tools.html)
- [NEA Blog - Factory](https://www.nea.com/blog/factory-the-platform-for-agent-native-development)
- [shadcn/ui March 2026](https://dev.to/codedthemes/shadcnui-march-2026-update-cli-v4-ai-agent-skills-and-design-system-presets-1gp1)
- [Scott Logic - Devin Review](https://blog.scottlogic.com/2025/10/20/rapid-development-with-devin.html)

### Academic / HCI Research
- [arXiv - Collaborative Editing with AI Agents](https://arxiv.org/html/2509.11826)
- [Frontiers - Human-AI Collaboration Taxonomy](https://www.frontiersin.org/journals/computer-science/articles/10.3389/fcomp.2024.1521066/full)
- [arXiv - Agency Patterns Scoping Review](https://arxiv.org/html/2507.06000v2)
- [Magentic-UI Paper](https://arxiv.org/abs/2507.22358)

### Observability
- [Arize Agent Observability](https://arize.com/ai-agents/agent-observability/)
- [GetMaxim Agent Tracing](https://www.getmaxim.ai/articles/agent-tracing-for-debugging-multi-agent-ai-systems/)
- [Evil Martians - Agent Prism](https://evilmartians.com/chronicles/debug-ai-fast-agent-prism-open-source-library-visualize-agent-traces)
- [Vellum - Agent Observability Guide](https://www.vellum.ai/blog/understanding-your-agents-behavior-in-production)

### Human-in-the-Loop
- [Permit.io HITL](https://www.permit.io/blog/human-in-the-loop-for-ai-agents-best-practices-frameworks-use-cases-and-demo)
- [Auth0 - Secure HITL](https://auth0.com/blog/secure-human-in-the-loop-interactions-for-ai-agents/)
- [ByteBridge - Evolving Autonomy](https://bytebridge.medium.com/from-human-in-the-loop-to-human-on-the-loop-evolving-ai-agent-autonomy-c0ae62c3bf91)
- [SentaSight - AI Notification Management](https://www.sentisight.ai/ai-manages-digital-notification-chaos/)
- [Pando.ai - Exception Management](https://pando.ai/blogs/the-exception-management-revolution-from-15-hour-queues-to-1-hour-weekly-reviews)
- [Agents as State Machines](https://dev.to/gantz/idle-thinking-acting-agents-as-state-machines-427n)

### Design Systems & UI Frameworks
- [CopilotKit](https://www.copilotkit.ai/)
- [CopilotKit Generative UI](https://www.copilotkit.ai/generative-ui)
- [CopilotKit Shared State](https://docs.copilotkit.ai/coagents/shared-state/predictive-state-updates)
- [AI UX Design Guide](https://www.aiuxdesign.guide/patterns/progressive-disclosure)
- [NN/g Progressive Disclosure](https://www.nngroup.com/articles/progressive-disclosure/)
- [Medium - State of Design 2026](https://tejjj.medium.com/state-of-design-2026-when-interfaces-become-agents-fc967be10cba)
- [Medium - Agentic Design Systems](https://medium.com/@disco_lu/building-agentic-design-systems-the-future-of-ai-enhanced-design-6ad0470cf1e3)

## Open Questions for Next Iteration

1. **Fleet minimap wireframe** — What specific component renders? What data feeds it? How does it integrate into Studio's existing sidebar? What's the information hierarchy within the minimap?

2. **Delegation UX design** — How does dispatching a task from an initiative look in Studio? From the morning review? Natural language delegation from where?

3. **AG-UI event model adaptation** — How do AG-UI's 17 event types map to Sherpa's MCP server? What events does studio-mcp need to emit? How does the frontend subscribe?

4. **Agent activity stream component** — What does the Linear-style activity stream (tool calls, thoughts, elicitations, responses) look like in shadcn/ui? Can this be a reusable component in studio-ui?

5. **Notification architecture** — How should "needs your input" notifications reach the user when Studio is not open? Email digest? System notifications? Slack integration?

6. **Cost visibility without anxiety** — Iteration 1 established "retrospective weather report, not real-time bill." How does this integrate with the fleet minimap? Per-initiative or per-session?

## Proposals Generated

None yet — this iteration is pure research discovery. Proposals should target:
- Fleet status sidebar component for Studio
- Agent activity stream component for Studio
- AG-UI event model integration with studio-mcp
- Delegation flow from initiative detail page
