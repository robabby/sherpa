---
radar: 2026-03-18
domain: "Agentic governance tools, frameworks, standards, and approaches for Sherpa's positioning and integration"
items-classified: 28
adopt: 5
trial: 7
assess: 9
hold: 7
reassess-by: 2026-06-18
---

# Agentic Governance Radar

> **Domain:** Tools, frameworks, standards, and approaches across the agentic governance landscape — classified by what Sherpa should use now, experiment with, monitor, or avoid.
>
> **Why now:** The stress test (2026-03-18) refuted three load-bearing assumptions and revised the thesis. This radar operationalizes the revised position: Sherpa's value is in the *integration* layer (making conventions executable, enforceable, and lifecycle-managed across agents), not the convention file format itself. Classifications reflect Sherpa's strategic context, not universal recommendations.
>
> **Reassess:** Q3 2026, or immediately upon any convergence signal (Agent 365 GA, AGENTS.md AAIF expansion, Claude Code governance expansion).

---

## Adopt

Items to integrate into current work. Evidence supports them. Low risk.

### 1. Claude Code Hooks (PreToolUse / PostToolUse)

Claude Code's hook system provides deterministic enforcement at six lifecycle points. The stress test's most critical finding was "rules in prompts are requests, hooks in code are laws" — and Sherpa has zero hooks configured. Hooks are the minimum bar for the governance thesis to be credible. Community patterns show hooks + conventions achieve 90%+ behavioral compliance vs. ~25% baseline with conventions alone. **This is the single highest-priority action item from the entire research initiative.**

Ring: **Adopt** (new). Key consideration: Start with PreToolUse hooks for the most critical governance rules — shared artifact protection, authority checks for dispatched agents, dangerous operation guards.

### 2. AGENTS.md Standard

Convention file standard with 60,000+ repos, now under the Linux Foundation's Agentic AI Foundation with every major AI lab as a member. Read natively by Cursor, Copilot, Claude Code, Codex, and others. The format is being commoditized — Sherpa should participate in the standard rather than compete with it. Sherpa's CLAUDE.md + .claude/rules/ conventions are a superset of AGENTS.md and should remain compatible.

Ring: **Adopt** (new). Key consideration: Ensure Sherpa's convention system can export/generate AGENTS.md files so Sherpa-governed projects work with any agent. Consider contributing behavioral governance extensions to the AAIF.

### 3. Snyk GTM Playbook (Developer Adopt, Enterprise Sell)

The stress test conclusively refuted pure bottom-up adoption for governance. Snyk is the definitive case study: 300K+ developers adopted bottom-up, but the self-serve paid plan failed. Revenue required enterprise sales targeting the actual buyers (security leaders). For Sherpa: developers adopt the collaboration framework because it makes their work better; governance artifacts emerge as a byproduct; CAIOs/CTOs purchase because they get the governance data they need.

Ring: **Adopt** (new). Key consideration: The pitch to developers is "structured collaboration that produces better outcomes." The pitch to buyers is "governance evidence from development workflows." Never lead with governance to developers.

### 4. Cross-Agent Portability as Moat

The stress test refuted first-mover advantage as temporal but confirmed cross-agent portability as a structural moat. Microsoft won't govern Claude. Anthropic won't govern Cursor. Every coding agent's governance is siloed. Conventions that work regardless of agent — and a framework that makes them enforceable across backends — is the one advantage platform vendors are disincentivized to replicate.

Ring: **Adopt** (new). Key consideration: Every architectural decision should be tested against "does this work with Cursor, Claude Code, Copilot, and Devin?" If it only works with one agent, it's a feature, not a moat.

### 5. Defense-in-Depth Governance Architecture

The stress test proved conventions alone achieve <30% perfect instruction adherence in complex scenarios. The market has converged on defense-in-depth: conventions (intent) + hooks (enforcement) + permissions (access control) + audit (accountability). Sherpa needs all four layers, not just the first. The analogy: CLAUDE.md is the policy; hooks are the firewall; permissions are IAM; git history is the audit trail.

Ring: **Adopt** (new). Key consideration: Prioritize layers by risk. Dispatched autonomous agents need all four. Human+AI collaborative sessions can rely more heavily on conventions + human oversight.

---

## Trial

Promising approaches to spike before committing. Each has a defined test.

### 6. OPA/Rego for Policy Enforcement

Open Policy Agent is the de facto standard for policy-as-code. AWS AgentCore uses Cedar (a competing language). Microsoft Agent Governance Toolkit uses OPA/Rego. Both achieve sub-millisecond evaluation. OPA is CNCF graduated, battle-tested, and framework-agnostic. For Sherpa: behavioral conventions could compile to OPA policies, providing the deterministic enforcement layer that conventions lack.

Ring: **Trial** (new). Spike test: Can Sherpa's behavioral role definitions (disposition, quality-bar, fail triggers) be expressed as Rego policies? What's the developer ergonomics of maintaining both convention files and compiled policies?

### 7. Cloud Security Alliance Agentic Trust Framework (ATF)

Open governance spec applying Zero Trust principles to AI agents. Five elements: identity management, behavioral monitoring, data governance, segmentation, incident response. Creative Commons licensed. The only industry framework that addresses behavioral monitoring as a governance primitive — aligned with Sherpa's approach.

Ring: **Trial** (new). Spike test: Map Sherpa's governance model to ATF's five elements. Where does Sherpa provide coverage? Where are gaps? Could Sherpa claim ATF alignment as a positioning signal?

### 8. MCP Gateways (Kong, Strata) for Tool Governance

MCP itself has minimal governance semantics (no tool-level permissions, no agent identity, no audit trail spec). MCP gateways provide the interim enforcement layer — filtering, rate-limiting, and auditing tool calls. Multiple vendors (Zenity, JetStream) reference MCP governance as a pain point.

Ring: **Trial** (new). Spike test: Can Sherpa's MCP server integrate gateway-style policy enforcement for dispatched agents? What's the overhead? Does it compose with hooks?

### 9. Agent Cards as Governance Artifact

Model cards (purpose, limitations, performance) are an established AI governance artifact. The consulting-disruption-signals research proposed "Agent Cards" as the behavioral equivalent: role slug, disposition, quality bar, domain scope, fail triggers, operational history, last Judge results. EU AI Act Annex IV's 9 required documentation sections parallel initiative lifecycle artifacts.

Ring: **Trial** (new). Spike test: Define the Agent Card schema. Generate one from an existing behavioral role definition. Does it produce compliance-useful documentation? Would an auditor accept it?

### 10. Galileo Agent Control

Open-source (Apache 2.0) governance control plane. "Write policies once, deploy anywhere." Partnerships with CrewAI, Glean, Cisco AI Defense. The positioning is close to what Sherpa does but at the runtime enforcement layer, not the convention layer. Potential integration point rather than competitor.

Ring: **Trial** (new). Spike test: Can Galileo serve as the runtime enforcement complement to Sherpa's convention layer? Does the "write once deploy anywhere" model compose with Sherpa's convention-as-code?

### 11. Singapore IMDA Model Governance Framework

World's first national governance framework for agentic AI (Jan 2026, Davos). Four dimensions: risk bounding, human accountability, technical controls, end-user responsibility. Voluntary but setting the template globally. Other jurisdictions will likely follow.

Ring: **Trial** (new). Spike test: Map Sherpa's governance model to IMDA's four dimensions. Can Sherpa-governed projects claim framework alignment? Is this useful for consulting clients in regulated industries?

### 12. Compliance Artifact Export

The consulting-disruption-signals research identified a "bridge opportunity": convention-based artifacts (behavioral definitions, quality gate results, Judge evaluations, activity logs) are exactly the operational evidence compliance platforms need but can't generate. The demand research confirms auditors want operational evidence, not policy documents.

Ring: **Trial** (new). Spike test: Define export formats for git audit trails, initiative lifecycle data, and Judge results that map to EU AI Act Annex IV sections. Would this be a sellable integration for compliance platforms?

---

## Assess

Interesting but unproven. Monitor, don't invest yet.

### 13. Microsoft Agent 365

Most comprehensive enterprise offering. GA May 2026. Entra Agent ID, Purview integration (12 compliance capabilities), Defender threat detection, agent blueprints. Per-user licensing bundled with M365. The blueprint system is the closest any platform vendor comes to behavioral governance. **Key convergence signal to monitor.**

Ring: **Assess** (new). Reassess trigger: Agent 365 GA (May 1, 2026). If blueprints expand into development-time behavioral conventions, this moves to Hold (direct competitor absorbing the layer).

### 14. AWS Bedrock AgentCore

Nine modular services with Cedar-based policy enforcement. $200 free tier. Cross-model support. The Policy service provides natural language → Cedar policy authoring. Infrastructure-layer governance, not behavioral — complementary to Sherpa, not competitive.

Ring: **Assess** (new). Reassess trigger: If Cedar becomes the de facto agent policy language, Sherpa may need to compile conventions to Cedar rather than (or in addition to) OPA/Rego.

### 15. Microsoft Agent Governance Toolkit (Open Source)

MIT-licensed middleware covering all 10 OWASP Agentic Top 10. OPA/Rego + Cedar. Integrates with 12+ frameworks. Sub-millisecond overhead. The most comprehensive open-source governance entry. Could serve as Sherpa's enforcement backend — or could absorb Sherpa's niche if it adds behavioral conventions.

Ring: **Assess** (new). Reassess trigger: Does Microsoft add convention-based behavioral governance to the toolkit? If so, it moves toward a competitive threat. If it stays at the runtime layer, it's a potential integration target.

### 16. Cursor Agent Trace / AI Code Provenance

Agent Trace (RFC v0.1.0, Jan 2026) proposes an open standard for AI code attribution. EU AI Act Article 50 (enforceable Aug 2026) requires machine-readable marking of AI output. Competing approaches: Git AI, Tabnine Provenance, AI Provenance Protocol. Standard not yet settled.

Ring: **Assess** (new). Reassess trigger: Which provenance standard gains adoption by mid-2026? This affects whether Sherpa needs provenance tracking in its governance model.

### 17. Credo AI

$101M valuation, $41.3M raised, customers include Mastercard, Cisco, PepsiCo. Named in Gartner's 2025 Market Guide for AI Governance Platforms. Compliance platform, not convention-based. Launched Advisory Services in Aug 2025. Potential consulting partner rather than technical competitor.

Ring: **Assess** (new). Reassess trigger: Does Credo AI move into development-time governance? If so, it becomes a competitor. If it stays at compliance-platform level, potential integration partner for compliance artifact export.

### 18. OWASP Agentic Top 10

Standard risk taxonomy for agent security (goal hijack, tool misuse, identity/privilege, code execution, memory poisoning, inter-agent comms, cascading failures, human-agent trust). Microsoft's Agent Governance Toolkit maps to all 10. Useful as a governance completeness checklist.

Ring: **Assess** (new). Reassess trigger: Does OWASP publish prescriptive controls (not just risk categories)? If so, Sherpa should map its governance model against them.

### 19. Zenity

$59.5M raised. Gartner Cool Vendor in Agentic AI TRiSM. Deep Microsoft integration. Inline prevention for Copilot Studio agents, MCP tool invocation security. Fortune 500 customers. Runtime security focused, not convention-based.

Ring: **Assess** (new). Reassess trigger: If Zenity becomes the standard MCP security layer, Sherpa may need to integrate with it for dispatched agent enforcement.

### 20. Arthur AI Agent Discovery & Governance

First dedicated enterprise platform for discovering and governing agentic systems (Dec 2025). Google Cloud Marketplace. Agent discovery is the emerging enterprise battleground. Sherpa's model (agents are known because they're defined, not discovered) is structurally different.

Ring: **Assess** (new). Reassess trigger: Does agent discovery become a mandatory enterprise requirement? If so, Sherpa needs a "fleet registry" concept, even if agents are defined rather than discovered.

### 21. NeMo Guardrails / Colang DSL

NVIDIA's open-source programmable guardrails with Colang domain-specific language. Six guardrail types. Evolving toward process-level enforcement. The DSL approach is interesting — a specific language for expressing guardrails rather than general-purpose policy languages.

Ring: **Assess** (new). Reassess trigger: Does Colang gain adoption beyond NVIDIA's ecosystem? Could it complement or compete with OPA/Rego for agent governance?

---

## Hold

Explicitly not using. Documented reasons.

### 22. Convention-Only Governance (No Enforcement)

The current Sherpa model: behavioral conventions in markdown files with zero hooks, zero permission scoping, zero runtime enforcement. The stress test refuted this comprehensively. LLMs follow <30% of instructions perfectly in complex scenarios. Compliance decays linearly with instruction count. Context degradation destroys adherence past 32k tokens. All 12 tested prompt-based defenses were bypassed in adversarial research.

Ring: **Hold** (moved from implicit Adopt). Why: Conventions are the policy layer (necessary). Conventions as the *only* enforcement layer is aspiration, not governance. Must be complemented by hooks, permissions, and audit.

### 23. "Governance" as Developer Pitch

Pitching governance directly to developers. The stress test showed: shift-left security failed as a bottom-up motion, PLG structurally fails in compliance categories, developers view governance as overhead, and even Snyk's self-serve paid plan failed despite 300K+ developer users.

Ring: **Hold** (new). Why: Governance is the outcome, not the value proposition. Pitch developer productivity, structured collaboration, better outcomes. Let governance emerge as byproduct. The Snyk lesson: developers adopt tools, executives purchase governance.

### 24. "First in an Empty Market" Positioning

Claiming first-mover advantage or "empty layer" as competitive messaging. The stress test partially refuted both: AGENTS.md has 60K repos under the Linux Foundation, multiple runtime governance tools are well-funded, and developer tool first-movers historically lose (JSLint, CoffeeScript, Grunt).

Ring: **Hold** (new). Why: Claim cross-agent portability (structural moat) instead. "We're first" is a temporal claim that expires. "We're the only one that works across agents" is an architectural claim that persists as long as vendor fragmentation does.

### 25. Enterprise Governance Platform Competition

Competing with OneTrust ($4.5B), Credo AI ($101M), or cloud providers on enterprise governance platforms. They have $1.5B+ in combined funding, enterprise sales teams, and compliance domain expertise. The buyer persona (CAIO/CISO) is different from Sherpa's (CTO/engineering lead).

Ring: **Hold** (new). Why: Different layer, different buyer, different distribution. Sherpa's value is at the development layer producing artifacts that compliance platforms consume, not replacing them. The "governance-as-framework" (ESLint) model, not "governance-as-platform" (SonarQube Enterprise) model.

### 26. Standalone RBAC Without Convention Integration

Building RBAC as a standalone enforcement system (per the current `ledger-governance-rbac` proposal). The stress test showed conventions need enforcement, but the research also showed that RBAC alone is available in commercial tiers of existing frameworks (CrewAI AMP) and from cloud providers (Entra Agent ID, AWS Cedar, GCP IAM). Standalone RBAC without connecting it to Sherpa's convention model is commodity work.

Ring: **Hold** (new). Why: RBAC has value only as the enforcement mechanism for behavioral conventions — not as a standalone feature. Reframe `ledger-governance-rbac` around convention-aware enforcement rather than generic RBAC.

### 27. Competing with AGENTS.md on File Format

Inventing a proprietary convention file format to compete with AGENTS.md. The standard is under the Linux Foundation with every major AI lab participating. 60K+ repos. The format layer is being commoditized.

Ring: **Hold** (new). Why: Contribute to AGENTS.md / AAIF standards rather than competing. Sherpa's value is in making conventions executable and enforceable, not in owning the file format. Emit AGENTS.md as an export target.

### 28. Runtime Guardrails as Primary Governance

Building Sherpa's primary governance around runtime guardrails (input/output validation, content safety, prompt injection defense). This space is crowded ($1.5B+ funded), rapidly consolidating through acquisitions, and being bundled by cloud providers. Sherpa would be competing against LlamaFirewall (Meta), NeMo Guardrails (NVIDIA), AWS Guardrails, and multiple well-funded startups.

Ring: **Hold** (new). Why: Integrate with existing runtime guardrails rather than building Sherpa's own. The convention-to-enforcement bridge (Sherpa conventions → OPA policies → runtime enforcement) is the right architecture. Don't rebuild what Galileo, Microsoft, and NVIDIA already ship.

---

## Sources

- [Iteration 1 — Landscape survey](research/iteration-1.md) — 5 vectors, 20+ vendors
- [Vector 1 — Cloud providers](research/iteration-1/vector-1-cloud-provider-governance.md) — AWS, Azure, GCP
- [Vector 2 — Startup funding](research/iteration-1/vector-2-startup-funding-traction.md) — $1.5B+ funded
- [Vector 3 — Open-source governance](research/iteration-1/vector-3-open-source-governance.md) — Framework comparison
- [Vector 4 — Buyer demand signals](research/iteration-1/vector-4-buyer-demand-signals.md) — 5 buyer personas
- [Vector 5 — Coding agent governance](research/iteration-1/vector-5-coding-agent-governance.md) — Feature matrix
- [Stress test](stress-test.md) — 5 assumptions falsified
- Prior research: `agentic-workspace` iteration 3 vectors 4 and 7, `consulting-disruption-signals` iteration 2 vector 1
