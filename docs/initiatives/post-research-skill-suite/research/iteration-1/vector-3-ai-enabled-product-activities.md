# Vector 3: AI-Enabled Product Development Activities

**Question:** What product development activities are uniquely enabled or transformed by AI agents — things that weren't feasible before?
**Agent dispatched:** 2026-03-13

## Findings

### 1. Assumption Stress-Testing (Red Team for Product Ideas)

**Maturity: Emerging concept, strong theoretical foundation, few purpose-built tools**

- **POPPER (Stanford, Feb 2025)**: An agentic framework for automated hypothesis falsification. LLM agents design falsification experiments, execute them via a ReAct agent, obtain p-values, and apply sequential testing with strict Type-I error control. Matched human scientists' accuracy while being 10x faster. Published at ICML 2025.

- **Role-Prompted Stress Testing**: AI personas stress-test product features before user testing. Critical caveat: role prompting must use validated persona data, otherwise "assumptions keep feeding assumptions and AI will amplify them."

- **Riskiest Assumption Tests (RAT)**: The existing product methodology of isolating and testing your riskiest assumption first. McKinsey data: 70% of product features fail to deliver expected business outcomes, typically because they were built on untested assumptions.

**What's fundamentally different**: A human team might brainstorm 5-10 assumptions to test. An agent can systematically enumerate dozens of falsifiable implications from a single proposal, design experiments for each, and execute them against available data — all in a single session.

### 2. Competitive Landscape Monitoring

**Maturity: Commercial products exist; this is real and deployed**

- **Klue** (acquired Ignition, Sep 2025): Real-time competitive deal intelligence via their "Compete Agent." Auto-updating battlecards.
- **Crayon**: 85-95% reduction in manual research time and 30-40% improvement in competitive win rates.
- **FounderNest**: Continuously scans news, websites, product updates, funding events, patents, job postings, regulatory filings.
- **Case study**: A SaaS company's CI system detected a competitor hiring solutions engineers with healthcare vertical experience, flagged the pattern, and product marketing discovered the competitor was building healthcare-specific compliance features — allowing the company to accelerate their healthcare roadmap by 2 quarters.

**What's fundamentally different**: Traditional CI was periodic (quarterly reports). AI-driven CI is continuous and contextual — it can surface a competitor's job posting pattern as a strategic signal.

### 3. User Story Generation from Research

**Maturity: Active research area with emerging tools**

- **PersonaCite (arXiv, Jan 2026)**: Creates interviewable AI personas grounded in actual voice-of-customer data. Unlike typical AI personas that hallucinate, PersonaCite retrieves actual VoC artifacts during each conversation turn, constrains responses to retrieved evidence, explicitly abstains when evidence is missing, and provides response-level source attribution.

- **Synthetic Users (syntheticusers.com)**: Commercial platform for generating qualitative and quantitative insights using AI participants.

- **Key limitation** (ACM Interactions): Synthetic users struggle with unpredictable human behavior and reflect training data biases. Best practice: use synthetic personas to decide what to test next, not what to ship.

**What's fundamentally different**: Combinatorial exploration of personas x scenarios x edge cases that a human team would never exhaustively enumerate. PersonaCite's grounding approach (constrain to evidence, abstain when evidence is missing) is the key innovation.

### 4. Dependency Graph Analysis

**Maturity: Emerging for code-level; early for initiative-level**

- **Code-level**: Sourcegraph scans millions of lines and generates dependency graphs in minutes.
- **Project-level**: Siemens reported cutting dependency conflicts by 37% using AI; Accenture reduced project planning time from 2 weeks to 2 days.
- **Portfolio-level**: Recent paper on AI-driven project portfolio optimization uses predictive modeling (XGBoost) + Pyomo-Gurobi optimization for inter-project conflict detection.

**What's fundamentally different**: AI can discover *latent* dependencies — two initiatives that don't explicitly depend on each other but compete for the same architectural surface area. Nobody has published a tool that does this for product initiative portfolios specifically, but the concept is sound.

### 5. Post-Mortem / Retrospective Automation

**Maturity: Commercial tools for sprint retros; deeper analytical retros emerging**

- **Sprint-level**: Jeda.ai, GoRetro offer AI-driven retrospective tools. Companies report 25% improvement in estimation accuracy.
- **Cross-initiative analysis (unexplored frontier)**: An agent that reads across multiple initiative activity logs, commit histories, and outcomes to identify systemic patterns: "Initiatives that touch the auth layer consistently take 2x their estimated sessions" or "Proposals with more than 3 dependencies have a 40% abandon rate."

**What's fundamentally different**: An AI agent can analyze every initiative your team has ever run, find statistical patterns in what succeeded vs. failed, and surface structural insights. The data is already in activity logs and git history.

### 6. Decision Journaling

**Maturity: Strong concept, early tooling, one standout standard**

- **Agent Decision Records (AgDR)**: An open standard extending ADRs for AI-assisted development. Requires agents to document what was decided, alternatives considered, tradeoffs accepted, and what triggered the decision.

- **OutcomeOps**: Queryable knowledge base where ADRs are weighted 1.5x higher than other documents because "architectural decisions explain *why* systems exist." Ask the system in natural language about its own decision history.

- **Behavioral Science & Policy (2024)**: Managers using decision journals improved forecasting accuracy by 19%.

**What's fundamentally different**: AI can (a) automatically generate a decision record every time a significant choice is made, (b) make the entire decision history semantically searchable, and (c) surface relevant past decisions when similar situations arise.

### 7. Opportunity Cost Analysis

**Maturity: Strong in financial portfolio management; early for product initiative portfolios**

- **AI Budget Planning Optimizer**: Linear programming agent that turns project requests into an optimized CAPEX portfolio respecting constraints and management guidelines.
- **McKinsey**: Generative AI supercharges portfolio performance through scenario planning that simulates future states and assesses how strategies perform under uncertainty.

**What's fundamentally different**: A human PM can compare 3-4 portfolio scenarios. An AI agent can evaluate hundreds of combinations against constraints (session budget, dependency ordering, risk tolerance) and find the Pareto frontier. For a system like Sherpa: "Given 20 sessions of budget and 8 candidate initiatives, here are the 3 optimal portfolios ranked by expected value."

### 8. Pre-Mortem (Gary Klein's Method)

**Maturity: Strong theoretical validation, direct AI application explored by Klein himself**

- **Gary Klein's assessment (Psychology Today, Apr 2025)**: AI can effectively generate potential risks to a plan, but LLMs cannot notice team dynamics, and there is a likely loss of team cohesion when LLMs replace in-person pre-mortems.

- **Devil's Advocate Architecture**: Multi-agent architecture where a Devil's Advocate agent systematically identifies risks, edge cases, and failure modes, challenging assumptions while a Reviewer Agent synthesizes.

- **Multi-Agent Debate for Requirements (Jul 2025)**: Heterogeneous agent debate yields 4-7% absolute improvements over homogeneous approaches in requirements engineering.

- **AI-Mediated Devil's Advocate (Feb 2025)**: System where an AI devil's advocate reframes and presents minority opinions as its own to combat groupthink.

**What's fundamentally different**: A human pre-mortem relies on what the team can imagine. An AI pre-mortem can (a) enumerate failure modes by analogy to similar past projects in its training data, (b) run the analysis from multiple adversarial perspectives simultaneously, and (c) cross-reference the initiative's assumptions against the dependency graph. Klein's assessment: AI good at generating risks, bad at surfacing team-dynamic risks. Ideal is hybrid.

## Maturity Summary

| Activity | Published Examples | Purpose-Built Tools | Fundamentally Different? |
|----------|-------------------|---------------------|------------------------|
| Competitive landscape monitoring | Many | Klue, Crayon, FounderNest | Yes — continuous vs. periodic |
| Post-mortem / retro automation | Some (sprint-level) | GoRetro, Jeda.ai | Partially — cross-initiative novel |
| User story generation | Some | Synthetic Users, PersonaCite | Yes — combinatorial + grounded |
| Decision journaling | Emerging | AgDR standard, OutcomeOps | Yes — auto-generated, queryable |
| Pre-mortem | Conceptual + Klein | None purpose-built | Yes — multi-perspective adversarial |
| Opportunity cost analysis | Financial domain | Planisware, cplace | Yes — Pareto-optimal search |
| Assumption stress-testing | POPPER (scientific) | None for product | Yes — systematic falsification |
| Dependency graph analysis | Code-level | Sourcegraph, Taskade | Partially — latent discovery novel |

## Sources

- [POPPER: arXiv:2502.09858](https://arxiv.org/abs/2502.09858)
- [POPPER GitHub](https://github.com/snap-stanford/POPPER)
- [ROSE Digital: Stress Test Features with AI](https://medium.com/rose-digital/stress-test-your-product-features-with-ai-313fb253d266)
- [Red Badger: Validating Product Ideas](https://content.red-badger.com/resources/validating-product-ideas)
- [Klue](https://klue.com)
- [Crayon](https://www.crayon.co/)
- [FounderNest](https://www.foundernest.com/competitor-intelligence)
- [CI Alliance: AI Transforming CI](https://www.competitiveintelligencealliance.io/how-ai-and-automation-are-transforming-competitive-intelligence/)
- [Arise GTM 2026 CI Playbook](https://arisegtm.com/blog/competitive-intelligence-automation-2026-playbook)
- [PersonaCite: arXiv:2601.22288](https://arxiv.org/abs/2601.22288)
- [Synthetic Users](https://www.syntheticusers.com/)
- [ACM: Synthetic Persona Fallacy](https://interactions.acm.org/blog/view/the-synthetic-persona-fallacy-how-ai-generated-research-undermines-ux-research)
- [Devox: AI Dependency Mapping](https://devoxsoftware.com/blog/using-ai-for-dependency-mapping-in-large-codebases-a-practical-approach/)
- [Taskade: Cross-Project Dependency Analysis](https://www.taskade.com/agents/project-management/cross-project-dependency-analysis)
- [ScienceDirect: AI Portfolio Optimization](https://www.sciencedirect.com/science/article/pii/S0957417425032087)
- [GoRetro: AI Sprint Retrospectives](https://www.goretro.ai/post/ai-data-driven-future-of-sprint-retrospectives)
- [Agent Decision Records](https://github.com/me2resh/agent-decision-record)
- [OutcomeOps / Brian Carpio](https://www.briancarpio.com/2025/10/31/outcomeops-self-documenting-architecture-when-code-becomes-queryable/)
- [Psychology Today: Can AI Do Pre-Mortems](https://www.psychologytoday.com/us/blog/seeing-what-others-dont/202504/can-ai-do-pre-mortems-for-us)
- [Devil's Advocate Architecture](https://medium.com/@jsmith0475/the-devils-advocate-architecture-how-multi-agent-ai-systems-mirror-human-decision-making-9c9e6beb09da)
- [Multi-Agent Debate for Requirements: arXiv](https://arxiv.org/html/2507.05981v1)
- [AI Devil's Advocate: arXiv:2502.06251](https://arxiv.org/html/2502.06251v1)
- [TDS: AI Budget Planning Optimizer](https://towardsdatascience.com/how-to-build-an-ai-budget-planning-optimizer-for-your-2026-capex-review-langgraph-fastapi-and-n8n/)
- [Planisware: AI Portfolio Management](https://planisware.com/resources/selecting-tool/what-are-key-ai-powered-strategic-portfolio-management-capabilities)
- [McKinsey: Product Portfolio with GenAI](https://www.mckinsey.com/capabilities/operations/our-insights/supercharging-product-portfolio-performance-with-generative-ai)
- [Targeted PreMortem for Trustworthy AI](https://www.researchgate.net/publication/389316278_Targeted_PreMortem_TPM_for_Trustworthy_AI)

## Raw Links

- https://arxiv.org/abs/2502.09858
- https://github.com/snap-stanford/POPPER
- https://medium.com/rose-digital/stress-test-your-product-features-with-ai-313fb253d266
- https://content.red-badger.com/resources/validating-product-ideas
- https://klue.com
- https://www.crayon.co/
- https://www.foundernest.com/competitor-intelligence
- https://www.competitiveintelligencealliance.io/how-ai-and-automation-are-transforming-competitive-intelligence/
- https://arisegtm.com/blog/competitive-intelligence-automation-2026-playbook
- https://arxiv.org/abs/2601.22288
- https://www.syntheticusers.com/
- https://interactions.acm.org/blog/view/the-synthetic-persona-fallacy-how-ai-generated-research-undermines-ux-research
- https://storiesonboard.com/blog/ai-agents-product-management-2026
- https://miro.com/ai/product-development/ai-product-discovery/
- https://devoxsoftware.com/blog/using-ai-for-dependency-mapping-in-large-codebases-a-practical-approach/
- https://www.taskade.com/agents/project-management/cross-project-dependency-analysis
- https://www.testingtools.ai/blog/how-ai-simplifies-dependency-visualization/
- https://www.sciencedirect.com/science/article/pii/S0957417425032087
- https://www.goretro.ai/post/ai-data-driven-future-of-sprint-retrospectives
- https://ones.com/blog/ai-driven-sprint-retrospective-solution-guide/
- https://github.com/me2resh/agent-decision-record
- https://piethein.medium.com/building-an-architecture-decision-record-writer-agent-a74f8f739271
- https://www.briancarpio.com/2025/10/31/outcomeops-self-documenting-architecture-when-code-becomes-queryable/
- https://blog.mylifenote.ai/decision-journal-template-track-outcomes-improve-choices/
- https://www.psychologytoday.com/us/blog/seeing-what-others-dont/202504/can-ai-do-pre-mortems-for-us
- https://www.linkedin.com/posts/gary-klein-90b0a915_double-barreled-pre-mortems-activity-7349881631433711617-KC1L
- https://www.researchgate.net/publication/389316278_Targeted_PreMortem_TPM_for_Trustworthy_AI
- https://medium.com/@jsmith0475/the-devils-advocate-architecture-how-multi-agent-ai-systems-mirror-human-decision-making-9c9e6beb09da
- https://arxiv.org/html/2507.05981v1
- https://arxiv.org/html/2502.06251v1
- https://towardsdatascience.com/how-to-build-an-ai-budget-planning-optimizer-for-your-2026-capex-review-langgraph-fastapi-and-n8n/
- https://planisware.com/resources/selecting-tool/what-are-key-ai-powered-strategic-portfolio-management-capabilities
- https://www.cplace.com/en/blog/the-future-of-ai-in-project-portfolio-management/
- https://www.mckinsey.com/capabilities/operations/our-insights/supercharging-product-portfolio-performance-with-generative-ai

## Implications

The three most promising additions to Sherpa's skill suite:

1. **Pre-mortem (`/premortem`)** — Multi-agent adversarial analysis of proposals before committing. Klein's method + Devil's Advocate Architecture. Pairs with `/stake` — run it before staking.
2. **Stress-test (`/stress-test`)** — POPPER-inspired systematic falsification of proposal assumptions. Different from pre-mortem: pre-mortem asks "how could this fail?", stress-test asks "is this assumption actually true?"
3. **Retro (`/retro`)** — Cross-initiative retrospective that reads activity logs and git history to surface systemic patterns. Not sprint-level, portfolio-level.

Decision journaling could be automated into the initiative lifecycle rather than a standalone skill — every `/stake` and `/shape` automatically generates a decision record.

Opportunity cost analysis could enhance `/memo` with quantitative portfolio optimization.

## Open Questions

- Should `/premortem` and `/stress-test` be separate skills or one skill with two modes?
- Can we apply the POPPER falsification framework to product assumptions without experimental data?
- How do we handle the "synthetic persona fallacy" — should stress-testing use role-prompted personas or avoid them?
- What's the minimum initiative history needed before `/retro` produces meaningful cross-initiative patterns?
