# Vector 5: MCP Server Distribution

**Question:** How are MCP servers currently packaged and distributed in the wild?
**Agent dispatched:** 2026-03-11

## Findings

### 1. Distribution Patterns

**npm via npx is the dominant distribution pattern for TypeScript/Node.js MCP servers.** Every official Anthropic reference server follows the same template:

- `package.json` with `"type": "module"`, a `bin` entry pointing to `dist/index.js`, and `@modelcontextprotocol/sdk` as a dependency
- Shebang `#!/usr/bin/env node` at top of entry file
- Build step: `tsc && shx chmod +x dist/*.js` (compile TypeScript, make executable)
- `files: ["dist"]` to ship only compiled output
- Users run via `npx -y @scope/package-name` -- no global install required

Concrete evidence from `npm view`:
- `@modelcontextprotocol/server-filesystem`: `"bin": {"mcp-server-filesystem": "dist/index.js"}`
- `@modelcontextprotocol/server-memory`: `"bin": {"mcp-server-memory": "dist/index.js"}`
- `@modelcontextprotocol/server-github`: `"bin": {"mcp-server-github": "dist/index.js"}`

**Breakdown by frequency:**
- npm/npx: ~60% of all MCP servers (dominant for TypeScript ecosystem)
- pip/uvx: ~25% (Python ecosystem, especially data/ML tools)
- Docker: ~10% (enterprise, complex dependencies)
- .mcpb bundles: emerging (Claude Desktop specific)
- Standalone binaries (Go/Rust): rare

**MCP Bundles (.mcpb)** are a newer Anthropic-specific format — ZIP archives containing a manifest.json + server files. Aimed at Claude Desktop one-click install. CLI: `@anthropic-ai/mcpb`.

### 2. Configuration

**Three configuration mechanisms are standard:**

1. **CLI arguments** — passed via `args` in config (e.g., filesystem server takes allowed paths as args)
2. **Environment variables** — passed via `env` in config (standard for secrets/API keys)
3. **Config files** — less common for MCP servers themselves; more common at client level

**Claude Code scopes:**
- **Local** (default): `~/.claude.json` under project path. Private to user + project.
- **Project**: `.mcp.json` at repo root. Checked into version control, shared with team.
- **User**: `~/.claude.json` global section. Available across all projects.

Environment variable expansion supports `${VAR}` and `${VAR:-default}` syntax.

### 3. Project Context Discovery

**This is a known pain point with no standardized solution:**

- For stdio servers launched via npx/uvx, `process.cwd()` returns the npm cache path, NOT the user's project directory
- The MCP spec does not currently define a way to pass workspace context to servers
- There is no `CLAUDE_CODE_CWD` environment variable (pending feature request)

**Common patterns:**
1. **Explicit env var**: `TASKS_DIR=/path/to/docs/tasks` passed in config
2. **Git root detection**: `git rev-parse --show-toplevel`
3. **CLI argument**: Pass the project root as an argument
4. **`cwd` in config**: Set `"cwd": "${HOME}/projects/my-project"`

### 4. Registries & Directories

**Official MCP Registry** (in preview): registry.modelcontextprotocol.io
- Metadata-only (points to npm/PyPI/Docker)
- Namespace auth via reverse DNS: `io.github.username/server-name`
- Publishing via `mcp-publisher` CLI tool

**Community directories:**
- mcp.so — 18,378+ servers, largest third-party collection
- mcpservers.org — synced with awesome-mcp-servers GitHub repo
- Docker MCP Catalog — 270+ enterprise-grade containerized servers

### 5. Multi-Tool Organization

**Tool naming convention:** `snake_case`, action-oriented, service-prefixed (e.g., `slack_send_message`).

**Tiered tool loading (Task Master pattern):** The `task-master-ai` package exposes 36 tools but supports tiered modes:
- `core` (7 tools, ~5K tokens)
- `standard` (15 tools, ~10K tokens)
- `all` (36 tools, ~21K tokens)

**Claude Code Tool Search:** When MCP tool definitions exceed 10% of context window, Claude Code automatically defers tool loading. Reduces context consumption by ~85%.

### 6. Comparable Task Management MCP Servers

| Server | Distribution | Tools | Storage | Config |
|--------|-------------|-------|---------|--------|
| task-master-ai | npm (`npx -y`) | 36 (tiered) | `.taskmaster/` directory | env vars |
| mcp-shrimp-task-manager | git clone | ~10 | `DATA_DIR` env var | `.mcp.json` + env |
| mcp-task-manager-server | git clone | ~8 | SQLite | env vars |
| todoist-mcp (official Doist) | npm | ~12 | Todoist API | API key env |

### 7. Anthropic's Official Packaging Guidance

**Recommended project structure:**
```
{service}-mcp-server/
  package.json
  tsconfig.json
  README.md
  src/
    index.ts           # McpServer init
    types.ts
    tools/             # Tool implementations
    services/          # API clients
    schemas/           # Zod validation
  dist/                # Built output
```

**2026 MCP Roadmap priorities:** Transport evolution (HTTP, `.well-known` discovery), Agent communication (Tasks primitive), Governance maturation, Enterprise readiness.

## Sources

- [Build an MCP server](https://modelcontextprotocol.io/docs/develop/build-server) — Official build tutorial
- [MCP Registry quickstart](https://modelcontextprotocol.io/registry/quickstart) — Publishing guide
- [2026 MCP Roadmap](http://blog.modelcontextprotocol.io/posts/2026-mcp-roadmap/) — Priority areas
- [Claude Code MCP docs](https://code.claude.com/docs/en/mcp) — Full configuration reference
- [npm - @modelcontextprotocol/sdk](https://www.npmjs.com/package/@modelcontextprotocol/sdk) — Official SDK
- [npm - server-filesystem](https://www.npmjs.com/package/@modelcontextprotocol/server-filesystem) — Reference server
- [Anthropic skills MCP builder](https://github.com/anthropics/skills/blob/main/skills/mcp-builder/reference/node_mcp_server.md) — Project structure guide
- [claude-task-master](https://github.com/eyaltoledano/claude-task-master) — Comparable product
- [Docker MCP Catalog](https://www.docker.com/blog/docker-mcp-catalog-secure-way-to-discover-and-run-mcp-servers/) — Container distribution
- [MCP Bundles](https://www.mcpbundles.com/docs/concepts/mcpb-files) — Desktop extension format
- [mcp.so](https://mcp.so/) — Largest MCP directory (18K+ servers)
- [Tool search docs](https://platform.claude.com/docs/en/agents-and-tools/tool-use/tool-search-tool) — Deferred tool loading

## Raw Links

- https://modelcontextprotocol.io/docs/develop/build-server
- https://modelcontextprotocol.io/docs/learn/architecture
- https://modelcontextprotocol.io/registry/quickstart
- https://modelcontextprotocol.io/registry/about
- https://registry.modelcontextprotocol.io/
- https://github.com/modelcontextprotocol/registry
- https://github.com/modelcontextprotocol/servers
- http://blog.modelcontextprotocol.io/posts/2026-mcp-roadmap/
- http://blog.modelcontextprotocol.io/posts/2025-09-08-mcp-registry-preview/
- https://code.claude.com/docs/en/mcp
- https://platform.claude.com/docs/en/agents-and-tools/tool-use/tool-search-tool
- https://www.npmjs.com/package/@modelcontextprotocol/sdk
- https://www.npmjs.com/package/@modelcontextprotocol/server-filesystem
- https://www.npmjs.com/package/@modelcontextprotocol/server-memory
- https://www.npmjs.com/package/@anthropic-ai/mcpb
- https://github.com/anthropics/skills/blob/main/skills/mcp-builder/reference/node_mcp_server.md
- https://github.com/anthropics/mcpb
- https://github.com/eyaltoledano/claude-task-master
- https://github.com/cjo4m06/mcp-shrimp-task-manager
- https://github.com/punkpeye/awesome-mcp-servers
- https://github.com/modelcontextprotocol/servers/issues/3029
- https://github.com/modelcontextprotocol/python-sdk/issues/1520
- https://mcp.so/
- https://mcpservers.org/
- https://mcpmarket.com/
- https://mcp-awesome.com/
- https://docs.docker.com/ai/mcp-catalog-and-toolkit/toolkit/
- https://www.docker.com/blog/docker-mcp-catalog-secure-way-to-discover-and-run-mcp-servers/
- https://www.mcpbundles.com/docs/concepts/mcpb-files
- https://www.anthropic.com/engineering/desktop-extensions
- https://www.aihero.dev/publish-your-mcp-server-to-npm
- https://github.blog/ai-and-ml/github-copilot/meet-the-github-mcp-registry-the-fastest-way-to-discover-mcp-servers/
- https://www.stainless.com/mcp/mcp-server-configuration-best-practices
- https://dev.to/saleor/dynamic-configuration-for-mcp-servers-using-environment-variables-2a0o
- https://code.visualstudio.com/docs/copilot/customization/mcp-servers
- https://www.pulsemcp.com/posts/agentic-mcp-configuration
- https://claudefa.st/blog/tools/mcp-extensions/mcp-tool-search
- https://docs.litellm.ai/docs/mcp_control
- https://mastra.ai/reference/tools/mcp-client
- https://pypi.org/project/mcp/
- https://pypi.org/project/fastmcp/

## Implications

**npm package with `npx` execution is the clear path.** Sherpa task MCP should be `@sherpa/task-mcp-server`, matching Anthropic's naming convention. Key design decisions: decouple from bun (use `#!/usr/bin/env node`), three-tier project root discovery (env var → git root → cwd), and separate LM Studio dispatch into an optional extension. Register on the MCP Registry via `mcp-publisher`.

## Open Questions

1. Should dispatch capability stay in the standalone MCP server or be project-specific?
2. How to version task file frontmatter schema as it evolves?
3. Include NDJSON event logger in package or make optional?
4. npm scope: `@sherpa/task-mcp-server` vs `@sherpa-studio/tasks`?
5. Should the server expose task files as MCP Resources (for IDE @ mentions)?
6. MCP Registry namespace — DNS auth vs GitHub auth?
