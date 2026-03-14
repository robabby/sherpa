---
decision: "Proceed with initiative after pre-mortem — 12 failure modes identified, 8 mitigated, 2 kill criteria added"
date: 2026-03-13
skill: /premortem
alternatives-rejected:
  - "Kill initiative — failure modes are manageable; Phase 0 has independent value regardless"
confidence: medium
kill-criteria: "Demand signal — if no file collision occurs in 4 weeks of active dispatch after Phase 0, defer authority phases"
---

## Context

Pre-mortem identified 12 ranked failure modes across three lenses (technical, scope, context). Four are rated HIGH x FATAL. The strongest convergent signal: Phase 0 (transport) is independently valuable and low-risk; Phases 1-3 (authority) carry compounding risk from unvalidated demand, potential Claude Code native coordination, and circular dependencies.

## Decision

Proceed, but with a harder phase gate. Phase 0 ships independently. Phases 1-3 are gated on:
1. Phase 0 validation (multi-client, URL config, hook latency baseline)
2. Demand signal (actual collision or 4+ concurrent sessions routine)
3. Dependency resolution (inline SQLite schema, break circular deps)

## Key Pre-mortem Finding

The #1 technical risk (SDK transport only supports one session per instance) is solvable with a session manager (~100 lines) but was not in the original scope. Must be addressed in Phase 0.

## Consequences

- Two new kill criteria added to stake.md (#5 demand signal, #6 circular dependencies)
- Leading indicator #1 amended to include three validation gates
- Demand-based review trigger added (4 weeks post-Phase 0)
