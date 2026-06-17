---
decision: "Git-aware drift derives a doc's related code from its source-initiatives' targets, computed on-demand at render"
date: 2026-06-17
skill: /shape
alternatives-rejected:
  - "New `source-paths:` frontmatter field per doc — rejected: adds a permanent authoring burden and a second source of truth that drifts from the initiatives that actually changed the code"
  - "Pre-compute staleness during /integrate and store in frontmatter — rejected: the stored value goes stale the moment any later commit lands; the design (self-documenting-system/design.md:228) flagged this exact tradeoff"
confidence: medium
kill-criteria: "If the maintained docs' source-initiatives are mostly empty or don't resolve to real targets, the mapping is too sparse — revisit before inventing a new field"
---

A provenance-stamped doc already carries `source-initiatives` (initiative slugs). Each initiative's `proposal.md` frontmatter carries `targets:` — real code/doc paths. So a doc's "related code" is the union of `targets:` across its `source-initiatives`. Drift = `git log -- <those paths> --since=<last-verified>` returns commits. This reuses the `git log -- <path>` pattern already in `studio-core/velocity.ts` and the existing `stale` ProvenanceState — no new authoring burden, no new field.

Compute on-demand at render: the maintained set is ~14 docs, git already runs server-side, and accuracy beats the simplicity of a cached value. Revisit (add caching) only if render latency is shown to be a problem — not preemptively.
