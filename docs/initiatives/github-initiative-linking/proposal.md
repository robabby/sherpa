---
status: pending
initiative: github-initiative-linking
created: 2026-03-13
updated: '2026-03-13'
type: new-plan
risk: evolutionary
targets:
  - packages/studio-core/src/config/types.ts
  - packages/studio-core/src/config/defaults.ts
  - packages/studio-core/src/activity-links.ts
  - packages/studio-core/src/schemas.ts
  - packages/studio-core/src/github.ts              # (new file)
  - packages/studio-ui/src/initiative-prs-section.tsx # (new file)
  - apps/studio/src/app/process/[slug]/page.tsx
  - apps/studio/sherpa.config.ts
dependencies: []
spawned-from: null
---

## Summary

Associate GitHub PRs with initiatives bidirectionally. PRs created from `initiative/<slug>` branches are automatically discovered via `gh` CLI, and initiative detail pages in Studio display linked PRs with status. The hardcoded WavePoint repo URL in `activity-links.ts` is replaced with a configurable `github.repo` setting in `sherpa.config.ts`.

## State Snapshot

**Config** — `SherpaUserConfig` in `packages/studio-core/src/config/types.ts` has no GitHub-related settings. No `github` section exists.

**Activity links** — `packages/studio-core/src/activity-links.ts` hardcodes `const REPO_URL = "https://github.com/robabby/wavepoint/pull"` (line 4). PR references like `(#343)` in activity descriptions are parsed into clickable links, but they always point to the WavePoint repo.

**Initiative frontmatter** — `initiativeFrontmatterSchema` in `packages/studio-core/src/schemas.ts` (line 19) has no PR-related fields.

**Branch convention** — `.claude/rules/worktree-conventions.md` documents `initiative/<slug>` as the branch pattern for initiative worktrees. This naming convention already creates a natural mapping between branches/PRs and initiatives, but nothing surfaces it.

**Initiative detail page** — `apps/studio/src/app/process/[slug]/page.tsx` renders lifecycle bar, targets, file tree, and proposal content. No PR section exists.

**GitHub integration** — Zero `gh` CLI usage, no Octokit, no GitHub API calls anywhere in the codebase.

## Proposed Changes

### 1. Config: Add `github` section

Add a `GitHubConfig` interface to `types.ts` with `repo` (owner/name format, e.g. `"robabby/sherpa"`) and `defaultBranch` (defaults to `"main"`). Add to `SherpaUserConfig` and `SherpaConfig`. Set defaults in `defaults.ts` (empty string = disabled). Update `buildDefaults()` to merge.

Update `sherpa.config.ts` to set `github.repo` for this project.

### 2. Activity links: Use config repo URL

Replace the hardcoded `REPO_URL` in `activity-links.ts` with a function that accepts a repo string parameter. Consumers pass the configured repo value. Falls back to current behavior when no repo is configured.

### 3. PR discovery utility

New `packages/studio-core/src/github.ts` exporting:
- `discoverInitiativePRs(slug, repo)` — shells out to `gh pr list --repo <repo> --head initiative/<slug> --json number,title,state,url,updatedAt` to find PRs associated with an initiative by branch naming convention.
- Returns typed PR summary objects. Handles `gh` CLI not being available gracefully (returns empty array).

### 4. Studio UI: PR section component

New `packages/studio-ui/src/initiative-prs-section.tsx` — renders a list of linked PRs with number, title, status badge (open/merged/closed), and link. Styled consistently with the existing Targets and Contents sections on the initiative detail page.

### 5. Wire into initiative detail page

Add the PR section to `apps/studio/src/app/process/[slug]/page.tsx` between the Targets and Contents sections. Server component calls the discovery utility at render time. Only renders when `github.repo` is configured and PRs are found.

## Rationale

**Convention-based over manual tracking.** The `initiative/<slug>` branch naming convention already exists and is documented. Building on it means zero manual work to associate PRs — the link is implicit in the branch name. This is more reliable than maintaining a `prs` array in frontmatter that drifts.

**`gh` CLI over GitHub API.** The `gh` CLI is already authenticated in development environments and avoids token management. It's a reasonable dependency for a developer tool. The utility degrades gracefully when `gh` isn't available.

**Config over hardcoding.** The current hardcoded WavePoint URL is a framework extraction artifact. Making it configurable serves both Sherpa's own repo and any future adopter.

## Dependencies

None.

## Review Notes

**Edge cases:**
- Initiatives with PRs from non-convention branches (e.g. `feat/some-feature` that relates to an initiative) won't be auto-discovered. This is acceptable for v1 — manual activity log references with `(#N)` still work.
- Multiple PRs per initiative (common for large initiatives with phased work) are supported — the discovery returns all matching PRs.
- `gh` CLI not installed or not authenticated returns an empty list with no error.

**Trade-offs:**
- PR discovery shells out to `gh` on each page render. For v1 this is fine (dev tool, not production). Caching can be added later if needed.
- No GitHub-side automation (labels, PR body templates) in this scope. That's a separate concern that could be a follow-on.

**Effort:** 2 sessions
**Session breakdown:**
- Session 1: Config addition (`GitHubConfig`), `activity-links.ts` refactor to use config, `github.ts` discovery utility, schema — all in `studio-core`
- Session 2: `initiative-prs-section.tsx` UI component, wire into detail page, update `sherpa.config.ts`, verify end-to-end
