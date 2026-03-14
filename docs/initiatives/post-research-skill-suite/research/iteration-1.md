# Iteration 1 — 2026-03-13

## Research Vectors

### Vector 1: Anthropic's Internal Product Process
**Question:** How does Anthropic's internal product team operate? What skills do they use?
**Full report:** [iteration-1/vector-1-anthropic-internal-process.md](iteration-1/vector-1-anthropic-internal-process.md)

**Key discoveries:**
- Anthropic uses "docs to demos" — prototype first, skip PRDs, ship internally to all employees ("antfooding"), learn from real usage ([claude.com/blog](https://claude.com/blog/how-anthropic-teams-use-claude-code))
- Internal skills include `/feature dev`, `/code review`, `/security review`, `/PR commit` — simpler and more action-oriented than our research-heavy pipeline
- Power users run 3 simultaneous Claude instances and maintain "diary entries" documenting approaches and failures
- 70-90% of code at Anthropic is AI-generated; 70-80% of technical employees use Claude Code daily

**Implications:**
- Their "docs to demos" approach validates rapid prototyping, but they still use rigorous specs for safety-critical work — the lesson is knowing WHEN to spec vs. prototype
- Our research-first pipeline is more rigorous by design; we should ensure post-research skills don't add ceremony that could be replaced by prototyping

### Vector 2: Advanced Teams Using AI Skills
**Question:** How have the most advanced product teams integrated AI agents into their workflows?
**Full report:** [iteration-1/vector-2-advanced-teams-ai-skills.md](iteration-1/vector-2-advanced-teams-ai-skills.md)

**Key discoveries:**
- CompanyOS runs an entire company on ~2,000 lines of markdown across 12 skills connecting to 8 external systems — no application code ([adventuresinclaude.ai](https://adventuresinclaude.ai/posts/2026-02-21-running-a-company-on-markdown-files/))
- Obra/Superpowers defines 15+ skills in a seven-stage methodology (brainstorm → worktree → plan → execute → TDD → review → branch completion)
- 46 PM-specific skills exist in deanpeters/Product-Manager-Skills covering JTBD, discovery, roadmap, pricing, metrics
- The skills ecosystem has 400,000+ indexed skills but quality varies enormously; battle-tested skills number in the dozens

**Implications:**
- Our skills are significantly more sophisticated process definitions than the ecosystem norm
- The 46 PM skills collection is worth mining for ideas, especially JTBD and discovery frameworks
- CompanyOS pattern validates that skills-as-operations is a real, viable approach

### Vector 3: AI-Enabled Product Activities
**Question:** What product development activities are uniquely enabled or transformed by AI?
**Full report:** [iteration-1/vector-3-ai-enabled-product-activities.md](iteration-1/vector-3-ai-enabled-product-activities.md)

**Key discoveries:**
- POPPER (Stanford, ICML 2025) proves agentic hypothesis falsification works — matched human scientists' accuracy at 10x speed ([arXiv:2502.09858](https://arxiv.org/abs/2502.09858))
- Gary Klein himself explored AI pre-mortems: good at generating risks, bad at team dynamics. Ideal is hybrid. ([Psychology Today](https://www.psychologytoday.com/us/blog/seeing-what-others-dont/202504/can-ai-do-pre-mortems-for-us))
- Agent Decision Records (AgDR) is an emerging open standard for documenting agent decisions with structured metadata ([github.com/me2resh/agent-decision-record](https://github.com/me2resh/agent-decision-record))
- Cross-initiative retrospective analysis is the unexplored frontier — reading across activity logs and git history to surface systemic patterns

**Implications:**
- Three new skills have strong enough theoretical and practical grounding to add: `/premortem`, `/stress-test`, `/retro`
- Decision journaling should be built INTO the initiative lifecycle rather than a standalone skill
- Opportunity cost analysis strengthens `/memo` rather than being its own skill

## Synthesis

### The Pipeline Gap Is Real — And Bigger Than We Thought

We started this session designing skills for the gap between `/rr` (discover) and `/plan-tasks` (dispatch). The research reveals this gap actually contains three distinct activity types:

1. **Decision-making activities** — choosing direction, scoping, committing (`/stake`, `/shape`)
2. **Validation activities** — proving feasibility, attacking assumptions (`/spike`, `/stress-test`, `/premortem`)
3. **Design activities** — architecture, UI, technical approach (`/design`)
4. **Strategic activities** — cross-initiative synthesis, landscape classification (`/memo`, `/radar`)

### Anthropic's "Docs to Demos" Is Not Our Model — And That's Correct

Anthropic's prototype-first approach works because they're building developer tools for themselves. The feedback loop is tight: build it, use it, feel the pain, fix it. Our pipeline serves a different purpose — research-driven initiative management where the cost of building the wrong thing is measured in sessions, not just developer time. The ceremony we're adding isn't overhead; it's insurance.

That said, Anthropic's approach validates `/spike` strongly. When the question is "would this work?", the fastest answer is often a throwaway prototype, not more research.

### Three New Skills Earned Their Place

The research surfaced three activities with strong enough grounding to add to the suite:

**`/premortem`** — Gary Klein's method + the Devil's Advocate Architecture. Imagine the initiative failed. Work backward. Why? Multi-agent: one agent argues for each failure mode, a synthesis agent consolidates. Pairs with `/stake` — run it before staking to pressure-test the thesis.

**`/stress-test`** — POPPER-inspired. Different from pre-mortem: pre-mortem asks "how could this fail?", stress-test asks "is this assumption actually true?" Enumerate the proposal's assumptions, design falsification tests for each, execute what's testable (code spikes, data queries, competitive checks), flag what requires human validation.

**`/retro`** — Cross-initiative retrospective. Not sprint-level, portfolio-level. Reads activity logs, git history, session counts, and outcomes across completed initiatives. Surfaces patterns: "Initiatives with >3 dependencies take 2x estimated sessions." Only useful once you have enough initiative history — gate it at 5+ completed initiatives.

### Decision Journaling Is Infrastructure, Not a Skill

The AgDR standard and OutcomeOps pattern suggest that decision recording should happen automatically whenever `/stake`, `/shape`, or `/memo` runs — not as a separate invocation. Each of those skills already captures a decision. The improvement is: (a) standardize the decision record format, (b) make the history queryable, (c) surface relevant past decisions when similar situations arise. This is a convention enhancement, not a skill.

### What We're NOT Adding (And Why)

- **Competitive landscape monitoring** — Real and mature, but it's a continuous background process, not a point-in-time skill. Better served by an MCP server or scheduled job.
- **User story generation from research** — PersonaCite's approach is interesting but the synthetic persona fallacy is real. Our proposals already contain concrete proposed changes; generating synthetic user stories on top adds a layer of fiction we don't need.
- **Portfolio optimization** — Mathematically interesting but premature. We don't have enough initiative history to train an optimizer. When we do, it should enhance `/memo`, not be standalone.

## All Sources

### Anthropic Internal Process
- [How Anthropic Teams Use Claude Code](https://claude.com/blog/how-anthropic-teams-use-claude-code)
- [How AI Is Transforming Work at Anthropic](https://www.anthropic.com/research/how-ai-is-transforming-work-at-anthropic)
- [Podcast: How to Use Claude Code Like the People Who Built It](https://every.to/podcast/transcript-how-to-use-claude-code-like-the-people-who-built-it)
- [Anthropic 2026 Agentic Coding Trends](https://resources.anthropic.com/hubfs/2026%20Agentic%20Coding%20Trends%20Report.pdf)

### Skills Ecosystem
- [Anthropic Skills Repository](https://github.com/anthropics/skills/)
- [Agent Skills Standard](https://agentskills.io/specification)
- [obra/superpowers](https://github.com/obra/superpowers)
- [deanpeters/Product-Manager-Skills](https://github.com/deanpeters/Product-Manager-Skills)
- [VoltAgent/awesome-agent-skills](https://github.com/VoltAgent/awesome-agent-skills)
- [CompanyOS: Running a Company on Markdown](https://adventuresinclaude.ai/posts/2026-02-21-running-a-company-on-markdown-files/)

### Novel AI Activities
- [POPPER: Agentic Hypothesis Falsification](https://arxiv.org/abs/2502.09858)
- [Gary Klein on AI Pre-Mortems](https://www.psychologytoday.com/us/blog/seeing-what-others-dont/202504/can-ai-do-pre-mortems-for-us)
- [Devil's Advocate Architecture](https://medium.com/@jsmith0475/the-devils-advocate-architecture-how-multi-agent-ai-systems-mirror-human-decision-making-9c9e6beb09da)
- [Agent Decision Records](https://github.com/me2resh/agent-decision-record)
- [OutcomeOps: Self-Documenting Architecture](https://www.briancarpio.com/2025/10/31/outcomeops-self-documenting-architecture-when-code-becomes-queryable/)
- [PersonaCite: Grounded AI Personas](https://arxiv.org/abs/2601.22288)
- [Multi-Agent Debate for Requirements](https://arxiv.org/html/2507.05981v1)

### Frameworks
- [Agentsway: Agent-Based SE Teams](https://arxiv.org/abs/2510.23664)
- [AI Budget Planning Optimizer](https://towardsdatascience.com/how-to-build-an-ai-budget-planning-optimizer-for-your-2026-capex-review-langgraph-fastapi-and-n8n/)
- [Anthropic: Building Effective Agents](https://www.anthropic.com/engineering/building-effective-agents)
- [Anthropic: Multi-Agent Research System](https://www.anthropic.com/engineering/multi-agent-research-system)

## Proposals Generated

- Updated skill suite from 6 to 9: added `/premortem`, `/stress-test`, `/retro`
- Decision journaling folded into existing skills as convention enhancement
- Proposal pending for full suite — to be written after design review completes

## Open Questions for Next Iteration

1. **Should `/premortem` and `/stress-test` be separate skills or one skill with two modes?** Pre-mortem is imaginative (what could go wrong?), stress-test is empirical (is this assumption true?). Different enough to warrant separation?
2. **What's the minimum initiative history before `/retro` is useful?** Need to define the gate — likely 5+ completed initiatives with activity logs.
3. **How should decision records be structured?** AgDR is a starting point but needs adaptation for the initiative system. Where do they live? How are they queried?
4. **Can we apply POPPER's falsification framework to product assumptions without experimental data?** The original framework runs experiments. Our version would need to work with available evidence (research, code spikes, competitive data).
5. **Should any of these skills be publishable to the Agent Skills marketplace?** They're process-agnostic enough to be useful elsewhere, but depend on the initiative directory convention.
