# Iteration 2 — 2026-03-15

## What We Already Knew

Iteration 1 established the Big Six baseline: $10B+ invested in AI, zero governance infrastructure. Three structural openings identified (governance market, pricing vacuum, trust arbitrage). Five signal categories tracked. The question became: what does governance actually look like as a deliverable, how urgent is it, and how should engagements be structured?

## Findings

### Vector 1: Governance Deliverables Taxonomy
**Question:** What do enterprises actually buy when they buy "AI governance"?
**Full report:** [iteration-2/vector-1-governance-deliverables-taxonomy.md](iteration-2/vector-1-governance-deliverables-taxonomy.md)

- Market splits into 7 deliverable categories: inventories, risk assessments, policy docs, compliance mappings, technical docs, operational controls, certifications.
- Compliance-based governance ($492M platform market) is well-served by Credo AI, Holistic AI, OneTrust, IBM, Big Four.
- **Convention-based governance (behavioral constraints, quality gates, lifecycle management) is unoccupied.** Nobody provides governance for AI agent development processes.
- AGENTS.md validates the convention-file approach (60K+ repos in 6 months) but lacks enforcement and lifecycle.
- The bridge opportunity: convention-based artifacts (behavioral definitions, quality gate results, Judge evaluations) are exactly the operational evidence compliance platforms need but can't generate themselves.
- EU AI Act Annex IV's 9 documentation sections map surprisingly well to Sherpa's initiative lifecycle.

**Implications:** Sherpa isn't competing with compliance platforms. It's producing the upstream operational evidence they consume. The positioning is **"ESLint for AI agent governance"** — framework in the workflow, not dashboard for the CISO.

### Vector 2: Insurance-Governance Linkage
**Question:** Is governance becoming an insurance requirement?
**Full report:** [iteration-2/vector-2-insurance-governance-linkage.md](iteration-2/vector-2-insurance-governance-linkage.md)

- **Yes, it's happening now.** W.R. Berkley's absolute AI exclusion eliminates coverage for claims from "inadequate AI governance." Insurers inserting binding conditions: regular bias audits, human review of high-stakes AI outputs.
- The cyber insurance parallel: MFA went from best practice to hard requirement in 3 years (2019-2021). AI governance is on the same trajectory, compressed — **hard requirement expected 2026-2027.**
- ISO 42001 positioning as the gold standard (like SOC 2 for cyber). Certification can reduce E&O premiums.
- Documented governance controls help negotiate narrower exclusions or affirmative endorsements.
- Professional licensing bodies building regulatory floor: ABA Opinion 512 (lawyers must understand AI tools), Texas Opinion 705 (human oversight required), California medical AI disclosure law.
- **Gen-AI litigation up 137% YoY.** Copyright lawsuits doubled from ~30 to 70+ in 2025.

**Implications:** This is the urgency signal. Governance isn't a best practice — it's becoming a condition of doing business. The 2-3 year window before commoditization is the maximum consulting opportunity.

### Vector 3: Internalization Cycle
**Question:** How fast do clients build internal governance? What does recurring revenue look like?
**Full report:** [iteration-2/vector-3-internalization-cycle.md](iteration-2/vector-3-internalization-cycle.md)

- **The taper model, not the cliff:** Build (months 1-3, consultant leads) → Operate (months 3-9, consultant coaches) → Advise (months 9-18, periodic reviews) → Sustain (months 18+, audits/regulatory/benchmarking).
- Companies never fully stop outsourcing. Core governance goes internal; regulatory monitoring, independent auditing, and maturity benchmarking stay external.
- **60-90 day credibility window** is non-negotiable. Phase 1 must produce tangible, operational artifacts.
- 65% of Fortune 500 now have retainer relationships with AI consultants (up from project-based).
- **68% of satisfied B2B clients churn within 18 months.** Sustain phase needs visible, recurring deliverables.
- Maturity models converge on 4-6 levels. Advancing one level takes 12-24 months. Only 20% of enterprises have mature governance for autonomous agents.
- **The framework IS the capability transfer mechanism.** The consulting engagement is "install and teach Sherpa's governance system."

**Implications:** Design for the taper. Three pricing phases: fixed-scope project → declining coaching retainer → lightweight sustain retainer. Use maturity model as engagement scaffolding. The framework makes capability transfer concrete and repeatable.

## Synthesis

Three vectors converge on a **complete service design picture** for Sherpa Consulting:

### The Layer Map

```
┌─────────────────────────────────────┐
│  COMPLIANCE LAYER (served)          │  Big Four, Credo AI, OneTrust
│  Inventories, risk assessments,     │  $492M platform + $11B consulting
│  audit reports, certifications      │
├─────────────────────────────────────┤
│  CONVENTION LAYER (unoccupied)      │  ← SHERPA
│  Behavioral constraints, quality    │  Framework + consulting
│  gates, lifecycle management,       │  Convention-based governance
│  dispatch rules, activity logs      │  for AI agent development
├─────────────────────────────────────┤
│  TOOLING LAYER (served)             │  OpenAI SDK, MLflow, ZenML
│  SDKs, guardrails, experiment       │  Developer tools
│  tracking, runtime constraints      │
└─────────────────────────────────────┘
```

Sherpa sits between compliance and tooling — producing the operational evidence compliance needs, consuming the runtime capabilities tooling provides. This is the "OPA of agent governance" positioning from the agentic-workspace research, now validated with market evidence.

### The Engagement Model

| Phase | Duration | Deliverables | Pricing |
|-------|----------|-------------|---------|
| **Build** | Months 1-3 | Behavioral agent definitions, quality gates, lifecycle framework, initial dispatch rules | Fixed-scope, outcome-priced |
| **Operate** | Months 3-9 | Coaching on governance operations, edge case handling, maturity assessment | Declining retainer ($5-15K/month) |
| **Advise** | Months 9-18 | Periodic reviews, regulatory change impact, maturity advancement | Advisory retainer ($2-5K/month) |
| **Sustain** | Months 18+ | Quarterly scorecard, independent audit, regulatory monitoring | Lightweight retainer + per-audit |

### The Urgency Timeline

```
NOW ──────── 2026-2027 ──────── 2027-2028 ──────── 2029+
│              │                  │                  │
│  Insurance   │  Hard requirement│  Non-negotiable  │  Commoditized
│  questionnaires│  or absolute   │  Claims denied   │  Standard
│  at renewal  │  exclusion      │  without docs    │  practice
│              │                  │                  │
│  ← MAXIMUM CONSULTING OPPORTUNITY →│  ← Sustain  │  ← Framework
│    (differentiation + urgency)     │    retainers │    licensing
```

### The Bridge Product

The single most actionable finding: Sherpa's convention-based governance artifacts (behavioral definitions, quality gate results, Judge evaluations, activity logs, initiative lifecycle records) can be **exported as compliance-ready evidence**. This creates a product bridge:

- **For clients:** "Your Sherpa-governed development process produces the documentation your insurer and auditor need."
- **For the market:** Convention-based governance isn't an alternative to compliance — it's the upstream factory that compliance consumes.
- **New artifact concept: "Agent Cards"** — model cards for behavioral agents. Fields: role slug, disposition, quality bar, domain scope, fail triggers, operational history, last Judge evaluation.

## Proposals Generated

No new initiatives needed. Findings feed directly into:
- `agentic-consulting-landscape` (iteration 2 service design: three-phase engagement model with specific pricing)
- `sherpa-website` (positioning: "the convention layer between compliance and tooling")
- `behavioral-agents` (new artifact: Agent Cards as governance deliverable)
- `sherpa-framework-extraction` (feature priority: compliance-ready export from convention-based artifacts)

## Open Questions for Next Iteration

1. **Agent Cards specification** — What fields? How do they map to model cards, EU AI Act Annex IV, and ISO 42001? This is a concrete artifact design task that could seed a new initiative or feed into `behavioral-agents`. (Feeds framework design)

2. **Compliance export format** — Can Sherpa's initiative lifecycle produce EU AI Act Annex IV documentation automatically? What's the mapping? This is a framework feature question. (Feeds `sherpa-framework-extraction`)

3. **Insurance broker channel** — What are brokers (Lockton, Marsh, WTW, Aon) telling clients about governance documentation? Getting sample AI disclosure questionnaires would make the consulting offering concrete. (Event-triggered: reach out to broker contacts)

4. **AAIF alignment** — Should Sherpa contribute to the Agentic AI Foundation? AGENTS.md + MCP are contributed projects. Sherpa's behavioral definitions and lifecycle governance could be the next standard. (Strategic decision for roadmap)
