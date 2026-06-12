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
