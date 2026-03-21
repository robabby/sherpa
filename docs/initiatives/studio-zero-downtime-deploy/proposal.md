---
status: integrated
initiative: studio-zero-downtime-deploy
created: 2026-03-19
updated: '2026-03-20'
started: '2026-03-20'
type: new-plan
risk: evolutionary
targets:
  - apps/studio/next.config.ts
  - scripts/deploy.sh                                    # (new file)
  - docs/templates/server-provision.md
dependencies: []
informs:
  - client-deployment-pipeline
spawned-from: null
---

## Summary

Replace the in-place build-and-restart deploy with blue-green slot swapping for Sherpa Studio on the Hetzner VPS. Next.js standalone output goes to alternating deploy directories, Caddy's upstream swaps atomically via an imported snippet file + graceful reload, and systemd service templates manage per-slot instances. Zero external dependencies — everything runs on the existing Caddy + systemd + Node.js stack.

## State Snapshot

**Studio app** (`apps/studio/`) — Next.js 16.1 app. Build: `next build` → `.next/`. Start: `next start` on port 3000. No `output` setting in `next.config.ts` (defaults to non-standalone). The `withSherpa()` wrapper in `next.config.ts` adds no output-related config.

**VPS deploy process** — Luna's 15-minute git sync cron (`/root/sherpa-sync.sh`) pulls latest, runs `pnpm install` + `pnpm build`, restarts the `sherpa-studio` systemd service. During `next build`, the `.next/` directory is overwritten — the running instance can fail to serve static assets with content-hashed filenames that no longer exist. During the restart, there's a 2-5 second gap where no instance is serving.

**Caddy** (`/etc/caddy/Caddyfile`) — reverse proxies `studio.sherpa.solar` to `localhost:3000` (Studio) and `localhost:3100` (MCP). Studio upstream is hardcoded. Caddy supports graceful reload (`systemctl reload caddy`) which drains in-flight connections before switching to new config.

**MCP server** (`packages/studio-mcp/src/http-server.ts`) — runs on port 3100 via `SHERPA_MCP_PORT` env var. Has a graceful SIGTERM handler that closes sessions and databases. Lightweight startup (~1 second). Agent-facing only — brief restart is acceptable.

**systemd** — `sherpa-studio.service` and `sherpa-mcp.service` exist as simple services with `EnvironmentFile=/root/sherpa/.env.production`. Not templated.

## Proposed Changes

### 1. Next.js standalone output (`apps/studio/next.config.ts`)

Add `output: 'standalone'` to the Next.js config. This produces a self-contained `.next/standalone/` directory with a minimal `server.js`, traced dependencies, and the monorepo workspace packages — everything needed to run the app without `node_modules/` or `next start`. The standalone server respects `PORT` and `HOSTNAME` env vars.

Static files (`.next/static/`) and `public/` are not included in standalone output and must be copied alongside it during deploy.

### 2. Deploy script (`scripts/deploy.sh`)

A bash script that orchestrates the blue-green swap:

1. Read active slot from `/opt/sherpa/active` (defaults to `blue`)
2. Determine standby slot and its port (blue=3000, green=3001)
3. `git pull` + `pnpm install --frozen-lockfile` + `pnpm build`
4. Copy standalone output + static files to `/opt/sherpa/<standby>/`
5. Start standby instance via `systemctl start sherpa-studio@<standby>`
6. Health-check the standby port (curl loop, 30s timeout)
7. Write new upstream to `/opt/sherpa/studio-upstream.caddy` and `systemctl reload caddy`
8. Stop old instance via `systemctl stop sherpa-studio@<active>`
9. Write new active slot to `/opt/sherpa/active`
10. Restart MCP server (simple `systemctl restart sherpa-mcp`)

On health-check failure: stop the standby instance and exit non-zero without touching Caddy or the active slot. The old instance keeps serving.

### 3. VPS infrastructure (manual setup, documented in server-provision template)

- **Deploy directory:** `/opt/sherpa/` with `blue/`, `green/`, `active` state file, per-slot env files (`blue.env` with `PORT=3000`, `green.env` with `PORT=3001`)
- **systemd template:** `sherpa-studio@.service` — parameterized by slot name (`%i`). WorkingDirectory `/opt/sherpa/%i/apps/studio`, EnvironmentFile `/opt/sherpa/%i.env` + `/root/sherpa/.env.production`, ExecStart `node server.js`
- **Caddy snippet:** `/opt/sherpa/studio-upstream.caddy` containing a single `reverse_proxy localhost:<port>` directive. Main Caddyfile imports this inside a `handle` block instead of hardcoding the upstream
- **Cron update:** Replace the existing sync cron with a call to `scripts/deploy.sh`

### 4. Server provision template (`docs/templates/server-provision.md`)

Add a "Blue-Green Deploy" section documenting the deploy directory layout, systemd template, Caddyfile changes, and how the deploy script works. This becomes part of the standard VPS provisioning runbook.

## Rationale

**Why blue-green over build-then-restart:** Build-then-restart reduces downtime from minutes to seconds but doesn't eliminate it. Blue-green eliminates it entirely — the old instance serves traffic until the new one is verified healthy. The complexity cost is low: one deploy script, one systemd template, one Caddy snippet file.

**Why standalone output:** Without standalone, both instances would share the same `.next/` directory. During `next build`, content-hashed static files get replaced, breaking the running instance's ability to serve them. Standalone mode produces a self-contained copy that can be deployed to an independent directory.

**Why not containers:** Studio isn't containerized today. Adding Docker for zero-downtime deploys would introduce container image management, registry concerns, and operational overhead that aren't justified for a single app on a single box. The systemd + Caddy approach achieves the same result with tools already on the box.

**Why Caddyfile snippet + reload over admin API:** The Caddy admin API can swap upstreams atomically, but requires knowing the exact JSON path into the running config. A snippet file + reload is more transparent (readable on disk), more resilient (survives Caddy restarts), and Caddy's reload is already graceful (drains connections).

## Dependencies

None. The VPS, Caddy, and systemd infrastructure all exist.

The `client-deployment-pipeline` initiative (pending) will benefit from this pattern — the deploy script can be adapted for client VPS deployments.

## Review Notes

**MCP server is not blue-green'd.** It's agent-facing, starts in ~1 second, and has a graceful shutdown handler. A simple restart after the Studio swap is acceptable. Blue-green for MCP can be added later if needed.

**Standalone in a monorepo:** Next.js standalone traces workspace dependencies and preserves the monorepo directory structure in `.next/standalone/`. The server entry point is at `apps/studio/server.js` relative to the standalone root, not at the monorepo root. The deploy script accounts for this path.

**Rollback:** Swap back by starting the previous slot, updating the Caddy snippet, and reloading. The old slot's files are untouched until the next deploy.

**Effort:** 2 sessions
**Session breakdown:**
- Session 1: Repo changes (standalone config, deploy script), VPS setup (directories, systemd template, Caddyfile update)
- Session 2: First deploy run, end-to-end verification, cron migration, server-provision.md documentation
