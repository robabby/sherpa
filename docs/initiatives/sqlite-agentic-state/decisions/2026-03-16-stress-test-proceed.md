---
decision: "Proceed after stress-test — 8/10 assumptions confirmed, 1 refuted (pnpm config), 1 inconclusive (Drizzle node:sqlite)"
date: 2026-03-16
skill: /stress-test
alternatives-rejected:
  - "Pivot to node:sqlite — lacks .transaction() and Drizzle adapter"
  - "Pivot to libsql — viable future pivot but premature; better-sqlite3 works after config fix"
confidence: high
kill-criteria: "Re-test if pnpm.onlyBuiltDependencies causes CI/security issues"
---

## Key Finding

A11 (pnpm install builds native addon) was refuted. pnpm 10.x blocks postinstall scripts by default. Fix: add `pnpm.onlyBuiltDependencies: ["better-sqlite3"]` to root `package.json`. This is a configuration change, not an architectural problem.

All other load-bearing assumptions confirmed with concrete evidence: WAL mode, CAS with RETURNING, BEGIN IMMEDIATE, Drizzle composability, SQLite 3.51.3, connection pooling.

## Pivot Path Clarified

If better-sqlite3 becomes untenable (desktop packaging, ecosystem shift), libsql is the preferred pivot target — same API, Drizzle adapter available, WASM option. node:sqlite lacks `.transaction()` and has no Drizzle adapter.
