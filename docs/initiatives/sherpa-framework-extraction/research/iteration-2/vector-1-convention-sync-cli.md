# Convention Sync CLI Architecture — Deep Dive

**Question:** What is the minimum viable convention sync tool architecture for distributing and updating Markdown/YAML convention files across projects?

**Context:** Iteration 1 identified convention sync as the hardest unsolved problem. npm handles code, Claude Code plugins handle executable tools, but no established mechanism handles Markdown convention distribution. The closest analog is Copier (Python template engine with three-way merge), but we need a JS/TS solution.

---

## 1. Copier's Three-Way Merge Algorithm

### How It Actually Works

Copier's `_apply_update` method (in `copier/main.py`, lines 917-1110) implements a git-native merge. The algorithm:

1. **Regenerate old template output**: Clones the template at the *old* git tag (stored in `.copier-answers.yml` as `_commit`), renders it with the user's previous answers into a temp directory. This reconstructs "what was originally generated."

2. **Render new template output**: Clones the template at the *new* git tag, renders with updated answers into a second temp directory.

3. **Compute user diff**: Uses `git diff-tree --unified=<context_lines>` between the old-generated temp dir and the user's actual project. This captures everything the user changed since generation.

4. **Apply user diff to new output**: Uses `git apply --reject` to layer the user's changes on top of the freshly-generated new template.

5. **Handle conflicts via `git merge-file`**: For any `.rej` files (rejected hunks), Copier calls `git merge-file` with three versions:
   - `-L "before updating"` — user's current file
   - `-L "last update"` — old-generated file
   - `-L "after updating"` — new-generated file

   This produces standard conflict markers (`<<<<<<<`, `=======`, `>>>>>>>`).

6. **Mark unmerged files**: Uses `git update-index` to force git to recognize files with conflict markers as unmerged (so `git status` shows them as conflicted).

### Key Data Structures

- **`.copier-answers.yml`**: YAML file tracking `_commit` (git tag of template version used), `_src_path` (template URL), plus all user questionnaire answers. This is the provenance manifest.
- **Multiple templates per project**: Copier supports separate answers files (`.copier-answers.main.yml`, `.copier-answers.pre-commit.yml`) for composing multiple templates.
- **Git infrastructure**: The entire algorithm leans on `git write-tree`, `git diff-tree`, `git apply --reject`, `git merge-file`, and `git update-index`. Copier doesn't implement its own merge — it's an orchestrator around git's merge tools.

### Conflict Modes

- `--conflict inline` (default): Produces git-style conflict markers in files, marks them as unmerged in the index.
- `--conflict rej`: Produces `.rej` files containing rejected diff hunks.
- `--context-lines N`: Controls diff context (more = more accurate but more conflicts).

### Can This Be Reimplemented in TypeScript?

**Yes, with a key simplification.** Copier needs to regenerate templates from source because templates contain Jinja2 variables. Convention files are static Markdown — no template rendering needed. This eliminates the most complex part (temp dirs, template rendering, answer replay).

Two options for the merge itself:
- **Option A: Shell out to git** (like Copier) — requires git installed, proven algorithm
- **Option B: Use `node-diff3`** — pure JS three-way merge, no git dependency

**node-diff3** (v3.2.0, MIT, https://github.com/bhousel/node-diff3) provides:
- `diff3Merge(a, o, b)` — returns alternating `ok` and `conflict` blocks
- `merge(a, o, b)` — produces conflict-marker output matching git's format
- `mergeDiff3(a, o, b)` — includes original content in conflict markers (`|||||||`)
- `diffPatch`, `patch`, `invertPatch` — two-way diff and patch application
- Inputs are string arrays (split by line) — works naturally with Markdown

For convention files (<500 lines of Markdown), `node-diff3` is the right choice. No git dependency, pure JS, actively maintained.

### Sources
- https://copier.readthedocs.io/en/stable/updating/
- https://copier.readthedocs.io/en/stable/configuring/
- https://github.com/copier-org/copier
- https://github.com/copier-org/copier/blob/v9.4.1/copier/main.py (lines 867-1110)
- https://github.com/bhousel/node-diff3
- https://github.com/google/diff-match-patch (archived, JS support)
- https://www.python.org/dev/peps/pep-0440/

---

## 2. Manifest-Based File Tracking

### Survey of Manifest Patterns

| Tool | Manifest File | What It Tracks | Format |
|------|--------------|----------------|--------|
| Copier | `.copier-answers.yml` | Template source URL, commit/tag, user answers | YAML |
| npm | `package-lock.json` | Resolved versions, integrity hashes (SHA-512), dependency tree | JSON |
| Nix | `/nix/store/<hash>-<name>-<version>` | Full input hash (source + deps + flags), immutable store paths | Filesystem paths |
| Homebrew | `INSTALL_RECEIPT.json` (Tab) | Formula version, build options, installed files, runtime deps | JSON |
| vsync | `.vsync.json` | Source tool, target tools, sync preferences | JSON |
| Docker Compose | `compose.override.yaml` | Override layers (composition tracking) | YAML |

### Key Design Lessons

- **npm's integrity hashes**: SHA-512 of package content. Enables detecting tampering and verifying expected content. Convention files need the same — hash the upstream file to detect drift.
- **Copier's answer tracking**: Storing previous answers enables regenerating the "old version" from scratch. For convention files (no template variables), storing the upstream hash is sufficient.
- **Nix's immutability**: "When adding, removing or updating a package, nothing is removed from the store; instead, symlinks are added, removed or changed in profiles." Conceptual model for convention sync: upstream files are immutable references, local overrides layer on top.

### Proposed `sherpa.manifest.json` Schema

```json
{
  "$schema": "sherpa/manifest@1",
  "frameworkVersion": "0.1.0",
  "syncedAt": "2026-03-11T14:30:00Z",
  "files": {
    ".claude/rules/behavioral-engineering.md": {
      "upstreamHash": "sha256:a1b2c3d4...",
      "localHashAtSync": "sha256:a1b2c3d4...",
      "status": "synced",
      "syncedVersion": "0.1.0",
      "syncedAt": "2026-03-11T14:30:00Z"
    },
    ".claude/rules/initiative-convention.md": {
      "upstreamHash": "sha256:e5f6g7h8...",
      "localHashAtSync": "sha256:e5f6g7h8...",
      "status": "synced",
      "syncedVersion": "0.1.0",
      "syncedAt": "2026-03-11T14:30:00Z"
    }
  }
}
```

### Status Values

| Status | Meaning | Sync Behavior |
|--------|---------|---------------|
| `synced` | `local === upstream` | Skip (no changes) |
| `modified` | User edited locally since last sync | Three-way merge if upstream also changed |
| `new` | File exists upstream but not locally | Prompt to add |
| `deleted` | File deleted locally, exists upstream | Prompt to re-add or acknowledge |
| `diverged` | Both upstream and local changed | Three-way merge required |
| `orphaned` | In manifest but removed from upstream | Prompt to keep or delete |

### Three Artifacts Per File for Merge

The manifest needs to enable three-way merge. This requires:
1. **Upstream hash at last sync** (stored in manifest)
2. **Local hash at last sync** (stored in manifest)
3. **Old upstream content** (needed for `node-diff3`'s `o` parameter)

For the old upstream content, two options:
- **Option A: Local cache** — Store in `.sherpa/cache/<hash>.md` (gitignored). Simple, no network for merge.
- **Option B: Fetch from npm** — `@sherpa/studio-conventions@<old-version>` at merge time. No local cache, but requires registry access.

**Recommendation:** Option A (local cache) for MVP. The cache contains only the files that were last synced, which for 10-30 convention files is <100KB total.

### Sources
- https://docs.npmjs.com/cli/v10/configuring-npm/package-lock-json
- https://wiki.nixos.org/wiki/Nix_package_manager
- https://copier.readthedocs.io/en/stable/configuring/
- https://github.com/nicepkg/vsync
- https://docs.docker.com/compose/how-tos/multiple-compose-files/merge/

---

## 3. Diff Presentation for Convention Files

### How Upgrade Helpers Work

All three major upgrade helpers (React Native, Backstage, Expo) follow the **rn-diff-purge** pattern:

1. For each framework version, create a fresh project from the template
2. Commit each version to a separate git branch
3. `git diff` between branches produces the structural diff
4. Present the diff in a web UI using `react-diff-view`

**React Native** (https://github.com/react-native-community/rn-diff-purge):
- Branch-per-release model
- `npx @react-native-community/cli init RnDiffApp` for each version
- Automated via `scripts/new-release.sh`
- Diffs accessible at https://react-native-community.github.io/rn-diff-purge/

**Backstage** (https://github.com/backstage/upgrade-helper-diff):
- Forked from RN approach
- Two workflow tracks: legacy diffs (raw `create-app`) and release diffs (yarn-plugin version bumps)
- Branch naming: `release/{version}`, `release/yarn-plugin/{version}`
- Web UI adds: inline comments, progress tracking ("done" buttons), batch toggle

**Expo**:
- No diff tool — uses SDK changelogs + `expo install --fix` for dependency updates
- Each SDK version has a changelog page (e.g., https://expo.dev/changelog/sdk-55)
- Manual upgrade instructions rather than automated diffs

### Terminal Diff Presentation for `sherpa sync`

For a CLI tool dealing with 10-30 Markdown files, a terminal-based approach is sufficient:

**Libraries:**
- **jsdiff** (npm `diff`, https://github.com/kpdecker/jsdiff):
  - `diffLines(oldStr, newStr)` — line-level diff, returns `{ added, removed, value }` objects
  - `createPatch(filename, oldStr, newStr)` — unified diff format
  - `applyPatch(source, patch)` — apply with fuzzy matching
  - `structuredPatch(...)` — structured hunk data for custom rendering
  - `parsePatch(diffStr)` — parse unified diff format
- **chalk** (https://github.com/chalk/chalk): Green/red terminal coloring

**Recommended UX Flow:**

```
$ sherpa sync

Checking upstream @sherpa/studio-conventions@0.2.0...

  ✓ 12 files synced (no changes)
  ↑ 2 files auto-updated (no local modifications)
  ⚡ 1 file needs review (both sides changed)
  + 1 new file available

─── behavioral-engineering.md (diverged) ───────────
@@ -15,3 +15,5 @@
 ## What to Use
 - Behavioral defaults
+- Domain context with boundaries
+- Explicit success criteria
 - Explicit fail triggers

[a]ccept upstream  [k]eep local  [m]erge  [d]iff  [e]dit
> _
```

Use `@inquirer/prompts` expand prompt type for the per-file action menu.

### Sources
- https://github.com/react-native-community/rn-diff-purge
- https://react-native-community.github.io/rn-diff-purge/
- https://react-native-community.github.io/upgrade-helper/
- https://github.com/backstage/upgrade-helper
- https://github.com/backstage/upgrade-helper-diff
- https://backstage.github.io/upgrade-helper/
- https://github.com/otakustay/react-diff-view
- https://docs.expo.dev/workflow/upgrading-expo-sdk-walkthrough/
- https://github.com/kpdecker/jsdiff
- https://github.com/chalk/chalk
- https://github.com/SBoudrias/Inquirer.js

---

## 4. The `*.local.md` Override Pattern

### Precedents for File Override Layering

The `.local` override pattern is well-established:

**Next.js `.env` loading order** (canonical reference):
1. `process.env` (runtime)
2. `.env.$(NODE_ENV).local`
3. `.env.local` (not checked when `NODE_ENV` is `test`)
4. `.env.$(NODE_ENV)`
5. `.env`

First-found wins. `.local` files are gitignored.

**Docker Compose override pattern:**
- `compose.yaml` + `compose.override.yaml` (automatic loading)
- Merging rules: single-value fields overwrite, multi-value concatenate, mappings merge by key

**dotenvx** (https://dotenvx.com/docs):
- `--convention=nextjs` follows the `.local` chain
- `--overload` flag inverts precedence

**ESLint flat config:**
- Array-based cascading — later config objects override earlier ones
- `extends` for inheritance from shared configs

### How `*.local.md` Interacts with Claude Code

Claude Code loads all `.md` files in `.claude/rules/` recursively. Per the official docs (https://code.claude.com/docs/en/memory):

- Files without `paths:` frontmatter load unconditionally at launch
- Files with `paths:` load when Claude works with matching files
- **There is no override/precedence mechanism** — all matching rules load and concatenate into context

This means `.local.md` files work as **additive extensions**, not overrides. Both `behavioral-engineering.md` and `behavioral-engineering.local.md` would load simultaneously.

**This is actually the right behavior for convention files:**
- Framework rule: states the principle ("agent roles use behavioral constraints not identity claims")
- Local rule: states the application ("our project uses these specific agent categories: ...")
- Both load. No conflict. Claude gets both principle and application.

### Proposed Convention

```
.claude/rules/
  behavioral-engineering.md        # Framework-synced (tracked in manifest)
  behavioral-engineering.local.md  # Consumer-owned (gitignored or committed per team choice)
  initiative-convention.md         # Framework-synced
  my-custom-rule.md                # Consumer-owned (not in manifest)
```

**Framework-synced files:**
- MUST contain `paths:` (or no frontmatter) — framework controls the scope
- MUST NOT be edited by the consumer (edit `.local.md` instead)
- Tracked in `sherpa.manifest.json`

**Consumer `.local.md` files:**
- SHOULD have the same `paths:` frontmatter as the base file (or broader)
- Content is additive — project-specific applications, examples, vocabulary
- Never synced, never overwritten

**Consumer-owned files:**
- Any `.md` file not in the manifest is fully consumer-owned
- The sync tool ignores them completely

### Key Insight: Separation Over Override

For prose convention files, the cleanest pattern is **separation of concerns**, not override:
- Framework rules describe principles
- Local rules apply principles to project context
- Both load into Claude's context

This avoids the complexity of merge/override semantics entirely for the common case. Three-way merge is only needed when the consumer edits a framework-synced file directly (which the convention discourages but must support).

### Sources
- https://nextjs.org/docs/app/guides/environment-variables
- https://docs.docker.com/compose/how-tos/multiple-compose-files/merge/
- https://dotenvx.com/docs
- https://eslint.org/docs/latest/use/configure/configuration-files
- https://code.claude.com/docs/en/memory

---

## 5. JS/TS Scaffolding Tool Survey

### Comparison Matrix

| Tool | Initial Scaffold | Post-Scaffold Updates | Provenance Tracking | Conflict Resolution | Language |
|------|:-:|:-:|:-:|:-:|:-:|
| **Copier** | Yes | **Yes (three-way merge)** | **Yes (`.copier-answers.yml`)** | Inline markers or `.rej` | Python |
| **Yeoman** | Yes | Partial (re-run prompts) | No | **Interactive conflicter** | JS |
| **mrm** | Yes | **Yes (codemod-based)** | No | Non-destructive by design | JS |
| **plop** | Yes | No | No | None | JS |
| **hygen** | Yes | Partial (inject action) | No | None | JS |
| **scaffdog** | Yes | No | No | None | JS |
| **degit** | Yes | No | No | None | JS |

### Detailed Findings

**Copier** (Python, https://copier.readthedocs.io/):
- Only tool with true three-way merge for updates
- Tracks provenance via `.copier-answers.yml`
- Uses git tags for template versioning (PEP 440 sorting)
- Supports multiple templates per project
- **Limitation**: Python ecosystem

**Yeoman** (JS, https://yeoman.io/):
- In-memory filesystem via `mem-fs` / `mem-fs-editor` (https://github.com/sboudrias/mem-fs-editor)
- Interactive conflicter: prompts for each file when overwriting
- Composability via `composeWith()` for sub-generators
- No provenance tracking, no three-way merge

**mrm** (JS, https://mrm.js.org/):
- Codemod approach: tasks are code that modify files programmatically
- `mrm-core` provides format-aware utilities: JSON `merge()`, YAML `merge()`, Lines `add()`/`remove()`, Markdown `addBadge()`
- Idempotent by design — re-running applies only missing changes
- Preserves formatting (reads EditorConfig)
- Best for config files, not long-form Markdown
- No provenance tracking

**plop** (JS, https://plopjs.com/):
- Micro-generator: Inquirer prompts + Handlebars templates
- `add` and `modify` actions, but no update lifecycle
- Stateless

**hygen** (JS, https://hygen.io/):
- Folder-structure-as-CLI-commands
- `inject: true` with `before`/`after`/`prepend`/`append` positioning
- `skip_if` guard prevents duplicate injections
- No provenance

**scaffdog** (JS, https://scaff.dog/):
- Markdown-driven templates (templates are `.md` files)
- No update or provenance support

**degit** (JS, https://github.com/Rich-Harris/degit):
- Pure download (no git history), fastest scaffolding
- Supports GitHub, GitLab, BitBucket, Sourcehut
- No update mechanism

### The Gap

**No JS/TS tool combines scaffolding + provenance tracking + three-way-merge updates.** Copier (Python) is the only tool that does all three. The JS ecosystem has mature building blocks but no one has assembled them:
- `node-diff3` for three-way merge
- `jsdiff` for diff computation and patch application
- `@inquirer/prompts` for interactive conflict resolution
- `chalk` for terminal presentation

---

## Synthesis: Minimum Viable `sherpa sync` Architecture

### The Algorithm

```
sherpa sync
  1. Read sherpa.manifest.json (or create if first run)
  2. Resolve upstream: read @sherpa/studio-conventions package files
  3. For each upstream convention file:
     a. Compute current upstream hash
     b. Look up manifest entry
     c. Determine status:
        - No manifest entry → "new" (file available upstream, not yet synced)
        - Upstream unchanged since last sync:
          - Local unchanged → "synced" (skip)
          - Local changed → "locally-modified" (skip — user intentionally changed it)
        - Upstream changed since last sync:
          - Local unchanged → "upstream-updated" (auto-accept safe)
          - Local changed → "diverged" (three-way merge needed)
     d. Check for orphaned files (in manifest but removed from upstream)
  4. Present summary: N synced, N auto-updated, N need review, N new
  5. For auto-updated files: overwrite local with upstream, update manifest
  6. For diverged files: three-way merge via node-diff3, present conflicts
  7. For new files: prompt to accept
  8. Update sherpa.manifest.json and .sherpa/cache/
```

### Dependencies

| Package | Purpose | npm |
|---------|---------|-----|
| `node-diff3` | Three-way merge | https://www.npmjs.com/package/node-diff3 |
| `diff` (jsdiff) | Line-level diffs, unified patch format | https://www.npmjs.com/package/diff |
| `@inquirer/prompts` | Interactive CLI prompts | https://www.npmjs.com/package/@inquirer/prompts |
| `chalk` | Terminal coloring for diffs | https://www.npmjs.com/package/chalk |

### File Layout

```
consumer-project/
├── .claude/rules/
│   ├── behavioral-engineering.md        # Framework-synced
│   ├── behavioral-engineering.local.md  # Consumer-owned
│   ├── initiative-convention.md         # Framework-synced
│   └── my-custom-rule.md               # Consumer-owned (not tracked)
├── .sherpa/
│   ├── cache/                           # Old upstream content (gitignored)
│   └── manifest.json                    # Provenance tracking (committed)
├── docs/agents/roles/                   # Framework-synced role files
└── sherpa.config.ts                     # Config-as-code entrypoint
```

### What Gets Committed vs Gitignored

```gitignore
.sherpa/cache/
.claude/rules/*.local.md   # Optional — teams may choose to commit these
```

### MVP Scope (1 session)

1. `sherpa sync` command — core sync loop (status detection, diff, prompt, merge)
2. `sherpa.manifest.json` schema — provenance tracking with hash pairs
3. Interactive terminal UX (summary → per-file prompts → merge)
4. `node-diff3` integration for three-way merge on diverged files
5. `.sherpa/cache/` for old upstream content storage

### Deferred

- `sherpa init` — initial scaffold (just copy files + create manifest)
- `sherpa diff` — show pending changes without applying
- Web-based upgrade helper (rn-diff-purge pattern)
- Selective file sync (opt-in/opt-out per file)
- Breaking change detection (file renames, restructured frontmatter)
- Multi-tool output (AGENTS.md generation from .claude/rules/)

---

## Key Discoveries

- **Copier's algorithm is git-native, not a custom merge**: It shells out to `git diff-tree`, `git apply --reject`, and `git merge-file`. This validates using `node-diff3` as the JS equivalent — same algorithm, no git dependency.

- **Convention files simplify Copier's hardest step**: Copier must regenerate old templates (temp dirs, Jinja2 rendering, answer replay) because templates are parameterized. Convention files are static Markdown — we just store the old upstream content in a cache, eliminating the most complex part.

- **The manifest needs old content, not just hashes**: Hashes detect drift, but three-way merge needs the actual old upstream text as the common ancestor. Local cache (`.sherpa/cache/`) is simplest for MVP.

- **Convention files are additive in Claude Code, not overridable**: Claude Code loads all matching `.claude/rules/*.md` files and concatenates them into context. `.local.md` files work as extensions, not replacements. This is actually the right model for conventions.

- **No JS/TS tool does scaffolding + provenance + three-way merge**: Genuine ecosystem gap. Copier (Python) is the only complete solution. The building blocks exist in JS (`node-diff3`, `jsdiff`, `@inquirer/prompts`) but nobody has assembled them.

- **The upgrade helper pattern is overkill for convention files**: rn-diff-purge is designed for hundreds of project template files. Convention sync deals with 10-30 Markdown files. Terminal-based interactive diff is sufficient.

- **vsync solves an adjacent problem**: AI tool config sync across Claude Code, Cursor, etc. — format translation, not content evolution. Different problem, but the `.vsync.json` manifest pattern is a useful reference.

- **mrm's codemod philosophy is relevant for structured files but not prose**: `mrm-core`'s JSON/YAML merge works for config files. Convention files need text-level three-way merge, not structural merge.

- **Claude Code renamed `globs:` to `paths:` in frontmatter**: The current documentation uses `paths:` with glob patterns. Existing WavePoint files still use `globs:` — both likely work, but new files should use `paths:`.

---

## All Sources

### Copier (Three-Way Merge)
- https://copier.readthedocs.io/en/stable/updating/
- https://copier.readthedocs.io/en/stable/configuring/
- https://copier.readthedocs.io/en/stable/reference/api/
- https://github.com/copier-org/copier
- https://github.com/copier-org/copier/blob/v9.4.1/copier/main.py

### Three-Way Merge Libraries
- https://github.com/bhousel/node-diff3
- https://github.com/google/diff-match-patch
- https://github.com/google/diff-match-patch/wiki
- https://github.com/google/diff-match-patch/wiki/API
- https://github.com/kpdecker/jsdiff
- https://git-scm.com/docs/git-merge-file
- https://git-scm.com/book/en/v2/Git-Tools-Advanced-Merging

### Upgrade Helpers
- https://github.com/react-native-community/rn-diff-purge
- https://react-native-community.github.io/rn-diff-purge/
- https://react-native-community.github.io/upgrade-helper/
- https://github.com/backstage/upgrade-helper
- https://github.com/backstage/upgrade-helper-diff
- https://backstage.github.io/upgrade-helper/
- https://github.com/otakustay/react-diff-view
- https://docs.expo.dev/workflow/upgrading-expo-sdk-walkthrough/
- https://expo.dev/changelog/sdk-55
- https://expo.dev/changelog/sdk-54
- https://expo.dev/changelog/sdk-53

### Scaffolding Tools
- https://copier.readthedocs.io/
- https://yeoman.io/
- https://yeoman.io/authoring/file-system
- https://yeoman.io/authoring/composability
- https://github.com/sboudrias/mem-fs-editor
- https://github.com/sboudrias/mem-fs
- https://mrm.js.org/
- https://mrm.js.org/docs/mrm-core
- https://mrm.js.org/docs/getting-started
- https://mrm.js.org/docs/making-tasks
- https://github.com/sapegin/mrm
- https://plopjs.com/documentation/
- https://github.com/plopjs/plop
- https://www.npmjs.com/package/plop
- https://hygen.io/
- https://hygen.io/docs/quick-start
- https://hygen.io/docs/templates
- https://hygen.io/docs/generators
- https://hygen.io/docs/packages
- https://github.com/jondot/hygen
- https://scaff.dog/
- https://github.com/scaffdog/scaffdog
- https://github.com/Rich-Harris/degit

### Manifest / Provenance Patterns
- https://docs.npmjs.com/cli/v10/configuring-npm/package-lock-json
- https://wiki.nixos.org/wiki/Nix_package_manager
- https://github.com/nicepkg/vsync
- https://vsync.xiaominglab.com
- https://github.com/hashicorp/go-getter

### Override / Layering Patterns
- https://nextjs.org/docs/app/guides/environment-variables
- https://docs.docker.com/compose/how-tos/multiple-compose-files/merge/
- https://dotenvx.com/docs
- https://eslint.org/docs/latest/use/configure/configuration-files
- https://code.claude.com/docs/en/memory

### Terminal UX
- https://github.com/chalk/chalk
- https://github.com/SBoudrias/Inquirer.js
- https://www.npmjs.com/package/@inquirer/prompts

### Related Tools
- https://github.com/topics/config-sync
- https://github.com/nicepkg/vsync
- https://github.com/facebook/codemod
- https://www.python.org/dev/peps/pep-0440/
- https://stackoverflow.com/questions/77391627/
- https://git-scm.com/docs/git-update-index#_using_index_info
- https://pre-commit.com/

## Raw Links

```
https://copier.readthedocs.io/en/stable/updating/
https://copier.readthedocs.io/en/stable/configuring/
https://copier.readthedocs.io/en/stable/reference/api/
https://github.com/copier-org/copier
https://github.com/copier-org/copier/blob/v9.4.1/copier/main.py
https://github.com/bhousel/node-diff3
https://github.com/google/diff-match-patch
https://github.com/google/diff-match-patch/wiki
https://github.com/google/diff-match-patch/wiki/API
https://github.com/kpdecker/jsdiff
https://git-scm.com/docs/git-merge-file
https://git-scm.com/book/en/v2/Git-Tools-Advanced-Merging
https://github.com/react-native-community/rn-diff-purge
https://react-native-community.github.io/rn-diff-purge/
https://react-native-community.github.io/upgrade-helper/
https://github.com/backstage/upgrade-helper
https://github.com/backstage/upgrade-helper-diff
https://backstage.github.io/upgrade-helper/
https://github.com/otakustay/react-diff-view
https://docs.expo.dev/workflow/upgrading-expo-sdk-walkthrough/
https://expo.dev/changelog/sdk-55
https://expo.dev/changelog/sdk-54
https://expo.dev/changelog/sdk-53
https://copier.readthedocs.io/
https://yeoman.io/
https://yeoman.io/authoring/file-system
https://yeoman.io/authoring/composability
https://github.com/sboudrias/mem-fs-editor
https://github.com/sboudrias/mem-fs
https://mrm.js.org/
https://mrm.js.org/docs/mrm-core
https://mrm.js.org/docs/getting-started
https://mrm.js.org/docs/making-tasks
https://github.com/sapegin/mrm
https://plopjs.com/documentation/
https://github.com/plopjs/plop
https://www.npmjs.com/package/plop
https://hygen.io/
https://hygen.io/docs/quick-start
https://hygen.io/docs/templates
https://hygen.io/docs/generators
https://hygen.io/docs/packages
https://github.com/jondot/hygen
https://scaff.dog/
https://github.com/scaffdog/scaffdog
https://github.com/Rich-Harris/degit
https://docs.npmjs.com/cli/v10/configuring-npm/package-lock-json
https://wiki.nixos.org/wiki/Nix_package_manager
https://github.com/nicepkg/vsync
https://vsync.xiaominglab.com
https://github.com/hashicorp/go-getter
https://nextjs.org/docs/app/guides/environment-variables
https://docs.docker.com/compose/how-tos/multiple-compose-files/merge/
https://dotenvx.com/docs
https://eslint.org/docs/latest/use/configure/configuration-files
https://code.claude.com/docs/en/memory
https://code.claude.com/docs/en/settings
https://github.com/chalk/chalk
https://github.com/SBoudrias/Inquirer.js
https://www.npmjs.com/package/@inquirer/prompts
https://github.com/topics/config-sync
https://github.com/facebook/codemod
https://www.python.org/dev/peps/pep-0440/
https://stackoverflow.com/questions/77391627/
https://git-scm.com/docs/git-update-index#_using_index_info
https://pre-commit.com/
```

---

## Open Questions for Next Iteration

1. **Upstream packaging**: Should convention files ship as a separate npm package (`@sherpa/studio-conventions`) or as a directory inside `@sherpa/studio-core`? Separate enables independent versioning; embedded requires coordinated releases.

2. **Selective sync**: Can a consumer opt into only some convention files? The manifest could support an `ignored: true` field per file, but this complicates the "new file available" detection.

3. **Breaking change detection**: How does the sync tool detect breaking upstream changes (renamed files, restructured frontmatter)? Should the manifest track file renames?

4. **Multi-tool compatibility**: If a consumer uses AGENTS.md (cross-tool) instead of `.claude/rules/` (Claude-specific), should `sherpa sync` generate both? Or is that a separate concern?

5. **Version pinning**: Should the manifest pin to a specific framework version or always sync to latest? Pinning enables reproducible state; latest enables continuous updates.

6. **First-run experience**: What happens when running `sherpa sync` for the first time with no manifest? Should it detect existing convention files, hash them, and create a baseline manifest?
