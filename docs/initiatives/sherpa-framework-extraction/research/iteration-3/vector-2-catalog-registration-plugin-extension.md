# Vector 2: Catalog Registration & Plugin Extension

**Question:** How should plugins register domain-specific catalog entries (primitives, API endpoints, agent roles) into framework catalogs? Can behavioral agent catalogs be distributed as Claude Code plugins?
**Agent dispatched:** 2026-03-11

## Findings

### 1. Payload CMS: Config Transformation Pattern

- **Plugin type is a pure function**: `Plugin = (config: Config) => Config | Promise<Config>` ([source](https://github.com/payloadcms/payload/blob/main/packages/payload/src/config/types.ts), [docs](https://payloadcms.com/docs/plugins/overview))
- **Collections are added by spreading**: Plugins spread `incomingConfig.collections` and append new entries:
  ```ts
  const config: Config = {
    ...incomingConfig,
    collections: [
      ...incomingConfig.collections,
      newCollection,
    ],
  }
  ```
  ([Build Your Own Plugin](https://payloadcms.com/docs/plugins/build-your-own), [Tutorial](https://payloadcms.com/posts/blog/tutorial-building-your-own-payload-plugin))
- **Function properties cannot be spread** -- they must be wrapped: execute the existing function, then run additional logic ([Build Your Own Plugin](https://payloadcms.com/docs/plugins/build-your-own))
- **Plugins execute after validation but before sanitization** -- they receive valid config but can still reshape it before defaults are applied ([Plugins Overview](https://payloadcms.com/docs/plugins/overview))
- **No registration API** -- there is no `plugin.register(collection)`. Everything is config transformation. This makes plugins composable (plugin A's output is plugin B's input) and predictable.

### 2. Backstage: Imperative Extension Point Registration

- **CatalogBuilder** provides imperative registration: `builder.addEntityProvider(provider)` and `builder.addProcessor(processor)` ([External Integrations](https://backstage.io/docs/features/software-catalog/external-integrations/))
- **EntityProvider interface** is minimal: just `getProviderName(): string` and `connect(connection: EntityProviderConnection): Promise<void>` ([EntityProvider Reference](https://backstage.io/docs/reference/plugin-catalog-node.entityprovider/))
- **EntityProviderConnection** supports two mutation types: `'full'` (replace entire bucket) and `'delta'` (upsert/delete individual entities) ([External Integrations](https://backstage.io/docs/features/software-catalog/external-integrations/))
- **catalogProcessingExtensionPoint** is the typed interface exposing `addEntityProvider()`, `addProcessor()`, and `addEntityPolicy()` ([GitHub source](https://github.com/backstage/backstage/issues/15455), [Extending the Model](https://backstage.io/docs/features/software-catalog/extending-the-model/))
- **New backend system uses `createBackendModule`**: Modules declare dependencies on extension points, then register providers in `init()`:
  ```ts
  export const catalogModuleFrobsProvider = createBackendModule({
    pluginId: 'catalog',
    moduleId: 'frobs-provider',
    register(env) {
      env.registerInit({
        deps: { catalog: catalogProcessingExtensionPoint },
        async init({ catalog }) {
          catalog.addEntityProvider(new FrobsProvider());
        },
      });
    },
  });
  ```
  ([Extension Points](https://backstage.io/docs/backend-system/architecture/extension-points/))

### 3. Backstage Extension Points: Typed Registration Surfaces

- **Extension points are created via `createExtensionPoint<T>`** with a unique `id` string ([Extension Points](https://backstage.io/docs/backend-system/architecture/extension-points/))
- **Plugins register implementations** using `env.registerExtensionPoint(extensionPointRef, implementation)` ([Extension Points](https://backstage.io/docs/backend-system/architecture/extension-points/))
- **Extension points are exported from `-node` packages** (e.g., `@backstage/plugin-catalog-node`), keeping modules decoupled from plugin internals
- **Design principle: additions only** -- extension points follow an "add, don't remove" pattern since modules can simply be uninstalled
- **Initialization order guarantee**: all module contributions complete before plugin initialization, so the plugin sees the fully populated registry

### 4. Claude Code Plugin System: Complete Distribution Mechanism

- **Plugins distribute 7 component types**: skills, agents, hooks, MCP servers, LSP servers, commands, and output styles ([Plugins Reference](https://code.claude.com/docs/en/plugins-reference))
- **Agent definitions** are Markdown files with YAML frontmatter in `agents/` directory. Supported frontmatter: `name`, `description`, `tools`, `disallowedTools`, `model`, `permissionMode`, `maxTurns`, `skills`, `mcpServers`, `hooks`, `memory`, `background`, `isolation` ([Subagents](https://code.claude.com/docs/en/sub-agents))
- **Skills are SKILL.md directories** under `skills/` -- they follow the Agent Skills standard ([Plugins Reference](https://code.claude.com/docs/en/plugins-reference))
- **Plugins CANNOT directly distribute `.claude/rules/` files** -- they distribute agents and skills, not raw rule files. However, **agent frontmatter can preload skills** via the `skills:` field
- **Path traversal is blocked**: installed plugins cannot reference files outside their directory
- **Installation scopes**: user, project, local, managed ([Plugins Reference](https://code.claude.com/docs/en/plugins-reference))
- **9,000+ plugins** exist as of Feb 2026 ([Morph guide](https://www.morphllm.com/claude-code-plugins))

### 5. Agent Skills Standard: Cross-Agent Portability

- **Originated at Anthropic, now open standard** under agentskills.io ([Overview](https://agentskills.io/home))
- **Adopted by 31+ agents**: Claude Code, Cursor, Codex, Gemini CLI, VS Code Copilot, Junie, Goose, Roo Code, OpenHands, and more ([Overview](https://agentskills.io/home))
- **Progressive disclosure model**: Discovery (name + description, ~100 tokens) -> Activation (full SKILL.md, <5000 tokens) -> Execution
- **No catalog registry mechanism** in the standard itself -- skills are discovered by filesystem scanning
- **Skill collections exist as Claude Code plugins** -- a plugin's `skills/` directory can contain multiple skills

### 6. Config-Based vs Imperative: Payload Wins for Sherpa

- **Payload (config-based)**: `collections: [...existing, ...new]` -- pure function, composable, no ordering dependency, fully typed, serializable
- **Backstage (imperative)**: `catalog.addEntityProvider(new Provider())` -- runtime registration, ordering matters, hard to inspect full state, but more flexible for async/dynamic providers
- **For 3-5 static catalog types**, config-based is clearly better: static data, fully known at startup, no async needed, TypeScript validates full shape
- **Backstage's imperative approach** is designed for dynamic providers -- overkill for Sherpa's static catalogs

## Implications

### Use Payload's config transformation pattern for catalog registration

The curried plugin `(options) => (config) => modifiedConfig` maps directly to Payload's `Plugin` type. Catalog entries are just another config property to spread:

```ts
const myPlugin = (options) => (config) => ({
  ...config,
  catalogs: {
    ...config.catalogs,
    primitives: [...(config.catalogs?.primitives ?? []), ...options.primitives],
    endpoints: [...(config.catalogs?.endpoints ?? []), ...options.endpoints],
    roles: [...(config.catalogs?.roles ?? []), ...options.roles],
  },
});
```

### Behavioral agent catalogs CAN be distributed as Claude Code plugins

The mapping:
- Behavioral agent `.md` files → plugin's `agents/` directory (subagent definitions)
- `disposition`, `behavioral-constraints`, `fail-triggers`, `quality-bar` → agent Markdown body (system prompt)
- `tool-permissions` → `tools`/`disallowedTools` in Claude Code frontmatter
- `model-tier` → `model` in Claude Code frontmatter
- `skills` → `skills` in Claude Code frontmatter

**Gaps**: Schema translation layer needed. Claude Code plugins cannot distribute `.claude/rules/` files. `context-packages` are inherently project-local.

### Plugin structure for Sherpa

```
sherpa-studio-plugin/
  .claude-plugin/
    plugin.json
  agents/          # Behavioral agents in Claude Code format
    judge.md
    architect.md
    code-reviewer.md
  skills/          # Agent Skills format
    plan-tasks/SKILL.md
    morning/SKILL.md
    integration-review/SKILL.md
  hooks/
    hooks.json
  .mcp.json        # Sherpa MCP server
```

## Sources

### Payload CMS
- [Payload Plugins Overview](https://payloadcms.com/docs/plugins/overview)
- [Building Your Own Plugin](https://payloadcms.com/docs/plugins/build-your-own)
- [Tutorial: Building Your Own Plugin](https://payloadcms.com/posts/blog/tutorial-building-your-own-payload-plugin)
- [Config Types Source](https://github.com/payloadcms/payload/blob/main/packages/payload/src/config/types.ts)

### Backstage
- [External Integrations](https://backstage.io/docs/features/software-catalog/external-integrations/)
- [EntityProvider Reference](https://backstage.io/docs/reference/plugin-catalog-node.entityprovider/)
- [Extension Points](https://backstage.io/docs/backend-system/architecture/extension-points/)
- [Extending the Model](https://backstage.io/docs/features/software-catalog/extending-the-model/)

### Claude Code Plugins
- [Plugins Reference](https://code.claude.com/docs/en/plugins-reference)
- [Create Plugins](https://code.claude.com/docs/en/plugins)
- [Subagents](https://code.claude.com/docs/en/sub-agents)
- [Plugin Marketplaces](https://code.claude.com/docs/en/plugin-marketplaces)

### Agent Skills Standard
- [agentskills.io Overview](https://agentskills.io/home)
- [SKILL.md Specification](https://www.mdskills.ai/specs/skill-md)

## Raw Links

- https://payloadcms.com/docs/plugins/overview
- https://payloadcms.com/docs/plugins/build-your-own
- https://payloadcms.com/posts/blog/tutorial-building-your-own-payload-plugin
- https://github.com/payloadcms/payload/blob/main/packages/payload/src/config/types.ts
- https://payloadcms.com/docs/configuration/collections
- https://payloadcms.com/docs/configuration/overview
- https://payloadcms.com/docs/plugins/mcp
- https://payloadcms.com/docs/plugins/search
- https://github.com/payloadcms/payload/discussions/5046
- https://github.com/payloadcms/payload/issues/7494
- https://backstage.io/docs/features/software-catalog/external-integrations/
- https://backstage.io/docs/reference/plugin-catalog-node.entityprovider/
- https://backstage.io/docs/backend-system/architecture/extension-points/
- https://backstage.io/docs/features/software-catalog/extending-the-model/
- https://github.com/backstage/backstage/blob/master/plugins/catalog-backend/src/service/CatalogBuilder.ts
- https://backstage.io/docs/plugins/plugin-development/
- https://backstage.io/docs/plugins/backend-plugin/
- https://backstage.io/docs/overview/architecture-overview/
- https://github.com/backstage/backstage/issues/15455
- https://betterprogramming.pub/building-backstage-catalog-providers-9c144b2e6e7b
- https://roadie.io/blog/creating-backstage-entityproviders-at-runtime/
- https://code.claude.com/docs/en/plugins-reference
- https://code.claude.com/docs/en/plugins
- https://code.claude.com/docs/en/sub-agents
- https://code.claude.com/docs/en/plugin-marketplaces
- https://code.claude.com/docs/en/skills
- https://code.claude.com/docs/en/hooks
- https://code.claude.com/docs/en/mcp
- https://code.claude.com/docs/en/settings
- https://code.claude.com/docs/en/agent-teams
- https://github.com/anthropics/claude-plugins-official
- https://github.com/cased/claude-code-plugins
- https://www.morphllm.com/claude-code-plugins
- https://agentskills.io/home
- https://www.mdskills.ai/specs/skill-md
- https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview
- https://developers.openai.com/codex/skills/
- https://docs.github.com/en/copilot/concepts/agents/about-agent-skills
- https://spring.io/blog/2026/01/13/spring-ai-generic-agent-skills/
- https://www.mintlify.com/blog/skill-md
- https://github.com/anthropics/skills
- https://github.com/agentskills/agentskills
- https://github.com/hesreallyhim/awesome-claude-code
- https://github.com/VoltAgent/awesome-claude-code-subagents
- https://buildwithclaude.com/
- https://claude-plugins.dev/
- https://skillsmp.com

## Open Questions

1. **Schema translation fidelity**: How much of the Behavioral Agent schema (disposition, fail-triggers, quality-bar, escalation) survives translation to Claude Code's simpler subagent format?
2. **Multi-plugin catalog collision**: If two plugins contribute `roles` entries with the same slug, who wins? Payload uses last-plugin-wins. Sherpa needs a policy.
3. **Plugin vs project-level agent override**: Claude Code's priority system (CLI > project > user > plugin) means project agents override plugin agents. Could this cause confusion with updated behavioral constraints?
4. **Cross-agent portability of behavioral constraints**: `fail-triggers` and `quality-bar` don't exist in the Agent Skills standard. Flattening into system prompt text loses structured data for programmatic Judge evaluation.
5. **Convention sync as plugin distribution**: Can plugin hooks trigger `sherpa sync`, or must convention sync live outside the plugin system?
