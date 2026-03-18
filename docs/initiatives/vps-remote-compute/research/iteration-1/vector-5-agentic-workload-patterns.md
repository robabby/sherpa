# Vector 5: Agentic Workload Hosting Patterns

**Question:** How are people running AI agent infrastructure on VPS? Docker Compose patterns for LLM inference + worker pools on remote servers?
**Agent dispatched:** 2026-03-16

## Findings

### Ollama vs llama-server vs vLLM for CPU-Only

| Engine | Best For | API | Docker | CPU Tuning |
|--------|----------|-----|--------|------------|
| Ollama | Simplicity, getting started | OpenAI-compatible (port 11434) | Official image | Limited (env vars only) |
| llama-server | CPU performance | OpenAI-compatible (port 8080) | Official image | Excellent (threads, batch, ctx, mlock) |
| vLLM | GPU only | OpenAI-compatible | Official image | Not recommended for CPU |

**Recommendation:** Start with Ollama. Switch to llama-server if CPU performance tuning needed. Same API, same model format (GGUF).

### CPU Inference Performance (7B Q4_K_M)

| VPS Tier | CPU | RAM | Speed | Monthly |
|----------|-----|-----|-------|---------|
| Budget | 2 vCPU | 4 GB | ~1-2 tok/s | ~$5 |
| Mid | 4 vCPU | 8 GB | ~2-4 tok/s | ~$20-40 |
| Dedicated | 8+ cores | 16-32 GB | ~5-10 tok/s | ~$60-100 |

### RAM Requirements (7B Q4_K_M + Services)

| Component | RAM |
|-----------|-----|
| Model weights | ~4.1 GB |
| KV cache (4096 ctx) | ~0.5-1.0 GB |
| OS + Docker | ~0.5-1.0 GB |
| MCP server (Node.js) | ~0.1-0.3 GB |
| **Total minimum** | **~5.2-6.4 GB** |

**4 GB VPS:** Not viable for 7B. Use 3B model instead (Phi-3-mini, Llama 3.2 3B Q4_K_M at ~2 GB).
**8 GB VPS:** Tight but workable with swap. Set `OLLAMA_NUM_PARALLEL=1`.
**16-24 GB VPS:** Comfortable. Can run 7B Q8_0 with headroom.

### LM Studio Headless

LM Studio CAN run headless on Linux as of v0.3.5 (`lms daemon up`). However, for VPS deployment, Ollama or llama-server preferred because:
1. LM Studio is not open-source (licensing unclear for server use)
2. No official Docker image
3. Ollama/llama-server are Docker-first with identical OpenAI-compatible API

**Drop-in replacement:** Change URL from `localhost:1234` to `localhost:11434` (Ollama) or `localhost:8080` (llama-server).

### Self-Hosted PaaS Comparison

| Feature | Dokploy | Coolify | CapRover | Dokku |
|---------|---------|---------|----------|-------|
| Docker Compose | Native | Native | Limited | Limited |
| Idle RAM | ~350 MB | ~500-700 MB | ~300-400 MB | Lightest |
| Multi-service | Excellent | Good | Poor | Poor |
| UI | Modern | Most polished | Dated | CLI only |

**Winner: Dokploy** — native Docker Compose, low overhead (350 MB), built-in monitoring.
**Runner-up: Coolify** — has Ollama one-click template, but 500-700 MB idle overhead.

### Docker Compose Reference Architecture

Production pattern from real deployments:

```yaml
services:
  ollama:
    image: ollama/ollama
    environment:
      - OLLAMA_HOST=0.0.0.0
      - OLLAMA_NUM_PARALLEL=2
      - OLLAMA_KEEP_ALIVE=24h
    volumes:
      - ollama_data:/root/.ollama
    deploy:
      resources:
        limits:
          memory: 6g
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:11434/api/tags"]
      interval: 30s
    networks:
      - internal
    restart: unless-stopped

  mcp-server:
    image: sherpa-mcp:latest
    environment:
      - LM_STUDIO_URL=http://ollama:11434
      - MCP_TRANSPORT=http
      - PORT=3100
      - HOST=0.0.0.0
    depends_on:
      ollama:
        condition: service_healthy
    networks:
      - internal
    restart: unless-stopped

networks:
  internal:
    driver: bridge
```

Key patterns:
- Internal bridge network — only Tailscale sidecars expose to tailnet
- Health checks on every service
- Memory limits on inference container
- `OLLAMA_KEEP_ALIVE=24h` prevents model unloading between requests

### Reference Deployments

- **ClawBot** (github.com/Laso37/clawbot) — Production self-hosted AI on VPS. Traefik + Authelia + Ollama + Next.js. Token optimization with model routing.
- **n8n + MCP + Ollama** — Workflow orchestration with file triggers dispatching to MCP/Ollama.
- **MCP StreamableHTTP in Docker** — Critical: bind to `0.0.0.0` not `localhost` inside containers.

### Open WebUI

Dominant self-hosted AI chat UI. Not needed for Sherpa's dispatch (we have our own routing), but useful as optional debug/monitoring interface. Adds ~300-500 MB RAM overhead.

## Sources

- https://docs.ollama.com/docker — Ollama Docker docs
- https://ramnode.com/guides/series/ai-stack/ollama-cpu-llm — Ollama CPU guide
- https://ghcr.io/ggerganov/llama.cpp — llama.cpp Docker images
- https://lmstudio.ai/docs/developer/core/headless — LM Studio headless docs
- https://massivegrid.com/blog/dokploy-vs-coolify-vs-caprover/ — PaaS comparison
- https://coolify.io/docs/services/ollama — Coolify Ollama template
- https://docs.dokploy.com/docs/core/docker-compose — Dokploy Compose docs
- https://github.com/Laso37/clawbot — ClawBot reference architecture
- https://mcpcat.io/guides/configuring-mcp-transport-docker/ — MCP Docker transport
- https://markaicode.com/ollama-production-api-server/ — Production Ollama Compose
- https://docs.docker.com/engine/containers/resource_constraints/ — Docker memory management

## Implications

The stack is well-trodden. Ollama + Docker Compose + Tailscale is a proven pattern. The critical insight is RAM: a $5/mo Hetzner 4 GB box can only run 3B models. For 7B inference, 8+ GB is needed ($15-40/mo range). The Dokploy PaaS layer is optional but valuable for deployment management on constrained VPS.

## Open Questions

- Is 1-2 tok/s (2 vCPU budget) acceptable for overnight batch dispatch, or do we need faster inference?
- Should we ship a Sherpa-specific Docker image or use generic Ollama + config?
- Is Dokploy worth the 350 MB overhead, or should we just use raw Docker Compose + systemd?
