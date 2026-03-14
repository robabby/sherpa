# Vector 2: Advanced Product Teams Using AI Skills

**Question:** How have the most advanced product teams integrated AI agents into their product development workflows?
**Agent dispatched:** 2026-03-13

## Findings

### Enterprise Case Studies

**TELUS** (57,000 employees): 13,000 custom AI solutions, 30% faster engineering code shipping, 500,000+ hours saved total.

**Rakuten**: Claude Code implemented activation vector extraction in vLLM (12.5M-line codebase) in 7 hours with 99.9% numerical accuracy, zero human code contribution during execution.

**Zapier**: 89% AI adoption across the entire organization with 800+ agents deployed internally.

**CompanyOS**: A company running entirely on ~2,000 lines of markdown files across 12 skills, connecting to 8 external systems (Linear, Gmail, Google Calendar, Help Scout, Notion, Sentry, Stripe, Granola). Routes billing queries to Stripe, bug reports to Sentry/Linear, runs parallel SQL queries for operational dashboards. No traditional application code, web UI, or deployed services.

### Dominant Workflow Patterns

**Plan-Execute (Most Widely Adopted):** Plan Mode (read-only codebase analysis) -> iterate on plan with human -> Auto-Execute. The markdown plan acts as shared mutable state between developer and AI.

**Obra/Superpowers (Most Complete Methodology):** Seven-stage agentic development:
1. Brainstorming (Socratic questioning before implementation)
2. Git Worktrees (isolated branches with verified baselines)
3. Plan Writing (2-5 minute tasks with file paths and verification steps)
4. Execution (subagents per task with dual-phase review)
5. TDD (red-green-refactor; deletes code written before tests)
6. Code Review (validates against plan; blocks on critical issues)
7. Branch Completion (merge/PR options, workspace cleanup)

**Spec-Driven Development (Pimzino):** Requirements -> Design -> Tasks -> Implementation pipeline with 14 slash commands, steering documents, cached context, and auto-generated specifications. Also has a companion MCP server with web dashboard.

### Published Frameworks for Human+AI Product Development

**Agentsway** (Academic, arXiv 2510.23664): First published methodology explicitly designed for AI agent-based software engineering teams. Defines roles for planning, prompting, coding, testing, and fine-tuning agents with a human orchestrator.

**Agentic SDLC**: State machine: INTENT -> SPEC -> PLAN -> IMPLEMENT -> VERIFY -> DOCS -> REVIEW -> RELEASE -> MONITOR -> ITERATE. Three actor types: human activities, human-AI interactions, and AI agent operations.

**Co-Evolutionary Model** (Academic, arXiv 2507.01069): Maps agentic AI capabilities across the full product lifecycle (discovery, scoping, business case, development, testing, launch). Emphasizes mutual adaptation between PMs and AI.

**Augment Code's Spec-Driven Development**: Coordinator agent breaks specs into tasks, Implementor agents execute in parallel, Verifier checks results. Claims 6-month feature cycles compressed to 6 weeks.

### Human Oversight Models (2026 Consensus)

Four levels:
- **Human-in-the-Loop**: Direct intervention (high-risk changes)
- **Human-on-the-Loop**: Meaningful control (medium-risk, review dashboards)
- **Human-above-the-Loop**: Strategic governance (architecture decisions)
- **Human-behind-the-Loop**: Post-operational analysis (metrics, retrospectives)

The dominant 2026 pattern is **"bounded autonomy"** — clear operational limits, mandatory escalation paths, comprehensive audit trails.

### Skills Ecosystem Landscape

**Official Anthropic Skills Repository**: 17 official skills covering documents, design, development, communication, and a skill-creator meta-skill (github.com/anthropics/skills, 92.7k stars).

**Company-Published Skills:**
- Vercel: react-best-practices, next-best-practices, web-design-guidelines
- Stripe: stripe-best-practices, upgrade-stripe
- Cloudflare: agents-sdk, durable-objects, web-perf, wrangler
- Netlify: netlify-functions, edge-functions, db, ai-gateway
- Trail of Bits: static-analysis (CodeQL/Semgrep), variant-analysis (found real CVEs)
- Expo, Sentry, Hugging Face also listed

**Community Marketplaces:**

| Marketplace | Scale | Notes |
|---|---|---|
| SkillsMP | 400,000+ indexed | Aggregates from GitHub, open standard SKILL.md format |
| SkillHub | 7,000+ AI-evaluated | Cross-platform: Claude, Codex, Gemini, OpenCode |
| Claude Skills Market | 119+ curated free | Community-curated |
| awesome-claude-skills | 1,234+ cataloged | Community-maintained, v7.3.0 |
| alirezarezvani/claude-skills | 180+ production-ready | 4,400+ GitHub stars |
| obra/superpowers | 15+ battle-tested dev | MIT license, full methodology |
| deanpeters/Product-Manager-Skills | 46 PM skills + 6 workflows | JTBD, discovery, roadmap, PRD |

**Most-Installed Skills (March 2026):**
1. find-skills: 418.6K installs
2. vercel-react-best-practices: 176.4K installs
3. web-design-guidelines: 137.0K installs
4. frontend-design: 124.1K installs

### Notable Individual Skills

- **Loki Mode** (37 agents): Autonomous startup builder. Takes a PRD and orchestrates engineering, testing, deployment, marketing agents with circuit breakers and failure recovery.
- **planning-with-files**: Manus-style persistent markdown planning. Treats context window as RAM, filesystem as disk.
- **SuperMemory**: State-of-the-art memory layer (16.7K GitHub stars), tracks facts over time, handles contradictions, auto-forgets expired info.
- **Google Workspace CLI (gws)**: 4,900 stars in first 3 days. Automates Gmail, Sheets, Calendar, Docs from a single prompt.

## Sources

- [How Anthropic teams use Claude Code](https://claude.com/blog/how-anthropic-teams-use-claude-code)
- [Eight trends defining how software gets built in 2026](https://claude.com/blog/eight-trends-defining-how-software-gets-built-in-2026)
- [Anthropic 2026 Agentic Coding Trends Report](https://resources.anthropic.com/hubfs/2026%20Agentic%20Coding%20Trends%20Report.pdf)
- [Running a Company on Markdown Files](https://adventuresinclaude.ai/posts/2026-02-21-running-a-company-on-markdown-files/)
- [obra/superpowers](https://github.com/obra/superpowers)
- [Pimzino claude-code-spec-workflow](https://github.com/Pimzino/claude-code-spec-workflow)
- [Automate workflows with hooks](https://code.claude.com/docs/en/hooks-guide)
- [Orchestrate teams of Claude Code sessions](https://code.claude.com/docs/en/agent-teams)
- [Claude Skills as Self-Documenting Runbooks](https://zackproser.com/blog/claude-skills-internal-training)
- [arxiv.org/abs/2510.23664](https://arxiv.org/abs/2510.23664) (Agentsway)
- [arxiv.org/abs/2507.01069](https://arxiv.org/abs/2507.01069) (Co-Evolutionary Model)
- [Augment Code: Spec-Driven Development](https://www.augmentcode.com/guides/ai-spec-driven-development-workflows)
- [VoltAgent/awesome-agent-skills](https://github.com/VoltAgent/awesome-agent-skills)
- [SkillsMP](https://skillsmp.com)
- [SkillHub](https://www.skillhub.club)
- [awesome-claude-skills](https://github.com/travisvn/awesome-claude-skills)
- [deanpeters/Product-Manager-Skills](https://github.com/deanpeters/Product-Manager-Skills)

## Raw Links

- https://claude.com/blog/how-anthropic-teams-use-claude-code
- https://claude.com/blog/eight-trends-defining-how-software-gets-built-in-2026
- https://resources.anthropic.com/hubfs/2026%20Agentic%20Coding%20Trends%20Report.pdf
- https://adventuresinclaude.ai/posts/2026-02-21-running-a-company-on-markdown-files/
- https://github.com/obra/superpowers
- https://github.com/Pimzino/claude-code-spec-workflow
- https://code.claude.com/docs/en/hooks-guide
- https://code.claude.com/docs/en/agent-teams
- https://zackproser.com/blog/claude-skills-internal-training
- https://arxiv.org/abs/2510.23664
- https://arxiv.org/abs/2507.01069
- https://www.augmentcode.com/guides/ai-spec-driven-development-workflows
- https://github.com/VoltAgent/awesome-agent-skills
- https://skillsmp.com
- https://www.skillhub.club
- https://github.com/travisvn/awesome-claude-skills
- https://github.com/alirezarezvani/claude-skills
- https://github.com/asklokesh/claudeskill-loki-mode
- https://github.com/OthmanAdi/planning-with-files
- https://github.com/deanpeters/Product-Manager-Skills
- https://codewithmukesh.com/blog/plan-mode-claude-code/
- https://medium.com/@ondrej.machart/13-claude-code-projects-that-changed-my-product-manager-role-over-the-last-6-months-7057b9045d51
- https://www.sachinrekhi.com/p/claude-code-for-product-managers
- https://www.reforge.com/blog/ai-prototyping-product-development

## Implications

- Our research-first pipeline (/rr -> approve -> plan -> build) is more rigorous than most published workflows, which tend to start at "spec" or "plan." The research phase is our differentiator.
- The "bounded autonomy" pattern validates our Planner/Worker/Judge dispatch model — humans set boundaries, agents execute within them.
- CompanyOS running entirely on markdown + skills is directionally where Sherpa is heading.
- The skills ecosystem is massive but shallow — most skills are simple instruction sets. Our skills (especially /rr) are significantly more sophisticated process definitions.
- 46 PM skills from deanpeters is worth mining for ideas, especially JTBD and discovery frameworks.

## Open Questions

- Should our post-research skills be publishable to the skills marketplace? They're process-agnostic enough to be useful elsewhere.
- How do teams handle the Plan -> Execute transition when the plan reveals the original research was insufficient? Is there a formal "back to /rr" trigger?
- CompanyOS pattern: could Sherpa skills eventually replace application code for certain operational workflows?
