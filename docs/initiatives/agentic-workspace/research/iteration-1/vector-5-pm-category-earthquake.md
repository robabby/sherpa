---
role: research-lead
type: brief
created: 2026-03-12
initiative: sherpa-framework-extraction
---

# The PM Tool Category Is Fragmenting: What Replaces It in an AI-Agent World

Research conducted 2026-03-12. All claims sourced with URLs inline.

---

## Executive Summary

The project management tool category is undergoing the most significant disruption in 35 years. Gartner predicts GenAI and AI agents will create the first true challenge to mainstream productivity tools, prompting a **$58 billion market shake-up** ([Gartner Strategic Predictions 2026](https://www.gartner.com/en/articles/strategic-predictions-for-2026)). The "SaaSpocalypse" of early 2026 erased approximately **$2 trillion in software market capitalization** in 30 days ([DigitalApplied](https://www.digitalapplied.com/blog/saaspocalypse-ai-agents-software-industry-analysis)), with Atlassian down 35% and Salesforce down 28%. The per-seat licensing model that sustained the PM tool industry is breaking. What replaces it is not another product -- it is a *framework layer* that governs how human and AI agents collaborate through conventions, protocols, and filesystem-based governance.

---

## Key Discoveries

### 1. Height.app: The AI-Native PM Pioneer That Failed

- **Height.app shut down** September 24, 2025, after raising **$18.3M** ($14M Series A, Sep 2021). CEO Michael Villar gave no specific reason. ([Creativerly](https://www.creativerly.com/height-is-shutting-down/), [AlternativeTo](https://alternativeto.net/news/2025/3/height-project-management-tool-to-shut-down-by-september-2025/))
- Height positioned as "the autonomous project management tool" with AI bug triage, auto-fill attributes, and live product docs that monitored chat for decisions and auto-updated specs. ([Skywork analysis](https://skywork.ai/skypage/en/Height-App-The-Rise-and-Sunset-of-an-AI-Project-Management-Pioneer/1975012339164966912))
- **Lesson:** Being "AI-native" as a *product* is insufficient. Height built AI features on top of conventional PM primitives (tasks, boards, attributes). The primitives themselves are what AI makes obsolete. $18.3M in funding and beautiful design could not overcome category-level disruption.

### 2. The SaaSpocalypse: $2 Trillion Evaporated

- On **February 3, 2026**, ~$285B in market value vanished from SaaS stocks in 24 hours. Over the following month, ~$2 trillion total. ([DigitalApplied](https://www.digitalapplied.com/blog/saaspocalypse-ai-agents-software-industry-analysis), [CNBC](https://www.cnbc.com/2026/02/06/ai-anthropic-tools-saas-software-stocks-selloff.html), [Bloomberg](https://www.bloomberg.com/news/articles/2026-02-04/what-s-behind-the-saaspocalypse-plunge-in-software-stocks))
- **Catalyst:** Anthropic launched Claude Cowork (Jan 20, 2026), a computer-using agent that operates desktop software autonomously. Fortune called it "a file-managing AI agent that could threaten dozens of startups." ([Fortune](https://fortune.com/2026/01/13/anthropic-claude-cowork-ai-agent-file-managing-threaten-startups/), [VentureBeat](https://venturebeat.com/technology/anthropic-launches-cowork-a-claude-desktop-agent-that-works-in-your-files-no))
- **Stock declines:** Atlassian -35%, Salesforce -28%, HubSpot -25%, ServiceNow -22%, Workday -20%. ([DigitalApplied](https://www.digitalapplied.com/blog/saaspocalypse-ai-agents-software-industry-analysis))
- **Most exposed categories:** project management, CRM data entry, customer support -- workflows defined by repetitive, rule-based tasks.

### 3. Per-Seat Pricing Is Dying

- Ben Thompson (Stratechery): "The rise of agents raises serious questions about the long-term viability of the per-seat licensing model on which Microsoft's productivity business is built." Microsoft 365 Copilot has 15M paying customers but that's a tiny fraction of M365's base. ([Stratechery](https://stratechery.com/2026/microsoft-and-software-survival/))
- Bain & Company: "Within three years, any routine, rules-based digital task could move from 'human plus app' to 'AI agent plus API.'" Pricing must shift from access-based to outcome-based. ([Bain](https://www.bain.com/insights/will-agentic-ai-disrupt-saas-technology-report-2025/))
- Gartner: By 2030, at least 40% of enterprise SaaS spending will shift to usage-, agent-, or outcome-based pricing models. ([Gartner](https://www.gartner.com/en/articles/strategic-predictions-for-2026))
- The SaaS EV/Revenue median dropped to **5.1x** in Dec 2025, down from pandemic peak of 18-19x. ([UncoverAlpha](https://www.uncoveralpha.com/p/the-great-saas-unbundling-why-ai))

### 4. Incumbents Are Bolting AI Onto Existing Paradigms

**Linear** ($1.25B valuation, $82M Series C, Jun 2025):
- Added Triage Intelligence (auto-assigns, auto-labels based on historical patterns), continuous planning methodology. ([Linear AI](https://linear.app/ai), [TechCrunch](https://techcrunch.com/2025/06/10/atlassian-rival-linear-raises-82m-at-1-25b-valuation/))
- Still fundamentally issues + cycles + projects. AI augments; it doesn't reimagine.

**Atlassian/Jira** (Rovo agents):
- Rovo passed **5M monthly active users**. Agents in Jira launched open beta Feb 2026. ([Atlassian](https://www.atlassian.com/software/jira/ai), [SiliconANGLE](https://siliconangle.com/2026/02/25/atlassian-embeds-agents-jira-embraces-mcp-third-party-integrations/))
- Embraced MCP for third-party integrations. Rovo MCP Gallery with GitHub, Figma, Box. ([Atlassian MCP Server](https://github.com/atlassian/atlassian-mcp-server))
- 33% of MCP operations are writes (agents doing real work, not just reading). But still Jira's paradigm: issues, boards, sprints.

**Notion** (3.0 Agents, Sep 2025; Custom Agents, Feb 2026):
- Agents can work autonomously for up to 20 minutes, across hundreds of pages. Custom Agents run 24/7 on triggers. ([Notion 3.0](https://www.notion.com/releases/2025-09-18), [Notion 3.3](https://www.notion.com/releases/2026-02-24))
- Multi-model: GPT-5.2, Claude Opus 4.5, Gemini 3. Closest to "everything app" but still a SaaS product with per-seat pricing.

**Wrike** (AI Agents GA, Feb 2026):
- AI actions in January 2026 nearly equaled all of 2025. Weekly active AI users up **4,900%**. ([Wrike](https://www.wrike.com/newsroom/wrike-launches-ai-agents-delivering-six-days-of-output-in-a-five-day-work-week/))
- Agent Builder (no-code), Agent Chaining, sandbox testing environment.

**Asana:**
- AI Teammates (beta) + AI Agents no-code builder for triaging, auto-assigning, summarizing.

**ClickUp:**
- Brain + Autopilot Agents. "Super Agents" as teammates. AI costs extra ($14-33/user/month). ([Tuck Consulting](https://tuckconsultinggroup.com/articles/whats-new-in-clickup-ai-for-2026/))

**Monday.com:**
- Tied with Asana at top AI maturity score (36/50). Leads in risk detection and portfolio visibility. ([AgileGenesis](https://www.agilegenesis.com/post/ai-project-management-tool-rankings-2026))

### 5. The Real Disruption: IDEs and CLIs Are Becoming the PM Layer

**GitHub Copilot Agent HQ:**
- Assign an issue to Copilot from GitHub Issues, Jira, Linear, Azure Boards, or Slack. Agent plans work, opens PR, writes code, runs tests, asks for review. ([GitHub Blog](https://github.blog/ai-and-ml/github-copilot/assigning-and-completing-issues-with-coding-agent-in-github-copilot/))
- Multi-agent: run Claude, Codex, and Copilot in parallel on the same issue. ([GitHub Agent HQ](https://github.blog/news-insights/company-news/pick-your-agent-use-claude-and-codex-on-agent-hq/))
- Agent Teams (preview): spin up sub-agents that work in parallel with shared task lists and dependency tracking.

**Claude Code:**
- Terminal-native. Reads entire repos, plans multi-step changes, delivers PR-ready diffs. Agent Teams for parallel sub-agents. ([Morphllm comparison](https://www.morphllm.com/comparisons/claude-code-vs-copilot))

**Cursor:**
- Over 50% of Fortune 500 adopted by mid-2025. $200/month Ultra plan. Expanded to web app + Slack bot. Multi-root workspace support. ([Cursor Changelog](https://blog.promptlayer.com/cursor-changelog-whats-coming-next-in-2026/))
- @Cursor fix the login bug in Slack triggers a coding agent.

**Google Antigravity:**
- Agent-first IDE (VS Code fork, $2.4B Windsurf acquisition). "Mission Control" for managing autonomous agents. Agents produce Artifacts (task lists, plans, screenshots). ([Google Developers Blog](https://developers.googleblog.com/build-with-google-antigravity-our-new-agentic-development-platform/))

**Devin (Cognition):**
- Goldman Sachs, Santander, Nubank. 4x faster at problem solving YoY. 67% PR merge rate vs 34% last year. One senior engineer + Devin = 5-person team output. ([Cognition](https://cognition.ai/blog/devin-annual-performance-review-2025))

**Vibe Kanban:**
- Open-source Kanban board specifically for managing AI coding agents. Tasks run in isolated git worktrees. 9.4k GitHub stars. Supports Claude Code, Codex, Gemini CLI, Copilot, and 10+ agents. Apache 2.0. ([GitHub](https://github.com/BloopAI/vibe-kanban), [vibekanban.com](https://www.vibekanban.com/))

### 6. Sprints, Story Points, and Kanban Are Becoming Obsolete

- P3 Group whitepaper "From Sprints to Swarms": "The era of human-centric process optimisation is over." Daily standups become "an exercise in absurdity" for AI agents in real-time API sync. ([P3 Group](https://www.p3-group.com/en/p3-updates/navigating-the-post-agile-future-in-the-age-of-ai/))
- Early evidence: **4x productivity gains** now, forecasts of **30-100x acceleration**. Sprint ceremonies become bottlenecks at machine speed. ([P3 Group whitepaper](https://www.p3-group.com/wp-content/uploads/2025/09/From_Sprints_to_Swarms.pdf))
- Replacements emerging: Autonomous Agent Swarms, Orchestrated Specialist Pipelines, Prompt-Chained Workflows.
- The Agile Manifesto's core values endure -- reinterpreted as **governance frameworks** ensuring AI execution stays aligned with human intent.

### 7. Convention-Over-Configuration Is the Emerging Standard

**AGENTS.md** (OpenAI, Aug 2025):
- Adopted by **60,000+ open source projects**. Supported by Cursor, Devin, Copilot, Gemini CLI, VS Code, Claude Code, etc. ([InfoQ](https://www.infoq.com/news/2025/08/agents-md/), [agents.md](https://agents.md/))
- Filesystem-based: Markdown files in the repo that agents read for project-specific guidance.

**Agentic AI Foundation (AAIF)** (Dec 2025, Linux Foundation):
- Co-founded by Anthropic (MCP), OpenAI (AGENTS.md), Block (goose). ([Linux Foundation](https://www.linuxfoundation.org/press/linux-foundation-announces-the-formation-of-the-agentic-ai-foundation), [OpenAI](https://openai.com/index/agentic-ai-foundation/))
- The three foundational projects are all *protocols and conventions*, not products.

**MCP (Model Context Protocol):**
- 97M+ monthly SDK downloads. 5,800+ servers, 300+ clients. Adopted by Salesforce, ServiceNow, Workday, Atlassian. ([MCP Blog](http://blog.modelcontextprotocol.io/posts/2026-mcp-roadmap/), [Pento](https://www.pento.ai/blog/a-year-of-mcp-2025-review))
- Bain: MCP creates "network-effect dynamics -- lightning-fast tipping points, winner takes most." ([Bain](https://www.bain.com/insights/will-agentic-ai-disrupt-saas-technology-report-2025/))

**APM (Agentic Project Management):**
- Open-source framework (2.1k stars). Coordinates 4 agent roles via slash commands across 11 AI tools. Context retention across session boundaries. ([GitHub](https://github.com/sdi2200262/agentic-project-management), [agentic-project-management.dev](https://agentic-project-management.dev/))
- Direct parallel to Sherpa's approach: filesystem-based, convention-driven, tool-agnostic.

### 8. The Great SaaS Rebundling/Unbundling Cycle

- Software industry swings between bundling and unbundling roughly every 7 years. AI accelerates the current cycle to ~5 years. ([StartupSpells](https://startupspells.com/p/saas-rebundling-ai-kills-point-solutions))
- Bain's three-layer stack: (1) Systems of Record, (2) Agent Operating Systems, (3) Outcome Interfaces. Control of the semantic interoperability layer (MCP, A2A) becomes decisive. ([Bain](https://www.bain.com/insights/will-agentic-ai-disrupt-saas-technology-report-2025/))
- a16z: "Every team should be a software team." AI makes it economically viable for every functional area to have custom software. The successors of coding, design, and productivity tools are focused on *exploration vs execution*. ([a16z](https://a16z.com/notes-on-ai-apps-in-2026/))
- Coding tools alone generated **$1B+ in new revenue** in 2025. ([a16z](https://a16z.com/notes-on-ai-apps-in-2026/))

### 9. New Entrants Worth Watching

**Plane.so:**
- Open-source Jira/Linear alternative. 31K+ GitHub stars. Native MCP server at [github.com/makeplane/plane-mcp-server](https://github.com/makeplane/plane-mcp-server). Open API, webhooks, OAuth apps. ([Plane](https://plane.so))

**Taskade:**
- Agent Sandbox with custom AI agents per folder. Three execution modes (Simple/Manual/Orchestrate). 100+ integrations. ([Taskade](https://www.taskade.com/blog/autonomous-project-management))

**CodeRabbit Issue Planner:**
- Collaborative planning inside existing issue trackers (Linear, Jira, GitLab, GitHub Issues). Scope + assumptions + success criteria *before* code. ([CodeRabbit](https://www.coderabbit.ai/blog/issue-planner-collaborative-planning-for-teams-with-ai-agents))

### 10. The Workflow Paradigm Is Shifting

**From "plan then execute" to "execute then review":**
- Addy Osmani: Specifications are now generated collaboratively with AI in 15 minutes ("waterfall in 15 minutes"), then agents execute. Developers become *directors managing capable but imperfect agents*. ([Addy Osmani](https://addyosmani.com/blog/ai-coding-workflow/))
- ReAct pattern (Reason-Act interleaving) works for short tasks but drifts on long ones. Plan-and-Execute separates planning from execution for reliability. ([ByteByteGo](https://blog.bytebytego.com/p/top-ai-agentic-workflow-patterns))
- Linear's continuous planning: never a need to translate between discovery, planning, and execution. Projects develop organically as teams triage. ([Linear](https://linear.app/now/continuous-planning-in-linear))

---

## Analyst Frameworks and Data Points

| Source | Prediction | URL |
|--------|-----------|-----|
| Gartner | $58B productivity tool market shake-up by 2027 | [link](https://www.gartner.com/en/articles/strategic-predictions-for-2026) |
| Gartner | 40% of enterprise apps will have AI agents by end of 2026 (up from <5% in 2025) | [link](https://www.gartner.com/en/newsroom/press-releases/2025-08-26-gartner-predicts-40-percent-of-enterprise-apps-will-feature-task-specific-ai-agents-by-2026-up-from-less-than-5-percent-in-2025) |
| Gartner | 80% of PM tasks run by AI by 2030 | [link](https://www.epicflow.com/blog/ai-in-project-management-is-the-future-already-here/) |
| Gartner | 40%+ of agentic AI projects canceled by end of 2027 | [link](https://www.gartner.com/en/newsroom/press-releases/2025-06-25-gartner-predicts-over-40-percent-of-agentic-ai-projects-will-be-canceled-by-end-of-2027) |
| Gartner | Global AI spending to top $2T in 2026 | [link](https://www.gartner.com/en/newsroom/press-releases/2025-09-17-gartner-says-worldwide-ai-spending-will-total-1-point-5-trillion-in-2025) |
| Bain | Three-layer stack: Systems of Record > Agent OS > Outcome Interfaces | [link](https://www.bain.com/insights/will-agentic-ai-disrupt-saas-technology-report-2025/) |
| a16z | Tools shift from execution to exploration. "Every team = software team." | [link](https://a16z.com/notes-on-ai-apps-in-2026/) |
| a16z | 2026 unlocks "multiplayer mode" for agents across permissions | [link](https://a16z.com/newsletter/big-ideas-2026-part-1/) |
| Lenny | PMs use AI most for PRDs (21.5%), mockups (19.8%), communication (18.5%) | [link](https://www.lennysnewsletter.com/p/ai-tools-are-overdelivering-results) |
| P3 Group | 4x productivity gains now, 30-100x forecast | [link](https://www.p3-group.com/en/p3-updates/navigating-the-post-agile-future-in-the-age-of-ai/) |

---

## Why Sherpa's Framework Approach Is Correct

The evidence overwhelmingly supports Sherpa's thesis that the correct response to PM tool disruption is a **framework** (conventions, protocols, behavioral constraints, filesystem governance), not a **product** (another SaaS with a dashboard and per-seat pricing).

### 1. Products die; conventions endure

Height.app raised $18.3M and built beautiful AI-native PM -- and shut down. Meanwhile, AGENTS.md (a markdown file convention) was adopted by 60,000+ projects in months. MCP (a protocol) hit 97M monthly downloads. The winning layer is the *convention*, not the *interface*.

### 2. The interface is generated, not designed

a16z's thesis: AI makes "thick" feature surfaces economically viable because building UI is nearly free. Google Antigravity generates Artifacts (task lists, plans, screenshots) on the fly. Notion agents build project plans autonomously. The fixed UI of a PM tool is a liability when every team can generate its own.

### 3. Agents need governance, not dashboards

Atlassian's key insight: "The challenge is no longer finding or convincing people to use agents. People have got many agents." The problem is governance -- permissions, audit trails, accountability, coordination. Sherpa's behavioral constraints, initiative conventions, and activity logs solve exactly this.

### 4. Filesystem-based governance scales where products don't

Sherpa's `CLAUDE.md`, `.claude/rules/`, initiative directories, and activity logs live *in the repo*. This means every worktree, every agent, every tool (Cursor, Claude Code, Copilot, Antigravity) can read and follow them. No API integration required. No vendor lock-in. APM (2.1k stars) validates this same pattern independently.

### 5. The per-seat model can't apply to agents

If agents are team members (Notion calls them "AI Teammates," Asana calls them "AI Teammates," Wrike calls them "digital workers"), per-seat pricing for agents breaks the economics. Sherpa as a framework has no per-seat constraint -- it governs the *workflow*, not the *access*.

### 6. Protocols win the semantic layer

Bain identifies the semantic interoperability layer (MCP, A2A) as decisive for value capture. Sherpa is already built around MCP (`@sherpa/studio-mcp`). The framework approach positions Sherpa at the protocol layer, not competing with dashboards.

### 7. "Multiplayer mode" for agents requires cross-tool governance

a16z predicts 2026 unlocks "multiplayer mode" where agents collaborate across distinct permissions and workflows. This is exactly Sherpa's multi-agent coordination model: behavioral roles, initiative ownership, worktree isolation, activity logs, integration review.

---

## Open Questions

1. **Will AGENTS.md and CLAUDE.md converge?** Both are filesystem conventions for agent guidance. Could Sherpa's convention layer become the union standard?

2. **What happens to Linear at $1.25B?** Linear's continuous planning and Triage Intelligence are the most sophisticated AI-augmented PM -- but still a product. Does Linear become a platform (survive) or get disrupted by the framework layer?

3. **Is "Vibe Kanban" a signal or an anomaly?** 9.4k stars for an open-source Kanban board for AI agents suggests strong demand for lightweight orchestration. Sherpa's initiative system + worktrees serve a similar role with deeper governance.

4. **Will Gartner's 40% cancellation prediction affect frameworks differently than products?** If 40%+ of agentic AI projects fail (Gartner), does a framework approach have better survival odds than product attempts?

5. **How does the "SaaSpocalypse" pricing disruption affect open-source/framework alternatives?** If per-seat SaaS is dying, does free-as-in-framework become the default for PM-like governance?

6. **What does "outcome-based pricing" look like for a framework?** Sherpa could charge for runtime (MCP server usage, agent dispatch) rather than seats. What's the business model for governance-as-a-framework?

7. **Will the Agentic AI Foundation (MCP + AGENTS.md + goose) create a unified governance standard?** This would validate Sherpa's entire approach.

---

## All Sources

### Height.app Shutdown
- [Creativerly: Height is shutting down](https://www.creativerly.com/height-is-shutting-down/)
- [Creativerly: Height.app shutting down after 3.5 years](https://www.creativerly.com/height-app-is-shutting-down/)
- [AlternativeTo: Height PM tool shutdown](https://alternativeto.net/news/2025/3/height-project-management-tool-to-shut-down-by-september-2025/)
- [Skywork: Height App Rise and Sunset](https://skywork.ai/skypage/en/Height-App-The-Rise-and-Sunset-of-an-AI-Project-Management-Pioneer/1975012339164966912)
- [Height.app official site](https://height.app/)
- [ClickUp: Height App Alternatives](https://clickup.com/blog/height-app-alternatives/)
- [Kanbanchi: Height App Alternatives](https://www.kanbanchi.com/blog/height-app-alternatives-guide)
- [Shortcut: Alternatives to Height](https://www.shortcut.com/blog/alternatives-to-height-app)
- [Height on X/Twitter](https://x.com/height_app/status/1903820182557999555)

### Linear
- [Linear AI features](https://linear.app/ai)
- [Linear Triage Intelligence](https://linear.app/docs/triage-intelligence)
- [Linear: How we built Triage Intelligence](https://linear.app/now/how-we-built-triage-intelligence)
- [Linear: Continuous planning](https://linear.app/now/continuous-planning-in-linear)
- [Linear: Auto-apply triage suggestions](https://linear.app/changelog/2025-09-19-auto-apply-triage-suggestions)
- [TechCrunch: Linear raises $82M at $1.25B](https://techcrunch.com/2025/06/10/atlassian-rival-linear-raises-82m-at-1-25b-valuation/)
- [Getlatka: Linear $100M revenue, 178 person team](https://getlatka.com/companies/linear.app)
- [Linear Deep Dive: $1.25B unicorn with 2 PMs](https://www.news.aakashg.com/p/how-linear-grows)
- [eesel.ai: Linear AI features 2026](https://www.eesel.ai/blog/linear-ai)

### Notion
- [Notion 3.0: Agents (Sep 2025)](https://www.notion.com/releases/2025-09-18)
- [Notion 3.2: Mobile AI (Jan 2026)](https://www.notion.com/releases/2026-01-20)
- [Notion 3.3: Custom Agents (Feb 2026)](https://www.notion.com/releases/2026-02-24)
- [Notion Blog: Introducing 3.0](https://www.notion.com/blog/introducing-notion-3-0)
- [TechCrunch: Notion launches agents](https://techcrunch.com/2025/09/18/notion-launches-agents-for-data-analysis-and-task-automation/)
- [Notion AI Review 2026](https://max-productive.ai/ai-tools/notion-ai/)
- [13 Notion AI Agent Use Cases](https://thecrunch.io/notion-ai-agent/)

### Atlassian / Jira / Rovo
- [Atlassian: Rovo in Jira](https://www.atlassian.com/software/jira/ai)
- [Atlassian: Rovo features](https://www.atlassian.com/software/rovo/features)
- [SiliconANGLE: Atlassian embeds agents, embraces MCP](https://siliconangle.com/2026/02/25/atlassian-embeds-agents-jira-embraces-mcp-third-party-integrations/)
- [Atlassian: Remote MCP Server announcement](https://www.atlassian.com/blog/announcements/remote-mcp-server)
- [Atlassian MCP Server (GitHub)](https://github.com/atlassian/atlassian-mcp-server)
- [Atlassian: MCP Server platform page](https://www.atlassian.com/platform/remote-mcp-server)
- [BusinessWire: Agents in Jira announcement](https://www.businesswire.com/news/home/20260224033792/en/Atlassian-Introduces-Agents-in-Jira-to-Drive-Human-AI-Collaboration-at-Enterprise-Scale)
- [TechInformed: AI agents in Jira permissions](https://techinformed.com/atlassian-adds-ai-agents-to-jira-under-existing-permissions/)
- [Deviniti: 38 Atlassian AI statistics 2026](https://deviniti.com/blog/enterprise-software/38-atlassian-ai-statistics-for-2026-rovo-atlassian-intelligence-adoption/)
- [eesel.ai: Does Jira have AI?](https://www.eesel.ai/blog/does-jira-have-ai)

### Asana, Monday.com, ClickUp, Wrike
- [AgileGenesis: AI PM Tool Rankings 2026](https://www.agilegenesis.com/post/ai-project-management-tool-rankings-2026)
- [Tuck Consulting: ClickUp AI 2025](https://tuckconsultinggroup.com/articles/clickup-ai-features-roundup-whats-new-in-2025/)
- [Tuck Consulting: ClickUp AI 2026](https://tuckconsultinggroup.com/articles/whats-new-in-clickup-ai-for-2026/)
- [Wrike: AI Agents launch (Feb 2026)](https://www.wrike.com/newsroom/wrike-launches-ai-agents-delivering-six-days-of-output-in-a-five-day-work-week/)
- [Wrike: AI Agents product page](https://www.wrike.com/ai/agents/)
- [Wrike: AI agents in PM](https://www.wrike.com/blog/ai-agents-in-project-management/)
- [Reworked: Wrike launches AI agents](https://www.reworked.co/collaboration-productivity/wrike-launches-ai-agents-that-run-workflows-automatically/)

### GitHub / Copilot
- [GitHub Blog: Assigning issues to coding agent](https://github.blog/ai-and-ml/github-copilot/assigning-and-completing-issues-with-coding-agent-in-github-copilot/)
- [GitHub: Agents on GitHub](https://github.com/features/copilot/agents)
- [GitHub Blog: Pick your agent (Agent HQ)](https://github.blog/news-insights/company-news/pick-your-agent-use-claude-and-codex-on-agent-hq/)
- [GitHub Docs: About coding agent](https://docs.github.com/en/copilot/concepts/agents/coding-agent/about-coding-agent)
- [GitHub Blog: Copilot CLI agents](https://github.blog/changelog/2026-01-14-github-copilot-cli-enhanced-agents-context-management-and-new-ways-to-install/)
- [GitHub: Coding agent for Copilot press release](https://github.com/newsroom/press-releases/coding-agent-for-github-copilot)
- [GitHub Blog: Agentic Workflows](https://github.blog/ai-and-ml/automate-repository-tasks-with-github-agentic-workflows/)
- [VS Code: Multi-agent development](https://code.visualstudio.com/blogs/2026/02/05/multi-agent-development)
- [VS Code: Third-party agents](https://code.visualstudio.com/docs/copilot/agents/third-party-agents)

### Claude Code and Anthropic
- [Claude Cowork introduction](https://claude.com/blog/cowork-research-preview)
- [Fortune: Anthropic launches Cowork](https://fortune.com/2026/01/13/anthropic-claude-cowork-ai-agent-file-managing-threaten-startups/)
- [VentureBeat: Cowork launch](https://venturebeat.com/technology/anthropic-launches-cowork-a-claude-desktop-agent-that-works-in-your-files-no)
- [Simon Willison: First impressions of Claude Cowork](https://simonwillison.net/2026/Jan/12/claude-cowork/)
- [Morphllm: Claude Code vs Copilot](https://www.morphllm.com/comparisons/claude-code-vs-copilot)
- [Medium: Claude Code vs Copilot agentic workflow](https://medium.com/@spacholski99/claude-code-vs-github-copilot-why-the-agentic-workflow-is-winning-the-ai-coding-war-c4cbfc929241)

### Google Antigravity
- [Google Developers Blog: Antigravity launch](https://developers.googleblog.com/build-with-google-antigravity-our-new-agentic-development-platform/)
- [BayTech: Antigravity AI IDE 2026](https://www.baytechconsulting.com/blog/google-antigravity-ai-ide-2026)
- [KDnuggets: Google Antigravity AI-first development](https://www.kdnuggets.com/google-antigravity-ai-first-development-with-this-new-ide)
- [index.dev: Antigravity agentic IDE](https://www.index.dev/blog/google-antigravity-agentic-ide)

### Devin / Cognition
- [Cognition: Devin 2025 performance review](https://cognition.ai/blog/devin-annual-performance-review-2025)
- [IBM: Devin as Goldman Sachs AI employee](https://www.ibm.com/think/news/goldman-sachs-first-ai-employee-devin)
- [eesel.ai: Cognition AI review 2026](https://www.eesel.ai/blog/cognition-ai)

### Cursor
- [PromptLayer: Cursor Changelog 2026](https://blog.promptlayer.com/cursor-changelog-whats-coming-next-in-2026/)
- [Cursor official](https://cursor.com/)

### Vibe Kanban
- [Vibe Kanban official](https://www.vibekanban.com/)
- [GitHub: Vibe Kanban](https://github.com/BloopAI/vibe-kanban)
- [VirtusLab: Vibe Kanban overview](https://virtuslab.com/blog/ai/vibe-kanban)

### New Entrants
- [Plane.so](https://plane.so)
- [Plane GitHub](https://github.com/makeplane/plane)
- [Taskade: Autonomous PM](https://www.taskade.com/blog/autonomous-project-management)
- [CodeRabbit Issue Planner](https://www.coderabbit.ai/blog/issue-planner-collaborative-planning-for-teams-with-ai-agents)
- [APM GitHub](https://github.com/sdi2200262/agentic-project-management)
- [APM docs](https://agentic-project-management.dev/)
- [NxgnTools: Top 5 Autonomous PMs 2026](https://www.nxgntools.com/blog/autonomous-project-management-tools-2026)

### Agile/Sprint Disruption
- [P3 Group: From Sprints to Swarms](https://www.p3-group.com/en/p3-updates/navigating-the-post-agile-future-in-the-age-of-ai/)
- [P3 Group whitepaper PDF](https://www.p3-group.com/wp-content/uploads/2025/09/From_Sprints_to_Swarms.pdf)
- [GovMetric: Broken promises of Agile](https://www.govmetric.com/blog/the-broken-promises-of-agile-and-how-ai-finally-delivers)
- [Scrum.org: Agile AI Agents](https://www.scrum.org/resources/blog/agile-ai-agents)
- [European Scrum AI Agile Guide 2025](https://www.europeanscrum.org/uploads/2/4/5/1/24513648/ai_agile_guide_2025.v2.0_-_europeanscrum.org.pdf)

### SaaSpocalypse and Pricing Disruption
- [DigitalApplied: SaaSpocalypse analysis](https://www.digitalapplied.com/blog/saaspocalypse-ai-agents-software-industry-analysis)
- [CNBC: AI fears pummel software stocks](https://www.cnbc.com/2026/02/06/ai-anthropic-tools-saas-software-stocks-selloff.html)
- [Bloomberg: SaaSpocalypse plunge](https://www.bloomberg.com/news/articles/2026-02-04/what-s-behind-the-saaspocalypse-plunge-in-software-stocks)
- [WebProNews: SaaSpocalypse erases $1T](https://www.webpronews.com/saaspocalypse-unraveled-ai-agents-erase-1-trillion-from-software-giants-reshaping-b2b-pricing-forever/)
- [Outlook India: SaaSpocalypse 2026](https://www.outlookindia.com/xhub/blockchain-insights/the-saaspocalypse-of-2026-how-agentic-ai-killed-per-seat-saas)
- [Fast Company: SaaSpocalypse counterpoint](https://www.fastcompany.com/91504460/everything-youve-heard-about-the-saaspocalypse-is-wrong)
- [Medium: Death of the seat](https://medium.com/write-a-catalyst/the-death-of-the-seat-how-ai-agents-are-breaking-the-saas-business-model-7fcb0cc860ba)
- [PinkLime: Death of per-seat pricing](https://pinklime.io/blog/future-saas-pricing-ai-era)
- [Monetizely: 2026 SaaS/AI pricing guide](https://www.getmonetizely.com/blogs/the-2026-guide-to-saas-ai-and-agentic-pricing-models)
- [Bain: Per-seat pricing isn't dead but...](https://www.bain.com/insights/per-seat-software-pricing-isnt-dead-but-new-models-are-gaining-steam/)

### SaaS Unbundling/Rebundling
- [UncoverAlpha: Great SaaS Unbundling](https://www.uncoveralpha.com/p/the-great-saas-unbundling-why-ai)
- [StartupSpells: SaaS Rebundling](https://startupspells.com/p/saas-rebundling-ai-kills-point-solutions)
- [Bain: Will agentic AI disrupt SaaS?](https://www.bain.com/insights/will-agentic-ai-disrupt-saas-technology-report-2025/)
- [BetterCloud: AI and SaaS industry 2026](https://www.bettercloud.com/monitor/saas-industry/)
- [EY: AI transforming SaaS landscape](https://www.ey.com/en_us/insights/tech-sector/ai-is-transforming-saas-landscape)
- [Intellectia: Will AI disrupt SaaS?](https://intellectia.ai/blog/will-ai-disrupt-saas-business-model-2026)
- [Zylo: 2026 SaaS trends](https://zylo.com/blog/saas-trends/)

### VC/Analyst Theses
- [a16z: Notes on AI Apps in 2026](https://a16z.com/notes-on-ai-apps-in-2026/)
- [a16z: Big Ideas 2026 Part 1](https://a16z.com/newsletter/big-ideas-2026-part-1/)
- [a16z: Big Ideas 2026 Part 2](https://a16z.com/newsletter/big-ideas-2026-part-2/)
- [a16z: Big Ideas in Tech 2025](https://a16z.com/big-ideas-in-tech-2025/)
- [Stratechery: Microsoft and Software Survival](https://stratechery.com/2026/microsoft-and-software-survival/)
- [Lenny: AI tools are overdelivering](https://www.lennysnewsletter.com/p/ai-tools-are-overdelivering-results)
- [Lenny: What's in your stack 2025](https://www.lennysnewsletter.com/p/whats-in-your-stack-the-state-of)

### Gartner Predictions
- [Gartner: Strategic Predictions 2026](https://www.gartner.com/en/articles/strategic-predictions-for-2026)
- [Gartner: 40% of enterprise apps with AI agents by 2026](https://www.gartner.com/en/newsroom/press-releases/2025-08-26-gartner-predicts-40-percent-of-enterprise-apps-will-feature-task-specific-ai-agents-by-2026-up-from-less-than-5-percent-in-2025)
- [Gartner: 40% of agentic AI projects canceled by 2027](https://www.gartner.com/en/newsroom/press-releases/2025-06-25-gartner-predicts-over-40-percent-of-agentic-ai-projects-will-be-canceled-by-end-of-2027)
- [Gartner: Worldwide AI spending $1.5T in 2025](https://www.gartner.com/en/newsroom/press-releases/2025-09-17-gartner-says-worldwide-ai-spending-will-total-1-point-5-trillion-in-2025)
- [IBM: Gartner 2026 predictions implications](https://www.ibm.com/think/insights/gartner-2026-tech-predictions-implications)

### MCP and Standards
- [MCP Specification](https://modelcontextprotocol.io/specification/2025-11-25)
- [MCP 2026 Roadmap](http://blog.modelcontextprotocol.io/posts/2026-mcp-roadmap/)
- [MCP Wikipedia](https://en.wikipedia.org/wiki/Model_Context_Protocol)
- [Pento: A year of MCP](https://www.pento.ai/blog/a-year-of-mcp-2025-review)
- [Thoughtworks: MCP impact on 2025](https://www.thoughtworks.com/en-us/insights/blog/generative-ai/model-context-protocol-mcp-impact-2025)
- [Linux Foundation: AAIF formation](https://www.linuxfoundation.org/press/linux-foundation-announces-the-formation-of-the-agentic-ai-foundation)
- [OpenAI: Agentic AI Foundation](https://openai.com/index/agentic-ai-foundation/)
- [InfoQ: AGENTS.md open standard](https://www.infoq.com/news/2025/08/agents-md/)
- [AGENTS.md official](https://agents.md/)

### Developer Workflow
- [Addy Osmani: AI coding workflow 2026](https://addyosmani.com/blog/ai-coding-workflow/)
- [ByteByteGo: Agentic workflow patterns](https://blog.bytebytego.com/p/top-ai-agentic-workflow-patterns)
- [Medium: State of AI coding agents 2026](https://medium.com/@dave-patten/the-state-of-ai-coding-agents-2026-from-pair-programming-to-autonomous-ai-teams-b11f2b39232a)
- [Cortex: AI tools for developers beyond coding](https://www.cortex.io/post/the-engineering-leaders-guide-to-ai-tools-for-developers-in-2026)

### Market Data
- [Epicflow: AI agents for PM market ($52.62B by 2030)](https://www.epicflow.com/blog/ai-agents-for-project-management/)
- [Agentic AI market: $7.6B in 2025, $196.6B by 2034](https://machinelearningmastery.com/7-agentic-ai-trends-to-watch-in-2026/)
- [KPMG: AI at Scale 2026](https://kpmg.com/us/en/media/news/q4-ai-pulse.html)
- [InformationWeek: 2026 enterprise AI predictions](https://www.informationweek.com/machine-learning-ai/2026-enterprise-ai-predictions-fragmentation-commodification-and-the-agent-push-facing-cios)
