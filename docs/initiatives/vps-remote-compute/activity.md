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
