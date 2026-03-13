# Agent Role Catalog

Structured role definitions for Sherpa's agent workforce. Each role is a markdown file in `roles/` with typed YAML frontmatter that defines context, permissions, and escalation paths.

## What This Is

The role catalog defines **who does what** in the agent fleet. Each role specifies:

- **Context packages** — files the agent reads at session start
- **Rules** — `.claude/rules/` files scoped to this role
- **Skills** — skills this role is authorized to use
- **Tool permissions** — what actions the role can take
- **Escalation paths** — when and to whom the role defers
- **Disposition** — default operational posture (behavioral constraint, not identity)
- **Quality bar** — concrete standards the Judge evaluates against

Each role also declares which **patterns** and **organizational structure** it implements (see `patterns.md` for the full reference).

Roles are data definitions, not behavioral code. They describe the shape of an agent's context and authority. Infrastructure that assigns roles to sessions is planned in the `agent-infrastructure` initiative.

## Category Taxonomy

| Category | Focus | Roles |
|----------|-------|-------|
| **strategy** | Product direction, prioritization, research | Product Manager, Product Owner, Research Lead |
| **design** | User experience, visual design, research | Designer, UX Researcher |
| **engineering** | System design, implementation, review | Architect, Engineer, Code Reviewer |
| **governance** | Domain-specific expertise, orchestration | *(Organization-defined)* |
| **operations** | Documentation, marketing, launch | Marketer, Technical Writer |

## Behavioral Engineering

Role definitions use research-validated behavioral constraints rather than identity roles. See `docs/initiatives/agent-framework-patterns/research/role-prompting-efficacy.md` for the evidence base.

Three new frontmatter fields shape agent behavior:

| Field | Purpose | Example |
|-------|---------|---------|
| `disposition:` | Default operational posture — how the role approaches work | `skeptical — defaults to NEEDS WORK` |
| `vibe:` | One-line summary for Studio UI agent selector (not injected as prompt) | `"The conservative who prefers boring technology that works."` |
| `quality-bar:` | 2-3 concrete standards the Judge evaluates against for this role's output | `["TypeScript types on all exports", "barrel exports updated"]` |

**Key principle:** Define roles through behavioral constraints ("default to skepticism, require evidence") not identity claims ("you are an expert engineer"). The former is reliable and testable; the latter activates unpredictable training-data associations.

## Model Tier Definitions

| Tier | Use Case | Example Models |
|------|----------|----------------|
| **high** | Complex reasoning, architectural decisions, domain expertise | Opus-class |
| **medium** | Implementation, standard review, structured output | Sonnet-class |
| **low** | Formatting, simple queries, routine tasks | Haiku-class, local OSS |

Model tier is a data annotation — actual routing to specific models is deferred to the `agent-infrastructure` initiative.

## Tool Permission Tokens

| Token | Meaning |
|-------|---------|
| `read` | Read codebase files |
| `write-code` | Modify source code (`src/`, `packages/`) |
| `write-docs` | Modify documentation (`docs/`, `CLAUDE.md`) |
| `propose` | Create initiative proposals |
| `review` | Approve or decline proposals and PRs |
| `deploy` | Git push, PR creation |
| `research` | Web search, `/rr` research cycles |

## Patterns & Structures

Each role declares which Gulli patterns it implements and which organizational structure it participates in. Full reference with all 21 patterns and 8 structures: **[`patterns.md`](patterns.md)**.

The role system uses these patterns most heavily:

- **Multi-Agent Collaboration (P7)** — The foundational pattern: specialized agents with defined roles
- **Reflection (P4)** — Engineer + Code Reviewer as Producer-Critic pair
- **Guardrails (P18)** — Tool permissions constrain what each role can do
- **Human-in-the-Loop (P13)** — Every escalation chain terminates at `human`
- **Resource-Aware Optimization (P16)** — Model tier annotations enable cost-appropriate routing
- **Exploration and Discovery (P21)** — Research Lead drives `/rr` cycles

The overall organizational structure is **Hierarchical Manager-Worker** with the human operator as manager and roles as worker definitions.

## Planner/Worker/Judge Pipeline

The role catalog feeds into an automated execution pipeline:

| Role | Actor | How |
|------|-------|-----|
| **Planner** | Human + Claude (interactive session) | `/plan-tasks` → `docs/tasks/*.md` |
| **Worker** | Claude `--print` (code) or LM Studio (content) | Background processes dispatched by Claude |
| **Judge** | Claude (same session as Planner) | Reviews output, renders verdict |

**Overnight:** Claude dispatches workers as background processes, human walks away, returns next morning.

**Morning:** `/morning` skill presents results for merge/iterate/reject decisions.

See `docs/tasks/README.md` for task file format and lifecycle.

## File Structure

```
docs/agents/
  README.md              # This file
  patterns.md            # Full pattern & structure reference (21 patterns, 8 structures)
  roles/
    product-manager.md   # Strategy — initiative prioritization, vision alignment
    product-owner.md     # Strategy — backlog, acceptance criteria, sprint decisions
    architect.md         # Engineering — system design, module boundaries
    engineer.md          # Engineering — implementation, testing, PRs
    designer.md          # Design — UI/UX, component specs, design system
    ux-researcher.md     # Design — user needs, usability, personas
    marketer.md          # Operations — positioning, messaging, launch
    technical-writer.md  # Operations — documentation, CLAUDE.md, skills
    code-reviewer.md     # Engineering — Producer-Critic, reviews engineer output
    judge.md             # Engineering — Planner/Worker/Judge verdict rendering
    research-lead.md     # Strategy — /rr cycles, synthesis, branch identification
```
