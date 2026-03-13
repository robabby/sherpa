# Vector 3: Skills/Agents/Instances Convergence

**Question:** Can behavioral agent definitions, executable skills, and agent instances be unified into a single construct? If skills and agent roles are "the same thing at different zoom levels," what's the unified model?
**Agent dispatched:** 2026-03-12

## Findings

### 1. Claude Code Already Unifies Skills and Subagents — But Not Explicitly

Claude Code's architecture reveals a convergence Anthropic hasn't named. Skills (SKILL.md) and subagents (.claude/agents/*.md) share nearly identical file formats:

| Feature | Skill (SKILL.md) | Subagent (.claude/agents/*.md) |
|---------|------------------|-------------------------------|
| File format | YAML frontmatter + Markdown body | YAML frontmatter + Markdown body |
| name field | Yes (slug) | Yes (slug) |
| description field | Yes (when to use) | Yes (when to delegate) |
| allowed-tools / tools | Yes | Yes |
| model | Yes | Yes |
| Behavioral instructions | Markdown body | Markdown body (system prompt) |
| hooks | Yes (lifecycle hooks) | Yes (lifecycle hooks) |
| Invocation | `/skill-name` or auto-detected | Claude delegates based on description |
| Execution context | Inline or `context: fork` | Always forked |
| Persistent memory | No | Yes (`memory: user/project/local`) |
| Skills loading | N/A | `skills` field preloads skills |

The critical bridge: a skill with `context: fork` and `agent: <type>` is functionally identical to invoking a subagent. And a subagent with `skills: [skill-name]` preloads skill content into its context. They are already two views of the same mechanism.

### 2. The Agent Skills Open Standard Defines the Minimal Portable Unit

The [Agent Skills](https://agentskills.io) open standard (Anthropic, adopted by 30+ tools including Cursor, VS Code Copilot, Gemini CLI, OpenAI Codex, JetBrains Junie):

- **Required:** `name` (kebab-case, max 64 chars), `description` (max 1024 chars)
- **Optional:** `license`, `compatibility`, `metadata` (arbitrary k/v), `allowed-tools`
- **Body:** Unrestricted Markdown instructions
- **Progressive disclosure:** Name/description at startup (~100 tokens); full SKILL.md on activation (<5000 tokens); supporting files on demand

This is the most widely adopted agent definition format. But it deliberately omits behavioral-constraint-specific fields (disposition, fail-triggers, quality-bar) that Sherpa adds.

### 3. No Framework Has a Unified Skill-Role-Instance Construct

Every major framework maintains separate constructs:

- **CrewAI:** `Agent` (role/goal/backstory + tools + model) separate from `Task`. Identity-claim fields (`backstory`). No skill concept.
- **OpenAI Agents SDK:** `Agent` (name/instructions/tools/handoffs/guardrails/hooks/output_type). Freeform `instructions`. "Agents as tools" for runtime composition. No separate skill abstraction.
- **Google ADK:** `LlmAgent` (name/model/description/instruction/tools). "Skills for Agents" mentioned as separate concept.
- **AutoGen:** `AssistantAgent` (name/description/model_client/tools/system_message). Kitchen sink pattern via freeform system_message.
- **LangGraph:** Graph primitives (nodes/edges/state). Behavioral instructions embedded in system prompts. No portable format.

### 4. SkillsBench Validates the T-Shaped Model

[SkillsBench](https://arxiv.org/html/2602.12670v1) (Feb 2026, 86 tasks, 11 domains):

- **2-3 skills per task is optimal** (+18.6pp improvement)
- **Compact definitions outperform comprehensive by 21.7pp** (compact +17.1pp vs comprehensive -2.9pp)
- **Small model + good skills > large model without skills** (Haiku+skills 27.7% beat Opus 22.0%)
- **Models cannot self-generate effective skills** (-1.3pp vs baseline)

Implies unified construct = **compact behavioral definition** (T-crossbar: disposition, constraints, quality-bar) that **loads 2-3 skills at runtime** (T-stem: domain-specific protocols).

### 5. Agent Behavioral Contracts (ABC) Provide Formal Foundation

[ABC paper](https://arxiv.org/html/2602.22302) (Feb 2026): behavioral contract = **(Preconditions, Invariants, Governance Constraints, Recovery Mechanisms)** with hard/soft distinction.

| ABC Concept | Sherpa Schema Field |
|-------------|-------------------|
| Preconditions | `context-packages` |
| Hard invariants | `fail-triggers` |
| Hard governance | `behavioral-constraints` |
| Soft governance | `quality-bar` |
| Recovery | `escalation` |

Suggests unified construct should distinguish hard constraints (always enforced) from soft constraints (aspired to, recoverable). This bridges skills (protocol steps that should be followed) and roles (behavioral postures that are always active).

### 6. The Zoom-Level Insight is Correct

| Dimension | Skill (/rr) | Role (code-reviewer) | Instance (proposed) |
|-----------|-------------|---------------------|-------------------|
| Scope | Task-specific protocol | Session-wide posture | Persistent across sessions |
| Activation | On-demand | Assigned at session start | Created once, deployed many times |
| Behavioral content | Step-by-step instructions | Disposition + constraints | Role config + overrides + history |
| State | Stateless | Stateless | Stateful (memory, budget, audit) |
| Tools | allowed-tools | tool-permissions | Inherited from role + custom |
| Quality gate | Implicit (in instructions) | Explicit (quality-bar, fail-triggers) | Inherited from role |

Gradient: **Protocol (narrow, ephemeral) → Posture (broad, session-lived) → Entity (broad, persistent)**.

### 7. Claude Code's Architecture Sketches the Unified Model

```
Skill with context: fork + agent: Explore
  = Behavioral definition (SKILL.md body)
  + Execution context (Explore subagent)
  + Tool restrictions (allowed-tools)

Subagent with skills: [api-conventions, error-handling]
  = Execution context (subagent definition)
  + Behavioral definitions (preloaded skills)
  + Tool restrictions (tools field)
  + Persistent memory (memory field)
```

Both are: behavioral instructions + execution constraints + tool permissions + optional persistence.

## Proposed Unified Schema

```yaml
---
# === Identity (Agent Skills compatible) ===
name: <slug>                          # Required. kebab-case.
description: <when to use>            # Required. max 1024 chars.

# === Behavioral Layer (Sherpa extension) ===
disposition: <posture — elaboration>  # Optional. Behavioral contract core.
behavioral-constraints: [...]         # Optional. Hard governance (ABC).
quality-bar: [...]                    # Optional. Soft governance (ABC).
fail-triggers: [...]                  # Optional. Hard invariants (ABC).

# === Execution Layer ===
model: <model-id or tier>             # Optional.
tools: [...]                          # Optional. Allowed tools.
context: inline | fork                # Optional. Default: inline.
skills: [...]                         # Optional. Skills to preload.
hooks: { ... }                        # Optional. Lifecycle hooks.

# === Instance Layer (progressive enhancement) ===
memory: user | project | local        # Optional. Enables persistence.
domain-scope: [...]                   # Optional. Knowledge domains.
context-packages: [...]               # Optional. Files to load.
escalation: [...]                     # Optional. Delegation edges.

# === Display ===
category: <taxonomy entry>            # Optional.
vibe: <one-liner for UI>              # Optional.
tags: [...]                           # Optional.
---

# Body: Instructions (protocol, constraints, or both)
```

Three zoom levels as configuration of same schema:
- **Skill**: name + description + body (protocol). No disposition, no memory.
- **Role**: name + description + disposition + constraints + quality-bar. No memory, no specific protocol.
- **Instance**: Everything from Role + memory + custom context-packages + skills preloaded.

## Sources

- [Agent Skills specification](https://agentskills.io/specification) — Complete format spec
- [Agent Skills overview](https://agentskills.io) — 30+ adopting tools
- [Anthropic example skills](https://github.com/anthropics/skills) — Production reference skills
- [Claude Code Skills docs](https://code.claude.com/docs/en/skills) — Skill definition format
- [Claude Code Subagents docs](https://code.claude.com/docs/en/sub-agents) — Subagent definition format
- [Claude Code Agent Teams](https://code.claude.com/docs/en/agent-teams) — Multi-session coordination
- [CrewAI Agents](https://docs.crewai.com/concepts/agents) — Agent schema with role/goal/backstory
- [OpenAI Agents SDK](https://github.com/openai/openai-agents-python) — Agent class definition
- [Google ADK LLM Agents](https://google.github.io/adk-docs/agents/llm-agents/) — LlmAgent schema
- [AutoGen Agents](https://microsoft.github.io/autogen/stable/user-guide/agentchat-user-guide/tutorial/agents.html) — AssistantAgent
- [LangGraph concepts](https://docs.langchain.com/oss/python/langgraph/workflows-agents) — Graph primitives
- [SkillsBench](https://arxiv.org/html/2602.12670v1) — 86-task benchmark, 2-3 skills optimal
- [SkillsBench site](https://www.skillsbench.ai/) — Official benchmark
- [Agent Behavioral Contracts](https://arxiv.org/html/2602.22302) — Formal behavioral contract model
- [Zheng et al. EMNLP 2024](https://aclanthology.org/2024.findings-emnlp.888.pdf) — Identity roles "largely random"
- [Anthropic: Effective Context Engineering](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)
- [Anthropic: Building Effective Agents](https://www.anthropic.com/research/building-effective-agents)
- [O'Reilly: Soft Forks](https://www.oreilly.com/radar/soft-forks-how-agent-skills-create-specialized-ai-without-training/)
- [AGENTS.md](https://agents.md/) — Unstructured project context (60K+ repos)
- [TDAD: Test-Driven Agent Definition](https://arxiv.org/abs/2603.08806)

## Raw Links

```
https://agentskills.io
https://agentskills.io/specification
https://agentskills.io/what-are-skills
https://github.com/agentskills/agentskills
https://github.com/anthropics/skills
https://code.claude.com/docs/en/skills
https://code.claude.com/docs/en/sub-agents
https://code.claude.com/docs/en/agent-teams
https://code.claude.com/docs/llms.txt
https://docs.crewai.com/concepts/agents
https://docs.crewai.com/concepts/tasks
https://github.com/openai/openai-agents-python
https://raw.githubusercontent.com/openai/openai-agents-python/main/src/agents/agent.py
https://google.github.io/adk-docs/agents/
https://google.github.io/adk-docs/agents/llm-agents/
https://microsoft.github.io/autogen/stable/user-guide/agentchat-user-guide/tutorial/agents.html
https://docs.langchain.com/oss/python/langgraph/workflows-agents
https://arxiv.org/html/2602.12670v1
https://www.skillsbench.ai/
https://arxiv.org/html/2602.22302
https://aclanthology.org/2024.findings-emnlp.888.pdf
https://arxiv.org/html/2512.08296v1
https://arxiv.org/html/2602.03794v1
https://arxiv.org/abs/2603.08806
https://alignment.anthropic.com/2026/psm/
https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents
https://www.anthropic.com/research/building-effective-agents
https://www.anthropic.com/engineering/multi-agent-research-system
https://agents.md/
https://www.oreilly.com/radar/soft-forks-how-agent-skills-create-specialized-ai-without-training/
https://thenewstack.io/ai-agents-or-skills-why-the-answer-is-both/
https://www.deeplearning.ai/short-courses/agent-skills-with-anthropic/
https://cursor.com/docs/context/skills
https://junie.jetbrains.com/docs/agent-skills.html
https://geminicli.com/docs/cli/skills/
https://developers.openai.com/codex/skills/
https://docs.roocode.com/features/skills
https://teamtopologies.com/news-blogs-newsletters/2025/1/14/the-future-of-team-topologies-when-ai-agents-dominate
```

## Implications

1. **The unified construct is viable.** Agent Skills standard provides the portability base; Sherpa's behavioral fields are extensions that degrade gracefully. Claude Code's architecture already bridges the gap.
2. **Three zoom levels are configuration, not separate constructs.** Which fields are populated determines whether something acts as a skill, role, or instance.
3. **The `memory` field is the key differentiator.** Adding memory to a role turns it into an instance. This is the minimal addition.
4. **Progressive enhancement is the right strategy.** A minimal definition (name + description) is an Agent Skill. Adding disposition makes it a behavioral role. Adding memory makes it a persistent instance.
5. **SkillsBench validates T-shaped composition** — compact definition + 2-3 preloaded skills, not monolithic definitions.

## Open Questions

1. Should the unified construct use a single directory or keep skills/agents/instances separate?
2. How does instance identity work without identity claims? Name is metadata, not system prompt.
3. What accumulates in the memory directory across sessions?
4. Who decides which skills to load alongside which role — static declaration or dynamic dispatch?
5. How do behavioral contracts (ABC) map to runtime enforcement via hooks?
6. Is there a fourth zoom level — Organization — that specifies taxonomy, vocabulary, shared constraints?
7. Can a single file serve as both skill and subagent depending on invocation context?
