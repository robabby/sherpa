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

## Enum Reference

Valid values for constrained fields (from `packages/studio-core/src/types.ts`):

**Categories:** engineering, product, design, research, quality, operations, marketing, security, data, governance

**Model tiers:** high, medium, low

**Patterns:** prompt-chaining, routing, parallelization, reflection, tool-use, planning, multi-agent-collaboration, memory-management, learning-and-adaptation, model-context-protocol, goal-setting-and-monitoring, exception-handling, human-in-the-loop, knowledge-retrieval, inter-agent-communication, resource-aware-optimization, reasoning-techniques, guardrails, evaluation-and-monitoring, prioritization, exploration-and-discovery

**Structures:** pipeline, router-dispatcher, parallel-fan-out-in, producer-critic, hierarchical-manager-worker, expert-team, debate-consensus, scientific-method

## Rules

- **Behavioral constraints, not identity claims.** See `.claude/rules/behavioral-engineering.md`.
- **Escalation targets must exist.** Every `-> <role>` in escalation must reference a slug that exists in `docs/agents/roles/` or `agents/`. `-> human` is always valid.
- **One agent per concern.** If the description covers two unrelated domains, suggest splitting into two agents.
- **Disposition is a behavioral posture.** Format: `<adjective> — <one sentence elaboration>`. Examples: "paranoid — assume every input is hostile", "conservative — prefer proven patterns, require justification for new abstractions".
- **Vibe is a UI label.** One sentence, present tense, for the Studio workforce panel. Not injected as prompt.
