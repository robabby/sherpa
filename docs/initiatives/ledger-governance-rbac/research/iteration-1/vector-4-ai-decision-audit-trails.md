# Vector 4: Tamper-Evident AI Decision Audit Trails

**Question:** What production systems and academic research exist for tamper-evident audit trails of AI agent decisions? What are the emerging standards for logging autonomous AI actions in a way that supports accountability, compliance, and forensic review?
**Agent dispatched:** 2026-03-12

## Findings

### 1. IEEE ICCA 2025: Blockchain-Monitored Agentic AI Architecture (arxiv 2512.20985)

The most directly relevant academic work. Jan et al. propose a Hyperledger Fabric-backed governance layer for LangChain multi-agent systems. Uses MCP-integrated action executors alongside the LangChain agent. Tested on smart inventory management, traffic-signal control, and healthcare monitoring scenarios. Blockchain verification "efficiently prevents unauthorized practices" while "maintaining operational latency within reasonable ranges." Permissioned blockchain (not public) is sufficient — you don't need consensus overhead, just tamper-evidence.

### 2. EU AI Act Article 12 & 19: Concrete Logging Mandates

EU AI Act (Regulation 2024/1689) — effective now:
- Article 12 requires high-risk AI systems to "technically allow for the automatic recording of events (logs) over the lifetime of the system"
- Logs must capture events relevant to: (a) identifying risk situations, (b) supporting post-market monitoring, (c) monitoring system operations
- Article 19 mandates minimum 6-month retention for automatically generated logs
- Recommended: structured JSON logging, ISO 8601 timestamps, unique correlation IDs, input data hashing, decision confidence scores, human oversight records, immutability guarantees, cryptographic verification

### 3. FINRA 2026 Oversight Report: Agentic AI Gets Regulatory Scrutiny

First regulatory framing for agentic AI in financial services:
- Firms must preserve "the underlying telemetry that demonstrates how the system reached its end state"
- Must capture "intermediate tool calls, data fetches, and decision pathways"
- These logs qualify as regulatory records subject to Exchange Act retention periods (Rule 17a-4)
- Specific requirement: "inputs, decision pathways, and even rejected alternatives to provide a full picture of the agent's reasoning"

### 4. NIST AI RMF 1.0 (AI 100-1) and GenAI Profile (AI 600-1)

- GOVERN 4.1: All AI risk-related information must be "systematically recorded and maintained for accountability and traceability"
- Requires "traceable data" to manage trade-offs among trustworthiness characteristics
- Four functions: Govern, Map, Measure, Manage — all requiring documentation

### 5. Temporal.io: Production-Grade Deterministic Audit Trails

Closest production analog to what Sherpa needs:
- "Each Workflow's history is stored, so I have an exact record of every decision and action the agents took"
- Event History is append-only and serves as both the execution mechanism AND the audit log
- Deterministic replay: workflows are replayable, reconstructing exact decision sequences
- Tool invocations are themselves Temporal Workflows, providing "audit trails and fault tolerance for free"
- Key insight: the audit trail IS the execution mechanism — not a separate logging concern

### 6. OpenTelemetry GenAI Semantic Conventions

Emerging standard vocabulary for AI agent tracing:
- Agent Application Level: Draft convention finalized based on Google's AI agent white paper
- Agent Framework Level: Common convention for CrewAI, AutoGen, LangGraph, Semantic Kernel, PydanticAI
- Captures: prompts, model responses, token usage, tool/agent calls, provider metadata
- Status: Experimental — not yet stable but most likely industry standard candidate

### 7. Pangea Secure Audit Log

Production tamper-evident logging as a service (now part of CrowdStrike):
- Merkle trees with SHA256 hashing
- Events canonicalized via JSON Canonicalization Scheme (RFC 8785)
- Root hashes published to Arweave every hour or 10,000 events
- Has an MCP server (`pangea-mcp-server`) that exposes Secure Audit Log directly to AI agents
- Agents can create and search tamper-proof log entries via MCP tools

### 8. Three Cryptographic Tamper-Evidence Approaches

**a) Google Trillian / Certificate Transparency**: Open-source append-only Merkle tree log. Clients verify inclusion proofs (O(log N) hashes) and consistency proofs. Russ Cox's tile design: 50% storage reduction.

**b) Azure SQL Ledger**: SHA-256 Merkle tree over transactions. Root hashes stored externally. Single bit alteration is detected. Previous row values preserved in history tables automatically.

**c) Sigstore Rekor**: Transparency log for software supply chain. RESTful API. Public instance at rekor.sigstore.dev.

### 9. W3C PROV Data Model

Mature standard for provenance: Entities (things), Activities (processes), Agents (responsible parties). Six components including derivation tracking and responsibility attribution. Could serve as conceptual basis for Sherpa's audit trail schema.

### 10. Academic Frameworks

- **Winfield & Jirotka (2017) — Ethical Black Box**: "Flight Data Recorder" for autonomous systems
- **Oala et al. (2024) — AI Accountability Infrastructure (CHI 2025)**: Accountability infrastructure is "severely lacking"
- **Pandey (2025)**: Introduces Agentic Log Retention Index (ALRI) — retention periods based on agent risk level
- **ISACA (2025)**: Agents can "create new identities to execute tasks" causing "identity inventory explosions"

### 11. What to Log (Derived from EU AI Act + FINRA + ISACA)

Each audit event should capture:
- Timestamp (ISO 8601), Agent identity (role + session), Action type
- Inputs (context/data at decision time), Decision pathway (alternatives considered)
- Outcome (what changed), Authorization chain (who authorized)
- Correlation ID (linking related events), Input data hash (integrity without storing full inputs)

## Sources

### Regulatory & Standards
- [EU AI Act Article 12](https://www.euaiact.com/article/12)
- [EU AI Act Article 19](https://artificialintelligenceact.eu/article/19/)
- [EU AI Act Logging Compliance (Logdy)](https://logdy.dev/blog/post/eu-ai-act-implications-for-log-management-systems-and-compliance)
- [NIST AI RMF 1.0](https://nvlpubs.nist.gov/nistpubs/ai/nist.ai.100-1.pdf)
- [NIST AI 600-1 GenAI Profile](https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.600-1.pdf)
- [FINRA 2026 Oversight Report](https://www.finra.org/sites/default/files/2025-12/2026-annual-regulatory-oversight-report.pdf)
- [FINRA Autonomous AI Analysis](https://www.swlaw.com/publication/finras-2026-oversight-report-signals-a-supervisory-reckoning-for-autonomous-ai/)
- [ISO/IEC 42001:2023](https://www.iso.org/standard/42001)
- [OpenAI Audit Logs API](https://platform.openai.com/docs/api-reference/audit-logs)
- [W3C PROV Data Model](https://www.w3.org/TR/prov-dm/)

### Academic & Research
- [Blockchain-Monitored Agentic AI (arxiv 2512.20985)](https://arxiv.org/abs/2512.20985)
- [AI Accountability Infrastructure Gaps (arxiv 2402.17861)](https://arxiv.org/abs/2402.17861)
- [Agentic AI Governance Framework (SSRN 5652350)](https://papers.ssrn.com/sol3/papers.cfm?abstract_id=5652350)
- [Ethical Black Box (Winfield & Jirotka)](https://link.springer.com/chapter/10.1007/978-3-319-64107-2_21)
- [Auditing Agentic AI (ISACA)](https://www.isaca.org/resources/news-and-trends/industry-news/2025/the-growing-challenge-of-auditing-agentic-ai)

### Production Systems
- [Temporal Event History](https://docs.temporal.io/workflow-execution/event)
- [Temporal Orchestrating Ambient Agents](https://temporal.io/blog/orchestrating-ambient-agents-with-temporal)
- [Pangea Secure Audit Log](https://pangea.cloud/services/secure-audit-log/)
- [Pangea MCP Server](https://github.com/pangeacyber/pangea-mcp-server)
- [Google Trillian](https://transparency.dev/)
- [Sigstore Rekor](https://docs.sigstore.dev/logging/overview/)
- [immudb](https://immudb.io/)
- [Azure SQL Ledger](https://learn.microsoft.com/en-us/sql/relational-databases/security/ledger/ledger-overview)
- [OpenTelemetry AI Agent Observability](https://opentelemetry.io/blog/2025/ai-agent-observability/)

### Observability Platforms
- [LangSmith](https://www.langchain.com/langsmith/observability)
- [Langfuse](https://langfuse.com/)
- [Arize AI](https://arize.com/)
- [AI Agent Observability Comparison](https://research.aimultiple.com/agentic-monitoring/)

## Raw Links

- https://arxiv.org/abs/2512.20985
- https://arxiv.org/html/2512.20985
- https://www.euaiact.com/article/12
- https://artificialintelligenceact.eu/article/19/
- https://logdy.dev/blog/post/eu-ai-act-implications-for-log-management-systems-and-compliance
- https://nvlpubs.nist.gov/nistpubs/ai/nist.ai.100-1.pdf
- https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.600-1.pdf
- https://www.nist.gov/itl/ai-risk-management-framework
- https://www.finra.org/sites/default/files/2025-12/2026-annual-regulatory-oversight-report.pdf
- https://www.finra.org/rules-guidance/guidance/reports/2026-finra-annual-regulatory-oversight-report/gen-ai
- https://www.swlaw.com/publication/finras-2026-oversight-report-signals-a-supervisory-reckoning-for-autonomous-ai/
- https://www.gao.gov/products/gao-25-107197
- https://docs.temporal.io/workflow-execution/event
- https://temporal.io/blog/orchestrating-ambient-agents-with-temporal
- https://opentelemetry.io/blog/2025/ai-agent-observability/
- https://www.datadoghq.com/blog/llm-otel-semantic-convention/
- https://pangea.cloud/docs/audit/about-tamperproofing
- https://pangea.cloud/services/secure-audit-log/
- https://github.com/pangeacyber/pangea-mcp-server
- https://transparency.dev/
- https://research.swtch.com/tlog
- https://static.usenix.org/event/sec09/tech/full_papers/crosby.pdf
- https://docs.sigstore.dev/logging/overview/
- https://immudb.io/
- https://github.com/codenotary/immudb
- https://learn.microsoft.com/en-us/sql/relational-databases/security/ledger/ledger-overview
- https://www.dolthub.com/
- https://www.langchain.com/langsmith/observability
- https://langfuse.com/
- https://arize.com/
- https://research.aimultiple.com/agentic-monitoring/
- https://link.springer.com/chapter/10.1007/978-3-319-64107-2_21
- https://arxiv.org/abs/2402.17861
- https://papers.ssrn.com/sol3/papers.cfm?abstract_id=5652350
- https://www.isaca.org/resources/news-and-trends/industry-news/2025/the-growing-challenge-of-auditing-agentic-ai
- https://www.w3.org/TR/prov-dm/
- https://www.iso.org/standard/42001
- https://www.anthropic.com/transparency
- https://platform.openai.com/docs/api-reference/audit-logs
- https://www.kurrent.io/blog/event-sourcing-audit
- https://crfm.stanford.edu/fmti/December-2025/company-reports/Anthropic_FinalReport_FMTI2025.html

## Implications

1. **The log should BE the execution record** (Temporal pattern) — the audit trail shouldn't be separate from the governance engine
2. **Regulatory compliance is arriving fast** — EU AI Act and FINRA 2026 are not theoretical
3. **Three-layer audit architecture**: Event capture → Tamper-evidence (hash chain) → Verification (proofs)
4. **Agent identity is a first-class problem** — ISACA's "identity inventory explosion" directly relevant
5. **OpenTelemetry GenAI conventions** are the most likely standard trace format

## Open Questions

1. Hash chain anchoring: Where to store root hashes externally? Git commits as anchor?
2. Granularity: Every LLM call or only governance-level decisions?
3. Context window capture: Full prompt? Full context? Just system prompt + recent messages?
4. Cross-agent correlation: How to link events across Planner/Worker/Judge?
5. Offline verification: Can third parties verify without Sherpa instance access?
6. Retention policy: EU AI Act says 6 months minimum; FINRA says potentially 6 years
