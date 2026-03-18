# Iteration 1 — 2026-03-16

## Findings

### Vector 1: Recursive Discovery Frameworks in Consulting
**Question:** How do top firms and agile coaches structure organizational discovery? How does Sherpa's four-question recursive framework compare?
**Full report:** [iteration-1/vector-1-discovery-frameworks.md](iteration-1/vector-1-discovery-frameworks.md)

- Bain's entire org design practice starts from "list critical decisions, organize around them" — directly validates Sherpa's Q1. Decision X-ray, RAPID tool, Org Navigator across 4,000+ projects. ([Bain](https://www.bain.com/insights/decision-driven-organization/))
- McKinsey's OHI measures 43 practices across 9 dimensions (8M+ survey responses) but is a flat survey, not recursive. ([McKinsey](https://www.mckinsey.com/solutions/orgsolutions/overview/organizational-health-index))
- Sociocracy 3.0 has a formal "Fractal Organization" pattern — closest structural analog to Sherpa's recursive approach. ([S3](https://patterns.sociocracy30.org/fractal-organization.html))
- 9Lenses is the closest existing product to AI pre-mapping — platform for remote org interviews at scale. ([9Lenses](https://9lenses.com/))
- Harvard/BCG "Jagged Frontier" study: AI users 19% less likely to get right answer outside AI's competence. Human refinement is essential, not optional. ([HBS](https://www.hbs.edu/faculty/Pages/item.aspx?num=64700))
- Paid discovery as standalone service is industry norm: 5-10% of project value, fixed fee. ([The Visible Authority](https://www.thevisibleauthority.com/blog/every-consulting-firm-needs-a-discovery-service))

**Implications:** Sherpa's Q1 is Bain-validated. Q4 ("what breaks?") is genuinely novel — no framework asks this. The recursive property is structurally closer to Sociocracy 3.0 than to MBB. AI pre-mapping needs a human checkpoint to avoid "jagged frontier" anchoring.

### Vector 2: Multi-Surface Deployment Patterns
**Question:** How do Notion, Linear, Slack, Figma deliver desktop + web + API from one codebase?
**Full report:** [iteration-1/vector-2-multi-surface-deployment.md](iteration-1/vector-2-multi-surface-deployment.md)

- 7 architecture patterns identified. Electron wrapper dominant but every adopter eventually does partial native rewrites.
- Tauri 2.0: ~10 MB bundles, 30-40 MB memory, sub-500ms startup, Swift plugins for macOS. Security-by-default. ([Tauri](https://v2.tauri.app/))
- Linear's local-first sync engine: share the data layer, not the view layer. Different surfaces consume same state.
- Stripe/Vercel: SDK and dashboard share API contract, not UI code. Independent semver cadence.
- Universal pattern: monorepo with shared core consumed by surface-specific shells.

**Implications:** Tauri 2.0 is the strongest desktop candidate (meets thumb drive test). `@sherpa/studio-core` as shared core consumed by all surfaces is architecturally validated. Each surface deploys through its own channel — desktop installer, npm publish, web deploy.

### Vector 3: defineConfig() Layered Schema Patterns
**Question:** How do Vite, Next.js, Tailwind, ESLint structure layered config with overrides?
**Full report:** [iteration-1/vector-3-defineconfig-patterns.md](iteration-1/vector-3-defineconfig-patterns.md)

- Tailwind v3 presets are the gold standard: three-layer merge (defaults → presets → user), with explicit "replace vs extend" distinction per section. ([Tailwind](https://v3.tailwindcss.com/docs/presets))
- ESLint brought back `extends` after users struggled with raw array composition — ergonomic abstraction matters. ([ESLint blog](https://eslint.org/blog/2025/03/flat-config-extends-define-config-global-ignores/))
- Nuxt layers prove presets can be directories (components, pages, config), not just config objects. ([Nuxt](https://nuxt.com/docs/4.x/getting-started/layers))
- Turborepo's `$TURBO_EXTENDS$` microsyntax: per-field merge-vs-replace control.
- Every tool that inherits arrays has gotten it wrong at some point — document merge semantics explicitly.
- Config-as-function (Vite, Next.js) enables environment-aware deployment config.

**Implications:** Add `extends` to `defineConfig()` (Nuxt model). Client presets should be directories with roles + vocabulary + conventions, not just config objects. Use Tailwind's replace-vs-extend distinction per section. Support function form for deployment-layer environment switching.

### Vector 4: Multi-Tenant Tailscale Topology
**Question:** Own tailnet per client vs shared tailnet with ACLs? Real-world MSP patterns?
**Full report:** [iteration-1/vector-4-multi-tenant-tailscale.md](iteration-1/vector-4-multi-tenant-tailscale.md)

- Tailscale's native multi-tailnet support (alpha) positions per-customer tailnets as the intended pattern. API-created tailnets for automation. ([Tailscale](https://tailscale.com/blog/multiple-tailnets-alpha))
- TailOps (`mmit-brad/tailops`) — MSP CLI toolkit proves real-world adoption of per-client tailnet model. ([GitHub](https://github.com/mmit-brad/tailops))
- Support access via node sharing: quarantined by default, client controls acceptance and revocation. ([Tailscale](https://tailscale.com/kb/1084/sharing))
- Single device cannot connect to multiple tailnets simultaneously — API-based management sidesteps this. ([GitHub Issue #183](https://github.com/tailscale/tailscale/issues/183))
- Tailscale Services (GA late 2025): publish internal resources as named services with MagicDNS. ([Tailscale](https://tailscale.com/blog/services-ga))
- No documented tailnet-to-tailnet device migration — strong argument for provisioning on client's own tailnet from day one.

**Implications:** Per-client tailnet is the right topology. Hard isolation, clean handoff (client takes ownership of their tailnet), support via node sharing. `sherpa init --remote` can use Tailscale API to create client tailnet programmatically.

### Vector 5: Consulting Pricing for AI Infrastructure
**Question:** What does the market bear for managed AI infrastructure deployment?
**Full report:** [iteration-1/vector-5-ai-infra-pricing.md](iteration-1/vector-5-ai-infra-pricing.md)

- AI readiness assessments: $2K-$8K fixed. AI agent deployment: $5K-$15K. AI retainers: $2K-$5K/mo essential tier. ([Salt Technologies](https://www.salttechno.ai/services/ai-readiness-audit/), [Leanware](https://www.leanware.co/insights/how-much-does-an-ai-consultant-cost))
- MSP target gross margin: 50% on services. Per-user: $50-$250/user/month. ([Kaseya](https://www.kaseya.com/resource/msp-pricing-managed-it-services-pricing/))
- Three-phase structure dominates: paid discovery → fixed-fee implementation → monthly retainer.
- 73% of clients prefer outcome-based pricing over time-based. ([Agentive AIQ](https://agentiveaiq.com/blog/how-much-should-i-charge-for-ai-consulting-pricing-guide))
- AI literacy workshops: $5K-$10K flat for half-day, small team. ([SetupBots](https://setupbots.com/blog/ai-training-services-pricing-guide))

**Implications:** Market supports $1.5K-$7.5K+ for discovery+deployment (scaling with org complexity). Infrastructure hosting at ~50% margin. Convention tuning retainer $500-$2K/mo. Infrastructure margin alone is trivial — retainer is where recurring value lives.

## Synthesis

**Three cross-cutting patterns across all five vectors:**

### 1. The Discovery Output Is the Center of Gravity

Bain validates the decision-driven discovery approach (V1), Tailwind/Nuxt prove layered config composition works (V3), and the market pays for discovery as a standalone deliverable (V5). Sherpa's structural innovation: the discovery output is both a **client-facing report** (the trust artifact that meets consulting expectations) and a **machine-executable configuration** (the thing that deploys). Every other consultancy produces a report that someone else must implement. Sherpa's reports also run.

The discovery output format — not `defineConfig()` specifically — is what sits at the center. `defineConfig()` is one consumer of that output (the engineer's entry point). The desktop app, Studio web UI, and `sherpa init` CLI are other consumers. The highest-leverage design question is the structured discovery output format that serves all of them.

### 2. Surfaces and Tiers Are Orthogonal

Every multi-surface product converges on a shared core with independent distribution per surface (V2). Per-client tailnet is the right networking topology for VPS surfaces (V4). Each surface deploys through its own channel: desktop installer (Tauri), `pnpm add` (npm), `sherpa init --remote` (VPS + Docker + Tailscale).

**Critical correction:** Surfaces (desktop, web, code dependency) and tiers (Sm/Md/Lg/Enterprise) compose independently. Desktop is not "the simple surface" — it's the **controlled** surface that passes IT review, runs air-gapped, and meets compliance requirements. A regulated enterprise might require the desktop app precisely because of governance constraints, while also running full Lg-tier infrastructure for their engineering team. Surface selection is driven by: who's using it, IT constraints, compliance requirements, existing toolchain — not by tier.

### 3. Pricing Follows Organizational Complexity and Dynamism

Market data (V5) supports pricing along two axes, neither of which is surface selection:

| Dimension | What drives price | Range |
|-----------|------------------|-------|
| **Discovery + Configuration** | Org complexity — nodes, recursion depth, compliance | $1,500 → $7,500+ |
| **Deployment** | Infrastructure tier — local vs VPS vs cloud + GPU | $0 → $2,000 |
| **Infrastructure hosting** | Tier — compute, storage, model serving (~50% margin) | $0/mo → $400+/mo |
| **Governance retainer** | Dynamism — static org self-serves, evolving org needs tuning | $0/mo → $2,000/mo |
| **Training** | Scope — team size, depth, custom materials | $1,500-$3,000/workshop |

Surfaces are a deployment detail, not a billing dimension. A client gets whichever surfaces their users need. Pricing will need deeper research closer to real engagements.

## Proposals Generated

Research validates the proposal's architecture with three refinements: (1) discovery output format (report + config) is the central design question, (2) surfaces and tiers are orthogonal, (3) pricing follows org complexity and dynamism, not surface selection.

## Open Questions for Next Iteration

1. **Discovery output format** — What's the structured document format that renders as both a human report and machine-consumable config? This is the highest-leverage design question — it sits at the center of the whole pipeline.
2. **Tauri vs. SwiftUI decision** — Tauri meets the thumb drive test but the vision says "native." Is Tauri with Swift plugins close enough? Need a spike or decision checkpoint.
3. **AI pre-mapping + jagged frontier** — How to design the human checkpoint so AI-generated org maps get validated without anchoring bias? What's the UX for "here's what the AI thinks, correct it"?
4. **Tailscale multi-tailnet alpha readiness** — Is the alpha production-ready, or does Sherpa need a fallback (separate accounts per client)?
5. **Pricing depth** — Market data provides framing but real numbers need testing against real engagements. Deserves its own research cycle when closer to delivery.
