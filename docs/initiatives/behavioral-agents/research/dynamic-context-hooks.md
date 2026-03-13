# Dynamic Context Hooks: Static YAML vs. Runtime Flexibility

**Date:** 2026-03-11
**Initiative:** behavioral-agents
**Answers:** Open Question #3 — "Does `context-packages` + rules loading cover this, or is a `dynamic-context` hook needed?"

---

## Executive Summary

Static YAML with `context-packages` and `rules` pointers is sufficient for Sherpa v1. Dynamic context hooks solve real problems, but those problems are runtime orchestration concerns — they belong in the dispatcher/runner layer, not the agent definition schema. Adding a dynamic hook to the schema would compromise portability, increase security surface area, and conflate two distinct responsibilities (what an agent *is* vs. how an agent is *invoked*).

**Recommendation:** Skip dynamic hooks in the schema. Reserve a `hooks` field name in the spec as "future/reserved" so the namespace isn't squatted, but do not implement it.

---

## Framework Survey: How Others Handle Dynamic Context

### OpenAI Agents SDK — Callable Instructions

The `instructions` parameter accepts either a static string or a callable function. The function signature:

```python
def dynamic_instructions(
    context: RunContextWrapper[UserContext],
    agent: Agent[UserContext]
) -> str:
    return f"The user's name is {context.context.name}."
```

Key details:
- Both sync and async functions accepted
- `RunContextWrapper` provides application-defined context (dataclass, Pydantic model, etc.)
- Context objects are **never sent to the LLM** — they are local application state only
- The function must return a string (the system prompt)
- Context is passed via `Runner.run(context=user_info)` at invocation time

**What it enables:** User-specific personalization, time-based behavior, conditional instructions based on application state.

**What it does NOT do:** The callable is a Python function. It cannot be serialized to YAML, shared across organizations, or validated statically. It is a runtime orchestration feature, not a definition feature.

**Sources:**
- [OpenAI Agents SDK — Agents](https://openai.github.io/openai-agents-python/agents/)
- [OpenAI Agents SDK — Context](https://openai.github.io/openai-agents-python/context/)
- [OpenAI Agents SDK — GitHub](https://github.com/openai/openai-agents-python)
- [Agents SDK Guide | OpenAI API](https://developers.openai.com/api/docs/guides/agents-sdk/)

### Pydantic AI — Dynamic System Prompts via Decorator

Pydantic AI has the most elegant dynamic system prompt mechanism. The `@agent.system_prompt` decorator registers functions that generate system prompt fragments at runtime:

```python
@agent.system_prompt
def add_the_users_name(ctx: RunContext[str]) -> str:
    return f"The user's name is {ctx.deps}."

@agent.system_prompt
def add_the_date() -> str:
    return f'The date is {date.today()}.'
```

Key details:
- Multiple dynamic prompts compose in definition order (static first, then dynamic)
- `RunContext[T]` provides typed dependency injection
- Dependencies passed at `agent.run_sync('...', deps='Frank')`
- Separate `@agent.instructions` decorator — instructions are always reevaluated even with message history; system prompts may be reused
- Both with and without `RunContext` parameter are valid signatures

**What it enables:** Same as OpenAI — runtime personalization, temporal awareness, dependency injection.

**Critical observation:** Pydantic AI's design makes the split explicit. The *agent definition* (static) is separate from the *dynamic system prompt functions* (runtime). The functions are registered on an agent instance, not serialized into a definition file. This is the correct architectural split.

**Sources:**
- [Pydantic AI — Agent](https://ai.pydantic.dev/agent/)
- [Pydantic AI — Function Tools](https://ai.pydantic.dev/tools/)
- [Pydantic AI Skills — Towards AI](https://pub.towardsai.net/introducing-pydantic-ai-skills-composable-agent-skills-for-the-pydantic-ai-ecosystem-dc98dd2bff53)

### Claude Code — Hooks + Skills + Rules (Three-Layer System)

Claude Code separates dynamic context into three mechanisms:

**1. Hooks (17 lifecycle events):** User-defined shell commands, HTTP endpoints, LLM prompts, or subagents that execute at specific points. Key events:
- `SessionStart` — inject `additionalContext` string into Claude's context
- `UserPromptSubmit` — add context before each prompt is processed
- `PreToolUse` — modify tool input, allow/deny/ask, add context
- `InstructionsLoaded` — observability only (no decision control)
- `PostToolUse`, `Stop`, `SubagentStop`, etc.

Hooks are configured in `.claude/settings.json` or via skill/agent frontmatter — NOT in the agent definition itself.

**2. Skills (SKILL.md):** Markdown files with YAML frontmatter. Support dynamic context via `!`command`` syntax:
```yaml
## PR context
- PR diff: !`gh pr diff`
- PR comments: !`gh pr view --comments`
```
Shell commands execute before the skill content is sent to the model. The output replaces the placeholder.

**3. Rules (`.claude/rules/*.md`):** Path-scoped instructions that auto-load based on `globs:` frontmatter. Deterministic, always-loaded when path matches.

**Critical observation:** Claude Code's architecture validates the separation thesis. Agent definitions (subagent YAML) are static. Dynamic context is handled by hooks (lifecycle events), skills (`!command` syntax), and rules (path-based loading). These are three different layers with three different responsibilities. None of them require the agent *definition* to contain executable code.

**Sources:**
- [Claude Code Hooks Reference](https://code.claude.com/docs/en/hooks)
- [Claude Code Skills](https://code.claude.com/docs/en/skills)
- [Claude Code Hooks Guide 2026](https://dev.to/serenitiesai/claude-code-hooks-guide-2026-automate-your-ai-coding-workflow-dde)
- [Claude Code Hooks: All 12 Lifecycle Events](https://www.pixelmojo.io/blogs/claude-code-hooks-production-quality-ci-cd-patterns)
- [Claude Code Using Hooks for Guaranteed Context Injection](https://dev.to/sasha_podles/claude-code-using-hooks-for-guaranteed-context-injection-2jg)
- [Context Engineering for Coding Agents — Martin Fowler](https://martinfowler.com/articles/exploring-gen-ai/context-engineering-coding-agents.html)

### CrewAI — Static Only (with Template Variables)

CrewAI agents accept only strings for `role`, `goal`, `backstory`. Dynamic behavior comes from:
- Template variables in YAML: `{topic}` replaced via `crew.kickoff(inputs={'topic': 'AI'})`
- `step_callback` — function called after each step (monitoring only)
- `inject_date: true` — auto-inject current date

No callable instructions. No dynamic system prompts. No hooks on agent definitions.

**Critical observation:** CrewAI's YAML-first approach is the closest analog to Sherpa's format. Their template variable approach (`{topic}`) is a lightweight form of dynamic context that stays within static YAML. Sherpa could adopt this pattern if needed.

**Sources:**
- [CrewAI Agents Documentation](https://docs.crewai.com/en/concepts/agents)
- [CrewAI Flows — Event-Driven Agent Orchestration](https://markaicode.com/crewai-flows-event-driven-agent-orchestration/)
- [CrewAI Dynamic Agent Selection — Community](https://community.crewai.com/t/dynamic-agent-selection-in-crewai-enhancing-efficiency-without-hardcoding/2734)

### LangGraph — State-Driven Dynamic Context

LangGraph handles dynamic context through its graph state mechanism:
- Nodes construct system messages dynamically from graph state
- Conditional edges route execution based on state
- State is the context — it accumulates across the graph

No agent definition format per se. Everything is programmatic (Python graph construction).

**Sources:**
- [LangGraph Workflows and Agents](https://docs.langchain.com/oss/python/langgraph/workflows-agents)
- [LangGraph State Machine Branching Logic](https://markaicode.com/langgraph-state-machine-branching-logic/)
- [LangGraph Agent Runtime](https://www.langchain.com/langgraph)

### Agent Skills Open Standard — Static Only

The Agent Skills spec (agentskills.io, originated by Anthropic, adopted by 30+ tools) is purely static:
- Required: `name`, `description`
- Optional: `license`, `compatibility`, `metadata`, `allowed-tools`
- No dynamic context, no hooks, no callable fields
- Dynamic context is explicitly delegated to the hosting tool (Claude Code's `!command` syntax is a Claude Code extension, not part of the standard)

**Critical observation:** The industry-standard portable format is static YAML + Markdown. Dynamic behavior is a host-specific extension. This is the pattern Sherpa should follow.

**Sources:**
- [Agent Skills Specification](https://agentskills.io/specification)
- [Agent Skills — Overview](https://agentskills.io)
- [Agent Skills GitHub](https://github.com/agentskills/agentskills)
- [Agent Skills in VS Code](https://code.visualstudio.com/docs/copilot/customization/agent-skills)
- [OpenAI Codex Skills](https://developers.openai.com/codex/skills/)

---

## Use Cases for Dynamic Context — And Their Static Alternatives

### Use Case 1: Repository-Specific Behavior

**Dynamic approach:** Callable instruction reads `.git/config` or `package.json` at runtime to adjust behavior.

**Static alternative:** `context-packages` already solves this. Pointer to the repository's CLAUDE.md, which contains all project-specific conventions. The dispatcher reads the pointer and loads the file.

**Verdict:** Static is sufficient. This is the primary use case `context-packages` was designed for.

### Use Case 2: Time-Based Behavior (Code Freeze, Sprint Phase)

**Dynamic approach:** Callable instruction checks calendar or sprint API to modify constraints ("during code freeze, reject all non-critical changes").

**Static alternative:** Two approaches:
1. **Agent variants:** `code-reviewer.md` and `code-reviewer-freeze.md` with different behavioral constraints. Dispatcher selects based on project state.
2. **Task frontmatter:** `sprint-phase: freeze` in the task definition, which the agent reads and responds to.

**Verdict:** Static is sufficient for foreseeable needs. Agent variants are more predictable and auditable. If sprint-phase logic becomes complex, it belongs in the dispatcher, not the agent definition.

### Use Case 3: User-Specific Personalization

**Dynamic approach:** Callable instruction reads user profile to adjust tone, language, skill level.

**Static alternative:** Not needed for Sherpa's use case. Behavioral agents are organizational tools, not consumer-facing. If needed, `context-packages` can point to a user preferences file.

**Verdict:** Static is sufficient. Sherpa agents are not consumer-facing chatbots.

### Use Case 4: Conditional Tool Access Based on Environment

**Dynamic approach:** Callable instruction checks if production credentials are present and restricts tool access.

**Static alternative:** `tool-permissions` field is already static. Environment-specific restrictions belong in the runner's permission system, not the agent definition.

**Verdict:** Static is correct. Tool permissions are a security boundary — they should NOT be dynamically computed from potentially untrusted context.

### Use Case 5: Live Project State (Open PRs, Failed Tests, Recent Deployments)

**Dynamic approach:** Callable instruction fetches live data to contextualize the agent's task.

**Static alternative:** This is task context, not agent context. It belongs in the task description or in a `SessionStart` hook in the runner. The agent definition describes *what kind of work the agent does*, not *the current state of the project*.

**Verdict:** Static is correct. This is a runner/dispatcher concern, not a definition concern.

### Use Case 6: Multi-Organization Deployment (Same Agent, Different Context)

**Dynamic approach:** Callable instruction reads org config to determine domain-specific constraints.

**Static alternative:** This is exactly what `context-packages` and `rules` were designed for. The base catalog is static and portable. Each organization populates `context-packages` with their own project files.

**Verdict:** Static is the design intent. This validates the existing architecture.

---

## Complexity and Security Trade-Offs of Dynamic Hooks

### If Sherpa Added a `hooks` or `dynamic-context` Field

**Schema complexity:**
- YAML cannot express executable code. The field would need to be a shell command string, a script path, or a reference to a function in a host language. All three break the "single Markdown file" portability promise.
- Validation becomes impossible for dynamic fields. The Zod schema can validate that `disposition` is a non-empty string; it cannot validate that a shell script produces correct output.
- The behavioral lint tool cannot analyze dynamic content. Static fields enable the lint tool to detect identity language, missing quality bars, etc. Dynamic fields are opaque.

**Portability loss:**
- Shell commands are OS-dependent. A `!`gh pr diff`` works on macOS/Linux with GitHub CLI installed but fails elsewhere.
- Script paths are workspace-dependent. A hook referencing `./scripts/inject-context.sh` only works in the original project.
- The Agent Skills open standard has no dynamic fields. Adding them would make Sherpa agents incompatible with the 30+ tools that support the standard.

**Security surface area:**
- Dynamic hooks execute arbitrary code at agent invocation time. This is a prompt injection vector: if an attacker can modify the hook script, they can inject arbitrary instructions into the agent's system prompt.
- OWASP ranks prompt injection as the #1 LLM vulnerability (73% of assessed deployments). Dynamic hooks in agent definitions increase the attack surface.
- Static YAML is auditable. A security reviewer can read the agent definition and understand exactly what instructions will be generated. Dynamic hooks require reviewing all code paths.

**Sources:**
- [OWASP LLM01:2025 Prompt Injection](https://genai.owasp.org/llmrisk/llm01-prompt-injection/)
- [Prompt Injection and Agentic Coding Tools — Secure Code Warrior](https://www.securecodewarrior.com/article/prompt-injection-and-the-security-risks-of-agentic-coding-tools)
- [Prompt Injection: Definition and Attack Taxonomy — CrowdStrike](https://www.crowdstrike.com/en-us/cybersecurity-101/cyberattacks/prompt-injection/)
- [GitHub Copilot CVE-2025-53773](https://www.securecodewarrior.com/article/prompt-injection-and-the-security-risks-of-agentic-coding-tools)

---

## The Architectural Split: Definition vs. Invocation

Every framework that supports dynamic context makes the same architectural split:

| Framework | Static Definition | Dynamic Context Layer |
|-----------|------------------|----------------------|
| OpenAI Agents SDK | `Agent(name, instructions)` | `Runner.run(context=obj)` + callable instructions |
| Pydantic AI | `Agent(system_prompt)` | `@agent.system_prompt` decorator + `RunContext[T]` |
| Claude Code | Subagent YAML frontmatter | Hooks (settings.json) + Skills (`!command`) + Rules (globs) |
| CrewAI | `agents.yaml` | `crew.kickoff(inputs={})` template vars |
| LangGraph | Node/edge definitions | Graph state accumulation |
| Agent Skills Standard | SKILL.md frontmatter | Host-specific extensions (delegated) |

**Pattern:** The definition is always static and portable. Dynamic behavior is always a layer above — the runner, the dispatcher, the orchestrator. No framework puts executable code in the agent definition itself.

Sherpa's architecture already follows this pattern:
- **Definition:** `agents/<slug>.md` with YAML frontmatter + Markdown body
- **Invocation context:** `context-packages` (pointers to project files) + `rules` (pointers to rule files) + `skills` (pointers to skill files)
- **Runtime context:** Handled by the runner/dispatcher (Claude Code, custom scripts, etc.)

The `context-packages` mechanism is Sherpa's equivalent of OpenAI's `RunContextWrapper` or Pydantic AI's `deps`. The difference is that Sherpa's is a pointer (file path) rather than an in-memory object, which makes it serializable, auditable, and portable.

---

## Context Engineering: The Emerging Discipline

"Context engineering" — the practice of dynamically curating, filtering, ranking, and assembling the right information at the right time — is gaining traction as a discipline distinct from prompt engineering (see [Context Engineering — SitePoint](https://www.sitepoint.com/context-engineering-for-agents/), [Atlan Guide](https://atlan.com/know/what-is-context-engineering/), [Martin Fowler](https://martinfowler.com/articles/exploring-gen-ai/context-engineering-coding-agents.html)).

Key principles relevant to Sherpa:
1. **Progressive disclosure** — load context on demand, not all at once. Sherpa's `context-packages` are lazy pointers, not embedded content. This is correct.
2. **Token budget allocation** — different task types need different context strategies. This is a dispatcher concern, not a definition concern.
3. **Three decision points** for when context loads: LLM-decided, human-triggered, or agent-software-determined. Sherpa's `context-packages` are agent-software-determined (loaded at invocation). This is the most deterministic and auditable option.

Context engineering validates Sherpa's approach: the *what* (which files to load) belongs in the definition; the *when* and *how* belong in the runner.

**Sources:**
- [Context Engineering: The New Prompt Engineering — SitePoint](https://www.sitepoint.com/context-engineering-for-agents/)
- [Context Engineering vs Prompt Engineering — System Design Newsletter](https://newsletter.systemdesign.one/p/context-engineering-vs-prompt-engineering)
- [Context Engineering vs Prompt Engineering — Firecrawl](https://www.firecrawl.dev/blog/context-engineering)
- [Context Engineering Complete Guide 2026 — Code Conductor](https://codeconductor.ai/blog/context-engineering)
- [Context Engineering Guide — Prompting Guide](https://www.promptingguide.ai/guides/context-engineering-guide)
- [Everything is Context — arXiv](https://arxiv.org/pdf/2512.05470)

---

## Recommendation

### For Sherpa v1 Schema: Skip Dynamic Hooks

1. **Static YAML with `context-packages` and `rules` is sufficient** for all identified use cases. The existing design follows the same architectural pattern as every major framework.

2. **Reserve the `hooks` field name** in the Zod schema as a recognized-but-unimplemented field. If a user includes it, emit an info-level diagnostic: "hooks field is reserved for future use." This prevents namespace conflicts if dynamic hooks are added later.

3. **Document the architectural split** in the schema spec: "Agent definitions describe *what* the agent does. Runtime context (project state, user identity, temporal conditions) is assembled by the runner/dispatcher. This separation enables portability, auditability, and static validation."

4. **If lightweight dynamism is needed later,** adopt CrewAI's template variable pattern (`{variable}` in strings, resolved by the dispatcher) rather than executable hooks. Template variables are still statically parseable, lintable, and portable.

### Why Not "Add It Now for Future-Proofing"

- YAGNI. No identified use case requires it today.
- The behavioral lint tool cannot validate dynamic fields. Adding them weakens the core value proposition (lintable, auditable agent definitions).
- Portability is Sherpa's competitive advantage. Every framework has its own runtime hooks. Only Sherpa has portable, structured behavioral definitions. Adding runtime-specific hooks erodes that differentiation.
- If the need arises, it can be added as a v2 extension without breaking v1 definitions. Reserved field names ensure forward compatibility.

---

## Raw Links

Every URL encountered during research:

- https://openai.github.io/openai-agents-python/
- https://openai.github.io/openai-agents-python/agents/
- https://openai.github.io/openai-agents-python/context/
- https://openai.github.io/openai-agents-python/ref/agent/
- https://openai.github.io/openai-agents-python/ref/run_context/
- https://openai.github.io/openai-agents-python/ref/tool_context/
- https://openai.github.io/openai-agents-python/tools/
- https://openai.github.io/openai-agents-python/sessions/
- https://openai.github.io/openai-agents-python/config/
- https://openai.github.io/openai-agents-python/running_agents/
- https://developers.openai.com/api/docs/guides/agents-sdk/
- https://developers.openai.com/blog/openai-for-developers-2025/
- https://github.com/openai/openai-agents-python
- https://cookbook.openai.com/topic/agents
- https://rahulkolekar.com/how-to-build-your-first-production-ready-agent-with-openai-s-agents-sdk-and-responses-api-2026-guide/
- https://mem0.ai/blog/openai-agents-sdk-review
- https://blog.agen.cy/p/openai-agents-sdk-a-comprehensive
- https://medium.com/@abdulkabirlive1/understanding-the-agent-class-in-the-openai-agents-sdk-c8e9abf65065
- https://medium.com/@ayeshamughal21/understanding-agent-architecture-in-openais-agents-sdk-222fea3e1178
- https://code.claude.com/docs/en/hooks
- https://code.claude.com/docs/en/skills
- https://code.claude.com/docs/en/hooks-guide
- https://code.claude.com/docs/en/sub-agents
- https://code.claude.com/docs/en/mcp
- https://code.claude.com/docs/en/memory
- https://code.claude.com/docs/en/plugins
- https://code.claude.com/docs/en/settings
- https://code.claude.com/docs/en/permissions
- https://code.claude.com/docs/en/interactive-mode
- https://code.claude.com/docs/en/plugins-reference
- https://code.claude.com/docs/en/common-workflows
- https://code.claude.com/docs/en/scheduled-tasks
- https://code.claude.com/docs/llms.txt
- https://www.eesel.ai/blog/hooks-in-claude-code
- https://www.pixelmojo.io/blogs/claude-code-hooks-production-quality-ci-cd-patterns
- https://claudefa.st/blog/tools/hooks/hooks-guide
- https://dev.to/serenitiesai/claude-code-hooks-guide-2026-automate-your-ai-coding-workflow-dde
- https://blakecrosley.com/guides/claude-code
- https://blog.promptlayer.com/understanding-claude-code-hooks-documentation/
- https://dev.to/klement_gunndu/claude-code-hooks-5-automations-that-replaced-my-manual-workflow-47f4
- https://platform.claude.com/docs/en/agent-sdk/hooks
- https://www.datacamp.com/tutorial/claude-code-hooks
- https://dev.to/sasha_podles/claude-code-using-hooks-for-guaranteed-context-injection-2jg
- https://jessezam.medium.com/hooks-rules-and-skills-feedback-loops-in-claude-code-d47e5f58364d
- https://github.com/affaan-m/everything-claude-code/blob/main/rules/common/hooks.md
- https://github.com/disler/claude-code-hooks-mastery
- https://www.morphllm.com/claude-code-hooks
- https://claudefa.st/blog/guide/mechanics/rules-directory
- https://deepwiki.com/FlorianBruniaux/claude-code-ultimate-guide/16-templates-and-examples
- https://genaiunplugged.substack.com/p/claude-code-skills-commands-hooks-agents
- https://psantanna.com/claude-code-my-workflow/workflow-guide.html
- https://www.builder.io/blog/claude-code
- https://leehanchung.github.io/blogs/2025/10/26/claude-skills-deep-dive/
- https://mikhail.io/2025/10/claude-code-skills/
- https://medium.com/@richardhightower/claude-code-agent-skills-2-0-from-custom-instructions-to-programmable-agents-ab6e4563c176
- https://www.365iwebdesign.co.uk/news/2026/01/29/how-to-use-dynamic-context-injection-claude-code/
- https://kau.sh/blog/claude-skills/
- https://playbooks.com/skills/outfitter-dev/agents/claude-skills
- https://github.com/anthropics/claude-code/issues/17283
- https://www.heyuan110.com/posts/ai/2026-02-28-claude-code-skills-guide/
- https://docs.crewai.com/en/concepts/agents
- https://markaicode.com/crewai-flows-event-driven-agent-orchestration/
- https://github.com/crewAIInc/crewAI
- https://www.spaceo.ai/blog/agentic-ai-frameworks/
- https://latenode.com/blog/ai-frameworks-technical-infrastructure/crewai-framework/crewai-framework-2025-complete-review-of-the-open-source-multi-agent-ai-platform
- https://www.emergentmind.com/topics/crewai-framework
- https://community.crewai.com/t/dynamic-agent-selection-in-crewai-enhancing-efficiency-without-hardcoding/2734
- https://pypi.org/project/crewai/
- https://community.crewai.com/t/generating-agents-and-tasks-files-dynamically/1625
- https://community.crewai.com/t/agent-setup-and-configuration/5217
- https://ai.pydantic.dev/
- https://ai.pydantic.dev/agent/
- https://ai.pydantic.dev/tools/
- https://pub.towardsai.net/introducing-pydantic-ai-skills-composable-agent-skills-for-the-pydantic-ai-ecosystem-dc98dd2bff53
- https://towardsai.net/p/machine-learning/introducing-pydantic-ai-skills-composable-agent-skills-for-the-pydantic-ai-ecosystem
- https://deepwiki.com/pydantic/pydantic-ai/2.1-agent-run-lifecycle
- https://pypi.org/project/pydantic-ai/
- https://pydantic.dev/pydantic-ai
- https://dougtrajano.github.io/pydantic-ai-skills/quick-start/
- https://www.datacamp.com/tutorial/pydantic-ai-guide
- https://docs.langchain.com/oss/python/langgraph/workflows-agents
- https://www.langchain.com/langgraph
- https://dev.to/jamesli/advanced-langgraph-implementing-conditional-edges-and-tool-calling-agents-3pdn
- https://markaicode.com/langgraph-state-machine-branching-logic/
- https://dev.to/jamesli/langgraph-state-machines-managing-complex-agent-task-flows-in-production-36f4
- https://realpython.com/langgraph-python/
- https://medium.com/pythoneers/building-ai-agent-systems-with-langgraph-9d85537a6326
- https://www.ibm.com/think/tutorials/build-agentic-workflows-langgraph-granite
- https://medium.com/@adnanmasood/the-agentic-imperative-series-part-3-langchain-langgraph-building-dynamic-agentic-workflows-7184bad6b827
- https://medium.com/@bharatraj1918/langgraph-state-management-part-1-how-langgraph-manages-state-for-multi-agent-workflows-da64d352c43b
- https://agentskills.io
- https://agentskills.io/specification
- https://github.com/agentskills/agentskills
- https://developers.openai.com/codex/skills/
- https://code.visualstudio.com/docs/copilot/customization/agent-skills
- https://dev.to/onlyoneaman/building-agent-skills-from-scratch-lbl
- https://playbooks.com/skills/openclaw/skills/agentskills-io
- https://inference.sh/blog/skills/agent-skills-overview
- https://github.com/agno-agi/agno/issues/5814
- https://nayakpplaban.medium.com/agent-skills-standard-for-smarter-ai-bde76ea61c13
- https://simonwillison.net/2025/Dec/19/agent-skills/
- https://github.com/anthropics/skills
- https://github.com/agentskills/agentskills/tree/main/skills-ref
- https://www.sitepoint.com/context-engineering-for-agents/
- https://modelslab.com/blog/api/context-engineering-ai-apis-2026
- https://newsletter.systemdesign.one/p/context-engineering-vs-prompt-engineering
- https://atlan.com/know/what-is-context-engineering/
- https://www.firecrawl.dev/blog/context-engineering
- https://codeconductor.ai/blog/context-engineering
- https://martinfowler.com/articles/exploring-gen-ai/context-engineering-coding-agents.html
- https://www.promptingguide.ai/guides/context-engineering-guide
- https://arxiv.org/pdf/2512.05470
- https://www.lakera.ai/blog/prompt-engineering-guide
- https://tao-hpu.medium.com/dynamic-planning-vs-static-workflows-what-truly-defines-an-ai-agent-b13ca5a2d110
- https://www.sketricgen.ai/blog/from-static-to-dynamic-evolution-of-ai-agents
- https://www.exabeam.com/explainers/agentic-ai/agentic-ai-frameworks-key-components-top-8-options/
- https://www.bloomreach.com/en/blog/the-great-debate-static-workflows-vs-dynamic-agents
- https://hammadulhaq.medium.com/dynamic-ai-agents-orchestration-a-new-paradigm-no-its-not-an-mcp-part-1-6f96d33359cf
- https://techcommunity.microsoft.com/blog/azuredevcommunityblog/mcp-vs-mcp-cli-dynamic-tool-discovery-for-token-efficient-ai-agents/4494272
- https://www.intuz.com/blog/top-5-ai-agent-frameworks-2025
- https://www.e2msolutions.com/blog/ai-agent-frameworks-for-agencies/
- https://www.obsidiansecurity.com/blog/prompt-injection
- https://www.securecodewarrior.com/article/prompt-injection-and-the-security-risks-of-agentic-coding-tools
- https://www.lakera.ai/blog/indirect-prompt-injection
- https://proceedings.iclr.cc/paper_files/paper/2025/file/5750f91d8fb9d5c02bd8ad2c3b44456b-Paper-Conference.pdf
- https://www.ncsc.gov.uk/blog-post/prompt-injection-is-not-sql-injection
- https://www.crowdstrike.com/en-us/cybersecurity-101/cyberattacks/prompt-injection/
- https://genai.owasp.org/llmrisk/llm01-prompt-injection/
- https://unit42.paloaltonetworks.com/ai-agent-prompt-injection/
- https://owasp.org/www-community/attacks/PromptInjection
- https://www.mdpi.com/2078-2489/17/1/54
- https://birgitta.info
- https://www.thoughtworks.com/insights/podcasts/technology-podcasts/talking-context-engineering
- https://www.thoughtworks.com/radar/techniques/ai-friendly-code-design
- https://agents.md/
- https://cursor.com/docs/context/subagents
- https://docs.github.com/en/copilot/how-tos/use-copilot-agents/coding-agent/create-custom-agents
