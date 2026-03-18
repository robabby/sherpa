---
status: in-progress
initiative: agentic-governance-landscape
created: 2026-03-17
updated: '2026-03-18'
type: research-synthesis
risk: additive
targets:
  - docs/initiatives/agentic-governance-landscape/
dependencies: []
informs:
  - ledger-governance-rbac
  - behavioral-agents
  - consulting-disruption-signals
  - agentic-consulting-landscape
  - sherpa-website
  - sherpa-framework-extraction
spawned-from: null
---

# Agentic Governance Landscape

## Summary

Deep research initiative mapping the emerging agentic governance industry — who provides governance tooling and standards, what market segments exist, who's buying, and where the regulatory/technical landscape is heading. Produces competitive intelligence that informs Sherpa's framework positioning, feature priority, and consulting practice. This is the dedicated "governance as a product category" study that existing initiatives reference but don't own.

## State Snapshot (Updated After Iteration 1)

Iteration 1 surveyed the landscape across 5 vectors (cloud providers, startup funding, open-source projects, buyer demand, coding agent governance). The market is significantly more developed than prior initiatives assumed — but Sherpa's specific layer remains empty.

**The Three-Layer Governance Stack:**

| Layer | What It Does | Who Provides | Sherpa? |
|-------|-------------|-------------|---------|
| **Infrastructure** | Identity, access, runtime sandboxing | AWS AgentCore (Cedar policies), Azure Agent 365 (Entra Agent ID), GCP Agent Engine (IAM) | No |
| **Compliance** | Audit trails, regulatory mapping, risk assessment | Credo AI ($101M val), OneTrust ($4.5B val), Holistic AI, Arthur AI ADG | No |
| **Behavioral** | What agents should do, quality standards, lifecycle, conventions | **Nobody. Sherpa.** | **Yes** |

**Market facts:**
- $1.5B+ combined known funding across governance vendors
- $2.6B+ in governance acquisitions 2024-2025 (Lakera→Check Point $300M, Robust Intelligence→Cisco ~$400M, CalypsoAI→F5 $180M, Securiti→Veeam $1.725B)
- 82% of enterprises cite governance as #1 blocker to scaling agents (IBM CEO Study)
- Only 21% have mature governance despite 75% planning agent deployment within 2 years (Deloitte)
- 90% of developers use AI coding tools, only 32% have governance policies
- No coding agent provides cross-agent governance — every vendor's governance is siloed

**Prior initiative claims corrected:**
- "No governance tooling exists" → False for enterprise. True for behavioral/convention-based governance.
- "No major framework ships formal RBAC" → Still largely true for open-source. RBAC exists only in commercial tiers (CrewAI AMP) or custom code.
- "No MCP server implements role-based authorization" → MCP has minimal governance semantics. Gateways (Kong, Strata) are the interim mechanism.

## Proposed Changes

### Target: `docs/initiatives/agentic-governance-landscape/`

Multi-iteration research initiative structured across six research vectors. Each iteration deepens one or more vectors and produces actionable intelligence for downstream initiatives.

**Vector 1: Vendor Landscape — Who Provides Governance**

Map the competitive field across four tiers:

| Tier | Examples from existing research | Gap |
|------|------|-----|
| **Enterprise platforms** | Microsoft Agent 365, OneTrust, AvePoint AgentPulse, Zenity, Human Agency | Need: pricing models, feature matrices, deployment patterns, customer segments, enterprise adoption velocity |
| **Developer frameworks** | OPA, Agent OS, CrewAI guardrails, LangGraph checkpointing | Need: governance features within agent frameworks vs. standalone governance tools |
| **Cloud provider offerings** | AWS Bedrock Guardrails, Azure AI Content Safety, Google Vertex AI governance | Need: how cloud-native governance integrates with agentic workflows |
| **Startups / emerging** | Lakera, Arize AI, Patronus AI, Galileo, Arthur AI | Need: funding, traction, positioning, product direction |

Deliverable: Competitive matrix with feature coverage, pricing model, target segment, and maturity assessment per vendor.

**Vector 2: Standards & Regulatory Landscape — Who Sets the Rules**

Track governance standards and regulatory frameworks:

- **National frameworks:** Singapore IMDA Model Governance Framework for Agentic AI (world's first, Jan 2026), EU AI Act (Article 12/19 audit trail requirements), NIST AI Agent Standards Initiative
- **Industry standards:** Cloud Security Alliance Agentic Trust Framework (ATF), ISO/IEC 42001 (AI Management Systems), IEEE P2863
- **De facto standards:** MCP protocol governance patterns, OpenAI usage policies, Anthropic acceptable use
- **Regulatory trajectory:** Which jurisdictions are moving toward mandatory agent governance? What compliance requirements are emerging?

Deliverable: Regulatory timeline and standards tracker — what's enforceable now, what's coming, and what Sherpa needs to support.

**Vector 3: Market Segmentation — Who's Buying**

Map demand signals across buyer segments:

- **Regulated industries** (financial services, healthcare, government) — compliance-driven adoption, audit trail requirements, incident response needs
- **Enterprise IT** — agent fleet management, shadow AI governance, cost control, policy enforcement
- **Developer teams** — guardrails for coding agents, review gates, behavioral constraints
- **Consulting firms** — quality assurance for AI-generated deliverables, client-facing audit trails
- **Startups / SMBs** — lightweight governance for small agent fleets, convention-based over platform-based

Deliverable: Buyer persona map with pain points, budget authority, purchase triggers, and current alternatives per segment.

**Vector 4: Product Category Taxonomy — What Gets Sold**

Classify governance offerings by what they actually do:

- **Observability & monitoring** — agent activity dashboards, cost tracking, usage analytics
- **Policy enforcement** — guardrails, content safety, tool access control, behavioral constraints
- **Audit & compliance** — immutable logs, decision trails, regulatory reporting
- **Lifecycle management** — agent provisioning, versioning, deprecation, fleet management
- **Quality assurance** — output validation, hallucination detection, accuracy scoring
- **Identity & access** — agent authentication, RBAC, authority management

Deliverable: Category map showing which vendors cover which categories, and where whitespace exists.

**Vector 5: Architectural Patterns — How Governance Gets Implemented**

Analyze technical approaches to governance:

- **Layer position:** Top-of-stack observability vs. cross-cutting middleware vs. kernel-level enforcement (the three framings from `agentic-workspace` research)
- **Enforcement model:** Advisory (log-only) vs. preventive (block-before-execute) vs. detective (flag-after-execute)
- **Integration pattern:** SDK/library, proxy/gateway, sidecar, platform-native, convention-based (Sherpa's approach)
- **State management:** Centralized (database), distributed (event log), filesystem-based (Sherpa), hybrid

Deliverable: Architecture decision guide mapping Sherpa's convention-based approach against the industry patterns.

**Vector 6: Trajectory & Outlook — Where It's Going**

Synthesize directional signals:

- **Consolidation:** Are standalone governance vendors getting acquired by platform vendors? Is governance becoming a feature, not a product?
- **Standardization:** Will MCP or another protocol become the governance wire format? Will regulatory pressure force interoperability?
- **Developer vs. enterprise:** Is governance bifurcating into developer-facing (lightweight, convention-based) and enterprise-facing (platform, compliance-driven)?
- **Open source vs. commercial:** Which governance capabilities commoditize, which retain pricing power?
- **Agentic governance of agentic governance:** Who governs the governance layer? How do meta-governance questions resolve?

Deliverable: Outlook memo with 12-24 month projections and Sherpa positioning implications.

### Research Iteration Plan

| Iteration | Vectors | Focus |
|-----------|---------|-------|
| 1 | V1 + V2 | Vendor landscape + regulatory scan. Broad sweep to establish baseline. |
| 2 | V3 + V4 | Market segmentation + category taxonomy. Who buys what. |
| 3 | V5 + V6 | Architecture patterns + trajectory. Where Sherpa fits and where it's going. |
| 4+ | All | Ongoing monitoring, event-triggered deep dives, competitive updates. |

## Rationale

**The category is forming now.** Singapore launched the world's first national agentic AI governance framework in January 2026. NIST launched its AI Agent Standards Initiative the same month. Microsoft Agent 365 goes GA in May 2026. The window between "nascent category" and "established incumbents" is exactly when positioning research matters most.

**Existing research is fragmented.** Five initiatives reference governance landscape intelligence, but none own it. The `agentic-workspace` vector-4 research is the richest source (15+ vendors catalogued) but it's one vector within a broader initiative. The claims in `ledger-governance-rbac` ("no major framework ships RBAC") need systematic verification — the market may have moved since that was written.

**Sherpa's positioning depends on knowing the field.** Sherpa's differentiator is convention-based governance on the filesystem — behavioral constraints, initiative lifecycle, quality gates. Whether that's a unique approach or one of many depends on understanding what everyone else is building. "No one does this" is a strong claim that requires evidence.

**Intelligence flows downstream.** This initiative directly informs:
- `ledger-governance-rbac` — validates (or invalidates) first-mover claims, identifies features to match or differentiate from
- `behavioral-agents` — competitive context for behavioral constraint approach vs. alternatives
- `consulting-disruption-signals` — enriches the "governance vacuum" signal with vendor-side data
- `agentic-consulting-landscape` — governance tooling options for consulting delivery
- `sherpa-website` — competitive positioning language, differentiation claims
- `sherpa-framework-extraction` — which governance features are table stakes vs. differentiators

## Dependencies

None. Pure research initiative — reads from the market, feeds intelligence into other initiatives.

## Review Notes

**Relationship to existing work:**
- This initiative consolidates and deepens the governance-specific research currently fragmented across 5 initiatives. It does not duplicate them — it provides the dedicated governance lens they each reference but don't fully develop. Existing research (especially `agentic-workspace` vector-4) seeds iteration 1 rather than being repeated.
- The `informs:` relationships are the primary output channel. This initiative produces intelligence; downstream initiatives consume it for feature decisions, positioning, and content.

**Scope boundaries:**
- This initiative maps the external landscape. It does not design Sherpa's governance features (that's `ledger-governance-rbac`, `distributed-agent-consistency`, `mcp-coordination-layer`).
- It does not produce consulting service designs (that's `agentic-consulting-landscape`).
- It does not track incumbent firm transformation (that's `consulting-disruption-signals`).

**Open questions:**
- How fast is this market moving? If vendor landscape changes quarterly, the research cadence needs to match. If it's moving monthly (which early signals suggest), we may need event-triggered monitoring.
- Should this initiative produce a technology radar (`/radar` skill) output? The vendor landscape maps naturally to Adopt/Trial/Assess/Hold rings.
- Are there governance-specific conferences, analyst reports, or communities to monitor systematically? (Gartner's AI governance market guide, Forrester's AI trust platform wave, etc.)

**Effort:** 3-4 sessions for iterations 1-3, then ~1 session per quarterly update
**Session breakdown:**
- Session 1: Vendor landscape + regulatory scan (vectors 1-2). Leverage existing `agentic-workspace` research as seed.
- Session 2: Market segmentation + category taxonomy (vectors 3-4). Buyer persona research.
- Session 3: Architecture patterns + trajectory (vectors 5-6). Positioning memo.
- Session 4 (if needed): Synthesis across all vectors, radar output, downstream initiative briefs.
