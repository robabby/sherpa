# Ledger Governance + RBAC — Research

## Summary

Investigating how to borrow ledger principles (append-only audit trails, hash-chained integrity, policy enforcement before state transitions) and formal RBAC permissioning for Sherpa's governance model — without inheriting blockchain complexity.

## Iteration 1 (2026-03-12)

Surveyed the landscape across 5 vectors. Key findings:

- **No AI agent framework ships formal RBAC** — Sherpa would be first-of-kind
- **SQLite + SHA-256 hash chain** is the minimum viable tamper-evident ledger (3.4ms/step overhead)
- **RBAC and authority compose via AND/deny-overrides** — validated by AWS IAM, Kubernetes, PostgreSQL
- **MCP server = PDP, Hooks = PEP, CLAUDE.md = PAP** — maps cleanly to XACML reference architecture
- **Regulatory tailwind** — EU AI Act Article 12/19 and FINRA 2026 mandate immutable AI decision audit trails

## Open Questions for Next Iteration

1. **Agent identity verification** — How does an agent prove its role? Sessions lack stable IDs. What does the identity token look like? This is the weakest link in the entire system.

2. **RBAC schema design** — Permission matrix in SQLite (dynamic) vs sherpa.config.ts (static)? PostgreSQL uses catalog tables; Kubernetes uses YAML manifests. Which model fits Sherpa?

3. **Ledger event schema** — Canonical field set and serialization format. RFC 8785 JCS vs sorted-keys JSON. What fields are mandatory vs optional?

4. **Git as digest anchor** — Can ledger root hashes be anchored in git commits for external verification? Couples ledger integrity to git history integrity.

5. **Granularity threshold** — Which actions get ledger entries? Every file write or only governance actions? FINRA says "full decision pathway"; EU AI Act says "relevant events."

## Cross-References

- `mcp-coordination-layer` — RBAC and ledger run inside this MCP server
- `game-authority-as-mcp-protocol` — RBAC composes with the authority state machine
- `distributed-agent-consistency` — Event sourcing research informs ledger design
- `parallel-workflow-governance` — Three-layer governance model that RBAC enforces
- `behavioral-agents` — Role definitions that map to RBAC roles
