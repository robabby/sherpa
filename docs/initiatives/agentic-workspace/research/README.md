# Agentic Workspace — Research

Evergreen research on reimagining workspace tools for human-agent collaboration.

## Iterations

### Iteration 1 (2026-03-12)

Five parallel vectors (300+ sources):
1. DIY Workspace Revolution — the "build your own PM" movement
2. Agentic Interaction Paradigms — novel UX for managing agent fleets
3. The Platform Play — framework positioning for agentic workspaces
4. Skills and Conventions as Distribution — ecosystem models for composable skills
5. PM Category Earthquake — disruption dynamics in the PM tool market

**Key synthesis:** Governance gap is the opportunity. Products die, conventions endure. Composition is the moat. Fleet minimap is the missing primitive. Three-standard convergence (Agent Skills + AGENTS.md + MCP) creates timing window.

### Iteration 2 (2026-03-12)

Nine parallel vectors (500+ sources) — wide landscape broadening across six domains:
1. Cross-Provider Agent Compatibility — 7+ convention formats, 24+ tools, 5 converter tools
2. Runtime Abstraction Layers — LiteLLM, OpenRouter, CrewAI 45.9K stars, goose (AAIF), "Agentic Mesh" pattern
3. Multi-Model Orchestration & A2A — four-protocol stack (MCP + A2A + WebMCP + AG-UI), AGNTCY
4. "Kubernetes for Agents" — Agent Sandbox CRD, kagent CNCF, AgentGateway, Docker MCP Gateway
5. Cross-Tool Standard Convergence — AAIF 8 platinum members, NIST initiative, GaaS academic validation
6. Agent Memory & Session Persistence — filesystem beats specialized tools (Letta 74.0% vs Mem0 68.5%), sleep-time compute
7. Agent Identity, Trust & Security — 8.5% MCP OAuth adoption, capability warrants, Entra Agent ID, 36.82% skill flaws
8. Enterprise Fleet Deployment — Microsoft Agent 365, Salesforce Agentforce, Bedrock Guardrails, case studies
9. Agent Observability & DevOps — OTel GenAI conventions, Langfuse→ClickHouse, eval-as-CI/CD, agent versioning unsolved

**Key synthesis:** Filesystem governance independently validated everywhere (Letta, Codex, AGENTS.md). Four-protocol stack crystallizing. Security crisis creates urgency (36.82% flawed skills, 8.5% OAuth). Enterprise needs validate framework model. OTel coalescing as observability substrate. Behavioral governance of agent conduct remains the vacant layer between protocols and runtime — Sherpa's unique position.

### Iteration 3 (2026-03-12)

Four research themes (9 vectors):
- **Agent OS Race** (vectors 1-6): Who builds the "Agent OS"? Architecture layers. Platform comparison. Where governance sits. Kernel question. OSS projects.
- **Skill Composition Specification** (vectors 7-8): Agent Skills has no composition primitive. AgentSkillOS DAG outperforms flat by 30-45%. MCP has no Skills primitive. Workflow engines diverge.
- **AI Governance Regulation** (vector 7): EU AI Act Articles 9-15 technical mandates. Colorado SB 24-205. OWASP Agentic Top 10. Compliance-as-code patterns. $4.8B market.
- **Convention Distribution Architecture** (vector 9): shadcn registry + Copier lifecycle. No convention marketplace exists. L4 Governance unoccupied. Drift detection. Behavioral SemVer.

**Key synthesis:** Sherpa is the constitution, not the OS. Soft/hard governance gap is the critical challenge. Composition is a manifest, not a DAG. Convention distribution (L4 governance) is completely unoccupied. Regulation creates urgency. All four themes point to the same gap: the policy-enforcement binding layer.

## Open Questions

1. **A2A integration for Sherpa** — How would a Sherpa-governed agent expose itself as an A2A Agent Card? What lifecycle state mapping?
2. **Sleep-time compute** — How should background memory consolidation work between sessions? Automatic extraction from activity.md?
3. **Convention sync fidelity** — What's lost converting glob-scoped rules to flat AGENTS.md? Multi-format native authoring needed?
4. **OTel for Studio** — Should Studio consume OTel GenAI traces? Architecture for fleet minimap via OTel vs. custom WebSocket?
5. **Capability warrants from behavioral definitions** — Can behavioral YAML translate to capability warrants with monotonic attenuation?
6. **Policy enforcement binding** — Can `PreToolUse` hooks enforce behavioral definitions with acceptable latency? Rego/OPA vs structured markdown?
7. **Convention drift detection** — How should drift detection work concretely? Codified Context approach? Behavioral SemVer?
8. **Enterprise compliance mapping** — Which EU AI Act articles and NIST provisions map to Sherpa governance primitives?

## Research Archive

- `iteration-1.md` — Synthesis (2026-03-12)
- `iteration-1/` — Full agent reports (11 vectors including 6 sub-vectors)
- `iteration-2.md` — Synthesis (2026-03-12)
- `iteration-2/` — Full agent reports (9 vectors: cross-provider, runtime, A2A, K8s, standards, memory, identity, enterprise, observability)
- `iteration-3.md` — Synthesis (2026-03-12)
- `iteration-3/` — Full agent reports (10 vectors: Agent OS race, skill composition, regulation, convention distribution)
