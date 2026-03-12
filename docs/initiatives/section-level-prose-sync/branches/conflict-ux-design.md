---
status: launched
sub-initiative: sub-initiatives/conflict-ux-design
source-iteration: 1
spawned-from: section-level-prose-sync
created: 2026-03-11
priority: high
---

# Conflict UX Design for Section-Level Sync

## Context

The merge algorithm is well-defined (iteration 1 converged on section-level three-way diff3). The open question is: when both upstream and consumer modify the same section, what does the user see? This is a distinct UX design problem from the algorithm itself — it spans CLI interaction design, editor integration, and potentially Studio UI.

## Question

What is the optimal conflict presentation and resolution UX for section-level sync conflicts in a CLI-first developer tool? Should conflicts be inline (git-style markers), interactive (CLI prompt per conflict), or visual (VS Code/Studio merge editor)?

## Suggested Vectors

1. **Copier and Cruft conflict UX** — How do these tools present conflicts? File-level `.rej` files, inline markers, or interactive prompts? User satisfaction data?
2. **VS Code merge editor integration** — Can a CLI tool launch VS Code's three-way merge editor programmatically? What API surface exists? How does `git mergetool` integrate?
3. **Section-level conflict markers** — Design a richer conflict marker format that includes section title, which version changed, and the intra-section diff. Compare to git's `<<<<<<<`/`=======`/`>>>>>>>`.
4. **Interactive CLI conflict resolution** — Ink/React CLI frameworks for presenting section-level diffs interactively. Accept upstream / keep mine / edit manually / defer per section.
5. **Studio UI for visual merge** — A web-based section-level merge interface showing upstream and consumer versions side-by-side with per-section accept/reject buttons.

## Links

- [Copier conflict handling](https://copier.readthedocs.io/en/stable/configuring/#conflict)
- [VS Code merge editor](https://code.visualstudio.com/docs/sourcecontrol/overview#_3way-merge-editor)
- [git mergetool](https://git-scm.com/docs/git-mergetool)
- [Ink - React for CLIs](https://github.com/vadimdemedes/ink)
