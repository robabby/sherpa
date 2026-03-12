# Framework Sync Patterns: How Existing Tools Handle Evolving Templates + Consumer Customizations

**Date:** 2026-03-11
**Focus:** How Rails, Expo, Angular, CRA, Copier, Kustomize, nf-core, and others solve the "framework ships config, consumer customizes, framework updates" problem

---

## Key Discoveries

### 1. Rails `app:update` — Interactive Two-Way Diff With Optional Merge Tool

- `rails app:update` re-runs the same code path as `rails new`, comparing each generated file against the consumer's existing file. ([joshmcarthur.com](https://www.joshmcarthur.com/til/2019/07/25/upgrading-rails-apps-with-rake-appupdate.html))
- **It is NOT a three-way merge by default.** It's a two-way comparison: "new Rails template output" vs. "your current file." There is no record of the *previous* template version. ([davidrunger.com](https://davidrunger.com/blog/using-vs-code-as-a-rails-app-update-merge-tool))
- Interactive prompt per file: `Y` (overwrite), `n` (skip), `d` (show diff), `m` (open merge tool), `a` (overwrite all), `q` (quit). ([joshmcarthur.com](https://www.joshmcarthur.com/til/2019/07/25/upgrading-rails-apps-with-rake-appupdate.html))
- The `m` option requires `THOR_MERGE` environment variable (e.g., `THOR_MERGE=vimdiff` or `THOR_MERGE="code -d"`). Rails passes two file paths to the merge tool: a temp file with the new template output, and the consumer's existing file. ([davidrunger.com](https://davidrunger.com/blog/using-vs-code-as-a-rails-app-update-merge-tool))
- VS Code integration requires a wrapper script because `code --merge` expects four arguments (left, right, base, result) but Rails only provides two. The author creates a synthetic "base" by copying one of the files. ([davidrunger.com](https://davidrunger.com/blog/using-vs-code-as-a-rails-app-update-merge-tool))
- Thor uses LCS (Longest Common Subsequence) diff internally for the `d` option. ([github.com/rails/thor](https://github.com/rails/thor))
- **Limitation:** "rake app:update is NOT bulletproof." No automation — fully manual, per-file review. ([joshmcarthur.com](https://www.joshmcarthur.com/til/2019/07/25/upgrading-rails-apps-with-rake-appupdate.html))
- **Implication for sherpa sync:** Rails proves that the two-way approach (no stored baseline) forces manual review on every file, every time. Storing the previous template version (as Copier does) is essential for smart diffing.

### 2. Expo Prebuild / Continuous Native Generation (CNG) — The "Never Touch Generated Files" Model

- Expo's CNG treats native iOS/Android project files as **build artifacts** generated on-demand from `app.json` + config plugins. Native directories (`ios/`, `android/`) are not committed to source control. ([docs.expo.dev/workflow/continuous-native-generation](https://docs.expo.dev/workflow/continuous-native-generation/))
- **The sync problem is eliminated by design:** consumers never customize generated files directly. Instead, customizations are expressed as **config plugins** — JavaScript functions that programmatically modify native project files during prebuild. ([docs.expo.dev/config-plugins/introduction](https://docs.expo.dev/config-plugins/introduction/))
- Plugin architecture: `withInfoPlist`, `withAndroidManifest`, `withDangerousMod`, etc. Each plugin receives a config object and returns a modified config. Plugins compose sequentially. ([docs.expo.dev/config-plugins/plugins-and-mods](https://docs.expo.dev/config-plugins/plugins-and-mods/))
- Upgrades are trivial: bump version in `package.json`, run `npx expo prebuild --clean`, and the new template + plugins regenerate everything. ([docs.expo.dev/workflow/continuous-native-generation](https://docs.expo.dev/workflow/continuous-native-generation/))
- **Escape hatch:** "Dangerous mods" (`withDangerousMod`) allow direct string/regex manipulation of native files when no typed mod exists. But these are fragile — multiple dangerous mods can interfere with each other because they use regex anchoring. ([docs.expo.dev/config-plugins/dangerous-mods](https://docs.expo.dev/config-plugins/dangerous-mods/))
- Manual edits to generated directories are lost on `prebuild --clean`. The documented workflow: experiment manually, then encode changes as config plugins. ([docs.expo.dev/workflow/continuous-native-generation](https://docs.expo.dev/workflow/continuous-native-generation/))
- **Idempotency concern:** Some config plugins are not idempotent. Running prebuild multiple times without `--clean` can produce incorrect results. ([docs.expo.dev/workflow/continuous-native-generation](https://docs.expo.dev/workflow/continuous-native-generation/))
- **Implication for sherpa sync:** The CNG model works when generated files are purely derived artifacts. For CLAUDE.md and convention files — which are *prose* that humans meaningfully customize — full regeneration destroys value. But the **plugin/transform layer** concept is powerful: consumers could express customizations as transforms rather than direct edits.

### 3. Angular Schematics / `ng update` — AST-Level Code Transformation

- `ng update` runs **migration schematics** — programmatic code transformations that modify consumer code to accommodate breaking changes. ([angular.dev/tools/cli/schematics](https://angular.dev/tools/cli/schematics))
- Schematics operate on a **virtual file system** (Tree). All transformations are staged in memory and only applied after validation. This prevents partial failures. ([angular.dev/tools/cli/schematics-authoring](https://angular.dev/tools/cli/schematics-authoring))
- Code transformations use the **TypeScript Compiler API** to parse ASTs, find specific node patterns, and apply targeted replacements. Not line-level — entity-level. ([dev.to/ikatsuba/mutate-a-code-with-angular-schematics-like-a-boss-5f4c](https://dev.to/ikatsuba/mutate-a-code-with-angular-schematics-like-a-boss-5f4c))
- Migration schematics are declared in a `migrations.json` file, keyed by version number. The CLI matches current → target version and runs relevant migrations. ([timdeschryver.dev/blog/ng-update-the-setup](https://timdeschryver.dev/blog/ng-update-the-setup))
- Example: Angular's control flow migration schematic searches all template files, finds `*ngIf` / `*ngFor` / `*ngSwitch` directives, and replaces them with the new `@if` / `@for` / `@switch` syntax. This is static analysis, not text replacement. ([medium.com/@rocking.ac.satyam](https://medium.com/@rocking.ac.satyam/angular-control-flow-schematics-migration-guide-f8fb44e56b4d))
- Library authors can ship their own migration schematics via `ng-update.migrations` in `package.json`. ([infragistics.com](https://www.infragistics.com/blogs/angular-schematics-for-libraries))
- **Implication for sherpa sync:** AST-level transforms are the gold standard for code migration. For markdown/prose files, the equivalent would be section-level transforms — which is exactly what this initiative is researching. The virtual file system / staging pattern is also relevant for `sherpa sync` safety.

### 4. Create React App Eject — The Anti-Pattern That Inspired Everything Else

- CRA hid all webpack/babel/ESLint config inside `react-scripts`. Users couldn't customize without ejecting. ([blog.logrocket.com/react-scripts](https://blog.logrocket.com/react-scripts/))
- `npm run eject` was a **one-way operation**: it copied all config files into your project. You gained full control but lost the ability to receive framework updates. ([sebhastian.com/create-react-app-eject](https://sebhastian.com/create-react-app-eject/))
- Community workarounds: **react-app-rewired** and **CRACO** intercepted the webpack config at runtime, letting consumers apply transforms without ejecting. Pattern: export a function from `config-overrides.js` that receives the webpack config object and returns a modified version. ([github.com/timarney/react-app-rewired](https://github.com/timarney/react-app-rewired))
- **Vite's approach:** Progressive customization via `vite.config.ts`. No hidden config, no ejection needed. Rich plugin system for extending behavior. Config is always visible and version-controlled. ([vite.dev/config](https://vite.dev/config/))
- **Next.js approach:** `next.config.js` exposes configuration with sensible defaults. Plugins/middleware extend behavior. No ejection concept needed. ([nextjs.org](https://nextjs.org/docs/app/guides/migrating/from-vite))
- CRA was deprecated in 2023. React docs now recommend Next.js, Remix, or Vite-based setups. ([create-react-app.dev/docs/alternatives-to-ejecting](https://create-react-app.dev/docs/alternatives-to-ejecting/))
- **Implication for sherpa sync:** The eject pattern is the failure mode we must avoid. Once a consumer "ejects" from framework conventions, they lose all future updates. The Vite/Next.js model (visible config + plugin layer) is the ideal. For sherpa sync, this means: convention files should be visible and editable, but customizations should be expressible in a way that survives framework updates.

### 5. Copier — The Gold Standard for Template Update + Consumer Customization

- **Copier** ([copier.readthedocs.io](https://copier.readthedocs.io/en/stable/updating/)) is a Python-based project scaffolding tool that positions itself as a "code lifecycle management tool" — not just a one-time scaffolder.
- **Three-way merge algorithm:**
  1. Read `.copier-answers.yml` to find `_commit` (old template version) and `_src_path` (template source).
  2. Clone template repo at both old and new versions.
  3. Regenerate old template with original answers to create a clean baseline.
  4. Diff baseline against current project to extract user modifications.
  5. Run pre-migration scripts.
  6. Re-prompt only for questions whose definitions changed between versions.
  7. Render new template with updated answers.
  8. Apply user diff to new template using `git apply`.
  9. Handle conflicts (inline markers or `.rej` files).
  10. Run post-migration scripts.
  11. Update `_commit` in `.copier-answers.yml`.
  ([deepwiki.com/copier-org/copier/3.4-updating-projects](https://deepwiki.com/copier-org/copier/3.4-updating-projects))
- **Conflict resolution modes:**
  - `--conflict inline` (default): Git-style `<<<<<<<` / `=======` / `>>>>>>>` markers in-file.
  - `--conflict rej`: Separate `.rej` files for each conflicting file.
  ([copier.readthedocs.io/en/stable/updating](https://copier.readthedocs.io/en/stable/updating/))
- **Migration system:** Version-keyed scripts with `before` and `after` stages. Context variables: `VERSION_FROM`, `VERSION_TO`, `VERSION_CURRENT`. Migrations only run when updating *to* the specified version or later. ([deepwiki.com/copier-org/copier/3.4-updating-projects](https://deepwiki.com/copier-org/copier/3.4-updating-projects))
- **Pre-commit hook integration:** When generating the baseline diff, Copier runs pre-commit hooks so formatting changes don't appear as spurious conflicts. ([deepwiki.com/copier-org/copier/3.4-updating-projects](https://deepwiki.com/copier-org/copier/3.4-updating-projects))
- **`context_lines` parameter:** Controls how many unchanged lines surround changes in the patch (default: 3). More context = more accurate merges but more potential conflicts in heavily modified areas. ([deepwiki.com/copier-org/copier/3.4-updating-projects](https://deepwiki.com/copier-org/copier/3.4-updating-projects))
- **File deletion handling:** Template-side deletions remove files from consumer. Consumer-side deletions are respected (files stay deleted). `skip_if_exists` files are always recreated if missing. ([deepwiki.com/copier-org/copier/3.4-updating-projects](https://deepwiki.com/copier-org/copier/3.4-updating-projects))
- **Critical constraint:** Never manually edit `.copier-answers.yml` — this breaks the diff algorithm's assumptions about what generated the current state. ([copier.readthedocs.io/en/stable/updating](https://copier.readthedocs.io/en/stable/updating/))
- **Implication for sherpa sync:** Copier's algorithm is the closest prior art to what `sherpa sync` needs. The key insight: store a "last-synced template version" reference, regenerate the baseline, diff to find user changes, apply user changes to new template. This is exactly the right approach. Sherpa should adapt this algorithm for section-level markdown merging.

### 6. Cruft — Cookiecutter's Update Layer (Weaker Than Copier)

- **Cruft** ([cruft.github.io/cruft](https://cruft.github.io/cruft/)) wraps Cookiecutter to add update capabilities. Stores `.cruft.json` with the template commit hash.
- `cruft update` regenerates from the template, computes diffs, and applies them. `cruft diff` shows local changes vs. template.
- **Weaker conflict handling than Copier:** Only produces `.rej` files for conflicts — no inline marker option. ([github.com/cruft/cruft/issues/181](https://github.com/cruft/cruft/issues/181))
- Supports `--skip` for files that should never be updated (tests, `__init__.py`, etc.). ([cruft.github.io/cruft](https://cruft.github.io/cruft/))
- `cruft link` can adopt existing projects that were originally created with Cookiecutter. ([cruft.github.io/cruft](https://cruft.github.io/cruft/))
- **Implication for sherpa sync:** Cruft validates the pattern but Copier does it better. The `cruft link` concept (adopting existing projects) is relevant — `sherpa init` on an existing project would need similar functionality.

### 7. Kustomize — Overlay/Patch Pattern (No Template Evolution)

- Kustomize uses a **base + overlay** model: base YAML manifests are never modified. Overlays declare patches that are applied at build time. ([blog.stack-labs.com/code/kustomize-101](https://blog.stack-labs.com/code/kustomize-101/))
- **Strategic Merge Patch:** Merges YAML fields intelligently based on Kubernetes API schema. Scalars are replaced, maps are merged, lists use merge keys. ([fosstechnix.com](https://www.fosstechnix.com/strategic-merge-patches-in-kubernetes-using-kustomize/))
- Base has no knowledge of overlays. Multiple overlays can reference the same base. ([blog.stack-labs.com/code/kustomize-101](https://blog.stack-labs.com/code/kustomize-101/))
- **Implication for sherpa sync:** The Kustomize pattern maps well to a "framework base + consumer overlay" model. Consumer customizations could be expressed as patches/overrides rather than direct file edits. For structured files (YAML config), this works beautifully. For prose/markdown, it's less natural but the concept of "overlay sections" is worth exploring.

### 8. Helm Values — Deep Merge With Override Hierarchy

- Helm charts ship `values.yaml` with defaults. Consumers override via `-f custom-values.yaml` or `--set key=val`. ([helm.sh/docs/chart_template_guide/values_files](https://helm.sh/docs/chart_template_guide/values_files/))
- **Deep merge for objects:** Override a nested key without replacing the entire parent. **But lists are replaced entirely** — no list merging. ([github.com/helm/helm/issues/3486](https://github.com/helm/helm/issues/3486))
- Override precedence: `values.yaml` < parent chart values < user-supplied values file < `--set` flags. ([helm.sh/docs/chart_template_guide/values_files](https://helm.sh/docs/chart_template_guide/values_files/))
- Delete default values by setting to `null`. ([helm.sh/docs/chart_template_guide/values_files](https://helm.sh/docs/chart_template_guide/values_files/))
- **Implication for sherpa sync:** The Helm model (defaults + overrides) is directly applicable to `sherpa.config.ts`. Framework ships defaults; consumer overrides specific values. Deep merge semantics are essential. The "lists are replaced" limitation is a known pain point to avoid.

### 9. Terraform Modules — Versioned, Consumer-Flexible

- Terraform modules use semantic versioning. Consumers pin versions in `module` blocks with version constraints (`>=`, `~>`, etc.). ([developer.hashicorp.com/terraform/language/expressions/version-constraints](https://developer.hashicorp.com/terraform/language/expressions/version-constraints))
- Child modules set minimum version requirements (`>=`), giving consumers flexibility. Root modules pin exact versions for reproducibility. ([masterpoint.io/blog/ultimate-terraform-versioning-guide](https://masterpoint.io/blog/ultimate-terraform-versioning-guide/))
- Consumers customize via input variables — no file editing. Breaking changes require major version bumps. ([developer.hashicorp.com/terraform/plugin/best-practices/versioning](https://developer.hashicorp.com/terraform/plugin/best-practices/versioning))
- **Implication for sherpa sync:** The "version constraint" pattern (consumer declares `sherpa: "^2.0.0"` and gets compatible updates) is the right model for framework versioning. The input variable pattern (customization via parameters, not file editing) maps to `sherpa.config.ts`.

### 10. nf-core Template Sync — Git TEMPLATE Branch Pattern

- nf-core (bioinformatics pipeline framework) maintains a dedicated `TEMPLATE` branch in every pipeline repo containing only unmodified template output. ([nf-co.re/docs/tutorials/sync/overview](https://nf-co.re/docs/tutorials/sync/overview))
- On framework release, automation runs `nf-core pipelines create --no-git` with the new template, commits to `TEMPLATE`, then creates a PR from a copy branch (`nf-core-template-merge-<version>`) to `dev`. ([nf-co.re/docs/tutorials/sync/overview](https://nf-co.re/docs/tutorials/sync/overview))
- **Git's native three-way merge** resolves most changes automatically because `TEMPLATE` shares history with `dev`. Only genuine conflicts (where consumer modified a template-changed region) require manual resolution. ([nf-co.re/docs/tutorials/sync/overview](https://nf-co.re/docs/tutorials/sync/overview))
- The copy branch (`nf-core-template-merge-<version>`) prevents dev history from leaking into `TEMPLATE` during conflict resolution. ([nf-co.re/docs/tutorials/sync/overview](https://nf-co.re/docs/tutorials/sync/overview))
- **Implication for sherpa sync:** This is the simplest approach that actually works well. A hidden `TEMPLATE` branch or stored baseline achieves three-way merge without any custom merge algorithm. The question is whether line-level git merge is sufficient for markdown prose files, or whether section-level merging provides meaningful improvement.

### 11. Kubebuilder Scaffold Markers — Framework-Owned vs. User-Owned Regions

- Kubebuilder uses `//+kubebuilder:scaffold:<marker-name>` comments in generated files to mark **framework-owned injection points**. ([book.kubebuilder.io/reference/markers/scaffold](https://book.kubebuilder.io/reference/markers/scaffold))
- When scaffolding new resources (controllers, webhooks), the CLI finds these markers and injects code at those points. All other code in the file is user-owned and untouched. ([book.kubebuilder.io/reference/markers/scaffold](https://book.kubebuilder.io/reference/markers/scaffold))
- Marker types: `+kubebuilder:scaffold:imports`, `+kubebuilder:scaffold:scheme`, `+kubebuilder:scaffold:builder`. ([book.kubebuilder.io/reference/markers/scaffold](https://book.kubebuilder.io/reference/markers/scaffold))
- If markers are moved or removed, scaffolding fails. ([book.kubebuilder.io/reference/markers/scaffold](https://book.kubebuilder.io/reference/markers/scaffold))
- **Implication for sherpa sync:** The "marker-delimited regions" concept directly applies to prose files. Framework-owned sections could be marked with HTML comments (`<!-- sherpa:managed -->` ... `<!-- /sherpa:managed -->`), allowing `sherpa sync` to update only those regions while preserving user-owned content. This is the section-level ownership model.

### 12. template-sync (npm) — Automated PR-Based Sync

- **@template-tools/template-sync** ([github.com/template-tools/template-sync](https://github.com/template-tools/template-sync)) generates PRs to keep repositories in sync with templates.
- Uses format-specific merge strategies: `Replace` (overwrite), `ReplaceIfEmpty` (fill blanks), `Skip` (never touch), `Delete`, `MergeLineSet` (combine line-based files like `.gitignore`). ([github.com/template-tools/template-sync](https://github.com/template-tools/template-sync))
- Supports JSON, YAML, TOML, INI, Markdown, rollup configs. Has special handling for `package.json` (merge dependencies), `README.md` (badge injection), and license files (year rewriting). ([github.com/template-tools/template-sync](https://github.com/template-tools/template-sync))
- **Implication for sherpa sync:** The format-specific merge strategy pattern is exactly right. Different file types need different merge logic. The `MergeLineSet` strategy for `.gitignore` is clever — each line is an independent entry, so merging is trivial. CLAUDE.md sections have similar properties.

### 13. Semantic Merge Drivers (Weave, Mergiraf) — Structure-Aware Git Merging

- **Weave** ([github.com/Ataraxy-Labs/weave](https://github.com/Ataraxy-Labs/weave)) is an entity-level semantic merge driver for Git. Parses files using tree-sitter, matches entities by name+type+scope, and only conflicts on actual semantic collisions. Supports **Markdown** among 25+ languages. Benchmarks: 31/31 clean merges vs. git's 15/31. ([github.com/Ataraxy-Labs/weave](https://github.com/Ataraxy-Labs/weave))
- **Mergiraf** ([mergiraf.org](https://mergiraf.org/)) is another syntax-aware merge driver. Supports YAML, JSON, HTML, XML, and many programming languages. Falls back to line-based merge for unsupported types. Written in Rust, GPL-3. ([mergiraf.org/introduction.html](https://mergiraf.org/introduction.html))
- Both install as custom git merge drivers via `.gitattributes` config. ([github.com/jelmer/awesome-merge-drivers](https://github.com/jelmer/awesome-merge-drivers))
- **Implication for sherpa sync:** Weave's Markdown support means structure-aware merging of markdown files is a solved problem at the git level. However, `sherpa sync` needs more than just merge conflict avoidance — it needs to track section ownership (framework vs. consumer) and apply different strategies per section. A custom merge driver could be part of the solution.

### 14. Yeoman Conflicter — Per-File Prompt, No Merge

- Yeoman's Conflicter module prompts per file: overwrite, skip, show diff, overwrite all. ([yeoman.github.io/environment/Conflicter.html](https://yeoman.github.io/environment/Conflicter.html))
- **Explicitly does not support custom merge strategies** — the team has stated this is "not something they want to consider for the future." ([github.com/yeoman/generator/issues/1001](https://github.com/yeoman/generator/issues/1001))
- Generators can implement their own merge logic programmatically (e.g., JSON deep merge) but this is per-generator, not built into the framework. ([github.com/yeoman/generator/issues/1001](https://github.com/yeoman/generator/issues/1001))
- **Implication for sherpa sync:** Yeoman's approach (per-file prompt) is the minimum viable UX, but insufficient for a good experience. Sherpa should aim for Copier-level intelligence.

### 15. Backstage Software Templates — The Unsolved Problem

- Backstage scaffolder generates projects from templates but **has no built-in mechanism for propagating template updates** to existing projects. This is a known gap (open issue since 2022). ([github.com/backstage/backstage/issues/14416](https://github.com/backstage/backstage/issues/14416), [github.com/backstage/backstage/issues/31361](https://github.com/backstage/backstage/issues/31361))
- Workaround: create "update templates" that modify existing repos instead of creating new ones. ([github.com/backstage/backstage/issues/14416](https://github.com/backstage/backstage/issues/14416))
- **Implication for sherpa sync:** Even major platforms (Backstage, used by Spotify, hundreds of companies) haven't solved this. Being good at template sync is a real differentiator.

### 16. The "Do Not Edit" / Provenance Header Convention

- Go standard: `// Code generated ... DO NOT EDIT.` — must appear as a single line before the package clause. 659K files in the Go corpus use this pattern. ([github.com/golang/go/issues/41196](https://github.com/golang/go/issues/41196))
- C#: `<auto-generated>` tag tells analyzers to skip the file. ([github.com/grpc/grpc/issues/12604](https://github.com/grpc/grpc/issues/12604))
- General pattern: header comment identifies the generator, source template, and version. Signals "don't edit this file, edit the source."
- **Implication for sherpa sync:** Convention files should include provenance headers. For fully managed files: `<!-- Generated by sherpa sync v2.3.0 — DO NOT EDIT -->`. For files with mixed ownership: section-level markers indicating which sections are framework-managed.

---

## Taxonomy of Sync Strategies

From this research, five distinct strategies emerge:

| Strategy | Examples | How It Works | Best For |
|----------|----------|-------------|----------|
| **Regenerate + Never Touch** | Expo CNG | Generate from config/plugins. Consumer never edits output. | Build artifacts, derived files |
| **Two-Way Prompt** | Rails `app:update`, Yeoman | Compare new template vs. existing file. Human decides per file. | Small config files, infrequent updates |
| **Three-Way Merge** | Copier, Cruft, nf-core | Store baseline. Diff user changes. Apply to new template. | Code and config files with consumer edits |
| **Overlay/Patch** | Kustomize, Helm | Base is immutable. Customizations are separate overlay files. | Structured config (YAML, JSON) |
| **AST/Semantic Transform** | Angular schematics, Weave | Parse structure. Apply targeted transformations. | Code migrations, structured documents |

**sherpa sync likely needs a hybrid:** Three-Way Merge for prose files (with section-level granularity), Overlay for structured config (`sherpa.config.ts`), and optional Regenerate for fully-managed files.

---

## Sources (Full URLs)

### Rails app:update
- [Using VS Code as a Rails app:update merge tool](https://davidrunger.com/blog/using-vs-code-as-a-rails-app-update-merge-tool) — Detailed walkthrough of THOR_MERGE with VS Code, revealing the two-file (not three-file) merge interface
- [Upgrading Rails apps with rake app:update](https://www.joshmcarthur.com/til/2019/07/25/upgrading-rails-apps-with-rake-appupdate.html) — Concise explanation of app:update process and interactive prompts
- [Updating Rails applications with vimdiff](https://dev.to/rodreegez/updating-rails-applications-with-vimdiff-3a75) — Alternative merge tool configuration
- [Update rails 5.2 to 6 (THOR MERGE solution included)](https://dev.to/taoliu12/update-rails-52-to-6-thor-merge-solution-included-3gbd) — Practical upgrade walkthrough
- [Rails issue #34792: Can't change the mergetool of git in generator](https://github.com/rails/rails/issues/34792) — Discussion of Thor merge tool limitations
- [Thor create_file.rb source](https://github.com/rails/thor/blob/main/lib/thor/actions/create_file.rb) — Thor's file collision handling internals

### Expo Prebuild / CNG
- [Continuous Native Generation (CNG) — Expo Documentation](https://docs.expo.dev/workflow/continuous-native-generation/) — Official docs on the CNG model
- [Introduction to config plugins — Expo Documentation](https://docs.expo.dev/config-plugins/introduction/) — Config plugin architecture overview
- [Create and use config plugins — Expo Documentation](https://docs.expo.dev/config-plugins/plugins-and-mods/) — Plugin and mod system details
- [Mods — Expo Documentation](https://docs.expo.dev/config-plugins/mods/) — Low-level mod system (withInfoPlist, withAndroidManifest)
- [Using a dangerous mod — Expo Documentation](https://docs.expo.dev/config-plugins/dangerous-mods/) — Escape hatch for direct native file modification
- [What is Continuous Native Generation and why does it matter?](https://expo.dev/blog/what-is-continuous-native-generation) — Expo blog post explaining CNG motivation
- [Expo's CNG for beginners](https://medium.com/@gabrieIa/expos-continuous-native-generation-cng-for-beginners-c9a84a849a43) — Beginner-friendly CNG explanation
- [Adopt Prebuild — Expo Documentation](https://docs.expo.dev/guides/adopting-prebuild/) — Guide for migrating existing projects to CNG
- [CNG DeepWiki](https://deepwiki.com/expo/expo/9.4-continuous-native-generation) — Detailed technical analysis
- [Config Plugins System DeepWiki](https://deepwiki.com/expo/expo/2.3-config-plugins-system) — Plugin architecture deep dive

### Angular Schematics / ng update
- [Generating code using schematics — Angular](https://angular.dev/tools/cli/schematics) — Official schematics docs
- [Authoring schematics — Angular](https://angular.dev/tools/cli/schematics-authoring) — Virtual file system (Tree), Rule, Action types
- [ng update: the setup](https://timdeschryver.dev/blog/ng-update-the-setup) — How to configure migrations.json for ng update
- [Mutate a code with Angular schematics like a boss](https://dev.to/ikatsuba/mutate-a-code-with-angular-schematics-like-a-boss-5f4c) — TypeScript AST manipulation in schematics
- [Angular CDK update schematic docs](https://github.com/angular/components/blob/main/src/cdk/schematics/ng-update/update-schematic.md) — Migration schematic implementation guide
- [Angular Control Flow Migration Schematic](https://medium.com/@rocking.ac.satyam/angular-control-flow-schematics-migration-guide-f8fb44e56b4d) — Practical migration schematic example
- [Angular Schematics for Libraries](https://www.infragistics.com/blogs/angular-schematics-for-libraries) — How library authors ship update schematics
- [Angular Schematics Deep Dive Part 1](https://dev.to/sakthicodes22/angular-schematics-deep-dive-part-1-understanding-the-architecture-46i4) — Architecture overview
- [Control Flow Migration DeepWiki](https://deepwiki.com/angular/angular/10.1-control-flow-migration-schematic) — Detailed migration schematic internals

### Create React App / Eject / Alternatives
- [How to handle react-scripts](https://blog.logrocket.com/react-scripts/) — History and decline of CRA
- [Should you eject your CRA?](https://sebhastian.com/create-react-app-eject/) — Eject trade-offs analysis
- [react-app-rewired](https://github.com/timarney/react-app-rewired) — Override CRA config without ejecting
- [Alternatives to Ejecting — CRA Docs](https://create-react-app.dev/docs/alternatives-to-ejecting/) — Official eject alternatives
- [Configuring Vite](https://vite.dev/config/) — Vite's progressive config model
- [Migrating from Vite — Next.js](https://nextjs.org/docs/app/guides/migrating/from-vite) — Next.js config philosophy

### Copier
- [Updating a project — Copier](https://copier.readthedocs.io/en/stable/updating/) — Official update docs with three-way merge details
- [Updating Projects — Copier DeepWiki](https://deepwiki.com/copier-org/copier/3.4-updating-projects) — Deep technical analysis of update algorithm
- [Comparisons — Copier](https://copier.readthedocs.io/en/stable/comparisons/) — Copier vs. Cookiecutter, Yeoman, etc.
- [Configuring a template — Copier](https://copier.readthedocs.io/en/stable/configuring/) — Template configuration options
- [Template Once, Update Everywhere](https://aiechoes.substack.com/p/template-once-update-everywhere-build-ab3) — Tutorial on Copier's update workflow
- [copier adopt issue #2486](https://github.com/copier-org/copier/issues/2486) — Proposed workflow for adopting templates in existing projects

### Cruft
- [Cruft documentation](https://cruft.github.io/cruft/) — Official docs
- [Cruft GitHub](https://github.com/cruft/cruft) — Source and README
- [Cruft vs Copier — Blenddata](https://www.blenddata.nl/en/blogs/cruft-vs-copier-automating-template-updates-at-scale) — Detailed comparison
- [Standardizing Astro projects with Cookiecutter and Cruft](https://www.astronomer.io/blog/standardizing-astro-projects-with-cookiecutter-and-cruft/) — Practical usage at scale
- [3-way merge failing on cruft update — Issue #181](https://github.com/cruft/cruft/issues/181) — Conflict handling limitations

### Kustomize / Helm / Terraform
- [Kustomize 101](https://blog.stack-labs.com/code/kustomize-101/) — Base + overlay pattern explained
- [Strategic Merge Patches in Kubernetes using Kustomize](https://www.fosstechnix.com/strategic-merge-patches-in-kubernetes-using-kustomize/) — SMP mechanics
- [Kustomize vs. Helm](https://spacelift.io/blog/kustomize-vs-helm) — Comparison of overlay vs. template approaches
- [The complete Kustomize tutorial — Glasskube](https://glasskube.dev/blog/patching-with-kustomize/) — Comprehensive patching guide
- [Values Files — Helm](https://helm.sh/docs/chart_template_guide/values_files/) — Helm's override hierarchy
- [Helm deep merge issue #3486](https://github.com/helm/helm/issues/3486) — List replacement vs. merge discussion
- [Version Constraints — Terraform](https://developer.hashicorp.com/terraform/language/expressions/version-constraints) — Semantic versioning for modules
- [Ultimate Terraform Versioning Guide](https://masterpoint.io/blog/ultimate-terraform-versioning-guide/) — Root vs. child module versioning patterns

### nf-core Template Sync
- [nf-core sync overview](https://nf-co.re/docs/tutorials/sync/overview) — TEMPLATE branch mechanism
- [nf-core pipeline sync command](https://nf-co.re/docs/nf-core-tools/pipelines/sync) — CLI reference
- [Setting up sync retrospectively](https://nf-co.re/docs/tutorials/sync/sync_retrospectively) — Adopting sync for existing pipelines
- [Fixing a broken TEMPLATE branch](https://nf-co.re/docs/tutorials/sync/fixing_broken_template_branch) — Repair procedures
- [Merging automated PRs](https://nf-co.re/docs/tutorials/sync/merging_automated_prs) — Conflict resolution workflow
- [Manual synchronisation](https://nf-co.re/docs/tutorials/sync/manual_sync) — Running sync without automation

### Scaffolders (Cookiecutter, Yeoman, Hygen, Backstage)
- [Cookiecutter alternatives — safjan.com](https://safjan.com/cookiecutter-alternatives/) — Comparison of scaffolding tools
- [Yeoman and Cookiecutter are dead; long live Copier!](https://www.recallstack.icu/en/2020/04/18/yeoman-and-cookiecutter-are-dead-long-live-copier/) — Why Copier won
- [Yeoman Conflicter API](https://yeoman.github.io/environment/Conflicter.html) — Conflicter module documentation
- [Custom conflict handlers — Yeoman issue #1001](https://github.com/yeoman/generator/issues/1001) — "Not something we want to consider"
- [Improving conflict handling — Yeoman issue #1254](https://github.com/yeoman/yeoman/issues/1254) — Community discussion
- [Beyond the Scaffold: Evolving Software Projects with Yeoman](https://hopefullysurprising.com/yeoman-continuous-scaffolding/) — Re-scaffolding patterns
- [Hygen GitHub](https://github.com/jondot/hygen) — Template-in-project scaffolder
- [Backstage Software Templates](https://backstage.io/docs/features/software-templates/) — Template system docs
- [Backstage template update issue #14416](https://github.com/backstage/backstage/issues/14416) — Feature request for update propagation
- [Backstage template update issue #31361](https://github.com/backstage/backstage/issues/31361) — Automated template propagation discussion

### Semantic Merge Drivers
- [awesome-merge-drivers](https://github.com/jelmer/awesome-merge-drivers) — Comprehensive list of git merge drivers
- [Weave — Entity-level semantic merge driver](https://github.com/Ataraxy-Labs/weave) — Tree-sitter based, supports Markdown
- [Weave documentation site](https://ataraxy-labs.github.io/weave/) — Usage and supported formats
- [Mergiraf](https://mergiraf.org/) — Syntax-aware merge driver (Rust, supports YAML)
- [Mergiraf introduction](https://mergiraf.org/introduction.html) — How it works
- [Mergiraf Hacker News discussion](https://news.ycombinator.com/item?id=42093756) — Community discussion
- [git-merge-drivers (JSON/YAML)](https://github.com/rmedaer/git-merge-drivers) — Collection of format-specific merge drivers
- [How to Write a Custom Git Merge Driver](https://www.gregmicek.com/software-coding/2020/01/13/how-to-write-a-custom-git-merge-driver/) — Tutorial
- [merge-drivers-cli](https://github.com/charpeni/merge-drivers-cli) — CLI for managing custom merge drivers

### Template Sync Tools
- [template-sync — GitHub](https://github.com/template-tools/template-sync) — PR-based template sync with format-specific merge strategies
- [@template-tools/sync-cli — npm](https://www.npmjs.com/package/@template-tools/sync-cli) — CLI package

### File Provenance
- [Go: require auto-generated DO NOT EDIT comment — Issue #41196](https://github.com/golang/go/issues/41196) — Go's standard for generated file markers
- [Kubebuilder scaffold markers](https://book.kubebuilder.io/reference/markers/scaffold) — Framework-managed injection points

---

## Raw Links (Every URL Encountered)

```
https://davidrunger.com/blog/using-vs-code-as-a-rails-app-update-merge-tool
https://dev.to/rodreegez/updating-rails-applications-with-vimdiff-3a75
https://redgreenrepeat.com/2020/07/03/how-to-upgrade-rails-app/
https://www.joshmcarthur.com/til/2019/07/25/upgrading-rails-apps-with-rake-appupdate.html
http://recursion.org/incremental-rails-upgrade
https://blog.git-init.com/the-magic-of-3-way-merge/
https://dev.to/taoliu12/update-rails-52-to-6-thor-merge-solution-included-3gbd
https://github.com/rails/rails/issues/34792
https://michaelhebblethwaite.com/posts/quick_notes_on_upgrading_rails/
https://selleo.com/blog/how-to-upgrade-to-rails-6
https://docs.expo.dev/workflow/continuous-native-generation/
https://docs.expo.dev/workflow/overview/
https://medium.com/@gabrieIa/expos-continuous-native-generation-cng-for-beginners-c9a84a849a43
https://docs.expo.dev/workflow/customizing/
https://deepwiki.com/expo/expo/9.4-continuous-native-generation
https://github.com/expo/expo/blob/main/docs/pages/workflow/continuous-native-generation.mdx
https://expo.dev/blog/what-is-continuous-native-generation
https://gitnation.com/contents/expo-prebuild-demystified
https://docs.expo.dev/guides/adopting-prebuild/
https://docs.infinite.red/ignite-cli/expo/CNG/
https://docs.expo.dev/config-plugins/introduction/
https://docs.expo.dev/config-plugins/plugins-and-mods/
https://docs.expo.dev/config-plugins/plugins/
https://docs.expo.dev/modules/config-plugin-and-native-module-tutorial/
https://docs.expo.dev/config-plugins/mods/
https://docs.expo.dev/config-plugins/dangerous-mods/
https://docs.expo.dev/config-plugins/development-for-libraries/
https://docs.expo.dev/config-plugins/development-and-debugging/
https://docs.expo.dev/workflow/prebuild/
https://deepwiki.com/expo/expo/2.3-config-plugins-system
https://geekyants.com/blog/unlocking-expos-power-a-guide-to-config-plugins-and-mods
https://www.sitepen.com/blog/doing-more-with-expo-using-custom-native-code
https://github.com/expo/expo/discussions/13417
https://github.com/angular/components/blob/main/src/cdk/schematics/ng-update/update-schematic.md
https://timdeschryver.dev/blog/ng-update-the-setup
https://dev.to/ikatsuba/mutate-a-code-with-angular-schematics-like-a-boss-5f4c
https://angular.dev/tools/cli/schematics
https://medium.com/its-tinkoff/mutate-a-code-like-a-boss-with-angular-schematics-ec3415712d5
https://dev.to/sakthicodes22/angular-schematics-deep-dive-part-1-understanding-the-architecture-46i4
https://katsuba.dev/articles/mutate-a-code-like-a-boss-with-angular-schematics
https://www.angulararchitects.io/blog/automatically-updating-angular-modules-with-schematics-and-the-cli/
https://humanitec.com/blog/update-and-insert-auto-generated-code-to-existing-typescript-html-and-json-files-with-angular-schematics-pt-1
https://github.com/manfredsteyer/schematics-modify-typescript-ast/blob/master/preview.md
https://angular.dev/tools/cli/schematics-authoring
https://rangle.io/blog/angular-schematics-for-developers-part-2
https://www.w3resource.com/angular/authoring-schematics.php
https://docs.w3cub.com/angular~10/guide/schematics-authoring.html
https://www.npmjs.com/package/@angular-devkit/schematics
https://deepwiki.com/angular/angular/10.1-control-flow-migration-schematic
https://medium.com/ngconf/modernize-your-angular-app-with-migration-schematics-afe9ed9fa69b
https://angular.dev/reference/migrations/standalone
https://medium.com/@rocking.ac.satyam/angular-control-flow-schematics-migration-guide-f8fb44e56b4d
https://www.herodevs.com/blog-posts/new-in-angular----control-flow-migration-schematic
https://angular.dev/reference/migrations/control-flow
https://github.com/angular/angular/blob/main/packages/core/schematics/ng-generate/standalone-migration/README.md
https://www.infragistics.com/blogs/angular-schematics-for-libraries
https://www.slushman.com/post/existing-react-app-to-vite/
https://blog.logrocket.com/react-scripts/
https://dev.to/henriquejensen/migrating-from-create-react-app-to-vite-a-quick-and-easy-guide-5e72
https://technology.discover.com/posts/create-react-app-alternatives
https://darekkay.com/blog/create-react-app-to-vite/
https://www.npmjs.com/package/react-app-rewired
https://create-react-app.dev/docs/alternatives-to-ejecting/
https://sebhastian.com/create-react-app-eject/
https://medium.com/@gerasimostzivras3/upgrade-your-react-app-moving-from-create-react-app-to-vite-00063e257108
https://allenhwkim.medium.com/react-scripts-to-vite-in-5-minutes-dd947aaa88b5
https://github.com/timarney/react-app-rewired
https://marmelab.com/blog/2021/07/22/cra-webpack-no-eject.html
https://vite.dev/config/
https://v2.vitejs.dev/config/
https://nextjs.org/docs/app/guides/migrating/from-vite
https://copier.readthedocs.io/en/stable/updating/
https://deepwiki.com/copier-org/copier/3.4-updating-projects
https://github.com/copier-org/copier/issues/2486
https://deepwiki.com/copier-org/copier/5.1-python-api
https://gotofritz.net/blog/2025-08-10-copier-python-template-with-uv/
https://copier.readthedocs.io/en/stable/configuring/
https://aiechoes.substack.com/p/template-once-update-everywhere-build-ab3
https://haseebmajid.dev/posts/2022-12-09-how-to-update-a-project-using-a-copier-template/
https://epics-containers.github.io/main/how-to/copier_update.html
https://github.com/orgs/copier-org/discussions/1485
https://copier.readthedocs.io/en/stable/comparisons/
https://cruft.github.io/cruft/
https://github.com/cruft/cruft
https://www.astronomer.io/blog/standardizing-astro-projects-with-cookiecutter-and-cruft/
https://john-miller.dev/posts/cookiecutter-with-cruft-for-platform-engineering/
https://medium.com/@bctello8/standardizing-dbt-projects-at-scale-with-cookiecutter-and-cruft-20acc4dc3f74
https://pypi.org/project/cruft/
https://lyz-code.github.io/blue-book/linux/cruft/
https://www.blenddata.nl/en/blogs/cruft-vs-copier-automating-template-updates-at-scale
https://github.com/copier-org/copier/issues/1517
https://github.com/cruft/cruft/issues/181
https://github.com/cruft/cruft/issues/47
https://registry.terraform.io/providers/kbst/kustomization/latest/docs/data-sources/overlay
https://github.com/kbst/terraform-provider-kustomization/blob/master/docs/data-sources/overlay.md
https://blog.stack-labs.com/code/kustomize-101/
https://spacelift.io/blog/kustomize-vs-helm
https://oneuptime.com/blog/post/2026-02-09-terraform-helm-provider-custom-values/view
https://github.com/kubernetes-sigs/kustomize/issues/4658
https://github.com/Spazzy757/helm-to-kustomize
https://github.com/kubernetes-sigs/kustomize/blob/master/examples/chart.md
https://www.fosstechnix.com/strategic-merge-patches-in-kubernetes-using-kustomize/
https://oneuptime.com/blog/post/2026-02-09-kustomize-strategic-merge-patches/view
https://elatov.github.io/2021/08/using-kustomize/
https://kubernetes.io/docs/tasks/manage-kubernetes-objects/kustomization/
https://glasskube.dev/blog/patching-with-kustomize/
https://github.com/kubernetes-sigs/kustomize/blob/master/examples/inlinePatch.md
https://github.com/kubernetes-sigs/kustomize/blob/master/examples/patchMultipleObjects.md
https://fabianlee.org/2022/04/18/kubernetes-kustomize-transformations-with-patchesstrategicmerge/
https://fluxcd.io/flux/components/kustomize/kustomizations/
https://www.tutorialpedia.org/blog/can-someone-explain-patchesstrategicmerge/
https://helm.sh/docs/chart_template_guide/values_files/
https://developer.harness.io/docs/continuous-delivery/deploy-srv-diff-platforms/kubernetes/cd-kubernetes-category/add-and-override-values-yaml-files/
https://armel.soro.io/merging-dynamic-config-data-in-helm-charts/
https://github.com/helm/helm/issues/3486
https://rm3l.org/merging-dynamic-config-data-in-helm-charts/
https://blog.howardjohn.info/posts/advanced-helm/
https://oneuptime.com/blog/post/2026-01-17-helm-override-nested-values/view
https://masterpoint.io/blog/ultimate-terraform-versioning-guide/
https://www.env0.com/blog/tutorial-how-to-manage-terraform-versioning
https://dev.to/patdevops/advanced-terraform-module-usage-versioning-nesting-and-reuse-across-environments-43j0
https://developer.hashicorp.com/terraform/language/expressions/version-constraints
https://developer.hashicorp.com/terraform/plugin/best-practices/versioning
https://developer.hashicorp.com/validated-patterns/terraform/upgrade-and-refactor-terraform-modules
https://www.cookiecutter.io/article-post/compare-cookiecutter-to-yeoman
https://www.recallstack.icu/en/2020/04/18/yeoman-and-cookiecutter-are-dead-long-live-copier/
https://www.cookiecutter.io/article-post/cookiecutter-alternatives
https://safjan.com/cookiecutter-alternatives/
https://zerokspot.com/weblog/2015/10/21/cookiecutter-and-yeoman/
https://www.saashub.com/compare-cookiecutter-vs-copier
https://copier.readthedocs.io/en/stable/comparisons/
https://www.resourcely.io/post/12-scaffolding-tools
https://www.opslevel.com/resources/cookiecutter-vs-yeoman-choosing-the-right-scaffolder-for-your-service
https://jfreeman.dev/blog/2019/04/24/cookiecutter-vs-yeoman/
https://yeoman.github.io/environment/Conflicter.html
https://github.com/yeoman/generator/issues/1001
https://github.com/suzuki-shunsuke/yeoman-merge-ui
https://github.com/yeoman/yeoman/issues/1680
https://github.com/yeoman/generator/issues/966
https://github.com/yeoman/generator/issues/426
https://github.com/yeoman/Hackathons/issues/4
https://github.com/yeoman/generator/issues/891
https://github.com/yeoman/yo/issues/599
https://github.com/yeoman/yeoman/issues/1254
https://sunnysingh.io/blog/hygen
https://github.com/jondot/hygen
https://github.com/ronp001/hygen-create
https://css-tricks.com/file-scaffolding-with-hygen/
https://hopefullysurprising.com/yeoman-continuous-scaffolding/
https://github.com/backstage/backstage/issues/31361
https://backstage.io/docs/features/software-templates/
https://roadie.io/docs/getting-started/scaffolding-components/
https://backstage.io/docs/features/software-templates/writing-templates/
https://github.com/backstage/backstage/issues/14416
https://github.com/backstage/software-templates
https://nf-co.re/docs/tutorials/sync/overview
https://nf-co.re/docs/guidelines/pipelines/requirements/use_the_template
https://github.com/nf-core/nf-co.re/blob/master/markdown/developers/sync.md
https://nf-co.re/docs/tutorials/sync/sync_retrospectively
https://nf-co.re/docs/nf-core-tools/pipelines/sync
https://nf-co.re/docs/tutorials/sync/fixing_broken_template_branch
https://nf-co.re/docs/tutorials/sync/merging_automated_prs
https://nf-co.re/docs/tutorials/sync/manual_sync
https://nf-co.re/docs/nf-core-tools/api_reference/1.13/api/sync
https://oldsite.nf-co.re/tools/docs/1.13/api/sync.html
https://github.com/template-tools/template-sync
https://www.npmjs.com/package/@template-tools/sync-cli
https://www.npmjs.com/package/@template-tools/template-sync
https://github.com/jelmer/awesome-merge-drivers
https://github.com/rmedaer/git-merge-drivers
https://github.com/Praqma/git-merge-driver
https://www.gregmicek.com/software-coding/2020/01/13/how-to-write-a-custom-git-merge-driver/
https://www.charpeni.com/blog/use-custom-merge-driver-to-simplify-git-conflicts
https://www.julianburr.de/til/custom-git-merge-drivers
https://github.com/charpeni/merge-drivers-cli
https://github.com/Ataraxy-Labs/weave
https://ataraxy-labs.github.io/weave/
https://topaiproduct.com/2026/03/04/weave-finally-makes-git-merges-understand-your-code/
https://mergiraf.org/
https://mergiraf.org/usage.html
https://mergiraf.org/introduction.html
https://codeberg.org/mergiraf/mergiraf
https://antonin.delpeuch.eu/posts/mergiraf-a-syntax-aware-merge-driver-for-git/
https://lwn.net/Articles/1042355/
https://news.ycombinator.com/item?id=42093756
https://tonyg.github.io/revctrl.org/ThreeWayMerge.html
https://en.wikipedia.org/wiki/Merge_(version_control)
https://jvns.ca/blog/2023/11/10/how-cherry-pick-and-revert-work/
https://blog.jcoglan.com/2017/05/08/merging-with-diff3/
https://git.vger.kernel.narkive.com/IgoaVKAe/patch-fall-back-to-three-way-merge-when-applying-a-patch
https://www.morphllm.com/ai-apply-patch
https://git-scm.com/docs/merge-strategies
https://git-scm.com/docs/git-rerere
https://git-scm.com/book/en/v2/Git-Tools-Rerere
https://www.kernel.org/pub/software/scm/git/docs/git-rerere.html
https://gitscripts.com/git-rerere
https://www.thisdot.co/blog/mastering-git-rerere-solving-repetitive-merge-conflicts-with-ease
https://gist.github.com/skipcloud/f1033afb4fa5681d69fa63458cc95928
https://labex.io/tutorials/git-how-to-use-git-rerere-to-resolve-merge-conflicts-effortlessly-411648
https://book.kubebuilder.io/reference/markers/scaffold
https://book.kubebuilder.io/reference/markers.html
https://github.com/kubernetes-sigs/kubebuilder/blob/master/designs/simplified-scaffolding.md
https://github.com/kubernetes-sigs/kubebuilder/issues/1487
https://github.com/kubernetes-sigs/kubebuilder/issues/1384
https://github.com/golang/go/issues/41196
https://github.com/grpc/grpc/issues/12604
https://github.com/kovetskiy/mark
https://docs.renovatebot.com/configuration-options/
https://github.com/renovatebot/renovate
https://docs.renovatebot.com/bot-comparison/
https://docs.renovatebot.com/
```

---

## Implications for Designing `sherpa sync`

### 1. Store the Baseline (Copier's Key Insight)

The single most important design decision: **store the last-synced framework template version** for every convention file. Without this, you're stuck with Rails' two-way diff (manual review every time). With it, you get Copier's three-way merge (only conflicts where both sides changed the same thing).

Implementation options:
- **Copier model:** Store a commit/version ref in a manifest file (`.sherpa-sync.yml` or in `sherpa.config.ts`). On sync, regenerate the old baseline, diff against current, apply to new.
- **nf-core model:** Maintain a hidden git branch with unmodified framework files. On sync, merge that branch. Git handles three-way merge natively.
- **Hybrid:** Store baseline files in a `.sherpa/baseline/` directory (or a content-addressable store). Simple, no git gymnastics, but uses disk space.

### 2. File Ownership Categories

Every synced file needs a declared ownership model:

| Category | Framework Updates | Consumer Edits | Sync Behavior |
|----------|------------------|----------------|---------------|
| **Managed** | Yes | No | Overwrite. Provenance header: `<!-- sherpa:managed -->` |
| **Templated** | Yes | Yes (via config) | Regenerate from `sherpa.config.ts` values. No direct editing. (Expo model) |
| **Shared** | Yes | Yes (direct) | Three-way merge. Section-level if markdown. (Copier model) |
| **Consumer-owned** | No | Yes | Never touch. `skip_if_exists` on init only. |

### 3. Section-Level Merge for Prose Files (The Novel Contribution)

No existing tool does section-level three-way merge for markdown/prose files. All tools work at file level (Copier, Cruft, nf-core) or line level (git). The section-level-prose-sync initiative is novel and valuable because:

- CLAUDE.md files have clearly delineated sections (headings, tables, lists).
- Framework may want to update "## Commands" while preserving consumer additions to "## Conventions."
- Section-level merge would reduce false conflicts where consumer added content to a section the framework also changed.
- Kubebuilder's marker pattern (`<!-- sherpa:managed:section-name -->`) could mark framework-owned sections within otherwise consumer-owned files.

### 4. Migration System (Angular's Key Insight)

Beyond template diffing, `sherpa sync` needs a **migration system** for version-specific transforms:

```typescript
// sherpa-migrations/v2.0.0.ts
export default {
  version: "2.0.0",
  before: async (project) => {
    // Rename .claude/conventions/ → .claude/rules/
  },
  after: async (project) => {
    // Update CLAUDE.md references
  }
};
```

This handles structural changes that can't be expressed as template diffs.

### 5. Progressive Customization (Vite's Key Insight)

Don't hide config. Don't require ejection. Instead:
- Ship visible, editable convention files.
- Provide `sherpa.config.ts` for declaring overrides without touching framework files.
- Use transforms/plugins for customizations that would otherwise require editing managed files.
- Keep the sync mechanism transparent and recoverable.

### 6. Format-Specific Merge Strategies (template-sync's Key Insight)

Different file types need different merge logic:
- **YAML/JSON config:** Deep merge (Helm model). Consumer overrides are layered on framework defaults.
- **Markdown prose:** Section-level three-way merge (novel). Framework sections vs. consumer sections.
- **Line-set files** (`.gitignore`, rule lists): Union merge. Each line is independent.
- **TypeScript config:** AST-level merge or regenerate-from-config (Angular model).

---

## Open Questions

1. **Baseline storage:** Should `sherpa sync` use Copier's "regenerate baseline on demand" approach, nf-core's "hidden branch" approach, or store baseline files directly? Trade-offs: disk space vs. complexity vs. git history requirements.

2. **Section ownership markers:** Should sections be marked with HTML comments (`<!-- sherpa:managed:commands -->`), YAML frontmatter properties, or inferred from heading text? HTML comments survive rendering but add visual noise. Heading inference is fragile.

3. **Conflict UX:** When section-level merge produces conflicts, what's the best UX? Inline markers (Copier), separate `.rej` files (Cruft), interactive CLI (Rails), or open-in-editor (VS Code merge)?

4. **Weave integration:** Weave already handles Markdown semantic merging via tree-sitter. Should `sherpa sync` use Weave as a custom git merge driver rather than building its own section-level merge? Or is Weave's entity model insufficient for the section-ownership concept?

5. **Transform vs. patch for shared files:** For files with mixed ownership (some sections framework-managed, others consumer-owned), is the right model (a) section-level three-way merge, or (b) treat framework sections as generated regions (Kubebuilder marker pattern) that are always overwritten?

6. **Consumer customization escape hatches:** What happens when a consumer needs to modify a framework-managed section? Should they (a) submit a PR upstream, (b) use a config plugin to transform it (Expo model), (c) "eject" that section to consumer-owned, or (d) add an override in `sherpa.config.ts`?

7. **Atomic sync vs. per-file sync:** Should `sherpa sync` be all-or-nothing (Angular's virtual file system staging pattern) or file-by-file (Rails' interactive approach)? Staging provides safety; per-file provides control.

8. **How does Copier handle prose?** All the Copier examples are code/config templates. Has anyone used it for markdown documentation files? If so, how well does the line-level three-way merge work for prose?
