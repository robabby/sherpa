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
docs/
  initiatives/    Initiative directories (proposal → plan → activity → implementation)
  agents/roles/   Behavioral agent role definitions
.claude/
  rules/          Convention files (auto-load via globs)
  skills/         Skill commands (/rr, /integration-review, /plan-tasks)
.worktrees/       Git worktrees for isolated work
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

**Research & Architecture.** The framework is being extracted from WavePoint (`../wavepoint/docs/initiatives/sherpa-framework-extraction/`). This repo is the destination — starting with research initiatives that will inform the Sherpa consulting business and framework design.

## Conventions

Cross-cutting conventions auto-load from `.claude/rules/` based on file globs:

- `initiative-convention.md` — directoturtle structure, proposal format, activity logs
- `behavioral-engineering.md` — agent roles use behavioral constraints, not identity claims
- `effort-estimation.md` — sessions as unit of effort, not calendar time
- `claude-md-standards.md` — CLAUDE.md authoring rules
- `worktree-conventions.md` — naming, lifecycle, cleanup

## Skills

- `/rr` — Recursive research. The discovery engine for initiatives.
- `/integration-review` — Batch review of pending proposals.
- `/plan-tasks` — Break approved initiatives into dispatchable tasks.

## Docs

| File | Purpose |
|------|---------|
| `docs/initiatives/` | Initiative directories — research, proposals, plans |
| `docs/agents/roles/` | Behavioral agent role definitions |
