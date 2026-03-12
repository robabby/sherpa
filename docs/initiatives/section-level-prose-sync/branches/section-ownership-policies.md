---
status: seed
source-iteration: 1
spawned-from: section-level-prose-sync
created: 2026-03-11
priority: medium
---

# Section Ownership Policies

## Context

Iteration 1 surfaced the concept of ownership markers (`<!-- sherpa:managed -->`, `<!-- sherpa:owned -->`) inspired by Kubebuilder's scaffold markers. This is a policy layer on top of the merge algorithm — it determines per-section sync behavior beyond standard three-way merge.

## Question

What is the full taxonomy of section ownership policies for `sherpa sync`, and how should they be configured (inline markers, `sherpa.config.ts`, or both)?

## Suggested Vectors

1. **Kubebuilder scaffold markers deep dive** — How do `//+kubebuilder:scaffold:` markers work in practice? What policies exist (never-touch, always-regenerate, append-only)? User pain points?
2. **ESLint/Prettier config inheritance** — How do `extends` + `overrides` patterns handle "framework defaults + consumer customization"? Can we map config inheritance semantics to section ownership?
3. **Helm values and Kustomize patches** — Overlay semantics. How does "base + overlay = merged" work for structured config? Can section ownership be expressed as a merge strategy per section?
4. **Policy taxonomy design** — Define the full set: `managed` (always upstream), `owned` (never overwrite), `synced` (standard three-way, default), `locked` (error if either side changes), `deprecated` (warn if consumer still uses). Edge cases and interactions.
5. **Configuration surface** — Where do policies live? Inline markers in the markdown file, `sherpa.config.ts` rules, or `.sherpa/sync-manifest.json`? Precedence rules when multiple sources specify policies.

## Links

- [Kubebuilder markers](https://book.kubebuilder.io/reference/markers)
- [ESLint configuration](https://eslint.org/docs/latest/use/configure/)
- [Kustomize strategic merge patches](https://kubectl.docs.kubernetes.io/references/kustomize/kustomization/patches/)
- [Helm values](https://helm.sh/docs/chart_template_guide/values_files/)
