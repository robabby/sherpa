---
status: approved
initiative: behavioral-agents
created: 2026-03-11T00:00:00.000Z
updated: '2026-03-11'
type: new-plan
risk: structural
targets:
  - ../sherpa
  - docs/initiatives/sherpa-framework-extraction/
  - .claude/rules/behavioral-engineering.md
dependencies:
  - agent-framework-patterns
spawned-from: agent-framework-patterns
---

# Behavioral Agents

Migrate the full [agency-agents](https://github.com/msitarzewski/agency-agents/) catalog (~120 agents, 12 divisions) into the Sherpa system, rewriting every definition using behavioral engineering. No identity claims, no persona fiction — only behavioral constraints, domain scoping, quality bars, and fail triggers. The Behavioral Agent format becomes a core Sherpa product and the seed workforce for every organization Sherpa instantiates.

## State Snapshot

**What exists today:**
- 13 WavePoint agent roles in `docs/agents/roles/` — already use behavioral engineering (`disposition:`, `quality-bar:`, `## Behavioral Constraints`, `## Fail Triggers`)
- `.claude/rules/behavioral-engineering.md` — cross-cutting rule codifying the principle
- Research evidence at `docs/initiatives/agent-framework-patterns/research/role-prompting-efficacy.md` (Zheng et al., Anthropic persona research, etc.)
- Full audit of agency-agents at `docs/initiatives/agent-framework-patterns/research/agency-agents.md` — quality tiering, pattern catalog, gap analysis

**What agency-agents provides (raw material):**
- 120 agent definitions across 12 divisions (Engineering, Marketing, Specialized, Game Dev, Design, Testing, Sales, Paid Media, Support, Spatial Computing, Project Management, Product)
- Identity-role format: personality traits, memory claims, experience claims, per-agent workflows
- Three quality tiers: Tier 1 (battle-tested, ~7 agents with real behavioral substance), Tier 2 (professional but generic, ~50), Tier 3 (thin/aspirational, ~60)
- MIT license — full migration rights

**What doesn't exist:**
- A portable Behavioral Agent schema specification
- The migrated catalog
- Migration tooling
- Sherpa's taxonomy (may differ from agency-agents' division structure)
- The `../sherpa` codebase

## The Philosophical Distinction

**Identity Agents** (agency-agents' approach) define *who the agent is*:
> "You are a Senior Frontend Developer. Personality: detail-oriented, creative, performance-obsessed. Memory: You remember every framework migration you've guided. Experience: 15 years building responsive web applications."

**Behavioral Agents** (Sherpa's approach) define *what the agent does*:
> `disposition: precise — zero tolerance for loose types or missing accessibility attributes`
> `domain-scope: [TypeScript, React, Next.js, WCAG 2.1, Core Web Vitals]`
> `quality-bar: [Lighthouse accessibility ≥ 90, no any types in exports, semantic HTML over div soup]`
> `fail-triggers: [missing alt text on images, inline styles instead of design tokens, no error boundary on async components]`

The identity approach is unreliable (Zheng et al.: effects are "largely random") and carries real risks (Anthropic: activates unpredictable persona clouds). The behavioral approach is testable, composable, and works *with* Claude's existing character rather than against it.

## Proposed Changes

### Phase 1 — Behavioral Agent Schema Specification (~2 sessions)

Design the portable schema that defines what a Behavioral Agent is. This is the product — the format itself is what Sherpa sells (alongside the tooling and catalog).

**Schema design principles:**
1. **Compositional, not monolithic.** The agent definition is metadata + pointers. Context comes from the host project's files (CLAUDE.md, rules, skills), not from stuffing 300 lines into the agent file.
2. **Behavioral, not identity.** Every field describes what the agent does, never who it is.
3. **Measurable.** Quality bars and fail triggers must be machine-evaluatable by a Judge agent.
4. **Portable.** The schema works in any organization, any codebase, any domain. WavePoint-specific content lives in Sherpa's roles, not in the schema.
5. **Tiered.** Not all fields are required. A minimal agent needs `name`, `disposition`, and `domain-scope`. A fully specified agent adds quality bars, fail triggers, escalation, model tier, and tool permissions.

**Draft schema (to be refined in session):**
```yaml
---
# === Required ===
name: frontend-developer
display-name: Frontend Developer
category: engineering              # configurable taxonomy per organization
disposition: >-                    # behavioral posture — what to DO, not who to BE
  precise — zero tolerance for loose types, missing accessibility,
  or components without error boundaries

# === Behavioral ===
domain-scope:                      # narrow the consideration space (Type C prompting)
  - TypeScript
  - React
  - Next.js
  - WCAG 2.1
  - Core Web Vitals
behavioral-constraints:            # explicit operational instructions (Type B prompting)
  - Every component must have TypeScript props interface — no implicit any
  - Semantic HTML over div soup — use appropriate elements
  - No inline styles — use design tokens from the project's design system
  - When a task says "build X," build X. Do not refactor surrounding code.
  - Run lint and type-check before claiming work is complete
quality-bar:                       # measurable criteria the Judge evaluates
  - Lighthouse accessibility score ≥ 90
  - No TypeScript any in exported interfaces
  - All interactive elements keyboard-navigable
fail-triggers:                     # conditions that force automatic NEEDS WORK
  - Missing alt text on any image element
  - Click handlers on div/span instead of button/a
  - No error boundary wrapping async data components
  - Console.log statements in committed code

# === Operational ===
model-tier: medium                 # high | medium | low
tool-permissions:                  # least-privilege dispatch
  - read
  - write-code
  - write-docs
  - deploy
escalation:                        # directed graph of expertise routing
  - "architectural decisions -> architect"
  - "visual design -> designer"
  - "accessibility audit -> ux-researcher"
  - "approval -> human"
context-packages: []               # populated per-organization, not in base catalog

# === Display ===
vibe: >-                           # one-liner for UI — never injected as system prompt
  Ships clean, accessible code. Types on everything, semantic HTML, no div soup.
tags:                              # for search/filtering in UI
  - frontend
  - web
  - accessibility
  - react
---
```

**Deliverables:**
- Schema specification document with field definitions, required vs. optional, validation rules
- JSON Schema / Zod schema for programmatic validation
- Migration guide: how to convert an identity-role agent to a behavioral agent
- 3-5 example agents showing the format at different complexity levels (minimal, standard, full)

### Phase 2 — Scaffold the Sherpa Codebase (~2-3 sessions)

**This is where `../sherpa` begins.** The Behavioral Agents catalog is the first artifact that truly belongs in Sherpa, not WavePoint. Rather than writing 120 agent definitions here and moving them later, we start the codebase now and build directly in it.

**What gets scaffolded:**
- **Project root** — `CLAUDE.md`, `README.md`, `.claude/rules/`, `.claude/skills/`, `.gitignore`
- **Behavioral engineering rule** — `behavioral-engineering.md` ported from WavePoint as a founding convention
- **Agent catalog directory** — `agents/` with schema, validation, and category taxonomy
- **Schema validation** — Zod schema for Behavioral Agent format, lint script for CI
- **Reference materials** — Gulli's Agentic Design Patterns (PDF + 8 markdown breakdowns from `docs/resources/agentic-design-patterns/`): 21 patterns, 8 organizational structures, complexity levels. This is the theoretical foundation for how agents compose, escalate, and coordinate. Agents reference patterns by name; the reference library must ship with the codebase.
- **Research evidence** — The behavioral engineering evidence base (`role-prompting-efficacy.md`, `synthesis.md`) and the agency-agents audit. These are the intellectual foundation for why Sherpa's approach works.
- **Documentation** — Architecture docs capturing the behavioral engineering philosophy and the migration methodology
- **Conventions** — All lessons learned from WavePoint's `.claude/rules/` and `CLAUDE.md` architecture, adapted for Sherpa's context (domain-agnostic, multi-organization)

**Design decisions to make during scaffolding:**
- Project type: standalone repo? Monorepo with packages? (Likely monorepo — Studio extraction will add packages later)
- Agent catalog structure: flat with tags? Directories by category? (Informed by taxonomy decision from Phase 1)
- Which WavePoint conventions port directly vs. need adaptation (e.g., `initiative-convention.md` is framework-level; `cosmological-harmonics.md` is WavePoint-only)

**The principle:** Everything WavePoint taught us about CLAUDE.md architecture, cross-cutting rules, effort estimation, initiative governance — all of that knowledge seeds Sherpa from day one. This isn't a blank project. It's the distillation of months of operational learning.

### Phase 3 — Catalog Migration (~4-6 sessions)

Migrate all ~120 agency-agents definitions to the Behavioral Agent format, writing directly into `../sherpa/agents/`.

**Migration process per agent:**
1. **Extract** — Pull the behavioral gold from the identity-role definition: Critical Rules, fail triggers, quality standards, constrained outputs, domain-specific knowledge
2. **Discard** — Strip identity claims (personality, memory, experience), per-agent workflows (handled at pipeline level), learning & memory sections (handled by session infrastructure)
3. **Rewrite** — Express extracted substance as behavioral constraints, domain scoping, quality bars, and fail triggers
4. **Augment** — Add model tier, tool permissions, and escalation paths (not present in source)
5. **Validate** — Run against the schema; verify behavioral constraints are testable

**Triage by quality tier:**
- **Tier 1 (~7 agents):** High-value migration. Reality Checker, Evidence Collector, Blockchain Security Auditor, Agentic Identity & Trust Architect, Senior PM, Executive Summary Generator, Agents Orchestrator. These have real behavioral substance that transfers directly.
- **Tier 2 (~50 agents):** Standard migration. Professional role descriptions with reasonable domain knowledge. The behavioral rewrite will be an improvement over the originals.
- **Tier 3 (~60 agents):** Evaluate individually. Some define useful roles that deserve proper behavioral constraints. Others are too thin to be worth migrating — create fresh Behavioral Agent definitions for the role concept instead.

**Quality mandate:** Every agent is migrated by Claude, not local models. These definitions are the lifeblood of every organization Sherpa instantiates — they set the behavioral floor for all downstream work. A poorly written behavioral constraint propagates through every task that agent touches. No corners cut, no batch automation. Each agent gets deliberate attention: read the source, extract the substance, rewrite with precision, validate against the schema.

**After migration:**
- Domain-specific roles (e.g., WavePoint's Astrologer, Astrocartographer) remain in their respective organizations — they extend the base catalog with organization-specific agents
- WavePoint becomes the first consumer of Sherpa's agent catalog, validating the consumer relationship
- The `sherpa-framework-extraction` initiative can proceed with Studio code extraction into the now-existing Sherpa codebase

## Rationale

1. **Product differentiation.** "We rewrote 120 agent definitions using research-validated behavioral engineering" is a concrete, defensible claim. The agency-agents repo is MIT-licensed and popular — showing a better way to define agents positions Sherpa as the authoritative approach.

2. **Seed workforce.** Every new organization Sherpa instantiates starts with a behavioral agent catalog, not an empty directory. This is the "batteries included" strategy.

3. **The format is the product.** The Behavioral Agent schema — with its compositional context, measurable quality bars, and testable fail triggers — is what organizations are actually buying. The catalog is the proof that the format works at scale.

4. **Migration validates the approach.** Converting 120 agents from identity-role to behavioral format is a rigorous test of whether the behavioral engineering principle holds across diverse domains. If it does, the evidence is the catalog itself.

5. **Open-source potential.** The migrated catalog, published under a permissive license, could be the thing that establishes "Behavioral Agents" as a category term in the AI tooling ecosystem.

## Dependencies

- **`agent-framework-patterns`** — Research evidence for behavioral engineering (complete)
- **`sherpa-framework-extraction`** — Sherpa Studio code extraction depends on *this* initiative having started the codebase. The dependency is now reversed: this initiative unblocks `sherpa-framework-extraction` Phase 3, not the other way around.

## Review Notes

- **Phase 1 is the critical path.** The schema design determines everything downstream. Spend the time getting it right before scaffolding the codebase.
- **Phase 2 is the founding moment.** Starting `../sherpa` is a significant milestone — the first artifact of the consulting company. The conventions, rules, and project structure set the tone for everything that follows.
- **Taxonomy is an open question.** agency-agents' 12 divisions are built for a marketing agency. Sherpa serves diverse organizations. The taxonomy should be configurable, but the default set matters for first impressions.
- **Not all 120 agents are worth migrating.** Some Tier 3 agents are too thin to salvage. Better to create fewer, high-quality behavioral agents than to migrate everything for completeness.
- **Claude for everything.** These definitions are foundational infrastructure — every agent interaction in every Sherpa organization flows through them. Local models are not sufficient for this work. Each migration is a Claude session with human review.
- **Effort:** 8-11 sessions total across three phases. Phase 1 can begin immediately. Phase 2 follows schema completion. Phase 3 follows scaffolding.
