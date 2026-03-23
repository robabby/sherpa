---
decision: "Adopt regenerate-and-diff with embedded hash for drift detection"
date: 2026-03-19
skill: /radar
alternatives-rejected:
  - "Timestamp-based staleness — breaks on git checkout, cache restores, cross-machine transfers"
  - "RAG with version tracking — overkill infrastructure for 6 source files"
confidence: high
kill-criteria: "Reassess when source rule count exceeds 20 files or when generator execution time exceeds 5 seconds"
---

Generator script with `--check` flag, composite SHA256 of source files embedded in generated header. Follows the Kubernetes `verify-codegen.sh` pattern. Content hashing is strictly superior to timestamps for cross-machine reliability. Agents trust documentation absolutely (Codified Context, 2026) — stale governance is more dangerous for AI agents than for humans.
