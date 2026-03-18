---
started: 2026-03-17
worktree: null
---

# Agentic Runtime Platforms — Activity

## 2026-03-17 — Research iteration 1 complete

- Initiative approved and bootstrapped
- 5 research vectors dispatched: NemoClaw architecture, OpenClaw skills, OpenAI acquisition, CPU deployment, governance patterns
- **Key architectural correction:** NemoClaw is just an installer. The durable layers are OpenShell (sandbox/policy, Apache 2.0) and acpx (task submission). Proposal updated to target these directly.
- **Two-layer constraint model discovered:** advisory (OpenClaw skills/system prompt) + enforced (OpenShell Landlock/seccomp/network policies). Maps perfectly to Sherpa's behavioral roles + authority leases.
- **VPS sizing validated:** Hetzner CX33 (8GB) minimum, CX43 (16GB) recommended. GPU optional — NVIDIA cloud inference free tier available.
- **Governance-as-a-Service position validated:** Academic research (Auton, MI9, GaaS papers) confirms the pattern. No production framework occupies it. Sherpa is first mover.
- Proposal updated with all findings. Next: hands-on deployment testing (Phase 1).

## 2026-03-18 — OpenClaw dispatch backend integrated

- NemoClaw deferred (requires 8GB+ RAM, exceeds current VPS spec). OpenClaw deployed standalone.
- OpenClaw gateway running on Hetzner VPS via Docker Compose, accessible over Tailscale
- **Built `scripts/backends/openclaw.mjs`** — WebSocket protocol v3 with full device identity auth:
  - Ed25519 key pair generated and persisted at `.openclaw-dispatch/device.json`
  - Challenge-response signing using `buildDeviceAuthPayloadV3` format
  - Device token cached after first pairing for subsequent connections
  - Streamed response collection via `agent` event deltas, turn detection via `lifecycle.end`
- Added `'openclaw'` to `Backend` type in `dispatch-meta.ts`, MCP enum in `server.ts`
- Explicit-only routing: tasks must set `backend: openclaw` (no default task-type routing yet)
- Test task dispatched and completed successfully — 30.6s round-trip over WSS
- Updated execution pipeline architecture doc, ADR 0004, CLAUDE.md
- **First successful dispatch from Sherpa Studio to a remote autonomous agent**
- Status returned to `approved` — OpenShell/NemoClaw phases blocked on VPS upgrade to 8GB+. OpenClaw backend integration complete; remaining phases resume when resource upgrade is justified by client engagement.
