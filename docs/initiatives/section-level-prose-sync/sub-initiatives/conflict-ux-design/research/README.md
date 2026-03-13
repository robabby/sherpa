# Conflict UX Design — Research

## Summary

Research into conflict presentation and resolution UX for `sherpa sync`'s section-level three-way merge. Spans four surfaces: batch file markers, interactive CLI, editor integration, and Studio UI.

## Iterations

### Iteration 1 (2026-03-12)
Five-vector investigation covering template sync tool UX (Copier, Cruft, Flexlate), editor merge integration (VS Code, JetBrains), conflict marker format design (git, Jujutsu, Weave, csvdiff3), interactive CLI frameworks (Ink, Clack), and web merge components (CodeMirror, Monaco). Strong convergence: four-surface escalation cascade (markers → CLI → editor → Studio) built on shared section-level diff3 output. Proposed git-compatible conflict marker format with section metadata.

## Open Questions

1. **Conflict persistence and resume** — What exactly goes in `.sherpa-conflicts.json`? How does `sherpa sync --continue` know which sections were deferred vs. resolved? How does this interact with the stored baseline in `.sherpa/sync-state/`?

2. **CI/automation mode** — When `sherpa sync` runs non-interactively (CI, pre-commit, automated PR), should it fail on conflicts? Write markers and exit non-zero? Generate a machine-readable report? How to prevent Renovate-style silent absorption?

3. **Section ownership interaction with conflict UX** — `<!-- sherpa:managed -->` (always upstream) and `<!-- sherpa:owned -->` (never overwrite) eliminate conflicts for marked sections. How does the UX communicate this? Does the CLI show "auto-resolved by ownership policy"?

4. **Ink component architecture** — Concrete component design for interactive CLI: `<SectionDiff>`, `<ConflictResolver>`, `<MergeProgress>`. Scrolling for large sections. `$EDITOR` integration (Ink suspend/resume).

5. **Studio merge view integration** — How does the Studio merge panel connect to the sync engine? Real-time via MCP, or file-based `.sherpa-conflicts.json`?

## Cross-References

- `docs/initiatives/section-level-prose-sync/` — parent initiative defining the merge algorithm
- `docs/initiatives/section-level-prose-sync/branches/section-ownership-policies.md` — ownership semantics interact with conflict UX
