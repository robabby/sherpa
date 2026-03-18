---
status: pending
initiative: byoai-convention-first
created: 2026-03-16
updated: '2026-03-16'
type: guideline-evolution
risk: evolutionary
targets:
  - docs/foundation-stone.md
  - docs/architecture/execution-pipeline/index.md
  - docs/architecture/config-as-code/index.md
  - packages/studio-core/src/dispatch.ts
  - packages/studio-core/src/dispatch-meta.ts
  - packages/studio-core/src/config/types.ts
  - CLAUDE.md
dependencies: []
informs:
  - studio-desktop-app
  - sherpa-website
  - sherpa-framework-extraction
personas:
  - engineer
  - product-manager
spawned-from: studio-desktop-app
---

# BYOAI — Convention-First Positioning

## Summary

Codify the principle that Sherpa is a conventions, governance, and methodology company — not an AI company. The AI provider is pluggable; the conventions are the product. This is already true architecturally (the dispatch system supports 8 backends across 5 CLI and 3 API providers), but it is not stated as an explicit organizational principle. This initiative makes BYOAI (Bring Your Own AI) a first-class design principle across the foundation stone, architecture docs, framework config, and public positioning.

## State Snapshot

**Foundation stone** (`docs/foundation-stone.md`, 62 lines) declares five operative pillars: Honesty, Thoughtfulness & Craftsmanship, Empowerment/Ethics/Digital Sovereignty, Integrity of Process, Community & Mutual Uplift. Pillar III (Empowerment, Ethics & Digital Sovereignty) states clients own their capabilities and data. No pillar explicitly addresses AI provider independence, though the spirit is present in Pillar III.

**Dispatch system** (`packages/studio-core/src/dispatch.ts:31-110`, `dispatch-meta.ts:23-34`) already implements multi-provider routing. Eight backends (5 CLI: claude, opencode, codex, gemini, lm-studio; 3 API: groq, google-ai, lm-studio-api) with task-type-based routing, config overrides, offline fallback, and governance constraints that force Claude for critical files. The architecture is provider-agnostic by design.

**AI SDK decision** (`docs/initiatives/ai-sdk-dispatch/decisions/additive-not-replacement.md`) established that API backends are additive alongside CLI backends, not replacements. Both backend types appear as peers in the Dispatch Center UI.

**Config system** (`packages/studio-core/src/config/types.ts:160 lines`) includes `dispatch` and `knowledge` configuration sections. The `knowledge` config already supports backend selection: `"algorithmic" | "ollama" | "api" | "dispatch"`. Provider choice is already configurable but not positioned as a core principle.

**Seven Pillars** (CLAUDE.md:43-51) describe the framework architecture. The Execution Pipeline pillar mentions "Planner/Worker/Judge dispatch" but doesn't call out provider independence. Config-as-Code mentions `defineConfig()` and theming but not BYOAI.

**The principle is architecturally real but documentationally invisible.** A new user, contributor, or client reading the foundation stone and architecture docs would not encounter "bring your own AI" as a stated principle.

## Proposed Changes

### Modified: Foundation Stone (`docs/foundation-stone.md`)

Extend Pillar III (Empowerment, Ethics & Digital Sovereignty) or add language to the preamble that makes AI provider independence explicit. Sherpa standardizes around the Anthropic ecosystem but the conventions, governance, and methodology work with any capable AI provider. The client is never locked into a provider — the same way they're never locked into a data format (markdown + git).

### Modified: Architecture Docs

Update `docs/architecture/execution-pipeline/index.md` and `docs/architecture/config-as-code/index.md` to lead with the BYOAI principle. The execution pipeline section should frame multi-backend support not as a technical feature but as a consequence of the principle that Sherpa's value is in the conventions, not the AI.

### Modified: Framework Root CLAUDE.md

Add a one-line principle statement to the root CLAUDE.md under a "Principles" or "Positioning" heading: Sherpa is a conventions, governance, and methodology company. AI providers are pluggable. This ensures every agent working in the repo encounters this framing.

### Modified: Dispatch Metadata (`packages/studio-core/src/dispatch-meta.ts`)

Add a `providerIndependence` documentation comment or constant that makes the BYOAI principle visible in the code itself, not just in docs. When a developer reads the dispatch system, the "why" should be as clear as the "how."

### Modified: Config Types (`packages/studio-core/src/config/types.ts`)

Ensure the `dispatch` config section's JSDoc and type comments reflect the BYOAI principle. Provider configuration is a first-class concern, not an advanced feature.

## Rationale

**Why codify what's already true:** The dispatch system already supports 8 backends. But "we happen to support multiple providers" and "we are a conventions company that deliberately makes AI pluggable" are different messages. The first is a feature. The second is a positioning that shapes every future decision — what gets prioritized, how the product is marketed, what partnerships are pursued, how pricing works.

**Why it touches the foundation stone:** The foundation stone is the operative declaration everything else draws from. If BYOAI isn't in the foundation, it's an implementation detail that could drift. In the foundation, it's a principle that constrains decisions.

**Why it matters for the desktop app:** The desktop app initiative depends on this principle being explicit. The thumb drive demo, the BYOAI setup flow, the "conventions are the product" positioning — all of these assume the principle is stated, not just implied.

## Dependencies

- None. This is a documentation and positioning initiative that codifies existing architecture.

## Review Notes

**This is primarily a documentation and framing initiative, not a code initiative.** The architecture already supports BYOAI. The work is making the principle visible, explicit, and authoritative across every surface a contributor, client, or user might encounter.

**Scope boundaries:**
- IN: Foundation stone update, architecture doc updates, CLAUDE.md update, code comments in dispatch system
- OUT: New provider integrations, dispatch UI changes, pricing model changes, marketing copy (that's `sherpa-website`)

**Trade-offs:**
- Stating "we standardize around Anthropic" while saying "bring your own AI" creates a tension that must be communicated carefully. The resolution: Anthropic is the recommended and best-tested ecosystem. Other providers are supported and first-class. Sherpa's value doesn't depend on which AI you use.
- Updating the foundation stone is a high-gravity change. Every word in that document carries weight. The update should be minimal and precise.

**Effort:** 1-2 sessions
**Session breakdown:**
- Session 1: Foundation stone update, architecture doc updates, CLAUDE.md update, dispatch code comments
- Session 2: Review pass, ensure consistency across all surfaces, verify no contradictions with existing docs (if needed)
