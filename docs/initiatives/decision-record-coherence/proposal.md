---
status: pending
initiative: decision-record-coherence
created: 2026-03-16
updated: '2026-03-16'
type: process-change
risk: additive
targets:
  - docs/decisions/
  - .claude/rules/initiative-convention.md
  - docs/tasks/decision-coherence-review.md           # (new file)
dependencies: []
informs:
  - self-documenting-system
spawned-from: null
---

## Summary

Establish a dispatchable task that reviews `docs/decisions/` for coherence — detecting refinements, supersessions, contradictions, and missing cross-references between ADRs. Today ADR-0001 described Claude Code Hooks as universal enforcement; ADR-0008 narrowed that to autonomous agents only. The relationship was caught manually. As the decision log grows, these relationships need systematic detection.

## State Snapshot

8 ADRs in `docs/decisions/`, all `status: accepted`, all `reviewed-by: null`. Only ADR-0001 has a cross-reference field (`refined-by: [0008]`), added manually today after noticing the gap. No other ADR carries relationship metadata.

The `/integrate` skill (from `self-documenting-system`) promotes decisions from completed initiatives but does not analyze relationships between existing decisions. The `scheduled-dispatch` initiative (pending) would add time-based scheduling, but this task can run via manual `dispatch-queue.sh` without it.

Current ADR frontmatter schema has no standardized fields for inter-decision relationships.

## Proposed Changes

### 1. ADR cross-reference convention

Add standardized relationship fields to the ADR frontmatter convention. These are optional — only added when relationships exist:

- `refined-by:` — later decisions that narrow or scope this one (forward pointer)
- `refines:` — earlier decision this one narrows (back pointer)
- `supersedes:` / `superseded-by:` — full replacement (both directions)
- `related-to:` — decisions that share context but don't modify each other

Bidirectional: when the review adds `refined-by` to an older ADR, it also adds `refines` to the newer one.

### 2. Dispatchable review task

A task file (`docs/tasks/decision-coherence-review.md`) that can be dispatched overnight to a research-capable backend. The task:

- Reads all ADRs and their content
- Identifies semantic relationships (refinements, contradictions, shared context)
- Adds missing cross-reference fields to ADR frontmatter
- Produces a summary of changes made and any contradictions flagged for human review
- Runs as a `research` task-type (routes to an appropriate backend)

### 3. Convention documentation

Update the initiative convention or create a lightweight ADR convention section documenting the relationship fields, so `/integrate` can apply them when promoting future decisions.

## Rationale

Decision records are write-once by convention — you don't rewrite history, you annotate it. But annotations require someone to notice the relationship. With 8 ADRs this is manageable manually; at 20+ it won't be. A periodic automated review catches what integration-time promotion misses: relationships that only become visible after both decisions exist.

This is a dispatchable task rather than a hook or CI check because the analysis requires reading and reasoning about decision content, not just matching strings. It fits the overnight research dispatch pattern — low urgency, benefits from thorough analysis, results reviewed by human next morning.

## Dependencies

None blocking. `scheduled-dispatch` would enable recurring runs on a schedule, but manual dispatch works today.

## Review Notes

- The first run of this task is effectively a backfill across the existing 8 ADRs — expect it to surface 2-3 relationships beyond the 0001→0008 one we already caught.
- Contradictions are flagged, not resolved. The task produces a report; humans decide what to do.
- The convention fields are intentionally simple (slug lists). No rich metadata — keep it grep-friendly.
- Consider whether the `/integrate` skill should apply these fields automatically when promoting new decisions. That's a follow-on enhancement, not in scope here.

**Effort:** 1 session
**Session breakdown:**
- Session 1: Define the ADR relationship fields, create the task file, run the first coherence review across existing 8 ADRs, update any ADRs with discovered relationships
