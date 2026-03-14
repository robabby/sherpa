---
appetite: 2 sessions
shaped: 2026-03-13
---

# Appetite

2 sessions max. The spike proved the architecture works and the data flows correctly. This is a UI redesign of 3 existing components (playbooks page, playbook section in process detail, hub panel) plus their backing page component. The data layer (playbooks.ts, process-nodes artifact detection, prompt builders) stays untouched.

2 sessions because: 1 session for /design prototype + review, 1 session to implement the approved design. If it takes more than 2, the scope crept.

# Shaped Solution

**Three surfaces, one redesign pass:**

1. **`/playbooks` page** — The current page is a wall of repeated text. The redesign should make the three tracks visually distinct and comparative. The plays within each track should feel like a pipeline you can follow, not a list you read. Initiatives grouped under each playbook should be glanceable, not buried at the bottom. The page should answer "which playbook fits my initiative?" in 3 seconds.

2. **PlaybookSection in Process detail** — The current horizontal pill strip works for narrow panes but doesn't communicate progress. The redesign should make completion feel like movement — a visual pipeline where you can see where you are and what's next. The suggested play should be the dominant element. Completed plays should recede. The copy-paste buttons stay but shouldn't dominate the visual.

3. **Hub panel on home page** — The current card is functional but generic. It should convey the idea of "three tracks, each with a progression" even at thumbnail scale. Think small multiples — three tiny visual pipelines, not three rows of stats.

**What stays the same:** All data comes from the existing `playbooks.ts` module and `metadata.playbook` on ProcessNode. The prompt builders, copy button variants, and action bar integration are done. This is purely a visual/component redesign.

**The prototype deliverable:** A single HTML file that shows all three surfaces. The /design skill produces this — it's the artifact that either passes or fails Kill Criterion 1 from the stake.

# Rabbit Holes

1. **Animation choreography.** The spike already uses motion/react for entrance animations. It's tempting to add play-completion animations, pipeline flow effects, and staggered transitions. Avoid: keep entrance animations from the spike, don't add interaction animations beyond what exists. If an animation takes more than 5 lines to implement, skip it.

2. **Responsive breakpoints for the playbook page.** The 3-column grid needs to work on mobile. Don't spend time on intermediate breakpoints (tablet landscape, etc.) — just `md:grid-cols-3` with stacking below. The spike already does this.

3. **Initiative status within playbook cards.** It's tempting to show initiative progress (how many plays each initiative has completed) inside the playbook card. Don't — that's the Process detail page's job. The playbook card just lists which initiatives are on this track.

4. **Making plays clickable/expandable on the /playbooks page.** The design doc mentioned "click any play to see skill definition, trigger conditions, output artifacts." Don't build an accordion/expand system — just link the skill name to `/skills/<slug>`. If a user wants the full skill definition, they click through.

# No-Gos

- No new data fetching or studio-core changes. The redesign is UI-only.
- No interactive playbook selection (letting users override which playbook an initiative follows). That's a separate feature.
- No play execution from the UI (Thesis 3 from the stake). Copy-paste only.
- No changes to the lifecycle hero progress bar. The playbook section lives below it, not inside it.
- No new routes. `/playbooks` exists, we're redesigning it. No `/playbooks/[id]` detail pages.

# Kill Criteria

1. **If the /design prototype doesn't look meaningfully better than the spike screenshots** (the ones the user shared showing the current bland list layout), stop. The spike is functional — if the design can't improve on it visually, the redesign isn't worth the session.
2. **If implementation requires modifying more than 4 files** (`playbooks/page.tsx`, `initiative-playbook-section.tsx`, `hub-playbooks-panel.tsx`, and possibly one shared component), scope has crept. The data layer is done — only UI files should change.
