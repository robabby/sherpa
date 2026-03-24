#!/usr/bin/env bash
# OpenClaw gateway health check with rotating checks
# Install: add to root crontab on VPS
#   */5 * * * * /home/openclaw/sherpa/scripts/vps/openclaw-health.sh
#
# Runs the most overdue check on each invocation.
# Logs to /mnt/sherpa-data/data/openclaw/health.log
#
# Assumes native install: openclaw-gateway.service (systemd), user openclaw

set -euo pipefail

STATE_FILE="/mnt/sherpa-data/data/openclaw/health-state.json"
LOG_FILE="/mnt/sherpa-data/data/openclaw/health.log"
GATEWAY_URL="http://127.0.0.1:18789"
SERVICE_NAME="openclaw-gateway"
OPENCLAW_USER="openclaw"
NOW=$(date +%s)

log() {
  echo "[$(date -Iseconds)] $1" >> "$LOG_FILE"
}

# Initialize state file if missing
if [ ! -f "$STATE_FILE" ]; then
  cat > "$STATE_FILE" << 'EOF'
{
  "gateway_health": 0,
  "service_status": 0,
  "disk_usage": 0,
  "stale_sessions": 0,
  "config_ownership": 0
}
EOF
fi

# Read last-run timestamps
gateway_last=$(jq -r '.gateway_health // 0' "$STATE_FILE")
service_last=$(jq -r '.service_status // 0' "$STATE_FILE")
disk_last=$(jq -r '.disk_usage // 0' "$STATE_FILE")
sessions_last=$(jq -r '.stale_sessions // 0' "$STATE_FILE")
ownership_last=$(jq -r '.config_ownership // 0' "$STATE_FILE")

# Cadences (seconds)
GATEWAY_CADENCE=300       # 5 min
SERVICE_CADENCE=900       # 15 min
DISK_CADENCE=3600         # 1 hr
SESSIONS_CADENCE=21600    # 6 hr
OWNERSHIP_CADENCE=43200   # 12 hr

# Calculate overdue scores (higher = more overdue)
gateway_overdue=$(( (NOW - gateway_last) - GATEWAY_CADENCE ))
service_overdue=$(( (NOW - service_last) - SERVICE_CADENCE ))
disk_overdue=$(( (NOW - disk_last) - DISK_CADENCE ))
sessions_overdue=$(( (NOW - sessions_last) - SESSIONS_CADENCE ))
ownership_overdue=$(( (NOW - ownership_last) - OWNERSHIP_CADENCE ))

# Find most overdue check
max_overdue=$gateway_overdue
check="gateway_health"

if [ $service_overdue -gt $max_overdue ]; then
  max_overdue=$service_overdue
  check="service_status"
fi
if [ $disk_overdue -gt $max_overdue ]; then
  max_overdue=$disk_overdue
  check="disk_usage"
fi
if [ $sessions_overdue -gt $max_overdue ]; then
  max_overdue=$sessions_overdue
  check="stale_sessions"
fi
if [ $ownership_overdue -gt $max_overdue ]; then
  max_overdue=$ownership_overdue
  check="config_ownership"
fi

# If nothing is overdue, exit
if [ $max_overdue -le 0 ]; then
  exit 0
fi

# Run the selected check
case "$check" in
  gateway_health)
    status=$(curl -s -o /dev/null -w "%{http_code}" -m 5 "$GATEWAY_URL/health" 2>/dev/null || echo "000")
    if [ "$status" = "200" ]; then
      log "OK gateway responding (HTTP $status)"
    else
      log "WARN gateway unhealthy (HTTP $status) — attempting restart"
      systemctl restart "$SERVICE_NAME" 2>/dev/null
      sleep 5
      retry=$(curl -s -o /dev/null -w "%{http_code}" -m 5 "$GATEWAY_URL/health" 2>/dev/null || echo "000")
      if [ "$retry" = "200" ]; then
        log "OK gateway recovered after restart"
      else
        log "CRIT gateway still down after restart (HTTP $retry)"
      fi
    fi
    ;;

  service_status)
    if systemctl is-active --quiet "$SERVICE_NAME"; then
      uptime=$(systemctl show "$SERVICE_NAME" --property=ActiveEnterTimestamp --value)
      mem=$(systemctl show "$SERVICE_NAME" --property=MemoryCurrent --value)
      mem_mb=$((mem / 1048576))
      log "OK $SERVICE_NAME active since $uptime (${mem_mb}MB)"
    else
      log "WARN $SERVICE_NAME not active — attempting restart"
      systemctl start "$SERVICE_NAME" 2>/dev/null
      sleep 3
      if systemctl is-active --quiet "$SERVICE_NAME"; then
        log "OK $SERVICE_NAME recovered after start"
      else
        log "CRIT $SERVICE_NAME failed to start"
      fi
    fi
    ;;

  disk_usage)
    usage=$(df /mnt/sherpa-data --output=pcent | tail -1 | tr -d ' %')
    if [ "$usage" -lt 80 ]; then
      log "OK disk usage: ${usage}%"
    elif [ "$usage" -lt 90 ]; then
      log "WARN disk usage: ${usage}% — consider cleanup"
    else
      log "CRIT disk usage: ${usage}% — immediate action needed"
    fi
    ;;

  stale_sessions)
    session_dir="/mnt/sherpa-data/data/openclaw/config/agents/main/sessions"
    if [ -d "$session_dir" ]; then
      stale=$(find "$session_dir" -name "*.jsonl" -mtime +1 2>/dev/null | wc -l)
      if [ "$stale" -gt 0 ]; then
        find "$session_dir" -name "*.jsonl" -mtime +1 -delete 2>/dev/null
        log "OK cleared $stale stale session files (>24hr old)"
      else
        log "OK no stale sessions"
      fi
    else
      log "OK session directory not found (no sessions to clean)"
    fi
    ;;

  config_ownership)
    config_dir="/mnt/sherpa-data/data/openclaw"
    bad_owner=$(find "$config_dir" ! -user "$OPENCLAW_USER" 2>/dev/null | head -5)
    if [ -z "$bad_owner" ]; then
      log "OK config ownership correct ($OPENCLAW_USER)"
    else
      chown -R "$OPENCLAW_USER:$OPENCLAW_USER" "$config_dir"
      log "WARN fixed config ownership drift — ran chown"
    fi
    ;;
esac

# Update state with current timestamp
jq --arg check "$check" --argjson now "$NOW" '.[$check] = $now' "$STATE_FILE" > "${STATE_FILE}.tmp" \
  && mv "${STATE_FILE}.tmp" "$STATE_FILE"
