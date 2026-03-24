#!/usr/bin/env bash
# OpenClaw config and state backup
# Install: add to root crontab on VPS
#   0 3 * * * /home/openclaw/sherpa/scripts/vps/openclaw-backup.sh
#
# Backs up:
#   - OpenClaw config dir (openclaw.json, agents, credentials, identity)
#   - Environment file (.env)
#   - Systemd service unit
#   - Agent workspace metadata (AGENTS.md, SOUL.md, memory/)
#
# Assumes native install: user openclaw, config at /home/openclaw/.openclaw
# Retention: 30 days

set -euo pipefail

BACKUP_DIR="/mnt/sherpa-data/backups/openclaw"
CONFIG_DIR="/mnt/sherpa-data/data/openclaw/config"
OPENCLAW_HOME="/home/openclaw"
DATE=$(date +%Y%m%d)
RETENTION_DAYS=30

mkdir -p "$BACKUP_DIR"

# Create timestamped backup
tar czf "$BACKUP_DIR/openclaw-$DATE.tar.gz" \
  --ignore-failed-read \
  "$CONFIG_DIR" \
  "$OPENCLAW_HOME/.env" \
  "$OPENCLAW_HOME/AGENTS.md" \
  "$OPENCLAW_HOME/SOUL.md" \
  "$OPENCLAW_HOME/IDENTITY.md" \
  "$OPENCLAW_HOME/HEARTBEAT.md" \
  "$OPENCLAW_HOME/memory/" \
  /etc/systemd/system/openclaw-gateway.service \
  2>/dev/null || true

# Prune old backups
find "$BACKUP_DIR" -name "openclaw-*.tar.gz" -mtime +$RETENTION_DAYS -delete

echo "[$(date -Iseconds)] Backup complete: openclaw-$DATE.tar.gz"
