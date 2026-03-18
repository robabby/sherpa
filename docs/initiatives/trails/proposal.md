---
status: pending
initiative: trails
created: 2026-03-16
updated: '2026-03-16'
type: new-plan
risk: structural
targets:
  - packages/studio-core/src/trails/              # (new — trail definitions, registry, loader)
  - packages/studio-core/src/schemas.ts
  - packages/studio-core/src/domain.ts
  - packages/studio-core/src/config/types.ts
  - packages/studio-ui/src/trail-picker.tsx        # (new — trail selection UI)
  - apps/studio/src/app/trails/                    # (new — trails route)
  - docs/trails/                                   # (new — trail definitions as markdown)
dependencies: []
informs:
  - studio-desktop-app
  - sherpa-website
  - ux-product-personas
personas:
  - product-manager
  - engineer
  - designer
spawned-from: studio-desktop-app
---

# Trails

## Summary

Define and implement a "trails" system — real engagement patterns from Sherpa Consulting's practice encoded as convention bundles. Trails are the mechanism by which the consulting practice becomes the product. They connect three surfaces: the consulting practice (where trails emerge), the product (where trails guide collaboration), and the marketing (where trails communicate value).

## State Snapshot

**Convention loading** (`packages/studio-core/src/domain.ts:225-272`) reads `.claude/rules/` markdown files with frontmatter declaring `name`, `description`, `globs`, and `alwaysApply`. Rules auto-load based on file glob matching. This is the closest existing pattern to "loading conventions for a context."

**Skills** (`.claude/skills/*/SKILL.md`) are structured bundles with frontmatter, behavioral modes, and protocols. Skills like `/rr` (recursive research) encode engagement patterns — discovery protocols, dispatch rules, output formats. Skills are the closest existing artifact to what trails would be.

**Template-to-instance research** (`docs/initiatives/agentic-organization-model/research/iteration-1/vector-2-template-to-instance-patterns.md`) documents universal patterns from Kubernetes, Azure IAM, AWS IAM, Workday, and game servers. Key finding: instances reference templates, never the reverse. Instance state falls into identity, operational state, and accumulated history.

**Dispatch routing** (`packages/studio-core/src/dispatch.ts:31-55`) maps task types to backends via configurable routes. The dispatch system already understands "this type of work needs this type of capability."

**Config system** (`packages/studio-core/src/config/types.ts`) provides `defineConfig()` with plugin support, vocabulary theming, and entity registration. No trail-related configuration exists.

**No trail concept exists anywhere in the codebase.** The term, the data structure, and the registry are all new.

## Proposed Changes

### New: Trail Definitions (`docs/trails/`)

Trail definitions as markdown with YAML frontmatter — the same pattern as rules, skills, and initiatives. Each trail encodes a real engagement pattern Sherpa Consulting has walked before. A trail is NOT a template that generates output. It is a convention bundle that shapes how Sherpa collaborates on a specific type of challenge.

A trail definition includes:
- **Pattern description** — what this challenge looks like in the wild (e.g., "Scaling a team and losing coordination")
- **Convention set** — which rules, governance structures, and behavioral defaults activate for this trail
- **Governance scaffold** — what artifacts the trail produces (initiative types, review cadences, output formats)
- **Assessment signals** — how Sherpa recognizes that a user is on this trail (or near it)
- **Emergence note** — where this trail was first walked, what engagement it came from

Trail definitions are read-only artifacts. The work a user does on a trail produces initiatives, governance artifacts, and decisions — those are the mutable instances.

### New: Trail Registry and Loader (`packages/studio-core/src/trails/`)

Domain logic for discovering, loading, and activating trails. Follows the same pattern as `getConventions()` and `getSkills()` in `domain.ts`:

- **Trail schema** — Zod schema for trail frontmatter, registered in `schemas.ts`
- **Trail loader** — `getTrails()` function that reads `docs/trails/` and returns typed trail objects
- **Trail activation** — given a selected trail, returns the convention set, governance scaffold, and behavioral defaults to apply

### Modified: Config System (`packages/studio-core/src/config/types.ts`)

Add `trails` section to `SherpaUserConfig` for trail path configuration and any organization-specific trail overrides.

### Modified: Domain Functions (`packages/studio-core/src/domain.ts`)

Register `getTrails()` alongside `getConventions()`, `getSkills()`, `getInitiatives()`. Trails become a first-class domain concept.

### New: Trail Picker UI (`packages/studio-ui/src/trail-picker.tsx`)

A component for selecting a trail — used in both the desktop app first-launch and Studio web's onboarding. Presents trails as recognizable patterns, not a feature menu. The user picks the one that resonates or describes their own situation.

### New: Trails Route (`apps/studio/src/app/trails/`)

Studio page for browsing, viewing, and understanding available trails. Shows the trail library with emergence notes — where each trail was first walked. This is also the surface where new trails can be reviewed before being added to the library.

## Rationale

**Why trails, not templates:** Templates are static scaffolds — fill in the blanks and go. Trails are living convention bundles that shape how collaboration happens. A template gives you a document structure. A trail gives you a way of working. The distinction matters because Sherpa's value is in the methodology, not in document generation.

**Why this matters organization-wide:** Trails are the connective tissue between the consulting practice, the product, and the marketing. The same trail that guides a client engagement also appears in the desktop app's first-launch experience and could be the most honest copy on the website. This coherence — where the consulting practice and the product are literally the same thing — is rare and valuable.

**Why trails emerge:** Trails are not designed by a product manager. They emerge from real engagements and accumulate over time. The product ships with the trails that exist today, and as the consulting practice encounters new terrain, new trails appear. If a trail hasn't been walked, it doesn't exist yet. This prevents the system from feeling contrived.

## Dependencies

- None. Trails can be designed and built independently. They inform the desktop app, the website, and the persona work, but nothing blocks this initiative.

## Review Notes

**Key research vectors for `/rr`:**
- Convention bundling patterns — how to compose rules, governance structures, and behavioral defaults into a single activatable unit
- Trail emergence protocol — how a completed consulting engagement gets distilled into a trail definition
- Trail-to-initiative relationship — when a user selects a trail, what governance artifacts are scaffolded and how

**Open questions:**
- How granular is a trail? Is "scaling a team" one trail, or is it a family of related trails (scaling engineering, scaling ops, scaling leadership)?
- Can trails compose? If a user is "scaling a team AND launching something new," do two trails activate, or is there a combined trail?
- How does a trail interact with the existing skill system? Skills encode workflows (`/rr`, `/propose`). Trails encode contexts. They likely complement rather than overlap, but the boundary needs definition.

**Scope boundaries:**
- IN: Trail data model, trail definitions, trail registry/loader, trail picker UI, trails route in Studio, config integration
- OUT: Desktop app first-launch (that's `studio-desktop-app`'s concern, consuming this), website copy (that's `sherpa-website`'s concern), AI-driven trail recommendation (future)

**Effort:** 3-4 sessions
**Session breakdown:**
- Session 1: Trail data model, schema, first 3-4 trail definitions written from Sherpa Consulting's actual experience
- Session 2: Trail registry, loader, domain integration, config extension
- Session 3: Trail picker component, trails route in Studio
- Session 4: Integration testing, trail activation logic, convention composition (if needed)
