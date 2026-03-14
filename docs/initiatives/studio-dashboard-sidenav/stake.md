---
staked: 2026-03-14
thesis: "Ship sidebar + dashboard restructure together as a full rewrite in 3-4 sessions"
sessions-at-risk: 4
kill-criteria-count: 3
---

# Stake: Studio Dashboard & Side-Nav

## Thesis

**We believe the full rewrite (sidebar + dashboard restructure, 3-4 sessions) is the right commitment** because:

1. `studio-state-machine` is approved but not in-progress — there is no in-flight work competing for `page.tsx` or `hub-panel.tsx`. The runway is clear.
2. Shipping the sidebar alone would leave the home page as a 12-panel scroll where half the panels exist only for navigation — a role the sidebar now handles. The dashboard dilution problem persists until the restructure happens.
3. Doing both in one pass produces a coherent result: sidebar handles navigation, dashboard handles operational status. Splitting them creates an awkward intermediate state that still needs a follow-up pass.

**Evidence strength:** Reasoned. The `studio-state-machine` status was confirmed by the initiative owner (approved, not in-progress). The architectural independence of the sidebar from the dashboard is confirmed by the codebase — `layout.tsx` wraps `{children}` without touching `page.tsx`. The 12-panel navigation-as-dashboard problem is directly observable in the current UI.

## Rejected Alternatives

### Thesis A — Sidebar-only: ship sidebar first, defer dashboard (2 sessions)

**Rejected because:** With `studio-state-machine` not in-progress, the primary reason to defer the dashboard (active file conflict) no longer applies. A sidebar-only delivery leaves the home page in a contradictory state: a sidebar provides navigation, but the dashboard still dedicates half its panels to navigation entry points (Docs, Conventions, Skills with "View all →" links). The cleanup is inevitable — better to do it now while the full context is fresh than to revisit in a separate session.

**What we'd gain by choosing this:** Faster time-to-value (2 sessions vs. 3-4). A safe incremental step. If this initiative stalls at Session 3, at least the sidebar shipped.

### Thesis C — Dashboard-first: restructure home page, add sidebar later

**Rejected because:** The dashboard restructure removes navigation panels, but without a sidebar there's no replacement for that navigation. Users would lose access to sections. The sidebar must exist before panels can be demoted. Order matters.

## Leading Indicators

Check after Session 1 (sidebar component + layout shell):

1. **Every section is reachable in one click from any page** — the sidebar renders on all routes, active section is highlighted, clicking navigates correctly.
2. **Collapsed state persists across page loads** — localStorage or cookie, the sidebar remembers its state.
3. **No regressions in section layouts** — removing per-section `<StudioHeader />` and migrating to the root layout shell doesn't break content width, padding, or breadcrumbs.

Check after Session 3 (dashboard restructure):

4. **The home page surfaces only actionable items** — pending reviews, stale initiatives, failed tasks. No panels exist solely for navigation.
5. **The home page loads in ≤2 seconds** — restructured data fetching doesn't regress from the current 12-panel server render.

## Kill Criteria

1. **If the layout shell breaks the `/process` full-width workspace layout** (which currently uses no max-width constraint), stop and reassess. The process page's 3-zone grid may not compose cleanly with a fixed sidebar. If the fix requires more than light CSS adjustment, the shell approach needs rethinking.

2. **If the sidebar adds >50ms to initial page load** (measured via Next.js server component render time). The sidebar requires no new data fetching — it's a static list of links. If it somehow introduces a performance regression, investigate before proceeding.

3. **If `studio-state-machine` moves to in-progress before Session 3**, pause the dashboard restructure and coordinate. The sidebar (Sessions 1-2) can ship regardless, but the dashboard phase needs to account for state-machine's home page mutations.

## Review Trigger

- **After Session 2:** Sidebar is shipped and stable. Confirm the dashboard restructure plan still makes sense before committing Sessions 3-4.
- **If `studio-state-machine` gets prioritized:** Re-evaluate whether to merge the dashboard restructure with state-machine's home page work or keep them sequential.
