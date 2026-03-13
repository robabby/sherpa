---
started: 2026-03-12
worktree: null
---

# Ledger Governance + RBAC — Activity Log

## 2026-03-12 — Initiative launched

- Created initiative from conversation exploring blockchain/AI convergence
- Core insight: borrow ledger principles (append-only, hash-chaining, policy gates) without blockchain complexity
- RBAC identified as critical missing piece in Sherpa governance
- Launching iteration 1 research with 5 vectors

## 2026-03-13 — RBAC + Authority composition research complete

- Completed deep research on how RBAC and resource-level authority grants compose in production systems
- Analyzed 12 production systems: AWS IAM, Kubernetes Leases, Azure Blob Leases, PostgreSQL GRANT+RLS, Google Chubby, etcd, Zanzibar/SpiceDB, XACML, NIST ABAC, Oso, Cerbos, game networking
- Key finding: the two-layer model (RBAC gates WHO can request, authority gates WHO CURRENTLY HOLDS) is validated by every production system examined
- Composition should use AND/deny-overrides (intersection), not OR/union: both RBAC and authority must allow
- PostgreSQL GRANT+RLS is the closest formal analog to Sherpa's design
- Kubernetes Leases + RBAC is the closest infrastructure analog
- Drafted concrete RBAC permission table (5 roles x 5 resource types x operations)
- Identified SoD constraints that bridge the two layers (worker/reviewer separation)
- Output: `research/iteration-1/rbac-authority-composition-patterns.md`

## 2026-03-12 — Tamper-evident ledger systems research complete

- Researched non-blockchain tamper-evident, append-only, hash-chained log systems
- Analyzed 11 systems/approaches: Amazon QLDB (discontinued), Google Trillian/CT, immudb, SQL Server Ledger, Sigstore Rekor, Sigsum, Dolt, Git Merkle DAG, AuditableLLM, SQLite hash chains, PostgreSQL hash chains
- Key finding: SQLite + application-level SHA-256 hash chain is the simplest viable design for Sherpa
- Hash chain O(1) append is sufficient at Sherpa's scale; Merkle tree O(log n) proofs needed only above ~10K entries
- QLDB's discontinuation validates embedded approach over managed service dependency
- SQL Server Ledger is the best production reference architecture (Merkle tree over hash-chained blocks)
- AuditableLLM paper validates hash-chain audit for AI governance with negligible overhead (3.4ms/step)
- Canonical JSON serialization (sorted keys) is essential for deterministic hashing
- Output: `research/iteration-1/tamper-evident-ledger-systems.md`

## 2026-03-12 — Iteration 1 complete (5 vectors, synthesis, proposal)

- Dispatched 5 parallel research vectors: RBAC for agentic systems, minimal governance ledger, RBAC x authority composition, AI decision audit trails, RBAC in three-layer stack
- Cross-vector synthesis identified 5 convergent insights: XACML as unifying frame, two orthogonal layers with AND composition, ledger-as-execution-record (Temporal pattern), first-mover position, regulatory tailwind
- Wrote proposal.md: Ledger-Governed RBAC for Sherpa (status: pending)
- 5 open questions seeded for iteration 2: agent identity, RBAC schema design, ledger event schema, git digest anchoring, granularity threshold
