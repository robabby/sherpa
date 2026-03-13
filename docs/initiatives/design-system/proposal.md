---
status: approved
initiative: design-system
created: 2026-03-13
updated: 2026-03-13
type: new-plan
risk: additive
targets:
  - packages/studio-core/src/tokens.ts
  - packages/studio-core/src/patterns.ts
  - packages/studio-ui/src/catalog.ts
  - apps/storybook/
  - apps/studio/src/styles/globals.css
dependencies: []
---

# Design System: Token Registry, Component Catalog, Pattern Library & Storybook

## Summary

Build the governance and tooling layer that turns Sherpa Studio's existing 91-component library and 60+ CSS custom properties into a formal design system. The system serves two consumers: the `/design` skill (AI agent generating UI prototypes) and human developers browsing a public Storybook at `sherpa.solar/storybook`.

## State Snapshot

- 91 domain components in `packages/studio-ui/` with consistent spatial glass aesthetic
- 22 shadcn/ui primitives in `apps/studio/src/components/ui/`
- 60+ design tokens as CSS custom properties in `apps/studio/src/styles/globals.css`
- Animation constants centralized in `packages/studio-ui/src/lib/animation-constants.ts`
- Three distinctive fonts: Fraunces (display), DM Sans (body), JetBrains Mono (mono)
- No Storybook, no component API docs, no design token registry, no pattern library

## Proposed Changes

### 1. Design Token Registry (Session 1)

Create `packages/studio-core/src/tokens.ts` — structured TypeScript `as const` objects for all design tokens organized by category: palette, semantic colors, domain colors, chart colors, glows, borders, surfaces/glass, typography, radii, sizing. CSS remains source of truth; TS provides programmatic access. Sync comments added to `globals.css`. Vitest test validates token keys map to CSS variables.

### 2. Component Catalog (Session 2)

Create `packages/studio-ui/src/catalog.ts` — machine-readable inventory of all 91 components with: name, description, pattern implemented, variants, tokens used, composition hints, client/server flag, domain area. Lookup helpers: `getComponent()`, `getComponentsByPattern()`, `getComponentsByDomain()`. Vitest test verifies every barrel export has a catalog entry.

### 3. Pattern Library (Session 3)

Create `packages/studio-core/src/patterns.ts` — 8 recurring visual patterns documented as composable recipes: glass-panel, status-indicator, data-readout, timeline, pipeline-bar, card-list, section-header, badge. Each pattern includes: base Tailwind classes, hover classes, named slots, variants, token references with light/dark values, implementing components, composition relationships, accessibility notes.

### 4. Storybook Setup (Session 4)

Create `apps/storybook/` workspace package using `@storybook/react-vite`. Imports canonical `globals.css` (no duplication), Google Fonts replaces next/font, mocks for next/link and next/navigation, dark/light theme toggle. Initial ~10 stories across 4 validation tiers (pure components → Radix deps → Next.js mock deps → studio-core type deps).

### 5. Deployment (Session 5)

Public Storybook at `sherpa.solar/storybook`. Build strategy: Storybook static output copied to `apps/studio/public/storybook/`, served by Next.js as static files. Single Vercel build via `pnpm build:all`. `vercel.json` at root configures build command and output directory.

## Rationale

The `/design` skill (post-/shape, pre-/plan-tasks in the product pipeline) needs structured token and component data to generate correct prototypes using real components. Without a formal design system, AI-generated UI will drift from the established visual language. Storybook provides the verification layer where humans confirm that generated prototypes look right.

Machine-readability comes before visual documentation because the primary consumer is an AI agent. The build sequence (tokens → catalog → patterns → Storybook) ensures each layer builds on the previous one.

## Dependencies

None. This initiative uses only existing components and design tokens.

## Review Notes

- Token registry is hand-maintained (not auto-generated from CSS parsing) to avoid adding a CSS parser dependency to studio-core. Sync tests catch drift.
- Component catalog is hand-maintained for the same reason. Sync test verifies completeness against barrel exports.
- Storybook uses `@storybook/react-vite` (not `@storybook/nextjs`) because Vite handles Tailwind v4 PostCSS natively while Webpack does not.
- `apps/studio/public/storybook/` is a build artifact and should be gitignored.
- Pattern definitions use `{color}` interpolation markers where HubPanel's VARIANT_STYLES pattern requires parameterized colors.
