# Iteration 1 — 2026-03-12

## Research Vectors

### Vector 1: RBAC for Agentic Systems
**Question:** What RBAC implementations exist for AI agent frameworks and MCP servers?
**Full report:** [iteration-1/rbac-implementations-in-ai-agent-systems.md](iteration-1/rbac-implementations-in-ai-agent-systems.md)

**Key discoveries:**
- No major multi-agent framework ships formal RBAC — CrewAI, AutoGen, LangGraph, OpenAI Agents SDK all use ad-hoc guardrails
- Cloud providers (Azure Foundry, AWS Bedrock) implement RBAC for humans managing agents, not agent-to-agent governance
- MCP authorization is OAuth 2.1 only — application-layer authorization is explicitly left open
- Hybrid RBAC+ABAC is the emerging consensus — static roles alone fail due to role explosion and machine-speed risk
- Authenticated delegation (MIT/ICML 2025): three-token model with scope-only-narrows-never-widens chains
- OWASP defines the most actionable agent trust hierarchy: UNTRUSTED → INTERNAL → PRIVILEGED → SYSTEM

**Implications:**
- Sherpa would be the first agentic framework with formal RBAC — genuine first-mover position
- Start with RBAC for coarse boundaries, add ABAC contextual constraints incrementally

### Vector 2: Minimal Governance Ledger Without Blockchain
**Question:** What's the simplest tamper-evident append-only log with blockchain-grade guarantees?
**Full report:** [iteration-1/tamper-evident-ledger-systems.md](iteration-1/tamper-evident-ledger-systems.md)

**Key discoveries:**
- **SQLite + application-level SHA-256 hash chain** is the simplest viable design — each row has `prev_hash` + `entry_hash`
- Amazon QLDB validated the architecture but was discontinued July 2025 (poor market fit, not technical failure)
- SQL Server Ledger is the best production reference: Merkle tree over hash-chained blocks inside a relational database
- AuditableLLM (2026 paper) validates hash-chain audit for AI governance with 3.4ms/step overhead
- At Sherpa's scale (thousands of events), simple hash chain O(1) is sufficient — Merkle trees needed only above ~10K entries
- Canonical JSON serialization with deterministically sorted keys is essential for reproducible hashing

**Implications:**
- No new dependencies needed — SQLite + Node.js crypto.createHash covers it
- Hash chain integrity is orthogonal to WAL mode — they complement each other

### Vector 3: RBAC x Authority Composition
**Question:** How do role-based permissions and resource-level authority grants compose?
**Full report:** [iteration-1/rbac-authority-composition-patterns.md](iteration-1/rbac-authority-composition-patterns.md)

**Key discoveries:**
- **RBAC gates WHO can request authority; the authority machine gates WHO CURRENTLY HOLDS** — validated by every production system examined
- Composition must use AND/deny-overrides (intersection): both layers must Allow
- Kubernetes Leases + RBAC is the closest infrastructure analog to Sherpa's design
- PostgreSQL GRANT + RLS is the cleanest formal model — GRANT is the outer gate, RLS is the inner gate
- Azure Blob Leases document the exact Break operation pattern mapping to Sherpa's `override_authority`
- NIST INCITS 359 defines Dynamic Separation of Duty — needed for worker/reviewer separation within task lifecycle
- Fencing tokens contain coordination state, not permission state — orthogonal to RBAC

**Implications:**
- Keep RBAC and authority as two separate layers (don't unify into Zanzibar-style ReBAC yet)
- RBAC checked once per MCP tool call; authority (fencing token) checked on every mutation

### Vector 4: Tamper-Evident AI Decision Audit Trails
**Question:** What standards exist for logging autonomous AI actions for accountability and compliance?
**Full report:** [iteration-1/vector-4-ai-decision-audit-trails.md](iteration-1/vector-4-ai-decision-audit-trails.md)

**Key discoveries:**
- EU AI Act Article 12/19 mandates automatic event recording and 6-month minimum retention for high-risk AI
- FINRA 2026 requires capturing "intermediate tool calls, data fetches, and decision pathways" as regulatory records
- Temporal.io gets audit "for free" because the audit trail IS the execution mechanism — not a separate concern
- OpenTelemetry GenAI semantic conventions are the emerging standard vocabulary for agent traces (experimental)
- Pangea Secure Audit Log has an MCP server — agents can log tamper-proof entries via MCP tools
- W3C PROV data model (Entities, Activities, Agents) could be the conceptual basis for audit schema

**Implications:**
- Design the ledger as the execution record, not a bolt-on logging layer (Temporal pattern)
- Regulatory compliance is arriving — building this now is cheaper than retrofitting

### Vector 5: RBAC in the Three-Layer Stack
**Question:** Where does RBAC enforcement sit in MCP server / hooks / CLAUDE.md?
**Full report:** [iteration-1/rbac-enforcement-point-architecture.md](iteration-1/rbac-enforcement-point-architecture.md)

**Key discoveries:**
- **MCP Server = PDP (Policy Decision Point)** — all RBAC evaluation lives here
- **Hooks = PEP (Policy Enforcement Point)** — intercept operations, POST to MCP, enforce response
- **CLAUDE.md = PAP (Policy Administration Point, soft)** — shapes behavior before operations
- Three layers are complementary, not redundant: behavioral → hard gate → full evaluation
- Pattern validated by Kubernetes (RBAC + Admission Controllers + Network Policies), AWS IAM (7 policy types), Envoy + OPA
- Localhost HTTP roundtrip adds ~1-2ms per Edit/Write — negligible against LLM inference latency
- **Fail-closed by default** — if MCP server is unreachable, deny all writes

**Implications:**
- Hooks contain zero policy logic — just the HTTP call and the gate
- RBAC configuration could live in sherpa.config.ts (PAP) and be loaded into the MCP server at startup

## Synthesis

Five vectors converge on a remarkably consistent design. The cross-cutting insights that no single vector produced:

### 1. The XACML Architecture Is the Unifying Frame

Every vector independently rediscovered the same separation: Policy Decision (MCP server) / Policy Enforcement (hooks) / Policy Administration (config + CLAUDE.md) / Policy Information (SQLite state). This isn't coincidence — it's the XACML reference architecture validated across 30 years of access control research. Sherpa should adopt the vocabulary (PDP, PEP, PAP, PIP) even if it doesn't adopt the XML.

### 2. Two Orthogonal Layers, One Composition Rule

RBAC (who can do what in general) and Authority (who currently holds what specifically) are **orthogonal** — they check different things. RBAC is static policy; authority is dynamic state. Fencing tokens carry coordination state, not permission state. The composition is AND/deny-overrides: both must allow. This is the AWS IAM identity+resource policy model, the PostgreSQL GRANT+RLS model, and the Kubernetes RBAC+Lease model. It works because each layer catches what the other misses.

### 3. The Ledger Is Not a Log — It's the Source of Truth

The strongest insight comes from crossing Vector 2 (ledger design) with Vector 4 (audit trails) with the prior event-sourcing research: **if the governance ledger IS the execution mechanism** (Temporal pattern), audit comes for free. Every proposal submission, authority grant, permission check, and state transition is a ledger entry. Current state is derived by replaying the ledger. This unifies the "we need a ledger" requirement with the "we need an audit trail" requirement — they're the same thing.

### 4. Sherpa Would Be First-of-Kind

No major AI agent framework ships formal RBAC (Vector 1). No MCP server implements role-based authorization beyond OAuth scopes (Vector 1). No agent coordination system uses a tamper-evident governance ledger (Vector 2). The combination of RBAC + authority state machine + hash-chained audit ledger in a single governance framework for agentic workflows has no precedent. This isn't incremental — it's a structural contribution.

### 5. Regulatory Tailwind

EU AI Act Article 12/19 and FINRA 2026 are creating legal requirements for exactly what this initiative proposes. Sherpa customers in regulated industries (financial services, healthcare) will need immutable decision audit trails. Building this into the framework positions Sherpa as compliance-ready for the regulatory wave that's already arriving.

## All Sources

### RBAC & Authorization
- [NIST INCITS 359 RBAC Standard](https://csrc.nist.gov/projects/role-based-access-control)
- [AWS IAM Policy Evaluation Logic](https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_evaluation-logic.html)
- [Kubernetes RBAC](https://kubernetes.io/docs/reference/access-authn-authz/rbac/)
- [Azure Blob Lease Operations](https://learn.microsoft.com/en-us/rest/api/storageservices/lease-blob)
- [Google Zanzibar Paper](https://research.google/pubs/pub48190/)
- [SpiceDB](https://authzed.com/spicedb)
- [Oso Authorization](https://www.osohq.com/)
- [Cerbos Policy Engine](https://www.cerbos.dev/)
- [OPA (Open Policy Agent)](https://www.openpolicyagent.org/)
- [OWASP Agent Trust Hierarchy](https://owasp.org/www-project-top-10-for-large-language-model-applications/)
- [MIT/ICML 2025 Authenticated Delegation](https://arxiv.org/abs/2501.09674)

### Ledger & Tamper-Evidence
- [Amazon QLDB Architecture](https://aws.amazon.com/qldb/)
- [SQL Server Ledger](https://learn.microsoft.com/en-us/sql/relational-databases/security/ledger/ledger-overview)
- [Google Trillian](https://transparency.dev/)
- [Certificate Transparency (Russ Cox)](https://research.swtch.com/tlog)
- [immudb](https://immudb.io/)
- [Sigstore Rekor](https://docs.sigstore.dev/logging/overview/)
- [AuditableLLM Paper](https://arxiv.org/abs/2601.04583)
- [Pangea Secure Audit Log](https://pangea.cloud/services/secure-audit-log/)
- [Pangea MCP Server](https://github.com/pangeacyber/pangea-mcp-server)
- [RFC 8785 JSON Canonicalization Scheme](https://www.rfc-editor.org/rfc/rfc8785)

### Regulatory & Compliance
- [EU AI Act Article 12](https://www.euaiact.com/article/12)
- [EU AI Act Article 19](https://artificialintelligenceact.eu/article/19/)
- [NIST AI RMF 1.0](https://nvlpubs.nist.gov/nistpubs/ai/nist.ai.100-1.pdf)
- [FINRA 2026 Oversight Report](https://www.finra.org/sites/default/files/2025-12/2026-annual-regulatory-oversight-report.pdf)
- [ISO/IEC 42001:2023](https://www.iso.org/standard/42001)
- [W3C PROV Data Model](https://www.w3.org/TR/prov-dm/)

### Architecture Patterns
- [XACML Reference Architecture](https://docs.oasis-open.org/xacml/3.0/xacml-3.0-core-spec-os-en.html)
- [Kubernetes Admission Controllers](https://kubernetes.io/docs/reference/access-authn-authz/admission-controllers/)
- [Envoy ext_authz](https://www.envoyproxy.io/docs/envoy/latest/configuration/http/http_filters/ext_authz_filter)
- [Temporal Event History](https://docs.temporal.io/workflow-execution/event)
- [OpenTelemetry GenAI Conventions](https://opentelemetry.io/blog/2025/ai-agent-observability/)

### AI Agent Frameworks
- [CrewAI](https://docs.crewai.com/)
- [AutoGen](https://microsoft.github.io/autogen/)
- [LangGraph](https://langchain-ai.github.io/langgraph/)
- [OpenAI Agents SDK](https://platform.openai.com/docs/guides/agents)

## Proposals Generated

- `proposal.md` — Ledger-Governed RBAC for Sherpa (see below)

## Open Questions for Next Iteration

1. **Agent identity verification** — How does an agent prove its role? Sessions don't have stable IDs. The MCP server may need to assign identity at SessionStart and validate it on every request. What does the identity token look like? (Critical — this is the weakest link in the entire system.)

2. **RBAC schema design** — Should the 5-role x 5-resource permission matrix live in SQLite (dynamic, queryable) or in sherpa.config.ts (static, version-controlled)? What are the trade-offs for each? PostgreSQL uses catalog tables; Kubernetes uses YAML manifests. Which model fits Sherpa?

3. **Ledger event schema** — What fields does each ledger entry need? The regulatory research (EU AI Act, FINRA) suggests: timestamp, agent_id, role, action, resource, outcome, authorization_chain, input_hash, correlation_id. What's the canonical serialization? RFC 8785 JCS vs sorted-keys JSON?

4. **Git as digest anchor** — Can Sherpa anchor ledger root hashes into git commits? Each commit already has a SHA. If the ledger hash is included in commit metadata, you get external anchoring for free. But this couples governance ledger integrity to git history integrity.

5. **Granularity threshold** — Which actions get ledger entries? Every LLM call? Every file write? Only governance actions (proposals, approvals, authority grants)? Finer granularity = better audit trail but more storage and noise. FINRA says "full decision pathway"; EU AI Act says "relevant events." What's Sherpa's default?
