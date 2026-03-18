---
doc-type: decision
decision: "0010"
authored-by: ai
reviewed-by: null
last-updated: 2026-03-17
source-initiatives:
  - mcp-initiative-governance
status: accepted
---

> **AI-extracted** from mcp-initiative-governance · Awaiting human review

## Context

With initiative CRUD exposed via MCP, any agent runtime can now propose work and participate in governance. The critical question: should agents be able to *approve* initiatives, or is that strictly a human checkpoint?

Hardcoding "no agent approval" is too rigid — some organizations want full autonomy for low-risk additive work. Defaulting to "agents can approve anything" is unsafe — approval is the moment where proposed changes become authorized work. The governance boundary needs to be configurable per organization, which is exactly what `sherpa.config.ts` is for.

## Decision

Initiative approval via MCP is governance-policy-gated through `governance.approval.agents` in `sherpa.config.ts`:

- `'never'` (default) — agents cannot approve via MCP. Human action required via Studio UI.
- `'additive-only'` — agents can approve initiatives with `risk: additive` only.
- `'always'` — agents can approve any risk level (full autonomy).

A separate `governance.approval.requireAuthority` boolean (default `true`) controls whether write operations require an active authority lease.

When an agent calls `initiative_approve` and policy blocks it, the tool returns a structured error explaining that approval requires human action, with a pointer to the Studio UI.

## Consequences

**Positive:**
- Safe default — out-of-the-box, approval remains human-only
- Progressive trust — organizations dial up autonomy as confidence grows
- Risk-stratified — additive-only mode lets agents handle low-risk proposals while humans review structural changes
- Configurable — each organization sets their own governance boundary in code

**Negative:**
- Policy is static per config — no per-initiative or per-agent override
- No audit trail beyond activity.md entries (future: structured approval events)
- "additive" risk classification is self-assessed by the proposal author — no independent verification
