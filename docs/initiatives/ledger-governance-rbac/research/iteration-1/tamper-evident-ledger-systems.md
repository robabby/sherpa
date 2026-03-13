# Tamper-Evident Ledger Systems Without Blockchain

**Research iteration:** 1
**Date:** 2026-03-12
**Focus:** What is the simplest tamper-evident, append-only, hash-chained log that provides blockchain-grade audit guarantees without blockchain complexity? What non-blockchain ledger systems exist for governance and audit trails?

---

## Key Discoveries

### 1. The Core Pattern: Hash-Chained Append-Only Logs

The fundamental data structure is simple: each record includes a SHA-256 hash of the previous record's hash plus the current record's canonical content. This creates a mathematical chain where modifying any entry breaks the chain from that point forward.

**Minimal entry structure:**
```
{
  id:         UUIDv7 (time-sortable),
  timestamp:  ISO-8601,
  event_type: string,
  actor:      string,
  payload:    object,
  prev_hash:  hex string (or "GENESIS" for first entry),
  entry_hash: SHA-256(prev_hash + canonical_JSON(entry_fields))
}
```

**Verification algorithm:** For each entry in sequence, recompute `entry_hash` from stored fields + `prev_hash`, then confirm `prev_hash` matches the previous entry's `entry_hash`. Any modification cascades forward as mismatches.

**Canonical JSON is essential** -- without deterministic key ordering and consistent serialization, hash comparison produces false positives. Keys must be alphabetically sorted at every nesting level, preserving array order.

Sources:
- [Building a Tamper-Evident Audit Log with SHA-256 Hash Chains (Zero Dependencies)](https://dev.to/veritaschain/building-a-tamper-evident-audit-log-with-sha-256-hash-chains-zero-dependencies-h0b)
- [Tamper-evident audit trails in PostgreSQL with hash chaining](https://appmaster.io/blog/tamper-evident-audit-trails-postgresql)
- [How do you design tamper-evident audit logs?](https://www.designgurus.io/answers/detail/how-do-you-design-tamperevident-audit-logs-merkle-trees-hashing)

### 2. Hash Chains vs. Merkle Trees: When Each Matters

Two competing data structures serve different verification needs:

| Property | Hash Chain | Merkle Tree |
|----------|-----------|-------------|
| Append cost | O(1) | O(log n) |
| Verify single entry | O(n) traversal | O(log n) proof |
| Verify whole log | O(n) | O(n) |
| Proof size | O(n) | O(log n) |
| Implementation complexity | Trivial | Moderate |
| Best for | Small-to-medium logs, sequential verification | Large logs, selective verification, third-party audits |

**The Crosby-Wallach result (USENIX Security 2009):** A log with 80 million events requires an 800 MB proof via hash chain but only a 3 KB proof via Merkle tree. This is the foundational paper that established tree-based tamper-evident logging as superior to linear chains for large datasets.

**For Sherpa's scale (governance actions in a single workspace):** Hash chains are sufficient. A workspace might accumulate thousands to tens of thousands of governance events -- hash chain verification at this scale is sub-second. Merkle trees become necessary only if third-party auditors need compact proofs for individual entries, or if the log grows past millions of entries.

Sources:
- [Crosby & Wallach, "Efficient Data Structures for Tamper-Evident Logging" (USENIX 2009)](https://static.usenix.org/event/sec09/tech/full_papers/crosby.pdf)
- [Merkle Tree and Hash Chain Data Structures with Difference](https://www.geeksforgeeks.org/dsa/merkle-tree-and-hash-chain-data-structures-with-difference/)

### 3. SQLite Can Serve as a Hash-Chained Ledger

SQLite-based hash-chain implementation is proven and practical:

**Table schema:**
```sql
CREATE TABLE governance_ledger (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  timestamp   TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  event_type  TEXT NOT NULL,
  actor_id    TEXT NOT NULL,
  resource    TEXT,
  payload     TEXT NOT NULL,  -- canonical JSON
  prev_hash   TEXT NOT NULL,
  entry_hash  TEXT NOT NULL
);

-- Immutability enforcement
CREATE TRIGGER prevent_ledger_update
BEFORE UPDATE ON governance_ledger
BEGIN
  SELECT RAISE(ABORT, 'Ledger records are immutable');
END;

CREATE TRIGGER prevent_ledger_delete
BEFORE DELETE ON governance_ledger
BEGIN
  SELECT RAISE(ABORT, 'Ledger records cannot be deleted');
END;
```

**Hash computation happens in application code** (Node.js/TypeScript with `crypto.createHash('sha256')`), not in SQLite. SQLite lacks built-in SHA-256 -- extensions exist (sqlite-hashes, sqlean-crypto) but adding native dependencies for this is unnecessary when the application layer can hash before INSERT.

**WAL mode is complementary but not the same thing.** SQLite's WAL provides concurrent read/write performance; the hash chain provides tamper-evidence. They solve orthogonal problems and work well together.

**Concurrency concern:** If two transactions simultaneously read the same `prev_hash`, you get a fork. Solution: serialize writes to the ledger table using a mutex or SQLite's built-in serialization (single-writer in WAL mode handles this naturally with better-sqlite3's synchronous API).

Sources:
- [Let's Make a Hash Chain in SQLite](https://www.viget.com/articles/lets-make-a-hash-chain-in-sqlite)
- [SQLite and Blockchain: Storing Immutable Records and Audit Trails](https://www.sqliteforum.com/p/sqlite-and-blockchain-storing-immutable)
- [sqlite-hashes extension](https://github.com/nyurik/sqlite-hashes)

### 4. Amazon QLDB: The Canonical Example (Now Discontinued)

Amazon QLDB was the clearest production example of "blockchain guarantees without blockchain." Its architecture:

- **Journal-first:** All changes went through an append-only journal before reaching queryable tables
- **Hash chaining:** Each block included SHA-256 hash of the previous block
- **Merkle tree:** A continuously-updated Merkle tree over all journal blocks enabled O(log n) inclusion proofs
- **Amazon Ion format:** A superset of JSON used for document serialization (type annotations, comments, additional types)
- **Digest:** A 256-bit root hash representing the entire ledger state at a point in time

**QLDB was discontinued July 31, 2025.** AWS recommended migrating to Aurora PostgreSQL with pgAudit, but acknowledged that Aurora "does not keep a permanent, immutable record of changes." The market failure was positioning, not technology -- the concept is sound, it just didn't find commercial traction.

**Key lesson for Sherpa:** QLDB validated that a centralized, journal-first, Merkle-tree-backed ledger provides genuine tamper-evidence without distributed consensus. The architecture is correct; the implementation should be embedded, not a managed service dependency.

Sources:
- [Amazon QLDB Architecture](https://qldbguide.com/guide/what-is-qldb/)
- [Real-world cryptographic verification with QLDB](https://aws.amazon.com/blogs/database/real-world-cryptographic-verification-with-amazon-qldb/)
- [AWS Discontinues QLDB](https://www.infoq.com/news/2024/07/aws-kill-qldb/)
- [QLDB Glossary (journal, digest, proof)](https://docs.aws.amazon.com/qldb/latest/developerguide/qldb-glossary.html)
- [Migrating from QLDB to Dolt](https://www.dolthub.com/blog/2024-08-22-migrating-from-qldb-to-dolt/)

### 5. Google Trillian and Certificate Transparency: The Gold Standard for Verifiable Logs

Google's Trillian is the most battle-tested verifiable log system in production, backing Certificate Transparency (one of the largest append-only logs on the internet).

**Architecture:**
- Append-only Merkle tree with signed tree heads (STH)
- gRPC service with pluggable storage (MySQL backend)
- Multi-tenant: one Trillian installation serves multiple independent logs
- Three verifiable data structures: Log (append-only), Map (key-value), Log-Backed Map (hybrid)

**Two types of proofs:**
1. **Inclusion proof:** Proves a specific record exists in the log (O(log n) hashes)
2. **Consistency proof:** Proves the log has only been appended to (no prior entries changed)

**Tile-based optimization (Russ Cox):** Instead of storing all intermediate Merkle hashes, split the tree into fixed-height tiles (height 4-8). Bottom rows are stored; upper rows recomputed on demand. Reduces storage by ~50%, makes HTTP responses cacheable. This is the approach used by Go's sumdb (module checksum database).

**RFC 6962 (now superseded by RFC 9162)** is the formal specification for Certificate Transparency logs.

**Relevance to Sherpa:** Trillian is massive infrastructure overkill for Sherpa's use case. But its design principles -- append-only log with Merkle proofs, signed tree heads, consistency checking -- are exactly what Sherpa needs at a smaller scale.

Sources:
- [Google Trillian GitHub](https://github.com/google/trillian)
- [Transparency.dev - Verifiable Data Structures](https://transparency.dev/verifiable-data-structures/)
- [Russ Cox, "Transparent Logs for Skeptical Clients"](https://research.swtch.com/tlog)
- [Go sumdb design proposal](https://go.googlesource.com/proposal/+/master/design/25530-sumdb.md)
- [Tile-Based Transparency Logs](https://transparency.dev/articles/tile-based-logs/)
- [RFC 6962 - Certificate Transparency](https://datatracker.ietf.org/doc/html/rfc6962)
- [Certificate Transparency - Wikipedia](https://en.wikipedia.org/wiki/Certificate_Transparency)

### 6. immudb: Embedded Immutable Database

immudb is the closest open-source analog to what Sherpa needs -- a lightweight, embeddable, tamper-evident database.

**Key properties:**
- Written in Go, supports embedded mode (library, not just server)
- Three interfaces: Key-Value, SQL, Document (JSON)
- Append-only with cryptographic Merkle tree verification
- External auditor component for independent verification
- Performance: 1.2-1.8M entries/second in benchmarks

**License concern:** Business Source License 1.1 -- source-available but requires commercial license for certain production uses. This is a potential blocker for Sherpa.

**Architecture:** Cryptographically-immutable append-only log as the core persistence layer, with a Merkle tree built over transactions. State is represented by a digest calculated during transaction commit. Supports inclusion proofs (specific entry exists) and consistency proofs (log hasn't been retroactively altered).

Sources:
- [immudb GitHub](https://github.com/codenotary/immudb)
- [immudb documentation](https://docs.immudb.io/master/immudb.html)
- [immudb.io](https://immudb.io/)
- [Deep dive into immudb internals](https://arriqaaq.medium.com/deep-dive-into-the-internals-of-an-immutable-database-immudb-3bdf9a0c2faa)

### 7. Microsoft SQL Server Ledger: Best Production Reference Architecture

SQL Server 2022's Ledger feature is the best-documented production implementation of tamper-evident tables in a relational database:

**How it works:**
1. Rows modified by a transaction are SHA-256 hashed using a Merkle tree, producing a transaction root hash
2. Transactions are themselves hashed together via Merkle tree, producing a block root hash
3. Each block is hashed with the previous block's root hash (hash chaining)
4. The result: a blockchain-like chain internal to the database

**Two table types:**
- **Updatable ledger tables:** Allow UPDATE/DELETE but automatically maintain a history table with previous values. System-generated ledger view joins current + history.
- **Append-only ledger tables:** Block UPDATE/DELETE at the API level. No history table needed.

**Digest management:** Root hashes (digests) are periodically exported to tamper-proof external storage (Azure Blob with WORM policy, Azure Confidential Ledger). Verification recomputes hashes from current data and compares against stored digests.

**Protection scope:** Protects against DBAs, sysadmins, and cloud admins who have direct access to modify database files. Detection is guaranteed; prevention requires external digest storage.

**Direct relevance to Sherpa:** SQL Server Ledger proves that Merkle-tree-backed hash chaining works inside a standard relational database engine. Sherpa can implement the same pattern in SQLite with application-level hashing.

Sources:
- [SQL Server Ledger Overview](https://learn.microsoft.com/en-us/sql/relational-databases/security/ledger/ledger-overview?view=sql-server-ver17)
- [SQL Server 2022 Ledger: Immutable Audit Trails (DZone)](https://dzone.com/articles/sql-server-ledger-tamper-evident-audit-trails)

### 8. Sigstore Rekor: Software Supply Chain Transparency Log

Sigstore's Rekor is a production transparency log for software artifact metadata, built on Trillian:

- Records signed metadata (artifact digest, signature, certificate) in an immutable, append-only ledger
- Provides inclusion proofs that can be "stapled" to artifacts
- External auditors monitor the log for consistency
- Public instance at rekor.sigstore.dev serves the open-source ecosystem
- Built on Trillian, requires Go + MySQL + Trillian infrastructure

**Relevance:** Demonstrates that transparency log principles work for governance metadata, not just certificates. Sherpa's governance actions (proposal submissions, approvals, authority grants) are analogous to Rekor's artifact attestations.

Sources:
- [Rekor GitHub](https://github.com/sigstore/rekor)
- [Rekor Overview](https://docs.sigstore.dev/logging/overview/)
- [Sigsum (minimal transparency log)](https://www.sigsum.org/getting-started/)

### 9. Git as a Hash-Chained Ledger (Limitations)

Git's commit graph is a Merkle DAG with content-addressable storage. Each commit hashes its tree, parent hash, author, and message. Modifying any commit changes its hash, cascading through all descendants.

**What Git provides:**
- Tamper-evidence for committed content (hash chain integrity)
- Content deduplication via content-addressable storage
- Efficient diff/merge operations

**What Git does NOT provide:**
- Immutability (force-push, rebase, and `git filter-branch` rewrite history)
- Append-only guarantees (commits can be pruned, branches deleted)
- Compact inclusion proofs (no Merkle tree over the commit log)

**Sherpa already uses Git** for initiative governance via the filesystem convention. The ledger layer would provide stronger guarantees than Git's commit graph for specific governance actions, because Git allows history rewriting while a properly implemented hash-chained ledger does not.

Sources:
- [Git Internals - Git Objects](https://git-scm.com/book/en/v2/Git-Internals-Git-Objects)
- [Is Git a Blockchain? (HN discussion)](https://news.ycombinator.com/item?id=9436847)
- [Merkle trees in Git and Bitcoin](https://initialcommit.com/blog/git-bitcoin-merkle-tree)

### 10. AuditableLLM: Hash Chains for AI Agent Governance

The AuditableLLM framework (Li et al., Electronics 2026) applies hash-chain-backed audit trails specifically to LLM governance -- directly relevant to Sherpa's agentic context:

- Decouples model update execution from audit/verification layer
- Each operation recorded as a hash-chained, tamper-evident audit entry
- Uses canonical JSON serialization with deterministic key ordering
- Performance overhead: 3.4 ms/step (5.7% slowdown), sub-second audit validation
- Supports third-party verification without access to model internals

**Direct relevance to Sherpa:** This paper validates that hash-chain audit trails for AI agent governance are viable with negligible performance overhead. The "decouple execution from audit" pattern maps directly to Sherpa's architecture -- governance actions happen in the coordination layer, audit entries are written to the ledger.

Sources:
- [AuditableLLM paper (MDPI Electronics)](https://www.mdpi.com/2079-9292/15/1/56)
- [Audit Trails for Accountability in LLMs (arxiv)](https://arxiv.org/html/2601.20727)

### 11. Dolt: Git-for-Data as Audit Trail

Dolt is a SQL database with Git-like versioning, positioned as a QLDB replacement after QLDB's deprecation:

- Every data modification recorded as a commit with metadata
- Full temporal queries at any point in database history
- DAG-based change tracking with branch/diff/merge capabilities
- Relational schema (unlike QLDB's document model)

**Trade-off:** Dolt provides rich versioning but not cryptographic tamper-evidence in the same way as hash-chained ledgers. It's version control for data, not a tamper-evident audit log.

Sources:
- [Migrating from QLDB to Dolt](https://www.dolthub.com/blog/2024-08-22-migrating-from-qldb-to-dolt/)

---

## Implications for Sherpa's Governance Ledger Design

### Recommended Architecture: SQLite + Application-Level Hash Chain

Based on this research, the simplest viable design for Sherpa:

**Layer 1: SQLite append-only table** with triggers preventing UPDATE/DELETE. Each row stores: event type, actor, resource, canonical JSON payload, previous hash, and entry hash.

**Layer 2: Application-level SHA-256 hashing** using Node.js `crypto.createHash('sha256')`. Hash is computed over canonical JSON (sorted keys) of the entry fields concatenated with the previous entry's hash. Genesis entry uses a well-known constant (e.g., `"GENESIS"` or `SHA-256("sherpa-ledger-v1")`).

**Layer 3 (optional, future): Merkle tree overlay.** If/when the ledger grows large or third-party auditing is needed, add a Merkle tree computed over batches of entries (similar to SQL Server Ledger's block structure). This can be added incrementally without changing the underlying hash chain.

**Layer 4 (optional, future): External digest anchoring.** Periodically export the latest root hash to an external location (Git commit message, signed file, cloud storage with WORM policy) for tamper-detection even if the SQLite file is replaced wholesale.

### Why This Over Alternatives

| Alternative | Why Not |
|-------------|---------|
| immudb | Go-only, BSL license, heavy dependency for embedded use |
| Trillian | Requires MySQL + gRPC server, massive overkill |
| Rekor | Requires Trillian + Go infrastructure |
| Dolt | No cryptographic tamper-evidence |
| Blockchain | Distributed consensus is unnecessary for single-workspace governance |
| QLDB | Discontinued; was a managed service dependency |
| JSONL file | No query capability, no concurrent access safety |

### What the Ledger Records

Every governance action in Sherpa should produce a ledger entry:

- **Proposal submissions** (proposal hash, author, target artifacts)
- **Approval/decline decisions** (decision, reviewer, rationale hash)
- **Authority grants** (resource, grantee, lease parameters)
- **Authority releases** (resource, holder, reason)
- **Permission checks** (actor, resource, operation, result)
- **State transitions** (initiative slug, old status, new status)
- **RBAC role assignments** (role, assignee, grantor)

### Concrete Next Step

Implement a `GovernanceLedger` class in `@sherpa/studio-core` with:

```typescript
interface LedgerEntry {
  id: string;              // UUIDv7
  timestamp: string;       // ISO-8601
  eventType: string;       // e.g., 'proposal.submitted', 'authority.granted'
  actorId: string;         // who performed the action
  resource?: string;       // what was acted upon
  payload: Record<string, unknown>;  // event-specific data
  prevHash: string;        // hash of previous entry (or GENESIS)
  entryHash: string;       // SHA-256(prevHash + canonical(entry))
}
```

---

## Open Questions

1. **Digest anchoring strategy:** Should Sherpa anchor ledger digests in Git commits (natural fit given the filesystem convention), in a separate signed file, or both? Git commits are already hash-chained but allow rewriting; a separate signed digest file is more explicit.

2. **Multi-workspace federation:** If two Sherpa workspaces need to verify each other's governance history, the single-workspace hash chain needs to become a signed, publishable artifact. This is the Certificate Transparency model -- is it premature to plan for it?

3. **Canonical serialization format:** JSON with sorted keys is simple but fragile (floating point representation, Unicode normalization). Should Sherpa adopt a more robust canonical form like Amazon Ion, CBOR, or JCS (JSON Canonicalization Scheme, RFC 8785)?

4. **Performance at scale:** The AuditableLLM paper reports 3.4 ms/step overhead. Is this acceptable for Sherpa's governance hot path (e.g., permission checks during MCP coordination)? Should permission checks be cached with periodic ledger verification rather than verified on every check?

5. **Merkle tree threshold:** At what entry count should Sherpa add a Merkle tree overlay? The Crosby-Wallach paper suggests Merkle proofs become materially better than hash chain traversal above ~10,000 entries. Is Sherpa likely to exceed this in a single workspace?

6. **Relationship to existing Git-based governance:** Sherpa already records governance state in filesystem artifacts tracked by Git. The ledger would be a parallel, more formal record. How do these two systems relate? Is the ledger the source of truth, with Git artifacts being projections, or vice versa?

---

## Sources

### Primary References
- [Building a Tamper-Evident Audit Log with SHA-256 Hash Chains](https://dev.to/veritaschain/building-a-tamper-evident-audit-log-with-sha-256-hash-chains-zero-dependencies-h0b) -- Zero-dependency implementation tutorial with canonical JSON, UUIDv7, verification
- [Crosby & Wallach, "Efficient Data Structures for Tamper-Evident Logging" (USENIX 2009)](https://static.usenix.org/event/sec09/tech/full_papers/crosby.pdf) -- Foundational academic paper; Merkle tree proofs for tamper-evident logs
- [Russ Cox, "Transparent Logs for Skeptical Clients"](https://research.swtch.com/tlog) -- Tile-based Merkle trees, Go sumdb design, client verification without trusting server
- [SQL Server Ledger Overview](https://learn.microsoft.com/en-us/sql/relational-databases/security/ledger/ledger-overview?view=sql-server-ver17) -- Best production reference for Merkle-tree-backed hash chains in a relational DB
- [AuditableLLM (MDPI Electronics 2026)](https://www.mdpi.com/2079-9292/15/1/56) -- Hash-chain audit for LLM governance, 3.4ms overhead, sub-second validation

### System Documentation
- [Google Trillian GitHub](https://github.com/google/trillian) -- Verifiable append-only log infrastructure
- [Transparency.dev - Verifiable Data Structures](https://transparency.dev/verifiable-data-structures/) -- Log, Map, Log-Backed Map explained
- [immudb GitHub](https://github.com/codenotary/immudb) -- Embedded immutable database (Go, BSL license)
- [immudb documentation](https://docs.immudb.io/master/immudb.html) -- Architecture, Merkle tree, auditor
- [Amazon QLDB Guide](https://qldbguide.com/guide/what-is-qldb/) -- Journal-first architecture, Ion documents, Merkle proofs
- [QLDB Glossary](https://docs.aws.amazon.com/qldb/latest/developerguide/qldb-glossary.html) -- Formal definitions of journal, block, digest, proof
- [Sigstore Rekor](https://github.com/sigstore/rekor) -- Software supply chain transparency log
- [Sigsum](https://www.sigsum.org/getting-started/) -- Minimal transparency log for signed checksums
- [Dolt as QLDB replacement](https://www.dolthub.com/blog/2024-08-22-migrating-from-qldb-to-dolt/) -- Git-for-data versioning

### Implementation References
- [Let's Make a Hash Chain in SQLite](https://www.viget.com/articles/lets-make-a-hash-chain-in-sqlite) -- SQLite CHECK constraints, sha1 extension, foreign key enforcement
- [SQLite and Blockchain: Storing Immutable Records](https://www.sqliteforum.com/p/sqlite-and-blockchain-storing-immutable) -- SQLite audit log schema, trigger-based immutability
- [Tamper-evident audit trails in PostgreSQL](https://appmaster.io/blog/tamper-evident-audit-trails-postgresql) -- pgcrypto, hash chain with triggers, verification queries, concurrency handling
- [Merkle Trees in SQLite with Python](https://dev.to/stephenc222/merkle-trees-in-sqlite-with-python-a-practical-tutorial-5d04) -- Practical tutorial
- [sqlite-hashes extension](https://github.com/nyurik/sqlite-hashes) -- SHA-256 function for SQLite (Rust-based)

### Standards and Specifications
- [RFC 6962 - Certificate Transparency](https://datatracker.ietf.org/doc/html/rfc6962) -- Original CT specification (now superseded by RFC 9162)
- [Go sumdb design proposal](https://go.googlesource.com/proposal/+/master/design/25530-sumdb.md) -- Tile-based transparency log for Go modules
- [Tile-Based Transparency Logs](https://transparency.dev/articles/tile-based-logs/) -- Tile optimization for Merkle trees

### Context and Analysis
- [AWS Discontinues QLDB (InfoQ)](https://www.infoq.com/news/2024/07/aws-kill-qldb/) -- QLDB EOL, market fit analysis, migration concerns
- [RIP Amazon QLDB (Alvaro Duran)](https://news.alvaroduran.com/p/if-amazon-cant-figure-out-how-to) -- Analysis of why QLDB failed commercially
- [Is AWS QLDB Built on Blockchain?](https://www.devoteam.com/expert-view/is-aws-qldb-built-on-blockchain-technology/) -- Architectural comparison
- [SQL Server Ledger: Tamper-Evident Logging (Medium)](https://rafaelrampineli.medium.com/sql-server-ledger-ensuring-tamper-evident-logging-for-data-integrity-23cf664cc597) -- Practical walkthrough
- [Hyperledger Fabric Ledger](https://hyperledger-fabric.readthedocs.io/en/latest/ledger/ledger.html) -- World state + blockchain journal architecture

### Git and Content-Addressable Storage
- [Git Internals - Git Objects](https://git-scm.com/book/en/v2/Git-Internals-Git-Objects) -- Content-addressable filesystem model
- [Is Git a Blockchain? (HN)](https://news.ycombinator.com/item?id=9436847) -- Community discussion of Git's Merkle DAG properties
- [Merkle trees in Git and Bitcoin](https://initialcommit.com/blog/git-bitcoin-merkle-tree) -- Structural comparison
- [Merkle DAGs (IPFS, Git)](https://rya-sge.github.io/access-denied/2025/04/09/merkle-dag/) -- DAG vs tree properties

---

## Raw Links

Every URL encountered during research, including those not fully explored:

- https://dev.to/veritaschain/building-a-tamper-evident-audit-log-with-sha-256-hash-chains-zero-dependencies-h0b
- https://appmaster.io/blog/tamper-evident-audit-trails-postgresql
- https://www.designgurus.io/answers/detail/how-do-you-design-tamperevident-audit-logs-merkle-trees-hashing
- https://www.sqliteforum.com/p/sqlite-and-blockchain-storing-immutable
- https://www.viget.com/articles/lets-make-a-hash-chain-in-sqlite
- https://static.usenix.org/event/sec09/tech/full_papers/crosby.pdf
- https://dev.to/stephenc222/merkle-trees-in-sqlite-with-python-a-practical-tutorial-5d04
- https://rafaelrampineli.medium.com/sql-server-ledger-ensuring-tamper-evident-logging-for-data-integrity-23cf664cc597
- https://transparency.dev/
- https://github.com/google/trillian
- https://google.github.io/trillian/docs/TransparentLogging.html
- https://transparency.dev/verifiable-data-structures/
- https://research.swtch.com/tlog
- https://github.com/codenotary/immudb
- https://immudb.io/
- https://docs.immudb.io/master/immudb.html
- https://arriqaaq.medium.com/deep-dive-into-the-internals-of-an-immutable-database-immudb-3bdf9a0c2faa
- https://docs.immudb.io/master/production/auditor.html
- https://aws.amazon.com/blogs/database/real-world-cryptographic-verification-with-amazon-qldb/
- https://aws.amazon.com/blogs/aws/now-available-amazon-quantum-ledger-database-qldb/
- https://qldbguide.com/guide/what-is-qldb/
- https://docs.aws.amazon.com/qldb/latest/developerguide/qldb-glossary.html
- https://www.infoq.com/news/2024/07/aws-kill-qldb/
- https://news.alvaroduran.com/p/if-amazon-cant-figure-out-how-to
- https://www.devoteam.com/expert-view/is-aws-qldb-built-on-blockchain-technology/
- https://www.dolthub.com/blog/2024-08-22-migrating-from-qldb-to-dolt/
- https://learn.microsoft.com/en-us/sql/relational-databases/security/ledger/ledger-overview?view=sql-server-ver17
- https://dzone.com/articles/sql-server-ledger-tamper-evident-audit-trails
- https://datatracker.ietf.org/doc/html/rfc6962
- https://en.wikipedia.org/wiki/Certificate_Transparency
- https://hyperledger-fabric.readthedocs.io/en/latest/ledger/ledger.html
- https://www.mdpi.com/2079-9292/15/1/56
- https://arxiv.org/html/2601.20727
- https://github.com/sigstore/rekor
- https://docs.sigstore.dev/logging/overview/
- https://www.sigsum.org/getting-started/
- https://go.googlesource.com/proposal/+/master/design/25530-sumdb.md
- https://pkg.go.dev/golang.org/x/mod/sumdb/tlog
- https://transparency.dev/articles/tile-based-logs/
- https://git-scm.com/book/en/v2/Git-Internals-Git-Objects
- https://news.ycombinator.com/item?id=9436847
- https://initialcommit.com/blog/git-bitcoin-merkle-tree
- https://rya-sge.github.io/access-denied/2025/04/09/merkle-dag/
- https://www.geeksforgeeks.org/dsa/merkle-tree-and-hash-chain-data-structures-with-difference/
- https://github.com/nyurik/sqlite-hashes
- https://antonz.org/sqlean-crypto/
- https://www.semanticscholar.org/paper/Efficient-Data-Structures-For-Tamper-Evident-Crosby-Wallach/8c3c1c111806c675f6ccaf31eb665d7daa248f2d
- https://courses.grainger.illinois.edu/cs563/fa2018/slides/cs563-12-paccagnella.pdf
- http://tamperevident.cs.rice.edu/Logging.html
- https://www.hubifi.com/blog/immutable-audit-log-basics
- https://oneuptime.com/blog/post/2026-02-06-immutable-audit-log-pipeline-otel/view
- https://docs.aws.amazon.com/qldb/latest/developerguide/API_GetRevision.html
- https://aws.amazon.com/blogs/database/replace-amazon-qldb-with-amazon-aurora-postgresql-for-audit-use-cases/
- https://wiki.postgresql.org/wiki/Audit_trigger
- https://nodejs.org/api/crypto.html
- https://sqlite.org/wal.html
- https://arxiv.org/pdf/2308.05557
