# Iteration 1 — 2026-03-09

## Research Vectors

### Vector 1: Existing Data Audit
**Question:** What data is already available for the morning review page?
**Full report:** [iteration-1/vector-1-existing-data-audit.md](iteration-1/vector-1-existing-data-audit.md)

**Key discoveries:**
- 4 data sources ready today: sessions (29 manifests, 16 fields), workstreams (24 files, 6 frontmatter fields + activity log), initiatives (20+ with full lifecycle detection), tasks (1 file, `getTaskBoard()` returns 22-field `TaskBoardEntry`)
- `getTaskBoard()` already detects auxiliary files: `hasReport`, `hasVerdict`, `hasBlockers`
- Session manifests include initiative/role tagging derived from branch names
- Key gap: no session→task linking (one-way only), no USD cost tracking, no worker performance metrics

**Implications:**
- Tier 0 morning page can ship today using only existing `getSessions()`, `getWorkstreams()`, `getInitiatives()`, and `detectLifecycle()`
- `buildAttentionNeeded()` and `computeSessionStats()` from the Studio hub page can be directly reused

### Vector 2: Component Design
**Question:** What components and layout for `/app/studio/morning`?
**Full report:** [iteration-1/vector-2-component-design.md](iteration-1/vector-2-component-design.md)

**Key discoveries:**
- Three-section layout: status cards (full-width) → queue + detail (5/7 grid) → activity timeline (full-width)
- 4 panel components: `MorningStatusPanel`, `MorningQueuePanel`, `MorningDetailPanel`, `MorningActivityPanel`
- Server components for status/timeline, client components for queue (keyboard nav) and detail (selection state)
- URL-as-state for selection (`?selected=<id>`), sort (`?sort=priority`), mode (`?mode=triage`)

**Implications:**
- Fits cleanly within existing HubStagger/HubPanel infrastructure — no new component primitives needed
- Queue + detail pattern (PagerDuty side-panel) is the interaction anchor, not modals or page navigation

### Vector 3: Keyboard Interaction Spec
**Question:** What keyboard shortcuts for the review queue?
**Full report:** [iteration-1/vector-3-keyboard-interaction-spec.md](iteration-1/vector-3-keyboard-interaction-spec.md)

**Key discoveries:**
- Linear Triage (`1`/`2`/`3` + `J`/`K`) and Superhuman (`E` + `J`/`K`) converge on: single-key verdicts, vim-style navigation, auto-advance after action
- WavePoint keybindings: `A` approve, `R` request changes, `D` reject (with confirmation), `S` skip/snooze, `J`/`K` navigate, `X` multi-select
- Batch operations via `Shift+A` (batch approve), `Shift+D` (batch reject)
- Undo via Sonner toast (5s approve, 8s reject). Existing `useKeyboardShortcuts` hook + Sonner toast already in codebase — no new dependencies
- Server actions for verdict mutations need filesystem write access — acceptable for internal-only page

**Implications:**
- Create `useMorningReviewShortcuts` hook extending existing keyboard infrastructure
- Server actions at `apps/studio/src/app/morning/actions.ts` for approve/reject/iterate/undo

### Vector 4: Progressive Enhancement Path
**Question:** How does the morning review evolve with the pipeline?
**Full report:** [iteration-1/vector-4-progressive-enhancement.md](iteration-1/vector-4-progressive-enhancement.md)

**Key discoveries:**
- "Data as feature flag" pattern: panels check data availability, render active/empty/unavailable states
- Temporal/GitHub Actions: show pipeline chrome always, swap interior content by data state
- 4 tiers: Tier 0 (sessions + initiatives, works today) → Tier 1 (task files exist) → Tier 2 (worker logs + verdicts) → Tier 3 (analytics, confidence scoring, 10+ completed tasks)
- Empty states are onboarding moments (IBM Carbon pattern): explain WHY empty, CTA to advance
- Build order: Tier 0 (1 session), Tier 1 (1 session), Tier 2 (1-2 sessions), Tier 3 (deferred)

**Implications:**
- Ship Tier 0 immediately — it provides value with zero pipeline dependencies
- Educational empty states for Task Board/Worker Results teach the pipeline workflow before it's used
- `detectMorningTier()` utility cleanly gates progressive feature revelation

## Synthesis

Four cross-cutting patterns emerged that no single vector produced alone:

### 1. The Morning Page Is Buildable Today

All four vectors independently confirmed that Tier 0 — session recap, initiative attention queue, active workstreams, pipeline health — uses only existing data and functions. `getSessions()`, `getWorkstreams()`, `getInitiatives()`, `detectLifecycle()`, `buildAttentionNeeded()`, and `computeSessionStats()` all exist in `@/lib/studio`. The page component follows the exact pattern of the Studio hub. **There are no blockers to shipping the morning page in 1 session.**

### 2. Educational Empty States Are the Onboarding System

The progressive enhancement research (V4) and component design (V2) converge: the morning page should show ALL panels from day one, with educational empty states for not-yet-available data. This serves double duty: it teaches the operator what the pipeline will do (onboarding), and it creates natural "unlock" moments as each tier activates (motivation). The dashed-border task board saying "Use `/plan-tasks` to break an initiative into work items" is more valuable than hiding the panel entirely.

### 3. The Queue + Detail Pattern Is the Core Interaction

V2's component design and V3's keyboard spec converge on the same interaction primitive: a filterable list (left) with a detail panel (right). This is the PagerDuty Operations Console pattern, the Linear Triage pattern, and the Superhuman Split Inbox pattern. The morning page is not a dashboard to scan — it's a **work queue to process**. The status cards and activity timeline provide context; the queue + detail panel is where decisions happen.

### 4. Server Actions Enable a Closed Loop

V3's keyboard spec and V1's data audit converge: the morning review can close the loop from "review" to "action" without leaving the page. Approve → create PR (via `gh`). Request changes → create iteration task file. Reject → archive + cleanup worktree. Undo → revert frontmatter. All of this is filesystem writes to `docs/tasks/`, which the server process can do directly. **The morning page is not read-only — it's the governance interface.**

## All Sources

### Dashboard & UX Patterns
- [IBM Carbon Empty States](https://carbondesignsystem.com/patterns/empty-states-pattern/)
- [Trigger.dev Runs](https://trigger.dev/docs/runs)
- [Temporal Web UI](https://docs.temporal.io/web-ui)
- [AWS Dashboard Visibility](https://aws.amazon.com/builders-library/building-dashboards-for-operational-visibility/)
- [Smashing Mag Dashboard UX](https://www.smashingmagazine.com/2025/09/ux-strategies-real-time-dashboards/)
- [Primer Progressive Disclosure](https://primer.style/product/ui-patterns/progressive-disclosure/)
- [Eleken Empty State UX](https://www.eleken.co/blog-posts/empty-state-ux)
- [UX Design Institute Skeleton Screens](https://www.uxdesigninstitute.com/blog/whats-a-skeleton-screen/)

### Keyboard & Review UX
- [Linear Triage Docs](https://linear.app/docs/triage)
- [Linear Keyboard Shortcuts](https://shortcuts.design/tools/toolspage-linear/)
- [Superhuman Shortcuts](https://usethekeyboard.com/superhuman/)
- [Superhuman Help](https://help.superhuman.com/hc/en-us/articles/45191759067411-Speed-Up-With-Shortcuts)
- [Gmail Keyboard Shortcuts](https://support.google.com/mail/answer/6594?hl=en)
- [VS Code PR Review](https://code.visualstudio.com/blogs/2018/09/10/introducing-github-pullrequests)
- [Toast UX Patterns](https://benrajalu.net/articles/ux-of-notification-toasts)
- [Toast Best Practices](https://blog.logrocket.com/ux-design/toast-notifications/)

### Libraries & Tools
- [react-hotkeys-hook](https://www.npmjs.com/package/react-hotkeys-hook)
- [Sonner Toast](https://sonner.emilkowal.dev/)
- [GitHub Actions Queued State](https://github.com/orgs/community/discussions/147604)
- [Vercel Project Dashboard](https://vercel.com/docs/projects/project-dashboard)

## Proposals Generated

- Created `proposal.md` for morning-review-mvp sub-initiative with concrete component spec, keyboard interaction design, and 4-tier progressive enhancement roadmap.

## Open Questions for Next Iteration

1. **Should the morning page replace the Studio hub as the default landing?** The morning review is arguably the primary interaction model. Should `/app/studio` redirect to `/app/studio/morning` when the operator has pending review items?

2. **What structured summary format should workers produce?** GitHub uses Markdown job summaries. WavePoint uses JSON for research reports. Should task results adopt a `wavepoint/task-result@1` schema with typed fields (success, artifacts, metrics)?

3. **How should cost data be aggregated?** Session manifests have token counts but no USD rates. What's the rate table? Should it live in `@/lib/studio/cost.ts` or be configurable via env vars?

4. **Should the morning page integrate with the `/morning` CLI skill?** The CLI skill and the web page serve the same workflow. Should `/morning` output a URL to the web page? Should the web page surface the same verdict table?

5. **What's the right density for the queue panel?** Linear shows ~15 items visible without scrolling. With task titles + priority + status + age, how many items fit in a 5-column panel on a 1080p screen?
