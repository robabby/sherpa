# Website Studio Product — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Rewrite sherpa.solar from a consulting marketing site to a portfolio/proof-of-methodology showcase for Sherpa Studio, serving both developers and hiring managers.

**Architecture:** Content rewrite across 4 homepage sections, navigation chrome, and metadata. Studio-core integration adds live governance data to the framework page via workspace dependency and server-component rendering. No new client-side state or API calls — everything renders server-side or as static content.

**Tech Stack:** Next.js 16, React 19, Tailwind v4, shadcn/ui (radix base, new-york style), motion/react for hero animation, @sherpa/studio-core for live data.

**Source artifacts:**
- Design: `docs/initiatives/website-studio-product/design.md`
- Stress test: `docs/initiatives/website-studio-product/stress-test.md`
- Voice brief: `docs/initiatives/website-content-v2/voice-brief.md`
- Foundation Stone: `docs/foundation-stone.md`
- Prototype: `docs/initiatives/website-studio-product/prototype.html`

**Conventions to enforce:**
- Icons in `Button` use `data-icon="inline-start"` or `data-icon="inline-end"` — no sizing classes on icons
- Use `gap-*` for spacing, never `space-y-*` or `space-x-*`
- Semantic color tokens only (`text-primary`, `bg-background`) — never raw values
- `"use client"` only where needed (motion/react hooks). Section components that just import ScrollReveal stay as server components.
- Import directly from packages, avoid barrel re-exports where possible

---

## Session 1: Homepage + Chrome

### Task 1: Rewrite hero-section.tsx

**Files:**
- Modify: `apps/website/src/components/sections/hero-section.tsx`

**Context:** This is a `"use client"` component because it uses `motion/react` for staggered fadeUp animations. Preserve the entire animation system — only change the content and CTA labels.

**Step 1: Replace the component content**

```tsx
"use client"

import Link from "next/link"
import { motion } from "motion/react"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import type { Easing } from "motion"

const ease: Easing = [0, 0, 0.2, 1]

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease, delay: i * 0.12 },
  }),
}

export function HeroSection() {
  return (
    <section className="relative overflow-hidden px-6 pb-24 pt-28 md:pb-36 md:pt-40">
      <div className="mx-auto max-w-3xl text-center">
        <motion.h1
          className="font-heading text-4xl tracking-tight sm:text-5xl md:text-6xl lg:text-7xl"
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={0}
        >
          Work as we know it is changing.{" "}
          <span className="text-primary">What we build next matters.</span>
        </motion.h1>

        <motion.p
          className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground md:text-xl"
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={1}
        >
          We saw it coming — not as prophecy, but as pattern recognition. So we
          built a governance framework for agentic workflows and open-sourced
          it.
        </motion.p>

        <motion.div
          className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={2}
        >
          <Link href="/framework">
            <Button variant="outline" size="lg">
              See the framework
              <ArrowRight data-icon="inline-end" />
            </Button>
          </Link>
          <Link href="/contact">
            <Button size="lg">
              Talk to us
              <ArrowRight data-icon="inline-end" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
```

**What changed:**
- H1: "Ship AI workflows you can actually trust." → "Work as we know it is changing. What we build next matters."
- Subtitle: governance framework description → Foundation Stone language ("not as prophecy, but as pattern recognition")
- CTA 1: "Get Started" → "See the framework"
- CTA 2: "Talk to a Guide" with MessageCircle → "Talk to us" with ArrowRight
- Removed MessageCircle import (both CTAs now use ArrowRight)

**Step 2: Verify build**

Run: `cd /Users/rob/Workbench/sherpa && pnpm check`
Expected: No type errors

---

### Task 2: Rewrite dual-value-section.tsx as WhatWeBuiltSection

**Files:**
- Modify: `apps/website/src/components/sections/dual-value-section.tsx`

**Context:** Server component (no `"use client"`). Imports ScrollReveal (a client component) as a child wrapper — this is valid in Next.js RSC. Rename the export but keep the file for git history.

**Step 1: Replace the component content**

```tsx
import Link from "next/link"
import { ScrollReveal } from "@/components/motion/scroll-reveal"

export function WhatWeBuiltSection() {
  return (
    <section className="px-6 py-20 md:py-28">
      <div className="mx-auto max-w-2xl">
        <ScrollReveal>
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            The framework
          </p>
          <p className="mt-6 text-lg leading-relaxed text-muted-foreground md:text-xl">
            Sherpa Studio is a governance framework for agentic workflows.
            Behavioral agent definitions. A skills engine. A dispatch pipeline
            with nine backends. An initiative lifecycle that takes ideas from
            proposal to integration with review at every step.
          </p>
          <p className="mt-5 text-lg leading-relaxed text-muted-foreground md:text-xl">
            It lives in your codebase, versions with git, and works with any AI
            development environment. The kind of infrastructure that doesn&apos;t
            exist until someone builds it.{" "}
            <Link
              href="/framework"
              className="text-foreground underline underline-offset-4 transition-colors hover:text-primary"
            >
              See the framework
            </Link>
            .
          </p>
        </ScrollReveal>
      </div>
    </section>
  )
}
```

**What changed:**
- Export renamed: `WhatWeDoSection` → `WhatWeBuiltSection`
- Added eyebrow text "The framework" (small uppercase muted)
- Two paragraphs: system capabilities + codebase-native architecture
- Inline link changed: "Explore the framework" → "See the framework"
- Removed second inline link to `/contact`

---

### Task 3: Rewrite trust-section.tsx as ProofSection

**Files:**
- Modify: `apps/website/src/components/sections/trust-section.tsx`

**Context:** Server component. Currently has an h2 and two paragraphs inside a ScrollReveal. Update copy and rename export. Drop any card/border treatment — this section should be plain prose, same visual weight as WhatWeBuiltSection.

**Step 1: Replace the component content**

```tsx
import { ScrollReveal } from "@/components/motion/scroll-reveal"

export function ProofSection() {
  return (
    <section className="px-6 py-20 md:py-28">
      <div className="mx-auto max-w-2xl">
        <ScrollReveal>
          <h2 className="font-heading text-2xl tracking-tight md:text-3xl">
            Built for our own work. Shared because it should be.
          </h2>
          <div className="mt-6 flex flex-col gap-4 text-muted-foreground">
            <p>
              Sherpa governs its own development. The conventions, skills, and
              initiative lifecycle aren&apos;t documentation — they&apos;re the
              production system. When something ships, it goes through the same
              governance pipeline we open-source.
            </p>
            <p>
              That&apos;s the proof. Not a deck. Not a demo. The system running
              on itself, in the open.
            </p>
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}
```

**What changed:**
- Export renamed: `TrustSection` → `ProofSection`
- H2: "We use what we ship" → "Built for our own work. Shared because it should be."
- Body: consulting loop → self-governing framework proof
- Changed `space-y-4` to `flex flex-col gap-4` (shadcn convention)

---

### Task 4: Rewrite cta-section.tsx with values merge

**Files:**
- Modify: `apps/website/src/components/sections/cta-section.tsx`

**Context:** Server component with ScrollReveal wrapper. Merges the conviction layer ("Create opportunity...") with the CTA. Adds a blockquote-styled thesis statement.

**Step 1: Replace the component content**

```tsx
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import { ScrollReveal } from "@/components/motion/scroll-reveal"

export function CtaSection() {
  return (
    <section className="border-t border-border/40 px-6 py-20 md:py-28">
      <ScrollReveal>
        <div className="mx-auto max-w-2xl text-center">
          <div className="mx-auto max-w-lg border-l-2 border-primary pl-6 text-left">
            <p className="font-heading text-xl leading-snug tracking-tight md:text-2xl">
              &ldquo;Create opportunity just as much as we automate it.&rdquo;
            </p>
          </div>
          <div className="mt-8 flex flex-col gap-4 text-muted-foreground">
            <p>
              Almost every agentic system will change how many people a team
              needs. We know that. We build governance that accounts for
              people — not just efficiency.
            </p>
            <p>
              The framework is open source. If you&apos;d like a guide, we
              consult too.
            </p>
          </div>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/framework">
              <Button variant="outline" size="lg">
                See the framework
                <ArrowRight data-icon="inline-end" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg">
                Talk to us
                <ArrowRight data-icon="inline-end" />
              </Button>
            </Link>
          </div>
        </div>
      </ScrollReveal>
    </section>
  )
}
```

**What changed:**
- Added blockquote thesis with `border-l-2 border-primary pl-6` and `font-heading` — visually distinct pull quote
- Body: "Use the framework on your own..." → conviction about governance for people + understated consulting mention
- CTA labels: "Get Started" → "See the framework", "Talk to a Guide" → "Talk to us"
- Removed MessageCircle import, both use ArrowRight with `data-icon`
- Changed spacing from bare `mt-*` to `flex flex-col gap-4` where appropriate

---

### Task 5: Delete stats section and update page.tsx

**Files:**
- Delete: `apps/website/src/components/sections/how-it-works-section.tsx`
- Modify: `apps/website/src/app/(marketing)/page.tsx`

**Step 1: Delete the stats section file**

Run: `rm apps/website/src/components/sections/how-it-works-section.tsx`

**Step 2: Update page.tsx with renamed imports**

```tsx
import { HeroSection } from "@/components/sections/hero-section"
import { WhatWeBuiltSection } from "@/components/sections/dual-value-section"
import { ProofSection } from "@/components/sections/trust-section"
import { CtaSection } from "@/components/sections/cta-section"

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <WhatWeBuiltSection />
      <ProofSection />
      <CtaSection />
    </>
  )
}
```

**What changed:**
- Removed `RealitySection` import (file deleted)
- `WhatWeDoSection` → `WhatWeBuiltSection` (renamed export from dual-value-section.tsx)
- `TrustSection` → `ProofSection` (renamed export from trust-section.tsx)
- 4 sections instead of 5

**Step 3: Verify build**

Run: `cd /Users/rob/Workbench/sherpa && pnpm check`
Expected: No type errors. If the deleted file is referenced anywhere else, fix those imports.

---

### Task 6: Update navigation

**Files:**
- Modify: `apps/website/src/config/navigation.ts`

**Step 1: Remove Consulting from nav**

```tsx
export const mainNav = [
  { title: "Framework", href: "/framework" },
  { title: "Work", href: "/work" },
  { title: "Learn", href: "/learn" },
  { title: "About", href: "/about" },
] as const
```

**What changed:**
- Removed `{ title: "Consulting", href: "/consulting" }` from the array
- Order: Framework | Work | Learn | About

---

### Task 7: Update site-header.tsx CTA

**Files:**
- Modify: `apps/website/src/components/site-header.tsx`

**Step 1: Change CTA label**

Replace `Talk to a Guide` with `Talk to us` in the Button text. No other changes.

The line to change is:
```tsx
// Before:
<Button size="sm">Talk to a Guide</Button>
// After:
<Button size="sm">Talk to us</Button>
```

---

### Task 8: Update site-footer.tsx

**Files:**
- Modify: `apps/website/src/components/site-footer.tsx`

**Step 1: Replace footer content**

```tsx
import Link from "next/link"
import { Separator } from "@/components/ui/separator"

const footerLinks = [
  {
    title: "Framework",
    links: [
      { title: "Overview", href: "/framework" },
      { title: "Documentation", href: "/framework/docs" },
    ],
  },
  {
    title: "Resources",
    links: [
      { title: "Blog", href: "/learn" },
      { title: "Case Studies", href: "/work" },
    ],
  },
  {
    title: "Company",
    links: [
      { title: "About", href: "/about" },
      { title: "Consulting", href: "/consulting" },
      { title: "Contact", href: "/contact" },
    ],
  },
]

export function SiteFooter() {
  return (
    <footer className="mt-auto">
      <Separator />
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4">
          <div>
            <Link href="/" className="font-heading text-lg tracking-tight">
              Sherpa
            </Link>
            <p className="mt-2 text-sm text-muted-foreground">
              An open-source governance framework for agentic workflows.
            </p>
          </div>
          {footerLinks.map((group) => (
            <div key={group.title}>
              <h3 className="text-sm font-semibold">{group.title}</h3>
              <ul className="mt-3 flex flex-col gap-2">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-10 border-t border-border/40 pt-6">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Sherpa. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
```

**What changed:**
- Footer columns reorganized: "Framework" (Overview, Documentation), "Resources" (Blog, Case Studies), "Company" (About, Consulting, Contact)
- Removed GitHub link (repo is private — add back when public)
- Tagline: "Behavioral governance for agentic workflows." → "An open-source governance framework for agentic workflows."
- Copyright: "Sherpa Consulting" → "Sherpa"

---

### Task 9: Update layout.tsx metadata

**Files:**
- Modify: `apps/website/src/app/layout.tsx`

**Step 1: Update metadata**

Change the `metadata` export:

```tsx
export const metadata: Metadata = {
  title: {
    default: "Sherpa — Governance Framework for Agentic Workflows",
    template: "%s | Sherpa",
  },
  description:
    "An open-source governance framework for agentic workflows. Behavioral conventions, dispatch pipelines, and quality gates that live in your codebase.",
  metadataBase: new URL("https://sherpa.solar"),
}
```

**What changed:**
- Title: "Behavioral Governance for Agentic Workflows" → "Governance Framework for Agentic Workflows"
- Description: removed "and the guides who know how to use it" → product-focused description

---

### Task 10: Build verification and commit

**Step 1: Run typecheck**

Run: `cd /Users/rob/Workbench/sherpa && pnpm check`
Expected: PASS — no type errors across all packages

**Step 2: Run build**

Run: `cd /Users/rob/Workbench/sherpa && pnpm build`
Expected: PASS — website builds successfully. Watch for:
- Missing imports (deleted how-it-works-section.tsx referenced elsewhere)
- Renamed exports not updated in page.tsx

**Step 3: Visual verification**

Run: `cd /Users/rob/Workbench/sherpa && pnpm dev`
Then open http://localhost:3001 and verify:
- [ ] Hero renders with new headline and subtitle
- [ ] Staggered fadeUp animation works on hero elements
- [ ] "What We Built" section shows eyebrow + two paragraphs
- [ ] "The Proof" section shows h2 + two paragraphs (no card border)
- [ ] Commitment section shows blockquote thesis with gold left border
- [ ] CTA buttons say "See the framework" and "Talk to us"
- [ ] Navigation shows Framework | Work | Learn | About (no Consulting)
- [ ] Header CTA says "Talk to us"
- [ ] Footer columns: Framework, Resources, Company
- [ ] Footer copyright says "Sherpa" not "Sherpa Consulting"
- [ ] Both light and dark themes render correctly
- [ ] ScrollReveal animations trigger on scroll
- [ ] Mobile responsive layout works

**Step 4: Commit**

```bash
git add apps/website/src/components/sections/hero-section.tsx \
       apps/website/src/components/sections/dual-value-section.tsx \
       apps/website/src/components/sections/trust-section.tsx \
       apps/website/src/components/sections/cta-section.tsx \
       apps/website/src/app/\(marketing\)/page.tsx \
       apps/website/src/config/navigation.ts \
       apps/website/src/components/site-header.tsx \
       apps/website/src/components/site-footer.tsx \
       apps/website/src/app/layout.tsx
git rm apps/website/src/components/sections/how-it-works-section.tsx
git commit -m "feat: rewrite homepage as portfolio/proof-of-methodology site

Pivot sherpa.solar from consulting marketing to Sherpa Studio showcase.

- Hero: 'Work as we know it is changing. What we build next matters.'
- Replace stats section with 'What We Built' capabilities overview
- Replace trust section with 'The Proof' self-governing narrative
- Add blockquote thesis to CTA: 'Create opportunity as much as we automate'
- Remove Consulting from primary nav (stays in footer)
- Update header CTA, footer columns, and metadata"
```

---

## Session 2: Framework Page + Studio-Core Integration

### Task 11: Add studio-core workspace dependency

**Files:**
- Modify: `apps/website/package.json`

**Step 1: Add the dependency**

Run: `cd /Users/rob/Workbench/sherpa/apps/website && pnpm add @sherpa/studio-core@workspace:*`

**Step 2: Verify it was added**

Check `apps/website/package.json` now includes:
```json
"@sherpa/studio-core": "workspace:*"
```

**Step 3: Install**

Run: `cd /Users/rob/Workbench/sherpa && pnpm install`

---

### Task 12: Create sherpa.config.ts

**Files:**
- Create: `apps/website/sherpa.config.ts`

**Context:** This mirrors the pattern from `apps/studio/sherpa.config.ts`. The config must resolve the monorepo root correctly regardless of whether `next dev` or `next build` runs from the app directory or the monorepo root.

**Step 1: Read the Studio app's config for reference**

Read: `apps/studio/sherpa.config.ts`

**Step 2: Create the website config**

```typescript
import fs from "node:fs"
import path from "node:path"
import { loadConfig } from "@sherpa/studio-core/config"

const cwd = process.cwd()
const root = process.env.SHERPA_PROJECT_ROOT
  ?? (fs.existsSync(path.join(cwd, "sherpa.json")) ? cwd : path.resolve(cwd, "../.."))

loadConfig(root)
```

**What this does:**
- Resolves the monorepo root via `SHERPA_PROJECT_ROOT` env var or smart fallback
- Calls `loadConfig(root)` which calls `defineConfig()` internally
- Sets the module-level `_defaultContext` so domain functions work without explicit context

---

### Task 13: Create init and re-export modules

**Files:**
- Create: `apps/website/src/lib/sherpa/init.ts`
- Create: `apps/website/src/lib/sherpa/index.ts`

**Step 1: Create the init module (side-effect import)**

```typescript
// Side-effect import: triggers defineConfig() via sherpa.config.ts
import "../../../sherpa.config"
```

**Step 2: Create the re-export module**

```typescript
import "./init"

// Re-export only the domain functions the website needs.
// All functions are server-only (use node:fs internally).
export { getHubStats, getConventions, getSkills, getInitiatives } from "@sherpa/studio-core"
```

**Why selective re-exports:** The website only needs a few domain functions. Selective re-exports make the API surface explicit and prevent accidental use of functions that don't make sense for the website context.

---

### Task 14: Update next.config.ts with withSherpa

**Files:**
- Modify: `apps/website/next.config.ts`

**Step 1: Wrap the config**

```typescript
import type { NextConfig } from "next"
import { withSherpa } from "@sherpa/studio-core/config"

const config: NextConfig = {
  pageExtensions: ["js", "jsx", "ts", "tsx"],
}

export default withSherpa(config)
```

**What this does:** Adds `@sherpa/studio-core`, `@sherpa/studio-ui`, and `@sherpa/studio` to `transpilePackages` so Next.js can compile the workspace packages.

**Step 2: Verify build**

Run: `cd /Users/rob/Workbench/sherpa && pnpm check`
Expected: PASS

---

### Task 15: Rewrite framework page with live data

**Files:**
- Modify: `apps/website/src/app/(marketing)/framework/page.tsx`

**Context:** This is a server component. It can directly call `getHubStats()` because the side-effect import chain (`lib/sherpa/index.ts` → `init.ts` → `sherpa.config.ts`) triggers `defineConfig()` before the function is called. The live data proves the system is active — real counts from the codebase.

**Step 1: Replace the framework page**

```tsx
import type { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import { ScrollReveal } from "@/components/motion/scroll-reveal"
import { getHubStats } from "@/lib/sherpa"

export const metadata: Metadata = {
  title: "Framework",
  description:
    "Sherpa Studio: a governance framework for agentic workflows. Behavioral agent definitions, executable conventions, dispatch pipelines, and initiative lifecycle management.",
}

const pillars = [
  {
    title: "Behavioral Agent System",
    description:
      "Role definitions through behavioral constraints, not identity claims. Research-validated approach backed by evidence from Anthropic and academic studies.",
  },
  {
    title: "Governance Engine",
    description:
      "Initiative lifecycle from proposal through integration. Recursive directory conventions, quality gates, and integration review at every stage.",
  },
  {
    title: "Execution Pipeline",
    description:
      "Planner/Worker/Judge dispatch across nine backends. CLI, API, and remote agent routing configured in code.",
  },
  {
    title: "Studio Application",
    description:
      "Visualization of governance in action. Initiative trees, task boards, research dashboards, and velocity tracking.",
  },
  {
    title: "Executable Conventions",
    description:
      "Skills and rules that encode expertise as code. Not documentation that drifts — conventions that execute.",
  },
  {
    title: "Config-as-Code",
    description:
      "sherpa.config.ts with defineConfig(). Vocabulary, theming, plugins, dispatch routing. Your governance configuration lives with your code.",
  },
  {
    title: "Convention Sync CLI",
    description:
      "sherpa init, sherpa sync. Provenance tracking ensures conventions stay current across projects and teams.",
  },
]

const packages = [
  {
    name: "@sherpa/studio-core",
    description: "Domain logic, types, schemas, lifecycle engine",
  },
  {
    name: "@sherpa/studio-ui",
    description: "90+ React components for governance visualization",
  },
  {
    name: "@sherpa/studio-mcp",
    description: "MCP server for AI agent integration",
  },
  {
    name: "@sherpa/studio-cli",
    description: "Convention sync and project scaffolding",
  },
]

export default function FrameworkPage() {
  const stats = getHubStats()

  return (
    <div className="px-6 py-20 md:py-28">
      <div className="mx-auto max-w-4xl">
        <ScrollReveal>
          <h1 className="font-heading text-4xl tracking-tight md:text-5xl">
            The framework
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
            Sherpa Studio is a governance framework for agentic workflows.
            Behavioral agent definitions, executable conventions, and a dispatch
            pipeline — infrastructure that lives in your codebase and versions
            with git.
          </p>
        </ScrollReveal>

        {/* Live stats from the codebase */}
        <ScrollReveal delay={0.08}>
          <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-lg border border-border/60 bg-card p-4 text-center">
              <p className="font-heading text-2xl tracking-tight">
                {stats.conventions.ruleCount}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">conventions</p>
            </div>
            <div className="rounded-lg border border-border/60 bg-card p-4 text-center">
              <p className="font-heading text-2xl tracking-tight">
                {stats.process.initiativeCount}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                initiatives tracked
              </p>
            </div>
            <div className="rounded-lg border border-border/60 bg-card p-4 text-center">
              <p className="font-heading text-2xl tracking-tight">
                {stats.conventions.claudeMdCount + stats.conventions.uxGuideCount}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                governance docs
              </p>
            </div>
            <div className="rounded-lg border border-border/60 bg-card p-4 text-center">
              <p className="font-heading text-2xl tracking-tight">
                {stats.sessions.total}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                sessions logged
              </p>
            </div>
          </div>
          <p className="mt-3 text-center text-xs text-muted-foreground">
            Live data from the Sherpa codebase — this framework governs its own
            development.
          </p>
        </ScrollReveal>

        <ScrollReveal delay={0.15}>
          <div className="mt-16">
            <h2 className="font-heading text-2xl tracking-tight">
              Seven pillars
            </h2>
            <p className="mt-3 text-muted-foreground">
              The framework is organized around seven core systems. Each can be
              adopted independently, but they work best together.
            </p>
            <div className="mt-8 grid gap-6 sm:grid-cols-2">
              {pillars.map((pillar) => (
                <div
                  key={pillar.title}
                  className="rounded-lg border border-border/60 bg-card p-5"
                >
                  <h3 className="text-sm font-semibold">{pillar.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {pillar.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.2}>
          <div className="mt-16">
            <h2 className="font-heading text-2xl tracking-tight">Packages</h2>
            <div className="mt-6 flex flex-col gap-4">
              {packages.map((pkg) => (
                <div key={pkg.name} className="flex items-baseline gap-4">
                  <code className="shrink-0 text-sm font-medium text-primary">
                    {pkg.name}
                  </code>
                  <span className="text-sm text-muted-foreground">
                    {pkg.description}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.25}>
          <div className="mt-16 rounded-xl border border-border/60 bg-card p-8">
            <h2 className="font-heading text-xl tracking-tight">
              Built by a practitioner
            </h2>
            <p className="mt-3 text-muted-foreground">
              This framework emerged from real work — building agentic workflows
              and discovering that the governance infrastructure didn&apos;t
              exist. Every convention, every skill, every agent role was built
              because it was needed. The system you see here is the same system
              that governs its own development.
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.3}>
          <div className="mt-12 flex flex-col items-start gap-4 sm:flex-row">
            <Link href="/framework/docs">
              <Button variant="outline" size="lg">
                Documentation
                <ArrowRight data-icon="inline-end" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg">
                Talk to us
                <ArrowRight data-icon="inline-end" />
              </Button>
            </Link>
          </div>
        </ScrollReveal>
      </div>
    </div>
  )
}
```

**What changed:**
- Added `import { getHubStats } from "@/lib/sherpa"` — server-side data fetch
- Added live stats grid showing rule count, initiative count, governance docs, sessions
- Added caption: "Live data from the Sherpa codebase"
- Updated pillar descriptions for portfolio voice
- "Built by practitioners" → "Built by a practitioner" (honest about solo work)
- CTA: "Getting started" → "Documentation", "Talk to a Guide" → "Talk to us"
- Changed `space-y-4` to `flex flex-col gap-4` in packages list

---

### Task 16: Build verification and commit

**Step 1: Run typecheck**

Run: `cd /Users/rob/Workbench/sherpa && pnpm check`
Expected: PASS

**Step 2: Run build**

Run: `cd /Users/rob/Workbench/sherpa && pnpm build`
Expected: PASS — watch for studio-core import resolution errors

**Step 3: Visual verification**

Open http://localhost:3001/framework and verify:
- [ ] Live stats grid shows real numbers (not 0)
- [ ] Stats caption appears
- [ ] Pillar descriptions updated
- [ ] "Built by a practitioner" card
- [ ] CTA says "Documentation" and "Talk to us"

**Step 4: Commit**

```bash
git add apps/website/package.json \
       apps/website/sherpa.config.ts \
       apps/website/src/lib/sherpa/init.ts \
       apps/website/src/lib/sherpa/index.ts \
       apps/website/next.config.ts \
       apps/website/src/app/\(marketing\)/framework/page.tsx \
       pnpm-lock.yaml
git commit -m "feat: add studio-core integration and rewrite framework page

Wire up @sherpa/studio-core as workspace dependency for the website.
Framework page now shows live governance data from the codebase —
real convention counts, initiative stats, and session totals.

- Add sherpa.config.ts with smart monorepo root resolution
- Create lib/sherpa/ init and re-export modules
- Wrap next.config.ts with withSherpa()
- Rewrite framework page with live stats grid and portfolio voice"
```

---

## Session 3: About Page + Voice Docs

### Task 17: Rewrite about page

**Files:**
- Modify: `apps/website/src/app/(marketing)/about/page.tsx`

**Context:** Reframe from consulting origin story to practitioner/portfolio narrative. Remove the "Guide, not guru" card (contains the 91% stat — research anti-pattern). Name Rob as the builder for portfolio positioning.

**Step 1: Replace the about page**

```tsx
import type { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import { ScrollReveal } from "@/components/motion/scroll-reveal"

export const metadata: Metadata = {
  title: "About",
  description:
    "The story behind Sherpa Studio — a governance framework built by a practitioner who needed it.",
}

export default function AboutPage() {
  return (
    <div className="px-6 py-20 md:py-28">
      <div className="mx-auto max-w-3xl">
        <ScrollReveal>
          <h1 className="font-heading text-4xl tracking-tight md:text-5xl">
            We built the tools that didn&apos;t exist
          </h1>
          <p className="mt-6 text-lg text-muted-foreground">
            Sherpa started with a recognition: a wave was coming, and the
            infrastructure to navigate it hadn&apos;t been built yet.
          </p>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <div className="mt-12 flex flex-col gap-6 text-muted-foreground">
            <p>
              In early 2024, after thirteen years of engineering — building
              design systems, leading frontend teams, shipping products from
              first commit to scale — I watched AI do my job. Not a demo. Not a
              concept video. The actual work, done in minutes.
            </p>
            <p>
              The question wasn&apos;t whether work would change. It was whether
              anyone was building the governance for how it changes. Behavioral
              constraints for AI agents. Quality gates that run before anything
              ships. Conventions that travel with code instead of living in a
              wiki nobody reads.
            </p>
            <p>
              Nobody was. So I built it.
            </p>
            <p>
              Sherpa Studio is the result — a governance framework for agentic
              workflows, built over hundreds of sessions, battle-tested on real
              consulting engagements, and open-sourced because the transition
              should be graceful, not chaotic.
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.2}>
          <div className="mt-16 rounded-xl border border-border/60 bg-card p-8">
            <h2 className="font-heading text-2xl tracking-tight">
              The conviction
            </h2>
            <div className="mt-4 flex flex-col gap-4 text-muted-foreground">
              <p>
                We operate in a landscape where confidence is performed and
                understanding is faked. We will not participate in that.
              </p>
              <p>
                We would rather lose an engagement than win it with inflated
                promises. If our principles cannot be observed in how we operate
                on an ordinary Tuesday, they are not principles. They are
                decorations.
              </p>
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.3}>
          <div className="mt-12 flex flex-col items-start gap-4 sm:flex-row">
            <Link href="/framework">
              <Button variant="outline">
                See the framework
                <ArrowRight data-icon="inline-end" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button>
                Talk to us
                <ArrowRight data-icon="inline-end" />
              </Button>
            </Link>
          </div>
        </ScrollReveal>
      </div>
    </div>
  )
}
```

**What changed:**
- H1: "We built the tool we use" → "We built the tools that didn't exist"
- Origin story: consulting-first → practitioner-first (13 years engineering, watched AI do the job)
- Uses "I" for the personal narrative, switches back to "we" for the conviction section
- Replaced "Guide, not guru" card (91% stat) with "The conviction" card (Foundation Stone excerpts)
- CTA: "Explore the framework" → "See the framework"
- Metadata description updated

---

### Task 18: Update voice-and-tone.md

**Files:**
- Modify: `docs/ux/voice-and-tone.md`

**Context:** Add voice artifacts from the discovery session, the competitor-swap test, and the Foundation Stone test as explicit quality checks. Read the current file first, then add the new sections.

**Step 1: Read the current voice-and-tone.md**

Read: `docs/ux/voice-and-tone.md`

**Step 2: Add voice quality checks**

Append three new sections to the document:

```markdown
## Voice Artifacts

Sentences only Sherpa would say, from the voice discovery session (2026-03-21).
Use these as calibration — new copy should sound like it belongs alongside them.

- "Governance is the new sexy for AI systems."
- "Create opportunity just as much as we automate it."
- "We're ALL learning how to use it."
- "Speed is cheap. The world is full of things built fast and abandoned faster."
- "If our principles cannot be observed in how we operate on an ordinary Tuesday, they are not principles."
- "Not as prophecy, but as pattern recognition."
- "The kind of infrastructure that doesn't exist until someone builds it."
- "Not a deck. Not a demo. The system running on itself, in the open."

## The Competitor-Swap Test

Before any sentence goes on the website, ask: "Could Deloitte say this? Could Accenture? Could any AI consultancy?"

If yes, cut it. Practitioner specificity replaces generic authority.

**Passes:** "Behavioral agent definitions. A dispatch pipeline with nine backends."
**Fails:** "Ship AI workflows you can actually trust." (anyone could say this)

## The Foundation Stone Test

When in doubt about whether a sentence matches the voice, compare it against `docs/foundation-stone.md`. If the Foundation Stone would reject the sentence as decoration, cut it. If the sentence carries the same conviction and specificity, keep it.
```

---

### Task 19: Update messaging-framework.md

**Files:**
- Modify: `docs/ux/messaging-framework.md`

**Step 1: Read the current messaging-framework.md**

Read: `docs/ux/messaging-framework.md`

**Step 2: Update orientation**

Update the primary positioning statement and audience sections to reflect portfolio/proof-of-methodology framing rather than consulting pitch. Specific changes depend on the current content — the key shift is:

- Primary audience: developers AND hiring managers (not consulting prospects)
- Positioning: "governance framework built by a practitioner" (not "consulting firm")
- Named enemy: "AI transformation theater" and "careless displacement"
- Named trade-offs: "Would rather lose an engagement than win it with inflated promises"

---

### Task 20: Build verification and commit

**Step 1: Run typecheck**

Run: `cd /Users/rob/Workbench/sherpa && pnpm check`
Expected: PASS

**Step 2: Run build**

Run: `cd /Users/rob/Workbench/sherpa && pnpm build`
Expected: PASS

**Step 3: Visual verification**

Open http://localhost:3001/about and verify:
- [ ] About page tells the practitioner story
- [ ] "I" pronoun in origin story, "we" in conviction section
- [ ] Foundation Stone excerpts in the conviction card
- [ ] No 91% stat anywhere on the page
- [ ] CTA says "See the framework" and "Talk to us"

**Step 4: Commit**

```bash
git add apps/website/src/app/\(marketing\)/about/page.tsx \
       docs/ux/voice-and-tone.md \
       docs/ux/messaging-framework.md
git commit -m "feat: rewrite about page and sharpen voice guidelines

Reframe about page from consulting origin story to practitioner
portfolio narrative. Add voice artifacts, competitor-swap test, and
Foundation Stone test to voice-and-tone.md."
```

---

## Post-Implementation Checklist

After all three sessions are complete, run the full verification:

- [ ] `pnpm check` passes across all packages
- [ ] `pnpm build` succeeds (website + studio)
- [ ] Homepage: 4 sections, correct copy, animations work
- [ ] Framework page: live stats from studio-core, correct counts
- [ ] About page: practitioner story, no borrowed stats
- [ ] Navigation: Framework | Work | Learn | About
- [ ] Header CTA: "Talk to us"
- [ ] Footer: Framework, Resources, Company columns
- [ ] Both light and dark themes render correctly
- [ ] Mobile responsive layout intact
- [ ] Competitor-swap test: no sentence could come from Deloitte
- [ ] Foundation Stone test: copy carries the same conviction
