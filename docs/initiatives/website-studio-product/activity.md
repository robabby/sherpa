---
started: 2026-03-21
worktree: .worktrees/website-studio-product
---

# Website Studio Product — Activity Log

## 2026-03-21

- Initiative created, spawned from `website-content-v2`
- Proposal approved
- Voice brief, research iteration 1, and design doc carry forward from parent
- Scope pivot: sherpa.solar becomes Sherpa Studio product site, not consulting marketing

## 2026-03-21 (Session 2)

- Session 1: Homepage rewrite — product-oriented copy for all 4 sections
- Delete stats section (how-it-works-section.tsx)
- Update header/footer/metadata for product orientation

## 2026-06-12 — Hiring-manager audit, Phase 1 (trust fixes: R3, R5, R4)

- Executing recommendations from `research/hiring-manager-audit-2026-06-12.md`
- R3: `/contact` page with Resend-backed form (`/api/contact`, env: `RESEND_API_KEY`, `CONTACT_TO_EMAIL`); `/docs/reference` index page (was 404 from footer); unlinked `directoturtle` in project-structure.mdx (term leaving external surfaces); also fixed two pre-existing 404s the audit missed: `/docs/concepts/initiative-lifecycle` (→ governance) and `/docs/guides/convention-files` (→ creating-conventions), plus missing `/docs/reference/frontmatter` index
- R5: framework-page counts now generated at build time from real repo artifacts (`generate-reference-docs.ts` → `src/generated/framework-stats.ts`): 12 roles, 14 skills, 8 rules, 104 components, 32 routes, 70 initiatives (was: 30/17/9/118/18/72). Blog stats sourced (Pluralsight 91%, MIT GenAI Divide 95%, Accenture 97%); unsourced "9% fully deployed" cut. Byline fixed: Rob Hamilton → Rob Abby (frontmatter + velite default)
- R4: footer Connect = Rob Abby · GitHub · Contact (LinkedIn pending Rob's URL); practitioner box rewritten — names Rob, links robabby.com/GitHub/contact, includes R12 stop-short copy ("source is private while open-source prep completes")
- R7 (partial): Learn added to main nav
- Verified: `pnpm check` ✓, website build ✓, link-crawl of 44 internal URLs ✓ zero 404s; after-screenshots in `research/screenshots/phase-1-after/`
- Revision (same day): Rob has no Resend key — contact form cancelled. `/contact` is now a static page linking LinkedIn / GitHub / robabby.com; `/api/contact` and form component removed; blog CTA reads "get in touch". LinkedIn URL confirmed and enabled in footer.

## 2026-06-12 — Hiring-manager audit, Phase 2 (hero + Studio bridge: R2, R1)

- R2: hero replaced with audit §9-R2 copy — H1 "Governance for AI agents, built into your codebase." + sub + two CTAs (See it running → #see-it-running anchor; Read the docs → /docs, ghost). Motion/typography system preserved. 5-second test re-run on new fold: 4/4 questions answered, desktop and 390px mobile
- R1: new `see-it-running.tsx` section on homepage (between framework paragraph and proof section) and embedded on /framework before the practitioner box. Three fresh 2× Studio captures in `apps/website/public/studio/` (process workspace with populated detail pane, task board, research dashboard), taken via throwaway auth user (deleted from auth.db after). Captions use generated stats (70 initiatives) + screenshot-verified numbers (100 missions / 9 backends / 38 shipped; nine research streams)
- Studio capture notes for Phase 3: tasks page burned the entire Linear API hourly quota (2,500 requests) during captures — per-task fetches with no cache, confirms R8 root cause. Studio auth client pins `NEXT_PUBLIC_BETTER_AUTH_URL`; captures required env override to run on a non-default port
- Verified: typecheck ✓, build ✓, 44-URL crawl zero 404s ✓; shots in `research/screenshots/phase-2-after/`

## 2026-06-12 — Hiring-manager audit, Phase 3 (Studio repairs: R8 + sign-in)

- Root cause of the six sidebar 404s: middleware redirected 13 top-level routes to `/projects/{primary}/<route>` but only process/tasks/research/docs exist project-scoped (and `/projects/[project]/docs` has no index page, so even `/docs` broke). Per the multi-project-studio design ("unscoped routes work as today" is the backwards-compatible path), chose **exempt over port**: middleware now redirects only process/tasks/research; the sidebar prefixes only those three and links everything else to its top-level page
- Root cause of the 60–67s renders: `getLinearTaskBoard` used the Linear SDK's lazy-loaded relations — 100 issues × (state + labels + per-label parent) ≈ 400+ sequential API requests per load, which also explains the burned hourly quota. Rewrote to a single raw GraphQL request, added 60s TTL cache with stale-on-error fallback in studio-core, and an empty-board fallback in the app wrapper so Linear outages degrade instead of 500ing
- Sign-in page: added "Sherpa Studio — the governance dashboard for the Sherpa framework" with a link to sherpa.solar
- Verified against a production build: all 15 routes (13 sidebar + / + /projects) return 200, zero 404s; cold loads /tasks 662ms (was 60–67s), /process 2.1s, everything else <1s; sidebar hrefs correct in aggregate and project modes; screenshots in `research/screenshots/phase-3-after/`
- Note: dispatch + playbooks pages poll continuously (networkidle never settles) — fine for users, matters for future Playwright captures

## 2026-06-13 — Hiring-manager audit, Phase 4 (content + vocabulary: R9, R7, R10)

- R9: rewrote all 7 pillar cards + 4 infrastructure cards on `/framework` to the outcome-first pattern (what it does for you, then the inventory). "directoturtle" removed from the Governance Engine card — now zero occurrences anywhere in `apps/website/src` or `content/`. Numbers still come from generated `FRAMEWORK_STATS` (12 roles, 70 initiatives, 32 routes / 104 components, 14 skills, 8 rules)
- R7: two new posts under `content/posts/`, both grounded in real repo data, every claim traceable to a file or marked as Sherpa's own experience:
  - `planner-worker-judge-pipeline.mdx` (agentic-workflows) — the three-role pipeline from `/plan-tasks` → `worker.sh` → `auto-judge.sh`; Judge role's "defaults to NEEDS WORK" disposition; the worker.sh self-review that caught two real bugs (BSD `date -j`, error-swallowing `|| true`); the `durationSeconds: -24827` log as proof
  - `100-dispatched-missions.mdx` (governance-patterns) — reliability lessons from the dispatch logs: credential boundary (Luna's PR push succeeded, PR creation blocked on missing GitHub token), exit-code-0-lies, agents catching infra bugs, honest-uncertainty (opencode rate-limit research marked "medium confidence"), task-routing economics (Gemini vs MiniMax, flagged as Sherpa's own dispatched research). Backends with real log evidence: claude, codex, gemini, google-ai, groq, openclaw (6 of 9 defined)
  - Scored both against `.claude/rules/content-quality.md`: 0 Needs Work each (sourced claims, headline test, depth test, avoid-list, structure, evidence-separated, readability, persona-aligned all Pass). Avoid-list grep clean across both posts + framework page
- R10: "The Evaluating Hiring Manager" persona written as a proposal at `persona-evaluating-hiring-manager.md` (shared artifact — held pending Rob's explicit approval, NOT merged into `docs/ux/personas.md`). New "Evaluator" persona type, 3–5 min budget, JTBD = verify a real system was designed/shipped → advocate for an interview
- Verified: `pnpm check` ✓, website build ✓ (both posts SSG-generated). Link-crawl of 31 internal URLs from /, /framework, /learn, /docs, /contact — zero 404s. After-screenshots in `research/screenshots/phase-4-after/`
- Gotcha logged: the velite Next plugin re-runs on `next start`, so a server started over a `.next` that's mid-regeneration serves stale 404s for new routes. Fix is a clean `rm -rf .next` + rebuild before serving — initial crawl/screenshots hit a stale prior-session server on 3401 and had to be redone against a verified-clean build
- Minor pre-existing quirk (out of scope, noted): post dates render one day early (`toLocaleDateString` parses the ISO date as UTC midnight, shows the prior day in Pacific). Affects every post including the existing one; candidate seed for a later fix

## 2026-06-13 — Hiring-manager audit, Phase 5 (media + scaffolds: R6, R13, R11)

> Branched from `origin/main` to avoid stacking on the then-unmerged #38 — the same stacked-base hazard that auto-closed #35. Phase 5's files don't depend on Phase 4's. (#39 merged first; #38 was rebased onto main afterward, resolving this entry's order.)

- R13: "How Sherpa built itself" case study at `content/posts/how-sherpa-built-itself.mdx` (a /learn post, not a standalone case-study route — chosen so it's auto-discoverable in the now-in-nav Learn index rather than an orphaned page, the exact "abandonment signal" the audit flagged). Walks the **dispatch-center** initiative (chosen for the fullest trail) proposal → research → 5-session plan → dispatched build → integration → seeds, quoting the real proposal.md / activity.md and embedding two Studio screenshots (the dark lifecycle-trail detail pane as hero, the task board for the execution stage). Ties back to the Phase 4 posts — it's the initiative that built the pipeline they describe. Avoid-list clean, 4m read
- R6: 90-second Studio walkthrough — **shipped as the pre-authorized shot-list fallback**, not an embedded video. A Playwright `record_video_dir` capture was trialed (process → dispatch-center trail → tasks → research) but rejected: goto-based navigation produces hard cuts, headless quality was unverifiable in this environment (no ffmpeg / no playback), and a human screen-capture signed in as the real user will look materially better on the hero. `research/walkthrough-script.md` has the exact timed shot list, recording specs, post-production steps, and the precise `see-it-running.tsx` embed snippet for Rob to drop the video into. `see-it-running.tsx` left unchanged (its three static images already ship)
- R11: public read-only Studio demo (`demo.sherpa.solar`) written as **proposal only** — new top-level initiative `docs/initiatives/studio-public-demo/` (spawned-from website-studio-product). Read-only-mode-as-a-feature (mutations 403 at the source), sanitized data path (Linear board → snapshot, no key in a public app; wavepoint excluded as client data), separate subdomain. Gated by `studio-production-auth` (done) and `open-source-readiness` (in progress). No implementation
- Studio capture mechanics: built `@sherpa/studio-app` with `NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:3300` baked, served on 3300, created a throwaway user via the sign-up API (Origin header), injected the `better-auth.session_token` cookie into Playwright, deleted the throwaway's user/session/account rows from `.sherpa/auth.db` afterward (only the real user remains). Phase 3's fixes held: every route loaded fast and 404-free. Theme note: Studio renders dark when an item is selected, light for bare lists — matches the existing Phase 2 site shots (dark process detail, light board)
- Verified: `pnpm check` ✓, website build ✓ (case study SSG-generated, both embedded images resolve 200). Clean-`.next` rebuild + 31-URL link-crawl from /, /framework, /learn, /docs, /contact — zero 404s. After-screenshots (rendered case study, learn index, Studio captures) in `research/screenshots/phase-5-after/`
