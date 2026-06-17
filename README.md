# Sherpa

A governance engine for Human+AI development workflows — filesystem-based governance, behavioral role conventions, and provenance tracking that takes work from proposal to integration. The process layer that works alongside your AI tools (Claude Code) rather than dispatching agents itself.

**Website & docs:** [sherpa.solar](https://sherpa.solar) · **First customer:** [WavePoint](https://github.com/robabby/wavepoint), the codebase the framework was extracted from. Sherpa also governs its own development: the conventions, skills, and initiative lifecycle in this repo are the production system, not documentation about one.

> Status: active development. The packages are consumed as workspace dependencies and are not yet published to npm.

## What's here

```
apps/
  studio/         Studio app — Next.js 16 pane-of-glass over the governance lifecycle
  website/        sherpa.solar — marketing site + Fumadocs documentation
packages/
  studio-core/    Domain logic: types, schemas, initiative lifecycle, provenance/drift
  studio-ui/      React components for governance UX
  studio-mcp/     MCP server — governance + knowledge API
  studio-cli/     `sherpa init` / `sherpa sync` — convention sync with three-way merge
  studio/         Umbrella package: defineConfig, withSherpa
docs/
  initiatives/    Initiative directories — proposal → shape → plan → integrate
  agents/roles/   Behavioral role definitions (authored conventions)
.claude/
  rules/          Conventions that auto-load by file path
  skills/         /rr, /propose, /shape, /design, /integrate, /integration-review
```

## The ideas

- **Governance in the filesystem.** Initiatives, proposals, activity logs, and conventions live in git, version with the code, and work with any AI development environment.
- **Provenance & drift.** Every maintained doc tracks who authored, reviewed, and verified it; git-aware drift flags docs whose related code has moved since they were last verified.
- **Behavioral roles, not personas.** Roles are defined by constraints ("default to NEEDS WORK, require evidence") rather than identity claims ("you are an expert") — a distinction supported by published research on role prompting.
- **Pane of glass.** Studio observes and governs the work you do in Claude Code; it doesn't dispatch agents itself. Conventions sync across consuming repos via the CLI with provenance tracking.

## Quick start

```bash
pnpm install      # install all workspace packages
pnpm dev          # Studio dev server (localhost:3000)
pnpm check        # typecheck all packages
pnpm build        # production build
```

## Learn more

- [sherpa.solar/docs](https://sherpa.solar/docs) — getting started, concepts, reference
- [sherpa.solar/framework](https://sherpa.solar/framework) — the pillars
- `docs/initiatives/` — how work actually flows through this repo
- Built by [Rob Abby](https://robabby.com)
