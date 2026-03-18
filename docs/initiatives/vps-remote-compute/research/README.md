# VPS Remote Compute — Research

## Iteration 1 (2026-03-16): Provider Evaluation

Surveyed the full VPS landscape across 5 vectors. Key finding: Hetzner CX23 at ~$5/mo is the best value for baseline infrastructure (dispatch workers + MCP server + 3B inference). No viable always-free tier exists. Tailscale confirmed for networking. GPU on-demand (RunPod, AWS, GCP) is affordable for client billing.

## Open Questions

1. **Exact Docker Compose** — Ollama + Sherpa MCP + Tailscale sidecars for the target stack
2. **Dispatch adaptation** — Minimal changes to worker.sh and resolve-route.mjs for remote inference
3. **Monitoring** — VPS health surfacing in Studio UI
4. **Model selection** — Best 7B model for Sherpa's dispatch task types
5. **RAM tier decision** — 4 GB (3B models) vs 8 GB (7B models) for baseline
