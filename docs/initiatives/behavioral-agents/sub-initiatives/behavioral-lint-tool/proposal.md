---
status: pending
initiative: behavioral-lint-tool
created: 2026-03-11
updated: 2026-03-11
type: new-plan
risk: additive
targets:
  - ../sherpa
dependencies:
  - behavioral-agents
spawned-from: behavioral-agents
---

# Behavioral Lint Tool

Build and ship `behavioral-lint` — the first agent definition linter that enforces behavioral engineering principles. Validates YAML frontmatter + markdown body across 7 agent definition formats, detecting identity language, vague constraints, and experience/memory fabrication.

## State Snapshot

**What exists today:**
- 3-layer linter architecture designed (schema → content patterns → structure) in parent initiative's iteration 1
- Concrete regex patterns for identity claims (ERROR), identity-adjacent (WARNING), vague behavioral claims (WARNING)
- Zod schema sketch for Sherpa agent frontmatter validation
- Parent initiative's `proposal.md` references the linter as Phase 1 deliverable

**What this iteration's research confirms:**
- `behavioral-lint` available on npm. Zero competition for behavioral quality validation.
- Multi-format adapter pattern proven by ESLint/Vale/markdownlint. 7 formats mappable.
- 10 rule categories across 3 severity tiers, sourced from Joblint (6 adapted) + 6 new agent-specific.
- GitHub Action marketplace has zero agent definition linters. True greenfield.
- JavaScript action (node20) is the right implementation for cross-platform + fastest startup.

**Competitors (different focus):**
- `agentlint` (npm) — security scanner for agent configs. 20 rules across 8 security categories.
- `cclint` — Claude Code structural linter. Validates agents, commands, settings.
- `aigent` (crates.io) — Agent Skills spec validator. Structural + semantic scoring.
- None validate behavioral content quality.

## Proposed Changes

### Phase 1 — Core Linter (~1 session)

Build `behavioral-lint` as a TypeScript package with CLI.

**Package structure:**
```
behavioral-lint/
  package.json        # name: "behavioral-lint", bin: { "behavioral-lint": "./bin/cli.js" }
  bin/cli.js          # #!/usr/bin/env node entry point
  src/
    index.ts          # Programmatic API
    cli.ts            # CLI argument parsing
    adapters/         # Format-specific parsers
      sherpa.ts       # gray-matter + Zod schema
      text.ts         # Passthrough (freeform system prompts)
      agency-agents.ts # gray-matter + section parser
    rules/            # Rule implementations (10 categories)
      identity-claims.ts
      experience-claims.ts
      memory-claims.ts
      identity-inflation.ts
      personality-assertions.ts
      vague-constraints.ts
      capability-overclaiming.ts
      weasel-constraints.ts
      anthropomorphism.ts
      passive-constraints.ts
    engine.ts         # Runs rules against LintableRegion[]
    reporter.ts       # Formats results (text, JSON)
    schemas/          # Zod schemas for agent frontmatter
```

**Rule categories (10 rules, 3 tiers):**

| Tier | Rule | Triggers (examples) | Source |
|------|------|---------------------|--------|
| ERROR | identity-claims | "You are an expert", "You're a senior" | New (agent-specific) |
| ERROR | experience-claims | "15 years of experience", "seasoned professional" | New (agent-specific) |
| ERROR | memory-claims | "You remember", "never forgets" | New (agent-specific) |
| ERROR | identity-inflation | guru, wizard, ninja, rockstar, mastermind | Joblint DumbTitles (adapted) |
| WARNING | personality-assertions | "passionate about", "thinks like a" | New (agent-specific) |
| WARNING | vague-constraints | "ensure quality", "best practices", "robust" | Joblint Visionary (adapted) |
| WARNING | capability-overclaiming | "handle any task", "never wrong", "100% accurate" | Joblint Starter + Reassure (adapted) |
| WARNING | weasel-constraints | "very", "quite", "fairly", "obviously", "clearly" | write-good + alex |
| INFO | anthropomorphism | "believes in", "feels strongly", "enjoys" | New (agent-specific) |
| INFO | passive-constraints | Passive voice in behavioral constraints | write-good passive |

**4-dimension scoring** (adapted from Joblint's 5 dimensions):
- **identity** — How much identity language vs behavioral language
- **specificity** — How testable/measurable the constraints are
- **credibility** — How realistic the claims are
- **scope** — How well-bounded the agent's domain is

**First-run UX:** `npx behavioral-lint agents/` — works immediately, zero config.

### Phase 2 — Multi-Format Adapters (~1 session)

Add adapters for non-Sherpa formats:

| Priority | Format | Adapter | Parser |
|----------|--------|---------|--------|
| 1 | Sherpa YAML | `sherpa.ts` | gray-matter + Zod |
| 2 | Plain text | `text.ts` | none (passthrough) |
| 3 | agency-agents | `agency-agents.ts` | gray-matter + section parser |
| 4 | CrewAI | `crewai.ts` | js-yaml (role/goal/backstory) |
| 5 | Claude Code | `claude-rules.ts` | gray-matter (paths frontmatter) |
| 6 | Cursor | `cursor.ts` | gray-matter (description/globs) |
| 7 | SoulSpec | `soulspec.ts` | markdown (SOUL.md/IDENTITY.md) |

**Auto-detection:** File extension → directory location → filename pattern → content sniffing → explicit `--format` flag.

**Severity profiles:** `strict` (all ERROR), `behavioral` (default — Sherpa strict, others warn), `report` (all INFO — audit mode).

### Phase 3 — GitHub Action + Distribution (~1 session)

**GitHub Action:**
```yaml
name: 'Behavioral Lint'
description: 'Validate AI agent definitions against behavioral engineering standards'
branding:
  icon: 'shield'
  color: 'purple'
inputs:
  path:
    description: 'Path to agent definitions'
    required: false
    default: '.'
  profile:
    description: 'Severity profile (strict, behavioral, report)'
    required: false
    default: 'behavioral'
runs:
  using: 'node20'
  main: 'dist/index.js'
```

**Reporting:** Problem matchers for inline PR annotations + `$GITHUB_STEP_SUMMARY` for full report (handles 10+10+50 annotation limits).

**Distribution channels:**
1. npm (`npx behavioral-lint`) — Phase 1
2. GitHub Action (`sherpa-ai/behavioral-lint-action`) — Phase 3
3. Future: Homebrew tap, VS Code extension, Vale style package

## Rationale

1. **Zero competition.** No tool validates behavioral quality of agent definitions. `agentlint` does security. `cclint` does structure. Nobody validates whether instructions follow behavioral engineering vs identity claims.

2. **Distribution channel for behavioral engineering.** "Run this against your CrewAI agents and see how many identity claims you have" is the entry point. The linter introduces behavioral engineering to developers who've never heard the term.

3. **Product artifact for Sherpa.** The linter ships with the Sherpa behavioral agent catalog. CI validation ensures every agent definition meets the behavioral engineering standard.

4. **Research-validated rules.** Every rule traces to evidence: Zheng et al. (EMNLP 2024) for identity claims, Joblint for pattern detection, Anthropic's own guide for behavioral framing. Not opinion — research.

5. **Small scope, high leverage.** A 10-rule linter with 7 format adapters is buildable in 3 sessions. The product surface area is constrained: parse, check, report. No runtime, no orchestration, no AI inference.

## Dependencies

- **`behavioral-agents`** — The schema specification (Phase 1 of parent) defines what Sherpa agent YAML looks like. The linter validates against this schema.
- **No hard deps on `../sherpa` existing.** The linter validates any markdown/YAML files. It doesn't need the Sherpa codebase to work.

## Review Notes

- **"You are" is the hardest rule.** Anthropic recommends "You are a helpful assistant" (domain-scoping). The rule needs context: `"You are" + trait/role` = ERROR, `"You are" + tool/assistant + scope` = OK. May need a curated exception list rather than pure regex.
- **SoulSpec opposition.** Running behavioral-lint against SoulSpec files will flag 90%+ of content. The `report` profile handles this — shows identity density without errors. But it means SoulSpec users won't adopt the tool unless they want to migrate to behavioral.
- **Phase 1 can start immediately.** No blocking dependencies. The Zod schema from the parent proposal is the validation layer. The regex patterns from iteration 1 are the rule layer. The architecture from this iteration is the packaging layer.
- **Effort:** 3 sessions total. Phase 1 can begin now.
