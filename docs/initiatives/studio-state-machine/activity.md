---
started: 2026-03-06
worktree: null
---

# Studio State Machine

## Activity

- **2026-03-06** — Created initiative proposal with three phases — surface existing data, state machine intelligence, prompt/skill feedback loop
- **2026-03-06** — Phase 1 implementation: velocity.ts (git/mtime/momentum/research-depth signals), live filesystem reads in dev mode (skip .studio-cache), staleness indicators in Process list, momentum badges + pending review queue + stale count in Mission Control
- **2026-03-06** — Curation folded in as Phase 3 (was separate concern, now recognized as the portfolio-level view of the same state machine). Design principle established: "if a skill writes structured output to a known directory, Studio renders it." Proposal updated to 4 phases, 7-9 sessions
- **2026-03-06** — Phase 2 implementation: lifecycle.ts (8-stage detection from directory structure + metadata), lifecycle progress bar in detail pane, next-action labels in process list, suggested lifecycle prompt button in ActionBar, "Attention Needed" section on Mission Control hub, 3 new prompt generators (review, workstream, integration)
