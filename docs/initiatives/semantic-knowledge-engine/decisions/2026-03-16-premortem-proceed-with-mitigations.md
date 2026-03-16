---
decision: "Proceed with initiative after pre-mortem — 7 failure modes identified, all mitigated, 4 kill criteria added to stake"
date: 2026-03-16
skill: /premortem
alternatives-rejected:
  - "Kill initiative — failure modes are manageable: FTS5 corruption has a known fix, demand can be gated, Claude Code native features are watchable"
confidence: medium
kill-criteria: "Demand gate failure — if agents don't organically use search_knowledge after session 2, the index solves a problem that doesn't exist yet"
---

# Pre-mortem Decision: Proceed with Mitigations

Pre-mortem identified 7 ranked failure modes across technical, scope, and context lenses. The most important finding: **the original stake's kill criteria were entirely technical, with no demand-side or context-side gates.** The technology probably works. The question is whether anyone needs it at current scale and whether the platform will solve the problem natively.

Four kill criteria added to the stake:
1. Demand gate (10+ calls across 5 sessions)
2. Claude Code native indexing watchdog
3. Context window doubling check
4. Driver alignment verification

The foundation-first approach (2 sessions at risk) remains correct. The pre-mortem strengthened the gate by adding demand validation alongside technical validation.

Key implementation mitigations to apply in session 1:
- Use standalone FTS5 table (not external content mode) to avoid sync corruption
- Enforce single-writer architecture (sync process writes, MCP tools read-only)
- Add FTS5 re-sync regression test
