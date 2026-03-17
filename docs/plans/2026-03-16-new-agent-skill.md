# /new-agent Skill + Behavioral Schema Migration

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Create a `/new-agent` skill for scaffolding new workforce agents, and migrate the 11 existing org roles from legacy to behavioral frontmatter schema.

**Architecture:** The skill writes role files to `docs/agents/roles/` using `behavioralAgentFrontmatterSchema`. The migration updates existing files to use the same schema, then updates the org loader and Studio actions to validate against it. After this, both `agents/` (base catalog) and `docs/agents/roles/` (org roles) use the same schema.

**Tech Stack:** Markdown (skill + roles), TypeScript (schema swap in domain.ts + 2 action files)

---

### Task 1: Create the /new-agent skill

**Files:**
- Create: `.claude/skills/new-agent/SKILL.md`

**Step 1: Write the skill file**

```markdown
---
name: new-agent
description: Use when adding a new agent to the workforce. Scaffolds a behavioral role definition with workforce overlap validation. Invoked as /new-agent <description>.
---

# New Agent

Scaffold a new agent role definition for the workforce. The bridge between "we need an agent that does X" and a validated role file in `docs/agents/roles/`.

## When to Use

- Adding a new agent to the workforce
- User says "create a role for X" or "we need an agent that does X"
- NOT for editing existing roles — use the Studio RoleEditor for that

## The Protocol

### Step 1: Parse Intent

From the user's description, identify:
- **Purpose** — what does this agent do?
- **Domain** — what area does it operate in?
- **Boundaries** — what does it NOT do?

If the description is too vague to determine category and disposition, ask one clarifying question. Otherwise proceed.

### Step 2: Scan Existing Workforce

Read all files in `docs/agents/roles/` and `agents/`. Check for:

- **Category overlap** — is there already a role in the same category with similar purpose? Report it.
- **Task-type collision** — does the proposed `task-type` already belong to another role? Report it.
- **Escalation targets** — do the escalation references point to roles that actually exist? Flag any dangling references.

If overlap is found, report findings and ask the user whether to proceed, adjust scope, or abort.

### Step 3: Generate the Role Definition

Write the complete file using the behavioral agent schema. Follow the behavioral engineering convention (`.claude/rules/behavioral-engineering.md`): constraints not identity, what the agent does not who it is.

**Frontmatter fields (all required unless marked optional):**

```yaml
---
name: <slug>
display-name: <Title Case Name>
category: <engineering|product|design|research|quality|operations|marketing|security|data|governance>
disposition: "<behavioral posture> — <one sentence elaboration>"

# Behavioral
domain-scope:                          # optional — omit if general-purpose
  - <area 1>
  - <area 2>
behavioral-constraints:
  - "<concrete rule 1>"
  - "<concrete rule 2>"
quality-bar:
  - <measurable criterion 1>
  - <measurable criterion 2>
fail-triggers:                         # optional — omit if no automatic failure conditions
  - <condition that forces escalation>
output-style: "<what the role produces>" # optional

# Operational
model-tier: <high|medium|low>
task-type: <primary dispatch type>     # optional
eligible-task-types: []                # optional
patterns:                              # from AGENT_PATTERNS enum
  - <pattern-1>
  - <pattern-2>
structure: <from AGENT_STRUCTURES or null>
context-packages: []                   # CLAUDE.md paths relevant to this role
rules: []                              # rule filenames from .claude/rules/
skills: []                             # skill names
tool-permissions:
  - read
  - <others as appropriate>
escalation:
  - "<condition> -> <existing role slug>"

# Display
vibe: "<one-liner for Studio display>"
tags: []                               # optional — searchable labels
---
```

**Body structure:**

```markdown
# <Display Name>

<2-3 sentence description: what the role does, what it produces, where it fits in the workforce.>

## Constraints

<Prose elaboration on constraints that don't fit in frontmatter list items. Omit this section entirely if frontmatter covers everything.>

## Scope

**Does:** <comma-separated list of what this role produces>

**Does NOT:** <comma-separated list of explicit boundaries>
```

### Step 4: Apply Behavioral Engineering Rules

Before presenting, verify against `.claude/rules/behavioral-engineering.md`:

- [ ] No identity claims ("You are an expert X")
- [ ] No personality traits as identity ("You are skeptical")
- [ ] No experience claims ("You have 15 years of experience")
- [ ] Disposition describes behavior, not personality
- [ ] Every behavioral-constraint describes what the agent does, not who it is

### Step 5: Present for Review

Show the user:
- The slug and classification (category, model-tier)
- Disposition and vibe
- Any workforce overlap findings from Step 2
- The full generated file

Wait for feedback before writing.

### Step 6: Write

On approval, write to `docs/agents/roles/<slug>.md`.

## Rules

- **Behavioral constraints, not identity claims.** See `.claude/rules/behavioral-engineering.md`.
- **Escalation targets must exist.** Every `-> <role>` in escalation must reference a slug that exists in `docs/agents/roles/` or `agents/`. `-> human` is always valid.
- **One agent per concern.** If the description covers two unrelated domains, suggest splitting into two agents.
- **Disposition is a behavioral posture.** Format: `<adjective> — <what that means in practice>`. Examples: "paranoid — assume every input is hostile", "conservative — prefer proven patterns, require justification for new abstractions".
- **Vibe is a UI label.** One sentence, present tense, for the Studio workforce panel. Not injected as prompt.
```

**Step 2: Verify skill is loadable**

Check that the skill appears in the available skills list. Run:
```
ls .claude/skills/new-agent/SKILL.md
```
Expected: file exists with correct content.

**Step 3: Commit**

```bash
git add .claude/skills/new-agent/SKILL.md
git commit -m "feat: add /new-agent skill for scaffolding workforce agents"
```

---

### Task 2: Migrate org roles to behavioral schema

Migrate all 11 files in `docs/agents/roles/`. For each role:

1. Rename `role:` to `name:` in frontmatter
2. Add `behavioral-constraints:` to frontmatter — extract bullet items from `## Behavioral Constraints` body section
3. Add `fail-triggers:` if the body has a `## Fail Triggers` section — extract bullet items
4. Add `domain-scope:` if the role has an obvious domain (leave empty array for general-purpose roles)
5. Add `output-style:` — extract from the "does NOT" / scope paragraph
6. Add `tags:` — derive from category and task-type
7. Remove `## Behavioral Constraints` body section (now in frontmatter)
8. Remove `## Fail Triggers` body section if migrated (now in frontmatter)
9. Simplify body to: heading + description paragraph + any unique sections (e.g., judge's `## Verdict Format`) + a `## Scope` section with Does/Does NOT

**Files:**
- Modify: `docs/agents/roles/engineer.md`
- Modify: `docs/agents/roles/judge.md`
- Modify: `docs/agents/roles/architect.md`
- Modify: `docs/agents/roles/code-reviewer.md`
- Modify: `docs/agents/roles/research-lead.md`
- Modify: `docs/agents/roles/product-manager.md`
- Modify: `docs/agents/roles/product-owner.md`
- Modify: `docs/agents/roles/designer.md`
- Modify: `docs/agents/roles/marketer.md`
- Modify: `docs/agents/roles/technical-writer.md`
- Modify: `docs/agents/roles/ux-researcher.md`

**Step 1: Migrate all 11 role files**

Apply the transformation pattern from each role's current content. Use the base catalog format (`agents/security-auditor.md`) as the reference for how behavioral frontmatter should look.

Key patterns:
- `disposition:` already exists in all 11 files — keep as-is
- `quality-bar:` already exists in all 11 files — keep as-is
- `vibe:` already exists in all 11 files — keep as-is
- `behavioral-constraints:` — new, extract from body
- `fail-triggers:` — new for code-reviewer (has them), judge (has them in body); omit for roles without explicit fail conditions
- `tags:` — new, derive from role purpose

**Step 2: Spot-check three migrated files**

Read engineer.md, judge.md, and code-reviewer.md. Verify:
- [ ] `name:` replaces `role:`
- [ ] `behavioral-constraints:` present in frontmatter
- [ ] `## Behavioral Constraints` section removed from body
- [ ] Unique body sections preserved (judge's Verdict Format)
- [ ] Body has heading + description + Scope section

**Step 3: Commit**

```bash
git add docs/agents/roles/*.md
git commit -m "refactor: migrate 11 org roles from legacy to behavioral agent schema"
```

---

### Task 3: Update org role loader to behavioral schema

**Files:**
- Modify: `packages/studio-core/src/domain.ts:449-488`

**Step 1: Update the org role loader**

In `getAgentRoles()`, change the org-specific path (currently lines 449-488) to use `behavioralAgentFrontmatterSchema` instead of `agentRoleFrontmatterSchema`. Match the base catalog loader pattern (lines 407-447) for field mapping.

The org loader currently:
```typescript
const { data, content } = parseValidatedFrontmatter(source, agentRoleFrontmatterSchema)
```

Change to:
```typescript
const { data: rawData, content } = parseFrontmatter(source)
if (!rawData) continue
const parsed = behavioralAgentFrontmatterSchema.safeParse(rawData)
if (!parsed.success) continue
const data = parsed.data
```

And update the `roles.push()` call to populate behavioral fields (disposition, domainScope, behavioralConstraints, qualityBar, failTriggers, outputStyle, vibe, tags).

**Step 2: Run typecheck**

```bash
pnpm check
```
Expected: passes with no errors.

**Step 3: Commit**

```bash
git add packages/studio-core/src/domain.ts
git commit -m "refactor: use behavioral schema for org role loading"
```

---

### Task 4: Update Studio actions to behavioral schema

**Files:**
- Modify: `apps/studio/src/app/workforce/actions.ts:8,49`
- Modify: `apps/studio/src/app/app/studio/workforce/actions.ts:8,47`

**Step 1: Swap schema import in both action files**

In both files, change:
```typescript
import { agentRoleFrontmatterSchema } from "@/lib/studio/schemas"
```
to:
```typescript
import { behavioralAgentFrontmatterSchema } from "@/lib/studio/schemas"
```

And update the `safeParse` call to use `behavioralAgentFrontmatterSchema`.

Note: The behavioral schema's `.transform()` renames `role` → `name` internally, but the action only checks `result.success` — it writes back `parsed.data` (raw frontmatter from gray-matter), not the Zod output. So the transform has no effect on written files.

**Step 2: Verify schema is re-exported**

Check that `behavioralAgentFrontmatterSchema` is accessible at the `@/lib/studio/schemas` import path used by the Studio app.

**Step 3: Run typecheck**

```bash
pnpm check
```
Expected: passes with no errors.

**Step 4: Commit**

```bash
git add apps/studio/src/app/workforce/actions.ts apps/studio/src/app/app/studio/workforce/actions.ts
git commit -m "refactor: use behavioral schema for role editor validation"
```

---

### Task 5: Verify end-to-end

**Step 1: Run dev server and check workforce panel**

```bash
pnpm dev
```

Navigate to the workforce panel in Studio. Verify:
- [ ] All 11 org roles load and display correctly
- [ ] Behavioral fields (disposition, constraints) appear in role detail view
- [ ] Role editor opens and saves without errors
- [ ] Base catalog roles still load correctly

**Step 2: Final commit (if any fixes needed)**

Only if verification surfaces issues.
