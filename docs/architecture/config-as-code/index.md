---
doc-type: architecture
maintained-by: self-documenting-system
authored-by: ai
reviewed-by: null
last-updated: 2026-03-17
last-verified: 2026-03-17
source-initiatives:
  - dispatch-center
  - mcp-initiative-governance
---

> **AI-updated** 2026-03-17 · Awaiting human review
> Sources: dispatch-center, mcp-initiative-governance

# Config-as-Code

Project configuration via `sherpa.config.ts` using the `defineConfig()` pattern. The single file that tells Sherpa how a project is organized — paths, entities, dispatch routing, vocabulary, theming, and plugins.

## Overview

Every Sherpa project has a `sherpa.config.ts` at its root (currently `apps/studio/sherpa.config.ts` — will move to monorepo root). The `defineConfig()` function validates the config, merges defaults, applies plugins, and resolves the project root. All packages read from this resolved config.

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

## Current Config

```typescript
// apps/studio/sherpa.config.ts
export default defineConfig({
  projectRoot: path.resolve(process.cwd(), "../.."),
  admin: {
    projectName: "Sherpa",
    projectDescription: "Behavioral agentic collaboration framework",
  },
  paths: {
    initiatives: "docs/initiatives",
    agentRoles: "docs/agents/roles",
    rules: ".claude/rules",
    skills: ".claude/skills",
  },
  entities: {
    projectSkillSlugs: ["rr", "integration-review", "plan-tasks"],
    claudeMdLocations: ["CLAUDE.md"],
  },
})
```

## Integration Points

- **`withSherpa()`** — Next.js config wrapper (`packages/studio/src/next.ts`). Wraps `next.config.ts` to inject Sherpa's webpack aliases and environment variables.
- **`defineConfig()`** — Main entry point (`packages/studio/src/config.ts`). Validates, merges defaults, applies plugins.
- **Dispatch routing** — `packages/studio-core/src/dispatch.ts` reads `config.dispatch.routes` for task-type → backend mapping.
- **Path resolution** — All packages resolve `config.paths.*` relative to `config.projectRoot`.

## Current State

**Implemented:** `defineConfig()` with validation, admin metadata, paths, entities, dispatch routing, MCP settings, knowledge backend config, governance approval policy, plugin system.

**Designed but not integrated:** Vocabulary overrides for UI terminology, theming (accent color, logo), convention sync configuration. These arrive with sherpa-framework-extraction.

## Related

- [Execution Pipeline](../execution-pipeline/index.md) — dispatch routing configured here
- [Governance Engine](../governance-engine/index.md) — initiative paths configured here
- [Convention Sync](../convention-sync/index.md) — `sherpa init` will generate this config for new projects

## Decisions

- None extracted yet — config decisions are implicit in the current schema shape. As the schema stabilizes through framework extraction, explicit decisions will emerge.
