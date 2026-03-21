---
stress-tested: 2026-03-21
assumptions-extracted: 12
tested: 8
confirmed: 4
refuted: 0
inconclusive: 2
human-required: 5
---

# Stress Test — Website Studio Product

## Assumptions Inventory

| # | Assumption | Rating | Priority | Load-bearing? |
|---|-----------|--------|----------|---------------|
| A1 | Product site positions Rob better for employment than consulting site | Reasoned | Medium | Yes — entire pivot rationale |
| A2 | Developers and product teams are the right target audience | Reasoned | Medium | Yes — determines all copy |
| A3 | Stats-as-authority is an anti-pattern (applies to unknown brands too) | Sourced | Low | No — removal already decided |
| A4 | "We" pronoun works for a solo practitioner | Reasoned | Medium | No — affects tone, not structure |
| A5 | studio-core can be imported from the website at build time | Asserted | High | Partially — integration is foundation-only scope |
| A6 | Voice artifacts from website-content-v2 are orientation-independent | Reasoned | Low | No — voice is upstream of product/consulting split |
| A7 | Consulting deprioritization won't hurt | Asserted | Medium | No — consulting stays, just deprioritized |
| A8 | Framework page can serve as primary product showcase (private repo) | Asserted | High | Yes — the product page IS the portfolio |
| A9 | "Proof of methodology" framing will resonate with employers | Reasoned | Medium | Yes — the employment positioning argument |
| A10 | "Work as we know it is changing" headline will resonate | Human decision | Low | No — Rob chose it; the voice is authentic |
| A11 | Four sections is enough for product-oriented homepage | Reasoned | Low | No — sections can be added later |
| A12 | Animation and component architecture carry forward unchanged | Sourced | Low | No — infrastructure, not content |

---

## Tests Designed

### A5: studio-core Build-Time Import (Code-testable)

**Test:** Can the website app import `@sherpa/studio-core` functions and call them in server components?

**Falsification condition:** If `getHubStats()` or `getConventions()` fail when called from a website server component, the integration assumption is false.

**Method:** Read how `apps/studio/` (which already works) integrates studio-core and check for barriers the website would face.

### A8: Product Showcase for Private Repo (Research + Code-testable)

**Test:** Does the framework page have enough substance to serve as a primary product showcase when visitors can't install, clone, or try the framework?

**Falsification condition:** If `/framework/docs` is empty or the GitHub link leads nowhere, the "explore the framework" CTA breaks the product story.

**Method:** Read the framework/docs page, check the GitHub link target, evaluate whether the product is demonstrable without public access.

### A4: "We" Pronoun Consistency (Evidence Review)

**Test:** Does the sourced research from V2 contradict the voice brief's pronoun decision?

**Falsification condition:** If the research explicitly says "we from one person" triggers skepticism and the Foundation Stone precedent doesn't override that for visitor-facing copy.

**Method:** Compare the research finding (Vector 2) against the voice brief's reasoning.

### A12: Animation Independence (Code Verification)

**Test:** Do the hero's `fadeUp` variants and `ScrollReveal` wrapper depend on specific content or structure?

**Falsification condition:** If animations are coupled to specific element counts, text lengths, or component structure, content changes could break them.

**Method:** Read animation code, verify it wraps content generically.

### A3: Stats Anti-pattern for Unknown Brands (Evidence Review)

**Test:** Does the "stats-as-authority is an anti-pattern" finding from established-brand analysis (Stripe, Linear) apply to unknown brands like Sherpa?

**Falsification condition:** If unknown brands need social proof more than established ones, removing stats without replacement could leave a credibility vacuum.

### A6: Voice Artifact Orientation Independence (Content Review)

**Test:** Do the 20 voice artifacts from the voice brief apply to a product site with equal force?

**Falsification condition:** If artifacts reference consulting-specific scenarios that don't translate to product framing.

---

## Results: Confirmed

### A5: studio-core Import — CONFIRMED (with caveats)

**Evidence:** The Studio app (`apps/studio/`) already demonstrates this exact pattern:

1. `package.json` includes `"@sherpa/studio-core": "workspace:*"`
2. `sherpa.config.ts` calls `loadConfig(root)` to initialize the project context
3. `src/lib/studio/init.ts` does a side-effect import of the config
4. Server components call `getInitiatives()`, `getConventions()`, `getSkills()`, `getHubStats()` with no arguments — the module-level default context handles path resolution

**Caveats that need addressing during implementation:**

- **Server-only constraint:** studio-core uses `node:fs` and `node:path`. It can ONLY be imported in server components. Any client component that tries to import it will break the build. This is well-understood but must be explicitly enforced.
- **Config initialization required:** The website needs a `sherpa.config.ts` and a side-effect init module (same pattern as Studio app). Without calling `defineConfig()` first, `getDefaultContext()` throws.
- **Path resolution:** The Studio app's `sherpa.config.ts` uses a smart fallback: `SHERPA_PROJECT_ROOT ?? (sherpa.json exists at cwd ? cwd : resolve(cwd, "../.."))`. The website needs the same logic since `next build` runs from the app directory, not the monorepo root.
- **withSherpa() wrapper:** The Studio app uses `withSherpa()` in `next.config.ts` to add `transpilePackages`. The website should do the same.

**Implication:** Integration is feasible but not trivial. It's ~4 files to wire up (package.json dep, sherpa.config.ts, init module, next.config.ts update). This is correctly scoped as a Session 2 task.

### A12: Animation Independence — CONFIRMED

**Evidence:** Code review of both animation systems:

- **Hero fadeUp:** Uses `motion.div` with `variants={fadeUp}` and `custom={i}` for stagger delay. The animation wraps arbitrary children — it doesn't depend on text length, element count, or content structure. Changing the h1 text, subtitle, or CTA labels has zero animation impact.
- **ScrollReveal:** A generic wrapper component (`children: ReactNode`) that fades in with `y: 20` translate when in view. Content-agnostic. Accepts optional `delay` and `className` props.
- Both handle `prefers-reduced-motion` correctly (motion/react's default behavior).

**Implication:** Content changes are fully independent of animation system. No animation work needed.

### A6: Voice Artifacts Are Orientation-Independent — CONFIRMED

**Evidence:** Review of all 20 voice artifacts from the voice brief:

- **Conviction artifacts (#1-10):** "Governance is the new sexy," "Create opportunity just as much as we automate," "We're ALL learning how to use it" — these are about AI governance philosophy, not consulting. They apply to a product site with equal or greater force.
- **Origin story artifacts (#11-15):** "I watched videos of AI doing my job" — personal experience. Orientation-independent.
- **Foundation Stone artifacts (#16-20):** "Speed is cheap," "on an ordinary Tuesday" — already processed voice. Applies to anything Sherpa builds.
- **One partial exception:** "We would rather lose an engagement than win it with inflated promises" references "engagement" (consulting). But the principle (integrity over revenue) works for product too. Minor wording adjustment may help.

**Implication:** The voice brief carries forward intact. One phrase may benefit from slight adaptation.

### A3: Stats Anti-pattern for Unknown Brands — CONFIRMED

**Evidence:** The research finding is actually stronger for unknown brands:

- Established brands (Stripe, Linear) can afford stats because they have independent credibility. They choose not to use them because stats-as-authority is a weak signal even with credibility.
- Unknown brands using borrowed stats (91% of C-suite execs...) look like they're compensating for lack of their own credibility. The stats aren't about Sherpa — they're about someone else's research.
- The replacement (practitioner specificity — naming what you actually built) is the credibility mechanism that works for unknown brands. "Behavioral agent definitions, filesystem conventions, quality gates" is specific in a way that only the builder would describe.

**Implication:** Removing stats is even more important for Sherpa than for established brands. No change needed.

---

## Results: Inconclusive

### A8: Framework Page as Product Showcase (Private Repo) — INCONCLUSIVE

**Evidence:**

- The framework is private. The GitHub repo (`robabby/sherpa`) is not public. The footer link (`https://github.com/sherpa-consulting`) points to an org page, not the actual repo.
- The `/framework/docs` page exists but is a stub: 4-step quickstart with an honest disclaimer ("Comprehensive framework documentation is in progress") and a redirect to GitHub.
- The "Getting started" CTA leads somewhere that says "documentation is in progress" — this is honest but underwhelming for a product site's primary showcase.
- The studio-core integration would add live data (convention counts, skill counts, initiative stats) which proves the system is real — but visitors still can't install it.

**Why inconclusive, not refuted:** The proposal's purpose is portfolio/proof-of-methodology, not "product adoption." A portfolio doesn't need a "try it" button — it needs to demonstrate what was built and how. The studio-core live data serves this purpose. But the product-site framing ("explore the framework," "get started") creates expectations the current state can't meet.

**The tension:** The proposal frames sherpa.solar as a "product site" but the product isn't available. This creates a gap between framing ("here's a product") and reality ("here's a portfolio piece"). The site needs to own which one it is.

**Recommended resolution:** Reframe from "product you can try" to "system you can see running." The framework page should show the system's actual state (via studio-core data) rather than inviting visitors to install it. The CTA shifts from "Get Started" to "See the framework" or "How it works." The /framework/docs quickstart stays but is positioned as "when the framework is public" rather than "do this now." This aligns with the employment/portfolio purpose without creating false expectations.

### A4: "We" Pronoun — INCONCLUSIVE

**Evidence:**

- **Research V2 (Sourced):** "First person ('I') is standard for solo/small firms. 'We' from one person is a lie the visitor can feel." Analyzed 8 successful anti-template sites. Clear finding.
- **Voice brief (Human decision):** Chose "we" with three justifications: (1) team voice, (2) inclusive "we all," (3) Foundation Stone register.
- **Updated headline:** "Work as we know it is changing" — this is inclusive "we" (all of humanity), not company "we." This usage passes the research test.
- **The problem case:** "We built this framework" when one person built it. Or "We use what we ship" when there's one person. The research says this triggers skepticism.

**Why inconclusive, not refuted:** The voice brief distinguishes between three uses of "we," and the inclusive/Foundation Stone uses are compelling. The risk is in company-voice "we" for a solo practitioner. The homepage updated headline uses inclusive "we" and passes. But other copy ("We built it because we needed it") needs careful evaluation.

**Recommended resolution:** Use "we" in two modes:
1. **Inclusive "we" — always safe:** "Work as we know it is changing," "We're all learning"
2. **Company "we" — use sparingly:** Where it clearly means "the Sherpa project" rather than implying a team. The about page should make clear this is one practitioner's work (which the proof-of-methodology framing requires anyway for employment positioning). Transparency is the voice — don't pretend to be a team, but don't drop to "I" everywhere either. The Foundation Stone established "we" as the project's voice and that's earned.

---

## Human-Required

### A1: Product Site > Consulting Site for Employment

**Assumption:** A product/portfolio site positions Rob better for employment than a consulting marketing site. "Consulting site triggers flight-risk perception."

**Suggested test:** Ask 2-3 hiring managers or recruiters (if accessible) to review both framings: (a) "I run an AI governance consulting firm" vs. (b) "I built an open-source governance framework as a proof of methodology." Which raises more interest? Which raises more concern?

**Why human-required:** This depends on industry norms, specific role targeting, and individual hiring manager psychology. No code or research test can settle it. Luna's research provides reasoning but not empirical validation.

**Risk if wrong:** If product-site framing is actually neutral or negative for employment (e.g., "why is he showcasing a side project instead of looking for a job?"), the pivot adds effort without the positioning benefit. But the downside is bounded — the site still works as a portfolio either way.

### A2: Target Audience (Devs/PMs vs. Hiring Managers)

**Assumption:** The site targets developers and product teams.

**Suggested test:** Ask Rob: who will actually visit sherpa.solar in the next 6 months? Is it (a) developers who might adopt the framework, (b) hiring managers evaluating Rob's candidacy, (c) consulting prospects, or (d) some mix? The copy should serve the primary visitor, not a theoretical audience.

**Why human-required:** This is a strategic question about near-term priorities. The answer changes the copy's register — writing for developers is different from writing for hiring managers reviewing a portfolio.

**Risk if wrong:** If the primary visitor is a hiring manager, product-focused copy ("behavioral agent definitions, dispatch pipelines") may be too technical. A hiring manager needs: "built a comprehensive governance framework solo, Staff Engineer level, 13 years of engineering" — portfolio framing, not product framing.

### A7: Consulting Deprioritization Impact

**Assumption:** Removing consulting from primary nav is acceptable because employment search is the priority.

**Suggested test:** Is any consulting revenue currently needed? Are there active consulting leads coming through sherpa.solar? If so, deprioritization has a real cost.

**Why human-required:** Financial situation and current pipeline are private.

### A9: Employer Resonance with Proof-of-Methodology

**Assumption:** Hiring managers will understand and value the "proof of methodology" framing.

**Suggested test:** When Rob shares sherpa.solar in job applications or conversations, does the "I built this framework" story land? Has it been tested yet? The site should amplify whatever framing already works in conversations.

**Why human-required:** Depends on Rob's actual job search experience so far.

### A10: "Work as we know it is changing" Headline

**Assumption:** This headline resonates and doesn't read as generic or alarmist.

**Why human-required:** Rob chose this and then refined from "is over" to "is changing." The refinement shows active voice shaping. The headline passes the competitor-swap test — it's grounded in personal experience (watching AI do his job in Feb 2024), not a generic industry observation. Trust the founder's ear here.

---

## Recommended Changes

### 1. Reframe "product showcase" to "proof of methodology" (from A8)

The proposal uses "product site" language but the product isn't publicly available. Shift the framing:

- **Instead of:** "Explore the framework" / "Get Started" (implies you can use it now)
- **Consider:** "See how it works" / "The framework" (demonstrates what exists)
- **Framework page:** Lead with the live system data (studio-core integration) as proof the system runs, rather than inviting visitors to install a private package
- **Keep /framework/docs** but don't make it the primary CTA. The quickstart is aspirational until the repo is public.

This isn't a scope change — it's a framing adjustment that aligns the copy with reality.

### 2. Clarify the "we" usage (from A4)

The voice brief's "we" decision stands, but implementation should distinguish:

- **Inclusive "we"** (safe everywhere): "Work as we know it is changing," "We're all learning how to use it"
- **Project "we"** (use carefully): "We built this framework" — fine if the about page or context makes clear it's one practitioner. The research warns against "we" that implies a team that doesn't exist.
- **The about page** is the pressure release valve — it should name Rob as the builder. The "proof of methodology" framing requires this anyway.

### 3. Resolve the audience question before writing copy (from A2)

This is the highest-leverage human input needed. If the primary visitor in the next 6 months is:

- **Developers:** Product-focused copy, mechanism-level language, technical depth
- **Hiring managers:** Portfolio-focused copy, breadth of what was built, engineering credibility signals
- **Both:** Homepage speaks to the human condition (inclusive), framework page goes technical, about page goes portfolio

The proposal's current approach (product-oriented with portfolio subtext) may be the right balance, but it should be a deliberate choice, not a default.

### 4. Update proposal headline (from Rob's message)

Replace "Work as we knew it is over" with "Work as we know it is changing" throughout the initiative artifacts. This is a direct Rob input — softer, present tense, less doom-and-gloom. It's also more honest to the voice brief's tension of "awed AND concerned" rather than pure alarm.
