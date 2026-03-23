---
doc-type: decision
decision: 0013
authored-by: ai
reviewed-by: null
last-updated: 2026-03-20
source-initiatives:
  - multi-project-studio
status: accepted
---

> **AI-extracted** from multi-project-studio · Awaiting human review

## Context

Sherpa's config was defined in `sherpa.config.ts` using `defineConfig()`. This required TypeScript knowledge to edit, couldn't be generated programmatically by agents (Luna, `sherpa init`), and provided no IDE autocompletion without running the TypeScript language server. Multi-project support required a config format that non-technical personas and automated tooling could produce.

## Decision

`sherpa.json` is the canonical config format. The loader discovers `sherpa.json` at the project root or `.sherpa/config.json` in the dotfolder. `sherpa.config.ts` is retained as an escape hatch for plugins and computed values — a deliberate dual-format approach validated by stress-test finding A2 (plugins are function types that JSON cannot represent, but no plugins are currently in use).

The loader interpolates `${ENV_VAR}` references before parsing, enabling environment-specific path resolution (e.g., `${SHERPA_PROJECTS_DIR}/wavepoint` resolves to `/Users/rob/Workbench/wavepoint` locally and `/root/wavepoint` on the VPS).

## Consequences

- JSON Schema (`$schema` field) provides IDE autocompletion without TypeScript
- Agents and CLI tools can generate and modify config programmatically
- Plugin-dependent configs must still use `sherpa.config.ts`
- Two config discovery paths to maintain (`sherpa.json` and `.sherpa/config.json`)
- Env var interpolation adds a pre-parse step that could produce confusing errors if variables are unset (mitigated by throwing with the variable name)
