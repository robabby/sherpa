---
decision: "Proceed with initiative after pre-mortem — 7 failure modes identified, 5 mitigated, 2 kill criteria added"
date: 2026-03-16
skill: /premortem
alternatives-rejected:
  - "Kill initiative — failure modes are manageable with mitigations, but the pre-mortem revealed design adjustments needed"
confidence: medium
kill-criteria: "Foundation has no consumer that wants it as-is — validate Drizzle composability in session 1"
---

## Key Finding

The pre-mortem's #1 ranked failure mode is **"foundation without consumers"** — the risk that mcp-coordination-layer (Drizzle) and semantic-knowledge-engine (own DB) both route around the foundation. This is mitigated by testing Drizzle composability as a leading indicator in session 1 and coordinating src/db/ ownership with the SEK session.

## Design Adjustments from Pre-mortem

1. **Abstract the driver** — connection factory should return a thin interface, not raw better-sqlite3, making driver swappable (mitigates native addon risk and future node:sqlite migration)
2. **Drop DbConfig from user-facing config** — use convention-based paths instead of adding a new config section
3. **Test Drizzle composability in session 1** — don't defer this to mcp-coordination-layer
4. **Coordinate src/db/ module structure with SEK session** before starting implementation
5. **Plan MCP tool migration path** before building new tools in session 2

## Confidence Rationale

Downgraded from high (at stake) to medium. The pre-mortem surfaced two high-likelihood risks the stake didn't cover: (1) the foundation-without-consumers pattern, and (2) native addon portability conflicting with the desktop app vision. Both are mitigatable but require design changes to the plan.
