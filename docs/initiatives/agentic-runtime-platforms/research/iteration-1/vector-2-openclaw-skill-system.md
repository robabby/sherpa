# Vector 2: OpenClaw Skill System & Plugin Architecture

**Question:** How are OpenClaw skills defined and configured? What is the ContextEngine plugin API from the 2026.3.7 update? Can behavioral constraints be injected from an external orchestration system? What API does OpenClaw expose for external task submission?
**Agent dispatched:** 2026-03-17

## Findings

### Skill System

- **Skills are markdown files with YAML frontmatter — no SDK, no compilation.** A skill is just a `SKILL.md` with `name` and `description` in YAML, plus free-form markdown behavioral instructions. Skills are injected into the system prompt every turn. ([docs.openclaw.ai/tools/skills](https://docs.openclaw.ai/tools/skills), [lumadock.com tutorial](https://lumadock.com/tutorials/build-custom-openclaw-skills))
- **Three-level precedence:** workspace > user-global > bundled.
- **Dependency gating:** `requires.bins`, `requires.env`, OS filtering controls eligibility.
- **ClawHub hosts 13,729+ community skills** (but 20% were found to be malicious — see Vector 3).

### ContextEngine Plugin API (2026.3.7)

- **7 lifecycle hooks with slot-based exclusivity:** `bootstrap`, `ingest`, `assemble`, `compact`, `afterTurn`, `prepareSubagentSpawn`, `onSubagentEnded`.
- **Registration:** `api.registerContextEngine(id, factory)`. Only one context engine active at a time.
- `LegacyContextEngine` wraps existing compaction for backward compatibility.
- ([PR #22201](https://github.com/openclaw/openclaw/pull/22201), [release notes](https://github.com/openclaw/openclaw/releases/tag/v2026.3.7))

### Behavioral Constraint Injection — Three Mechanisms

1. **`before_prompt_build` hook** — plugins inject `prependSystemContext`/`appendSystemContext` per turn, controllable via `allowPromptInjection` policy.
2. **Sticky-context pattern** — file-based persistent slots with priority ordering and pinned (agent-undeletable) entries that survive compaction. ([github.com/jamebobob/openclaw-sticky-context](https://github.com/jamebobob/openclaw-sticky-context))
3. **Workspace file manipulation** — write `AGENTS.md`/`SOUL.md` directly on disk; OpenClaw re-reads each turn.

### External Task Submission APIs

- **Webhook surface:** `POST /hooks/agent` — accepts `message`, `agentId`, `sessionKey`, `model`, `timeoutSeconds`. Bearer token auth.
- **Chat Completions API:** `POST /v1/chat/completions` — OpenAI-compatible access with agent targeting via `model: "openclaw:<agentId>"`.
- **Tools Invoke API:** `POST /tools/invoke` — direct tool calls but `sessions_spawn` is deny-listed by default.

## Sources

- [docs.openclaw.ai/tools/skills](https://docs.openclaw.ai/tools/skills)
- [lumadock.com tutorial](https://lumadock.com/tutorials/build-custom-openclaw-skills)
- [PR #22201](https://github.com/openclaw/openclaw/pull/22201)
- [v2026.3.7 release notes](https://github.com/openclaw/openclaw/releases/tag/v2026.3.7)
- [docs.openclaw.ai/tools/plugin](https://docs.openclaw.ai/tools/plugin)
- [github.com/jamebobob/openclaw-sticky-context](https://github.com/jamebobob/openclaw-sticky-context)
- [docs.openclaw.ai/concepts/agent-workspace](https://docs.openclaw.ai/concepts/agent-workspace)
- [openclawlab.com webhook docs](https://openclawlab.com/en/docs/automation/webhook/)
- [docs.openclaw.ai/gateway/openai-http-api](https://docs.openclaw.ai/gateway/openai-http-api)

## Implications

- **Skill translation is structurally feasible** — Sherpa's behavioral role definitions (disposition, quality-bar, fail triggers) map to OpenClaw's `SKILL.md` format (Guardrails section, Output format, explicit prohibitions).
- **Task dispatch maps to `POST /hooks/agent`** — task slug → sessionKey, role → agentId, description → message, backend → model override.
- **The ContextEngine slot is too heavy** for governance injection — use `before_prompt_build` or sticky-context instead.
- **Agent lifecycle management requires filesystem access** — no REST API for creating agents or modifying workspace files.
- **Prompt injection is a governance concern** — behavioral constraints in system prompts are advisory, not enforced.

## Open Questions

1. Sticky-context vs. AGENTS.md as the injection point for Sherpa constraints — can both be layered?
2. How does an external orchestrator collect structured results from webhook-triggered runs?
3. Does writing new `AGENTS.md` content require a gateway restart or is it hot-reloaded?
4. Will `POST /api/sessions/spawn` land (issue #15342), enabling external parallel sub-agent dispatch?
5. Does a third-party ContextEngine plugin interfere with `before_prompt_build` hook injection?
