# Iteration 3: Agent Workforce Composition — Evidence on Team Size, Specialization & Catalog Strategy

**Date:** 2026-03-11
**Vectors:** Multi-agent system scaling research, production deployment patterns, specialization vs generalization evidence, catalog size benchmarks, T-shaped agent design, behavioral engineering validation
**Key Finding:** Research converges on 15-25 heterogeneous roles as the practical sweet spot. Compact, focused definitions outperform comprehensive ones by 3x (SkillsBench). Ship ~20 behavioral agents with 2-3 companion skills each, not 30+ narrow specialists or 120 raw migrations.

---

## 1. Multi-Agent System Research: What Does the Science Say?

### Google/MIT Scaling Study (Dec 2025)

The most rigorous quantitative study on multi-agent scaling. [Towards a Science of Scaling Agent Systems](https://arxiv.org/html/2512.08296v1) | [Google Research Blog](https://research.google/blog/towards-a-science-of-scaling-agent-systems-when-and-why-agent-systems-work/) | [InfoQ coverage](https://www.infoq.com/news/2026/03/google-multi-agent/)

- **No universal optimal team size.** Effectiveness is entirely task-dependent.
- **Teams of 3-4 agents** show best efficiency before coordination overhead dominates.
- **Error amplification is real:** Independent agents amplify errors **17.2x**; centralized orchestration contains it to **4.4x**.
- **Critical threshold at ~45% baseline accuracy.** Tasks where a single agent already exceeds 45% accuracy see **negative returns** from adding agents (beta=-0.408, p<0.001).
- **Parallelizable tasks benefit enormously:** +80.9% on financial reasoning with centralized coordination.
- **Sequential tasks suffer enormously:** -70% degradation on planning tasks.
- **Coordination overhead by architecture:** Independent 58%, Centralized 285%, Decentralized 263%, Hybrid 515%.
- **Predictive model identifies optimal strategy for 87% of unseen task configurations.**
- **Success rate per 1,000 tokens:** Single-agent 67.7, Independent MAS 42.4, Decentralized 23.9, Centralized 21.5, Hybrid 13.6.

### Diversity Beats Scale (Feb 2026)

[Understanding Agent Scaling via Diversity](https://arxiv.org/html/2602.03794v1):

- **2 diverse agents can match or exceed 16 homogeneous agents** -- an 8x efficiency gain.
- **Homogeneous teams plateau at ~4 agents.** Heterogeneous teams sustain improvements up to ~8 agents.
- **Persona diversity alone adds +4.4% on average;** model diversity adds +2.5%.
- **Optimal team size: 4-8 heterogeneous agents** rather than 12-16 homogeneous ones.
- **Key design principle:** "Focus on increasing the diversity of correct reasoning paths" rather than adding more agents.
- **Domain-dependent:** Diversity helps most on reasoning tasks; more conservative investment needed for factual retrieval.

### Specialists vs. Generalists: Direct Comparison (Jan 2026)

[Specialists or Generalists? Multi-Agent and Single-Agent LLMs for Essay Grading](https://arxiv.org/html/2601.22386v1):

- **Three specialist agents + Chairman vs. one generalist.** Overall: specialists win by 2.88pp (57.1% vs 54.0%).
- **Specialists excel at boundary detection:** +26.6pp on detecting critical failures (Score 1 essays: 73.3% vs 46.7%).
- **Generalists excel at nuanced judgment:** Outperform on mid-range quality assessment (Score 4: 61.2% vs 57.3%).
- **Cost: 4x** (four LLM calls per item for multi-agent).
- **Conclusion:** "Neither specialized multi-agent architectures nor single-agent approaches universally dominate."

### Anthropic's Multi-Agent Research System (2025-2026)

[How We Built Our Multi-Agent Research System](https://www.anthropic.com/engineering/multi-agent-research-system):

- **Lead agent + 3-5 subagents** for complex queries. Architecture supports variable agent count.
- **Delegation tiers:** Simple (1 agent, 3-10 tool calls), Comparison (2-4 agents, 10-15 calls each), Complex (10+ agents with divided responsibilities).
- **Multi-agent Opus 4 outperformed single-agent Opus 4 by 90.2%** on internal research eval.
- **Token usage explains 80% of variance** in performance.
- **Key lesson:** Vague instructions caused agents to duplicate work. Clear, non-overlapping task boundaries are essential.

---

## 2. Production Multi-Agent Deployments

### Enterprise Adoption Numbers

- **57% of companies** already have AI agents running in production. [G2 Enterprise AI Agents Report](https://learn.g2.com/enterprise-ai-agents-report)
- **39% of executives** report deploying 10+ agents across their enterprise. [Google Cloud ROI of AI](https://cloud.google.com/transform/roi-of-ai-how-agents-help-business)
- **40% of enterprise apps** will feature task-specific AI agents by end of 2026, up from <5% in 2025. [Gartner](https://www.gartner.com/en/newsroom/press-releases/2025-08-26-gartner-predicts-40-percent-of-enterprise-apps-will-feature-task-specific-ai-agents-by-2026-up-from-less-than-5-percent-in-2025)
- **85% of executives** anticipate employees relying on agent recommendations for real-time decisions by 2026. [Google Cloud 2026 Report](https://blog.google/innovation-and-ai/infrastructure-and-cloud/google-cloud/ai-business-trends-report-2026/)

### Real-World Agent Catalog Sizes

| Platform | Agent Count | Categories | Granularity |
|----------|------------|------------|-------------|
| Google Cloud Agent Finder | 1,914 | 10 business functions, 10 industries | Third-party marketplace, variable quality |
| Salesforce Agentforce | 46 prebuilt use cases | 7 categories | Business-function aligned |
| Oracle AI Agent Marketplace | 50+ prebuilt | Multiple | Partner-built, validated |
| VoltAgent awesome-subagents | 127+ | 10 categories | Technical specialty + business function |
| wshobson/agents | 112 agents, 146 skills | 72 plugins | Hyper-specialized, single-purpose |
| Beam AI templates | 1,500+ integrations | Multiple | Pre-built automation templates |

**Pattern:** Open marketplaces list hundreds/thousands (variable quality). **Curated first-party catalogs cluster around 40-50** prebuilt use cases (Salesforce 46, Oracle 50+). This is the benchmark for Sherpa's curated catalog.

### Google Cloud Agent Finder: 1,914 Agents Across 10 Business Functions

[Agent Finder](https://cloud.withgoogle.com/agentfinder/): Customer Support, Data Analysis, Finance & Accounting, Human Resources, IT Operations, Legal & Compliance, Marketing, Procurement & Supply Chain, Product Development, Sales. Plus 10 industries: Construction, Energy, Financial Services, Healthcare, Manufacturing, Media, Retail, Telecom, Transportation, Travel.

### Salesforce Agentforce: 46 Use Cases Across 7 Categories

[Pre-Built Use Cases](https://www.salesforce.com/agentforce/pre-built-use-cases/): Sales (6), Revenue Management (3), Service (7), Field Service (11), IT Service (4), Marketing (8), Commerce (7).

### Gartner's Agent Evolution Timeline

[Gartner 2026](https://www.gartner.com/en/newsroom/press-releases/2025-08-26-gartner-predicts-40-percent-of-enterprise-apps-will-feature-task-specific-ai-agents-by-2026-up-from-less-than-5-percent-in-2025):

1. **2025:** AI assistants (human-dependent)
2. **2026:** Task-specific agents (act independently) **<-- We are here**
3. **2027:** Agents collaborating inside applications
4. **2028:** Agent networks across platforms
5. **2029:** 50%+ workers creating/governing agents on demand

---

## 3. The Specialization Question: Narrow vs. Broad

### SkillsBench: The Definitive Benchmark (Feb 2026)

[SkillsBench](https://arxiv.org/html/2602.12670v1) | [Official site](https://www.skillsbench.ai/) -- 86 tasks, 11 domains:

- **Average improvement from curated skills: +16.2pp.**
- **2-3 skills per task is optimal** (+18.6pp). 4+ skills yield only +5.9pp.
- **Compact skills dramatically outperform comprehensive:** Detailed +18.8pp, Compact +17.1pp, Standard +10.1pp, **Comprehensive -2.9pp** (negative!).
- **Small model + good skills > Large model without:** Haiku with skills (27.7%) beat Opus without skills (22.0%).
- **Models cannot self-generate effective skills:** -1.3pp vs baseline. Human curation is essential.
- **Domain variation is massive:** Healthcare +51.9pp, Manufacturing +41.9pp, Cybersecurity +23.2pp, Software Engineering +4.5pp.
- **16 of 84 tasks showed negative deltas** -- skills can hurt when misapplied.

**The "Frontend Security Auditor" vs "Security Auditor" question is answered:** The Security Auditor with 2-3 well-crafted skills loaded at runtime outperforms the hyper-specialist. Comprehensive definitions hurt performance (-2.9pp), and 2-3 focused skills are optimal (+18.6pp).

### O'Reilly: Soft Forks -- Specialization Without Training

[O'Reilly Radar](https://www.oreilly.com/radar/soft-forks-how-agent-skills-create-specialized-ai-without-training/):

- Skills "soft-fork agent behavior at runtime" -- no training/fine-tuning.
- Architecture: Foundation model (raw intelligence) + Agent harness (execution/permissions) + Skills (specialized expertise).
- **Optimal skill count: 2-3 per task; diminishing returns beyond four.**
- **"Models cannot reliably self-generate effective skills" -- human domain expertise is the bottleneck.**

### Zheng et al. (EMNLP 2024): Identity Prompting Doesn't Work

[When "A Helpful Assistant" Is Not Really Helpful](https://aclanthology.org/2024.findings-emnlp.888.pdf):

- Tested **162 distinct roles** across multiple LLMs and tasks.
- **Role-based identity assignments produce random, inconsistent effects.**
- No clear pattern for when personas help vs. hurt.
- **Validates Sherpa's behavioral engineering approach.** Behavioral constraints ("defaults to NEEDS WORK, requires evidence") outperform identity claims ("You are an expert security auditor").

### Anthropic's Context Engineering Guide

[Effective Context Engineering for AI Agents](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents):

- **Avoid "hardcoded complex, brittle logic"** -- creates fragility.
- **Avoid "vague, high-level guidance"** -- fails to give concrete signals.
- **Optimal: "specific enough to guide behavior effectively, yet flexible enough to provide strong heuristics."**
- Pursue the **"minimal set of information"** needed (minimal != short).
- **Start minimal, add based on failure modes.**

---

## 4. Team Topologies for Agents

### The Official Take

[Team Topologies: When AI Agents Dominate](https://teamtopologies.com/news-blogs-newsletters/2025/1/14/the-future-of-team-topologies-when-ai-agents-dominate) is speculative, not prescriptive. No concrete mapping. Key insight: Conway's Law changes for AI ("perfect communication without social limits"). Dunbar's Number doesn't apply.

### How It Actually Maps (Synthesis)

| Team Topology | Agent Equivalent | Example Roles |
|---------------|-----------------|---------------|
| Stream-aligned | Domain agents (own a value stream) | Backend Dev, Frontend Dev, Full-Stack |
| Platform | Infrastructure/tooling agents | DevOps, Database Architect, CI/CD |
| Enabling | Review/coaching agents (temporarily boost) | Code Reviewer, Security Auditor |
| Complicated-subsystem | Deep specialist agents (rare expertise) | ML Engineer, Cryptography Specialist |

The VoltAgent taxonomy ([127+ agents](https://github.com/VoltAgent/awesome-claude-code-subagents)):
- **Stream-aligned:** Core Development (10), Language Specialists (27)
- **Platform:** Infrastructure (16), Developer Experience (13)
- **Enabling:** Quality & Security (14), Meta & Orchestration (12)
- **Complicated-subsystem:** Data & AI (12), Specialized Domains (12)
- **Non-technical:** Business & Product (11), Research & Analysis (7)

---

## 5. Anthropic's Multi-Agent Guidance

### Canonical Workflow Patterns

[Building Effective Agents](https://www.anthropic.com/research/building-effective-agents): Prompt chaining, Routing, Parallelization, Orchestrator-workers, Evaluator-optimizer. Key: "LLMs generally perform better when each consideration is handled by a separate LLM call."

### 2026 Agentic Coding Report

[Report](https://resources.anthropic.com/2026-agentic-coding-trends-report) | [PDF](https://resources.anthropic.com/hubfs/2026%20Agentic%20Coding%20Trends%20Report.pdf): Multi-agent replaces single-agent as 2026 trend. Developers use AI in ~60% of work but fully delegate only 0-20%.

### Claude Code's Architecture

[Subagents docs](https://code.claude.com/docs/en/sub-agents):
- **Built-in:** Explore (Haiku/read-only), Plan (inherited/read-only), General-purpose (all tools).
- **Custom:** `.claude/agents/` with YAML frontmatter.
- **Best practice:** "Design focused subagents: each should excel at one specific task."
- **Agent Teams:** [2-5 teammates recommended](https://code.claude.com/docs/en/agent-teams), 5-6 tasks per teammate.
- Examples: Code reviewer, Debugger, Data scientist, DB query validator.

### Community Practice

- [wshobson/agents](https://github.com/wshobson/agents): 112 agents across 72 plugins.
- [Claude Code Agent Teams guide](https://claudefa.st/blog/guide/agents/agent-teams): Teams of 3-4 for typical tasks.
- [Calvin's practical report](https://calv.info/agents-feb-2026): Uses 2 main agents. Pre-built marketplace skills "mostly abandoned." Advises against premature specialization.
- [Agent Teams docs](https://code.claude.com/docs/en/agent-teams): 2-5 teammates, though Nicholas Carlini ran 16 for a C compiler (with perfect test harness).

---

## 6. The T-Shaped Agent Question

### The Architecture IS T-Shaped

From [O'Reilly](https://www.oreilly.com/radar/soft-forks-how-agent-skills-create-specialized-ai-without-training/) and [DeepLearning.AI + Anthropic course](https://www.deeplearning.ai/short-courses/agent-skills-with-anthropic/):

- **Broad base:** Foundation LLM provides general reasoning, coding, language.
- **Deep specialization:** Skills "soft-fork" at runtime with domain-specific knowledge.
- **The agent is always T-shaped.** The question is how much "deep" comes from the role definition (persistent) vs. skills loaded at runtime (on-demand).

From [The New Stack](https://thenewstack.io/ai-agents-or-skills-why-the-answer-is-both/): "The future of agentic AI isn't choosing between agents and skills; it's agents equipped with the right skills at the right time."

### SkillsBench Applied to T-Shape

- 2-3 skills per task is optimal. The role definition = T crossbar (broad behavioral constraints). Loaded skills = T stem (deep domain knowledge).
- Comprehensive all-in-one definitions **hurt performance** (-2.9pp). This is the case against hyper-specialists that pack everything into one definition.

---

## 7. Synthesis: Five Principles for Catalog Composition

**Principle 1: Heterogeneity > Homogeneity.** Two diverse agents outperform 16 identical ones. Each role must bring a genuinely different behavioral posture, not a variation on the same theme.

**Principle 2: Compact > Comprehensive.** SkillsBench is unambiguous: focused definitions (+18.8pp) beat comprehensive ones (-2.9pp) by 21.7pp. Each behavioral agent: behavioral constraints, quality bar, fail triggers, domain scope. Not exhaustive checklists.

**Principle 3: 2-3 Skills Per Task is Optimal.** The role definition is not the only input. At runtime, 2-3 companion skills should load alongside the role. The catalog needs a skills library, not just role definitions.

**Principle 4: Roles Map to Workflow Stages, Not Just Domains.** Team Topologies + Anthropic's orchestrator-workers pattern: roles should align with how work flows (plan, implement, review, deploy), not just domain.

**Principle 5: Behavioral Constraints Beat Identity Claims.** Zheng et al. (162 roles, EMNLP 2024) + Anthropic's guidance confirm "You are an expert X" adds noise. "Default to NEEDS WORK. Require evidence for approval." adds signal.

### Against 30+ Narrow Specialists

- SkillsBench: comprehensive definitions hurt performance (-2.9pp).
- Google scaling study: coordination overhead 58-515%.
- Homogeneous teams plateau at ~4 agents.
- 16/84 SkillsBench tasks showed negative deltas. More is not better.
- Calvin's practical report: pre-built marketplace skills "mostly abandoned."

### Against 120 Raw Migrations

- Identity-based prompting produces random effects (162 roles, EMNLP 2024).
- Self-generated skills = no benefit (-1.3pp). Raw migrations without human curation are valueless.
- Salesforce ships 46 curated use cases. That's the first-party benchmark.

### For ~20 Behavioral Agents

Evidence supports **18-22 behavioral agent definitions**, each: behaviorally distinct (heterogeneity), compact and focused (SkillsBench optimal length), covering a workflow stage + domain intersection, designed as T-shaped with 2-3 companion skill slots.

---

## 8. Concrete Recommendation: V1 Catalog Structure

### Proposed Taxonomy (20 roles)

**Planning & Architecture (4)**
1. Technical Architect -- structural decisions, system boundaries, dependency analysis
2. Product Strategist -- requirements decomposition, user value, scope
3. Research Analyst -- information gathering, synthesis, evidence-based recommendations
4. Risk Assessor -- threat modeling, failure modes, dependency risk

**Implementation (6)**
5. Backend Developer -- server-side logic, API design, data modeling
6. Frontend Developer -- UI implementation, components, accessibility
7. Full-Stack Implementer -- end-to-end delivery, integration
8. Data Engineer -- pipelines, schema evolution, query optimization
9. Infrastructure Engineer -- deployment, scaling, monitoring, CI/CD
10. Mobile Developer -- native apps, platform-specific patterns

**Quality & Review (5)**
11. Code Reviewer -- correctness, readability, maintainability, conventions
12. Security Auditor -- vulnerability detection, auth patterns, input validation
13. Performance Analyst -- bottleneck identification, optimization
14. Test Engineer -- test strategy, coverage, edge cases
15. Accessibility Auditor -- WCAG compliance, assistive technology

**Operations & Governance (3)**
16. Release Engineer -- deployment coordination, rollback, feature flags
17. Documentation Writer -- API docs, architecture decisions, onboarding
18. Compliance Reviewer -- regulatory requirements, data privacy, audit trails

**Coordination (2)**
19. Project Coordinator -- task decomposition, dependencies, progress
20. Integration Reviewer -- cross-system consistency, conflict detection

### Design Rules

1. **Each definition: 50-100 lines max.** Behavioral constraints, quality bar, fail triggers, domain scope. No identity claims.
2. **Each role gets 2-3 companion skill slots.** Skills load at runtime (e.g., Security Auditor + "OWASP Top 10" + "Node.js Security").
3. **No overlap in behavioral posture.** If two roles produce the same output on the same input, merge them.
4. **Framework-agnostic.** Must work with Claude Code, Cursor, Windsurf, Codex, AGENTS.md-compatible tools.
5. **Validation via behavioral-lint-tool.** Every definition passes the linter.

---

## 9. Open Questions

1. **Skills library scope.** Research says 2-3 skills per task. How big should the companion skills library be? In-scope for v1?
2. **Domain-specific catalogs.** SkillsBench shows massive variation (Healthcare +51.9pp vs SWE +4.5pp). Should Sherpa ship vertical extensions?
3. **Runtime composition layer.** The T-shaped model implies skill-loading. Does Sherpa ship a composition tool, or is it the user's responsibility?
4. **Evaluation infrastructure.** SkillsBench shows +85.7pp to -39.3pp variation. Should v1 include evaluation harness?
5. **Community contribution model.** wshobson/agents has 112, VoltAgent 127+. Mostly low quality. How to maintain curation while allowing growth?
6. **Behavioral contract enforcement.** Agent Behavioral Contracts (ABC) provide runtime enforcement. Worth integrating for v1?

---

## Sources

### Academic Papers
- [Towards a Science of Scaling Agent Systems](https://arxiv.org/html/2512.08296v1) -- Google/MIT, Dec 2025
- [Understanding Agent Scaling via Diversity](https://arxiv.org/html/2602.03794v1) -- Feb 2026
- [Specialists or Generalists? Multi-Agent LLMs](https://arxiv.org/html/2601.22386v1) -- Jan 2026
- [SkillsBench: Benchmarking Agent Skills](https://arxiv.org/html/2602.12670v1) -- Feb 2026
- [When "A Helpful Assistant" Is Not Really Helpful](https://aclanthology.org/2024.findings-emnlp.888.pdf) -- EMNLP 2024
- [Auto-scaling LLM-based Multi-Agent Systems](https://www.frontiersin.org/journals/artificial-intelligence/articles/10.3389/frai.2025.1638227/full) -- Frontiers 2025
- [Multi-Agent LLM Systems: Emergent to Structured](https://www.preprints.org/manuscript/202511.1370) -- Nov 2025
- [LLM-Based Multi-Agent Systems for Software Engineering](https://dl.acm.org/doi/10.1145/3712003) -- ACM TOSEM
- [Heterogeneous Multi-Agent Debate (A-HMAD)](https://link.springer.com/article/10.1007/s44443-025-00353-3)
- [LLM-Powered AI Agent Systems in Industry](https://arxiv.org/html/2505.16120v1)
- [Difficulty-Aware Agent Orchestration](https://arxiv.org/html/2509.11079v1)

### Anthropic
- [How We Built Our Multi-Agent Research System](https://www.anthropic.com/engineering/multi-agent-research-system)
- [Building Effective Agents](https://www.anthropic.com/research/building-effective-agents)
- [Effective Context Engineering](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)
- [2026 Agentic Coding Trends Report](https://resources.anthropic.com/2026-agentic-coding-trends-report)
- [Claude Code Subagents Docs](https://code.claude.com/docs/en/sub-agents)
- [Agent Skills with Anthropic (DeepLearning.AI)](https://www.deeplearning.ai/short-courses/agent-skills-with-anthropic/)
- [Skills Explained](https://claude.com/blog/skills-explained)

### Enterprise & Industry
- [Gartner: Task-Specific AI Agents 2026](https://www.gartner.com/en/newsroom/press-releases/2025-08-26-gartner-predicts-40-percent-of-enterprise-apps-will-feature-task-specific-ai-agents-by-2026-up-from-less-than-5-percent-in-2025)
- [Google Cloud Agent Finder](https://cloud.withgoogle.com/agentfinder/) -- 1,914 agents
- [Google Cloud AI Agent Trends 2026](https://cloud.google.com/resources/content/ai-agent-trends-2026)
- [G2 Enterprise AI Agents Report](https://learn.g2.com/enterprise-ai-agents-report)
- [Google Cloud ROI of AI](https://cloud.google.com/transform/roi-of-ai-how-agents-help-business)
- [Salesforce Agentforce Pre-Built Use Cases](https://www.salesforce.com/agentforce/pre-built-use-cases/)

### Community & Ecosystem
- [wshobson/agents](https://github.com/wshobson/agents) -- 112 agents, 146 skills
- [VoltAgent awesome-subagents](https://github.com/VoltAgent/awesome-claude-code-subagents) -- 127+ agents
- [AGENTS.md](https://agents.md/) -- Open format (Linux Foundation)
- [SkillsBench](https://www.skillsbench.ai/)
- [Awesome Agent Skills](https://github.com/VoltAgent/awesome-agent-skills) -- 500+
- [O'Reilly: Soft Forks](https://www.oreilly.com/radar/soft-forks-how-agent-skills-create-specialized-ai-without-training/)
- [The New Stack: Agents or Skills](https://thenewstack.io/ai-agents-or-skills-why-the-answer-is-both/)

### Practical Experience
- [Calvin: Coding Agents Feb 2026](https://calv.info/agents-feb-2026)
- [Paddo: Claude Code Hidden Swarm](https://paddo.dev/blog/claude-code-hidden-swarm/)
- [Claude Code Agent Teams Guide](https://claudefa.st/blog/guide/agents/agent-teams)
- [Team Topologies: AI Agents](https://teamtopologies.com/news-blogs-newsletters/2025/1/14/the-future-of-team-topologies-when-ai-agents-dominate)
