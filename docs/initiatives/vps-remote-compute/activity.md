---
started: 2026-03-16
worktree: null
---

# VPS Remote Compute — Activity

## 2026-03-16

- Created proposal with two-tier cost model (Sherpa baseline free/near-free, client GPU billable)
- Resolved networking question: Tailscale (free, WireGuard-based, zero-config)
- Completed iteration 1: VPS provider evaluation (5 vectors, 14+ providers evaluated)
- **Primary recommendation:** Hetzner CX23 ($5/mo) or IONOS VPS M ($6/mo) + Tailscale + Ollama
- Oracle Cloud excluded on values grounds (2026-03-16)
- **Client GPU:** RunPod RTX 3090 ($0.22/hr) or AWS/GCP for enterprise
- Spawned follow-on initiative: `client-deployment-pipeline` — repeatable client VPS provisioning and Sherpa Studio deployment
- Completed iteration 2: Market landscape research — how solo consultants, micro-agencies, and freelancers use VPS for AI client work (6 vectors, 30+ sources)
- **Key finding:** n8n + Ollama + Docker Compose on VPS is the canonical stack for AI automation agencies ($5-40/mo infrastructure, $300-8,000/mo client revenue)
- **Key finding:** Self-hosting value prop is compliance/privacy (not cost savings) for consulting. 44% of organizations cite data privacy as top barrier to LLM adoption
- **Key finding:** Agency margins are 73-90% — infrastructure costs are negligible relative to client billing
- **Key finding:** Micro-SaaS founders predominantly use cloud APIs; self-hosting is a consulting/enterprise play
- **Adjustment:** Ollama (not LM Studio) should be the VPS inference engine; LM Studio stays as local dev tool

## 2026-03-17 — Hetzner VPS provisioned

- Provisioned Hetzner CPX21 (4GB RAM, 2 vCPU, 80GB disk) in Hillsboro, OR — `5.78.128.178`
- Attached 10GB EXT4 volume, symlinked to `/mnt/sherpa-data` with standard layout (`data/`, `backups/`, `docker/`)
- Security baseline: UFW (SSH/HTTP/HTTPS only), fail2ban (aggressive SSH), Ed25519 SSH keys
- Installed Node.js 22 LTS + Docker 29, kernel upgraded to 6.8.0-106
- SSH alias configured: `ssh sherpa-hetzner`
- Created `docs/templates/server-provision.md` — repeatable runbook for future VPS provisioning

## 2026-03-18 — Tailscale + OpenClaw deployed

- Installed Tailscale, joined VPS to tailnet as `sherpa-ubuntu-4gb-hil-1`
- Configured Tailscale Serve for auto-TLS on gateway port (wss://...ts.net:18790)
- Deployed OpenClaw gateway via Docker Compose (prebuilt GHCR image — learned: never build from source on 4GB)
- Persistent data on volume at `/mnt/sherpa-data/data/openclaw/`
- Local macOS client configured as remote gateway node
- Updated provision template with Tailscale, OpenClaw, client config, and lessons learned sections
- VPS is fully operational as remote compute + agentic gateway node
