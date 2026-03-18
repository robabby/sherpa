# Client Deployment Pipeline — Research

## Iterations

| # | Date | Focus | Vectors |
|---|------|-------|---------|
| 1 | 2026-03-16 | Landscape survey — discovery frameworks, multi-surface deployment, config patterns, Tailscale topology, pricing | 5 |

## Key Findings

- **Bain validates Q1** ("What decisions?") but no consulting framework is recursive or produces executable output
- **Discovery output is the center of gravity** — a structured artifact that renders as both a client-facing report and machine-consumable config. `defineConfig()` is one consumer, not the center.
- **Surfaces and tiers are orthogonal** — desktop is the "controlled" surface (IT/compliance), not the "simple" surface. Any client at any tier may use any surface combination.
- **Tailwind presets + Nuxt layers** are the config composition models to follow
- **Tauri 2.0** meets the thumb drive test (~10 MB, sub-500ms startup, Swift plugins)
- **Per-client tailnet** is the right Tailscale topology (hard isolation, clean handoff)
- **Market pricing:** $1.5K-$7.5K+ discovery+deploy (scales with org complexity), $500-$2K/mo governance retainer (scales with dynamism)

## Open Questions

1. **Discovery output format** — Structured document that serves as both report and config. The central design question for the whole pipeline.
2. **Tauri vs. SwiftUI decision** — Tauri with Swift plugins vs. pure native. Needs a spike or decision checkpoint.
3. **AI pre-mapping + jagged frontier** — Human checkpoint UX so AI org maps get validated without anchoring bias.
4. **Tailscale multi-tailnet alpha readiness** — Production-ready or need fallback?
5. **Pricing depth** — Market data provides framing; real numbers need testing against real engagements.

## Cross-References

- `vps-remote-compute` — VPS stack research (iteration 1 complete). Infrastructure foundation for VPS-tier deployments.
- `agentic-consulting-landscape` — Market intelligence. Shares pricing and positioning findings.
- `consulting-disruption-signals` — Incumbent transformation tracking. Content strategy fuel.
- `agentic-organization-model` — Agent instances per client deployment. Informed by this work.
- `studio-desktop-app` — Desktop surface design. Tauri findings feed directly.
