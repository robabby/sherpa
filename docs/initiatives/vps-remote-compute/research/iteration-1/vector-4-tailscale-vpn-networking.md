# Vector 4: Tailscale + VPS Integration

**Question:** How well does Tailscale work with VPS providers? What are the gotchas with Docker containers behind Tailscale?
**Agent dispatched:** 2026-03-16

## Findings

### Tailscale Free Tier

Personal plan: 3 users, 100 devices, free forever. Includes MagicDNS, ACL tags, Serve, subnet routing. The only missing feature (Funnel) is for public exposure — which we explicitly don't want. The free tier is more than sufficient.

### Docker Integration Pattern: Sidecar

Best pattern is one `tailscale/tailscale` container per service, connected via `network_mode: service:<sidecar>`:

```yaml
services:
  ts-inference:
    image: tailscale/tailscale:latest
    hostname: inference
    environment:
      - TS_AUTHKEY=tskey-auth-xxx
      - TS_STATE_DIR=/var/lib/tailscale
      - TS_EXTRA_ARGS=--advertise-tags=tag:container
    volumes:
      - ts-inference-state:/var/lib/tailscale
    cap_add:
      - NET_ADMIN
      - NET_RAW
    restart: unless-stopped

  ollama:
    image: ollama/ollama
    network_mode: service:ts-inference
    depends_on:
      - ts-inference
    volumes:
      - ollama_data:/root/.ollama
    restart: unless-stopped
```

Each service gets its own tailnet hostname and ACL rules. ~20MB RAM per sidecar. Zero ports published to the host.

### MagicDNS

Name sidecars `inference` and `mcp-server`, and from your Mac: `curl http://inference:1234/v1/models`. DNS resolution is local (no external query), sub-millisecond.

### Provider-Specific Notes

**Hetzner:** Simple. One firewall rule (UDP 41641) and done. No NAT issues.

### Performance

Tailscale adds 1-3ms on direct connections. LLM inference takes 2-30 seconds per request. Geographic RTT (10-160ms depending on region) dwarfs VPN overhead. Direct connections virtually guaranteed on a VPS with UDP 41641 open.

### Security

WireGuard end-to-end encryption. Private keys never leave the device. DERP relays cannot decrypt traffic. No data-plane vulnerabilities reported.

### Alternatives Ranked

1. **Tailscale** — Best overall. Free, zero-config, MagicDNS, mature.
2. **Netbird** — Best if self-hosted control plane needed. Open source.
3. **Plain WireGuard** — Escape hatch. Manual config, no DNS.
4. **ZeroTier** — Worse free tier (25 devices vs 100).
5. **Headscale** — Open-source Tailscale control server. Operational overhead.
6. **Cloudflare Tunnel** — Eliminated. Decrypts traffic at edge — unacceptable for inference.

### Critical Gotchas

- Persist `/var/lib/tailscale` as a volume or containers get new identities on restart
- Tag containers (`--advertise-tags=tag:container`) to disable key expiry
- `TS_SERVE_CONFIG` must be mounted as a directory, not a file
- One service per port per sidecar (use separate sidecars for inference and MCP)

## Sources

- https://tailscale.com/pricing — Free tier details
- https://tailscale.com/kb/1282/docker — Official Docker guide
- https://tailscale.com/kb/1019/subnets — Subnet routing docs
- https://tailscale.com/blog/docker-tailscale-guide — Docker best practices
- https://netbird.io/ — Netbird alternative
- https://zerotier.com/pricing — ZeroTier pricing
- https://github.com/juanfont/headscale — Headscale project

## Implications

Tailscale is confirmed as the right choice. Free tier is generous (100 devices), Docker sidecar pattern is well-documented, MagicDNS provides exactly the service discovery we need, and performance overhead is negligible for inference workloads. Hetzner is the simplest provider to set up from a networking perspective — one firewall rule and done.

## Open Questions

- Should we use one sidecar per service or a subnet router approach for the whole VPS?
- How do we handle Tailscale auth key rotation in a Docker Compose environment?
- Can ACL tags restrict which devices can reach the inference endpoint vs the MCP server?
