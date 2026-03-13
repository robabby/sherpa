# Vector 4: Skills and Conventions as Distribution Mechanism

**Question:** How should "skills" — copy/pastable, composable agent workflow primitives — be distributed, discovered, and composed? What's the right ecosystem model?
**Agent dispatched:** 2026-03-12

## Findings

### 1. Agent Skills Is Already an Open Standard with Cross-Platform Adoption

- **Anthropic released Agent Skills as an open standard in December 2025** via [agentskills.io](https://agentskills.io/specification). The spec defines a SKILL.md file (YAML frontmatter + markdown body) inside a directory with optional `scripts/`, `references/`, and `assets/` subdirectories. ([Anthropic blog](https://claude.com/blog/equipping-agents-for-the-real-world-with-agent-skills))
- **OpenAI adopted the same format within weeks** for Codex CLI and ChatGPT's Code Interpreter. Simon Willison called Skills "maybe a bigger deal than MCP." ([Simon Willison](https://simonwillison.net/2025/Dec/12/openai-skills/))
- **Microsoft adopted Agent Skills in VS Code** for GitHub Copilot. Other adopters include Cursor, Goose, Amp, OpenCode, and Antigravity IDE. ([VS Code docs](https://code.visualstudio.com/docs/copilot/customization/agent-skills))
- **The Agentic AI Foundation (AAIF)** launched December 2025 under the Linux Foundation, anchored by MCP and AGENTS.md donations from Anthropic and OpenAI. Platinum members: AWS, Anthropic, Block, Bloomberg, Cloudflare, Google, Microsoft, OpenAI. ([Linux Foundation](https://www.linuxfoundation.org/press/linux-foundation-announces-the-formation-of-the-agentic-ai-foundation))

### 2. The Ecosystem Exploded — 350K+ Skills in 3 Months

- **Growth trajectory**: December 2025: a few thousand skills. January 2026: tens of thousands. February 2026: 280K+. Early March 2026: 351K+ indexed on SkillsMP alone. ([BuildMVPFast](https://www.buildmvpfast.com/blog/agent-skills-npm-ai-package-manager-2026))
- **Multiple competing marketplaces** emerged: SkillsMP (volume leader, 87K+ by Jan 2026), Skills.sh (cross-agent compatibility, 18 agents), ClawHub (curated, vector-powered). ([SkillsMP](https://skillsmp.com))
- **Anthropic's official skills repo** at [github.com/anthropics/skills](https://github.com/anthropics/skills/) contains reference implementations.

### 3. Claude Code Has a Full Plugin + Marketplace Architecture

- **Skills merged with slash commands** in Claude Code v2.1.3 (January 2026). `.claude/commands/` files still work but the skills system is now canonical. ([Claude Code docs](https://code.claude.com/docs/en/skills))
- **Plugin marketplace system** is fully documented. A marketplace is a `marketplace.json` file listing plugins with sources (git, npm, pip, relative path). Users install via `/plugin marketplace add` and `/plugin install`. ([Claude Code marketplace docs](https://code.claude.com/docs/en/plugin-marketplaces))
- **Plugins bundle skills + agents + hooks + MCP servers + LSP servers** into distributable units. Over 9,000 plugins available as of February 2026. ([Claude Code plugins](https://code.claude.com/docs/en/plugins-reference))
- **Enterprise marketplace**: Anthropic launched Claude Marketplace in March 2026 for enterprise plugin distribution with partners like GitLab, Harvey, Lovable, Replit, and Snowflake. ([VentureBeat](https://venturebeat.com/technology/anthropic-launches-claude-marketplace-giving-enterprises-access-to-claude))

### 4. Composition Is the Unsolved Problem

- **Individual skills work. Composing them doesn't — yet.** An arxiv paper (March 2026) found that "without explicit mechanisms for composition and coordination, many skills remain underused, and the ecosystem fails to deliver its key value: orchestrating multiple skills." ([arxiv 2603.02176](https://arxiv.org/html/2603.02176))
- **AgentSkillOS** proposes a solution: organize skills into a hierarchical capability tree, then compose selected skills into DAG pipelines with three strategies (Quality-First, Efficiency-First, Simplicity-First). DAG-based orchestration substantially outperformed flat skill invocation.
- **Claude Code's composition model** uses `context: fork` to run skills in subagents, and the `agent` field selects which subagent type executes. Skills can reference other files but there is no formal skill-to-skill dependency mechanism in the spec.
- **Feature request exists** for declarative skill/plugin dependencies at the project level (analogous to package.json). ([GitHub issue #27113](https://github.com/anthropics/claude-code/issues/27113))

### 5. Security Is a Critical Gap

- **13.4% of sampled skills contain critical security issues.** Snyk found prompt injection in 36% and 1,467 malicious payloads in a study of ClawHub skills. ([Snyk ToxicSkills](https://snyk.io/blog/toxicskills-malicious-ai-agent-skills-clawhub/))
- **341 malicious skills found on ClawHub** including cryptocurrency stealers disguised as legitimate tools. ([AuthMind](https://www.authmind.com/blogs/openclaw-malicious-skills-agentic-ai-supply-chain))
- **No cryptographic signing or verification exists.** Skills execute with full host privileges. Optional Docker sandboxing requires explicit configuration most users never implement. ([SafeDep](https://safedep.io/agent-skills-threat-model/))

### 6. APM (Agent Package Manager) Emerged as npm for Agents

- **Microsoft's APM** manages agent primitives: skills, plugins, prompts, hooks, all declared in one `apm.yml` manifest with transitive dependency resolution. ([GitHub microsoft/apm](https://github.com/microsoft/apm))
- **Daniel Meppiel's framework** identifies six agentic primitive types (instructions, chat modes, workflows, specs, memory, context helpers) that compose in three layers. ([GitHub blog](https://github.blog/ai-and-ml/github-copilot/how-to-build-reliable-ai-workflows-with-agentic-primitives-and-context-engineering/))

### 7. Three Parallel Standards Are Converging

| Standard | Owner | Purpose | Adoption |
|----------|-------|---------|----------|
| Agent Skills (SKILL.md) | Anthropic/AAIF | Composable agent capabilities | 280K+ skills, 10+ platforms |
| AGENTS.md | OpenAI/AAIF | Project-level agent guidance | 60K+ repos |
| MCP | Anthropic/AAIF | Tool connectivity protocol | 2K+ servers in registry |

All three are now under the AAIF umbrella. The MCP 2026 roadmap explicitly includes "investigating a Skills primitive for composed capabilities." ([MCP roadmap](https://modelcontextprotocol.io/development/roadmap))

### 8. Lessons from Adjacent Ecosystems

- **VS Code Marketplace**: 60K+ extensions, 73.6% developer adoption. Success factors: low friction publishing, ratings/downloads visible, extension packs for composition, but no formal dependency system between extensions.
- **Obsidian plugins**: No dependency management between plugins. Inter-plugin communication is ad-hoc. Main failure mode: plugins break on app updates, abandoned plugins become time bombs. ([Obsidian forum](https://forum.obsidian.md/t/inter-plugin-communication-expose-api-to-other-plugins/23618))
- **GitHub Actions**: 15K+ actions, no review before publishing (security concern), 58% have vulnerability alerts. Versioning via git tags, composition via `uses: action@ref`.
- **Zapier templates**: Workflow templates include app/event selections but not field values. Templates are parameterized starting points, not composable units.
- **Cursor .cursorrules**: 36.9K GitHub stars on awesome-cursorrules. Format has already deprecated (.cursorrules -> .cursor/rules/*.mdc). Community distribution is purely informal.
- **Homebrew**: Success through simplicity — declarative formulae, automatic dependency resolution, "just works" UX.

### 9. Prompt Registries Are Emerging as Infrastructure

- **LangChain Hub** provides prompt discovery, forking, and version-controlled sharing with Git-like branching workflows.
- **MLflow Prompt Registry** treats prompts as versioned artifacts with model configuration.
- **Academic research** (Springer 2026) establishes "Prompts as Software Engineering Artifacts" as a research agenda.

### 10. Progressive Disclosure Is the Core Design Principle

Anthropic's skill architecture uses a three-layer progressive disclosure model:
1. **Metadata** (~100 tokens): name + description loaded at startup for all skills
2. **Instructions** (<5000 tokens): full SKILL.md body loaded on activation
3. **Resources** (as needed): scripts/, references/, assets/ loaded on demand

## Sources

### Agent Skills Standard & Specification
- [agentskills.io/specification](https://agentskills.io/specification) — Complete Agent Skills format specification
- [github.com/agentskills/agentskills](https://github.com/agentskills/agentskills) — Specification and documentation repository
- [github.com/anthropics/skills](https://github.com/anthropics/skills/) — Anthropic's official skills repository

### Claude Code Documentation
- [code.claude.com/docs/en/skills](https://code.claude.com/docs/en/skills) — Complete Claude Code skills documentation
- [code.claude.com/docs/en/plugin-marketplaces](https://code.claude.com/docs/en/plugin-marketplaces) — Plugin marketplace creation and distribution
- [code.claude.com/docs/en/plugins-reference](https://code.claude.com/docs/en/plugins-reference) — Plugins reference

### Announcements
- [claude.com/blog/equipping-agents-for-the-real-world-with-agent-skills](https://claude.com/blog/equipping-agents-for-the-real-world-with-agent-skills) — Anthropic's Agent Skills vision
- [simonwillison.net/2025/Dec/12/openai-skills/](https://simonwillison.net/2025/Dec/12/openai-skills/) — Simon Willison on OpenAI adopting Skills
- [linuxfoundation.org/press/linux-foundation-announces-the-formation-of-the-agentic-ai-foundation](https://www.linuxfoundation.org/press/linux-foundation-announces-the-formation-of-the-agentic-ai-foundation) — AAIF formation

### Security Research
- [snyk.io/blog/toxicskills-malicious-ai-agent-skills-clawhub/](https://snyk.io/blog/toxicskills-malicious-ai-agent-skills-clawhub/) — Snyk ToxicSkills study
- [safedep.io/agent-skills-threat-model/](https://safedep.io/agent-skills-threat-model/) — Agent Skills threat model
- [authmind.com/blogs/openclaw-malicious-skills-agentic-ai-supply-chain](https://www.authmind.com/blogs/openclaw-malicious-skills-agentic-ai-supply-chain) — Malicious skills analysis

### Research Papers
- [arxiv.org/html/2603.02176](https://arxiv.org/html/2603.02176) — AgentSkillOS: Organizing and Orchestrating Agent Skills at Ecosystem Scale
- [link.springer.com/chapter/10.1007/978-3-032-12089-2_32](https://link.springer.com/chapter/10.1007/978-3-032-12089-2_32) — Prompts as Software Engineering Artifacts

### Agent Package Management
- [github.com/microsoft/apm](https://github.com/microsoft/apm) — Microsoft Agent Package Manager
- [github.blog/ai-and-ml/github-copilot/how-to-build-reliable-ai-workflows-with-agentic-primitives-and-context-engineering/](https://github.blog/ai-and-ml/github-copilot/how-to-build-reliable-ai-workflows-with-agentic-primitives-and-context-engineering/) — Agentic primitives

### Marketplaces
- [skillsmp.com](https://skillsmp.com) — SkillsMP marketplace (volume leader)
- [skillhub.club](https://www.skillhub.club) — SkillHub marketplace
- [venturebeat.com/technology/anthropic-launches-claude-marketplace-giving-enterprises-access-to-claude](https://venturebeat.com/technology/anthropic-launches-claude-marketplace-giving-enterprises-access-to-claude) — Claude Marketplace launch

## Raw Links

- https://agentskills.io/specification
- https://github.com/agentskills/agentskills
- https://github.com/anthropics/skills/
- https://code.claude.com/docs/en/skills
- https://code.claude.com/docs/en/plugin-marketplaces
- https://code.claude.com/docs/en/plugins-reference
- https://code.claude.com/docs/en/sub-agents
- https://claude.com/blog/equipping-agents-for-the-real-world-with-agent-skills
- https://simonwillison.net/2025/Dec/12/openai-skills/
- https://simonwillison.net/2025/Dec/19/agent-skills/
- https://www.linuxfoundation.org/press/linux-foundation-announces-the-formation-of-the-agentic-ai-foundation
- https://www.infoq.com/news/2025/12/agentic-ai-foundation/
- https://registry.modelcontextprotocol.io
- https://modelcontextprotocol.io/development/roadmap
- https://skillsmp.com
- https://www.skillhub.club
- https://www.claudeskillsmarket.com/
- https://www.buildmvpfast.com/blog/agent-skills-npm-ai-package-manager-2026
- https://github.com/microsoft/apm
- https://github.com/microsoft/apm-action
- https://github.blog/ai-and-ml/github-copilot/how-to-build-reliable-ai-workflows-with-agentic-primitives-and-context-engineering/
- https://snyk.io/blog/toxicskills-malicious-ai-agent-skills-clawhub/
- https://safedep.io/agent-skills-threat-model/
- https://www.authmind.com/blogs/openclaw-malicious-skills-agentic-ai-supply-chain
- https://arxiv.org/html/2603.02176
- https://arxiv.org/pdf/2602.12430
- https://link.springer.com/chapter/10.1007/978-3-032-12089-2_32
- https://smith.langchain.com/hub
- https://mlflow.org/docs/latest/genai/prompt-registry/
- https://github.com/PatrickJS/awesome-cursorrules
- https://docs.cursor.com/context/rules-for-ai
- https://forum.obsidian.md/t/inter-plugin-communication-expose-api-to-other-plugins/23618
- https://www.xda-developers.com/obsidians-reliance-on-plugins/
- https://help.zapier.com/hc/en-us/articles/8496292155405-Share-a-template-of-your-Zap
- https://devopsjournal.io/blog/2022/09/18/Analysing-the-GitHub-marketplace
- https://en.wikipedia.org/wiki/Homebrew_(package_manager)
- https://venturebeat.com/technology/anthropic-launches-claude-marketplace-giving-enterprises-access-to-claude
- https://siliconangle.com/2026/03/06/anthropic-launches-claude-marketplace-third-party-cloud-services/
- https://github.com/anthropics/claude-code/issues/27113
- https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents

## Implications

1. **Sherpa's skills ARE Agent Skills** — The `/rr`, `/integration-review`, and `/plan-tasks` skills already follow the standard format. Explicitly declare compatibility with agentskills.io.
2. **The Plugin/Marketplace Model Is Sherpa's Distribution Path** — Claude Code's marketplace system is the natural vehicle for Sherpa's governance skills.
3. **Composition Is Sherpa's Differentiator** — Skills composing into pipelines (research -> propose -> review -> plan -> execute) is exactly what AgentSkillOS found outperforms flat invocation. Sherpa already does this.
4. **Security Needs Attention Before Distribution** — 13.4% of public skills have critical issues. Pin dependencies with content hashes before distributing.
5. **Convention as distributable artifact is unique** — Most skills teach agents what to do; Sherpa's conventions teach agents how to behave.

## Open Questions

1. Should Sherpa publish a marketplace or a single plugin? Marketplace allows modular installation.
2. How should skill composition be formalized beyond natural language references?
3. What is the relationship between AGENTS.md and CLAUDE.md? Should Sherpa generate both via `sherpa sync`?
4. How does the MCP Skills primitive (on the 2026 roadmap) affect Sherpa's architecture?
5. What trust model should Sherpa use for external skills? Content hashing is a start.
6. Should governance workflows be portable across agents (Claude, Codex, Gemini CLI)?
7. What's the right granularity — is `/rr` (380 lines) one skill or six composable skills?
