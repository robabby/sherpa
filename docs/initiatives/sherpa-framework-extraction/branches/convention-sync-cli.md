---
status: seed
source-iteration: 1
spawned-from: sherpa-framework-extraction
created: 2026-03-11
priority: high
---

# Convention Sync CLI

## Context

Iteration 1 revealed that convention distribution is the hardest unsolved problem in the Sherpa framework extraction. Code packages have npm. Executable conventions have Claude Code plugins. But prose conventions (`.claude/rules/`, CLAUDE.md templates, agent role definitions, task schemas) have no established distribution or update mechanism.

Copier (Python) offers three-way merge for templates, but it's foreign to a JS/TS ecosystem. Git subtree creates invisible state. Manual copy-paste leads to drift. The gap is a `sherpa sync` CLI that tracks which files came from the framework and presents diffs for human review.

## Question

What is the minimum viable convention sync tool for Sherpa? How does it track provenance (which files came from the framework vs. local additions), detect drift, handle conflicts, and present update diffs — all for Markdown + YAML frontmatter files?

## Suggested Vectors

1. **Copier deep dive** — How does Copier's three-way merge actually work? What data structures does it use? Could the algorithm be reimplemented in TypeScript without the full Copier toolchain?
2. **Manifest-based tracking** — Design a `sherpa.manifest.json` that records file provenance (framework version, file hash, local modifications). How do similar tools (Homebrew, Nix, npm) track file provenance?
3. **Diff presentation UX** — How should convention diffs be presented to a human? Terminal-based diff? HTML diff report? Integration with Claude Code for AI-assisted merge? How does Backstage's upgrade helper present structural diffs?
4. **`*.local.md` override pattern** — Can Sherpa adopt an inheritance model where `behavioral-engineering.md` is framework-owned (read-only) and `behavioral-engineering.local.md` is consumer-owned (custom additions)? How would Claude Code's `globs:` frontmatter interact with this?

## Links

- [Copier docs](https://copier.readthedocs.io/)
- [Backstage upgrade helper](https://backstage.github.io/upgrade-helper/)
- [Expo upgrade helper](https://docs.expo.dev/workflow/upgrading-expo-sdk-walkthrough/)
- [Claude Code rules docs](https://code.claude.com/docs/en/rules)
