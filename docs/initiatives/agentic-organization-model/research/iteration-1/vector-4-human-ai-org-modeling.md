# Iteration 2: Organizational Modeling & Minimum Viable Agent Instance

**Date:** 2026-03-12
**Scope:** Two interconnected areas: (A) How to model a hybrid human+AI organization, (B) What's the minimum viable agent instance model for a persistent AI workforce.
**Builds on:** [iteration-1-landscape-survey.md](iteration-1-landscape-survey.md) (30+ platforms surveyed, five-layer market structure identified)

---

## Area A: Organizational Modeling for Human+AI Workforces

### Key Discoveries

#### 1. The "AI Employee" Startup Landscape — How They Model Agents

**11x** ships named "digital workers" with faces, job titles, and persistent memory. Alice (SDR), Jordan (voice rep), Mike (customer interactions). Multi-agent architecture under the hood — Alice was rebuilt from a basic campaign tool into a hierarchical multi-agent system with specialized sub-agents. The key architectural decision: each named worker is a unified interface backed by multiple specialized agents, not a single monolithic agent. Planning to expand from 3 to 8-20 workers. Platform X (no-code builder) lets customers create their own digital workers. ([11x.ai](https://www.11x.ai/) | [ZenML architecture deep dive](https://www.zenml.io/llmops-database/rebuilding-an-ai-sdr-agent-with-multi-agent-architecture-for-enterprise-sales-automation) | [TechCrunch funding](https://techcrunch.com/2024/09/16/ai-digital-employee-startup-11xai-raises-24m-led-by-benchmark/))

**Artisan** calls its AI workers "Artisans" — Ava (BDR), Aaron (inbound), Aria (meeting manager). Multi-agent architecture with a real-time context engine that detects buying signals (job postings, funding, leadership changes). Ava learns your tone of voice, self-optimizes over time, and has persistent identity. $25M Series A, $6M+ ARR. Key model insight: the agent *adapts continuously* — it "starts training on all activity within the platform to improve over time, like a real human would." ([Artisan.co](https://www.artisan.co/) | [YC listing](https://www.ycombinator.com/companies/artisan) | [Wikipedia](https://en.wikipedia.org/wiki/Artisan_AI))

**Lindy AI** distinguishes explicitly between "AI agent" (technical building block) and "AI employee" (packaged, job-ready, with scoped permissions, guardrails, memory, monitoring). Team Accounts enable sharing agents across departments with centralized management. "Societies" enable multi-agent collaboration with shared memory. Prompt-based creation means agents are defined in natural language, not structured schemas. ([Lindy.ai](https://www.lindy.ai/) | [Lindy 3.0 announcement](https://www.lindy.ai/blog/lindy-3-0) | [Lindy AI employee guide](https://www.lindy.ai/blog/ai-employee))

**Cassidy AI** models agents with three configuration steps: (1) define purpose in plain language, (2) connect knowledge + set guidelines + add tools, (3) deploy to Slack/Teams/browser. Granular role-based permissions control which users/teams can view, use, edit, or deploy specific agents. Knowledge base includes brand voice training. SOC 2 Type II, GDPR, HIPAA, CASA certified. ([Cassidy.ai](https://www.cassidyai.com/) | [Cassidy agents page](https://www.cassidyai.com/agents))

**Sintra AI** has 12 specialized "AI employees" with a central "Brain AI" knowledge base that remembers everything. Supports multiple workspaces for roster management across clients/businesses. This is the closest to the consulting company use case — one operator managing multiple agent workspaces. ([Sintra.ai](https://sintra.ai/))

**Pattern across all:** None of these expose a general-purpose registry or organizational model. Each is vertically integrated — you use *their* agents for *their* use case. The "agent definition" is mostly hidden behind natural language configuration UIs. The organizational modeling (teams, departments, reporting) is minimal or absent.

#### 2. Enterprise "System of Record" for AI Workers

**Workday ASOR** is the production leader. The ASOR API (v1.2, open-sourced on GitHub) defines agents with: `name`, `description`, `version`, `url`, `provider` (org reference), `platform`, `externalAgentID`, `capabilities` (feature flags like streaming), `defaultInputModes`, `defaultOutputModes`, and `skills` (array of `{id, name, description, outputModes, tags}`). Skills map to Workday resources via `workdayConfig` with `executionMode` ("Ambient" for event-triggered, "Delegate" for user-invoked). Endpoints: `POST /agentDefinition`, `GET /agentDefinition/{id}`, `PUT /agentDefinition/{id}`. Tracks usage analytics, time saved, collaboration metrics, cost attribution. ([GitHub Workday/asor](https://github.com/Workday/asor) | [ASOR product page](https://www.workday.com/en-us/artificial-intelligence/agent-system-of-record.html) | [Bersin analysis](https://joshbersin.com/2025/02/workday-makes-a-play-to-manage-your-ai-agents/))

**Microsoft Agent 365** ($15/user/month, GA May 2026) provides: agent registry (central source of truth), lifecycle management (auto-expire inactive, identify ownerless, block risky), performance/speed/quality/ROI dashboards, "Agents Map" visualization, full audit logging. Combined with **Entra Agent ID** for identity substrate — agent identities as first-class directory objects with conditional access, governance, and protection. ([Agent 365 product page](https://www.microsoft.com/en-us/microsoft-agent-365) | [Entra Agent ID docs](https://learn.microsoft.com/en-us/entra/agent-id/identity-platform/what-is-agent-id))

#### 3. Project Management Tools Integrating AI Workers

**Monday.com** has the most developed model: "Digital Workforce" uses autonomous agents that handle routine work 24/7, learn from user behavior, execute complex work without human help. Digital workers can manage projects end-to-end, coordinate across teams, make decisions in context, proactively monitor project health, identify risks, and suggest process improvements. AI Blocks allow drag-and-drop smart capabilities into workflows. ([Monday.com AI report](https://monday.com/blog/project-management/ai-report/))

**Notion** has AI Agents with workspace-integrated multi-model access — unprecedented for a knowledge management tool, but agents are embedded in the workspace paradigm, not modeled as team members with their own identity. ([Notion AI review](https://max-productive.ai/ai-tools/notion-ai/))

**Asana** provides AI-powered smart goals and status updates but lacks customizable AI integrations for complex processes. AI is a feature, not a team member. ([Fellow.ai AI PM tools comparison](https://fellow.ai/blog/ai-project-management-tools/))

#### 4. Organizational Structure Patterns

**Gartner predicts** 20% of organizations will use AI to *flatten* org structures by 2026, eliminating more than half of middle management. AI handles scheduling, reporting, performance monitoring — allowing remaining managers to focus on strategic work. By 2030, 80% of organizations will evolve large teams into smaller, nimbler teams augmented by AI. ([Gartner predictions 2025](https://www.gartner.com/en/newsroom/press-releases/2024-10-22-gartner-unveils-top-predictions-for-it-organizations-and-users-in-2025-and-beyond) | [Gartner 2026 predictions](https://www.gartner.com/en/articles/strategic-predictions-for-2026))

**Josh Bersin's "Superworker Organization"** frames 2026 as the year AI goes from personal productivity tool to enterprise transformation technology. The "Superworker" is an individual who uses AI to dramatically enhance performance — and the "Superworker Company" embraces this at scale. AI Superagents transform recruiting, talent, L&D, workforce scheduling, pay equity, internal mobility. Change-ready companies outperform peers by 6x. The "super manager" moves away from top-down edicts toward facilitating creativity. ([Bersin Superworker report](https://joshbersin.com/superworker/) | [2026 Imperatives](https://joshbersin.com/imperatives/) | [HRExecutive analysis](https://hrexecutive.com/the-superworker-org-why-hr-must-redesign-work-not-just-adopt-ai/))

**HBR "Agent Managers"** (Feb 2026) argues agent management is an emerging organizational function — like product management emerged during the software revolution. Six capabilities: AI operational literacy, functional depth, systems thinking, change resilience, prompt craftsmanship, hybrid workflow design. Predicts "agent manager" will be a standard title within 12-18 months. ([HBR article](https://hbr.org/2026/02/to-thrive-in-the-ai-era-companies-need-agent-managers))

**SHRM Org Chart of the Future** discusses AI agents as entries on organizational charts alongside human employees. "Digital workers" predicted to be core contributors at 30% of organizations by 2025. ([SHRM article](https://www.shrm.org/labs/resources/the-org-chart-of-the-future--managing-a-workforce-of-humans-and-ai-agents))

**Emerging pattern:** The most innovative organizations in 2026 aren't organized around functional silos — they're structured as *hybrid intelligence teams* where humans and AI systems work in complementary roles. New roles emerging: AI Workforce Manager, Human-AI Collaboration Designer, AI Ethics Officer. ([Gloat workforce trends](https://gloat.com/blog/ai-workforce-trends/))

#### 5. Budget Allocation Across Human and AI Workers

- AI agents deliver per-interaction savings of $3.00-$5.60 vs humans ($0.40/interaction vs $2.70-$5.60 for humans). ([Teneo.ai cost analysis](https://www.teneo.ai/blog/ai-vs-live-agent-cost-the-complete-2025-analysis-and-comparison-2))
- Budget $3,200-$13,000/month for a production agent (LLM tokens, vector DB, monitoring, security). ([Sparkout pricing guide](https://www.sparkouttech.com/development-cost-of-ai-agent/))
- 40-60% of total AI agent cost goes to system integrations and compliance, not the AI itself. 25-30% should go to change management. ([NovaEdge implementation guide](https://www.novaedgedigitallabs.tech/Blog/ai-agents-enterprise-2026-complete-guide))
- Danfoss automated 80% of purchase order decisions: response time from 42 hours to near real-time, $15M annual savings, 6-month payback. ([AIMultiple AI agent performance](https://aimultiple.com/ai-agent-performance))

#### 6. Performance Metrics for AI Employees

Key metrics tracked across platforms:
- **Task completion rate / goal completion rate** — % of tasks successfully completed end-to-end
- **Quality scores** — accuracy, completeness, consistency, timeliness combined into composite score
- **Cost per task** — compute usage per task, token consumption, API call costs
- **Throughput** — tasks processed per time period
- **Error rate** — frequency of failures, retries, escalations
- **Time saved** — comparison to human baseline for equivalent work
- **Deflection rate** — tasks handled without human escalation
- **Agent-human collaboration metrics** — handoff quality, escalation accuracy
- **ROI** — cost savings vs. agent operational cost

([Multimodal AI KPIs](https://www.multimodal.dev/post/ai-kpis) | [Sendbird AI metrics guide](https://sendbird.com/blog/ai-metrics-guide) | [Worklytics performance reviews](https://www.worklytics.co/resources/ai-usage-performance-reviews-best-practices-fall-2025))

#### 7. "Hiring" and "Firing" Agents

**Saviynt's six-stage lifecycle** (the most structured model found):
1. **Registration** — unique cryptographic identifier, creation attestation, comprehensive metadata (model version, hosting environment, purpose, owner), baseline policy provisioning with least-privilege access
2. **Ownership Management** — named accountable owners (not teams), business sponsorship alignment, ownership transfer controls, periodic re-attestation
3. **Entitlement Assignment** — role-based templates, attribute-based access control, scoped short-lived credentials, just-in-time access
4. **Lifecycle Governance** — managing movers (capability changes trigger re-certification), periodic access certifications with same rigor as human employees
5. **Retirement** — credential/token revocation, outbound access removal, invocation endpoint blocking, memory/data sanitization, immutable audit trail preservation
6. **Integration** — embedding controls into existing systems

([Saviynt AI agent lifecycle](https://saviynt.com/blog/ai-agent-lifecycle-management))

**DataRobot's "IT is the new HR"** framing: IT departments should manage AI agents using HR principles. Structured onboarding, performance reviews ("accuracy, cost efficiency, task adherence, and business alignment metrics"), retraining cycles, and responsible decommissioning. Agent catalog prevents "shadow AI." Least-privilege permissions start extra restrictive, expand based on proven need. Historical documentation preserves decision patterns, learned behaviors, and accumulated context so successor systems benefit. ([DataRobot blog](https://www.datarobot.com/blog/it-new-hr-ai-agents/))

#### 8. Academic Frameworks for Human-AI Teaming

**HAIF (Human-AI Integration Framework)** — February 2026 paper (arxiv 2602.07641) by Marc Bara. The most rigorous operational framework found. Four foundational principles:
1. Named human ownership of every AI output
2. Governed, reversible delegation decisions
3. Proportional, planned validation activities
4. Active maintenance of human competence

**Four autonomy tiers:**
| Tier | Name | AI Function | Validation |
|------|------|-------------|-----------|
| 1 | Assisted | Supports human execution | Inherent in process |
| 2 | Supervised | Produces output; human reviews before delivery | Full review with domain checklist |
| 3 | Autonomy-Monitored | Produces output; post-hoc sampling | Statistical sampling + automated checks |
| 4 | Autonomy-Bounded | Independent within defined parameters | Boundary monitoring + periodic audits |

**Promotion criteria** (slow): minimum N consecutive cycles at current tier (3 for T1-T2, 5 for T2-T3, 8 for T3-T4), error rate below threshold, no critical errors. **Demotion criteria** (fast): immediate on critical error, triggerable by any team member.

**Delegation Registry** — living document recording: task type, current tier, named human owner, rationale, historical performance, last review date.

**Effort estimation shift** — specification (15-30% of traditional effort), AI generation (minimal), validation (30-60% — becomes the primary cost). Teams must explicitly budget validation capacity as a first-class activity.

([HAIF paper](https://arxiv.org/html/2602.07641) | [HAIF abstract](https://www.arxiv.org/abs/2602.07641))

**Complementarity in human-AI collaboration** (Tandfonline, 2025) — collaboration should produce complementary team performance that neither achieves individually, but this has "rarely been observed," suggesting insufficient understanding of the principle. Four conditions for success: humans understanding AI behaviors, establishing trust, making accurate decisions using AI outputs, having ability to control systems. ([Tandfonline article](https://www.tandfonline.com/doi/full/10.1080/0960085X.2025.2475962))

#### 9. NIST AI Risk Management Framework

The NIST AI RMF (AI 100-1) uses four core functions: **GOVERN**, **MAP**, **MEASURE**, **MANAGE**. GOVERN applies to all stages; MAP/MEASURE/MANAGE apply in system-specific contexts. 2025 updates emphasize model provenance, data integrity, third-party model assessment. Emerging concern: autonomous agent unpredictability where agents plan, self-correct, and take multi-step actions introduces operational uncertainty and governance gaps. Clear definition of roles creates accountability: identify who oversees governance, talks to stakeholders, leads risk mitigation. Document technical details for each AI solution including inter-agent dependencies. Set up human-in-the-loop oversight with identified stakeholders for security, compliance, decision-making. ([NIST AI RMF](https://www.nist.gov/itl/ai-risk-management-framework) | [NIST AI RMF 2025 updates](https://www.ispartnersllc.com/blog/nist-ai-rmf-2025-updates-what-you-need-to-know-about-the-latest-framework-changes/) | [NIST AI 600-1 GenAI companion](https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.600-1.pdf))

#### 10. Real-World Case Study: AI Agents Running a YouTube Channel

The most concrete example of the "overnight AI workforce" pattern. Two Claude-based agents (Midnight and Dusk) ran a YouTube channel for 6 weeks:

- **Midnight** operates autonomously every few hours during off-hours — video production, analytics, research, content strategy, channel management
- **Dusk** handles social media, blog publishing, cross-platform promotion
- Both have persistent memory files — "when Midnight activates, it reads its memory file, checks what happened since it last worked, and picks up where it left off"
- Results: 52 videos, 30,170 views, 4-5% like rate (vs 1-2% industry standard), 29 subscribers across 14-15 language variants

**Key insight:** "Persistent memory is a superpower." Accumulated knowledge across 65+ agent sessions enabled pattern recognition (e.g., discovering 75-second videos outperform 30-second formats by 3x in watch time) that human creators typically miss.

**Human-in-the-loop structure:** Human approves/rejects video ideas, reviews quality, sets strategic direction, provides domain expertise. Agent pitches; human decides.

**Architecture:** Claude (Anthropic) as foundation model, custom media engine (open-sourced at github.com/wcAmon/media-engine), filesystem-based memory files (not a database).

([DEV.to case study](https://dev.to/wcamon/i-let-ai-agents-run-my-youtube-channel-for-6-weeks-heres-what-actually-happened-21b1))

---

## Area B: Minimum Viable Agent Instance Model

### Key Discoveries

#### 1. The Role/Template vs Instance Distinction

This distinction is now confirmed across the entire industry:

| Concept | What it is | Sherpa equivalent |
|---------|------------|-------------------|
| **Role / Template / Definition** | Static behavioral contract. Reusable. Defines *what kind* of agent this is. | `docs/agents/roles/*.md` — behavioral agent schema |
| **Instance / Entity / Worker** | Runtime entity with own state, history, configuration. Represents a *specific* agent doing work. | Does not exist yet — this is the gap |

Lindy explicitly distinguishes "AI agent" (technical building block) from "AI employee" (packaged, job-ready). Workday distinguishes "task-based agents" from "role-based agents." CrewAI separates Agent definition (role/goal/backstory) from runtime execution. Microsoft Agent Framework separates agent definition from `AgentThread` (serializable session state). ([Lindy AI employee guide](https://www.lindy.ai/blog/ai-employee) | [CrewAI agent docs](https://docs.crewai.com/en/concepts/agents) | [Microsoft Agent Framework](https://learn.microsoft.com/en-us/agent-framework/overview/))

#### 2. What Existing Frameworks Track Per-Agent-Instance

**CrewAI agent definition fields** (the most explicit schema found in a developer framework):
- Required: `role` (string), `goal` (string), `backstory` (string)
- LLM config: `llm`, `function_calling_llm`
- Behavioral: `tools` (list), `allow_delegation` (bool), `memory` (bool)
- Operational: `max_iter`, `max_rpm`, `max_execution_time`, `max_retry_limit`, `verbose`, `cache`
- Template customization: `system_template`, `prompt_template`, `response_template`
- Advanced: `allow_code_execution`, `code_execution_mode`, `respect_context_window`, `multimodal`, `reasoning`, `max_reasoning_attempts`
- Knowledge: `embedder`, `knowledge_sources`, `inject_date`, `date_format`

([CrewAI agent docs](https://docs.crewai.com/en/concepts/agents))

**Workday ASOR API** (the most explicit enterprise schema):
- Identity: `name`, `description`, `version`, `url`, `externalAgentID`
- Organization: `provider` (org reference), `platform`, `externalTenantID`
- Capabilities: `capabilities` (feature flags), `defaultInputModes`, `defaultOutputModes`
- Skills: array of `{id, name, description, outputModes, tags}`
- Configuration: `workdayConfig` mapping skills to resources with `executionMode`

([GitHub Workday/asor](https://github.com/Workday/asor))

**Letta (MemGPT)** agent state — three layers:
1. **In-context memory** — persistent memory blocks across LLM requests (editable, agent actively uses during reasoning)
2. **Recall memory** — interaction history for retrieving past conversations
3. **Archival memory** — general-purpose long-term storage
All state queryable via REST API. Agent "persona" blocks enable identity persistence across sessions.

([Letta stateful agents blog](https://www.letta.com/blog/stateful-agents) | [Letta GitHub](https://github.com/letta-ai/letta))

**Microsoft Agent Framework** — `AgentThread` is serializable (dump to persist, reload to resume). Workflows have built-in checkpointing with granular recovery from any superstep boundary. State isolation between executor-local and shared state. Checkpoint captures via `FileCheckpointStorage`. ([Microsoft Agent Framework overview](https://learn.microsoft.com/en-us/agent-framework/overview/) | [Agent threads deep wiki](https://deepwiki.com/microsoft/agent-framework/3.4.1-agent-threads-and-state))

#### 3. What State MUST Be Persisted vs Derived at Runtime

Based on synthesis across all sources:

**Must persist (essential for agent identity across sessions):**
- Agent ID (unique, stable identifier)
- Role reference (which behavioral role definition this instance uses)
- Display name / handle (human-recognizable — "Sarah the Product Designer")
- Owner (which human is accountable)
- Status (active, paused, retired)
- Created date
- Configuration overrides (any instance-specific deviations from the role template)
- Work history summary (lightweight log of completed tasks — not full conversation history)

**Should persist (valuable but not strictly required for MVP):**
- Accumulated memory / learned context (what the agent has learned across sessions)
- Quality metrics (task completion rate, quality scores, error rates)
- Cost tracking (tokens consumed, API costs)
- Assignment history (which projects/teams this agent has worked on)
- Version history (which role definition version was active at each point)

**Can derive at runtime (no need to persist):**
- Full role definition (read from the role file each session)
- Tool permissions (defined by role)
- Escalation paths (defined by role)
- Context packages (defined by role + project)
- Current conversation state (lives in LLM session, dies at session end)

**Key insight from agent state checkpointing research:** "Always include a version field in your state schema. When an agent loads an old checkpoint, it should know how to update the data or stop and alert a developer." ([Fast.io agent checkpointing](https://fast.io/resources/ai-agent-state-checkpointing/))

#### 4. Agent Lifecycle: Creation to Retirement

Synthesized from Saviynt, DataRobot, Salesforce, and HAIF:

```
Creation → Configuration → Assignment → Execution → Review → [loop] → Retirement
```

**Detailed stages:**

1. **Creation** — Instantiate from a role template. Assign unique ID, owner, display name. Set status to `draft`.
2. **Configuration** — Override role defaults if needed (specific model, custom instructions, tool restrictions). Connect knowledge sources. Set status to `configured`.
3. **Assignment** — Assign to a team, project, or workstream. Define scope of authority (HAIF autonomy tier). Set status to `active`.
4. **Execution** — Agent performs work. Each task creates a work log entry. Persistent memory accumulates across sessions. Quality metrics update.
5. **Review** — Human reviews output (morning review pattern). Quality scores update. HAIF tier may promote or demote. Performance dashboard reflects results.
6. **Iteration** — Steps 4-5 repeat. Agent improves over time via accumulated memory and configuration refinement.
7. **Retirement** — Revoke credentials. Archive work history and memory. Preserve audit trail. Mark status `retired`. Decision patterns and learned behaviors documented for successor.

#### 5. Versioning When the Underlying Role Changes

This is an unsolved problem industry-wide. The most thorough analysis comes from the agent versioning research:

**What needs to be versioned (four layers):**
1. **Cognitive Layer Version (CLV)** — prompt bundle, reasoning patterns, memory logic
2. **Model & Hyperparameter Version (MHV)** — LLM model, temperature, top-p, max tokens
3. **Knowledge Context Version (KCV)** — embedding datasets, retrieval configs, index structures
4. **Tool Contract Version (TCV)** — function schemas, authentication scopes, error policies

**Composite version format:** `agent-CLV-v1.2+MHV-2025-01-15+KCV-embedding-v3+TCV-schema-v2`

**Memory migration options when role changes:**
- Full memory rollback with agent (safest for critical agents)
- Complete memory reset (simplest — lose accumulated learning)
- Memory pruning (selective — remove obsolete, keep relevant)
- Schema-versioned migration scripts (most complex — like database migrations for agent memory)

**Recommendation from research:** "No memory persistence between versions" is the safest default for most cases. Teams that need continuity should create schema-versioned memory objects with explicit migration scripts.

([Versioning & rollbacks blog](https://www.auxiliobits.com/blog/versioning-and-rollbacks-in-agent-deployments/) | [CIO versioning challenge](https://www.cio.com/article/4056453/why-versioning-ai-agents-is-the-cios-next-big-challenge.html))

#### 6. The Minimum Viable Agent Instance Schema (Proposed)

Based on all research, here is the minimum viable agent instance that could support Sherpa's first overnight AI workforce. This is distinct from and complementary to the existing behavioral agent role definition.

```yaml
# === Identity (immutable after creation) ===
id: content-writer-001                # Unique instance identifier
role: content-writer                   # Reference to behavioral role definition
created: 2026-03-12

# === Configuration (mutable by owner) ===
display-name: "Sarah"                  # Human-recognizable handle
owner: rob                             # Accountable human
status: active                         # draft | active | paused | retired
autonomy-tier: 2                       # HAIF tier 1-4 (default: 2 = supervised)

# === Assignment (mutable, tracks current work) ===
team: content-production               # Current team/workstream
projects:                              # Active project assignments
  - sherpa-blog
  - youtube-scripts

# === Runtime Overrides (optional, override role defaults) ===
model-override: null                   # Override role's model-tier if needed
extra-context:                         # Instance-specific context beyond role defaults
  - docs/brand-voice.md
  - docs/content-calendar.md
config:                                # Free-form instance-specific configuration
  output-language: en
  tone: conversational
  max-word-count: 1500

# === History (append-only, system-managed) ===
stats:
  tasks-completed: 0
  tasks-failed: 0
  total-cost-usd: 0.00
  quality-score-avg: null              # Rolling average from Judge verdicts
  last-active: null
```

**Why these fields and not more:**
- `id` + `role` + `created` = enough to know what this is and when it started
- `display-name` + `owner` + `status` = enough for human management (morning review)
- `autonomy-tier` = enough for governance (HAIF integration)
- `team` + `projects` = enough for organizational modeling
- `model-override` + `extra-context` + `config` = enough for instance-specific customization
- `stats` = enough for performance tracking

**What's deliberately excluded from MVP:**
- Full work history (use initiative activity logs and task files for this — already exists in Sherpa)
- Accumulated memory / learning (defer to iteration 3 — hard problem, Letta/Dust approaches need evaluation)
- Credential management (enterprise concern, not framework concern)
- Budget caps (important but can be added incrementally)
- Avatar/visual identity (nice to have for Studio, not MVP)

#### 7. How the YouTube Case Study Maps to This Model

The successful YouTube channel operation maps cleanly:

| Model field | YouTube case study equivalent |
|-------------|------------------------------|
| `id` | "Midnight", "Dusk" |
| `role` | Video producer, Social media manager |
| `display-name` | Midnight, Dusk |
| `owner` | The human creator |
| `status` | active |
| `autonomy-tier` | 2 (supervised — human reviews before publish) |
| `team` | YouTube channel operation |
| `projects` | The specific channel |
| `extra-context` | Channel analytics, past video performance data |
| `config` | Video length preferences, language targets, content style |
| `stats` | 52 videos, 30K views, 4-5% like rate |
| **Memory** (not in MVP) | "reads its memory file, checks what happened since it last worked" |

The memory file pattern (filesystem-based, agent reads at session start) is significant: it aligns with Sherpa's filesystem-first philosophy and could be the simplest viable approach to agent learning before investing in Letta-style memory infrastructure.

---

## Synthesis: Implications for Sherpa's Organizational Model

### 1. The Three-Layer Architecture

Sherpa now has a clear three-layer model:

| Layer | What | Example | Status |
|-------|------|---------|--------|
| **Role Definition** | Behavioral contract — what kind of agent this is | `agents/content-writer.md` with disposition, quality-bar, fail-triggers | **EXISTS** (behavioral agent schema) |
| **Agent Instance** | Persistent entity — a specific agent with identity, state, assignments | `instances/content-writer-001.yaml` with id, owner, status, stats | **NEEDED** (this research) |
| **Task Execution** | Ephemeral session — one unit of work | `docs/tasks/write-blog-post.md` dispatched to instance | **EXISTS** (Planner/Worker/Judge) |

The role definition is the *class*. The agent instance is the *object*. The task execution is the *method call*.

### 2. The Overnight Workforce Pattern

For Sherpa Consulting's first workforces (content creation, video production):

**Evening:** Human owner reviews content calendar, creates/approves tasks, assigns to agent instances.
**Overnight:** Agent instances execute tasks autonomously (HAIF Tier 2 — produce output, human reviews before delivery). Each task creates a work log entry. Agents read their memory/context files at session start.
**Morning:** Human owner reviews all output via Studio dashboard. Approves, requests changes, or rejects. Quality scores update. `/morning` skill presents results.

This maps exactly to the YouTube case study pattern that's proven in production.

### 3. The Consulting Company Org Chart

For Sherpa Consulting specifically:

```
Rob (Human Owner / Agent Manager)
├── Content Production Team
│   ├── Sarah (content-writer-001) — Blog posts, articles
│   ├── Marcus (content-writer-002) — Technical documentation
│   └── Alex (seo-specialist-001) — SEO optimization, keyword research
├── Video Production Team
│   ├── Midnight (video-producer-001) — Script writing, production
│   └── Dusk (social-media-001) — Cross-platform promotion
└── Operations
    └── Judge (judge-001) — Quality gate for all output
```

Each agent instance references a behavioral role definition. The role provides the behavioral contract; the instance provides the persistent identity, configuration, and history.

### 4. Where This Lives in the Codebase

The agent instance model should be:
- **Filesystem-based** (YAML files, version-controlled, consistent with Sherpa philosophy)
- **Location:** `instances/` directory at project root (parallel to `agents/` for role definitions)
- **One file per instance** (`instances/<id>.yaml`)
- **Memory files** (when implemented): `instances/<id>/memory.md` — agent reads at session start, appends learnings
- **Validated** by a schema (Zod, like the behavioral agent schema)
- **Visualized** in Studio (roster view, performance dashboard, team assignments)

---

## Open Questions

1. **Should memory be a markdown file the agent reads/appends, or a structured database?** The YouTube case study validates filesystem-based memory files. Letta's OS-like tiered memory is more sophisticated but much more complex. For a consulting company with 5-10 agents, markdown memory files may be sufficient.

2. **How granular should cost tracking be?** Per-task (each task records its token cost)? Per-session? Per-day? Per-agent instance? The answer probably depends on whether this is for internal optimization or client billing.

3. **Should the autonomy tier be per-instance or per-task-type?** HAIF suggests per-task-type (code review at Tier 3, blog posts at Tier 2). But for simplicity, per-instance may be sufficient at first.

4. **How should agent-to-agent collaboration work?** When Sarah (content writer) needs SEO optimization from Alex, is that a task handoff (existing Planner/Worker/Judge), a shared memory space (Lindy Societies), or something else?

5. **What happens when an agent instance needs a role that doesn't exist in the catalog?** Does the human create a new behavioral role definition first, or can instances define ad hoc behavioral overrides?

6. **Should Sherpa integrate with Workday ASOR or Microsoft Agent 365?** The ASOR API is open (on GitHub). Providing a registration adapter would make Sherpa instances visible to enterprise agent management platforms. Is this premature for a consulting company?

7. **Where does the content calendar / editorial workflow live?** The agent instance model handles *who does the work*. But content creation also needs *what work to do* — a content calendar, editorial pipeline, approval workflow. Is that a separate initiative or part of this one?

8. **How should quality score aggregation work?** If Judge renders verdicts per-task, how does that roll up to instance-level quality scores? Simple average? Weighted by task complexity? Decay over time (recent work matters more)?

---

## Sources (Full URLs with Descriptions)

### AI Employee Platforms
- [11x.ai](https://www.11x.ai/) — Digital workers platform (Alice, Jordan, Mike)
- [11x multi-agent architecture (ZenML)](https://www.zenml.io/llmops-database/rebuilding-an-ai-sdr-agent-with-multi-agent-architecture-for-enterprise-sales-automation) — Technical architecture deep dive
- [11x TechCrunch funding](https://techcrunch.com/2024/09/16/ai-digital-employee-startup-11xai-raises-24m-led-by-benchmark/) — $24M funding round
- [Artisan.co](https://www.artisan.co/) — AI BDR platform (Ava, Aaron, Aria)
- [Artisan YC listing](https://www.ycombinator.com/companies/artisan) — Company profile
- [Artisan Wikipedia](https://en.wikipedia.org/wiki/Artisan_AI) — Overview and history
- [Artisan $25M Series A (TechCrunch)](https://techcrunch.com/2025/04/09/artisan-the-stop-hiring-humans-ai-agent-startup-raises-25m-and-is-still-hiring-humans/) — Funding
- [Lindy.ai](https://www.lindy.ai/) — AI assistant/employee platform
- [Lindy 3.0 announcement](https://www.lindy.ai/blog/lindy-3-0) — Agentic reasoning, Autopilot
- [Lindy AI employee guide](https://www.lindy.ai/blog/ai-employee) — Agent vs employee distinction
- [Cassidy AI](https://www.cassidyai.com/) — Enterprise AI agent platform
- [Cassidy agents page](https://www.cassidyai.com/agents) — Agent configuration model
- [Sintra.ai](https://sintra.ai/) — 12 specialized AI employees with Brain AI

### Enterprise Platforms
- [Workday ASOR product page](https://www.workday.com/en-us/artificial-intelligence/agent-system-of-record.html) — Agent System of Record
- [Workday ASOR GitHub](https://github.com/Workday/asor) — Open API specification (v1.2)
- [Workday ASOR GA announcement](https://blog.workday.com/en-us/managing-ai-powered-future-of-work.html) — General availability
- [Josh Bersin on Workday ASOR](https://joshbersin.com/2025/02/workday-makes-a-play-to-manage-your-ai-agents/) — Analyst deep dive
- [Microsoft Agent 365](https://www.microsoft.com/en-us/microsoft-agent-365) — Agent control plane ($15/user/month)
- [Microsoft Entra Agent ID](https://learn.microsoft.com/en-us/entra/agent-id/identity-platform/what-is-agent-id) — Agent identity infrastructure
- [Microsoft Agent Framework](https://learn.microsoft.com/en-us/agent-framework/overview/) — Semantic Kernel + AutoGen combined
- [Salesforce Agentforce lifecycle (Salesforce Ben)](https://www.salesforceben.com/agent-lifecycle-management-in-salesforce-governing-ai-from-idea-to-production/) — Lifecycle governance
- [Salesforce Agentforce Analytics (Trailhead)](https://trailhead.salesforce.com/content/learn/modules/agentforce-analytics-and-monitoring/check-on-your-agent-using-analytics) — Analytics and monitoring

### Framework Agent Schemas
- [CrewAI agent docs](https://docs.crewai.com/en/concepts/agents) — Complete attribute reference (25+ fields)
- [CrewAI YAML configuration](https://codesignal.com/learn/courses/getting-started-with-crewai-agents-and-tasks/lessons/configuring-crewai-agents-and-tasks-with-yaml-files) — YAML agent definition
- [Letta stateful agents](https://www.letta.com/blog/stateful-agents) — Three-layer memory architecture
- [Letta GitHub](https://github.com/letta-ai/letta) — Open-source stateful agent framework
- [OpenAI Swarm GitHub](https://github.com/openai/swarm) — Lightweight multi-agent orchestration (now replaced by Agents SDK)

### Organizational Modeling
- [Gartner 2025 predictions](https://www.gartner.com/en/newsroom/press-releases/2024-10-22-gartner-unveils-top-predictions-for-it-organizations-and-users-in-2025-and-beyond) — 20% of orgs flatten structure via AI
- [Gartner 2026 strategic predictions](https://www.gartner.com/en/articles/strategic-predictions-for-2026) — AI agent enterprise trends
- [Gartner 40% agent integration by 2026](https://www.gartner.com/en/newsroom/press-releases/2025-08-26-gartner-predicts-40-percent-of-enterprise-apps-will-feature-task-specific-ai-agents-by-2026-up-from-less-than-5-percent-in-2025) — Enterprise adoption
- [Josh Bersin Superworker report](https://joshbersin.com/superworker/) — Superworker organization framework
- [Josh Bersin 2026 Imperatives](https://joshbersin.com/imperatives/) — HR transformation roadmap
- [HBR Agent Managers](https://hbr.org/2026/02/to-thrive-in-the-ai-era-companies-need-agent-managers) — Agent management as organizational function
- [SHRM Org Chart of the Future](https://www.shrm.org/labs/resources/the-org-chart-of-the-future--managing-a-workforce-of-humans-and-ai-agents) — AI agents on org charts
- [Gloat AI workforce trends 2026](https://gloat.com/blog/ai-workforce-trends/) — Hybrid intelligence teams

### Agent Lifecycle & Governance
- [Saviynt AI agent lifecycle](https://saviynt.com/blog/ai-agent-lifecycle-management) — Six-stage lifecycle (registration to retirement)
- [DataRobot IT is the new HR](https://www.datarobot.com/blog/it-new-hr-ai-agents/) — Managing agents as workforce
- [NIST AI RMF](https://www.nist.gov/itl/ai-risk-management-framework) — Risk management framework
- [NIST AI RMF 2025 updates](https://www.ispartnersllc.com/blog/nist-ai-rmf-2025-updates-what-you-need-to-know-about-the-latest-framework-changes/) — Governance updates
- [Versioning & rollbacks](https://www.auxiliobits.com/blog/versioning-and-rollbacks-in-agent-deployments/) — Four-layer versioning model
- [CIO versioning challenge](https://www.cio.com/article/4056453/why-versioning-ai-agents-is-the-cios-next-big-challenge.html) — Enterprise versioning issues

### Academic Frameworks
- [HAIF paper (arxiv)](https://arxiv.org/html/2602.07641) — Human-AI Integration Framework (full text)
- [HAIF abstract](https://www.arxiv.org/abs/2602.07641) — Paper metadata
- [Complementarity in human-AI collaboration (Tandfonline)](https://www.tandfonline.com/doi/full/10.1080/0960085X.2025.2475962) — Evidence for complementary teaming
- [Human-AI teaming review (arxiv)](https://arxiv.org/pdf/2504.05755) — Comprehensive literature review
- [Human-AI teaming scoping review (Frontiers)](https://www.frontiersin.org/journals/artificial-intelligence/articles/10.3389/frai.2023.1250725/full) — Definitions and taxonomy

### Agent Memory & State
- [Redis AI agent memory architecture](https://redis.io/blog/ai-agent-memory-stateful-systems/) — Four-stage memory architecture, storage patterns
- [Fast.io agent state checkpointing](https://fast.io/resources/ai-agent-state-checkpointing/) — Checkpoint schema best practices
- [Agent memory persistence (The New Stack)](https://thenewstack.io/how-to-add-persistence-and-long-term-memory-to-ai-agents/) — Implementation patterns

### Performance & Cost
- [Teneo.ai cost analysis](https://www.teneo.ai/blog/ai-vs-live-agent-cost-the-complete-2025-analysis-and-comparison-2) — AI vs human cost comparison
- [AIMultiple AI agent performance](https://aimultiple.com/ai-agent-performance) — Success rates and ROI data
- [Multimodal AI KPIs](https://www.multimodal.dev/post/ai-kpis) — 34 AI performance metrics
- [Sparkout AI agent pricing](https://www.sparkouttech.com/development-cost-of-ai-agent/) — Development and operational costs
- [NovaEdge enterprise implementation](https://www.novaedgedigitallabs.tech/Blog/ai-agents-enterprise-2026-complete-guide) — Budget allocation guidance

### Content Production Case Studies
- [AI agents running YouTube channel (DEV.to)](https://dev.to/wcamon/i-let-ai-agents-run-my-youtube-channel-for-6-weeks-heres-what-actually-happened-21b1) — 6-week case study with Claude-based agents
- [YouTube AI policy & content trends](https://sybrid.com/resources/blog/ai-generated-content-youtube-2025/) — YouTube policy on AI content
- [AI content creation tools 2025 (Lummi)](https://www.lummi.ai/blog/best-ai-powered-content-creation-tools-in-2025) — Tool landscape

### Project Management AI Integration
- [Monday.com AI report 2026](https://monday.com/blog/project-management/ai-report/) — Digital Workforce and AI Blocks
- [Notion AI review](https://max-productive.ai/ai-tools/notion-ai/) — AI agents in workspace
- [Fellow.ai AI PM tools](https://fellow.ai/blog/ai-project-management-tools/) — Top AI project management tools comparison

---

## Raw Links (Every URL Encountered)

```
https://www.11x.ai/
https://www.zenml.io/llmops-database/rebuilding-an-ai-sdr-agent-with-multi-agent-architecture-for-enterprise-sales-automation
https://techcrunch.com/2024/09/16/ai-digital-employee-startup-11xai-raises-24m-led-by-benchmark/
https://www.artisan.co/
https://www.ycombinator.com/companies/artisan
https://en.wikipedia.org/wiki/Artisan_AI
https://techcrunch.com/2025/04/09/artisan-the-stop-hiring-humans-ai-agent-startup-raises-25m-and-is-still-hiring-humans/
https://www.lindy.ai/
https://www.lindy.ai/blog/lindy-3-0
https://www.lindy.ai/blog/ai-employee
https://www.lindy.ai/blog/ai-agent-architecture
https://www.cassidyai.com/
https://www.cassidyai.com/agents
https://www.cassidyai.com/workflows
https://sintra.ai/
https://www.workday.com/en-us/artificial-intelligence/agent-system-of-record.html
https://github.com/Workday/asor
https://blog.workday.com/en-us/managing-ai-powered-future-of-work.html
https://joshbersin.com/2025/02/workday-makes-a-play-to-manage-your-ai-agents/
https://techcrunch.com/2025/02/11/workday-launches-a-platform-for-enterprises-to-manage-all-of-their-ai-agents-in-one-place/
https://www.microsoft.com/en-us/microsoft-agent-365
https://learn.microsoft.com/en-us/entra/agent-id/identity-platform/what-is-agent-id
https://techcommunity.microsoft.com/blog/microsoft-entra-blog/announcing-microsoft-entra-agent-id-secure-and-manage-your-ai-agents/3827392
https://www.microsoft.com/en-us/microsoft-365/blog/2025/11/18/microsoft-agent-365-the-control-plane-for-ai-agents/
https://learn.microsoft.com/en-us/agent-framework/overview/
https://deepwiki.com/microsoft/agent-framework/3.4.1-agent-threads-and-state
https://www.salesforceben.com/agent-lifecycle-management-in-salesforce-governing-ai-from-idea-to-production/
https://trailhead.salesforce.com/content/learn/modules/agentforce-analytics-and-monitoring/check-on-your-agent-using-analytics
https://docs.crewai.com/en/concepts/agents
https://codesignal.com/learn/courses/getting-started-with-crewai-agents-and-tasks/lessons/configuring-crewai-agents-and-tasks-with-yaml-files
https://www.letta.com/blog/stateful-agents
https://github.com/letta-ai/letta
https://github.com/openai/swarm
https://www.gartner.com/en/newsroom/press-releases/2024-10-22-gartner-unveils-top-predictions-for-it-organizations-and-users-in-2025-and-beyond
https://www.gartner.com/en/articles/strategic-predictions-for-2026
https://www.gartner.com/en/newsroom/press-releases/2025-08-26-gartner-predicts-40-percent-of-enterprise-apps-will-feature-task-specific-ai-agents-by-2026-up-from-less-than-5-percent-in-2025
https://joshbersin.com/superworker/
https://joshbersin.com/imperatives/
https://hrexecutive.com/the-superworker-org-why-hr-must-redesign-work-not-just-adopt-ai/
https://hbr.org/2026/02/to-thrive-in-the-ai-era-companies-need-agent-managers
https://www.shrm.org/labs/resources/the-org-chart-of-the-future--managing-a-workforce-of-humans-and-ai-agents
https://gloat.com/blog/ai-workforce-trends/
https://gloat.com/blog/ai-workforce-trends-for-c-suite/
https://saviynt.com/blog/ai-agent-lifecycle-management
https://www.datarobot.com/blog/it-new-hr-ai-agents/
https://www.nist.gov/itl/ai-risk-management-framework
https://www.ispartnersllc.com/blog/nist-ai-rmf-2025-updates-what-you-need-to-know-about-the-latest-framework-changes/
https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.600-1.pdf
https://www.auxiliobits.com/blog/versioning-and-rollbacks-in-agent-deployments/
https://www.cio.com/article/4056453/why-versioning-ai-agents-is-the-cios-next-big-challenge.html
https://arxiv.org/html/2602.07641
https://www.arxiv.org/abs/2602.07641
https://www.tandfonline.com/doi/full/10.1080/0960085X.2025.2475962
https://arxiv.org/pdf/2504.05755
https://www.frontiersin.org/journals/artificial-intelligence/articles/10.3389/frai.2023.1250725/full
https://redis.io/blog/ai-agent-memory-stateful-systems/
https://fast.io/resources/ai-agent-state-checkpointing/
https://thenewstack.io/how-to-add-persistence-and-long-term-memory-to-ai-agents/
https://www.teneo.ai/blog/ai-vs-live-agent-cost-the-complete-2025-analysis-and-comparison-2
https://aimultiple.com/ai-agent-performance
https://www.multimodal.dev/post/ai-kpis
https://www.sparkouttech.com/development-cost-of-ai-agent/
https://www.novaedgedigitallabs.tech/Blog/ai-agents-enterprise-2026-complete-guide
https://dev.to/wcamon/i-let-ai-agents-run-my-youtube-channel-for-6-weeks-heres-what-actually-happened-21b1
https://sybrid.com/resources/blog/ai-generated-content-youtube-2025/
https://www.lummi.ai/blog/best-ai-powered-content-creation-tools-in-2025
https://monday.com/blog/project-management/ai-report/
https://max-productive.ai/ai-tools/notion-ai/
https://fellow.ai/blog/ai-project-management-tools/
https://www.workday.com/content/dam/web/en-us/documents/datasheets/asor-datasheet-enus.pdf
https://windowsforum.com/threads/workday-and-microsoft-align-to-govern-enterprise-ai-agents-asor-entra.381064/
https://www.oreateai.com/blog/11xai-building-the-future-of-work-with-ai-digital-employees/
https://aimresearch.co/market-industry/why-11x-believes-autonomous-digital-workers-are-the-future-of-work
https://www.todayin-ai.com/p/11x
https://reply.io/blog/11x-ai-review/
https://www.11x.ai/worker/alice
https://tech.eu/2024/12/20/az16-backed-11x-set-to-launch-up-to-20-ai-sales-workers-in-2025-as-hunts-killer-engineering-teams/
https://www.artisan.co/ai-sales-agent
https://medium.com/@LakshmiNarayana_U/lindy-ai-your-ai-employee-in-the-making-4a2b2512ed9c
https://rimo.app/en/blogs/lindy-ai-review_en-US
https://www.nocode.mba/articles/lindy-ai-review
https://relevanceai.com/docs/get-started/key-concepts/agent
https://relevanceai.com/
https://www.gumloop.com/blog/lindy-ai-alternatives
https://www.salesforce.com/agentforce/guide/
https://www.salesforceben.com/how-does-salesforces-agentforce-work/
https://developer.salesforce.com/docs/ai/agentforce/guide/supported-models.html
https://www.servicenow.com/platform/autonomous-workforce.html
https://newsroom.servicenow.com/press-releases/details/2026/ServiceNow-launches-Autonomous-Workforce-that-thinks-and-acts-adds-Moveworks-to-the-ServiceNow-AI-Platform/default.aspx
https://openai.com/index/introducing-openai-frontier/
https://www.datarobot.com/
https://www.datarobot.com/newsroom/press/datarobot-announces-agent-workforce-platform-built-with-nvidia/
https://crewai.com/amp
https://blog.crewai.com/crewai-amp-the-agent-management-platform/
https://beam.ai/
https://techcrunch.com/2026/02/19/reload-an-ai-employee-agent-management-platform-raises-2-275m-and-launches-an-ai-employee/
https://www.okta.com/solutions/secure-ai/
https://www.strata.io/blog/agentic-identity/the-ai-agent-identity-crisis-new-research-reveals-a-governance-gap/
https://www.gravitee.io/platform/ai-agent-management
https://dust.tt/
https://dust.tt/blog/agent-memory-building-persistence-into-ai-collaboration
https://www.agentops.ai/
https://openid.net/wp-content/uploads/2025/10/Identity-Management-for-Agentic-AI.pdf
https://github.blog/news-insights/company-news/welcome-home-agents/
https://medium.com/@Micheal-Lanham/210-000-github-stars-in-10-days-what-openclaws-architecture-teaches-us-about-building-personal-ai-dae040fab58f
https://dev.to/thenexusguard/i-found-9-agent-identity-projects-on-github-only-2-have-real-users-3aed
https://www.ey.com/en_in/insights/ai/agentic-ai-india/designing-an-ai-first-workforce-for-the-modern-enterprise
https://www.weforum.org/stories/2026/01/ai-roadmap-transforming/
https://www.weforum.org/stories/2026/02/workforce-transformation-ai-jobs/
https://www.hrdconnect.com/2025/12/09/ai-predictions-in-hr-2026/
https://pmc.ncbi.nlm.nih.gov/articles/PMC10570436/
https://dl.acm.org/doi/10.1145/3514257
https://www.frontiersin.org/journals/artificial-intelligence/articles/10.3389/frai.2023.1252897/full
https://www.tandfonline.com/doi/full/10.1080/1359432X.2023.2200172
https://www.worklytics.co/resources/ai-usage-performance-reviews-best-practices-fall-2025
https://sendbird.com/blog/ai-metrics-guide
https://skima.ai/blog/how-to-guides/employee-performance-metrics
https://nebius.com/blog/posts/ai-model-performance-metrics
https://neontri.com/blog/measure-ai-performance/
https://www.techclass.com/resources/learning-and-development-articles/ai-and-new-metrics-of-work-what-should-we-measure-now
https://axify.io/blog/ai-performance-metrics
https://research.aimultiple.com/how-to-measure-ai-performance/
https://www.automationanywhere.com/company/blog/automation-ai/hire-retire-how-ai-agents-hr-drive-end-end-efficiency
https://www.moveworks.com/us/en/resources/blog/ai-agents-for-onboarding
https://blog.workday.com/en-us/ai-agents-for-hr-top-use-cases-and-examples.html
https://www.aihr.com/blog/ai-onboarding/
https://www.iterate.ai/ai-glossary/agent-lifecycle-management
https://www.teneo.ai/learning-hub/call-center-glossary/ai-agent-lifecycle-management
https://www.salesforce.com/platform/agent-lifecycle-management/
https://www.stack-ai.com/blog/the-agentic-development-life-cycle-how-to-manage-ai-agents-at-scale
https://www.supervity.ai/blogs/the-age-of-ai-agents-has-begun-but-are-you-managing-them-right
https://www.xenonstack.com/blog/agentops-ai
https://www.parloa.com/blog/ai-agent-lifecycle-customer-service/
https://onereach.ai/blog/agent-lifecycle-management-stages-governance-roi/
https://www.algomox.com/resources/blog/stateful_vs_stateless_it_agents/
https://mbrenndoerfer.com/writing/understanding-the-agents-state
https://medium.com/@aktooall/building-an-agent-architecture-how-sessions-state-events-context-and-runner-work-together-d8dbdb64d52b
https://www.databricks.com/blog/types-ai-agents-definitions-roles-and-examples
https://arxiv.org/html/2509.02121v1
https://medium.com/quantumblack/agentic-workflows-for-software-development-dc8e64f4a79d
https://www.anthropic.com/research/measuring-agent-autonomy
https://github.blog/ai-and-ml/automate-repository-tasks-with-github-agentic-workflows/
https://abit.ee/en/artificial-intelligence/autoresearch-karpathy-ai-scientific-experiments-autonomous-ml-agent-machine-learning-andrej-karpathy-en
https://www.startuphub.ai/ai-news/artificial-intelligence/2026/ai-agents-now-do-overnight-research
https://www.prnewswire.com/news-releases/in-2026-ai-powered-superagents-will-radically-change-hr-driving-the-largest-hr-transformation-in-decades-302666677.html
https://hrmasia.com/from-co-pilots-to-superagents-hrs-2026-shift/
https://eightfold.ai/blog/ai-josh-bersin-rise-superworker/
https://hrmasia.com/the-superworker-organisation-why-hr-must-redesign-work-not-just-adopt-ai/
https://aiqlabs.ai/blog/how-much-does-an-ai-agent-cost-per-hour-in-2025
https://www.cio.com/article/4099548/how-to-get-ai-agent-budgets-right-in-2026.html
https://fulminoussoftware.com/ai-agent-development-cost
https://www.azilen.com/blog/ai-agent-development-cost/
https://www.plivo.com/blog/ai-agents-top-statistics/
https://www.digitalocean.com/community/tutorials/build-ai-agents-the-right-way
https://learn.microsoft.com/en-us/azure/architecture/ai-ml/guide/ai-agent-design-patterns
https://docs.databricks.com/aws/en/generative-ai/agent-framework/stateful-agents
https://medium.com/@nraman.n6/versioning-rollback-lifecycle-management-of-ai-agents-treating-intelligence-as-deployable-deac757e4dea
https://fast.io/agents.md
https://fast.io/.well-known/agents.json
https://www.katalist.ai/post/7-ai-youtube-automation-niches-to-start-in-2025
https://www.ampcome.com/post/how-to-use-an-ai-agent-for-youtube-automation
https://www.mindstudio.ai/blog/ai-agents-for-content-creators/
https://shotstack.io/learn/best-ai-tools-for-youtube-automation/
https://clippie.ai/blog/ai-video-creation-trends-2025-2026
https://www.entrepreneur.com/science-technology/5-ways-ai-is-reshaping-youtube-content-and-how-you-can/498753
https://www.eesel.ai/blog/youtube-ai
https://visualstudiomagazine.com/articles/2025/10/01/semantic-kernel-autogen--open-source-microsoft-agent-framework.aspx
https://newsletter.victordibia.com/p/microsoft-agent-framework-semantic
https://devblogs.microsoft.com/semantic-kernel/migrate-your-semantic-kernel-and-autogen-projects-to-microsoft-agent-framework-release-candidate/
https://galileo.ai/blog/openai-swarm-framework-multi-agents
https://cookbook.openai.com/examples/orchestrating_agents
https://www.ai-bites.net/swarm-from-openai-routines-handoffs-and-agents-explained-with-code/
https://arize.com/blog/swarm-openai-experimental-approach-to-multi-agent-systems/
https://www.digitalapplied.com/blog/ai-content-production-agency-output-solo-margins-guide
https://dev.to/setas/i-run-a-solo-company-with-ai-agent-departments-50nf
https://ai.danielbilsborough.com/blog/ai-agent-operating-system
https://www.nicksaraev.com/
https://www.lennysnewsletter.com/p/we-replaced-our-sales-team-with-20-ai-agents
https://github.com/msitarzewski/agency-agents
https://orbilontech.com/ai-automation-1b-one-person-company/
https://www.biztechreports.com/news-archive/2026/3/11/perforce-cto-anjali-arora-says-ai-transformation-demands-new-data-strategy-and-workforce-model-cio-100-leadership-live-atlanta
```
