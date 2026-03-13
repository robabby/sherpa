---
status: seed
source-iteration: 1
spawned-from: sqlite-agentic-state
created: 2026-03-11
priority: high
---

# Filesystem-Database Duality: The Sherpa Sync Algorithm

## Context

Iteration 1 identified the Fossil SCM pattern (canonical data in files, derived queryable state in SQLite) as the core architectural insight. But the research stopped at the concept level. The exact mechanism — how `sherpa sync` parses Markdown frontmatter into SQLite rows, how state changes flow back, and how the rebuild-from-filesystem algorithm works — is unresolved.

## Question

What is the exact algorithm for bidirectional synchronization between Sherpa's Markdown initiative files and its SQLite metadata database? What are the conflict semantics when both have been modified? How does the rebuild work?

## Suggested Vectors

1. **Fossil SCM's rebuild algorithm** — How does `fossil rebuild` work? What's the actual code path for regenerating derived tables from the blob store? What invariants does it maintain?
2. **Frontmatter parsing at scale** — gray-matter, remark-frontmatter, or manual YAML parsing? Performance on 100+ initiative files? Incremental parsing (only changed files)?
3. **Bidirectional sync semantics** — When SQLite says `status: approved` but the Markdown still says `status: pending`, which wins? File modification time? Version columns? Git status?
4. **Section-level prose sync connection** — The sibling initiative `section-level-prose-sync` works on three-way merge for Markdown sections. How does that algorithm compose with frontmatter-to-SQLite sync?

## Links

- [Fossil SCM](https://fossil-scm.org/)
- [Fossil rebuild docs](https://fossil-scm.org/home/help/rebuild)
- [gray-matter](https://github.com/jonschlinkert/gray-matter)
- Sibling initiative: `docs/initiatives/section-level-prose-sync/`
