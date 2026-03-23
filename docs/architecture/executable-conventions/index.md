---
doc-type: architecture
maintained-by: self-documenting-system
authored-by: ai
reviewed-by: null
last-updated: 2026-03-23
last-verified: 2026-03-23
source-initiatives:
  - studio-docs-site
  - voice-and-tone
  - self-documenting-system
---

> **AI-updated** 2026-03-23 · Awaiting human review
> Sources: studio-docs-site, voice-and-tone, self-documenting-system

# Executable Conventions

Skills, rules, CLAUDE.md templates, and hooks that encode Sherpa's process knowledge as executable artifacts. Not documentation about process — the process itself, runnable by agents.

## Overview

Sherpa's conventions are code. A rule file with glob frontmatter auto-loads when an agent touches matching files. A skill file defines a structured workflow invocable as `/skill-name`. Together, they form the behavioral substrate that makes agents productive without per-session instruction.

## Convention Rules (`.claude/rules/`)

Rules auto-load via glob frontmatter. When an agent works in a directory matching a rule's glob pattern, the rule loads into context automatically.

| Rule | Glob | Purpose |
|------|------|---------|
| `initiative-convention.md` | `docs/initiatives/**` | Directoturtle structure, proposal format, seeds |
| `behavioral-engineering.md` | — (always apply) | Constraints over identity for agent roles |
| `worktree-conventions.md` | — | Isolation model, naming, lifecycle |
| `content-quality.md` | `docs/templates/**` | 8-criterion quality scorecard |
| `effort-estimation.md` | — | Sessions as unit of effort |
| `claude-md-standards.md` | — | CLAUDE.md authoring: 30-100 lines, Mistake Test |
| `directoturtle-convention.md` | `docs/**` | Recursive directory structure |
| `provenance-convention.md` | `docs/architecture/**`, `docs/decisions/**` | Documentation authorship tracking |

## Skills (`.claude/skills/`)

16 skills spanning the full initiative lifecycle. Each is a directory with `SKILL.md` defining the protocol.

### Lifecycle Skills

```
/rr (discover) → /propose (create) → /shape (scope) → /stake (commit)
→ /design (architecture) → /spike (validate) → /stress-test (assumptions)
→ /premortem (risks) → /plan-tasks (dispatch) → /integrate (document)
→ /retro (calibrate)
```

| Skill | Phase | Purpose |
|-------|-------|---------|
| `/rr` | Discovery | Recursive research — orient, focus, fan out, converge, propose, seed |
| `/propose` | Creation | Scaffold initiative from user intent |
| `/shape` | Scoping | Appetite, boundaries, rabbit holes, no-gos |
| `/stake` | Commitment | Walk-away conditions, direction lock |
| `/design` | Architecture | Component boundaries, data flow, prototype |
| `/spike` | Validation | Timeboxed feasibility proof |
| `/stress-test` | Assumptions | Extract, classify, design falsification tests |
| `/premortem` | Risk | Imagine failure, work backward to mitigations |
| `/plan-tasks` | Dispatch | Break initiative into dispatchable task files |
| `/integrate` | Documentation | Post-initiative doc updates with provenance |
| `/retro` | Calibration | Surface patterns, produce calibration updates |

### Supporting Skills

| Skill | Purpose |
|-------|---------|
| `/integration-review` | Batch review of pending proposals |
| `/memo` | Strategic attention for 3+ converging initiatives |
| `/radar` | Technology classification (Adopt/Trial/Assess/Hold) |
| `/doc-bootstrap` | Documentation surface generation from history |
| `/ui-review` | Visual verification via Playwright screenshots |

### The Self-Improvement Loop

```
Skills produce artifacts (estimates, decisions, outcomes)
  → /retro reads completed initiatives
  → /retro surfaces patterns with evidence
  → Patterns produce calibration updates to skill defaults
  → Next skill invocation is better calibrated
```

## Content Standards

The voice-and-tone initiative produced 13 UX guideline documents in `docs/ux/`:

- **Voice & tone** — voice attributes, tone matrix, readability targets
- **Personas** — 3 business personas (Practitioner, Technical Leader, Honest Executive)
- **Product personas** — 6 product personas (Engineer, PM, Designer, Research Lead, Code Reviewer, Technical Writer)
- **Messaging framework** — Dunford positioning + Raskin narrative + JTBD per persona
- **Agent voice** — behavioral constraints → voice constraints for generated text
- **Design principles** — 7 principles aligned to Foundation Stone
- **Content guidelines** — headline test, depth test, structure patterns
- **Accessibility** — accessible content + inclusive language
- **Component content** — content patterns for 8 UI component types
- **Grammar & mechanics** — capitalization, numbers, dates, punctuation

The content quality scorecard (`.claude/rules/content-quality.md`) gates publication: 8 criteria, 3+ failures blocks publish. Maps to Worker (checklist) / Judge (evaluator) pipeline.

## Self-Documenting System

The newest convention layer: documentation that maintains itself as initiatives complete.

- **Provenance metadata** — every maintained doc carries `authored-by`, `reviewed-by`, `last-verified` frontmatter
- **Four review states** — all "live" (AI/null, AI/human, human/human, human/AI)
- **`/integrate`** — post-initiative skill that updates docs from initiative artifacts
- **`/doc-bootstrap`** — history crawl that generates the initial documentation surface
- **Directoturtle convention** — recursive `index.md` structure for all documentation

## Self-Documenting Reference Pipeline

The documentation site at `sherpa.solar/docs` auto-generates reference content from code-level artifacts at build time. Three targets:

1. **Zod schemas → reference pages:** `<SchemaReference>` RSC imports Zod schemas from `@sherpa/studio-core`, converts to JSON Schema via `zod-to-json-schema`, and renders nested TypeTable components. 130 schema fields carry `.describe()` annotations. Zero drift — the RSC reads the schema at build time, no intermediate files.

2. **MCP tools → reference pages:** Prebuild script instantiates the MCP server via InMemoryTransport, calls `listTools()`, and generates domain-grouped MDX files with parameter tables.

3. **Component catalog → reference pages:** Prebuild script reads `COMPONENT_CATALOG` from `@sherpa/studio-ui` and generates domain-grouped MDX pages.

This extends the self-documenting system: `/integrate` maintains internal architecture docs, the Content Registry maps those to external docs pages, and the reference pipeline auto-generates from structured data sources.

## Current State

**Implemented:** 16 skills, 8 convention rules, 13 UX guidelines, content quality scorecard, self-documenting system with provenance tracking, self-documenting reference pipeline (Zod schemas, MCP tools, component catalog → public docs).

**In progress:** Hook enforcement layer (specific governance hooks for Claude Code PreToolUse).

## Related

- [Governance Engine](../governance-engine/index.md) — convention rules enforce governance patterns
- [Behavioral Agent System](../behavioral-agent-system/index.md) — behavioral-engineering.md is a convention rule
- [Config-as-Code](../config-as-code/index.md) — `sherpa.config.ts` references skill slugs and rule paths

## Decisions

- [0002 — Behavioral constraints over identity claims](../../decisions/0002-behavioral-constraints-over-identity.md)
