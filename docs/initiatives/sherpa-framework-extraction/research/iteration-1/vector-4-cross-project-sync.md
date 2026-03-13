# Cross-Project Sync Strategy Research

**Vector 4** from `research/kickoff-prompt.md`: How do multiple independent projects consume framework updates without merge conflicts or drift?

**Researched:** 2026-03-11

---

## Key Discoveries

### 1. Expo SDK Upgrade Model

- **Toolchain**: `npx expo install --fix` auto-resolves dependency version mismatches; `npx expo-doctor` validates project health against SDK version compatibility tables. ([Expo upgrade walkthrough](https://docs.expo.dev/workflow/upgrading-expo-sdk-walkthrough/), [Expo native upgrade helper](https://docs.expo.dev/bare/upgrade/))
- **Incremental-only**: Expo officially recommends upgrading one SDK version at a time to isolate breakage. Skipping versions compounds risk. ([Expo SDK 54 upgrade guide](https://expo.dev/blog/expo-sdk-upgrade-guide))
- **CNG (Continuous Native Generation)**: The managed workflow avoids native file drift entirely -- delete `ios/` and `android/`, regenerate on next build. Bare workflow projects get a diff-based upgrade helper (fork of React Native Upgrade Helper) showing file-by-file native changes between SDK versions. ([Expo native upgrade helper](https://docs.expo.dev/bare/upgrade/))
- **Real-world pain**: SDK 53 defaulted New Architecture on, breaking library compatibility. SDK 54 enforced stricter schema validation. `expo install --fix` doesn't catch everything -- devs report mismatches not flagged by the tooling. ([GitHub discussion #24492](https://github.com/expo/expo/discussions/24492), [Medium: SDK 54 common issues](https://diko-dev99.medium.com/upgrading-to-expo-sdk-54-common-issues-and-how-to-fix-them-1b78ac6b19d3))
- **Key insight for Sherpa**: The two-tier model (managed = regenerate everything vs. bare = diff helper) maps directly to our "vendored scaffold" vs. "living dependency" decision. CNG is the killer feature -- if consumers never own generated files, upgrades are trivial.

### 2. Next.js Codemods

- **CLI**: `npx @next/codemod upgrade [major|minor|patch|version]` bumps dependencies AND runs applicable codemods in one command. Supports `--dry` and `--print` for preview. ([Next.js codemods docs](https://nextjs.org/docs/app/guides/upgrading/codemods))
- **Version-tagged codemods**: Each major version ships specific transforms -- Next.js 16 has `remove-experimental-ppr`, `remove-unstable-prefix`, `middleware-to-proxy`, `next-lint-to-eslint-cli`. Next.js 15 had `next-async-request-api` (the async params migration). ([Next.js codemods docs](https://nextjs.org/docs/app/guides/upgrading/codemods))
- **80% automation**: The async request API codemod (biggest breaking change in years) handles ~80% of cases. Complex patterns (nested components, conditional access, custom hooks) get `UnsafeUnwrapped` typecasts or comments requiring manual review. ([Next.js v15 upgrade guide](https://nextjs.org/docs/app/guides/upgrading/version-15))
- **Cal.com case study**: 250k+ LOC, 100+ pages migrated from Pages Router to App Router. 3 engineers at 50% for 5 months. Codemods handled systematic transforms but needed custom adaptations for Cal.com-specific patterns. LCP improved 33% (2280ms -> 1712ms). ([Codemod blog: Cal.com migration](https://codemod.com/blog/cal-next-migration))
- **Key insight for Sherpa**: Codemods are the gold standard for code-level breaking changes but require significant investment to build. For a small framework, migration guides + manual steps may be more realistic than building a codemod infrastructure. Reserve codemods for the one or two breaking changes that affect every consumer.

### 3. Backstage Upgrade Path

- **Two-layer versioning**: Individual `@backstage/*` packages follow semver, but the "Backstage release" version (e.g., 1.31.0) does NOT follow semver -- minor versions can contain breaking changes. This decoupled versioning confuses adopters. ([Backstage versioning policy](https://backstage.io/docs/overview/versioning-policy/), [GitHub issue #31181](https://github.com/backstage/backstage/issues/31181))
- **CLI bump**: `yarn backstage-cli versions:bump` upgrades all `@backstage/*` packages atomically. Monthly main releases, weekly next releases. ([Backstage keeping updated](https://backstage.io/docs/getting-started/keeping-backstage-updated/))
- **Upgrade Helper (diff-based)**: Each release, a fresh app is scaffolded from `create-app` and committed to a separate repo (`backstage/upgrade-helper-diff`). The helper shows split-screen diffs between any two versions. Users manually apply relevant changes. This is a fork of React Native Upgrade Helper. ([Backstage upgrade helper blog](https://backstage.io/blog/2022/03/04/backstage-upgrade-helper/), [backstage/upgrade-helper-diff](https://github.com/backstage/upgrade-helper-diff))
- **The template drift problem**: Local `app` and `backend` packages are generated at `create-app` time and never automatically update. Template changes are documented in `@backstage/create-app` CHANGELOG. Adopters must manually reconcile. This is Backstage's single biggest upgrade pain point. ([Backstage keeping updated](https://backstage.io/docs/getting-started/keeping-backstage-updated/))
- **Plugin compatibility**: Core packages are designed to tolerate duplication (`@backstage/core-plugin-api` can safely exist in multiple versions). Compatibility wrappers (`legacyPlugin()`) bridge old and new backend systems. ([Backstage versioning policy](https://backstage.io/docs/overview/versioning-policy/), [Backstage backend migration](https://backstage.io/docs/backend-system/building-backends/migrating/))
- **Key insight for Sherpa**: Backstage's biggest lesson is that generated scaffolds drift from templates inevitably. The upgrade helper (automated diff generation between scaffolded versions) is a clever mitigation but still requires manual work. The compatibility wrapper pattern is excellent for gradual migration.

### 4. Git Subtree for Shared Files

- **How it works**: `git subtree add/pull/push` copies a sub-repo's content into a directory of the host repo. Unlike submodules, the files are first-class citizens in the host's commit history. ([Atlassian git subtree tutorial](https://www.atlassian.com/git/tutorials/git-subtree))
- **Pain points in practice**: (a) No `.gittrees` config file -- subtrees are invisible, look like regular directories; (b) updates must be manually pulled from upstream; (c) commit history gets complex with squash merges; (d) contributing back upstream is awkward; (e) rebases become confusing. ([Medium: Mastering Git Subtrees](https://medium.com/@porteneuve/mastering-git-subtrees-943d29a798ec), [Grizzly Peak: Submodules vs Subtrees](https://www.grizzlypeaksoftware.com/library/git-submodules-and-subtrees-when-to-use-each-kf52296z))
- **When subtrees work**: Infrequently-updated shared content, docs sites needing consolidated commits, and cases where contributors shouldn't need to know about the subtree relationship. ([Opensource.com: submodules and subtrees](https://opensource.com/article/20/5/git-submodules-subtrees))
- **Key insight for Sherpa**: Git subtree is a poor fit for convention files that change frequently. The invisible nature of subtrees means contributors accidentally break sync. Better alternatives exist (Copier, GitHub Actions template sync).

### 5. Hybrid Distribution Models

#### The Copier Model (Best Fit for Conventions)

- **Three-way merge updates**: Copier generates a project from a Git-tagged template, stores answers in `.copier-answers.yml`, and can update existing projects using a 3-way diff: old template version vs. user modifications vs. new template version. Conflicts produce inline markers or `.rej` files. ([Copier updating docs](https://copier.readthedocs.io/en/stable/updating/), [Copier comparisons](https://copier.readthedocs.io/en/stable/comparisons/))
- **vs. Cookiecutter**: Cookiecutter has no native update support (requires third-party `cruft` tool). Copier was designed for lifecycle management from the start. ([Copier comparisons](https://copier.readthedocs.io/en/stable/comparisons/))
- **Migration scripts**: Copier supports pre/post migration hooks that run between versions, enabling data transformations alongside file updates. ([Copier updating docs](https://copier.readthedocs.io/en/stable/updating/))
- **Git-tag versioning**: Updates only work with Git-hosted templates. Copier uses Git tags to identify versions and extract smart diffs. ([Copier comparisons](https://copier.readthedocs.io/en/stable/comparisons/))

#### Angular Schematics (Migration-as-Code)

- **`ng update` triggers migration schematics**: Libraries declare a `migrations.json` in their `package.json`. When a consumer runs `ng update @my/lib`, Angular CLI executes all migration schematics between the old and new version, in order. ([Angular schematics docs](https://angular.dev/tools/cli/schematics), [Infragistics: Angular schematics for libraries](https://www.infragistics.com/blogs/angular-schematics-for-libraries))
- **Versioned migrations**: Each schematic specifies a target version. Upgrading from v1 to v3 executes both v2 and v3 schematics sequentially. ([Infragistics: Angular schematics for libraries](https://www.infragistics.com/blogs/angular-schematics-for-libraries))
- **AST manipulation**: Schematics use TypeScript's language service to rewrite imports, rename symbols, update config files -- then write back preserving formatting. ([Infragistics: Angular schematics for libraries](https://www.infragistics.com/blogs/angular-schematics-for-libraries))

#### Ember CLI Update (Three-Way Merge for Boilerplate)

- **`ember-cli-update`**: Fetches latest version, diffs against project's version, applies changes using three-way merge. Only modifies affected sections, not entire files. Wraps `boilerplate-update` internally. ([ember-cli-update npm](https://www.npmjs.com/package/ember-cli-update), [GitHub: ember-cli-update](https://github.com/ember-cli/ember-cli-update))
- **Custom blueprints**: Beyond the core app template, addon authors can define blueprints that consumers can update between versions using the same three-way merge. ([Ember CLI guides: blueprints](https://cli.emberjs.com/release/advanced-use/blueprints/))

#### RedwoodJS / Blitz.js (Codemods + Template Downloads)

- **RedwoodJS**: `@redwoodjs/codemods` uses jscodeshift for AST transforms AND downloads new template files when the upgrade requires files that didn't exist before. ([RedwoodJS codemods npm](https://www.npmjs.com/package/@redwoodjs/codemods))
- **Blitz.js**: `@blitzjs/codemod` provides automated upgrade from v1 to v2. ([Blitz.js upgrade docs](https://blitzjs.com/docs/upgrading-from-framework))

#### Shopify Hydrogen (CLI Upgrade + Instruction Files)

- **`npx shopify hydrogen upgrade`**: Upgrades dependencies, applies codemods (e.g., Remix -> React Router migration), AND generates instruction files for manual steps. ([Shopify CLI hydrogen docs](https://shopify.dev/docs/api/shopify-cli/hydrogen/hydrogen-upgrade))
- **Key pattern**: Codemods for what can be automated, generated instruction files for what can't.

#### GitHub Actions Template Sync

- **`actions-template-sync`**: GitHub Action that syncs consumer repos with a template repo via git merge (`--allow-unrelated-histories --squash -X theirs`). Creates PRs automatically. `.templatesyncignore` lets consumers exclude files from sync. ([GitHub Marketplace: actions-template-sync](https://github.com/marketplace/actions/actions-template-sync))

#### npm Package for AI Agent Skills

- **Emerging pattern**: Bundle `.claude/skills/`, markdown docs, and convention files inside npm packages. An installer CLI (`@funstack/skill-installer`) copies files to the appropriate agent directory. Skills are not auto-installed on `npm install` -- consumers run the installer explicitly. ([Gist: Distributing AI Agent Skills via npm](https://gist.github.com/uhyo/e42484189de45c3e1c6f26154c1f2fc0))

#### ESLint Shareable Config (The npm Convention Pattern)

- **Convention as npm package**: ESLint's shareable config pattern (`eslint-config-*`) is the canonical example of distributing configuration conventions via npm. Consumers `extend` the shared config, override as needed. Works because ESLint has a built-in extension mechanism. ([ESLint shareable configs](https://eslint.org/docs/latest/extend/shareable-configs))
- **Key limitation**: Only works when the consuming tool has an extension/inheritance mechanism. `.claude/rules/` files don't have this -- they're flat markdown files loaded by glob.

### 6. Monorepo vs. Multi-Repo for Framework + Consumer

- **Angular CDK pattern**: Google's `angular/components` monorepo contains both CDK (framework) and Material (consumer) as separate packages. CDK has zero dependencies on Material. Material depends on CDK via peer dependencies. Internally linked via pnpm `workspace:*`. Externally published to npm. ([DeepWiki: Angular components](https://deepwiki.com/angular/components/2.1-overlay-system))
- **Turborepo internal packages**: During development, packages are consumed directly from source (no build step). When ready to publish, Changesets manages versioning and npm publishing. The same package can be both an internal workspace dependency and a published npm package. ([Turborepo internal packages](https://turborepo.dev/docs/core-concepts/internal-packages), [Turborepo publishing](https://turborepo.dev/docs/guides/publishing-libraries))
- **The coupling trap**: In a monorepo, all consumers share the same commit and CI. Library authors must fix all breakage they cause because they see it immediately. This is a feature for internal development but means the framework never truly proves it works independently. ([Monorepo tools](https://monorepo.tools/), [Mintlify: when do you need a monorepo](https://www.mintlify.com/blog/when-do-you-really-need-a-monorepo))
- **Multi-monorepo**: The `leoloso/PoP` pattern uses git submodules to link an upstream (public) monorepo into a downstream (private) monorepo. The upstream repo "leaks" -- it needs awareness of downstream usage, creating hidden coupling. ([CSS-Tricks: multi-monorepo](https://css-tricks.com/from-a-single-repo-to-multi-repos-to-monorepo-to-multi-monorepo/))
- **"Packages that change together should live together"**: The strongest argument for keeping framework + first consumer in the same monorepo during active development. Split when the framework stabilizes and external consumers appear. ([Mintlify: when do you need a monorepo](https://www.mintlify.com/blog/when-do-you-really-need-a-monorepo))
- **Key insight for Sherpa**: Keep `@sherpa/studio` packages in the WavePoint monorepo during extraction (Phase 3). Use Turborepo internal packages for development, publish to npm when stable. Sherpa consumes from npm. This gives us monorepo dev speed without coupling the consumer to the framework's git history.

---

## Synthesis: A Hybrid Distribution Model for Sherpa

Based on this research, the framework splits into two distribution channels with different update mechanisms:

### Channel 1: Code Packages (npm)

**What**: React components, lib modules, MCP server, worker scripts, CLI tools.

**Distribution**: npm packages (`@sherpa/studio-core`, `@sherpa/studio-ui`, `@sherpa/studio-mcp`, etc.).

**Update mechanism**: Standard semver + `npm update`. Breaking changes handled by:
- Migration schematics (Angular pattern) if the user base grows
- Migration guides + manual steps (realistic for 2-3 consumers)
- Codemods only for high-impact breaking changes

**Precedent**: Turborepo internal packages -> Changesets -> npm publish.

### Channel 2: Convention Files (Copier or CLI sync)

**What**: `.claude/rules/`, `.claude/skills/`, `docs/agents/roles/`, task YAML schema, initiative directory structure, `CLAUDE.md` patterns.

**Distribution**: Git-hosted template + Copier (or a custom `sherpa sync` CLI).

**Update mechanism**: Three-way merge (Copier model):
1. Template repo stores canonical conventions with Git tags per version
2. Consumer's `.copier-answers.yml` tracks which version they're on + any customization answers
3. `copier update` (or `sherpa sync`) diffs old template vs. new template vs. consumer's modifications
4. Conflicts produce inline markers for human resolution
5. Consumers can ignore files via `.copier-answers.yml` exclusions

**Precedent**: Copier, ember-cli-update, Backstage upgrade helper.

### Channel 3: Scaffold-Once Files (vendored)

**What**: Project structure (`apps/`, `packages/`), root config (`turbo.json`, `pnpm-workspace.yaml`, `tailwind.config.ts`), Supabase setup, CI/CD workflows.

**Distribution**: `create-sherpa` CLI or `copier copy` for initial project scaffolding.

**Update mechanism**: The Backstage/Expo upgrade helper pattern -- generate diffs between scaffolded versions, show consumers what changed, let them apply manually. These files diverge by design.

**Precedent**: Backstage upgrade-helper-diff, Expo native project upgrade helper, React Native Upgrade Helper.

---

## Implications for Sherpa Cross-Project Sync Strategy

1. **Don't try to solve sync with one mechanism.** Code, conventions, and scaffolds have fundamentally different update characteristics. Treat them as separate distribution channels.

2. **Copier is the strongest candidate for convention sync.** Its three-way merge, Git-tag versioning, and migration hook support directly address our needs. The main risk: it's Python-based, which may feel foreign in a JS/TS ecosystem. Alternative: build a lightweight `sherpa sync` CLI in TypeScript that implements the same three-way merge pattern using `diff3`.

3. **Keep framework + WavePoint in the same monorepo during extraction.** Use Turborepo internal packages for development speed. Publish to npm when boundaries stabilize. Sherpa consumes from npm from day one -- this forces the framework to be truly independent.

4. **Convention files need an extension mechanism.** ESLint's shareable config works because ESLint has `extends`. Claude Code's `.claude/rules/` are flat files loaded by glob -- no inheritance. We either: (a) build a simple merge/overlay system into the `sherpa sync` CLI, or (b) accept that consumers fully own their conventions and updates are advisory (the Backstage upgrade helper model).

5. **The Expo CNG model is aspirational.** If consumers never "eject" (never manually edit framework-generated files), upgrades are trivial -- just bump the version. For code packages, this means keeping the API surface clean and changes backward-compatible. For conventions, this means making the canonical versions work out of the box with zero customization required.

6. **Investment scales with consumer count.** For 2 consumers (WavePoint + Sherpa), migration guides + manual steps are sufficient. Codemods and automated upgrade CLIs only become worthwhile at 10+ consumers. Don't over-invest in upgrade tooling before the framework proves its value.

---

## Open Questions

1. **Copier vs. custom CLI**: Is the Python dependency acceptable, or should we build `sherpa sync` in TypeScript? Copier's three-way merge is battle-tested but adds a non-JS tool to the chain.

2. **Convention customization boundaries**: Which convention files should consumers be able to customize (e.g., add domain-specific rules) vs. which should be framework-canonical (e.g., initiative-convention.md, effort-estimation.md)?

3. **Behavioral engineering portability**: The `behavioral-engineering.md` rule and the 13 role definitions use a specific YAML frontmatter schema (`disposition:`, `quality-bar:`, `vibe:`). Should this schema be part of the framework contract, or should consumers define their own role schemas?

4. **Version coupling between channels**: When convention files reference code APIs (e.g., a skill that calls a specific lib function), how do we ensure the convention version stays compatible with the code package version?

5. **The "golden path" question**: Should the framework ship a single opinionated `CLAUDE.md` template that consumers extend, or a minimal skeleton that consumers build up? The Backstage "golden path" concept suggests the former, but it creates more surface area for drift.

6. **MCP server configuration**: The task MCP server needs to discover project root and task directory. Should this be convention-based (`docs/tasks/` relative to git root) or configurable? Convention reduces config burden but limits flexibility.

7. **Testing framework updates**: How do you test that a framework update doesn't break consumer projects? Backstage runs compatibility tests against a "reference app." Should we maintain a reference Sherpa project that CI tests against on every framework change?

---

## Sources

### Expo SDK Upgrade
- [Expo SDK Upgrade Walkthrough](https://docs.expo.dev/workflow/upgrading-expo-sdk-walkthrough/) -- Official step-by-step upgrade guide
- [Native Project Upgrade Helper](https://docs.expo.dev/bare/upgrade/) -- Diff-based native file comparison tool
- [How to Upgrade to Expo SDK 55](https://expo.dev/blog/upgrading-to-sdk-55) -- SDK 55 specific upgrade blog
- [How to Upgrade to Expo SDK 54](https://expo.dev/blog/expo-sdk-upgrade-guide) -- SDK 54 specific upgrade blog
- [Expo SDK 52 Changelog](https://expo.dev/changelog/2024-11-12-sdk-52) -- SDK 52 release notes
- [GitHub Discussion #24492: How difficult was it to update SDK?](https://github.com/expo/expo/discussions/24492) -- Community feedback on upgrade pain
- [Medium: SDK 54 Common Issues](https://diko-dev99.medium.com/upgrading-to-expo-sdk-54-common-issues-and-how-to-fix-them-1b78ac6b19d3) -- Real-world SDK 54 upgrade issues
- [Medium: SDK 54 Survival Story](https://medium.com/@shanavascruise/upgrading-to-expo-54-and-react-native-0-81-a-developers-survival-story-2f58abf0e326) -- Developer experience report

### Next.js Codemods
- [Next.js Codemods Documentation](https://nextjs.org/docs/app/guides/upgrading/codemods) -- Full codemod reference with all transforms
- [Next.js 16 Blog Post](https://nextjs.org/blog/next-16) -- Next.js 16 release announcement
- [Next.js 15 Upgrade Guide](https://nextjs.org/docs/app/guides/upgrading/version-15) -- Async request API migration details
- [Codemod.com: Cal.com Migration](https://codemod.com/blog/cal-next-migration) -- Large-scale migration case study (250k+ LOC)
- [Codemod.com: Dream Migration](https://codemod.com/blog/dream-migration) -- App Router migration strategy
- [Next.js 16 Migration Guide (Michael Pilgram)](https://michaelpilgram.co.uk/blog/migrating-to-nextjs-16) -- Independent migration experience
- [Dev.to: Monorepo Next.js 14->16 Migration](https://dev.to/abhilashlr/migrating-a-large-scale-monorepo-from-nextjs-14-to-16-a-real-world-journey-5383) -- Monorepo-specific migration story
- [Martin Fowler: Codemods for API Refactoring](https://martinfowler.com/articles/codemods-api-refactoring.html) -- Conceptual overview of codemod approach

### Backstage
- [Keeping Backstage Updated](https://backstage.io/docs/getting-started/keeping-backstage-updated/) -- Official upgrade guide
- [Backstage Versioning Policy](https://backstage.io/docs/overview/versioning-policy/) -- Non-semver versioning explanation
- [Backstage Upgrade Helper (blog)](https://backstage.io/blog/2022/03/04/backstage-upgrade-helper/) -- Upgrade helper announcement and design
- [backstage/upgrade-helper-diff (GitHub)](https://github.com/backstage/upgrade-helper-diff) -- The diff generation repo
- [Backstage Upgrade Helper (tool)](https://backstage.github.io/upgrade-helper/) -- The web-based diff viewer
- [Backstage Backend Migration Guide](https://backstage.io/docs/backend-system/building-backends/migrating/) -- New backend system migration docs
- [GitHub Issue #31181: Semver confusion](https://github.com/backstage/backstage/issues/31181) -- Community complaint about versioning
- [Backstage v1.31.0 Release](https://backstage.io/docs/releases/v1.31.0/) -- Example release with breaking changes

### Git Subtree
- [Atlassian: Git Subtree Tutorial](https://www.atlassian.com/git/tutorials/git-subtree) -- Official Atlassian guide
- [Medium: Mastering Git Subtrees (Porteneuve)](https://medium.com/@porteneuve/mastering-git-subtrees-943d29a798ec) -- Deep technical guide
- [Opensource.com: Submodules and Subtrees](https://opensource.com/article/20/5/git-submodules-subtrees) -- Comparison guide
- [Grizzly Peak: When to Use Each](https://www.grizzlypeaksoftware.com/library/git-submodules-and-subtrees-when-to-use-each-kf52296z) -- Decision framework
- [GitHub Gist: Git Subtree Basics](https://gist.github.com/SKempin/b7857a6ff6bddb05717cc17a44091202) -- Quick reference

### Copier and Template Tools
- [Copier: Updating Projects](https://copier.readthedocs.io/en/stable/updating/) -- Three-way merge technical docs
- [Copier: Comparisons](https://copier.readthedocs.io/en/stable/comparisons/) -- vs. Cookiecutter, Yeoman, etc.
- [GitHub: Copier merge conflicts issue #1833](https://github.com/copier-org/copier/issues/1833) -- Known conflict handling limitation
- [GitHub: Copier adopt proposal #2486](https://github.com/copier-org/copier/issues/2486) -- First-time adoption workflow
- [Medium: Cookiecutter to Copier](https://medium.com/@gema.correa/from-cookiecutter-to-copier-uv-and-just-the-new-python-project-stack-90fb4ba247a9) -- Ecosystem shift analysis
- [Cookiecutter Alternatives Comparison](https://www.cookiecutter.io/article-post/cookiecutter-alternatives) -- Official comparison page
- [RecallStack: Copier replaces Yeoman/Cookiecutter](https://www.recallstack.icu/en/2020/04/18/yeoman-and-cookiecutter-are-dead-long-live-copier/) -- Copier advocacy

### Framework Upgrade CLIs
- [Shopify Hydrogen Upgrade](https://shopify.dev/docs/api/shopify-cli/hydrogen/hydrogen-upgrade) -- CLI command reference
- [Ember CLI Update (npm)](https://www.npmjs.com/package/ember-cli-update) -- Three-way merge update tool
- [Ember CLI Update (GitHub)](https://github.com/ember-cli/ember-cli-update) -- Source and documentation
- [RedwoodJS Codemods (npm)](https://www.npmjs.com/package/@redwoodjs/codemods) -- AST transforms + template downloads
- [Blitz.js Upgrade Docs](https://blitzjs.com/docs/upgrading-from-framework) -- v1->v2 migration via codemod

### Angular Schematics
- [Angular: Generating Code with Schematics](https://angular.dev/tools/cli/schematics) -- Official schematics guide
- [Infragistics: Schematics for Libraries](https://www.infragistics.com/blogs/angular-schematics-for-libraries) -- Migration schematics deep dive
- [ng update: the setup](https://timdeschryver.dev/blog/ng-update-the-setup) -- Technical walkthrough
- [Dev.to: Which migration schematics execute?](https://dev.to/krisplatis/ng-update-mylibversion-which-migration-schematics-will-be-executed-4304) -- Execution order details

### GitHub Actions Template Sync
- [actions-template-sync (Marketplace)](https://github.com/marketplace/actions/actions-template-sync) -- GitHub Action for repo sync
- [GitHub Discussion #23528: How to sync template?](https://github.com/orgs/community/discussions/23528) -- Community approaches
- [0xDC.me: GitHub Templates and Repo Sync](https://0xdc.me/blog/github-templates-and-repository-sync/) -- Practical guide
- [template-tools/template-sync (GitHub)](https://github.com/template-tools/template-sync) -- Alternative sync tool

### npm Distribution for Agent Skills
- [Gist: Distributing AI Agent Skills via npm](https://gist.github.com/uhyo/e42484189de45c3e1c6f26154c1f2fc0) -- Full pattern with installer
- [ESLint Shareable Configs](https://eslint.org/docs/latest/extend/shareable-configs) -- The canonical config-as-package pattern

### Monorepo vs. Multi-Repo
- [CSS-Tricks: Multi-Monorepo](https://css-tricks.com/from-a-single-repo-to-multi-repos-to-monorepo-to-multi-monorepo/) -- Evolution of repo strategies
- [Monorepo.tools](https://monorepo.tools/) -- Comprehensive monorepo comparison
- [Mintlify: When Do You Need a Monorepo?](https://www.mintlify.com/blog/when-do-you-really-need-a-monorepo) -- Decision framework
- [Turborepo: Internal Packages](https://turborepo.dev/docs/core-concepts/internal-packages) -- Internal vs. publishable packages
- [Turborepo: Publishing Libraries](https://turborepo.dev/docs/guides/publishing-libraries) -- Changesets integration
- [Vercel: Design System with Turborepo](https://vercel.com/templates/react/turborepo-design-system) -- Reference architecture
- [DeepWiki: Angular Components Monorepo](https://deepwiki.com/angular/components/2.1-overlay-system) -- CDK/Material separation pattern
- [Kinsta: Monorepo vs Multi-Repo](https://kinsta.com/blog/monorepo-vs-multi-repo/) -- Comprehensive comparison

---

## Raw Links

```
https://docs.expo.dev/workflow/upgrading-expo-sdk-walkthrough/
https://docs.expo.dev/bare/upgrade/
https://expo.dev/blog/upgrading-to-sdk-55
https://expo.dev/blog/expo-sdk-upgrade-guide
https://expo.dev/changelog/2024-11-12-sdk-52
https://github.com/expo/expo/discussions/24492
https://diko-dev99.medium.com/upgrading-to-expo-sdk-54-common-issues-and-how-to-fix-them-1b78ac6b19d3
https://medium.com/@shanavascruise/upgrading-to-expo-54-and-react-native-0-81-a-developers-survival-story-2f58abf0e326
https://nextjs.org/docs/app/guides/upgrading/codemods
https://nextjs.org/blog/next-16
https://nextjs.org/docs/app/guides/upgrading/version-15
https://nextjs.org/blog/next-15
https://codemod.com/blog/cal-next-migration
https://codemod.com/blog/dream-migration
https://michaelpilgram.co.uk/blog/migrating-to-nextjs-16
https://dev.to/abhilashlr/migrating-a-large-scale-monorepo-from-nextjs-14-to-16-a-real-world-journey-5383
https://martinfowler.com/articles/codemods-api-refactoring.html
https://backstage.io/docs/getting-started/keeping-backstage-updated/
https://backstage.io/docs/overview/versioning-policy/
https://backstage.io/blog/2022/03/04/backstage-upgrade-helper/
https://github.com/backstage/upgrade-helper-diff
https://backstage.github.io/upgrade-helper/
https://backstage.io/docs/backend-system/building-backends/migrating/
https://github.com/backstage/backstage/issues/31181
https://backstage.io/docs/releases/v1.31.0/
https://www.atlassian.com/git/tutorials/git-subtree
https://medium.com/@porteneuve/mastering-git-subtrees-943d29a798ec
https://opensource.com/article/20/5/git-submodules-subtrees
https://www.grizzlypeaksoftware.com/library/git-submodules-and-subtrees-when-to-use-each-kf52296z
https://gist.github.com/SKempin/b7857a6ff6bddb05717cc17a44091202
https://copier.readthedocs.io/en/stable/updating/
https://copier.readthedocs.io/en/stable/comparisons/
https://github.com/copier-org/copier/issues/1833
https://github.com/copier-org/copier/issues/2486
https://medium.com/@gema.correa/from-cookiecutter-to-copier-uv-and-just-the-new-python-project-stack-90fb4ba247a9
https://www.cookiecutter.io/article-post/cookiecutter-alternatives
https://www.recallstack.icu/en/2020/04/18/yeoman-and-cookiecutter-are-dead-long-live-copier/
https://shopify.dev/docs/api/shopify-cli/hydrogen/hydrogen-upgrade
https://www.npmjs.com/package/ember-cli-update
https://github.com/ember-cli/ember-cli-update
https://www.npmjs.com/package/@redwoodjs/codemods
https://blitzjs.com/docs/upgrading-from-framework
https://angular.dev/tools/cli/schematics
https://www.infragistics.com/blogs/angular-schematics-for-libraries
https://timdeschryver.dev/blog/ng-update-the-setup
https://dev.to/krisplatis/ng-update-mylibversion-which-migration-schematics-will-be-executed-4304
https://github.com/marketplace/actions/actions-template-sync
https://github.com/orgs/community/discussions/23528
https://0xdc.me/blog/github-templates-and-repository-sync/
https://github.com/template-tools/template-sync
https://gist.github.com/uhyo/e42484189de45c3e1c6f26154c1f2fc0
https://eslint.org/docs/latest/extend/shareable-configs
https://css-tricks.com/from-a-single-repo-to-multi-repos-to-monorepo-to-multi-monorepo/
https://monorepo.tools/
https://www.mintlify.com/blog/when-do-you-really-need-a-monorepo
https://turborepo.dev/docs/core-concepts/internal-packages
https://turborepo.dev/docs/guides/publishing-libraries
https://vercel.com/templates/react/turborepo-design-system
https://deepwiki.com/angular/components/2.1-overlay-system
https://kinsta.com/blog/monorepo-vs-multi-repo/
https://github.com/probot/probot/issues/53
https://github.com/ahmadnassri/action-template-repository-sync
https://medium.com/@dotdc/github-templates-and-repository-sync-1372ad764cae
https://cli.emberjs.com/release/advanced-use/blueprints/
https://docs.openrewrite.org/recipes/codemods/migrate/nextjs/nextjscodemods
https://codemod.com/
https://medium.com/@angularlicious/monorepo-angular-packaged-libs-you-can-have-your-cake-and-eat-it-too-8c5687c4ffe9
https://deepwiki.com/angular/components/2.2-drag-and-drop
```
