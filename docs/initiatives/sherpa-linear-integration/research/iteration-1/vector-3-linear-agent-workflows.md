# Vector 3: Linear Agent Workflows in Production

**Question:** How are teams currently using Linear with AI agents? What patterns exist for agent-driven project management? What's the governance gap?
**Agent dispatched:** 2026-03-21

## Findings

### What Existing Agents Actually Do

**All 8+ integrated agents are coding agents.** The workflow is uniform:
1. Human assigns/mentions agent on Linear issue
2. Agent reads issue context (description, comments, linked references)
3. Agent writes code and opens a PR
4. Agent reports progress via Linear's activity system

**Cursor** — @mention `@Cursor`, spins up cloud agent, reads issue, writes code, opens PR. Cursor's team auto-triages "all product bugs and feedback" into agents, handling thousands of issues. "Got the API up and working in a day." ([Linear case study](https://linear.app/now/how-cursor-integrated-with-linear-for-agents))

**GitHub Copilot** — Assign via dropdown or @mention `@GitHub`. Creates `[WIP]` draft PR, posts completion notification. ([GitHub docs](https://docs.github.com/en/copilot/how-tos/use-copilot-agents/coding-agent/integrate-coding-agent-with-linear))

**OpenAI Codex** — Assign or @mention `@Codex`. Auto-selects repo, works through issue, engineers watch reasoning live or review summary. ([OpenAI docs](https://developers.openai.com/codex/integrations/linear))

**Devin** — Assign, @mention, or apply `devin` label. Scopes issue, suggests implementation plans, drafts PRs. PR merge rate improved 34% → 67% over 2025. ([Linear integration page](https://linear.app/integrations/devin))

**Factory** — "Droids" work in isolated cloud environments. Live updates flow back to Linear. Supports triage rules for auto-routing. ([Factory product page](https://factory.ai/product/ai-project-manager))

**Sentry** — Closest to governance. Root cause analysis via Seer, posts findings back. Can auto-open fix PRs. Toggle-controlled via comments. ([Sentry docs](https://docs.sentry.io/organization/integrations/issue-tracking/sentry-linear-agent/))

**Warp (Oz)** — Tag `@Oz`, agent clones repos, works task, generates PRs. Users can join live remote sessions to watch/steer. ([Warp docs](https://docs.warp.dev/agent-platform/cloud-agents/integrations/linear))

**ChatPRD** — The only non-coding agent. Improves issue descriptions, breaks work into sub-issues, provides product feedback. Documentation quality, not lifecycle enforcement. ([ChatPRD integration](https://linear.app/integrations/chatprd))

### Community MCP Servers

**jerhadf/linear-mcp-server** — Deprecated. 347 stars, 54 forks, MIT. 5 tools (create/update/search issues, get user issues, add comment). Local stdio, static API key. Created Dec 2024, deprecated May 2025 when official server launched.

**Official Linear MCP Server** — `https://mcp.linear.app/mcp`. OAuth 2.1, Streamable HTTP. Issues, projects, comments — "more functionality on the way." Works with Claude, Cursor, Codex, Windsurf, Zed, v0, VS Code.

**tacticlaunch/mcp-linear** — Community alternative, 134 stars, actively maintained (v1.0.12, Sep 2025). More tools than jerhadf.

### Dominant Pattern: Triage → Coding Chain

The standard agent workflow in Linear:
1. Incoming issue
2. Triage Intelligence suggests properties (assignee, labels, projects)
3. Auto-apply routes to agent via triage rules
4. Agent works (code, PR)
5. Human reviews

**The gap:** No governance agent sits between triage and coding. Nobody validates:
- Issue quality gates (sufficient context for delegation?)
- Lifecycle compliance (correct state? follows workflow conventions?)
- Behavioral constraints (what is this agent allowed to do?)
- Cross-issue pattern enforcement (are we following conventions at scale?)
- Convention verification (metadata matches team rules before agent touches it?)

### Pain Points

**API fragility** ([Cotera](https://cotera.co/articles/linear-api-automation-guide)):
- Custom triage bot: 120 eng hours to build, 40+ hours maintenance over 6 months — exceeded 65 hours saved
- API changes broke bot: field moved from nested to flat, null pointer errors at 2 AM
- New issue state added, bot didn't recognize it, silently failed for 2 days
- Lesson: "Build scripts, not services" — pull-based stays low-maintenance; event-driven creates ongoing commitments

**Automation limitations** ([Cotera automation guide](https://cotera.co/articles/linear-automation-guide)):
- No cross-issue analysis or pattern detection
- No time-based triggers ("if in Triage > 2 days, notify")
- No "if > 3 bugs in 48h against this project, alert"
- Single-trigger, single-action only

**Convention enforcement is soft.** Agent Guidance is markdown that agents "automatically receive" but don't enforce. No runtime validation or feedback loop.

**Notification fatigue.** Cursor's team identified frequency as a challenge — balance visibility vs flooding.

**Claude Code + Linear** is an open feature request ([GitHub issue #12925](https://github.com/anthropics/claude-code/issues/12925), 77 thumbs-up, still open March 2026).

### The Governance Gap Is Documented

Multiple independent sources identify this:
- "Without enforcement, schemas are conventions, not guarantees" ([GitHub blog](https://github.blog/ai-and-ml/generative-ai/multi-agent-workflows-often-fail-heres-how-to-engineer-ones-that-dont/))
- Only ~25% of organizations have a fully implemented AI governance program ([Palo Alto Networks](https://www.paloaltonetworks.com/cyberpedia/what-is-agentic-ai-governance))
- "Governance can no longer be layered on after the fact — it must be part of the decision-making process itself" ([Sekuire](https://sekuire.ai/blog/the-missing-control-layer-for-ai-agents))

## Sources

- [Linear - How Cursor Integrated](https://linear.app/now/how-cursor-integrated-with-linear-for-agents)
- [GitHub Copilot Linear Integration](https://docs.github.com/en/copilot/how-tos/use-copilot-agents/coding-agent/integrate-coding-agent-with-linear)
- [OpenAI Codex Linear Integration](https://developers.openai.com/codex/integrations/linear)
- [Linear Devin Integration](https://linear.app/integrations/devin)
- [Factory AI Product](https://factory.ai/product/ai-project-manager)
- [Sentry Linear Agent](https://docs.sentry.io/organization/integrations/issue-tracking/sentry-linear-agent/)
- [Warp Oz Linear Integration](https://docs.warp.dev/agent-platform/cloud-agents/integrations/linear)
- [ChatPRD Linear Integration](https://linear.app/integrations/chatprd)
- [Linear Docs - MCP](https://linear.app/docs/mcp)
- [Linear - How We Built Triage Intelligence](https://linear.app/now/how-we-built-triage-intelligence)
- [Linear Changelog - Auto-apply Triage](https://linear.app/changelog/2025-09-19-auto-apply-triage-suggestions)
- [Claude Code Linear Issue #12925](https://github.com/anthropics/claude-code/issues/12925)
- [jerhadf/linear-mcp-server](https://github.com/jerhadf/linear-mcp-server)
- [tacticlaunch/mcp-linear](https://github.com/tacticlaunch/mcp-linear)
- [Cotera - Linear API Automation Guide](https://cotera.co/articles/linear-api-automation-guide)
- [Cotera - Linear Automation Guide](https://cotera.co/articles/linear-automation-guide)
- [Reflag - Building Linear Agent](https://reflag.com/blog/building-the-bucket-linear-agent)
- [GitHub Blog - Multi-agent Workflows](https://github.blog/ai-and-ml/generative-ai/multi-agent-workflows-often-fail-heres-how-to-engineer-ones-that-dont/)
- [Palo Alto Networks - Agentic AI Governance](https://www.paloaltonetworks.com/cyberpedia/what-is-agentic-ai-governance)
- [Sekuire - Missing Control Layer](https://sekuire.ai/blog/the-missing-control-layer-for-ai-agents)
- [Linear Agent Interaction SDK Approach](https://linear.app/now/our-approach-to-building-the-agent-interaction-sdk)

## Implications

1. **Every existing agent is a coding agent.** Sherpa as a governance-layer agent is genuinely novel in this ecosystem.
2. **Agent Guidance is weak enforcement.** Sherpa turns conventions into enforced constraints, not suggestions.
3. **Linear's architecture invites this.** Delegation model, sessions, activity types designed for orchestration.
4. **Governance agent could intercept before coding agents.** Validate issue readiness, emit `elicitation` for missing context, surface violations via `thought` activities, maintain governance checklists via `agent plans`.
5. **`promptContext` is the injection point.** Enrich with behavioral constraints before routing to downstream coding agents.
6. **AGENTS.md + Linear Agent Guidance = convention portability.** Bidirectional sync between filesystem governance and Linear workspace config.
7. **"Build scripts, not services" warning is important.** Sherpa's VPS-based agent model aligns — pull-based governance checks, not always-on event processing.

## Open Questions

1. Can a Linear agent delegate to another Linear agent? (agent→agent handoff)
2. How does Linear handle conflicting guidance from workspace vs team levels?
3. Agent Plans are tech preview — will partial updates be supported?
4. Rate limits for agent activity creation?
5. Customer pull for governance agents, or is Sherpa creating a new category?
6. `agentSessionCreateOnIssue` — can governance agent proactively scan and flag without delegation?
7. Pricing model for high-volume governance agents processing every issue?
