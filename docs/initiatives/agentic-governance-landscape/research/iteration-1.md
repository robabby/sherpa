# Iteration 1 — 2026-03-17

## Findings

### Vector 1: Cloud Provider Governance Stacks
**Question:** What agent governance do AWS, Google Cloud, and Azure offer as of early 2026?
**Full report:** [iteration-1/vector-1-cloud-provider-governance.md](iteration-1/vector-1-cloud-provider-governance.md)

- **Microsoft Agent 365** (GA May 2026) is the most comprehensive: Entra Agent ID gives agents directory identities with conditional access, Purview integration covers 12 compliance capabilities treating agents like users, Defender provides real-time threat detection. Per-user licensing.
- **AWS Bedrock AgentCore** takes a modular-primitives approach: nine independently priced services including **Cedar-based real-time policy enforcement** with natural language authoring. $200 free tier. Cross-model support including OpenAI and Gemini.
- **Google Cloud Agent Engine** is most framework-agnostic (ADK, LangChain, LangGraph, CrewAI) but governance features are in Preview, not GA. Relies on existing GCP services (IAM, VPC-SC, Cloud Logging) rather than a dedicated governance product.

**Implications:** All three enforce *what agents can access* (identity, network, data). None define *what agents should do* (behavioral constraints, quality gates). Sherpa's convention layer is complementary, not competitive.

### Vector 2: Startup Funding & Traction
**Question:** Who's raised money for agent governance, and what traction signals exist?
**Full report:** [iteration-1/vector-2-startup-funding-traction.md](iteration-1/vector-2-startup-funding-traction.md)

- **$1.5B+ combined known funding** across catalogued governance vendors. The category is real.
- **$2.6B+ in governance acquisitions** (2024-2025): Lakera→Check Point ($300M), Robust Intelligence→Cisco (~$400M), CalypsoAI→F5 ($180M), Securiti→Veeam ($1.725B). **Cybersecurity incumbents buy rather than build.**
- **Fastest-growing:** Galileo (834% revenue growth 2024), Credo AI ($101M valuation, tripled revenue), Zenity (Gartner Cool Vendor in Agentic AI TRiSM).
- **New entrants:** JetStream Security ($34M seed, CrowdStrike pedigree), Kai ($125M, agent cybersecurity), Defakto ($50M total, non-human identity management).
- **Microsoft ecosystem dominance:** M12 invested in Zenity and Arize. Zenity, AvePoint, Credo AI, OneTrust all deeply integrated with Microsoft stack.

**Implications:** The standalone governance vendor may be transitional — incumbents absorb them. Developer-facing governance has zero funded competitors. The enterprise platform market is crowded; the developer-tool market is empty.

### Vector 3: Open-Source Agent Governance
**Question:** What open-source governance projects exist, and how do major frameworks handle governance natively?
**Full report:** [iteration-1/vector-3-open-source-governance.md](iteration-1/vector-3-open-source-governance.md)

- **Microsoft Agent Governance Toolkit** is the most comprehensive open-source entry — covers all 10 OWASP Agentic Top 10 controls, integrates with 12+ frameworks, uses OPA/Rego and Cedar.
- **Galileo Agent Control** (Apache 2.0, Mar 2026) — open-source control plane for "write policies once, deploy anywhere."
- **Framework-native governance is thin:** CrewAI has RBAC only in commercial tier (AMP). LangGraph has custom-code auth. AutoGen v0.4 has regex+LLM guardrails but no audit (open issue #6017). OpenAI SDK has input/output guardrails + tracing. LlamaIndex has nothing native.
- **The claim "no major framework ships formal RBAC" is still largely true** for open-source versions.
- **MCP has minimal governance semantics** — no tool-level permissions, no agent identity, no audit trail spec. Gateways (Kong, Strata) are the interim mechanism.

**Implications:** The behavioral governance layer (disposition, quality bar, fail triggers, initiative lifecycle) is empty in every framework and tool. Sherpa's convention-based approach has no open-source competitor.

### Vector 4: Buyer Demand Signals
**Question:** Who's buying governance, what triggers a purchase, and what do they look for?
**Full report:** [iteration-1/vector-4-buyer-demand-signals.md](iteration-1/vector-4-buyer-demand-signals.md)

- **82% of enterprises cite governance as #1 blocker to scaling AI agents** (IBM CEO Study, 2,000 CEOs). Only 21% have mature governance despite 75% planning agent deployment within 2 years (Deloitte, 3,235 leaders).
- **Incidents drive urgency faster than regulation:** 51% report negative AI incidents in past year. Shadow AI adds $670K per breach. 97% of breached organizations lacked access controls.
- **Agent sprawl is the new shadow IT:** 3M+ corporate agents, only 47% monitored. 98% report unsanctioned AI use.
- **CAIO is the emerging buyer:** 26-61% of enterprises now have the role. Federal mandate in all US agencies.
- **Governance ROI is provable:** 27% efficiency gains, 34% higher operating profit, 12x more AI projects reach production.
- **Five buyer personas:** CAIO (board mandate), CISO (breach response), CTO/VP Engineering (production incidents), Compliance/Legal (regulatory deadline), Government CIO (federal mandate).

**Implications:** Developer teams (90% using AI, only 32% with governance policies) are the underserved segment. Convention-based governance fits developer-first adoption (like linters and CI tools), not CISO platform purchases.

### Vector 5: Coding Agent Governance
**Question:** What governance exists specifically for coding agents (Cursor, Copilot, Devin, Claude Code)?
**Full report:** [iteration-1/vector-5-coding-agent-governance.md](iteration-1/vector-5-coding-agent-governance.md)

- **Cursor has the most mature governance stack:** hooks system (6+ lifecycle points), enforced Team Rules, SIEM-streamed audit logs, AI code attribution (Agent Trace spec). Security partner ecosystem.
- **GitHub Copilot has enterprise admin governance but critical agent-mode gaps:** content exclusions and custom instructions **not honored in Agent and Edit modes** — the most autonomous modes have the fewest controls.
- **Claude Code governance is convention-based:** CLAUDE.md + .claude/rules/ + hooks + managed policies. Community patterns show 90%+ behavioral compliance (up from ~25% baseline).
- **No coding agent provides cross-agent governance.** Every vendor's governance is siloed. This is Sherpa's strategic opening.
- **AI code provenance is emerging as mandatory:** EU AI Act Article 50 (enforceable August 2026) requires machine-readable marking of AI output. Cursor Agent Trace, Git AI, and AI Provenance Protocol are competing approaches.

**Implications:** Sherpa as a cross-agent governance layer — behavioral constraints, initiative lifecycle, and quality gates that work regardless of which IDE/agent is used.

## Synthesis

Five cross-cutting patterns emerged from this iteration:

### 1. The Three-Layer Governance Stack Is Forming

The market is naturally segmenting into three governance layers, each with different buyers, vendors, and enforcement mechanisms:

| Layer | What It Does | Who Provides | Who Buys | Sherpa? |
|-------|-------------|-------------|----------|---------|
| **Infrastructure** | Identity, access, network, runtime sandboxing | Cloud providers (AWS, Azure, GCP), security platforms (Check Point, Cisco) | CISO, IT | No |
| **Compliance** | Audit trails, regulatory mapping, risk assessment, certifications | Governance platforms (Credo AI, OneTrust, Holistic AI), Big Four | CAIO, Compliance | No |
| **Behavioral** | What agents should do, quality standards, lifecycle management, convention enforcement | Nobody. Sherpa. | CTO, Engineering | **Yes** |

This is the single most important finding. Sherpa doesn't compete with the $1.5B in funded governance platforms because they occupy different layers. The behavioral layer is genuinely empty.

### 2. Convention-Based Governance Is a Novel Enforcement Model

Every catalogued vendor implements governance as either:
- **Platform** — centralized dashboard, admin-configured policies (OneTrust, Credo AI, Agent 365)
- **Runtime** — inline interception, guardrails, sandboxing (Lakera, AWS Guardrails, OPA)
- **SDK** — library calls, decorators, middleware (OpenAI SDK, CrewAI guardrails)

Sherpa implements governance as **convention** — filesystem artifacts (CLAUDE.md, rules, behavioral definitions) that are version-controlled, mergeable, and reviewable. This is structurally different and has no competitor. The closest analog is how ESLint governs JavaScript quality through convention files — not through a platform or runtime.

### 3. The Acquisition Pattern Predicts Category Consolidation

$2.6B in acquisitions in 18 months (Lakera, Robust Intelligence, CalypsoAI, Securiti). All acquisitions were by cybersecurity/infrastructure incumbents. This means:
- Standalone governance vendors are proving the category then getting absorbed
- Long-term, governance becomes a feature of existing platforms, not a standalone product
- Sherpa's positioning as a framework (not a platform) may be more durable than a SaaS governance product

### 4. Developer Teams Are the Underserved Governance Buyer

Enterprise governance platforms target CISOs and CAIOs. But the data shows 90% of developers use AI coding tools with only 32% having governance policies. The gap is at the development team level, where:
- Git history is a natural audit trail
- Code review is a natural quality gate
- Convention files (.eslintrc, .prettierrc, CLAUDE.md) are familiar enforcement mechanisms
- $0 cost matters (no per-seat governance platform budget)

This is exactly where convention-based governance wins. It's the developer-facing governance tool, adopted bottom-up like linters and CI tools.

### 5. Cross-Agent Governance Is the Unmet Need

Every coding agent (Cursor, Copilot, Claude Code, Devin) has its own governance silo. Cursor hooks don't apply to Claude Code sessions. Copilot policies don't restrict Windsurf. Enterprises using 3+ coding agents have no unified governance. Sherpa's position as an agent-agnostic governance layer — conventions that work regardless of which agent reads them — addresses this directly.

## Proposals Generated

Updated `docs/initiatives/agentic-governance-landscape/proposal.md` — refined scope based on iteration 1 findings. Key updates:
- Corrected the claim "no governance tooling exists" → "no behavioral/convention-based governance tooling exists"
- Added three-layer governance stack framing
- Strengthened positioning rationale with funding and acquisition data

## Open Questions for Next Iteration

1. **How does convention-based governance compose with runtime enforcement?** Sherpa defines *what agents should do*; cloud platforms enforce *what they can access*. What does the integration surface look like? Can behavioral conventions export as Cedar policies or OPA rules?
2. **What is the developer-first adoption path for governance?** ESLint succeeded through PLG. Can governance conventions follow the same adoption curve? What triggers a developer team to adopt governance (incident, scale, regulatory, cultural)?
3. **How do enterprises govern multi-agent workflows where agents span tools?** A Cursor agent writes code, a Claude Code agent reviews it, a Devin agent deploys it. Who governs the workflow? What conventions span agents?
4. **What is the AI code provenance standard likely to be?** Cursor Agent Trace, Git AI, Tabnine Provenance, and AI Provenance Protocol are competing. EU AI Act Article 50 creates August 2026 deadline. Which approach wins?
5. **How does the CAIO role evolve?** 26-61% of enterprises have one now. Is the CAIO a governance buyer (platform) or a governance enabler (frameworks for teams)? This determines Sherpa's enterprise go-to-market.
