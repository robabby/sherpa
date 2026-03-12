# Optimistic Concurrency Control for File-Based Agentic Workflows

**Research iteration:** 2
**Date:** 2026-03-12
**Scope:** How can optimistic concurrency control (ETags, version vectors, CAS operations) be applied to file-based agentic workflows? What does a "409 Conflict" look like when an AI agent tries to update a file that another agent has modified?
**Methodology:** WebSearch and WebFetch used extensively. All claims are sourced with live URLs.

---

## Key Discoveries

### 1. HTTP ETags Are the Canonical Optimistic Concurrency Pattern — And They Map Directly to Files

The ETag (Entity Tag) pattern from HTTP is the cleanest mental model for filesystem optimistic concurrency. The flow is simple:

- **Read phase**: Agent reads a file. A hash (SHA-256, or even mtime+size) of the file content serves as the "ETag."
- **Work phase**: Agent processes the content, computes changes. No locks held.
- **Write phase**: Before writing, agent re-checks the hash. If it matches (the file hasn't changed), write proceeds. If it doesn't match, the write is rejected — this is the equivalent of HTTP `412 Precondition Failed`.

The exact HTTP flow, per Fideloper (https://fideloper.com/etags-and-optimistic-concurrency-control):
```
GET /resource → 200 OK, ETag: "abc123"
PUT /resource, If-Match: "abc123" → 200 OK (ETag matches, write succeeds)
PUT /resource, If-Match: "abc123" → 412 Precondition Failed (ETag stale, another writer changed it)
```

ETags can be generated from content hashes or from filesystem metadata. Apache generates them from inode + filesize + mtime. A simpler approach for Sherpa: SHA-256 of file content. This is deterministic and portable across filesystems. (https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/ETag)

**For Sherpa**: An MCP tool that wraps file writes could implement this pattern directly. `file_write(path, content, expected_hash)` — if the file's current hash doesn't match `expected_hash`, return a conflict error with the current content so the agent can re-read, re-merge, and retry.

### 2. AWS S3 Conditional Writes Are the Production-Grade Reference Implementation

AWS S3 added conditional writes (November 2024) that implement exactly this pattern for object storage. This is the closest production analogue to what Sherpa needs for files. (https://aws.amazon.com/about-aws/whats-new/2024/11/amazon-s3-functionality-conditional-writes/)

Key details from the S3 documentation (https://docs.aws.amazon.com/AmazonS3/latest/userguide/conditional-writes.html):

- **`If-Match` header**: Validates that an object's ETag matches before overwriting. Returns `412 Precondition Failed` on mismatch.
- **`If-None-Match: *` header**: Prevents overwriting an existing object (write-if-absent). Returns `412 Precondition Failed` if the object already exists.
- **`409 Conflict`**: Returned when a concurrent delete request completes before a conditional write.
- **`404 Not Found`**: Returned when the object is deleted before an If-Match write completes.

The S3 implementation has been described as "a compare-and-swap (CAS) operation" that "enables a form of optimistic concurrency control without locks." (https://medium.com/@emily80108/beyond-object-storage-simulating-acid-transactions-on-aws-s3-with-optimistic-locking-c3b1912f995a)

Simon Willison noted the significance: S3 conditional writes allow building multi-writer applications on a shared object store without external coordination. (https://simonwillison.net/2024/Nov/26/s3-conditional-writes/)

A more detailed AWS blog post explores building multi-writer applications using these primitives: https://aws.amazon.com/blogs/storage/building-multi-writer-applications-on-amazon-s3-using-native-controls/

**For Sherpa**: The S3 error codes provide an exact vocabulary for filesystem conflicts:
| S3 Status | Filesystem Equivalent | When It Happens |
|-----------|----------------------|-----------------|
| `412 Precondition Failed` | Hash mismatch | File changed since agent last read it |
| `409 Conflict` | File deleted during write | Another agent deleted the file while this one was writing |
| `404 Not Found` | File missing | File was deleted before conditional write attempted |
| `200 OK` | Hash matches, write succeeds | No concurrent modification |

### 3. Git IS Optimistic Concurrency Control — The Three-Way Merge Is the Conflict Detection Algorithm

Git's merge model is the most widely-deployed optimistic concurrency system in the world. Its mechanism maps precisely to the OCC pattern:

- **Read phase (clone/checkout)**: Each agent works on its own branch (or worktree — which Sherpa already uses).
- **Validate phase (merge)**: When an agent tries to merge back, Git performs a three-way merge using the common ancestor (base), the agent's version (ours), and the target branch (theirs).
- **Write phase (commit)**: If the merge succeeds (no conflicts), the write is committed. If it fails, the merge is aborted and the agent must resolve conflicts.

The three-way merge algorithm (https://blog.git-init.com/the-magic-of-3-way-merge/):
1. Find the merge-base — the most recent common ancestor of both branches.
2. Compare changes between base→ours and base→theirs.
3. If changes are in different files or different sections of the same file → auto-merge.
4. If both sides changed the same lines → conflict. Mark with `<<<<<<<`, `=======`, `>>>>>>>`.

Git operates at the **line level** as "unstructured merge" — it treats files as sequences of text lines, not structured data. This means it can't semantically merge YAML frontmatter fields, only detect textual conflicts. (https://git-scm.com/docs/merge-strategies)

DoltHub's analysis confirms that Git branches function as multi-version concurrency control (MVCC): "Git implements a safety-first MVCC, even though the two models usually occupy different worlds." Git branches isolate concurrent work like database transactions, and merge conflicts are the equivalent of transaction aborts. (https://www.dolthub.com/blog/2024-07-08-are-git-branches-mvcc/)

The `ort` merge strategy (default in modern Git) uses the histogram diff algorithm and can perform column-level merges for structured data — "two transactions touched different columns" of the same row can merge cleanly. (https://git-scm.com/docs/merge-strategies)

**For Sherpa**: Git worktrees already provide branch-per-agent isolation. The gap is that Git detects conflicts at merge time, not at write time. A real-time optimistic concurrency system would detect conflicts at the moment of write (like ETags), not deferred to a later merge step. Sherpa needs both: ETag-style immediate conflict detection for hot files (task boards, status files), and Git-style deferred merge for content files (research, proposals).

### 4. The Atomic Write-Then-Rename Pattern Is the Foundation for Filesystem CAS

Unix provides a well-established pattern for safe concurrent file writing (https://rcrowley.org/2010/01/06/things-unix-can-do-atomically.html):

1. Write to a temporary file in the same directory.
2. `fsync()` the temporary file (flush to disk).
3. `rename()` the temporary file to the target path (atomic on the same filesystem).
4. `fsync()` the parent directory.

The `rename()` syscall is atomic — the file at the target path is either the old version or the new version, never partially written. This pattern is used by: SQLite (WAL mode), Python's `atomicwrites` library, Rust's `tempfile` crate, and countless Unix daemons.

Key atomic operations on Unix (https://rcrowley.org/2010/01/06/things-unix-can-do-atomically.html):
- `rename(oldpath, newpath)` — atomic replacement if same filesystem
- `open(path, O_CREAT | O_EXCL)` — atomic create-if-not-exists (fails with `EEXIST` if the file already exists)
- `link(oldpath, newpath)` — atomic hard link creation (fails with `EEXIST`)
- `mkdir(path)` — atomic directory creation (fails with `EEXIST`)

The `O_CREAT | O_EXCL` pattern is particularly useful — it's a filesystem-level compare-and-swap for file creation. Only one process can successfully create a given path; all others get `EEXIST`. This is how filesystem-based leader election works.

**For Sherpa**: The write-then-rename pattern + content hash check = filesystem ETag system:
```
1. Read file, compute hash H1
2. Agent does work
3. Write new content to temp file
4. Re-read original file, compute hash H2
5. If H1 == H2: rename temp → original (atomic)
6. If H1 != H2: conflict detected, abort, return current content to agent
```

Python's `atomicwrites` library: https://python-atomicwrites.readthedocs.io/
Rust approach: https://users.rust-lang.org/t/how-to-write-replace-files-atomically/42821

### 5. Version Vectors Can Track Per-Agent File Modifications

Version vectors are used in distributed databases (Dynamo, Riak, Coda) to detect concurrent writes without a central coordinator. Each node maintains its own counter; when vectors are compared, the system can determine if one version causally dominates another, or if two versions are concurrent (conflicting). (https://martinfowler.com/articles/patterns-of-distributed-systems/version-vector.html)

The comparison algorithm for determining causal ordering:
- **V1 dominates V2** (V1 happened after V2): `V1[i] >= V2[i]` for all i, with at least one strict inequality.
- **V1 equals V2**: `V1[i] == V2[i]` for all i.
- **V1 and V2 are concurrent** (conflict): Neither dominates the other — some entries are higher in V1, some in V2.

Amazon Dynamo uses vector clocks to return "siblings" — all concurrent versions of a value — and forces the client to reconcile them. The Dynamo paper describes the core pattern: "If vector clocks of two versions are totally ordered, then conflict resolution is trivial. If they are not, Dynamo keeps both the versions and lets the application handle conflicts." (https://www.cs.cornell.edu/courses/cs5414/2017fa/papers/dynamo.pdf)

Riak improved on plain vector clocks with **Dotted Version Vectors (DVVs)**, which "identify each value with the update that created it" via a minimal vector clock called a "dot." This eliminates "sibling explosion" — the problem where vector clocks without dots generate exponentially growing conflict sets. (https://riak.com/products/riak-kv/dotted-version-vectors/index.html?p=10941.html, https://github.com/ricardobcl/Dotted-Version-Vectors)

Riak's conflict resolution documentation: https://docs.riak.com/riak/kv/latest/developing/usage/conflict-resolution/index.html
Vector clocks revisited (Riak engineering): https://riak.com/posts/technical/vector-clocks-revisited/index.html?p=9545.html

**For Sherpa**: A lightweight version vector for shared files could look like:
```yaml
# In YAML frontmatter or sidecar .version file
_version:
  planner: 3    # Planner agent has written this file 3 times
  worker-1: 1   # Worker-1 has written it once
  worker-2: 0   # Worker-2 has never written it
```
When an agent writes, it increments its own counter. On read, it captures the vector. On write, it compares its captured vector against the current one. If another agent's counter has increased, a conflict is detected. This works without a central coordinator and without locks.

### 6. SQLite's Locking Protocol Is a Graduated Pessimistic-to-Optimistic Hybrid

SQLite's file locking protocol is instructive as a filesystem-native concurrency model (https://sqlite.org/lockingv3.html):

Five lock states: UNLOCKED → SHARED → RESERVED → PENDING → EXCLUSIVE.

Key insight: The **RESERVED** lock is SQLite's optimistic concurrency mechanism. It signals "I intend to write" without blocking readers. Multiple readers (SHARED) can coexist with one RESERVED holder. The writer only escalates to EXCLUSIVE when it's ready to commit. This is pessimistic in structure but optimistic in spirit — it assumes reads won't conflict with a pending write.

SQLite's experimental **BEGIN CONCURRENT** extension goes fully optimistic (https://www.sqlite.org/src/doc/begin-concurrent/doc/begin_concurrent.md):
- Multiple writers execute transactions simultaneously.
- Conflict detection happens at **page level** at commit time.
- If two transactions modified the same database page, the second to commit gets `SQLITE_BUSY_SNAPSHOT`.
- Two transactions writing to different tables NEVER conflict (separate B-tree pages).
- Two transactions writing to the same table only conflict if keys are "fairly close together" (stored on the same page).

The page-level granularity is a useful design insight. For files, the analogous granularity levels would be: whole-file (simplest), section/block (e.g., YAML frontmatter vs. body), or line-level (git-style). Each level trades detection precision against implementation complexity.

### 7. Collaborative Editing Systems Show the Full Spectrum of Conflict Resolution

Three production approaches exist, each with distinct trade-offs:

**Operational Transformation (OT) — Google Docs**:
- Central server transforms concurrent operations to maintain consistency.
- Google Docs had a bug in 2016 where "deleted characters reappeared during high-concurrency editing" because "transformation functions didn't handle three-way conflicts correctly when operations arrived out of causal order."
- OT requires a central server, which adds minimal latency (< 5ms) but dramatically simplifies the data model.
- References: https://dev.to/dhanush___b/how-google-docs-uses-operational-transformation-for-real-time-collaboration-119, https://sderay.com/google-docs-architecture-real-time-collaboration/

**CRDTs — Figma, Automerge, Yjs**:
- No central server required. Each client maintains a replica. Merges are deterministic.
- Figma discovered documents with "10+ million tombstones from deleted shapes, each 32 bytes, causing files to become gigabytes." They implemented aggressive compaction. (https://www.figma.com/blog/how-figmas-multiplayer-technology-works/)
- Automerge is a "JSON-like data structure (a CRDT) that can be modified concurrently by different users, and merged again automatically." Changes to different map keys merge cleanly; changes to the same key use deterministic conflict resolution. (https://github.com/automerge/automerge)
- Yjs is the most popular CRDT library for text editing, supporting rich data types. (https://github.com/yjs/yjs)
- A basic string CRDT adds 16-32 bytes of metadata per character, causing a 10,000-character document to balloon from 10KB to 320KB.
- CRDT implementations list: https://crdt.tech/implementations

**Hybrid — Notion**:
- Notion uses "CRDT for structure, OT for text within blocks." (https://www.notion.com/blog/data-model-behind-notion)
- Everything is a block. "If two users edit different blocks, their changes can be applied independently. If they edit the same block, the system must resolve conflicts predictably, often using last-writer-wins or field-level merges."
- Real-time updates via WebSocket connections; local caching in SQLite/IndexedDB.

**For Sherpa**: Full OT or CRDT is almost certainly overkill for file-based agent workflows. Agents don't need character-level collaborative editing. The relevant patterns are:
- **Block/section-level conflict detection** (like Notion's block model) — YAML frontmatter is one "block," each markdown section is another.
- **Field-level merging** for structured data — if one agent changes `status: pending` to `status: in-progress` and another changes `updated: 2026-03-11` to `updated: 2026-03-12`, those are independent field changes that can auto-merge.
- **Last-writer-wins** as the default resolution for truly concurrent conflicts on the same field.

### 8. Existing Multi-Agent Frameworks Are Just Now Addressing File Concurrency

The MCP (Model Context Protocol) ecosystem is actively working on this problem:

**SEP-1708: MCP Client-Brokered Filesystem Access** (https://github.com/modelcontextprotocol/modelcontextprotocol/issues/1708):
- Proposes exclusive file locking for MCP servers.
- Operations acquire exclusive locks during execution.
- `keepLocked: true` parameter for persistent locks with a `lockId`.
- Locked files return `FILE_LOCKED (-32100)` errors.
- This is **pessimistic locking** — the opposite of what we're researching.

**Agent-MCP** (https://github.com/rinadelph/Agent-MCP):
- File-level locking and task assignment prevent agents from stepping on each other's work.
- When an agent requests work, the system finds the next available task with no file conflicts.
- System locks relevant files; other agents automatically receive different assignments.
- This is also pessimistic — lock-then-work, not work-then-validate.

**MCP Agent Mail** (https://github.com/Dicklesworthstone/mcp_agent_mail):
- Uses **advisory file reservations** (leases) rather than hard locks.
- Agents "signal intent" via reservation files (Git-backed JSON under `file_reservations/`).
- Optional pre-commit guard blocks commits that violate active exclusive reservations.
- This is a hybrid — advisory (optimistic in spirit) but exclusive (pessimistic in mechanism).

**tick-md** (https://purplehorizons.io/blog/tick-md-multi-agent-coordination-markdown):
- Single TICK.md file tracked by Git.
- File locking when an agent claims a task.
- Git provides full audit trail of every state change.

**Three-File Pattern** (https://earezki.com/ai-news/2026-03-09-the-state-management-pattern-that-runs-our-5-agent-system-24-7/):
- `current-task.json`, `memory/today.md`, `MEMORY.md`.
- Achieves idempotency through status checking before execution.
- Filesystem as "message bus" — no complex orchestration.

**Filesystem-Based Agent State pattern** (https://agentic-patterns.com/patterns/filesystem-based-agent-state/):
- Acknowledges "concurrent access needs coordination (file locking, atomic writes)" but **does not specify mechanisms**.
- Recommends atomic writes (write to temp, then rename) and timestamps/version info in state files.
- Leaves concurrent access as "an unresolved implementation detail."

**Key finding: No existing multi-agent framework implements true optimistic concurrency control for file-based state.** They all use either pessimistic locking (MCP SEP-1708, Agent-MCP), advisory signaling (MCP Agent Mail), or simply acknowledge the problem without solving it. This is an open design space.

### 9. Terraform State Locking Shows What Happens Without Concurrency Control

Terraform's state management provides a cautionary tale (https://medium.com/@sampark02/terraform-state-file-locking-preventing-conflicts-in-infrastructure-management-ff0f819a8e1f):
- Without locking, "two engineers running terraform apply at the same time, one overwrites the other's changes, resulting in state corruption."
- Terraform originally used DynamoDB for lock coordination (pessimistic locking).
- S3 backend now supports native locking via `.tflock` files — an optimistic-ish approach using S3 conditional writes. (https://rafaelmedeiros94.medium.com/goodbye-dynamodb-terraform-s3-backend-now-supports-native-locking-06f74037ad39)
- Stale locks from crashed processes are the primary failure mode, requiring `terraform force-unlock`.

**For Sherpa**: Agent crashes are the equivalent of Terraform operator disconnects. Any locking scheme must handle stale locks — either via TTLs (locks expire after N seconds), heartbeats (agents periodically renew locks), or detection (coordinator notices agent is unresponsive and releases locks).

### 10. GitOps Reconciliation Loops Are an Existing Pattern for Desired-State Convergence

GitOps controllers (ArgoCD, Flux CD) implement a reconciliation pattern directly applicable to multi-agent file coordination (https://beautifulcode.co/articles/pull-based-reconciliation-gitops-inverts-deployment-models):
- Git is the single source of truth (desired state).
- Controller continuously compares Git state against actual state (cluster).
- Drift is detected via hash-based diffing every 3-5 minutes.
- When drift is found, the controller converges actual state to desired state.
- Manual changes are overwritten — Git always wins.

**For Sherpa**: A "reconciliation agent" could periodically check that shared state files match their expected versions. If an agent's uncommitted changes conflict with the canonical state, the reconciliation agent could flag the conflict rather than silently overwriting.

---

## Implications for Sherpa's Filesystem-Based Multi-Agent Coordination

### The Design Space

Based on this research, Sherpa's concurrency control should operate at three levels:

**Level 1 — File-Level ETags (Immediate)**
An MCP tool wrapper that implements conditional writes:
```typescript
interface ConditionalWrite {
  path: string;
  content: string;
  expectedHash: string;  // SHA-256 of content at read time
}

interface WriteResult {
  success: boolean;
  status: 200 | 409 | 412 | 404;
  currentHash?: string;    // If conflict, the current hash
  currentContent?: string; // If conflict, the current content
}
```
This gives agents immediate feedback: "your write was rejected because the file changed." The agent can then re-read, re-merge, and retry.

**Level 2 — Structured Merge for YAML/Frontmatter (Smart)**
Rather than treating files as opaque blobs (whole-file ETags), parse structured data and detect field-level conflicts:
- Two agents change different YAML frontmatter fields → auto-merge.
- Two agents change the same field → conflict (return both values, let agent or human decide).
- One agent changes frontmatter, another changes body → auto-merge.

This is analogous to Notion's block-level conflict detection and Git's hunk-level merge.

**Level 3 — Git Branch-Per-Agent (Deferred)**
Sherpa already uses worktrees. Each agent works on its own branch. Conflicts are detected at merge time via Git's three-way merge. This handles the long-running case where multiple agents work on different aspects of the same initiative over multiple sessions.

### What a "409 Conflict" Looks Like for an AI Agent

When Agent A tries to write a file that Agent B has modified:

```
Agent A reads proposal.md (hash: abc123)
Agent A works for 5 minutes on changes
Agent A attempts to write proposal.md with expectedHash: abc123
MCP server checks: current hash is def456 (Agent B wrote in the meantime)

Response to Agent A:
{
  "status": 412,
  "error": "PRECONDITION_FAILED",
  "message": "File modified by another agent since your last read",
  "path": "docs/initiatives/my-initiative/proposal.md",
  "your_expected_hash": "abc123",
  "current_hash": "def456",
  "current_content": "... (the file as Agent B left it) ...",
  "last_modified_by": "worker-1",
  "last_modified_at": "2026-03-12T10:45:00Z"
}
```

The agent then has three options:
1. **Re-read and retry**: Read the current version, recompute changes, attempt write again.
2. **Merge and retry**: Compute a three-way merge of (original read, current version, intended write) and attempt the merged result.
3. **Escalate**: Report the conflict to the coordinator agent or human for resolution.

### Version Vector Design for Sherpa

A lightweight version vector stored in YAML frontmatter or a sidecar `.meta` file:

```yaml
# proposal.md frontmatter extension
_agents:
  planner: {v: 3, last: "2026-03-12T09:00:00Z"}
  worker-1: {v: 1, last: "2026-03-12T10:45:00Z"}
  judge: {v: 0}
```

Comparison rules:
- Agent reads file, captures `_agents` vector.
- Agent writes file, increments its own counter.
- Before write, compare captured vector against current vector.
- If any other agent's counter has increased → conflict detected.
- If no counters changed except possibly the writing agent's → safe to write.

This eliminates the need for content hashing (which can be expensive for large files) and provides provenance tracking for free.

---

## Sources

### Primary Technical References
- [ETags and Optimistic Concurrency Control (Fideloper)](https://fideloper.com/etags-and-optimistic-concurrency-control) — Complete HTTP ETag flow with examples of 412 responses
- [Optimistic Concurrency Control with ETags (Zeitbach)](https://zeitbach.com/blog/2024/01/26/optimistic-concurrency-control-with-etags) — ETag implementation patterns
- [Optimistic Locking Made Easy: ETags in Action (Martin Carstenbach, Feb 2026)](https://martincarstenbach.com/2026/02/03/optimistic-locking-made-easy-the-power-of-etags-in-action/) — Recent practical guide
- [ETag header - HTTP | MDN](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/ETag) — Canonical ETag specification reference
- [HTTP ETag - Wikipedia](https://en.wikipedia.org/wiki/HTTP_ETag) — Overview with strong vs. weak ETag distinction
- [Ed-Fi: Handling Optimistic Concurrency with ETags](https://docs.ed-fi.org/reference/data-exchange/api-guidelines/design-and-implementation-guidelines/api-implementation-guidelines/handling-optimistic-concurrency-with-etags/) — API guideline implementation
- [ETag 101: Tips and Tricks (AirAsia Tech Blog)](https://medium.com/airasia-com-tech-blog/etag-101-tips-and-tricks-for-implementation-6072525b487b) — Practical implementation tips
- [HTTP Caching with ETag and If-None-Match (BugFactory)](https://bugfactory.io/articles/http-caching-with-etag-and-if-none-match-headers/) — Caching mechanics

### AWS S3 Conditional Writes
- [Amazon S3 adds conditional writes (Nov 2024)](https://aws.amazon.com/about-aws/whats-new/2024/11/amazon-s3-functionality-conditional-writes/) — Announcement
- [S3 Conditional Writes Documentation](https://docs.aws.amazon.com/AmazonS3/latest/userguide/conditional-writes.html) — Official docs with If-Match/If-None-Match details and error codes
- [Building Multi-Writer Applications on S3 (AWS Blog)](https://aws.amazon.com/blogs/storage/building-multi-writer-applications-on-amazon-s3-using-native-controls/) — Architecture patterns
- [Beyond Object Storage: Simulating ACID on S3 (Emily Chen)](https://medium.com/@emily80108/beyond-object-storage-simulating-acid-transactions-on-aws-s3-with-optimistic-locking-c3b1912f995a) — CAS pattern analysis
- [S3 Conditional Writes (Simon Willison)](https://simonwillison.net/2024/Nov/26/s3-conditional-writes/) — Commentary on significance
- [S3 as Strongly Consistent Event Store (Architecture Weekly)](https://www.architecture-weekly.com/p/using-s3-but-not-the-way-you-expected) — Advanced S3 concurrency patterns
- [AWS S3 Writes with Conditional Requests in TypeScript (PureLogics)](https://purelogics.com/aws-s3-writes-with-conditional-request/) — TypeScript implementation
- [Enforce Conditional Writes on S3 Buckets](https://docs.aws.amazon.com/AmazonS3/latest/userguide/conditional-writes-enforce.html) — Bucket policy enforcement
- [S3 Conditional Reads](https://docs.aws.amazon.com/AmazonS3/latest/userguide/conditional-reads.html) — Read-side conditional requests
- [Managing Concurrency in Azure Storage](https://azure.microsoft.com/en-us/blog/managing-concurrency-in-microsoft-azure-storage-2/) — Azure equivalent of S3 conditional writes
- [Azure Blob Storage Concurrency](https://learn.microsoft.com/en-us/azure/storage/blobs/concurrency-manage) — Azure ETag-based concurrency

### Git as Optimistic Concurrency
- [The Magic of 3-Way Merge](https://blog.git-init.com/the-magic-of-3-way-merge/) — Detailed explanation of three-way merge algorithm
- [Are Git Branches MVCC? (DoltHub)](https://www.dolthub.com/blog/2024-07-08-are-git-branches-mvcc/) — Git branches as multi-version concurrency control
- [Applying Git and OCC to Data-Oriented Programming (Klipse)](https://blog.klipse.tech/databook/2020/12/18/occ-do-git.html) — Git as OCC analogy for data programming
- [Git merge-strategies documentation](https://git-scm.com/docs/merge-strategies) — Official merge strategy reference
- [Git merge documentation](https://git-scm.com/docs/git-merge) — Official merge command reference
- [Git merge strategy options (Atlassian)](https://www.atlassian.com/git/tutorials/using-branches/merge-strategy) — Practical merge strategy guide
- [Three Way Merge (AlgoMaster)](https://algomaster.io/learn/git/three-way-merge) — Algorithm walkthrough
- [Two-way and three-way merges explained (Gearset)](https://docs.gearset.com/en/articles/9325332-two-way-and-three-way-merges-explained) — Comparison of merge approaches
- [Merge Conflicts and Resolutions in Git-Based Open Source Projects (Springer CSCW)](https://link.springer.com/article/10.1007/s10606-018-9323-3) — Academic analysis of conflict patterns
- [Mergetools: Stop doing three-way merges!](https://www.eseth.org/2020/mergetools.html) — Critique of three-way merge tooling
- [The Patience Diff Algorithm (James Coglan)](https://blog.jcoglan.com/2017/09/19/the-patience-diff-algorithm/) — Diff algorithm used in Git merges
- [threeway-merge-rs (GitHub)](https://github.com/levish0/threeway-merge-rs) — Rust implementation of Git-style 3-way merge
- [Git Source Code Review: Diff Algorithms (Fabien Sanglard)](https://fabiensanglard.net/git_code_review/diff.php) — Deep dive into Git's diff implementation
- [Analyzing Git Diff and Merge Behavior (arXiv)](https://www.arxiv.org/pdf/2507.22071) — Academic evaluation of diff algorithms

### Version Vectors and Vector Clocks
- [Version Vector (Martin Fowler / Patterns of Distributed Systems)](https://martinfowler.com/articles/patterns-of-distributed-systems/version-vector.html) — Canonical pattern description
- [Version Vector - Wikipedia](https://en.wikipedia.org/wiki/Version_vector) — Overview with formal definition
- [Vector Clock - Wikipedia](https://en.wikipedia.org/wiki/Vector_clock) — Related concept
- [Vector Clocks in Distributed Systems (GeeksforGeeks)](https://www.geeksforgeeks.org/computer-networks/vector-clocks-in-distributed-systems/) — Tutorial with comparison algorithm
- [Vector Clocks and Conflicting Data (Design Gurus)](https://www.designgurus.io/course-play/grokking-the-advanced-system-design-interview/doc/vector-clocks-and-conflicting-data) — System design perspective
- [Understanding Version Vectors (Educative)](https://www.educative.io/courses/distributed-systems-practitioners/version-vectors) — Detailed comparison with vector clocks
- [Dynamo Paper (Cornell CS)](https://www.cs.cornell.edu/courses/cs5414/2017fa/papers/dynamo.pdf) — Original Amazon Dynamo paper
- [Understanding Amazon Dynamo (DEV Community)](https://dev.to/piyushjajoo/understanding-amazon-dynamo-a-deep-dive-into-distributed-system-design-5a49) — Dynamo deep dive
- [Dynamo Paper Review (Abdul Apopoola)](https://abdulapopoola.com/2024/07/17/paper-review-dynamo-amazons-highly-available-key-value-store/) — Paper review
- [Consistency and Availability in Dynamo (Paper Trail)](https://www.the-paper-trail.org/post/2008-08-26-consistency-and-availability-in-amazons-dynamo/) — Analysis of Dynamo trade-offs
- [Eventual Consistency and Conflict Resolution Part 2](https://www.mydistributed.systems/2022/02/eventual-consistency-part-2.html) — Conflict resolution patterns
- [Riak Conflict Resolution](https://docs.riak.com/riak/kv/latest/developing/usage/conflict-resolution/index.html) — Riak's sibling resolution docs
- [Dotted Version Vectors (Riak)](https://riak.com/products/riak-kv/dotted-version-vectors/index.html?p=10941.html) — DVV explanation
- [Dotted Version Vectors (GitHub)](https://github.com/ricardobcl/Dotted-Version-Vectors) — DVV implementation
- [Vector Clocks Revisited Part 2: DVVs (Riak)](https://riak.com/posts/technical/vector-clocks-revisited-part-2-dotted-version-vectors/index.html?p=9929.html) — Why DVVs improve on vector clocks
- [Vector Clocks Revisited (Riak)](https://riak.com/posts/technical/vector-clocks-revisited/index.html?p=9545.html) — Engineering perspective
- [Riak Distributed Data Types](https://riak.com/products/riak-kv/riak-distributed-data-types/) — CRDT types in Riak
- [Causal Context (Riak docs)](https://docs.riak.com/riak/kv/latest/learn/concepts/causal-context/index.html) — Causal context in Riak
- [Why Logical Clocks are Easy (ACM Queue)](https://queue.acm.org/detail.cfm?id=2917756) — Accessible overview of logical clocks
- [Causality Is Expensive (Peter Bailis)](http://www.bailis.org/blog/causality-is-expensive-and-what-to-do-about-it/) — Trade-offs in causal tracking
- [How to Create Vector Clocks](https://oneuptime.com/blog/post/2026-01-30-vector-clocks/view) — Recent tutorial

### CAS and Atomic Filesystem Operations
- [Things UNIX Can Do Atomically (Crowley)](https://rcrowley.org/2010/01/06/things-unix-can-do-atomically.html) — Definitive reference on atomic Unix operations
- [Things Unix Can Do Atomically (HN discussion)](https://news.ycombinator.com/item?id=11803431) — Community discussion with edge cases
- [Compare-and-Swap - Wikipedia](https://en.wikipedia.org/wiki/Compare-and-swap) — CAS operation definition
- [Lockless Patterns: Introduction to CAS (LWN.net)](https://lwn.net/Articles/847973/) — CAS in lock-free programming
- [A Way to Do Atomic Writes (LWN.net)](https://lwn.net/Articles/789600/) — Linux kernel atomic write proposals
- [python-atomicwrites documentation](https://python-atomicwrites.readthedocs.io/) — Python atomic write library
- [atomicwrites (PyPI)](https://pypi.org/project/atomicwrites/) — Python package
- [python-atomicwrites (GitHub)](https://github.com/untitaker/python-atomicwrites) — Source code
- [Atomic File Writing in Python (ActiveState)](https://code.activestate.com/recipes/579097-safely-and-atomically-write-to-a-file/) — Recipe
- [Better File Writing in Python: Atomic Updates (Medium)](https://sahmanish20.medium.com/better-file-writing-in-python-embrace-atomic-updates-593843bfab4f) — Tutorial
- [Atomic File Operations in Rust (Forum)](https://users.rust-lang.org/t/how-to-write-replace-files-atomically/42821) — Rust discussion
- [Stop Silent Data Loss: Checksum + Atomic Writes](https://tech-champion.com/data-science/stop-silent-data-loss-checksum-atomic-writes-temp-file-patterns/) — Combined checksum + atomic write patterns
- [Enhancing File System Integrity Through Checksums](https://www.filesystems.org/docs/nc-checksum-tr/nc-checksum.html) — Academic treatment
- [Content-Addressable Storage (CAS) - Wikipedia](https://en.wikipedia.org/wiki/Content-addressable_storage) — CAS as version control primitive
- [Content-Addressable Storage (Abilian)](https://lab.abilian.com/Tech/Databases%20&%20Persistence/Content%20Addressable%20Storage%20(CAS)/) — CAS overview

### File Locking
- [File Locking and Concurrency in SQLite Version 3](https://sqlite.org/lockingv3.html) — SQLite's five lock states
- [SQLite BEGIN CONCURRENT](https://www.sqlite.org/src/doc/begin-concurrent/doc/begin_concurrent.md) — Optimistic page-level locking extension
- [SQLite WAL Mode](https://sqlite.org/wal.html) — Write-ahead logging for concurrent reads
- [Concurrent Write Transactions in SQLite (Oldmoe)](https://oldmoe.blog/2024/07/08/the-write-stuff-concurrent-write-transactions-in-sqlite/) — Analysis of BEGIN CONCURRENT
- [How SQLite Scales Read Concurrency (Fly.io)](https://fly.io/blog/sqlite-internals-wal/) — WAL internals
- [Abusing SQLite for Concurrency (SkyPilot)](https://blog.skypilot.co/abusing-sqlite-to-handle-concurrency/) — Creative SQLite concurrency patterns
- [Turso Concurrent Writes](https://turso.tech/blog/beyond-the-single-writer-limitation-with-tursos-concurrent-writes) — MVCC for SQLite
- [How Turso Eliminates SQLite's Single-Writer Bottleneck (Better Stack)](https://betterstack.com/community/guides/databases/turso-explained/) — Turso explanation
- [File Locking in Linux (gavv.net)](https://gavv.net/articles/file-locks/) — Comprehensive Linux file locking guide
- [On the Brokenness of File Locking](http://0pointer.de/blog/projects/locking.html) — Why file locking is hard
- [flock(2) - Linux manual page](https://man7.org/linux/man-pages/man2/flock.2.html) — flock syscall reference
- [File Locking - Wikipedia](https://en.wikipedia.org/wiki/File_locking) — Overview of advisory vs. mandatory locking
- [Introduction to File Locking in Linux (Baeldung)](https://www.baeldung.com/linux/file-locking) — Tutorial

### Collaborative Editing and CRDTs
- [CRDTs vs OT: How Google Docs Handles Collaborative Editing (SystemDR)](https://systemdr.substack.com/p/crdts-vs-operational-transformation) — Comparison with trade-offs
- [Google Docs Architecture: OT vs CRDTs (SDERay)](https://sderay.com/google-docs-architecture-real-time-collaboration/) — Architecture analysis
- [How Google Docs Uses OT (DEV Community)](https://dev.to/dhanush___b/how-google-docs-uses-operational-transformation-for-real-time-collaboration-119) — OT tutorial
- [How to Implement Operational Transformation](https://oneuptime.com/blog/post/2026-01-30-operational-transformation/view) — Implementation guide
- [How Figma's Multiplayer Technology Works](https://www.figma.com/blog/how-figmas-multiplayer-technology-works/) — Figma's CRDT approach
- [Notion Data Model: Block-Based Architecture](https://www.notion.com/blog/data-model-behind-notion) — Notion's hybrid approach
- [Notion System Design (Educative)](https://www.educative.io/blog/notion-system-design) — System design analysis
- [Automerge (GitHub)](https://github.com/automerge/automerge) — JSON CRDT library
- [Understanding CRDTs in Automerge](https://cran.r-project.org/web/packages/automerge/vignettes/crdt-concepts.html) — CRDT concepts explained
- [Yjs (GitHub)](https://github.com/yjs/yjs) — Text CRDT library
- [CRDT Implementations (crdt.tech)](https://crdt.tech/implementations) — Comprehensive list
- [CRDT Implementation Guide (Velt, Dec 2025)](https://velt.dev/blog/crdt-implementation-guide-conflict-free-apps) — Recent implementation guide
- [awesome-crdt (GitHub)](https://github.com/alangibson/awesome-crdt) — CRDT resource collection
- [Building Real-Time Collaboration: OT vs CRDT (TinyMCE)](https://www.tiny.cloud/blog/real-time-collaboration-ot-vs-crdt/) — Practical comparison
- [OT and CRDTs (DEV Community)](https://dev.to/arghya_majumder/operational-transformation-ot-and-crdts-real-time-collaboration-systems-kdd) — Side-by-side comparison
- [Building Collaborative Interfaces: OT vs CRDTs (DEV Community)](https://dev.to/puritanic/building-collaborative-interfaces-operational-transforms-vs-crdts-2obo) — Developer guide
- [Data Laced with History: Causal Trees & Operational CRDTs](http://archagon.net/blog/2018/03/24/data-laced-with-history/) — Deep technical dive
- [Introduction to State-Based CRDTs (Bartosz Sypytkowski)](https://www.bartoszsypytkowski.com/the-state-of-a-state-based-crdts/) — State-based CRDTs explained
- [CRDT Tutorial for Beginners (GitHub)](https://github.com/ljwagerfield/crdt) — Accessible CRDT tutorial
- [Building a Decentralized Collaborative Text Editor (HiveMQ)](https://www.hivemq.com/blog/decentralized-collaborative-text-editor-using-mqtt-crdts/) — MQTT + CRDT

### Multi-Agent Coordination and File State
- [SEP-1708: MCP Client-Brokered Filesystem Access](https://github.com/modelcontextprotocol/modelcontextprotocol/issues/1708) — MCP filesystem access proposal with file locking
- [Agent-MCP (GitHub)](https://github.com/rinadelph/Agent-MCP) — Multi-agent coordination framework
- [MCP Agent Mail (GitHub)](https://github.com/Dicklesworthstone/mcp_agent_mail) — Advisory file leases for agent coordination
- [tick-md: Multi-Agent Coordination with Markdown](https://purplehorizons.io/blog/tick-md-multi-agent-coordination-markdown) — Single-file coordination
- [Multi-Agent Coordination MCP Server (GitHub)](https://github.com/AndrewDavidRivers/multi-agent-coordination-mcp) — MCP coordinator
- [Three-File State Management Pattern](https://earezki.com/ai-news/2026-03-09-the-state-management-pattern-that-runs-our-5-agent-system-24-7/) — Production 5-agent state pattern
- [Filesystem-Based Agent State (Agentic Patterns)](https://agentic-patterns.com/patterns/filesystem-based-agent-state/) — Pattern catalog entry
- [Advanced AI Agents with File Access (FlowHunt)](https://www.flowhunt.io/blog/advanced-ai-agents-with-file-access-mastering-context-offloading-and-state-management/) — Context offloading patterns
- [Implementing MCP in Multi-Agent AI Platforms (ML Journey)](https://mljourney.com/implementing-mcp-in-multi-agent-ai-platforms/) — MCP multi-agent integration
- [Orchestrating Multi-Agent Intelligence: MCP-Driven Patterns (Microsoft)](https://techcommunity.microsoft.com/blog/azuredevcommunityblog/orchestrating-multi-agent-intelligence-mcp-driven-patterns-in-agent-framework/4462150) — Microsoft Agent Framework MCP patterns
- [Advancing Multi-Agent Systems Through MCP (arXiv)](https://arxiv.org/html/2504.21030v1) — Academic paper on MCP multi-agent
- [AgentSpawn: Adaptive Multi-Agent Collaboration (arXiv)](https://www.arxiv.org/pdf/2602.07072) — Lock-free optimistic concurrency for agents
- [Conflict Resolution for Multi-Agents (The Unwind AI)](https://www.theunwindai.com/p/conflict-resolution-for-multi-agents) — Conflict resolution overview
- [How Multi-Agent Systems Manage Conflict (Zilliz)](https://zilliz.com/ai-faq/how-do-multiagent-systems-manage-conflict-resolution) — FAQ on conflict resolution
- [Multi-Agent AI Development: Architecture and Patterns (SitePoint)](https://www.sitepoint.com/multi-agent-ai-development-architecture/) — Architecture patterns
- [Memory in LLM-based Multi-Agent Systems (TechRxiv)](https://www.techrxiv.org/users/1007269/articles/1367390/master/file/data/LLM_MAS_Memory_Survey_preprint_/LLM_MAS_Memory_Survey_preprint_.pdf) — Survey of memory mechanisms
- [Multi-Agent Error Trap (Towards Data Science)](https://towardsdatascience.com/why-your-multi-agent-system-is-failing-escaping-the-17x-error-trap-of-the-bag-of-agents/) — Coordination failure patterns
- [State of Agent Engineering (LangChain)](https://www.langchain.com/state-of-agent-engineering) — Industry survey

### CI/CD and Infrastructure Concurrency
- [Terraform State Locking (Sampark Mehrotra)](https://medium.com/@sampark02/terraform-state-file-locking-preventing-conflicts-in-infrastructure-management-ff0f819a8e1f) — State locking explanation
- [Terraform S3 Backend Native Locking (Rafael Medeiros)](https://rafaelmedeiros94.medium.com/goodbye-dynamodb-terraform-s3-backend-now-supports-native-locking-06f74037ad39) — S3-native lock files
- [Terraform State Locking Implementation](https://oneuptime.com/blog/post/2026-01-27-terraform-state-locking/view) — Implementation guide
- [Fix Terraform State Lock Error](https://oneuptime.com/blog/post/2026-02-12-fix-terraform-error-acquiring-state-lock/view) — Stale lock recovery
- [DynamoDB Locking Mechanism for Terraform (Sandeep Nayak)](https://medium.com/@wd.sandeepnayak/terraform-locking-state-mechanism-using-dynamodb-lockid-b43298ae7489) — DynamoDB lock details
- [GitOps Reconciliation Loop (Flux CD)](https://oneuptime.com/blog/post/2026-03-05-flux-cd-reconciliation-loop/view) — Reconciliation mechanics
- [Pull-Based Reconciliation (Beautiful Code)](https://beautifulcode.co/articles/pull-based-reconciliation-gitops-inverts-deployment-models) — GitOps pull model
- [ArgoCD Reconciliation (Rafay)](https://rafay.co/ai-and-cloud-native-blog/understanding-argocd-reconciliation-how-it-works-why-it-matters-and-best-practices) — ArgoCD specifics
- [GitOps Configuration Drift (Bridgephase)](https://bridgephase.com/insights/drift-detection/) — Drift detection patterns
- [GitOps Best Practices (Pulumi)](https://www.pulumi.com/blog/gitops-best-practices-i-wish-i-had-known-before/) — Practical lessons
- [Handle Merge Conflicts in CI/CD (Hokstad)](https://www.hokstadconsulting.com/blog/how-to-handle-merge-conflicts-in-ci-cd-pipelines) — CI/CD conflict strategies
- [GitOps CI/CD Strategies (Denilson Nastacio)](https://dnastacio.medium.com/the-gitops-files-ci-cd-bricks-and-blueprints-fcfdb5b3e34d) — GitOps update patterns

### General Concurrency Theory
- [Optimistic Concurrency Control - Wikipedia](https://en.wikipedia.org/wiki/Optimistic_concurrency_control) — Overview with MediaWiki, Bugzilla examples
- [Optimistic Concurrency: Practical Guide for 2025 (Shadecoder)](https://www.shadecoder.com/topics/optimistic-concurrency-control-a-practical-guide-for-2025) — Modern practical guide
- [What You Need to Know About Optimistic Concurrency (DEV)](https://dev.to/harri_etty/what-you-need-to-know-about-optimistic-concurrency-1g3l) — Developer-friendly overview
- [Optimistic Locking (Eugene Eeo)](https://eugene-eeo.github.io/blog/optlock.html) — Lightweight analysis
- [Revisiting Optimistic and Pessimistic Concurrency (HPE)](https://www.labs.hpe.com/techreports/2016/HPE-2016-47.pdf) — Academic comparison
- [Improving Conflict Detection in OCC (Springer)](https://link.springer.com/chapter/10.1007/3-540-39195-9_14) — Academic paper
- [Cosmos DB Optimistic Concurrency](https://learn.microsoft.com/en-us/azure/cosmos-db/database-transactions-optimistic-concurrency) — Azure implementation
- [Conflict Detection (ScienceDirect)](https://www.sciencedirect.com/topics/computer-science/conflict-detection) — Academic overview

### File Change Detection
- [fswatch (GitHub)](https://github.com/emcrisostomo/fswatch) — Cross-platform file change monitor
- [fswatch documentation](https://emcrisostomo.github.io/fswatch/) — Official docs
- [inotify: File Watcher for Linux (Medium)](https://medium.com/@dicmandilan/inotify-file-watcher-for-linux-how-to-automatically-detect-new-files-and-take-action-d475b0ca9cd0) — inotify tutorial

---

## Raw Links

Every URL encountered during this research, including ones not fully explored:

```
https://zeitbach.com/blog/2024/01/26/optimistic-concurrency-control-with-etags
https://learn.microsoft.com/en-us/azure/storage/blobs/concurrency-manage
https://fideloper.com/etags-and-optimistic-concurrency-control
https://docs.ed-fi.org/reference/data-exchange/api-guidelines/design-and-implementation-guidelines/api-implementation-guidelines/handling-optimistic-concurrency-with-etags/
https://learn.microsoft.com/en-us/azure/cosmos-db/database-transactions-optimistic-concurrency
https://en.wikipedia.org/wiki/Optimistic_concurrency_control
https://sapabapcentral.blogspot.com/2017/10/implementation-of-etag-for-write.html
https://purelogics.com/aws-s3-writes-with-conditional-request/
https://azure.microsoft.com/en-us/blog/managing-concurrency-in-microsoft-azure-storage-2/
https://martincarstenbach.com/2026/02/03/optimistic-locking-made-easy-the-power-of-etags-in-action/
https://blog.klipse.tech/databook/2020/12/18/occ-do-git.html
https://eugene-eeo.github.io/blog/optlock.html
https://dev.to/harri_etty/what-you-need-to-know-about-optimistic-concurrency-1g3l
https://link.springer.com/article/10.1007/s10606-018-9323-3
https://en.wikipedia.org/wiki/Optimistic_concurrency_control
https://www.sciencedirect.com/topics/computer-science/conflict-detection
https://www.shadecoder.com/topics/optimistic-concurrency-control-a-practical-guide-for-2025
https://www.labs.hpe.com/techreports/2016/HPE-2016-47.pdf
https://www.dolthub.com/blog/2024-07-08-are-git-branches-mvcc/
https://link.springer.com/chapter/10.1007/3-540-39195-9_14
https://simongui.github.io/distributed-systems/crdt.html
https://en.wikipedia.org/wiki/Version_vector
https://martinfowler.com/articles/patterns-of-distributed-systems/version-vector.html
https://www.designgurus.io/course-play/grokking-the-advanced-system-design-interview/doc/vector-clocks-and-conflicting-data
https://en.wikipedia.org/wiki/Vector_clock
https://github.com/ljwagerfield/crdt
https://www.geeksforgeeks.org/computer-networks/vector-clocks-in-distributed-systems/
http://archagon.net/blog/2018/03/24/data-laced-with-history/
https://www.bartoszsypytkowski.com/the-state-of-a-state-based-crdts/
https://www.educative.io/courses/distributed-systems-practitioners/version-vectors
https://en.wikipedia.org/wiki/Compare-and-swap
https://ryonaldteofilo.medium.com/atomics-in-c-compare-and-swap-and-memory-order-part-2-64e127847e00
https://preshing.com/20150402/you-can-do-any-kind-of-atomic-read-modify-write-operation/
https://dzone.com/articles/demystifying-javas-compare-and-swap-cas
https://news.ycombinator.com/item?id=7816979
https://www.javacodegeeks.com/2024/02/exploring-javas-compare-and-swap-cas-for-atomic-operations.html
https://medium.com/@kaustubh.saha/hardware-based-locking-0e6c5133fe07
https://www.internalpointers.com/post/lock-free-multithreading-atomic-operations
https://lwn.net/Articles/847973/
https://rcrowley.org/2010/01/06/things-unix-can-do-atomically.html
https://man7.org/linux/man-pages/man2/flock.2.html
https://apenwarr.ca/log/20101213
https://www.php.net/manual/en/function.flock.php
https://gavv.net/articles/file-locks/
http://0pointer.de/blog/projects/locking.html
https://linux.die.net/man/2/flock
https://www.baeldung.com/linux/file-locking
https://www.kernel.org/doc/html/v5.14/filesystems/mandatory-locking.html
https://en.wikipedia.org/wiki/File_locking
https://www.cs.ait.ac.th/~on/O/oreilly/perl/cookbook/ch07_12.htm
https://github.com/bobvanderlinden/sharpfilesystem/issues/8
https://bugs.python.org/issue8828
https://lwn.net/Articles/789600/
https://news.ycombinator.com/item?id=11803431
https://systemdr.substack.com/p/crdts-vs-operational-transformation
https://www.figma.com/blog/how-figmas-multiplayer-technology-works/
https://sderay.com/google-docs-architecture-real-time-collaboration/
https://dev.to/dhanush___b/how-google-docs-uses-operational-transformation-for-real-time-collaboration-119
https://dev.to/arghya_majumder/operational-transformation-ot-and-crdts-real-time-collaboration-systems-kdd
https://dev.to/puritanic/building-collaborative-interfaces-operational-transforms-vs-crdts-2obo
https://www.tiny.cloud/blog/real-time-collaboration-ot-vs-crdt/
https://oneuptime.com/blog/post/2026-01-30-operational-transformation/view
https://systemdesignpal.substack.com/p/design-google-docs-operation-transformation
https://www.figma.com/blog/building-figmas-code-layers/
https://www.geeksforgeeks.org/devops/git-and-devops-integrating-version-control-with-ci-cd-pipelines/
https://www.linkedin.com/pulse/how-do-devops-resolve-conflicts-cicd-pipeline-suheb-ghare-5kl2f
https://www.redhat.com/en/topics/devops/what-is-ci-cd
https://codefresh.io/learn/ci-cd/
https://gearset.com/blog/how-to-resolve-salesforce-merge-conflicts/
https://www.mathworks.com/help/simulink/ug/diff-and-merge-tools-continuous-integration.html
https://www.harness.io/harness-devops-academy/what-is-ci-cd
https://codefresh.io/learn/ci-cd-pipelines/
https://www.hokstadconsulting.com/blog/how-to-handle-merge-conflicts-in-ci-cd-pipelines
https://dnastacio.medium.com/the-gitops-files-ci-cd-bricks-and-blueprints-fcfdb5b3e34d
https://aws.amazon.com/blogs/storage/building-multi-writer-applications-on-amazon-s3-using-native-controls/
https://medium.com/@emily80108/beyond-object-storage-simulating-acid-transactions-on-aws-s3-with-optimistic-locking-c3b1912f995a
https://www.architecture-weekly.com/p/using-s3-but-not-the-way-you-expected
https://simonwillison.net/2024/Nov/26/s3-conditional-writes/
https://docs.aws.amazon.com/iot-sitewise/latest/userguide/opt-locking-for-model.html
https://docs.aws.amazon.com/AmazonS3/latest/userguide/conditional-writes.html
https://aws.amazon.com/about-aws/whats-new/2024/11/amazon-s3-functionality-conditional-writes/
https://docs.aws.amazon.com/AmazonS3/latest/userguide/conditional-reads.html
https://docs.aws.amazon.com/AmazonS3/latest/userguide/conditional-writes-enforce.html
https://blog.git-init.com/the-magic-of-3-way-merge/
https://git-scm.com/docs/merge-strategies
https://git-scm.com/docs/git-merge
https://savaslabs.com/blog/strategies-and-tools-resolving-git-merge-conflicts
https://www.atlassian.com/git/tutorials/using-branches/merge-strategy
https://www.kernel.org/pub/software/scm/git/docs/git-merge.html
https://unstop.com/blog/merge-in-git
https://algomaster.io/learn/git/three-way-merge
https://www.atlassian.com/git/tutorials/using-branches/git-merge
https://docs.gearset.com/en/articles/9325332-two-way-and-three-way-merges-explained
https://dev.to/piyushjajoo/understanding-amazon-dynamo-a-deep-dive-into-distributed-system-design-5a49
https://platformwale.blog/2026/02/19/understanding-amazon-dynamo-a-deep-dive-into-distributed-system-design/
https://www.cs.cornell.edu/courses/cs5414/2017fa/papers/dynamo.pdf
https://hemantkgupta.medium.com/insights-from-paper-part-i-dynamo-amazons-highly-available-key-value-store-a9dd3485b51b
https://abdulapopoola.com/2024/07/17/paper-review-dynamo-amazons-highly-available-key-value-store/
https://dev.to/dhanush___b/dynamodb-amazons-highly-available-eventually-consistent-key-value-store-explained-4l72
https://www.the-paper-trail.org/post/2008-08-26-consistency-and-availability-in-amazons-dynamo/
https://www.ayushshanker.com/posts/paper-reading-dynamo
https://tycon.github.io/dynamo.html
https://www.mydistributed.systems/2022/02/eventual-consistency-part-2.html
https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/ETag
https://en.wikipedia.org/wiki/HTTP_ETag
http://joshua.schachter.org/2006/11/apache-etags
https://bugfactory.io/articles/http-caching-with-etag-and-if-none-match-headers/
https://nurkiewicz.com/2015/06/writing-download-server-part-ii-headers.html
https://requestly.com/blog/etag-header-api/
https://www.quora.com/What-are-the-best-practices-for-the-FileETag-directive-in-Apache
https://medium.com/airasia-com-tech-blog/etag-101-tips-and-tricks-for-implementation-6072525b487b
https://github.com/badsyntax/s3-etag
https://github.com/owncloud/core/issues/5305
https://github.com/yjs/yjs
https://github.com/automerge/automerge
https://github.com/SmartBear/automerge
https://crdt.tech/implementations
https://github.com/marsch/automerge
https://github.com/emacsway/automerge
https://cran.r-project.org/web/packages/automerge/vignettes/crdt-concepts.html
https://posit-dev.github.io/automerge-r/articles/crdt-concepts.html
https://github.com/automerge/automerge-classic
https://news.ycombinator.com/item?id=16309533
https://news.ycombinator.com/item?id=30412550
https://github.com/emcrisostomo/fswatch
https://emcrisostomo.github.io/fswatch/
https://www.tecmint.com/fswatch-monitor-file-changes-linux/
https://manpages.debian.org/testing/fswatch/fswatch.7.en.html
https://medium.com/@dicmandilan/inotify-file-watcher-for-linux-how-to-automatically-detect-new-files-and-take-action-d475b0ca9cd0
https://itsfoss.gitlab.io/post/how-to-monitor-file-changes-using-fswatch-in-linux/
https://github.com/andreaskoch/go-fswatch
https://github.com/WebFreak001/FSWatch
https://www.mankier.com/1/fswatch
https://mohammedev.hashnode.dev/monitor-file-changes-with-inotify-api
https://lab.abilian.com/Tech/Databases%20&%20Persistence/Content%20Addressable%20Storage%20(CAS)/
https://en.wikipedia.org/wiki/Content-addressable_storage
https://github.com/Rakshat28/bdstorage
https://llvm.org/docs/ContentAddressableStorage.html
https://docs.source.network/defradb/concepts/content-addressable-storage/
https://terragrunt.gruntwork.io/docs/features/cas/
https://grokipedia.com/page/Content-addressable_storage
https://overcast.blog/leveraging-content-addressable-storage-in-kubernetes-5c8f47450b28
https://www.lenovo.com/us/en/glossary/cas/
https://www.devx.com/terms/content-addressable-storage/
https://www.notion.com/blog/data-model-behind-notion
https://www.educative.io/blog/notion-system-design
https://medium.com/@thomasbrillion/build-your-own-collaborative-realtime-notion-11c361fb2cbe
https://www.systemdesignhandbook.com/guides/notion-system-design-interview/
https://velt.dev/blog/crdt-implementation-guide-conflict-free-apps
https://www.hivemq.com/blog/decentralized-collaborative-text-editor-using-mqtt-crdts/
https://github.com/alangibson/awesome-crdt
https://www.everand.com/book/904370368/Collaborative-Editing-with-Yjs-and-CRDTs-The-Complete-Guide-for-Developers-and-Engineers
https://modelcontextprotocol.io/
https://openai.github.io/openai-agents-python/mcp/
https://konghq.com/blog/engineering/mcp-tool-governance-security-meets-context-efficiency
https://en.wikipedia.org/wiki/Model_Context_Protocol
https://github.com/modelcontextprotocol/modelcontextprotocol/issues/1708
https://mljourney.com/implementing-mcp-in-multi-agent-ai-platforms/
https://shiftasia.com/community/model-context-protocol-for-ai-agent/
https://arxiv.org/html/2504.21030v1
https://www.kubiya.ai/blog/model-context-protocol-mcp-architecture-components-and-workflow
https://github.com/rinadelph/Agent-MCP
https://github.com/rinadelph/agent-mcp-examples
https://glama.ai/mcp/servers/@AndrewDavidRivers/multi-agent-coordination-mcp
https://github.com/rinadelph/Agent-MCP/blob/main/docs/mcd-guide.md
https://lobehub.com/mcp/andrewdavidrivers-multi-agent-coordination-mcp
https://github.com/Dicklesworthstone/mcp_agent_mail
https://purplehorizons.io/blog/tick-md-multi-agent-coordination-markdown
https://techcommunity.microsoft.com/blog/azuredevcommunityblog/orchestrating-multi-agent-intelligence-mcp-driven-patterns-in-agent-framework/4462150
https://github.com/AndrewDavidRivers/multi-agent-coordination-mcp
https://towardsdatascience.com/why-your-multi-agent-system-is-failing-escaping-the-17x-error-trap-of-the-bag-of-agents/
https://www.ibm.com/think/insights/ai-agents-2025-expectations-vs-reality
https://o-mega.ai/articles/the-2025-2026-guide-to-ai-computer-use-benchmarks-and-top-ai-agents
https://medium.com/@Micheal-Lanham/why-ai-agents-didnt-take-over-in-2025-and-what-changes-everything-in-2026-9393a5bb68e8
https://researchportal.hbku.edu.qa/en/publications/optimistic-vs-pessimistic-concurrency-control-algorithm-a-compara/fingerprints/
https://www.langchain.com/state-of-agent-engineering
https://sqlite.org/lockingv3.html
https://sqlite.org/wal.html
https://www.sqlite.org/src/doc/begin-concurrent/doc/begin_concurrent.md
https://blog.skypilot.co/abusing-sqlite-to-handle-concurrency/
https://fly.io/blog/sqlite-internals-wal/
https://turso.tech/blog/beyond-the-single-writer-limitation-with-tursos-concurrent-writes
https://oldmoe.blog/2024/07/08/the-write-stuff-concurrent-write-transactions-in-sqlite/
https://betterstack.com/community/guides/databases/turso-explained/
https://oneuptime.com/blog/post/2026-01-27-terraform-state-locking/view
https://oneuptime.com/blog/post/2026-02-12-fix-terraform-error-acquiring-state-lock/view
https://medium.com/@sampark02/terraform-state-file-locking-preventing-conflicts-in-infrastructure-management-ff0f819a8e1f
https://medium.com/@wd.sandeepnayak/terraform-locking-state-mechanism-using-dynamodb-lockid-b43298ae7489
https://www.cloudthat.com/resources/blog/state-locking-with-s3-without-dynamodb-in-terraform
https://oneuptime.com/blog/post/2026-02-12-terraform-state-with-s3-backend-and-dynamodb-locking/view
https://rafaelmedeiros94.medium.com/goodbye-dynamodb-terraform-s3-backend-now-supports-native-locking-06f74037ad39
https://notes.kodekloud.com/docs/Terragrunt-for-Beginners/Managing-Remote-State-with-Terragrunt/Setting-up-DynamoDB-Locks/page
https://quileswest.medium.com/how-to-lock-terraform-state-with-s3-bucket-in-dynamodb-3ba7c4e637
https://github.com/cloudposse/terraform-aws-tfstate-backend/blob/main/README.md
https://bridgephase.com/insights/drift-detection/
https://www.pulumi.com/blog/gitops-best-practices-i-wish-i-had-known-before/
https://oneuptime.com/blog/post/2026-02-20-gitops-principles-guide/view
https://beautifulcode.co/articles/pull-based-reconciliation-gitops-inverts-deployment-models
https://azurebeast.com/posts/gitops-best-practices-drift-fluxcd-terraform/
https://oneuptime.com/blog/post/2026-03-05-flux-cd-reconciliation-loop/view
https://rafay.co/ai-and-cloud-native-blog/understanding-argocd-reconciliation-how-it-works-why-it-matters-and-best-practices
https://docs.rafay.co/blog/2025/08/04/understanding-argocd-reconciliation-how-it-works-why-it-matters-and-best-practices/
https://oneuptime.com/blog/post/2026-02-16-how-to-set-up-gitops-for-azure-infrastructure-using-flux-and-terraform/view
https://openliberty.io/blog/2024/04/26/argocd-drift-pt1.html
https://www.flowhunt.io/blog/advanced-ai-agents-with-file-access-mastering-context-offloading-and-state-management/
https://earezki.com/ai-news/2026-03-09-the-state-management-pattern-that-runs-our-5-agent-system-24-7/
https://agentic-patterns.com/patterns/filesystem-based-agent-state/
https://github.com/TuringWorks/the-agency
https://dev.to/setas/i-run-a-solo-company-with-ai-agent-departments-50nf
https://learn.microsoft.com/en-us/agent-framework/overview/
https://www.sitepoint.com/multi-agent-ai-development-architecture/
https://learn.microsoft.com/en-us/agent-framework/workflows/state
https://github.com/mind-network/Awesome-LLM-based-AI-Agents-Knowledge/blob/main/8-7-state.md
https://www.vellum.ai/blog/multi-agent-systems-building-with-context-engineering
https://www.cis.upenn.edu/~lee/07cis505/Lec/lec-ch6-synch2-LogicalClock-v2.pdf
https://en.wikipedia.org/wiki/Causal_consistency
https://queue.acm.org/detail.cfm?id=2917756
https://www.scattered-thoughts.net/writing/causal-ordering/
https://www.researchgate.net/publication/221233639_A_New_Algorithm_to_Implement_Causal_Ordering
http://www.bailis.org/blog/causality-is-expensive-and-what-to-do-about-it/
https://www.csd.uoc.gr/~hy556/material/lectures/cs556-Section7.pdf
https://oneuptime.com/blog/post/2026-01-30-vector-clocks/view
https://www.arxiv.org/pdf/2507.22071
https://git-scm.com/docs/git-diff/2.21.0.html
https://git-scm.com/docs/git-merge/2.38.0
https://www.eseth.org/2020/mergetools.html
https://blog.jcoglan.com/2017/09/19/the-patience-diff-algorithm/
https://github.com/levish0/threeway-merge-rs
https://medium.com/@HelanaBakhsh/merge-strategies-with-git-did-you-say-a-three-way-ebedda9984dd
https://git-scm.com/docs/diff-options/2.6.7
https://fabiensanglard.net/git_code_review/diff.php
https://python-atomicwrites.readthedocs.io/
https://pypi.org/project/atomicwrites/
https://github.com/untitaker/python-atomicwrites
https://sahmanish20.medium.com/better-file-writing-in-python-embrace-atomic-updates-593843bfab4f
https://code.activestate.com/recipes/579097-safely-and-atomically-write-to-a-file/
https://users.rust-lang.org/t/how-to-write-replace-files-atomically/42821
https://docs.riak.com/riak/kv/latest/developing/usage/conflict-resolution/index.html
https://github.com/ricardobcl/Dotted-Version-Vectors
https://riak.com/products/riak-kv/dotted-version-vectors/index.html?p=10941.html
https://docs.riak.com/riak/kv/latest/learn/concepts/causal-context/index.html
https://riak.com/posts/technical/vector-clocks-revisited-part-2-dotted-version-vectors/index.html?p=9929.html
https://riak.com/posts/technical/vector-clocks-revisited/index.html?p=9545.html
https://github.com/basho/basho_docs/blob/master/content/riak/kv/2.2.2/developing/usage/conflict-resolution.md
https://riak.com/products/riak-kv/riak-distributed-data-types/
https://www.tiot.jp/riak-docs/riak/kv/2.1.4/introduction/
https://riak.com/distributed-data-types-riak-2-0/
https://www.filesystems.org/docs/nc-checksum-tr/nc-checksum.html
https://www.a2hosting.com/kb/developer-corner/linux/working-with-file-checksums/
https://btrfs.readthedocs.io/en/latest/Checksumming.html
https://linuxsecurity.com/features/what-are-checksums-why-should-you-be-using-them
https://codesigningstore.com/how-to-check-file-checksum
https://www.kernel.org/doc/html/v6.16/filesystems/ext4/dynamic.html
https://www.freecodecamp.org/news/file-last-modified-in-inux-how-to-check-if-two-files-are-same/
https://ant.apache.org/manual/Tasks/checksum.html
https://github.com/go-task/task/issues/1185
https://mcp-best-practice.github.io/mcp-best-practice/best-practice/
https://www.arxiv.org/pdf/2602.07072
https://www.builder.io/blog/ai-agent-orchestration
https://www.techrxiv.org/users/1007269/articles/1367390/master/file/data/LLM_MAS_Memory_Survey_preprint_/LLM_MAS_Memory_Survey_preprint_.pdf
https://www.freecodecamp.org/news/build-and-deploy-multi-agent-ai-with-python-and-docker/
https://www.gocodeo.com/post/building-with-ai-agents-a-developers-guide-to-frameworks-for-multi-agent-orchestration
https://zilliz.com/ai-faq/how-do-multiagent-systems-manage-conflict-resolution
https://www.theunwindai.com/p/conflict-resolution-for-multi-agents
https://blog.cybermindworks.com/post/how-we-built-a-notion-like-editor-with-real-time-editing
https://tiptap.dev/docs/ui-components/templates/notion-like-editor
```

---

## Open Questions

1. **Granularity trade-off**: Should Sherpa implement whole-file ETags (simple, works today) or section-level conflict detection (smarter, needs a parser)? The answer likely depends on how often agents actually collide on the same file vs. the same section.

2. **Retry semantics for agents**: When an agent gets a 412 conflict, should it automatically retry with a merge, or should it always escalate? Auto-retry risks merge loops (Agent A and B repeatedly conflicting). Escalation to a coordinator or human is safer but slower. A bounded retry (try once, escalate on second conflict) may be the right default.

3. **Version vector storage location**: Inline in YAML frontmatter (simple, visible) or in sidecar `.meta` files (cleaner separation, but two files to manage)? Frontmatter has the advantage that Git tracks it naturally and agents can read it without extra tooling.

4. **Stale lock recovery for pessimistic fallback**: If an agent crashes while holding a lock (or a hash-based reservation), how does the system recover? TTL-based expiry is the standard answer, but what's the right TTL for AI agent sessions that can vary from minutes to hours?

5. **Interaction with Git**: If Sherpa uses file-level ETags AND Git worktrees, how do the two concurrency layers interact? Possible design: ETags handle intra-branch concurrent access (multiple agents on the same branch), Git handles inter-branch merge conflicts (agents on different branches merging to main).

6. **Structured merge for YAML**: Can Sherpa implement a field-level merge for YAML frontmatter that auto-resolves non-conflicting field changes? This would require parsing YAML, computing field-level diffs, and detecting field-level conflicts. Existing tools like `yq` can parse YAML, but field-level three-way merge is not a standard operation.

7. **Relationship to cr-sqlite and the sqlite-agentic-state initiative**: If shared state moves to SQLite with CRDTs (cr-sqlite), does file-level concurrency control become less important? Or do both layers coexist — SQLite for hot structured state (task boards, agent status), files for content (proposals, research, plans)?

8. **Agent identity for version vectors**: How does an agent identify itself in a version vector? By role (planner, worker, judge)? By session ID? By worktree name? The answer affects vector growth — role-based is bounded (few roles), session-based grows unboundedly.

9. **Conflict notification**: Should agents be proactively notified when a file they previously read has been modified? This would require file watching (inotify/fswatch/FSEvents) integrated into the MCP server. Without it, agents only discover conflicts at write time, which may be after significant wasted work.

10. **What does the MCP conditional write API look like?** The exact tool interface for `studio-mcp` needs design: parameter names, error response shape, whether to include the conflicting content in the error, whether to support batch conditional writes for multi-file transactions.
