---
doc-type: decision
decision: 0011
authored-by: ai
reviewed-by: null
last-updated: 2026-03-18
source-initiatives:
  - vps-remote-compute
  - agentic-runtime-platforms
status: accepted
---

> **AI-extracted** from vps-remote-compute, agentic-runtime-platforms · Awaiting human review

## Context

The dispatch system started with 5 CLI backends on Rob's local machine, expanded to 8 with API backends, then to 9 with the OpenClaw gateway backend. Each task type routed to a different backend based on cost/capability tradeoffs (code to Claude, research to Groq, content to Gemini, etc.). This spread dispatch across many providers with different auth mechanisms, availability profiles, and billing models.

With OpenClaw deployed on a Hetzner VPS running Claude Sonnet 4.6, the question became: does multi-backend routing still serve the production use case, or is it a local-development artifact?

## Decision

Make OpenClaw the default backend for all task types. All other backends remain available via explicit `backend:` override but receive no default routing.

The two-tier model:
- **Default (OpenClaw):** Always-on, runs Claude Sonnet 4.6 via the Hetzner gateway. Handles all task types. Connected to the codebase, MCP server, and Studio. Persistent context across sessions.
- **Premium (direct Anthropic API):** Available for client engagements requiring isolated billing, SLA guarantees, or Opus-tier capability. Accessed via `backend: claude` override.

Offline fallback: `claude` (Claude Code CLI on the operator's local machine) when the gateway is unreachable.

## Consequences

- Dispatch routing simplifies from 8 provider-specific routes to 1 default + overrides
- OpenClaw's persistent agent context (memory, workspace, session history) is an advantage over stateless API calls
- Single point of failure: if the Hetzner VPS or OpenClaw gateway is down, all dispatch fails to the offline fallback
- Cost consolidation: all inference goes through one Anthropic subscription instead of multiple provider accounts
- The Vercel AI Gateway initiative becomes a future enhancement (multi-provider fallback behind OpenClaw) rather than a prerequisite
