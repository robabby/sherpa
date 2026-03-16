# Iteration 3 — Beyond Eng/PM/Design: Which Organizational Roles Are Adopting Structured AI Collaboration?

**Date:** 2026-03-15
**Question:** Beyond the Engineering/Product/Design triad, what other organizational roles are adopting structured AI collaboration? Are any close enough to Sherpa's substrate to include in an initial persona set?

---

## Key Discoveries

### 1. Marketing: Closest Structural Match to Eng/PM/Design

- **65% of marketing teams now have designated AI roles** focused on operations, workflows, or strategy. 91% of marketers actively use AI (up from 63% in 2025). ([Jasper State of AI in Marketing 2026](https://www.jasper.ai/state-of-ai-marketing-2026))

- Marketing content pipelines already follow a **brief > draft > review > approve > publish** lifecycle that maps directly to Sherpa's proposal > plan > execute > review pattern. Agentic workflows connect specialized agents across the pipeline (research, briefing, drafting, enrichment, QA). ([Optimizely: The New Content Operating Model](https://www.optimizely.com/insights/the-new-content-operating-model/))

- **Brand governance is the marketing equivalent of a linter.** Typeface's Brand Rules Engine enforces formatting, language, and brand requirements during generation (not post-hoc), with tiered approval workflows: low-risk (automated + single approval, 2-4 hours), medium-risk (compliance review, 1-2 days), high-risk (legal/executive, 3-7 days). ([Typeface: Content Quality Control in AI Marketing](https://www.typeface.ai/blog/content-quality-control-in-ai-marketing-enterprise-governance-and-best-practices))

- Marketing teams organize into **pods mapped to customer journeys** (acquisition, activation, retention, expansion) with explicit roles: Growth Lead, Lifecycle Strategist, Content/Creative Lead, Marketing Ops Lead, plus agent-specific roles like "Prompt & Policy Steward" and "Human-in-the-loop Reviewer." ([Influencers Time: AI Marketing Teams Roles, Pods & Decision Rights](https://www.influencers-time.com/ai-marketing-teams-roles-pods-and-decision-rights-in-2025/))

- Brand governance is the **#1 scaling challenge** for marketing AI -- the quality gate gap identified in Iteration 1 applies here too. Marketing teams need convention-driven quality gates but don't have them. ([Jasper State of AI in Marketing 2026](https://www.jasper.ai/state-of-ai-marketing-2026))

- **Governance maturation follows a 12-month trajectory:** Months 0-3 (codify brand policy, define approval paths, establish "human-on-the-loop" criteria), Months 3-6 (introduce agentic steps, orchestrate pipelines), Months 6-12 (scale with measured KPIs, audit governance). ([Everworker: Scaling Marketing AI](https://everworker.ai/blog/scaling_marketing_ai_2024_2026_from_pilots_to_ai_workers))

### 2. Operations/DevOps: Subtype of Engineering, Not Separate Persona

- In mature organizations, SREs define reliability standards, platform engineers encode those standards into the platform, and DevOps practices help teams meet those standards. The substrate is the same: infrastructure-as-code, CI/CD pipelines, policy-as-code (OPA). ([Splunk: SRE vs DevOps vs Platform Engineering](https://www.splunk.com/en_us/blog/learn/sre-vs-devops-vs-platform-engineering.html))

- DevOps AI workflows use the same pattern as engineering: **staged autonomy** (read-only suggestions > human-approved actions > capped autonomous execution with audit logs). Autonomy caps: dev 90%, prod 40%. ([HackerNoon: AI in DevOps](https://hackernoon.com/ai-in-devops-rise-to-agents-and-why-you-need-agentic-workflows-in-2026))

- 80% of large software organizations will have platform teams by 2026 (Gartner), but the convention set (IaC, policy-as-code, CI/CD) is already part of the engineering substrate. The differentiation is domain-specific behavioral roles and tools, not a fundamentally different governance model. ([Growin: Platform Engineering in 2026](https://www.growin.com/blog/platform-engineering-2026/))

- **Verdict: DevOps/SRE is a role variant within the engineering persona**, not a separate node. Different behavioral constraints and MCP tools, same substrate.

### 3. Customer-Facing Roles (Sales, Support, Success): Strong Adoption, Different Substrate

- Sales enablement is shifting from static playbooks to AI-powered continuous learning loops where every interaction feeds optimization. But the workflow is fundamentally different: pre-call prep > during-call guidance > post-meeting momentum, not proposal > plan > execute > review. ([Highspot: The AI Sales Playbook for Go-to-Market Teams](https://www.highspot.com/blog/ai-sales/))

- Customer success teams organize around playbooks (step-by-step guides for scenarios and customer segments) with AI automating knowledge base article generation, gap detection, and semantic search. ([GTM Buddy: Customer Success Enablement Guide 2026](https://gtmbuddy.ai/guides/customer-success-enablement))

- The **fragmentation problem is critical** in sales/support: chatbots in one system, contact center logs elsewhere, marketing automation separate. No single source of truth across the customer journey. ([CX Quest: Who Owns CX in 2026?](https://cxquest.com/who-owns-cx-in-2026-governance-models-ai-gaps-and-cross-functional-strategy/))

- AI knowledge base software cuts cross-departmental handoff times by 63% when centralized, but the governance model is about knowledge accuracy and response quality, not lifecycle management of proposals/plans. ([Question Base: AI Improves Cross-Functional Team Alignment](https://www.questionbase.com/resources/blog/ai-improves-cross-functional-team-alignment))

- **Verdict: Strong AI adoption, but the workflow substrate is fundamentally different.** Sales/support needs playbook governance, response quality gates, and knowledge accuracy conventions -- not initiative lifecycle management. Requires its own research cycle.

### 4. Finance: High Adoption Intent, Governance-Heavy, Different Artifacts

- **44% of finance teams plan to use agentic AI in 2026** (600%+ increase), but only 11% have agents in production due to governance and security barriers. ([Neurons Lab: Agentic AI in Financial Services 2026](https://neurons-lab.com/article/agentic-ai-in-financial-services-2026/))

- Finance AI follows **task decomposition > autonomous execution > human review > decision-making**, which partially maps to Sherpa's Planner/Worker/Judge. But the artifacts are fundamentally different: financial reports, compliance filings, audit trails -- not proposals, plans, and activity logs. ([PwC: AI Agents for Finance and Reporting](https://www.pwc.com/us/en/services/audit-assurance/library/ai-agents-for-finance-and-reporting.html))

- EY has deployed 150 AI agents across 80,000 tax professionals to automate data collection, document review, and compliance workflows. The governance model emphasizes auditability and regulatory compliance above all else. ([CIO: Finance 2026](https://www.cio.com/article/4142306/finance-2026-a-preview-of-the-year-ai-transformation-gets-real.html))

- **Verdict: Finance could use the Planner/Worker/Judge substrate but brings heavy regulatory governance requirements that would need domain-specific conventions.** Not a first-wave persona.

### 5. Legal/Compliance: Natural Governance Producers, But Specialized

- Legal AI adoption jumped from 23% to 52% in one year. Zero-touch contracting for low-risk agreements is predicted for 2026, with AI-generated negotiation playbooks matching firm style. ([National Law Review: Ten AI Predictions for 2026](https://natlawreview.com/article/ten-ai-predictions-2026-what-leading-analysts-say-legal-teams-should-expect))

- Legal workflows have strong lifecycle parallels: **structured intake > triage > review > approval > escalation.** Contract playbooks with fallback clauses and escalation rules map well to convention-driven governance. ([Summize: 2026 Legal Tech Trends](https://www.summize.com/resources/2026-legal-tech-trends-ai-clm-and-smarter-workflows))

- Legal teams are **governance producers** (they create policies others follow) but **technology consumers** (they adopt vendor platforms, not build their own). The ISACA governance triad (privacy + cybersecurity + legal) requires shared governance checkpoints, model cards, audit logs, and unified risk taxonomies. ([ISACA: Collaboration and the New Triad of AI Governance](https://www.isaca.org/resources/news-and-trends/industry-news/2025/collaboration-and-the-new-triad-of-ai-governance))

- **Verdict: Legal has the closest governance mindset to Sherpa's substrate, but the artifact types are specialized (contracts, compliance filings, risk assessments).** They are the natural cross-node governance partner -- they set the rules other nodes follow. Worth watching, but not a first-wave persona.

### 6. Executive/Leadership: Consumers, Not Producers

- 72% of respondents identify the CEO as the primary AI decision-maker, up from one-third last year. But 58% of organizations cite unclear AI ownership and 75% lack AI governance. ([BusinessWire: C-Suite Leaders and AI](https://www.businesswire.com/news/home/20260203918939/en/New-Study-Shows-C-Suite-Leaders-Highly-Confident-in-AI-ROI-Even-as-58-Claim-Theres-No-Clear-Ownership-of-AI-and-75-Lack-AI-Governance))

- Executives are decision-makers about AI strategy but not operators of AI governance systems. They consume synthesis (dashboards, briefings, portfolio reviews), not produce governance artifacts. ([IDC Directions 2026](https://www.idc.com/resource-center/blog/idc-directions-2026-where-ai-strategy-becomes-enterprise-execution/))

- The COO is predicted to become AI's most influential C-suite champion in 2026, overtaking the CIO, CTO, and CMO. This signals operations as the executive bridge to AI adoption. ([Gloat: AI Workforce Trends for C-Suite 2026](https://gloat.com/blog/ai-workforce-trends-for-c-suite/))

- **Verdict: Not a persona -- a consumer of persona outputs.** Executives need dashboards and synthesis views of governance data, not their own convention sets. Studio's read-only executive view is the answer, not an executive persona.

### 7. HR/People: Emerging Fast, Compliance-Driven

- More than 50% of talent leaders plan to add autonomous AI agents to their teams in 2026. 100+ potential HR agents identified across employee services, recruiting, performance management, coaching, L&D, and workforce management. ([PR Newswire: AI-Powered Superagents Will Radically Change HR](https://www.prnewswire.com/news-releases/in-2026-ai-powered-superagents-will-radically-change-hr-driving-the-largest-hr-transformation-in-decades-302666677.html))

- Under the EU AI Act, most AI systems used for recruitment and worker management are classified as **high-risk** (effective August 2, 2026). This mandates risk management, data governance, technical documentation, accuracy, robustness, and human oversight. ([AIHR: 11 HR Trends for 2026](https://www.aihr.com/blog/hr-trends/))

- HR AI is shifting from task automation to end-to-end workflow orchestration, but requires clean HRIS data, well-defined workflows, and skills frameworks as prerequisites. ([ValueX2: Agentic AI in HR Systems 2026](https://www.valuex2.com/agentic-ai-hr-systems-guide-2026/))

- **Verdict: High adoption momentum and high regulatory stakes, but the governance substrate is fundamentally different (people data, compliance mandates, skills taxonomies).** Separate research cycle needed.

---

## Cross-Node Patterns

When multiple functional nodes adopt AI, three patterns govern how they connect:

1. **Shared artifacts as integration points.** IBM's "AI fusion teams" use a hyper-opinionated enterprise platform with one approved way to connect systems. Standardized integration patterns (not ad-hoc configurations) across organizational boundaries. ([Stack Overflow: Scaling Enterprise AI from IBM](https://stackoverflow.blog/2026/01/29/scaling-enterprise-ai-lessons-in-governance-and-operating-models-from-ibm))

2. **Governance producers vs. governance consumers.** Legal/compliance teams produce governance policies. Engineering, marketing, sales consume them. The CX governance model has three flavors: centralized (single CX officer), federated (shared OKRs), embedded (function-specific KPIs). ([CX Quest: Who Owns CX in 2026?](https://cxquest.com/who-owns-cx-in-2026-governance-models-ai-gaps-and-cross-functional-strategy/))

3. **Handoff conventions reduce friction measurably.** AI-powered cross-departmental handoff tools cut handoff times by 60-63% and miscommunication errors by 40%. The key enablers: automated versioning, comprehensive documentation, and shared context engines. ([Superhuman: How AI Transforms Cross-Team Collaboration](https://blog.superhuman.com/how-ai-transforms-cross-team-collaboration/); [Question Base: AI Improves Cross-Functional Alignment](https://www.questionbase.com/resources/blog/ai-improves-cross-functional-team-alignment))

4. **The certification pattern.** IBM's "AI license to drive" certifies that builders understand data privacy, security protocols, and enterprise integration before deploying agents -- regardless of org chart position. This is a cross-node convention, not a node-specific one. ([Stack Overflow: IBM](https://stackoverflow.blog/2026/01/29/scaling-enterprise-ai-lessons-in-governance-and-operating-models-from-ibm))

---

## Ranking: Proximity to Eng/PM/Design Substrate

| Rank | Role | Substrate Match | Lifecycle Match | Governance Match | Verdict |
|------|------|----------------|-----------------|------------------|---------|
| 1 | **Marketing/Content Ops** | High (markdown, templates, brand rules) | High (brief > draft > review > approve > publish) | High (brand governance = linting, tiered approval = quality gates) | **Include as stretch goal for initial set** |
| 2 | **DevOps/SRE/Platform** | Identical (code, IaC, CI/CD) | Identical | Identical (policy-as-code, audit logs) | **Subtype of Engineering persona** |
| 3 | **Legal/Compliance** | Medium (structured documents, playbooks) | High (intake > triage > review > approve) | Very High (governance producers) | **Cross-node partner, not standalone persona** |
| 4 | **Finance/FP&A** | Medium (structured reports, audit trails) | Medium (task decomposition > execution > review) | High (auditability, regulatory compliance) | **Separate research cycle** |
| 5 | **HR/People** | Low (people data, HRIS, skills taxonomies) | Medium (workflow orchestration) | High (EU AI Act compliance) | **Separate research cycle** |
| 6 | **Sales/Customer Success** | Low (CRM, playbooks, real-time interaction) | Low (real-time > lifecycle) | Medium (knowledge accuracy, response quality) | **Separate research cycle** |
| 7 | **Executive/Leadership** | None (consumption only) | None | Consumer only | **Not a persona -- a view** |

---

## Implications for Sherpa's Initial Persona Scope

### Confirmed: Eng/PM/Design as the launch triad
The research validates the Eng/PM/Design node as the right starting point. These three roles share the same substrate (code + markdown artifacts), the same lifecycle (propose > plan > execute > review), and the same governance model (quality gates, behavioral roles, convention-driven). The research from Iteration 1 holds.

### DevOps/SRE: Include as Engineering variant, not separate persona
DevOps/Platform/SRE uses the identical substrate with domain-specific behavioral constraints and tools. In Sherpa terms, this is a different `defineConfig()` loading different behavioral roles and MCP tools onto the same base. No separate persona needed -- just role-specific conventions within the Engineering persona.

### Marketing: The strongest candidate for a second-wave persona
Marketing content operations has the closest structural match to Sherpa's substrate:
- Markdown/template-based content creation (the artifacts are documents, not code, but they're still text files)
- A brief > draft > review > approve > publish lifecycle that maps to proposal > plan > execute > review
- Brand governance that functions like linting (rules enforced at creation time)
- Quality gates that parallel the Judge role (content scorecard with pass/needs-work criteria)
- Pod structures with explicit decision rights that map to behavioral roles

The gap: marketing conventions are different (brand guidelines, tone of voice, audience targeting) and the artifact types are different (campaign briefs, content calendars, ad copy). These need design work, but the substrate can accommodate them.

### Executive view: Not a persona, just a Studio dashboard
Executives consume governance outputs (portfolio views, initiative dashboards, risk summaries). They don't need their own convention set. They need read-only projections of the governance data other personas produce. This is a Studio UI concern, not a persona concern.

### Everything else: Separate research cycles
Sales, Finance, HR, and Legal all have legitimate AI adoption patterns, but their substrates are different enough that they'd need their own convention design. Legal is the most interesting cross-node partner because they produce governance that other nodes consume -- worth exploring as a governance integration point rather than a standalone persona.

---

## Open Questions

1. **What does a Marketing convention set look like concretely?** What are the artifact types (campaign brief, content calendar, brand guidelines)? What frontmatter fields? What quality gate criteria? What behavioral roles (Brand Guardian, Content Strategist, Campaign Analyst)?

2. **How do marketing pods map to Sherpa's dispatch model?** Marketing pods (acquisition, activation, retention, expansion) have different workflows than engineering sprints. Can the task dispatch system accommodate pod-based routing?

3. **What is the cross-node governance interface?** When Legal produces a policy and Marketing consumes it, what does the artifact look like? Is it a shared governance file with role-specific projections, or a separate artifact type?

4. **Should "Governance Producer" be a meta-role?** Legal, Compliance, and Risk teams all produce governance that other nodes follow. Is there a Sherpa-level abstraction for "governance producers" vs. "governance consumers" that transcends individual personas?

5. **How does the Marketing quality gate differ from the Engineering quality gate?** Sherpa's current content scorecard (sourced claims, headline test, depth test, avoid-list) is already partially marketing-applicable. What needs to change for a marketing Judge role?
