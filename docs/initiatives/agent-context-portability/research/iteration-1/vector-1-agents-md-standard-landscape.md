# Vector 1: AGENTS.md Standard Landscape

**Question:** What is the current state of agent context file conventions (AGENTS.md, CLAUDE.md, COPILOT.md, .cursorrules, etc.)? Is there convergence toward a standard, or fragmentation?
**Agent dispatched:** 2026-03-18

## Findings

**AGENTS.md is a real, well-adopted standard with serious institutional backing**

- Created by OpenAI, released August 2025 alongside Codex CLI. ([InfoQ](https://www.infoq.com/news/2025/08/agents-md/))
- Adopted by 60,000+ open source projects as of late 2025. ([agents.md](https://agents.md/))
- Donated to the **Agentic AI Foundation (AAIF)** under the Linux Foundation in December 2025. Platinum members: AWS, Anthropic, Block, Bloomberg, Cloudflare, Google, Microsoft, OpenAI. ([Linux Foundation press release](https://www.linuxfoundation.org/press/linux-foundation-announces-the-formation-of-the-agentic-ai-foundation))
- Format: deliberately simple Markdown. No JSON schema, no YAML, no special syntax. Just headings and prose. ([agents.md](https://agents.md/))

**Tool-by-tool adoption status (as of March 2026)**

| Tool | Native file | Reads AGENTS.md? | Notes |
|------|------------|-------------------|-------|
| OpenAI Codex CLI | `AGENTS.md` | Yes (origin tool) | Walks directory tree, supports `AGENTS.override.md`, 32KB limit |
| Anthropic Claude Code | `CLAUDE.md` | **No** | 3,264-upvote open issue (#6235). No official response. Workaround: symlink or `@`-import |
| GitHub Copilot | `.github/copilot-instructions.md` | Yes (since Aug 2025) | Also reads CLAUDE.md and GEMINI.md |
| Cursor | `.cursor/rules/*.mdc` | Yes | Supports AGENTS.md natively alongside its own system |
| Google Gemini CLI | `GEMINI.md` | Yes (community discussion) | Hierarchical GEMINI.md system |
| Windsurf (Codeium) | `.windsurfrules` | Yes | Supports both formats |
| JetBrains Junie | `.junie/guidelines.md` | Yes | Looks for `.junie/AGENTS.md` first |
| Amp (Sourcegraph) | `AGENTS.md` | Yes (primary) | Walks up to $HOME |
| Aider | `AGENTS.md` | Yes | Listed on agents.md |
| Devin (Cognition) | `AGENTS.md` | Yes | Listed on agents.md |

**Claude Code is the notable holdout** — Anthropic is a platinum AAIF member but Claude Code does not read AGENTS.md natively. 3,264-upvote issue with no official response.

**The ETH Zurich caution (February 2026):** LLM-generated AGENTS.md files reduce task success by ~3% and increase cost by 20%. Human-written files improve success by only ~4%. Recommendation: limit context files to truly non-inferable details. ([arxiv.org/abs/2602.11988](https://arxiv.org/abs/2602.11988))

**CLAUDE.md has richer features than AGENTS.md:** glob-scoped rules, `@path` imports, managed policy, auto-memory, skills. AGENTS.md is deliberately simpler.

## Sources

- [InfoQ — AGENTS.md announcement](https://www.infoq.com/news/2025/08/agents-md/)
- [agents.md — official site](https://agents.md/)
- [Linux Foundation — AAIF formation](https://www.linuxfoundation.org/press/linux-foundation-announces-the-formation-of-the-agentic-ai-foundation)
- [OpenAI Codex AGENTS.md guide](https://developers.openai.com/codex/guides/agents-md)
- [Claude Code issue #6235](https://github.com/anthropics/claude-code/issues/6235)
- [GitHub Changelog — Copilot AGENTS.md support](https://github.blog/changelog/2025-08-28-copilot-coding-agent-now-supports-agents-md-custom-instructions/)
- [Cursor docs — rules](https://cursor.com/docs/rules)
- [Gemini CLI docs](https://geminicli.com/docs/cli/gemini-md/)
- [Windsurf docs](https://docs.windsurf.com/windsurf/cascade/agents-md)
- [JetBrains Junie docs](https://junie.jetbrains.com/docs/guidelines-and-memory.html)
- [Amp manual](https://ampcode.com/manual)
- [ETH Zurich paper](https://arxiv.org/abs/2602.11988)
- [Addy Osmani on AGENTS.md](https://addyosmani.com/blog/agents-md/)

## Implications

- The symlink approach (`AGENTS.md → CLAUDE.md`) is the correct tactical move — it's the community-standard workaround
- When Claude Code eventually supports AGENTS.md natively, symlinks become redundant, not broken
- AGENTS.md content should follow ETH Zurich guidance: non-inferable details only, not architecture overviews
- Two-tier model validated: AGENTS.md for cross-tool baseline, `.claude/rules/` for Claude Code-specific precision

## Open Questions

1. When will Claude Code add native AGENTS.md support?
2. Should AGENTS.md and CLAUDE.md diverge in content (Claude-specific references like `/rr` are harmless but noisy)?
3. Will `.claude/rules/` get a cross-tool equivalent under AAIF?
4. Symlinks don't work well on Windows — generate a copy instead?
