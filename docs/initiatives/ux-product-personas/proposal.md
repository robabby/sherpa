---
status: in-progress
initiative: ux-product-personas
created: 2026-03-15
updated: '2026-03-15'
type: research-synthesis
risk: additive
targets:
  - docs/ux/product-philosophy.md          # (new file)
  - docs/ux/product-personas.md            # (new file)
  - .claude/rules/initiative-convention.md
  - .claude/skills/propose/SKILL.md
  - .claude/rules/content-quality.md
dependencies: []
spawned-from: null
---

# UX Product Personas: Who Uses Sherpa, and How AI Rides Alongside Them

## Summary

Define product personas for Sherpa — the people who use the system day-to-day — and wire them into the initiative and planning conventions so that every future proposal explicitly declares who it serves. This is preceded by research to ground the personas in evidence rather than assumptions. A companion product philosophy document captures the strategic framing: Sherpa as a Human + AI collaboration system where the same substrate (markdown + conventions + Claude) serves every role through different entry points and conventions.

## State Snapshot

**What exists:**

Sherpa has a comprehensive UX foundation in `docs/ux/` (10 files):
- `personas.md` — Three JTBD *business* personas (Practitioner, Technical Leader, Honest Executive). These describe who discovers, evaluates, and buys Sherpa. They do not describe who uses it day-to-day or how different roles interact with the system's surfaces.
- `product-positioning.md` — Two-product thesis (framework + consulting). Positions Sherpa's market offering but doesn't address how different roles experience the product.
- `design-principles.md` — Seven design principles. Role-agnostic — apply equally everywhere.
- `voice-and-tone.md`, `agent-voice.md`, `content-guidelines.md`, `messaging-framework.md` — Voice, tone, and content systems. All oriented toward external communication and consulting, not product UX for different role types.

**What's missing:**

- **No product personas.** No document describes who uses Sherpa's surfaces (CLI, Studio, filesystem) day-to-day, what decisions they make, or how the system should adapt to their needs.
- **No product philosophy.** No document captures the strategic thesis: Sherpa as a Human + AI collaboration system where every role gets an AI companion governed by role-appropriate conventions. The node model (organizations as cross-functional groups, each with their own AI collaboration patterns) is undocumented.
- **No persona wiring.** Initiative proposals have no field declaring which personas they target. The content quality scorecard checks for persona alignment ("Persona-aligned — Content speaks to a specific persona's JTBD") but references only the business personas.
- **No role-specific convention patterns.** The initiative convention, proposal format, and quality gates are implicitly shaped by an engineering mental model. A PM or Designer using the same governance system would follow the same structural conventions but with different content patterns and quality criteria — those patterns are undefined.

**Related initiatives:**
- `studio-collaboration-platform` (approved) — Designed around a "solo operator" without formal product personas. Its morning review and task pipeline patterns would benefit from persona-informed design.
- `studio-ux-patterns` (approved) — Cross-cutting interaction primitives. Persona-agnostic by design, but empty states and command palette content could be persona-aware.
- `agentic-organization-model` (pending) — Agent instances as persistent entities. Orthogonal but complementary — agent instances serve whoever is operating the system.

## Proposed Changes

### 1. Research Phase (2-3 `/rr` cycles)

Ground the personas in evidence before defining them. Research vectors include:

- **How do cross-functional teams adopt AI collaboration tools today?** What patterns emerge when PMs and Designers (not just engineers) use AI-native workflows? What friction points exist?
- **What does "AI riding alongside" look like for non-engineering roles?** How do Product Managers, Designers, and other roles interact with AI in structured systems vs. ad-hoc chat? What conventions emerge naturally?
- **How do multi-surface AI products (Claude Code/Desktop/Web, Cursor, Copilot) differentiate their UX per audience?** What's shared substrate vs. surface-specific?
- **What organizational nodes exist beyond Eng/PM/Design?** Are marketing, finance, executive, and operations teams close enough to include in an initial persona set, or do they require fundamentally different conventions?
- **How do convention-driven systems scale across roles?** Filesystem governance works for engineers — what adaptation is needed for roles that don't live in the terminal?

Research outputs feed directly into the artifact creation phase.

### 2. `docs/ux/product-philosophy.md` (new file)

Strategic framing document capturing:

- **Thesis:** Sherpa is a Human + AI collaboration system. Every role gets an AI companion governed by conventions appropriate to their decision domain.
- **Substrate model:** Markdown + conventions + Claude is the universal layer. Studio is the legibility layer that makes the substrate accessible regardless of filesystem comfort.
- **Node model:** Organizations as cross-functional groups (nodes). Each node has role-specific conventions within the shared substrate. Product development (Eng/PM/Design) is the first node; research determines how far beyond this the initial scope extends.
- **Two-axis persona framework:** Tool proximity (filesystem ↔ Studio UI) and decision domain (implementation ↔ prioritization ↔ experience ↔ others TBD by research).
- **Relationship to business personas:** Business personas (who buys) and product personas (who uses) are orthogonal. A Practitioner could be an Engineer, PM, or Designer.
- **Anthropic coupling:** Tightly coupled to Claude's ecosystem. Conventions extend Anthropic's patterns rather than replacing them. Same artifacts, different entry points — not new artifact types.

### 3. `docs/ux/product-personas.md` (new file)

Product persona definitions for Sherpa's initial node(s). Each persona structured along the two axes:

- **JTBD** — What they're trying to accomplish with AI collaboration
- **Tool proximity** — Where they sit on the filesystem ↔ Studio spectrum
- **Decision domain** — What type of decisions they make (implementation, prioritization, experience, etc.)
- **Primary artifacts** — What they create and consume in the governance system
- **AI companion pattern** — How AI rides alongside them (dispatch, co-authoring, review, research)
- **Studio surface** — What Studio emphasizes for them
- **Quality gates** — What the Judge evaluates differently for their work
- **Convention needs** — What role-specific conventions they need within the shared substrate

Starting with Eng/PM/Design. Research determines whether additional roles are included in this initial set or scoped to follow-on work.

### 4. Convention Wiring

**`.claude/rules/initiative-convention.md`** — Add an optional `personas:` field to proposal frontmatter. Lists which product personas the initiative targets. Not required for all proposals (infrastructure work may be persona-agnostic), but expected for any user-facing change.

**`.claude/skills/propose/SKILL.md`** — Update Step 3 (Classify) or Step 4 (Write) to prompt for persona targeting when the proposal touches user-facing surfaces.

**`.claude/rules/content-quality.md`** — Update the "Persona-aligned" criterion to reference both business personas (for external content) and product personas (for product/feature work).

## Rationale

Sherpa's existing UX foundation is strong but oriented toward the consulting business. As the framework becomes a product that multiple roles use daily, the gap becomes structural: without product personas, every initiative implicitly builds for engineers because that's who built the system. This isn't a criticism — it's a natural consequence of the builder being an engineer. Making the bias explicit through personas turns unconscious defaults into conscious choices.

The product philosophy document is necessary because the persona definitions don't stand alone. Without the node model, the Anthropic coupling thesis, and the substrate-vs-surface distinction, the personas read as arbitrary role descriptions rather than a coherent product strategy.

Research before artifact creation is essential. The existing business personas were grounded in market positioning research. Product personas deserve the same rigor — especially because the "AI riding alongside every role" thesis is novel enough that assumptions are likely wrong.

## Dependencies

None. This initiative produces foundational artifacts that other initiatives will reference, but it doesn't depend on any in-flight work.

Soft coordination: `studio-collaboration-platform` and `studio-ux-patterns` would benefit from persona-informed design. Once product personas exist, those initiatives can reference them retroactively.

## Review Notes

**Scope boundary:** The research phase determines how many personas and nodes the initial set covers. Eng/PM/Design is the entry point for research, not a hard boundary. If research reveals that other nodes (marketing, executive, operations) are close enough to include without stretching the initiative, they get included. If they require fundamentally different conventions, they become follow-on work.

**What this is NOT:**
- Not a redesign of Studio's UI. Personas inform future design decisions; they don't prescribe specific UI changes.
- Not a replacement for business personas. `docs/ux/personas.md` stays unchanged. Product personas are a separate, complementary system.
- Not a role-based access control system. Personas guide design decisions; they don't gate features.

**Open questions:**
- Should product personas live alongside business personas in `docs/ux/` or in a separate location? Recommendation: same directory, clearly named (`product-personas.md` vs existing `personas.md`).
- How prescriptive should the persona-targeting convention be? A required field risks becoming checkbox compliance. An optional field risks being ignored. Research may inform the right balance.

**Effort:** 4-5 sessions

**Session breakdown:**
- Sessions 1-2: Research via `/rr` — multi-vector investigation of cross-functional AI adoption, multi-surface product design, convention scaling across roles
- Session 3: Research synthesis + product philosophy document
- Session 4: Product persona definitions grounded in research findings
- Session 5 (if needed): Convention wiring (frontmatter updates, propose skill update, quality gate update) + integration review of changes to shared artifacts
