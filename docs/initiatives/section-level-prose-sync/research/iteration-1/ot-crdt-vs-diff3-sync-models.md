# OT vs CRDT vs Three-Way Diff/Merge for Prose Synchronization

**Date:** 2026-03-11
**Focus:** Which sync model is appropriate for `sherpa sync` — a periodic CLI tool syncing convention documents between two known peers (upstream framework + downstream consumer)?

---

## Key Discoveries

### 1. OT Is Designed for Real-Time, Server-Mediated Collaboration — It's Overkill Here

- Operational Transformation (OT) was invented in the late 1980s for real-time co-editing. It works by transforming operations against concurrent operations so they can be applied in any order. Google Docs uses OT with a central server. ([tiny.cloud](https://www.tiny.cloud/blog/real-time-collaboration-ot-vs-crdt/))
- OT fundamentally requires a **central server** to establish operation ordering. In a centralized (star) topology, every conflict resolves between 2 nodes (server + client), making the transform a simple for-loop. Without a server, OT needs TP2 (Transform Property 2), which is "so complex that very few data structures have working TP2 implementations." ([wikipedia.org/wiki/Operational_transformation](https://en.wikipedia.org/wiki/Operational_transformation))
- The two-peer case (exactly our scenario) is actually the simplest case for OT — "the case that the original Grove system handled correctly" — but OT still carries unnecessary complexity because it assumes **continuous operation streams**, not periodic batch reconciliation. ([news.ycombinator.com](https://news.ycombinator.com/item?id=18192147))
- **Verdict for sherpa sync:** OT is architecturally wrong. It solves real-time cursor-tracking and character-by-character conflict resolution. We have no cursors, no real-time stream, and no server. We have files that diverge and need periodic reconciliation.

### 2. CRDTs Are Powerful but Carry Unnecessary Weight for This Use Case

- CRDTs (Conflict-free Replicated Data Types) guarantee convergence: any two replicas that have seen the same set of operations will be in the same state, regardless of order. This is mathematically elegant and correct. ([automerge.org](https://automerge.org/), [crdt.tech](https://crdt.tech/implementations))
- The leading libraries are **Yjs** ([github.com/yjs/yjs](https://github.com/yjs/yjs)) and **Automerge** ([github.com/automerge/automerge](https://github.com/automerge/automerge)). Both handle offline-first scenarios and periodic sync well — CRDTs don't require real-time connectivity.
- **However, CRDTs add 16-32 bytes of metadata per character** for text types. A 10KB document balloons to 320KB. ([thom.ee](https://thom.ee/blog/crdt-vs-operational-transformation/))
- **Cinapse abandoned Automerge** after hitting WebAssembly's 4GB memory limit on large scheduling files, spending ~$1,000/month on sync servers. They switched to a simpler server-authoritative model and saw 89% fewer support requests, 66% lower hosting costs. Their key lesson: "per-character tracking done by CRDTs was not necessary for our use case." ([powersync.com](https://www.powersync.com/blog/why-cinapse-moved-away-from-crdts-for-sync))
- Nikita Tonsky's crdt-filesync proof-of-concept uses Automerge with a file-per-peer model over Dropbox/Syncthing — each peer owns its own file, CRDTs merge at read time. Works for periodic sync but adds significant infrastructure. ([tonsky.me/blog/crdt-filesync](https://tonsky.me/blog/crdt-filesync/), [github.com/tonsky/crdt-filesync](https://github.com/tonsky/crdt-filesync))
- The "You Might Not Need a CRDT" talk argues that most SaaS products with server-mediated architectures don't need CRDTs. Direct peer-to-peer without an intermediary server is "so rare for SaaS that I don't even know of an example." Exception: collaborative text documents still benefit from OT or CRDT for intent preservation. ([news.ycombinator.com](https://news.ycombinator.com/item?id=39615987))
- **Verdict for sherpa sync:** CRDTs solve a harder problem than we have. We don't need per-character convergence. We need per-section convergence. The metadata overhead, the need to maintain CRDT document state between syncs, and the library weight are all unjustified for periodic CLI sync of markdown files.

### 3. Three-Way Diff/Merge (diff3) at Section Granularity Is the Right Foundation

- **diff3 takes three inputs:** the common ancestor (base), and two diverged versions (upstream and downstream). It identifies regions where only one side changed (auto-resolve) and regions where both sides changed the same content (conflict). ([blog.jcoglan.com](https://blog.jcoglan.com/2017/05/08/merging-with-diff3/))
- This is exactly git's merge algorithm. Git's three-way merge is the most battle-tested merge algorithm in existence. It works on lines of text.
- **Obsidian Sync uses exactly this approach** — Google's diff-match-patch library performing three-way merge on markdown files, with "last modified wins" fallback for binary files. As of v1.9.7, users can choose between auto-merge and conflict-file creation. ([deepwiki.com/obsidianmd](https://deepwiki.com/obsidianmd/obsidian-help/2.3-filters-and-views), [forum.obsidian.md](https://forum.obsidian.md/t/robust-sync-conflict-resolution/93544))

#### diff3 Failure Modes (and Why Section Granularity Mitigates Them)

- **Sensitivity to underlying diff algorithm:** Different diff implementations produce different line alignments, causing different conflicts for the same input. ([blog.jcoglan.com](https://blog.jcoglan.com/2017/06/19/why-merges-fail-and-what-can-be-done-about-it/))
- **No semantic understanding:** diff3 treats everything as text lines. It can't distinguish meaningful structural changes from cosmetic ones. ([mattrickard.com](https://mattrickard.com/diff3-shortcomings))
- **Distance from ancestor:** When both versions diverge significantly from the base, diff3 produces poor alignments. ([mattrickard.com](https://mattrickard.com/diff3-shortcomings))
- **Boilerplate line matching:** Shared boilerplate (blank lines, common syntax) causes false alignment anchors. ([blog.jcoglan.com](https://blog.jcoglan.com/2017/06/19/why-merges-fail-and-what-can-be-done-about-it/))
- **Non-idempotent:** Running diff3 repeatedly can propagate changes. ([mattrickard.com](https://mattrickard.com/diff3-shortcomings))

**Key insight:** Most of these failure modes are dramatically reduced when operating at **section granularity** rather than line granularity. When the atomic unit is "the content under a heading" rather than "a line of text":
  - Sections are identified by stable IDs (heading slugs or explicit markers), not by textual position
  - The diff operates on a small number of well-identified chunks (10-30 sections) rather than hundreds of lines
  - A section that changed on only one side auto-resolves trivially — take the changed version
  - A section that changed on both sides can be flagged as a conflict OR can use line-level diff3 within that section as a secondary merge
  - Sections added on one side (not present in base) are always additive — auto-resolve
  - Sections deleted on one side can be handled with a policy choice (warn, remove, or keep with flag)

### 4. Neil Fraser's Differential Synchronization Is Elegant but Wrong Layer

- Differential Synchronization (DS) maintains "shadow copies" on each peer. Each cycle: diff text against shadow, send patches, apply patches to the other peer's text, update shadows. Convergence is guaranteed: failed patches automatically appear as negative diffs in the return cycle. ([neil.fraser.name/writing/sync](https://neil.fraser.name/writing/sync/), [research.google.com/pubs/archive/35605.pdf](https://research.google.com/pubs/archive/35605.pdf))
- DS is beautiful for **continuous synchronization** — it assumes an "unending cycle of background difference and patch operations." It powers the collaboration in Google Docs alongside OT.
- DS requires maintaining shadow state between sync cycles. For a CLI tool run periodically, this means persisting shadow copies somewhere — adding state management complexity.
- **Verdict:** DS is closer to our needs than OT (it works with diffs/patches, not operation streams), but it's still designed for continuous sync. The shadow copy mechanism adds complexity we can avoid by using git-style three-way merge with an explicit base version.

### 5. Darcs Patch Theory Provides Theoretical Insight but No Practical Advantage

- Darcs patch theory is built on **commutation** — determining whether two patches can be reordered while preserving the same result. A merge is "an operation that takes two parallel patches and gives a pair of sequential patches." ([en.wikibooks.org](https://en.wikibooks.org/wiki/Understanding_Darcs/Patch_theory), [darcs.net/Theory/MergersDocumentation](https://darcs.net/Theory/MergersDocumentation))
- There is an acknowledged "strong connection between what darcs does and scientific work on collaborative editing (Operational Transformation)." ([darcs.net/Theory/Questions](https://darcs.net/Theory/Questions))
- Raph Levien's work showed that OT with TP2 and CRDTs are formally related — both can be seen as instances of a more general framework. His xi-editor used OT for syntax highlighting race conditions but the retrospective concluded the CRDT model was overcomplicated for practical editing. ([raphlinus.github.io](https://raphlinus.github.io/xi/2020/06/27/xi-retrospective.html), [github.com/google/ot-crdt-papers](https://github.com/google/ot-crdt-papers))
- **Verdict:** Darcs patch theory validates that our section-level approach is sound — our "patches" are section replacements, and they commute trivially when they target different sections. But we don't need the formal machinery. Standard three-way merge gives us the same result for our constrained case.

### 6. What Obsidian and Logseq Actually Use

**Obsidian Sync:**
- Uses Google's **diff-match-patch** library for three-way merge on markdown files ([deepwiki.com/obsidianmd](https://deepwiki.com/obsidianmd/obsidian-help/2.3-filters-and-views))
- Compares three versions: common ancestor, local version, remote version
- Non-markdown files use "last modified wins" (timestamp-based)
- JSON settings files use key-level merge (apply local keys on top of remote)
- Conflict detection via modification timestamps + content hashes
- Known edge case: recently-created notes can trigger last-modified-wins instead of merge, potentially losing content
- Infrastructure: DigitalOcean servers, regional data centers (`sync-XX.obsidian.md`)

**Logseq Sync:**
- File-based (markdown) version uses RSAPI for sync (open source) ([discuss.logseq.com](https://discuss.logseq.com/t/seflhosted-logseq-db-synching/34537))
- New DB-based version uses RTC (Real-Time Collaboration) implementation — not open source
- Community has explored CRDT-based sync via IPFS pubsub, but this is experimental
- Open-source backend implementation exists ([github.com/bcspragu/logseq-sync](https://github.com/bcspragu/logseq-sync)) using credentialed blob uploads and SQLite

### 7. The Simplest Correct Approach for Periodic Two-Peer CLI Sync

For `sherpa sync` specifically, the architecture should be:

**Section-level three-way merge with explicit base tracking.**

The algorithm:
1. **Parse** upstream and downstream markdown files into section trees (using the section parser from iteration-1 research)
2. **Retrieve the base version** — the last-synced state of each file, stored as a snapshot
3. **For each section (matched by stable ID):**
   - Present in base + upstream + downstream → three-way merge
     - Changed only upstream → take upstream (auto-resolve)
     - Changed only downstream → take downstream (auto-resolve, consumer customization preserved)
     - Changed both → CONFLICT (present both versions to user, or attempt line-level diff3 within the section)
     - Changed neither → keep as-is
   - Present in base + upstream, absent in downstream → consumer deleted it (policy: respect deletion or warn)
   - Present in base + downstream, absent in upstream → upstream deleted it (policy: respect deletion or warn)
   - Present in upstream only (new section) → add to downstream
   - Present in downstream only (new section) → keep in downstream (consumer addition)
4. **Write the merged result** and update the stored base to the new merged state

**Key implementation choices:**
- **Base storage:** A `.sherpa/` directory in the consumer project stores the last-synced snapshot of each convention file. This is the "common ancestor" for three-way merge. (Analogous to git's merge base, but explicit.)
- **Change detection:** Content hashes per section. No need for timestamps.
- **Conflict output:** For unresolvable conflicts, produce a conflict file with markers (like git) OR interactive CLI prompt.
- **No persistent CRDT/OT state.** The only state is the base snapshot. This can be regenerated from the upstream version at any time (first sync = no base = treat everything as upstream-only additions).

### 8. Available Libraries for Implementation

| Library | Purpose | URL |
|---------|---------|-----|
| `node-diff3` | Three-way merge on text arrays | [github.com/bhousel/node-diff3](https://github.com/bhousel/node-diff3) |
| `diff-match-patch-es` | ESM/TypeScript diff-match-patch (what Obsidian uses) | [github.com/antfu/diff-match-patch-es](https://github.com/antfu/diff-match-patch-es) |
| `@sanity/diff-match-patch` | TypeScript fork of diff-match-patch with better API | [npmjs.com/package/@sanity/diff-match-patch](https://www.npmjs.com/package/@sanity/diff-match-patch) |
| `three-way-merge` | JS/TS three-way merge using Heckel algorithm | [github.com/movableink/three-way-merge](https://github.com/movableink/three-way-merge) |
| `diff` (npm) | General-purpose diff library | [npmjs.com/package/diff](https://www.npmjs.com/package/diff) |

**Recommendation:** Use `node-diff3` for line-level merge within sections, or `diff-match-patch-es` if we want character-level merge (Obsidian's approach). The section-level matching is custom logic we write ourselves — no library needed for that part.

---

## Implications for sherpa sync

### What We Don't Need
- **OT** — designed for real-time operation streams with a central server. Wrong architecture.
- **CRDTs** — designed for eventual convergence of arbitrary concurrent edits across N peers. Adds per-character metadata overhead. We have exactly 2 peers and section-level granularity.
- **Differential Synchronization** — designed for continuous background sync. Requires persistent shadow copies. We run on-demand via CLI.
- **Darcs patch theory** — elegant but our "patches" (section replacements) commute trivially. We don't need the formal machinery.

### What We Do Need
- **Section-level three-way merge** — parse markdown into sections, match by ID, compare each section against the base version, auto-resolve when possible, flag conflicts when not.
- **Base version storage** — a `.sherpa/` directory storing the last-synced state of convention files.
- **Content hashing** — for efficient change detection per section.
- **Line-level fallback** — when both sides modify the same section, use diff3 or diff-match-patch within that section.
- **Policy configuration** — what to do when upstream deletes a section the consumer customized, or vice versa. This is a `sherpa.config.ts` concern.

### Analogy
`sherpa sync` is closer to `git pull` than to Google Docs. The sync model should feel like a **merge** (with a known base), not like a **live collaboration session**.

---

## Open Questions

1. **Should section-level conflicts ever auto-resolve?** If both sides changed a section but the changes don't overlap at line level, should we auto-merge (like git) or always flag for human review? The conservative choice is to flag, since convention documents are governance artifacts.

2. **How to handle section reordering?** If upstream reorders sections but doesn't change content, should we follow the reorder? The Heckel diff algorithm can detect moves ([gist.github.com/ndarville/3166060](https://gist.github.com/ndarville/3166060)), but this adds complexity. Simplest approach: ignore order, match by ID only.

3. **What's the base for the first sync?** On first `sherpa sync`, there's no stored base. Options: (a) treat upstream as the base and downstream as modified, (b) treat both as independent and flag everything for review, (c) treat upstream as-is and mark all downstream content as consumer additions.

4. **Should we store the base as a full file or as per-section snapshots?** Full file is simpler. Per-section snapshots allow independent sync of individual sections (useful if some sections are locked/frozen).

5. **How does `sherpa sync` interact with git?** If the consumer project uses git, the synced files are just files in the working tree. The developer can `git diff` to see what changed, `git checkout -- file` to reject the sync, etc. The `.sherpa/` base snapshots should be gitignored (internal state) or committed (shared team state)?

6. **Matt Weidner's "text without CRDTs" approach** — uses unique IDs per character with server reconciliation. Simpler than CRDTs but still per-character. Could be interesting if we ever need real-time, but irrelevant for CLI sync. ([mattweidner.com](https://mattweidner.com/2025/05/21/text-without-crdts.html))

---

## Sources

### OT and CRDT Fundamentals
- [Deciding between CRDTs and OT for data synchronization — thom.ee](https://thom.ee/blog/crdt-vs-operational-transformation/) — Side-by-side comparison with metadata overhead analysis (16-32 bytes/char for CRDTs)
- [Building real-time collaboration: OT vs CRDT — TinyMCE](https://www.tiny.cloud/blog/real-time-collaboration-ot-vs-crdt/) — Practical comparison with complexity analysis
- [CRDTs vs OT: How Google Docs Handles Collaborative Editing — SystemDR](https://systemdr.substack.com/p/crdts-vs-operational-transformation) — Google Docs architecture overview
- [Operational Transformation — Wikipedia](https://en.wikipedia.org/wiki/Operational_transformation) — TP1/TP2 properties, history
- [OT and CRDTs Real-Time Collaboration Systems — Dev.to](https://dev.to/arghya_majumder/operational-transformation-ot-and-crdts-real-time-collaboration-systems-kdd)
- [My Experience Implementing OT From Scratch — Dev.to](https://dev.to/knemerzitski/my-experience-implementing-operational-transformation-ot-from-scratch-27pd)
- [OTFAQ — NTU Singapore](https://www3.ntu.edu.sg/scse/staff/czsun/projects/otfaq/) — OT FAQ from researchers
- [Practical Intro to OT — archive.casouri.cc](https://archive.casouri.cc/note/2025/practical-intro-ot/)

### CRDT Libraries and Real-World Usage
- [Automerge documentation](https://automerge.org/) — Official Automerge site
- [Yjs — shared editing framework](https://github.com/yjs/yjs) — High-performance CRDT for collaborative apps
- [Yjs documentation](https://docs.yjs.dev/) — API docs
- [CRDT implementations list — crdt.tech](https://crdt.tech/implementations) — Comprehensive list
- [Why Cinapse Moved Away From CRDTs — PowerSync](https://www.powersync.com/blog/why-cinapse-moved-away-from-crdts-for-sync) — Real-world case study of CRDT overhead
- [Local, first, forever: CRDT filesync — tonsky.me](https://tonsky.me/blog/crdt-filesync/) — File-per-peer CRDT sync over Dropbox
- [crdt-filesync source — GitHub](https://github.com/tonsky/crdt-filesync) — Proof-of-concept implementation
- [You Might Not Need a CRDT — HN discussion](https://news.ycombinator.com/item?id=39615987) — Arguments for simpler approaches
- [Collaborative Text Editing without CRDTs or OT — Matt Weidner](https://mattweidner.com/2025/05/21/text-without-crdts.html) — UUID-per-character with server reconciliation
- [I was wrong. CRDTs are the future — josephg.com](https://josephg.com/blog/crdts-are-the-future/) — Counter-argument for CRDTs
- [Automerge text API](https://automerge.org/docs/reference/documents/text/) — Text CRDT specifics
- [Automerge sync protocol](https://automerge.org/docs/reference/concepts/) — How sync works

### Three-Way Merge and diff3
- [Merging with diff3 — James Coglan](https://blog.jcoglan.com/2017/05/08/merging-with-diff3/) — Deep dive into how diff3 works, with concrete examples
- [Why merges fail and what can be done — James Coglan](https://blog.jcoglan.com/2017/06/19/why-merges-fail-and-what-can-be-done-about-it/) — Failure modes: ambiguous diffs, structural rearrangement, boilerplate matching
- [Shortcomings of diff3 — Matt Rickard](https://mattrickard.com/diff3-shortcomings) — Five limitations: non-idempotent, no semantic understanding, distance-based failure, instability
- [diff3 — Wikipedia](https://en.wikipedia.org/wiki/Diff3) — Algorithm overview
- [Three-Way Merge — Revision Control wiki](https://tonyg.github.io/revctrl.org/ThreeWayMerge.html) — Theory
- [HN discussion on diff3 conflict style](https://news.ycombinator.com/item?id=34557827) — Practical usage tips
- [The Magic of 3-Way Merge — git-init.com](https://blog.git-init.com/the-magic-of-3-way-merge/) — Visual explanation

### Differential Synchronization
- [Differential Synchronization — Neil Fraser](https://neil.fraser.name/writing/sync/) — Original paper/article with full algorithm description
- [DS research paper (PDF) — Google Research](https://research.google.com/pubs/archive/35605.pdf) — Academic paper
- [DiffSync.NET — GitHub](https://github.com/kestasjk/DiffSync.NET) — .NET implementation

### diff-match-patch
- [diff-match-patch — Google (archived)](https://github.com/google/diff-match-patch) — Original library, now archived
- [diff-match-patch-es — antfu](https://github.com/antfu/diff-match-patch-es) — ESM/TypeScript rewrite
- [@sanity/diff-match-patch — npm](https://www.npmjs.com/package/@sanity/diff-match-patch) — Sanity.io TypeScript fork
- [diff-match-patch-ts — npm](https://www.npmjs.com/package/diff-match-patch-ts) — TypeScript port
- [Three-way merge discussion — Google Groups](https://groups.google.com/g/diff-match-patch/c/6HK8QKgc5Pc) — How to do three-way with DMP

### Three-Way Merge Libraries (JS/TS)
- [node-diff3 — GitHub](https://github.com/bhousel/node-diff3) — JavaScript diff3 and three-way merge. Clean API, CJS+ESM.
- [node-diff3 — npm](https://www.npmjs.com/package/node-diff3) — npm package
- [three-way-merge — MovableInk](https://github.com/movableink/three-way-merge) — Heckel-algorithm-based JS/TS library
- [diff — npm](https://www.npmjs.com/package/diff) — General-purpose diff library

### Darcs Patch Theory
- [Understanding Darcs/Patch theory — Wikibooks](https://en.wikibooks.org/wiki/Understanding_Darcs/Patch_theory) — Accessible explanation of commutation and merge
- [Understanding Darcs/Patch theory and conflicts — Wikibooks](https://en.wikibooks.org/wiki/Understanding_Darcs/Patch_theory_and_conflicts) — Conflict handling
- [Theory of patches — David Roundy](https://www.cs.tufts.edu/~nr/cs257/archive/david-roundy/Theory%20of%20patches.html) — Original theory document
- [Darcs Theory Questions](https://darcs.net/Theory/Questions) — Relationship to OT noted here
- [Formal properties of Darcs patch theory (PDF)](https://urchin.earth.li/darcs/ganesh/darcs-patch-theory/theory/formal.pdf) — Mathematical proofs
- [Darcs Patch Theory — Jason Dagit (PDF)](https://www.cs.tufts.edu/~nr/cs257/archive/jason-dagit/tmr-darcs.pdf) — Tutorial-style paper
- [Darcs — Wikipedia](https://en.wikipedia.org/wiki/Darcs) — Overview

### Unified OT/CRDT Theory
- [Towards a unified theory of OT and CRDT — Raph Levien](https://medium.com/@raphlinus/towards-a-unified-theory-of-operational-transformation-and-crdt-70485876f72f) — Key paper connecting OT and CRDT
- [Working code for OT/CRDT hybrid — Raph Levien](https://medium.com/@raphlinus/working-code-for-operational-transformation-crdt-hybrid-9d04a57309da) — Prototype implementation
- [xi-editor retrospective — Raph Levien](https://raphlinus.github.io/xi/2020/06/27/xi-retrospective.html) — Lessons learned: CRDT too complex for practical editing
- [google/ot-crdt-papers — GitHub](https://github.com/google/ot-crdt-papers) — Research papers + JS prototype
- [Real Differences between OT and CRDT (arxiv)](https://arxiv.org/pdf/1905.01517) — Academic comparison
- [Merging OT and CRDT Algorithms (INRIA)](https://inria.hal.science/hal-00957167v1/document) — Formal merger paper

### Obsidian Sync
- [Obsidian Sync — synchronization and conflict resolution (DeepWiki)](https://deepwiki.com/obsidianmd/obsidian-help/2.3-filters-and-views) — Architecture: diff-match-patch for markdown, last-modified-wins for binaries, key-merge for JSON
- [Obsidian Sync service overview (DeepWiki)](https://deepwiki.com/obsidianmd/obsidian-help/3.1-obsidian-sync) — Infrastructure details
- [Collaboration and shared vaults (DeepWiki)](https://deepwiki.com/obsidianmd/obsidian-help/2.4-collaboration-and-shared-vaults) — Multi-user patterns
- [Robust sync conflict resolution — Obsidian Forum](https://forum.obsidian.md/t/robust-sync-conflict-resolution/93544) — User discussion of edge cases
- [Option to manually resolve conflicts — Obsidian Forum](https://forum.obsidian.md/t/option-to-let-user-manually-resolve-sync-conflicts/94468)
- [Troubleshoot Obsidian Sync](https://help.obsidian.md/sync/troubleshoot) — Official troubleshooting

### Logseq Sync
- [Self-hosted Logseq DB syncing — Forum](https://discuss.logseq.com/t/seflhosted-logseq-db-synching/34537) — Architecture discussion
- [Building a self-hostable sync implementation — Forum](https://discuss.logseq.com/t/building-a-self-hostable-sync-implementation/21850) — Community efforts
- [logseq-sync open-source backend — GitHub](https://github.com/bcspragu/logseq-sync) — SQLite + blob storage implementation
- [Realtime sync via IPFS — Logseq Forum](https://discuss.logseq.com/t/realtime-sync-via-ipfs/12471) — CRDT-based experimental sync

### Heckel Diff Algorithm
- [Paul Heckel's Diff Algorithm — GitHub Gist](https://gist.github.com/ndarville/3166060) — Algorithm description with move detection
- [heckel-diff — npm](https://www.npmjs.com/package/heckel-diff) — JavaScript implementation
- [heckel-diff — GitHub (myndzi)](https://github.com/myndzi/heckel-diff) — Tweaked implementation

### Git Custom Merge Drivers
- [Git merge-config documentation](https://git-scm.com/docs/merge-config) — Official docs
- [How to write a custom git merge driver — gregmicek.com](https://www.gregmicek.com/software-coding/2020/01/13/how-to-write-a-custom-git-merge-driver/) — Tutorial
- [Custom git merge drivers — julianburr.de](https://www.julianburr.de/til/custom-git-merge-drivers/) — Quick guide
- [npm-merge-driver — GitHub](https://github.com/npm/npm-merge-driver) — Example for package-lock.json
- [git rerere — Git Book](https://git-scm.com/book/en/v2/Git-Tools-Rerere) — Reuse recorded conflict resolutions

### Academic / Structural Merge
- [Three-Way Structured Merge (PDF)](https://people.cs.vt.edu/~nm8247/publications/jsa23.pdf) — Top-down + bottom-up AST merge
- [Three-Way Merge for XML — Lindholm, 2004](https://aaltodoc.aalto.fi/server/api/core/bitstreams/cd83234f-72c9-443d-b9f4-3ab58db341c9/content) — Structured document merge
- [GitLab CHANGELOG conflict resolution](https://about.gitlab.com/blog/2018/07/03/solving-gitlabs-changelog-conflict-crisis/) — Decomposed monolithic file into per-entry files
- [Verifying Semantic Conflict-Freedom in Three-Way Merges (arxiv)](https://arxiv.org/pdf/1802.06551) — Formal verification

### CRDTs — Academic and Deep Dives
- [CRDTs: The Hard Parts — Martin Kleppmann](https://martin.kleppmann.com/2020/07/06/crdt-hard-parts-hydra.html) — Edge cases in CRDT design
- [CRDTs and the Quest for Distributed Consistency — Kleppmann](https://martin.kleppmann.com/2018/03/05/qcon-london.html) — QCon talk
- [CRDT Papers — crdt.tech](https://crdt.tech/papers.html) — Academic paper collection
- [Conflict-free Replicated Data Type — Wikipedia](https://en.wikipedia.org/wiki/Conflict-free_replicated_data_type) — Overview
- [Data Laced with History: Causal Trees — archagon.net](http://archagon.net/blog/2018/03/24/data-laced-with-history/) — Deep dive into Causal Tree CRDTs
- [A Run of CRDT Posts — Joe Hellerstein](https://jhellerstein.github.io/blog/crdt-intro/) — Academic series
- [The CRDT Dictionary — Ian Duncan](https://www.iankduncan.com/engineering/2025-11-27-crdt-dictionary/) — Field guide to CRDT types

---

## Raw Link List

```
https://thom.ee/blog/crdt-vs-operational-transformation/
https://dev.to/puritanic/building-collaborative-interfaces-operational-transforms-vs-crdts-2obo
https://www.tiny.cloud/blog/real-time-collaboration-ot-vs-crdt/
https://dl.acm.org/doi/10.1145/3375186
https://arxiv.org/pdf/1905.01517
https://systemdr.substack.com/p/crdts-vs-operational-transformation
https://dev.to/arghya_majumder/operational-transformation-ot-and-crdts-real-time-collaboration-systems-kdd
https://dl.acm.org/doi/10.1145/3392825
https://medium.com/@raphlinus/towards-a-unified-theory-of-operational-transformation-and-crdt-70485876f72f
https://goyalkavya.medium.com/crdts-vs-ots-99a7cfce2418
https://blog.jcoglan.com/2017/05/08/merging-with-diff3/
https://en.wikipedia.org/wiki/Diff3
https://metacpan.org/pod/Algorithm::Merge
https://blog.git-init.com/the-magic-of-3-way-merge/
https://en.wikipedia.org/wiki/Merge_(version_control)
https://news.ycombinator.com/item?id=34557827
https://medium.com/@karol.rossa/git-3-way-merge-addc2728c300
https://tonyg.github.io/revctrl.org/ThreeWayMerge.html
https://gist.github.com/memononen/2c83d183c2749e5f4a493ce7ddb73f4d
https://link.springer.com/chapter/10.1007/978-3-030-52249-0_6
https://automerge.org/
https://stack.convex.dev/automerge-and-convex
https://github.com/yjs/yjs
https://crdt.tech/implementations
https://www.powersync.com/blog/why-cinapse-moved-away-from-crdts-for-sync
https://velt.dev/blog/best-crdt-libraries-real-time-data-sync
https://docs.yjs.dev/
https://dev.to/hexshift/building-offline-first-collaborative-editors-with-crdts-and-indexeddb-no-backend-needed-4p7l
https://jackson.dev/post/crdts_as_database/
https://news.ycombinator.com/item?id=46069598
https://forum.obsidian.md/t/robust-sync-conflict-resolution/93544
https://forum.obsidian.md/t/option-to-let-user-manually-resolve-sync-conflicts/94468
https://forum.obsidian.md/t/synchronization-conflicts-in-obsidian-folder/77080
https://help.obsidian.md/sync/troubleshoot
https://forum.obsidian.md/t/purchased-sync-need-to-resolve-conflicts-before-setting-up-remote-vault/79906
https://deepwiki.com/obsidianmd/obsidian-help/2.3-filters-and-views
https://retypeapp.github.io/obsidian/sync/troubleshoot/
https://forum.syncthing.net/t/obsidian-conflicts/19101
https://deepwiki.com/victor-software-house/obsidian-help/5.6-troubleshooting-sync
https://deepwiki.com/obsidianmd/obsidian-help/2.4-collaboration-and-shared-vaults
https://darcs.net/Theory/MergersDocumentation
https://en.wikibooks.org/wiki/Understanding_Darcs/Patch_theory_and_conflicts
https://en.wikibooks.org/wiki/Understanding_Darcs/Patch_theory
https://en.wikipedia.org/wiki/Darcs
https://darcs.net/Theory/PekkaPatchTheory
https://www.cs.tufts.edu/~nr/cs257/archive/jason-dagit/tmr-darcs.pdf
https://www.cs.tufts.edu/~nr/cs257/archive/david-roundy/Theory%20of%20patches.html
https://darcs.net/Talks/DagitThesis
https://darcs.net/Theory/Questions
https://discuss.logseq.com/t/seflhosted-logseq-db-synching/34537/8
https://discuss.logseq.com/t/realtime-sync-via-ipfs/12471
https://discuss.logseq.com/t/seflhosted-logseq-db-synching/34537
https://discuss.logseq.com/t/building-a-self-hostable-sync-implementation/21850
https://github.com/bcspragu/logseq-sync
https://deepwiki.com/logseq/logseq/4.3-repository-and-graph-management
https://blog.logseq.com/how-to-setup-and-use-logseq-sync/
https://github.com/google/diff-match-patch
https://github.com/GerHobbelt/google-diff-match-patch
https://pypi.org/project/diff-match-patch/
https://github.com/google/diff-match-patch/issues/7
https://code.google.com/archive/p/google-diff-match-patch/
https://github.com/ace-diff/ace-diff
https://github.com/google/diff-match-patch/blob/master/README.md
https://mattrickard.com/diff3-shortcomings
https://diffcheck.ai/blog/ultimate-guide-code-comparison-merge-conflicts
https://blog.jcoglan.com/2017/06/19/why-merges-fail-and-what-can-be-done-about-it/
https://git-scm.com/docs/git-merge/2.38.0
https://news.ycombinator.com/item?id=30069822
https://blog.nilbus.com/take-the-pain-out-of-git-conflict-resolution-use-diff3/
https://www.morphllm.com/edit-formats/diff-format-explained
https://github.com/microsoft/vscode/issues/28507
https://arxiv.org/pdf/1802.06551
https://deepwiki.com/obsidianmd/obsidian-help/3.1-obsidian-sync
https://groups.google.com/g/diff-match-patch/c/6HK8QKgc5Pc
https://github.com/antfu/diff-match-patch-es
https://www.npmjs.com/package/@sanity/diff-match-patch
https://www.npmjs.com/package/diff-match-patch-ts
https://www.npmjs.com/package/diff-match-patch
https://www.npmjs.com/package/diff-match-patch-es
https://github.com/bhousel/node-diff3
https://www.npmjs.com/package/node-diff3
https://www.npmjs.com/package/@types/diff-match-patch
https://www.npmjs.com/package/diff
https://github.com/movableink/three-way-merge
https://neil.fraser.name/writing/sync/
https://research.google.com/pubs/archive/35605.pdf
https://www.researchgate.net/publication/221353119_Differential_synchronization
https://www.semanticscholar.org/paper/Differential-synchronization-Fraser/2f0a232b8be9fba2ee34dc583d34a849784cfddf
https://research.google/pubs/pub35605/
https://simonwillison.net/2009/Jan/24/neil/
https://scispace.com/papers/differential-synchronization-4846pabuya
https://dl.acm.org/doi/10.1145/1600193.1600198
https://github.com/kestasjk/DiffSync.NET
https://mjtsai.com/blog/2015/07/21/differential-synchronization/
https://medium.com/@raphlinus/working-code-for-operational-transformation-crdt-hybrid-9d04a57309da
https://raphlinus.github.io/xi/2020/06/27/xi-retrospective.html
https://github.com/google/ot-crdt-papers
https://dl.acm.org/doi/10.1145/3380787.3393680
https://news.ycombinator.com/item?id=17742071
https://news.ycombinator.com/item?id=18220020
https://news.ycombinator.com/item?id=18191867
https://inria.hal.science/hal-00957167v1/document
https://arxiv.org/pdf/1810.02137
https://www.diva-portal.org/smash/get/diva2:1304659/FULLTEXT01.pdf
https://archive.casouri.cc/note/2025/practical-intro-ot/
https://martin.kleppmann.com/2020/07/06/crdt-hard-parts-hydra.html
https://martin.kleppmann.com/2018/03/05/qcon-london.html
https://news.ycombinator.com/item?id=39615987
https://josephg.com/blog/crdts-are-the-future/
https://martin.kleppmann.com/2022/03/28/rainbowfs-workshop.html
https://tonsky.me/blog/crdt-filesync/
https://crdt.tech/papers.html
https://martin.kleppmann.com/papers/move-op.pdf
https://lobste.rs/s/w9toij/local_first_forever_crdt_filesync
https://github.com/tonsky/crdt-filesync
https://github.com/alexanderop/awesome-local-first
https://dev.to/charlietap/synking-all-the-things-with-crdts-local-first-development-3241
https://jhellerstein.github.io/blog/crdt-intro/
https://github.com/3timeslazy/crdt-over-fs
https://news.ycombinator.com/item?id=45462022
https://www.iankduncan.com/engineering/2025-11-27-crdt-dictionary/
https://loro.dev/docs/concepts/crdt
https://en.wikipedia.org/wiki/Conflict-free_replicated_data_type
https://pages.lip6.fr/syncfree/index.php/2-uncategorised/50-faq-on-crdts.html
http://archagon.net/blog/2018/03/24/data-laced-with-history/
https://medium.com/@m.hassan.def/crdts-in-action-data-consistency-without-consensus-930d30b059be
https://mattweidner.com/2025/05/21/text-without-crdts.html
https://gist.github.com/ndarville/3166060
https://github.com/myndzi/heckel-diff
https://snippets.cacher.io/snippet/8aec405c4a9cf055a8c3
https://github.com/DanielFi/heckel-diff
https://cocoapods.org/pods/HeckelDiff
https://gist.github.com/regexident/19b066f86c701fae256600f4ae656934
https://medium.com/@livajorge7/understanding-the-diff-algorithm-and-its-applications-in-software-development-fe094895d92a
https://www.npmjs.com/package/heckel-diff
https://en.wikipedia.org/wiki/File_comparison
https://github.com/mcudich/HeckelDiff
https://git-scm.com/docs/merge-config
https://github.com/Praqma/git-merge-driver
https://www.gregmicek.com/software-coding/2020/01/13/how-to-write-a-custom-git-merge-driver/
https://www.julianburr.de/til/custom-git-merge-drivers
https://www.graphite.com/guides/git-merge-driver
https://github.com/fcostin/jsonmerge_git_merge_driver
https://github.com/balbuf/composer-git-merge-driver
https://github.com/npm/npm-merge-driver
https://git-scm.com/book/en/v2/Git-Tools-Rerere
https://www.kernel.org/pub/software/scm/git/docs/git-rerere.html
https://git-scm.com/docs/git-rerere
https://comprendre-git.com/en/protips/git-rerere/
https://gist.github.com/skipcloud/f1033afb4fa5681d69fa63458cc95928
https://github.com/githubtraining/advanced-git/blob/master/cheat-sheets/5-git-rerere.md
https://www.researchgate.net/publication/235601716_On_Consistency_of_Operational_Transformation_Approach
https://link.springer.com/chapter/10.1007/978-3-319-06410-9_30
https://www3.ntu.edu.sg/scse/staff/czsun/projects/otfaq/
https://oneuptime.com/blog/post/2026-01-30-operational-transformation/view
https://posit-dev.github.io/automerge-r/articles/sync-protocol.html
https://github.com/automerge/automerge
https://github.com/automerge/automerge/issues/870
https://automerge.org/docs/reference/documents/text/
https://automerge.org/docs/reference/concepts/
https://automerge.org/docs/hello/
https://github.com/automerge/automerge-classic/pull/458
https://people.cs.vt.edu/~nm8247/publications/jsa23.pdf
https://aaltodoc.aalto.fi/server/api/core/bitstreams/cd83234f-72c9-443d-b9f4-3ab58db341c9/content
https://about.gitlab.com/blog/2018/07/03/solving-gitlabs-changelog-conflict-crisis/
https://urchin.earth.li/darcs/ganesh/darcs-patch-theory/theory/formal.pdf
https://github.com/iilab/contentascode/issues/12
https://github.com/opensearch-project/neural-search/issues/751
https://github.com/openclaw/openclaw/discussions/28027
https://docs.langchain.com/oss/python/integrations/splitters/markdown_header_metadata_splitter
https://github.com/kometenstaub/obsidian-version-history-diff
https://github.com/Vinzent03/obsidian-git
https://github.com/nkohari/kseq
https://www.bartoszsypytkowski.com/non-interleaving-lseq/
https://discuss.logseq.com/t/will-logseq-sync-be-open-source/31903
https://news.ycombinator.com/item?id=18192147
https://news.ycombinator.com/item?id=47197267
https://www.obsidianstats.com/plugins/obsidian-version-history-diff
```
