---
decision: "Proceed after stress-test — 7/8 assumptions confirmed, 0 refuted, 1 inconclusive (pre-existing env var condition)"
date: 2026-03-20
skill: /stress-test
alternatives-rejected:
  - "Add reserved-word slug validation before proceeding — deferred as seed, not blocking"
  - "Add env var graceful fallback before proceeding — pre-existing condition in multi-project system, not specific to aggregate views"
confidence: high
kill-criteria: "Re-test if Next.js changes static/dynamic route priority or if a 4th project is registered with a name matching an aggregate route"
---

The stress test confirmed all load-bearing assumptions:

- **A1 (routing priority):** Next.js definitively serves static routes before dynamic segments — verified from source code
- **A4 (sidebar fix necessary):** Without the activeProject validation fix, the sidebar generates broken 404 links in aggregate mode — the fix is correctly designed
- **A5+A6 (graceful degradation):** All domain functions return empty arrays for projects without data directories
- **A9 (no collision today):** Current slugs are safe, but no schema-level guard exists — tracked as a seed

The one inconclusive result (A2 — env var dependency) is a pre-existing condition in the multi-project system, not introduced by this initiative. It does not block aggregate views.
