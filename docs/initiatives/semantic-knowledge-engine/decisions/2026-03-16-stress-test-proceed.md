---
decision: "Proceed after stress-test — 6/8 assumptions confirmed, 1 refuted (with known fix), 1 inconclusive (design adjustment needed)"
date: 2026-03-16
skill: /stress-test
alternatives-rejected:
  - "Refuted A6 (FTS5 external content corruption) — mitigated by using standalone FTS5 table with explicit DELETE+INSERT"
  - "Inconclusive A7 (TF-IDF over-dispersion) — mitigated by switching to rank-based retrieval instead of threshold-based"
confidence: high
kill-criteria: "Demand gate (A10) — only testable after session 2 ships"
---

# Stress Test Decision: Proceed with High Confidence on Foundation

The foundation is empirically validated:
- WAL mode: zero errors under concurrent read+write (A1)
- FTS5: available, returns relevant results (A2, A5)
- Sync: 226ms for 509 files — 22x under budget (A3)
- Concurrent reads: 4 processes, p99 = 286μs, zero errors (A8)

One refuted assumption (A6) has a known fix that the plan must incorporate before session 1. One inconclusive result (A7) requires a design adjustment for sessions 3-6 (rank-based, not threshold-based retrieval).

The only untested assumption is demand (A10) — whether agents will actually use the tools. This is gated by the stake's kill criterion #4.
