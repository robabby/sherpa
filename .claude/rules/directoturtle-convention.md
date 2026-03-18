---
description: Recursive directory structure convention for all Sherpa documentation and system organization
globs:
  - "docs/**"
alwaysApply: false
---

# Directoturtle Convention

Recursive, self-similar directory structure. "Turtles all the way down" — every level follows the same pattern, and any node can expand from a single file to a full directory without changing the convention.

## The Pattern

A directoturtle node is either a **single file** or a **directory with `index.md`**. Both are valid. The directory form is the expanded version of the file form.

### Expansion Lifecycle

```
# Stage 1: Single file — the base case
docs/architecture/governance-engine.md

# Stage 2: Needs structure — becomes a directory
docs/architecture/governance-engine/
  index.md              # The content (was the .md file)

# Stage 3: Subtopics emerge — recurse
docs/architecture/governance-engine/
  index.md              # Overview at this level
  decisions/            # Scoped decisions
  initiative-lifecycle/
    index.md            # Subtopic content
    decisions/          # Subtopic decisions
```

When a single file needs more structure, replace it with a directory of the same name (minus `.md`) containing `index.md`. The content moves into `index.md`. This is a non-breaking expansion — the topic is at the same logical path.

### Standard Files at Any Level

| File | Purpose | Required? |
|------|---------|-----------|
| `index.md` | The content at this level | Yes (when directory) |
| `decisions/` | Choices made at this scope | No |
| `activity.md` | Change history, maintenance log | No |
| `research/` | Supporting evidence, analysis | No |

These files can appear at any depth. Not every level needs all of them.

## Where Directoturtles Apply

| Area | Entry point | Notes |
|------|-------------|-------|
| `docs/architecture/` | System architecture | Organized by the seven pillars |
| `docs/decisions/` | Cross-cutting ADRs | Flat with numeric prefix, expand to dirs if needed |
| `docs/ux/` | UX guidelines | Existing files, expandable |
| `docs/initiatives/` | Initiative governance | Specialized directoturtle — uses `proposal.md` instead of `index.md` |

### Initiatives Are a Specialized Variant

Initiative directories use domain-specific file names (`proposal.md`, `plan.md`, `activity.md`) instead of `index.md`. This is intentional — the initiative convention predates the generalized directoturtle and its file names carry semantic meaning in the governance workflow. The two conventions coexist. New documentation areas use `index.md`.

## Rules

- **`index.md` is the content file.** Not `README.md`, not the folder name repeated. Exception: initiatives use `proposal.md`.
- **Expand, don't reorganize.** When a file becomes a directory, the content moves to `index.md` at the same logical path. Don't shuffle siblings.
- **Max 3 nesting levels.** Deeper than 3 means the subtopic deserves its own top-level entry. Same rule as initiatives.
- **Every directory has `index.md`.** A directory without `index.md` is a convention violation (except `decisions/` and `research/` which contain only leaf files).
- **Glob-friendly.** `**/index.md` finds every content root. `**/decisions/*.md` finds every decision. Agents navigate the tree with two glob patterns.
