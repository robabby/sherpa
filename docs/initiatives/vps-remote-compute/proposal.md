---
status: integrated
initiative: vps-remote-compute
created: 2026-03-16
updated: '2026-03-18'
type: new-plan
risk: structural
targets:
  - docs/initiatives/vps-remote-compute/research/              # (new file)
  - scripts/backends/_ai-sdk-dispatch.mjs
  - scripts/backends/lm-studio.mjs
  - scripts/backends/lm-studio-api.mjs
  - packages/studio-mcp/src/server.ts
  - packages/studio-core/src/dispatch.ts
  - packages/studio-core/src/dispatch-meta.ts
  - scripts/resolve-route.mjs
  - scripts/worker.sh
  - apps/studio/sherpa.config.ts
  - docker-compose.yml                                         # (new file)
  - infrastructure/                                            # (new file)
dependencies: []
informs:
  - ai-sdk-dispatch
  - ai-gateway-dispatch
  - scheduled-dispatch
  - mcp-coordination-layer
  - client-deployment-pipeline
spawned-from: null
personas:
  - engineer
---

# VPS Remote Compute

## Summary

Stand up a Virtual Private Server to run Sherpa's agentic systems, LM Studio, and dispatch backends on dedicated remote compute instead of Rob's local machine. This requires a provider evaluation (Hetzner, Digital Ocean, and additional contenders), followed by a rock-solid integration design so the dispatch pipeline, MCP server, and local development workflow all function seamlessly against remote infrastructure.

## State Snapshot

**Everything runs locally today.** The entire dispatch pipeline — 5 CLI backends, 3 API backends, LM Studio, MCP server — executes on the local machine:

- **LM Studio** is hardcoded to `http://localhost:1234` in three places: `scripts/backends/lm-studio.mjs`, `scripts/backends/lm-studio-api.mjs`, and `packages/studio-mcp/src/server.ts` (line 57). The `LM_STUDIO_URL` env var exists but defaults to localhost.
- **CLI backends** (`claude.sh`, `opencode.sh`, `codex.sh`, `gemini.sh`) shell out to locally-installed CLI tools. No remote execution path exists.
- **API backends** (`groq.mjs`, `google-ai.mjs`) call cloud APIs from the local machine — these are already "remote" by nature but consume local CPU/memory for the Node.js process.
- **MCP server** (`packages/studio-mcp/`) runs on port 3100 locally. Task dispatch spawns `lm-worker.mjs` as a local detached process.
- **No container infrastructure** — no Dockerfile, docker-compose.yml, or deployment scripts exist in the repo.
- **No remote host configuration** in `sherpa.config.ts` — dispatch routing is hardcoded in `resolve-route.mjs` and mirrored in `packages/studio-core/src/dispatch.ts`.
- **Dispatch modes** (interactive, supervised, overnight) assume local execution. Overnight batch dispatch via `dispatch-queue.sh` is the closest thing to "unattended remote work" but still runs locally.

**Related initiatives:** `ai-sdk-dispatch` (approved) investigates TypeScript-native dispatch via AI SDK. `ai-gateway-dispatch` (pending) consolidates AI SDK providers. `mcp-coordination-layer` (approved) designs SQLite-backed state authority. `scheduled-dispatch` (pending) adds time-based dispatch. None address remote infrastructure — they all assume a local runtime.

## Proposed Changes

### Phase 1: Provider Evaluation (Research)

Structured evaluation of VPS providers across criteria that matter for agentic workloads, with a **two-tier cost model**:

**Tier 1 — Sherpa baseline (free or near-free):** CPU-only VPS for running dispatch workers, MCP server, lightweight inference (quantized small models). Target: $0-5/month. This is the always-on infrastructure Sherpa pays for.

**Tier 2 — Client GPU instances (billable):** On-demand GPU VPS for running 9B+ models when a client engagement requires it. Provisioned per-project, billed through to the client via fees/surcharges. Must be easy to spin up and tear down. Research must document per-hour and per-month costs clearly so they can be structured into consulting contracts.

- **Candidates**: Hetzner, Digital Ocean, plus at minimum: Vultr, Linode (Akamai), OVHcloud, Contabo, Fly.io, Railway, and any providers with compelling budget tiers or GPU spot pricing.
- **Evaluation criteria**: Cheapest CPU-only instance, GPU availability and pricing (on-demand + spot), price/performance ratio, bare metal vs. shared options, network latency (US West Coast), API for provisioning (spin up/tear down GPU instances programmatically), Docker/container support, persistent storage, bandwidth pricing, DDoS protection, data sovereignty/region options, upgrade path clarity.
- **Deliverable**: Scored comparison matrix in `research/` with a clear recommendation and runner-up. Must include a cost table showing: Sherpa baseline monthly cost, client GPU hourly/monthly cost, and upgrade path from Tier 1 to Tier 2.

### Phase 2: Infrastructure Design

Define the remote compute architecture:

- **Containerization** — Docker Compose for service orchestration: LM Studio server, MCP server, dispatch worker pool. Each service with health checks, restart policies, resource limits.
- **Networking** — Tailscale mesh VPN as the recommended approach: free for personal use (up to 100 devices), zero-config NAT traversal, WireGuard-based encryption, automatic key rotation, and MagicDNS for service discovery. No ports exposed to public internet. Tailscale beats raw WireGuard (less manual config), SSH tunnels (no port forwarding management), and traditional VPNs (no server to maintain). Falls back to direct WireGuard if Tailscale's relay infrastructure is ever a concern.
- **Configuration** — Extend `sherpa.config.ts` with a `remote` section: host, ports, auth, service URLs. The dispatch pipeline reads this config to determine whether to execute locally or route to the VPS.
- **Backend adaptation** — Modify dispatch scripts and TypeScript layer so CLI backends can optionally SSH-exec on the remote host, and API backends can point to the VPS-hosted LM Studio URL.

### Phase 3: Integration

Wire the VPS into the existing dispatch pipeline:

- **`resolve-route.mjs` + `dispatch.ts`** — Add host resolution: given a backend, determine if it runs locally or remotely based on config.
- **`worker.sh`** — Add remote execution path: SSH dispatch for CLI backends, URL rewriting for API backends.
- **MCP server** — Support connecting to a remote LM Studio instance (already partially supported via `LM_STUDIO_URL` but needs auth and health check adaptation for remote).
- **Studio UI** — Surface remote infrastructure health (VPS status, service health, latency) alongside existing backend health in the dispatch center panel.
- **Deployment scripts** — `infrastructure/deploy.sh` or equivalent to provision, configure, and update the VPS from a single command.

## Rationale

Running everything locally creates three problems:

1. **Resource contention** — LM Studio inference, overnight dispatch queues, and active development compete for the same CPU/GPU/RAM. A 9B parameter model saturates the machine during overnight runs.
2. **Availability** — Agents can only work when the laptop is open and running. A VPS enables true 24/7 overnight dispatch without worrying about sleep, restarts, or lid-close.
3. **Scalability ceiling** — The local machine has fixed resources. A VPS can be sized to the workload and upgraded independently.

The provider evaluation is essential before committing. Hetzner and Digital Ocean are strong candidates but have different strengths (Hetzner: price/performance, especially for dedicated/GPU; Digital Ocean: developer experience, managed services). Other providers may offer better GPU options (Vultr, Lambda) or edge deployment (Fly.io). Due diligence prevents lock-in regret.

## Dependencies

- **Informs `ai-sdk-dispatch`** — Remote host configuration design will influence how TypeScript-native dispatch resolves endpoints.
- **Informs `ai-gateway-dispatch`** — Gateway provider URLs may need to route through VPS.
- **Informs `scheduled-dispatch`** — Scheduled tasks are the primary beneficiary of always-on remote compute.
- **Informs `mcp-coordination-layer`** — MCP state authority may live on the VPS, changing the deployment topology.

No hard blocking dependencies. This initiative can proceed independently.

## Review Notes

**Resolved questions:**
- **GPU**: Not on the baseline VPS. CPU-only for Sherpa's own use. GPU instances are client-billable, spun up on-demand per engagement.
- **Networking**: Tailscale. Free, WireGuard-based, zero-config, automatic key rotation. Best option for free general use with strong security.

**Open questions:**
- Single VPS vs. multi-node — start with one box and grow, or design for multiple nodes from the start?
- Managed Kubernetes vs. Docker Compose — K8s is overkill for the current scale but would ease future scaling. Docker Compose is simpler and sufficient now.
- RAM tier decision — Is Hetzner's 4 GB (CX23) sufficient for baseline, or should we invest in 8 GB for 7B model capability?

**Trade-offs:**
- This is `structural` risk because it changes the fundamental execution topology. A bad integration could break dispatch reliability. The design phase must include rollback: local execution remains the fallback if the VPS is unreachable.
- Provider evaluation adds a research session upfront but prevents a costly migration later.

**Effort:** 4-6 sessions
**Session breakdown:**
- Session 1: Provider research — evaluation matrix, benchmarks, pricing analysis, recommendation
- Session 2: Infrastructure design — Docker Compose, networking, security architecture
- Session 3: Configuration and dispatch adaptation — extend sherpa.config.ts, modify resolve-route and worker.sh
- Session 4: MCP and LM Studio remote integration — remote health checks, URL rewriting, auth
- Session 5: Deployment tooling and Studio UI health panel
- Session 6 (if needed): Edge cases, failover testing, documentation
