---
doc-type: architecture
maintained-by: self-documenting-system
authored-by: ai
reviewed-by: null
last-updated: 2026-03-20
last-verified: 2026-03-20
source-initiatives:
  - dispatch-center
  - mcp-initiative-governance
  - multi-project-studio
---

> **AI-updated** 2026-03-20 · Awaiting human review
> Sources: dispatch-center, mcp-initiative-governance, multi-project-studio

# Config-as-Code

Project configuration via `sherpa.json` (canonical) or `sherpa.config.ts` (escape hatch for plugins). Tells Sherpa how a project is organized — paths, entities, dispatch routing, vocabulary, theming, plugins, and federated projects.

## Overview

The primary config format is `sherpa.json` at the project root (ADR 0013). The loader (`packages/studio-core/src/config/load-json.ts`) discovers `sherpa.json` or `.sherpa/config.json`, interpolates `${ENV_VAR}` references, and resolves paths. `sherpa.config.ts` remains as an escape hatch for plugins and computed values. All packages read from the resolved `SherpaConfig`.

## Config Schema

Defined in `packages/studio-core/src/config/` (schema.ts, types.ts, defaults.ts):

| Section | Purpose | Example |
|---------|---------|---------|
| `admin` | Project metadata | `{ projectName: "Sherpa", projectDescription: "..." }` |
| `theme` | Visual customization | Accent color, logo |
| `paths` | Directory locations | `{ initiatives: "docs/initiatives", agentRoles: "docs/agents/roles", rules: ".claude/rules", skills: ".claude/skills" }` |
| `vocabulary` | UI terminology overrides | Custom labels for lifecycle stages |
| `entities` | Project references | `{ projectSkillSlugs: ["rr", "integration-review", "plan-tasks"], claudeMdLocations: ["CLAUDE.md"] }` |
| `agents` | Agent role definitions | Role catalog configuration |
| `mcp` | MCP server settings | LM Studio URL, task log paths, port |
| `knowledge` | Search backend | `backend: "algorithmic" | "ollama" | "api"`, embedding provider |
| `governance` | Approval policy | `{ approval: { agents: 'never' \| 'additive-only' \| 'always', requireAuthority: true } }` |
| `dispatch` | Task routing | Backend routes by task-type, fallback, overnight blocklist |
| `plugins` | Extensibility | Plugin factories applied in order |

## Plugin System

```typescript
type SherpaPlugin = (config: SherpaConfig) => SherpaConfig
const myPlugin = createPlugin<TOptions>((options) => (config) => { ...modify config... })
```

Plugins are applied in order during `defineConfig()`. Each receives the current config and returns a modified version. Used for vocabulary overrides, custom dispatch routes, and (future) theme extensions.

## Multi-Project Federation

The `projects` array in `sherpa.json` registers additional projects for Studio to federate. Each project's `root` path supports `${ENV_VAR}` interpolation for environment-specific resolution (local dev vs VPS).

```json
{
  "projects": [
    {
      "name": "WavePoint",
      "slug": "wavepoint",
      "root": "${SHERPA_PROJECTS_DIR}/wavepoint",
      "remote": "git@github.com:robabby/wavepoint.git"
    }
  ]
}
```

Each registered project can have its own `sherpa.json` or `.sherpa/config.json` with project-specific overrides. Projects without a config file use framework defaults.

The `remote` field stores the git URL for future SaaS resolution (Phase 2+). Currently unused at runtime — path resolution uses `root` with env var interpolation.

## `.sherpa/` Dotfolder

Every project that adopts Sherpa gets a `.sherpa/` directory with a standard schema:

```
.sherpa/
  config.json        # Project identity and config overrides
  initiatives/       # Project-specific initiatives
  tasks/             # Project-specific tasks
  research/          # Research output (Luna writes here)
  rules/             # Convention overrides
  skills/            # Project-specific skills
  agents/            # Agent role definitions
  db/                # Databases (gitignored)
```

Scaffolded via `scaffoldDotfolder()` in `packages/studio-core/src/config/dotfolder.ts`. The `db/` directory has a `.gitignore` for `*.db` files. All other directories are committed to git.

## Current Config

```json
// sherpa.json (monorepo root)
{
  "$schema": "https://sherpa.solar/schema.json",
  "admin": {
    "projectName": "Sherpa",
    "projectDescription": "Behavioral agentic collaboration framework"
  },
  "paths": {
    "initiatives": "docs/initiatives",
    "agentRoles": "docs/agents/roles",
    "rules": ".claude/rules",
    "skills": ".claude/skills"
  },
  "entities": {
    "projectSkillSlugs": ["rr", "integration-review", "plan-tasks"],
    "claudeMdLocations": ["CLAUDE.md"],
    "claudeMdScanDirs": []
  },
  "projects": [
    { "name": "WavePoint", "slug": "wavepoint", "root": "${SHERPA_PROJECTS_DIR}/wavepoint" },
    { "name": "Rob Abby", "slug": "robabby", "root": "${SHERPA_PROJECTS_DIR}/robabby" }
  ]
}
```

## Integration Points

- **`withSherpa()`** — Next.js config wrapper (`packages/studio/src/next.ts`). Wraps `next.config.ts` to inject Sherpa's webpack aliases and environment variables.
- **`defineConfig()`** — Main entry point (`packages/studio/src/config.ts`). Validates, merges defaults, applies plugins.
- **Dispatch routing** — `packages/studio-core/src/dispatch.ts` reads `config.dispatch.routes` for task-type → backend mapping.
- **Path resolution** — All packages resolve `config.paths.*` relative to `config.projectRoot`.

## Current State

**Implemented:** `sherpa.json` canonical config with JSON Schema, `defineConfig()` with validation, `loadConfig()` / `loadJsonConfig()` with env var interpolation, project registry, `.sherpa/` dotfolder schema, admin metadata, paths, entities, dispatch routing, MCP settings, knowledge backend config, governance approval policy, plugin system.

**Designed but not integrated:** Vocabulary overrides for UI terminology, theming (accent color, logo), convention inheritance via `extends` field (ESLint flat config model). These arrive with sherpa-framework-extraction.

## Related

- [Execution Pipeline](../execution-pipeline/index.md) — dispatch routing configured here
- [Governance Engine](../governance-engine/index.md) — initiative paths configured here
- [Convention Sync](../convention-sync/index.md) — `sherpa init` will generate this config for new projects

## Decisions

- [0013 — sherpa.json as canonical config format](../../decisions/0013-sherpa-json-canonical-config.md)
- [0014 — Three-directory model](../../decisions/0014-three-directory-model.md)
