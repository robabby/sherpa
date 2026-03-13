# Iteration 1 — 2026-03-12

## Research Vectors

### Vector 1: The DIY Workspace Revolution
**Question:** What are teams actually building when they replace Jira/Linear/Notion with custom AI-native tools?
**Full report:** [iteration-1/build-your-own-pm-movement.md](iteration-1/build-your-own-pm-movement.md)

**Key discoveries:**
- 35% of enterprises have already replaced at least one SaaS tool with custom-built software, PM is 5th most-replaced category at 23% ([Retool 2026 survey](https://retool.com/reports/state-of-ai-2026))
- 50+ open-source agent orchestration tools emerged: Vibe Kanban (23K stars), Taskmaster AI (15.5K stars in 9 weeks), Claude Squad (5.8K stars) ([awesome-agent-orchestrators](https://github.com/nicobailon/awesome-agent-orchestrators))
- AGENTS.md adopted by 40K+ repos — filesystem governance is the convergent pattern
- Developer role shifting from implementer to orchestrator (Addy Osmani O'Reilly Radar)
- Dominant pattern: kanban boards x terminal multiplexers x git worktree managers

**Implications:**
- Sherpa's filesystem governance pattern is independently validated by market convergence
- The competitive threat is combinatorial assembly of narrow tools, not any single product
- Studio needs agent fleet visualization to compete with terminal-based orchestrators

### Vector 2: Agentic Interaction Paradigms
**Question:** What are the fundamentally new UX patterns for managing 10+ agents at the interface level?
**Full reports:** [iteration-1/vector-2a-multi-agent-fleet-interfaces.md](iteration-1/vector-2a-multi-agent-fleet-interfaces.md) through [iteration-1/vector-2f-progressive-disclosure-observability.md](iteration-1/vector-2f-progressive-disclosure-observability.md)

**Key discoveries:**
- The "fleet minimap" (persistent, always-visible agent overview) is the missing primitive — no product provides it ([survey of GitHub Mission Control, VS Code, Devin 2.0, OpenAI Codex, Google Antigravity, Claude Code Agent Teams](iteration-1/vector-2a-multi-agent-fleet-interfaces.md))
- Three agent-to-UI protocols emerging: AG-UI (17 event types), A2UI (Google declarative JSON), MCP Apps ([iteration-1/vector-2c-agent-status-protocols.md](iteration-1/vector-2c-agent-status-protocols.md))
- Delegation-not-assignment is the governance model — Linear's design separating delegation (agents) from assignment (humans) ([iteration-1/vector-2d-delegation-dispatch-steering.md](iteration-1/vector-2d-delegation-dispatch-steering.md))
- Empirical HCI research confirms agents are tools with territorial ownership, not team members ([arXiv:2509.11826](https://arxiv.org/abs/2509.11826))
- RTS gaming UX (minimap, hotkeys, raid frames) informs agent fleet management ([iteration-1/vector-2b-rts-gaming-metaphors.md](iteration-1/vector-2b-rts-gaming-metaphors.md))
- Five-level progressive disclosure model: dot → card → summary → activity → trace ([iteration-1/vector-2f-progressive-disclosure-observability.md](iteration-1/vector-2f-progressive-disclosure-observability.md))

**Implications:**
- Studio should embed a compact fleet status indicator (minimap) in sidebar/header
- Four agent states suffice: working / waiting / completed / failed
- Three delegation paths: initiative-based / chat / task-board

### Vector 3: The Platform Play
**Question:** If every team will build their own agentic workspace, what's the framework layer?
**Full report:** [iteration-1/vector-3-platform-landscape.md](iteration-1/vector-3-platform-landscape.md)

**Key discoveries:**
- Sherpa occupies an empty quadrant: no framework combines Payload CMS model (config-as-code, framework-inside-your-app, white-label UI) with agent governance
- The SaaSpocalypse erased ~$2T in SaaS market cap in Feb 2026 — validates framework model over product model
- Claude Code's plugin marketplace (9K+ plugins) validates three-channel distribution
- Mastra is closest competitor ($13M YC, 150K weekly downloads) but no governance layer — potential partnership angle
- The governance gap is the differentiator: EU AI Act (Aug 2026) and Colorado AI Act (Jun 2026) make governance non-optional
- Microsoft Agent 365 launches May 2026 at $15/user/month as enterprise control plane

**Implications:**
- Position @sherpa/studio as "Payload CMS for agentic workspaces" — the framework, not the product
- Convention sync (L4) remains vacant territory in the ecosystem
- Governance regulation creates tailwind for Sherpa's approach

### Vector 4: Skills and Conventions as Distribution
**Question:** How should skills be distributed, discovered, and composed?
**Full report:** [iteration-1/vector-4-skills-conventions-distribution.md](iteration-1/vector-4-skills-conventions-distribution.md)

**Key discoveries:**
- Agent Skills is now an open standard under AAIF with 351K+ skills across 10+ platforms ([agentskills.io](https://agentskills.io/specification))
- Claude Code has full marketplace architecture — `marketplace.json` + git/npm/pip sources
- Composition is THE unsolved problem — individual skills work, orchestrating them doesn't ([AgentSkillOS paper, arxiv 2603.02176](https://arxiv.org/html/2603.02176))
- Security alarming: 13.4% of public skills have critical issues, 341 malicious skills found ([Snyk](https://snyk.io/blog/toxicskills-malicious-ai-agent-skills-clawhub/))
- Three standards converging under AAIF: Agent Skills (SKILL.md), AGENTS.md, MCP
- MCP 2026 roadmap includes investigating "Skills primitive for composed capabilities"

**Implications:**
- Sherpa's pipeline composition (/rr → /integration-review → /plan-tasks) IS the differentiator — it's the DAG-based orchestration that research shows outperforms flat invocation
- Publish Sherpa governance skills as a Claude Code marketplace
- Sherpa's conventions (.claude/rules/) are a unique distributable: most skills teach what to do, conventions teach how to behave

### Vector 5: The PM Category Earthquake
**Question:** What's happening to project management tools in 2025-2026?
**Full report:** [iteration-1/vector-5-pm-category-earthquake.md](iteration-1/vector-5-pm-category-earthquake.md)

**Key discoveries:**
- Height.app raised $18.3M, built beautiful AI-native PM, shut down Sept 2025 — being AI-native as a product is insufficient when the primitives themselves become obsolete
- Per-seat pricing is dying: Gartner predicts 40% of SaaS spending shifts to usage/outcome-based by 2030
- Every incumbent bolting AI onto existing paradigms (sprints, boards, story points)
- IDEs and CLIs becoming the PM layer: GitHub Agent HQ, Cursor (50% Fortune 500), Google Antigravity
- "From Sprints to Swarms" documents 4x productivity gains, 30-100x forecasted
- Convention-over-configuration winning: AGENTS.md, MCP, AAIF under Linux Foundation

**Implications:**
- Products die (Height), conventions endure (AGENTS.md, MCP) — validates Sherpa's framework approach
- The interface is generated, not designed (Antigravity Artifacts, Notion agents building plans)
- Agents need governance, not dashboards

## Synthesis

Five independent research vectors converged on a remarkably consistent picture:

**1. The Governance Gap Is the Opportunity.** Every framework can execute agents. None provide initiative lifecycle, behavioral definitions, task dispatch with HITL, or convention-as-code distribution. With EU AI Act (Aug 2026) and Colorado AI Act (Jun 2026) making governance non-optional, this gap becomes a market. Sherpa sits in an empty quadrant: "embeddable governance framework for agentic workspaces."

**2. Products Die, Conventions Endure.** Height.app's shutdown is the cautionary tale. The SaaSpocalypse validated what Sherpa's architecture embodies: filesystem governance, behavioral conventions, and composable skills are durable. Per-seat SaaS products are fragile. The framework model (Payload CMS for agents) is the correct structural bet.

**3. Composition Is the Moat.** The skills ecosystem exploded to 351K+ skills in 3 months — but composition is unsolved. Individual skills work; orchestrating them doesn't. Sherpa's pipeline pattern (/rr → /integration-review → /plan-tasks) is exactly the DAG-based orchestration that research shows outperforms flat invocation. Formalizing this pipeline as a distributable, composable pattern is the highest-leverage thing Sherpa can do.

**4. The Fleet Minimap Is the Missing Primitive.** No product provides a persistent, always-visible overview of agent fleet activity. Every product uses full-page list views. The RTS gaming metaphor (minimap + hotkeys) is the right UX analogy. Studio should embed this before competitors do.

**5. The Three-Standard Convergence Creates Timing.** Agent Skills, AGENTS.md, and MCP are all under AAIF governance now. MCP's 2026 roadmap investigates "Skills primitive for composed capabilities." The window for Sherpa to establish its governance conventions as the standard complement to these protocols is open now but will narrow.

## All Sources

See individual vector reports for comprehensive URL libraries (300+ unique URLs total). Key sources by domain:

### Market Analysis
- Retool State of AI 2026 — enterprise SaaS replacement survey
- Gartner SaaS pricing disruption predictions
- Ben Thompson on per-seat pricing death
- P3 Group "From Sprints to Swarms"

### Products & Frameworks
- Vibe Kanban, Taskmaster AI, Claude Squad — leading agent orchestrators
- Mastra — closest competitor ($13M, 150K weekly downloads)
- Microsoft Agent 365 — enterprise control plane (May 2026)
- Google Antigravity — agent-first IDE/mission control
- Devin 2.0, GitHub Agent HQ, OpenAI Codex — multi-agent UX patterns

### Standards & Protocols
- Agent Skills Standard (agentskills.io) — 351K+ skills
- AGENTS.md — 60K+ repos
- MCP — 97M+ monthly SDK downloads
- AAIF (Linux Foundation) — governance body
- AG-UI, A2UI, MCP Apps — agent-to-UI protocols

### Research
- AgentSkillOS (arxiv 2603.02176) — skill composition via DAG orchestration
- arXiv:2509.11826 — empirical HCI study of human+AI document editing
- Snyk ToxicSkills — skill security study

## Proposals Generated

- `docs/initiatives/agentic-workspace/proposal.md` — Evergreen research initiative proposal

## Open Questions for Next Iteration

1. **What does the "Payload CMS for agents" look like concretely?** The positioning is validated — but what's the developer experience? How does `sherpa init` compare to `payload init`? What does a consumer's `sherpa.config.ts` contain? (Feeds sherpa-framework-extraction)

2. **How should Sherpa formalize skill composition?** Natural language references work with Claude. But what about cross-agent portability (Codex, Gemini CLI)? Should there be a pipeline manifest? How does this interact with MCP's planned Skills primitive? (New initiative candidate)

3. **What's the Sherpa Marketplace strategy?** Publish as one plugin or a marketplace with modular plugins? What's the curation model? How do we handle security (content hashing, signing, sandboxing)? (Feeds sherpa-framework-extraction)

4. **What are the concrete UX specs for the fleet minimap?** What data sources feed it? What interactions does it support? How does it integrate with Studio's existing layout? (Feeds studio-collaboration-platform)

5. **How does the regulatory landscape (EU AI Act, Colorado AI Act) create concrete requirements for Sherpa's governance layer?** What must the framework provide for customers to be compliant? (New research thread)
