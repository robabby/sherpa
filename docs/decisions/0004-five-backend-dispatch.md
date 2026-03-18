---
doc-type: decision
decision: 0004
authored-by: ai
reviewed-by: null
last-updated: 2026-03-16
source-initiatives:
  - dispatch-center
status: accepted
---

> **AI-extracted** from dispatch-center · Awaiting human review

## Context

The execution pipeline needed to dispatch tasks to different AI agents and backends depending on task type, cost constraints, and availability. A single-backend approach would create vendor lock-in and prevent optimizing cost/quality tradeoffs per task type.

## Decision

Support five CLI backends with task-type routing configured in `sherpa.config.ts`:

1. **claude** — Claude Code CLI, primary for code implementation tasks
2. **opencode** — OpenCode CLI, alternative code agent
3. **codex** — OpenAI Codex CLI
4. **gemini** — Google Gemini CLI
5. **lm-studio** — Local LM Studio API, for budget-sensitive or offline tasks

Three dispatch modes: interactive (human-in-the-loop), supervised (human reviews output), overnight (autonomous batch). Backend selection is task-type driven — research tasks can route to cheaper models, code implementation to more capable ones.

## Consequences

- No vendor lock-in — backends are shell scripts, easily swapped or extended
- Cost optimization per task type (research on cheaper models, implementation on capable ones)
- Overnight batch dispatch enables parallel work across multiple backends
- Each backend module is independent (~50-100 lines) and follows the same interface
- Adding a new backend requires only a new script in `scripts/backends/`

## Evolution

The original five CLI backends were later extended with three API backends (groq, google-ai, lm-studio-api) via Vercel AI SDK, and one gateway backend (openclaw) connecting to a remote OpenClaw agent over WebSocket protocol v3. The architecture supports three backend types: CLI (shell scripts), API (AI SDK fetch), and gateway (WebSocket with device identity auth). Total: 9 backends. The core design — independent scripts, `--health` interface, env var contract — held without changes through all extensions.
