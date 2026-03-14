---
status: approved
initiative: studio-state-machine
created: 2026-03-06T00:00:00.000Z
updated: '2026-03-14'
started: 2026-03-06T00:00:00.000Z
type: roadmap-update
risk: evolutionary
targets:
  - packages/studio-core/src/
  - apps/studio/src/app/
  - packages/studio-ui/src/
dependencies: []
spawned-from: null
---

# Studio State Machine

Evolve Studio from a state mirror (reflects filesystem) to a state machine (understands lifecycle transitions and surfaces what's ready to advance).

## State Snapshot

Studio currently reads the flat markdown filesystem and renders it faithfully: initiatives with status badges, workstream activity logs, research trees, branch seeds, primitives catalog. The Process workspace shows 136 nodes across 6 kinds. Initiative detail views show overview, research, graph, and content tabs.

What's missing: no velocity signals (is this moving or stale?), no lifecycle intelligence (what's the natural next action?), and no feedback loop ensuring prompts/skills produce the data the UI reads. The system tracks state but doesn't suggest flow.

## Proposed Changes

### Phase 1 — Surface What Exists (~2 sessions)

Derive velocity and staleness from data already produced as side-effects of normal work. No new fields, no manual steps.

**Data sources:**
- File `mtime` on initiative directories — staleness (days since last change)
- `git log` on `docs/initiatives/<slug>/` — commit frequency, last real work date
- Workstream activity log entry count + recency — momentum signal
- Research iteration count relative to open questions — depth vs. breadth

**UI changes:**
- Age/staleness indicators on Process list items (e.g., "3 days ago", "2 weeks stale")
- Momentum badges on Mission Control initiative cards (active/cooling/stale)
- Review queue on Mission Control sorted by staleness + risk (structural proposals age faster than additive ones)
- Pending review count with aging indicator (not just count, but "3 pending > 5 days")

**Targets:** `packages/studio-core/src/` (new git/mtime data functions), `apps/studio/src/app/page.tsx` (Mission Control), `apps/studio/src/app/process/` (Process workspace)

### Phase 2 — State Machine Intelligence (~2 sessions)

Make the UI lifecycle-aware. Given an initiative's current state, surface the natural next action and the prompt that triggers it.

**Lifecycle states and transitions:**
- Has no research → "Launch /rr" (already exists as button)
- Has research, no proposal → "Ready for proposal" signal
- Has proposal (pending) → "Needs review" with review prompt
- Has proposal (approved), no plan → "Copy plan" prompt (already exists)
- Has plan, no workstream → "Needs workstream" signal
- Has workstream (active) → Show velocity from Phase 1
- Has workstream (completed) → "Ready to integrate" signal

**UI changes:**
- "Next action" indicator on each initiative in the Process list
- Lifecycle progress bar on initiative detail (where in the journey?)
- Mission Control "attention needed" section — initiatives where the next action is yours (review, approve, integrate), not the agent's (research, implement)
- Suggested prompt button that generates the right prompt for the current lifecycle stage

**Targets:** `packages/studio-core/src/` (lifecycle detection logic), `packages/studio-ui/src/` (new UI components), `packages/studio-core/src/prompts.ts` (lifecycle-aware prompt generation)

### Phase 3 — Curation Surface (~2 sessions)

Surface portfolio-level triage in Studio. The `/curate` skill writes structured snapshots to `docs/curation/YYYY-MM-DD.md` with prioritized recommendations, cross-pollination signals, and paste-ready prompts. Studio should render these as the "what should I work on next?" view.

**Data sources:**
- `docs/curation/*.md` — frontmatter (date, recommendation count, portfolio stats) + body (recommendations, cross-cuts, health)
- `docs/curation/README.md` — rolling index of snapshots

**UI changes:**
- Curation panel on Mission Control hub — latest snapshot's top 3-5 recommendations with copy-to-clipboard prompts
- Curation history page (`/app/studio/curation`) — browse past snapshots, see what was acted on vs. what persists
- Cross-pollination signals section — which initiatives share concerns (the unique insight curation provides over per-initiative views)
- "Run /curate" prompt button when the latest snapshot is > 7 days old

**The contract:** The `/curate` skill owns the data shape (frontmatter schema, recommendation format). Studio owns the presentation. Neither edits the other's artifacts. New skills that write structured output to known directories follow this same pattern — skill writes, Studio reads.

**Targets:** `packages/studio-core/src/` (curation data loader), `packages/studio-ui/src/` (curation panel + history), `apps/studio/src/app/` (hub integration + curation route)

### Phase 4 — Prompt & Skill Feedback Loop (~2 sessions)

Update the prompts and skills that Studio generates to include structured logging instructions. Close the feedback loop so Phase 1's signals stay fed over time.

**Prompt changes:**
- All Studio-generated prompts (Copy /rr, Copy plan, Launch /rr) include a structured footer instructing the agent to append a workstream activity entry on session completion
- Planning prompts include instruction to update initiative status frontmatter when transitioning (pending → in-progress, etc.)
- Research prompts include instruction to update the research README with current open questions

**Skill evaluation:**
- Audit `/rr` skill for consistency with expected logging behavior
- Audit `pickup` skill — does it capture enough for the next session to resume?
- Audit `integration-review` skill — does it update proposal status after review?

**New prompt: session close** — A lightweight "wrap up" instruction appended to all Studio prompts:
```
Before ending this session:
1. Append an activity entry to docs/workstreams/<slug>.md with today's date and a one-line summary
2. If the initiative status should change, update the frontmatter in proposal.md
3. If new open questions emerged, update research/README.md
```

**Targets:** `packages/studio-core/src/prompts.ts`, `.claude/skills/rr/`, `.claude/skills/pickup/`, `.claude/skills/integration-review/`

## Rationale

Studio is the control surface for the entire initiative system. If it only mirrors state, the human must hold the workflow model in their head — knowing which initiatives need attention, what the next step is, and whether the system's data is current. A state machine UI offloads that cognitive work.

The phased approach is critical: Phase 1 uses only data that already exists (zero behavior change required). Phase 2 adds intelligence on top of that data. Phase 3 surfaces portfolio-level triage so the human sees prioritized next actions, not just raw state. Phase 4 ensures the data pipeline stays healthy as prompts and skills evolve. Each phase validates the previous one.

The design principle emerging from Phase 3: **if a skill writes structured output to a known directory, Studio renders it.** This keeps skills and Studio coupled by contract (shared frontmatter schema) rather than by code (no skill imports Studio components, no Studio component calls a skill). New skills that follow this pattern get Studio surfaces for free.

This initiative is its own first test case. It will appear in Mission Control as pending, move through the lifecycle, and the improvements it ships will be visible on its own detail page.

## Dependencies

None. All work is scoped to Studio UI and prompt generation. No shared artifact edits (roadmap, CLAUDE.md, rules) — those would come as separate proposals if Phase 3 surfaces the need.

## Review Notes

- Phase 1's git-log integration runs `git log` at request time, which could be slow for large histories. May need to cache or limit to recent commits (last 30 days).
- Phase 2's lifecycle detection is heuristic — it infers state from directory structure, not explicit declarations. This is intentional (no new manual fields) but means edge cases are possible.
- Phase 3's curation panel depends on `/curate` having been run at least once. The skill produces `docs/curation/YYYY-MM-DD.md` — Studio just reads it. If no snapshot exists, show an empty state with a "Run /curate" prompt.
- Phase 4 modifies skills that other initiatives also use. Changes must be additive (append logging instructions) not breaking (change skill behavior).
- **Effort:** 7-9 sessions total across four phases.
