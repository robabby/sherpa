---
decision: "Build foundation (sessions 1-2) with validation gate before committing to full 5-truth model (sessions 3-6)"
date: 2026-03-16
skill: /stake
alternatives-rejected:
  - "Thesis 2 — Full-scope parallel build: rejected because sessions 3-5 rest on asserted evidence (TF-IDF, HDBSCAN, sqlite-vec) and parallelizing unvalidated work multiplies blast radius"
  - "Thesis 3 — Wait for sqlite-agentic-state: rejected because pattern overlap is ~20 lines, reconciliation costs minutes not sessions, and waiting blocks 2-3 sessions of progress"
confidence: high
kill-criteria: "node:sqlite WAL failure on file-based DB, sync >30s on ~480 files, or FTS5 fails to surface obviously relevant files"
---

# Foundation-First Build Order

Sessions 1-2 use proven technology (SQLite WAL, FTS5, filesystem sync) and deliver immediate value (queryable index + full-text search). Sessions 3-6 rest on unvalidated assumptions about TF-IDF effectiveness, sqlite-vec integration, and HDBSCAN in TypeScript.

Gate after session 2: evaluate leading indicators, check kill criteria, then decide whether to unlock the full 5-truth model or adjust scope.
