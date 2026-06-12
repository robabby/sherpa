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
