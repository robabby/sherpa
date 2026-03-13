---
status: seed
source-iteration: 3
spawned-from: agentic-workspace
created: 2026-03-12
priority: medium
---

# compliance-mapping — Regulatory Requirements → Sherpa Capabilities

## Context

Iteration 3 mapped EU AI Act (Aug 2026) and Colorado AI Act (Jun 2026) requirements to framework capabilities. The regulations demand: structured audit logging, risk management, technical documentation (maintained 10 years), human oversight with intervention capability, and bias monitoring. Sherpa's existing primitives (activity.md, initiative lifecycle, HITL review, behavioral constraints) map well — but need to become structured, automatic, and auditable.

The governance platform market is $309M growing to $4.8B. Organizations with governance platforms are 3.4x more effective (Credo AI). Regulatory compliance could be Sherpa's enterprise adoption driver.

## Question

What specific Sherpa capabilities must be built or enhanced to satisfy EU AI Act Articles 9-15, Colorado SB 24-205, and NIST AI RMF requirements — and what's the minimum viable compliance implementation?

## Suggested Vectors

1. **EU AI Act requirement mapping** — Article-by-article mapping to Sherpa primitives. Gap analysis: what exists, what needs building, what needs restructuring.
2. **Colorado AI Act deployer obligations** — How does `sherpa sync` satisfy the "risk management aligned with NIST RMF" requirement? What developer obligations apply to framework authors?
3. **Audit log specification** — What replaces advisory `activity.md` for compliance? Structured format, tamper resistance (append-only JSONL?), cryptographic verification, retention policies.
4. **Studio compliance dashboard** — What does the compliance view look like? Risk assessment status, audit trail viewer, impact assessment tracker, kill switch controls.
5. **Model/system card generation** — Can Sherpa auto-generate AI system documentation (Annex IV) from initiative lifecycle data + behavioral definitions + audit logs?

## Links

- [EU AI Act](https://artificialintelligenceact.eu/) — Full text
- [Colorado SB 24-205](https://leg.colorado.gov/bills/sb24-205) — State AI regulation
- [NIST AI RMF](https://www.nist.gov/artificial-intelligence/executive-order-safe-secure-and-trustworthy-artificial-intelligence) — Risk management framework
- [OWASP Agentic Top 10](https://owasp.org/www-project-top-10-for-agentic-applications/) — Security taxonomy
- [Credo AI](https://www.credo.ai/) — Leading governance platform
- iteration-3/vector-7-governance-regulatory-requirements.md
