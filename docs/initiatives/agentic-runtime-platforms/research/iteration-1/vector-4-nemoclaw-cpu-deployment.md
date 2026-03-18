# Vector 4: NemoClaw CPU-Only Deployment

**Question:** Can NemoClaw's agent layer and OpenShell sandbox run on CPU-only hardware? What is the minimum VPS deployment when using cloud API routing instead of local inference? VPS sizing requirements.
**Agent dispatched:** 2026-03-17

## Findings

### GPU Is Optional — OpenShell Explicitly Documents This

- **The `--gpu` flag is opt-in** when creating sandboxes: `openshell sandbox create --gpu --from [image]`. Without it, sandboxes run CPU-only. GPU passthrough requires NVIDIA drivers and NVIDIA Container Toolkit on the host. ([GitHub - NVIDIA/OpenShell](https://github.com/NVIDIA/OpenShell))

- **NemoClaw has a bug (#208) that forces `--gpu` when `nvidia-smi` is detected.** The workaround — the exact pattern for CPU-only VPS — bypasses `nemoclaw onboard` and drives `openshell` directly:
  ```bash
  openshell gateway start --name nemoclaw          # no --gpu
  openshell provider create --name nvidia-nim --type nvidia \
    --credential NVIDIA_API_KEY=nvapi-xxx
  openshell inference set --provider nvidia-nim \
    --model nvidia/nemotron-3-super-120b-a12b
  openshell sandbox create --name my-sandbox --from openclaw  # no --gpu
  ```
  ([NemoClaw Issue #208](https://github.com/NVIDIA/NemoClaw/issues/208))

- **The hardware-agnostic claim is real at the orchestration layer.** "NemoClaw runs on any chip, not just NVIDIA GPUs." The separation: OpenShell handles sandboxing/policy/routing (CPU), Nemotron models handle inference (GPU or cloud). ([solvea.cx](https://solvea.cx/glossary/what-is-nemoclaw))

### Three Inference Profiles

1. **`default` (NVIDIA Cloud)** — Routes to `integrate.api.nvidia.com/v1`, uses Nemotron 3 Super 120B. Requires free NVIDIA API key. **No GPU needed on host.**
2. **`nim` (Local NIM)** — Routes to NIM container. Requires GPU.
3. **`vllm` (Local vLLM)** — Routes to `host.openshell.internal:8000/v1`. Requires GPU.

Four Nemotron models available via cloud (no local GPU):

| Model | Context | Max Output |
|-------|---------|------------|
| nemotron-3-super-120b-a12b | 131K | 8,192 |
| llama-3.1-nemotron-ultra-253b-v1 | 131K | 4,096 |
| llama-3.3-nemotron-super-49b-v1.5 | 131K | 4,096 |
| nemotron-3-nano-30b-a3b | 131K | 4,096 |

### Documented System Requirements

| Resource | Minimum | Recommended |
|----------|---------|-------------|
| CPU | 4 vCPU | 4+ vCPU |
| RAM | 8 GB | 16 GB |
| Disk | 20 GB free | 40 GB free |

**Software:** Ubuntu 22.04+, Node.js 20+, npm 10+, Docker running, OpenShell installed.

### Memory Breakdown

- **Sandbox image is ~2.4 GB compressed.** During image operations, Docker + k3s + OpenShell buffer decompressed layers in memory. Systems with <8 GB RAM can OOM during this phase. 8 GB swap is the documented workaround.
- **k3s (inside OpenShell's Docker container) consumes ~1.4-1.6 GB RAM at idle** based on official k3s resource profiling.
- **Total steady-state estimate: ~3-3.5 GB** (k3s 1.5GB + Docker 0.3GB + OpenClaw gateway 0.75GB + OS 0.5GB), leaving headroom on 8 GB.

### Docker Compose: Different Model Than Expected

- **NemoClaw does NOT provide `docker-compose.yml`.** It uses its own CLI managing a k3s cluster inside a single Docker container. Architecturally different from traditional multi-service Compose.
- **OpenClaw standalone DOES provide `docker-compose.yml`** with two services: `openclaw-gateway` (Node.js, port 18789/18790) and `openclaw-cli`. Much simpler.

## Sources

- [GitHub - NVIDIA/OpenShell](https://github.com/NVIDIA/OpenShell)
- [NemoClaw Issue #208](https://github.com/NVIDIA/NemoClaw/issues/208)
- [solvea.cx NemoClaw explainer](https://solvea.cx/glossary/what-is-nemoclaw)
- [NemoClaw Inference Profiles](https://docs.nvidia.com/nemoclaw/latest/reference/inference-profiles.html)
- [NemoClaw Quickstart](https://docs.nvidia.com/nemoclaw/latest/get-started/quickstart.html)
- [NemoClaw GitHub](https://github.com/NVIDIA/NemoClaw)
- [k3s Resource Profiling](https://docs.k3s.io/reference/resource-profiling)
- [OpenClaw Docker docs](https://docs.openclaw.ai/install/docker)

## Implications

### VPS Sizing Recommendations

**Minimum viable: Hetzner CX33** (4 vCPU, 8 GB RAM, 80 GB SSD) at ~5.49 EUR/month
- Matches NemoClaw's documented minimum
- Risk: OOM-prone during sandbox image operations. Configure 8 GB swap.
- Steady-state should be fine; initial setup is the danger zone.

**Recommended: Hetzner CX43** (8 vCPU, 16 GB RAM, 160 GB SSD) at ~10-12 EUR/month
- Comfortable headroom for both platforms simultaneously.

**Lighter alternative: OpenClaw standalone** (skip NemoClaw/OpenShell)
- Works on CX23 (2 vCPU, 4 GB RAM, 40 GB SSD) at ~3.49 EUR/month
- Skips k3s entirely (~1.5 GB savings). Loses sandbox, privacy router, policy engine.

**GPU add-on path:** NVIDIA cloud APIs for inference (free tier), RunPod on-demand when local inference is needed.

## Open Questions

1. Can OpenShell's inference provider point to an arbitrary remote URL (e.g., RunPod vLLM endpoint)?
2. NVIDIA cloud API rate limits and cost on the free tier?
3. Does NemoClaw work on ARM64 (Hetzner CAX series, cheaper)?
4. Will `nemoclaw onboard` gain a `--no-gpu` flag? (Issue #208)
5. Is `NEMOCLAW_EXPERIMENTAL=1` required for cloud-only inference?
6. Can the Privacy Router route to Anthropic/OpenAI directly, or only NVIDIA providers?
