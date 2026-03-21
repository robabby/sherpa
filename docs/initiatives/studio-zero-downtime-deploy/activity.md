---
started: 2026-03-20
worktree: null
---

# Studio Zero-Downtime Deploy — Activity Log

## 2026-03-20

- Initiative approved, implementation started
- Previous session: proposal written, plan written, deploy.sh drafted, standalone output added to next.config.ts
- This session: executing plan — repo commits, VPS setup, first deploy, verification
- Standalone build verified locally, committed next.config.ts + deploy.sh
- VPS: created /opt/sherpa/ structure, systemd template, updated Caddyfile
- Hit Caddy permissions issue (uid 999 can't read root-only files) — fixed with chmod 755/644
- Hit Tailscale port conflict (tailscale serve on 3000 → EADDRINUSE) — removed Tailscale serve, changed HOSTNAME to 127.0.0.1
- First deploy successful: green slot active
- Verified all three modes: full deploy, --skip-build, --rollback
- Updated sherpa-sync.sh to call deploy.sh for sherpa repo
- Documentation updated in server-provision.md
- /integrate run, changelog updated
- Initiative complete — status: integrated

## Seeds

- **Deploy notifications** — Slack/Telegram notification on deploy success/failure. Surfaced during cron integration — the 15-minute deploy runs silently. → Could be a small addition to deploy.sh or a separate initiative if it needs MCP integration.
- **Health check endpoint** — Studio doesn't have a dedicated `/healthz` endpoint; the deploy script curls the root (which returns 307 auth redirect). A proper health route would be more reliable and could report version/slot info. Scoped out as unnecessary for v1.
- **Client deployment pipeline** — The proposal notes this pattern can be adapted for client VPS deployments. Already tracked as `client-deployment-pipeline` in `informs:` field.
- **Log rotation for deploy logs** — `/var/log/sherpa/sync.log` will grow unbounded. Listed in server-provision.md Future Additions but not addressed.
