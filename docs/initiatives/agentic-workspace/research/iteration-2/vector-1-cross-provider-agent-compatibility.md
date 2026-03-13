# Vector 1: Cross-Provider Agent Compatibility

**Question:** How do AGENTS.md, MCP, Agent Skills, and convention files work across different LLM providers and coding agents?

## Convention File Formats: The Fragmentation Landscape

Every major AI coding agent has its own convention/rules file format:

| Tool | Convention File | Format | Glob Support |
|------|----------------|--------|--------------|
| Claude Code | `CLAUDE.md`, `.claude/rules/*.md` | Markdown with YAML frontmatter | Yes (globs in frontmatter) |
| OpenAI Codex | `AGENTS.md` | Plain markdown | No (proximity-based) |
| Gemini CLI | `GEMINI.md` | Plain markdown | No (hierarchical dirs) |
| Cursor | `.cursor/rules/*.mdc` | MDC (markdown + YAML frontmatter) | Yes (glob patterns) |
| Windsurf | `.windsurfrules` | Flat markdown | No |
| GitHub Copilot | `.github/copilot-instructions.md` | Flat markdown | No |
| VS Code (custom agents) | `chatSkills` contribution point | Extension API | N/A |

**Key finding:** Only Claude Code and Cursor support glob-scoped rules. All others use flat markdown or directory hierarchy. This means Sherpa's `.claude/rules/*.md` with glob frontmatter is the most expressive format — but also the least portable.

Sources:
- [AGENTS.md official site — 24+ supporting platforms](https://agents.md/)
- [Gemini CLI GEMINI.md documentation](https://geminicli.com/docs/cli/gemini-md/)
- [Gemini CLI configuration (GitHub)](https://github.com/google-gemini/gemini-cli/blob/main/docs/get-started/configuration.md)
- [Cursor rules documentation](https://cursor.com/docs/context/rules)
- [Cursor vs CLAUDE.md vs Copilot Instructions comparison](https://www.agentrulegen.com/guides/cursorrules-vs-claude-md)

## AGENTS.md: The Cross-Provider Standard

AGENTS.md has achieved the broadest adoption as a convention file standard:

- **60,000+ repos** with AGENTS.md files ([GitHub code search](https://github.com/search?q=path%3AAGENTS.md+NOT+is%3Afork+NOT+is%3Aarchived&type=code))
- **24+ platforms** support it: OpenAI Codex, Google Jules, Google Gemini CLI, Cursor, Windsurf, GitHub Copilot, Factory, Aider, goose, opencode, Zed, Warp, VS Code, Devin, UiPath Autopilot, JetBrains Junie, Amp, RooCode, Kilo Code, Phoenix, Semgrep, Ona, Augment Code ([agents.md](https://agents.md/))
- Stewarded by AAIF under the Linux Foundation
- Format is deliberately minimal: standard markdown, no required fields, no schema — "agents simply parse the text provided"
- Nested AGENTS.md files in subdirectories take precedence (same pattern as CLAUDE.md)

**Critical insight:** AGENTS.md won adoption through simplicity. It has no glob patterns, no YAML frontmatter, no structured schema. This makes it universally parseable but less expressive than Claude Code's rules system.

Sources:
- [AGENTS.md specification](https://agents.md/)
- [OpenAI AGENTS.md guide](https://developers.openai.com/codex/guides/agents-md/)
- [Factory AGENTS.md documentation](https://docs.factory.ai/cli/configuration/agents-md)
- [OpenAI Codex AGENTS.md on GitHub](https://github.com/openai/codex/blob/main/AGENTS.md)
- [Gemini CLI AGENTS.md discussion (#1471)](https://github.com/google-gemini/gemini-cli/discussions/1471)
- [Android Studio AGENTS.md customization](https://developer.android.com/studio/gemini/agent-files)

## MCP: Universal Tool Protocol

MCP adoption is near-universal across major providers:

- **97 million monthly SDK downloads** (Python + TypeScript combined)
- **5,800+ public MCP servers** in registries
- **All major providers adopted:** Anthropic (native), OpenAI (March 2025, remote servers May 2025), Google/Gemini (April 2025), Microsoft/VS Code (Nov 2025 spec revision)
- Donated to AAIF (Linux Foundation) in December 2025

Provider-specific MCP adoption timeline:
- **Anthropic:** Native from launch (Nov 2024)
- **OpenAI:** Adopted March 2025, remote MCP servers May 2025, App Directory (MCP-based) December 2025
- **Google:** Demis Hassabis confirmed April 2025, managed MCP servers for all Google Cloud services December 2025
- **Microsoft:** VS Code MCP support, spec revision 2025-11-25 with URL mode elicitation and task support

Sources:
- [MCP Wikipedia article](https://en.wikipedia.org/wiki/Model_Context_Protocol)
- [Anthropic donates MCP to AAIF](https://www.anthropic.com/news/donating-the-model-context-protocol-and-establishing-of-the-agentic-ai-foundation)
- [Google managed MCP servers announcement](https://techcrunch.com/2025/12/10/google-is-going-all-in-on-mcp-servers-agent-ready-by-design/)
- [Google Cloud MCP blog](https://cloud.google.com/blog/products/ai-machine-learning/announcing-official-mcp-support-for-google-services)
- [MCP one-year retrospective (Pento)](https://www.pento.ai/blog/a-year-of-mcp-2025-review)
- [MCP one-year retrospective (Zuplo)](https://zuplo.com/blog/one-year-of-mcp)
- [MCP enterprise adoption guide](https://guptadeepak.com/the-complete-guide-to-model-context-protocol-mcp-enterprise-adoption-market-trends-and-implementation-strategies/)
- [Why MCP won (The New Stack)](https://thenewstack.io/why-the-model-context-protocol-won/)
- [MCP 2026 automation predictions (Hallam)](https://hallam.agency/blog/how-mcp-will-supercharge-ai-automation-in-2026/)

## Convention Portability Tools

The fragmentation has spawned a cottage industry of rule conversion tools:

**rule-porter** (MIT, zero-dep CLI):
- Converts between Cursor, CLAUDE.md, AGENTS.md, Copilot, Windsurf
- Bidirectional conversion
- Glob patterns become markdown comments in flat formats (with warnings)
- Manual-attach rules flagged for review
- `npx rule-porter --to agents-md` / `--to claude-md` / `--to copilot` / `--to windsurf`
- [GitHub: nedcodes-ok/rule-porter](https://github.com/nedcodes-ok/rule-porter)
- [Cursor forum announcement](https://forum.cursor.com/t/rule-porter-convert-your-mdc-rules-to-claude-md-agents-md-or-copilot/153197)
- [DEV.to writeup](https://dev.to/nedcodes/rule-porter-convert-cursor-rules-to-claudemd-agentsmd-and-copilot-4hjc)

**rulesync** (Node.js CLI):
- Generates configuration for various AI tools from unified rule files
- Supports rules, commands, MCP, ignore files, subagents, and skills
- [GitHub: dyoshikawa/rulesync](https://github.com/dyoshikawa/rulesync)
- [DEV.to writeup](https://dev.to/dyoshikawatech/rulesync-published-a-tool-to-unify-management-of-rules-for-claude-code-gemini-cli-and-cursor-390f)
- [Reading.sh writeup](https://reading.sh/stop-managing-8-different-ai-rule-files-rulesync-does-it-all-e6e2769c215f)

**rulebook-ai** (template-based):
- Treats AI operational context as a portable "Environment" (Rules + Context + Tools)
- `project sync` command generates format-specific files from universal templates
- Supports Cursor, Gemini CLI, Copilot, Codex CLI, Cline, RooCode, Windsurf, Warp, Kilo Code
- [GitHub: botingw/rulebook-ai](https://github.com/botingw/rulebook-ai)

**ai-rules-sync**:
- Synchronize, manage, and share AI rules, skills, commands, subagents
- Supports Cursor, Claude Code, Copilot, OpenCode, Trae AI, Codex, Gemini CLI, Warp
- [GitHub: lbb00/ai-rules-sync](https://github.com/lbb00/ai-rules-sync)

**ruler** (multiple implementations):
- [nicavcrm/ruler](https://github.com/nicavcrm/ruler) — Cursor and Copilot converter
- [intellectronica/ruler](https://github.com/intellectronica/ruler) — Apply same rules to all agents

**agentic-coding-rulebook**:
- Production-ready collection of configuration files for professional AI-assisted coding
- [GitHub: obviousworks/agentic-coding-rulebook](https://github.com/obviousworks/agentic-coding-rulebook)

**Agent Rules Builder** (web tool):
- Generate coding agent rules in minutes
- [agentrulegen.com](https://www.agentrulegen.com/)

**AI Coding Agent Rules** (community):
- [aicodingrules.org](https://aicodingrules.org/)

**One-prompt approach** (blog post pattern):
- Using same markdown instructions across Copilot, Claude, Cursor, and Codex
- [Medium: "One Prompt to Rule Them All"](https://medium.com/@genyklemberg/one-prompt-to-rule-them-all-how-to-reuse-the-same-markdown-instructions-across-copilot-claude-42693df4df00)

**Port** (platform):
- Manage AI instructions with Port
- [Port documentation](https://docs.port.io/guides/all/manage-ai-instructions/)

Sources:
- [Bhartendu-Kumar/rules_template](https://github.com/Bhartendu-Kumar/rules_template) — Combined rules for CLINE/RooCode/Cursor/Windsurf

## Provider-Specific Multi-Model Support

### Gemini CLI
- Uses `GEMINI.md` as default context file (configurable via `settings.json`)
- Hierarchical: `~/.gemini/GEMINI.md` (global) → project-level → subdirectory
- Also supports AGENTS.md
- `/memory show` displays concatenated context; `/memory reload` forces rescan
- [Gemini CLI documentation](https://geminicli.com/docs/)
- [Google Gemini CLI GitHub](https://github.com/google-gemini/gemini-cli)
- [Gemini Code Assist agent mode](https://developers.google.com/gemini-code-assist/docs/use-agentic-chat-pair-programmer)
- [Hands-on with Gemini CLI (Codelab)](https://codelabs.developers.google.com/gemini-cli-hands-on)

### OpenAI Codex CLI
- Uses AGENTS.md natively
- Supports MCP for tool integration
- Multi-agent workflows: spawn specialized agents with different model configurations
- Skills framework extends beyond code editing (APIs, scripts, step-by-step instructions)
- Works with any model/provider supporting Chat Completions or Responses APIs
- [Codex multi-agents documentation](https://developers.openai.com/codex/multi-agent/)
- [Codex CLI features](https://developers.openai.com/codex/cli/features/)
- [Codex models](https://developers.openai.com/codex/models/)
- [Codex with Agents SDK guide](https://developers.openai.com/codex/guides/agents-sdk/)
- [GitHub: openai/codex](https://github.com/openai/codex)
- [Codex CLI guide 2026](https://serenitiesai.com/articles/openai-codex-cli-guide-2026)
- [Codex changelog](https://developers.openai.com/codex/changelog/)
- [Configuration reference](https://developers.openai.com/codex/config-reference/)

### VS Code (Multi-Agent Hub)
- As of v1.109 (January 2026): supports Claude, Codex, and Copilot agents simultaneously
- Agent Sessions view provides unified management across local, background, and cloud agents
- Subagents: context-isolated agents delegated specialized work
- Agent plugins: installable bundles distributed via marketplace
- MCP Apps: tool calls returning interactive UI in chat
- Agent Skills (Anthropic standard) generally available for extensions
- Agent Debug panel for observability
- [VS Code multi-agent development blog](https://code.visualstudio.com/blogs/2026/02/05/multi-agent-development)
- [VS Code agents overview](https://code.visualstudio.com/docs/copilot/agents/overview)
- [VS Code multi-agent command center (The New Stack)](https://thenewstack.io/vs-code-becomes-multi-agent-command-center-for-developers/)
- [Hands-on multi-agent orchestration in VS Code](https://visualstudiomagazine.com/articles/2026/02/09/hands-on-with-new-multi-agent-orchestration-in-vs-code.aspx)
- [VS Code 1.110 agent plugins](https://visualstudiomagazine.com/articles/2026/03/04/vs-code-1-110-ships-with-agent-plugins-browser-tools-and-session-memory.aspx)
- [Creating agent plugins (Ken Muse)](https://www.kenmuse.com/blog/creating-agent-plugins-for-vs-code-and-copilot-cli/)

## Implications for Sherpa

1. **AGENTS.md generation is table-stakes.** `sherpa sync` should generate AGENTS.md from `.claude/rules/` files. Iteration 1 identified this as an open question — the answer is clearly yes. 60K+ repos and 24+ tools make it the universal convention format.

2. **Glob-scoped rules are a Sherpa differentiator, not a liability.** Most tools don't support them. But rule-porter proves the conversion is tractable. Sherpa can be the authoritative source with degraded exports.

3. **MCP is the universal tool layer.** Every provider supports it. Sherpa's MCP server (`studio-mcp`) is correctly positioned.

4. **Convention sync should target 6 formats.** CLAUDE.md (native), AGENTS.md, GEMINI.md, .cursorrules/.cursor/rules, .windsurfrules, .github/copilot-instructions.md. The rule-porter project proves this is a ~1 session task per format.

5. **VS Code is the convergence point.** It now supports Claude + Codex + Copilot simultaneously. Sherpa's Studio UI should consider VS Code extension distribution alongside standalone Next.js app.
