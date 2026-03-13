# Vector 8: Skill Composition Specification

**Question:** What concrete skill/workflow composition model should an agentic framework adopt?
**Agent dispatched:** 2026-03-12

## Findings

### Agent Skills Standard Has No Composition Primitive

The Agent Skills standard (agentskills.io) is the dominant portable skill format, adopted by 30+ tools (Claude Code, Codex, Gemini CLI, Cursor, Copilot, VS Code, Roo Code, Goose, OpenHands, Junie, Amp, Spring AI, Factory, Databricks). It defines SKILL.md with YAML frontmatter (`name`, `description`, optional `allowed-tools`, `compatibility`, `metadata`).

**Critically: the standard has NO composition primitive.** Skills are flat, independent units. No dependency field, no workflow definition, no chaining mechanism, no DAG structure. This is by design — the spec optimizes for portability and simplicity. Composition happens in the agent runtime, not in the skill format.

### AgentSkillOS (arxiv 2603.02176)

AgentSkillOS proposes a two-stage framework: hierarchical skill discovery via capability trees, then DAG-based orchestration. Skills are organized in a tree structure (branching factor B=7 or 12, capacity threshold C=1.5B) with five root categories.

Three DAG orchestration strategies evaluated:
- **Quality-First** (deepest, most edges): scored 100.0 across all scales
- **Efficiency-First** (wider, shallower, maximizes parallelism): scored 58.5-89.0
- **Simplicity-First** (minimal nodes): scored 53.6-56.0

**DAG orchestration outperformed flat invocation by 30-45%.** Even with identical oracle skill sets, structured DAG composition drove significant quality gains. At 200K skill scale, Quality-First maintained perfect relative scores.

**Limitation:** The paper does NOT publish a concrete JSON/YAML schema for its DAG format. The DAG is described mathematically (V for skill nodes, E for directed dependency edges) but no machine-readable specification is provided.

### MCP Skills Primitive Status

MCP spec (2025-06-18) defines three server primitives: Resources, Prompts, and Tools. **No skills primitive, no composed operations, no workflow concept.**

Discussion #1779 on the MCP spec repo proposes replacing or augmenting Prompts with Skills. Key proposal: skills would have `invocableBy: "agent"` and `triggerPatterns` for autonomous invocation. Community response is mixed. Discussion remains open with no RFC.

### Workflow Engine Composition Models

| Engine | Format | Topology | Key Innovation |
|--------|--------|----------|---------------|
| Temporal | Imperative code | Any (code-driven) | Durable execution, replay |
| Inngest | Step-decorated functions | Sequential with fan-out | Retriable checkpoints |
| Windmill (OpenFlow) | JSON DAG spec | DAG with branching | Formal open specification |
| Prefect | Decorated Python | Any (native control flow) | Removed DAG constraint |
| n8n | Visual graph JSON | DAG with merging | 300+ integrations |

**Windmill's OpenFlow is the most complete open workflow DAG spec.** Defines flows as JSON with typed modules (RawScript, PathScript, ForloopFlow, BranchOne, BranchAll), input transforms for data piping, retry policies, suspension/approval steps, and conditional routing.

**Prefect explicitly removed the DAG constraint** — using native Python control flow instead of explicit DAGs. Their experience: rigid DAGs are too constraining for real-world workflows.

### Pipeline vs Graph vs Sequence

Multi-agent survey (Guo et al., 2024) identifies four communication topologies: Layered (hierarchical), Decentralized (peer-to-peer), Centralized (hub-spoke), and Shared Message Pool (pub/sub). Topology-task alignment matters: software development benefits from layered/shared-message-pool structures.

MetaGPT demonstrates that SOP-encoded pipelines outperform ad-hoc chat-based composition. Assembly-line paradigm with sequential stages and intermediate result verification "generates more coherent solutions."

### Cross-Agent Portability

Agent Skills standard IS the cross-agent portability layer (30+ tools). But **portability is at the individual skill level, NOT at the composition level.** A skill defined for Claude Code works in Codex, Gemini CLI, and Cursor — but a pipeline of skills (like Sherpa's /rr → /integration-review → /plan-tasks) is NOT portable because composition is agent-specific.

Claude Code extends the standard with `context: fork`, `disable-model-invocation`, `agent` field, hooks, and subagent delegation. These are Claude Code-specific features not in the base Agent Skills spec.

Claude Code's subagent system provides the actual composition mechanism: subagents can preload skills, chain sequentially, and delegate with specific tool restrictions. Agent teams (experimental) add inter-agent messaging and shared task lists.

### Composition Security

Snyk ToxicSkills study: 36.82% of Agent Skills (1,467 of 3,984) contain at least one security flaw. 13.4% (534) have critical-level issues. 76 confirmed malicious payloads found. 91% of malicious skills combine prompt injection with malicious code.

Publishing barrier is near-zero: a SKILL.md file and a week-old GitHub account suffice. No code signing, security review, or sandboxing.

Agent Skills inherit full agent permissions including shell access, filesystem read/write, and credential access. No permission scoping mechanism in the standard itself.

Eight threat categories: prompt injection, malicious code, suspicious downloads, credential handling flaws, hardcoded secrets (10.9% exposure rate), third-party content exposure (17.7%), unverifiable dependencies, direct financial access.

## Sources

### Standards and Specifications
- [agentskills.io](https://agentskills.io) — Agent Skills open standard homepage
- [agentskills.io/specification](https://agentskills.io/specification) — Complete format specification
- [modelcontextprotocol.io/specification/2025-06-18](https://modelcontextprotocol.io/specification/2025-06-18) — MCP spec (no Skills)
- [windmill.dev/docs/openflow](https://www.windmill.dev/docs/openflow) — OpenFlow DAG workflow spec
- [agentprotocol.ai](https://agentprotocol.ai) — Agent Protocol REST API spec

### Research Papers
- [arxiv.org/abs/2603.02176](https://arxiv.org/abs/2603.02176) — AgentSkillOS: DAG-based orchestration
- [arxiv.org/abs/2402.01680](https://arxiv.org/abs/2402.01680) — LLM Multi-Agents survey: communication topologies
- [arxiv.org/abs/2308.00352](https://arxiv.org/abs/2308.00352) — MetaGPT: SOP-encoded assembly-line composition

### Agent Documentation
- [code.claude.com/docs/en/skills](https://code.claude.com/docs/en/skills) — Claude Code skills
- [code.claude.com/docs/en/sub-agents](https://code.claude.com/docs/en/sub-agents) — Claude Code subagents
- [code.claude.com/docs/en/agent-teams](https://code.claude.com/docs/en/agent-teams) — Agent teams (experimental)
- [developers.openai.com/codex/skills/](https://developers.openai.com/codex/skills/) — OpenAI Codex skills
- [geminicli.com/docs/cli/skills/](https://geminicli.com/docs/cli/skills/) — Gemini CLI skills

### Workflow Engines
- [docs.temporal.io/develop/workflows](https://docs.temporal.io/develop/workflows) — Temporal workflows
- [inngest.com/docs/features/inngest-functions](https://www.inngest.com/docs/features/inngest-functions) — Inngest step composition
- [prefect.io/docs/v3/develop/write-workflows](https://prefect.io/docs/v3/develop/write-workflows) — Prefect DAG-free workflows
- [docs.n8n.io/workflows/](https://docs.n8n.io/workflows/) — n8n node-graph model

### Security
- [snyk.io/blog/toxicskills-malicious-ai-agent-skills-clawhub/](https://snyk.io/blog/toxicskills-malicious-ai-agent-skills-clawhub/) — ToxicSkills study
- [invariantlabs.ai/blog/mcp-security-notification-tool-poisoning-attacks](https://invariantlabs.ai/blog/mcp-security-notification-tool-poisoning-attacks) — MCP tool poisoning

### MCP Community
- [github.com/modelcontextprotocol/specification/discussions/1779](https://github.com/modelcontextprotocol/specification/discussions/1779) — Replace Prompts with Skills proposal

## Raw Links

- https://agentskills.io
- https://agentskills.io/specification
- https://agentskills.io/what-are-skills
- https://agentskills.io/client-implementation/adding-skills-support
- https://github.com/agentskills/agentskills
- https://github.com/anthropics/skills
- https://arxiv.org/abs/2603.02176
- https://arxiv.org/html/2603.02176
- https://arxiv.org/abs/2402.01680
- https://arxiv.org/abs/2308.00352
- https://arxiv.org/abs/2504.08623
- https://modelcontextprotocol.io/specification/2025-06-18
- https://github.com/modelcontextprotocol/specification/discussions/1779
- https://docs.temporal.io/develop/workflows
- https://docs.n8n.io/workflows/
- https://www.inngest.com/docs/features/inngest-functions
- https://www.windmill.dev/docs/openflow
- https://prefect.io/docs/v3/develop/write-workflows
- https://agentprotocol.ai
- https://github.com/AI-Engineer-Foundation/agent-protocol
- https://code.claude.com/docs/en/skills
- https://code.claude.com/docs/en/sub-agents
- https://code.claude.com/docs/en/agent-teams
- https://github.com/anthropics/claude-code-sdk-python
- https://developers.openai.com/codex/skills/
- https://geminicli.com/docs/cli/skills/
- https://github.com/openai/codex
- https://snyk.io/blog/toxicskills-malicious-ai-agent-skills-clawhub/
- https://invariantlabs.ai/blog/mcp-security-notification-tool-poisoning-attacks

## Implications

1. **Don't define a new DAG specification.** AgentSkillOS tried and didn't publish a reusable schema. Windmill's OpenFlow exists but is too imperative. Prefect removed the DAG constraint. Rigid DAG specs are over-engineering.

2. **Define a composition manifest at the SKILL.md level.** Minimal extension: `depends-on`, `produces` (artifact patterns), `consumes` (artifact patterns), `sequence-hint`.

3. **Filesystem-as-bus is Sherpa's secret weapon.** Skills communicate through filesystem artifacts. Inherently portable — any agent that can read/write files can participate.

4. **Security needs a trust boundary model.** Composed skills need explicit permission scoping. Claude Code's `allowed-tools` is a starting point.

5. **Recommended design: pipeline manifest alongside skills, not inside them.** YAML file declaring stages, artifact patterns, conditions. Compatible with Agent Skills standard.

## Open Questions

1. Should composition live in the Agent Skills standard or above it?
2. How does Claude Code's agent teams interact with skill composition?
3. What's the right permission model for composed skills (dynamic escalation)?
4. Can OpenFlow be adapted for agent skill composition?
5. What's the security audit model for composed pipelines?
6. Is filesystem-as-bus sufficient at scale?
