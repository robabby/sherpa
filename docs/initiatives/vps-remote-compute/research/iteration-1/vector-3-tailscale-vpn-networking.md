# Tailscale + VPS Networking for Docker Services

Research vector for the vps-remote-compute initiative. Focuses on securing Docker Compose services (LLM inference API, MCP server) on a VPS with zero public port exposure via Tailscale mesh VPN.

---

## 1. Tailscale Free Tier

**Plan: Personal (free forever)**

| Dimension | Limit |
|-----------|-------|
| Users | 3 |
| Devices | 100 (pooled across account) |
| MagicDNS | Yes |
| ACL tags | Yes (basic ACLs; custom groups require Premium) |
| Subnet routers | Yes |
| HTTPS certificates | Yes |
| Tailscale Serve | Yes |
| Tailscale Funnel | No (Premium+) |
| SSO/OIDC | No (Starter+) |
| Session recording | No (Enterprise) |
| Key expiry override | Yes (via tags) |

**Verdict:** The free tier is more than sufficient for a solo developer + VPS setup. 3 users / 100 devices covers a Mac, a VPS, and plenty of headroom. Tags, ACLs, MagicDNS, Serve, and subnet routing are all included. The only notable exclusion is Funnel (exposing services to the public internet), which is irrelevant for our use case since we want zero public exposure.

**Source:** [Tailscale Pricing](https://tailscale.com/pricing), [Pricing FAQ](https://tailscale.com/kb/1251/pricing-faq), [Free Plans](https://tailscale.com/kb/1154/free-plans-discounts)

---

## 2. Tailscale + Docker on VPS: Patterns

### The Three Approaches

**A. Host-level Tailscale install** -- Install Tailscale directly on the VPS host OS. Docker containers bind to `127.0.0.1` or the Tailscale IP. Simplest but gives no per-container identity or ACLs.

**B. Sidecar container (recommended)** -- One `tailscale/tailscale` container per service. App containers use `network_mode: service:<tailscale-sidecar>` to share the sidecar's network namespace. Each service gets its own tailnet identity, hostname, and ACL rules. Resource cost: ~20MB RAM per sidecar.

**C. Subnet router** -- Single Tailscale container advertises the Docker bridge subnet to the tailnet. All containers reachable by their Docker IPs. Simpler but no per-service DNS names or ACLs.

### Recommended: Sidecar Pattern

The sidecar pattern is the best fit for our use case because:
- Each service (LLM inference, MCP server) gets a memorable hostname like `inference.tailnet.ts.net` and `mcp.tailnet.ts.net`
- ACL rules can restrict which devices reach which services
- No ports published to the host at all -- zero public exposure
- Services communicate via `127.0.0.1` within the shared network namespace

### Docker Compose Template

```yaml
services:
  # Tailscale sidecar for inference server
  ts-inference:
    image: tailscale/tailscale:latest
    hostname: inference
    environment:
      - TS_AUTHKEY=tskey-auth-xxxxx  # or use OAuth client secret
      - TS_EXTRA_ARGS=--advertise-tags=tag:container
      - TS_STATE_DIR=/var/lib/tailscale
      - TS_USERSPACE=false
    volumes:
      - ts-inference-state:/var/lib/tailscale
      - /dev/net/tun:/dev/net/tun
    cap_add:
      - net_admin
    restart: unless-stopped

  # LM Studio-compatible inference server
  inference:
    image: <inference-server-image>
    network_mode: service:ts-inference
    depends_on:
      - ts-inference
    restart: unless-stopped
    # No ports: section needed -- accessed via Tailscale only

  # Tailscale sidecar for MCP server
  ts-mcp:
    image: tailscale/tailscale:latest
    hostname: mcp-server
    environment:
      - TS_AUTHKEY=tskey-auth-xxxxx
      - TS_EXTRA_ARGS=--advertise-tags=tag:container
      - TS_STATE_DIR=/var/lib/tailscale
      - TS_USERSPACE=false
    volumes:
      - ts-mcp-state:/var/lib/tailscale
      - /dev/net/tun:/dev/net/tun
    cap_add:
      - net_admin
    restart: unless-stopped

  # MCP server
  mcp:
    image: <mcp-server-image>
    network_mode: service:ts-mcp
    depends_on:
      - ts-mcp
    restart: unless-stopped

volumes:
  ts-inference-state:
  ts-mcp-state:
```

### Critical Gotchas

1. **State persistence is mandatory.** Mount `/var/lib/tailscale` as a volume. Without it, the container gets a new identity on every restart, consuming auth keys and creating orphaned nodes.

2. **One service per port per sidecar.** Since `network_mode: service:` merges namespaces, two containers on the same sidecar cannot both listen on port 8080. Use separate sidecars for separate services.

3. **`/dev/net/tun` + `net_admin` required** for kernel-mode networking (`TS_USERSPACE=false`). Kernel mode has better performance. If the VPS doesn't support `/dev/net/tun` (rare), fall back to `TS_USERSPACE=true`.

4. **Auth key lifecycle.** Auth keys expire after 90 days, but this only prevents *new* nodes from joining. Existing nodes continue to work. Tagged nodes (`--advertise-tags=tag:container`) have key expiry automatically disabled. Once a container has joined the tailnet and state is persisted, the `TS_AUTHKEY` env var can be removed entirely.

5. **TS_SERVE_CONFIG must be a directory mount**, not a file mount, for `fsnotify` to detect config changes.

6. **`TS_HOSTNAME` vs `hostname:`** -- Either sets the MagicDNS name. `TS_HOSTNAME` env var takes precedence. The compose `hostname:` field works when `TS_HOSTNAME` is not set.

**Source:** [Tailscale Docker Guide](https://tailscale.com/blog/docker-tailscale-guide), [Docker Docs](https://tailscale.com/kb/1282/docker), [ScaleTail sidecar configs](https://github.com/tailscale-dev/ScaleTail), [Docker Compose LLM example](https://gist.github.com/logikal/02b34d1a106ee20c6dfad3e25bc0eef1)

---

## 3. ~~Tailscale + Oracle Cloud (OCI)~~ — EXCLUDED

Oracle Cloud has been excluded from all Sherpa recommendations on values grounds. Section removed.

---

## 4. Tailscale + Hetzner

Hetzner is the simpler provider from a networking standpoint.

### Setup Steps

1. **Hetzner Cloud Firewall:** Add inbound rule for UDP port 41641. Optionally add UDP 3478 for direct VM-to-VM connections within Hetzner.
2. **SSH lockdown:** Establish SSH session via Tailscale IP, then remove SSH and ICMP rules from the Hetzner Cloud Console firewall.
3. **That's it.** Hetzner's cloud firewall is the only layer — no double-firewall complexity.

### Hetzner-Specific Notes

- **No iptables surprise.** Hetzner's default images don't ship with restrictive iptables rules. The cloud firewall is the primary gate.
- **DNS resolution.** No special split-DNS configuration needed. MagicDNS works out of the box.
- **Direct connections.** Hetzner's networking is straightforward NAT. Tailscale establishes direct connections reliably (UDP 41641).
- **Recent DNS change (July 2025).** Tailscale's control plane (`login.tailscale.com`, `controlplane.tailscale.com`) now resolves to static IP ranges. Tailscale recommends firewall rules use domain names, not hardcoded IPs.

**Source:** [Tailscale + Hetzner](https://tailscale.com/kb/1150/cloud-hetzner), [Hetzner + Tailscale blog](https://onatm.dev/2026/01/28/private-networking-on-hetzner-cloud-with-tailscale/)

---

## 5. Alternatives Comparison

### Decision Matrix

| Feature | Tailscale (free) | ZeroTier (free) | Netbird (free/self-hosted) | Headscale (self-hosted) | Plain WireGuard | Cloudflare Tunnel (free) |
|---------|:-:|:-:|:-:|:-:|:-:|:-:|
| **Free devices** | 100 | 10 | 100 (cloud) / unlimited (self-hosted) | Unlimited | Unlimited | Unlimited |
| **Free users** | 3 | 1 | 5 (cloud) / unlimited (self-hosted) | Unlimited | N/A | N/A |
| **Protocol** | WireGuard | Custom | WireGuard | WireGuard | WireGuard | HTTPS reverse proxy |
| **Setup time** | ~2 min/device | ~5 min/device | ~5 min (cloud), ~30 min (self-hosted) | ~1 hour | ~15-30 min/device | ~10 min |
| **Docker sidecar** | First-class | Supported | Supported | Uses Tailscale clients | Manual | Supported (cloudflared) |
| **MagicDNS** | Yes | No (manual) | Yes | Yes | No | Yes (public domains) |
| **ACLs** | Yes (basic on free) | Yes | Yes (fine-grained) | Yes | Manual (iptables) | Yes |
| **NAT traversal** | Automatic (DERP relays) | Automatic (root servers) | Automatic | Automatic | Manual (STUN/port fwd) | N/A (outbound tunnel) |
| **Key management** | Automatic rotation | Manual or auto | Automatic | Manual or auto | Fully manual | N/A (token-based) |
| **Open source** | Client only | Client + controller | Fully open source | Fully open source | Fully open source | Client only |
| **Self-hostable control** | No (Headscale) | Partially | Yes | Yes (it IS self-hosted) | N/A | No |
| **End-to-end encryption** | Yes | Yes | Yes | Yes | Yes | **No** (CF decrypts) |
| **Latency overhead** | ~1-3ms direct | ~1-5ms | ~1-3ms | Same as Tailscale | ~1ms (baseline) | Variable (proxy hop) |

### Analysis

**Tailscale** is the right choice for this use case. Here's why:

- **ZeroTier** -- Only 10 free devices (vs 100). Custom protocol instead of WireGuard. No built-in DNS. Adequate but Tailscale is better in every dimension that matters.

- **Netbird** -- Compelling if you want full self-hosting. Fully open source, including the control plane. But adds operational overhead (you're running the coordination server too). The cloud free tier (5 users, 100 devices) is comparable to Tailscale. Best alternative if Tailscale changes their free tier.

- **Headscale** -- Open-source Tailscale coordination server. Uses official Tailscale clients. Good for sovereignty concerns, but adds significant operational burden (running your own control plane on a VPS just to manage VPN access to that same VPS is circular). Missing some features: no Funnel/Serve, limited OIDC, CLI-only admin. Makes more sense for larger homelab setups.

- **Plain WireGuard** -- Zero overhead, maximum control. But manual key management, no automatic NAT traversal, no DNS, O(n^2) config complexity for mesh topologies. Fine for a single Mac-to-VPS tunnel, but Tailscale eliminates all the manual work for free.

- **Cloudflare Tunnel** -- Fundamentally different model: outbound tunnel from VPS to Cloudflare edge, then proxy back to client. **Cloudflare decrypts your traffic.** This is a dealbreaker for inference API traffic containing prompts and responses. Also designed for public-facing services, not private mesh networking. Not suitable.

**Recommendation:** Use Tailscale on the free Personal plan. Fall back to Netbird (self-hosted) if Tailscale's free tier ever becomes insufficient. Keep plain WireGuard as the emergency escape hatch (the underlying protocol is the same).

**Sources:** [Top 5 Tailscale Alternatives (Netbird)](https://netbird.io/knowledge-hub/top-5-tailscale-alternatives), [XDA Tailscale vs alternatives](https://www.xda-developers.com/tailscale-pangolin-zerotier-netbird-remotely-access-home-lab/), [Headscale GitHub](https://github.com/juanfont/headscale), [Netbird self-hosting quickstart](https://docs.netbird.io/selfhosted/selfhosted-quickstart), [Tailscale vs WireGuard](https://tailscale.com/compare/wireguard), [Cloudflare vs Tailscale](https://tailscale.com/compare/cloudflare-access)

---

## 6. MagicDNS and Service Discovery

### How It Works

MagicDNS runs locally on every tailnet device at `100.100.100.100`. When a Docker sidecar joins the tailnet with hostname `inference`, it becomes reachable as:

- `inference` (short name, within the tailnet)
- `inference.<tailnet-name>.ts.net` (FQDN)

DNS lookups for tailnet devices are resolved locally -- no external DNS query leaves the machine. This means:
- No DNS leak risk
- Sub-millisecond resolution
- Works offline (once the tailnet map is synced)

### For Our Setup

With two sidecar containers named `inference` and `mcp-server`:

```
# From the local Mac:
curl http://inference:1234/v1/models         # LLM inference API
curl http://mcp-server:3100/health            # MCP server health
```

### Wildcard Subdomains

Tailscale added wildcard subdomain resolution: `*.inference.<tailnet>.ts.net` resolves to the inference container's IP. Useful if the inference server hosts multiple model endpoints on subdomains.

### HTTPS via Tailscale Serve

Tailscale Serve can proxy HTTPS with automatic Let's Encrypt certificates on the tailnet:

```json
{
  "Web": {
    "${TS_CERT_DOMAIN}:443": {
      "Handlers": {
        "/": { "Proxy": "http://127.0.0.1:1234" }
      }
    }
  },
  "AllowFunnel": {
    "${TS_CERT_DOMAIN}:443": false
  }
}
```

This gives you `https://inference.<tailnet>.ts.net` with a valid cert, while `AllowFunnel: false` keeps it private to the tailnet.

**Source:** [MagicDNS docs](https://tailscale.com/docs/features/magicdns), [MagicDNS deep dive](https://tailscale.com/blog/magicdns-why-name), [Tailscale Serve + Docker](https://www.elliotblackburn.com/how-to-use-tailscale-serve-with-docker-compose-for-secure-private-self-hosting/)

---

## 7. Security Model

### Architecture

Tailscale's security model has three layers:

1. **WireGuard encryption (data plane).** All traffic between tailnet nodes is end-to-end encrypted using WireGuard. Private keys never leave the device that generated them. Even Tailscale's own DERP relay servers cannot decrypt traffic.

2. **Coordination server (control plane).** The control plane at `login.tailscale.com` exchanges public keys and distributes ACL policies. It is a metadata-only system -- it sees which nodes exist and their public IPs, but never touches the encrypted traffic.

3. **Tailnet Lock (optional).** Nodes verify public keys distributed by the coordination server before trusting them. This mitigates a compromised coordination server distributing rogue keys. Available on Enterprise plans or via Headscale.

### What Tailscale Can See (Metadata)

- Which devices are on your tailnet
- Public IP addresses of those devices
- Which devices connect to which (connection graph)
- ACL policy content

### What Tailscale Cannot See

- The content of any traffic between your devices
- Application-layer data (API requests, model responses, prompts)

### Known Security Issues (2024-2025)

| Date | Issue | Severity | Status |
|------|-------|----------|--------|
| June 2024 | API clients over plaintext HTTP exposed credentials | Medium | Fixed |
| May 2025 | DERP mesh key leak (peer enumeration) | Low | Patched |
| March 2025 | Admin console session timeout bypass | Low | Fixed |
| 2025 | Tailnet Lock signing check bypass without `--statedir` | Medium | Fixed in TS-2025-008 |

None of these were data-plane vulnerabilities. The WireGuard layer has never been compromised. The issues were all in the control plane or administrative interfaces.

### For Production Inference Endpoints

**Yes, Tailscale's security model is suitable.** The threat model for a private inference API is:

- **Unauthorized access to the API** -- Mitigated by Tailscale ACLs. Only devices on your tailnet can reach it. No public ports.
- **Traffic interception** -- Mitigated by WireGuard end-to-end encryption. Even relayed traffic (through DERP) is encrypted.
- **Coordination server compromise** -- Theoretical risk. An attacker controlling Tailscale's servers could inject rogue nodes. Mitigated by Tailnet Lock (Enterprise) or by using Headscale. For a personal/small-team setup, this risk is acceptable.
- **Local device compromise** -- If your Mac or VPS is compromised, Tailscale can't help. Standard host security applies.

**Source:** [Tailscale Security](https://tailscale.com/security), [How Tailscale Works](https://tailscale.com/blog/how-tailscale-works), [Encryption](https://tailscale.com/kb/1504/encryption), [Security Bulletins](https://tailscale.com/security-bulletins), [DERP Servers](https://tailscale.com/kb/1232/derp-servers)

---

## 8. Performance

### Latency Overhead

| Scenario | Overhead |
|----------|----------|
| Direct connection (both peers have open UDP) | **1-3ms** added to base RTT |
| DERP relay (NAT traversal failed) | **5-20ms** added, plus geographic detour |
| Userspace WireGuard (non-Linux or `TS_USERSPACE=true`) | Slightly higher CPU usage, negligible latency difference |
| Kernel WireGuard (Linux with `TS_USERSPACE=false`) | Best performance, minimal overhead |

### For LLM Inference API Calls

This is the key question: does 1-3ms of VPN overhead matter?

**No.** Consider the timings:

- A typical inference request to a 7B model: **2,000-30,000ms** depending on output length
- Network RTT from US West Coast to a Hetzner EU VPS: **~130-160ms**
- Network RTT to US-based VPS (IONOS Las Vegas): **~10-30ms**
- Tailscale overhead on a direct connection: **~1-3ms**

The VPN overhead is noise compared to inference latency. Even for short completions (500ms), 1-3ms is <1% overhead. The geographic RTT between Mac and VPS will dominate.

### Throughput

Tailscale on Linux has achieved 10+ Gbps with kernel offloads (Linux 6.2+, Tailscale 1.54+). For our use case (API calls carrying JSON payloads of tens of KB), throughput is irrelevant -- even 100 Mbps would be orders of magnitude more than needed.

### Ensuring Direct Connections

To avoid DERP relay overhead:

1. **Open UDP 41641 on the VPS firewall** -- This is the single most important step. With this port open, Tailscale almost always establishes direct connections.
2. **Use `tailscale status`** to verify connection type (direct vs relay).
3. **DERP is the fallback**, not the default. On a VPS with a public IP and open UDP, direct connection is virtually guaranteed.

**Source:** [Performance Best Practices](https://tailscale.com/kb/1320/performance-best-practices), [Throughput Improvements](https://tailscale.com/blog/throughput-improvements), [10Gbps on Linux](https://tailscale.com/blog/more-throughput), [Poor Performance Troubleshooting](https://tailscale.com/docs/reference/troubleshooting/poor-performance-tailnet)

---

## Recommendation Summary

| Decision | Choice | Reasoning |
|----------|--------|-----------|
| VPN solution | Tailscale (free Personal plan) | Best UX, free tier is generous, first-class Docker support, MagicDNS |
| Docker pattern | Sidecar containers | Per-service identity, ACLs, DNS names; ~20MB RAM each |
| Fallback VPN | Plain WireGuard | Same underlying protocol, zero dependency on Tailscale infra |
| Long-term alternative | Netbird (self-hosted) | If Tailscale free tier changes, Netbird is the best fully open-source option |
| Ports exposed to internet | **Zero** (UDP 41641 for Tailscale handshake only) | Only WireGuard handshake traffic; all application traffic over the encrypted mesh |
| Provider networking | Hetzner recommended | Single-firewall, works out of the box, simplest setup of all providers evaluated. |
| Performance concern | Not a concern | 1-3ms overhead is negligible against inference latency. Direct connections are reliable on VPS with open UDP. |
