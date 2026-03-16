---
status: pending
initiative: agent-cards
created: 2026-03-16
updated: '2026-03-16'
type: new-plan
risk: evolutionary
targets:
  - docs/standards/agent-card-spec.md                        # (new file)
  - packages/studio-core/src/schemas.ts
  - packages/studio-core/src/lib/agent-cards/                # (new file)
dependencies:
  - behavioral-agents
informs:
  - sherpa-framework-extraction
  - consulting-disruption-signals
  - agentic-consulting-landscape
  - agentic-organization-model
spawned-from: consulting-disruption-signals
---

# Agent Cards

## Summary

Define and implement Agent Cards — a governance artifact that documents behavioral agent capabilities, constraints, and operational history in a format consumable by compliance platforms, insurers, and auditors. Agent Cards are to behavioral agents what model cards are to ML models: the standardized disclosure document that makes an agent's governance posture legible to external stakeholders. This bridges Sherpa's convention-based governance with the compliance-based governance market.

## State Snapshot

**The behavioral agent schema exists and is validated:**
- `behavioralAgentFrontmatterSchema` in `packages/studio-core/src/schemas.ts:161-203` — 20+ fields covering behavioral (disposition, domain-scope, quality-bar, fail-triggers), operational (model-tier, tool-permissions, escalation), and display (vibe, tags) dimensions.
- 11 agent roles in `docs/agents/roles/` using the schema. Each has frontmatter + body with Behavioral Constraints section.
- `behavioral-agents` initiative (approved) plans to formalize a portable schema spec and migrate 120 agents from agency-agents catalog.
- `agentic-organization-model` initiative (pending) proposes agent instances with accumulated stats (tasks-completed, quality-score, etc.) but no compliance-facing artifact.

**What doesn't exist:**
- No artifact that presents agent governance data to external stakeholders (insurers, auditors, compliance platforms).
- No mapping from behavioral agent fields to compliance frameworks (EU AI Act Annex IV, ISO 42001, NIST AI RMF).
- No export capability for compliance-ready documentation.
- No "Agent Card" specification or concept in the codebase.

**Market context (from `consulting-disruption-signals` iteration 2):**
- Model cards are the established precedent for AI governance documentation (NIST AI RMF, EU AI Act Annex IV Section 1-4).
- EU AI Act Annex IV requires 9 documentation sections for high-risk AI systems — several map directly to behavioral agent fields.
- ISO 42001 certification requires AI system inventory, risk assessments, mitigation controls, role assignments.
- Insurance underwriters are asking: "What are your AI governance controls? How do you prevent errors? Is there human override?"
- AGENTS.md (60K+ repos) validates convention-file governance but lacks compliance bridging.
- Nobody produces Agent Cards or equivalent for agent-based systems. The concept is novel.

## Proposed Changes

### 1. Agent Card Specification (`docs/standards/agent-card-spec.md`)

A standards document defining the Agent Card format. The card is generated from existing behavioral agent data, not authored separately — it's a **view** over the behavioral agent definition plus operational history.

**Card sections and their sources:**

| Card Section | Source | Maps To |
|-------------|--------|---------|
| **Identity** | name, display-name, category, tags | EU AI Act Annex IV §1 (general description) |
| **Behavioral Governance** | disposition, behavioral-constraints, quality-bar, fail-triggers | EU AI Act Annex IV §3 (monitoring/control), NIST Govern |
| **Domain Scope** | domain-scope, context-packages, rules, skills | EU AI Act Annex IV §1 (purpose), NIST Map |
| **Operational Envelope** | model-tier, tool-permissions, escalation, task-type | ISO 42001 (role assignments, mitigation controls) |
| **Quality Record** | quality-score, tasks-completed, tasks-failed, last Judge evaluation | EU AI Act Annex IV §4 (performance metrics), NIST Measure |
| **Lifecycle** | created, last-active, status, version history | EU AI Act Annex IV §6 (lifecycle changes), ISO 42001 (corrective actions) |
| **Human Oversight** | escalation paths, autonomy-tier, human-review requirements | EU AI Act Annex IV §3 (human oversight measures) |

The spec defines required vs. optional sections, field formats, and compliance framework mapping tables. It is designed to be readable by humans (Markdown) and parseable by machines (YAML frontmatter + structured sections).

### 2. Agent Card Schema (`packages/studio-core/src/schemas.ts`)

Extend `schemas.ts` with an `agentCardSchema` that composes behavioral agent fields with compliance metadata:

- References the behavioral agent definition (role slug)
- Adds compliance-specific fields: risk-classification, human-oversight-description, applicable-regulations, last-audit-date
- Adds operational history summary: tasks-completed, quality-score, last-judge-evaluation (sourced from `agentic-organization-model` instance data when available, or from dispatch logs)
- Validation ensures cards can only be generated for agents with a minimum set of behavioral fields (disposition + quality-bar at minimum)

### 3. Card Generation Module (`packages/studio-core/src/lib/agent-cards/`)

A module that generates Agent Cards from existing behavioral agent definitions:

- `generateCard(roleSlug)` — reads the agent role definition, merges instance data (if available), produces a structured Agent Card
- `exportAsMarkdown(card)` — renders human-readable Markdown suitable for documentation or sharing
- `exportAsJSON(card)` — structured JSON for platform consumption or API integration
- `mapToCompliance(card, framework)` — produces a compliance mapping showing which card fields satisfy which framework requirements (EU AI Act, ISO 42001, NIST AI RMF)
- Card generation is deterministic — same inputs always produce same card. No LLM involved.

### 4. Studio Integration (future, not in scope for this initiative)

Agent Cards would render in Studio's agent detail views and be downloadable as artifacts. This is noted as a follow-on, not a target for this initiative.

## Rationale

**The bridge product thesis.** `consulting-disruption-signals` iteration 2 identified that Sherpa's convention-based governance (behavioral constraints, quality gates, lifecycle management) sits in an unoccupied layer between compliance platforms and developer tooling. Agent Cards are the artifact that makes this bridge concrete — they translate behavioral agent definitions into the language compliance platforms, insurers, and auditors expect.

**Model cards are the established precedent.** Every major AI governance framework (NIST, EU AI Act, ISO 42001) expects standardized documentation per AI system. Model cards are the accepted format for ML models. No equivalent exists for behavioral agents. Agent Cards fill this gap using the same conceptual model.

**Generation over authoring.** Agent Cards are generated from existing behavioral agent definitions — they're a view, not a separate artifact to maintain. This means governance documentation stays in sync with the actual behavioral constraints automatically. The single source of truth is the behavioral agent definition; the Agent Card is a derived artifact.

**Insurance urgency.** Insurance underwriters are asking specific questions about AI governance controls (human oversight, error prevention, audit trails). Agent Cards produce answers to these questions directly from the behavioral agent definition. This makes the insurance questionnaire response concrete rather than narrative.

## Dependencies

- **`behavioral-agents`** (hard) — The behavioral agent schema must be stable before Agent Cards can formalize a view over it. Phase 1 of `behavioral-agents` (schema specification) is the critical prerequisite.

**Soft coordination:**
- `agentic-organization-model` — When agent instances with operational stats exist, Agent Cards incorporate them into the Quality Record section. Without instances, cards reflect the role definition only (still useful for compliance).
- `sherpa-framework-extraction` — Agent Card generation becomes a framework feature. The export format and generation module are candidates for the `@sherpa/studio-core` package.

## Review Notes

**Key design decision: view, not artifact.** Agent Cards are generated from behavioral agent definitions, not authored separately. This avoids the drift problem (card says one thing, agent does another) at the cost of requiring the behavioral agent definition to be comprehensive enough to produce a useful card. The minimum viable card requires: name, disposition, quality-bar. A full card adds: fail-triggers, tool-permissions, escalation, operational history.

**Open questions:**
- Should Agent Cards have a schema discriminator (like `$schema: "sherpa/agent-card@1"`) for auto-detection in the file tree?
- How much of the compliance mapping is in the spec vs. in the generation code? The mapping tables could be static documentation or dynamic (framework-aware export).
- Should the JSON export conform to an existing standard (NIST AI RMF profile, CycloneDX AI extension) or define a Sherpa-native format?
- What's the relationship to AIBOM (AI Bill of Materials)? Agent Cards document governance; AIBOMs document supply chain. Complementary but distinct.

**Effort:** 2 sessions
**Session breakdown:**
- Session 1: Agent Card specification document, compliance mapping tables, schema extension in `schemas.ts`
- Session 2: Generation module, Markdown/JSON export, compliance mapping function, tests
