# Sherpa

A behavioral collaboration framework for Human+AI development workflows — filesystem-based governance, behavioral agent definitions, and a dispatch pipeline that takes work from proposal to integration with review at every step.

**Website & docs:** [sherpa.solar](https://sherpa.solar) · **First customer:** [WavePoint](https://github.com/robabby/wavepoint), the codebase the framework was extracted from. Sherpa also governs its own development: the conventions, skills, and initiative lifecycle in this repo are the production system, not documentation about one.

> Status: active development. The packages are consumed as workspace dependencies and are not yet published to npm.

## What's here

```
apps/
  studio/         Studio app — Next.js 16 visualization of agentic workflows
  website/        sherpa.solar — marketing site + Fumadocs documentation
packages/
  studio-core/    Domain logic: types, schemas, initiative lifecycle, tasks
  studio-ui/      ~110 React components for governance UX
  studio-mcp/     MCP server — task CRUD, knowledge base, authority tools
  studio-cli/     `sherpa init` / `sherpa sync` — convention sync with three-way merge
  studio/         Umbrella package: defineConfig, withSherpa
docs/
  initiatives/    Initiative directories — proposal → plan → activity → integration
  agents/roles/   Behavioral agent role definitions
.claude/
  rules/          Conventions that auto-load by file path
  skills/         /rr (recursive research), /integration-review, /plan-tasks
```

## The ideas

- **Behavioral agents, not personas.** Roles are defined by constraints ("default to NEEDS WORK, require evidence") rather than identity claims ("you are an expert") — a distinction supported by published research on role prompting.
- **Governance in the filesystem.** Initiatives, proposals, activity logs, and conventions live in git, version with the code, and work with any AI development environment.
- **Execution pipeline.** A Planner/Worker/Judge loop dispatches tasks across nine backends (CLI agents, local and hosted APIs), routed by task type.
- **Conventions as code.** Cross-cutting rules load automatically by file glob; a CLI syncs them across consuming repos with provenance tracking.

## Quick start

```bash
pnpm install      # install all workspace packages
pnpm dev          # Studio dev server (localhost:3000)
pnpm check        # typecheck all packages
pnpm build        # production build
```

## Learn more

- [sherpa.solar/docs](https://sherpa.solar/docs) — getting started, concepts, reference
- [sherpa.solar/framework](https://sherpa.solar/framework) — the seven pillars
- `docs/initiatives/` — how work actually flows through this repo
- Built by [Rob Abby](https://robabby.com)
