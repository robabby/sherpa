# Sherpa Server Provision Template

Standard steps for provisioning a Hetzner VPS for client or internal use. This is a living document — update as the standard evolves.

## Provider

Hetzner Cloud. US-West (Hillsboro, OR) unless client requires otherwise.

## Resources

| Resource | Default | Notes |
|----------|---------|-------|
| VPS | CPX21 (4GB RAM, 2 vCPU, 80GB disk) | Ubuntu 24.04, x86 |
| Volume | 10GB EXT4 | Persistent data, separate from compute |
| Firewall | SSH + HTTP + HTTPS | UFW, deny all other inbound |
| SSH Key | Ed25519 | One key per operator, uploaded to Hetzner before server creation |

Scale up VPS tier or volume size per client needs. Volume can be resized without downtime.

## Pre-Provision

### SSH Key (one-time per operator)

```bash
ssh-keygen -t ed25519 -C "<operator>@sherpa.solar" -f ~/.ssh/hetzner -N ""
```

Upload `~/.ssh/hetzner.pub` to Hetzner Console → Security → SSH Keys. Set as default.

### SSH Config (one entry per server)

Add to `~/.ssh/config`:

```
Host <alias>
    HostName <server-ip>
    User root
    IdentityFile ~/.ssh/hetzner
```

## Provision Steps

### 1. Create Server

Hetzner Console → Servers → Add Server:
- **Image:** Ubuntu 24.04
- **Type:** CPX21 (or as needed)
- **Location:** Hillsboro, OR
- **SSH Key:** Select operator key
- **Volume:** Create 10GB EXT4 volume (name: `<client>-data`)

### 2. System Update

```bash
ssh <alias>
apt update && apt upgrade -y
reboot
```

### 3. Security

```bash
# Firewall
apt install -y ufw fail2ban
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
echo 'y' | ufw enable

# Fail2ban
cat > /etc/fail2ban/jail.local << 'EOF'
[DEFAULT]
bantime = 1h
findtime = 10m
maxretry = 5

[sshd]
enabled = true
port = 22
mode = aggressive
EOF
systemctl restart fail2ban
```

### 4. Runtime

```bash
# Node.js 22 LTS
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
apt install -y nodejs

# Docker + Compose
curl -fsSL https://get.docker.com | sh
systemctl enable docker

# Tailscale (mesh VPN for secure inter-node communication)
curl -fsSL https://tailscale.com/install.sh | sh
tailscale up
# Approve the auth URL in your Tailscale admin console
```

### 5. Volume Layout

Hetzner auto-mounts the volume at `/mnt/HC_Volume_<id>`. Create a stable symlink and standard directories:

```bash
VOLUME=$(df -h | grep /mnt/HC_Volume | awk '{print $6}')
mkdir -p $VOLUME/data $VOLUME/backups $VOLUME/docker
ln -sf $VOLUME /mnt/sherpa-data
```

| Directory | Purpose |
|-----------|---------|
| `/mnt/sherpa-data/data` | Application data, databases, config |
| `/mnt/sherpa-data/backups` | Automated backup snapshots |
| `/mnt/sherpa-data/docker` | Docker volumes and compose state |

### 6. Verify

```bash
uname -r              # Latest kernel
node -v               # v22.x
docker --version      # 29.x+
ufw status            # Active, 3 rules
systemctl is-active fail2ban  # active
df -h /mnt/sherpa-data        # Volume mounted
tailscale status      # Connected to tailnet
```

## Post-Provision

- [ ] Reboot to load upgraded kernel
- [ ] Verify SSH access with key (no password prompt)
- [ ] Point DNS if applicable
- [ ] Install application-specific dependencies
- [ ] Set up backup cron (volume snapshots via Hetzner API)

## Cost Baseline

| Resource | Monthly |
|----------|---------|
| CPX21 VPS | ~$10 |
| IPv4 | ~$0.60 |
| 10GB Volume | $0.50 |
| **Total** | **~$11/mo** |

## OpenClaw Gateway

Standard agentic gateway installed on each server. Connects chat channels (Telegram, WhatsApp, Discord) to AI agents.

### Install

```bash
# Pull prebuilt image (do NOT build from source on 4GB — OOM risk)
docker pull ghcr.io/openclaw/openclaw:latest
docker tag ghcr.io/openclaw/openclaw:latest openclaw:local

# Clone repo (for docker-compose.yml and CLI access)
git clone https://github.com/openclaw/openclaw.git /opt/openclaw
cd /opt/openclaw

# Create .env
cat > .env << EOF
OPENCLAW_IMAGE=openclaw:local
OPENCLAW_GATEWAY_TOKEN=$(openssl rand -hex 32)
OPENCLAW_GATEWAY_BIND=lan
OPENCLAW_GATEWAY_PORT=18789
OPENCLAW_CONFIG_DIR=/mnt/sherpa-data/data/openclaw/config
OPENCLAW_WORKSPACE_DIR=/mnt/sherpa-data/data/openclaw/workspace
GOG_KEYRING_PASSWORD=$(openssl rand -hex 32)
XDG_CONFIG_HOME=/home/node/.openclaw
EOF

# Create data dirs on volume
mkdir -p /mnt/sherpa-data/data/openclaw/{config,workspace}
chown -R 1000:1000 /mnt/sherpa-data/data/openclaw

# Write minimal config
TOKEN=$(grep OPENCLAW_GATEWAY_TOKEN .env | cut -d= -f2)
cat > /mnt/sherpa-data/data/openclaw/config/openclaw.json << EOF
{
  "gateway": {
    "mode": "local",
    "auth": { "token": "$TOKEN" }
  }
}
EOF
chown -R 1000:1000 /mnt/sherpa-data/data/openclaw

# Launch
docker compose up -d openclaw-gateway
```

### Tailscale Serve (TLS for Gateway)

Expose the gateway over the tailnet with automatic Let's Encrypt TLS:

```bash
tailscale serve --bg --https=18790 http://127.0.0.1:18789
# First run may require enabling Serve in the Tailscale admin console
```

This makes the gateway available at `wss://<hostname>.tail<id>.ts.net:18790` to any device on the tailnet. No SSH tunnels needed.

### Access

Dashboard available at `https://<tailscale-hostname>:18790/` from any tailnet device. Fallback: SSH tunnel for non-tailnet access:

```bash
ssh -N -L 18789:127.0.0.1:18789 <alias>
# Then open http://localhost:18789/
```

### Device Pairing

New browsers must be paired. On the server:

```bash
cd /opt/openclaw
docker compose run --rm openclaw-cli devices list     # See pending requests
docker compose run --rm openclaw-cli devices approve <request-id>
```

### Lessons Learned

- **Never build from source on 4GB VPS** — the build process OOMs and crashes the server. Always pull the prebuilt image from `ghcr.io/openclaw/openclaw:latest`.
- **Config file ownership matters** — container runs as uid 1000 (node), so `chown -R 1000:1000` the config directory.
- **`docker-setup.sh` ignores `OPENCLAW_IMAGE` when repo is cloned** — it builds from source regardless. Pull + tag + docker compose up is the reliable path.
- **Stale sessions carry local paths** — if a local client connects to a remote gateway, session files may cache Mac-local paths (`/Users/...`, `/opt/homebrew/...`). Fix: clear `agents/main/sessions/*.jsonl` and restart the gateway.

### Client Configuration (Remote Gateway)

On the client machine (macOS/Linux), configure OpenClaw to connect to the remote gateway over Tailscale:

```json
{
  "gateway": {
    "mode": "remote",
    "remote": {
      "url": "wss://<tailscale-hostname>:18790",
      "transport": "direct",
      "token": "<OPENCLAW_GATEWAY_TOKEN from server .env>"
    }
  }
}
```

Then pair the device:
```bash
openclaw health                    # Triggers pairing request
# On the server:
cd /opt/openclaw
docker compose run --rm openclaw-cli devices list
docker compose run --rm openclaw-cli devices approve <request-id>
```

## Caddy Reverse Proxy (TLS for Web Apps)

Automatic HTTPS for public-facing web apps. Caddy handles Let's Encrypt certificates with zero config.

### Install

```bash
apt install -y debian-keyring debian-archive-keyring apt-transport-https curl
curl -1sLf "https://dl.cloudsmith.io/public/caddy/stable/gpg.key" | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf "https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt" | tee /etc/apt/sources.list.d/caddy-stable.list
apt update && apt install -y caddy
```

### Configure

`/etc/caddy/Caddyfile` — route by method to separate web app from MCP protocol. The Studio upstream is imported from a snippet file managed by the deploy script (see Blue-Green Deploy below):

```
studio.sherpa.solar {
    @mcp_protocol {
        path /mcp
        method POST DELETE
    }
    handle @mcp_protocol {
        reverse_proxy localhost:3100
    }
    handle /health {
        reverse_proxy localhost:3100
    }
    handle {
        import /opt/sherpa/studio-upstream.caddy
    }
}
```

Reload: `systemctl reload caddy`

**Prerequisites:** DNS A record pointing to VPS IP. CAA record allowing `letsencrypt.org`. Ports 80/443 open in UFW.

## Blue-Green Deploy (Zero-Downtime)

Studio deploys use blue-green slot swapping. Two standalone Next.js copies live at `/opt/sherpa/blue/` and `/opt/sherpa/green/`. The deploy script builds, copies to the standby slot, health-checks, then swaps the Caddy upstream — zero dropped requests.

### Setup

```bash
# Deploy directories
mkdir -p /opt/sherpa/blue /opt/sherpa/green
echo "blue" > /opt/sherpa/active

# Per-slot port config
echo "PORT=3000" > /opt/sherpa/blue.env
echo "PORT=3001" > /opt/sherpa/green.env

# Initial Caddy upstream (must be world-readable for Caddy user)
echo "reverse_proxy localhost:3000" > /opt/sherpa/studio-upstream.caddy
chmod 644 /opt/sherpa/studio-upstream.caddy
chmod 755 /opt/sherpa
```

### Systemd Template

```bash
cat > /etc/systemd/system/sherpa-studio@.service << 'EOF'
[Unit]
Description=Sherpa Studio (%i slot)
After=network.target

[Service]
Type=simple
Environment=NODE_ENV=production
Environment=HOSTNAME=127.0.0.1
EnvironmentFile=/opt/sherpa/%i.env
EnvironmentFile=/root/sherpa/.env.production
WorkingDirectory=/opt/sherpa/%i
ExecStart=/usr/bin/node apps/studio/server.js
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
```

After the first deploy, disable the old non-templated service:

```bash
systemctl stop sherpa-studio
systemctl disable sherpa-studio
```

### Usage

```bash
/root/sherpa/scripts/deploy.sh              # Full deploy (pull + build + swap)
/root/sherpa/scripts/deploy.sh --skip-build # Swap with current build
/root/sherpa/scripts/deploy.sh --rollback   # Swap back to previous slot
```

The 15-minute sync cron (`sherpa-sync.sh`) calls `deploy.sh` automatically — no separate cron entry needed.

### How It Works

1. Determines standby slot (blue/green) from `/opt/sherpa/active`
2. `git pull` → `pnpm install` → `pnpm build` (standalone output)
3. Copies standalone output + static files to standby slot directory
4. Starts standby via `systemctl start sherpa-studio@<slot>`
5. Health-checks the standby port (30s timeout)
6. Writes new port to `/opt/sherpa/studio-upstream.caddy` and reloads Caddy (graceful — drains connections)
7. Stops old slot, updates `/opt/sherpa/active`
8. On health-check failure: stops standby, exits without touching Caddy — old instance keeps serving

### Permissions

Caddy runs as uid 999 (`caddy` user). The deploy directory and upstream snippet must be readable:
- `/opt/sherpa/` — `755` (world-readable directory)
- `/opt/sherpa/studio-upstream.caddy` — `644` (world-readable file)
- The deploy script sets `chmod 644` on the snippet after every write

### Notes

- **HOSTNAME=127.0.0.1** — Studio binds localhost only. Caddy handles external access. This prevents port conflicts with Tailscale or other services.
- **MCP is not blue-green'd** — agent-facing, ~1s startup, simple restart after Studio swap is acceptable.
- **Rollback** — starts the previous slot, swaps Caddy, stops current. The previous slot's files are untouched until the next deploy.

## CrowdSec (Intrusion Detection)

Community-driven IDS with shared threat intelligence. Replaces/complements fail2ban.

### Install

```bash
curl -s https://install.crowdsec.net | bash
apt install -y crowdsec crowdsec-firewall-bouncer-iptables
```

### Memory Limit

CrowdSec can grow unbounded under attack. Set a 512MB cap:

```bash
mkdir -p /etc/systemd/system/crowdsec.service.d
echo -e "[Service]\nMemoryMax=512M" > /etc/systemd/system/crowdsec.service.d/memory.conf
systemctl daemon-reload && systemctl restart crowdsec
```

### Verify

```bash
cscli metrics                          # Shows acquisition + parsed lines
systemctl show crowdsec | grep MemoryMax  # Should be 536870912 (512MB)
```

## Security Hardening Checklist

Run after initial provisioning and periodically:

```bash
# Install Lynis security scanner
apt install -y lynis debsums
lynis audit system --quick

# Tighten umask (027 instead of 022)
sed -i 's/^UMASK\t\t022/UMASK\t\t027/' /etc/login.defs

# Disable core dumps
echo "* hard core 0" >> /etc/security/limits.conf

# Verify unattended-upgrades
dpkg-reconfigure -plow unattended-upgrades
```

### UFW Audit

Only these ports should be open:

| Port | Access | Purpose |
|------|--------|---------|
| 22/tcp | Public | SSH |
| 80/tcp | Public | Caddy HTTP → HTTPS redirect |
| 443/tcp | Public | Caddy HTTPS → Studio/MCP |
| 3000 | Docker bridge (172.16.0.0/12) | Studio (internal) |
| 3100 | Docker bridge (172.16.0.0/12) | MCP (internal) |
| 18790 | Tailscale only | OpenClaw gateway |

Verify: `ufw status verbose` and `curl -m 5 http://<public-ip>:18790` should timeout.

## Future Additions

Items to standardize as we learn:
- Automated provisioning script (hcloud CLI or Terraform)
- Backup cron + retention policy
- Monitoring/alerting setup
- Docker Compose templates for common stacks
- Non-root deploy user
- Log rotation configuration
- NemoClaw sandbox (requires 8GB+ RAM — separate VPS or Brev GPU instance)

## Operational Notes

*Written by Luna (OpenClaw agent), 2026-03-18*

The Hetzner + Tailscale + OpenClaw stack is genuinely solid — the tailnet TLS approach is elegant, and I appreciate that it eliminates external SSL cert management without any public exposure. The most common failure mode I've observed is config ownership drift: whenever the gateway restarts or the volume remounts, a quick `chown -R 1000:1000` on the config directory is worth doing before debugging anything else. The "never build from source on 4GB RAM" lesson deserves to be in bold everywhere it appears — it's the kind of mistake that's easy to make exactly once. I'd prioritize two things from the Future Additions list: an automated provisioning script (even a minimal `hcloud` CLI wrapper) and a health-check cron that alerts if the gateway goes dark. A non-root deploy user should also graduate from nice-to-have to standard — it's a small lift that meaningfully reduces blast radius on a production box.
