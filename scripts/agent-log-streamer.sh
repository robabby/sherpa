#!/usr/bin/env bash
# scripts/agent-log-streamer.sh — Sidecar log-to-NDJSON streamer
#
# Tails a .log file and emits agent_output events to an NDJSON events file.
# Designed to run alongside backend dispatch processes (Claude, Codex, Gemini)
# and bridge their stdout/stderr into the NDJSON event stream that the SSE
# endpoint watches via fs.watch.
#
# Usage: agent-log-streamer.sh <log-file> <events-file> <task-slug>

set -euo pipefail

# ── Usage ──────────────────────────────────────────────────────────────
if [[ $# -lt 3 ]]; then
  echo "Usage: agent-log-streamer.sh <log-file> <events-file> <task-slug>" >&2
  echo "  Tails a .log file and emits agent_output events to an NDJSON events file." >&2
  exit 1
fi

LOG_FILE="$1"
EVENTS_FILE="$2"
TASK_SLUG="$3"

POLL_INTERVAL=2       # seconds between reads
WAIT_POLL_MS=0.5      # seconds between existence checks
WAIT_TIMEOUT=60       # seconds to wait for log file

BATCH=0
BYTE_OFFSET=0
FLUSHING=0

# ── ANSI stripping ────────────────────────────────────────────────────
strip_ansi() {
  sed 's/\x1b\[[0-9;]*[a-zA-Z]//g'
}

# ── Emit a batch of lines as an agent_output event ───────────────────
emit_batch() {
  local raw_chunk="$1"

  # Strip ANSI codes
  local clean
  clean=$(printf '%s' "$raw_chunk" | strip_ansi)

  # Skip empty chunks (no actual content after stripping)
  if [[ -z "$clean" ]]; then
    return
  fi

  BATCH=$((BATCH + 1))

  # Use node for safe JSON encoding of the lines array
  local json_line
  json_line=$(node -e "
    const input = process.argv[1];
    const lines = input.split('\n');
    // Remove trailing empty line from split (common with trailing newline)
    if (lines.length > 0 && lines[lines.length - 1] === '') lines.pop();
    const ts = new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');
    const event = {
      timestamp: ts,
      event: 'agent_output',
      source: 'log-streamer',
      taskSlug: process.argv[2],
      batch: parseInt(process.argv[3], 10),
      byteOffset: parseInt(process.argv[4], 10),
      lineCount: lines.length,
      lines: lines
    };
    process.stdout.write(JSON.stringify(event));
  " "$clean" "$TASK_SLUG" "$BATCH" "$BYTE_OFFSET")

  echo "$json_line" >> "$EVENTS_FILE"
}

# ── Read new bytes from the log file ─────────────────────────────────
read_new_bytes() {
  local file_size
  file_size=$(stat -f%z "$LOG_FILE" 2>/dev/null || echo 0)

  if [[ "$file_size" -le "$BYTE_OFFSET" ]]; then
    return
  fi

  local count=$((file_size - BYTE_OFFSET))

  # Use dd for precise byte-offset reads
  local chunk
  chunk=$(dd if="$LOG_FILE" bs=1 skip="$BYTE_OFFSET" count="$count" 2>/dev/null) || return

  local start_offset=$BYTE_OFFSET
  BYTE_OFFSET=$file_size

  if [[ -n "$chunk" ]]; then
    # Temporarily set BYTE_OFFSET to start for the event
    local saved=$BYTE_OFFSET
    BYTE_OFFSET=$start_offset
    emit_batch "$chunk"
    BYTE_OFFSET=$saved
  fi
}

# ── SIGTERM handler: flush remaining bytes and exit ──────────────────
cleanup() {
  FLUSHING=1
  # Final flush
  if [[ -f "$LOG_FILE" ]]; then
    read_new_bytes
  fi
  exit 0
}
trap cleanup SIGTERM SIGINT

# ── Phase 1: Wait for log file to exist ──────────────────────────────
elapsed=0
while [[ ! -f "$LOG_FILE" ]]; do
  if (( $(echo "$elapsed >= $WAIT_TIMEOUT" | bc -l) )); then
    echo "ERROR: Timed out waiting for log file: $LOG_FILE" >&2
    exit 1
  fi
  sleep "$WAIT_POLL_MS"
  elapsed=$(echo "$elapsed + $WAIT_POLL_MS" | bc -l)
done

# ── Phase 2: Poll loop ──────────────────────────────────────────────
# Fast batch (500ms) for first 10 seconds to catch quick tasks,
# then normal interval (2s) for steady-state streaming.
LOOP_COUNT=0
while true; do
  read_new_bytes
  if [[ $LOOP_COUNT -lt 20 ]]; then
    # First 10 seconds: 500ms interval (20 iterations × 0.5s)
    sleep 0.5
  else
    sleep "$POLL_INTERVAL"
  fi
  LOOP_COUNT=$((LOOP_COUNT + 1))
done
