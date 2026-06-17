# Sherpa

Governance engine for Human+AI collaboration. Filesystem-based governance, behavioral role conventions, and provenance tracking — the process layer that works alongside your AI development tools (Claude Code) rather than dispatching agents itself.

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
  studio-ui/      @sherpa/studio-ui — React components               [pnpm workspace]
  studio-mcp/     @sherpa/studio-mcp — MCP governance + knowledge API [pnpm workspace]
  studio/         @sherpa/studio — umbrella (withSherpa, defineConfig)[pnpm workspace]
docs/
  initiatives/    Initiative directories (proposal → shape → plan → integrate)
  agents/roles/   Behavioral role definitions (authored conventions)
.claude/
  rules/          Convention files (auto-load via globs)
  skills/         Skill commands (/rr, /propose, /shape, /design, /integrate)
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

## The Pillars

1. **Governance Engine** — initiative lifecycle (propose → shape → plan → integrate), directoturtle convention, integration review
2. **Provenance & Drift** — maintained docs track authorship/review/verification; git-aware drift flags docs whose related code moved (`studio-core/doc-drift`)
3. **Behavioral Role Conventions** — role definitions with behavioral constraints, not identity claims
4. **Studio Application** — shadcn/ui pane-of-glass over the governance lifecycle; observes Claude Code sessions
5. **Executable Conventions** — skills, rules, CLAUDE.md templates, hooks
6. **Config-as-Code** — `sherpa.config.ts` with `defineConfig()`, vocabulary, theming, plugins
7. **Convention Sync CLI** — `sherpa init`, `sherpa sync`, provenance tracking

## Operating Model

**Pane of glass.** The governance lifecycle is driven *through Claude Code* (the skills below + the MCP governance API). Studio reads, visualizes, verifies, and surfaces provenance/drift — the one write it owns is the human **mark-verified** action. Autonomous agent execution is delegated to external tools (Claude Code, OpenClaw), not run by Studio.

## Current Phase

**Governance refocus.** Studio does one thing — the governance lifecycle. The autonomous-agent dispatch layer has been removed (see `docs/initiatives/studio-governance-refocus/`). The MCP server exposes governance (`initiative_*`) + knowledge (`search_knowledge`, `get_summary`, …) tools; the Sessions surface reflects real Claude Code logs.

## Conventions

Cross-cutting conventions auto-load from `.claude/rules/` based on file globs:

- `initiative-convention.md` — directoturtle structure, proposal format, activity logs
- `behavioral-engineering.md` — role definitions use behavioral constraints, not identity claims
- `effort-estimation.md` — sessions as unit of effort, not calendar time
- `claude-md-standards.md` — CLAUDE.md authoring rules
- `worktree-conventions.md` — naming, lifecycle, cleanup
- `provenance-convention.md` — doc provenance frontmatter, banners, drift

## Skills

- `/rr` — Recursive research. The discovery engine for initiatives.
- `/propose` · `/shape` · `/design` — turn an idea into a scoped, designed initiative.
- `/integrate` · `/integration-review` — fold completed work into the docs with provenance.

## Docs

| File | Purpose |
|------|---------|
| `docs/initiatives/` | Initiative directories — research, proposals, plans |
| `docs/architecture/` | System architecture (maintained docs with provenance) |
| `docs/agents/roles/` | Behavioral role definitions |
