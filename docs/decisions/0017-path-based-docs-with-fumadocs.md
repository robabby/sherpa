---
doc-type: decision
decision: 0017
authored-by: ai
reviewed-by: null
last-updated: 2026-03-23
source-initiatives:
  - studio-docs-site
status: accepted
---

> **AI-extracted** from studio-docs-site · Awaiting human review

## Context

Sherpa Studio needed a formal documentation site. Two structural decisions required resolution: hosting model (subdomain `docs.sherpa.solar` vs path `sherpa.solar/docs`) and framework (Fumadocs vs Nextra vs Docusaurus vs Mintlify vs custom).

## Decision

**Path-based at `sherpa.solar/docs`** using **Fumadocs v16** within the existing Next.js 16 website app.

Fumadocs coexists with the Velite blog pipeline: Velite handles `content/posts/` for `/learn`, Fumadocs handles `content/docs/` for `/docs`. Each has independent content pipelines (`.velite/` and `.source/` outputs). A `(docs)` App Router route group provides the docs layout alongside the `(marketing)` group.

## Consequences

**Positive:**
- SEO authority consolidates on one domain (critical for a new product site)
- Single deployment, single build, shared header/footer/design tokens
- `fumadocs-ui/css/shadcn.css` preset automatically adopts the existing warm gold/obsidian theme
- Orama search is built-in, zero-cost, no external service
- Follows the pattern used by Vercel, Linear, Next.js, Tailwind, and shadcn/ui

**Negative:**
- Fumadocs CSS preset can bleed into marketing pages (mitigated via `(docs)` route group scoping)
- Website build time increases with docs page count (45 SSG pages adds ~400ms)
- If docs outgrow the website, extraction to a separate `apps/docs/` app will require route migration

**Trade-off accepted:** Starting path-based doesn't close the subdomain door. Extraction is straightforward if needed later.
