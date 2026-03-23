---
decision: "Proceed after stress-test — 5/7 assumptions confirmed, 1 refuted, 1 inconclusive"
date: 2026-03-21
skill: /stress-test
alternatives-rejected:
  - "Skip operational file filtering — would show malformed entries in dashboard"
  - "Use multi-line regex for extractNumberedItems — premature complexity for agent-maintained files"
confidence: high
kill-criteria: "Re-test if RESEARCH_STATE.md section headings change or Luna starts writing multi-line queue items"
---

## Context

Stress-tested 13 assumptions behind the studio-research-dashboard initiative. 7 were empirically tested.

## Key Finding

`scanResearchFiles()` has no filename filtering — operational files like `RESEARCH_STATE.md` and `PRIORITIES.md` would appear as malformed research entries with broken dates and no category. This is a load-bearing bug that must be fixed before or as part of dashboard implementation.

## Resolution

Add an ALL_CAPS filename filter to `scanResearchFiles()` as a new step in Task 1 of the implementation plan. The filter skips root-level files matching `/^[A-Z_]+\.md$/` — a convention-based approach that handles future operational files without hardcoding names.

## What Didn't Change

- Architecture design holds — no structural changes needed
- Component boundaries unchanged
- No new dependencies needed
- All other assumptions confirmed or low-risk
