---
status: seed
source-iteration: 1
spawned-from: agentic-workspace
created: 2026-03-12
priority: medium
---

# Governance Regulatory Alignment

## Context

The EU AI Act takes effect August 2026. The Colorado AI Act takes effect June 2026. Only 50% of organizations have formal AI guardrails. Sherpa's governance layer (initiative lifecycle, behavioral agent definitions, task dispatch with HITL, convention-as-code) maps directly to regulatory requirements but this alignment is not explicit or documented.

## Question

How do emerging AI governance regulations (EU AI Act, Colorado AI Act, and others) create concrete requirements that Sherpa's framework must satisfy for its customers? What does Sherpa already provide, what's missing, and how should the framework be extended to make compliance a feature?

## Suggested Vectors

1. EU AI Act requirements mapping — which provisions apply to agentic workflows? Human oversight, transparency, risk management, logging
2. Colorado AI Act requirements — state-level compliance for US organizations using AI agents
3. Sherpa governance audit — map existing capabilities (initiative lifecycle, HITL gates, behavioral constraints, task logging) to regulatory requirements
4. Compliance-as-code patterns — how do Terraform Sentinel, OPA/Rego, and other policy-as-code frameworks handle regulatory compliance? What's the analog for agent governance?
5. Market analysis — what are enterprises paying for AI governance tooling? Is there a commercial angle?

## Links

- [iteration-1/vector-3-platform-landscape.md](../research/iteration-1/vector-3-platform-landscape.md) — Governance gap analysis
- [iteration-1/vector-5-pm-category-earthquake.md](../research/iteration-1/vector-5-pm-category-earthquake.md) — PM disruption including regulatory context
