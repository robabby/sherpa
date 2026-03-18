---
doc-type: architecture
maintained-by: self-documenting-system
authored-by: ai
reviewed-by: human
last-updated: 2026-03-16T00:00:00.000Z
last-verified: '2026-03-17'
source-initiatives: []
---

> **AI-generated** 2026-03-16 · Awaiting human review
> Sources: behavioral-engineering.md, docs/agents/roles/, voice-and-tone

# Behavioral Agent System

Agent roles defined through behavioral constraints, not identity claims. Research-validated: identity role effects are "largely random" (Zheng et al. EMNLP 2024), while behavioral constraints produce consistent, measurable behavior changes.

## Overview

The industry default for agent roles is identity prompting: "You are an expert senior engineer." Sherpa rejects this based on research evidence. Instead, roles specify **what the agent does** — behavioral defaults, explicit fail triggers, quality standards, and domain scoping. Claude already has a character; role definitions provide focus, not personality.

## Role Definition Schema

Each role in `docs/agents/roles/` uses structured YAML frontmatter:

| Field | Type | Purpose |
|-------|------|---------|
| `disposition` | Behavioral posture | How the role approaches work (e.g., "conservative — prefers proven patterns") |
| `quality-bar` | Acceptance standards | Concrete criteria the Judge evaluates |
| `vibe` | UI display text | Human-readable one-liner for Studio — never injected as prompt |
| `category` | Classification | engineering, design, strategy, operations |
| `model-tier` | Resource allocation | high, medium — determines which model backend handles it |
| `task-type` | Dispatch routing | Maps to execution pipeline task types |
| `structure` | Collaboration pattern | hierarchical-manager-worker, producer-critic, expert-team, pipeline, scientific-method |

## The 11 Roles

| Role | Category | Disposition | Structure |
|------|----------|-------------|-----------|
| `architect` | engineering | Conservative — prefers proven patterns, requires justification for new abstractions | hierarchical-manager-worker |
| `code-reviewer` | engineering | Adversarial — assumes bugs exist, requires proof of correctness | producer-critic |
| `designer` | design | Restrained — "if everything glows, nothing does," remove before adding | expert-team |
| `engineer` | engineering | Precise — zero tolerance for loose types or missing exports | producer-critic |
| `judge` | engineering | Skeptical — defaults to NEEDS WORK, requires evidence for every criterion | producer-critic |
| `marketer` | operations | Grounded — no superlatives, no urgency, no "amazing cosmic energy" | pipeline |
| `product-manager` | strategy | Strategic — evaluates against intelligence-native thesis before considering implementation | hierarchical-manager-worker |
| `product-owner` | strategy | Pragmatic — smallest scope that delivers value, reject gold-plating | hierarchical-manager-worker |
| `research-lead` | strategy | Thorough — exhaustive sourcing, every claim backed by citation | scientific-method |
| `technical-writer` | operations | Minimalist — every line must pass the Mistake Test, prefer deletion | pipeline |
| `ux-researcher` | design | Evidence-based — ground recommendations in observed behavior, not assumptions | expert-team |

## Agent Voice

Behavioral constraints map to voice constraints for agent-generated text (`docs/ux/agent-voice.md`). When an agent writes content (not just code), its behavioral disposition shapes the tone. The judge role's "defaults to NEEDS WORK" disposition produces direct, evidence-citing review text. The marketer role's "no superlatives" constraint prevents generic AI consulting language.

## The Test

When writing or reviewing a role definition: if a sentence describes *who the agent is*, rewrite it as *what the agent does*.

- "Skeptical reviewer" → "defaults to NEEDS WORK, requires evidence"
- "Expert architect" → "prefers proven patterns, requires justification for new abstractions"
- "Experienced security engineer" → "checks OWASP top 10 on every review, flags missing input validation"

## Evidence Base

- **Zheng et al. (EMNLP 2024):** Identity role effects are "largely random" across 162 roles and 2,410 questions
- **Anthropic (Feb 2026):** Role assignments activate unpredictable persona clouds beyond what was specified
- **Anthropic Prompt Guide:** Built entirely around behavioral instructions, not identity claims

## Current State

**Implemented:** 11 behavioral role definitions, behavioral-engineering convention rule, agent-voice guidelines, role-based dispatch routing, role validation script (`scripts/validate-agent.ts`).

**In progress:** agent-framework-patterns (schema validation, portable definitions), behavioral-agents (formal schema + catalog), agent-cards (visual role summaries for Studio).

## Related

- [Execution Pipeline](../execution-pipeline/index.md) — roles determine task-type routing and dispatch behavior
- [Executable Conventions](../executable-conventions/index.md) — behavioral-engineering.md is a convention rule
- [Studio Application](../studio-application/index.md) — `/workforce` route renders role catalog

## Decisions

- [0002 — Behavioral constraints over identity claims](../../decisions/0002-behavioral-constraints-over-identity.md)
