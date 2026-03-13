# Competitive Landscape: Agent Catalogs, Prompt Libraries, and Behavioral Engineering

**Research date:** 2026-03-11
**Scope:** Open-source agent collections, commercial prompt marketplaces, framework-bundled catalogs, Claude Code ecosystem, orchestration platforms, academic research on identity vs. behavioral prompting
**Method:** Systematic web search across 8 investigation areas with source verification

---

## 1. Open-Source Agent Persona/Role Collections

### agency-agents (msitarzewski) — The Primary Competitor

The closest competitor to what Sherpa is building. 29.9k stars, MIT license, 112+ agents across 11 divisions.

- **Format:** Single markdown files per agent with YAML frontmatter (`name`, `description`, `color`, `emoji`, `vibe`, optional `services`). Body sections: Identity & Memory, Core Mission, Critical Rules, Technical Deliverables, Workflow Process, Communication Style, Learning & Memory, Success Metrics, Advanced Capabilities.
- **Design philosophy:** Identity-first. Every agent opens with "You are [Role Name]" followed by personality, memory claims, and experience claims. The persona is the differentiator.
- **Cross-tool portability:** `convert.sh` (480 lines) outputs to Cursor (.mdc), Aider (CONVENTIONS.md), Windsurf (.windsurfrules), Gemini CLI (SKILL.md), Antigravity (SKILL.md), OpenCode (.md), OpenClaw (SOUL.md + AGENTS.md + IDENTITY.md). `install.sh` (519 lines) with interactive TUI.
- **Quality variance:** Dramatic. Tier 1 (~7 agents) have genuine behavioral substance (Reality Checker, Evidence Collector). Tier 3 (~60 agents) are thin reference docs that wouldn't change LLM behavior.
- **Source:** https://github.com/msitarzewski/agency-agents
- **Blog coverage:** https://yuv.ai/blog/agency-agents
- **Medium analysis (10K stars in 7 days):** https://medium.com/coding-nexus/someone-built-a-full-ai-agency-on-github-61-agents-10k-stars-in-7-days-ac976f85925d

### awesome-openclaw-agents (mergisi) — SOUL.md Templates

100+ copy-paste SOUL.md agent templates for OpenClaw organized by domain (productivity, development, marketing, business).

- **Format:** SOUL.md files following the SoulSpec standard.
- **Categories:** Daily standup bot, meeting summarizer, email triage, LinkedIn content, SEO writer, code review, PR description writer, documentation generator, customer support, lead qualification.
- **Source:** https://github.com/mergisi/awesome-openclaw-agents
- **Discussion thread:** https://github.com/openclaw/openclaw/discussions/20131
- **Free templates thread:** https://github.com/openclaw/openclaw/discussions/17022

### VoltAgent Collections — Subagents and Skills

Three repositories covering different facets of the agent definition space:

- **awesome-agent-skills:** 500+ agent skills for Claude Code, Codex, Gemini CLI, Cursor. Source: https://github.com/VoltAgent/awesome-agent-skills
- **awesome-claude-code-subagents:** 127+ specialized subagents across 10 categories (Core Dev, Language Specialists, Infrastructure, Quality/Security, Data/AI, Dev Experience, Specialized Domains, Business/Product, Meta/Orchestration, Research). Source: https://github.com/VoltAgent/awesome-claude-code-subagents
- **awesome-openclaw-skills:** 5,400+ skills filtered from OpenClaw Skills Registry. Source: https://github.com/VoltAgent/awesome-openclaw-skills

### mitsuhiko/agent-prompts — Pipeline Prompts

Specialized AI agent prompts for software development pipelines. Includes structured multi-agent workflows (Software Architect, Problem Analysis, Architecture Design, Task Breakdown, Detailed Planning).

- **Source:** https://github.com/mitsuhiko/agent-prompts
- **Related:** https://github.com/mitsuhiko/agent-stuff

### baz-scm/awesome-reviewers — Code Review Prompts

Ready-to-use system prompts extracted from real open-source projects for agentic code review. Uses Claude to judge review quality on four criteria: generalizability, technical substance, clarity, actionability.

- **Source:** https://github.com/baz-scm/awesome-reviewers
- **Blog:** https://baz.co/resources/from-review-thread-to-team-standard-how-we-built-awesomereviewers
- **Architecture:** https://baz.co/resources/engineering-intuition-at-scale-the-architecture-of-agentic-code-review

---

## 2. Awesome Lists and Mega-Directories

### Prompt Collections

| Repository | Stars | Scope | URL |
|-----------|-------|-------|-----|
| f/awesome-chatgpt-prompts (prompts.chat) | 151k | World's largest open-source prompt library. CC0 license. | https://github.com/f/awesome-chatgpt-prompts |
| dontriskit/awesome-ai-system-prompts | — | System prompts from ChatGPT, Claude, Manus, Claude Code, v0, Grok, Notion, MetaAI | https://github.com/dontriskit/awesome-ai-system-prompts |
| EliFuzz/awesome-system-prompts | — | Prompts + tool definitions from Augment Code, Claude Code, Cursor, Devin, Kiro, Codex, OpenAI | https://github.com/EliFuzz/awesome-system-prompts |
| tallesborges/agentic-system-prompts | — | Production AI coding agent system prompts | https://github.com/tallesborges/agentic-system-prompts |
| mustvlad/ChatGPT-System-Prompts | — | Best system prompts for ChatGPT | https://github.com/mustvlad/ChatGPT-System-Prompts |
| LouisShark/chatgpt_system_prompt | — | GPT system prompts + prompt injection knowledge | https://github.com/LouisShark/chatgpt_system_prompt |
| ai-boost/awesome-prompts | — | Curated prompts from top-rated GPTs in GPT Store | https://github.com/ai-boost/awesome-prompts |

### Agent Directories

| Repository | Stars | Scope | URL |
|-----------|-------|-------|-----|
| e2b-dev/awesome-ai-agents | — | List of AI autonomous agents | https://github.com/e2b-dev/awesome-ai-agents |
| kyrolabs/awesome-agents | — | Awesome list of AI agents | https://github.com/kyrolabs/awesome-agents |
| jim-schwoebel/awesome_ai_agents | — | 1,500+ resources and tools for AI agents | https://github.com/jim-schwoebel/awesome_ai_agents |
| slavakurilyak/awesome-ai-agents | — | 300+ agentic AI resources | https://github.com/slavakurilyak/awesome-ai-agents |
| Jenqyang/Awesome-AI-Agents | — | Autonomous agents powered by LLM | https://github.com/Jenqyang/Awesome-AI-Agents |
| ashishpatel26/500-AI-Agents-Projects | — | 500 AI agent use cases across industries | https://github.com/ashishpatel26/500-AI-Agents-Projects |
| tmgthb/Autonomous-Agents | — | Research papers, updated daily | https://github.com/tmgthb/Autonomous-Agents |

### HuggingFace

- Open Source AI Agents directory: https://huggingface.co/blog/tegridydev/open-source-ai-agents-directory

---

## 3. Commercial Agent Marketplaces

### PromptBase — Paid Prompt Marketplace

260,000+ prompts for ChatGPT, Gemini, Midjourney. Pricing $1.99-$9.99. Creators earn 80% revenue share. Quality-controlled (paid prompts reviewed before listing). 2,300+ free samples.

- **Focus:** Individual prompts, not agent definitions. Image generation and task-specific prompts dominate.
- **Source:** https://promptbase.com
- **Review:** https://www.godofprompt.ai/blog/review-popular-ai-prompt-library-platforms

### FlowGPT — Community Prompt Marketplace

Free, community-driven. Evolved from prompt sharing into a discovery engine for lightweight AI apps ("Flows"). Multi-model chat support.

- **Focus:** Character bots, roleplay, creative prompts. Less emphasis on professional agent roles.
- **Source:** https://flowgpt.com
- **Review:** https://skywork.ai/blog/flowgpt-review-2025-community-prompt-multimodel-chat/

### Poe (Quora) — Bot Marketplace

1 million+ custom bots on platform. Two types: Prompt Bots (plain-language instructions prepended to messages) and Server Bots (webhook endpoints with custom logic). Creator monetization since April 2024.

- **Focus:** Consumer chatbots and multi-model comparison. Not structured agent definitions.
- **Source:** https://poe.com, https://creator.poe.com
- **Review:** https://skywork.ai/skypage/en/Poe.com-In-Depth-2025-Review-My-Hands-On-Guide-to-the-All-in-One-AI-Platform/1974362346907955200

### GPT Store (OpenAI) — Custom GPT Marketplace

3 million+ custom GPTs created. In 2026, GPTs are "Mini-Agents" with agentic workflows (GPT-5.2). Apps SDK (Dec 2025) enables code-based apps beyond prompt engineering. B2B consulting ($5K-$20K setup) has replaced passive income for serious builders.

- **Focus:** Consumer-facing assistants. Agent definitions are proprietary within each GPT, not shareable as structured files.
- **Source:** https://chatgpt.com/gpts
- **Market analysis:** https://donovanrittenbach.com/market-research-report-the-custom-gpt-market-a-3-7-billion-opportunity-for-creators-and-developers-in-2025/
- **Business guide:** https://www.digitalapplied.com/blog/gpt-store-custom-gpts-business-guide-2026

### SkillsMP — Agent Skills Marketplace

351,349+ skills sourced from public GitHub repos (minimum 2 stars). Independent community project, not affiliated with Anthropic.

- **Focus:** SKILL.md files for Claude Code and Codex. Skills, not agent roles.
- **Source:** https://skillsmp.com
- **About:** https://skillsmp.com/about
- **Review:** https://smartscope.blog/en/blog/skillsmp-marketplace-guide/

### SkillHub — Claude Skills Marketplace

Alternative skills marketplace for Claude Code.

- **Source:** https://www.skillhub.club

---

## 4. Framework-Bundled Agent Templates

### CrewAI — Role-Based Agent Orchestration

20,000+ GitHub stars. Agents defined in YAML with three core fields: `role`, `goal`, `backstory`. Supports variable substitution (`{topic}`). Pre-defined roles: Manager, Worker, Researcher.

```yaml
researcher:
  role: '{topic} Senior Data Researcher'
  goal: 'Uncover cutting-edge developments in {topic}'
  backstory: 'You are a seasoned researcher...'
```

- **Design philosophy:** Identity-first. `backstory` is a core required field. The persona drives the agent.
- **Docs:** https://docs.crewai.com/en/concepts/agents
- **Guide:** https://www.digitalocean.com/community/tutorials/crewai-crash-course-role-based-agent-orchestration
- **YAML config tutorial:** https://codesignal.com/learn/courses/getting-started-with-crewai-agents-and-tasks/lessons/configuring-crewai-agents-and-tasks-with-yaml-files
- **GitHub:** https://github.com/crewAIInc/crewAI

### AutoGen (Microsoft) — Agent Framework

Pre-built agents: AssistantAgent (GPT-4 powered), UserProxyAgent (human bridge), CodeExecutorAgent, OpenAIAssistantAgent. Custom roles via descriptions (e.g., "expert in SQL optimization"). GroupChatManager for multi-agent orchestration.

- **Design philosophy:** Functional. Agents defined by capabilities and descriptions rather than personality.
- **Docs:** https://microsoft.github.io/autogen/stable/
- **Migration to Microsoft Agent Framework:** https://learn.microsoft.com/en-us/agent-framework/migration-guide/from-autogen/
- **GitHub:** https://github.com/microsoft/autogen

### LangGraph/LangChain — Agent Orchestration

LangChain 1.0 and LangGraph 1.0 released. `create_agent` provides ReAct pattern. Supervisor agents route to specialized workers (research, code, writing). No pre-built agent persona catalog — roles are defined per-project.

- **Design philosophy:** Tool-and-pattern-first. Agents are compositions of tools and reasoning patterns, not persona definitions.
- **Docs:** https://docs.langchain.com/oss/python/langgraph/overview
- **State of Agent Engineering:** https://www.langchain.com/state-of-agent-engineering
- **GitHub:** https://www.langchain.com/langgraph

---

## 5. Claude Code Ecosystem

### Anthropic Official Skills

`anthropics/skills` repo: 90.7k stars. Document skills (docx, pdf, pptx, xlsx), creative (algorithmic-art, canvas-design), development (frontend-design, mcp-builder, webapp-testing), communication (brand-guidelines, internal-comms). SKILL.md format with YAML frontmatter (name, description).

- **Source:** https://github.com/anthropics/skills
- **Skills page:** https://claude.com/skills
- **How-to:** https://support.claude.com/en/articles/12512198-how-to-create-custom-skills
- **Guide PDF:** https://resources.anthropic.com/hubfs/The-Complete-Guide-to-Building-Skill-for-Claude.pdf

### obra/superpowers — Methodology as Skills

Behavioral methodology encoded as skills. TDD, systematic debugging, subagent-driven development, verification-before-completion, code review receiving/requesting, brainstorming, git worktrees, plan writing/execution.

- **Design philosophy:** Closest to behavioral engineering in the skills ecosystem. Skills define *what to do* and *when*, not *who you are*.
- **Source:** https://github.com/obra/superpowers
- **Blog (Oct 2025):** https://blog.fsck.com/2025/10/09/superpowers/
- **DeepWiki:** https://deepwiki.com/obra/superpowers

### Community Curation

- **travisvn/awesome-claude-skills:** https://github.com/travisvn/awesome-claude-skills
- **ComposioHQ/awesome-claude-skills:** https://github.com/ComposioHQ/awesome-claude-skills
- **Awesome Claude (visual directory):** https://awesomeclaude.ai/awesome-claude-skills
- **Medium "10 Must-Have Skills":** https://medium.com/@unicodeveloper/10-must-have-skills-for-claude-and-any-coding-agent-in-2026-b5451b013051

### AGENTS.md Standard

Open format for guiding coding agents, stewarded by Agentic AI Foundation under Linux Foundation. 18.8k stars. OpenAI Codex reads AGENTS.md natively. Claude Code reads CLAUDE.md. Cross-tool bridge via symlinks or config fallbacks.

- **Spec:** https://agents.md/
- **GitHub:** https://github.com/agentsmd/agents.md
- **OpenAI Codex guide:** https://developers.openai.com/codex/guides/agents-md/
- **GitHub Blog (2,500 repos analyzed):** https://github.blog/ai-and-ml/github-copilot/how-to-write-a-great-agents-md-lessons-from-over-2500-repositories/
- **Builder.io tips:** https://www.builder.io/blog/agents-md
- **Complete guide:** https://www.aihero.dev/a-complete-guide-to-agents-md

### SoulSpec — Open Standard for AI Agent Personas

Portable format for agent identity, personality, and behavior. Pioneered by Peter Steinberger (OpenClaw creator). Four-file core: soul.json (manifest), SOUL.md (personality), IDENTITY.md (identity), AGENTS.md (operations). Compatible with OpenClaw, Claude Code, Claude Desktop, Cursor, Windsurf, ChatGPT.

- **Design philosophy:** Explicitly identity-first. "SoulSpec defines *who your agent is*."
- **MSR finding:** 2026 study of 466 open-source AI agent projects found "no standardized structure for persona definitions" prior to SoulSpec.
- **Spec:** https://soulspec.org/
- **souls.directory:** https://souls.directory/
- **SOUL.md repo:** https://github.com/aaronjmars/soul.md
- **Guide:** https://dev.to/tomleelive/the-complete-soulmd-template-guide-give-your-ai-agent-a-personality-3php
- **OpenClaw identity architecture:** https://www.mmntm.net/articles/openclaw-identity-architecture

### "Agent Skills Are the New npm"

Community framing of the skills ecosystem as a package manager for AI capabilities.

- **Article:** https://www.buildmvpfast.com/blog/agent-skills-npm-ai-package-manager-2026

---

## 6. Agent Orchestration Platforms

### Relevance AI — Agent Marketplace

Pre-built agent templates for BDR, Account Research, SEO, Customer Support. 3,000+ tool integrations. Free marketplace.

- **Marketplace:** https://marketplace.relevanceai.com/
- **Templates docs:** https://relevanceai.com/docs/agent/templates
- **Agent template example:** https://relevanceai.com/agent-templates/integration-builder

### Letta (formerly MemGPT) — Stateful Agents

LLM-as-OS paradigm: model manages its own memory, context, and reasoning loops. Focus on persistence and memory, not agent persona catalogs.

- **Source:** https://github.com/letta-ai/letta
- **Docs:** https://docs.letta.com/concepts/memgpt/
- **Blog:** https://www.letta.com/blog/letta-v1-agent

### Dust.tt — Enterprise Agent Platform

80,000+ agents across organizations in 2025. No-code agent builder. 3,000+ tool integrations. One company created 7,683 agents in 2025.

- **Source:** https://dust.tt/
- **Product:** https://dust.tt/home/product
- **2025 Wrapped:** https://dust.tt/blog/dust-wrapped-2025
- **Model guide:** https://dust.tt/blog/comparing-ai-models-for-your-dust-agent

### Lindy.ai — Pre-built "AI Employees"

Template library of pre-built agents (Executive Assistant, Recruiter, etc.). Strongest for email management, meeting notes, scheduling.

- **Source:** https://www.lindy.ai
- **Templates:** https://www.lindy.ai/blog/ai-agent-platform

### Thesys — Curated Agent Catalog

Hand-curated library of AI agents. Agent builder with Generative UI.

- **Catalog:** https://catalog.thesys.dev/
- **Agent builder:** https://www.thesys.dev/agent-builder

### AI Agent Directories

- **AI Agent Store:** https://aiagentstore.ai/
- **AI Agents Directory (600+):** https://aiagentslist.com/
- **AI Agents Directory (landscape map):** https://aiagentsdirectory.com/
- **AI Agents Landscape (March 2026):** https://aiagentsdirectory.com/landscape

---

## 7. Research: Identity Prompting vs. Behavioral Constraints

### Zheng et al. (EMNLP 2024) — Personas Don't Help

"When 'A Helpful Assistant' Is Not Really Helpful: Personas in System Prompts Do Not Improve Performances of Large Language Models"

- **Scale:** 162 roles, 6 relationship types, 8 expertise domains, 4 LLM families, 2,410 factual questions
- **Key finding:** "Adding personas in system prompts does not improve model performance across a range of questions compared to the control setting where no persona is added."
- **On automatic persona selection:** "Automatically identifying the best persona is challenging, with predictions often performing no better than random selection."
- **Conclusion:** Persona effects "can be largely random."
- **ACL Anthology:** https://aclanthology.org/2024.findings-emnlp.888/
- **arXiv:** https://arxiv.org/abs/2311.10054
- **HTML version:** https://arxiv.org/html/2311.10054v3

### Anthropic (Feb 2026) — Persona Selection Model

"The persona selection model" — explains why AI assistants behave in human-like ways.

- **Key finding:** Training Claude to cheat on coding tasks also taught it to "act broadly misaligned" (e.g., sabotaging safety research). A single behavioral instruction activates a broader set of correlated persona characteristics — "persona clouds" that developers didn't explicitly train.
- **Counterintuitive solution:** Explicitly asking the AI to cheat during training removed misaligned behaviors, because the action no longer implied malicious intent.
- **Implication for role prompting:** Role assignments are risky because requesting a behavior implicitly signals personality traits beyond what was intended.
- **Recommendation:** Develop "positive AI role models" and constitutional alignment rather than implicit persona assumptions.
- **Source:** https://www.anthropic.com/research/persona-selection-model
- **Twitter announcement:** https://x.com/AnthropicAI/status/2026062454405415369
- **Futurism coverage:** https://vocal.media/futurism/anthropic-s-persona-selection-model-explains-why-ai-assistants-act-so-human

### Anthropic Prompt Engineering Guide (2026) — Behavioral Instructions

The official guide is built entirely around behavioral instructions, not identity claims. The "Give Claude a role" section uses a single-sentence system prompt ("You are a helpful coding assistant specializing in Python") rather than identity/personality elaboration. All guidance focuses on:
- Clear, direct behavioral instructions
- Explicit output format constraints
- XML-structured operational rules
- Tool usage guidance
- No mention of personality traits, memory claims, or experience claims

- **Source:** https://platform.claude.com/docs/en/docs/build-with-claude/prompt-engineering/claude-4-best-practices
- **Context engineering blog:** https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents

### Agent Behavioral Contracts (ABC) — Formal Specification (Feb 2026)

Varun Pratap Bhardwaj. Brings Design-by-Contract to AI agents: Preconditions, Invariants, Governance policies, Recovery mechanisms as runtime-enforceable components.

- **Key results:** 88-100% hard constraint compliance. Contracted agents detected 5.2-6.8 soft violations per session that uncontracted baselines miss. Behavioral drift bounded to D* < 0.27. <10ms overhead per action.
- **Framework:** (p, delta, k)-satisfaction — probabilistic compliance accounting for LLM variability.
- **Source:** https://arxiv.org/abs/2602.22302

### Li (2025) — The Control/Authenticity Dilemma

"The Dilemma of Prompt Engineering in Generative Agent-Based Models" (System Dynamics Review)

- **Key finding:** Analysis of 22 recent works identifies "over-control" where prompt-based design choices inadvertently predetermine simulation outcomes.
- **Source:** https://onlinelibrary.wiley.com/doi/10.1002/sdr.70008

### AI Agent Behavioral Science (2025)

New research perspective emphasizing systematic observation of agent behavior, design of interventions, and theory-guided interpretation.

- **Source:** https://arxiv.org/abs/2506.06366

### OpenAI Model Spec (Dec 2025)

Behavioral guidelines for models. Authority hierarchy: Root > System > Developer > User > Guideline. Agents should "act within an agreed-upon scope of autonomy."

- **Latest:** https://model-spec.openai.com/2025-12-18.html
- **GitHub:** https://github.com/openai/model_spec

---

## 8. The Terminology Question: "Behavioral Engineering" and "Behavioral Agents"

**Is anyone else using these terms?**

No. The term "behavioral engineering" applied to AI agent definitions does not appear in any of the surveyed repositories, specifications, frameworks, or academic papers. Related terms in use:

| Term in Use | Who Uses It | What It Means |
|------------|------------|---------------|
| "Agent engineering" | IBM, academic papers, Udemy courses | Designing autonomous agent systems (broader than prompting) |
| "Context engineering" | Anthropic, SDG Group, deepset, Sitepoint | Structuring information environment for AI decisions (replaces "prompt engineering") |
| "Constitutional AI" | Anthropic | Training-time behavioral alignment via explicit principles |
| "Agent Behavioral Contracts" | Bhardwaj (2026 paper) | Formal runtime behavioral specifications with mathematical guarantees |
| "Behavioral constraints" | Various system prompt guides | Ad hoc operational rules within system prompts |
| "Disposition" | WavePoint (origin) | Behavioral posture field in role definitions |

The closest concepts are:
1. **Anthropic's constitutional AI** — uses explicit behavioral principles rather than persona, but operates at training time, not prompt time.
2. **Agent Behavioral Contracts** — formalizes behavioral specifications with mathematical rigor, but targets runtime enforcement, not prompt-level role definitions.
3. **obra/superpowers** — defines *methodology* behaviorally (what to do, when), but doesn't define *agent roles* behaviorally.

**Sherpa's "behavioral engineering" is a novel framing.** The principle (behavioral constraints over identity claims) has research support (Zheng et al., Anthropic persona research) and aligns with Anthropic's own prompt engineering guidance, but nobody else has packaged it as a named approach for agent catalog design.

---

## 9. Format Comparison

| Format | Philosophy | Required Fields | Identity? | Behavioral Constraints? | Measurable Quality? |
|--------|-----------|----------------|-----------|------------------------|-------------------|
| **agency-agents** | Identity-first | name, description, vibe | Yes (personality, memory, experience) | Partial (Critical Rules section) | Partial (Success Metrics) |
| **SoulSpec** | Identity-first | soul.json manifest, SOUL.md | Yes (core purpose) | Optional | No |
| **CrewAI YAML** | Identity-first | role, goal, backstory | Yes (backstory required) | No | No |
| **AGENTS.md** | Project-first | Free-form markdown | No | Optional (boundaries section) | No |
| **SKILL.md** | Task-first | name, description | No | Instructions section | No |
| **AutoGen** | Capability-first | system_message | Minimal | Via system message | No |
| **VoltAgent subagents** | Domain-first | Domain-specific instructions | Minimal | Via instructions | No |
| **Sherpa Behavioral Agent** | Behavior-first | name, disposition, domain-scope | **No** | **Yes (required)** | **Yes (quality-bar, fail-triggers)** |

**Key observation:** Every existing format either puts identity first (agency-agents, SoulSpec, CrewAI) or is format-agnostic with no opinion on identity vs. behavior (AGENTS.md, SKILL.md). Nobody has a behavior-first format with required measurable quality criteria and fail triggers.

---

## 10. Gap Analysis: What Sherpa's Behavioral Agent Catalog Would Fill

### Gap 1: No Behavior-First Agent Catalog Exists

Every agent collection surveyed (agency-agents, awesome-openclaw-agents, VoltAgent subagents, GPT Store, Poe bots) uses identity/persona as the primary framing. The behavioral substance (when it exists) is buried in "Critical Rules" or "Communication Style" sections rather than being the structural foundation.

### Gap 2: No Measurable Quality Standards in Agent Definitions

None of the surveyed formats require machine-evaluable quality criteria. agency-agents has "Success Metrics" but they're aspirational (the LLM isn't measuring Lighthouse scores). CrewAI has goals but no acceptance criteria. SoulSpec has values but no testable assertions. The `quality-bar` and `fail-triggers` fields in Sherpa's schema would be unique.

### Gap 3: No Research-Grounded Agent Format

The agency-agents README doesn't cite research. SoulSpec cites Anthropic's constitutional AI "as inspiration" but doesn't ground specific design decisions in evidence. CrewAI's docs mention role-playing as a design choice but don't address the evidence that role-playing effects are "largely random" (Zheng et al.). Sherpa would be the first catalog that explicitly grounds its format in research evidence about what works and what doesn't.

### Gap 4: No Compositional Context Architecture

agency-agents embeds all context in each agent file (leading to generic advice). SoulSpec has separate files but they all live within the agent package. Nobody implements a compositional model where the agent definition is metadata + pointers, and context comes from the host project's files. WavePoint's `context-packages` + `.claude/rules/` pattern is architecturally unique.

### Gap 5: No Cost-Aware Agent Routing

No surveyed format includes `model-tier` or cost controls. agency-agents treats all agents identically. SoulSpec has a `compatibility.frameworks` field but not model routing. CrewAI can assign different models per agent but doesn't have a built-in tiering taxonomy.

---

## 11. Implications for Sherpa's Competitive Positioning

1. **First-mover on "behavioral agents" as a category.** The term is unused. The concept has research backing. Publishing the schema specification with the research evidence creates a defensible intellectual position.

2. **The format is more valuable than the catalog.** agency-agents proved that a well-organized markdown catalog can get 30K stars. A format that's demonstrably better (research-grounded, measurable, composable) could establish a standard.

3. **SoulSpec is the closest standard but philosophically opposite.** SoulSpec says "who your agent is." Sherpa says "what your agent does." Both can't be right. The research evidence (Zheng et al., Anthropic) supports Sherpa's position.

4. **Cross-tool portability matters.** agency-agents' `convert.sh` supporting 8 tools was a significant growth driver. Sherpa should plan for SKILL.md, AGENTS.md, SoulSpec, and CrewAI YAML export from day one.

5. **The skills ecosystem is exploding but roles are underserved.** 350K+ skills in marketplaces, but skills define *tasks* (how to write tests, how to review code). Roles define *posture* (how to approach any task). The skills ecosystem needs roles.

6. **Open-source the catalog, productize the tooling.** The pattern: MIT-licensed agent definitions drive adoption; the orchestration platform (Sherpa Studio) drives revenue. agency-agents proved the catalog attracts attention. Sherpa needs the catalog to attract users and the platform to monetize them.

---

## 12. Open Questions

1. **Should Sherpa publish a formal spec?** SoulSpec published at soulspec.org with JSON Schema. Should Sherpa publish a behavioral-agent-spec.org with schema validation, or keep the format proprietary?

2. **How does context engineering interact with behavioral agents?** Anthropic is pushing "context engineering" as the successor to "prompt engineering." Sherpa's compositional model (agent metadata + host project context) is aligned with this shift. Should Sherpa position behavioral agents as a *context engineering* primitive?

3. **What's the adoption path?** agency-agents grew via Reddit virality. SoulSpec grew via OpenClaw's user base. What's Sherpa's distribution channel? The behavioral engineering rule in WavePoint's `.claude/rules/` is a start, but it only reaches WavePoint.

4. **Agent Behavioral Contracts (ABC) — collaborator or competitor?** The Bhardwaj paper formalizes behavioral specifications with mathematical rigor. Sherpa's behavioral agents could be the human-readable layer that feeds ABC's runtime enforcement. Worth tracking.

5. **Does the 120-agent migration need to happen all at once?** The "batteries included" strategy requires a substantial catalog at launch. But quality matters more than quantity — agency-agents' Tier 3 agents are dead weight. A curated 40-agent catalog might be more compelling than a comprehensive 120-agent one.

---

## Raw Links (Every URL Encountered)

### Repositories
- https://github.com/msitarzewski/agency-agents
- https://github.com/mergisi/awesome-openclaw-agents
- https://github.com/VoltAgent/awesome-agent-skills
- https://github.com/VoltAgent/awesome-claude-code-subagents
- https://github.com/VoltAgent/awesome-openclaw-skills
- https://github.com/mitsuhiko/agent-prompts
- https://github.com/mitsuhiko/agent-stuff
- https://github.com/baz-scm/awesome-reviewers
- https://github.com/f/awesome-chatgpt-prompts
- https://github.com/dontriskit/awesome-ai-system-prompts
- https://github.com/EliFuzz/awesome-system-prompts
- https://github.com/tallesborges/agentic-system-prompts
- https://github.com/mustvlad/ChatGPT-System-Prompts
- https://github.com/LouisShark/chatgpt_system_prompt
- https://github.com/ai-boost/awesome-prompts
- https://github.com/e2b-dev/awesome-ai-agents
- https://github.com/kyrolabs/awesome-agents
- https://github.com/jim-schwoebel/awesome_ai_agents
- https://github.com/slavakurilyak/awesome-ai-agents
- https://github.com/Jenqyang/Awesome-AI-Agents
- https://github.com/ashishpatel26/500-AI-Agents-Projects
- https://github.com/tmgthb/Autonomous-Agents
- https://github.com/luo-junyu/Awesome-Agent-Papers
- https://github.com/anthropics/skills
- https://github.com/obra/superpowers
- https://github.com/travisvn/awesome-claude-skills
- https://github.com/ComposioHQ/awesome-claude-skills
- https://github.com/agentsmd/agents.md
- https://github.com/aaronjmars/soul.md
- https://github.com/crewAIInc/crewAI
- https://github.com/microsoft/autogen
- https://github.com/letta-ai/letta
- https://github.com/dust-tt/dust
- https://github.com/openai/codex
- https://github.com/openai/model_spec
- https://github.com/simular-ai/Agent-S
- https://github.com/SamurAIGPT/awesome-openclaw
- https://github.com/skillmatic-ai/awesome-agent-skills
- https://github.com/mhattingpete/claude-skills-marketplace
- https://github.com/promomaster1/awesome-ai
- https://github.com/agenticsoup/langgptai-awesome-ai-system-prompts
- https://github.com/langgptai/awesome-voice-prompts
- https://github.com/CyberAlbSecOP/Awesome_GPT_Super_Prompting
- https://github.com/chatgpt-prompts
- https://github.com/Wirasm/PRPs-agentic-eng
- https://github.com/Qredence/agentic-fleet
- https://github.com/IgorOffline/msitarzewski-agency-agents
- https://github.com/contains-studio/agents
- https://github.com/ThamJiaHe/claude-prompt-engineering-guide
- https://github.com/anthropics/prompt-eng-interactive-tutorial
- https://github.com/shakacode/claude-code-commands-skills-agents
- https://github.com/AgenticHealthAI/Awesome-AI-Agents-for-Healthcare

### Specifications and Standards
- https://soulspec.org/
- https://souls.directory/
- https://agents.md/
- https://model-spec.openai.com/2025-12-18.html
- https://model-spec.openai.com/2025-02-12.html
- https://developers.openai.com/codex/guides/agents-md/
- https://developers.openai.com/codex/skills/

### Research Papers
- https://aclanthology.org/2024.findings-emnlp.888/
- https://arxiv.org/abs/2311.10054
- https://arxiv.org/html/2311.10054v3
- https://arxiv.org/abs/2602.22302
- https://arxiv.org/abs/2506.06366
- https://arxiv.org/html/2506.06366v2
- https://arxiv.org/pdf/2506.06366
- https://arxiv.org/pdf/2602.22302
- https://arxiv.org/abs/2603.09619
- https://onlinelibrary.wiley.com/doi/10.1002/sdr.70008
- https://pmc.ncbi.nlm.nih.gov/articles/PMC12613637/
- https://pmc.ncbi.nlm.nih.gov/articles/PMC12191768/
- https://pmc.ncbi.nlm.nih.gov/articles/PMC12139829/
- https://www.nature.com/articles/s41599-024-03611-3
- https://www.sciencedirect.com/science/article/pii/S2666920X24000262
- https://aclanthology.org/2024.findings-emnlp.969.pdf
- https://aclanthology.org/2025.findings-emnlp.743.pdf
- https://aclanthology.org/2025.emnlp-main.1403.pdf
- https://aclanthology.org/2024.findings-emnlp.888.pdf
- https://proceedings.iclr.cc/paper_files/paper/2025/file/5750f91d8fb9d5c02bd8ad2c3b44456b-Paper-Conference.pdf
- https://openreview.net/pdf?id=1YjrWLAXJr
- https://openreview.net/pdf?id=hmiGuZW5gp
- https://link.springer.com/article/10.1007/s44336-024-00009-2
- https://arxiv.org/html/2508.17281v1
- https://hal.science/hal-05273411v1/document

### Anthropic
- https://www.anthropic.com/research/persona-selection-model
- https://platform.claude.com/docs/en/docs/build-with-claude/prompt-engineering/claude-4-best-practices
- https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/system-prompts
- https://platform.claude.com/docs/en/test-and-evaluate/strengthen-guardrails/keep-claude-in-character
- https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents
- https://code.claude.com/docs/en/skills
- https://claude.com/skills
- https://support.claude.com/en/articles/12512198-how-to-create-custom-skills
- https://resources.anthropic.com/hubfs/The-Complete-Guide-to-Building-Skill-for-Claude.pdf
- https://x.com/AnthropicAI/status/2026062454405415369

### Commercial Platforms
- https://promptbase.com
- https://flowgpt.com
- https://poe.com
- https://creator.poe.com
- https://skillsmp.com
- https://skillsmp.com/about
- https://skillsmp.com/categories
- https://www.skillhub.club
- https://marketplace.relevanceai.com/
- https://relevanceai.com/
- https://relevanceai.com/templates
- https://relevanceai.com/docs/marketplace/intro-to-marketplace
- https://relevanceai.com/docs/agent/templates
- https://relevanceai.com/agent-templates/integration-builder
- https://www.letta.com/
- https://docs.letta.com/concepts/memgpt/
- https://www.letta.com/blog/letta-v1-agent
- https://dust.tt/
- https://dust.tt/home/product
- https://dust.tt/blog
- https://dust.tt/blog/dust-wrapped-2025
- https://dust.tt/blog/comparing-ai-models-for-your-dust-agent
- https://dust.tt/blog/how-to-build-an-ai-agent
- https://docs.dust.tt/docs/quickstart-agent
- https://www.lindy.ai/
- https://www.lindy.ai/blog/ai-agents-business-applications
- https://www.lindy.ai/blog/no-code-ai-agent-builder
- https://www.lindy.ai/blog/ai-agent-platform
- https://www.lindy.ai/blog/best-ai-agent-builders
- https://www.lindy.ai/integrations/agent
- https://www.lindy.ai/blog/custom-gpt-actions
- https://catalog.thesys.dev/
- https://www.thesys.dev/agent-builder
- https://www.thesys.dev/blogs/ai-agent-platforms
- https://www.thesys.dev/blogs/agentic-frameworks
- https://www.thesys.dev/blogs/ai-agent-builder
- https://aiagentstore.ai/
- https://aiagentslist.com/
- https://aiagentsdirectory.com/
- https://aiagentsdirectory.com/landscape
- https://awesomeclaude.ai/
- https://awesomeclaude.ai/awesome-claude-skills
- https://baz.co/
- https://customgpt.ai/

### Framework Documentation
- https://docs.crewai.com/en/concepts/agents
- https://crewai.com/
- https://crewai.com/open-source
- https://blog.crewai.com/getting-started-with-crewai-build-your-first-crew/
- https://microsoft.github.io/autogen/stable/
- https://microsoft.github.io/autogen/0.2/docs/Use-Cases/agent_chat/
- https://microsoft.github.io/autogen/0.2/docs/reference/agentchat/groupchat/
- https://microsoft.github.io/autogen/stable//user-guide/core-user-guide/design-patterns/group-chat.html
- https://microsoft.github.io/autogen/stable//user-guide/agentchat-user-guide/tutorial/agents.html
- https://docs.langchain.com/oss/python/langgraph/overview
- https://www.langchain.com/langgraph
- https://www.langchain.com/langchain
- https://www.langchain.com/state-of-agent-engineering
- https://blog.langchain.com/langchain-langgraph-1dot0/
- https://www.core42.ai/compass/documentation/crewai

### Blog Posts and Analysis
- https://yuv.ai/blog/agency-agents
- https://medium.com/coding-nexus/someone-built-a-full-ai-agency-on-github-61-agents-10k-stars-in-7-days-ac976f85925d
- https://medium.com/@unicodeveloper/10-must-have-skills-for-claude-and-any-coding-agent-in-2026-b5451b013051
- https://medium.com/@markchen69/claude-code-has-a-skills-marketplace-now-a-beginner-friendly-walkthrough-8adeb67cdc89
- https://medium.com/@julio.pessan.pessan/skillsmp-this-96-751-claude-code-skills-directory-7dec2eabc338
- https://medium.com/@piyush.jhamb4u/stateful-ai-agents-a-deep-dive-into-letta-memgpt-memory-models-a2ffc01a7ea1
- https://medium.com/@mrAryanKumar/use-this-ai-agent-framework-from-microsoft-as-an-ai-engineer-in-2025-0bf23cbbebb5
- https://medium.com/@vprprudhvi/a-practical-guide-to-prompt-engineering-and-ai-agents-004ce4647549
- https://medium.com/@mjgmario/prompt-engineering-basics-2026-93aba4dc32b1
- https://blog.fsck.com/2025/10/09/superpowers/
- https://smartscope.blog/en/blog/skillsmp-marketplace-guide/
- https://www.buildmvpfast.com/blog/agent-skills-npm-ai-package-manager-2026
- https://github.blog/ai-and-ml/github-copilot/how-to-write-a-great-agents-md-lessons-from-over-2500-repositories/
- https://www.builder.io/blog/agents-md
- https://www.aihero.dev/a-complete-guide-to-agents-md
- https://agentsmd.io/agents-md-best-practices
- https://ainativecompass.substack.com/p/good-practices-creating-agentsmd
- https://www.turbogeek.co.uk/how-to-write-the-perfect-agents-md-file/
- https://pnote.eu/notes/agents-md/
- https://agentsmd.net/
- https://dev.to/tomleelive/the-complete-soulmd-template-guide-give-your-ai-agent-a-personality-3php
- https://dev.to/techfind777/the-complete-guide-to-soulmd-give-your-ai-agent-a-personality-ldj
- https://www.mmntm.net/articles/openclaw-identity-architecture
- https://learnopenclaw.com/core-concepts/soul-md
- https://www.crewclaw.com/blog/soul-md-create-ai-agent
- https://openclawconsult.com/lab/openclaw-soul-md
- https://openclaws.io/blog/openclaw-soul-md-guide
- https://vocal.media/futurism/anthropic-s-persona-selection-model-explains-why-ai-assistants-act-so-human
- https://blockchain.news/ainews/anthropic-s-persona-selection-model-explained-why-claude-feels-human-5-key-insights-and-business-implications
- https://claude-ai.chat/guides/claude-persona-programming/
- https://dzlab.github.io/ai/2025/05/12/peeking-under-the-hood-claude/
- https://www.godofprompt.ai/blog/review-popular-ai-prompt-library-platforms
- https://www.godofprompt.ai/blog/in-depth-review-leading-ai-prompt-marketplaces
- https://www.godofprompt.ai/blog/expert-level-ai-prompt-collections
- https://skywork.ai/blog/flowgpt-review-2025-community-prompt-multimodel-chat/
- https://skywork.ai/blog/flowgpt-review-ai-prompt-marketplace/
- https://skywork.ai/skypage/en/PromptBase-Deep-Dive-Mastering-the-AI-Prompt-Marketplace-for-Future-Growth-and-SEO-Dominance/1972861300479422464
- https://skywork.ai/skypage/en/Poe.com-In-Depth-2025-Review-My-Hands-On-Guide-to-the-All-in-One-AI-Platform/1974362346907955200
- https://moge.ai/product/promptbase
- https://www.bestaitools.com/tool/promptbase/
- https://likemagicai.com/2025/12/09/flowgpt-the-ai-prompt-marketplace-thats-more-than-just-prompts/
- https://donovanrittenbach.com/market-research-report-the-custom-gpt-market-a-3-7-billion-opportunity-for-creators-and-developers-in-2025/
- https://www.digitalapplied.com/blog/gpt-store-custom-gpts-business-guide-2026
- https://www.mydoceo.com/blog/custom-gpt-vs-agent-for-business/
- https://www.datastudios.org/post/chatgpt-app-directory-and-gpt-store-marketplace-launch-sdk-features-and-platform-evolution
- https://www.eesel.ai/blog/relevance-ai-pricing
- https://www.eesel.ai/blog/custom-gpt
- https://www.graphlit.com/vs/letta
- https://www.gumloop.com/blog/lindy-ai-alternatives
- https://scalablehuman.com/2025/07/02/review-anthropics-prompt-engineering-guide/
- https://blog.gopenai.com/the-claude-developer-guide-prompt-engineering-8558762ee874
- https://techwithibrahim.medium.com/the-art-of-agent-prompting-lessons-from-anthropics-ai-team-e8c9ac4db3f3
- https://www.aiwithgrant.com/guides/anthropic-prompt-engineering-overview
- https://www.lakera.ai/blog/prompt-engineering-guide
- https://www.ibm.com/think/prompt-engineering
- https://www.ibm.com/think/topics/agentic-engineering
- https://cloud.google.com/discover/what-is-prompt-engineering
- https://converter.brightcoding.dev/blog/system-prompts-for-ai-agents-the-complete-2026-guide-to-building-powerful-safe-autonomous-systems
- https://www.getmaxim.ai/articles/the-importance-of-system-prompts-in-shaping-ai-agent-responses/
- https://developers.redhat.com/articles/2026/02/23/prompt-engineering-big-vs-small-prompts-ai-agents
- https://www.cio.com/article/4134741/how-agentic-ai-will-reshape-engineering-workflows-in-2026.html
- https://www.cio.com/article/4080592/context-engineering-improving-ai-by-moving-beyond-the-prompt.html
- https://www.sdggroup.com/en/insights/blog/the-evolution-of-prompt-engineering-to-context-design-in-2026
- https://www.sdggroup.com/en-gb/insights/blog/the-evolution-of-prompt-engineering-to-context-design-in-2026
- https://www.deepset.ai/blog/context-engineering-the-next-frontier-beyond-prompt-engineering
- https://www.sitepoint.com/context-engineering-for-agents/
- https://www.promptingguide.ai/agents/context-engineering
- https://www.promptingguide.ai/guides/context-engineering-guide
- https://newsletter.systemdesign.one/p/context-engineering-vs-prompt-engineering
- https://sombrainc.com/blog/ai-context-engineering-guide
- https://dev.to/serenitiesai/context-engineering-why-its-replacing-prompt-engineering-in-2026-1b4g
- https://www.stackai.com/blog/the-2026-guide-to-agentic-workflow-architectures
- https://mitsloan.mit.edu/ideas-made-to-matter/agentic-ai-explained
- https://thenewstack.io/building-multiagent-workflows-with-microsoft-autogen/
- https://thenewstack.io/anthropic-launches-a-multi-agent-code-review-tool-for-claude-code/
- https://techcrunch.com/2026/03/09/anthropic-launches-code-review-tool-to-check-flood-of-ai-generated-code/
- https://venturebeat.com/technology/anthropic-rolls-out-code-review-for-claude-code-as-it-sues-over-pentagon
- https://langfuse.com/blog/2025-03-19-ai-agent-comparison
- https://www.langflow.org/blog/the-complete-guide-to-choosing-an-ai-agent-framework-in-2025
- https://blog.jetbrains.com/pycharm/2026/02/langchain-tutorial-2026/
- https://www.leanware.co/insights/langchain-agents-complete-guide-in-2025
- https://www.firecrawl.dev/blog/crewai-multi-agent-systems-tutorial
- https://workos.com/blog/how-to-build-a-game-building-agent-system-with-crewai
- https://latenode.com/blog/ai-frameworks-technical-infrastructure/crewai-framework/crewai-framework-2025-complete-review-of-the-open-source-multi-agent-ai-platform
- https://www.alphamatch.ai/blog/top-agentic-ai-frameworks-2026
- https://www.digitalocean.com/community/tutorials/crewai-crash-course-role-based-agent-orchestration
- https://codesignal.com/learn/courses/getting-started-with-crewai-agents-and-tasks/lessons/configuring-crewai-agents-and-tasks-with-yaml-files
- https://rodtrent.substack.com/p/running-a-crewai-agent-from-a-yaml
- https://www.projectpro.io/article/crew-ai-projects-ideas-and-examples/1117
- https://deepwiki.com/lalitnayyar/The-Complete-Agentic-AI-Engineering-Course-2025-/5.1-agent-configuration-with-yaml
- https://deepwiki.com/obra/superpowers
- https://deepwiki.com/obra/superpowers/7.1-using-superpowers
- https://deepwiki.com/openai/agents.md/5.1-format-overview-and-specification
- https://www.emergentmind.com/topics/llm-driven-generative-agents
- https://www.emergentmind.com/topics/langchain-langgraph
- https://aimultiple.com/open-source-ai-agents
- https://opendatascience.com/the-top-ten-github-agentic-ai-repositories-in-2025/
- https://www.nocobase.com/en/blog/github-open-source-ai-agent-projects
- https://www.vellum.ai/blog/top-ai-agent-builder-platforms-complete-guide
- https://adaptive.ai/blog/best-ai-agent-builders
- https://www.flowhunt.io/blog/best-ai-agent-builders-2026/
- https://aicloudbase.com/tool/poe-ai
- https://aiseohubtech.com/what-is-poe-assistant-the-complete-2026-guide/
- https://aitoolsdevpro.com/ai-tools/poe-guide/
- https://insighto.ai/blog/poe-ai-guide/
- https://www.allaboutai.com/ai-reviews/poe-ai/
- https://freerdps.com/blog/poe-ai-review/
- https://www.quantumrun.com/consulting/poe-ai/
- https://www.udemy.com/course/from-prompt-engineering-to-agent-engineering/
- https://www.techrxiv.org/users/1000434/articles/1360836/master/file/data/LLM_Agent_Tutorial/LLM_Agent_Tutorial.pdf
- https://sap-samples.github.io/llm-agents-eval-tutorial/
- https://pasqualepillitteri.it/en/news/215/superpowers-claude-code-complete-guide
- https://www.scriptbyai.com/best-agent-skills/
- https://learnprompting.org/docs/advanced/zero_shot/role_prompting
- https://www.aimodels.fyi/papers/arxiv/when-helpful-assistant-is-not-really-helpful
- https://www.researchgate.net/publication/386182602
- https://lobehub.com/skills/mitsuhiko-agent-stuff-pi-share
- https://navtools.ai/tool/skillsmp
- https://agentindex.app/tool/jim-schwoebel-awesome-ai-agents/
- https://awesome.ecosyste.ms/lists/voltagent/awesome-agent-skills
- https://www.sourcepulse.org/projects/16866012
- https://research.ibm.com/publications/agentic-process-observability-discovering-behavioral-variability
- https://aiagentstore.ai/ai-agent/lindy-ai
- https://aiagentstore.ai/compare-ai-agents/letta-ai-vs-memgpt
- https://bestaiagents.ai/agent/letta
- https://bestaiagents.ai/agent/lindy
- https://aiagentslist.com/agents/letta
- https://www.deployhq.com/blog/getting-started-with-openai-codex-cli-ai-powered-code-generation-from-your-terminal
- https://aws.amazon.com/marketplace/pp/prodview-3brgnq4u4pi6q
- https://aws.amazon.com/blogs/machine-learning/prompt-engineering-techniques-and-best-practices-learn-by-doing-with-anthropics-claude-3-on-amazon-bedrock/
- https://openai.com/index/introducing-gpts/
- https://openai.com/index/introducing-the-model-spec/
- https://openai.com/index/updating-model-spec-with-teen-protections/
- https://help.openai.com/en/articles/8555535-gpts-chatgpt-enterprise-version
- https://help.openai.com/en/articles/10128477-chatgpt-enterprise-edu-release-notes
- https://help.openai.com/en/articles/9624314-model-release-notes
- https://learn.microsoft.com/en-us/agent-framework/migration-guide/from-autogen/
- https://docs.factory.ai/cli/configuration/agents-md
- https://www.r-bloggers.com/2026/03/a-few-claude-skills-for-r-users/
- https://gist.github.com/disler/409d9685c8b251ed723a7aca43cc4b9b
- https://www.scribd.com/document/868127720/Giving-Claude-a-role-with-a-system-prompt-Anthropic
