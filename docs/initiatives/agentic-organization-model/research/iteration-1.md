# Iteration 1 — 2026-03-12

## Research Vectors

### Vector 1: AI Workforce Management Platforms
**Question:** Who has shipped production systems for managing persistent AI agent identities — roster, work history, configuration, performance tracking, audit?
**Full report:** [iteration-1/vector-1-ai-workforce-management-platforms.md](iteration-1/vector-1-ai-workforce-management-platforms.md)

**Key discoveries:**
- Workday Agent System of Record (ASOR) is GA — central registry for agent identity, lifecycle, performance, costs, ROI. Open API on GitHub. 65+ partners.
- Microsoft Agent 365 + Entra Agent ID: agent identities as first-class directory objects. GA May 2026, $15/user/month.
- Market fragments into 5 layers: Identity & Access, System of Record, Orchestration & Dispatch, Named AI Employees, Memory & State. No single vendor covers all 5.
- Named AI employee platforms (11x, Artisan, Sintra, Lindy) are vertically integrated — no general-purpose registry.
- HBR predicts "agent manager" becomes standard job title within 12-18 months.
- Lindy explicitly distinguishes "AI agent" (technical building block) from "AI employee" (packaged, job-ready, with permissions/guardrails/memory/monitoring).

**Implications:**
- Sherpa already has orchestration and role definitions. The gap is the System of Record layer (registry, lifecycle, performance, cost) and Memory & State layer.
- No framework-level open-source solution exists for agent instance management. First-mover opportunity.

### Vector 2: Template-to-Instance Architecture Patterns
**Question:** How do established software systems handle the split between definition/template and persistent instance with accumulated state?
**Full report:** [iteration-1/vector-2-template-to-instance-patterns.md](iteration-1/vector-2-template-to-instance-patterns.md)

**Key discoveries:**
- Six universal patterns confirmed across Kubernetes, IAM (AWS/Azure/Google), MMO game servers, HR systems (Workday/BambooHR), OOP, and Docker:
  1. Template defines shape, instance holds state
  2. Instances reference templates, not vice versa
  3. Layered override with defaults
  4. Template immutability, instance mutability
  5. Instance state falls into three categories: identity, operational state, accumulated history
  6. Physical separation of template and instance data
- Azure Application Object → Service Principal is the strongest analog: one-to-many, own credentials, own audit trail. Microsoft's docs: *"Similar to a class in object-oriented programming."*
- Workday three-tier model (Job Profile → Position → Worker) adds an intermediate "slot" layer.
- Game servers use separate databases (world vs characters) to enforce the split.
- Type Object pattern (Game Programming Patterns) formalizes data-driven type definitions in JSON.

**Implications:**
- The template/instance split is structural, not a design preference. Every mature system implements it.
- Agent instances should reference their role definitions (not vice versa), override specific fields while inheriting defaults, and be physically separated from role catalog.

### Vector 3: Skills/Agents/Instances Convergence
**Question:** Can behavioral agent definitions, executable skills, and agent instances be unified into a single construct?
**Full report:** [iteration-1/vector-3-skills-agents-instances-convergence.md](iteration-1/vector-3-skills-agents-instances-convergence.md)

**Key discoveries:**
- Claude Code's Skills and Subagents are already structurally near-identical (YAML frontmatter + Markdown body, same fields). A skill with `context: fork` ≈ a subagent. A subagent with `skills: [...]` preloads skills.
- Agent Skills open standard (30+ tools adopted) provides the portable base layer: name + description + body. Sherpa's behavioral fields (disposition, fail-triggers, quality-bar) are extensions that degrade gracefully.
- No framework has a unified skill-role-instance construct. All maintain separate constructs.
- SkillsBench (Feb 2026): 2-3 skills per task optimal, compact definitions outperform comprehensive by 21.7pp. Validates T-shaped model.
- Agent Behavioral Contracts (ABC) paper maps cleanly to Sherpa schema: preconditions→context-packages, hard invariants→fail-triggers, hard governance→behavioral-constraints, soft governance→quality-bar, recovery→escalation.

**Implications:**
- Unified construct is viable: Agent Skills base + Sherpa behavioral extensions + Claude Code memory field.
- Zoom level = which fields are populated. Skill (protocol) → Role (constraints) → Instance (constraints + state).
- The `memory` field is the key differentiator between role and instance.

### Vector 4: Human+AI Organizational Modeling
**Question:** How do you model a hybrid human+AI organization? What's the minimum viable agent instance model?
**Full report:** [iteration-1/vector-4-human-ai-org-modeling.md](iteration-1/vector-4-human-ai-org-modeling.md)

**Key discoveries:**
- AI employee platforms (11x, Artisan, Lindy, Cassidy, Sintra) all model agents as named persistent workers with faces and job titles. All vertically integrated — none is a general-purpose registry.
- HAIF framework (arxiv 2602.07641): four autonomy tiers with quantifiable promotion/demotion criteria, delegation registry, effort estimation model where validation (30-60%) becomes primary cost.
- YouTube case study: 2 Claude agents, 52 videos, 30K views in 6 weeks. Filesystem-based memory files ("reads its memory file, checks what happened since it last worked"). Validates overnight workforce pattern.
- Proposed MVP: 12 fields in 5 categories (identity, configuration, assignment, runtime overrides, history).
- Agent versioning is unsolved industry-wide. Four layers: cognitive (prompts), model (LLM version), knowledge (embeddings), tool contracts.
- Gartner: 20% of orgs will use AI to eliminate half of middle management by 2026.

**Implications:**
- Three-layer architecture validated: Role Definition (exists in Sherpa) + Agent Instance (needed) + Task Execution (exists).
- Filesystem-based YAML instance files are consistent with Sherpa philosophy and validated by the YouTube case study.
- Start without persistent memory/learning — config + stats is enough for v1.

## Synthesis

The single most important finding: **the template-to-instance split is not a design choice — it's a structural requirement.** Every mature system that manages persistent entities over evolving templates implements the same six patterns (Vector 2). The market is actively building this layer for AI agents (Vector 1). The existing framework constructs (skills, roles) can be unified into a single schema where the zoom level is determined by populated fields (Vector 3). And the minimum viable version is small enough to build in 3-4 sessions (Vector 4).

**Cross-vector insight 1: The unified schema is both theoretically sound and practically proven.** Agent Skills standard (portability) + Sherpa behavioral fields (quality) + Claude Code memory (persistence) compose cleanly. No other framework has attempted this unification. The reason: they all treat skills, agents, and identity as separate concerns because they don't have Sherpa's behavioral schema as a bridging layer.

**Cross-vector insight 2: Filesystem is correct for v1, database is correct for scale.** The YouTube case study (Vector 4) validates filesystem-based agent state. The Workday ASOR (Vector 1) shows where it goes at enterprise scale. Sherpa's existing pattern (YAML source of truth + SQLite index via MCP server) handles both without architectural change.

**Cross-vector insight 3: The instance layer is what turns a framework into an organization.** Sherpa without instances = a workflow engine. Sherpa with instances = a system for running an AI-staffed organization. The business vision (content engine, YouTube pipeline, AI literacy consulting) requires the latter.

## All Sources

### Enterprise Platforms
- [Workday ASOR](https://github.com/Workday/asor) — Agent System of Record open API
- [Microsoft Agent 365](https://www.microsoft.com/en-us/microsoft-365/blog/) — Agent identity and control plane
- [Salesforce Agentforce](https://www.salesforce.com/agentforce/) — Pre-built agent marketplace

### AI Employee Platforms
- [11x.ai](https://www.11x.ai/) — Named AI SDRs (Alice, Jordan)
- [Artisan AI](https://www.artisan.co/) — Named AI employees (Ava the SDR)
- [Lindy.ai](https://www.lindy.ai/) — Custom AI employee builder
- [Sintra.ai](https://sintra.ai/) — 28+ named AI employees
- [Cassidy](https://cassidy.ai/) — Enterprise AI assistant platform

### Architecture Patterns
- [Kubernetes: Pods](https://kubernetes.io/docs/concepts/workloads/pods/)
- [Microsoft: Apps & service principals](https://learn.microsoft.com/en-us/entra/identity-platform/app-objects-and-service-principals)
- [Game Programming Patterns: Type Object](https://gameprogrammingpatterns.com/type-object.html)
- [Workday Position Management](https://www.suretysystems.com/insights/workday-position-management-101/)
- [Docker Container Lifecycle](https://last9.io/blog/docker-container-lifecycle/)

### Agent Standards & Research
- [Agent Skills specification](https://agentskills.io/specification)
- [Claude Code Skills](https://code.claude.com/docs/en/skills)
- [Claude Code Subagents](https://code.claude.com/docs/en/sub-agents)
- [SkillsBench](https://arxiv.org/html/2602.12670v1) — 2-3 skills optimal, compact > comprehensive
- [Agent Behavioral Contracts](https://arxiv.org/html/2602.22302)
- [HAIF framework](https://arxiv.org/abs/2602.07641) — Four autonomy tiers

### Frameworks
- [CrewAI Agents](https://docs.crewai.com/concepts/agents)
- [OpenAI Agents SDK](https://github.com/openai/openai-agents-python)
- [Google ADK](https://google.github.io/adk-docs/agents/llm-agents/)

### Case Studies
- [YouTube automation case study](https://dev.to/wcamon/i-let-ai-agents-run-my-youtube-channel-for-6-weeks)

## Proposals Generated

- `proposal.md` — Agentic Organization Model: agent instance layer with unified schema, YAML instance files, instance lifecycle, Studio UI surface, and framework integration points.

## Open Questions for Next Iteration

1. **Unified schema directory structure** — Should skills, roles, and instances live in a single directory tree, or maintain separate directories with a shared schema? What's the migration path from the current `docs/agents/roles/` + `.claude/skills/` split?

2. **Template change propagation** — When a role definition updates, what happens to existing instances? Kubernetes creates new pods; Azure updates home-tenant only; games never propagate. Which model fits agent instances? Does `role: engineer` mean "current engineer definition" or "engineer definition at creation time"?

3. **Autonomy tier model** — HAIF proposes four tiers (full autonomy → supervised → approval-required → human-only) with quantifiable promotion/demotion criteria. How does this compose with Sherpa's existing oversight patterns (morning review, Judge role, integration review)?

4. **Instance-to-instance collaboration** — How do agent instances hand off work to each other? The current model is: Planner dispatches tasks to anonymous workers. With instances, does Sarah the Designer hand off to Marcus the Engineer directly, or does dispatch remain centralized?

5. **Cost and performance attribution** — What's the right granularity? Per-instance lifetime stats, per-initiative rollups, per-session details? How does this connect to the Studio morning review cost visibility pattern?
