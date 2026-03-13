# Iteration 2 — CLI Linting Tool Packaging & Distribution

**Question:** How do successful CLI linting tools package and distribute? What's the right strategy for behavioral-lint?

**Date:** 2026-03-11

## Research Vectors

### Vector 1: npm Package Structure

**How do major linters structure their npm packages?**

**ESLint** (100M+ weekly downloads)
- Single `eslint` package on npm
- `bin` field: `{ "eslint": "./bin/eslint.js" }` — Node.js script, not native binary
- `main`: `./lib/api.js` (programmatic API separate from CLI)
- `exports` field restricts internal module access: `.`, `./config`, `./package.json`, `./use-at-your-own-risk`, `./rules`, `./universal`
- Monorepo structure but publishes sub-packages separately: `eslint`, `@eslint/js`, `@eslint/eslintrc`, etc.
- Source: [eslint/package.json on GitHub](https://github.com/eslint/eslint/blob/main/package.json), [ESLint exports RFC](https://github.com/eslint/rfcs/tree/main/designs/2021-package-exports)

**Prettier** (~82M weekly downloads)
- Single `prettier` package
- `bin` field: `node_modules/prettier/bin/prettier.cjs`
- Uses `cosmiconfig` for config file discovery (the industry standard library for this)
- 8.58 MB package size — ships everything in one package, no platform splitting
- Source: [Prettier Install Docs](https://prettier.io/docs/install), [Prettier Configuration](https://prettier.io/docs/configuration)

**markdownlint-cli2** (~1.2M weekly downloads)
- Three-package architecture: `markdownlint` (library), `markdownlint-cli` (original CLI), `markdownlint-cli2` (rewrite)
- `bin` field: `{ "markdownlint-cli2": "markdownlint-cli2-bin.mjs" }`
- Config-driven (no CLI flags for rule configuration — all via config files)
- Supports config in every directory (hierarchical, like `.eslintrc` used to)
- Source: [markdownlint-cli2 GitHub](https://github.com/DavidAnson/markdownlint-cli2), [markdownlint-cli2 npm](https://www.npmjs.com/package/markdownlint-cli2)

**Key pattern:** Pure-JS linters ship as single npm packages with a `bin` field pointing to a Node.js script. Library and CLI are often separate packages in a monorepo.

### Vector 2: Binary Distribution (Non-JS Linters)

**How do linters written in compiled languages distribute via npm?**

**Biome** (~6.5M weekly downloads, Rust)
- Main package `@biomejs/biome` is a lightweight shim
- 8 platform-specific packages as `optionalDependencies`:
  - `@biomejs/cli-darwin-arm64`, `@biomejs/cli-darwin-x64`
  - `@biomejs/cli-linux-arm64`, `@biomejs/cli-linux-x64`
  - `@biomejs/cli-linux-arm64-musl`, `@biomejs/cli-linux-x64-musl`
  - `@biomejs/cli-win32-arm64`, `@biomejs/cli-win32-x64`
- Each platform package has `os` and `cpu` fields in package.json — npm auto-installs only the matching one
- `generate-packages.mjs` script creates the package structure at build time
- Also distributed via Homebrew (`brew install biome`) and Docker
- Source: [Biome Manual Installation](https://biomejs.dev/guides/manual-installation/), [Biome npm](https://www.npmjs.com/package/@biomejs/biome), [DeepWiki Biome CI/CD](https://deepwiki.com/biomejs/biome/7.3-cicd-and-release-process)

**Vale** (Go binary, prose linter)
- NOT on npm officially — distributed via Homebrew, Chocolatey, Snapcraft, Docker, direct download
- Community npm wrappers exist: `@vvago/vale` (downloads matching binary for your system), `@ocular-d/vale-bin`
- No npm package from the Vale team themselves
- Source: [Vale Installation](https://vale.sh/docs/vale-cli/installation/), [vale Homebrew formula](https://formulae.brew.sh/formula/vale)

**Sentry's npm binary pattern** (reference implementation)
- Definitive guide: [Sentry Engineering: Publishing Binaries on npm](https://sentry.engineering/blog/publishing-binaries-on-npm)
- Pattern: platform packages with `os`/`cpu` fields in `optionalDependencies`
- Postinstall fallback script downloads binary from npm registry if optionalDeps fail
- `bin/cli` wrapper script calls `require('../index.js').runBinary()`
- `getBinaryPath()` function checks optionalDep first, falls back to local binary

**Implication for behavioral-lint:** Since our tool is pure TypeScript (gray-matter + Zod + regex), we don't need binary distribution at all. Single npm package with a `bin` field is the right approach. This is the simplest and most widely-understood pattern.

### Vector 3: Naming Conventions

**What names work on npm for CLI linting tools?**

**Successful patterns:**
| Package | Style | Weekly Downloads |
|---------|-------|-----------------|
| `eslint` | Single word | 100M+ |
| `prettier` | Single word | 82M |
| `@biomejs/biome` | Scoped | 6.5M |
| `markdownlint-cli2` | Descriptive-suffix | 1.2M |
| `vale` | Single word | N/A (not on npm) |
| `lint-staged` | Verb-noun | 14M+ |
| `yaml-lint` | Subject-verb | 42K |

**npm naming rules** (source: [npm Package Name Guidelines](https://docs.npmjs.com/package-name-guidelines/)):
- All lowercase, no uppercase allowed
- Can include dots, dashes, underscores (dashes preferred)
- Cannot differ from existing packages in punctuation only
- Scoped packages: `@scope/name`

**Name availability check (2026-03-11):**
| Name | Available? | Notes |
|------|-----------|-------|
| `agent-lint` | YES | Clean, generic, discoverable |
| `behavioral-lint` | YES | Descriptive but niche |
| `role-lint` | YES | Too vague |
| `agentic-lint` | YES | Trendy but may age poorly |
| `agentlint` | **TAKEN** | Security scanner for AI agent configs (v0.3.0, by akz4ol) |
| `@sherpa/lint` | YES | Requires `sherpa` npm org |
| `@sherpa/behavioral-lint` | YES | Requires `sherpa` npm org |
| `lint-agent` | YES | Reversed convention |
| `cclint` | YES | But `@carlrannaberg/cclint` exists (Claude Code project linter) |

**Competitor analysis:**
- **`agentlint`** (v0.3.0, published ~Feb 2026): Security scanner for AI agent config files. Detects curl|bash, secret leaks, privilege escalation. 20 rules across 8 categories (EXEC, FS, NET, SEC, HOOK, INST, SCOPE, OBS). Different focus than behavioral-lint — security vs. behavioral quality. Source: [agentlint npm](https://www.npmjs.com/package/agentlint), [agentlint GitHub](https://github.com/akz4ol/agentlint)
- **`@carlrannaberg/cclint`**: Claude Code project linter. Validates agents, commands, settings.json, CLAUDE.md. More structural than behavioral. Source: [cclint GitHub](https://github.com/carlrannaberg/cclint)
- **`aigent`**: Rust CLI for Agent Skills specification. Validate, format, score, build agent skills. On crates.io, not npm. Source: [aigent GitHub](https://github.com/wkusnierczyk/aigent), [aigent crates.io](https://crates.io/crates/aigent)

**Recommendation:** `behavioral-lint` is the strongest name. It's descriptive, unique, available, and directly communicates the tool's purpose. `agent-lint` is more discoverable but risks confusion with `agentlint` (the security scanner). A scoped `@sherpa/behavioral-lint` preserves the option for a broader `@sherpa/*` ecosystem later.

### Vector 4: Config File Conventions

**How do linters discover and load configuration?**

**cosmiconfig** is the de facto standard for config discovery in the JS ecosystem. Used by Prettier, stylelint, semantic-release, babel-plugin-macros, linthtml. Source: [cosmiconfig GitHub](https://github.com/cosmiconfig/cosmiconfig), [cosmiconfig npm](https://www.npmjs.com/package/cosmiconfig)

Default search order for a tool named `myapp`:
1. `package.json` `"myapp"` property
2. `.myapprc` (JSON or YAML)
3. `.myapprc.json`, `.myapprc.yaml`, `.myapprc.yml`, `.myapprc.js`, `.myapprc.ts`
4. `myapp.config.js`, `myapp.config.ts`
5. `.config/myapprc`, `.config/myapp.config.js`

**Linter config patterns comparison:**

| Linter | Config File(s) | Discovery | Format |
|--------|---------------|-----------|--------|
| ESLint v9 | `eslint.config.js` | CWD only, error if missing | JS (flat config) |
| Prettier | `.prettierrc`, `prettier.config.js`, + 10 more | cosmiconfig (walk up tree) | JSON, YAML, JS, TOML |
| Biome | `biome.json`, `biome.jsonc` | CWD, walk up tree | JSON/JSONC |
| markdownlint-cli2 | `.markdownlint-cli2.jsonc`, `.markdownlint.json` | Every directory (hierarchical) | JSON/JSONC/YAML/JS |
| Vale | `.vale.ini` | CWD, then global (~/.config/) | INI |
| agentlint | `agentlint.yaml` | CWD | YAML |
| cclint | `cclint.config.js`, `.cclintrc.json` | CWD, walk up tree | JS/JSON |

Sources: [ESLint Configuration Files](https://eslint.org/docs/latest/use/configure/configuration-files), [Prettier Configuration](https://prettier.io/docs/configuration), [Biome Configure](https://biomejs.dev/guides/configure-biome/), [markdownlint-cli2 README](https://github.com/DavidAnson/markdownlint-cli2/blob/main/README.md), [Vale .vale.ini](https://vale.sh/docs/vale-ini)

**ESLint's evolution is instructive:**
- v8 and earlier: `.eslintrc` (JSON/YAML/JS) with cosmiconfig-like cascading. Deprecated in v9.
- v9+: `eslint.config.js` (flat config). Single file, JavaScript only, no cascading. Simpler, more explicit.
- Source: [Flat Config Rollout](https://eslint.org/blog/2023/10/flat-config-rollout-plans/), [ESLint v9 Migration Guide](https://eslint.org/docs/latest/use/configure/migration-guide)

**Implication for behavioral-lint:** Start with zero-config (sensible defaults, no config file needed). If configuration is added later, use cosmiconfig with the name `behavioral-lint` or a single `behavioral-lint.config.js`. Don't build config file support until there's a real need — the tool validates a specific schema, not arbitrary code patterns.

### Vector 5: Plugin/Extension Architecture

**How do ESLint plugins work, and should behavioral-lint support plugins?**

**ESLint plugin architecture:**
- Plugins are npm packages named `eslint-plugin-*` or `@scope/eslint-plugin-*`
- Plugin object exports: `{ meta: { name, version }, rules: { 'rule-name': ruleImpl }, configs: { recommended: {...} } }`
- Rules receive an AST context and return visitor functions
- ESLint is a peer dependency, not a direct dependency
- Sources: [Create Plugins](https://eslint.org/docs/latest/extend/plugins), [Configure Plugins](https://eslint.org/docs/latest/use/configure/plugins), [Share Configurations](https://eslint.org/docs/latest/extend/shareable-configs)

**Other plugin models:**
- **Vale**: "Packages" — zip files containing `.vale.ini` + styles YAML. Downloadable from Package Hub or arbitrary URLs. `vale sync` installs them. Source: [Vale Packages](https://vale.sh/docs/keys/packages)
- **markdownlint**: Custom rules via `customRules` config option. Rules are Node modules matching the markdownlint rule API. Source: [markdownlint-cli2 GitHub](https://github.com/DavidAnson/markdownlint-cli2)
- **GPTLint**: Follows ESLint's config design. Two-pass LLM linting (cheap model → expensive model as discriminator). Uses GritQL patterns to pre-filter code. Source: [GPTLint How It Works](https://gptlint.dev/project/how-it-works), [GPTLint Config](https://gptlint.dev/guide/config)

**Implication for behavioral-lint:** Do NOT build a plugin system for v1. The rules are domain-specific (identity claims vs. behavioral constraints) and the rule set is small and well-defined. A plugin system adds complexity with no clear user need. If custom rules are ever needed, the simplest path is allowing additional Zod schemas or regex patterns in config — not a full plugin architecture.

### Vector 6: First-Run UX

**What makes a good zero-config CLI experience?**

**ESLint init:**
- `npm init @eslint/config` — interactive questionnaire
- Asks: How will you use ESLint? What modules? Framework? TypeScript?
- Generates `eslint.config.js` from answers
- Pain point: has been broken across versions, generates TypeScript errors — multiple GitHub issues. Source: [ESLint Getting Started](https://eslint.org/docs/latest/use/getting-started), [Bug: Type error in generated config](https://github.com/eslint/eslint/issues/19570)

**Biome init:**
- `npx @biomejs/biome init` — generates `biome.json` with sensible defaults
- No questionnaire. One command, one output file.
- "The formatter and linter worked immediately with sensible defaults"
- Source: [Biome Getting Started](https://biomejs.dev/guides/getting-started/), [Better Stack BiomeJS Guide](https://betterstack.com/community/guides/scaling-nodejs/biomejs-explained/)

**Vale sync:**
- Requires manual `.vale.ini` creation first
- `vale sync` downloads styles from Package Hub
- Two-step process: write config, then sync
- Source: [Vale .vale.ini](https://vale.sh/docs/vale-ini), [Vale Packages](https://vale.sh/docs/keys/packages)

**agentlint init:**
- `agentlint init` — generates starter `agentlint.yaml`
- Source: [agentlint GitHub](https://github.com/akz4ol/agentlint)

**Best practice (from Biome's success):** Zero-config is the gold standard. The tool should work without any configuration file. `npx behavioral-lint` should immediately lint agent definitions in the current directory. An `init` command is optional — it generates a config file only when customization is needed.

## Emerging Landscape: Linting for Agents

The research uncovered a nascent ecosystem of tools specifically for AI agent definition quality:

**Factory.ai's philosophy:** "Agents write the code; linters write the law." Linters encode architecture and boundaries directly into the code generation loop. Categories: grep-ability, glob-ability, architectural boundaries, security, testability, observability, documentation signals. Source: [Factory.ai: Using Linters to Direct Agents](https://factory.ai/news/using-linters-to-direct-agents), [Factory ESLint Plugin](https://github.com/Factory-AI/eslint-plugin), [HN Discussion](https://news.ycombinator.com/item?id=45185681)

**GitHub's AGENTS.md research (2,500+ repos):** Effective agent files share: specific commands with flags, real code examples, explicit "never do" boundaries, tech stack with versions. Anti-patterns: vague personas ("helpful coding assistant"), missing executable commands, absent constraints. Source: [GitHub Blog: How to write a great agents.md](https://github.blog/ai-and-ml/github-copilot/how-to-write-a-great-agents-md-lessons-from-over-2500-repositories/)

**Amanda Martin's practical linting for agent context files:** Shell scripts for structural checks (line count, frontmatter, file references, TODO markers) + Vale for prose quality (flagging "be helpful", "follow best practices"). Tiered CI: linting on every PR, behavioral evals nightly. Source: [Practical linting for agent context files](https://dev.to/amandamartindev/practical-linting-for-agent-context-files-322h)

**Agent Skills specification + aigent toolchain:** Formal spec for agent skill definitions (YAML frontmatter + markdown). `aigent` validates, formats, scores (0-100), tests activation. Three-tier validation: structural, specification compliance, semantic quality. Source: [agentskills.io](https://agentskills.io/specification), [aigent GitHub](https://github.com/wkusnierczyk/aigent)

**Packmind context quality:** "Writing AI coding agent context files is easy. Keeping them accurate isn't." Source: [Packmind: Evaluate context for AI coding agents](https://packmind.com/evaluate-context-ai-coding-agent/)

**TanStack Intent:** Ship Agent Skills with npm packages — library maintainers generate skills alongside their code. Source: [TanStack Blog: From Docs to Agents](https://tanstack.com/blog/from-docs-to-agents)

**Key insight:** The ecosystem is coalescing around _structural_ validation (does the YAML parse? are required fields present?) and _security_ scanning (does it reference secrets? does it shell out?). **Nobody is validating behavioral quality** — whether the instructions actually follow behavioral engineering principles vs. identity claims. That's behavioral-lint's unique position.

## Implications for behavioral-lint Packaging Strategy

### Recommended: Single npm Package (Phase 1)

```
behavioral-lint/
  package.json          # name: "behavioral-lint", bin: { "behavioral-lint": "./bin/cli.js" }
  bin/cli.js            # #!/usr/bin/env node entry point
  src/
    index.ts            # Programmatic API (for library use)
    cli.ts              # CLI argument parsing (commander or similar)
    rules/              # Rule implementations
    schemas/            # Zod schemas for agent definition validation
  tsconfig.json
```

**package.json essentials:**
```json
{
  "name": "behavioral-lint",
  "bin": { "behavioral-lint": "./bin/cli.js" },
  "main": "./dist/index.js",
  "exports": {
    ".": "./dist/index.js",
    "./rules": "./dist/rules/index.js"
  },
  "keywords": ["lint", "agent", "behavioral", "ai", "claude", "cursor", "agent-definition"],
  "files": ["dist", "bin"]
}
```

**Why single package:**
- Pure TypeScript — no native binaries needed
- ESLint, Prettier, markdownlint-cli2 all prove single-package works at scale
- Binary distribution (Biome/Sentry pattern) is engineering overhead with zero benefit for a JS tool
- Library + CLI in one package (like Prettier) until there's reason to split

### Distribution channels (phased)

| Phase | Channel | Effort | Reach |
|-------|---------|--------|-------|
| 1 | npm (`npx behavioral-lint`) | Low | JS/TS developers |
| 1 | GitHub Action | Low | CI/CD pipelines |
| 2 | Homebrew tap (`sherpa/behavioral-lint`) | Medium | macOS/Linux developers |
| 3 | VS Code extension | Medium | Editor integration |

### Config strategy

**Phase 1: Zero-config.** The tool validates against the behavioral engineering schema. No config file needed. Sensible defaults (all rules enabled, lint all `.md` files with YAML frontmatter matching agent patterns).

**Phase 2 (if needed):** `behavioral-lint.config.js` via cosmiconfig. Override: rule severity, file globs, custom patterns, allowed identity exceptions.

### Naming decision

**Primary:** `behavioral-lint` on npm. Descriptive, unique, no confusion with `agentlint` (security focus).

**CLI command:** `behavioral-lint` (or `blint` as shorthand alias).

**Future scope:** If Sherpa becomes the umbrella org, publish as `@sherpa/behavioral-lint` and keep `behavioral-lint` as an alias/wrapper.

## Open Questions That Emerged

1. **Should there be a `behavioral-lint init` that generates a starter agent definition?** Not just config — actually scaffold a `.md` file with the correct frontmatter schema.
2. **SARIF output for GitHub Code Scanning integration?** `agentlint` does this. Low effort, high CI/CD value. Worth including in v1?
3. **Should behavioral-lint also validate the body markdown quality** (like Vale does for prose) or stick to frontmatter + identity-claim detection?
4. **TanStack Intent model:** Should behavioral-lint ship as something library authors bundle with their packages? Or is it purely a development-time tool?
5. **Scoring vs. pass/fail?** `aigent` scores 0-100. `agentlint` uses pass/fail with severity levels. Which model fits behavioral quality assessment better?
6. **How does the tool handle "gray area" identity claims?** "Expert in TypeScript" is identity-claiming. "Focus on TypeScript, React, Next.js" is domain-scoping. Where's the line, and can it be encoded as rules?

## Sources (Full URLs with Descriptions)

### npm Package Structure
- [ESLint package.json on GitHub](https://github.com/eslint/eslint/blob/main/package.json) — ESLint's actual package.json with bin, main, exports
- [ESLint exports RFC](https://github.com/eslint/rfcs/tree/main/designs/2021-package-exports) — RFC for ESLint package exports design
- [Expose bin/eslint in exports discussion](https://github.com/eslint/eslint/issues/19112) — Discussion about ESLint bin accessibility
- [Prettier Install Docs](https://prettier.io/docs/install) — Prettier installation guide
- [Prettier CLI Docs](https://prettier.io/docs/cli.html) — Prettier CLI reference
- [@prettier/cli npm](https://www.npmjs.com/package/@prettier/cli) — Experimental standalone Prettier CLI
- [markdownlint-cli2 npm](https://www.npmjs.com/package/markdownlint-cli2) — markdownlint-cli2 npm page
- [markdownlint-cli2 GitHub](https://github.com/DavidAnson/markdownlint-cli2) — markdownlint-cli2 source and docs
- [markdownlint-cli2 package.json](https://github.com/DavidAnson/markdownlint-cli2/blob/main/package.json) — Actual package.json with bin field
- [markdownlint-cli npm](https://www.npmjs.com/package/markdownlint-cli) — Original markdownlint CLI
- [markdownlint-cli GitHub](https://github.com/igorshubovych/markdownlint-cli) — Original CLI source
- [markdownlint-cli2 blog post](https://dlaa.me/blog/post/markdownlintcli2) — Why markdownlint-cli2 exists
- [markdownlint-cli2 vs markdownlint-cli comparison](https://npm-compare.com/markdownlint-cli,markdownlint-cli2) — Feature comparison
- [markdownlint-cli2 Homebrew](https://formulae.brew.sh/formula/markdownlint-cli2) — Homebrew formula
- [markdownlint-cli2 config schema](https://github.com/DavidAnson/markdownlint-cli2/blob/main/schema/markdownlint-cli2-config-schema.json) — JSON schema for config

### Binary Distribution
- [Sentry Engineering: Publishing Binaries on npm](https://sentry.engineering/blog/publishing-binaries-on-npm) — Definitive guide to npm binary distribution
- [@biomejs/biome npm](https://www.npmjs.com/package/@biomejs/biome) — Biome npm page
- [Biome Manual Installation](https://biomejs.dev/guides/manual-installation/) — Platform support matrix
- [Biome Getting Started](https://biomejs.dev/guides/getting-started/) — Init command and setup
- [DeepWiki: Biome CI/CD and Release Process](https://deepwiki.com/biomejs/biome/7.3-cicd-and-release-process) — Full release architecture
- [DeepWiki: Biome Development Workflow](https://deepwiki.com/biomejs/biome/8.1-development-workflow) — Development practices
- [Biome package.json on GitHub](https://github.com/biomejs/biome/blob/main/packages/@biomejs/biome/package.json) — Actual package.json
- [npm RFC: Platform-Specific Dependencies](https://github.com/npm/rfcs/discussions/120) — RFC discussion
- [Sentry CLI optionalDeps issue](https://github.com/getsentry/sentry-cli/issues/1862) — Real-world problems with optionalDeps
- [Vale Installation](https://vale.sh/docs/vale-cli/installation/) — Vale's multi-platform install
- [Vale Homebrew](https://formulae.brew.sh/formula/vale) — Vale Homebrew formula
- [Vale GitHub](https://github.com/errata-ai/vale) — Vale source
- [@vvago/vale npm](https://www.npmjs.com/package/@vvago/vale) — Community npm wrapper for Vale
- [@ocular-d/vale-bin npm](https://www.npmjs.com/package/@ocular-d/vale-bin) — Another npm wrapper for Vale

### Naming & Package Discovery
- [npm Package Name Guidelines](https://docs.npmjs.com/package-name-guidelines/) — Official naming rules
- [npm Moniker Rules](https://blog.npmjs.org/post/168978377570/new-package-moniker-rules.html) — Squatting/similarity rules
- [validate-npm-package-name](https://github.com/npm/validate-npm-package-name) — Name validation library
- [npm-name-cli](https://github.com/sindresorhus/npm-name-cli) — CLI to check name availability
- [npm package name checker](https://remarkablemark.org/npm-package-name-checker/) — Web-based name checker
- [ESLint Package.json Conventions](https://eslint.org/docs/latest/contribute/package-json-conventions) — ESLint's internal naming standards
- [npmtrends: biome vs eslint vs prettier](https://npmtrends.com/@biomejs/biome-vs-eslint-vs-prettier) — Download comparison
- [npmtrends: markdownlint comparison](https://npmtrends.com/eslint-vs-markdownlint-vs-prettier-vs-tslint) — markdownlint download data

### Config File Conventions
- [cosmiconfig GitHub](https://github.com/cosmiconfig/cosmiconfig) — Config discovery library source
- [cosmiconfig npm](https://www.npmjs.com/package/cosmiconfig) — cosmiconfig npm page
- [DeepWiki: cosmiconfig](https://deepwiki.com/cosmiconfig/cosmiconfig) — Architecture deep dive
- [ESLint Configuration Files](https://eslint.org/docs/latest/use/configure/configuration-files) — Flat config docs
- [ESLint Flat Config Rollout](https://eslint.org/blog/2023/10/flat-config-rollout-plans/) — Why ESLint moved to flat config
- [ESLint Flat Config extends](https://eslint.org/blog/2025/03/flat-config-extends-define-config-global-ignores/) — Recent flat config improvements
- [ESLint Configuration Migration Guide](https://eslint.org/docs/latest/use/configure/migration-guide) — eslintrc → flat config
- [Prettier Configuration](https://prettier.io/docs/configuration) — All supported config formats
- [Biome Configure](https://biomejs.dev/guides/configure-biome/) — biome.json docs
- [Biome Configuration Reference](https://biomejs.dev/reference/configuration/) — Full config schema
- [Vale .vale.ini](https://vale.sh/docs/vale-ini) — Vale config format and discovery
- [Vale Packages](https://vale.sh/docs/keys/packages) — Vale package/sync system

### Plugin Architecture
- [ESLint Create Plugins](https://eslint.org/docs/latest/extend/plugins) — How to create ESLint plugins
- [ESLint Configure Plugins](https://eslint.org/docs/latest/use/configure/plugins) — How to use plugins
- [ESLint Share Configurations](https://eslint.org/docs/latest/extend/shareable-configs) — Shareable config packages
- [ESLint Custom Rule Tutorial](https://eslint.org/docs/latest/extend/custom-rule-tutorial) — Writing custom rules
- [ESLint Plugin Migration to Flat Config](https://eslint.org/docs/latest/extend/plugin-migration-flat-config) — Plugin compat guide
- [ESLint plugin naming convention article](https://allalmohamedlamine.medium.com/eslint-how-to-name-plugins-dc1763d454bc) — Naming patterns
- [GPTLint](https://gptlint.dev/) — LLM-powered linter
- [GPTLint How It Works](https://gptlint.dev/project/how-it-works) — Two-pass LLM architecture
- [GPTLint Config](https://gptlint.dev/guide/config) — Config follows ESLint design
- [GPTLint GitHub](https://github.com/gptlint/gptlint) — Source code
- [Vale Introducing Packages](https://medium.com/valelint/introducing-packages-1a079ed712f7) — Vale's extension model

### First-Run UX
- [ESLint Getting Started](https://eslint.org/docs/latest/use/getting-started) — npm init @eslint/config
- [Biome Getting Started](https://biomejs.dev/guides/getting-started/) — biome init
- [Better Stack: BiomeJS Explained](https://betterstack.com/community/guides/scaling-nodejs/biomejs-explained/) — Zero-config experience
- [Biome vs ESLint comparison (amillionmonkeys)](https://www.amillionmonkeys.co.uk/blog/biome-vs-eslint-prettier) — UX comparison
- [Biome vs ESLint (Better Stack)](https://betterstack.com/community/guides/scaling-nodejs/biome-eslint/) — Feature comparison
- [ESLint --init bug report](https://github.com/eslint/eslint/issues/19570) — Init generates broken config
- [ESLint init discussion](https://github.com/eslint/eslint/discussions/18708) — Limited options in init

### Agent Definition Ecosystem
- [agentlint npm](https://www.npmjs.com/package/agentlint) — Security scanner for agent configs
- [agentlint GitHub](https://github.com/akz4ol/agentlint) — Source code, 20 security rules
- [cclint GitHub](https://github.com/carlrannaberg/cclint) — Claude Code project linter
- [aigent GitHub](https://github.com/wkusnierczyk/aigent) — Agent Skills toolchain (Rust)
- [aigent crates.io](https://crates.io/crates/aigent) — Rust package
- [Agent Skills Specification](https://agentskills.io/specification) — Formal spec
- [skill-validator GitHub](https://github.com/agent-ecosystem/skill-validator) — Skill validation
- [@tech-leads-club/agent-skills npm](https://www.npmjs.com/package/@tech-leads-club/agent-skills) — Secure skills CLI
- [@agentskillkit/agent-skills npm](https://www.npmjs.com/package/@agentskillkit/agent-skills) — Agent skills package
- [awesome-agent-skills GitHub](https://github.com/skillmatic-ai/awesome-agent-skills) — Curated list
- [TanStack Intent Blog](https://tanstack.com/blog/from-docs-to-agents) — Ship skills with npm packages
- [AGENTS.md website](https://agents.md/) — Open format for guiding agents
- [Factory.ai: Using Linters to Direct Agents](https://factory.ai/news/using-linters-to-direct-agents) — Linter-driven agent development
- [Factory ESLint Plugin GitHub](https://github.com/Factory-AI/eslint-plugin) — Factory's custom linters
- [Factory.ai HN Discussion](https://news.ycombinator.com/item?id=45185681) — Community discussion
- [GitHub Blog: How to write a great agents.md](https://github.blog/ai-and-ml/github-copilot/how-to-write-a-great-agents-md-lessons-from-over-2500-repositories/) — 2,500 repo analysis
- [Forge Code Agent Definition Guide](https://forgecode.dev/docs/agent-definition-guide/) — Creating custom agents
- [OpenCode agent frontmatter issue](https://github.com/anomalyco/opencode/issues/3461) — YAML frontmatter agents
- [MegaLinter YAML frontmatter discussion](https://github.com/oxsecurity/megalinter/discussions/4066) — Linting YAML frontmatter
- [Practical linting for agent context files](https://dev.to/amandamartindev/practical-linting-for-agent-context-files-322h) — Shell + Vale approach
- [Packmind: Evaluate context for AI coding agents](https://packmind.com/evaluate-context-ai-coding-agent/) — Context accuracy
- [Claude Code Best Practices](https://code.claude.com/docs/en/best-practices) — Official best practices
- [Lefthook + Claude Code lint enforcement](https://liambx.com/blog/ai-agent-lint-enforcement-lefthook-claude-code) — Git hook integration

### Homebrew Distribution
- [Homebrew: Node for Formula Authors](https://docs.brew.sh/Node-for-Formula-Authors) — Definitive guide
- [Creating Homebrew Taps](https://publishing-project.rivendellweb.net/creating-and-running-your-own-homebrew-tap/) — Tap creation guide
- [Simple Homebrew Formula Example](https://mvogelgesang.com/blog/20240419/creating-a-simple-homebrew-formula/) — Minimal example
- [Homebrew Tap Discussion](https://github.com/orgs/Homebrew/discussions/491) — How to create taps
- [Homebrew Formula Packaging](https://therdnotes.com/packaging-homebrew-formula/) — Packaging guide

### General References
- [npm-package-json-lint](https://www.npmjs.com/package/npm-package-json-lint) — Configurable package.json linter
- [lint-staged npm](https://www.npmjs.com/package/lint-staged) — Pre-commit linting
- [yamllint docs](https://yamllint.readthedocs.io/) — Python YAML linter
- [CodeRabbit AI Native Universal Linter](https://www.coderabbit.ai/blog/ai-native-universal-linter-ast-grep-llm) — AI + AST grep approach
- [Docker: Fix ESLint with AI](https://www.docker.com/blog/how-to-fix-eslint-violations-with-ai-assistance/) — AI-assisted lint fixing
- [PkgPulse: Biome vs ESLint 2026](https://www.pkgpulse.com/blog/biome-vs-eslint-prettier-linting-2026) — 2026 comparison

## Raw Link List

Every URL encountered during this research, deduplicated:

```
https://eslint.org/docs/latest/use/configure/configuration-files
https://eslint.org/docs/latest/use/configure/migration-guide
https://eslint.org/docs/latest/use/configure/
https://eslint.org/blog/2023/10/flat-config-rollout-plans/
https://eslint.org/blog/2025/03/flat-config-extends-define-config-global-ignores/
https://eslint.org/docs/latest/use/configure/plugins
https://eslint.org/docs/latest/extend/plugins
https://eslint.org/docs/latest/extend/shareable-configs
https://eslint.org/docs/latest/extend/shareable-configs-deprecated
https://eslint.org/docs/latest/extend/custom-rule-tutorial
https://eslint.org/docs/latest/extend/plugin-migration-flat-config
https://eslint.org/docs/latest/use/getting-started
https://eslint.org/docs/latest/use/command-line-interface
https://eslint.org/docs/latest/contribute/package-json-conventions
https://github.com/eslint/eslint/blob/main/package.json
https://github.com/eslint/eslint/issues/19112
https://github.com/eslint/eslint/issues/19570
https://github.com/eslint/eslint/issues/11862
https://github.com/eslint/eslint/discussions/18131
https://github.com/eslint/eslint/discussions/16960
https://github.com/eslint/eslint/discussions/18708
https://github.com/eslint/rfcs/tree/main/designs/2021-package-exports
https://github.com/eslint/eslint/commit/520c922
https://prettier.io/docs/install
https://prettier.io/docs/configuration
https://prettier.io/docs/cli.html
https://prettier.io/docs/cli
https://www.npmjs.com/package/prettier
https://www.npmjs.com/package/@prettier/cli
https://github.com/prettier/prettier/issues/3709
https://github.com/prettier/prettier/pull/2434
https://biomejs.dev/guides/getting-started/
https://biomejs.dev/guides/manual-installation/
https://biomejs.dev/guides/configure-biome/
https://biomejs.dev/guides/big-projects/
https://biomejs.dev/guides/migrate-eslint-prettier/
https://biomejs.dev/reference/configuration/
https://biomejs.dev/reference/cli/
https://biomejs.dev/linter/
https://biomejs.dev/linter/rules/no-undeclared-dependencies/
https://biomejs.dev/reference/vscode/
https://www.npmjs.com/package/@biomejs/biome
https://github.com/biomejs/biome/blob/main/packages/@biomejs/biome/package.json
https://github.com/biomejs/biome
https://github.com/biomejs/biome-vscode/issues/622
https://github.com/biomejs/biome-vscode/discussions/230
https://github.com/biomejs/biome/issues/6616
https://github.com/biomejs/setup-biome
https://deepwiki.com/biomejs/biome
https://deepwiki.com/biomejs/biome/7.3-cicd-and-release-process
https://deepwiki.com/biomejs/biome/8.1-development-workflow
https://deepwiki.com/biomejs/biome/5-configuration-system
https://deepwiki.com/biomejs/biome/4.2-file-processing-pipeline
https://deepwiki.com/biomejs/biome/6-language-support
https://deepwiki.com/biomejs/setup-biome
https://deepwiki.com/biomejs/setup-biome/3.3-installation-and-setup-process
https://tessl.io/registry/tessl/npm-biomejs--biome/2.3.0
https://github.com/DavidAnson/markdownlint-cli2
https://github.com/DavidAnson/markdownlint-cli2/blob/main/package.json
https://github.com/DavidAnson/markdownlint-cli2/blob/main/README.md
https://github.com/DavidAnson/markdownlint-cli2/blob/main/schema/markdownlint-cli2-config-schema.json
https://www.npmjs.com/package/markdownlint-cli2
https://www.npmjs.com/package/markdownlint-cli
https://github.com/igorshubovych/markdownlint-cli
https://github.com/markdownlint/markdownlint/tree/main
https://dlaa.me/blog/post/markdownlintcli2
https://npm-compare.com/markdownlint-cli,markdownlint-cli2
https://npmtrends.com/markdownlint-vs-markdownlint-cli-vs-markdownlint-cli2
https://formulae.brew.sh/formula/markdownlint-cli2
https://app.unpkg.com/markdownlint-cli2@0.0.14/files/README.md
https://vale.sh/docs/vale-cli/installation/
https://vale.sh/docs/vale-ini
https://vale.sh/docs/keys/packages
https://vale.sh/docs
https://vale.sh/generator
https://formulae.brew.sh/formula/vale
https://github.com/errata-ai/vale
https://pkg.go.dev/github.com/errata-ai/vale
https://www.npmjs.com/package/@vvago/vale
https://www.npmjs.com/package/@ocular-d/vale-bin
https://medium.com/valelint/introducing-packages-1a079ed712f7
https://sentry.engineering/blog/publishing-binaries-on-npm
https://github.com/getsentry/sentry-cli/issues/1360
https://github.com/getsentry/sentry-cli/issues/1862
https://github.com/npm/rfcs/discussions/120
https://github.com/openai/codex/pull/11318
https://docs.npmjs.com/package-name-guidelines/
https://blog.npmjs.org/post/168978377570/new-package-moniker-rules.html
https://github.com/npm/validate-npm-package-name
https://github.com/sindresorhus/npm-name-cli
https://github.com/kirklin/npm-name-explorer
https://remarkablemark.org/npm-package-name-checker/
https://www.npmjs.com/package/npm-package-json-lint
https://www.npmjs.com/package/lint-staged
https://www.npmjs.com/package/yaml-lint
https://github.com/rasshofer/yaml-lint
https://yamllint.readthedocs.io/
https://yamllint.readthedocs.io/en/stable/quickstart.html
https://www.npmjs.com/package/agentlint
https://github.com/akz4ol/agentlint
https://github.com/carlrannaberg/cclint
https://github.com/wkusnierczyk/aigent
https://crates.io/crates/aigent
https://agentskills.io/specification
https://github.com/agent-ecosystem/skill-validator
https://github.com/skillmatic-ai/awesome-agent-skills
https://www.npmjs.com/package/@tech-leads-club/agent-skills
https://www.npmjs.com/package/@agentskillkit/agent-skills
https://tanstack.com/blog/from-docs-to-agents
https://agents.md/
https://factory.ai/news/using-linters-to-direct-agents
https://factory.ai
https://github.com/Factory-AI/eslint-plugin
https://news.ycombinator.com/item?id=45185681
https://github.blog/ai-and-ml/github-copilot/how-to-write-a-great-agents-md-lessons-from-over-2500-repositories/
https://forgecode.dev/docs/agent-definition-guide/
https://github.com/anomalyco/opencode/issues/3461
https://github.com/oxsecurity/megalinter/discussions/4066
https://dev.to/amandamartindev/practical-linting-for-agent-context-files-322h
https://packmind.com/evaluate-context-ai-coding-agent/
https://code.claude.com/docs/en/best-practices
https://liambx.com/blog/ai-agent-lint-enforcement-lefthook-claude-code
https://deepwiki.com/coleam00/context-engineering-intro/3.3-subagents-system
https://github.com/cosmiconfig/cosmiconfig
https://www.npmjs.com/package/cosmiconfig
https://deepwiki.com/cosmiconfig/cosmiconfig
https://gptlint.dev/
https://gptlint.dev/project/how-it-works
https://gptlint.dev/guide/config
https://gptlint.dev/guide/quick-start
https://github.com/gptlint/gptlint
https://www.coderabbit.ai/blog/ai-native-universal-linter-ast-grep-llm
https://docs.brew.sh/Node-for-Formula-Authors
https://publishing-project.rivendellweb.net/creating-and-running-your-own-homebrew-tap/
https://mvogelgesang.com/blog/20240419/creating-a-simple-homebrew-formula/
https://github.com/orgs/Homebrew/discussions/491
https://github.com/orgs/Homebrew/discussions/2804
https://therdnotes.com/packaging-homebrew-formula/
https://medium.com/@hafidz.mahrus/creating-homebrew-taps-from-github-repos-a-step-by-step-guide-5b6b5262ec44
https://npmtrends.com/@biomejs/biome-vs-eslint-vs-prettier
https://www.pkgpulse.com/blog/biome-vs-eslint-prettier-linting-2026
https://www.amillionmonkeys.co.uk/blog/biome-vs-eslint-prettier
https://betterstack.com/community/guides/scaling-nodejs/biome-eslint/
https://betterstack.com/community/guides/scaling-nodejs/biomejs-explained/
https://medium.com/@harryespant/biome-vs-eslint-the-ultimate-2025-showdown-for-javascript-developers-speed-features-and-3e5130be4a3c
https://medium.com/better-dev-nextjs-react/biome-vs-eslint-prettier-the-2025-linting-revolution-you-need-to-know-about-ec01c5d5b6c8
https://dzone.com/articles/prettier-vs-eslint-vs-biome
https://kittygiraudel.com/2024/06/01/from-eslint-and-prettier-to-biome/
https://blog.appsignal.com/2025/05/07/migrating-a-javascript-project-from-prettier-and-eslint-to-biomejs.html
https://dev.to/royce_fabbd83cb268312e928/biome-is-56x-faster-than-eslint-is-it-time-to-switch-bll
https://codeandchaos.com/blog/2025/goodbye-eslint--prettier-hello-biome/
https://markaicode.com/nodejs-2025-toolchain-survival-guide/
https://blog.tericcabrel.com/nodejs-typescript-biome/
https://spacejelly.dev/posts/lint-format-javascript-with-biome
https://dev.to/nqhed/biome-a-good-tool-for-linting-and-formatting-code-4g4j
https://medium.com/devmap/getting-started-with-biome-a-modern-web-development-toolchain-7c9046cebbfc
https://dev.to/rezaowliaei/simplifying-code-quality-with-a-unified-biome-configuration-jah
https://www.docker.com/blog/how-to-fix-eslint-violations-with-ai-assistance/
https://gregory-gerard.dev/articles/eslint-in-a-monorepo
https://romellem.github.io/turbo-v1-docs/repo/docs/handbook/linting/eslint
https://turbo.build/repo/docs/handbook/linting/eslint
https://typescript-eslint.io/troubleshooting/typed-linting/monorepos/
https://dev.to/mxro/the-ultimate-guide-to-typescript-monorepos-5ap7
https://junkangworld.com/blog/the-ultimate-2025-guide-to-eslint-generics-in-monorepos
https://flashblaze.xyz/posts/publishing-eslint-rules/
https://www.npmjs.com/package/eslint-plugin-package-json
https://www.npmjs.com/package/@typescript-eslint/eslint-plugin
https://www.npmjs.com/package/eslint-plugin-react-naming-convention
https://allalmohamedlamine.medium.com/eslint-how-to-name-plugins-dc1763d454bc
https://archive.eslint.org/docs/2.0.0/developer-guide/working-with-plugins
https://archive.eslint.org/docs/user-guide/getting-started
https://feature-sliced.design/blog/mastering-eslint-config
https://raulmelo.me/en/blog/migration-eslint-to-flat-config
https://fransirena.dev/tech-notes/shareable-eslint-config/
https://freecodecamp.org/news/creating-your-own-eslint-config-package/
https://codinglicks.com/blog/create-a-reusable-eslint-config/
https://www.developerway.com/posts/custom-eslint-rules-typescript-monorepo
https://dev.to/solleedata/making-shared-eslint-prettier-config-files-fdi
https://lib.rs/crates/agent-skills-cli
https://arxiv.org/html/2502.10815v1
https://arxiv.org/html/2507.02660v1
https://safedep.io/eslint-config-prettier-major-npm-supply-chain-hack/
https://blog.scottlowe.org/2024/03/01/linting-your-markdown-files/
https://github.com/LazyVim/LazyVim/discussions/3479
https://wiki.qt.io/Setting_Up_Vale
https://www.technicaltidbits.net/projects/configuring-vale/
https://blog.spinthemoose.com/2022/06/03/integrate-vale-into-an-open-source-project/
https://github.com/embeddedartistry/vale-styleguide/blob/master/config/.vale.ini
https://hpc.nmsu.edu/contribution/vale/
https://nickymeuleman.netlify.app/blog/automagically-lint/
https://github.com/lee-to/ai-factory
https://blog.sshh.io/p/how-i-use-every-claude-code-feature
https://dometrain.com/blog/creating-the-perfect-claudemd-for-claude-code/
https://nathanleclaire.com/blog/2025/03/10/vibing-best-practices-with-claude-code/
https://conventionalscripts.org/
https://literat.dev/blog/2024-12-14/mastering-npm-scripts-best-practices-in-sustainable-naming-and-organizing-of-your-scripts/
https://archlinux.org/packages/extra/any/markdownlint-cli2/files/
https://www.npmjs.com/package/markdownlint-cli2-formatter-json
https://libraries.io/npm/markdownlint-cli2-formatter-json
```
