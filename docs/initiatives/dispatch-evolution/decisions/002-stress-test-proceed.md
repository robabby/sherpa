---
decision: "Proceed after stress-test — 7/10 assumptions confirmed, 1 refuted (agent param is no-op), blast radius wider than proposed"
date: 2026-03-19
skill: /stress-test
alternatives-rejected:
  - "Wire agent roles into worker.sh in this initiative — deferred to keep scope contained"
  - "Expand settings toggle beyond two backends — resolveRoute() priority makes this unnecessary"
confidence: high
kill-criteria: "Re-test if worker.sh agent wiring becomes a hard requirement before this ships"
---

# Post-Stress-Test Decision

## Key Findings

1. **Agent selection is currently cosmetic.** The dispatch API accepts `agent` but never passes it to worker.sh. This validates making agent optional but surfaces a follow-on concern.

2. **Blast radius is wider than proposed.** DispatchMode references span 26+ files including shell scripts and 24 task files, not just the 7 code targets listed. Manageable but the plan needs updating.

3. **No load-bearing assumptions were refuted.** The refuted assumption (agent param) actually strengthens the design decision to make agent selection optional. Nothing blocks proceeding.

## Actions

- Expand proposal targets to include shell scripts and task README
- Add task file migration (mechanical, scriptable) to session plan
- Defer agent role wiring to a seed/follow-on initiative
- Ship agent selection as metadata (Option C from stress test)
