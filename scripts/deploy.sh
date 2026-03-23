#!/usr/bin/env bash
set -euo pipefail

# Blue-green deploy for Sherpa Studio
#
# Usage:
#   ./scripts/deploy.sh              Full deploy (pull + build + swap)
#   ./scripts/deploy.sh --skip-pull  Skip git pull (sync script already pulled via container)
#   ./scripts/deploy.sh --skip-build Skip git pull and build (use current .next/)
#   ./scripts/deploy.sh --rollback   Swap back to the previous slot
#
# NOTE: When called from sherpa-sync.sh, use --skip-pull. The sync script
# handles git operations inside the container to avoid creating root-owned
# files in the bind-mounted repo, which blocks Luna (UID 1000).

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
  chmod 644 "$DEPLOY_DIR/studio-upstream.caddy"
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

  # Pull unless --skip-pull (sync script already pulled via container)
  if [ "${1:-}" != "--skip-pull" ]; then
    log "Pulling latest..."
    git pull --ff-only
  fi

  log "Installing dependencies..."
  pnpm install --frozen-lockfile

  # Source env for build (BETTER_AUTH_SECRET required by next build)
  set -a
  # shellcheck source=/dev/null
  source "$REPO_DIR/.env.production"
  set +a

  log "Building Studio..."
  pnpm build

  # Restore ownership to node (UID 1000) so Luna can access the bind-mounted
  # repo. pnpm install/build run as root and create root-owned files that
  # block Luna's container process. Root can still access 1000-owned files.
  log "Restoring file ownership..."
  chown -R 1000:1000 "$REPO_DIR"
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
chmod 644 "$DEPLOY_DIR/studio-upstream.caddy"
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
