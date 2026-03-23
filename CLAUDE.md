# Sherpa

Behavioral agentic collaboration framework. A toolkit for running Human+AI collaborative workflows using filesystem-based governance, behavioral agent definitions, and AI-native process conventions.

## Three Entities

| Entity | What |
|--------|------|
| `@sherpa/studio` | The framework — npm packages (studio-core, studio-ui, studio-mcp, studio-cli) |
| Sherpa Consulting (sherpa.solar) | AI & Digital Transformation consulting company. Uses the framework. |
| WavePoint | First customer. Astrology platform where the framework was developed. Source repo: `../wavepoint` |

## Structure

```
apps/
  studio/         Next.js 16 Studio app (Tailwind v4, shadcn/ui)    [pnpm workspace]
packages/
  studio-core/    @sherpa/studio-core — domain logic, types, schemas [pnpm workspace]
  studio-ui/      @sherpa/studio-ui — 91 React components            [pnpm workspace]
  studio-mcp/     @sherpa/studio-mcp — MCP server                    [pnpm workspace]
  studio/         @sherpa/studio — umbrella (withSherpa, defineConfig)[pnpm workspace]
docs/
  initiatives/    Initiative directories (proposal → plan → activity → implementation)
  agents/roles/   Behavioral agent role definitions
.claude/
  rules/          Convention files (auto-load via globs)
  skills/         Skill commands (/rr, /integration-review, /plan-tasks)
.worktrees/       Git worktrees for isolated work
```

## Workspace

pnpm monorepo. All packages and apps are workspace members.

```bash
pnpm dev          # Studio dev server (localhost:3000)
pnpm build        # Studio production build
pnpm check        # Typecheck all packages
pnpm install      # Install all dependencies
```

## The Seven Pillars

1. **Behavioral Agent System** — role definitions with behavioral constraints, not identity claims
2. **Governance Engine** — initiative lifecycle, directoturtle convention, integration review
3. **Execution Pipeline** — Planner/Worker/Judge dispatch, task board, MCP server
4. **Studio Application** — shadcn/ui visualization of agentic workflows
5. **Executable Conventions** — skills, rules, CLAUDE.md templates, hooks
6. **Config-as-Code** — `sherpa.config.ts` with `defineConfig()`, vocabulary, theming, plugins
7. **Convention Sync CLI** — `sherpa init`, `sherpa sync`, provenance tracking

## Current Phase

**Monorepo with Studio.** The `@sherpa/studio-*` packages have been extracted from WavePoint. The Studio app runs against Sherpa's own governance data (initiatives, rules, skills, agents). WavePoint-specific panels (primitives, API catalog, transit content, portfolio) are stubbed out.

## Conventions

Cross-cutting conventions auto-load from `.claude/rules/` based on file globs:

- `initiative-convention.md` — directoturtle structure, proposal format, activity logs
- `behavioral-engineering.md` — agent roles use behavioral constraints, not identity claims
- `effort-estimation.md` — sessions as unit of effort, not calendar time
- `claude-md-standards.md` — CLAUDE.md authoring rules
- `worktree-conventions.md` — naming, lifecycle, cleanup

## Dispatch

```bash
./scripts/dispatch.sh <role-slug>       # Interactive: launch CLI for a role
./scripts/worker.sh <task-slug>         # Headless: dispatch a task to its backend
./scripts/auto-judge.sh <task-slug>     # Judge: review completed task
./scripts/dispatch-queue.sh --pending   # Queue: dispatch all pending tasks
```

Task CRUD is via Linear (MCP tools: `task_list`, `task_get`, `task_create`, `task_update`).

9 backends: 5 CLI (`claude`, `opencode`, `codex`, `gemini`, `lm-studio`), 3 API (`groq`, `google-ai`, `lm-studio-api`), 1 gateway (`openclaw` — remote OpenClaw agent via WebSocket protocol v3). Routing configured in `sherpa.config.ts` dispatch section. Task-type determines backend; `openclaw` is explicit-only (set `backend: openclaw` on the task).

## Skills

- `/rr` — Recursive research. The discovery engine for initiatives.
- `/integration-review` — Batch review of pending proposals.
- `/plan-tasks` — Break approved initiatives into dispatchable tasks.

## Docs

| File | Purpose |
|------|---------|
| `docs/initiatives/` | Initiative directories — research, proposals, plans |
| `docs/agents/roles/` | Behavioral agent role definitions |
| `docs/templates/server-provision.md` | Hetzner VPS provisioning runbook — standard stack, volume layout, security baseline |
