---
decision: "Commit generated governance file to git, not .gitignore it"
date: 2026-03-19
skill: /design
alternatives-rejected:
  - ".gitignore + generate on demand — Luna on VPS would need to run generator after every pull, adding a dependency"
  - "Generate at dispatch time — adds latency and failure mode to every task dispatch"
confidence: high
kill-criteria: "Reassess if generated file causes merge conflicts (unlikely — it changes only when source rules change)"
---

Luna (VPS) gets governance context on `git pull` without running the generator. The `--check` flag catches staleness at commit time. Follows the Go convention of committing generated code. The SHA256 hash in the header enables lightweight verification.
