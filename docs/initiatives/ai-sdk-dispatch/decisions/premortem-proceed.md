---
decision: "Proceed with initiative after pre-mortem — 21 failure modes identified, 7 mitigated, shape corrections applied"
date: 2026-03-14
skill: /premortem
alternatives-rejected:
  - "Kill initiative — failure modes are manageable with mitigations. The two fatal technical failures (T1, T2) have concrete fixes. The fatal scope failure (S2) has a simple mitigation (update DEFAULT_DISPATCH)."
  - "Defer until ecosystem stabilizes — AI tooling landscape won't stabilize in 2026. Waiting gains nothing."
confidence: medium
kill-criteria: "Session 1 gate: no end-to-end dispatched task by session end = stop. Changelog gate: AI SDK v7 or Agent SDK multi-provider = pause and reassess."
---

## Rationale

The pre-mortem found 21 failure modes across three lenses. The top 3 by likelihood × severity are all addressable:

1. **worker.sh routing** (T1, fatal) — 5-line fix, acknowledge in plan
2. **Nobody updates DEFAULT_DISPATCH** (S2, fatal) — include routing activation as Session 1 deliverable
3. **Provider resolution from SHERPA_MODEL** (T2, significant) — add SHERPA_PROVIDER env var

The context failures (C1-C5) are ecosystem risks that monitoring can detect early. The shape corrections (drop MCP Session 2 → health/data contracts, fix worker.sh claim, add SHERPA_PROVIDER) make the plan more realistic.

Confidence is medium (not high) because the initiative builds on a fast-moving ecosystem where 3 of 8 context failures could independently kill it. The changelog check ritual mitigates but doesn't eliminate this risk.
