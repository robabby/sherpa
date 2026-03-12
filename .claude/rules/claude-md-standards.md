---
description: Standards for authoring and maintaining CLAUDE.md files
globs:
  - "**/CLAUDE.md"
---

# CLAUDE.md Authoring Standards

## Size Limits

- **30-100 lines ideal**, 200 lines hard max
- Files exceeding 200 lines must be split — move detail to `docs/architecture/` or `docs/plans/`

## The Mistake Test

Every line must pass: "Would removing this cause Claude to make mistakes?" If not, delete it.

## What Belongs

- Commands to build, test, lint
- Non-obvious conventions and gotchas
- Architectural constraints and integration rules that cross module boundaries
- Pointers to deeper docs (`file:line` references, plain text paths)

## What Does NOT Belong

- File listings (use `ls` or `Glob`)
- Type definitions (read source)
- Usage examples for obvious APIs
- Feature inventories (move to `docs/architecture/`)
- Aspirational/roadmap content (move to `docs/roadmap.md`)

## Pointer Rules

- **Prefer pointers over copies**: Use `file:line` references, not code snippets
- **`@` import rules**: Never `@`-import from root CLAUDE.md (loads everywhere). Only `@`-import from scoped CLAUDE.md files where the referenced doc is always relevant in that directory context.
- **Architecture docs**: Deep reference content lives in `docs/architecture/` or `apps/*/docs/architecture/` — referenced via plain text pointers, NOT `@`-imported

## Cross-Cutting Conventions

- Conventions shared by 3+ files belong in `.claude/rules/` with `globs:` frontmatter
- Single-source-of-truth eliminates drift across app CLAUDE.md files

## What Doesn't Need CLAUDE.md

- Hook directories: convention-layer `src/hooks/CLAUDE.md` covers patterns; individual hooks are self-documenting
- Modules with only type exports or simple barrel re-exports

## Token Budget

Any task should load no more than ~4,000 tokens of CLAUDE.md context (root + app + convention + module + rules).
