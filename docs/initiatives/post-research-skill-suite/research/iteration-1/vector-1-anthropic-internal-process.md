# Vector 1: Anthropic's Internal Product Process & Skills Ecosystem

**Question:** How does Anthropic's internal product team operate? What skills do they use?
**Agent dispatched:** 2026-03-13

## Findings

### "Docs to Demos" — Anthropic's Core Methodology

Anthropic has adopted a distinctive product development process that skips traditional specs entirely. Product lead Catherine Wu describes it as **"docs to demos"**:

- **No PRDs.** No 10-page product requirements documents, no detailed requirements specs, no endless planning meetings.
- **Prototype first.** They build a working prototype using Claude Code, often in hours.
- **Ship internally to everyone.** The prototype goes to the entire company (not a small test group). Anthropic calls this **"antfooding"** (their term for dogfooding — internal employees are affectionately called "ants").
- **Learn from real usage.** Qualitative and quantitative feedback from internal usage determines what to do next. The prototype *becomes* the spec, internal usage *becomes* the research, and feedback *becomes* the roadmap.
- **Self-reinforcing loop.** They build Claude Code features using Claude Code, so every improvement to the tool improves how they build the next improvement.

Felix Rieseberg's team went from "people are using this wrong" to "launched general-purpose agent product" in approximately 10 days. They still use rigorous specs for safety evaluations, core model training, and enterprise deployments — they know which things need verification by building versus specification.

### Key Organizational Facts

- Ami Vora (former Faire, WhatsApp, Facebook) joined as Head of Product in December 2025
- Rahul Patil (former Stripe CTO) became CTO in October 2025
- Mike Krieger (Instagram co-founder) co-leads Anthropic Labs, an internal incubator for rapid prototyping
- 70-80% of technical Anthropic employees use Claude Code daily
- AI now writes between 70-90% of code at Anthropic; the head of Claude Code reports 100% of his code is AI-generated
- The internal feedback channel for Claude Code receives "a post every five minutes"

### Team-by-Team Usage

| Team | How They Use Claude Code |
|------|--------------------------|
| **Product Engineering** | "First stop" for any programming task. Ask Claude to identify files for bugs/features. Eliminated manual context-gathering. |
| **Product Design** | Feed Figma designs to Claude for autonomous feature development. Write unit tests. Map error states and edge cases during design. |
| **Security Engineering** | Transformed from "design doc -> janky code -> refactor -> give up on tests" to test-driven development with Claude. Incidents resolve 3x faster (10-15 min down to 3-5 min). |
| **Infrastructure / Data Science** | Feed entire codebases for onboarding. Claude explains pipeline dependencies and upstream sources. Replaces traditional data catalogs. |
| **Inference Team** | Data scientists without ML backgrounds use Claude to explain model functions. 80% reduction in research time. Built React apps for RL visualization despite lacking TypeScript fluency. |
| **Growth Marketing** | Agentic workflow processes CSV files of hundreds of ads. Sub-agents generate hundreds of ad variations in minutes. Built Figma plugin for programmatic ad generation. |
| **Legal** | Created prototype "phone tree" systems to connect team members with appropriate lawyers. Non-technical tool building. |
| **Data Infrastructure** | Used during Kubernetes incident — fed dashboard screenshots, Claude guided through GCP UI menus, identified pod IP exhaustion, provided exact fix commands. |

### Internal Slash Commands

- `/PR commit` — streamlines commit creation
- `/commit` — custom commit workflow
- `/feature dev` — structured feature development (created by team member Sid): walks through specification, planning, then step-by-step implementation
- `/code review` — automated PR review
- `/security review` — security-focused analysis

### Power User Patterns

- Running 2-4 simultaneous Claude instances (3 is optimal)
- Triggering agents via Slack for hands-off execution
- Maintaining "diary entries" documenting attempted approaches, failures, and learnings
- Synthesizing logs into observations for future tasks
- Asking Claude to summarize completed sessions and suggest improvements (continuous improvement loop for CLAUDE.md)

### Claude Code's Built-In Skills

| Skill | Purpose |
|-------|---------|
| `/batch <instruction>` | Orchestrate large-scale changes in parallel. Researches codebase, decomposes into 5-30 units, spawns one agent per unit in isolated git worktrees, each implements + tests + opens PR. |
| `/simplify [focus]` | Review recently changed files for code reuse, quality, and efficiency issues. Spawns 3 review agents in parallel, aggregates findings, applies fixes. |
| `/loop [interval] <prompt>` | Run a prompt repeatedly on an interval. |
| `/claude-api` | Load Claude API reference for your project's language. |
| `/debug [description]` | Troubleshoot current session by reading the debug log. |

### Agent Skills Open Standard

Anthropic published Agent Skills as an open standard on December 18, 2025, via agentskills.io:

- **Cross-platform:** Adopted by 26+ platforms including Claude, OpenAI Codex, Gemini CLI, GitHub Copilot, Cursor, VS Code
- **Spec:** A skill is a directory containing at minimum a SKILL.md file with YAML frontmatter + markdown instructions
- **Progressive disclosure:** Only skill name/description loads initially. Full content loads when relevant.
- **Adopters:** Microsoft, OpenAI, Atlassian, Figma, Cursor, GitHub

### Key Engineering Blog Posts

| Post | Key Insight |
|------|------------|
| Effective Context Engineering | Context is finite; use progressive disclosure, just-in-time retrieval, compaction, and sub-agent architectures. |
| Building Effective Agents | "Most successful implementations use simple, composable patterns rather than complex frameworks." |
| Multi-Agent Research System | Orchestrator-worker pattern. Multi-agent outperformed single-agent by 90.2%. Token usage explains 80% of performance variance. |
| Effective Harnesses for Long-Running Agents | Use human engineering patterns (checkpointing, structured notes, explicit handoffs) for agents spanning multiple context windows. |

## Sources

- [How Anthropic Teams Use Claude Code](https://claude.com/blog/how-anthropic-teams-use-claude-code)
- [How AI Is Transforming Work at Anthropic](https://www.anthropic.com/research/how-ai-is-transforming-work-at-anthropic)
- [How Anthropic Dogfoods On Claude Code](https://cloudnativenow.com/features/how-anthropic-dogfoods-on-claude-code/)
- [Coder Blog: Inside Anthropic's AI-First Development](https://coder.com/blog/inside-anthropics-ai-first-development)
- [Podcast: How to Use Claude Code Like the People Who Built It](https://every.to/podcast/transcript-how-to-use-claude-code-like-the-people-who-built-it)
- [Top Engineers Say AI Writes 100% of Code (Fortune)](https://fortune.com/2026/01/29/100-percent-of-code-at-anthropic-and-openai-is-now-ai-written-boris-cherny-roon/)
- [Claude Code Skills Documentation](https://code.claude.com/docs/en/skills)
- [Anthropic Skills Repository](https://github.com/anthropics/skills/)
- [Claude Code Plugins Discovery](https://code.claude.com/docs/en/discover-plugins)
- [Equipping Agents for the Real World with Agent Skills](https://claude.com/blog/equipping-agents-for-the-real-world-with-agent-skills)
- [Agent Skills Standard](https://agentskills.io/specification)

## Raw Links

- https://claude.com/blog/how-anthropic-teams-use-claude-code
- https://www.anthropic.com/research/how-ai-is-transforming-work-at-anthropic
- https://cloudnativenow.com/features/how-anthropic-dogfoods-on-claude-code/
- https://coder.com/blog/inside-anthropics-ai-first-development
- https://every.to/podcast/transcript-how-to-use-claude-code-like-the-people-who-built-it
- https://fortune.com/2026/01/29/100-percent-of-code-at-anthropic-and-openai-is-now-ai-written-boris-cherny-roon/
- https://code.claude.com/docs/en/skills
- https://github.com/anthropics/skills/
- https://code.claude.com/docs/en/discover-plugins
- https://claude.com/blog/equipping-agents-for-the-real-world-with-agent-skills
- https://agentskills.io/specification
- https://resources.anthropic.com/hubfs/2026%20Agentic%20Coding%20Trends%20Report.pdf
- https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents
- https://www.anthropic.com/engineering/building-effective-agents
- https://www.anthropic.com/engineering/multi-agent-research-system
- https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents
- https://www.anthropic.com/engineering/writing-tools-for-agents
- https://www.anthropic.com/engineering/claude-code-sandboxing
- https://code.claude.com/docs/en/best-practices

## Implications

- Anthropic's "docs to demos" approach validates rapid prototyping over heavy specification — but they still use rigorous specs for safety/core model work. The lesson is knowing WHEN to spec vs. prototype.
- Their internal skills (`/feature dev`, `/code review`) are simpler and more action-oriented than our research-heavy pipeline. This is intentional — different problem domain.
- The "diary entries" pattern maps to our activity logs. Their "synthesize logs into observations" pattern is something we could automate as a skill.
- 3 simultaneous Claude instances as optimal suggests our parallel agent dispatch in /rr is well-calibrated.

## Open Questions

- How does Anthropic handle the transition from prototype to production? Is there a "hardening" phase?
- What does their internal `/feature dev` skill actually contain? Only surface details are published.
- Does the "antfooding" approach work for teams without Anthropic's density of technical users?
