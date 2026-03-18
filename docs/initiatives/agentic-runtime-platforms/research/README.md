# Agentic Runtime Platforms — Research

## Current State

**Iteration 1 complete** (2026-03-17): Landscape survey of OpenClaw, NemoClaw/OpenShell, governance-runtime separation patterns, deployment requirements, and acquisition implications.

**Key finding:** The durable integration layers are **OpenShell** (NVIDIA's sandbox/policy engine, Apache 2.0) and **acpx** (Agent Client Protocol headless client). NemoClaw is just an installer; OpenClaw is just one agent. Sherpa's RuntimeAdapter should target OpenShell + acpx, enabling sandboxed governance for ANY agent backend.

## Open Questions

1. **acpx outside-sandbox task submission** — Can `acpx` run from the host to dispatch tasks into OpenShell sandboxes? Critical integration path.
2. **Multi-sandbox orchestration** — Can one OpenShell gateway manage concurrent sandboxes with different policies? Required for Planner/Worker/Judge.
3. **Custom sandbox images** — Non-OpenClaw agents (bare claude, codex) in OpenShell. `--from ./dir` path exists but undocumented.
4. **NVIDIA cloud inference limits** — Free tier rate limits, token quotas, paid tier availability.
5. **A2A Agent Card integration** — Minimal implementation for Sherpa-governed agent discoverability.

## Iterations

- [Iteration 1](iteration-1.md) — Landscape survey: 5 vectors covering NemoClaw architecture, OpenClaw skills, OpenAI acquisition, CPU deployment, governance patterns
