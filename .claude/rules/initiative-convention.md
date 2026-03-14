---
globs:
  - "docs/initiatives/**"
---

# Initiative Convention

## Directoturtle Structure

Every initiative is a directory under `docs/initiatives/`. The convention is recursive — sub-initiatives follow the same structure.

**Required:** `proposal.md` with YAML frontmatter (status, initiative slug, created, updated, type, risk, targets, dependencies).

**Optional sub-directories:** `research/`, `changes/`, `phases/`, `architecture/`, `sub-initiatives/`, `branches/`.

**Optional files:** `plan.md` (added when planning begins), `activity.md` (added when work begins).

## Proposal Frontmatter

```yaml
---
status: pending | approved | in-progress | integrated | declined | archived
initiative: <slug>
created: YYYY-MM-DD
updated: YYYY-MM-DD
started: YYYY-MM-DD (added when work begins, from activity.md)
type: roadmap-update | guideline-evolution | new-skill | research-synthesis | process-change | new-plan
risk: additive | evolutionary | structural
targets:
  - <file or directory paths>
dependencies:
  - <initiative slugs this depends on, or omit if none>
spawned-from: <parent slug or null>
---
```

## Proposal Body Sections

1. **Summary** — 2-3 sentences.
2. **State Snapshot** — What you believe the current state is. Enough for reviewer to spot staleness.
3. **Proposed Changes** — Per target artifact, with exact content.
4. **Rationale** — Research or reasoning.
5. **Dependencies** — Related proposals, or "None".
6. **Review Notes** — Edge cases, trade-offs, uncertainties.

## Activity Log

`activity.md` lives inside the initiative directory. Only the owning agent writes to it.

Frontmatter: `started` (date work began), `worktree` (active worktree path or null).

Body: Lightweight activity log (key milestones, not every action).

### Seeds Section

When an initiative reaches `integrated` status, add a `## Seeds` section at the bottom of `activity.md`. Seeds are ideas, improvements, or follow-on work that surfaced during the initiative but were explicitly out of scope. Each seed is a candidate for its own future proposal. Reference where the item was scoped out (rabbit hole, no-go, or emerged during implementation).

### Follow-on Initiatives

When a seed gets picked up as new work, it becomes a **new top-level initiative** with `spawned-from: <parent-slug>` — not a sub-initiative nested inside the completed parent. Completed initiatives stay closed.

When creating a follow-on:
1. Create `docs/initiatives/<new-slug>/proposal.md` with `spawned-from: <parent-slug>`
2. Update the parent's seeds section with a forward link: `→ initiative: <new-slug>`

This creates a bidirectional trail: child points back via `spawned-from`, parent points forward via seeds. Use `sub-initiatives/` only when the parent is still `in-progress` and the sub-work is tightly coupled to the parent's completion.

## Discovery Protocol

Recursive research (`/rr`) is the standard way to discover and deepen initiatives. Each cycle: orient → focus → fan out → converge → propose → seed. See `.claude/skills/rr/SKILL.md` for the full protocol. Every research cycle must produce at least one proposal.

## Research Report JSON

Quantitative research outputs live as JSON files in `research/` with a `$schema` discriminator. The Studio file tree auto-detects these and links to the research report viewer.

- **Schema discriminator**: `{ "$schema": "wavepoint/report@1", "id": "<slug>" }` (schema name is legacy, will be renamed)
- **Registry**: `registerResearchReport(slug, filePath)` from `@sherpa/studio-core` (registry-based, slug to file path)
- **Route**: `/research/[slug]` in the Studio app — server component rendering report data
- **File tree integration**: `buildResearchChildren()` in `@sherpa/studio-core/file-tree` scans for matching JSON, attaches `meta.reportHref`

## Rules

- **Never edit shared artifacts directly** from an initiative. Write proposals instead.
- **Check `docs/initiatives/*/activity.md`** before starting work to see what's in flight.
- **Max 3 nesting levels.** Deeper = separate top-level initiative.
- **Threshold:** Use for multi-session or shared-artifact changes. Skip for single-session work.
- **Worktree per initiative.** See `.claude/rules/worktree-conventions.md` for naming, lifecycle, and cleanup.

## Approval

Two paths for approving pending proposals:

1. **Studio UI** — Click initiative → Approve button (available when lifecycle = needs-review). Triggers post-approval automation.
2. **Integration Review** — Batch review via `.claude/skills/integration-review/`. Preferred when multiple proposals target the same artifact.

Post-approval automation (via LM Studio when available):
- Creates `docs/initiatives/<slug>/activity.md` with started date
- Scaffolds `docs/initiatives/<slug>/plan.md` from proposal content
- Falls back to placeholder templates when LM Studio is unavailable

## Task Dispatch

Approved initiatives can be broken into dispatchable tasks via `/plan-tasks`. Task files live at `docs/tasks/<slug>.md`. Workers execute in isolated worktrees (claude backend) or via LM Studio API (lm-studio backend). See `docs/tasks/README.md`.
