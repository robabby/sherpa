---
decision: "Proceed after stress-test — 5/5 assumptions confirmed, 0 refuted"
date: 2026-03-18
skill: /stress-test
alternatives-rejected:
  - "Custom token system for MCP auth — not needed, Better Auth's API key plugin works from raw HTTP"
  - "Shared auth.db with coordination.db — separate file recommended to avoid dual connection management"
confidence: high
kill-criteria: "Re-test if Better Auth ships a breaking change to the API key plugin or drops SQLite support"
---

# Proceed After Stress Test

All five critical and high-priority assumptions confirmed. No refutations, no inconclusive results.

Key findings that inform implementation:
- **Zod 3/4 gap:** pnpm isolates, but never pass schemas across the boundary
- **Separate auth.db:** Better Auth gets its own file, not shared with coordination.db
- **CAA record check:** Required before Caddy attempts Let's Encrypt for studio.sherpa.solar
- **CrowdSec memory cap:** Set `MemoryMax=512M` on systemd unit
