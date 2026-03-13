---
status: seed
source-iteration: 1
spawned-from: agentic-workforce
created: 2026-03-06
priority: high
---

# Sherpa Cowork Plugin

## Context

Cowork plugins bundle skills, commands, connectors, and sub-agents for Claude Desktop. The format is almost identical to our existing `.claude/skills/` structure — markdown files with frontmatter, organized into `skills/` (auto-triggered) and `commands/` (explicit slash invocation), wrapped by a `.claude-plugin/plugin.json` manifest. Anthropic's open-source reference: `github.com/anthropics/knowledge-work-plugins` (11 role-based plugins).

Sherpa already has the content: `/rr`, `integration-review`, `pickup`, agent role definitions, design system conventions, domain vocabulary. The gap is packaging and adapting execution paths for Cowork's constraints (no Bash, no Agent tool for parallel dispatch, no Skill tool).

When a Cowork session ran `/rr` for local community discovery, it produced great research but dropped the output in the repo root instead of `docs/initiatives/local-community-discovery/research/` — because it didn't know the initiative directory convention.

## Question

How should Sherpa package its existing skills, conventions, and agent role definitions as a Cowork plugin (or plugin family) so that Claude Desktop sessions can participate in the initiative system, follow the directory conventions, and produce output that Studio can render?

## Suggested Vectors

1. **Plugin structure mapping** — Map each existing Sherpa skill, rule, and convention to the Cowork plugin format. Which become skills (auto-triggered)? Which become commands (explicit)? What goes in plugin.json? Prototype the directory layout.

2. **Sequential /rr adaptation** — The core /rr protocol assumes parallel Agent dispatch (Step 3). Design a sequential variant that works within Cowork's single-thread execution model. Same output format, same directory structure, different execution pattern. How much research quality is lost without parallelism?

3. **MCP connector design** — Cowork plugins support `.mcp.json` for tool connections. Sherpa's `mcp-composable-surface` initiative is designing an MCP server. How would the Cowork plugin connect to Sherpa's computation primitives? Could a Cowork session call `computeCosmicActivity()` via MCP while doing research?

4. **Role-as-plugin vs. mono-plugin** — Should each agent role (Product Manager, Engineer, Astrologer) be its own Cowork plugin with role-specific skills and commands? Or one `sherpa` plugin with all roles as skills? Trade-offs: discoverability, context window efficiency, marketplace presence, maintenance burden.

5. **Bidirectional Studio integration** — When Cowork produces output (research reports, proposals), how does Studio detect and render it? When Studio generates a prompt for Cowork (via "Copy" buttons), what format should that prompt take to be optimal for Cowork's execution model?

## Links

- https://github.com/anthropics/knowledge-work-plugins — Anthropic's open-source plugin reference (11 role-based plugins)
- https://claude.com/blog/cowork-plugins — Plugin announcement and architecture overview
- https://code.claude.com/docs/en/plugins — Plugin creation documentation
- https://claude.com/plugins — Plugin marketplace
- https://support.claude.com/en/articles/13837440-use-plugins-in-cowork — Usage guide
- https://support.claude.com/en/articles/13837433-manage-cowork-plugins-for-your-organization — Admin/marketplace management
