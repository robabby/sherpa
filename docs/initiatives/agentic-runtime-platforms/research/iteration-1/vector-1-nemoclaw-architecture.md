# Vector 1: NemoClaw Architecture & API

**Question:** How does NemoClaw's OpenShell sandbox work? What is the programmatic API for submitting tasks, configuring sandbox policies, and routing models via the privacy router? Can an external orchestrator send structured tasks to NemoClaw?
**Agent dispatched:** 2026-03-17

## Findings

### What NemoClaw Actually Is

- **NemoClaw is NOT a standalone runtime — it's a TypeScript CLI plugin + Python blueprint** that installs and configures NVIDIA OpenShell underneath OpenClaw. One-command install: `curl -fsSL https://nvidia.com/nemoclaw.sh | bash`. ([NVIDIA Newsroom](https://nvidianews.nvidia.com/news/nvidia-announces-nemoclaw), [GitHub - NVIDIA/NemoClaw](https://github.com/NVIDIA/NemoClaw))
- **OpenShell is the actual runtime layer.** Open-source (Apache 2.0), it provides the sandbox, policy engine, gateway, and privacy router. NemoClaw is the opinionated installer that configures OpenShell for OpenClaw specifically. ([GitHub - NVIDIA/OpenShell](https://github.com/NVIDIA/OpenShell))
- **Status: Alpha, single-player mode.** NVIDIA's own README says "proof-of-life: one developer, one environment, one gateway." APIs are explicitly marked as unstable and subject to change.

### OpenShell Sandbox Architecture

- **K3s Kubernetes cluster inside a single Docker container** — no separate K8s install needed. The gateway is the control-plane API managing sandbox lifecycle and auth boundaries.
- **Four defense-in-depth policy layers:**
  - **Filesystem**: Landlock LSM — restricts read/write to `/sandbox` and `/tmp`; system paths read-only. **Locked at creation.**
  - **Network**: Namespace isolation + proxy interception — deny-by-default egress, allowlist in YAML. **Hot-reloadable at runtime.**
  - **Process**: seccomp — blocks privilege escalation and dangerous syscalls. **Locked at creation.**
  - **Inference**: Routes model API calls through gateway to controlled backends. **Hot-reloadable at runtime.**

- **Policy YAML format** — per-binary, per-endpoint, per-HTTP-method:
  - Example: `/usr/local/bin/claude` allowed to reach `api.anthropic.com:443`, `statsig.anthropic.com:443`
  - `/usr/bin/git` restricted to GET/POST only for Smart HTTP operations
  - Unknown hosts are blocked and surfaced in the TUI (`openshell term`) for real-time operator approval; approved endpoints persist only for the running session, NOT written back to baseline policy

### Privacy Router / Inference Routing

- **All inference calls from the sandbox go to `https://inference.local`** (a virtual endpoint). OpenShell intercepts them at the gateway, strips the agent's credentials, injects the provider's credentials, and forwards to the configured backend. The agent never sees real API keys.
- **Provider system** supports: NVIDIA Cloud (default), Local Ollama/vLLM/NIM/SGLang, Cloud partners (Baseten, CoreWeave, DeepInfra, DigitalOcean, Together AI)
- **Runtime model switching** without sandbox restart: `openshell inference set --provider ollama --model qwen3.5:0.8b`
- **CRITICAL: The "privacy router" is NOT a smart router.** It does not make automatic local-vs-cloud decisions based on data sensitivity. It is an infrastructure-level proxy that routes ALL inference to whichever single provider is currently configured. The operator (or an external system like Sherpa) must decide when to switch.

### Programmatic API for Task Submission

- **OpenShell exposes NO documented REST API for external task submission.** The gateway uses mTLS, Edge JWT, or plaintext auth, but the documented interface is CLI-only.
- **The critical bridge is `acpx`** (Agent Client Protocol headless client):
  ```bash
  acpx claude "refactor auth middleware"
  acpx codex --no-wait "draft test migration plan"   # fire-and-forget
  acpx --format json exec "review this PR"            # structured JSON output
  ```
  Supports: persistent sessions, named parallel workstreams, prompt queueing, NDJSON event streaming, configurable permissions, timeout control. Built-in adapters for claude, codex, openclaw, opencode, gemini, cursor, copilot, and custom ACP servers.
- **`acpx` is separate from NemoClaw/OpenShell** but can operate inside an OpenShell sandbox.

### Blueprint System

- **Blueprints are versioned Python artifacts** with a four-stage lifecycle: Resolve → Verify → Plan → Apply.
- Each blueprint contains `blueprint.yaml` (version + profiles) and `openclaw-sandbox.yaml` (baseline policy).

## Sources

- [NVIDIA Newsroom](https://nvidianews.nvidia.com/news/nvidia-announces-nemoclaw)
- [GitHub - NVIDIA/NemoClaw](https://github.com/NVIDIA/NemoClaw)
- [GitHub - NVIDIA/OpenShell](https://github.com/NVIDIA/OpenShell)
- [OpenShell Architecture Docs](https://docs.nvidia.com/openshell/latest/about/architecture.html)
- [OpenShell-Community sandboxes/openclaw](https://github.com/NVIDIA/OpenShell-Community/tree/main/sandboxes/openclaw)
- [NemoClaw Network Policy Docs](https://docs.nvidia.com/nemoclaw/latest/network-policy/approve-network-requests.html)
- [NemoClaw Inference Profiles](https://docs.nvidia.com/nemoclaw/latest/reference/inference-profiles.html)
- [OpenShell Local Inference Tutorial](https://docs.nvidia.com/openshell/latest/tutorials/local-inference-ollama.html)
- [NemoClaw Quickstart](https://docs.nvidia.com/nemoclaw/latest/get-started/quickstart.html)
- [NemoClaw Architecture](https://docs.nvidia.com/nemoclaw/latest/reference/architecture.html)
- [GitHub - openclaw/acpx](https://github.com/openclaw/acpx)

## Implications

1. **Target OpenShell, not NemoClaw.** NemoClaw is OpenClaw-specific. Sherpa should target OpenShell directly for sandbox creation, policy management, and inference routing.
2. **CLI wrapping is required (for now).** No REST API means the adapter shells out to `openshell` CLI commands. Watch for a gateway REST API.
3. **`acpx` is the task submission layer.** Maps cleanly to Sherpa's dispatch model — NDJSON output → task logging, `--no-wait` → fire-and-forget dispatch.
4. **Policy YAML maps to behavioral constraints.** Per-binary, per-endpoint granularity is sufficient. Hot-reloadable network + inference policies mean constraints can be adjusted during execution.
5. **The "privacy router" is simpler than marketed.** Sherpa would need to make its own routing decisions and issue `openshell inference set` commands accordingly.

## Open Questions

1. Will OpenShell expose a REST/gRPC gateway API?
2. Can `acpx` run from outside the sandbox to submit tasks TO agents inside?
3. How do multi-sandbox topologies work for Planner/Worker/Judge?
4. Blueprint customization for non-OpenClaw agents (claude, codex, opencode)?
5. How does policy YAML interact with agent-level permissions (`acpx --approve-all`)?
6. Can different sandboxes use different inference providers simultaneously?
7. What is the latency overhead of the OpenShell gateway proxy?
