---
staked: 2026-03-13
thesis: "Keep the spike's architecture (playbooks.ts, artifact detection, prompt builders) but redesign the UI layer — the /playbooks page, PlaybookSection component, and hub panel — through the full /shape → /design pipeline"
sessions-at-risk: 2
kill-criteria-count: 2
---

# Thesis

We believe the spike's **data architecture is sound** (playbooks.ts pure module, filesystem artifact detection, prompt builder pattern) but the **UI needs a proper design pass** because the spike prioritized proving the integration worked over making the pages useful.

Evidence:
- The spike shipped in one session, builds clean, and correctly detects artifacts and surfaces playbook-aware suggestions (confirmed: `pnpm check` and `pnpm build` pass, all 11 commits functional)
- The `/playbooks` page is a basic list — three columns of repeated play descriptions with no interactivity, no visual hierarchy distinguishing the tracks, and no way to act on what you see
- The PlaybookSection in the Process detail pane works but wasn't designed with the /frontend-design skill — it's functional copy buttons, not a considered UI
- The hub panel is a minimal summary card

The spike answered "can we build this?" — yes. The redesign answers "is this worth looking at?"

# Rejected Alternatives

**Thesis 2 — Persistent playbook state in frontmatter.** Add `playbook:` and `completed-plays:` fields to proposal.md instead of inferring from filesystem. Rejected because: the current initiative count (~22) makes 8 sync reads per initiative negligible, and adding frontmatter fields creates a migration burden for all existing proposals. If perf becomes a problem, `fs.existsSync` or directory listing batching solves it without schema changes. This is a future initiative if scale demands it.

**Thesis 3 — Interactive skill orchestration.** Build server actions that execute skills directly from Studio buttons instead of copy-paste. Rejected because: this depends on MCP server infrastructure for async skill execution that doesn't exist. The copy-paste model aligns with how Claude Code actually works today — the human pastes the prompt into their session. Orchestration is a separate, larger initiative (likely `structural` risk).

# Leading Indicators

- After /shape: the appetite feels achievable in 2 sessions, rabbit holes are identified, no-gos are clear
- After /design: the prototype.html looks like something you'd want to use — the playbook page has visual identity, the process detail section feels integrated not bolted-on
- After first session of implementation: the redesigned /playbooks page renders correctly with real initiative data

# Kill Criteria

1. **If the /design prototype doesn't feel meaningfully better than the spike's current output**, stop and question whether the playbook page adds value at all — maybe the Process detail pane integration is sufficient and the standalone page is unnecessary
2. **If the redesign touches more than 5 files beyond the existing spike files**, the scope has crept past "redesign" into "rebuild" — reshape or split

# Review Trigger

After /design prototype review. If the prototype doesn't demonstrate clear value over the spike, revisit whether the standalone /playbooks page should exist.
