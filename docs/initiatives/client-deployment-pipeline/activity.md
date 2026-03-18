---
started: 2026-03-16
worktree: null
---

# Client Deployment Pipeline — Activity

## 2026-03-16 — Research Iteration 1 (Lean)

Ran `/rr` with 5 parallel vectors covering the full scope of the rewritten proposal:

1. **Discovery frameworks** — Bain's decision-driven methodology validates Q1. Sociocracy 3.0's fractal pattern is the closest structural analog. Harvard/BCG "jagged frontier" study warns about AI pre-mapping anchoring.
2. **Multi-surface deployment** — 7 patterns surveyed. Tauri 2.0 emerges as strongest desktop candidate. Shared core + independent distribution per surface is the universal pattern.
3. **defineConfig() patterns** — Tailwind presets (replace vs extend), Nuxt layers (directory presets), ESLint extends (ergonomic abstraction). Client presets should be directories, not just config objects.
4. **Multi-tenant Tailscale** — Per-client tailnet is the right topology. Tailscale's native multi-tailnet alpha supports it. TailOps proves MSP adoption. Node sharing for support access.
5. **AI infra pricing** — Market supports $2.5K-$7.5K fixed for discovery+deploy, $500-$2K/mo convention retainer. Three-tier productized menu maps to surface tiers.

**Key insight (revised after discussion):** The discovery output format — a structured artifact that renders as both a client-facing report and machine-consumable config — is the center of gravity. `defineConfig()` is one consumer of that output (the engineer's entry point), not the center itself.

**Post-research corrections (2026-03-17):**
- Surfaces (desktop, web, code dep) and tiers (Sm/Md/Lg/Enterprise) are orthogonal. Desktop is the "controlled" surface (IT/compliance), not the "simple" surface. Any tier can use any surface combination.
- Pricing follows org complexity (discovery) and dynamism (retainer), not surface selection. Surfaces are a deployment detail, not a billing dimension.
- Sherpa should produce client-facing discovery reports that also convert to config — two views of the same data. The report is the trust artifact; the config is the execution artifact.

**Next:** Iteration 2 should focus on the discovery output format — the structured document that serves as both report and config. Also: Tauri vs SwiftUI decision, AI pre-mapping UX.
