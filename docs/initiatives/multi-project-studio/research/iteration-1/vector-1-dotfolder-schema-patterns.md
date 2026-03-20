# Vector 1: Dotfolder Schema Patterns

**Question:** What conventions do popular dotfolder configurations follow, and what makes a good dotfolder schema?
**Agent dispatched:** 2026-03-20

## Findings

### 1. `.github/` — The Gold Standard for Convention-Based Discovery

- CI/CD automation (`.github/workflows/*.yml`) — any `.yml`/`.yaml` file auto-discovered
- Community health files (`CODEOWNERS`, `FUNDING.yml`, `SECURITY.md`, `CONTRIBUTING.md`)
- Templates (`ISSUE_TEMPLATE/`, `PULL_REQUEST_TEMPLATE.md`)
- **Discovery:** Pure convention-based auto-discovery. No registration step. File name is arbitrary; the `on:` key inside the YAML determines behavior
- **Inheritance:** Org-level `.github` repository provides defaults. Repo-level files override org-level completely (not merge — full replacement at the directory level)
- **Git status:** 100% committed
- **Schema:** Mixed flat files and directories. Flat for singletons, directories for collections

### 2. `.vscode/` — Layered Settings with Explicit Override Precedence

- Fixed file names (`settings.json`, `launch.json`, `tasks.json`, `extensions.json`)
- **Inheritance:** Five-layer cascade: Default > User > Remote > Workspace > Workspace Folder. Some settings restricted — application-wide settings cannot be overridden at workspace level
- **Anti-pattern:** Lacks `settings.local.json` — open issue since 2017 ([VS Code Issue #37519](https://github.com/microsoft/vscode/issues/37519))

### 3. `.claude/` — Hierarchical Memory with Glob-Scoped Rules

- **Split:** `settings.json` (committed) vs `settings.local.json` (gitignored)
- Rules: all files in `.claude/rules/` auto-loaded; those with `globs:` frontmatter conditionally loaded
- Skills: metadata loaded at startup; full content loaded on invocation
- **Inheritance:** Four-layer hierarchy: Global (`~/.claude/CLAUDE.md`) > Project > Directory-specific > Modular rules. Deny rules always win regardless of layer.

### 4. `.nx/` — Machine-Generated Cache with Selective Gitignore

- Only cache and machine-generated data. All configuration lives in `nx.json` at root
- **Lesson learned:** Nx recommends selectively ignoring subdirectories, not the whole `.nx/` folder, because future versions may add committed content

### 5. `.turbo/` — Config Lives Outside

- Dotfolder is only for ephemeral data. All config in `turbo.json` at root
- **Inheritance:** `turbo.json` supports package-level extension via `"extends": ["//"]`. Scalar fields inherit, array fields replace by default

### 6. `.changeset/` — Human+Machine Hybrid with Strict Schema

- One `config.json` with a formal JSON Schema
- Changeset files are YAML frontmatter + markdown body, auto-discovered by extension
- **100% committed** — travel with PRs and accumulate until release

### 7. `.husky/` — Executable Convention

- Files named exactly after Git hooks. The filename IS the convention
- Sets `core.hooksPath = .husky` — simplest schema of any dotfolder

### 8. `.storybook/` — Code-as-Config

- Fixed entry points (`main.js`, `preview.js`, `manager.js`)
- Stories discovered via glob patterns defined in config

## Common Patterns

1. **Convention-based discovery over explicit registration** — best dotfolders minimize config-about-config
2. **Committed/ignored split is consistent** — config committed, cache/machine-data ignored
3. **Config lives outside the dotfolder; data lives inside** — `.nx/` and `.turbo/` keep config at root
4. **Layered override with "most specific wins"** — `.vscode/` (5 layers), `.claude/` (4 layers)
5. **Flat files for singletons, directories for collections**
6. **Fixed filenames for entry points, free naming for collection members**
7. **YAML frontmatter as lightweight schema** — established pattern for human-authored content with machine-readable metadata

## Anti-Patterns

1. **All-or-nothing gitignore** — always selectively ignore subdirectories, not the root
2. **No local override mechanism** — VS Code's missing `settings.local.json` is a known gap
3. **Config-about-config** — needing a config file to find config files
4. **Mixing ephemeral and permanent data** without clear boundaries
5. **Monolithic config files** — trend is toward directories of focused files

## Sources

- [GitHub Special Files and Paths](https://github.com/joelparkerhenderson/github-special-files-and-paths)
- [GitHub Default Community Health Files](https://docs.github.com/en/communities/setting-up-your-project-for-healthy-contributions/creating-a-default-community-health-file)
- [VS Code User and Workspace Settings](https://code.visualstudio.com/docs/configure/settings)
- [Claude Code Memory Docs](https://code.claude.com/docs/en/memory)
- [Claude Code Settings](https://code.claude.com/docs/en/settings)
- [Nx Folder Structure](https://nx.dev/docs/concepts/decisions/folder-structure)
- [Turborepo Configuration](https://turborepo.dev/docs/reference/configuration)
- [Changesets Config Options](https://github.com/changesets/changesets/blob/main/docs/config-file-options.md)
- [Husky Docs](https://typicode.github.io/husky/)
- [Storybook Configuration](https://storybook.js.org/docs/configure)

## Implications for `.sherpa/`

1. **Split committed/ignored zones** — rules, skills, agents committed; db, cache ignored
2. **Convention-based discovery for collections** — auto-discover by glob, no registration manifest
3. **Formal JSON Schema for config** — enables IDE validation
4. **Layered overrides** — global (`~/.sherpa/`) > project (`.sherpa/`) > local (gitignored)
5. **Keep root config at project root** — `sherpa.config.ts` stays at root, dotfolder is for data
6. **Separate human-authored from machine-generated** — explicit directory boundary

## Open Questions

1. Should `.sherpa/` absorb `.claude/rules/` and `.claude/skills/`, or coexist alongside?
2. Database files — committed or ignored? SQLite doesn't diff well in git.
3. Should initiatives/tasks live in `.sherpa/` or remain in `docs/`?
4. Schema versioning strategy — how do older projects upgrade?
