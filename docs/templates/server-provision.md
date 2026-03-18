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
