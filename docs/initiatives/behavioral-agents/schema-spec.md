# Behavioral Agent Schema Specification

**Version:** 1.0
**Date:** 2026-03-11
**Status:** Finalized — validated against 13 Sherpa roles, Zod schema at `scripts/validate-agent.ts`

## Philosophy

A Behavioral Agent definition is a **behavioral contract**, not a persona prompt. It describes what the agent *does*, never who it *is*. Every field either narrows the agent's focus (domain scoping), constrains its approach (behavioral constraints), or defines its operational boundaries (permissions, escalation, model tier).

The format is designed to be:
- **Compositional** — the agent file is metadata + pointers. Domain context comes from the host project's files (CLAUDE.md, rules, skills), not from stuffing hundreds of lines into the agent definition.
- **Measurable** — quality bars and fail triggers are machine-evaluatable. A Judge agent can read them and render a verdict.
- **Portable** — the base catalog works in any organization. Org-specific context is injected via `context-packages`, not baked into the agent definition.
- **Minimal by default** — a useful agent needs only `name`, `display-name`, `category`, and `disposition`. Everything else is progressive enhancement.

### The Behavioral Engineering Principle

> Claude already has a character. It's already helpful, thorough, and careful. The goal of a role definition is not to give Claude a new identity — it's to provide **specific behavioral constraints and domain context** that focus its existing capabilities on the task at hand.

Four types of prompting, ranked by efficacy:

| Type | Example | Evidence | Use in Schema |
|------|---------|----------|---------------|
| **Identity role** | "You are a senior engineer" | Unreliable, activates stereotypes (Zheng et al., EMNLP 2024) | **NEVER** |
| **Behavioral constraint** | "Default to skepticism, require evidence" | Strongly supported (Anthropic prompt guide) | `disposition`, `behavioral-constraints`, `fail-triggers` |
| **Domain scoping** | "Focus on TypeScript, React, Next.js" | Supported as context-narrowing | `domain-scope` |
| **Style/tone** | "Write in a calm, precise register" | Supported for output control | `output-style` (optional) |

Full evidence base: `docs/initiatives/agent-framework-patterns/research/role-prompting-efficacy.md`

---

## File Format

Each Behavioral Agent is a single Markdown file with YAML frontmatter and a structured body.

**File naming:** `<agent-slug>.md` (kebab-case, matches `name` field)
**File location:** `agents/<agent-slug>.md` (flat directory, filtered by `category` and `tags`)

> **Migration note:** Sherpa's existing roles use `role:` instead of `name:`. The validator accepts both, with a warning on `role:`. Phase 3 migration will standardize to `name:`.

---

## Frontmatter Reference

### Required Fields

| Field | Type | Description |
|-------|------|-------------|
| `name` | `string` | Unique kebab-case identifier. Matches filename. |
| `display-name` | `string` | Human-readable name for UI display. |
| `category` | `string` | Organizational category from the project's taxonomy. |
| `disposition` | `string` | Behavioral posture — a short phrase describing the agent's default approach. Format: `<posture> — <elaboration>`. This is the single most important field. |

**`disposition` examples:**
- `skeptical — defaults to NEEDS WORK, requires evidence for every claim`
- `precise — zero tolerance for loose types or missing exports`
- `conservative — prefers proven patterns, requires justification for novelty`
- `thorough — exhaustive sourcing, every claim backed by citation`
- `restrained — remove before adding, every element must earn its place`
- `pragmatic — smallest scope that delivers value, reject gold-plating`

**The disposition test:** If a disposition describes *who the agent is* (e.g., "experienced senior engineer"), rewrite it as *what the agent does* (e.g., "precise — enforces type safety and module boundaries").

### Behavioral Fields

These define how the agent operates. All optional, but agents with more behavioral specificity produce better results. Behavioral fields can appear in frontmatter (machine-readable summary) AND/OR as expanded body sections (human-readable detail). The validator checks both locations.

| Field | Type | Description |
|-------|------|-------------|
| `domain-scope` | `string[]` | Technologies, standards, or knowledge domains this agent focuses on. Narrows the consideration space. |
| `behavioral-constraints` | `string[]` | Explicit operational instructions. Each is a testable rule. Can also appear as a `## Behavioral Constraints` body section. |
| `quality-bar` | `string[]` | Measurable acceptance criteria a Judge evaluates against. |
| `fail-triggers` | `string[]` | Conditions that force automatic NEEDS WORK. Override positive assessment. Can also appear as a `## Fail Triggers` body section. Strongly recommended for quality-gate agents. |
| `output-style` | `string` | Output format or tone constraint (e.g., "concise — max 500 words per section"). |

**Writing behavioral constraints:**
- Each constraint must be **actionable**: "Flag any function without typed exports" (good) vs. "Ensure code quality" (bad).
- Each constraint should be **testable**: could a Judge agent verify compliance by reading the output?
- Prefer **negative constraints** for critical safety: "Never approve without evidence" is stronger than "Try to provide evidence."
- Use **order constraints** when priority matters: "Review security issues first, then correctness, then style."

**Writing fail triggers:**
- Fail triggers encode the observation that LLMs default to positive assessment.
- Each trigger should describe a **specific observable condition**, not a vague quality concern.
- Fail triggers are absolutes — if the condition is met, the verdict is NEEDS WORK regardless of other quality.
- Good: "Any claim of 'no issues found' without citing specific files checked"
- Bad: "Poor quality work"

### Operational Fields

These define how the agent is dispatched and managed. All optional.

| Field | Type | Description |
|-------|------|-------------|
| `model-tier` | `"high" \| "medium" \| "low"` | Minimum model capability required. Default: `medium`. |
| `tool-permissions` | `string[]` | Allowed actions. Default: `["read"]`. |
| `escalation` | `string[]` | Directed edges in the expertise graph. Format: `"<condition> -> <agent-name>"`. |
| `context-packages` | `string[]` | Project files loaded at session start. **Empty in the base catalog** — populated per-organization. |
| `rules` | `string[]` | `.claude/rules/` files scoped to this agent. **Empty in the base catalog** — populated per-organization. |
| `skills` | `string[]` | Skills this agent is authorized to use. **Empty in the base catalog** — populated per-organization. |
| `patterns` | `string[]` | Gulli agentic design patterns this agent implements (e.g., `reflection`, `guardrails`). Optional. |
| `structure` | `string` | Gulli organizational structure this agent participates in (e.g., `producer-critic`). Optional. |

**Model tier guidance:**
- `high` — Complex reasoning, architectural decisions, domain expertise synthesis, multi-step planning
- `medium` — Implementation, standard review, structured output, routine research
- `low` — Formatting, simple validation, routine queries, checklist evaluation

**Tool permission tokens:**
- `read` — Read codebase files
- `write-code` — Modify source code
- `write-docs` — Modify documentation
- `propose` — Create initiative proposals or change requests
- `review` — Approve or decline proposals/PRs
- `deploy` — Git push, PR creation, deployment actions
- `research` — Web search, external resource access

### Display Fields

These are for UI and human decision-making. Never injected as system prompts.

| Field | Type | Description |
|-------|------|-------------|
| `vibe` | `string` | One-line summary for agent selector UI. Personality is acceptable here because it's human-facing, not model-facing. |
| `tags` | `string[]` | Searchable tags for filtering. |
| `emoji` | `string` | Optional display emoji. |

---

## Body Structure

The markdown body follows the frontmatter. Sections are optional but recommended in this order:

### 1. Description (required)

One paragraph (2-4 sentences) describing the agent's purpose and scope. Written in third person. Focuses on what the agent does and what it produces, not who it is.

**Good:** "The Code Reviewer reviews engineer output for correctness, convention adherence, security vulnerabilities, and architectural alignment. Reviews are structured: bugs and security issues first, then convention violations, then style suggestions."

**Bad:** "You are an experienced code reviewer with a keen eye for bugs and a passion for clean code."

### 2. Behavioral Constraints (recommended)

Expanded behavioral constraints beyond what fits in the frontmatter list. Use this section for constraints that need explanation or context. Format as a bullet list.

### 3. Fail Triggers (recommended for quality-gate agents)

Expanded fail trigger conditions. Especially important for Judge, Reviewer, and Auditor type agents.

### 4. Scope (recommended)

Two lists:
- **Does:** What the agent produces (artifacts, decisions, evaluations)
- **Does NOT:** What the agent explicitly avoids (prevents scope creep)

### 5. Escalation Notes (optional)

Additional context for when and how to escalate, beyond the frontmatter list.

---

## Taxonomy

Categories organize the agent catalog. The default Sherpa taxonomy:

| Category | Focus | Example Agents |
|----------|-------|----------------|
| `engineering` | System design, implementation, code quality, review | Architect, Engineer, Code Reviewer, DevOps |
| `product` | Strategy, prioritization, requirements, backlog | Product Manager, Product Owner |
| `design` | UI/UX, visual design, interaction patterns, research | Designer, UX Researcher |
| `research` | Investigation, synthesis, evidence gathering | Research Lead, Domain Researcher |
| `quality` | Testing, validation, evidence collection, judging | Judge, QA Engineer, Evidence Collector |
| `operations` | Documentation, support, process, project management | Technical Writer, Project Manager |
| `marketing` | Content, copy, campaigns, positioning, analytics | Marketer, Content Strategist, SEO Specialist |
| `security` | Audit, threat modeling, compliance, access control | Security Auditor, Identity Architect |
| `data` | Analytics, pipelines, visualization, reporting | Data Engineer, Data Analyst, Report Generator |
| `governance` | Domain-specific agents, orchestration, meta-agents | Orchestrator, Domain Expert (org-defined) |

Organizations can extend or replace this taxonomy. The schema validates that `category` matches an entry in the project's `taxonomy.yaml` (or accepts any string if no taxonomy file exists).

**WavePoint category mapping:** Sherpa's existing roles use `strategy` (maps to `product`) and `domain` (maps to `governance`). Both are accepted by the validator as legacy values.

---

## Validation Rules

A schema-compliant agent must pass:

**Errors (block merge):**
1. Frontmatter exists with `---` delimiters
2. `name` is present, kebab-case, matches filename
3. `display-name` is present and non-empty
4. `category` is present
5. `disposition` is present and non-empty
6. No identity language in `disposition` — two tiers:
   - **Error** (unambiguous identity): `/you are|you're|i am|i'm|personality:|years of experience/i`
   - **Warning** (ambiguous — may be domain reference): `/expert|senior|junior|experienced|passionate|talented/i`
7. Body contains at least one paragraph (the description)

**Warnings (flag for review):**
8. No `behavioral-constraints` defined — checked in both frontmatter and `## Behavioral Constraints` body section
9. No `quality-bar` defined (recommended for all agents)
10. No `escalation` paths defined; also flags malformed entries not matching `<condition> -> <agent-name>`
11. Disposition is longer than 120 characters (keep it concise)
12. Body contains identity language ("You are", "You're an", "Your personality", "You have N years")
13. Body exceeds 200 lines (prefer concise definitions)
14. No `fail-triggers` defined — checked in both frontmatter and `## Fail Triggers` body section. Elevated to warning for quality-gate agents (category `quality` or slug contains `judge`/`reviewer`/`auditor`/`validator`/`checker`)

**Info:**
15. No `tags` defined (helps discoverability)
16. `model-tier` not specified (defaults to `medium`)
17. Unknown frontmatter fields (not in the Behavioral Agent schema)
18. Non-standard category (not in default taxonomy — valid with custom taxonomy)

---

## Examples

### Minimal Agent

```markdown
---
name: code-formatter
display-name: Code Formatter
category: engineering
disposition: mechanical — apply formatting rules exactly, no discretion
---

# Code Formatter

Applies project formatting standards (Prettier, ESLint auto-fix) to staged files. Produces formatted diffs. Does not make judgment calls about code quality — only applies deterministic formatting rules.
```

### Standard Agent

```markdown
---
name: frontend-developer
display-name: Frontend Developer
category: engineering
disposition: precise — zero tolerance for loose types, missing accessibility, or components without error boundaries
domain-scope:
  - TypeScript
  - React
  - Next.js
  - WCAG 2.1
  - Core Web Vitals
behavioral-constraints:
  - Every component must have a TypeScript props interface — no implicit any
  - Semantic HTML over div soup — use appropriate landmark elements
  - No inline styles — use design tokens from the project's design system
  - When a task says "build X," build X — do not refactor surrounding code
  - Run lint and type-check before claiming work is complete
quality-bar:
  - No TypeScript any in exported interfaces
  - All interactive elements are keyboard-navigable
  - Components include error boundaries for async data
model-tier: medium
tool-permissions:
  - read
  - write-code
  - write-docs
  - deploy
escalation:
  - "architectural decisions -> architect"
  - "visual design -> designer"
  - "accessibility audit -> ux-researcher"
  - "approval -> human"
vibe: "Ships clean, accessible code. Types on everything, semantic HTML, no div soup."
tags:
  - frontend
  - web
  - accessibility
  - react
---

# Frontend Developer

Implements frontend features, components, and pages following the project's design system and accessibility standards. Produces typed, tested, accessible React components with proper error boundaries and semantic HTML structure.

## Behavioral Constraints

- Every component must have a TypeScript props interface — no implicit any.
- Semantic HTML over div soup — use `<nav>`, `<main>`, `<section>`, `<article>`, `<button>` where appropriate.
- No inline styles. Use design tokens from the project's design system.
- When a task says "build X," build X. Do not refactor surrounding code, add "nice to have" features, or reorganize imports in files you didn't change.
- Run lint and type-check before claiming work is complete.

## Scope

**Does:** Component implementation, page creation, form handling, data fetching integration, accessibility compliance, responsive layout.

**Does NOT:** Architectural decisions (escalate to Architect), visual design choices (request from Designer), backend API design, database schema changes.
```

### Full Agent (Quality Gate)

```markdown
---
name: judge
display-name: Judge
category: quality
disposition: skeptical — defaults to NEEDS WORK, requires evidence for every criterion marked "met"
domain-scope:
  - code review
  - acceptance criteria evaluation
  - evidence-based assessment
behavioral-constraints:
  - Default to NEEDS WORK — the worker must prove quality, the Judge does not assume it
  - Every "met" criterion must cite evidence — a file path, test output, or specific observation
  - When claiming code is correct, cite the specific test or logic that proves it
  - Never approve with a generic summary — state what was verified and what remains uncertain
  - Track attempt count — on attempt 3+, escalate to human review
quality-bar:
  - every "met" criterion cites a file path or test result
  - every "unmet" criterion includes a specific fix instruction
  - verdict summary states what was actually verified
fail-triggers:
  - Any claim of "no issues found" without citing specific files checked
  - All criteria marked "met" with no evidence column filled
  - "Production ready" or "looks good" assertions on first submission
  - Worker output that doesn't address every acceptance criterion
  - Missing test coverage for new code paths
  - Claims that don't match actual file content
model-tier: medium
tool-permissions:
  - read
  - review
escalation:
  - "architectural concerns -> architect"
  - "domain accuracy -> domain-researcher"
  - "final approval -> human"
vibe: "Defaults to NEEDS WORK — requires overwhelming proof for production readiness."
tags:
  - quality-gate
  - review
  - verdict
---

# Judge

Reviews worker output against task acceptance criteria and renders structured verdicts. The automated quality gate between worker completion and human merge. Operates in three modes: in-session (interactive review), automated (background verdict), and lightweight (checklist evaluation).

## Behavioral Constraints

- Default to NEEDS WORK. The worker must prove quality; the Judge does not assume it.
- Every "met" criterion in the evaluation table must cite evidence: a file path, test output, or specific observation.
- When claiming code is correct, cite the specific test or logic that proves it.
- Never approve with a generic summary. State what was verified, what was tested, and what remains uncertain.
- Track attempt count. On attempt 3+, escalate to human review with a summary of persistent issues.

## Fail Triggers

These conditions force an automatic NEEDS WORK verdict. Do not pass a task that exhibits any of these:

- Any claim of "no issues found" without citing specific files checked
- All criteria marked "met" with no evidence column filled
- "Production ready" or "looks good" assertions on first submission
- Worker output that doesn't address every acceptance criterion
- Missing test coverage for new code paths
- Claims that don't match actual file content (e.g., "types added" but no types in diff)

## Scope

**Does:** Read worker output, diffs, reports, and logs. Evaluate against task acceptance criteria. Render structured verdicts. Flag issues for human review. Escalate architectural or domain concerns.

**Does NOT:** Write implementation code. Modify worker output. Create PRs. Make architectural decisions.
```

---

## Migration Guide: Identity Agent → Behavioral Agent

### Step 1: Read the Source

Read the full identity-role agent definition. Identify which content falls into each category:

| Source Content | Action |
|----------------|--------|
| Identity claims ("You are an expert...") | **Discard** |
| Personality traits ("skeptical, thorough") | **Rewrite** as `disposition` behavioral posture |
| Memory claims ("You remember every...") | **Discard** or rewrite as `fail-triggers` |
| Experience claims ("15 years of...") | **Discard** |
| Critical Rules | **Extract** → `behavioral-constraints` |
| Quality standards | **Extract** → `quality-bar` |
| Automatic fail conditions | **Extract** → `fail-triggers` |
| Domain knowledge | **Extract** → `domain-scope` |
| Workflow steps | **Discard** (handled at pipeline level) |
| Communication style | **Extract** → `output-style` if specific; discard if generic |
| Success metrics | **Rewrite** as `quality-bar` if measurable; discard if aspirational |
| Code examples | **Discard** (context comes from project files) |
| Learning & Memory sections | **Discard** (handled by session infrastructure) |

### Step 2: Write the Disposition

The disposition is the single most important field. It must:
- Describe a **behavioral posture**, not a personality
- Be **concise** (under 120 characters)
- Follow the format: `<posture> — <elaboration>`
- Pass the test: "Does this describe what the agent *does*, not who it *is*?"

### Step 3: Extract Behavioral Gold

For each piece of source content that survived Step 1:
- Can it be expressed as a **testable constraint**? → `behavioral-constraints`
- Is it a **measurable quality standard**? → `quality-bar`
- Does it describe a **failure condition**? → `fail-triggers`
- Does it **narrow the domain**? → `domain-scope`

### Step 4: Augment

Add fields that identity-role formats never include:
- `model-tier` — What level of reasoning does this agent need?
- `tool-permissions` — What actions should this agent be allowed to take?
- `escalation` — When should this agent defer to another?

### Step 5: Validate

- Run the lint rules (errors + warnings)
- Read the definition aloud: does every sentence describe behavior, not identity?
- Could a Judge agent evaluate the `quality-bar` criteria by reading the output?
- Are the `fail-triggers` specific enough to be unambiguous?

---

## Agentic Design Patterns Reference

Sherpa ships with Gulli's Agentic Design Patterns as a reference library (`docs/resources/agentic-design-patterns/`). This is the theoretical foundation for how agents compose, escalate, and coordinate:

- **21 patterns** — Prompt Chaining, Routing, Reflection, Tool Use, Planning, Multi-Agent Collaboration, Guardrails, Evaluation & Monitoring, Exploration & Discovery, etc.
- **8 organizational structures** — Single Agent, Hierarchical Manager-Worker, Producer-Critic, Scientific Method, etc.
- **Complexity levels** — L1 (single agent) through L5 (autonomous swarm)

Agents in the catalog can reference patterns by name via optional `patterns` and `structure` fields. These are not required in the base schema but are available for organizations that want to make pattern relationships explicit.

```yaml
# Optional — maps agent to Gulli's pattern taxonomy
patterns:
  - reflection
  - evaluation-and-monitoring
  - guardrails
structure: producer-critic
```

## Compatibility with WavePoint

Sherpa's existing role format in `docs/agents/roles/` is a superset of this schema. When WavePoint consumes the Sherpa base catalog, it extends base agents with:

- Populated `context-packages` pointing to WavePoint CLAUDE.md files
- Populated `rules` pointing to WavePoint `.claude/rules/` files
- Domain-specific agents (Astrologer, Astrocartographer) that exist only in WavePoint

The base Sherpa catalog leaves `context-packages`, `rules`, and `skills` empty. Each consuming organization populates these with their own project files.

---

## Validation Tooling

**Zod schema + CLI:** `scripts/validate-agent.ts`

```bash
# Validate a single file
bun scripts/validate-agent.ts agents/code-reviewer.md

# Validate a directory
bun scripts/validate-agent.ts docs/agents/roles/

# JSON output (for CI)
bun scripts/validate-agent.ts agents/ --json

# Strict mode (warnings = errors, exit code 1)
bun scripts/validate-agent.ts agents/ --strict

# Show info-level diagnostics
bun scripts/validate-agent.ts agents/ --verbose
```

**Validated against:** All 13 Sherpa roles pass (0 errors). Expected warnings: `role:` → `name:` migration, missing `tags`, missing `fail-triggers` on non-quality-gate roles.
