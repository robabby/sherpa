---
started: 2026-03-15
worktree: null
---

# Activity Log — ux-product-personas

## 2026-03-15

- Initiative proposed and approved. Originated from brainstorming session exploring Sherpa's product philosophy — the analogy to Anthropic's three Claude surfaces (Code, Desktop, Web) as different lenses on the same system.
- Key strategic decisions established during brainstorming:
  - Sherpa is a Human + AI collaboration system, not a developer tool
  - Same artifacts, different entry points — not new artifact types per role
  - Two-axis persona framework: tool proximity (filesystem ↔ Studio) × decision domain
  - Node model: organizations as cross-functional groups, each with role-specific conventions
  - Business personas (who buys) and product personas (who uses) are orthogonal
  - Tightly coupled to Anthropic's ecosystem — conventions extend, not replace
- Research phase next: 2-3 `/rr` cycles before artifact creation

### /rr Iteration 1 — Landscape Survey

- Dispatched 4 parallel research vectors: multi-surface AI products, AI for non-engineering roles, cross-functional adoption patterns, convention accessibility
- Four cross-cutting findings emerged:
  1. Convention-at-creation (forms, templates, defaults) beats convention-at-review for non-engineering roles
  2. Same artifacts, role-specific projections — don't create parallel data structures per role
  3. The tool layer (MCP tools, skills, roles via defineConfig) defines the persona experience
  4. Quality gates for non-code artifacts (specs, wireframes, research) are genuine whitespace
- Research validated the node model, the substrate thesis, and the two-axis persona framework
- Next iteration should go deeper on concrete convention sets per role and the Designer persona specifically

### /rr Iteration 2 — Deep Dive

- Dispatched 4 vectors: PM conventions, Designer governance, beyond-triad personas, persona-aware quality gates
- Major emergent finding: PM/Engineer/Designer maps to Planner/Worker/Judge — the existing pipeline architecture supports multi-role by design
- Convention sets now concrete: PM gets Product Briefs + PDRs + Spec Scorecard + `/shape` skill; Designer gets DDRs + Component Specs + Design Scorecard + `/design-critique` skill
- Scope confirmed: Eng/PM/Design is the right first node. Marketing is second-wave. Executive is a Studio view, not a persona. DevOps is an Engineering config variant.
- Five-scorecard registry proposed for the Judge (Code, Design, Spec, Research, Content) — artifact type determines scorecard, not author role
- Research phase complete. Ready for artifact creation (product philosophy doc + product personas + convention wiring)

## 2026-03-16

### Artifact Creation

- Wrote `docs/ux/product-philosophy.md` — substrate model, convention-at-creation principle, node model, tool-layer-defines-persona pattern, quality gate registry, Anthropic coupling thesis, business vs product persona relationship
- Wrote `docs/ux/product-personas.md` — three product personas (Engineer/Worker, PM/Planner, Designer/Judge) with JTBD, tool proximity, decision domain, artifacts, AI companion patterns, Studio surfaces, quality gates, convention needs, and skill candidates
- Convention wiring complete:
  - `.claude/rules/initiative-convention.md` — added optional `personas:` frontmatter field
  - `.claude/skills/propose/SKILL.md` — added `personas:` to frontmatter template with guidance
  - `.claude/rules/content-quality.md` — updated persona-aligned criterion to reference both business and product personas
- All three proposal deliverables shipped. Initiative ready for integration review.
