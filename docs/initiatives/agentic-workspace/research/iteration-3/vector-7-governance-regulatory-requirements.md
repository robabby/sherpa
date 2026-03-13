# Vector 3: Governance Regulatory Requirements for Agentic AI

**Question:** What specific technical capabilities must an agentic governance framework provide to satisfy emerging AI regulations?

**Method:** Web search across 7 sub-vectors: EU AI Act technical requirements, Colorado AI Act (SB 24-205), NIST AI RMF, AI governance platforms, agentic AI governance specifically, compliance-as-code patterns, and AI audit trail requirements. 25+ sources fetched and analyzed.

**Date:** 2026-03-12

---

## Key Discoveries

### 1. EU AI Act — Articles 9-15 Define the Technical Floor

The EU AI Act's high-risk system requirements (enforceable August 2, 2026) establish the most specific technical mandates of any regulation. Every article maps to a concrete capability:

- **Article 9 (Risk Management):** Continuous, lifecycle-wide risk identification, evaluation, and mitigation. Must be documented, iterative, and updated post-deployment. Not a one-time assessment. ([Source](https://artificialintelligenceact.eu/article/9/), [Dataiku analysis](https://www.dataiku.com/stories/blog/eu-ai-act-high-risk-requirements))

- **Article 10 (Data Governance):** Training, validation, and testing datasets must be "relevant, representative, free of errors, and complete, within reasonable bounds." Requires documented data provenance and quality assurance across all lifecycle phases. ([Source](https://artificialintelligenceact.eu/article/10/))

- **Article 11 + Annex IV (Technical Documentation):** Nine mandatory documentation sections: (1) general description, (2) development process and design choices with rationale, (3) monitoring/control mechanisms, (4) performance metrics with justification, (5) risk management system, (6) lifecycle changes, (7) applied standards, (8) EU declaration of conformity, (9) post-market monitoring plan. Documentation must be maintained for 10 years post-market. SMEs get simplified requirements. ([Source](https://www.aiacto.eu/en/blog/documentation-technique-ai-act-article-11-annexe-iv))

- **Article 12 (Record-Keeping/Logging):** High-risk systems must "automatically log events" during operation. Logs must be tamper-resistant, real-time (not batch), with 99.8%+ capture rate and cryptographic verification. Must support traceability and post-market monitoring. Draft standard prEN ISO/IEC 24970 will specify implementation details. ([Source](https://cleanaim.com/resources/ai-governance/eu-ai-act-article-12-compliance/), [EU text](https://artificialintelligenceact.eu/article/12/))

- **Article 13 (Transparency):** Clear communication of intended purpose, limitations, performance characteristics, and usage guidance to deployers. ([Source](https://artificialintelligenceact.eu/article/13/))

- **Article 14 (Human Oversight):** Systems must be designed for "effective human oversight" by natural persons who can: understand system capacities/limitations, monitor operation, detect anomalies, decide not to use the system, and intervene. Must include appropriate human-machine interface tools. Providers must build in oversight mechanisms OR identify measures for deployers to implement. ([Source](https://artificialintelligenceact.eu/article/14/), [IAPP analysis](https://iapp.org/news/a/eu-ai-act-shines-light-on-human-oversight-needs))

- **Article 15 (Accuracy, Robustness, Cybersecurity):** Must achieve "appropriate levels" throughout lifecycle. Resilience against errors, faults, inconsistencies. Systems that continue learning post-deployment must prevent feedback loops causing biased outputs. Must resist data poisoning, adversarial examples, model manipulation. ([Source](https://artificialintelligenceact.eu/article/15/))

- **Articles 29-30 (Post-Market Monitoring):** Ongoing performance degradation detection, incident reporting, corrective action procedures, continuous risk reassessment after deployment. ([Dataiku](https://www.dataiku.com/stories/blog/eu-ai-act-high-risk-requirements))

**Penalties:** Up to EUR 30M or 6% global revenue. ([Source](https://aisera.com/blog/agentic-ai-compliance/))

### 2. Colorado AI Act (SB 24-205) — First US Comprehensive AI Law

Effective June 30, 2026. Defines "high-risk AI system" as one that "makes, or is a substantial factor in making, a consequential decision." Separate obligations for developers vs. deployers:

**Developer obligations:**
- Provide deployers with model cards, dataset cards, impact assessments
- Document training data governance, evaluation methods for bias, known limitations
- Disclose risks of algorithmic discrimination to Colorado AG and deployers within 90 days of discovery
- Use "reasonable care" to prevent algorithmic discrimination
([Source](https://trustarc.com/resource/colorado-ai-law-sb24-205-compliance-guide/))

**Deployer obligations:**
- Implement risk management policy aligned with NIST AI RMF or ISO 42001
- Complete impact assessments before deployment, annually thereafter, and within 90 days of substantial modification
- Impact assessments must document: system purpose, risk analysis, data inputs/outputs, transparency measures, post-deployment monitoring, expected benefits
- Retain assessments for 3 years
- Provide consumer disclosure: AI system purpose, decision nature, plain-language description, contact for appeals
- Offer human review of adverse consequential decisions
([Source](https://trustarc.com/resource/colorado-ai-law-sb24-205-compliance-guide/), [ABA analysis](https://www.americanbar.org/groups/business_law/resources/business-law-today/2024-july/colorado-enacts-law-regulating-high-risk-artificial-intelligence-systems/))

**"Algorithmic discrimination"** = "any condition in which the use of an AI system results in an unlawful differential treatment or impact" based on protected characteristics (age, color, disability, ethnicity, genetic information, English proficiency, national origin, race, religion, reproductive health, sex, veteran status). ([Source](https://almcorp.com/blog/colorado-ai-act-sb-205-compliance-guide/))

**Enforcement:** Colorado AG issues notice of violation. Organizations have 60 days to cure. Failures classified as unfair trade practices. Small businesses (<50 employees) exempt if not using own data to train/fine-tune. ([Source](https://trustarc.com/resource/colorado-ai-law-sb24-205-compliance-guide/))

### 3. US State Law Proliferation — 38 States, 100+ Measures

The regulatory landscape is fragmenting rapidly:

- **California:** SB 53 (frontier model risk frameworks, safety incident reporting, whistleblower protections), AB 2013 (training data transparency, effective Jan 2026), SB 942 (AI content watermarking/detection, Aug 2026). CCPA ADMT regulations effective Jan 2026 require opt-out rights, risk assessments, cybersecurity audits. ([Source](https://www.kslaw.com/news-and-insights/new-state-ai-laws-are-effective-on-january-1-2026-but-a-new-executive-order-signals-disruption))

- **Texas:** RAIGA effective Jan 2026 — prohibits AI for restricted purposes (encouragement of self-harm, discrimination, CSAM). Penalties $10K-$200K. ([Source](https://stackcyber.com/posts/ai-state-laws))

- **Illinois:** HB 3773 — using AI for employment decisions is a civil rights violation. Requires employer notification and candidate consent for AI-based video interview analysis. ([Source](https://drata.com/blog/artificial-intelligence-regulations-state-and-federal-ai-laws-2026))

- **New York:** Responsible AI Safety and Education Act, effective Jan 2027. NYC Local Law 144 already requires bias audits for automated employment decisions. ([Source](https://stackcyber.com/posts/ai-state-laws))

- **1,000+ AI-related bills** introduced across states in 2025 alone. 38 states adopted ~100 measures. ([Source](https://www.rila.org/blog/2025/09/ai-legislation-across-the-states-a-2025-end-of-ses))

- **Federal preemption attempt:** Dec 2025 executive order proposes federal AI policy framework preempting inconsistent state laws. Commerce Department evaluation was due March 2026, but legal challenges mean state laws remain enforceable. ([Source](https://www.mwe.com/insights/white-house-eo-moves-to-restrict-state-ai-legislation/))

### 4. NIST AI RMF — The De Facto US Standard

NIST AI RMF 1.0 provides the four-function framework (Govern, Map, Measure, Manage) that US regulations reference explicitly. Colorado's SB 24-205 names it as an acceptable framework for deployer risk management policies.

- **Govern:** Risk management culture, organizational policies, roles and responsibilities
- **Map:** Context identification, AI system scope, stakeholder analysis
- **Measure:** Quantitative/qualitative assessment of AI risks using defined metrics
- **Manage:** Prioritize, respond to, and act on identified risks

The Playbook is voluntary and not a checklist — organizations "borrow as many or as few suggestions as apply." RMF 1.1 guidance expected through 2026. ISO/IEC 42001 (AI Management System) maps closely and is certifiable. ([Source](https://www.nist.gov/itl/ai-risk-management-framework), [NIST Playbook](https://airc.nist.gov/airmf-resources/playbook/))

### 5. OWASP Top 10 for Agentic Applications (2026) — The Security Taxonomy

Released December 2025. 100+ expert contributors. Defines the canonical risk taxonomy for AI agent systems:

| ID | Risk | Governance Implication |
|----|------|----------------------|
| ASI01 | Agent Goal Hijack | Prompt injection filtering, human approval for goal changes |
| ASI02 | Tool Misuse & Exploitation | Strict tool permission scoping, sandboxed execution, argument validation |
| ASI03 | Identity & Privilege Abuse | Short-lived credentials, task-scoped permissions, policy-based authorization |
| ASI04 | Supply Chain Vulnerabilities | Signed manifests, curated registries, dependency pinning, kill switches |
| ASI05 | Unexpected Code Execution | Treat generated code as untrusted, hardened sandboxes, preview before execution |
| ASI06 | Memory & Context Poisoning | Segment memory by context, track provenance, expire suspicious entries |
| ASI07 | Insecure Inter-Agent Communication | Mutual TLS, signed payloads, anti-replay, authenticated discovery |
| ASI08 | Cascading Failures | Isolation boundaries, rate limits, circuit breakers |
| ASI09 | Human-Agent Trust Exploitation | Confirmations for sensitive actions, immutable logs, risk indicators |
| ASI10 | Rogue Agents | Strict governance, sandbox agents, monitor behavior, kill switches |

Key principle: **Least Agency** — "autonomy is a feature that should be earned, not a default setting." The shift from "what if an LLM says something wrong?" to "what if an agent does something wrong?" ([Source](https://www.aikido.dev/blog/owasp-top-10-agentic-applications), [Palo Alto Networks](https://www.paloaltonetworks.com/blog/cloud-security/owasp-agentic-ai-security/), [OWASP](https://genai.owasp.org/resource/owasp-top-10-for-agentic-applications-for-2026/))

### 6. AI Governance Platform Market — $309M Growing to $4.8B

The commercial governance platform market is growing 35.7% CAGR. Key players and their capabilities:

**Credo AI** (market leader per Gartner 2025):
- AI/Agent Registry with dependency mapping
- Pre-built policy packs: EU AI Act, NIST AI RMF, ISO 42001, SOC 2
- Runtime trace ingestion and continuous evaluation
- Human-in-the-loop escalation workflows
- Automated evidence generation for audit
- 30+ native connectors (AWS, Azure, GCP, Databricks, GitHub, Jira, ServiceNow)
- MCP Server governance
([Source](https://www.credo.ai/product))

**Holistic AI:** End-to-end lifecycle, shadow AI discovery, automated compliance tracking. ([Source](https://www.splunk.com/en_us/blog/learn/ai-governance-platforms.html))

**Zenity:** Purpose-built for AI agent governance — SaaS/cloud/endpoint. Runtime monitoring with granular step-level interaction logging, shadow AI detection, prompt injection/data leak flagging. ([Source](https://zenity.io/platform))

**IBM watsonx.governance:** Agent monitoring, risk management, regulatory compliance. Named leader in IDC MarketScape 2025 for GenAI evaluation. ([Source](https://www.ibm.com/products/watsonx-governance))

**Fiddler AI:** Real-time monitoring, explainability, bias detection, model drift. ([Source](https://www.splunk.com/en_us/blog/learn/ai-governance-platforms.html))

**Key Gartner finding:** Organizations deploying AI governance platforms are **3.4x more likely** to achieve high effectiveness in AI governance. By 2030, 75% of world economies will have AI regulations, driving $1B+ in compliance spend. ([Source](https://www.gartner.com/en/newsroom/press-releases/2026-02-17-gartner-global-ai-regulations-fuel-billion-dollar-market-for-ai-governance-platforms))

### 7. Compliance-as-Code Patterns — OPA/Rego Is the Standard

Policy-as-code is the established pattern for encoding regulatory requirements as technical controls:

- **Open Policy Agent (OPA)** with Rego is the industry-standard framework. Decouples policy decisions from application logic. Used at Kubernetes level (OPA Gatekeeper), in CI/CD pipelines, and at API gateways. ([Source](https://www.nexastack.ai/blog/agent-governance-at-scale))

- **Three enforcement architectures:** Centralized (single control point), Distributed (policy engines within agents), and Hybrid (centralized compliance + localized adaptations). ([Source](https://www.nexastack.ai/blog/agent-governance-at-scale))

- **Runtime enforcement stack:** Policy Decision Points (PDPs) evaluate actions, Policy Enforcement Points (PEPs) gate actions, Audit Logging captures all decisions. ([Source](https://www.nexastack.ai/blog/agent-governance-at-scale))

- **MCP gateway pattern emerging:** Portkey + Lasso Security, Strata Identity Fabric, TrueFoundry MCP Gateway — all providing real-time guardrails at the protocol level for agent-tool interactions. ([Source](https://portkey.ai/blog/securing-mcp-to-deliver-enterprise-grade-agentic-ai-protection/), [Strata](https://www.strata.io/agentic-identity-sandbox/securing-mcp-servers-at-scale-how-to-govern-ai-agents-with-an-enterprise-identity-fabric/))

- **OpenClaw:** Open-source governance gateway for AI agents with append-only JSONL audit logging, MCP proxy, shell proxy, HTTP API. Works with Cursor, Claude Code, Codex. ([Source](https://github.com/davidcrowe/openclaw-gatewaystack-governance))

- **Key GitOps principle:** "Treat policies as code, stored in version control. Changes go through code review, CI/CD pipelines, and automated testing." ([Source](https://www.nexastack.ai/blog/agent-governance-at-scale))

### 8. Audit Trail Requirements — Chain of Thought Logging

Regulations converge on specific audit trail content requirements:

**What must be logged (cross-regulatory synthesis):**
- Inputs/prompts and outputs/responses
- Model version and configuration
- Timestamps (start/end of each use)
- User/agent identity (who initiated, who reviewed)
- Decision rationale / chain-of-thought reasoning
- Tool calls: tool_name, tool_inputs, tool_outputs
- Agent decisions: agent_name, agent_decision_reason
- Guardrail actions (what was blocked/allowed and why)
- Human oversight: review_required, review_timestamp, review_outcome, reviewer notes
- Confidence scores
- Errors and exceptions
([Source](https://cobbai.com/blog/ai-audit-trails-support), [Aisera](https://aisera.com/blog/agentic-ai-compliance/))

**Technical requirements for logs:**
- Automatic (not retrospective)
- Immutable / tamper-resistant storage
- Cryptographic verification
- Provider-independent (works across any AI model)
- Real-time capture (not batch)
- Structured and queryable
- Retention per regulation (EU AI Act: 10 years for documentation; logging period TBD in standards)
([Source](https://cleanaim.com/resources/ai-governance/eu-ai-act-article-12-compliance/))

**Accountability chain:** Actions by AI agents are legally treated as actions by the organization. "The company cannot evade responsibility by blaming the machine." Accountability must trace: how objectives were encoded, how authority was delegated, how oversight was conducted, how interventions were initiated. ([Source](https://www.ibm.com/think/insights/accountability-gap-autonomous-ai))

### 9. Model Cards and System Cards — Emerging Documentation Standard

- OMB M-26-04 requires federal agencies to request model cards from LLM vendors by March 2026
- Model cards must include: capabilities, safety evaluations, training data/methodology, known biases/failure modes, licensing, governance contacts
- Moving toward machine-readable, interoperable formats (CC BY 4.0 licensing for remixability)
- Anthropic, OpenAI, Google all publish system/model cards with different naming conventions
([Source](https://hoeijmakers.net/model-cards-system-cards/), [Anthropic](https://www.anthropic.com/system-cards))

### 10. FINOS AI Governance Framework — Financial Services Pioneer

- v2.0 includes dedicated agentic AI risk catalogue
- 46 risks with mitigations, cross-referenced to OWASP, MITRE, EU AI Act
- Backed by BMO, Citi, Morgan Stanley, RBC, Bank of America + Microsoft, Google Cloud, AWS
- Open source, providing a structured governance approach for AI lifecycle
([Source](https://www.finos.org/blog/finos-ai-governance-framework-v2.0-addressing-agentic-ai-risks-in-a-rapidly-evolving-landscape), [GitHub](https://github.com/finos/ai-governance-framework))

### 11. McKinsey: "Bounded Autonomy" Is the Operating Model

- 62% of organizations already working with AI agents
- Deloitte warns 40%+ of agentic AI projects may be cancelled by 2027 due to cost/risk controls
- Recommended pattern: "centralized governance with federated execution"
- Start with bounded autonomy, expand only when monitoring shows predictable behavior
- The harder challenge "won't be technical; it will be human: earning trust, driving adoption"
- Risk taxonomy must cover: accuracy, bias, harm, cybersecurity, cross-agent containment
([Source](https://www.mckinsey.com/capabilities/risk-and-resilience/our-insights/trust-in-the-age-of-agents))

### 12. Cost and Financial Controls — Governance Includes Spend

- 84% of companies report margin erosion from AI costs, only 15% forecast accurately
- Cost attribution must link every dollar to workspace, model, project, user, agent, or tool
- Token costs rank only 5th in unexpected costs (37%) — data platform usage is #1 (56%)
- Budget enforcement per agent, real-time monitoring, FinOps practices required
([Source](https://www.mavvrik.ai/ai-cost-governance-report/), [Portkey](https://portkey.ai/blog/ai-cost-observability-a-practical-guide-to-understanding-and-managing-llm-spend/))

---

## Regulatory Requirements Matrix: What a Governance Framework Must Provide

| Capability | EU AI Act | Colorado SB 24-205 | NIST RMF | OWASP Agentic | CCPA ADMT |
|------------|-----------|--------------------|-----------|----|------|
| Risk management system | Art. 9 (mandatory) | Risk mgmt policy (mandatory) | Govern + Manage | -- | Risk assessments |
| Data governance / provenance | Art. 10 | Dataset cards | Map | ASI06 | -- |
| Technical documentation | Art. 11 + Annex IV | Model cards, impact assessments | -- | -- | -- |
| Automatic event logging | Art. 12 (mandatory) | -- | Measure | ASI09 | -- |
| Transparency / disclosure | Art. 13 | Consumer disclosure | Govern | ASI09 | Notice of ADMT |
| Human oversight mechanisms | Art. 14 (mandatory) | Human review of adverse decisions | Govern | ASI09 | Opt-out rights |
| Accuracy / robustness / security | Art. 15 | -- | Measure + Manage | ASI01-10 | Cybersecurity audits |
| Bias / discrimination monitoring | Art. 10 (data) | Algorithmic discrimination testing | Measure | -- | -- |
| Post-market monitoring | Art. 29-30 | Annual impact assessments | Manage | -- | Triennial reviews |
| Agent identity / access control | -- | -- | Govern | ASI03 | -- |
| Tool authorization / sandboxing | -- | -- | -- | ASI02, ASI05 | -- |
| Inter-agent communication security | -- | -- | -- | ASI07 | -- |
| Supply chain integrity | -- | -- | Map | ASI04 | -- |
| Kill switch / circuit breaker | Art. 14 (intervention) | -- | Manage | ASI08, ASI10 | -- |
| Cost tracking / attribution | -- | -- | Govern | -- | -- |

---

## Implications for Sherpa's Governance Layer

### What Sherpa Already Has (and How It Maps)

| Sherpa Capability | Regulatory Mapping |
|---|---|
| Initiative lifecycle (proposal -> approved -> in-progress -> integrated) | Maps to Art. 9 risk management process; Colorado risk management policy |
| Behavioral agent definitions with constraints | Maps to Art. 14 human oversight design; OWASP ASI10 rogue agent prevention |
| HITL gates (integration review, approval workflow) | Maps to Art. 14 human oversight; Colorado human review requirement |
| Convention-as-code (.claude/rules/) | Maps to compliance-as-code pattern; policy-as-code enforcement |
| Activity logs per initiative | Partial mapping to Art. 12 logging; needs granularity |
| Task dispatch with worker/judge pattern | Maps to bounded autonomy; NIST Govern + Manage |
| Skills with defined scope | Maps to OWASP ASI02 tool permission scoping |

### What Sherpa Must Build

1. **Structured audit logging** — Current activity logs are free-text markdown. Regulation demands structured, automatic, tamper-resistant event logging with specific fields (timestamp, agent identity, action, inputs, outputs, decision rationale, human review records). Append-only JSONL format per OpenClaw pattern.

2. **Policy-as-code engine** — Extend `.claude/rules/` from advisory conventions to enforceable policies. Add a policy evaluation layer that can block/allow agent actions at runtime. OPA/Rego integration or a simpler YAML-based policy format.

3. **Risk management templates** — Codify EU AI Act Annex IV documentation structure as initiative templates. Auto-generate compliance documentation from initiative metadata, activity logs, and behavioral definitions.

4. **Bias/discrimination monitoring hooks** — Colorado requires testing for algorithmic discrimination. Provide framework hooks for deployers to plug in fairness metrics (demographic parity, equal opportunity, equalized odds).

5. **Agent identity and permission system** — OWASP ASI03 demands scoped, short-lived credentials per agent task. Current behavioral definitions scope what agents should do; extend to scope what they can do (tool access, file access, API access).

6. **Impact assessment templates** — Colorado requires pre-deployment and annual impact assessments with specific content (purpose, risk analysis, data I/O, transparency measures, monitoring plan, expected benefits). Make these first-class initiative artifacts.

7. **Model/system card generation** — Auto-generate model cards and system cards from behavioral definitions, initiative research, and deployment configuration. Machine-readable format for interoperability.

8. **Cost attribution and tracking** — Link token usage and compute costs to specific agents, tasks, and initiatives. Budget enforcement per agent/project.

9. **Kill switch / circuit breaker infrastructure** — Art. 14 requires intervention capability. OWASP ASI08/10 require circuit breakers and kill switches. Formalize the ability to halt agent execution mid-task.

10. **Compliance mapping dashboard** — Studio UI showing which regulatory requirements are satisfied by which governance primitives. Gap analysis per regulation.

---

## Sources

### Primary Regulatory Texts
- [EU AI Act Article 9 — Risk Management System](https://artificialintelligenceact.eu/article/9/)
- [EU AI Act Article 11 — Technical Documentation](https://artificialintelligenceact.eu/article/11/)
- [EU AI Act Article 12 — Record-Keeping](https://artificialintelligenceact.eu/article/12/)
- [EU AI Act Article 14 — Human Oversight](https://artificialintelligenceact.eu/article/14/)
- [EU AI Act Article 15 — Accuracy, Robustness, Cybersecurity](https://artificialintelligenceact.eu/article/15/)
- [EU AI Act Article 19 — Automatically Generated Logs](https://artificialintelligenceact.eu/article/19/)
- [EU AI Act Annex IV — Technical Documentation Requirements](https://artificialintelligenceact.eu/annex/4/)
- [Colorado SB 24-205 — Full text (PDF)](https://content.leg.colorado.gov/sites/default/files/2024a_205_signed.pdf)
- [Colorado SB 24-205 — Legislative page](https://leg.colorado.gov/bills/sb24-205)

### Analyses and Guides
- [Dataiku — EU AI Act High-Risk Requirements](https://www.dataiku.com/stories/blog/eu-ai-act-high-risk-requirements) — Articles 9-15 breakdown with ambiguities
- [AiActo — EU AI Act Annex IV Complete Guide](https://www.aiacto.eu/en/blog/documentation-technique-ai-act-article-11-annexe-iv) — All 9 mandatory documentation sections
- [CleanAim — Article 12 Infrastructure-Level Compliance](https://cleanaim.com/resources/ai-governance/eu-ai-act-article-12-compliance/) — Logging technical requirements
- [TrustArc — Colorado SB 24-205 Compliance Guide](https://trustarc.com/resource/colorado-ai-law-sb24-205-compliance-guide/) — Developer/deployer obligations detail
- [ALM Corp — Colorado AI Act Compliance Guide](https://almcorp.com/blog/colorado-ai-act-sb-205-compliance-guide/) — Algorithmic discrimination definition
- [ABA — Colorado Enacts AI Law](https://www.americanbar.org/groups/business_law/resources/business-law-today/2024-july/colorado-enacts-law-regulating-high-risk-artificial-intelligence-systems/) — Legal analysis
- [NAAG — Deep Dive Colorado AI Act](https://www.naag.org/attorney-general-journal/a-deep-dive-into-colorados-artificial-intelligence-act/) — Attorney general perspective
- [Aisera — Agentic AI Compliance Technical Guide](https://aisera.com/blog/agentic-ai-compliance/) — HITL/HOTL patterns, TRAPS framework, regulatory mapping table
- [Venable — Agentic AI Legal/Compliance/Governance Risks](https://www.venable.com/insights/publications/2026/02/agentic-ai-is-here-legal-compliance-and-governance) — Data management, vendor risk, identity challenges
- [Mayer Brown — Governance of Agentic AI Systems](https://www.mayerbrown.com/en/insights/publications/2026/02/governance-of-agentic-artificial-intelligence-systems) — Legal analysis
- [Institute for Law & AI — Automated Compliance and AI Regulation](https://law-ai.org/automated-compliance-and-the-regulation-of-ai/) — Automatability triggers concept
- [Cobbai — AI Audit Trails for Compliance](https://cobbai.com/blog/ai-audit-trails-support) — Logging field specifications
- [Swept AI — AI Audit Trail](https://www.swept.ai/ai-audit-trail) — Compliance and accountability patterns
- [IBM — Accountability Gap in Autonomous AI](https://www.ibm.com/think/insights/accountability-gap-autonomous-ai) — Delegation and liability analysis
- [Lathrop GPM — Liability for Agentic AI](https://www.lathropgpm.com/insights/liability-considerations-for-developers-and-users-of-agentic-ai-systems/) — Developer vs deployer liability
- [IAPP — EU AI Act Human Oversight Needs](https://iapp.org/news/a/eu-ai-act-shines-light-on-human-oversight-needs) — Article 14 implementation challenges

### OWASP and Security
- [OWASP Top 10 for Agentic Applications 2026](https://genai.owasp.org/resource/owasp-top-10-for-agentic-applications-for-2026/) — Official resource page
- [OWASP Agentic Security Initiative](https://genai.owasp.org/initiatives/agentic-security-initiative/) — Working group
- [Aikido — Full OWASP Agentic Top 10 Guide](https://www.aikido.dev/blog/owasp-top-10-agentic-applications) — All 10 risks with mitigations
- [Palo Alto Networks — OWASP Agentic AI Security](https://www.paloaltonetworks.com/blog/cloud-security/owasp-agentic-ai-security/) — Enterprise security perspective
- [Auth0 — Lessons from OWASP Agentic Top 10](https://auth0.com/blog/owasp-top-10-agentic-applications-lessons/) — Identity/auth implications
- [Practical DevSecOps — OWASP Agentic Top 10](https://www.practical-devsecops.com/owasp-top-10-agentic-applications/) — DevSecOps perspective
- [Astrix Security — OWASP Agentic Top 10](https://astrix.security/learn/blog/the-owasp-agentic-top-10-just-dropped-heres-what-you-need-to-know/) — NHI identity perspective

### Standards and Frameworks
- [NIST AI Risk Management Framework](https://www.nist.gov/itl/ai-risk-management-framework) — Overview
- [NIST AI RMF 1.0 (PDF)](https://nvlpubs.nist.gov/nistpubs/ai/nist.ai.100-1.pdf) — Full framework document
- [NIST AI RMF Playbook](https://airc.nist.gov/airmf-resources/playbook/) — Implementation suggestions
- [NIST AI 600-1 — Generative AI Profile (PDF)](https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.600-1.pdf) — GenAI-specific guidance
- [NIST IR 8596 — Cybersecurity Framework Profile for AI (PDF)](https://nvlpubs.nist.gov/nistpubs/ir/2025/NIST.IR.8596.iprd.pdf) — Cyber AI profile draft
- [ISO/IEC 42001 — AI Management Systems (ISO)](https://www.iso.org/standard/42001) — Official standard
- [FINOS AI Governance Framework](https://air-governance-framework.finos.org/) — Financial services open source
- [FINOS AI Governance Framework v2.0 Blog](https://www.finos.org/blog/finos-ai-governance-framework-v2.0-addressing-agentic-ai-risks-in-a-rapidly-evolving-landscape) — Agentic AI risk catalogue
- [FINOS AI Governance Framework GitHub](https://github.com/finos/ai-governance-framework) — Source code

### AI Governance Platforms
- [Credo AI — Product](https://www.credo.ai/product) — Platform capabilities
- [Credo AI — Gartner Market Guide Recognition](https://www.credo.ai/blog/credo-ai-recognized-in-the-gartner-r-market-guide-for-ai-governance-platforms-2025) — Market position
- [Gartner — AI Governance Market Growth](https://www.gartner.com/en/newsroom/press-releases/2026-02-17-gartner-global-ai-regulations-fuel-billion-dollar-market-for-ai-governance-platforms) — $309M to $4.8B projection
- [Gartner — AI Governance Platform Reviews](https://www.gartner.com/reviews/market/ai-governance-platforms) — Peer reviews
- [Splunk — Best AI Governance Platforms 2026](https://www.splunk.com/en_us/blog/learn/ai-governance-platforms.html) — Credo AI, Lumenova, Holistic AI, Fiddler, Monitaur
- [Atlan — 7 Top AI Governance Tools 2026](https://atlan.com/ai-governance-tools/) — Tool comparison
- [IBM watsonx.governance](https://www.ibm.com/products/watsonx-governance) — Enterprise platform
- [IBM AI Governance Solutions](https://www.ibm.com/solutions/ai-governance) — Broader solution set
- [IBM AI FactSheets 360](https://rai-toolkit.github.io/technology/technical%20tool/IBM-AI-AI-FactSheets-360/) — Model documentation toolkit
- [Microsoft — Responsible AI Tools](https://www.microsoft.com/en-us/ai/tools-practices) — Fairness, explainability toolkits
- [Zenity — AI Security Platform](https://zenity.io/platform) — Agent governance, shadow AI detection
- [Zenity — AI Observability](https://zenity.io/platform/ai-observability) — Runtime monitoring
- [Holistic AI](https://www.holisticai.com/) — End-to-end AI governance
- [OneTrust — AI Governance](https://www.onetrust.com/solutions/ai-governance/) — Privacy-focused governance
- [Collibra — AI Governance](https://www.collibra.com/products/ai-governance) — Data governance + AI
- [Domino — AI Governance Platform](https://domino.ai/platform/ai-governance) — MLOps governance

### Compliance-as-Code and Policy Engines
- [NexaStack — Agent Governance at Scale: Policy-as-Code](https://www.nexastack.ai/blog/agent-governance-at-scale) — OPA/Rego patterns, enforcement architecture
- [Kyndryl — Policy as Code for AI](https://www.kyndryl.com/us/en/about-us/news/2026/02/policy-as-code-ai) — Enterprise perspective
- [Ethyca — Governing Data & AI with Policy-as-Code](https://www.ethyca.com/news/how-to-govern-data-and-ai-with-a-policy-as-code-approach) — Privacy engineering
- [Platform Engineering — Policy as Code Guide](https://platformengineering.org/blog/policy-as-code) — Platform engineering perspective
- [Information Matters — Governance as Code](https://informationmatters.org/2025/12/governance-as-code-how-ai-is-enforcing-information-policies-directly-in-the-tech-stack/) — Embedded enforcement
- [OpenClaw — Governance Gateway for AI Agents](https://github.com/davidcrowe/openclaw-gatewaystack-governance) — Open source MCP proxy + audit

### MCP Security and Agent Gateways
- [Cerbos — Securing AI Agents with MCP](https://www.cerbos.dev/news/securing-ai-agents-model-context-protocol) — Authorization guardrails
- [Straiker — MCP Security for Agent-Tool Interactions](https://www.straiker.ai/solution/security-for-agent-tool-interactions) — Security platform
- [TrueFoundry — Enterprise AI Security with MCP Gateway](https://www.truefoundry.com/blog/enterprise-ai-security-with-mcp-gateway-runtime-guardrails) — Runtime guardrails
- [Strata — Securing MCP Servers at Scale](https://www.strata.io/agentic-identity-sandbox/securing-mcp-servers-at-scale-how-to-govern-ai-agents-with-an-enterprise-identity-fabric/) — Identity fabric
- [Portkey + Lasso — Securing MCP Gateway](https://portkey.ai/blog/securing-mcp-to-deliver-enterprise-grade-agentic-ai-protection/) — Enterprise guardrails
- [Integrate.io — Best MCP Gateways 2026](https://www.integrate.io/blog/best-mcp-gateways-and-ai-agent-security-tools/) — Tool comparison
- [Snyk — Future of AI Agent Security](https://snyk.io/blog/future-of-ai-agent-security-guardrails/) — Security guardrails

### Model Cards and Transparency
- [Anthropic Transparency Hub](https://www.anthropic.com/transparency) — Model reporting
- [Anthropic System Cards](https://www.anthropic.com/system-cards) — All model system cards
- [Anthropic Model Report](https://www.anthropic.com/transparency/model-report) — Transparency reports
- [Stanford CRFM — Anthropic FMTI Report](https://crfm.stanford.edu/fmti/December-2025/company-reports/Anthropic_FinalReport_FMTI2025.html) — Foundation model transparency
- [Model Cards: What They're Quietly Becoming](https://hoeijmakers.net/model-cards-system-cards/) — Evolution toward machine-readable standards
- [NexaStack — Model Cards and AI Fact Sheets](https://www.nexastack.ai/blog/model-cards-ai-fact-sheets) — Building governance-ready AI
- [NVIDIA — Model Card++](https://developer.nvidia.com/blog/enhancing-ai-transparency-and-ethical-considerations-with-model-card/) — Enhanced model documentation

### Human Oversight Implementation
- [IBM — Human in the Loop](https://www.ibm.com/think/topics/human-in-the-loop) — Definitions and patterns
- [Stanford HAI — Humans in the Loop](https://hai.stanford.edu/news/humans-loop-design-interactive-ai-systems) — Interactive AI system design
- [Credo AI — Human-on-the-Loop Glossary](https://www.credo.ai/glossary/human-on-the-loop) — HOTL definition
- [Serco — HITL vs HOTL](https://www.serco.com/na/media-and-news/2025/human-in-the-loop-vs-human-on-the-loop-navigating-the-future-of-ai) — Comparative analysis

### State AI Law Trackers
- [IAPP — US State AI Governance Legislation Tracker](https://iapp.org/resources/article/us-state-ai-governance-legislation-tracker) — Comprehensive tracker
- [Orrick — US State AI Law Tracker](https://ai-law-center.orrick.com/us-ai-law-tracker-see-all-states/) — All states
- [Stack Cybersecurity — Comprehensive State AI Laws List](https://stackcyber.com/posts/ai-state-laws) — State-by-state overview
- [Drata — AI Regulations State and Federal 2026](https://drata.com/blog/artificial-intelligence-regulations-state-and-federal-ai-laws-2026) — Current landscape
- [Baker Botts — US AI Law Update Jan 2026](https://www.bakerbotts.com/thought-leadership/publications/2026/january/us-ai-law-update) — Federal/state update
- [King & Spalding — New State AI Laws Jan 2026](https://www.kslaw.com/news-and-insights/new-state-ai-laws-are-effective-on-january-1-2026-but-a-new-executive-order-signals-disruption) — Implementation status

### Market Analysis and Industry Reports
- [McKinsey — Trust in the Age of Agents](https://www.mckinsey.com/capabilities/risk-and-resilience/our-insights/trust-in-the-age-of-agents) — Agentic AI governance
- [McKinsey — Seizing the Agentic AI Advantage](https://www.mckinsey.com/capabilities/quantumblack/our-insights/seizing-the-agentic-ai-advantage) — Market adoption
- [Mavvrik — AI Cost Governance Report 2025](https://www.mavvrik.ai/ai-cost-governance-report/) — 84% margin erosion finding
- [Portkey — AI Cost Observability Guide](https://portkey.ai/blog/ai-cost-observability-a-practical-guide-to-understanding-and-managing-llm-spend/) — Cost tracking patterns
- [Deloitte — AI Tokens Spend Dynamics](https://www.deloitte.com/us/en/insights/topics/emerging-technologies/ai-tokens-how-to-navigate-spend-dynamics.html) — Financial analysis
- [Credo AI — Davos 2026](https://www.credo.ai/lp/davos-2026) — AI governance imperative
- [Promptfoo — AI Regulation 2025](https://www.promptfoo.dev/blog/ai-regulation-2025/) — Regulatory landscape

### Bias and Fairness
- [NIST SP 1270 — Identifying and Managing Bias in AI](https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.1270.pdf) — Standards document
- [IBM AI Fairness 360](https://www.ibm.com/products/ai-fairness-360) — Open source bias toolkit (70+ metrics, 10+ algorithms)

### Academic and Research Papers
- [SSRN — Agentic AI Governance Framework](https://papers.ssrn.com/sol3/papers.cfm?abstract_id=5652350) — Universal model for risk/accountability
- [SSRN — Human Oversight under Article 14](https://papers.ssrn.com/sol3/papers.cfm?abstract_id=5147196) — Academic analysis
- [ArXiv — Authenticated Delegation and Authorized AI Agents](https://arxiv.org/html/2501.09674v1) — Delegation patterns
- [ArXiv — Delegating AI Governance to AIs](https://arxiv.org/html/2509.22717v1) — Administrative law lessons
- [ArXiv — Robustness and Cybersecurity in EU AI Act](https://arxiv.org/html/2502.16184v2) — Technical analysis

---

## Raw Links (All URLs Encountered)

```
https://artificialintelligenceact.eu/article/9/
https://artificialintelligenceact.eu/article/11/
https://artificialintelligenceact.eu/article/12/
https://artificialintelligenceact.eu/article/14/
https://artificialintelligenceact.eu/article/15/
https://artificialintelligenceact.eu/article/19/
https://artificialintelligenceact.eu/annex/4/
https://ai-act-service-desk.ec.europa.eu/en/ai-act/article-9
https://ai-act-service-desk.ec.europa.eu/en/ai-act/article-12
https://ai-act-service-desk.ec.europa.eu/en/ai-act/article-14
https://ai-act-service-desk.ec.europa.eu/en/ai-act/article-15
https://www.euaiact.com/article/12
https://www.euaiact.com/article/14
https://www.euaiact.com/article/15
https://www.euaiact.com/key-issue/4
https://www.euaiact.com/annex/4
https://www.dataiku.com/stories/blog/eu-ai-act-high-risk-requirements
https://www.legalnodes.com/article/eu-ai-act-2026-updates-compliance-requirements-and-business-risks
https://www.pwc.com/us/en/services/consulting/cybersecurity-risk-regulatory/library/tech-regulatory-policy-developments/eu-ai-act.html
https://ai2.work/economics/eu-ai-act-high-risk-rules-hit-august-2026-your-compliance-countdown/
https://securiti.ai/eu-ai-act/article-9/
https://securiti.ai/eu-ai-act/article-15/
https://sitnik.ai/blog/5-steps-eu-ai-act-high-risk-compliance-2026/
https://www.aoshearman.com/en/insights/ao-shearman-on-tech/zooming-in-on-ai-10-eu-ai-act-what-are-the-obligations-for-high-risk-ai-systems
https://secureprivacy.ai/blog/eu-ai-act-implementation-guide
https://www.aiacto.eu/en/blog/documentation-technique-ai-act-article-11-annexe-iv
https://grc-docs.com/blogs/eu-ai-standard/eu-ai-act-annex-iv-technical-documentation-referred-to-in-article-111
https://www.artificial-intelligence-act.com/Artificial_Intelligence_Act_Article_11.html
https://www.kothes.com/en/blog/faq-eu-ai-regulation
https://pmc.ncbi.nlm.nih.gov/articles/PMC11965209/
https://www.glocertinternational.com/resources/guides/eu-ai-act-technical-documentation-article-11/
https://www.isms.online/iso-42001/eu-ai-act/article-12/
https://www.vde.com/topics-en/artificial-intelligence/blog/eu-ai-act--ai-system-logging
https://medium.com/@axel.schwanke/compliance-under-the-eu-ai-act-best-practices-for-monitoring-and-logging-e098a3d6fe9d
https://rgpd.com/ai-act/chapter-3-high-risk-ai-systems/article-12-record-keeping/
https://practical-ai-act.eu/latest/conformity/record-keeping/
https://practical-ai-act.eu/latest/conformity/accuracy-robustness-cybersecurity/
https://cleanaim.com/resources/ai-governance/eu-ai-act-article-12-compliance/
https://aiact.algolia.com/article-15/
https://arxiv.org/html/2502.16184v2
https://dl.acm.org/doi/10.1145/3715275.3732020
https://commonlawyer.substack.com/p/an-ai-act-article-a-day-15-accuracy
https://papers.ssrn.com/sol3/papers.cfm?abstract_id=5147196
https://www.tandfonline.com/doi/full/10.1080/17579961.2023.2245683
https://medium.com/coinmonks/eu-ai-act-article-14-understanding-human-oversight-5c2502136a24
https://newtech.law/en/articles/human-oversight-of-ai-systems
https://leg.colorado.gov/bills/sb24-205
https://content.leg.colorado.gov/sites/default/files/2024a_205_signed.pdf
https://trustarc.com/resource/colorado-ai-law-sb24-205-compliance-guide/
https://www.naag.org/attorney-general-journal/a-deep-dive-into-colorados-artificial-intelligence-act/
https://www.coloradosb205.com/
https://www.americanbar.org/groups/business_law/resources/business-law-today/2024-july/colorado-enacts-law-regulating-high-risk-artificial-intelligence-systems/
https://www.clarkhill.com/news-events/news/colorados-ai-law-delayed-until-june-2026-what-the-latest-setback-means-for-businesses/
https://almcorp.com/blog/colorado-ai-act-sb-205-compliance-guide/
https://stackcyber.com/posts/ai-colorado-laws
https://stackcyber.com/posts/ai-state-laws
https://fostergraham.com/2025/12/colorados-artificial-intelligence-act-what-businesses-need-to-know-about-sb-24-205/
https://www.nist.gov/itl/ai-risk-management-framework
https://nvlpubs.nist.gov/nistpubs/ai/nist.ai.100-1.pdf
https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.600-1.pdf
https://nvlpubs.nist.gov/nistpubs/ir/2025/NIST.IR.8596.iprd.pdf
https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.1270.pdf
https://airc.nist.gov/airmf-resources/playbook/
https://airc.nist.gov/airmf-resources/playbook/govern/
https://airc.nist.gov/airmf-resources/airmf/5-sec-core/
https://airc.nist.gov/docs/AI_RMF_Playbook.pdf
https://digital.nemko.com/regulations/nist-rmf
https://www.ispartnersllc.com/blog/nist-ai-rmf-2025-updates-what-you-need-to-know-about-the-latest-framework-changes/
https://www.ispartnersllc.com/hubs/nist-ai-rmf/core-functions/
https://elevateconsult.com/insights/nist-ai-risk-management-framework-a-builders-roadmap/
https://elevateconsult.com/insights/map-fedramp-iso-to-nist-ai-rmf/
https://www.veeam.com/blog/nist-ai-risk-management-framework-veeam-securiti-ai.html
https://digitalgovernmenthub.org/library/nist-ai-risk-management-framework-playbook/
https://www.dawgen.global/nist-ai-rmf-in-plain-english-govern-map-measure-manage-done-right/
https://www.iso.org/standard/42001
https://learn.microsoft.com/en-us/compliance/regulatory/offering-iso-42001
https://www.bsigroup.com/en-US/products-and-services/standards/iso-42001-ai-management-system/
https://aws.amazon.com/compliance/iso-42001-faqs/
https://kpmg.com/ch/en/insights/artificial-intelligence/iso-iec-42001.html
https://www.sgs.com/en-us/services/iso-iec-42001-certification-artificial-intelligence-ai-management-system
https://www.dnv.us/services/iso-42001---service/
https://pecb.com/en/education-and-certification-for-individuals/iso-iec-42001
https://anab.ansi.org/accreditation/iso-iec-42001-artificial-intelligence-management-systems/
https://genai.owasp.org/resource/owasp-top-10-for-agentic-applications-for-2026/
https://genai.owasp.org/2025/12/09/owasp-top-10-for-agentic-applications-the-benchmark-for-agentic-security-in-the-age-of-autonomous-ai/
https://genai.owasp.org/2025/12/09/owasp-genai-security-project-releases-top-10-risks-and-mitigations-for-agentic-ai-security/
https://genai.owasp.org/initiatives/agentic-security-initiative/
https://www.paloaltonetworks.com/blog/cloud-security/owasp-agentic-ai-security/
https://www.paloaltonetworks.com/cyberpedia/what-is-agentic-ai-governance
https://auth0.com/blog/owasp-top-10-agentic-applications-lessons/
https://www.practical-devsecops.com/owasp-top-10-agentic-applications/
https://www.aikido.dev/blog/owasp-top-10-agentic-applications
https://astrix.security/learn/blog/the-owasp-agentic-top-10-just-dropped-heres-what-you-need-to-know/
https://www.gravitee.io/blog/owasp-top-10-for-agentic-applications-2026-a-practical-review-and-how-gravitee-supports-secure-agentic-architecture
https://www.credo.ai/
https://www.credo.ai/product
https://www.credo.ai/blog/credo-ai-recognized-in-the-gartner-r-market-guide-for-ai-governance-platforms-2025
https://www.credo.ai/gartner-market-guide-for-ai-governance-platforms
https://www.credo.ai/lp/davos-2026
https://www.credo.ai/glossary/human-on-the-loop
https://oecd.ai/en/catalogue/tools/credo-ai-responsible-ai-governance-platform
https://www.splunk.com/en_us/blog/learn/ai-governance-platforms.html
https://atlan.com/ai-governance-tools/
https://www.reco.ai/compare/ai-governance-tools
https://www.clarifai.com/blog/ai-governance-tools
https://www.ibm.com/products/watsonx-governance
https://www.ibm.com/solutions/ai-governance
https://www.ibm.com/docs/en/software-hub/5.1.x?topic=services-ai-factsheets
https://www.ibm.com/think/insights/accountability-gap-autonomous-ai
https://www.ibm.com/think/topics/human-in-the-loop
https://www.ibm.com/think/insights/2026-resolutions-for-ai-and-technology-leaders
https://www.ibm.com/new
https://research.ibm.com/blog/aifactsheets
https://rai-toolkit.github.io/technology/technical%20tool/IBM-AI-AI-FactSheets-360/
https://www.microsoft.com/en-us/ai/tools-practices
https://www.microsoft.com/en-us/ai/principles-and-approach
https://newsroom.ibm.com/blog-ibm-consulting-advantage-integrates-with-microsoft-copilot-to-drive-smarter,-faster-workflows-with-enterprise-ai
https://www.holisticai.com/
https://www.onetrust.com/solutions/ai-governance/
https://www.collibra.com/products/ai-governance
https://domino.ai/platform/ai-governance
https://zenity.io/
https://zenity.io/platform
https://zenity.io/platform/ai-observability
https://zenity.io/platform/ai-security-posture-management
https://zenity.io/use-cases/business-needs/ai-agents-compliance
https://zenity.io/use-cases/risk-type/shadow-ai
https://zenity.io/use-cases/agent-type/device-based
https://zenity.io/blog/security/governing-agentic-ai
https://zenity.io/company-overview/newsroom/company-news/zenity-expands-ai-security-with-incident-intelligence-agentic-browser-support-and-new-open
https://www.businesswire.com/news/home/20251204892848/en/Zenity-Expands-AI-Security-with-Incident-Intelligence-Agentic-Browser-Support-and-New-Open-Source-Tool
https://www.ewsolutions.com/agentic-ai-governance/
https://www.ewsolutions.com/top-ai-governance-software-platforms-in-2025-and-beyond/
https://www.mindinventory.com/blog/agentic-ai-governance/
https://www.mckinsey.com/capabilities/risk-and-resilience/our-insights/trust-in-the-age-of-agents
https://www.mckinsey.com/capabilities/quantumblack/our-insights/seizing-the-agentic-ai-advantage
https://www.mckinsey.com/capabilities/people-and-organizational-performance/our-insights/the-agentic-organization-contours-of-the-next-paradigm-for-the-ai-era
https://www.mckinsey.com/~/media/mckinsey/business%20functions/quantumblack/our%20insights/seizing%20the%20agentic%20ai%20advantage/seizing-the-agentic-ai-advantage.pdf
https://www.commbox.io/blog/mckinseys-new-report-on-agentic-ai-why-trust-defines-success/
https://machinelearningmastery.com/7-agentic-ai-trends-to-watch-in-2026/
https://samta.ai/blogs/agentic-ai-governance-framework
https://www.nexastack.ai/blog/agent-governance-at-scale
https://www.nexastack.ai/blog/model-cards-ai-fact-sheets
https://law-ai.org/automated-compliance-and-the-regulation-of-ai/
https://ijaibdcms.org/index.php/ijaibdcms/article/view/315
https://www.techtarget.com/searchenterpriseai/feature/Agentic-AI-compliance-and-regulation-What-to-know
https://vodworks.com/blogs/ai-compliance/
https://www.redhat.com/en/blog/how-red-hat-openshift-ai-simplifies-trust-and-compliance
https://www.redhat.com/en/blog/security-beyond-model-introducing-ai-system-cards
https://www.thefai.org/posts/regulatory-reform-for-ai-and-autonomy
https://www.wiz.io/academy/ai-security/ai-compliance
https://www.metricstream.com/blog/future-of-compliance-ai-and-automation.html
https://delve.co/learn/grc/ai-transforming-grc-compliance
https://informationmatters.org/2025/12/governance-as-code-how-ai-is-enforcing-information-policies-directly-in-the-tech-stack/
https://www.kyndryl.com/us/en/about-us/news/2026/02/policy-as-code-ai
https://www.ethyca.com/news/how-to-govern-data-and-ai-with-a-policy-as-code-approach
https://platformengineering.org/blog/policy-as-code
https://github.com/davidcrowe/openclaw-gatewaystack-governance
https://air-governance-framework.finos.org/
https://github.com/finos/ai-governance-framework
https://www.finos.org/blog/finos-ai-governance-framework-v1.0-turning-drafts-into-deployable-guardrails
https://www.finos.org/blog/finos-ai-governance-framework-v2.0-addressing-agentic-ai-risks-in-a-rapidly-evolving-landscape
https://www.finos.org/press/global-financial-institutions-and-technology-leaders-collaborate-under-finos-to-launch-open-source-common-controls-for-ai-services
https://www.finos.org/press/ai-governance-framework-release
https://www.finos.org/ai
https://www.finos.org/hosted-events/2026-04-13-open-sdlc-controls-framework-for-financial-services-workshop
https://control-plane.io/publications/finos-ai-governance/
https://github.com/topics/ai-governance
https://dev.to/debmckinney/best-platforms-for-ai-governance-guardrails-policy-enforcement-and-compliance-4dpd
https://prefactor.tech/blog/audit-trails-in-ci-cd-best-practices-for-ai-agents
https://www.dynatrace.com/news/blog/the-rise-of-agentic-ai-part-7-introducing-data-governance-and-audit-trails-for-ai-services/
https://www.ovaledge.com/blog/ai-powered-open-source-data-governance-tools
https://www.superblocks.com/blog/ai-governance-platform
https://cobbai.com/blog/ai-audit-trails-support
https://www.swept.ai/ai-audit-trail
https://intuitionlabs.ai/articles/audit-trail-requirements-ai-gxp-compliance
https://censinet.com/perspectives/ai-in-audit-trails-monitoring-data-usage
https://medium.com/@kuldeep.paul08/the-ai-audit-trail-how-to-ensure-compliance-and-transparency-with-llm-observability-74fd5f1968ef
https://resources.rework.com/libraries/ai-terms/ai-audit-trail
https://www.adopt.ai/glossary/audit-trails-for-agents
https://galileo.ai/blog/ai-agent-compliance-governance-audit-trails-risk-management
https://www.lucid.now/blog/how-ai-simplifies-audit-trail-documentation/
https://law.co/blog/legal-ai-audit-trails-designing-for-traceability
https://www.cerbos.dev/news/securing-ai-agents-model-context-protocol
https://www.straiker.ai/solution/security-for-agent-tool-interactions
https://www.truefoundry.com/blog/enterprise-ai-security-with-mcp-gateway-runtime-guardrails
https://github.com/atlassian/atlassian-mcp-server/issues/90
https://snyk.io/blog/future-of-ai-agent-security-guardrails/
https://portkey.ai/blog/securing-mcp-to-deliver-enterprise-grade-agentic-ai-protection/
https://www.strata.io/agentic-identity-sandbox/securing-mcp-servers-at-scale-how-to-govern-ai-agents-with-an-enterprise-identity-fabric/
https://www.reco.ai/hub/guardrails-for-ai-agents
https://www.integrate.io/blog/best-mcp-gateways-and-ai-agent-security-tools/
https://www.cequence.ai/blog/ai/agentic-ai-security-guardrails/
https://www.anthropic.com/transparency
https://www.anthropic.com/system-cards
https://www.anthropic.com/transparency/model-report
https://www.anthropic.com/claude-opus-4-5-system-card
https://www.anthropic.com/claude-4-system-card
https://anthropic.com/claude-3-7-sonnet-system-card
https://crfm.stanford.edu/fmti/December-2025/company-reports/Anthropic_FinalReport_FMTI2025.html
https://lawgorithm.blog/2025/05/26/ai-system-cards-anthropics-example/
https://devops-geek.net/devops-lab/claude-sonnet-4-6-system-card-what-devops-engineers-need-to-know-about-ai-model-transparency/
https://hoeijmakers.net/model-cards-system-cards/
https://openai.com/index/gpt-5-system-card/
https://openai.com/index/gpt-oss-model-card/
https://deepmind.google/models/model-cards/
https://2b-advice.com/en/2025/09/16/model-cards-thats-why-model-cards-are-so-important-for-ki-documentation/
https://www.promptfoo.dev/blog/ai-regulation-2025/
https://developer.nvidia.com/blog/enhancing-ai-transparency-and-ethical-considerations-with-model-card/
https://www.scitepress.org/Papers/2025/137066/137066.pdf
https://www.lathropgpm.com/insights/liability-considerations-for-developers-and-users-of-agentic-ai-systems/
https://rsisinternational.org/journals/ijrsi/uploads/vol12-iss12-pg547-612-202601_pdf.pdf
https://rsisinternational.org/journals/ijrsi/view/when-ai-agents-act-governance-accountability-and-strategic-risk-in-autonomous-organizations
https://www.trmlabs.com/resources/blog/autonomous-ai-agents-and-financial-crime-risk-responsibility-and-accountability
https://www.credo.ai/recourseslongform/from-assistant-to-agent-navigating-the-governance-challenges-of-increasingly-autonomous-ai
https://arxiv.org/html/2501.09674v1
https://arxiv.org/html/2509.22717v1
https://ourtake.bakerbotts.com/post/102me2l/when-ai-agents-misbehave-governance-and-security-for-autonomous-ai
https://humansintheloop.org/
https://hai.stanford.edu/news/humans-loop-design-interactive-ai-systems
https://en.wikipedia.org/wiki/Human-in-the-loop
https://labelyourdata.com/articles/human-in-the-loop-in-machine-learning
https://www.pingidentity.com/en/resources/blog/post/human-in-the-loop-ai.html
https://encord.com/blog/human-in-the-loop-ai/
https://www.serco.com/na/media-and-news/2025/human-in-the-loop-vs-human-on-the-loop-navigating-the-future-of-ai
https://www.splunk.com/en_us/blog/learn/human-in-the-loop-ai.html
https://www.gartner.com/en/documents/7145930
https://www.gartner.com/en/newsroom/press-releases/2026-02-17-gartner-global-ai-regulations-fuel-billion-dollar-market-for-ai-governance-platforms
https://www.gartner.com/reviews/market/ai-governance-platforms
https://www.gartner.com/en/newsroom/press-releases/2025-12-17-gartner-identifies-the-companies-to-beat-in-the-ai-vendor-race
https://finance.yahoo.com/news/modelop-recognized-2025-gartner-market-181000640.html
https://airia.com/2025-market-guide-for-ai-governance-platforms/
https://trustible.ai/post/trustible-recognized-in-the-2025-gartner-market-guide-for-ai-governance-platforms/
https://coralogix.com/platform/ai-observability/cost-tracking/
https://www.statsig.com/perspectives/tokenusagetrackingcontrollingaicosts
https://www.deloitte.com/us/en/insights/topics/emerging-technologies/ai-tokens-how-to-navigate-spend-dynamics.html
https://www.logicmonitor.com/blog/ai-workload-cost-optimization
https://wrangleai.com/blog/ai-governance-and-cost-control/
https://www.prompts.ai/blog/top-ai-platforms-managing-ai-token-level-usage-costs-1afca
https://portkey.ai/blog/ai-cost-observability-a-practical-guide-to-understanding-and-managing-llm-spend/
https://www.traceloop.com/blog/from-bills-to-budgets-how-to-track-llm-token-usage-and-cost-per-user
https://www.mavvrik.ai/ai-cost-governance-report/
https://www.prompts.ai/en/blog/top-ai-solutions-track-token-usage-spending
https://cppa.ca.gov/announcements/2025/20250923.html
https://cppa.ca.gov/regulations/ccpa_updates.html
https://www.cdflaborlaw.com/blog/california-finalizes-ai-regulations-for-automated-decision-making-technology
https://www.skadden.com/insights/publications/2025/10/california-finalizes-cppa-regulations
https://www.littler.com/news-analysis/asap/californias-long-awaited-final-regulations-automated-decisionmaking-create-new
https://www.wsgr.com/en/insights/cppa-approves-new-ccpa-regulations-on-ai-cybersecurity-and-risk-governance-and-advances-updated-data-broker-regulations.html
https://www.nelsonmullins.com/insights/blogs/ai-task-force/ai/california-finalizes-ccpa-regulation-amendments-new-compliance-obligations-for-cybersecurity-risk-assessments-and-automated-decision-making
https://ogletree.com/insights-resources/blog-posts/california-finalizes-groundbreaking-regulations-on-ai-risk-assessments-and-cybersecurity-part-iii-risk-assessments/
https://www.wiley.law/alert-California-Finalizes-Pivotal-CCPA-Regulations-on-AI-Cyber-Audits-and-Risk-Governance
https://www.alston.com/en/insights/publications/2025/10/ccpa-cybersecurity-audits-admt-risk-assessments
https://www.bakerbotts.com/thought-leadership/publications/2026/january/us-ai-law-update
https://www.kslaw.com/news-and-insights/new-state-ai-laws-are-effective-on-january-1-2026-but-a-new-executive-order-signals-disruption
https://drata.com/blog/artificial-intelligence-regulations-state-and-federal-ai-laws-2026
https://iapp.org/resources/article/us-state-ai-governance-legislation-tracker
https://www.mwe.com/insights/white-house-eo-moves-to-restrict-state-ai-legislation/
https://www.bakerbotts.com/thought-leadership/publications/2026/january/ai-legal-watch---january
https://natlawreview.com/article/2026-outlook-artificial-intelligence
https://ai-law-center.orrick.com/us-ai-law-tracker-see-all-states/
https://www.rila.org/blog/2025/09/ai-legislation-across-the-states-a-2025-end-of-ses
https://www.venable.com/insights/publications/2026/02/agentic-ai-is-here-legal-compliance-and-governance
https://www.mayerbrown.com/en/insights/publications/2026/02/governance-of-agentic-artificial-intelligence-systems
https://aisera.com/blog/agentic-ai-compliance/
https://papers.ssrn.com/sol3/papers.cfm?abstract_id=5652350
https://alhena.ai/blog/ai-agents-agentic-ai/
https://www.cio.com/article/4105490/overcome-governance-and-trust-issues-to-drive-agentic-ai.html
https://axis-intelligence.com/agentic-ai-2026-definitive-enterprise-guide/
https://www.salesmate.io/blog/future-of-ai-agents/
https://www.blueprism.com/resources/blog/future-ai-agents-trends/
https://www.chapman.edu/ai/bias-in-ai.aspx
https://research.aimultiple.com/ai-bias/
https://pmc.ncbi.nlm.nih.gov/articles/PMC8830968/
https://www.crescendo.ai/blog/ai-bias-examples-mitigation-guide
https://onix-systems.com/blog/ai-bias-detection-and-mitigation
https://www.nature.com/articles/s41599-023-02079-x
https://testrigor.com/blog/ai-model-bias/
https://pmc.ncbi.nlm.nih.gov/articles/PMC11897215/
https://galileo.ai/blog/bias-ai-models-systems
```

---

## Open Questions

1. **Which EU AI Act risk classification applies to Sherpa's customers?** The Act distinguishes between provider (developer) and deployer obligations. Sherpa as a framework would be a "provider" of a governance tool — but its customers deploy AI systems that may be classified as high-risk. What documentation obligations cascade?

2. **Does Sherpa's filesystem-based audit trail meet tamper-resistance requirements?** EU AI Act Article 12 demands tamper-resistant logging with cryptographic verification. Git's content-addressable storage provides some integrity guarantees, but is it sufficient? Append-only JSONL with hashing may be needed.

3. **How should policy-as-code integrate with behavioral agent definitions?** Current `.claude/rules/` are advisory. Enforcement requires a runtime evaluation layer. Should this be OPA/Rego, a simpler YAML policy DSL, or an extension of the behavioral definition format?

4. **What is the minimum viable compliance documentation set?** Annex IV demands 9 sections of documentation. How much can be auto-generated from existing initiative metadata, activity logs, and behavioral definitions? What requires new human-authored content?

5. **Does the federal preemption executive order change the calculus?** If the Commerce Department evaluates state AI laws and issues binding guidance, the fragmented state-by-state compliance picture could simplify dramatically. But legal challenges may take years.

6. **What does "reasonable care" mean for a framework provider?** Colorado's standard is deliberately vague. Does providing governance tools constitute reasonable care for Sherpa's customers, or must the framework also enforce specific controls?

7. **How do OWASP ASI07 (insecure inter-agent communication) requirements apply to MCP-based agent coordination?** Sherpa's MCP server enables agent coordination. Does mutual TLS, signed payloads, and authenticated discovery become a framework requirement?

8. **What bias monitoring hooks are technically feasible for a framework-level tool?** Sherpa cannot monitor the outputs of arbitrary AI models. But it can provide the instrumentation for customers to plug in bias detection. What's the right abstraction boundary?

9. **Is ISO 42001 certification a viable differentiator?** The certification is relatively new and the audit ecosystem is still forming. Early certification could position Sherpa customers for regulatory readiness.

10. **How does the FINOS AI Governance Framework v2.0 agentic risk catalogue map to Sherpa's existing governance primitives?** FINOS has 46 risks cross-referenced to OWASP/MITRE/EU AI Act. This could serve as a compliance checklist for Sherpa.
