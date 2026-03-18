---
doc-type: research
maintained-by: self-documenting-system
authored-by: ai
reviewed-by: null
last-updated: 2026-03-17
last-verified: 2026-03-17
source-initiatives:
  - agentic-runtime-platforms
---

> **AI-generated** 2026-03-17 · Awaiting human review
> Sources: agentic-runtime-platforms

# OpenClaw Platform Analysis: Skills, ContextEngine, Behavioral Injection, and External Task APIs

Research questions: How are OpenClaw skills defined and configured? What is the ContextEngine plugin API from the 2026.3.7 update? Can behavioral constraints be injected from an external orchestration system? What API does OpenClaw expose for external task submission and agent management?

---

## Key Discoveries

### 1. Skills are markdown files with YAML frontmatter — no SDK, no compilation

A skill is a directory containing a `SKILL.md` file. The YAML frontmatter declares metadata; the markdown body contains behavioral instructions that get injected into the agent's system prompt. ([docs.openclaw.ai/tools/skills](https://docs.openclaw.ai/tools/skills))

**Required frontmatter fields:**
```yaml
name: <string>
description: <string>
```

**Optional frontmatter fields:**
```yaml
homepage: <URL>
user-invocable: <true|false>           # default: true
disable-model-invocation: <true|false> # default: false
command-dispatch: tool
command-tool: <tool name>
command-arg-mode: raw
metadata: <single-line JSON object>
```

The `metadata` field carries a single-line JSON object for dependency gating, OS filtering, and install commands:
```json
{"openclaw":{"emoji":"...","requires":{"bins":["bash","date"],"env":["API_KEY"],"config":["path.to.setting"]},"os":["darwin","linux"],"install":[{"id":"brew","formula":"pkg","bins":["binary"]}]}}
```

**Skill loading precedence** (highest to lowest):
1. `<workspace>/skills` — workspace-local
2. `~/.openclaw/skills` — user-global
3. Bundled skills — shipped with install
4. `skills.load.extraDirs` — additional configured paths

Skills that fail dependency checks (`requires.bins`, `requires.env`, `requires.config`, OS mismatch) are silently excluded. Skills with no `metadata.openclaw` block are always eligible. ([docs.openclaw.ai/tools/skills](https://docs.openclaw.ai/tools/skills))

**Behavioral constraints live in the markdown body** as imperative instructions. The body is free-form markdown — no required sections. Effective patterns observed in community skills include Workflow steps, Guardrails sections ("Never fabricate PR numbers"), Output format specifications, Failure handling rules, and Scope boundaries ("Stop after scanning 7 days"). ([lumadock.com/tutorials/build-custom-openclaw-skills](https://lumadock.com/tutorials/build-custom-openclaw-skills))

**Skills are injected into the system prompt** as a compact XML list via `formatSkillsForPrompt`. The prompt tells the model to use `read` to load the full `SKILL.md` when it needs the detailed instructions. Every eligible skill adds text to the system prompt every turn. ([docs.openclaw.ai/tools/skills](https://docs.openclaw.ai/tools/skills))

**Community scale:** ClawHub (the public registry) hosts 13,729+ skills with vector-powered search, semver versioning, and community review. ([docs.openclaw.ai/tools/clawhub](https://docs.openclaw.ai/tools/clawhub))

### 2. The ContextEngine plugin API (2026.3.7) provides 7 lifecycle hooks with slot-based exclusivity

The v2026.3.7 release ([github.com/openclaw/openclaw/releases/tag/v2026.3.7](https://github.com/openclaw/openclaw/releases/tag/v2026.3.7)) introduced a pluggable ContextEngine with full lifecycle hooks, a slot-based registry, and config-driven resolution. A `LegacyContextEngine` wrapper preserves existing behavior when no custom engine is configured — zero behavioral change for existing users.

**Seven lifecycle hooks:**

| Hook | Trigger | Purpose |
|------|---------|---------|
| `bootstrap` | Engine initialization | Load persisted state, establish connections |
| `ingest` / `ingestBatch` | New message arrives | Preprocess, classify, flag importance |
| `assemble` | Before prompt assembly | Decide what goes into the final prompt; returns `AssembleResult` |
| `compact` | Token limit approaching | Compress or summarize older conversations; returns `CompactResult` |
| `afterTurn` | After each conversation turn | Post-processing, update stats, clean temp data |
| `prepareSubagentSpawn` | Before subagent launch | Prepare isolated context scope |
| `onSubagentEnded` | After subagent completes | Collect output, merge back into main context |

([PR #22201](https://github.com/openclaw/openclaw/pull/22201), [shareuhack.com guide](https://www.shareuhack.com/en/posts/openclaw-v2026-3-7-contextengine-guide))

**Plugin registration via SDK:**
```typescript
api.registerContextEngine("my-engine", () => ({
  info: { id: "my-engine", name: "My Engine", ownsCompaction: true },
  async ingest() { return { ingested: true }; },
  async assemble({ messages }) { return { messages, estimatedTokens: 0 }; },
  async compact() { return { ok: true, compacted: false }; },
}));
```

**Config-driven slot selection** in `openclaw.json`:
```json5
{
  plugins: {
    slots: {
      contextEngine: "my-engine"  // defaults to "legacy"
    }
  }
}
```

Only one context engine plugin is active at a time (exclusive slot). The `LegacyContextEngine` wraps existing `compactEmbeddedPiSessionDirect` logic. Subagent isolation uses `AsyncLocalStorage` to scope plugin context engines per gateway request. ([PR #22201](https://github.com/openclaw/openclaw/pull/22201))

**Relevance to Sherpa:** A Sherpa ContextEngine plugin could intercept `assemble` to inject governance metadata, or use `prepareSubagentSpawn` to propagate behavioral constraints to delegated workers. However, owning the context engine slot means replacing (not augmenting) the default compaction — a heavy commitment.

### 3. Behavioral constraints CAN be injected from an external system via three complementary mechanisms

**Mechanism A: `before_prompt_build` hook (plugin-based, per-turn)**

Plugins register a `before_prompt_build` hook that fires after session load. It can return `prependSystemContext` and `appendSystemContext` fields that modify the system prompt without touching conversation history:

```typescript
api.on("before_prompt_build", (event, ctx) => {
  return {
    prependSystemContext: "Company style guide content",
    appendSystemContext: "Final system instructions",
  };
}, { priority: 10 });
```

This is the primary mechanism for runtime behavioral injection. Operators can disable it per-plugin via `plugins.entries.<id>.hooks.allowPromptInjection: false`. ([docs.openclaw.ai/tools/plugin](https://docs.openclaw.ai/tools/plugin))

**Mechanism B: Sticky-context plugin pattern (file-based, compaction-proof)**

The community `openclaw-sticky-context` plugin demonstrates persistent behavioral slot injection. It stores constraints in `sticky-context.json` with priority-ordered slots:

```json
{
  "key": "safety-rules",
  "content": "Never delete files without confirmation.",
  "priority": 100,
  "pinned": true
}
```

Each turn, the plugin reads the file and injects all slots via `appendSystemContext`. Because system prompt content is rebuilt from disk each turn (never part of conversation history), constraints survive compaction. Pinned slots cannot be deleted by the agent — a one-way ratchet. ([github.com/jamebobob/openclaw-sticky-context](https://github.com/jamebobob/openclaw-sticky-context))

**This is the closest analog to Sherpa's behavioral role definitions.** An external orchestrator could write constraints to `sticky-context.json` and they would be enforced on every turn, surviving compaction, with the agent unable to remove pinned entries.

**Mechanism C: Workspace file manipulation (AGENTS.md, SOUL.md)**

Agent behavior is primarily governed by workspace files:
- `SOUL.md` — personality, identity, boundaries
- `AGENTS.md` — operational rules, security constraints, tool policies
- `USER.md` — user context, preferences

These are plain markdown files on disk. An external system can write them directly — no API needed. On each turn, OpenClaw re-reads workspace files and injects them into the system prompt under "Project Context." Bootstrap file injection is controlled by `agents.defaults.bootstrapMaxChars` (default: 20,000 per file) and `agents.defaults.bootstrapTotalMaxChars` (default: 150,000 aggregate). ([docs.openclaw.ai/concepts/system-prompt](https://docs.openclaw.ai/concepts/system-prompt), [docs.openclaw.ai/concepts/agent-workspace](https://docs.openclaw.ai/concepts/agent-workspace))

**Constraint expression patterns** observed in OpenClaw's own AGENTS.md:
- Imperative directives: "Never merge a bug-fix PR based only on issue text..."
- Trust-model framing: "Before triage/severity decisions, read SECURITY.md..."
- Preference hierarchies: "Prefer [pattern A] over [pattern B]; use [pattern C] only when..."
- Hard gates: "Do not edit files covered by security-focused CODEOWNERS rules..."

These map directly to Sherpa's behavioral engineering patterns (`disposition`, `quality-bar`, explicit fail triggers).

### 4. External task submission uses three HTTP surfaces, each with trade-offs

**Surface A: Webhook endpoint (`POST /hooks/agent`) — best for Sherpa integration**

Purpose-built for external task triggers. Runs isolated agent turns with optional delivery to chat channels:

```bash
curl -X POST http://127.0.0.1:18789/hooks/agent \
  -H 'Authorization: Bearer SECRET' \
  -H 'Content-Type: application/json' \
  -d '{
    "message": "Run this task",
    "agentId": "worker-agent",
    "sessionKey": "hook:sherpa:task-123",
    "model": "anthropic/claude-sonnet-4-5",
    "thinking": "low",
    "timeoutSeconds": 300,
    "deliver": true,
    "channel": "last"
  }'
```

Configuration:
```json5
{
  hooks: {
    enabled: true,
    token: "shared-secret",
    path: "/hooks",
    allowedAgentIds: ["worker", "researcher", "main"],
    allowRequestSessionKey: true,
    allowedSessionKeyPrefixes: ["hook:sherpa:"]
  }
}
```

Custom routing via `hooks.mappings` can transform arbitrary payloads into agent runs using JavaScript/TypeScript transform modules. ([openclawlab.com/en/docs/automation/webhook/](https://openclawlab.com/en/docs/automation/webhook/))

**Surface B: OpenAI-compatible Chat Completions (`POST /v1/chat/completions`)**

Standard OpenAI format with agent targeting:
```json
{
  "model": "openclaw:worker-agent",
  "messages": [{"role": "user", "content": "Execute task..."}],
  "stream": true
}
```

Agent selection via `model` field encoding (`openclaw:<agentId>` or `agent:<agentId>`) or `x-openclaw-agent-id` header. Session persistence via `user` field or `x-openclaw-session-key` header. This is operator-access level — not scoped per-user. ([docs.openclaw.ai/gateway/openai-http-api](https://docs.openclaw.ai/gateway/openai-http-api))

**Surface C: Tools Invoke API (`POST /tools/invoke`)**

Direct tool invocation bypassing the LLM:
```bash
curl -sS http://127.0.0.1:18789/tools/invoke \
  -H 'Authorization: Bearer TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{"tool": "sessions_list", "action": "json", "args": {}}'
```

`sessions_spawn` is on the hard deny list by default but can be allow-listed via `gateway.tools.allow`. Session management endpoints (reset, compact, status) were partially implemented in PR #23941. ([openclawlab.com/en/docs/gateway/tools-invoke-http-api/](https://openclawlab.com/en/docs/gateway/tools-invoke-http-api/))

**Surface D: OpenClaw Mission Control (third-party orchestration layer)**

A community project providing "AI Agent Orchestration Dashboard" with organizations, boards, tasks, tags, and approval-driven governance over OpenClaw Gateway. API-first but endpoint documentation is sparse. ([github.com/abhi1693/openclaw-mission-control](https://github.com/abhi1693/openclaw-mission-control))

### 5. Multi-agent configuration is file-based with per-agent behavioral isolation

Each agent in `agents.list` gets its own workspace directory, session store, auth profiles, model override, tool allow/deny lists, and sandbox mode:

```json5
{
  agents: {
    list: [
      {
        id: "worker",
        workspace: "~/.openclaw/workspace-worker",
        model: "anthropic/claude-sonnet-4-5",
        tools: { allow: ["exec", "read"], deny: ["browser"] },
        sandbox: { mode: "all", scope: "agent" }
      }
    ]
  }
}
```

Agent creation is CLI-based (`openclaw agents add <id>`) or manual file editing — no REST API for agent lifecycle management. Workspace files (`SOUL.md`, `AGENTS.md`) are per-agent, enabling distinct behavioral profiles. ([docs.openclaw.ai/concepts/multi-agent](https://docs.openclaw.ai/concepts/multi-agent))

### 6. Sub-agents provide delegated execution with behavioral inheritance controls

The `sessions_spawn` tool creates background agent runs with configurable model, tool access, and timeout:

```json
{
  "tool": "sessions_spawn",
  "params": {
    "task": "Research competitor pricing",
    "agentId": "researcher",
    "model": "claude-3-5-haiku",
    "runTimeoutSeconds": 300,
    "cleanup": "keep"
  }
}
```

Sub-agents receive limited context: only `AGENTS.md` and `TOOLS.md` are injected (not `SOUL.md`, `IDENTITY.md`, `USER.md`). Tool access defaults to all tools except session/system tools, configurable via `tools.subagents.tools.deny`. Max nesting depth: 5 levels. Concurrency controlled via `agents.defaults.subagents.maxConcurrent` (default: 8). ([docs.openclaw.ai/tools/subagents](https://docs.openclaw.ai/tools/subagents))

Key limitation: `sessions_spawn` is only available as an in-session tool call. There is no way to spawn parallel sub-agents from outside an LLM session — any workflow needing programmatic parallel work must route through an LLM session as a "tool-call proxy." ([github.com/openclaw/openclaw/issues/15342](https://github.com/openclaw/openclaw/issues/15342))

---

## Implications for Sherpa's Runtime Adapter Design

### Skill translation is structurally feasible

Sherpa's behavioral role definitions (disposition, quality-bar, fail triggers) map cleanly to OpenClaw's skill format. A Sherpa-to-OpenClaw adapter would:

1. **Generate `SKILL.md` files** from Sherpa role YAML — translate `disposition` to Guardrails section, `quality-bar` to Output format section, fail triggers to explicit prohibitions.
2. **Generate `AGENTS.md` content** from Sherpa governance conventions — operational rules, tool policies, review requirements.
3. **Write workspace files to disk** — no API needed; OpenClaw re-reads on each turn.
4. **Use the sticky-context pattern** for runtime behavioral constraints that must survive compaction — the pinned slot mechanism maps to Sherpa's non-negotiable constraints.

### Task dispatch maps to the webhook surface

Sherpa's `dispatch.sh` / `worker.sh` pipeline could target OpenClaw via `POST /hooks/agent`:

| Sherpa concept | OpenClaw mapping |
|----------------|-----------------|
| Task slug | `sessionKey: "hook:sherpa:<task-slug>"` |
| Role assignment | `agentId` targeting a pre-configured agent |
| Task description | `message` field |
| Backend selection | `model` override per request |
| Timeout | `timeoutSeconds` parameter |

### The ContextEngine slot is too heavy for a governance adapter

Owning the `contextEngine` slot means replacing compaction — Sherpa's concern is governance injection, not context management. The `before_prompt_build` hook or sticky-context pattern is the right abstraction level: inject behavioral constraints without owning the context lifecycle.

### Agent lifecycle management requires file-system access

OpenClaw has no REST API for creating agents, updating workspace files, or modifying `openclaw.json`. An adapter must either:
- Have filesystem access to the OpenClaw host (write workspace files, edit config)
- Use a sidecar/init-container pattern in Docker deployments to pre-configure agents
- Write a thin management plugin that exposes agent CRUD as tools or HTTP routes

### The prompt injection surface is a governance concern

OpenClaw's system prompt is advisory — constraints expressed in `AGENTS.md` or `SOUL.md` can be overridden by sufficiently creative prompts. The `allowPromptInjection` policy and pinned sticky-context slots provide some enforcement, but there is no true sandbox for behavioral rules. Security researchers have demonstrated persistent prompt injection via workspace file manipulation. ([thehackernews.com](https://thehackernews.com/2026/03/openclaw-ai-agent-flaws-could-enable.html), [penligent.ai](https://www.penligent.ai/hackinglabs/the-openclaw-prompt-injection-problem-persistence-tool-hijack-and-the-security-boundary-that-doesnt-exist/))

---

## Open Questions

1. **Sticky-context vs. AGENTS.md for Sherpa constraints** — Which injection point gives better control? Sticky-context survives compaction and supports pinning, but AGENTS.md is the canonical behavioral authority. Could both be used (AGENTS.md for base role, sticky-context for per-task constraints)?

2. **Result collection from webhook-triggered runs** — The `/hooks/agent` endpoint triggers a run but the response mechanism is the "announce" system (delivers to chat channels). How does an external orchestrator collect structured task results? Is polling `sessions_history` the only option?

3. **Agent hot-reconfiguration** — Writing new `AGENTS.md` content takes effect on the next turn, but does it require a gateway restart? The docs say config changes require restart, but workspace file changes appear to be hot-reloaded.

4. **Sub-agent spawning from external API** — Currently `sessions_spawn` is in-session only. The feature request for `POST /api/sessions/spawn` ([issue #15342](https://github.com/openclaw/openclaw/issues/15342)) is open. Would Sherpa's Planner/Worker pattern require this, or can the webhook surface serve as the external dispatch entry point?

5. **ContextEngine plugin interplay with behavioral injection** — If a third-party ContextEngine plugin (like lossless-claw) is active, does it interfere with `before_prompt_build` hook injection? Are the two mechanisms independent?

6. **OpenClaw Mission Control as governance layer** — Does Mission Control's approval-driven governance overlap with or complement Sherpa's initiative lifecycle? Could Sherpa serve as the governance engine behind Mission Control's UI?

7. **Sherpa config-as-code translation fidelity** — How much of `sherpa.config.ts` (vocabulary, theming, dispatch routing, behavioral defaults) can be expressed in `openclaw.json`? Where are the semantic gaps that require a Sherpa-specific plugin to bridge?
