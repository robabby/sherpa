---
id: openclaw-first-pr-v2
status: completed
role: research-lead
priority: medium
initiative: vps-remote-compute
backend: openclaw
model: null
task-type: research
mode: supervised
budget-usd: 0
worktree: null
branch: null
created: 2026-03-18T00:00:00Z
dispatched-at: 2026-03-18T17:47:25
completed-at: 2026-03-18T17:54:51
judge-verdict: pending
---

# Luna's First PR (v2)

## Objective

You have the sherpa codebase at your workspace. Git SSH and push are now configured. Complete these steps:

1. Switch to main and pull latest: `git checkout main && git pull origin main`
2. Check if branch `luna/first-contribution` exists. If so, delete it: `git branch -D luna/first-contribution`
3. Create a fresh branch: `git checkout -b luna/first-contribution`
4. Add a new section at the very end of `docs/templates/server-provision.md` called `## Operational Notes`. Write 3-5 sentences from your perspective as Luna — what you've observed about this infrastructure, what works well, and what you'd improve. Be genuine.
5. Commit: `git commit -am "docs: add Luna operational notes to server provision template"`
6. Push: `git push -f origin luna/first-contribution`
7. Open a PR using the `gh` command. NOTE: `gh` may not be installed — if not, use `curl` with the GitHub API instead:
   ```
   curl -X POST -H "Authorization: token $(cat /home/node/.config/gh/hosts.yml | grep oauth_token | awk '{print $2}')" \
     -H "Accept: application/vnd.github+json" \
     https://api.github.com/repos/robabby/sherpa/pulls \
     -d '{"title":"docs: Luna operational notes","head":"luna/first-contribution","base":"main","body":"First contribution from Luna via Sherpa dispatch pipeline."}'
   ```
8. Report the PR URL.

## Acceptance Criteria

- Branch created, committed, pushed
- PR opened on GitHub
- PR URL reported

## Deliverables

An open PR URL.
