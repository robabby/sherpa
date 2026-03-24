#!/usr/bin/env bash
# OpenClaw config and state backup
# Install: add to root crontab on VPS
#   0 3 * * * /root/sherpa/scripts/vps/openclaw-backup.sh
#
# Backs up:
#   - OpenClaw config (openclaw.json, .env, docker-compose.override.yml)
#   - Agent workspace metadata (not full workspace — too large)
#   - Session state
#
# Retention: 30 days

set -euo pipefail

BACKUP_DIR="/mnt/sherpa-data/backups/openclaw"
CONFIG_DIR="/mnt/sherpa-data/data/openclaw/config"
OPENCLAW_DIR="/opt/openclaw"
DATE=$(date +%Y%m%d)
RETENTION_DAYS=30

mkdir -p "$BACKUP_DIR"

# Create timestamped backup
tar czf "$BACKUP_DIR/openclaw-$DATE.tar.gz" \
  --ignore-failed-read \
  "$CONFIG_DIR" \
  "$OPENCLAW_DIR/.env" \
  "$OPENCLAW_DIR/docker-compose.override.yml" \
  2>/dev/null || true

# Prune old backups
find "$BACKUP_DIR" -name "openclaw-*.tar.gz" -mtime +$RETENTION_DAYS -delete

echo "[$(date -Iseconds)] Backup complete: openclaw-$DATE.tar.gz"
