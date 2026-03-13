# Convention Distribution Landscape: Packaging AI-Native Conventions Across Projects

**Research date:** 2026-03-11
**Question:** How do you package and distribute AI-native conventions — not just code — across projects?

---

## Key Discoveries

### 1. Claude Code Has a Complete Plugin System for Convention Distribution

The single most important finding. Claude Code's plugin system (released ~Q1 2026) is purpose-built for distributing exactly what Sherpa needs to distribute: skills, rules, hooks, agents, and MCP servers. A plugin is a directory with:

```
my-plugin/
  .claude-plugin/plugin.json    # manifest (name, version, description)
  skills/                       # SKILL.md-based skills (slash commands)
  agents/                       # subagent definitions
  hooks/                        # hooks.json for tool lifecycle events
  commands/                     # legacy command format (still works)
  .mcp.json                     # MCP server configs
  .lsp.json                     # LSP server configs
  settings.json                 # default settings when plugin is enabled
```

**Distribution mechanisms:**
- Plugin marketplaces (private or public) via `marketplace.json`
- Plugin sources: GitHub repos, git URLs, git subdirectories (sparse clone for monorepos), npm packages, pip packages, or local paths
- Version pinning via semver, git refs, and SHA pinning
- Release channels (stable/latest) via separate marketplace definitions pointing to different refs
- Auto-updates on Claude Code startup (with token auth for private repos)
- Enterprise managed settings with `strictKnownMarketplaces` for org lockdown
- Team auto-configuration via `.claude/settings.json` with `extraKnownMarketplaces`

**What plugins CAN'T distribute:** `.claude/rules/` files. Rules are not part of the plugin spec -- they live in the project's `.claude/rules/` directory and are discovered by glob patterns. Skills in plugins are namespaced (`/plugin-name:skill-name`), but rules are project-level only.

Source: [Claude Code Plugin Docs](https://code.claude.com/docs/en/plugins), [Plugin Marketplaces](https://code.claude.com/docs/en/plugin-marketplaces), [Skills Docs](https://code.claude.com/docs/en/skills)

### 2. Agent Skills is an Open Standard Under the Linux Foundation

Anthropic published the Agent Skills specification as an open standard in December 2025. It was adopted by the Agentic AI Foundation under the Linux Foundation (co-founded by Anthropic, OpenAI, and Block). The spec at [agentskills.io](https://agentskills.io/specification) defines:

- **SKILL.md format:** YAML frontmatter (`name`, `description`, `license`, `compatibility`, `metadata`, `allowed-tools`) + Markdown body
- **Directory structure:** `SKILL.md` (required) + optional `scripts/`, `references/`, `assets/`
- **Progressive disclosure:** Metadata (~100 tokens) loaded at startup; full instructions (<5000 tokens) loaded on activation; resources loaded on demand
- **Name constraints:** 1-64 chars, lowercase alphanumeric + hyphens, must match parent directory name

**Adoption:** OpenAI Codex CLI, ChatGPT, VS Code Copilot, Cursor, GitHub Copilot, Gemini CLI, and 60,000+ repositories. SkillsMP indexes 350K+ skills from GitHub. Skills.sh supports 18 agents. This is the dominant cross-tool standard.

Source: [agentskills.io/specification](https://agentskills.io/specification), [Anthropic Engineering Blog](https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills), [Linux Foundation Announcement](https://www.linuxfoundation.org/press/linux-foundation-announces-the-formation-of-the-agentic-ai-foundation)

### 3. AGENTS.md is the Cross-Tool Convention File Standard

AGENTS.md emerged from OpenAI's Codex tooling and is now stewarded by the Agentic AI Foundation. It serves as the universal "README for agents" -- plain Markdown, no required structure, proximity-based precedence (closest file to edited code wins). Adopted by 60,000+ repos.

**Key difference from CLAUDE.md:** AGENTS.md has no `@import` syntax, no glob-scoped rules, no `paths` frontmatter. It's deliberately minimal -- just Markdown in a file hierarchy. CLAUDE.md is richer but Claude-specific.

**The multi-tool landscape (March 2026):**
| Tool | Convention File | Directory Rules | Glob Scoping | File Imports |
|------|----------------|----------------|--------------|-------------|
| Claude Code | CLAUDE.md | .claude/rules/ | `paths:` frontmatter | `@path` syntax |
| Cursor | .cursor/rules/*.mdc | .cursor/rules/ | `globs:` in MDC | No |
| Copilot | .github/copilot-instructions.md | .github/instructions/ | `applyTo:` | No |
| Codex | AGENTS.md | AGENTS.md per directory | No | No |
| Windsurf | .windsurf/rules/ | .windsurf/rules/ | No | No |
| Cline | .clinerules/ | .clinerules/ | `paths:` frontmatter | No |
| Gemini CLI | GEMINI.md | GEMINI.md per directory | No | `@path` syntax |

Source: [Agent Rules Comparison](https://www.agentrulegen.com/guides/cursorrules-vs-claude-md), [agents.md](https://agents.md/), [0xdevalias research notes](https://gist.github.com/0xdevalias/f40bc5a6f84c4c5ad862e314894b2fa6)

### 4. Multiple Tools Now Sync Rules Across AI Tools

**ai-rules-sync** (v0.8.1, March 2026): Uses symlinks to maintain a single source of truth. Supports 12+ tools including Claude Code rules, skills, subagents, and CLAUDE.md. Stores rules in git repos; installs via `ais install`. Supports private repos and user-level syncing.

**Rulesync** (dyoshikawa): Write rules in `.rulesync/*.md`, auto-generates tool-specific files for Cursor, Claude Code, Copilot, Cline, Windsurf. Bidirectional conversion.

**rule-porter** (nedcodes): Bidirectional converter between Cursor, Windsurf, CLAUDE.md, AGENTS.md, and Copilot. Zero dependencies. Preserves structure, warns about lossy conversions.

**localskills.sh**: Registry-based distribution. Publish once, install into any combination of 8 tools. Versioned with rollback. Private skills via team tokens. Symlinks for instant updates.

**skillshare** (runkids): All skills in one directory, symlinked to each CLI tool. Includes security scanning for prompt injection. Web dashboard for management.

Source: [ai-rules-sync](https://github.com/lbb00/ai-rules-sync), [Rulesync](https://github.com/dyoshikawa/rulesync), [rule-porter](https://github.com/nedcodes-ok/rule-porter), [localskills.sh](https://localskills.sh/blog/sharing-ai-rules-remote-teams), [skillshare](https://github.com/runkids/skillshare)

### 5. The Cursor Ecosystem Pioneered Rules Sharing

Cursor's `.cursorrules` (now deprecated in favor of `.cursor/rules/`) created the first popular rules-sharing ecosystem:

- **cursor.directory**: Community-curated rule sets organized by language/framework, tested and ready to use
- **aicodingrules.com**: 7,000+ rules for Cursor, Claude, Windsurf, Copilot, Cline, and Aider
- **NPM packages for rules:**
  - `@roboto-studio/cursor-rules-sync`: Version, sync, and manage rules across projects. Semantic versioning, automatic backups before updates, CI/CD integration via GitHub Actions.
  - `@orbitant/cursor-rules`: Generate and manage rules from templates
  - `@mallardbay/cursor-rules`: Shared base config with per-environment overrides
  - `pekral/cursor-rules`: Cursor rules distributed via Composer (PHP)
- **Git submodule approach** (GrumpyKitten81): Shared main branch + project-specific feature branches. Python scripts propagate upstream changes while preserving per-project customizations via file whitelists.

Source: [cursor.directory](https://cursor.directory/), [aicodingrules.com](https://aicodingrules.com/), [@roboto-studio/cursor-rules-sync](https://www.npmjs.com/package/@roboto-studio/cursor-rules-sync), [GrumpyKitten81/Cursor-Rules-Sync](https://github.com/GrumpyKitten81/Cursor-Rules-Sync)

### 6. Claude Code Rules Sharing Is Symlink-Based Today

Claude Code's `.claude/rules/` directory auto-discovers all `.md` files recursively. Rules use `paths:` YAML frontmatter for file-specific scoping. Three levels:
- `~/.claude/rules/` -- personal defaults (all projects)
- `.claude/rules/` -- project rules (committed to git)
- User-level loads first, project-level overrides

**Cross-project sharing today:** Symlinks are the documented mechanism. `ln -s ~/shared-claude-rules .claude/rules/shared` -- Claude Code follows symlinks and detects circular references. No native "import from package" or "inherit from upstream" mechanism.

**claudectx** switches entire `.claude/` configurations with one command for different project contexts.

Source: [Claude Code Rules Directory Guide](https://claudefa.st/blog/guide/mechanics/rules-directory), [awesome-claude-code](https://github.com/hesreallyhim/awesome-claude-code)

### 7. Convention Versioning Has No Established Pattern

This is the weakest area of the ecosystem. No tool provides a native merge strategy for "upstream convention update + local customizations." Current workarounds:

- **Git submodule with branch-per-project** (Cursor-Rules-Sync): Main branch = shared, feature branch = per-project. Python scripts propagate changes from main to feature branches, skipping whitelisted project-specific files.
- **Symlinks to central repo** (ai-rules-sync, skillshare): Updates are instant but destructive -- no per-project customization layer.
- **Registry with semver** (localskills.sh, @roboto-studio/cursor-rules-sync): Version pinning with rollback. But no merge -- you get the new version or you don't.
- **ESLint shareable config pattern**: The proven precedent. npm package exports config object, consumers extend with overrides. `extends: ["@org/eslint-config"]` + local overrides. This is the model that works, but no AI rules tool has implemented it yet.
- **Fork + upstream rebase**: Git for Windows uses "merging rebase" at predictable cadence. Works for code, awkward for markdown files where sections may be customized differently.

The fundamental tension: rules files are Markdown prose, not structured config. Semantic merging is hard. The ESLint pattern works because JSON/JS configs compose declaratively. Markdown conventions don't.

Source: [GrumpyKitten81/Cursor-Rules-Sync](https://github.com/GrumpyKitten81/Cursor-Rules-Sync), [ESLint Shareable Configs](https://eslint.org/docs/latest/extend/shareable-configs), [GitHub Blog: Friendly Fork Management](https://github.blog/developer-skills/github/friend-zone-strategies-friendly-fork-management/)

### 8. The "Skills Are the New npm" Thesis

Agent skills hit 350K+ in ~2 months (vs. npm's decade to the same number). The barrier is lower -- skills are Markdown documentation, not executable code -- but the distribution dynamics are identical: infrastructure companies (Vercel, Prisma, Stripe, Supabase) shipped official skills as a distribution channel, paralleling npm package publishing.

Security is the major concern: skills execute with full host environment privileges. Early audits found 13-37% of sampled skills had security vulnerabilities.

Three competing marketplaces: SkillsMP (351K, community-crawled), Skills.sh (83K, cross-agent focus), ClawHub (3.2K, curated with versioning).

Source: [Agent Skills Are the New npm](https://www.buildmvpfast.com/blog/agent-skills-npm-ai-package-manager-2026)

---

## Distribution Strategy Comparison for Conventions

| Approach | Living Sync | Per-Project Customization | Versioning | Complexity | Best For |
|----------|-------------|--------------------------|------------|------------|----------|
| **Claude Code Plugin** | Auto-updates via marketplace | No (plugin content is immutable once installed) | Semver + git ref pinning | Medium | Skills, agents, hooks, MCP |
| **Git subtree** | `git subtree pull` | Yes (local commits to subtree) | Git history | High (merge conflicts) | Living sync of markdown files |
| **Symlinks to central repo** | Instant | No | Git history of central repo | Low | Simple sharing, no customization |
| **Scaffold CLI (copy once)** | No (one-time copy) | Yes (full ownership) | CLI version gates what you get | Medium to build | Starter kits, project init |
| **npm package + postinstall** | `npm update` | Override files only | Semver | Medium | Structured configs (ESLint pattern) |
| **Git submodule + branches** | `git pull` on branch | Yes (per-project branch) | Branch-based | High | Teams that understand git well |
| **Registry (localskills.sh)** | `localskills pull` | No | Version + rollback | Low | Cross-tool rule distribution |

---

## Implications for Sherpa Convention Distribution

### The Two-Layer Problem

Sherpa has two distinct distribution needs:

1. **Executable conventions** (skills, agents, hooks, MCP configs) -- These map perfectly to Claude Code plugins. Package them as a `@sherpa/studio` plugin with a private marketplace. Skills become `/sherpa:plan-tasks`, `/sherpa:morning`, etc.

2. **Prose conventions** (.claude/rules/, CLAUDE.md templates, docs/agents/roles/, docs/tasks/ schema, initiative directory structure) -- These DON'T map to any existing distribution mechanism cleanly. Rules can't be in plugins. CLAUDE.md is project-specific. Role definitions and task schemas are just files.

### Recommended Architecture

**Layer 1: Claude Code Plugin (for executable stuff)**
```
@sherpa/studio-plugin/
  .claude-plugin/plugin.json
  skills/
    plan-tasks/SKILL.md
    morning/SKILL.md
    integration-review/SKILL.md
    recursive-research/SKILL.md
    prune/SKILL.md
  agents/
    planner.md
    worker.md
    judge.md
  hooks/hooks.json
  .mcp.json
```

Distribute via private marketplace. Teams install with `/plugin install sherpa-studio@sherpa-marketplace`. Auto-updates via marketplace refresh.

**Layer 2: Scaffold CLI + Git Subtree (for prose conventions)**
```
npx @sherpa/init
```

This would:
1. Copy `.claude/rules/` templates into the project (one-time scaffold)
2. Copy `docs/agents/roles/` templates
3. Copy `docs/tasks/README.md` schema
4. Create `docs/initiatives/` directory structure
5. Generate a starter `CLAUDE.md` from the project type

For living sync of rules, add the convention repo as a git subtree:
```bash
git subtree add --prefix .sherpa/conventions https://github.com/sherpa/conventions.git main --squash
```

Then symlink individual rules into `.claude/rules/`:
```bash
ln -s ../../.sherpa/conventions/rules/behavioral-engineering.md .claude/rules/
```

Update with:
```bash
git subtree pull --prefix .sherpa/conventions https://github.com/sherpa/conventions.git main --squash
```

**Layer 3: AGENTS.md for Cross-Tool Compatibility**

Generate an AGENTS.md from the most important rules for teams using non-Claude tools. Use `rulesync` or `rule-porter` to convert.

### The Customization Problem

The hardest unsolved problem. When Sherpa updates `behavioral-engineering.md` and a customer has customized it, there is no good merge. Options:

1. **Immutable core + extension pattern:** Ship rules as read-only. Customers create `behavioral-engineering.local.md` for overrides. Convention: local files loaded after framework files, higher priority. (This mirrors AGENTS.override.md from Codex.)

2. **Structured frontmatter sections:** Split rules into frontmatter-delimited sections. Framework owns some sections, customer owns others. Merge tool only touches framework-owned sections.

3. **Accept divergence:** Scaffold once, customer owns the files. New framework versions documented in changelog; customers apply manually. This is how most web frameworks (Rails, Next.js) handle it.

Option 1 is most practical. Requires a Sherpa-specific convention that rules files named `*.local.md` override the base file, plus documentation.

---

## Open Questions

1. **Can Claude Code plugins include `.claude/rules/` files?** The docs say skills, agents, hooks, MCP -- but not rules. Could a plugin's `settings.json` configure additional rules paths? Or would a post-install hook symlink rules into `.claude/rules/`?

2. **Plugin + project rules interaction:** If a plugin ships a skill that references conventions (e.g., "follow the task schema in docs/tasks/README.md"), but those conventions live in the project (not the plugin), how does the skill find them? The skill runs in the project context, so it should have access -- but this needs testing.

3. **Multi-tool convention generation:** Should Sherpa maintain one canonical format and generate tool-specific files? Or should it ship tool-specific files? The `rulesync` approach (write once in `.rulesync/`, generate per-tool) is elegant but adds a build step.

4. **Convention drift detection:** How do you know when a project's conventions have drifted from the framework's current version? A `sherpa doctor` command that diffs local rules against the current framework version?

5. **The "rules as data" question:** Would structured YAML/JSON conventions (that generate Markdown) solve the merge problem? You could version the data and re-render the Markdown on update. But this adds complexity and loses the readability advantage of plain Markdown.

6. **Plugin marketplace economics:** Sherpa's plugin marketplace could be a distribution channel for the consulting business. Private marketplace for paying clients, public marketplace for open-source conventions. Is this a viable model?

---

## Sources

### Claude Code Documentation
- [Claude Code Skills](https://code.claude.com/docs/en/skills) -- Complete skills specification including frontmatter, discovery, loading, subagents
- [Claude Code Plugins](https://code.claude.com/docs/en/plugins) -- Plugin creation, structure, distribution
- [Claude Code Plugin Marketplaces](https://code.claude.com/docs/en/plugin-marketplaces) -- Marketplace creation, hosting, version management, team configuration
- [Claude Code Best Practices](https://code.claude.com/docs/en/best-practices) -- Rules, memory, project configuration

### Agent Skills Standard
- [Agent Skills Specification](https://agentskills.io/specification) -- Full SKILL.md format spec under the Agentic AI Foundation
- [Anthropic Engineering: Agent Skills](https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills) -- Announcement and rationale
- [Agent Skills: Anthropic's Bid for Standards](https://thenewstack.io/agent-skills-anthropics-next-bid-to-define-ai-standards/) -- Industry analysis
- [OpenAI Codex Skills](https://developers.openai.com/codex/skills/) -- OpenAI's adoption of the same standard
- [OpenAI Skills Catalog](https://github.com/openai/skills) -- Official skill repository

### AGENTS.md and Agentic AI Foundation
- [AGENTS.md Specification](https://agents.md/) -- The cross-tool convention file standard
- [AGENTS.md GitHub](https://github.com/agentsmd/agents.md) -- Specification source
- [OpenAI: Agentic AI Foundation](https://openai.com/index/agentic-ai-foundation/) -- Foundation announcement
- [Linux Foundation: AAIF Formation](https://www.linuxfoundation.org/press/linux-foundation-announces-the-formation-of-the-agentic-ai-foundation) -- Official press release
- [IntuitionLabs: AAIF Guide](https://intuitionlabs.ai/articles/agentic-ai-foundation-open-standards) -- Foundation overview

### Cross-Tool Comparison and Sync
- [cursorrules vs CLAUDE.md vs Copilot Instructions](https://www.agentrulegen.com/guides/cursorrules-vs-claude-md) -- Comprehensive comparison of all convention file formats
- [0xdevalias: AI Agent Rule Files Research](https://gist.github.com/0xdevalias/f40bc5a6f84c4c5ad862e314894b2fa6) -- Exhaustive notes on all formats
- [ai-rules-sync](https://github.com/lbb00/ai-rules-sync) -- 12+ tool sync via symlinks (v0.8.1)
- [Rulesync](https://github.com/dyoshikawa/rulesync) -- Write once, generate for all tools
- [rule-porter](https://github.com/nedcodes-ok/rule-porter) -- Bidirectional format converter
- [localskills.sh: Sharing Rules for Teams](https://localskills.sh/blog/sharing-ai-rules-remote-teams) -- Registry-based distribution
- [skillshare](https://github.com/runkids/skillshare) -- Cross-CLI skill sync with security scanning

### Cursor Ecosystem
- [Cursor Rules Documentation](https://docs.cursor.com/context/rules) -- Official rules docs
- [cursor.directory](https://cursor.directory/) -- Community rule repository
- [aicodingrules.com](https://aicodingrules.com/) -- 7,000+ rules across tools
- [@roboto-studio/cursor-rules-sync](https://www.npmjs.com/package/@roboto-studio/cursor-rules-sync) -- npm package for rule versioning/sync
- [GrumpyKitten81/Cursor-Rules-Sync](https://github.com/GrumpyKitten81/Cursor-Rules-Sync) -- Git submodule + branch approach
- [Symlinks for Rules Across Projects](https://dev.to/avmadhukiran/organizing-cursor-rules-commands-across-projects-with-symlinks-9li) -- Symlink-based sharing pattern

### Claude Code Rules and Configuration
- [Claude Code Rules Directory Guide](https://claudefa.st/blog/guide/mechanics/rules-directory) -- Path targeting, loading behavior, symlinks
- [awesome-claude-code](https://github.com/hesreallyhim/awesome-claude-code) -- Curated list of rules, skills, hooks, plugins
- [claudectx](https://github.com/foxj77/claudectx) -- Configuration switching for Claude Code

### GitHub Copilot
- [Copilot Custom Instructions](https://docs.github.com/copilot/customizing-copilot/adding-custom-instructions-for-github-copilot) -- Repository-level instructions
- [VS Code Copilot Custom Instructions](https://code.visualstudio.com/docs/copilot/customization/custom-instructions) -- IDE-level configuration
- [Org-Wide Copilot Instructions Request](https://github.com/orgs/community/discussions/179641) -- Feature request for cross-repo sharing
- [Composable Copilot Instructions Request](https://github.com/orgs/community/discussions/183815) -- Feature request for reusable instructions

### Skills Marketplaces
- [SkillsMP](https://skillsmp.com) -- 351K+ community-crawled skills marketplace
- [Agent Skills Are the New npm](https://www.buildmvpfast.com/blog/agent-skills-npm-ai-package-manager-2026) -- Marketplace dynamics analysis
- [VoltAgent/awesome-agent-skills](https://github.com/VoltAgent/awesome-agent-skills) -- 550+ curated official skills
- [Skills Manager Desktop App](https://github.com/jiweiyeah/Skills-Manager) -- Tauri app for multi-tool skill management

### Convention Distribution Patterns
- [ESLint Shareable Configs](https://eslint.org/docs/latest/extend/shareable-configs) -- The proven pattern for distributing conventions via npm
- [Git Subtree Tutorial (Atlassian)](https://www.atlassian.com/git/tutorials/git-subtree) -- Living sync of shared files
- [Mastering Git Subtrees](https://medium.com/@porteneuve/mastering-git-subtrees-943d29a798ec) -- Advanced subtree patterns
- [GitHub Blog: Friendly Fork Management](https://github.blog/developer-skills/github/friend-zone-strategies-friendly-fork-management/) -- Upstream sync strategies
- [Yeoman](https://yeoman.io/) -- Project scaffolding tool
- [Plop](https://www.npmjs.com/package/plop) -- Micro-generator for files within existing projects

### Industry Context
- [In Agentic AI, It's All About the Markdown (Visual Studio Magazine)](https://visualstudiomagazine.com/articles/2026/02/24/in-agentic-ai-its-all-about-the-markdown.aspx) -- Markdown as AI instruction layer
- [AI IDE Comparison 2026 (SitePoint)](https://www.sitepoint.com/ai-ides-compared-cursor-claude-code-cody-2026/) -- Tool landscape overview

---

## Raw Links

```
https://code.claude.com/docs/en/skills
https://code.claude.com/docs/en/plugins
https://code.claude.com/docs/en/plugin-marketplaces
https://code.claude.com/docs/en/plugins-reference
https://code.claude.com/docs/en/discover-plugins
https://code.claude.com/docs/en/best-practices
https://code.claude.com/docs/en/settings
https://agentskills.io/specification
https://agentskills.io
https://agents.md/
https://github.com/agentsmd/agents.md
https://github.com/agentskills/agentskills
https://github.com/anthropics/skills
https://github.com/openai/skills
https://github.com/openai/codex/blob/main/docs/skills.md
https://developers.openai.com/codex/skills/
https://developers.openai.com/codex/guides/agents-md/
https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills
https://thenewstack.io/agent-skills-anthropics-next-bid-to-define-ai-standards/
https://openai.com/index/agentic-ai-foundation/
https://www.linuxfoundation.org/press/linux-foundation-announces-the-formation-of-the-agentic-ai-foundation
https://intuitionlabs.ai/articles/agentic-ai-foundation-open-standards
https://www.agentrulegen.com/guides/cursorrules-vs-claude-md
https://gist.github.com/0xdevalias/f40bc5a6f84c4c5ad862e314894b2fa6
https://github.com/lbb00/ai-rules-sync
https://github.com/dyoshikawa/rulesync
https://github.com/nedcodes-ok/rule-porter
https://localskills.sh/blog/sharing-ai-rules-remote-teams
https://localskills.sh/blog/cursor-rules-guide
https://github.com/runkids/skillshare
https://github.com/jiweiyeah/Skills-Manager
https://docs.cursor.com/context/rules
https://cursor.directory/
https://aicodingrules.com/
https://www.npmjs.com/package/@roboto-studio/cursor-rules-sync
https://www.npmjs.com/package/@orbitant/cursor-rules
https://www.npmjs.com/package/@mallardbay/cursor-rules
https://github.com/GrumpyKitten81/Cursor-Rules-Sync
https://dev.to/avmadhukiran/organizing-cursor-rules-commands-across-projects-with-symlinks-9li
https://claudefa.st/blog/guide/mechanics/rules-directory
https://github.com/hesreallyhim/awesome-claude-code
https://github.com/foxj77/claudectx
https://docs.github.com/copilot/customizing-copilot/adding-custom-instructions-for-github-copilot
https://code.visualstudio.com/docs/copilot/customization/custom-instructions
https://github.com/orgs/community/discussions/179641
https://github.com/orgs/community/discussions/183815
https://github.com/orgs/community/discussions/164112
https://skillsmp.com
https://www.buildmvpfast.com/blog/agent-skills-npm-ai-package-manager-2026
https://github.com/VoltAgent/awesome-agent-skills
https://eslint.org/docs/latest/extend/shareable-configs
https://www.atlassian.com/git/tutorials/git-subtree
https://medium.com/@porteneuve/mastering-git-subtrees-943d29a798ec
https://github.blog/developer-skills/github/friend-zone-strategies-friendly-fork-management/
https://yeoman.io/
https://www.npmjs.com/package/plop
https://visualstudiomagazine.com/articles/2026/02/24/in-agentic-ai-its-all-about-the-markdown.aspx
https://www.sitepoint.com/ai-ides-compared-cursor-claude-code-cody-2026/
https://github.com/Bhartendu-Kumar/rules_template
https://github.com/instructa/ai-prompts
https://windsurf.com/editor/directory
https://playbooks.com/windsurf-rules
https://forum.cursor.com/t/good-examples-of-cursorrules-file/4346
https://workos.com/blog/what-are-cursor-rules
https://cursorrules.org/
https://simonwillison.net/2025/Dec/12/openai-skills/
https://blog.fsck.com/2025/12/19/codex-skills/
https://github.com/pekral/cursor-rules
https://nedcodes.dev/guides/cursor-rules-for-teams
https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview
https://support.claude.com/en/articles/12512176-what-are-skills
https://leehanchung.github.io/blogs/2025/10/26/claude-skills-deep-dive/
https://anthropic.skilljar.com/introduction-to-agent-skills
https://aibusiness.com/foundation-models/anthropic-launches-skills-open-standard-claude
https://www.skillhub.club
https://inference.sh/blog/skills/agent-skills-overview
https://smartscope.blog/en/blog/skillsmp-marketplace-guide/
https://skillsmp.com/docs
https://skillsmp.com/categories
https://eu.36kr.com/en/p/3589328631202050
```
