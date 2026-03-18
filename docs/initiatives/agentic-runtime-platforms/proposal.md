---
status: approved
initiative: agentic-runtime-platforms
created: 2026-03-17
updated: '2026-03-18'
type: new-plan
risk: structural
targets:
  - packages/studio-core/src/dispatch-meta.ts
  - packages/studio-core/src/dispatch.ts
  - scripts/resolve-route.mjs
  - scripts/worker.sh
  - scripts/backends/openshell.mjs                   # (new file)
  - scripts/backends/openclaw.mjs                    # (new file)
  - apps/studio/sherpa.config.ts
  - infrastructure/openshell/                        # (new file)
  - infrastructure/openclaw/                         # (new file)
  - infrastructure/runtime-adapters/                 # (new file)
  - docs/initiatives/agentic-runtime-platforms/research/  # (new file)
dependencies:
  - vps-remote-compute
informs:
  - agent-infrastructure
  - client-deployment-pipeline
  - mcp-multi-backend-dispatch
  - mcp-coordination-layer
personas:
  - engineer
spawned-from: null
---

# Agentic Runtime Platforms

## Summary

Deploy OpenShell (NVIDIA's sandbox/policy engine, Apache 2.0) and OpenClaw on a remote VPS. Use `acpx` (Agent Client Protocol headless client) as the structured task submission layer. Introduce a `RuntimeAdapter` abstraction into Sherpa's dispatch so governance (behavioral roles, authority leases, conventions) separates cleanly from execution (sandboxing, context management, model routing). NemoClaw is just the opinionated installer for OpenShell+OpenClaw — the durable integration targets are OpenShell (sandbox/policy/routing) and `acpx` (task submission for any agent backend). This positions Sherpa as the governance layer that works with the runtimes clients are adopting.

## State Snapshot

**Sherpa's dispatch is tightly coupled to local CLI/API execution.** The `Backend` type (`packages/studio-core/src/dispatch-meta.ts:6-10`) enumerates 8 backends across two types: `cli` (claude, opencode, codex, gemini, lm-studio) and `api` (groq, google-ai, lm-studio-api). All CLI backends shell out to locally-installed tools via `scripts/backends/*.sh`. All API backends call cloud endpoints from the local Node.js process.

**No concept of an external runtime exists.** `BackendMeta` (`dispatch-meta.ts:14-21`) tracks type, display name, provider key, and env var — nothing about host, sandbox capability, or runtime protocol. `dispatch.sh` reads a role file, resolves a route, and `exec`s a local shell script. There's no indirection for "this backend runs on a remote platform."

**The VPS initiative (`vps-remote-compute`) provides the foundation** but is scoped for running existing backends remotely via SSH/Tailscale — not for deploying third-party agentic platforms. Its Docker Compose target is for containerizing current services, not OpenClaw/NemoClaw.

**The agent-infrastructure initiative** designs model routing and local model integration but assumes Sherpa builds its own runtime layer. NemoClaw's model routing (Nemotron locally, cloud via privacy router) and OpenShell sandboxing could replace significant portions of that custom work.

**Market context (as of March 2026):**
- **OpenClaw** — 250K+ GitHub stars, MIT-licensed, acqui-hired by OpenAI (founder joined, code to 501(c)(3) foundation). 13,729+ ClawHub skills (20% found malicious — see research). Docker + Ollama deployment. Minimum: 2 vCPU, 4GB RAM.
- **OpenShell** — NVIDIA's sandbox/policy engine (Apache 2.0). K3s inside Docker, 4-layer defense (Landlock, network namespace, seccomp, inference routing). Policy YAML per-binary, per-endpoint. Alpha, "single-player mode."
- **NemoClaw** — Opinionated installer that configures OpenShell for OpenClaw. NOT a standalone runtime.
- **acpx** — Agent Client Protocol headless client. Structured task submission (NDJSON streaming, JSON output, persistent sessions) for claude, codex, opencode, gemini, openclaw, cursor, copilot.

## Proposed Changes

### Phase 1: Deployment and Experimentation (2 sessions)

Deploy both platforms on the VPS provisioned by `vps-remote-compute`:

- **OpenClaw deployment** — Docker Compose (2 services: gateway + cli). Map skill system to Sherpa behavioral roles. Test `POST /hooks/agent` webhook for external task submission. Test constraint injection via `AGENTS.md` workspace files and `before_prompt_build` hook.
- **OpenShell deployment** — Install via NemoClaw installer, then drive `openshell` CLI directly (bypass `nemoclaw onboard` per issue #208 for CPU-only). Test sandbox creation, policy YAML authoring, inference routing to NVIDIA cloud (free tier). Validate CPU-only operation on Hetzner CX33/CX43.
- **acpx integration testing** — Install `acpx` inside an OpenShell sandbox. Test structured task submission (`acpx claude --format json "task"`), NDJSON streaming, and `--no-wait` fire-and-forget dispatch. Validate that `acpx` can submit to agents inside sandboxes from the host.
- **Two-layer constraint test** — Write a Sherpa role definition, translate it to both an OpenClaw `SKILL.md` (advisory) and an OpenShell `policy.yaml` (enforced). Verify advisory constraints guide behavior while enforced constraints block violations.

### Phase 2: Runtime Adapter Architecture (1 session)

Introduce a `RuntimeAdapter` interface following the Blueprint/Engine pattern (validated by Auton Framework research):

- **Extend `BackendType`** — Add `'sandboxed'` alongside existing `'cli' | 'api'`. Sandboxed backends delegate to OpenShell + acpx rather than spawning a local process.
- **`RuntimeAdapter` contract** — Any system that can accept a task (with behavioral constraints, authority scope, and context package) and return structured results is a valid runtime. Define in `packages/studio-core/src/dispatch.ts`. Adopts the gateway pattern from Amazon Bedrock AgentCore: intercept dispatch, validate authority, apply constraints, then delegate.
- **Two adapter implementations:**
  - `scripts/backends/openshell.mjs` — Creates OpenShell sandbox, applies policy YAML from role constraints, routes inference, submits task via `acpx` inside sandbox. Handles any agent backend (claude, codex, opencode, gemini) inside the sandbox.
  - `scripts/backends/openclaw.mjs` — Submits to OpenClaw's webhook API (`POST /hooks/agent`) directly, without sandbox. For non-sensitive workloads where OpenShell overhead isn't needed.
- **Config extension** — Add `runtimes` section to `sherpa.config.ts`: endpoint, auth, sandbox preferences, inference routing preferences, policy templates per role.

### Phase 3: Dispatch Integration (1-2 sessions)

Wire the adapters into the existing dispatch pipeline:

- **`resolve-route.mjs`** — Support routing to sandboxed backends. Task-type routing can resolve to `openshell` or `openclaw` as backends.
- **`worker.sh`** — Sandboxed backends spawn via `openshell.mjs` adapter. The adapter: (1) creates sandbox with policy from role constraints, (2) configures inference provider, (3) submits task via `acpx`, (4) streams NDJSON output to task log.
- **Two-layer constraint translation** — Sherpa role definitions produce BOTH:
  - OpenClaw `SKILL.md` (advisory) — disposition, quality-bar, fail triggers become behavioral instructions
  - OpenShell `policy.yaml` (enforced) — authority leases become network/filesystem/inference policies
- **Health and observability** — `openshell sandbox list` + `openshell logs` for sandbox health. Surface in Studio dispatch center.

### Phase 4: OpenShell as Primary Runtime (1 session)

Formalize OpenShell as the earmarked primary runtime for autonomous agent execution:

- **Default routing** — Configure `sherpa.config.ts` so autonomous Worker dispatch defaults to OpenShell-sandboxed execution, falling back to direct CLI dispatch.
- **Sandbox-by-default** — All autonomous agent execution runs inside OpenShell. This gives authority leases actual kernel-level enforcement (Landlock, seccomp, network namespace).
- **Inference routing** — Sherpa makes model routing decisions (task-type → model tier → provider), issues `openshell inference set` commands accordingly. The "privacy router" is the enforcement layer, not the decision layer. Replaces custom model routing from `agent-infrastructure`.

## Rationale

Three forces converge:

1. **Market gravity** — OpenAI acquiring OpenClaw signals it's becoming infrastructure, not a niche project. NVIDIA backing NemoClaw with enterprise security means large orgs will standardize on it. Sherpa's clients will be running these platforms. If Sherpa can't govern agents on them, Sherpa is irrelevant.

2. **Build vs. adopt** — The `agent-infrastructure` initiative plans to build custom model routing, local model integration, and execution monitoring. NemoClaw provides all three with security sandboxing that would take significant effort to replicate. The smart move is to adopt NemoClaw's runtime capabilities and focus Sherpa's engineering on the governance layer that neither platform provides.

3. **Separation of concerns** — Sherpa's dispatch system currently mixes governance decisions (what runs, with what constraints) with execution mechanics (how to spawn a process, manage context). Introducing runtime adapters makes this separation explicit and lets both layers evolve independently.

**Why NemoClaw over OpenClaw as primary:** NemoClaw's OpenShell sandboxing and privacy router directly address Sherpa's two biggest runtime gaps — enforcement of authority boundaries and model routing with privacy controls. OpenClaw's security track record (prompt injection leading to data exfiltration) makes it unsuitable as the primary runtime for an enterprise governance framework. OpenClaw remains valuable for its ecosystem (5,700 skills, community) and as a fallback for non-sensitive workloads.

**Why not wait for NemoClaw to mature:** NemoClaw is alpha, but the architectural commitment — designing runtime adapters and separating governance from execution — is valuable regardless of which platform wins. If NemoClaw stalls, the adapter pattern means switching to another runtime is a single implementation, not a rewrite.

## Dependencies

- **`vps-remote-compute`** (hard) — Provides the VPS infrastructure where OpenClaw and NemoClaw are deployed. Phase 1 of this initiative cannot begin until the VPS is provisioned and Docker Compose is operational.
- **Informs `agent-infrastructure`** — Findings from Phase 1 may significantly reduce agent-infrastructure's scope. NemoClaw's model routing and sandbox could replace custom Phases 1-2. Recommend pausing agent-infrastructure Phases 1-2 until this initiative's research completes.
- **Informs `client-deployment-pipeline`** — The runtime adapter pattern and platform deployment configs feed directly into client deployment. A client running NemoClaw gets Sherpa governance on top.
- **Informs `mcp-multi-backend-dispatch`** — Platform backends need to be wirable through MCP task_create/task_dispatch, not just CLI/API backends.
- **Informs `mcp-coordination-layer`** — State authority design should account for platform-hosted agents, not just locally-spawned processes.

## Review Notes

**Key decisions embedded in this proposal:**
- NemoClaw is earmarked as primary runtime — this is a strategic commitment, not just experimentation.
- OpenClaw is experimental/ecosystem access — valuable for skills and community, not for security-critical execution.
- The VPS hosts both platforms simultaneously — single box, Docker Compose isolation.
- The `RuntimeAdapter` abstraction is designed to outlive any specific platform — if something better emerges, one new adapter file is the migration cost.

**Resolved by iteration 1 research:**
- GPU is explicitly optional — OpenShell `--gpu` flag is opt-in. Cloud inference works on CPU-only VPS. NemoClaw bug #208 requires workaround (drive `openshell` directly).
- OpenAI did an acqui-hire, not code acquisition. MIT license preserved, irrevocable. Foundation governance is vapor but the adapter pattern hedges this.
- VPS sizing validated: Hetzner CX33 (8 GB) minimum, CX43 (16 GB) recommended. k3s alone consumes ~1.5 GB at idle.

**Open questions (from iteration 1):**
- Can `acpx` submit tasks from host TO agents inside OpenShell sandboxes? Critical integration path, needs hands-on testing.
- Can one OpenShell gateway manage concurrent sandboxes with different policies? Required for Planner/Worker/Judge dispatch.
- Custom OpenShell sandbox images for non-OpenClaw agents (bare claude, codex). `--from ./dir` path exists but undocumented.
- NVIDIA cloud API rate limits and paid tier availability for sustained use.

**Trade-offs:**
- `structural` risk because this changes the fundamental execution model. Mitigation: existing CLI/API dispatch remains the fallback. Platform backends are additive, not replacing.
- Taking a dependency on alpha software (NemoClaw). Mitigation: the adapter pattern means the investment is in the abstraction, not the specific platform. Phase 1 research validates feasibility before Phase 2 commits to architecture.
- VPS cost may increase from $5/mo baseline to $15-20/mo to accommodate both platforms. Still well within budget for R&D infrastructure.

**Effort:** 5-6 sessions
**Session breakdown:**
- Session 1: Deploy OpenClaw on VPS, map skill system to Sherpa roles, document capabilities
- Session 2: Deploy NemoClaw on VPS, test OpenShell sandbox and privacy router, write comparison matrix
- Session 3: Design RuntimeAdapter interface, extend dispatch-meta and dispatch.ts, write adapter stubs
- Session 4: Wire adapters into resolve-route and worker.sh, behavioral constraint translation
- Session 5: NemoClaw primary runtime configuration, sandbox-by-default, privacy router integration
- Session 6 (if needed): Studio UI for platform health, edge cases, documentation
