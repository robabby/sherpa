---
status: pending
initiative: client-deployment-pipeline
created: 2026-03-16
updated: '2026-03-17'
type: new-plan
risk: structural
targets:
  - packages/studio/src/config.ts                                # defineConfig() expansion
  - packages/studio-core/src/config.ts                           # config schema
  - packages/studio-core/src/dispatch.ts                         # remote dispatch
  - packages/studio-mcp/src/server.ts                            # remote MCP
  - packages/studio-cli/                                         # (new — sherpa init, sherpa deploy)
  - infrastructure/terraform/                                    # (new — provider-agnostic modules)
  - infrastructure/docker-compose.client.yml                     # (new — parameterized stack)
  - docs/consulting/discovery-framework.md                       # (new — four-question system)
  - docs/agents/roles/                                           # client-configurable roles
  - .claude/rules/                                               # framework vs client conventions
  - .claude/skills/                                              # framework vs client skills
dependencies:
  - vps-remote-compute
  - sherpa-framework-extraction
informs:
  - agentic-organization-model
  - agentic-consulting-landscape
  - sherpa-website
  - studio-desktop-app
spawned-from: vps-remote-compute
personas:
  - engineer
  - product-manager
  - designer
---

# Client Deployment Pipeline

## Summary

Build the end-to-end system for deploying Sherpa to clients of any size — from a desktop app on an analyst's laptop to a multi-surface enterprise deployment with dedicated GPU inference. The pipeline connects a recursive discovery framework (four questions that map any organization to Sherpa config) to a surface deployment model (code dependency, web UI, desktop app) to provider-agnostic infrastructure provisioning. The consulting engagement produces a self-sufficient system the client owns — empowerment over dependency.

## State Snapshot

**What exists:**
- `@sherpa/studio-core`, `studio-ui`, `studio-mcp` — extracted framework packages, domain-agnostic. `sherpa-framework-extraction` is in-progress.
- `sherpa.config.ts` — minimal config today (paths only). No client parameterization, no remote host config, no organizational node awareness.
- `defineConfig()` in `packages/studio/` — the umbrella package intended to be the client-facing entry point. Currently thin.
- Dispatch pipeline — shell scripts + TypeScript layer routing tasks to backends. All assume local execution.
- Behavioral agent roles — 13 roles in `docs/agents/roles/`, 10 framework-level archetypes. Schema finalized.
- Convention files — 6 framework-level rules in `.claude/rules/`. 3 framework-level skills.
- Desktop app vision — "thumb drive test" is the design constraint. Demo IS the product.

**What doesn't exist:**
- No discovery framework for mapping client organizations to Sherpa config
- No surface deployment model (which of the three surfaces does this client get?)
- No client-facing configuration separating framework defaults from client customization
- No VPS provisioning automation (Terraform or otherwise)
- No parameterized Docker Compose for client deployments
- No `sherpa init` CLI for client setup
- No multi-client infrastructure management (monitoring, updates, support)
- No documented engagement workflow

**Related initiatives:**
- `vps-remote-compute` (parent) — proving the VPS stack works for Sherpa's own use. Must land first.
- `sherpa-framework-extraction` (dependency) — the framework IS what gets deployed. Must be extractable.
- `studio-desktop-app` — the Sm tier surface. Thumb drive demo → persistent install.
- `agentic-organization-model` — agent instances per client deployment. Informed by this work.
- `agentic-consulting-landscape` — service design and pricing. This initiative provides the delivery mechanism.

## Proposed Changes

### 1. Recursive Discovery Framework

A repeatable system for mapping any client organization to Sherpa configuration. Same four questions at every organizational level:

1. **What decisions get made here?** → Organizational nodes in `defineConfig()`
2. **What information feeds those decisions?** → Data integrations, knowledge base seeding
3. **What quality means here** → Conventions, quality gates, agent behavioral constraints
4. **What breaks under pressure?** → Trails — engagement patterns addressing what's breaking

The framework is recursive: every answer to question 1 can become its own node with the same four questions at the next level down. This means the methodology doesn't change with scale — you recurse deeper.

Discovery output maps directly to Sherpa artifacts:

| Discovery answer | Sherpa artifact |
|-----------------|----------------|
| Decision domains | Organizational nodes in `defineConfig()` |
| Information sources | Data integrations, knowledge base seeding |
| Quality standards | Conventions, quality gates, agent behavioral constraints |
| Pressure points | Trails — the engagement patterns that address what's breaking |

**Sm tier (Shayna):** 30-minute conversation, one node, 2-3 conventions, done.
**Lg tier:** 2-3 workshops across org levels, multiple nodes, cross-node synthesis.
**Enterprise:** Same framework, deeper recursion, more nodes, compliance overlays.

AI agents pre-map nodes from existing client docs before the human consultant arrives.

### 2. Three-Surface Deployment Model

Sherpa has three interaction surfaces. Each maps to a user type and IT context, not a business size:

| Surface | Who it's for | Why they choose it | Delivery mechanism |
|---------|-------------|-------------------|-------------------|
| **Desktop app** | Anyone needing a controlled, local-first experience | Passes IT review, runs air-gapped, meets compliance/data residency requirements | Native install |
| **Web UI (Studio)** | Anyone needing visibility into agents, conventions, governance | Accessible from any device, shared dashboards, real-time monitoring | Browser → localhost or VPS |
| **Code dependency** | Engineers working in a codebase | Integrates into existing toolchain, CI/CD, version control | `pnpm add @sherpa/studio` |

**Surfaces and tiers are orthogonal.** Any client at any tier may use any combination of surfaces. Surface selection is driven by who's using the system, IT constraints, compliance requirements, and existing toolchain — not by deployment size.

Infrastructure tiers determine compute resources and hosting:

| Tier | Infrastructure | Example |
|------|---------------|---------|
| **Sm** | Local only. Zero infra cost | Solo practitioner, small team with simple needs |
| **Md** | Small VPS ($5-50/mo) or self-hosted locally | Team needing always-on inference and shared access |
| **Lg** | Dedicated VPS ($50-200/mo), 7B+ models, multi-node conventions | Organization with multiple departments |
| **Enterprise** | Client's preferred cloud (AWS/GCP/Azure), GPU cluster, data sovereignty | Regulated multi-team organization |

A regulated enterprise might require the desktop app (controlled surface, on-device data) while also running Lg-tier infrastructure for their engineering team. A startup might use only the code dependency and web UI on a Sm tier (localhost). The pipeline composes the right surfaces at the right tier for each client's context.

### 3. Client Configuration Layer

Extend `defineConfig()` to separate three config layers:

- **Framework layer** — defaults from `@sherpa/studio` packages. Quality gates, role archetypes, convention rules. Never edited by clients.
- **Client layer** — produced by the discovery framework. Client vocabulary, organizational nodes, custom personas, custom roles, model preferences, trails. This is what the consulting engagement configures.
- **Deployment layer** — surface selection, remote host config, Tailscale settings, provider credentials, monitoring endpoints. Infrastructure concerns separate from organizational concerns.

The config schema is the contract between Sherpa Consulting and the client. Discovery produces it. Deployment reads it. The client can customize within the client layer without touching framework or deployment internals.

### 4. Provider-Agnostic Infrastructure

Terraform modules and Docker Compose templates that support any tier from day one:

**Terraform modules:**
- Abstract VPS provisioning behind a provider-agnostic interface
- Hetzner (primary, budget), IONOS (US presence), AWS/GCP/Azure (enterprise)
- Parameterized by: client name, tier, region, instance size, Tailscale auth key
- GPU add-on module: RunPod (cost-optimized) or AWS/GCP (enterprise invoices)
- Provider is an implementation detail of the tier, not the organizing principle

**Docker Compose:**
- Parameterized `docker-compose.client.yml` deploys the Sherpa stack
- Ollama (model selection per client), MCP server, Studio app, dispatch workers, Tailscale sidecars
- Same images, different configuration. Environment variables and mounted config drive behavior.
- Resource limits scale with tier (4 GB budget → 16+ GB enterprise)

**CLI tooling (`packages/studio-cli/`):**

```
sherpa init --local                    # Sm tier: desktop/local setup
sherpa init --remote                   # Md+ tier: VPS deployment
  --provider hetzner
  --tier md
  --client "acme-corp"
  --tailscale-key tskey-auth-xxx
sherpa deploy --client "acme-corp"     # Push config/updates to existing deployment
sherpa health --client "acme-corp"     # Check deployment health
```

Pipeline for `sherpa init --remote`:
1. Provisions VPS via Terraform (provider determined by tier + region)
2. Installs Docker + Tailscale on the VPS
3. Deploys Docker Compose stack with client config (from discovery)
4. Seeds conventions (framework defaults + client layer from discovery)
5. Seeds behavioral agent roles (framework archetypes + client-specific roles)
6. Pulls and loads the specified model into Ollama
7. Verifies health (MCP server responding, inference working, Studio loading)
8. Outputs: Tailscale hostname, Studio URL, SSH access

### 5. Multi-Client Management

Sherpa Consulting monitors and supports multiple client deployments:

- **Registry** — which clients have deployments, what surfaces, what tier, what version, health status
- **Update pipeline** — push framework updates to client deployments (new Studio version, updated conventions, model upgrades)
- **Health dashboard** — aggregate health across all client deployments in Sherpa's own Studio instance
- **Support access** — Tailscale ACLs giving Sherpa Consulting access to client infrastructure, revocable by client
- **Self-host handoff** — generate complete config package for clients who want to run their own infrastructure

### 6. Engagement Workflow

The pipeline supports the full consulting engagement lifecycle:

```
Demo → Discovery → Configure → Deploy → Verify → Handoff → Support
```

| Stage | What happens | Pipeline role |
|-------|-------------|---------------|
| **Demo** | Thumb drive / desktop app or web demo | Desktop app IS the demo |
| **Discovery** | Four-question recursive framework | AI pre-maps, human refines |
| **Configure** | Discovery output → `defineConfig()` | Pipeline generates config |
| **Deploy** | Provision surfaces + infrastructure | `sherpa init` orchestrates |
| **Verify** | Prove the system works for their context | `sherpa health` + walkthrough |
| **Handoff** | Train client team, transfer ownership | Documentation + training materials |
| **Support** | Ongoing tuning, or self-service | Retainer or `sherpa deploy` for updates |

Self-service vs. white-glove is determined by whether the client's needs are static or evolving — not by tier size. A pharmacy with stable processes self-serves after setup. A company in transformation needs ongoing guidance.

## Rationale

**Empowerment over dependency (Pillar 3).** The client gets their own system — their own data, their own agents, running on infrastructure they own or control. When the engagement ends, the system keeps running. This is the opposite of how incumbent consultants operate.

**The value is in configuration, not infrastructure.** VPS costs are trivially small ($5-200/month). The behavioral agents, conventions, and quality gates tuned to the client's organization — that's what Sherpa's expertise produces. The pipeline automates the commodity part (provisioning) so consulting time goes to the high-value part (discovery and configuration).

**Scale readiness from day one.** The AI economy is reshaping rapidly. Sherpa must be capable of supporting any account size — from a single analyst to an enterprise — confidently and immediately. The architecture supports all four tiers from the start, even if early clients are Sm/Md.

**Discovery output = report = deployment input.** The four-question framework produces a structured discovery artifact that serves two purposes: a client-facing report (the trust artifact — polished, reviewable, presentable to a board) and a machine-consumable configuration (the thing that deploys). Every other consultancy produces a report that someone else must implement. Sherpa's reports also run.

**Surfaces and tiers compose independently.** Not every client needs a VPS. Not every desktop user is "simple." The pipeline composes the right surfaces at the right infrastructure tier for each client's context — driven by who's using it, IT constraints, compliance needs, and existing toolchain.

### Business Model

Pricing follows organizational complexity and dynamism, not surface selection. Surfaces are a deployment detail, not a billing dimension.

| Dimension | What drives price | Billing |
|-----------|------------------|---------|
| Discovery + configuration | Organizational complexity — nodes, recursion depth, compliance overlays | Fixed project fee |
| Deployment | Infrastructure tier — local vs VPS vs cloud + GPU | Included in project fee or separate provisioning fee |
| Infrastructure hosting | Tier — compute, storage, model serving (~50% margin on cost) | Monthly, or client self-hosts |
| Governance retainer | Dynamism — static orgs self-serve, evolving orgs need ongoing tuning | Monthly retainer, or $0 after handoff |
| Training | Scope — team size, depth, custom materials | Per-workshop fee |

### Validation Path

1. **Sherpa-in-Sherpa** (current) — dog-fooding Studio within the Sherpa repo
2. **Sherpa-in-WavePoint** — first external codebase adoption, tests code dependency surface + framework extraction
3. **Desktop app for Shayna** — install on a non-technical user's laptop. If an analyst at a pharmacy company gets value without technical help, the product works.

## Dependencies

- **`vps-remote-compute`** (hard) — must prove the VPS stack works for Sherpa's own use before offering it to clients. Docker Compose patterns, Tailscale integration, and Ollama setup from that initiative become the foundation for Md+ tiers.
- **`sherpa-framework-extraction`** (hard) — the `@sherpa/studio-*` packages must be cleanly extractable and configurable via `defineConfig()` before they can be deployed to any client surface.

**Informs:**
- **`agentic-organization-model`** — agent instances per client deployment. Each client's deployment has its own agent registry scoped to their org nodes.
- **`agentic-consulting-landscape`** — this pipeline IS the delivery mechanism for Sherpa's consulting services. Informs service design and pricing.
- **`sherpa-website`** — "we deploy your own AI infrastructure, configured to your organization" is a positioning message.
- **`studio-desktop-app`** — the controlled, local-first surface. Desktop app design must support the discovery → config → install workflow.

## Review Notes

**Scope:** This initiative covers the full client engagement pipeline — from discovery framework through deployment through ongoing support. Previous version scoped this to infrastructure only; the rewrite reflects that discovery, surfaces, and deployment are connected through the discovery output format.

**Open questions (updated with iteration 1 research findings):**
- **Discovery output format** — what's the structured document format that renders as both a client-facing report and machine-consumable config? This is the central design question for the whole pipeline.
- **Tailscale topology** — research recommends per-client tailnet (hard isolation, clean handoff, support via node sharing). Tailscale's multi-tailnet alpha supports this but is not yet GA. Fallback needed?
- **Update mechanism** — how do framework updates reach client deployments? Docker image tags + Watchtower? Git-based deploy? `sherpa deploy` push?
- **Data sovereignty** — regulated clients will have strict requirements about where their VPS lives and who can access it. Per-client tailnet helps. Headscale (self-hosted control plane) for extreme cases?
- **Self-hosted handoff** — the pipeline must support "generate config and hand off" as well as "we provision and manage." Per-client tailnet ownership transfer is clean.
- **Discovery tooling + jagged frontier** — AI pre-mapping of org nodes from client docs is ahead of industry, but Harvard/BCG research shows AI can be confidently wrong outside its competence boundary. Human refinement step is essential, not optional. UX for "here's what the AI thinks, correct it" needs design.
- **Desktop app integration** — how does `sherpa init --local` connect to the native desktop app? Non-technical users won't open a terminal — desktop app needs its own onboarding flow. Tauri 2.0 is the strongest candidate (~10 MB, Swift plugins, security-by-default).

**Trade-offs:**
- Terraform adds complexity vs. manual provisioning. But manual doesn't scale past 3 clients.
- Supporting multiple VPS providers increases surface area. Start Hetzner-only, add providers when a client needs something different.
- Expanding scope to include discovery framework risks this initiative becoming too large. Mitigation: discovery framework is a document + templates, not heavy tooling.

**Effort:** 6-8 sessions (after dependencies land)
**Session breakdown:**
- Session 1: Discovery framework documentation + config schema design (four questions → `defineConfig()` mapping)
- Session 2: Client configuration layer — framework vs client vs deployment layers in `defineConfig()`
- Session 3: Terraform module for Hetzner VPS provisioning + Tailscale + Docker (provider-agnostic interface)
- Session 4: Parameterized Docker Compose template (Ollama + MCP + Studio + sidecars, tier-aware resource limits)
- Session 5: `sherpa init` CLI — local and remote paths, end-to-end provisioning pipeline
- Session 6: Multi-client registry and health monitoring in Studio
- Session 7: Update pipeline — `sherpa deploy` for pushing framework updates to client deployments
- Session 8 (if needed): GPU add-on module, data sovereignty variants, self-host handoff packaging
