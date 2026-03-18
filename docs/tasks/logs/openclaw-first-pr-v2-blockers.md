# Luna's First PR (v2) — Blockers

**Date:** 2026-03-18T17:47 UTC  
**Agent:** Luna 🌙 (OpenClaw)  
**Task:** `luna/first-contribution` — PR creation blocked

---

## Status: Partially Complete

All local and git steps succeeded. PR creation is blocked by missing GitHub API credentials.

### What Succeeded

- ✅ `git checkout main && git pull origin main` — clean, up to date
- ✅ Deleted old `luna/first-contribution` branch
- ✅ Created fresh `luna/first-contribution` from main
- ✅ Added `## Operational Notes` to `docs/templates/server-provision.md`
- ✅ Committed: `9d23e70 docs: add Luna operational notes to server provision template`
- ✅ `git push -f origin luna/first-contribution` — **succeeded** using OpenClaw's SSH deploy key at `/home/node/.openclaw/ssh/github-deploy`

### What Failed: PR Creation

**`gh` CLI** — Not installed system-wide. Downloaded manually to `/tmp/gh/bin/gh` but `/home/node/.config/gh/` is owned by root (permission denied), and the `GH_CONFIG_DIR` workaround found no stored token.

**GitHub REST API via `curl`** — The task's fallback `curl` command reads a token from `/home/node/.config/gh/hosts.yml`, which is inaccessible (root-owned). No GitHub OAuth token or PAT is available anywhere in:
- Environment variables (`GITHUB_TOKEN`, `GH_TOKEN` — not set)
- OpenClaw config (`/home/node/.openclaw/openclaw.json` — no GitHub section)
- OpenClaw credentials (`/home/node/.openclaw/credentials/` — only Telegram)
- SSH deploy key (`/home/node/.openclaw/ssh/github-deploy`) — covers git push only, not REST API
- `.env.local` or any dotenv files in the repo — none found

### Root Cause

The SSH deploy key handles git operations but GitHub's REST API requires an OAuth token or PAT. The `/home/node/.config/gh/` directory exists but was created by root with no token written to it (probably created during provisioning but never completed).

---

## How to Unblock

**Option 1 (preferred):** Add a GitHub PAT to the OpenClaw environment:
```bash
# On the server, as root or with the correct permissions:
mkdir -p /home/node/.config/gh
chown -R node:node /home/node/.config/gh
cat > /home/node/.config/gh/hosts.yml << EOF
github.com:
    oauth_token: ghp_YOUR_TOKEN_HERE
    git_protocol: ssh
    user: robabby
EOF
```

**Option 2:** Set `GITHUB_TOKEN` in OpenClaw's environment (via `.env.local` or openclaw.json):
```bash
export GITHUB_TOKEN=ghp_YOUR_TOKEN_HERE
```

**Option 3:** Fix the `gh` config directory permissions so Luna can write to it, then `gh auth login`.

Once any of the above is done, the PR command is ready to run:
```bash
GH_CONFIG_DIR=/tmp/gh-config /tmp/gh/bin/gh pr create \
  --title "docs: add Luna's operational notes to server provision template" \
  --body "First contribution from Luna (OpenClaw agent) via Sherpa dispatch pipeline. Adds an Operational Notes section to the server provision template — what works well about the stack, common failure modes observed, and improvement suggestions." \
  --base main \
  --head luna/first-contribution \
  --repo robabby/sherpa
```

Or via curl once a token is available:
```bash
curl -X POST \
  -H "Authorization: token YOUR_TOKEN" \
  -H "Accept: application/vnd.github+json" \
  https://api.github.com/repos/robabby/sherpa/pulls \
  -d '{"title":"docs: add Luna operational notes to server provision template","head":"luna/first-contribution","base":"main","body":"First contribution from Luna (OpenClaw agent) via Sherpa dispatch pipeline.\n\nAdds an ## Operational Notes section to docs/templates/server-provision.md — observations on what works well (Tailscale TLS), common failure modes (config ownership drift), and improvement suggestions (automated provisioning, health-check cron, non-root deploy user)."}'
```

### Branch Status

The branch `luna/first-contribution` is **live on GitHub** with the commit. It just needs a PR opened against `main`.
