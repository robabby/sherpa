# Vector 1: Governance Deliverables Taxonomy

**Question:** What specific artifacts do enterprises buy when they purchase "AI governance"?
**Agent dispatched:** 2026-03-15

## Findings

### Seven Categories of Governance Deliverables

| Category | What It Contains | Who Produces It |
|----------|-----------------|-----------------|
| **1. Inventories & Registries** | AI system catalog, shadow AI discovery, model registry, agent registry, data lineage | Platforms (Credo AI, Holistic AI, OneTrust, Collibra) |
| **2. Risk Assessments** | Per-model risk scores, bias audits, impact assessments, red-team results, explainability | Consulting (Big Four) + Platforms |
| **3. Policy Documents** | AI use policies, acceptable use frameworks, responsible AI principles, RBAC | Consulting + Templates (RAI Institute) |
| **4. Compliance Mappings** | Control-to-regulation matrices (EU AI Act, NIST RMF, ISO 42001), gap analysis, remediation plans | Consulting + Platforms |
| **5. Technical Documentation** | Model cards, training data summaries, architecture docs, AIBOMs, EU AI Act Annex IV packages | Engineering teams + Platforms |
| **6. Operational Controls** | Approval workflows, lifecycle checkpoints, runtime guardrails, monitoring dashboards, quality gates | Platforms |
| **7. Certifications & Audit Reports** | ISO 42001 certificates, SOC 2 AI controls, third-party audit reports, conformity declarations | Audit firms (Big Four, BSI, TUV SUD) |

### What Consulting Engagements Produce

- **Governance gap analysis**: Where policies/controls fall short against chosen framework. Standard engagement opener.
- **Governance roadmaps**: Phased implementation plans with sequenced capability milestones.
- **Control catalogs**: Safeguard listings mapped to EU AI Act, NIST RMF, ISO 42001 clauses.
- **Model risk assessments**: Per-model evaluations (accuracy, bias, data quality, explainability, security). Include model cards, bias test results, red-team results.
- **AI system inventories**: Discovery and cataloging of every AI system, including shadow AI. Often first deliverable.
- **Impact assessments**: Evaluations for model/prompt/dataset updates with change management docs.
- **Policy documents**: Enterprise AI use policies. RAI Institute published standard template aligned to NIST/ISO.
- **Audit dashboards**: Risk trends, compliance status, remediation tracking.

### What Platforms Sell

IAPP AI Governance Vendor Report 2026 organizes market into: Technical Assessments, Assurance/Auditing, Consulting/Advisory.

Platform features converge on:
- AI asset registry with auto-discovery and shadow AI detection
- Risk classification with Red-Amber-Green dashboards mapping to EU AI Act risk tiers
- Pre-built policy packs for EU AI Act, NIST RMF, ISO 42001, SOC 2, HITRUST
- 100+ automated tests (bias, security, privacy, robustness, red teaming, hallucinations, jailbreaks)
- Approval workflows and lifecycle checkpoints
- Audit-ready evidence generation
- MLOps integration (Azure AI Foundry, OpenAI, Anthropic, Databricks, MLflow)

### EU AI Act Annex IV: 9 Required Documentation Sections

1. General description (purpose, hardware, interactions)
2. Development and design (specifications, data requirements, testing)
3. Monitoring and control (capabilities, limitations, human oversight)
4. Performance metrics (accuracy per demographic group, unintended outcomes)
5. Risk management system
6. Lifecycle change documentation
7. Applied harmonised standards
8. EU declaration of conformity
9. Post-market monitoring plan

Additional: conformity assessments, CE marking, quality management systems, EU database registration. SMEs may use simplified forms.

### ISO 42001 Certification Artifacts

Auditable certification (valid 3 years, annual surveillance):
- AI system inventory with scope definitions
- Risk assessments (technical, ethical, legal)
- Mitigation control documentation
- Stakeholder role assignments
- System effectiveness evidence
- Corrective action records

Microsoft 365 Copilot and Miro are among first certified.

### NIST AI RMF Concrete Artifacts

Four functions (Govern, Map, Measure, Manage) produce:
- Model cards (purpose, training data, performance, limitations)
- Evaluation reports (accuracy, bias, robustness per demographic)
- Decision logs (governance decisions, risk acceptance, control selections)
- Data lineage documentation (training data provenance and quality)
- Monitoring plans (post-deployment configuration and alerting)
- Risk assessment patterns (reusable evaluation templates)

### Emerging: AI Bill of Materials (AIBOM)

Extends SBOMs to include AI metadata: model weights, training data references, learning rates, environment configs. Built on SPDX 3.0.1 and CycloneDX. OWASP AIBOM v0.1 released November 2025.

### Developer-Focused / Lightweight Governance

- **AGENTS.md**: Convention file at repo root for agent instructions. 60,000+ repos in 6 months. Under Linux Foundation AAIF.
- **OpenAI Agents SDK**: Guardrails, tracing, tool-use primitives. Governance as installable packages.
- **MLflow**: Open-source experiment tracking and model registry.
- **ZenML**: Open-source MLOps with versioning and governance from training to evals.
- **Oso**: Policy-as-code framework for granular authorization.

### Market Spending

- AI governance platforms: $492M (2026) → $1B+ (2030). Broader governance/compliance: $2.2-3.4B (2025-2026) → $4.9B (2030). Platforms = ~48% market share.
- AI consulting services: $11.07B (2026) → $90.99B (2035) at 26.2% CAGR. Consulting ~20x larger than platforms.
- Organizations use average 8 GRC solutions in 2025, rising to 10 by 2028.
- Governance platform users are 3.4x more likely to achieve high effectiveness.

## The Critical Distinction: Compliance-Based vs. Convention-Based

**Compliance-based governance** (the $492M platform market + Big Four):
- Driven by external requirements (EU AI Act, NIST, ISO 42001)
- Produces retrospective documentation (audit reports, compliance matrices)
- Operates at organizational/portfolio level
- Measures: "Can we pass an audit?"
- Gap: Operates after the fact — controls assessed, not embedded

**Convention-based governance** (Sherpa's territory):
- Driven by internal development process quality (behavioral constraints, quality gates)
- Produces proactive enforcement artifacts (role definitions, quality scorecards, activity logs)
- Operates at development/execution level
- Measures: "Did the agent produce correct work within defined constraints?"
- Gap: Does not directly produce regulatory compliance docs

**Nobody occupies convention-based governance for AI agent development.** Closest:
- AGENTS.md (convention file, no enforcement/lifecycle)
- OpenAI Agents SDK guardrails (runtime constraints, no governance lifecycle)
- MLflow/ZenML (experiment tracking, not behavioral governance)

## Sources

- [IBM Consulting AI Governance](https://www.ibm.com/consulting/ai-governance)
- [RSM AI Governance](https://rsmus.com/services/digital-transformation/artificial-intelligence/ai-governance.html)
- [Centric Consulting](https://centricconsulting.com/technology-solutions/artificial-intelligence-consulting/ai-governance-consulting-services/)
- [Deloitte Internal Audit](https://www.deloitte.com/us/en/services/audit-assurance/blogs/accounting-finance/audit-ai-risk-management.html)
- [Holistic AI](https://www.holisticai.com/ai-governance-platform)
- [Credo AI](https://www.credo.ai/product)
- [OneTrust AI Governance](https://www.onetrust.com/solutions/ai-governance/)
- [IAPP AI Governance Vendor Report 2026](https://iapp.org/resources/article/ai-governance-vendor-report)
- [Responsible AI Institute Policy Template](https://www.responsible.ai/ai-policy-template/)
- [EU AI Act Annex IV](https://artificialintelligenceact.eu/annex/4/)
- [NIST AI RMF Playbook](https://www.nist.gov/itl/ai-risk-management-framework/nist-ai-rmf-playbook)
- [Gartner AI Governance Platforms](https://www.gartner.com/en/newsroom/press-releases/2026-02-17-gartner-global-ai-regulations-fuel-billion-dollar-market-for-ai-governance-platforms)
- [NMS Consulting Market Size](https://nmsconsulting.com/ai-strategic-consulting-market-size-2026/)
- [OWASP AIBOM](https://owasp.org/www-project-aibom/)
- [AGENTS.md](https://agents.md/)
- [OpenAI Agentic Governance Cookbook](https://developers.openai.com/cookbook/examples/partners/agentic_governance_guide/agentic_governance_cookbook/)
- [Guidehouse — Operationalizing AI Governance](https://guidehouse.com/insights/financial-services/2026/operationalizing-ai-governance)
- [Microsoft ISO 42001](https://learn.microsoft.com/en-us/compliance/regulatory/offering-iso-42001)

## Implications

- **Sherpa occupies an unclaimed layer.** Compliance market (inventories, assessments, audit reports) is well-served. Developer tooling (SDKs, guardrails) is well-served. Nobody provides convention-based governance for AI agent development.
- **The bridge opportunity:** Convention-based artifacts (behavioral definitions, quality gate results, Judge evaluations, activity logs) are exactly the operational evidence compliance platforms need but can't generate. Sherpa-governed processes could export compliance-ready evidence.
- **Model cards → Agent Cards.** Model card concept (purpose, limitations, performance) has direct analogue in behavioral agent roles (disposition, quality-bar, fail triggers). "Agent Cards" as a governance artifact.
- **EU AI Act Annex IV maps to initiative lifecycle.** The 9 required sections parallel Sherpa's proposal → plan → activity → quality gates → seeds progression.
- **AGENTS.md validates convention-file approach.** 60K+ repos adopted in 6 months. Sherpa's rules/skills/behavioral definitions are a more comprehensive version with enforcement and lifecycle.
- **Governance platforms hold 48% market share.** The toolkit half is where Sherpa lives — framework embedded in workflow, not CISO dashboard.

## Open Questions

1. Should Sherpa produce compliance-ready export formats? ("Export initiative lifecycle as EU AI Act Annex IV documentation")
2. What is the "Agent Card" artifact? Fields: role slug, disposition, quality bar, domain scope, fail triggers, operational history, last Judge results.
3. Where does AIBOM fit with config-as-code? Is sherpa.config.ts a form of AIBOM for agent systems?
4. How does ISO 42001 certification interact with convention-based governance?
5. Market for "governance-as-framework" vs. "governance-as-platform"? ESLint vs. SonarQube analogy.
6. Should Sherpa align with or contribute to AAIF standards?
