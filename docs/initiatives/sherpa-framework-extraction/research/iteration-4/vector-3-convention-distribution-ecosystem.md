# Vector 3: Convention Distribution Ecosystem Update

**Question:** What is the current state of the AI agent convention distribution ecosystem in 2026?
**Agent dispatched:** 2026-03-11

## Findings

### Claude Code Plugin Marketplace

- **Plugins still cannot distribute `.claude/rules/` files.** Issue [#14200](https://github.com/anthropics/claude-code/issues/14200) has been open since Dec 2025 with 28+ thumbs-up and no Anthropic response. Plugins support 7 component types (skills, agents, hooks, MCP, LSP, commands, outputStyles) but not rules. The plugin marketplace is otherwise fully operational with npm as distribution source.

- **This gap validates the `sherpa sync` CLI approach.** Rules files need a separate distribution mechanism. The plugin system won't solve this.

### AGENTS.md Adoption

- **AGENTS.md hit 60K+ repo adoption** and is now governed by the Agentic AI Foundation (Linux Foundation). It's the cross-tool convention standard.

- **ETH Zurich study** ([arXiv:2602.11988](https://arxiv.org/abs/2602.11988)) found that verbose context files HURT agent performance by 3% and increase costs by 20%. Only non-inferable details (behavioral constraints, custom tooling) help. This validates Sherpa's CLAUDE.md standards rule: "Would removing this cause Claude to make mistakes?"

### Agent Skills Ecosystem

- **Vercel's `npx skills add` launched Jan 2026** with 83K+ skills and 8M+ installs. Standard directory converging on `.github/skills/`. Skill distribution is a solved problem — no need for Sherpa to build its own skill distribution.

- **Agent Skills standard adopted by 31+ agents** (Claude Code, Cursor, Codex, Gemini CLI, VS Code Copilot, etc.). The SKILL.md format is the lingua franca.

### New Convention Distribution Tools

Five new tools emerged since early March 2026:

| Tool | Stars | Approach | Three-Way Merge? |
|------|-------|----------|-----------------|
| **Ruler** | 2.5k | Concatenation-based, 37 agent support | No |
| **Microsoft APM** | 442 | `apm.yml` + lockfile | No |
| **Packmind** | 242 | Enterprise SaaS | No |
| **AI Rules Sync** | 17 | Symlink-based | No |
| **dot-agents** | 15 | `~/.agents/` directory | No |

**None implements three-way merge for convention evolution.** They all use overwrite/concatenation/symlinks. This confirms the ecosystem gap identified in iteration 1.

### Copier Status

- **Copier (Python, v9.13.1) remains the only template lifecycle tool with three-way merge for updates.** No JS/TS equivalent has appeared. `node-diff3` (v3.2.0, ESM+CJS) remains the correct JS merge library for building one.

### The Ecosystem Layer Model

| Layer | Function | Status |
|-------|----------|--------|
| L1 Standards | AGENTS.md, SKILL.md, CLAUDE.md | Mature |
| L2 Distribution | npm plugins, `npx skills add`, registries | Mature |
| L3 Synchronization | Ruler (concatenation), AI Rules Sync (symlinks) | Primitive |
| **L4 Governance** | Convention evolution + provenance + merge | **Vacant** |

**Layer 4 is Sherpa's unique position.** No tool handles convention evolution with provenance tracking and three-way merge.

## Sources

- [Claude Code plugins issue #14200](https://github.com/anthropics/claude-code/issues/14200) — Rules distribution request
- [Claude Code plugins reference](https://code.claude.com/docs/en/plugins-reference) — 7 component types
- [ETH Zurich study](https://arxiv.org/abs/2602.11988) — Verbose context files hurt performance
- [AGENTS.md standard](https://github.com/anthropics/claude-code/blob/main/AGENTS.md) — Cross-tool convention
- [Agentic AI Foundation](https://www.agenticaifoundation.org/) — Linux Foundation governance
- [agentskills.io](https://agentskills.io/home) — 83K+ skills, 8M+ installs
- [Ruler](https://github.com/AiHaibara/ruler) — Rule concatenation tool
- [Microsoft APM](https://github.com/microsoft/apm) — Agent Package Manager
- [Packmind](https://www.packmind.com/) — Enterprise convention SaaS
- [AI Rules Sync](https://github.com/nicostorm/ai-rules-sync) — Symlink-based sync
- [dot-agents](https://github.com/dot-agents/dot-agents) — Global agent config directory
- [node-diff3](https://www.npmjs.com/package/node-diff3) — Three-way merge in JS
- [Copier](https://copier.readthedocs.io/) — Python template lifecycle tool

## Raw Links

- https://github.com/anthropics/claude-code/issues/14200
- https://code.claude.com/docs/en/plugins-reference
- https://code.claude.com/docs/en/plugins
- https://arxiv.org/abs/2602.11988
- https://github.com/anthropics/claude-code/blob/main/AGENTS.md
- https://www.agenticaifoundation.org/
- https://agentskills.io/home
- https://www.mdskills.ai/specs/skill-md
- https://github.com/AiHaibara/ruler
- https://github.com/microsoft/apm
- https://www.packmind.com/
- https://github.com/nicostorm/ai-rules-sync
- https://github.com/dot-agents/dot-agents
- https://www.npmjs.com/package/node-diff3
- https://copier.readthedocs.io/
- https://github.com/copier-org/copier
- https://www.npmjs.com/package/diff

## Implications

1. **`sherpa sync` fills a genuine Layer 4 gap.** No competitor has three-way merge for convention evolution. This is defensible functionality, not commodity tooling.

2. **Skill distribution is solved — don't build it.** Use Vercel's `npx skills add` or the Claude Code plugin system for SKILL.md distribution. Focus `sherpa sync` exclusively on prose conventions (rules, CLAUDE.md templates, role definitions).

3. **Rules files need `sherpa sync`.** The plugin system gap (no `.claude/rules/` distribution) is confirmed and unlikely to be addressed soon.

4. **The ETH Zurich finding validates our CLAUDE.md standards.** Convention files should be lean — only non-inferable behavioral constraints. The sync tool should encourage concise files, not bloated ones.

## Open Questions

1. Should `sherpa sync` ALSO generate an AGENTS.md from the synced conventions? This would bridge the gap between Sherpa's convention format and the cross-tool standard.
2. Does Microsoft's APM lockfile approach (`apm.lock`) offer any ideas for `sherpa.manifest.json` design?
3. Should Sherpa contribute to or adopt the Agentic AI Foundation standards rather than building a proprietary convention format?
