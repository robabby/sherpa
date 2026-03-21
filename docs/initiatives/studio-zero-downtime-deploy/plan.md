# Zero-Downtime Blue-Green Deploy — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace in-place build-and-restart with blue-green slot swapping so Studio deploys drop zero requests.

**Architecture:** Two deploy slots (`/opt/sherpa/blue/`, `/opt/sherpa/green/`) hold standalone Next.js output. A deploy script builds, copies to the standby slot, starts it via systemd, health-checks, swaps the Caddy upstream, then stops the old slot. Caddy's graceful reload drains in-flight connections during the swap.

**Tech Stack:** Next.js 16.1 standalone output, Caddy reverse proxy, systemd service templates, bash

**Reference docs:**
- Proposal: `docs/initiatives/studio-zero-downtime-deploy/proposal.md`
- Current VPS setup: `docs/templates/server-provision.md`
- Current Next.js config: `apps/studio/next.config.ts`
- MCP server: `packages/studio-mcp/src/http-server.ts`

---

## Session 1: Repo Changes + VPS Setup

### Task 1: Enable Next.js standalone output

**Files:**
- Modify: `apps/studio/next.config.ts`

**Step 1: Add standalone output to Next.js config**

Change `apps/studio/next.config.ts` to:

```ts
import { withSherpa } from "@sherpa/studio/next"

const config = withSherpa({
  output: "standalone",
  pageExtensions: ["js", "jsx", "ts", "tsx"],
})

export default config
```

**Step 2: Build and verify standalone output**

```bash
cd /Users/rob/Workbench/sherpa
pnpm build
```

Expected: Build succeeds. `.next/standalone/` directory exists inside `apps/studio/`.

**Step 3: Inspect standalone output structure**

```bash
ls -la apps/studio/.next/standalone/
ls -la apps/studio/.next/standalone/apps/studio/
```

Expected: `apps/studio/.next/standalone/` contains the monorepo structure with `apps/studio/server.js` as the entry point. Note the exact path — if it differs from `apps/studio/server.js`, adjust the deploy script and systemd template in later tasks.

**Step 4: Verify standalone server starts**

```bash
PORT=3002 node apps/studio/.next/standalone/apps/studio/server.js &
sleep 3
curl -sf http://localhost:3002 > /dev/null && echo "OK" || echo "FAIL"
kill %1
```

Expected: `OK` — the standalone server responds on port 3002. If the server.js path is wrong, find the correct path with `find apps/studio/.next/standalone -name server.js` and update accordingly.

**Step 5: Commit**

```bash
git add apps/studio/next.config.ts
git commit -m "feat: enable Next.js standalone output for blue-green deploys"
```

---

### Task 2: Write the deploy script

**Files:**
- Create: `scripts/deploy.sh`

**Step 1: Create the deploy script**

Write `scripts/deploy.sh`:

```bash
#!/usr/bin/env bash
set -euo pipefail

# Blue-green deploy for Sherpa Studio
#
# Usage:
#   ./scripts/deploy.sh              Full deploy (pull + build + swap)
#   ./scripts/deploy.sh --skip-build Skip git pull and build (use current .next/)
#   ./scripts/deploy.sh --rollback   Swap back to the previous slot

DEPLOY_DIR="/opt/sherpa"
REPO_DIR="/root/sherpa"
BLUE_PORT=3000
GREEN_PORT=3001
HEALTH_TIMEOUT=30

log() { echo "[deploy] $*"; }
err() { echo "[deploy] ERROR: $*" >&2; }

# Determine active and standby slots
ACTIVE=$(cat "$DEPLOY_DIR/active" 2>/dev/null || echo "blue")
if [ "$ACTIVE" = "blue" ]; then
  STANDBY="green"; STANDBY_PORT=$GREEN_PORT; ACTIVE_PORT=$BLUE_PORT
else
  STANDBY="blue"; STANDBY_PORT=$BLUE_PORT; ACTIVE_PORT=$GREEN_PORT
fi

# Rollback: swap without building
if [ "${1:-}" = "--rollback" ]; then
  log "Rolling back: $ACTIVE (port $ACTIVE_PORT) → $STANDBY (port $STANDBY_PORT)"

  if [ ! -d "$DEPLOY_DIR/$STANDBY/apps/studio" ]; then
    err "No previous deployment in $STANDBY slot — nothing to roll back to"
    exit 1
  fi

  systemctl start "sherpa-studio@$STANDBY"

  for i in $(seq 1 $HEALTH_TIMEOUT); do
    if curl -sf "http://localhost:$STANDBY_PORT" > /dev/null 2>&1; then
      log "Rollback instance healthy"
      break
    fi
    [ "$i" -eq "$HEALTH_TIMEOUT" ] && { err "Rollback health check failed"; systemctl stop "sherpa-studio@$STANDBY" 2>/dev/null || true; exit 1; }
    sleep 1
  done

  echo "reverse_proxy localhost:$STANDBY_PORT" > "$DEPLOY_DIR/studio-upstream.caddy"
  systemctl reload caddy
  sleep 2
  systemctl stop "sherpa-studio@$ACTIVE" 2>/dev/null || true
  echo "$STANDBY" > "$DEPLOY_DIR/active"
  log "Rolled back to $STANDBY (port $STANDBY_PORT)"
  exit 0
fi

log "Deploying: $ACTIVE (port $ACTIVE_PORT) → $STANDBY (port $STANDBY_PORT)"

# Build (unless --skip-build)
if [ "${1:-}" != "--skip-build" ]; then
  cd "$REPO_DIR"

  log "Pulling latest..."
  git pull --ff-only

  log "Installing dependencies..."
  pnpm install --frozen-lockfile

  log "Building Studio..."
  pnpm build
fi

# Copy standalone output to standby slot
log "Copying standalone output to $STANDBY slot..."
rm -rf "${DEPLOY_DIR:?}/$STANDBY"
mkdir -p "$DEPLOY_DIR/$STANDBY"

STANDALONE="$REPO_DIR/apps/studio/.next/standalone"
if [ ! -d "$STANDALONE" ]; then
  err "Standalone output not found at $STANDALONE — did the build succeed?"
  exit 1
fi

cp -a "$STANDALONE/." "$DEPLOY_DIR/$STANDBY/"
cp -a "$REPO_DIR/apps/studio/.next/static" "$DEPLOY_DIR/$STANDBY/apps/studio/.next/static"
if [ -d "$REPO_DIR/apps/studio/public" ]; then
  cp -a "$REPO_DIR/apps/studio/public" "$DEPLOY_DIR/$STANDBY/apps/studio/public"
fi

# Start standby instance
log "Starting $STANDBY instance on port $STANDBY_PORT..."
systemctl start "sherpa-studio@$STANDBY"

# Health check
log "Health checking port $STANDBY_PORT (${HEALTH_TIMEOUT}s timeout)..."
for i in $(seq 1 $HEALTH_TIMEOUT); do
  if curl -sf "http://localhost:$STANDBY_PORT" > /dev/null 2>&1; then
    log "Health check passed"
    break
  fi
  if [ "$i" -eq "$HEALTH_TIMEOUT" ]; then
    err "Health check failed after ${HEALTH_TIMEOUT}s — aborting deploy"
    systemctl stop "sherpa-studio@$STANDBY" 2>/dev/null || true
    exit 1
  fi
  sleep 1
done

# Swap Caddy upstream
log "Swapping Caddy upstream to port $STANDBY_PORT..."
echo "reverse_proxy localhost:$STANDBY_PORT" > "$DEPLOY_DIR/studio-upstream.caddy"
systemctl reload caddy

# Brief pause for Caddy to drain connections on old upstream
sleep 2

# Stop old instance
log "Stopping $ACTIVE instance..."
systemctl stop "sherpa-studio@$ACTIVE" 2>/dev/null || true

# Update active slot
echo "$STANDBY" > "$DEPLOY_DIR/active"

# Restart MCP server (simple restart — agent-facing, ~1s downtime acceptable)
log "Restarting MCP server..."
systemctl restart sherpa-mcp

log "Deploy complete — active slot: $STANDBY (port $STANDBY_PORT)"
```

**Step 2: Make it executable**

```bash
chmod +x scripts/deploy.sh
```

**Step 3: Commit**

```bash
git add scripts/deploy.sh
git commit -m "feat: add blue-green deploy script for Studio"
```

---

### Task 3: VPS — Create deploy directory structure

**Requires:** SSH access to VPS (`ssh sherpa-hetzner`)

**Step 1: Create directories and state file**

```bash
ssh sherpa-hetzner << 'EOF'
mkdir -p /opt/sherpa/blue /opt/sherpa/green
echo "blue" > /opt/sherpa/active
EOF
```

**Step 2: Create per-slot environment files**

```bash
ssh sherpa-hetzner << 'EOF'
cat > /opt/sherpa/blue.env << 'SLOT'
PORT=3000
SLOT

cat > /opt/sherpa/green.env << 'SLOT'
PORT=3001
SLOT
EOF
```

**Step 3: Create initial Caddy upstream snippet**

```bash
ssh sherpa-hetzner << 'EOF'
echo "reverse_proxy localhost:3000" > /opt/sherpa/studio-upstream.caddy
EOF
```

**Step 4: Verify**

```bash
ssh sherpa-hetzner "ls -la /opt/sherpa/ && cat /opt/sherpa/active && cat /opt/sherpa/blue.env && cat /opt/sherpa/green.env && cat /opt/sherpa/studio-upstream.caddy"
```

Expected:
```
blue
PORT=3000
PORT=3001
reverse_proxy localhost:3000
```

---

### Task 4: VPS — Create systemd service template

**Step 1: Write the template unit**

```bash
ssh sherpa-hetzner << 'REMOTE'
cat > /etc/systemd/system/sherpa-studio@.service << 'EOF'
[Unit]
Description=Sherpa Studio (%i slot)
After=network.target

[Service]
Type=simple
Environment=NODE_ENV=production
Environment=HOSTNAME=0.0.0.0
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
REMOTE
```

**Step 2: Verify template is recognized**

```bash
ssh sherpa-hetzner "systemctl cat sherpa-studio@blue"
```

Expected: Shows the unit file contents with `%i` replaced by `blue`.

**Step 3: Disable the old non-templated service**

```bash
ssh sherpa-hetzner << 'EOF'
systemctl stop sherpa-studio 2>/dev/null || true
systemctl disable sherpa-studio 2>/dev/null || true
EOF
```

Note: The old service may have a different name. Check with `systemctl list-units | grep sherpa` first. If the old service is already stopped from a previous session, this is a no-op.

---

### Task 5: VPS — Update Caddyfile

**Step 1: Replace the hardcoded Studio upstream with an import**

```bash
ssh sherpa-hetzner << 'REMOTE'
cat > /etc/caddy/Caddyfile << 'EOF'
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
EOF
REMOTE
```

**Step 2: Validate Caddy config**

```bash
ssh sherpa-hetzner "caddy validate --config /etc/caddy/Caddyfile --adapter caddyfile"
```

Expected: `Valid configuration`

**Step 3: Reload Caddy**

```bash
ssh sherpa-hetzner "systemctl reload caddy"
```

**Step 4: Verify Studio is still accessible**

```bash
curl -sf https://studio.sherpa.solar > /dev/null && echo "OK" || echo "FAIL"
```

Expected: `OK` — the existing Studio instance (running on the old service) should still serve through the imported upstream. If it fails, the old `sherpa-studio` service may already be stopped — proceed to Session 2 to run the first deploy.

---

## Session 2: First Deploy + Verification

### Task 6: Push repo changes to remote

**Step 1: Push the standalone config and deploy script**

```bash
cd /Users/rob/Workbench/sherpa
git push
```

This makes the changes available on the VPS via `git pull`.

---

### Task 7: Run first blue-green deploy

**Step 1: SSH in and pull the deploy script**

```bash
ssh sherpa-hetzner << 'EOF'
cd /root/sherpa
git pull --ff-only
EOF
```

**Step 2: Run the deploy script**

```bash
ssh sherpa-hetzner "/root/sherpa/scripts/deploy.sh"
```

Expected output (approximate):
```
[deploy] Deploying: blue (port 3000) → green (port 3001)
[deploy] Pulling latest...
[deploy] Installing dependencies...
[deploy] Building Studio...
[deploy] Copying standalone output to green slot...
[deploy] Starting green instance on port 3001...
[deploy] Health checking port 3001 (30s timeout)...
[deploy] Health check passed
[deploy] Swapping Caddy upstream to port 3001...
[deploy] Stopping blue instance...
[deploy] Restarting MCP server...
[deploy] Deploy complete — active slot: green (port 3001)
```

**Step 3: If the standalone path is wrong**

If the deploy fails because `apps/studio/server.js` doesn't exist in the standalone output, find the correct path:

```bash
ssh sherpa-hetzner "find /opt/sherpa/green -name server.js -type f"
```

Then update the `ExecStart` path in the systemd template (Task 4) and the `WorkingDirectory` if needed. Run `systemctl daemon-reload` and retry.

**Step 4: Verify active slot**

```bash
ssh sherpa-hetzner "cat /opt/sherpa/active"
```

Expected: `green`

---

### Task 8: Verify zero-downtime

**Step 1: Confirm Studio is accessible**

```bash
curl -sf https://studio.sherpa.solar > /dev/null && echo "OK" || echo "FAIL"
```

Expected: `OK`

**Step 2: Run a second deploy and watch for dropped requests**

In one terminal, start a request loop:

```bash
while true; do
  STATUS=$(curl -sf -o /dev/null -w "%{http_code}" https://studio.sherpa.solar)
  echo "$(date +%H:%M:%S) $STATUS"
  sleep 0.5
done
```

In another terminal, trigger a deploy:

```bash
ssh sherpa-hetzner "/root/sherpa/scripts/deploy.sh --skip-build"
```

Expected: The request loop shows uninterrupted `200` responses throughout the deploy. The `--skip-build` flag skips `git pull` and `pnpm build`, using the existing standalone output — this isolates the swap mechanism from build time.

**Step 3: Verify slot swapped back**

```bash
ssh sherpa-hetzner "cat /opt/sherpa/active"
```

Expected: `blue` (swapped back from green)

---

### Task 9: Test rollback

**Step 1: Roll back to the previous slot**

```bash
ssh sherpa-hetzner "/root/sherpa/scripts/deploy.sh --rollback"
```

Expected:
```
[deploy] Rolling back: blue (port 3000) → green (port 3001)
[deploy] Rollback instance healthy
[deploy] Rolled back to green (port 3001)
```

**Step 2: Verify**

```bash
ssh sherpa-hetzner "cat /opt/sherpa/active"
curl -sf https://studio.sherpa.solar > /dev/null && echo "OK" || echo "FAIL"
```

Expected: `green`, `OK`

---

### Task 10: Update the sync cron

**Step 1: Check current cron**

```bash
ssh sherpa-hetzner "crontab -l"
```

Find the line that runs `sherpa-sync.sh` or equivalent.

**Step 2: Replace with deploy script**

```bash
ssh sherpa-hetzner "crontab -l | sed 's|.*sherpa-sync.*|*/15 * * * * /root/sherpa/scripts/deploy.sh >> /var/log/sherpa-deploy.log 2>\&1|' | crontab -"
```

If the cron entry doesn't match, manually edit:

```bash
ssh sherpa-hetzner "crontab -e"
```

Replace the sync line with:
```
*/15 * * * * /root/sherpa/scripts/deploy.sh >> /var/log/sherpa-deploy.log 2>&1
```

**Step 3: Verify**

```bash
ssh sherpa-hetzner "crontab -l | grep deploy"
```

Expected: The deploy script runs every 15 minutes, logging to `/var/log/sherpa-deploy.log`.

---

### Task 11: Document in server-provision.md

**Files:**
- Modify: `docs/templates/server-provision.md`

**Step 1: Add a Blue-Green Deploy section**

Add the following section after the "Caddy Reverse Proxy" section in `docs/templates/server-provision.md`:

```markdown
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

# Initial Caddy upstream
echo "reverse_proxy localhost:3000" > /opt/sherpa/studio-upstream.caddy
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
Environment=HOSTNAME=0.0.0.0
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

### Caddyfile

The Studio upstream is imported from a snippet file that the deploy script rewrites:

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

### Usage

```bash
/root/sherpa/scripts/deploy.sh              # Full deploy (pull + build + swap)
/root/sherpa/scripts/deploy.sh --skip-build # Swap with current build
/root/sherpa/scripts/deploy.sh --rollback   # Swap back to previous slot
```

### Cron

```
*/15 * * * * /root/sherpa/scripts/deploy.sh >> /var/log/sherpa-deploy.log 2>&1
```

### How It Works

1. Determines standby slot (blue↔green) from `/opt/sherpa/active`
2. `git pull` → `pnpm install` → `pnpm build` (standalone output)
3. Copies standalone output to standby slot directory
4. Starts standby via `systemctl start sherpa-studio@<slot>`
5. Health-checks the standby port (30s timeout)
6. Writes new port to `/opt/sherpa/studio-upstream.caddy` and reloads Caddy (graceful — drains connections)
7. Stops old slot, updates `/opt/sherpa/active`
8. On health-check failure: stops standby, exits without touching Caddy — old instance keeps serving
```

**Step 2: Commit**

```bash
git add docs/templates/server-provision.md
git commit -m "docs: add blue-green deploy setup to server provision template"
```

**Step 3: Push**

```bash
git push
```
