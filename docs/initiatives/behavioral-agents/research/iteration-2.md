# Iteration 2 — Minimum Viable Catalog Composition

**Date:** 2026-03-11
**Question:** What's the optimal composition of a v1 behavioral agent catalog of 40-50 agents? Which of ~120 agency-agents should make the cut?
**Method:** Web research across 5 vectors: universal roles analysis, agency-agents content audit, role coverage models (consulting/agile/DevOps), gap analysis, triage recommendation.

---

## Research Vectors

### Vector 1: Universal Roles Analysis
**Full report:** [iteration-2/vector-1-universal-roles.md](iteration-2/vector-1-universal-roles.md)

### Vector 2: agency-agents Content Audit
**Full report:** [iteration-2/vector-2-agency-agents-audit.md](iteration-2/vector-2-agency-agents-audit.md)

### Vector 3: Role Coverage Models
**Full report:** [iteration-2/vector-3-role-coverage-models.md](iteration-2/vector-3-role-coverage-models.md)

### Vector 4: Gap Analysis
**Full report:** [iteration-2/vector-4-gap-analysis.md](iteration-2/vector-4-gap-analysis.md)

### Vector 5: Triage Recommendation
**Full report:** [iteration-2/vector-5-triage-recommendation.md](iteration-2/vector-5-triage-recommendation.md)

---

## Key Discoveries

### 1. The "Standard Model" of AI Agent Teams Has Crystallized

Every multi-agent framework and team composition guide converges on the same core structure, regardless of origin:

- **BMAD Method** (agile dev): Analyst, Product Manager, Architect, Scrum Master, Developer, QA, UX Designer, Tech Writer
- **VoltAgent** (Claude Code subagents): 127 agents across 10 categories, with Core Dev, Infrastructure, Quality/Security, Data/AI, Business/Product as heaviest categories
- **Multi-agent system theory**: 10 archetypes — Orchestrator, Planner, Executor, Evaluator, Synthesizer, Critic, Retriever, Memory Keeper, Mediator, Monitor
- **Team Topologies**: 4 team types — Stream-aligned (most agents), Platform (DevOps/infra), Enabling (architecture/coaching), Complicated Subsystem (security/ML/data)
- **Anthropic 2026 Agentic Coding Trends**: Specialized agents for code review, test generation, security scanning, and deployment — each specialized, all coordinated

The convergence point across all frameworks: **every functional team needs an architect, implementers (frontend + backend), a reviewer/judge, a tester, a security checker, and a project coordinator**. These 6 roles appear in literally every model surveyed.

### 2. agency-agents Has 120 Agents Across 12 Divisions — But Only ~35 Are Universal

**Division breakdown (120 total):**
| Division | Count | Universal? | Notes |
|----------|-------|-----------|-------|
| engineering | 16 | Mostly | 10 universal, 6 niche (Solidity, WeChat, Embedded, Threat Detection, Autonomous Optimization, WeChat Mini Program) |
| design | 8 | Mostly | 5 universal, 3 niche (Whimsy Injector, Image Prompt Engineer, Inclusive Visuals) |
| marketing | 18 | Partially | 5 universal (SEO, Content, Growth, Social Strategy, LinkedIn), 7 China-market (Baidu, Bilibili, WeChat, Xiaohongshu, Zhihu, Kuaishou, China E-Commerce), 6 platform-specific (TikTok, Instagram, Reddit, Twitter, Carousel, App Store) |
| product | 4 | Mostly | 3 universal, 1 niche (Behavioral Nudge Engine) |
| project-management | 6 | Mostly | 4 universal, 2 agency-specific (Studio Producer, Studio Operations) |
| testing | 8 | Mostly | 6 universal, 2 niche (Evidence Collector is unique/valuable, Workflow Optimizer) |
| support | 6 | Partially | 3 universal (Support Responder, Analytics Reporter, Legal Compliance), 3 niche (Finance Tracker, Infrastructure Maintainer, Executive Summary) |
| sales | 8 | Partially | 4 universal (Outbound, Discovery, Deal Strategy, Pipeline), 4 niche for large orgs |
| paid-media | 7 | Niche | Agency-specific division. Only PPC Strategist and Tracking Specialist are broadly applicable |
| spatial-computing | 6 | Niche | visionOS/XR specific — skip entirely for v1 |
| specialized | 14 | Mixed | Orchestrator is essential; Model QA, Compliance Auditor, Developer Advocate are valuable; rest are niche (blockchain, ZK, accounts payable) |
| game-development | 19 | Niche | Game engine-specific (Unity, Unreal, Godot, Roblox) — skip entirely for v1 |

**Tier assessment:**
- **Tier 1 (battle-tested, rich behavioral content):** ~7 agents — Reality Checker, Evidence Collector, Backend Architect, Senior Developer, Security Engineer, Project Shepherd, Studio Producer
- **Tier 2 (professional, generic but solid):** ~50 agents — Frontend Developer, AI Engineer, DevOps Automator, Mobile App Builder, UI Designer, UX Researcher, Brand Guardian, Product roles, most Testing roles, SEO Specialist, Content Creator
- **Tier 3 (thin/aspirational, wouldn't change LLM behavior):** ~63 agents — All China-market agents, all game dev, all spatial computing, most paid media, most sales, platform-specific marketing

### 3. Consulting + Agile + DevOps Models Agree on 10 Functional Categories

| Source | Categories Used |
|--------|----------------|
| Google Cloud Agent Finder (1,914 agents) | Customer Support, Data Analysis, Finance & Accounting, HR, IT Operations, Legal & Compliance, Marketing, Procurement, Product Development, Sales |
| McKinsey functional practices | Strategy, Operations, Technology, Growth Marketing & Sales, Digital, People & Org, Risk & Resilience, Sustainability, Implementation |
| Deloitte | Strategy & Analytics, Human Capital, Customer & Marketing, Enterprise Technology, Core Business Operations |
| Team Topologies | Stream-aligned, Platform, Enabling, Complicated Subsystem |
| SAFe roles | Product Owner, Scrum Master, Developers (with Test Specialist) |
| DORA/Platform Engineering | DevOps Engineer, SRE, Platform Engineer — all under "infrastructure" umbrella |

**The Sherpa 10-category taxonomy aligns perfectly:**

| Sherpa Category | Google Cloud Equivalent | Consulting Equivalent |
|----------------|------------------------|----------------------|
| engineering | Product Development, IT Operations | Technology |
| product | Product Development | Strategy |
| design | (within Product Development) | (within Growth Marketing) |
| research | Data Analysis | Strategy & Analytics |
| quality | IT Operations | Risk & Resilience |
| operations | IT Operations | Operations |
| marketing | Marketing, Sales | Growth Marketing & Sales |
| security | IT Operations | Risk & Resilience |
| data | Data Analysis | Strategy & Analytics |
| governance | (meta/orchestration) | Implementation |

### 4. Critical Gaps in agency-agents for a Universal Catalog

Roles that **every engineering org needs** but agency-agents either lacks or underserves:

| Missing/Underserved Role | Why Essential | agency-agents Status |
|--------------------------|--------------|---------------------|
| **Code Reviewer** | Most token-intensive agent task (59.4% per Anthropic report) | No dedicated role — review is buried in Reality Checker |
| **Architect / System Designer** | Every framework has this role (BMAD, Team Topologies enabling) | Backend Architect exists but is implementation-heavy, not review-focused |
| **SRE / Reliability Engineer** | DORA metrics, incident management, SLOs | Incident Response Commander exists but is incident-only |
| **Platform Engineer** | 90% of orgs have platform teams (DORA 2025) | No equivalent |
| **Data Analyst** | Universal business function (Google Cloud, every consulting firm) | No equivalent (Data Engineer exists but focused on pipelines) |
| **Database Administrator** | VoltAgent has it; essential for any data-backed app | No equivalent |
| **ML/AI Operations (MLOps)** | Growing fast — 40% job posting increase 2024-2025 | AI Engineer exists but focused on building, not operating |
| **Technical Product Manager** | Bridge between product and engineering | Sprint Prioritizer is closest but lacks PM scope |
| **Scrum Master / Project Coordinator** | BMAD, SAFe, Spotify — every agile model requires it | Project Shepherd is close but agency-flavored |
| **Research Analyst** | VoltAgent has 7 research agents; universal need | Trend Researcher exists but is marketing-oriented |
| **Documentation Engineer** | Technical Writer exists but is narrow | Exists but implementation-focused (Laravel/Livewire) |
| **DevRel / Developer Advocate** | Developer ecosystem essential | Developer Advocate exists in specialized/ |
| **Compliance/Governance Auditor** | Legal & compliance is a Google Cloud top-level function | Compliance Auditor exists but is thin |
| **Business Analyst** | Bridge business needs to technical requirements | No equivalent |
| **Content Strategist** | Distinct from Content Creator — strategy vs. execution | Content Creator conflates both |

### 5. The Optimal v1 Catalog Is 48 Agents Across 10 Categories

Based on cross-referencing all sources, the magic number is **48 agents**: enough to cover every category with meaningful depth, small enough for quality control. Distribution follows the natural weight of each category in real organizations:

| Category | Count | Rationale |
|----------|-------|-----------|
| engineering | 10 | Heaviest — matches reality of engineering-dominated orgs |
| product | 4 | Product strategy + tactical roles |
| design | 4 | Core design competencies |
| research | 3 | Investigation + synthesis |
| quality | 5 | QA + review + judging (high-value for agentic workflows) |
| operations | 5 | PM + coordination + documentation |
| marketing | 5 | Universal marketing functions only |
| security | 4 | Audit + compliance + threat modeling |
| data | 4 | Analytics + engineering + ML |
| governance | 4 | Orchestration + meta-agents |

---

## The 48-Agent Catalog: Full Triage

### Engineering (10)

| Agent | Action | Source | Notes |
|-------|--------|--------|-------|
| `frontend-developer` | **Migrate** | engineering-frontend-developer | Good behavioral substance; rewrite identity claims |
| `backend-developer` | **Migrate** | engineering-backend-architect | Rename from "architect" to "developer" (the role is implementation, not review) |
| `mobile-developer` | **Migrate** | engineering-mobile-app-builder | Broadly applicable cross-platform |
| `devops-engineer` | **Migrate** | engineering-devops-automator | Rename; strong CI/CD + infrastructure content |
| `architect` | **Create fresh** | engineering-backend-architect (partial) | Need a review-focused architect, not an implementer. BMAD, Team Topologies, VoltAgent all distinguish architect-as-reviewer from developer. Focus: system design review, ADRs, module boundary decisions |
| `code-reviewer` | **Create fresh** | testing-reality-checker (partial) | Anthropic 2026 report: 59.4% of tokens go to review. This is the most-used agent in any agentic workflow. Behavioral: precise, convention-focused, bug-then-style priority order |
| `ai-engineer` | **Migrate** | engineering-ai-engineer | ML integration, model deployment. Universal as AI becomes embedded |
| `sre-engineer` | **Create fresh** | engineering-incident-response-commander (partial) | SRE scope: SLOs, error budgets, reliability reviews, incident postmortems. Not just incident response |
| `platform-engineer` | **Create fresh** | None | 90% of orgs have platform teams. IDP, golden paths, developer experience. VoltAgent has this |
| `technical-writer` | **Migrate** | engineering-technical-writer | Rewrite to remove Laravel/Livewire specifics; make universal |

### Product (4)

| Agent | Action | Source | Notes |
|-------|--------|--------|-------|
| `product-manager` | **Create fresh** | product-sprint-prioritizer (partial) | Full PM scope: strategy, roadmap, requirements, stakeholder alignment. BMAD's PM is the reference |
| `product-owner` | **Migrate** | product-sprint-prioritizer | Tactical backlog management, sprint planning, story writing. SAFe/Scrum standard |
| `trend-researcher` | **Migrate** | product-trend-researcher | Market intelligence, competitive analysis |
| `feedback-synthesizer` | **Migrate** | product-feedback-synthesizer | User feedback analysis, insights extraction |

### Design (4)

| Agent | Action | Source | Notes |
|-------|--------|--------|-------|
| `ui-designer` | **Migrate** | design-ui-designer | Visual design, component libraries, design systems |
| `ux-researcher` | **Migrate** | design-ux-researcher | User testing, behavior analysis, usability studies |
| `ux-architect` | **Migrate** | design-ux-architect | Information architecture, interaction design, CSS systems |
| `brand-guardian` | **Migrate** | design-brand-guardian | Brand consistency, voice & tone, design system governance |

### Research (3)

| Agent | Action | Source | Notes |
|-------|--------|--------|-------|
| `research-analyst` | **Create fresh** | product-trend-researcher (partial) | Deep investigation, evidence synthesis, citation-backed findings. VoltAgent's research category has 7 variants; we need one strong generalist |
| `domain-researcher` | **Create fresh** | None | Domain-specific deep dives. Configurable via context-packages per org. Thorough sourcing, every claim backed by citation |
| `competitive-analyst` | **Create fresh** | None | Competitive intelligence, market positioning, SWOT. VoltAgent and consulting models both include this |

### Quality (5)

| Agent | Action | Source | Notes |
|-------|--------|--------|-------|
| `judge` | **Create fresh** | testing-reality-checker | Already defined in Sherpa schema spec. The automated quality gate |
| `qa-engineer` | **Migrate** | testing-api-tester + testing-performance-benchmarker | Consolidate testing roles into one comprehensive QA agent |
| `accessibility-auditor` | **Migrate** | testing-accessibility-auditor | WCAG compliance, screen reader testing. Universal legal requirement |
| `performance-engineer` | **Migrate** | testing-performance-benchmarker | Load testing, Core Web Vitals, optimization. Rename for broader scope |
| `evidence-collector` | **Migrate** | testing-evidence-collector | Screenshot-based QA, visual proof. Unique and valuable from agency-agents |

### Operations (5)

| Agent | Action | Source | Notes |
|-------|--------|--------|-------|
| `project-manager` | **Migrate** | project-manager-senior | Scoping, task conversion, timeline management. Universal role |
| `scrum-master` | **Create fresh** | project-management-project-shepherd (partial) | Sprint facilitation, retrospectives, impediment removal. BMAD, SAFe, Spotify all require this |
| `documentation-engineer` | **Migrate** | engineering-technical-writer | Renamed and broadened: API docs, architecture docs, onboarding guides, not just code comments |
| `business-analyst` | **Create fresh** | None | Requirements gathering, process mapping, stakeholder interviews. Google Cloud and consulting firms both list this as top-level function |
| `developer-advocate` | **Migrate** | specialized-developer-advocate | Developer ecosystem, SDK docs, community engagement. Essential for platform companies |

### Marketing (5)

| Agent | Action | Source | Notes |
|-------|--------|--------|-------|
| `content-strategist` | **Create fresh** | marketing-content-creator (partial) | Strategy layer: editorial calendar, content pillars, audience segmentation. Distinct from execution |
| `seo-specialist` | **Migrate** | marketing-seo-specialist | Technical SEO, content strategy, link building. Universal digital marketing role |
| `growth-engineer` | **Migrate** | marketing-growth-hacker | Rename "hacker" to "engineer." Experimentation, conversion optimization, funnel analysis |
| `social-media-strategist` | **Migrate** | marketing-social-media-strategist | Cross-platform strategy. Universal, not platform-specific |
| `copywriter` | **Create fresh** | marketing-content-creator (partial) | Execution layer: headlines, landing pages, email sequences, ad copy. Distinct from strategy |

### Security (4)

| Agent | Action | Source | Notes |
|-------|--------|--------|-------|
| `security-auditor` | **Migrate** | engineering-security-engineer | Already defined in Sherpa examples. OWASP, dependency audit, secrets scanning |
| `threat-modeler` | **Create fresh** | engineering-threat-detection-engineer (partial) | STRIDE/DREAD analysis, attack surface mapping. Distinct from reactive security review |
| `compliance-auditor` | **Migrate** | specialized-compliance-auditor | Regulatory compliance (SOC2, GDPR, HIPAA). Google Cloud lists Legal & Compliance as top-level function |
| `identity-architect` | **Create fresh** | specialized-agentic-identity-trust (partial) | Auth systems, RBAC/ABAC design, session management, OAuth/OIDC flows |

### Data (4)

| Agent | Action | Source | Notes |
|-------|--------|--------|-------|
| `data-engineer` | **Migrate** | engineering-data-engineer | ETL pipelines, data modeling, warehouse architecture |
| `data-analyst` | **Create fresh** | support-analytics-reporter (partial) | SQL analysis, dashboards, insights. VoltAgent has this; Google Cloud lists Data Analysis as top-level function |
| `database-administrator` | **Create fresh** | None | Schema optimization, query performance, indexing, migrations. VoltAgent has this |
| `ml-engineer` | **Create fresh** | engineering-ai-engineer (partial) | MLOps, model training, feature engineering. Distinct from AI Engineer (integration) |

### Governance (4)

| Agent | Action | Source | Notes |
|-------|--------|--------|-------|
| `orchestrator` | **Migrate** | specialized-agents-orchestrator | Multi-agent coordination, task routing, workflow design |
| `planner` | **Create fresh** | None | Initiative decomposition, task breakdown, dependency mapping. From multi-agent theory: Planner is one of the 10 archetypes |
| `integration-reviewer` | **Create fresh** | None | Cross-cutting change review, conflict detection, artifact coherence. From WavePoint's integration-review skill |
| `release-manager` | **Create fresh** | None | Release coordination, changelog, deployment gates, rollback decisions |

---

## Triage Summary

| Action | Count | Percentage |
|--------|-------|------------|
| **Migrate** (rewrite from agency-agents) | 24 | 50% |
| **Create fresh** (new behavioral definition) | 24 | 50% |
| **Skip** (too niche for v1) | 96 | — |

### What Gets Skipped and Why

| Skipped Group | Count | Reason |
|---------------|-------|--------|
| Game development (entire division) | 19 | Engine-specific (Unity, Unreal, Godot, Roblox). Industry extension, not base catalog |
| Spatial computing (entire division) | 6 | visionOS/XR niche. Industry extension |
| China-market marketing | 7 | Region-specific (Baidu, Bilibili, WeChat, Xiaohongshu, Zhihu, Kuaishou, China E-Commerce) |
| Platform-specific marketing | 6 | TikTok, Instagram, Reddit, Twitter, Carousel, App Store Optimizer |
| Paid media (entire division) | 7 | Agency-specific. Could be an industry extension |
| Sales (most) | 6 | Large-org sales roles (Coach, Proposal Strategist, Account Strategist, Pipeline Analyst). Keep Outbound + Deal Strategy concepts but fold into marketing/operations |
| Niche engineering | 4 | Solidity Smart Contract, WeChat Mini Program, Embedded Firmware, Autonomous Optimization Architect |
| Niche specialized | 8 | Accounts Payable, ZK Steward, Identity Graph Operator, Report Distribution, Sales Data Extraction, Data Consolidation, LSP Index Engineer, Cultural Intelligence |
| Agency-specific operations | 2 | Studio Producer, Studio Operations (agency workflow roles) |
| Niche design | 3 | Whimsy Injector, Image Prompt Engineer, Inclusive Visuals Specialist |
| Niche product | 1 | Behavioral Nudge Engine |
| Duplicates/consolidations | 8+ | Roles absorbed into broader agents (e.g., API Tester + Performance Benchmarker -> QA Engineer) |
| Thin/aspirational Tier 3 | ~20 | Agents that wouldn't meaningfully change LLM behavior |

---

## Category Weight Rationale

The 10/4/4/3/5/5/5/4/4/4 distribution follows empirical patterns:

**Engineering-heavy (10 agents):** Every source confirms engineering is the largest function. VoltAgent: 26 core dev + 26 language specialists + 16 infrastructure = 68 of 127 (54%). Google Cloud: IT Operations + Product Development are the two largest functions. Consulting firms: Technology is always the largest practice by headcount.

**Quality-heavy (5 agents):** Counterintuitive but validated. Anthropic's 2026 report: code review consumes 59.4% of tokens. The Judge/Reviewer/QA cluster is the highest-ROI investment in any agentic workflow. Multi-agent theory identifies Evaluator + Critic + Monitor as 3 of 10 archetypes (30%).

**Operations at parity with marketing (5 each):** Google Cloud treats these as equal top-level functions. Consulting firms treat Operations as the largest practice after Technology.

**Research as a distinct category (3 agents):** VoltAgent dedicates an entire category (7 agents) to research. The BMAD method starts with an Analyst. Research is underserved in agency-agents (only Trend Researcher, which is marketing-oriented).

**Governance as meta-layer (4 agents):** Multi-agent system theory's 10 archetypes include Orchestrator, Planner, Mediator, and Monitor — all meta-roles that coordinate other agents. These don't fit in any functional category.

---

## Synthesis

### The Core Insight: Universal Roles Follow a Power Law

Not all roles are equally universal. The research reveals a clear power-law distribution:

**Tier A — Present in EVERY framework surveyed (8 roles):**
1. Developer/Implementer (frontend + backend)
2. Architect/System Designer
3. Code Reviewer/Critic
4. Tester/QA
5. Product Manager/Owner
6. Project Manager/Coordinator
7. Security Reviewer
8. Technical Writer/Documenter

**Tier B — Present in MOST frameworks (8 roles):**
9. DevOps/Infrastructure
10. Data Analyst
11. UX Designer/Researcher
12. Research Analyst
13. Orchestrator/Coordinator
14. Judge/Evaluator (specific to agentic workflows)
15. SRE/Reliability
16. ML/AI Engineer

**Tier C — Present in MANY frameworks (8 roles):**
17. Platform Engineer
18. Scrum Master
19. Business Analyst
20. Content Strategist
21. SEO Specialist
22. Compliance Auditor
23. Database Administrator
24. Growth Engineer

**Below Tier C — Industry-specific:** Everything else. Game dev, spatial computing, China-market, paid media, sales specializations.

The v1 catalog covers all of Tier A, all of Tier B, and all of Tier C — 24 universal roles — plus 24 additional roles that round out each category for practical completeness.

### Three Strategic Decisions

**1. 50/50 Migrate/Create is the right ratio.**
Half the catalog rewrites agency-agents source material (behavioral gold extraction from identity prompts). Half creates fresh behavioral definitions for roles agency-agents lacks. This positions Sherpa as "agency-agents, but better" while also filling genuine gaps.

**2. Skip entire divisions, not individual agents.**
Game development (19 agents), spatial computing (6), paid media (7), China-market marketing (7) — these are industry extensions. Trying to include "one agent from each" creates a thin, unfocused catalog. Better to ship a deep universal catalog and add industry packs later.

**3. Quality and governance categories are disproportionately important for agentic workflows.**
In human teams, QA is 10-15% of headcount. In agentic workflows, review/evaluation consumes 59.4% of compute. The catalog should reflect this: 5 quality agents + 4 governance agents = 9 of 48 (19%) — matching the actual token-spend reality.

### Contradictions

- **agency-agents' popularity suggests breadth matters.** 29.9k stars came from 120 agents covering niche roles. But the growth driver was cross-tool portability (`convert.sh`), not catalog completeness. Sherpa can win with quality + portability, not quantity.
- **"Create fresh" for 24 agents is significant effort.** Each agent needs a careful behavioral definition. At ~2 agents per session, that's 12 sessions just for fresh agents, plus ~8 sessions for migrations. Estimate: 20 sessions total for the full 48-agent catalog.
- **Sales and marketing cuts may alienate business users.** Going from 33 (marketing + paid media + sales) to 5 marketing + 0 dedicated sales is aggressive. If distribution targets include non-technical users, consider expanding marketing to 7 and adding a `sales` category with 3 agents (outbound-strategist, deal-strategist, sales-engineer) in v1.1.

### Open Questions

1. **Should sales be a v1 category?** Google Cloud includes Sales as a top-level function. Cutting it entirely may limit adoption among GTM teams. Consider a 3-agent sales category for v1, bringing total to 51.
2. **How deep should domain-scope be for universal agents?** agency-agents bakes in specific tech stacks (Laravel, React). Sherpa's behavioral definitions should be stack-agnostic, but what level of technology specificity belongs in `domain-scope`?
3. **Should language-specialist agents be a v1 concept?** VoltAgent has 26 language specialists (TypeScript Pro, Python Pro, etc.). These are essentially the same behavioral definition with different `domain-scope`. Consider a template pattern instead of 26 separate agents.
4. **What's the right model-tier distribution?** Proposed: 8 high (architect, security, judge, orchestrator, threat-modeler, planner, ml-engineer, research-analyst), 35 medium, 5 low (code-formatter type roles).

---

## All Sources

### Multi-Agent Frameworks & Team Composition
- [Anthropic 2026 Agentic Coding Trends Report](https://resources.anthropic.com/2026-agentic-coding-trends-report) — 8 trends, code review = 59.4% of tokens, multi-agent coordination
- [Anthropic 2026 Agentic Coding Trends (PDF)](https://resources.anthropic.com/hubfs/2026%20Agentic%20Coding%20Trends%20Report.pdf?hsLang=en) — Full report
- [Anthropic 2026 Agentic Coding Trends Summary (tessl.io)](https://tessl.io/blog/8-trends-shaping-software-engineering-in-2026-according-to-anthropics-agentic-coding-report/) — Engineer roles shift to supervision + review
- [BMAD Method (GitHub)](https://github.com/bmad-code-org/BMAD-METHOD) — Analyst, PM, Architect, Scrum Master, Developer, QA, UX, Tech Writer
- [BMAD DeepWiki: Agent Architecture](https://deepwiki.com/bmadcode/BMAD-METHOD/8.1-agent-architecture-and-lifecycle) — 14 agent roles defined
- [VoltAgent awesome-claude-code-subagents](https://github.com/VoltAgent/awesome-claude-code-subagents) — 127 agents, 10 categories
- [VoltAgent awesome-agent-skills](https://github.com/VoltAgent/awesome-agent-skills) — 500+ agent skills
- [CrewAI Agents docs](https://docs.crewai.com/en/concepts/agents) — Role/goal/backstory identity trifecta
- [CrewAI Crash Course (DigitalOcean)](https://www.digitalocean.com/community/tutorials/crewai-crash-course-role-based-agent-orchestration) — Role-based orchestration examples
- [CrewAI examples (Composio)](https://composio.dev/blog/crewai-examples) — Researcher, writer, analyst, coder roles
- [Multi-Agent Orchestration Guide 2026 (Codebridge)](https://www.codebridge.tech/articles/mastering-multi-agent-orchestration-coordination-is-the-new-scale-frontier) — 10 agent archetypes: Orchestrator, Planner, Executor, Evaluator, Synthesizer, Critic, Retriever, Memory Keeper, Mediator, Monitor
- [Multi-Agent System Architecture 2026 (ClickIT)](https://www.clickittech.com/ai/multi-agent-system-architecture/) — Architecture patterns
- [Multi-Agent "17x Error Trap" (Towards Data Science)](https://towardsdatascience.com/why-your-multi-agent-system-is-failing-escaping-the-17x-error-trap-of-the-bag-of-agents/) — Failure modes in agent coordination
- [AI Agent Frameworks Comparison 2026 (Turing)](https://www.turing.com/resources/ai-agent-frameworks) — CrewAI, LangGraph, AutoGen, OpenAI, etc.
- [Agent Framework Comparison (Langfuse)](https://langfuse.com/blog/2025-03-19-ai-agent-comparison) — Open-source framework comparison
- [OpenAgents comparison](https://openagents.org/blog/posts/2026-02-23-open-source-ai-agent-frameworks-compared) — MCP + A2A protocol native
- [Coding Agent Teams (DevOps.com)](https://devops.com/coding-agent-teams-the-next-frontier-in-ai-assisted-software-development/) — Agent specialization patterns
- [AI Coding Agents Coherence (Mike Mason)](https://mikemason.ca/writing/ai-coding-agents-jan-2026/) — Orchestration over autonomy

### Agency-Agents (Source Material)
- [agency-agents (GitHub)](https://github.com/msitarzewski/agency-agents) — 120 agents, 12 divisions, MIT license
- [agency-agents README](https://github.com/msitarzewski/agency-agents/blob/main/README.md) — Full roster and division structure
- [agency-agents Medium analysis](https://medium.com/coding-nexus/someone-built-a-full-ai-agency-on-github-61-agents-10k-stars-in-7-days-ac976f85925d) — Growth analysis
- [agency-agents Greg Isenberg tweet](https://x.com/gregisenberg/status/2030680849486668229) — Viral distribution moment
- [agency-agents YUV.AI blog](https://yuv.ai/blog/agency-agents) — Feature analysis
- [agency-agents IgorOffline fork](https://github.com/IgorOffline/msitarzewski-agency-agents) — Fork reference
- [agency-agents lint script](https://github.com/msitarzewski/agency-agents/blob/main/scripts/lint-agents.sh) — 88-line bash linter

### Consulting Firm & Enterprise Models
- [McKinsey Capabilities](https://www.mckinsey.com/capabilities) — Function x industry two-axis model
- [BCG Consulting Roles (CaseBasix)](https://www.casebasix.com/pages/bcg-consulting-roles-and-levels) — Associate to Partner hierarchy
- [BCG X Technology tracks](https://careers.bcg.com/global/en/teams/consulting) — Data science, software eng, product, design
- [Deloitte Consulting structure](https://www.casebasix.com/pages/deloitte-consulting) — 5 service areas
- [Google Cloud Agent Finder](https://cloud.withgoogle.com/agentfinder/) — 1,914+ agents, 10 business functions, 10 industries
- [Google Cloud Agent Gallery docs](https://docs.cloud.google.com/gemini/enterprise/docs/agent-gallery) — Agent discovery
- [Google Cloud AI Agent Marketplace blog](https://cloud.google.com/blog/topics/partners/google-cloud-ai-agent-marketplace) — Marketplace launch
- [ADP Marketplace AI Agents](https://mediacenter.adp.com/2026-03-02-ADP-Marketplace-Launches-AI-Agents-to-Help-Make-Work-Easier,-Smarter) — HR-focused agents
- [ServiceNow AI Agent Marketplace](https://store.servicenow.com/store/ai-marketplace) — Enterprise IT agents
- [AI Agent Store](https://aiagentstore.ai/) — Agent marketplace directory
- [AI Agents Directory](https://aiagentsdirectory.com/) — Largest AI agent directory
- [AI Agents Landscape Map (March 2026)](https://aiagentsdirectory.com/landscape) — Interactive ecosystem map
- [Relevance AI Marketplace](https://marketplace.relevanceai.com/) — 1,000+ free agents

### Agile & DevOps Frameworks
- [Team Topologies key concepts](https://teamtopologies.com/key-concepts) — 4 team types, 3 interaction modes
- [Team Topologies (Atlassian)](https://www.atlassian.com/devops/frameworks/team-topologies) — Developer guide
- [Team Topologies (Martin Fowler)](https://martinfowler.com/bliki/TeamTopologies.html) — Summary
- [Team Topologies in SAFe](https://framework.scaledagile.com/organizing-agile-teams-and-arts-team-topologies-at-scale/) — Enterprise scale
- [Spotify Model (ProductSchool)](https://productschool.com/blog/product-fundamentals/spotify-model-scaling-agile) — Squads, tribes, chapters, guilds
- [Spotify Model (Atlassian)](https://www.atlassian.com/agile/agile-at-scale/spotify) — Implementation guide
- [Spotify Model critique (Jeremiah Lee)](https://www.jeremiahlee.com/posts/failed-squad-goals/) — "Failed Squad Goals"
- [Scrum Roles (Atlassian)](https://www.atlassian.com/agile/scrum/roles) — PO, SM, Developers
- [Scrum Team (Scrum Alliance)](https://resources.scrumalliance.org/Article/scrum-team) — Role accountabilities
- [Product Owner vs PM (Scrum.org)](https://www.scrum.org/resources/product-owner-vs-product-manager) — Strategic vs. tactical
- [DORA](https://dora.dev/) — DevOps research and assessment
- [DORA Platform Engineering capability](https://dora.dev/capabilities/platform-engineering/) — Platform team definition
- [DORA 2025 State of AI in Software Dev](https://cloud.google.com/devops/state-of-devops) — AI-assisted development report
- [DORA 2024 Report announcement](https://cloud.google.com/blog/products/devops-sre/announcing-the-2024-dora-report) — Seven team archetypes
- [Platform Engineering 2026 career guide](https://platformengineering.org/blog/being-a-platform-engineer-in-2026) — Role evolution

### Engineering Roles & Career Paths
- [24 Software Engineering Roles (BrowserStack)](https://www.browserstack.com/guide/what-are-the-different-types-of-software-engineer-roles) — Comprehensive role taxonomy
- [Software Engineering Career Path 2026 (FinalRound)](https://www.finalroundai.com/blog/software-engineering-career-path-guide) — Role progression
- [Top 10 DevOps Roles 2025](https://www.devopstraininginstitute.com/blog/Top-10-DevOps-Roles-&-Career-Paths) — DevOps specializations
- [DevOps Roles & Responsibilities (Splunk)](https://www.splunk.com/en_us/blog/learn/devops-roles-responsibilities.html) — Team composition
- [DevOps vs SRE vs Platform Engineering (InfoWorld)](https://www.infoworld.com/article/4037775/devops-sre-and-platform-engineering-whats-the-difference.html) — Role distinctions
- [SRE vs DevOps vs Platform Engineering (Splunk)](https://www.splunk.com/en_us/blog/learn/sre-vs-devops-vs-platform-engineering.html) — Comparison
- [DevOps Roadmap](https://roadmap.sh/devops) — Comprehensive skill map
- [10 Startup Engineering Roles (Paraform)](https://www.paraform.com/blog/the-10-startup-engineering-roles-you-should-be-hiring-for-in-2025) — Essential hires
- [Startup Roles Guide (IntelliSoft)](https://intellisoft.io/who-does-what-understanding-roles-in-a-software-development-startup/) — Role definitions
- [5 Crucial Startup Roles (BrainHub)](https://brainhub.eu/library/5-crucial-roles-in-every-tech-startup) — MVP team
- [MVP Team Roles (Quora)](https://www.quora.com/What-roles-should-make-up-a-minimum-viable-product-team) — Minimum team discussion
- [Startup Team Structure (Digipal)](https://www.digipal.agency/blog/startup-team-structure) — Optimal structure
- [9 Startup Roles (MassChallenge)](https://masschallenge.org/articles/important-startup-roles/) — Make-or-break roles
- [Software Dev Team Structure (ITRex)](https://itrexgroup.com/blog/software-development-team-structure/) — Approaches and roles
- [Top 10 In-Demand Tech Skills 2026 (Cogent)](https://www.cogentuniversity.com/post/top-10-in-demand-tech-skills-for-the-2026-job-market) — Market demand

### Agent Specifications & Standards
- [Open Agent Spec (Oracle, GitHub)](https://github.com/oracle/agent-spec) — Framework-agnostic YAML
- [Open Agent Spec Technical Report (arXiv)](https://arxiv.org/html/2510.04173v1) — Formal specification
- [Open Agent Spec blog (Medium)](https://medium.com/@andrewswhitehouse/introducing-open-agent-spec-67a492f07835) — Introduction
- [Open Agent Spec (Oracle blog)](https://blogs.oracle.com/ai-and-datascience/introducing-open-agent-specification) — Official announcement
- [OpenAgents YAML tutorial](https://openagents.org/docs/en/tutorials/yaml-based-agents) — YAML agent definition
- [Agent Skills specification](https://agentskills.io/specification) — Skill definition standard
- [Google ADK Agent Config](https://google.github.io/adk-docs/agents/config/) — YAML agent configuration
- [YAML Agent Configuration (DeepWiki)](https://deepwiki.com/lalitnayyar/The-Complete-Agentic-AI-Engineering-Course-2025-/5.1-agent-configuration-with-yaml) — Course reference
- [YAML-Based AI Agents (Empathy First Media)](https://empathyfirstmedia.com/yaml-files-ai-agents/) — Task definition patterns
- [Couchbase Agent Catalog (GitHub)](https://github.com/couchbaselabs/agent-catalog) — Database-backed agent registry

### Data & Enterprise Roles
- [Data Engineering After AI (Newsletter)](https://www.dataengineeringweekly.com/p/data-engineering-after-ai) — Role evolution
- [Context Engineering for Data Engineers (DataHub)](https://datahub.com/blog/context-engineering/) — Enterprise data perspective
- [AI Agents for Data Engineering (Matillion)](https://www.matillion.com/blog/ai-agents-data-engineering) — Pipeline automation
- [Google Cloud Data Engineering Agent](https://cloud.google.com/blog/products/data-analytics/new-agents-and-ai-foundations-for-data-teams) — BigQuery automation
- [Best AI Data Analysis Agents 2026 (Solutions Review)](https://solutionsreview.com/business-intelligence/the-best-ai-agents-for-data-analysis/) — 28 agents reviewed
- [Enterprise AI Agent Engineering (Informatica)](https://www.informatica.com/resources/articles/enterprise-ai-agent-engineering.html) — Enterprise data + AI agents
- [Agentic Analytics Guide (GoodData)](https://www.gooddata.com/blog/agentic-analytics-complete-guide-to-ai-driven-data-intelligence/) — AI-driven data intelligence

### Agentic Development Practices
- [Agentic Engineering Guide 2026 (VibeCoding)](https://vibecoding.app/blog/agentic-engineering-for-software-teams) — Team practices
- [Agentic Engineering Complete Guide 2026 (NxCode)](https://www.nxcode.io/resources/news/agentic-engineering-complete-guide-vibe-coding-ai-agents-2026) — Beyond vibe coding
- [Preparing for Agentic SDLC (ThoughtWorks)](https://www.thoughtworks.com/insights/articles/preparing-your-team-for-agentic-software-development-life-cycle) — Team transformation
- [Agentic Shift in AI Software Dev (AI CERTs)](https://www.aicerts.ai/news/agentic-shift-in-ai-software-development/) — Industry shift
- [GitHub Agentic Workflow Security](https://github.blog/ai-and-ml/generative-ai/under-the-hood-security-architecture-of-github-agentic-workflows/) — Security architecture
- [Agentic Coding Risks (Apiiro)](https://apiiro.com/glossary/agentic-coding/) — Risk assessment
- [AI Agentic Programming Survey (arXiv)](https://arxiv.org/html/2508.11126v1) — Academic survey
- [Microsoft Magentic Marketplace (The New Stack)](https://thenewstack.io/microsoft-launches-magentic-marketplace-for-ai-agents/) — Enterprise agent marketplace
- [Kore.ai Agent Marketplace](https://www.kore.ai/ai-marketplace) — Enterprise platform
- [How Agentic AI Reshapes Engineering 2026 (CIO)](https://www.cio.com/article/4134741/how-agentic-ai-will-reshape-engineering-workflows-in-2026.html) — Executive perspective
- [AI Agent Trends 2026 (Salesmate)](https://www.salesmate.io/blog/future-of-ai-agents/) — 7 shifts to watch
- [7 Agentic AI Trends 2026 (MLMastery)](https://machinelearningmastery.com/7-agentic-ai-trends-to-watch-in-2026/) — Trend analysis
- [Team Enablement for AI Agent Platforms 2026 (EverWorker)](https://everworker.ai/blog/team-enablement-ai-agent-platforms-2026-guide) — Implementation guide

### Skills & Prompt Ecosystems
- [SkillsMP Marketplace](https://skillsmp.com) — 351,349+ skills from GitHub repos
- [SkillHub Claude Skills](https://www.skillhub.club) — Claude Code skills marketplace
- [awesome-openclaw-agents (GitHub)](https://github.com/mergisi/awesome-openclaw-agents) — 100+ SOUL.md templates
- [mitsuhiko/agent-prompts (GitHub)](https://github.com/mitsuhiko/agent-prompts) — Pipeline prompts
- [baz-scm/awesome-reviewers (GitHub)](https://github.com/baz-scm/awesome-reviewers) — Code review prompts
- [awesome-chatgpt-prompts (GitHub)](https://github.com/f/awesome-chatgpt-prompts) — 151k stars, CC0
- [Building Agent Skills (DEV Community)](https://dev.to/onlyoneaman/building-agent-skills-from-scratch-lbl) — Skill authoring guide

---

## Raw Links

Every URL encountered during this research, including tangentially relevant ones:

```
https://github.com/msitarzewski/agency-agents
https://github.com/msitarzewski/agency-agents/blob/main/README.md
https://github.com/msitarzewski/agency-agents/blob/main/engineering/engineering-senior-developer.md
https://github.com/msitarzewski/agency-agents/blob/main/engineering/engineering-ai-engineer.md
https://github.com/msitarzewski/agency-agents/activity
https://github.com/IgorOffline/msitarzewski-agency-agents
https://github.com/msitarzewski/agency-agents/labels
https://github.com/msitarzewski/agency-agents/blob/main/scripts/lint-agents.sh
https://medium.com/coding-nexus/someone-built-a-full-ai-agency-on-github-61-agents-10k-stars-in-7-days-ac976f85925d
https://x.com/gregisenberg/status/2030680849486668229
https://yuv.ai/blog/agency-agents
https://resources.anthropic.com/2026-agentic-coding-trends-report
https://resources.anthropic.com/hubfs/2026%20Agentic%20Coding%20Trends%20Report.pdf?hsLang=en
https://tessl.io/blog/8-trends-shaping-software-engineering-in-2026-according-to-anthropics-agentic-coding-report/
https://huggingface.co/blog/Svngoku/agentic-coding-trends-2026
https://medium.com/ai-software-engineer/this-newly-released-anthropic-agentic-coding-trends-report-is-a-must-read-0701af881148
https://www.linkedin.com/pulse/2026-agentic-coding-trends-report-anthropic-mikael-alemu-gorsky-o6apf
https://solafide.ca/blog/anthropic-2026-agentic-coding-trends-reshaping-software-development
https://www.adwaitx.com/anthropic-2026-agentic-coding-trends-ai-agents/
https://dev.to/jpeggdev/the-ai-revolution-in-2026-top-trends-every-developer-should-know-18eb
https://news.bitcoin.com/anthropics-2026-agentic-coding-report-maps-the-rise-of-multi-agent-dev-teams/
https://github.com/bmad-code-org/BMAD-METHOD
https://deepwiki.com/bmadcode/BMAD-METHOD/8.1-agent-architecture-and-lifecycle
https://deepwiki.com/bmadcode/cursor-custom-agents-rules-generator/3.1-agent-configuration
https://medium.com/@visrow/what-is-bmad-method-a-simple-guide-to-the-future-of-ai-driven-development-412274f91419
https://bennycheung.github.io/bmad-reclaiming-control-in-ai-dev
https://medium.com/@courtlinholt/mastering-the-bmad-method-a-revolutionary-approach-to-agile-ai-driven-development-for-modern-e7be588b8d94
https://dev.to/jacktt/understanding-the-agents-in-the-bmad-235o
https://devlabs.angelhack.com/blog/bmad-method/
https://redreamality.com/garden/notes/bmad-method-guide/
https://medium.com/accelerated-analyst/mastering-the-bmad-method-a-better-approach-to-agile-ai-driven-development-for-modern-software-a77a6808a9a0
https://dev.to/extinctsion/bmad-the-agile-framework-that-makes-ai-actually-predictable-5fe7
https://bmadcodes.com/
https://github.com/VoltAgent/awesome-claude-code-subagents
https://github.com/VoltAgent/awesome-claude-code-subagents/blob/main/CLAUDE.md
https://github.com/VoltAgent/awesome-claude-code-subagents/blob/main/README.md
https://github.com/VoltAgent/awesome-claude-code-subagents/blob/main/CONTRIBUTING.md
https://github.com/VoltAgent/awesome-claude-code-subagents/blob/main/categories/09-meta-orchestration/agent-installer.md
https://github.com/VoltAgent/awesome-claude-code-subagents/blob/main/categories/09-meta-orchestration/agent-organizer.md
https://github.com/VoltAgent/awesome-agent-skills
https://github.com/VoltAgent/awesome-openclaw-skills
https://dev.to/voltagent/100-claude-code-subagent-collection-1eb0
https://github.com/rahulvrane/awesome-claude-agents
https://docs.crewai.com/en/concepts/agents
https://docs.crewai.com/core-concepts/Agents/
https://www.digitalocean.com/community/tutorials/crewai-crash-course-role-based-agent-orchestration
https://composio.dev/blog/crewai-examples
https://markaicode.com/crewai-workflow-automation/
https://github.com/crewAIInc/crewAI
https://www.bentoml.com/blog/building-a-multi-agent-system-with-crewai-and-bentoml
https://www.digitalocean.com/resources/articles/what-is-crew-ai
https://www.analyticsvidhya.com/blog/2025/12/crewai-planning/
https://medium.com/accredian/understanding-crewai-a-deep-dive-into-multi-agent-ai-systems-110d04703454
https://www.codebridge.tech/articles/mastering-multi-agent-orchestration-coordination-is-the-new-scale-frontier
https://arxiv.org/html/2601.01743v1
https://www.clickittech.com/ai/multi-agent-system-architecture/
https://towardsdatascience.com/why-your-multi-agent-system-is-failing-escaping-the-17x-error-trap-of-the-bag-of-agents/
https://medium.com/@akankshasinha247/building-multi-agent-architectures-orchestrating-intelligent-agent-systems-46700e50250b
https://dev.to/eira-wexford/how-to-build-multi-agent-systems-complete-2026-guide-1io6
https://medium.com/@mjgmario/multi-agent-system-patterns-a-unified-guide-to-designing-agentic-architectures-04bb31ab9c41
https://mikemason.ca/writing/ai-coding-agents-jan-2026/
https://www.xcubelabs.com/blog/multi-agent-system-top-industrial-applications-in-2025/
https://grokipedia.com/page/Multi-agent_system
https://www.turing.com/resources/ai-agent-frameworks
https://www.getmaxim.ai/articles/top-5-ai-agent-frameworks-in-2025-a-practical-guide-for-ai-builders/
https://openagents.org/blog/posts/2026-02-23-open-source-ai-agent-frameworks-compared
https://medium.com/@iamanraghuvanshi/agentic-ai-3-top-ai-agent-frameworks-in-2025-langchain-autogen-crewai-beyond-2fc3388e7dec
https://www.langflow.org/blog/the-complete-guide-to-choosing-an-ai-agent-framework-in-2025
https://galileo.ai/blog/mastering-agents-langgraph-vs-autogen-vs-crew
https://langfuse.com/blog/2025-03-19-ai-agent-comparison
https://www.datacamp.com/tutorial/crewai-vs-langgraph-vs-autogen
https://oyelabs.com/langgraph-vs-crewai-vs-openai-swarm-ai-agent-framework/
https://o-mega.ai/articles/langgraph-vs-crewai-vs-autogen-top-10-agent-frameworks-2026
https://www.mckinsey.com/capabilities
https://www.casebasix.com/pages/bcg-consulting-roles-and-levels
https://www.preplounge.com/consulting-forum/roles-and-seniority-at-mckinsey-bcg-bain-6580
https://www.casebasix.com/pages/big-3-firms
https://careerinconsulting.com/mckinsey-vs-bcg/
https://careers.bcg.com/global/en/teams/consulting
https://managementconsulted.com/bcg-levels/
https://www.casebasix.com/pages/mckinsey-hierarchy
https://www.joinleland.com/library/a/what-do-consultants-do-at-mckinsey-bcg-and-bain
https://strategyu.co/consulting-roles/
https://careers.environment.yale.edu/blog/2023/07/27/guide-to-working-at-bcg/
https://cloud.withgoogle.com/agentfinder/
https://docs.cloud.google.com/gemini/enterprise/docs/agent-gallery
https://docs.cloud.google.com/gemini/enterprise/docs/agents-overview
https://docs.cloud.google.com/gemini/enterprise/docs/agent-designer
https://cloud.google.com/gemini-enterprise/agents
https://cloud.google.com/blog/topics/partners/google-cloud-ai-agent-marketplace
https://cloud.google.com/discover/what-are-ai-agents
https://cloud.google.com/products/agentspace
https://medium.com/google-cloud/the-google-cloud-agent-platform-0a3c99ea7a7c
https://cloud.google.com/blog/topics/partners/partners-powering-the-gemini-enterprise-agent-ecosystem
https://teamtopologies.com/key-concepts
https://www.atlassian.com/devops/frameworks/team-topologies
https://martinfowler.com/bliki/TeamTopologies.html
https://itrevolution.com/articles/four-team-types/
https://teamtopologies.com/key-concepts-content/team-interaction-modeling-with-team-topologies
https://framework.scaledagile.com/organizing-agile-teams-and-arts-team-topologies-at-scale/
https://teamtopologies.com/news-blogs-newsletters/2024/11/24/revisiting-team-topologies-misuses-of-platform-teams
https://productschool.com/blog/product-fundamentals/spotify-model-scaling-agile
https://www.atlassian.com/agile/agile-at-scale/spotify
https://www.jeremiahlee.com/posts/failed-squad-goals/
https://www.chameleon.io/blog/spotify-squads
https://medium.com/found-ation/agile-team-organization-a-deep-dive-on-the-spotify-model-f5b32dfc37dd
https://wind4change.com/agile-squad-spotify-model-feature-team-what/
https://producthq.org/agile/agile-spotify-model/
https://businessmap.io/blog/spotify-model
https://dworkz.com/article/7-main-elements-of-spotifys-tribe-engineering-model-in-2025/
https://mooncamp.com/glossary/spotify-model
https://www.atlassian.com/agile/scrum/roles
https://www.bmc.com/blogs/product-owner-product-manager-scrum-master/
https://distantjob.com/blog/product-owner-vs-product-manager-vs-scrum-master/
https://www.aha.io/roadmapping/guide/product-development-methodologies/scrum
https://resources.scrumalliance.org/Article/scrum-team
https://www.eleken.co/blog-posts/scrum-master-vs-product-owner-can-it-be-one-person
https://resources.scrumalliance.org/Article/product-owner-explained
https://www.agile-academy.com/en/foundations/roles-in-scrum/
https://www.scrum.org/resources/product-owner-vs-product-manager
https://dora.dev/
https://dora.dev/capabilities/platform-engineering/
https://mariachec.substack.com/p/platform-engineering-series-3-dora-slos-sre
https://cloud.google.com/blog/products/devops-sre/announcing-the-2024-dora-report
https://cloud.google.com/devops/state-of-devops
https://cloud.google.com/resources/content/2025-dora-ai-assisted-software-development-report
https://dora.dev/research/2024/questions/
https://axify.io/blog/state-of-devops
https://typoapp.io/blog
https://prettyagile.com.au/blog/demystifying-team-topologies-in-safe
https://www.splunk.com/en_us/blog/learn/devops-roles-responsibilities.html
https://www.cortex.io/post/2025-playbook-for-devops-excellence
https://getdx.com/blog/dora-metrics/
https://scrum-master.org/en/guide-dora-metrics-devops/
https://platformengineering.org/blog/being-a-platform-engineer-in-2026
https://www.splunk.com/en_us/blog/learn/sre-vs-devops-vs-platform-engineering.html
https://www.infoworld.com/article/4037775/devops-sre-and-platform-engineering-whats-the-difference.html
https://roadmap.sh/devops
https://www.devopstraininginstitute.com/blog/Top-10-DevOps-Roles-&-Career-Paths
https://www.refontelearning.com/blog/top-devops-job-roles-in-2025-and-the-tools-they-require
https://configr.medium.com/10-essential-skills-for-software-engineers-in-2025-5607e99a7a38
https://talentsprint.com/blog/software-developer-career-roadmap-essential-roles-and-responsibilities
https://www.browserstack.com/guide/what-are-the-different-types-of-software-engineer-roles
https://srehowto.com/5-skills-in-demand-for-sre-devops-and-platform-engineers-in-2025/
https://www.cogentuniversity.com/post/top-10-in-demand-tech-skills-for-the-2026-job-market
https://www.finalroundai.com/blog/software-engineering-career-path-guide
https://intellisoft.io/who-does-what-understanding-roles-in-a-software-development-startup/
https://www.digipal.agency/blog/startup-team-structure
https://masschallenge.org/articles/important-startup-roles/
https://www.paraform.com/blog/the-10-startup-engineering-roles-you-should-be-hiring-for-in-2025
https://get.tech/blog/key-roles-and-positions-in-a-tech-startup/
https://itrexgroup.com/blog/software-development-team-structure/
https://brainhub.eu/library/5-crucial-roles-in-every-tech-startup
https://www.quora.com/What-roles-should-make-up-a-minimum-viable-product-team
https://foundersnetwork.com/startup-roles-definitive-guide-for-founders/
https://fastercapital.com/content/Build-a-minimum-viable-team--Building-a-Minimum-Viable-Team--Essential-Roles-and-Responsibilities.html
https://github.com/oracle/agent-spec
https://arxiv.org/html/2510.04173v1
https://medium.com/@andrewswhitehouse/introducing-open-agent-spec-67a492f07835
https://blogs.oracle.com/ai-and-datascience/introducing-open-agent-specification
https://openagents.org/docs/en/tutorials/yaml-based-agents
https://openagents.org/docs/en/cli/cli-overview
https://openagents.org/docs/tutorials/tutorials
https://www.openpolicyagent.org/docs/latest/configuration/
https://deepwiki.com/darrenhinde/OpenAgentsControl/3.3-agent-hierarchy-and-delegation
https://deepwiki.com/darrenhinde/OpenAgentsControl/3-agent-system-deep-dive
https://agentskills.io/specification
https://google.github.io/adk-docs/agents/config/
https://deepwiki.com/lalitnayyar/The-Complete-Agentic-AI-Engineering-Course-2025-/5.1-agent-configuration-with-yaml
https://empathyfirstmedia.com/yaml-files-ai-agents/
https://github.com/couchbaselabs/agent-catalog
https://dev.to/onlyoneaman/building-agent-skills-from-scratch-lbl
https://aiagentstore.ai/
https://aiagentsdirectory.com/
https://aiagentsdirectory.com/landscape
https://marketplace.relevanceai.com/
https://aiagentstore.ai/ai-agents-map
https://thenewstack.io/microsoft-launches-magentic-marketplace-for-ai-agents/
https://mediacenter.adp.com/2026-03-02-ADP-Marketplace-Launches-AI-Agents-to-Help-Make-Work-Easier,-Smarter
https://store.servicenow.com/store/ai-marketplace
https://www.kore.ai/ai-marketplace
https://cloud.google.com/blog/topics/partners/google-cloud-ai-agent-marketplace
https://www.aicerts.ai/news/agentic-shift-in-ai-software-development/
https://cloud.google.com/discover/what-is-agentic-coding
https://vibecoding.app/blog/agentic-engineering-for-software-teams
https://www.thoughtworks.com/insights/articles/preparing-your-team-for-agentic-software-development-life-cycle
https://www.qodo.ai/
https://github.blog/ai-and-ml/generative-ai/under-the-hood-security-architecture-of-github-agentic-workflows/
https://arxiv.org/html/2508.11126v1
https://apiiro.com/glossary/agentic-coding/
https://www.nxcode.io/resources/news/agentic-engineering-complete-guide-vibe-coding-ai-agents-2026
https://www.cio.com/article/4134741/how-agentic-ai-will-reshape-engineering-workflows-in-2026.html
https://www.salesmate.io/blog/future-of-ai-agents/
https://machinelearningmastery.com/7-agentic-ai-trends-to-watch-in-2026/
https://www.xcubelabs.com/blog/10-real-world-examples-of-ai-agents-in-2025/
https://www.computer.org/csdl/magazine/co/2025/05/10970187/260SnIeoUUM
https://everworker.ai/blog/team-enablement-ai-agent-platforms-2026-guide
https://devops.com/coding-agent-teams-the-next-frontier-in-ai-assisted-software-development/
https://www.ibm.com/think/insights/2026-resolutions-for-ai-and-technology-leaders
https://www.dataengineeringweekly.com/p/data-engineering-after-ai
https://datahub.com/blog/context-engineering/
https://www.matillion.com/blog/ai-agents-data-engineering
https://cloud.google.com/blog/products/data-analytics/new-agents-and-ai-foundations-for-data-teams
https://medium.com/@siva_yetukuri/ai-powered-data-engineering-harnessing-large-language-models-and-multi-agent-frameworks-like-29c1a0d6e3dc
https://medium.com/teradata/build-a-data-analyst-ai-agent-from-scratch-f613a1f5027c
https://codelabs.developers.google.com/devsite/codelabs/build-agents-with-adk-data-analyst-agent
https://solutionsreview.com/business-intelligence/the-best-ai-agents-for-data-analysis/
https://www.informatica.com/resources/articles/enterprise-ai-agent-engineering.html
https://www.gooddata.com/blog/agentic-analytics-complete-guide-to-ai-driven-data-intelligence/
https://www.gls-legaloperations.com/legal-transformation-tube-map/compliance-roles-and-responsibilities
https://www.corporatecomplianceinsights.com/hr-function-compliance-role/
https://globalpeoplestrategist.com/the-role-of-business-legal-compliance-in-corporate-governance/
https://www.deel.com/job-description-templates/compliance-manager/
https://auroratrainingadvantage.com/articles/the-role-of-hr-in-compliance/
https://engagedly.com/blog/hr-rules-and-regulations-a-guide-to-compliance/
https://aniday.com/en/blog/hr-admin-finance-and-legal-what-do-they-specifically-do-2849
https://juro.com/learn/legal-operations
https://imacorp.com/insights/hr-insights-the-role-of-hr-in-compliance/
https://www.mcgregor-boyall.com/our-specialisms/compliance-governance-legal/
https://skillsmp.com
https://skillsmp.com/about
https://smartscope.blog/en/blog/skillsmp-marketplace-guide/
https://www.skillhub.club
https://github.com/mergisi/awesome-openclaw-agents
https://github.com/openclaw/openclaw/discussions/20131
https://github.com/openclaw/openclaw/discussions/17022
https://github.com/mitsuhiko/agent-prompts
https://github.com/mitsuhiko/agent-stuff
https://github.com/baz-scm/awesome-reviewers
https://baz.co/resources/from-review-thread-to-team-standard-how-we-built-awesomereviewers
https://baz.co/resources/engineering-intuition-at-scale-the-architecture-of-agentic-code-review
https://github.com/f/awesome-chatgpt-prompts
https://github.com/dontriskit/awesome-ai-system-prompts
https://github.com/EliFuzz/awesome-system-prompts
https://github.com/tallesborges/agentic-system-prompts
https://github.com/mustvlad/ChatGPT-System-Prompts
https://github.com/LouisShark/chatgpt_system_prompt
https://github.com/ai-boost/awesome-prompts
https://github.com/e2b-dev/awesome-ai-agents
https://github.com/kyrolabs/awesome-agents
https://github.com/jim-schwoebel/awesome_ai_agents
https://github.com/slavakurilyak/awesome-ai-agents
https://github.com/Jenqyang/Awesome-AI-Agents
https://github.com/ashishpatel26/500-AI-Agents-Projects
https://github.com/tmgthb/Autonomous-Agents
https://huggingface.co/blog/tegridydev/open-source-ai-agents-directory
https://promptbase.com
https://www.godofprompt.ai/blog/review-popular-ai-prompt-library-platforms
https://flowgpt.com
https://skywork.ai/blog/flowgpt-review-2025-community-prompt-multimodel-chat/
https://poe.com
https://creator.poe.com
https://skywork.ai/skypage/en/Poe.com-In-Depth-2025-Review-My-Hands-On-Guide-to-the-All-in-One-AI-Platform/1974362346907955200
https://chatgpt.com/gpts
https://donovanrittenbach.com/market-research-report-the-custom-gpt-market-a-3-7-billion-opportunity-for-creators-and-developers-in-2025/
https://www.digitalapplied.com/blog/gpt-store-custom-gpts-business-guide-2026
https://google.github.io/A2A/
https://soulspec.org
https://docs.crewai.com/concepts/agents
https://microsoft.github.io/autogen/
https://mastra.ai/docs/agents/overview
https://openai.github.io/openai-agents-python/
https://docs.anthropic.com/en/docs/agents-and-tools/claude-agent-sdk
https://www.tbmcouncil.org/
```

---

## Implications for the Behavioral-Agents Catalog

1. **The 48-agent target is well-justified.** Cross-referencing consulting firms (10 functions), Google Cloud (10 business functions), VoltAgent (127 agents / 10 categories), and multi-agent theory (10 archetypes), the v1 catalog covers every universally-needed role without including niche/industry-specific ones.

2. **The 50/50 migrate/create split is the right approach.** Migration leverages MIT-licensed source material and demonstrates the behavioral transformation process. Fresh creations fill genuine gaps that agency-agents doesn't cover (Code Reviewer, Architect-as-reviewer, Platform Engineer, SRE, Data Analyst, Business Analyst, Planner, etc.).

3. **Industry extensions should be planned but not built.** Game dev (19 agents), spatial computing (6), China-market (7), and paid media (7) are natural extension packs. The schema already supports `category` extension via `taxonomy.yaml`.

4. **The Code Reviewer is the single most important agent to get right.** Per Anthropic's 2026 data, code review consumes 59.4% of tokens in agentic workflows. This agent's behavioral definition will be the most-used artifact in the entire catalog.

5. **Governance category is novel and strategically important.** No other agent catalog has Orchestrator, Planner, Integration Reviewer, and Release Manager as a coherent meta-category. This reflects the reality of multi-agent systems (30% of archetypes are coordination roles) and differentiates Sherpa from "bag of agents" collections.

## Open Questions for Next Iteration

1. **Should sales be a v1 category?** Google Cloud includes Sales. Cutting it limits GTM adoption. A lean 3-agent sales category (outbound, deal, sales-engineer) would bring total to 51.
2. **Language specialist template pattern?** Instead of 26 language-specific agents, should Sherpa define a template mechanism where `domain-scope` is the only variable? This would cover Python, TypeScript, Go, Rust, etc. without 26 near-identical files.
3. **Priority ordering for the 48 agents?** Which agents should be written first? Proposal: start with the 8 Tier A universal roles (developer, architect, code-reviewer, qa, PM, project-manager, security-auditor, tech-writer), then the 5 quality + 4 governance agents (highest ROI for agentic workflows).
4. **Effort estimation for full catalog production?** At ~2 agents/session for migrations and ~1.5 agents/session for fresh creations, estimated: 12 migration sessions + 16 creation sessions = **~28 sessions** for 48 agents. Can this be parallelized across worktrees?
