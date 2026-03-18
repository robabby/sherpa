# Iteration 1 — 2026-03-17

## Findings

### Vector 1: NemoClaw Architecture & API
**Question:** How does OpenShell sandbox work? Can an external orchestrator submit tasks?
**Full report:** [iteration-1/vector-1-nemoclaw-architecture.md](iteration-1/vector-1-nemoclaw-architecture.md)

- NemoClaw is NOT a standalone runtime — it's a CLI plugin that configures **OpenShell** (Apache 2.0), the actual sandbox/policy/routing engine
- OpenShell runs a k3s cluster inside a single Docker container with 4 defense layers: Landlock filesystem, namespace network, seccomp process, inference routing
- Policy YAML is per-binary, per-endpoint, per-HTTP-method — network and inference policies are hot-reloadable
- **No REST API for task submission** — CLI-only (`openshell` commands). `acpx` (Agent Client Protocol headless client) is the structured task submission bridge
- The "privacy router" is a credential-isolating proxy, not an intelligent data classifier — Sherpa must make routing decisions externally

**Implications:** Target OpenShell directly, not NemoClaw. Use `acpx` for task submission. Policy YAML maps to behavioral constraints.

### Vector 2: OpenClaw Skill System & Plugin Architecture
**Question:** How are skills defined? Can behavioral constraints be injected externally?
**Full report:** [iteration-1/vector-2-openclaw-skill-system.md](iteration-1/vector-2-openclaw-skill-system.md)

- Skills are markdown files with YAML frontmatter — structurally identical to Sherpa's skill format
- Three injection points for external constraints: `before_prompt_build` hook, sticky-context, workspace file manipulation (`AGENTS.md`/`SOUL.md`)
- External task submission via `POST /hooks/agent` (webhook) or `POST /v1/chat/completions` (OpenAI-compatible)
- ContextEngine plugin API (2026.3.7) provides 7 lifecycle hooks but is single-slot — too heavy for governance injection

**Implications:** Skill translation is feasible. Webhook API provides programmatic dispatch. Constraints are advisory (system prompt), not enforced — OpenShell provides the enforcement layer.

### Vector 3: OpenAI Acquisition & OpenClaw Future
**Question:** Will OpenClaw stay open-source? What are the risks?
**Full report:** [iteration-1/vector-3-openai-acquisition.md](iteration-1/vector-3-openai-acquisition.md)

- Acqui-hire, not code acquisition — Steinberger joined OpenAI, code goes to 501(c)(3) foundation (not yet established)
- MIT license preserved and irrevocable for existing code
- **Foundation governance is vapor** — no board, no bylaws, no trademark clarity, no enforcement mechanisms
- **Security is the bigger risk than licensing:** 20% of ClawHub skills were malicious (AMOS infostealer), CVE-2026-25253 one-click RCE, 42,900 exposed instances
- Forks already exist: ZeroClaw, NanoClaw, PicoClaw

**Implications:** MIT license mitigates proprietary risk. Security posture disqualifies OpenClaw as primary runtime (validates NemoClaw/OpenShell choice). Adapter pattern hedges against all outcomes.

### Vector 4: NemoClaw CPU-Only Deployment
**Question:** Can it run on a budget VPS without GPU?
**Full report:** [iteration-1/vector-4-nemoclaw-cpu-deployment.md](iteration-1/vector-4-nemoclaw-cpu-deployment.md)

- **GPU is explicitly optional.** OpenShell `--gpu` flag is opt-in. Cloud inference profiles work without GPU.
- NemoClaw has a bug (#208) forcing GPU detection — workaround: drive `openshell` CLI directly, bypassing `nemoclaw onboard`
- Minimum: 4 vCPU, 8 GB RAM, 20 GB disk. Recommended: 16 GB RAM. k3s alone consumes ~1.5 GB at idle.
- **NemoClaw does NOT use Docker Compose** — it manages a k3s cluster inside a single Docker container
- NVIDIA cloud API (free tier) provides Nemotron 3 Super 120B with 131K context

**Implications:** Hetzner CX33 (8 GB, ~5.49 EUR/mo) is minimum viable. CX43 (16 GB, ~10-12 EUR/mo) recommended for running both platforms simultaneously. OpenClaw standalone fits on CX23 (4 GB, ~3.49 EUR/mo).

### Vector 5: Governance-Over-Runtime Patterns
**Question:** Has anyone else solved this separation?
**Full report:** [iteration-1/vector-5-governance-runtime-patterns.md](iteration-1/vector-5-governance-runtime-patterns.md)

- Three academic frameworks validate the pattern: Auton (Blueprint/Engine), MI9 (framework-specific adapters + standard telemetry), GaaS (external governance proxy)
- **No production framework cleanly separates governance from runtime** — CrewAI, LangGraph, AutoGen, OpenAI Agents SDK all bundle them
- Amazon Bedrock AgentCore's gateway pattern is closest in production: policies execute outside the LLM reasoning loop
- A2A protocol's Agent Card pattern enables governed-agent discovery across systems
- Linux Foundation AAIF consolidating MCP + A2A + AG-UI into standard protocol stack

**Implications:** Sherpa's position is validated and unoccupied. Adopt Auton's Blueprint/Engine pattern for RuntimeAdapter. Target A2A Agent Cards for discoverability.

## Synthesis

Three insights no single vector produced alone:

**1. The architecture is OpenShell + acpx, not NemoClaw + OpenClaw.** NemoClaw is just an installer. OpenClaw is just one agent. The durable layers are OpenShell (sandbox/policy/routing — Apache 2.0, NVIDIA-backed) and `acpx` (structured task submission — works with claude, codex, opencode, gemini, openclaw). Sherpa's RuntimeAdapter should target these two layers. This is more powerful than the proposal assumed: it means Sherpa can sandbox ANY agent backend, not just OpenClaw.

**2. Two-layer constraint enforcement: advisory + deterministic.** OpenClaw's constraint injection (system prompt, skills, sticky-context) is advisory — the agent can ignore it. OpenShell's policy enforcement (Landlock, seccomp, network namespace) is deterministic — the kernel blocks it. Sherpa's behavioral roles translate to BOTH layers: behavioral dispositions become OpenClaw skills (advisory), authority leases become OpenShell policies (enforced). This is exactly the enforcement gap Sherpa has today.

**3. The governance-as-a-service pattern is Sherpa's market position.** The GaaS paper describes an external proxy with declarative policies governing black-box agents. This is Sherpa. No production framework has built it. The combination of filesystem-based governance + runtime adapter + A2A Agent Cards positions Sherpa as the governance layer for the emerging agentic protocol stack. This is not just an infrastructure initiative — it's a positioning decision.

## Proposals Generated

Updated `proposal.md` with architectural corrections:
- Target OpenShell + acpx, not NemoClaw + OpenClaw as the integration layers
- Two-layer constraint model: advisory (OpenClaw skills) + enforced (OpenShell policies)
- VPS sizing validated: CX33 minimum, CX43 recommended

## Open Questions for Next Iteration

1. **acpx outside-sandbox submission** — Can `acpx` run from the host to submit tasks TO agents inside OpenShell sandboxes? This is the critical integration path. Needs hands-on testing.
2. **Multi-sandbox orchestration** — OpenShell is "single-player mode" today. Can one gateway manage concurrent sandboxes with different policies for Planner/Worker/Judge? Needs testing.
3. **OpenShell custom sandbox images** — Can we create sandbox images for non-OpenClaw agents (bare `claude`, `codex`)? The `--from ./dir` path exists but is undocumented.
4. **NVIDIA cloud API limits** — Rate limits, token quotas, and paid tier for the free Nemotron inference. Critical for sustained experimentation.
5. **A2A Agent Card integration** — How would Sherpa-governed agents publish Agent Cards? What's the minimal A2A implementation for discoverability?
